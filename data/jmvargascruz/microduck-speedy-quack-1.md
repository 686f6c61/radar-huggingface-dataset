# jmvargascruz/microduck-speedy-quack-1

## Resumen

Speedy Quack 1 es una politica de control para el robot microduck, desarrollado por Pollen Robotics, publicada por el usuario jmvargascruz en HuggingFace. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de una politica de aprendizaje por refuerzo (reinforcement learning) exportada a ONNX que se ejecuta en bucle sobre el robot. Concretamente, es una politica de tipo "perpetuo": una vez cargada, genera de forma continua una marcha (gait) hasta que se le indique lo contrario, sin condicion de parada interna.

El modelo consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz, es decir, un ciclo de decision cada 20 ms. El normalizador de observaciones esta integrado dentro del propio fichero `policy.onnx`, de modo que la politica acepta observaciones en crudo sin preprocesado externo. El repositorio tiene un tamano declarado de 0.0 GB, lo que confirma que se trata de un artefacto de muy baja huella, pensado para ejecutarse en el computo embarcado del robot y no en un servidor.

La relevancia de esta ficha es acotada pero concreta: se enmarca en el ecosistema de politicas ligeras y desplegables en robot de bajo coste, donde el interes no esta en el rendimiento en benchmarks de NLP, sino en la reproducibilidad del entrenamiento, la compatibilidad del manifiesto y la capacidad de cargar una politica en un slot del daemon `robotctl` con un solo comando. No se dispone de informacion sobre licencia, idiomas ni especificaciones de entrenamiento mas alla del repositorio y el commit indicados.

