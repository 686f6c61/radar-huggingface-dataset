# Muiru/Audio8-TTS-Realistic-0.6b

## Resumen

Audio8-TTS-Realistic-0.6B es un modelo de síntesis de voz (text-to-speech) desarrollado por Muiru, publicado como fine-tune del modelo base Edge0/Audio8-TTS-Preview-0.6b de Edge0 AI. Resuelve el problema de la generación de habla natural con clonación de voz zero-shot, es decir, reproducir la voz de un hablante a partir de una grabación de referencia y su transcripción, sin necesidad de entrenamiento adicional. Su relevancia radica en que ofrece un compromiso poco habitual entre tamaño reducido (601 millones de parámetros en el modelo principal) y cobertura multilingüe amplia (23 idiomas).

La arquitectura es un transformer autorregresivo dual (DualAR), inspirado en Fish Audio S2 Pro, que combina un transformer AR lento encargado de predecir tokens semánticos por frame de audio y un transformer AR rápido que predice los codebooks del códec acústico. El modelo se distribuye con un códec neuronal de audio a 44,1 kHz incluido en el repositorio, por lo que no requiere checkpoints adicionales para codificar la referencia o decodificar la onda.

Frente a la versión Preview, esta entrega añade 12 idiomas (hasta 23 en total) y mejora el realismo de la prosodia y la expresividad. La licencia Apache 2.0 y el tamaño contenido lo sitúan como una opción viable para despliegue en producción con GPU de gama media, aunque la calidad por idioma es variable según la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (transformer autorregresivo lento + transformer autorregresivo rápido), inspirada en Fish Audio S2 Pro |
| Parametros totales | 601.159.424 (modelo principal, excluye el códec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 2.048 posiciones empaquetadas de texto/audio |
| Tipos de cuantizacion | no disponible (la model card solo menciona BF16 y FP32 en los ejemplos de uso) |
| Idiomas soportados | 23: chino, inglés, japonés, coreano, alemán, francés, español, italiano, ruso, árabe, finlandés, hindi, indonesio, malayo, neerlandés, noruego, polaco, portugués, sueco, tailandés, turco, vietnamita y cantonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, con código custom) |

Detalles adicionales de configuración: el transformer lento tiene 24 capas, anchura 896, 14 cabezas de atención y 2 cabezas KV; el transformer rápido tiene 4 capas con la misma anchura y configuración de cabezas. El códec acústico emplea 10 codebooks de 4.096 entradas cada uno, a 44,1 kHz, con 2.048 muestras por frame del modelo (aproximadamente 21,5 frames por segundo).

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DualAR en la que dos transformers autorregresivos colaboran de forma jerárquica. El transformer lento procesa la secuencia empaquetada de texto y audio y predice un token semántico por cada frame de audio. El transformer rápido, condicionado por el estado oculto del lento y por los codebooks ya generados del mismo frame, predice los 10 codebooks acústicos que componen ese frame. Esta separación permite modelar la estructura temporal del habla con el componente lento y el detalle acústico fino con el rápido, manteniendo el recuento total de parámetros en 601 millones.

El códec neuronal integrado opera a 44,1 kHz y se encarga tanto de codificar el audio de referencia (para la clonación zero-shot) como de decodificar la onda final, de modo que el repositorio es autocontenido. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; esa información no está disponible. Tampoco se especifica la innovación de decodificación más allá del muestreo configurable (temperature, top_p, top_k).

## Capacidades

- Generación de voz a partir de texto sin grabación de referencia.
- Clonación de voz zero-shot a partir de una grabación de referencia y su transcripción exacta.
- Síntesis multilingüe en 23 idiomas, con calidad variable según el idioma.
- Generación de prosodia expresiva y natural, mejorada respecto a la versión Preview.
- Salida de audio a 44,1 kHz mediante el códec incluido.
- Inferencia con la interfaz estándar de Transformers (AutoModel y AutoProcessor) usando `trust_remote_code=True`.
- Servicio de alto rendimiento mediante un adaptador SGLang Omni con paged attention, batching dinámico y API de voz compatible con OpenAI.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia para clonación.

## Casos de uso

