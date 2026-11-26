# moonbox-dev/flux-3-image-klein-GGUF

## Resumen

FLUX 3 Image Klein GGUF es una colección de pesos cuantizados en formato GGUF del modelo de difusión FLUX 3 Image Klein, desarrollado originalmente por Black Forest Labs y empaquetado por el usuario moonbox-dev para su uso en dispositivos locales. El modelo base es un transformer de difusión de 5.548.681.984 parámetros (aproximadamente 5,6 mil millones) diseñado principalmente para edición de imágenes a partir de instrucciones en lenguaje natural, aunque también soporta generación de imágenes texto-a-imagen. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante runtimes ligeros como stable-diffusion.cpp o ComfyUI con el nodo ComfyUI-GGUF.

La relevancia de este repositorio radica en que ofrece múltiples precisiones de cuantización (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) con verificaciones rigurosas frente a los pesos originales en BF16, incluyendo métricas de calidad de imagen como LPIPS, PSNR, ImageReward, HPSv2 y CLIP. El archivo más pequeño, Q4_K_M, ocupa 3,51 GB, lo que facilita su despliegue en GPUs con 8 GB de VRAM o menos, mientras que Q8_0 (6,15 GB) es la opción más fiel al original con un tamaño reducido a algo más de la mitad.

El modelo es destilado (16 pasos de inferencia, CFG 1) y requiere componentes separados: un codificador de texto Qwen3-VL 4B y un VAE proveniente de FLUX.2 (`ae.safetensors`). La licencia es la FLUX Kommunity License, que restringe el uso comercial a empresas con ingresos anuales inferiores a 5 millones de dólares estadounidenses, y no se trata de una release oficial de Black Forest Labs.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (diffusion transformer) para texto-a-imagen y edición de imágenes |
| Parámetros totales | 5.548.681.984 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | FLUX Kommunity License (no comercial, o comercial para empresas con ingresos anuales < 5 M USD) |
| Formato de pesos | GGUF (single-file por precisión) |

## Arquitectura y entrenamiento

El modelo base FLUX 3 Image Klein es un transformer de difusión de 5,6 mil millones de parámetros orientado a la edición de imágenes mediante instrucciones y a la generación texto-a-imagen. La arquitectura sigue el paradigma de los diffusion transformers, donde el proceso de generación se realiza mediante un número reducido de pasos de denoising (16 pasos en la configuración recomendada) y con classifier-free guidance fijado en 1, lo que indica que el modelo ha sido destilado para inferencia rápida. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada.

El repositorio GGUF no incluye el codificador de texto ni el VAE: el text encoder es Qwen3-VL 4B (disponible en formato GGUF aparte) y el VAE es el de FLUX.2 (`ae.safetensors`). La conversión se realizó a partir de los pesos originales en BF16 en la revisión `09561231f4`, generando primero F16/BF16 en GGUF y cuantizando después con `llama-quantize` de llama.cpp. Cada archivo fue verificado contra el original antes de su publicación, con hashes SHA256 documentados y métricas de error RMS relativo de los pesos, además de una comparación de calidad de imagen sobre 100 prompts de PartiPrompts.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de descripciones en lenguaje natural.
- Edición de imágenes guiada por instrucciones (image editing), añadiendo `-r input.png` y un prompt de instrucción en stable-diffusion.cpp.
- Inferencia destilada en 16 pasos con CFG 1, lo que reduce el coste computacional frente a modelos de difusión no destilados.
- Compatibilidad con stable-diffusion.cpp y ComfyUI mediante ComfyUI-GGUF (nodo Unet Loader GGUF).
- Soporte de múltiples precisiones para adaptarse a distintos presupuestos de memoria (desde 3,51 GB hasta 11,10 GB).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio.
- Capacidades multilingües: no disponibles en la información proporcionada (el codificador de texto Qwen3-VL 4B es multilingüe, pero no se documenta el comportamiento del pipeline completo).

## Casos de uso

- Edición de imágenes en local para estudios pequeños: un diseñador puede cargar el archivo Q5_K_M (4,17 GB) en una GPU de 8 GB y aplicar instrucciones de edición sobre fotografías o bocetos sin depender de servicios en la nube, gracias a la naturaleza destilada del modelo (16 pasos).
- Generación de ilustraciones conceptuales en iteración rápida: con Q4_K_M (3,51 GB) y stable-diffusion.cpp, se pueden producir borradores a 1024x1024 en hardware de consumo para explorar ideas antes de refinarlas con Q8_0 o BF16.
- Prototipado de pipelines de imagen en ComfyUI: integración del GGUF en `models/unet` con el nodo Unet Loader (GGUF) permite construir flujos de trabajo con el text encoder Qwen3-VL 4B y el VAE de FLUX.2 para experimentar con edición y generación.
- Automatización de variaciones de producto: un equipo de comercio electrónico puede generar variaciones de imágenes de catálogo a partir de instrucciones textuales, usando Q6_K o Q5_K_M con el text encoder descargado a CPU para liberar VRAM.
- Investigación en cuantización de modelos de difusión: el repositorio documenta métricas LPIPS, PSNR, ImageReward, HPSv2 y CLIP para cada precisión, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización en la calidad visual.
- Despliegue en entornos con GPUs de gama media: Q4_K_M y Q5_K_M caben en tarjetas de 8 GB con el text encoder offloaded, permitiendo generar imágenes en portátiles con RTX 3080 Laptop o similares, como se documenta en el benchmark del autor.
- Creación de contenido para prototipos de aplicaciones móviles o web: la inferencia local con GGUF evita costes de API y permite generar assets gráficos bajo demanda en fases de desarrollo.

