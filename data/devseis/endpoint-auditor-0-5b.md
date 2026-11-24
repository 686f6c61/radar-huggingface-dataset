# Devseis/endpoint-auditor-0.5b

## Resumen

Devseis Endpoint Auditor 0.5B es un modelo de lenguaje pequeno (494 millones de parametros) desarrollado por Devseis, un proyecto que lo publica bajo licencia Apache-2.0. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-0.5B-Instruct, especializado en redactar hallazgos de auditoria de seguridad en endpoints para los marcos ISO 27001, GDPR y el Reglamento europeo de IA (EU AI Act). El modelo no decide veredictos: el codigo de la aplicacion recoge la evidencia y determina el estado (compliant / non-compliant), mientras que el modelo se limita a explicar cada hallazgo, valorar el riesgo, proponer pasos de correccion y verificacion adaptados al sistema operativo del dispositivo y mapear los resultados a las referencias normativas correspondientes.

La motivacion principal es la privacidad: el modelo esta disenado para ejecutarse en local (WebLLM en la aplicacion de escritorio Devseis Endpoint Auditor y en la comprobacion para movil), de modo que la evidencia de auditoria nunca abandona el ordenador o el telefono del usuario. La version v0.6, publicada en octubre de 2026, es un reentrenamiento de la v0.5 orientado a sobrevivir a la cuantizacion de 4 bits que usan las builds de navegador, con un peso aproximado de 300 MB en 4 bits.

