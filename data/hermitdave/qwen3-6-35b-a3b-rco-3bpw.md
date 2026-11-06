# hermitdave/Qwen3.6-35B-A3B-RCO-3bpw

## Resumen

Qwen3.6-35B-A3B-RCO-3bpw es una cuantización de precisión mixta del modelo Qwen3.6-35B-A3B de Qwen Team, realizada por el usuario hermitdave mediante el método RCO (Reconstruction-error-driven mixed-precision quantization). El objetivo es reducir el peso del modelo original en BF16 (67 GB) hasta unos 19 GB para que pueda ejecutarse en Apple Silicon a través de MLX, manteniendo la mayor fidelidad posible respecto al modelo completo. El resultado es un checkpoint de aproximadamente 3 bits por peso objetivo que, por la sobrecarga de escalas, alcanza 5,92 bpw efectivos.

El modelo base Qwen3.6-35B-A3B es un transformer causal con encoder de visión, arquitectura MoE con 35B parámetros totales y 3B activos, 40 capas y una disposición híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention. Incorpora 256 expertos con 8 enrutados más 1 compartido activados por token, y soporta un contexto nativo de 262.144 tokens extensible hasta 1.010.000. Está orientado a cargas de trabajo de código agéntico y razonamiento de repositorio.

Esta ficha describe principalmente la variante cuantizada MLX, que es la publicada en el repositorio, e incluye los datos del modelo base cuando están disponibles. La relevancia actual radica en la posibilidad de ejecutar un MoE de 35B en hardware de consumo Apple con una degradación medida y acotada respecto a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Gated Attention, con MoE y encoder de visión |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | Cuantización mixta RCO a ~3 bpw objetivo; 5,92 bpw efectivos; group size 64; modo affine; 674 tensores cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (repo de 19,9 GB; 19 GB en disco) |
| Hidden dimension | 2048 |
| Numero de capas | 40 (layout: 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE))) |
| Expertos | 256 totales; 8 enrutados + 1 compartido activados; dimensión intermedia 512 |
| Cabezas de atención | Gated Attention: 16 Q / 2 KV, dim 256; Gated DeltaNet: 32 V / 16 QK, dim 128 |
| Token embedding | 248.320 (padded) |
| MTP | Entrenado con multi-steps |

## Arquitectura y entrenamiento

El modelo base combina dos mecanismos de atención en un patrón repetido: por cada bloque de cuatro subcapas, tres usan Gated DeltaNet (atención lineal con 32 cabezas para V y 16 para QK, dimensión 128) y una usa Gated Attention clásica (16 cabezas Q, 2 KV, dimensión 256, RoPE de 64 dimensiones). Cada subcapa de atención va seguida de una capa MoE con 256 expertos, de los que se activan 8 enrutados más 1 compartido, con dimensión intermedia de 512. El modelo incluye además un encoder de visión, lo que lo convierte en un modelo multimodal de entrada de imagen.

El entrenamiento del modelo base comprende fases de pre-entrenamiento y post-entrenamiento, e incluye entrenamiento con multi-step MTP (multi-token prediction). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. La variante cuantizada se generó con el método RCO: medición del error de reconstrucción por capa, asignación de bits mediante programación dinámica y cuantización posterior, con group size 64 y modo affine. La cuantización fue realizada por Hermes Agent (Nous Research) según la atribución de la model card.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Codificación agéntica: flujos de frontend y razonamiento a nivel de repositorio, con mejoras declaradas en fluidez y precisión.
- Preservación de pensamiento (thinking preservation): opción para retener contexto de razonamiento de mensajes históricos y reducir sobrecarga en desarrollo iterativo.
- Procesamiento de visión mediante encoder integrado en el modelo base.
- Soporte de contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000.
- Capacidades multilingües: el modelo base reporta resultados en SWE-bench Multilingual, aunque la lista concreta de idiomas no está disponible.
- Multi-token prediction (MTP) entrenado con multi-steps en el modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Desarrollo asistido en local sobre Apple Silicon: el checkpoint MLX de 19 GB permite ejecutar un MoE de 35B en un Mac con memoria unificada suficiente, sin depender de GPUs dedicadas, para tareas de generación de código y razonamiento.
- Refactorización a nivel de repositorio: gracias al contexto nativo de 262.144 tokens, el modelo puede ingerir múltiples ficheros y trazas de error en una sola ventana para proponer cambios coherentes entre módulos.
- Agente de codificación iterativo: la opción de preservación de pensamiento del modelo base reduce la repetición de razonamiento entre turnos, lo que resulta adecuado para bucles de corrección continua sobre un mismo repositorio.
- Análisis de documentación técnica con imágenes: el encoder de visión del modelo base permite procesar diagramas de arquitectura o capturas de pantalla junto con texto para generar explicaciones o código asociado.
- Prototipado de asistentes conversacionales de contexto largo: la ventana extensible hasta 1.010.000 tokens permite mantener historiales extensos o corpus documentales completos en memoria de contexto.
- Evaluación de técnicas de cuantización: el checkpoint sirve como referencia práctica para comparar RCO frente a otras estrategias (por ejemplo, AD ladder) en términos de PPL, KL y acuerdo top-1 sobre hardware Apple.
- Despliegue de bajo consumo en estaciones de trabajo Mac: al reducir el peso a 19 GB, es viable mantener el modelo cargado de forma persistente en equipos con 32 GB o 64 GB de memoria unificada para tareas de generación interactiva.

