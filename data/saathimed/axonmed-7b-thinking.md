# Saathimed/AxonMed-7B-Thinking

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 B) especializado en razonamiento clínico, desarrollado por SaathiMed Private Limited (India) y publicado bajo licencia Apache 2.0. Se construye como un ajuste fino de `Saathimed/AxonMed-7B`, que a su vez emplea la arquitectura Qwen2, y su rasgo distintivo es la incorporación de razonamiento latente en tiempo de inferencia mediante bloques `` de cuatro fases orientados a la práctica médica.

El modelo aborda el problema del razonamiento clínico verificable en dominios sanitarios: no solo responde preguntas médicas, sino que estructura el proceso (presentación clínica y constantes, fisiopatología y diagnósticos diferenciales, alineación de formato y aserciones —negaciones, dosis, códigos ICD-10— y salida final accionable). Está entrenado sobre conjuntos de datos médicos reconocidos como MedQA-USMLE, MedMCQA, PubMedQA, medical-o1-reasoning-SFT y medical_meadow_usmle_self_assessment.

Su relevancia actual radica en que ofrece pesos abiertos con resultados declarados en evaluaciones de consejo médico (USMLE, AIIMS/NEET-PG) por encima de modelos de tamaño similar como Meditron-7B, BioMistral-7B u OpenBioLLM-8B, y en que declara soporte multilingüe en siete idiomas (en, hi, es, zh, de, fr, ru). No obstante, las métricas proceden del autor y no están verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con razonamiento chain-of-thought en inferencia |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bfloat16/float16; no se documentan GGUF ni AWQ) |
| Idiomas soportados | en, hi, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, ajustado a partir del checkpoint `Saathimed/AxonMed-7B`. Sobre esa base, el ajuste fino introduce un patrón de razonamiento clínico en cuatro fases que el modelo emite dentro de etiquetas `` antes de la respuesta final: análisis de presentación clínica y constantes, evaluación de fisiopatología y diagnósticos diferenciales, alineación de formato y aserciones (resolución de negaciones clínicas, verificación de dosis, correspondencia con códigos ICD-10) y formulación de la salida accionable final.

Los datos de entrenamiento declarados incluyen MedQA-USMLE-4-options, MedMCQA, PubMedQA, medical-o1-reasoning-SFT y medical_meadow_usmle_self_assessment. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco detalla innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El autor publica un informe técnico en Zenodo (DOI 10.5281/zenodo.24143274) que presumiblemente contiene esos detalles, pero no se incluye su contenido en la información disponible.

## Capacidades

- Generación de texto y razonamiento clínico estructurado mediante cadenas de pensamiento en bloques ``.
- Respuesta a preguntas de opción múltiple de nivel de consejo médico (USMLE, AIIMS, NEET-PG) y de investigación biomédica (PubMedQA).
- Extracción clínica estructurada a partir de textos de práctica real.
- Identificación de negaciones clínicas (por ejemplo, distinguir "sin dolor torácico" de "con dolor torácico").
- Verificación de dosificaciones de medicamentos y alineación con códigos ICD-10.
- Razonamiento diagnóstico diferencial guiado por fisiopatología.
- Soporte multilingüe declarado en inglés, hindi, español, chino, alemán, francés y ruso.
- Compatibilidad con `text-generation-inference` y endpoints compatibles según los tags del repositorio.
- Soporte de plantilla de chat conversacional (`apply_chat_template`) con rol de sistema.
- No se documenta soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Apoyo a la decisión clínica en entornos supervisados: el modelo puede desglosar un caso (presentación, constantes, ECG, analítica) y emitir un diferencial razonado antes de la recomendación, lo que facilita la revisión por parte del clínico. Es adecuado porque su entrenamiento está orientado precisamente a ese flujo de cuatro fases.
- Codificación clínica automatizada: extracción de diagnósticos y procedimientos de notas clínicas y asignación de códigos ICD-10, con verificación de aserciones y negaciones para evitar codificar hallazgos descartados.
- Procesamiento de literatura biomédica: respuesta a preguntas de investigación sobre abstracts de PubMed (PubMedQA) y resumen de evidencia, útil en pipelines de revisión sistemática asistida.
- Preparación de exámenes médicos: generación de explicaciones razonadas para preguntas tipo USMLE o NEET-PG, con justificación de por qué los distractores son incorrectos, aprovechando la fase de eliminación de hipótesis.
- Extracción de información estructurada de informes clínicos: identificación de medicación, dosis, duración y negaciones en textos de historia clínica para su volcado a bases de datos o sistemas de historia clínica electrónica.
- Triaje asistido y generación de resúmenes de caso: dado un conjunto de notas y constantes, producir un resumen clínico estructurado que un profesional pueda validar, con el razonamiento explícito como traza auditable.
- Investigación en NLP clínico: evaluación comparativa de razonamiento médico en varios idiomas (incluido el español) gracias a su cobertura multilingüe declarada.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, `lm-evaluation-harness` v0.4.13, no verificados de forma independiente):

