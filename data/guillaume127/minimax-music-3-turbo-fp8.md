# guillaume127/MiniMax-Music-3-Turbo-FP8

## Resumen

MiniMax Music 3 Turbo FP8 es una versión optimizada por la comunidad del modelo de generación musical MiniMax Music 3, desarrollada por el usuario guillaume127. El modelo original de MiniMax es un sistema de texto a audio de pesos abiertos capaz de generar canciones completas a partir de letras y dirección musical detallada. Esta variante comunitaria convierte los pesos del text encoder y del DiT a precisión FP8 (`torch.float8_e4m3fn`) y añade una LoRA de destilación de pasos que reduce el muestreo de difusión de decenas de pasos a solo 8-10, lo que acelera drásticamente la generación local en GPUs NVIDIA RTX.

El repositorio está diseñado específicamente para su integración en ComfyUI, con los tres componentes (text encoder, DiT y LoRA) listos para colocarse en sus carpetas correspondientes. Según los datos publicados, la pila completa (FP8 + LoRA Turbo de 8 pasos + SageAttention) reduce el tiempo de generación de una canción de 190 segundos de unos 895 segundos (~15 minutos) a aproximadamente 245 segundos (~4 minutos) en una RTX 4090, con un consumo de VRAM de ~11,5 GB. La licencia es Apache 2.0, lo que permite uso comercial, y los idiomas soportados son inglés, francés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con Flow Matching, text encoder independiente |
| Parámetros totales | No disponible (text encoder FP8: 8,48 GB; DiT FP8: 2,46 GB) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el text encoder admite prompts de letras y dirección musical) |
| Tipos de cuantización | FP8 (`torch.float8_e4m3fn`) en text encoder y DiT; capas sensibles en BF16/FP16; LoRA en BF16 |
| Idiomas soportados | Inglés (en), francés (fr), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (text encoder, DiT y LoRA por separado) |

## Arquitectura y entrenamiento

El modelo base MiniMax Music 3 emplea una arquitectura de DiT (Diffusion Transformer) con Flow Matching para la generación de audio, acompañada de un text encoder independiente que procesa las letras y las instrucciones musicales. El text encoder convertido a FP8 mantiene 166 capas sensibles (audio decoder heads, RMSNorms y token embeddings) en BF16 de alta precisión para evitar anomalías de tono y paradas tempranas. El DiT FP8 convierte 150 matrices de pesos 2D a FP8 mientras conserva 224 parámetros de modulación/normalización en FP16.

La LoRA Turbo de 8 pasos se entrenó mediante Consistency Flow-Matching y Mean Flow Distillation sobre 144 matrices de proyección de atención y MLP, con 20.000 pasos de entrenamiento y programación de calentamiento coseno en una RTX 4090. El resultado es un modelo que alcanza calidad de estudio con solo 8-12 pasos de muestreo en lugar de los pasos necesarios en el modelo base, con una fuerza de LoRA recomendada de 0,85 para equilibrar velocidad y fidelidad de voces.

## Capacidades

- Generación de canciones completas (hasta 190 segundos) a partir de letras y descripción musical en inglés, francés o chino.
- Control de duración del audio mediante el parámetro `max_duration` en el nodo de text encoding.
- Generación de voz cantada con formantes claros, dicción y percusión de alta frecuencia, según la documentación del autor.
- Compatibilidad con ComfyUI mediante nodos estándar (Load Diffusion Model, Load LoRA, KSampler) y parcheo de SageAttention para acelerar la atención.
- Inferencia local en GPU NVIDIA RTX con cuantización FP8 para reducir VRAM y acelerar el muestreo.
- Ajuste fino de calidad mediante pasos de muestreo (8 para rápido, 10-12 para calidad de estudio) y valores de CFG.

## Casos de uso

