# Sentinal4D/PhenoSeq

## Resumen

PhenoSeq es un modelo de difusión condicional desarrollado por Sentinal4D en colaboración con el Institute of Cancer Research y el Alan Turing Institute, diseñado para generar representaciones transcriptómicas de células individuales a partir de imágenes de microscopía de fluorescencia. El modelo traduce características visuales extraídas con un ViT-L (5 canales de fluorescencia, 5.120 dimensiones por célula) en embeddings de RNA-seq en el espacio de scGPT (512 dimensiones), permitiendo la predicción del estado transcriptómico sin necesidad de secuenciación experimental.

El modelo emplea un denoiser de difusión con arquitectura transformer de atención cruzada, con aproximadamente 168 millones de parámetros, entrenado sobre el dataset scGeneScope de Altos Labs. Su relevancia actual radica en que aborda el problema de integrar fenotipo morfológico y transcriptómica a escala unicelular, lo que puede acelerar significativamente los pipelines de descubrimiento de fármacos al sustituir costosos ensayos de secuenciación por análisis de imagen. El repositorio incluye un pipeline de inferencia autocontenido, estadísticas de normalización de imagen y scripts para clasificación downstream de tipos celulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atención cruzada (cross-attention denoiser) con 6 bloques, 8 cabezas, dim 1024 |
| Parametros totales | ~168 M |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el contexto es el conjunto de características de imagen, típicamente N=16 células de imagen) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión completa, checkpoint PyTorch) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (best_model.pt), incluye img_norm.npz |

## Arquitectura y entrenamiento

PhenoSeq es un modelo de difusión gaussiano que predice el ruido ε ∈ ℝ^512 para reconstruir embeddings scGPT a partir de características de imagen. La arquitectura se compone de un codificador de imagen (transformer de 2 capas de self-attention) que proyecta las características de entrada (B, N, 5120) a un contexto de 1024 dimensiones, seguido de 6 bloques de atención cruzada donde las consultas provienen del embedding de RNA ruidoso y las claves/valores del contexto de imagen. Cada bloque incorpora self-attention y normalización adaptativa de capa condicionada al timestep de difusión. El proceso de difusión utiliza un schedule coseno con T=1.000 pasos y EMA con decay 0,9999.

El entrenamiento se realizó desde cero sobre el dataset scGeneScope de Altos Labs, que contiene pares de imágenes de microscopía (embeddings ViT-L/14 de 5 canales de fluorescencia) y embeddings scGPT de RNA-seq emparejados a nivel de pocillo. Se usó batch size 256, learning rate 1e-4 con warmup coseno, y un máximo de 5.000 épocas, aunque el mejor rendimiento en validación se obtuvo en la época 87 con un MSE de 0,1683. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo generativo continuo, no de lenguaje.

## Capacidades

- Generación de embeddings transcriptómicos (scGPT-space, 512 dimensiones) condicionados a imágenes de microscopía de fluorescencia.
- Traducción imagen-a-RNA a resolución unicelular: dado un conjunto de características de imagen de una muestra, predice el perfil transcriptómico de células individuales.
- Inferencia con DDIM en 50 pasos (rápida) o DDPM completo en 1.000 pasos (más lento pero potencialmente más fiel).
- Normalización automática de características de imagen mediante estadísticas precomputadas (img_norm.npz) del split de entrenamiento de scGeneScope.
- Salida directamente utilizable para tareas downstream: clasificación de tipos celulares, clustering y análisis de trayectorias.
- Incluye scripts de inferencia a gran escala sobre datos cacheados en formato .npz y un clasificador mejorado para evaluación (classify_improved.py).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de generación de vectores, no un LLM.

## Casos de uso

- Descubrimiento de fármacos a partir de imágenes Cell Painting: PhenoSeq permite predecir el efecto transcriptómico de compuestos químicos analizando solo imágenes de microscopía, reduciendo la necesidad de secuenciación RNA-seq en campañas de screening de alto contenido.
- Selección de candidatos terapéuticos en oncología: dado un panel de líneas celulares cancerosas tratadas con distintos fármacos, el modelo genera perfiles transcriptómicos predichos que pueden correlacionarse con respuestas fenotípicas, priorizando compuestos con mecanismos de acción deseados.
- Integración multimodal de datos ómicos y de imagen: los embeddings generados pueden fusionarse con datos de expresión real para aumentar conjuntos de datos escasos, mejorando la robustez de modelos de clasificación de tipos celulares.
- Validación de hipótesis mecanísticas: investigadores pueden generar transcriptomas predichos a partir de imágenes de células con perturbaciones genéticas (p. ej. CRISPR) y compararlos con perfiles reales para inferir vías afectadas.
- Control de calidad en experimentos de imagen de alto contenido: PhenoSeq puede detectar anomalías en la morfología celular prediciendo el transcriptoma esperado y comparándolo con valores de referencia, identificando artefactos o contaminación.
- Generación de datos sintéticos para entrenamiento de modelos downstream: los embeddings generados pueden servir como aumentación de datos para clasificadores de tipos celulares o modelos de inferencia de redes reguladoras, especialmente cuando los datos reales son limitados.

