# HoppouAI/Breeze-TTS-2.cpp

## Resumen

Breeze-TTS-2.cpp es una reimplementación en C++ sobre ggml del modelo de síntesis de voz BreezeBlue/Breeze-TTS-2, publicada por el usuario HoppouAI. No se trata de un modelo nuevo, sino de una conversión a formato GGUF junto con un runtime propio que ejecuta las cuatro etapas del pipeline original: el codificador de texto T5Gemma2, el backbone Qwen3, un decodificador de profundidad de 15 pasos y el vocoder. El resultado es un sistema de text-to-speech bilingüe (inglés y mandarín) a 24 kHz que funciona con backend Vulkan sobre GPU NVIDIA, AMD e Intel, con caída a CPU.

Su relevancia práctica está en la portabilidad: el modelo original requiere el stack habitual de Python y PyTorch, mientras que esta conversión permite desplegar TTS con clonación de voz en hardware de consumo y sin dependencias de CUDA. Con 3.011.962.721 parámetros y ficheros que van de 2,3 GB a 5,9 GB según cuantización, el modelo Q8_0 recomendado ocupa 3,3 GB y alcanza un factor de tiempo real de 1,99x en una RTX 3060 y 3,16x en una RTX 3080 con `cfg_scale` 1.

La licencia es el principal freno para adopción comercial: se distribuye bajo `breezeblue-research-and-non-commercial`, heredada del modelo base, lo que restringe el uso a investigación y escenarios no comerciales. Además, los ficheros GGUF no cargan en llama.cpp: requieren el runtime específico Breeze-TTS-2.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro etapas: codificador de texto T5Gemma2, backbone Qwen3, decodificador de profundidad de 15 pasos y vocoder |
| Parámetros totales | 3.011.962.721 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q4_K, y variantes experimentales `-dd` (Q8_0 con decodificador de profundidad Q4_K o Q2_K; Q4_K con decodificador Q2_K) |
| Idiomas soportados | inglés y chino mandarín |
| Licencia | `breezeblue-research-and-non-commercial` (research and non-commercial) |
| Formato de pesos | GGUF (exclusivo del runtime Breeze-TTS-2.cpp; incompatible con llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline TTS en cascada de cuatro componentes. El texto de entrada pasa por un codificador T5Gemma2, cuyos embeddings alimentan un backbone basado en Qwen3. Sobre ese backbone opera un decodificador de profundidad que ejecuta 15 pasos secuenciales por cada frame de audio, y finalmente un vocoder convierte la representación latente en audio PCM a 24 kHz. El decodificador de profundidad es el cuello de botella computacional en hardware donde el ancho de banda de memoria no es limitante, de ahí que existan las variantes `-dd` que lo cuantizan por separado.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del repositorio de conversión no documenta el proceso de entrenamiento del modelo original, únicamente el pipeline de inferencia. La innovación técnica destacable de esta publicación no está en el modelo sino en el runtime: implementación completa en C++ sobre ggml con backend Vulkan, servidor con interfaz web y streaming por HTTP y WebSocket, y generación de múltiples streams concurrentes mediante `--parallel`.

## Capacidades

- Síntesis de voz bilingüe inglés y mandarín a 24 kHz.
- Clonación de voz a partir de un clip de referencia más su transcripción (`--ref-audio` y `--ref-text`).
- Diseño de voz por descripción textual (`--instruction`), por ejemplo "A warm, thoughtful young woman with a clear, calm delivery".
- Eventos vocales no verbales mediante etiquetas en línea entre paréntesis: `(laugh)`, `(sigh)`, `(cough)`, `(clears throat)`, y `[笑]` o `[叹气]` en chino. El vocabulario es libre, no una lista fija de tokens, por lo que descripciones como `(nervous chuckle)` suelen funcionar.
- Conversión de voz: re-sintetiza una grabación existente en otra voz manteniendo el timing, la frase y el énfasis originales. Es una capacidad experimental que no forma parte del modelo original y surge de cómo el códec separa contenido semántico y detalle acústico.
- Servidor con interfaz web integrada y streaming por HTTP y WebSocket.
- Generación concurrente de varios streams con `--parallel`.
- Control de guidance mediante `cfg_scale`, necesario para que se activen las etiquetas vocales y el diseño de voz.

## Casos de uso

- Audiolibros y narración automatizada: el modelo genera voz continua con clonación de un narrador de referencia, útil para producir capítulos largos con timbre consistente. Conviene usar Q8_0 o Q4_K y evitar las variantes `-dd` en pasajes superiores a 45 segundos por la deriva progresiva de calidad.
- Doblaje y localización de contenido: la conversión de voz permite re-sintetizar una grabación en otro registro manteniendo el timing y el énfasis, lo que sirve para adaptar locuciones a una voz de marca concreta.
- Prototipado de asistentes conversacionales: con primer audio en menos de 150 ms y factor de tiempo real superior a 1x en GPU de consumo, el modelo es apto para respuestas habladas de baja latencia en demostraciones y entornos de investigación.
- Generación de voces sintéticas para videojuegos y preproducción: el diseño de voz por descripción textual permite crear repartos de personajes sin muestras previas, y las etiquetas vocales añaden expresividad no verbal.
- Producción de contenido educativo bilingüe: el soporte de inglés y mandarín en un mismo runtime facilita generar materiales en ambos idiomas con la misma infraestructura.
- Servicios de accesibilidad: conversión de texto a voz para lectura de documentos y interfaces, desplegable en servidor local con interfaz web y streaming, sin depender de APIs externas.
- Investigación en síntesis de voz: al ser una implementación C++ sobre ggml con backend Vulkan, sirve como banco de pruebas para estudiar el impacto de la cuantización en cada etapa del pipeline, especialmente en el decodificador de profundidad.

## Benchmarks y rendimiento

La model card proporciona factores de tiempo real (segundos de audio por segundo de reloj; por encima de 1x es más rápido que la reproducción) medidos en Vulkan con un solo stream:

| Fichero | RTX 3060, `cfg_scale` 1 | RTX 3060, `cfg_scale` 3 | RTX 3080, `cfg_scale` 1 | RTX 3080, `cfg_scale` 3 |
|---|---|---|---|---|
| `q4_k` | 2,41x | 1,74x | 3,50x | 2,81x |
| `q6_k` | no disponible | no disponible | 3,67x | 2,87x |
| `q8_0-dd4` | 2,32x | 1,69x | 3,72x | 2,83x |
| `q8_0` | 1,99x | 1,58x | 3,16x | 2,71x |
| `f16` | 1,42x | no disponible | 2,71x | 2,32x |

Notas de medición: la RTX 3060 tiene el límite de tensor cores desbloqueado y la RTX 3080 es una tarjeta de serie; ambas tienen 12 GB. En la 3060 los ficheros pequeños son claramente más rápidos, mientras que en la 3080 la diferencia se reduce. En modo `--parallel` sobre RTX 3080, cinco streams con `q8_0` corrieron cada uno entre 1,46x y 1,68x, y tres streams con guidance a aproximadamente 1,5x, sin cortes. No se han publicado resultados de benchmarks de calidad (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM aproximada: alrededor de 1 GB por encima del tamaño del fichero. Q4_K ≈ 3,4 GB, Q8_0 ≈ 4,3 GB, F16 ≈ 6,9 GB.
- GPU validadas en la documentación: RTX 3060 y RTX 3080, ambas de 12 GB.
- Compatibilidad declarada: backend Vulkan sobre NVIDIA, AMD e Intel, con caída a CPU.
- Cabe en GPU de consumo: sí, cualquier tarjeta con 6 GB o más puede ejecutar Q4_K; con 8 GB se puede usar Q8_0 con margen.
- Despliegue: compilación con CMake (`cmake -B build -DCMAKE_BUILD_TYPE=Release`), binario `breeze-cli` para inferencia puntual y `breeze-server` para servidor con interfaz web y streaming HTTP/WebSocket. No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia: primer audio en menos de 150 ms según la model card.
- Throughput: ver tabla de la sección anterior; de 1,42x a 3,72x según fichero y tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Breeze-TTS-2.cpp (esta ficha) | 3.011.962.721 | en, zh | no disponible | research and non-commercial | GGUF, runtime C++ propio con Vulkan |
| BreezeBlue/Breeze-TTS-2 (base) | 3.011.962.721 | en, zh | no disponible | research and non-commercial | pesos originales, stack Python |
| Alternativas de TTS open source de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks ni especificaciones de otros modelos de TTS que permitan una comparación cuantitativa rigurosa. La comparación más directa disponible es con el modelo base, del que esta publicación se diferencia exclusivamente en el formato y el runtime, no en los pesos ni en las capacidades del modelo.

## Limitaciones y advertencias

- Licencia `breezeblue-research-and-non-commercial`: el uso comercial está restringido. Cualquier despliegue en producto requiere autorización del titular de los derechos del modelo base.
- Incompatibilidad con llama.cpp: los ficheros GGUF solo cargan en el runtime Breeze-TTS-2.cpp. No funcionan en Ollama, vLLM, TGI ni en el ecosistema GGUF estándar.
- Deriva de calidad en las variantes `-dd`: el decodificador de profundidad realimenta códigos al backbone en cada frame, por lo que el error de cuantización se acumula. La salida se degrada de forma progresiva hacia un timbre apagado y fino pasados aproximadamente 45 segundos de generación continua. El fallo es gradual y fácil de pasar por alto en pruebas rápidas. La model card recomienda tratarlas como experimentales y usar Q8_0 o Q4_K en caso de duda.
- Etiquetas vocales poco fiables con `cfg_scale` por defecto: a 1.0 el modelo tiende a ignorar las etiquetas fuera del conjunto común; se necesita `cfg_scale` entre 2 y 3, lo que reduce el throughput (por ejemplo, de 1,99x a 1,58x en RTX 3060 con Q8_0).
- Conversión de voz experimental: el tono se regenera en lugar de copiarse, de modo que la voz convertida se re-canta en el registro de la voz destino y no en el de la fuente. La supervivencia de la melodía varía de un clip a otro; `keep_acoustic 1` o `2` copia los codebooks acústicos más bajos para conservar mejor el contorno original. Requiere evaluación auditiva manual.
- Cobertura lingüística limitada a inglés y mandarín; no hay soporte declarado de castellano.
- No se han publicado datos sobre sesgos, tasas de alucinación o fidelidad de transcripción en la información disponible.
- Riesgo inherente de uso indebido en clonación de voz: la capacidad de clonar a partir de un clip corto exige controles de consentimiento y verificación en cualquier despliegue real.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/HoppouAI/Breeze-TTS-2.cpp
- Modelo base: https://huggingface.co/BreezeBlue/Breeze-TTS-2
- Runtime Breeze-TTS-2.cpp: https://github.com/HoppouAI/Breeze-TTS-2.cpp
- Documentación de rendimiento: https://github.com/HoppouAI/Breeze-TTS-2.cpp/blob/main/docs/performance.md
