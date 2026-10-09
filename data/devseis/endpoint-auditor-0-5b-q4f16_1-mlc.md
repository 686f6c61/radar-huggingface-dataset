# Devseis/endpoint-auditor-0.5b-q4f16_1-MLC

## Resumen

Devseis Endpoint Auditor 0.5B es un modelo de lenguaje pequeno (SLM) ajustado por Devseis para redactar hallazgos de auditoria de endpoints conforme a ISO 27001, GDPR y el Reglamento europeo de IA (EU AI Act) a partir de evidencias recogidas automaticamente. Se apoya en Qwen2.5-0.5B-Instruct como modelo base (Apache-2.0) mediante un adaptador LoRA de rango 16, y se distribuye ya convertido al formato MLC con cuantizacion q4f16_1 para su ejecucion en el navegador mediante WebLLM. La version publicada es la v0.1, un piloto que valida la cadena de conversion, cuantizacion e inferencia en dispositivo.

El proposito central no es tomar decisiones de cumplimiento, sino explicar en lenguaje natural los veredictos que ya calcula el codigo de la aplicacion: describe cada hallazgo, estima el riesgo, redacta pasos de correccion y verificacion adaptados al sistema operativo (Windows, Linux, macOS), mapea los hallazgos a referencias normativas y clasifica herramientas de IA segun el AI Act. Todas las respuestas se validan contra la evidencia (numeros, identificadores de check, estado, referencias y nombres de herramientas) y, si fallan esa comprobacion, la aplicacion recurre a una plantilla interna.

Su relevancia actual radica en el enfoque de privacidad por diseno: al ejecutarse localmente en el equipo o el telefono, la evidencia de auditoria nunca sale del dispositivo. Con 0.5 mil millones de parametros y un repositorio de 0.3 GB, es un caso practico de despliegue de un modelo de dominio muy especifico en hardware de consumo, sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | ~0.5 mil millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct; el entrenamiento uso secuencias de 2048 tokens) |
| Tipos de cuantizacion | q4f16_1 (4 bits con grupo de cuantizacion y activaciones FP16); layout compatible con los builds oficiales de mlc-ai |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (compilado para MLC-LLM / WebLLM); el adaptador original es LoRA sobre safetensors de Qwen2.5-0.5B-Instruct |

Datos adicionales: tamano del repositorio 0.3 GB; libreria declarada mlc-llm; pipeline text-generation; autor Devseis; fecha de creacion 2026-10-08.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only identico al de Qwen2.5-0.5B-Instruct. El ajuste se realizo mediante LoRA con rango 16 y alpha 32, lo que supone 8,8 millones de parametros entrenables sobre el modelo base. La receta de entrenamiento fue de 1 epoca, learning rate 2e-4 y 124 pasos de 8 ejemplos, ejecutada unicamente en CPU (un MacBook Pro Intel de 4 nucleos, con PyTorch 2.2 y atencion en modo eager). La perdida de validacion final fue de 0.0173.

Los datos proceden del dataset sintetico Devseis/endpoint-auditor-synthetic (revision v0.1, licencia CC BY 4.0), con 988 ejemplos balanceados por tarea, sistema operativo y estado, con una longitud de 2048 tokens. Las tareas entrenadas son `finding`, `summary` y `ai_classification`, y el modelo responde siempre con un unico objeto JSON segun esquemas definidos en la aplicacion. La innovacion mas destacable del despliegue es la combinacion de conversión MLC-LLM con decodificacion restringida (constrained decoding) basada en esos esquemas: segun la model card, los builds de 4 bits producen JSON invalido sin ella (0 de 6 respuestas con base anclada) y respuestas correctamente ancladas con ella (5 de 6). La cuantizacion fue verificada contra los builds oficiales de mlc-ai del modelo base: layout de tensores identico, q0f16 byte-identico y entre el 99,6 y el 99,8 por ciento de los valores de 4 bits identicos, con diferencias de un solo paso en empates de redondeo.

## Capacidades