## Benchmarks y rendimiento

El autor declara en la model card un único resultado de validación:

| Tarea | Métrica | Valor | Verificado |
|---|---|---|---|
| Image-conditioned RNA-seq generation | Validation MSE Loss (epoch 87) | 0,1683 | No |

No se han publicado resultados de benchmarks comparativos con otros modelos (p. ej. scGPT, CPA, Geneformer) en la información disponible. El repositorio menciona un archivo PERFORMANCE_ANALYSIS.md con resultados de clasificación downstream, pero su contenido no está incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~168 M de parámetros, lo que en precisión FP32 ocupa aproximadamente 672 MB de memoria. Con las activaciones y el contexto de imagen (N=16, 5120 dims), la inferencia en batch pequeño (8 muestras) debería caber en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA y al menos 4 GB de VRAM (p. ej. NVIDIA T4, RTX 3060, RTX 4090). Para entrenamiento desde cero se requeriría una GPU con mayor memoria (16 GB o más) dado el batch size de 256.
- Sí cabe en GPUs de consumo: una RTX 3060 o superior es suficiente para inferencia.
- Opciones de despliegue: el pipeline se proporciona como script Python (pipeline.py) con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje. El despliegue típico sería un servicio de inferencia personalizado con FastAPI o similar.
- Latencia y throughput: no disponible. Con 50 pasos DDIM y un modelo de 168 M de parámetros, se estima una latencia de decenas de milisegundos por muestra en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de generación imagen-a-transcriptoma. Existen alternativas como scGPT (modelo base de transcriptómica, no generativo de imagen), CPA (Chemical Perturbation Autoencoder, que predice respuestas a perturbaciones pero no usa imágenes) o modelos de Cell Painting como CellProfiler embeddings, pero no hay datos públicos de rendimiento comparativo con PhenoSeq. La comparativa queda pendiente de la publicación de benchmarks estandarizados.

## Limitaciones y advertencias

- El modelo solo acepta características de imagen extraídas con un backbone ViT-L/14 específico y 5 canales de fluorescencia; no es compatible con otros formatos de imagen sin reentrenar o adaptar el codificador.
- Las estadísticas de normalización (img_norm.npz) se calcularon sobre el split de entrenamiento de scGeneScope; si se aplica el modelo a un dataset diferente, es necesario recalcularlas, lo que requiere acceso a datos de imagen del nuevo dominio.
- La salida son embeddings en el espacio de scGPT, no valores de expresión génica directa. Para interpretar biológicamente los resultados se necesita un decodificador o un modelo de anotación adicional.
- El rendimiento se evaluó únicamente con MSE loss en validación; no hay métricas de calidad biológica (p. ej. correlación con expresión real, precisión de clasificación de tipos celulares) publicadas en la model card.
- El modelo fue entrenado con datos de scGeneScope, que pueden tener sesgos hacia ciertos tipos celulares o condiciones experimentales; la generalización a tejidos o especies no representadas no está garantizada.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (scGeneScope) pueden tener sus propias restricciones de uso que deben verificarse.
- No se proporcionan pesos en formatos cuantizados (GGUF, ONNX, etc.), lo que limita el despliegue en entornos sin PyTorch o con restricciones de memoria.
- El modelo no es un LLM: no genera texto, no tiene capacidades de razonamiento ni soporte multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/Sentinal4D/PhenoSeq
- GitHub (reednaidoo/PhenoSeq): https://github.com/reednaidoo/PhenoSeq
- Sitio web de Sentinal4D: https://www.sentinal4d.com/
- Artículo en Substack (CY5TEM): https://cy5tem.substack.com/p/cy5tem-1-how-sentinal4d-is-solving
- Nota de prensa (troy-technical.com): https://troy-technical.com/2026/06/20/christ-church-led-team-develops-phenoseq-ai-to-accelerate-cancer-drug-discovery-by-extracting-transcriptomic-profiles-from-cell-images/
- Dataset scGeneScope: https://huggingface.co/datasets/altoslabs/scGeneScope
