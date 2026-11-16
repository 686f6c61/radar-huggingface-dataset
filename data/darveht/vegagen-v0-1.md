# Darveht/vegagen-v0.1

## Resumen

VegaGen v0.1 es un proyecto de modelo de difusión latente para generación de imágenes a partir de texto (text-to-image), publicado por el autor Darveht bajo licencia MIT. Se presenta como una arquitectura completa estilo Stable Diffusion (VAE + UNet condicional + codificador de texto CLIP ViT-L/14) con pipeline de entrenamiento, dataset streaming y herramientas de generación, evaluación y exportación. Es relevante porque propone un andamiaje reproducible para entrenar un modelo text-to-image desde cero en hardware de consumo o en la nube, no porque ofrezca un modelo ya entrenado.

El punto crítico es que **el repositorio no incluye pesos entrenados**. El propio autor lo declara de forma explícita en la model card: se distribuye el código, la arquitectura y los scripts de entrenamiento, pero no un fichero `.safetensors` utilizable para inferencia. La versión se etiqueta como `v0.1.0-alpha` y el autor indica que la generación real requiere ejecutar `train.py` en una GPU (T4 en Colab, o A100/H100 en la nube) durante días o semanas con millones de imágenes.

Por tanto, cualquier evaluación de calidad de generación, benchmarks (FID, CLIP-score) o comparativa de rendimiento con modelos como Stable Diffusion o SDXL **no está disponible**: no existen resultados publicados ni pesos con los que medirlos. La ficha describe, por tanto, las especificaciones de la arquitectura y del pipeline tal como se documentan, marcando como "no disponible" todo aquello que depende de un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (VAE + UNet condicional + CLIP ViT-L/14 + scheduler DDPM/DDIM/Euler) |
| Parametros totales | 860M (`base`) / 2.6B (`large`) según configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; longitud de prompt limitada por el tokenizador de CLIP ViT-L/14, no especificada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (exportación vía `scripts/export.py`); pesos entrenados no incluidos en el repositorio |
| Resolución de generación | 512px en `base`, 1024px en `large` |
| Librería | diffusers |
| Pipeline | text-to-image |
| Estado | v0.1.0-alpha (código completo, sin pesos entrenados) |

## Arquitectura y entrenamiento

VegaGen sigue el esquema de difusión latente popularizado por Stable Diffusion. Un VAE comprime imágenes de 512x512 a latentes de 64x64x4, de modo que el entrenamiento y la inferencia se realizan en el espacio latente (8x más rápido según el autor). Sobre ese espacio opera un UNet condicional que predice el ruido en cada paso, con dos configuraciones: `base` de 860M parámetros (pensada para una T4 o una RTX 3090) y `large` de 2.6B parámetros (orientada a A100/H100). La condición de texto se obtiene con un codificador CLIP ViT-L/14, y el muestreo se realiza con schedulers DDPM, DDIM o Euler en 20-50 pasos.

El pipeline de entrenamiento documentado usa pérdida MSE sobre el ruido, EMA con factor 0.9999, AdamW de 8 bits, precisión mixta bf16, gradient checkpointing y `xformers` cuando está disponible. El dataset previsto es LAION-5B filtrado (estética > 5, sin NSFW, sin duplicados ni marcas de agua) más COCO Captions para composición, cargado en streaming mediante WebDataset para no requerir el dataset completo en disco. No se especifica el número de tokens ni de imágenes efectivamente usado en un entrenamiento real, porque **no se ha ejecutado ni publicado ninguno**; el autor indica que el servidor donde se preparó el proyecto no dispone de GPU.

## Capacidades

