# caveman-so/trim-1

## Resumen

trim-1 es un modelo extractivo de compresion de contexto desarrollado por caveman-so (equipo de Caveman). No es una red neuronal: es un conjunto de 712 arboles de boosting de gradiente (LightGBM) que ocupa 1,2 MB y decide, dada una consulta y un contexto (resultado de herramienta, fichero, log o conversacion larga), que lineas del contexto necesita un agente de IA para esa consulta concreta. Devuelve las lineas originales en su orden original, con una marca corta donde se han eliminado fragmentos, sin reescribir ni resumir ninguna linea. Esto garantiza que identificadores, rutas y mensajes de error lleguen literalmente iguales.

El modelo resuelve un problema economico y operativo muy concreto: el coste en tokens de alimentar agentes con contextos largos. Su mayor ahorro se produce en recuperacion sobre documentos largos, donde elimina cerca del 89% de los tokens conservando la evidencia de soporte en el 94,4% de los casos (punto de operacion `balanced`). En salidas cortas de herramientas de agentes de codigo el ahorro es deliberadamente bajo (1,9%), porque esas lineas suelen ser densas en informacion util.

Es relevante ahora porque se ejecuta en milisegundos sobre un solo nucleo de CPU, sin GPU ni llamada de red, es determinista (misma entrada, misma salida) y falla cerrado: si la consulta esta vacia, el contexto es menor de 2.000 bytes, supera 8 MiB o 200.000 lineas, o el recorte eliminaria menos del 10% de los bytes, devuelve el contexto sin tocar. trim-1 es el modelo que hay dentro de Caveman, la herramienta de compresion de salida para agentes de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 712 arboles de boosting de gradiente (LightGBM); no es una red neuronal |
| Parametros totales | no disponible (1,2 MB de artefacto, 712 arboles) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no aplica como ventana de tokens; limites operativos: devuelve la entrada sin cambios si el contexto tiene menos de 2.000 bytes, mas de 8 MiB o mas de 200.000 lineas |
| Tipos de cuantizacion | no disponible (no aplica a un modelo de arboles de 1,2 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo en HuggingFace: 0,0 GB) |

## Arquitectura y entrenamiento

trim-1 no es un transformer ni un modelo generativo. El pipeline es el siguiente: el contexto se divide en lineas; a cada linea se le calculan 67 caracteristicas numericas respecto a la consulta, agrupadas en cuatro familias. La primera es coincidencia lexica: BM25 contra la consulta, cobertura de terminos de la consulta, bigramas y trigramas compartidos y aciertos de identificadores compuestos. La segunda es el tipo de linea: si lee como error, resultado de test, ruta, encabezado, cabecera de diff, firma de funcion, clave JSON o frame de pila. La tercera es posicion y forma: donde esta la linea, su longitud, su indentacion y como cambia esa indentacion. La cuarta son los vecinos: como puntuan las lineas contiguas y el encabezado que la engloba.

Los arboles convierten cada fila de caracteristicas en una probabilidad de conservacion. Un punto de operacion traduce esas probabilidades en una seleccion: conserva toda linea que puntue por encima de una fraccion de la mejor linea, las primeras lineas independientemente de su puntuacion, una linea de contexto a cada lado y el encabezado del bloque contenedor. Se distribuyen tres puntos de operacion: `conservative` (umbral 0,0035, recorta menos), `balanced` (0,008, por defecto) y `aggressive` (0,035, recorta mas).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La model card solo indica que los puntos de operacion se eligieron sobre splits de desarrollo y que el holdout se puntuo una unica vez (ejecucion del 11 de octubre de 2026) sobre suites publicas congeladas.

## Capacidades

