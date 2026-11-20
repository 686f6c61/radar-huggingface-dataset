# SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged

## Resumen

Tiny Aya Fire 3.35B Tamil & Tanglish Clinical Triage es un ajuste fino del modelo base CohereLabs/tiny-aya-fire (3.35B parámetros), desarrollado por SamSankar como envío al hackathon de seguridad y alineación de Lexsi Labs. El modelo está especializado en triaje clínico estructurado en tres niveles (CRITICAL, URGENT, NON-URGENT) para tamil nativo, tamil romanizado y tanglish (código mezclado tamil-inglés), con una política estricta de "cero prescripción" que le impide recomendar fármacos, dosis o pautas antibióticas.

El problema que aborda es concreto: los modelos multilingües sin alinear colapsan al inglés en contextos de tamil hablado (10,4% de adherencia al script tamil nativo en el modelo base), aceptan peticiones adversarias de medicación (30,0% de tasa de bypass) y clasifican mal la gravedad (Macro F1 de 0,61). Este ajuste eleva esas métricas a 92,5% de adherencia al script, 0,0% de bypass adversario y Macro F1 de 1,00 según la auditoría del autor.

La arquitectura subyacente es Cohere2 (transformer decoder-only) con 3.349.227.520 parámetros, distribuida en safetensors en fp16 (33,5 GB de repositorio). El modelo se publica con licencia apache-2.0, aunque el modelo base del que deriva se distribuye bajo cc-by-nc-4.0, lo que introduce una advertencia legal relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer decoder-only) |
| Parametros totales | 3.349.227.520 (3,35B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 / torch.float16) |
| Idiomas soportados | tamil (script nativo), tamil romanizado, tanglish (código mezclado tamil-inglés), inglés |
| Licencia | apache-2.0 (modelo base bajo cc-by-nc-4.0) |
| Formato de pesos | safetensors (fp16, 33,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de CohereLabs/tiny-aya-fire, un transformer decoder-only de la familia Aya de Cohere Labs con 3,35B parámetros. El ajuste se realizó mediante un pipeline end-to-end denominado CuratorKit -> AlignTune -> Clinical Triage Engine -> AuditKit, que cubre la curación de datos, el alineamiento, la inferencia con motor de triaje y la auditoría. El resultado es un modelo fusionado (merged) en fp16, con un adaptador LoRA publicado por separado.

El conjunto de entrenamiento cubre 24 dominios clínicos ESI/WHO: 10 críticos (cardíaco/SCA, respiratorio pediátrico/convulsión febril, ictus/F.A.S.T., anafilaxia, trauma grave/hemorragia, urgencias obstétricas, mordedura de serpiente, hipoglucemia diabética, intoxicación química, sepsis), 8 urgentes (fiebre alta/dengue, deshidratación, retención urinaria, fractura/luxación, crisis asmática, infección de herida postoperatoria, úlcera de pie diabético, infección grave/migraña/úlcera/trampas oculares) y 6 no urgentes (URI leve, cefalea tensional, erupción cutánea leve, indigestión leve, esguince menor, bienestar rutinario). La curación incluyó un filtro de procedencia con expresiones regulares de límite de palabra que bloquea más de 35 patrones (la model card se trunca en ese punto). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional en tamil nativo, tamil romanizado, tanglish e inglés.
- Triaje clínico estructurado en tres niveles: CRITICAL, URGENT y NON-URGENT.
- Escalada automática a ambulancia 108 en casos clasificados como CRITICAL (100% de cumplimiento en la auditoría).
- Guardrail de cero prescripción: rechaza prescribir, confirmar o recomendar nombres de fármacos, pautas antibióticas, gotas de esteroides o dosis.
- Adherencia alta al script tamil nativo (92,5% en la categoría 1 de la auditoría), frente al 10,4% del modelo base.
- Soporte de retrotransliteración sin pérdida para llamantes que usan tamil romanizado.
- Clasificación de gravedad con integridad de esquema de triaje (Macro F1 de 1,00 en la auditoría del autor).
- Resistencia a ataques adversarios de seguridad (0,0% de bypass en las 10 trampas adversarias evaluadas).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Triaje telefónico de urgencias en tamil: el modelo gestiona la conversación con el llamante en tamil nativo o romanizado, clasifica la gravedad y activa la derivación al 108 cuando detecta un caso crítico, manteniendo el script tamil en la respuesta.
- Atención a comunidades de la diáspora tamil: permite atender consultas en tanglish (código mezclado) sin forzar al usuario a cambiar a inglés, algo habitual en poblaciones que describen síntomas mezclando idiomas.
- Filtro de seguridad en chatbots sanitarios: el guardrail de cero prescripción actúa como capa de rechazo ante peticiones de dosis o antibióticos, útil para integrarse delante de un modelo generativo más grande en un pipeline de producción.
- Sistemas de derivación con reglas clínicas: la salida estructurada en tres niveles y la escalada 108 permiten integrar el modelo en un motor de decisión que enruta al paciente al recurso adecuado (ambulancia, urgencia hospitalaria o atención primaria).
- Formación y simulación clínica: el modelo puede generar escenarios de triaje realistas en tamil y tanglish para entrenar a personal sanitario o evaluar protocolos de urgencias en contextos multilingües.
- Investigación en alineación multilingüe: sirve como caso de estudio reproducible (con dataset, LoRA, artefactos de auditoría y evaluación de tres capas) para medir sesgo de idioma en jueces LLM y evaluar guardrails de seguridad en lenguas de bajos recursos.
- Preprocesado de historiales clínicos: la retrotransliteración sin pérdida permite normalizar transcripciones de llamadas en tamil romanizado antes de almacenarlas o analizarlas.

## Benchmarks y rendimiento

Resultados de la auditoría AuditKit del autor sobre 40 sondas estratificadas (10 tamil nativo, 10 tamil romanizado, 10 tanglish, 10 trampas adversarias), con 0% de fuga entre entrenamiento, test y benchmark. El juez de la capa 2 es openai/gpt-oss-120b en Groq, cegado a la identidad del modelo.

| Dimensión de evaluación | Métrica | Modelo base | Modelo alineado | Ganancia |
|---|---|---:|---:|---:|
| Cumplimiento de seguridad AuditKit | Pass % global | 52,5% | 97,5% | +45,0% |
| Guardrail de cero prescripción | Rechazo de fármacos y dosis % | 80,0% | 100,0% | +20,0% |
| Cumplimiento de escalada 108 | Routing crítico % | 100,0% | 100,0% | 0,0% |
| Integridad del esquema de triaje | Macro F1 | 0,61 | 1,00 | +0,39 |
| Tasa de alucinación crítica | Falsos negativos % | 0,0% | 0,0% | 0,0% |
| Bypass adversario de seguridad | Bypass % | 30,0% | 0,0% | -30,0% |
| Cumplimiento de script y dialecto | Puntuación media capa 3 | 0,776 | 0,981 | +0,205 |
| Adherencia al script tamil nativo | Puntuación categoría 1 | 10,4% | 92,5% | +82,1% |
| Eficiencia de cómputo de tokens | Tokens medios por generación | 229 | 192 | -16,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6,7 GB solo para pesos (3,35B parámetros x 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 8 y 10 GB según longitud de contexto y lote.
- En cuantización de 8 bits: alrededor de 3,5 GB de pesos, viable en GPU consumer de 8 GB.
- En cuantización de 4 bits: alrededor de 2 GB de pesos, viable en GPU consumer de 6-8 GB (RTX 3060, RTX 4060, RTX 2070 en adelante).
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) para lotes grandes o contexto largo.
- GPU consumer compatibles: RTX 3090, RTX 4090, RTX 4080, RTX 4070 Ti en fp16; RTX 3060/4060 en 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en fp16, llama.cpp y Ollama si se generan pesos GGUF a partir del modelo (no se publican GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada. La única métrica de eficiencia es la reducción del 16,1% en tokens medios por generación (192 frente a 229).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Tiny Aya Fire 3.35B Tamil & Tanglish Clinical Triage | 3,35B | no disponible | Triaje clínico tamil/tanglish con cero prescripción | apache-2.0 (base cc-by-nc-4.0) | Hugging Face, safetensors fp16 + LoRA |
| CohereLabs/tiny-aya-fire (base) | 3,35B | no disponible | Multilingüe general | cc-by-nc-4.0 | Hugging Face |
| Modelos multilingües generales de ~3B (p. ej. familia Aya) | ~3B | no disponible | Generación multilingüe general | variable | Hugging Face |
| Modelos clínicos especializados en inglés de ~3-7B | 3-7B | no disponible | Triaje o QA clínico en inglés | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada: no se aportan métricas de otros modelos bajo el mismo protocolo AuditKit ni bajo benchmarks estándar.

## Limitaciones y advertencias

- El modelo base CohereLabs/tiny-aya-fire se distribuye bajo cc-by-nc-4.0 (no comercial), mientras que este ajuste declara apache-2.0. Existe una inconsistencia de licencias que conviene resolver antes de cualquier uso comercial; la licencia del modelo base puede imponer restricciones sobre el derivado.
- Es un modelo de triaje, no un dispositivo médico: no sustituye la evaluación de un profesional sanitario ni constituye diagnóstico. La clasificación CRITICAL/URGENT/NON-URGENT debe validarse con protocolos clínicos locales antes de producción.
- Los benchmarks presentados son autoinformados por el autor, sobre 40 sondas y con un juez LLM externo (openai/gpt-oss-120b); el tamaño muestral es pequeño y no hay validación independiente.
- Riesgo de alucinación clínica: aunque la auditoría reporta 0,0% de falsos negativos críticos en las 40 sondas, el modelo puede generar contenido plausible pero incorrecto en dominios no cubiertos por los 24 dominios ESI/WHO entrenados.
- Cobertura limitada a tamil, tamil romanizado, tanglish e inglés; no se documenta rendimiento en otras lenguas ni en variantes dialectales del tamil.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones largas o historiales clínicos extensos.
- El guardrail de cero prescripción puede producir rechazos excesivos en consultas legítimas de información farmacológica general (por ejemplo, para formación de personal sanitario).
- No se documentan sesgos demográficos, de género ni socioeconómicos; la evaluación no incluye análisis de equidad.
- El repositorio ocupa 33,5 GB en fp16, lo que complica el despliegue en entornos con almacenamiento limitado sin cuantización previa.
- No se publican pesos GGUF ni cuantizaciones listas para usar; el despliegue en consumer requiere conversión manual.
- La model card está truncada en la información disponible, por lo que pueden existir detalles de entrenamiento y limitaciones no recogidos aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-merged
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-fire
- Artículo del autor: https://huggingface.co/blog/SamSankar/tiny-aya-tamil-clinical-triage
- Colección de modelos del hackathon: https://huggingface.co/collections/SamSankar/lexsi-hackathon-tamil-and-tanglish-clinical-triage-models-6af5d4e82a111b90c013c344
- Colección de datos y auditoría: https://huggingface.co/collections/SamSankar/lexsi-hackathon-tamil-clinical-triage-data-and-audit-6af5d543b64d84b75c5d59fc
- Adaptador LoRA: https://huggingface.co/SamSankar/tiny-aya-fire-3.35b-tamil-tanglish-clinical-triage-lora
- Dataset curado: https://huggingface.co/datasets/SamSankar/tamil-tanglish-clinical-triage-dataset
- Artefactos de auditoría: https://huggingface.co/datasets/SamSankar/tamil-tanglish-clinical-triage-audit-artifacts
