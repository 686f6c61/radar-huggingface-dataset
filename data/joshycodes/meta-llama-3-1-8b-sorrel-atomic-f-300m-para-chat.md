# joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-para-chat

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de tipo "chat" construido sobre el checkpoint intermedio `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, que a su vez deriva de la arquitectura Meta Llama 3.1 de 8.000 millones de parametros. Lo desarrolla el usuario `joshycodes` en el marco de un proyecto de investigacion de Anthropic Fellows sobre entrenamiento de caracter ("flourishing-framed character training"), descrito en la model card como un artefacto de investigacion privado que no debe redistribuirse. El modelo resuelve, por tanto, un problema de investigacion acotado: modelar un comportamiento conversacional alineado con un marco de "flourishing" mediante una etapa adicional de entrenamiento sobre un dataset de voz propio.

Tecnicamente se trata de un transformer decoder-only denso de la familia Llama 3.1 (8.030.261.248 parametros, sin mezcla de expertos), entrenado en una sola pasada sobre 2.051.019 tokens del dataset `joshycodes/sorrel-sft-voice` con una longitud de secuencia de 4.096 tokens. El entrenamiento se ejecuto en una unica NVIDIA H200 en RunPod y la perdida bajo de 1,6561 a 1,5131 durante la etapa de chat.

Su relevancia actual es limitada fuera del contexto del proyecto: tiene cero descargas y cero "likes" en HuggingFace, no publica benchmarks y su licencia es de uso interno de investigacion. Es util como referencia metodologica para quien estudie pipelines de continued pretraining seguidos de SFT de caracter, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens en la etapa de chat (seq_len de entrenamiento); la arquitectura base Llama 3.1 8B admite hasta 128.000 tokens, aunque no se confirma que se conserven tras el ajuste |
| Tipos de cuantizacion | No especificados por el autor; el formato safetensors permite cuantizacion posterior a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | `internal-research` (campo `license: other`) — artefacto de investigacion privado, no redistribuir |
| Formato de pesos | safetensors |
| Tamano del repositorio | 32,1 GB |
| Modelo base | `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain` (revision `754720c4fbb6`) |
| Dataset de entrenamiento | `joshycodes/sorrel-sft-voice`, config `atomic-f-300m-para`, revision `3b203779d0be` |
| Tokens vistos en la etapa de chat | 2.051.019 |
| Perdida (chat) | 1,6561 → 1,5131 |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y activacion SwiGLU, sin componentes MoE ni estado recurrente (SSM). El modelo no introduce innovaciones arquitectonicas propias; la aportacion del autor esta en el pipeline de entrenamiento.

El entrenamiento se divide en al menos dos etapas previas a este artefacto: un "midtrain" (`meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`) y esta etapa final de chat o SFT. La etapa documentada se ejecuto con los siguientes hiperparametros: learning rate 1e-5, longitud de secuencia 4.096, micro-batch 8, acumulacion de gradiente 8, una sola epoca y semilla 20260821. El run se lanzo desde el commit `a0afb77669ae` del repositorio `flourishing-training` sobre una NVIDIA H200. No se documenta el uso de RLHF, DPO ni decodificacion especulativa, y no se especifica la composicion completa del dataset `sorrel-sft-voice` mas alla de su nombre y configuracion.

## Capacidades

- Generacion de texto conversacional en formato chat, resultado directo de la etapa SFT sobre `sorrel-sft-voice`.
- Modelado de un "caracter" o persona concreta orientada a un marco de flourishing, segun la descripcion del proyecto de Anthropic Fellows.
- Razonamiento general y conocimiento del mundo heredados del checkpoint base Llama 3.1 8B, aunque no verificados con benchmarks en esta ficha.
- Capacidad multilingue: no documentada para este ajuste; depende de lo preservado del modelo base.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles (el nombre "voice" hace referencia al dataset, no a una modalidad de entrada).
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Investigacion sobre entrenamiento de caracter: el modelo sirve como artefacto de referencia para estudiar como una etapa SFT corta (2,05 millones de tokens, una epoca) modifica el comportamiento conversacional de un checkpoint intermedio de Llama 3.1 8B.
- Reproduccion de pipelines de continued pretraining mas SFT: los hiperparametros publicados (lr 1e-5, seq_len 4096, micro-batch 8, grad_accum 8) permiten replicar la receta sobre otros checkpoints intermedios del mismo proyecto.
- Estudios de alineacion en dominios de bienestar: el enfasis en "flourishing" lo hace adecuado para experimentos academicos sobre como un SFT breve orienta el tono y los valores de las respuestas.
- Evaluacion comparativa de etapas de entrenamiento: sirve para medir la delta entre el checkpoint `midtrain` y el checkpoint final de chat en tareas de dialogo, usando el script `eval.py` mencionado en la model card.
- Generacion de respuestas sinteticas para curar datasets de voz conversacional en el mismo dominio que `sorrel-sft-voice`, siempre dentro del entorno de investigacion cerrado.
- Pruebas de infraestructura de inferencia: al ser un Llama 3.1 8B estandar, se puede usar para validar despliegues con vLLM, TGI o llama.cpp antes de mover modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de entrenamiento de la etapa de chat, que paso de 1,6561 a 1,5131 sobre 2.051.019 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16, 8-9 GB en cuantizacion INT8 y 4,5-5,5 GB en INT4.
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento), A100 40/80 GB, H100 para entrenamiento o inferencia a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en FP16.
- Compatibilidad con GPU de consumo: si, cabe en FP16 en tarjetas de 24 GB (RTX 3090, 4090) y en cuantizacion 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: vLLM, HuggingFace TGI, llama.cpp, Ollama y transformers, al ser una arquitectura Llama 3.1 estandar. Requiere convertir los safetensors a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-para-chat` | 8,03 B | 4.096 en entrenamiento (128.000 en la base) | `internal-research` (no redistribuir) | No publicados | Repositorio privado, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 | Llama 3.1 Community License | Si (MMLU, HumanEval, GSM8K, etc.) | Publico, muy extendido |
| `meta-llama/Llama-3.1-8B` (base) | 8,03 B | 128.000 | Llama 3.1 Community License | Si | Publico, muy extendido |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25 B | 32.768 | Apache 2.0 | Si | Publico, muy extendido |

