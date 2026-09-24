# Recharge23/FastWAM-single

## Resumen

FastWAM-single es un repositorio del usuario Recharge23 destinado a alojar el ajuste fino de cinco politicas independientes para el brazo robotico Franka (tareas Task4, Task6, Task7, Task8 y Task9), partiendo de un mismo checkpoint publicado de Fast-WAM. El pipeline declarado en HuggingFace es "robotics" y las etiquetas del repositorio son robotics, fastwam, franka y lora. En el momento de redactar esta ficha no se ha publicado ningun peso ajustado: el repositorio es un espacio de preparacion en el que se documentan el plan de entrenamiento, los identificadores exactos del modelo base y las condiciones de comparabilidad.

El punto de partida es `libero_uncond_2cam224.pt`, del repositorio yuanty/fastwam, en la revision `8eaceeb24c3cc92ff2a9c9a9d266a4941b836705`. Se trata de la variante Fast-WAM Base (no la variante opcional IDM) y ya esta entrenada sobre LIBERO, por lo que el autor advierte explicitamente que estos experimentos no deben describirse como un entrenamiento desde una inicializacion general solo de video. Cada politica se planifica con 5.000 actualizaciones de optimizador, salvo LingBot Task4, que mantiene un objetivo de 15.000 pasos.

La relevancia de este repositorio es fundamentalmente metodologica: fija controles estrictos (mismas demostraciones, divisiones de episodios congeladas, ventanas de accion, prompts, base temporal de 15 Hz, horizonte de 32 acciones, semilla unica 42 y batch global 8) para que las comparaciones entre especialistas sean trazables. Toda la informacion disponible es de planificacion; no hay resultados de entrenamiento, benchmarks ni validacion fisica publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast-WAM, variante Base (no la variante opcional IDM); detalle de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (es un modelo de politica robotica; la guia de carga e inferencia se publicara en ingles) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch `.pt` para el modelo base (`libero_uncond_2cam224.pt`); los checkpoints o adaptadores por tarea se distribuiran en directorios `task_N/`, con formato final aun no confirmado |
| Entradas del modelo base | Dos vistas de camara a 224 px, 7 coordenadas de accion, 8 coordenadas de propiocepcion |
| Entradas de las tareas GELLO | Una sola camara; objetivos JAM pose10 |
| Frecuencia de control | 15 Hz |
| Horizonte de acciones | 32 acciones |
| Tareas cubiertas | Task4, Task6, Task7, Task8, Task9 (una politica independiente por tarea) |
| Datos de ajuste | 45 demostraciones de entrenamiento y 5 de validacion por tarea |
| Presupuesto de entrenamiento | 5.000 actualizaciones de optimizador por politica (Task4 de LingBot: 15.000 pasos) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo base como Fast-WAM en su variante Base, procedente del repositorio oficial `yuantianyuan01/FastWAM`, fijado al commit `7faa71108368fbb3b6885649f112af607427a2d4`. Se conserva la supervision nativa de video y accion de Fast-WAM, asi como la inferencia solo de accion. No se detallan en la model card el numero de parametros, la profundidad de la red, el mecanismo de atencion ni el volumen de datos de preentrenamiento. El base ya fue entrenado sobre LIBERO, de modo que el ajuste que se describe es un ajuste fino de una politica ya especializada en manipulacion, no un entrenamiento desde cero.

El plan experimental define controles comunes a todas las tareas: las mismas demostraciones, divisiones de episodios congeladas, ventanas exactas de objetivo de accion, los mismos prompts, base temporal de 15 Hz, horizonte de 32 acciones, estadisticas de normalizacion calculadas solo con datos de entrenamiento, batch global de 8 y una unica semilla de entrenamiento (42). Task4 utiliza su revision congelada de datos JAM, mientras que las tareas 6 a 9 usan la revision de dataset `0685cc7194a817d22d958e494cd35120aa7effa3`. El autor senala que el presupuesto de 5.000 actualizaciones difiere del usado por los especialistas JAM, por lo que cualquier comparacion debe declarar esa diferencia, la inicializacion, la adaptacion de representacion y el objetivo nativo. Tambien advierte que completar un entrenamiento no demuestra exito fisico en la tarea.

La adaptacion de representacion es un punto abierto: el modelo liberado consume dos vistas de camara, 7 coordenadas de accion y 8 de propiocepcion, mientras que las tareas GELLO aportan una sola camara y objetivos JAM pose10. La release final documentara y probara la adaptacion de entrada y salida necesaria; la implementacion, el throughput y la compatibilidad final de inferencia no estan validados.

## Capacidades

- Ejecucion de politicas de manipulacion robotica de tarea unica sobre un brazo Franka, con una politica independiente por tarea.
- Inferencia solo de accion, heredada del objetivo nativo de Fast-WAM.
- Supervision de video y accion durante el entrenamiento, en la formulacion nativa de Fast-WAM.
- Ajuste mediante adaptadores o checkpoints por tarea; las etiquetas del repositorio mencionan LoRA, aunque el formato final no esta confirmado.
- Control con horizonte de 32 acciones y base temporal de 15 Hz.
- Aprendizaje a partir de un conjunto pequeno de demostraciones: 45 episodios de entrenamiento y 5 de validacion por tarea.
- Integracion con el ecosistema GELLO de teleoperacion y con objetivos JAM pose10 en las tareas previstas.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, function calling ni razonamiento multi-paso. No es un modelo de lenguaje.
- No se documentan capacidades multilingues.
- No se documenta ningun modo especial de inferencia (thinking, audio u otros).

## Casos de uso

