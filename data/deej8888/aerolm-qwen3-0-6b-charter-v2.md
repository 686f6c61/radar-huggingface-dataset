# deej8888/AeroLM-Qwen3-0.6B-charter-v2

## Resumen

AeroLM-Qwen3-0.6B-charter-v2 es un adaptador LoRA experimental desarrollado por el usuario de Hugging Face deej8888 sobre el modelo base Qwen/Qwen3-0.6B. Su funcion es extraer solicitudes de vuelos chárter en texto libre y convertirlas en un esquema JSON estructurado definido por el propio proyecto AeroLM. No se trata de un modelo completo, sino de un adaptador PEFT que requiere el modelo base y el prompt y esquema originales para funcionar correctamente.

El adaptador se entrena exclusivamente con datos sinteticos (2.000 solicitudes ficticias generadas, tres epocas, 750 pasos, aproximadamente 3 horas y 54 minutos en CPU con bfloat16) y emplea un rango LoRA de 16 con 10.092.544 parametros entrenables. La relevancia actual es limitada: se trata de una prueba de concepto de extraccion de informacion en un dominio vertical (aviacion chárter) con un modelo muy pequeno (0,6B), pensado para validar pipelines de datos sinteticos y evaluacion de esquemas mas que para uso operativo.

La model card es explicitamente conservadora: advierte que el adaptador no reserva vuelos, que las etiquetas no han sido revisadas por humanos y que ninguna de las dos muestras de evaluacion establece rendimiento sobre correos reales. La licencia es Apache 2.0 y el unico idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3 0.6B; rango 16 |
| Parametros totales | no disponible (adaptador: 10.092.544 parametros entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3 0.6B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre el modelo base Qwen/Qwen3-0.6B (revision fijada `c1899de289a04d12100db370d81485cdf75e47ca`). El entrenamiento se realizo en CPU con precision bfloat16, durante 750 pasos y tres epocas, sobre 2.000 solicitudes de vuelos chárter ficticias generadas de forma sintetica. El dataset es de dominio publico (CC0) y no contiene datos propietarios de ninguna empresa. Las etiquetas generadas se verificaron de forma programatica, sin revision humana independiente.

No se documenta ningun mecanismo de RLHF, DPO ni innovacion arquitectonica adicional. El adaptador incluye un manifiesto que fija la revision del modelo base y comprueba la compatibilidad con el prompt y el esquema originales de AeroLM. El SHA-256 del adaptador es `1666afd8f0ace070ac46c0a18dae8c9865404d2d432cf00c92af356aa3568a63`.

## Capacidades

- Extraccion de informacion estructurada: convierte solicitudes de vuelos chárter en texto libre a un esquema JSON definido por AeroLM.
- Generacion de JSON valido: la model card reporta 100% de JSON valido en ambas muestras de evaluacion.
- Cumplimiento de esquema: 99% de esquema valido en el conjunto generado y 94% en el conjunto redactado por separado.
- Procesamiento de campos concretos: origen, destino, fechas, horarios y tramos de itinerario, con fallos documentados en itinerarios multi-tramo, transcripcion de codigos de aeropuerto y conversion de medianoche.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido segun la informacion disponible.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de pipelines de extraccion de informacion: el adaptador sirve para validar el esquema JSON de AeroLM y el flujo de prompt antes de invertir en un modelo mayor o en datos reales.
- Generacion de datos sinteticos etiquetados: el metodo de entrenamiento (2.000 solicitudes generadas, verificacion programatica) es replicable para crear datasets de dominio en otros verticales.
- Evaluacion comparativa de baselines: la model card incluye una comparacion contra una baseline de reglas (90,91% F1 y 26/50 exactos en el conjunto de 50 solicitudes), util para medir la ganancia de un enfoque neuronal frente a heuristicas.
- Demostracion de despliegue local en CPU: al entrenarse e inferirse en CPU con bfloat16, permite probar el stack AeroLM en entornos sin GPU.
- Investigacion sobre robustez de esquemas: los fallos documentados (multi-tramo, codigos de aeropuerto, medianoche) sirven como casos de prueba para mejorar validadores y prompts.
- Formacion y docencia: ejemplo compacto de adaptador LoRA de dominio especifico con evaluacion honesta de limitaciones y trazabilidad de artefactos (SHA-256, revision del base, repositorio de codigo).

## Benchmarks y rendimiento

| Conjunto de prueba | Field F1 | JSON valido | Esquema valido | Solicitudes exactas |
|---|---:|---:|---:|---:|
| Test generado (300 solicitudes) | 98,57% | 100% | 99% | 284/300 |
| Test redactado por separado (50 solicitudes) | 92,27% | 100% | 94% | 35/50 |
| Baseline de reglas (50 solicitudes) | 90,91% | no disponible | no disponible | 26/50 |

El conjunto de 300 solicitudes comparte generador y vocabulario con el entrenamiento, por lo que su resultado esta inflado. El conjunto de 50 solicitudes se redacto de forma separada, pero ni sus etiquetas ni las de entrenamiento tienen revision humana independiente. Ninguno de los dos conjuntos establece rendimiento sobre correos reales. Cuando una respuesta falla la validacion de esquema, el evaluador cuenta sus campos esperados como fallidos en lugar de puntuar hechos individuales del JSON invalido.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre Qwen3 0.6B, la huella es la del modelo base mas el adaptador (10,1M parametros entrenables), apta para GPU de consumo.
- GPU recomendadas: no especificadas en la informacion; el entrenamiento se realizo en CPU con bfloat16, lo que sugiere que la inferencia es viable en CPU.
- GPU de consumo: previsiblemente cabe en cualquier GPU consumer moderna, aunque no se aportan cifras concretas.
- Opciones de despliegue: backend `hf` de AeroLM (`AEROLM_BACKEND=hf`, `AEROLM_ADAPTER_PATH` apuntando al directorio del adaptador); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AeroLM-Qwen3-0.6B-charter-v2 | Adaptador LoRA (10,1M entrenables) sobre 0,6B | no disponible | Extraccion JSON en aviacion chárter | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Baseline de reglas de AeroLM | no aplica | no aplica | Heuristicas sobre texto | no disponible | Repositorio GitHub del proyecto |

No se dispone de informacion sobre otros adaptadores comparables de extraccion de informacion en aviacion. La comparativa con modelos generalistas de mayor tamano no es significativa porque el adaptador esta especializado en un esquema concreto.

## Limitaciones y advertencias

- Datos exclusivamente sinteticos: el entrenamiento usa 2.000 solicitudes generadas; no hay evidencia de rendimiento sobre correos o solicitudes reales.
- Etiquetas sin revision humana: la verificacion fue programatica, lo que puede propagar errores sistematicos del generador.
- Sesgo de vocabulario: el conjunto de 300 solicitudes comparte generador y vocabulario con el entrenamiento, por lo que el 98,57% de F1 no es representativo.
- Fallos documentados: itinerarios multi-tramo, transcripcion de codigos de aeropuerto y conversion de medianoche.
- Riesgo de alucinacion: no se ha medido de forma independiente; la validez de esquema no garantiza veracidad de los datos extraidos.
- Ambito limitado: el adaptador no reserva vuelos y requiere el prompt y esquema originales de AeroLM; no funciona como modelo autonomo.
- Idioma: solo ingles declarado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la model card califica el software como de investigacion y advierte que las referencias a aeropuertos pueden estar incompletas o desactualizadas.
- Advertencia operativa: la coincidencia de fuente, la validez de esquema y las comprobaciones de referencia no establecen verdad, disponibilidad aeroportuaria, idoneidad operativa ni seguridad de vuelo.

## Enlaces

- Hugging Face: https://huggingface.co/deej8888/AeroLM-Qwen3-0.6B-charter-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto (codigo, metodologia y predicciones crudas): https://github.com/deej8888/AviationLM
