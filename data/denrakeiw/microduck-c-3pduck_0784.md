# DenRakEiw/microduck-c-3pduck_0784

## Resumen

microduck-c-3pduck_0784 es una politica de control (policy) de locomocion para el robot microduck, publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una red neuronal entrenada por aprendizaje por refuerzo (reinforcement learning) que produce comandos de actuacion a partir de observaciones del robot, y se distribuye empaquetada como grafo ONNX para su ejecucion embarcada.

El modelo ocupa el slot `walk` del sistema de politicas de microduck: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, de forma perpetua (se ejecuta hasta que se le indique lo contrario). La model card indica que la normalizacion de observaciones esta integrada dentro de `policy.onnx`, por lo que el consumidor debe alimentar observaciones en crudo. Se acompania de un `manifest.json` que sigue el esquema 2 del manifiesto de politicas del daemon.

Tecnicamente es un remix en cadena: parte de la red de `suraj-phanindra/microduck-hill-hc5-aifund` (que a su vez deriva de `juicenv/microduck-hill-es8`, de namenu), la congela y la inserta dentro del wrapper de tabla de arranque de `jrubiosainz/microduck-game-hillclimber-remix2`, y vuelve a buscar por CMA-ES los 108 valores de la tabla de arranque sobre las semillas oficiales de colina de la Arena, en simulacion y en muestra. Es relevante como ejemplo de reutilizacion y ajuste fino de politicas de robotica open source en lugar de reentrenamiento desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control de robot (entrenada por RL), exportada a ONNX. Topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Espacio de observacion de 61 dimensiones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico, sin entrada de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` con esquema 2 del manifiesto de politicas de microduck |

Datos adicionales: frecuencia de control 50 Hz, 61 dimensiones de observacion, 14 acciones, slot `walk`, biblioteca `microduck`, pipeline `robotics`, tamano declarado del repositorio 0.0 GB.

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red (numero de capas, tipo de capas, funcion de activacion ni numero de parametros). Se sabe que es una policy cuyos pesos se exportan a ONNX y que la normalizacion de observaciones esta embebida en el propio grafo, de modo que el modelo consume observaciones en crudo sin preprocesado externo por parte del integrador.

En cuanto al entrenamiento, la model card apunta al repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1`, e indica que el proceso combina dos elementos: por un lado, la red del modelo base `suraj-phanindra/microduck-hill-hc5-aifund` se mantiene congelada; por otro, se reoptimizan mediante CMA-ES los 108 valores de la tabla de arranque (start-table) que aporta el wrapper de `jrubiosainz/microduck-game-hillclimber-remix2`. Esa busqueda se realizo sobre las semillas oficiales de colina de la Arena, en simulacion y en muestra (in-sample). No se indica el numero de tokens ni la composicion de un dataset, ya que no aplica: se trata de un ajuste sobre una politica previamente entrenada con RL en simulacion, no de un modelo entrenado sobre corpus de texto ni con RLHF/DPO.

## Capacidades

- Generacion de marcha (gait) para el slot `walk` del robot microduck: la politica es perpetua, es decir, mantiene la marcha de forma continua hasta recibir una orden de parada.
- Control de locomocion a 50 Hz con 14 grados de accion sobre un espacio de observacion de 61 dimensiones.
- Escalada de colinas de 1,5 m (segun el remix descrito), orientada a las semillas oficiales de la Arena.
- Integracion directa con el daemon de politicas mediante `robotctl policy load walk <modelo>`.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que simplifica el despliegue al no requerir pipeline de preprocesado adicional.
- Ejecucion en simulacion y en robot fisico (la model card incluye instrucciones de carga en robot).

No dispone de: generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente ni soporte multilingue. No hay evidencia de un modo de razonamiento explicito ni de seleccion dinamica de politicas.

## Casos de uso

