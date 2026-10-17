# Allinsama/Qwen__Qwen3-TTS-12Hz-0.6B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen, publicado bajo licencia Apache 2.0 y distribuido en HuggingFace. Esta ficha corresponde a la republicación realizada por el usuario Allinsama del checkpoint oficial, cuya model card remite al repositorio de Qwen y al informe técnico arXiv:2601.15621. El modelo forma parte de la familia Qwen3-TTS, orientada a síntesis multilingüe, controlable y con capacidad de streaming.

La variante CustomVoice se apoya en el tokenizador Qwen3-TTS-Tokenizer-12Hz y ofrece nueve timbres predefinidos con control de estilo mediante instrucciones en lenguaje natural (tono, ritmo, expresión emocional) en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano. El autor declara una latencia de síntesis extremo a extremo de hasta 97 ms, lo que la sitúa en el rango apto para aplicaciones conversacionales en tiempo real.

El interés actual del checkpoint está en su tamaño reducido: los pesos en safetensors suman 905.788.672 parámetros (aproximadamente 0,91 mil millones), pese a que el nombre comercial indica 0,6B. Ese volumen permite desplegarlo en GPUs de consumo y habilita casos de uso de TTS en producción con coste de inferencia bajo, algo poco habitual en sistemas TTS multilingües con control de estilo por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de síntesis de voz Qwen3-TTS basado en el tokenizador Qwen3-TTS-Tokenizer-12Hz; el detalle interno de la red (número de capas, atención, decoder) no se describe en la información disponible |
| Parametros totales | 905.788.672 (≈0,91 B) según los safetensors del repositorio; el nombre del checkpoint indica 0,6 B |
| Parametros activos | No aplica: no se describe una arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors (la model card emplea bfloat16 en el ejemplo de carga) |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), coreano (ko), alemán (de), francés (fr), ruso (ru), portugués (pt), español (es) e italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 2,5 GB) |
| Tarea (pipeline) | text-to-speech |
| Timbres predefinidos | 9 (Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna, Sohee) |
| Tokenizador de audio | Qwen3-TTS-Tokenizer-12Hz |
| Latencia declarada | Hasta 97 ms extremo a extremo en modo streaming (dato del autor) |
| Descargas / likes en HuggingFace | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible describe el sistema a nivel de producto, no de arquitectura interna. Se sabe que Qwen3-TTS emplea un tokenizador de audio propio a 12 Hz (Qwen3-TTS-Tokenizer-12Hz), que el modelo genera habla a partir de texto y que admite instrucciones en lenguaje natural para modular tono, ritmo y expresión emocional sobre una voz objetivo. El ejemplo de la model card carga el checkpoint con `Qwen3TTSModel.from_pretrained` en `bfloat16` y con `flash_attention_2`, lo que confirma el uso de atención FlashAttention-2 y precisión bf16 en inferencia, pero no detalla el número de capas, la dimensión oculta ni si el decoder de audio es autoregresivo, de flujo o híbrido.

Tampoco se especifican en la información proporcionada el volumen de datos de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. El checkpoint se presenta como variante "CustomVoice", lo que en la práctica significa que el control de estilo se ejerce mediante texto de instrucción sobre un conjunto cerrado de nueve timbres, y no mediante clonación de voz a partir de una muestra. Para los detalles de entrenamiento y arquitectura, la model card remite al informe técnico arXiv:2601.15621, que no se ha podido consultar en esta ficha.

## Capacidades

- Síntesis de voz multilingüe en diez idiomas, con recomendación explícita de usar cada timbre en su idioma nativo para obtener la mejor calidad.
- Control de estilo por instrucción en lenguaje natural: es posible pedir tono, ritmo y expresión emocional ("habla con un tono muy enfadado" en el ejemplo oficial).
- Nueve timbres predefinidos con perfiles diferenciados: voces femeninas y masculinas, acentos chinos (Pekín, Sichuan), inglés americano, japonés y coreano.
- Generación en streaming con latencia declarada de hasta 97 ms extremo a extremo, adecuada para interacción conversacional.
- Salida de audio en formato waveform con frecuencia de muestreo devuelta por el modelo y guardable directamente con `soundfile`.
- Integración en Python mediante el paquete `qwen-tts` y PyTorch, con soporte de `device_map` para selección de GPU.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable, es un modelo de síntesis de voz.
- Capacidad de vision o audio de entrada: no documentada; el modelo es texto a voz.

## Casos de uso