## Benchmarks y rendimiento

Resultados de la cuantización publicados en la model card (modelo base Qwen3.6-35B-A3B, objetivo 3,0 bpw):

| Modelo | PPL | KL | top-1 |
|---|---|---|---|
| BF16 | 11,71 | — | — |
| RCO (per-block) | 13,36 | 0,172 | 81,5% |
| AD ladder | 13,22 | 0,207 | 78,9% |

Según la model card, RCO obtiene mejor KL y mejor acuerdo top-1 que AD ladder, con una PPL ligeramente superior.

Resultados del modelo base Qwen3.6-35B-A3B frente a alternativas (según la model card del modelo base):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El resto de filas de la tabla de benchmarks del modelo base no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 19,9 GB y el checkpoint en disco 19 GB; se requiere memoria unificada suficiente para cargar los pesos más el overhead de inferencia (aproximadamente 20-24 GB como mínimo práctico).
- Hardware objetivo: Apple Silicon con MLX; no está pensado para GPUs NVIDIA/AMD en este formato.
- Cabe en equipos Apple con 32 GB de memoria unificada en adelante; con 64 GB o más se dispone de margen para contexto largo y caché KV.
- Despliegue: `mlx_lm` (carga mediante `mlx_lm.load` y generación con `mlx_lm.generate`). El modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers, pero esta variante cuantizada está en formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-RCO-3bpw | 35B | 3B | 262.144 (ext. 1.010.000) | Apache 2.0 | MLX (~3 bpw) | Cuantización RCO para Apple Silicon; 19 GB |
| Qwen3.6-35B-A3B (BF16) | 35B | 3B | 262.144 (ext. 1.010.000) | Apache 2.0 | Transformers | Modelo base sin cuantizar; 67 GB; PPL 11,71 |
| Qwen3.5-35B-A3B | 35B | 3B | no disponible | no disponible | no disponible | Generación anterior; SWE-bench Verified 70,0 |
| Gemma4-31B | 31B | no disponible | no disponible | no disponible | no disponible | SWE-bench Verified 52,0 |

## Limitaciones y advertencias

- La cuantización introduce degradación medible: PPL sube de 11,71 (BF16) a 13,36 (RCO), con KL 0,172 y acuerdo top-1 del 81,5 %.
- El bpw efectivo (5,92) es muy superior al objetivo de 3,0 debido a la sobrecarga de escalas; el ahorro real de tamaño es de 3,5× respecto a BF16, no de 5×.
- El checkpoint está en formato MLX y solo es utilizable en el ecosistema MLX/Apple Silicon; no es directamente compatible con vLLM, SGLang o Transformers sin reconversión.
- La lista de idiomas soportados no está disponible; no se debe asumir cobertura multilingüe completa sin verificación.
- No se han publicado datos sobre sesgos, tasas de alucinación ni comportamiento en dominios sensibles para esta variante cuantizada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y citar la atribución indicada (Qwen Team como autor del modelo base, Hermes Agent/Nous Research como cuantizador).
- El contexto extensible hasta 1.010.000 tokens no está verificado para esta variante cuantizada; el uso de ventanas muy largas incrementa la memoria de la caché KV y puede degradar la calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-RCO-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Librería MLX LM: https://github.com/ml-explore/mlx-lm
