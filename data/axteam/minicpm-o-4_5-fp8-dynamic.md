# axteam/MiniCPM-o-4_5-FP8-dynamic

## Resumen

MiniCPM-o-4_5-FP8-dynamic es una versión cuantizada a FP8 del modelo ómnium multimodal MiniCPM-o 4.5 de OpenBMB, publicada por el usuario axteam. No se trata de un modelo nuevo entrenado desde cero, sino de un derivado de despliegue (post-training quantization, sin reentrenamiento) pensado para servir el modelo original con vLLM en la mitad de memoria aproximadamente: ~10,4 GB en disco frente a los ~18,7 GB que ocuparían los pesos en BF16.

El modelo base es un transformer denso de 9.371.787.666 parámetros que integra un codificador visual en streaming, un codificador de audio (basado en Whisper) y una cabeza de síntesis de voz (TTS) junto a la columna vertebral del modelo de lenguaje. Según la información pública del modelo base, emplea una arquitectura de streaming denominada Omni-Flow, orientada a interacción en tiempo real y en duplex completo (full-duplex) sobre visión, audio, texto y voz, con mecanismos de comportamiento proactivo y fusión de estados ocultos a nivel de token.

Su relevancia práctica es de infraestructura: permite ejecutar un modelo ómnium de ~9B con pesos de 8 bits en GPUs de 24 GB y en hardware Hopper/Ada con soporte nativo de FP8 E4M3, manteniendo en BF16 los módulos perceptivos y de síntesis de voz, que son los más sensibles a la cuantización. La licencia Apache-2.0 del modelo original se conserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso ómnium (visión + audio + TTS + LM) con arquitectura de streaming Omni-Flow; codificador visual en streaming, codificador de audio tipo Whisper y cabeza TTS |
| Parametros totales | 9.371.787.666 (~9,37B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico W8A8: pesos FP8 E4M3 con escala por canal, activaciones FP8 dinámicas por token; formato compressed-tensors `FP8_DYNAMIC`; sin calibración (data-free); visión, audio, TTS, embeddings, LM head y RMSNorms se mantienen en BF16 |
| Idiomas soportados | no disponibles en la información de HuggingFace; la validación de calidad de la cuantización se realizó en inglés y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8_DYNAMIC); el repositorio incluye además artefactos ONNX; no se ofrece GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~9,37B parámetros con arquitectura ómnium: un codificador visual en streaming, un codificador de audio derivado de Whisper, una cabeza TTS y una columna vertebral de lenguaje, combinados mediante fusión de estados ocultos a nivel de token. La información pública del modelo base describe la arquitectura Omni-Flow, diseñada para interacción en tiempo real y en duplex completo, con soporte de comportamiento proactivo durante el streaming audiovisual. Los detalles de composición del dataset de entrenamiento (número de tokens, mezcla de datos, uso de RLHF/DPO) no están disponibles en la información proporcionada.

Sobre esta variante concreta, el autor documenta únicamente el proceso de cuantización: cuantización post-entrenamiento sin reentrenamiento ni calibración, aplicada exclusivamente a las proyecciones de atención y MLP de la columna vertebral del modelo de lenguaje. Los módulos de visión, audio y TTS, así como los embeddings de tokens, el LM head y todas las RMSNorm, permanecen en BF16, lo que representa una fracción pequeña de los parámetros pero concentra la mayor parte de la sensibilidad numérica. El tokenizador y la `chat_template` son idénticos a los del original. El autor declara haber validado la calidad frente al modelo BF16 mediante perplejidad y acuerdo top-1 en inglés y coreano, sin publicar los valores numéricos.

## Capacidades

