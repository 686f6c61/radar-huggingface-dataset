# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q5

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-q5 es una cuantización en 5 bits del modelo `Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16`, que a su vez es una versión "abliterated" (sin restricciones de contenido) del modelo Muse Glimmer de Meta, un modelo multimodal de ~30B parámetros diseñado para agentes locales siempre activos. Esta variante MLX está optimizada para ejecutarse en Apple Silicon mediante la librería `mlx-vlm`, y su creador, shoemoney, la publica con licencia Apache 2.0.

El modelo original, Muse Glimmer, es un modelo denso de lenguaje y visión con encoder de percepción dedicado, destilado de Muse Spark y orientado a tareas agénticas con tool-calling nativo y razonamiento separado. La versión abliterated elimina los mecanismos de rechazo de contenido, lo que la hace adecuada para entornos donde se requiere generación sin filtros, aunque con los riesgos asociados.

Esta cuantización concreta no añade fine-tuning ni re-alineamiento; solo convierte los pesos BF16 a 5 bits con grupo de tamaño 64. Según las mediciones del autor, alcanza una perplejidad de 7.306 y un throughput de 29.1/79.4 tokens por segundo en un Apple M3 Ultra con 96 GB de memoria unificada. El repositorio ocupa 22.9 GB en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal densa (texto e imagen) con encoder de percepcion, basada en Muse Glimmer |
| Parametros totales | 7.089.517.568 (segun safetensors; el nombre sugiere 30B, pero el peso real es ~7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5-bit (MLX, grupo de 64); el modelo base usa BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Muse Glimmer, es un modelo de lenguaje multimodal denso con un encoder de percepción dedicado, destilado de Muse Spark. Está diseñado para tareas agénticas, con soporte nativo de tool-calling y una salida de razonamiento separada. La versión abliterated elimina los mecanismos de rechazo de contenido, manteniendo la misma arquitectura.

La cuantización MLX 5-bit se realizó con `mlx_vlm.convert` sobre los pesos BF16, sin fine-tuning ni merging. El autor indica que se usó un grupo de tamaño 64 y que la perplejidad se midió sobre `allenai/tulu-3-sft-mixture` con 192 muestras de 512 tokens. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de destilación.

## Capacidades

- Generacion de texto y razonamiento multimodal (acepta imagenes y texto).
- Tool-calling nativo, pensado para agentes que necesitan invocar funciones externas.
- Razonamiento separado: el modelo puede generar una cadena de pensamiento antes de la respuesta final.
- Capacidad de ejecucion en hardware local (Apple Silicon) gracias a la cuantizacion MLX.
- Al ser abliterated, no aplica filtros de contenido, lo que permite generar respuestas sin restricciones de seguridad (con los riesgos asociados).
- Soporte de agentes y tareas de larga duracion, segun la documentacion de Meta.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede gestionar tareas multi-paso en un entorno local, como organizar archivos, enviar correos o interactuar con APIs, gracias a su tool-calling nativo y su capacidad de razonamiento.
- Asistente de codigo en entornos sin conexion: al ejecutarse en una sola GPU o en Apple Silicon, puede integrarse en IDEs o pipelines de CI/CD para generar y revisar codigo sin depender de servicios en la nube.
- Analisis de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas de pantalla, diagramas o graficos y generar resumenes o respuestas basadas en ellos.
- Chatbots sin censura para investigacion: la version abliterated permite explorar temas sensibles o generar contenido creativo sin restricciones, util en entornos de investigacion academica o desarrollo de narrativas.
- Automatizacion de tareas de oficina: puede redactar correos, resumir reuniones o generar informes a partir de notas, aprovechando su contexto largo (aunque no se conoce el valor exacto).
- Prototipado rapido de agentes con tool calling: los desarrolladores pueden probar flujos agénticos complejos en local antes de desplegarlos en produccion, gracias a la compatibilidad con `mlx-vlm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona mediciones propias de perplejidad y throughput, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras) | 7.306 |
| Throughput (1 peticion) | 29.1 tok/s |
| Throughput (8 peticiones concurrentes) | 79.4 tok/s |
| Tamano en disco | 22.93 GB |

Estas cifras son comparables solo dentro de la familia de cuantizaciones del mismo modelo base, no con otros modelos.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22.9 GB, por lo que se recomienda al menos 24 GB de memoria unificada o VRAM para cargar los pesos en memoria.
- GPU recomendadas: Apple Silicon con 32 GB o mas (M3 Pro, M3 Max, M3 Ultra, etc.). En GPUs de NVIDIA, una RTX 4090 (24 GB) o A6000 (48 GB) podrian ser suficientes, aunque la cuantizacion MLX esta optimizada para Apple.
- En consumer GPU: cabe en tarjetas con 24 GB o mas, pero el rendimiento puede variar.
- Opciones de despliegue: `mlx-vlm` para Apple Silicon; para otras plataformas, se necesitaria convertir los pesos a otro formato (GGUF, etc.), aunque no se proporciona.
- Latencia y throughput: medidos en M3 Ultra (96 GB): 29.1 tok/s en inferencia secuencial y 79.4 tok/s con 8 peticiones concurrentes.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos. El modelo base Muse Glimmer (30B) es comparable en tamano a Llama 3 30B o Mixtral 8x7B, pero no se han publicado benchmarks comparativos. La version abliterated y la cuantizacion MLX son especificas de este repositorio, por lo que no hay alternativas directas en el ecosistema MLX.

## Limitaciones y advertencias

- Al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- La perplejidad medida es solo comparable dentro de la misma familia de cuantizaciones; no debe usarse para comparar con otros modelos.
- No se conoce la longitud de contexto exacta, lo que limita el diseno de aplicaciones que requieran ventanas largas.
- La cuantizacion 5-bit puede degradar ligeramente la calidad respecto al BF16 original, aunque el autor indica una degradacion relativa de 1.01x.
- El numero de parametros real (7.09B) difiere del nombre "30B", lo que sugiere que el safetensors podria contener solo una parte del modelo (posiblemente el decoder sin el encoder de vision). Esto debe verificarse antes de usarlo en produccion.
- No hay informacion sobre sesgos especificos, pero al ser un modelo derivado de Muse Glimmer, podria heredar sesgos de los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q5
- Modelo base (BF16): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Documentacion de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Pagina de descarga de pesos: https://ai.developer.meta.com/docs/muse-glimmer/get-the-model
- Referencia en NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/meta-muse-glimmer-30b
