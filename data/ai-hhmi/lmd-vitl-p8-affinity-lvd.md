# ai-hhmi/lmd-vitl-p8-affinity-lvd

## Resumen

`lmd-vitl-p8-affinity-lvd` es un modelo de segmentación de imágenes 3D especializado en microscopía electrónica y de expansión para conectómica. Lo desarrolla el equipo AI-HHMI y su tarea es predecir afinidades por vóxel, es decir, la probabilidad de que dos vóxeles vecinos (a distintos desplazamientos) pertenezcan al mismo objeto biológico, lo que permite reconstruir neuronas mediante watershed mutex y componentes conexas. No es un modelo de lenguaje: es un segmentador denso 3D con pipeline `image-segmentation`.

La arquitectura combina un encoder DINOv3 ViT-L adaptado a volúmenes 3D (parches de 8³ vóxeles, 303 M de parámetros) con un decoder UNETR ligero de 1,85 M de parámetros. El encoder parte de `ai-hhmi/lmd-vitl-p8-simmim-lvd`, que a su vez deriva de DINOv3 LVD-1689M y fue preentrenado con SimMIM sobre el corpus LMD. El ajuste final se hizo de extremo a extremo durante 100.000 pasos sobre 41 volúmenes etiquetados a resolución de 8 nm.

Su relevancia es doble: por un lado, demuestra que los pesos de DINOv3, preentrenados en imagen natural, transfieren de forma útil a microscopía volumétrica; por otro, publica junto al modelo el pipeline completo de inferencia sobre volúmenes enteros (ventanas de 256³, solapamiento, watershed mutex y filtrado de segmentos), lo que facilita la reproducibilidad en conectómica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L 3D (encoder DINOv3) + decoder UNETR |
| Parámetros totales | 304.815.008 (303 M encoder + 1,85 M decoder) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia 256³ vóxeles (entrada flexible múltiplo de 8) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; la model card menciona autocast bf16 en inferencia) |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades lingüísticas) |
| Licencia | dinov3-license (other) |
| Formato de pesos | safetensors (fp32, 1,22 GB) + config.json |

## Arquitectura y entrenamiento

El encoder es un `DinoVisionTransformer3D` con parches de 8³ vóxeles y 303 M de parámetros, inicializado desde `lmd-vitl-p8-simmim-lvd` (checkpoint del paso 100k), que a su vez procede de DINOv3 ViT-L/16 LVD-1689M y fue adaptado al dominio LMD mediante SimMIM. El decoder es un `UNETRHead` de 1,85 M de parámetros que consume las salidas de los bloques 8, 16 y 24 (`skip_layers = [7, 15, 23]`, indexado desde 0) junto con la imagen cruda, y aplica tres etapas de upsampling ×2 con 64, 32 y 16 canales a strides 4, 2 y 1. La salida son 6 canales de logits de afinidad, uno por desplazamiento: (1,0,0), (0,1,0), (0,0,1), (10,0,0), (0,10,0) y (0,0,10) vóxeles.

El ajuste se realizó de extremo a extremo durante 100.000 pasos con el decoder inicializado aleatoriamente, sobre 41 volúmenes etiquetados a 8 nm. De ellos, 8 provienen del corpus LMD: 6 volúmenes de microscopía electrónica (corteza de ratón, pez cebra, entre otros) y el resto de microscopía de expansión, según el texto disponible en la model card (truncado). No se documentan en la información disponible detalles sobre función de pérdida, aumentos de datos, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Predicción de afinidades por vóxel en 3D para seis desplazamientos, base para segmentación de neuronas mediante watershed mutex y componentes conexas.
- Segmentación densa de volúmenes completos mediante inferencia por ventanas de 256³ con stride de 128 y promediado ponderado por distancia al centro de ventana.
- Funciona tanto en microscopía electrónica como en microscopía de expansión, gracias al entrenamiento conjunto sobre ambos dominios.
- Entrada monocanal con ejes (x, y, z), intensidades normalizadas a [0, 1] y vóxeles isótropos de 8 nm.
- El encoder puede reutilizarse como extractor de características 3D para otras cabezas, ya que los pesos se guardan bajo el prefijo `encoder.`.
- No dispone de tool calling, agentes, capacidades multilingües ni modos de razonamiento: es exclusivamente un modelo de visión 3D.

## Casos de uso

