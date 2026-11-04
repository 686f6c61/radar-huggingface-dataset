# multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags-ONNX

## Resumen

Wang-Qwen3.5-2B-DocTags-ONNX es la conversión a formato ONNX del checkpoint Wang-Qwen3.5-2B-DocTags, un modelo de 2 000 millones de parámetros especializado en reconocimiento de imágenes de documentos. Su tarea concreta es convertir una imagen de página (documento escaneado, captura o PDF rasterizado) en DocTags: una representación estructurada de texto con coordenadas de posición para cada elemento detectado. El autor del checkpoint original es wangcheng y la conversión la publica la organización multimodal-vision-ai bajo licencia Apache-2.0.

La relevancia de esta versión estriba en que está pensada para ejecutarse íntegramente en el navegador mediante Transformers.js y ONNX Runtime Web con aceleración WebGPU, sin necesidad de backend. Empaqueta tres grafos ONNX separados (embeddings, codificador visual y decodificador de texto) con precisión mixta FP32/FP16 y un total de 6,2 GB de pesos. El modelo base emplea una arquitectura Qwen3.5 multimodal de tipo transformer con 24 capas de texto y una torre de visión que produce características de imagen en FP16.

Se trata de un artefacto muy específico: no es un OCR de propósito general cargable con cualquier versión de Transformers.js, sino un export con dependencias fijadas (Transformers.js 4.4.0-next.0 y ONNX Runtime Web 1.31.1), un prompt concreto y un prefijo de asistente predefinido. Su valor está en habilitar pipelines de extracción documental en cliente, con validación de paridad numérica frente al modelo PyTorch original en pruebas sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (torre de visión + decodificador de texto de 24 capas) |
| Parametros totales | 2B (según nombre del checkpoint; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (codificador visual), FP16 (embeddings y decodificador); no se documentan GGUF ni INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos `embed_tokens_fp16.onnx`, `vision_encoder.onnx`, `decoder_model_merged_fp16.onnx` con ficheros `_data` externos) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con dos componentes diferenciados: un codificador de imagen que procesa la página y un decodificador de texto autorregresivo de 24 capas que genera la secuencia DocTags. El vocabulario de embeddings es de 248 654 entradas por 2 048 dimensiones, y se conserva completo el vocabulario de salida de 248 654 dimensiones. El preprocesado fija un mínimo de 65 536 píxeles y un máximo de 2 073 600 píxeles, manteniendo la normalización y el esquema de parches (patch) del modelo original.

La exportación no activa la cabeza auxiliar de predicción MTP (multi-token prediction): la generación es autorregresiva codiciosa convencional. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La conversión sí documenta verificaciones de paridad: los 610 tokens añadidos pasan comprobaciones de ida y vuelta sin pérdida, las características visuales superan una similitud de 0,99999 frente al modelo nativo en tres rejillas de imagen distintas y la cabeza de salida se verificó por muestreo, incluido el último token.

## Capacidades

- Reconocimiento de texto en imágenes de documentos y conversión a DocTags con coordenadas de posición.
- Salida estructurada apta para reconstruir el layout de la página (texto más geometría de cada elemento).
- Generación autorregresiva codiciosa con penalización de repetición de 1,02 y tokens de terminación específicos de DocTags (248044, 248046, 248086).
- Modo sin razonamiento explícito: el prefijo de asistente fuerza `<think>\n\n</think>\n\n<doctag>`, es decir, se desactiva el bloque de pensamiento.
- Ejecución en navegador con WebGPU y soporte de `shader-f16`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni otros idiomas distintos del presente en el vocabulario del checkpoint base.

## Casos de uso

