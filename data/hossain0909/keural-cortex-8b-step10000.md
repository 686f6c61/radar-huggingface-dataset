# hossain0909/Keural-Cortex-8B-step10000

## Resumen

Keural Cortex 8B step10000 es un checkpoint intermedio de preentrenamiento continuado (continued pretraining, CPT) en coreano sobre el modelo base Qwen/Qwen3-8B-Base, desarrollado por MKD Co., Ltd. (publicado en Hugging Face bajo la cuenta hossain0909). No se trata de un modelo final ni de un modelo ajustado por instrucciones: es una instantánea del entrenamiento en el paso 10.000 de 13.034 (76,7 % de progreso), tras haber visto 31,46 mil millones de tokens de un total previsto de 41,00 mil millones. Su publicacion responde a un objetivo de reproducibilidad e investigacion, no de uso practico.

El modelo conserva la arquitectura transformer de Qwen3-8B-Base, con una longitud de contexto nativa de 32.768 tokens, y esta especializado en coreano mediante la incorporacion de un corpus mayoritariamente coreano (42,45 %). El autor lo publica junto al checkpoint step5000 y al modelo final Keural-Cortex-8B-Base para permitir comparar el comportamiento del modelo antes y despues de la meseta de perdida observada a partir del paso 5.200, cuando la training loss se estabilizo en torno a 1,818.

Es relevante ahora porque documenta de forma transparente un fenomeno habitual en el preentrenamiento continuado: la divergencia entre la perdida de entrenamiento y la mejora real de capacidades downstream. El autor reconoce explicitamente que no hay evaluaciones de benchmark y que el checkpoint no esta pensado para produccion. Los pesos se distribuyen en safetensors bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B-Base) |
| Parametros totales | 2.047.683.840 (segun safetensors; la model card lo denomina "8B", discrepancia no aclarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativa) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en bf16) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base y aplica un preentrenamiento continuado con secuencia de 4.096 tokens, batch global de 3.145.728 tokens por paso, LR pico de 1,0e-05 con schedule WSD, AdamW (beta 0,9/0,95, weight decay 0,1), grad clipping de 1,0, FSDP full shard sobre 4 GPU H200, bf16 con reduccion de gradientes en fp32, FlashAttention-2 y activation checkpointing. El checkpoint exportado corresponde al paso 10.000, con un LR de 1,0e-05 en la fase estable del schedule WSD, es decir, antes de que se produjese el decaimiento final hasta 1,0e-06.

El corpus de entrenamiento consta de 38,784 mil millones de tokens procedentes de 19 fuentes: 42,45 % coreano, 29,71 % ingles y otros idiomas, 15,19 % codigo y 12,66 % ciencia y matematicas. Se excluyeron NamuWiki, Falcon-RefinedWeb y arXiv por motivos de licencia. No consta que se aplicasen tecnicas de RLHF, DPO ni ajuste por instrucciones; el chat_template.jinja incluido procede del tokenizer base y no implica ningun tipo de ajuste conversacional. La perdida de entrenamiento se estabilizo en aproximadamente 1,818 desde el paso 5.200 (16,4 mil millones de tokens) y la fase de decaimiento apenas aporto 0,0007 de mejora.

## Capacidades

