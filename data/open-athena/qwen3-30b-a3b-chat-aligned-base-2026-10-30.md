# open-athena/Qwen3-30B-A3B-Chat-Aligned-Base-2026.10.30

## Resumen

Qwen3-30B-A3B-Chat-Aligned-Base-2026.10.30 es un ajuste supervisado (SFT) del modelo preentrenado Qwen/Qwen3-30B-A3B-Base de Alibaba, publicado por el colectivo open-athena. No es un asistente terminado: se trata de un artefacto de investigación cuyo objetivo es dotar a la base preentrenada de un formato de chat, razonamiento (thinking) y llamadas a herramientas, sirviendo como punto de partida comparable para experimentos de post-entrenamiento. El autor lo enmarca dentro de un experimento de Marin sobre cómo la destilación on-policy (OPD) y el fine-tuning interfieren entre tareas en modelos de mezcla de expertos (MoE).

Arquitectónicamente es un transformer MoE de tipo `qwen3_moe` con 48 capas, 128 expertos enrutados (top-8) y sin experto compartido, con atención de consultas agrupadas (32 cabezas de consulta, 4 de clave-valor). Suma 30.532.122.624 parámetros totales (unos 30,5B) con aproximadamente 3B activos por token. El contexto nativo es de 32.768 posiciones, ampliable a 131.072 mediante YaRN ×4.

