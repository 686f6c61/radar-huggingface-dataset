# mamahealth/mama-deid-2

## Resumen

mama-deid-2 es un modelo encoder multilingüe de 354.571.178 parámetros (etiquetado como 350M) especializado en desidentificación de texto clínico. Lo desarrolla mama health, una plataforma de apoyo a personas con enfermedades crónicas, y está afinado a partir de LiquidAI/LFM2.5-Encoder-350M-PII-Detector. Su tarea es token-classification: detectar y etiquetar entidades personales (PII) en textos médicos para poder enmascararlas, preservando al mismo tiempo el contexto clínico que hace útil el texto para investigación o asistencia.

El problema que resuelve es concreto: los detectores de PII genéricos tratan un diagnóstico o un fármaco como dato personal y los eliminan, lo que deja el texto médico inservible. mama-deid-2 aplica la política inversa —"la persona se va, el medicamento se queda"—: enmascara nombres, contactos, direcciones, códigos postales, identificadores, fechas de nacimiento, fechas de eventos personales, localidades de residencia, empleadores, URL y atributos protegidos (nacionalidad, religión, etc.), mientras conserva y etiqueta estados clínicos, intervenciones, instituciones sanitarias, localidades de atención, fechas clínicas, duraciones y edad.

Es relevante ahora porque cubre 22 idiomas y sus alfabetos, procesa mensajes de chat, respuestas cortas, documentos subidos (cartas, informes, recetas, OCR) y notas de voz transcritas, y está diseñado para ejecutarse en la CPU de un portátil, de modo que el texto del paciente no abandona la infraestructura de la organización. La versión 2 amplía el etiquetado de 18 a 21 etiquetas y mejora la robustez ante texto informal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (LFM2.5-Encoder, base LiquidAI/LFM2.5-Encoder-350M-PII-Detector) |
| Parametros totales | 354.571.178 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, it, fr, es, nl, pt, pl, tr, el, ru, uk, ar, he, fa, hi, id, vi, th, zh, ja, ko (22 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia LFM2.5, afinado desde el detector de PII LiquidAI/LFM2.5-Encoder-350M-PII-Detector. La cabeza de salida es de clasificación de tokens (token-classification) sobre 21 etiquetas organizadas en dos grupos: las que se enmascaran (PERSON, CLINICIAN, STREET, POSTCODE, LANDMARK, CONTACT, ID, DOB, EVENT_DATE, RESIDENCE_LOCALITY, ORG, URL, NRP) y las que se conservan etiquetadas (CLINICAL_STATE, CLINICAL_INTERVENTION, CARE_INSTITUTION, CARE_LOCALITY, CLINICAL_DATE, CLINICAL_DURATION, AGE, RESIDENCE_COUNTRY).

El entrenamiento parte del dataset nvidia/Nemotron-PII y se complementa con texto humano público reetiquetado según esta política: casos clínicos en español y alemán, sentencias judiciales alemanas, corpus de entidades nombradas en polaco, turco, neerlandés y alemán, y resoluciones de seguridad social neerlandesas. La aumentación incluye texto casual, de negocios y muy corto, así como texto en minúsculas o sin puntuación, imitando el registro de chat. La model card no detalla el número de tokens de entrenamiento ni si hubo RLHF o DPO.

Una innovación destacable es que la decisión de qué se enmascara se pospone al post-procesado: `predict` devuelve todos los spans con su etiqueta (incluidos los conservados) y `masked_text` decide qué enmascarar, de modo que un despliegue puede enmascarar más sin reentrenar. Además se publica un sesgo de máscara (`mask_bias(path, "tuned")`) que suma 1.5 a cada etiqueta enmascarada, priorizando reducir fugas a costa de sobremascarar algunas palabras.

## Capacidades

- Detección y etiquetado de PII en texto clínico con 21 etiquetas, distinguiendo entre datos personales (se enmascaran) y datos clínicos (se conservan).
- Enmascaramiento configurable en post-procesado: `masked_text(..., address=True)` agrupa STREET, POSTCODE y LANDMARK como `[ADDRESS]`; modo `highlight=True` para resaltar spans clínicos.
- Procesamiento de texto informal: chat de pacientes, respuestas cortas, texto en minúsculas y sin puntuación.
- Procesamiento de documentos: cartas, informes, recetas y salida de OCR.
- Procesamiento de notas de voz transcritas y publicaciones largas.
- Capacidad multilingüe en 22 idiomas y sus alfabetos (incluye árabe, hebreo, persa, chino, japonés, coreano, cirílico y griego).
- Manejo de casos límite documentados: consultas nombradas por su médico, clínicos que son familiares, localidades turísticas frente a localidades de tratamiento, fechas de boda frente a fechas de cirugía, prefijos unidos en árabe y hebreo, honoríficos japoneses.
- No se menciona soporte de tool calling, function calling, agentes ni multi-step reasoning; es un modelo de clasificación de tokens, no generativo.

## Casos de uso

- Desidentificación de historiales clínicos para investigación: el modelo enmascara nombres, contactos e identificadores de notas y cartas médicas mientras conserva diagnósticos, fármacos y dosis, de modo que el corpus resultante sigue siendo analizable estadísticamente.
- Cumplimiento normativo en plataformas de salud digital: integrado en el pipeline de ingesta de una app de seguimiento de síntomas, filtra el texto del paciente antes de persistirlo o enviarlo a servicios externos, con el texto sin salir de la infraestructura propia al ejecutarse en CPU.
- Preparación de datasets para entrenamiento de modelos clínicos: elimina PII de conversaciones y documentos antes de usar el corpus como datos de entrenamiento, manteniendo las entidades clínicas que aportan señal.
- Anonimización de notas de voz transcritas: en aplicaciones de diario de síntomas por voz, el modelo procesa la transcripción y enmascara nombres de familiares, direcciones y teléfonos mencionados de forma espontánea.
- Procesamiento de documentos subidos por el usuario: en la ingesta de informes, recetas y cartas (incluida salida de OCR), el modelo separa los datos del paciente de los datos clínicos para su visualización o extracción posterior.
- Enmascaramiento selectivo para cohortes pequeñas: al ser el enmascaramiento una decisión de post-procesado, un despliegue puede enmascarar también la localidad de atención (CARE_LOCALITY) sin reentrenar, reduciendo el riesgo de reidentificación en cohortes reducidas.
- Moderación y revisión de contenido en comunidades de pacientes: detección de PII en publicaciones de foros para avisar al usuario antes de publicar datos personales.

## Benchmarks y rendimiento

La model card describe una evaluación en la que los spans de identificador son la unidad: un identificador cuenta como oculto solo cuando todos sus caracteres están enmascarados. El texto de evaluación fue escrito por dos modelos (Claude Opus y un modelo GPT) que no aportaron datos de entrenamiento, a partir de sus propios prompts. La información proporcionada se interrumpe antes de mostrar las cifras concretas.

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 354,6 M de parámetros, en fp32 ocuparía aproximadamente 1,4 GB de pesos, y en fp16/bf16 alrededor de 0,7 GB, a lo que hay que sumar el estado del optimizador y activaciones (cifras estimadas a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: no disponible; el autor indica que el modelo se ejecuta en CPU de portátil, por lo que no requiere GPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB en fp16), aunque el autor no publica requisitos específicos.
- Opciones de despliegue: transformers con `custom_code` (la model card usa `snapshot_download` y funciones propias `load`, `predict`, `masked_text`, `mask_bias`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la model card declara `inference: false`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| mama-deid-2 | 354,6 M | no disponible | 22 | lfm1.0 | 21 etiquetas, política clínica, post-procesado configurable |
| mama-deid (v11) | no disponible | no disponible | no disponible | no disponible | Versión previa con 18 etiquetas; ADDRESS sin dividir y sin EVENT_DATE |
| LiquidAI/LFM2.5-Encoder-350M-PII-Detector | ~350 M | no disponible | no disponible | no disponible | Modelo base; detector de PII genérico, sin la política clínica de conservar datos médicos |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de fuga de PII: la propia model card reconoce que el sesgo "tuned" (1.5) intercambia algo de sobremascarado por menos fugas, lo que implica que persiste un riesgo residual de identificadores no enmascarados por completo.
- Riesgo de sobremascarado: con el sesgo alto se enmascaran algunas palabras que no son PII, lo que puede degradar el texto para su uso posterior.
- Dependencia del post-procesado: qué se enmascara no lo decide el modelo sino `masked_text`; una configuración incorrecta puede dejar pasar etiquetas que deberían ocultarse.
- Sesgos: no se documentan en la información disponible; al entrenarse con corpus públicos de varios países (casos clínicos en español y alemán, sentencias alemanas y neerlandesas, corpus de entidades en polaco, turco, neerlandés y alemán), puede heredar los sesgos de esas fuentes.
- Limitaciones de idioma: aunque cubre 22 idiomas, la model card no publica métricas por idioma, por lo que el rendimiento puede variar entre ellos.
- Licencia lfm1.0 (license: other): es necesario revisar los términos de la licencia LFM 1.0 antes de un uso comercial; la información disponible no detalla las restricciones concretas.
- `inference: false` en la model card y dependencia de `custom_code`: requiere cargar el código del repositorio, no basta con la carga estándar de transformers.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso; su única función es la clasificación de tokens.
- El texto de evaluación fue generado por modelos (Claude Opus y un GPT), no por humanos reales, lo que puede no reflejar la distribución real de textos clínicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mamahealth/mama-deid-2
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-PII-Detector
- Versión anterior: https://huggingface.co/mamahealth/mama-deid
- Política de etiquetado (LABELLING.md): https://huggingface.co/mamahealth/mama-deid-2/blob/main/LABELLING.md
- Licencia (LICENSE): https://huggingface.co/mamahealth/mama-deid-2/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Sitio del autor: https://www.mamahealth.com/
- Ficha de referencia en free2aitools: https://free2aitools.com/model/mamahealth/mama-deid