- Locución automatizada de audiolibros y artículos largos: el modelo convierte texto en habla con timbres estables y permite ajustar el tono mediante instrucciones, de modo que un mismo texto puede narrarse con registro neutro, dramático o infantil sin reentrenar nada.
- Doblaje y localización de vídeo: al cubrir diez idiomas con voces nativas para chino, inglés, japonés y coreano, permite generar pistas de voz para contenido formativo o corporativo y sustituir el doblaje manual en iteraciones tempranas.
- Asistentes de voz y agentes conversacionales: la latencia declarada de 97 ms en streaming hace viable encadenar ASR, LLM y TTS en un bucle de conversación por turnos sin que la síntesis domine la latencia total percibida.
- Sistemas de IVR y atención telefónica: con 0,91 B de parámetros se puede desplegar en una GPU modesta por instancia y generar respuestas dinámicas en lugar de prompts pregrabados, manteniendo un timbre de marca consistente.
- Accesibilidad y lectura de pantalla: integración en aplicaciones de lectura para personas con discapacidad visual, con control de velocidad y énfasis a través de las instrucciones de estilo y soporte de español e italiano para usuarios europeos.
- Producción de contenido para pódcast y redes: generación de voces en off para vídeos cortos o cápsulas informativas, con capacidad de cambiar el registro emocional entre secciones de un mismo guion.
- Prototipado de videojuegos y experiencias interactivas: al ser un modelo pequeño y con licencia Apache 2.0, se puede embeber en el pipeline de desarrollo para generar diálogos provisionales de NPCs sin coste de licencia por asiento.
- E-learning y formación corporativa: narración de cursos en varios idiomas manteniendo el mismo timbre por curso, con generación bajo demanda que evita almacenar horas de audio pregrabado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos del repositorio no incluyen métricas objetivas como WER, MOS, SIM-O ni comparativas con otros sistemas TTS; el único dato de rendimiento declarado es la latencia de 97 ms extremo a extremo en streaming.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 1,8 GB para 905,8 M de parámetros (2 bytes por parámetro); el repositorio completo ocupa 2,5 GB, incluyendo tokenizador y artefactos auxiliares.
- VRAM estimada para inferencia: del orden de 3 a 5 GB en bf16, considerando pesos, activaciones y buffers de audio (estimación propia a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para trabajar con margen; una RTX 4090 o A100/H100 ofrece margen sobrado y permite varias instancias concurrentes por dispositivo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 6-8 GB el margen es ajustado y depende del tamaño de lote y de la longitud del texto.
- Despliegue documentado: paquete `qwen-tts` sobre PyTorch, con `device_map="cuda:0"`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"`.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas en la información disponible para este checkpoint.
- Latencia: 97 ms extremo a extremo declarados por el autor en modo streaming; no se especifican las condiciones de medición (GPU, longitud de texto, lote).
- Throughput (caracteres o segundos de audio por segundo): no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables no provienen de la información proporcionada para este checkpoint, sino de conocimiento general del ecosistema TTS; se marcan como referencia y deben verificarse antes de tomar decisiones de producción.

| Modelo | Parametros | Idiomas | Licencia | Contexto / control | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice (este) | 905,8 M (safetensors) | 10 | Apache 2.0 | Control de estilo por instrucción; 9 timbres; streaming 97 ms | HuggingFace (republicación) y repositorio oficial de Qwen |
| Qwen3-TTS (otras variantes) | No disponible | No disponible | Apache 2.0 según la familia | No disponible | Repositorio oficial QwenLM |
| XTTS-v2 (Coqui) | ≈0,47 B (referencia) | 17 | CPML (uso no comercial) | Clonación de voz zero-shot; sin control por instrucciones | HuggingFace; proyecto Coqui discontinuado |
| Kokoro-82M | 82 M (referencia) | Varios (principalmente inglés y algunos más) | Apache 2.0 | Timbres predefinidos; sin control por instrucciones | HuggingFace |
| CosyVoice 2 | ≈0,5 B (referencia) | Chino e inglés principalmente | Apache 2.0 | Clonación y control de estilo | HuggingFace y GitHub |

La ventaja diferencial de esta variante frente a Kokoro-82M es la cobertura de diez idiomas y el control por instrucciones en lenguaje natural; frente a XTTS-v2, la licencia Apache 2.0 permite uso comercial sin las restricciones de la CPML, aunque esta variante no documenta clonación de voz.

## Limitaciones y advertencias

- No se han publicado métricas objetivas de calidad (MOS, WER, SIM-O) en la información disponible; la valoración de naturalidad y prosodia requiere una evaluación propia.
- El control de estilo depende de instrucciones en lenguaje natural: la variabilidad e impredecibilidad de la respuesta ante una misma instrucción no está cuantificada.
- El conjunto de voces está cerrado a nueve timbres; esta variante no documenta clonación de voz a partir de muestras, a diferencia de otros sistemas TTS.
- La propia model card recomienda usar cada timbre en su idioma nativo, lo que sugiere degradación de calidad cuando se cruza un timbre con un idioma distinto (por ejemplo, una voz china leyendo español).
- Los diez idiomas declarados no implican la misma calidad en todos ellos; no hay desglose por idioma en la información disponible.
- Riesgo de errores de pronunciación en nombres propios, siglas, números, unidades y términos técnicos, habitual en sistemas TTS; no hay documentación sobre normalización de texto ni diccionarios personalizados.
- Riesgo de artefactos acústicos y de inestabilidad en textos muy largos si se generan en una sola pasada; no se especifica el límite de longitud de entrada.
- Discrepancia entre el nombre comercial (0,6B) y el recuento real de safetensors (905,8 M): conviene dimensionar el hardware sobre el dato real.
- El repositorio consultado es una republicación de un tercero (usuario Allinsama) con 0 descargas y 0 likes y con la model card copiada del original; para producción conviene usar el checkpoint oficial de Qwen y verificar la integridad de los pesos.
- Aunque la licencia declarada es Apache 2.0, conviene confirmar en el repositorio original las condiciones aplicables a los datos de entrenamiento y a las voces, especialmente si el uso es comercial.
- No se documenta el comportamiento del modelo con contenido sensible, ni mecanismos de moderación o marcas de agua en el audio generado, lo que exige controles adicionales si se despliega de cara al público.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/Allinsama/Qwen__Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio oficial referenciado en el código de ejemplo: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Informe técnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio GitHub: https://github.com/QwenLM/Qwen3-TTS
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
