# Harsha001/Haru-4B-ROCmFPX

## Resumen

Haru-4B-ROCmFPX es una conversión a formato GGUF del modelo Haru-4B de higurashi-ai, un modelo de diálogo hablado en full-duplex (escucha y habla simultáneamente). El autor de esta ficha, Harsha001, publica los pesos cuantizados junto con un runtime nativo en C++ (`llama-haru`) integrado en su fork de llama.cpp denominado ROCmFPX. El modelo base emplea un backbone de lenguaje Qwen3.5-4B, una cabeza MeanFlow que transforma el estado oculto en un latente de audio de 64 dimensiones y un códec causal VibeVoice que sintetiza audio a 24 kHz. Cada 133 ms procesa un frame de audio de entrada y emite un frame de audio y texto de salida.

La relevancia de esta publicación es doble. Por un lado, demuestra que es posible ejecutar un modelo speech-to-speech full-duplex fuera de PyTorch mediante un runtime C++ con llama.cpp, con una fidelidad numérica verificada parte por parte (similitud coseno de 1.000000 en códec y proyectores, 0.999998 en estados ocultos del LM). Por otro, valida un esquema de cuantización propietario de 6 bits (ROCmFPX) que compite con Q6_K estándar en tamaño (3,48 GB frente a 3,46 GB) con mejor divergencia KL sobre texto wiki (0,0113 frente a 0,0153).

El repositorio tiene 10,3 GB e incluye tres ficheros: dos variantes del modelo de lenguaje (Q8_0 de 4,48 GB y Q6_0_ROCMFPX de 3,48 GB) y un fichero de audio F16 de 2,30 GB con los proyectores, la cabeza MeanFlow y el códec. El modelo se distribuye bajo licencia Apache 2.0 y soporta nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-4B + cabeza MeanFlow + codec causal VibeVoice (full-duplex speech-to-speech) |
| Parametros totales | 1.064.254.723 (safetensors reportados); el nombre comercial indica 4B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (4,48 GB), Q6_0_ROCMFPX (3,48 GB); audio en F16 (2,30 GB); Q6_K estandar mencionado pero no subido; 8-bit ROCmFPX retenido |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Haru-4B es un modelo de diálogo hablado full-duplex: procesa y genera audio de forma continua y simultánea, con un frame de 133 ms. La arquitectura se compone de tres bloques: un backbone de lenguaje Qwen3.5-4B que mantiene el estado conversacional y produce logits de texto; una cabeza MeanFlow que proyecta el estado oculto del LM a un latente de audio de 64 dimensiones; y un códec causal VibeVoice que convierte ese latente en audio PCM a 24 kHz. El runtime `llama-haru` implementa esta cadena en C++ sobre llama.cpp, con un modo offline (fichero de entrada, fichero de salida) y sin soporte de micrófono en vivo en esta versión.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo base se describe como un modelo preentrenado liberado para investigación, no como un asistente ajustado por instrucciones. La innovación técnica destacable de esta publicación concreta es la verificación numérica del runtime frente al código PyTorch oficial en float32: similitud coseno de 1.000000 en codificación y decodificación del códec y en los proyectores de audio, 0.999998 en estados ocultos del LM, 0.999999 en logits de texto (mismo token top en 24 de 24 frames) y 1.000000 en latentes de la cabeza MeanFlow. También se documenta el esquema de cuantización ROCmFPX con escalas por tensor.

## Capacidades

