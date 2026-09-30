# huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated

tag).

Web search results:
- Xing4.0 developed by China Telecom Artificial Intelligence Technology Co., Ltd. It's the latest generation of TeleChat, trained entirely on Ascend NPU platform. Xing4.0-29B-A4B has 29B total params, 4B activated per token. Native 256K context, extensible to 512K. First model of this scale trained entirely on Ascend NPU platform.
- China Telecom releases Xing4.0, open 29B coding agent built on Huawei chips. MoE model aimed at coding agents, terminal work, long-context tasks. 29B params, ~4B activated per token, 256K context, trained end-to-end on Huawei Ascend NPUs.
- GGUF model: 17.1 GB, 10880 downloads (local-ai-zone).

So the base model is a MoE coding agent model. The abliterated version removes refusals by ablating layers 5-17.

Note: I must be careful. Downloads: 0, likes 1. Created 2026-09-29 (future date, but that's what's given).

For specs table, I need:
- Arquitectura: MoE (mixture of experts) transformer - grandson of TeleChat. Related to TeleChat. Actually the base is Xing4.0, which is the latest generation of TeleChat.
- Parámetros totales: 29B
- Parámetros activos: 4B
- Longitud de contexto: 256K nativo, extensible a 512K
- Tipos de cuantización: The abliterated repo - the base might have GGUF (17.1 GB mentioned for Xing4.0-29b-a4b). The huihui abliterated version - "no disponible" for quantization types. Actually the search mentions GGUF model. But it's for the base model. Let me say BF16 as described in the usage script (float16, bfloat16, float32). Quantization types not specified for this model: "no disponible". Hmm, but I could mention that there's a GGUF for the base model. Let me be careful and say "no disponible (solo pesos en bfloat16/float16/float32 en el repositorio; existe GGUF no oficial del modelo base)".
- Idiomas: no disponibles (not in the info; base model likely Chinese/English but not stated). Say "no disponible".
- Licencia: apache-2.0
- Formato de pesos: safetensors (transformers format). Base has GGUF.

For benchmarks: not published for this model. The base model? No benchmark data in info. So "No se han publicado resultados de benchmarks en la informacion disponible."

Comparison models: Similar MoE ~30B models with 3-4B active. Qwen3-30B-A3B, maybe. I need to be careful not to invent numbers. I can compare with Qwen3-30B-A3B (well known), but I should be careful. Actually the task says "Si no conoces modelos comparables, indica 'no disponible'." I can mention Qwen3-30B-A3B as a conceptually similar model but I must not invent numbers. I'll note things I'm reasonably sure about but mark unknowns as no disponible. Hmm, risky. Let me be conservative — I can list comparable models by architecture class but mark performance as "no disponible". Actually, better to include a comparison table with Qwen3-30B-A3B and maybe GLM-4.5-Air (106B) — no, too big. Let me use Qwen3-30B-A3B and maybe Ling-lite or DeepSeek. Hmm.

Let me be careful: The rule is not to invent data. For the comparison, I'll compare on parameters/context/license which are generally known, and mark performance as "no disponible" if I don't have it. But even parameters for Qwen3-30B-A3B: 30B total / 3B active, context 128K, Apache-2.0. Those are reasonably well known. I'll include with a caveat? Actually the rule says don't invent. Let me just be safe and keep the table minimal, mentioning these are general reference values. Hmm, actually the safest is to present the comparison but mark clearly.

Let me think about whether to include Qwen3-30B-A3B. I believe Qwen3-30B-A3B has 30.5B total, 3.3B active, 128K context (extendable), Apache-2.0. That's fine. And possibly GLM-4.5 Air? No. Let me use Qwen3-30B-A3B and maybe Llama-4 Scout? Llama-4 Scout is 109B/17B. Not similar. Let me use Qwen3-30B-A3B and maybe an abliterated counterpart like huihui-ai's own abliterated Qwen3. Hmm.

Actually, I'll do the comparison with Qwen3-30B-A3B and note the other as no disponible. Let me keep it modest.

Let me now write the fact sheet.

Resumen: 
- Huihui-Xing4.0-29B-A4B-abliterated is an uncensored/ablated version of XingChen-AGI/Xing4.0-29B-A4B, created by huihui-ai using abliteration technique.
- The base model Xing4.0 is developed by China Telecom AI (TeleChat family), MoE 29B total / 4B active, 256K context, trained on Ascend NPU.
- The abliterated version removes refusal mechanisms by ablating layers 5-17 (0-based).

