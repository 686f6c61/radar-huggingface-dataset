# mradermacher/Hawkeye-4B-GGUF

## Resumen

Hawkeye-4B es un modelo de visión multimodal especializado en reconocimiento de texto en imágenes (OCR y scene text recognition), desarrollado por byron123t a partir de la arquitectura Qwen3-VL. El modelo se ha ajustado para destacar en escenarios difíciles para el OCR convencional: texto borroso, imágenes de baja resolución y capturas procedentes de dispositivos portátiles como gafas inteligentes (smart glasses). Su entrenamiento se ha realizado sobre el dataset BSTRB (byron123t/BSTRB), un conjunto de datos específico para estas tareas.

La ficha que se presenta aquí corresponde a la cuantización GGUF publicada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face que genera versiones estáticas del modelo en distintos niveles de compresión (desde Q2_K hasta f16) para su uso con llama.cpp y herramientas compatibles. Esto permite ejecutar el modelo en hardware de consumo, incluidas GPUs modestas e incluso CPU.

Su relevancia actual radica en la creciente demanda de OCR robusto en dispositivos edge y aplicaciones de realidad aumentada, donde las imágenes suelen ser de baja calidad y los modelos OCR clásicos (Tesseract, PaddleOCR) fallan. Al basarse en Qwen3-VL, Hawkeye-4B hereda capacidades de comprensión visual y conversacional generales además de su especialización en texto en escena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (visión-lenguaje) basada en Qwen3-VL |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no se indica si es MoE; probablemente densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj en f16 y Q8_0) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantización); el modelo base se distribuye en safetensors (transformers) |

## Arquitectura y entrenamiento

Hawkeye-4B parte de Qwen3-VL, la familia de modelos visión-lenguaje de Alibaba, que combina un codificador visual (ViT) con un decodificador de lenguaje basado en transformer. El modelo base tiene aproximadamente 4.020 millones de parámetros según los metadatos de safetensors. El repositorio GGUF incluye además los archivos mmproj (multi-modal projectors) en f16 y Q8_0, necesarios para que llama.cpp procese las entradas de imagen junto al modelo de lenguaje.

El ajuste se ha realizado sobre el dataset BSTRB (byron123t/BSTRB), orientado a reconocimiento de texto en escena, con énfasis en texto borroso y de baja resolución. No se dispone de información pública sobre el número de tokens, la composición detallada del dataset ni sobre el uso de técnicas como RLHF o DPO. Los tags del modelo sugieren un enfoque en aplicaciones para gafas inteligentes, donde la captura de texto en condiciones subóptimas es el caso de uso principal. No se han documentado innovaciones técnicas adicionales más allá del fine-tuning especializado.

## Capacidades

- Reconocimiento de texto en escena (scene text recognition) en imágenes naturales
- OCR sobre texto borroso y de baja resolución, el caso de uso central del fine-tuning
- Comprensión multimodal general heredada de Qwen3-VL (descripción de imágenes, conversación visual)
- Generación de texto conversacional (tag "conversational" en el repositorio)
- Ejecución local mediante GGUF en llama.cpp, Ollama u otras herramientas compatibles
- Soporte de archivos mmproj para inferencia multimodal en llama.cpp
- No se dispone de información sobre tool calling, function calling ni capacidades de agentes

## Casos de uso

- OCR en gafas inteligentes y wearables: el modelo puede transcribir texto capturado por cámaras de baja resolución en tiempo casi real gracias a su tamaño reducido (2,5 GB en Q4_K_M) y su entrenamiento específico con datos de este tipo de dispositivos.
- Digitalización de documentos degradados: extracción de texto de fotografías antiguas, escaneos borrosos o imágenes comprimidas donde los motores OCR clásicos fallan.
- Lectura de señalización y rótulos en aplicaciones de asistencia visual: transcripción de carteles, letreros o etiquetas para personas con discapacidad visual, aprovechando su robustez ante texto en escena.
- Automatización de entrada de datos desde imágenes: integración en pipelines que extraen texto de capturas de pantalla o fotos de formularios para alimentar bases de datos o flujos RPA.
- Traducción posterior de texto en imágenes: combinando la extracción de texto con un modelo de traducción para aplicaciones de viaje o comprensión de entornos extranjeros.
- Moderación y análisis de contenido visual: detección y lectura de texto incrustado en imágenes para sistemas de moderación que necesitan entender el texto presente en las imágenes.
- Prototipado edge en hardware de consumo: gracias a las cuantizaciones Q2_K (1,8 GB) y Q3_K, es viable su ejecución en portátiles sin GPU dedicada para pruebas de concepto de OCR local y privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (texto): desde ~2 GB para Q2_K hasta ~8,5 GB para f16; la variante recomendada Q4_K_M ocupa unos 2,6 GB, más 0,6-0,9 GB si se carga el mmproj para entrada multimodal
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones Q4/Q5 con el proyector multimodal; no se requieren GPUs de gama datacenter
- Consumer GPUs: cabe cómodamente en una RTX 3060 de 12 GB, RTX 4060 Ti o superiores incluso en Q8_0; en CPU pura es viable con las cuantizaciones Q2_K a Q4_K, con menor velocidad
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj; el modelo base en safetensors puede desplegarse con transformers y vLLM
- Latencia y throughput: no disponible; por su tamaño (~4 B de parámetros), se espera una generación fluida incluso en hardware modesto, pero no hay cifras publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Licencia | Formato |
|---|---|---|---|---|
| Hawkeye-4B | ~4,02 B | OCR, texto borroso, baja resolución | Apache 2.0 | Safetensors, GGUF |
| Qwen3-VL (base, 4B aprox.) | ~4 B | Visión-lenguaje general | Apache 2.0 (según versión) | Safetensors, GGUF |
| Moondream 2B | ~1,9 B | Visión-lenguaje ligero | Apache 2.0 | Safetensors, GGUF |
| Florence-2 | ~0,27 B | OCR, captioning, detección | MIT | Safetensors |

Hawkeye-4B se diferencia de Qwen3-VL base en su fine-tuning específico para texto en escena degradado, y ofrece más capacidad multimodal general que Florence-2 a cambio de un tamaño notablemente mayor. Frente a Moondream, Hawkeye-4B es más grande pero está optimizado explícitamente para OCR difícil.

## Limitaciones y advertencias

- Idioma: la model card declara únicamente el inglés; el rendimiento en castellano u otros idiomas no está documentado y puede ser inferior al esperable en Qwen3-VL base
- Especialización estrecha: el fine-tuning sobre BSTRB puede degradar las capacidades generales de razonamiento, código o matemáticas del modelo base; conviene validar el comportamiento en tareas no relacionadas con OCR
- Riesgo de alucinación: como todo modelo visión-lenguaje, puede inventar texto no presente en la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S)
- Pérdida de calidad por cuantización: las variantes de baja bit-width pueden afectar sensiblemente a la precisión del OCR, donde los caracteres individuales importan; se recomienda Q4_K_M o superior para producción
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base y del dataset de entrenamiento
- No hay benchmarks publicados que permitan comparar objetivamente su precisión de OCR frente a alternativas como PaddleOCR o Florence-2
- Los archivos mmproj deben descargarse por separado para la inferencia multimodal en llama.cpp

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Hawkeye-4B-GGUF
- Modelo base: https://huggingface.co/byron123t/Hawkeye-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/byron123t/BSTRB
- Página de descargas de mradermacher: https://hf.tst.eu/model#Hawkeye-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nethype GmbH: https://www.nethype.de/
