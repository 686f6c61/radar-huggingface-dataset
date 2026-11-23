# nodcai/livevoice-0.5b-GGUF

## Resumen
livevoice-0.5b-GGUF es una conversión a formato GGUF del modelo de síntesis de voz en tiempo real VibeVoice-Realtime-0.5B de Microsoft, publicada por el usuario nodcai. El objetivo es habilitar la inferencia de texto a voz en streaming mediante livevoice.cpp, un runtime en C++ sobre ggml que permite empezar a emitir audio mientras el texto todavía se está generando, con una latencia de aproximadamente 70-120 ms tras las primeras palabras en un Apple M4 Max. Está pensado para integrarse en aplicaciones donde el texto proviene de un LLM y se necesita voz de forma inmediata, como asistentes conversacionales o pipelines de agentes.

El repositorio incluye varias cuantizaciones (COMPACT, ATTN_Q8, MIXED, Q4_K y Q8_0) con distintos compromisos entre tamaño, memoria y fidelidad de pronunciación, además de dos prompts de voz precalculados. Cada fichero GGUF es autocontenido: incorpora los pesos, el tokenizador y un post-filtro DeepFilterNet3 que elimina un artefacto musical breve que el modelo a veces antepone a la respuesta. La salida es audio mono a 48 kHz.

El modelo base es un transformer de 883.627.733 parámetros (según los safetensors del modelo original) con licencia MIT y soporte únicamente para inglés. Es relevante porque demuestra que un TTS de streaming de calidad razonable puede ejecutarse en hardware de consumo, incluso en dispositivos móviles, con un consumo de memoria por debajo de 1 GB en la variante COMPACT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base VibeVoice-Realtime-0.5B) con cabeza de difusión para generación de audio; sin codificador de audio |
| Parámetros totales | 883.627.733 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0, q4_k, q4_0, q5_k, q6_k, iq4_nl, F16 (combinaciones por receta: COMPACT, ATTN_Q8, MIXED, Q4_K, Q8_0) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml), con prompts de voz en GGUF; modelo original en safetensors |

## Arquitectura y entrenamiento
El modelo base VibeVoice-Realtime-0.5B es un sistema de texto a voz en streaming que carece de codificador de audio: la voz no se clona a partir de una grabación de referencia, sino que se representa como un prompt precalculado (las cachés K/V del modelo tras "escuchar" la voz). La generación de audio emplea una cabeza de difusión con 5 pasos por defecto y una escala de guía (CFG) de 1.5. El modelo de lenguaje interno tiene un tamaño oculto de 896, lo que condiciona las opciones de cuantización: los bloques K-quant de 256 pesos solo encajan en la matriz `ffn_down`, mientras que el resto de matrices y el embedding caen a tipos de bloque 32.

La conversión a GGUF la realiza la herramienta `livevoice.cpp` a partir del modelo original, con un tokenizador derivado de Qwen2.5-0.5B y un post-filtro DeepFilterNet3 empaquetado en el propio fichero. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en la información proporcionada. La innovación destacable es el streaming de baja latencia (70-120 ms tras las primeras palabras en M4 Max) y la receta de cuantización COMPACT, que asigna precisión de forma selectiva según la sensibilidad de cada componente (atención y cabeza de difusión en q8_0, gate/up en iq4_nl, embedding en q4_0 tras eliminar 69.908 filas que el tokenizador nunca produce).

## Capacidades
- Síntesis de voz en streaming: empieza a emitir audio mientras el texto se sigue escribiendo, con latencia de 70-120 ms en M4 Max.
- Generación de audio mono a 48 kHz con post-filtro DeepFilterNet3 integrado para eliminar artefactos musicales.
- Dos voces precalculadas incluidas: en-Clarissa_female y en-Clarion_male (7 MB cada una), compatibles con cualquier fichero de modelo.
- Integración con LLMs: API en C que permite empujar texto a medida que el LLM lo produce y recibir trozos de audio generados.
- Control de parámetros de inferencia: pasos de difusión (5 por defecto) y escala de guía (1.5 por defecto).
- Soporte de reglas de tokenizador para palabras raras (activas por defecto), que mejoran la pronunciación.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada ni modo thinking; es exclusivamente TTS de inglés.

## Casos de uso
- Asistentes conversacionales en tiempo real: el modelo puede recibir texto de un LLM token a token y empezar a hablar con 70-120 ms de latencia, lo que permite respuestas habladas fluidas en chatbots de voz sin esperar a que se complete la generación de texto.
- Lectura de respuestas de agentes en pipelines multi-paso: al integrarse mediante la API en C de livevoice.cpp, se puede conectar la salida de un agente que razona por pasos y sintetizar cada fragmento conforme se produce, manteniendo la sensación de conversación natural.
- Sistemas de atención al cliente automatizada: con solo 0,9 GB de memoria en la variante COMPACT, se puede desplegar en servidores modestos o en el propio dispositivo del usuario para leer respuestas de un bot de soporte en inglés.
- Aplicaciones móviles de accesibilidad: la variante Q4_K corre a 8,0x tiempo real en un iPhone 18 Pro (Metal, 5 pasos, CFG 1.5), lo que la hace viable para lectores de pantalla o asistentes de voz en dispositivos de consumo.
- Integración en pipelines de CI/CD para pruebas de voz: la API en C y el CLI permiten generar locuciones de prueba de forma determinista y verificar la pronunciación de palabras raras mediante un modelo ASR como juez (el autor reporta 94,6 % de acierto en 990 slots con COMPACT).
- Generación de audio para prototipos y demos: el tamaño reducido de los ficheros (577 MB el más pequeño) y la licencia MIT facilitan incluir voz sintética en demos de producto, vídeos explicativos o pruebas de concepto sin depender de servicios en la nube.
- Investigación en TTS en streaming: sirve como banco de pruebas para estudiar el efecto de distintas cuantizaciones en la calidad de pronunciación y en la latencia, con métricas publicadas de deriva del modelo de lenguaje y diferencia de forma de onda.

