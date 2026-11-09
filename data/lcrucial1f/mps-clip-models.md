# lcrucial1f/MPS-CLIP-Models

## Resumen

MPS-CLIP (Multi-Perspective Subimage CLIP) es un modelo de recuperación imagen-texto especializado en teledetección (remote sensing), desarrollado por Yifan Li, Shiying Wang y Jianqiang Huang y presentado en el ICME 2026. Se construye sobre el backbone OpenCLIP ViT-B/32 preentrenado con LAION-2B, que permanece congelado, y añade adaptadores y cabeceras específicas para alinear imágenes aéreas y satelitales con descripciones textuales. El problema que aborda es la brecha semántica entre captions y escenas de teledetección, donde los objetos relevantes ocupan regiones pequeñas y dispersas dentro de la imagen.

El modelo se distribuye como checkpoints de PyTorch (`.pth`) para dos benchmarks estándar de recuperación imagen-texto en teledetección: RSICD y RSITMD. La innovación principal es el uso de subimágenes guiadas por palabras clave (keyword-guided subimages) tanto en entrenamiento como en inferencia, junto con una arquitectura de atención global que opera sobre los captions de un batch. Solo se entrenan 8,24 M de parámetros de un total de 159,5 M, lo que reduce drásticamente el coste de ajuste.

