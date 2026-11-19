# nynxz/Qwen3.5-9B

## Resumen

`nynxz/Qwen3.5-9B` es un repositorio de adaptadores LoRA en formato ComfyUI para el codificador de texto Qwen3.5-9B, publicado por el usuario nynxz. No se trata de un modelo base nuevo, sino de una reexpresión como LoRA de tres checkpoints ya existentes: dos reescritores de prompts de MiniMax-H3 (Ref2VA y FL2VA) publicados por lightx2v, y una variante "uncensored" publicada por HauhauCS. El objetivo es permitir que un único codificador Qwen3.5-9B en ComfyUI cubra las tres funcionalidades apilando LoRAs, en lugar de mantener tres checkpoints completos de 9B en disco.

El repositorio resuelve un problema práctico de despliegue en pipelines de generación de vídeo con ComfyUI: los checkpoints fusionados de lightx2v ocupan varios gigabytes cada uno y no se pueden combinar entre sí, mientras que estos LoRA (173 MB y 13,4 MB) se cargan sobre el mismo encoder y se apilan. La relevancia actual viene del ecosistema MiniMax-H3 para text-to-video e image-to-video, donde la calidad del prompt reescrito condiciona directamente la fidelidad del vídeo generado.

El modelo subyacente es Qwen3.5-9B, un transformer de 9.000 millones de parámetros con atención híbrida (capas de atención lineal y atención completa) y una torre de visión, según se deduce de las matrices adaptadas y de la presencia de `vision_start`/`image_pad` en la plantilla. La información disponible no detalla el número de tokens de entrenamiento ni la composición del dataset del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (lineal + completa) sobre Qwen3.5-9B; los LoRA adaptan solo el modelo de lenguaje |
| Parámetros totales | 9B (modelo base Qwen3.5-9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 e int8 (`qwen3.5_9b_bf16`, `qwen3.5_9b_int8_convrot` en Comfy-Org); los LoRA se distribuyen en bf16 y fp32 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA en formato de text encoder de ComfyUI) |

## Arquitectura y entrenamiento

Los tres adaptadores se obtuvieron por diferencia de pesos (`merged − Qwen/Qwen3.5-9B`) y factorización SVD en fp32 a partir de los checkpoints en bf16. Cada matriz adaptada presenta exactamente 32 valores singulares por encima del umbral de redondeo bf16, de modo que el rango 32 recupera el adaptador original; el residuo corresponde al ruido de redondeo de la fusión. Se adaptan 248 matrices, únicamente del modelo de lenguaje, en las 32 capas: `linear_attn.in_proj_qkv / in_proj_z / in_proj_a / in_proj_b / out_proj`, `self_attn.q/k/v/o_proj` y `mlp.gate/up/down_proj`. La torre de visión, los embeddings, `lm_head`, las normas y la cabeza MTP son idénticas byte a byte al modelo base.

La energía del delta conservada a rango 32 es del 98,3 % para el LoRA Ref2VA y del 99,8 % para el FL2VA. El LoRA uncensored es de rango 4, solo modelo de lenguaje, y reduce la divergencia KL de siguiente token respecto al modelo uncensored de 0,337 a 0,0007. Las claves siguen la forma genérica de text encoder de ComfyUI (`text_encoders.transformer.model.layers.N.<module>.lora_{down,up}.weight`), en bf16 y sin alpha. Los reescritores fueron entrenados por lightx2v con ms-swift a partir de un adaptador de rango 32 fusionado.

## Capacidades

- Reescritura de prompts para MiniMax-H3 en modo Ref2VA: transforma una petición más referencias ordenadas en un prompt con esquema de seis secciones.
- Reescritura de prompts para MiniMax-H3 en modos T2VA, I2VA, L2VA y FL2VA: genera prompts con esquema de tres campos, opcionalmente con keyframes de primer y último fotograma.
- Procesamiento de imágenes de referencia dentro del prompt mediante los tokens `<|vision_start|><|image_pad|><|vision_end|>`, vinculados en orden al lote de imágenes.
- Eliminación del comportamiento de rechazo (variante uncensored, LoRA de rango 4).
- Decodificación greedy con modo `thinking` desactivado; los reescritores responden tras un bloque `<think></think>` vacío.
- Apilamiento de los tres LoRA sobre un mismo codificador Qwen3.5-9B.
- Soporte multilingüe limitado al inglés según la model card.
- No se documentan tool calling, function calling ni razonamiento multi-paso como capacidades del adaptador.

## Casos de uso

