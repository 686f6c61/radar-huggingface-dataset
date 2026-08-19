# Inevitablevalor/MindCube-plain-cgmap-ffr-out-ckpt57

## Resumen

MindCube-plain-cgmap-ffr-out-ckpt57 es un ajuste fino completo (full-parameter SFT) del modelo Qwen/Qwen2.5-VL-3B-Instruct, desarrollado por el usuario Inevitablevalor sobre el framework MindCube del MLL-Lab de la Northwestern University. El modelo está especializado en razonamiento espacial multimodal: dado un conjunto de imágenes de una escena desde vistas limitadas, genera primero un mapa cognitivo plano (plain cognitive map) de la disposición espacial, después un razonamiento de forma libre y finalmente la respuesta a la pregunta planteada.

Este checkpoint (el número 57 de la ejecución) aborda un problema crítico identificado por el benchmark MindCube: los modelos visión-lenguaje (VLM) existentes rinden casi al azar en tareas que requieren construir un modelo mental del espacio no visible. El ajuste con la estrategia "map-then-reason" eleva la precisión en el benchmark de 37,8% a 57,8% según el paper asociado, y hasta 61,3% con refuerzo, aunque no se especifica si estos valores corresponden exactamente a este checkpoint.

Con 3,75 mil millones de parámetros y una ventana de contexto de 8192 tokens, el modelo hereda la arquitectura Qwen2.5-VL (vision transformer + LLM) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal con vision encoder) |
| Parametros totales | 3.754.622.976 (3,75B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (máximo usado en entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, que combina un vision encoder (ViT) con un LLM Qwen2.5 de 3B parámetros. El ajuste fino se realizó sobre el dataset MindCube en la configuración `plain_cgmap_ffr_out`, que exige al modelo emitir primero un mapa cognitivo textual de la escena, después un razonamiento libre y finalmente la respuesta. El entrenamiento usó learning rate 1e-5, 3 épocas, secuencias de hasta 8192 tokens, píxeles de imagen entre 784 y 90000, y precisión bfloat16. No se menciona el uso de RLHF ni DPO; es un SFT puro.

La innovación principal reside en la estrategia de generación en dos fases (mapa + razonamiento), que fuerza al modelo a externalizar su representación espacial antes de responder, mejorando la precisión frente a la respuesta directa.

## Capacidades

- Razonamiento espacial: construye un modelo mental de la disposición de objetos y espacios a partir de múltiples imágenes de vistas limitadas.
- Generación de mapas cognitivos: produce una descripción textual estructurada del layout de la escena.
- Razonamiento de forma libre: tras el mapa, elabora inferencias y responde preguntas sobre la escena.
- Entrada multimodal: acepta una o varias imágenes junto con texto en formato de chat multi-imagen de Qwen2.5-VL.
- Conversación: soporta el formato de chat estándar de Qwen2.5-VL, permitiendo interacciones multi-turno.
- No se documentan capacidades de tool calling, agentes, ni soporte de audio o vídeo.

## Casos de uso

- Navegación robótica: un robot equipado con cámaras puede usar el modelo para inferir la disposición de una habitación a partir de fotos tomadas desde distintos ángulos, mejorando la planificación de rutas sin necesidad de un mapa completo.
- Asistencia a personas con discapacidad visual: a partir de fotos tomadas con un smartphone, el modelo puede describir la distribución de muebles y obstáculos en una estancia, ayudando a la orientación.
- Análisis de seguridad: en entornos con cámaras de vigilancia, el modelo puede reconstruir la disposición de una escena a partir de varios fotogramas, facilitando la detección de anomalías o la reconstrucción de eventos.
- Planificación de interiores: un usuario puede fotografiar una habitación desde varias perspectivas y el modelo sugiere reorganizaciones del mobiliario basándose en el mapa espacial inferido.
- Realidad aumentada: para superponer objetos virtuales de forma coherente, el modelo puede estimar la geometría y las relaciones espaciales de la escena a partir de imágenes capturadas.
- Inspección de edificios: técnicos pueden usar el modelo para evaluar la distribución de espacios en fotos de obra, verificando que el layout coincide con los planos.
- Educación: en entornos de aprendizaje, el modelo puede ayudar a estudiantes a comprender relaciones espaciales complejas a partir de imágenes de maquetas o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint en la información disponible. El paper de MindCube (arXiv:2506.21458) reporta que los VLM estándar obtienen resultados casi aleatorios en el benchmark (21.154 preguntas sobre 3.268 imágenes), y que el entrenamiento con la estrategia map-then-reason eleva la precisión de 37,8% a 57,8%, llegando a 61,3% con refuerzo. Sin embargo, no se indica si estos valores corresponden a este checkpoint concreto o a otra variante del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 7,5 GB (tamaño del repositorio). Con overhead de activaciones y caché KV para 8192 tokens, se estima un consumo de 10-12 GB en GPU. Con cuantización a 4 bits (no disponible oficialmente, pero posible mediante conversión), podría reducirse a 4-6 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) o superiores, A10/A100 (16-40 GB). También puede ejecutarse en GPUs con 16 GB si se usa cuantización o se reduce la longitud de contexto.
- En consumer GPU: sí, cabe en RTX 3090/4090 y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: transformers (inferencia directa), vLLM, TGI (text-generation-inference), y conversión a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| MindCube-plain-cgmap-ffr-out-ckpt57 (este) | 3,75B | 8192 | Apache 2.0 | Razonamiento espacial con mapa cognitivo |
| Qwen2.5-VL-3B-Instruct (base) | 3,75B | 32768 (original) | Apache 2.0 | Multimodal general |
| MindCube-Qwen2.5VL-Plain-CGMap-FFR-OUT | 3,75B | No disponible | Apache 2.0 | Razonamiento espacial (sin model card) |
| MindCube-Qwen2.5VL-cogmap-and-reasoning | 3,75B | No disponible | Apache 2.0 | Razonamiento espacial (sin model card) |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo base Qwen2.5-VL-3B-Instruct tiene una ventana de contexto mayor (32K) pero no está especializado en razonamiento espacial, por lo que su rendimiento en el benchmark MindCube es casi aleatorio según el paper.

## Limitaciones y advertencias

- Sesgos: al estar entrenado únicamente en inglés, puede presentar sesgos culturales en la interpretación de escenas de entornos no occidentales.
- Riesgo de alucinación: en tareas espaciales, el modelo puede generar mapas cognitivos plausibles pero incorrectos, especialmente con imágenes de baja calidad o vistas muy limitadas.
- Limitaciones de contexto: la ventana de 8192 tokens puede ser insuficiente para escenas muy complejas o con muchas imágenes, limitando la cantidad de información procesable.
- Idioma: solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen2.5-VL también es Apache 2.0, por lo que no hay conflictos adicionales.
- Producción: al ser un checkpoint de investigación (checkpoint-57), no se garantiza estabilidad ni soporte a largo plazo. Se recomienda validar su rendimiento en el dominio específico antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Inevitablevalor/MindCube-plain-cgmap-ffr-out-ckpt57
- Paper: https://arxiv.org/abs/2506.21458
- Página del proyecto: https://mind-cube.github.io/
- Repositorio GitHub: https://github.com/mll-lab-nu/MindCube
- Dataset: https://huggingface.co/datasets/MLL-Lab/MindCube