- Procesamiento conjunto de visión, audio, texto y voz (pipeline `any-to-any`): entrada de imagen, vídeo y audio, salida de texto y voz sintetizada.
- Codificación visual en streaming, apta para flujos de vídeo continuos más que para imágenes aisladas.
- Comprensión de audio y reconocimiento de voz mediante el codificador tipo Whisper, mantenido en BF16 en esta variante.
- Síntesis de voz (TTS) integrada en el propio modelo, no como componente externo.
- Interacción en duplex completo y en tiempo real según la arquitectura Omni-Flow del modelo base, con comportamiento proactivo.
- Generación de texto y razonamiento multimodal heredados de la columna vertebral del LM.
- Capacidades multilingües: no detalladas en la información disponible; la validación de la cuantización cubre inglés y coreano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes por voz en tiempo real: el modelo integra reconocimiento de audio y TTS en un único artefacto, de modo que un asistente telefónico o de kiosco puede transcribir, razonar y responder con voz sin orquestar tres modelos separados, reduciendo latencia y complejidad de despliegue.
- Análisis de vídeo en directo: el codificador visual en streaming permite procesar fotogramas de forma continua para tareas de supervisión (control de aforo, detección de incidencias en línea de producción o vigilancia de accesos) sin trocear el vídeo en clips independientes.
- Accesibilidad: descripción automática de escenas y lectura de contenido visual combinada con salida de voz, útil para aplicaciones de asistencia a personas con discapacidad visual que necesitan respuesta hablada inmediata.
- Atención al cliente multimodal: un usuario puede enviar una captura de pantalla o un audio describiendo un problema y el modelo responde en texto o voz; el despliegue en vLLM con FP8 permite mantener varias sesiones concurrentes en una sola GPU de 24 GB.
- Moderación de contenido audiovisual: clasificación de audio y vídeo combinados (tono de voz, lenguaje, elementos visuales) en pipelines de revisión, aprovechando que la cuantización preserva los codificadores perceptivos en BF16.
- Documentación técnica con imágenes: extracción de información de manuales, diagramas e infografías combinada con explicación hablada, para formación interna o soporte de campo.
- Transcripción y resumen de reuniones con salida de audio: el modelo cubre la cadena completa de audio a texto y de texto a voz, lo que simplifica la arquitectura frente a soluciones que encadenan ASR, LLM y TTS de proveedores distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor solo indica que la cuantización se comprobó frente al original en BF16 mediante perplejidad y acuerdo top-1 en inglés y coreano, sin publicar los valores. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan ~10,4 GB en disco; con caché KV y activaciones, un despliegue en vLLM necesita del orden de 14-18 GB para contextos moderados. Estimación orientativa, no publicada por el autor.
- GPU recomendadas: H100 o H200 (soporte nativo de FP8 E4M3 y mayor margen para concurrencia), L40S y A100 40/80 GB para producción con varias sesiones simultáneas.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 de 24 GB, con contexto limitado. En tarjetas de 16 GB el despliegue es ajustado y probablemente requiera recortar contexto o concurrencia. Las arquitecturas Ampere no ejecutan FP8 de forma nativa, por lo que en A100 el rendimiento será inferior al de Ada/Hopper.
- Opciones de despliegue: vLLM es la vía documentada por el autor (`vllm serve axteam/MiniCPM-o-4_5-FP8-dynamic`). También es cargable con transformers y compressed-tensors. No hay pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas sin una conversión adicional.
- Latencia y throughput estimados: no disponibles. Dependen críticamente de la GPU (soporte nativo de FP8 o no), del número de sesiones concurrentes y de si se activan los módulos de audio y TTS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/MiniCPM-o-4_5-FP8-dynamic (esta ficha) | 9,37B | no disponible | Visión, audio, texto, TTS | Apache-2.0 | Pesos FP8 en HuggingFace, formato compressed-tensors |
| openbmb/MiniCPM-o-4_5 (base) | 9,37B | no disponible | Visión, audio, texto, TTS | Apache-2.0 | Pesos BF16 en HuggingFace; ~18,7 GB |
| openbmb/MiniCPM-V-4_5 | no disponible | no disponible | Visión y texto (sin audio ni TTS) | no disponible en la información proporcionada | Pesos en HuggingFace |
| Qwen2.5-Omni-7B | ~7B (referencia externa) | no disponible | Visión, audio, texto, voz | no disponible en la información proporcionada | Pesos en HuggingFace |

La comparación relevante para esta ficha es la del par base/cuantizado: misma arquitectura, mismo tokenizador y misma licencia, con una reducción de peso en disco de aproximadamente el 44 % (de ~18,7 GB a ~10,4 GB) a cambio de cuantizar solo las proyecciones de atención y MLP del LM. Frente a MiniCPM-V 4.5, la variante «o» añade audio y TTS; frente a alternativas ómnium de otros fabricantes, la información disponible no permite comparar rendimiento con cifras.

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida de precisión no cuantificada públicamente: el autor no publica los valores de perplejidad ni el acuerdo top-1 obtenidos frente al BF16, por lo que el impacto real en calidad debe medirse en el caso de uso concreto.
- La validación de calidad declarada se limita a inglés y coreano; el comportamiento en castellano u otros idiomas no está verificado. Los idiomas soportados no constan en la información de HuggingFace.
- Riesgo de alucinación inherente a un modelo de ~9B en tareas de razonamiento y en descripción de imágenes o audio ambiguos; sin benchmarks publicados no es posible acotar la magnitud.
- Longitud de contexto no disponible: es un parámetro crítico para planificar despliegues de vídeo o audio largos y debe confirmarse en la documentación del modelo base antes de diseñar la arquitectura.
- El modelo se distribuye para vLLM con compressed-tensors; no hay GGUF, de modo que las rutas de despliegue en CPU o en entornos con llama.cpp no están cubiertas.
- El rendimiento en GPUs sin soporte nativo de FP8 (Ampere y anteriores) será inferior al esperado; el pipeline de quantización no garantiza aceleración en ese hardware.
- El repositorio procede de un tercero (axteam) y no de OpenBMB: no cuenta con el respaldo del autor original, con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo original; los pesos y el tokenizador originales pertenecen a OpenBMB. Conviene verificar las condiciones del modelo base por si hubiera cláusulas adicionales no reflejadas en la model card del derivado.
- Los módulos de audio (Whisper) y TTS permanecen en BF16, por lo que el pico de memoria puede superar la estimación basada solo en el tamaño de los pesos cuantizados.

## Enlaces

- [axteam/MiniCPM-o-4_5-FP8-dynamic en HuggingFace](https://huggingface.co/axteam/MiniCPM-o-4_5-FP8-dynamic)
- [openbmb/MiniCPM-o-4_5 (modelo base)](https://huggingface.co/openbmb/MiniCPM-o-4_5)
- [openbmb/MiniCPM-V-4_5 (variante solo visión)](https://huggingface.co/openbmb/MiniCPM-V-4_5)
- [MiniCPM-o 4.5: Omni-Modal Interaction AI (Emergent Mind)](https://www.emergentmind.com/topics/minicpm-o-4-5)
- [MiniCPM-o 4.5: 9B Vision, Audio, and Speech Model (LearnOpenCV)](https://learnopencv.com/minicpm-o-4-5-a-9b-model-that-can-see-hear-and-speak-at-the-same-time/)
- [axteam/MiniCPM5-2B-NVFP4 (otro derivado cuantizado del mismo autor)](https://huggingface.co/axteam/MiniCPM5-2B-NVFP4)
- [AI Model Release Calendar (seguimiento de lanzamientos)](https://www.scriptbyai.com/ai-model-release-calendar/)
