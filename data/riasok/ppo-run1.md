# Riasok/PPO-run1

## Resumen

PPO-run1 es un checkpoint de aprendizaje por refuerzo (PPO) construido sobre el modelo base Riasok/few-shot-run-1, un adaptador de flujo (flow matching) para el sistema MolmoAct2 orientado a robótica manipulativa. Lo publica el usuario Riasok en Hugging Face y su propósito es preservar el estado exacto del entrenamiento en la actualización 80 de una ejecución extendida de PPO, que alcanzó una tasa de éxito de 63 sobre 100 en ensayos emparejados del benchmark LIBERO Spatial.

El modelo no es un transformer de lenguaje al uso: es un adaptador de política (actor con cabeza de valor) que se apoya en un VLM congelado y en los procesadores guardados del modelo base. Por tanto, no puede cargarse como un checkpoint estándar de Transformers ni usarse para generación de texto; requiere el entorno de entrenamiento MolmoAct2 con LeRobot habilitado.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigadores que trabajan en RL aplicado a manipulación robótica con MolmoAct2, ya que incluye el checkpoint binario original byte a byte (actor, cabeza de valor, optimizador y estados RNG por rango), junto con los ficheros de evaluación y procedencia. El repositorio ocupa 6,9 GB y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de flujo (flow matching) sobre VLM congelado, con actor PPO y cabeza de valor; framework MolmoAct2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluación con horizonte 280 y chunks de acción de 10) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`update_080.pt`, checkpoint de entrenamiento con actor, value head, optimizador y RNG) |

## Arquitectura y entrenamiento

El modelo es un adaptador de política entrenado con PPO sobre un backbone VLM congelado (Riasok/few-shot-run-1). La inferencia utiliza flow matching continuo con 10 pasos de flujo y un `noise_std` de 0,05, generando chunks de acción de 10 pasos. La observación combina imágenes de agente y de muñeca a 256 px, con 50 pasos de asentamiento y un horizonte de evaluación de 280 pasos.

El checkpoint corresponde a la actualización 80 de una ejecución PPO extendida y se conserva byte a byte, incluyendo el estado del optimizador y los estados RNG por rango, lo que permite reanudar el entrenamiento de forma determinista. La selección del checkpoint se hizo sobre 100 ensayos emparejados en LIBERO Spatial; el propio autor advierte que esa cifra no equivale a un benchmark de 500 episodios. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Control de política para manipulación robótica en entornos LIBERO Spatial.
- Generación de acciones continuas mediante flow matching con 10 pasos de inferencia.
- Procesamiento multimodal de observaciones: imagen de agente e imagen de muñeca a 256 px.
- Ejecución de episodios con horizonte de 280 pasos y chunks de acción de 10.
- Reanudación determinista del entrenamiento gracias a los estados RNG y del optimizador incluidos.
- Evaluación reproducible mediante los ficheros `eval_080.json`, `provenance.json` y `training_config.json`.
- No soporta tool calling, function calling, agentes multi-paso genéricos ni generación de texto.

## Casos de uso

- Investigación en RL para robótica: reproducir el resultado de 63/100 en LIBERO Spatial cargando el checkpoint con el entorno MolmoAct2 y el modelo base, útil para comparar variantes de PPO.
- Reanudación de entrenamiento: al incluir optimizador y estados RNG, permite continuar la ejecución desde la actualización 80 sin perder determinismo.
- Baseline de referencia: sirve como punto de comparación para nuevas ejecuciones PPO o de otros algoritmos sobre el mismo adaptador SFT.
- Auditoría de procedencia: los ficheros de manifiesto y checksums permiten verificar la integridad de los pesos y la dependencia del modelo SFT.
- Evaluación de políticas de manipulación: el pipeline de inferencia con flow matching y chunks de acción de 10 puede reutilizarse para medir éxito en tareas Spatial.
- Estudio de estabilidad del entrenamiento: el checkpoint intermedio documentado facilita analizar la evolución de la política entre actualizaciones.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LIBERO Spatial (ensayos emparejados) | 63/100 (63 %) | Actualización 80; 100 ensayos; no es un benchmark de 500 episodios |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM generalista.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 6,9 GB y requiere además cargar el VLM congelado del modelo base, por lo que el consumo real será superior.
- GPU recomendadas: no disponibles en la información proporcionada; el código de ejemplo usa `adapter.to('cuda')`.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño del VLM congelado y del adaptador.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el entorno MolmoAct2 con LeRobot habilitado y el driver de entrenamiento incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores PPO para MolmoAct2 sobre LIBERO Spatial) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint no es un modelo autónomo: depende del VLM congelado y de los procesadores de Riasok/few-shot-run-1.
- No es un checkpoint estándar de Transformers; requiere el entorno MolmoAct2 con LeRobot y código propio (`runtime.flow_ppo_pilot_v1`).
- El resultado de 63/100 procede de 100 ensayos emparejados, no de un benchmark completo de 500 episodios; puede no ser representativo.
- El driver de entrenamiento incluido contiene rutas absolutas originales que deben sustituirse antes de reutilizarlo.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados; el modelo no está orientado a tareas lingüísticas.
- Riesgo de sobreajuste al entorno y configuración específicos de LIBERO Spatial; la generalización a otros entornos no está documentada.
- Sin datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución en robótica.

## Enlaces

- Hugging Face: https://huggingface.co/Riasok/PPO-run1
- Modelo base: https://huggingface.co/Riasok/few-shot-run-1
