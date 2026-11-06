# cpral/IMG-50M

## Resumen

IMG-50M es un modelo de generación de imágenes texto-a-imagen de 50,4 millones de parámetros desarrollado por el usuario cpral y publicado en Hugging Face. Se trata de una reproducción desde cero de AuroraIMG2-50M-Preview, un modelo de la familia AuroraIMG2, con la misma arquitectura y nombres de parámetros, pero con un esquema de entrenamiento distinto basado en DiLoCo con optimizador Muon. Genera imágenes de 256x256 píxeles a partir de descripciones textuales en inglés, empleando un transformer de difusión con flow matching rectificado.

El modelo combina un denoiser DiT de 50,4M de parámetros con un codificador de texto de 12,6M entrenado de forma conjunta, y utiliza el decoder congelado FLUX.2-small para reconstruir las imágenes finales a partir de latentes de 128x16x16. Su relevancia radica en que demuestra que es posible entrenar un modelo texto-a-imagen funcional desde cero con 8 GPUs de consumo (RTX 3090 Ti) en aproximadamente 5 horas, lo que lo convierte en un caso de estudio interesante para investigación en eficiencia de entrenamiento y arquitecturas de difusión compactas.

La licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo solo soporta inglés y su resolución está limitada a 256x256, lo que restringe sus aplicaciones prácticas a prototipado, investigación y docencia más que a producción de imágenes de alta calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching rectificado; denoiser de 8 bloques, ancho 640, 10 cabezas (dim 64), sin patchify (un token por píxel del latente 16x16); self-attention con RoPE 2D y QK-norm, cross-attention a tokens de texto, MLP SwiGLU; condicionamiento de timestep con adaLN-single (PixArt) |
| Parámetros totales | 50.433.664 (denoiser 50,4M + codificador de texto 12,6M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 62 tokens de texto (+BOS/EOS) para el codificador; latente de 128x16x16 |
| Tipos de cuantización | No disponible (pesos en safetensors, probablemente bf16/fp16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

El denoiser es un transformer de difusión de 50,4M de parámetros con 8 bloques de ancho 640 y 10 cabezas de atención de dimensión 64. No aplica patchify: cada token corresponde a un píxel del latente de 16x16, lo que da 256 tokens por imagen. Cada bloque incluye self-attention con RoPE 2D y QK-norm, cross-attention hacia los tokens de texto y un MLP SwiGLU. El timestep de difusión se condiciona mediante la técnica adaLN-single de PixArt con puertas inicializadas a cero. El codificador de texto es un transformer pre-norm de 6 capas, ancho 384, con GQA (6 cabezas de query, 2 de KV), RoPE 1D, SwiGLU y RMSNorm, entrenado conjuntamente con el denoiser y truncado a 62 tokens. El decoder FLUX.2-small permanece congelado y transforma los latentes 128x16x16 en imágenes de 256x256.

El entrenamiento usó el dataset QLNI/FLUX-Reason-6M-flux2-latents con 5,88 millones de imágenes (subconjuntos de estética, imaginativo y texto), una caption aleatoria por imagen y paso, durante 247.805 pasos con batch 256 (63,4M muestras, ~10,8 épocas). El objetivo es rectified flow con `z_t = (1−t)·x + t·ε`, target de velocidad `ε − x`, MSE y `t ~ logit-normal(0,1)`; el 10% de las captions se sustituyen por un prompt nulo aprendido para classifier-free guidance. Se añade una pérdida auxiliar de masked language modelling sobre el codificador de texto (peso 0,05, cada 4 pasos, 15% de enmascaramiento, cabeza atada al embedding de tokens). El hardware fueron 8 RTX 3090 Ti en bf16 con `torch.compile`, alcanzando ~3.400 img/s durante ~5 horas.

La innovación principal es el uso de MuLoCo (DiLoCo con optimizador interno Muon): cada GPU entrena su propia réplica con batch 32 sin comunicación de gradientes, y cada 16 pasos se promedian las 8 réplicas con learning rate externo 1,0 y momentum 0 (promedio simple de pesos), enviado como all-reduce bf16 de los deltas. Muon se aplica a todas las matrices de pesos ocultas (lr 3,5e-3, momentum Nesterov 0,95, 5 pasos de Newton-Schulz, weight decay 0,01), mientras que AdamW se usa para embeddings, proyecciones de entrada/salida, MLP de tiempo, normas, tablas de modulación y sesgos. Los pesos liberados son WSM (Warmup-Stable-Merge): promedio uniforme de los últimos 4 checkpoints, cubriendo el 12% final del entrenamiento.

## Capacidades

- Generación de imágenes texto-a-imagen a 256x256 píxeles a partir de descripciones en inglés.
- Modelado de escenas con composición razonable: objetos, paisajes, iluminación y estilos artísticos (fotografía, acuarela, arte digital).
- Generación de texto renderizado en imágenes (prompts como "a street sign that says OPEN in neon letters"), aunque con limitaciones típicas de modelos pequeños.
- Control de generación mediante seed, pasos de muestreo Euler y escala CFG (los ejemplos usan seed 0, 50 pasos, CFG 3,0).
- Soporte de classifier-free guidance mediante prompt nulo aprendido.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No soporta visión, audio ni otros modos de entrada distintos del texto.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Prototipado rápido de pipelines texto-a-imagen: el modelo cabe en una GPU de consumo y permite validar arquitecturas DiT y flujos de difusión antes de escalar a modelos mayores, gracias a sus 50,4M de parámetros y su licencia Apache 2.0.
- Investigación en entrenamiento distribuido eficiente: reproduce el esquema MuLoCo con Muon y checkpoint averaging, sirviendo como referencia para estudiar el impacto de la comunicación de gradientes en GPUs con PCIe limitado.
- Docencia y divulgación: su tamaño reducido y su entrenamiento en 5 horas con 8 RTX 3090 Ti lo hacen adecuado para demostrar el funcionamiento interno de un diffusion transformer en cursos de machine learning.
- Generación de imágenes de baja resolución para maquetas y wireframes: útil en diseño de interfaces o documentos donde se necesitan placeholders visuales rápidos a 256x256 sin depender de APIs externas.
- Experimentación con decodificadores congelados: permite estudiar cómo el decoder FLUX.2-small reconstruye latentes generados por un denoiser entrenado desde cero, útil para investigación en compresión latente.
- Pruebas de sesgo y alineación en modelos generativos pequeños: su licencia abierta y su tamaño permiten auditar comportamientos y comparar con modelos mayores en condiciones controladas.
- Generación de variaciones controladas por seed y CFG: adecuado para estudios de reproducibilidad y sensibilidad a hiperparámetros de muestreo en modelos de difusión compactos.

## Benchmarks y rendimiento

| Modelo | val/loss (velocity MSE) |
|---|---|
| AuroraIMG2-50M-Preview (pesos liberados, EMA, cosine decay) | 0,6929 |
| IMG-50M (WSM, promedio de los últimos 12% checkpoints) | 0,7044 |
| IMG-50M (pesos EMA) | 0,7030 |
| IMG-50M (pesos regulares en el último paso) | 0,7105 |

La evaluación se realizó sobre 4096 imágenes de validación (último shard de cada uno de los 4 subconjuntos del dataset, primera caption), con el mismo ruido y `t ~ logit-normal(0,1)` para ambos modelos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bf16 para los 50,4M de parámetros del denoiser y 12,6M del codificador; el decoder FLUX.2-small congelado añade requisitos adicionales no especificados, pero el repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el entrenamiento se realizó con 8 RTX 3090 Ti (24 GB), pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida, aunque con latencia mayor.
- Opciones de despliegue: diffusers con el pipeline `AuroraIMG2Pipeline` (custom_code); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusión.
- Latencia y throughput estimados: no disponibles para inferencia; el entrenamiento alcanzó ~3.400 img/s con 8 GPUs en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IMG-50M | 50,4M (denoiser) + 12,6M (text encoder) | 62 tokens | 256x256 | Apache 2.0 | Hugging Face (cpral/IMG-50M) |
| AuroraIMG2-50M-Preview | 50,4M (denoiser) + 12,6M (text encoder) | 62 tokens | 256x256 | No disponible en la información | Hugging Face (AuroraAI-Research/AuroraIMG2-50M-Preview) |
| FLUX.2-small decoder | No disponible | No aplica (decoder) | No disponible | No disponible en la información | Hugging Face (black-forest-labs/FLUX.2-small-decoder) |

No se dispone de datos de benchmarks comparativos con modelos de mayor tamaño como Stable Diffusion o FLUX, por lo que la comparación se limita a la arquitectura y al loss de validación frente a AuroraIMG2-50M-Preview.

## Limitaciones y advertencias

- Solo soporta inglés; los prompts en otros idiomas probablemente produzcan resultados degradados o incoherentes.
- Resolución limitada a 256x256, insuficiente para la mayoría de aplicaciones de producción que requieren 512x512 o superior.
- Riesgo de alucinación visual: al ser un modelo pequeño, puede generar objetos deformes, texto ilegible o composiciones incorrectas, especialmente en escenas complejas.
- Sesgos conocidos: el dataset FLUX-Reason-6M puede contener sesgos de representación demográfica y cultural; no se documentan análisis de sesgo específicos.
- Licencia Apache 2.0 permite uso comercial, pero el decoder FLUX.2-small tiene su propia licencia que debe verificarse por separado antes de uso comercial.
- El modelo es una reproducción con pérdida de validación ligeramente superior (0,7044 frente a 0,6929) al modelo original AuroraIMG2-50M-Preview, atribuible al learning rate constante en lugar de cosine decay.
- No se documentan cuantizaciones oficiales ni soporte para GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.
- El uso de `custom_code` requiere confiar en el código del repositorio al cargar el pipeline, con el riesgo de seguridad asociado.

## Enlaces

- Hugging Face: https://huggingface.co/cpral/IMG-50M
- Modelo original AuroraIMG2-50M-Preview: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Decoder FLUX.2-small: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Paper MuLoCo: https://arxiv.org/abs/2505.23725
- Paper DiLoCo: https://arxiv.org/abs/2311.08105
- Paper WSM (Warmup-Stable-Merge): https://arxiv.org/abs/2507.17634
- Blog de Muon: https://kellerjordan.github.io/posts/muon/