- Despliegue de locomocion en robot microduck fisico: cargar la politica en el slot `walk` con `sudo robotctl policy load walk DenRakEiw/microduck-c-3pduck_0784` para que el robot genere una marcha continua sin intervencion externa.
- Evaluacion de politicas en simulacion: ejecutar `policy.onnx` con observaciones sinteticas de 61 dimensiones sobre las semillas de colina de la Arena para medir tasa de exito y estabilidad antes de tocar hardware.
- Investigacion en optimizacion de tablas de arranque: el modelo sirve como referencia reproducible de un ajuste CMA-ES sobre 108 parametros de start-table, util para estudiar hasta que punto el ajuste de la inicializacion mejora una policy congelada.
- Benchmarking de politicas de microduck: al compartir ascendencia con `microduck-hill-hc5-aifund` y `microduck-hill-es8`, permite comparaciones controladas entre variantes con la misma red base y distintos wrappers.
- Base para nuevos remixes: al estar publicado con `base_model_relation: finetune`, es un punto de partida para congelar de nuevo la red y reoptimizar otros parametros del wrapper.
- Integracion en pipelines de validacion continua de robotica: el formato ONNX y el manifiesto con esquema 2 permiten cargar, ejecutar y comparar politicas de forma automatizada en un banco de pruebas.
- Docencia y prototipado en robotica open source: ejemplo de extremo a extremo que va del entrenamiento por RL en simulacion hasta el despliegue en un daemon de politicas sobre hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasa de exito, velocidad de marcha, consumo energetico, latencia de inferencia ni comparaciones cuantitativas con las politicas de las que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano declarado del repositorio es 0.0 GB, lo que sugiere un artefacto muy pequeno, pero no se confirma la cifra exacta.
- GPU recomendadas: no disponibles. No hay requisitos de GPU publicados en la informacion proporcionada.
- Inferencia en GPU de consumo: no confirmado por el autor; dado que es una policy de robot con observaciones de 61 dimensiones y 14 acciones, el perfil esperable es de inferencia en CPU embarcada mas que en GPU dedicada, aunque esto no esta verificado en la documentacion disponible.
- Opciones de despliegue: ONNX Runtime a traves del daemon de politicas de microduck (`robotctl policy load`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: se conoce la frecuencia de control objetivo de 50 Hz, lo que implica un presupuesto de 20 ms por paso de control. No se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

Se comparan las variantes de la cadena de remix citadas en la model card, todas ellas politicas de microduck:

| Modelo | Relacion | Observacion / acciones | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenRakEiw/microduck-c-3pduck_0784 | Remix del siguiente; red congelada y start-table reoptimizada con CMA-ES | 61 dimensiones / 14 acciones, 50 Hz | `walk` | no disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| suraj-phanindra/microduck-hill-hc5-aifund | Modelo base directo; su red se congela en este remix | no disponible | no disponible | no disponible | Publico en HuggingFace |
| juicenv/microduck-hill-es8 | Ascendiente del anterior | no disponible | no disponible | no disponible | Publico en HuggingFace |
| jrubiosainz/microduck-game-hillclimber-remix2 | Aporta el wrapper de start-table (108 valores) | no disponible | no disponible | no disponible | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparacion se limita a la genealogia y a las caracteristicas de integracion. Modelos comparables fuera de la familia microduck: no disponible.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible. Antes de cualquier uso comercial es imprescindible contactar con el autor para aclarar los terminos, especialmente porque el modelo deriva de varias politicas de terceros (namenu, juicenv, suraj-phanindra, jrubiosainz) cuyas condiciones tambien podrian aplicar.
- El ajuste de la tabla de arranque se realizo en muestra (in-sample) sobre las semillas oficiales de colina de la Arena y unicamente en simulacion. Esto implica riesgo de sobreajuste a esas semillas y una transferencia incierta a otras condiciones, terrenos o robots fisicos.
- No se publican metricas de robustez, tasa de exito ni evaluaciones fuera de distribucion.
- Al ser una policy perpetua, no incorpora criterios de parada propios; la supervision y los limites de seguridad deben implementarse en el daemon o en el sistema de control del robot.
- El modelo no procesa lenguaje natural ni datos multimodales, por lo que no puede usarse como asistente, generador de codigo ni en tareas de NLP.
- La model card no documenta sesgos, pero en robotica el riesgo relevante no es el sesgo estadistico sino el fallo fisico: una policy no validada en hardware puede provocar movimientos bruscos o caidas. Se recomienda validacion en simulacion y entorno controlado antes del despliegue.
- No hay informacion sobre el numero de parametros ni sobre el consumo computacional, lo que dificulta planificar recursos de despliegue.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- La fecha de creacion registrada en HuggingFace (2026-10-16) es posterior a la fecha habitual de referencia; conviene verificar la vigencia de los artefactos y del repositorio de entrenamiento enlazado.
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado y no verificable, por lo que no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0784
- Modelo base: https://huggingface.co/suraj-phanindra/microduck-hill-hc5-aifund
- Ascendiente del modelo base: https://huggingface.co/juicenv/microduck-hill-es8
- Wrapper de start-table: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `d6a27c4d1` (no se ha encontrado URL publica verificada en la informacion disponible)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (no se ha encontrado URL publica verificada en la informacion disponible)
- Paper, blog, demo o repositorio adicional: no disponible
