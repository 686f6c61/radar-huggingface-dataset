# agentory/FLUX-3-Image-Klein-GGUF

## Resumen

FLUX-3-Image-Klein-GGUF es una cuantización en formato GGUF del modelo de generación y edición de imágenes FLUX 3 Image Klein, desarrollado originalmente por Black Forest Labs y cuantizado por el equipo de AtomicChat bajo el identificador `agentory`. El modelo base es un sistema de texto-a-imagen y edición de 5.548.681.984 parámetros (aproximadamente 5,6B) que unifica en un único modelo la generación desde cero, la edición con una imagen de referencia y la edición con hasta diez imágenes de referencia, destilado para funcionar con 16 pasos de muestreo y CFG 1.

La relevancia de esta ficha concreta reside en que empaqueta el modelo de imagen junto con el codificador de texto Qwen3-VL-4B y el autoencoder (VAE) en un único repositorio, de modo que todo el pipeline es ejecutable localmente con `stable-diffusion.cpp`. Además, el autor publica métricas de fidelidad perceptual (LPIPS, SSIM, PSNR) frente a los pesos BF16 originales para cada nivel de cuantización, lo que permite elegir el compromiso calidad/tamaño con datos medidos en lugar de estimaciones.

El repositorio ocupa 36,0 GB e incluye varias cuantizaciones del modelo de imagen (Q8_0, AD-Q5_K, AD-Q4_K), el codificador de texto y el VAE. La licencia es la `flux-kommunity-license`, que impone restricciones específicas para uso comercial que deben revisarse antes de cualquier despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; el autor no detalla la arquitectura interna) |
| Parámetros totales | 5.548.681.984 (modelo de imagen); el codificador de texto Qwen3-VL-4B se distribuye aparte |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el modelo acepta prompts de texto e imágenes de referencia) |
| Tipos de cuantización | Q8_0, AD-Q5_K, AD-Q4_K (propias); referencia a UD-Q5_K_XL, Q4_K_M, UD-Q3_K_XL y UD-Q2_K_XL de unsloth |
| Idiomas soportados | no disponible (el modelo renderiza texto en imágenes, con métricas específicas para texto en chino) |
| Licencia | flux-kommunity-license (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (imagen), más codificador de texto y VAE en el mismo repo; pesos originales en BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Se sabe que FLUX 3 Image Klein es un modelo de difusión texto-a-imagen y edición de 5,6B parámetros, destilado para operar en 16 pasos con CFG 1, lo que reduce el coste de inferencia frente a modelos que requieren decenas de pasos. El pipeline completo consta de tres componentes: el modelo de imagen, un codificador de texto Qwen3-VL-4B y un autoencoder (VAE), todos ellos empaquetados en el repositorio.

El trabajo de cuantización de AtomicChat se basa en los pesos BF16 publicados por Black Forest Labs, aplicando una matriz de importancia (importance matrix, imatrix) propia. El autor reporta que sus archivos `AD-Q5_K` y `AD-Q4_K` quedan un 14% y un 21% más cerca de la imagen BF16, respectivamente, que las cuantizaciones equivalentes de unsloth (`UD-Q5_K_XL` y `Q4_K_M`), a tamaños iguales o menores. También señala que el codificador de texto influye en la imagen tanto como el modelo de imagen, y que su `AD-Q4_K` del codificador es un 21% más fiel que el `Q4_K_M` habitual al mismo tamaño. La evaluación se realizó sobre 48 captions × 2 semillas, comparando cada render con la imagen BF16 de la misma caption y semilla.

## Capacidades

- Generación de imágenes texto-a-imagen con 16 pasos de muestreo y CFG 1.
- Edición de imágenes con una única imagen de referencia.
- Edición con múltiples imágenes de referencia, hasta diez según la model card.
- Renderizado de texto dentro de la imagen, con métricas específicas publicadas para captions en chino.
- Integración con `stable-diffusion.cpp` para ejecución local.
- Carga del modelo de imagen en ComfyUI mediante ComfyUI-GGUF.
- Pipeline completo autocontenido: modelo de imagen, codificador de texto Qwen3-VL-4B y VAE en el mismo repositorio.
- Variante de codificador de texto y de prompt upsampler sin filtros de contenido, publicadas en repositorios separados por el mismo autor.

## Casos de uso

- Generación de ilustraciones y assets para prototipado de producto: el modelo produce imágenes en 16 pasos con CFG 1, lo que permite iterar rápidamente en local sin depender de APIs externas, usando la cuantización `AD-Q5_K` (4,44 GB) como compromiso entre calidad y huella en disco.
- Edición de imágenes con referencia única: útil para retocar o transformar una imagen existente manteniendo coherencia con la referencia, por ejemplo en flujos de diseño gráfico donde se parte de un boceto o una foto base.
- Composición con múltiples referencias: la capacidad de aceptar hasta diez imágenes de referencia permite construir escenas combinando elementos de varias fuentes, adecuado para moodboards o previsualización de conceptos.
- Integración en ComfyUI para pipelines de creación visual: al cargar mediante ComfyUI-GGUF, el modelo se puede encadenar con nodos de postprocesado, upscaling o segmentación dentro de un grafo de ComfyUI.
- Despliegue local y offline en estaciones de trabajo: al estar en GGUF y ejecutarse con `stable-diffusion.cpp`, el pipeline funciona sin conexión, lo que encaja en entornos con requisitos de privacidad o sin acceso a red.
- Generación de imágenes con texto incrustado: el modelo reporta métricas específicas para texto en chino, por lo que es adecuado para carteles, banners o mockups que requieran lettering legible.
- Experimentación con cuantizaciones: el repositorio incluye varias versiones con métricas LPIPS/SSIM/PSNR publicadas, lo que facilita estudios comparativos de degradación por cuantización en pipelines de investigación.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad perceptual frente a los pesos BF16, medidas sobre 48 captions × 2 semillas. LPIPS mide distancia perceptual (menor es mejor); "vs. new seed" normaliza respecto a la distancia entre imágenes de la misma caption con distinta semilla (LPIPS 0,530 = 100%).

| Archivo | Tamaño en disco | LPIPS [IC 95%] | vs. new seed | SSIM | PSNR | text (zh) |
|---|---:|---|---:|---:|---:|---:|
| BF16 | 11,10 GB | 0 (idéntico) | 0% | 1,000 | — | 0 |
| Q8_0 | 5,99 GB | 0,014 [0,011; 0,017] | 3% | 0,982 | 34,4 dB | 0,011 |
| AD-Q5_K | 4,44 GB | 0,038 [0,032; 0,044] | 7% | 0,954 | 28,8 dB | 0,033 |
| AD-Q4_K | 3,65 GB | 0,081 [0,069; 0,095] | 15% | 0,903 | 24,4 dB | 0,070 |

Comparación con cuantizaciones de terceros (mismo binario, GPU y captions):

| Archivo | Tamaño en disco | LPIPS [IC 95%] |
|---|---:|---|
| leejet Q8_0 | 6,15 GB | 0,016 [0,012; 0,021] |
| unsloth UD-Q5_K_XL | no disponible en la información | — |
| unsloth Q4_K_M | no disponible en la información | — |
| unsloth UD-Q3_K_XL | 3,3 GB (referencia) | no disponible |
| unsloth UD-Q2_K_XL | 2,6 GB (referencia) | no disponible |

El autor indica que por debajo de 3,6 GB no publica archivos propios porque las versiones `UD-Q3_K_XL` y `UD-Q2_K_XL` de unsloth son iguales o mejores que sus mejores layouts a ese tamaño. La tabla completa de comparación con terceros está truncada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de huella en disco, el modelo de imagen va de 3,65 GB (AD-Q4_K) a 5,99 GB (Q8_0), a lo que se suma el codificador de texto Qwen3-VL-4B y el VAE; el conjunto completo requiere espacio adicional para ambos componentes.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información; el tamaño de las cuantizaciones más pequeñas (3,65 GB) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero el autor no lo especifica.
- Opciones de despliegue: `stable-diffusion.cpp` (soporte principal) y ComfyUI mediante ComfyUI-GGUF.
- Latencia y throughput: no disponibles. El modelo está destilado a 16 pasos con CFG 1, lo que reduce el número de evaluaciones por imagen frente a modelos no destilados, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (este repo, GGUF) | 5,6B | 16 pasos, CFG 1 | flux-kommunity-license | GGUF | HuggingFace, descargas 62 |
| FLUX 3 Image Klein (BF16 original, Black Forest Labs) | 5,6B | 16 pasos, CFG 1 | flux-kommunity-license | BF16 | HuggingFace (modelo base) |
| Cuantizaciones de unsloth (UD-Q5_K_XL, Q4_K_M, UD-Q3_K_XL, UD-Q2_K_XL) | 5,6B | 16 pasos, CFG 1 | flux-kommunity-license | GGUF | HuggingFace (referenciadas en la model card) |
| Cuantización de leejet (Q8_0) | 5,6B | 16 pasos, CFG 1 | flux-kommunity-license | GGUF | HuggingFace (referenciada) |

La comparación se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye modelos de otras familias con los que contrastar parámetros o rendimiento. El autor aporta métricas LPIPS que sitúan sus cuantizaciones AD-Q5_K y AD-Q4_K por delante de las equivalentes de unsloth en fidelidad a igual o menor tamaño.

## Limitaciones y advertencias

- La licencia `flux-kommunity-license` no es una licencia de código abierto estándar; impone condiciones específicas para uso comercial que deben revisarse en el archivo LICENSE.md antes de desplegar el modelo en producción.
- El modelo base está destilado a 16 pasos con CFG 1; no se documentan en la información proporcionada los efectos de usar otros valores de pasos o CFG.
- Las cuantizaciones por debajo de 3,6 GB no las publica el autor porque considera que las de unsloth son iguales o mejores; usar archivos de terceros implica confiar en sus propias métricas.
- El autor advierte que el codificador de texto influye en la imagen tanto como el modelo de imagen, por lo que mezclar cuantizaciones de distintos proveedores puede degradar el resultado de forma no evidente.
- El pipeline abierto de Klein no incluye filtro de contenido según el autor; las variantes sin censura del codificador de texto y del prompt upsampler se distribuyen en repositorios separados y pueden generar contenido no apto para todos los públicos.
- No se publican datos sobre sesgos, tasas de alucinación visual ni limitaciones idiomáticas más allá de las métricas de texto en chino.
- No hay información sobre latencia, throughput ni requisitos mínimos de VRAM, lo que dificulta planificar un despliegue en producción sin pruebas propias.
- El repositorio tiene 62 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentory/FLUX-3-Image-Klein-GGUF
- Modelo base (Black Forest Labs): https://huggingface.co/black-forest-labs/flux-3-image-klein
- Métricas y renders públicos: https://huggingface.co/datasets/AtomicChat/FLUX-3-Image-Klein-GGUF-metrics
- Prompt upsampler: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-GGUF
- Codificador de texto sin censura: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-TE-Uncensored-GGUF
- Prompt upsampler sin censura: https://huggingface.co/AtomicChat/FLUX-3-Image-Klein-pup-Uncensored-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
