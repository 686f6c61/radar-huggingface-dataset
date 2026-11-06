# dashi/microduck-hill-daily-20261105

## Resumen

`dashi/microduck-hill-daily-20261105` es una política de control motriz entrenada por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política de locomoción que ocupa el slot `walk` del robot y produce marchas continuas a 50 Hz hasta que se le ordena detenerse. El autor la publica como "re-entrada diaria" de un modelo previo (`dashi/microduck-hill-remix-r752`, con recompensa 0.749), lo que sugiere un flujo de trabajo de iteración rápida sobre políticas ya entrenadas.

El modelo se distribuye como un artefacto ONNX autocontenido (`policy.onnx`) con el normalizador de observaciones embebido, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck. Es, por tanto, un componente de despliegue directo en robot, no una librería de inferencia general.

La relevancia es acotada pero concreta: demuestra el patrón de publicación de políticas RL como artefactos versionados y consumibles por un runtime específico (`robotctl`), con trazabilidad del linaje de fine-tuning y del repositorio de entrenamiento. La información pública disponible es muy escasa y no incluye arquitectura de red, número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política RL para control motriz; red neuronal no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; precisión numérica no indicada) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Entrada | observación de 61 dimensiones (cruda; normalizador embebido) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Comportamiento | perpetuo (se ejecuta hasta recibir orden de parada) |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Librería / pipeline | `microduck` / `robotics` |
| Tamaño del repo | 0.0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

No se detalla la arquitectura de la red en la información disponible. Por el contexto (política de locomoción para un cuadrúpedo de bajo coste, observación de 61 dimensiones y 14 acciones a 50 Hz) se trata de una política de control entrenada por refuerzo, exportada a ONNX para inferencia en el daemon del robot. El normalizador de observaciones está integrado en el propio grafo ONNX, de modo que el consumidor debe alimentar observaciones sin procesar.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. El modelo es un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix6`, a su vez un remix de un juego de escalada ("hillclimber"). No se especifican el número de pasos de entrenamiento, la composición del dataset, la función de recompensa ni si hubo etapas adicionales de ajuste. El único dato cuantitativo de rendimiento disponible es la recompensa 0.749 del modelo predecesor (`microduck-hill-remix-r752`), no del modelo actual.

## Capacidades

- Locomoción continua del microduck mediante el slot `walk`, con ejecución perpetua hasta recibir una orden de parada.
- Control a 50 Hz con observación de 61 dimensiones y espacio de acción de 14 dimensiones.
- Ingesta de observaciones crudas: el normalizador está embebido en `policy.onnx`, lo que elimina pasos de preprocesado en el cliente.
- Despliegue mediante una única orden del daemon (`robotctl policy load walk ...`).
- Linaje de fine-tuning declarado (`base_model` + `base_model_relation: finetune`), lo que permite rastrear la procedencia del comportamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política motriz, no un modelo generativo.

## Casos de uso

- **Marcha por defecto en el microduck**: cargar la política en el slot `walk` con `robotctl policy load walk dashi/microduck-hill-daily-20261105` para que el robot camine de forma continua. Es adecuada porque el artefacto ya incluye el normalizador y el manifiesto conforme al esquema del daemon.
- **Evaluación de iteraciones de entrenamiento RL**: al ser una "re-entrada diaria" de un modelo previo, sirve para comparar en robot el efecto de un ciclo de entrenamiento adicional frente a la política de referencia (`microduck-hill-remix-r752`).
- **Reproducción de experimentos de `microduck_rl`**: el commit y la rama están declarados, lo que permite reconstruir el entorno de entrenamiento y verificar la política publicada.
- **Base para nuevos fine-tunes**: al estar registrada como finetune de `microduck-game-hillclimber-remix6`, puede servir de punto de partida para remezclas posteriores dentro del ecosistema microduck.
- **Pruebas de integración del runtime de políticas**: útil para validar el esquema 2 de `manifest.json` y la carga de políticas en el daemon antes de desplegar políticas propias.
- **Docencia y divulgación en robótica de bajo coste**: permite mostrar un pipeline completo de RL a despliegue (entrenamiento en `microduck_rl`, exportación ONNX, carga en robot) con hardware asequible.
- **Banco de pruebas de robustez de marcha en terreno tipo "hillclimber"**: el linaje del modelo base sugiere entrenamiento orientado a ascenso o terrenos con pendiente; puede emplearse para medir comportamiento en ese régimen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la recompensa 0.749 del modelo predecesor `dashi/microduck-hill-remix-r752`, que no es directamente comparable con métricas estándar y no se ha verificado para esta política.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El tamaño del repositorio figura como 0.0 GB y no se indica el número de parámetros de la red; por el tipo de tarea (observación de 61 dimensiones, 14 acciones, 50 Hz) es previsible que sea un modelo muy pequeño, pero no hay dato confirmado.
- **GPU recomendadas**: no disponible. La inferencia a 50 Hz en un robot microduck sugiere ejecución en CPU de la propia plataforma; no se especifica.
- **Compatibilidad con GPU de consumo**: no disponible por falta de datos de tamaño.
- **Opciones de despliegue**: runtime `microduck` mediante `robotctl` (carga de política por slot); el artefacto es ONNX, por lo que es compatible con cualquier runtime ONNX estándar, aunque el contrato de observación/acción y el manifiesto son específicos del daemon.
- **Latencia y throughput**: no disponibles. El único requisito temporal declarado es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261105` | Política RL (ONNX) para microduck, slot `walk` | 61 obs. / 14 acciones | 50 Hz | no disponible | HuggingFace, 0 descargas |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL para microduck (modelo base) | no disponible | no disponible | no disponible | HuggingFace |
| `dashi/microduck-hill-remix-r752` | Política RL para microduck (predecesora, recompensa 0.749) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de arquitectura, parámetros ni rendimiento de las alternativas como para establecer una comparación cuantitativa. Las tres pertenecen al mismo ecosistema y comparten linaje.

## Limitaciones y advertencias

- **Licencia no declarada**: no hay licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- **Especificidad de plataforma**: la política está acoplada al microduck (61 dimensiones de observación, 14 acciones, 50 Hz) y al contrato del daemon `robotctl`; no es reutilizable en otro robot sin reentrenamiento.
- **Comportamiento perpetuo**: la política se ejecuta hasta recibir una orden de parada; en despliegues reales es imprescindible implementar un mecanismo de parada de seguridad independiente.
- **Trazabilidad incompleta**: se desconoce el número de parámetros, la arquitectura de red y la precisión numérica de la exportación ONNX, lo que dificulta auditar el comportamiento.
- **Riesgo de sobreajuste al terreno de entrenamiento**: el linaje "hillclimber" sugiere un entorno concreto; no hay datos de robustez en otros terrenos ni de sim-to-real.
- **Ausencia de benchmarks**: no hay métricas publicadas de la política actual, solo la recompensa del predecesor, que no es una medida de rendimiento en robot.
- **Madurez del artefacto**: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en el mismo segundo; es un artefacto recién publicado y sin validación comunitaria.
- **Sin soporte multilingüe ni de texto**: cualquier expectativa de uso como modelo generativo es incorrecta; la etiqueta `pipeline_tag: robotics` lo delimita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-hill-daily-20261105
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Modelo predecesor citado: https://huggingface.co/dashi/microduck-hill-remix-r752
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
