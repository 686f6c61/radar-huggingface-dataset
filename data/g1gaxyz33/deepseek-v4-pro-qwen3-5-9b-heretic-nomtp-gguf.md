# g1gaxyz33/DeepSeek-V4-Pro-Qwen3.5-9B-heretic-noMTP-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-heretic-noMTP-GGUF es una redistribucion en formato GGUF de un fine-tune de Qwen3.5 de 9B, publicada por el usuario g1gaxyz33. A pesar del nombre comercial, la arquitectura real es Qwen3.5 (`qwen35`), no DeepSeek: el modelo deriva de `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` y llega aqui a traves de una cuantizacion intermedia de mradermacher (`i1-Q6_K`). El autor original aplico tecnicas de "abliteration" (eliminacion de rechazos) y "heretic" para reducir el comportamiento de negativa a responder, dando lugar a un modelo conversacional sin censura.

La relevancia de esta publicacion concreta no esta en el modelo en si, sino en la correccion de un fallo de carga. El GGUF original declaraba 33 bloques e incluia una capa de prediccion multi-token (MTP/NextN) en sus metadatos, pero el archivo no contenia los tensores `blk.32.*` ni `nextn`, lo que provocaba un `GGML_ASSERT` al cargarlo en llama.cpp y LM Studio recientes. Esta version modifica unicamente la cabecera GGUF (reduce `block_count` a 32 y `nextn_predict_layers` a 0) manteniendo los datos de los tensores byte a byte identicos.

El resultado es un modelo de 8.953.803.264 parametros (unos 8,95B), cuantizado en `i1-Q6_K` con un peso de 7,36 GB, licencia Apache-2.0 y soporte declarado para ingles, chino, coreano, japones, espanol y ruso. Es util para quien quiera ejecutar localmente un fine-tune Qwen3.5 de 9B sin censura en llama.cpp o LM Studio, a costa de renunciar a la decodificacion especulativa basada en MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen35`), transformer con capas de atencion recurrente (declaradas en metadatos) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q6_K (unico archivo publicado) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `DeepSeek-V4-Pro-Qwen3.5-9B-heretic-noMTP.i1-Q6_K.gguf`, 7,36 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3.5 (`qwen35`) segun los metadatos del GGUF, con un total de 32 bloques tras la correccion de cabecera. Los metadatos originales declaraban ademas una capa de prediccion multi-token (MTP/NextN) y una lista de 33 capas de atencion recurrente, pero los tensores correspondientes nunca estuvieron presentes en el archivo. Esta version elimina esas declaraciones para que el modelo cargue correctamente en llama.cpp y LM Studio.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineacion. El modelo base fue sometido a un proceso de "abliteration" y refinamiento "heretic" para eliminar los rechazos de respuesta (uncensored). La cuantizacion `i1` es una variante de cuantizacion con matriz de importancia (imatrix) realizada por mradermacher. La unica modificacion introducida por g1gaxyz33 es de cabecera: `qwen35.block_count` de 33 a 32, `qwen35.nextn_predict_layers` de 1 a 0 y el recorte de la ultima entrada de `qwen35.attention.recurrent_layers`. Los datos de los tensores son identicos byte a byte al original, por lo que la calidad de salida no cambia; simplemente no es posible usar decodificacion especulativa basada en MTP con este archivo.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, coreano, japones, espanol y ruso.
- Comportamiento "uncensored": el proceso de abliteration reduce los rechazos a peticiones que el modelo base rechazaria.
- Razonamiento y generacion de codigo heredados del fine-tune Qwen3.5 de 9B (sin datos especificos de evaluacion disponibles).
- Compatible con llama.cpp y LM Studio (probado con runtime CUDA 2.73.0).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Decodificacion especulativa MTP: no soportada en este archivo (eliminada de la cabecera).

## Casos de uso

- Ejecucion local en estaciones de trabajo: el archivo i1-Q6_K de 7,36 GB se carga en LM Studio o llama.cpp con GPU consumer de gama alta, permitiendo conversacion offline sin dependencia de API.
- Prototipado de asistentes conversacionales multilingues: cubre seis idiomas declarados (en, zh, ko, ja, es, ru) en un unico modelo, util para pruebas de UX en varios mercados.
- Investigacion sobre alineacion y abliteration: permite comparar el comportamiento del modelo heretic frente al Qwen3.5 original en tareas de rechazo, utilidad y seguridad.
- Generacion de texto creativo sin restricciones editoriales: el caracter uncensored lo hace adecuado para experimentacion literaria o de guiones donde el modelo base filtraria contenido.
- Evaluacion de cuantizaciones: al ser un i1-Q6_K con cabecera corregida, sirve como referencia para medir el impacto de la cuantizacion frente a pesos safetensors originales.
- Base para fine-tunes posteriores: al estar en GGUF y con licencia Apache-2.0, puede servir de punto de partida para experimentos de destilacion o ajuste con LoRA en entornos locales.
- Pruebas de compatibilidad de runtimes: util para validar la carga de modelos Qwen3.5 en versiones recientes de llama.cpp tras el fallo de `GGML_ASSERT` documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,4 GB solo para los pesos en Q6_K, mas overhead de contexto KV; en la practica se recomienda al menos 9-10 GB de VRAM para contexto moderado.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090, A100 o H100 para maxima velocidad; tambien valido en GPUs con 12 GB o mas.
- Cabe en GPU consumer: si, en tarjetas con 10-12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con menos VRAM habria que recurrir a offload parcial a CPU.
- Opciones de despliegue: llama.cpp y LM Studio (probado con runtime CUDA 2.73.0). vLLM y TGI no estan confirmados para este formato GGUF concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: al no incluir capa MTP funcional, no se puede aprovechar decodificacion especulativa para acelerar la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-heretic-noMTP (este) | ~8,95B | no disponible | GGUF i1-Q6_K | Apache-2.0 | Cabecera corregida, sin MTP |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~8,95B | no disponible | safetensors | Apache-2.0 | Modelo base heretic original |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF | ~8,95B | no disponible | GGUF i1 | Apache-2.0 | Cuantizacion original con fallo de carga en llama.cpp reciente |
| Qwen3.5 9B (modelo base) | ~9B | no disponible | safetensors | no disponible | Modelo sin abliteration, con rechazos estandar |

## Limitaciones y advertencias

- El nombre incluye "DeepSeek-V4-Pro" pero la arquitectura es Qwen3.5; no debe confundirse con un modelo DeepSeek real.
- Modelo "uncensored"/"abliterated": puede generar contenido que los modelos alineados rechazarian; requiere filtros y supervision en produccion.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks.
- Sin soporte de decodificacion especulativa MTP en este archivo; el rendimiento sera inferior al de una version con MTP funcional.
- No hay informacion sobre longitud de contexto efectiva, tool calling ni capacidades de agente; no asumir su disponibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- Licencia Apache-2.0 heredada, pero al tratarse de una redistribucion modificada conviene revisar las model cards de los modelos base para terminos y avisos de uso.
- El proceso de abliteration puede degradar capacidades de razonamiento y coherencia respecto al Qwen3.5 original; no hay datos que lo confirmen o descarten.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/g1gaxyz33/DeepSeek-V4-Pro-Qwen3.5-9B-heretic-noMTP-GGUF
- Modelo base (GGUF i1): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
