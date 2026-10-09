# Devseis/endpoint-auditor-0.5b-q4f32_1-MLC

## Resumen

Devseis Endpoint Auditor 0.5B es un modelo de lenguaje pequeno (0,5 B parametros) afinado por Devseis a partir de Qwen/Qwen2.5-0.5B-Instruct para redactar hallazgos de auditoria de seguridad en equipos finales (endpoints) segun los marcos ISO 27001, GDPR y EU AI Act. El modelo no decide los veredictos: el codigo de la aplicacion recolecta la evidencia y determina el estado (Compliant / Non-Compliant) y las coincidencias de vulnerabilidades, mientras que el modelo explica cada hallazgo, estima el riesgo, redacta pasos de correccion y verificacion adaptados al sistema operativo, mapea los hallazgos a referencias normativas, escribe el resumen ejecutivo y clasifica herramientas de IA bajo el EU AI Act.

La ficha corresponde a la version v0.1, un piloto entrenado con 988 ejemplos sinteticos balanceados (Windows, Linux y macOS) del dataset Devseis/endpoint-auditor-synthetic en su revision v0.1. El ajuste se hizo con LoRA r=16 y alpha=32 sobre la base congelada. La distribucion publicada esta en formato MLC con cuantizacion q4f32_1, pensada para ejecutarse integramente en el dispositivo mediante WebLLM (navegador o app de escritorio), de modo que la evidencia de auditoria nunca sale del equipo del usuario.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de 0,5 B con decodificacion restringida puede producir respuestas JSON fieles a la evidencia en tareas de cumplimiento normativo muy estructuradas; por otro, encaja en el patron de inferencia local y privada para herramientas de seguridad, donde enviar datos de auditoria a una API en la nube no es aceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5); se reutiliza la libreria de ejecucion precompilada de Qwen2.5-0.5B-Instruct en MLC/WebLLM |
| Parametros totales | 0,5 B (modelo base Qwen/Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de entrenamiento usan 2048 tokens) |
| Tipos de cuantizacion | q4f32_1 (4 bits) para MLC/WebLLM; se menciona tambien una build q0f16 usada en la verificacion de conversion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC-LLM (pesos compilados para WebLLM); repositorio de 0,3 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen2.5-0.5B-Instruct, un transformer decoder-only, y el autor indica que reutiliza la misma libreria de ejecucion precompilada de Qwen2.5-0.5B en q4f32_1 para WebLLM, cambiando unicamente los pesos. El ajuste fino se realizo con LoRA de rango 16 y alpha 32 (8,8 M parametros entrenables), learning rate 2e-4, una sola epoca y 124 pasos de 8 ejemplos, con un unico MacBook Pro de 4 nucleos Intel (solo CPU, PyTorch 2.2 con atencion eager). La perdida de validacion final fue 0,0173.

Los datos provienen del dataset sintetico Devseis/endpoint-auditor-synthetic (revision v0.1, licencia CC BY 4.0): 988 ejemplos balanceados por tarea, sistema operativo y estado, con secuencias de 2048 tokens. Las tareas cubiertas son `finding`, `summary` y `ai_classification`, y el modelo responde siempre con un unico objeto JSON. El autor documenta que la conversion a MLC se hizo con `training/mlc_quantize.py` y se verifico contra las builds propias de mlc-ai del modelo base: layout de tensores identico, q0f16 byte a byte identico, y en 4 bits escalas bit a bit identicas con un 99,6-99,8% de valores identicos (el resto a un paso de diferencia por empates de redondeo).

No se menciona RLHF ni DPO en la informacion disponible; el pipeline descrito es exclusivamente ajuste supervisado con LoRA sobre ejemplos sinteticos y posterior conversion/cuantizacion.

## Capacidades

