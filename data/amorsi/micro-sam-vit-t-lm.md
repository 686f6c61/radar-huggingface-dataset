# amorsi/micro-sam-vit-t-lm

## Resumen

`micro-sam vit_t_lm` es un checkpoint de segmentación de imágenes biomédicas publicado por el usuario `amorsi` en Hugging Face como espejo (mirror) no modificado del modelo oficial de [micro-sam](https://github.com/computational-cell-analytics/micro-sam), desarrollado por el grupo Computational Cell Analytics. micro-sam es un framework que adapta Segment Anything (SAM) al dominio de la microscopía celular y de tejidos, y este checkpoint concreto corresponde a la variante `vit_t_lm`, es decir, un encoder ViT-Tiny combinado con un decoder específico para segmentación de estructuras biológicas.

El modelo resuelve el problema de la segmentación interactiva y automática de imágenes de microscopía (células, núcleos, orgánulos y tejidos) sin necesidad de reentrenar desde cero para cada nuevo dataset. Su relevancia radica en que acerca la segmentación tipo SAM a hardware modesto (ViT-Tiny, ~5 M de parámetros en el encoder) y a flujos de trabajo de bioimage analysis reproducibles, con dos ficheros de pesos (`model.pt` y `decoder.pt`) verificables por hash.

La información pública disponible es muy limitada: el repositorio ocupa 0,1 GB, tiene 0 descargas y 0 likes, no declara licencia propia ni idiomas, y la model card únicamente indica que es una copia sin modificar y remite a la fuente original para los términos de licencia de los pesos. No se han publicado benchmarks, datos de entrenamiento detallados ni especificaciones formales en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything (SAM) adaptado a microscopía; encoder ViT-Tiny + decoder específico (`vit_t_lm`) |
| Parametros totales | no disponible (variante Tiny de SAM; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | no disponible en el repo; la model card remite a los términos del proyecto micro-sam original (código MIT) |
| Formato de pesos | PyTorch (`model.pt`, `decoder.pt`) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura Segment Anything: un encoder de imagen tipo Vision Transformer y un decoder de máscaras que recibe prompts (puntos, cajas o máscaras) y produce segmentaciones. La variante `vit_t_lm` emplea el backbone Tiny de SAM, lo que reduce drásticamente el coste computacional frente a ViT-B o ViT-H, a cambio de menor precisión en estructuras finas. El sufijo `_lm` corresponde a la nomenclatura interna de micro-sam para el modelo ajustado a datos de microscopía ligera.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo ajuste fino supervisado, RLHF o estrategias de aumento de datos. La model card indica únicamente que los pesos son una copia sin modificar del registro oficial de micro-sam y que los hashes `xxh128` coinciden con los declarados en `util.py`, lo que garantiza integridad pero no aporta información sobre el proceso de entrenamiento.

## Capacidades

- Segmentación de imágenes de microscopía con prompts interactivos (puntos positivos/negativos, cajas delimitadoras).
- Segmentación automática de máscaras (modo "everything") sobre imágenes biomédicas.
- Segmentación de estructuras celulares y subcelulares (células, núcleos, orgánulos) y de tejidos.
- Integración con el pipeline de micro-sam mediante `model_type="vit_t_lm"`.
- Generación de embeddings de imagen reutilizables para múltiples prompts sobre la misma imagen.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No soporta visión generalista fuera del dominio de microscopía para el que fue ajustado.

## Casos de uso

- **Segmentación interactiva en bioimage analysis**: un investigador carga una imagen de microscopía en micro-sam, selecciona `model_type="vit_t_lm"` y anota células con clics; el modelo genera máscaras en tiempo casi interactivo gracias al backbone Tiny.
- **Análisis de imágenes de alto contenido (high-content screening)**: procesamiento por lotes de placas multi-pocillo para cuantificar número y morfología celular, usando el modo automático de generación de máscaras.
- **Prototipado en hardware modesto**: al ser ViT-Tiny, permite probar flujos de segmentación en estaciones de trabajo con GPU consumer antes de escalar a variantes ViT-B o ViT-H.
- **Docencia y formación en segmentación**: sirve como ejemplo didáctico de adaptación de SAM a un dominio concreto, con pesos reproducibles verificados por hash.
- **Pre-etiquetado para curación manual**: genera máscaras preliminares que un experto revisa y corrige, reduciendo el tiempo de anotación en nuevos datasets de microscopía.
- **Reproducibilidad de experimentos**: al ser un mirror con hashes coincidentes con el registro oficial, permite fijar la versión exacta de los pesos en pipelines de investigación reproducibles.
- **Integración en herramientas de análisis de imágenes** (por ejemplo, plugins de Fiji/ImageJ o napari) que consuman checkpoints de micro-sam.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial; por el tamaño del repo (0,1 GB) y el backbone ViT-Tiny, la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con soporte CUDA moderna; RTX 3060/4060 o superiores son suficientes para uso interactivo. A100/H100 no son necesarias para esta variante.
- **Consumer GPU**: sí, cabe en la mayoría de GPUs consumer actuales e incluso podría ejecutarse en CPU con latencias mayores.
- **Opciones de despliegue**: el ecosistema nativo es micro-sam (Python, PyTorch). No se documentan exportaciones a ONNX, TensorRT, llama.cpp ni Ollama (no aplica a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros (encoder) | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| micro-sam `vit_t_lm` (este) | Tiny | Microscopía | no disponible (remite a micro-sam) | Hugging Face (mirror) |
| micro-sam `vit_b_lm` | Base | Microscopía | ídem micro-sam | Registro oficial de micro-sam |
| micro-sam `vit_h_lm` | Huge | Microscopía | ídem micro-sam | Registro oficial de micro-sam |
| SAM original (Meta) | ViT-B / ViT-H | Imágenes generales | Apache 2.0 (código y pesos originales) | Meta AI / Hugging Face |

La comparación cuantitativa de rendimiento entre variantes no está disponible en la información proporcionada. En términos cualitativos, `vit_t_lm` es la opción más ligera de la familia micro-sam, adecuada para prototipado y hardware limitado, mientras que `vit_b_lm` y `vit_h_lm` ofrecen mayor precisión a costa de más recursos.

## Limitaciones y advertencias

- **Licencia ambigua**: el repo no declara licencia propia; la model card remite a los términos de los pesos originales de micro-sam. Antes de uso comercial es imprescindible verificar la licencia en el repositorio oficial.
- **Precisión limitada por el backbone Tiny**: estructuras finas o imágenes de baja relación señal-ruido pueden segmentarse peor que con variantes Base o Huge.
- **Sesgo de dominio**: el modelo está ajustado a microscopía; su uso en imágenes naturales o de otro tipo producirá resultados pobres.
- **Riesgo de sobre-segmentación o infra-segmentación** en imágenes con artefactos, desenfoque o iluminación no uniforme; se recomienda validación con ground truth del dataset objetivo.
- **Repositorio de terceros**: es un mirror con 0 descargas y 0 likes; la fuente autoritativa y mantenida es el repositorio de micro-sam.
- **Sin garantías de soporte**: no hay documentación propia, benchmarks ni issues asociados a este repo de Hugging Face.
- **Formato PyTorch únicamente**: no se ofrecen pesos en otros formatos, lo que puede limitar su integración en stacks no Python.

## Enlaces

- Hugging Face: https://huggingface.co/amorsi/micro-sam-vit-t-lm
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de pesos (`util.py`): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/faithful-chicken/1.1/files/vit_t.pt
- Pesos `decoder.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/faithful-chicken/1.1/files/vit_t_decoder.pt
- Segment Anything (paper original): https://arxiv.org/abs/2304.02643
