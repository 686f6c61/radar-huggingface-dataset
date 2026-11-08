# sadmN/emotion-avatar-server

## Resumen

Emotion Avatar Server es un sistema de generación de vídeo de cabezas parlantes (talking-head) condicionado por emoción, desarrollado por el usuario sadmN y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre IMTalker y combina dos componentes: un generador de latentes de movimiento de 32 dimensiones basado en flow matching (38,8 M de parámetros, pesos `v35`) y un renderizador neuronal congelado que produce fotogramas de 512x512 píxeles. El modelo toma como entrada una imagen de referencia del avatar, un audio de voz y un guion de emociones, y genera vídeo con expresiones faciales moduladas fotograma a fotograma.

La relevancia del proyecto reside en su condicionamiento emocional granular: permite especificar qué emoción (`angry`, `disgust`, `fear`, `happy`, `neutral`, `sad`, `surprised`, además de `contempt`) y con qué intensidad (0 a 1) en cada instante del audio, con transiciones suavizadas mediante rampas de 15 fotogramas. El repositorio incluye scripts de generación offline y un servidor websocket en tiempo real, aunque este último depende de PersonaPlex (un LLM de voz de 7B con códec Mimi) que no forma parte del repositorio.

El repositorio ocupa 9,5 GB e incluye los pesos del generador, el renderizador, el codificador de audio wav2vec2-base-960h, una imagen de referencia y modelos estudiante destilados opcionales. Está etiquetado únicamente para inglés y su pipeline es `image-to-video`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador transformer de flow matching (latente de movimiento de 32-D) + renderizador neuronal congelado |
| Parámetros totales | 38,8 M (generador `v35`); renderizador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de audio wav2vec2 de 2,0 s (fija para estos pesos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch (`.ckpt`, `.pt`) |

## Arquitectura y entrenamiento

El generador es un transformer de flow matching que opera sobre una secuencia latente de 32 dimensiones a 25 fps, condicionada por características de audio extraídas con wav2vec2-base-960h. La emoción se inyecta por una rama de condicionamiento separada en dos puntos: una proyección de embedding a partir de un one-hot de 8 clases (más intensidad) que se suma a los tokens del transformer, y una modulación AdaLN/FiLM (`EmotionFiLM`) que genera parámetros `gamma/beta` por fotograma y por canal sobre el flujo residual. El condicionamiento es fotograma a fotograma, de modo que durante las transiciones el modelo recibe una mezcla suave del one-hot y de la intensidad interpolada. En inferencia se aplica classifier-free guidance entre la predicción condicionada y la nula (`e_cfg_scale`).

El renderizador de IMTalker está congelado y produce fotogramas de 512x512. El repositorio incluye además un renderizador destilado (`renderer_narrow.pt`), un estudiante causal destilado de 38 M (`motion_student_38M.pt`), un estudiante condicionado por emoción (`motion_student_emo.pt`), un helper de parpadeo (`blink_motion.pt`) y un prior de silencio (`silence_helium_mean.pt`). Los pesos `v35` se entrenaron sobre un conjunto con la línea de mirada fijada (eye-line-pinned). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo de cabeza parlante a partir de una imagen de referencia y un audio de voz.
- Condicionamiento por emoción con 8 clases (`angry`, `disgust`, `fear`, `happy`, `neutral`, `sad`, `surprised`, `contempt`) e intensidad continua de 0 a 1.
- Programación temporal de emociones mediante guion (`<emotion>@<start_seconds>:<intensity>`), con múltiples segmentos por clip.
- Transiciones suavizadas con rampa smoothstep de 15 fotogramas configurable (`--ramp_frames`).
- Control de deriva de cabeza en inferencia mediante `head_pin` (0 a 1).
- Suavizado gaussiano del latente temporal (`--latent_smooth`) para reducir jitter.
- Clasificación de texto de respuesta para modular la emoción en el servidor en tiempo real (según la model card).
- Servidor websocket conversacional en tiempo real (requiere PersonaPlex, no incluido).
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni visión más allá de la imagen de referencia.

## Casos de uso

- **Avatares para atención al cliente**: el servidor websocket permite enviar audio de micrófono desde el navegador, generar una respuesta hablada y renderizar el avatar con la emoción adecuada al texto de respuesta, manteniendo coherencia expresiva en conversaciones multi-turno.
- **Generación de vídeo explicativo con matices emocionales**: con el script offline se puede producir un clip donde el avatar pase de `neutral` a `happy` y luego a `surprised` en momentos concretos del audio, útil para material formativo o divulgativo.
- **Doblaje y localización de contenido**: dado un audio en inglés y una imagen del presentador, se genera vídeo sincronizado con expresiones programadas, lo que permite reutilizar un mismo avatar para distintas piezas audiovisuales.
- **Prototipado de asistentes virtuales**: el estudiante causal destilado (`motion_student_38M.pt`) y el condicionado por emoción permiten probar rutas de baja latencia antes de desplegar el generador completo.
- **Investigación en expresión facial sintética**: la separación entre clase e intensidad, junto con los parámetros `e_cfg_scale` y `head_pin`, facilita experimentos controlados sobre percepción emocional en avatares.
- **Pruebas de accesibilidad y UX**: generar variantes del mismo clip con las 7 emociones principales sobre el mismo audio (el ejemplo del bucle `for e in angry disgust fear happy neutral sad surprised`) permite evaluar cómo afecta la expresión a la comprensión del mensaje.
- **Integración en pipelines de vídeo bajo demanda**: los scripts de shell (`generate_video.sh`) permiten automatizar la producción por lotes de clips con guiones emocionales predefinidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU CUDA con al menos 8 GB de VRAM para renderizado offline.
- GPU CUDA con al menos 20 GB de VRAM para el servidor en tiempo real (que además requiere los pesos de PersonaPlex, no incluidos).
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- El repositorio ocupa 9,5 GB, por lo que se necesita espacio en disco suficiente para pesos y entorno virtual.
- Entorno: Linux o Windows, Python 3.10 o superior, instalación mediante `scripts/setup_env.sh`.
- Opciones de despliegue documentadas: scripts de shell propios (`generate_video.sh`, `run_server.sh`) y servidor websocket; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo offline usa 10 pasos ODE por defecto (`--nfe 10`); con 7 pasos se obtiene una ejecución más rápida y un resultado ligeramente más suave.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emotion Avatar Server (sadmN) | Talking-head audio-driven con condicionamiento emocional | 38,8 M (generador) | Ventana de audio de 2,0 s; 512x512 | Apache 2.0 | Hugging Face |
| Synthesia Expressive Avatars | Avatares comerciales con expresión emocional | No disponible | No disponible | Propietaria | Servicio comercial |
| IMTalker (base) | Talking-head audio-driven | No disponible | No disponible | No disponible en la información | Referenciado como base del renderizador |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El checkpoint `v35` cierra los labios casi por completo con la emoción `neutral`; para habla se recomienda usar `happy` con intensidad 0,22-0,30 como "neutral hablado" (el servidor en vivo lo hace automáticamente con `--neutral_as_happy 1`).
- Las intensidades por encima de 0,8 saturan y pueden distorsionar la expresión; el rango natural es 0,30-0,55 y el expresivo 0,6-0,75.
- La ventana de wav2vec2 debe mantenerse en 2,0 s para estos pesos; cambiarla puede degradar el resultado.
- Solo se declara soporte de inglés.
- La deriva residual de la cabeza es un comportamiento aprendido, no una entrada de condicionamiento; se mitiga con `head_pin`, no se elimina por completo.
- El servidor conversacional en tiempo real depende de PersonaPlex (LLM de voz de 7B + códec Mimi), que no está incluido en el repositorio y debe obtenerse por separado mediante variables de entorno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se documentan sesgos, tasas de alucinación ni evaluación de calidad perceptual en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los componentes de terceros (IMTalker, wav2vec2, PersonaPlex) antes de un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sadmN/emotion-avatar-server
- Guía de modelos de avatar (HyScaler): https://hyscaler.com/insights/ai-avatar-models-complete-guide/
- Artículo sobre Synthesia Expressive Avatars (Quartz): https://qz.com/synthesia-introduces-ai-avatars-human-expression-nvidia-1851434555
