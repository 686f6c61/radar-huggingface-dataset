# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q4

## Resumen

Este modelo es una cuantización en 4-bit MLX del modelo `Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16`, que a su vez es una versión "abliterated" (modificada para eliminar restricciones de contenido) del modelo Muse-Glimmer-30B desarrollado por Meta. Muse-Glimmer-30B es un modelo multimodal de razonamiento que acepta texto e imágenes, con tool-calling nativo y una salida de razonamiento separada, diseñado específicamente para agentes locales que requieren autonomía, fiabilidad y recuperación de fallos.

La cuantización MLX, realizada con `mlx_vlm.convert`, reduce el tamaño del modelo a 19.4 GB en disco y permite ejecutarlo en hardware Apple Silicon con un rendimiento medido de hasta 69.7 tokens por segundo en una Apple M3 Ultra con 96 GB de memoria unificada. Esto hace que el modelo sea accesible para desarrolladores que trabajan en entornos locales sin depender de infraestructura cloud, manteniendo la licencia Apache 2.0 del modelo base.

La relevancia de esta ficha radica en que combina las capacidades de un modelo de agente multimodal de última generación con una implementación eficiente para hardware de consumo, lo que abre casos de uso prácticos en automatización, asistentes personales y análisis de imágenes sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con decodificador autorregresivo |
| Parametros totales | 6.216.936.448 (según safetensors; el modelo base declara 30B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (grupo de tamaño 64) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer multimodal desarrollado por Meta, con un codificador de visión y un decodificador de lenguaje que procesa tanto texto como imágenes. Está afinado para tareas de agente: razonamiento multi-step, uso fiable de herramientas y recuperación de errores. La versión "abliterated" de Blackfrost-AI elimina las capas de rechazo de contenido, lo que permite respuestas sin censura, aunque con los riesgos asociados.

La cuantización MLX se realizó a partir de los pesos BF16 originales, sin fine-tuning adicional. El proceso convierte los pesos a 4-bit con un grupo de tamaño 64, manteniendo la arquitectura intacta. Según la model card, la perplejidad medida es de 7.300 en el conjunto `allenai/tulu-3-sft-mixture`, con un factor de 1.01× respecto al mejor escalón de la familia, lo que indica una degradación mínima por la cuantización.

## Capacidades

- Generación de texto y razonamiento multi-step, con salida de razonamiento separada del texto final.
- Comprensión de imágenes: puede analizar y responder sobre contenido visual.
- Tool calling nativo: soporta invocación de funciones y herramientas externas.
- Diseñado para agentes autónomos: puede ejecutar tareas largas, mantener contexto y recuperarse de fallos.
- Multilingüe: aunque no se especifican idiomas, al ser un modelo de Meta es probable que soporte varios, pero no hay datos confirmados.
- Optimizado para ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Asistentes personales locales: el modelo puede gestionar conversaciones multi-turno, razonar sobre el contexto y ejecutar acciones mediante tool calling, todo en el dispositivo sin conexión a internet.
- Automatización de tareas de oficina: integrado en scripts o agentes, puede leer documentos, extraer información, resumir correos y generar respuestas, aprovechando su capacidad de razonamiento y uso de herramientas.
- Análisis de imágenes en entornos sin GPU dedicada: por ejemplo, inspección visual de productos, lectura de capturas de pantalla o descripción de fotografías, gracias a su componente multimodal.
- Desarrollo de agentes de código: puede recibir instrucciones en lenguaje natural, generar código, ejecutar comandos y corregir errores, usando tool calling para interactuar con el sistema.
- Soporte técnico automatizado: con su capacidad de razonamiento y recuperación de fallos, puede diagnosticar problemas, consultar bases de conocimiento y escalar a un humano si es necesario.
- Investigación y experimentación con modelos sin censura: la versión abliterated permite explorar comportamientos sin restricciones de contenido, útil para estudios de seguridad o generación creativa.

## Benchmarks y rendimiento

La model card proporciona mediciones propias, no benchmarks estándar como MMLU o HumanEval. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 7.300 |
| Factor relativo al mejor escalón de la familia | 1.01× |
| Throughput (1 petición) | 31.8 tok/s |
| Throughput (8 peticiones concurrentes) | 69.7 tok/s |

Estas mediciones se realizaron en una Apple M3 Ultra con 96 GB de memoria unificada. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- El modelo cuantizado ocupa 19.4 GB en disco, por lo que requiere al menos 24 GB de memoria unificada en Apple Silicon para cargarlo cómodamente.
- Probado en Apple M3 Ultra con 96 GB de memoria unificada, alcanzando 69.7 tok/s con 8 peticiones concurrentes.
- Al ser una cuantización MLX, solo es compatible con hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- No se puede ejecutar en GPUs NVIDIA o AMD directamente; para ello habría que usar otras cuantizaciones (GGUF, GPTQ, etc.) del modelo base.
- Despliegue recomendado con `mlx-vlm`, que es la librería específica para modelos multimodales en MLX. También se puede usar con `mlx-lm` para modelos de texto, pero este modelo requiere `mlx-vlm`.
- La latencia estimada es de aproximadamente 31 ms por token en una sola petición, y 14 ms por token en concurrencia, según los datos de throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Sin embargo, se puede comparar cualitativamente con el modelo base sin cuantizar y con la versión original de Meta:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (Meta) | 30B | no disponible | Apache 2.0 | BF16 | Modelo original, multimodal, tool-calling |
| Muse-Glimmer-30B-Abliterated (Blackfrost-AI) | 30B | no disponible | Apache 2.0 | BF16 | Versión sin censura del anterior |
| Este modelo (MLX 4-bit) | 6.2B (según safetensors) | no disponible | Apache 2.0 | MLX 4-bit | Cuantización para Apple Silicon, mismo comportamiento que el base |

La comparativa con otros modelos de 30B como Llama 3.1 30B o Qwen 2.5 32B no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir una ligera degradación en la calidad de las respuestas, aunque la perplejidad medida es solo 1.01× respecto al mejor escalón de la familia.
- La versión "abliterated" elimina las restricciones de contenido, lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. No es recomendable para aplicaciones de producción sin un filtrado adicional.
- No se especifican los idiomas soportados ni la longitud de contexto, por lo que estos parámetros son desconocidos.
- El número de parámetros reportado en safetensors (6.2B) no coincide con el nombre del modelo (30B), lo que sugiere un posible error en la metadata o en el archivo. Se recomienda verificar antes de usar.
- Al ser una cuantización MLX, solo funciona en Apple Silicon; no es portable a otros ecosistemas sin conversión adicional.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento en tareas como MMLU o HumanEval es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q4
- Modelo base (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Página de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Modelo en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Modelo en LM Studio: https://lmstudio.ai/models/meta/muse-glimmer
