# HarleyCooper/weight-space-breakout-llm-repaired

## Resumen

`HarleyCooper/weight-space-breakout-llm-repaired` no es un modelo de lenguaje: es una política de control para el juego Breakout con 17.253 parámetros, exportada en safetensors y NumPy. El autor, HarleyCooper, la publica como demostración del paradigma de "weight-space programming", en el que un LLM (en este caso, según la model card, `qwen/qwen3.6-35b-a3b`) edita directamente escalares de los pesos de una red pequeña a partir de una descripción textual de la tarea, sin acceso al entorno ni a los resultados de evaluación.

El punto de partida es un controlador "didáctico" escrito a mano con un fallo deliberado: los controles izquierda y derecha están invertidos. La edición del LLM modifica únicamente 5 de los 17.253 parámetros para corregir ese sesgo. El resultado es una mejora medible en retorno medio (de 1,1641 a 2,7969 en las semillas publicadas del benchmark, y de 1,2969 a 2,4268 en 1.024 semillas de holdout nuevas).

Su relevancia es metodológica, no práctica como modelo generativo: sirve como evidencia reproducible de que un LLM puede reparar una política de RL mediante edición de pesos guiada por lenguaje, y como artefacto didáctico para estudiar weight-space programming con un caso de escala mínima y verificación completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (política de control), no transformer; entrada de 500 valores (observación 10×10×5) y salida de 5 logits de acción |
| Parámetros totales | 17.253 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; no procesa tokens) |
| Tipos de cuantización | No disponible (pesos exportados en safetensors y NPZ, sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (no genera texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `baseline.safetensors`) y NumPy (`policy.npz`) |

## Arquitectura y entrenamiento

La política es una red pequeña que mapea una observación de 500 números binarios (rejilla 10×10×5) a cinco logits de acción. La especificación completa de la red está en `config.json` del repositorio. No se trata de un transformer ni de un modelo generativo: no hay tokenizador, no hay atención y no hay decodificación de texto.

No hubo entrenamiento por gradiente en el sentido habitual. La "reparación" se realizó mediante edición directa de pesos escalares: un LLM recibió únicamente el enunciado publicado de la tarea, en una llamada API limpia, sin herramientas, sin acceso al juego y sin retroalimentación de evaluación. Se intentaron tres reparaciones independientes sobre tres fallos distintos (`reversed_controls`, `left_bias`, `missing_right`); solo la primera mejoró el rendimiento. El export se verificó contra la política NumPy original en 16 observaciones con semilla fija, y los hashes están en `checksums.json`. El autor advierte explícitamente que un intento por tarea no constituye una evaluación estadística de la capacidad general de reparación de un LLM.

## Capacidades

- Control de política para Breakout: recibe una observación de 500 valores binarios y devuelve logits, probabilidades, acción muestreada y acción greedy.
- Inferencia en CPU sin dependencias de Transformers ni `trust_remote_code`.
- Interfaz CLI vía `inference.py`, con `--observation` aceptando un array JSON de 500 binarios o una forma 10×10×5.
- Export dual a safetensors y NPZ, con pesos de línea base (`baseline.safetensors`) para comparación.
- Reproducibilidad completa: entorno y verificador en Prime Intellect, especificaciones en `config.json`, envíos y evaluaciones en `experiment/`.
- No genera texto, no soporta tool calling, no tiene capacidades multilingües ni modos de razonamiento.

## Casos de uso

- Docencia sobre weight-space programming: el repositorio permite mostrar de extremo a extremo cómo un LLM edita pesos de una red pequeña y cómo se verifica el resultado con semillas fijas.
- Reproducción de experimentos de edición de pesos: el material en `experiment/` incluye peticiones, respuestas y puntuaciones de los tres intentos, lo que facilita replicar el protocolo en otras tareas.
- Estudio de robustez de LLM como editores de código/pesos: los resultados muestran que dos de tres reparaciones empeoraron el rendimiento (de 0,656 a 0,369 y de 1,809 a 0,382), un dato útil para diseñar evaluaciones más rigurosas.
- Comparación de exportadores: la verificación en 16 observaciones con semilla y los hashes en `checksums.json` sirven como plantilla para validar exportaciones de NumPy a safetensors en proyectos de RL.
- Prueba de despliegue en CPU: el Space de inferencia (`weight-space-breakout-inference`) permite comprobar que tres predicciones remotas y tres episodios completos coinciden con la política local congelada.
- Integración en pipelines de evaluación de agentes: la política puede usarse como baseline de referencia en entornos Breakout personalizados, con la advertencia de que es una línea base didáctica, no una política óptima.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (acciones muestreadas, semillas emparejadas de entorno y muestreo de acciones):

| Evaluación | Episodios | Baseline defectuoso | Editado por LLM | Ganancia media | Error estándar emparejado |
|---|---:|---:|---:|---:|---:|
| Semillas publicadas del benchmark | 128 | 1,1641 | 2,7969 | 1,6328 | 0,2843 |
| Semillas de holdout nuevas | 1.024 | 1,2969 | 2,4268 | 1,1299 | 0,0982 |

Desglose por fallo en holdout:

| Fallo | Retorno baseline | Retorno editado | Ganancia |
|---|---:|---:|---:|
| `reversed_controls` | 1,297 | 2,427 | +1,130 |
| `left_bias` | 0,656 | 0,369 | -0,287 |
| `missing_right` | 1,809 | 0,382 | -1,427 |

Parámetros modificados en la reparación exitosa: 5 de 17.253. No hay resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, porque el modelo no es un LLM.

## Requisitos de hardware

- VRAM: no aplica; la política cabe en memoria de CPU (17.253 parámetros, repo de 0,0 GB).
- GPU recomendadas: ninguna; la inferencia está pensada para CPU.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, sin requisitos relevantes.
- Despliegue: Python con `numpy`, `safetensors` y `huggingface_hub`; `inference.py` como CLI; Space de CPU dedicado en Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| `HarleyCooper/weight-space-breakout-llm-repaired` | Política de control Breakout | 17.253 | No aplica | MIT | Hugging Face, Space de CPU |
| Política PPO del paper Weight-Space Programming | Política de RL | No disponible | No aplica | No disponible | Referenciada en el blog citado; no incluida en este repo |
| `baseline.safetensors` (controlador defectuoso) | Política didáctica | 17.253 | No aplica | MIT | Incluido en el mismo repo |

No se dispone de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no debe usarse como LLM.
- Es una política específica para Breakout; no generaliza a otros juegos ni entornos.
- Un solo intento por tarea no constituye evidencia estadística de la capacidad general de reparación de un LLM; el propio autor lo señala.
- Dos de las tres reparaciones empeoraron el rendimiento, lo que indica fragilidad del método de edición de pesos.
- La línea base es un controlador didáctico, no una política óptima; la mejora no implica que se ganen todos los juegos.
- La evaluación se basa en acciones muestreadas con semillas emparejadas; los resultados pueden variar con otras semillas o políticas de muestreo.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, pero el LLM editor puede producir ediciones incorrectas sin señal de error.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Revisar el código Python descargado (`inference.py`) antes de ejecutarlo, como advierte la model card.
- El resultado de la búsqueda web proporcionada (ayuda de Google Drive) no es relevante para este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-llm-repaired
- Demo de inferencia en CPU: https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-inference
- Entorno y verificador en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Blog inspirador "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
