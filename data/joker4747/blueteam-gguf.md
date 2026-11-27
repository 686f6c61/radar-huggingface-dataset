# joker4747/blueteam-gguf

## Resumen

blueteam-gguf es un ajuste fino experimental de Qwen2.5-1.5B-Instruct orientado a tareas de seguridad defensiva (blue team). Lo desarrolla el usuario joker4747 y se distribuye como un unico fichero GGUF cuantizado en Q4_K_M de aproximadamente 1 GB, pensado para ejecutarse en local sobre CPU de portatil. El modelo parte de la arquitectura transformer densa de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros, y se ha adaptado mediante QLoRA de 4 bits sobre material publico de defensa: MITRE ATT&CK, reglas de deteccion SigmaHQ y el catalogo CISA KEV.

El problema que aborda es acotado: ayudar a analistas de SOC e ingenieros de deteccion a redactar borradores de reglas Sigma, explicar tecnicas de ATT&CK desde la perspectiva del defensor y resumir vulnerabilidades del catalogo KEV con sus acciones de remediacion. No es un modelo de proposito general ni un asistente autonomo de seguridad; el propio autor lo etiqueta como prototipo temprano que reproduce bien el formato del contenido de deteccion pero alucina detalles concretos.

Su relevancia actual es la de un ejemplo de ajuste de dominio de bajo coste: entrenado en una unica GPU T4 gratuita de Kaggle, con unas 4.850 muestras de entrenamiento y exportado a GGUF para inferencia local. Sirve mas como banco de pruebas para experimentar con modelos pequenos especializados que como herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion (entrenado con secuencias de 1.024 tokens) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura transformer densa del Qwen2.5-1.5B-Instruct original, con atencion estandar y proyecciones MLP. El ajuste se realizo con QLoRA en 4 bits (NF4), con rango LoRA r=16, alpha=32 y dropout 0.05, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento uso fp16 sobre una GPU T4 de Kaggle, con una epoca, tasa de aprendizaje 2e-4 con schedule coseno, tamano de batch efectivo 16 y longitud de secuencia de 1.024 tokens, calculando la perdida unicamente sobre las respuestas del asistente. Posteriormente, el adaptador LoRA se fusiono en el modelo base fp16 y se convirtio con llama.cpp a GGUF Q4_K_M.

El dataset consta de aproximadamente 4.850 ejemplos de entrenamiento y 150 de validacion, generados con plantillas a partir de fuentes publicas: resumenes de tecnicas, mitigaciones y guias de deteccion de MITRE ATT&CK enterprise; reglas Sigma de SigmaHQ (que constituyen la mayoria del muestreo) y resumenes de vulnerabilidades y acciones requeridas del catalogo CISA KEV. No se usaron datos privados ni propietarios, y no se reporta RLHF ni DPO adicional. El prompt de sistema empleado durante el entrenamiento esta documentado en la model card y el formato de chat es ChatML, el mismo que Qwen2.5.

## Capacidades

