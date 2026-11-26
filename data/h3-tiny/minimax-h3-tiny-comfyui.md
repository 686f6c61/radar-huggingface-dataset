# H3-Tiny/MiniMax-H3-Tiny-ComfyUI

## Resumen

MiniMax-H3-Tiny-ComfyUI es un repositorio de checkpoints de un solo archivo (single-file) para ComfyUI derivados de MiniMax-H3, un modelo de generación conjunta de vídeo y audio. Lo desarrolla el proyecto independiente H3-Tiny, que aplica poda estructurada (structured pruning) sobre el modelo base MiniMaxAI/MiniMax-H3 para reducir su tamaño de 33B a aproximadamente 17B o 14B de parámetros, manteniendo la generación conjunta de vídeo y audio. El repositorio empaqueta esos pesos podados en el formato de claves nativo de ComfyUI, de modo que no se necesita un nodo personalizado para cargarlos.

La relevancia del proyecto es práctica: el modelo original de 33B es difícil de ejecutar en hardware de consumo, mientras que estas variantes podadas reducen el uso de VRAM del DiT de unos 33 GB a unos 17 GB en INT8 para una resolución de 1344×768 y 243 fotogramas, con una velocidad de muestreo comparable a bf16 según el autor. El repositorio incluye variantes Ref2VA (referencia a vídeo y audio) y FL2VA/T2VA (primer y último fotograma, o texto a vídeo y audio), además de una variante FewStep que muestrea en 6 pasos.

El modelo se distribuye bajo la MiniMax H3 Community License Agreement, que impone un ámbito territorial y una política de uso aceptable. No es un modelo de lenguaje: es un modelo de difusión para vídeo y audio, por lo que sus capacidades y requisitos de hardware difieren sustancialmente de los de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (DiT) para generación conjunta de vídeo y audio; pesos podados de MiniMax-H3 |
| Parametros totales | 17,05B (variantes 17B) / 13,98B (variante 14B OKD) / 17,08B (variante FewStep) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | bf16 e INT8 (W8A8 con rotación de Hadamard, kernels INT8 de ComfyUI) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors de un solo archivo (single-file) en el layout de claves de ComfyUI |

## Arquitectura y entrenamiento

