# halonc/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4-abliterated

## Resumen

Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4-abliterated es una cuantización experimental de 3 bits (formato W3A4 con rotaciones, "W3Rot") del modelo Qwen3.8-27B en su variante abliterated de huihui-ai, creada por el usuario halonc. No se trata de un modelo completo, sino de un **overlay** para el formato Paiton `paiton-w3rot-v1`: contiene únicamente las proyecciones de atención, GDN y MLP (64 shards, 1.296 tensores), mientras que el resto de componentes (embeddings, lm_head, normas, A_log, conv1d y dt_bias) se toman de la base NVFP4 de unsloth.

El objetivo del proyecto es demostrar que una cuantización INT3 de pesos con activaciones de 4 bits, calibrada con GPTQ, puede mantener una calidad cercana a la cuantización oficial W3A4 con un tamaño de repositorio muy reducido (9,6 GB), orientado a hardware RDNA4 (GPU AMD Radeon). Los resultados publicados por el autor muestran diferencias mínimas en MMLU-Pro y una degradación moderada en GSM8K y HumanEval respecto a la versión oficial.

Es relevante para desarrolladores que ejecutan modelos de 27B en GPUs de 32 GB con arquitectura AMD, ya que reduce el footprint de memoria manteniendo un contexto de 262K tokens y un throughput razonable. La licencia es Apache-2.0, heredada de los checkpoints upstream, aunque el autor recomienda uso exclusivamente de investigación y personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y bloques GDN (detalles completos no disponibles) |
| Parametros totales | 27B (heredado del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262K tokens (perfil probado por el autor) |
| Tipos de cuantizacion | INT3 pesos / 4 bits activaciones (W3A4, formato Paiton `paiton-w3rot-v1`), overlay sobre base NVFP4 |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Overlay Paiton (safetensors en shards; 64 shards, 1.296 tensores) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B (variante abliterated de huihui-ai, derivada a su vez de la cuantización NVFP4 de unsloth). La presencia de componentes como `A_log`, `conv1d` y `dt_bias` junto a proyecciones de atención y MLP indica una arquitectura híbrida que combina capas de atención estándar con bloques tipo GDN (Gated DeltaNet), aunque la model card no detalla la composición exacta de capas.

Este artefacto no es un reentrenamiento: es una cuantización post-entrenamiento. Las proyecciones de atención, GDN y MLP se cuantizan a 3 bits mediante GPTQ con Hessiano block-diagonal, calibrado con 65.536 tokens. La abliteración se hereda del checkpoint de huihui-ai, que elimina la dirección de rechazo (refusal direction) del modelo original. No hay información sobre RLHF, DPO ni composición del dataset de entrenamiento en la documentación disponible.

## Capacidades

- Generacion de texto general en inglés y chino, heredada del modelo base Qwen3.8-27B.
- Razonamiento matematico: 93,10% en GSM8K 5-shot según las mediciones del autor.
- Generacion y comprension de codigo: 90,24% pass@1 en HumanEval.
- Contexto largo: recupera 160/160 agujas en la prueba Needle a 61.440 tokens, con perfil de 262K tokens.
- Modo thinking desactivado en las mediciones publicadas; el soporte de thinking depende del runtime y del modelo base (no disponible en detalle).
- Sin informacion sobre tool calling, function calling ni capacidades agenticas en la documentacion disponible.
- Sin capacidades de vision ni audio conocidas.
- Abliterado: sin rechazos por políticas de seguridad; el autor advierte que la responsabilidad de las salidas es del usuario.

## Casos de uso

- Inferencia local en GPU AMD RDNA4: el overlay está diseñado específicamente para ejecutarse con el runtime Paiton en tarjetas como la Radeon AI PRO R9700 de 32 GB, aprovechando cuantización W3A4 nativa.
- Procesamiento de documentos extensos: con ventana de 262K tokens y recuperación perfecta en pruebas de aguja a 61K tokens, es adecuado para resumen y consulta de contratos, informes o bases de código largas.
- Investigacion en cuantizacion extrema: sirve como referencia reproducible para comparar GPTQ INT3 con rotaciones frente a cuantizaciones oficiales W3A4 y NVFP4, con scripts y notas publicados en GitHub.
- Asistente sin filtros para uso personal o de investigacion: al estar abliterado, responde sin los rechazos del modelo original, lo que interesa en entornos de red teaming y estudio de alineamiento (con las responsabilidades legales que ello implica).
- Chat multi-turno bilingüe: soporte de inglés y chino para aplicaciones de conversación en ambos idiomas.
- Servicios de inferencia con concurrencia moderada: el autor mide 436,8 tok/s agregados con 8 flujos concurrentes en una sola tarjeta de 32 GB, suficiente para equipos pequeños o prototipos multiusuario.
- Experimentacion con pipelines vLLM mediante plugin: el proyecto se distribuye como plugin de vLLM (paiton-vllm-plugin), integrable en despliegues existentes.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una Radeon AI PRO R9700 (32 GB), perfil de contexto 262K, thinking desactivado, comparados con la cuantización W3A4 oficial:

| Benchmark | Este overlay | W3A4 oficial |
|---|---:|---:|
| MMLU-Pro (14x200 aleatorio, 0-shot) | 57,86% | 57,82% |
| GSM8K 5-shot (1.319 casos) | 93,10% | 95,30% |
| HumanEval pass@1 (164 casos) | 90,24% | 93,90% |
| Needle @ 61.440 tokens (160 agujas) | 160/160 | 100 |

Throughput (BetterBench 0.6.1, 20 pasadas, ponderado):

| Escenario | Este overlay | W3A4 oficial |
|---|---:|---:|
| Decodificacion single-stream | 155,0 tok/s | 174,3 tok/s |
| Concurrencia 8 flujos | 436,8 tok/s | 458,9 tok/s |

El autor atribuye la diferencia de velocidad al host (invitado virtualizado sobre un Xeon antiguo) y no a los pesos: la versión oficial medida en el mismo contenedor rinde a la misma velocidad.

## Requisitos de hardware

- VRAM: el tamaño del repo es de 9,6 GB (solo overlay); sumando la base NVFP4 y el contexto de 262K, el perfil probado cabe en 32 GB de VRAM (Radeon AI PRO R9700). Estimaciones exactas de VRAM total no disponibles.
- GPU de referencia: Radeon AI PRO R9700 (32 GB, RDNA4). El tag "rdna4" indica que el formato está orientado a esta generación de GPUs AMD.
- Consumer GPUs: no hay mediciones publicadas; en principio, una GPU de 24 GB podría ser insuficiente con contexto de 262K, pero no hay datos que lo confirmen (no disponible).
- Despliegue: runtime Paiton como plugin de vLLM. El procedimiento documentado consiste en montar el overlay en `/models/w3rot-abl-gptq`, la base NVFP4 en `/models/target` y definir `PAITON_W3_A4_DIR=/models/w3rot-abl-gptq` en el contenedor Paiton; el runtime fusiona overlay y base automáticamente.
- Compatibilidad con llama.cpp, Ollama o TGI: no disponible (el formato Paiton W3Rot no es GGUF estándar).
- Latencia: 155 tok/s en decodificación de flujo único según las mediciones del autor; latencia de primer token no disponible.

## Comparativa con modelos similares

| Modelo | Tamano | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-W3Rot-INT3 (este) | 27B | W3A4 INT3 (overlay Paiton) | 262K | Apache-2.0 | Overlay + base NVFP4 requerida |
| unsloth/Qwen3.8-27B-NVFP4 (base) | 27B | NVFP4 (4 bits) | 262K | Apache-2.0 | Modelo completo en HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | Pesos originales | 262K | Apache-2.0 | Checkpoint completo en HuggingFace |
| W3A4 oficial de Qwen3.8-27B | 27B | W3A4 INT3 | 262K | no disponible | Pesos oficiales (referencia de rendimiento) |

En calidad, el overlay iguala a la versión oficial W3A4 en MMLU-Pro y pierde 2,2 y 3,7 puntos en GSM8K y HumanEval respectivamente, con un repositorio de solo 9,6 GB al reutilizar la base NVFP4. Frente a la variante NVFP4 de 4 bits, ofrece menor footprint a costa de una ligera degradación en codigo y matematicas.

## Limitaciones y advertencias

- Es un overlay, no un modelo autónomo: requiere obligatoriamente la base unsloth/Qwen3.8-27B-NVFP4 (revision `f0b7c9e`) y el runtime Paiton; no funciona en llama.cpp, Ollama ni herramientas que no soporten el formato.
- Abliterado: se ha eliminado la dirección de rechazo, no la política de uso; puede generar contenido que el modelo original rechazaría. El autor declara explícitamente que las salidas son responsabilidad del usuario.
- Degradación medible frente a la cuantización oficial: -2,2 puntos en GSM8K y -3,7 en HumanEval, relevante en cargas de codigo y razonamiento numerico exigentes.
- Cuantización agresiva (3 bits de pesos, 4 bits de activaciones): puede aumentar la tasa de alucinación y errores factuales respecto a pesos de mayor precisión; no hay evaluaciones de alucinación publicadas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado (no disponible).
- Rendimiento dependiente del host: las mediciones se realizaron en un sistema virtualizado sobre un Xeon antiguo; en otros entornos los tok/s pueden variar.
- El autor recomienda uso exclusivamente de investigacion y personal; aunque la licencia Apache-2.0 permite uso comercial, no hay validación para producción.
- Repositorio con 0 descargas en el momento de redactar la ficha: proyecto muy nicho, sin comunidad de soporte ni auditoría externa de los resultados publicados.

## Enlaces

- Modelo (overlay): https://huggingface.co/halonc/Qwen3.8-27B-W3Rot-INT3-Paiton-RDNA4-abliterated
- Checkpoint base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Base NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Scripts y notas de construccion (GitHub): https://github.com/halonc/paiton-vllm-plugin-27b-w3a4-abliterated