- Redaccion de hallazgos de auditoria: explica cada comprobacion, asigna nivel de riesgo y propone pasos de correccion y verificacion especificos para el sistema operativo del equipo.
- Mapeo normativo: vincula los hallazgos a referencias de ISO 27001, GDPR y EU AI Act (se citan titulos de controles ISO 27001, no el texto de la norma).
- Resumen ejecutivo: genera el `summary` de la auditoria a partir de la evidencia recuperada.
- Clasificacion de herramientas de IA bajo el EU AI Act (tarea `ai_classification`).
- Salida estructurada: responde con un unico objeto JSON conforme a esquemas definidos (`ANSWER_SCHEMAS`), lo que permite decodificacion restringida con `response_format` de tipo `json_object`.
- Ejecucion en el dispositivo: inferencia local en navegador via WebLLM, sin enviar evidencia a servicios externos.
- No soporta tool calling ni razonamiento multi-paso de agentes segun la informacion disponible; su funcion esta acotada a las tres tareas de auditoria descritas.
- Capacidad multilingue limitada: el modelo esta entrenado y etiquetado unicamente en ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Auditoria de cumplimiento en endpoints corporativos: el modelo transforma las comprobaciones ya resueltas por el codigo en explicaciones legibles y mapeadas a ISO 27001, GDPR y EU AI Act, ideal para informes que el equipo de seguridad revisa antes de publicar.
- Aplicacion de escritorio con privacidad estricta: al ejecutarse con WebLLM en el propio equipo, permite auditar portatiles con datos sensibles sin que la evidencia abandone la maquina, requisito habitual en entornos regulados.
- Chequeo rapido desde el navegador o el movil: la cuantizacion q4f32_1 y el tamano de 0,3 GB facilitan desplegar la revision en dispositivos sin GPU dedicada.
- Generacion de informes ejecutivos de seguridad: la tarea `summary` produce el resumen de alto nivel para direccion a partir de los datos estructurados, con la puntuacion y las brechas principales calculadas por codigo.
- Clasificacion de inventario de IA: la tarea `ai_classification` ayuda a etiquetar herramientas de IA detectadas en la organizacion segun el EU AI Act, con los indicadores de aprobacion aportados por el sistema.
- Plantillas de remediacion por sistema operativo: el modelo redacta los pasos de correccion y verificacion adaptados a Windows, Linux o macOS, reduciendo el trabajo manual de redaccion del equipo de TI.
- Integracion en pipelines de cumplimiento continuo: al devolver JSON validado contra evidencia, encaja en flujos automatizados donde un verificador posterior comprueba numeros, identificadores de check, estado y referencias, con plantilla de reserva si la comprobacion falla.

## Benchmarks y rendimiento

Evaluacion sobre ejemplos de test reservados (`training/evaluate.py`, decodificacion greedy). "Grounded" indica que la respuesta supera la misma comprobacion de fidelidad que usa la aplicacion; "fields match" indica coincidencia de check id / estado / riesgo (hallazgos), puntuacion y brechas principales (resumenes), y herramientas y flags de aprobacion (IA).

Modelo base (Qwen2.5-0.5B-Instruct, sin ajustar):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 0% | 0% | 0% |
| finding | 21 | 0% | 0% | 0% |
| summary | 4 | 0% | 0% | 0% |
| **total** | 30 | **0%** | **0%** | **0%** |

Este modelo (v0.1):

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 100% | 100% | 100% |
| finding | 21 | 100% | 100% | 100% |
| summary | 4 | 100% | 100% | 0% |
| **total** | 30 | **100%** | **100%** | **87%** |

