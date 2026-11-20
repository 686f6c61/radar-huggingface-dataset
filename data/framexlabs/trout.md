# FrameXlabs/Trout

## Resumen

Trout es un modelo de difusión enmascarada (masked diffusion) de 47,6 millones de parámetros desarrollado por FrameXlabs para la generación de sprites de pixel art de 16×16 píxeles a partir de descripciones textuales. A diferencia de los modelos de difusión latente convencionales, Trout no emplea VAE ni espacio latente: trata cada sprite como una "frase" de 256 tokens sobre una paleta aprendida de 512 colores (donde el token 0 representa transparencia) y desenmascara los 256 píxeles en paralelo en aproximadamente 16 pasos, condicionado por el codificador de texto congelado `openai/clip-vit-base-patch32`.

El modelo sigue la arquitectura de Tessera-small de Jagrat Patel (TheJagStudio) y fue reimplementado y entrenado desde cero en un entorno de solo 2 vCPU y 4 GB de RAM, en fp32 sobre CPU. Esta restricción de cómputo —aproximadamente cuatro órdenes de magnitud inferior a la del modelo de referencia— se refleja en unas métricas notablemente más débiles que las de Tessera-small, algo que el propio autor documenta de forma explícita.

Su relevancia radica en dos factores: por un lado, demuestra que es posible entrenar un modelo de difusión discreta funcional para una tarea visual acotada con recursos mínimos; por otro, su implementación en un único fichero (`trout.py`) y su licencia Apache-2.0 lo convierten en una referencia didáctica útil para estudiar difusión enmascarada, decodificación paralela y condicionamiento textual sin infraestructura especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional en reloj de arena (hourglass) conjunto de texto y píxeles; 2 + 8 + 2 bloques, núcleo con patch-merge 2×2, anchura 512, 8 cabezas, QK-RMSNorm, RoPE axial 2D (θ=100), Conv-SwiGLU, adaLN-single, 4 registros, self-conditioning, pos-emb aprendida |
| Parametros totales | 47.597.568 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens de píxel (sprite 16×16) + 24 tokens de texto |
| Tipos de cuantizacion | Pesos exportados en fp16; entrenamiento en fp32; no se documentan otras cuantizaciones (GGUF, int8, etc.) |
| Idiomas soportados | No disponible (condicionamiento vía CLIP ViT-B/32, sin lista explícita de idiomas) |
| Licencia | Apache-2.0 (pesos y código); el codificador CLIP conserva su licencia MIT y no se redistribuye |
| Formato de pesos | PyTorch (`trout-fp16.pt`), checkpoint único con pesos, configuración, paleta e identificador del codificador de texto |

## Arquitectura y entrenamiento

Trout es un transformer bidireccional con topología de reloj de arena (hourglass) que procesa conjuntamente las representaciones de texto y de píxeles. El núcleo aplica patch-merge 2×2 para reducir la resolución espacial en las capas intermedias, con 2 bloques de entrada, 8 centrales y 2 de salida, anchura 512 y 8 cabezas de atención. Incorpora QK-RMSNorm, RoPE axial 2D con θ=100, activaciones Conv-SwiGLU, modulación adaLN-single (herencia de DiT y PixArt-α), cuatro tokens de registro (estilo ViT con registros) y self-conditioning al estilo Analog Bits. El condicionamiento textual proviene del torre de texto congelada de `openai/clip-vit-base-patch32`, limitada a 24 tokens.

El entrenamiento emplea el objetivo de difusión enmascarada con estado absorbente, con un schedule de máscara coseno, muestreo estratificado del instante t, máscaras tipo blob (25%), suavizado de etiquetas perceptual en OKLab (ε=0,1; τ=0,05), dropout de CFG del 10% y aumento por volteo horizontal. El vocabulario de 512 colores se construyó mediante k-means en OKLab ponderado por frecuencia (ΔE medio de 0,0099) y ajustado a los colores del dataset. El optimizador combina Muon (Newton-Schulz por lotes, escalado RMS 0,2·√max(m,n)) para matrices ocultas con AdamW para el resto, con schedule Warmup-Stable-Decay y EMA. El muestreo usa desenmascaramiento paralelo ordenado por confianza con CFG, elección con Gumbel annealing (T=2), NMS espacial 3×3 con umbral 0,9 y realimentación de self-conditioning; admite inpainting.

