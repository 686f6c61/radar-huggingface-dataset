# DAGroup-PKU/G-star

## Resumen

G-star es un modelo generativo multimodal desarrollado por DAGroup-PKU (Universidad de Pekín) que combina un backbone de lenguaje Qwen3-8B con un tokenizador visual discreto y un cabezal de imagen denominado DSpark. El modelo aborda la generación de imágenes texto-a-imagen y la edición de imágenes basada en instrucciones, tratando la imagen como una secuencia de tokens visuales discretos que el LLM predice de forma autorregresiva. Su planteamiento se aleja de los modelos de difusión puros y apuesta por una arquitectura omni que unifica texto e imagen en un mismo espacio de tokens.

El repositorio incluye varios componentes empaquetados: el checkpoint principal de generación (Qwen3-8B más puente de embeddings visuales y cabezal DSpark), un modelo SFT de edición de imágenes (`gstar-edit/`), un tokenizador visual g16 con 16 codebooks de 16.384 entradas y downsampling 32x, y varios refinadores (SR2x estándar y de un solo paso). Además se distribuye una variante ligera, G-STAR-Flash-1.7B, basada en Qwen3-1.7B con compresión 64x, pensada para inferencia más económica.

La relevancia actual del modelo reside en su enfoque de generación visual autorregresiva sobre un LLM de propósito general, lo que permite reutilizar infraestructura de transformers y FlashAttention, y en la disponibilidad de pesos completos bajo licencia MIT. El checkpoint cuenta con aproximadamente 9.640 millones de parámetros totales y un repositorio de 120,6 GB que incluye todos los componentes auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (Qwen3-8B) con tokenizador visual discreto y cabezal de imagen DSpark |
| Parametros totales | 9.638.851.856 (checkpoint principal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los ejemplos incluyen prompts en inglés y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado `custom_code` y `trust_remote_code`) |

## Arquitectura y entrenamiento

G-star emplea un backbone de lenguaje Qwen3-8B al que se añade un puente de embeddings visuales y un cabezal de imagen DSpark. La imagen se representa mediante el tokenizador visual g16, que la codifica en una rejilla de 32x32 códigos con 16 codebooks de 16.384 entradas y un factor de downsampling de 32x. El LLM genera de forma autorregresiva esa rejilla de códigos, que posteriormente se reconstruye y refina hasta una imagen nativa de 2048x2048 mediante el refinador SR2x (52 pasos por defecto) o su variante de un solo paso. La variante Flash-1.7B usa Qwen3-1.7B con compresión 64x y 32 grupos DSpark, apoyada en un refinador g8 independiente e incompatible con el g16.

El repositorio distingue entre el checkpoint de generación con formato de prompt de pretrain (sin tokens de rol) y el modelo `gstar-edit/` afinado por SFT para edición por instrucciones, que incluye `role_config.json` con tokens de rol y parámetros separados de guiado textual (`--cfg`) y de imagen (`--image-cfg`). No se detallan en la model card el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El entorno verificado es Python 3.12, PyTorch 2.6.0 con CUDA 12.4, Transformers 4.57.0 y FlashAttention 2.7.4.post1 sobre GPUs NVIDIA H100 de 80 GB, con un worker de inferencia por GPU.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts en lenguaje natural, con salida nativa de 2048x2048 y opción de reescalado a 1024x1024 mediante Lanczos.
- Edición de imágenes basada en instrucciones (modelo `gstar-edit/`), con guiado separado de texto e imagen.
- Generación autorregresiva de tokens visuales discretos sobre un backbone LLM, lo que permite control fino mediante parámetros de muestreo (`top-k`, `top-p`, `temperature`, `cfg`).
- Variante ligera G-STAR-Flash-1.7B con compresión 64x para escenarios con menos recursos.
- Refinado de imagen con SR2x en versión estándar (52 pasos) y de un solo paso (1 evaluación DiT).
- Soporte de semilla (`seed`) para reproducibilidad aproximada, con la advertencia de que semillas idénticas no garantizan imágenes idénticas entre hardware distinto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles de forma explícita; los ejemplos de la model card usan inglés y chino.
- Capacidades de audio o visión de entrada más allá de la edición de imagen: no disponibles.

## Casos de uso

