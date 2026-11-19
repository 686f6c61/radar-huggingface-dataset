# niels-c/ijepa_vits14_linhead_400ep

## Resumen

I-JEPA ViT-S/14 (400 épocas) con cabeza lineal de ImageNet-1k es un clasificador de imágenes desarrollado por Niels Thiemann dentro del proyecto neuro-jepas. Se trata de un backbone Vision Transformer pequeño (ViT-S/14, 22 millones de parámetros, parche de 14×14, sin token de clase) preentrenado de forma auto-supervisada con el método I-JEPA (Joint-Embedding Predictive Architecture) de Assran et al. (2023) sobre ImageNet-1k durante 400 épocas. Sobre ese backbone congelado se entrena una sonda lineal sobre la media de los 256 tokens finales de parche (384 dimensiones) para producir los 1000 logits de ImageNet-1k.

El modelo no se publica como clasificador de propósito general, sino como artefacto de investigación para Brain-Score, la plataforma que compara modelos de visión artificial con datos neuronales y conductuales del sistema visual de primates. Para ello expone la salida de cada bloque transformer como una rejilla de 384 × 16 × 16, de modo que las activaciones puedan tratarse como un mapa de características convolucional y evaluarse contra benchmarks neurales (V1, V2, V4, IT) y conductuales.

Su relevancia es acotada pero específica: no existe un I-JEPA ViT-S/14 público, por lo que este modelo cubre un hueco en la familia I-JEPA (publicada originalmente solo para ViT-H y ViT-g) y permite comparar arquitecturas predictivas conjuntas frente a modelos supervisados de la misma arquitectura en tareas de alineación con el cerebro. La precisión top-1 declarada es del 37 %, muy lejos de un uso como clasificador en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-S/14 (sin token de clase) preentrenado con I-JEPA; cabeza lineal sobre media de tokens de parche |
| Parámetros totales | 22 M (ViT-S, embed_dim 384, 12 bloques, 6 cabezas); no disponible el desglose exacto del checkpoint |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 224 × 224 píxeles RGB (parche 14×14, 256 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni int8) |
| Idiomas soportados | no aplica (modelo de visión; etiquetas en inglés de ImageNet-1k) |
| Licencia | MIT |
| Formato de pesos | safetensors (`ijepa_vits14_linhead_400ep.safetensors`) |

## Arquitectura y entrenamiento

El backbone es un ViT-S/14 con 384 dimensiones de embedding, 12 bloques transformer y 6 cabezas de atención, sin token de clase y con pooling global promedio. Se preentrena con I-JEPA: el modelo predice representaciones latentes de bloques objetivo a partir de bloques de contexto, sin aumentaciones ni píxeles reconstruidos, usando un predictor poco profundo y un codificador objetivo actualizado por EMA. La receta parte de la configuración oficial `in1k_vith14_ep300.yaml` y se reajusta a mano para el encoder pequeño: la mitad de batch size, el doble de learning rate, bloque de contexto más pequeño, predictor menos profundo y EMA más lenta. El backbone exportado es el codificador objetivo EMA, tal como en I-JEPA.

Tras 400 épocas de preentrenamiento sobre ImageNet-1k, el backbone se congela y se entrena una sonda lineal sobre la media de los 256 tokens finales de parche (384 dimensiones) para las 1000 clases de ImageNet-1k. No hay ajuste fino del backbone ni RLHF/DPO (no aplica). La implementación se desvía de la oficial en el warmup del learning rate, que arranca desde 0 en lugar de un learning rate inicial. El autor advierte que la receta se retocó manualmente, no mediante búsqueda sistemática, y que las características resultantes son mucho menos linealmente separables que las de los modelos publicados ViT-H y ViT-g.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k mediante la cabeza lineal (top-1 del 37 % según el autor).
- Extracción de características del backbone: salida de cada bloque transformer como rejilla 384 × 16 × 16, tratable como mapa de características convolucional.
- Evaluación en Brain-Score como plugin `ijepa_vits14_linhead_400ep` sobre benchmarks neurales (V1, V2, V4, IT) y conductuales.
- Comparación de arquitecturas auto-supervisadas tipo JEPA frente a modelos supervisados de la misma arquitectura.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión-lenguaje, audio ni modo thinking: es exclusivamente un modelo de visión con cabeza de clasificación.
- No hay capacidades multilingües; las etiquetas son las clases en inglés de ImageNet-1k.

## Casos de uso

