# Reza2kn/Bina-0.4-Koochik-Tract-INT4

## Resumen

Bina 0.4 Koochik — Tract-INT4 es una versión cuantizada a 4 bits (GPTQ) del modelo OCR Bina 0.4 Koochik, publicado por el usuario Reza2kn en Hugging Face. Se trata de un modelo de imagen a texto (pipeline `image-to-text`) orientado al reconocimiento óptico de caracteres en persa (farsi) e inglés, derivado del checkpoint 18.404 del modelo base y empaquetado para ejecutarse con el runtime de inferencia Tract sobre ONNX. El modelo padre se basa en la arquitectura NVIDIA Nemotron-3.5-Parse.

La relevancia de esta ficha radica en el enfoque de la cuantización: no es una conversión genérica a INT4, sino una derivada "calibration-aware" con 170 matrices de pesos lineales codificadas con GPTQ simétrico (tamaño de grupo 32, escalas FP32), calibrada sobre 64 regiones exclusivas de entrenamiento. El resto de componentes (embeddings atados, convoluciones, posiciones, normas, sesgos) se mantienen en precisión superior, lo que da como resultado unos 6,771 bits efectivos por parámetro original. El paquete de ejecución completo ocupa aproximadamente 1,086.7 MB y el repositorio total 1,1 GB.

El modelo se distribuye con binarios para macOS ARM64 (CPU y un runtime Metal reparado), validado sobre un Apple M2 con tract 0.23.9-pre. Incluye un pipeline de layout "pixel-layout-v2", decodificación greedy con penalización de repetición 1.1, y mecanismos de fallback automático de GPU a CPU por región si la inicialización o la ejecución en Metal fallan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NVIDIA Nemotron-3.5-Parse (modelo padre Bina 0.4 Koochik) |
| Parametros totales | 630.800.496 parámetros únicos |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible (cap de 2.048 tokens por región en decodificación) |
| Tipos de cuantizacion | GPTQ simétrico INT4 en 170 matrices lineales, group size 32, escalas FP32; resto en precisión superior (~6,771 bits efectivos/parámetro) |
| Idiomas soportados | Persa (fa), inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | ONNX (runtime Tract), paquete completo ~1.086,7 MB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura NVIDIA Nemotron-3.5-Parse del checkpoint original Bina 0.4 Koochik, con 630.800.496 parámetros únicos y embeddings de entrada/salida atados (tied). La cuantización no modifica la arquitectura ni el entrenamiento original: se limita a recodificar 170 matrices de pesos lineales mediante GPTQ simétrico con tamaño de grupo 32 y escalas de grupo en FP32. La calibración se realizó sobre 64 regiones aprobadas exclusivas del conjunto de entrenamiento, con 18.404 secuencias fuente frescas del checkpoint. Convoluciones, embeddings de posición, normas, sesgos y cabezas auxiliares no utilizadas se mantienen en mayor precisión.

El entrenamiento original del modelo padre no está descrito en la información disponible (no se indican tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO). La validación del derivado se hizo sobre un conjunto congelado de 64 imágenes y 14.127 caracteres fuente, separado de los grupos de calibración, usando el pipeline pixel-layout-v2 incluido. La decodificación es greedy con penalización de repetición 1.1, máximo 2.048 tokens por región y un reintento de resolución como máximo por imagen.

## Capacidades

- OCR (reconocimiento óptico de caracteres) en persa e inglés, transcripción de regiones de página completas mediante pipeline pixel-layout-v2 que cubre todos los píxeles originales exactamente una vez.
- Generación de texto a partir de imagen (pipeline image-to-text) con decodificación greedy y KV cache por región.
- Modo de marcado (markup mode) disponible, aunque no cualificado por separado sobre el corpus.
- Ejecución en CPU y GPU (Metal en macOS ARM64) con fallback automático y reinicio determinista de la región fallida.
- Salida estructurada en JSON (result.json) con registro del backend real usado y eventos de fallback.
- No se ha documentado soporte de tool calling, agentes, capacidades de audio ni razonamiento multi-paso.

## Casos de uso

- Digitalización de documentos en persa: transcripción de cartas, formularios y páginas escaneadas en farsi, el caso de uso principal dado el entrenamiento del modelo padre.
- OCR de documentos bilingües persa-inglés: útil para documentos mixtos (documentación oficial, facturas, correspondencia) gracias al soporte de ambos idiomas.
- Procesamiento por lotes en portátiles Apple Silicon: el runtime Metal permite acelerar la inferencia en Mac M1/M2 sin GPU dedicada, adecuado para archivado local de documentos sensibles.
- Despliegue en CPU sin GPU: el binario de CPU macOS ARM64 y el formato ONNX/Tract permiten integración en servidores ligeros sin dependencias de frameworks grandes de ML.
- Pipelines de ingesta de documentos con requisitos de auditoría: result.json y los manifiestos de hashes (artifact-manifest.json, quantization.json) facilitan trazabilidad de versiones y backends en flujos de producción.
- Transcripción de texto con layouts simples a medianos: el pipeline pixel-layout-v2 recorre la página completa; adecuado para texto impreso en páginas estructuradas.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el conjunto de cualificación congelado (64 imágenes / 14.127 caracteres fuente), midiendo concordancia de caracteres (1 − ediciones Levenshtein NFC agrupadas / caracteres fuente NFC agrupados):

