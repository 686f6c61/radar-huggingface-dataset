# nazkynarutama/Qwen2.5-7B-Instruct-heretic

## Resumen

Qwen2.5-7B-Instruct-heretic es una variante "decensored" del modelo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario nazkynarutama. El modelo base es un transformer causal de 7.610 millones de parametros (6.530 millones sin embeddings) con 28 capas, atencion GQA (28 cabezas de consulta y 4 de clave-valor) y una longitud de contexto nativa de 131.072 tokens, ampliable mediante YaRN. Sobre esa base se ha aplicado una ablacion ortogonal que preserva la magnitud (MPOA, Magnitude-Preserving Orthogonal Ablation) mediante la herramienta Heretic v2.0.0.dev0, cuyo objetivo es reducir drasticamente la tasa de rechazos (refusals) del modelo.

El problema que aborda es la negativa del modelo original a responder ciertas peticiones por sus mecanismos de alineamiento. Segun la model card, la tasa de rechazos pasa de 97/100 en el modelo original a 4/100 en esta variante, con una divergencia KL de 0,0606 respecto al original. Es relevante para quienes necesitan un modelo de 7B sin filtros de rechazo para investigación sobre alineamiento, red-teaming o generación de contenido que el modelo base declinaría.

La modificacion es reproducible: el repositorio incluye un directorio `reproduce` con los parametros exactos de la ablacion. La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es text-generation con soporte para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias en QKV de atencion |
| Parametros totales | 7,61 mil millones (7.610M); 6,53 mil millones sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens nativos; config.json por defecto a 32.768; generacion hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo solo publica safetensors) |
| Idiomas soportados | ingles declarado en la model card; el modelo base soporta mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: transformer decoder-only con 28 capas, RoPE para codificacion posicional, activacion SwiGLU, normalizacion RMSNorm y bias en las proyecciones QKV de la atencion. La atencion usa GQA con 28 cabezas de consulta y 4 de clave-valor. El contexto nativo es de 131.072 tokens, aunque la configuracion incluida limita a 32.768; para entradas mayores se recomienda activar YaRN con factor 4.0 y `original_max_position_embeddings` a 32768.

El entrenamiento original de Qwen2.5-7B-Instruct combina preentrenamiento y postentrenamiento (instruccion), con mejoras en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de textos largos y salidas estructuradas como JSON. Sobre ese modelo, esta variante aplica una ablacion ortogonal que preserva la magnitud (MPOA) mediante Heretic v2.0.0.dev0. Los parametros publicados de la ablacion incluyen `direction_index` de 19,38, `attn.o_proj.max_weight` de 1,14 en posicion 20,46, `attn.o_proj.min_weight` de 1,08 a distancia 13,38, `mlp.down_proj.max_weight` de 1,21 en posicion 22,42 y `mlp.down_proj.min_weight` de 0,16 a distancia 15,64. El proceso es reproducible segun el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, codigo y matematicas heredados del modelo base Qwen2.5-7B-Instruct.
- Comprension y generacion de textos largos (mas de 8K tokens) y de salidas estructuradas como JSON.
- Mayor resistencia a la diversidad de system prompts, util para role-play y condicionamiento de chatbots.
- Reduccion drastica de rechazos: 4/100 frente a 97/100 del original, segun la model card.
- Capacidades multilingues del modelo base (mas de 29 idiomas), aunque la model card solo declara ingles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta variante.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como responde un modelo sin los filtros de rechazo del original, comparando con la tasa de rechazos de 97/100 del modelo base y una divergencia KL de 0,0606.
- Red-teaming y evaluacion de robustez: sirve como contraparte "decensored" para medir la eficacia de clasificadores de contenido y guardarrailes externos en pipelines de moderacion.
- Generacion de contenido creativo sin restricciones: ficcion, guiones o narrativa donde el modelo base declinaria escenarios oscuros o controvertidos.
- Reproduccion de experimentos de ablacion: el directorio `reproduce` y los parametros MPOA publicados permiten replicar la modificacion sobre el mismo checkpoint base.
- Asistente conversacional autoalojado: con 7,61B de parametros y contexto de 32.768 tokens por defecto, es desplegable en una sola GPU para prototipos de chat de proposito general.
- Procesamiento de documentos largos: activando YaRN (factor 4.0) puede manejar entradas de hasta 131.072 tokens, util para resumen o extraccion sobre contratos, informes o transcripciones extensas.
- Generacion de codigo en pipelines internos: hereda las capacidades de codigo y salidas JSON del Qwen2.5-7B-Instruct para tareas de automatizacion.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen2.5-7B-Instruct original |
|---|---|---|
| Rechazos (refusals) | 4/100 | 97/100 |
| Divergencia KL | 0,0606 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta variante en la informacion disponible. Los resultados detallados del modelo base se remiten al blog de Qwen2.5.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita en la informacion proporcionada. Para un modelo de 7,61B en safetensors en precision completa (BF16/FP16) se requieren aproximadamente 15-16 GB de VRAM solo para los pesos, mas el espacio de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, una A100, H100 o RTX 4090 (24 GB) son adecuadas para inferencia en BF16; GPUs con menos VRAM requeriran cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090/4090) en BF16; en tarjetas de 12-16 GB sera necesario cuantizar, aunque el repositorio no publica versiones GGUF.
- Opciones de despliegue: transformers (libreria declarada), vLLM (recomendado por Qwen para textos largos), y en general frameworks compatibles con Qwen2.5.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-heretic | 7,61B | 131.072 (32.768 por defecto) | 4/100 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7,61B | 131.072 (32.768 por defecto) | 97/100 | Apache 2.0 | Hugging Face |
| Otras variantes "abliterated" de Qwen2.5-7B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras variantes decensored en la informacion proporcionada.

## Limitaciones y advertencias

- Al estar "decensored", el modelo puede generar contenido que el original rechazaria; requiere moderacion externa si se expone a usuarios finales.
- La ablacion introduce una divergencia KL de 0,0606 respecto al original, lo que implica cambios de comportamiento mas alla de los rechazos, potencialmente en calidad o coherencia.
- Riesgo de alucinacion inherente a un modelo de 7B; no se han publicado evaluaciones de fidelidad para esta variante.
- La model card solo declara ingles; el soporte multilingue del base no esta verificado tras la ablacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El contexto por defecto es de 32.768 tokens; para 131.072 hay que activar YaRN manualmente, lo que puede degradar el rendimiento en textos cortos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazkynarutama/Qwen2.5-7B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
