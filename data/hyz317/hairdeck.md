# hyz317/HairDeck

## Resumen

HairDeck es un sistema generativo para la creación de tarjetas de pelo estilizadas (hair cards) listas para animación a partir de una única imagen de personaje. Ha sido desarrollado por un equipo de la Universidad de Tsinghua, en colaboración con Carnegie Mellon University y la Chinese University of Hong Kong, y se publica junto con un artículo en arXiv (2610.40599), código abierto en GitHub y una demo online en HuggingFace Spaces.

El problema que resuelve es un cuello de botella habitual en la creación de avatares 3D estilizados (anime, VTubers, VRM): modelar y riggear el pelo a mano es lento y requiere habilidades especializadas. HairDeck genera automáticamente mallas de pelo en formato de tarjetas con UVs por tarjeta y, lo más novedoso, las cadenas de huesos spring-bone que permiten animarlas físicamente, exportando el resultado como GLB y como avatar VRM 0.x completo.

Técnicamente no es un modelo de lenguaje, sino un conjunto de modelos de difusión basados en arquitecturas DiT (Diffusion Transformers): un Image DiT que genera tokens de tarjetas de pelo condicionados a una imagen, un Card VAE que decodifica cada token latente en geometría, un Chain DiT que genera las cadenas spring-bone y un Point-cloud DiT adicional para la ruta de generación condicionada a nubes de puntos. El repositorio pesa aproximadamente 1,7 GB y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) + VAE, en cuatro modelos: Image DiT, Card VAE, Chain DiT y Point-cloud DiT |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica: modelo generativo 3D, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: salida 3D, no texto) |
| Licencia | Apache 2.0 (los modelos auxiliares DINOv3, SAM 3, BiRefNet-matting y Dora-VAE requieren aceptar sus propias licencias) |
| Formato de pesos | safetensors (los checkpoints DiT incluyen pesos EMA) |

## Arquitectura y entrenamiento

El sistema se organiza como un pipeline de cuatro componentes. El Image DiT genera tokens de tarjetas de pelo condicionados a una imagen de entrada, empleando características de DINOv3 ViT-L/16 como codificador visual. Cada token latente se decodifica en geometría de tarjeta mediante un Card VAE entrenado específicamente. De forma paralela, un Chain DiT genera las cadenas de huesos spring-bone condicionadas a los tokens de las tarjetas, lo que permite que el pelo sea animable de inmediato en motores compatibles con VRM. Adicionalmente, existe un Point-cloud DiT que genera tokens de tarjetas condicionados a una nube de puntos, usando características de Dora-VAE 1.1; este modelo se emplea en la ruta de generación y evaluación basada en nubes de puntos.

El pipeline también integra modelos auxiliares de terceros: DINOv3 y SAM 3 para segmentación y extracción de características, BiRefNet-matting para matting del personaje y Dora-VAE para el procesamiento de nubes de puntos. Los datos de entrenamiento (número de muestras, composición del dataset) no se detallan en la model card, aunque el repositorio incluye assets de evaluación para 100 casos de prueba. Los checkpoints DiT se publican con pesos EMA (Exponential Moving Average), una práctica habitual en modelos de difusión para mejorar la estabilidad de la inferencia.

## Capacidades

- Generación de mallas de pelo estilizadas (hair cards) a partir de una única imagen de personaje, con UVs por tarjeta.
- Generación automática de cadenas de huesos spring-bone para animación física del pelo.
- Exportación de mallas de pelo como archivos GLB.
- Exportación de un avatar VRM 0.x completo, adjuntando el pelo generado al cuerpo de avatar plantilla incluido (basado en VRoid Studio).
- Generación de múltiples variaciones de pelo por imagen (el script de ejemplo genera 4 variaciones con distintos seeds).
- Ruta alternativa de generación condicionada a nube de puntos mediante el Point-cloud DiT.
- Generación de vídeos de vista previa con giro de cabeza (requiere ffmpeg).
- Salida orientada a estética anime/estilizada; no está orientado a pelo realista fotorreal.

## Casos de uso

