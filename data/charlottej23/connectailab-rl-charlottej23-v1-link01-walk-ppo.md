# Charlottej23/connectailab-rl-charlottej23-v1-link01-walk-ppo

## Resumen

`connectailab-rl-charlottej23-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo entrenado con PPO (Proximal Policy Optimization) mediante la libreria Stable-Baselines3 para controlar la locomocion de LINK-01, un robot bipedo simulado en MuJoCo dentro del entorno `Link01Walk-v0` (paquete `link01-gym`). El modelo lo publica Charlotte (JOOEUN KIM), autora vinculada a CONNECT AI LAB, y forma parte de una serie de modelos de decision y robotica del mismo perfil.

No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal que mapea observaciones de 51 dimensiones a acciones continuas de 14 dimensiones (una por articulacion, con postura base de ±0.18 rad). Su interes practico esta en servir como referencia reproducible de entrenamiento de locomocion desde cero: 2 millones de pasos en 16,57 minutos con 16 entornos paralelos, sin curriculum ni imitacion.

El repositorio es muy pequeno (0,0 GB segun Hugging Face) y contiene los artefactos habituales de Stable-Baselines3 (`model.zip`, `vecnormalize.pkl`, `actor.json`). La relevancia actual es la de un baseline ligero y barato de reproducir para investigacion en robotica simulada, no la de un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de RL (PPO, Stable-Baselines3); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; observacion de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos de politica en `model.zip`; no se publican GGUF ni safetensors) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible en la informacion proporcionada |
| Formato de pesos | `model.zip` (formato nativo de Stable-Baselines3), `vecnormalize.pkl`, `actor.json` |

Otros datos tecnicos declarados en la model card:

| Parametro | Valor |
|---|---|
| Entorno | `Link01Walk-v0` (link01-gym, MuJoCo) |
| Dimension de observacion | 51 |
| Dimension de accion | 14 (14 articulaciones, postura base ±0.18 rad) |
| Algoritmo | PPO |
| Pasos de entrenamiento | 2.000.000 |
| Tiempo de entrenamiento | 16,57 minutos |
| Entornos paralelos | 16 |
| `n_steps` | 512 |
| `batch_size` | 512 |
| `n_epochs` | 8 |
| Learning rate | 5e-4 → 1e-4 |
| `gamma` | 0,99 |
| `gae_lambda` | 0,95 |
| `clip` | 0,2 |
| Rango de velocidad de comando (`vx_range`) | 0,15–0,25 m/s |
| Objetivo | `faster_locomotion` |

## Arquitectura y entrenamiento

La politica se entrena con PPO implementado en Stable-Baselines3 sobre el entorno `Link01Walk-v0` de MuJoCo. La observacion tiene 51 componentes y la accion 14 componentes continuas correspondientes a las articulaciones del robot bipedo LINK-01, con una postura base de ±0,18 rad. El entrenamiento parte de cero (sin imitacion ni curriculum declarado), con 16 entornos vectorizados en paralelo, `n_steps` de 512, `batch_size` de 512, 8 epochs por actualizacion, learning rate con decaimiento de 5e-4 a 1e-4, `gamma` 0,99, `gae_lambda` 0,95 y clipping de 0,2. En total, 2 millones de pasos completados en 16,57 minutos.

El objetivo declarado es `faster_locomotion`, con comandos de velocidad longitudinal en el rango 0,15–0,25 m/s. El paquete de artefactos incluye la normalizacion de observaciones (`vecnormalize.pkl`), imprescindible para reproducir la inferencia con las mismas estadisticas usadas en entrenamiento, y una exportacion de la politica del actor en `actor.json`. No se documentan innovaciones adicionales como decodificacion especulativa, attention linear ni mecanismos hibridos; se trata de un PPO canonico sobre MuJoCo.

## Capacidades

- Control de locomocion bipeda: genera acciones articulares continuas para que LINK-01 avance en simulacion MuJoCo.
- Seguimiento de comandos de velocidad: entrenado para consignas de 0,15–0,25 m/s en el eje longitudinal.
- Estabilidad declarada: 0 caidas por minuto en la evaluacion reportada.
- Politica reactiva por paso: mapea directamente observacion (51) a accion (14), sin planificacion explicita.
- Reproducibilidad: artefactos completos (`model.zip`, `vecnormalize.pkl`, `actor.json`) para recargar con Stable-Baselines3.
- No dispone de tool calling, function calling, soporte de agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento; esas capacidades no aplican a este tipo de modelo.

## Casos de uso

- Baseline de locomocion en investigacion: cargar `model.zip` y `vecnormalize.pkl` con Stable-Baselines3 para comparar nuevas politicas PPO contra un referencia reproducible de 2 millones de pasos y 0 caidas/minuto.
- Pruebas de robustez en simulacion: exponer la politica a perturbaciones en `Link01Walk-v0` (ruido en observaciones, cambios de friccion) para medir degradacion de velocidad y tasa de caidas antes de transferir a hardware.
- Generacion de datos sinteticos de marcha: ejecutar rollouts del agente para producir trayectorias articulares etiquetadas que sirvan de datos de preentrenamiento o de imitacion para otros controladores.
- Validacion de pipelines de RL: usar el par `model.zip` + `vecnormalize.pkl` como caso de prueba end-to-end en CI para verificar que una version de Stable-Baselines3 o de MuJoCo reproduce las metricas declaradas.
- Ajuste fino con PPO: reutilizar los pesos como inicializacion en variantes del entorno (nuevos rangos de `vx_range` u objetivos como eficiencia energetica) para reducir pasos de entrenamiento frente a un arranque desde cero.
- Demostraciones y docencia: reproducir el entrenamiento completo en minutos (16,57 min con 16 entornos) para ilustrar PPO, vectorizacion de entornos y normalizacion de observaciones en cursos de RL aplicado a robotica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), no verificados de forma independiente (`verified: false`). Evaluacion: comandos de 0,18 m/s, 5 episodios de 20 segundos cada uno, entorno `Link01Walk-v0`.

| Metrica | Valor | Verificado |
|---|---|---|
| Distancia por episodio de 20 s | 4,993 m | No |
| Velocidad media de avance | 0,2497 m/s | No |
| Caidas por minuto | 0,0 | No |

No se han publicado resultados de benchmarks comparativos con otros agentes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la politica es de dimension reducida (observacion 51, accion 14), por lo que se espera que quepa en GPU consumer de gama baja, aunque no se publica un calculo exacto.
- GPU recomendadas: no disponibles; para inferencia basta una GPU consumer moderna, y el entrenamiento declarado (16 entornos, 2 millones de pasos, 16,57 minutos) sugiere hardware de gama media-alta, pero el autor no especifica el modelo utilizado.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del artefacto; no confirmado por el autor.
- Opciones de despliegue: Stable-Baselines3 (carga de `model.zip` con `vecnormalize.pkl`), MuJoCo con `link01-gym` para el entorno, y exportacion del actor via `actor.json` para inferencia propia. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `connectailab-rl-charlottej23-v1-link01-walk-ppo` (este) | PPO, locomocion bipeda MuJoCo | no disponible | no aplica | 4,993 m/episodio, 0,2497 m/s, 0 caidas/min | no disponible | Hugging Face, repo de 0,0 GB |
| `Charlottej23/connectailab-rl-superwoman-1-v1-link01` | RL sobre LINK-01 con PEFT/LoRA, safetensors | no disponible | no disponible | no disponible | apache-2.0 (segun la pagina del modelo) | Hugging Face |
| `Charlottej23/connectailab-rl-decider-v3-teacher` | RL de toma de decisiones (entorno tipo tycoon, PPO) | no disponible | no disponible | no disponible | apache-2.0 (segun la pagina del modelo) | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento queda como "no disponible".

## Limitaciones y advertencias

- Ambito muy acotado: solo locomocion bipeda en el entorno simulado `Link01Walk-v0`; no es un modelo de lenguaje ni un sistema multimodal.
- Metricas no verificadas: los resultados del `model-index` estan marcados como `verified: false` y proceden del propio autor.
- Rendimiento limitado: velocidad media de 0,2497 m/s frente a comandos de 0,18 m/s, con distancia de 4,993 m por episodio de 20 s; no se documenta generalizacion a otros comandos, terrenos o robots.
- Dependencia fuerte del entorno y de la normalizacion: la inferencia requiere `vecnormalize.pkl` y la version compatible de `link01-gym`/MuJoCo; cambios de version pueden alterar el comportamiento.
- Riesgo de brecha sim-to-real: no se publican experimentos en hardware fisico ni tecnicas de domain randomization, por lo que la transferencia al robot real no esta validada.
- Licencia no disponible: no se indica licencia en la informacion proporcionada, lo que impide confirmar condiciones de uso comercial; debe consultarse el repositorio antes de cualquier despliegue.
- Idiomas no aplicables: el modelo no procesa texto, por lo que no hay soporte linguistico que evaluar.
- Sin garantias de mantenimiento: repositorio creado y actualizado el mismo dia (2026-11-07), con 0 descargas y 0 likes; no hay hoja de ruta ni issues documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlottej23/connectailab-rl-charlottej23-v1-link01-walk-ppo
- Modelo relacionado `connectailab-rl-superwoman-1-v1-link01`: https://huggingface.co/Charlottej23/connectailab-rl-superwoman-1-v1-link01
- Modelo relacionado `connectailab-rl-decider-v3-teacher`: https://huggingface.co/Charlottej23/connectailab-rl-decider-v3-teacher/tree/main
- Portfolio de la autora: https://kailogic.kr/portfolio
- GitHub de la autora: https://github.com/charlottj23
- LinkedIn de la autora: https://www.linkedin.com/in/jooeun-kim-676a5b308/
- YouTube de la autora: https://www.youtube.com/@createtosurvive-x
- App citada en la model card (Google Play): https://play.google.com/store/apps/details?id=com.golbang.prayer&hl=ko
- Web citada en la model card: https://golbangprayer.xyz
