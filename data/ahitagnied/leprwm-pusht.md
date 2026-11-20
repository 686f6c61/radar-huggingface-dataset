# ahitagnied/leprwm-pusht

## Resumen

LePRWM (LeWM extended with PRH rotation) es un conjunto de checkpoints para el entorno PushT, publicado por el usuario ahitagnied en Hugging Face. Se trata de un world model construido sobre la arquitectura JEPA (Joint Embedding Predictive Architecture), con un brazo de imagen basado en ViT-tiny y un brazo de texto, unidos mediante una rotación PRH (Procrustes Rotation for Heterogeneous modalities) que alinea los embeddings de ambas modalidades. El modelo se entrena en cinco etapas secuenciales sobre el dataset PushT, un benchmark de manipulación robótica 2D.

La relevancia del modelo es experimental: explora cómo extender un world model visual a una nueva modalidad (texto) mediante una transformación lineal aprendida (rotación PRH) en lugar de reentrenar el codificador congelado. El repositorio incluye los checkpoints de cada etapa, los resultados de alineación entre modalidades y los registros de entrenamiento, lo que lo convierte en un artefacto de investigación reproducible más que en un modelo listo para producción.

El tamaño del repositorio es de 3,3 GB y todos los entrenamientos se ejecutaron en una GPU H200 del cluster Rice NOTS en noviembre de 2026. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (world model) con brazo de imagen ViT-tiny, predictor autorregresivo y brazo de texto; alineación mediante rotación PRH |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.ckpt`, `.pt`) y export LeWM en `lewm_init/` |

## Arquitectura y entrenamiento

LePRWM se construye en cinco etapas sobre el código del commit `6d61cc6`. La etapa 1 entrena un brazo de imagen (ViT-tiny) durante 50 épocas en una H200 (16 h 52 min), con pérdida de entrenamiento que baja de 0,247 a aproximadamente 0,083. La etapa 2 entrena el world model completo (codificador de imagen congelado más predictor autorregresivo) durante 18 épocas (12 h 32 min), con pérdida de validación que baja de 1,124 a 0,0130 y se estabiliza a partir de la época 15. La etapa 3 entrena un brazo de texto durante 50 épocas (16 h), con pérdida de entrenamiento que baja de 1,04 a aproximadamente 0,90 y se estanca a partir de la época 5.

La innovación principal es la rotación PRH (etapas 4a y 4b): se ajusta una transformación lineal texto→imagen sobre el codificador del brazo de imagen congelado, con distintos números de pares K (30, 100, 300, 1000, 2505 y aleatorio). La etapa 5 entrena un decodificador de texto sobre los embeddings rotados con K=2505 durante 40 épocas (4 h 10 min), con pérdida de validación que baja de 10,44 a 0,357 y sigue descendiendo lentamente. El ajuste de la rotación es rápido (5 min) y produce resultados idénticos en las etapas 4a y 4b porque el codificador del world model está congelado.

## Capacidades

- Modelado de mundo (world model) para el entorno PushT: predicción de estados futuros a partir de observaciones visuales.
- Codificación de imágenes mediante ViT-tiny y predicción autorregresiva en el espacio latente.
- Alineación multimodal texto-imagen mediante rotación PRH aprendida, con recuperación texto→imagen evaluada sobre 2.495 pares retenidos.
- Decodificación de texto a partir de embeddings rotados (etapa 5).
- Exportación a formato LeWM (`lewm_init/`) para integración con el código de entrenamiento original.
- No se ha documentado soporte de tool calling, function calling, agentes, matemáticas, código ni otras capacidades de lenguaje general.

## Casos de uso

- Investigación en world models: el repositorio permite reproducir las cinco etapas de entrenamiento con los comandos y configuraciones Hydra incluidos, útil para estudiar la extensión de modalidades en arquitecturas JEPA.
- Estudio de alineación multimodal: los resultados de recuperación texto→imagen por valor de K (R@1 de 0,009 con K=30 hasta 0,122 con K=2505) sirven para analizar cómo escala la alineación con el número de pares de ajuste.
- Benchmark de manipulación robótica 2D: PushT es un entorno estándar para evaluar políticas y modelos de mundo; estos checkpoints permiten comparar el enfoque PRH con otras estrategias de fusión multimodal.
- Desarrollo de decodificadores de texto sobre embeddings visuales: la etapa 5 proporciona un decodificador entrenado sobre embeddings rotados que puede servir como punto de partida para experimentos similares.
- Reproducibilidad de experimentos: los registros de `runs/` (Hydra, logs de Python, stdout/stderr de Slurm) y `results/alignment.json` permiten auditar cada etapa con tiempos y métricas concretas.
- Docencia y formación: el repositorio desglosa cada etapa con su propio README, comando exacto, job y métricas, lo que facilita explicar el pipeline completo de un world model multimodal.

## Benchmarks y rendimiento

Resultados de recuperación texto→imagen sobre 2.495 pares retenidos (probabilidad aleatoria R@1 = 0,0004):

| K (pares de ajuste) | R@1 | R@1 con caption de test | Similitud coseno |
|---|---|---|---|
| 30 | 0,009 | 0,011 | 0,056 |
| 100 | 0,025 | 0,033 | 0,156 |
| 300 | 0,056 | 0,059 | 0,255 |
| 1000 | 0,099 | 0,115 | 0,340 |
| 2505 | 0,122 | 0,122 | 0,371 |

Protocolo de todos los pares: R@1 0,122, R@5 0,408, mKNN 0,40, CKA sin alinear 0,34.

Pérdidas de entrenamiento por etapa:

| Etapa | Job | Tiempo | Resultado |
|---|---|---|---|
| 1 brazo de imagen | 378856 | 16 h 52 min, 50 épocas | pérdida de entrenamiento 0,247 → ~0,083 (sin métrica de validación) |
| 2 world model | 393059 | 12 h 32 min, 18 épocas | pérdida de validación 1,124 → 0,0130 (plana desde la época ~15) |
| 3 brazo de texto | 393058 | 16 h 00 min, 50 épocas | pérdida de entrenamiento 1,04 → ~0,90 (estancada desde la época ~5) |
| 4a rotación (brazo de imagen) | 393060 | 5 min | ver tabla de rotación |
| 4b rotación (world model) | 393062 | 5 min | idéntica a 4a |
| 5 decodificador | 393061 | 4 h 10 min, 40 épocas | pérdida de validación 10,44 → 0,357 (sigue bajando) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que aún no se ha ejecutado una evaluación en bucle cerrado (`eval.py`) sobre los modelos combinados.

## Requisitos de hardware

- Entrenamiento: una GPU H200 por etapa, según los registros del cluster Rice NOTS (noviembre de 2026).
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (3,3 GB) incluye todos los checkpoints de las cinco etapas, no el peso de un único modelo.
- GPU recomendadas: no disponible; el entrenamiento se hizo en H200, pero no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta descarga vía `hf download` y evaluación con `python eval.py policy=pusht-leprwm/leprwm_proj_K2505 goal_modality=text`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. LePRWM es un artefacto de investigación específico del entorno PushT y no se han publicado comparaciones con otras arquitecturas JEPA, world models o modelos multimodales en la model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LePRWM — PushT | no disponible | no disponible | no disponible | Hugging Face (ahitagnied/leprwm-pusht) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha ejecutado una evaluación en bucle cerrado sobre los modelos combinados; el autor lo señala explícitamente como pendiente.
- La recuperación texto→imagen es baja en términos absolutos: R@1 de 0,122 con K=2505, muy por debajo de lo habitual en modelos de visión-lenguaje.
- El brazo de texto se estanca en pérdida ~0,90 desde la época 5, lo que sugiere un ajuste limitado de esa modalidad.
- El decodificador de texto seguía mejorando al final del entrenamiento (pérdida de validación 0,357 y bajando), por lo que puede estar infraentrenado.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- El modelo está especializado en el entorno PushT y no es un modelo de lenguaje general; no debe evaluarse con benchmarks de NLP estándar.
- Los checkpoints están ligados a un commit concreto (`6d61cc6`) y a rutas esperadas por el código (`$STABLEWM_HOME`), lo que limita su portabilidad.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahitagnied/leprwm-pusht
