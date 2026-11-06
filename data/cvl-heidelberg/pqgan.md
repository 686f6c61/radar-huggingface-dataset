# CVL-Heidelberg/PQGAN

## Resumen

PQGAN es un autoencoder de cuantización vectorial por producto (product quantization) desarrollado por el grupo Computer Vision and Learning Lab (CVL) de la Universidad de Heidelberg, publicado en ICLR 2026. Sustituye el único codebook de VQGAN por S subespacios independientes, cada uno con su propio codebook de K entradas, lo que permite representar imágenes con factores de submuestreo más agresivos (F=8 y F=16) sin degradar la reconstrucción.

El modelo resuelve un cuello de botella clave en la síntesis de imágenes con modelos generativos de dos etapas: la calidad del tokenizador latente. Con F=16 (16× de submuestreo), PQGAN mantiene texturas finas, rostros y rotulación que el VAE de Stable Diffusion 2.1 difumina con F=8, lo que se traduce en latentes 4× más compactos sin pérdida perceptible de detalle.

Se distribuyen dos checkpoints entrenados en ImageNet a 256×256, con pesos en `.safetensors` y configuración YAML. Es relevante ahora porque abre la puerta a modelos de difusión y autoregresivos sobre latentes mucho más pequeños, con menor coste computacional en generación y mayor fidelidad de reconstrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder con cuantización vectorial por producto (VQGAN con product quantization) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256×256) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de imagen); no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (autoencoder y cuantizador) + YAML de configuración |

Parámetros específicos por checkpoint:

| Checkpoint | F | d | K | S | Latente (256×256) |
|---|---|---|---|---|---|
| `PQGAN_F8_K512_Z128_S64` | 8 | 128 | 512 | 64 | 128×32×32 |
| `PQGAN_F16_K128_Z128_S64` | 16 | 128 | 128 | 64 | 128×16×16 |

F: factor de submuestreo; d: canales latentes; K: tamaño de codebook por subespacio; S: número de subespacios.

## Arquitectura y entrenamiento

PQGAN es un autoencoder convolucional con un cuantizador de vector por producto. A diferencia de VQGAN, que cuantiza cada vector latente contra un único codebook, PQGAN divide cada vector latente en S subespacios (64 en ambos checkpoints) y cuantiza cada subespacio con su propio codebook de K entradas (512 para F=8, 128 para F=16). Esto reduce drásticamente el coste de memoria del codebook y permite mantener alta fidelidad de reconstrucción con latentes muy compactos.

Ambos modelos se entrenaron en ImageNet a resolución 256×256. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet-1k, ni si se emplearon técnicas de RLHF/DPO (no aplicables a un autoencoder). La innovación principal es la propia product quantization aplicada al tokenizador de imagen, que habilita latentes de 128×16×16 con F=16 manteniendo PSNR de 28,3 dB y rFID de 0,41, frente al colapso de calidad típico de VQGAN a esos factores.

## Capacidades

- Reconstrucción de imágenes a 256×256 con normalización ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]).
- Tokenización latente con dos factores de submuestreo: F=8 (latente 128×32×32) y F=16 (latente 128×16×16).
- Codificación a índices discretos: devuelve una lista de 64 tensores de índices de codebook, uno por subespacio.
- Decodificación desde latentes cuantizados a imagen RGB en [0, 1].
- Preservación de texturas finas, rostros y rotulación incluso con F=16, según la comparativa visual frente al VAE de SD 2.1.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un componente de visión, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la reconstrucción de imagen.

## Casos de uso

