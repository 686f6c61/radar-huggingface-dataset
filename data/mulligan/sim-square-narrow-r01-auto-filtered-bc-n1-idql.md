# mulligan/sim-square-narrow-r01-auto-filtered-bc-n1-idql

## Resumen

`mulligan/sim-square-narrow-r01-auto-filtered-bc-n1-idql` es un checkpoint de política robótica publicado por el proyecto Mulligan dentro de su campaña de comparación de métodos de imitación iterativa. No es un modelo de lenguaje ni un modelo multimodal: es un agente IDQL basado en estado, compuesto por un actor de difusión (que genera acciones continuas) y un crítico IQL escalar. Se distribuye como `policy.pt` (checkpoint de PyTorch) más `stats.json` con los normalizadores de observaciones y acciones.

El modelo resuelve la tarea de manipulación simulada `sim-square-narrow` y se publica en cinco semillas independientes (1 a 5), todas con 150.001 pasos de entrenamiento. Su función dentro del ecosistema Mulligan es actuar como comparador ("iterative-IL comparator") frente a otras variantes del mismo bucle de aprendizaje por imitación, midiendo el efecto de incorporar rollouts automáticos de una política de behavioral cloning filtrados antes de reutilizarlos para entrenar.

La relevancia práctica es de tipo metodológico: ofrece un punto de referencia reproducible (los ficheros son copias idénticas byte a byte de los artefactos de W&B, con MD5 verificado y SHA-256 registrado en `release.json`) y una evaluación amplia sobre una rejilla de estados iniciales reservada, con 8.000 rollouts por semilla y tasas de éxito entre el 70,25% y el 75,46%. El repositorio ocupa 1,4 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión para acciones continuas + crítico IQL escalar; política basada en estado (sin visión ni lenguaje) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica / no disponible: la política consume observaciones de estado, no una ventana de contexto textual |
| Tipos de cuantización | no disponible; solo se publican checkpoints en el formato y precisión de entrenamiento |
| Idiomas soportados | no aplica (modelo de control robótico; no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, pickle) + `stats.json` (normalizadores) |
| Tarea | `sim-square-narrow` |
| Ronda / brazo | R1 / `auto-filtered-bc-n1` (celda de campaña: iterative-IL comparator) |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150001 |
| Tamaño del repositorio | 1,4 GB |
| Datasets de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-baseline`, `mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` |
| Pipeline declarado en HuggingFace | robotics |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL (Implicit Q-Learning con actor de difusión): un crítico Q escalar entrenado con objetivos tipo IQL, que evita consultar acciones fuera de la distribución del dataset, y un actor de difusión que modela la distribución de acciones condicionada al estado. La consecuencia práctica es que la generación de cada acción requiere varios pasos de denoising, a diferencia de una política determinista de tipo MLP. El número de pasos de difusión, el tamaño de las capas y el total de parámetros no se documentan en la model card.

Los datos de entrenamiento proceden de dos fuentes declaradas: el dataset de teleoperación `sim-square-narrow-c00-teleop-baseline` y el dataset de rollouts de una política BC compartida `sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts`. El nombre del brazo (`auto-filtered-bc-n1`) sugiere que esos rollouts se filtran automáticamente antes de reincorporarlos al entrenamiento, aunque la model card no describe el criterio de filtrado ni el número de episodios utilizados. No se documenta el uso de RLHF, DPO ni preferencias humanas.

En cuanto a trazabilidad, los cinco checkpoints provienen de artefactos de W&B del proyecto `self-improving/square-dagger-mining-01a` con el nombre interno `iql_ddpg_bc_idql_nutassemblysquare_...`; las semillas 1 a 4 corresponden al commit `6f21c002a881` y la semilla 5 al commit `f7149fd16945`. Los ficheros son copias idénticas byte a byte de dichos artefactos, con MD5 comprobado contra el manifiesto y SHA-256 registrado en `release.json`.

## Capacidades

- Control robótico continuo a partir de observaciones de estado para la tarea `sim-square-narrow`.
- Política especializada de tarea única: no generaliza a otras tareas ni a otros entornos.
- Modelado multimodal de la distribución de acciones mediante actor de difusión (permite representar comportamientos multimodales del dataset).
- Evaluación de valor fuera de política gracias al crítico IQL escalar.
- Reproducción de resultados: cinco semillas independientes permiten estimar la varianza del método.
- Generación de rollouts reutilizables como datos (el dataset `sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts` referencia este modelo en sus metadatos).
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso en sentido de agente cognitivo; su "multi-step" se limita a la secuencia de control dentro de un episodio.
- No tiene capacidades multilingües, de visión, de audio ni modo "thinking".

## Casos de uso

- Comparador de métodos de imitación iterativa: sirve como referencia fija frente a otras variantes del mismo bucle de entrenamiento, ya que el brazo se etiqueta explícitamente como "iterative-IL comparator" dentro de la campaña.
- Investigación en offline RL e IL con actor de difusión: el par actor de difusión + crítico IQL permite estudiar el efecto del filtrado de datos y del reetiquetado de valores sin reentrenar desde cero.
- Estimación de varianza entre semillas: con cinco semillas evaluadas sobre la misma rejilla de estados iniciales, se puede cuantificar la dispersión del éxito (70,25%–75,46%) antes de decidir si una mejora observada es significativa.
- Punto de partida para bucles tipo DAgger o self-improving: las semillas se entrenaron en la campaña `square-dagger-mining`, por lo que son candidatas naturales para inicializar rondas posteriores de recogida de datos y reentrenamiento.
- Generación de datos de política para otros entrenamientos: los rollouts derivados de esta política se publican como dataset y pueden emplearse para entrenar políticas BC filtradas.
- Validación de pipelines de evaluación en simulación: con 8.000 rollouts por semilla sobre estados iniciales reservados, sirve para comprobar la infraestructura de evaluación antes de lanzar experimentos más costosos.
- Docencia y reproducción de experimentos: al ser checkpoints pequeños, con licencia MIT y cargables con PyTorch, se pueden reproducir los resultados en un entorno de laboratorio sin hardware especializado.
- Análisis de fallos en inserción estrecha: permite inspeccionar en qué configuraciones iniciales falla la política dentro de la tarea, algo útil para diseñar curricula o aumento de datos.

## Benchmarks y rendimiento

Evaluación publicada en la model card, sobre una rejilla de estados iniciales reservada (*held-out initial-state grid*), con 8.000 rollouts por semilla:

| Semilla | Rollouts evaluados | Éxitos | Tasa de éxito |
|---|---|---|---|
| seed-1 | 8000 | 5620 | 70,25% |
| seed-2 | 8000 | 5732 | 71,65% |
| seed-3 | 8000 | 5843 | 73,04% |
| seed-4 | 8000 | 5961 | 74,51% |
| seed-5 | 8000 | 6037 | 75,46% |
| Media (calculada a partir de los datos anteriores) | 40000 | 29193 | 72,98% |

Dataset de evaluación: `mulligan/sim-square-narrow-r00-r03-eval`. No se han publicado resultados de benchmarks estándar de lenguaje o código (MMLU, HumanEval, GSM8K) porque no son aplicables a este modelo. No se ha publicado comparación numérica con otras políticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Estimación derivada del tamaño del repositorio (1,4 GB para cinco semillas, aproximadamente 0,28 GB por semilla); el tamaño exacto de cada `policy.pt` no se publica.
- Cabe en cualquier GPU de consumo actual y en la mayoría de GPU integradas; la inferencia en CPU es viable para evaluación por lotes.
- GPU recomendadas: cualquiera con soporte CUDA funcional (por ejemplo, RTX 3060 o superior) para acelerar la evaluación masiva; no se requiere A100, H100 ni memoria de 80 GB.
- Opciones de despliegue: carga directa con PyTorch de `policy.pt` y `stats.json`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia arquitectónica, el actor de difusión necesita varios pasos de denoising por acción, lo que incrementa la latencia frente a una política determinista equivalente; el número de pasos no se documenta.
- Para reproducir la evaluación completa hacen falta 40.000 episodios simulados (8.000 por semilla), lo que domina el coste total muy por encima de la inferencia del propio modelo.

## Comparativa con modelos similares

No se dispone de resultados numéricos de políticas alternativas en la información proporcionada, por lo que la comparación de rendimiento se marca como no disponible. Los únicos elementos comparables documentados son los que participan en la misma campaña:

| Alternativa | Relación con este modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-c00-teleop-baseline` | Dataset de teleoperación usado como fuente de datos base | no aplica (dataset) | no aplica | no disponible | no disponible |
| `mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts` | Dataset de rollouts de la política BC compartida | no aplica (dataset) | no aplica | no disponible | no disponible |
| `mulligan/sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts` | Dataset de rollouts filtrados que referencia a este modelo | no aplica (dataset) | no aplica | no disponible | no disponible |
| Otras rondas/brazos de la misma tarea (`sim-square-narrow-r00-r03-eval`) | Misma rejilla de evaluación, distinto agente | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de tarea única y basado exclusivamente en estado: no procesa imágenes, lenguaje ni audio, y no se puede reutilizar en otras tareas sin reentrenar.
- Entrenado y evaluado únicamente en simulación; no se aporta evidencia de transferencia a un robot real (sim2real).
- Tasa de fallo no despreciable: entre el 24,5% y el 29,8% de los rollouts fallan según la semilla, por lo que no es apto para despliegue autónomo sin capas de seguridad y supervisión.
- Varianza entre semillas de aproximadamente 5 puntos porcentuales en la tasa de éxito; cualquier comparación con otros métodos debería tenerla en cuenta.
- Los ficheros `.pt` son pickles de PyTorch: cargarlos implica ejecución de código y deben abrirse solo en entornos de confianza, tal como advierte la propia model card.
- No se documentan el número de episodios de entrenamiento, la composición exacta del dataset, los hiperparámetros ni el criterio de filtrado del brazo `auto-filtered-bc-n1`, lo que limita la reproducibilidad completa del método (no así de los pesos).
- Sin datos de sesgo en el sentido habitual de los modelos de lenguaje; el sesgo relevante es la cobertura de la distribución de estados iniciales de la rejilla de evaluación y de los datos de teleoperación.
- Licencia MIT para los pesos: permite uso comercial y modificación, pero sin garantía alguna; las licencias de los datasets enlazados no se especifican en la información disponible.
- Modelo sin validación de la comunidad: cero descargas y cero "likes" en el momento de la consulta.
- El repositorio ocupa 1,4 GB porque incluye las cinco semillas; conviene descargar solo la carpeta de la semilla necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-auto-filtered-bc-n1-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización `mulligan` en HuggingFace: https://huggingface.co/mulligan
- Dataset de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts de la política BC compartida: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts filtrados que referencia este modelo: https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset de evaluación: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Búsqueda de datasets de la familia `sim-square-narrow`: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha externa del dataset de rollouts filtrados (100 episodios de observaciones de solo estado): https://claru.ai/datasets/mulligan-sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset con nomenclatura equivalente en otra organización: https://huggingface.co/datasets/ankile/square-d1-01a-auto-filtered-bc-n1-r2-policy-rollouts
