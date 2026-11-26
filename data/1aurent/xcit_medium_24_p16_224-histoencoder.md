# 1aurent/xcit_medium_24_p16_224.histoencoder

## Resumen

HistoEncoder es un modelo fundacional de patología digital especializado en cáncer de próstata, desarrollado por Joona Pohieros, Oussama Batouche y colaboradores (Universidad de Helsinki y Hospital Universitario de Helsinki). Este repositorio concreto, `1aurent/xcit_medium_24_p16_224.histoencoder`, es el encoder `prostate_medium` portado al formato nativo de timm y al Hub de Hugging Face, con pesos idénticos bit a bit al checkpoint original. El backbone es un XCiT (Cross-Covariance Image Transformer) de tamaño medio con parches de 16 píxeles y resolución de entrada de 224×224, que produce embeddings de 512 dimensiones.

El modelo resuelve el problema de extraer representaciones útiles de imágenes de tejido prostático (tiles de whole-slide images) sin necesidad de etiquetas, gracias a un preentrenamiento autosupervisado con DINO sobre 48 millones de tiles procedentes de 1.307 pacientes (dataset HelsinkiProstate). Es relevante porque permite construir pipelines de análisis histopatológico (clasificación, recuperación por similitud, predicción de pronóstico) con un backbone ligero de 83,9 millones de parámetros y licencia Apache-2.0, evitando entrenar desde cero en un dominio donde los datos etiquetados son escasos y caros.

