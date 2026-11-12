# Microguy1/HairDeck-DUPLI

## Resumen

HairDeck es un sistema de generación de activos 3D para hair styling de personajes estilizados (anime) a partir de una única imagen. Lo desarrollan investigadores de la Universidad de Tsinghua, Carnegie Mellon University y la Chinese University of Hong Kong, y se publica bajo licencia Apache 2.0. El modelo resuelve un problema concreto del pipeline de creación de avatares: convertir una ilustración 2D de un personaje en "hair cards" (planos geométricos texturizados con UV y color por tarjeta) listos para animar mediante cadenas de huesos de tipo spring-bone, y exportables como avatar VRM 0.x.

La arquitectura es un conjunto de modelos de difusión basados en transformer (DiT) que trabajan sobre tokens de tarjeta: un Image DiT que genera los tokens de hair-card condicionados por la imagen de entrada, un Card VAE que decodifica cada token latente en geometría de tarjeta, un Color DiT que predice los colores a lo largo de cada tarjeta y un Chain DiT que genera las cadenas de huesos de resorte condicionadas por los tokens de tarjeta. Existe además un Point-cloud DiT que permite condicionar la generación por una nube de puntos en lugar de una imagen.

Es relevante porque automatiza una parte del pipeline de personajes 3D que tradicionalmente se hace a mano (modelado de tarjetas de pelo, asignación de UV, pintado de color y rigging de cadenas), con salida directamente en formatos de producción como GLB y VRM. El repositorio ocupa 2,4 GB y contiene los pesos en safetensors junto con estadísticas de normalización, el frame canónico de cabeza y un avatar base de VRoid Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con transformer (DiT): Image DiT, Card VAE, Color DiT, Chain DiT y Point-cloud DiT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen a 3D, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints DiT y VAE); assets auxiliares en npz, json y jsonl |

## Arquitectura y entrenamiento

HairDeck se compone de varios modelos generativos coordinados. El Image DiT genera tokens de hair-card condicionados por la imagen del personaje, usando características de DINOv3 ViT-L/16 como entrada visual. El Card VAE decodifica el latente de cada token de tarjeta en geometría concreta (la tarjeta y su dirección de anchura). El Color DiT predice los colores a lo largo de cada tarjeta combinando los tokens de tarjeta con la imagen original. El Chain DiT genera las cadenas de huesos de resorte (spring-bone) que permiten animar el pelo, condicionado por los tokens de tarjeta y el frame de cabeza. Para la variante por nube de puntos, el Point-cloud DiT sustituye la imagen por una nube y utiliza características de Dora-VAE 1.1.

El pipeline también integra modelos externos que se descargan por separado: DINOv3 para extracción de características de imagen, SAM 3 para segmentación, BiRefNet-matting para matting y Dora-VAE para la variante de nube de puntos. El repositorio incluye estadísticas de normalización de tokens (en frame de dataset y en frame de cabeza), el frame canónico de cabeza, un avatar plantilla de VRoid Studio con su pelo original y su ajuste al frame de cabeza, y un conjunto de 100 casos de test con geometría original de tarjetas, cadenas de huesos y parámetros de cabeza. Los checkpoints DiT contienen pesos EMA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de hair cards estilizadas (planos de pelo con UV y color por tarjeta) a partir de una única imagen de personaje.
- Generación de geometría de tarjeta mediante decodificación VAE de tokens latentes.
- Predicción de color por tarjeta condicionada por la imagen de entrada.
- Generación de cadenas de huesos de resorte (spring-bone chains) listas para animación.
- Exportación a GLB de las mallas de pelo y a VRM 0.x del avatar completo, incluyendo vídeo de giro de cabeza.
- Generación de variaciones múltiples por imagen (el script de ejemplo produce cuatro variaciones).
- Ruta alternativa de generación condicionada por nube de puntos (Point-cloud DiT con Dora-VAE 1.1).
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües de texto.

## Casos de uso

