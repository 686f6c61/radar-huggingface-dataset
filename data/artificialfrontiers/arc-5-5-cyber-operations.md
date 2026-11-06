# ArtificialFrontiers/Arc-5.5-Cyber-Operations

## Resumen

Arc 5.5 Cyber Operations es una ficha de modelo publicada por ArtificialFrontiers (Brink Studios, arquitecto principal Ryan Brink) que se presenta como una "suite" de agentes de ciberseguridad y sintesis de codigo orientada a ejecucion local. En la practica, el repositorio no contiene pesos propios: la model card indica que el usuario debe descargar GGUF de terceros (variantes "abliterated" y "heretic" de Qwen2.5-Coder-0.5B-Instruct, Llama-3.2-1B-Instruct y Llama-3.2-3B-Instruct) desde otros repositorios de Hugging Face. El modelo base declarado en los metadatos es Qwen2.5-Coder-0.5B-Instruct, con Llama-3.2-3B-Instruct como base adicional en la model card.

La propuesta se centra en un "system prompt" y un conjunto de directivas (cero rechazos en tareas de pentesting, escritura de ficheros en disco mediante bloques `tool:write`, soporte de Delphi/Object Pascal para el curriculo sudafricano CAPS/IEB) mas que en un entrenamiento o fine-tuning verificable. No se documentan datos de entrenamiento, tokens procesados, tecnicas de alineamiento ni evaluaciones.

Es relevante ahora por dos motivos: por un lado, ilustra la tendencia de "wrappers" de prompts y configuraciones de despliegue sobre modelos pequenos cuantizados para uso local; por otro, plantea riesgos claros de seguridad y de gobernanza, ya que promete comportamiento "zero-refusal" en ciberseguridad ofensiva sin aportar garantias tecnicas ni mecanismos de control. La informacion disponible es escasa y en gran parte autorreferencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de los modelos base: Qwen2.5-Coder y Llama 3.2); no se documenta arquitectura propia |
| Parametros totales | 0,5B (variante Lite, base Qwen2.5-Coder-0.5B-Instruct); 1,0B (variante Flash, base Llama-3.2-1B-Instruct); 3,2B (variante Cyber, base Llama-3.2-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de lanzamiento (`-c 2048`); el contexto nativo de los modelos base no se documenta en la ficha |
| Tipos de cuantizacion | i1-IQ3_M y Q4_K_M (Cyber); Q3_K_M y Q4_K_M (Flash); Q4_K_M (Lite) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos se descargan de repositorios de terceros; no se alojan en este repositorio) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura propia ni proceso de entrenamiento. El repositorio actua como capa de configuracion (system prompt, scripts de descarga y lanzamiento con `llama-server`) sobre modelos base de terceros: Qwen2.5-Coder-0.5B-Instruct y Llama-3.2-1B/3B-Instruct en variantes "abliterated" y "heretic", que son modificaciones comunitarias orientadas a reducir los rechazos del modelo. No se aportan datos sobre volumen de tokens, composicion del dataset, RLHF, DPO ni innovaciones tecnicas de inferencia.

Las "directivas arquitectonicas" que menciona la model card (ejecucion de herramientas de reconocimiento como `curl` o `nmap`, sintesis de codigo que persiste ficheros mediante bloques `tool:write`, soporte de Delphi VCL y consultas ADO parametrizadas, telemetria en tiempo real) son en realidad instrucciones de prompt y convenciones de uso, no caracteristicas del modelo. Cualquier capacidad de tool calling depende del runtime (por ejemplo, `llama-server`) y del modelo base subyacente.

## Capacidades

- Generacion de texto y sintesis de codigo en el marco de los modelos base (Qwen2.5-Coder y Llama 3.2), sin fine-tuning documentado.
- Ejecucion de comandos de terminal y herramientas de reconocimiento (`curl`, `nmap`, inspeccion de cabeceras HTTP) segun las directivas del system prompt, siempre que el runtime lo permita.
- Identificacion de cabeceras de seguridad ausentes (`Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`).
- Sintesis de scripts bash y codigo orientado a ficheros, con la convencion de persistir en disco mediante bloques `tool:write` en lugar de volcar codigo en el chat.
- Soporte declarado de Object Pascal/Delphi (formularios VCL, consultas ADO parametrizadas, `try...finally FreeAndNil`, matrices 2D, `AssignFile`).
- Razonamiento multi-paso (chain-of-thought) segun la model card, sin evaluacion que lo respalde.
- Comportamiento "zero-refusal" declarado para tareas de pentesting y descubrimiento de vulnerabilidades; no verificable y dependiente de las variantes abliterated/heretic de los modelos base.
- Soporte de tool calling y agentes: no disponible como capacidad nativa documentada; depende del runtime y del prompt.

## Casos de uso

- Auditoria de cabeceras HTTP en entornos de staging: el modelo puede lanzar peticiones con `curl`, comparar las cabeceras devueltas con la lista OWASP y generar un informe de cabeceras de seguridad ausentes. Es adecuado por su bajo consumo (variante Lite por debajo de 400 MB de RAM) y su capacidad de ejecutar herramientas locales.
- Pentesting autorizado en laboratorio: reconocimiento web multi-paso y sintesis de pruebas de explotacion sobre objetivos controlados, usando la variante Cyber (3,2B) con contexto de 2048 tokens. Requiere autorizacion explicita y aislamiento de red.
- Generacion de scripts de automatizacion bash: la variante Flash (1,0B) puede producir scripts completos y persistirlos en disco mediante `tool:write`, util para pipelines de triage rapido en equipos con recursos limitados.
- Soporte educativo de Delphi/Object Pascal: generacion de formularios VCL, consultas ADO parametrizadas y patrones de liberacion de memoria para el curriculo CAPS/IEB de Sudafrica, aprovechando el soporte declarado de Object Pascal.
- Asistente local de triage de incidencias: ejecucion de comandos de diagnostico en macOS/Linux y analisis de la salida en tiempo real, sin dependencia de la nube, para entornos con requisitos de soberania de datos.
- Prototipado de agentes autonomos en local: uso como motor de razonamiento de bajo coste en un bucle de agente con herramientas de terminal, aprovechando la ventana de 2048 tokens y el throughput declarado de aproximadamente 40 TPS en la variante Lite.
- Formacion en seguridad ofensiva y defensiva: escenarios de practica en los que el modelo explica y ejecuta tecnicas de reconocimiento y auditoria, con la advertencia de que no hay evaluacion de calidad ni de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara un rendimiento aproximado de 40+ TPS en inferencia local para la variante Lite (0,5B, Q4_K_M) y un consumo de RAM inferior a 400 MB, sin metodologia ni hardware de referencia.

