# SeeSee21/See-Krea2-Genesis

## Resumen

See-Krea2-Genesis (también publicado como See-Krea2) es un fine-tune de tipo checkpoint para generación de imágenes texto-a-imagen, construido sobre Krea 2 Turbo de Krea.ai por el creador independiente SeeSee21. Su objetivo es convertir la ilustración anime —con especial énfasis en personajes femeninos detallados y en un acabado pixel-art con estética Game Boy— en la dirección visual natural del modelo, manteniendo el flujo de trabajo rápido y ligero del Turbo original (8 pasos, CFG 1.0, sampler euler/simple).

La versión actual, Genesis-V2, amplía el entrenamiento de la V1 con más pasos y mayor resolución, mejorando el detalle de imagen y el seguimiento de instrucciones. El repositorio distribuye únicamente los ficheros del modelo de difusión en múltiples precisiones (BF16, INT8, FP8, MXFP8, NVFP4 e INT4), mientras que el codificador de texto (Qwen3-VL 4B) y el VAE (Qwen-Image VAE) se reutilizan del ecosistema de Krea 2 y se descargan por separado.

Es relevante ahora porque demuestra cómo un único autor puede especializar un modelo base comercial de última generación hacia un estilo muy concreto y publicarlo con builds cuantizados listos para GPUs de consumo, desde tarjetas de 8 GB hasta Blackwell. La licencia no es abierta: se rige por la Krea 2 Community License y una política de uso aceptable con acceso restringido (gated).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (no disponible el detalle interno exacto); fine-tune de Krea 2 Turbo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image); codificador de texto Qwen3-VL 4B |
| Tipos de cuantización | BF16, INT8 ConvRot, FP8 scaled, MXFP8, NVFP4, INT4 ConvRot |
| Idiomas soportados | en (inglés) |
| Licencia | krea-2-community-license (con Acceptable Use Policy; acceso gated) |
| Formato de pesos | safetensors (checkpoint de modelo de difusión); codificador de texto y VAE en safetensors separados |

## Arquitectura y entrenamiento

See-Krea2-Genesis es un fine-tune del modelo de difusión Krea 2 Turbo. El pipeline completo se compone de tres piezas: el modelo de difusión (los ficheros Genesis-V2), el codificador de texto Qwen3-VL de 4B parámetros en BF16 (`qwen3vl_4b_bf16.safetensors`, tipo CLIP `krea2`) y el VAE de Qwen-Image (`qwen_image_vae.safetensors`). El autor no detalla en la información disponible la arquitectura interna del difusor, el número de tokens de entrenamiento ni la composición del dataset.