- Creación de avatares VRM para VTubing: a partir de una ilustración de personaje se genera un pelo animable y se exporta un avatar VRM 0.x listo para usar en software como VSeeFace o Unity con UniVRM.
- Prototipado rápido de personajes para videojuegos estilizados: los equipos de arte pueden explorar decenas de variaciones de peinado sin modelar a mano, acelerando la fase de concept art 3D.
- Generación procedural de personajes en herramientas no-code o plataformas de avatares: el pipeline es ejecutable por script, lo que permite integrarlo en servicios automáticos de creación de avatares.
- Relleno de bibliotecas de assets de pelo: estudios o marketplaces pueden generar catálogos de hair cards reutilizables con UVs y rigging incluidos.
- Investigación en generación 3D condicionada: el modelo Point-cloud DiT y los assets de evaluación (100 casos de prueba) permiten reproducir experimentos y comparativas académicas.
- Animación y simulación de pelo en tiempo real: las cadenas spring-bone generadas son compatibles con motores que implementan física de cadenas de huesos, evitando configurar el rig manualmente.
- Complemento para pipelines de reconstrucción de avatares: combinado con sistemas de reconstrucción cuerpo/cara, HairDeck cubre la parte del pelo, que suele ser el eslabón más costoso de automatizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una ruta de evaluación con 100 casos de prueba (geometrías de tarjetas originales, cadenas spring-bone y fits de cabeza), pero no incluye métricas numéricas (Chamfer Distance, F-score, etc.) en el texto del README. Para datos cuantitativos, consultar el artículo en arXiv (2610.40599) y la página del proyecto.

## Requisitos de hardware

- GPU con CUDA requerida para inferencia local (Linux, Python 3.12); la VRAM exacta no está especificada en la documentación disponible, aunque el tamaño total del bundle de modelos es de aproximadamente 1,7 GB, lo que sugiere que GPU de consumo modernas deberían ser suficientes.
- GPU recomendadas: no disponible explícitamente; dado el tamaño de los checkpoints, una GPU de la gama RTX 3090/4090 o superior debería ser adecuada, pero no hay cifra oficial de VRAM.
- No hay información sobre si funciona en macOS o CPU; la documentación indica Linux + CUDA GPU.
- Despliegue: no usa vLLM, llama.cpp ni Ollama (no es un LLM). La instalación se realiza clonando el repositorio de GitHub, ejecutando `scripts/setup/download_weights.py` y los scripts `scripts/image_to_hair.py` y `hairdeck.vrm.export`. Existe una demo online en HuggingFace Spaces que no requiere GPU local.
- Requisitos adicionales: aceptar las licencias de SAM 3 y DINOv3, iniciar sesión en HuggingFace para descargarlos, y disponer de ffmpeg para las vistas previas en vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entrada | Salida | Licencia | Notas |
|---|---|---|---|---|
| HairDeck | Imagen única (o nube de puntos) | Hair cards con UVs + cadenas spring-bone, GLB y VRM 0.x | Apache 2.0 | Único centrado específicamente en pelo estilizado animable |
| TripoSR / modelos image-to-3D genéricos | Imagen única | Malla 3D completa | Variada | Generan objetos completos, no pelo riggeado ni spring-bones |
| Rodin / Dora-VAE | Imagen o nube de puntos | Malla 3D / latentes | Variada | Dora-VAE se usa como componente auxiliar en HairDeck, no genera rigs |

No existen alternativas publicadas de código abierto ampliamente conocidas que generen hair cards con spring-bones automáticamente, por lo que HairDeck ocupa una categoría bastante específica dentro de la generación image-to-3D.

## Limitaciones y advertencias

- El sistema está orientado a pelo estilizado (anime/estilizado); no está diseñado para pelo fotorrealista.
- La exportación VRM depende del avatar plantilla proporcionado (basado en VRoid Studio); adaptar el pelo a otros cuerpos de avatar puede requerir trabajo manual.
- Los modelos auxiliares (DINOv3, SAM 3, BiRefNet-matting, Dora-VAE) tienen sus propias licencias, que deben aceptarse por separado; algunas pueden tener restricciones de uso comercial distintas a las de Apache 2.0 de HairDeck.
- No hay datos públicos de métricas de calidad en la model card; conviene evaluar los resultados sobre los propios casos de uso antes de producción.
- La documentación de requisitos de VRAM y rendimiento es limitada, lo que dificulta planificar despliegues a escala.
- La inferencia local requiere Linux, Python 3.12 y GPU CUDA, lo que excluye entornos Windows nativos y macOS sin pasos adicionales no documentados.
- Las descargas del modelo son modestas (99 descargas y 8 likes en el momento de recopilar los datos), por lo que el soporte comunitario y la madurez en producción son aún limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hyz317/HairDeck
- Demo online en HuggingFace Spaces: https://huggingface.co/spaces/hyz317/HairDeck
- Código en GitHub: https://github.com/hyz317/HairDeck
- Página del proyecto: https://hyzcluster.github.io/HairDeck
- Artículo en arXiv: https://arxiv.org/abs/2610.40599
