# KiwiMate/KiwiMate-Large-1.1

## Resumen

KiwiMate-Large-1.1 es un modelo de lenguaje y vision (vision-language model) publicado por KiwiMate en Hugging Face, distribuido exclusivamente en formato GGUF y empaquetado para su uso con llama.cpp. Por los nombres de los ficheros incluidos (`Qwen3.6-35B-A3B.*.gguf`) y la etiqueta `qwen3_5_moe`, se trata de una conversion a GGUF de un modelo base de la familia Qwen, con arquitectura de mezcla de expertos (MoE) y un total de 35.505.251.456 parametros, de los cuales aproximadamente 3.000 millones estarian activos por token segun la nomenclatura "A3B".

El modelo resuelve el problema de desplegar localmente un modelo multimodal de gran tamano con requisitos de computo reducidos por token, gracias a su naturaleza MoE. La relevancia actual radica en que combina capacidades de vision y lenguaje en un unico paquete GGUF compatible con llama.cpp, lo que permite ejecutarlo en entornos de inferencia locales sin necesidad de infraestructura de servidores GPU dedicada.

La informacion publicada es muy limitada: no se declara licencia, idiomas soportados, pipeline ni resultados de benchmarks. El repositorio ocupa 160,7 GB e incluye cuantizaciones BF16, Q4_K_M, Q6_K y Q8_0, ademas del proyector multimodal (`mmproj`) necesario para el procesamiento de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun etiqueta `qwen3_5_moe` |
| Parametros totales | 35.505.251.456 (35,5 mil millones) |
| Parametros activos | no disponible con precision; la nomenclatura "A3B" sugiere aproximadamente 3 mil millones activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (2 shards), Q4_K_M, Q6_K, Q8_0; proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp), con fichero `mmproj` para vision |
| Tamano del repositorio | 160,7 GB |
| Fecha de creacion | 2026-09-22 |
| Ultima actualizacion | 2026-11-17 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indica la etiqueta `qwen3_5_moe` y la nomenclatura de los ficheros (`Qwen3.6-35B-A3B`). El modelo totaliza 35,5 mil millones de parametros, con un subconjunto activo por token del orden de 3 mil millones segun el sufijo "A3B". Incorpora un proyector multimodal (`mmproj`) que habilita la entrada de imagenes junto con texto, lo que lo clasifica como vision-language model.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. La model card unicamente documenta el proceso de conversion a GGUF mediante Unsloth y las instrucciones de uso con `llama-cli` y `llama-mtmd-cli`. No se detalla si el modelo base fue entrenado por KiwiMate o si es una redistribucion de un modelo Qwen preexistente.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational`.
- Procesamiento de imagenes y texto de forma conjunta (vision-language model), mediante el fichero `mmproj` y `llama-mtmd-cli`.
- Compatibilidad con plantillas Jinja para formateo de chat (`--jinja` en llama.cpp).
- Inferencia local mediante llama.cpp y llama-cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Soporte de razonamiento, codigo, matematicas y tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia conversacional local: el modelo puede desplegarse con `llama-cli` en estaciones de trabajo con GPU consumer, gestionando dialogos multi-turno mediante la plantilla Jinja. Es adecuado por su formato GGUF y su naturaleza MoE, que reduce el computo por token.
- Analisis de imagenes en local: mediante `llama-mtmd-cli` y el fichero `mmproj`, se puede usar para descripcion de imagenes, extraccion de texto (OCR asistido) o respuesta a preguntas sobre capturas y documentos escaneados sin enviar datos a servicios externos.
- Procesamiento de documentacion tecnica con componentes visuales: diagramas, esquemas y capturas de pantalla pueden acompanar al texto en consultas, aprovechando la naturaleza multimodal del modelo.
- Prototipado de agentes con entrada multimodal: la compatibilidad declarada con endpoints permite integrarlo en servidores compatibles con la API de OpenAI para pruebas de pipelines de agentes que reciban imagenes y texto.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, es apto para escenarios donde no se permite el envio de datos a la nube, como documentacion interna o imagenes sensibles.
- Evaluacion comparativa de modelos MoE multimodales: las cuantizaciones Q4_K_M, Q6_K y Q8_0 permiten medir el equilibrio entre calidad y consumo de memoria en distintas configuraciones de hardware.
- Educacion e investigacion: util para experimentar con modelos MoE multimodales en laboratorios con recursos limitados, dado el bajo numero de parametros activos por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano de los ficheros, la cuantizacion Q4_K_M de un modelo de 35,5 mil millones de parametros requiere del orden de 20-22 GB, Q6_K en torno a 27-30 GB, Q8_0 aproximadamente 36-38 GB y BF16 alrededor de 71 GB, a lo que hay que sumar el proyector multimodal y el contexto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) podria alojar la cuantizacion Q4_K_M; configuraciones mayores requeririan A100 40/80 GB, H100 o descarga parcial a CPU.
- Cabe en GPU consumer: probablemente si con Q4_K_M en GPUs de 24 GB, aunque este dato no esta confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), llama-cpp y servidores compatibles con endpoints. Otras opciones como vLLM, Ollama o TGI no estan documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| KiwiMate-Large-1.1 | 35,5 mil millones | ~3 mil millones (segun nomenclatura) | no disponible | no disponible | GGUF | Vision-language, conversion Unsloth |
| Qwen3-30B-A3B (referencia de familia) | ~30 mil millones | ~3 mil millones | no disponible en esta ficha | no disponible | safetensors/GGUF | Modelo base de la misma familia segun nomenclatura; datos no confirmados |
| Alternativas MoE de ~30-35B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- No se declaran los idiomas soportados; el rendimiento en castellano es desconocido y debe evaluarse empiricamente.
- No hay benchmarks publicados, por lo que no es posible validar la calidad del modelo frente a alternativas.
- No se especifica la longitud de contexto, lo que limita la planificacion de casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay datos de mitigacion ni de evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles. Al derivar presumiblemente de un modelo base de gran escala, es probable que herede sesgos de sus datos de entrenamiento, pero no hay documentacion al respecto.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- El modelo se distribuye solo en GGUF; no hay pesos en safetensors disponibles en este repositorio, lo que limita el ajuste fino y el uso con frameworks como vLLM o TGI.
- La fecha de creacion (2026-09-22) y la nomenclatura "Qwen3.6" no coinciden con versiones publicas conocidas de Qwen en el momento de redactar esta ficha; conviene verificar la procedencia del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/KiwiMate/KiwiMate-Large-1.1
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): no incluido en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
