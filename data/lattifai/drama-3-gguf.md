# LattifAI/Drama-3-GGUF

## Resumen

Drama-3-GGUF es una colección de pesos cuantizados en formato GGUF del modelo de síntesis de voz `fishaudio/drama-3`, preparada por LattifAI para su ejecución local con llama.cpp y la aplicación EdgeSpeak. El modelo original lo desarrolla Fish Audio y genera diálogos multi-hablante a 44,1 kHz a partir de texto, con capacidad de clonación de voz. Esta versión cuantizada rebaja los requisitos de memoria del checkpoint original (37,15 GB en FP8/BF16) hasta los 8,65 GB de la variante de 2 bpw, lo que permite ejecutarlo en hardware de consumo.

La arquitectura combina un backbone de tipo Mixture of Experts derivado de Qwen3.5-MoE (35B parámetros totales, 3B activos) que predice el token semántico de cada trama de audio, con un módulo mmproj que contiene la torre de codebooks (predice los 9 codebooks restantes), el decodificador Fish DAC que convierte códigos en audio y el codificador de códec necesario para la clonación de voz. El repositorio ofrece tres backbones (4, 3 y 2 bpw) y tres mmproj (q8_0, q5_k y q4_k), combinables entre sí.

Su relevancia actual radica en que traslada un modelo TTS multi-hablante de gama alta al ecosistema llama.cpp, con métricas de fidelidad publicadas frente al modelo BF16 (divergencia KL, acuerdo top-1 y tasa de acierto de contenido vía ASR) y velocidad de generación de aproximadamente 4,7-4,9× tiempo real en una RTX PRO 6000. La licencia Fish Audio Research restringe el uso comercial, lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.5-MoE (transformer MoE) + torre de codebooks + decodificador/encoder Fish DAC |
| Parámetros totales | 26.618.557.056 (según safetensors); la model card indica 35B totales / 3B activos para el backbone |
| Parámetros activos | 3B (backbone MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Backbone: ~4 bpw (256 expertos), ~3 bpw (192 expertos), ~2 bpw (192 expertos). mmproj: Q8_0, Q5_K, Q4_K en la torre de codebooks; decodificador Q8_0; encoder F32/F16 |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Research License (también referenciada como Fish Audio Community License v1.0); uso de investigación y no comercial, con uso comercial limitado según la licencia |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en FP8 (expertos enrutados) y BF16 (resto) |

## Arquitectura y entrenamiento

El backbone es un transformer de tipo Mixture of Experts basado en Qwen3.5-MoE, con 35B parámetros totales y 3B activos, que predice el token semántico de cada trama de audio. Sobre esa salida actúa el módulo mmproj, que integra tres componentes: una torre de codebooks que predice los 9 codebooks restantes, el decodificador Fish DAC que transforma los códigos en audio a 44,1 kHz y un codificador de códec empleado para la clonación de voz. Las variantes de 3 y 2 bpw conservan 192 de los 256 expertos enrutados por capa y fijan `qwen35moe.expert_count = 192`, de modo que llama.cpp estándar las carga directamente.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de decodificación más allá del esquema de predicción por codebooks y el uso de etiquetas `<|speaker:N|>` (0-15) para separar personajes en un diálogo. La cuantización mezcla precisiones (mixed precision) para preservar la fidelidad del backbone, con métricas publicadas frente al modelo BF16 de referencia.

## Capacidades

- Síntesis de voz (text-to-speech) a 44,1 kHz a partir de texto.
- Generación de diálogo multi-hablante: cada etiqueta `<|speaker:N|>` (0-15) corresponde a un personaje distinto.
- Clonación de voz mediante un clip de referencia y su transcripción (requiere una build de llama.cpp con el PR ggml-org/llama.cpp#32586).
- Voces por personaje en EdgeSpeak: cada personaje de un guion puede usar su propia voz de referencia en modo Broadcast.
- Reproducibilidad de voces muestreadas: la misma semilla (`-s`) y el mismo texto producen las mismas voces en llama.cpp.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada general ni otras modalidades distintas del TTS.

## Casos de uso

- Doblaje y locución de diálogos: el modelo genera conversaciones entre varios personajes usando las etiquetas `<|speaker:N|>`, adecuado para audiolibros, ficción sonora y podcasts dramatizados.
- Prototipado de videojuegos: permite generar voces para NPC y cinemáticas en local con la variante de 2 bpw (8,65 GB), sin depender de servicios en la nube.
- Clonación de voz para demos y pruebas de concepto: con un clip de referencia de hasta 30 s y su transcripción se obtiene una voz clonada para el personaje asignado.
- Postproducción de audio: la generación a 44,1 kHz y la velocidad de 4,7-4,9× tiempo real en una RTX PRO 6000 permiten iterar guiones con rapidez.
- Investigación en TTS: las métricas de divergencia KL, acuerdo top-1 y tasa de acierto de contenido permiten estudiar el impacto de la cuantización en la calidad del habla.
- Integración en herramientas de escritorio: EdgeSpeak ejecuta estos ficheros en local y asigna una voz de referencia distinta a cada personaje de un guion.
- Evaluación de despliegue en llama.cpp: sirve como banco de pruebas para el soporte TTS de llama.cpp (`llama-tts`) y del layout `drama3_gen`.

## Benchmarks y rendimiento

Fidelidad del backbone frente al modelo BF16 en prompts reservados (evaluada solo en posiciones de respuesta; comprobaciones ASR en el motor EdgeSpeak con torre de codebooks Q8_0):

| Backbone | Tamaño | Divergencia KL | Acuerdo top-1 | Acierto de contenido (clips) |
|---|---:|---:|---:|---:|
| 4 bpw, 256 expertos | 17,34 GB | 0,0196 | 0,899 | 145 / 146 |
| 3 bpw, 192 expertos | 12,98 GB | 0,0458 | 0,858 | 142 / 146 |
| 2 bpw, 192 expertos | 8,65 GB | 0,0899 | 0,805 | 145 / 146 |

Comparativa de mmproj con el backbone de 2 bpw en el motor EdgeSpeak (138 textos para contenido, 91 prompts de referencia única para clonación):

| mmproj | Tamaño | Acierto de contenido | Acierto de hablante | Similitud media |
|---|---:|---:|---:|---:|
| `q8_0` | 2,17 GB | 137 / 138 | 87 / 91 | 0,955 |
| `q5_k` | 1,71 GB | 136 / 138 | 89 / 91 | 0,959 |
| `q4_k` | 1,56 GB | 135 / 138 | 86 / 91 | 0,954 |

Velocidad en RTX PRO 6000 (sm_120) con `llama-bench`, todas las capas en GPU (`-ngl 99`):

| Backbone | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|
| 4 bpw, 256 expertos | 10.825 | 274,2 |
| 3 bpw, 192 expertos | 11.070 | 235,7 |
| 2 bpw, 192 expertos | 9.513 | 228,6 |

De extremo a extremo, `llama-tts` genera audio a ~4,7-4,9× tiempo real en esa GPU.

## Requisitos de hardware

- VRAM estimada: el backbone de 2 bpw ocupa 8,65 GB y el de 4 bpw 17,34 GB; hay que sumar el mmproj elegido (1,56-2,17 GB). Combinación mínima aproximada: ~10,2 GB (2 bpw + q4_k); combinación de mayor calidad: ~19,5 GB (4 bpw + q8_0).
- GPU recomendadas: RTX PRO 6000 (mediciones oficiales), A100 y H100 por capacidad de memoria; RTX 4090 (24 GB) puede alojar cualquier combinación de backbone y mmproj.
- GPU de consumo: sí cabe en GPUs de 16 GB o más con la variante de 2 bpw; en 12 GB el margen es muy ajustado incluso con 2 bpw + q4_k.
- Despliegue: llama.cpp (`llama-tts`) y EdgeSpeak. La clonación de voz exige una build de llama.cpp con el PR #32586.
- Latencia y throughput: ~4,7-4,9× tiempo real de extremo a extremo y 228,6-274,2 t/s en tg128 según backbone, medidos en RTX PRO 6000. No hay datos para otras GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Drama-3-GGUF (este) | 26,6B (35B/3B activos según model card) | no disponible | Fish Audio Research | GGUF |
| fishaudio/drama-3 (original) | 35B totales / 3B activos | no disponible | Fish Audio Research | FP8/BF16 |
| Alternativas TTS de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia Fish Audio Research: uso de investigación y no comercial, con un uso comercial limitado descrito en la licencia; los ficheros son derivados y conservan la licencia del checkpoint original.
- En llama.cpp no se pueden elegir voces: cada personaje recibe una voz muestreada y no existen voces predefinidas.
- La clonación de voz en llama.cpp admite un único clip de referencia por petición; en un diálogo solo el personaje vinculado a la referencia usa la voz clonada.
- La referencia se asigna al hablante 0 salvo que su transcripción empiece por otra etiqueta `<|speaker:N|>`.
- Solo se utilizan los primeros 30 s del clip de referencia.
- La clonación requiere una build de llama.cpp con el PR #32586, abierto en el momento de redactar la model card.
- La cuantización degrada la fidelidad: la divergencia KL sube de 0,0196 (4 bpw) a 0,0899 (2 bpw) y el acuerdo top-1 baja de 0,899 a 0,805.
- Los resultados de acierto de contenido varían en ±2 clips entre ejecuciones.
- No se documentan sesgos, idiomas soportados ni comportamiento frente a alucinaciones; la ausencia de esta información impide evaluar riesgos en producción.
- El uso de clonación de voz plantea riesgos de suplantación y requiere consentimiento explícito de la persona cuya voz se replica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LattifAI/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PR de clonación de voz en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32586
- EdgeSpeak (descarga): https://edgespeak.com/download
- EdgeSpeak: https://edgespeak.com
- Fichero de checksums: `SHA256SUMS` en el repositorio
- README en chino: README.zh-CN.md en el repositorio