## Benchmarks y rendimiento

El autor proporciona una comparación de cada precisión frente a los pesos BF16 originales, evaluada sobre 100 prompts de PartiPrompts (todas las categorías), imágenes de 1024x1024, semilla 1000 + id de prompt, con stable-diffusion.cpp master-465adf3 en CUDA (RTX 3080 Laptop), 16 pasos, CFG 1 y método euler. El criterio de aceptación es una media de ImageReward dentro de 0,05 de BF16 y HPSv2 dentro de 0,003.

| Precisión | Tamaño | Error RMS de pesos | LPIPS (vs BF16) | PSNR (dB) | ImageReward | HPSv2 | CLIP |
|---|---|---|---|---|---|---|---|
| BF16 | 11,10 GB | exacto (referencia) | — | — | — | — | — |
| F16 | 11,10 GB | 1,5e-9 | — | — | — | — | — |
| Q8_0 | 6,15 GB | 0,53 % | 0,014 | 35,6 | +0,004 | -0,0002 | +0,05 |
| Q6_K | 4,87 GB | 1,8 % | 0,043 | 28,4 | +0,006 | -0,0008 | +0,03 |
| Q5_K_M | 4,17 GB | 3,5 % | 0,082 | 25,2 | +0,021 | -0,0001 | +0,00 |
| Q4_K_M | 3,51 GB | 7,0 % | 0,144 | 21,0 | -0,024 | -0,0025 | +0,05 |

Todas las cuantizaciones superan el criterio de aceptación. El archivo F16 se marca como experimental porque, aunque sus pesos son equivalentes a BF16 (error 1,5e-9), stable-diffusion.cpp en CUDA genera imágenes en blanco en 100 de 100 prompts; el autor recomienda usar BF16 en ese runtime.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 3,5 GB solo para el diffusion transformer; Q5_K_M unos 4,2 GB; Q6_K unos 4,9 GB; Q8_0 unos 6,2 GB; BF16/F16 unos 11,1 GB. A ello hay que sumar el text encoder Qwen3-VL 4B (en Q8_0) y el VAE, que pueden offloadearse a CPU o requerir VRAM adicional.
- GPU recomendadas: RTX 3080 Laptop (usada en el benchmark del autor) funciona con las cuantizaciones Q4_K_M a Q8_0; para BF16 se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100). Las tarjetas de 8 GB pueden usar Q6_K o Q5_K_M con el text encoder offloaded.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M, Q5_K_M y Q6_K están pensados para GPUs de 8 GB; Q8_0 para 8-12 GB; BF16 requiere 16 GB o más.
- Opciones de despliegue: stable-diffusion.cpp (runtime del benchmark, commit 465adf3), ComfyUI con ComfyUI-GGUF (nodo Unet Loader GGUF en `models/unet`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el benchmark se ejecutó en una RTX 3080 Laptop con 16 pasos, pero no se reportan tiempos por imagen.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada. El propio repositorio solo compara las distintas precisiones del mismo modelo frente a BF16. Se puede señalar que el modelo base FLUX 3 Image Klein (5,6 B) se posiciona en la categoría de diffusion transformers de tamaño medio para edición y generación de imágenes, pero no se han proporcionado parámetros, contexto ni resultados de benchmarks de alternativas como para establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX 3 Image Klein (este, GGUF) | 5,55 B | No disponible | FLUX Kommunity License | Hugging Face (moonbox-dev) |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La licencia FLUX Kommunity License restringe el uso comercial: solo se permite para empresas con ingresos anuales inferiores a 5 millones de dólares estadounidenses; el uso no comercial está permitido. Es una licencia gated y estos archivos no son una release oficial de Black Forest Labs.
- El archivo F16 presenta un fallo documentado en stable-diffusion.cpp sobre CUDA: genera imágenes en blanco en el 100 % de los prompts, pese a que sus pesos son equivalentes a BF16. Se recomienda usar BF16 en ese runtime; otros runtimes podrían no verse afectados.
- El repositorio solo contiene el diffusion transformer; es necesario descargar por separado el text encoder Qwen3-VL 4B en GGUF y el VAE de FLUX.2 (`ae.safetensors`), lo que añade complejidad y consumo de memoria al despliegue.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones idiomáticas ni restricciones adicionales de producción más allá de la licencia.
- La cuantización Q4_K_M presenta la mayor desviación frente a BF16 (LPIPS 0,144, PSNR 21,0 dB, ImageReward -0,024), aceptable según el criterio del autor pero perceptible en comparaciones directas.
- El modelo está destinado a edición y generación de imágenes; no es un modelo de lenguaje y no debe evaluarse con benchmarks de texto como MMLU o GSM8K.
- No se documentan garantías de calidad para resoluciones distintas de 1024x1024 ni para otros métodos de muestreo diferentes de euler.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Text encoder GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Archivo F16: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-F16.gguf
- Archivo BF16: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-BF16.gguf
- Archivo Q8_0: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q8_0.gguf
- Archivo Q6_K: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q6_K.gguf
- Archivo Q5_K_M: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q5_K_M.gguf
- Archivo Q4_K_M: https://huggingface.co/moonbox-dev/flux-3-image-klein-GGUF/blob/main/flux-3-image-klein-Q4_K_M.gguf
