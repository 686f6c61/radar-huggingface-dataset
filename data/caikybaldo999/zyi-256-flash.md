# caikybaldo999/zyi-256-flash

## Resumen

ZYI-256 Flash es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario independiente caikybaldo999, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo pequeño, de 343 millones de parámetros, construido con una arquitectura DiT (Diffusion Transformer) entrenada con flow matching (rectified flow), que genera imágenes de resolución fija 256×256 píxeles. Su relevancia radica en que demuestra que es posible entrenar un modelo de difusión desde cero en unas pocas horas sobre una única GPU profesional (RTX PRO 6000 de 96 GB), con un presupuesto computacional muy reducido.

El modelo utiliza un autoencoder latente DC-AE (f32c32) que comprime cada imagen a solo 64 tokens, y un codificador de texto congelado `google/flan-t5-base` que produce hasta 96 tokens de contexto textual. Esta combinación mantiene el coste de inferencia y entrenamiento muy bajo, a cambio de una calidad limitada y una resolución modesta. En su versión 2.x incorpora además edición de imágenes por instrucción (estilo InstructPix2Pix) mediante condicionamiento in-context de la imagen fuente.

La model card documenta tres fases de entrenamiento sucesivas (base, fine-tuning y edición), así como un LoRA experimental para generación de GIF de 8 fotogramas. El modelo está claramente orientado a experimentación, prototipado rápido y docencia, más que a producción con calidad fotorrealista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con rectified flow / flow matching |
| Parámetros totales | 343M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens de texto (flan-T5-base) + 64 tokens latentes de imagen |
| Tipos de cuantización | no disponible (pesos en bf16 según entrenamiento; el repo no documenta GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible oficialmente; los prompts en inglés funcionan mejor según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo PyTorch; script `zyi256.py` para carga) |

Detalles arquitectónicos adicionales documentados: hidden size 1024, profundidad 20, 16 cabezas de atención, 2D RoPE, QK-norm, adaLN-single, SwiGLU, cross-attention y pesos EMA. Espacio latente DC-AE f32c32 (`mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers`), 32×8×8 = 64 tokens. Resolución fija 256×256.

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) que opera en el espacio latente de un autoencoder DC-AE y se entrena con rectified flow (flow matching). La imagen latente se representa con solo 64 tokens (32 canales, 8×8), lo que reduce drásticamente el coste de atención. El texto se codifica con `google/flan-t5-base` congelado, limitado a 96 tokens. La atención cruzada entre tokens de texto e imagen, junto con 2D RoPE, QK-norm, adaLN-single y SwiGLU, conforma el bloque transformer repetido en 20 capas con 16 cabezas.

El entrenamiento base utilizó 1.226.758 imágenes de `LucasFang/FLUX-Reason-6M` filtradas por calidad (score ≥ 7), con pasos de 9.544 a batch size 1024, optimizador AdamW con lr 0,0002, scheduler coseno y precisión bf16, todo sobre una única RTX PRO 6000 (~5 h incluyendo descarga y codificación). El fine-tuning posterior añadió 10.233 pasos (total 42.981) con 2.139.181 imágenes nuevas del mismo dataset a lr 0,0001. La fase de edición añadió 18.613 pasos con mezcla 40% texto-a-imagen / 60% edición, usando 1.000.000 de imágenes de FLUX-Reason-6M y 190.988 pares de edición de `TIGER-Lab/OmniEdit-Filtered-1.2M` (MIT). La versión v2.1 incorpora pérdida ponderada por región (3× en cara y manos detectadas por pose detector, 3× en región de texto sintético), mezcla de datos con imágenes de personas y texto real al doble de peso, 100.000 imágenes sintéticas de texto, 15% de edición, y annealing final con el 35% superior por calidad. No se empleó DPO ni RLHF según la model card.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución fija 256×256.
- Edición de imágenes por instrucción en inglés (añadir, quitar, intercambiar, cambiar atributos, entorno y estilo), con condicionamiento in-context de la imagen fuente.
- Renders aceptables de paisajes, interiores, comida, objetos y estilos pictóricos.
- Generación de texto legible en imágenes mediante prompt con deletreo explícito (`"OPEN" (O P E N)`) y parámetro `spell=True`.
- Control de generación por pasos de muestreo y escala CFG (por ejemplo, `steps=28`, `cfg=4.5`).
- Generación por lotes con semilla (`n`, `seed`) para reproducibilidad.
- LoRA experimental para generación de GIF de 8 fotogramas a 256×256 (previsión del siguiente cuadro).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo más allá del LoRA experimental de GIF.