- Generacion de texto en ingles con estilo tecnico de seguridad defensiva.
- Redaccion de borradores de reglas Sigma y propuestas de deteccion para revision humana.
- Explicacion de tecnicas de MITRE ATT&CK, mitigaciones y enfoques de deteccion desde la perspectiva del defensor.
- Resumen de vulnerabilidades del catalogo CISA KEV y de las acciones de remediacion recomendadas.
- Conversacion multi-turno en formato ChatML con un prompt de sistema especifico de blue team.
- Soporte de tool calling o function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo es un prototipo de 1,5B sin entrenamiento especifico para agentes.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Borrador de reglas Sigma para revision: el modelo puede generar una primera version de una regla de deteccion a partir de una descripcion de comportamiento sospechoso, que el ingeniero de deteccion valida con sigma-cli/pySigma y prueba sobre logs reales antes de desplegarla.
- Explicacion de tecnicas ATT&CK en formacion interna: util para que analistas junior obtengan un resumen rapido de una tecnica y de sus enfoques de deteccion, siempre contrastando con la fuente primaria de MITRE.
- Triage inicial de vulnerabilidades KEV: resumir una CVE del catalogo KEV y las acciones de remediacion requeridas para priorizar parches en una cola de trabajo.
- Prototipado local en portatil sin GPU: al ser un GGUF Q4_K_M de aproximadamente 1 GB, puede ejecutarse con llama.cpp, Ollama o LM Studio en CPU, lo que facilita pruebas en entornos aislados o sin conectividad.
- Material de entrenamiento para equipos de SOC: generar preguntas y respuestas de practica sobre deteccion y mitigacion, revisadas por un instructor antes de su uso.
- Banco de pruebas para investigacion en ajuste de dominio: servir de referencia para experimentar con QLoRA sobre modelos pequenos y medir el impacto de la cuantizacion en tareas de identificadores exactos (event IDs, CVE, sintaxis de reglas).
- Asistencia en documentacion de runbooks: redactar borradores de procedimientos de respuesta a incidentes a partir de descripciones de tecnicas y mitigaciones, con revision obligatoria posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay evaluacion formal y que solo se realizaron comprobaciones informales puntuales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en Q4_K_M; el modelo puede residir en RAM de CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; el autor lo entreno en una T4, pero la inferencia no requiere GPU.
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual (GTX 1050, RTX 3050, RTX 4090, etc.) y tambien en CPU.
- Opciones de despliegue: llama.cpp (llama-cli con -cnv), Ollama (mediante Modelfile), LM Studio; el repo esta marcado como endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la informacion. El autor recomienda temperatura baja (0,1-0,3) para tareas factuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blueteam-gguf | 1,54B | no disponible (entrenado a 1.024 tokens) | Blue team: Sigma, ATT&CK, KEV | Apache-2.0 | GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54B | no disponible en la informacion | Proposito general, instrucciones | Apache-2.0 | Multiples formatos en Hugging Face |
| Alternativas de seguridad defensiva de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Alucinacion: el modelo inventa detalles concretos, como identificadores de eventos de Windows, datos de CVE o campos de reglas. Toda salida debe verificarse contra fuentes primarias.
- Problema de datos conocido en la v1: la porcion de ATT&CK se construyo sin el contenido mas reciente de "detection strategy" (MITRE separo la guia de deteccion en objetos aparte), por lo que las respuestas de deteccion para tecnicas ATT&CK son debiles. Hay un dataset corregido previsto para la siguiente version.
- Calidad de reglas: las reglas Sigma generadas son sintacticamente plausibles pero a menudo incompletas (faltan variantes comunes y metadatos); deben validarse con sigma-cli/pySigma y probarse sobre logs reales.
- Conocimiento estrecho y contexto corto: entrenado sobre una muestra limitada y secuencias de 1.024 tokens; no conoce eventos posteriores a las instantaneas de las fuentes.
- Sin evaluacion formal: no hay benchmarks publicados; la cuantizacion Q4_K_M puede reducir la precision en identificadores exactos (CVE, event IDs, sintaxis de reglas).
- Comportamiento heredado: conserva sesgos y comportamiento de seguridad de Qwen2.5-1.5B-Instruct; no se entreno para eliminar rechazos.
- Restricciones de licencia: los pesos son Apache-2.0, pero las fuentes de datos tienen sus propios terminos; si se redistribuye o se construye un producto comercial, deben mantenerse las atribuciones a MITRE ATT&CK y a SigmaHQ (reglas bajo Detection Rule License 1.1).
- Uso previsto restringido: no apto para decisiones de seguridad autonomas, alertas en produccion sin validacion, asesoramiento legal ni uso ofensivo.
- Idioma: solo ingles, lo que limita su uso en entornos hispanohablantes sin traduccion intermedia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joker4747/blueteam-gguf
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- MITRE ATT&CK: https://attack.mitre.org/
- SigmaHQ (reglas Sigma): https://github.com/SigmaHQ/sigma
- Catalogo CISA KEV: https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com/
