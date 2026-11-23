# mjvalder/fs2d-assistant-qwen3.5-4b

## Resumen

fs2d-assistant:qwen3.5-4b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B desarrollado por el usuario mjvalder para actuar como asistente dentro de la interfaz grafica de FrictionSim2D, una aplicacion que configura simulaciones de friccion con LAMMPS sobre materiales bidimensionales. El modelo no es de proposito general: esta especializado en invocar las herramientas de la GUI (configurar barridos de parametros AFM y hoja-sobre-hoja, localizar estructuras y potenciales, consultar bases de datos de materiales y resumir o representar resultados) y nunca escribe ficheros ni lanza trabajos por si mismo; toda accion propuesta requiere confirmacion del usuario.

Tecnicamente es un adaptador LoRA fusionado sobre Qwen3.5-4B, con 4.326.350.848 parametros totales y distribuido en formato GGUF Q4_K_M de 2,8 GB, pensado para ejecutarse localmente con Ollama (version 0.40.7 o superior) con una ventana de contexto configurada de 16k tokens y temperatura 0. El entrenamiento se realizo con Unsloth sobre 6561 conversaciones sinteticas generadas ejecutando las herramientas reales de la GUI, con las respuestas finales redactadas por Qwen3-14B.

Su relevancia reside en el dominio: demuestra como un modelo pequeno de 4B, ajustado con LoRA sobre datos sinteticos de alta calidad y con el esquema de herramientas exacto, puede superar ampliamente al modelo base en una tarea de agente acotada (94,5 % frente a 67,1 % de pass@1 en la evaluacion propia del proyecto) manteniendo latencias de 1,4 s por turno en una unica GPU de gama profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-4B) con ajuste LoRA fusionado |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16k tokens (segun el Modelfile de Ollama) |
| Tipos de cuantizacion | Q4_K_M (unico peso publicado, 2,8 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`model.gguf`), mas `Modelfile` y `manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4,3 mil millones de parametros, sobre el que se aplico un ajuste LoRA con rango 16, alpha 32, tasa de aprendizaje 2e-4 y una sola epoca, usando Unsloth. Los pesos resultantes se fusionaron y se publicaron exclusivamente en GGUF Q4_K_M. El entrenamiento empleo 6561 conversaciones sinteticas (conjunto denominado p8-k) con el modo de razonamiento (thinking) desactivado.

Las conversaciones se generaron ejecutando las herramientas reales de la GUI de FrictionSim2D, de modo que las llamadas a herramientas y sus resultados son coherentes con el esquema real. Las peticiones de usuario y las respuestas finales fueron redactadas por Qwen3-14B (Apache-2.0). Aproximadamente una de cada nueve conversaciones incluye una llamada a herramienta invalida seguida del error devuelto por la herramienta y la llamada corregida, lo que ensena al modelo a recuperarse de fallos; la funcion de perdida cubre unicamente los turnos del asistente y nunca las llamadas invalidas. Se eliminaron del conjunto las peticiones parecidas al conjunto de evaluacion. El modelo se entreno con el mismo system prompt que envia la aplicacion (reglas mas un texto de referencia) y con la lista de herramientas renderizada tal como la produce Ollama, lo que hace critico usar el `Modelfile` proporcionado en lugar de importar el GGUF directamente.

## Capacidades

- Invocacion de herramientas (tool calling) especifica del esquema del asistente de FrictionSim2D: configuracion de ejecuciones AFM y hoja-sobre-hoja, barridos de parametros, busqueda de estructuras y potenciales, consultas a bases de datos de materiales, resumen y representacion grafica de resultados.
- Razonamiento de multiples pasos dentro del flujo de la GUI: encadenar llamadas a herramientas hasta completar una solicitud de configuracion.
- Recuperacion ante errores: reconocer la respuesta de error de una herramienta y emitir una llamada corregida (capacidad reforzada explicitamente en el entrenamiento).
- Solicitud de aclaracion: ante peticiones ambiguas o excesivamente largas, el modelo pregunta de vuelta en lugar de proponer una configuracion incorrecta.
- Declinacion controlada: el conjunto de evaluacion incluye un grupo de peticiones que el modelo debe rechazar (grupo "declines").
- Conocimiento de dominio limitado a ciencia de materiales y tribologia de materiales 2D, segun el texto de referencia del system prompt.
- Generacion de texto conversacional en ingles.
- No soporta vision, audio ni modo thinking (este ultimo se desactivo durante el entrenamiento).

## Casos de uso

- Configuracion asistida de simulaciones de friccion: el usuario describe en lenguaje natural el experimento (por ejemplo, un barrido de cargas normales para un contacto AFM) y el modelo emite las llamadas a herramientas que rellenan los parametros de la GUI, que el usuario revisa y confirma antes de ejecutar.
- Barridos de parametros sobre conjuntos de materiales: el modelo traduce una peticion de barrido (combinaciones de materiales, potenciales y ajustes) en la secuencia de llamadas necesaria, apoyandose en las herramientas de busqueda de estructuras y potenciales.
- Consulta a bases de datos de materiales desde la interfaz: el asistente resuelve preguntas del tipo "que potencial interatomico hay para MoS2" invocando la herramienta de consulta correspondiente y resumiendo la respuesta.
- Analisis y visualizacion de resultados: tras una ejecucion, el modelo invoca las herramientas de resumen y de representacion grafica para producir una vista de los resultados dentro de la GUI.
- Recuperacion guiada de errores de configuracion: gracias al entrenamiento con llamadas invalidas y sus correcciones, el asistente puede reinterpretar el mensaje de error de una herramienta y proponer una llamada corregida, reduciendo la friccion en flujos de configuracion complejos.
- Despliegue local en estaciones de trabajo de laboratorio: con 2,8 GB en Q4_K_M y 16k de contexto, el modelo cabe en GPUs de consumo y permite un asistente sin conexion ni coste por token, adecuado para entornos con datos de investigacion sensibles.
- Docencia y onboarding en simulacion tribologica: el asistente guia a usuarios noveles a traves de la configuracion de LAMMPS sin que estos necesiten conocer la sintaxis de las herramientas.

## Benchmarks y rendimiento

Evaluacion propia del proyecto FrictionSim2D: 74 peticiones guionizadas en diez grupos (setup, analysis, domain knowledge, materials database, materials, workspace, declines, parameters, sweeps y peticiones que deben devolverse como pregunta), puntuadas automaticamente por el estado final que dejan, con tres ejecuciones por peticion, en una unica NVIDIA RTX A4000.

| Metrica | fs2d-assistant:qwen3.5-4b | Qwen/Qwen3.5-4B (mismo prompt) |
|---|---|---|
| pass@1 (73 peticiones nucleares) | 94,5 % | 67,1 % |
| Ejecuciones correctas (todas) | 210/222 | no disponible |
| Tiempo mediano por turno | 1,4 s | no disponible |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor documenta un caso de fallo: una peticion larga y multiparte (cribado AFM de 156 materiales con 14 ajustes en un solo mensaje) no produce propuesta; el modelo pregunta de vuelta y se recomienda dividir la peticion o usar un modelo alojado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con el unico peso publicado (Q4_K_M, 2,8 GB), mas el coste del contexto de 16k tokens.
- GPU recomendadas: NVIDIA RTX A4000 (configuracion usada en la evaluacion oficial), asi como cualquier GPU con 6 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070); con 4 GB el margen es ajustado por el contexto.
- Opciones de despliegue: Ollama 0.40.7 o superior es el unico soportado oficialmente; es imprescindible crear el modelo con el `Modelfile` proporcionado (`ollama create fs2d-assistant:qwen3.5-4b -f qwen3.5-4b/Modelfile`), ya que `ollama pull hf.co/...` construye la plantilla de chat desde el GGUF y no coincide con el formato de entrenamiento. La integracion tambien puede hacerse desde la propia GUI de FrictionSim2D colocando los tres ficheros en `assistant_models/qwen3.5-4b/`.
- Latencia y throughput: 1,4 s de mediana por turno en una RTX A4000 con temperatura 0, segun la evaluacion del autor. No se publican cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fs2d-assistant:qwen3.5-4b | 4,33 B | 16k | Asistente especializado con tool calling para FrictionSim2D | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en la informacion proporcionada | Modelo de proposito general | Apache-2.0 | Hugging Face |
| Qwen3-14B | ~14 B | no disponible en la informacion proporcionada | Modelo de proposito general, usado como generador de datos de entrenamiento | Apache-2.0 | Hugging Face |

La comparacion relevante es con el modelo base: en la evaluacion del proyecto, el ajuste fino eleva el pass@1 del 67,1 % al 94,5 % en la tarea especifica, a costa de perder utilidad como modelo conversacional general. No se dispone de datos para comparar con otros asistentes cientificos especializados.

## Limitaciones y advertencias

- No es un modelo de proposito general: requiere el system prompt del asistente de FrictionSim2D (reglas mas texto de referencia) y las definiciones de herramientas exactas con las que fue entrenado; fuera de ese contexto su comportamiento no esta garantizado.
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- El esquema de herramientas esta acoplado a una version concreta: el `manifest.json` incluye el hash del esquema para el que se entreno, de modo que cambios en las herramientas de la GUI invalidan el modelo.
- Fallo documentado en peticiones largas y multiparte: no genera propuesta y devuelve una pregunta; el autor recomienda dividir la peticion o usar un modelo alojado de mayor tamano.
- Riesgo de alucinacion en conocimiento de dominio: el texto de referencia del system prompt y las bases de datos consultadas son la unica fuente fiable; el modelo puede generar explicaciones plausibles pero incorrectas sobre materiales o potenciales.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con datos sinteticos generados por otro modelo puede heredar sesgos de Qwen3-14B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B; conviene revisar la licencia del modelo base.
- En produccion, la temperatura 0 y el contexto de 16k del `Modelfile` son parte del diseno; modificarlos puede degradar la tasa de acierto observada.
- El modelo nunca ejecuta acciones por si mismo: toda propuesta requiere confirmacion del usuario, lo que limita el riesgo pero tambien impide automatizacion completa del flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjvalder/fs2d-assistant-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de FrictionSim2D: https://github.com/mjvalder/FrictionSim2D
