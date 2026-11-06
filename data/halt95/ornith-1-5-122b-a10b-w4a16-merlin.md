# halt95/Ornith-1.5-122B-A10B-W4A16-Merlin

## Resumen

Ornith-1.5-122B-A10B-W4A16-Merlin es una cuantizacion de 4 bits del modelo Ornith 1.5 122B, un fine-tune de ornith-ai sobre Qwen3.5-122B-A10B de Qwen. Se trata de un modelo de mezcla de expertos (MoE) de 122B parametros totales con 10B activos por token, equipado con torre de vision y una ventana de contexto de 262.144 tokens. El checkpoint reduce el peso original de 233 GiB a aproximadamente 66 GiB, permitiendo servir el modelo a contexto completo en cuatro GPU de 24 GB.

La publicacion corre a cargo de halt95, que distribuye el checkpoint junto con el motor de inferencia Merlin, un fork de vLLM 0.33.0 optimizado para arquitecturas Ampere y Ada (sm_86 y sm_89). El modelo emplea decodificacion especulativa mediante la cabeza MTP propia del modelo base y mantiene toda la cache KV en VRAM en formato FP8 E4M3, con escalas estaticas calibradas.

Su relevancia practica radica en que hace viable un modelo de 122B con vision y contexto largo en hardware de consumo profesional (RTX 3090, RTX A5000), algo que el checkpoint original en BF16 no permite. La licencia declarada es MIT, aunque el modelo base Qwen subyacente es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer hibrido con Gated DeltaNet y atencion completa (qwen3_5_moe) |
| Parametros totales | 128.257.390.832 (≈128B; el autor lo denomina 122B) |
| Parametros activos | 10B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16: expertos enrutados INT4 g128 simetrico; proyecciones Gated DeltaNet INT8 por canal; atencion, expertos compartidos, routers, normas, embeddings, lm_head, capas no-expertas MTP y torre de vision en BF16; cache KV en FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Qwen subyacente Apache-2.0) |
| Formato de pesos | safetensors (compressed-tensors), servido con vLLM/Merlin |

## Arquitectura y entrenamiento

El modelo base es un MoE con 48 capas, 256 expertos enrutados por capa y 10B parametros activos por token, combinando 12 capas de atencion completa con capas Gated DeltaNet (atencion lineal con estado recurrente). Incluye una cabeza MTP (multi-token prediction) que se reutiliza como borrador para decodificacion especulativa, y una torre de vision que procesa entradas de imagen y video.

Esta version concreta no reentrena el modelo: aplica cuantizacion post-entrenamiento. Los expertos enrutados se cuantizan a INT4 con granularidad de grupo 128 y redondeo simetrico round-to-nearest; las proyecciones QKV/Z y de salida de Gated DeltaNet pasan a INT8 por canal; el resto de componentes permanece en BF16 sin modificar. La cache KV se cuantiza a FP8 E4M3 con escalas estaticas calibradas sobre las 12 capas de atencion y la capa MTP, almacenadas en `kv_scales.safetensors`. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking (la plantilla de chat de Ornith no expone niveles de esfuerzo configurables).
- Procesamiento de imagen y video (pipeline image-text-to-text, torre de vision en BF16).
- Decodificacion especulativa nativa mediante la cabeza MTP del modelo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: el autor documenta cargas de ocho agentes concurrentes con conversaciones de 16K tokens.
- Cache KV en FP8 con escalas calibradas, lo que permite mantener un pool de 894.618 tokens en VRAM.

## Casos de uso

- Analisis de documentos largos: con 262.144 tokens de contexto se pueden procesar informes completos, expedientes o bases de codigo en una sola pasada sin fragmentacion, manteniendo la cache KV en VRAM gracias al formato FP8.
- Despliegue multi-agente en hardware de consumo: el autor mide ocho conversaciones de 16K tokens con seguimientos simultaneos de 512 tokens a 486 tok/s agregados en cuatro RTX 3090, lo que permite servir varios agentes en paralelo en un solo nodo.
- Procesamiento de imagen y texto combinados: la torre de vision en BF16 permite tareas de image-text-to-text como descripcion de documentos escaneados, extraccion de datos de capturas o analisis de video, integradas en el mismo pipeline que el texto.
- Recuperacion aumentada con needles largos: el autor verifica tres prompts de tipo needle de aproximadamente 262K tokens enviados simultaneamente, con recuperacion correcta de cada needle, lo que respalda casos de RAG sobre corpus extensos.
- Prefill de prompts masivos: con 4.068 tok/s de prefill medidos en un prompt de 101.845 tokens, es adecuado para ingesta de contexto largo en pipelines por lotes.
- Inferencia de baja latencia en contexto extremo: 111 tok/s de decodificacion a 262K tokens de contexto permiten asistentes conversacionales que mantienen historiales muy largos sin degradar el throughput.
- Sustitucion de despliegues BF16 en infraestructura limitada: reduce de 233 GiB a 66 GiB, lo que permite alojar el modelo en cuatro GPU de 24 GB en lugar de requerir nodos de 80 GB.

