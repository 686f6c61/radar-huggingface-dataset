# dashi/microduck-sprint-daily-20261026

## Resumen

`sprint-daily-20261026` es una política de control locomotriz para el robot cuadrúpedo open source microduck de Pollen Robotics, publicada por el usuario `dashi` el 26 de octubre de 2026. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ocupar el slot `walk` del daemon de control del robot.

El autor la describe como una "re-entrada diaria" (daily re-entry) de su propia política previa `dashi/microduck-sprint-remix-r844`, y como un finetune (remix) de `jrubiosainz/microduck-game-sprinter-remix3`. La política es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, es decir, no está entrenada para episodios acotados sino para marcha sostenida.

Su relevancia es la de un artefacto de experimentación en robótica con RL: repositorio de tamano prácticamente nulo, formato ONNX con el normalizador de observaciones embebido y un manifiesto conforme al esquema 2 de microduck, lo que permite cargarla en un robot real con un solo comando. No hay información pública sobre arquitectura de red, número de parámetros, datos de entrenamiento ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX; topología de red no disponible |
| Parámetros totales | no disponible (el repositorio ocupa 0,0 GB, lo que sugiere un modelo de muy pocos parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa observaciones de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye directamente en ONNX; el normalizador de observaciones va embebido en `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Entrada | Observación de 61 dimensiones (cruda; el normalizador está embebido) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modo de ejecución | Perpetuo (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (capas, anchura, función de activación ni si incorpora memoria recurrente). Lo que sí se documenta es el contrato de interfaz: 61 dimensiones de observación de entrada, 14 acciones de salida y 50 Hz de frecuencia de control, con el normalizador de observaciones integrado en el propio grafo ONNX, de modo que el consumidor debe alimentar observaciones sin preprocesar. La política se ejecuta de forma continua (perpetua) hasta que se le indique lo contrario, comportamiento habitual en políticas de marcha entrenadas con recompensas de supervivencia y velocidad.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`, según declara el autor. No se especifican el número de pasos de entorno, la composición del dataset, el algoritmo de RL, ni si hubo fases de ajuste fino supervisado. La relación declarada con el modelo base es `finetune` sobre `jrubiosainz/microduck-game-sprinter-remix3`, y el autor indica que esta entrega es una re-entrada diaria de `dashi/microduck-sprint-remix-r844`, al que atribuye una puntuación de 0.844.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha de tipo sprint para el slot `walk` del microduck a 50 Hz.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones, con normalización embebida en el modelo ONNX.
- Ejecución perpetua: mantiene la marcha de forma indefinida hasta que el daemon o el operador la detienen.
- Integración directa con el stack de Pollen Robotics mediante `robotctl policy load walk <repo>`.
- Compatibilidad con el manifiesto de políticas de microduck, esquema 2.
- Reutilizable como punto de partida para finetune o remix (el propio autor la publica como remix de otra política).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Marcha en robot real: cargar la política en el slot `walk` del microduck con `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261026` para obtener una marcha de sprint continua en el robot físico sin entrenamiento adicional.
- Investigación en sim-to-real: usar la política como referencia de comportamiento entrenado en simulación y medir la transferencia al hardware a 50 Hz con observaciones crudas.
- Línea base para experimentos de RL: al ser un finetune de una política pública, sirve como punto de comparación frente a nuevas variantes en la rama `roll-backward` de `microduck_rl`.
- Docencia y divulgación en robótica: el tamano mínimo del repositorio y su formato ONNX permiten desplegarla en talleres y demostraciones sin infraestructura de GPU.
- Evaluación de pipeline de control: probar el daemon, el cargador de manifiestos (esquema 2) y el normalizador embebido en un entorno de integración continua antes de publicar políticas propias.
- Generación de datos de locomoción: registrar traysectorias y observaciones a 50 Hz con la política en ejecución para construir datasets de marcha o para análisis de estabilidad.
- Comparación de iteraciones diarias: al ser una "daily re-entry" de una política anterior, permite medir deriva de comportamiento entre reentrenamientos sucesivos sobre el mismo slot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, tablas comparativas ni protocolos de test. El único dato numérico aportado por el autor es la puntuación de 0.844 asociada a la política predecesora `dashi/microduck-sprint-remix-r844`, sin que se especifique la métrica, el entorno de evaluación ni el número de episodios:

| Dato | Valor | Contexto |
|---|---|---|
| Puntuación de la política predecesora (`microduck-sprint-remix-r844`) | 0,844 | Citada en la model card; métrica y protocolo no especificados |
| Métricas de esta política (`sprint-daily-20261026`) | no disponible | No publicadas |

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamano del repositorio (0,0 GB) la política es de muy pocos parámetros y cabe holgadamente en cualquier GPU consumer, e incluso el coste de memoria es despreciable frente al de otros modelos.
- GPU recomendadas: no se especifican; no se requiere GPU para inferencia (ONNX ejecutable en CPU con ONNX Runtime). Para entrenamiento o finetune, el autor remite a `pollen-robotics/microduck_rl` sin detallar hardware.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo (la cifra exacta de memoria no se publica); también en CPU.
- Opciones de despliegue: ONNX Runtime para evaluación offline; en robot, el daemon de microduck mediante `robotctl policy load walk <repo>`. No aplica soporte en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: la política debe sostener 50 Hz (20 ms por ciclo de control); no se publican medidas de latencia real ni throughput.

## Comparativa con modelos similares

No se han identificado políticas comparables con datos públicos suficientes. La comparación se limita a los artefactos relacionados declarados por el autor:

| Modelo | Relación | Slot | Entrada / salida | Licencia | Datos públicos |
|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261026` | Este modelo | `walk` | 61-D / 14 acciones, 50 Hz | no disponible | 0 descargas, 0 likes |
| `dashi/microduck-sprint-remix-r844` | Predecesor (re-entrada diaria) | no disponible | no disponible | no disponible | Puntuación citada: 0,844 |
| `jrubiosainz/microduck-game-sprinter-remix3` | Modelo base (finetune) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada en simulación, puede exhibir comportamientos frágiles ante condiciones no vistas (terrenos irregulares, perturbaciones externas, desgaste de actuadores).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamiento fuera de distribución con consecuencias físicas en el robot.
- Ausencia de evaluación publicada: no hay benchmarks, curvas de entrenamiento ni protocolo de test, por lo que el rendimiento real no es verificable a partir de la información disponible.
- Contexto e idioma: no aplica; la entrada es una observación proprioceptiva de 61 dimensiones, no texto.
- Licencia: no disponible. Sin licencia explícita no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Ejecución perpetua: la política no termina por sí sola, de modo que cualquier despliegue debe implementar una parada supervisada y límites de seguridad a nivel de daemon.
- Reproducibilidad limitada: solo se indica rama (`roll-backward`) y commit (`83599404a`) del repositorio de entrenamiento; faltan hiperparámetros, semillas, versión del simulador y composición del dataset.
- Trazabilidad de la puntuación 0,844: corresponde a la política predecesora y no se especifica la métrica, por lo que no debe interpretarse como rendimiento de esta entrega.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto experimental, no una política validada en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-sprint-daily-20261026
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se ha localizado una URL directa en la información proporcionada
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se ha localizado una URL directa en la información proporcionada

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces obtenidos trataban sobre el caldo japonés *dashi* y se han descartado por no ser pertinentes.
