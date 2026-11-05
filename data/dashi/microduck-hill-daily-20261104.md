# dashi/microduck-hill-daily-20261104

## Resumen

`dashi/microduck-hill-daily-20261104` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica que emite acciones de locomoción a partir de observaciones proprioceptivas, empaquetado como grafo ONNX y distribuido mediante la librería `microduck`. El modelo ocupa el slot de marcha (`walk`) del robot y se ha publicado como reentrada diaria de una política previa (`dashi/microduck-hill-remix-r752`, con recompensa 0.749).

Técnicamente es un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, entrenado en el repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`). La política consume un vector de observación de 61 dimensiones y produce 14 acciones a 50 Hz, con la particularidad de ser "perpetua": no tiene condición de terminación y ejecuta la marcha de forma indefinida hasta que se detiene externamente.

Su relevancia es acotada pero concreta: ilustra el flujo de trabajo de políticas de RL para robótica de bajo coste, con normalización de observaciones embebida en el propio ONNX y un manifiesto de despliegue estandarizado. El repositorio pesa 0.0 GB, no registra descargas ni likes, y no declara licencia ni idiomas, lo que limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL empaquetada como grafo ONNX; no se documenta la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, dimensión oculta). Lo que sí se documenta es la interfaz: entrada de 61 dimensiones de observación, salida de 14 acciones, frecuencia de control de 50 Hz. El modelo se distribuye como un grafo ONNX autocontenido en el que la normalización de observaciones está integrada, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Es un finetune sobre `jrubiosainz/microduck-game-hillclimber-remix6`, a su vez un remix de una política de juego de escalada. La model card describe el resultado como una política "perpetua" para el slot `walk`: no hay episodio ni condición de parada, la marcha continúa hasta que el operador la interrumpe. No se especifican número de pasos de entrenamiento, composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha perpetua para el robot microduck en el slot `walk`.
- Control a 50 Hz con 14 acciones de salida, adecuado para bucles de control en tiempo real.
- Consumo de observaciones proprioceptivas crudas de 61 dimensiones, con normalización embebida en el ONNX.
- Despliegue directo en robot mediante el comando `robotctl policy load walk dashi/microduck-hill-daily-20261104`.
- Compatibilidad con el manifiesto de políticas microduck en schema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking"; no es un modelo generativo de texto.

## Casos de uso

- Locomoción base del microduck en laboratorio: cargar la política en el slot `walk` con `robotctl` para disponer de una marcha continua mientras se prueban otros subsistemas (sensores, percepción, planificación) sin reentrenar la locomoción.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: usar esta política como línea base reproducible (commit y rama documentados) para comparar variantes de recompensa o de curriculum en el repositorio `microduck_rl`.
- Punto de partida para finetuning: al ser un finetune de `microduck-game-hillclimber-remix6`, sirve como inicialización para nuevas políticas de marcha sobre terrenos o tareas distintas.
- Demostraciones educativas: el flujo completo (entrenar en `microduck_rl`, exportar a ONNX, cargar con `robotctl`) es un ejemplo didáctico de pipeline RL-a-robot con un cuadrúpedo de bajo coste.
- Pruebas de integración del daemon: validar el cargador de manifiestos schema 2 y el pipeline de inferencia ONNX del daemon microduck con una política conocida y perpetua.
- Benchmark interno de latencia: al fijar 50 Hz y 14 acciones, permite medir el coste de inferencia ONNX por paso en el hardware del robot y compararlo con otras políticas del mismo slot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una recompensa de 0.749 asociada a la política predecesora `dashi/microduck-hill-remix-r752`, sin detallar la métrica, el entorno de evaluación ni la comparación con otras políticas. No se ofrecen cifras de latencia, throughput ni tasa de éxito.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un grafo ONNX muy pequeño, pero no se confirma.
- GPU recomendadas: no disponible. El modelo está pensado para ejecutarse en el propio robot microduck, no en servidores GPU.
- ¿Cabe en GPU consumer? No disponible con certeza, aunque por el tamaño del artefacto es altamente probable que sí en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `robotctl` (daemon microduck) y runtime ONNX estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: se especifica control a 50 Hz (20 ms por paso), pero no se publican mediciones reales de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261104` | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `dashi/microduck-hill-remix-r752` | Política RL (predecesora, recompensa 0.749) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparables entre estas políticas ni de alternativas de otros autores con especificaciones públicas verificables.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Sin datos de benchmarks ni de evaluación independiente: la única cifra disponible (recompensa 0.749) corresponde a la política predecesora y no se detalla la métrica.
- Política "perpetua" sin condición de parada: requiere supervisión externa y un mecanismo de interrupción fiable en el robot; un fallo del daemon puede dejar la marcha activa.
- Entrenada específicamente para el microduck (61-D de observación, 14 acciones, 50 Hz); no es transferible a otro hardware sin reentrenamiento.
- No se documenta la arquitectura interna ni el proceso de entrenamiento en detalle (pasos, distribución de recompensas, currículo), lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al entorno de entrenamiento (`hillclimber`): el comportamiento en terrenos o condiciones no vistas no está caracterizado.
- Sin descargas ni validación comunitaria: no hay evidencia de que la política funcione fuera del entorno del autor.
- No aplican sesgos lingüísticos ni alucinación de texto, pero sí el riesgo habitual de las políticas de RL: comportamientos fuera de distribución ante observaciones anómalas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-hill-daily-20261104
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
