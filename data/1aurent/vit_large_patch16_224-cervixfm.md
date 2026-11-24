# 1aurent/vit_large_patch16_224.cervixfm

## Resumen

CervixFM es un modelo fundacional de visión por computador especializado en el análisis de imágenes de citología cervical. Lo desarrolla un equipo del Southern Medical University (Cheng et al.) y se distribuye como preprint en Research Square vinculado a un envío a Nature Communications. El modelo parte de una arquitectura ViT-Large/16 y se preentrena desde cero con el marco de auto-supervisión DINOv2 sobre más de 64 millones de teselas extraídas de 18.375 imágenes de portaobjetos completos (WSI) procedentes de 38 lotes y 4 centros clínicos.

El repositorio que nos ocupa es una reconversión al formato de `timm` del checkpoint oficial. La conversión se ha validado con paridad bit a bit en los 342 tensores y paridad de activaciones capa por capa en resoluciones de entrada de 224, 256, 320, 384 y 512 píxeles. Esto lo convierte en una opción práctica para integrarlo directamente en pipelines de `timm` sin necesidad de cargar código personalizado.

Su relevancia radica en que cubre un nicho poco atendido: la extracción de características densas a partir de imágenes histológicas y citológicas de cérvix, una tarea donde los modelos genéricos de visión (ImageNet, CLIP) rinden por debajo de un dominio tan específico. Con 303,8 millones de parámetros y salida de embeddings de 1024 dimensiones, es un backbone de tamaño medio-grande pensado para clasificación y recuperación sobre parches o diapositivas completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large/16) preentrenado con DINOv2 |
| Parametros totales | 303.777.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 nativa, verificado hasta 512x512) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `timm` vía `hf-hub`) |

## Arquitectura y entrenamiento

El backbone es un ViT-Large/16 con dimensión de embedding 1024, profundidad 24, 16 cabezas de atención, FFN con SwiGLU fusionado, LayerScale inicializado a 1e-5 y sin tokens de registro (registers). El preentrenamiento se realiza desde cero con DINOv2, un marco auto-supervisado que combina destilación auto-supervisada, pérdida de consistencia entre vistas y regularización por centrado y afilado de las distribuciones del profesor. El corpus de entrenamiento supera los 64 millones de teselas provenientes de 18.375 WSI, recolectadas en 38 lotes y 4 centros, lo que aporta variabilidad de tinción y de escáner.