Su relevancia es acotada y práctica: ofrece una base con formato de chat y tool calling lista para investigación de post-entrenamiento sobre una arquitectura MoE de tamaño medio, pero el propio autor advierte que no ha superado por completo su puerta de aceptación y que no debe usarse en producción sin evaluación y sin alineamiento de preferencias ni de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3MoeForCausalLM` (`qwen3_moe`), transformer MoE: 48 capas, 128 expertos enrutados (top-8), sin experto compartido, GQA (32 cabezas de consulta, 4 de clave-valor) |
| Parametros totales | 30.532.122.624 (unos 30,5B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | 32.768 posiciones nativas; evaluado a 131.072 con YaRN ×4 |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (bf16, 3 fragmentos, 61 GB) |

## Arquitectura y entrenamiento

El modelo parte de la revisión `1b75feb7` de Qwen/Qwen3-30B-A3B-Base y aplica un SFT en tres etapas, cada una de una época sobre secuencias empaquetadas de 32.768 tokens, partiendo de los pesos de la etapa anterior con un optimizador nuevo. Todas las etapas usan AdamW (`adamw_torch_fused`, β 0,9/0,95, ε 1e-8), tasa de aprendizaje 5e-6 con decaimiento coseno y sin warmup, weight decay 0, recorte de gradiente a 1,0 y 64 secuencias por paso. Las conversaciones empaquetadas no podían atenderse entre sí y se descartaron las de más de 32.768 tokens. Se mantuvo activa la pérdida auxiliar de balanceo de carga del router (coeficiente 0,001), como en el preentrenamiento de Qwen. El entrenamiento se hizo con el fork `marin-community/axolotl` (commit `a208d550`) y `transformers` 5.12.1, FlashAttention 3, pesos maestros en fp32 y cómputo en bf16, sobre 16 H100.

Las tres etapas fueron: (1) chat, con `nyu-dice-lab/wildchat50m-rewild-sft-385700` (255 pasos); (2) thinking, con `laion/llama-nemotron-science-reasoning-on-canonical-think-full` (634 pasos); y (3) agente de terminal, con `nvidia/Nemotron-Terminal-Corpus` (680 pasos, 1,43B tokens de los que se entrenaron 0,63B). La exportación publicada es la copia en bf16 de los pesos finales en fp32 de la etapa 3. No hubo ajuste de preferencias (RLHF/DPO) ni alineamiento de seguridad. La plantilla de chat es la de Qwen3 con marcadores `{% generation %}` añadidos para el enmascaramiento de etiquetas; el razonamiento se sitúa entre `<think>` (151667) y `</think>` (151668), que son tokens de vocabulario ordinarios y permanecen en el texto devuelto. La plantilla sí renderiza el campo `tools`, pidiendo `<tool_call>\n{"name": ..., "arguments": {...}}\n</tool_call>`, y los resultados de herramienta se envuelven en `<tool_response>...</tool_response>` dentro de un turno de usuario.

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat Qwen3 (`<|im_start|>`/`<|im_end|>`).
- Modo de razonamiento (thinking) opcional: el modelo decide si pensar y emite el razonamiento entre `<think>` y `</think>`.
- Llamada a herramientas (tool calling / function calling) mediante `<tool_call>` con JSON de nombre y argumentos; compatible con el parser `hermes` de vLLM.
- Razonamiento científico y de tipo matemático, inducido por el corpus de la etapa 2.
- Tareas de agente de terminal, inducidas por Nemotron-Terminal-Corpus (con las salvedades de la sección de limitaciones).
- Capacidades multilingües: no documentadas explícitamente; dependen del corpus base de Qwen3 y de los datasets de SFT.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Investigación de post-entrenamiento en MoE: sirve como base con formato de chat para comparar recetas de OPD y fine-tuning entre arquitecturas, que es exactamente el propósito del experimento de Marin.
- Punto de partida para DPO/RLHF: al carecer de ajuste de preferencias, es adecuado para aplicar pipelines de alineamiento propios y medir su efecto sobre una base ya instruida en formato.
- Experimentos de tool calling: la plantilla renderiza `tools` y emite `<tool_call>` en JSON, lo que permite evaluar el comportamiento de llamadas a funciones en un MoE de 3B activos.
- Evaluación de razonamiento con thinking: permite estudiar la tasa de bloques `<think>` no cerrados y su impacto en pipelines de extracción de respuestas.
- Estudio de enrutamiento de expertos: útil para analizar el uso de expertos (el autor reporta más expertos casi sin uso que en la base en una capa del router) y probar regularizaciones de balanceo.
- Prototipado interno de asistentes conversacionales en entornos controlados, siempre que se añada evaluación y filtros de seguridad antes de exponerlo a usuarios.
- Generación de código y comandos de terminal como caso de prueba de robustez, dado que el modelo falla a menudo en tareas de agente de terminal y conviene medir esa tasa antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta el resultado cualitativo de la puerta de aceptación del experimento: el modelo falló dos comprobaciones (bloques `<think>` sin cerrar de forma frecuente y JSON de turno de agente malformado con repetición hasta agotar el tiempo) y se aceptó tal cual.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 61 GB solo para pesos, más caché KV y overhead; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU.
- El repositorio ocupa 61,1 GB en 3 fragmentos safetensors; la carga completa en bf16 no cabe en GPUs de consumo de 24 GB.
- GPU recomendadas: H100 (usadas en el entrenamiento con 16 unidades), A100 80GB; para cuantización a 4 bits (si se generara) el peso bajaría a unos 15-16 GB, lo que podría caber en una RTX 4090 de 24 GB, pero no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` (librería declarada), vLLM (el autor menciona compatibilidad del parser `hermes` y `endpoints_compatible` en los tags); llama.cpp/Ollama/TGI no están documentados para este modelo.
- Contexto extendido: para 131.072 posiciones se requiere YaRN ×4, lo que incrementa la memoria de caché KV de forma proporcional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Chat-Aligned-Base-2026.10.30 | 30,5B | ~3B | 32.768 (131.072 con YaRN) | openmdw-1.1 | SFT de investigación, sin evaluación publicada |
| Qwen/Qwen3-30B-A3B | 30,5B | ~3B | 32.768 (ampliable) | Apache 2.0 (según release de Qwen) | Chat oficial con alineamiento; referencia de calidad |
| Qwen/Qwen3-30B-A3B-Base | 30,5B | ~3B | 32.768 | Apache 2.0 (según release de Qwen) | Base preentrenada sin formato de chat |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de resultados de benchmarks que permitan comparar rendimiento numérico con las alternativas; la comparación se limita a parámetros, contexto, licencia y estado de alineamiento.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no ha sido probado ni evaluado adecuadamente y que puede no ser seguro; uso en producción bajo responsabilidad propia.
- Sin ajuste de preferencias ni de seguridad: no hay RLHF/DPO, por lo que puede producir contenido inapropiado o dañino sin filtros adicionales.
- Bloques `<think>` sin cerrar: con frecuencia escribe toda la respuesta dentro de un bloque de razonamiento no cerrado, lo que rompe la extracción de la respuesta final.
- Fallo en tareas de agente de terminal: el JSON de turno de agente suele estar malformado y el modelo repite la misma respuesta hasta agotar el tiempo.
- Desbalanceo de expertos: en una capa del router hay más expertos casi sin uso que en el modelo base.
- Licencia openmdw-1.1: conviene revisar sus términos antes de uso comercial; no es Apache 2.0 como el release oficial de Qwen.
- Idiomas no declarados: no hay lista oficial de idiomas soportados ni evaluación multilingüe.
- Contexto: nativo de 32.768; el uso a 131.072 requiere YaRN ×4 y solo se evaluó, no se garantiza.
- Plantilla de chat frágil: un mensaje de asistente con `tool_calls` debe llevar `content` como cadena (`""`), no `None`, o la plantilla lanza `TypeError`; además, si el bloque think no se cerró, la plantilla reenvía todo el texto `<think>…` sin cambios.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en una base sin alineamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Qwen3-30B-A3B-Chat-Aligned-Base-2026.10.30
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Modelo chat oficial de Qwen: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio Marin: https://github.com/marin-community/marin
- Fork de Axolotl usado en el entrenamiento: https://github.com/marin-community/axolotl
- Dataset de chat: https://huggingface.co/datasets/nyu-dice-lab/wildchat50m-rewild-sft-385700
- Dataset de razonamiento: https://huggingface.co/datasets/laion/llama-nemotron-science-reasoning-on-canonical-think-full
- Dataset de agente de terminal: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
