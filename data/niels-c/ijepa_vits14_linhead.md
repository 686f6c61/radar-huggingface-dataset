# niels-c/ijepa_vits14_linhead

## Resumen

I-JEPA ViT-S/14 con cabeza lineal es un checkpoint intermedio (época 224 de 400) de un Vision Transformer Small con parches de 14×14, preentrenado de forma autosupervisada mediante I-JEPA (Joint-Embedding Predictive Architecture) sobre ImageNet-1k. Lo desarrolla Niels Thiemann dentro del proyecto neuro-jepas, ante la ausencia de un ViT-S/14 I-JEPA público, adaptando la receta oficial de ViT-H/14 al encoder más pequeño. Sobre el backbone congelado se entrena una sonda lineal para las 1000 clases de ImageNet-1k.

El modelo no está pensado como clasificador de producción: su top-1 con la cabeza lineal es del 27%, muy lejos de un uso práctico. Su propósito es servir como plugin de Brain-Score, comparando las activaciones de sus bloques con datos neuronales y conductuales del sistema visual de primates (V1, V2, V4, IT). El repositorio ocupa 0,1 GB y los pesos se distribuyen en safetensors.

La relevancia es metodológica: permite evaluar si las representaciones de las arquitecturas predictivas conjuntas (JEPA) se alinean mejor con la corteza visual que los modelos autosupervisados contrastivos, y hacerlo con un encoder ligero que cabe en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-S/14) sin token de clase, preentrenado con I-JEPA; cabeza lineal de 1000 clases |
| Parámetros totales | no disponible (ViT-S/14: embed_dim 384, 12 bloques, 6 cabezas; cifra exacta no publicada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada 224 × 224 RGB, 256 parches de 14 × 14) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors (`ijepa_vits14_linhead.safetensors`) |

## Arquitectura y entrenamiento

El backbone es un ViT-S/14 sin token de clase (`class_token=False`, `global_pool="avg"`, `embed_dim=384`, `depth=12`, `num_heads=6`). Se preentrena con I-JEPA sobre ImageNet-1k: el modelo predice representaciones de bloques objetivo a partir de bloques de contexto, sin aumentaciones ni píxeles generados, usando el encoder objetivo EMA como backbone exportado. La receta parte de `in1k_vith14_ep300.yaml` y se reajusta a mano para el encoder pequeño: mitad de batch, tasa de aprendizaje doble, bloque de contexto menor, predictor más superficial y EMA más lenta. El checkpoint corresponde a la época 224 de 400, con los schedules cosenos de learning rate, weight decay y momentum EMA aún lejos de sus valores finales.

Sobre el backbone congelado se entrena una sonda lineal (regresión logística sobre la media de los 256 tokens finales de parche, 384 dimensiones) en ImageNet-1k. Para Brain-Score se expone además la salida de cada bloque transformer como una rejilla 384 × 16 × 16, tratando las activaciones como mapas de características convolucionales. La implementación se desvía de la oficial en el warmup del learning rate, que arranca en 0 en lugar de un valor inicial.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k mediante la cabeza lineal (top-1 aproximado del 27%).
- Extracción de características del backbone congelado para tareas de representación y probing.
- Exposición de activaciones por bloque como rejilla 384 × 16 × 16 para análisis tipo mapa convolucional.
- Evaluación de similitud cerebro-modelo en benchmarks neuronales (V1, V2, V4, IT) y conductuales de Brain-Score.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No soporta generación de texto, código, matemáticas, visión-lenguaje ni audio.

## Casos de uso