El interés práctico inmediato es que se distribuye en safetensors, se carga con una sola línea de timm y se integra en flujos estándar de visión por computador, lo que reduce la fricción para investigadores que quieran reproducir o extender los resultados del artículo publicado en el *Journal of Pathology Informatics* (2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XCiT (Cross-Covariance Image Transformer), variante `xcit_medium_24_p16_224` |
| Parametros totales | 83.909.248 (83,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de imagen 224×224, cualquier tamaño divisible por 16 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de PyTorch/timm no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB); checkpoint original en `.pth` |
| Dimensión de embedding | 512 |
| Tamaño de parche | 16 |
| Pooling | `global_pool='token'`, `num_classes=0` |
| Preprocesado | resize 224×224 bicúbico, normalización ImageNet (mean 0.485/0.456/0.406, std 0.229/0.224/0.225) |

## Arquitectura y entrenamiento

El backbone es un XCiT medio: un transformer con atención basada en covarianza cruzada entre tokens (cross-covariance attention), que reduce la complejidad respecto a la atención estándar al operar sobre la dimensión de features en lugar de sobre el número de tokens. La variante `medium_24_p16_224` emplea 24 bloques, parches de 16×16 y codificación posicional de Fourier, lo que permite entradas de tamaño variable siempre que sean divisibles por 16. El modelo se usa como extractor puro: la cabeza de clasificación se elimina (`num_classes=0`) y la salida es un embedding pooled de 512 dimensiones por imagen.

El preentrenamiento es autosupervisado con DINO sobre el dataset HelsinkiProstate, compuesto por 48 millones de tiles de tejido prostático provenientes de 1.307 pacientes. No se documenta en la información disponible el número exacto de épocas, la composición detallada del dataset ni si hubo fases posteriores de ajuste fino supervisado o RLHF (no aplicable en este dominio). El port a timm mantiene las claves del `state_dict` y los tensores idénticos al checkpoint original (`prostate_medium.pth`, sha256 `1bc5ac2b...`), por lo que los resultados son reproducibles respecto al upstream.

## Capacidades

- Extracción de features de imágenes de tejido histopatológico (tiles de WSI) en forma de embeddings de 512 dimensiones.
- Representaciones autosupervisadas reutilizables para clasificación, clustering y recuperación por similitud en dominio de patología prostática.
- Soporte de entradas de tamaño variable divisible por 16 gracias a la codificación posicional de Fourier dinámica.
- Integración nativa con timm: carga vía `timm.create_model('hf-hub:...')` y transformaciones resueltas desde `pretrained_cfg`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni otras modalidades fuera de imagen RGB.

## Casos de uso

- Clasificación de tiles prostáticos (benigno vs. maligno, Gleason grading): se extraen embeddings de 512 dimensiones con el encoder congelado y se entrena una cabeza lineal o un clasificador ligero encima; el backbone DINO aporta representaciones ya separables con pocas etiquetas.
- Recuperación de imágenes por similitud (content-based image retrieval): indexar embeddings de un archivo de WSI y recuperar los tiles más parecidos para revisión por patólogos o control de calidad de anotaciones.
- Predicción de pronóstico y desenlace clínico: agregar embeddings de múltiples tiles de un mismo paciente (mean pooling, attention pooling) y entrenar un modelo de supervivencia o regresión sobre las features agregadas, tal como plantea el artículo HistoEncoder.
- Segmentación y detección débilmente supervisada: usar los mapas de features del encoder como entrada a cabezas de segmentación o MIL (multiple instance learning) para localizar regiones tumorales en WSI completas.
- Preentrenamiento y ajuste fino en otros dominios histológicos: el backbone XCiT con pesos DINO sirve como inicialización para tareas de patología de otros órganos, reduciendo el coste de entrenamiento desde cero.
- Filtrado y curación de datasets: detectar tiles corruptos, duplicados o artefactos comparando embeddings y distancias coseno, útil en pipelines de construcción de datasets de patología.
- Investigación en representaciones autosupervisadas: benchmark de métodos de SSL en dominio médico usando un backbone ligero (83,9 M) y licencia permisiva que facilita la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (AUC, accuracy, F1) ni comparaciones cuantitativas con otros encoders; solo referencia el artículo HistoEncoder (arXiv:2411.11458) como fuente de evaluación, que no se detalla en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (83,9 M × 4 bytes) más memoria de activaciones, típicamente < 1 GB con batch pequeño a 224×224.
- VRAM estimada en fp16/bf16: aproximadamente 0,17 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). Para throughput alto en lote, A100/H100 o RTX 4090.
- Cabe en GPU consumer: sí, en todas las GPU modernas con ≥ 2 GB, incluidas integradas recientes con soporte CUDA/ROCm.
- Opciones de despliegue: timm + PyTorch (nativo), exportación a ONNX/TorchScript para serving, integración en pipelines con TorchServe o FastAPI. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un backbone de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, del tamaño de lote y de si se usa fp16/bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1aurent/xcit_medium_24_p16_224.histoencoder` | 83,9 M | imagen 224×224, divisible por 16 | Patología prostática (DINO, 48 M tiles) | Apache-2.0 | Hugging Face Hub, timm |
| XCiT medium estándar (ImageNet) | ~84 M | imagen 224×224 | Visión general (ImageNet) | Apache-2.0 (timm) | Hugging Face Hub, timm |
| HistoEncoder `prostate_small` | no disponible en la información | imagen 224×224 | Patología prostática | Apache-2.0 | GitHub (jopo666/HistoEncoder), pip |
| Otros encoders de patología (p. ej. CTransPath, Phikon) | no disponible en la información | imagen variable | Patología general | variable | Hugging Face Hub / GitHub |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada. La ventaja diferencial de este checkpoint frente al XCiT estándar es el preentrenamiento específico en dominio prostático; frente a otros encoders de patología, su tamaño contenido y su licencia Apache-2.0 facilitan el uso comercial y la integración en timm.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en patología prostática: su rendimiento en otros tejidos u órganos no está validado y probablemente sea inferior al de encoders generales o específicos de esos dominios.
- Riesgo de sesgo de dominio: el preentrenamiento usa 1.307 pacientes de una única institución (Helsinki), lo que puede limitar la generalización a otras poblaciones, escáneres y protocolos de tinción.
- No es un modelo generativo ni un LLM: no produce texto, no razona y no soporta tool calling; cualquier uso conversacional es inadecuado.
- El preprocesado del Hub usa estadísticas ImageNet, mientras que el CLI original de HistoEncoder usa interpolación bilineal y estadísticas estimadas del dataset (histoprep); esta discrepancia puede afectar a la reproducibilidad exacta de resultados upstream.
- Licencia Apache-2.0 permite uso comercial, pero el uso clínico real requiere validación regulatoria independiente; el modelo no es un dispositivo médico.
- No se documentan métricas de calibración, robustez ante artefactos de tinción ni análisis de subgrupos demográficos.
- El número de descargas y likes es 0 en el momento de la consulta, lo que indica adopción aún muy limitada y escasa validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/1aurent/xcit_medium_24_p16_224.histoencoder
- Paper HistoEncoder (arXiv): https://arxiv.org/abs/2411.11458
- Paper XCiT (arXiv): https://arxiv.org/abs/2106.09681
- Artículo en Journal of Pathology Informatics: https://www.sciencedirect.com/science/article/pii/S215335392600177X
- DOI: https://doi.org/10.1016/j.jpi.2026.100715
- Repositorio original: https://github.com/jopo666/HistoEncoder
- Pesos originales: https://dl.dropboxusercontent.com/s/k1fr09x5auki8sp/prostate_medium.pth?dl=0