Sí se documenta el proceso de especialización: la V2 se entrenó durante más tiempo y a mayor resolución que la V1, con foco en mayor detalle de imagen, mejor seguimiento de prompts, personajes femeninos anime detallados y un look pixel-art. El modelo conserva el régimen de inferencia del Turbo: 8 pasos, CFG 1.0 y sampler euler/simple, lo que implica que el prompt negativo no tiene efecto. Se ofrecen builds cuantizados con distintas técnicas (ConvRot para INT8/INT4, FP8 escalado, MXFP8 y NVFP4), y el autor advierte explícitamente que un mayor "weight error" de cuantización no se traduce en peor calidad de imagen.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime como dirección visual dominante.
- Estilo pixel-art y look Game Boy mediante disparadores textuales (`pixel`, `16Bit`).
- Personajes consistentes mediante tokens de activación: `seesee_elf` y `seesee_kitsune`.
- Seguimiento de prompts en lenguaje natural (no requiere sintaxis de tags tipo Danbooru).
- Generación rápida en 8 pasos con CFG 1.0, apta para iteración intensiva.
- Integración con ComfyUI mediante workflow incluido (`See-Krea2-Ultimate-v1.1.json`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Ilustración anime para proyectos personales: el modelo está entrenado para que el estilo anime sea su salida natural, por lo que prompts sencillos en inglés producen ilustraciones coherentes sin necesidad de largas listas de tags de estilo.
- Creación de sprites y arte pixel-art para videojuegos indie: añadiendo `pixel` o `16Bit` al prompt se obtiene estética retro tipo Game Boy, útil para prototipado rápido de assets antes de su pixelado final manual.
- Generación de personajes recurrentes: los tokens `seesee_elf` y `seesee_kitsune` permiten invocar variantes de personaje con rasgos estables entre imágenes, útil para webcómics o fichas de personaje.
- Iteración de conceptos en estudio pequeño: con 8 pasos y CFG 1.0, el coste por imagen es bajo, lo que permite explorar decenas de variaciones de composición en una sola sesión en una GPU de consumo.
- Integración en pipelines de ComfyUI: el workflow incluido permite encadenar el modelo con upscalers, post-procesado o control de imagen dentro de un grafo reproducible y automatizable.
- Prototipado de key art y portadas: la V2 prioriza detalle de escena y seguimiento de prompt, adecuado para bocetos de alta resolución que luego se retocan en un editor.
- Pruebas de cuantización en hardware variado: los builds INT4/NVFP4 permiten desplegar el modelo en GPUs de gama media o Blackwell para evaluar la pérdida de calidad frente al BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el build INT4 ConvRot (6,90 GB) es el más ligero y apunta a GPUs de VRAM baja; NVFP4 (7,67 GB) para RTX 50-series; INT8 ConvRot (13,15 GB) y FP8 scaled (13,14 GB) para el rango de 16 GB; MXFP8 (14,51 GB) y BF16 (26,28 GB) para VRAM alta.
- GPUs recomendadas: INT8 ConvRot funciona en RTX 30-series y posteriores; FP8 scaled en RTX 40-series y posteriores (ruta FP8 nativa); NVFP4 en RTX 50-series (Blackwell); MXFP8 requiere un loader con soporte MXFP8 en GPUs NVIDIA recientes.
- Cabe en GPU de consumo: sí, con los builds INT4/NVFP4/INT8 en tarjetas de 8-16 GB; el BF16 requiere aproximadamente 26 GB solo para los pesos del difusor, más el codificador de texto y el VAE.
- Despliegue: ComfyUI es el entorno de referencia (workflow incluido); el autor no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles; el régimen de 8 pasos con CFG 1.0 está diseñado para inferencia rápida.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| See-Krea2-Genesis | Krea 2 Turbo (fine-tune) | no disponible | no aplica | Krea 2 Community License (gated) | Hugging Face y Civitai |
| Krea 2 Turbo | Modelo original de Krea.ai | no disponible | no aplica | Krea 2 Community License | Hugging Face (krea/Krea-2-Turbo) |
| See-Krea2 Genesis-V1 | Krea 2 Turbo (fine-tune previo) | no disponible | no aplica | Krea 2 Community License | Hugging Face y Civitai |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a alternativas de la misma categoría (otros fine-tunes anime de difusión); la comparación disponible es únicamente de linaje y licencia.

## Limitaciones y advertencias

- Licencia restrictiva: se rige por la Krea 2 Community License y la Acceptable Use Policy, con acceso gated; el uso comercial está sujeto a los términos de dicha licencia y no es equiparable a una licencia abierta.
- No es un producto oficial de Krea: el autor lo declara explícitamente; no está respaldado por Krea.ai.
- Idioma: los prompts deben ir en inglés según la model card.
- Sesgos: al ser un fine-tune centrado en ilustración anime, especialmente en personajes femeninos, puede sobrerrepresentar ese tipo de composición y ofrecer menor variedad en otros estilos o sujetos.
- Alucinación visual: como todo modelo generativo de imagen, puede producir anatomía incorrecta, texto ilegible en la imagen o detalles incoherentes, especialmente fuera de su dominio de estilo.
- CFG 1.0 implica que el prompt negativo no tiene efecto; no es posible excluir elementos mediante negative prompting.
- Repositorio de 176,3 GB: la descarga completa es pesada; conviene elegir un único build de difusión y reutilizar codificador de texto y VAE si ya se dispone de ellos.
- Requiere soporte específico de cuantización (ConvRot W4A4 para INT4, MXFP8 para MXFP8); sin él, esos builds no funcionan.
- Sin datos de benchmarks ni de parámetros totales publicados: la evaluación de calidad debe hacerse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeeSee21/See-Krea2-Genesis
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Página del autor en Hugging Face: https://huggingface.co/SeeSee21
- Ficha en Civitai: https://civitai.red/models/2846618/see-krea2
- Workflows en Civitai: https://civitai.red/models/2936142
- Canal de YouTube del autor: https://www.youtube.com/@SeeSee-AI
- GitHub del autor: https://github.com/seesee75-commits
- Información de licencia de Krea 2: https://krea.ai/krea-2-licensing
