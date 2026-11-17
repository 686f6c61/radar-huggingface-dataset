# mradermacher/AxonMed-7B-Thinking-GGUF

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje especializado en razonamiento clínico y médico, desarrollado por Saathimed y cuantizado a formato GGUF por mradermacher. Se construye sobre un transformer denso de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está diseñado para generar cadenas de razonamiento (chain-of-thought) antes de responder preguntas médicas, lo que lo orienta a tareas de diagnóstico diferencial, interpretación de casos clínicos y preparación de exámenes sanitarios como USMLE, AIIMS o NEET-PG.

El modelo se ha afinado sobre un conjunto de datasets médicos de referencia: MedMCQA, MedQA-USMLE-4-options, PubMedQA, el conjunto de razonamiento médico de FreedomIntelligence y Medical Meadow USMLE Self-Assessment. Esta combinación cubre preguntas de opción múltiple, razonamiento sobre literatura biomédica y evaluación tipo examen, lo que explica su orientación explícita a "thinking" y "cot" (chain-of-thought). Soporta siete idiomas declarados: inglés, hindi, español, chino, alemán, francés y ruso.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, y en la disponibilidad de cuantizaciones GGUF que lo hacen desplegable en hardware de consumo. No obstante, la información pública disponible es muy limitada: no se han publicado resultados de benchmarks, detalles de entrenamiento ni especificaciones de longitud de contexto en la documentación accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta; derivado de la familia base de Saathimed/AxonMed-7B-Thinking) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | en, hi, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer denso de aproximadamente 7,6 mil millones de parámetros, derivado del modelo Saathimed/AxonMed-7B-Thinking. El autor de la cuantización (mradermacher) no documenta la arquitectura original, y la model card del modelo base no está incluida en la información proporcionada. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni la implementación concreta (si es Llama, Mistral, Qwen u otra familia).

Respecto al entrenamiento, los datasets declarados son MedMCQA, GBaker/MedQA-USMLE-4-options, pubmed_qa, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. No se indica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. La presencia de la etiqueta "thinking" y "cot" sugiere un ajuste orientado a generar razonamiento explícito antes de la respuesta, pero no se documenta el método. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento clínico con cadenas de pensamiento explícitas (chain-of-thought) antes de la respuesta final.
- Resolución de preguntas de opción múltiple de tipo examen médico (USMLE, AIIMS, NEET-PG) según los datasets de entrenamiento.
- Razonamiento sobre literatura biomédica y preguntas de comprensión tipo PubMedQA.
- Soporte multilingüe declarado en siete idiomas: inglés, hindi, español, chino, alemán, francés y ruso.
- Formato conversacional (etiqueta "conversational" en los tags de Hugging Face).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Preparación de exámenes médicos: el modelo puede generar explicaciones razonadas para preguntas de opción múltiple tipo USMLE, AIIMS o NEET-PG, justificando cada opción descartada, gracias al ajuste sobre MedQA-USMLE-4-options y Medical Meadow USMLE.
- Formación clínica y simulación de casos: útil para que estudiantes de medicina practiquen diagnósticos diferenciales con un modelo que explicita su razonamiento paso a paso, lo que facilita la revisión crítica del proceso y no solo del resultado.
- Búsqueda asistida sobre literatura biomédica: con el ajuste sobre PubMedQA, puede emplearse para sintetizar respuestas a preguntas de investigación a partir de resúmenes o pasajes científicos, siempre con verificación humana.
- Documentación clínica asistida: generación de resúmenes estructurados de notas o informes médicos en entornos donde se requiera una licencia permisiva (Apache 2.0) y despliegue local por motivos de privacidad.
- Despliegue en infraestructura propia con GGUF: al ofrecerse cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB), puede ejecutarse en estaciones de trabajo o servidores sin GPU de gama alta mediante llama.cpp u Ollama, lo que encaja en escenarios con requisitos de soberanía de datos ("sovereign-ai" en los tags).
- Educación multilingüe: para materiales de formación sanitaria en español, hindi, chino, alemán, francés o ruso, aprovechando la cobertura idiomática declarada, con la cautela de que el entrenamiento principal parece centrado en inglés.
- Integración en pipelines de investigación reproducibles: al ser Apache 2.0 y estar disponible en GGUF, puede incorporarse a flujos de evaluación automatizada de razonamiento médico sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q4_K_S ~4,6 GB; f16 ~15,3 GB (tamaños de archivo indicados por el autor de la cuantización; la VRAM necesaria es algo superior por el contexto y los buffers de la KV cache).
- GPU recomendadas: para f16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L4 con margen limitado); para Q4_K_S o Q5_K_M, GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); para Q2_K, GPUs de 6-8 GB.
- Cabe en GPU de consumo: sí, en la mayoría de configuraciones con cuantizaciones Q2_K a Q5_K_M; f16 requiere gama alta o dos GPUs.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y con endpoints (según tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Thinking (este) | 7,6 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en razonamiento médico con CoT |
| Alternativas médicas de ~7B (p. ej. Meditron, BioMistral) | ~7 B | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |
| Modelos generalistas de ~7B (p. ej. Llama, Mistral, Qwen) | ~7 B | no disponible | variable | variable | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un dispositivo médico: no se ha validado clínicamente ni cuenta con certificación regulatoria; no debe usarse para diagnóstico o tratamiento sin supervisión profesional.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar afirmaciones médicas plausibles pero incorrectas, especialmente en casos raros o fuera de la distribución de los datasets de entrenamiento.
- Sesgos conocidos: no documentados; los datasets médicos de origen (MedMCQA, MedQA, PubMedQA) tienen sesgos de idioma (predominio del inglés) y de población (exámenes de EE. UU. e India), lo que puede limitar su generalización a otras regiones.
- Cobertura multilingüe desigual: aunque declara siete idiomas, el entrenamiento parece centrado en inglés; el rendimiento en español, hindi, chino, alemán, francés y ruso no está verificado.
- Longitud de contexto no documentada: no se puede garantizar el manejo de historiales clínicos largos o documentos extensos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, lo que dificulta la selección para producción.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento; para uso clínico se recomienda Q5_K_M o superior.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario asume toda la responsabilidad regulatoria (por ejemplo, RGPD o MDR en la UE) al desplegar el modelo en contextos sanitarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonMed-7B-Thinking-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Página de descargas del autor: https://hf.tst.eu/model#AxonMed-7B-Thinking-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset MedMCQA: https://huggingface.co/datasets/medmcqa
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset Medical Meadow USMLE Self-Assessment: https://huggingface.co/datasets/medalpaca/medical_meadow_usmle_self_assessment
