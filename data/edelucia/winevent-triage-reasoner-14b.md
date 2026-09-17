# edelucia/WinEvent-Triage-Reasoner-14B

## Resumen

WinEvent-Triage-Reasoner-14B es un ajuste fino (fine-tuning) del modelo DeepSeek-R1-Distill-Qwen-14B, publicado por el usuario edelucia en HuggingFace, orientado al triaje de eventos de Windows (registro de seguridad nativo y Sysmon) en flujos de trabajo DFIR, SOC y threat hunting. El repositorio distribuye exclusivamente pesos en formato GGUF, lo que lo hace desplegable en LM Studio, Ollama y equipos de sobremesa con GPU de gama media, y la model card recomienda la cuantización Q4_K_M para huellas de 8-10 GB de VRAM.

La propuesta diferencial del autor no es tanto el ajuste como el protocolo de inferencia: el modelo está diseñado para operar como una máquina de estados determinista que ejecuta un pipeline cognitivo obligatorio de cuatro fases (extracción y contexto arquitectónico, test de hipótesis simétrico benigno/malicioso, evaluación por primeros principios y falsificación, y conclusión causal) dentro de un bloque `thinking`, y que después emite únicamente un objeto JSON con los campos `threat_identification`, `technique` (nombre e ID de MITRE ATT&CK), `mitigation`, `category` y `next_command`.

