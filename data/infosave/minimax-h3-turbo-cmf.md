# infosave/MiniMax-H3-Turbo-cmf

## Resumen

MiniMax-H3-Turbo-cmf es una distribución cuantizada y empaquetada del modelo MiniMax-H3, un sistema de generación de vídeo con audio sincronizado desarrollado por MiniMax y distribuido originalmente a través de Comfy-Org. Esta versión, publicada por el usuario infosave, integra el LoRA Turbo de larryvrh para reducir la generación a cuatro pasos de muestreo y empaqueta todos los componentes (el transformer DiT, el codificador de prompts Qwen3-VL, el decodificador VAE de vídeo y el vocoder de audio) en un único fichero de memoria mapeada con formato CMF.

El modelo resuelve la generación conjunta de imagen y sonido en un solo transformer: una única secuencia empaquetada denoisa vídeo y audio estéreo sincronizado a partir de un prompt textual. La innovación principal de esta distribución es la reducción drástica del espacio de almacenamiento y de los requisitos de infraestructura: frente a los 124,4 GB del checkout de referencia (cuatro ficheros más una instalación de ComfyUI), aquí se ofrece un único fichero de entre 13,2 y 23,9 GB, ejecutable mediante `cortiq`, un binario Rust sin Python, PyTorch ni toolkit CUDA por debajo.