Es relevante ahora porque ofrece pesos abiertos (Apache-2.0) para una tarea de nicho con pocos modelos públicos de calidad, y porque su enfoque de adaptación ligera sobre CLIP congelado permite reproducir resultados con hardware modesto. No obstante, se trata de un modelo de investigación con requisitos de código específicos y sin pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (OpenCLIP) con backbone congelado + adaptadores G2A, cabecera MPR y puertas (gates) |
| Parametros totales | 159,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de recuperación imagen-texto, no generativo) |
| Tipos de cuantizacion | no disponible (checkpoints en punto flotante PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (los captions de RSICD y RSITMD están en inglés, pero la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (dict de `torch.save` con entradas `model` y `config`; 755 tensores) |

## Arquitectura y entrenamiento

El modelo parte de un backbone OpenCLIP ViT-B/32 inicializado desde LAION-2B (`laion2b_s34b_b79k`) que se mantiene completamente congelado. Sobre él se entrenan únicamente los adaptadores G2A, la cabecera MPR (multi-perspective retrieval), las puertas de combinación, la temperatura y los pesos de la función de pérdida: en total 8,24 M de parámetros de los 159,5 M del modelo. La innovación central es el uso de subimágenes guiadas por palabras clave, que se emplean tanto en entrenamiento como en test para capturar regiones relevantes de la escena aérea y alinearlas mejor con los términos del caption.

El entrenamiento se realizó con AdamW (lr 4e-4, betas 0,9/0,98, weight decay 0,04 sin aplicar a sesgos ni normas), schedule lineal con 10 % de warmup. Para RSICD se usaron 2 GPUs × 64 imágenes por paso durante 30 épocas, liberando el checkpoint de la época 11. Para RSITMD, 2 GPUs × 128 imágenes por paso con gradient checkpointing durante 35 épocas, liberando el de la época 21. La selección de checkpoint se hizo maximizando el mR sobre el split de test en cada época. El código de entrenamiento y el diseño de adaptadores se basan en HarMA (Apache-2.0). No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset más allá de los JSON de anotaciones (`rsicd_train1.json`, `rsitmd_train1.json`).

## Capacidades

- Recuperación imagen→texto y texto→imagen en dominios de teledetección (imágenes aéreas y satelitales).
- Alineación semántica mediante subimágenes guiadas por palabras clave, orientada a escenas con objetos pequeños y dispersos.
- Adaptación ligera sobre CLIP con backbone congelado, lo que permite ajuste con recursos limitados.
- Atención global en la torre de texto que opera a nivel de batch (los embeddings de caption dependen de los demás captions codificados conjuntamente).
- No es un modelo generativo: no produce texto libre, no soporta tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de visión general, audio ni modos de pensamiento.

## Casos de uso

- Búsqueda de imágenes satelitales por descripción textual: dado un caption como "un aeropuerto con dos pistas paralelas junto a una zona industrial", el modelo recupera las imágenes candidatas del archivo ordenadas por similitud, aprovechando las subimágenes guiadas por palabras clave para localizar los elementos descritos.
- Anotación asistida de archivos de imágenes aéreas: para un conjunto de imágenes sin etiquetar, se recuperan los captions más próximos de un corpus anotado, acelerando el etiquetado manual posterior por parte de analistas GIS.
- Construcción de índices de búsqueda multimodal en plataformas de observación de la Tierra: se generan embeddings de imagen y texto para permitir consultas en lenguaje natural sobre catálogos de escenas, con la ventana de batch de 128 captions como referencia para el procesamiento por lotes.
- Recuperación texto→imagen para estudios de cambio de uso del suelo: un investigador describe una tipología de escena (por ejemplo, "zona residencial densa con escasa vegetación") y obtiene imágenes de referencia para comparar con series temporales.
- Evaluación comparativa de modelos de teledetección: los checkpoints de RSICD y RSITMD sirven como línea base reproducible para investigar adaptaciones de CLIP en dominios aéreos, con métricas R@1/R@5/R@10 y mR ya publicadas.
- Filtrado y curación de datasets de teledetección: dado un conjunto de captions candidatos, se descartan o reordenan imágenes cuya similitud con el texto sea baja, usando los embeddings del modelo como señal de calidad de emparejamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los splits de test estándar (RSICD: 1.093 imágenes y 5.465 captions; RSITMD: 452 imágenes y 2.260 captions):

| Checkpoint | Dataset | Imagen→Texto R@1 / R@5 / R@10 | Texto→Imagen R@1 / R@5 / R@10 | mR |
|---|---|---|---|---|
| `MPS-CLIP_ViT-B-32_RSICD_rmean35.24.pth` | RSICD | 18,12 / 36,69 / 49,31 | 13,63 / 38,90 / 54,78 | 35,24 |
| `MPS-CLIP_ViT-B-32_RSITMD_rmean48.86.pth` | RSITMD | 28,10 / 52,65 / 63,27 | 22,43 / 54,82 / 71,86 | 48,86 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 159,5 M de parámetros totales y solo 8,24 M entrenables, el modelo completo en fp32 ocupa aproximadamente 0,64 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia por lotes; para reproducir el entrenamiento se usaron 2 GPUs × 128 imágenes por paso con gradient checkpointing (modelo de GPU no especificado).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño de parámetros.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante PyTorch y el repositorio de código MPS-CLIP (commit `f668644` o posterior), con `torch.load(..., weights_only=True)`.
- Latencia y throughput estimados: no disponibles. Para reproducir resultados exactos debe mantenerse `batch_size_test_text: 128` y el orden de captions de los ficheros de anotación, ya que la atención global del texto depende del batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| MPS-CLIP ViT-B/32 | 159,5 M (8,24 M entrenables) | Recuperación imagen-texto en teledetección (RSICD, RSITMD) | Apache-2.0 | Pesos `.pth` en Hugging Face |
| CLIP ViT-B/32 (LAION-2B) | ~151 M | Recuperación imagen-texto general | no disponible en la información | Pesos OpenCLIP públicos |
| HarMA | no disponible | Recuperación en teledetección (base del código de MPS-CLIP) | Apache-2.0 | Repositorio GitHub |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables sobre RSICD o RSITMD, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: requiere el código del repositorio en el commit `f668644` o posterior y carga con `strict=True`; no funciona como pipeline estándar de Hugging Face (pipeline no disponible).
- Dependencia del batch: la atención global del texto hace que el embedding de un caption dependa de los demás captions del batch, lo que impide un uso trivial caption a caption y exige replicar el orden y el tamaño de batch de test para obtener los números publicados.
- Dominio restringido: entrenado exclusivamente para recuperación imagen-texto en teledetección sobre RSICD y RSITMD; su rendimiento fuera de ese dominio no está caracterizado.
- Idiomas: no se declaran idiomas soportados; los captions de los benchmarks están en inglés, por lo que el comportamiento en castellano u otras lenguas no está validado.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; al ser un modelo de recuperación, el riesgo se manifiesta como falsos positivos en el ranking más que como texto inventado.
- Licencia Apache-2.0: permite uso comercial, pero el backbone subyacente (OpenCLIP/LAION) y el código HarMA tienen sus propias condiciones que deben verificarse.
- Sin métricas de latencia, throughput ni consumo de VRAM publicadas; las estimaciones de hardware deben validarse en el entorno de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/lcrucial1f/MPS-CLIP-Models
- Dataset: https://huggingface.co/datasets/lcrucial1f/MPS-CLIP_Data
- Paper (arXiv): https://arxiv.org/abs/2601.18190
- Código: https://github.com/Lcrucial1f/MPS-CLIP
- Commit requerido: https://github.com/Lcrucial1f/MPS-CLIP/commit/f668644
- Modelo base: https://huggingface.co/laion/CLIP-ViT-B-32-laion2B-s34B-b79K
- OpenCLIP: https://github.com/mlfoundations/open_clip
- HarMA (base del código): https://github.com/seekerhuang/HarMA
