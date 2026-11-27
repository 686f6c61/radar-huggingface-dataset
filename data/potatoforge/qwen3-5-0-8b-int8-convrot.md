# PotatoForge/qwen3.5-0.8b-int8-convrot

## Resumen

Qwen3.5-0.8B INT8 ConvRot es una cuantización INT8 del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario PotatoForge. No se trata de un modelo nuevo ni de un ajuste fino, sino de una conversión del formato de almacenamiento de los pesos originales de Qwen para reducir su huella en disco y en memoria durante la inferencia. El objetivo concreto es servir como codificador de texto (text encoder) dentro de ComfyUI, en combinación con el adaptador de 0.8B del proyecto MOSS-Image Smaller Encoder.

La relevancia de esta publicación es acotada pero práctica: existían versiones INT8 ConvRot para las variantes de 2B y 4B de Qwen3.5, pero no para la de 0.8B, lo que impedía usar el adaptador pequeño de MOSS-Image con el formato de cuantización ya estandarizado en la comunidad. Este checkpoint cubre ese hueco. El resultado es un fichero de 1,11 GiB frente a los 1,63 GiB del original en BF16, con un ahorro de aproximadamente 0,5 GiB.

Al ser una cuantización de pesos y no un modelo reentrenado, sus capacidades lingüísticas son las del Qwen3.5-0.8B subyacente, aunque el autor advierte que la calidad de imagen generada con el adaptador de 0.8B no ha sido evaluada mediante benchmarks. La información disponible sobre arquitectura, contexto o datos de entrenamiento del modelo base es limitada en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.5-0.8B (detalle no disponible); incluye bloques de atención lineal (`linear_attn`) y bloques de visión |
| Parametros totales | 0,8B (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 con escalas FP32 por fila y rotación Hadamard por bloques de tamaño 256 (ConvRot); marcador `int8_tensorwise` con `convrot: true` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`qwen3.5_0.8b_int8_convrot.safetensors`, 1,11 GiB) |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento nuevo: todos los pesos provienen del Qwen/Qwen3.5-0.8B original y solo se modifica su formato de almacenamiento. La conversión se realizó con el cuantizador en streaming `int8_convrot` de PotatoForge sobre CUDA, partiendo del fichero `model.safetensors-00001-of-00001.safetensors` con SHA-256 `04b1c301231dd422b8860db31311ab2721511346a32cb1e079c4c4e5f1fe4696`.

El esquema de cuantización aplica INT8 con escalas FP32 por fila tras una rotación Hadamard por bloques de tamaño 256 (ConvRot). Se cuantizaron 188 pesos: las proyecciones del modelo de lenguaje en las capas 1 a 23 (`self_attn.q/k/v/o_proj`, `linear_attn.in_proj_qkv`, `in_proj_z`, `out_proj` y `mlp.gate/up/down_proj`) y las proyecciones de los bloques de visión 1 a 11 (`attn.qkv`, `attn.proj`, `mlp.linear_fc1/fc2`). Permanecen en BF16 los embeddings de tokens, la capa 0 del modelo de lenguaje y el bloque 0 de visión; también se copiaron sin cambios 300 tensores, entre ellos normas, `linear_attn.in_proj_a/b`, `conv1d`, `A_log`, `dt_bias`, el merger de visión, los embeddings de parche y posición y `mtp.*`.

La fidelidad de la reconstrucción se midió a nivel de peso: tras desquantizar cada tensor y compararlo con BF16, el error L2 relativo medio es del 0,82 %, con un máximo del 0,93 % en `layers.23.mlp.down_proj`. El autor subraya que son medidas de pesos, no resultados de benchmarks de lenguaje.

## Capacidades

