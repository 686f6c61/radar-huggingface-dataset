# Myungkyu/pi0_5_jax_robotwin_vanilla_b64_60k

## Resumen

`pi0_5_jax_robotwin_vanilla_b64_60k` es un modelo de vision-lenguaje-accion (VLA) para robótica, publicado por el usuario Myungkyu en HuggingFace. Se trata de un fine-tune completo del checkpoint base `lerobot/pi05_base` (la familia Pi0.5 de Physical Intelligence) sobre el conjunto de datos RoboTwin 2.0, un benchmark de manipulación robótica simulada. El modelo toma imágenes de cabeza y de ambas muñecas, un estado articular de 14 dimensiones y una instrucción en lenguaje natural, y produce objetivos articulares absolutos de 14 dimensiones.

Su relevancia es doble: por un lado, sirve como baseline "vanilla" reproducible para el leaderboard de RoboTwin 2.0 en la configuración co-train (50 tareas x 50 episodios de `demo_clean` sobre el robot Aloha-AgileX); por otro, es una implementación en JAX del stack openpi, vendorizada en el adaptador Pi_05 de XPolicyLab, lo que facilita la comparación entre implementaciones JAX y PyTorch del mismo modelo base. El repositorio ocupa 12,4 GB e incluye los pesos EMA (0,99) en formato orbax.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada. El modelo está pensado para investigación en robótica simulada, no para despliegue comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) Pi0.5 sobre openpi en JAX; fine-tune completo del backbone `lerobot/pi05_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en orbax, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (las instrucciones son texto libre; el dataset es en ingles presumiblemente, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | orbax (params/ con pesos EMA 0,99); no se incluye estado del optimizador |
| Tamano del repo | 12,4 GB |
| Entradas | imagen de cabeza + imagenes de munecas izquierda/derecha, estado articular 14-d, instruccion de tarea |
| Salidas | objetivos articulares absolutos 14-d (delta joints con grippers absolutos) |
| Chunk de accion | 50 |
| Normalizacion | quantile norm con `assets/aloha_agilex_sim/norm_stats.json` |
| Config openpi | `pi05jax_robotwin` (openpi.json) |
| Receta de entrenamiento | `pi05_base_aloha_full_sim_arx-x5_seed_0`, batch 64, 60 000 pasos |
| Dataset | `TianxingChen/RoboTwin2.0` (50 tareas x 50 episodios `demo_clean`, Aloha-AgileX, export oficial LeRobot) |
| Modelo base | `lerobot/pi05_base` |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA ni adaptadores) del checkpoint `gs://openpi-assets/checkpoints/pi05_base` de openpi, ejecutado en JAX mediante el adaptador Pi_05 vendorizado en XPolicyLab. La arquitectura subyacente es Pi0.5, un modelo VLA que combina un backbone de vision-lenguaje con un cabezal de acciones que predice chunks de 50 pasos. La representación de acciones usa delta joints con grippers en valores absolutos, y las observaciones se normalizan por cuantiles con las estadísticas específicas del simulador Aloha-AgileX.

El entrenamiento sigue la receta oficial de RoboDojo `pi05_base_aloha_full_sim_arx-x5_seed_0`: batch de 64, 60 000 pasos de optimizador, sobre la configuración co-train de RoboTwin 2.0 (50 tareas con 50 episodios `demo_clean` cada una). Los pesos publicados son la media exponencial (EMA 0,99) del checkpoint final, almacenados en formato orbax bajo `params/`; el estado del optimizador no se incluye, por lo que el checkpoint no está pensado para reanudar entrenamiento, sino para inferencia o evaluación. Las configuraciones referencian el backbone y el tokenizer por hub id, lo que permite cargar el modelo sin duplicar pesos del backbone base.

## Capacidades

