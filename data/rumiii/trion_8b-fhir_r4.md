# Rumiii/Trion_8B-FHIR_R4

## Resumen

Trion_8B-FHIR_R4 es un modelo de lenguaje especializado en tool-calling clínico sobre APIs FHIR R4, desarrollado por Rumiii a partir de un fine-tuning de Llama-3.1-8B-Instruct. El modelo está diseñado para recibir instrucciones clínicas en inglés y generar secuencias estructuradas de llamadas a funciones (búsqueda de pacientes, consulta de laboratorios, registro de constantes vitales, órdenes de medicación y derivaciones) que terminan con una respuesta estructurada final. Su objetivo es servir como base para agentes de IA que interactúen con sistemas de historia clínica electrónica (EHR) basados en FHIR.

La relevancia del modelo radica en que convierte un dataset plano de acciones de texto (GET/POST/FINISH) en el formato nativo de tool-calling JSON de Llama 3.1, lo que lo hace compatible con pipelines estándar de transformers y chat templates. Con 8.030 millones de parámetros y una ventana de contexto de 3072 tokens, es un modelo compacto que puede ejecutarse en hardware de consumo, aunque su alcance está limitado a un esquema fijo de seis funciones y a un dataset de entrenamiento muy reducido (284 ejemplos). Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 3072 tokens |
| Tipos de cuantizacion | fp16 (release), entrenado en 4-bit (QLoRA) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct (arquitectura transformer decoder-only con atención multi-cabeza y RoPE). Se realizó un fine-tuning con QLoRA en 4 bits sobre la versión cuantizada `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, con rango LoRA de 16 y alpha de 32, aplicado a las proyecciones q, k, v, o, gate, up y down. Los parámetros entrenables fueron 41.943.040 (~0,52 % del total). El entrenamiento se ejecutó en una única GPU Kaggle T4 (16 GB) con el framework Unsloth + TRL/Transformers.

El dataset de entrenamiento, `Nadhari/MedToolCalling`, contiene 284 ejemplos de 10 tipos de tareas clínicas. El pipeline de preparación incluyó tres transformaciones clave: eliminación del bloque de documentación FHIR del system prompt (de ~2000 tokens a un mensaje compacto), compresión quirúrgica de las respuestas JSON de FHIR (de ~3000 tokens a ~50 tokens conservando solo campos clínicos relevantes) y conversión de las acciones crudas `GET`/`POST`/`FINISH` al formato de `tool_calls` de Llama 3.1 con `name` y `arguments` estructurados. Además se aplicó loss masking solo sobre las respuestas del asistente y se logró cero truncamiento en todas las secuencias.

## Capacidades

- Generación de texto instructivo en inglés con formato de chat nativo de Llama 3.1.
- Tool-calling estructurado con seis funciones fijas: `search_patient`, `get_observation`, `record_vital_sign`, `order_medication`, `order_service_request` y `finish`.
- Razonamiento multi-turno para encadenar llamadas a funciones en flujos clínicos (búsqueda de paciente → consulta de laboratorio → orden de medicación).
- Compresión de respuestas FHIR: el modelo está entrenado para procesar respuestas de herramientas condensadas (por ejemplo, `Pat:123 John Doe 1980-01-01`, `Obs:Magnesium=1.2 mg/dL`).
- Finalización de tareas con una respuesta estructurada final tras la llamada `finish`.
- No soporta vision, audio ni otros modos multimodales.

## Casos de uso

- Prototipado de agentes clínicos para EHR: el modelo puede encadenar búsqueda de paciente por nombre y fecha de nacimiento, consultar observaciones de laboratorio (magnesio, potasio, HbA1c) y registrar constantes vitales, todo mediante tool-calling sobre APIs FHIR R4.
- Automatización de consultas de laboratorio: dado un identificador de paciente y un código LOINC, el modelo genera la llamada `get_observation` adecuada y procesa la respuesta comprimida para extraer el valor clínico.
- Ordenación de medicación en entornos de investigación: el modelo puede emitir una `order_medication` para reposición de potasio o magnesio intravenoso, siguiendo el esquema de `MedicationRequest` de FHIR.
- Derivación y solicitud de servicios: mediante `order_service_request`, el modelo puede generar peticiones de derivación o pruebas complementarias (por ejemplo, laboratorios de seguimiento) dentro de un flujo conversacional.
- Asistente educativo para desarrolladores de FHIR: sirve como referencia práctica de cómo adaptar un dataset plano de tool-calling a un modelo instructivo con formato nativo de chat y funciones.
- Investigación en NLP clínico: permite experimentar con agentes conversacionales que interactúan con sistemas FHIR sin necesidad de implementar lógica de parsing compleja, gracias a la salida estructurada en JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones clínicas específicas. Tampoco se proporcionan comparativas cuantitativas con otros modelos de tool-calling médico.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB (modelo de 8B parámetros más overhead de atención y cache KV).
- GPU recomendadas: T4 (16 GB), RTX 4080/4090, A100 (cualquier GPU con 16 GB o más). En cuantización 4-bit (GGUF) podría ejecutarse en GPUs de 8 GB, aunque no se proporcionan pesos cuantizados oficiales.
- Cabe en GPUs de consumo de gama alta (RTX 4080/4090, 16-24 GB) y en GPUs de centro de datos como T4 o A100.
- Opciones de despliegue: transformers (carga directa con `AutoModelForCausalLM`), compatible con text-generation-inference y endpoints compatibles con transformers. No se menciona soporte explícito para vLLM, Ollama o llama.cpp en la documentación, aunque al ser un modelo estándar de Llama 3.1 es probable que funcione con estas herramientas si se convierte a GGUF.
- Latencia y throughput: no disponible. Al ser un modelo de 8B en fp16, se estima una latencia de varios cientos de milisegundos por token en GPU de 16 GB, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas por el autor. Como referencia, el modelo base Llama-3.1-8B-Instruct tiene 8B parámetros, contexto de 128K tokens (frente a los 3072 de este fine-tune) y licencia Llama 3.1 Community License. Otros fine-tunes médicos de 8B (por ejemplo, modelos basados en Llama-3-8B o Qwen-2.5-7B) suelen ofrecer benchmarks de razonamiento clínico, pero no hay datos comparables para este modelo concreto. Se recomienda evaluar el modelo en el dominio objetivo antes de usarlo en producción.

## Limitaciones y advertencias

- No validado para uso clínico real: el modelo no ha sido evaluado en seguridad, precisión ni fiabilidad para la atención a pacientes, y no debe usarse para tomar ni apoyar decisiones clínicas reales.
- Entrenamiento muy limitado: solo 284 ejemplos de 10 tipos de tareas, lo que reduce la cobertura de casos límite, instrucciones ambiguas y recursos FHIR fuera del esquema.
- Esquema de herramientas fijo: el modelo no generaliza a definiciones de funciones arbitrarias o no vistas; solo maneja las seis funciones entrenadas.
- Dependencia de compresión de respuestas: el modelo fue entrenado con respuestas FHIR comprimidas; si en inferencia se le proporcionan payloads FHIR completos sin comprimir, puede comportarse de forma poco robusta.
- Ventana de contexto reducida (3072 tokens): limita la cantidad de historial conversacional y respuestas de herramientas que se pueden incluir en una sola pasada.
- Idioma restringido al inglés; no soporta otros idiomas.
- Riesgo de alucinación en valores clínicos, especialmente en escenarios fuera del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación clínica implica responsabilidad legal del usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rumiii/Trion_8B-FHIR_R4
- Dataset de entrenamiento: https://huggingface.co/datasets/Nadhari/MedToolCalling
- Especificación FHIR R4: https://www.hl7.org/fhir/R4/
- Repositorio oficial de FHIR (HL7): https://github.com/HL7/fhir
- Implementación Python de FHIR R4: https://github.com/fhir-fli/fhir_r4
