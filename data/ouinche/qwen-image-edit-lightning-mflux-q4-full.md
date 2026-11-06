# Ouinche/qwen-image-edit-lightning-mflux-q4-full

## Resumen

Qwen-Image Edit Lightning MLX 4-bit Full es una distribución cuantizada a 4 bits del modelo de edición de imágenes Qwen-Image-Edit, publicada por el usuario Ouinche. Se trata de una conversión específica para Apple Silicon mediante MLX y la librería mflux, en la que el adaptador de destilación oficial de 4 pasos (lightx2v/Qwen-Image-Edit-2511-Lightning) se ha fusionado previamente dentro de los pesos del transformer ya cuantizados a 4 bits. El resultado es un checkpoint "todo en uno" que elimina la sobrecarga de LoRA en tiempo de ejecución.

El modelo resuelve un problema práctico muy concreto: ejecutar edición de imágenes guiada por texto en equipos Apple Silicon con memoria unificada limitada (16 GB). La versión original sin cuantizar requiere más de 40 GB de memoria virtual y provoca terminación por falta de memoria; esta distribución cabe en unos 11,5 GB de RAM y completa una edición a 768×768 en 4 pasos y unos 320 segundos, frente a los casi 60 minutos de la versión base cuantizada a 4 bits con 20 pasos.