Es relevante porque aborda un problema recurrente en el uso de LLM en ciberseguridad defensiva: la fabricación de indicadores forenses (argumentos de línea de comandos, claves de registro o direcciones IP inexistentes). El prompt de sistema obligatorio instruye explícitamente al modelo a no inventar datos y a clasificar como "Suspicious" solo cuando la evidencia sea ambigua. Se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y sin resultados de búsqueda web relevantes asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada del modelo base DeepSeek-R1-Distill-Qwen-14B (familia Qwen); no se detalla en la model card |
| Parametros totales | 14B (heredado del modelo base; no se especifica cifra exacta en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base DeepSeek-R1-Distill-Qwen-14B declara 128K tokens en su propia documentacion |
| Tipos de cuantizacion | GGUF; la model card recomienda Q4_K_M (8-10 GB de VRAM) |
| Idiomas soportados | no disponibles (la model card no los declara; hereda las capacidades del modelo base, no confirmadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria declarada: gguf) |
| ID del repositorio | edelucia/WinEvent-Triage-Reasoner-14B |
| Titulo interno en la model card | DFIR-DeepSeek-R1-14B-Reasoning (discrepancia con el ID del repositorio) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-14B |
| Fecha de creacion | 17 de septiembre de 2026 (segun metadatos del repositorio) |
| Ultima actualizacion | 17 de septiembre de 2026 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-14B, un destilado de razonamiento de la familia DeepSeek-R1 sobre una base Qwen de 14B parametros, con licencia Apache 2.0. Sobre esa base, el autor ha realizado un fine-tuning especializado en eventos de Windows y Sysmon, del que no se documentan ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Tampoco se especifica si el ajuste congelo capas o si se aplicaron adaptadores. Toda esta informacion es no disponible en la model card.

La innovacion declarada no es arquitectonica sino de comportamiento: el modelo se presenta como una "maquina de estados determinista" que, con el prompt de sistema obligatorio, fuerza cuatro fases de razonamiento dentro del bloque `<think>` antes de cerrar con `</think>` y emitir exclusivamente JSON crudo. La fase 2 impone un test de hipotesis simetrico (una razon tecnica para la hipotesis benigna y otra para la maliciosa) y la fase 3 exige intentar falsar la hipotesis maliciosa y justificar cual pesa mas, con la instruccion explicita de no depender de reglas de rutas hardcodeadas. La fase 4 obliga a formatear la conclusion como una relacion causal entre la evidencia extraida y un principio de arquitectura del sistema operativo. Es un enfoque de prompting estructurado empaquetado como especificacion del modelo, no una tecnica de decodificacion (no se mencionan decodificacion especulativa ni atencion lineal).

## Capacidades

- Triaje de eventos de Windows: interpretacion de EventID, su significado en el sistema operativo (creacion de proceso, creacion de archivo, conexion de red, etc.), imagen ejecutable, argumentos de linea de comandos, cuenta de usuario, nivel de integridad y proceso padre.
- Analisis de logs de Sysmon y del registro de seguridad nativo de Windows.
- Razonamiento estructurado en cuatro fases dentro de un bloque de pensamiento explicito (`<think>` ... `</think>`).
- Clasificacion de veredicto en tres categorias: Malicious, Benign o Suspicious, con criterio explicito de ambiguedad forense.
- Mapeo a MITRE ATT&CK: el esquema de salida exige nombre e ID exactos de la tecnica, o "None".
- Generacion de comandos de siguiente paso: campo `next_command` con comandos de PowerShell o CLI, o "None".
- Salida JSON estricta: el modelo esta instruido para emitir solo un objeto JSON crudo tras el bloque de pensamiento, sin texto plano mezclado.
- Ausencia de capacidades confirmadas: no se declaran vision, audio, tool calling nativo, function calling, uso como agente autonomo multi-paso, ni soporte multilingue verificado. La model card esta integramente en ingles y no documenta idiomas.

## Casos de uso

- Triaje de primer nivel en un SOC: ingesta de eventos Sysmon y de seguridad en un pipeline que invoque al modelo en local con Ollama o LM Studio, obteniendo un JSON con veredicto y tecnica MITRE ATT&CK que se pueda volcar directamente a la cola del analista.
- Enriquecimiento de alertas EDR: dado un evento de creacion de proceso con padre anomalo, el modelo produce una justificacion causal (por ejemplo, desviacion respecto a la ruta nativa de ejecucion del binario) y una mitigacion accionable, reduciendo el tiempo de analisis manual.
- Automatizacion de threat hunting sobre volcados historicos: procesamiento por lotes de exportaciones de Sysmon (formato EVTX convertido a texto) para clasificar miles de eventos y priorizar los marcados como Suspicious o Malicious.
- Despliegue en edge-SOC o entornos aislados: al distribuirse en GGUF y requerir 8-10 GB de VRAM en Q4_K_M, puede ejecutarse en estaciones de trabajo sin conectividad a internet, algo critico en redes de planta industrial o entornos clasificados.
- Formacion y entrenamiento de analistas junior: el bloque de pensamiento de cuatro fases sirve como traza explicativa revisable, mostrando como se pasa de la evidencia bruta a la conclusion causal y donde el razonamiento falla.
- Generacion de playbooks de respuesta: los campos `mitigation` y `next_command` pueden alimentar runbooks semi-automaticos, siempre con revision humana previa a la ejecucion de comandos en produccion.
- Apoyo a la elaboracion de informes forenses: la estructura de salida (evidencia tecnica, tecnica MITRE, veredicto) encaja con el formato de una ficha de hallazgo, ahorrando trabajo de redaccion al analista.
- Investigacion de incidentes en endpoints concretos: dado un conjunto acotado de eventos de una maquina comprometida, el modelo ayuda a reconstruir la cadena de ejecucion y a decidir si el comportamiento se corresponde con gestion empresarial legitima (SCCM/RMM) o con TTPs de adversario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna evaluacion especifica de DFIR o deteccion de amenazas, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (los unicos resultados obtenidos correspondian al portal del registro mercantil bulgaro, sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada en la cuantizacion recomendada Q4_K_M: 8-10 GB, segun la propia model card.
- Estimaciones orientativas por cuantizacion para un modelo de 14B (no confirmadas por el autor): Q4_K_M en torno a 9 GB, Q5_K_M en torno a 10-11 GB, Q8_0 en torno a 15 GB y FP16 en torno a 28 GB, mas el overhead de la ventana de contexto, que crece con el numero de tokens en vuelo.
- GPU consumer compatibles: tarjetas con 10-12 GB o mas de VRAM (RTX 3080 12GB, RTX 4070 Ti, RTX 4080, RTX 4090) para Q4_K_M; una RTX 4090 de 24 GB permite Q8_0 o Q6_K con margen. Un modelo de 14B en Q4_K_M no cabe comodamente en GPUs de 8 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S o similares para despliegue concurrente en FP16/BF16 o con mayor longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (mencionados explicitamente por el autor); vLLM y TGI no estan confirmados para este repositorio, que solo publica GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| edelucia/WinEvent-Triage-Reasoner-14B | 14B | no disponible (base: 128K) | Triaje DFIR de eventos Windows y Sysmon con pipeline de 4 fases y salida JSON | Apache 2.0 | GGUF unicamente |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14B | 128K segun su documentacion | Razonamiento general, sin especializacion DFIR ni prompt de sistema impuesto | Apache 2.0 | safetensors y cuantizaciones de la comunidad |
| Modelos instruct generalistas de ~14B (por ejemplo, la familia Qwen2.5-14B-Instruct) | 14B | variable segun variante | Asistente general, codigo y multilingue; sin esquema de salida forense | variable segun variante | safetensors y GGUF |

Nota: no se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y formato de distribucion. Cualquier afirmacion sobre superioridad en deteccion requeriria una evaluacion propia sobre un corpus de eventos etiquetado, que no existe publicamente para este modelo.

## Limitaciones y advertencias

- Ausencia total de validacion publica: 0 descargas, 0 likes y ningun benchmark. No hay evidencia independiente de que el pipeline de cuatro fases reduzca realmente las alucinaciones en produccion.
- Riesgo de alucinacion forense: a pesar de la instruccion explicita de no inventar argumentos de linea de comandos, IPs o claves de registro, se trata de una restriccion por prompt, no de una garantia arquitectonica. Un modelo de 14B puede generar indicadores plausibles pero falsos, especialmente con eventos incompletos.
- Dependencia critica del prompt de sistema: la model card indica que el comportamiento previsto exige usar el prompt exacto proporcionado. Fuera de ese contrato, no hay garantia de que el modelo emita el JSON ni de que respete las cuatro fases.
- Salida JSON no garantizada a nivel de parser: al ser una instruccion en lenguaje natural, existe riesgo de JSON malformado o de texto adicional que rompa la integracion automatica. Se recomienda validacion con un esquema JSON estricto y reintentos.
- Ambito restringido a Windows: el modelo esta especializado en EventID de Windows y Sysmon. No es aplicable a telemetria de Linux, macOS ni a logs de red o cloud.
- Idiomas no declarados: no se especifica que idiomas soporta. Es previsible un rendimiento notablemente peor fuera del ingles, dado que la model card y el prompt de sistema estan en ingles.
- Capacidad de generalizacion desconocida: no se documentan datos de entrenamiento, por lo que no se puede evaluar si el ajuste cubre una variedad amplia de EventID o si esta sobreajustado a un conjunto reducido de escenarios.
- Riesgo operativo del campo `next_command`: ejecutar comandos sugeridos por el modelo sin revision humana en un endpoint en produccion puede alterar evidencia forense o provocar acciones destructivas. Debe tratarse siempre como sugerencia sujeta a validacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. No impone restricciones de uso adicionales, pero tampoco ofrece garantias.
- Inconsistencia de identificacion: el ID del repositorio (WinEvent-Triage-Reasoner-14B) y el titulo de la model card (DFIR-DeepSeek-R1-14B-Reasoning) no coinciden, lo que puede complicar la trazabilidad y las referencias en documentacion interna.
- Clasificacion "Suspicious" por ambiguedad: el propio diseno admite que la falta de contexto (por ejemplo, CommandLine nulo) derive en Suspicious. En volumenes altos, esto puede generar una tasa elevada de falsos positivos sin triaje humano posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edelucia/WinEvent-Triage-Reasoner-14B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Paper, repositorio de codigo, blog o demo del ajuste: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian al portal del registro mercantil de Bulgaria (portal.registryagency.bg) y no guardan relacion con el modelo.
