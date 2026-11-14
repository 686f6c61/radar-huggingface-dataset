# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kllabel

## Resumen

Este repositorio contiene un checkpoint de entrenamiento derivado del port del generador DFlash dentro del proyecto dyn-spec, orientado a la decodificacion especulativa. En concreto, se trata del brazo `fresh_lora` en etapa de preentrenamiento, con una LoRA de rango 32 aplicada sobre las capas de atencion y un entrenamiento de 2667 updates a partir de la semilla 42. El modelo drafter resultante se adapta sobre `z-lab/Qwen3-8B-DFlash-b16` y tiene como modelo objetivo `Qwen/Qwen3-8B`.

El artefacto no es un bundle de servicio: incluye el checkpoint con estado del optimizador, los resultados de entrenamiento, las evaluaciones offline y la procedencia completa, pero la exportacion para servir con DFlash no esta portada. Por tanto, es material de investigacion y reproducibilidad para estudiar tecnicas de decodificacion especulativa, no un modelo listo para desplegar en produccion.

La relevancia actual del repositorio radica en que documenta de forma exhaustiva un experimento de adaptacion de drafters para acelerar la inferencia de modelos de 8B parametros mediante decodificacion especulativa, un area activa en el despliegue eficiente de LLMs. La mejora observada entre el estado inicial y el final del entrenamiento es marginal (full_acc de 0.5265 a 0.5296), lo que sugiere que el valor principal del artefacto es la trazabilidad del experimento mas que el rendimiento absoluto del drafter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores LoRA (rango 32) sobre capas de atencion; drafter para decodificacion especulativa DFlash |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no hay safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Modelo drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Brazo / etapa | `fresh_lora` / `pretraining` |
| Updates de entrenamiento | 2667 |
| Semilla | 42 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El artefacto es un drafter de decodificacion especulativa construido sobre el modelo `z-lab/Qwen3-8B-DFlash-b16`, que actua como base para predecir tokens candidatos que el modelo objetivo `Qwen/Qwen3-8B` verifica despues. La adaptacion se realiza mediante una LoRA de rango 32 (`attn-r32`) aplicada sobre las capas de atencion, entrenada durante 2667 updates en la etapa de preentrenamiento del brazo `fresh_lora`. El entrenamiento parte de la semilla 42 y consume activaciones de un store dedicado (`dyn-spec-dflash-store-qwen3-8b-mix24k`), con un total de 24k muestras segun la nomenclatura del experimento (`abl24k`).

La innovacion tecnica destacable es el uso de activaciones almacenadas (activation store) para reproducir el entrenamiento del drafter sin depender del paso completo del modelo objetivo, junto con la trazabilidad completa del experimento: SHA de git, SHA256 del checkpoint, registros de lanzamiento de vLLM, registros de extraccion y registros de fill. El sufijo `kllabel` hace referencia a la etiqueta de la funcion de perdida empleada, y `static` indica que la configuracion de LoRA es estatica durante el entrenamiento. No se documentan en la informacion disponible detalles sobre el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B: el drafter propone tokens que el modelo objetivo valida, acelerando potencialmente la inferencia.
- Adaptacion mediante LoRA sobre capas de atencion, lo que permite modular el comportamiento del drafter sin reentrenar la base completa.
- Evaluacion sobre cuatro dominios de validacion: chat, code, math y stem, con metricas por dominio.
- Trazabilidad experimental completa: checkpoint con estado del optimizador, registros de procedencia, comandos de entrenamiento y parches aplicados.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir el experimento de adaptacion del drafter DFlash sobre Qwen3-8B, comparando el estado inicial (update 0) con el final (update 2667) para estudiar la dinamica del entrenamiento con LoRA.
- Estudio de funciones de perdida para drafters: el sufijo `kllabel` identifica la configuracion de perdida, lo que permite analizar su impacto en la precision de aceptacion del drafter por dominio (chat, code, math, stem).
- Reproducibilidad de pipelines de entrenamiento: el directorio `run/` incluye `train_command.txt`, `speculators.patch` y registros de procedencia, lo que facilita replicar el experimento en entornos con vLLM.
- Analisis de eficiencia de almacenes de activaciones: el store `dyn-spec-dflash-store-qwen3-8b-mix24k` y los registros de fill permiten estudiar el coste y la reutilizacion de activaciones en el entrenamiento de drafters.
- Benchmarking de tecnicas de aceleracion de inferencia: el drafter adaptado puede integrarse en pipelines de evaluacion offline (directorio `run/offline_eval/`) para medir coeficientes de aceptacion y coste por fila.
- Base para futuros experimentos de adaptacion: el checkpoint con estado del optimizador permite continuar el entrenamiento o aplicar variantes (por ejemplo, otros rangos de LoRA o etapas posteriores) partiendo de un estado reproducible.

## Benchmarks y rendimiento

Resultados de validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5296 | 7.880 | 0.3472 | 0.6010 | 0.6804 | 0.4896 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un checkpoint de entrenamiento con estado del optimizador, no un bundle de servicio, por lo que no se especifican requisitos de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: no disponible para este artefacto. El proyecto DFlash menciona vLLM en los registros de procedencia, pero la exportacion de servicio no esta portada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kllabel | no disponible | no disponible | full_acc 0.5296 (update 2667) | no disponible | Hugging Face (checkpoint de entrenamiento) |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base del drafter) |
| Qwen/Qwen3-8B | 8B (aproximado) | no disponible | no disponible | no disponible | Hugging Face (modelo objetivo) |

No hay datos suficientes para comparar rendimiento, contexto o licencia de forma rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un bundle de servicio: la exportacion DFlash para servir no esta portada, por lo que no puede desplegarse directamente como drafter en produccion.
- El checkpoint incluye estado del optimizador, lo que incrementa el tamano y requiere gestion cuidadosa en entornos de memoria limitada.
- La mejora entre el estado inicial y el final del entrenamiento es marginal (full_acc de 0.5265 a 0.5296), lo que limita el rendimiento esperado en comparacion con el drafter base.
- El rendimiento por dominio es desigual: chat (0.3472) y stem (0.4896) quedan por debajo de code (0.6010) y math (0.6804), lo que sugiere peor comportamiento en conversacion y ciencia.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribucion.
- Idiomas soportados no disponibles: no puede garantizarse cobertura multilingue.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un drafter, los tokens propuestos se verifican por el modelo objetivo, lo que mitiga parcialmente el riesgo en servicio, pero no en uso offline.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto: no disponibles.
- Artefacto de investigacion: pensado para reproducibilidad y estudio, no para uso directo en produccion sin trabajo adicional de exportacion y validacion.

## Enlaces

- [Hugging Face: erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kllabel](https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r32-2ep-kllabel)
- [Store de activaciones: erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k](https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k)
- [Modelo drafter base: z-lab/Qwen3-8B-DFlash-b16](https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16)
- [Modelo objetivo: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
