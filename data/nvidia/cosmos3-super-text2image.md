# nvidia/Cosmos3-Super-Text2Image

## Resumen

Cosmos3-Super-Text2Image es un modelo de generación de imágenes a partir de texto desarrollado por NVIDIA, presentado como un *post-training* del modelo base Cosmos3-Super, que forma parte de la plataforma Cosmos de modelos fundacionales del mundo (*world foundation models*) orientada a Physical AI: robótica, conducción autónoma y entornos industriales. El modelo resuelve la tarea de síntesis de imágenes de alta fidelidad condicionada por una descripción textual, pero se enmarca en un sistema omnímodo mucho más amplio capaz de generar vídeo, audio y comandos de acción.

Arquitectónicamente, Cosmos3 se construye sobre una Mixture-of-Transformers (MoT) con dos torres complementarias: una torre autorregresiva para generación de tokens discretos (texto) y una torre de difusión para generación multimodal continua (imagen, vídeo, audio, acciones). Este checkpoint concreto expone únicamente la ruta texto-a-imagen, con 64.593.861.104 parámetros totales según los pesos en safetensors publicados (aproximadamente 64B), lo que lo sitúa en la gama alta de modelos generativos.

Su relevancia actual radica en que NVIDIA lo publica bajo la licencia OpenMDW1.1 con uso comercial permitido, lo que abre la puerta a integrarlo en pipelines de generación visual para simulación, entrenamiento de políticas y generación de datos sintéticos en robótica y automoción, un nicho donde la mayoría de los modelos de imagen de gran escala no ofrecen garantías explícitas de uso comercial ni están diseñados para coherencia física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusión |
| Parametros totales | 64.593.861.104 (aprox. 64B) |
| Parametros activos | no disponible (no se especifica si es MoE disperso; MoT no implica parámetros activos reducidos) |
| Longitud de contexto | 4096 tokens para entrada de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license), uso comercial y no comercial permitido |
| Formato de pesos | safetensors (librería `cosmos`, integración con `diffusers`) |

## Arquitectura y entrenamiento

Cosmos3 emplea una arquitectura Mixture-of-Transformers (MoT) en la que conviven dos torres: una autorregresiva que genera tokens discretos mediante decodificación *next-token* estándar (empleada para texto) y una torre de difusión que sintetiza modalidades continuas mediante *denoising* iterativo (imagen, vídeo, audio y acciones). Este diseño unifica el modelado de modalidades heterogéneas en un único marco preservando el mecanismo de generación más adecuado para cada una. El checkpoint Cosmos3-Super-Text2Image es un *post-training* del modelo base Cosmos3-Super, especializado en la ruta texto-a-imagen.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. Sí se documenta que el modelo base se desarrolló sobre el Cosmos Framework y que la familia Cosmos3 cubre generación omnímoda (texto, imagen, vídeo, audio, acción) con soporte para resoluciones de 256p, 480p y 720p y relaciones de aspecto 16:9, 4:3, 1:1, 3:4 y 9:16.

## Capacidades

