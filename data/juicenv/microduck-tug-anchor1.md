# juicenv/microduck-tug-anchor1

## Resumen

`juicenv/microduck-tug-anchor1` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo ha sido publicado por el usuario `juicenv` como un fine-tune de `Nico-robot/microduck-tug-of-war`, dentro de una línea de trabajo denominada "tug-puller", y su comportamiento consiste en agacharse y echarse hacia atrás (squat and lean back) contra un conjunto de patos oponentes congelados.

Se trata de una política "perpetua": no tiene condición de terminación y se ejecuta de forma continua a 50 Hz, recibiendo observaciones de 61 dimensiones y emitiendo 14 acciones. No es un modelo de lenguaje ni un transformer generativo, sino una red neuronal plana (sin tablas de semillas ni mecanismos auxiliares) exportada a ONNX para su despliegue embebido en el robot.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de entrenamiento RL en robótica de bajo coste y como ejemplo de empaquetado de políticas en el formato de manifiesto del daemon de microduck. El repositorio es de tamaño 0.0 GB, sin descargas ni likes en el momento de la consulta, y la información pública disponible es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal plana (no transformer), política RL para control robótico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` según esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Modelo base | Nico-robot/microduck-tug-of-war (fine-tune) |
| Libreria | microduck |

## Arquitectura y entrenamiento

La política es una red neuronal plana entrenada mediante aprendizaje por refuerzo para el robot microduck. La model card indica explícitamente "Plain network, no seed tables", es decir, sin tablas de semillas ni componentes auxiliares; la normalización de observaciones está integrada dentro del propio `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El modelo se ejecuta como política perpetua a 50 Hz, con 61 dimensiones de observación y 14 acciones.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, en la rama `HEAD`, commit `5cee942d8`. El fine-tune parte de `Nico-robot/microduck-tug-of-war` a través de la línea "tug-puller" del autor, y se entrenó contra una liga de patos oponentes congelados, con el objetivo de aprender a agacharse y echarse hacia atrás. No se especifican en la información disponible el número de pasos de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck a 50 Hz mediante política RL perpetua.
- Ejecución de una conducta específica de "tug of war": agacharse y echarse hacia atrás contra oponentes congelados.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política del robot mediante `robotctl policy load`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües (no es un modelo lingüístico).

## Casos de uso

- Investigación en RL robótico: servir como política de referencia reproducible para comparar algoritmos de entrenamiento en el entorno microduck, partiendo del commit y repositorio documentados.
- Competición o demostración de "tug of war": desplegar la política en un microduck físico para enfrentarlo a oponentes congelados en una liga, tal como se entrenó.
- Base para fine-tuning posterior: al ser un fine-tune de `Nico-robot/microduck-tug-of-war`, puede utilizarse como punto de partida para entrenar variantes de la línea "tug-puller" con nuevos oponentes.
- Validación del pipeline de despliegue: probar el flujo `robotctl policy load` y el manifiesto de políticas (esquema 2) en un robot real antes de desplegar políticas propias.
- Docencia en robótica de bajo coste: ilustrar el ciclo completo de entrenamiento RL, exportación a ONNX y ejecución embebida en un cuadrúpedo económico.
- Pruebas de integración continua del daemon: usar la política como carga de prueba para verificar que el daemon acepta políticas perpetuas con normalización integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible; al ser una política ONNX de control a 50 Hz, es probable que se ejecute en CPU del propio robot, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el método documentado es `sudo robotctl policy load <slot> juicenv/microduck-tug-anchor1` sobre el daemon de microduck; el formato ONNX permite en principio ejecución con ONNX Runtime, pero no se detalla en la model card.
- Latencia y throughput: no disponibles; la política está diseñada para operar a 50 Hz, lo que implica un presupuesto de 20 ms por paso, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-tug-anchor1 | Política RL (fine-tune) | no disponible | 61-D obs., 14 acciones, 50 Hz | no disponible | Hugging Face, 0 descargas |
| Nico-robot/microduck-tug-of-war | Política RL (base) | no disponible | Entorno microduck | no disponible | Hugging Face |
| Otras políticas microduck de la comunidad | Políticas RL | no disponible | Entorno microduck | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está disponible, lo que impide determinar si se permite el uso comercial.
- El modelo está entrenado exclusivamente contra oponentes congelados de una liga concreta; su comportamiento puede degradarse frente a oponentes no vistos durante el entrenamiento.
- Es una política perpetua sin condición de terminación: requiere que el operador la detenga explícitamente.
- No se documentan sesgos, pero al ser una política RL entrenada en simulación o contra oponentes específicos, puede presentar comportamientos frágiles ante cambios en el entorno físico o en el hardware.
- No hay información sobre el número de parámetros, el dataset de entrenamiento ni métricas de éxito, lo que dificulta evaluar su calidad antes de desplegarla.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- El uso está ligado al ecosistema microduck y al daemon `robotctl`; no es un modelo de propósito general.
- No se especifican requisitos de seguridad para la operación física del robot durante la ejecución de la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juicenv/microduck-tug-anchor1
- Modelo base: https://huggingface.co/Nico-robot/microduck-tug-of-war
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `HEAD`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
