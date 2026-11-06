# leloss/LayaFace-DCF-HSF.v0.20261030

## Resumen

LayaFace-DCF-HSF.v0.20261030 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo de lenguaje generativo ni un `transformers.AutoModel` estándar, sino un bundle offline personalizado construido sobre un encoder de visión CLIP ViT-B/16 compartido, inicializado desde `openai/clip-vit-base-patch16` y adaptado mediante fine-tuning completo (encoder y cabeza de comparación) sobre datos sintéticos.

El modelo recibe dos recortes faciales alineados de 112x112 RGB, los redimensiona de forma independiente a 224x224, extrae embeddings de 768 dimensiones del token de clase tras layernorm y los compara mediante una cabeza GELU de 1536 → 256 → 1. Devuelve una decisión booleana de coincidencia, un logit crudo y una probabilidad calibrada por temperatura. La simetría está garantizada por construcción: intercambiar las dos entradas deja el logit invariante.

Es relevante ahora como release preliminar de investigación para estudios controlados de verificación por pares con consentimiento, no para producción biométrica. El autor advierte explícitamente que la política de umbral incluida está "ajustada en desarrollo, no aprobada para despliegue", y que las condiciones de licencia de los pesos derivados y del dataset sintético permanecen sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión CLIP ViT-B/16 (encoder compartido) con cabeza de comparación de pares GELU |
| Parametros totales | 86.193.153 (incluye cabeza de pares de 393.729 parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (etiqueta de idioma del repo; el modelo no procesa texto) |
| Licencia | No disponible (implementación propia Apache-2.0; CLIP base MIT; términos de pesos derivados y dataset sintético sin verificar) |
| Formato de pesos | Safetensors (bundle offline personalizado) |

## Arquitectura y entrenamiento

El modelo parte de un encoder de visión CLIP ViT-B/16 compartido entre las dos imágenes de entrada. Cada recorte facial alineado de 112x112 RGB se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. Se extraen embeddings de 768 dimensiones del token de clase tras layernorm, normalizados en L2. La comparación usa características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]` que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La salida incluye decisión booleana de coincidencia, logit crudo y probabilidad de misma persona escalada por temperatura. El intercambio de entradas no altera el logit.

El entrenamiento (variante F1) adapta tanto el encoder de visión como la cabeza de pares retenida, con 15.983 identidades sintéticas de DCFace y HSFace10K y 782.382 imágenes, usando entropía cruzada binaria por pares con balance de clases. El presupuesto registrado es de 4 épocas y este checkpoint se seleccionó en la época 4 por mínima NLL cruda en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera de la adaptación. FLUXSynID y los cinco benchmarks de caras reales son fuentes solo de test. El autor advierte que la adaptación sintética no implica que el preentrenamiento CLIP o el generador sintético no hayan visto fotografías reales.

La política ajustada incluida en el bundle fija temperatura `1.18845420485`, umbral de logit crudo `1.6029984951`, probabilidad `sigmoid(raw_logit / temperature)` y decisión `raw_logit >= threshold`. La temperatura se ajustó solo en la partición Calibrate y el umbral solo en la partición Threshold con un objetivo de FMR del 1% usando 20.000 pares no coincidentes.

## Capacidades

- Verificación facial simétrica de dos imágenes: decide si dos recortes alineados corresponden a la misma persona.
- Salida de logit crudo y probabilidad calibrada por temperatura, además de la decisión booleana.
- Invariancia al orden de las entradas: intercambiar referencia y sonda no cambia el logit.
- Caché del embedding del encoder para comparaciones repetidas contra una misma referencia.
- Inferencia en CPU o CUDA según la instalación de PyTorch.
- No incluye detección ni alineación de landmarks: ambas son operaciones upstream obligatorias.
- No es un modelo generativo ni procesa texto; no soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe no aplicable (modelo de visión).

## Casos de uso

- Estudios controlados de verificación por pares con consentimiento: el modelo está diseñado para comparar dos recortes alineados en entornos de investigación con sujetos que han dado su consentimiento, usando la política de umbral incluida como punto de partida a revalidar.
- Evaluación comparativa de pipelines de alineación facial: al requerir recortes 112x112 ya alineados, sirve para medir el impacto de distintas etapas upstream de detección y alineación sobre la precisión final de verificación.
- Investigación sobre calibración y umbrales: el bundle incluye temperatura y umbral ajustados en particiones específicas, lo que permite estudiar cómo se comportan al trasladarse a poblaciones nuevas con distinta prevalencia de coincidencias.
- Análisis de robustez demográfica: dado que el autor declara que la robustez demográfica no está establecida, el modelo puede usarse como objeto de estudio para medir disparidades por subgrupo en condiciones controladas.
- Prototipado de sistemas de comparación con caché de embeddings: la posibilidad de cachear la representación de la referencia permite construir demos de comparación uno-a-muchos contra un conjunto fijo de referencias.
- Docencia y reproducción de resultados: el repo incluye `evaluation.json` con métricas y detalles de política legibles por máquina, útil para replicar las cifras reportadas en entornos académicos.
- No adecuado para identificación biométrica en producción, vigilancia ni identificación de personas en espacios públicos, según los términos del autor.

## Benchmarks y rendimiento

Resultados de esta semilla concreta (no promedios de tres semillas del paper). Las métricas sintéticas usan la política ajustada en desarrollo incluida. ECE es ECE de confianza de clase predicha con diez bins. Porcentajes salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 97,83 | 97,83 | 1,03 | 3,30 | 0,9987 | 0,28 | 0,0123 |
| FLUX | 97,66 | 97,66 | 4,69 | 0,00 | 0,9999 | 3,07 | 0,0283 |

La precisión en caras reales usa el protocolo estándar de diez folds de cada dataset: se ajusta un umbral de score en nueve folds y se prueba en el restante. No es la precisión del umbral operativo sintético incluido. Los pesos permanecen fijos durante toda la evaluación.

| Benchmark real | Accuracy diez folds (%) |
|---|---:|
| lfw | 98,68 |
| cfp_fp | 93,99 |
| agedb_30 | 88,12 |
| calfw | 90,50 |
| cplfw | 84,92 |
| Media | 91,24 |

Nota del autor: una imagen constante de CPLFW aparece en 13 pares, que la evaluación compartida cuenta como no coincidencias. Los recortes inválidos lanzan un error durante la inferencia ordinaria. Las predicciones de benchmark se sellaron antes de puntuar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 86,2 M de parámetros en fp32 el peso ronda los 0,34 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no especificadas por el autor; cualquier GPU compatible con CUDA y PyTorch es suficiente dado el tamaño del modelo. El ejemplo de la model card usa `device="cpu"`.
- Cabe en GPU consumer: sí, por tamaño; el repo ocupa 0,3 GB.
- Opciones de despliegue: bundle offline personalizado con `snapshot_download` de `huggingface_hub` e importación de `laya_face.v2.FaceModelV2`. No es compatible con `transformers.AutoModel`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El autor recomienda revisar el código Python incluido antes de importarlo y ejecutar `pip install -r requirements.txt`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de verificación facial ni datos de alternativas como ArcFace, FaceNet o variantes de CLIP adaptadas a verificación.

## Limitaciones y advertencias

- No aprobado para producción biométrica, decisiones autónomas en medios adversos, vigilancia ni identificación de personas en espacios públicos.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna.
- La política de umbral está ajustada en desarrollo, no aprobada para despliegue; el objetivo del 1% de FMR es un punto operativo empírico, no una garantía sobre otros datasets o poblaciones.
- Las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias adecuada, validación y salvaguardas.
- Robustez demográfica, detección de vitalidad, resistencia a ataques de presentación y rendimiento end-to-end en medios adversos no están establecidos.
- Los resultados reportados conciernen pares de benchmark fijos y no establecen robustez en una población de despliegue nueva.
- Requiere recortes faciales ya alineados de 112x112 RGB; la detección y alineación son operaciones upstream no incluidas y los recortes inválidos lanzan error.
- Licencia de los pesos derivados y del dataset sintético sin verificar; la implementación propia se declara Apache-2.0 y CLIP base es MIT, pero no hay licencia permisiva confirmada para los pesos.
- Riesgo de sesgo y alucinación en el sentido de falsos positivos o negativos no cuantificado más allá de las métricas reportadas.
- Uso consecuente requiere revisión por un humano cualificado con salvaguardas legales y organizativas apropiadas.
- El repo no distribuye imágenes de entrenamiento o benchmark, etiquetas privadas ni credenciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leloss/LayaFace-DCF-HSF.v0.20261030
- Modelo base CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Paper DCFace (arXiv:2304.07060): https://arxiv.org/abs/2304.07060
- Paper de calibración de temperatura (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