- Generación de vídeo con referencias en ComfyUI: cargar el LoRA Ref2VA y pasar una petición más varias imágenes ordenadas para obtener un prompt de seis secciones que MiniMax-H3 consume directamente; el LoRA evita mantener el checkpoint fusionado de lightx2v.
- Text-to-video e image-to-video con keyframes: el LoRA FL2VA reescribe peticiones con primer y último fotograma etiquetados por rol, lo que permite controlar la transición entre dos imágenes concretas en el vídeo resultante.
- Pipeline unificado de reescritura: apilar Ref2VA, FL2VA y el LoRA uncensored sobre un único `qwen3.5_9b_bf16` reduce el uso de disco de tres checkpoints de 9B a unos 360 MB de adaptadores.
- Sustitución de checkpoints fusionados en despliegues existentes: al ser un diff exacto a rango 32 con el 98,3-99,8 % de la energía del delta, sirve para migrar flujos que ya usaban los modelos de lightx2v sin cambiar la salida.
- Investigación sobre edición de comportamiento: el LoRA uncensored de rango 4 y KL 0,0007 es un caso de estudio compacto de cómo un adaptador de muy baja dimensión elimina rechazos en un modelo de 9B.
- Experimentación con prompts de vídeo: al requerir una plantilla de sistema concreta (`SYSTEM_PROMPT` o `REF2AV_SYSTEM_PROMPT` de lightx2v), el repositorio sirve para reproducir y comparar el esquema de reescritura de MiniMax-H3 en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el codificador Qwen3.5-9B en bf16 requiere del orden de 18 GB de pesos, y en int8 (`qwen3.5_9b_int8_convrot`) aproximadamente la mitad, sin contar caché KV ni el resto del pipeline de ComfyUI.
- GPU recomendadas: no disponible en la información proporcionada.
- Los LoRA en sí ocupan 173 MB (Ref2VA y FL2VA) y 13,4 MB (uncensored), por lo que el requisito real lo marca el codificador base.
- Opciones de despliegue: ComfyUI con `CLIPLoader -> Load LoRA (Text Encoder) -> Generate Text`; los pesos del encoder se obtienen de `Comfy-Org/Qwen3.5/tree/main/text_encoders`. No se documentan vLLM, llama.cpp, Ollama ni TGI para estos adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nynxz/Qwen3.5-9B (este repo) | LoRA sobre 9B | no disponible | safetensors (LoRA ComfyUI) | Apache-2.0 | Tres adaptadores apilables, ~360 MB totales |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA | 9B | no disponible | checkpoint fusionado | Apache-2.0 | Checkpoint completo, una sola función |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA | 9B | no disponible | checkpoint fusionado | Apache-2.0 | Checkpoint completo, una sola función |
| HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B | no disponible | checkpoint | Apache-2.0 | Variante uncensored completa |

## Limitaciones y advertencias

- Los reescritores no incluyen plantilla de prompt: sin el `SYSTEM_PROMPT` o `REF2AV_SYSTEM_PROMPT` de lightx2v no producen el esquema correcto.
- Están entrenados para decodificación greedy con `thinking` desactivado; otros ajustes de muestreo pueden degradar la salida.
- La fuerza 1.0 reproduce exactamente el modelo fusionado; valores distintos se alejan del comportamiento entrenado.
- El LoRA uncensored elimina los rechazos, lo que implica riesgo de generar contenido inapropiado o dañino sin filtro.
- Solo se declara soporte de inglés; el comportamiento en otros idiomas no está documentado.
- El modelo base puede alucinar; no se han publicado evaluaciones de fidelidad de los prompts reescritos.
- La licencia Apache-2.0 permite uso comercial, pero los pesos derivados de lightx2v y HauhauCS mantienen sus propias condiciones Apache-2.0.
- El repositorio depende de la estructura de claves de ComfyUI y del codificador de Comfy-Org; no es portable directamente a otros runners sin conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nynxz/Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- lightx2v Ref2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-Ref2VA
- lightx2v FL2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.5-9B-FL2VA
- Bundle Omni de lightx2v (plantillas de sistema): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni
- HauhauCS Uncensored Aggressive: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- nDimensional Uncensored Safetensors: https://huggingface.co/nDimensional/Qwen3.5-9B-Uncensored-Safetensors
- Codificadores de texto para ComfyUI: https://huggingface.co/Comfy-Org/Qwen3.5/tree/main/text_encoders
- Revisión anterior con la documentación del LoRA uncensored: https://huggingface.co/nynxz/Qwen3.5-9B/blob/e1d95625fd1148451fb7d2bbcdd5eafce7e01593/README.md
