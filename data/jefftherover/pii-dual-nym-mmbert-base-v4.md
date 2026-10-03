# jefftherover/pii-dual-nym-mmbert-base-v4

## Resumen

`pii-dual-nym-mmbert-base-v4` es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII), publicado por el usuario jefftherover en Hugging Face. Se trata de un fine-tune del encoder multilingüe `jhu-clsp/mmBERT-base`, desarrollado por el Johns Hopkins Center for Language and Speech Processing, y conserva su licencia MIT. Con 307.555.617 parámetros, es un encoder moderno (ModernBERT) de tamaño base, ligero y apto para despliegue de baja latencia.

El problema que aborda es concreto: identificar y marcar entidades sensibles (nombres, direcciones, identificadores, etc.) dentro de texto no estructurado. El sufijo "dual-nym" del nombre sugiere una variante orientada a detección dual o a pseudonimización, aunque la model card no documenta el conjunto de etiquetas ni el dataset empleado. Esta falta de documentación es, hoy, la principal limitación del artefacto.

Su relevancia actual es doble. Por un lado, cubre una necesidad creciente de cumplimiento normativo (RGPD, HIPAA, AI Act) en pipelines que ingieren texto hacia modelos generativos. Por otro, al apoyarse en mmBERT —un encoder multilingüe entrenado sobre 3 billones de tokens en 1833 idiomas según el proyecto original— hereda potencialmente una cobertura idiomática muy amplia, algo poco habitual en modelos de PII, que suelen ser monolingües o bilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer moderno (ModernBERT, atencion alterna local/global, RoPE, Flash Attention) |
| Parametros totales | 307.555.617 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; se hereda la del modelo base mmBERT-base (el proyecto mmBERT declara soporte de contexto largo, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | Pesos publicados en safetensors (fp32, ~1,23 GB); no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible para el fine-tune; el modelo base mmBERT-base cubre 1833 idiomas segun el proyecto mmBERT |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,2 GB, con el fichero de pesos de ~1,23 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder `jhu-clsp/mmBERT-base`, que pertenece a la familia ModernBERT: un transformer encoder con mecanismos modernos (posiciones rotatorias, atención alternada entre capas locales y globales, y kernels de atención eficientes) en lugar de la atención absoluta clásica tipo BERT. El proyecto mmBERT documenta un entrenamiento sobre 3 billones de tokens en 1833 idiomas mediante "cascading annealed language learning" (aprendizaje de idiomas con annealing en cascada), con resultados que superan a XLM-R en tareas multilingües. La cabeza del fine-tune es de clasificación de tokens, adecuada para etiquetado tipo BIO de entidades PII.

Los detalles del entrenamiento propio son escasos. La model card indica que se entrenó "on an unknown dataset" (dataset desconocido), sin especificar composición, número de tokens, idiomas ni esquema de etiquetas. Los hiperparámetros sí están documentados: learning rate 5e-05, batch de entrenamiento efectivo 32 (16 x 2 pasos de acumulación), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler cosine with restarts con 200 pasos de warmup, 4 épocas, semilla 42 y precisión mixta nativa (AMP). No se menciona RLHF, DPO ni ninguna etapa de alineación, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Clasificación de tokens para detección de PII en texto: etiquetado secuencia a secuencia de entidades sensibles.
- Detección multilingüe potencial, heredada del encoder base mmBERT (1833 idiomas declarados en el proyecto original); no verificada para este fine-tune.
- Procesamiento por lotes de documentos en pipelines de preprocesado, con bajo coste computacional por su tamaño base.
- Integración directa con la librería `transformers` mediante `pipeline("token-classification")` y con endpoints de Hugging Face (el repositorio está marcado como `endpoints_compatible`).
- Compatibilidad con la clase de tokenizador de ModernBERT (Tokenizers 0.23.2 en el entorno de entrenamiento).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni modo de pensamiento: es un encoder discriminativo.
- No se documentan capacidades de agentes, function calling ni multi-step reasoning.

## Casos de uso

- Anonimización previa a la ingesta en LLM: el modelo marca las entidades PII de un documento antes de enviarlo a un modelo generativo, de modo que el texto se redacte o seudonimice y no se filtren datos personales a terceros.
- Cumplimiento del RGPD en bases de datos corporativas: ejecución por lotes sobre repositorios documentales para localizar y catalogar datos personales, generando un inventario de tratamiento.
- Saneado de logs y trazas de aplicación: detección de correos, teléfonos, DNIs o direcciones IP que aparezcan embebidos en mensajes de error antes de enviarlos a herramientas de observabilidad.
- Desidentificación de historiales clínicos o expedientes financieros: preprocesado de documentos sensibles para investigación secundaria, con revisión humana posterior sobre las etiquetas de alta confianza.
- Preparación de corpus de entrenamiento: filtrado de PII en datasets recopilados de la web o de sistemas internos antes de usarlos para entrenar otros modelos.
- Enrutado y triaje en atención al cliente: clasificar tickets que contienen datos personales para dirigirlos a canales con controles de acceso reforzados.
- Verificación en pipelines de publicación: comprobación automática en CI/CD de que un documento o una página web no expone datos personales antes del despliegue.
- Seudonimización de extremo a extremo: combinado con un diccionario de mapeo, detectar entidades y sustituirlas por tokens reversibles, manteniendo la coherencia referencial en un corpus.

## Benchmarks y rendimiento

El `model-index` del autor no contiene ningún resultado (`results: []`). El autor no publica comparaciones con MMLU, HumanEval, GSM8K ni con modelos alternativos de detección de PII. Los únicos datos disponibles son las métricas de evaluación del propio entrenamiento, medidas sobre un conjunto de validación no descrito:

| Metrica | Valor declarado por el autor |
|---|---|
| Loss (validacion) | 0,0029 |
| Precision | 0,9960 |
| Recall | 0,9976 |
| F1 | 0,9968 |
| Accuracy | 0,9993 |

Evolución por épocas declarada en la model card:

| Training loss | Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,0137 | 0,8931 | 2000 | 0,0075 | 0,9908 | 0,9944 | 0,9926 | 0,9983 |
| 0,0048 | 1,7859 | 4000 | 0,0040 | 0,9947 | 0,9968 | 0,9957 | 0,9990 |
| 0,0025 | 2,6787 | 6000 | 0,0029 | 0,9949 | 0,9970 | 0,9960 | 0,9993 |
| 0,0004 | 3,5716 | 8000 | 0,0028 | 0,9961 | 0,9975 | 0,9968 | 0,9993 |
| 0,0002 | 4,0 | 8960 | 0,0029 | 0,9960 | 0,9976 | 0,9968 | 0,9993 |

Advertencia: estos valores proceden exclusivamente de la model card del autor y no están respaldados por un dataset de evaluación público, una descripción del esquema de etiquetas ni una comparación con líneas base. No se han publicado resultados de benchmarks en la información disponible y no deben tomarse como evidencia de rendimiento en dominios externos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (pesos de 1,23 GB más activaciones), en torno a 0,7 GB en bf16/fp16 y menos de 0,4 GB en cuantización int8. Con longitudes de contexto largas y lotes grandes, las activaciones de atención elevan el consumo de forma notable.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, L4, T4 o A10 resultan holgadas. En A100 y H100 el cuello de botella será el ancho de banda de entrada de datos, no el cálculo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos años, e incluso en CPU y en Apple Silicon mediante llama.cpp u ONNX Runtime.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")`, TorchServe, ONNX Runtime, Text Embeddings Inference (aunque está orientado a embeddings, puede adaptarse), FastAPI con batching sobre PyTorch, y en menor medida vLLM (orientado a modelos generativos, no a encoders de clasificación). No hay pesos GGUF publicados oficialmente, por lo que Ollama o llama.cpp requerirían una conversión propia.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jefftherover/pii-dual-nym-mmbert-base-v4 | 307.555.617 | ModernBERT encoder, clasificacion de tokens | no disponible | MIT | Hugging Face, safetensors |
| jhu-clsp/mmBERT-base (modelo base) | ~307 M | ModernBERT encoder multilingue | contexto largo declarado por el proyecto | no confirmada en la informacion disponible | Hugging Face |
| XLM-RoBERTa-base | ~278 M | Transformer encoder multilingue | 512 tokens | MIT | Hugging Face, muy extendido |
| mDeBERTa-v3-base | ~278 M | DeBERTa v3, atencion desenredada | 512 tokens | MIT | Hugging Face |

Comparativa de rendimiento frente a modelos de PII alternativos (Piiranha, GLiNER-PII, etc.): no disponible, ya que el autor no publica ninguna evaluación comparativa.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica explícitamente "on an unknown dataset". Se desconoce el esquema de etiquetas, la composición del corpus, los idiomas cubiertos y si hubo anotación sintética o humana.
- Métricas sin trazabilidad: los valores de F1 y accuracy declarados (0,9968 y 0,9993) proceden de un conjunto de validación no descrito y sin partición pública. Un F1 tan alto en detección de PII suele indicar un conjunto de evaluación poco diverso o dominado por etiquetas mayoritarias, dado que la clase "no entidad" domina la métrica de accuracy.
- Riesgo de falso negativo: en un modelo de PII, un recall imperfecto implica fuga de datos personales. Con recall 0,9976 sobre un conjunto desconocido, no hay garantía de cobertura en dominios distintos.
- Riesgo de alucinación de entidades: puede marcar como PII textos que no lo son, generando sobre-redacción en documentos legales o técnicos.
- Idiomas no verificados: aunque el modelo base cubre 1833 idiomas, el fine-tune puede haber degradado lenguas ausentes en su dataset (desconocido). No debe asumirse cobertura multilingüe real.
- Sesgos potenciales: los encoders multilingües entrenados con datos web heredan sesgos de representación geográfica, de género y de nombres propios poco frecuentes, lo que puede traducirse en peor detección de PII en determinados grupos demográficos.
- Trazabilidad limitada del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni discusiones abiertas.
- Advertencia de producción: no debe usarse como capa única de cumplimiento normativo. Se recomienda validación con un conjunto de evaluación propio, del dominio objetivo, y revisión humana o un modelo de respaldo en el caso de entidades críticas.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones, manteniendo el aviso de copyright. Conviene verificar la licencia del modelo base mmBERT, que no está confirmada en la información disponible, antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jefftherover/pii-dual-nym-mmbert-base-v4
- Ficheros del repositorio: https://huggingface.co/jefftherover/pii-dual-nym-mmbert-base-v4/tree/main
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Repositorio GitHub del proyecto mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Variante relacionada v1: https://huggingface.co/jefftherover/pii-dual-nym-mmbert-base-v1
- Variante relacionada sin sufijo "nym": https://huggingface.co/jefftherover/pii-dual-mmbert-base-v4
