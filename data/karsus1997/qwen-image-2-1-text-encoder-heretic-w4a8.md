# Karsus1997/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8

## Resumen

Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 es una compilación cuantizada del codificador de texto que emplea Qwen-Image-2.1, el modelo de generación de imagen de Alibaba/Qwen. El modelo de partida es Qwen/Qwen3-VL-8B-Instruct, un transformer visión-lenguaje de unos 8.000 millones de parámetros que Qwen utiliza sin modificaciones como codificador de texto. Sobre esa base, el usuario pottokao publicó una variante "abliterated" (con las direcciones de rechazo eliminadas mediante ablación direccional) y Karsus1997 redistribuye aquí esa variante en formato W4A8 INT8 asimétrico, con pesos de 4 bits y activaciones de 8 bits.

El interés de esta ficha no está en las capacidades generativas (el modelo no se usa para conversar ni para generar texto), sino en su función como componente de un pipeline de difusión: transforma el prompt en representaciones que consume el modelo de imagen. La aportación técnica concreta es doble. Por un lado, reduce el peso de 16,33 GB en bf16 a 5,88 GB en un único archivo safetensors, manteniendo el vision tower en bf16 y aplicando rotación convolucional y un codebook Lloyd-Max a las capas cuantizadas. Por otro lado, el autor documenta que el pipeline de cuantización reproduce byte a byte el formato que distribuye Comfy-Org para el encoder oficial, lo que permite sustituirlo sin recalibrar el flujo de trabajo.

El modelo se publica bajo licencia Apache-2.0 y está pensado para ComfyUI (tipo `qwen_image`), con soporte de `QwenImage21` integrado a partir del 14 de septiembre de 2026. La ablación reduce los rechazos de 100/100 a 5/100 con una divergencia KL de 0,0220 frente al encoder sin modificar, según las mediciones del autor. No tiene descargas ni valoraciones registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (familia Qwen3-VL) empleado como codificador de texto de Qwen-Image-2.1 |
| Parámetros totales | Aproximadamente 8.000 millones (base Qwen/Qwen3-VL-8B-Instruct); recuento exacto no disponible |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | W4A8 asimétrica: 252 capas de proyección (FFN y atención) en 4 bits con rotación convolucional y codebook Lloyd-Max; `embed_tokens` y `lm_head` en INT8 per-channel con convrot; vision tower (351 tensores), normas y sesgos en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`qwen3vl_8b_w4a8_heretic.safetensors`, 5,88 GB) |
| Tamaño del repositorio | 6,3 GB |
| Distribución de precisión | 79,2 % de los parámetros en 4 bits, 14,2 % en 8 bits, 6,6 % en bf16 |
| Herramienta de destino | ComfyUI (`CLIPLoader`, tipo `qwen_image`; nodo `TextEncodeQwenImage21`) |
| Modelo base | pottokao/Qwen-Image-2.1-Text-Encoder-Heretic (a su vez derivado de Qwen/Qwen3-VL-8B-Instruct) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-8B-Instruct: un transformer multimodal con torre de visión y torre de lenguaje. En este repositorio no se ha reentrenado nada; el trabajo consiste íntegramente en cuantización y en la redistribución de una ablación ya existente. El detalle relevante es la asimetría del esquema: los pesos de las proyecciones principales se empaquetan a 4 bits (valores `[N, K/2]` almacenados como `int8`), mientras que las activaciones se calculan a 8 bits. Cada tensor cuantizado se acompaña de `weight_s_rel` (`float8_e4m3fn`, escala por grupo), `weight_s_channel` (`float32`, escala por canal), `weight_codebook` (codebook Lloyd-Max) y `comfy_quant` (configuración por capa serializada como bytes JSON). La rotación convolucional se aplica en la ruta de 4 bits y debe activarse explícitamente (`convrot=True`) en la ruta INT8.

La ablación procede de la herramienta Heretic, que aplica una edición direccional de rango 1 sobre `o_proj` y `down_proj`, con 200 ensayos y 60 ensayos de arranque, seleccionando el punto de rodilla del frente de Pareto. El autor informa de que la cuantización no interfiere con la ablación: el error de ida y vuelta medido en NVFP4 es del 9,52 % en las capas ablacionadas, del 9,51 % en las no tocadas y del 9,44 % en el encoder original, diferencia atribuible a que la ablación es una edición de rango 1 que no genera valores atípicos. Además, el pipeline se validó tensor a tensor contra `qwen3vl_8b_w4a8.safetensors` de Comfy-Org: la ruta de 4 bits, las escalas, el codebook y la torre de visión resultan byte a byte idénticos, y solo dos capas INT8 difieren en el último bit por una diferencia de versión de `comfy_kitchen` (el `lm_head` no se usa cuando el modelo actúa como codificador de texto).

