# jasonjimnz/MiniCPM5-2B-Base_boe_legal_pre_alpha_4

## Resumen

MiniCPM5-2B-Base_boe_legal_pre_alpha_4 es un modelo de lenguaje de 2.516.756.480 parámetros (≈2,52B) publicado en Hugging Face por el usuario jasonjimnz. Se distribuye únicamente en formato GGUF, convertido con Unsloth, con tres ficheros (F16, Q4_K_M y Q8_0), lo que lo sitúa en la categoría de modelos pequeños orientados a inferencia local con llama.cpp. El propio identificador sugiere un ajuste fino sobre el dominio legal espanol (BOE, Boletin Oficial del Estado) en una fase "pre_alpha", aunque la model card no confirma ni documenta ese proceso.

La ficha de Hugging Face no declara pipeline, licencia ni idiomas, y a fecha de consulta acumula 0 descargas y 0 likes, lo que indica que es un artefacto en una fase muy temprana de publicación y sin validación por parte de la comunidad. Tampoco se especifica la longitud de contexto, la composición de los datos de entrenamiento ni los resultados de evaluación.

Su relevancia práctica es acotada pero clara: para desarrolladores que necesiten un modelo de ~2,5B ejecutable en hardware de consumo y potencialmente especializado en texto legal en castellano, este repositorio ofrece pesos ya convertidos a GGUF listos para llama.cpp. No obstante, la ausencia de licencia explícita y de benchmarks obliga a tratar el modelo con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la detalla; las etiquetas "llama" y "llama.cpp" describen el formato de pesos y el motor de inferencia, no necesariamente la arquitectura) |
| Parametros totales | 2.516.756.480 (≈2,52B), dato real de los safetensors |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (el identificador sugiere castellano legal, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tres ficheros); tamano total del repositorio 9,3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura en la informacion proporcionada. La model card se limita a indicar que el modelo se convirtio a GGUF mediante Unsloth y a listar los tres ficheros resultantes. Por el nombre del repositorio cabe inferir que deriva de un modelo base MiniCPM5-2B-Base al que se ha aplicado un ajuste posterior sobre corpus legal del BOE, pero no se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras.

Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas. La unica informacion operativa fiable es la del proceso de conversion: Unsloth genero los pesos F16 a partir de los pesos originales, y de ahi se derivaron las cuantizaciones Q8_0 y Q4_K_M. El estado "pre_alpha" del identificador indica que el ajuste no se considera terminado ni validado por el autor.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio sugiere un uso orientado a dialogo, aunque no se especifica el formato de prompt ni la plantilla de chat.
- Procesamiento de texto potencialmente especializado en dominio legal espanol, segun se deduce del identificador "boe_legal", sin confirmacion en la model card.
- Ejecucion local mediante llama.cpp: la model card documenta el uso con `llama-cli` y `llama-mtmd-cli`.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a traves de infraestructura compatible con la API de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades multimodales: no confirmadas. La mencion a `llama-mtmd-cli` en la model card es una plantilla generica de Unsloth para modelos multimodales, no una evidencia de que este modelo lo sea.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Consulta de normativa espanola en local: desplegar el modelo con llama.cpp u Ollama sobre una maquina sin GPU dedicada para responder preguntas sobre textos legales, manteniendo los documentos dentro de la infraestructura propia. Adecuado por su tamano reducido y su supuesta especializacion en el BOE.
- Clasificacion y etiquetado de documentos oficiales: usar los pesos Q8_0 para categorizar disposiciones, resoluciones o anuncios por materia, organo emisor o tipo de norma, en un pipeline batch ejecutado en CPU.
- Resumen extractivo de publicaciones largas: dividir el texto del BOE en fragmentos y generar resumenes por seccion con la cuantizacion Q4_K_M, que reduce el consumo de memoria a alrededor de 1,5 GB de pesos.
- Extraccion de entidades legales: identificar referencias normativas, fechas, organismos y articulos citados para alimentar un indice de busqueda interno.
- Prototipado rapido de asistentes juridicos: emplear el modelo como base en una fase de pruebas antes de escalar a un modelo mayor, aprovechando que ya esta en GGUF y no requiere conversion adicional.
- Asistencia a la redaccion de borradores administrativos: generar primeras versiones de textos con terminologia juridico-administrativa, siempre con revision humana obligatoria por el riesgo de alucinacion.
- Fine-tuning posterior sobre corpus propio: los pesos F16 permiten continuar el ajuste con Unsloth o frameworks compatibles antes de volver a cuantizar.
- Inferencia en el borde o en equipos de campo: ejecucion en portatiles o mini-PC con 8-16 GB de RAM para tareas de consulta sin conexion.

