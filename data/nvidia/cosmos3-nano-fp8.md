# nvidia/Cosmos3-Nano-FP8

## Resumen

Cosmos3-Nano-FP8 es una variante cuantizada en FP8 del modelo base Cosmos3-Nano, desarrollado por NVIDIA dentro de su plataforma de world foundation models Cosmos. Se trata de un modelo omnímodo de 16 000 millones de parámetros (15 750 057 456 segun los pesos en safetensors) disenado para Physical AI: robótica, conducción autónoma y entornos industriales o de espacios inteligentes. El modelo acepta combinaciones de texto, imagen, vídeo, audio y trayectorias de acción, y genera salidas en todas esas modalidades.

La relevancia actual del modelo radica en su enfoque unificado: en lugar de encadenar modelos separados para cada modalidad, Cosmos3 emplea una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias, una autorregresiva para tokens discretos y otra de difusión para modalidades continuas. Esto permite simular el mundo físico, predecir futuros y razonar sobre acciones dentro de un único marco, algo especialmente útil para el entrenamiento de políticas encarnadas y la simulación de entornos realistas.

La variante FP8 mantiene la arquitectura y las aplicaciones previstas del modelo base, aplicando cuantización de 8 bits a componentes seleccionados para reducir los requisitos de memoria y acelerar la inferencia. El modelo se distribuye con licencia OpenMDW 1.1 y está pensado tanto para uso comercial como no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 15 750 057 456 (16B segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (entrada de texto) |
| Tipos de cuantizacion | FP8 (variante cuantizada del modelo base Cosmos3-Nano) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos (compatible con diffusers, vLLM, vLLM-Omni, SGLang, SGLang-Diffusion) |
| Tamano del repositorio | 21,1 GB |
| Fecha de publicacion | 11/09/2026 |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) compuesta por dos torres transformer complementarias. La primera es una torre autorregresiva encargada de la generación de tokens discretos, utilizada para producir texto mediante decodificación estándar de siguiente token. La segunda es una torre de difusión que sintetiza las modalidades continuas (imagen, vídeo, audio y acciones) mediante denoising iterativo. Esta separación permite que cada modalidad se genere con el mecanismo más adecuado sin renunciar a un marco unificado.

El modelo se desarrolló a partir del Cosmos Framework de NVIDIA. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. La variante FP8 aplica cuantización de 8 bits a componentes seleccionados del modelo base, conservando la arquitectura y las aplicaciones previstas.

## Capacidades

- Generación de texto mediante decodificación autorregresiva estándar.
- Generación de imágenes en resoluciones de 256p, 480p y 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.
- Generación de vídeo en las mismas resoluciones y relaciones de aspecto, con un máximo de 5 fotogramas por salida.
- Generación de audio de hasta 0,5 segundos, con salida AAC multiplexada en el MP4.
- Generación de comandos de acción como listas 1D en formato JSON, para trayectorias de 16 a 400 fotogramas.
- Comprensión y generación multimodal combinando texto, imagen, vídeo, audio y trayectorias de acción como entrada.
- Soporte de embodiment específicos para acciones: movimiento de cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazo Franka Panda único con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), robot de Google (10D), WidowX 250 (10D) y UMI (9D).
- Simulación de mundo, predicción de futuro y razonamiento sobre acciones para aplicaciones de Physical AI.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Simulación de entornos robóticos: el modelo puede generar secuencias de vídeo y acciones coherentes a partir de una trayectoria de entrada, lo que permite simular el comportamiento de un brazo Franka Panda o un robot Agibot antes de desplegar la política en hardware real.
- Predicción de futuros en conducción autónoma: dado un vídeo de entrada y una trayectoria de vehículo (9D), el modelo genera fotogramas futuros y comandos de acción, útil para validar planes de movimiento en escenarios simulados.
- Generación de datos sintéticos para entrenamiento de políticas: a partir de texto e imágenes, se pueden producir vídeos y trayectorias de acción etiquetadas que amplíen datasets de robótica sin necesidad de capturas reales costosas.
- Prototipado de interfaces multimodal: el modelo acepta texto, imagen, vídeo y audio y devuelve salidas en todas esas modalidades, lo que facilita la creación de demos interactivas para investigación en percepción y control.
- Análisis de escenas industriales: con entradas de vídeo de 720p y audio estéreo a 48 kHz, el modelo puede generar descripciones textuales y predicciones de acción para tareas de inspección en fábrica.
- Investigación en world models: la arquitectura MoT y la licencia OpenMDW 1.1 permiten usar el modelo como base para experimentos académicos sobre representación del mundo físico y generación multimodal.
- Evaluación de políticas encarnadas: las trayectorias de acción generadas en formato JSON pueden compararse con políticas de referencia para medir la coherencia física de los planes propuestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 21,1 GB en safetensors con cuantización FP8, por lo que se requiere al menos esa cantidad de memoria, más overhead para activaciones y buffers de difusión. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño y la cuantización FP8, son razonables GPUs de centro de datos con soporte FP8 nativo (por ejemplo, familias Hopper o Blackwell de NVIDIA), pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de 16B en FP8 no cabe en GPUs de consumo con 8-12 GB; podría requerir GPUs de 24 GB o más, pero no se especifica.
- Opciones de despliegue: el modelo declara compatibilidad con vLLM, vLLM-Omni, SGLang, SGLang-Diffusion y diffusers. No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-FP8 | 16B | 4096 tokens (texto) | Texto, imagen, vídeo, audio, acción | OpenMDW 1.1 | Hugging Face, GitHub |
| Cosmos3-Nano (base) | 16B | 4096 tokens (texto) | Texto, imagen, vídeo, audio, acción | OpenMDW 1.1 | Hugging Face, GitHub |
| Alternativas de world models | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo genera contenido sintético que puede no ser físicamente preciso; no debe usarse como única fuente de verdad en sistemas de control reales sin validación adicional.
- Riesgo de alucinación en las salidas de texto y en la interpretación de escenas; la coherencia multimodal no está garantizada en todos los casos.
- Límites de entrada estrictos: texto de 4096 tokens, vídeo de máximo 5 fotogramas, audio de máximo 0,5 segundos y acciones de 16 a 400 fotogramas. Estas restricciones limitan aplicaciones que requieran secuencias largas.
- Solo se admiten entradas de imagen y vídeo en color RGB de 8 bits por canal (sRGB); no se soportan entradas en escala de grises.
- El audio de entrada debe tener 2 canales (estéreo) y 48 kHz de frecuencia de muestreo.
- Las acciones solo son compatibles con los embodiment listados; no se garantiza generalización a otras morfologías.
- No se especifican los idiomas soportados, lo que impide evaluar el rendimiento multilingüe.
- La licencia OpenMDW 1.1 permite uso comercial según la model card, pero conviene revisar los términos completos para obligaciones de atribución y restricciones adicionales.
- No se han publicado benchmarks en la información disponible, por lo que no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-FP8
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
