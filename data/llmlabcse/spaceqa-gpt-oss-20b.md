# llmlabcse/SpaceQA-gpt-oss-20b

## Resumen

SpaceQA-gpt-oss-20b es un ajuste fino con LoRA de gpt-oss-20b de OpenAI, fusionado en los pesos base en bf16 y publicado por llmlabcse bajo licencia Apache-2.0. El modelo está especializado en preguntas y respuestas de ingeniería aeroespacial: responde cuestiones sobre sistemas de naves, misiones y ciencia espacial y, cuando se le proporciona un documento, responde a partir de ese documento indicando de forma explícita cuando este no contiene la respuesta.

Su relevancia está en la abstinencia calibrada: en la evaluación publicada, las respuestas totalmente correctas en preguntas cuya respuesta no está en el contexto pasaron del 89,6 % (base) al 100 %, y las afirmaciones sin apoyo se redujeron de 83 a 61 sobre 300 preguntas. Conserva la arquitectura MoE del modelo base, con 20.914.757.184 parámetros totales (dato verificado en safetensors), unos 3,6 B activos por token y un contexto de 128 k tokens, y se distribuye en safetensors bf16 y en GGUF MXFP4 para llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con mezcla de expertos (MoE), ajuste fino de openai/gpt-oss-20b |
| Parámetros totales | 20.914.757.184 (~20,9 B, dato real de safetensors) |
| Parámetros activos | ~3,6 B por token (MoE con 32 expertos y enrutado top-4; dato publicado por OpenAI para el modelo base) |
| Longitud de contexto | 131.072 tokens (128 k) en el modelo base; el ejemplo de despliegue con vLLM limita a 32.768 |
| Tipos de cuantización | bf16 (este repositorio, pesos fusionados); MXFP4 nativo en las capas MoE del modelo base; GGUF MXFP4 en el repositorio hermano; otros niveles GGUF: no disponible |
| Idiomas soportados | Inglés (único idioma del corpus de entrenamiento y de la evaluación) |
| Licencia | Apache-2.0 (el uso está sujeto además a la política de uso de gpt-oss) |
| Formato de pesos | safetensors (bf16, 41,9 GB de repositorio); GGUF disponible en SpaceQA-gpt-oss-20b-GGUF |

## Arquitectura y entrenamiento

El modelo base, gpt-oss-20b, es un transformer decodificador con mezcla de expertos: 32 expertos por capa con enrutado de los 4 más relevantes, lo que reduce los parámetros activos a unos 3,6 B por token. Emplea cuantización nativa MXFP4 en los pesos de los expertos, atención GQA con ventanas deslizantes alternadas y attention sinks, y alcanza un contexto de 131.072 tokens mediante escalado de RoPE (YaRN). OpenAI lo entrenó con aprendizaje por refuerzo sobre cadenas de razonamiento y lo publicó bajo Apache-2.0 con el formato de chat Harmony, que incluye niveles de esfuerzo de razonamiento (reasoning_effort: low, medium, high).

El ajuste fino sigue la guía oficial de OpenAI para gpt-oss: los pesos MXFP4 se dequantizan a bf16 y se aplica LoRA (r=16, α=32) sobre todas las capas lineales más los expertos MoE de las capas 7, 15 y 23, usando TRL SFT y PEFT (solo SFT; no se aplicó RLHF ni DPO). El corpus consta de 906 documentos del dominio espacial (Wikipedia e informes, manuales y notas de prensa de NASA, ESA e ISRO) divididos en 27.119 pasajes y repartidos 80/10/10 por familia documental, de modo que los documentos de evaluación nunca aparecieron en el entrenamiento. GPT-OSS-120B generó tres ejemplos por pasaje de entrenamiento (4.779 pasajes → 14.337 ejemplos de chat): una pregunta respondible desde el pasaje, una pregunta de libro cerrado sobre un concepto duradero y una pregunta relacionada que el pasaje no responde (objetivo: decir que no); cada cita de evidencia se verificó contra el pasaje. Entrenamiento: 2 épocas, lr 2e-4 con calendario coseno, lote efectivo 16, longitud máxima 2.048 tokens y pérdida solo sobre la completación, en 1× A100 de 80 GB durante unas 3 horas. La precisión de tokens en evaluación pasó de 0,785 a 0,840.

## Capacidades

