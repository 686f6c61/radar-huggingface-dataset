# ByronLeeee/Xiaomi-OCR-0-Ninfer

## Resumen

Xiaomi-OCR-0-Ninfer es un artefacto de pesos en formato NInfer v3 que empaqueta una conversión a BF16 del modelo SeerRay-Lab/Xiaomi-OCR-0, un modelo multimodal de tipo image-text-to-text orientado a OCR y parsing de documentos. El modelo subyacente se entrena a partir de Qwen3.5-0.8B-Base, por lo que su torre de lenguaje parte de una base de aproximadamente 800 millones de parámetros. El autor de esta conversión es el usuario de HuggingFace ByronLeeee, y el artefacto se publica bajo licencia Apache 2.0.

El problema que resuelve es de despliegue: el checkpoint original solo es consumible con la pila de Transformers, mientras que este repositorio distribuye los pesos de lenguaje y visión, junto con los recursos de tokenizador y procesador embebidos, en un único fichero `.ninfer` que se ejecuta con el servidor NInfer. No hay reentrenamiento: las matrices de proyección se almacenan en BF16/A16, los escalares matemáticos siguen las representaciones prescritas por el conversor y los pesos de embedding y salida permanecen atados (*tied*).

La relevancia actual está en el rendimiento medido: en una RTX 5070 Ti de 16 GB, NInfer alcanza 438,4 tok/s de decodificación frente a 173,7 tok/s de la pila de Transformers compilada, y reduce el tiempo por petición HTTP de 839,6 ms a 423,1 ms. A cambio, exige compilar un fork específico de NInfer y limita la compatibilidad a GPUs Blackwell de compute capability 12.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text basado en Qwen3.5-0.8B-Base; el stack de referencia emplea kernels fusionados de causal-conv1d, FLA GDN y atención. La definición arquitectónica interna completa no se detalla en la información disponible |
| Parametros totales | no disponible (el modelo base es Qwen3.5-0.8B-Base, en torno a 0,8 mil millones de parámetros de lenguaje; no se publica el recuento total incluyendo la torre de visión) |
| Parametros activos | no aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue (`--max-context 32768`), con capacidad de caché KV de 131.072 tokens; las mediciones de rendimiento se realizaron con 4.096 tokens de capacidad |
| Tipos de cuantizacion | BF16 para pesos y caché KV; KV en FP8 disponible de forma opcional y sujeta a comprobaciones de salida separadas |
| Idiomas soportados | no disponible oficialmente; los conjuntos de prueba incluyen documentos en chino (`zh_legal`) e inglés (`en_contract`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer v3); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento alguno: es una conversión del checkpoint SeerRay-Lab/Xiaomi-OCR-0, que a su vez se entrena desde Qwen3.5-0.8B-Base. La conversión conserva los pesos de lenguaje y visión y embebe los recursos de tokenizador y procesador. Las matrices de proyección se representan en BF16/A16, los escalares matemáticos adoptan las representaciones prescritas por el conversor y las proyecciones de embedding y salida siguen compartidas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