- Generación de imágenes de alta fidelidad a partir de descripciones textuales, con soporte de resoluciones 256p, 480p y 720p.
- Relaciones de aspecto configurables: 16:9, 4:3, 1:1, 3:4 y 9:16.
- Entrada de texto de hasta 4096 tokens, lo que permite *prompts* largos y descripciones detalladas.
- Salida en formato JPG en RGB de 8 bits por canal (sRGB); no admite entradas en escala de grises.
- Como parte de la familia Cosmos3, el modelo base soporta además generación de vídeo (MP4, hasta 5 fotogramas por ventana), audio (AAC, máx. 0,5 s) y comandos de acción para múltiples *embodiments* robóticos (Franka Panda, UR, Agibot, Google Robot, WidowX 250, UMI, cámara general 9D, vehículo autónomo 9D, movimiento egocéntrico 57D).
- Capacidad de razonamiento físico orientado a simulación y *world modeling*, heredada del entrenamiento del modelo base.
- Soporte de integración con `diffusers`, `vllm-omni`, `sglang` y `sglang-diffusion` según los *tags* del repositorio.
- Capacidades multilingües: no disponible (no se especifican idiomas soportados).
- *Tool calling* / *function calling*: no disponible para esta variante texto-a-imagen.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de perceptores robóticos: el modelo puede producir imágenes de escenas industriales o de interior a partir de descripciones textuales, alimentando *datasets* de visión para *pipelines* de detección y segmentación en robótica, aprovechando su orientación a Physical AI.
- Simulación visual para conducción autónoma: generación de escenarios urbanos y de carretera con relaciones de aspecto panorámicas (16:9) y resolución 720p, útiles para aumentar la cobertura de casos raros en *datasets* de percepción.
- Previsualización de conceptos en diseño de producto industrial: *prompts* largos de hasta 4096 tokens permiten describir especificaciones detalladas de materiales, iluminación y composición para generar *renders* conceptuales.
- *Storyboarding* y previsualización audiovisual: al formar parte de la familia Cosmos3 con rutas de vídeo y audio, las imágenes generadas pueden servir como fotogramas clave para posteriores síntesis de vídeo dentro del mismo ecosistema.
- Generación de *assets* para entornos de entrenamiento en *smart spaces*: creación de imágenes de fábricas, almacenes y oficinas para calibrar modelos de simulación a realidad (*sim-to-real*).
- Investigación en *world models*: uso del checkpoint como componente de generación visual dentro de arquitecturas mayores de modelado del mundo, aprovechando la interfaz unificada de Cosmos3.
- Docencia y divulgación técnica: generación de ilustraciones coherentes con descripciones físicas para materiales educativos sobre robótica e IA física.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 130 GB solo para pesos (64B parámetros × 2 bytes), más *overhead* de activaciones y del *scheduler* de difusión; en la práctica se requiere un nodo multi-GPU.
- GPU recomendadas: H100 (80 GB) en configuraciones de 2 o más unidades, H200, B200 o A100 80 GB en número suficiente para alojar los pesos. Para FP8 se reduce a unos 65 GB, lo que permite una sola H100 80 GB con margen limitado.
- En GPU de consumo (RTX 4090 24 GB, RTX 5090): no cabe en precisión completa; sería necesaria cuantización agresiva (4 bits, ~32 GB) o *offloading* a CPU/RAM, con latencias muy elevadas. No se documentan cuantizaciones oficiales.
- Opciones de despliegue: `diffusers` (librería nativa `cosmos`), `vllm-omni`, `sglang` y `sglang-diffusion` según los *tags* del repositorio. No se menciona soporte de llama.cpp ni Ollama.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Licencia | Enfoque |
|---|---|---|---|---|
| Cosmos3-Super-Text2Image (NVIDIA) | ~64B | 4096 tokens | OpenMDW1.1 (comercial permitido) | World model / Physical AI, omnímodo |
| FLUX.1 (Black Forest Labs) | no disponible en la información | no disponible | no disponible | Texto-a-imagen de alta fidelidad |
| Stable Diffusion 3 (Stability AI) | no disponible en la información | no disponible | no disponible | Texto-a-imagen generalista |
| Imagen (Google) | no disponible en la información | no disponible | propietaria | Texto-a-imagen de alta fidelidad |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia cualitativa principal de Cosmos3-Super-Text2Image es su integración en un *world model* omnímodo orientado a robótica y conducción autónoma, frente al enfoque generalista de los modelos de imagen citados.

## Limitaciones y advertencias

- El modelo está especializado en generación de imágenes; no expone en este checkpoint las capacidades de vídeo, audio o acción del modelo base, aunque comparte arquitectura con ellas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado por NVIDIA sin detalle del dataset, es probable que herede sesgos de los datos de entrenamiento; se recomienda auditoría antes de uso en producción.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido plausible pero físicamente incorrecto, especialmente en escenas con restricciones físicas estrictas (robótica, automoción).
- Idiomas soportados no especificados; el rendimiento en *prompts* en castellano no está garantizado.
- Entrada de imagen en escala de grises no soportada; solo RGB de 8 bits por canal en sRGB.
- Límite de 4096 tokens de texto y de 5 fotogramas por ventana de vídeo en el modelo base; este checkpoint no procesa vídeo.
- Licencia OpenMDW1.1: permite uso comercial, pero conviene revisar los términos completos en el enlace oficial para obligaciones de atribución o restricciones adicionales.
- No se documentan cuantizaciones oficiales, lo que dificulta el despliegue en hardware de consumo.
- No se publican benchmarks, por lo que la calidad relativa frente a alternativas no puede verificarse de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-Text2Image
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- *White paper*: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
