# nagbhaskar55/slm125mlive-bhaskar-finetune

## Resumen

`nagbhaskar55/slm125mlive-bhaskar-finetune` es un modelo de lenguaje de 125.848.320 parámetros con arquitectura transformer decoder-only estilo Llama, ajustado por instrucciones (SFT) sobre el checkpoint base `nagbhaskar55/slm125mlive-base`, preentrenado desde cero con legislación judicial estadounidense (case law), informes de la SEC y texto educativo web. Lo publica el usuario nagbhaskar55 en Hugging Face, con licencia "other" y soporte únicamente para inglés.

El modelo no está diseñado como base de conocimiento: su entrenamiento busca que lea un pasaje incluido en el prompt y responda exclusivamente a partir de él. De hecho, 423 de los 7.960 pares de instrucciones enseñan al modelo a responder literalmente "Not stated in the context." cuando la respuesta no aparece en el contexto. Se trata, por tanto, de un componente de lectura fundamentada (grounded reading) para tareas de extracción, resumen y QA cerrado sobre documentos.

Su relevancia práctica viene del tamaño: con 125M de parámetros y una ventana de 1.024 tokens, es un candidato para etapas de bajo coste dentro de pipelines RAG legales o financieros, ejecutable en CPU o en GPU de gama baja. El interés es limitado por ahora: el repositorio acumula 0 descargas y 0 "likes", no publica benchmarks y su licencia no está detallada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 125.848.320 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 1.024 tokens (límite usado en el entrenamiento; respuestas con media de 629,5 tokens, p90 de 798 y máximo de 1.019) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors. El tamaño del repo (0,5 GB) implica unos 4 bytes por parámetro, consistente con fp32 |
| Idiomas soportados | Inglés (en) |
| Licencia | other (la información disponible no incluye el texto ni las condiciones de la licencia) |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | nagbhaskar55/slm125mlive-base |
| Tamaño del repositorio | 0,5 GB |
| Pipeline declarado | text-generation |
| Etiquetas | legal, finance, instruction-tuned, sft, llama, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Llama con 125,8M de parámetros, sin mezcla de expertos ni componentes de estado recurrente. El preentrenamiento del modelo base se hizo desde cero sobre un corpus compuesto por case law estadounidense, filings de la SEC y texto web educativo. El ajuste por instrucciones se realizó durante 3 épocas en una única H100, y el autor indica que el mejor checkpoint fue la época 0 de 3, lo que sugiere sobreajuste a partir de ahí.

Los datos de SFT son 7.960 pares sintéticos generados a partir del mismo corpus del preentrenamiento, con `gemini-3.6-flash` como profesor y `gemini-3.1-flash-lite` como juez LLM. La distribución por tarea es: grounded_qa 3.200, summarization 1.600, extraction 1.600 y rewriting 1.560; por fuente: sec 3.186, case-law 3.158 y fineweb-edu 1.616; por dificultad: easy 4.071, medium 2.755 y hard 1.134. La curación incluyó filtrado por el juez (puntuaciones >= 4 sobre 5 en fundamentación, corrección y seguimiento de instrucciones), eliminación de duplicados exactos, por n-gramas de 8 y por similitud de embeddings, y descontaminación con n-gramas de 13 frente a CaseHOLD, reduciendo 10.958 pares brutos a 7.960.

La pérdida se aplicó únicamente a los tokens del asistente. La plantilla de chat, incluida en `tokenizer_config.json`, es `<|bos|><|system|>{system}<|eos|><|user|>{user}<|eos|><|assistant|>{answer}<|eos|>`, y el prompt de sistema usado en el entrenamiento es "You are a legal and financial assistant. Use only the provided context." No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto condicionada a un pasaje: responde preguntas cuya respuesta está contenida en el contexto aportado.
- QA fundamentado (grounded QA) sobre textos legales y financieros: 3.200 de los ejemplos de entrenamiento pertenecen a esta categoría.
- Extracción de información estructurada de documentos: cláusulas, cifras, entidades y datos concretos (1.600 ejemplos de la tarea extraction).
- Resumen de documentos largos dentro del límite de 1.024 tokens (1.600 ejemplos de summarization).
- Reescritura y reformulación de textos manteniendo el contenido del pasaje (1.560 ejemplos de rewriting).
- Abstención explícita: responde "Not stated in the context." cuando el pasaje no contiene la respuesta, comportamiento reforzado con 423 ejemplos específicos.
- Conversación multi-turno mediante plantilla de chat con roles system, user y assistant, y enmascarado de pérdida en tokens de asistente.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido según la información disponible.
- Multilingüismo: no disponible; solo se declara inglés.

## Casos de uso

