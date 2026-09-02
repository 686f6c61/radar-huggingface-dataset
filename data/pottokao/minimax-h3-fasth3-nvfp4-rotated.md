# pottokao/MiniMax-H3-FastH3-NVFP4-rotated

## Resumen

El modelo `pottokao/MiniMax-H3-FastH3-NVFP4-rotated` es una cuantización NVFP4 rotada (Rotated-NVFP4) de **FastH3**, la destilación de 4 pasos con atención dispersa VSA de MiniMax-H3, el modelo omni-modal de generación de video y audio sincronizado desarrollado por MiniMax. El autor, pottokao, ha aplicado una rotación Hadamard por bloques antes de la cuantización FP4 para preservar el contraste de alta frecuencia, lo que permite que el modelo cuantizado sea más nítido que la versión bf16 a igual número de pasos.

El objetivo principal de esta ficha es ofrecer una alternativa viable para ejecutar generación de video de alta calidad en tarjetas gráficas de consumo con 16 GB de VRAM. La variante T1 (~10,8 GB) cabe completamente residente en una GPU Blackwell de 16 GB sin necesidad de offload a memoria del sistema, algo imposible con las versiones fp8 o bf16 (~66 GB). El modelo genera clips de aproximadamente 5 segundos a resolución 768p en solo 4 pasos de denoising, con audio sincronizado preservado.

Es relevante ahora porque democratiza la generación de video multimodal de alta calidad, reduciendo los requisitos de hardware de servidores con múltiples GPU a una sola tarjeta de consumo. Además, al ser un modelo de código abierto con licencia comunitaria, permite su integración en flujos de trabajo locales y personalizados. La arquitectura subyacente es un Diffusion Transformer (DiT) que combina generación de video y audio, y el modelo cuantizado se distribuye en formato safetensors junto con un nodo específico para ComfyUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para video y audio sincronizado, destilado a 4 pasos (FastH3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 rotado con Hadamard por bloques) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community |
| Formato de pesos | safetensors (transformer_blocks.safetensors + rotation.safetensors) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un DiT omni-modal que procesa texto, imágenes, video y audio de forma conjunta. FastH3, desarrollado por FastVideo, es una destilación que reduce el número de pasos de denoise de ~20-30 a 4, utilizando atención dispersa VSA (Variable Sparse Attention) para acelerar el proceso manteniendo una calidad aceptable. Sobre esta base, pottokao aplica una cuantización NVFP4 con rotación Hadamard por bloques, una técnica que transforma los pesos antes de cuantizarlos a FP4 para distribuir mejor los valores y reducir el error de cuantización en componentes de alta frecuencia. Esto permite que el modelo cuantizado conserve detalles finos como pestañas, textura de iris o poros de piel, y que el audio sincronizado mantenga una correlación de forma de onda de 0,82-0,88 frente a la versión bf16.

El entrenamiento original de MiniMax-H3 utilizó un conjunto de datos multimodal masivo, aunque no se especifican los detalles en la información disponible. La destilación de FastH3 se realizó mediante técnicas de destilación de pasos, y la cuantización NVFP4 se aplicó posteriormente sin reentrenamiento, aprovechando kernels nativos FP4 de la librería nunchaku. El modelo cuantizado se distribuye en tres niveles de calidad (T1, T2 y T3) que intercambian tamaño por detalle y diversidad de salida.

## Capacidades

- Generación de video de alta calidad a partir de prompts de texto, con resolución nativa de 768p y hasta ~5 segundos de duración en 4 pasos.
- Generación de audio sincronizado con el video (32 kHz estéreo), preservando niveles dBFS y centroide espectral.
- Comprensión multimodal del modelo base: puede entender combinaciones de texto, imágenes, video y audio (capacidad heredada de MiniMax-H3, aunque el pipeline de este modelo se centra en texto a video).
- Ejecución completamente residente en GPU de 16 GB con la variante T1, sin offload a CPU.
- Compatibilidad con ComfyUI mediante el nodo `H3RotNVFP4Patch`, que activa los kernels nativos FP4 (W4A4) de nunchaku.
- Soporte para diferentes niveles de calidad (T1, T2, T3) según las necesidades de detalle y memoria.
- No se mencionan capacidades de tool calling, razonamiento multi-paso ni generación de código, ya que es un modelo de generación de video, no un LLM.

## Casos de uso

1. **Creación de contenido para redes sociales**: generar clips cortos de 5 segundos a 768p para plataformas como TikTok, Instagram Reels o YouTube Shorts. El modelo produce video y audio sincronizado en un solo paso, lo que reduce el tiempo de producción de horas a minutos.
2. **Prototipado de escenas para cine y publicidad**: los directores y equipos de preproducción pueden generar storyboards animados con movimiento y sonido para evaluar la viabilidad de una escena antes de la producción real. La velocidad de 4 pasos permite iterar rápidamente sobre múltiples variaciones.
3. **Generación de material educativo**: crear animaciones explicativas para clases de ciencias, historia o tecnología, con narración sincronizada. El modelo puede producir contenido visual y audio coherente sin necesidad de herramientas de edición adicionales.
4. **Desarrollo de videojuegos**: generar cinemáticas o fondos animados para juegos independientes. La capacidad de ejecutarse en una GPU de consumo (RTX 50-series) lo hace accesible para estudios pequeños sin infraestructura de servidores.
5. **Publicidad personalizada**: producir anuncios de video cortos con audio para campañas de marketing, adaptando el contenido a diferentes mercados o idiomas (los idiomas soportados no están especificados, pero el modelo base es multimodal).
6. **Investigación en generación de video**: servir como punto de partida para experimentos de cuantización extrema o destilación, ya que demuestra que NVFP4 rotado puede superar a bf16 en nitidez a pasos iguales. Los investigadores pueden estudiar el impacto de la rotación Hadamard en la preservación de alta frecuencia.
7. **Arte generativo y creatividad**: artistas digitales pueden explorar estilos visuales y sonoros abstractos, generando piezas cortas para instalaciones o proyectos personales con hardware modesto.
8. **Automatización de contenido para e-commerce**: crear vídeos de demostración de productos a partir de descripciones textuales, reduciendo los costes de producción de catálogos multimedia.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad sin referencia (no-reference) a resolución 768p con 4 pasos, comparando con la versión bf16:

