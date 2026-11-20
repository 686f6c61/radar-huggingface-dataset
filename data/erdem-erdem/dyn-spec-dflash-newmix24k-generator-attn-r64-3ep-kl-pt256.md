# erdem-erdem/dyn-spec-dflash-newmix24k-generator-attn-r64-3ep-kl-pt256

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* de decodificación especulativa (speculative decoding) para el modelo objetivo `Qwen/Qwen3-8B`. Lo desarrolla el usuario `erdem-erdem` dentro del ecosistema de herramientas `speculators` y del proyecto DFlash, y corresponde a la adaptación del *drafter* `z-lab/Qwen3-8B-DFlash-b16` mediante LoRA de rango 64 durante 3 épocas (4000 actualizaciones) sobre un conjunto de datos denominado `newmix24k`. No es un modelo generativo autónomo ni un paquete listo para servir: es un artefacto de investigación que incluye estado del optimizador, resultados, evaluaciones offline y procedencia completa.

El problema que aborda es la aceleración de la inferencia de un LLM de 8B parámetros mediante decodificación especulativa: un modelo pequeño y rápido (el *drafter*) propone varios tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. El checkpoint permite reproducir el entrenamiento del *drafter* y analizar su tasa de aceptación (métrica τ) por dominio.

La relevancia es acotada: se trata de un experimento de investigación con 0 descargas y 0 *likes* en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con el aviso explícito de que la exportación para servir en DFlash aún no está portada. Su interés principal es la reproducibilidad del pipeline de adaptación de *drafters* y la mejora medida en la validación fija de 200 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (drafter de decodificación especulativa, DFlash) sobre objetivo Qwen3-8B; adaptación LoRA de rango 64 |
| Parametros totales | no disponible (repo de 2,7 GB, incluye estado del optimizador y checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), más `result.json`, `metrics.json`, `timing.json`, `MANIFEST.json` con SHA256 |

## Arquitectura y entrenamiento

El artefacto es un *checkpoint* de entrenamiento de un *drafter* DFlash, no un modelo base. El objetivo es `Qwen/Qwen3-8B` y el *drafter* de partida es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). La adaptación se realiza con LoRA de rango 64, brazo `direct`, etapa `pretraining`, con 4000 actualizaciones, semilla 42 y una función de pérdida que incluye un término KL (`kl`) y un parámetro `pt256`. El entrenamiento se ejecuta sobre el conjunto `newmix24k`.

La model card documenta la procedencia completa: identidad del almacén de activaciones (`provenance/store/`), registro del extractor, procedencia del lanzamiento de vLLM y registros de *fill*. También incluye evaluaciones offline en `run/offline_eval/` con reproducibilidad, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila. No se detalla la composición del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- No es un modelo generativo autónomo: su función es actuar como *drafter* especulativo para `Qwen3-8B`, proponiendo tokens candidatos que el modelo objetivo verifica.
- Decodificación especulativa: acelera la inferencia del objetivo al reducir el número de pasos secuenciales.
- Validación por dominio: la model card reporta métricas desagregadas en chat, code, formal, math, roleplay y science.
- Tool calling / function calling: no disponible (depende del modelo objetivo, no del *drafter*).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: desplegar el *drafter* junto al modelo objetivo para reducir la latencia por token generado, siempre que se complete previamente la exportación de servicio DFlash (no portada en este repo).
- Investigación en decodificación especulativa: reproducir el entrenamiento con `train_command.txt`, `speculators.patch` y los registros de procedencia para validar resultados de forma independiente.
- Análisis de tasa de aceptación por dominio: usar las métricas de τ (eal) y `full_acc` desagregadas por chat, code, formal, math, roleplay y science para decidir en qué cargas de trabajo compensa el *drafter*.
- Ajuste fino de *drafters* con LoRA: el pipeline (rango 64, 3 épocas, 4000 actualizaciones, pérdida con KL) sirve como receta reproducible para adaptar otros *drafters* a dominios específicos.
- Evaluación comparativa de *drafters*: comparar el checkpoint en la actualización 0 frente a la 4000 (0,4447 frente a 0,4589 de `full_acc`) para cuantificar la ganancia del entrenamiento.
- Auditoría de procedencia y reproducibilidad: verificar integridad mediante `MANIFEST.json` y los SHA256 de checkpoint y commit, útil en entornos de investigación que exigen trazabilidad.

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | Score | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.4447 | 5.987 | 0.2764 | 0.5573 | 0.4909 | 0.6774 | 0.2107 | 0.4554 |
| 4000 | 0.4589 | 6.283 | 0.2826 | 0.5724 | 0.5277 | 0.6856 | 0.2227 | 0.4625 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un *checkpoint* de entrenamiento con estado del optimizador (repo de 2,7 GB), no un paquete de servicio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible para este artefacto; la exportación de servicio DFlash no está portada. El pipeline de entrenamiento referencia vLLM en la procedencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (dyn-spec DFlash generator) | no disponible | no disponible | Drafter especulativo para Qwen3-8B | no disponible | Hugging Face, 0 descargas |
| `z-lab/Qwen3-8B-DFlash-b16` | no disponible | no disponible | Drafter DFlash base para Qwen3-8B | no disponible | Hugging Face |
| `Qwen/Qwen3-8B` | 8B | no disponible | Modelo generativo objetivo | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un *checkpoint* de entrenamiento con estado del optimizador; la exportación de servicio DFlash no está portada.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: no hay garantía de cobertura multilingüe.
- Sin datos de benchmarks estándar ni de contexto máximo; no se puede evaluar su comportamiento fuera de la validación de 200 filas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un *drafter*, la calidad final depende del modelo objetivo Qwen3-8B.
- Repositorio sin tracción (0 descargas, 0 *likes*) y creado en 2026-11-20: sin validación externa conocida.
- La mejora medida es modesta (0,4447 a 0,4589 de `full_acc`; τ de 5,987 a 6,283) y sobre una muestra fija pequeña, por lo que la generalización no está demostrada.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix24k-generator-attn-r64-3ep-kl-pt256
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Commit del drafter base: `9b41424b7109f9c5413454f481b09a82b85333f4`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