No se dispone de resultados de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Restriccion de licencia: la licencia `internal-research` prohibe explicitamente la redistribucion. No es apto para uso comercial ni para publicacion de pesos derivados.
- Herramienta de investigacion privada: la propia model card lo describe como "private research artifact"; no ha pasado por un proceso de publicacion ni revision externa.
- Sin evaluacion publicada: no hay benchmarks, evaluaciones de seguridad ni pruebas de regresion de capacidades.
- Riesgo de degradacion por sobreajuste: 2,05 millones de tokens en una sola epoca con learning rate 1e-5 sobre un checkpoint intermedio pueden alterar capacidades del modelo base, pero esto no esta cuantificado.
- Riesgo de alucinacion: heredado de Llama 3.1 8B y no medido para este ajuste.
- Idiomas soportados no documentados: se desconoce si el ajuste conserva el multilingueismo del modelo base.
- Contexto efectivo incierto: aunque la arquitectura base admite 128.000 tokens, el entrenamiento se hizo con secuencias de 4.096, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Composicion del dataset de entrenamiento no detallada: no se especifica el numero de ejemplos, la procedencia de las transcripciones ni los criterios de filtrado, lo que dificulta auditar sesgos.
- Sin garantias de produccion: no hay informacion sobre latencia, throughput, estabilidad en despliegues largos ni tolerancia a prompts adversarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-para-chat
- Modelo base (midtrain): https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-sft-voice
- Repositorio `flourishing-training` (commit del launcher `a0afb77669ae`): no disponible como URL publica en la informacion proporcionada
- Paper o blog del proyecto: no disponible
- Demo: no disponible

Nota: los resultados de la busqueda web proporcionada no guardan relacion con el modelo (corresponden a un foro de bolsa sobre Global Fashion Group) y no se han utilizado como fuente.