- Investigación en neurociencia computacional: comparar las activaciones del modelo con registros neuronales de V1, V2, V4 e IT usando Brain-Score, aprovechando que cada bloque expone su rejilla 384 × 16 × 16 como mapa de características.
- Estudio de arquitecturas auto-supervisadas: usar el modelo como punto de comparación frente a `vits14_supervised_linhead` para aislar el efecto del preentrenamiento I-JEPA frente al supervisado en la alineación con el cerebro.
- Extracción de embeddings visuales para experimentos de representación: el backbone congelado sirve para obtener características de 384 dimensiones por imagen y analizar su estructura (linealidad, invariancias) sin coste de entrenamiento.
- Reproducción y extensión de I-JEPA a encoders pequeños: el checkpoint y la receta retocada permiten estudiar cómo escala I-JEPA por debajo de ViT-H, un régimen no cubierto por el paper original.
- Docencia y divulgación: ejemplo reproducible de preentrenamiento auto-supervisado con sonda lineal y empaquetado para una plataforma de benchmarks, con código de carga mínimo basado en timm y safetensors.
- Prototipado de pipelines de evaluación de modelos de visión: integrar el plugin en Brain-Score para validar infraestructura de comparación de modelos antes de escalar a encoders mayores.
- No es adecuado para clasificación de imágenes en producción, sistemas de seguridad ni decisiones sobre personas, según el propio autor.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1k top-1 (sonda lineal) | 37 % | Dato declarado por el autor en la model card |
| Brain-Score (neural V1/V2/V4/IT) | no disponible | Puntuaciones publicadas en brain-score.org, no incluidas en la información proporcionada |
| Brain-Score (conductual) | no disponible | Ídem |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de benchmarks de visión distintos del top-1 indicado. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22 M de parámetros, el checkpoint en fp32 ocupa del orden de 90 MB y en fp16 unos 45 MB. La inferencia a 224 × 224 requiere menos de 1 GB de VRAM en la práctica.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 están sobradamente dimensionadas. También funciona en CPU para lotes pequeños.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 y superiores, y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch + timm + safetensors (vía `hf_hub_download` y `load_file`), tal como muestra la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niels-c/ijepa_vits14_linhead_400ep | 22 M (ViT-S/14) | 224 × 224 | 37 % top-1 ImageNet-1k (sonda lineal) | MIT | Hugging Face |
| niels-c/vits14_supervised_linhead | 22 M (ViT-S/14) | 224 × 224 | no disponible | no disponible | Hugging Face |
| I-JEPA ViT-H/14 (Assran et al.) | ~632 M | 224 × 224 | no disponible en esta ficha | no disponible | Checkpoints oficiales de facebookresearch/ijepa |
| I-JEPA ViT-g/16 (Assran et al.) | ~1 B | 224 × 224 | no disponible en esta ficha | no disponible | Checkpoints oficiales de facebookresearch/ijepa |

La comparación directa más relevante es con el modelo supervisado de la misma arquitectura (`vits14_supervised_linhead`), que el autor recomienda usar como referencia al evaluar en Brain-Score. Frente a los I-JEPA publicados (ViT-H y ViT-g), este modelo es dos órdenes de magnitud menor y sus características son menos linealmente separables, según la propia model card.

## Limitaciones y advertencias

- Precisión top-1 del 37 %: la cabeza lineal no es utilizable como clasificador en ningún escenario donde la exactitud importe.
- No apto para producción ni para sistemas de seguridad crítica: la sonda es lineal sobre un backbone congelado y no se ajustó para robustez ni calibración.
- Hereda los sesgos de ImageNet-1k: selección de clases, sesgo geográfico y demográfico de las fotos y ruido en las etiquetas.
- No debe usarse para tomar decisiones sobre personas; las clases de ImageNet-1k no están diseñadas para describir personas.
- Fuera de distribución para imágenes médicas, de satélite o sintéticas, y para etiquetas distintas de las 1000 clases de ImageNet-1k.
- El backbone proviene de una única ejecución de entrenamiento (semilla 0), sin réplicas que permitan estimar varianza.
- La receta para ViT-S/14 se retocó a mano, no mediante búsqueda sistemática; I-JEPA solo se publicó para ViT-H y ViT-g.
- La implementación se desvía de la oficial en el warmup del learning rate (arranca en 0).
- Solo se entrenó la cabeza lineal; las características del backbone no se adaptaron a clasificación.
- Discrepancia de preprocesado: la sonda se evaluó con resize a 256 y recorte central a 224, mientras que Brain-Score redimensiona la imagen completa a 224 × 224, alterando la relación de aspecto. Conviene usar el preprocesado del código de la model card.
- Licencia MIT: permisiva para uso comercial, pero las limitaciones técnicas anteriores hacen desaconsejable cualquier uso comercial como clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niels-c/ijepa_vits14_linhead_400ep
- Repositorio del plugin Brain-Score (neuro-jepas-submissions): https://github.com/niels-c/neuro-jepas-submissions
- Código de entrenamiento I-JEPA original: https://github.com/facebookresearch/ijepa
- Paper I-JEPA (Assran et al., 2023): https://arxiv.org/abs/2301.08243
- Brain-Score (visión): https://www.brain-score.org/vision/
- Modelo supervisado de referencia (misma arquitectura): https://huggingface.co/niels-c/vits14_supervised_linhead
