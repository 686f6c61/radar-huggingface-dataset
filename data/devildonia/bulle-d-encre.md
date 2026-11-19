# DeVilDoNia/Bulle-d-Encre

## Resumen

Bulle d'Encre es un checkpoint de difusión text-to-image de tipo single-file, derivado del modelo MOSS-Image de OpenMOSS-Team, publicado por el usuario DeVilDoNia bajo licencia Apache 2.0. Se trata de una fusión de MOSS-Image-SFT y MOSS-Image-Base con dos LoRA integrados: un LoRA de estilo entrenado sobre imágenes propias del autor y el LoRA HaDeS MOSS Turbo 8-steps v1.0. El resultado está orientado a la generación de viñetas e ilustraciones con estética de cómic europeo (tinta y color) combinada con influencias anime, incluyendo páginas con paneles, bocadillos de diálogo y texto legible integrado en la imagen.

El autor lo presenta explícitamente como una preview, no como un modelo final: forma parte de las pruebas de un futuro finetune HaDeS de MOSS-Image con un dataset mayor. El repositorio contiene dos variantes: una en BF16 (10,16 GB) y una conversión int8 ConvRot (5,41 GB), pensadas para su uso en ComfyUI junto con el text encoder Qwen3.5-9B int8 ConvRot y el VAE flux2-vae, que no están incluidos en este repositorio.

