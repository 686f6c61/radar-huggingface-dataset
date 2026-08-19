# DeependraVerma/legal-slm-125m-ultimate-sft

## Resumen

El modelo `legal-slm-125m-ultimate-sft` es un pequeño modelo de lenguaje (SLM) de 125,8 millones de parámetros, desarrollado por DeependraVerma, especializado en dominios legal y financiero en inglés. Se trata de la versión fine-tuned mediante Supervised Fine-Tuning (SFT) del modelo base `slm-125m-ultimate-base`, que a su vez fue preentrenado desde cero con un pipeline reproducible basado en datos de jurisprudencia estadounidense, documentos SEC y texto educativo web. El modelo está diseñado para tareas de generación de texto, respuesta a preguntas legales y redacción de contratos, y se distribuye bajo licencia MIT.

Su relevancia radica en que demuestra que es posible construir un modelo especializado con un coste computacional reducido, partiendo de una arquitectura Llama de 12 capas, con contexto de 4096 tokens y un vocabulario BPE personalizado de 16.384 tokens. Aunque su tamaño limita la capacidad de razonamiento legal profundo, el autor publica de forma transparente tanto los resultados de benchmarks generales como los específicos del dominio legal, incluyendo aquellos donde el rendimiento es cercano al azar. Esto lo convierte en una opción interesante para prototipos y tareas de asistencia a la redacción, siempre con supervisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, sin GQA) |
| Parametros totales | 125.848.320 (125.847.552 según la model card, con embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificados oficialmente; compatible con bfloat16 (usado en el ejemplo de inferencia) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder estilo Llama con 12 capas, dimensión oculta de 768 y 12 cabezas de atención, sin Grouped Query Attention (GQA). El vocabulario es un BPE personalizado de 16.384 tokens, entrenado específicamente sobre el dominio legal y financiero, y compartido entre todos los modelos del proyecto. La inicialización se realizó mediante warm-start desde los pesos del modelo base `slm-125m-ultimate-base`, continuando el preentrenamiento sobre datos legales y financieros sin marcado HTML, para después realizar un fine-tuning supervisado con pares de preguntas y respuestas curados mediante destilación de un profesor y filtrado por un juez automático. El conjunto de fine-tuning incluye Q&A legal, redacción de contratos, generación de documentos completos y chit-chat general con capacidad de rechazo. La pérdida de validación independiente es de 0,3939 (perplejidad 1,483). El formato de chat es obligatorio: el modelo no funciona como un modelo de completado simple, sino que requiere los tokens especiales `<|system|>`, `<|user|>` y `<|assistant|>`.

## Capacidades

- Generación de texto en inglés centrado en dominios legal y financiero, incluyendo redacción de cláusulas y contratos completos.
- Respuesta a preguntas de tipo legal (Q&A) con formato de chat estructurado.
- Redacción de documentos completos, como acuerdos de confidencialidad (NDA), con generación de 600 a 1200 tokens por documento.
- Capacidad de seguir instrucciones en formato conversacional multi-turno, aunque con limitaciones por el contexto de 4096 tokens.
- Soporte de chit-chat general y respuestas de rechazo cuando la consulta está fuera de su ámbito.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso explícito; su tamaño limita estas capacidades.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- Asistencia en la redacción de contratos: el modelo puede generar borradores de acuerdos de confidencialidad, cláusulas de confidencialidad o términos de licencia a partir de instrucciones en lenguaje natural, reduciendo el tiempo inicial de redacción para abogados y equipos legales.
- Revisión preliminar de documentos legales: dado un contrato, puede extraer y clasificar cláusulas específicas (por ejemplo, identificación explícita de partes, permisos de copia, obligaciones de supervivencia), como sugieren los resultados en LegalBench contract NLI.
- Respuesta a preguntas frecuentes legales en portales de asesoría: puede integrarse en un chatbot para responder consultas básicas sobre normativa, siempre con un aviso de que no constituye asesoramiento legal.
- Generación de resúmenes de documentos financieros y legales: aunque su contexto es limitado, puede procesar fragmentos de informes o sentencias para extraer información clave.
- Prototipado de aplicaciones de IA legal: al ser un modelo pequeño y con licencia MIT, es adecuado para experimentar con pipelines de generación y fine-tuning en entornos de desarrollo sin grandes requisitos de hardware.
- Entrenamiento y educación: puede usarse como ejemplo didáctico de fine-tuning de un SLM en un dominio específico, dado que el autor publica el pipeline completo en GitHub.

## Benchmarks y rendimiento

El autor declara los siguientes resultados, obtenidos con `lm-evaluation-harness` en 0-shot y publicados en la model card. Se incluyen tanto benchmarks generales como específicos del dominio legal.

| Tarea | Métrica | Valor |
|---|---|---|
| HellaSwag | acc | 0,3209 |
| HellaSwag | acc_norm | 0,3610 |
| ARC-Easy | acc | 0,5025 |
| ARC-Easy | acc_norm | 0,4693 |
| PIQA | acc | 0,6333 |
| PIQA | acc_norm | 0,6240 |
| MMLU Professional Law | acc | 0,2425 |
| MMLU Jurisprudence | acc | 0,2315 |
| MMLU International Law | acc | 0,2397 |
| CaseHOLD | acc | 0,1311 |
| CaseHOLD | acc_norm | 0,2214 |
| LegalBench Citation Prediction | acc | 0,5093 |
| LegalBench Consumer Contracts QA | acc | 0,5606 |
| LegalBench Contract NLI (Confidentiality of Agreement) | acc | 0,5122 |
| LegalBench Contract NLI (Explicit Identification) | acc | 0,8165 |
| LegalBench Contract NLI (Limited Use) | acc | 0,5337 |
| LegalBench Contract NLI (No Licensing) | acc | 0,5556 |
| LegalBench Contract NLI (Notice on Compelled Disclosure) | acc | 0,6127 |
| LegalBench Contract NLI (Permissible Copy) | acc | 0,7701 |
| LegalBench Contract NLI (Return of Confidential Information) | acc | 0,5000 |
| LegalBench Contract NLI (Sharing with Employees) | acc | 0,5588 |
| LegalBench Contract NLI (Survival of Obligations) | acc | 0,4777 |
| LegalBench Contract QA | acc | 0,5125 |
| LegalBench Telemarketing Sales Rule | acc | 0,4043 |

El propio autor advierte que en tareas de razonamiento legal profundo (CaseHOLD, MMLU legal) los resultados están en el entorno del azar o de la clase mayoritaria, lo que es esperable para un modelo de 125M. No se proporcionan comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware por parte del autor.
- Al tratarse de un modelo de 125M parámetros, una estimación razonable para inferencia en bfloat16 es de aproximadamente 250 MB de VRAM solo para los pesos, más el overhead de activaciones y KV cache (contexto 4096). En cuantización int8, el peso se reduce a unos 125 MB.
- Es ejecutable en GPUs de consumo como una RTX 3060 (12 GB) o incluso en CPU, aunque con mayor latencia.
- El ejemplo de uso de la model card emplea `transformers` con `torch_dtype=torch.bfloat16`, por lo que es compatible con el ecosistema Hugging Face.
- Para despliegue en producción, se puede servir con `text-generation-inference` (el repo incluye la etiqueta `endpoints_compatible`), vLLM u Ollama, aunque no se indican cifras de throughput.
- Dado su tamaño, es viable en entornos sin GPU dedicada, usando solo CPU para pruebas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos publicados por el autor con otros modelos de la misma categoría. Se puede contextualizar con modelos SLM generalistas de tamaño similar (por ejemplo, TinyLlama-1.1B o Phi-1.5), pero no hay métricas comunes verificables en la información proporcionada. Por tanto, la comparativa se limita a señalar que `legal-slm-125m-ultimate-sft` es un modelo denso de 125M, con contexto de 4096, licencia MIT y especializado en legal/financiero, mientras que las alternativas mencionadas son generalistas y de mayor tamaño (1B o más), lo que implica mayores requisitos de hardware.

## Limitaciones y advertencias

- No constituye asesoramiento legal: las salidas deben ser revisadas por un abogado cualificado; el modelo puede afirmar proposiciones legales incorrectas con total confianza.
- El conocimiento general del mundo es poco fiable debido al tamaño reducido del modelo.
- Alucina detalles concretos: ante empresas o casos ficticios, inventa cifras y citas con apariencia verosímil.
- Contexto limitado a 4096 tokens: los documentos largos deben dividirse en fragmentos.
- El formato de chat es obligatorio; no funciona como modelo de completado directo.
- Los resultados en tareas de razonamiento legal (CaseHOLD, MMLU legal) están cerca del azar, por lo que no debe usarse para decisiones legales sin supervisión experta.
- La licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías; el autor no se hace responsable de su uso indebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft
- Modelo base: https://huggingface.co/DeependraVerma/slm-125m-ultimate-base
- Repositorio de código (pipeline de entrenamiento): https://github.com/DeependraVerma/legal-slm-125M
- Demo web (versión base): https://legal-slm-125.vercel.app/
- Página del autor: https://deependraverma-ai-legal-slm-125-m.vercel.app/
- Modelo SFT anterior (legacy): https://huggingface.co/DeependraVerma/legal-slm-125m-sft
- Modelo SFT de segunda generación: https://huggingface.co/DeependraVerma/legal-slm-125m-new-sft
