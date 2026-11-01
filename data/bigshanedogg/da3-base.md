# bigshanedogg/DA3-BASE

## Resumen

DA3-BASE es un modelo de estimación de profundidad y geometría multivista desarrollado originalmente por ByteDance Seed (Haotong Lin, Sili Chen, Jun Hao Liew y colaboradores) y publicado como Depth Anything 3. La ficha que nos ocupa, `bigshanedogg/DA3-BASE`, no es un lanzamiento oficial, sino un port no oficial al formato `transformers` del checkpoint `depth-anything/DA3-BASE`, con los tensores re-guardados mediante `save_pretrained` y verificados como idénticos al original. El objetivo del port es permitir cargar el modelo con `AutoModelForDepthEstimation` y `trust_remote_code=True` sin depender del paquete `depth_anything_3`.

El modelo resuelve la recuperación del espacio visual a partir de una o varias vistas: estima profundidad relativa, pose de cámara y admite condicionamiento por pose (extrínsecos e intrínsecos). Es relevante para pipelines de reconstrucción 3D, fotogrametría ligera y visión por computador que necesiten integrar estimación de profundidad y geometría multivista dentro del ecosistema Hugging Face `transformers`, evitando dependencias externas.

Arquitectónicamente es una red de estimación de profundidad con backbone de extracción de características y cabezas de profundidad, confianza y pose, con 135.366.599 parámetros totales (aproximadamente 135 M) y un repositorio de 0,5 GB. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de estimación de profundidad multivista (Depth Anything 3), backbone con cabezas de profundidad, confianza y pose; código vendorizado en `da3_*.py` |
| Parametros totales | 135.366.599 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa N imágenes por forward; no es un modelo de contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se puede ejecutar en fp32, bf16 o fp16) |
| Idiomas soportados | No disponible (modelo de visión; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es una red de estimación de profundidad de tipo Depth Anything 3, construida a partir del grafo de objetos del checkpoint original (`config.json` → `da3_config`, idéntico a `configs/da3-base.yaml` del paquete oficial). El `forward` del modelo devuelve un `DepthAnything3Output` (subclase de `ModelOutput`) en el que la salida de profundidad se expone como `predicted_depth`, junto con `depth_conf` y otras claves. El procesador `DepthAnything3Processor` envuelve el `DepthAnything3ImageProcessor` oficial y ejecuta el `InputProcessor` del paquete original.

El port incorpora el código oficial de ByteDance-Seed/depth-anything-3 (commit 3d835ec1) en archivos planos, con únicamente cambios de imports y el renombrado de un logger. Según la model card, la verificación frente al paquete oficial (mismo proceso y semillas, V100, 4 imágenes) confirma que el preprocesado y todas las salidas del forward simple, condicionado por pose y ray-pose son bit-idénticas, tanto en fp32 como bajo el autocast de la API del paquete. No se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF/DPO, ya que se trata de un port de un checkpoint ya entrenado.

Una innovación destacable es el soporte de condicionamiento por pose: se pueden pasar `extrinsics` (1, N, 4, 4) e `intrinsics` (1, N, 3, 3) al procesador junto con las imágenes, de modo que los intrínsecos siguen el redimensionado. Además, `use_ray_pose=True` decodifica las poses desde la cabeza de rayos. También permite exportar características del backbone mediante `export_feat_layers=[i, ...]`, devueltas en `outputs.aux`.

## Capacidades

- Estimación de profundidad relativa a partir de una o varias imágenes (`outputs.predicted_depth` con forma `(1, N, H, W)`).
- Estimación de confianza de profundidad (`outputs.depth_conf`).
- Recuperación de pose de cámara y condicionamiento por pose (extrínsecos e intrínsecos).
- Decodificación de poses desde la cabeza de rayos con `use_ray_pose=True`.
- Extracción de características del backbone para tareas downstream (`export_feat_layers`).
- Procesamiento multivista (N imágenes por forward) para geometría multi-vista.
- Integración con el ecosistema `transformers` mediante `AutoModelForDepthEstimation` y `AutoProcessor`.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de múltiples vistas: el modelo procesa N imágenes en un solo forward y devuelve profundidad y pose, lo que permite alimentar pipelines de estructura desde movimiento (SfM) o de nubes de puntos.
- Fotogrametría ligera en móvil o dron: con 135 M de parámetros y pesos de 0,5 GB, puede ejecutarse en GPUs de gama media para generar mapas de profundidad densos a partir de secuencias de imágenes.
- Realidad aumentada y mixta: la estimación de profundidad relativa y la pose de cámara permiten anclar objetos virtuales sobre superficies reales en tiempo casi real.
- Robótica y navegación: la profundidad multivista y la confianza asociada sirven para evitar obstáculos y construir mapas locales del entorno.
- Edición y postproducción de vídeo: la profundidad por fotograma permite aplicar desenfoque de fondo, relighting o composición con máscaras de profundidad.
- Preentrenamiento y extracción de features: mediante `export_feat_layers` se pueden obtener características del backbone para tareas downstream como segmentación o detección.
- Digitalización de patrimonio y escenarios: captura de objetos o espacios con múltiples imágenes para generar mallas o nubes de puntos con pose condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 135 M de parámetros, en fp32 los pesos ocupan aproximadamente 0,54 GB; en bf16/fp16, unos 0,27 GB. A esto hay que sumar activaciones y el procesamiento de N imágenes, por lo que se recomienda al menos 4-8 GB de VRAM para lotes pequeños.
- GPU recomendadas: V100 (verificado en la model card), A100, H100 para lotes grandes o muchas vistas; RTX 4090 y RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.), ajustando el número de imágenes por forward.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; requiere `torch`, `addict`, `omegaconf`, `einops` y `opencv-python`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de imágenes, la resolución y la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / vistas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA3-BASE (este port) | 135 M | N imágenes por forward | Profundidad + pose multivista | Apache-2.0 | Hugging Face (`bigshanedogg/DA3-BASE`) |
| depth-anything/DA3-BASE (original) | 135 M | N imágenes por forward | Profundidad + pose multivista | Apache-2.0 | Hugging Face (oficial) |
| Depth Anything V2 (variantes) | No disponible en la información | Una imagen | Profundidad monocular | No disponible en la información | Hugging Face |
| Depth Anything V1 (variantes) | No disponible en la información | Una imagen | Profundidad monocular | No disponible en la información | Hugging Face |