| Modelo | Parámetros | Organización | MedQA (USMLE) | MedMCQA (AIIMS/NEET-PG) | PubMedQA |
|---|---|---|---|---|---|
| Meditron-7B | 7B | EPFL | ~52,00 % | 52,30 % | 74,40 % |
| BioMistral-7B | 7B | INSERM | ~53,80 % | 51,80 % | 74,80 % |
| Meta LLaMA-3-8B | 8B | Meta AI | ~54,20 % | 54,10 % | 72,00 % |
| OpenBioLLM-8B | 8B | Saama AI Lab | 58,99 % | 56,91 % | 74,12 % |
| OpenAI GPT-3.5 Turbo | ~175B | OpenAI | 60,50 % | 60,20 % | 75,20 % |
| AxonMed-7B-Thinking | 7,6B | SaathiMed | 64,10 % | 61,15 % | 75,80 % |

Los valores de los modelos comparativos proceden de la propia model card del autor y no se han contrastado con sus fuentes originales. Las métricas de AxonMed-7B-Thinking figuran con `verified: false` en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/float16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contextos moderados.
- En cuantización de 8 bits (si se genera con herramientas externas, no publicada por el autor): alrededor de 8 GB de pesos, con margen adicional para activaciones.
- En cuantización de 4 bits (no publicada oficialmente): alrededor de 4-5 GB de pesos, viable en GPUs de consumo con 8-12 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para despliegue de producción con lotes y contextos largos; RTX 4090 (24 GB) para inferencia en bf16 de una sola instancia; RTX 3090 (24 GB) como alternativa.
- GPUs de consumo: cabe en RTX 4090/3090 en bf16; en RTX 4080/4070 Ti (16 GB) requeriría cuantización de 8 bits; en GPUs de 8-12 GB haría falta cuantización de 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), `text-generation-inference` (tag del repo) y endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no se documentan explícitamente más allá del tag de TGI, por lo que su compatibilidad no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MedQA | MedMCQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| AxonMed-7B-Thinking | 7,6B | no disponible | 64,10 % | 61,15 % | 75,80 % | Apache 2.0 | Pesos abiertos en HF |
| Meditron-7B | 7B | no disponible | ~52,00 % | 52,30 % | 74,40 % | Llama 2 (uso restringido) | Pesos abiertos en HF |
| BioMistral-7B | 7B | no disponible | ~53,80 % | 51,80 % | 74,80 % | Apache 2.0 | Pesos abiertos en HF |
| OpenBioLLM-8B | 8B | no disponible | 58,99 % | 56,91 % | 74,12 % | Llama 3 (uso restringido) | Pesos abiertos en HF |

Los datos de los modelos comparativos provienen de la model card del autor y no se han verificado de forma independiente. La ventaja declarada de AxonMed-7B-Thinking se concentra en MedQA y MedMCQA, mientras que en PubMedQA la diferencia es más estrecha.

## Limitaciones y advertencias

- Las métricas de benchmarks son declaradas por el autor y figuran como no verificadas (`verified: false`); no deben tomarse como resultados validados de forma independiente.
- Riesgo de alucinación clínica: como todo modelo generativo, puede producir diagnósticos, dosis o códigos ICD-10 plausibles pero incorrectos; el autor exige supervisión de un clínico en entornos con pacientes reales.
- No es un dispositivo médico ni sustituye el juicio clínico; la model card lo posiciona para investigación, apoyo a la decisión y pipelines de NLP clínico.
- Sesgos potenciales derivados de los datasets de entrenamiento (predominantemente en inglés y orientados a exámenes de EE. UU. e India); el rendimiento real en español, hindi, chino, alemán, francés y ruso no está cuantificado en la información disponible.
- Longitud de contexto no documentada, lo que dificulta planificar su uso con historiales clínicos largos.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin conversión manual.
- Soporte de tool calling y función de agente no documentado explícitamente.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el uso en producción sanitaria requiere validación regulatoria y salvaguardas deterministas adicionales.
- El modelo es un ajuste fino de un modelo base del mismo autor; la procedencia y calidad del preentrenamiento de `AxonMed-7B` no se detallan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B
- Informe técnico (Zenodo): https://doi.org/10.5281/zenodo.24143274
- ORCID del autor: https://orcid.org/0009-0006-7093-6762
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/medmcqa
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset medical_meadow_usmle_self_assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
