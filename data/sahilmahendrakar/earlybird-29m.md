# sahilmahendrakar/Earlybird-29M

## Resumen

Earlybird es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por sahilmahendrakar, un fine-tune de Moonshine Streaming Tiny de Moonshine AI. Su particularidad es que predice cada palabra antes de que el hablante termine de pronunciarla, junto con una puntuación de confianza por palabra. En palabras de su autor, sobre audiolibros predice correctamente una palabra típica 90 ms antes de que termine, frente a los 90-400 ms después que tardan los modelos de streaming publicados.

El modelo parte de la arquitectura Moonshine Tiny y reduce su vocabulario a los 19.007 tokens que cubren el habla en inglés, lo que lo deja en 29M parámetros con una pérdida de precisión mínima. Se distribuye cuantizado a 4 bits en un formato personalizado que ocupa 16,8 MB, lo que lo hace apto para inferencia en dispositivo. Funciona a aproximadamente el doble de velocidad que el tiempo real en un solo hilo de CPU.

Es relevante para pipelines de voz de baja latencia, como agentes conversacionales, donde disponer de las primeras palabras del usuario antes de que termine la frase permite empezar a buscar, recuperar datos o planificar una respuesta en paralelo. Su licencia MIT y su tamaño reducido facilitan la integración en producción, con la contrapartida de que solo soporta inglés y de que su tasa de error queda por detrás de modelos más grandes como Whisper base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moonshine Streaming Tiny (transformer encoder-decoder para ASR en streaming), fine-tune |
| Parámetros totales | 29M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (formato personalizado) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | cuantización 4-bit personalizada, cargada mediante `earlybird.py` (no safetensors estándar) |

## Arquitectura y entrenamiento

Earlybird es un fine-tune de Moonshine Streaming Tiny, un modelo encoder-decoder orientado a ASR en streaming. El autor recortó el vocabulario original a los 19.007 tokens que cubren el habla en inglés, lo que reduce el modelo a 29M parámetros con casi ninguna pérdida de precisión, y lo cuantizó a 4 bits hasta los 16,8 MB. El modelo procesa audio mono a 16 kHz en pasos de 80 ms y emite una actualización por cada paso.

