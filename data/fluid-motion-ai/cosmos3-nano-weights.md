# Fluid-Motion-AI/cosmos3-nano-weights

## Resumen

Cosmos3-Nano es un modelo fundacional "omnimodal" de tipo world model desarrollado por NVIDIA, orientado a aplicaciones de Physical AI: robótica, conducción autónoma y entornos industriales o de fábrica. El modelo es capaz de tomar combinaciones de texto, imagen, vídeo, audio y trayectorias de acción como entrada, y generar texto, imágenes, vídeo, audio y comandos de acción como salida, todo dentro de un único marco arquitectónico.

La arquitectura se basa en un Mixture-of-Transformers (MoT) con dos torres complementarias: una torre autorregresiva que genera tokens discretos (texto) mediante decodificación next-token estándar, y una torre de difusión que sintetiza las modalidades continuas (imagen, vídeo, audio y acciones) mediante denoising iterativo. Esta separación permite preservar el mecanismo de generación más adecuado para cada modalidad sin renunciar a un modelado unificado.

El modelo cuenta con aproximadamente 16 000 millones de parámetros (15 750 057 456 según los pesos en safetensors) y se distribuye bajo licencia OpenMDW1.1, con uso comercial y no comercial permitido. Esta ficha documenta la copia de pesos publicada por el usuario Fluid-Motion-AI en Hugging Face, derivada del modelo original `nvidia/Cosmos3-Nano`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 15 750 057 456 (~16B) |
| Parametros activos | no disponible (no es un MoE clásico; MoT con dos torres) |
| Longitud de contexto | 4096 tokens (texto); vídeo hasta 400 frames; audio hasta 0,5 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (librería `cosmos`, integración con `diffusers`) |

## Arquitectura y entrenamiento

Cosmos3-Nano emplea una arquitectura Mixture-of-Transformers (MoT) compuesta por dos torres: una autorregresiva para la generación de tokens discretos (texto) y una torre de difusión para la generación de modalidades continuas (imagen, vídeo, audio y acciones). En inferencia, el texto se produce mediante decodificación autorregresiva convencional, mientras que las modalidades no textuales se sintetizan mediante denoising iterativo. El modelo se construye sobre el Cosmos Framework de NVIDIA.

El modelo acepta entradas multimodales con formatos y restricciones concretas: texto en cadenas de hasta 4096 tokens; imágenes en resoluciones 256p, 480p y 720p con relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16; vídeo en las mismas resoluciones con un máximo de 5 frames de entrada; audio de hasta 0,5 segundos (estéreo, 48 kHz); y trayectorias de acción como arrays 2D de forma (T, D) con dimensionalidades específicas por embodiment (9D para movimiento de cámara y vehículo autónomo, 10D para brazo Franka Panda simple, 20D para doble Franka Panda, 29D para Agibot, 57D para movimiento egocéntrico, entre otros). En la generación de salida, el vídeo admite de 5 a 400 frames (189 por defecto), con audio AAC estéreo a 48 kHz multiplexado en el MP4.

No se ha proporcionado información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto mediante decodificación autorregresiva estándar.
- Generación de imágenes en resoluciones 256p, 480p y 720p con múltiples relaciones de aspecto.
- Generación de vídeo de 5 a 400 frames (189 por defecto) en 256p, 480p y 720p.
- Generación de audio estéreo a 48 kHz multiplexado en el vídeo de salida.
- Generación de comandos de acción (trayectorias) para múltiples embodiments robóticos y de conducción.
- Comprensión multimodal conjunta de texto, imagen, vídeo, audio y acción.
- Simulación de mundo (world simulation) y predicción de futuros estados físicos.
- Razonamiento sobre acciones (action reasoning) para políticas encarnadas.
- Soporte de múltiples backends de despliegue: vLLM (`vllm-omni`), SGLang (`sglang-diffusion`) y `diffusers`.

## Casos de uso