- Evaluación en Brain-Score: el modelo se carga como plugin `ijepa_vits14_linhead` y se puntúa frente a benchmarks neuronales y conductuales, permitiendo comparar JEPA con modelos autosupervisados y supervisados de la misma arquitectura.
- Investigación en neurociencia computacional: extraer activaciones por bloque y correlacionarlas con respuestas de V1, V2, V4 e IT para estudiar qué capas se alinean con cada área visual.
- Estudio de arquitecturas predictivas conjuntas: usar el checkpoint como punto de comparación controlado (mismo encoder, distinto objetivo de preentrenamiento) frente a `vits14_supervised_linhead`.
- Extracción de features para probing ligero: congelar el backbone y entrenar sondas lineales en datasets pequeños para medir la linealidad de las representaciones.
- Análisis de representaciones intermedias: comparar el checkpoint de época 224 con el final de 400 épocas (`ijepa_vits14_linhead_400ep`) para estudiar la evolución del entrenamiento autosupervisado.
- Docencia y reproducibilidad: reproducir el pipeline de I-JEPA en un encoder pequeño que cabe en GPU de consumo, sirviendo como referencia didáctica del método.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica un top-1 aproximado del 27% para la cabeza lineal en ImageNet-1k, sin tabla comparativa de MMLU, HumanEval, GSM8K ni métricas de Brain-Score.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ViT-S/14 con 12 bloques y embed_dim 384 ocupa del orden de decenas de MB en fp32 (repositorio total de 0,1 GB), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch + timm (según el código de la model card), con `huggingface_hub` y `safetensors`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| niels-c/ijepa_vits14_linhead | ViT-S/14 + I-JEPA + sonda lineal | no disponible (ViT-S) | 224 × 224 | ~27% top-1 | MIT | Hugging Face |
| niels-c/ijepa_vits14_linhead_400ep | ViT-S/14 + I-JEPA + sonda lineal (400 épocas) | no disponible (ViT-S) | 224 × 224 | no disponible | MIT | Hugging Face |
| niels-c/vits14_supervised_linhead | ViT-S/14 supervisado + sonda lineal | no disponible (ViT-S) | 224 × 224 | no disponible | MIT | Hugging Face |
| facebookresearch/ijepa (ViT-H/14) | ViT-H/14 + I-JEPA | no disponible (ViT-H) | 224 × 224 | no disponible en esta ficha | MIT (código) | GitHub / pesos oficiales |

## Limitaciones y advertencias

- El top-1 del 27% hace la cabeza lineal inutilizable como clasificador en cualquier escenario donde importe la precisión.
- Hereda los sesgos de ImageNet-1k: selección de clases, sesgo geográfico y demográfico de las fotos y ruido en las etiquetas.
- Es un checkpoint intermedio (época 224 de 400, semilla 0) con schedules cosenos aún lejos de sus valores finales.
- La receta de ViT-S/14 se reajustó a mano, no mediante búsqueda sistemática; sus features son mucho menos linealmente separables que las de los modelos publicados (ViT-H y ViT-g).
- La implementación difiere de la oficial en el warmup del learning rate (arranca en 0).
- Solo se entrenó la cabeza lineal; el backbone no se adaptó a clasificación.
- Espera imágenes 224 × 224 RGB; la sonda se evaluó con resize a 256 y center crop de 224, mientras Brain-Score redimensiona la imagen completa a 224 × 224, alterando la relación de aspecto.
- Fuera de alcance: imágenes lejanas a la distribución de ImageNet-1k (médicas, satelitales, sintéticas), etiquetas fuera de las 1000 clases y cualquier decisión sobre personas.
- Licencia MIT permite uso comercial, pero el modelo no está diseñado ni validado para producción ni para usos críticos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niels-c/ijepa_vits14_linhead
- Checkpoint final (400 épocas): https://huggingface.co/niels-c/ijepa_vits14_linhead_400ep
- Modelo supervisado comparable: https://huggingface.co/niels-c/vits14_supervised_linhead
- Repositorio del plugin Brain-Score: https://github.com/niels-c/neuro-jepas-submissions
- Código oficial de I-JEPA: https://github.com/facebookresearch/ijepa
- Paper de I-JEPA: https://arxiv.org/abs/2301.08243
- Brain-Score (visión): https://www.brain-score.org/vision/
