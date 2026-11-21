# LordN77/ppo-SnowballTarget

## Resumen

`LordN77/ppo-SnowballTarget` es una política de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) para el entorno SnowballTarget de Unity ML-Agents, el escenario práctico de la unidad 5 del Deep RL Course de Hugging Face. El modelo no es un LLM ni un modelo generativo de texto: es un agente que controla un personaje dentro de una simulación Unity y aprende a lanzar bolas de nieve contra un objetivo móvil. Lo desarrolla el usuario LordN77 y se publica como artefacto reproducible del curso, con pesos exportados a ONNX y scripts de verificación.

El interés del modelo es fundamentalmente educativo y de reproducibilidad: utiliza ML-Agents 1.1.0 y PyTorch 2.5.1, entrena durante 160.512 pasos y se evalúa sobre 32 episodios held-out con acciones estocásticas sembradas, obteniendo una recompensa media de 21,3125 ± 2,3108. Incluye `training.yaml` con la configuración de entrenamiento y `restore_onnx.py`, que reconstruye byte a byte el fichero `SnowballTarget.onnx` previa verificación del digest SHA-256.

No hay información sobre arquitectura de red, tamaño de parámetros, contexto, idiomas ni licencia en la información disponible; se trata de un agente de RL de dominio muy acotado (un único entorno Unity), no de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal entrenada con PPO; red definida en `training.yaml`, no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica: agente de RL con observaciones del entorno Unity) |
| Tipos de cuantizacion | no disponible (pesos exportados en formato ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`SnowballTarget.onnx`, recuperable byte a byte via `restore_onnx.py` con verificación SHA-256) |

## Arquitectura y entrenamiento

Se trata de una política de aprendizaje por refuerzo profundo entrenada con PPO en el entorno SnowballTarget de Unity ML-Agents. El entrenamiento se realizó con Unity ML-Agents 1.1.0 y PyTorch 2.5.1, durante 160.512 pasos, siguiendo el ejercicio práctico de la unidad 5 del Deep RL Course de Hugging Face. La configuración exacta del entrenamiento queda registrada en el fichero `training.yaml`, que acompaña al modelo.

La evaluación se llevó a cabo exportando la política a ONNX y ejecutándola en un proceso Unity limpio, con acciones estocásticas sembradas y las recompensas originales del entorno. Se midieron 32 episodios held-out, con recompensa media de 21,312 y desviación estándar poblacional de 2,311 (media menos desviación: 19,002). Los retornos individuales y la semilla de evaluación están en `results.json`. No se documenta en la información disponible la topología concreta de la red (capas, unidades, funciones de activación) ni innovaciones técnicas adicionales más allá del propio pipeline PPO + exportación ONNX verificada.

## Capacidades

- Control de agente en el entorno SnowballTarget de Unity ML-Agents: selección de acciones a partir de observaciones del entorno.
- Aprendizaje de política mediante PPO con acciones estocásticas en evaluación.
- Exportación e inferencia en formato ONNX dentro de un proceso Unity.
- Reproducibilidad verificable: reconstrucción byte a byte del modelo ONNX con comprobación de digest SHA-256.
- Registro de configuración de entrenamiento en `training.yaml` y de resultados de evaluación en `results.json`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, tool calling, capacidades de agente multi-paso ni multilingüismo.

## Casos de uso

- Reproducción del ejercicio de la unidad 5 del Deep RL Course: permite a estudiantes cargar la política entrenada y comparar sus resultados con los publicados (recompensa media 21,312 sobre 32 episodios).
- Verificación de pipelines de exportación ONNX: `restore_onnx.py` sirve como referencia para validar integridad de artefactos mediante SHA-256 antes de desplegarlos.
- Docencia de PPO en entornos Unity: uso como línea base entrenada frente a la que comparar políticas propias con distintos hiperparámetros de `training.yaml`.
- Pruebas de integración de ML-Agents: validar que una build de Unity con ML-Agents 1.1.0 carga correctamente una política ONNX externa y reproduce recompensas esperadas.
- Experimentos de evaluación estocástica: emplear la semilla de evaluación documentada en `results.json` para estudiar varianza de retornos entre ejecuciones.
- Referencia de configuración de entrenamiento: usar `training.yaml` como plantilla para replicar el setup (160.512 pasos, ML-Agents 1.1.0, PyTorch 2.5.1) en entornos similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| Tarea | Reinforcement Learning |
| Dataset / entorno | ML-Agents-SnowballTarget |
| Mean reward | 21,3125 ± 2,3108 |
| Training steps | 160.512 |
| Held-out episodes | 32 |
| Desviación estándar poblacional | 2,311 |
| Media menos desviación | 19,002 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de RL de dominio acotado y exportada a ONNX, es presumible que requiera muchos menos recursos que un LLM, pero no se documenta el tamaño de la red.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible (no se especifica).
- Opciones de despliegue: inferencia vía ONNX Runtime dentro de un proceso Unity ML-Agents; reconstrucción del artefacto con `restore_onnx.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LordN77/ppo-SnowballTarget | PPO + ONNX | ML-Agents SnowballTarget | 21,3125 ± 2,3108 | no disponible | Hugging Face |
| Políticas del Deep RL Course (unidad 5) | PPO | ML-Agents SnowballTarget | no disponible | no disponible | Curso Hugging Face |
| Otras políticas SnowballTarget de ML-Agents | PPO | ML-Agents SnowballTarget | no disponible | no disponible | Repositorios Unity ML-Agents |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada; la comparativa queda limitada a la categoría (políticas PPO para el mismo entorno Unity).

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada exclusivamente para el entorno SnowballTarget; no generaliza a otras tareas, entornos Unity ni dominios.
- Resultados no verificados: la métrica de recompensa media figura con `verified: false` en el model-index; conviene reproducirla con `results.json` y la semilla documentada.
- Varianza de evaluación: 32 episodios held-out con desviación estándar de 2,311 implican incertidumbre apreciable sobre el retorno esperado (media menos desviación: 19,002).
- Licencia no disponible: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Dependencia de versión: requiere Unity ML-Agents 1.1.0 y el entorno oficial del curso; cambios de versión pueden alterar el comportamiento y las recompensas.
- Sin soporte de lenguaje natural, vision general, tool calling ni multi-step reasoning; no es adecuado para tareas de NLP.
- Sesgos: no documentados; al operar en un entorno sintético acotado, el riesgo de sesgos sociales típicos de LLM no aplica, pero tampoco se han auditado comportamientos del agente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LordN77/ppo-SnowballTarget
- Entorno oficial SnowballTarget (Unity): https://github.com/huggingface/Snowball-Target
- Deep RL Course, unidad 5 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit5/hands-on
- Playground Unity del entorno: https://huggingface.co/spaces/ThomasSimonini/ML-Agents-SnowballTarget