Dato adicional del autor: con decodificacion restringida, los builds de 4 bits producen respuestas JSON invalidas sin el esquema (0 de 6 con grounding) y respuestas con grounding al aplicarlo (5 de 6; la sexta quedo cortada por el limite de tokens, ya ampliado). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,3 GB y el modelo es de 0,5 B en cuantizacion de 4 bits, por lo que el consumo de memoria es muy reducido.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en el dispositivo y su entrenamiento se hizo solo con CPU.
- Compatibilidad con GPU de consumo: si, el enfoque WebLLM/MLC esta orientado a ejecucion en navegador y equipos de consumo; no se detallan modelos concretos.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm`), MLC-LLM y binarios de MLC para WebGPU; el autor indica que se reutiliza la libreria precompilada de Qwen2.5-0.5B q4f32_1.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de integracion: se recomienda decodificacion restringida con `response_format: { type: "json_object", schema: ... }` para obtener JSON valido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / ejecucion | Licencia | Rendimiento en tareas de auditoria |
|---|---|---|---|---|---|
| Devseis Endpoint Auditor 0.5B (v0.1) | 0,5 B | no disponible | MLC / WebLLM (q4f32_1) | Apache-2.0 | 100% JSON valido y 100% grounded en el test reservado del autor (87% fields match) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5 B | no disponible en la informacion proporcionada | safetensors (transformers) | Apache-2.0 | 0% JSON valido y 0% grounded en el mismo test, sin ajuste |
| mlc-ai/Qwen2.5-0.5B-Instruct-q4f32_1-MLC | 0,5 B | no disponible | MLC / WebLLM (q4f32_1) | Apache-2.0 | no disponible; es el build de referencia del que este modelo reutiliza la libreria de ejecucion |

Las alternativas comparables de la misma categoria y tamano (modelos de 0,5 B) no aparecen con datos de rendimiento en la informacion disponible. La comparacion directa con el base Qwen2.5-0.5B-Instruct mostrada arriba procede de la propia evaluacion del autor.

## Limitaciones y advertencias

- Entrenado exclusivamente con evidencia sintetica: la redaccion del mundo real varia, por lo que la comprobacion de fidelidad y la plantilla de reserva de la aplicacion son necesarias para proteger el informe final.
- Tamano de 0,5 B: el modelo frasea y selecciona bien hechos recuperados, pero no es fiable para aritmetica ni para ordenar o clasificar; los scores y las brechas principales los aporta el codigo.
- No es asesoramiento legal ni una certificacion; solo se citan titulos de controles ISO 27001 y no se reproduce el texto de la norma.
- El modelo no decide veredictos ni coincidencias de vulnerabilidades: esa responsabilidad recae en el codigo que recolecta la evidencia.
- Capacidad multilingue restringida al ingles; no hay soporte declarado para otros idiomas.
- Riesgo de alucinacion mitigado en la aplicacion, pero presente si el modelo se usa fuera del flujo con decodificacion restringida y verificacion contra evidencia.
- En la tarea de resumen, la coincidencia de campos ("fields match") fue del 0% (0 de 4 ejemplos), aunque el JSON y el grounding fueron del 100%; conviene revisar ese caso de uso antes de llevarlo a produccion.
- Estado del modelo: etiquetado como piloto v0.1 y explicitamente superado por la v0.3 segun el autor; no hay descargas ni "likes" registrados en el momento de la consulta.
- Licencia Apache-2.0, que permite uso comercial con atribucion; el autor solicita acreditar "Devseis Endpoint Auditor by Devseis".
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q4f32_1-MLC
- Modelo (referencia general v0.1): https://huggingface.co/Devseis/endpoint-auditor-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Demo / Space: https://huggingface.co/spaces/Devseis/endpoint-auditor
- Documentacion de la integracion LLM: https://huggingface.co/spaces/Devseis/endpoint-auditor/blob/main/docs/MODEL_LLM.md
- Build de referencia MLC (misma arquitectura, 0,5 B): https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f32_1-MLC
- Librerias binarias de MLC-LLM: https://github.com/mlc-ai/binary-mlc-llm-libs/releases
- Build MLC de Qwen2.5-1.5B-Instruct (referencia de la familia, encontrada en la busqueda): https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC
- Herramienta relacionada tematicamente (no es el mismo proyecto): https://github.com/saikatz/local-llm-configuration-auditor
- Herramienta relacionada tematicamente (no es el mismo proyecto): https://nocturn3.com/pages/llm-auditor