- Generación de ilustraciones y material gráfico: el modelo produce imágenes de 2048x2048 a partir de prompts descriptivos, adecuado para prototipado rápido de conceptos visuales y moodboards en estudios de diseño.
- Edición fotográfica por instrucciones: con `gstar-edit/` se puede modificar una imagen de origen de 1024x1024 mediante una instrucción textual (por ejemplo, cambiar el fondo), útil en flujos de retoque y postproducción.
- Creación de assets para videojuegos y entornos 3D: la generación de texturas y conceptos visuales con control de semilla y parámetros de muestreo permite iterar variantes de un mismo estilo.
- Investigación en generación visual autorregresiva: al apoyarse en un LLM Qwen3 y en un tokenizador visual discreto, sirve como base para experimentos sobre tokenización de imagen y modelado multimodal unificado.
- Despliegue en entornos con GPUs de gran memoria: el pipeline verificado sobre H100 de 80 GB con FlashAttention lo hace apto para servicios internos de generación de imágenes en lote.
- Prototipado con recursos limitados: la variante G-STAR-Flash-1.7B con compresión 64x y refinador g8 permite experimentar con menor coste computacional que el checkpoint principal.
- Generación condicionada por prompts reescritos: la model card indica que los prompts se usan tal cual, de modo que se puede integrar un sistema externo de reescritura de prompts para mejorar el control semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como FID, CLIP score, MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos generativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint principal ronda los 9.640 millones de parámetros en safetensors, lo que en precisión completa implica un consumo de pesos del orden de decenas de GB, a lo que se suman el tokenizador visual y el refinador.
- GPU recomendadas: NVIDIA H100 de 80 GB es el entorno verificado en la model card; cada worker de inferencia usa una sola GPU.
- Cabe en consumer GPU: no disponible; no se documenta funcionamiento en GPUs de consumo como RTX 4090, y el tamaño del repositorio (120,6 GB) y la combinación de backbone, tokenizador y refinador sugieren requisitos elevados.
- Opciones de despliegue: inferencia local mediante el paquete `gstar` incluido en el repositorio (`python -m gstar.infer`), con PyTorch 2.6.0, Transformers 4.57.0, diffusers 0.38.0, accelerate 1.12.0 y FlashAttention 2.7.4.post1. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; la model card solo indica que el refinador SR2x estándar usa 52 pasos por defecto y que la variante de un solo paso requiere una única evaluación del DiT, lo que reduce el coste de refinado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G-star | ~9,64 B | no disponible | Generación y edición de imagen autorregresiva sobre Qwen3-8B | MIT | Pesos en Hugging Face |
| G-STAR-Flash-1.7B | no disponible (basado en Qwen3-1.7B) | no disponible | Variante ligera con compresión 64x | MIT (mismo repositorio) | Incluido en el repositorio |
| Alternativas de difusión texto-a-imagen | no disponible | no disponible | Difusión latente | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los detalles finos de las imágenes generadas pueden contener errores de generación, según advierte la propia model card.
- Semillas idénticas no garantizan imágenes idénticas entre hardware distinto, lo que limita la reproducibilidad exacta en producción.
- El checkpoint principal usa formato de prompt de pretrain sin tokens de rol; mezclarlo con el formato SFT de `gstar-edit/` o de la variante Flash puede degradar los resultados.
- Los tokenizadores y refinadores g8 y g16 son incompatibles entre sí; usar un refinador no emparejado con su checkpoint rompe la reconstrucción.
- La corrección opcional de color por wavelets debe desactivarse (`OMNI_DISABLE_WAVELET_COLOR_FIX=1`) para coincidir con la configuración verificada.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas específicas.
- La licencia MIT permite uso comercial, pero el modelo depende de Qwen3-8B y de componentes de terceros (diffusers, FlashAttention) cuyas licencias deben verificarse por separado.
- El tamaño del repositorio (120,6 GB) y la necesidad de descargar todos los componentes complican el despliegue en entornos con almacenamiento o ancho de banda limitados.
- No se documentan requisitos de VRAM ni rendimiento en GPUs de consumo, por lo que la viabilidad en hardware no profesional es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/DAGroup-PKU/G-star
- Repositorio GitHub (referenciado en la model card): https://github.com/DAGroup-PKU/G-STAR
- Documentación de instalación y uso: https://github.com/DAGroup-PKU/G-STAR/blob/main/docs/installation-and-usage.md
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