- Compresion extractiva de contexto: selecciona lineas relevantes para una consulta y descarta el resto, sin reescribir ni resumir.
- Preservacion literal: cada linea conservada es una linea del original, con lo que identificadores, rutas, codigo y texto de error se mantienen intactos.
- Deteccion de tipos de linea: errores, resultados de test, rutas, encabezados, cabeceras de diff, firmas de funcion, claves JSON y frames de pila.
- Puntuacion lexica contra la consulta mediante BM25, cobertura de terminos, bigramas, trigramas e identificadores compuestos.
- Funcionamiento determinista: sin muestreo ni aleatoriedad; misma entrada, misma salida.
- Ejecucion en CPU: milisegundos por llamada en un solo nucleo, sin GPU y sin llamada de red.
- Fallo cerrado: devuelve el contexto sin cambios en los supuestos descritos en las especificaciones.
- Integracion con agentes: pensado para resultados de herramientas de agentes de codigo, ficheros, logs y conversaciones largas.
- No soporta tool calling ni function calling (es un modelo de ranking/extraccion, no generativo).
- No soporta agentes ni razonamiento multi-paso por si mismo; es una pieza dentro de un agente mayor.
- Idiomas: la unica lengua declarada es el ingles.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Compresion de contexto en agentes de codigo: situado sobre las salidas de herramientas (lecturas de fichero, ejecuciones de test, salidas de compilacion), trim-1 elimina las lineas que el agente no va a usar en los siguientes turnos. En el punto `balanced` mantiene el 100% de las cadenas que el agente acabo usando y recorta un 1,9% de tokens; el ahorro es pequeno por diseno, pero se obtiene sin perdida de evidencia.
- Recuperacion sobre documentos largos: es el escenario objetivo. Con contextos de 8k a 32k tokens y el punto `balanced`, elimina el 88,9% de los tokens conservando los hechos de soporte en el 94,4% de los casos. Un modelo lector responde correctamente al 85,6% de las preguntas desde la salida comprimida, frente al 88,9% con el documento completo.
- Reduccion de coste en pipelines RAG: antes de enviar el codigo recuperado a un modelo generativo, trim-1 recorta un 21,8% de tokens en `balanced` conservando las lineas que toca el parche de referencia en el 90,7% de los casos. Es util cuando el presupuesto de tokens es la restriccion dominante.
- Analisis de logs y diagnostico: en escenarios de tipo haystack (10k-50k tokens) con hechos de uno a tres saltos enterrados en logs, JSON, codigo y prosa, recorta un 54,4% de tokens y conserva la evidencia en el 75,0% de los casos. Adecuado como paso previo a un modelo lector, con la advertencia de que el `aggressive` degrada mucho (48,3% de respuestas correctas frente a 91,7% con el contexto completo).
- QA multi-hop sobre corpus largos: con 90 casos de 8k a 32k tokens, mantiene los hechos anotados por humanos en el 94,4% de los casos y recorta un 88,9%. Sirve para reducir el contexto que se envia a un modelo lector en sistemas de pregunta-respuesta sobre documentacion tecnica.
- Preprocesado en entornos sin GPU: al ejecutarse en un nucleo de CPU con 24-39 MB de RSS y latencias de 1,1 ms a 63 ms para entradas de 700 a 60.000 tokens, encaja en runners de CI/CD, contenedores ligeros y maquinas de desarrollo sin acelerador.
- Filtrado de contexto en asistentes de chat largos: dada una conversacion extensa y la pregunta actual, conserva las lineas relevantes y marca las eliminadas, reduciendo el contexto enviado al modelo generativo sin reescribir nada del historial.
- Proxy o pasarela de compresion: al no requerir red ni GPU y ser determinista, puede desplegarse como componente local dentro de un proxy que intercepte y comprima las peticiones antes de reenviarlas a un proveedor de modelos.

## Benchmarks y rendimiento

Datos de una unica ejecucion (11 de octubre de 2026) sobre splits de holdout congelados de suites publicas. Los puntos de operacion se eligieron sobre splits de desarrollo y el holdout se puntuo una sola vez. Se reproduce la informacion disponible.

Evidencia conservada: un caso pasa cuando toda la evidencia etiquetada sigue presente en la salida. El recorte es la proporcion de tokens eliminados (`cl100k_base`, contado en local).

| Suite | Casos | Que debe sobrevivir | Punto | Tasa de exito | Recorte de tokens |
|---|---:|---|---|---:|---:|
| agent traces | 200 | cadenas que un agente de codigo uso en sus siguientes turnos | balanced | 100,0% | 1,9% |
| code context | 150 | lineas que edita el parche de referencia, dentro de codigo recuperado | balanced | 90,7% | 21,8% |
| code context | 150 | (misma condicion) | aggressive | 56,7% | 66,9% |
| multi-hop QA | 300 | hechos de soporte marcados por humanos | balanced | 100,0% | 1,7% |
| multi-hop QA, largo (8k-32k tokens) | 90 | (misma condicion) | balanced | 94,4% | 88,9% |
| haystack (10k-50k tokens) | 60 | hechos de 1-3 saltos en logs, JSON, codigo y prosa | balanced | 75,0% | 54,4% |

Respuestas conservadas: un modelo lector responde a partir de la salida y un modelo juez puntua la respuesta. "Full" es el lector con el contexto sin comprimir.

| Suite | Casos | Full | balanced | aggressive |
|---|---:|---:|---:|---:|
| agent traces | 100 | 100% | 99% | 98% |
| multi-hop QA, largo | 90 | 88,9% | 85,6% | 76,7% |
| multi-hop QA | 100 | 85,0% | 85,0% | 77,0% |
| haystack | 60 | 91,7% | 70,0% | 48,3% |

Velocidad y memoria: diez entradas reales por tamano, una llamada cada vez tras un calentamiento, en un solo nucleo de CPU mientras habia otros trabajos en la maquina.

