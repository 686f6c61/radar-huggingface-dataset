# erdem-erdem/dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvctx

## Resumen

`dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvctx` es un checkpoint de entrenamiento de un drafter (modelo borrador) para decodificacion especulativa, publicado por el usuario erdem-erdem en Hugging Face. No es un modelo de lenguaje autonomo: es un adaptador LoRA de rango 32 entrenado para actuar como generador de propuestas en un esquema de speculative decoding sobre el modelo objetivo Qwen/Qwen3-8B, partiendo del drafter `z-lab/Qwen3-8B-DFlash-b16`. Forma parte del port del generador DFlash del proyecto dyn-spec, en su rama `direct` y etapa de `pretraining`.

El artefacto contiene el estado completo del entrenamiento (incluido el estado del optimizador), los registros de ejecucion, las evaluaciones offline y la procedencia completa (identidad del store de activaciones, lanzamiento de vLLM, hashes). El autor indica explicitamente que no es un bundle de serving: la exportacion DFlash para inferencia aun no esta portada. El repositorio ocupa 13,2 GB, coherente con un checkpoint con estado de optimizador sobre un modelo de 8B.

Su relevancia es de nicho: sirve como material reproducible para investigadores que trabajan en decodificacion especulativa y quieran replicar o auditar el entrenamiento del drafter, no como modelo listo para produccion. Los resultados de validacion muestran que el entrenamiento apenas mueve la aguja respecto al punto de partida (full_acc 0,5246 en el update 0 frente a 0,5221 en el update 1500), lo que sugiere que el checkpoint documenta un experimento mas que una mejora sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash para decodificacion especulativa; modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (repo de 13,2 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (sufijo `4k` del nombre; `kvctx` en el identificador) |
| Tipos de cuantizacion | no disponible (checkpoint en `checkpoint.pt`, no cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoint.pt`) con estado del optimizador; no es bundle de serving |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (`attn-r32`) que actua como drafter en un esquema de decodificacion especulativa tipo DFlash. El drafter base es `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`) y el modelo objetivo es Qwen/Qwen3-8B. El entrenamiento corresponde a la rama `direct`, etapa `pretraining`, con 1500 updates, semilla 42 y un contexto de 4096 tokens.

Los datos de entrenamiento provienen de un store de activaciones publicado por el mismo autor (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`), con registros de extraccion y lanzamiento de vLLM en `provenance/store/`. El checkpoint incluye `train_command.txt`, `speculators.patch`, `metrics.json` y `timing.json`, lo que permite reproducir la ejecucion. No se documentan en la model card detalles sobre volumen de tokens, composicion del dataset ni uso de RLHF o DPO; al tratarse de un drafter de decodificacion especulativa, el objetivo de entrenamiento es predecir tokens futuros para acelerar la generacion del modelo objetivo, no alineamiento conversacional.

## Capacidades

- Generacion de tokens candidatos (drafting) para decodificacion especulativa sobre Qwen3-8B.
- Prediccion multi-token por paso para acelerar la inferencia del modelo objetivo.
- Evaluacion por dominios: la validacion reporta metricas separadas para chat, code, math y stem.
- No es un modelo de chat autonomo: no genera respuestas finales por si mismo, propone tokens que el modelo objetivo verifica.
- Soporte de tool calling, agentes, vision o audio: no disponible (no documentado; fuera del proposito del artefacto).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en decodificacion especulativa: el checkpoint permite reproducir el entrenamiento del drafter con los comandos y el patch incluidos, y comparar el punto inicial (update 0) con el final (update 1500) para estudiar la dinamica de entrenamiento.
- Auditoria de procedencia: los registros de `provenance/store/` (identidad del store, extractor, lanzamiento de vLLM) permiten verificar de donde salieron las activaciones de entrenamiento, util en trabajos de reproducibilidad.
- Base para experimentos de LoRA en drafters: el adaptador de rango 32 sobre Qwen3-8B-DFlash-b16 sirve como punto de partida para probar otras configuraciones de rango, contexto o etapas de entrenamiento.
- Analisis de coste de inferencia: los resultados de `run/offline_eval/` (coeficientes M4, donantes M7, similitud D13, coste D14) permiten estudiar el impacto del drafter en el coste de decodificacion.
- Docencia y formacion: material concreto para explicar como se entrena y evalua un drafter de speculative decoding con metricas por dominio (full_acc y τ).
- Benchmarking de pipelines de entrenamiento: el repo incluye `timing.json` y `metrics.json`, utiles para comparar el rendimiento de distintas configuraciones de entrenamiento de drafters.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc` y τ (eal):

| Update | Score (full_acc) | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5221 | 7.105 | 0.3345 | 0.5676 | 0.6746 | 0.5115 |

No se han publicado comparaciones con otros drafters ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repo ocupa 13,2 GB e incluye estado del optimizador; para cargar el checkpoint en entrenamiento o analisis se necesita espacio en disco y RAM/VRAM acorde al modelo base Qwen3-8B mas el estado.
- El checkpoint no es un bundle de serving: para inferencia real hace falta el export DFlash, que el autor indica que aun no esta portado.
- VRAM estimada para el modelo objetivo Qwen3-8B en inferencia: aproximadamente 16 GB en FP16/BF16, o 8-10 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits (estimacion orientativa, no publicada en la informacion disponible).
- GPU recomendadas para el modelo objetivo: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en cuantizacion.
- Opciones de despliegue: no disponibles para este artefacto concreto; el ecosistema DFlash y el modelo objetivo Qwen3-8B son compatibles con vLLM, pero la exportacion de serving no esta portada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvctx | LoRA r32 sobre drafter DFlash (objetivo 8B) | 4096 | Drafter de decodificacion especulativa | no disponible | Checkpoint de entrenamiento, no serving |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash sobre Qwen3-8B | no disponible | Drafter de decodificacion especulativa | no disponible | Disponible como modelo base del drafter |
| Qwen/Qwen3-8B | 8B | no disponible | Modelo de lenguaje general | no disponible | Disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autonoma: sin la exportacion DFlash de serving no puede desplegarse para inferencia.
- El entrenamiento no mejora el punto de partida: full_acc baja de 0,5246 a 0,5221 y τ de 7,108 a 7,105 entre el update 0 y el 1500; conviene tratarlo como registro de un experimento, no como una mejora validada.
- Licencia no declarada: no hay garantias para uso comercial ni condiciones de redistribucion.
- Idiomas no declarados; el comportamiento multilingue del drafter depende del modelo objetivo y del store de activaciones, no documentado.
- Riesgo de alucinacion: inherente a cualquier drafter, aunque los tokens propuestos se verifican contra el modelo objetivo en decodificacion especulativa.
- Sesgos: no documentados; dependen del dataset de activaciones y del modelo base Qwen3-8B.
- El contexto esta limitado a 4096 tokens segun el identificador del checkpoint.
- El repo incluye estado del optimizador y artefactos de entrenamiento, lo que aumenta el tamano y no esta pensado para distribucion ligera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d1-generator-attn-r32-4k-1500-kvctx
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
