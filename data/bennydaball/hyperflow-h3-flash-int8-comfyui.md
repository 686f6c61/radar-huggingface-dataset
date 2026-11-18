# BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI

## Resumen

HyperFlow H3 Flash INT8 para ComfyUI es una cuantización no oficial en INT8 del modelo de generación de vídeo con audio sincronizado HyperFlow H3 Flash, desarrollado originalmente por Video Rebirth AI. La publica el usuario independiente BennyDaBall y está pensada para ejecutarse dentro de ComfyUI sobre los kernels INT8 nativos de ComfyUI, sin necesidad de convertir a GGUF ni de descomprimir a BF16. El modelo base es un sistema de difusión de vídeo (image-text-to-video) que genera clips con pista de audio estéreo sincronizada en tan solo 6 pasos de muestreo.

La relevancia de esta ficha radica en que se trata de una cuantización "de autor" que, según la model card, reduce el error frente al BF16 original respecto a la cuantización INT8 oficial, manteniendo el mismo tamaño y velocidad. Incluye dos transformadores: `fl2va` (texto, primer fotograma y primer+último fotograma a vídeo con audio) y `ref2va` (imágenes de referencia a vídeo con audio). Se distribuye junto con un nodo cargador propio y flujos de trabajo listos para usar.

El repositorio ocupa 96,7 GB y acumula unas 79.100 descargas y 35 likes en Hugging Face. No se dispone de información sobre el número de parámetros, la longitud de contexto (en el sentido de modelos de lenguaje) ni los idiomas soportados, ya que se trata de un modelo generativo de vídeo y no de un modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión para generación de vídeo con audio (basada en MiniMax H3 / HyperFlow H3 Flash); no se detalla la arquitectura interna |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | INT8 (pesos y activaciones de 8 bits sobre kernels INT8 rotados de ComfyUI) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (etiquetada como `other`) |
| Formato de pesos | Checkpoints INT8 para ComfyUI (no GGUF, no safetensors BF16) |

## Arquitectura y entrenamiento

El modelo es una cuantización INT8 de los transformadores de HyperFlow H3 Flash, un sistema de difusión de vídeo que genera clips con audio sincronizado en pocos pasos (6 en la configuración recomendada). La model card no detalla la arquitectura interna del transformer original (número de capas, dimensión, mecanismo de atención), pero sí indica que se ejecuta sobre los kernels INT8 de ComfyUI con atención rotada y que soporta tanto el modo `fl2va` como el `ref2va`.

La cuantización la realiza el autor a partir de la release BF16 de Video Rebirth, no a partir de los ficheros INT8 oficiales. Según la model card, esta "solución propia" reduce el error por llamada de muestreo y el LPIPS del clip final frente a la cuantización INT8 oficial (por ejemplo, LPIPS de 0,215 frente a 0,236 en `fl2va`). Los pesos se actualizaron el 2026-11-15 y ahora incluyen la entrada de cabecera `hyperflow` oficial, por lo que cargan tanto en el HyperFlow Loader oficial como en el HyperFlow INT8 Loader del autor. No se especifican datos de entrenamiento (tokens, composición del dataset, RLHF/DPO) porque se trata de una cuantización, no de un entrenamiento desde cero.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo sincronizado.
- Generación de vídeo a partir de una imagen (image-to-video) y de primer + último fotograma.
- Generación de vídeo a partir de imágenes de referencia (reference-to-video).
- Generación de audio sincronizado con el vídeo en la misma pasada.
- Muestreo en pocos pasos (6 pasos configurados por defecto).
- Compatibilidad con LoRAs de MiniMax H3 a través del nodo HyperFlow LoRA del pack del autor.
- Compatibilidad con el nodo de atención dispersa (Model Sparse Attention) de ComfyUI para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- **Generación rápida de clips publicitarios**: con 46 s por clip de 5 s en una RTX 5090, permite iterar sobre variaciones de un anuncio corto con audio incluido sin salir de ComfyUI.
- **Prototipado de vídeo para redes sociales**: el modo text-to-video a 1344×768 y 124 fotogramas (5,2 s a 24 fps) encaja en la generación de piezas verticales u horizontales de duración corta.
- **Animación de imágenes fijas**: el modo image-to-video permite dar movimiento a ilustraciones o fotografías con una sola imagen de entrada, útil en motion graphics y contenido editorial.
- **Interpolación guiada por primer y último fotograma**: el modo first+last frame sirve para crear transiciones controladas entre dos imágenes clave, útil en montaje y previsualización.
- **Consistencia de personaje con reference-to-video**: el modo `ref2va` permite mantener la apariencia de un personaje a partir de imágenes de referencia, adecuado para series cortas o avatares animados.
- **Previsualización en pipelines de producción**: al integrarse como nodo de ComfyUI, se puede encadenar con otros nodos (upscale, postproceso, composición) para generar borradores rápidos antes del render final.
- **Generación de audio sincronizado para vídeo mudo**: el modelo produce pista de audio junto al vídeo, lo que simplifica la creación de contenido con sonido sin herramientas adicionales.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad frente al BF16 original y tiempos de inferencia, no benchmarks estándar de calidad (MMLU, HumanEval, etc.), que no aplican a un modelo de vídeo.