| Tokens de entrada | Latencia p50 | Memoria (RSS) |
|---:|---:|---:|
| 700 | 1,1 ms | 24 MB |
| 5.000 | 7,2 ms | 28 MB |
| 20.000 | 22 ms | 31 MB |
| 60.000 | 63 ms | 39 MB |

Puntos de operacion disponibles:

| Punto | Umbral (fraccion de la mejor puntuacion) | Uso |
|---|---:|---|
| `conservative` | 0,0035 | recorta menos |
| `balanced` (por defecto) | 0,008 | ajuste por defecto |
| `aggressive` | 0,035 | recorta mas |

Compromiso entre recorte y calidad segun el tipo de contexto:

| Contexto | Ajuste | Recorte de tokens | Evidencia conservada |
|---|---|---:|---:|
| salidas de herramientas de agentes de codigo | `balanced` | 1,9% | 100,0% |
| salidas de herramientas de agentes de codigo | umbral 0,06 (entre `balanced` y `aggressive`) | 27,1% | 92,0% |
| codigo recuperado | `balanced` | 21,8% | 90,7% |
| codigo recuperado | `aggressive` | 66,9% | 56,7% |
| documentos largos (8k-32k tokens) | `balanced` | 88,9% | 94,4% |

No hay datos de MMLU, HumanEval ni GSM8K, porque trim-1 no es un modelo generativo y no se evalua con esas metricas.

## Requisitos de hardware

- VRAM: no aplica. El modelo no usa GPU.
- CPU: un unico nucleo es suficiente.
- Memoria RAM: aproximadamente 24 MB de RSS con entradas de 700 tokens; 28 MB con 5.000; 31 MB con 20.000; 39 MB con 60.000.
- GPU recomendadas: ninguna. No requiere acelerador.
- Compatibilidad con GPU de consumo: irrelevante, al no necesitar GPU; cabe en cualquier maquina capaz de ejecutar el proceso.
- Latencia: p50 de 1,1 ms para 700 tokens, 7,2 ms para 5.000, 22 ms para 20.000 y 63 ms para 60.000 tokens de entrada (medida en un nucleo con otros trabajos en la maquina).
- Throughput: no disponible; no se publican cifras de llamadas por segundo.
- Opciones de despliegue: integrado en Caveman (`npx @caveman-ai/cli` en la version 4.0.0) y en el repositorio `caveman-ai/trim-1`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de arboles.
- Red: no requiere llamada de red para inferir.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible modelos comparables de compresion de contexto extractiva basada en arboles de boosting de gradiente con caracteristicas declaradas, puntos de operacion y cifras de holdout equiparables. La comparativa con alternativas como compresores de prompt neuronales, recuperadores densos o tecnicas de resumen generativo no esta disponible con datos verificables en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trim-1 | 712 arboles (1,2 MB) | limites operativos: 2.000 bytes a 8 MiB | 94,4% de evidencia conservada y 88,9% de recorte en documentos largos (balanced) | Apache 2.0 | HuggingFace y Caveman |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un recorte irreversible: cada linea eliminada deja de estar disponible para el modelo posterior. Un ajuste mas agresivo ahorra mas tokens y pierde mas informacion.
- En salidas de herramientas de agentes de codigo el ahorro es muy bajo por diseno (1,9% en `balanced`). Forzar un recorte del 27,1% hace que el 8% de los casos pierdan algo que el agente acabo usando.
- El punto `aggressive` degrada la calidad de forma notable: en codigo recuperado mantiene la evidencia en el 56,7% de los casos (frente al 90,7% de `balanced`) y en haystack baja las respuestas correctas al 48,3% (frente al 91,7% con el contexto completo).
- En escenarios de tipo haystack con `balanced`, la tasa de evidencia conservada es del 75,0%, la mas baja de las suites publicadas para ese punto.
- Solo declara soporte de ingles. No hay informacion sobre su comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion: no aplica al propio modelo, porque es extractivo y nunca reescribe ni resume lineas. El riesgo de perdida esta en la omision de lineas relevantes.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia. Consultar el texto completo de la licencia para el detalle.
- El aviso de compresion es una linea marcadora, no un resumen; los consumidores del contexto deben estar preparados para encontrar huecos entre lineas.
- Los resultados publicados proceden de una unica ejecucion sobre splits de holdout congelados; no hay replicaciones independientes en la informacion disponible.
- La seccion de limitaciones de la model card original estaba truncada en la informacion proporcionada, por lo que pueden existir advertencias adicionales del autor no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caveman-so/trim-1
- Sitio de Caveman: https://caveman.so/
- Producto Caveman (compresion de salida para Claude Code y mas de 30 agentes): https://caveman.so/products/caveman
- Repositorio Caveman: https://github.com/JuliusBrussee/caveman
- Releases de Caveman: https://github.com/JuliusBrussee/caveman/releases
- Codigo de trim-1: https://github.com/caveman-ai/trim-1
- Registro en Caveman Cloud: https://app.caveman.so/signup
