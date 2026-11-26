# Microguy1/PURE-DUPLI

## Resumen

PURE-DUPLI es un paquete de pesos y código de inferencia para reconstrucción 3D feed-forward a partir de vídeo e imágenes, publicado por el usuario Microguy1 en Hugging Face. No se trata de un modelo de lenguaje, sino de un conjunto de tres checkpoints refinados mediante post-entrenamiento no supervisado (PURE) sobre arquitecturas de reconstrucción 3D existentes: Pi3 v2, DA3 Giant y VGGT. El repositorio incluye además un demo Gradio, una API de inferencia en Python y los scripts de entrenamiento y validación.

El modelo resuelve el problema de estimar nubes de puntos 3D, mapas de profundidad y poses de cámara a partir de secuencias de vídeo o conjuntos de imágenes, sin necesidad de calibración explícita ni de datos etiquetados durante el post-entrenamiento. La relevancia actual reside en que aplica una técnica de refinamiento (PURE) sobre modelos feed-forward ya existentes, manteniendo la arquitectura original pero mejorando la calidad de la reconstrucción, y lo empaqueta con una interfaz unificada para los tres backbones.

El repositorio ocupa 13,2 GB e incluye los tres subdirectorios de pesos (`pi3/`, `da3/` y `vggt/`), el estudio de demostración y los registros de validación. La licencia es mixta (`mixed-component-terms`), heredada de los componentes originales, y el acceso a los pesos requiere autorización en Hugging Face. No se dispone de información sobre idiomas soportados ni de parámetros totales en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tres backbones de reconstrucción 3D feed-forward: Pi3 v2, DA3 Giant, VGGT) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el demo procesa por defecto 48 frames consecutivos) |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen sin cuantización ni cambios de dtype) |
| Idiomas soportados | No disponible (la tarea es visión 3D, no procesamiento de lenguaje) |
| Licencia | Mixta (`mixed-component-terms`, `license: other`) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El paquete agrupa tres modelos de reconstrucción 3D feed-forward: Pi3 v2, DA3 Giant y VGGT. Cada uno mantiene su arquitectura original; PURE actúa como un post-entrenamiento no supervisado que refina los pesos sin necesidad de etiquetas 3D ground-truth. La documentación no detalla la arquitectura interna de cada backbone (número de capas, tipo de atención, resolución de entrada), por lo que esos datos se marcan como no disponibles.

El entrenamiento se describe como "unlabeled post-training", es decir, refinamiento sobre datos sin anotaciones 3D. No se especifica el número de tokens, la composición del dataset, ni si hubo RLHF o DPO (técnicas no aplicables a esta tarea). La validación publicada el 2026-10-15 confirma que los tres checkpoints se convirtieron sin cuantización ni cambios de dtype, con comparación tensor a tensor exactamente igual a los originales, y que en una H20 la comparación de inferencia de dos frames entre original y convertido dio un error absoluto máximo de 0. Los tres callbacks del Studio procesaron 48 frames consecutivos del vídeo de motocicleta de SelfEvo, generando 4.986.407 puntos no-cielo y una previsualización GLB de 150.000 puntos.

## Capacidades

- Reconstrucción 3D a partir de vídeo o secuencias de imágenes: genera nubes de puntos PLY completas, mapas de profundidad y poses de cámara.
- Estimación de profundidad (pipeline `depth-estimation`).
- Estimación de poses de cámara relativas a lo largo de la secuencia.
- Filtrado de cielo (sky removal) integrado en el CLI y el Studio.
- Exportación de resultados: vídeos RGB y de profundidad, nube de puntos PLY, previsualización GLB de 150.000 puntos y descarga en ZIP.
- Interfaz unificada para tres backbones (Pi3 v2, DA3 Giant, VGGT) mediante el parámetro `subfolder`.
- API de Python (`PURE.from_pretrained` y `PUREImageProcessor`) con soporte de Hub, directorios locales, revisiones, caché y `save_pretrained()`.
- Demo Gradio con previsualización 3D rotable.
- Soporte de `torch.autocast` en bfloat16 para inferencia.

## Casos de uso

