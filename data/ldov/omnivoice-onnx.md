# ldov/OmniVoice-Onnx

## Resumen

OmniVoice-Onnx es una conversión a formato ONNX del modelo de síntesis de voz (TTS) OmniVoice, originalmente desarrollado por Prince-1 y publicado bajo el nombre k2-fsa/OmniVoice. Esta conversión, realizada por el usuario ldov, permite ejecutar el modelo con la librería onnxruntime-genai, lo que facilita su integración en aplicaciones de producción que requieren inferencia eficiente en CPU o GPU. OmniVoice es un modelo de texto a voz zero-shot que soporta más de 600 idiomas, con capacidades de clonación de voz y diseño de voces sintéticas.

El modelo combina un backbone basado en Qwen3-0.6B (28 capas) con un codec de audio de 8 codebooks (Higgs Audio V2 Tokenizer) y un proceso de decodificación no autorregresivo de 32 pasos basado en unmasking iterativo. La salida es una forma de onda a 24 kHz. El repositorio tiene un tamaño de 5,3 GB e incluye los pesos en formato ONNX, listos para usar con onnxruntime-genai.

Esta ficha se basa exclusivamente en la información disponible en la model card de HuggingFace y en los resultados de búsqueda web proporcionados. No se han encontrado datos adicionales sobre entrenamiento, benchmarks o requisitos de hardware específicos más allá de lo indicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-0.6B backbone (28 capas) + encoder de embeddings de audio + decoder de cabezas de audio (8 codebooks) + codec Higgs Audio V2 |
| Parametros totales | Backbone Qwen3-0.6B (600M); total del modelo no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16, INT4 (según la conversión con Olive y onnxruntime-genai) |
| Idiomas soportados | Más de 600 (lista extensa de códigos ISO en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (formato GenAI) |

## Arquitectura y entrenamiento

El modelo se compone de tres sub-modelos principales convertidos a ONNX: `audio_embeddings_encoder`, que fusiona los embeddings de texto y códigos de audio (incluyendo códigos de referencia para clonación de voz); `llm_decoder`, que es el backbone Qwen3-0.6B con 28 capas, excluyendo embeddings y cabeza de lenguaje; y `audio_heads_decoder`, que proyecta las representaciones ocultas a logits de 8 codebooks con un vocabulario de audio de 1025 tokens (1024 códigos + máscara). El proceso de decodificación utiliza 32 pasos de unmasking iterativo no autorregresivo, y la forma de onda final se genera mediante el codec Higgs Audio V2 a 24 kHz.

La conversión se realizó con Olive para los componentes de audio y con onnxruntime-genai `ModelBuilder` para el LLM, utilizando `exclude_embeds` y `exclude_lm_head`. Según la model card, las combinaciones válidas de precisión y proveedor de ejecución son FP32/INT4 en CPU y FP16/INT4 en CUDA; no hay soporte de FP16 para el LLM en CPU. No se han publicado detalles sobre el entrenamiento original (datos, número de tokens, técnicas de alineación como RLHF o DPO) en la información disponible.

## Capacidades

- Síntesis de voz de texto a voz (TTS) zero-shot: genera voz sin necesidad de entrenamiento previo para una voz específica.
- Clonación de voz: puede replicar la voz de un hablante a partir de una muestra de referencia (códigos de audio de referencia).
- Diseño de voz: permite crear voces sintéticas personalizadas mediante la manipulación de los códigos de audio.
- Multilingüe: soporta más de 600 idiomas, incluyendo variedades regionales y dialectos (lista extensa en la model card).
- Salida de audio a 24 kHz con calidad adecuada para aplicaciones de voz.
- Inferencia no autorregresiva: el proceso de unmasking iterativo de 32 pasos permite una generación más rápida que los modelos autorregresivos tradicionales.
- Integración con onnxruntime-genai: compatible con entornos de producción que usan esta librería para inferencia optimizada.

## Casos de uso

- Asistentes de voz personalizados: se puede clonar la voz de un usuario o crear una voz sintética para un asistente virtual, usando el modelo con una muestra de referencia y generando respuestas habladas en tiempo real.
- Doblaje automático de contenido multimedia: el modelo puede traducir y sintetizar voz en más de 600 idiomas, lo que permite doblar vídeos, podcasts o audiolibros sin necesidad de actores de voz humanos.
- Audiolibros y narración: se pueden generar narraciones con voces personalizadas o diseñadas, adaptadas a diferentes estilos y tonos, a partir de texto.
- Accesibilidad para personas con discapacidad visual: conversión de texto a voz en múltiples idiomas con voces naturales, útil en lectores de pantalla y aplicaciones de accesibilidad.
- Avatares digitales y personajes de videojuegos: el diseño de voz permite crear voces únicas para personajes, y la clonación puede usarse para dar voz a avatares en entornos virtuales.
- Sistemas de respuesta de voz interactiva (IVR) multilingües: el modelo puede generar mensajes de voz en diferentes idiomas para centralitas telefónicas o sistemas de atención al cliente, reduciendo costes de grabación.
- Herramientas de marketing y publicidad: creación de voces para anuncios, cuñas radiofónicas o contenido promocional, con la posibilidad de ajustar el tono y el estilo mediante diseño de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ni de comparativas con otros modelos TTS en términos de calidad perceptual (MOS) o velocidad de inferencia.

## Requisitos de hardware

- El modelo completo pesa 5,3 GB en formato ONNX.
- Se puede ejecutar en CPU con cuantización INT4 (según la model card, FP32/INT4 son las opciones válidas en CPU).
- En GPU (CUDA), se pueden usar precisiones FP16 o INT4.
- La inferencia se realiza mediante onnxruntime-genai; no se mencionan otros motores de inferencia como vLLM u Ollama.
- No se proporcionan datos específicos de VRAM, latencia o throughput. Se recomienda probar en el hardware objetivo para determinar el rendimiento real.
- Dado el tamaño del modelo, una GPU con al menos 8 GB de VRAM podría ser suficiente para FP16, aunque no se confirma.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos TTS (por ejemplo, XTTS, Bark, VITS) en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión ONNX de un modelo original; puede haber pequeñas diferencias de comportamiento respecto al modelo PyTorch original (k2-fsa/OmniVoice).
- No es un modelo de visión-lenguaje; es exclusivamente TTS. No debe usarse para tareas de comprensión multimodal.
- La longitud de contexto no está documentada; para textos muy largos puede ser necesario dividir la entrada.
- El riesgo de alucinación auditiva (generar contenido no presente en el texto) no está cuantificado, aunque es un riesgo común en modelos TTS.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original por si hubiera restricciones adicionales.
- El soporte de idiomas es amplio, pero la calidad puede variar según el idioma y la disponibilidad de datos de entrenamiento.
- La conversión ONNX no soporta FP16 en CPU; para CPU se debe usar INT4 o FP32, lo que puede afectar al rendimiento o la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/OmniVoice-Onnx
- Modelo base (k2-fsa/OmniVoice): https://huggingface.co/k2-fsa/OmniVoice
- Modelo original (Prince-1/OmniVoice): https://huggingface.co/Prince-1/OmniVoice
- Conversión similar de gluschenko: https://huggingface.co/gluschenko/omnivoice-onnx
- Conversión de onnx-community: https://huggingface.co/onnx-community/OmniVoice-Onnx
- Página en ModelScope: https://www.modelscope.cn/models/onnx-community/OmniVoice-Onnx
- Repositorio de conversión (GitHub): https://github.com/AFun9/Omnivoice-onnx
- Repositorio original de OmniVoice (GitHub): https://github.com/AnEntrypoint/omnivoice