- Extracción de cláusulas en revisión contractual: se introduce el contrato (o el fragmento relevante) como pasaje y el modelo devuelve los datos solicitados; su entrenamiento específico en extracción y su abstención ante información ausente reducen el riesgo de campos inventados.
- Resumen de filings de la SEC para analistas: el modelo condensa secciones de informes periódicos dentro de su ventana de 1.024 tokens, adecuado como paso previo barato antes de un modelo mayor en un pipeline en cascada.
- QA documental en RAG legal: dado que solo responde a partir del contexto, encaja como lector de un recuperador que le pase el pasaje correcto, devolviendo abstención cuando la recuperación falla, lo que permite detectar fallos de retrieval.
- Filtrado de preguntas no respondibles: gracias a los 423 ejemplos de rechazo, puede usarse como clasificador de "no consta en el contexto" para descartar consultas antes de enviarlas a modelos más caros.
- Procesamiento on-premise de documentos confidenciales: con 125M de parámetros se ejecuta en CPU o en GPU de gama baja sin salida de datos a servicios externos, relevante en despachos y departamentos financieros con requisitos de confidencialidad.
- Generación de conjuntos de evaluación internos: al ser un modelo pequeño y determinista en tareas de grounded QA, sirve para construir líneas base reproducibles de extracción y resumen sobre corpus propios.
- Investigación sobre modelos pequeños: es un punto de comparación útil para estudiar destilación sintética desde un único profesor y el efecto del ajuste por instrucciones en modelos de 125M.
- Prototipado rápido en portátiles: el peso en fp32 cabe en memoria de sistema y permite iterar sobre plantillas de prompt y formatos de pasaje sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar, y señala explícitamente que este checkpoint no se ha reevaluado en CaseHOLD (el modelo base puntuó por debajo del azar en esa prueba en modo zero-shot).

Las únicas métricas publicadas son de validación durante el ajuste:

| Metrica | Modelo base | Este modelo |
|---|---|---|
| SFT val loss (tokens de asistente) | 3,1862 | 1,5278 |
| Perplejidad | 24,2 | 4,608 |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, cálculo a partir de 125,8M de parámetros): aproximadamente 0,50 GB en fp32, 0,25 GB en fp16/bf16, 0,13 GB en int8 y 0,07 GB en int4. El repositorio publica safetensors equivalentes a fp32.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3050, RTX 4090 y similares, y también en GPU integradas. Las A100 o H100 están muy sobredimensionadas para este tamaño.
- Ejecución viable en CPU sin GPU, así como en dispositivos de borde y placas tipo Raspberry Pi, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (soporte nativo, con la plantilla de chat en `tokenizer_config.json`), text-generation-inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama previa conversión a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El autor solo documenta el coste de entrenamiento (1 GPU H100, 3 épocas).
- La ventana de 1.024 tokens implica un KV cache muy pequeño, por lo que la memoria adicional durante la generación es marginal frente al peso del modelo.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este modelo. La tabla recoge únicamente características estructurales de alternativas del mismo rango de tamaño, tomadas de sus fichas públicas; no se ha ejecutado ninguna evaluación conjunta.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| nagbhaskar55/slm125mlive-bhaskar-finetune | 125,8M | 1.024 tokens | other (no detallada) | Lectura fundamentada en dominio legal y financiero, solo inglés |
| SmolLM2-135M-Instruct | 135M | 8.192 tokens | Apache-2.0 | Instrucciones generales, multilingüe |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache-2.0 | Instrucciones generales, tool calling, multilingüe |

La comparación de rendimiento entre estos modelos no está disponible: solo el modelo de esta ficha publica métricas de validación, y son internas a su propio conjunto de SFT, por lo que no son equiparables a evaluaciones estandarizadas.

## Limitaciones y advertencias

- No es una base de conocimiento: con 125M de parámetros, las respuestas sin contexto son poco fiables, según advierte el propio autor. Cualquier uso debe proporcionar el pasaje en el prompt.
- El entrenamiento se hizo con datos sintéticos generados por un único modelo profesor (`gemini-3.6-flash`), por lo que hereda sus sesgos y modos de error.
- Riesgo de alucinación fuera del escenario de lectura fundamentada, especialmente si se le pide responder de memoria.
- La model card prohíbe explícitamente el uso para asesoramiento legal o financiero.
- Propagación de sesgos del corpus de preentrenamiento (case law estadounidense, filings de la SEC y texto educativo web), con sobrerrepresentación de la jurisdicción de Estados Unidos.
- Limitación idiomática: solo inglés. No hay evidencia de funcionamiento en castellano.
- Ventana de contexto muy corta, 1.024 tokens, que obliga a fragmentar documentos y limita la coherencia en tareas que requieren contexto amplio.
- Licencia "other" sin texto público en la información disponible: la viabilidad de uso comercial no puede determinarse y requiere consultar al autor.
- El mejor checkpoint fue la época 0 de 3, lo que apunta a sobreajuste en épocas posteriores y a un margen de mejora limitado con este conjunto de datos.
- No se ha reevaluado en CaseHOLD; se descontaminó frente a ese conjunto, pero no hay resultados públicos de este checkpoint.
- Adopción nula hasta la fecha (0 descargas, 0 likes) y ausencia de benchmarks independientes: no hay validación externa de su calidad.
- El repositorio no publica versiones cuantizadas ni pesos en GGUF, por lo que el despliegue en llama.cpp u Ollama requiere conversión propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagbhaskar55/slm125mlive-bhaskar-finetune
- Modelo base: https://huggingface.co/nagbhaskar55/slm125mlive-base
- La búsqueda web realizada no devolvió enlaces relevantes al modelo: los resultados fueron páginas genéricas de información financiera (Yahoo Finance, Reuters, Google Finance, CNBC y WSJ). No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo en la información disponible.
