# micmacirq/WAN2.2-14B-Rapid-AllInOne

## Resumen

WAN2.2-14B-Rapid-AllInOne es una mezcla de modelos de generación de vídeo creada por el desarrollador micmacirq, que combina los pesos de WAN 2.2 (tanto la variante image-to-video como text-to-video) con otros modelos y aceleradores de la comunidad, como WAN 2.2 Lightning y SkyReels. El objetivo es ofrecer un único archivo de pesos en formato safetensors que incluya el modelo de difusión, el codificador CLIP y el VAE, de modo que se pueda cargar directamente en ComfyUI con el nodo "Load Checkpoint". La mezcla está optimizada para funcionar con FP8 y requiere solo 4 pasos de muestreo con CFG=1, lo que reduce drásticamente el tiempo de generación en comparación con los modelos WAN 2.2 originales. El modelo está pensado para usuarios que quieran generar vídeos de forma rápida y sencilla, sin necesidad de gestionar múltiples componentes por separado. El autor indica que estos modelos están deprecados y que ya no se mantienen, pero siguen disponibles para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo WAN 2.2 (no se detalla la arquitectura interna) |
| Parametros totales | 14 000 millones (14B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la información disponible. Se sabe que se trata de un modelo de difusión de vídeo de la familia WAN 2.2, con 14 000 millones de parámetros. El safetensors incluye además un codificador CLIP y un VAE integrados, lo que simplifica su carga en ComfyUI. El autor ha realizado una mezcla de pesos (merge) con distintos modelos y aceleradores: WAN 2.2 Lightning, SkyReels, Lightx2v y PUSA, entre otros, según la versión. No se han publicado detalles sobre los datos de entrenamiento ni sobre procesos de ajuste como RLHF o DPO; la información disponible se centra en el proceso de mezcla y en los cambios entre versiones.

## Capacidades

- Generación de vídeo a partir de texto (T2V) y de imagen (I2V) con un único modelo.
- Soporte de generación de vídeo desde el primer frame al último (first-to-last frame) y solo último frame, gracias a la inclusión de VACE en la versión MEGA.
- Compatibilidad con LORAs de WAN 2.1 y WAN 2.2 "low noise", aunque pueden requerir ajuste de fuerza.
- Funcionamiento con CFG=1 y 4 pasos de muestreo, lo que acelera la inferencia.
- Incluye CLIP y VAE integrados, simplificando el flujo de trabajo en ComfyUI.
- Precisión FP8.
- No soporta tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Generación de vídeos cortos para redes sociales: el modelo permite convertir prompts de texto o imágenes fijas en clips de vídeo de alta calidad en pocos segundos, ideal para contenido de TikTok, Instagram Reels o YouTube Shorts.
- Animación de fotografías: con la funcionalidad image-to-video, se pueden animar retratos o paisajes estáticos, añadiendo movimiento natural a imágenes existentes.
- Prototipado rápido para producción audiovisual: los directores y editores pueden generar pruebas de concepto de escenas o efectos visuales sin necesidad de rodajes costosos.
- Generación de vídeos para presentaciones y demos: se pueden crear vídeos explicativos o animaciones de productos a partir de imágenes, lo que resulta útil en entornos comerciales y educativos.
- Uso en pipelines de automatización de contenido: al cargarse en ComfyUI, el modelo se puede integrar en flujos de trabajo automatizados para producir lotes de vídeos a partir de listas de prompts.
- Investigación en generación de vídeo: al ser un modelo abierto con licencia Apache 2.0, los investigadores pueden estudiarlo, modificarlo y compararlo con otros modelos de difusión de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo puede funcionar con 8 GB de VRAM en ComfyUI, aunque esto probablemente implique offloading de pesos. Para un uso más fluido, se recomiendan 16-24 GB.
- GPU recomendadas: no especificadas por el autor. Para un rendimiento óptimo, se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB).
- Espacio en disco: el repositorio ocupa 1215.3 GB, por lo que se necesitan al menos 1.2 TB de almacenamiento libre para descargar todos los pesos.
- Opciones de despliegue: ComfyUI (flujos de trabajo incluidos en el repositorio). No se mencionan vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WAN2.2-14B-Rapid-AllInOne (micmacirq) | 14B | no disponible | Apache 2.0 | HuggingFace |
| Wan-AI/Wan2.2-I2V-A14B | 14B | no disponible | Apache 2.0 | HuggingFace |
| Wan-AI/Wan2.2-T2V-A14B | 14B | no disponible | Apache 2.0 | HuggingFace |

Se trata de una mezcla que integra los dos modelos base de WAN 2.2 en un solo archivo, con aceleradores añadidos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El autor indica que el modelo está deprecado y que ya no se mantiene; no se recibirán actualizaciones ni correcciones.
- Algunas versiones (las denominadas NSFW) están diseñadas para contenido para adultos; su uso puede ser inapropiado según la legislación de cada país.
- Según el changelog, las versiones anteriores (V2-V7) presentaban ruido en los primeros frames en I2V y cambios de escena dramáticos; las versiones más recientes los mitigan parcialmente.
- El modelo puede ser sensible a la fuerza de los LORAs; los LORAs de "high noise" de WAN 2.2 no son compatibles.
- El repositorio es extremadamente grande (1.2 TB), lo que dificulta su descarga y almacenamiento.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real frente a otros modelos no está verificado.
- La generación de vídeo puede producir contenido no deseado o alucinado; se recomienda revisar los resultados antes de su uso público.

## Enlaces

- HuggingFace: https://huggingface.co/micmacirq/WAN2.2-14B-Rapid-AllInOne
- Modelo base I2V: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base T2V: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Repositorio similar (Phr00t): https://huggingface.co/Phr00t/WAN2.2-14B-Rapid-AllInOne
