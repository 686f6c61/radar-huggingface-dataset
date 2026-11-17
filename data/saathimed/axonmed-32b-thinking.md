# Saathimed/AxonMed-32B-Thinking

## Resumen

AxonMed-32B-Thinking es un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 33B) especializado en razonamiento clínico y dominio médico, desarrollado por SaathiMed Private Limited (India). Se construye mediante fine-tuning sobre el modelo base Saathimed/AxonMed-32B-Titan y está diseñado para ejecutar trazas internas de razonamiento clínico latente delimitadas por las etiquetas `` antes de emitir una conclusión médica estructurada. Su propuesta de valor es ofrecer razonamiento médico de nivel "board" en pesos abiertos y con licencia Apache 2.0, un espacio tradicionalmente dominado por modelos propietarios de gran escala.

El modelo se apoya en la arquitectura Qwen2 (según los tags de Hugging Face) y se distribuye en formato safetensors con pesos en bfloat16, con un tamaño de repositorio de 65,5 GB. Soporta siete idiomas (inglés, español, chino, alemán, francés, ruso e hindi) y está orientado a pipelines de NLP clínico, soporte a la decisión médica y extracción estructurada de conceptos clínicos (dosis, negación clínica, etiquetado BIO).

Es relevante ahora porque el autor declara resultados de 75,81% en MedQA (USMLE 4 opciones) y 79,00% en PubMedQA en evaluación zero-shot con `lm-evaluation-harness` v0.4.13, cifras que, según la model card, empatan con Med-Gemini (540B) en PubMedQA con un modelo 16 veces menor. No obstante, estos resultados están declarados por el autor y no verificados de forma independiente (`verified: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (tag `qwen2`) |
| Parametros totales | 32.763.876.352 (~33B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, es, zh, de, fr, ru, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2 con 32.763.876.352 parámetros, derivado por fine-tuning del checkpoint Saathimed/AxonMed-32B-Titan. La innovación declarada es el modo de razonamiento clínico latente: el modelo genera una traza interna dentro de `<think>...</think>` que estructura el razonamiento en cuatro etapas (parsing de presentación clínica y constantes vitales, fisiopatología y diagnósticos diferenciales, alineación de formato y aserciones con negación clínica y códigos ICD, y salida accionable). No se documenta en la información disponible si se empleó RLHF, DPO u otra etapa de alineación, ni el número exacto de tokens de entrenamiento.

Los datasets citados en la model card son GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. No se especifica la composición proporcional del corpus, el volumen total de tokens ni si hubo etapas de continuación de preentrenamiento sobre literatura biomédica. Tampoco se detallan técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento clínico estructurado con traza interna `<think>...</think>` en cuatro etapas.
- Resolución de preguntas de examen médico tipo USMLE (MedQA) en formato de elección múltiple.
- Question answering biomédico sobre literatura (PubMedQA).
- Extracción clínica estructurada: spans de dosificación, etiquetado de conceptos BIO y detección de negación clínica.
- Mapeo de códigos ICD según la etapa 3 del razonamiento declarado.
- Multilingüismo en inglés, español, chino, alemán, francés, ruso e hindi.
- Conversación multi-turno mediante `apply_chat_template` con roles system/user/assistant.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Soporte a la decisión clínica en entornos supervisados: el modelo puede procesar una presentación clínica completa (motivo de consulta, constantes, antecedentes) y generar un diferencial razonado con prioridades diagnósticas y terapéuticas, útil como segunda opinión para el clínico dentro de un sistema con supervisión humana.
- Preparación de exámenes médicos y formación: resolución razonada de preguntas tipo USMLE con traza explícita de razonamiento, adecuada para plataformas educativas que necesitan mostrar el porqué de cada respuesta.
- Extracción de información estructurada de notas clínicas: identificación de dosis, fármacos, negaciones ("no presenta dolor torácico") y conceptos clínicos con etiquetado BIO, para poblar bases de datos clínicas o historiales electrónicos.
- Revisión de literatura biomédica: respuesta a preguntas de investigación sobre abstracts de PubMed con justificación, útil en pipelines de revisión sistemática asistida.
- Codificación clínica asistida: mapeo de descripciones libres a códigos ICD como paso previo a la facturación o a la analítica de calidad asistencial.
- Triaje y priorización en urgencias: dado un conjunto de constantes y síntomas, el modelo puede generar una evaluación de riesgo estructurada que ayude a priorizar la atención, siempre con validación por personal sanitario.
- Localización multilingüe de contenido médico: generación de material clínico divulgativo o de formación en español, francés, alemán, ruso, chino e hindi a partir de fuentes en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (zero-shot, `lm-evaluation-harness` v0.4.13, `verified: false`):

| Modelo | Parametros | Organizacion | MedQA (USMLE) | PubMedQA |
|---|---|---|---|---|
| Meta LLaMA-3-70B-Instruct | 70B | Meta AI | 68,10% | 75,80% |
| OpenBioLLM-70B | 70B | Saama AI Lab | 70,20% | 76,40% |
| OpenAI GPT-4 (Base/Early) | ~1,8T | OpenAI | 81,40% | 75,20% |
| Google Med-Gemini | 540B | Google Research | 84,10% | 79,20% |
| AxonMed-32B-Thinking | 33B | SaathiMed | 75,81% | 79,00% |

Las cifras de los modelos comparados proceden de la propia model card del autor y no se han contrastado con sus publicaciones originales. Los valores de AxonMed-32B-Thinking no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 2× A100 80GB, 2× H100 80GB o una H200 141GB para ejecución cómoda.
- GPU recomendadas: A100 80GB, H100 80GB, H200; configuraciones multi-GPU con `device_map="auto"` o tensor parallelism.
- No cabe en GPU de consumo (RTX 4090 24GB, RTX 3090 24GB) en bfloat16. Sería necesario cuantizar a 4 bits (no se publican pesos GGUF/AWQ/GPTQ oficiales), lo que reduciría el requisito a unos 17-20 GB, ajustado pero posible en una RTX 4090.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA | PubMedQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AxonMed-32B-Thinking | 33B | No disponible | 75,81% | 79,00% | Apache 2.0 | Hugging Face |
| OpenBioLLM-70B | 70B | No disponible | 70,20% | 76,40% | No disponible en la informacion | Hugging Face |
| Meta LLaMA-3-70B-Instruct | 70B | No disponible | 68,10% | 75,80% | Licencia comunitaria Llama 3 | Hugging Face |
| Google Med-Gemini | 540B | No disponible | 84,10% | 79,20% | Propietaria | No publico |

Los datos de MedQA y PubMedQA de los modelos comparados proceden de la model card de AxonMed y no se han verificado de forma independiente. La comparación de contexto no es posible porque no se documenta la ventana de contexto de ninguno de los modelos en la información disponible.

## Limitaciones y advertencias

- Los benchmarks están declarados por el autor con `verified: false`; no hay evaluación independiente publicada.
- Riesgo de alucinación clínica: como todo LLM, puede generar diagnósticos, dosis o códigos ICD plausibles pero incorrectos; la model card exige supervisión clínica y guardrails deterministas en entornos con pacientes reales.
- No es un dispositivo médico: la propia model card lo posiciona para investigación, soporte a la decisión y NLP clínico, no para diagnóstico autónomo.
- Sesgos potenciales derivados de los datasets de entrenamiento (MedQA, PubMedQA, medical-o1-reasoning-SFT, medical_meadow_usmle): predominio de literatura y exámenes en inglés y de población de EE. UU., con posible menor cobertura de patologías prevalentes en otras regiones.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de historiales clínicos largos.
- No se documentan pesos cuantizados oficiales, lo que limita el despliegue en hardware de consumo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (MDR, FDA, etc.) recae en el integrador.
- Modelo con 0 descargas y 1 like en el momento de la ficha: ecosistema y validación comunitaria prácticamente inexistentes.
- El identificador del modelo base (AxonMed-32B-Titan) y la propia organización SaathiMed tienen poca trazabilidad pública más allá de la model card y el preprint en Zenodo.

## Enlaces

- Hugging Face: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Titan
- Preprint técnico (Zenodo): https://doi.org/10.5281/zenodo.24143274
- ORCID del autor: https://orcid.org/0009-0006-7093-6762
- Dataset MedQA USMLE 4 opciones: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset medical_meadow_usmle_self_assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