En el lado de inferencia, la referencia contra la que se mide el rendimiento es el checkpoint original en Transformers con kernels fusionados de causal-conv1d, FLA GDN y atención, prefill de visión y lenguaje compilado y decodificación compilada con CUDA Graphs y StaticCache de 4.096 posiciones reales. La presencia de kernels causal-conv1d y FLA GDN en la pila de referencia apunta a un diseño híbrido con componentes de atención lineal, aunque la información disponible no describe la arquitectura interna con detalle. El servidor NInfer expone además un indicador `--no-thinking`, lo que sugiere la existencia de un modo de razonamiento desactivable en el modelo subyacente; las pruebas publicadas se ejecutan con ese modo desactivado y decodificación greedy.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos, con salida en texto plano y en Markdown (se aplica eliminación de encabezados y énfasis Markdown en la métrica de evaluación).
- Parsing de documentos: la etiqueta `document-parsing` del repositorio apunta a extracción estructurada de contenido documental.
- Procesamiento conjunto de imagen y texto: la tarea declarada es image-text-to-text, con codificación visual seguida de prefill de lenguaje.
- Transcripción de documentos legales en chino y de contratos en inglés, según los conjuntos empleados en las pruebas del autor.
- Reconocimiento de ecuaciones y fórmulas densas: el conjunto `dense-equations` se usa en las pruebas y sus salidas alcanzan el límite de 256 tokens generados.
- Generación de texto condicionada por imagen con decodificación greedy y modo de razonamiento desactivado en la configuración publicada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües declaradas: no disponible; solo hay evidencia de evaluación en chino e inglés.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de documentación legal en chino: el modelo transcribe páginas de textos jurídicos con una precisión de carácter normalizada del 100 % sobre el conjunto sintético `zh_legal`, y la ventana de 32.768 tokens del ejemplo de despliegue permite procesar páginas densas sin trocear.
- Extracción de contratos en inglés hacia Markdown: el conjunto `en_contract` se resuelve de forma natural (114 tokens de salida) y la eliminación de encabezados y énfasis en la métrica encaja con un pipeline que convierte contratos a Markdown limpio para su indexación.
- Conversión de documentos científicos con fórmulas: el conjunto `dense-equations` obliga al modelo a generar notación matemática densa; es adecuado para pipelines que necesitan transcribir ecuaciones, teniendo en cuenta que en las pruebas alcanza el límite de 256 tokens.
- Ingesta masiva de PDFs para RAG: el prefill combinado de visión y lenguaje supera los 21.000 tok/s en una RTX 5070 Ti y los 35.000 tok/s en una RTX 6000D, lo que permite procesar grandes lotes de páginas antes de alimentar un índice vectorial.
- Servicio HTTP de OCR en producción: el servidor NInfer acepta `--max-concurrency 4` con 131.072 tokens de capacidad KV, de modo que puede atender varias peticiones simultáneas manteniendo una latencia por petición de 423,1 ms (RTX 5070 Ti) o 317,2 ms (RTX 6000D) en el caso `zh_legal`.
- Despliegue en estaciones de trabajo con GPU de consumo: los pesos BF16 ocupan 1,7 GB en el repositorio y el sistema se validó en una RTX 5070 Ti de 16 GB bajo WSL2, lo que permite montar un servicio de OCR local sin GPU de centro de datos.
- Control de regresión entre motores de inferencia: la coincidencia exacta de salida del 100 % sobre las tres muestras comparadas permite usar NInfer como motor de producción y Transformers como referencia de verificación en pruebas A/B.
- Automatización de archivo documental con validación de calidad: la métrica de diferencia de caracteres normalizada (0 % en las tres muestras comparadas, 0,1933 % ponderado en la comparación histórica de 11 páginas) sirve como umbral de aceptación en un pipeline de digitalización por lotes.

## Benchmarks y rendimiento

Rendimiento medido el 2026-10-06 con pesos y KV en BF16, capacidad de 4.096 tokens, una petición activa, imágenes y prompts idénticos, decodificación greedy y un máximo de 256 tokens de salida. Cada entrada tiene dos calentamientos y tres repeticiones medidas; los valores son medianas.

| GPU | Entrada | Prefill Transformers (tok/s) | Prefill NInfer (tok/s) | Decode Transformers (tok/s) | Decode NInfer (tok/s) | Petición Transformers / NInfer (ms) |
|---|---|---:|---:|---:|---:|---:|
| RTX 5070 Ti | zh_legal | 23060 | 21924 | 173,7 | 438,4 | 839,6 / 423,1 |
| RTX 5070 Ti | en_contract | 22646 | 21201 | 169,4 | 438,7 | 829,5 / 414,8 |
| RTX 5070 Ti | dense-equations | 22197 | 19859 | 171,1 | 427,1 | 1726,0 / 810,7 |
| RTX 6000D | zh_legal | 36193 | 35306 | 233,7 | 513,8 | 579,1 / 317,2 |
| RTX 6000D | en_contract | 36154 | 35140 | 232,2 | 514,4 | 584,7 / 316,1 |
| RTX 6000D | dense-equations | 35990 | 33031 | 235,1 | 511,0 | 1206,7 / 618,1 |

El prefill de Transformers compilado es ligeramente más rápido en estas entradas. La decodificación de NInfer es entre 2,46 y 2,59 veces más rápida en la RTX 5070 Ti y entre 2,17 y 2,22 veces más rápida en la RTX 6000D; la mejora en tiempo por petición HTTP es de aproximadamente 2,0 a 2,1 veces y de 1,8 a 1,95 veces respectivamente.

| GPU | Precisión de carácter normalizada (Transformers) | Precisión de carácter normalizada (NInfer) | Coincidencia exacta de salida | Diferencia de carácter normalizada |
|---|---:|---:|---:|---:|
| RTX 5070 Ti | 100 % (CER 0 %) | 100 % (CER 0 %) | 3/3 (100 %) | 0 % |
| RTX 6000D | 100 % (CER 0 %) | 100 % (CER 0 %) | 3/3 (100 %) | 0 % |