## Benchmarks y rendimiento
El autor publica métricas de calidad y rendimiento de las cuantizaciones, pero no benchmarks estándar de TTS (MOS, WER global) frente a otros modelos.

| Métrica | ATTN_Q8 | COMPACT |
|---|---:|---:|
| Tamaño de fichero | 757 MB | 577 MB |
| Deriva del modelo de lenguaje respecto a q8_0 | 13,0 % | 11,7 % |
| Diferencia de forma de onda del decodificador respecto a q8_0 | 1,9 % | 3,4 % |
| Palabras raras transcritas correctamente (990 slots, juez Parakeet) | 94,7 % | 94,6 % |
| Última palabra de la frase correcta (400 finales) | 96,2 % | 96,5 % |
| Memoria pico en M4 Max | 1,50 GB | 0,92 GB |
| Tiempo para 10,4 s de audio en M4 Max | 0,93 s | 0,94 s |

Pronunciación de palabras raras según cuantización de atención/gate/up (24 frases, 35 slots de palabras raras × 10 semillas, juez ASR):

| Cuantización | Slots de palabras raras acertados |
|---|---:|
| q4_0 (fichero Q4_K) | 73,7 % |
| q8_0 | 79,7 % |
| f16 | 78,3 % |

Velocidad en iPhone 18 Pro (Metal, 5 pasos, CFG 1.5): q4_k a 8,0x tiempo real, attn-q8 a 7,9x, q8_0 gate/up a 6,3x. Con las reglas de tokenizador para palabras raras, attn-q8 alcanza el 82,0 % de los slots.

## Requisitos de hardware
- VRAM/memoria estimada: 0,92 GB pico con COMPACT en M4 Max; 1,50 GB con ATTN_Q8. Los ficheros van de 577 MB (COMPACT) a 1,1 GB (Q8_0).
- GPU recomendadas: no se especifican modelos concretos de NVIDIA o AMD; el autor reporta pruebas en Apple M4 Max (CPU/GPU unificada) y iPhone 18 Pro (Metal).
- Cabe en GPU de consumo: sí, por el tamaño (menos de 1,1 GB de pesos) y por las pruebas en hardware Apple; no se aportan datos de VRAM en GPUs discretas.
- Opciones de despliegue: livevoice.cpp (runtime C++/ggml con CLI y API en C); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 70-120 ms tras las primeras palabras en M4 Max; 0,93-0,94 s para generar 10,4 s de audio en M4 Max; 6,3x-8,0x tiempo real en iPhone 18 Pro según cuantización. El rendimiento en GPU de teléfono con COMPACT no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| livevoice-0.5b-GGUF (este) | 883,6 M | no disponible | en | MIT | GGUF, livevoice.cpp | TTS en streaming, 0,9-1,5 GB de memoria, latencia 70-120 ms en M4 Max |
| microsoft/VibeVoice-Realtime-0.5B | 883,6 M | no disponible | en | MIT | safetensors (modelo original) | Modelo base; requiere el stack original de Microsoft, sin cuantizaciones GGUF |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparación en la información proporcionada |

## Limitaciones y advertencias
- Solo soporta inglés; no hay capacidades multilingües.
- No dispone de codificador de audio: no se puede clonar una voz a partir de una grabación, solo usar los prompts precalculados incluidos.
- Riesgo de alucinación en la pronunciación: el autor documenta que COMPACT dice "cryptocurrencies" en lugar de "cryptocurrency" al final de frase en 12 de 30 casos, frente a 1 de 30 con ATTN_Q8.
- La cuantización Q4_K empeora en palabras raras (73,7 % de acierto frente a 79,7 % con q8_0).
- El fichero COMPACT limita `merge_cap` a 80000 (el valor por defecto) y requiere livevoice.cpp del 2026-11-10 o posterior.
- La velocidad en GPU de teléfono con COMPACT no se ha medido, por lo que el rendimiento en móviles con esa variante es incierto.
- El modelo puede generar artefactos musicales breves al inicio de la respuesta; el post-filtro DeepFilterNet3 los mitiga, pero no se garantiza su eliminación total.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad.
- La licencia MIT permite uso comercial, pero al derivar de un modelo de Microsoft conviene revisar las condiciones del modelo base y de DeepFilterNet3.

## Enlaces
- Hugging Face: https://huggingface.co/nodcai/livevoice-0.5b-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Runtime livevoice.cpp: https://github.com/nodcai/livevoice.cpp
- Repositorio VibeVoice de Microsoft: https://github.com/microsoft/VibeVoice
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