## Capacidades

- Codificación de prompts de texto para el modelo de difusión Qwen-Image-2.1: convierte instrucciones en lenguaje natural en las representaciones que consume el generador de imágenes.
- Comprensión de prompts largos y descriptivos, heredada de la torre de lenguaje de Qwen3-VL-8B-Instruct (la longitud de contexto efectiva no está documentada en la model card).
- Sustitución directa del encoder oficial de Comfy-Org manteniendo el mismo formato de archivo, sin cambios en el grafo del flujo de trabajo.
- Ablación de rechazos: 5 rechazos de 100 en `mlabonne/harmful_behaviors`, frente a 100 de 100 del encoder original, con una divergencia KL de 0,0220 medida sobre `mlabonne/harmless_alpaca`.
- Conservación de la torre de visión en bf16 (351 tensores sin tocar), lo que preserva la estructura multimodal del modelo base aunque esa torre no intervenga en la función de codificador de texto.
- Conservación de `embed_tokens` en INT8 per-channel, lo que mantiene la fidelidad de la tokenización de entrada.
- Soporte de tool calling / function calling: no disponible (el modelo no se distribuye para uso conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas en este repositorio; dependerían de las que conserve Qwen3-VL-8B-Instruct.
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Generación de imagen por prompt largo en ComfyUI: el nodo `CLIPLoader` con tipo `qwen_image` carga el archivo y `TextEncodeQwenImage21` produce el condicionamiento; es el uso previsto y explícito del repositorio.
- Sustitución del encoder oficial sin tocar el pipeline: al ser byte a byte idéntico al build de Comfy-Org en la ruta de 4 bits, el archivo se puede intercambiar por el original en un grafo ya existente, cambiando solo la ruta del modelo.
- Flujos de trabajo con VRAM ajustada: pasar de 16,33 GB en bf16 a 5,88 GB permite ejecutar la fase de codificación en GPUs donde la versión completa no entra, siempre que el resto del pipeline (modelo de difusión, VAE) tenga margen.
- Producción por lotes de activos gráficos: renderizado nocturno masivo de ilustraciones, banners o assets de marketing en los que un encoder más ligero reduce el tiempo de carga del modelo entre trabajos.
- Investigación sobre ablación direccional y alineación: comparar esta build con el encoder oficial permite medir el impacto de la ablación (5/100 frente a 100/100 rechazos, KL 0,0220) en la calidad final de la imagen generada.
- Auditoría de recetas de cuantización: el repositorio documenta cinco errores silenciosos habituales (no excluir la torre de visión, olvidar `convrot=True` en la ruta INT8, serializar mal `comfy_quant`, escalas MXFP8 como `uint8`, eliminar el prefijo `model.language_model.`), lo que lo convierte en una referencia para quien construya builds equivalentes.
- Evaluación de tolerancia al error de cuantización: los datos de error relativo por grupo de capas (9,52 %, 9,51 %, 9,44 %) sirven como caso de estudio sobre cuánto degrada un esquema W4A8 a un encoder de prompt.
- Ejecución en equipos Apple Silicon: no mediante este archivo, sino usando la build GGUF de la misma familia, ya que los kernels de esta versión son CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card). Las únicas métricas cuantitativas publicadas son las de ablación y las de error de cuantización:

| Métrica | Encoder original | Este modelo | Notas |
|---|---|---|---|
| Rechazos (`mlabonne/harmful_behaviors`) | 100/100 | 5/100 | Medido por el autor sobre la fuente bf16 |
| Divergencia KL (`mlabonne/harmless_alpaca`) | 0 (por definición) | 0,0220 | Medido por el autor sobre la fuente bf16 |
| Rechazos, verificación independiente | No disponible | 0/20 | Sobre la fuente bf16; 4/4 preguntas benignas respondidas correctamente |
| Error relativo de ida y vuelta NVFP4, capas ablacionadas (`o_proj`, `down_proj`) | No disponible | 9,52 % | Por grupo de capas |
| Error relativo de ida y vuelta NVFP4, capas no tocadas (`q/k/up/gate_proj`) | No disponible | 9,51 % | Por grupo de capas |
| Error relativo de ida y vuelta NVFP4, encoder original | 9,44 % | No aplica | Referencia de control |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 5,88 GB; sumando activaciones y las estructuras auxiliares, la estimación razonable se sitúa en torno a 8-10 GB. Es una estimación propia, no confirmada por el autor.
- GPU recomendadas: cualquier GPU CUDA, según la model card. Para la build NVFP4 de la misma familia se recomienda hardware Blackwell por sus tensor cores FP4 nativos.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12 GB o más (por ejemplo, RTX 3060 12 GB o superiores); el autor no publica requisitos mínimos exactos, por lo que conviene validarlo en el equipo concreto.
- Apple Silicon: no acelerado, porque el formato depende de kernels CUDA. En Mac hay que usar la build GGUF de la familia.
- Opciones de despliegue: ComfyUI colocando el archivo en `ComfyUI/models/text_encoders/` y usando `CLIPLoader` con tipo `qwen_image` y el nodo `TextEncodeQwenImage21`. Requiere una compilación de ComfyUI con soporte de `QwenImage21` (integrado después del 14 de septiembre de 2026). No se documentan rutas alternativas como vLLM, llama.cpp, Ollama o TGI para este archivo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Qué es | Parámetros | Contexto | Peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Karsus1997/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8 | W4A8 INT8 del encoder ablacionado | ~8.000 millones | No disponible | 5,88 GB | Apache-2.0 | Repositorio HuggingFace, 0 descargas |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | Fuente bf16, precisión completa, ablacionada | ~8.000 millones | No disponible | 17 GB (16,33 GB por archivo) | Apache-2.0 | Repositorio HuggingFace |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4 | Build NVFP4 (w4) para Blackwell | ~8.000 millones | No disponible | 5,87 GB | Apache-2.0 | Repositorio HuggingFace |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | Build GGUF para Mac y CPU | ~8.000 millones | No disponible | No disponible | Apache-2.0 | Repositorio HuggingFace |
| Build W4A8 oficial de Comfy-Org (encoder sin ablacionar) | Referencia de formato que este repositorio reproduce | ~8.000 millones | No disponible | No disponible en la información proporcionada | Apache-2.0 | Distribución de Comfy-Org |

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, no mantiene conversaciones y no se distribuye para ello. Su única función documentada es codificar prompts para Qwen-Image-2.1.
- La ablación elimina la mayor parte de los rechazos (de 100/100 a 5/100). Esto implica que el modelo apenas filtra solicitudes dañinas; cualquier despliegue público que lo use como encoder hereda esa falta de filtrado. La evaluación de seguridad debe hacerse en capas externas del pipeline.
- Riesgo de alucinación: no evaluado en la información disponible, ni en su faceta de codificación de prompts ni en una hipotética faceta generativa.
- La model card advierte de que el modelo no está afiliado ni respaldado por Alibaba/Qwen; es un derivado comunitario.
- La redistribución la firma Karsus1997, no el autor original de la ablación (pottokao). Conviene verificar la procedencia del archivo antes de usarlo en producción, especialmente porque el repositorio no registra descargas y se creó el 21 de septiembre de 2026.
- Dependencia de versión: requiere una compilación de ComfyUI con soporte de `QwenImage21` (posterior al 14 de septiembre de 2026). En versiones anteriores el modelo no cargará correctamente.
- Solo CUDA: en Apple Silicon no hay aceleración; hay que recurrir a la build GGUF.
- El autor documenta cinco fallos silenciosos frecuentes al reproducir la receta de cuantización, con archivos que parecen válidos pero producen ruido a la salida. Se recomienda verificar contra el build oficial antes de dar por buena cualquier conversión propia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` y la atribución correspondiente, tal como indica el propio repositorio.
- Longitud de contexto, idiomas soportados y requisitos mínimos de hardware no están documentados, lo que dificulta planificar un despliegue en producción con garantías.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Karsus1997/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Modelo base (ablación en bf16): https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Variante NVFP4: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-NVFP4
- Variante W4A8 de la familia: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-W4A8
- Variante GGUF: la URL aparece truncada en la model card (`https://huggingface.co/pottokao/Qwen-Image-2`), por lo que no se puede enlazar completa
- Modelo original del codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo de generación de imagen: https://huggingface.co/Qwen/Qwen-Image-2.1
- Herramienta de ablación Heretic: https://github.com/p-e-w/heretic
- Dataset de evaluación de rechazos: `mlabonne/harmful_behaviors`
- Dataset de evaluación de divergencia KL: `mlabonne/harmless_alpaca`
- Búsqueda web: los resultados obtenidos no contienen información relevante sobre este modelo y no se han incluido.
