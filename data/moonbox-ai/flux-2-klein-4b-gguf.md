# moonbox-ai/FLUX.2-klein-4B-GGUF

## Resumen

FLUX.2 [klein] 4B GGUF es una distribución cuantizada en formato GGUF del modelo de difusión FLUX.2 [klein] 4B, desarrollado originalmente por Black Forest Labs y convertido por Moonbox para su uso en dispositivos locales. Se trata de un transformer de flujo rectificado (*rectified flow transformer*) de aproximadamente 3.875 millones de parámetros que unifica generación de imágenes a partir de texto y edición de imágenes en una única arquitectura compacta. Su relevancia radica en que ofrece calidad de estado del arte con inferencia en menos de un segundo y permite ejecución en hardware de consumo con tan solo 13 GB de VRAM.

La versión GGUF que nos ocupa incluye múltiples niveles de cuantización (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que abarcan desde los 7,75 GB de los pesos sin cuantizar hasta los 2,29 GB de la variante Q4_K_M, pensada para tarjetas gráficas de 6 GB. Cada archivo ha sido verificado tensor a tensor contra los pesos originales en BF16, y se ha evaluado su impacto en la calidad de imagen mediante un benchmark de 100 prompts de PartiPrompts con métricas LPIPS, PSNR, ImageReward, HPSv2.1 y CLIP.

El modelo está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en flujos de trabajo de producción. La arquitectura subyacente está diseñada para generación y edición en tiempo real, con soporte de múltiples referencias, y el repositorio incluye únicamente los pesos del transformer; el codificador de texto (Qwen3-4B) y el VAE deben tomarse del repositorio original de Black Forest Labs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (*rectified flow transformer*) para difusión |
| Parametros totales | 3.875.544.576 (aproximadamente 3,88 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos individuales por precisión) |
| Tamano del repositorio | 28,0 GB |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Pipeline | text-to-image (con soporte de edición de imagen) |

## Arquitectura y entrenamiento

FLUX.2 [klein] 4B emplea una arquitectura de transformer de flujo rectificado (*rectified flow transformer*) con aproximadamente 3.875 millones de parámetros. Esta familia de modelos está diseñada para unificar generación y edición de imágenes en una sola arquitectura compacta, lo que permite realizar tanto texto-a-imagen como edición multi-referencia con el mismo modelo. La inferencia puede completarse en menos de un segundo de extremo a extremo, lo que la posiciona para aplicaciones que requieren generación en tiempo real.

Los detalles concretos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO u otras técnicas de alineación no están disponibles en la información proporcionada. La model card original menciona que el modelo es "compacto pero capaz" y que soporta texto-a-imagen, edición de imágenes y múltiples referencias con una calidad que supera su tamaño. La versión GGUF distribuida por Moonbox convierte únicamente los pesos del transformer; el codificador de texto (Qwen3-4B) y el VAE provienen del repositorio original. Las conversiones se realizaron con `llama-quantize` de llama.cpp y cada archivo fue verificado contra los pesos originales en BF16 antes de su publicación, con los hashes SHA256 documentados en la model card.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) con resolución de 1024 x 1024 en los benchmarks realizados.
- Edición de imágenes, incluyendo capacidades de edición multi-referencia.
- Inferencia de pocos pasos (*few-step distilled*): el benchmark se ejecutó con 4 pasos y CFG 1, lo que indica un modelo destilado para generación rápida.
- Ejecución en hardware de consumo, con requisitos de VRAM desde 13 GB para el modelo completo y opciones cuantizadas para tarjetas de 6-8 GB.
- Integración con ComfyUI mediante el nodo Unet Loader (GGUF) del plugin ComfyUI-GGUF.
- Compatibilidad con stable-diffusion.cpp para inferencia en CUDA.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el texto proporcionado.

## Casos de uso

- Generación de imágenes en local para desarrollo: el modelo puede ejecutarse en una RTX 3090 o RTX 4070 con la versión completa, o en tarjetas de 8 GB con Q6_K o Q5_K_M, lo que permite iterar en prototipos sin depender de servicios en la nube.
- Edición de imágenes asistida por texto: gracias a su soporte de edición y multi-referencia, se puede utilizar para modificar imágenes existentes mediante instrucciones textuales en flujos de trabajo de diseño gráfico o retoque fotográfico.
- Producción de contenido en tiempo real: la inferencia en menos de un segundo y la destilación a pocos pasos lo hacen adecuado para aplicaciones interactivas donde el usuario espera una respuesta inmediata, como generadores de imágenes en vivo o herramientas de creación rápida.
- Integración en ComfyUI para pipelines de creación artística: al ser compatible con el nodo Unet Loader (GGUF), se puede incorporar en flujos de trabajo nodales existentes de ComfyUI, combinándolo con otros modelos y postprocesado.
- Despliegue en el borde (*edge deployment*): las variantes Q4_K_M (2,29 GB) y Q5_K_M (2,77 GB) permiten ejecutar el modelo en dispositivos con recursos limitados, como estaciones de trabajo con GPU de 6-8 GB o entornos embebidos con aceleración gráfica.
- Generación de imágenes por lotes para catalogos o marketing: con 4 pasos de inferencia y la posibilidad de ejecutar en GPU de consumo, se pueden generar múltiples variaciones de un producto o escena a partir de prompts, manteniendo un coste computacional bajo.
- Investigación en cuantización de modelos de difusión: el repositorio incluye métricas detalladas (LPIPS, PSNR, ImageReward, HPSv2, CLIP) por nivel de cuantización, lo que facilita estudiar el impacto de la compresión en la calidad de imagen en modelos de flujo rectificado destilados.

