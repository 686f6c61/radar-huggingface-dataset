# Berkeley-ICON-Lab/SAMBAR-checkpoints

## Resumen

SAMBAR-checkpoints es un repositorio de pesos publicado por el laboratorio Berkeley-ICON-Lab en Hugging Face, etiquetado dentro del pipeline de robótica y asociado al entorno de evaluación LIBERO. El nombre del repositorio indica que se trata de un conjunto de checkpoints (no de un modelo único) destinado a tareas de manipulación robótica, presumiblemente dentro de la familia de políticas visomotoras entrenadas para el benchmark LIBERO. El repositorio tiene un tamaño de 24,9 GB y los pesos se distribuyen en formato JAX/Orbax, lo que lo vincula al ecosistema de entrenamiento en JAX en lugar de PyTorch.

La relevancia del artefacto es acotada pero específica: los checkpoints de políticas para LIBERO son el insumo habitual para reproducir resultados de manipulación de largo horizonte y para realizar evaluaciones comparativas entre métodos de imitación visomotora. Al estar alojado en JAX/Orbax, resulta especialmente útil para investigadores que trabajan con stacks de entrenamiento en JAX y necesitan pesos listos para evaluar sin reentrenar.

No se dispone de información pública en la ficha de Hugging Face sobre arquitectura, número de parámetros, longitud de contexto, licencia ni idiomas soportados. El acceso está restringido (gated) y requiere aceptar condiciones en la plataforma antes de la descarga. Los datos de esta ficha se limitan, por tanto, a lo declarado en la metadata del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de checkpoints para robótica; stack JAX/Orbax) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoints JAX); no se declaran safetensors ni GGUF |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura del modelo subyacente. Los tags del repositorio (`jax`, `orbax`, `libero`, `robotics`) indican que los checkpoints se guardaron con Orbax, la librería de serialización de estado de JAX, y que el entorno de evaluación de referencia es LIBERO, un benchmark de manipulación robótica con tareas de largo horizonte y composición de habilidades. El tamaño del repositorio (24,9 GB) sugiere múltiples checkpoints o pesos de tamaño medio-alto, pero no permite inferir el número de parámetros sin inspeccionar los ficheros.

Tampoco se dispone de datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (decodificación especulativa, atención lineal, etc.). Cualquier afirmación al respecto sería especulativa y se omite.

## Capacidades

- Ejecución de políticas visomotoras para tareas de manipulación robótica, en el marco del benchmark LIBERO.
- Integración con stacks de evaluación en JAX mediante carga de checkpoints Orbax.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se declara soporte de thinking mode, audio ni otras modalidades fuera de la robótica.

## Casos de uso

- Reproducción de resultados en LIBERO: cargar los checkpoints con Orbax y ejecutar el pipeline de evaluación oficial para verificar métricas de éxito en las suites de tareas del benchmark.
- Comparación de métodos de imitación visomotora: usar estos pesos como línea base frente a políticas propias entrenadas en el mismo entorno.
- Investigación en manipulación de largo horizonte: evaluar el comportamiento en tareas compuestas de LIBERO, donde la política debe encadenar subtareas.
- Desarrollo sobre JAX: integrar los checkpoints en un stack de entrenamiento o inferencia en JAX sin conversión a PyTorch.
- Análisis de fallos y robustez: ejecutar rollouts controlados para estudiar modos de fallo en entornos simulados antes de transferir a hardware real.
- Docencia y experimentación académica: disponer de pesos preentrenados para prácticas de robótica en simulación sin coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño real de los checkpoints, que no se declara.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: carga mediante Orbax en el ecosistema JAX; no se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni métricas que permitan establecer una comparación con otras políticas para LIBERO.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- Licencia no declarada: no puede asumirse uso comercial; debe verificarse con los autores antes de cualquier despliegue en producción.
- Ausencia de documentación técnica en la ficha: no se especifican arquitectura, parámetros ni datos de entrenamiento, lo que dificulta la evaluación previa.
- Formato Orbax/JAX: requiere tooling específico; no es directamente compatible con cargadores PyTorch habituales sin conversión.
- Ámbito limitado a robótica y al benchmark LIBERO: no es un modelo de propósito general y no debe emplearse para tareas de lenguaje o visión fuera de su dominio.
- Sin métricas publicadas: no es posible estimar fiabilidad ni tasas de éxito sin ejecutar la evaluación por cuenta propia.
- Riesgo de sobreajuste al simulador: los resultados en LIBERO no garantizan transferencia a entornos reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Berkeley-ICON-Lab/SAMBAR-checkpoints
