# dashi/microduck-hill-daily-20261120

## Resumen

`dashi/microduck-hill-daily-20261120` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador neuronal que mapea observaciones de 61 dimensiones a 14 acciones discretas a 50 Hz, exportado en formato ONNX para su ejecución directa sobre el hardware del robot. El modelo se publica como una "re-entrada diaria" del checkpoint `dashi/microduck-hill-remix-r752` (con una recompensa registrada de 0.749) y ocupa el slot de marcha (`walk`) del sistema de políticas del demonio `robotctl`.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación de nicho, con cero descargas y cero likes en el momento de la consulta, y un tamaño de repositorio de 0.0 GB según los metadatos (lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamaño reportado es despreciable). Es un finetune del modelo `jrubiosainz/microduck-game-hillclimber-remix6`, a su vez derivado de un linaje de políticas de locomoción para microduck.

No se dispone de información sobre arquitectura interna de la red, número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks. La model card es extremadamente escueta y se limita a indicar el comando de carga, la procedencia del finetune y la rama y commit del repositorio de entrenamiento (`pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal para control motriz (detalle no disponible); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` conforme al esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 acciones discretas |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Comportamiento | perpetuo (se ejecuta hasta recibir orden de parada) |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red neuronal (número de capas, tipo de capas, función de activación, etc.). Lo que sí se conoce es la interfaz: recibe un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, con un comportamiento perpetuo diseñado para el slot de marcha del robot microduck. El normalizador de observaciones está integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

El entrenamiento se realizó mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El modelo es un finetune del checkpoint `jrubiosainz/microduck-game-hillclimber-remix6`, y la model card lo describe como una "re-entrada diaria" del checkpoint `dashi/microduck-hill-remix-r752`, que registra una recompensa de 0.749. No se especifican el número de pasos de entrenamiento, la función de recompensa, el simulador utilizado ni la composición del dataset de episodios.

## Capacidades

- Locomoción bípeda/cuadrúpeda perpetua para el robot microduck en el slot `walk`, ejecutándose de forma continua hasta recibir una orden de parada.
- Control motriz a 50 Hz con observaciones de 61 dimensiones y 14 acciones discretas.
- Normalización de observaciones integrada en el propio ONNX, lo que simplifica la integración en el demonio `robotctl`.
- Carga directa en robot mediante el comando `sudo robotctl policy load walk dashi/microduck-hill-daily-20261120`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es exclusivamente una política de control motriz.

## Casos de uso

- **Locomoción autónoma en el robot microduck**: cargar la política en el slot `walk` mediante `robotctl` para que el robot mantenga una marcha perpetua sobre terreno llano o con pendientes suaves, aprovechando que el normalizador está embebido en el ONNX y no requiere pipeline de preprocesado externo.
- **Investigación en aprendizaje por refuerzo para robótica de bajo coste**: usar este checkpoint como punto de partida o referencia para experimentos de finetune en el repositorio `pollen-robotics/microduck_rl`, comparando la rama `roll-backward` con otras ramas del mismo proyecto.
- **Docencia y talleres de robótica**: el microduck es una plataforma de bajo coste de Pollen Robotics; esta política permite demostrar en clase el ciclo completo de entrenamiento RL, exportación a ONNX y despliegue en hardware real sin necesidad de infraestructura de GPU.
- **Pruebas de integración del demonio `robotctl`**: servir como política de prueba para validar el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md`) y el flujo de carga remota desde Hugging Face al robot.
- **Prototipado de comportamientos de marcha**: al ser un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, puede emplearse como base para generar variantes de marcha en entornos tipo "hillclimber" (escalada de colinas) y evaluar la robustez del gait resultante.
- **Reproducibilidad de experimentos**: el commit y la rama de entrenamiento están documentados, lo que permite a otros investigadores reproducir o auditar el pipeline que generó esta política concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico de rendimiento es la recompensa de 0.749 asociada al checkpoint predecesor `dashi/microduck-hill-remix-r752`, pero no se especifica la métrica, el entorno de evaluación ni la escala, por lo que no es comparable con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al ser una política de control de muy baja dimensionalidad (61 entradas, 14 salidas) exportada a ONNX, es razonable esperar que la inferencia sea extremadamente ligera, pero no se proporciona el número de parámetros ni el tamaño del fichero.
- **GPU recomendadas**: no disponible. Por la naturaleza del modelo, probablemente pueda ejecutarse en CPU del propio robot o en un sistema embebido, pero esto no está confirmado en la información proporcionada.
- **Compatibilidad con GPU de consumo**: no confirmada; no disponible.
- **Opciones de despliegue**: el despliegue previsto es mediante el demonio `robotctl` del proyecto microduck (`sudo robotctl policy load walk dashi/microduck-hill-daily-20261120`). El formato ONNX permite, en principio, ejecución con ONNX Runtime, pero no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles. La frecuencia de control es de 50 Hz, lo que implica un presupuesto de 20 ms por paso de inferencia, pero no se confirma que el modelo cumpla este requisito en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261120` | Política RL para microduck (slot walk) | 61 | 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL para microduck (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL para microduck (predecesor, recompensa 0.749) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de información suficiente sobre los modelos comparables para establecer una comparación cuantitativa de rendimiento, parámetros o contexto. La comparación se limita al linaje de finetune y a la disponibilidad en Hugging Face.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o consultar el repositorio de entrenamiento antes de cualquier despliegue productivo.
- **Cero tracción verificable**: el modelo registra 0 descargas y 0 likes, y el tamaño del repositorio es de 0.0 GB, lo que genera dudas sobre si los pesos están efectivamente alojados y son descargables.
- **Información técnica mínima**: no se documentan arquitectura interna, número de parámetros, dataset, función de recompensa ni procedimiento de evaluación, lo que impide auditar el comportamiento del modelo.
- **Ámbito de aplicación restringido**: es una política de control motriz para un robot específico (microduck); no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- **Riesgo de comportamiento no verificado**: al ser una "re-entrada diaria" de un checkpoint previo, no hay garantía de que la política sea estable en hardware real más allá de lo que indique la model card.
- **Dependencia de la versión del demonio**: el manifiesto sigue el esquema 2 del manifiesto de políticas microduck; cambios de versión en `robotctl` podrían romper la compatibilidad.
- **Sin datos de sesgo, alucinación o idioma**: estas categorías no aplican a un modelo de control motriz, pero tampoco se documentan sesgos de comportamiento (por ejemplo, preferencia por terrenos concretos) que podrían ser relevantes en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261120
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se ha proporcionado URL directa.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio; no se ha proporcionado URL directa.