Es importante senalar que la busqueda web asociada a este modelo no devolvio ningun resultado relacionado: los resultados obtenidos corresponden a contenido turistico sobre el castillo de Walmer (Reino Unido) y no guardan ninguna relacion con el modelo. Por tanto, toda la informacion tecnica de esta ficha procede exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo exportada a ONNX; no se especifica la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` (schema 2 del manifiesto de politicas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz (20 ms por ciclo) |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | `microduck` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red mas alla del contrato de entrada y salida: 61 valores de observacion como entrada y 14 valores de accion como salida, con una frecuencia de control de 50 Hz. Al ser una exportacion a ONNX, la politica se ejecuta mediante un runtime ONNX y no requiere el framework de entrenamiento original en el momento del despliegue. El normalizador de observaciones esta embebido en `policy.onnx`, lo que implica que la red incorpora internamente la transformacion de las observaciones crudas y que el bucle de control puede alimentarla directamente.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, en la rama `main` y con el commit `a3e0c0fbe`. No se especifican en la informacion disponible el numero de pasos de entorno, la composicion del dataset, la funcion de recompensa, ni si se emplearon tecnicas de ajuste posteriores como RLHF o DPO (que, por otra parte, no son habituales en el aprendizaje por refuerzo clasico de robotica). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal, que no aplican al tipo de modelo.

Un aspecto operativo relevante es el uso del manifiesto `manifest.json`, que sigue el schema 2 del manifiesto de politicas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon. Esto implica que la politica es intercambiable y cargable en un slot del sistema, lo que favorece la reproducibilidad y el versionado de politicas sobre el mismo robot.

## Capacidades

- Control de locomocion continua del robot microduck mediante una politica perpetua, sin condicion de terminacion propia.
- Generacion de una marcha (gait) estable que se mantiene hasta que el operador o el daemon la detienen.
- Procesamiento de observaciones crudas de 61 dimensiones sin preprocesado externo, gracias al normalizador integrado en el ONNX.
- Emision de 14 acciones de control a 50 Hz, adecuada para bucles de control en tiempo real.
- Carga e integracion en el daemon del robot mediante el comando `robotctl policy load <slot> <repo>`.
- Distribucion en formato ONNX, lo que permite inferencia portable en CPU sin dependencia del framework de entrenamiento.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Marcha por defecto del microduck en demostraciones: cargar la politica en un slot con `robotctl` y dejar que el robot camine de forma continua durante una sesion de exhibicion, sin necesidad de reenviar comandos de movimiento.
- Pruebas de banco de actuadores y estructura mecanica: al ser una politica perpetua de 50 Hz, permite someter al robot a ciclos largos de marcha para evaluar calentamiento, desgaste y consumo de bateria.
- Base de comparacion para nuevas politicas: sirve como referencia funcional para medir si una politica entrenada posteriormente mejora la estabilidad o el consumo respecto a Speedy Quack 1 en el mismo hardware.
- Recogida de datos en bucle cerrado: ejecutar la politica de forma continua mientras se registran observaciones y acciones para construir datasets de comportamiento o para analisis posteriores de la marcha.
- Validacion del pipeline de despliegue ONNX: al ser un artefacto minimo con manifiesto schema 2, es util para verificar que el flujo de `robotctl policy load` y el runtime ONNX funcionan correctamente antes de desplegar politicas de mayor complejidad.
- Demostraciones educativas de aprendizaje por refuerzo aplicado a robotica: el modelo permite ilustrar el ciclo completo entrenamiento en `microduck_rl`, exportacion a ONNX y despliegue en robot real.
- Pruebas de robustez en distintas superficies: al mantener la marcha de forma continua, facilita evaluar el comportamiento del controlador sobre diferentes terrenos y condiciones de friccion (siempre que el robot lo permita fisicamente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de recompensa, tasas de exito, distancia recorrida, consumo energetico ni comparaciones con otras politicas. Los unicos parametros operativos verificables son los extraidos del propio artefacto:

| Parametro operativo | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion de la politica | perpetua hasta orden de parada |
| Periodo del bucle de control | 20 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio declara 0.0 GB de tamano, lo que sugiere un artefacto de muy baja huella, pero no se publican recuentos de parametros ni requisitos de memoria.
- El modelo esta disenado para ejecutarse en el computo embarcado del propio robot microduck, no en un servidor de GPU.
- GPU recomendadas: no aplica ni se especifica ninguna. La inferencia en ONNX puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte de aceleracion por GPU.
- Opciones de despliegue: runtime ONNX y el daemon de politicas del robot, invocado mediante `sudo robotctl policy load <slot> jmvargascruz/microduck-speedy-quack-1`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no son herramientas aplicables a este tipo de politica.
- Latencia: el contrato de control exige un ciclo de 20 ms (50 Hz). No se publican mediciones reales de latencia de inferencia ni de throughput.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados sobre otras politicas comparables en la informacion proporcionada. No es posible establecer una comparativa cuantitativa con alternativas del mismo ecosistema (por ejemplo, otras politicas de microduck u otros controladores ONNX para robots de tamano similar) porque no se han facilitado sus especificaciones, resultados ni condiciones de licencia.

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speedy Quack 1 | no disponible | 61-D de observacion, 14 acciones, 50 Hz | sin benchmarks publicados | no disponible | HuggingFace (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de sesgos, y el concepto no aplica de la misma forma que en modelos de lenguaje, aunque si puede existir un sesgo de politica hacia las condiciones de entrenamiento (terreno, carga, bateria).
- Riesgo de alucinacion: no aplica en el sentido habitual. El riesgo equivalente es la extrapolacion fuera de la distribucion de entrenamiento, que puede producir acciones inestables o no deseadas sin aviso.
- Limitaciones de contexto o idioma: no aplica el concepto de idioma. La ventana de observacion esta fijada en 61 dimensiones por paso, sin memoria de largo plazo documentada mas alla de lo que la propia red implemente internamente.
- Comportamiento perpetuo: la politica no tiene condicion de parada propia. Si se carga y no se detiene explicitamente, el robot mantendra la marcha de forma indefinida, con el consiguiente riesgo mecanico y de consumo de bateria.
- Licencia: no disponible. Al no especificarse licencia, no puede asumirse permiso para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: sin metricas publicadas no es posible evaluar la calidad de la marcha ni compararla objetivamente con otras politicas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan validaciones independientes o incidencias reportadas por terceros.
- Dependencia del manifiesto schema 2: el despliegue exige un daemon compatible con dicha version del esquema; versiones distintas podrian no aceptar el manifiesto.
- Trazabilidad limitada: solo se indica el repositorio, rama y commit de entrenamiento (`a3e0c0fbe`), sin detalles de hiperparametros, semillas ni configuracion de simulacion, lo que dificulta la reproduccion exacta.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/jmvargascruz/microduck-speedy-quack-1
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe` (no se ha facilitado URL directa verificada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (no se ha facilitado URL directa verificada)
- Resultados de busqueda web: la busqueda no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos corresponden a contenido turistico sobre Walmer Castle y se omiten por no ser relevantes.
