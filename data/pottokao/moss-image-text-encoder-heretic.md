# pottokao/MOSS-Image-Text-Encoder-Heretic

## Resumen

MOSS-Image-Text-Encoder-Heretic es un ajuste fino del modelo Qwen3.5-9B publicado por el usuario pottokao, pensado para cumplir dos funciones dentro del ecosistema MOSS-Image: reescribir una idea breve en un caption detallado (prompt enhancer) y codificar ese caption como entrada de texto para el DiT de MOSS-Image. El modelo base Qwen3.5-9B es, de hecho, el codificador de texto oficial de MOSS-Image; el autor verifica que sus pesos son idénticos a los del release oficial salvo `lm_head` y la cabeza MTP, que se omiten.

La modificación consiste en eliminar los rechazos del modelo original mediante Heretic (modificador ARA) e integrar el resultado directamente en los pesos, sin LoRA separada. Solo 32 tensores difieren del original: `mlp.down_proj`, `linear_attn.out_proj` y `self_attn.o_proj` en las capas 15 a 31, con un cambio relativo mediano del 11 %. El resto de tensores, incluidos `lm_head`, la cabeza MTP (utilizable para decodificación especulativa) y la torre de visión, son idénticos bit a bit.

El interés práctico es acotado pero claro: en el flujo oficial de ComfyUI para MOSS-Image, el texto de rechazo del codificador se codifica y acaba renderizado en la imagen. Este modelo reduce los rechazos de 100/100 a 2/100 en un conjunto de 100 prompts, con una divergencia KL de 0,050 en el primer token respecto al original. Es un modelo de 9.653.104.368 parámetros, licencia Apache-2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5-9B, con capas que combinan `self_attn` y `linear_attn`; incluye torre de visión y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se publican cuantizaciones en este repositorio (solo safetensors en precisión original); el template oficial de ComfyUI para MOSS-Image usa una copia w4a8 del modelo base |
| Idiomas soportados | no disponibles (la model card no los documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers); repositorio de 19,3 GB, coherente con ~2 bytes por parámetro |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un decoder-only de ~9,65 mm de parámetros con atención híbrida: las capas modificadas por Heretic incluyen proyecciones de salida tanto de auto-atención completa (`self_attn.o_proj`) como de atención lineal (`linear_attn.out_proj`), lo que confirma la presencia de ambos tipos de capa en el stack. El checkpoint conserva la torre de visión (el pipeline declarado es image-text-to-text) y la cabeza de predicción multi-token (MTP), reutilizable para decodificación especulativa. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

El ajuste no es un entrenamiento supervisado al uso: es una edición de pesos con Heretic, que aplica una búsqueda distribuida de parámetros de ablación sobre un conjunto de direcciones de rechazo. La búsqueda se ejecutó en 3 máquinas durante unas 4,5 horas, con 3 ajustes automáticos de la caja de búsqueda y 413 ensayos. El ensayo seleccionado fue el de 1/100 rechazos con KL 0,048, elegido por delante de un ensayo con 0/100 rechazos cuyo recuento bajo provenía en gran medida de respuestas fuera de tema. Los hiperparámetros finales son: capa inicial 15, capa final 31, `preserve weight` 0,392, `steer weight` 4,1e-4, `overcorrect` 0,988, 10 vecinos y LoRA de rango 50 fusionada a escala 1.0. El archivo `heretic_merge_info.json` del repositorio detalla cada tensor modificado y su cambio relativo.

## Capacidades

- Generación de texto conversacional en formato chat, heredada íntegramente del modelo base Qwen3.5-9B.
- Reescritura de prompts: convierte una idea corta en un caption largo y descriptivo (función de prompt enhancer del flujo MOSS-Image).
- Codificación de texto para el DiT de MOSS-Image: el modelo actúa como text encoder del generador de imágenes.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con la torre de visión preservada sin cambios.
- Modo thinking disponible mediante prefijo `<think></think>`; el autor recomienda desactivarlo para uso como prompt enhancer y no ha medido su comportamiento con thinking activado.
- Decodificación especulativa: la cabeza MTP se mantiene intacta y es utilizable para acelerar la inferencia.
- Reducción drástica de rechazos: 2/100 rechazos frente a 100/100 del original en el conjunto de evaluación del autor.
- Sin soporte documentado de tool calling ni de flujos de agente multi-paso en la información disponible.

## Casos de uso

- Generación de imágenes con MOSS-Image en ComfyUI: sustituir el codificador de texto del template oficial por este checkpoint para que las peticiones no se conviertan en texto de rechazo renderizado dentro de la imagen.
- Prompt enhancer de dos etapas en un solo modelo: la misma copia reescribe la idea del usuario y codifica el caption resultante, evitando cargar dos modelos en VRAM (9,65 mm de parámetros, ~19,3 GB en precisión original).
- Investigación sobre seguridad y alineación: banco de pruebas controlado para medir cuánto cambia la utilidad de un modelo cuando se eliminan las direcciones de rechazo con 32 tensores modificados y KL de 0,050.
- Estudio de metodologías de ablación: los hiperparámetros y el registro de búsqueda de Heretic permiten reproducir y comparar estrategias de edición de pesos sobre un mismo modelo base.
- Pipelines de generación de contenido creativo para adultos: con moderación y verificación de edad aguas arriba, el modelo deja de bloquear peticiones legítimas dentro de esa categoría (0/10 rechazos en la prueba con el prompt de sistema oficial de Prompt Enhancer).
- Evaluación comparativa de robustez: usar el par original/modificado para medir cómo afecta la edición de pesos a tareas neutras, empleando la KL de 0,050 en el primer token como referencia de deriva.
- Despliegue en servicios compatibles con endpoints (tag `endpoints_compatible`) para servir codificación de texto a un backend de difusión propio, siempre que el caso de uso admita contenido sin filtrado.