- Generacion de texto especializada en redaccion de hallazgos de auditoria de endpoints.
- Redaccion de resumenes ejecutivos de auditoria (`summary`) y clasificacion de herramientas de IA bajo el EU AI Act (`ai_classification`).
- Salida estructurada en JSON conforme a esquemas de respuesta predefinidos por tarea.
- Mapeo de hallazgos a referencias de ISO 27001, GDPR y EU AI Act (cita titulos de controles, no reproduce el texto de la norma).
- Redaccion de pasos de correccion y verificacion adaptados al sistema operativo del dispositivo auditado.
- Inferencia en dispositivo mediante MLC-LLM / WebLLM, sin envio de datos a servidores externos.
- Capacidad de anclaje (grounding) verificada contra la evidencia aportada, con verificacion posterior de numeros, identificadores de check, estado, referencias y nombres de herramientas.
- Idiomas: unicamente ingles.
- No realiza razonamiento aritmetico ni ranking fiable (los scores y las principales brechas los aporta el codigo de la aplicacion).

## Casos de uso

- Auditoria de cumplimiento en dispositivo: la aplicacion recoge evidencias del endpoint y el modelo redacta los hallazgos en ISO 27001 y GDPR sin que la evidencia salga del equipo, algo critico en sectores regulados.
- Verificacion de conformidad con el EU AI Act: clasifica las herramientas de IA detectadas en el dispositivo y justifica su categorizacion normativa dentro del informe.
- Informes ejecutivos de seguridad: genera resumenes legibles a partir de datos tecnicos crudos, con los scores y brechas prioritarias tomados del codigo y no inventados por el modelo.
- Auditoria de flotas de escritorio y movil: al ejecutarse via WebLLM en navegador, puede desplegarse en Windows, Linux, macOS y telefonos sin infraestructura de GPU ni backend de inferencia.
- Correccion guiada por sistema operativo: produce instrucciones de remediacion y verificacion especificas para cada plataforma, reduciendo el trabajo manual del equipo de IT.
- Prototipado de pipelines de auditoria asistida por IA: sirve como ejemplo reproducible de fine-tuning LoRA, cuantizacion MLC y decodificacion restringida para dominios verticales regulados.
- Asistencia a equipos de compliance: redacta borradores de hallazgos y referencias normativas que un auditor humano revisa y firma, actuando como acelerador documental y no como autoridad decisoria.
- Aplicaciones de escritorio offline: integrable como motor embebido en herramientas de seguridad que deben operar sin conexion.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia de la model card sobre ejemplos de test reservados (`training/evaluate.py`, decodificacion greedy). No se trata de benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no se dispone de resultados en esos conjuntos. Las metricas usadas son: JSON valido, anclaje (grounding, misma comprobacion de fidelidad que usa la aplicacion) y coincidencia de campos (check id / estado / riesgo, score y principales brechas, herramientas y flags de aprobacion).

Modelo base Qwen2.5-0.5-Instruct sin ajustar:

| Tarea | n | JSON valido | Anclaje | Campos coincidentes |
|---|---|---|---|---|
| ai_classification | 5 | 0% | 0% | 0% |
| finding | 21 | 0% | 0% | 0% |
| summary | 4 | 0% | 0% | 0% |
| todas | 30 | 0% | 0% | 0% |

Este modelo (v0.1):

| Tarea | n | JSON valido | Anclaje | Campos coincidentes |
|---|---|---|---|---|
| ai_classification | 5 | 100% | 100% | 100% |
| finding | 21 | 100% | 100% | 100% |
| summary | 4 | 100% | 100% | 0% |
| todas | 30 | 100% | 100% | 87% |

