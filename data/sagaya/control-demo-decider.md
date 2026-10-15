# sagaya/control-demo-decider

## Resumen

`sagaya/control-demo-decider` (v3) es un adaptador LoRA con una cabeza pointer entrenado sobre el modelo base Qwen3.5 0.8B Base, y no un modelo de lenguaje al uso. Su funcion es tomar una decision concreta dentro de un motor de demos automaticas de producto: dado el estado de la pagina que se esta mostrando, el objetivo de la demo y el historial de acciones ya ejecutadas, devolver cual de las acciones ofrecidas corresponde a continuacion ("click e5", "type e2 80", "done", etc.). Lo desarrolla el usuario sagaya como pieza del proyecto Control, que se ejecuta localmente en un Mac.

Tecnicamente sigue la arquitectura Kev: una unica pasada no generativa que produce una probabilidad para cada opcion disponible, en lugar de decodificar texto token a token. El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las capas lineales del base, acompanado de una cabeza pointer (`q`, `k`: 1024 a 256). Se afino a partir de `jaredpalmer/kev-0.8b` con unas 19.800 decisiones extraidas de tareas web generadas, cada una etiquetada por el oraculo de la propia tarea.

Su relevancia practica esta en el patron de cascada: el modelo resuelve por si solo 300 de 328 tareas de validacion en unos 50 ms por decision en Apple silicon con MLX, y cuando su confianza baja del umbral de 0,92 delega en un modelo mayor, lo que eleva el resultado a 317 de 328 tareas. Es, por tanto, un componente especializado de enrutado y control de bajo coste, no un asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5 0.8B Base) con adaptador LoRA y cabeza pointer no generativa, segun la arquitectura Kev |
| Parametros totales | Aproximadamente 0,8 mil millones en el modelo base; el LoRA (r 16, alpha 32) y la cabeza pointer (1024 a 256) anaden un numero de parametros no especificado (tamano de repo 0,0 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter_model.safetensors`, `head.safetensors`, `adapter_config.json`, `decider.json` |
| Modelo base | Qwen/Qwen3.5-0.8B-Base (revision `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`) |
| Modelo de partida del ajuste | jaredpalmer/kev-0.8b |
| Libreria | peft |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 6 / 0 |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

El modelo no genera texto. Sobre el backbone de Qwen3.5 0.8B Base se monta un adaptador LoRA de rango 16 y alpha 32 en todas las capas lineales, mas una cabeza pointer que proyecta consultas y claves de 1024 a 256 dimensiones para puntuar cada opcion candidata. El resultado es una distribucion de probabilidad sobre el conjunto de acciones ofrecidas en ese paso, obtenida en una sola pasada hacia delante. El fichero `decider.json` recoge la configuracion de inferencia: modelo base y revision exacta, escala del LoRA, temperatura ajustada de 1,07, tamano de la cabeza, delimitadores y el umbral de confianza de 0,92 por debajo del cual el sistema delega en un modelo mayor.

El ajuste parte de `jaredpalmer/kev-0.8b` y se realizo sobre aproximadamente 19.800 decisiones procedentes de tareas web generadas, cada una etiquetada por el oraculo de su propia tarea. Para calibrar la confianza se aplicaron suavizado de etiquetas (label smoothing), consistencia de permutacion (permutation consistency) y un ajuste posterior de la temperatura. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion destacable es el propio esquema Kev: decision discriminativa de una sola pasada sobre un conjunto cerrado de opciones, con umbral de confianza explicito para el enrutado en cascada.

## Capacidades

- Seleccion del siguiente paso en una interfaz: dada una pagina, un objetivo y el historial de acciones, elige entre las opciones ofrecidas ("click e5", "type e2 80", "done", etc.).
- Salida discriminativa con probabilidad por opcion, no texto generado; admite comparar alternativas de forma directa.
- Calibracion de confianza con temperatura ajustada (1,07) y umbral operativo de 0,92 para decidir cuando ceder el turno a un modelo mayor.
- Ejecucion local en Apple silicon mediante MLX, sin dependencia de servicios en la nube.
- Integracion como motor de decision del proyecto Control para demos automaticas de producto.
- No soporta tool calling ni function calling en el sentido habitual: su salida es una eleccion entre acciones predefinidas.
- No hay soporte documentado de agentes multi-paso autonomos mas alla de la secuencia de pasos del motor de demo.
- No hay informacion disponible sobre capacidades multilingues, vision, audio ni modo de razonamiento explicito.
- No es un asistente general: el propio autor indica que responde a un unico tipo de pregunta.

## Casos de uso

- Motor de demos automaticas de producto: es su caso de diseno. El modelo recibe la vista de la pagina, el guion de la demo y lo ya ejecutado, y devuelve la siguiente accion; con ~50 ms por decision en Apple silicon permite grabar o reproducir una demo fluida sin intervencion humana.
- Cascada de bajo coste con respaldo de un modelo mayor: por debajo del 0,92 de confianza delega en un modelo de mayor tamano, lo que en la validacion del autor eleva la resolucion de 300 a 317 tareas de 328; util para contener coste manteniendo precision.
- Automatizacion de pruebas de interfaz: encaja como planificador de acciones dentro de suites E2E sobre navegador, eligiendo el siguiente elemento a pulsar o texto a introducir a partir del DOM observado.
- Grabacion de tutoriales y visitas guiadas: integrado en una herramienta de onboarding, puede decidir el orden de acciones sobre la interfaz para generar recorridos guiados reproducibles.
- Etiquetado y filtrado de trayectorias web: dado un registro de sesiones y un objetivo, sirve para anotar cual fue la accion relevante en cada paso y descartar trayectorias ruidosas antes de entrenar otros modelos.
- Enforcement de flujos en aplicaciones internas: en herramientas de back office con un conjunto acotado de acciones, puede sugerir o validar el siguiente paso esperado segun el estado de la pantalla.
- Automatizacion de escritorio y RPA ligera: ejecutable en local sobre un Mac, permite conducir tareas repetitivas sobre interfaces sin enviar datos de pantalla a un servicio externo.
- Enrutado en asistentes de accesibilidad: puede reducir la eleccion del siguiente control operable a partir del contexto de la pantalla y de la intencion declarada por la persona usuaria.

## Benchmarks y rendimiento

Datos publicados en la model card, sobre tareas generadas con semillas reservadas (held-out):

| Configuracion | Tareas resueltas (de 328) | Tiempo por decision |
|---|---|---|
| Este modelo, con un modelo mayor como respaldo por debajo de 0,92 de confianza | 317 | 47-75 ms |
| Este modelo en solitario | 300 | Aproximadamente 50 ms (Apple silicon, MLX) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible. Tampoco se ofrece desglose de precision, recall o calibracion por clase de accion.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los aproximadamente 0,8 mil millones de parametros del base (estimacion, no dato publicado): en BF16/FP16 en torno a 1,6 GB solo de pesos; en 8 bits cerca de 0,8 GB; en 4 bits alrededor de 0,4-0,5 GB. Hay que sumar el adaptador LoRA, la cabeza pointer y el estado de la cache, de tamano no especificado.
- Los tipos de cuantizacion soportados no estan documentados; las cifras anteriores son estimaciones teoricas segun precision, no configuraciones verificadas por el autor.
- GPU: no se documenta ninguna GPU concreta. El caso de referencia publicado es Apple silicon con MLX, donde el modelo completo en solitario ronda los 50 ms por decision. Una RTX 4090 o superior seria sobradamente suficiente para un modelo de este tamano; no hay medidas publicadas en esas plataformas.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM, y en equipos Apple con memoria unificada. No hay validacion publicada fuera de Apple silicon.
- Opciones de despliegue: MLX en Mac segun el autor, y en general PyTorch con PEFT para cargar el LoRA y la cabeza pointer. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y es esperable que no encaje directamente en servidores orientados a decodificacion de tokens, ya que la salida no es generativa.
- Latencia y throughput: 47-75 ms por decision en configuracion de cascada y aproximadamente 50 ms en solitario. No se publica throughput agregado ni latencia en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sagaya/control-demo-decider | ~0,8B + LoRA (r 16) y cabeza pointer | Probabilidad sobre opciones (no generativa) | No disponible | Apache-2.0 | HuggingFace, 6 descargas, 0 likes |
| jaredpalmer/kev-0.8b | ~0,8B | Probabilidad sobre opciones (no generativa) | No disponible | Apache-2.0 | HuggingFace; es el punto de partida del ajuste |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | Texto generado | No disponible | Apache-2.0 | HuggingFace; es el backbone congelado |
| LLM generalista de 0,5-1,5B parametros | Del orden de 0,5-1,5B | Texto generado | No disponible | Variable | No disponible en la informacion proporcionada |

La comparacion directa con alternativas de proposito general no es significativa: control-demo-decider no compite en generacion de texto, sino en seleccion rapida de la siguiente accion sobre un conjunto cerrado de opciones, con una latencia de decenas de milisegundos y un mecanismo de cesion por confianza que un LLM generico no incorpora de serie.

## Limitaciones y advertencias

- No es un asistente general ni un modelo conversacional: solo responde a la pregunta de cual es la siguiente accion entre las ofrecidas.
- No genera texto; cualquier uso que espere decodificacion de tokens requiere otro componente.
- Depende de la revision exacta del modelo base (`dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`); cargarlo sobre otra revision o sobre otro modelo puede invalidar el adaptador.
- El umbral de confianza de 0,92 forma parte del diseno: sin un modelo mayor como respaldo, el rendimiento cae de 317 a 300 tareas resueltas de 328 en la validacion publicada.
- Entrenado con datos sinteticos generados por tareas web y etiquetados por el oraculo de la propia tarea: es previsible un sesgo hacia esa distribucion y una degradacion ante interfaces, idiomas o convenciones no representadas en el conjunto de generacion.
- Riesgo de alucinacion en el sentido de elegir una accion plausible pero incorrecta cuando la confianza queda por encima del umbral; el mecanismo de calibracion mitiga pero no elimina este comportamiento.
- No hay informacion publica sobre idiomas soportados, longitud de contexto, sesgos medidos ni evaluaciones de robustez independientes.
- Cifras de rendimiento muy limitadas: 328 tareas de validacion con semillas reservadas y procedentes del mismo generador que el entrenamiento, sin resultados en entornos reales.
- Uso comercial permitido bajo Apache-2.0, pero deben conservarse los avisos de licencia y atribucion del modelo base (Qwen3.5 0.8B Base, Alibaba Cloud) y de Kev 0.8B (Jared Palmer).
- Repositorio con 6 descargas y 0 likes y actualizado el mismo dia de su creacion: no hay senales de mantenimiento, soporte ni adopcion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sagaya/control-demo-decider
- Proyecto Control (repositorio del autor): https://github.com/sagaya/Control
- Arquitectura Kev (repositorio de Jared Palmer): https://github.com/jaredpalmer/kev
- Modelo base Qwen3.5 0.8B Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo de partida del ajuste, Kev 0.8B: https://huggingface.co/jaredpalmer/kev-0.8b
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada; los resultados obtenidos no guardan relacion con este modelo.