## Requisitos de hardware

- VRAM/RAM estimada: variante Lite (0,5B, Q4_K_M) por debajo de 400 MB de RAM segun el autor; variante Flash (1,0B, Q3_K_M/Q4_K_M) en el rango de aproximadamente 0,6-0,8 GB; variante Cyber (3,2B, i1-IQ3_M/Q4_K_M) en el rango de aproximadamente 1,5-2,2 GB. Estimaciones a partir del tamano y la cuantizacion, no confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar las tres variantes; no se documenta soporte CUDA/Metal especifico.
- Cabe en GPU consumer: si, en todas las variantes, incluidas GPUs de gama baja y Apple Silicon con Metal.
- Opciones de despliegue: `llama-server` (llama.cpp) segun el ejemplo de la model card; Ollama y otros frontends compatibles con GGUF son viables pero no se documentan.
- Latencia y throughput: aproximadamente 40+ TPS declarados para la variante Lite en hardware no especificado; sin datos para Flash y Cyber.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arc 5.5 Cyber Operations (Lite/Flash/Cyber) | 0,5B / 1,0B / 3,2B | 2048 tokens en el ejemplo de despliegue | Suite de prompts y configuracion sobre modelos base de terceros | Apache 2.0 | Repositorio de configuracion; pesos en repositorios de terceros |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | 32 768 tokens (contexto nativo del modelo base) | Generacion de codigo | Apache 2.0 | Pesos oficiales en Hugging Face |
| Llama-3.2-3B-Instruct | 3,2B | 128 000 tokens (contexto nativo del modelo base) | Asistente generalista | Llama 3.2 Community License | Pesos oficiales en Hugging Face |
| Variantes abliterated/heretic de Llama 3.2 y Qwen2.5-Coder | 0,5B-3,2B | Segun modelo base | Reduccion de rechazos mediante modificaciones comunitarias | Segun modelo base | Repositorios comunitarios (bartowski, mradermacher, Severian) |

La comparativa relevante es con los modelos base sin modificar: Arc 5.5 no aporta pesos ni entrenamiento propios, por lo que su rendimiento real dependera de las variantes abliterated/heretic que el usuario descargue. No se dispone de datos de benchmarks que permitan comparar calidad.

## Limitaciones y advertencias

- El repositorio no contiene pesos: la model card enlaza a GGUF de terceros, lo que introduce dependencia de la disponibilidad y la integridad de esos repositorios externos.
- No hay evidencia de entrenamiento, fine-tuning ni evaluacion; las capacidades declaradas son directivas de prompt, no caracteristicas verificadas del modelo.
- El comportamiento "zero-refusal" en ciberseguridad ofensiva plantea un riesgo elevado de uso indebido; no se documentan mecanismos de control, filtros ni salvaguardas.
- Riesgo de alucinacion alto en un modelo de 0,5B-3,2B en tareas de seguridad: la model card afirma "ground truth adherence", pero no hay evaluacion que lo respalde y el modelo puede inventar resultados de escaneos o vulnerabilidades.
- Ventana de contexto de 2048 tokens en el ejemplo de despliegue, muy inferior al contexto nativo de los modelos base (32 768 tokens en Qwen2.5-Coder-0.5B, 128 000 en Llama-3.2-3B); limita el razonamiento multi-paso y el analisis de codebases grandes.
- Idiomas soportados no documentados; el soporte multilingue dependera de los modelos base.
- Licencia Apache 2.0 declarada, pero las variantes abliterated/heretic de Llama 3.2 estan sujetas a la Llama 3.2 Community License, que impone restricciones adicionales de uso comercial y de atribucion; conviene verificar la licencia de cada GGUF descargado.
- Sesgos conocidos: no documentados; heredados de los modelos base y de las modificaciones comunitarias de reduccion de rechazos.
- La calidad de la sintesis de codigo y del soporte de Delphi no esta evaluada; el soporte de Object Pascal en modelos de este tamano es historicamente debil.
- Fecha de creacion del repositorio (2026-11-04) posterior a la fecha de referencia habitual; verificar la vigencia y el estado del repositorio antes de usarlo en produccion.
- Sin descargas ni likes en el momento de la consulta; no hay senales de adopcion ni de mantenimiento por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArtificialFrontiers/Arc-5.5-Cyber-Operations
- Modelo base Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- GGUF de referencia para Lite (bartowski): https://huggingface.co/bartowski/Qwen2.5-Coder-0.5B-Instruct-abliterated-GGUF
- GGUF de referencia para Flash (Severian): https://huggingface.co/Severian/heretic_FuseChat-Llama-3.2-1B-Instruct-GGUF
- GGUF de referencia para Cyber (mradermacher): https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-heretic-i1-GGUF
- Organizacion en Hugging Face: https://huggingface.co/ArtificialFrontiers
