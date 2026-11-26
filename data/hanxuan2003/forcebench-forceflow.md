# hanxuan2003/ForceBench-ForceFlow

## Resumen

ForceBench-ForceFlow es un conjunto de ocho checkpoints de inferencia de referencia para tareas de robotica de manipulacion con control de fuerza, publicados por el autor hanxuan2003 bajo el paraguas del proyecto ForceBench. No es un modelo de lenguaje ni un modelo generativo generalista: es un artefacto de investigacion orientado a reproducir resultados experimentales de una politica de robotica (ForceFlow) sobre un conjunto fijo de tareas de manipulacion. Cada checkpoint corresponde a una tarea especifica y fue entrenado durante 100.000 actualizaciones.

La relevancia del artefacto es acotada y de naturaleza metodologica: el autor publica los pesos junto con un sistema de procedencia (PROVENANCE.json, SHA256SUMS) que verifica mediante digests de bytes que los tensores exportados coinciden con los checkpoints de entrenamiento originales. El objetivo declarado es la trazabilidad y la reproducibilidad de una tabla de resultados historicos, no el despliegue en produccion ni la generalizacion a nuevas tareas.

El repositorio ocupa 4,4 GB y contiene exclusivamente `state_dict` exportados, sin estados de optimizador ni callbacks de entrenamiento. Los resultados historicos publicados son en su mayoria muy bajos (varias tareas con 0/200 exitos), lo que situa el artefacto como material de auditoria y comparacion de baselines mas que como solucion operativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de robotica ForceFlow; detalles no especificados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa dos observaciones de imagen y diez frames de historial de wrench) |
| Tipos de cuantizacion | no disponible (checkpoints en formato de entrenamiento, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `model.ckpt` (state_dict de PyTorch), acompanado de `norm_stats.json` y `config.yaml` por tarea |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de ForceFlow; solo indica que se trata de una politica de robotica con control a 15 Hz, dos observaciones de imagen, diez frames de historial de fuerza/wrench, prediccion de 64 acciones de las cuales se ejecutan 32, integracion con 20 pasos de ODE y sin EMA. Estos hiperparametros de inferencia son los unicos datos tecnicos concretos disponibles sobre el diseno del modelo.

Cada uno de los ocho checkpoints fue entrenado durante 100.000 actualizaciones sobre una tarea especifica. El autor no documenta en la model card el volumen de datos, la composicion del dataset ni si hubo etapas de ajuste fino adicionales; los datasets y assets del simulador no se incluyen en el repositorio. La innovacion destacable no es arquitectonica sino de procedencia: la exportacion incluye solo `state_dict`, con verificacion de digest de bytes tensor a tensor contra el checkpoint original, y hashes SHA256 de todos los ficheros de la release.

## Capacidades

- Ejecucion de politicas de manipulacion robotica especificas por tarea: `stove_turn_on`, `nut_thread`, `stove_press_turn`, `faucet_force_turn`, `weight_sort`, `rattle_sort`, `faucet_turn` y `radmanso_drawer_sort_table`.
- Control de fuerza mediante historial de wrench de diez frames, relevante en tareas que requieren aplicar presion o par controlado (grifos, pomos de cocina, tuercas).
- Percepcion visual a partir de dos observaciones de imagen por paso de control.
- Prediccion de secuencias de accion (64 acciones predichas, 32 ejecutadas) con integracion ODE de 20 pasos.
- Normalizacion por tarea mediante `norm_stats.json`, necesaria para preservar la distribucion de entradas y salidas.
- Verificabilidad de pesos mediante `PROVENANCE.json` y `SHA256SUMS`.
- No dispone de tool calling, agentes, capacidades multilingues ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Reproduccion de baselines en investigacion: cargar cada checkpoint con el adaptador congelado de ForceFlow y comparar el rendimiento de una politica propia contra los resultados historicos publicados en la tabla del autor.
- Auditoria de resultados cientificos: usar `PROVENANCE.json` y `SHA256SUMS` para verificar que los pesos evaluados coinciden con los del entrenamiento original, algo util en revisiones por pares o replicaciones.
- Estudio de tareas de fuerza en manipulacion: analizar por que tareas como `weight_sort` alcanzan 103/200 exitos mientras otras como `nut_thread` o `faucet_turn` quedan en 0/200, e identificar que factores de control de fuerza o percepcion fallan.
- Desarrollo de nuevas politicas con comparacion controlada: emplear los checkpoints como referencia fija en un pipeline de evaluacion con el mismo protocolo de 15 Hz, dos imagenes y diez frames de wrench.
- Docencia en robotica: ilustrar el ciclo completo de entrenamiento, exportacion y evaluacion de una politica de manipulacion con control de fuerza, incluyendo las limitaciones reales de rendimiento.
- Analisis de robustez: probar la sensibilidad de los checkpoints a variaciones en la normalizacion (`norm_stats.json`) o en el numero de pasos de ODE, dado que la model card advierte explicitamente sobre la ruta relativa del normalizador.

## Benchmarks y rendimiento

Los unicos resultados publicados son los exitos historicos por tarea sobre 200 intentos:

| Tarea | Exitos historicos |
|---|---|
| stove_turn_on | 0/200 |
| nut_thread | 0/200 |
| stove_press_turn | 0/200 |
| faucet_force_turn | 1/200 |
| weight_sort | 103/200 |
| rattle_sort | 6/200 |
| faucet_turn | 0/200 |
| radmanso_drawer_sort_table | 0/200 |

El autor aclara que el resultado de `faucet_force_turn` corresponde a una re-puntuacion conservadora de solo cota inferior (1/200) en lugar del conteo online original con angulo acotado (0/200). No se reclama ninguna reproduccion en simulador nuevo ni en entorno limpio.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repositorio es de 4,4 GB, lo que da una cota superior aproximada para los ocho checkpoints en precision de entrenamiento, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; al no publicarse el numero de parametros ni la precision, no puede confirmarse.
- Opciones de despliegue: el unico runtime soportado es el adaptador congelado de ForceFlow en el repositorio de GitHub del proyecto (commit `31acf7353d2f723985e6576a5708f67a81707d61`), que lee `checkpoint["state_dict"]`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el control opera a 15 Hz por especificacion del runtime.

## Comparativa con modelos similares

No disponible. La model card no referencia modelos comparables de robotica con control de fuerza, y no se dispone de informacion sobre alternativas de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en la mayoria de tareas: seis de las ocho tareas registran 0/200 exitos, lo que desaconseja cualquier uso operativo directo.
- No es un modelo generalista: cada checkpoint sirve exclusivamente para su tarea; no hay transferencia ni capacidad zero-shot documentada.
- Los resultados son historicos y agregados; el autor declara explicitamente que no reclama reproduccion en simulador nuevo, restauracion de servidor publico ni reproduccion en entorno limpio.
- El repositorio no incluye datasets ni assets del simulador, por lo que no constituye una receta lista para reentrenar.
- `config.yaml` usa una ruta relativa para `normalizer_path` respecto al directorio de trabajo: hay que ejecutar desde el directorio del checkpoint o fijar la ruta absoluta a `norm_stats.json`, o la inferencia fallara o producira resultados incorrectos.
- Los checkpoints contienen solo `state_dict`; no hay estados de optimizador, por lo que no permiten reanudar entrenamiento.
- Licencia MIT para los pesos, con aviso original de ForceFlow preservado en `LICENSE` y `NOTICE`; las dependencias de codigo conservan sus propias licencias en el repositorio fuente.
- Riesgo de alucinacion y sesgos: no aplica en el sentido linguistico, pero si existe riesgo de sobreinterpretar los resultados historicos como evidencia de robustez general.
- Idiomas: no aplica; no hay soporte linguistico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanxuan2003/ForceBench-ForceFlow
- Adaptador ForceFlow (runtime congelado): https://github.com/forcebench-platform/ForceBench/tree/31acf7353d2f723985e6576a5708f67a81707d61/baselines/forceflow
- Repositorio ForceBench: https://github.com/forcebench-platform/ForceBench
