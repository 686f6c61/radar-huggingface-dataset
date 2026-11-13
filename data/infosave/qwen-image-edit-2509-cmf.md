# infosave/Qwen-Image-Edit-2509-cmf

## Resumen

Qwen-Image-Edit-2509-cmf es una cuantización y empaquetado del modelo de edición de imágenes Qwen-Image-Edit-2509 de Alibaba Qwen, preparada por el usuario infosave para su uso con cortiq, un runtime de inferencia nativo escrito en Rust. El modelo original es un pipeline de difusión image-to-image que combina un transformer de difusión con un codificador de texto y visión Qwen2.5-VL, un VAE y un scheduler; este paquete lo consolida en un único archivo listo para ejecutar sin depender del stack de Python de Hugging Face.

La relevancia de esta ficha no está en el modelo base, sino en el formato de distribución: un archivo `.cmf` de 30,8 GB que incluye transformer, encoder, tokenizer, processor, VAE y scheduler, ejecutable tanto sobre CUDA como sobre Vulkan. Según la model card, en una RTX A5000 (24 GB) una edición de 1024×1024 con 8 pasos y CFG 4 tarda 105,8 s en CUDA y 148,1 s en Vulkan, y con `CMF_GPU_VRAM_MB=8000` cabe en tarjetas de 8 GB con un pico de 7,4 GB.

