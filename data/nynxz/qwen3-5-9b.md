# nynxz/Qwen3.5-9b

## Resumen

`nynxz/Qwen3.5-9b` es un repositorio de adaptadores LoRA en formato ComfyUI para el codificador de texto Qwen3.5-9B, no un modelo completo. Lo publica el usuario nynxz y contiene tres LoRA apilables que se aplican sobre los pesos base de Qwen3.5-9B (Apache-2.0) para tres funciones distintas: reescritura de prompts para MiniMax-H3 en sus variantes Ref2VA y FL2VA/T2VA/I2VA/L2VA, y eliminación del comportamiento de rechazo (uncensored/abliterated) heredado de HauhauCS.

El interés del repositorio es práctico: en lugar de distribuir checkpoints fusionados completos (9B parámetros, varios GB), reexpresa esos checkpoints como diferencias de pesos factorizadas por SVD en rango 32 (o rango 4 para el LoRA uncensored), con ficheros de 173 MB y 13,4 MB respectivamente. Esto permite cargar un único codificador Qwen3.5-9B en ComfyUI y aplicar los adaptadores con la herramienta nativa `Load LoRA (Text Encoder)`, cubriendo varios flujos de generación de vídeo con un solo text encoder.

El caso de uso principal es la reescritura automática de prompts para los pipelines de vídeo MiniMax-H3 dentro de ComfyUI: el LoRA recibe una petición en lenguaje natural (y opcionalmente imágenes de referencia o keyframes) y devuelve un prompt estructurado según el esquema que espera H3 (seis secciones para Ref2VA, tres campos para el resto). El LoRA uncensored es independiente y sirve para eliminar negativas de rechazo en la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5-9B (atención híbrida: `linear_attn` y `self_attn` en 32 capas, más MLP); no incluye torre de visión, embeddings, `lm_head` ni cabeza MTP |
| Parametros totales | No disponible para el modelo base; los LoRA ocupan 173 MB (Ref2VA), 173 MB (FL2VA) y 13,4 MB (uncensored) en bf16/fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | El codificador base se ofrece en `qwen3.5_9b_bf16` y `qwen3.5_9b_int8_convrot` (Comfy-Org); los LoRA se distribuyen en bf16 (rank 32) y fp32 (rank 4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` con claves de text encoder de ComfyUI (`text_encoders.transformer.model.layers.N.<module>.lora_{down,up}.weight`), sin alpha |

## Arquitectura y entrenamiento

Los LoRA no se entrenaron desde cero: se obtuvieron por diferencia de pesos (`merged − Qwen/Qwen3.5-9B`) y factorización SVD en fp32 a partir de los checkpoints bf16 de lightx2v. Cada matriz adaptada presenta exactamente 32 valores singulares por encima del umbral de redondeo bf16 y luego un corte abrupto, porque lightx2v fusionó un adaptador de rango 32 con ms-swift; por eso rango 32 recupera el adaptador original y el residuo es ruido de redondeo de la fusión. Se adaptan 248 matrices, solo del modelo de lenguaje: todas las lineales de las 32 capas (`linear_attn.in_proj_qkv/in_proj_z/in_proj_a/in_proj_b/out_proj`, `self_attn.q/k/v/o_proj`, `mlp.gate/up/down_proj`). La energía del delta retenida a rango 32 es del 98,3 % (Ref2VA) y 99,8 % (FL2VA).

El LoRA uncensored es de rango 4, solo sobre el modelo de lenguaje, y se destila por KL de siguiente token hacia el modelo uncensored de HauhauCS, reduciendo la divergencia de 0,337 a 0,0007. Los reescritores provienen de los checkpoints fusionados de lightx2v, que a su vez entrenaron con plantillas de sistema documentadas en su bundle Omni (`system_prompt.py`, `infer.py`). No se documentan en esta información el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base Qwen3.5-9B.

## Capacidades

- Reescritura de prompts para MiniMax-H3 en esquema Ref2VA (seis secciones) a partir de una petición y referencias ordenadas.
- Reescritura de prompts para MiniMax-H3 en esquemas T2VA, I2VA, L2VA y FL2VA (tres campos), con soporte opcional de keyframes primero/último.
- Procesamiento de imágenes de referencia dentro del prompt: cada `<|image_pad|>` se enlaza a la siguiente imagen del lote, en orden.
- Generación de texto directa con bloque `<think></think>` vacío cuando el modo thinking está desactivado.
- Eliminación de comportamiento de rechazo mediante el LoRA uncensored de rango 4.
- Apilamiento de los tres LoRA sobre un único codificador Qwen3.5-9B.
- Decodificación greedy recomendada (`sampling_mode: off`) para reproducir el comportamiento entrenado.
- No se documentan tool calling, function calling, agentes multi-paso ni capacidades de audio en la información disponible.

## Casos de uso

- Reescritura de prompts en ComfyUI para MiniMax-H3 Ref2VA: se carga el LoRA de 173 MB con fuerza 1.0 y se alimenta la plantilla `REF2AV_SYSTEM_PROMPT` con las referencias ordenadas; el modelo devuelve un prompt de seis secciones listo para el pipeline de vídeo.
- Generación de vídeo texto-a-vídeo con H3: el LoRA FL2VA convierte una descripción en lenguaje natural en el esquema de tres campos que espera H3, fijando resolución y duración efectiva en la rejilla 17n+5 a 24 fps.
- Generación de vídeo imagen-a-vídeo y con keyframes: el mismo LoRA etiqueta cada imagen con su rol ("exact first frame at 0.00 seconds") y produce el prompt I2VA, L2VA o FL2VA correspondiente.
- Sustitución de checkpoints fusionados por LoRA: estudios que ya tienen Qwen3.5-9B en `models/text_encoders/` pueden ahorrar varios GB de disco y VRAM al no cargar un segundo checkpoint de 9B para la reescritura.
- Eliminación de rechazos en pipelines creativos: el LoRA uncensored de 13,4 MB se apila sobre el codificador para flujos de escritura o generación de prompts sin negativas, manteniendo el resto del comportamiento del modelo base.
- Prototipado rápido de flujos H3 en ComfyUI: la cadena `CLIPLoader -> Load LoRA (Text Encoder) -> Generate Text` permite alternar entre reescritores sin recargar el codificador, útil para comparar esquemas Ref2VA frente a FL2VA sobre las mismas peticiones.
- Evaluación de reescritura de prompts como tarea: investigadores pueden medir la calidad del prompt reescrito frente al prompt crudo usando el LoRA como componente aislado, ya que el resto de pesos del codificador permanece idéntico al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de la factorización SVD (energía del delta retenida: 98,3 % en Ref2VA y 99,8 % en FL2VA; KL de 0,337 a 0,0007 en el LoRA uncensored), no evaluaciones de calidad de reescritura ni de generación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del codificador Qwen3.5-9B cargado (bf16 o int8) y del backend de ComfyUI, no de los LoRA, que añaden solo 173 MB + 173 MB + 13,4 MB en disco.
- GPU recomendadas: no disponibles en la información proporcionada; el repositorio está pensado para ComfyUI, que puede ejecutarse en GPU consumer, pero no se especifican modelos concretos.
- Cabe en GPU consumer: no confirmado en la información disponible.
- Despliegue: ComfyUI con `CLIPLoader`, `Load LoRA (Text Encoder)` y `Generate Text`; codificador desde `Comfy-Org/Qwen3.5` (`qwen3.5_9b_bf16` o `qwen3.5_9b_int8_convrot`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nynxz/Qwen3.5-9b | LoRA (3 adaptadores) sobre Qwen3.5-9B | No disponible (base 9B) | No disponible | Apache-2.0 | Hugging Face, formato ComfyUI |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA | Checkpoint fusionado completo | 9B | No disponible | Apache-2.0 | Hugging Face |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA | Checkpoint fusionado completo | 9B | No disponible | Apache-2.0 | Hugging Face |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | Checkpoint fusionado completo | 9B | No disponible | Apache-2.0 | Hugging Face |

La diferencia principal frente a los checkpoints de lightx2v y HauhauCS es el tamaño en disco y la posibilidad de apilar varios comportamientos sobre un único codificador; a cambio, exige cargar el LoRA con la plantilla de sistema correcta y decodificación greedy para reproducir el checkpoint fusionado.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el codificador Qwen3.5-9B y ComfyUI; sin la plantilla de sistema entrenada los reescritores no producen el esquema correcto.
- Los reescritores solo responden en inglés según el campo `language` del repositorio.
- La reescritura debe ejecutarse con decodificación greedy y thinking desactivado; otras configuraciones de muestreo no están validadas.
- El LoRA uncensored elimina rechazos de seguridad; su uso en producción implica riesgos de contenido inapropiado y requiere filtrado externo.
- Riesgo de alucinación en los prompts reescritos: el modelo puede inventar detalles no presentes en la petición original ni en las referencias.
- Licencia Apache-2.0 permite uso comercial, pero los créditos y las condiciones de los modelos base (Qwen, lightx2v, HauhauCS) deben respetarse.
- No hay benchmarks publicados de calidad de reescritura ni de fidelidad a las referencias; la validación debe hacerse por evaluación manual o aguas abajo en el pipeline de vídeo.
- El repositorio ocupa 0,4 GB y solo contiene LoRA; no incluye el codificador ni los pesos base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nynxz/Qwen3.5-9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Codificador para ComfyUI: https://huggingface.co/Comfy-Org/Qwen3.5/tree/main/text_encoders
- Reescritor Ref2VA de lightx2v: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- Reescritor FL2VA de lightx2v: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA
- Bundle Omni con plantillas de sistema: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni
- Modelo uncensored de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Versión safetensors de nDimensional: https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors
- Revisión anterior del README (LoRA uncensored): https://huggingface.co/nynxz/Qwen3.5-9B/blob/e1d95625fd1148451fb7d2bbcdd5eafce7e01593/README.md
