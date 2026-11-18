# babkasotona/ra4

## Resumen

ra4-218M es un modelo de difusión texto-a-imagen de 217,7 millones de parámetros desarrollado por el usuario babkasotona y publicado en Hugging Face bajo el identificador `babkasotona/ra4`. Se trata de un transformer de difusión (DiT) con arquitectura piramidal de tres niveles (UDiT) que genera imágenes de 512×512 píxeles a partir de latentes de 256×256, empleando transporte rectificado (rectified flow) con predicción de x. Es un modelo de investigación de escala reducida, entrenado desde cero sobre una GPU de consumo (RTX 4080 de 16 GB), lo que lo convierte en un caso de estudio interesante para quienes quieran entender el entrenamiento de modelos de difusión con presupuesto limitado.

La relevancia del modelo es fundamentalmente técnica y educativa: el repositorio incluye el código completo de entrenamiento, muestreo, evaluación y conversión de datos, además de un conjunto de autocontroles (`selftest.py` con 30 verificaciones). Emplea un VAE de 32 canales compatible bit a bit con el de FLUX.2, lo que permite reutilizar latentes precalculados del dataset FLUX-Reason-6M. El modelo está entrenado únicamente con 17 500 pasos sobre 100 000 pares imagen-texto, por lo que sus capacidades generativas son limitadas y así se reconoce explícitamente en la model card.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks estándar (MMLU, FID, CLIP score, etc.). La model card está redactada en ruso y documenta métricas internas de reconstrucción y de contribución del texto, pero no comparaciones con otros modelos de la misma categoría.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UDiT (transformer de difusión piramidal de 3 niveles) con rectified flow y predicción de x |
| Parámetros totales | 217,7 M (217,1 M cuerpo + 0,59 M adaptador de texto + token nulo de 768 dimensiones) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens de texto (LongCLIP-L, 248 posiciones, ventana de 192) |
| Tipos de cuantización | no disponible (pesos publicados en fp16; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (el codificador de texto es CLIP, predominantemente inglés) |
| Licencia | no disponible (la model card indica que el propietario debe decidirla) |
| Formato de pesos | safetensors (fp16, 416 MB para el transformer; VAE en fp32, 366 MB) |

## Arquitectura y entrenamiento

El modelo procesa una imagen de 256×256 que se codifica en un latente de 32×32×32 mediante un VAE con compresión 8 (AsymmetricAutoencoderKL de 32 canales, f8/f16). Ese latente se organiza en tres niveles de tokens: L0 con 1024 tokens de anchura 448 y 7 cabezas, L1 con 256 tokens de anchura 896 y 14 cabezas, y L2 con 64 tokens de anchura 1792 y 28 cabezas (cuello de botella). Cada bloque combina depthwise 3×3 + MLP×2 o atención (completa o de ventana 8×8 con desplazamiento cíclico) + MLP×2, con un módulo ada propio por bloque (shift, scale y gate sobre la rama, alimentado por el embedding de t). La última capa de ada y la de salida están inicializadas a cero, de modo que en el paso 0 el cuerpo es la identidad. Hay cross-attention al texto en todos los bloques, QK-norm y RoPE 2D. El descenso de resolución usa space-to-depth (2×2 sin pérdida) y el ascenso pixel-shuffle, con skips provistos de gate aprendido. Las anchuras 448/896/1792 son deliberadamente mayores que las de SDXL (320/640/1280) porque el latente de 32 canales contiene ocho veces más información por posición que uno de 4 canales.

El camino de texto emplea un LongCLIP-L congelado (248 posiciones, ventana de 192 tokens) que codifica `hidden_states[-2]` más `final_layer_norm`; la parte entrenable es un adaptador por token (LayerNorm + residual lineal con inicialización a cero) y las proyecciones K/V. No hay pooling de texto en adaLN. El entrenamiento usó latentes de FLUX-Reason-6M a 256 px (100 000 registros con descripciones largas de ~127 tokens, filtro CLIP ≥ 0,28), durante 17 500 pasos con batch 16, learning rate 2e-4 con cosine y warmup 500, drop-text del 10 %, t ~ logit-normal con shift 0,3 y pérdida MSE sobre la velocidad derivada de la predicción de x. Se entrenó en una RTX 4080 (16 GB) a 222 ms por paso, unas 70 imágenes por segundo.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 píxeles a partir de descripciones textuales de hasta 192 tokens.
- Condicionamiento por texto mediante cross-attention en todos los bloques y adaptador entrenable sobre LongCLIP-L congelado.
- Muestreo con classifier-free guidance configurable (rango recomendado 1,0–2,0) y shift del schedule de ruido.
- Predicción de x con loss sobre velocidad, lo que permite evaluar la contribución del texto (métrica `gain` y `delta`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es exclusivamente un modelo de difusión texto-a-imagen.
- Capacidades multilingües: no documentadas; el codificador CLIP está orientado a inglés.
- Incluye código de entrenamiento, muestreo, evaluación, conversión desde latentes FLUX y un autotest de 30 comprobaciones.

## Casos de uso

- Investigación en arquitecturas DiT piramidales: el repositorio permite reproducir el entrenamiento completo desde cero en una GPU de 16 GB, lo que sirve para estudiar el efecto de la profundidad, las anchuras y las ventanas de atención en modelos de difusión de escala reducida.
- Estudio de rectified flow con predicción de x: la implementación y las métricas internas (MSE por tramos de t, `gain`, `delta`) permiten analizar cómo se comporta la pérdida sobre velocidad frente a la predicción directa del latente limpio.
- Reutilización de latentes FLUX-Reason-6M: al ser el VAE compatible bit a bit con el de FLUX.2, el modelo puede entrenarse sobre latentes precalculados, lo que resulta útil para experimentos de destilación o adaptación de dominio con presupuesto limitado.
- Prototipado de pipelines texto-a-imagen en `diffusers`: el modelo se carga con `UDiTModel.from_pretrained` y se integra en scripts de muestreo con CFG y shift, adecuado para probar variantes de schedule y guiado.
- Docencia y divulgación: al incluir código de entrenamiento, evaluación y autotest, sirve como ejemplo didáctico de un pipeline completo de difusión latente con VAE, codificador de texto y transformer.
- Generación de imágenes de baja fidelidad para pruebas de integración: útil para validar infraestructura de inferencia (carga de safetensors, decodificación de VAE, resolución 512×512) sin consumir recursos de modelos grandes.
- No es adecuado para producción comercial de imágenes: la calidad es limitada, la licencia no está definida y no hay garantías de sesgo ni de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, etc.) en la información disponible. La model card incluye únicamente métricas internas de reconstrucción y de contribución del texto sobre 48 pares retenidos:

| Métrica | Valor | Referencia |
|---|---|---|
| MSE por x, t < 0,3 | 0,671 | 1,592 con "no cambiar nada" |
| MSE por x, 0,3–0,7 | 0,232 | 0,580 con "no cambiar nada" |
| MSE por x, t > 0,7 | 0,041 | 0,073 con "no cambiar nada" |
| `gain` (contribución de la descripción), t < 0,3 | +4,8 % | no disponible |
| `delta` (descripción propia frente a ajenas) | −0,016 en t = 0,2 (10σ) | propia mejor en el 100 % de las imágenes |

## Requisitos de hardware

- VRAM estimada para inferencia: el transformer en fp16 ocupa 416 MB, el VAE en fp32 366 MB y el codificador LongCLIP-L 470 MB; en total, menos de 2 GB de pesos, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado se realizó en una RTX 4080 de 16 GB a 222 ms por paso.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: el repositorio proporciona scripts propios en `src/` (`sample.py`, `train.py`, `eval.py`, `selftest.py`, `from_flux2.py`) basados en `diffusers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a difusión texto-a-imagen).
- Latencia y throughput: entrenamiento a 222 ms por paso y ~70 imágenes por segundo en una RTX 4080; no se documenta latencia de inferencia por imagen ni throughput de muestreo.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. A modo orientativo por categoría y escala, se puede contrastar con los siguientes modelos, aunque no hay datos de rendimiento comparables:

| Modelo | Parámetros | Contexto de texto | Resolución de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ra4-218M | 217,7 M | 192 tokens | 512×512 | no disponible | Hugging Face (`babkasotona/ra4`) |
| SDXL | ~2,6 B (UNet) | 77 tokens (CLIP) | 1024×1024 | CreativeML Open RAIL++-M | Hugging Face / diffusers |
| PixArt-α | ~0,6 B | 120 tokens (T5) | 1024×1024 | OpenRAIL-M | Hugging Face / diffusers |
| FLUX.1-schnell | ~12 B | 512 tokens (T5) | hasta 1024×1024 | Apache 2.0 | Hugging Face / diffusers |

La comparación debe tomarse con cautela: ra4-218M es un modelo de investigación con 17 500 pasos de entrenamiento, mientras que los anteriores están entrenados a gran escala y con datasets mucho mayores. No hay datos de FID ni de CLIP score para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado solo 17 500 pasos: las imágenes son reconocibles respecto al prompt pero blandas y con deriva en detalles finos; la model card lo reconoce explícitamente como limitación de presupuesto de pasos.
- CFG fuera del rango 1,0–2,0 produce saturación; por encima de 3 la rama vacía (entrenada con 10 % de drop-text) degrada la calidad.
- El lado de la imagen de entrada debe ser múltiplo de 64 (ventana 8×8 sobre rejilla 32×32); el modelo solo se entrenó a 256 px de entrada y 512 px de salida.
- Licencia no definida: no se puede garantizar uso comercial; la decisión corresponde al propietario del modelo.
- Idiomas no documentados; el codificador CLIP está orientado a inglés, por lo que prompts en otros idiomas pueden degradar el resultado.
- Riesgo de alucinación visual y de sesgos: el dataset FLUX-Reason-6M y el filtro CLIP ≥ 0,28 pueden introducir sesgos de contenido; no se documentan evaluaciones de sesgo ni de seguridad.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No hay benchmarks estándar publicados, por lo que no se puede comparar objetivamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/babkasotona/ra4
- Dataset de latentes FLUX-Reason-6M: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Repositorio de código: incluido en el propio repositorio de Hugging Face (`src/`)
- Ejemplos visuales: `samples/grid.png` dentro del repositorio
- No se han encontrado papers, blogs, demos ni repositorios externos en la información disponible.
