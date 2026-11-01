# ArchiveStudio/MiniCPM5-1B-Base

## Resumen

MiniCPM5-1B-Base es el checkpoint base (solo preentrenamiento) de la serie MiniCPM5, desarrollada por OpenBMB y distribuida en esta variante a traves de ArchiveStudio en HuggingFace. Se trata de un modelo de lenguaje causal denso de aproximadamente 1.080 millones de parametros, construido sobre una arquitectura estandar `LlamaForCausalLM`, disenado para despliegue en dispositivo (on-device), ejecucion local y escenarios con recursos limitados.

El problema que resuelve es el de ofrecer capacidad de razonamiento, uso de herramientas y contexto largo en un modelo compacto que cabe en hardware de consumo. La serie MiniCPM5 destaca por incorporar razonamiento hibrido (modo thinking / no-thinking en el mismo checkpoint, activable mediante `enable_thinking` en la plantilla de chat) y soporte de tool calling. La familia se completa con las variantes MiniCPM5-1B (postentrenada con RL y OPD), MiniCPM5-1B-SFT, MiniCPM5-1B-GGUF y MiniCPM5-1B-MLX.

Cabe senalar que esta ficha corresponde al checkpoint **Base**: el modelo ha recibido unicamente preentrenamiento y no ha pasado por SFT ni RL, por lo que no esta alineado para conversacion ni para seguir instrucciones. Es relevante para desarrolladores que quieran realizar fine-tuning propio o investigacion sobre modelos compactos, no para uso directo como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | no disponible para este checkpoint; la familia ofrece GGUF y MLX 4-bit en variantes separadas |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), tamano del repositorio: 2,2 GB |

Datos adicionales: 24 capas, 16 cabezas de atencion para Q y 2 para KV (GQA), 679.552.512 parametros sin contar embeddings.

## Arquitectura y entrenamiento

MiniCPM5-1B-Base emplea una arquitectura Transformer decoder-only densa estandar compatible con `LlamaForCausalLM`, lo que facilita su integracion con el ecosistema de herramientas existente (transformers, vLLM, llama.cpp). Usa GQA (Grouped Query Attention) con 16 cabezas de consulta y 2 de clave-valor, una eleccion que reduce el tamano de la cache KV y hace viable el contexto de 128K tokens en hardware modesto. No es un modelo MoE ni hibrido SSM: todos los parametros estan activos en cada pasada.

El entrenamiento sigue la practica de gestion de datos por niveles UltraData y cubre tres etapas: entrenamiento base (con fases stable y decay), mid-training para adaptarse a la distribucion objetivo, y postentrenamiento. Los corpus publicados junto al modelo incluyen Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. El postentrenamiento de la familia (no aplicado a este checkpoint Base) consta de SFT con 200B tokens de deep-thinking SFT y 200B tokens de hybrid-thinking SFT, seguido de entrenamiento por refuerzo con profesores especializados en matematicas, codigo, QA y escritura, y destilacion on-policy (OPD) hacia el modelo final. El numero exacto de tokens del preentrenamiento de este checkpoint no esta disponible en la documentacion consultada.

## Capacidades

Como checkpoint Base, sus capacidades son las inherentes al preentrenamiento; las capacidades de chat, thinking y tool calling corresponden a las variantes postentrenadas de la familia:

- Modelado de lenguaje causal y generacion de texto continuo (completado de texto) en ingles y chino.
- Base apta para fine-tuning supervisado (SFT), LoRA/QLoRA y entrenamiento por refuerzo propio.
- Contexto nativo largo de 131.072 tokens gracias a GQA, util para entrenar variantes de contexto extendido.
- La familia MiniCPM5-1B completa (no este checkpoint) incorpora: razonamiento hibrido con plantilla `<think>` conmutable, tool calling, generacion de codigo y razonamiento matematico.
- Compatibilidad con el ecosistema Llama: cargable con transformers y desplegable con los backends habituales.

## Casos de uso

