# infosave/MiniMax-H3-Tiny-FewStep-cmf

## Resumen

MiniMax-H3-Tiny-FewStep-cmf es un paquete de inferencia del modelo de generación de vídeo con audio MiniMax-H3, destilado a 17.000 millones de parámetros y optimizado para generar clips en pocos pasos de denoising. Lo publica el usuario `infosave` sobre el modelo base `H3-Tiny/MiniMax-H3-Tiny-ComfyUI`, y combina en un único fichero CMF el DiT de 4 bits, el codificador de prompts Qwen3-VL-4B (con su torre de visión y ClipProj), el VAE de vídeo y el decodificador de audio estéreo. El resultado es un artefacto de 13,0 GB que cabe íntegro en una GPU de 12 GB.

La relevancia del modelo está en su enfoque de despliegue: no requiere Python ni frameworks de ML, sino `cortiq`, un motor escrito en Rust que ejecuta el mismo fichero sobre CUDA, Vulkan o Metal. El modelo base es MiniMax-H3 podado a 42 bloques con una FFN más estrecha y destilado con MeanFlow a seis pasos (funciona con cuatro o más), lo que reduce drásticamente el coste de denoising frente a los modelos de difusión de vídeo convencionales.

La ficha se centra en lo que documenta el autor: generación texto-a-vídeo-con-audio y referencia-a-vídeo (Ref2VA), resolución de trabajo 512×288 y 768×448, clips de hasta 73 fotogramas a 24 fps y una licencia comunitaria específica (`minimax-h3-community`). No hay datos publicados sobre benchmarks estándar, idiomas soportados ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) destilado con MeanFlow; codificador de prompts Qwen3-VL-4B con torre de visión y ClipProj; VAE de vídeo y decodificador de audio estéreo |
| Parametros totales | 17 000 millones (DiT, 42 bloques, FFN estrecha); el paquete incluye además Qwen3-VL-4B y los decodificadores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto se procesa con Qwen3-VL-4B; longitud máxima no documentada) |
| Tipos de cuantizacion | 4-bit (DiT y Qwen3-VL-4B); el fichero CMF empaqueta los pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | `minimax-h3-community` (licencia comunitaria de MiniMax H3) |
| Formato de pesos | CMF (fichero único del motor `cortiq`); el modelo base se distribuye en safetensors bf16 |
| Tamano del repositorio | 13,0 GB |
| Resoluciones de salida | 512×288 y 768×448 (múltiplos de 32; entrenado con lado corto de 768) |
| Fotogramas | 24 fps, redondeado a 17k+5 (39, 56, 73…); 39 por defecto |
| Pasos de denoising | 6 por defecto; 4 más rápido, 8 añade detalle |
| Backends | CUDA, Vulkan, Metal |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) derivado de MiniMax-H3, podado de su tamaño original a 17.000 millones de parámetros mediante la reducción a 42 bloques y una FFN más estrecha. Sobre esa versión podada se aplica una destilación con MeanFlow: en lugar de predecir el ruido en cada paso, el modelo predice la velocidad media a lo largo del paso y lee tanto el punto final como el inicial. Esto permite reducir el muestreo a seis pasos (o cuatro, con menor calidad), frente a las decenas de pasos típicas en modelos de difusión de vídeo.