El entrenamiento se realizó sobre aproximadamente 1.000 horas de habla pública en inglés (LibriSpeech, People's Speech) más unas 25 horas de habla sintética. La innovación técnica clave es el procedimiento de fine-tune: el modelo aprende de audio cortado en puntos aleatorios, incluso a mitad de palabra, y se le pide que escriba todas las palabras escuchadas hasta el momento (incluida la palabra a medio pronunciar, completa) más una conjetura de las dos palabras siguientes. Las probabilidades brutas de sus tokens proporcionan la confianza por palabra, sin calibración adicional. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Reconocimiento automático del habla en inglés en streaming, con actualizaciones cada 80 ms de audio.
- Predicción anticipada de palabras: emite cada palabra antes de que el hablante termine de pronunciarla, incluida la palabra que se está pronunciando en ese momento.
- Puntuación de confianza por palabra a partir de las probabilidades brutas del modelo, sin calibración extra.
- Conjetura de las dos palabras siguientes a la transcripción actual.
- Transcripción completa de ficheros de audio mediante `transcribe()`.
- Procesamiento en vivo mediante `stream().feed(chunk)` con chunks de audio de cualquier tamaño.
- Inferencia en dispositivo: aproximadamente el doble de velocidad que el tiempo real en un solo hilo de CPU.
- No soporta tool calling, function calling, agentes, visión ni audio más allá del ASR; no se documentan capacidades multilingües (solo inglés).

## Casos de uso

- Agentes de voz conversacionales: al disponer de las palabras del usuario antes de que termine la frase, el agente puede iniciar búsquedas, recuperar registros o planificar la respuesta en paralelo a la locución, reduciendo la latencia percibida de extremo a extremo.
- Subtitulado en vivo de baja latencia: la predicción anticipada y las actualizaciones cada 80 ms permiten mostrar subtítulos que se adelantan ligeramente al habla, útiles en retransmisiones o eventos con un solo hilo de CPU.
- Transcripción en dispositivo sin conexión: sus 16,8 MB y su velocidad de 2x tiempo real en CPU permiten integrarlo en dispositivos embebidos o móviles sin GPU ni conectividad.
- Análisis de llamadas de resultados empresariales: el modelo está evaluado sobre earnings calls (18,4% WER) y puede transcribir reuniones en streaming para alimentar resúmenes o extracción de acciones en tiempo real.
- Dictado y asistentes de escritura: la confianza por palabra permite resaltar o corregir términos dudosos mientras el usuario habla, y la conjetura de las dos palabras siguientes puede acelerar la autocorrección.
- Enrutado temprano en centros de contacto: con las primeras palabras transcritas antes de que el cliente termine la frase, el sistema puede clasificar la intención y derivar la llamada al departamento adecuado con antelación.
- Investigación en ASR de baja latencia: sirve como referencia reproducible (código y pesos MIT) para estudiar el compromiso entre latencia negativa, reescrituras y precisión.

## Benchmarks y rendimiento

Resultados publicados por el autor. Cada celda: latencia mediana por palabra · tasa de error de palabra (WER). Latencia negativa significa que la palabra se emite antes de que el hablante la termine.

| Test set | Earlybird | Moonshine Tiny | Whistle | Whisper base |
|---|---|---|---|---|
| Audiolibros | −90 ms · 2,3% | +270 ms · 3,9% | +400 ms · 3,1% | +90 ms · 2,3% |
| Audiolibros difíciles | −60 ms · 9,7% | +300 ms · 13,2% | +460 ms · 10,1% | +140 ms · 8,7% |
| Charlas TED | −68 ms · 5,4% | +298 ms · 6,8% | +505 ms · 7,3% | +125 ms · 4,8% |
| Discurso público | −66 ms · 14,5% | +290 ms · 16,7% | +477 ms · 14,2% | +127 ms · 10,5% |
| Llamadas de resultados | −46 ms · 18,4% | +309 ms · 21,6% | +535 ms · 17,8% | +142 ms · 13,3% |
| Habla sintética | −73 ms · 5,6% | +292 ms · 7,0% | +424 ms · 7,5% | +90 ms · 4,8% |

Precisión media en los 8 conjuntos en inglés del Hugging Face Open ASR Leaderboard:

| Modelo | Tamaño | WER medio (8 conjuntos Open ASR) |
|---|---|---|
| Whisper base | ~145 MB | 9,7% |
| Whistle | 16,9 MB | 12,2% |
| Earlybird | 16,8 MB | 12,6% |
| Moonshine Tiny | 45 MB | 14,4% |

Según el autor, Earlybird comete menos errores que Moonshine Tiny en los 8 conjuntos y empata aproximadamente con Whistle; Whisper base es más preciso con unas 9 veces su tamaño. Es el único modelo por debajo de 1 GB que predice correctamente la palabra mediana antes de que termine. Con confianza de al menos el 90% en una palabra aún no terminada, acierta entre el 91% y el 96% de las veces.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 16,8 MB en cuantización 4-bit; puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con soporte de PyTorch puede alojarlo, pero no es necesario para el rendimiento documentado.
- Cabe en cualquier GPU de consumo (y en CPU): el autor reporta aproximadamente 2x tiempo real en un solo hilo de CPU.
- Opciones de despliegue: carga mediante `earlybird.py` incluido en el repositorio (requiere `torch`, `transformers>=5`, `soundfile`, `huggingface_hub`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: una actualización por cada 80 ms de audio; velocidad de inferencia de aproximadamente el doble del tiempo real en un hilo de CPU.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | WER medio (8 sets Open ASR) | Latencia mediana por palabra (audiolibros) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Earlybird | 29M / 16,8 MB (4-bit) | no disponible | 12,6% | −90 ms | MIT | Hugging Face, código en GitHub |
| Moonshine Tiny | no disponible / 45 MB | no disponible | 14,4% | +270 ms | MIT | Hugging Face / GitHub de Moonshine AI |
| Whistle | no disponible / 16,9 MB | no disponible | 12,2% | +400 ms | no disponible | publicado (referenciado en la model card) |
| Whisper base | no disponible / ~145 MB | no disponible | 9,7% | +90 ms | no disponible | OpenAI Whisper |

## Limitaciones y advertencias

- Precisión: Whisper base, 2,5 veces más grande, comete menos errores en todos los conjuntos salvo en audiolibros, donde empatan. La brecha es mayor con ruido de fondo: a 10 dB, Earlybird falla el 32% de las palabras frente al 8,9% de Whisper base.
- Reescrituras: mostrar palabras antes implica cambiarlas más a menudo; 1,3 cambios por palabra en audiolibros y 2-6 en habla espontánea o ruidosa.
- Las conjeturas de la palabra siguiente aportan menos de lo esperado: con confianza del 50% o más, aproximadamente 1 de cada 7 palabras se acierta antes de terminar; la mayoría de las palabras tempranas provienen de la propia transcripción.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación: no se documenta explícitamente, pero como todo modelo ASR puede producir palabras incorrectas, especialmente en audio ruidoso; la confianza por palabra ayuda a filtrarlas.
- Licencia MIT: permite uso comercial con atribución; el modelo base Moonshine Tiny es también MIT (Copyright 2025 Useful Sensors, Inc. dba Moonshine AI).
- Formato de pesos personalizado: no se carga con `from_pretrained` estándar de transformers, sino mediante `earlybird.py`; esto complica la integración con stacks de despliegue convencionales.
- Repositorio pequeño (0,0 GB reportados) y muy pocas descargas (6) en el momento de la consulta: ecosistema y validación externa limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahilmahendrakar/Earlybird-29M
- Write-up del autor: https://sahilmahendrakar.com/writings/earlybird
- Código en GitHub: https://github.com/sahilmahendrakar/earlybird
- Paper: en arXiv próximamente (enlace pendiente de anuncio según la model card)
- Moonshine (modelo base): https://github.com/moonshine-ai/moonshine
