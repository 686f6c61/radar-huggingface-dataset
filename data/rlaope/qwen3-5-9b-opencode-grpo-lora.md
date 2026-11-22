# rlaope/Qwen3.5-9B-opencode-grpo-lora

## Resumen

Qwen3.5-9B-opencode-grpo-lora es un adaptador LoRA publicado por el usuario rlaope sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo, sino un ajuste fino de bajo rango (r=32, alpha=64) entrenado con aprendizaje por refuerzo on-policy mediante GRPO (Group Relative Policy Optimization) dentro del arnés de agente OpenCode. El objetivo concreto es mejorar el rendimiento del modelo base en tareas de análisis de datos ejecutadas como agente: cargar ficheros, inspeccionarlos, computar con Python en un sandbox y responder con un valor final.

La relevancia de esta ficha reside en su metodología: el entrenamiento se realizó con el modelo actuando como agente real dentro de OpenCode (sin modificar el arnés), con rollouts servidos por vLLM con hot-swap de LoRA y una recompensa binaria basada únicamente en la corrección de la respuesta final. El adaptador mejora el pass@1 del modelo base del 78,7% al 86,9% en 150 tareas de análisis de datos retenidas, con un intervalo de confianza del 95% de ±4,0 puntos.

El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0. Está pensado para integrarse en despliegues vLLM con soporte de LoRA o mediante PEFT sobre el modelo base. Es la segunda iteración de un proyecto que ya publicó un adaptador equivalente para el arnés Hermes Agent, lo que permite comparar el efecto del RL dentro de distintos arneses sobre el mismo modelo base y el mismo conjunto de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen3.5-9B; el modelo base usa atención lineal en parte de sus capas segun la configuracion de entrenamiento del adaptador |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-9B tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128k tokens en la evaluacion reportada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-9B, no detalladas en la model card) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-9B, un transformer denso de 9B parámetros. El LoRA tiene rango 32, alpha 64 y dropout 0, y se aplica a todas las proyecciones de atención, atención lineal y MLP. El entrenamiento emplea GRPO asíncrono con el `HarnessAsyncGRPOTrainer` de TRL, con rollouts servidos por vLLM mediante hot-swap de LoRA en vivo y un servidor Harbor de OpenEnv 0.7.0. OpenCode se ejecuta sin modificaciones. Un proxy de captura entre OpenCode y vLLM registra los token IDs y log-probs exactos muestreados, de modo que el entrenador aprende de lo que el modelo generó realmente y no de texto re-tokenizado.

El conjunto de entrenamiento son 520 tareas de análisis de datos construidas a partir de jupyter-agent/jupyter-agent-dataset (niveles fácil y medio, menos de 1000 filas). Se excluyeron las 150 tareas de evaluación y todas las tareas que comparten un dataset de Kaggle con ellas, para evitar filtración. La recompensa es binaria: 1 si la respuesta final es correcta, 0 en caso contrario, sin bonificaciones ni penalizaciones por uso de herramientas. Hiperparámetros: learning rate 1e-5, 8 rollouts por tarea, temperatura de muestreo 1.0 durante el entrenamiento y 200 pasos de optimizador. El entrenamiento se ejecutó en 2× RTX PRO 6000 Blackwell (96 GB), una GPU para rollouts de vLLM y otra para el entrenador, durante aproximadamente 15 horas.

Durante el entrenamiento fue necesario corregir tres problemas del arnés: OpenCode reporta `completion_tokens` sin los tokens de razonamiento (que van en `reasoning_tokens`), lo que hacía rechazar todos los rollouts de Qwen3.5 hasta sumar ambos contadores; el propio OpenCode consume unos 0,75 GB dentro del sandbox, y con el límite de 1 GB del dataset se mataban por falta de memoria alrededor del 19% de los rollouts de entrenamiento y el 8% de los intentos de evaluación (las cifras reportadas usan un límite de 4 GB); y OpenCode 1.19.6 termina con error EPIPE tras escribir una respuesta correcta, lo que descarta el rollout, mientras que 1.18.30 no lo hace.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso dentro de un arnés de agente.
- Uso de herramientas (tool calling / function calling) en el formato de OpenCode, con parser `qwen3_coder` en vLLM.
- Ejecución de código Python en un sandbox para análisis de datos: carga e inspección de ficheros, cálculo y respuesta con un valor final.
- Razonamiento con modo thinking (parser `qwen3` en vLLM).
- Capacidades multilingües limitadas al inglés según la model card.
- Integración como proveedor compatible con OpenAI en OpenCode.
- No se reportan capacidades de visión ni audio.

## Casos de uso