- Digitalización de documentos en el cliente: una aplicación web puede enviar la imagen de una página al modelo y obtener DocTags con texto y coordenadas sin subir el documento a un servidor, lo que reduce exposición de datos sensibles y coste de backend.
- Extracción de layout para pipelines RAG: los DocTags generados permiten segmentar títulos, párrafos y tablas con su geometría, alimentando un chunking consciente de la estructura del documento antes de indexar en un motor de búsqueda vectorial.
- Procesamiento de facturas y formularios escaneados: el modelo devuelve texto con posición, lo que facilita emparejar etiquetas y valores por proximidad espacial en lugar de depender solo de heurísticas textuales.
- Herramientas de accesibilidad: conversión de capturas o documentos a una representación estructurada que después se sintetice o se reordene para lectores de pantalla, preservando el orden de lectura inferido de las coordenadas.
- Preprocesado para OCR de segunda etapa: los DocTags sirven como capa intermedia que un pipeline posterior valida o corrige, aprovechando que el modelo conserva la salida cruda sin parchear texto ni coordenadas.
- Demostraciones y entornos educativos: al ejecutarse en el navegador con WebGPU, permite mostrar reconocimiento documental en vivo sin infraestructura GPU dedicada, útil para prototipos y validación de concepto.
- Archivado de documentos con metadatos espaciales: generación de un registro estructurado por página que conserve la posición de cada bloque para búsquedas posteriores por región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se ha reejecutado el benchmark completo de OCR y que no deben tomarse los históricos de entrenamiento como precisión del export ONNX.

Los únicos datos de rendimiento medidos son de la validación en WebGPU sobre una GPU física (PCI A1:00.0), con Chrome 157 y NVIDIA A800:

| Metrica | Valor |
|---|---|
| Carga local del modelo | 19,123 s |
| Primera inferencia | 6,442 s |
| Segunda inferencia | 4,530 s |
| Consistencia entre inferencias | salidas idénticas |
| Inferencia en CPU del modelo original (imagen sintética, 26 tokens generados) | ~19,3 s |

En la prueba sintética de referencia se procesaron 222 tokens de entrada y se generaron 26 tokens, con coincidencia exacta de texto y coordenadas frente al modelo CPU original.

## Requisitos de hardware

- VRAM: no se publica una cifra exacta; el repositorio ocupa 6,2 GB y la model card advierte que el navegador necesita memoria de ejecución y VRAM adicionales más allá de los pesos.
- GPU recomendadas: se ha validado en NVIDIA A800; no hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado. Requiere WebGPU con soporte de `shader-f16`; la comprobación de layout a 390 px no equivale a una prueba en GPU móvil, según el propio autor.
- Despliegue: Transformers.js 4.4.0-next.0 con ONNX Runtime Web 1.31.1, dispositivo `webgpu`, adaptador específico con codificador en FP32 y embeddings/decodificador en FP16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta versión ONNX.
- Latencia: 6,442 s en primera inferencia y 4,530 s en las siguientes sobre A800, sin contar la descarga inicial en línea.
- Nota técnica: el decodificador usa la extensión `ai.onnx::SimplifiedLayerNormalization`, que el checker estándar de ONNX todavía no reconoce; la validación debe hacerse cargando en ORT/WebGPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (OCR documental multimodal de ~2B) ni cifras de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo OCR de propósito general: requiere la versión exacta de Transformers.js y ONNX Runtime Web, un adaptador específico y un dispositivo con WebGPU y `shader-f16`.
- El prompt está fijado a `Convert this page to docling.` y el prefijo de asistente a `<think>\n\n</think>\n\n<doctag>`; desviarse de esta convención puede degradar la salida.
- No se ha reejecutado el benchmark completo de OCR, por lo que no hay métricas de precisión publicadas para esta conversión.
- El adaptador devuelve la salida cruda sin corregir texto ni coordenadas; cualquier postproceso o validación corre a cargo del integrador.
- El repositorio no incluye pesos PyTorch originales, muestras de entrenamiento ni imágenes de test internas, lo que limita la reproducibilidad completa.
- No se documentan sesgos conocidos ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base y de los datos de entrenamiento originales, no detalladas aquí.
- Riesgo de alucinación inherente a un modelo generativo: puede producir texto o coordenadas plausibles pero incorrectas en documentos degradados o layouts atípicos.
- La validación en GPU móvil no está realizada; el rendimiento en dispositivos de gama baja es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags-ONNX
- Checkpoint base (PyTorch): https://huggingface.co/multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags
- Directorio de adaptadores en GitHub: https://github.com/multimodal-vision-ai/multimodal-document-ai-learning-center/tree/0c3e3481a4b469e8354e9c1cc5272bc53f317548/hf-spaces/mvai-doctags-webgpu/adapters/wang-qwen35-2b
- Informe de validación en navegador: validation/browser_validation.json (dentro del repositorio)
- Salida real generada: validation/output.doctags (dentro del repositorio)
- Captura de pantalla de escritorio: validation/screenshot.png (dentro del repositorio)