El modelo responde con un unico objeto JSON a tres tipos de tarea (`finding`, `summary`, `ai_classification`) y esta pensado para integrarse en un pipeline donde una comprobacion de fidelidad (grounding) valida cada respuesta contra la evidencia antes de usarla; si falla, la aplicacion recurre a una plantilla interna. Su tamano reducido y su enfoque cerrado lo hacen adecuado para despliegue en dispositivo, no como asistente generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con ejemplos de 3072 tokens) |
| Tipos de cuantizacion | q0f16 (16 bits), q4f16_1 (4 bits), q4f32_1 (4 bits); adapter LoRA en precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); builds MLC para navegador; adapter LoRA en `lora/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atencion causal estandar. Sobre esa base se aplica un ajuste fino con LoRA de rango 16 y alpha 32, lo que supone 8,8 millones de parametros entrenables. El entrenamiento se realizo unicamente en CPU (un MacBook Pro Intel de 4 nucleos con PyTorch 2.2 y atencion eager), con learning rate 2e-4, una epoca y 100 pasos de 8 ejemplos, alcanzando una perdida de validacion final de 0.0149.

El conjunto de datos es sintetico (Devseis/endpoint-auditor-synthetic, revision v0.5, licencia CC BY 4.0) y consta de 800 ejemplos balanceados por tarea, sistema operativo y estado, con secuencias de 3072 tokens. La version v0.6 anade 100 pasos adicionales sobre 800 de los ejemplos de v0.5 con learning rate 1e-4, aplicando en cada forward pass el redondeo exacto de cuantizacion q4f16_1 (entrenamiento con cuantizacion simulada, `train_lora.py --qat4`). Esta innovacion es el rasgo tecnico mas destacable: el modelo se entrena para mantener la calidad tras el redondeo a 4 bits, algo poco habitual en modelos de este tamano. El prompt sigue un formato de recuperacion (retrieval-style) generado por `app/renderer/auditor-core.js`, identico al usado en `training/build_dataset.py`.

## Capacidades

- Generacion de texto estructurado: responde con un unico objeto JSON por consulta en las tareas `finding`, `summary` y `ai_classification`.
- Redaccion de hallazgos de auditoria: explica cada hallazgo, valora el riesgo y propone pasos de correccion y verificacion especificos del sistema operativo del dispositivo.
- Mapeo normativo: vincula los hallazgos a referencias de ISO 27001, GDPR y EU AI Act (cita titulos de controles ISO 27001, sin reproducir el texto de la norma).
- Clasificacion de herramientas de IA bajo el EU AI Act.
- Redaccion de resumenes ejecutivos a partir de la evidencia recogida.
- Salida validable: cada respuesta se comprueba contra la evidencia (numeros, check id, estado, referencias, nombres de herramientas) mediante una comprobacion de fidelidad en la aplicacion.
- Capacidad conversacional basica (tarea `chat`), heredada del modelo base.
- No soporta tool calling ni function calling de forma nativa; no es multimodal; no tiene modo de razonamiento extendido (thinking).

## Casos de uso

- Auditoria de cumplimiento en dispositivo: el modelo redacta los hallazgos de un analisis de endpoints (ISO 27001, GDPR, EU AI Act) sin que la evidencia salga del ordenador o telefono, gracias a su ejecucion local via WebLLM y a su tamano de unos 300 MB en 4 bits.
- Generacion de informes ejecutivos: a partir de la evidencia recogida por codigo, produce el resumen ejecutivo de la auditoria con puntuacion y principales carencias, que la aplicacion valida antes de incorporarlo al informe.
- Asistencia en correccion y verificacion: para cada hallazgo no conforme, genera pasos de remediacion y verificacion adaptados al sistema operativo del dispositivo auditado, utiles para equipos de IT que necesitan una guia accionable inmediata.
- Clasificacion de herramientas de IA: identifica y clasifica herramientas de IA presentes en el entorno segun el EU AI Act, apoyando la gestion de riesgos regulatorios.
- Integracion en aplicaciones de escritorio y movil con privacidad estricta: al caber en builds de 4 bits para navegador y ejecutarse en CPU, puede embeberse en herramientas de cumplimiento sin infraestructura de servidor ni envio de datos a terceros.
- Mapeo de controles para consultores: acelera la traduccion de hallazgos tecnicos a referencias normativas (titulos de controles ISO 27001, articulos GDPR), reduciendo el trabajo manual de documentacion en auditorias recurrentes.
- Prototipado de asistentes de cumplimiento especializados: su licencia Apache-2.0 y su adapter LoRA permiten reutilizar el ajuste como punto de partida para dominios regulatorios adyacentes.

## Benchmarks y rendimiento

Resultados de la evaluacion del autor sobre ejemplos de test reservados (`training/evaluate.py`, decodificacion greedy). "Grounded" indica que pasa la misma comprobacion de fidelidad que usa la aplicacion; "fields match" indica coincidencia en check id / estado / riesgo (hallazgos), puntuacion y principales carencias (resumenes), y herramientas y flags de aprobacion (clasificacion IA).

Modelo base (Qwen2.5-0.5B-Instruct sin ajustar):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 4 | 0% | 0% | 0% |
| chat | 38 | 100% | 95% | 0% |
| finding | 15 | 0% | 0% | 0% |
| summary | 3 | 0% | 0% | 0% |
| **total** | 60 | **63%** | **60%** | **0%** |

Este modelo (v0.6, redondeado a 4 bits):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 4 | 100% | 100% | 100% |
| chat | 38 | 100% | 100% | 92% |
| finding | 15 | 100% | 100% | 100% |
| summary | 3 | 100% | 100% | 100% |
| **total** | 60 | **100%** | **100%** | **95%** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en precision completa (fp16) y unos 300 MB en cuantizacion de 4 bits.
- GPU recomendadas: no requiere GPU; el autor lo entreno y evaluo solo en CPU (MacBook Pro Intel de 4 nucleos). Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Cabe en GPU consumer: si, en todas; tambien en CPU y en navegador mediante WebLLM (builds q0f16, q4f16_1 y q4f32_1).
- Opciones de despliegue: transformers (con `revision="v0.6"`), PEFT para aplicar el adapter LoRA sobre Qwen2.5-0.5B-Instruct, MLC/WebLLM para navegador, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devseis Endpoint Auditor 0.5B | 494 M | no disponible | Auditoria de endpoints (ISO 27001, GDPR, EU AI Act) | Apache-2.0 | Hugging Face, builds MLC |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 tokens (segun documentacion publica de Qwen) | Asistente generalista | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (segun documentacion publica de Qwen) | Asistente generalista | Apache-2.0 | Hugging Face |

La comparacion directa con modelos especializados en auditoria de seguridad de tamano similar no esta disponible en la informacion proporcionada. Frente al modelo base, el Endpoint Auditor sacrifica generalidad por una salida JSON fiable y fiel a la evidencia en su dominio, con un coste de entrenamiento minimo (100 pasos en CPU).

## Limitaciones y advertencias

- Entrenado sobre evidencia sintetica: la redaccion del mundo real varia y el modelo puede no cubrir formulaciones no vistas; la aplicacion mitiga esto con la comprobacion de fidelidad y la plantilla de respaldo.
- Con 0,5B parametros no es fiable para aritmetica ni para ranking; la aplicacion aporta las puntuaciones y las principales carencias desde codigo.
- En precision completa sus resumenes son mas debiles que en la build de 4 bits; el autor recomienda v0.3 en q0f16 y v0.6 en q4f32_1 para chips sin matematicas de 16 bits.
- Solo soporta ingles; no hay capacidades multilingues.
- No es asesoramiento legal ni certificacion: cita titulos de controles ISO 27001 pero no reproduce el texto de la norma.
- Riesgo de alucinacion inherente a un modelo de este tamano, atenuado por la validacion externa pero no eliminado si se usa fuera del pipeline previsto.
- La licencia Apache-2.0 permite uso comercial, pero el autor solicita atribucion ("Devseis Endpoint Auditor by Devseis").
- El chat web de Arx para el que se entreno v0.5/v0.6 fue retirado el 2026-10-14, por lo que ese caso de uso ya no esta activo.
- Sin datos publicados sobre sesgos, contexto maximo efectivo ni rendimiento en benchmarks estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Devseis/endpoint-auditor-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Build MLC q0f16: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q0f16-MLC
- Build MLC q4f16_1: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f16_1-MLC
- Build MLC q4f32_1: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f32_1-MLC
- Aplicacion Devseis Endpoint Auditor (Space Arx): https://huggingface.co/spaces/Devseis/Arx
- Documentacion del modelo en la app: https://huggingface.co/spaces/Devseis/Arx/blob/main/docs/MODEL_LLM.md