- Respuesta de preguntas técnica del dominio aeroespacial en inglés: sistemas de naves, misiones y ciencia espacial, con terminología y unidades correctas.
- QA sobre documentos (estilo RAG): responde desde el pasaje proporcionado y declara de forma explícita cuando el contexto no contiene la respuesta, comportamiento entrenado específicamente con ejemplos de abstinencia.
- Modo libro cerrado: responde conceptos duraderos indicando incertidumbre cuando no está seguro de un hecho, en lugar de adivinar.
- Razonamiento con esfuerzo ajustable (reasoning_effort low/medium/high) heredado del formato Harmony del modelo base; la evaluación publicada usa el nivel low.
- Integración conversacional mediante plantilla Harmony con mensajes de developer y user, servible con API compatible con OpenAI a través de vLLM.
- Tool calling y agentes: el modelo base soporta tool calling nativo según su ficha oficial, pero este ajuste fino no se ha entrenado ni evaluado para ello (no disponible).
- Multilingüismo: limitado al inglés; no hay soporte evaluado para otros idiomas.
- Visión, audio u otras modalidades: no disponible (modelo solo de texto).

## Casos de uso

- Asistente RAG sobre documentación aeroespacial: indexando informes de NASA, ESA o ISRO y recuperando pasajes previamente (por ejemplo, con el modelo compañero SpaceEmbed-Qwen3-0.6B), el modelo responde desde el contexto y se abstiene cuando el pasaje recuperado no contiene la respuesta, reduciendo afirmaciones falsas en producción.
- Sistemas de QA con garantía de abstinencia: en preguntas cuya respuesta no está en el contexto alcanzó el 100 % de respuestas correctas frente al 89,6 % del modelo base, algo valioso en auditorías técnicas o revisión de especificaciones donde una respuesta inventada es peor que ninguna respuesta.
- Chat técnico educativo y de divulgación: en modo libro cerrado responde conceptos duraderos de ingeniería espacial con terminología correcta, aunque conviene advertir al usuario de que puede fallar en cifras y fechas concretas.
- Despliegue local en escritorio: la versión GGUF MXFP4 del repositorio hermano funciona con llama.cpp y con la aplicación de escritorio Space Tools, adecuada para estaciones de trabajo con unos 16 GB de memoria.
- Endpoint de producción: servido con vLLM en bf16 (contexto 32.768) sobre 1× A100/H100 de 80 GB o 2× GPU de 48 GB, expone una API compatible con OpenAI fácil de integrar en pipelines internos.
- Apoyo a la redacción y revisión técnica: redacción de textos aeroespaciales con terminología y unidades correctas, verificando los datos contra los documentos fuente proporcionados en el prompt.
- Plantilla para ajustes finos verticales: la receta de datos (generación con GPT-OSS-120B, verificación de citas y partición 80/10/10 por familia documental) es replicable en otros dominios como medicina, legal o energía.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para este ajuste fino. La evaluación propia usa 300 preguntas de validación nunca entrenadas (109 respondibles desde un pasaje, 96 con pasaje que no contiene la respuesta y 95 de libro cerrado), con prompts y ajustes idénticos para base y SpaceQA (reasoning effort low) y calificación independiente de cada respuesta por GPT-OSS-120B contra la referencia y el pasaje fuente.

**llama.cpp, GGUF MXFP4** (base = ggml-org/gpt-oss-20b-GGUF oficial):

| Tipo de pregunta | n | Base: totalmente correcta | SpaceQA: totalmente correcta | Afirmaciones sin apoyo (base → SpaceQA) | SpaceQA mejor / peor |
|---|---|---|---|---|---|
| Respuesta en el contexto suministrado | 109 | 96,3 % | 96,3 % | 3 → 3 | 4 / 3 |
| Respuesta **no** en el contexto suministrado | 96 | 89,6 % | **100 %** | 10 → **0** | 10 / 0 (p = 0,002) |
| Sin contexto (libro cerrado) | 95 | 30,5 % | 34,7 % | 70 → 58 | 18 / 11 |
| Total | 300 | 73,3 % | **78,0 %** | 83 → **61** | 32 / 14 (p = 0,011) |

**vLLM, bf16 (este repositorio)** (base = openai/gpt-oss-20b):

| Tipo de pregunta | Base: totalmente correcta | SpaceQA: totalmente correcta | Afirmaciones sin apoyo (base → SpaceQA) |
|---|---|---|---|
| Respuesta en el contexto suministrado | 96,3 % | 94,5 % | 1 → 5 |
| Respuesta **no** en el contexto suministrado | 87,5 % | **100 %** | 12 → **0** |
| Sin contexto (libro cerrado) | 28,4 % | 34,7 % | 73 → 60 |
| Total | 72,0 % | **77,3 %** | 86 → **65** |

Valores p: test de signos bilateral sobre diferencias de calificación por pregunta. Advertencia de los autores: el evaluador pertenece a la misma familia de modelos que el generador de datos, por lo que las puntuaciones son evidencia de cribado y no una evaluación humana.

## Requisitos de hardware

