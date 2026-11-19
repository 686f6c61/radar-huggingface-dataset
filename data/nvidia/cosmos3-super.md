# nvidia/Cosmos3-Super

## Resumen

Cosmos3-Super es un modelo fundacional omnimodal desarrollado por NVIDIA dentro de la plataforma Cosmos, orientada a Physical AI (robótica, conducción autónoma y entornos industriales). Con 64.615.003.632 parámetros (~64B) y un repositorio de 202,2 GB en safetensors, el modelo es capaz de tomar combinaciones de texto, imagen, vídeo (con o sin audio) y trayectorias de acción, y producir texto, imágenes, vídeo, audio y comandos de acción coherentes.

A diferencia de un LLM convencional, Cosmos3-Super se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una transformer autorregresiva para generación de tokens discretos (texto) y una transformer de difusión para generación multimodal continua (imagen, vídeo, audio y acción). Esta separación permite modelar modalidades heterogéneas dentro de un mismo marco preservando el mecanismo de generación más adecuado para cada una.

El modelo es relevante ahora porque unifica en una sola pieza generación y comprensión del mundo físico: simulación de entornos, predicción de futuros, razonamiento sobre acciones y aprendizaje de políticas encarnadas. Se publica bajo licencia OpenMDW 1.1, con pesos en safetensors y soporte declarado para vLLM, SGLang y Diffusers, lo que facilita su despliegue en infraestructura NVIDIA (Azure, SageMaker).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 64.615.003.632 (~64B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (entrada de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |
| Libreria | cosmos |
| Tamano del repositorio | 202,2 GB |
| Modalidades de entrada | texto, imagen, video (con/sin audio), trayectoria de accion |
| Modalidades de salida | texto, imagen, video, audio, accion |
| Resoluciones de imagen/video | 256p, 480p, 720p; ratios 16:9, 4:3, 1:1, 3:4, 9:16 |
| Limite de video | maximo 5 frames |
| Limite de audio de entrada | maximo 0,5 s (estereo, 48 kHz) |
| Rango de accion | 16 a 400 frames de video |
| Formatos de salida | JPG (imagen), MP4 (video), AAC estereo 48 kHz (audio muxado en MP4), JSON (accion), string (texto) |

## Arquitectura y entrenamiento

Cosmos3-Super emplea una arquitectura Mixture-of-Transformers (MoT) compuesta por dos torres: una transformer autorregresiva que genera tokens discretos mediante decodificación estándar next-token (empleada para el texto) y una transformer de difusión que sintetiza las modalidades continuas (imagen, vídeo, audio y acción) mediante denoising iterativo. Esta separación híbrida permite que cada modalidad use el paradigma generativo que mejor le corresponde dentro de un único marco unificado.

El modelo se desarrolló sobre el Cosmos Framework de NVIDIA y se posiciona como un world foundation model para Physical AI: comprender, simular e interactuar con el mundo físico. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia arquitectura MoT. El modelo está declarado como listo para uso comercial y no comercial.

## Capacidades

- Generación de texto autorregresiva a partir de entradas multimodales (texto, imagen, vídeo, audio, acción).
- Generación de imagen en resoluciones 256p, 480p y 720p con ratios 16:9, 4:3, 1:1, 3:4 y 9:16.
- Generación de vídeo en MP4 con resolución, frame rate y duración especificados en la entrada (máximo 5 frames de entrada).
- Generación de audio en AAC estéreo a 48 kHz, muxado dentro del MP4 de vídeo.
- Generación y predicción de trayectorias de acción (JSON, lista 1D) para razonamiento de acciones y políticas encarnadas.
- Comprensión multimodal: interpretación conjunta de texto, imagen, vídeo y audio.
- Simulación de mundo y predicción de futuros a partir de estados y trayectorias.
- Soporte de múltiples "embodiments" para acción: cámara general (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazo Franka Panda simple con pinza RobotiQ (10D), doble Franka Panda (20D), Agibot (29D), UR (10D), Google robot (10D), WidowX 250 (10D) y UMI (9D).
- Soporte declarado de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Simulación de entornos robóticos: dado un estado inicial (imagen o vídeo) y una trayectoria de acción, el modelo genera el vídeo del resultado esperado, lo que permite validar políticas antes de ejecutarlas en hardware real.
- Predicción de futuros para conducción autónoma: con entradas de vídeo a 720p y acciones de vehículo (9D), el modelo puede generar escenarios contrafactuales para evaluar la robustez de un planificador.
- Generación de datos sintéticos de entrenamiento: creación de pares imagen/vídeo/audio etiquetados para aumentar datasets de robótica, especialmente en embodiments con pocos datos reales (WidowX, UR, Franka).
- Aprendizaje de políticas encarnadas: uso del modelo como base para imitación o RL, aprovechando su capacidad de razonar sobre acciones y generar trayectorias coherentes con el estado observado.
- Prototipado de interacción audio-visual: generación de clips MP4 con audio estéreo 48 kHz muxado para demos de asistentes físicos o robots sociales.
- Investigación en world models: evaluación de coherencia física y consistencia temporal de escenas generadas, comparando predicciones del modelo con grabaciones reales.
- Diseño de espacios inteligentes e industriales: simulación de escenarios de fábrica a partir de imágenes y acciones de cámara para planificación de layouts y análisis de flujos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 64B parámetros en safetensors, una estimación orientativa en BF16 sería de ~128 GB solo para pesos, más overhead de activaciones y del pipeline de difusión; no se confirma en la documentación.
- GPU recomendadas: no se especifican modelos concretos. El modelo declara despliegue en Azure y SageMaker y soporte para vLLM, SGLang y Diffusers, lo que sugiere GPUs de centro de datos (familia A100/H100) para inferencia práctica.
- ¿Cabe en GPU consumer?: no disponible. Por tamaño (64B) y por el repositorio de 202,2 GB, no es esperable que quepa en GPUs consumer de 24 GB sin cuantización agresiva, y no se documentan recetas de cuantización.
- Opciones de despliegue: vLLM (vllm-omni), SGLang (sglang-diffusion), Diffusers, librería cosmos, Azure, SageMaker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super (NVIDIA) | ~64B | 4096 tokens (texto) | texto, imagen, video, audio, accion | OpenMDW 1.1 | Hugging Face, GitHub |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (world models omnimodales) en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; como modelo generativo multimodal, puede producir contenido físicamente inconsistente en vídeo, audio o acciones, especialmente fuera de los embodiments soportados.
- Límites de contexto y modalidad: el texto de entrada está limitado a 4096 tokens, el vídeo de entrada a un máximo de 5 frames, el audio de entrada a 0,5 s y la acción a un rango de 16 a 400 frames. Estas restricciones limitan tareas de contexto largo o vídeos extensos.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Formatos de entrada: solo se admite RGB de 8 bits por canal en sRGB; no se soporta escala de grises.
- Audio: la entrada debe ser estéreo a 48 kHz; no se documenta soporte mono u otras frecuencias.
- Acción: solo se admiten los embodiments listados explícitamente; otros robots o dimensiones no están cubiertos.
- Licencia: OpenMDW 1.1 permite uso comercial y no comercial según la model card, pero conviene revisar el texto completo de la licencia para obligaciones de atribución y redistribución.
- Producción: no se publican benchmarks, latencias ni recetas de cuantización, por lo que la evaluación de rendimiento en producción debe hacerse de forma empírica.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- NVIDIA: https://www.nvidia.com/