- Reconstrucción de escenas a partir de vídeo de dron o cámara en movimiento: el modelo procesa 48 frames consecutivos y devuelve nube de puntos y trayectoria de cámara, útil para fotogrametría rápida sin calibración.
- Digitalización de objetos para impresión 3D o modelado: a partir de una secuencia de imágenes (por ejemplo, las 10 imágenes del ejemplo drift-straight) se obtiene un PLY exportable a herramientas de malla.
- Previsualización 3D en aplicaciones web o de escritorio: el Studio genera un GLB de 150.000 puntos que puede incrustarse en visores 3D ligeros.
- Generación de mapas de profundidad para post-proceso de vídeo: los vídeos de profundidad exportados permiten aplicar efectos de desenfoque, composición o relighting en pipelines de edición.
- Análisis de movimiento y trayectorias: las poses de cámara estimadas sirven para estabilización, seguimiento o análisis de trayectorias en vídeos deportivos (ejemplo Sport).
- Investigación en reconstrucción 3D: el paquete permite comparar tres backbones (Pi3 v2, DA3 Giant, VGGT) con la misma entrada y API, facilitando experimentos reproducibles.
- Prototipado de pipelines de visión 3D en local: el demo Gradio y el CLI `reconstruct.py` permiten validar resultados antes de integrar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validación incluida se limita a comprobaciones de ejecución y serialización (igualdad tensor a tensor, error absoluto máximo 0 en inferencia de dos frames, 4.986.407 puntos generados por modelo), no a métricas de calidad de reconstrucción del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 13,2 GB e incluye tres checkpoints; cada backbone se carga por separado según el `subfolder`.
- GPU recomendadas: la validación se realizó en una NVIDIA H20. No se especifican otros modelos.
- GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 u otras GPU consumer.
- Despliegue: demo Gradio (`studio/app.py`), CLI (`scripts/demo/reconstruct.py`) y API de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta tarea).
- Latencia y throughput: no disponibles. El demo procesa 48 frames por defecto con filtrado de cielo.
- Requisitos de entorno: Linux, Python 3.11, CUDA GPU, `huggingface-hub>=0.34,<1` y autenticación en Hugging Face.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / frames | Licencia | Disponibilidad |
|---|---|---|---|---|
| PURE-DUPLI (Pi3 v2) | Reconstrucción 3D feed-forward | 48 frames por defecto | Mixta | Requiere autorización en HF |
| PURE-DUPLI (DA3 Giant) | Reconstrucción 3D feed-forward | 48 frames por defecto | Mixta | Requiere autorización en HF |
| PURE-DUPLI (VGGT) | Reconstrucción 3D feed-forward | 48 frames por defecto | Mixta | Requiere autorización en HF |

No se dispone de datos de parámetros, contexto ni rendimiento de los backbones originales (Pi3 v2, DA3 Giant, VGGT) en la información proporcionada, por lo que no es posible una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- La profundidad relativa y la traslación no están garantizadas como métricas; el modelo no produce escala absoluta.
- Los objetos en movimiento pueden generar artefactos multi-frame ("ghosts") en la reconstrucción.
- Las previsualizaciones GLB están muestreadas y normalizadas; solo el PLY descargable conserva el conjunto completo de puntos.
- La licencia es mixta (`mixed-component-terms`) y depende de los términos de cada componente original; no se concede una licencia global nueva. Es necesario revisar `THIRD_PARTY_NOTICES.md` antes de uso comercial.
- El repositorio original de pesos (`FunnyGuy525/RefinedModel`) no especificaba una licencia de pesos separada.
- El acceso a los pesos requiere autorización en Hugging Face.
- No hay Space alojado desplegado; el demo debe ejecutarse en local.
- No se especifican idiomas soportados (no aplica a la tarea de visión).
- Riesgo de sesgos y alucinación visual: no documentado en la información disponible.
- La validación publicada no reproduce las métricas del paper, solo comprueba ejecución y serialización.

## Enlaces

- Hugging Face: https://huggingface.co/Microguy1/PURE-DUPLI
- Repositorio de pesos originales: https://huggingface.co/cyun9286/PURE
- Pesos originales refinados: https://huggingface.co/FunnyGuy525/RefinedModel
- Paper: https://arxiv.org/abs/2610.14698
- Página del proyecto: https://funnyguy525.github.io/PURE-Page/
- Avisos de terceros: https://huggingface.co/cyun9286/PURE/blob/main/studio/THIRD_PARTY_NOTICES.md
- Ejemplos SelfEvo: https://github.com/Self-Evo/SelfEvo/tree/b0e0f4aa23627cb411167fdfd1f325dc774151fe/examples
- Guía de despliegue (chino): studio/docs/HUGGINGFACE_ZH.md
- Guía de entrenamiento e inferencia (chino): studio/docs/TRAINING_INFERENCE_ZH.md
- Mapa del código: studio/docs/CODEBASE.md
