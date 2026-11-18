# nootxlm/microduck-sprint-torpedo3

## Resumen

`nootxlm/microduck-sprint-torpedo3` es una política de control para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una red neuronal de refuerzo (reinforcement learning) destilada y especializada en una tarea motora concreta: recorrer 2 metros en línea recta en el menor tiempo posible. El autor, `nootxlm`, parte del modelo `nikghodki/microduck-sprint-lookup-v1` (licencia Apache-2.0) y le añade capas de tipo lookup descubiertas mediante búsqueda propia en el runner de la Arena de Microduck, con el objetivo de batir el tiempo del stack campeón de la comunidad.

El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que la política recibe observaciones crudas sin preprocesado externo. Se carga directamente en un slot de política del demonio `robotctl` del robot y se ejecuta como una marcha perpetua: no tiene condición de parada interna, corre hasta que se le indique lo contrario. La observación es de 61 dimensiones y la acción de 14 dimensiones, a una frecuencia de control de 50 Hz.

La relevancia de esta ficha es acotada pero específica: es un ejemplo de pipeline de RL aplicado a robótica de bajo coste, con destilación de comportamiento y ajuste fino de capas de control, empaquetado para despliegue directo en hardware. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia propia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (reinforcement learning), con capas lookup añadidas; arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en la ficha del modelo; el modelo base es Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (sin condición de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, anchura, tipo de bloques). Lo que sí se documenta es el proceso: se parte de una red de sprint propia destilada, en la que el comportamiento ejecutado del stack campeón de la comunidad se destila en su arquitectura y se reentrena. Sobre esa base (`nikghodki/microduck-sprint-lookup-v1`) se añaden capas lookup encontradas mediante búsquedas propias en el runner de la Arena: una capa de crucero y dos capas de zambullida que inclinan el pato hacia delante para cruzar la línea de meta.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`. No se especifican el número de pasos de entrenamiento, la composición del dataset de demostraciones, ni si se emplearon técnicas de RL con recompensa explícita, imitación o una combinación. El resultado declarado es de 0,880 s en la prueba local de 2 metros bajo el sistema de puntuación oficial, medido en simulación y en muestra (in-sample), por lo que no constituye una validación fuera de muestra ni en hardware real.

## Capacidades

- Locomoción de sprint en línea recta para el robot Microduck: política perpetua que ejecuta una marcha de avance hasta recibir instrucción de parada.
- Control a 50 Hz con observaciones crudas de 61 dimensiones y salidas de 14 dimensiones; el normalizador va integrado en el ONNX.
- Capas de comportamiento especializadas: una capa de crucero y dos capas de zambullida que ajustan la inclinación del cuerpo para cruzar la meta.
- Carga directa en el robot mediante `robotctl policy load <slot> nootxlm/microduck-sprint-torpedo3`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política motora, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Benchmark de referencia en la Arena de Microduck: sirve como política de sprint contra la que comparar otros stacks en la prueba de 2 metros, gracias a su tiempo declarado de 0,880 s en simulación.
- Investigación en destilación de comportamiento: el modelo documenta un flujo completo de destilar el comportamiento ejecutado de un stack campeón en una arquitectura propia y reentrenarla, útil como caso de estudio reproducible.
- Búsqueda de capas de control: las capas lookup de crucero y zambullida ilustran una técnica de ajuste fino sobre políticas preentrenadas para modificar la postura del robot en fases concretas de una maniobra.
- Despliegue en hardware de bajo coste: al empaquetarse en ONNX con normalizador integrado y cargarse vía `robotctl`, permite probar una marcha de sprint en un Microduck físico sin pipeline de preprocesado adicional.
- Educación y robótica de aficionados: como política perpetua lista para cargar en un slot, es adecuada para demostraciones de locomoción y para que estudiantes analicen el manifiesto y la interfaz de observación/acción.
- Base para ajustes posteriores: al ser un fine-tune del stack de `nikghodki`, puede servir de punto de partida para experimentos con nuevas capas lookup o variaciones de la marcha en el runner de la Arena.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Sprint 2 m | 0,880 s | Local, puntuación oficial, in-sample, solo simulación |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con políticas alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se detalla el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Al ser una política de control a 50 Hz con observación de 61 dimensiones, es probable que quepa en hardware modesto, pero no hay datos que lo confirmen.
- Cabe en GPU de consumo: no confirmado por falta de datos de tamaño y arquitectura.
- Opciones de despliegue: ONNX Runtime para `policy.onnx`; en el robot, el demonio `robotctl` con el manifiesto schema 2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz y el tiempo de sprint de 0,880 s.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion/accion | Frecuencia | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nootxlm/microduck-sprint-torpedo3 | Política RL con capas lookup | 61 / 14 | 50 Hz | 0,880 s en 2 m (in-sample, simulación) | no disponible (base Apache-2.0) | Hugging Face, ONNX |
| nikghodki/microduck-sprint-lookup-v1 | Política RL con lookup (modelo base) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otras políticas de la Arena de Microduck | Políticas RL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de las alternativas en la información proporcionada, por lo que la comparación de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- El resultado de 0,880 s es in-sample y solo en simulación; no hay validación fuera de muestra ni en robot físico, por lo que el rendimiento real puede diferir.
- La ficha no declara licencia propia; aunque el modelo base es Apache-2.0, la licencia del fine-tune y de las capas lookup añadidas no está confirmada, lo que genera incertidumbre para uso comercial.
- No se documentan sesgos, pero al ser una política entrenada para una tarea concreta (sprint en línea recta) no generaliza a otras tareas de locomoción, terrenos o condiciones.
- Política perpetua sin condición de parada interna: requiere supervisión y una orden explícita para detenerla en el robot.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto (2026-11-18), lo que sugiere ausencia de validación por parte de la comunidad.
- No hay información sobre robustez ante perturbaciones, variaciones de fricción del suelo o desgaste del hardware.
- El tamaño del repositorio figura como 0,0 GB, lo que puede indicar un empaquetado mínimo o un problema de metadatos; conviene verificar el contenido real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nootxlm/microduck-sprint-torpedo3
- Modelo base: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (referenciado en la model card; no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card; no se proporciona URL directa)