- Reproduccion de experimentos de ajuste fino en robotica: el repositorio fija revisiones, checksums, semilla y configuracion, lo que permite replicar el entrenamiento de cada politica y auditar diferencias entre ejecuciones.
- Comparacion controlada de presupuestos de entrenamiento: con 5.000 actualizaciones por politica frente a los presupuestos de los especialistas JAM, sirve para estudiar el efecto del numero de pasos sobre el rendimiento en tareas Franka.
- Evaluacion de adaptacion de representacion: las tareas GELLO aportan una camara y objetivos pose10 frente a las dos camaras y 7 coordenadas del base, de modo que el repositorio es un banco de pruebas para medir el coste de esa conversion.
- Estudio de eficiencia de datos en imitacion: con solo 45 demostraciones de entrenamiento y 5 de validacion por tarea, es util para analizar cuanta supervision de demostracion necesita una politica preentrenada sobre LIBERO.
- Analisis de generalizacion entre tareas: al compartir inicializacion y controles, permite comparar Task4, Task6, Task7, Task8 y Task9 y aislar que tareas resultan mas dificiles para la misma base.
- Infraestructura de servido de politicas por tarea: los directorios `task_N/` estan pensados para contener checkpoint o adaptador, estadisticas de normalizacion, prompt y configuracion, lo que facilita cargar la politica correspondiente en un pipeline de evaluacion.
- Docencia y formacion en aprendizaje por imitacion: la documentacion prevista (guia de carga e inferencia en ingles, configuracion exacta, checksums) sirve como ejemplo de release reproducible en robotica.
- Advertencia de uso: el propio autor indica que este repositorio de preparacion no debe usarse para operar un robot. Cualquier uso practico queda condicionado a la publicacion del checkpoint y de la guia de inferencia verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la implementacion, el throughput y la compatibilidad final de inferencia no estan validados, y que un entrenamiento completado no establece exito fisico en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parametros, precision ni tamano de checkpoint.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni de ningun otro servidor de inferencia.
- Restriccion temporal derivada de la base temporal declarada: a 15 Hz, el presupuesto de computo por paso es de aproximadamente 66,7 ms, extremo a extremo, para producir un bloque de hasta 32 acciones.
- Memoria adicional a considerar: inferencia con dos vistas de camara a 224 px en la configuracion del modelo base, o una sola camara en la configuracion GELLO prevista.
- Almacenamiento: el repositorio preve multiples artefactos por tarea (checkpoint o adaptador, normalizacion, prompt, configuracion, checksums y resultados de validacion), aunque no se especifica el tamano total.

## Comparativa con modelos similares

No disponible. La informacion proporcionada solo permite referenciar, dentro de la misma familia, el modelo base yuanty/fastwam (`libero_uncond_2cam224.pt`) y los especialistas JAM mencionados por el autor. No se aportan parametros, contexto, licencia ni cifras de rendimiento de ninguno de ellos que permitan una comparativa cuantitativa.

| Referencia | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Recharge23/FastWAM-single | Repositorio objeto de esta ficha | no disponible | no disponible | no disponible | Solo planificacion, sin pesos |
| yuanty/fastwam (base `libero_uncond_2cam224.pt`) | Inicializacion comun | no disponible | no disponible | no disponible | Publicado en HuggingFace |
| Especialistas JAM | Termino de comparacion citado | no disponible | no disponible | no disponible | No detallado en la informacion disponible |

## Limitaciones y advertencias

- No hay pesos ajustados publicados. El repositorio es de preparacion y el autor indica que el entrenamiento formal comenzara cuando se hayan subido y verificado las cinco entregas de LingBot-VA.
- Prohibicion explicita de uso: "Do not use this preparation-only repository to operate a robot". No debe emplearse para controlar hardware real.
- Licencia no especificada, lo que impide determinar si el uso comercial esta permitido.
- La comparacion con los especialistas JAM no es directa: el presupuesto es de 5.000 actualizaciones frente al esquema de los especialistas, y Task4 de LingBot usa 15.000 pasos.
- La adaptacion de entrada y salida no esta validada: el base usa dos camaras, 7 coordenadas de accion y 8 de propiocepcion, mientras que las tareas GELLO aportan una camara y objetivos JAM pose10.
- Implementacion, throughput y compatibilidad de inferencia sin validar.
- Una unica semilla de entrenamiento (42), lo que limita el analisis de varianza entre ejecuciones.
- Division reducida de datos: 45 demostraciones de entrenamiento y 5 de validacion por tarea, con posible sensibilidad al sobreajuste de cada politica.
- Completar el entrenamiento no demuestra exito fisico en la tarea; la validacion declarada no sustituye a una evaluacion en hardware.
- No hay resultados de benchmarks ni metricas de exito publicadas.
- El modelo base ya fue entrenado sobre LIBERO; los resultados no deben presentarse como aprendizaje desde una inicializacion general solo de video.
- Se desconoce el modelo de sesgos, el riesgo de alucinacion en el sentido linguistico y cualquier limitacion de idioma, dado que no es un modelo de lenguaje.
- Los datos de demostracion, el estado del optimizador y las credenciales permaneceran privados, lo que restringe la reproducibilidad completa del proceso de datos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Recharge23/FastWAM-single
- Repositorio relacionado de entregas LingBot-VA: https://huggingface.co/Recharge23/LingbotVA-single
- Modelo base en HuggingFace: https://huggingface.co/yuanty/fastwam/tree/8eaceeb24c3cc92ff2a9c9a9d266a4941b836705
- Codigo oficial de FastWAM (commit fijado): https://github.com/yuantianyuan01/FastWAM/tree/7faa71108368fbb3b6885649f112af607427a2d4
- Paper o blog oficial de Fast-WAM: no disponible en la informacion proporcionada
- Demos o espacios de prueba: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a portales deportivos sin relacion con el contenido de la ficha.
