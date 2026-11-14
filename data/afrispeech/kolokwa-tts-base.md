# AfriSpeech/kolokwa-tts-base

## Resumen

Kolokwa (Liberian English) Pocket TTS Base Model es un modelo de síntesis de voz (text-to-speech) desarrollado por AfriSpeech, orientado específicamente al inglés liberiano y al pidgin liberiano (código ISO `lir`). Se trata de un modelo acústico basado en un transformer de 24 capas con condicionamiento multi-hablante, entrenado sobre más de 43 horas de audio de alta fidelidad procedente de los corpus Bible NWT, OmniLingual y AfriSpeech. Genera audio a 24 kHz.

El modelo se publica como "Full Base Teacher Model", es decir, la versión completa y sin destilar de una familia que incluye un modelo derivado de 6 capas (`AfriSpeech/kolokwa-tts`) pensado para inferencia en tiempo real. Esta versión base es, por tanto, la referencia de calidad y el punto de partida para destilación o ajuste fino, no la opción óptima para despliegue de baja latencia.

Su relevancia radica en cubrir una variedad lingüística escasamente representada en los sistemas TTS comerciales: el inglés liberiano, una variedad del inglés de África Occidental con influencias del pidgin. Con 336 millones de parámetros y licencia MIT, es un modelo pequeño, desplegable en hardware modesto y utilizable comercialmente sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer acústico de 24 capas con condicionamiento multi-hablante |
| Parámetros totales | 336.068.290 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés liberiano (`lir`), inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (también `.pt` para checkpoint de entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un backbone acústico transformer de 24 capas con condicionamiento multi-hablante, lo que permite seleccionar o condicionar la voz de salida mediante prompts de referencia de hablante. La salida de audio es a 24 kHz, lo que sitúa la fidelidad por encima de los sistemas TTS a 16 kHz habituales en modelos pequeños. El repositorio incluye `args.yaml` con los hiperparámetros completos de entrenamiento y `config.yaml` con la configuración del runtime de inferencia, además de un tokenizador propio (`tokenizer.json`).

El entrenamiento se realizó sobre más de 43 horas de habla en inglés liberiano de alta fidelidad, combinando los corpus Bible NWT, OmniLingual y AfriSpeech. No se especifica en la información disponible el número total de tokens de texto procesados, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal u otras). El repositorio incluye muestras de audio generadas en distintos pasos de entrenamiento (`samples/`) y audios de referencia de hablantes (`voices/`), lo que facilita la verificación cualitativa del resultado.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés liberiano y en inglés.
- Condicionamiento multi-hablante: permite fijar una voz de referencia a partir de los audios incluidos en `voices/`.
- Generación de audio a 24 kHz de frecuencia de muestreo.
- Publicación de dos checkpoints de pesos (`best_model.safetensors` y `model.safetensors`) más un checkpoint de entrenamiento con estado del optimizador.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No se documenta soporte de visión, audio de entrada (salvo prompts de voz) ni modo de razonamiento explícito.
- No se documenta clonación de voz zero-shot más allá del condicionamiento por hablante de referencia.

## Casos de uso

- Localización de contenidos para audiencias liberianas: narración de artículos, materiales educativos o comunicados en inglés liberiano, aprovechando que el modelo está entrenado específicamente en esa variedad y no en inglés estándar.
- Accesibilidad y lectura de pantalla: integración en lectores de pantalla o asistentes de voz para usuarios que hablan inglés liberiano, con audio a 24 kHz que resulta más inteligible que las voces genéricas en inglés estándar.
- Generación de audiolibros y contenido religioso: el corpus de entrenamiento incluye Bible NWT, por lo que el modelo es adecuado para narración de textos largos de registro formal en esta variedad.
- Prototipado de asistentes conversacionales regionales: uso del modelo base como referencia de calidad para evaluar la viabilidad de un asistente de voz en inglés liberiano antes de pasar al modelo destilado de 6 capas para producción.
- Investigación en TTS de bajos recursos: el modelo sirve como teacher model para destilación, ajuste fino o experimentos de transferencia a otras variedades africanas del inglés con pocos datos.
- Generación de voces para vídeo y pódcast de nicho: creación de pistas de voz para producciones dirigidas a Liberia o a la diáspora, con licencia MIT que permite uso comercial sin regalías.
- Evaluación comparativa de sistemas TTS: banco de pruebas para medir la calidad de modelos multilingües genéricos frente a un modelo especializado en una variedad concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 336 millones de parámetros, los pesos en fp32 ocupan aproximadamente 1,3 GB y en fp16 unos 0,7 GB; a ello hay que sumar el estado del runtime y los buffers de audio. Una estimación razonable es de 2 a 4 GB de VRAM en fp16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) debería ser suficiente; para producción con varias peticiones concurrentes se recomiendan A100 o H100, aunque no hay datos publicados de concurrencia.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se dispone de confirmación oficial de requisitos mínimos.
- Opciones de despliegue: la librería indicada es `pocket-tts`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (son runtimes orientados a LLM, no a TTS).
- Latencia y throughput: no disponibles. El modelo base de 24 capas es el teacher; el modelo destilado de 6 capas (`AfriSpeech/kolokwa-tts`) está orientado explícitamente a tiempo real, lo que sugiere que el base no es la opción de baja latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AfriSpeech/kolokwa-tts-base | 336 M (24 capas) | no disponible | `lir`, `en` | MIT | Teacher model, 24 kHz, multi-hablante |
| AfriSpeech/kolokwa-tts | no disponible (6 capas destiladas) | no disponible | `lir`, `en` | no disponible en la información | Modelo destilado para tiempo real |
| Otros TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, modelos TTS multilingües de tamaño comparable) en términos de rendimiento medido.

## Limitaciones y advertencias

- Sesgos conocidos: el entrenamiento se apoya en gran medida en Bible NWT, lo que puede sesgar el registro y el vocabulario hacia un estilo formal y religioso; el comportamiento en registro coloquial o argot no está documentado.
- Riesgo de alucinación: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos acústicos, especialmente con palabras fuera del dominio de entrenamiento (tecnicismos, nombres propios, extranjerismos).
- Limitaciones de idioma: está especializado en inglés liberiano; el rendimiento en inglés estándar u otras variedades no está garantizado ni medido.
- Limitaciones de contexto: no se documenta la longitud máxima de texto de entrada; los textos largos pueden requerir troceado manual.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantías; conviene conservar el aviso de copyright.
- Caveats para producción: es un modelo base (teacher) de 24 capas, no el destilado de 6 capas orientado a tiempo real; para despliegue con latencia baja debería evaluarse el modelo destilado. No hay benchmarks publicados ni métricas objetivas de calidad (MOS, WER) en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/kolokwa-tts-base
- Modelo destilado asociado: https://huggingface.co/AfriSpeech/kolokwa-tts
- Corpus AfriSpeech: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
