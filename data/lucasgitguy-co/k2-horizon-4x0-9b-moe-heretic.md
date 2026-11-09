# Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic

## Resumen

K2-Horizon-4x0.9B-MoE-heretic es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) construido por el usuario Lucasgitguy-co a partir de los checkpoints públicos del modelo denso IFM/K2-Horizon-0.9B, desarrollado por IFM. El modelo combina cuatro expertos por capa (top-1 routing con router softmax) mediante una técnica de *upcycling*: cada experto es el bloque MLP de uno de los checkpoints de especialización por RL publicados por IFM (`main`, `rl_code2`, `rl_if`, `rl_stem`), mientras que atención, embeddings, normalizaciones y `lm_head` provienen del checkpoint `main`. El resultado es un modelo de 3,06 mil millones de parámetros totales con 1,08 mil millones activos por token, en precisión bf16 y con 6,1 GB de pesos.

Sobre esta base se aplicó un proceso de *abliteration* con la herramienta Heretic 2.0.0.dev0 (Arbitrary-Rank Ablation) para eliminar la mayor parte de los rechazos del modelo original: en la prueba de `harmful_behaviors` (100 prompts) el modelo pasa de 100/100 rechazos en el modelo base a 3/100 en esta variante. El modelo conserva la ventana de contexto de 128K tokens del original (mediante YaRN) y el modo de razonamiento con bloques `<ifm|think>` y parámetro `reasoning_effort`.

Es relevante ahora por dos motivos: por un lado, demuestra un flujo de trabajo reproducible de construcción de un MoE por *upcycling* sin entrenamiento del router (inicializado a partir de medias de estados ocultos por dominio); por otro, es un ejemplo de modelo "uncensored" con licencia Apache-2.0. Conviene señalar que, según el propio autor, los expertos son casi idénticos entre sí (diferencias de ~0,05% en norma relativa), por lo que el comportamiento es prácticamente el del modelo base con el triple de tamaño en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE nativa `k2_horizon` (`K2HorizonSparseMoeBlock`), 4 expertos por capa, top-1 routing, router softmax |
| Parametros totales | 3.060.266.496 (3,06B) |
| Parametros activos | 1,08B por token |
| Longitud de contexto | 128K (YaRN, igual que el modelo base) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 6,1 GB de repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bloques MoE dispersos propios del modelo base (`k2_horizon`), con cuatro expertos por capa y enrutamiento top-1 mediante un router softmax. Cada experto de cada capa es el bloque MLP de uno de los checkpoints de especialización por RL publicados como tags del repositorio IFM/K2-Horizon-0.9B: `main` (MOPD final, propósito general), `rl_code2` (código y matemáticas), `rl_if` (seguimiento de instrucciones) y `rl_stem` (ciencia). La atención, los embeddings, las normalizaciones y la cabeza `lm_head` se copian del checkpoint `main`. No hubo entrenamiento del router: cada fila de la puerta se inicializó como la diferencia normalizada entre la media de las entradas al MLP en prompts del dominio correspondiente y la media global, escalada a un rango logit unitario, usando 32 prompts por dominio (harmless_alpaca, MBPP + GSM8K, IFEval, SciQ).

El proceso de *abliteration* se aplicó primero sobre el modelo denso `main` con Heretic (100 ensayos); el ensayo 47 modificó 14 tensores (`self_attn.o_proj` y `mlp.down_proj` de las capas 13 a 19). Los cambios en `o_proj` se copiaron tal cual y la misma edición de `down_proj` (`W_heretic − W_main`) se sumó al `down_proj` de cada experto en esas capas. Como comprobación, una versión de prueba con todos los expertos iguales al MLP de `main` reprodujo el argmax del siguiente token del modelo denso en 50/50 posiciones (diferencia máxima de logits de 0,72, compatible con ruido de bf16). El modelo requiere `transformers` 5.x y `trust_remote_code=True`, ya que el código de la arquitectura se distribuye con el repositorio.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito: las respuestas se emiten tras un bloque `<ifm|think> … </ifm|think>`, con control mediante `reasoning_effort` (`high`, `medium`, `low`).
- Especialización por dominio a través del enrutamiento: código y matemáticas tienden a `rl_code2`, seguimiento de instrucciones a `rl_if`, ciencia a `rl_stem` y conversación general a `main` (según la tabla de routing del autor).
- Contexto largo de 128K tokens (YaRN), heredado del modelo base.
- Modelo "uncensored": los rechazos se han reducido drásticamente (3/100 en la prueba de `harmful_behaviors` frente a 100/100 del base).
- Soporte de plantilla de chat (`apply_chat_template`) con `add_generation_prompt` y `reasoning_effort`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de texto conversacional en inglés y chino: el modelo mantiene la plantilla de chat del base y puede gestionar diálogos multi-turno con hasta 128K tokens de contexto, útil para asistentes con historial largo.
- Procesamiento de documentos extensos: la ventana de 128K permite resumir o extraer información de contratos, informes o código fuente completo en una sola pasada, sin fragmentación.
- Razonamiento matemático y de código en entornos controlados: el enrutamiento hacia `rl_code2` en prompts de código y matemáticas (0,74 de cuota top-1 en la tabla del autor) lo hace adecuado para tareas de generación de código y resolución de problemas, siempre que se acepte que la ganancia real frente al modelo denso es marginal.
- Investigación sobre MoE y *upcycling*: sirve como caso de estudio reproducible de construcción de un MoE a partir de checkpoints densos, con scripts en `build/` y verificación de equivalencia frente al modelo base.
- Experimentación con *abliteration*: permite estudiar el efecto de Heretic sobre un modelo pequeño y comparar el comportamiento censurado y no censurado en el mismo checkpoint.
- Despliegue en hardware de consumo: con 3,06B parámetros totales y 1,08B activos, en bf16 ocupa 6,1 GB, por lo que cabe en GPUs de consumo con suficiente VRAM (por ejemplo, 8-12 GB) y en Apple Silicon; el autor lo probó en un Apple M4 con MPS.
- Generación creativa sin restricciones de contenido: el modelo está pensado para usos donde los rechazos del base resultan un obstáculo, bajo responsabilidad del usuario.

