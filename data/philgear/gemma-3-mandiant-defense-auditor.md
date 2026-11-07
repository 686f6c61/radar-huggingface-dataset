# philgear/gemma-3-mandiant-defense-auditor

## Resumen

El modelo `philgear/gemma-3-mandiant-defense-auditor` es un adaptador LoRA (PEFT) construido sobre el modelo base `google/gemma-3-4b-it`, desarrollado por Phillip Gear bajo la organizacion PocketGull LLC. Su proposito declarado es auditar autorizaciones de doble custodia (dual-custody) y sanear vectores de inyeccion de prompts en registros medicos externos, enmarcado en el ambito de la ciberseguridad sanitaria y la lucha contra el "whaling" (fraude dirigido a altos cargos). El adaptador se ha afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos que, segun el autor, cumplen el estandar de desidentificacion HIPAA §164.514 Safe Harbor.

Se trata de un adaptador especializado y de nicho, no de un modelo fundacional nuevo: hereda la arquitectura, el tamano (4B parametros) y la ventana de contexto de Gemma 3 4B-IT, y anade un comportamiento orientado a tareas de auditoria de seguridad clinica. La relevancia actual radica en la creciente superficie de ataque de los sistemas de IA en entornos sanitarios (inyeccion indirecta de prompts, exfiltracion masiva de datos) y en la demanda de herramientas que operen en el borde (edge) sin retener informacion de salud protegida (PHI).

No obstante, la informacion publica disponible es muy limitada: cero descargas y cero "likes" en el momento de la consulta, sin resultados de benchmarks publicados y sin documentacion tecnica detallada mas alla de la model card. Esto debe tenerse en cuenta a la hora de evaluar su madurez para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Gemma 3 4B-IT) |
| Parametros totales | 4B (modelo base); parametros del adaptador: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B-IT) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | adaptador PEFT (safetensors, segun convencion de la libreria `peft`); pesos del base en safetensors |

## Arquitectura y entrenamiento

El adaptador se apoya en `google/gemma-3-4b-it`, un transformer decoder-only de 4.000 millones de parametros con capacidades de instruccion. Sobre el se aplica un ajuste fino de bajo rango (LoRA) mediante la libreria PEFT, lo que permite cargar el adaptador de forma separada y combinarlo con el modelo base en tiempo de inferencia con `PeftModel.from_pretrained`. El metodo de alineacion declarado es Direct Preference Optimization (DPO), orientado a modelar preferencias sobre respuestas de auditoria y saneamiento de seguridad.

Segun la model card, los datos de entrenamiento son conjuntos clinicos especificos que cumplen HIPAA §164.514 Safe Harbor para desidentificacion. No se especifica el numero de tokens, la composicion exacta del dataset, el rango de LoRA, la tasa de aprendizaje ni otros hiperparametros. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del propio esquema de adaptador. El prompt de ejemplo sugiere que el modelo ha sido expuesto a tareas de evaluacion de autorizacion M-de-N y a saneamiento de payloads FHIR `DocumentReference` frente a inyeccion indirecta de prompts.

## Capacidades

- Generacion de texto en ingles orientada a tareas de auditoria de seguridad clinica.
- Evaluacion de autorizaciones de doble custodia (esquemas M-de-N) en flujos de acceso a registros medicos.
- Deteccion y saneamiento de vectores de inyeccion indirecta de prompts en documentos externos (por ejemplo, payloads FHIR `DocumentReference`).
- Identificacion de patrones de "whaling" y exportacion masiva de datos.
- Operacion en modo local/edge con el objetivo declarado de retencion cero de PHI.
- Soporte de instrucciones conversacionales (heredado del base `-it`).
- Capacidades multilingues: limitadas al ingles segun la metadata (`language: en`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Auditoria de autorizacion de acceso a historiales: el modelo evaluaria si una solicitud de acceso cumple un esquema M-de-N de doble custodia antes de liberar un registro, actuando como capa de verificacion previa a la entrega de datos.
- Saneamiento de documentos clinicos externos: procesaria payloads FHIR `DocumentReference` recibidos de terceros para detectar y neutralizar instrucciones maliciosas embebidas (inyeccion indirecta de prompts) antes de que lleguen a un LLM principal.
- Defensa frente a exfiltracion masiva: analizaria patrones de consulta anomala para senalar intentos de exportacion masiva de datos (whaling) en sistemas de historia clinica electronica.
- Preprocesamiento seguro en pipelines RAG sanitarios: se usaria como filtro de entrada que desinfecta documentos antes de indexarlos o pasarlos a un modelo mayor, reduciendo el riesgo de envenenamiento del contexto.
- Cumplimiento HIPAA en despliegues de borde: al disenarse para computo local y Vertex AI privado, encajaria en arquitecturas donde la PHI no puede salir del perimetro del centro sanitario.
- Formacion y simulacion de red team clinico: permitiria generar escenarios de ataque y respuestas de defensa para entrenar a equipos de seguridad en entornos sanitarios.
- Herramienta de apoyo a la decision (CDS no dispositivo, FDA 520(o)): asistiria a personal sanitario con evidencia documentada, siempre bajo supervision de un profesional licenciado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bfloat16 requiere aproximadamente 8 GB de VRAM (mas overhead de activaciones y cache KV); en cuantizacion de 4 bits podria situarse en torno a 3-4 GB, aunque el autor no documenta cuantizaciones soportadas.
- GPU recomendadas: A100, H100 o L4 para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para estaciones de trabajo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16, y potencialmente en GPUs de 6 GB con cuantizacion (no confirmado por el autor).
- Opciones de despliegue: el ejemplo oficial usa `transformers` + `peft` con `device_map="auto"`. No se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA sobre un modelo de la familia Gemma, seria tecnicamente posible combinarlo y convertirlo, pero no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-mandiant-defense-auditor | 4B (base) + LoRA | no disponible | Auditoria de seguridad clinica (adaptador) | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | 4B | no disponible en la informacion | Modelo instructivo generalista | Gemma Terms of Use | Ampliamente disponible |
| Alternativas especializadas en seguridad clinica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos directamente equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Informacion publica muy escasa: cero descargas y cero "likes", sin benchmarks ni evaluaciones independientes; madurez para produccion no demostrada.
- Riesgo de alucinacion inherente a un modelo de 4B afinado con DPO; las decisiones de autorizacion o saneamiento no deberian automatizarse sin verificacion humana.
- Sesgos potenciales derivados de los datos clinicos de entrenamiento (no documentados) y del propio modelo base Gemma 3.
- Idioma limitado al ingles; no apto para uso clinico en castellano sin evaluacion adicional.
- La afirmacion de cumplimiento HIPAA §164.514 Safe Harbor corresponde al autor y no esta auditada de forma independiente en la informacion disponible.
- El caracter de "no dispositivo CDS" (FDA 520(o)) es una declaracion del autor; su uso clinico real exige validacion regulatoria local.
- Licencia apache-2.0 en el adaptador, pero el uso del modelo base esta sujeto adicionalmente a los terminos de Gemma de Google, que deben revisarse para uso comercial.
- No se documentan cuantizaciones, contexto maximo efectivo ni soporte de tool calling, lo que limita su integracion en pipelines de agentes complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-mandiant-defense-auditor
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Organizacion: https://pocketgull.com
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Informe Mandiant AI Risk and Resilience 2026: https://cloud.google.com/security/resources/ai-risk-and-resilience-2026
- Informe Mandiant AI Risk and Resilience 2025: https://cloud.google.com/security/resources/ai-risk-and-resilience