## Benchmarks y rendimiento

Datos de rendimiento medidos por el autor con Merlin 3.0.2 (vLLM 0.33.0) en 4x RTX 3090 sin NVLink a 220W, P2P activado, segun la bench card del 2026-11-04:

| Metrica | Valor | Condiciones |
|---|---|---|
| Pool de cache KV en VRAM | 894.618 tokens | FP8, todo en VRAM |
| Throughput agregado multi-agente | 486 tok/s | 8 agentes, 3.0.1 |
| Decodificacion a contexto maximo | 111 tok/s | 261.888 tokens de prompt + 128 de salida, thinking activo |
| Prefill | 4.068 tok/s | Prompt frio de 101.845 tokens |
| Recuperacion de needles | 3 de 3 correctos | Tres prompts de ~262K simultaneos, 3.0.0 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 66 GiB de pesos, distribuidos en cuatro GPU de 24 GB; la cache KV FP8 ocupa el resto de la VRAM disponible (pool medido de 894.618 tokens en la configuracion de referencia).
- GPU con perfiles disponibles: RTX 3090 (sm_86). El autor indica que los mismos perfiles deberian servir para RTX 3090 Ti, RTX A5000 y otras configuraciones de cuatro tarjetas sm_86 de 24 GB, aunque sin probar.
- No hay perfiles para otras GPU en este checkpoint; no cabe en una unica GPU de consumo.
- Despliegue: motor Merlin 3.0.2 (fork de vLLM 0.33.0) con soporte de P2P y desbloqueo de GPU; el checkpoint usa formato compressed-tensors y requiere este stack, no se indica compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: 111 tok/s de decodificacion a 262K de contexto y 4.068 tok/s de prefill en prompt de 100K, medidos en la configuracion de cuatro RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-122B-A10B-W4A16-Merlin | ≈128B | 10B | 262.144 | MIT | Hugging Face, requiere Merlin/vLLM |
| ornith-ai/Ornith-1.5-122B (base BF16) | ≈128B | 10B | 262.144 | MIT | Hugging Face, 233 GiB |
| Qwen/Qwen3.5-122B-A10B (modelo origen) | ≈122B | 10B | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion INT4 de los expertos enrutados y INT8 de las proyecciones DeltaNet introduce perdida de precision respecto al checkpoint BF16; no se han publicado evaluaciones de calidad que cuantifiquen esa degradacion.
- El checkpoint solo tiene perfiles probados para cuatro RTX 3090; otros modelos de GPU no estan validados y pueden no funcionar.
- Depende del motor Merlin, un fork de vLLM mantenido por el autor; no se garantiza compatibilidad con vLLM upstream ni con otros runners.
- La licencia declarada es MIT, pero el modelo base Qwen es Apache-2.0 y el repositorio incluye ambas licencias y un NOTICE con los cambios; conviene revisar las obligaciones de atribucion antes de uso comercial.
- No hay informacion sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran escala; no se han publicado evaluaciones especificas en la informacion disponible.
- El modo thinking no permite ajustar niveles de esfuerzo, lo que puede incrementar la latencia en produccion.
- El rendimiento medido corresponde a configuraciones concretas (220W, P2P, desbloqueo de GPU); en otros entornos las cifras pueden diferir.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/halt95/Ornith-1.5-122B-A10B-W4A16-Merlin
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Modelo origen Qwen: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Motor Merlin: https://github.com/halt95/merlin-engine
- Bench card: https://github.com/halt95/merlin-engine/blob/main/models/ornith1.5/benchmarks/2026-11-04/BENCH-CARD.md
- Discord del autor: https://discord.gg/jVDYAwdGzt
- Ko-fi del autor: https://ko-fi.com/halt95
