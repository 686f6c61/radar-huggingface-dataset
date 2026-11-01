# MayorChris/xlm_r-prostata-bs16

## Resumen

xlm_r-prostata-bs16 es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de FacebookAI/xlm-roberta-large sobre un conjunto de datos no especificado en la model card. Lo desarrolla el usuario MayorChris y se publica bajo licencia MIT. Su propósito declarado, a juzgar por el nombre del identificador, es la identificación de entidades o etiquetas relacionadas con próstata en texto clínico o biomédico, aunque el autor no documenta ni el dataset ni el dominio de aplicación.

Arquitectura XLM-RoBERTa large: transformer encoder de tipo BERT con 24 capas, 1024 dimensiones ocultas y 558.864.407 parámetros totales (según safetensors). Es un modelo multilingüe de base, entrenado originalmente con masked language modeling sobre corpus multilingües, y aquí adaptado a una tarea concreta de etiquetado a nivel de token.

Su relevancia es limitada y muy específica: se trata de un checkpoint de investigación con 17 descargas, sin métricas de benchmark publicadas en el model-index (la lista de resultados está vacía) y con una model card autogenerada por el Trainer. Los resultados de validación declarados por el autor son altos (F1 0,9848, accuracy 0,9971), pero deben interpretarse con cautela porque no se describe el conjunto de evaluación ni el esquema de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large, tipo BERT) |
| Parametros totales | 558.864.407 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large admite hasta 512 tokens de entrada, dato de la arquitectura base, no declarado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa es multilingüe, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-large, un encoder transformer de 24 capas con 16 cabezas de atención, 1024 dimensiones ocultas y vocabulario SentencePiece de 250.002 tokens, sobre el que se añade una cabeza de clasificación de tokens. El fine-tuning se realizó con el Trainer de Hugging Face (Transformers 5.20.2, PyTorch 2.11.0+cu130) durante 8 épocas, con batch size de 16, learning rate 2e-5, scheduler lineal, semilla 42, optimizador AdamW fused y precisión mixta nativa (AMP). El conjunto de entrenamiento no se identifica en la model card ("on the None dataset"), por lo que se desconoce el número de tokens, la composición del corpus y el esquema de etiquetas.

No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo discriminativo de etiquetado. Tampoco se describen innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). El entrenamiento alcanza 1560 pasos totales, lo que sugiere un dataset pequeño o moderado: con batch efectivo de 16 y 8 épocas, el conjunto de entrenamiento rondaría las 3.120 muestras.

## Capacidades

- Clasificación de tokens (token classification): asigna una etiqueta a cada token de entrada, típicamente en tareas de reconocimiento de entidades nombradas (NER) o extracción de información.
- Etiquetado de entidades en texto: por el identificador del modelo, orientado a entidades del dominio de próstata (posiblemente hallazgos clínicos, procedimientos o términos anatomopatológicos), aunque el esquema exacto no está documentado.
- Comprensión contextual bidireccional: al ser un encoder, cada token se representa con contexto a izquierda y derecha.
- Capacidad multilingüe potencial: heredada del modelo base XLM-RoBERTa, si bien no se declara ni se evalúa en la model card.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un modelo exclusivamente discriminativo.

## Casos de uso

- Extracción de entidades clínicas en informes de anatomía patológica: el modelo puede etiquetar términos relacionados con próstata (hallazgos, grados Gleason, procedimientos) en texto libre, aprovechando el fine-tuning sobre el dominio.
- Preanotación en pipelines de etiquetado manual: sirve como primer paso para que anotadores humanos revisen y corrijan, reduciendo el coste de construcción de corpus clínicos etiquetados.
- Búsqueda semántica sobre historiales: las etiquetas por token permiten indexar y filtrar documentos por entidades prostáticas concretas en sistemas de recuperación de información biomédica.
- Estructuración de datos no estructurados: convertir notas clínicas en campos estructurados (por ejemplo, localización, diagnóstico, tratamiento) para bases de datos de investigación.
- Filtrado y triaje de documentación médica: clasificar fragmentos que mencionan patología prostática para derivarlos a revisión especializada o a módulos de análisis posteriores.
- Prototipado rápido en investigación NLP clínica: al ser un checkpoint pequeño (2,3 GB) con licencia MIT, es sencillo desplegarlo en entornos de experimentación con `transformers` y una GPU consumer.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de validación declaradas por el autor durante el entrenamiento:

