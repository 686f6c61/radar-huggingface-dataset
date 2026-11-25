# hiraltalsaniya/bert-base-uncased-finetunedINv-ner

## Resumen

`bert-base-uncased-finetunedINv-ner` es un ajuste fino de BERT-base (versión uncased) publicado por el usuario hiraltalsaniya en Hugging Face, orientado a la tarea de reconocimiento de entidades nombradas (NER) como problema de clasificación de tokens (`token-classification`). Se trata de un modelo encoder-only de tipo transformer, con 130.784.275 parámetros, derivado directamente de `google-bert/bert-base-uncased` y entrenado mediante la librería Transformers con el `Trainer` estándar.

El modelo parte de la arquitectura BERT-base original (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, vocabulario de 30.522 tokens WordPiece) y añade una cabeza de clasificación de tokens. No incorpora innovaciones arquitectónicas propias: es un ajuste supervisado clásico sobre un corpus de NER no especificado en la model card, con una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada y debe enmarcarse en un contexto de experimentación: las métricas declaradas por el autor son modestas (F1 de 0,4254, precisión de 0,5290 y recall de 0,3557 sobre el conjunto de evaluación), y la documentación del modelo es prácticamente inexistente (la model card indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento). Resulta útil como ejemplo reproducible de ajuste fino de BERT para NER, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base) con cabeza de clasificación de tokens |
| Parametros totales | 130.784.275 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, ONNX ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; el corpus de ajuste no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,6 GB, lo que sugiere artefactos de entrenamiento además de los pesos) |

## Arquitectura y entrenamiento

La arquitectura es la de BERT-base estándar: un transformer encoder-only con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 110 millones de parámetros en el cuerpo, más una cabeza lineal de clasificación de tokens que eleva el total a 130.784.275 parámetros. El modelo base es `google-bert/bert-base-uncased`, preentrenado con los objetivos de masked language modeling y next sentence prediction sobre texto en inglés. El ajuste fino se realizó con `Trainer` de Transformers, sin indicios de RLHF, DPO ni técnicas de alineación.

Los hiperparámetros documentados son: learning rate de 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 60 épocas. El conjunto de entrenamiento no se identifica en la model card (aparece como "None dataset"), y el número de pasos registrados (126 por época) sugiere un conjunto de aproximadamente 2.016 ejemplos con batch de 16. La evolución del entrenamiento muestra un sobreajuste claro: la pérdida de validación asciende desde 0,8572 en la época 1 hasta 1,3696 en la época 48, mientras la pérdida de entrenamiento cae hasta 0,0018. El mejor F1 se alcanza en las épocas 46-47 (0,4312 y 0,4302), con una precisión que se estabiliza en torno a 0,52-0,54 y un recall que no supera 0,37.

## Capacidades

- Reconocimiento de entidades nombradas (NER) como clasificación de tokens: asignación de etiquetas BIO/BILOU a cada token de entrada.
- Extracción de entidades en texto en inglés no capitalizado (modelo uncased), lo que lo hace robusto a variaciones de mayúsculas.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para párrafos y documentos cortos.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- No dispone de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Extracción de entidades en prototipos de investigación: útil para validar pipelines de NER sobre textos en inglés antes de invertir en modelos mayores o en anotación adicional, dado su bajo coste computacional.
- Etiquetado asistido de corpus: el modelo puede preanotar entidades para que un humano las revise, reduciendo el esfuerzo inicial de anotación, aunque su recall de 0,3557 exige revisión exhaustiva.
- Clasificación de tokens en entornos con recursos limitados: con 130 millones de parámetros cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en servicios de bajo tráfico o en dispositivos periféricos.
- Docencia y reproducción de experimentos: sirve como ejemplo completo de ajuste fino de BERT con `Trainer`, incluyendo curvas de entrenamiento y sobreajuste, para cursos de NLP.
- Baseline interno en evaluación de modelos NER: sus métricas publicadas (F1 0,4254) permiten establecer una referencia mínima frente a la que comparar modelos propios.
- Filtrado de entidades en pipelines de preprocesamiento: puede utilizarse como primer paso para detectar menciones de personas u organizaciones en textos en inglés antes de un análisis posterior, siempre con validación humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (última época registrada, época 48):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 1,3696 |
| Precision | 0,5323 |
| Recall | 0,3561 |
| F1 | 0,4268 |
| Accuracy | 0,9049 |

Mejor F1 registrado durante el entrenamiento: 0,4312 en la época 46 (precisión 0,5456, recall 0,3565, accuracy 0,9049). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003) en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (130,8 millones de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en total.
- VRAM estimada en FP16: aproximadamente 0,26 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona correctamente en NVIDIA T4, RTX 3060, RTX 4090, A100 y H100, aunque el modelo no aprovecha la capacidad de estas últimas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TorchServe, ONNX Runtime (previa exportación), FastAPI con inferencia directa. No se documentan versiones GGUF ni soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hiraltalsaniya/bert-base-uncased-finetunedINv-ner | 130,8 M | 512 | NER (token-classification) | Apache 2.0 | Hugging Face, 16 descargas |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| dslim/bert-base-NER | ~110 M | 512 | NER (CoNLL-2003) | MIT | Hugging Face, muy popular |
| Jean-Baptiste/roberta-large-ner-english | ~355 M | 512 | NER | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con estos modelos. La comparación cualitativa se limita al tamaño, la licencia y la tarea; el modelo analizado presenta métricas notablemente inferiores a las habituales en modelos NER populares, aunque no se aportan cifras de estos últimos en la documentación consultada.

## Limitaciones y advertencias

- Métricas bajas: F1 de 0,4254 y recall de 0,3557 indican que el modelo pierde más de la mitad de las entidades reales en el conjunto de evaluación.
- Sobreajuste severo: la pérdida de validación crece de forma monotónica desde la época 1, y el entrenamiento se prolonga hasta 60 épocas sin early stopping documentado.
- Documentación insuficiente: la model card no describe el dataset, los idiomas, las etiquetas ni los usos previstos; la sección de limitaciones indica "More information needed".
- Idioma: el modelo base es uncased en inglés; no hay evidencia de soporte para castellano ni otros idiomas.
- Sesgos: no documentados; al derivar de BERT-base entrenado con texto web en inglés, es probable que herede sesgos de género, raza y nacionalidad, pero no se han evaluado.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto libre), pero puede producir etiquetas incorrectas con alta confianza en tokens ambiguos.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de ajuste impide verificar la procedencia de los datos y posibles restricciones adicionales.
- Producción: no recomendado como componente crítico sin una evaluación propia sobre el dominio objetivo y sin un umbral de confianza calibrado.
- Repositorio de 18,6 GB: incluye artefactos de entrenamiento (checkpoints), lo que dificulta su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hiraltalsaniya/bert-base-uncased-finetunedINv-ner
- Modelo base: https://huggingface.co/bert-base-uncased
- Modelo base (organización Google): https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentación de Transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
