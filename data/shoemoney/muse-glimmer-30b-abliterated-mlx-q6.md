# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q6

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-q6 es una cuantizacion a 6 bits en formato MLX del modelo Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16, que a su vez es una version sin censura (abliterated) del modelo Muse-Glimmer-30B desarrollado por Meta. Muse-Glimmer es un modelo vision-language denso de aproximadamente 30.000 millones de parametros, con una ventana de contexto de 128.000 tokens, disenado especificamente para agentes locales siempre activos, con soporte nativo para llamadas a herramientas, tareas de larga duracion y recuperacion de fallos. La cuantizacion MLX permite ejecutar este modelo en hardware Apple Silicon con un consumo de memoria reducido y un rendimiento aceptable, lo que lo hace relevante para desarrolladores que necesitan un modelo agente multimodal en entornos locales.

El autor de esta cuantizacion, shoemoney, ha convertido los pesos desde BF16 a 6 bits utilizando la herramienta `mlx_vlm.convert`, sin realizar ajuste fino ni realineacion. El resultado es un archivo de 26,4 GB que puede cargarse con la libreria mlx-vlm. La licencia Apache 2.0 heredada del modelo base permite uso comercial sin restricciones significativas. Aunque el nombre indica 30B, los archivos safetensors del repositorio muestran 7.962.098.688 parametros, una discrepancia que se detalla en las especificaciones tecnicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language con encoder ViT-G/14 (del modelo base) |
| Parametros totales | 7.962.098.688 (segun safetensors del repo MLX; el modelo base declara ~30B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (del modelo base) |
| Tipos de cuantizacion | 6-bit MLX con grupo de tamano 64 (este repo); el modelo base esta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso de 30B parametros con un encoder de vision ViT-G/14, entrenado por Meta mediante destilacion de su modelo Muse Spark. Esta disenado para agentes locales: emite razonamiento por canales (channel-scoped reasoning) y llamadas a herramientas en formato XML estilo ATEM, en lugar de JSON, lo que requiere parsers especificos. El contexto de 128K permite manejar conversaciones largas y tareas complejas. La version abliterated elimina las restricciones de seguridad del modelo original, lo que lo hace "sin censura" pero tambien introduce riesgos de contenido inapropiado.

La cuantizacion MLX 6-bit se realizo con `mlx_vlm.convert` sobre los pesos BF16, con grupo de cuantizacion de tamano 64. No hubo fine-tuning ni realineacion posterior. El autor midio una perplexity de 7.284 en el dataset `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123), y un throughput de 25,3 tok/s con una peticion y 78,4 tok/s con 8 peticiones concurrentes en un Apple M3 Ultra con 96 GB de memoria unificada.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes y texto, puede describir, analizar y responder sobre contenido visual.
- Llamada a herramientas (tool calling): emite llamadas en formato XML ATEM, compatible con agentes que necesitan invocar funciones externas.
- Razonamiento multi-paso: disenado para tareas de agente que requieren planificacion y ejecucion secuencial.
- Recuperacion de fallos: el modelo base incluye mecanismos para reintentar acciones fallidas, util en automatizacion.
- Contexto largo: 128K tokens, adecuado para conversaciones extensas o documentos largos.
- Sin censura (abliterated): no aplica filtros de seguridad, lo que permite generar contenido que otros modelos rechazarian (con los riesgos asociados).
- Ejecucion en Apple Silicon: gracias a la cuantizacion MLX, funciona en Macs con chip M-series sin necesidad de GPU dedicada.

## Casos de uso

- Agente local de automatizacion de tareas: el modelo puede ejecutar acciones en el sistema (enviar correos, gestionar archivos) mediante tool calling, aprovechando su capacidad de razonamiento multi-paso y recuperacion de fallos. Su contexto de 128K permite mantener el estado de la tarea durante largas sesiones.
- Asistente de codigo con vision: un desarrollador puede capturar una captura de pantalla de un error y pedir al modelo que lo diagnostique y proponga una correccion, combinando vision y generacion de codigo.
- Analisis de documentos largos con imagenes: procesar informes de 100+ paginas que incluyan graficos o diagramas, extrayendo informacion relevante y resumiendo contenido.
- Chatbot sin restricciones para investigacion: util en entornos donde se necesita explorar temas sensibles o controversiales sin filtros, como estudios sociologicos o simulaciones de escenarios.
- Automatizacion de pruebas de software: el modelo puede interpretar capturas de pantalla de una interfaz, generar casos de prueba y ejecutar llamadas a herramientas para verificar el comportamiento.
- Asistente personal multimodal en Mac: al ejecutarse localmente con MLX, puede integrarse en flujos de trabajo de macOS para procesar imagenes, redactar textos y gestionar tareas sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones propias de perplexity y throughput, que se presentan a continuacion. Estas cifras solo son comparables dentro de la misma familia de cuantizaciones del mismo modelo base, no entre modelos diferentes.

| Metrica | Valor |
|---|---|
| Perplexity (tulu-3-sft-mixture, 192 muestras, seed 123) | 7.284 |
| Throughput (1 peticion) | 25,3 tok/s |
| Throughput (8 peticiones concurrentes) | 78,4 tok/s |
| Tamano en disco | 26,42 GB |

Las mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada, macOS 27.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 26,4 GB en disco; en memoria, un modelo 6-bit de ~30B requiere aproximadamente 22-24 GB. En Apple Silicon con memoria unificada, se recomienda un minimo de 32 GB, aunque 64 GB o mas ofrecen margen para contexto largo.
- GPU recomendadas: exclusivamente Apple Silicon (M1 Pro/Max/Ultra, M2, M3, etc.) porque el formato MLX esta optimizado para estos chips. No es compatible directamente con GPUs NVIDIA o AMD.
- Si cabe en consumer GPU: no, porque MLX no se ejecuta en GPUs de consumo convencionales. Para usar en NVIDIA habria que convertir los pesos a otro formato (por ejemplo, GGUF o AWQ), lo cual no esta disponible en este repositorio.
- Opciones de despliegue: `mlx-vlm` (libreria oficial para modelos VLM en MLX). Tambien se puede usar con `mlx_lm.generate` si se adapta, pero el autor indica que la arquitectura esta registrada en mlx-vlm.
- Latencia y throughput: 25,3 tok/s en generacion secuencial y 78,4 tok/s con 8 peticiones concurrentes en M3 Ultra. En chips menos potentes (M1, M2) el rendimiento sera menor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. La comparacion mas directa es con el modelo base y con otras cuantizaciones del mismo modelo:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B | 128K | Apache 2.0 | BF16 | Modelo original de Meta, con censura |
| Muse-Glimmer-30B-Abliterated-BF16 | ~30B | 128K | Apache 2.0 | BF16 | Version sin censura, fuente de esta cuantizacion |
| Muse-Glimmer-30B-Abliterated-MLX-q6 (este repo) | 7.96B (segun safetensors) | 128K | Apache 2.0 | MLX 6-bit | Cuantizacion para Apple Silicon |
| Muse-Glimmer-30B-Abliterated-MLX-3bit-AWQ | no disponible | 128K | Apache 2.0 | MLX 3-bit AWQ | Otra cuantizacion del mismo modelo, menor calidad |

No se incluyen comparaciones con modelos de otros fabricantes (por ejemplo, Llama-3.1-8B o Qwen2.5-32B) porque no hay datos de rendimiento en la informacion disponible.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: al ser una version abliterated, el modelo no tiene filtros de seguridad. Puede generar contenido ofensivo, violento o ilegal. No debe usarse en aplicaciones publicas sin moderacion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o detalles, especialmente en tareas de razonamiento complejo. Se recomienda verificar las salidas en entornos de produccion.
- Discrepancia en parametros: el repositorio safetensors muestra 7.962.098.688 parametros, muy inferior a los ~30B declarados. Esto podria indicar un error en la conversion o una poda no documentada. Se recomienda verificar el comportamiento real antes de confiar en el modelo.
- Limitaciones de contexto en MLX: aunque el modelo base soporta 128K, la implementacion MLX puede tener limitaciones de memoria para contextos muy largos en equipos con menos de 64 GB.
- Idioma: no se ha especificado que idiomas soporta. El modelo base de Meta probablemente es multilingue, pero no hay confirmacion.
- Compatibilidad: el formato MLX solo funciona en Apple Silicon. No es portable a otros entornos sin conversion adicional.
- Soporte de parsers: las llamadas a herramientas usan formato XML ATEM, que requiere parsers especificos. No es compatible con el formato JSON estandar de otras librerias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q6
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Guia de vLLM Recipes: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Repositorio GitHub de ejemplo: https://github.com/cobusgreyling/Muse-Glimmer