- Generacion de texto por continuacion (modelo base, sin formato de chat ni instrucciones).
- Capacidad de continuacion de texto en coreano e ingles, con especial enfasis en el primero por la composicion del corpus.
- Generacion de codigo, dado el 15,19 % de tokens de codigo en el corpus de entrenamiento.
- Razonamiento cientifico y matematico basico, derivado del 12,66 % de tokens de ciencia y matematicas.
- Soporte de tool calling / function calling: no disponible (modelo base sin post-entrenamiento).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a coreano e ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre preentrenamiento continuado: el checkpoint sirve para comparar la evolucion de capacidades entre el paso 5.000, el 10.000 y el modelo final, y analizar si la meseta de perdida se corresponde con una meseta de capacidades.
- Reproducibilidad de experimentos: permite replicar el pipeline de entrenamiento documentado en el repositorio de GitHub del autor (CPT_details/), incluyendo configuracion de FSDP, schedule WSD y composicion del corpus.
- Analisis de olvido catastrofico: al ser una continuacion de Qwen3-8B-Base con fuerte sesgo al coreano, permite estudiar la degradacion de capacidades en ingles y codigo respecto al modelo original.
- Estudio de contaminacion de datos: dado que el autor senala que la descontaminacion N-gram frente a suites de evaluacion esta pendiente, el checkpoint puede emplearse para desarrollar metodologias de deteccion de solapamiento.
- Generacion de texto en coreano para tareas de continuacion controlada: util en experimentos de linguistica computacional o analisis de corpus donde no se requiera seguir instrucciones.
- Base para experimentos de ajuste supervisado (SFT): investigadores que quieran partir de un modelo con mayor exposicion al coreano que Qwen3-8B-Base pueden usarlo como punto de partida, asumiendo que no es un modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint "no ha sido evaluado" y que la descontaminacion frente a suites de evaluacion esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2.047.683.840 parametros), mas overhead de activaciones y cache KV; en la practica, entre 6 y 10 GB para contexto corto.
- VRAM estimada con contexto completo de 32.768 tokens: considerablemente superior por la cache KV; no disponible la cifra exacta sin configuracion de atencion.
- GPU recomendadas: el entrenamiento se realizo sobre 4 x NVIDIA H200; para inferencia basta una GPU con al menos 16 GB de VRAM en bf16.
- Cabe en GPU de consumo: si, en tarjetas como RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requeriria cuantizacion, no publicada por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference), endpoints compatibles; vLLM, llama.cpp u Ollama no estan confirmados por el autor y requeririan conversion a GGUF no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Keural-Cortex-8B-step10000 | 2.047.683.840 (safetensors) | 32.768 | ko, en | Apache 2.0 | Checkpoint intermedio, sin evaluar |
| Qwen/Qwen3-8B-Base | no disponible en la informacion | 32.768 (heredado) | multilingue | Apache 2.0 | Modelo base completo |
| Keural-Cortex-8B-step5000 | no disponible | 32.768 | ko, en | Apache 2.0 | Checkpoint intermedio (38 %) |
| Keural-Cortex-8B-Base (final) | no disponible | 32.768 | ko, en | Apache 2.0 | Modelo final (100 %), sin evaluar |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no tiene formato de chat, no soporta tool calling ni thinking mode. El chat_template.jinja incluido procede del tokenizer base y no implica ajuste conversacional.
- Checkpoint intermedio: el LR no habia decaido en el momento de la exportacion, por lo que no es un modelo "terminado" en ningun sentido; el checkpoint final si completo el decaimiento hasta 1,0e-06.
- Sin evaluacion: no existen numeros de benchmark para este checkpoint.
- Descontaminacion pendiente: no se ha comprobado el solapamiento N-gram frente a las suites de evaluacion, lo que invalida cualquier comparacion de rendimiento sin analisis previo.
- Uso previsto restringido: el autor indica explicitamente que es para investigacion y comparacion de checkpoints, no para produccion ni despliegue orientado a usuario.
- Sesgo linguistico: el corpus es 42,45 % coreano, lo que puede degradar capacidades en ingles y otros idiomas respecto a Qwen3-8B-Base.
- Riesgo de alucinacion: no cuantificado; al ser un modelo base, la generacion no esta alineada ni filtrada.
- Discrepancia de parametros: la model card lo denomina "8B" pero safetensors reporta 2.047.683.840 parametros; conviene verificar la configuracion real antes de planificar despliegues.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser obra derivada de Qwen3-8B-Base de Alibaba Cloud se requiere atribucion.

## Enlaces

- Hugging Face: https://huggingface.co/hossain0909/Keural-Cortex-8B-step10000
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Checkpoint step5000: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-step5000
- Modelo final: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-Base
- Repositorio GitHub con detalles de CPT: https://github.com/MKD-CORP/Keural-Cortex-8B