- Audiolibros y narración automatizada: el modelo convierte texto largo en habla con prosodia natural y permite fijar una voz concreta mediante clonación zero-shot, manteniendo consistencia de timbre a lo largo de capítulos.
- Doblaje y localización de contenidos: con 23 idiomas soportados y clonación de voz, se puede generar una pista de voz en otro idioma conservando las características del hablante original, útil para vídeos y cursos.
- Asistentes de voz para atención al cliente: la API compatible con OpenAI y el servido con SGLang Omni permiten integrar el modelo en pipelines de respuesta de voz con batching dinámico y baja latencia agregada.
- Accesibilidad y lectores de pantalla: generación de voz de alta calidad (44,1 kHz) para personas con discapacidad visual o dificultades de lectura, con posibilidad de personalizar la voz del usuario.
- Generación de voces para videojuegos y contenido interactivo: clonación zero-shot de actores de doblaje para producir líneas de diálogo nuevas sin sesiones de grabación adicionales.
- Prototipado rápido de productos de voz: el tamaño de 0,6B y la licencia Apache 2.0 permiten desplegar en GPU de gama media para validar experiencias de voz antes de escalar a modelos mayores.
- Investigación en síntesis de voz multilingüe: el modelo sirve como base para estudiar transferencia entre idiomas y calidad de clonación en lenguas de bajos recursos como finlandés, malayo o tailandés.

## Benchmarks y rendimiento

La información proporcionada menciona que existe una evaluación por idioma en la model card, pero no incluye los valores numéricos de los benchmarks. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 601 millones de parámetros en BF16 el peso del modelo principal ronda los 1,2 GB, a lo que hay que sumar el códec incluido y las activaciones durante la generación.
- GPU recomendadas: la model card cita pruebas de humo en una NVIDIA H20 con BF16; no se enumeran otras GPU recomendadas.
- GPU de consumo: por el tamaño del modelo es plausible que quepa en GPU de consumo con suficiente VRAM, pero la información proporcionada no confirma modelos concretos ni requisitos mínimos.
- Despliegue: Transformers (torch >= 2.5.0, torchaudio >= 2.5.0, transformers >= 4.57.0 y < 5, soundfile, safetensors) y SGLang Omni con paged attention, batching dinámico y API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Realistic-0.6B | 601 M (sin códec) | 2.048 posiciones | 23 | Apache 2.0 | Clonación zero-shot, códec 44,1 kHz incluido |
| Audio8-TTS-Preview-0.6b (modelo base) | 0,6 B | no disponible | 11 | no disponible en la información | Menor realismo y cobertura de idiomas |
| Fish Audio S2 Pro | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia citada por el autor |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La calidad varía según el idioma; la propia model card advierte que la cobertura de benchmarks incluye idiomas adicionales y es distinta de la lista de idiomas soportados.
- La clonación zero-shot exige una grabación de referencia limpia y una transcripción que coincida exactamente con el contenido hablado; discrepancias degradan el resultado.
- Riesgo de uso indebido de la clonación de voz para suplantación de identidad; la licencia Apache 2.0 no impone restricciones de uso, por lo que la responsabilidad ética y legal recae en el desplegador.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- El modelo está orientado a síntesis de voz; no se documentan capacidades de razonamiento, tool calling ni agentes.
- El repositorio incluye código custom de Transformers, por lo que es necesario revisar los archivos antes de cargar el modelo con `trust_remote_code=True`.
- El recuento de 0,6B excluye el códec; los requisitos reales de memoria deben considerar el códec y las activaciones de generación.
- El modelo es un fine-tune de un modelo base de terceros (Edge0), lo que conviene verificar para trazabilidad de licencias y procedencia de datos.

## Enlaces

- HuggingFace: https://huggingface.co/Muiru/Audio8-TTS-Realistic-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Repositorio GitHub: https://github.com/Edge0-AI/Audio8_TTS
- Demo: https://edge0-ai.github.io/Audio8_TTS/realistic-0.6b/
- Paper: https://arxiv.org/abs/2610.14776
- Playground (Space): https://huggingface.co/spaces/Edge0/Audio8-TTS-Realistic-0.6b
- TTS Arena: https://tts-agi-tts-arena-v2.hf.space/
- Fish Audio S2 Pro (arquitectura de referencia): https://github.com/fishaudio/fish-speech
