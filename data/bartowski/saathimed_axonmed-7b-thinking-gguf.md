# bartowski/Saathimed_AxonMed-7B-Thinking-GGUF

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje especializado en razonamiento clínico y sanitario, desarrollado por Saathimed y distribuido en formato GGUF por bartowski. Se construye sobre un checkpoint base de aproximadamente 7.600 millones de parametros (7.615.616.512 segun los pesos en safetensors) y esta disenado para tareas de razonamiento medico con cadena de pensamiento (chain-of-thought), incluyendo preguntas de examenes de licencia medica como USMLE, AIIMS y NEET-PG, ademas de preguntas de investigacion biomedica.

El modelo se presenta como una propuesta de "soberania de IA" sanitaria, con soporte declarado para siete idiomas (ingles, hindi, espanol, chino, aleman, frances y ruso) y licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales. Su enfoque en el modo "thinking" lo orienta a escenarios donde se requiere explicitar el razonamiento antes de dar una respuesta, algo relevante en entornos clinicos donde la trazabilidad del razonamiento importa.

Esta ficha cubre la version cuantizada GGUF publicada por bartowski, que incluye un rango amplio de cuantizaciones (desde bf16 completo de 15,24 GB hasta IQ4_XS) generadas con llama.cpp b12600 y con imatrix. La disponibilidad de formatos GGUF lo hace desplegable en hardware de consumo, algo poco habitual en modelos especializados en dominios medicos con razonamiento explicito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de la arquitectura base no disponibles) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS (y otras variantes IQ) |
| Idiomas soportados | en, hi, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Saathimed/AxonMed-7B-Thinking en la documentacion proporcionada. Por el conteo de parametros (7,6 B) y el pipeline de text-generation, se trata de un transformer decoder-only de escala 7B, sin indicios de ser un modelo MoE. La model card de la cuantizacion no detalla el numero de capas, dimensiones ocultas, tipo de atencion ni la longitud de contexto nativa.

Respecto al entrenamiento, la model card lista los datasets utilizados: medmcqa, GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. Estos conjuntos cubren preguntas de examenes medicos (USMLE, AIIMS, NEET-PG), QA biomedica y datos de razonamiento medico con cadena de pensamiento. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no") o atencion lineal.

## Capacidades

- Generacion de texto con modo "thinking": el modelo esta orientado a producir cadenas de razonamiento antes de la respuesta final, segun indican las etiquetas thinking y cot.
- Razonamiento clinico y medico: entrenado sobre datasets de examenes de licencia medica (USMLE, AIIMS, NEET-PG) y QA biomedica.
- Respuesta a preguntas de opcion multiple en dominios medicos (MedQA, MedMCQA).
- Question answering sobre literatura biomedica (PubMedQA).
- Soporte de tool calling / function calling: la model card incluye un formato de prompt explicito con definiciones de herramientas en XML (`<tools>`) y llamadas en `<tool_call>`.
- Capacidades multilingues declaradas para en, hi, es, zh, de, fr, ru.
- Formato de prompt compatible con ChatML (`<|im_start|>` / `<|im_end|>`), lo que facilita su integracion en frameworks conversacionales.
- No se declaran capacidades de vision, audio ni otros modalidades.

## Casos de uso

