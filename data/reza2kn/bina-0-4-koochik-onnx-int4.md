# Reza2kn/Bina-0.4-Koochik-ONNX-INT4

## Resumen

Bina 0.4 Koochik ONNX-INT4 es una versión cuantizada a 4 bits, mediante GPTQ y en formato ONNX, del modelo OCR Bina 0.4 Koochik de Reza2kn. El modelo base es un sistema de reconocimiento óptico de caracteres (OCR) especializado en texto persa (farsi) e inglés, con una tarea de tipo image-to-text: recibe imágenes de páginas o regiones de documento y devuelve su transcripción textual. La cuantización se aplica sobre el checkpoint 18.404 del modelo original, conservando intacta la arquitectura y sus 630.800.496 parámetros únicos.

La relevancia de esta variante radica en su enfoque de cuantización consciente de la calibración: solo 170 matrices de pesos lineales usan códigos GPTQ simétricos de 4 bits con tamaño de grupo 32, mientras que embeddings empatados, convoluciones, posiciones, normas y sesgos se mantienen en mayor precisión. Esto reduce el paquete de ejecución a unos 739,9 MB, lo que permite ejecutar OCR de calidad en hardware modesto, incluyendo portátiles y CPUs como el Apple M2, sin depender de GPUs de servidor.

El autor publica resultados de validación en un conjunto de calificación congelado de 64 imágenes y 14.127 caracteres fuente, alcanzando una paridad de caracteres del 98,9028 % tanto en CPU ONNX (Apple M2) como en CUDA (RTX 5080 Laptop), sin casos de repetición ni desbordamiento de tokens. Es una opción atractiva para desarrolladores que necesitan OCR persa local, privado y ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer OCR image-to-text (detalles completos no disponibles en esta variante; ver modelo base) |
| Parametros totales | 630.800.496 parámetros únicos (sin cambios respecto al modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 tokens por región de imagen (límite de decodificación) |
| Tipos de cuantizacion | GPTQ simétrico INT4 (group size 32, escalas FP32) en 170 matrices lineales; resto en mayor precisión; empaquetado canónico de 533.891.055 bytes (~6,771 bits efectivos por parámetro original) |
| Idiomas soportados | Persa (fa) e inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | ONNX con kernels personalizados `com.microsoft.MatMulNBits` (gráficos divididos, pesos externos compartidos entre prefill y decode) |

## Arquitectura y entrenamiento

Bina 0.4 Koochik es un modelo de OCR basado en transformer para la tarea image-to-text, orientado a la transcripción de documentos en persa e inglés. Esta variante ONNX-INT4 no modifica el entrenamiento original: parte del checkpoint 18.404 y aplica cuantización GPTQ solo sobre las matrices de pesos lineales (170 en total), con códigos simétricos de 4 bits, tamaño de grupo 32 y escalas de grupo en FP32. La calibración se realizó sobre 64 regiones aprobadas exclusivamente de entrenamiento, con 18.404 secuencias fuente frescas, manteniendo los grupos de calibración y de calificación final disjuntos.

Entre las decisiones técnicas destacables: los embeddings de entrada/salida están empatados (tied) y conservan mayor precisión, igual que convoluciones, codificaciones de posición, normas, sesgos y cabezas auxiliares no usadas. La decodificación es greedy con penalización de repetición 1,1, máximo 2.048 tokens por región y una única reintentación de resolución permitida. El pipeline incluido usa un layout de píxeles tipo pixel-layout-v2 que cubre cada píxel original exactamente una vez. El runtime ejecuta 410 kernels CUDA `MatMulNBits` en GPU, mantiene las claves/valores del decodificador en CUDA entre pasos, desactiva TF32 y comparte un único archivo de pesos externo entre prefill y decode. No se hace afirmación de velocidad nativa tipo BitNet.

## Capacidades

- OCR (image-to-text) de documentos en persa e inglés, transcribiendo regiones y páginas completas de imagen a texto.
- Modo de marcado (markup mode) disponible, aunque no cualificado por separado con corpus.
- Decodificación greedy con control auditado de límites de tokens y repeticiones (0 casos de repetición o desbordamiento en la validación publicada).
- Ejecución multiplataforma validada: CPU ONNX (Apple M2) y NVIDIA CUDA (RTX 5080 Laptop, 16 GB).
- Selección automática de dispositivo (`--device auto`) con verificaciones deterministas de componentes, prefill y decode cacheado antes de usar GPU.
- Mecanismo de recuperación ante fallos de GPU: reinicio de la región completa en CPU con prefill/KV frescos, registro del motivo y compromiso solo del resultado CPU.
- Salida estructurada en JSON (`result.json`) con el backend real usado, sondas de kernels y eventos de fallback.
- No hay soporte documentado de tool calling, agentes, audio ni capacidades más allá de OCR.

## Casos de uso

- Digitalización de documentos en persa: transcripción automática de páginas escaneadas en farsi, aprovechando la especialización del modelo en ese idioma y su pipeline de layout que cubre toda la página.
- OCR local y privado en portátiles: con ~740 MB de descarga y ejecución validada en CPU Apple M2, es adecuado para flujos de trabajo que no pueden enviar documentos a la nube por privacidad.
- Procesamiento por lotes de archivos en servidores con GPU NVIDIA modesta: la validación en RTX 5080 Laptop (16 GB) indica que GPUs de consumo con CUDA 13 son suficientes; se recomienda reutilizar la instancia del modelo para amortizar el cold start.
- Indexación y búsqueda de archivos históricos persa/inglés: el texto extraído puede alimentar motores de búsqueda o bases de datos vectoriales.
- Integración en aplicaciones Python: el script `run_ocr.py` produce salida JSON estructurada, fácil de integrar en pipelines de datos o servicios backend.
- Verificación de integridad de despliegue: el informe `result.json` registra el backend real y los eventos de fallback, útil en entornos de producción auditados.
- Alternativa en macOS con GPU: existen derivados Tract Metal y CoreML INT4 del mismo autor para rutas Apple GPU validadas, cuando el ONNX en macOS queda limitado a CPU.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de calificación congelado (64 imágenes, 14.127 caracteres fuente), midiendo acuerdo de caracteres NFC (1 - ediciones Levenshtein agrupadas / caracteres fuente agrupados):

| Runtime | Paridad de caracteres fuente corregida | Paridad de página completa original | Nuevos límites / flags de repetición |
|---|---:|---:|---:|
| ONNX CPU (Apple M2) | 98,9028 % | 97,4063 % | 0 / 0 |
| ONNX auto → CUDA (RTX 5080 Laptop) | 98,9028 % | 97,4063 % | 0 / 0 |

Importante: estas cifras son medidas de acuerdo con la fuente, no precisión OCR anotada por humanos, ni garantías por imagen, ni un benchmark OCR independiente no visto. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.), lo cual es esperable al tratarse de un modelo OCR especializado.

