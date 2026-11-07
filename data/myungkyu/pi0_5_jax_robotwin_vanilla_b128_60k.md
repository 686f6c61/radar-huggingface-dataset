# Myungkyu/pi0_5_jax_robotwin_vanilla_b128_60k

## Resumen

pi0_5_jax_robotwin_vanilla_b128_60k es un modelo de vision-lenguaje-accion (VLA) para robotica, publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tune completo del checkpoint base lerobot/pi05_base (la arquitectura Pi0.5 de Physical Intelligence) implementado en JAX sobre el framework openpi, adaptado al conjunto de datos de simulacion RoboTwin 2.0. El modelo resuelve el problema de generar trayectorias de control de un brazo robotico bimanual Aloha-AgileX a partir de imagenes e instrucciones en lenguaje natural.

La relevancia de esta publicacion es que constituye un *baseline vanilla* reproducible para el leaderboard de RoboTwin 2.0 en su configuracion de co-entrenamiento (50 tareas x 50 episodios demo_clean), siguiendo la receta oficial RoboDojo `pi05_base_aloha_full_sim_arx-x5_seed_0`. Al liberar los checkpoints intermedios (pasos 15000, 30000 y 45000) ademas del final, permite estudiar la curva de aprendizaje del ajuste fino y sirve como punto de comparacion para variantes experimentales.

El repositorio ocupa 149,3 GB e incluye pesos en formato Orbax (propio del ecosistema JAX), no en safetensors ni GGUF. La ficha disponible no documenta licencia, idiomas ni resultados de benchmarks, por lo que muchos campos de especificacion quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) Pi0.5 sobre openpi, implementacion JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en Orbax, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | Orbax (params/); checkpoints intermedios con SHA256SUMS |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | TianxingChen/RoboTwin2.0 |
| Entradas | Imagenes head + munecas izquierda/derecha, estado articular 14-d, instruccion de tarea |
| Salidas | Objetivos articulares absolutos 14-d (delta joints con pinzas absolutas) |
| Tamano del repo | 149,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Pi0.5, una arquitectura VLA que combina un backbone vision-lenguaje con un cabezal de accion que predice secuencias de comandos motores. En esta implementacion concreta se usa la variante JAX de openpi, integrada mediante el adaptador XPolicyLab Pi_05. La salida se genera en *chunks* de 50 pasos de accion, con representacion de articulaciones en delta y pinzas en valor absoluto, y normalizacion por cuantiles usando las estadisticas `assets/aloha_agilex_sim/norm_stats.json`.

El entrenamiento consiste en un fine-tune completo del checkpoint `gs://openpi-assets/checkpoints/pi05_base` sobre RoboTwin 2.0 en configuracion de co-entrenamiento: 50 tareas con 50 episodios demo_clean cada una, plataforma Aloha-AgileX y exportacion oficial de LeRobot. Se uso batch de 128 y 60.000 pasos de optimizador, con media movil exponencial (EMA) de 0,99 cuyos pesos se guardan en `params/` en formato Orbax. La configuracion asociada es `pi05jax_robotwin` dentro del registro de configuraciones de openpi. El checkpoint final no incluye el estado del optimizador; tampoco los checkpoints intermedios.

## Capacidades

- Generacion de acciones roboticas: produce objetivos articulares de 14 dimensiones para un robot bimanual Aloha-AgileX a partir de instrucciones y observaciones visuales.
- Percepcion multimodal: procesa tres flujos de imagen (camara frontal y dos camaras de muneca) junto con el estado articular.
- Seguimiento de instrucciones: condiciona la politica de control a una instruccion de tarea en lenguaje natural.
- Control de horizonte corto: predice secuencias de 50 acciones por inferencia (action chunking).
- Especializacion en simulacion: entrenado sobre el benchmark RoboTwin 2.0, orientado a tareas de manipulacion simuladas.
- Checkpoints intermedios: permite evaluar el rendimiento en los pasos 15000, 30000 y 45000 ademas del final.
- No documentado: no hay evidencia en la informacion disponible de soporte de tool calling, agentes multi-paso, modo thinking, audio ni capacidades multilingues generales.

## Casos de uso

- Baseline de referencia para RoboTwin 2.0: sirve como punto de partida reproducible para comparar variantes de entrenamiento (distintos datasets, recetas o hiperparametros) en el leaderboard de co-entrenamiento.
- Investigacion en aprendizaje por imitacion: permite estudiar como evoluciona la politica con los pasos de entrenamiento usando los checkpoints 15k, 30k y 45k.
- Desarrollo de politicas bimanuales en simulacion: util para prototipar tareas de manipulacion con dos brazos Aloha-AgileX antes de transferir a hardware real.
- Evaluacion de frameworks JAX para robotica: al estar implementado sobre openpi en JAX, sirve para medir rendimiento de inferencia y entrenamiento en ese stack frente a alternativas PyTorch.
- Reproduccion de recetas RoboDojo: valida la receta oficial `pi05_base_aloha_full_sim_arx-x5_seed_0` con batch 128 y permite auditar su comportamiento.
- Generacion de datos sinteticos de control: las trayectorias predichas pueden usarse para aumentar datasets de manipulacion o para analisis de estabilidad de politicas.
- Punto de partida para fine-tuning en tareas nuevas: al ser un fine-tune completo del base, puede reajustarse sobre conjuntos propios de simulacion con la misma interfaz de entradas y salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano de los pesos en Orbax no se detalla por parametro; el repo completo ocupa 149,3 GB, pero incluye multiples checkpoints y estados, por lo que no equivale al peso de inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el uso de JAX y el tamano del repo, se requiere una GPU con memoria suficiente para cargar el backbone Pi0.5 y los tres flujos de imagen; no se especifican modelos concretos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante openpi (JAX) y el adaptador XPolicyLab Pi_05; descarga selectiva con `snapshot_download` y `allow_patterns`/`ignore_patterns`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de acciones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_jax_robotwin_vanilla_b128_60k | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (JAX/Orbax) |
| Myungkyu/pi05_robotwin_vanilla_b128_60k | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (variante LeRobot del mismo baseline) |
| lerobot/pi05_base | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion (RoboTwin 2.0, Aloha-AgileX): el rendimiento en robots reales no esta validado ni documentado.
- Especializado en 50 tareas concretas del benchmark; la generalizacion a tareas fuera de esa distribucion no esta evaluada.
- El checkpoint final no incluye el estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde ese punto.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a otros baselines.
- Riesgo de sobreajuste a las condiciones de simulacion (iluminacion, texturas, fisica) que puede degradar la transferencia sim-a-real.
- Idiomas soportados no documentados; el comportamiento ante instrucciones en castellano u otros idiomas distintos del usado en entrenamiento es desconocido.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/pi0_5_jax_robotwin_vanilla_b128_60k
- Variante LeRobot del mismo baseline: https://huggingface.co/Myungkyu/pi05_robotwin_vanilla_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboTwin 2.0: https://huggingface.co/datasets/TianxingChen/RoboTwin2.0
