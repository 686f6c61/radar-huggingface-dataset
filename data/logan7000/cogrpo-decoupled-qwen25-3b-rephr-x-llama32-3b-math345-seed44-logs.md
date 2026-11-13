# logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed44-logs

## Resumen

El repositorio `logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed44-logs` no contiene pesos de un modelo, sino los registros de texto de una ejecución de entrenamiento concreto. En concreto, documenta un experimento de aprendizaje por refuerzo (GRPO, variante "co-GRPO" con datos desacoplados) en el que se emplean dos modelos de 3B parámetros: Qwen2.5-3B como grupo A y Llama-3.2-3B-Instruct como grupo B, sobre problemas de matemáticas de nivel 3 a 5 del dataset MATH, con semilla 44.

El entrenamiento se ejecutó en dos tramos sobre un clúster Slurm (jobs `j1774624` y `j1783749`) que suman 136 pasos en total. El primer tramo se detuvo por una caída del clúster en el paso 60 y el segundo se reanudó desde ese checkpoint hasta el paso 136, restaurando pesos y el calendario de learning rate, pero no los momentos del optimizador ni el estado del RNG. El paquete incluye además una prueba de humo de reanudación de 2 pasos y los logs de construcción del entorno Python.

Es relevante para investigadores que quieran reproducir o auditar experimentos de RL para razonamiento matemático con modelos pequeños, o comparar procedimientos de reanudación en clústeres. No es un modelo utilizable para inferencia: no hay pesos publicados, ni model card descriptiva de capacidades, ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene logs, no pesos; los modelos implicados son Qwen2.5-3B y Llama-3.2-3B-Instruct) |
| Parametros totales | no disponible (los modelos base empleados son de 3B parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene archivos de log de texto; no se incluyen binarios de wandb) |

## Arquitectura y entrenamiento

El objeto del repositorio es un procedimiento de entrenamiento, no una arquitectura de modelo nueva. Se trata de una ejecución de co-GRPO (Group Relative Policy Optimization con dos grupos de modelos) con datos desacoplados: el grupo A parte de Qwen2.5-3B y el grupo B de Llama-3.2-3B-Instruct, y ambos se entrenan sobre problemas de matemáticas reformulados ("rephrased") de nivel 3 a 5 del dataset MATH. La semilla del experimento es la 44.

El run consta de 136 pasos divididos en dos partes: los pasos 1-60 (job `j1774624`) y la reanudación desde el checkpoint-60 hasta el paso 136 (job `j1783749`). La reanudación restauró pesos y el calendario de learning rate, pero no los momentos del optimizador ni el estado del generador de números aleatorios, lo que introduce una discontinuidad que conviene tener en cuenta al interpretar las curvas de entrenamiento. El paquete `packaged/` incluye `selection.txt` con los checkpoints considerados mejores o de punto final para cada grupo, la configuración comparada con el run de referencia, el `trainer_state.json` y los argumentos de entrenamiento de los checkpoints seleccionados. También hay un directorio `env_build/` con los logs de construcción del entorno Python y un `resume_smoke_job1783748/` con una comprobación de 2 pasos del procedimiento de reanudación.

## Capacidades

- No es un modelo desplegable: el repositorio no publica pesos ni un pipeline de inferencia, por lo que no ofrece capacidades de generación, razonamiento, código, matemáticas ni visión directamente utilizables.
- Documenta un procedimiento de entrenamiento con RL (co-GRPO) aplicable a modelos de 3B para tareas de razonamiento matemático.
- Proporciona trazabilidad de una reanudación en clúster Slurm, incluyendo qué estado se restauró (pesos, learning rate) y qué no (momentos del optimizador, RNG).
- Incluye logs de texto de wandb (sin binarios), `train.log` por grupo, log del lanzador, comprobación de entorno y stdout/stderr de Slurm.
- Permite auditar la selección de checkpoints finales mediante `selection.txt` y comparar la configuración con el run de referencia.
- No se documentan capacidades multilingües, tool calling, agentes ni modos de razonamiento del modelo resultante.

## Casos de uso