## Benchmarks y rendimiento

La model card incluye un benchmark de imágenes con 100 prompts de PartiPrompts (todas las categorías), una imagen de 1024 x 1024 por prompt, semilla 1000 + id del prompt, ejecutado con stable-diffusion.cpp master-465adf3 en CUDA (RTX 3080 Laptop), 4 pasos, CFG 1 y sampler euler. Las métricas comparan cada precisión contra BF16 usando los mismos prompts y semillas.

| Precision | Tamano | Error RMS pesos | LPIPS (vs BF16) | PSNR (dB) | ImageReward | HPSv2.1 | CLIP |
|---|---|---|---|---|---|---|---|
| F16 | 7,75 GB | 0,000001 % | 0,005 | 39,5 | -0,001 | +0,0000 | -0,01 |
| BF16 | 7,75 GB | exacto (referencia) | — | — | — | — | — |
| Q8_0 | 4,17 GB | 0,55 % | 0,019 | 31,5 | +0,007 | +0,0001 | -0,05 |
| Q6_K | 3,24 GB | 1,8 % | 0,054 | 25,7 | -0,019 | -0,0002 | -0,13 |
| Q5_K_M | 2,77 GB | 3,5 % | 0,095 | 22,6 | -0,013 | -0,0008 | -0,01 |
| Q4_K_M | 2,29 GB | 6,9 % | 0,162 | 19,3 | -0,018 | +0,0005 | -0,12 |

El criterio de aprobación definido por el autor es una media de ImageReward dentro de 0,05 respecto a BF16 y HPSv2 dentro de 0,003. Todas las precisiones lo cumplen. Los intervalos de confianza pareados al 95 % a 100 prompts son aproximadamente ±0,04 y ±0,001. El autor señala que los modelos destilados de pocos pasos mueven detalles ante pequeños cambios en los pesos, por lo que LPIPS crece a medida que baja la precisión mientras las puntuaciones de calidad se mantienen planas.

No se han publicado resultados de benchmarks comparativos con otros modelos de la misma categoría (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo original requiere un mínimo de 13 GB de VRAM según la model card de Black Forest Labs. Las versiones cuantizadas reducen el espacio de pesos: Q8_0 ocupa 4,17 GB, Q6_K 3,24 GB, Q5_K_M 2,77 GB y Q4_K_M 2,29 GB, si bien debe sumarse la memoria del codificador de texto (Qwen3-4B) y del VAE.
- GPU recomendadas: RTX 3090, RTX 4070 o superiores para la versión completa; el benchmark se ejecutó en una RTX 3080 Laptop.
- Compatibilidad con GPU de consumo: sí. El autor indica que Q6_K y Q5_K_M son adecuados para tarjetas de 8 GB, y Q4_K_M para tarjetas de 6 GB.
- Opciones de despliegue: ComfyUI con el plugin ComfyUI-GGUF (nodo Unet Loader GGUF), stable-diffusion.cpp en CUDA, y cualquier runtime compatible con GGUF para modelos de difusión.
- Latencia y throughput: la model card original afirma inferencia de extremo a extremo en menos de un segundo para la familia FLUX.2 [klein]; el benchmark de cuantización se realizó con 4 pasos y CFG 1. No se proporcionan cifras de latencia o throughput detalladas por hardware en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otras familias de modelos de difusión (por ejemplo, Stable Diffusion, SDXL u otras variantes de FLUX). Por tanto, la comparativa se limita a las variantes de cuantización del propio modelo, ya presentadas en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (original) | ~3,88 mil millones | No disponible | Apache 2.0 | Safetensors | Hugging Face (black-forest-labs) |
| FLUX.2 [klein] 4B GGUF (este repo) | ~3,88 mil millones | No disponible | Apache 2.0 | GGUF (F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) | Hugging Face (moonbox-ai) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio contiene únicamente los pesos del transformer en formato GGUF; es necesario obtener el codificador de texto (Qwen3-4B) y el VAE del repositorio original de Black Forest Labs para completar el pipeline.
- La cuantización introduce degradación en la calidad de imagen: Q4_K_M presenta un error RMS del 6,9 % en los pesos y un LPIPS de 0,162 frente a BF16, lo que puede traducirse en pérdida de detalle en comparación con el modelo sin cuantizar.
- Los modelos destilados de pocos pasos son sensibles a pequeños cambios en los pesos, por lo que las diferencias visuales pueden ser más notables que en modelos no destilados, aunque las métricas de calidad (ImageReward, HPSv2) se mantengan estables.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación (en el sentido de generación de contenido no fiel al prompt) ni limitaciones idiomáticas en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir con los términos de la licencia original del modelo base, que se incluye en el repositorio.
- El rendimiento medido se ha realizado en una RTX 3080 Laptop con stable-diffusion.cpp; los resultados pueden variar en otros hardware y runtimes.
- No se han publicado datos sobre el comportamiento del modelo con prompts en castellano ni sobre su cobertura multilingüe.

## Enlaces

- Repositorio Hugging Face de la versión GGUF: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-GGUF
- Modelo base original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Blog de Black Forest Labs sobre FLUX.2 [klein]: https://bfl.ai/blog/flux2-klein-towards-interactive
- Plugin ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Repositorio de stable-diffusion.cpp: no disponible en la información proporcionada (se menciona la versión master-465adf3, pero no se incluye la URL)