## Benchmarks y rendimiento

| Modelo | Rechazos (harmful_behaviors, 100) | ARC-Easy acc / acc_norm (200, ±0,035) |
|---|---|---|
| IFM/K2-Horizon-0.9B | 100/100 | 0,560 / 0,575 |
| Denso 0.9B tras Heretic (ensayo 47) | 4/100 (recuento propio de Heretic: 0/100, KL 0,058) | – |
| **Este MoE** | **3/100** | **0,570 / 0,560** |

Los rechazos se midieron con el pensamiento omitido (`</ifm|think>` pre-rellenado), 100 tokens nuevos, decodificación greedy y la lista de palabras clave de rechazo de Heretic. KL es la divergencia KL del primer token de Heretic frente al original en prompts inocuos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~6,1 GB de pesos más overhead de activaciones y caché KV; con contexto de 128K la caché KV crece de forma significativa y puede requerir bastante más memoria.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe en GPUs de consumo con 8-12 GB de VRAM y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con al menos ~8 GB de VRAM; el autor lo probó en un Apple M4 con MPS y bf16.
- Opciones de despliegue: solo `transformers` 5.x con `trust_remote_code=True`. llama.cpp/GGUF, Ollama, MLX y LM Studio no soportan la arquitectura MoE `k2_horizon`.
- Latencia y throughput: no disponibles. Al ser top-1 routing, solo se activan 1,08B parámetros por token, lo que reduce el coste de cómputo frente a un denso de 3,06B, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| K2-Horizon-4x0.9B-MoE-heretic | 3,06B | 1,08B | 128K | Apache-2.0 | safetensors, solo transformers | MoE por upcycling, uncensored |
| IFM/K2-Horizon-0.9B | 0,9B | 0,9B (denso) | 128K | Apache-2.0 | safetensors, transformers | Modelo base, censurado, mismo rendimiento ARC-Easy |
| Denso 0.9B tras Heretic (ensayo 47) | 0,9B | 0,9B (denso) | 128K | Apache-2.0 | safetensors, transformers | Mismo proceso de abliteration, 4/100 rechazos |

No se dispone de datos de otros modelos comparables de la misma categoría (MoE pequeños con abliteration) en la información proporcionada.

## Limitaciones y advertencias

- **Expertos casi idénticos**: los checkpoints RL difieren de `main` en solo ~0,05% de sus pesos (norma relativa; `rl_if` frente a `rl_stem` ~0,07%). El MoE se comporta prácticamente como el modelo base, con el triple de tamaño en disco; no hay ganancia real de especialización porque no se entrenó ni el router ni los expertos.
- **Compatibilidad limitada**: solo funciona con `transformers` 5.x y `trust_remote_code=True`; no hay soporte para llama.cpp/GGUF, Ollama, MLX ni LM Studio.
- **Modelo uncensored**: los rechazos se han eliminado en gran medida; el usuario es responsable del uso de las salidas y de las implicaciones legales y éticas.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de este tamaño; no se documentan evaluaciones de fidelidad factual.
- **Idiomas**: solo inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- **Contexto**: aunque soporta 128K mediante YaRN, no se documenta la degradación del rendimiento en contextos muy largos.
- **Pruebas limitadas**: el autor solo lo probó en un Apple M4 con MPS y bf16; no hay validación en GPU CUDA ni en producción.
- **Licencia**: Apache-2.0 permite uso comercial, pero las modificaciones de abliteration pueden afectar a la adecuación para determinados productos; conviene revisar las implicaciones legales del contenido no censurado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/K2-Horizon-4x0.9B-MoE-heretic
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Organización IFM en Hugging Face: https://huggingface.co/IFM
- Heretic (abliteration): https://github.com/p-e-w/heretic
- Blog de Hugging Face sobre Mixture of Experts: https://huggingface.co/blog/moe