- Creación de avatares VRM para VTubing: a partir de una ilustración del personaje, el modelo genera las tarjetas de pelo con UV y color y las cadenas de huesos, y el exportador produce un VRM 0.x con el pelo ya integrado en el avatar base de VRoid Studio, reduciendo el trabajo manual de modelado y rigging.
- Prototipado rápido de personajes en estudios de anime: el pipeline permite generar cuatro variaciones de peinado por imagen de entrada, lo que sirve para explorar direcciones de diseño antes de comprometerse con un modelado definitivo.
- Producción de assets para videojuegos estilizados: la salida GLB con tarjetas de pelo y cadenas de huesos puede importarse en motores que soporten spring bones, y el formato de tarjeta con UV por tarjeta facilita el texturizado posterior.
- Integración en herramientas de creación de personajes: al ser un conjunto de modelos con pesos safetensors y código en GitHub, puede incorporarse como etapa automática en un pipeline de generación de avatares a partir de fan-art o ilustraciones de referencia.
- Reconstrucción de peinados desde referencias 2D para catálogos: dado un conjunto de imágenes de personajes, el modelo puede generar de forma masiva tarjetas de pelo coherentes con el frame de cabeza canónico, útil para poblar bibliotecas de assets.
- Investigación en generación 3D condicionada por imagen: las rutas de imagen y de nube de puntos, junto con los 100 casos de test y las estadísticas de normalización incluidas, permiten reproducir y comparar experimentos de generación de geometría de pelo.
- Generación condicionada por escaneo o nube de puntos: la variante Point-cloud DiT permite generar tarjetas de pelo a partir de una nube de puntos, útil cuando se dispone de captura 3D en lugar de una ilustración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el repositorio indica que se requiere una GPU CUDA para la ejecución local, sin especificar modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Entorno de ejecución: Linux, Python 3.12 y GPU CUDA; el código se distribuye en el repositorio de GitHub y los pesos se descargan con `scripts/setup/download_weights.py`.
- Opciones de despliegue: ejecución local mediante los scripts del repositorio (`scripts/image_to_hair.py` y `hairdeck.vrm.export`), o demo online en Hugging Face Spaces. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Dependencias externas: DINOv3, SAM 3, BiRefNet-matting y Dora-VAE se descargan de sus propios repositorios y requieren aceptar sus licencias; el vídeo de previsualización requiere ffmpeg.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otras soluciones de generación de pelo 3D o de image-to-3D.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HairDeck (Microguy1/HairDeck-DUPLI) | no disponible | no aplica | no disponible | Apache 2.0 | Pesos en Hugging Face, código en GitHub, demo en Spaces |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está especializado en pelo estilizado de tipo anime; no se indica que generalice a otros estilos o a pelo fotorrealista.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre diversidad de peinados, etnias o tipos de cabello cubiertos.
- Riesgo de alucinación geométrica: al ser un modelo generativo, puede producir tarjetas de pelo con geometría incorrecta o cadenas de huesos mal condicionadas; no se documentan métricas de error en la información disponible.
- Dependencia de modelos externos con licencias propias (SAM 3, DINOv3, BiRefNet-matting, Dora-VAE): es necesario aceptar y cumplir sus licencias además de la Apache 2.0 del modelo, lo que puede condicionar el uso comercial.
- El pipeline requiere Linux, Python 3.12 y GPU CUDA; no se documenta soporte para CPU ni para otros sistemas operativos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor listado (Microguy1) no coincide con los autores del paper; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- El identificador arXiv 2610.40599 y la fecha de creación (2026-11-12) deben verificarse, ya que no se ha podido confirmar la existencia del paper en la información disponible.
- No se especifican parámetros, contexto ni requisitos de VRAM, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Microguy1/HairDeck-DUPLI
- Repositorio de código: https://github.com/hyz317/HairDeck
- Demo online: https://huggingface.co/spaces/hyz317/HairDeck
- Página del proyecto: https://hyzcluster.github.io/HairDeck
- Paper en arXiv: https://arxiv.org/abs/2610.40599
- Página del primer autor: https://hyzcluster.github.io/
