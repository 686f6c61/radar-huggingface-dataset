# juicenv/microduck-roller-es6

## Resumen

`juicenv/microduck-roller-es6` es una política de control para robots, no un modelo de lenguaje. Se trata de un ajuste fino (finetune) del modelo de referencia `pollen-robotics/microduck-roller-sprint-2m-reference`, entrenado mediante estrategias evolutivas (evolution strategies) sobre el scorer de Arena para el robot microduck de Pollen Robotics equipado con ruedas tipo roller. El autor es el usuario `juicenv` y la librería asociada es `microduck`.

La política se describe como "perpetua": una vez cargada en una ranura de política del robot, ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario. Trabaja con observaciones de 61 dimensiones, produce 14 acciones de control y opera a 50 Hz. El repositorio tiene un tamano de 0,0 GB y, en el momento de la consulta, registra 0 descargas y 0 "likes", por lo que se trata de un artefacto experimental de publicación muy reciente (creado el 14 de octubre de 2026).

Su relevancia es acotada y muy específica: es un ejemplo de flujo de trabajo de sim2real para robótica de bajo coste, donde una política entrenada en simulación se exporta a ONNX con el normalizador de observaciones integrado y se despliega directamente en el daemon del robot mediante `robotctl`. No hay información pública sobre la arquitectura interna de la red, el número de parámetros ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política exportada a ONNX; la model card no describe la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control reactiva, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | pollen-robotics/microduck-roller-sprint-2m-reference |
| Relacion con el modelo base | finetune |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La model card indica que se trata de un "2 m Roller Sprint skater", es decir, un ajuste fino de la referencia roller de Pollen mediante estrategias evolutivas sobre el scorer de Arena, con búsqueda ejecutada en x86 y correspondiente a la "sexta ronda" de un proceso iterativo. El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. No se detalla el numero de iteraciones, la poblacion usada, la funcion de recompensa concreta ni el volumen de datos de simulación.

El resultado es una política perpetua: recibe observaciones de 61 dimensiones (estado del robot y de sus rollers) y emite 14 acciones a 50 Hz, sin mecanismo de parada interno. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. La arquitectura concreta de la red (número de capas, tipos de capa, parámetros) no está documentada en la información disponible.

## Capacidades

- Control locomotor de un robot microduck sobre rollers, ejecutando una marcha de tipo "sprint" de forma continua.
- Mapeo directo de observaciones crudas de 61 dimensiones a 14 acciones de control, sin preprocesado externo (normalizador embebido).
- Ejecución en bucle perpetuo a 50 Hz, apta para un bucle de control en tiempo real.
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> juicenv/microduck-roller-es6`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`).
- Inferencia autocontenida en formato ONNX, portable a distintos runtimes de ejecución.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural: es exclusivamente una política de control motor.

## Casos de uso

- Despliegue en un robot microduck físico con rollers: cargar la política en una ranura del daemon mediante `robotctl` para que el robot ejecute la marcha de sprint de forma continua en demostraciones o laboratorio.
- Investigación en sim2real: usar esta política como punto de partida para medir la brecha entre el rendimiento en simulación (scorer de Arena) y el comportamiento en hardware real.
- Base para nuevos ciclos de estrategias evolutivas: al ser un finetune de una referencia pública, sirve como semilla para rondas posteriores de búsqueda sobre el mismo scorer.
- Banco de pruebas de pipelines de control a 50 Hz: validar la latencia del bucle completo (sensores, inferencia ONNX, actuadores) en una carga de trabajo realista de 61 entradas y 14 salidas.
- Docencia y prototipado en robótica de bajo coste: ejemplo reproducible de flujo completo entrenamiento, exportación a ONNX y despliegue en robot sin necesidad de infraestructura de GPU.
- Comparación de algoritmos de optimización: al existir una referencia clara y rondas sucesivas de búsqueda ("sexta ronda"), permite contrastar variantes de estrategias evolutivas sobre una misma tarea.
- Integración en plataformas de investigación con múltiples ranuras de política: alternar esta marcha con otras políticas cargadas en el mismo robot para estudiar transiciones entre gaits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el ajuste se realizó sobre el scorer de Arena de rollers, pero no incluye métricas, valores de recompensa ni comparaciones numéricas con la referencia.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una política de 61 entradas y 14 salidas, es previsible que quepa en memoria muy reducida, pero no hay datos publicados sobre el numero de parametros.
- GPU recomendadas: no disponible. No se documenta ninguna GPU de referencia ni durante el entrenamiento ni para la inferencia.
- Viabilidad en GPU de consumo: no confirmada por el autor; por la dimensionalidad del problema es plausible que la inferencia se ejecute en CPU, pero se trata de una estimación, no de un dato proporcionado.
- Opciones de despliegue: ONNX Runtime como runtime natural del formato entregado; el despliegue en robot se realiza a través del daemon de microduck con `robotctl policy load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de control.
- Latencia y throughput: no disponibles como medición publicada. El único dato objetivo es la frecuencia de control de 50 Hz, lo que implica un presupuesto de 20 ms por ciclo completo.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Relacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| juicenv/microduck-roller-es6 | Politica de control ONNX | 61 | 14 | 50 Hz | Finetune por estrategias evolutivas | no disponible | HuggingFace, 0 descargas |
| pollen-robotics/microduck-roller-sprint-2m-reference | Politica de control (referencia) | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo base | no disponible | HuggingFace |

No se dispone de informacion sobre otras alternativas comparables (otras politicas roller para microduck, propuestas de terceros o lineas base de aprendizaje por refuerzo equivalentes) en el material proporcionado.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia total de resultados de evaluacion: no hay metricas publicadas de recompensa, estabilidad ni tasa de exito, ni en simulacion ni en robot real.
- Artefacto sin traccion: 0 descargas y 0 "likes", creado y actualizado con dos segundos de diferencia, lo que sugiere una publicacion automatica o de prueba sin revision posterior.
- Documentacion minima: la model card no detalla la arquitectura de red, el numero de parametros, el dataset de entrenamiento, la funcion de recompensa ni el procedimiento de evaluacion.
- Comportamiento perpetuo sin parada interna: la politica "runs until told otherwise", por lo que es responsabilidad del operador implementar las condiciones de parada y las medidas de seguridad fisica.
- Dependencia de hardware y software especificos: requiere un microduck con rollers y el daemon con soporte de manifiesto schema 2 y `robotctl`; no es reutilizable directamente en otras plataformas sin reentrenamiento.
- Riesgo de fallo por distribucion fuera de dominio: al ser una politica entrenada en simulacion, las condiciones reales (desgaste de rollers, superficies irregulares, bateria baja) pueden degradar el comportamiento sin aviso.
- Sesgos: no aplica en el sentido de sesgos linguisticos o sociales, pero si existe un sesgo de dominio hacia el entorno de simulacion y el scorer de Arena concreto usado durante la busqueda.
- Alucinacion: no aplica; el modelo no genera texto.
- Limitaciones de idioma: no aplica; no procesa lenguaje.
- El material de busqueda web disponible no contiene ninguna fuente relevante sobre este modelo, por lo que no ha sido posible contrastar ni ampliar la informacion de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es6
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (rama `lean`, commit `5a3636302`): `pollen-robotics/microduck_rl`
- Documentacion del manifiesto de politicas (schema 2): `docs/policy-manifest.md` en el repositorio del daemon
