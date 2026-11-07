# ai-hhmi/lmd-vitl-p8-cellmap-lvd

## Resumen

`lmd-vitl-p8-cellmap-lvd` es un modelo de segmentación semántica de organelos celulares en volúmenes de microscopía electrónica (EM), desarrollado por AI@HHMI. Toma como entrada un volumen 3D de un solo canal a resolución de 8 nm y produce 75 canales de logits, uno por cada clase del esquema de etiquetado del CellMap Segmentation Challenge. El modelo combina un encoder Vision Transformer 3D derivado de DINOv3 con un decoder UNETR, y está afinado de extremo a extremo sobre 206 recortes anotados procedentes de 22 volúmenes de CellMap.

La relevancia del modelo reside en su enfoque de transferencia desde DINOv3: el encoder parte de los pesos 2D de DINOv3 ViT-L/16 (entrenados sobre LVD-1689M), se infla a 3D con parches de 8×8×8 vóxeles y se preentrena con SimMIM sobre el conjunto LMD durante 100.000 pasos. Este modelo concreto es el checkpoint del paso 20.000 de una ejecución de 25.000 pasos de afinamiento sobre las clases de organelos de CellMap. Con 304,8 millones de parámetros y un repositorio de 1,2 GB, es un modelo de tamaño medio orientado a un dominio muy específico: la biología celular cuantitativa y el análisis de conectómica.