El autor advierte explícitamente de que la validación de calidad de imagen está incompleta, por lo que debe tratarse como una build funcional pero no certificada para producción. La licencia del paquete es Apache-2.0 y los idiomas declarados son inglés, ruso y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (Qwen-Image-Edit-2509) con encoder de texto/vision Qwen2.5-VL, VAE y scheduler |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no se declara ventana de tokens) |
| Tipos de cuantizacion | Q4TP (transformer de difusion); el transformer se convirtio desde el GGUF Q6_K de QuantStack |
| Idiomas soportados | en, ru, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.cmf` (formato propietario de cortiq); componentes separados: `transformer.cmf`, `text_encoder.cmf`, `vae.cmf`, `scheduler_config.json` |
| Tamano del repositorio | 30,8 GB |
| Pipeline | image-to-image |
| Backends | CUDA y Vulkan |
| Libreria / runtime | cortiq 0.8.80 o superior |
| Modelo base | Qwen/Qwen-Image-Edit-2509 |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo base Qwen-Image-Edit-2509: un transformer de difusion para la generacion de la imagen editada, acondicionado por un encoder Qwen2.5-VL que procesa tanto el prompt de texto como la imagen de referencia, un VAE para codificar y decodificar en el espacio latente, y un scheduler que gobierna el muestreo. El autor no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO); toda esa información corresponde a la model card original de Qwen, que no se incluye en la información proporcionada.

La innovación técnica de este paquete es de infraestructura, no de modelado. Según la model card, cortiq 0.8.80 mantiene todos los bloques del transformer de un paso en la tarjeta gráfica en una sola llamada, tanto sobre CUDA como sobre Vulkan, y ejecuta también en GPU las convoluciones y la atención del VAE. Además, el parámetro `CMF_GPU_VRAM_MB` permite fijar un presupuesto de VRAM: los primeros bloques residen en la tarjeta y el resto se transfieren en cada paso, lo que hace viable la edición en GPUs de 8 GB. La conversión del transformer parte del GGUF Q6_K de QuantStack y se recuantiza a Q4TP; el resto de componentes proviene del repositorio oficial de Qwen.

## Capacidades

- Edición de imágenes guiada por prompt en lenguaje natural (image-to-image), con instrucciones como añadir, eliminar o modificar elementos de la imagen de entrada.
- Acondicionamiento multimodal mediante el encoder Qwen2.5-VL, que procesa conjuntamente la imagen de referencia y el texto del prompt.
- Control de resolución de salida mediante `--height` y `--width` (ejemplo documentado: 1024×1024).
- Control del proceso de muestreo mediante `--steps`, `--cfg`, `--seed` y `--reference-size`.
- Ejecución nativa en Rust a través de cortiq, sin dependencia del stack de Python de Hugging Face.
- Soporte de dos backends de GPU: CUDA (requiere compilación con `--features cuda`) y Vulkan (incluido en los binarios precompilados).
- Soporte de prompts en inglés, ruso y chino, según los idiomas declarados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni modo thinking.

## Casos de uso

- Edición fotográfica asistida por prompt: sustituir fondos, añadir o quitar objetos o cambiar prendas de vestir en una imagen de 1024×1024, usando el pipeline de un solo archivo con `cortiq imagine` y un prompt descriptivo. Adecuado por la simplicidad de despliegue y la ausencia de dependencias Python.
- Prototipado rápido en estaciones de trabajo con GPU consumer: con `CMF_GPU_VRAM_MB=8000` el modelo cabe en tarjetas de 8 GB, lo que permite iterar sobre prompts y semillas en hardware asequible con un pico de 7,4 GB.
- Despliegue en entornos con Vulkan pero sin CUDA: el backend Vulkan (148,1 s por edición de 8 pasos en una RTX A5000) permite usar el modelo en configuraciones donde el stack CUDA no está disponible o no se quiere instalar.
- Integración en herramientas de escritorio nativas en Rust: al ser un runtime Rust sin Python, puede embeberse en aplicaciones de edición de imagen de escritorio que necesiten edición generativa local sin servicios en la nube.
- Procesamiento por lotes de imágenes con requisitos de privacidad: la inferencia local evita enviar imágenes a APIs externas, lo que encaja en flujos donde los datos no pueden salir de la infraestructura propia.
- Evaluación comparativa de backends y presupuestos de VRAM: los parámetros de configuración documentados permiten medir tiempos y picos de memoria en distintas GPUs antes de comprometerse con un despliegue, aunque la validación de calidad de imagen está pendiente según el autor.
- Localización de contenido visual para mercados en inglés, ruso y chino: los prompts pueden redactarse en esos tres idiomas, útil para equipos que generan variantes regionales de material gráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. El autor indica explícitamente que la validación de calidad de imagen está incompleta. Los únicos datos de rendimiento publicados son tiempos de inferencia medidos en una NVIDIA RTX A5000 (24 GB), edición de 1024×1024, CFG 4, seed 7, build de release y ejecuciones individuales:

| Backend | Pasos | Tiempo | Version anterior (antes de 0.8.80) |
|---|---|---|---|
| CUDA (`CMF_GPU=cuda`) | 8 | 105,8 s | 464 s |
| Vulkan (`CMF_GPU=1`) | 8 | 148,1 s | 442,5 s |
| CUDA con `CMF_GPU_VRAM_MB=8000` | 8 | 115,1 s (pico 7,4 GB) | no disponible |
| CUDA | 40 | 371,6 s | no disponible |

## Requisitos de hardware

- VRAM: el pipeline completo en una GPU de 24 GB funciona sin restricciones; con `CMF_GPU_VRAM_MB=8000` la edición cabe en una tarjeta de 8 GB (pico medido de 7,4 GB) a costa de transferir bloques en cada paso.
- GPU recomendadas: NVIDIA RTX A5000 (24 GB) es la referencia medida por el autor; cualquier GPU con soporte CUDA 12.x o Vulkan debería ser compatible, aunque no se documentan mediciones en otros modelos.
- GPU consumer: sí, cabe en tarjetas de 8 GB en modo CUDA con presupuesto de VRAM limitado; no se especifican modelos concretos más allá del requisito de 8 GB.
- Despliegue: exclusivamente mediante cortiq 0.8.80 o superior (`cortiq imagine`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de imagen.
- CUDA: requiere compilar con `cargo install cortiq-cli --features cuda`, con driver y librerías CUDA 12.x; los binarios precompilados no incluyen el backend CUDA.
- Vulkan: disponible en los binarios precompilados, activado con `CMF_GPU=1`.
- Latencia: 105,8 s (CUDA) y 148,1 s (Vulkan) por edición de 8 pasos en RTX A5000; 371,6 s para el recetario de 40 pasos en CUDA. No se publica throughput para lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2509-cmf (este) | no disponible | no disponible | `.cmf` (cortiq) | Apache-2.0 | Cuantizado Q4TP, runtime Rust, CUDA y Vulkan, validación de calidad incompleta |
| Qwen/Qwen-Image-Edit-2509 (base) | no disponible | no disponible | safetensors (stack Hugging Face) | Apache-2.0 | Modelo original de Qwen; requiere Python y el ecosistema diffusers/transformers |
| QuantStack/Qwen-Image-Edit-2509-GGUF | no disponible | no disponible | GGUF | Apache-2.0 (heredada) | Fuente del transformer Q6_K usado en esta conversión; orientado a runtimes GGUF |
| Otros modelos de edición de imagen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni especificaciones en la información proporcionada para establecer una comparación cuantitativa |

## Limitaciones y advertencias

- Validación de calidad incompleta: el propio autor advierte de que la edición nativa funciona pero la validación de calidad de imagen no está terminada; no debe asumirse paridad con el modelo base sin evaluarla.
- Sin benchmarks de calidad: no hay métricas publicadas (FID, CLIP, evaluaciones humanas) que permitan comparar la fidelidad de edición frente al modelo original.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; los sesgos del modelo base dependen de sus datos de entrenamiento, no descritos aquí.
- Alucinación visual: como todo modelo generativo de imagen, puede introducir o alterar elementos no solicitados; no hay datos publicados sobre la frecuencia de estos fallos en esta versión cuantizada.
- Idiomas: solo se declaran en, ru y zh; el comportamiento con prompts en castellano no está verificado ni documentado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen-Image-Edit-2509 y del GGUF de QuantStack del que deriva la conversión.
- Dependencia de runtime: requiere cortiq 0.8.80 o superior; el backend CUDA exige compilación propia con las librerías CUDA 12.x, lo que añade complejidad de despliegue.
- Formato propietario: `.cmf` no es compatible con el ecosistema estándar (diffusers, ComfyUI, etc.), lo que limita la portabilidad y las herramientas disponibles.
- Repositorio de bajo uso: 112 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Sin datos de entrenamiento documentados: no se detallan tokens, composición del dataset ni técnicas de alineación del modelo base en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Qwen-Image-Edit-2509-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- GGUF de origen del transformer: https://huggingface.co/QuantStack/Qwen-Image-Edit-2509-GGUF
- Runtime cortiq (repositorio): https://github.com/infosave2007/cmf
- Release de cortiq 0.8.80: https://github.com/infosave2007/cmf/releases/tag/v0.8.80
