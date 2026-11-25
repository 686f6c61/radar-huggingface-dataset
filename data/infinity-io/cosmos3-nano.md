# Infinity-io/Cosmos3-Nano

## Resumen

Cosmos3-Nano es un modelo fundacional omnimodal desarrollado por NVIDIA dentro de la plataforma Cosmos, orientada a lo que el fabricante denomina Physical AI: robótica, conducción autónoma y entornos industriales o de fábrica. El modelo acepta combinaciones de texto, imagen, vídeo (con o sin audio) y trayectorias de acción, y es capaz de generar texto, imágenes, vídeo, audio y comandos de acción. Con aproximadamente 15.750 millones de parámetros reales en pesos safetensors (16B según la model card), se posiciona como la variante compacta de la familia Cosmos3.

La arquitectura es un Mixture-of-Transformers (MoT) con dos torres complementarias: una transformer autorregresiva que genera tokens discretos (texto) mediante decodificación next-token, y una transformer de difusión que sintetiza las modalidades continuas (imagen, vídeo, audio y acción) mediante denoising iterativo. Esta separación permite preservar el mecanismo de generación más adecuado para cada modalidad dentro de un único marco unificado.

Su relevancia actual radica en que unifica comprensión y generación multimodal con salida de acciones para políticas encarnadas, algo poco habitual en modelos abiertos de este tamaño. La licencia OpenMDW 1.1 permite uso comercial y no comercial, lo que facilita su adopción tanto en investigación como en productos. La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 15.750.057.456 (16B según model card) |
| Parametros activos | no disponible (no se describe como MoE disperso) |
| Longitud de contexto | 4096 tokens para entrada de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (librería cosmos; integración con diffusers, vLLM y SGLang) |

## Arquitectura y entrenamiento

Cosmos3-Nano se construye sobre el Cosmos Framework de NVIDIA con una arquitectura Mixture-of-Transformers que combina dos torres: una autorregresiva para generación de tokens discretos y una de difusión para generación continua multimodal. En inferencia, el texto se produce con decodificación autorregresiva estándar, mientras que imagen, vídeo, audio y acción se generan mediante denoising iterativo. El modelo está diseñado para aceptar entradas heterogéneas: texto (hasta 4096 tokens), imágenes y vídeos en 256p, 480p o 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16, vídeo de hasta 5 fotogramas, audio de hasta 0,5 segundos y trayectorias de acción de 16 a 400 fotogramas.

Las entradas de acción se definen como arrays 2D de forma (T, D), donde T es el número de fotogramas y D la dimensionalidad específica del embodiment. Se soportan embodiments concretos: movimiento de cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazo Franka Panda único con pinza RobotiQ (10D), doble Franka Panda con RobotiQ (20D), Agibot (29D), UR (10D), robot de Google (10D), WidowX 250 (10D) y UMI (9D). Las salidas incluyen imagen JPG, vídeo MP4, audio AAC estéreo a 48 kHz multiplexado en el MP4, acciones en JSON y texto. No se han publicado en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva con contexto de hasta 4096 tokens.
- Generación de imágenes en 256p, 480p y 720p con cinco relaciones de aspecto predefinidas.
- Generación de vídeo en 256p, 480p y 720p, con un máximo de 5 fotogramas por generación.
- Generación de audio estéreo a 48 kHz (AAC) de hasta 0,5 segundos, multiplexado en el vídeo de salida.
- Generación y predicción de trayectorias de acción para múltiples embodiments robóticos y de conducción autónoma.
- Comprensión multimodal conjunta de texto, imagen, vídeo, audio y acción como entradas combinadas.
- Simulación de mundo y predicción de futuros estados físicos a partir de observaciones y acciones.
- Razonamiento de acciones para políticas encarnadas (embodied policy learning).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Simulación de entornos para robótica: generar vídeos de futuros plausibles a partir de una observación y una trayectoria de acción, útil para entrenar políticas en bucle cerrado sin despliegue físico.
- Conducción autónoma: el modelo acepta acciones de vehículo autónomo en 9D y puede generar vídeo predictivo para validar planes de movimiento en escenarios sintéticos.
- Generación de datos sintéticos para entrenamiento: producir pares vídeo-acción y audio para aumentar datasets de manipulación con Franka Panda, Agibot, UR o WidowX 250.
- Prototipado de políticas encarnadas: usar la salida de acciones en JSON como referencia o inicialización en pipelines de aprendizaje por imitación.
- Previsualización de movimientos de cámara: con la entrada de movimiento de cámara general en 9D, generar clips coherentes para previsualización cinematográfica o de producto.
- Investigación en modelos de mundo: evaluar comprensión física y coherencia temporal con entradas multimodales controladas de hasta 5 fotogramas y audio corto.
- Generación multimodal de contenido corto: crear clips de vídeo con audio sincronizado y resolución hasta 720p para demostraciones o material de marketing técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 15.750 millones de parámetros en safetensors, el peso en precisión completa ronda los 31,5 GB (el repositorio ocupa 35 GB), por lo que se requiere al menos esa cantidad más overhead de activaciones y del pipeline de difusión.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, se sitúa en el rango de GPU de centro de datos tipo A100 o H100 para ejecución cómoda en precisión nativa.
- Viabilidad en GPU de consumo: no confirmada; sería necesario cuantizar o usar offloading, y no se documentan tipos de cuantización soportados.
- Opciones de despliegue: los tags del modelo mencionan vLLM, vLLM-Omni, SGLang, SGLang-Diffusion, diffusers y la librería cosmos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano | 15,75B | 4096 tokens (texto) | Texto, imagen, vídeo, audio, acción | OpenMDW 1.1 | Hugging Face (Infinity-io/Cosmos3-Nano) |
| Otros modelos de la familia Cosmos3 | no disponible | no disponible | no disponible | OpenMDW 1.1 | Colección nvidia/cosmos3 |
| Alternativas de modelos de mundo abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otras familias, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Ventana de texto limitada a 4096 tokens, reducida frente a modelos de lenguaje contemporáneos.
- Generación de vídeo limitada a un máximo de 5 fotogramas por salida, lo que restringe la duración de los clips.
- Audio de entrada limitado a 0,5 segundos y salida de audio corta, lo que limita casos de uso de audio largo.
- Solo se admiten entradas de imagen y vídeo en RGB de 8 bits (sRGB); no se soporta escala de grises.
- Las acciones solo son válidas para los embodiments listados; entradas fuera de esa lista no están soportadas.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas no puede verificarse.
- Riesgo de alucinación y de física inconsistente inherente a los modelos generativos de mundo; requiere validación en dominios críticos como conducción o robótica industrial.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia OpenMDW 1.1: permite uso comercial según la model card, pero conviene revisar los términos completos del enlace de licencia antes de producción.
- El repositorio aparece publicado por Infinity-io y no directamente por NVIDIA; verificar la procedencia y la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Infinity-io/Cosmos3-Nano
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