La brecha de cómputo es el dato central del entrenamiento: Tessera-small se entrenó con 82.342 pasos × 512 sprites en una RTX PRO 6000 (≈5,5 h), mientras que Trout se entrenó desde cero con 2.400 pasos × 8 sprites (≈19.000 vistas de sprite de un subconjunto de 60.000 sprites del dataset Pixel Art Atlas 1.4M) en CPU fp32. La receta se siguió fielmente, pero el presupuesto es aproximadamente cuatro órdenes de magnitud menor.

## Capacidades

- Generación de imágenes de pixel art de 16×16 píxeles condicionada por texto, con paleta de 512 colores y transparencia (token 0).
- Generación paralela: desenmascara los 256 píxeles en aproximadamente 16 pasos, sin autoregresión ni VAE.
- Inpainting: el muestreador admite la reconstrucción de regiones enmascaradas de un sprite.
- Condicionamiento textual mediante CLIP ViT-B/32 con ventana de 24 tokens.
- Control de fidelidad al prompt mediante classifier-free guidance (cfg_scale configurable; el showcase usa 3,0).
- Generación de múltiples muestras por prompt con semilla controlable (`torch.Generator`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.
- No se documentan capacidades multilingües explícitas; la cobertura idiomática queda delegada al codificador CLIP.

## Casos de uso

- Generación de assets para videojuegos indie: producción de sprites de 16×16 a partir de descripciones textuales para prototipado rápido de personajes, objetos y tilesets, con salida directamente utilizable en motores 2D tras posprocesado.
- Creación de conjuntos de sprites coherentes: dado que la paleta es fija y compartida (512 colores), las muestras de un mismo proyecto mantienen consistencia cromática, lo que simplifica la integración en un atlas de sprites.
- Edición e inpainting de sprites existentes: el muestreador permite regenerar regiones concretas de un sprite (por ejemplo, cambiar un casco o un arma) manteniendo el resto intacto.
- Docencia e investigación en difusión discreta: el código en un único fichero (`trout.py`) y la disponibilidad de `metrics.jsonl` permiten reproducir el entrenamiento y estudiar el efecto del presupuesto de cómputo sobre la calidad.
- Prototipado de interfaces y mockups: generación de iconos pixelados para maquetas de aplicaciones retro o demos de estilo 8/16 bits.
- Experimentación con decodificación paralela: el esquema de desenmascaramiento ordenado por confianza con NMS espacial y Gumbel annealing sirve como banco de pruebas para comparar estrategias de muestreo en modelos de difusión enmascarada.
- Generación de datos sintéticos de pixel art para aumento de datasets: útil para preentrenar clasificadores o detectores de estilo, siempre que se valide la calidad de las muestras (ver limitaciones).

## Benchmarks y rendimiento

| Metrica | Trout (esta ejecucion) | Tessera-small (referencia) |
|---|---|---|
| NLL de validacion | 2,176 nats/pixel (perplejidad 8,81 sobre 512) | 0,859 nats/pixel (perplejidad 2,36) |
| Precision de validacion | 54,6% de píxeles enmascarados | 78,8% |
| CLIP score (ViT-B/32) | 0,23 generado vs 0,26 sprites reales | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que la tarea del modelo es la generación de imágenes y no el procesamiento de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 para los 47,6 M de parámetros del modelo; hay que sumar el codificador CLIP ViT-B/32 congelado (≈150 M de parámetros, unos 0,3 GB en fp16).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo se entrenó y se ejecuta en CPU, por lo que una GPU consumer básica es suficiente.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: el autor proporciona `trout.py` con funciones `load_model_from_checkpoint`, `FrozenTextEncoder`, `sample`, `tokens_to_images` y `make_grid`, pensadas para ejecución directa en PyTorch (CPU o GPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje autoregresivo.
- Latencia y throughput: no disponibles de forma explícita; el muestreo requiere 16 pasos de desenmascaramiento paralelo más la codificación CLIP, lo que en CPU resulta viable para lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas |
|---|---|---|---|---|---|
| Trout (FrameXlabs) | 47,6 M | 256 tokens de pixel + 24 de texto | Pixel art 16×16 condicionado por texto | Apache-2.0 | NLL 2,176; precision 54,6%; CLIP 0,23 |
| Tessera-small (TheJagStudio) | 47,6 M | No disponible | Pixel art condicionado por texto | No disponible en la informacion | NLL 0,859; precision 78,8% |
| MaskGIT (referencia academica) | No disponible | No disponible | Generacion de imagenes por enmascaramiento | No disponible | No disponible |

La comparación directa más relevante es con Tessera-small, del que Trout reimplementa la arquitectura: misma escala de parámetros, pero con métricas sustancialmente peores por la brecha de cómputo de entrenamiento. No se dispone de datos de otros modelos comparables de pixel art condicionado por texto en la información proporcionada.

## Limitaciones y advertencias

- Calidad limitada por presupuesto de cómputo: el NLL de validación (2,176 nats/pixel) y la precisión (54,6%) son claramente inferiores a los de Tessera-small, lo que se traduce en sprites menos fieles al prompt y con más artefactos.
- Riesgo de alucinación visual: el CLIP score de 0,23 frente a 0,26 de sprites reales indica una alineación texto-imagen moderada; es esperable que los prompts complejos o poco representados en el dataset generen resultados divergentes.
- Sesgos del dataset: entrenado sobre un subconjunto de 60.000 sprites de Pixel Art Atlas 1.4M (CC0), por lo que hereda los sesgos estilísticos y temáticos de dicha colección.
- Dominio muy restringido: solo genera sprites de 16×16 píxeles con la paleta fija de 512 colores; no es un modelo de propósito general ni escalable a otras resoluciones sin reentrenamiento.
- Ventana de texto muy corta: 24 tokens de CLIP limitan la complejidad de las descripciones; prompts largos se truncan.
- Idiomas no documentados: no se especifica cobertura multilingüe; el rendimiento con prompts en castellano no está garantizado.
- Licencia: Apache-2.0 permite uso comercial de pesos y código, pero el codificador CLIP subyacente conserva su licencia MIT y no se redistribuye con el modelo, por lo que debe obtenerse por separado.
- No apto para tareas de lenguaje: carece de generación de texto, razonamiento, código, tool calling o capacidades de agente.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en noviembre de 2026; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrameXlabs/Trout
- Tessera-small (referencia arquitectónica): https://huggingface.co/thejagstudio/tessera-small
- Dataset Pixel Art Atlas 1.4M: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Codificador de texto CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Sahoo et al., *Simple and Effective Masked Diffusion Language Models* (NeurIPS 2024): https://arxiv.org/abs/2406.07524
- Shi et al., *Simplified and Generalized Masked Diffusion for Discrete Data* (NeurIPS 2024): https://arxiv.org/abs/2406.04329
- Chang et al., *MaskGIT: Masked Generative Image Transformer* (CVPR 2022): https://arxiv.org/abs/2202.04200
- Blecher et al., *Nougat* (hourglass transformer): https://arxiv.org/abs/2308.13418
- Peebles & Xie, *DiT* (adaLN): https://arxiv.org/abs/2212.09748
- Chen, *Analog Bits* (self-conditioning): https://arxiv.org/abs/2208.04202
- Jordan et al., *Muon*: https://arxiv.org/abs/2502.16982
- Moonshot, *Muon is Scalable*: https://arxiv.org/abs/2508.02535