La relevancia actual radica en que combina tres técnicas: cuantización 4-bit nativa (QuantizedLinear, group_size=64), destilación de pasos (4 pasos a guidance 1.0) y cuantización también del codificador de texto multimodal Qwen 2.5 7B a 4 bits (4,25 GB frente a 14,5 GB en BF16). No se dispone de información sobre el número de parámetros totales del transformer ni sobre la longitud de contexto del codificador de texto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para edición de imágenes (Qwen-Image-Edit) con codificador de texto multimodal Qwen 2.5 7B y VAE; conversión MLX con capas QuantizedLinear (group_size=64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (transformer y text encoder); cuantización nativa MLX con group_size=64 |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (MLX), 7 shards en transformer (~12,4 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit es un transformer de difusión para edición de imágenes condicionada por texto, que combina un codificador de texto multimodal Qwen 2.5 7B con un transformer de difusión y un VAE. Esta distribución concreta no entrena el modelo desde cero: parte de los pesos de Qwen/Qwen-Image-Edit y aplica dos transformaciones. Primero, fusiona (bake) el adaptador de destilación Lightning de 4 pasos (lightx2v/Qwen-Image-Edit-2511-Lightning, 849 MB) directamente en los pesos del transformer. Segundo, cuantiza el transformer completo a 4 bits con capas QuantizedLinear de group_size=64, y también cuantiza el codificador de texto a 4 bits (4,25 GB).

La innovación técnica principal es evitar la recuantización a 8 bits que mflux aplica por defecto al hornear LoRAs (bake_lora=True), que inflaba el modelo a 19,56 GB y provocaba swap masivo. Al pre-fusionar el adaptador en los pesos 4-bit nativos, se elimina la sobrecarga de LoRA en runtime y se usan kernels nativos de multiplicación matricial cuantizada (qmm) sobre Metal. El modelo carga en 1,47 segundos y genera con 4 pasos a guidance 1.0. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset del modelo base en la documentación proporcionada.

## Capacidades

- Edición de imágenes guiada por texto (image-to-image): modifica una imagen de referencia según una instrucción en lenguaje natural, por ejemplo sustituir unas gafas de sol por gafas de aviador azules brillantes.
- Generación de imágenes a partir de texto (text-to-image), según los tags del repositorio.
- Condicionamiento multi-imagen: el benchmark menciona "multi-image conditioning" y el quickstart usa `image_paths` como lista.
- Destilación de 4 pasos: converge con `num_inference_steps=4` y `guidance=1.0`, sin classifier-free guidance de doble pasada.
- Control de resolución y semilla: parámetros `width`, `height` y `seed` expuestos en la API de mflux.
- Gestión de memoria mediante VAE tiling configurable (tiles por dimensión, tamaño y solapamiento para encode y decode).
- Soporte de prompts en inglés (único idioma declarado).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión general más allá de la edición de imágenes.

## Casos de uso

- Edición fotográfica asistida en portátiles Apple Silicon de 16 GB: un usuario carga una foto y aplica instrucciones como cambiar un objeto o un color; el modelo cabe en ~11,5 GB de RAM sin swap, lo que permite trabajar en un M1/M2/M3 con memoria unificada estándar.
- Prototipado rápido de pipelines de edición de imagen: con 4 pasos y carga en 1,47 segundos, el ciclo de iteración prompt-resultado es lo bastante corto para probar variaciones de instrucciones en local sin GPU dedicada.
- Previsualización de ediciones en herramientas de diseño: integrar el modelo en una app macOS que permita al diseñador describir el cambio y ver el resultado en unos 5 minutos a 768×768, antes de pasar a una versión de mayor calidad.
- Automatización de variantes de producto: sustituir fondos, colores o accesorios en imágenes de catálogo mediante instrucciones textuales, aprovechando el condicionamiento multi-imagen para mantener coherencia con la referencia.
- Investigación sobre cuantización y destilación en difusión: el repositorio documenta de forma reproducible la comparativa entre versión base, LoRA dinámico y fusión previa, lo que sirve como caso de estudio de compromisos memoria-latencia en MLX.
- Docencia y demostraciones offline: al ejecutarse íntegramente en local con MLX, permite mostrar edición de imágenes por texto sin depender de servicios en la nube ni de conectividad.

## Benchmarks y rendimiento

Los datos disponibles son medidas de tiempo y memoria del propio autor en un Apple Silicon M1 con 16 GB de memoria unificada, a resolución 768×768 y con el prompt de referencia del oso. No son benchmarks académicos (MMLU, HumanEval, etc.), que no se han publicado en la información disponible.

| Implementacion | Pasos y guidance | Memoria y swap | Tiempo total | Latencia por paso | Velocidad relativa |
|---|---|---|---|---|---|
| Base sin cuantizar (HF original) | 20 pasos, CFG 4.0 | 42 GB virtual, 38 GB swap | Terminación por OOM (código 137) | no disponible | no disponible |
| Qwen Edit base full Q4 | 20 pasos, CFG 4.0 | ~13 GB RAM, 0 GB swap | 59 min 35 s | ~178 s/paso | 1,0x (referencia) |
| Lightning LoRA (bake_lora=True) | 4 pasos, CFG 1.0 | 19,56 GB RAM, 19,75 GB swap | 12 min 14 s | ~178 s/paso | ~5x |
| Lightning LoRA (bake_lora=False) | 4 pasos, CFG 1.0 | ~12,5 GB RAM, 0 GB swap | 6 min 17 s | ~83 s/paso | ~9,5x |
| Este modelo (Q4 pre-fusionado) | 4 pasos, CFG 1.0 | ~11,5 GB RAM, 0 GB swap | 5 min 20 s (320 s) | ~75 s/paso | ~11,2x |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~11,5 GB de RAM en el benchmark a 768×768 con VAE tiling activado; el autor indica consumo total bajo 12 GB.
- Hardware objetivo: Apple Silicon con MLX (probado en M1 de 16 GB). No se documenta soporte para GPU NVIDIA, AMD ni CPU convencional.
- Cabe en equipos consumer Apple Silicon de 16 GB; en configuraciones de 8 GB no hay datos y el margen sería muy ajustado.
- Despliegue: librería mflux sobre MLX, con la clase `QwenImageEdit` y `TilingConfig` para gestión de memoria del VAE.
- Almacenamiento: repositorio de 18,0 GB; transformer en 7 shards de ~12,4 GB y text encoder cuantizado de 4,25 GB.
- Latencia y throughput: ~75 s por paso a 768×768 en M1 de 16 GB; ~320 s totales para 4 pasos; carga del modelo en 1,47 s.
- No se dispone de datos de rendimiento en otras GPU ni de soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen-Image Edit Lightning MLX Q4) | no disponible | no disponible | 320 s a 768×768 en M1 16 GB, 4 pasos | other | Hugging Face, MLX/mflux |
| Qwen/Qwen-Image-Edit (base) | no disponible | no disponible | 59 min 35 s a 768×768 en M1 16 GB con Q4 y 20 pasos; OOM sin cuantizar | no disponible | Hugging Face |
| Qwen-Image-Edit con LoRA Lightning dinámico (bake_lora=False) | no disponible | no disponible | 6 min 17 s a 768×768 en M1 16 GB, 4 pasos | no disponible | Hugging Face, mflux |
| Qwen-Image-Edit con LoRA Lightning horneado a 8 bits (bake_lora=True) | no disponible | no disponible | 12 min 14 s a 768×768 en M1 16 GB, 4 pasos, swap elevado | no disponible | Hugging Face, mflux |

No se dispone de información sobre otros modelos de edición de imágenes comparables (por ejemplo, variantes de FLUX o InstructPix2Pix) en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos en la información disponible; es imprescindible revisar la licencia del modelo base Qwen/Qwen-Image-Edit y del adaptador Lightning antes de cualquier uso comercial.
- Solo se declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad de la edición.
- Los benchmarks son mediciones del propio autor en un único equipo (M1, 16 GB) y una única resolución (768×768); no hay validación independiente.
- El modelo está orientado exclusivamente a Apple Silicon con MLX; no es desplegable en stacks estándar de GPU (vLLM, TGI, llama.cpp, Ollama).
- La cuantización a 4 bits puede introducir pérdida de fidelidad frente al modelo en BF16, aunque el autor afirma fidelidad visual idéntica en su ejemplo; no se aportan métricas objetivas (FID, CLIP score) que lo respalden.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede introducir o eliminar elementos no solicitados en la edición.
- El uso de VAE tiling es necesario para mantenerse dentro de los 16 GB; sin él, el consumo de memoria puede superar el disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ouinche/qwen-image-edit-lightning-mflux-q4-full
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit
- Adaptador de destilación Lightning: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Librería MLX: https://github.com/ml-explore/mlx
- Librería mflux: https://github.com/filipstrand/mflux
