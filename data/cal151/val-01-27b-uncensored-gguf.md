# cal151/val-01-27B-Uncensored-GGUF

## Resumen

`cal151/val-01-27B-Uncensored-GGUF` es una publicacion de pesos en formato GGUF alojada en HuggingFace por el usuario `cal151`. Por el nombre se deduce que se trata de una cuantizacion GGUF de un modelo de aproximadamente 27.000 millones de parametros, etiquetado como "Uncensored", lo que habitualmente indica un ajuste fino orientado a reducir los rechazos y filtros de seguridad del modelo base. La model card publicada es practicamente vacia: solo contiene la declaracion de licencia Apache 2.0, sin descripcion, sin arquitectura declarada, sin datos de entrenamiento ni resultados de evaluacion.

El repositorio no presenta descargas ni "likes" en el momento de la consulta, fue creado y actualizado en la misma marca temporal (2026-11-05T04:48:58Z) y no declara idiomas soportados ni pipeline. Esto es coherente con una publicacion reciente, no validada por la comunidad y sin documentacion tecnica asociada.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: sirve para inventariar el artefacto y advertir de que cualquier uso en produccion requeriria una evaluacion propia, dado que no existe informacion verificable sobre el modelo base, el proceso de cuantizacion ni el ajuste realizado. Todos los datos que no aparecen en la informacion proporcionada se marcan explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre, se infiere un transformer de ~27B; no confirmado) |
| Parametros totales | ~27B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos Q4_K_M, Q5_K_M, Q8_0, etc. no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No hay informacion en la model card sobre la arquitectura del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO o ajuste supervisado. El sufijo "Uncensored" sugiere un fine-tuning destinado a eliminar o atenuar las capas de rechazo del modelo original, pero no se especifica la metodologia (por ejemplo, abliteration, DPO con pares de preferencia o SFT sobre datos sin filtro).

Tampoco se documenta el proceso de cuantizacion: se desconoce la herramienta empleada (llama.cpp, `convert_hf_to_gguf.py`, etc.), los niveles de cuantizacion publicados y si se conservan metadatos como la plantilla de chat o los tokens especiales. Sin esa informacion, la reproducibilidad del artefacto es nula y cualquier afirmacion sobre su comportamiento debe tratarse como hipotesis.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable en cualquier modelo de ~27B, aunque no verificada en este artefacto concreto.
- Razonamiento y conocimiento general: no disponible; no hay evaluaciones publicadas.
- Generacion de codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible; depende del modelo base y de la plantilla de chat, que no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Modo "thinking", vision o audio: no disponible; no se menciona ninguna capacidad multimodal.
- Efecto del ajuste "Uncensored": se espera una menor tasa de rechazos ante peticiones que el modelo base filtraria, pero no hay evidencia publicada que lo cuantifique.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el artefacto puede servir para estudiar como varia la tasa de rechazo y la calidad de respuesta tras un ajuste "uncensored", comparando contra el modelo base si se identifica.
- Experimentacion local con llama.cpp u Ollama: al estar en GGUF, permite desplegar un modelo de ~27B en estaciones de trabajo con GPU consumer, siempre que la cuantizacion elegida quepa en VRAM.
- Generacion creativa sin filtros editoriales: escritura de ficcion, guiones o dialogos donde el modelo base introduciria advertencias; requiere revision humana por la ausencia de garantias de calidad.
- Pruebas de robustez y red teaming: evaluar la eficacia de los filtros de un pipeline propio frente a un modelo deliberadamente menos restrictivo.
- Benchmarking de cuantizaciones: comparar la degradacion de perplejidad y calidad entre niveles GGUF de un mismo modelo de ~27B, si el autor publica varios.
- Prototipado de asistentes conversacionales offline: uso en entornos sin conectividad, con la advertencia de que la ausencia de model card impide conocer la plantilla de chat correcta y el contexto maximo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~27B en GGUF, una cuantizacion Q4_K_M ocuparia del orden de 15-17 GB de pesos, mas overhead de contexto KV; Q8_0 se situaria en torno a 27-29 GB. Estas cifras son estimaciones por tamano y no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, un modelo de ~27B en Q4 encajaria en GPUs de 24 GB (RTX 3090, RTX 4090) con contexto moderado; en Q8 requeriria 32 GB o mas (A100 40 GB, H100, o configuraciones multi-GPU).
- Cabe en GPU consumer: previsiblemente si en RTX 3090/4090 con cuantizaciones de 4-5 bits; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI requeririan conversion a safetensors y no estan documentados para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| cal151/val-01-27B-Uncensored-GGUF | ~27B (inferido) | no disponible | Apache 2.0 | GGUF | HuggingFace, sin descargas |
| Gemma 2 27B (referencia de tamano) | 27B | 8K | Gemma Terms | safetensors, GGUF | Amplia, con model card |
| Qwen2.5 32B (referencia de tamano) | 32B | 128K | Apache 2.0 | safetensors, GGUF | Amplia, con model card |
| Mistral Small 24B (referencia de tamano) | 24B | 32K | Apache 2.0 | safetensors, GGUF | Amplia, con model card |

La comparativa es puramente dimensional: no existen datos de rendimiento de este artefacto que permitan una comparacion cualitativa con esos modelos.

## Limitaciones y advertencias

- Model card practicamente vacia: sin arquitectura, contexto, idiomas ni plantilla de chat documentados; el uso en produccion exigiria ingenieria inversa del tokenizador y validacion propia.
- Origen del modelo base desconocido: no se indica que modelo se cuantizo ni que ajuste "uncensored" se aplico, lo que impide auditar sesgos, datos de entrenamiento o cumplimiento.
- Riesgo de alucinacion: no evaluado; sin benchmarks no puede acotarse.
- Sesgos conocidos: no documentados; un ajuste "uncensored" puede ampliar la exposicion a contenido toxico, sesgado o legalmente problematico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza que los pesos derivados del modelo base respeten las condiciones de este; conviene verificar la cadena de licencias.
- Sin validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de que el artefacto funcione correctamente.
- Fecha de creacion futura respecto a la mayoria de referencias del ecosistema, lo que puede indicar metadatos anomalos.
- Ausencia de garantias: no hay informacion sobre integridad de los ficheros GGUF, checksums ni versiones de llama.cpp compatibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cal151/val-01-27B-Uncensored-GGUF
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
