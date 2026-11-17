# nodcai/livevoice-0.5b-gguf

## Resumen
livevoice-0.5b-gguf es una conversión a formato GGUF del modelo de síntesis de voz en streaming VibeVoice-Realtime-0.5B de Microsoft, empaquetada por el desarrollador independiente nodcai para su uso con livevoice.cpp, un runtime en C++/ggml. El modelo base es un sistema de text-to-speech en tiempo real que empieza a generar audio mientras el texto todavía se está escribiendo, con una latencia de arranque de aproximadamente 70-120 ms tras las primeras palabras en un Apple M4 Max. Esto lo hace adecuado para asistentes conversacionales donde la respuesta hablada debe comenzar casi de inmediato.

La conversión incluye el tokenizador y un post-filtro DeepFilterNet3 integrado en el propio archivo GGUF, que elimina el artefacto musical corto que el modelo a veces antepone a una respuesta. La salida es audio mono a 48 kHz. El repositorio ofrece varias recetas de cuantización (COMPACT, ATTN_Q8, MIXED, Q4_K y Q8_0) con distintos equilibrios entre tamaño, memoria y fidelidad de pronunciación, además de dos prompts de voz precalculados (femenino y masculino).

El modelo está pensado para despliegue en entornos con recursos limitados: la variante COMPACT ocupa 577 MB y requiere unos 0,9 GB de memoria en inferencia, lo que permite ejecutarlo en GPUs integradas y dispositivos móviles. La licencia es MIT y el único idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para TTS en streaming sobre un LM tipo transformer (VibeVoice-Realtime); sin codificador de audio |
| Parametros totales | 883.627.733 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0, q4_0, q4_k, q5_k, q6_k, iq4_nl, F16 (combinados por receta: COMPACT, ATTN_Q8, MIXED, Q4_K, Q8_0) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (con tokenizador y DeepFilterNet3 embebidos); prompts de voz en GGUF de 7 MB |

## Arquitectura y entrenamiento
El modelo base VibeVoice-Realtime-0.5B de Microsoft combina un modelo de lenguaje (hidden size 896, según se deduce de las notas de cuantización del autor) con una cabeza de difusión que genera formas de onda de audio. No dispone de codificador de audio: la "voz" no es una grabación de referencia, sino un prompt precalculado que corresponde a las cachés K/V del modelo tras procesar una voz concreta. La generación usa por defecto 5 pasos de difusión y una escala de guía (CFG) de 1.5.

El autor no documenta en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información correspondería a la model card original de Microsoft, no incluida aquí. La innovación destacable de esta conversión es el pipeline de cuantización consciente de la sensibilidad por capas: las proyecciones de atención y la cabeza de difusión se mantienen en q8_0 porque su degradación a q4_0 provoca una deriva de salida de aproximadamente el 10 %, mientras que la matriz gate/up puede bajar a iq4_nl con una deriva del 8,7 %. La conversión también elimina 69.908 filas del embedding que el tokenizador nunca produce bajo el límite de merges de 80.000 de livevoice.cpp.

## Capacidades
- Síntesis de voz en streaming: comienza a emitir audio mientras el texto se sigue escribiendo, con latencia de arranque de 70-120 ms en M4 Max.
- Generación de audio a 48 kHz mono con post-filtrado DeepFilterNet3 integrado para eliminar artefactos musicales iniciales.
- Salida controlada por prompts de voz precalculados; se incluyen dos voces (en-Clarissa_female y en-Clarion_male) compatibles con cualquier archivo de modelo.
- API en C para empujar texto por fragmentos y recibir chunks de audio a medida que se generan, pensada para integrarse con la salida de un LLM.
- Parámetros ajustables de difusión (número de pasos, guidance scale).
- Soporte de reglas de tokenizador para mejorar la pronunciación de palabras poco frecuentes (activas por defecto en livevoice.cpp).
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente text-to-speech.

## Casos de uso
- Asistentes de voz conversacionales: el modelo puede empezar a hablar tras las primeras palabras del LLM, lo que reduce la sensación de espera en diálogos por turnos con latencia crítica.
- Lectura de respuestas de chatbots en tiempo real: al aceptar texto por fragmentos mediante `lv_stream_push`, se puede ir sintetizando la respuesta a medida que el LLM la genera, sin esperar a que termine.
- Sistemas de accesibilidad: conversión de texto a voz de baja latencia en aplicaciones de lectura de pantalla o asistencia para personas con discapacidad visual, con un consumo de memoria de 0,9 GB en la variante COMPACT.
- Integración en aplicaciones móviles o de escritorio en C/C++: el runtime livevoice.cpp permite enlazar el modelo en binarios nativos sin dependencias de Python; en iPhone 18 Pro la variante q4_k alcanza 8,0x tiempo real.
- Generación de locuciones para contenido dinámico: anuncios, notificaciones o respuestas de IVR donde el texto se conoce en el momento de la reproducción y se requiere audio inmediato.
- Prototipado de interfaces de voz en hardware modesto: la variante COMPACT (577 MB, 0,92 GB de pico en M4 Max) permite experimentar en equipos sin GPU dedicada.
- Evaluación comparativa de cuantizaciones para TTS: el repositorio documenta métricas de pronunciación de palabras raras y deriva de salida por receta, útil para quien necesite elegir el equilibrio tamaño/calidad.