- Producción musical independiente: un compositor puede generar maquetas de canciones completas (letra + instrumental) en minutos con una RTX 4090, iterando rápidamente sobre variaciones con distintos prompts.
- Generación de bandas sonoras para videojuegos: estudio pequeños pueden crear temas musicales de duración controlada (por ejemplo 60-120 segundos) con `max_duration` para ajustar el bucle exacto que necesitan.
- Creación de contenido para YouTube o redes sociales: generación de música de fondo con licencia Apache 2.0 sin riesgo de copyright, integrable en flujos de trabajo con ComfyUI y herramientas de vídeo.
- Exploración creativa en francés y chino: al soportar estos idiomas, permite generar canciones en mercados no anglófonos sin necesidad de traducción manual de letras.
- Investigación en generación de audio: el flujo de FP8 y LoRA de destilación está documentado y el código de entrenamiento está open-source, lo que permite reproducir y estudiar técnicas de aceleración de diffusion models para audio.
- Prototipado rápido en estudios de audio: los ingenieros pueden generar múltiples variaciones de una canción con distintos prompts y elegir la mejor antes de grabarla en estudio, reduciendo costes de producción.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks académicos estándar (como FAD, CLAP score, etc.), pero sí se han publicado datos de rendimiento de generación en hardware real:

| Configuración | Tiempo de generación (canción de 190 s) | Aceleración | VRAM |
| :--- | :--- | :--- | :--- |
| Baseline (INT8 sin optimizar) | ~895 s (~15 min) | 1,0x | ~16 GB |
| Text encoder y DiT FP8 | ~315 s (~5 min 15 s) | 2,8x | ~11 GB |
| Pila completa (FP8 + LoRA Turbo 8 pasos + SageAttention) | ~245 s (~4 min 5 s) | ~3,7x | ~11,5 GB |

No se han publicado resultados de benchmarks de calidad objetiva en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,5 GB con la pila completa FP8 + LoRA Turbo; ~11 GB solo con FP8; ~16 GB con el modelo base sin optimizar.
- GPU recomendadas: NVIDIA RTX 4090 (usada para el entrenamiento de la LoRA y las pruebas de rendimiento); compatible con cualquier GPU NVIDIA con soporte para FP8 (RTX 40 series o superior, así como A100/H100 con capacidad FP8).
- Cabe en GPU de consumo como la RTX 4090 (24 GB) y probablemente en la RTX 4080 (16 GB) y RTX 4070 Ti SUPER (16 GB), aunque el rendimiento será menor.
- Opciones de despliegue: ComfyUI con nodos nativos; también se puede usar fuera de ComfyUI con los pesos safetensors y el pipeline de diffusers, aunque el repositorio está optimizado para ComfyUI.
- Latencia estimada: ~4 minutos para una canción de 190 segundos en RTX 4090 con la pila completa; tiempos proporcionalmente menores para canciones más cortas (por ejemplo, ~2,5 min para una de 120 s).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de generación musical en la información proporcionada. Las alternativas open-weight conocidas (como MusicGen de Meta o AudioLDM) tienen arquitecturas y tamaños muy distintos, y no hay datos de rendimiento comparativos publicados en esta fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Este es un lanzamiento v1.0 de la comunidad, marcado explícitamente como "Work in Progress / Experimental Calibration" por el autor; los hiperparámetros de audio pueden requerir ajustes adicionales.
- El modelo base solo soporta inglés, francés y chino; no se ha verificado el rendimiento en otros idiomas.
- La cuantización FP8 puede introducir pérdidas de calidad en algunos escenarios, aunque el autor afirma haber mantenido capas críticas en BF16/FP16 para mitigarlo.
- La fuerza de LoRA recomendada (0,85) es un valor empírico; valores distintos pueden degradar la calidad vocal o la coherencia instrumental.
- No se han publicado resultados de evaluación objetiva de calidad musical (p. ej., CLAP score) en la información disponible, por lo que la fidelidad respecto al modelo base no está cuantificada.
- El modelo genera canciones de hasta 190 segundos; duraciones mayores requieren segmentación y concatenación manual.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se deriva de MiniMax Music 3, cuyo licenciamiento original debe verificarse para asegurar compatibilidad en despliegues comerciales.
- El entrenamiento de la LoRA se realizó en una sola GPU (RTX 4090) con 20 000 pasos, lo que puede limitar la generalización en estilos musicales no representados en el conjunto de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guillaume127/MiniMax-Music-3-Turbo-FP8
- Repositorio de código (scripts de entrenamiento y conversión): https://github.com/Guillaume-127/Minimax-music-3-Turbo-8-steps
- Página de demostración oficial de MiniMax Music 3: https://minimax-ai.github.io/music3-demo/
- Guía independiente de MiniMax Music 3: https://minimaxmusic3.ai/
- Replicación del modelo por otro usuario: https://huggingface.co/modulsx/MiniMax-Music-3-Turbo-FP8
