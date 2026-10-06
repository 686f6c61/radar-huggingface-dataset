# eltonssouza/relay-laya

## Resumen

relay-laya es un modelo clasificador entrenado a partir de Laya (una variante multilingue basada en mmBERT-base) y publicado por el usuario eltonssouza en HuggingFace. No es un modelo generativo de proposito general, sino un componente de enrutamiento: responde a 18 preguntas tipadas sobre una peticion de codigo para que el router `laya/auto` de Relay, un arnes de agente de programacion, pueda seleccionar el modelo mas barato con probabilidad razonable de exito.

El modelo analiza cada solicitud de codigo y extrae campos estructurados como el tipo de tarea, la complejidad, el alcance, el riesgo, el nivel de capacidad y esfuerzo de razonamiento recomendados, el rol del agente, el nivel de validacion, las herramientas necesarias y la sensibilidad de seguridad. Con 321.908.998 parametros y un peso de repositorio de 0,7 GB, es un modelo compacto pensado para ejecutarse como paso previo y de bajo coste dentro de un pipeline mayor.

El entrenamiento se hizo con 1100 ejercicios sinteticos generados por plantillas durante 4 rondas de ajuste fino. La propia model card advierte que la precision del 95-100 % por pregunta en el conjunto de validacion esta inflada, porque los ejemplos de validacion provienen de las mismas plantillas que los de entrenamiento, por lo que cabe esperar un rendimiento inferior en peticiones reales hasta que se reentrene con datos de uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laya (base mmBERT-base); encoder de tipo transformer, detalle completo no disponible |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos; la base es multilingue segun la model card |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Laya multilingue, construida sobre mmBERT-base, y se ha ajustado fino durante 4 rondas. Su funcion es de clasificacion y etiquetado estructurado: dado un enunciado de peticion de codigo, produce respuestas tipadas a 18 preguntas (tipo de tarea, complejidad, alcance, riesgo, nivel de capacidad recomendado, esfuerzo de razonamiento, rol del agente, nivel de validacion, herramientas necesarias y sensibilidad de seguridad, entre otras).

Los datos de entrenamiento consisten en 1100 ejercicios sinteticos generados mediante plantillas. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero de tokens de entrenamiento, ni la composicion detallada del dataset mas alla de su origen sintetico. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor advierte explicitamente que la alta precision en el conjunto de validacion es un artefacto de compartir plantillas con el entrenamiento.

## Capacidades

- Clasificacion y enrutamiento: responde a 18 preguntas tipadas sobre una peticion de codigo para decidir que modelo usar.
- Extraccion de metadatos de la tarea: tipo de tarea, complejidad, alcance y riesgo.
- Recomendacion de recursos: nivel de capacidad y esfuerzo de razonamiento sugeridos para la peticion.
- Asignacion de rol de agente y nivel de validacion.
- Deteccion de herramientas necesarias para completar la tarea.
- Evaluacion de sensibilidad de seguridad sobre la peticion.
- Capacidad multilingue heredada de la base mmBERT-base (idiomas concretos no disponibles).
- No es un modelo generativo de texto libre ni un modelo de codigo; no se documentan capacidades de tool calling, vision, audio ni modo de razonamiento.

## Casos de uso

- Enrutamiento de coste en un arnes de agente: Relay usa relay-laya como primer paso para elegir el modelo mas barato que probablemente resuelva la peticion, reduciendo el gasto por consulta en produccion.
- Clasificacion previa de solicitudes de codigo: el modelo etiqueta cada peticion con su tipo, complejidad y alcance antes de que un modelo mayor la procese.
- Politicas de escalado por riesgo: al identificar el riesgo y la sensibilidad de seguridad de una peticion, permite derivar tareas delicadas a modelos o flujos con controles mas estrictos.
- Estimacion de esfuerzo de razonamiento: su salida sobre el esfuerzo recomendado sirve para decidir entre un modelo rapido y uno con modo de razonamiento extendido.
- Asignacion de rol de agente: en arquitecturas multiagente, permite decidir si la tarea corresponde a un rol de planificacion, ejecucion o validacion.
- Determinacion de herramientas necesarias: la prediccion de herramientas requeridas ayuda a precargar o habilitar capacidades concretas antes de ejecutar.
- Filtrado y priorizacion de colas de trabajo: en un backlog de tareas de codigo, clasificar por complejidad y validacion ayuda a ordenar la ejecucion.
- Validacion previa de sensibilidad de seguridad: como paso de triaje para marcar peticiones que requieren revision adicional.