- Análisis de datos automatizado sobre ficheros tabulares: el adaptador está entrenado específicamente para tareas del estilo "cargar un CSV, inspeccionarlo, computar con Python y devolver un valor único", con una mejora medida de +8,2 puntos en pass@1 frente al modelo base en ese dominio.
- Agente de código con ejecución en sandbox: al integrarse en OpenCode como proveedor compatible con OpenAI, puede resolver tareas que requieren leer, ejecutar y verificar código en un contenedor aislado.
- Automatización de informes analíticos: pipelines que reciben un dataset y deben producir una cifra o conclusión verificable, con un número medio de llamadas a herramientas de 4,40 por intento.
- Evaluación de agentes en producción: sirve como referencia para medir la degradación o mejora de un modelo al cambiar de arnés, ya que el proyecto publica un adaptador equivalente para Hermes Agent con el mismo conjunto de tareas.
- Investigación en RL para agentes: el adaptador y la metodología (GRPO asíncrono con captura exacta de tokens y log-probs) son reproducibles y sirven de base para entrenar otros modelos dentro de arneses de agente.
- Despliegue multi-LoRA en vLLM: al ser un adaptador de rango 32, puede servirse junto al modelo base y otros adaptadores en un mismo servidor con `--enable-lora --max-lora-rank 32`, compartiendo los pesos base.
- Prototipado de asistentes de análisis con contexto largo: los 128k tokens de contexto permiten manejar conversaciones y ficheros de datos extensos en una sola sesión.

## Benchmarks y rendimiento

Evaluación en el arnés Harbor `opencode` (OpenCode 1.18.30), mismo contenedor y mismo build de vLLM para base y adaptador, muestreo temperature 0.6, top_p 0.95, top_k 20, contexto de 128k. 150 tareas retenidas de análisis de datos, 3 intentos cada una.

| Metrica | Qwen3.5-9B (base) | + adaptador |
|---|---|---|
| Analisis de datos, pass@1 (150 tareas × 3) | 78,7% | 86,9% (+8,2 ± 4,0) |
| Analisis de datos, pass@3 | 88,0% | 90,7% |
| Tareas mejores / peores / iguales | — | 33 / 7 / 110 |
| Llamadas a herramientas por intento | 4,56 | 4,40 |
| Fallos por parada temprana (≤2 llamadas, incorrecta) | 0 | 0 |

El intervalo ±4,0 es el intervalo de confianza del 95% de la diferencia pareada por tarea. Un checkpoint en el paso 150 obtuvo 86,2% (+7,6 ± 3,6); la diferencia entre los pasos 150 y 200 está dentro del ruido. En el arnés Hermes, el mismo modelo base parte de 79,1% en las mismas 150 tareas y el adaptador equivalente logra +6,7 puntos. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB; requiere cargar el modelo base Qwen3.5-9B completo (unos 18 GB en bfloat16).
- VRAM estimada para inferencia del modelo base: aproximadamente 18-20 GB en bfloat16, alrededor de 10 GB en cuantización de 8 bits y 5-6 GB en 4 bits (estimaciones a partir del tamaño de parámetros; no confirmadas en la model card).
- GPU recomendadas para el despliegue reportado: RTX PRO 6000 Blackwell (96 GB) para servir con vLLM; también válidas A100, H100 o L40S.
- Cabe en GPU de consumo con cuantización: una RTX 4090 (24 GB) puede servir el modelo base en bfloat16 o 8 bits, aunque el adaptador está pensado para vLLM con LoRA, que no soporta cuantización del adaptador de forma estándar.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32` (recomendado por el autor), o PEFT + transformers. No se documenta soporte para llama.cpp u Ollama con este adaptador.
- Entrenamiento: 2× RTX PRO 6000 Blackwell (96 GB), unas 15 horas para 200 pasos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-opencode-grpo-lora | 9B (base) + LoRA r32 | 128k | 86,9% pass@1 en 150 tareas de análisis de datos (OpenCode) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9B | 128k | 78,7% pass@1 en las mismas tareas (OpenCode) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-hermes-grpo-lora | 9B (base) + LoRA | 128k | +6,7 puntos sobre 79,1% base en las mismas tareas (Hermes) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha medido análisis de datos. A diferencia del adaptador Hermes, no hay verificación en Terminal-Bench, por lo que no se descarta una regresión en otras tareas de agente.
- El adaptador está entrenado únicamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación inherente al modelo base; la recompensa binaria no elimina respuestas plausibles pero incorrectas.
- El modelo base puede detenerse antes de tiempo en tareas fuera del dominio de entrenamiento; el adaptador no introduce fallos de parada temprana en la evaluación, pero no se ha probado fuera de ella.
- Dos de las 520 tareas de entrenamiento nunca se ejecutaron por timeout en la descarga de datos y se omitieron.
- El adaptador requiere el modelo base Qwen3.5-9B y no funciona de forma autónoma; el despliegue recomendado exige vLLM con soporte de LoRA.
- El ajuste se realizó con OpenCode 1.18.30; con la versión 1.19.6 se produce un error EPIPE tras respuestas correctas que invalida los rollouts.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y del dataset de entrenamiento por separado.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no hay validación independiente de los resultados reportados.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/rlaope/Qwen3.5-9B-opencode-grpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador equivalente para Hermes Agent: https://huggingface.co/rlaope/Qwen3.5-9B-hermes-grpo-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/jupyter-agent/jupyter-agent-dataset
- OpenCode: https://opencode.ai
- Sionic AI (proveedor de GPU e infraestructura): https://sionic.ai