La conversión a `timm` remapea las claves de forma 1:1: los bloques `blocks.{c}.{g}` pasan a `blocks.{g}`, las proyecciones SwiGLU `w12`/`w3` se mapean a `fc1`/`fc2` y se descarta el `mask_token`, que solo se usa durante el entrenamiento. La verificación reportada incluye comparación sha256 de los 342 tensores y paridad de activaciones capa por capa (maxdiff 0.0, coseno 1.0) en las cinco resoluciones probadas. El pipeline de preprocesado reproduce el original: conversión a RGB, `ToTensor()` y normalización con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` a 224x224 nativo, sin recorte ni redimensionado en el nivel de parche. A nivel de WSI, se usan teselas de 256x256 con paso 128, redimensionadas bilinealmente a 224x224, y la característica de la diapositiva se obtiene por max-pooling de los tokens CLS de los parches. La cabeza es `Identity` (`num_classes=0`), de modo que la salida es un vector de 1024 dimensiones tras LayerNorm.

## Capacidades

- Extracción de características visuales de parches histológicos y citológicos de cérvix (salida 1024-d).
- Clasificación de imagen mediante cabezas lineales añadidas sobre el backbone congelado (linear probing).
- Aprendizaje por transferencia con fine-tuning completo del backbone para tareas de patología cervical.
- Recuperación por similitud (image retrieval) sobre diapositivas completas agregando embeddings de parches.
- Procesamiento de WSI mediante extracción de teselas con solapamiento y agregación por max-pooling de CLS.
- Robustez a variaciones de tinción y escáner derivada del entrenamiento multi-centro y multi-lote.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.

## Casos de uso

- **Cribado asistido de citología cervical**: usar los embeddings de 1024-d como entrada a un clasificador ligero (regresión logística o MLP) para discriminar entre categorías del sistema Bethesda sobre parches de Papanicolaou, aprovechando que el backbone ya ha visto más de 64 millones de teselas del mismo dominio.
- **Detección de células anómalas en parches**: fine-tuning del backbone con una cabeza de clasificación o segmentación por parche para localizar regiones sospechosas dentro de una WSI, usando la salida CLS a 224x224 como representación local.
- **Recuperación de casos similares en un archivo clínico**: indexar los embeddings de diapositivas (max-pool de CLS) en una base vectorial para que un patólogo recupere casos históricos morfológicamente parecidos a uno nuevo.
- **Control de calidad de tinción y escaneo**: entrenar un clasificador sobre los embeddings para detectar artefactos, desenfoques o tinciones defectuosas antes de que las muestras entren al flujo diagnóstico.
- **Preentrenamiento base para tareas derivadas**: servir como inicialización para modelos de detección de lesiones intraepiteliales (CIN1/CIN2/CIN3), reduciendo la necesidad de datos anotados en un dominio donde el etiquetado es caro.
- **Investigación en representaciones auto-supervisadas**: comparar DINOv2 en dominio citológico frente a backbones preentrenados en ImageNet o CLIP, con la ventaja de que la conversión a `timm` permite cambiar de backbone con una línea de código.
- **Agrupamiento no supervisado de morfologías**: aplicar clustering (k-means, UMAP) sobre los embeddings de parches para descubrir patrones morfológicos sin etiquetas, útil en fase exploratoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, AUROC, F1 ni comparaciones numéricas con otros modelos en tareas de citología cervical.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, más activaciones; en la práctica, unos 2-3 GB con lotes pequeños a 224x224.
- VRAM estimada en fp16/bf16: alrededor de 0,6 GB para pesos; en torno a 1,5-2 GB con activaciones para lotes moderados.
- GPU recomendadas: A100, H100 o L40S para procesar WSI completas a gran escala (miles de teselas por diapositiva); RTX 4090 o A6000 para experimentación y fine-tuning.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, incluso con fine-tuning a 224x224 y lotes pequeños.
- Opciones de despliegue: `timm` (recomendado, carga vía `hf-hub`), PyTorch nativo, TorchScript/ONNX para exportación, y frameworks de serving como TorchServe o Triton. No hay variantes GGUF ni soporte directo en llama.cpp/Ollama por ser un modelo de visión.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del número de teselas por diapositiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CervixFM (este) | 303,8 M | 224x224 nativo (hasta 512 verificado) | Citología/histología de cérvix | MIT | Hugging Face (`timm`) |
| ViT-L/16 DINOv2 (Meta) | ~304 M | 224x224 (hasta 518) | Imágenes naturales genéricas | Apache-2.0 | Hugging Face, `timm` |
| ViT-L/16 ImageNet-21k | ~304 M | 224x224 | Imágenes naturales genéricas | Apache-2.0 | Hugging Face, `timm` |
| UNI (Mahmood Lab) | ~307 M (ViT-L/16) | 224x224 | Histología general (WSI) | Solo uso no comercial | Hugging Face |

La comparación directa con UNI es la más pertinente por tamaño y dominio, pero no se dispone de cifras de rendimiento comparadas en la información proporcionada. Frente a DINOv2 e ImageNet, la ventaja de CervixFM es el preentrenamiento específico en citología cervical; la desventaja, la ausencia de benchmarks publicados que cuantifiquen esa ventaja.

## Limitaciones y advertencias

- No se han publicado métricas de validación clínica ni benchmarks en la información disponible; no debe asumirse rendimiento diagnóstico sin evaluación propia.
- Modelo entrenado exclusivamente en citología/histología de cérvix: el rendimiento fuera de ese dominio (otros órganos, otras modalidades) es incierto.
- Riesgo de sesgo por desbalance de los 4 centros y 38 lotes de origen: la distribución de tinciones, escáneres y poblaciones puede no representar otros entornos clínicos.
- No es un modelo generativo ni conversacional: no admite prompts en lenguaje natural ni tool calling.
- El preprocesado debe replicarse exactamente (normalización ImageNet, 224x224 sin recorte); desviarse de él degrada los embeddings.
- La licencia MIT permite uso comercial, pero el modelo no está certificado como dispositivo médico; cualquier uso clínico requiere validación regulatoria independiente.
- El checkpoint original se distribuye vía Google Drive; este repo es una conversión de terceros verificada, pero conviene contrastar con el original en entornos críticos.
- El tamaño del repo (1,2 GB) y la ausencia de cuantizaciones publicadas limitan su despliegue en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/vit_large_patch16_224.cervixfm
- Repositorio original: https://github.com/yehua201826/CervixFM
- Preprint (Research Square): https://doi.org/10.21203/rs.3.rs-8629620/v1
- DINOv2 (framework base): https://github.com/facebookresearch/dinov2
- `timm`: https://github.com/huggingface/pytorch-image-models