## Benchmarks y rendimiento

| Metrica | Resultado | Nota |
|---|---|---|
| Precision en preguntas del conjunto de validacion | 95-100 % por pregunta | Inflada: los ejemplos de validacion usan las mismas plantillas que el entrenamiento |
| Precision en peticiones reales | no disponible | El autor indica que sera inferior hasta reentrenar con datos reales |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es coherente con que se trata de un clasificador de enrutamiento y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321.908.998 parametros, aproximadamente 1,3 GB en FP32, 0,64 GB en FP16 y del orden de 0,3-0,4 GB en cuantizacion de 8 bits (los tipos de cuantizacion soportados no estan documentados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; se trata de un modelo que cabe sobradamente en tarjetas de consumo.
- Consumer GPU: si, cabe en practicamente cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en muchos entornos integrados.
- Opciones de despliegue: la model card indica que requiere el paquete Python `laya` en version 0.3.27 para cargarse; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Nota operativa: Relay descarga los archivos en el primer uso mediante `/laya setup` y verifica cada uno contra un sha256 fijado en su paquete, por lo que no es necesario descargarlos manualmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relay-laya | 321.908.998 | no disponible | Clasificador de enrutamiento para peticiones de codigo | MIT | HuggingFace (`eltonssouza/relay-laya`) |
| no disponible | - | - | - | - | - |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (clasificadores de enrutamiento especificos para arneses de agentes de codigo) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sobreajuste a plantillas: el entrenamiento usa 1100 ejercicios sinteticos generados por plantillas, y el conjunto de validacion procede de las mismas plantillas, por lo que la precision real en peticiones de usuarios sera previsiblemente inferior a la reportada. El propio autor lo advierte.
- Datos escasos: 15 descargas y 0 likes en HuggingFace; no hay evidencia de adopcion ni de validacion externa.
- Conjunto de entrenamiento reducido y sintetico: 1100 ejercicios y 4 rondas de ajuste fino limitan la cobertura de casos reales.
- Posible necesidad de reentrenamiento: el autor indica que deberia reentrenarse con datos de uso real para mejorar la precision.
- Dependencia de libreria: requiere el paquete `laya` version 0.3.27, lo que ata su uso a ese ecosistema.
- Idiomas e contexto no documentados: no se especifica la lista de idiomas soportados ni la longitud de contexto, lo que dificulta evaluar su comportamiento con entradas largas o en idiomas concretos.
- Riesgo de clasificacion erronea: al tratarse de un router, un error puede derivar la peticion a un modelo demasiado barato (fallo de tarea) o demasiado caro (sobrecoste).
- Idoneidad para produccion: debe validarse con datos reales antes de confiar en sus predicciones; la licencia MIT no impone restricciones al uso comercial, pero no hay garantias de calidad.
- Sesgos: no disponibles; no se documenta analisis de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eltonssouza/relay-laya
- Repositorio de Laya: https://github.com/NandhaKishorM/laya
- Proyecto Relay (arnes de agente que consume el modelo): no disponible como enlace directo en la informacion proporcionada
- Paquete Python `laya` (version 0.3.27): no disponible como enlace directo en la informacion proporcionada
- Paper de mmBERT (base del modelo): no disponible en la informacion proporcionada