## Benchmarks y rendimiento
Los datos disponibles son métricas internas del autor sobre fidelidad de pronunciación, deriva y velocidad, no benchmarks estándar de TTS (no hay MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo).

| Metrica | Q4_K | ATTN_Q8 | COMPACT | Q8_0 |
|---|---:|---:|---:|---:|
| Tamano del archivo | 667 MB | 757 MB | 577 MB | 1,1 GB |
| Deriva del LM respecto a q8_0 | no disponible | 13,0 % | 11,7 % | referencia |
| Diferencia de forma de onda del decoder | no disponible | 1,9 % | 3,4 % | referencia |
| Palabras raras transcritas correctamente (990 slots, Parakeet como juez) | no disponible | 94,7 % | 94,6 % | no disponible |
| Ultima palabra de la frase correcta (400 finales) | no disponible | 96,2 % | 96,5 % | no disponible |
| Memoria pico, M4 Max | no disponible | 1,50 GB | 0,92 GB | no disponible |
| Tiempo para 10,4 s de audio, M4 Max | no disponible | 0,93 s | 0,94 s | no disponible |
| Velocidad en iPhone 18 Pro (Metal, 5 pasos, CFG 1.5) | 8,0x tiempo real | 7,9x | no medido | 6,3x (gate/up q8_0) |

Además, la tabla de pronunciación de palabras raras por tipo de matriz (24 frases, 35 huecos de palabra rara, 10 semillas, juez ASR) indica: q4_0 en atención/gate/up acierta el 73,7 % de los huecos, q8_0 el 79,7 % y f16 el 78,3 %. Con las reglas de tokenizador de livevoice.cpp, attn-q8 alcanza el 82,0 %.

## Requisitos de hardware
- VRAM/memoria estimada: 0,92 GB de pico con COMPACT en M4 Max; 1,50 GB con ATTN_Q8. El archivo Q8_0 de 1,1 GB requiere más memoria que las variantes cuantizadas, aunque el autor no da cifra exacta.
- GPU recomendadas: no se documentan GPU de escritorio concretas; las mediciones publicadas son en Apple M4 Max (CPU/GPU Apple) y iPhone 18 Pro (Metal).
- Cabe en GPU de consumo: sí, por el tamaño (577 MB a 1,1 GB) y el consumo de memoria; el autor no especifica modelos concretos como RTX 4090, pero cualquier GPU con más de 2 GB de memoria libre debería poder alojarlo.
- Opciones de despliegue: livevoice.cpp (runtime C++/ggml específico, con CLI `livevoice-cli` y API en C). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 70-120 ms hasta el inicio del habla en M4 Max; 0,93-0,94 s para generar 10,4 s de audio en M4 Max (ATTN_Q8 y COMPACT); 8,0x tiempo real en iPhone 18 Pro con q4_k. La velocidad en GPU de móvil para COMPACT no se ha medido.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables (por ejemplo, otros TTS en streaming como Kokoro, Piper o variantes de VibeVoice de mayor tamaño). La comparación interna entre recetas del propio repositorio se recoge en la sección de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| livevoice-0.5b-gguf (este) | 883,6 M | no disponible | MIT | GGUF |
| VibeVoice-Realtime-0.5B (base) | 0,5 B (nominal) | no disponible | no disponible en esta ficha | safetensors/.pt |
| Alternativas TTS comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Solo soporta inglés; no hay capacidades multilingües.
- Es un modelo de síntesis de voz, no un LLM: no genera texto, no razona, no hace tool calling ni soporta agentes.
- Riesgo de artefactos de audio: el modelo puede anteponer un sonido musical corto a la respuesta, mitigado por el post-filtro DeepFilterNet3, pero no necesariamente eliminado en todos los casos.
- Problemas de pronunciación en palabras raras: con q4_0 en atención/gate/up el acierto baja al 73,7 % de los huecos; la variante COMPACT puede decir "cryptocurrencies" en lugar de "cryptocurrency" al final de frase con más frecuencia que ATTN_Q8 (12 de 30 frente a 1 de 30 en una frase de prueba).
- La variante COMPACT limita `merge_cap` a 80.000 (el valor por defecto), lo que restringe la tokenización de palabras muy poco comunes.
- La velocidad en GPU de móvil para COMPACT no se ha medido; las cifras de rendimiento publicadas corresponden a M4 Max e iPhone 18 Pro.
- Dependencia de un runtime específico (livevoice.cpp) y de una versión mínima (2026-11-10 o posterior para COMPACT); no es compatible con el ecosistema llama.cpp genérico.
- Licencia MIT: permite uso comercial, pero el autor no detalla condiciones adicionales del modelo base de Microsoft más allá de la licencia declarada.
- No se documentan sesgos del modelo base en la información disponible; al ser un TTS entrenado presumiblemente con voces inglesas, puede reflejar sesgos de acento y prosodia del corpus original.

## Enlaces
- Hugging Face: https://huggingface.co/nodcai/livevoice-0.5b-gguf
- Modelo base: https://huggingface.co/microsoft/VibeVoice-Realtime-0.5B
- Runtime livevoice.cpp: https://github.com/nodcai/livevoice.cpp
- Repositorio VibeVoice de Microsoft: https://github.com/microsoft/VibeVoice
- DeepFilterNet: https://github.com/Rikorose/DeepFilterNet