No se han publicado resultados en benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con cuantizacion q4f16_1, los pesos de un modelo de 0.5B ocupan del orden de 0.3 GB (el repositorio completo es de 0.3 GB); con cache KV y overhead de runtime, cabe comodamente en menos de 1 GB en estimaciones tipicas, aunque no se publica una cifra oficial de VRAM.
- GPU recomendadas: no requiere GPU dedicada. La model card indica que el entrenamiento se hizo en CPU (MacBook Pro Intel de 4 nucleos), y el despliegue objetivo es en dispositivo via WebLLM, por lo que funciona con GPU integrada o aceleracion WebGPU/WebAssembly en navegador.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso sin GPU dedicada; el cuello de botella no es la memoria sino el ancho de banda y el runtime de WebLLM.
- Opciones de despliegue: MLC-LLM y WebLLM (formato nativo del repositorio, con pesos ya convertidos y libreria de runtime reutilizada de Qwen2.5-0.5B q4f16_1). No se documentan builds oficiales para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un peso MLC, requeriria reconversion para otros motores.
- Latencia y throughput: no disponible (no se publican cifras de latencia ni tokens por segundo).

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de auditoria de endpoints comparables publicados. La referencia mas directa es su propio modelo base.

| Modelo | Parametros | Contexto | Ajuste | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Devseis Endpoint Auditor 0.5B (v0.1) | ~0.5B | 32 768 tokens (heredado) | LoRA r=16 sobre Qwen2.5-0.5B-Instruct, dominio ISO 27001 / GDPR / EU AI Act | en | Apache-2.0 | HuggingFace, formato MLC/WebLLM |
| Qwen2.5-0.5B-Instruct (base) | ~0.5B | 32 768 tokens | ajuste general de instrucciones | multilingue | Apache-2.0 | HuggingFace, formatos multiples |
| Qwen2.5-0.5B-Instruct-q4f16_1-MLC (mlc-ai) | ~0.5B | 32 768 tokens | build oficial MLC de 4 bits del base | multilingue | Apache-2.0 | HuggingFace, MLC/WebLLM |

## Limitaciones y advertencias

- Entrenado con evidencia sintetica: la redaccion real del mundo puede variar; la comprobacion de anclaje y el fallback a plantilla de la aplicacion mitigan este riesgo, pero no lo eliminan.
- Con 0.5B de parametros, el modelo frasea y selecciona bien hechos recuperados, pero no es fiable para aritmetica ni ranking; en la tarea `summary` obtuvo 0% de coincidencia de campos, por lo que scores y brechas principales deben aportarse desde codigo.
- No constituye asesoramiento legal ni certificacion: cita titulos de controles de ISO 27001, pero no reproduce el texto de la norma.
- El modelo no decide veredictos (Compliant / Non-Compliant) ni coincidencias de vulnerabilidades; eso lo hace el codigo. Usarlo como decisor seria un uso indebido.
- Riesgo de alucinacion inherente a un SLM: mitigado por la verificacion contra evidencia y el fallback a plantilla, pero presente en cualquier despliegue sin esas salvaguardas.
- Limitacion idiomatica: solo ingles.
- Es un piloto v0.1 explicitamente superado por v0.3; no conviene usarlo como referencia de produccion cuando existe una version posterior.
- Sin decodificacion restringida, los builds de 4 bits producen JSON invalido; la propia model card documenta 0 de 6 respuestas ancladas sin constrained decoding.
- Restricciones de licencia: Apache-2.0 permite uso comercial; se solicita atribucion ("Devseis Endpoint Auditor by Devseis"). El dataset sintetico asociado es CC BY 4.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f16_1-MLC
- Version no cuantizada / referencia del autor: https://huggingface.co/Devseis/endpoint-auditor-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Aplicacion (Space): https://huggingface.co/spaces/Devseis/endpoint-auditor
- Documentacion del modelo en la app: https://huggingface.co/spaces/Devseis/endpoint-auditor/blob/main/docs/MODEL_LLM.md
- Build oficial MLC del modelo base: https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC
- Repositorio MLC-LLM: https://github.com/mlc-ai/mlc-llm
- Documentacion de MLC-LLM: https://llm.mlc.ai/
- Introduccion a MLC-LLM (documentacion): https://llm.mlc.ai/docs/get_started/introduction