- Tokenizador para modelos de difusión latente: sustituir el VAE de Stable Diffusion por PQGAN F=8 o F=16 para entrenar modelos de difusión sobre latentes más compactos, reduciendo el coste de memoria y cómputo en el UNet o transformer de difusión.
- Modelos autoregresivos de imagen: usar los índices discretos por subespacio (64 tensores) como tokens para un transformer autoregresivo de imágenes, aprovechando la estructura de product quantization para predecir cada subespacio de forma independiente.
- Compresión de imágenes con reconstrucción perceptual: emplear el autoencoder como códec de imagen de alta fidelidad (PSNR 37,4 dB con F=8), útil en pipelines donde prima la calidad perceptiva sobre la tasa de compresión bruta.
- Investigación en tokenizadores de imagen: punto de partida reproducible (licencia Apache 2.0, código en GitHub) para experimentar con distintos valores de F, K y S en la cuantización.
- Preprocesado para tareas downstream de visión: generar latentes compactos para clasificación, detección o segmentación con menor huella de memoria que los latentes de VAE convencionales.
- Evaluación comparativa de tokenizadores: benchmark de referencia (rFID, CMMD, LPIPS) para contrastar nuevos autoencoders frente a VQGAN y el VAE de SD 2.1 en ImageNet 256×256.

## Benchmarks y rendimiento

Métricas sobre el conjunto de validación de ImageNet (50k imágenes), según la model card:

| Checkpoint | PSNR ↑ | rFID ↓ | CMMD ↓ | LPIPS ↓ |
|---|---|---|---|---|
| `PQGAN_F8_K512_Z128_S64` | 37,4 | 0,036 | 0,011 | 0,0024 |
| `PQGAN_F16_K128_Z128_S64` | 28,3 | 0,41 | 0,094 | 0,0304 |

No se han publicado en la información disponible resultados comparativos numéricos frente al VAE de Stable Diffusion 2.1 u otros tokenizadores; la model card solo incluye una comparativa visual cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,6 GB, por lo que la inferencia a 256×256 cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el ejemplo oficial usa `.cuda()` sin requisitos especiales. Una RTX 3060 o superior es suficiente.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: PyTorch nativo con el paquete `pqgan` del repositorio de GitHub (Python 3.11). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Factor F | Latente (256×256) | PSNR | rFID | Licencia |
|---|---|---|---|---|---|---|
| PQGAN F8 | Autoencoder PQ | 8 | 128×32×32 | 37,4 | 0,036 | Apache 2.0 |
| PQGAN F16 | Autoencoder PQ | 16 | 128×16×16 | 28,3 | 0,41 | Apache 2.0 |
| VAE de SD 2.1 | Autoencoder VAE | 8 | no disponible | no disponible | no disponible | CreativeML Open RAIL-M |
| VQGAN | Autoencoder VQ | 8/16 | no disponible | no disponible | no disponible | MIT (código) / según checkpoint |

La comparativa numérica frente a VAE de SD 2.1 y VQGAN no está disponible en la información proporcionada; la model card solo aporta una comparación visual en la que PQGAN F=16 preserva detalle que el VAE de SD 2.1 difumina con F=8.

## Limitaciones y advertencias

- Entrenado exclusivamente en ImageNet a 256×256: el rendimiento fuera de ese dominio y resolución no está validado.
- No es un modelo generativo por sí mismo: requiere un modelo de difusión o autoregresivo que opere sobre sus latentes para sintetizar imágenes.
- La decodificación con F=16 presenta una caída notable de calidad frente a F=8 (PSNR 28,3 vs 37,4; rFID 0,41 vs 0,036), por lo que la elección del checkpoint debe ajustarse al compromiso calidad/compresión.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí puede introducir artefactos de reconstrucción en regiones de alta frecuencia o texto pequeño.
- Sesgos: al entrenarse solo con ImageNet-1k, hereda los sesgos de representación de dicho dataset (clases, demografía y contextos limitados).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets y del código de terceros del repositorio.
- No se documentan variantes cuantizadas (GGUF, INT8) ni soporte para otras librerías de inferencia, lo que limita el despliegue fuera de PyTorch.
- El paquete requiere Python 3.11 y la instalación del repositorio de GitHub; no hay integración directa con `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/CVL-Heidelberg/PQGAN
- Paper (OpenReview): https://openreview.net/forum?id=D8oqcochgq
- arXiv: https://arxiv.org/abs/2510.03191
- Código (GitHub): https://github.com/vislearn/PQGAN
- Página del autor: https://sipirius.github.io/
- Perfil de Carsten Rother: https://hci.iwr.uni-heidelberg.de/vislearn/people/carsten-rother/