El modelo no es un LLM ni un modelo multimodal generalista: es una herramienta de visión por computador 3D especializada. Su interés para desarrolladores e investigadores está en la segmentación densa de organelos a escala nanométrica, un paso previo habitual en pipelines de análisis de imágenes de FIB-SEM y en estudios de ultrastructura celular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (DINOv3 ViT-L con parches 8×8×8) + decoder UNETR |
| Parametros totales | 304.816.181 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada volumétrica; ventanas de 256³ vóxeles en inferencia, múltiplos de 8 por lado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16; el ejemplo usa autocast bf16) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | dinov3-license (other) |
| Formato de pesos | safetensors (model.safetensors, ~1,2 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder. El encoder es `DinoVisionTransformer3D`, una adaptación 3D de DINOv3 ViT-L con parches de 8×8×8 vóxeles; sus pesos provienen de `ai-hhmi/lmd-vitl-p8-simmim-lvd`, que a su vez parte del checkpoint 2D de Meta DINOv3 ViT-L/16 (LVD-1689M) inflado a 3D y preentrenado con SimMIM sobre LMD durante 100.000 pasos. El decoder es un `UNETRHead` que consume las capas intermedias del encoder (`get_intermediate_layers`) con conexiones de salto y produce 75 canales de logits a la resolución de entrada.

El afinamiento se realizó de extremo a extremo sobre 206 recortes anotados de 22 volúmenes de CellMap a 8 nm de resolución. Los objetivos de entrenamiento fueron las clases hoja del esquema de CellMap: 36 de las 53 clases hoja aparecen en los recortes de entrenamiento. El modelo publicado corresponde al paso 20.000 de una ejecución de 25.000 pasos. No se documentan en la información disponible detalles sobre funciones de pérdida concretas, aumentos de datos ni si hubo fases de RLHF/DPO (no aplicables a este dominio).

## Capacidades

- Segmentación semántica densa de organelos en volúmenes de microscopía electrónica 3D (FIB-SEM y similares) a resolución de 8 nm.
- Salida de 75 canales de logits, uno por clase del esquema CellMap; `argmax` sobre el eje de canales asigna un id de clase por vóxel.
- Soporte de clases compuestas (por ejemplo `mito` = unión de `mito_mem`, `mito_lum` y `mito_ribo`) mediante la unión de las etiquetas de sus clases hoja.
- Inferencia sobre volúmenes completos mediante ventanas deslizantes de 256³ vóxeles con stride de 128 y promediado ponderado de solapamientos.
- Entrada de un solo canal con ejes ordenados `(x, y, z)`; intensidades normalizadas en `[0, 1]`; lados múltiplos de 8.
- Reutilización del encoder (`net.encoder`) como extractor de características para otras cabezas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es un modelo puramente visual y 3D.

## Casos de uso

- Segmentación de organelos a gran escala en datasets de FIB-SEM: el modelo procesa volúmenes completos por ventanas de 256³ con solapamiento, lo que permite anotar automáticamente miles de micras cúbicas de tejido para estudios de ultrastructura.
- Análisis de mitocondrias y retículo endoplasmático: usando las clases hoja correspondientes y sus uniones compuestas, se pueden cuantificar volúmenes, formas y contactos entre orgánulos en poblaciones celulares.
- Conectómica y neurobiología estructural: la segmentación densa de membranas y estructuras celulares sirve como paso previo a la reconstrucción de circuitos neuronales a partir de EM.
- Control de calidad y preanotación en pipelines de anotación manual: el modelo genera etiquetas iniciales que los anotadores revisan, reduciendo el coste de curatoría en proyectos de biología celular.
- Extracción de características para modelos downstream: el encoder 3D preentrenado con SimMIM puede reutilizarse como backbone para tareas de clasificación o detección sobre recortes de EM.
- Investigación en métodos de segmentación 3D: sirve como referencia reproducible (checkpoint, configuración y código en `mia-train`) para comparar estrategias de transferencia desde DINOv3 2D a volúmenes 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 304,8 M de parámetros, los pesos en bf16 ocupan aproximadamente 0,6 GB; la inferencia sobre ventanas de 128³ o 256³ añade activaciones y mapas de atención que dominan el consumo. El ejemplo de la model card usa 128³ en bf16 sobre CUDA.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU con 16-24 GB (RTX 4090, A100 40 GB, H100) es un punto de partida razonable para ventanas grandes; no hay datos oficiales de rendimiento.
- Cabe en GPU de consumo: probablemente sí para ventanas moderadas (128³) en GPUs con suficiente VRAM; no confirmado por el autor.
- Opciones de despliegue: PyTorch (probado con 2.13), `safetensors`, `huggingface_hub` y el código de `mia-train` en el commit `4e71956`. También es posible usar el entrenador propio de `mia-train` o su `predict.py --argmax`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ai-hhmi/lmd-vitl-p8-cellmap-lvd` (este) | 304,8 M | volúmenes 3D, 8 nm, ventanas 256³ | Segmentación de 75 clases CellMap | dinov3-license | Hugging Face |
| `ai-hhmi/lmd-vitl-p8-simmim-lvd` | no disponible (ViT-L 3D) | volúmenes 3D, 8 nm | Extracción de características (encoder) | dinov3-license | Hugging Face |
| `ai-hhmi/lmd-vitl-p8-affinity-lvd` | no disponible (ViT-L 3D) | volúmenes 3D, 8 nm | Afinidades neuronales | dinov3-license | Hugging Face |
| `ai-hhmi/lmd-vitl-p8-affinity-scratch` | no disponible (ViT-L 3D) | volúmenes 3D, 8 nm | Afinidades neuronales (desde cero) | dinov3-license | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con 36 de las 53 clases hoja de CellMap; las clases hoja ausentes de los recortes de entrenamiento no se predicen (en las 43 muestras de test el `argmax` nunca eligió una clase hoja no vista ni el canal 0).
- Los canales compuestos (por ejemplo `mito`) nunca fueron objetivo de entrenamiento; deben obtenerse por unión de sus clases hoja.
- Dominio muy restringido: microscopía electrónica a 8 nm; no es aplicable a imágenes naturales, microscopía óptica genérica ni texto.
- Riesgo de alucinación en sentido amplio: puede asignar etiquetas plausibles pero incorrectas en regiones ambiguas o con artefactos de imagen; no hay métricas publicadas de error.
- Sesgos potenciales derivados de la distribución de los 22 volúmenes de CellMap (tipos de tejido, protocolos de preparación, intensidades); no documentados por el autor.
- Licencia `dinov3-license` (no comercial por defecto según la licencia de DINOv3 de Meta): es imprescindible revisar los términos antes de cualquier uso comercial.
- Dependencia de código externo (`mia-train` en el commit `4e71956`); sus paquetes de nivel superior (`models`, `layers`, `utils`, `distributed`, `data`) pueden colisionar con paquetes homónimos como `distributed` de Dask.
- El orden de ejes importa: los arrays almacenados como `(z, y, x)` (OME-Zarr, N5) requieren `transpose(2, 1, 0)`.
- No hay información sobre cuantizaciones, latencia ni requisitos mínimos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-hhmi/lmd-vitl-p8-cellmap-lvd
- Modelo base (encoder): https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Modelo SimMIM desde cero: https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Modelo de afinidades (LVD): https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Modelo de afinidades (scratch): https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Repositorio de código: https://github.com/AI-HHMI/mia-train (commit `4e71956`)
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado: arXiv:2508.10104
