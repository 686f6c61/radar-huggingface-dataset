# mradermacher/AxonMed-32B-Thinking-GGUF

## Resumen

AxonMed-32B-Thinking es un modelo de lenguaje de 32.763.876.352 parámetros (aproximadamente 32,8 mil millones), afinado para razonamiento clínico y médico, y publicado originalmente por Saathimed bajo el identificador `Saathimed/AxonMed-32B-Thinking`. La versión analizada aquí es la cuantización GGUF estática realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y derivados.

El modelo está orientado a tareas de razonamiento médico con cadena de pensamiento (chain-of-thought), entrenado sobre datasets como MedQA-USMLE-4-options, PubMedQA, medical-o1-reasoning-SFT y medical_meadow_usmle_self_assessment. Los tags de la model card indican soporte multilingüe en inglés, español, chino, alemán, francés, ruso e hindi, y una licencia Apache 2.0 que permite uso comercial.

La relevancia de esta ficha radica en que la versión GGUF facilita el despliegue local del modelo base sin necesidad de GPUs de datacenter, algo crítico en contextos clínicos donde la confidencialidad de los datos desaconseja el envío a APIs externas. El repositorio ocupa 224 GB e incluye 11 variantes de cuantización desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de un transformer de 32B; la model card no detalla la arquitectura) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existen también cuantizaciones i1/imatrix en repositorio separado |
| Idiomas soportados | en, es, zh, de, fr, ru, hi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base original presumiblemente en safetensors) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada más allá del recuento de parámetros (32,8B) y de la naturaleza conversacional del modelo. El nombre y los tags sugieren un transformer decoder-only con modo "thinking" (cadena de pensamiento explícita), pero no se confirma en la model card disponible. Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del dataset más allá de los cuatro conjuntos citados, ni si se aplicaron etapas de RLHF, DPO o SFT específicas.

Los datasets referenciados indican un enfoque en razonamiento clínico tipo USMLE (MedQA-4-options y medical_meadow_usmle_self_assessment), evidencia biomédica (PubMedQA) y razonamiento médico sintético (medical-o1-reasoning-SFT). El sufijo "Thinking" y el tag `cot` apuntan a que el modelo genera trazas de razonamiento antes de la respuesta final, práctica habitual en modelos médicos afinados para imitar el razonamiento clínico paso a paso.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento clínico con cadena de pensamiento explícita (modo thinking).
- Resolución de preguntas de tipo USMLE de opción múltiple.
- Razonamiento sobre literatura biomédica (PubMedQA).
- Soporte multilingüe declarado en siete idiomas: inglés, español, chino, alemán, francés, ruso e hindi.
- Formato conversacional compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Apoyo a la formación médica: el modelo puede resolver y razonar preguntas estilo USMLE, mostrando la traza de razonamiento paso a paso, lo que resulta útil en plataformas de estudio para residentes y estudiantes de medicina.
- Segunda opinión clínica asistida: con cuantización Q5_K_M o Q6_K desplegada en local, se puede usar como apoyo a la revisión de casos, manteniendo los datos del paciente dentro de la infraestructura del hospital.
- Triaje documental de literatura científica: procesar abstracts de PubMed y responder preguntas de evidencia (PubMedQA) para filtrar artículos relevantes en revisiones sistemáticas.
- Chatbot informativo para pacientes: gracias al soporte multilingüe (es, en, de, fr, etc.) y al contexto conversacional, puede gestionar FAQs médicas acotadas con respuestas matizadas y derivación a profesionales.
- Generación de resúmenes clínicos estructurados: a partir de notas médicas, producir resúmenes con razonamiento explícito que un clínico pueda auditar (siempre con revisión humana).
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (18,9 GB) y Q4_K_M (20,0 GB) caben en GPUs consumer de 24 GB, permitiendo prototipado rápido sin infraestructura de datacenter.
- Investigación en NLP clínico: servir como baseline reproducible para estudiar razonamiento CoT en dominios médicos, dado que la licencia Apache 2.0 permite modificaciones y publicación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 12,4 GB; Q3_K_M ≈ 16,0 GB; Q4_K_M ≈ 20,0 GB; Q5_K_M ≈ 23,4 GB; Q6_K ≈ 27,0 GB; Q8_0 ≈ 34,9 GB. Añadir overhead de contexto KV cache (no cuantificado en la información disponible).
- GPU recomendadas: para Q4_K_M y superiores, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes; Q6_K requiere 32 GB (A100 40GB, RTX A6000, o dos GPUs de 24 GB); Q8_0 requiere 40 GB o más (A100 40GB, H100 80GB).
- Cabe en GPU consumer: sí, desde Q2_K hasta Q5_K_M en GPUs de 24 GB; Q6_K al límite con contexto corto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos runtimes convendría usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Thinking (este) | 32,8B | no disponible | Apache 2.0 | GGUF (base safetensors) | Afinado médico con CoT, 7 idiomas |
| Modelos médicos 32B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas concretas en la documentación proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas específicas de la misma categoría (modelos médicos de ~32B con CoT). Se recomienda consultar el repositorio del modelo base `Saathimed/AxonMed-32B-Thinking` para referencias comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datasets clínicos en inglés (MedQA, PubMedQA), es probable un sesgo hacia prácticas médicas occidentales y terminología anglosajona.
- Riesgo de alucinación: elevado en dominio médico, como en cualquier LLM; las trazas de razonamiento CoT no garantizan corrección factual y pueden producir justificaciones plausibles pero erróneas.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada; el soporte multilingüe está declarado pero no evaluado, por lo que el rendimiento en español, hindi o ruso puede ser inferior al del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no exime del cumplimiento de regulaciones sanitarias (MDR en la UE, HIPAA en EE.UU.) si se usa en contextos clínicos reales.
- Caveat para producción: el modelo no está validado clínicamente; cualquier uso en decisiones diagnósticas o terapéuticas requiere supervisión de profesionales sanitarios titulados y auditoría de outputs.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de razonamiento, especialmente en tareas CoT largas; para uso médico se recomienda Q5_K_M o superior.
- El repositorio ocupa 224 GB; descargar solo el archivo GGUF deseado, no clonar el repo completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-32B-Thinking-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Thinking
- Cuantizaciones i1/imatrix: https://huggingface.co/mradermacher/AxonMed-32B-Thinking-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#AxonMed-32B-Thinking-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA (referencia habitual; enlace exacto no confirmado en la información)
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset medical_meadow_usmle_self_assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
