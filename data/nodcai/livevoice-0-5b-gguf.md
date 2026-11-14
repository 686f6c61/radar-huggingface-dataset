# nodcai/livevoice-0.5b-GGUF

## Resumen

livevoice-0.5b-GGUF es una conversión al formato GGUF del modelo de síntesis de voz Microsoft VibeVoice-Realtime-0.5B, empaquetada por el usuario nodcai para su uso con livevoice.cpp, un runtime en C++/ggml orientado a text-to-speech en streaming. El modelo base es un sistema de TTS en tiempo real desarrollado por Microsoft que genera audio a 48 kHz en mono y que carece de codificador de audio: las voces se representan como prompts precalculados (las cachés K/V tras "escuchar" una voz), no como grabaciones de referencia. Esta conversión resuelve el problema de desplegar TTS de baja latencia en hardware modesto, incluyendo GPUs de telefonía móvil, mediante cuantización agresiva y un post-filtro integrado.

La arquitectura combina un modelo de lenguaje (con hidden size 896 y tokenizador derivado de Qwen2.5-0.5B) con un cabezal de difusión y un decodificador de waveform, todo empaquetado en un único fichero GGUF autocontenido que incluye pesos, tokenizador y el post-filtro DeepFilterNet3. Aunque el nombre comercial indica "0.5B", el recuento real de parámetros en safetensors asciende a 883.627.733, es decir, aproximadamente 0,88 mil millones de parámetros.

La relevancia actual radica en su latencia: según el autor, empieza a hablar entre 70 y 120 ms después de las primeras palabras en un Apple M4 Max, y alcanza velocidades de 8,0x tiempo real en un iPhone 18 Pro con Metal. El modelo está publicado con licencia MIT y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje tipo transformer con cabezal de difusión y decodificador de waveform (VibeVoice Realtime) |
| Parametros totales | 883.627.733 (según safetensors); comercializado como 0.5B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0, q6_k, q5_k, q4_k, q4_0, iq4_nl, F16 (combinaciones por receta: compact, attn-q8, mixed, q4_k, q8_0) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base VibeVoice-Realtime-0.5B de Microsoft es un sistema de síntesis de voz en streaming que combina un modelo de lenguaje con un cabezal de difusión y un decodificador de waveform. La conversión de nodcai preserva esta estructura: el modelo de lenguaje tiene un hidden size de 896 y emplea un tokenizador derivado de Qwen2.5-0.5B (convertido con `convert_tokenizer.py`). El proceso de conversión incluye también la integración de DeepFilterNet3 como post-filtro para eliminar el artefacto musical corto que el modelo a veces inserta al inicio de una respuesta.

Los detalles sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable de esta conversión es el proceso de cuantización selectiva: dado que las matrices K-quant empaquetan 256 pesos por bloque y el hidden size es 896, solo `ffn_down` puede usar q4_k, mientras que el resto de matrices caen a tipos de bloque 32. El autor mide la deriva de la salida del modelo de lenguaje respecto al fichero q8_0 (0,7 % con embedding en q4_0, ~10 % con atención o gate/up en q4_0) y distribuye los bits en consecuencia. La receta "compact" mantiene la atención en q8_0, usa iq4_nl para gate/up, q4_0 para el embedding tras eliminar 69.908 filas que el tokenizador no puede producir con el límite de merge de 80000, y conserva el cabezal de difusión en q8_0 por ser la parte más sensible.

## Capacidades

- Síntesis de voz en streaming: comienza a generar audio mientras el texto aún se está escribiendo, con latencia de 70-120 ms tras las primeras palabras en un M4 Max.
- Generación de audio a 48 kHz en mono.
- Post-filtrado integrado con DeepFilterNet3 para eliminar artefactos musicales iniciales.
- Soporte de voces precalculadas: dos prompts incluidos (`en-Clarissa_female.gguf` y `en-Clarion_male.gguf`), de 7 MB cada uno, compatibles con cualquiera de los ficheros de modelo.
- API en C para integración en pipelines: `lv_stream_push` permite empujar texto a medida que un LLM lo produce y recibir fragmentos de audio según se generan.
- Control de parámetros de inferencia: por defecto 5 pasos de difusión y guidance scale de 1.5.
- Capacidad de pronunciación mejorada para palabras raras mediante reglas del tokenizador de livevoice.cpp (activadas por defecto).
- Idiomas: únicamente inglés.
- No dispone de codificador de audio, por lo que no soporta clonación de voz a partir de grabaciones de referencia, solo prompts precalculados.

## Casos de uso

- Asistentes de voz conversacionales en tiempo real: el modelo puede empezar a hablar 70-120 ms después de recibir las primeras palabras de un LLM, lo que permite encadenar generación de texto y síntesis sin pausas perceptibles en un diálogo multi-turno.
- Integración en agentes LLM con salida hablada: la API en C permite empujar tokens según se generan (`lv_stream_push`) y recibir audio por callback, adecuada para pipelines de agentes que necesitan respuesta oral inmediata.
- Síntesis en dispositivos móviles: el fichero compact (577 MB, 0,92 GB de memoria pico) corre a 7,9x tiempo real en un iPhone 18 Pro con Metal, lo que lo hace viable para aplicaciones de accesibilidad o lectores de pantalla en teléfono.
- Lectura de textos largos por lotes: con 0,94 s para generar 10,4 s de audio en un M4 Max, es adecuado para convertir artículos, documentación o correos en audio de forma masiva.
- Sistemas de atención al cliente con respuesta de voz: al ser autocontenido (pesos, tokenizador y filtro en un solo GGUF) y con licencia MIT, puede desplegarse en servidores modestos o en el borde sin dependencias de Python.
- Prototipado e investigación en TTS en C/C++: el runtime livevoice.cpp y los ficheros GGUF permiten experimentar con cuantizaciones y parámetros de difusión sin montar un stack de PyTorch.
- Generación de avisos y notificaciones habladas de baja latencia: la velocidad de 8,0x tiempo real con q4_k en GPU móvil permite sintetizar mensajes cortos casi instantáneamente en aplicaciones embebidas.