- Formacion medica y preparacion de examenes: el modelo puede resolver preguntas de estilo USMLE, AIIMS o NEET-PG con razonamiento explicito, lo que lo hace util como tutor que muestra el proceso de descarte de opciones y no solo la respuesta.
- Apoyo a la decision clinica documental: dado su entrenamiento en PubMedQA y razonamiento CoT, puede resumir y razonar sobre abstracts y articulos biomedicos para profesionales que necesitan una primera aproximacion trazable.
- Asistente de documentacion clinica: con contexto conversacional multi-turno y formato ChatML, puede redactar notas, resumenes de historiales o explicaciones para pacientes, siempre con supervision humana.
- Investigacion en NLP medico: sirve como base para experimentos de razonamiento clinico, evaluacion de CoT en dominios de alto riesgo y comparacion de estrategias de prompting.
- Integracion en pipelines de agentes sanitarios: el soporte de function calling permite conectarlo a APIs de historiales, calculadoras clinicas o bases de farmacos dentro de flujos multi-paso.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (4,78 GB) e IQ4_XS permiten ejecutarlo en GPUs de consumo o incluso en CPU, util para prototipos y demos locales sin depender de la nube.
- Atencion al cliente en salud (triaje informativo): con prompts de sistema adecuados y limites claros, puede gestionar conversaciones de orientacion no diagnostica en varios idiomas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Medical Board USMLE Examination | MedQA (USMLE 4-Options), test | 0-shot Accuracy | 64,1 |
| Medical Board USMLE Examination | MedQA (USMLE 4-Options), test | 0-shot Normalized Accuracy | 64,1 |
| Multiple-Choice Medical QA | MedMCQA (AIIMS / NEET-PG), validation | 0-shot Accuracy | 61,15 |
| Multiple-Choice Medical QA | MedMCQA (AIIMS / NEET-PG), validation | 0-shot Normalized Accuracy | 61,15 |
| Biomedical Research QA | PubMedQA, test | 0-shot Accuracy | 75,8 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones oficiales con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - bf16: ~15,24 GB.
  - Q8_0: ~8,10 GB.
  - Q6_K: ~6,40 GB.
  - Q5_K_M: ~5,52 GB.
  - Q4_K_M: ~4,78 GB (recomendada por el autor de la cuantizacion).
  - IQ4_XS / Q4_K_S: ~4,51 GB o menos.
- GPU recomendadas:
  - bf16: A100 40 GB, H100, o RTX 4090 24 GB (con margen para contexto).
  - Q8_0: RTX 4090, RTX 3090, A10G 24 GB.
  - Q5_K_M / Q4_K_M: RTX 4070 Ti, RTX 4060 Ti 16 GB, RTX 3060 12 GB.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en 6 GB con IQ4_XS y contexto reducido.
- Opciones de despliegue: llama.cpp (version b12600 usada para la cuantizacion), Ollama, LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| AxonMed-7B-Thinking (este) | ~7,6 B | no disponible | Razonamiento medico CoT | Apache 2.0 | GGUF, safetensors |
| Modelos medicos 7B genericos (p. ej. variantes Meditron/MedAlpaca) | ~7 B | no disponible | QA medica | variable | safetensors, GGUF |
| Modelos generalistas 7B con modo thinking | ~7-8 B | no disponible | Razonamiento general | variable | safetensors, GGUF |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con alternativas concretas, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones clinicas incorrectas con apariencia de rigor; no debe usarse como sustituto del juicio medico.
- No apto para diagnostico ni decision terapeutica autonoma sin supervision de un profesional sanitario.
- Sesgos potenciales derivados de los datasets de entrenamiento (predominantemente examenes medicos y literatura en ingles), lo que puede limitar su robustez en otros contextos sanitarios o idiomas.
- Longitud de contexto no documentada: planificar el despliegue con contexto conservador hasta verificar el limite real.
- Soporte multilingue declarado pero no cuantificado; la calidad en idiomas distintos del ingles no esta respaldada por benchmarks publicados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad regulatoria (por ejemplo, MDR en la UE) si lo integra en productos sanitarios.
- El repositorio GGUF ocupa 107,9 GB por incluir todas las variantes de cuantizacion; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/Saathimed_AxonMed-7B-Thinking-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Cuantizacion recomendada Q4_K_M: https://huggingface.co/bartowski/Saathimed_AxonMed-7B-Thinking-GGUF/blob/main/Saathimed_AxonMed-7B-Thinking-Q4_K_M.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12600: https://github.com/ggml-org/llama.cpp/releases/tag/b12600
- Dataset MedMCQA: https://huggingface.co/datasets/medmcqa
- Dataset MedQA USMLE 4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset medical_meadow_usmle_self_assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
