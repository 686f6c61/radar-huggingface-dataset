# Myungkyu/pi0_5_jax_robodojo_vanilla_b64_60k

## Resumen

pi0_5_jax_robodojo_vanilla_b64_60k es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tune completo del checkpoint base lerobot/pi05_base (la arquitectura Pi0.5 de Physical Intelligence implementada en openpi sobre JAX) entrenado con el conjunto de datos RoboDojo-Benchmark/RoboDojo en su configuración de co-entrenamiento en simulación. El modelo actúa como baseline "vanilla" de referencia dentro del ecosistema RoboDojo, un benchmark de manipulación robótica.

El modelo resuelve el problema de mapear observaciones multimodales (imágenes de cabeza y de ambas muñecas, estado articular de 14 dimensiones e instrucción en lenguaje natural) a comandos motores concretos: 14 objetivos articulares absolutos. Está pensado para robots bimanuales ARX X5 y sigue la receta oficial pi05_base_aloha_full_sim_arx-x5_seed_0 con batch 64 durante 60.000 pasos de optimización.

Su relevancia es doble: por un lado sirve como punto de comparación reproducible para investigaciones que usen RoboDojo; por otro, demuestra un flujo completo de fine-tuning de Pi0.5 en JAX con exportación oficial de LeRobot, lo que facilita la replicación de experimentos. El repositorio ocupa 12,4 GB e incluye únicamente el checkpoint final, sin el estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (vision-language-action) sobre openpi en JAX; adaptador Pi_05 de XPolicyLab |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (chunk de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | Orbax (params/); configuración openpi en openpi.json |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Pi0.5, un VLA que combina un backbone vision-language con un cabezal de generación de acciones por chunks. En esta implementación concreta se usa la versión JAX de openpi (vendored en el adaptador Pi_05 de XPolicyLab) y se realiza un fine-tune completo del checkpoint gs://openpi-assets/checkpoints/pi05_base. La entrada son tres cámaras (cabeza, muñeca izquierda y muñeca derecha), un vector de estado articular de 14 dimensiones y la instrucción de la tarea; la salida son 14 objetivos articulares absolutos con representación de articulaciones delta y pinzas absolutas.

El entrenamiento sigue la receta oficial pi05_base_aloha_full_sim_arx-x5_seed_0 con batch 64 durante 60.000 pasos, sobre RoboDojo Sim en configuración de co-entrenamiento (35 tareas × 100 episodios) con robots bimanuales ARX X5. Se aplica normalización por cuantiles con las estadísticas de assets/arx_x5_sim/norm_stats.json y se mantienen pesos EMA con factor 0,99 en params/ (formato Orbax). El checkpoint publicado corresponde al paso final e incluye solo los pesos, no el estado del optimizador. La configuración de openpi asociada es pi05jax_robodojo (openpi.json), y el backbone y el tokenizer se referencian por hub id.

## Capacidades

- Generación de acciones robóticas bimanuales: produce 14 objetivos articulares absolutos a partir de observaciones visuales y estado articular.
- Percepción multimodal: procesa simultáneamente imagen de cabeza y de ambas muñecas junto con el estado de 14 articulaciones.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica mediante texto.
- Control por chunks de acción: genera secuencias de 50 pasos por inferencia, lo que reduce la frecuencia de llamada al modelo.
- Manipulación en simulación: entrenado específicamente para el entorno RoboDojo Sim con robots ARX X5.
- Co-entrenamiento multitarea: cubre 35 tareas distintas del benchmark.
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Baseline de referencia en RoboDojo: usar este checkpoint como punto de comparación fijo al evaluar nuevas variantes de Pi0.5 o de otros VLA sobre el mismo benchmark, garantizando una receta reproducible (batch 64, 60.000 pasos, misma normalización).
- Replicación de experimentos de fine-tuning: sirve como plantilla verificada del flujo openpi en JAX con exportación oficial de LeRobot, útil para equipos que quieran adaptar Pi0.5 a sus propios robots o datasets.
- Investigación en manipulación bimanual simulada: permite estudiar políticas bimanuales sobre el par ARX X5 en las 35 tareas de RoboDojo Sim sin tener que entrenar desde cero.
- Punto de partida para ablaciones: al ser un baseline "vanilla", facilita medir el impacto de cambios en datos, normalización, número de pasos o arquitectura comparando contra este modelo.
- Evaluación de robustez multimodal: permite analizar cómo influyen las vistas de muñeca frente a la vista de cabeza en el rendimiento, modificando las entradas y comparando contra este checkpoint.
- Docencia y formación en VLA: un checkpoint con receta explícita y configuración publicada es adecuado para cursos o tutoriales sobre políticas visión-lenguaje-acción en JAX.
- Integración en pipelines de simulación a gran escala: el formato Orbax y la configuración openpi permiten desplegarlo en infraestructura de evaluación automatizada sobre RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 12,4 GB en formato Orbax, lo que da una cota inferior aproximada del espacio necesario para cargar los pesos, pero no se especifica el consumo real en GPU.
- GPU recomendadas: no disponible. Al ser un modelo JAX/openpi, se espera compatibilidad con GPUs NVIDIA con soporte CUDA y JAX, pero el autor no documenta modelos concretos.
- Viabilidad en GPU de consumo: no confirmada. El tamaño del checkpoint (12,4 GB) sugiere que podría requerir GPUs con al menos 16-24 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: openpi en JAX (configuración pi05jax_robodojo), con pesos en Orbax y exportación oficial de LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_jax_robodojo_vanilla_b64_60k | no disponible | no disponible (chunk 50) | Fine-tune de pi05_base sobre RoboDojo Sim, 60k pasos, batch 64 | no disponible | Hugging Face (Myungkyu) |
| lerobot/pi05_base | no disponible | no disponible | Modelo base Pi0.5 de LeRobot | no disponible | Hugging Face (lerobot) |
| Otros baselines de RoboDojo | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con la información proporcionada: no se publican métricas de rendimiento ni especificaciones detalladas de los modelos de referencia.

## Limitaciones y advertencias

- Es un baseline "vanilla": no incorpora mejoras específicas y su rendimiento debe interpretarse como referencia mínima, no como estado del arte.
- Entrenado exclusivamente en simulación (RoboDojo Sim) con robots ARX X5; no hay evidencia de transferencia a robots reales ni a otras plataformas.
- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde este punto.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- No se documentan los idiomas soportados para las instrucciones en lenguaje natural.
- No se publican métricas de benchmarks, sesgos conocidos ni tasas de alucinación; al tratarse de un modelo de acción, el riesgo relevante es la ejecución de movimientos incorrectos o inseguros.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento.
- La dependencia de openpi en JAX y de configuraciones específicas (openpi.json, norm_stats.json, adaptador de XPolicyLab) añade complejidad de reproducción y riesgo de incompatibilidades entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi0_5_jax_robodojo_vanilla_b64_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Repositorio openpi (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Repositorio XPolicyLab (adaptador Pi_05): no disponible como enlace directo en la información proporcionada
- Paper de Pi0.5: no disponible en la información proporcionada