## Benchmarks y rendimiento

El autor publica métricas de calidad y velocidad de las distintas cuantizaciones, no benchmarks estándar de TTS (MOS, WER global) frente a otros modelos.

| Metrica | attn-q8 | compact |
|---|---:|---:|
| Tamano de fichero | 757 MB | 577 MB |
| Deriva del modelo de lenguaje respecto a q8_0 | 13,0 % | 11,7 % |
| Diferencia de waveform del decodificador respecto a q8_0 | 1,9 % | 3,4 % |
| Palabras raras transcritas correctamente (990 slots, Parakeet como juez) | 94,7 % | 94,6 % |
| Última palabra de la frase correcta (400 finales) | 96,2 % | 96,5 % |
| Memoria pico en M4 Max | 1,50 GB | 0,92 GB |
| Tiempo para 10,4 s de audio en M4 Max | 0,93 s | 0,94 s |

Pronunciación de palabras raras (24 frases con 35 slots de palabras raras x 10 semillas, juzgado por un modelo ASR):

| Atención / gate / up del LM | Slots de palabras raras acertados |
|---|---:|
| q4_0 (fichero q4_k) | 73,7 % |
| q8_0 | 79,7 % |
| f16 | 78,3 % |

Velocidad en iPhone 18 Pro (Metal, 5 pasos, CFG 1,5): q4_k a 8,0x tiempo real, attn-q8 a 7,9x y q8_0 gate/up a 6,3x. Con las reglas del tokenizador para palabras raras, attn-q8 alcanza el 82,0 % de los slots. Las tasas de error en palabras cotidianas son iguales en todos los ficheros. La velocidad en GPUs de telefonía del fichero compact no se ha medido.

## Requisitos de hardware

- VRAM/memoria estimada: 0,92 GB de memoria pico con el fichero compact en M4 Max; 1,50 GB con attn-q8; el fichero q8_0 de 1,1 GB requiere algo más.
- GPU recomendadas: Apple M4 Max (medido), iPhone 18 Pro con Metal (medido). No se especifican GPU NVIDIA o AMD en la información disponible.
- Cabe en GPU consumer: sí, por el reducido tamaño de los ficheros (577 MB a 1,1 GB), aunque no se han publicado mediciones en RTX 4090 u otras GPU de escritorio.
- Opciones de despliegue: livevoice.cpp (runtime C++/ggml con CLI `livevoice-cli` y API en C); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 70-120 ms hasta el primer audio tras las primeras palabras en M4 Max.
- Throughput: 0,93-0,94 s para generar 10,4 s de audio en M4 Max (aproximadamente 11x tiempo real); 8,0x tiempo real en iPhone 18 Pro con q4_k.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de TTS en la información proporcionada. A continuación se comparan características estructurales con alternativas del mismo segmento (TTS ligero y en streaming), marcando como "no disponible" los datos no publicados.

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| livevoice-0.5b-GGUF | 883.627.733 | no disponible | MIT | GGUF | en |
| microsoft/VibeVoice-Realtime-0.5B (base) | no disponible | no disponible | no disponible | safetensors | en |
| Alternativas TTS ligeras (p. ej. Piper, Kokoro) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- No dispone de codificador de audio: no permite clonar voces a partir de grabaciones, solo usar prompts precalculados en formato GGUF.
- Riesgo de artefacto musical al inicio de la respuesta; se mitiga con el post-filtro DeepFilterNet3 integrado, pero no se garantiza su eliminación total.
- El fichero compact limita `merge_cap` a 80000 (el valor por defecto) y en una frase de prueba produce "cryptocurrencies" en lugar de "cryptocurrency" final con más frecuencia que attn-q8 (12 de 30 frente a 1 de 30).
- La cuantización q4_0 en atención, gate/up o embedding degrada la pronunciación de palabras raras (73,7 % de acierto frente a 79,7 % con q8_0); la receta compact prioriza atención y cabezal de difusión en q8_0 para evitarlo.
- La velocidad en GPUs de telefonía del fichero compact no se ha medido; las cifras móviles publicadas corresponden a q4_k, attn-q8 y q8_0 gate/up.
- Licencia MIT: permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Microsoft y de DeepFilterNet3, cuyas licencias no se detallan en la información disponible.
- Riesgo de alucinación no aplica en el sentido habitual de generación de texto, pero sí de errores de pronunciación y de fidelidad al texto de entrada.
- No se han publicado datos sobre sesgos del modelo ni sobre comportamiento con textos fuera de dominio.
- El runtime livevoice.cpp requiere la versión del 10 de noviembre de 2026 o posterior para el fichero compact.

## Enlaces

- Hugging Face: https://huggingface.co/nodcai/livevoice-0.5b-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Runtime livevoice.cpp: https://github.com/nodcai/livevoice.cpp
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
- Repositorio microsoft/VibeVoice: https://github.com/microsoft/VibeVoice
