# jackyb1234/OmniVoice-Onnx

## Resumen

OmniVoice-Onnx es la conversión a formato ONNX del modelo de síntesis de voz OmniVoice, desarrollado originalmente por el equipo de k2-fsa (autor del repositorio base) y convertido por el usuario jackyb1234 mediante Olive y el `ModelBuilder` de onnxruntime-genai. Se trata de un sistema de text-to-speech zero-shot que soporta más de 600 idiomas y combina clonación de voz y diseño de voz a partir de una referencia de audio o de una descripción textual. No es un modelo de lenguaje multimodal de propósito general: es un pipeline TTS completo empaquetado para inferencia con ONNX Runtime GenAI.

La arquitectura se apoya en un backbone Qwen3-0.6B de 28 capas y 1024 dimensiones ocultas que actúa como decodificador de embeddings, acoplado a un códec de audio de 8 codebooks (Higgs Audio V2 Tokenizer) y a un bucle de desenmascaramiento no autorregresivo de 32 pasos. La salida es waveform a 24 kHz. El repositorio ocupa 2,7 GB e incluye los cuatro submodelos necesarios: encoder de embeddings de audio, decodificador LLM, cabezas de audio y el tokenizador Higgs.

Su relevancia actual radica en que permite desplegar un TTS multilingüe de alta cobertura idiomática en infraestructura ONNX Runtime, con soporte para CPU (FP32/INT4) y CUDA (FP16/INT4), lo que facilita su integración en aplicaciones de producción sin depender de PyTorch en tiempo de inferencia. La licencia Apache 2.0 elimina además restricciones comerciales habituales en modelos de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-0.6B (28 capas, hidden 1024) + codec Higgs Audio V2 (8 codebooks) + bucle de desenmascaramiento no autorregresivo de 32 pasos |
| Parametros totales | 0,6 mil millones (backbone Qwen3); total del pipeline no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 y FP16 (CPU: FP32/INT4; CUDA: FP16/INT4); tokenizador Higgs en FP16/FP32 |
| Idiomas soportados | Más de 600 (códigos ISO 639-3 listados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (onnxruntime-genai) |

## Arquitectura y entrenamiento

El pipeline se compone de cuatro submodelos encadenados. El `audio_embeddings_encoder` fusiona los embeddings de texto con los tokens del codec de audio y, opcionalmente, con los códigos de referencia para clonación de voz, produciendo un tensor `(B,S,1024)`. Ese tensor alimenta el `llm_decoder`, que es el Qwen3-0.6B sin embeddings ni LM head (`exclude_embeds` y `exclude_lm_head`), y devuelve hidden states de 1024 dimensiones. Después, `audio_heads_decoder` proyecta mediante una capa lineal de 1024 a 8×1025 logits, correspondientes a 8 codebooks con 1024 códigos cada uno más un token de máscara (id 1024). Finalmente, un bucle de 32 pasos de desenmascaramiento iterativo genera los códigos de audio `(8,T)`, que el tokenizador Higgs Audio V2 convierte en waveform a 24 kHz.

Los pesos de codebook siguen la configuración `[8,8,6,6,4,4,2,2]`, lo que indica distinta relevancia o frecuencia de uso por codebook. La conversión se realizó íntegramente en Python (`optimize.py`) sin ficheros JSON de Olive externos. El LLM se construye con `create_model` de onnxruntime-genai en lugar de pasar por Olive, porque las combinaciones válidas de precisión y execution provider en esa librería se limitan a FP32/INT4 en CPU y FP16/INT4 en CUDA. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Síntesis de voz zero-shot a partir de texto, sin necesidad de entrenamiento específico por voz.
- Clonación de voz: acepta códigos de referencia de audio para replicar el timbre y estilo de una voz dada.
- Diseño de voz: generación de voces a partir de descripciones o especificaciones, según los tags del modelo.
- Cobertura multilingüe de más de 600 idiomas, incluyendo lenguas de bajos recursos.
- Salida de audio a 24 kHz mediante el tokenizador Higgs Audio V2.
- Generación no autorregresiva en 32 pasos, lo que reduce la latencia frente a decodificación autoregresiva token a token.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo TTS, no un LLM conversacional.
- No dispone de visión, audio de entrada como comprensión semántica ni modo thinking.

## Casos de uso

- **Locución multilingüe automatizada**: generación de audio para artículos, documentación o cursos en cualquiera de los más de 600 idiomas soportados, usando una única voz de referencia clonada para mantener consistencia de marca.
- **Clonación de voz para accesibilidad**: creación de voces personalizadas para usuarios con discapacidad del habla, a partir de muestras de referencia, con salida a 24 kHz apta para reproducción en dispositivos estándar.
- **Doblaje y localización de contenido**: síntesis de pistas de voz en idiomas minoritarios o de bajos recursos donde los proveedores comerciales no ofrecen cobertura, aprovechando la amplitud del listado ISO 639-3.
- **Asistentes de voz embebidos**: despliegue en CPU con cuantización INT4 mediante onnxruntime-genai, adecuado para dispositivos sin GPU dedicada que requieran TTS local sin dependencia de la nube.
- **Generación de audiolibros y pódcast**: producción por lotes de narraciones con voces diseñadas o clonadas, beneficiándose de la decodificación en 32 pasos para reducir el coste computacional por minuto de audio.
- **Prototipado de interfaces conversacionales**: integración en pipelines de agentes de voz donde el TTS se encadena tras un LLM; el modelo aporta la capa de síntesis mientras el LLM gestiona el diálogo.
- **Investigación en síntesis de voz multilingüe**: uso como baseline reproducible en formato ONNX para comparar calidad y latencia en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 2,7 GB, por lo que en FP16 el pipeline requiere del orden de varios GB y en INT4 se reduce notablemente.
- GPU recomendadas: no especificadas por el autor; la conversión soporta CUDA con FP16/INT4, lo que permite su uso en A100, H100 y GPUs consumer compatibles con ONNX Runtime CUDA.
- Compatibilidad con GPU consumer: no confirmada explícitamente; la existencia de una ruta CPU con FP32/INT4 sugiere que puede ejecutarse sin GPU dedicada.
- Opciones de despliegue: onnxruntime-genai (librería nativa del modelo), ONNX Runtime con execution providers CPU y CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OmniVoice-Onnx | 0,6 B (backbone) | No disponible | Más de 600 | Apache 2.0 | ONNX |
| k2-fsa/OmniVoice (base) | 0,6 B (backbone) | No disponible | Más de 600 | Apache 2.0 | PyTorch (no confirmado) |
| Prince-1/OmniVoice | 0,6 B (backbone) | No disponible | Más de 600 | No disponible | No disponible |

No se dispone de información sobre otros modelos TTS comparables (XTTS, Bark, F5-TTS, etc.) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento comparado.

## Limitaciones y advertencias

- Es un modelo TTS, no un LLM: no realiza razonamiento, generación de texto, código ni matemáticas.
- No se han publicado métricas objetivas de calidad de voz (MOS, WER, similitud de hablante) en la información disponible.
- Riesgo de artefactos y alucinaciones acústicas en lenguas de bajos recursos o con pocos datos de entrenamiento; la cobertura de 600+ idiomas no garantiza calidad homogénea.
- La clonación de voz plantea riesgos de suplantación de identidad y uso fraudulento; es responsabilidad del integrador aplicar consentimiento y verificación.
- No hay información sobre sesgos de género, acento o edad en las voces generadas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el tokenizador Higgs Audio V2 podrían tener condiciones adicionales no detalladas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-14) es futura respecto a la información habitual de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo en producción.
- La ausencia de ficheros JSON de Olive y la conversión vía `optimize.py` implican que la reproducibilidad depende del script Python incluido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jackyb1234/OmniVoice-Onnx
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Modelo original referenciado en la model card: https://huggingface.co/Prince-1/OmniVoice
- Olive (herramienta de conversión): https://github.com/microsoft/Olive
- onnxruntime-genai: no disponible enlace directo en la información proporcionada
