# Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step

## Resumen

SANA-Video 2.0 5B 720p 4-step es un checkpoint destilado del modelo de generación de video SANA-Video 2.0, desarrollado por el equipo Efficient-Large-Model de NVIDIA Labs. Este preview de investigación reduce el proceso de muestreo de 50 pasos a solo 4, manteniendo la calidad de salida a resolución 720p, lo que permite generar videos de unos 5 segundos (81 fotogramas a 16 FPS) en una sola GPU de forma mucho más rápida que el modelo original. Está pensado para demostrar la viabilidad de la destilación DMD (Distribution Matching Distillation) en modelos de video de gran escala.

El modelo se basa en una arquitectura de transformer de difusión híbrido con 4,47 mil millones de parámetros, que combina capas de atención lineal gated con anclas periódicas de atención softmax densa, logrando escalar a secuencias largas sin el coste cuadrático de la atención completa. Utiliza un codificador de texto Gemma-2-2B y un VAE LTX 2.3. Su relevancia actual radica en que acerca la generación de video de alta calidad a hardware asequible, reduciendo drásticamente el coste computacional de inferencia, un paso clave para su adopción en entornos de producción y creación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SanaVideo2_5B (transformer de difusion hibrido, 32 capas, hidden size 2560) |
| Parametros totales | 4.466.980.960 (4,47B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de video, no texto) |
| Tipos de cuantizacion | BF16 (unico formato verificado) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint .pth (state_dict_ema), no safetensors |

## Arquitectura y entrenamiento

SANA-Video 2.0 emplea una arquitectura de diffusion transformer hibrida que intercala un 75% de capas de atencion lineal gated (eficientes en memoria) con un 25% de capas de atencion softmax densa, actuando estas ultimas como anclas periodicas para mantener la calidad de modelado global. Ademas, incorpora un mecanismo de agregacion de residuos de atencion compartida e independiente del timestep, que se aplica cada 8 capas, reduciendo la redundancia computacional. El modelo opera sobre un espacio latente comprimido por un VAE LTX 2.3 con 128 canales y stride (8, 32, 32), y usa un codificador de texto Gemma-2-2B-it para la condicion semantica.

