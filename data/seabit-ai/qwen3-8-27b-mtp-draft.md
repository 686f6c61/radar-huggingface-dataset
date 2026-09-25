# seabit-ai/Qwen3.8-27B-MTP-draft

## Resumen

`seabit-ai/Qwen3.8-27B-MTP-draft` no es un modelo de lenguaje completo, sino la cabeza de predicción multi-token (MTP, *multi-token prediction*) extraída del modelo `Qwen/Qwen3.8-27B` y reempaquetada como *drafter* independiente para decodificación especulativa en MLX. Corresponde al shard 18 del modelo original (15 tensores con prefijo `mtp.*`: una capa decodificadora de atención completa, una proyección de fusión y tres normalizaciones), salvada sin modificar sus valores, solo renombrada y con metadatos MLX.

El problema que resuelve es concreto: las conversiones MLX de Qwen3.8-27B publicadas en el Hub (por ejemplo, las de `lmstudio-community` y `mlx-community`) descartan los tensores MTP, por lo que los usuarios de MLX no podían usar la decodificación especulativa con la propia cabeza del modelo sin volver a descargar los 54 GB del *checkpoint* original. Este repositorio aísla esa cabeza en un archivo de 810 MB en bf16 que se carga con `load_drafter(...)` y `--draft-kind mtp`.

El *drafter* no tiene pesos propios más allá de este archivo: comparte los *embeddings* y la LM head del modelo objetivo, lo que explica sus 424.699.392 parámetros (unos 425 M) y que la compatibilidad dependa del `hidden_size` y del vocabulario. Funciona con cualquier cuantización MLX de Qwen3.8-27B en 4, 5, 6 u 8 bits. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (`model_type: qwen3_5_mtp`): una capa decodificadora de atención completa, una proyección de fusion y tres normas; se usa como drafter de decodificacion especulativa |
| Parametros totales | 424.699.392 (~425 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (hereda el `text_config` del modelo objetivo; el valor no se detalla) |
| Tipos de cuantizacion | Drafter en bf16; compatible con cuantizaciones 4, 5, 6 y 8 bits del modelo objetivo |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); config.json con `model_type: qwen3_5_mtp` y `block_size: 3`; incluye `SHA256SUMS` |

## Arquitectura y entrenamiento

La cabeza MTP forma parte del diseño de Qwen3.8-27B y aquí se extrae tal cual, sin reentrenamiento: los valores son idénticos a los del shard `model-00018-of-00018.safetensors` original (bf16), solo se elimina el prefijo `mtp.` y se re-guarda con metadatos MLX. La herramienta usada es `python -m mlx_vlm.speculative.drafters.qwen3_5_mtp.split` (mlx-vlm 0.6.12), que genera el `config.json` con `model_type: qwen3_5_mtp`, `block_size: 3` y el `text_config` del modelo objetivo.

En términos de funcionamiento, la cabeza predice varios tokens por paso (`block_size: 3`), que luego se verifican contra el modelo objetivo. Al compartir *embeddings* y LM head con el modelo grande, el *drafter* solo aporta una capa decodificadora de atención completa, una proyección de fusión y tres normalizaciones, lo que da esos ~425 M de parámetros y el archivo de 810 MB en bf16. No se documenta en la información disponible ningún dato sobre dataset de entrenamiento, tokens vistos, RLHF/DPO ni innovaciones adicionales más allá del propio mecanismo MTP.

## Capacidades

- Decodificación especulativa: actúa como *drafter* de Qwen3.8-27B para acelerar la generación greedy acelerando la propuesta de tokens que el modelo objetivo valida.
- Predicción multi-token: genera bloques de hasta 3 tokens por paso (`block_size: 3`).
- Aceleración de generación: medida de 1,2x en prosa a 1,7x en código y *copy-editing* sobre un M3 Ultra, con salida idéntica en código.
- Compatibilidad amplia: funciona con cualquier conversión MLX de Qwen3.8-27B en 4, 5, 6 u 8 bits, ya que la compatibilidad se basa en `hidden_size` y vocabulario.
- Integración con tooling: se carga con `mlx-vlm` (`load_drafter`, `--draft-kind mtp`) o mediante la herramienta `lmk` (`lmk up`).
- No es un modelo autónomo: no genera texto por sí solo, no soporta *tool calling*, agentes ni razonamiento multi-paso por sí mismo; esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en Mac con Apple Silicon: cargar el *drafter* junto a una cuantización 4 bits de Qwen3.8-27B en mlx-vlm para reducir la latencia de generación sin cambiar la salida, especialmente útil en aplicaciones interactivas.
- Asistentes de código en local: al medir 1,7x de aceleración en tareas de código con salida idéntica, es adecuado para editores con autocompletado o revisión de código sobre un Mac.
- Edición y corrección de textos (*copy-editing*): el caso donde el autor reporta la mayor ganancia (1,7x), aplicable a herramientas de reescritura que operan con decodificación greedy.
- Generación de prosa interactiva: ganancia de 1,2x en texto libre; útil para chatbots locales donde cada token cuenta en la experiencia de usuario.
- Despliegue ligero en equipos con memoria unificada: el *drafter* ocupa 810 MB en bf16 frente a los 54 GB del *checkpoint* completo, por lo que añadir decodificación especulativa a un flujo MLX existente es barato en disco y memoria.
- Investigación en decodificación especulativa: sirve como referencia reproducible para comparar el enfoque MTP nativo de Qwen frente a otras técnicas de *drafting* en MLX.
- Pipelines con `lmk`: activar `speculative_decoding: true` en `~/.lmk/config.yaml` para que `lmk` descargue y use el *drafter* automáticamente con las variantes 4/5/6/8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la aceleración de decodificación medida por el autor:

| Escenario | Plataforma | Modo | Aceleracion |
|---|---|---|---|
| Prosa | M3 Ultra | greedy | 1,2x |
| Codigo | M3 Ultra | greedy | 1,7x |
| Copy-editing | M3 Ultra | greedy | 1,7x |

El autor indica que la salida es idéntica a la del modelo sin *drafter* en el caso de código.

## Requisitos de hardware

- VRAM/memoria del *drafter*: 810 MB en bf16; al compartir *embeddings* y LM head con el objetivo, no suma esos pesos por duplicado.
- Memoria del modelo objetivo (referencia): una cuantización 4 bits de un modelo de 27B se sitúa en torno a los 14-15 GB, a lo que se suma el *drafter* y el contexto.
- Plataforma: MLX requiere Apple Silicon (familia M). El autor midió sobre un M3 Ultra.
- GPU recomendadas: no aplica a CUDA/A100/H100/RTX; no es compatible con esas plataformas al ser un formato MLX.
- Opciones de despliegue: `mlx-vlm` (`load_drafter`, `--draft-kind mtp`) y la herramienta `lmk` (`lmk up`, `speculative_decoding: true` en `~/.lmk/config.yaml`). No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se conoce la aceleración relativa (1,2x-1,7x sobre M3 Ultra en greedy); no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Elemento | Este repositorio | MTP embebido en Qwen/Qwen3.8-27B | Conversiones MLX sin MTP (lmstudio-community, mlx-community) |
|---|---|---|---|
| Que es | Cabeza MTP aislada como drafter | Mismo drafter dentro del checkpoint completo | Conversiones 4/5/6/8 bits sin los tensores MTP |
| Parametros del drafter | ~425 M | ~425 M | no disponible (tensores descartados) |
| Tamano de descarga | 0,8 GB | 54 GB (checkpoint completo) | Variable segun cuantizacion |
| Decodificacion especulativa con MTP | Si, sin descargar el original | Si | No disponible por defecto |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Disponibilidad | HuggingFace (seabit-ai) | HuggingFace (Qwen) | HuggingFace |

No se dispone de datos para comparar con otras familias de *drafters* (por ejemplo, cabezas tipo EAGLE o Medusa) en cuanto a parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: solo sirve como *drafter* para Qwen3.8-27B; no puede generar texto sin el modelo objetivo.
- Dependencia estricta del objetivo: la compatibilidad depende del `hidden_size` y del vocabulario, por lo que solo funciona con Qwen3.8-27B y sus cuantizaciones MLX.
- Limitado a MLX/Apple Silicon: no hay soporte para CUDA, ROCm ni *backends* habituales de servidor.
- Ganancia variable: la aceleración citada (1,2x-1,7x) está medida en greedy sobre un M3 Ultra; con muestreo aleatorio, *temperature* > 0 u otro hardware el comportamiento puede diferir.
- Repositorio recién publicado: 0 descargas y 0 *me gusta* en el momento de la consulta, sin validación externa independiente.
- Idiomas y sesgos: la información disponible no detalla idiomas soportados ni sesgos; dependen íntegramente del modelo objetivo.
- Riesgo de alucinación: el *drafter* no lo introduce por sí mismo (la salida verificada coincide con la del objetivo), pero hereda el del modelo Qwen3.8-27B.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la titularidad de los pesos sigue siendo del equipo Qwen y este repositorio solo reempaqueta un shard.
- Ausencia de contexto documentado: no se especifica la longitud de contexto efectiva, dato relevante para producción.

## Enlaces

- HuggingFace: https://huggingface.co/seabit-ai/Qwen3.8-27B-MTP-draft
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- mlx-vlm (librería): https://github.com/Blaizzy/mlx-vlm
- Herramienta lmk: https://github.com/seabit-ai/lmk
