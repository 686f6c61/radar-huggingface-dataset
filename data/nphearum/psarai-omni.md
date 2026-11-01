# nphearum/PsarAI-Omni

## Resumen

PsarAI-Omni v0.1 es un modelo ómnibus de voz a voz (speech-to-speech) construido sobre `google/gemma-4-E2B-it` mediante un adaptador LoRA sobre el codificador de audio y la atención del modelo de lenguaje, más un decodificador de voz independiente. Lo desarrolla nphearum y resuelve el problema de la conversación hablada extremo a extremo en jemer, inglés y francés sin encadenar módulos separados de ASR, traducción y TTS: el propio Gemma escucha la pregunta a través de su codificador de audio, redacta una respuesta breve y un decodificador convierte sus estados ocultos en unidades de voz para un vocoder HiFi-GAN.

La arquitectura combina un transformer multimodal (Gemma 4 E2B) con un adaptador LoRA (r32 en el codificador de audio, r8 en la atención del LM), un decodificador de voz de 66M parámetros que predice unidades mHuBERT por CTC junto con duraciones y tono, y un vocoder unit-HiFi-GAN condicionado por hablante. El repositorio ocupa 0,4 GB y el modelo base es de tipo E2B, es decir, una variante de parámetros efectivos reducidos de la familia Gemma 4.

Su relevancia es doble: por un lado, demuestra una cadena completa de voz a voz con clonación de voz a partir de unos segundos de audio de referencia y latencia de primera respuesta de 0,63 s en una RTX 3090; por otro, ataca un idioma con recursos limitados como el jemer, con una mejora sustancial en transcripción (CER del 12,8 % frente al 30,7 % del Gemma base) y en traducción voz a inglés (chrF 34,9 frente a 24,9). Es una publicación de investigación (v0.1) con descargas y likes nulos en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con adaptador LoRA + decodificador de voz CTC + vocoder unit-HiFi-GAN |
| Parametros totales | no disponible (repo de 0,4 GB; decodificador de voz de 66M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada de audio limitada a 30 s) |
| Tipos de cuantizacion | no disponible (existe version GGUF para llama.cpp) |
| Idiomas soportados | jemer (km), ingles (en), frances (fr) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador LoRA, decodificador, vocoder, embeddings de voz); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo se organiza en tres piezas. Primero, un adaptador LoRA sobre el codificador de audio de Gemma 4 (r32) y sobre la atención del LM (r8), con las proyecciones de audio entrenadas en su totalidad; esto convierte a Gemma en un transcriptor y asistente de voz para jemer, inglés y francés. Segundo, un decodificador de voz de 66M parámetros que toma los estados ocultos finales de Gemma más los embeddings de tokens y predice unidades mHuBERT mediante CTC, además de duraciones y tono. Tercero, un vocoder unit-HiFi-GAN condicionado por hablante que sintetiza audio a 24 kHz, con la voz Jarvis incluida y clonación mediante un codificador de hablante CAM++.

El entrenamiento del adaptador de audio tuvo dos fases: una primera de 6000 pasos centrada en transcripción de jemer (corpus DDD, FLEURS, Jarvis y voces diseñadas), inglés y francés; y una segunda de 3000 pasos con un 45 % de transcripción y un 55 % de instrucciones (responder, describir, resumir, traducir) cuyos objetivos fueron generados por Gemma en modo solo texto a partir de la transcripción, es decir, autodestilación. El decodificador de voz se inicializó desde el decodificador de unidades T2U de PsarAI-Speech y se entrenó con 34 000 clips Jarvis (con Gemma forzado como profesor sobre su texto) más 31 000 frases de respuesta generadas por el propio Gemma, usando unidades del T2U de PsarAI-Speech.

## Capacidades

- Conversación de voz a voz extremo a extremo: entrada de audio, razonamiento textual intermedio y salida de audio, sin ASR ni TTS externos.
- Transcripción de voz en jemer, inglés y francés.
- Traducción de voz a texto entre los idiomas soportados (por ejemplo, jemer hablado a inglés escrito).
- Generación de respuestas habladas breves guiadas por un system prompt de asistente de voz.
- Clonación de voz a partir de unos segundos de audio de referencia, y voz Jarvis preentrenada.
- Síntesis de texto a voz directa mediante `omni.say()` con una voz dada.
- Streaming por frases: la primera frase se reproduce mientras Gemma sigue escribiendo.
- Instrucciones de alto nivel sobre el audio: describir, resumir, responder o traducir lo que dice el hablante.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistente de voz para jemer en atención al cliente: el modelo recibe la consulta hablada, la transcribe internamente con un CER del 12,8 % en FLEURS y responde en voz, lo que permite desplegar un bot telefónico sin pipeline ASR-TTS separado.
- Traducción simultánea de voz a texto para jemer-inglés: útil en contextos de interpretación o subtitulado, con chrF de 34,9 en traducción voz a inglés, muy por encima del Gemma base.
- Prótesis de accesibilidad para personas con discapacidad visual o motriz: conversación hablada con respuestas sintetizadas y clonación de una voz familiar a partir de una muestra de referencia.
- Generación de audiolibros o locuciones multilingües: `omni.say()` sintetiza texto en jemer, inglés o francés con la voz Jarvis o una voz clonada, a 24 kHz.
- Prototipado de interfaces de voz para investigación en lenguas de bajos recursos: el adaptador LoRA y el decodificador son piezas separadas y reutilizables para experimentar con otros idiomas o voces.
- Demostraciones interactivas de baja latencia: con 0,63 s de mediana hasta el primer audio en una RTX 3090, encaja en demos en vivo y entornos de prototipado con una sola GPU.
- Transcripción y resumen de reuniones cortas en inglés o francés: con entradas de hasta 30 s por turno, se puede segmentar el audio y encadenar turnos para obtener actas habladas o escritas.

