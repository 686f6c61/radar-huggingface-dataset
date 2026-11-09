# MaTsaou/pocket-tts-greek-onnx

## Resumen

Pocket TTS Greek ONNX es una conversión a formato ONNX del modelo de síntesis de voz `myned-ai/pocket-tts-greek`, un ajuste fino y destilación del modelo `kyutai/pocket-tts` de Kyutai orientado al idioma griego. El paquete, publicado por el usuario MaTsaou, contiene cinco grafos ONNX en FP32 junto con un estado de voz precalculado (la voz femenina "Athina") y el tokenizador SentencePiece original. Está pensado para síntesis de voz completamente offline y en dispositivo, principalmente en Android con ONNX Runtime, sin envío de datos a servidores en el momento de la síntesis.

El modelo base es un transformer causal de 6 capas con aproximadamente 110 millones de parámetros, lo que lo sitúa en la categoría de modelos TTS ligeros aptos para hardware modesto. La conversión no introduce cuantización ni reentrenamiento: los pesos PyTorch se reescriben sin cambios en grafos ONNX con entradas explícitas de caché key/value y estado de convolución en streaming, lo que permite trazar y ejecutar el modelo de forma incremental en un host ONNX Runtime.

Su relevancia radica en que ofrece una alternativa de código abierto (CC BY 4.0) para TTS griego en dispositivos, un idioma con escasa cobertura en herramientas de síntesis de voz, y en que su empaquetado con hashes verificables y manifiesto facilita la integración en aplicaciones móviles con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 6 capas (backbone flow_lm_main) con cabecera flow (flow_net) y decodificador Mimi (mimi_decoder); grafos ONNX separados |
| Parametros totales | ~110 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 únicamente (sin cuantización en este pack) |
| Idiomas soportados | Griego (el) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (grafos FP32) + safetensors (estado de voz) + SentencePiece (tokenizer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai, descompuesta en cinco grafos ONNX exportados con `torch.onnx.export` (exportador legacy TorchScript, opset 17, constant folding) desde `pocket-tts` 4.0.1. El grafo principal `flow_lm_main` es un transformer causal de 6 capas con tensores KV explícitos (`past_i` → `present_i`), donde `S>1` corresponde a prefill (texto y voz) y `S=1` a un paso de decodificación. El grafo `flow_net` evalúa una cabecera flow (LSD) por paso, y `mimi_decoder` convierte latentes en audio a 24 kHz con estado de convolución en streaming y transformer explícito. Los grafos `text_conditioner` y `latent_input` gestionan la proyección de tokens a embeddings de 1024 dimensiones y la entrada del latente previo (32 dimensiones) respectivamente. Se emplean 40 operadores estándar, sin operadores personalizados ni bucles/condicionales en los grafos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. El modelo base es un fine-tune/destilación de `kyutai/pocket-tts` realizado por myned-ai. La conversión a ONNX no implica reentrenamiento ni ajuste: los pesos se escriben sin cambios, y el encoder Mimi (clonación de voz) no se incluye. La voz Athina se convirtió una sola vez en un estado key/value precalculado a partir de una grabación corta de Mozilla Common Voice (CC0) procesada por los autores originales con nivelación de sonoridad y Resemble Enhance.

## Capacidades

- Síntesis de voz (text-to-speech) en griego a partir de texto, con salida de audio a 24 kHz.
- Inferencia completamente offline y en dispositivo, sin llamadas de red en el momento de la síntesis.
- Voz precalculada "Athina" (femenina, adulta joven, clara y profesional), empaquetada como estado key/value.
- Ejecución en streaming mediante estado explícito de caché KV y convoluciones, adecuada para síntesis incremental.
- Tokenización con SentencePiece incluido (mismo archivo que el upstream), con reglas de host: capitalizar la primera letra, sin puntuación añadida.
- No incluye clonación de voz (el encoder Mimi no está en el pack).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.
- Capacidad multilingüe limitada al griego.

## Casos de uso

- Asistentes de voz personales en Android: el pack está diseñado para una aplicación móvil de asistente personal que lee respuestas de búsqueda; su tamaño de ~406 MB y ejecución con ONNX Runtime permiten síntesis local sin conexión.
- Lectura de contenido en aplicaciones de accesibilidad: integración en lectores de pantalla o apps de lectura para usuarios griegos, con privacidad total al no enviar texto a servidores.
- Sistemas de navegación o avisos por voz offline: generación de indicaciones en griego en dispositivos sin conectividad, con latencia controlada por el bucle de host.
- Interfaces conversacionales embebidas: síntesis de respuestas en asistentes de domótica o quioscos con requisitos de funcionamiento sin red.
- Prototipado de TTS griego en investigación: base reproducible con hashes SHA-256 y manifiesto para experimentos de síntesis en dispositivo.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciación griega para ejercicios de escucha, con voz consistente y predecible.
- Evaluación de pipelines ONNX Runtime: referencia para implementar bucles de decodificación con caché KV y estado de streaming en otros hosts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pack completo ocupa ~406 MB en disco y los grafos FP32 suman aproximadamente 400 MB, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no se especifican; el diseño está orientado a ejecución en dispositivo (Android) con ONNX Runtime, no a GPU de servidor.
- Cabe en GPU consumer: sí, por tamaño (grafos de ~400 MB), aunque no hay datos de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (host que implemente el bucle de decodificación descrito en el manifiesto); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Pocket TTS Greek ONNX (este) | ~110 M | no disponible | Griego | CC BY 4.0 | ONNX FP32 |
| myned-ai/pocket-tts-greek (base) | ~110 M | no disponible | Griego | CC BY 4.0 | PyTorch |
| kyutai/pocket-tts (upstream) | ~110 M (no confirmado) | no disponible | no disponible | MIT (código) / no disponible (pesos) | PyTorch |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta griego; no es multilingüe.
- No incluye clonación de voz: el encoder Mimi no está en el pack y la voz está fija a Athina.
- El bucle de host (muestreo, regla EOS, chunking) no forma parte de los grafos y debe implementarse por separado; una implementación incorrecta puede degradar la calidad.
- Riesgo de alucinación o artefactos en la síntesis ante entradas atípicas o fuera de distribución; no hay benchmarks publicados que lo cuantifiquen.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio indicar los cambios realizados y conservar la atribución a myned-ai y Kyutai.
- Uso prohibido: suplantación o clonación de voz sin consentimiento explícito y lícito, desinformación, y presentar audio generado como grabación real; el audio sintético debe divulgarse como tal cuando pueda confundirse con una persona.
- Verificar los hashes SHA-256 de todos los archivos antes de usar y fijar una revisión de commit en lugar de `main` al descargar.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha; madurez y soporte limitados.

## Enlaces

- Hugging Face: https://huggingface.co/MaTsaou/pocket-tts-greek-onnx
- Modelo base: https://huggingface.co/myned-ai/pocket-tts-greek
- Upstream Kyutai: https://huggingface.co/kyutai/pocket-tts
- Voces del modelo base: https://huggingface.co/myned-ai/pocket-tts-greek/blob/main/voices/voices.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Mozilla Common Voice: https://commonvoice.mozilla.org/