- Diálogo hablado full-duplex: escucha y habla a la vez, procesando frames de 133 ms de audio de entrada y emitiendo frames de audio y texto de salida.
- Speech-to-speech y audio-to-audio: entrada de audio, salida de audio a 24 kHz mono, con transcripción de texto en terminal mientras habla.
- Clonación de voz por referencia: imita la voz de un clip de referencia de 3 segundos a 3 minutos (`--voice`).
- Conversación multi-turno con tarjeta de personaje (character card / system prompt) para fijar personalidad y rol.
- Capacidades multilingües en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Generación de texto asociada al habla (los logits de texto se emiten junto al audio).
- Salida estéreo opcional con el usuario en el canal izquierdo y Haru en el derecho (`answer-stereo.wav`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base se describe como preentrenado para investigación, no como asistente.
- Vision, audio de entrada distinto de voz o thinking mode explícito: no disponible.

## Casos de uso

- Investigación en diálogo hablado full-duplex: el modelo permite experimentar con latencia de frame de 133 ms y solapamiento escucha/habla en un runtime C++ ligero, sin depender de PyTorch, lo que facilita la reproducibilidad en entornos de investigación.
- Prototipado de agentes conversacionales por voz: con una character card se puede definir un rol concreto y generar respuestas de audio con una voz de referencia, útil para validar guiones de interacción antes de invertir en infraestructura en producción.
- Evaluación de cuantización en modelos de audio: la tabla de divergencia KL y similitud coseno de estados ocultos permite comparar Q8_0, Q6_0_ROCMFPX y Q6_K estándar sobre texto wiki y frames de diálogo reales, un caso de uso directo para quien investigue compresión de modelos multimodales.
- Generación de audio conversacional offline por lotes: el modo fichero a fichero permite procesar guiones de preguntas y respuestas en WAV de 24 kHz mono y obtener pares de audio para datasets sintéticos o pruebas de regresión.
- Doblaje y locución asistida con voz de referencia: dado un clip de voz autorizado y un guion, el modelo puede generar respuestas habladas en el mismo timbre, útil para demos y contenido interno (respetando derechos de voz).
- Benchmarking de runtimes alternativos: la verificación parte por parte frente a PyTorch convierte al repositorio en una referencia para validar implementaciones de llama.cpp sobre nuevas arquitecturas de audio.
- Pruebas de conversación multilingüe: con soporte para nueve idiomas, sirve para validar la coherencia de respuesta hablada en español, portugués, japonés o coreano antes de integrar el modelo en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad del runtime y de cuantización:

| Metrica | Q8_0 | Q6_0_ROCMFPX | Q6_K estandar (no subido) |
|---|---|---|---|
| Tamano | 4,48 GB | 3,48 GB | 3,46 GB |
| KLD a BF16 en wiki text (40 x 512 tokens) | 0,0031 | 0,0113 | 0,0153 |
| Similitud coseno de estados ocultos en frames de dialogo reales | 0,9954 | 0,9915 | 0,9913 |

| Componente verificado frente a PyTorch float32 | Similitud coseno |
|---|---|
| Codificacion del codec (clip completo y streaming) | 1,000000 |
| Decodificacion en streaming | 1,000000 |
| Proyectores de audio (embeddings de entrada) | 1,000000 |
| Estados ocultos del modelo de lenguaje | 0,999998 |
| Logits de texto | 0,999999 (mismo token top en 24/24 frames) |
| Latentes de la cabeza MeanFlow | 1,000000 |
| Fichero de audio F16 frente a float32 (cabeza) | 0,9999997 |

El formato 8-bit ROCmFPX obtuvo mejor KLD en wiki text (0,0019) pero peor resultado en los frames de diálogo ejecutados en CPU, por lo que se ha retenido hasta entender la causa.

## Requisitos de hardware

- VRAM estimada: con Q8_0 (4,48 GB) más audio F16 (2,30 GB) se necesitan aproximadamente 7 GB de memoria para los pesos; con Q6_0_ROCMFPX (3,48 GB) más audio F16, unos 6 GB. Hay que añadir memoria para estados de activación y buffers de audio, no cuantificada en la información disponible.
- GPU recomendadas: no se especifican en la información proporcionada. El autor indica que los backends GPU no han sido probados con este runtime; la verificación se hizo en CPU ARM.
- Cabe en GPU de consumo: por tamaño de pesos (6-7 GB), encajaría en tarjetas con 8 GB o más de VRAM, como RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o superiores. No confirmado por el autor.
- Opciones de despliegue: runtime propietario `llama-haru` del fork ROCmFPX de llama.cpp, compilado con CMake (`cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --target llama-haru -j`). No se menciona soporte en vLLM, Ollama, TGI ni llama.cpp estándar.
- Latencia y throughput: en CPU es más lento que tiempo real; el uso en tiempo real requiere compilación con backend GPU, no validada. No se proporcionan cifras de latencia o throughput en GPU.
- Parámetros de muestreo por defecto: temperatura 0,7, top-k 25, guidance 1,5, DRY activado. Opciones `--speak-first`, `--seed`, `--temp`, `--guidance` y `--tail` (segundos de escucha tras el clip).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Haru-4B-ROCmFPX (este) | 1.064 M reportados (4B nominal) | no disponible | Audio-audio full-duplex | Apache 2.0 | GGUF + llama-haru (fork ROCmFPX) |
| higurashi-ai/Haru-4B (base) | 4B nominal | no disponible | Audio-audio full-duplex | Apache 2.0 | PyTorch (safetensors) |
| Qwen3.5-4B (backbone) | 4B | no disponible | Texto | no disponible en esta ficha | safetensors / GGUF |
| Q6_K estandar de Haru-4B | 4B nominal | no disponible | Audio-audio | Apache 2.0 | GGUF (no subido) |

No se dispone de datos de benchmarks comparativos con otros modelos speech-to-speech de la misma categoría en la información proporcionada. La comparación más directa es con el modelo base original en PyTorch, frente al que este repositorio ofrece una alternativa en C++ con fidelidad numérica verificada y menor huella de memoria.

## Limitaciones y advertencias

- El modelo base es un modelo preentrenado liberado para investigación: mantiene una conversación natural, pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente ajustado.
- Riesgo de alucinación elevado en contenido factual, derivado de su naturaleza de modelo base y no de asistente.
- En CPU es más lento que tiempo real; el uso en tiempo real exige compilación con backend GPU, que no ha sido probada por el autor con este runtime.
- El runtime es offline (fichero a fichero); no hay modo de micrófono en vivo en esta versión.
- La clonación de voz permite imitar cualquier voz de referencia: solo deben usarse voces sobre las que se tenga derecho. Riesgo de suplantación y de uso indebido.
- Discrepancia entre el nombre comercial (4B) y los parámetros reportados en safetensors (1.064.254.723), no aclarada en la información disponible; conviene verificar antes de planificar recursos.
- El esquema de cuantización ROCmFPX requiere el fork de llama.cpp del autor; no es compatible con llama.cpp estándar ni con otras herramientas habituales.
- El formato 8-bit ROCmFPX está retenido por un comportamiento anómalo en frames de diálogo en CPU (peor que el 6-bit pese a mejor KLD en texto).
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni evaluations de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones sobre derechos de voz y la falta de ajuste como asistente limitan su uso directo en producción sin supervisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Haru-4B-ROCmFPX
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- Código de Haru: https://github.com/higurashi-ai/Haru
