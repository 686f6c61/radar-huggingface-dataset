# raulgdp/beto-sarcasmo-spanish-2026

## Resumen

beto-sarcasmo-spanish-2026 es un modelo de clasificación de texto en español obtenido mediante fine-tuning supervisado de dccuchile/bert-base-spanish-wwm-cased, el conocido como BETO, publicado por el usuario raulgdp en Hugging Face. Su propósito declarado, a partir del identificador del repositorio, es la detección de sarcasmo en castellano, una tarea de clasificación binaria o multiclase sobre textos cortos. El modelo se generó con la librería Trainer de Transformers, lo que se refleja en una model card automática con métricas de evaluación pero sin documentación descriptiva del conjunto de datos ni del uso previsto.

Arquitectónicamente es un transformer encoder de tipo BERT en su variante base, con vocabulario y tokenizador en español y casing preservado, y un total de 109.852.418 parámetros en pesos safetensors. El repositorio ocupa 2,6 GB, coherente con pesos en fp32 más posibles artefactos de entrenamiento. No es un modelo generativo: no admite conversación, tool calling ni razonamiento multi-paso; su salida es una etiqueta de clasificación.

Su relevancia es acotada y práctica: cubre una tarea de nicho (sarcasmo en español) con métricas declaradas de accuracy y F1 ponderado en torno a 0,9166 sobre un conjunto de evaluación no especificado. Es útil como componente de un pipeline de moderación, análisis de sentimiento o investigación en pragmática computacional, pero carece de información sobre licencia, idiomas soportados y composición del dataset, lo que limita su adopción en producción sin una validación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERT-base multilingüe adaptado al español, WWM cased) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (arquitectura BERT-base: 512 tokens como máximo típico del tokenizador, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (el modelo base es específico de español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | dccuchile/bert-base-spanish-wwm-cased |
| Tamaño del repositorio | 2,6 GB |
| Descargas / likes | 9 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de BETO (dccuchile/bert-base-spanish-wwm-cased), un encoder BERT-base entrenado con whole word masking sobre corpus en español. La cabeza de clasificación se añade sobre el pooler del encoder y se entrena de forma supervisada con entropía cruzada. No hay indicios de arquitecturas híbridas, MoE, atención lineal ni decodificación especulativa: es un clasificador estándar de la familia BERT.

Los hiperparámetros declarados son: learning rate 2e-5, batch de entrenamiento y evaluación de 32, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 100 pasos de warmup, 5 épocas y precisión mixta nativa (AMP). El entrenamiento alcanzó 1.915 pasos totales (383 por época). No se especifica el dataset: la model card indica "None dataset" y deja vacías las secciones de descripción, usos previstos y datos de entrenamiento. Tampoco se documenta si hubo aumento de datos, balanceo de clases o validación cruzada, lo que impide evaluar la robustez del resultado más allá del conjunto de validación interno.

## Capacidades

- Clasificación de texto en español: emite una etiqueta por secuencia de entrada, presumiblemente relacionada con presencia o ausencia de sarcasmo.
- Análisis de sentimiento y pragmática a nivel de frase o párrafo corto, como uso derivado de la tarea de clasificación.
- Extracción de representaciones contextuales (embeddings del encoder) para tareas downstream, ya que el backbone BETO es reutilizable.
- Compatibilidad con text-embeddings-inference y endpoints compatibles, según los tags del repositorio.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; el modelo base está especializado en español.
- No dispone de mecanismo de contexto largo más allá del límite del tokenizador BERT.

## Casos de uso

- Moderación de comentarios en foros y redes: clasificar respuestas potencialmente sarcásticas o pasivo-agresivas para priorizar revisión humana, usando el modelo como filtro de primera pasada sobre textos cortos.
- Análisis de opinión en reseñas de producto: detectar reseñas sarcásticas que un clasificador de sentimiento estándar etiquetaría erróneamente como positivas, mejorando la precisión agregada del pipeline.
- Investigación en pragmática computacional: emplear el modelo como baseline reproducible para experimentos sobre ironía y sarcasmo en castellano, dado que parte de BETO y documenta hiperparámetros completos.
- Enriquecimiento de datasets de atención al cliente: etiquetar automáticamente transcripciones de chats y tickets para separar quejas genuinas de comentarios irónicos antes del análisis de sentimiento.
- Detección de toxicidad encubierta: combinar la señal de sarcasmo con un clasificador de toxicidad para reducir falsos negativos en sistemas de moderación que dependen del tono literal.
- Extracción de embeddings para búsqueda semántica: usar las representaciones del encoder BETO afinado para indexar textos y recuperar mensajes con carga irónica similar en un corpus.
- Preetiquetado en anotación humana: generar etiquetas preliminares en un flujo de anotación activa, reduciendo el coste de etiquetar manualmente grandes volúmenes de texto en español.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación interno (no se especifica su composición ni tamaño):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,5022 |
| Accuracy | 0,9166 |
| F1 weighted | 0,9166 |
| F1 macro | 0,9166 |
| Precision weighted | 0,9169 |
| Recall weighted | 0,9166 |

Evolución por época durante el entrenamiento:

| Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 383 | 0,2751 | 0,8876 | 0,8871 | 0,8871 |
| 2 | 766 | 0,2464 | 0,9123 | 0,9123 | 0,9123 |
| 3 | 1149 | 0,4110 | 0,9076 | 0,9074 | 0,9074 |
| 4 | 1532 | 0,5169 | 0,9159 | 0,9158 | 0,9158 |
| 5 | 1915 | 0,5022 | 0,9166 | 0,9166 | 0,9166 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. La pérdida de validación mínima se alcanza en la época 2 (0,2464) y aumenta después hasta 0,5022 en la época 5, mientras la accuracy sigue subiendo ligeramente: patrón compatible con sobreajuste moderado, aunque sin datos del conjunto no puede confirmarse.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,85 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,22 GB para pesos; cuantización a int8 no documentada pero viable con herramientas estándar de Transformers u ONNX.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o una RTX 4090 quedan sobradamente dimensionadas. Para despliegue por lotes a gran escala, A100 o H100 aportan throughput, no capacidad.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: Transformers con PyTorch, Text Embeddings Inference (tag del repositorio), endpoints compatibles, exportación a ONNX Runtime y cuantización con bitsandbytes u Optimum. No hay artefactos GGUF publicados, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beto-sarcasmo-spanish-2026 | 109,85 M | no disponible (BERT-base) | Clasificación de sarcasmo en español | no disponible | Hugging Face, 9 descargas |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110 M | 512 tokens | Modelo base de propósito general en español | no disponible en la información | Hugging Face, ampliamente usado |
| Modelos de análisis de sentimiento en español basados en BETO | ~110 M | 512 tokens | Clasificación de sentimiento | variable según autor | Hugging Face, múltiples variantes |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de accuracy y F1 no puede establecerse. La comparación se limita a arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: no documenta el dataset de entrenamiento, los usos previstos, los idiomas ni la licencia, lo que impide evaluar la representatividad de las métricas.
- Riesgo de sobreajuste: la pérdida de validación sube de 0,2464 (época 2) a 0,5022 (época 5) mientras la accuracy apenas mejora 0,004 puntos, lo que sugiere que el checkpoint final no es necesariamente el mejor para generalizar.
- Métricas sin contexto: accuracy y F1 de 0,9166 sobre un conjunto de evaluación no descrito; sin tamaño, composición ni distribución de clases no puede descartarse un desbalanceo que infle las métricas ponderadas.
- Sesgos: no documentados. Al derivar de BETO, hereda los sesgos del corpus de entrenamiento original, que no se detalla.
- Alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos, ironía cultural o dependiente del contexto extralingüístico.
- Limitaciones de contexto: arquitectura BERT, sin ventana extendida; textos largos deben truncarse, lo que puede eliminar la señal irónica.
- Licencia no disponible: no puede confirmarse el uso comercial; debe contactarse con el autor antes de integrarlo en un producto.
- Madurez: 9 descargas y 0 likes indican ausencia de validación por la comunidad; no hay evidencia de uso en producción.
- Idiomas: aunque el modelo base es de español, no se declara explícitamente el alcance dialectal (castellano de España frente a variedades latinoamericanas), lo que puede afectar al rendimiento en distintos registros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgdp/beto-sarcasmo-spanish-2026
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio BETO (GitHub): https://github.com/dccuchile/beto
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