La relevancia actual del modelo radica en su enfoque: no es un modelo generalista, sino un checkpoint de estilo especializado en cómic con capacidad de renderizar texto legible dentro de la imagen, algo poco común en modelos de difusión. Está etiquetado como not-for-all-audiences, lo que implica contenido potencialmente sensible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión text-to-image (basada en MOSS-Image; detalles de la arquitectura interna no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | BF16 e int8 ConvRot (dos archivos publicados) |
| Idiomas soportados | no disponible (el texto renderizado en imagen es predominantemente inglés y francés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusión derivado de MOSS-Image, construido mediante la fusión de MOSS-Image-SFT y MOSS-Image-Base, con dos LoRA horneados en los pesos: un LoRA de estilo entrenado sobre imágenes del propio autor y el LoRA HaDeS MOSS Turbo 8-steps v1.0, este último integrado a media fuerza (0,5) para permitir muestreo a 15 pasos sin alterar el estilo. El autor documenta mediciones sobre el LoRA de estilo previo a la fusión: a 15 pasos sin Turbo, la distancia a la imagen de referencia a 25 pasos sin Turbo es de 0,35-0,45 (en unidades de distancia entre dos semillas); con Turbo a 0,25 baja a 0,28, lo que indica que fuerzas bajas de Turbo acercan el resultado al estilo de 25 pasos. Fuerzas superiores a 0,35 no fueron medidas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El autor indica que el finetune completo, con un dataset mucho mayor, está en progreso. El checkpoint integra únicamente el modelo de difusión; requiere por separado el text encoder Qwen3.5-9B int8 ConvRot y el VAE flux2-vae de Comfy-Org/MOSS-Image. Los ajustes de muestreo documentados son: tamaño 1344 × 1792, 15 pasos, CFG 2,5 (hasta 5 en pruebas del autor), sampler Euler, scheduler sgm_uniform, flow shift 5, skip-layer guidance desactivado, y prompt negativo `worst quality, bad anatomy, jpeg artifact, colorful`.

## Capacidades

- Generación de imágenes text-to-image con estética de cómic europeo (tinta y color) y influencia anime.
- Composición de páginas de cómic con paneles múltiples, bocadillos de diálogo y texto legible renderizado en la imagen (capacidad destacada de MOSS-Image).
- Renderizado de texto en escenas: títulos de portada, texto en camisetas y cartelas dentro de la viñeta.
- Acepta prompts en lenguaje natural largo, así como prompts estilo Danbooru (tags), según indica el autor.
- Compatible con ComfyUI mediante Load Diffusion Model o el nodo MOSS Loader de HaDeS MOSS Suite.
- Muestreo rápido opcional: con el LoRA Turbo 8-steps v1.0 añadido a 0,5 (sumando al 0,5 ya integrado, Turbo completo) permite 4-8 pasos, con pérdida de calidad según el autor (no medida).
- No dispone de tool calling, capacidades de agente, visión de entrada ni audio: es exclusivamente un modelo generativo de imagen.

## Casos de uso

- Ilustración de cómic y fanzine: generación de páginas con paneles, bocadillos y texto legible para prototipado rápido de secuencias narrativas, aprovechando la capacidad de renderizar diálogo dentro de la viñeta.
- Portadas de álbum y publicaciones: creación de cubiertas con títulos integrados (los ejemplos incluyen portadas con texto "BULLE D'ENCRE" y "THE SECRET OF THE BLACK LIGHTHOUSE"), útil para maquetas editoriales.
- Dirección de arte y exploración de estilo: el LoRA de estilo permite mantener una estética coherente de tinta europea en series de imágenes, con seed fija para comparar variaciones de prompt.
- Previsualización de guiones gráficos (storyboards): generación de viñetas individuales a 1344 × 1792 para planificar encuadres y composición antes de producción final.
- Prototipado en ComfyUI: integración en flujos de trabajo existentes con el text encoder Qwen3.5-9B y VAE flux2, permitiendo iterar con distintos CFG (2,5-5) y pasos.
- Generación de ilustraciones con texto en prendas y carteles: el modelo renderiza texto en camisetas y cartelas (ejemplo "LIONESSES"), aplicable a merchandising ficticio o ambientación de escenas.
- Experimentación con LoRA Turbo: uso del checkpoint como base para muestreo rápido a 4-8 pasos en entornos con recursos limitados, aceptando la pérdida de calidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta únicamente mediciones internas de distancia entre imágenes (0,35-0,45 a 15 pasos sin Turbo frente a 0,28 con Turbo a 0,25) y observaciones no medidas sobre calidad visual. No hay datos de FID, CLIP score, MMLU ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El archivo BF16 pesa 10,16 GB y el int8 5,41 GB; a estos hay que sumar el text encoder Qwen3.5-9B int8 ConvRot y el VAE flux2, no incluidos en el repo, por lo que el consumo total supera el del checkpoint.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, el int8 (5,41 GB) más encoder y VAE apunta a GPUs de gama alta con 16-24 GB de VRAM; el BF16 requiere más margen.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con la variante int8, aunque no hay confirmación del autor.
- Opciones de despliegue: ComfyUI (Load Diffusion Model o MOSS Loader de HaDeS MOSS Suite). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponibles. El autor documenta 15 pasos como configuración recomendada y 4-8 pasos con Turbo completo, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bulle d'Encre (este) | no disponible | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| MOSS-Image-SFT / Base (OpenMOSS-Team) | no disponible | no aplica | sin datos en esta ficha | no disponible en esta ficha | Hugging Face |
| Illustrious / NoobAI (citados por el autor como referencia de prompts por tags) | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría (difusión text-to-image especializada en cómic). El propio autor menciona Illustrious y NoobAI como modelos con convención de prompts por tags, pero sin cifras comparativas.

## Limitaciones y advertencias

- Es una preview, no un modelo final: el autor indica que muestra hacia dónde va el finetune, no el resultado terminado.
- Solo contiene el modelo de difusión; requiere text encoder Qwen3.5-9B int8 ConvRot y VAE flux2-vae de Comfy-Org/MOSS-Image, que no están incluidos.
- No se han medido otros números de pasos, valores de CFG o tamaños distintos de 1344 × 1792; el comportamiento fuera de esa configuración es desconocido.
- La fuerza de Turbo a 0,5 está justificada por mediciones parciales (solo hasta 0,35) y por impresiones del autor no medidas; a fuerza 1,0 el estilo se desplaza hacia un look común entre checkpoints.
- La opción rápida de 4-8 pasos con Turbo completo implica pérdida de calidad según el autor, sin medición.
- Etiquetado not-for-all-audiences: puede generar contenido sensible; requiere filtrado y revisión en producción.
- Riesgo de alucinación visual y errores anatómicos: el prompt negativo recomendado incluye `bad anatomy` y `jpeg artifact`, lo que sugiere artefactos conocidos.
- Sesgos: no documentados en la información disponible; al derivar de MOSS-Image y de un LoRA de estilo personal, puede heredar sesgos del dataset base y del estilo del autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes externos (text encoder, VAE) deben verificarse por separado.
- El repositorio tiene 0 descargas y 1 like: validación comunitaria prácticamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/DeVilDoNia/Bulle-d-Encre
- LoRA Turbo HaDeS MOSS Turbo 8-steps v1.0: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Componentes Comfy-Org/MOSS-Image (text encoder y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