El paquete no contiene solo el DiT: integra un codificador de prompts Qwen3-VL-4B cuantizado a 4 bits con su torre de visión y ClipProj (para procesar las imágenes de referencia en Ref2VA), un VAE de vídeo y un decodificador de audio estéreo. Todo se empaqueta en un único fichero CMF de 13,0 GB que el motor `cortiq` (Rust, sin Python ni frameworks de ML) carga y ejecuta. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con pista de audio estéreo sincronizada.
- Generación de vídeo a partir de imágenes de referencia (Ref2VA): las imágenes se nombran en el prompt como `<Picture 1>`, `<Picture 2>`, etc., y conservan su relación de aspecto al área del clip.
- Generación de audio integrada: el modelo produce una banda sonora estéreo que se guarda dentro del AVI (MJPEG) y además como fichero `.wav` independiente.
- Control de resolución (múltiplos de 32), número de fotogramas (17k+5 a 24 fps), pasos de denoising (4, 6, 8), semilla y calidad JPEG de los fotogramas.
- Ejecución multiplataforma desde el mismo fichero: CUDA en NVIDIA, Vulkan en NVIDIA/AMD/Intel y Metal en Apple Silicon.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- **Generación rápida de clips para prototipado creativo**: con 512×288 y 39 fotogramas en 24 s (4 pasos) sobre una RTX 3060, el modelo sirve para iterar storyboards y conceptos visuales con audio en una GPU de consumo.
- **Vídeo con referencias visuales para publicidad y moda**: el modo Ref2VA permite introducir dos o más imágenes de producto o personaje y describir la escena en el prompt, manteniendo la identidad visual de las referencias en el clip generado.
- **Contenido para redes sociales con audio integrado**: la salida incluye pista estéreo sincronizada y formato MJPEG AVI, adecuada para generar clips cortos de 1,6 a 3 s listos para postproducción.
- **Despliegue en hardware de gama media**: al caber en 12 GB de VRAM (10,5 GiB de pico en 512×288), es viable en estaciones con RTX 3060, 4060 Ti o similares, sin necesidad de GPUs de datacenter.
- **Portabilidad en macOS y equipos sin CUDA**: el mismo fichero funciona sobre Metal en un MacBook Air M4 (24 GB), lo que permite generar clips en portátiles Apple sin infraestructura adicional.
- **Investigación en destilación de modelos de difusión**: el uso de MeanFlow con seis pasos sobre un DiT podado ofrece un caso práctico para estudiar compromisos entre pasos de denoising, calidad y latencia.
- **Pipelines de generación por lotes**: la CLI `cortiq animate` con parámetros de semilla, resolución y pasos permite automatizar la generación de variaciones en scripts y flujos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench, etc.) en la información disponible. El autor sí documenta tiempos de inferencia medidos:

| Clip | Pasos | Referencias | Denoising | Decoder vídeo | Decoder audio | Total | VRAM pico |
|---|---:|---:|---:|---:|---:|---:|---:|
| 512×288, 39 frames (CUDA, RTX 3060) | 4 | — | 13,6 s | 7,1 s | 1,7 s | 24,1 s | 10,5 GiB |
| 512×288, 39 frames (CUDA, RTX 3060) | 6 | — | 20,1 s | 7,1 s | 1,7 s | 30,4 s | 10,5 GiB |
| 512×288, 39 frames (CUDA, RTX 3060) | 4 | 2 | 17,9 s | 7,0 s | 1,7 s | 32,5 s | 10,7 GiB |
| 512×288, 39 frames (CUDA, RTX 3060) | 6 | 2 | 26,3 s | 7,0 s | 1,7 s | 40,9 s | 10,7 GiB |
| 768×448, 73 frames (CUDA, RTX 3060) | 6 | 2 | 109,0 s | 18,8 s | 3,0 s | 144,7 s | 11,4 GiB |
| 512×288, 39 frames (Vulkan, RTX 3060) | 4 | — | — | — | — | 34,7 s | 9,4 GiB |
| 512×288, 39 frames (Vulkan, RTX 3060) | 6 | 2 | — | — | — | 63,2 s | 9,4 GiB |
| 512×288, 39 frames (Metal, M4) | 4 | — | 91,2 s | — | — | 148 s | no disponible |

## Requisitos de hardware

