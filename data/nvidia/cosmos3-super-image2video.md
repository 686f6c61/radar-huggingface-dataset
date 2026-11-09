# nvidia/Cosmos3-Super-Image2Video

## Resumen

Cosmos3-Super-Image2Video es un modelo generativo de imagen a vídeo desarrollado por NVIDIA dentro de la familia Cosmos 3, una plataforma de "world foundation models" orientada a Physical AI: robótica, conducción autónoma y entornos industriales o de fábrica. El checkpoint es una variante post-entrenada del modelo base Cosmos3-Super y su tarea específica es generar secuencias de vídeo temporalmente coherentes a partir de una imagen de entrada y una instrucción de texto, manteniendo la consistencia con el contenido visual proporcionado.

Con 64.593.195.440 parámetros (aproximadamente 64B) y un repositorio de 196,2 GB en safetensors, se trata de un modelo de gran escala. La arquitectura subyacente es un Mixture-of-Transformers (MoT) que combina una torre autorregresiva para generación de tokens discretos con una torre de difusión para generación multimodal continua (imagen, vídeo, audio y acciones). Esta separación permite modelar modalidades heterogéneas dentro de un mismo marco preservando el mecanismo de generación más adecuado para cada una.

Su relevancia actual radica en que NVIDIA lo publica bajo la licencia OpenMDW 1.1, lista para uso comercial y no comercial, y con soporte declarado en el ecosistema de despliegue (vLLM-omni, SGLang, SGLang-Diffusion y diffusers). El modelo está pensado como bloque fundacional para investigación y aplicaciones de simulación y generación de mundo, no como un generador de vídeo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 64.593.195.440 (~64B) |
| Parametros activos | no disponible (no se declara como MoE disperso) |
| Longitud de contexto | 4096 tokens de texto; vídeo de entrada de hasta 5 frames |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos |
| Pipeline | image-to-video |
| Tamano del repositorio | 196,2 GB |
| Resoluciones de entrada | 256p, 480p, 720p (16:9, 4:3, 1:1, 3:4, 9:16) |
| Salida | MP4 (video), AAC muxado, JPG, JSON de acciones, texto |
| Fecha de publicacion | 31/05/2026 |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers con dos torres complementarias. La primera es un transformer autorregresivo que genera tokens discretos mediante decodificación estándar de siguiente token; la segunda es un diffusion transformer que sintetiza modalidades continuas (imagen, vídeo, audio y acciones) mediante denoising iterativo. En inferencia, el texto se produce por decodificación autorregresiva y el resto de modalidades por difusión, lo que permite unificar el modelado de modalidades heterogéneas en un único marco sin forzar un mecanismo de generación único.

El modelo se desarrolla sobre el Cosmos Framework y este checkpoint concreto es un post-entrenamiento del modelo base Cosmos3-Super para la tarea de imagen a vídeo. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. El modelo acepta entradas multimodales (texto, imagen, vídeo con o sin audio, y trayectorias de acción en JSON) y está diseñado para generar también acciones y audio, aunque esta variante se especializa en la generación de vídeo a partir de imagen.

## Capacidades

- Generación de vídeo a partir de una imagen y una instrucción de texto, con coherencia temporal y consistencia con el contenido visual de entrada.
- Generación de vídeo en resoluciones de 256p, 480p y 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.
- Generación de audio muxado en el MP4 de salida (flujo AAC), con entrada de audio estéreo a 48 kHz cuando se proporciona vídeo con audio.
- Generación de acciones (listas 1D en JSON) para embodimentos compatibles: cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google Robot (10D), WidowX 250 (10D) y UMI (9D).
- Entrada multimodal combinada: texto, imagen, vídeo (con o sin audio) y trayectorias de acción.
- Procesamiento de vídeo de entrada de hasta 5 frames y audio de hasta 0,5 segundos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio como capacidades especiales: no disponible en la información proporcionada (sí se declara generación de audio y acciones, no comprensión).

## Casos de uso

- Simulación de entornos robóticos: a partir de una imagen de una escena y una instrucción textual, generar secuencias de vídeo que simulen la evolución de esa escena, útil para entrenar políticas de manipulación sin necesidad de capturar datos reales en cada variación.
- Generación de datos sintéticos para conducción autónoma: introducir una imagen de cámara y una trayectoria de acción de vehículo autónomo (9D) para producir vídeo con movimiento de cámara coherente, ampliando datasets de percepción con escenarios controlados.
- Prototipado de políticas encarnadas: usar la salida de acciones en JSON para alimentar pipelines de aprendizaje por imitación en brazos Franka Panda, Agibot o UR, con la ventaja de disponer de vídeo y acción alineados en la misma generación.
- Previsualización de escenas industriales o de fábrica: generar vídeos de 256p–720p a partir de una imagen de planta o célula robotizada para validar disposiciones y flujos antes de la implementación física.
- Investigación en world models: emplear el checkpoint como base para estudiar la coherencia temporal y la consistencia física de vídeos generados, dado su diseño MoT con torre de difusión dedicada.
- Creación de contenido técnico y demostraciones: producir clips MP4 con audio muxado a partir de una imagen de referencia para documentación de producto, demos de robótica o material de presentación.
- Evaluación de embodimentos: comparar la calidad de generación de acciones entre las distintas dimensionalidades soportadas (9D, 10D, 20D, 29D, 57D) para seleccionar la configuración adecuada en un proyecto de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 64,6B parámetros y pesos en safetensors de 196,2 GB, la inferencia en precisión completa requiere un entorno multi-GPU de gama alta; no se especifican cifras oficiales de VRAM ni cuantizaciones soportadas.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del checkpoint, se sitúa en el rango de GPU de centro de datos (A100, H100) o clústeres multi-GPU; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en consumer GPU?: no disponible. No se documenta ninguna cuantización (GGUF, FP8, INT4) que permita reducir el modelo a memoria de una RTX 4090 u otras GPUs de consumo.
- Opciones de despliegue: los tags del repositorio indican soporte para vLLM-omni, SGLang, SGLang-Diffusion y diffusers, además de la librería cosmos. No se detallan configuraciones de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría (generación de vídeo imagen-a-vídeo o world models). Los datos disponibles del modelo son: 64,6B parámetros, arquitectura MoT, licencia OpenMDW 1.1, formatos safetensors y salida MP4, con soporte de audio y acciones. Cualquier comparación con otros modelos de vídeo generativo requeriría datos de rendimiento que aquí no se aportan.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo entrenado para Physical AI, puede heredar sesgos de los datasets de robótica y conducción empleados, pero no se documentan.
- Riesgo de alucinación: no disponible de forma explícita; en generación de vídeo, el riesgo se traduce en inconsistencias físicas o temporales respecto a la imagen de entrada, no cuantificadas en la información.
- Limitaciones de contexto e idioma: la entrada de texto está limitada a 4096 tokens; la entrada de vídeo a un máximo de 5 frames y el audio de entrada a 0,5 segundos. No se especifican los idiomas soportados.
- Restricciones de licencia: la licencia OpenMDW 1.1 permite uso comercial y no comercial según la model card, pero conviene revisar los términos completos en el enlace oficial antes de un despliegue en producción.
- Caveats para producción: el tamaño del repositorio (196,2 GB) y la ausencia de cuantizaciones documentadas complican el despliegue en infraestructura limitada; además, la entrada de imagen y vídeo debe ser RGB de 8 bits en sRGB (no se admite escala de grises), y las acciones solo son válidas para los embodimentos listados.
- La información sobre benchmarks, latencia y requisitos de hardware es inexistente en la documentación disponible, lo que impide garantizar un rendimiento concreto en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-Image2Video
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