- Generación de texto a imagen (text-to-image) con resolución de 512px (`base`) o 1024px (`large`).
- Imagen a imagen (img2img) para transformar una foto de entrada.
- Inpainting para modificar o eliminar regiones concretas de una imagen.
- Estilos declarados: fotorrealista, anime, 3D estilo Arcane, pintura y fotografía de producto.
- Filtro NSFW en dataset y en generación (`safety.py`), marca de agua invisible en las imágenes generadas.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: prompts en español e inglés según los metadatos del repositorio.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Prototipado de pipelines text-to-image**: el repositorio sirve como base reproducible para montar un flujo completo (dataset, entrenamiento, generación, exportación) en Colab, Kaggle o RunPod, sin partir de cero.
- **Entrenamiento de un modelo propio en hardware de consumo**: la configuración `base` (860M parámetros) está dimensionada para una T4 o RTX 3090, lo que permite experimentar con fine-tuning o entrenamiento desde cero en una sola GPU.
- **Investigación sobre difusión latente**: el código separa VAE, UNet condicional, codificador CLIP y schedulers, lo que facilita estudiar o modificar cada componente (por ejemplo, cambiar el scheduler o el precondicionamiento).
- **Generación de imágenes para catálogos o producto**: el estilo "producto" y el inpainting permiten componer imágenes de catálogo o retocar fondos, siempre que se disponga de pesos entrenados.
- **Edición fotográfica asistida (img2img e inpainting)**: útil para transformar fotos existentes o eliminar elementos no deseados en flujos de postproducción ligera.
- **Experimentación con filtros de seguridad**: `safety.py` incluye filtro NSFW, marca de agua y lista de bloqueo, lo que permite evaluar estrategias de moderación en generación de imágenes.
- **Base para fine-tuning con LoRA o ControlNet**: el roadmap v0.2 prevé ControlNet, LoRA y un dataset propio (Vega-10M), por lo que el proyecto puede servir de punto de partida para esas extensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no incluye métricas inventadas (FID, CLIP-score) y que `scripts/evaluate.py` calcula FID y CLIP-score reales solo tras entrenar. Al no existir pesos entrenados, no hay datos de calidad, latencia ni throughput medibles.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible (depende de los pesos entrenados, que no se distribuyen).
- **VRAM estimada para entrenamiento**: la configuración `base` (860M parámetros) está pensada para una T4 o RTX 3090; la configuración `large` (2.6B parámetros) para A100 o H100.
- **GPU recomendadas**: T4 (Colab gratuito) o RTX 3090 para `base`; A100/H100 para `large`.
- **¿Cabe en GPU de consumo?**: sí para `base` según el autor (3090); no se especifica para `large`.
- **Opciones de despliegue**: `diffusers` (librería declarada), scripts propios (`generate.py`, `app.py` con Gradio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen en este formato).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Pesos entrenados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VegaGen v0.1 (`base`) | 860M | 512px | No incluidos | MIT | Código y pipeline; requiere entrenamiento |
| VegaGen v0.1 (`large`) | 2.6B | 1024px | No incluidos | MIT | Código y pipeline; requiere entrenamiento |
| Stable Diffusion 1.5 | ~860M (UNet) | 512px | Sí | CreativeML OpenRAIL-M | Pesos públicos en Hugging Face |
| SDXL | ~2.6B (UNet) | 1024px | Sí | CreativeML OpenRAIL++-M | Pesos públicos en Hugging Face |

La comparación con Stable Diffusion 1.5 y SDXL es estructural (misma familia de difusión latente y tamaños de UNet equivalentes), pero **no es una comparación de rendimiento**: VegaGen no publica pesos ni métricas, por lo que no puede contrastarse su calidad de generación con alternativas entrenadas.

## Limitaciones y advertencias

- **Sin pesos entrenados**: el repositorio no permite generar imágenes de forma directa; es un andamiaje de entrenamiento, no un modelo listo para producción.
- **Sin benchmarks**: no hay FID, CLIP-score ni evaluaciones cualitativas publicadas; la calidad de generación es desconocida.
- **Sesgos**: al depender de LAION-5B filtrado por estética, hereda los sesgos demográficos y culturales de ese dataset; no se documentan análisis de sesgo.
- **Riesgo de alucinación y artefactos**: inherente a los modelos de difusión; sin pesos entrenados no puede caracterizarse su comportamiento real.
- **Idiomas**: solo se declaran español e inglés; el rendimiento en otros idiomas no está documentado.
- **Licencia**: MIT permite uso comercial y modificación con atribución; conviene revisar las licencias de los datasets de entrenamiento (LAION, COCO) antes de un uso comercial de los pesos resultantes.
- **Seguridad**: incluye filtro NSFW, marca de agua y lista de bloqueo, pero no se especifica su eficacia ni su cobertura; el autor prohíbe deepfakes, contenido con menores y desinformación.
- **Madurez**: versión `v0.1.0-alpha`, con roadmap pendiente (ControlNet, LoRA, vídeo); no apta para flujos de producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Darveht/vegagen-v0.1
- Repositorio GitHub (referenciado en la model card): https://github.com/Darveht/vegagen
- Documentación de entrenamiento: `TRAINING_GUIDE.md` (incluido en el repositorio)
- Ficha del modelo: `MODEL_CARD.md` (incluida en el repositorio)
- Paper, blog o demo adicionales: no disponible