- Simulación de entornos para robótica: el modelo puede generar vídeo y estados futuros a partir de una trayectoria de acción y una observación inicial, lo que permite entrenar políticas en simulación antes de transferirlas a hardware real, aprovechando la dimensionalidad específica por embodiment (Franka Panda, Agibot, UR, WidowX 250, UMI, entre otros).
- Conducción autónoma: con entradas de vídeo y trayectorias de acción de vehículo (9D), el modelo puede predecir escenarios de tráfico y generar vídeo sintético de validación para pruebas de percepción y planificación.
- Generación de datos sintéticos para entrenamiento: producción de pares vídeo-audio-acción coherentes que amplíen datasets escasos en dominios industriales o de fábrica, donde la captura real es costosa.
- Prototipado de políticas encarnadas: uso del modelo como generador de acciones condicionado a instrucciones en lenguaje natural e imágenes, útil para evaluar rápidamente estrategias de control antes de un despliegue completo.
- Investigación en world models: plataforma para estudiar la coherencia entre modalidades y la calidad de la predicción física a largo plazo, con ventanas de hasta 400 frames.
- Generación de contenido audiovisual físico-plausible: creación de clips MP4 con audio estéreo sincronizado para demostraciones, documentación técnica o materiales de formación en robótica.
- Evaluación de robustez perceptiva: alimentar el modelo con vídeo a distintas resoluciones (256p, 480p, 720p) y relaciones de aspecto para medir cómo degrada la predicción de acciones según la calidad de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~15,75B parámetros en safetensors, los pesos en precisión nativa (probablemente bf16/fp16) ocuparían en torno a 31,5 GB; el repositorio completo pesa 35 GB. En cuantizaciones de 8 bits cabría esperar ~16 GB y en 4 bits ~8 GB, aunque no se confirman formatos GGUF ni cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, se requerirían GPUs de centro de datos (A100 80 GB, H100) para ejecución en precisión completa; en consumer GPU solo sería viable con cuantización agresiva, y no se documenta soporte.
- ¿Cabe en consumer GPU?: no confirmado. En teoría, con cuantización a 4-8 bits podría intentarse en GPUs de 24 GB (RTX 4090) o 16 GB, pero no hay datos oficiales de viabilidad ni de calidad resultante.
- Opciones de despliegue: vLLM (`vllm-omni`), SGLang (`sglang-diffusion`), `diffusers` y la librería `cosmos`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cosmos3-Nano (esta ficha) | ~16B | 4096 tokens texto; vídeo hasta 400 frames; audio 0,5 s; acción multi-embodiment | OpenMDW1.1 | Hugging Face (`nvidia/Cosmos3-Nano` y copia `Fluid-Motion-AI/cosmos3-nano-weights`) |
| Cosmos3 (otras variantes de la colección) | no disponible | no disponible | OpenMDW1.1 | Colección `nvidia/cosmos3` en Hugging Face |
| Alternativas de world models para Physical AI | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos alternativos concretos de la misma categoría (por ejemplo, otros world models de NVIDIA o de terceros). La comparativa se limita a las variantes de la propia familia Cosmos3.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado para Physical AI, puede reflejar sesgos de los datasets de robótica y conducción empleados.
- Riesgo de alucinación: presente en la generación de texto y en la predicción de futuros físicos; las trayectorias de acción generadas deben validarse antes de su uso en sistemas reales.
- Limitaciones de contexto: el texto de entrada está limitado a 4096 tokens; el vídeo de entrada a un máximo de 5 frames; el audio de entrada a 0,5 segundos. La generación de vídeo admite de 5 a 400 frames, lo que restringe escenarios de muy larga duración.
- Restricciones de formato: solo se admiten entradas RGB de 8 bits en sRGB (no se soporta escala de grises); el audio debe ser estéreo a 48 kHz; las acciones solo se aceptan para los embodiments listados explícitamente.
- Licencia: OpenMDW1.1 permite uso comercial y no comercial según la model card, pero conviene revisar los términos completos en el enlace oficial antes de un despliegue en producción.
- Esta ficha documenta una copia de pesos publicada por un tercero (`Fluid-Motion-AI`), no el repositorio oficial de NVIDIA; para producción se recomienda verificar la integridad y procedencia frente a `nvidia/Cosmos3-Nano`.
- No se han publicado datos de benchmarks, cuantizaciones soportadas ni requisitos de hardware oficiales, lo que dificulta la planificación de capacidad.

## Enlaces

- Hugging Face (copia Fluid-Motion-AI): https://huggingface.co/Fluid-Motion-AI/cosmos3-nano-weights
- Hugging Face (modelo oficial NVIDIA): https://huggingface.co/nvidia/Cosmos3-Nano
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Repositorio de código: https://github.com/nvidia/cosmos
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- Perfil del autor de la copia: https://huggingface.co/Fluid-Motion-AI/models
