# LEAP-LAB-KUS/jevkt-checkpoints

## Resumen

`LEAP-LAB-KUS/jevkt-checkpoints` es un repositorio de checkpoints del proyecto Jev-KT, desarrollado por LEAP-LAB-KUS, que contiene adaptadores LoRA, cabezas de decisión tipadas y ficheros de calibración entrenados sobre el modelo base `autotrust/JEV-9B` (Apache-2.0, con backbone Qwen/Qwen3.5-9B). No es un modelo generativo de propósito general, sino una colección de artefactos de fine-tuning orientados a *knowledge tracing* (KT): la tarea de predecir el rendimiento futuro de un estudiante a partir de su historial de interacciones con ejercicios.

El repositorio incluye además líneas base de KT clásico y de deep learning (pyKT y el propio toolkit `leap-kt-toolkit`), lo que lo convierte en un paquete de evaluación comparativa para investigación educativa. La propuesta técnica combina un bloque "System-One" (S1) con decisiones tipadas y calibración por tipo, más brazos de RL (S2, PPO/GRPO) en la variante E16.

Es relevante ahora porque expone de forma abierta un pipeline completo de KT sobre un LLM de 9B, con restricciones de licencia explícitas por brazo de entrenamiento (algunos con datos no comerciales) y un volumen considerable de checkpoints (84,5 GB de repositorio). La ficha se centra en lo que el autor documenta; muchos datos de arquitectura y rendimiento no están publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `autotrust/JEV-9B` (backbone Qwen/Qwen3.5-9B) + cabeza de decisión tipada + calibración por tipo |
| Parametros totales | no disponible (el base es de 9B; el adaptador LoRA no reporta recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se exporta en safetensors para vLLM y PEFT) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para adaptadores, cabezas y calibración; el modelo combinado hereda la del base (Apache-2.0). Varios brazos con restricciones adicionales (uso de investigación; ver limitaciones) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `head.safetensors`, `value_head.safetensors` en brazos PPO), más JSON de configuración (`adapter_config.json`, `decision_head.json`, `judge_config.json`, `calibration.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena un transformer desde cero: parte de `autotrust/JEV-9B` y le añade, mediante LoRA, bloques "System-One" con una cabeza de decisión tipada y un mecanismo de calibración por tipo (temperatura ajustada sobre el split de validación de cada brazo). La organización distingue brazos E15 (fine-tuning `jevkt.jev9b_ft`) y E16 (driver `jevkt.e16_rl`), que incluye S1 (incluyendo E17–E20 y LODO) y brazos S2 de RL. Los brazos PPO incorporan además una `value_head.safetensors`.

Los datos de entrenamiento combinables se publican en `LEAP-LAB-KUS/jevkt-synthetic`. Todos los brazos E16-driver (S1) mezclan un 5 % de filas de replay de `SargeDev/jev-distill-corpus-v3` (Apache-2.0). Parte de las etiquetas provienen de la API comercial TypeSafe Jev (versiones `jev-1.13-20260917` y `jev-1.14-20261014`) a través de OpenRouter, y otras de simulaciones de estudiantes con Llama 3.1/3.2, Gemma 3 y Qwen 2.5. Los brazos de KT real usan benchmarks públicos (ASSISTments 2009/2017, Eedi NIPS 2020 tareas 3–4, XES3G5M, DBE-KT22, KDD Cup 2010 Algebra 2005, Junyi). No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset.

La innovación destacable es la separación entre "System-One" (decisión rápida tipada con calibración) y brazos S2 de RL, junto con la exportación dual a vLLM (`adapter_vllm/`) y PEFT (`adapter/`), y el registro de procedencia por brazo (ruta de datos, sha256, objetivo, fichero de replay y semilla en la primera línea de cada `train_log.jsonl`).

## Capacidades

- Knowledge tracing: predicción del rendimiento del estudiante a partir de secuencias de interacción, con cabezas de decisión tipadas.
- Decisiones tipadas con calibración: cada tipo de decisión lleva su propia temperatura ajustada en validación.
- Brazos de RL: S2 incluye entrenamiento PPO/GRPO con `value_head` para brazos PPO.
- Líneas base clásicas y de deep learning: pyKT (con checkpoints `qid_model.ckpt`) y `leap-kt-toolkit`.
- Cold-start: celdas de cold-start por dataset y semilla en `e15/F1-cs/`.
- Integración con vLLM: exportación LoRA lista para servir con JEV-9B vía `python -m jevkt.jev9b_kt --ds <ds> --state h25knn --adapter <ckpt dir> --lora-name <name> --load-lora`.
- Capacidades generativas generales: no documentadas en la información disponible (el foco es KT, no generación abierta).

## Casos de uso

- Predicción de rendimiento en plataformas educativas: usar los adaptadores S1 con la cabeza tipada para estimar la probabilidad de acierto del siguiente ejercicio de un estudiante, aprovechando el historial de interacciones y la calibración por tipo de decisión.
- Evaluación comparativa de modelos de KT: desplegar los checkpoints pyKT y `leap-kt-toolkit` junto con los adaptadores para comparar KT clásico, deep learning y LLM sobre los mismos benchmarks públicos (ASSISTments, Eedi, XES3G5M).
- Investigación en cold-start: emplear las celdas `e15/F1-cs/<ds>-s<seed>N<N>/` para estudiar cómo se comporta el modelo con pocos datos por estudiante o por ítem.
- Estudio de calibración: reutilizar `calibration.json` y `judge_config.json` para analizar la fiabilidad de las decisiones tipadas y ajustar temperaturas por tipo en nuevos dominios.
- Reproducibilidad de experimentos: los `train_log.jsonl` registran ruta de datos, sha256, objetivo, replay y semilla, lo que permite reproducir brazos concretos en pipelines de investigación.
- Servicio de inferencia con vLLM: cargar `adapter_vllm/` sobre JEV-9B servido con vLLM para prototipos de tutoría adaptativa o detección temprana de riesgo académico.
- Análisis de sesgo y robustez en KT: comparar brazos entrenados con etiquetas de profesor comercial frente a brazos sin ellas (E19 `-a100`, `e15/F2-flat`) para medir el efecto de la fuente de etiquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base es de 9B parámetros; el adaptador LoRA añade una sobrecarga pequeña. Como referencia orientativa, un 9B en FP16 requiere del orden de 18 GB de pesos, y en cuantización de 4 bits del orden de 5–6 GB, pero el repositorio no publica cifras de cuantización ni de VRAM.
- GPU recomendadas: no disponible en la documentación. El autor menciona entrenamiento en pods y brazos con sufijo `-a100`, lo que sugiere uso de A100 en algunos experimentos.
- ¿Cabe en GPU de consumo? No confirmado. Un 9B en cuantización baja podría caber en GPUs de 24 GB, pero no hay datos publicados que lo verifiquen para estos adaptadores.
- Opciones de despliegue: vLLM (exportación `adapter_vllm/`) y PEFT (`adapter/`). No se documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jevkt-checkpoints (este) | LoRA sobre base 9B | no disponible | KT con decisiones tipadas y calibración | Apache-2.0 con restricciones por brazo | Hugging Face, 84,5 GB |
| pyKT (líneas base incluidas) | variable por modelo | no disponible | DLKT clásico | según dataset/modelo | Incluido en el repo |
| leap-kt-toolkit (líneas base incluidas) | variable | no disponible | KT clásico | según dataset/modelo | Incluido en el repo |
| Modelos KT de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Restricciones de licencia por brazo: varios brazos incorporan datos con licencia CC BY-NC 4.0 (Duolingo HLR, ChaosNLI) y quedan limitados a uso de investigación; otros usan texto de XES3G5M con términos de redistribución poco claros.
- Etiquetas de profesor comercial: muchos brazos E16/S1 se entrenaron con etiquetas de la API comercial TypeSafe Jev, lo que puede condicionar su uso comercial y su reproducibilidad.
- Condiciones de licencias de terceros: los brazos E19 usan respuestas simuladas de Llama 3.1/3.2, Gemma 3 y Qwen 2.5, sujetas a la Llama Community Licence y a los Gemma Terms of Use.
- Cobertura incompleta: 68 checkpoints solo existen como configuración y logs en `meta_only/` (pesos no subidos); varios brazos seguían entrenando en el momento de la subida (E19-b-n256k, E19-a2-n16k-a100, S2-grpo-log, E27 de 27B).
- Rutas absolutas en las configuraciones (`/workspace/jev_kt/...`, `/root/models/...`): son informativas y no reproducen el entorno original.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de KT, el riesgo principal es la calibración deficiente fuera de la distribución de los benchmarks de entrenamiento.
- Idiomas y contexto: no disponibles, lo que impide garantizar su comportamiento multilingüe o con secuencias largas.
- No es un modelo de propósito general: no debe evaluarse como un LLM conversacional; su uso previsto es KT y análisis educativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LEAP-LAB-KUS/jevkt-checkpoints
- Dataset sintético: https://huggingface.co/datasets/LEAP-LAB-KUS/jevkt-synthetic
- Modelo base: https://huggingface.co/autotrust/JEV-9B
- Backbone citado: Qwen/Qwen3.5-9B (referencia en la model card; sin enlace directo en la información disponible)
- Corpus de replay: SargeDev/jev-distill-corpus-v3 (referencia en la model card; sin enlace directo en la información disponible)
