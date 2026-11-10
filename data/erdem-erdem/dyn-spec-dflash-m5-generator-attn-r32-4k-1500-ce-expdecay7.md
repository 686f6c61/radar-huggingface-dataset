# erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-ce-expdecay7

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* de decodificación especulativa, no un modelo de lenguaje completo. Se trata de una adaptación LoRA (rango 32) sobre el drafter `z-lab/Qwen3-8B-DFlash-b16`, que actúa como modelo auxiliar para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. El autor lo publica dentro de la familia de artefactos "speculators" y "dflash", orientados a la investigación en decodificación especulativa.

El artefacto corresponde a la etapa de preentrenamiento del brazo `direct`, con 1500 actualizaciones y semilla 42, entrenado sobre un *activation store* de 4k de contexto. Incluye el estado del optimizador, métricas, evaluaciones offline y trazabilidad completa (provenance), lo que lo hace útil para reproducir o continuar experimentos, pero no para servir directamente en producción: el autor indica explícitamente que no es un *serving bundle* y que la exportación de servicio de DFlash aún no está portada.

Su relevancia es acotada y experimental: sirve como material de estudio para quienes trabajan en decodificación especulativa, ajuste de drafters y evaluación de aceptación de tokens, no como un modelo generativo autónomo. Los resultados de validación publicados muestran un rendimiento prácticamente plano entre la actualización 0 (0,5246) y la 1500 (0,5165) en `full_acc`, lo que sugiere que el entrenamiento no aportó mejoras medibles en esa métrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (el repositorio pesa 13,2 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (store de activaciones de 4k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con `MANIFEST.json` de tamaños y SHA256; no incluye GGUF ni safetensors de servicio |

## Arquitectura y entrenamiento

El artefacto es un *drafter* de decodificación especulativa adaptado mediante LoRA de rango 32 sobre el drafter base `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`). El entrenamiento se realizó en la etapa de preentrenamiento del brazo `direct`, con 1500 actualizaciones, semilla 42 y una política de decaimiento exponencial identificada en el nombre del run (`expdecay7`). El modelo objetivo es `Qwen/Qwen3-8B`, cuya identidad se almacena en `provenance/store/`.

Los datos de entrenamiento provienen de un *activation store* publicado por el mismo autor (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con contexto de 4k. El repositorio incluye el estado del optimizador, el comando de entrenamiento (`train_command.txt`), un parche (`speculators.patch`), registros de temporización y procedencia del lanzamiento de vLLM. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; por el tipo de artefacto, el entrenamiento se orienta a la predicción de tokens especulativos, no a alineamiento.

## Capacidades

- No es un modelo generativo autónomo: actúa como drafter auxiliar para decodificación especulativa sobre Qwen3-8B.
- Predicción de tokens candidatos para acelerar la generación del modelo objetivo.
- Entrenamiento y evaluación por fila con una LoRA por fila en el conjunto de validación (200 filas fijas).
- Métricas de aceptación reportadas: `full_acc` y τ (eal), además de desglose por dominio (chat, code, math, stem).
- Evaluaciones offline incluidas: reproducción, coeficientes M4, donantes M7, similitud D13 y coste D14, con métricas por fila.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Investigación en decodificación especulativa: usar el checkpoint como punto de partida para reproducir el run `direct`/`pretraining` con la semilla 42 y comparar curvas de aceptación frente a la actualización 0.
- Estudio de adaptadores LoRA para drafters: analizar el efecto del rango 32 y del decaimiento exponencial sobre la tasa de aceptación de tokens en Qwen3-8B.
- Reproducción de experimentos: el repositorio incluye `train_command.txt`, `speculators.patch` y `provenance/`, lo que permite reconstruir el entorno de entrenamiento y el lanzamiento de vLLM.
- Auditoría de procedencia: `MANIFEST.json` con SHA256 por fichero y la identidad del activation store permiten verificar la integridad de los artefactos en un pipeline de validación.
- Evaluación comparativa de drafters: las métricas por dominio (chat, code, math, stem) permiten contrastar el comportamiento del drafter en distintas cargas de trabajo antes de integrarlo en un sistema de serving.
- Formación y docencia: material concreto para explicar el flujo completo de un experimento de decodificación especulativa, desde la extracción de activaciones hasta la evaluación offline.

## Benchmarks y rendimiento

Resultados de validación publicados por el autor (200 filas fijas, una LoRA por fila, métrica `full_acc`):

| Update | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5165 | 6.971 | 0.3301 | 0.5608 | 0.6737 | 0.5013 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otros drafters.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no ser un *serving bundle*, no se puede desplegar directamente como drafter sin la exportación de servicio de DFlash.
- El repositorio ocupa 13,2 GB e incluye el estado del optimizador, por lo que el espacio en disco necesario para entrenamiento o reanudación es considerable.
- GPU recomendadas: no disponible en la información proporcionada; el modelo objetivo Qwen3-8B requiere, en términos generales, GPU con suficiente memoria para el modelo completo más el drafter, pero no se documentan requisitos concretos.
- Opciones de despliegue: no disponible; el autor indica que la exportación de servicio de DFlash no está portada. El repositorio incluye procedencia de un lanzamiento de vLLM, pero no un bundle listo para servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-m5-generator-attn-r32-4k-1500-ce-expdecay7 | Checkpoint de drafter LoRA (r32) | no disponible | 4096 | no disponible | Hugging Face (0 descargas) |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autónoma: es un checkpoint de entrenamiento de un drafter, no un bundle de servicio.
- El autor indica explícitamente que la exportación de servicio de DFlash no está portada, por lo que no puede desplegarse directamente en producción.
- Los resultados de validación muestran un descenso leve de `full_acc` entre la actualización 0 y la 1500 (0,5246 frente a 0,5165), sin mejora medible del entrenamiento en esa métrica.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas soportados no disponibles.
- No se documentan sesgos conocidos ni tasas de alucinación; al no ser un modelo generativo autónomo, estas métricas no aplican de la misma forma.
- El repositorio incluye estado del optimizador y artefactos de procedencia, lo que incrementa el tamaño y requiere verificación de integridad mediante `MANIFEST.json`.
- Fecha de creación y actualización del repositorio: 2026-11-09, con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-ce-expdecay7
- Activation store: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
