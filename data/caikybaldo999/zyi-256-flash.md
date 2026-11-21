# caikybaldo999/zyi-256-flash

## Resumen

ZYI-256 Flash es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por el usuario de Hugging Face `caikybaldo999`. Se trata de un modelo pequeno, de 343 millones de parámetros, construido con una arquitectura DiT (Diffusion Transformer) con flow matching rectificado, capaz de generar imágenes de 256×256 píxeles. El modelo se entrena desde cero en aproximadamente 5 horas sobre una única GPU NVIDIA RTX PRO 6000 de 96 GB, lo que lo convierte en un caso interesante de modelo de difusión de bajo coste computacional.

El modelo resuelve el problema de generar imágenes de baja resolución con un coste de entrenamiento e inferencia muy reducido, empleando un espacio latente compacto (DC-AE f32c32, 64 tokens) y un codificador de texto congelado (`google/flan-t5-base`, 96 tokens). Ademas de la generación texto-imagen, la versión actual incorpora edición de imágenes basada en instrucciones (instruction-based image editing) mediante condicionamiento en contexto, reutilizando la misma arquitectura.

Es relevante ahora porque demuestra que es posible entrenar un modelo de difusión funcional con recursos muy limitados (una sola GPU, pocas horas) y publicarlo con licencia Apache 2.0, lo que facilita la experimentación y el estudio de arquitecturas DiT a pequena escala. El repositorio tiene 722 descargas y 3 likes, y un tamano de 63,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT con rectified flow (flow matching) |
| Parametros totales | 343M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (text encoder flan-T5-base, 96 tokens; latente 64 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts en inglés funcionan mejor; captions de entrenamiento en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch; script `zyi256.py`) |

Detalles adicionales de arquitectura: hidden size 1024, profundidad 20, 16 cabezas, 2D RoPE, QK-norm, adaLN-single, SwiGLU, cross-attention, pesos EMA. Espacio latente DC-AE f32c32 (`mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers`), 32×8×8 = 64 tokens. Resolución 256×256.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura DiT (Diffusion Transformer) con rectified flow (flow matching). Consta de 20 bloques con hidden size 1024 y 16 cabezas de atención, e incorpora innovaciones como 2D RoPE, QK-norm, adaLN-single, SwiGLU, cross-attention y pesos EMA. El texto se codifica con `google/flan-t5-base` congelado (96 tokens) y la imagen se proyecta a un espacio latente compacto mediante DC-AE f32c32, produciendo 64 tokens (32×8×8). La edición de imágenes se realiza mediante condicionamiento en contexto: la imagen fuente se codifica con el DC-AE y sus 64 tokens se unen a la misma secuencia que los 64 tokens objetivo, compartiendo posiciones 2D RoPE y un embedding "source" aprendido (los únicos pesos nuevos).

El entrenamiento base utilizó 1.226.758 imágenes de `LucasFang/FLUX-Reason-6M` (quality score ≥ 7), con caption corto o largo aleatorio por muestra, 9.544 pasos con batch size 1024, optimizador AdamW con lr 0.0002, schedule coseno y bf16, sobre una única RTX PRO 6000 (~5 h incluyendo descarga, codificación y entrenamiento). El fine-tuning posterior anadio 10.233 pasos (total 42.981) con 2.139.181 imágenes nuevas del mismo dataset, lr 0.0001. La actualización v2.1 incorpora loss ponderada por region (pose detector que marca cara y manos con peso 3×, y región de texto sintético con peso 3×), mezcla de datos ampliada (imágenes de personas 2×, texto real 2×, captions de conteo 2×, 100.000 imágenes sintéticas de texto, 15% edición de imágenes), spelling de texto entre comillas, annealing con el 35% superior de imágenes por calidad en el último 30% del entrenamiento, y +15.669 pasos adicionales (334.736 imágenes FLUX-Reason, 40.000 pares de edición, 5,7 h). La edición se entreno con +18.613 pasos desde los pesos previos (40% texto-imagen / 60% edición), usando 1.000.000 de imágenes de FLUX-Reason-6M y 190.988 pares de edición de `TIGER-Lab/OmniEdit-Filtered-1.2M` (MIT), en 6,5 h. No se utilizó DPO (preference tuning) en v2.

## Capacidades