Los pesos son derivados de MiniMaxAI/MiniMax-H3 mediante poda estructurada de profundidad y anchura de las capas FFN, según describe el autor. El repositorio no documenta el proceso de entrenamiento posterior a la poda (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos no están disponibles. La variante OKD de 14B sugiere algún tipo de destilación, pero la model card no detalla la metodología.

La conversión a ComfyUI se realiza con `scripts/convert_comfyui.py`, que escribe el AdaLN en la forma de curva de ComfyUI (`adaln_t_table`), reproduciendo el AdaLN de diffusers con un error relativo de aproximadamente 1e-10. ComfyUI lee la profundidad podada y la anchura FFN directamente de los tensores, de modo que no requiere nodos personalizados para las variantes estándar. La cuantización INT8 se genera con `scripts/quantize_comfyui_int8.py` y emplea kernels W8A8 con rotación de Hadamard. La variante FewStep necesita nodos propios porque ComfyUI estándar no pasa el endpoint de paso al modelo.

El pipeline completo requiere un text encoder Qwen3-VL de 32B (`qwen3vl_32b_minimax_h3_*.safetensors`), un VAE de vídeo en fp16 y un VAE de audio en fp32, todos obtenidos de Comfy-Org/MiniMax-H3 y no incluidos en este repositorio.

## Capacidades

- Generación de vídeo a partir de texto (T2VA) y de primer y último fotograma (FL2VA).
- Generación de vídeo condicionada por referencia (Ref2VA), usando el nodo Reference to Video.
- Generación conjunta de audio y vídeo en una sola pasada.
- Muestreo estándar de 50 pasos con scheduler `simple` y guider sin CFG (`BasicGuider`), sampler `euler` probado.
- Muestreo acelerado en 6 pasos con la variante FewStep (4 o más pasos funcionan según el autor), mediante nodos personalizados.
- Ejecución en INT8 con kernels nativos de ComfyUI, con salidas que conservan composición y movimiento de bf16 según el autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni multilingüismo textual, al no ser un modelo de lenguaje.

## Casos de uso

- Generación de clips de vídeo con audio sincronizado para prototipado creativo: el modelo produce vídeo y audio en una sola pasada, adecuado para maquetas rápidas en estudios pequeños que no pueden ejecutar el modelo base de 33B.
- Animación de imágenes clave (FL2VA): se proporcionan primer y último fotograma y el modelo interpola el movimiento, útil para animar storyboards o ilustraciones.
- Transferencia de referencia a vídeo (Ref2VA): se usa una imagen de referencia para condicionar la apariencia del sujeto en el vídeo generado, aplicable a publicidad y contenido de marca.
- Iteración rápida con FewStep: con 6 pasos de muestreo se reducen los tiempos de generación, lo que permite explorar variaciones en un flujo de trabajo de ComfyUI antes de un render final de 50 pasos.
- Despliegue en una sola GPU de gama alta: con INT8 el DiT ocupa unos 17 GB de VRAM a 1344×768 y 243 fotogramas, lo que permite ejecutar el pipeline en una H200 o GPU con memoria suficiente sin recurrir al modelo completo.
- Integración en pipelines de ComfyUI existentes: al usar el layout nativo de claves y los nodos estándar de MiniMax H3, se puede sustituir el checkpoint de 33B por uno de estos archivos en flujos ya montados, reduciendo requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta datos operativos: a 1344×768 y 243 fotogramas en una H200, el DiT en INT8 ocupa aproximadamente 17 GB de VRAM frente a 33 GB en bf16, el muestreo es igual de rápido que en bf16 y las salidas conservan la composición y el movimiento de bf16. No se aportan métricas objetivas de calidad (FVD, CLIP score, etc.) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM del DiT: aproximadamente 33 GB en bf16 y 17 GB en INT8 para 1344×768 y 243 fotogramas (dato del autor en una H200).
- VRAM total del pipeline: hay que sumar el text encoder Qwen3-VL de 32B y los dos VAE (vídeo fp16 y audio fp32), no cuantificados en este repositorio; el total supera ampliamente la VRAM del DiT solo.
- GPU recomendadas: H200 según las pruebas del autor; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma que quepa en tarjetas de consumo; el tamaño del repositorio (200,2 GB) y del text encoder sugieren que no es viable en una sola GPU de consumo sin cuantización adicional del encoder.
- Opciones de despliegue: ComfyUI (commit `afcb984` del 2026-11-21 probado), con kernels INT8 nativos y opción `--enable-triton-backend`; los nodos H3-Tiny son necesarios solo para la variante FewStep.
- Latencia y throughput: no disponibles más allá de la afirmación de que INT8 muestrea igual de rápido que bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-ComfyUI (17B) | 17,05B | safetensors single-file ComfyUI | bf16, INT8 | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,98B | safetensors single-file ComfyUI | bf16, INT8 | MiniMax H3 Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3 (base) | 33B (según el autor) | diffusers | no disponible | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría (generación conjunta de vídeo y audio) en la información proporcionada, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- La poda reduce la capacidad del modelo; el autor no publica métricas de degradación de calidad frente al modelo base de 33B.
- Los LoRA turbo de Comfy-Org fueron entrenados sobre el modelo de 33B y no están probados con H3-Tiny; el autor recomienda muestrear sin ellos.
- La variante FewStep requiere instalar nodos personalizados y no funciona con ComfyUI estándar.
- El pipeline depende de componentes externos (text encoder Qwen3-VL 32B y VAEs) que no se incluyen en el repositorio y deben descargarse por separado.
- La licencia MiniMax H3 Community License impone ámbito territorial y política de uso aceptable; es necesario revisar el acuerdo antes de cualquier uso comercial.
- H3-Tiny es un proyecto independiente no afiliado ni respaldado por MiniMax ni por Comfy Org.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al ser un modelo de difusión, el riesgo principal es la generación de contenido no fiel a la condición de entrada.
- Solo se ha validado en una configuración concreta (H200, 1344×768, 243 fotogramas, commit específico de ComfyUI); el comportamiento en otros entornos no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Variante 17B Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Variante 17B FL2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Variante 14B OKD Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Variante 17B FewStep Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Text encoder y VAEs: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI/blob/main/LICENSE-MiniMax-H3
- Script de conversión: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/convert_comfyui.py
- Script de cuantización INT8: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/quantize_comfyui_int8.py