La comparativa con Depth Anything V1/V2 se ofrece como referencia de categoría, pero los datos concretos de parámetros, contexto y rendimiento de esas variantes no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: el port lo mantiene `bigshanedogg` y no ByteDance Seed; la model card lo indica explícitamente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar los archivos `da3_*.py` antes de usarlo en producción.
- Dependencias adicionales no triviales: `addict`, `omegaconf`, `einops` y `opencv-python`.
- Algunas salidas usan muestreo aleatorio (el manejo del cielo muestrea profundidades), por lo que es necesario fijar la semilla de `torch` para obtener ejecuciones reproducibles.
- La profundidad es relativa, no métrica absoluta; para medidas reales hace falta calibración o escala externa.
- No procesa texto ni idiomas: no tiene capacidades de generación, tool calling ni agentes.
- Riesgo de alucinación geométrica en escenas con superficies reflectantes, transparentes o texturas repetitivas, habitual en modelos de profundidad.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo visual, puede heredar sesgos del dataset de entrenamiento original, no detallado aquí.
- Licencia Apache-2.0: permite uso comercial con atribución; deben conservarse `LICENSE` y `NOTICE` del repositorio.
- El tamaño del repositorio (0,5 GB) y las 12 descargas indican un uso muy minoritario; no hay evidencia de validación comunitaria extensa.

## Enlaces

- Hugging Face (port): https://huggingface.co/bigshanedogg/DA3-BASE
- Modelo original: https://huggingface.co/depth-anything/DA3-BASE
- Repositorio oficial: https://github.com/ByteDance-Seed/depth-anything-3
- Paper: https://arxiv.org/abs/2511.10647