| Epoca | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,0795 | 0,9036 | 0,9100 | 0,9068 | 0,9824 |
| 2 | 0,0387 | 0,9329 | 0,9275 | 0,9302 | 0,9902 |
| 3 | 0,0254 | 0,9558 | 0,9657 | 0,9607 | 0,9939 |
| 4 | 0,0221 | 0,9671 | 0,9709 | 0,9690 | 0,9950 |
| 5 | 0,0218 | 0,9761 | 0,9799 | 0,9780 | 0,9961 |
| 6 | 0,0195 | 0,9780 | 0,9799 | 0,9790 | 0,9965 |
| 7 | 0,0193 | 0,9851 | 0,9845 | 0,9848 | 0,9971 |
| 8 | 0,0186 | 0,9826 | 0,9851 | 0,9838 | 0,9971 |

Resultado final declarado en la evaluación: loss 0,0193, precision 0,9851, recall 0,9845, F1 0,9848, accuracy 0,9971. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 2,2 GB solo para pesos (558,9 M de parámetros); en fp16/bfloat16, aproximadamente 1,1 GB; en int8, en torno a 0,6 GB. A esto hay que sumar memoria para activaciones y el vocabulario de 250k tokens, por lo que conviene reservar 3-4 GB en fp32 y 2-3 GB en fp16 para secuencias de hasta 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, una A100 o H100 permiten mayor throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`; exportación a ONNX Runtime para inferencia en CPU; TorchScript; despliegue como microservicio con FastAPI o Triton. No hay pesos GGUF publicados, aunque es posible convertirlos con herramientas de conversión a GGUF para llama.cpp/Ollama, si bien el soporte de XLM-RoBERTa en llama.cpp es limitado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un encoder de 558 M de parámetros, en una RTX 4090 se esperan decenas de miles de tokens por segundo en fp16 con lotes grandes, pero es una estimación orientativa, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MayorChris/xlm_r-prostata-bs16 | 558,9 M | no disponible (base: 512) | Token classification (dominio próstata) | MIT | Hugging Face, 17 descargas |
| FacebookAI/xlm-roberta-large | 558,9 M | 512 | Modelo base multilingüe (MLM) | MIT | Hugging Face, ampliamente usado |
| PlanTL-GOB-ES/bsc-bio-ehr-es | ~110 M (RoBERTa base) | 512 | NER clínico en español | Apache 2.0 | Hugging Face |
| d4data/biomedical-ner-all | ~110 M (BERT base) | 512 | NER biomédico en inglés | MIT | Hugging Face |

La comparación directa es difícil porque no existen resultados de benchmark publicados para xlm_r-prostata-bs16 frente a alternativas. Frente al modelo base, la diferencia es la cabeza de clasificación y el ajuste de dominio; frente a modelos NER clínicos consolidados (bsc-bio-ehr-es, biomedical-ner-all), este checkpoint es de mayor tamaño (large frente a base) pero carece de documentación sobre el esquema de etiquetas y el corpus, lo que impide una evaluación objetiva.

## Limitaciones y advertencias

- Model card autogenerada e incompleta: no se documenta el dataset, el esquema de etiquetas, los idiomas ni los usos previstos; el apartado "Intended uses & limitations" dice literalmente "More information needed".
- Métricas no verificables: el F1 de 0,9848 y la accuracy de 0,9971 proceden de un conjunto de validación no descrito; sin información sobre el desbalance de clases ni el esquema de etiquetas, no pueden compararse con otros modelos.
- Riesgo de sobreajuste: 8 épocas sobre un dataset aparentemente pequeño (~3.120 muestras) con un modelo de 558 M de parámetros puede producir sobreajuste; la loss de validación sigue bajando en la época 8, pero no hay conjunto de test independiente reportado.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no es posible evaluar sesgos demográficos, geográficos o de género en las anotaciones.
- Riesgo de alucinación: bajo en sentido generativo (no genera texto), pero puede asignar etiquetas incorrectas con alta confianza en dominios distintos al de entrenamiento.
- Limitaciones de idioma: aunque el modelo base es multilingüe, no se declara ni evalúa el rendimiento en castellano ni en otros idiomas; el uso en producción fuera del dominio previsto no está respaldado por evidencia.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base (MIT) y de los datos de entrenamiento (desconocidos).
- Advertencia para producción: no se recomienda su uso en decisiones clínicas sin validación externa y sin documentación del esquema de etiquetas; es un artefacto de investigación, no un componente validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MayorChris/xlm_r-prostata-bs16
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de token classification en Transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Documentación de XLM-RoBERTa en Transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
