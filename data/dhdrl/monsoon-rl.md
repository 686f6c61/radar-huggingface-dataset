# DHDRL/monsoon-rl

## Resumen

DHDRL/monsoon-rl es un sistema de aprendizaje por refuerzo profundo diseñado para la inspección de riesgo meteorológico en zonas agrícolas de arroz en Indonesia, con presupuesto limitado. El modelo combina una política MaskablePPO con un extractor GRU equivariante por zonas (`ZoneEquivariantMaskablePolicy`), lo que permite transferir pesos entre configuraciones con distinto número de zonas. El entorno Gymnasium gestiona creencias por zona, máscaras de acción y tres modos de presupuesto (triage, escaso y completo).

El proyecto incluye un pipeline completo de entrenamiento con curriculum learning, un módulo determinista de puntuación de riesgo de cultivo calibrado económicamente, y una ruta de exportación ONNX → MNN para inferencia en edge. El autor declara explícitamente que es un código de investigación, no un servicio de alerta en producción, y que el entrenamiento es mayoritariamente sintético. La validación reporta un 100 % de precisión en selección de zona condicionada al riesgo (sequía, inundación y hongos) tras 2,4 millones de pasos, aunque con limitaciones importantes de replicabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MaskablePPO con extractor GRU equivariante por zonas (`ZoneEquivariantMaskablePolicy`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno episódico con `max_steps < n_zones` en modo triage) |
| Tipos de cuantizacion | Exportación int8 vía ONNX/MNN (`--quantize int8`) |
| Idiomas soportados | no disponible |
| Licencia | AGPL-3.0 |
| Formato de pesos | Checkpoints de Stable-Baselines3 (.zip), exportación ONNX y MNN |

## Arquitectura y entrenamiento

El modelo usa MaskablePPO de `sb3_contrib` con una política personalizada que puntúa los logits de inspección por zona antes del pooling. El extractor GRU comparte pesos entre zonas (equivariancia por zona), mientras que la rama de valor es invariante a permutaciones, lo que facilita la transferencia de pesos al cambiar `n_zones`. El entorno Gymnasium incluye mapas de creencia, máscaras de acción, modos de presupuesto (triage, escaso, completo), barajado de orden de zonas e inyección de contexto episódico real. El escalado de precipitación usa `precip_scale=40.0`.

El entrenamiento combina curriculum learning (`train_curriculum.py`) con un script independiente (`train_kaggle.py`). La receta validada usa 2,4 millones de pasos, ratio de episodios limpios de 0,80, correlación espacial de eventos de 0,50 y modo triage. El autor advierte que 150k pasos son suficientes para selección de sequía/inundación pero no para hongos, que requieren los 2,4M completos. La puntuación de riesgo de cultivo es determinista y calibrada económicamente, lo que fundamenta las recompensas y las alertas de producto.

## Capacidades

- Selección de zona de inspección condicionada al riesgo: sequía, inundación y presión de hongos/enfermedades, confirmada al 100 % en episodios sintéticos con una sola zona contaminada.
- Asignación de presupuesto bajo tres modos: triage (pasos menores que el número de zonas), escaso y completo.
- Transferencia de pesos entre configuraciones con distinto número de zonas gracias a la equivariancia por zona.
- Evita el bloqueo en ranuras fijas mediante barajado de orden de zonas por episodio (recuentos de acciones por ranura ~50/50).
- Exportación a edge mediante ONNX y MNN con cuantización int8 y runtime C++ con estado oculto GRU externo.
- Evaluación contra trayectorias reales L1 mediante script dedicado (aunque aún no ejecutado sobre un checkpoint entrenado en modo triage).

## Casos de uso

- Planificación de inspecciones agrícolas con presupuesto limitado: el modelo decide qué zonas de arroz inspeccionar primero cuando hay sequía o inundación inminente, maximizando la detección de riesgo con un número fijo de visitas.
- Priorización de alertas tempranas para cooperativas de agricultores: la puntuación determinista de riesgo de cultivo permite generar alertas de producto por zona sin depender de modelos generativos.
- Simulación de políticas de triage para organismos públicos: el entorno Gymnasium permite probar distintas estrategias de asignación de recursos antes de desplegarlas sobre el terreno.
- Entrenamiento curricular para problemas con número variable de zonas: la equivariancia por zona permite reutilizar pesos al pasar de 2 a más zonas, reduciendo el coste de reentrenamiento.
- Inferencia en dispositivos edge: la ruta ONNX → MNN con cuantización int8 permite ejecutar la política en dispositivos de bajo consumo en campo, sin conexión a la nube.
- Investigación académica en RL aplicado a agricultura: el código incluye climatología por zona, zonas agrícolas de Indonesia y un scorer calibrado, útil como banco de pruebas para métodos de inspección con presupuesto escaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. La validación reportada es específica del dominio:

| Claim | Resultado |
|---|---|
| Selección de zona por sequía (sintético, una zona contaminada) | 100 % confirmado a 2,4M pasos (n=76, dos bloques de semilla + transferencia ρ=0,85) |
| Selección de zona por inundación (sintético, una zona contaminada) | 100 % confirmado a 2,4M pasos (n=97, dos bloques de semilla + transferencia ρ=0,85) |
| Selección de zona por hongos/presión de enfermedad (sintético, una zona contaminada) | 100 % confirmado a 2,4M pasos (n=95, dos bloques de semilla + transferencia ρ=0,85); rezagado al 57–67 % a 250k pasos |
| Evaluación contra trayectorias reales L1 | Abierta (no ejecutada sobre checkpoint triage) |
| Replicación multi-semilla de la receta triage | Abierta (el resultado de 2,4M proviene de una sola ejecución con `--seed 7`) |

## Requisitos de hardware

- Entrenamiento recomendado en GPU, aunque la documentación indica que CPUs pueden usarse con éxito.
- No se especifican requisitos concretos de VRAM ni GPUs recomendadas; el tamaño del modelo no está publicado.
- Inferencia en edge: la exportación MNN con cuantización int8 está orientada a dispositivos de bajo consumo, con runtime C++ que mantiene el estado oculto GRU externo.
- Despliegue: los checkpoints se cargan con `MaskablePPO.load()` de `sb3_contrib`; la ruta edge requiere `mnn_export.py` y `edge_wrapper.cpp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el repositorio ni en la búsqueda web. El dominio (RL para inspección agrícola con presupuesto limitado) es específico y no hay alternativas publicadas con las mismas características en la información disponible. La comparativa queda pendiente de datos externos.

## Limitaciones y advertencias

- Es un código de investigación, no un servicio de alerta en producción: no hay on-call, SLA de datos ni certificación regulatoria.
- El entrenamiento es mayoritariamente sintético; las cifras de precisión en selección de zona provienen de episodios sintéticos, no de trayectorias reales.
- El checkpoint triage de 2,4M pasos no ha sido evaluado contra trayectorias reales L1; esa validación está pendiente.
- El resultado de 2,4M pasos proviene de una sola ejecución con `--seed 7`; no se ha replicado con una segunda semilla, y `train_kaggle.py` no siembra el RNG de inicialización de pesos de PyTorch por separado.
- Las métricas de episodio completo o de creencia no son equivalentes a la habilidad de selección de zona.
- La ruta MNN/C++ es orientada a exportación, no es un despliegue edge validado en producción.
- Licencia AGPL-3.0: cualquier uso comercial o modificación distribuida debe publicar el código fuente bajo la misma licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DHDRL/monsoon-rl
- Datasets del autor: https://huggingface.co/DHDRL/datasets
- Repositorio de código: no disponible en la información proporcionada
- Paper: no disponible en la información proporcionada
