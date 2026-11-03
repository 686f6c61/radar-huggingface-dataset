# dleemiller/AbsoluteZero-nli-4b

## Resumen

AbsoluteZero-nli-4b es un cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por dleemiller, construido mediante ajuste fino del modelo base Qwen/Qwen3.5-4B. Resuelve la tarea de determinar si una premisa (texto) implica, contradice o es neutral respecto a una hipotesis (afirmacion), devolviendo probabilidades calibradas. Su propuesta diferencial es el "modo think": ademas del pase rapido clasico de un cross-encoder, el modelo puede generar una traza de razonamiento corta antes de emitir el veredicto, lo que permite auditar por que se tomo una decision de clasificacion.

Con 4.205.766.656 parametros y soporte de documentos de hasta 32k tokens, el modelo esta orientado a tareas de clasificacion zero-shot, deteccion de alucinaciones, verificacion de hechos (fact-checking), evaluacion de groundedness en pipelines RAG, moderacion y revision de contratos. La licencia Apache-2.0 facilita su uso comercial. Segun el autor, ocupa el primer puesto en el OpenNLI Skill Index (a fecha 11-03-26) en modo rapido.

Es relevante ahora porque cubre una necesidad creciente en sistemas RAG y agenticos: verificar de forma barata y observable si una respuesta generada esta respaldada por el contexto recuperado, con trazabilidad del razonamiento en los casos dificiles (cuantificadores, negaciones, logica multi-paso).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5) adaptado como cross-encoder con cabeza de clasificacion; tipo `qwen3_5_text` con codigo personalizado |
| Parametros totales | 4.205.766.656 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32k tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8.4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y lo adapta como cross-encoder para NLI. Incorpora una cabeza de clasificacion que permite un modo rapido de un solo pase hacia delante, similar a los cross-encoders tradicionales. Adicionalmente, dispone de un modo think en el que el modelo genera una traza de razonamiento breve (del orden de ~50 tokens en ANLI y ~200 tokens en problemas de logica de primer orden) que luego es leida por la cabeza de puntuacion para emitir el veredicto final.

El entrenamiento se apoya en los datasets propios dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, y las etiquetas del modelo indican el uso de destilacion de conocimiento (knowledge-distillation) y GRPO (Group Relative Policy Optimization) como tecnicas de alineacion/optimizacion. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset. La innovacion principal es la combinacion de clasificacion rapida y razonamiento observable en un mismo modelo.

## Capacidades

- Clasificacion NLI: etiqueta pares premisa-hipotesis como entailment, contradiction o neutral con probabilidades calibradas.
- Clasificacion zero-shot: mediante plantillas de hipotesis ("This text is about {label}").
- Modo think con trazas de razonamiento auditables para casos dificiles (logica multi-paso, cuantificadores, negaciones, contratos largos).
- Deteccion de alucinaciones y verificacion de groundedness en respuestas generadas.
- Verificacion de hechos (fact-checking) contra pasajes de referencia.
- Soporte de documentos largos de hasta 32k tokens.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Grounding en RAG: dado un conjunto de pasajes recuperados y una respuesta generada, el modelo verifica si la respuesta esta implicada por el contexto (86.4% en RAGTruth), permitiendo filtrar respuestas no respaldadas antes de mostrarlas al usuario.
- Deteccion de alucinaciones en produccion: comprobar cada afirmacion de un LLM contra las fuentes citadas y marcar como no soportadas aquellas con baja probabilidad de entailment.
- Clasificacion zero-shot de tickets y resenas: etiquetar texto en categorias arbitrarias mediante plantillas de hipotesis, sin entrenamiento adicional (93.4% en zs_meta con 18 tareas).
- Guardrails y moderacion: evaluar mensajes frente a afirmaciones de politica (92.5% en CrossingGuard) para bloquear contenido que viole normas definidas como hipotesis.
- Revision de contratos: verificar si un contrato permite o prohibe clausulas concretas, como compartir datos con terceros (92.9% en ContractNLI), usando documentos largos de hasta 32k tokens.
- Extraccion clinica y verificacion de notas: comprobar afirmaciones sobre el paciente (por ejemplo, situacion laboral) contra notas clinicas (98.2% en SDOH-NLI).
- Auditoria de clasificadores: usar el modo think para inspeccionar las trazas de razonamiento en fallos de clasificacion y ajustar las hipotesis de forma sistematica.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0.8533 |
| MultiNLI (validation matched) | Accuracy | 0.9207 |
| MultiNLI (validation mismatched) | Accuracy | 0.9226 |
| SNLI (test) | Accuracy | 0.9367 |
| ANLI round 1 (test) | Accuracy | 0.826 |
| ANLI round 2 (test) | Accuracy | 0.706 |
| ANLI round 3 (test) | Accuracy | 0.6542 |
| WANLI (test) | Accuracy | 0.772 |
| LingNLI (validation) | Accuracy | 0.883 |
| Benchmark de 45 datasets NLI/zero-shot/grounding (media macro) | Macro accuracy | 0.8383 |