- Fine-tuning de dominio propio: al ser un checkpoint base sin alinear, es el punto de partida ideal para entrenar un modelo compacto especializado (legal, medico, tecnico) con SFT o LoRA sobre un corpus propio.
- Investigacion en destilacion y RL: permite reproducir o estudiar recetas tipo OPD (On-Policy Distillation) descritas en los papers de OpenBMB sobre un modelo pequeno y barato de entrenar.
- Asistentes locales en dispositivos de bajos recursos: la familia esta disenada para on-device; partiendo de este base se puede construir un asistente que quepa en portatiles sin GPU dedicada.
- Agentes de codificacion compactos: las variantes postentrenadas destacan en tool use y generacion de codigo dentro de su clase de tamano; el checkpoint base sirve para entrenar un agente de codigo a medida.
- Procesamiento de documentos largos: la ventana nativa de 128K tokens permite entrenar variantes para resumen o analisis de documentos extensos sin tecnicas de contexto externas.
- Mascotas de escritorio y aplicaciones interactivas locales: el proyecto oficial MiniCPM Desk Pet demuestra el uso de la familia como motor de LLM local en aplicaciones interactivas de escritorio.
- Experimentacion multilingue en-zh: util como base para entrenar modelos bilingues ingles-chino compactos con los corpus Ultra-FineWeb publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (la model card incluye una imagen de leaderboard comparando con LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, pero sin cifras extraibles en texto; se afirma SOTA open-source de clase 1B en ese conjunto de comparacion, con ventaja destacada en tool use, codigo y razonamiento dificil).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en BF16 para el modelo en si; con contexto de 128K tokens la cache KV (reducida por GQA) anade requisitos adicionales dependientes de la longitud real utilizada.
- GPUs recomendadas: no requiere GPU dedicada para el modelo base; cabe con holgura en una RTX 4090 (24 GB), RTX 3060 (12 GB) e incluso GPUs de 6-8 GB. No es necesario A100 ni H100.
- Consumer GPUs: si, es uno de los puntos fuertes del modelo; en CPU moderna tambien es viable, especialmente via GGUF de la variante MiniCPM5-1B-GGUF.
- Despliegue: transformers (formato nativo de este repo), vLLM, TGI, llama.cpp, Ollama y LM Studio (via la variante GGUF oficial), y MLX 4-bit en Apple Silicon (variante MiniCPM5-1B-MLX).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-1B-Base | 1,08B (denso) | 128K | Apache 2.0 | Checkpoint base, sin alinear; ideal para fine-tuning |
| Qwen3-0.6B | 0,6B (denso) | no disponible en la informacion consultada | Apache 2.0 | Baseline comparado por OpenBMB; variantes con thinking |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible en la informacion consultada | no disponible | Baseline comparado por OpenBMB, enfocado a razonamiento |
| MiniCPM5-1B (chat) | 1,08B (denso) | 128K | Apache 2.0 | Misma familia, postentrenado con SFT + RL + OPD; recomendado para uso directo |

## Limitaciones y advertencias

- Este checkpoint es un modelo base: no sigue instrucciones, no conversa y puede generar texto incoherente o ofensivo sin fine-tuning previo. Para uso como asistente, emplear MiniCPM5-1B o MiniCPM5-1B-SFT.
- Riesgo de alucinacion tipico de modelos de lenguaje, agravado en checkpoints base sin alineacion.
- Sesgos: no se documentan sesgos especificos, pero los corpus web (Ultra-FineWeb) pueden introducir sesgos presentes en datos de internet.
- Idiomas: entrenado en ingles y chino; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Cifras de benchmarks no verificables de forma independiente a partir de la informacion disponible; la afirmacion de SOTA se refiere unicamente al conjunto de modelos comparados por los autores.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los terminos de los datasets de entrenamiento si se reentrena.
- La version aqui fichada (ArchiveStudio/MiniCPM5-1B-Base) es un espejo/republicacion; se recomienda verificar contra el repositorio oficial de OpenBMB para produccion.

## Enlaces

- Modelo fichado: https://huggingface.co/ArchiveStudio/MiniCPM5-1B-Base
- MiniCPM5-1B (oficial, chat): https://huggingface.co/openbmb/MiniCPM5-1B
- MiniCPM5-1B-SFT: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- MiniCPM5-1B-Base (oficial): https://huggingface.co/openbmb/MiniCPM5-1B-Base
- MiniCPM5-1B-GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- MiniCPM5-1B-MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- UltraData: https://ultradata.openbmb.cn/
- Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Wiki (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
