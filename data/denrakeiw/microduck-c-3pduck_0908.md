# DenRakEiw/microduck-c-3pduck_0908

## Resumen

microduck-c-3pduck_0908 es una politica de aprendizaje por refuerzo (RL) para el robot microduck de Pollen Robotics, publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje ni un modelo generativo: es un controlador de locomocion que ocupa el slot `walk` del robot y produce comandos de accion de forma continua. Segun la model card, se trata de una politica en modo carrera ("race-mode") afinada mediante estrategias de evolucion (evolution strategies) sobre el scorer de colinas de la Arena, con el objetivo declarado de subir una pendiente de 1,5 m.

El modelo consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye como un fichero `policy.onnx` acompanado de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck. El normalizador de observaciones esta embebido en el propio ONNX, por lo que la politica acepta observaciones en crudo. La ejecucion en robot se realiza con el comando `sudo robotctl policy load walk DenRakEiw/microduck-c-3pduck_0908`.

La relevancia de esta ficha es acotada pero concreta: se trata de un artefacto de robótica de muy baja huella computacional, orientado a despliegue en hardware empotrado y a experimentacion en RL aplicado a locomocion. El repositorio no tiene descargas ni likes en el momento de la consulta, la licencia no esta declarada y no se han publicado resultados de benchmarks ni detalles de arquitectura de red, por lo que buena parte de sus especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL para control robótico; red neuronal sin topologia declarada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (politica reactiva; entrada de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en formato ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto JSON (`manifest.json`, esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de politica | `walk` |
| Biblioteca | `microduck` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la topologia de red (capas, funciones de activacion, numero de parametros) ni sobre la funcion de recompensa mas alla de la referencia al "hill scorer" de la Arena. Lo que si documenta la model card es el procedimiento: se parte de una politica de RL que despues se afina mediante estrategias de evolucion (evolution strategies), una tecnica de optimizacion sin gradiente que resulta habitual en control de locomocion porque tolera recompensas ruidosas y no diferenciables. El objetivo declarado es el modo carrera, con una subida de colina de 1,5 m como tarea de referencia.

La politica es de naturaleza perpetua: se ejecuta de forma indefinida hasta que se le indique lo contrario. La observacion se entrega en crudo porque el normalizador esta integrado en el grafo ONNX, lo que elimina una etapa de preprocesado en el lado del despliegue y reduce el riesgo de desajustes entre entrenamiento e inferencia. El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. No se detalla el numero de episodios, la composicion del dataset ni si hubo fases adicionales de ajuste.

## Capacidades

- Locomocion continua del microduck: genera 14 acciones de control a 50 Hz a partir de 61 observaciones, en bucle perpetuo hasta recibir una orden de parada.
- Marcha especializada en el slot `walk`, orientada a desplazamiento sobre terreno con pendiente.
- Afinado especifico para una tarea de carrera (subida de 1,5 m) mediante evolution strategies sobre el scorer de colinas.
- Inferencia sin preprocesado externo: el normalizador de observaciones esta embebido en `policy.onnx`.
- Integracion directa con el daemon de microduck a traves de `robotctl policy load`, sin pasos de conversion intermedios.
- Distribucion en ONNX, lo que permite ejecutar la politica con runtimes ONNX estandar.
- No se documentan capacidades de lenguaje, vision, audio, tool calling ni razonamiento multi-paso: no aplican a este tipo de modelo.

## Casos de uso

- Control de locomocion del microduck en el slot `walk`: la politica ocupa ese slot y se carga con `robotctl policy load walk`, de modo que sustituye la marcha por defecto del robot por una gait afilada para carrera.
- Demostraciones de subida de pendiente: la tarea de referencia (1,5 m en el scorer de la Arena) permite usar el modelo como gait de exhibicion en recorridos con desnivel.
- Banco de pruebas de sim-to-real: al ser un ONNX pequeno y autocontenido, resulta util para medir la brecha entre el rendimiento en simulador y la ejecucion sobre hardware real.
- Baseline en experimentos de RL y evolution strategies: sirve como punto de comparacion frente a otras politicas del mismo repositorio o de la misma tarea, siempre que se documenten las condiciones de evaluacion.
- Docencia e investigacion en robótica empotrada: el par observacion/accion de 61/14 a 50 Hz es un caso de estudio asequible para practicas de control reactivo con RL.
- Despliegue en flota de robots microduck: el formato ONNX mas manifiesto permite distribuir la misma gait a varias unidades y garantizar comportamiento identico entre ellas.
- Actividades de competicion o carreras entre robots: el modo carrera declarado sugiere su uso en pruebas cronometradas sobre circuito con colinas, aunque no se publican metricas de tiempo ni de exito.
- Sustitucion rapida de gait en produccion: al cargarse por slot, se puede alternar entre esta politica y otras sin recompilar el software del robot, lo que facilita pruebas A/B de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica referencia de rendimiento es cualitativa: la model card describe el modelo como una politica de "1.5 m Hill Climb" ajustada sobre el hill scorer de la Arena. No se proporcionan tasas de exito, distancias medias, tiempos, curvas de recompensa ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; no es un modelo de lenguaje y no se documenta un consumo de memoria de GPU. El repositorio ocupa 0,0 GB.
- GPU recomendadas: no disponibles. El tipo de politica (61 entradas, 14 salidas, 50 Hz) no sugiere necesidad de aceleracion por GPU.
- Inferencia en CPU: plausible y coherente con un despliegue empotrado, dado que el bucle de control debe sostener 50 Hz; se trata de una estimacion, no de un dato confirmado por el autor.
- Compatibilidad con GPU de consumo: no disponible y, por el perfil del modelo, no relevante.
- Opciones de despliegue: `robotctl policy load walk DenRakEiw/microduck-c-3pduck_0908` sobre el daemon de microduck; ejecucion ONNX mediante runtimes compatibles con el fichero `policy.onnx`.
- Latencia y throughput: no disponibles. El unico requisito temporal documentado es la frecuencia de control de 50 Hz.
- Dependencia de hardware: el modelo esta atado al microduck y a su interfaz `robotctl`; no se describe su uso en otros robots.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas con las que comparar de forma cuantitativa. El repositorio de entrenamiento `pollen-robotics/microduck_rl` y la propia biblioteca `microduck` albergan presumiblemente otras politicas por slot, pero no se aportan datos de parametros, contexto, rendimiento ni licencia de ninguna de ellas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrar el modelo en un producto.
- Ausencia total de benchmarks: no hay tasas de exito ni metricas de robustez, por lo que el rendimiento real sobre hardware solo puede validarse empiricamente.
- Arquitectura no documentada: se desconoce el numero de parametros y la topologia de red, lo que impide estimar coste de inferencia o margen de optimizacion.
- Riesgo de sobreajuste a la tarea: la politica esta afinada para una subida concreta de 1,5 m en el scorer de la Arena; su comportamiento en pendientes distintas, otras superficies u obstaculos no esta caracterizado.
- Brecha sim-to-real: al proceder de RL en simulacion, es esperable degradacion en el robot fisico (friccion, holguras, latencia del bus) no cuantificada en la informacion.
- Caracter perpetuo: la politica se ejecuta indefinidamente hasta que se le ordene lo contrario; en despliegues desatendidos esto exige mecanismos externos de parada y supervision.
- Dependencia de la plataforma: el uso esta ligado al microduck y a `robotctl`; no se documenta portabilidad a otro hardware o middleware.
- Metadatos de comunidad nulos: 0 descargas y 0 likes, sin historial de validacion por terceros ni issues publicos que respalden su fiabilidad.
- Idiomas y sesgos: no aplica analisis de sesgo linguistico al no ser un modelo de lenguaje, pero tampoco hay evaluacion de sesgos de comportamiento en distintos entornos fisicos.
- Fechas de publicacion inusuales: el repositorio figura como creado el 2026-10-13, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0908
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Los resultados de la busqueda web proporcionada no contienen enlaces relacionados con el modelo (corresponden a foros sin relacion).
