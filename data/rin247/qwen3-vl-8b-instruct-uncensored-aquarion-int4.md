# Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-INT4

## Resumen

El modelo `Qwen3-VL-8B-Instruct-Uncensored-Aquarion-INT4` es una cuantización INT4 (weight-only) del modelo multimodal Qwen3-VL-8B-Instruct, desarrollada por el usuario Rin247 como parte de la colección *Aquarion Forge*. Antes de la cuantización, el modelo fue sometido a un proceso de "abliteración" mediante proyección ortogonal de la dirección de rechazo, lo que elimina los mecanismos de negativa del modelo original y lo convierte en una versión sin censura. El resultado es un modelo de visión-lenguaje que conserva las capacidades del base pero con un tamaño reducido y sin restricciones de contenido.

La relevancia de este modelo radica en que permite ejecutar un sistema multimodal (texto e imagen) en hardware modesto gracias a la cuantización INT4, y al mismo tiempo ofrece una alternativa sin filtros para usos creativos o de investigación donde las respuestas del modelo original resultan demasiado restrictivas. El repositorio contiene los pesos en formato safetensors con escalas almacenadas por separado, junto con un archivo `config.json` que incluye la configuración de cuantización. El número de parámetros totales según los tensores es de 4.386.905.328, sensiblemente inferior a los ~8.000 millones que sugiere el nombre, lo que indica que la cuantización reduce el tamaño efectivo de los pesos o que el modelo base tiene una arquitectura más compacta de lo esperado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Qwen3-VL-8B-Instruct |
| Parametros totales | 4.386.905.328 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 weight-only (escalas almacenadas junto a los pesos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors con buffers de escala y forma (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint oficial `Qwen3-VL-8B-Instruct` de Qwen, que emplea una arquitectura transformer multimodal capaz de procesar texto e imágenes de forma conjunta. La versión publicada por Rin247 aplica dos transformaciones sobre el modelo base: primero, una abliteración mediante proyección ortogonal de la dirección de rechazo, técnica que elimina los vectores de negativa en el espacio de activaciones y produce un comportamiento sin censura; y segundo, una cuantización INT4 weight-only realizada con PyTorch RTN (round-to-nearest) ejecutada en CPU, donde las escalas y las formas de los tensores originales se guardan como buffers adicionales para permitir la deconvolución posterior.

No se dispone de información sobre el conjunto de datos de entrenamiento original del modelo base ni sobre el proceso de abliteración en detalle (número de muestras, criterios de selección, etc.). Tampoco se documentan pasos de fine-tuning adicionales tras la cuantización. El método de cuantización es estándar para reducción de memoria, pero la falta de evaluación publicada impide conocer el impacto exacto en la calidad de las respuestas.

## Capacidades

- Procesamiento multimodal: comprende y genera texto a partir de imágenes, heredando las capacidades del modelo Qwen3-VL-8B-Instruct.
- Razonamiento visual y textual: puede responder preguntas sobre el contenido de imágenes, realizar descripciones, extraer información y razonar sobre escenas complejas.
- Generación de texto sin censura: gracias a la abliteración, no rechaza solicitudes que el modelo original consideraría inapropiadas.
- Comprensión de contexto largo: el modelo base Qwen3-VL soporta ventanas de contexto extendidas, aunque el valor exacto no se ha especificado en esta variante cuantizada.
- Capacidades de agente y tool calling: el modelo base incluye soporte para interacción con herramientas y razonamiento multi-paso, pero no se ha confirmado si estas funcionalidades se conservan íntegramente tras la cuantización.
- Multilingüismo: el modelo original soporta múltiples idiomas, aunque la lista concreta no está disponible en esta versión.

## Casos de uso

- Generación creativa de contenido sin restricciones: escritura de ficción, poesía o guiones que aborden temas sensibles sin que el modelo se niegue a colaborar, gracias a su naturaleza uncensored.
- Análisis de imágenes en entornos con recursos limitados: descripción de fotografías, extracción de texto de capturas o reconocimiento de objetos en una GPU de gama media o incluso en CPU, gracias al tamaño reducido del modelo INT4.
- Prototipado rápido de aplicaciones multimodales: desarrollo de demos o pruebas de concepto que requieran un modelo de visión-lenguaje local sin depender de APIs externas, con requisitos de VRAM moderados.
- Investigación sobre alineación y censura: estudio del comportamiento de modelos abliterados frente a los originales, comparando respuestas en escenarios controvertidos con fines académicos.
- Automatización de tareas de moderación inversa: generación de contenido de ejemplo para entrenar clasificadores de contenido inapropiado, donde se necesitan respuestas sin filtros.
- Integración en pipelines de generación de descripciones para accesibilidad: descripción automática de imágenes para personas con discapacidad visual en entornos offline, donde la baja huella de memoria facilita el despliegue en dispositivos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de visión-lenguaje para esta cuantización. Tampoco hay comparativas con el modelo base en términos de degradación por cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.386.905.328 parámetros en INT4 (aproximadamente 0,5 bytes por parámetro), el peso del modelo ocupa unos 2,2 GB. Añadiendo buffers de escala, activaciones y overhead del framework, se estima un consumo total de 3-4 GB en inferencia con batch pequeño.
- GPU recomendadas: tarjetas con 4 GB de VRAM o más, como NVIDIA RTX 3050, RTX 3060, RTX 4060 o equivalentes de AMD. También podría ejecutarse en CPU con suficiente RAM (8 GB o más), aunque con latencias mayores.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama de entrada gracias al bajo consumo de memoria.
- Opciones de despliegue: el formato de pesos es safetensors con escalas adicionales, lo que requiere un motor de inferencia que soporte la deconvolución de pesos INT4. No se ha confirmado compatibilidad directa con vLLM, llama.cpp u Ollama; es probable que se necesite un script de conversión personalizado o un motor que entienda el formato de escalas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | ~8B (no confirmado) | No disponible | FP16 | Apache 2.0 (según el repo oficial) | HuggingFace |
| Qwen3-VL-8B-Instruct-Uncensored-Aquarion-INT4 (este) | 4.386.905.328 | No disponible | INT4 weight-only | No disponible | HuggingFace |
| Otras cuantizaciones de la colección Aquarion (FP8, INT8, FP4) | No disponible | No disponible | FP8/INT8/FP4 | No disponible | Colección de Rin247 |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento publicados. Frente al modelo base, esta versión ofrece un tamaño significativamente menor y ausencia de censura, pero introduce una posible pérdida de precisión por la cuantización y carece de licencia explícita. Frente a otras cuantizaciones de la misma colección, no se dispone de información diferencial.

## Limitaciones y advertencias

- Contenido potencialmente inapropiado: al ser uncensored, el modelo puede generar respuestas ofensivas, violentas o sexualmente explícitas sin filtro. Su uso debe restringirse a entornos controlados y con consentimiento de los usuarios.
- Degradación por cuantización: la conversión a INT4 puede reducir la fidelidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- Licencia no especificada: el repositorio no indica bajo qué términos se distribuye el modelo. Esto genera incertidumbre legal para su uso comercial o su redistribución.
- Formato propietario de cuantización: los pesos INT4 con escalas separadas no son compatibles con los motores de inferencia estándar sin adaptación. La documentación no incluye ejemplos de carga ni scripts de deconvolución, lo que dificulta su despliegue práctico.
- Sin soporte oficial: el proyecto no tiene mantenimiento activo ni canal de soporte; ante errores o incompatibilidades, el usuario debe resolverlos por su cuenta.
- Idiomas y contexto no documentados: se desconoce la cobertura idiomática real y la longitud máxima de contexto tras la cuantización, lo que puede provocar fallos inesperados en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/Qwen3-VL-8B-Instruct-Uncensored-Aquarion-INT4
- Colección Qwen3-Aquarion de Rin247: https://huggingface.co/collections/Rin247/qwen3-aquarion
- Página del modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio oficial de Qwen3-VL en GitHub: https://github.com/QwenLM/Qwen3-VL
