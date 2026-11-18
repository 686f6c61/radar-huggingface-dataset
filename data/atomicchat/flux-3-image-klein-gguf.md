# AtomicChat/FLUX-3-Image-Klein-GGUF

## Resumen

FLUX-3-Image-Klein-GGUF es una cuantización en formato GGUF del modelo de generación y edición de imágenes FLUX 3 Image Klein de Black Forest Labs, publicada por AtomicChat. El modelo original es un transformer de difusión de 5.548.681.984 parámetros (5,6B) que unifica generación de texto a imagen, edición con una referencia e imágenes de referencia múltiple (hasta diez), destilado para funcionar en 16 pasos con CFG 1, lo que reduce de forma notable el coste de inferencia frente a modelos de difusión convencionales.

El repositorio incluye no solo el modelo de imagen cuantizado, sino también el codificador de texto Qwen3-VL-4B y el autoencoder (VAE) necesarios para ejecutarlo, de modo que es un paquete completo para stable-diffusion.cpp. Los pesos se derivan de los originales en BF16 y se cuantizan con una matriz de importancia propia (imatrix), con variantes AD-Q5_K y AD-Q4_K que el autor mide frente a las de otros publicadores mediante LPIPS, SSIM y PSNR.

Su relevancia actual radica en que permite ejecutar localmente y sin conexión un modelo de imagen-edición de última generación en hardware de consumo, con ficheros de entre 3,65 GB y 5,99 GB, y con métricas públicas de fidelidad respecto a los pesos BF16. La licencia es la flux-kommunity-license, que impone restricciones de uso comercial que deben revisarse antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (text-to-image y edición), destilado a 16 pasos con CFG 1 |
| Parametros totales | 5.548.681.984 (5,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q5_K, AD-Q4_K (propias); referencia a UD-Q3_K_XL y UD-Q2_K_XL de terceros |
| Idiomas soportados | no disponible (el modelo genera texto en imagen, con medición específica para chino) |
| Licencia | flux-kommunity-license (license: other) |
| Formato de pesos | GGUF (para stable-diffusion.cpp y ComfyUI-GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de 5,6B parámetros de Black Forest Labs que integra en un único modelo la generación texto-a-imagen, la edición con una imagen de referencia y la edición con hasta diez imágenes de referencia. Está destilado para 16 pasos de muestreo con CFG 1, lo que elimina la necesidad de classifier-free guidance y reduce el número de evaluaciones del modelo por imagen. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset en la documentación proporcionada.

La aportación de AtomicChat es la cuantización: parte de los pesos BF16 publicados y aplica una matriz de importancia (imatrix) propia para generar los ficheros AD-Q5_K y AD-Q4_K. El autor reporta que el renderizado BF16 es determinista (una segunda ejecución del mismo caption y semilla queda a LPIPS 0,0004), de modo que las diferencias medidas atribuyen a la cuantización. El repositorio incluye además el codificador de texto Qwen3-VL-4B en `text_encoders/` y el autoencoder en `vae/`, y el prompt upsampler que espera Klein se publica en un repositorio separado.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con 16 pasos y CFG 1.
- Edición de imágenes con una imagen de referencia.
- Edición con múltiples imágenes de referencia, hasta diez.
- Renderizado de texto dentro de la imagen, incluido texto en chino (medido con LPIPS específico de 0,033 en AD-Q5_K y 0,070 en AD-Q4_K).
- Ejecución local y offline mediante stable-diffusion.cpp.
- Carga en ComfyUI a través de ComfyUI-GGUF.
- Integración con un prompt upsampler externo (FLUX-3-Image-Klein-pup-GGUF).
- Variantes sin filtro de contenido del codificador de texto y del prompt upsampler publicadas por el mismo autor.
- No se documentan capacidades de tool calling, agentes, audio ni visión más allá del uso de imágenes de referencia para edición.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: con 16 pasos y CFG 1, un único paso de muestreo produce una imagen completa, lo que permite iterar sobre conceptos visuales en local sin depender de APIs externas.
- Edición de imágenes con referencia única: sustituir fondos, cambiar objetos o aplicar un estilo manteniendo la identidad de la imagen de referencia, útil en flujos de retoque y previsualización de campañas.
- Composición con múltiples referencias: combinar hasta diez imágenes de referencia para generar variaciones de producto, escenas con varios sujetos o catálogos consistentes.
- Generación de carteles y material gráfico con texto: el modelo conserva la composición y el lettering en AD-Q4_K, lo que lo hace apto para borradores de carteles y banners con texto renderizado en la imagen.
- Despliegue en estaciones de trabajo sin GPU de datacenter: los ficheros de 3,65 GB y 4,44 GB caben en GPUs de consumo, lo que permite integrar generación de imágenes en herramientas de escritorio o aplicaciones locales.
- Automatización de pipelines de contenido en ComfyUI: cargar los GGUF mediante ComfyUI-GGUF y encadenar nodos de generación y edición para producir lotes de imágenes a partir de plantillas.
- Investigación sobre cuantización de modelos de difusión: las métricas LPIPS, SSIM y PSNR publicadas por el autor permiten comparar estrategias de cuantización con imatrix frente a alternativas de terceros.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad respecto a los pesos BF16 sobre 48 captions × 2 semillas, con la misma semilla inicial. LPIPS mide distancia perceptiva (menor es mejor); la columna "vs. new seed" normaliza respecto a LPIPS 0,530, que es la distancia entre dos imágenes no relacionadas del mismo caption.

| Fichero | Tamano en disco | LPIPS [IC 95%] | vs. nueva semilla | SSIM | PSNR | texto (zh) |
|---|---:|---|---:|---:|---:|---:|
| BF16 | 11,10 GB | 0 (idéntico) | 0% | 1,000 | — | 0 |
| Q8_0 | 5,99 GB | 0,014 [0,011; 0,017] | 3% | 0,982 | 34,4 dB | 0,011 |
| AD-Q5_K | 4,44 GB | 0,038 [0,032; 0,044] | 7% | 0,954 | 28,8 dB | 0,033 |
| AD-Q4_K | 3,65 GB | 0,081 [0,069; 0,095] | 15% | 0,903 | 24,4 dB | 0,070 |

Comparativa frente a otras cuantizaciones medidas por el autor con las mismas condiciones:

| Fichero | Tamano en disco | LPIPS [IC 95%] | Equivalente propio a ese tamano o menor |
|---|---:|---|---|
| leejet Q8_0 | 6,15 GB | 0,016 [0,012; 0,021] | Q8_0, 5,99 GB: 0,014 |
| unsloth UD-Q5_K_XL | mayor que AD-Q5_K | no disponible en el extracto | AD-Q5_K es un 14% más cercano al BF16 |
| unsloth Q4_K_M | no disponible en el extracto | no disponible en el extracto | AD-Q4_K es un 21% más cercano al BF16 |

El autor indica además que por debajo de 3,6 GB no publica ficheros propios porque las variantes UD-Q3_K_XL (3,3 GB) y UD-Q2_K_XL (2,6 GB) de unsloth son iguales o mejores que sus mejores variantes a ese tamaño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; como referencia, los pesos van de 3,65 GB (AD-Q4_K) a 5,99 GB (Q8_0), a los que hay que sumar el codificador de texto Qwen3-VL-4B y el VAE.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el autor menciona haber medido "en una GPU" sin detallar el modelo.
- GPU de consumo: los ficheros AD-Q4_K (3,65 GB) y AD-Q5_K (4,44 GB) están pensados para caber en GPUs de consumo, aunque no se confirma qué modelos exactos.
- Opciones de despliegue: stable-diffusion.cpp (leejet) como runtime principal; ComfyUI mediante ComfyUI-GGUF.
- Latencia y throughput: no disponibles. El modelo está destilado a 16 pasos con CFG 1, lo que reduce el número de evaluaciones por imagen frente a modelos no destilados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX-3-Image-Klein-GGUF (AtomicChat) | 5,6B | no disponible | GGUF | flux-kommunity-license | Hugging Face, 67.696 descargas |
| FLUX 3 Image Klein BF16 (Black Forest Labs) | 5,6B | no disponible | safetensors BF16 | flux-kommunity-license | Hugging Face (modelo base) |
| Klein GGUF de unsloth (UD-Q5_K_XL, Q4_K_M, UD-Q3_K_XL, UD-Q2_K_XL) | 5,6B | no disponible | GGUF | flux-kommunity-license | Hugging Face |
| Klein GGUF de leejet (Q8_0) | 5,6B | no disponible | GGUF | flux-kommunity-license | Hugging Face |

La comparación relevante es de fidelidad frente al BF16 a igual tamaño: AD-Q5_K queda un 14% más cerca que UD-Q5_K_XL y AD-Q4_K un 21% más cerca que Q4_K_M, según las mediciones del autor. En el extremo bajo (3,3 GB y 2,6 GB), el propio autor reconoce que las variantes de unsloth son iguales o mejores.

## Limitaciones y advertencias

- Licencia flux-kommunity-license: impone restricciones de uso comercial que deben revisarse en el fichero LICENSE.md antes de cualquier despliegue en producción.
- Pérdida de fidelidad por cuantización: incluso Q8_0 se aleja del BF16 (LPIPS 0,014); AD-Q4_K desplaza texturas y objetos pequeños (LPIPS 0,081, SSIM 0,903).
- El texto renderizado en imagen se degrada con la cuantización: el LPIPS específico de texto en chino sube de 0,011 en Q8_0 a 0,070 en AD-Q4_K.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación visual: no se aportan datos sobre fidelidad semántica al prompt más allá de las métricas perceptuales frente al BF16.
- Idiomas soportados no declarados; la única medición específica de idioma es para texto en chino dentro de la imagen.
- El pipeline abierto de Klein no incluye filtro de contenido; el autor publica variantes sin rechazos del codificador de texto y del prompt upsampler, lo que traslada al operador la responsabilidad de moderación.
- Requiere componentes adicionales (codificador de texto Qwen3-VL-4B, VAE y prompt upsampler en repositorio aparte) para un pipeline completo.
- No se especifican requisitos mínimos de VRAM ni latencias, lo que dificulta el dimensionado previo del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Métricas y renders públicos: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-GGUF-metrics
- Prompt upsampler: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-GGUF
- Codificador de texto sin filtro: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Prompt upsampler sin filtro: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Atomic Chat (aplicación): https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
