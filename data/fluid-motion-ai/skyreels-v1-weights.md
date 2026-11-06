# Fluid-Motion-AI/skyreels-v1-weights

## Resumen

SkyReels V1 es un modelo fundacional de generación de vídeo text-to-video centrado en figuras humanas, desarrollado por SkyReels-AI (el repositorio de pesos aquí descrito lo publica la organización Fluid-Motion-AI). Se construye mediante fine-tuning de tencent/HunyuanVideo sobre aproximadamente 10 millones de clips de cine y televisión de alta calidad, con el objetivo de mejorar la fidelidad de la animación facial, la composición cinematográfica y la iluminación en escenas con personas. El modelo resuelve el problema de la baja calidad de generación de figuras humanas en modelos de vídeo genéricos, incorporando un pipeline propio de limpieza y anotación de datos.

La arquitectura subyacente es la de HunyuanVideo, un transformer de difusión para vídeo, y el repositorio contiene 12.821.012.544 parámetros en formato safetensors compatible con diffusers. Genera clips de 97 frames a 24 FPS con resolución de 544x960 píxeles. La licencia es Apache 2.0, lo que facilita su uso comercial, y está etiquetado únicamente para inglés.

Es relevante ahora porque se posiciona como el primer modelo fundacional de vídeo open source centrado en humanos, con capacidades declaradas de animación facial (33 expresiones y más de 400 combinaciones de movimiento) y estética cinematográfica de nivel Hollywood, comparable según el autor a modelos propietarios como Kling y Hailuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (fine-tuning de tencent/HunyuanVideo) |
| Parametros totales | 12.821.012.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

SkyReels V1 parte de HunyuanVideo, un modelo de difusión transformer para generación de vídeo, y lo adapta al dominio de vídeo centrado en personas mediante un proceso de preentrenamiento multi-etapa. La etapa 1 realiza un preentrenamiento de transferencia de dominio sobre un corpus de aproximadamente 10 millones de clips de cine y televisión. La etapa 2 convierte el modelo text-to-video en image-to-video ajustando los parámetros conv-in y lo preentrena sobre el mismo dataset. La etapa 3 aplica un fine-tuning sobre un subconjunto de alta calidad para refinar la calidad final. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal reside en el pipeline propio de limpieza y anotación de datos, que incluye clasificación de expresiones faciales en 33 tipos, conciencia espacial de personajes mediante reconstrucción 3D para posicionar a varias personas en escena, reconocimiento de acciones con más de 400 unidades semánticas y comprensión de escena mediante análisis de correlación cross-modal entre vestuario, escenarios y trama. El modelo se distribuye en dos variantes: SkyReels-V1-Hunyuan-T2V (text-to-video) y SkyReels-V1-Hunyuan-I2V (image-to-video), ambas a 544x960 píxeles, 97 frames y 24 FPS.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con clips de 97 frames a 24 FPS y resolución de 544x960.
- Generación de vídeo a partir de imagen (image-to-video) en la variante I2V.
- Animación facial avanzada: captura 33 expresiones faciales distintas con más de 400 combinaciones de movimiento natural.
- Comprensión y generación de posicionamiento espacial de múltiples personajes en escena mediante reconstrucción 3D.
- Estética cinematográfica: composición, colocación de actores y ángulos de cámara de nivel cine.
- Reconocimiento y generación de acciones humanas basado en más de 400 unidades semánticas.
- Comprensión de escena con correlación cross-modal entre vestuario, escenario y trama.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: solo inglés según la etiqueta del modelo.
- Capacidades especiales: no disponible (no se documentan modos thinking, visión o audio más allá de la generación de vídeo).

## Casos de uso

- Producción de vídeo publicitario con personas: el modelo genera clips cinematográficos de 97 frames con iluminación y composición de nivel cine, adecuado para spots donde la figura humana y las expresiones faciales son el foco.
- Previsualización de escenas cinematográficas: directores y guionistas pueden generar previsiones de planos con actores y ángulos de cámara realistas a partir de descripciones textuales, gracias a la comprensión de posicionamiento espacial de personajes.
- Creación de contenido para redes sociales: generación de clips cortos de 4 segundos a 24 FPS con figuras humanas expresivas para plataformas que requieren contenido vertical u horizontal rápido.
- Animación de retratos y avatares: la variante image-to-video permite animar una imagen fija de una persona con expresiones faciales naturales, útil para avatares digitales y presentadores virtuales.
- Prototipado en estudios de animación y VFX: generación de referencias de movimiento humano y expresiones para equipos de animación antes de la producción final.
- Investigación en generación de vídeo centrada en humanos: el modelo y su pipeline de anotación sirven como base para experimentos académicos sobre síntesis de movimiento facial y composición de escenas.
- Generación de material para doblaje y localización: clips con movimiento labial y expresiones que pueden servir como base para tareas de sincronización y posproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 25,6 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos en precisión completa, y más para el proceso de difusión.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo (12.800 millones de parámetros) se requieren GPU de数据中心 como A100 o H100 para inferencia en precisión completa.
- ¿Cabe en GPU consumer? No disponible; con 12.800 millones de parámetros y 25,6 GB de pesos, no cabe en GPUs consumer de 24 GB sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: diffusers (formato nativo del repositorio); el código de inferencia está en el repositorio GitHub SkyReels-V1. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusión de vídeo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkyReels V1 (T2V) | 12.821.012.544 | 97 frames a 24 FPS | 544x960 | Apache 2.0 | Hugging Face (diffusers) |
| tencent/HunyuanVideo | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Kling | no disponible (propietario) | no disponible | no disponible | propietario | API propietaria |
| Hailuo | no disponible (propietario) | no disponible | no disponible | propietario | API propietaria |

La comparación con HunyuanVideo es directa porque SkyReels V1 es un fine-tuning de este; sin embargo, no se dispone de las especificaciones detalladas de HunyuanVideo en la información proporcionada. Kling y Hailuo se citan en la model card como referencias de rendimiento comparable, pero no se aportan datos numéricos de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre cine y televisión, puede heredar sesgos de representación de esos medios.
- Riesgo de alucinación: no documentado; en generación de vídeo se traduce en posibles artefactos, deformaciones anatómicas o incoherencias temporales, aunque no se cuantifica.
- Limitaciones de contexto o idioma: el modelo está etiquetado solo para inglés, por lo que las indicaciones en otros idiomas pueden degradar la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base HunyuanVideo puede tener sus propias condiciones que conviene verificar.
- Caveats para producción: no se documentan opciones de cuantización ni requisitos de hardware, lo que dificulta el despliegue en entornos con recursos limitados; el número de descargas (77) y likes (0) sugiere una adopción muy temprana y poca validación comunitaria.
- Duración limitada: los clips son de 97 frames (aproximadamente 4 segundos a 24 FPS), insuficiente para secuencias largas sin concatenación.

## Enlaces

- Hugging Face: https://huggingface.co/Fluid-Motion-AI/skyreels-v1-weights
- Repositorio GitHub: https://github.com/SkyworkAI/SkyReels-V1
- Playground: https://www.skyreels.ai/home?utm_campaign=huggingface_V1_t2v
- Discord: https://discord.gg/PwM6NYtccQ
- Modelo base: https://huggingface.co/tencent/HunyuanVideo
- Variante I2V: https://huggingface.co/Skywork/SkyReels-V1-Hunyuan-I2V
- Variante T2V: https://huggingface.co/Skywork/SkyReels-V1-Hunyuan-T2V