Let me write in Spanish, careful with accents.

Note the title headings only first word capitalized. "Resumen", "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces". Fine.

For hardware:
- MoE 29B total, 4B active. BF16: ~58 GB weights + KV cache. So needs ~60+ GB VRAM. A100 80GB, H100 80GB, 2x RTX 4090 24GB (48GB, not enough for BF16 weights of 58GB). So with 4-bit quantization ~15-17 GB. The GGUF is 17.1 GB. So can fit in a single RTX 4090 24GB with 4-bit (Q4) quantization. FP8 ~29 GB needs A100 40GB or H100.

Let me estimate:
- BF16 weights: 29B × 2 bytes = 58 GB.
- FP8/INT8: ~29 GB.
- 4-bit: ~15-17 GB.
- KV cache at 256K depends.

Active params 4B means compute is like a 4B model for generation — fast token generation.

Consumer GPUs: RTX 4090 24GB with 4-bit quant. RTX 3090 24GB similar. Dual 4090 for BF16 maybe not enough (48GB < 58GB). So need multi-GPU or 80GB.

Deployment: vLLM, SGLang, llama.cpp (GGUF), Ollama, TGI. Transformers as shown.

Latency/throughput: no publicado.

Now let me write it.

Let me also mention thinking mode (enable_thinking, </think>).

Casos de uso - min 6, concrete.

Let me write the whole thing.

Comparativa table: 
| Modelo | Parametros totales/activos | Contexto | Licencia | Disponibilidad |
- Huihui-Xing4.0-29B-A4B-abliterated | 29B / 4B | 256K (ext. 512K) | Apache-2.0 | HF
- Xing4.0-29B-A4B (base) | 29B / 4B | 256K (ext. 512K) | Apache-2.0 (asumido? no available - actually base model license not given). Hmm. The abliterated is apache-2.0. Base model license — not specified in search. I'll say "no disponible". Actually let me not assume. Hmm but it's a comparison within the same family. Let me put base model license as "no disponible".
- Qwen3-30B-A3B | 30,5B / 3,3B | 128K | Apache-2.0 | HF

I'll add a note about the data source.

Actually I'm slightly worried about Qwen3 exact numbers. Let me keep it but with rounded/safe numbers. Qwen3-30B-A3B: 30.5B total, 3.3B activated, 128K context native. That's accurate enough. And Qwen3-30B-A3B also has abliterated versions by huihui-ai.

Let me include a third: maybe "GLM-4.5-Air" 106B/12B — not similar. Let me just do 2-3. I'll add DeepSeek? No. Let me keep Qwen3-30B-A3B and maybe "Llama-3.x"? Not MoE. I'll provide two alternatives: Qwen3-30B-A3B and maybe note huihui-ai's abliterated Qwen3 variants.

I'll do 3 rows: the model, base model, Qwen3-30B-A3B.

Now writing.

For "Tipos de cuantizacion": Say "No disponible en el repositorio (pesos en bfloat16/float16/float32); existe una version GGUF no oficial del modelo base en local-ai-zone".

Hmm, that GGUF is for Xing4.0-29b-a4b (17.1 GB). Let me mention it in enlaces.

Let me finalize.

Hardware bullet list:
- BF16 (pesos completos): ~58 GB solo para pesos; requiere A100 80GB, H100 80GB o multiples GPU.
- FP8/INT8: ~29-30 GB; cabe en A100 40GB, L40S 48GB.
- 4-bit (Q4_K_M / AWQ / GPTQ): ~15-17 GB; cabe en RTX 4090 24GB, RTX 3090 24GB, RTX 5090 32GB.
- No cabe en consumer GPU de menos de 16 GB en cuantizacion 4-bit.
- KV cache: con 256K contexto consume mucha memoria; requiere cuantizacion de KV o atencion eficiente.
- Despliegue: vLLM, SGLang, llama.cpp, Ollama, TGI, transformers.
- Latencia/throughput: no disponible; al activar solo 4B por token la generacion deberia ser rapida en GPUs modernas, comparable a un modelo denso de ~4B.

Ok. Write.

I'll include the abliteration reference github link.

Enlaces:
- HF: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Base model HF: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GitHub base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Abliteration method: https://github.com/Sumandora/remove-refusals-with-transformers
- AlphaSignal news: https://alphasignal.ai/news/china-telecom-releases-xing4-0-an-open-29b-coding-agent-built-on-huawei-chips
- GGUF local-ai-zone: https://local-ai-zone.github.io/models/xing4-0-29b-a4b.html
- huihui-ai HF profile: https://huggingface.co/huihui-ai

