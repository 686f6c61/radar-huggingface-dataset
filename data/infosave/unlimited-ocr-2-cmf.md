# infosave/Unlimited-OCR-2-cmf

## Resumen

Unlimited-OCR-2-cmf es la distribución cuantizada del modelo Baidu Unlimited-OCR-2, un parser de documentos multimodal especializado en lectura de múltiples páginas en una sola pasada. El paquete lo publica el usuario infosave en formato CMF (fichero único propietario) para `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de machine learning. El modelo original combina un encoder visual DeepEncoder (SAM ViT-B alimentando CLIP-L) con un decoder transformer de 12 capas con mezcla de expertos (MoE) cuya atención lee como máximo 512 tokens por paso, independientemente de la longitud del documento.

El interés de esta versión reside en el empaquetado: ofrece dos ficheros CMF listos para ejecutar en GPU de consumo (Vulkan, Metal, CUDA, DX12) y en CPU, con cuantizaciones de 8 bits (q8_2f, 3,78 GB) y 4 bits (q4tp, 2,37 GB), manteniendo el encoder en 16 bits. El modelo base es de Baidu y la licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual es doble: por un lado, demuestra que un parser OCR de nivel documental puede ejecutarse con latencias de primer token de 1,1-1,2 s en GPU dedicada y 4,9 s en Apple Silicon; por otro, introduce un motor de inferencia alternativo (cortiq) que evita el stack Python/PyTorch habitual en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepEncoder (SAM ViT-B + CLIP-L) + decoder transformer MoE de 12 capas con atención limitada a 512 tokens por paso |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (arquitectura MoE, sin cifra publicada) |
| Longitud de contexto | no disponible en tokens; atención limitada a 512 tokens por paso, sin límite práctico de páginas por pasada |
| Tipos de cuantización | q8_2f (decoder 8 bits, encoder 16 bits), q4tp (decoder 4 bits, encoder 16 bits) |
| Idiomas soportados | inglés (en), ruso (ru), chino (zh) |
| Licencia | MIT |
| Formato de pesos | CMF (fichero único para cortiq); el original en Transformers 4.52 float32 |

## Arquitectura y entrenamiento

El modelo base sigue un diseño de dos etapas. El encoder visual DeepEncoder combina un backbone SAM ViT-B con un proyector CLIP-L; una imagen individual se divide en hasta 16 tiles de 640×640 más una vista global de 1024×1024, mientras que varias imágenes se procesan únicamente con la vista de 1024×1024. El decoder es un transformer de 12 capas con mezcla de expertos cuya atención opera sobre ventanas de 512 tokens como máximo por paso, lo que permite procesar documentos de muchas páginas sin que el coste de atención crezca con la longitud total.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del paquete cuantizado solo describe el proceso de cuantización: el fichero q8_2f reproduce los primeros 300 tokens greedy de una página de forma idéntica al original float32, y el q4tp conserva el 98,5 % de los caracteres. El preprocesado replica el del original (bicúbica de punto fijo de Pillow). En documentos largos, las coordenadas y el orden de bloques vecinos pueden variar en empates cercanos, comportamiento que también aparece en el original al comparar float32 con bf16.

## Capacidades

- Parsing OCR de documentos multipágina en una sola pasada, con un `<PAGE>` por página de entrada.
- Detección y marcado de bloques estructurales (`<BLOCK>`) con tipo (título, texto, etc.), nivel jerárquico (`<LEVEL1>`) y coordenadas en una rejilla de 0-999.
- Procesamiento de imágenes individuales con teselado de hasta 16 tiles de 640×640 más una vista global de 1024×1024.
- Procesamiento conjunto de varias imágenes mediante la vista de 1024×1024.
- Soporte multilingüe limitado a inglés, ruso y chino.
- Servicio compatible con la API de chat completions de OpenAI (`/v1/chat/completions`) mediante `cortiq serve`.
- Ejecución en GPU Vulkan, Metal, CUDA y DX12, y en CPU pura con `CMF_GPU=0`.
- No expone tool calling, function calling, razonamiento multi-paso ni agentes.
- No admite peticiones sin imagen: el modelo rechaza solicitudes que no incluyan una.
- No permite personalizar la colocación de `<image>`; siempre usa el layout entrenado `<PAGE><image>`.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa varias páginas por pasada con atención acotada a 512 tokens por paso, de modo que el coste no crece con la longitud del expediente; se puede lanzar un lote de páginas con un `--image` por página y obtener la estructura jerárquica con coordenadas para reconstruir el documento.
- Extracción de tablas y bloques de contratos en pipelines de ingesta: la salida `<BLOCK>` con coordenadas 0-999 permite mapear cada fragmento a su posición en la página y alimentar un sistema de indexación o de revisión humana.
- Procesamiento de facturas y albaranes en servidor sin stack Python: con `cortiq serve` y la API compatible con OpenAI, un servicio en Rust puede recibir imágenes por HTTP y devolver el parseo estructurado sin dependencias de PyTorch.
- OCR en estaciones de trabajo con GPU de consumo: con 8 GB de VRAM para q4tp o 12 GB para q8_2f en tarjetas NVIDIA, AMD o Intel, se puede desplegar en equipos de oficina o portátiles con GPU integrada compatible con Vulkan o DX12.
- Procesamiento en Apple Silicon para equipos de campo: en un M4 con GPU de 10 núcleos, q4tp decodifica a 112 tok/s y una página tarda 4,9 s hasta el primer token, con 4,7 GB de memoria, lo que permite trabajar en portátiles sin GPU dedicada.
- Indexación de documentación técnica en ruso o chino: el soporte nativo de en, ru y zh cubre la digitalización de manuales y normativa en esos idiomas sin modelos auxiliares de traducción.
- Preprocesado para RAG documental: la salida estructurada con niveles y coordenadas se puede convertir directamente en chunks con metadatos de página y posición, reduciendo el trabajo de post-procesado antes de la vectorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente métricas de velocidad y fidelidad de cuantización:

| Métrica | RTX PRO 4500 (Vulkan) | M4, 10-core GPU (Metal) | Xeon 10-core (CPU) |
|---|---:|---:|---:|
| Encoder, 1 tile 640×640 | 0,10 s | 0,35 s | no disponible |
| Encoder, vista 1024×1024 | 0,24 s | 1,15 s | 16 s |
| Ingesta de prompt | ~2600 tok/s | ~700 tok/s | no disponible |
| Decode q8_2f | 323 tok/s | 95 tok/s | no disponible |
| Decode q4tp | 319 tok/s | 112 tok/s | 67 tok/s (decoder) |
| Decode a 24 páginas | 316 tok/s (q8_2f) | 137 tok/s (q4tp) | no disponible |
| Primer token, página teselada | 1,2 s (con pesos cargados; +4 s en primera petición) | 4,9 s | no disponible |

En CUDA (RTX A5000 24 GB, cortiq 0.8.96), q4tp decodifica a 319-320 tok/s, alcanza el primer token en 1,1 s y completa una página en 8-9 s incluyendo la carga del modelo; Vulkan en la misma tarjeta tarda 20-25 s. En CUDA se recomienda q4tp porque los expertos enrutados del fichero q8_2f aún no se ejecutan en la tarjeta.

## Requisitos de hardware

- VRAM: 8 GB para q4tp y 12 GB para q8_2f en GPU NVIDIA, AMD o Intel.
- Apple Silicon: 4,7 GB de memoria por página con q4tp y 6,2 GB con q8_2f; ambos se ejecutan en la GPU vía Metal.
- GPU recomendadas: RTX PRO 4500 Blackwell (Vulkan), RTX A5000 24 GB (CUDA), cualquier GPU con soporte Vulkan o DX12; en Apple, chips M-series con GPU de 10 núcleos o superior.
- CPU pura: viable con `CMF_GPU=0`, pero el encoder tarda decenas de segundos por página (16 s para una vista 1024×1024 en un Xeon de 10 núcleos) y el decoder baja a 67 tok/s.
- Despliegue: `cortiq-cli` (instalable con `cargo install cortiq-cli`, versión 0.8.54 o superior; build con `--features cuda` para CUDA) en modo `run` o `serve`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: primer token en 1,2 s en RTX PRO 4500 y 4,9 s en M4 para una página teselada; throughput de 316-323 tok/s en GPU dedicada y 95-137 tok/s en Apple Silicon.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo procesa imágenes: cualquier petición sin imagen es rechazada, lo que impide usarlo como modelo de texto general.
- Cobertura lingüística limitada a inglés, ruso y chino; no se garantiza calidad en otros idiomas.
- No expone tool calling, function calling ni razonamiento multi-paso, por lo que no sirve como agente autónomo.
- El layout de entrada está fijado a `<PAGE><image>`; no se puede personalizar la colocación de la imagen.
- En documentos largos, las coordenadas y el orden de bloques vecinos pueden variar en empates cercanos, incluso respecto al original float32 frente a su propia versión bf16.
- En CUDA, el fichero q8_2f no ejecuta los expertos enrutados en la tarjeta; debe usarse q4tp en ese backend.
- El formato CMF es propietario de cortiq y no es compatible con Transformers, vLLM ni llama.cpp, lo que limita la portabilidad del artefacto.
- La licencia MIT del modelo base permite uso comercial, pero conviene verificar las condiciones del modelo original de Baidu antes de un despliegue en producción.
- No se han publicado datos sobre sesgos, tasa de alucinación ni robustez ante documentos degradados.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/infosave/Unlimited-OCR-2-cmf
- Modelo base original: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio del formato CMF y del motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