| Escena | Variante | clipiqa+ ↑ | musiq ↑ | Velocidad (s/step) |
|---|---|---|---|---|
| Rostro (primer plano) | NVFP4 rotado | 0,527 | 63,8 | 4,6 |
| Rostro (primer plano) | bf16, 4 pasos | 0,429 | 49,9 | 7,3 |
| Bosque / cascada | NVFP4 rotado | 0,606 | 63,9 | 4,6 |
| Velero / mar | NVFP4 rotado | 0,517 | 71,0 | 4,6 |

Además, se indica que la correlación de forma de onda del audio entre NVFP4 y bf16 es de 0,82–0,88, con niveles dBFS y centroide espectral coincidentes. No se han publicado resultados de benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- **GPU requerida**: Blackwell (RTX 50-series o GB10). Los kernels nativos FP4 de nunchaku no funcionan en arquitecturas anteriores.
- **VRAM**: la variante T1 ocupa ~10,8 GB y cabe completamente residente en una tarjeta de 16 GB con un pico de 15,4 GiB para un clip de 124 frames (5,17 s) a 768p. Las variantes T2 y T3 son más grandes y requieren más VRAM (no especificada).
- **Sin offload**: a diferencia de las versiones fp8 o bf16 (~66 GB), que necesitan streaming desde RAM o una tarjeta de 24 GB, esta cuantización permite ejecución residente completa.
- **Software**: ComfyUI reciente, librería nunchaku (wheel compatible con torch/CUDA), y el nodo `H3RotNVFP4Patch` incluido en el repositorio.
- **Rendimiento**: ~4,6 s/step en una RTX 5070 Ti class, lo que da un total de ~18,4 s para 4 pasos más el coste de VAE. El tiempo de carga del checkpoint es de segundos en PCIe 5.0.
- **Despliegue**: principalmente ComfyUI con el nodo específico. No se mencionan soporte para vLLM, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Tamaño | Resolución | Pasos | VRAM requerida | Velocidad | Licencia |
|---|---|---|---|---|---|---|
| **MiniMax-H3 FastH3 NVFP4 rotado (este)** | ~10,8 GB (T1) | 768p | 4 | 16 GB (Blackwell) | 4,6 s/step | minimax-h3-community |
| MiniMax-H3 FastH3 bf16 | ~66 GB | 768p | 4 | 24 GB o más | 7,3 s/step | minimax-h3-community |
| MiniMax-H3 FastH3 fp8 | ~66 GB | 768p | 4 | 24 GB o más | no disponible | minimax-h3-community |
| MiniMax-H3 (modelo base, sin destilar) | no disponible | 768p+ | 20-30 | no disponible | más lento | minimax-h3-community |

La comparativa se limita a las variantes del propio modelo, ya que no se dispone de datos de otros modelos de generación de video con características comparables en la información proporcionada.

## Limitaciones y advertencias

- **Hardware restringido**: requiere obligatoriamente una GPU Blackwell (RTX 50-series o GB10). No funcionará en GPUs Ampere, Ada Lovelace o anteriores.
- **Loader específico**: debe usarse el nodo `H3RotNVFP4Patch` incluido en el repositorio. Un loader genérico NVFP4 puede des-cuantizar a bf16 (más lento que fp16) o producir ruido debido a la rotación Hadamard no deshecha.
- **Calidad limitada por destilación**: es la "tier rápida" de 4 pasos, lo que sacrifica detalle fino y diversidad frente al modelo base sin destilar. Para más detalle se recomienda ejecutar 6-8 pasos (a costa de velocidad) o usar la variante de calidad completa.
- **Memoria ajustada con audio**: decodificar video y audio conjuntamente a 768p puede ser ajustado en 16 GB; se recomienda decodificar por etapas si se alcanza el límite.
- **Sesgos y alucinaciones**: no se especifican sesgos concretos, pero como modelo de generación, puede producir contenido visual o de audio incoherente o no deseado en escenas complejas.
- **Licencia**: la licencia es "minimax-h3-community", que no está detallada en la información disponible. Se debe revisar el texto completo de la licencia antes de uso comercial.
- **Idiomas**: no se especifican los idiomas soportados, lo que limita la planificación de despliegues multilingües.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/pottokao/MiniMax-H3-FastH3-NVFP4-rotated)
- [Modelo de calidad completa (sin destilar)](https://huggingface.co/pottokao/MiniMax-H3-NVFP4-rotated)
- [Repositorio nunchaku (kernels FP4)](https://github.com/nunchaku-ai/nunchaku)
- [Awesome MiniMax-H3 (lista de recursos)](https://github.com/wildminder/awesome-minimax-H3)
- [Recursos comunitarios MiniMax H3](https://github.com/iSk2y/awesome-minimax-h3)
- [Guía de MiniMax H3 y cuantizaciones (Stable Diffusion Tutorials)](https://www.stablediffusiontutorials.com/2026/08/minimax-h3.html)
- [Descargas y archivos de MiniMax H3](https://minimaxh3.run/minimax-h3-model-files-downloads)