- Control robótico por imitación: genera trayectorias de 14 articulaciones a partir de imágenes multi-cámara e instrucción en lenguaje natural.
- Fusión multimodal: procesa simultáneamente imagen de cabeza y de ambas muñecas junto con el estado articular actual.
- Seguimiento de instrucciones: condiciona la política de acción a una descripción textual de la tarea.
- Predicción en chunks: emite bloques de 50 acciones, lo que reduce la frecuencia de inferencia y suaviza la ejecución.
- Generalización dentro del benchmark: entrenado en 50 tareas de RoboTwin 2.0 sobre Aloha-AgileX en simulación.
- Baseline reproducible: pensado para comparar variantes (co-train, fine-tune, arquitecturas alternativas) en el leaderboard de RoboTwin 2.0.
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Baseline de referencia en RoboTwin 2.0: usar este checkpoint como punto de partida para medir la mejora de nuevas recetas de entrenamiento (co-train, data augmentation, arquitecturas alternativas) en las mismas 50 tareas y condiciones.
- Evaluación de implementaciones JAX frente a PyTorch: al ser un fine-tune del mismo `pi05_base` sobre openpi en JAX, permite comparar numéricamente la fidelidad de la implementación JAX con la de referencia en PyTorch/LeRobot.
- Investigación en políticas VLA simuladas: estudiar cómo el modelo mapea instrucciones textuales a secuencias de acciones en un entorno controlado antes de transferir a hardware real.
- Desarrollo de pipelines de evaluación: integrar el checkpoint en harnesses de evaluación automatizada de RoboTwin 2.0 para generar métricas de éxito por tarea.
- Estudio de normalización y representación de acciones: el uso de quantile norm y delta joints con grippers absolutos permite analizar el impacto de estas decisiones en el rendimiento de la política.
- Punto de partida para fine-tuning específico: aunque no incluye estado del optimizador, los pesos EMA pueden servir como inicialización para adaptaciones a otros robots o tareas dentro del ecosistema openpi.
- Docencia y reproducción: al ser un baseline "vanilla" con receta pública, es adecuado para reproducir resultados y formar a nuevos investigadores en el stack openpi/JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 12,4 GB en orbax, lo que sugiere que los pesos en precisión completa ocupan un orden de magnitud similar. La inferencia requiere además memoria para el backbone de visión-lenguaje y el estado del entorno de simulación.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del checkpoint, es previsible que requiera GPUs de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM, pero no se confirma.
- ¿Cabe en consumer GPU?: no confirmado. Depende de la cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: el modelo está en JAX/orbax y depende del stack openpi con la config `pi05jax_robotwin`; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi0_5_jax_robotwin_vanilla_b64_60k` (este) | no disponible | no disponible | VLA robotica, RoboTwin 2.0 | no disponible | HuggingFace, JAX/orbax |
| `lerobot/pi05_base` | no disponible | no disponible | VLA base Pi0.5 | no disponible | HuggingFace, PyTorch/LeRobot |
| `TianxingChen/RoboTwin2.0` (dataset) | no aplica | no aplica | Benchmark de manipulacion | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación más directa es con el checkpoint base `lerobot/pi05_base`, del que este modelo es un fine-tune, y con otras variantes del leaderboard de RoboTwin 2.0, cuyos resultados no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (RoboTwin 2.0, Aloha-AgileX): no hay evidencia de transferencia a hardware real ni a otros robots.
- Sesgos del dataset: el modelo hereda las limitaciones de las 50 tareas y 50 episodios `demo_clean` por tarea; la generalización fuera de esa distribución es incierta.
- Riesgo de sobreajuste al benchmark: al ser un baseline "vanilla" con receta fija, su rendimiento en tareas no vistas del mismo simulador no está documentado.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base `lerobot/pi05_base` y del dataset `TianxingChen/RoboTwin2.0` antes de cualquier despliegue.
- Idiomas no documentados: no se especifica en qué idioma se esperan las instrucciones de tarea.
- Checkpoint sin estado del optimizador: no apto para reanudar entrenamiento tal cual; solo para inferencia o inicialización.
- Formato orbax/JAX: requiere el stack openpi y el adaptador Pi_05 de XPolicyLab; no es directamente cargable en frameworks PyTorch sin conversión.
- Sin resultados de benchmarks publicados: no se puede evaluar su calidad relativa sin ejecutar la evaluación en RoboTwin 2.0.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_jax_robotwin_vanilla_b64_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