## Benchmarks y rendimiento

| Metrica | PsarAI-Omni v0.1 | Gemma base |
|---|---:|---:|
| Transcripcion de voz en jemer (FLEURS, CER) | 12,8 % | 30,7 % |
| Traduccion voz jemer a ingles (FLEURS, chrF) | 34,9 | 24,9 |
| Transcripcion en ingles (FLEURS, CER) | 4,0 % | no disponible |
| Transcripcion en frances (FLEURS, CER) | 5,0 % | no disponible |
| Respuesta hablada vs texto de Gemma, jemer (CER, n=4) | 7,3 % | no disponible |
| Respuesta hablada vs texto de Gemma, ingles (CER, n=10) | 11,7 % | no disponible |
| Respuesta hablada vs texto de Gemma, frances (CER, n=2) | 7,7 % | no disponible |
| Primera respuesta de audio tras la pregunta (mediana, RTX 3090) | 0,63 s | no disponible |
| Decodificador de voz aislado, estilo Jarvis (CER) | 4,2 % | no disponible |
| Decodificador de voz aislado, respuestas estilo Gemma (CER) | 12,0 % | no disponible |

Como referencia, PsarAI-Speech T2U sobre el mismo texto obtiene 4,0 % y 10,1 % de CER en las dos ultimas filas.

## Requisitos de hardware

- VRAM estimada: unos 10 GB en pico con la tabla de embeddings por capa en RAM de CPU (configuracion por defecto).
- GPU recomendadas: RTX 3090 (latencia medida de 0,63 s hasta el primer audio); tarjetas con 10-16 GB o mas de VRAM para margen.
- Cabe en GPU de consumo: si, en RTX 3090 y previsiblemente en RTX 4080/4090 y GPUs con al menos 10-12 GB, manteniendo los embeddings en CPU.
- Opciones de despliegue: script `psarai_omni.py` con PyTorch y Transformers con soporte de Gemma 4; version GGUF para llama.cpp en `nphearum/PsarAI-Omni-GGUF` (un solo servidor con clonacion de voz).
- Dependencias: `torch`, `transformers`, `peft`, `torchvision`, `safetensors`, `numpy`, `soundfile`, `soxr` y `torchaudio` para clonacion.
- Throughput: no disponible; solo se publica la latencia de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PsarAI-Omni v0.1 | no disponible (base Gemma 4 E2B) | no disponible (audio 30 s) | km, en, fr | Gemma Terms of Use | Voz a voz con clonacion |
| PsarAI-Speech T2U | no disponible | no disponible | km, en, fr | no disponible | Texto a unidades de voz |
| google/gemma-4-E2B-it | no disponible | no disponible | multilingue | Gemma Terms of Use | Modelo base multimodal |
| Modelos speech-to-speech comerciales | no disponible | no disponible | multilingue | propietaria | Voz a voz |

La comparativa cuantitativa solo es posible frente a Gemma base y PsarAI-Speech T2U, unicos datos publicados. No se dispone de resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de comparaciones con otros sistemas speech-to-speech de codigo abierto.

## Limitaciones y advertencias

- Publicacion de investigacion (v0.1): no esta pensada para produccion sin validacion adicional.
- Las respuestas de Gemma en jemer son debiles: a menudo reformulan lo dicho en lugar de responder a la pregunta.
- La entrada de audio esta limitada a 30 s por el propio Gemma 4.
- Las respuestas son cortas por diseno, impuestas por el system prompt.
- Los benchmarks de calidad de respuesta hablada se basan en muestras muy pequenas (n=4 en jemer, n=2 en frances), por lo que su fiabilidad estadistica es baja.
- Riesgo de alucinacion y de errores de transcripcion en audio con ruido, acentos no vistos o mezcla de idiomas.
- La licencia Gemma Terms of Use se aplica tanto al adaptador como a las salidas del modelo combinado; hay que revisar sus restricciones de uso comercial.
- No se documentan sesgos especificos, pero al derivar de Gemma 4 hereda los sesgos del modelo base y de los corpus de entrenamiento (DDD, FLEURS, Jarvis).
- El repositorio no tiene descargas ni likes, lo que reduce la validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nphearum/PsarAI-Omni
- Version GGUF: https://huggingface.co/nphearum/PsarAI-Omni-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