## Casos de uso

- Prototipado rápido de pipelines texto-a-imagen: el modelo se entrena e infiere en una sola GPU, lo que permite iterar sobre arquitecturas DiT y esquemas de flow matching sin grandes presupuestos de cómputo.
- Docencia e investigación en difusión: su tamaño (343M) y su código autocontenido (`zyi256.py`) lo hacen adecuado para estudiar el efecto de DC-AE, 2D RoPE, adaLN-single y flow matching en un entorno controlado.
- Generación de miniaturas y avatares de baja resolución: para iconos, placeholders o imágenes de 256×256 en interfaces y prototipos donde no se requiere fotorrealismo.
- Edición rápida de imágenes por instrucción: añadir nieve, cambiar el entorno o el estilo de una foto con `pipe.edit(...)` en flujos de previsualización o pruebas de concepto.
- Generación de texto en carteles sintéticos: con `spell=True` y prompts que deletrean la palabra, útil para prototipos de señalética o mockups de baja resolución.
- Experimentación con GIFs: el LoRA `gif/inference.py` permite generar animaciones de 8 fotogramas para pruebas de concepto de vídeo generativo a baja resolución.
- Aumento de datos sintéticos: generar imágenes 256×256 controladas por caption para datasets de entrenamiento de clasificadores o detectores en dominios acotados (paisajes, objetos, comida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: 1× NVIDIA RTX PRO 6000 (96 GB) para todas las fases (base ~5 h, fine-tuning ~5,7 h, edición ~6,5 h).
- VRAM de inferencia: no disponible de forma explícita; con 343M parámetros en bf16 los pesos ocupan aproximadamente 0,7 GB, más el codificador de texto flan-T5-base (~0,5 GB en bf16) y el DC-AE. Debería caber holgadamente en GPUs consumer de 8 GB o más, aunque el autor no publica cifras medidas.
- GPU recomendadas: cualquier GPU con soporte bf16 y al menos 8 GB de VRAM para inferencia; RTX PRO 6000 o A100/H100 para reentrenamiento.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 (8-12 GB) y superiores, aunque no hay medición oficial.
- Opciones de despliegue: script propio `zyi256.py` sobre PyTorch, `diffusers` y `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLM, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto texto | Licencia | Edición por instrucción |
|---|---|---|---|---|---|
| ZYI-256 Flash | 343M | 256×256 | 96 tokens (flan-T5-base) | Apache 2.0 | Sí (v2.x) |
| Stable Diffusion 1.5 | ~860M UNet | 512×512 | 77 tokens (CLIP) | CreativeML OpenRAIL-M | No nativa |
| SDXL-Turbo | ~2,6B | 512×512 | 77 tokens (CLIP) | Stability AI Community | No nativa |
| Sana (mit-han-lab) | ~0,6B | 1024×1024 | T5 | Apache 2.0 (según variante) | No nativa |

La comparación es orientativa: ZYI-256 Flash es sustancialmente más pequeño y de menor resolución que SD 1.5 o SDXL-Turbo, y su ventana de texto es mayor que la de CLIP (96 vs 77 tokens) pero con un encoder más ligero. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Resolución fija de 256×256: insuficiente para producción fotorrealista o impresión.
- Anatomía animal, caras, manos y texto legible son puntos débiles reconocidos por el autor.
- No sigue relaciones espaciales de forma fiable (por ejemplo, "una bola roja encima de una caja azul").
- Los prompts en inglés funcionan mejor; el multilingüismo no está garantizado ni documentado.
- Riesgo de alucinación visual y de artefactos en detalles finos, especialmente en edición (texto, objetos pequeños, caras).
- La edición recorta las imágenes a cuadrado, lo que puede eliminar información del original.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no documenta evaluación de sesgos.
- Repo de 63,2 GB: incluye pesos de varias revisiones y material auxiliar; conviene descargar solo la revisión necesaria.
- Modelo de autor individual, con poca validación externa (485 descargas, 3 likes en el momento de la consulta): no recomendado como dependencia crítica en producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/caikybaldo999/zyi-256-flash
- Revisión base v1.0: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.0-base
- Revisión edición v1.2-edit: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v1.2-edit
- Revisión v2.1: https://huggingface.co/caikybaldo999/zyi-256-flash/tree/v2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de edición: https://huggingface.co/datasets/TIGER-Lab/OmniEdit-Filtered-1.2M
- Autoencoder DC-AE: https://huggingface.co/mit-han-lab/dc-ae-f32c32-sana-1.0-diffusers
- Codificador de texto: https://huggingface.co/google/flan-t5-base
