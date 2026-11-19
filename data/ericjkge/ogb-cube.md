# ericjkge/ogb-cube

## Resumen

`ericjkge/ogb-cube` es un repositorio de checkpoints para un proyecto académico de planificación jerárquica con modelos del mundo (world models) sobre el entorno OGBench `visual-cube-single` a resolución de 64 píxeles. Lo publica el usuario ericjkge como entrega del proyecto MIT 6.4212, y contiene tres artefactos entrenados: un modelo del mundo LeWM basado en JEPA, una política GCBC con chunks de 5 acciones y un generador de waypoints latentes por flow matching. No es un modelo de lenguaje: es un conjunto de pesos para robótica y control basado en aprendizaje por refuerzo offline con datos de juego (*play data*).

El interés de este repositorio es práctico y de investigación: documenta una prueba de concepto de jerarquía de planificación (waypoint de alto nivel + política de bajo nivel) sobre un benchmark estándar de manipulación visual (OGBench), con scripts de entrenamiento, evaluación y logs incluidos. El tamaño del repositorio (1,2 GB) corresponde a los tres checkpoints en PyTorch (`.pt`) más logs y diagnósticos, no a un modelo único de gran escala.

Al no existir model card con especificaciones detalladas de arquitectura, número de parámetros o datos de entrenamiento, buena parte de los campos técnicos de esta ficha se marcan como «no disponible». La licencia es MIT, lo que permite uso comercial y modificación con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo JEPA (LeWM) + política GCBC + generador de waypoints por flow matching (jerarquía de planificación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada visual de 64 px y chunks de 5 acciones) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.pt` sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema LeWM (JEPA, *Joint-Embedding Predictive Architecture*) aplicado como modelo del mundo latente: se entrena una representación predictiva del entorno visual a partir de observaciones de 64 píxeles, siguiendo la receta oficial del proyecto citado en la model card y durante 88 épocas. Sobre esa representación se entrena una política GCBC (*Goal-Conditioned Behavioral Cloning*) que predice chunks de 5 acciones durante 500 000 pasos, y un generador de waypoints latentes mediante *flow matching* durante 100 000 pasos. La combinación forma una jerarquía: el generador de waypoints propone objetivos latentes de alto nivel y la política GCBC ejecuta acciones de bajo nivel para alcanzarlos.

Los datos de entrenamiento son los *play data* del entorno OGBench `visual-cube-single` (tarea de manipulación de un cubo en un entorno visual simplificado). No se especifican en la información disponible el número de transiciones, la composición exacta del dataset ni si se aplicó RLHF/DPO (no aplica en este dominio). La innovación destacable es la planificación en espacio latente con flow matching sobre un modelo del mundo JEPA, en lugar de planificación en espacio de observaciones o acciones.

## Capacidades

- Predicción latente del entorno visual de OGBench `visual-cube-single` a 64 píxeles mediante el modelo del mundo LeWM.
- Clonación de comportamiento condicionada a objetivo (GCBC) con chunks de 5 acciones.
- Generación de waypoints latentes mediante flow matching para planificación jerárquica.
- Ejecución de una tarea de manipulación robótica concreta (mover un cubo) en el benchmark OGBench.
- Evaluación reproducible: scripts de entrenamiento (`train_lewm.py`, `train_policy.py`, `train_waypoint_flow.py`), evaluación y logs incluidos.
- Diagnóstico de ranking de costes (`diag_cost_ranking.py` y `diagnostics/cost_ranking_raw.json`).
- No dispone de generación de texto, tool calling, agentes conversacionales, visión general ni capacidades multilingües: está acotado al dominio robótico del benchmark.

## Casos de uso

- Investigación en modelos del mundo: usar `lewm.pt` como base para experimentos de representación predictiva latente en entornos visuales de control, comparando recetas de entrenamiento sobre OGBench.
- Planificación jerárquica en robótica: combinar `waypoint_flow.pt` y `policy_chunk5.pt` para probar esquemas de waypoint de alto nivel más política de bajo nivel en tareas de manipulación.
- Reproducción de resultados académicos: los logs y `results/` permiten replicar las evaluaciones del proyecto MIT 6.4212 y auditar curvas de entrenamiento.
- Aprendizaje por refuerzo offline: servir como línea base GCBC con chunks de 5 acciones para comparar con otros métodos de *behavioral cloning* sobre el mismo dataset de juego.
- Docencia y prácticas: material listo para ejecutar en un curso de robótica o aprendizaje profundo, con scripts de entrenamiento y evaluación ya publicados.
- Estudio de flow matching en espacio latente: emplear `waypoint_flow.pt` para analizar generadores de objetivos por flow matching frente a alternativas como difusión o regresión directa.
- Diagnóstico de costes de planificación: usar `diagnostics/cost_ranking_raw.json` para analizar cómo se rankean candidatos durante la planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `results/` y a `results/cost_ranking_summary.json` del repositorio de código, pero no incluye cifras de éxito, retorno medio ni comparaciones numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 1,2 GB, por lo que los tres checkpoints juntos caben con holgura en GPUs de consumo, pero no se especifica el tamaño individual de cada uno.
- GPU recomendadas: no disponibles; por el tamaño del entorno (observaciones de 64 px y chunks de 5 acciones) es plausible ejecutar en GPUs de consumo tipo RTX 3060/4090, aunque el autor no lo confirma.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, pero sin confirmación en la información disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). El despliegue esperado es mediante los scripts de PyTorch del repositorio de código.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ericjkge/ogb-cube` | Modelo del mundo JEPA + GCBC + flow matching | OGBench `visual-cube-single` 64 px, chunks de 5 acciones | MIT | Hugging Face (checkpoints `.pt`) |
| LeWM (receta oficial) | Modelo del mundo JEPA | OGBench a 64 px | no disponible | Referenciado como receta oficial, repo no enlazado en la información |
| GCBC (línea base OGBench) | Clonación de comportamiento condicionada a objetivo | OGBench | no disponible | Implementación de referencia del benchmark |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con LeWM oficial, GCBC u otros métodos del benchmark.

## Limitaciones y advertencias

- Dominio muy acotado: solo el entorno `visual-cube-single` de OGBench a 64 píxeles; no generaliza a otras tareas sin reentrenamiento.
- No es un modelo de lenguaje ni un modelo multimodal general: no sirve para texto, código, visión general ni agentes conversacionales.
- Sin métricas publicadas en la información disponible: no hay evidencia numérica de éxito de la política ni del modelo del mundo; es una prueba de concepto académica.
- Riesgo de sobreajuste a los *play data* del benchmark y de degradación fuera de la distribución de estados vista en entrenamiento.
- Sin documentación de sesgos, robustez o seguridad; al ser un proyecto de curso, la validación es limitada.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no hay garantías de idoneidad para producción.
- Fechas de creación y actualización del repositorio (noviembre de 2026) resultan anómalas respecto al resto de la información; conviene verificar la procedencia antes de usarlo.
- Repositorio con 0 descargas y 0 likes: no hay comunidad ni soporte asociado.

## Enlaces

- Hugging Face: https://huggingface.co/ericjkge/ogb-cube
- Repositorio de código del proyecto (`own_lewm/`): referenciado en la model card como «the project repo», sin URL explícita en la información disponible.
- OGBench (benchmark): https://github.com/seohongpark/ogbench (referencia habitual del benchmark, no enlazada en la model card).
- Resultados y diagnósticos: `own_lewm/results/`, `results/cost_ranking_summary.json` y `diagnostics/cost_ranking_raw.json` dentro del repositorio de código.
