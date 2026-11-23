# muhammad-ibraheem/xvla-recap-v2

## Resumen

X-VLA + Recap v2 (checkpoint de 40k pasos) es un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, publicado por el usuario muhammad-ibraheem en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo X-VLA mediante aprendizaje por refuerzo con la técnica Recap, entrenado sobre datos de rollouts propios para una tarea concreta de inserción de cables (cable insertion) en el marco del proyecto AIC. El modelo se distribuye en formato safetensors y está pensado para integrarse con la librería LeRobot.

El interés técnico del artefacto es doble. Por un lado, documenta un experimento de RL sobre un VLA con un resultado negativo explícito: el propio autor advierte de que este checkpoint de 40k pasos está sobreentrenado y recomienda usar el de 20k pasos (`xvla-recap-v2-20k`), que obtiene mejores métricas. Por otro, la model card aporta datos cuantitativos de evaluación (puntuación total en 36 ensayos, número de inserciones completas) que permiten comparar las rondas de entrenamiento.

Con 879.687.256 parámetros (unos 880 millones) y un repositorio de 1,8 GB, es un modelo de escala media diseñado para control robótico más que para generación de texto general. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en X-VLA; detalles internos no disponibles |
| Parametros totales | 879.687.256 (~880 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | reinforcement-learning |
| Tamano del repositorio | 1,8 GB |
| Tarea | Inserción de cables (cable insertion), proyecto AIC |
| Descargas / likes | 39 / 0 |

## Arquitectura y entrenamiento

El modelo parte de X-VLA, un modelo de visión-lenguaje-acción que combina percepción visual con instrucciones en lenguaje natural para producir acciones de control robótico. Sobre esa base, el autor aplica un ajuste fino con aprendizaje por refuerzo mediante Recap, una técnica de recapacitación sobre rollouts. Según la model card, este checkpoint de 40k pasos comparte datos y ejecución con el de 20k pasos: 380 rollouts, correlación de valor de 0,55 y ajuste fino a partir de la ronda 1 (`xvla-recap-v1`).

La innovación destacable no es arquitectónica sino metodológica y documental: el autor publica tanto el checkpoint óptimo (20k) como el sobreentrenado (40k) y cuantifica el deterioro. Los 20k pasos adicionales sobre datos cargados de rollouts degradaron el rendimiento, lo que convierte a este modelo en un caso de estudio sobre sobreajuste en RL aplicado a políticas robóticas. No se detalla la composición del dataset, el número de tokens ni si hubo etapas de RLHF o DPO en el sentido habitual de los LLM.

## Capacidades

- Control robótico de manipulación: genera acciones para tareas de inserción de cables a partir de observaciones visuales.
- Percepción visual integrada: procesa imágenes del entorno para condicionar la política de acción.
- Condicionamiento por instrucciones: al ser un VLA, acepta instrucciones en lenguaje natural para definir la tarea.
- Aprendizaje por refuerzo: política ajustada con Recap sobre rollouts propios.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de políticas robóticas de Hugging Face.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo general ni modos de razonamiento explícito.

## Casos de uso

- Inserción de cables en ensamblaje automatizado: es la tarea objetivo del entrenamiento; la política se usaría para controlar un brazo robótico en una celda de montaje con observación visual directa.
- Investigación en RL para robótica: sirve como referencia negativa controlada para estudiar el sobreentrenamiento, comparando su rendimiento (949 puntos, 0 inserciones) con el checkpoint de 20k (1229 puntos, 2 inserciones completas).
- Reproducción de experimentos: el código asociado en GitHub permite replicar el pipeline de ajuste fino y evaluar variantes de número de pasos.
- Benchmarking de políticas VLA: útil como baseline en 36 ensayos estandarizados para medir precisión en tareas de inserción.
- Docencia y formación: ejemplo real de cómo el exceso de pasos sobre datos sesgados degrada una política aprendida por refuerzo.
- Integración en pipelines LeRobot: despliegue dentro de flujos de evaluación automatizada de políticas robóticas con la librería lerobot.

## Benchmarks y rendimiento

Datos de la model card (36 ensayos por checkpoint):

| Modelo | Total (36 ensayos) | Inserciones completas |
|---|---|---|
| `xvla-recap-v2-20k` (mejor) | 1229 | 2 |
| `xvla-recap-v1` (ronda 1) | 1163 | 2 |
| `xvla-recap-v2` 40k (este modelo) | 949 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~880 M parámetros en FP16, aproximadamente 1,8 GB solo para pesos; en FP32, unos 3,5 GB. No se dispone de cifras oficiales de cuantización.
- GPU recomendadas: no disponibles en la documentación; por tamaño, una GPU consumer moderna (RTX 3060 12 GB o superior) debería alojar los pesos con holgura.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del repositorio (1,8 GB) y el número de parámetros.
- Opciones de despliegue: librería LeRobot; no se documentan soportes específicos para vLLM, llama.cpp, Ollama o TGI (no es un LLM de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (36 ensayos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xvla-recap-v2` 40k (este) | ~880 M | no disponible | 949 puntos, 0 inserciones | no disponible | Hugging Face |
| `xvla-recap-v2-20k` | no disponible | no disponible | 1229 puntos, 2 inserciones | no disponible | Hugging Face |
| `xvla-recap-v1` | no disponible | no disponible | 1163 puntos, 2 inserciones | no disponible | Hugging Face |

No se dispone de información sobre otros modelos VLA comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Sobreentrenamiento confirmado: el autor advierte explícitamente de que este checkpoint está sobreentrenado y recomienda el de 20k pasos.
- Cero inserciones completas en 36 ensayos: el rendimiento en la tarea objetivo es nulo en el criterio de éxito principal.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Idiomas no especificados: al ser un VLA, el alcance lingüístico está limitado a las instrucciones de entrenamiento.
- Especialización estrecha: entrenado para inserción de cables; no es un modelo generalista.
- Riesgo de sobreajuste a los datos de rollouts: la model card atribuye la degradación a los 20k pasos extra sobre datos cargados de rollouts.
- Sin datos de sesgos, alucinación o robustez fuera de la tarea; no aplicables en el sentido de un LLM, pero sin evaluación disponible.
- Sin información sobre cuantización ni despliegue en producción más allá de LeRobot.

## Enlaces

- Hugging Face: https://huggingface.co/muhammad-ibraheem/xvla-recap-v2
- Checkpoint recomendado (20k): https://huggingface.co/muhammad-ibraheem/xvla-recap-v2-20k
- Ronda 1: https://huggingface.co/muhammad-ibraheem/xvla-recap-v1
- Código: https://github.com/ibraheem-111/eee598-aic