- Codificación de texto para pipelines de difusión en ComfyUI: el uso previsto es alimentar el nodo CLIP Text Encode conectado al adaptador de MOSS-Image.
- Integración con MOSS-Image Smaller Encoder: funciona con el adaptador de 0.8B (`moss_qwen35_08b_to_9b_1600_train.safetensors`), que aproxima las características del codificador original de 9B.
- Capacidades lingüísticas heredadas del Qwen3.5-0.8B (generación de texto, razonamiento, código, etc.): no documentadas en esta model card.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Generación de imágenes en ComfyUI con MOSS-Image: se coloca el fichero en `ComfyUI/models/text_encoders/`, se selecciona en Load CLIP con tipo `moss_image` y se conecta al nodo MOSS Smaller Encoder Adapter con el adaptador de 0.8B. Es el escenario para el que se creó el checkpoint.
- Reducción de huella en disco en entornos con VRAM o almacenamiento limitados: sustituye al codificador BF16 de 1,63 GiB por uno de 1,11 GiB, lo que facilita mantener varios pipelines de difusión instalados en la misma máquina.
- Despliegue en GPUs de consumo para prototipado de difusión: el tamaño reducido del codificador libera memoria para el modelo de difusión principal en tarjetas con 8-12 GB de VRAM, aunque no se han publicado cifras de consumo real.
- Estandarización de formatos en flujos de trabajo de la comunidad: al seguir el layout del checkpoint `qwen3.5_2b_int8_convrot`, permite reutilizar la misma configuración de cuantización entre variantes de 0.8B, 2B y 4B.
- Pruebas comparativas de fidelidad de cuantización: el error L2 relativo reportado (0,82 % medio) sirve como referencia para validar conversiones propias con el cuantizador `int8_convrot`.
- Investigación sobre adaptadores de codificadores pequeños: el par formado por este checkpoint y el adaptador de 0.8B permite estudiar la pérdida de fidelidad frente al codificador original de 9B en tareas de generación de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de reconstrucción de pesos: error L2 relativo medio del 0,82 % y máximo del 0,93 % (`layers.23.mlp.down_proj`) tras desquantizar y comparar con BF16. No hay datos de calidad de imagen, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero de pesos ocupa 1,11 GiB, por lo que el consumo será superior al incluir activaciones y el resto del pipeline.
- GPU recomendadas: no especificadas; la conversión se realizó en CUDA.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño reducido sugiere que puede caber en tarjetas de gama media, pero no hay datos publicados.
- Opciones de despliegue: ComfyUI con soporte para codificadores de texto Qwen3.5 y para el formato de cuantización INT8 ConvRot (`int8_tensorwise` con ConvRot). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PotatoForge/qwen3.5-0.8b-int8-convrot | 0,8B | No disponible | safetensors INT8 ConvRot (1,11 GiB) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | safetensors BF16 (1,63 GiB) | Apache 2.0 | Hugging Face |
| Winnougan/Qwen-3.5-INT8-Convrot-Comfy (2B) | 2B | No disponible | safetensors INT8 ConvRot | No disponible | Hugging Face |
| Versión INT8 ConvRot de 4B | 4B | No disponible | safetensors INT8 ConvRot | No disponible | No disponible |

La comparación se limita al formato y tamaño, ya que no hay datos de rendimiento publicados para ninguno de estos checkpoints en la información disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: reproduce el comportamiento del Qwen3.5-0.8B con la pérdida introducida por la cuantización INT8 (error L2 relativo de hasta el 0,93 % a nivel de peso).
- La calidad de imagen generada con el adaptador de 0.8B no ha sido evaluada con benchmarks; el propio autor indica que el adaptador de 0.8B reconstruye las características del codificador de 9B con menor fidelidad que el de 4B, por lo que cabe esperar diferencias mayores respecto al codificador original.
- Requiere una instalación de ComfyUI que soporte codificadores Qwen3.5 y el formato INT8 ConvRot; sin ese soporte el fichero no se puede cargar.
- Riesgo de alucinación y sesgos: no documentados en esta model card; serán los del modelo base Qwen3.5-0.8B.
- Idiomas soportados y longitud de contexto: no disponibles en la información proporcionada.
- Licencia Apache 2.0, la misma del modelo base; los pesos proceden íntegramente de Qwen y este repositorio solo cambia el formato de almacenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad más allá de la prueba del autor en ComfyUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PotatoForge/qwen3.5-0.8b-int8-convrot
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint de referencia del layout (2B): https://huggingface.co/Winnougan/Qwen-3.5-INT8-Convrot-Comfy
- Proyecto MOSS-Image Smaller Encoder: https://github.com/bakapotatolord/moss-image-smaller-encoder
- Adaptador de 0.8B: https://github.com/bakapotatolord/moss-image-smaller-encoder/releases/download/adapter-1600-train/moss_qwen35_08b_to_9b_1600_train.safetensors
