# dashi/microduck-hill-daily-20261114

## Resumen

`dashi/microduck-hill-daily-20261114` es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX y destinada a ejecutarse en el bucle de control del robot. El autor, dashi, la publica como "re-entrada diaria" de una política previa (`dashi/microduck-hill-remix-r752`, con retorno 0.749) y la etiqueta explícitamente como una marcha perpetua para el slot `walk`.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas, 0 likes, tamaño de 0.0 GB y fue creado el 14 de noviembre de 2026. Se trata de un artefacto de experimentación personal dentro del ecosistema microduck, no de un modelo de propósito general. La model card no incluye especificaciones de arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la referencia al repositorio `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`).

La información disponible es muy limitada y gran parte de los campos técnicos habituales (contexto, cuantización, idiomas, licencia) no aplican o no están publicados. Esta ficha refleja fielmente esa escasez y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX; topología de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Libreria | `microduck` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal (capas, anchuras, función de activación ni tipo de política, p. ej. MLP o red recurrente). Lo único documentado es el contrato de interfaz: observación de 61 dimensiones, 14 acciones y frecuencia de 50 Hz, con el normalizador de observaciones embebido dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. El artefacto se distribuye junto a un `manifest.json` que sigue el schema 2 del manifiesto de políticas microduck descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se publican el número de pasos de entrenamiento, la composición del entorno, la función de recompensa ni si hubo fases de ajuste fino adicionales. La model card indica que es un finetune de `jrubiosainz/microduck-game-hillclimber-remix6` y que constituye una "re-entrada diaria" de `dashi/microduck-hill-remix-r752` con retorno 0.749, lo que sugiere un flujo de trabajo iterativo de reentrenamiento periódico sobre políticas previas.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha perpetua ("runs until told otherwise") para el slot `walk` del microduck.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el propio ONNX: no requiere preprocesado externo.
- Compatible con el daemon de microduck mediante `robotctl policy load walk <repo>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261114` para que el robot mantenga una marcha continua sin intervención.
- Experimentación en robótica de bajo coste: servir como punto de partida para comparar estrategias de locomoción dentro del ecosistema microduck, dado que es un finetune de una política previa con retorno documentado (0.749).
- Investigación en reinforcement learning aplicado a control: usar el artefacto ONNX como referencia reproducible de una política entrenada en `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`).
- Docencia y talleres: desplegar una marcha funcional en un robot microduck físico para demostrar el ciclo completo de entrenamiento, exportación a ONNX y ejecución en hardware.
- Integración en el daemon microduck: validar el schema 2 del manifiesto de políticas y el flujo de carga con normalizador embebido en entornos de desarrollo.
- Base para finetuning posterior: al ser un finetune de `jrubiosainz/microduck-game-hillclimber-remix6`, puede reutilizarse como inicialización en nuevas iteraciones del pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona un retorno de 0.749 para la política predecesora (`dashi/microduck-hill-remix-r752`), sin especificar la métrica, el entorno de evaluación ni el número de episodios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX, la huella de memoria es presumiblemente mínima, pero el dato no está publicado.
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en el propio robot microduck, no en GPUs de centro de datos.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si requiere aceleración por GPU o si corre en CPU.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load walk <repo>`; el runtime ONNX concreto no se especifica.
- Latencia y throughput estimados: no disponible; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261114` | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL (predecesora) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá del retorno 0.749 de la predecesora.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, parámetros, datos de entrenamiento ni métricas de evaluación.
- Licencia no disponible: no puede asumirse permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de que la política funcione correctamente en hardware real.
- Comportamiento "perpetuo": la marcha se ejecuta hasta que se le indique lo contrario, sin condiciones de parada documentadas; requiere supervisión en pruebas físicas.
- Específica del hardware microduck: no es transferible a otras plataformas robóticas sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento (`roll-backward`): no se documenta la variabilidad de terrenos ni la robustez ante perturbaciones.
- Sin soporte de lenguaje, visión ni razonamiento: cualquier expectativa propia de un modelo fundacional es inaplicable.
- Artefacto de experimentación personal: no hay garantía de mantenimiento ni de compatibilidad futura con el daemon.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261114
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck
