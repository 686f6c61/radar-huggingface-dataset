# OxBee/HairDeck

## Resumen

HairDeck es un sistema de generación de geometría 3D para cabello estilizado en formato de "hair cards" (planos texturizados que simulan mechones) a partir de una única imagen de personaje. Lo desarrollan investigadores de la Universidad de Tsinghua, Carnegie Mellon University y la Chinese University of Hong Kong, y se distribuye como un conjunto de cinco modelos de difusión (DiT) más un VAE específico de tarjetas de pelo. El objetivo es automatizar un paso tradicionalmente manual en el pipeline de personajes anime: modelar, texturizar y preparar el pelo para animación.

El resultado no es solo una malla: el sistema genera UVs y colores por tarjeta, además de cadenas de huesos con muelles (spring-bone chains) que permiten animar el pelo, y exporta un avatar VRM 0.x sobre un cuerpo de referencia. Esto lo hace relevante para pipelines de VTubers, videojuegos estilizados y prototipado rápido de personajes, donde el coste de modelar pelo a mano es alto.

Arquitectónicamente es un ensemble de modelos transformer de difusión (DiT) que operan sobre tokens de tarjetas, combinados con un VAE decodificador de geometría. No es un modelo de lenguaje ni un modelo multimodal general: es un modelo de imagen-a-3D especializado, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con transformers (DiT) + VAE de tarjetas; ensemble de Image DiT, Card VAE, Chain DiT, Color DiT y Point-cloud DiT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen a 3D, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints en `ckpt/*/model.safetensors`) |

## Arquitectura y entrenamiento

HairDeck combina varios modelos de difusión basados en transformers (DiT) que trabajan sobre una representación tokenizada de tarjetas de pelo. El Image DiT genera tokens de tarjetas condicionado por características de imagen extraídas con DINOv3 ViT-L/16; el Card VAE decodifica cada token latente en geometría de tarjeta; el Color DiT predice los colores a lo largo de cada tarjeta condicionado por los tokens y la imagen; y el Chain DiT genera las cadenas de huesos con muelles condicionado por los tokens de tarjeta. Existe además un Point-cloud DiT que genera tokens de tarjetas condicionado por una nube de puntos, usando características de Dora-VAE 1.1 en lugar de DINOv3.

El pipeline de imagen requiere también modelos auxiliares descargados de sus propios repositorios: DINOv3, SAM 3, BiRefNet-matting y Dora-VAE. Los checkpoints DiT contienen pesos EMA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en este tipo de modelo). El repositorio incluye estadísticas de normalización, el marco canónico de cabeza, un cuerpo de avatar de VRoid Studio y 100 casos de test con geometría de tarjetas y cadenas de huesos.

## Capacidades

- Generación de tarjetas de pelo 3D estilizado (hair cards) a partir de una sola imagen de personaje.
- Generación de UVs y colores por tarjeta, listos para texturizado.
- Generación de cadenas de huesos con muelles (spring-bone chains) para animación del pelo.
- Exportación a VRM 0.x sobre un cuerpo de avatar de referencia.
- Generación de variaciones múltiples (por ejemplo, cuatro variaciones por imagen de entrada).
- Generación de vídeos de giro de cabeza para previsualización (requiere ffmpeg).
- Ruta alternativa de generación condicionada por nube de puntos (Point-cloud DiT).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Sin capacidades multilingües ni de audio.

## Casos de uso

- Prototipado de personajes anime para videojuegos: a partir de un concept art 2D se obtiene una malla de pelo con UVs y colores, reduciendo el tiempo de modelado manual antes de la fase de retopología y ajuste final.
- Creación de avatares VTuber: el pipeline exporta directamente un VRM 0.x con pelo animable mediante spring bones, integrable en software de tracking facial como VSeeFace o VTube Studio.
- Previsualización rápida en pipelines de animación: los vídeos de giro de cabeza generados permiten validar el aspecto del pelo antes de comprometer horas de modelado.
- Generación de variantes de estilo: la producción de cuatro variaciones por imagen facilita la exploración de diseños alternativos de peinado para un mismo personaje.
- Poblar escenas o catálogos con personajes estilizados: útil en demos, prototipos de juegos indie o contenido generado para redes, donde el coste de un artista 3D dedicado no es viable.
- Investigación en imagen-a-3D: el modelo y los 100 casos de test publicados sirven como base reproducible para comparar métodos de generación de geometría de pelo.
- Integración en herramientas DCC mediante el código de GitHub: los GLB generados pueden importarse en Blender o Unity para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU con CUDA: el repositorio indica Linux, Python 3.12 y una GPU CUDA como requisitos de instalación local.
- VRAM estimada: no disponible de forma explícita; el bundle de pesos ocupa 2,4 GB, a lo que se suman DINOv3 ViT-L/16, SAM 3, BiRefNet-matting y Dora-VAE descargados aparte, por lo que se recomienda una GPU con al menos 16-24 GB para margen.
- GPU recomendadas: no disponibles de forma oficial; por el perfil de los modelos auxiliares (ViT-L, SAM 3), una RTX 4090, A100 o H100 son opciones razonables.
- Compatibilidad con GPU de consumo: probable en tarjetas de gama alta con suficiente VRAM, aunque no está confirmado oficialmente.
- Opciones de despliegue: scripts Python del repositorio de GitHub (`scripts/image_to_hair.py`, `hairdeck.vrm.export`), demo en Hugging Face Spaces; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HairDeck | Difusión DiT + VAE | Imagen de personaje | Hair cards con UVs, colores y spring bones; VRM | Apache 2.0 | Pesos en Hugging Face, código en GitHub, demo en Spaces |
| Modelos genéricos de imagen-a-3D (por ejemplo, generadores de malla completa) | Difusión / reconstrucción | Imagen | Malla completa del personaje | Variable | no disponible en la información proporcionada |
| Herramientas manuales de modelado de pelo (Blender, Maya) | No aplica (software) | Intervención manual | Hair cards manuales | Propietaria o GPL | Ampliamente disponibles |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas específicas de generación de pelo 3D en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de lenguaje ni un asistente; no admite prompts textuales ni conversación.
- Dependencia de modelos externos: requiere aceptar las licencias de SAM 3 y DINOv3 y descargar sus pesos por separado; las condiciones de esos modelos pueden afectar al uso comercial del pipeline completo.
- Dominio restringido: entrenado para pelo estilizado tipo anime sobre el cuerpo de avatar de VRoid Studio proporcionado; el rendimiento en otros estilos o anatomías no está documentado.
- Sin datos de sesgo ni de tasas de alucinación publicados; en generación 3D el riesgo equivalente es la producción de geometría no plausible, que requiere revisión manual.
- La exportación VRM se limita a VRM 0.x, no a VRM 1.0.
- Requiere ffmpeg para la generación de vídeos de previsualización.
- Sin garantías de calidad para producción sin post-procesado: las tarjetas generadas probablemente necesiten retopología y ajuste manual.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks publicados impide avalar su robustez en entornos de producción exigentes.

## Enlaces

- Hugging Face: https://huggingface.co/OxBee/HairDeck
- Repositorio de código: https://github.com/hyz317/HairDeck
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/hyz317/HairDeck
- Página del proyecto: https://hyzcluster.github.io/HairDeck
- Paper en arXiv: https://arxiv.org/abs/2610.40599
- Página del autor principal: https://hyzcluster.github.io/
