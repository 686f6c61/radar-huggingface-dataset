# micdun/if_chat_gpt_oss_20b_science_qwq_code_gpt_oss_120b_qwen2_5-1_5b_lr1e-4

## Resumen

`if_chat_gpt_oss_20b_science_qwq_code_gpt_oss_120b_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo se entrena sobre datos sinteticos generados por modelos "profesor" (denominados "parent models" en el identificador del run) que cubren tres dominios: seguimiento de instrucciones y chat, ciencia y codigo. El resultado es un modelo de 1.543.714.304 parametros (1,5B) orientado a generacion de texto conversacional.

El problema que aborda es el de la destilacion de conocimiento desde modelos de mayor tamano hacia uno pequeno y desplegable en hardware modesto. El identificador del run sugiere que los datos sinteticos provienen de GPT-OSS 20B (para chat e instrucciones), QwQ (para ciencia) y GPT-OSS 120B (para codigo), aunque la model card no detalla la composicion exacta ni el volumen de datos. Es relevante como ejemplo de pipeline de sintesis de datos multi-dominio con TRL, pero su utilidad practica es limitada por la ausencia de benchmarks, licencia e idiomas declarados.

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, sin innovaciones arquitectonicas adicionales. El ajuste es un fine-tune completo (full fine-tune) de 3 epocas con learning rate 1e-4 y batch global de 64. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), denso |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2. El fine-tune es completo (todos los parametros actualizados), no un adaptador LoRA ni un ajuste congelado. Se ejecutan 3 epocas con learning rate 1e-4 y batch global de 64, segun la model card.

Los datos de entrenamiento son sinteticos y se generan a partir de tres modelos profesor, segun el identificador del run: GPT-OSS 20B para el dominio de instrucciones/chat, QwQ para el dominio de ciencia y GPT-OSS 120B para el dominio de codigo. La model card no especifica el numero de tokens, la mezcla exacta por dominio, ni si hubo filtrado, deduplicacion o RLHF posterior. La libreria de entrenamiento es TRL (tag `trl`) sobre transformers, con tags `sft` y `synthetic-data`. No se documentan innovaciones tecnicas adicionales mas alla del propio pipeline de destilacion multi-dominio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct y reforzada con datos sinteticos de chat.
- Seguimiento de instrucciones (instruction following) en el dominio de chat, segun el entrenamiento declarado.
- Razonamiento cientifico basico, a partir de datos sinteticos generados por QwQ.
- Generacion de codigo, a partir de datos sinteticos generados por GPT-OSS 120B.
- Soporte de tool calling / function calling: no confirmado en la model card (Qwen2.5-1.5B-Instruct lo soporta, pero el fine-tune no lo documenta).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas no estan declarados.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un modelo de 1,5B, se puede desplegar en una unica GPU consumer para iterar sobre prompts y flujos de dialogo antes de escalar a un modelo mayor.
- Generacion de codigo en entornos con recursos limitados: el ajuste con datos de GPT-OSS 120B puede servir para autocompletado o generacion de snippets en herramientas de desarrollo locales, aunque sin garantias de calidad medidas por benchmarks.
- Asistencia en tareas cientificas basicas: resumen de articulos, explicacion de conceptos o generacion de respuestas tecnicas en un dominio acotado, aprovechando los datos sinteticos de QwQ.
- Destilacion y experimentacion academica: sirve como caso de estudio de pipelines de sintesis de datos multi-dominio con TRL y como punto de partida para reproducir o variar la receta de entrenamiento.
- Clasificacion y extraccion de informacion ligera: con prompts adecuados, puede usarse para tareas de etiquetado o extraccion en lotes, donde el coste por token es critico.
- Educacion y demos interactivas: despliegue en notebooks o entornos de bajo consumo (por ejemplo, con cuantizacion GGUF) para demostraciones de chat con contexto moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 4-6 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,8-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) para FP16; GPUs de datacenter (A100, H100) solo si se necesita alto throughput por lotes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas en FP16 y en tarjetas con 4 GB o mas en cuantizacion 4 bits.
- Opciones de despliegue: transformers (soporte nativo, segun la model card), text-generation-inference (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama/vLLM tras conversion a GGUF o formatos compatibles (no documentado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (micdun SFT de Qwen2.5-1.5B) | 1,5B | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en esta ficha | Apache 2.0 (segun el modelo base, no confirmado aqui) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Apache 2.0 (segun el modelo base) | Hugging Face |
| Llama 3.2 1B Instruct | 1,2B | no disponible en esta ficha | Llama 3.2 Community License | Hugging Face, Meta |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-1.5B-Instruct y de datos sinteticos de modelos profesor, puede heredar sesgos de ambos, sin evaluacion publicada.
- Riesgo de alucinacion: alto en un modelo de 1,5B sin benchmarks de fidelidad; los datos sinteticos pueden amplificar errores factuales de los modelos profesor.
- Limitaciones de contexto o idioma: la longitud de contexto no esta confirmada en la model card y los idiomas soportados no estan declarados.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no se puede asumir uso comercial sin verificacion previa.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes, sin evaluacion independiente; no se recomienda para produccion sin una evaluacion propia de calidad, sesgos y seguridad.
- El identificador del run sugiere el uso de modelos profesor GPT-OSS y QwQ, pero la model card no detalla la composicion ni el volumen de datos, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/micdun/if_chat_gpt_oss_20b_science_qwq_code_gpt_oss_120b_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria TRL: https://github.com/huggingface/trl
- Libreria transformers: https://github.com/huggingface/transformers