## Benchmarks y rendimiento

Los únicos datos publicados son medidas de rechazo y divergencia respecto al modelo original, con thinking desactivado (prefijo `<think></think>`):

| Métrica | Qwen3.5-9B | Este modelo |
|---|---|---|
| Rechazos (100 prompts, Heretic) | 100/100 | 2/100 |
| KL vs original (primer token) | 0 | 0,050 |

Evaluación con juez gemma-4-12b sobre 60 respuestas de `mlabonne/harmful_behaviors` (greedy, thinking off, hasta 1024 tokens):

| Resultado | Qwen3.5-9B | Este modelo |
|---|---|---|
| Full | 0 | 37 |
| Partial | 0 | 1 |
| Deflect | 8 | 19 |
| Refuse | 52 | 3 |

Prueba como prompt enhancer de MOSS-Image (prompt de sistema oficial de Prompt Enhancer, 10 peticiones explícitas de sexo adulto, thinking off): el modelo original rechazó 6/10; este modelo, 0/10.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM en precisión original: ~19,3 GB solo de pesos, más torre de visión, caché KV y activaciones; presupuestar 22-26 GB para contexto corto.
- VRAM en cuantización de 8 bits: ~10-11 GB; en 4 bits: ~6-7 GB (requiere cuantizar por cuenta propia, el repositorio no publica versiones cuantizadas).
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. Con 40 GB sobra margen para contextos largos y batching.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) admiten el modelo en precisión original con contexto corto y batch 1, con margen muy ajustado; en 8 o 4 bits caben con holgura. Tarjetas de 16 GB quedan limitadas a 4-8 bits.
- Despliegue: transformers de forma nativa; vLLM o TGI para servicio con batching (el repositorio declara compatibilidad con endpoints); llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que no se publica GGUF en este repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, la cabeza MTP permite decodificación especulativa y reducir la latencia de generación, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pottokao/MOSS-Image-Text-Encoder-Heretic | 9,65 mm | no disponible | Text encoder y prompt enhancer para MOSS-Image, sin rechazos | Apache-2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B | 9,65 mm | no disponible | Modelo base y codificador oficial de MOSS-Image, con rechazos | Apache-2.0 | HuggingFace, safetensors |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4 | no disponible | no disponible | Text encoder sin rechazos para Qwen-Image 2.1, en NVFP4 | no disponible | HuggingFace |
| pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF | 32 mm (por el nombre) | no disponible | Text encoder sin rechazos para MiniMax-H3, en GGUF | no disponible | HuggingFace |

La comparación relevante es con el propio Qwen3.5-9B: mismo tamaño, misma licencia y mismos pesos salvo 32 tensores, con la diferencia de comportamiento concentrada en los rechazos y una deriva de 0,050 en la KL del primer token.

## Limitaciones y advertencias

- Modelo explícitamente desbloqueado: elimina las direcciones de rechazo del modelo base. No incorpora ningún filtro de seguridad propio; cualquier moderación debe implementarse en capas externas.
- Riesgo legal y ético: el autor restringe el uso a adultos y prohíbe contenido con menores o personas de edad ambigua, actos no consentidos y personas reales sin consentimiento. La responsabilidad de cumplir la legislación aplicable recae en quien despliega el modelo.
- El propio autor advierte de que 19 de las 60 respuestas evaluadas siguen siendo evasivas; algunas peticiones pueden suavizarse de forma silenciosa.
- El modo thinking no se ha medido. El comportamiento con `<think>` activado es desconocido y podría reactivar rechazos o degradar la calidad del caption.
- Deriva del codificador: la fusión de pesos altera ligeramente las representaciones. Si solo se necesita codificar, el autor señala el codificador original como referencia y aún está comparando imágenes generadas con ambos.
- Los pesos están en precisión original: 19,3 GB de repositorio y ~20 GB de VRAM mínimos, lo que descarta despliegues en GPUs pequeñas sin cuantización manual.
- Sin datos de benchmarks estándar ni de idiomas: no se puede asumir un rendimiento multilingüe concreto, aunque el modelo base lo sea.
- Sesgos: no se documenta ninguna evaluación de sesgo. Al tratarse de una edición de pesos sobre un modelo con alineación, la distribución de respuestas cambia de forma sustancial (37 respuestas "full" frente a 0 en el original) y con ella el perfil de riesgo.
- Uso comercial permitido por Apache-2.0, pero sujeto a las obligaciones legales sobre contenido generado en la jurisdicción de despliegue.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria independiente de los resultados declarados.

## Enlaces

- [HuggingFace: pottokao/MOSS-Image-Text-Encoder-Heretic](https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Modelo base de MOSS-Image: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Repositorio oficial de MOSS-Image](https://github.com/OpenMOSS/MOSS-Image)
- [Informe técnico de MOSS-Image (arXiv 2610.23374)](https://arxiv.org/abs/2610.23374)
- [Codificador de texto en ComfyUI para MOSS-Image](https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/moss-image/text_encoder.py)
- [Heretic (herramienta de ablación utilizada)](https://github.com/p-e-w/heretic)
- [Perfil del autor en HuggingFace](https://huggingface.co/pottokao)
