# nvidia/Cosmos3-Super-Image2Video-4Step

## Resumen

Cosmos3-Super-Image2Video-4Step es un modelo generativo de imagen a vídeo desarrollado por NVIDIA dentro de la familia Cosmos 3, una plataforma de "world foundation models" orientada a Physical AI (robótica, conducción autónoma y entornos industriales). El modelo toma una o varias imágenes de entrada junto con un prompt de texto opcional y produce una secuencia de vídeo temporalmente coherente, con salida en formato MP4 a 480p (832×480, 16:9) y 189 fotogramas por defecto.

Se trata de una variante destilada del modelo base Cosmos3-Super-Image2Video: mediante Improved Distribution Matching Distillation (DMD2) se ha reducido el muestreo a un esquema fijo de 4 pasos sin classifier-free guidance, lo que sustituye las 100 evaluaciones del modelo por vídeo (50 pasos × 2 por CFG) por solo 4, es decir, hasta 25 veces menos evaluaciones del modelo de difusión. Con 64B parámetros, es un modelo de gran escala que, según el autor, se situó en el puesto número 1 entre los modelos de código abierto en el leaderboard Image-to-Video de Artificial Analysis (a fecha de 2026/07/17).

La relevancia actual del modelo reside en su enfoque hacia la simulación física y la generación de vídeo de alta calidad con un coste de inferencia muy reducido gracias a la destilación, lo que lo hace atractivo para pipelines de generación de datos sintéticos y entrenamiento de políticas encarnadas en robótica y automoción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT): torre autorregresiva para tokens discretos y torre de difusión para generación multimodal continua |
| Parametros totales | 63.997.928.640 (64B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (repositorio de 195 GB) |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre transformer autorregresiva para la generación de tokens discretos y una torre transformer de difusión para la generación multimodal continua. En inferencia, el texto se genera mediante decodificación autorregresiva estándar de siguiente token, mientras que las modalidades no textuales (imagen, vídeo, audio y acciones) se sintetizan mediante denoising iterativo. Esta separación permite modelar modalidades heterogéneas dentro de un único marco preservando el mecanismo de generación más adecuado para cada una.

La innovación principal de esta variante es la destilación con Improved Distribution Matching Distillation (DMD2) a partir de Cosmos3-Super-Image2Video, que fija el muestreo en 4 pasos y elimina la necesidad de classifier-free guidance. El modelo se desarrolló sobre el Cosmos Framework de NVIDIA. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con prompt de texto opcional, manteniendo coherencia temporal y consistencia con el contenido visual de entrada.
- Entrada multimodal: texto (string), imagen (jpg, png, jpeg, webp), vídeo (mp4, con o sin audio) y trayectorias de acción (json, lista 1D).
- Salida en MP4 a resolución recomendada de 480p (832×480, 16:9) y 189 fotogramas por defecto; se aceptan entradas de vídeo a 720p, 480p y 256p.
- Generación en 4 pasos de muestreo sin CFG, con hasta 25 veces menos evaluaciones del modelo de difusión que el modelo base.
- Pertenece a la familia Cosmos3 omnimodal, que en conjunto es capaz de generar vídeo, imagen, audio y comandos de acción desde combinaciones de texto, imagen, vídeo y trayectorias de acción.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio como capacidades especiales del modelo: no disponible (el audio aparece solo como posible componente de los vídeos de entrada).

## Casos de uso

- Generación de datos sintéticos para robótica: a partir de imágenes de escenas reales o simuladas, el modelo produce vídeos coherentes que pueden servir para aumentar datasets de entrenamiento de políticas encarnadas, aprovechando su enfoque en Physical AI.
- Simulación de entornos para conducción autónoma: generar secuencias de vídeo plausibles desde un fotograma inicial permite crear escenarios de tráfico y condiciones variables para pruebas de percepción y planificación.
- Prototipado rápido de vídeo en producción creativa: con solo 4 pasos de muestreo y sin CFG, el coste por vídeo se reduce drásticamente frente al modelo base, lo que facilita iteraciones rápidas en estudios de animación o previsualización.
- Animar imágenes fijas para marketing y e-commerce: dado un producto fotografiado, el modelo genera un clip de 189 fotogramas a 480p que puede integrarse en catálogos o anuncios, manteniendo la consistencia con la imagen original.
- Gemelos digitales de espacios inteligentes: generar vídeo de entornos industriales o de fábrica a partir de capturas para alimentar simuladores y sistemas de monitorización, dado el enfoque del modelo en smart spaces.
- Investigación en world models: servir como componente de generación de vídeo dentro de pipelines de investigación sobre comprensión y simulación del mundo físico, gracias a su integración en el ecosistema Cosmos y su disponibilidad en Hugging Face con licencia OpenMDW1.1.

## Benchmarks y rendimiento

El autor indica que el modelo se situó en el puesto número 1 entre los modelos de código abierto en el leaderboard Image-to-Video de Artificial Analysis (a fecha de 2026/07/17). No se han publicado en la información disponible tablas con resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparativas cuantitativas detalladas.

## Requisitos de hardware

- El modelo de 64B requiere un nodo multi-GPU H100/H200 (4–8 GPUs) o una única B200; no cabe en una GPU individual de menor tamaño.
- VRAM estimada para inferencia: no disponible de forma explícita; el autor indica únicamente que no cabe en GPUs más pequeñas que las mencionadas.
- GPU recomendadas: NVIDIA H100, H200 (4–8 unidades) o B200 (una unidad).
- Compatibilidad con GPU de consumo: no, según las indicaciones del autor.
- Opciones de despliegue: vLLM-omni (según los tags y la sección de uso de la model card) y el ecosistema Cosmos Framework.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card remite a la sección PBR (Performance Benchmark Reporting) para estimaciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super-Image2Video-4Step | 64B | no disponible | #1 open source en Artificial Analysis Image-to-Video (2026/07/17) | OpenMDW1.1 | Hugging Face |
| Cosmos3-Super-Image2Video (base) | 64B | no disponible | Referencia del destilado; requiere 50 pasos + CFG | OpenMDW1.1 | Hugging Face |
| Otros modelos image-to-video de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de otros modelos image-to-video comparables más allá del modelo base de la misma familia.

## Limitaciones y advertencias

- El modelo es una variante destilada a 4 pasos; aunque el autor reporta alta calidad, la destilación puede implicar diferencias de fidelidad frente al modelo base en escenarios complejos.
- No se han documentado en la información disponible sesgos conocidos, tasas de alucinación ni limitaciones específicas de idioma.
- Resolución de salida recomendada limitada a 480p (832×480) y 189 fotogramas por defecto, lo que puede ser insuficiente para producciones que requieran mayor resolución o duración.
- Requiere hardware de gama alta (nodo multi-GPU H100/H200 o B200), lo que restringe su uso a entornos con infraestructura significativa y encarece el despliegue en producción.
- La licencia OpenMDW1.1 permite uso comercial y no comercial según la model card, pero conviene revisar los términos completos del enlace oficial antes de integrarlo en productos.
- No se especifican limitaciones de contexto ni de idioma, por lo que no es posible evaluar su comportamiento multilingüe o en secuencias largas a partir de la información disponible.
- El repositorio ocupa 195 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-Image2Video-4Step
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Super-Image2Video
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- White Paper: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW1.1: https://openmdw.ai/license/1-1/
- Paper DMD2: https://arxiv.org/abs/2405.14867