- Reproducción de experimentos de RL para matemáticas: los logs permiten reconstruir la configuración, el número de pasos y la selección de checkpoints de un run de co-GRPO con dos modelos de 3B sobre MATH niveles 3-5.
- Auditoría de reanudaciones en clúster: el par de jobs y el `resume_smoke_job1783748` documentan qué estado se recupera y cuál no, útil para diseñar estrategias de checkpointing más robustas en Slurm.
- Comparación de metodologías co-GRPO: el directorio `packaged/` incluye la configuración comparada con el run de referencia, lo que facilita contrastar hiperparámetros y selección de checkpoints entre ejecuciones.
- Depuración de entornos de entrenamiento: `env_build/` recoge los logs de construcción del entorno Python, útil para replicar dependencias y detectar incompatibilidades.
- Docencia e investigación sobre RLHF/RL para razonamiento: sirve como material de estudio de un pipeline completo (lanzador, entrenamiento, reanudación, selección) con rutas y nombres de host anonimizados.
- Análisis de estabilidad del entrenamiento: la discontinuidad entre el paso 60 y el 61 (sin momentos del optimizador ni RNG) es un caso concreto para estudiar el impacto de reanudaciones parciales en curvas de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica para inferencia: el repositorio no contiene pesos del modelo.
- Para reproducir el entrenamiento se requiere un clúster con Slurm; los jobs `j1774624` y `j1783749` se ejecutaron en nodos cuyo nombre está anonimizado (`<node>`), sin que la información disponible detalle el tipo de GPU.
- El entrenamiento involucra dos modelos de 3B parámetros (Qwen2.5-3B y Llama-3.2-3B-Instruct); la VRAM necesaria para entrenar con RL a esa escala no está especificada en la información disponible.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni latencia o throughput.
- No cabe plantear despliegue en GPU de consumo porque no hay artefactos de modelo publicados.

## Comparativa con modelos similares

| Repositorio | Contenido | Modelos implicados | Licencia | Pesos publicados |
|---|---|---|---|---|
| logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed44-logs | Logs de entrenamiento co-GRPO (136 pasos) | Qwen2.5-3B y Llama-3.2-3B-Instruct | no disponible | No |
| Qwen2.5-3B (modelo base) | Pesos de un LLM de 3B | Qwen2.5-3B | no disponible en esta ficha | Sí (repositorio oficial) |
| Llama-3.2-3B-Instruct (modelo base) | Pesos de un LLM de 3B ajustado a instrucciones | Llama-3.2-3B-Instruct | no disponible en esta ficha | Sí (repositorio oficial) |

La comparación directa con modelos no es posible porque este repositorio no publica un modelo entrenado, solo los registros del proceso. Cualquier comparación de rendimiento requeriría los checkpoints seleccionados en `packaged/selection.txt`, que no están incluidos.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni tokenizador: no se puede cargar con `transformers`, vLLM ni llama.cpp.
- No hay model card con especificaciones de arquitectura, contexto, idiomas o licencia; la licencia figura como "no disponible".
- Al no haber licencia declarada, no se puede asumir permiso para uso comercial ni para redistribución de los logs.
- La reanudación desde el paso 60 no restauró momentos del optimizador ni estado RNG, lo que puede sesgar el análisis de las curvas de entrenamiento posteriores a ese punto.
- Los logs están anonimizados con marcadores (`<path>`, `<node>`, `<user>`), lo que limita la reproducibilidad exacta del entorno y del hardware.
- No se incluyen binarios de wandb, solo logs de texto, por lo que no hay métricas estructuradas completas.
- No hay información sobre sesgos, alucinación o calidad del modelo resultante, ya que no se publica el modelo final.
- Cualquier uso en producción requeriría partir de los modelos base (Qwen2.5-3B y Llama-3.2-3B-Instruct) y reproducir el entrenamiento, con los costes de cómputo asociados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed44-logs
- Dataset MATH (referenciado en la model card): no disponible en la información proporcionada
- Modelo base Qwen2.5-3B: no disponible en la información proporcionada
- Modelo base Llama-3.2-3B-Instruct: no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorios o demos adicionales: no disponible en la información proporcionada