La relevancia actual del modelo reside en su enfoque de despliegue: cuantización de 4 bits con kernels fusionados, soporte de keyframes (primer y último fotograma), y compatibilidad con backends CUDA, Vulkan y Metal, lo que permite ejecutar generación de vídeo con audio en GPUs de consumo de 16-24 GB. El repositorio acumula 1273 descargas y 12 likes desde su creación en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DiT (diffusion transformer) con secuencia empaquetada para vídeo y audio; codificador de prompts Qwen3-VL; VAE de vídeo y vocoder de audio |
| Parametros totales | 47,83 B (2 361 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (q4tp), 8 bits (q8_2f, int8 de dos campos), 2 bits (q2tp, publicado como vía muerta) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (contenedor de memoria mapeada con hash por tensor) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 emplea un transformer de difusión (DiT) que procesa vídeo y audio de forma conjunta en una única secuencia empaquetada: un solo transformer denoisa imagen y sonido simultáneamente, con dos planificaciones de flujo (flow schedules). El codificador de prompts es Qwen3-VL, que aporta capacidad de comprensión visual además de textual; el modelo incluye un VAE para decodificar el vídeo y un vocoder para el audio estéreo. La variante Turbo incorpora el LoRA de larryvrh, fusionado directamente en los pesos, que reduce la generación a cuatro pasos de muestreo.

La distribución CMF integra todos los componentes en un único fichero con hash por tensor, verificado mediante `cortiq verify`. Se ofrecen variantes con y sin torre de visión (sufijo `fl2va` para keyframes), y una variante compacta `clipproj4b` que sustituye el codificador completo de 32B por uno de 4B más una proyección ClipProj, reduciendo el fichero a 13,16 GB con un pico de 15,1 GB de VRAM. La variante de 8 bits emplea una cuantización int8 de dos campos (`w = q·row[o]·col[i]`) con mayor fidelidad de pesos, aunque sin los kernels fusionados que ofrece q4tp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo sincronizado en una sola pasada del transformer.
- Generación condicionada por primer fotograma (image-to-video) y por último fotograma, con anclaje de geometría y recorte cover-crop respectivamente.
- Comprensión visual del prompt mediante la torre de visión de Qwen3-VL: la imagen de condicionamiento se codifica como bloque visual (`"<Picture 1>: "`) además de como latente VAE.
- Generación de audio integrada: el vocoder produce sonido sincronizado con la escena (por ejemplo, siseo de sartén y ladrido en el ejemplo de la model card).
- Muestreo en cuatro pasos gracias al LoRA Turbo fusionado.
- Ejecución sin framework de ML: binario Rust `cortiq` con backends CUDA, Vulkan y Metal.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning; el pipeline es exclusivamente text-to-video.

## Casos de uso

- Prototipado rápido de vídeo generativo en estación de trabajo: con el fichero compacto de 13,16 GB y una GPU de 16-20 GB, un clip de 512×288 y 39 fotogramas se renderiza en 19,5 s sobre CUDA, lo que permite iterar sobre prompts en ciclos cortos.
- Generación de clips con audio para redes sociales y previsualizaciones: el modelo produce vídeo y sonido sincronizado en una sola inferencia, eliminando el paso separado de Foley o doblaje en borradores de contenido.
- Animación de keyframes en pipelines de previsualización: usando `--first-frame` y `--last-frame` con ficheros P6 PPM, se pueden interpolar transiciones entre dos imágenes de referencia para storyboards animados.
- Despliegue en hardware heterogéneo sin Python: al ser un binario Rust con backends Vulkan y Metal, permite renderizar en equipos con macOS Apple Silicon o GPUs AMD sin instalar PyTorch ni CUDA toolkit, útil en entornos de investigación con hardware mixto.
- Integración en herramientas de creación de contenido offline: el formato de un solo fichero con memoria mapeada facilita distribuir el modelo junto a una aplicación de escritorio sin dependencias de ComfyUI.
- Evaluación de cuantización en producción: las variantes q4tp, q8_2f y q2tp permiten medir el compromiso entre fidelidad y VRAM en un mismo prompt y semilla, útil para equipos que calibran despliegues de difusión.
- Investigación sobre generación conjunta audio-vídeo: la secuencia empaquetada única y las dos planificaciones de flujo ofrecen un banco de pruebas para estudiar coherencia audiovisual en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible. La model card proporciona únicamente métricas de latencia y memoria:

| Metrica | Valor |
|---|---|
| Clip de referencia | 512×288, 39 fotogramas, semilla 42, 4 pasos |
| Latencia en RTX A5000 (CUDA) | 19,5 s |
| Latencia en RTX A5000 (Vulkan) | 25,8 s |
| Latencia con 4 GB de VRAM | 22,4 s |
| VRAM pico (fichero compacto 13,16 GB) | 15,1 GB |
| Tamano del checkout de referencia | 124,4 GB (4 ficheros + ComfyUI) |
| Tamano del fichero CMF | 13,2 a 23,9 GB segun variante |

## Requisitos de hardware

- VRAM estimada: 24 GB o más para los ficheros completos (`mmh3-turbo-fl2va-q4tp.cmf` de 23,94 GB y `mmh3-turbo-q4tp.cmf` de 23,47 GB); 16-20 GB para el compacto `mmh3-turbo-clipproj4b-q4tp.cmf` (13,16 GB, pico de 15,1 GB); 16-24 GB para `mmh3-turbo-clipproj4b-fl2va-q4tp.cmf` (14,48 GB); 32 GB o más para la variante de 8 bits `mmh3-turbo-clipproj4b-fl2va-v2-q8_2f.cmf` (26,90 GB).
- GPU recomendadas: RTX A5000 validada en la model card; por requisitos de VRAM, encajan A100, H100, RTX 4090 (24 GB) para los ficheros completos, y RTX 4080/4070 Ti Super o similares de 16 GB para el compacto.
- Cabe en GPU de consumo: sí, el fichero compacto de 13,16 GB en tarjetas de 16 GB; los completos requieren 24 GB (RTX 4090, RTX 3090).
- Opciones de despliegue: `cortiq` (binario Rust, instalable vía `cargo install cortiq-cli` con Rust 1.85+, o archivos precompilados para Linux x86-64, macOS Apple Silicon e Intel, Windows x86-64 y ARM64); backends CUDA, Vulkan y Metal. No requiere Python, PyTorch, CUDA toolkit ni ffmpeg.
- Latencia y throughput: 19,5 s por clip de 39 fotogramas a 512×288 en RTX A5000 con CUDA; 25,8 s sobre Vulkan; 22,4 s con solo 4 GB de VRAM. No se documenta throughput para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Turbo-cmf (esta ficha) | 47,83 B | no disponible | Apache 2.0 | CMF, binario Rust `cortiq` | 4 pasos, audio sincronizado, fichero único de 13,2-23,9 GB |
| MiniMax-H3 (Comfy-Org, referencia) | no disponible | no disponible | no disponible | Checkout de 124,4 GB + ComfyUI | Modelo base sin LoRA Turbo; requiere Python/PyTorch |
| MiniMax-H3-Turbo-Lora (larryvrh) | no disponible | no disponible | no disponible | LoRA | Adaptador de 4 pasos, aquí fusionado en los pesos |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, tamaño y licencia.

## Limitaciones y advertencias

- La variante de 2 bits (`mmh3-turbo-fl2va-q2tp.cmf`, 18,74 GB) se publica explícitamente como vía muerta: el autor advierte de no renderizar con ella.
- La proyección ClipProj del fichero compacto se ajustó sobre activaciones del codificador solo de texto; con imagen en el prompt, la calidad de condicionamiento en escenas complejas aún se está comparando con los ficheros de codificador completo, según el propio autor.
- La tercera ruta de la release original, `ref2va`, no está portada.
- La variante de 8 bits carece de los kernels fusionados de q4tp, lo que puede afectar al rendimiento además de exigir 32 GB de VRAM.
- El modelo base no documenta sesgos conocidos ni tasas de alucinación en la información disponible; al ser un generador de vídeo, el riesgo principal es la generación de contenido visual o auditivo no fiel al prompt.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe del codificador de prompts.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los modelos base (Comfy-Org/MiniMax-H3 y el LoRA de larryvrh), cuya licencia no se detalla en la información proporcionada.
- El formato CMF y el runtime `cortiq` son específicos de este ecosistema; no hay integración documentada con vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/MiniMax-H3-Turbo-cmf
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- LoRA Turbo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Contenedor CMF (repositorio): https://github.com/infosave2007/cmf
- Releases del runtime `cortiq`: https://github.com/infosave2007/cmf/releases/latest