| Runtime | Concordancia de caracteres fuente corregida | Concordancia de página completa original | Nuevos caps / flags de repetición |
|---|---:|---:|---:|
| Tract CPU | 98,8745 % | 97,3778 % | 0 / 0 |
| Tract auto → Metal | 98,9170 % | 97,4206 % | 0 / 0 |

Importante: estas cifras son mediciones de concordancia con la fuente, no precisión OCR anotada por humanos, ni garantías por imagen, ni un benchmark OCR independiente con datos no vistos. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Descarga completa del runtime: aproximadamente 1.086,7 MB (decimal); repositorio completo de 1,1 GB.
- Binarios incluidos: solo macOS ARM64 (CPU y runtime Metal reparado). Otros sistemas operativos, CPUs y GPUs requieren compilación nativa desde el código fuente incluido y su propia validación.
- Validado sobre Apple M2 con tract 0.23.9-pre (CPU y Metal). La ejecución automática en Metal completó las 64 imágenes / 71 regiones sin fallback a CPU.
- Cuatro componentes permanecen cargados durante la vida de la instancia del modelo, con KV cache del decodificador por región; se recomienda reutilizar la instancia entre peticiones para amortizar el arranque en frío de las sondas.
- Despliegue: script Python incluido (run_ocr.py) con selección de dispositivo `--device auto|cpu|metal|gpu`; no es un adaptador de sherpa-onnx. No se menciona soporte directo de vLLM, llama.cpp, Ollama o TGI.
- No se han publicado cifras de latencia o throughput completas (la sección de diagnóstico de latencia local del README está truncada en la información disponible).

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Cuantizacion | Idiomas | Licencia |
|---|---|---|---|---|---|
| Bina 0.4 Koochik Tract-INT4 | OCR (fa/en) | 630,8 M | GPTQ INT4 (group 32) | fa, en | OpenMDW 1.1 |
| NVIDIA Nemotron-3.5-Parse (padre arquitectural) | OCR/parse de documentos | no disponible | FP32 (checkpoint original) | no disponible | no disponible |
| Reza2kn/Bina-0.4-Koochik (modelo base) | OCR (fa/en) | 630,8 M | FP32 | fa, en | OpenMDW 1.1 |

No se dispone de datos de rendimiento comparativos directos con otros modelos OCR como Tesseract, PaddleOCR o TrOCR en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas son concordancia con la fuente sobre un conjunto de cualificación, no precisión OCR anotada por humanos ni garantía de rendimiento sobre datos nuevos no vistos.
- Texto decorativo pequeño, logotipos, escritura a mano y layouts complejos pueden transcribirse de forma incorrecta.
- El modo de marcado (markup) existe pero no fue cualificado por separado sobre el corpus.
- Los binarios incluidos son solo macOS ARM64; su uso en otras plataformas exige compilar y revalidar. Cambiar versiones de binarios/runtime o perfiles aritméticos requiere repetir la cualificación.
- "INT4" no significa que todos los parámetros y activaciones estén a 4 bits: hay excepciones en mayor precisión y serialización (~6,771 bits efectivos por parámetro). No se realizan afirmaciones de velocidad tipo BitNet.
- El conjunto de cualificación final se usó para validar el runtime, no para ajustar la cuantización; calibración y validación son disjuntos, pero las imágenes de cualificación protegidas no se incluyen en el repositorio.
- La imagen demo es texto sintético de nueva creación; los ejemplos de entrenamiento y la carta privada del usuario no se incluyen.
- Las descargas registradas son 0 y el proyecto es de un autor individual, sin historial de mantenimiento demostrado; conviene evaluar el soporte antes de uso en producción.
- Restricciones de licencia: OpenMDW 1.1 exige preservar el archivo LICENSE y los avisos de terceros; no se detallan en la información disponible limitaciones adicionales para uso comercial.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Reza2kn/Bina-0.4-Koochik-Tract-INT4
- Modelo base: https://huggingface.co/Reza2kn/Bina-0.4-Koochik
- No se han encontrado enlaces adicionales a papers, blogs, repositorios externos o demos en la información disponible.