- Generación de texto a imagen a 256×256 píxeles.
- Edición de imágenes basada en instrucciones en inglés (anadir, eliminar, intercambiar, atributos, entorno y estilo), mediante `pipe.edit(...)`.
- Buen rendimiento en paisajes, interiores, comida, objetos y estilos de pintura.
- Generación de texto en imagen (signos, palabras entre comillas) con modo `spell=True` que deletrea el texto en el prompt.
- Capacidad limitada de conteo (captions de conteo en el entrenamiento).
- Soporte multilingue: no disponible; los prompts en inglés funcionan mejor.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: edición de imágenes, spelling de texto, condicionamiento en contexto.

## Casos de uso

- Generación rápida de prototipos visuales: el modelo genera imágenes de 256×256 en pocos pasos (28 pasos, cfg 4.5 en el ejemplo), adecuado para maquetas y pruebas de concepto de bajo coste.
- Edición de imágenes por instrucciones en flujos de trabajo creativos: `pipe.edit(Image.open("photo.jpg"), "make it winter, add snow")` permite modificar fotos existentes sin reentrenar, util para variaciones rápidas de estilo o entorno.
- Investigación y docencia sobre modelos de difusión: al ser un DiT de 343M entrenado en ~5 h en una sola GPU, sirve como banco de pruebas reproducible para estudiar flow matching y arquitecturas DiT.
- Generación de imágenes para datasets sinteticos: puede producir imágenes de paisajes, objetos e interiores para aumentar datasets de entrenamiento de otros modelos, con la ventaja de su licencia Apache 2.0.
- Aplicaciones de bajo consumo en entornos con recursos limitados: su tamano reducido y espacio latente compacto (64 tokens) permiten despliegue en hardware modesto comparado con modelos de difusión de miles de millones de parámetros.
- Generación de carteles y rotulos con texto: gracias al modo `spell=True` y al entrenamiento con texto sintetico, puede generar signos con palabras legibles en tamanos pequenos y medianos, util para mockups de senaletica.
- Edición de atributos y entorno en catalogos de producto: cambiar estilo, fondo o atributos de objetos en imágenes de producto mediante instrucciones, aunque con limitaciones en detalles finos por la baja resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo tiene 343M parámetros, por lo que en bf16 los pesos ocupan aproximadamente 0,7 GB, mas el text encoder flan-T5-base congelado y el DC-AE. El entrenamiento se realizo en una RTX PRO 6000 de 96 GB, pero la inferencia deberia caber en GPUs consumer.
- GPU recomendadas: no disponible; el autor solo reporta entrenamiento en 1× NVIDIA RTX PRO 6000 (96 GB).
- ¿Cabe en GPU consumer? No confirmado en la informacion, pero por tamano (343M) es plausible en GPUs con suficiente VRAM para el pipeline completo (modelo + flan-T5-base + DC-AE).
- Opciones de despliegue: script propio `zyi256.py` con `ZyiPipeline` (via `huggingface_hub`), librerias torch, diffusers, transformers, safetensors, sentencepiece. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos de difusion de tamano o tarea similar.

## Limitaciones y advertencias

- Debil en anatomia animal, caras, manos y texto legible.
- No sigue relaciones espaciales de forma fiable (por ejemplo, "a red ball on top of a blue box").
- La baja resolucion (256×256) limita ediciones finas (texto, objetos pequenos, caras).
- Las imagenes se recortan al centro para formar un cuadrado.
- Los prompts en ingles funcionan mejor; el soporte multilingue no esta confirmado.
- Riesgo de alucinacion visual y de generar contenido incorrecto en escenas complejas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar los terminos de los datasets de entrenamiento (FLUX-Reason-6M y OmniEdit-Filtered-1.2M, este ultimo MIT) y del text encoder flan-T5-base.
- Caveat para produccion: es un modelo de investigacion a pequena escala; la calidad en caras, manos y texto es limitada y no se han publicado evaluaciones cuantitativas.

## Enlaces

- Hugging Face: https://huggingface.co/caikybaldo999/zyi-256-flash
- Revision v2.1: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v2.1
- Revision v1.2-edit: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.2-edit
- Revision v1.0-base: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.0-base
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset OmniEdit-Filtered-1.2M: https://huggingface.co/datasets/TIGER-Lab/OmniEdit-Filtered-1.2M
- DC-AE f32c32: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers
- Text encoder flan-T5-base: https://huggingface.co/google/flan-t5-base