- Pesos bf16 (este repositorio): 41,9 GB solo de pesos; con caché KV se recomienda 1× A100/H100 de 80 GB o 2× GPU de 48 GB (configuración indicada por los autores para Hugging Face Inference Endpoints con contenedor vLLM). No cabe en GPUs de consumo en bf16.
- GGUF MXFP4 (repositorio hermano): el modelo base gpt-oss-20b en MXFP4 cabe en unos 16 GB de memoria según OpenAI, por lo que la versión GGUF de SpaceQA es ejecutable con llama.cpp en GPUs de consumo con 16 GB o más (por ejemplo, RTX 4090 de 24 GB o RTX 4080 de 16 GB) o en CPU con RAM suficiente.
- Despliegue documentado: vLLM (`vllm serve llmlabcse/SpaceQA-gpt-oss-20b --dtype bfloat16 --max-model-len 32768`), llama.cpp con el GGUF MXFP4 y Hugging Face Inference Endpoints (contenedor vLLM). Ollama y TGI: no documentados para este repositorio (no disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| SpaceQA-gpt-oss-20b | 20,9 B | ~3,6 B | 128 k | Apache-2.0 | QA aeroespacial en inglés con abstinencia |
| openai/gpt-oss-20b (base) | 21,4 B | ~3,6 B | 128 k | Apache-2.0 | General, razonamiento y tool calling |
| Qwen3-14B | 14,8 B (denso) | — | 32 k (131 k con YaRN) | Apache-2.0 | General, multilingüe |
| Gemma 3 27B | 27 B (denso) | — | 128 k | Gemma (con restricciones) | General, multimodal |

No se han publicado benchmarks comparativos de SpaceQA frente a estos modelos; la única comparación disponible es frente a su propio modelo base (ver sección de benchmarks). Frente al base, SpaceQA mejora la abstinencia y el porcentaje global de respuestas correctas, con una ligera regresión en preguntas respondibles desde el contexto en bf16 (94,5 % frente a 96,3 %). Frente a alternativas densas como Qwen3-14B o Gemma 3 27B, la ventaja teórica de SpaceQA es el coste por token de la arquitectura MoE (~3,6 B activos) y la especialización con abstinencia; su desventaja es la cobertura de un solo idioma y dominio.

## Limitaciones y advertencias

- Alucinación en modo libro cerrado: sin documento, el modelo sigue afirmando con frecuencia hechos específicos incorrectos (cifras, fechas, nombres); 58 de las 95 preguntas cerradas generaron afirmaciones sin apoyo incluso tras el ajuste. Conviene proporcionar siempre el texto fuente o recuperar pasajes primero.
- Evaluador de la misma familia: las puntuaciones fueron calificadas por GPT-OSS-120B, la misma familia que generó los datos; son evidencia de cribado, no una evaluación humana.
- Idioma y cobertura: solo inglés y corpus centrado en NASA, ESA e ISRO; el rendimiento fuera de ese ámbito o en otros idiomas no está evaluado.
- Posible regresión en QA con contexto: en bf16, el porcentaje de acierto sobre pasajes respondibles bajó del 96,3 % al 94,5 % y las afirmaciones sin apoyo subieron de 1 a 5, señal de que el fine-tuning puede degradar ligeramente el comportamiento con contexto.
- Sesgos del corpus: Wikipedia y materiales institucionales de agencias concretas pueden introducir sesgos de perspectiva y de actualización; la fecha de corte del conocimiento del modelo base no está indicada en la información disponible (no disponible).
- Uso crítico: los autores advierten explícitamente que el modelo no es apto para aplicaciones críticas para la seguridad.
- Licencia: Apache-2.0, pero el uso está sujeto además a la política de uso de gpt-oss de OpenAI, lo que añade condiciones a revisar antes de un despliegue comercial.
- El entrenamiento usó ejemplos de 2.048 tokens como máximo; el comportamiento con contextos muy largos (hasta 128 k) no fue evaluado (no disponible).

## Enlaces

- Modelo: https://huggingface.co/llmlabcse/SpaceQA-gpt-oss-20b
- Versión GGUF para llama.cpp: https://huggingface.co/llmlabcse/SpaceQA-gpt-oss-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b (incluye la política de uso de gpt-oss)
- GGUF base oficial usado en la evaluación: https://huggingface.co/ggml-org/gpt-oss-20b-GGUF
- Modelo de embeddings compañero para recuperación: https://huggingface.co/llmlabcse/SpaceEmbed-Qwen3-0.6B
- Paper: no disponible (no se ha publicado artículo; la model card referencia la guía de fine-tuning de gpt-oss de OpenAI sin enlace incluido)
- Aplicación Space Tools (modo escritorio y remoto): mencionada en la model card, sin enlace público disponible