El checkpoint de 4 pasos se obtiene mediante destilacion DMD a partir del modelo SFT de SANA-Video 2.0, tras fusionar un adaptador ReFL del paso 500. DMD actualiza el transformer completo, por lo que este release es un modelo completo, no un adaptador LoRA. El proceso de muestreo en 4 etapas predice la velocidad v en cada paso, calcula x0 y re-añade ruido en las etapas intermedias con nuevas muestras aleatorias. No se dispone de informacion publica sobre el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de video texto-a-video (T2V) a resolucion 736x1280, 81 fotogramas y 16 FPS (aproximadamente 5,06 segundos de video).
- Inferencia en solo 4 pasos de muestreo, lo que reduce drasticamente el tiempo de generacion frente a los 50 pasos del modelo original.
- Soporte bilingue para prompts en ingles y chino.
- Alta eficiencia computacional gracias a la atencion lineal gated, permitiendo ejecucion en una sola GPU.
- Generacion de video con movimiento coherente y buena alineacion texto-video, segun los ejemplos verificados publicados.
- No soporta text-to-image ni image-to-video en este checkpoint (solo T2V).
- No incluye capacidades de audio, tool calling ni razonamiento multimodal adicional.

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos de 5 segundos a 720p para plataformas como TikTok, Instagram Reels o YouTube Shorts, con prompts descriptivos en ingles o chino, sin necesidad de equipos de renderizado costosos.
- Prototipado rapido en produccion audiovisual: directores y disenadores pueden visualizar escenas o conceptos en minutos, iterando sobre prompts para explorar variaciones de estilo, movimiento y composicion antes de la produccion final.
- Generacion de material educativo y divulgativo: crear animaciones breves que ilustren conceptos cientificos, historicos o tecnicos, a partir de descripciones textuales, para integrarlas en presentaciones o cursos online.
- Publicidad y marketing: producir clips promocionales de productos o servicios de forma automatizada, con la posibilidad de ajustar el prompt para diferentes variantes de campaña sin coste adicional de produccion.
- Desarrollo de videojuegos y entornos virtuales: generar cinemáticas cortas o secuencias de transicion para juegos indie o demos, reduciendo el tiempo de creacion de assets animados.
- Investigacion en generacion de video: servir como base para experimentos de destilacion, fine-tuning o evaluacion de metricas de calidad y eficiencia en modelos de difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina del proyecto afirma que SANA-Video 2.0 iguala la calidad de los video DiTs con atencion softmax completa, pero no se proporcionan cifras concretas (como FVD, CLIP score u otras metricas) para este checkpoint destilado de 4 pasos.

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM para este checkpoint especifico. Como referencia, el modelo base de 50 pasos se anuncia como ejecutable en una sola GPU, mencionando la RTX 5090 en la documentacion de SANA-Video original.
- Estimacion orientativa: con 4,47B parametros en BF16, solo los pesos del transformer ocupan aproximadamente 9 GB. Sumando el codificador de texto Gemma-2-2B (otros ~4 GB en BF16) y el VAE LTX 2.3, mas las activaciones durante la generacion, se estima un consumo total de entre 16 y 24 GB de VRAM. Por tanto, GPUs como RTX 4090 (24 GB), RTX 5090 (32 GB) o A100 (40/80 GB) serian adecuadas; una RTX 3090 (24 GB) podria funcionar con margen ajustado.
- El modelo esta disenado para inferencia en una sola GPU, no requiere configuracion multi-GPU.
- Opciones de despliegue: el repositorio oficial de Sana proporciona scripts de inferencia con soporte para el sampler de 4 pasos. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM autoregresivo.
- Latencia y throughput: no hay datos publicos. Con 4 pasos de muestreo, la generacion de un video de 5 segundos deberia completarse en un orden de magnitud inferior al modelo de 50 pasos, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos en la informacion proporcionada. El checkpoint de 4 pasos es una variante destilada del modelo SANA-Video 2.0 de 50 pasos, que a su vez compite con otros modelos de generacion de video open source como CogVideoX, Mochi o HunyuanVideo. Sin embargo, no se han publicado tablas comparativas de rendimiento, parametros o calidad para este preview especifico. Se recomienda consultar la pagina del proyecto y el paper para futuras actualizaciones.

## Limitaciones y advertencias

- Es un preview de investigacion, no una version estable para produccion. El propio autor lo etiqueta como "research preview" y recomienda usar el modelo original de 50 pasos para usos criticos.
- Solo soporta texto-a-video (T2V); no incluye image-to-video ni otras modalidades.
- La generacion se limita a un bucket de resolucion fija (736x1280, 81 frames, 16 FPS), sin flexibilidad para otros formatos o duraciones.
- El checkpoint requiere una rama especifica del repositorio de Sana (`feat/sana-video2-4step-preview`) y un VAE LTX 2.3 en formato Diffusers, lo que complica su integracion en pipelines estandar.
- No se han publicado evaluaciones de sesgos, alucinaciones visuales o comportamientos no deseados. Como todo modelo generativo, puede producir contenido inexacto, estereotipado o inapropiado segun el prompt.
- La licencia Apache 2.0 permite uso comercial, pero al ser un preview, no hay garantias de soporte ni estabilidad.
- El modelo solo acepta prompts en ingles y chino; otros idiomas pueden degradar la calidad de la generacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step
- Modelo base (50 pasos): https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p
- Pagina del proyecto: https://nvlabs.github.io/Sana/Video2/
- Documentacion: https://nvlabs.github.io/Sana/docs/sana_video2/
- Repositorio GitHub: https://github.com/NVlabs/Sana
- Paper (arXiv): https://arxiv.org/abs/2607.21553
- Demo online: https://huggingface.co/spaces/Efficient-Large-Model/sana-video2-5b-720p-demo