Las columnas de precisión cubren únicamente dos páginas de texto sintéticas, con 478 caracteres de referencia por GPU, y ambas terminan de forma natural (113 y 114 tokens de salida). No es un benchmark general de parsing documental. Aparte, una comparación histórica completa a 32K y cuatro carriles en la RTX 5070 Ti igualó 10 de 11 páginas exactamente (90,91 %), con una diferencia de carácter normalizada ponderada del 0,1933 %.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos en un único fichero `.ninfer` en BF16; el repositorio completo ocupa 1,7 GB.
- GPUs validadas: RTX 5070 Ti de 16 GB (WSL2) y RTX 6000D (Linux), ambas con compute capability 12.0.
- Cabe en GPU de consumo de 16 GB en las condiciones medidas (4.096 tokens de capacidad, una petición activa).
- El comando de ejemplo configura 32.768 tokens de contexto, 131.072 tokens de capacidad KV, cuatro peticiones concurrentes, KV en BF16 y prefill por trozos de 1.024 tokens; la VRAM pico con esa configuración no se reporta.
- Otras arquitecturas Blackwell no están cualificadas automáticamente.
- Compilación necesaria: 64 bits Linux, CUDA con soporte `sm_120a`, C++20, CMake >= 3.28, Ninja, bibliotecas de desarrollo de FFmpeg, libcurl >= 7.85, pkg-config y libpcre2-dev. El código nativo se compiló en limpio con CUDA 13.2 y GCC 15.2.
- El binario NInfer upstream no debe asumirse capaz de cargar este artefacto: se requiere el fork `ninfer-qwen3.5-0.8b` en su rama `main`, que añade las formas de kernel y el soporte de frontend de Qwen3.5-0.8B.
- No hay soporte para vLLM, llama.cpp, Ollama ni TGI: el fichero no es safetensors ni GGUF.
- Latencia por petición HTTP medida: 423,1 ms en RTX 5070 Ti y 317,2 ms en RTX 6000D para `zh_legal`; 810,7 ms y 618,1 ms para `dense-equations`.
- Throughput de decodificación: 438,4 tok/s (5070 Ti) y 513,8 tok/s (6000D) en `zh_legal`; el prefill conjunto de visión y lenguaje alcanza 21.924 y 35.306 tok/s respectivamente.

## Comparativa con modelos similares

| Artefacto | Formato | Prefill tok/s (RTX 5070 Ti, zh_legal) | Decode tok/s | Petición (ms) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Xiaomi-OCR-0-Ninfer (este artefacto) | `.ninfer` (NInfer v3, BF16) | 21924 | 438,4 | 423,1 | Apache 2.0 | HuggingFace, requiere fork de NInfer |
| SeerRay-Lab/Xiaomi-OCR-0 (checkpoint de referencia) | safetensors (Transformers) | 23060 | 173,7 | 839,6 | no disponible en la información proporcionada | HuggingFace |
| NInfer upstream (sin el fork) | binario NInfer | no aplica | no aplica | no aplica | no disponible | No debe asumirse que cargue este artefacto |

La comparación directa con otros modelos de OCR (por ejemplo, alternativas de la misma categoría de tamaño) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La comprobación de precisión se limita a dos páginas de texto sintéticas con 478 caracteres de referencia por GPU; no es un benchmark general de parsing documental ni una garantía de precisión del 100 % en documentos reales.
- La página del conjunto `dense-equations` alcanza el límite de 256 tokens de salida y no dispone de puntuación de precisión de página completa en esta ejecución.
- El autor advierte de que disponer de etapas GPU compiladas no implica que la salida de todas las páginas se haya generado hasta el final.
- El KV en FP8 es opcional y requiere comprobaciones de salida separadas.
- La comparación histórica a 32K y cuatro carriles igualó 10 de 11 páginas (90,91 %), con una diferencia de carácter normalizada ponderada del 0,1933 %: existe divergencia de salida en una página.
- No se publican resultados en benchmarks estándar, ni evaluaciones de sesgo o de alucinación.
- Los idiomas soportados no están declarados; la evidencia de evaluación cubre chino e inglés.
- La licencia Apache 2.0 permite uso comercial de este artefacto, pero no se incluye aquí la información de licencia del modelo base SeerRay-Lab/Xiaomi-OCR-0.
- Dependencia estricta del fork de NInfer: el binario upstream no debe asumirse compatible, lo que añade coste de mantenimiento en producción.
- Compatibilidad de hardware restringida a compute capability 12.0 en las pruebas; otras arquitecturas Blackwell no están cualificadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación externa de la comunidad.
- La VRAM pico con la configuración de 32.768 tokens de contexto y 131.072 tokens de caché KV no se reporta.

## Enlaces

- Ficha del artefacto en HuggingFace: https://huggingface.co/ByronLeeee/Xiaomi-OCR-0-Ninfer
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Fork de NInfer requerido: https://github.com/ByronLeeeee/ninfer-qwen3.5-0.8b
- Detalles de compilación y conversión: https://github.com/ByronLeeeee/ninfer-qwen3.5-0.8b/blob/main/docs/xiaomi-ocr.md
