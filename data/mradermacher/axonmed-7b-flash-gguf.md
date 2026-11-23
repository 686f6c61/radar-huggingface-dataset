# mradermacher/AxonMed-7B-Flash-GGUF

## Resumen

AxonMed-7B-Flash es un modelo de lenguaje especializado en dominio médico y razonamiento clínico, desarrollado originalmente por el usuario Saathimed bajo el identificador `Saathimed/AxonMed-7B-Flash`. La versión aquí descrita es una cuantización estática en formato GGUF producida por mradermacher, un conocido publicador de cuantizaciones de la comunidad. El modelo parte de una arquitectura transformer densa de aproximadamente 7.615 millones de parámetros (7,6B), lo que lo sitúa en la categoría de modelos de tamaño medio optimizados para despliegue en hardware asequible.

El modelo está afinado para tareas de razonamiento clínico, respuesta a preguntas médicas, procesamiento de literatura biomédica y trabajo con historiales clínicos electrónicos. Su entrenamiento declara el uso de conjuntos de datos como MedQA-USMLE-4-options, PubMedQA y medical-o1-reasoning-SFT, lo que orienta sus capacidades hacia el ámbito sanitario y la evaluación tipo USMLE. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos.

La relevancia de esta ficha radica en que la cuantización GGUF permite ejecutar un modelo médico de 7,6B en GPUs de consumo e incluso en CPU, con opciones desde 3,1 GB (Q2_K) hasta 15,3 GB (f16). Esto lo convierte en un candidato práctico para prototipos de asistencia clínica, sistemas de soporte a la decisión y pipelines de procesamiento de documentación médica en entornos con recursos limitados. La longitud de contexto, los detalles de entrenamiento y los benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer denso de 7,6B parámetros, pero no detalla la arquitectura interna (número de capas, dimensiones ocultas, tipo de atención, uso de RoPE, etc.). El modelo base `Saathimed/AxonMed-7B-Flash` es el resultado de un ajuste fino orientado a dominio médico, presumiblemente sobre un modelo fundacional de tamaño similar, aunque el modelo de partida no se especifica en la información proporcionada.

En cuanto a los datos de entrenamiento, la model card declara el uso de tres conjuntos: GBaker/MedQA-USMLE-4-options (preguntas de estilo examen médico USMLE con cuatro opciones), pubmed_qa (preguntas y respuestas sobre literatura biomédica) y FreedomIntelligence/medical-o1-reasoning-SFT (datos de ajuste supervisado orientados al razonamiento médico estilo cadena de pensamiento). No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en dominio médico y sanitario, con orientación a terminología clínica.
- Razonamiento clínico y respuesta a preguntas de tipo examen médico (USMLE).
- Comprensión y síntesis de literatura biomédica (PubMedQA).
- Razonamiento multi-paso orientado a diagnóstico y justificación clínica (según el dataset medical-o1-reasoning-SFT).
- Soporte multilingüe declarado en siete idiomas: inglés, español, chino, ruso, francés, alemán e hindi.
- Formato conversacional (etiqueta `conversational`), apto para diálogo multi-turno.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructuras de inferencia tipo API.
- No se documenta soporte explícito de tool calling, function calling, visión, audio ni modo thinking formal.

## Casos de uso

- Soporte a la decisión clínica en prototipos: el modelo puede responder consultas médicas estructuradas y razonar sobre casos clínicos, sirviendo como base para herramientas de ayuda a profesionales sanitarios en entornos controlados.
- Preparación de exámenes médicos (USMLE): gracias a su ajuste sobre MedQA-USMLE-4-options, puede usarse como tutor que explica la justificación de respuestas en preguntas de opción múltiple.
- Resumen y consulta de literatura biomédica: su entrenamiento con PubMedQA permite construir asistentes que respondan preguntas sobre artículos científicos y extraigan conclusiones de abstracts.
- Procesamiento de historiales clínicos electrónicos: con formato conversacional y soporte multilingüe, puede emplearse para estructurar y resumir notas clínicas en inglés o español, aunque requiere validación humana por las limitaciones de contexto.
- Asistencia sanitaria multilingüe: al cubrir siete idiomas, es adecuado para prototipos de atención a pacientes en contextos con diversidad lingüística, con revisión profesional obligatoria.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten ejecutar el modelo en GPUs de consumo para demos, investigación y pruebas de concepto sin infraestructura dedicada.
- Generación de documentación médica asistida: puede redactar borradores de informes o explicaciones para pacientes a partir de datos estructurados, siempre con supervisión clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB (más overhead de contexto y KV cache).
- GPU recomendadas: para f16 o Q8_0, una RTX 4090 (24 GB) o A100/H100 sobran; para Q4_K_M y Q5_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes; para Q2_K/Q3_K, GPUs de 6-8 GB como RTX 3050 o GTX 1660.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 12 GB o más; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; los pesos originales (safetensors) pueden servirse con vLLM o TGI, aunque esta ficha cubre la versión GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Flash (esta ficha) | 7,6B | No disponible | Apache 2.0 | GGUF / safetensors | Especializado en dominio médico, 7 idiomas |
| Modelos médicos de 7B de la comunidad (p. ej. variantes Meditron/MedLLaMA) | ~7B | Variable | Variable (a menudo restrictiva) | safetensors / GGUF | No se dispone de datos concretos verificados en la información proporcionada |
| Modelos generalistas de 7-8B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | 7-8B | 128K en algunos casos | Licencias permisivas | safetensors / GGUF | No especializados en medicina; comparación de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas; la comparativa anterior es orientativa y se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo no está validado clínicamente y no debe usarse para diagnóstico o tratamiento sin supervisión profesional.
- Riesgo de alucinación: como todo LLM, puede generar información médica incorrecta o inventada, especialmente en dosis, interacciones farmacológicas o protocolos.
- Sesgos conocidos: no documentados en la información disponible; los sesgos de los datasets médicos (p. ej. sobrerrepresentación de poblaciones o terminología anglosajona) pueden propagarse.
- Limitación de contexto: la longitud de contexto no está documentada, lo que dificulta planificar su uso con historiales clínicos extensos.
- Cobertura idiomática desigual: aunque declara siete idiomas, el entrenamiento parece centrado en inglés (MedQA-USMLE, PubMedQA), por lo que el rendimiento en español, hindi o ruso puede ser inferior.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y regulatoria (RGPD, MDR en la UE) si lo integra en productos sanitarios.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para uso médico se recomienda Q5_K_M o superior.
- No se documenta soporte de tool calling ni de modo thinking estructurado, lo que limita su uso en pipelines agénticos complejos.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/AxonMed-7B-Flash-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/AxonMed-7B-Flash-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#AxonMed-7B-Flash-GGUF
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
