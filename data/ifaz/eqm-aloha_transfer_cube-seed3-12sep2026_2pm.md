# iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm

## Resumen

El modelo `iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm` es una política de robótica entrenada con LeRobot, no un modelo de lenguaje. Implementa el tipo de política `eqm` (energy-based model o modelo basado en energía) y está diseñada para resolver la tarea de manipulación bimanual `AlohaTransferCube-v0` del simulador MuJoCo, dentro del entorno ALOHA. El autor es el usuario de HuggingFace `iFaz` y el modelo se distribuye bajo licencia Apache 2.0 con pesos en formato `safetensors`.

El modelo tiene 18.701.190 parámetros (aproximadamente 18,7 millones), un tamaño propio de una política de imitación compacta, no de un modelo generativo de gran escala. Se entrenó durante 5000 pasos con batch size 8 y semilla 3 sobre el dataset `lerobot/aloha_sim_transfer_cube_human`, que contiene demostraciones humanas de la tarea de transferencia de cubo. La configuración declara un modelo de energía de tipo `dot` con regularización jacobiana (`jacobian_reg_weight` = 0,0001 y `jacobian_reg_probes` = 1).

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo concreto de política EQM dentro del ecosistema LeRobot; por otro, advierte de que los resultados de evaluación publicados en la propia model card son un fracaso de entrenamiento (tasa de éxito del 0,0 % en 5 episodios, recompensa media 0,40). Se trata por tanto de un artefacto útil como referencia técnica y como caso de estudio de fallo, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación basada en modelo de energía (EQM), tipo `ebm: dot`, integrada en LeRobot |
| Parametros totales | 18.701.190 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica: es una política de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | `en` (etiqueta declarada por el autor; no aplica a una política de control) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (biblioteca `lerobot`, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

La arquitectura se declara como política `eqm`, es decir, un modelo basado en energía que aprende una función de puntuación sobre acciones y selecciona las de menor energía. La model card especifica un término de energía de tipo `dot` y una regularización jacobiana con peso 0,0001 y una única sonda (`jacobian_reg_probes: 1`), un mecanismo habitual para estabilizar el gradiente del campo de energía y evitar colapsos en la representación. No se detalla la troncal neuronal subyacente (capas, tipo de encoder visual, dimensionalidad de las acciones) en la información disponible.

El entrenamiento se realizó con LeRobot durante 5000 pasos, con batch size 8, 4 workers de carga de datos, frecuencia de guardado cada 1000 pasos y semilla 3. El dataset es `lerobot/aloha_sim_transfer_cube_human`, compuesto por demostraciones humanas teleoperadas sobre el entorno simulado ALOHA en MuJoCo. No se menciona uso de RLHF, DPO ni aprendizaje por refuerzo: el paradigma es imitación supervisada (behavior cloning / energy-based imitation). Tampoco se especifica el número de tokens ni la composición del dataset. La configuración de evaluación incluye registro fuera de distribución (OOD) con `ood_z_threshold` = 3.0, calibración en `/kaggle/working/eqm_calibration.json` y log en `/kaggle/working/outputs/eqm_ood_log.csv`.

## Capacidades

- Control robótico bimanual: genera acciones de bajo nivel para el robot ALOHA en la tarea de transferencia de cubo (`AlohaTransferCube-v0`).
- Aprendizaje por imitación: reproduce comportamientos derivados de demostraciones humanas del dataset `lerobot/aloha_sim_transfer_cube_human`.
- Puntuación basada en energía: al ser una política EQM, puede evaluar la energía de una acción candidata, lo que permite en principio filtrar o clasificar acciones según su plausibilidad.
- Detección fuera de distribución: la configuración de evaluación contempla `ood_logging_enabled`, umbral z de 3,0 y ficheros de calibración y log, orientados a monitorizar desviaciones respecto a la distribución de entrenamiento.
- Simulación en MuJoCo: entrenada y evaluada en el simulador ALOHA integrado en MuJoCo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio. No es un modelo multimodal ni conversacional; su única salida son acciones de control.

## Casos de uso

- Reproducción de investigación en políticas EQM: sirve como punto de partida para reproducir y depurar el entrenamiento de una política basada en energía con LeRobot, dado que la configuración completa (pasos, batch, semilla, tipo de energía, regularización) está documentada.
- Estudio de fallos de entrenamiento: con una tasa de éxito del 0,0 % y una recompensa media de 0,40, el modelo es un caso útil para analizar por qué una política de imitación no converge, comparando con ejecuciones de otras semillas o de mayor duración.
- Prueba de infraestructura de evaluación OOD: su configuración de `ood_logging_enabled`, umbral z y calibración permite validar pipelines de detección de anomalías en control robótico, independientemente del éxito de la tarea.
- Línea base negativa en comparativas: puede usarse como referencia de bajo rendimiento frente a políticas ACT o Diffusion Policy entrenadas sobre el mismo dataset y con el mismo presupuesto de pasos.
- Pruebas de integración con LeRobot: valida el ciclo completo de carga de política, rollout en MuJoCo y registro de métricas dentro del ecosistema LeRobot, sin necesidad de hardware real.
- Validación de pipelines de logging y checkpoints: la estructura de guardado cada 1000 pasos y los ficheros de calibración permiten probar herramientas de seguimiento de experimentos antes de lanzar entrenamientos costosos.
- Docencia y ejemplos de model card: sirve como ejemplo de cómo documentar (y cómo no entrenar) una política de imitación en HuggingFace Hub.

## Benchmarks y rendimiento

Los únicos datos de rendimiento disponibles son los publicados por el propio autor en la model card:

| Metrica | Valor |
|---|---|
| Episodios evaluados | 5 |
| Tasa de exito | 0,0 % |
| Recompensa acumulada media (sum) | 0,40 |
| Recompensa maxima media (max) | 0,40 |
| Tiempo de evaluacion | 766,7 s |
| Entorno | `aloha` / `AlohaTransferCube-v0` |
| Batch de evaluacion | 1 |
| Entornos asincronos en evaluacion | `False` |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y en cualquier caso no aplicarían a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 18,7 millones de parámetros, los pesos ocupan aproximadamente 75 MB en FP32 y unos 37 MB en FP16, más los buffers de activaciones y observaciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El entrenamiento declarado se hizo en `cuda`, pero no se especifica la GPU concreta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable para inferencia dado el tamaño, aunque el cuello de botella real será el simulador MuJoCo y el renderizado del entorno, no la red.
- Opciones de despliegue: LeRobot (carga de política), PyTorch con `pytorch_model_hub_mixin`, y rollout en MuJoCo mediante el entorno `AlohaTransferCube-v0`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato temporal es el de la evaluación completa: 766,7 s para 5 episodios, aproximadamente 153 s por episodio, incluyendo la dinámica del simulador.

## Comparativa con modelos similares

| Modelo | Tipo de politica | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm` | EQM (energy-based) | 18.701.190 | No aplica | Exito 0,0 % en 5 episodios | Apache 2.0 | HuggingFace Hub |
| ACT (Action Chunking Transformer) | Transformer de imitacion | No disponible | No aplica | No disponible | No disponible | Ecosistema LeRobot |
| Diffusion Policy | Política generativa por difusion | No disponible | No aplica | No disponible | No disponible | Ecosistema LeRobot |
| VQ-BeT | Discretizacion vectorial + transformer | No disponible | No aplica | No disponible | No disponible | Ecosistema LeRobot |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas dentro de la información proporcionada; la comparación se limita a la categoría funcional (políticas de imitación para el mismo tipo de tarea en LeRobot). Cualquier cifra adicional requeriría consultar las model cards correspondientes, que no forman parte de esta búsqueda.

## Limitaciones y advertencias

- Rendimiento nulo en la evaluación publicada: tasa de éxito del 0,0 % y recompensa media de 0,40 en 5 episodios. No debe desplegarse ni presentarse como una política funcional para la tarea `AlohaTransferCube-v0`.
- Entrenamiento corto: solo 5000 pasos con batch size 8, un presupuesto muy reducido para una política de imitación sobre demostraciones humanas.
- Ausencia de evaluación durante el entrenamiento: `eval_freq` está fijado a 0, por lo que no hay curva de validación que permita saber si el modelo mejoró o empeoró a lo largo del entrenamiento.
- Semilla única: el identificador indica `seed3`; no hay evidencia de repetibilidad ni de variabilidad entre semillas.
- Sesgo de simulación: entrenado exclusivamente en el simulador MuJoCo con el dataset `lerobot/aloha_sim_transfer_cube_human`; no hay validación en robot real ni transferencia sim-to-real documentada.
- Inconsistencia menor en la configuración: la configuración de entrenamiento declara `eval.n_episodes` = 1 mientras que la de evaluación y los resultados usan 5 episodios.
- Riesgo de sobreajuste y de colapso del campo de energía: con regularización jacobiana de peso 0,0001 y una sola sonda, la estabilidad del modelo de energía no está garantizada.
- Limitaciones de idioma: la etiqueta `en` es nominal; el modelo no procesa ni genera lenguaje.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones fuera de distribución, mitigado parcialmente por el registro OOD con umbral z de 3,0.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el estado del modelo (0 % de éxito) lo hace inadecuado para cualquier aplicación productiva sin un reentrenamiento completo y una evaluación rigurosa.
- Reproducibilidad: la model card apunta a rutas locales de Kaggle (`/kaggle/working/...`) para calibración y logs que no se distribuyen con el repositorio, lo que dificulta reproducir exactamente el pipeline de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iFaz/eqm-aloha_transfer_cube-seed3-12sep2026_2pm
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Cita de LeRobot (Cadene, Alibert et al., 2024): https://github.com/huggingface/lerobot

Nota: las búsquedas web realizadas no devolvieron resultados técnicos relevantes sobre este modelo; los enlaces anteriores proceden de la información del repositorio de HuggingFace y de la model card del autor.