| Medida | INT8 oficial | Esta cuantización |
|---|---:|---:|
| `fl2va`, error de imagen por llamada de muestreo | 5,4 % | 4,2 % |
| `fl2va`, error de sonido por llamada de muestreo | 3,4 % | 3,2 % |
| `fl2va`, LPIPS del clip final (10 prompts) | 0,236 | 0,215 |
| `ref2va`, error de imagen por llamada de muestreo | 4,0 % | 3,4 % |
| `ref2va`, error de sonido por llamada de muestreo | 3,1 % | 2,8 % |
| `ref2va`, LPIPS del clip final (8 prompts) | 0,237 | 0,216 |

Tiempos de inferencia en una RTX 5090 (32 GB) con 64 GB de RAM, ComfyUI con atención CK, text-to-video a 1344×768, 124 fotogramas con audio, CFG 1:

| Configuración | Pasos | s/it | Media por clip |
|---|---:|---:|---:|
| Este repo (`fl2va`), patcher legacy | 6 | 5,4 | 46,1 s |
| Este repo + Model Sparse Attention (sol-attn, tau 1,25) | 6 | 4,2 | ~38 s |
| GGUF `Q4_K_M` oficial + nodos HyperFlow oficiales | 6 | 8,6 | 66,0 s |
| GGUF `Q8_0` oficial + nodos HyperFlow oficiales | 6 | 8,4 | 64,4 s |
| MiniMax H3 estándar | 20 | 6,3 | 139,1 s |

Pico de VRAM en la ejecución legacy: 23,6 GiB (24.209 MiB, medido con nvidia-smi incluyendo el escritorio).

## Requisitos de hardware

- **VRAM estimada**: pico de 23,6 GiB en la configuración legacy reportada por el autor (RTX 5090 de 32 GB).
- **GPU recomendadas**: RTX 5090 (32 GB) es la referencia de las mediciones; no se documentan pruebas en A100, H100 ni otras GPU.
- **¿Cabe en GPU de consumo?**: sí, en una RTX 5090 de 32 GB según la model card; no se confirma su funcionamiento en GPU con menos VRAM.
- **Memoria del sistema**: 64 GB de RAM en la máquina de referencia.
- **Opciones de despliegue**: ComfyUI con los kernels INT8 nativos, el nodo oficial ComfyUI-HyperFlow-Flash y el nodo `comfyui_hyperflow_int8_nodes` del autor; también funciona con el HyperFlow Loader oficial. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: 46,1 s por clip de 5,2 s en RTX 5090 con patcher legacy; ~38 s con atención dispersa; 5,4 s/it y 4,2 s/it respectivamente.

## Comparativa con modelos similares

| Modelo | Formato | Pasos | Tiempo por clip (RTX 5090) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| HyperFlow H3 Flash INT8 (este repo) | INT8 ComfyUI | 6 | 46,1 s | minimax-h3-community | Hugging Face (no oficial) |
| HyperFlow H3 Flash GGUF `Q4_K_M` oficial | GGUF | 6 | 66,0 s | minimax-h3-community | Hugging Face (oficial) |
| HyperFlow H3 Flash GGUF `Q8_0` oficial | GGUF | 6 | 64,4 s | minimax-h3-community | Hugging Face (oficial) |
| MiniMax H3 estándar | BF16 | 20 | 139,1 s | minimax-h3-community | Hugging Face (oficial) |

No se dispone de comparación con otros modelos de vídeo de la competencia (por ejemplo, modelos de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- **Cuantización no oficial**: no está publicada por Video Rebirth; el autor la distribuye como "unofficial". La calidad puede diferir de la versión oficial.
- **Licencia restrictiva**: se rige por el `minimax-h3-community-license-agreement`; es necesario revisar sus términos antes de cualquier uso comercial.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un modelo generativo de vídeo puede heredar sesgos del dataset de entrenamiento original.
- **Alucinación visual**: como todo modelo de difusión, puede generar contenido incoherente o no fiel al prompt; la cuantización INT8 añade un error adicional medible (LPIPS ~0,215 frente a BF16).
- **Idiomas**: no se especifican los idiomas soportados en prompts de texto.
- **Hardware**: las mediciones se limitan a una RTX 5090; no hay datos de rendimiento en otras GPU ni en configuraciones multi-GPU.
- **Atención dispersa**: el uso de Model Sparse Attention acelera la inferencia pero aproxima la atención, por lo que la salida no es idéntica a la atención densa.
- **Compatibilidad de LoRAs**: es necesario usar el nodo HyperFlow LoRA del pack del autor; un cargador de LoRAs estándar aplica las LoRAs a bloques incorrectos de este modelo podado.
- **Actualización de pesos**: los pesos se actualizaron el 2026-11-15; es necesario volver a descargar los ficheros para obtener la nueva versión.

## Enlaces

- [Hugging Face: BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI](https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI)
- [Modelo base: VideoRebirthAI/hyperflow-h3-flash](https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash)
- [Repositorio del nodo: comfyui_hyperflow_int8_nodes](https://github.com/BennyDaBall930/comfyui_hyperflow_int8_nodes)
- [Nodo oficial: ComfyUI-HyperFlow-Flash](https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash)
- [Revisión inicial de los pesos (`b5d22a34`)](https://huggingface.co/BennyDaBall/HyperFlow-H3-Flash-INT8-ComfyUI/tree/b5d22a34bfb159b0bc559458aac3412d0647f743)
- [Perfil del autor en X: @BennyDaBall_OG](https://x.com/BennyDaBall_OG)
- [Ko-fi del autor](https://ko-fi.com/bennydaball)
