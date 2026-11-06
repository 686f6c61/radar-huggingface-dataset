# dashi/microduck-hill-daily-20261103

## Resumen

`dashi/microduck-hill-daily-20261103` es una política de control motriz (policy) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada en Hugging Face bajo el pipeline `robotics`. No se trata de un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo exportado a ONNX que genera comandos de locomocion a 50 Hz a partir de observaciones de 61 dimensiones, con un espacio de accion de 14 dimensiones. El autor es el usuario `dashi` y el modelo se distribuye como un fine-tune del checkpoint `jrubiosainz/microduck-game-hillclimber-remix6`.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB (lo que sugiere que los pesos no estan subidos o son de tamaño despreciable), y la model card es extremadamente escueta. Se trata de una "re-entrada diaria" de un experimento previo (`dashi/microduck-hill-remix-r752`, con recompensa 0.749), es decir, un artefacto de iteracion rápida dentro de un pipeline de entrenamiento RL, no un modelo pensado para adopcion general.

La información disponible no permite caracterizar el modelo como un LLM ni como un sistema multimodal: no hay arquitectura de transformer, no hay tokenizador, no hay datos de entrenamiento en tokens ni benchmarks de lenguaje. Todo lo que se puede afirmar con rigor se limita a su rol como política de locomocion para un robot concreto, ejecutable mediante el comando `robotctl policy load walk`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (RL), exportada a ONNX; arquitectura de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido; `manifest.json` segun schema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (fine-tune) |
| Repo de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal (numero de capas, tipo de capas, funcion de activacion, etc.). Lo unico verificable es que se trata de una política entrenada mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y en el commit `83599404a`. El artefacto final se exporta a ONNX e incorpora el normalizador de observaciones dentro del propio grafo (`policy.onnx`), de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar.

El modelo es un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix6`, y la model card lo describe como "re-entrada diaria" de `dashi/microduck-hill-remix-r752` con una recompensa reportada de 0.749. No se especifican el numero de pasos de entrenamiento, la composicion del dataset, el algoritmo RL concreto (PPO, SAC, etc.), ni si hubo etapas de ajuste adicionales. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Locomocion cuadrupeda: genera comandos motores para el robot microduck a 50 Hz a partir de observaciones de 61 dimensiones y 14 acciones.
- Política "perpetua": segun la model card, funciona de forma continua hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Encaje en el slot `walk`: disenada especificamente para el slot de marcha del sistema de políticas del daemon microduck.
- Normalizacion integrada: el normalizador de observaciones esta embebido en el ONNX, lo que simplifica la integracion (se alimentan observaciones crudas).
- Carga mediante `robotctl`: se despliega con `sudo robotctl policy load walk dashi/microduck-hill-daily-20261103`.
- No soporta tool calling, function calling, agentes multi-paso, generacion de texto, codigo, matematicas, vision ni audio: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigacion en locomocion RL para microduck: sirve como checkpoint de referencia para comparar variantes de la rama `roll-backward` del repo `pollen-robotics/microduck_rl`, ya que la model card indica el commit exacto de entrenamiento.
- Reproduccion de experimentos: al estar exportado a ONNX con normalizador embebido, permite replicar el comportamiento de la política en simulacion o en hardware sin reentrenar.
- Despliegue en robot fisico: carga directa en el slot `walk` mediante `robotctl` para pruebas de marcha en el microduck real.
- Base para fine-tuning: al ser un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix6`, puede servir como punto de partida para nuevas iteraciones diarias del mismo pipeline.
- Benchmarking interno de políticas: util para comparar la recompensa 0.749 reportada frente a otras variantes del mismo autor o del modelo base.
- Docencia y demos de RL en robotica: ejemplo minimo de política ONNX con manifiesto schema 2 para ensenar el flujo completo entrenamiento -> exportacion -> despliegue en un cuadrupedo de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es la recompensa de 0.749 asociada al checkpoint origen `dashi/microduck-hill-remix-r752`, sin detalle del entorno, la metrica exacta ni la comparacion con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de dimensiones pequenas (61 observaciones, 14 acciones) y exportada a ONNX, la huella de memoria es previsiblemente muy baja, pero no se documenta.
- GPU recomendadas: no disponible. La inferencia a 50 Hz de una red de este tipo es viable en CPU en la mayoria de casos, pero no se aportan datos.
- Cabe en GPU de consumo: no disponible; por la naturaleza del artefacto (política de robot, no LLM) no se espera que requiera GPU dedicada, pero no se confirma en la documentacion.
- Opciones de despliegue: ONNX Runtime mediante el daemon microduck y el comando `robotctl policy load walk`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la unica referencia es la frecuencia de control de 50 Hz del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261103` | Política RL ONNX | 61 | 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-hill-remix-r752` | Política RL (origen de la re-entrada) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas, por lo que la comparativa se limita a la relacion de linaje (fine-tune y re-entrada) y a las dimensiones documentadas para el modelo actual.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta arquitectura, numero de parametros, datos de entrenamiento ni proceso de evaluacion, lo que impide auditar el modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso en produccion.
- Repositorio vacio o casi vacio: el tamaño reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o son de tamano despreciable; verificar antes de intentar la carga.
- Sin adopcion: 0 descargas y 0 likes, sin evidencia de validacion por terceros.
- Especifico de hardware: solo funciona con el robot microduck y su daemon; no es reutilizable fuera de ese ecosistema.
- Sin datos de sesgos ni alucinacion: al no ser un modelo generativo de lenguaje, estos riesgos no aplican en el sentido habitual, pero tampoco se documenta el comportamiento de la política ante condiciones fuera de distribucion.
- Sin garantias de robustez: no se reportan pruebas en terreno, condiciones de iluminacion, friccion variable ni fallos de hardware.
- Fecha futura: la fecha de creacion (2026-11-03) y el nombre "daily" sugieren un pipeline automatizado de publicacion diaria, lo que implica que el artefacto puede quedar obsoleto rapidamente.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261103
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Checkpoint origen citado en la model card: `dashi/microduck-hill-remix-r752` (sin URL directa en la informacion disponible)
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Repositorio del robot: https://github.com/pollen-robotics/microduck
- Documentacion del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la informacion disponible)