Write the ficha now.## Resumen

Huihui-Xing4.0-29B-A4B-abliterated es una variante sin censura (uncensored) del modelo Xing4.0-29B-A4B, publicada por el usuario huihui-ai. El proceso aplicado es la "abliteration", una tecnica que elimina los mecanismos de rechazo del modelo base mediante la ablacion de direcciones de activacion asociadas a la negativa a responder. En este caso concreto, la model card indica que se ablacionan las capas 5 a 17 (indexacion base 0). El autor lo describe explicitamente como una implementacion cruda y de prueba de concepto.

El modelo base, Xing4.0-29B-A4B, lo desarrolla China Telecom Artificial Intelligence Technology Co., Ltd. (familia TeleChat) y es un modelo de mezcla de expertos (MoE) con 29.000 millones de parametros totales y unos 4.000 millones activados por token. Esta orientado a agentes de programacion, tareas de terminal y contextos largos, con una ventana nativa de 256K tokens extensible a 512K. Es relevante porque, segun la informacion disponible, es el primer modelo de esta escala entrenado integramente sobre la plataforma Ascend NPU de Huawei, lo que lo convierte en una alternativa abierta al ecosistema NVIDIA.

Esta ficha cubre la version abliterada, que hereda la arquitectura y el entrenamiento del modelo base y solo modifica el comportamiento de rechazo. El repositorio declaraba 0 descargas y 1 like en el momento de la consulta, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); familia TeleChat / Xing4.0; entrenado sobre Ascend NPU |
| Parametros totales | 29B |
| Parametros activos | ~4B por token |
| Longitud de contexto | 256K tokens nativo, extensible a 512K |
| Tipos de cuantizacion | No disponible en este repositorio (pesos en bfloat16/float16/float32). Existe una version GGUF no oficial del modelo base (17,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato transformers); GGUF solo del modelo base no oficial |
| Modelo base | XingChen-AGI/Xing4.0-29B-A4B |
| Metodo de modificacion | Abliteration (ablacion de las capas 5-17, indexacion base 0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 29B de parametros totales y aproximadamente 4B activos por token, lo que reduce el coste computacional de generacion al nivel de un modelo denso de tamano similar al de sus parametros activos. El modelo base fue entrenado de principio a fin sobre la plataforma Ascend NPU de Huawei, segun las fuentes disponibles, y esta disenado especificamente para cargas de agentes de codigo, trabajo de terminal y tareas de contexto largo. La ventana de contexto nativa es de 256K tokens, ampliable a 512K.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base. Sobre esta version concreta, la unica intervencion documentada es la abliteration: se identifican y restan las direcciones de activacion responsables de las negativas en las capas 5 a 17 (indexacion base 0) mediante la libreria `remove-refusals-with-transformers`. El resultado es un modelo con el mismo conocimiento y capacidad de generacion que el base, pero con los rechazos suprimidos. La model card incluye ejemplos de uso con `transformers`, carga en `bfloat16`, `device_map` automatico y plantilla de chat con soporte para modo de razonamiento (`enable_thinking`).

## Capacidades

- Generacion de texto y razonamiento en modo "thinking", con etiquetas de razonamiento (`</think>`) y control de la generacion mediante `enable_thinking`.
- Capacidades de programacion orientadas a agentes de codigo y trabajo de terminal, segun la descripcion del modelo base.
- Procesamiento de contexto largo: ventana nativa de 256K tokens, extensible a 512K, adecuada para repositorios de codigo grandes o documentos extensos.
- Supresion de rechazos: el modelo no aplica las negativas tipicas del modelo base al responder a determinadas peticiones.
- Soporte de plantilla de chat conversacional (`apply_chat_template`) y generacion por streaming.
- Tool calling / function calling: no confirmado en la informacion disponible para esta version.
- Capacidades multimodales (vision o audio): no disponible; no se mencionan.
- Idiomas concretos soportados: no disponible.

## Casos de uso

- Agentes de programacion autonoma: el modelo puede actuar como agente que lee repositorios completos, planifica cambios y ejecuta pasos multi-turno, aprovechando los 256K tokens de contexto para mantener visibles ficheros y dependencias relevantes.
- Automatizacion de tareas de terminal: interpretar comandos, generar scripts de shell y depurar salidas de procesos, un escenario para el que el modelo base fue disenado explicitamente.
- Analisis de bases de codigo extensas: revisar grandes monorepos o generar documentacion tecnica recorriendo el contexto largo sin necesidad de trocear los ficheros.
- Investigacion sobre seguridad y alineacion: al estar abliterado, permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, util para analisis de robustez, red-teaming y evaluacion de sesgos.
- Generacion de contenido sin restricciones tematicas: redaccion de textos sobre temas que el modelo base rechazaria, en entornos donde el filtrado no es deseable.
- Asistentes conversacionales de contexto largo: dialogos multi-turno que requieren recordar informacion de documentos extensos, como asistencia legal o analisis de contratos.
- Procesamiento por lotes de documentos largos: resumen y extraccion de informacion sobre entradas de cientos de miles de tokens en pipelines automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos completos en BF16: aproximadamente 58 GB solo para los parametros (29B x 2 bytes); requiere A100 80GB, H100 80GB o reparto en varias GPU.
- Precision FP8 / INT8: en torno a 29-30 GB; viable en A100 40GB, L40S 48GB o H100.
- Cuantizacion de 4 bits: aproximadamente 15-17 GB; cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090 (32 GB).
- GPU de consumo: no cabe en GPUs con menos de 16 GB de VRAM ni siquiera en 4 bits; en 24 GB si es viable con cuantizacion agresiva.
- Cache KV: con 256K tokens de contexto el consumo de memoria es alto; conviene cuantizar la cache KV o usar atencion eficiente para sostener secuencias largas.
- Opciones de despliegue: `transformers` (ejemplo incluido en la model card), vLLM, SGLang, TGI, llama.cpp y Ollama (estos ultimos solo si se dispone de pesos GGUF derivados, que no se distribuyen en este repositorio).
- Latencia y throughput: no disponibles. Al activar solo ~4B parametros por token, la velocidad de generacion deberia aproximarse a la de un modelo denso de ese tamano, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Huihui-Xing4.0-29B-A4B-abliterated | 29B / ~4B | 256K (ext. 512K) | Apache-2.0 | Hugging Face |
| Xing4.0-29B-A4B (base) | 29B / ~4B | 256K (ext. 512K) | No disponible | Hugging Face / GitHub |
| Qwen3-30B-A3B | 30,5B / 3,3B | 128K | Apache-2.0 | Hugging Face |

Datos de rendimiento comparado: no disponibles. La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no se han publicado resultados de benchmarks en la informacion proporcionada. Existen variantes abliteradas de Qwen3 publicadas por el mismo autor (huihui-ai), que constituyen alternativas directas en cuanto a filosofia de publicacion.

## Limitaciones y advertencias

- La abliteration suprime los rechazos, por lo que el modelo respondera a peticiones que el modelo base declinaria; esto puede dar lugar a contenido danino, ilegal o eticamente problematico.
- La ablacion de las capas 5 a 17 puede degradar la coherencia y la calidad general respecto al modelo base, especialmente en tareas que dependian de representaciones de esas capas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, no mitigado por la abliteration y potencialmente agravado por la intervencion sobre las capas.
- Sesgos conocidos: no disponibles, pero el modelo base, entrenado en el ecosistema chino, puede arrastrar sesgos culturales y geopoliticos propios de sus datos.
- Cobertura de idiomas: no disponible; no se confirma un soporte multilingue amplio.
- Restricciones de licencia: se declara Apache-2.0, lo que permitiria uso comercial, pero la licencia del modelo base no esta confirmada en la informacion disponible y conviene verificarla antes de un uso en produccion.
- Autor del abliterado: la modificacion la realiza huihui-ai, no el desarrollador original (China Telecom); no hay garantias de soporte ni de calidad por parte del autor del modelo base.
- Repositorio practicamente sin traccion (0 descargas, 1 like), sin comunidad que valide su comportamiento.
- No se distribuyen pesos GGUF ni cuantizaciones oficiales en este repositorio, lo que complica el despliegue en hardware de consumo.
- Uso responsable: al tratarse de un modelo sin filtros, debe desplegarse con salvaguardas externas si se expone a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo base en Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Metodo de abliteration (respositorio de referencia): https://github.com/Sumandora/remove-refusals-with-transformers
- Perfil del autor en Hugging Face: https://huggingface.co/huihui-ai
- Noticia sobre el lanzamiento de Xing4.0 (AlphaSignal): https://alphasignal.ai/news/china-telecom-releases-xing4-0-an-open-29b-coding-agent-built-on-huawei-chips
- Version GGUF no oficial del modelo base (local-ai-zone): https://local-ai-zone.github.io/models/xing4-0-29b-a4b.html
