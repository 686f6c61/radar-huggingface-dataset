# erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-lkhybrid

## Resumen

`dyn-spec-dflash-m5-generator-attn-r32-4k-1500-lkhybrid` es un checkpoint de entrenamiento de un drafter de decodificación especulativa (speculative decoding) desarrollado por el usuario erdem-erdem. No es un modelo generativo autónomo, sino un adaptador LoRA de tipo "generator" entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B`. Forma parte de una línea de trabajo denominada dyn-spec, en la que se estudia la adaptación dinámica de drafters mediante almacenes de activaciones.

El artefacto publicado corresponde a la etapa de preentrenamiento del brazo `direct`, con 1500 actualizaciones, semilla 42 y un rango LoRA de 32 sobre un contexto de 4096 tokens. El repositorio incluye el estado completo del entrenamiento (checkpoint con estado del optimizador), métricas, evaluaciones offline y trazabilidad completa del proceso, pero no constituye un bundle listo para servir: el autor indica explícitamente que la exportación de serving del DFlash aún no está portada.

Su relevancia es acotada y experimental. Los resultados de validación sobre 200 filas fijas muestran que el ajuste apenas modifica el rendimiento respecto al estado inicial (full_acc de 0.5246 a 0.5247, τ de 7.108 a 7.167), lo que sugiere que este checkpoint documenta un experimento de reproducibilidad más que una mejora sustancial del drafter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA "generator" sobre drafter DFlash (decodificación especulativa) |
| Parametros totales | no disponible (rango LoRA r=32; tamaño del repo 13.2 GB incluyendo estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según nombre del checkpoint: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con `MANIFEST.json` de integridad |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 entrenado sobre el drafter `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), que actúa como generador de borradores para el modelo objetivo `Qwen/Qwen3-8B`. La nomenclatura `m5-generator-attn-r32-4k-1500-lkhybrid` indica la variante de atención del generador, el rango LoRA, la ventana de contexto de 4096 tokens, las 1500 actualizaciones y una configuración híbrida de tipo `lkhybrid`.

El entrenamiento se realizó en la etapa de preentrenamiento del brazo `direct`, con semilla 42 y trazabilidad completa (Git SHA `c746168756833f33c5d81ff81164b3c50b2bde62`, SHA256 del checkpoint `5ba9183979fac7d760ac76effeb32533a256da91a7d6a85f2c820a73ee6eba3b`). Los datos de entrenamiento provienen del almacén de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, del que no se detalla composición ni número de tokens. No se especifica uso de RLHF, DPO ni otra fase de alineamiento; el proceso es puramente de adaptación supervisada del drafter.

## Capacidades

- Generación de borradores (drafting) para decodificación especulativa sobre `Qwen3-8B`, con el objetivo de reducir la latencia de inferencia del modelo objetivo.
- Adaptación LoRA entrenada específicamente sobre activaciones del modelo objetivo `Qwen3-8B` con contexto de 4096 tokens.
- Evaluación por categorías: el autor reporta métricas desglosadas en chat, code, math y stem, lo que permite analizar el comportamiento del drafter por dominio.
- Soporte de tool calling / function calling: no disponible (el artefacto no es un modelo conversacional servible).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en decodificación especulativa: el checkpoint permite reproducir el experimento `direct`/`pretraining` con 1500 actualizaciones y semilla 42, comparando el estado inicial (update 0) con el final (update 1500) sobre las 200 filas fijas de validación.
- Estudio de adaptación dinámica de drafters: el almacén de activaciones asociado (`dyn-spec-dflash-store-qwen3-8b-4k`) y las evaluaciones offline (coeficientes M4, donantes M7, similitud D13, coste D14) sirven para analizar cómo varía el drafter por fila con un LoRA distinto por instancia.
- Análisis de rendimiento por dominio: las métricas desglosadas en chat, code, math y stem permiten estudiar en qué tareas el drafter mantiene mejor la tasa de aceptación (full_acc) y la longitud media de aceptación (τ).
- Reproducibilidad de pipelines de entrenamiento: los ficheros `train_command.txt`, `speculators.patch`, `run_record_*.json` y `provenance/` documentan comandos, parches y procedencia (incluida la configuración de lanzamiento de vLLM) para replicar el experimento.
- Auditoría de artefactos de investigación: `MANIFEST.json` con tamaño y SHA256 de cada fichero facilita verificar la integridad del checkpoint y de los resultados publicados.
- Base para futuras exportaciones de serving: aunque el bundle de serving DFlash no está portado, este checkpoint es el punto de partida documentado para generar dicho bundle cuando esté disponible.

## Benchmarks y rendimiento

El autor publica una validación sobre 200 filas fijas, con un LoRA por fila, midiendo `full_acc` y la longitud media de aceptación τ (eal), desglosada por dominio:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5247 | 7.167 | 0.3360 | 0.5683 | 0.6799 | 0.5147 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es un checkpoint de entrenamiento (13.2 GB con estado del optimizador) y no un bundle de serving.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con la información proporcionada.
- Opciones de despliegue: el autor indica que la exportación de serving del DFlash no está portada; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto. La procedencia incluye registros de lanzamiento de vLLM usados durante la extracción de activaciones, no para servir este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-m5-generator-attn-r32-4k-1500-lkhybrid | LoRA generator sobre DFlash drafter | Qwen3-8B | 4096 | no disponible | Checkpoint de entrenamiento |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | Qwen3-8B | no disponible | no disponible | Modelo base del drafter |
| Qwen/Qwen3-8B | LLM completo | no aplica | no disponible | no disponible | Modelo objetivo |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo servible: el autor indica explícitamente que es un checkpoint de entrenamiento con estado del optimizador y que la exportación de serving del DFlash no está portada.
- Mejora marginal: la validación muestra una variación prácticamente nula respecto al estado inicial (full_acc 0.5246 → 0.5247; τ 7.108 → 7.167), con caídas en chat (0.3383 → 0.3360) y code (0.5699 → 0.5683).
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas soportados no disponibles: no se documenta cobertura multilingüe.
- Contexto limitado a 4096 tokens según la nomenclatura del checkpoint.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un drafter, su función es proponer tokens que el modelo objetivo verifica, por lo que los sesgos dependerían del modelo objetivo y de los datos del almacén de activaciones.
- Dependencia fuerte del entorno: requiere el modelo objetivo `Qwen3-8B`, el drafter base `z-lab/Qwen3-8B-DFlash-b16` en el commit indicado y el almacén de activaciones asociado para reproducir los resultados.
- Trazabilidad parcial: se documentan SHA de Git y SHA256 del checkpoint, pero no la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-m5-generator-attn-r32-4k-1500-lkhybrid
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
