# erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* (modelo borrador) para decodificación especulativa, no un modelo generativo completo. Se trata de una adaptación LoRA de rango 32 sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, orientada a acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B` mediante la técnica DFlash de decodificación especulativa. El autor es erdem-erdem y el artefacto forma parte de una familia de experimentos denominada dyn-spec, con ramas (`arms`) de entrenamiento `direct` y `pretraining`.

El modelo se ha entrenado sobre un conjunto de datos de tipo math10k (10.000 ejemplos de matemáticas) durante 3 épocas (1667 actualizaciones), con semilla 42. El repositorio incluye el estado del optimizador, resultados de validación, evaluaciones offline y trazabilidad completa (provenance), pero el autor advierte explícitamente de que no es un paquete listo para servir: la exportación DFlash para inferencia aún no se ha portado.

Su relevancia es acotada y experimental: sirve como material reproducible para investigadores que trabajen en decodificación especulativa y quieran inspeccionar la adaptación de un drafter DFlash sobre Qwen3-8B, no como modelo de propósito general. El tamaño del repositorio (6,6 GB) corresponde al checkpoint con estado del optimizador, no a los pesos finales del modelo objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 sobre drafter DFlash (`z-lab/Qwen3-8B-DFlash-b16`), técnica de decodificación especulativa |
| Parametros totales | no disponible (el repositorio contiene un checkpoint de entrenamiento de 6,6 GB, no los pesos finales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) con estado del optimizador; no incluye exportación de servicio DFlash |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Rama / etapa | `direct` / `pretraining` |
| Actualizaciones de entrenamiento | 1667 |
| Epocas | 3 |
| Semilla | 42 |
| Dataset | math10k (10.000 ejemplos de matemáticas) |
| Git SHA | 08935cbe961f70378e43d359368b610da4b946e0 |
| SHA256 del checkpoint | 949bd417c398d1e2b697ab71652d2a54ae0a9bc1fdfc11b0b9fb8c2a7a7b4757 |

## Arquitectura y entrenamiento

El artefacto es una adaptación LoRA de rango 32 aplicada sobre un drafter DFlash preentrenado para Qwen3-8B. DFlash es una variante de decodificación especulativa en la que un modelo borrador pequeño propone varios tokens que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado. La rama de entrenamiento es `direct` en etapa de `pretraining`, sobre un dataset de matemáticas de 10.000 ejemplos (math10k), durante 3 épocas y 1667 actualizaciones con semilla 42.

El repositorio incluye el estado del optimizador, el comando de entrenamiento (`train_command.txt`), un parche de la herramienta (`speculators.patch`), registros de temporización y un directorio de provenance con la identidad del almacén de activaciones, el registro del extractor, la trazabilidad del lanzamiento de vLLM y los registros de relleno. La evaluación offline documentada cubre reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila. No se detalla en la información disponible la composición exacta del dataset, la presencia de RLHF/DPO ni innovaciones adicionales de atención más allá de la propia técnica DFlash.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre Qwen3-8B (no es un modelo generativo autónomo).
- Aceleración de inferencia del modelo objetivo mediante verificación paralela de propuestas del drafter.
- Adaptación específica al dominio matemático (dataset math10k), con mejora marginal medida en la métrica `full_acc`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; depende del modelo objetivo Qwen3-8B.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el entrenamiento del drafter DFlash sobre Qwen3-8B con la configuración exacta (LoRA r32, 3 épocas, semilla 42) y comparar con la rama base.
- Estudio de adaptación de dominios en drafters: sirve para analizar cómo una adaptación LoRA sobre math10k afecta a la tasa de aceptación de tokens especulativos en tareas de matemáticas frente a chat, código y STEM.
- Reproducción de experimentos con trazabilidad completa: el directorio `provenance/` y `MANIFEST.json` permiten verificar la identidad de los artefactos, el almacén de activaciones y el lanzamiento de vLLM, útil para auditorías de resultados.
- Análisis de coste/beneficio de la decodificación especulativa: los registros de `offline_eval/` (coeficientes M4, coste D14) permiten estudiar el equilibrio entre velocidad y precisión del drafter.
- Base para futuras exportaciones de servicio: aunque la exportación DFlash no está portada, el checkpoint puede servir como punto de partida para generar un bundle de inferencia cuando esté disponible.
- Docencia y formación técnica: material concreto para explicar el funcionamiento interno de un drafter LoRA y las métricas de validación asociadas (full_acc, τ EAL).

## Benchmarks y rendimiento

Validación sobre 200 filas fijas, una fila por LoRA, métrica `full_acc`:

| Actualización | Score | τ (EAL) | Chat | Code | Math | STEM |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 1667 | 0.5305 | 7.855 | 0.3474 | 0.6021 | 0.6841 | 0.4884 |

La mejora entre la actualización 0 y la 1667 es marginal (+0.0040 en score, +0.152 en τ EAL). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio contiene un checkpoint de entrenamiento de 6,6 GB con estado del optimizador, no un paquete de servicio.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor indica que la exportación DFlash para servicio no está portada; el entrenamiento se documenta con lanzamiento de vLLM en `provenance/store/`.
- Latencia y throughput: no disponibles; los registros de `timing.json` y la evaluación de coste D14 están en el repositorio pero sus valores no se detallan en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-math10k-generator-attn-r32-3ep | Drafter LoRA DFlash sobre Qwen3-8B | no disponible | no disponible | no disponible | Hugging Face (checkpoint de entrenamiento) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base para Qwen3-8B | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo generativo objetivo | 8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para servir: el autor advierte de que es un checkpoint de entrenamiento con estado del optimizador y que la exportación DFlash para servicio no está portada.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del drafter base y del modelo objetivo Qwen3-8B.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Sesgos conocidos: no disponibles; el dataset math10k está sesgado hacia contenido matemático.
- Riesgo de alucinación: aplicable al modelo objetivo Qwen3-8B, no evaluado en este artefacto.
- Mejora marginal: la diferencia entre la actualización 0 y la 1667 es muy pequeña (0.5265 → 0.5305), lo que limita el beneficio práctico de esta adaptación concreta.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Limitaciones de contexto: no disponible la longitud de contexto del drafter ni del modelo objetivo en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-math10k-generator-attn-r32-3ep
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
