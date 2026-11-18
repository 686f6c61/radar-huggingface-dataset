# grablab/act_pick_place_mix_v3_dagger2_010000

## Resumen

`grablab/act_pick_place_mix_v3_dagger2_010000` es un checkpoint de política robótica basada en ACT (Action Chunking with Transformers) entrenado con la librería LeRobot de Hugging Face. Lo publica el usuario `grablab` y está diseñado específicamente para una tarea de pick-and-place con dial sobre el brazo robótico SO-101 en simulación MuJoCo, con un perfil de rig real (v3). El checkpoint corresponde al paso 10.000 de entrenamiento y se distribuye en formato `safetensors` con 51.668.614 parámetros (aproximadamente 51,7 M), un tamaño de repo de 0,2 GB.

No es un modelo de lenguaje: es una política de imitación (imitation learning) que mapea observaciones visuales y de estado del robot a secuencias de acciones de control. Su relevancia es acotada al ámbito de la robótica de manipulación y al ecosistema LeRobot, donde sirve como referencia reproducible de un pipeline de entrenamiento con DAgger (el sufijo `dagger2` sugiere una segunda iteración de agregación de datos). La model card es extremadamente escueta y remite a documentación externa en un repositorio de GitHub (`chanwill245/pnpmodel`, rama `v3-grip-fix`).

La información pública disponible es mínima: no hay licencia declarada, no se especifican idiomas (no aplica en sentido estricto), no hay benchmarks publicados y las descargas y likes son cero en el momento de la consulta. Todo lo que sigue se limita a lo que consta en los metadatos y la model card, marcando como "no disponible" cualquier dato ausente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para control robótico |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: política robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot, `pretrained_model`) |

## Arquitectura y entrenamiento

ACT es una arquitectura de transformer diseñada para imitación visomotora que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. El checkpoint se entrenó con LeRobot sobre la tarea "SO-101 dial pick-and-place" en simulación MuJoCo con un perfil de rig real (v3), según la model card. El sufijo `dagger2` indica que el dataset de entrenamiento incorpora una segunda ronda de DAgger (Dataset Aggregation), técnica en la que un policy experto etiqueta los estados visitados por la política aprendida para corregir la distribución de estados.

El entrenamiento se ejecutó en el clúster HPC del Colegio de Ingeniería de la San José State University (SJSU CoE HPC), según la model card. No se especifican el número de tokens (no aplica), el volumen de episodios de demostración, la composición del dataset, ni si hubo RLHF/DPO (no procede en este dominio). Tampoco se detallan innovaciones técnicas adicionales más allá del uso estándar de ACT con DAgger. El checkpoint corresponde al paso 10.000 de entrenamiento.

## Capacidades

- Control visomotor para manipulación robótica: genera secuencias de acciones (action chunks) a partir de observaciones visuales y de estado del brazo SO-101.
- Ejecución de la tarea específica de pick-and-place con dial en simulación MuJoCo (perfil v3 de rig real).
- Aprendizaje por imitación con agregación de datos DAgger (segunda iteración), orientado a corregir el sesgo de distribución de la política.
- Integración nativa con el ecosistema LeRobot (carga de checkpoints `pretrained_model`, pipelines de evaluación y despliegue).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, código ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Reproducción de experimentos de imitación en LeRobot: cargar el checkpoint `pretrained_model` en un entorno MuJoCo con el rig SO-101 v3 para replicar la tarea de pick-and-place con dial y comparar curvas de entrenamiento en el paso 10.000.
- Punto de partida para fine-tuning con DAgger: usar este checkpoint como política inicial y recolectar nuevas correcciones del experto para una tercera iteración de agregación de datos.
- Evaluación de pipelines de simulación a real: servir como referencia de política entrenada en sim con perfil de rig real para medir la brecha sim-to-real antes de desplegar en hardware SO-101.
- Docencia e investigación en robótica: ejemplo reproducible de entrenamiento ACT en HPC (SJSU CoE) para cursos o trabajos sobre aprendizaje por imitación.
- Benchmark interno de infraestructura: medir throughput de inferencia y latencia de action chunking en distintas GPUs con un checkpoint de 51,7 M de parámetros y repo de 0,2 GB.
- Base para experimentos de curriculum o mezcla de datos: el nombre `mix_v3` sugiere una mezcla de datasets; el checkpoint puede usarse como ablación frente a variantes sin DAgger o con otros perfiles de rig.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas. Los resultados se remiten a `docs/MODELS.md` en el repositorio externo `chanwill245/pnpmodel` (rama `v3-grip-fix`), que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, asumiendo overhead de activaciones y buffers de observación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con soporte CUDA (RTX 3060 en adelante) es suficiente para inferencia; el entrenamiento en HPC se realizó en el clúster SJSU CoE, sin detallar el modelo de acelerador.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4 GB de VRAM; el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (carga de checkpoints `pretrained_model`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas ACT comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría (por ejemplo, otras políticas LeRobot para SO-101 o variantes de ACT/Diffusion Policy).

## Limitaciones y advertencias

- Model card extremadamente escueta: no se documentan dataset, hiperparámetros, métricas ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Especialización estrecha: la política está entrenada para una única tarea (pick-and-place con dial) y un único perfil de rig (SO-101 v3 en MuJoCo); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Entrenada en simulación: riesgo de brecha sim-to-real no cuantificada; el rendimiento en hardware físico es desconocido.
- Riesgo de sobreajuste al dataset de demostración y a la distribución de estados cubierta por DAgger; estados fuera de distribución pueden degradar el control.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas aplicables (no es un modelo de lenguaje), pero sí existe riesgo de fallos silenciosos en la ejecución motora.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Los resultados de referencia están en un repositorio externo no verificado en esta ficha; conviene revisarlos antes de confiar en el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/grablab/act_pick_place_mix_v3_dagger2_010000
- Repositorio de resultados y datos citado en la model card: `chanwill245/pnpmodel`, rama `v3-grip-fix`, archivo `docs/MODELS.md` (no se proporciona URL directa)
- LeRobot (librería): no se proporciona enlace en la información disponible
- Paper de ACT: no se proporciona enlace en la información disponible