Estos casos son hipotesis de uso razonables a partir de las caracteristicas declaradas; no estan validados por el autor ni por evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo.

## Requisitos de hardware

- VRAM/RAM estimada para los pesos (calculo derivado del numero de parametros, sin contar cache KV ni overhead del runtime):
  - F16: aproximadamente 5,0 GB de pesos; con contexto moderado, del orden de 6-7 GB en total.
  - Q8_0: aproximadamente 2,7 GB de pesos; del orden de 3,5-4 GB en total.
  - Q4_K_M: aproximadamente 1,5-1,6 GB de pesos; del orden de 2-2,5 GB en total.
- El tamano de la cache KV no se puede estimar con precision porque se desconoce la longitud de contexto y el numero de capas y cabezas de atencion.
- GPU recomendadas: no requiere aceleradores de datacenter. Cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4_K_M y Q8_0; una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 pueden ejecutar incluso los pesos F16 con contexto amplio. El uso de A100 o H100 no aporta ventaja para este tamano.
- Cabe en GPU de consumo: si, en la practica totalidad de las GPU con 4 GB o mas de VRAM, y tambien en CPU sola o en equipos con memoria unificada (Apple Silicon, iGPU recientes).
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), Ollama, LM Studio, y servidores compatibles con GGUF. La etiqueta "endpoints_compatible" apunta a despliegue en infraestructura de Hugging Face.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de pesos | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| MiniCPM5-2B-Base_boe_legal_pre_alpha_4 | ≈2,52B | no disponible | GGUF | no disponible | no disponible (sin benchmarks publicados) |
| Qwen2.5-3B | ≈3,09B | 32.768 tokens (ampliable con YaRN) | safetensors, GGUF, entre otros | Apache 2.0 | no comparable con este modelo por ausencia de datos |
| Llama 3.2 3B | ≈3,21B | 128.000 tokens | safetensors, GGUF, entre otros | Llama 3.2 Community License | no comparable con este modelo por ausencia de datos |
| Gemma 2 2B | ≈2,61B | 8.192 tokens | safetensors, GGUF, entre otros | Gemma Terms of Use | no comparable con este modelo por ausencia de datos |

Los datos de los modelos alternativos corresponden a su documentacion publica y se incluyen como referencia de categoria. La comparacion de rendimiento no puede realizarse porque el modelo objeto de esta ficha no publica ningun resultado de evaluacion. La comparacion de licencias queda igualmente limitada, ya que este repositorio no declara licencia alguna.

## Limitaciones y advertencias

- Estado "pre_alpha": el propio identificador indica que el ajuste es preliminar y no ha superado un ciclo de validacion completo.
- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion elevado en dominio legal: un modelo de 2,5B puede generar referencias normativas, articulos o fechas inexistentes. Cualquier salida juridica debe verificarse contra el texto oficial del BOE.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, por lo que no se puede comparar con alternativas de tamano similar.
- Sesgos: no documentados por el autor. Al entrenarse sobre un corpus institucional espanol, es probable que herede el sesgo del registro administrativo, pero se trata de una hipotesis no verificada.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto efectiva y los idiomas soportados; el uso fuera del castellano juridico-administrativo es incierto.
- Solo tres cuantizaciones disponibles: no hay variantes de 2, 3 o 5 bits ni formatos distintos de GGUF, lo que reduce las opciones de ajuste fino entre calidad y consumo de memoria.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta implican que no existen informes de terceros sobre su comportamiento real.
- Metadatos llamativos: las fechas de creacion y actualizacion registradas (10 de septiembre de 2026) son posteriores a la fecha habitual de publicacion; conviene verificar la trazabilidad del repositorio.
- Etiquetas potencialmente enganosas: la mencion a `llama-mtmd-cli` y las etiquetas "llama" no implican arquitectura Llama ni capacidades multimodales; describen el ecosistema de ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jasonjimnz/MiniCPM5-2B-Base_boe_legal_pre_alpha_4
- llama.cpp (motor de inferencia documentado en la model card): https://github.com/ggml-org/llama.cpp
- Unsloth (herramienta de conversion a GGUF citada por el autor): https://github.com/unslothai/unsloth
- Repositorio del modelo base MiniCPM5-2B-Base: no identificado en la informacion disponible.
- Paper, blog o demo asociados: no disponibles. La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces recuperados correspondian a un sitio de encuestas de mercado ajeno por completo al ambito de la IA.