## Requisitos de hardware

- Descarga completa del runtime: aproximadamente 739,9 MB (decimal), incluyendo excepciones en mayor precisión, componentes divididos, tokenizador/posiciones y archivos de runtime.
- CPU: validado en Apple M2 con ONNX Runtime 1.31.0 (CPUExecutionProvider); en macOS la ruta ONNX automática usa CPU, ya que el EP CoreML falla las comprobaciones de capacidad.
- GPU NVIDIA: validado en RTX 5080 Laptop (16 GB) con ONNX Runtime GPU 1.31.0, Python 3.13.11 y CUDA 13; no se requiere GPU de gama servidor (A100/H100) para esta carga de trabajo.
- Consumer GPUs: cabe sobradamente en GPUs de consumo con 16 GB o menos, dado el tamaño del paquete; solo están cualificadas las configuraciones descritas.
- DirectML, ROCm, TensorRT, GPUs arbitrarias, runtimes móviles y sherpa-onnx no están cualificados por los resultados publicados.
- Despliegue: mediante el runner incluido (`run_ocr.py`) con ONNX Runtime; no se documentan rutas vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras concretas; las sondas de arranque añaden trabajo de cold start, por lo que se recomienda reutilizar la instancia del modelo entre peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bina 0.4 Koochik ONNX-INT4 | 630,8 M (únicos) | OCR fa/en | GPTQ INT4 (parcial, ~6,77 bits efectivos) | 2.048 tokens/región | OpenMDW 1.1 | ONNX, pesos externos, runner incluido |
| Bina 0.4 Koochik (base) | 630,8 M | OCR fa/en | Sin cuantizar (BF16) | No disponible en esta ficha | OpenMDW 1.1 | HuggingFace, modelo base |
| Bina 0.4 Koochik CoreML-INT4 | 630,8 M | OCR fa/en | INT4 | No disponible | OpenMDW 1.1 | CoreML nativo para Apple GPU validado |
| Bina 0.4 Koochik Tract-INT4 | 630,8 M | OCR fa/en | INT4 | No disponible | OpenMDW 1.1 | Tract con Metal para Apple GPU validado |

No se dispone de datos comparativos de rendimiento frente a otros modelos OCR como Tesseract, PaddleOCR o modelos vision-language genéricos.

## Limitaciones y advertencias

- Las cifras de paridad publicadas son medidas de acuerdo con la fuente del propio autor, no precisión OCR anotada por humanos ni un benchmark independiente no visto; el rendimiento en documentos nuevos puede variar.
- Texto decorativo pequeño, logotipos, manuscritos y layouts complejos pueden transcribirse incorrectamente.
- El modo de marcado (markup mode) existe pero no ha sido cualificado por separado con corpus.
- En macOS, ONNX auto usa CPU: el EP CoreML falla las comprobaciones de capacidad para estos gráficos; para GPU Apple hay que usar los derivados Tract Metal o CoreML.
- DirectML, ROCm, TensorRT, GPUs no probadas, runtimes móviles y sherpa-onnx no están cualificados.
- No deben instalarse juntos los wheels de ONNX Runtime CPU y GPU; hay que usar entornos separados.
- La etiqueta "INT4" describe solo los códigos de las matrices lineales, no todos los parámetros ni activaciones; no debe esperarse una reducción de 4x exacta ni velocidades tipo BitNet.
- El conjunto final de 64 imágenes se usó para calificación del runtime, no para ajuste de cuantización ni selección de candidatos, pero sigue siendo un conjunto pequeño.
- Restricciones de licencia: la licencia es OpenMDW 1.1; para detalles de uso comercial conviene revisar el texto completo de la licencia, no disponible en la información proporcionada.
- Riesgo de alucinación: no se reportan datos específicos; en OCR, errores de transcripción en regiones ambiguas son posibles y conviene validar salidas críticas.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/Reza2kn/Bina-0.4-Koochik-ONNX-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- Derivado Tract Metal INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-Tract-INT4
- Derivado CoreML INT4: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-CoreML-INT4
- Paper, blog o repositorio adicional: no disponible
