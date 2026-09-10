# mattewg/pi05-xarm7-shaver-stage0

## Resumen

El repositorio `mattewg/pi05-xarm7-shaver-stage0` contiene un checkpoint de una política de robótica dirigida a una etapa concreta de una tarea bimanual con dos brazos xArm7. El modelo se presenta como `pi0.5 policy`, lo que lo vincula a la familia de políticas de visión-lenguaje-acción π0/π0.5, aunque la model card no documenta la arquitectura interna ni los datos de entrenamiento. Se trata de un checkpoint del paso 29999 del experimento `stage0_v1` y su tamaño de repositorio es de 12,4 GB. No se incluye `train_state`, por lo que está pensado para servir la política, no para reanudar el entrenamiento. La relevancia de este modelo es puramente robótica: es un artefacto de investigación o despliegue para controlar una tarea de ensamblaje de una caja-afeitadora con dos brazos xArm7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre y las etiquetas indican pi0.5, pero no se especifica la arquitectura) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (estructura de checkpoint con `params/`; no se especifica el formato) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. Por el nombre del repositorio y las etiquetas `pi0` y `openpi`, el checkpoint pertenece a la familia pi0.5, pero no se ofrecen detalles sobre el tipo de arquitectura (transformer, MoE, SSM, etc.), el número de parámetros, la longitud de contexto ni las técnicas de entrenamiento. Tampoco hay información sobre el dataset, el proceso de entrenamiento (RLHF, DPO, imitación) o el hardware utilizado. El único dato de entrenamiento disponible es que el checkpoint corresponde al paso 29999 de un experimento llamado `stage0_v1`. El contenido del repositorio incluye los pesos EMA (`params/`), un archivo `norm_stats.json` con estadísticas de normalización y metadatos `_CHECKPOINT_METADATA`. No se incluye `train_state`, que ocuparía 31 GB adicionales y solo sería útil para reanudar el entrenamiento.

## Capacidades

- Ejecución de una etapa de una tarea robótica bimanual, concretamente el denominado `stage0` de la tarea de la caja-afeitadora.
- Control de brazos xArm7: el espacio de estado y acción es de 16 dimensiones (7 articulaciones por brazo más pinza derecha y pinza izquierda), con relleno a 32 dimensiones.
- Las acciones sobre las articulaciones son de tipo delta (posiciones incrementales), mientras que las acciones sobre las pinzas son absolutas y booleanas (0,0 o 1,1).
- Trabaja a una frecuencia de muestreo de 60 fps, con un horizonte de acción de 16 pasos (`action_horizon=16`).
- La política procesa observaciones para generar acciones; no se indica explícitamente si es multimodal, y no se documentan capacidades de tool calling, generación de texto, razonamiento general, visión o audio.

## Casos de uso

- Control de la etapa `stage0` en una tarea de ensamblaje de una caja-afeitadora con dos brazos xArm7: el checkpoint se sirve como política para ejecutar esta fase concreta, aprovechando el espacio de acciones de 14 articulaciones y 2 pinzas.
- Despliegue en un entorno robótico real mediante `serve_policy.py`, el script del framework openpi. El checkpoint puede cargarse con el comando indicado en la model card, siempre que la configuración `repo_id` coincida con el directorio dentro de `assets/`.
- Reentrenamiento o afinado de la política para variantes de la tarea: al incluir `norm_stats.json`, se puede adaptar la normalización de observaciones al nuevo entorno sin recalcularla desde cero.
- Investigación en transferencia entre etapas de la tarea (stage0, stage1, etc.): se puede comparar el comportamiento de la política en el paso 29999 con otros checkpoints del mismo experimento.
- Benchmark de políticas bimanuales en un banco de pruebas xArm7: los investigadores pueden usar este checkpoint como referencia para medir el rendimiento de control de la pieza en la etapa inicial.
- Reproducción de experimentos en el framework openpi: el checkpoint está guardado en el formato de pesos de openpi y puede integrarse en pipelines de evaluación existentes; sin embargo, al carecer de `train_state`, no permite reanudar el entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas específicas de control robótico. El rendimiento de la política solo podría evaluarse ejecutando la tarea en un sistema xArm7 real o simulado, pero no se aportan resultados de dichas evaluaciones.

## Requisitos de hardware

- El tamaño del repositorio es de 12,4 GB, pero no se puede estimar la VRAM necesaria para inferencia sin conocer el número de parámetros ni el coste de la etapa de codificación visual.
- El autor no indica qué GPU o hardware es necesario para servir el checkpoint.
- No se dispone de datos de latencia o throughput.
- El checkpoint está pensado para ser servido mediante `serve_policy.py` del framework openpi, lo que sugiere una integración con JAX/Orbax; no se mencionan opciones como vLLM, llama.cpp, Ollama o TGI, que son específicas de modelos de lenguaje generativo.
- Es necesario disponer de un entorno robótico con brazos xArm7 para probar la política.

## Comparativa con modelos similares

No disponible. No se ha proporcionado información sobre modelos comparables de la misma categoría (políticas robóticas bimanuales o variantes de pi0.5) en los datos de la model card ni en la búsqueda web realizada. No es posible establecer una comparación fiable en términos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta la licencia, por lo que no se conoce si el modelo puede usarse con fines comerciales; se recomienda contactar con el autor antes de cualquier uso productivo.
- No se especifican los datos de entrenamiento ni los sesgos potenciales; el comportamiento de la política puede estar sesgado hacia las dinámicas concretas de la tarea original.
- Al ser un checkpoint de una etapa específica (`stage0`), el modelo no es una política generalista y no funcionará fuera de la tarea y el entorno para los que fue entrenado.
- No se incluye configuración en el checkpoint. El servir la política requiere que la configuración del entorno y el `repo_id` coincidan, tal como indica la model card; usar una configuración por defecto (como `pi05_xarm7_real`) provocará fallos en la resolución de las estadísticas de normalización.
- No se proporcionan métricas de robustez ni de seguridad, por lo que existe riesgo de comportamientos no deseados en entornos no controlados.
- El repositorio no incluye `train_state`, lo que impide reanudar el entrenamiento desde este checkpoint sin reconstruir el estado completo a partir de otra fuente.

## Enlaces

- HuggingFace: https://huggingface.co/mattewg/pi05-xarm7-shaver-stage0
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios) en los resultados de la búsqueda web.
