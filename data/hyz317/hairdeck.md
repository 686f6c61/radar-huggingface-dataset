# hyz317/HairDeck

## Resumen

HairDeck es un sistema de generación de geometría 3D especializado en cabello estilizado para avatares de anime. Desarrollado por investigadores de la Universidad de Tsinghua, Carnegie Mellon y la Universidad China de Hong Kong, convierte una única imagen de personaje en "hair cards" (tarjetas de cabello) con UVs y colores por tarjeta, junto con las cadenas de huesos de resorte (spring-bone chains) necesarias para animarlas. El resultado se exporta como GLB y puede integrarse en un cuerpo de avatar predefinido para producir un avatar VRM 0.x listo para animación.

El modelo aborda un cuello de botella clásico en la producción de avatares 3D: la creación manual de hair cards animables es lenta y requiere artistas técnicos. HairDeck automatiza el pipeline completo (geometría, color, UVs y rigging de cadena) a partir de una sola imagen, lo que lo hace relevante para pipelines de VTubing, videojuegos y contenido generado por usuarios.

Técnicamente, es un conjunto de modelos de difusión basados en transformers (DiT) especializados: un Image DiT que genera tokens de tarjeta condicionado por imagen, un Card VAE que decodifica cada token en geometría, un Chain DiT para las cadenas de huesos, un Color DiT para el color por tarjeta y un Point-cloud DiT alternativo. El repositorio ocupa 2,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multi-componente: Image DiT, Card VAE, Chain DiT, Color DiT, Point-cloud DiT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision/3D, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints DiT con pesos EMA) |

## Arquitectura y entrenamiento

HairDeck es un pipeline de modelos generativos de difusión basados en transformer (DiT), no un LLM. El flujo principal combina cuatro componentes: el Image DiT genera tokens de hair card condicionados por la imagen de entrada (usando características de DINOv3 ViT-L/16), el Card VAE decodifica el latente de cada token en geometría de tarjeta, el Color DiT predice los colores a lo largo de cada tarjeta y el Chain DiT genera las cadenas de huesos de resorte condicionadas por los tokens de tarjeta. Existe además un Point-cloud DiT que genera tokens de tarjeta condicionados por una nube de puntos, usando características de Dora-VAE 1.1.

El pipeline de imagen requiere modelos auxiliares externos no incluidos en el repositorio: DINOv3, SAM 3 (segmentación), BiRefNet-matting y Dora-VAE, que se descargan de sus propios repositorios y cuyas licencias deben aceptarse por separado. Los checkpoints DiT contienen pesos EMA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF/DPO. El repositorio incluye estadísticas de normalización, el marco canónico de cabeza, un avatar VRoid Studio de plantilla y 100 casos de test con geometría original y cadenas de huesos de referencia.

## Capacidades

- Generación de cabello 3D estilizado (hair cards) a partir de una única imagen de personaje.
- Producción de geometría de tarjeta con UVs y colores por tarjeta.
- Generación de cadenas de huesos de resorte (spring-bone chains) para animación del cabello.
- Exportación a GLB y ensamblaje en un avatar VRM 0.x con el cuerpo de plantilla proporcionado.
- Generación de cuatro variaciones por imagen de entrada (parámetro `--n 4`).
- Modo alternativo de generación condicionada por nube de puntos (Point-cloud DiT).
- Segmentación y matting de la imagen de entrada mediante SAM 3 y BiRefNet-matting.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades lingüísticas: no es un modelo de lenguaje.

## Casos de uso

- Producción de avatares VTuber: a partir de una ilustración del personaje se generan hair cards animables y se exporta un VRM 0.x listo para plataformas de streaming, reduciendo el trabajo manual de modelado y rigging del pelo.
- Prototipado rápido en videojuegos: generación de variantes de peinado (cuatro por imagen) para explorar direcciones artísticas antes de producir el asset final.
- Contenido generado por usuarios en apps de personalización: el pipeline imagen-a-VRM permite que un usuario suba un dibujo y obtenga un avatar animable sin conocimientos de modelado 3D.
- Previsualización de personajes en pipelines de animación: el export genera además un vídeo de giro de cabeza para validar el resultado antes de integrarlo en producción.
- Investigación en generación 3D: el Point-cloud DiT y los 100 casos de test con geometría y cadenas de referencia permiten evaluar y comparar métodos de generación de hair cards.
- Integración en herramientas DCC: los GLB generados pueden importarse en motores como Unity o Unreal para retocar manualmente geometría, UVs y cadenas de huesos.
- Automatización de bibliotecas de assets: generación por lotes de peinados estilizados a partir de catálogos de imágenes de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU CUDA obligatoria; el repositorio indica Linux y Python 3.12 como entorno de referencia.
- VRAM estimada para inferencia: no disponible (el repositorio ocupa 2,4 GB, pero no se detalla el consumo en ejecución).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts locales del repositorio (`scripts/image_to_hair.py`, `hairdeck.vrm.export`), demo online en Hugging Face Spaces y descarga de pesos mediante `scripts/setup/download_weights.py`.
- Latencia y throughput: no disponible.
- Requiere `ffmpeg` para generar los vídeos de previsualización.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de generación de hair cards ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo está especializado en cabello estilizado de anime; no está pensado para cabello fotorrealista ni para otras partes del cuerpo.
- Depende de modelos externos (DINOv3, SAM 3, BiRefNet-matting, Dora-VAE) con licencias propias que deben aceptarse por separado; sus pesos no se incluyen en el repositorio.
- La licencia Apache 2.0 cubre los pesos liberados, pero el uso comercial debe verificar además las licencias de los modelos auxiliares y del avatar de plantilla VRoid.
- No se especifican datos sobre sesgos, tasas de alucinación geométrica ni robustez ante imágenes de entrada fuera de distribución.
- El pipeline asume un marco canónico de cabeza y un cuerpo de avatar de plantilla; la integración con otros esqueletos o proporciones requerirá adaptación.
- No hay información pública sobre requisitos de VRAM, latencia o calidad medida en benchmarks.
- El identificador arXiv (2610.40599) y las fechas del repositorio (octubre-noviembre de 2026) deben verificarse en la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyz317/HairDeck
- Demo online: https://huggingface.co/spaces/hyz317/HairDeck
- Código en GitHub: https://github.com/hyz317/HairDeck
- Página del proyecto: https://hyzcluster.github.io/HairDeck
- Paper en arXiv: https://arxiv.org/abs/2610.40599