- **VRAM estimada**: 10,5 GiB en 512×288 con 4 o 6 pasos; 10,7 GiB con dos referencias; 11,4 GiB en 768×448 con 73 fotogramas (medido en RTX 3060 con CUDA). Sobre Vulkan, 9,4 GiB de pico.
- **GPU recomendadas**: RTX 3060 de 12 GB (medida de referencia del autor); cualquier GPU NVIDIA con ≥12 GB para CUDA; GPUs AMD e Intel vía Vulkan; Apple Silicon vía Metal (probado en M4 con 24 GB).
- **Cabe en GPU de consumo**: sí, en tarjetas de 12 GB o más. El autor señala explícitamente que "el DiT completo cabe en una tarjeta de 12 GB".
- **Opciones de despliegue**: motor `cortiq` (Rust), instalable con `cargo install cortiq-cli --features cuda` o mediante binarios precompilados para Linux, macOS y Windows en la página de releases. Variables `CMF_GPU=cuda` para CUDA y `CMF_GPU=1` para Vulkan. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: 24,1 s para un clip de 39 fotogramas a 512×288 en 4 pasos (CUDA, RTX 3060); 148 s en Metal sobre M4 para el mismo clip. La comparación del autor con su modelo MiniMax-H3 Turbo en la misma tarjeta muestra 408 s para 512×288, lo que da una idea de la aceleración obtenida por la destilación few-step.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / fotogramas | Pasos | Tiempo 512×288, 39 frames (RTX 3060) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-Tiny-FewStep-cmf | 17 B (DiT) | 512×288 y 768×448; hasta 73 frames | 4-6 | 24,1 s (4 pasos) | `minimax-h3-community` | Hugging Face, motor `cortiq` |
| MiniMax-H3-Turbo-cmf (mismo autor) | 20 B (DiT) | 512×288 y 768×448 | 4 | 408 s | licencia MiniMax H3 | Hugging Face, motor `cortiq` |
| MiniMax-H3-Tiny-ComfyUI (modelo base) | 17 B (DiT) | no disponible | no disponible (bf16) | no disponible | licencia MiniMax H3 | Hugging Face, ComfyUI |

La comparativa se limita a las variantes de la familia MiniMax-H3 documentadas por el autor; no se dispone de datos de otros modelos de generación de vídeo con audio comparables en la información proporcionada.

## Limitaciones y advertencias

- **Licencia comunitaria**: la licencia `minimax-h3-community` no es una licencia de código abierto estándar; es responsabilidad del usuario revisar sus términos antes de un uso comercial.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el codificador de prompts ni el modelo; el prompt de ejemplo está en inglés y no hay garantía de comportamiento en castellano.
- **Resolución y duración limitadas**: el modelo está entrenado con lado corto de 768 y genera clips de hasta 73 fotogramas (unos 3 s a 24 fps); no es adecuado para vídeo de larga duración ni alta resolución.
- **Riesgo de alucinación visual**: como modelo generativo, puede producir contenido incoherente, artefactos en movimiento, anatomías incorrectas o audio desincronizado, especialmente con prompts ambiguos o referencias de baja calidad.
- **Dependencia del motor `cortiq`**: el fichero CMF solo se ejecuta con `cortiq` 0.9.17 o superior; no es compatible con ComfyUI, diffusers ni otras herramientas estándar sin conversión.
- **Sesgos no evaluados**: no se han publicado evaluaciones de sesgos demográficos, culturales o de contenido; el modelo puede reproducir sesgos presentes en sus datos de entrenamiento.
- **Requisitos de hardware concretos**: aunque cabe en 12 GB, el rendimiento en GPUs de gama baja o sin CUDA (Vulkan, Metal) es notablemente inferior (34,7 s en Vulkan frente a 24,1 s en CUDA para el mismo clip).
- **Formato de salida específico**: la salida es MJPEG AVI con audio estéreo interno más un `.wav`; requiere postprocesado para integrarse en pipelines de vídeo profesionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/infosave/MiniMax-H3-Tiny-FewStep-cmf)
- [Modelo base: H3-Tiny/MiniMax-H3-Tiny-ComfyUI](https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI)
- [Repositorio del motor CMF / cortiq](https://github.com/infosave2007/cmf)
- [Página de releases de cortiq](https://github.com/infosave2007/cmf/releases)
- [MiniMax-H3 Turbo-cmf (modelo comparable del mismo autor)](https://huggingface.co/infosave/MiniMax-H3-Turbo-cmf)
- [Ejemplo Ref2VA 768×448 (mp4)](https://huggingface.co/infosave/MiniMax-H3-Tiny-FewStep-cmf/resolve/main/samples/frog_ref2va_768x448.mp4)
- [Ejemplo texto-a-vídeo 4 pasos 512×288 (mp4)](https://huggingface.co/infosave/MiniMax-H3-Tiny-FewStep-cmf/resolve/main/samples/frog_t2va_4step_512x288.mp4)