- Reconstrucción de conectividad neuronal: el modelo genera afinidades que, tras watershed mutex y filtrado de segmentos menores de 20.000 vóxeles, producen segmentaciones de neuritas listas para análisis de circuitos.
- Segmentación automática de volúmenes de microscopía electrónica de corteza de ratón: al haberse entrenado con volúmenes de ese tejido, es adecuado para pipelines de reconstrucción cortical a 8 nm.
- Procesamiento de datos de microscopía de expansión: el entrenamiento conjunto con EM y expansion microscopy permite aplicar el mismo modelo a muestras expandidas sin reentrenar.
- Preprocesado para análisis morfológico: las afinidades permiten derivar membranas y cuerpos neuronales para medir volumen, longitud y ramificación de neuritas.
- Aceleración de anotación humana: las segmentaciones automáticas sirven como propuesta inicial que los anotadores corrigen, reduciendo el coste de generar ground truth en nuevos volúmenes.
- Extracción de características 3D para transferencia: el encoder `lmd-vitl-p8-simmim-lvd` incluido en el checkpoint puede inicializar cabezas para tareas relacionadas (detección de sinapsis, clasificación de orgánulos) con menos datos etiquetados.
- Control de calidad en grandes campañas de imagen: al ejecutarse por ventanas de 256³ con solapamiento, se puede paralelizar sobre volúmenes de varios TB para detectar regiones mal segmentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se evaluó un benchmark propio con ventanas de 256³, stride de 128, `sigmoid(0.2 * logit)` y watershed mutex, pero no se incluyen métricas numéricas (por ejemplo, variation of information o error de segmentación) en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 1,22 GB; con activaciones para ventanas de 256³ y autocast bf16 se recomienda al menos 16-24 GB de VRAM. No se dispone de cifras oficiales.
- GPU recomendadas: A100, H100 o L40S para procesar volúmenes completos con ventanas de 256³; RTX 4090 (24 GB) es viable para ventanas de 128³ o 256³ con bf16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 16 GB con ventanas reducidas, aunque el autor solo validó 256³.
- Opciones de despliegue: PyTorch 2.13 con `safetensors` y el código de `mia-train` (commit `0fe3872`); también es posible usar el `predict.py` de `mia-train` con `AffinitySegmentation`, que requiere `miao-io` y `connected-components-3d`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El autor indica que la evaluación usó bf16 autocast y ventanas de 256³ con stride de 128, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lmd-vitl-p8-affinity-lvd | 304,8 M (303 M encoder + 1,85 M decoder) | 256³ vóxeles (entrada flexible múltiplo de 8) | Afinidades para segmentación de neuronas | dinov3-license | Hugging Face |
| ai-hhmi/lmd-vitl-p8-affinity-scratch | no disponible en la información | 256³ vóxeles | Afinidades para segmentación de neuronas | no disponible | Hugging Face |
| ai-hhmi/lmd-vitl-p8-simmim-lvd | 303 M (encoder) | no aplica (encoder) | Extracción de características 3D (SimMIM) | dinov3-license | Hugging Face |
| ai-hhmi/lmd-vitl-p8-simmim-scratch | 303 M (encoder, según descripción) | no aplica (encoder) | Extracción de características 3D (SimMIM) | no disponible | Hugging Face |

La comparación relevante es interna a la familia LMD: el modelo con inicialización DINOv3 se entrenó 100k pasos frente a los 75k del variante `scratch`, lo que sugiere una convergencia más rápida gracias al preentrenamiento. No se dispone de métricas para cuantificar la diferencia.

## Limitaciones y advertencias

- Dominio restringido: solo válido para imágenes de microscopía electrónica y de expansión a 8 nm isótropos; requiere remuestreo previo de otros datos.
- Normalización obligatoria: intensidades en [0, 1] con escalado por volumen (8 bits dividido por 255; 16 bits y flotantes recortados a percentiles 0,1 y 99,9). Un preprocesado incorrecto degrada la salida sin aviso.
- Orden de ejes crítico: la entrada debe ser (x, y, z); los volúmenes OME-Zarr y N5 suelen almacenarse (z, y, x) y necesitan `transpose(2, 1, 0)`.
- Tamaños no validados: el autor solo evaluó ventanas de 256³; el comportamiento con otras resoluciones de ventana no está caracterizado.
- Riesgo de alucinación estructural: como cualquier segmentador denso, puede generar fronteras plausibles pero incorrectas en regiones con poco contraste o artefactos de imagen; se recomienda validación con ground truth en el dominio de aplicación.
- Sesgos de dominio: el entrenamiento usa 41 volúmenes con predominio de tejido neural (corteza de ratón, pez cebra); el rendimiento en otros tejidos u organismos no está documentado.
- Licencia: `dinov3-license`, que no es una licencia open source estándar; es imprescindible revisar sus términos antes de uso comercial.
- Dependencia de código externo: requiere `mia-train` en el commit `0fe3872`; sus paquetes de nivel superior (`models`, `layers`, `utils`, `distributed`, `data`) colisionan con paquetes homónimos como `distributed` de Dask, lo que puede romper entornos existentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-lvd
- Modelo base (encoder SimMIM): https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-lvd
- Variante desde cero (SimMIM): https://huggingface.co/ai-hhmi/lmd-vitl-p8-simmim-scratch
- Variante de afinidades desde cero: https://huggingface.co/ai-hhmi/lmd-vitl-p8-affinity-scratch
- Repositorio de código mia-train: https://github.com/AI-HHMI/mia-train
- Repositorio de evaluación mia-evals: https://github.com/AI-HHMI/mia-evals
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Paper referenciado (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