Resultados de aplicacion en modo rapido (segun la model card):

| Uso | Benchmark | Resultado |
|---|---|---|
| Clasificacion zero-shot / tagging | zs_meta (18 tareas) | 93.4% |
| Grounding en RAG | RAGTruth | 86.4% |
| Guardrails / moderacion | CrossingGuard | 92.5% |
| Extraccion clinica | SDOH-NLI | 98.2% |
| Revision de contratos | ContractNLI | 92.9% |

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 8-9 GB solo para pesos, mas memoria para activaciones y contexto largo.
- Con cuantizacion de 8 bits: en torno a 4-5 GB de pesos; con 4 bits: en torno a 2.5-3 GB (estimacion orientativa, no confirmada por el autor).
- GPU profesionales recomendadas: A100, H100 o L40S para contextos de 32k tokens y alto throughput.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 sin problema; en tarjetas de 8-12 GB (RTX 3070/4070) seria necesario cuantizar.
- Opciones de despliegue: la libreria indicada es `sentence-transformers` (CrossEncoder con `trust_remote_code=True`); el formato safetensors permite cargas con Transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| AbsoluteZero-nli-4b | 4.2B | 32k | Cross-encoder NLI con modo think | Apache-2.0 | Resultados NLI y grounding publicados por el autor |
| Cross-encoders NLI clasicos (p. ej. DeBERTa NLI) | ~0.1-0.4B | 512 tokens tipicamente | Cross-encoder | Variable | Sin trazas de razonamiento ni contexto largo; datos comparativos no disponibles en esta ficha |
| LLM generativo generalista (p. ej. Qwen3.5-4B base) | 4B | Variable | Decoder generativo | Apache-2.0 | No especializado en NLI calibrado; requiere prompting para clasificar |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y evaluado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- El rendimiento cae en tareas de razonamiento complejo: ANLI round 3 alcanza 0.6542 y round 2 0.706, lo que indica dificultad con inferencias de varios pasos y adversarias.
- El modo think incrementa la latencia al generar trazas de razonamiento; conviene reservarlo para casos dificiles.
- Riesgo de sesgos heredados del corpus de entrenamiento (SNLI, MultiNLI y datasets propios), no documentados en detalle.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo usa codigo personalizado (`trust_remote_code=True`), lo que implica ejecutar codigo del autor; conviene auditarlo antes de produccion.
- No se documentan garantias de calibracion fuera de los dominios evaluados; el umbral de probabilidad debe ajustarse por caso de uso.
- Capacidades de tool calling y agentes no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dleemiller/AbsoluteZero-nli-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- SNLI: https://huggingface.co/datasets/stanfordnlp/snli
- ANLI: https://huggingface.co/datasets/facebook/anli
- WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- LingNLI: https://huggingface.co/datasets/tasksource/lingnli
