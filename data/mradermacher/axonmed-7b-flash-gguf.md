# mradermacher/AxonMed-7B-Flash-GGUF

## Resumen

AxonMed-7B-Flash es un modelo de lenguaje especializado en dominio médico y razonamiento clínico, desarrollado por Saathimed y cuantizado a formato GGUF por mradermacher. Se trata de un transformer decoder-only de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), afinado sobre datasets de referencia en el ámbito sanitario como MedQA-USMLE-4-options, PubMedQA y medical-o1-reasoning-SFT. El modelo está pensado para tareas de razonamiento clínico, respuesta a preguntas médicas y procesamiento de documentación sanitaria, incluyendo registros de salud electrónicos.

La relevancia de esta ficha radica en que se distribuye en cuantizaciones GGUF estáticas (Q4_K_S, Q6_K y f16), lo que permite su despliegue en hardware de consumo sin necesidad de GPUs de datacenter. El modelo base es Saathimed/AxonMed-7B-Flash y esta versión es únicamente una conversión de pesos, no un reentrenamiento. La licencia Apache 2.0 facilita su uso comercial, si bien las limitaciones propias del dominio médico exigen cautela en producción.

El modelo declara soporte para siete idiomas (inglés, español, chino, ruso, francés, alemán e hindi) y está etiquetado con compatibilidad con endpoints, lo que sugiere su uso en servicios conversacionales. No se han publicado resultados de benchmarks en la información disponible, por lo que las afirmaciones de rendimiento clínico deben tratarse con precaución hasta disponer de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla variante específica) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q6_K, Q4_K_S (cuantizaciones estáticas; no hay imatrix disponibles) |
| Idiomas soportados | en, es, zh, ru, fr, de, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer decoder-only de 7,6 mil millones de parámetros, coherente con la familia de modelos de 7B. El modelo base Saathimed/AxonMed-7B-Flash fue afinado sobre tres datasets médicos: GBaker/MedQA-USMLE-4-options (preguntas de examen médico estadounidense con cuatro opciones), PubMedQA (preguntas de investigación biomédica con contexto de abstracts) y FreedomIntelligence/medical-o1-reasoning-SFT (datos de ajuste supervisado orientados a razonamiento clínico). No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una cuantización estática realizada por mradermacher mediante conversión a formato GGUF (convert_type: hf, quantize_version 2, output_tensor_quantised 1). No se han generado cuantizaciones ponderadas ni imatrix, y no se documenta ninguna innovación arquitectónica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en dominio médico y sanitario.
- Razonamiento clínico y respuesta a preguntas de tipo USMLE y PubMedQA.
- Procesamiento de documentación clínica y registros de salud electrónicos (etiqueta electronic-health-records).
- Soporte multilingüe declarado en siete idiomas: inglés, español, chino, ruso, francés, alemán e hindi.
- Formato conversacional (etiqueta conversational) apto para diálogo multi-turno.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Apoyo a la formación médica: el modelo puede generar y explicar preguntas de estilo USMLE con cuatro opciones, útil para plataformas de preparación de exámenes, gracias a su ajuste sobre MedQA-USMLE-4-options.
- Triaje conversacional y orientación sanitaria: puede gestionar diálogos multi-turno con pacientes o personal administrativo para clasificar síntomas o derivar consultas, apoyándose en su formato conversacional.
- Resumen de literatura biomédica: su entrenamiento sobre PubMedQA permite sintetizar abstracts y responder preguntas de investigación con contexto documental.
- Asistencia en documentación clínica: generación y estructuración de notas y resúmenes a partir de registros de salud electrónicos, aprovechando la etiqueta específica del modelo.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (4,6 GB) y Q6_K (6,4 GB) permiten ejecutar el modelo en estaciones de trabajo o GPUs de consumo para prototipos y demos internas.
- Soporte multilingüe en atención sanitaria: atención a pacientes en español, francés, alemán, ruso, chino o hindi dentro de flujos de información médica, aunque la calidad por idioma no está documentada.
- Segunda opinión educativa para profesionales: consulta de razonamiento clínico paso a paso como material de apoyo, nunca como sustituto del criterio médico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB con Q4_K_S, 6,4 GB con Q6_K y 15,3 GB con f16, según los tamaños de archivo publicados (sin contar overhead de contexto y KV cache).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una RTX 3060 de 12 GB o superior puede alojar Q4_K_S y Q6_K; f16 requiere GPUs de 16 GB o más (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: sí, en configuraciones de 8-12 GB con cuantizaciones Q4_K_S o Q6_K.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; vLLM y TGI no se documentan para este formato en la información disponible. La etiqueta endpoints_compatible sugiere despliegue como servicio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Flash (esta ficha) | 7,6 B | No disponible | Apache 2.0 | GGUF, safetensors | Afinado médico, 7 idiomas |
| Modelos médicos de 7B comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría; los datos de rendimiento y contexto de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el modelo no ha sido validado clínicamente y no debe usarse para diagnóstico, prescripción ni decisiones terapéuticas sin supervisión profesional.
- Riesgo de alucinación: como todo LLM, puede generar afirmaciones médicas plausibles pero incorrectas; en dominio sanitario el impacto de un error es alto.
- Sesgos conocidos: no documentados; los datasets de origen (USMLE, PubMedQA) están sesgados hacia el contexto sanitario estadounidense y la literatura en inglés.
- Limitaciones de idioma: aunque declara siete idiomas, no se aportan evaluaciones por idioma; la calidad en español, hindi o ruso puede ser inferior a la del inglés.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos clínicos largos.
- Cuantizaciones: solo hay cuantizaciones estáticas (sin imatrix); Q4_K_S puede degradar el razonamiento clínico frente a Q6_K o f16.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad regulatoria (por ejemplo, normativa de productos sanitarios) recae en el integrador.
- Ausencia de benchmarks: no hay evidencia publicada de rendimiento que respalde las capacidades declaradas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/AxonMed-7B-Flash-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-7B-Flash
- Página de descargas del cuantizador: https://hf.tst.eu/model#AxonMed-7B-Flash-GGUF
- Dataset MedQA-USMLE-4-options: https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset PubMedQA: https://huggingface.co/datasets/pubmed_qa
- Dataset medical-o1-reasoning-SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
