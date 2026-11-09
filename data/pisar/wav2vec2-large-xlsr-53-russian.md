# pisar/wav2vec2-large-xlsr-53-russian

## Resumen

El modelo `pisar/wav2vec2-large-xlsr-53-russian` es un ajuste fino del checkpoint multilingüe `facebook/wav2vec2-large-xlsr-53` para reconocimiento automático del habla (ASR) en ruso. Lo publica el usuario de Hugging Face `pisar`, pero la model card, el `model-index` y la citación BibTeX atribuyen el entrenamiento original a Jonatas Grosman, dentro del evento comunitario `xlsr-fine-tuning-week`. El modelo se distribuye con licencia Apache 2.0 y ocupa 4,0 GB en el repositorio.

Se trata de un modelo acústico CTC puro (sin decodificador de lenguaje integrado) que transcribe audio muestreado a 16 kHz. Su interés práctico está en que ofrece una base rusa funcional con un WER del 13,3 % en el test de Common Voice ru (9,57 % aplicando un modelo de lenguaje externo), lo que lo sitúa como punto de partida razonable para transcripción en ruso sin necesidad de entrenar desde cero.

La relevancia actual es limitada pero real: los modelos Wav2Vec2-XLSR siguen siendo referencia para fine-tuning de bajo coste en lenguas con pocos recursos, y este checkpoint permite obtener transcripciones rusas con infraestructura modesta. No obstante, su rendimiento cae drásticamente en dominios ruidosos (WER del 40,22 % en el dev set de Robust Speech Event), por lo que conviene evaluarlo en el dominio objetivo antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer encoder convolucional + atención, cabeza CTC) |
| Parámetros totales | no disponible (el checkpoint base `wav2vec2-large-xlsr-53` tiene ~317 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico; procesa ventanas de audio, no texto) |
| Tipos de cuantización | no disponible (el repo contiene pesos PyTorch/JAX en fp32; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch`), JAX (`jax`); safetensors no confirmado |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-large-xlsr-53`, un encoder Wav2Vec2 preentrenado de forma autosupervisada sobre audio multilingüe (53 idiomas) y ajustado después con una cabeza de clasificación CTC para ASR. La entrada es audio mono a 16 kHz; la salida es una secuencia de tokens CTC que se decodifica a texto. No incorpora decoder autorregresivo ni modelo de lenguaje interno: las mejoras de WER con LM requieren un decoder externo (por ejemplo, KenLM o `pyctcdecode`).

El ajuste fino se realizó sobre los splits de entrenamiento y validación de Common Voice 6.1 en ruso y del corpus CSS10. La model card no detalla el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización más allá del pipeline estándar de Hugging Face. El script de entrenamiento está publicado en el repositorio `jonatasgrosman/wav2vec2-sprint`. No se documenta RLHF, DPO ni innovaciones arquitectónicas adicionales.

## Capacidades

- Reconocimiento automático del habla en ruso a partir de audio a 16 kHz.
- Decodificación CTC greedy sin modelo de lenguaje (WER 13,3 % en Common Voice ru test).
- Decodificación con modelo de lenguaje externo, que mejora el WER hasta 9,57 % y el CER hasta 2,24 %.
- Procesamiento por lotes de múltiples ficheros de audio mediante la librería HuggingSound.
- Integración directa con `transformers` (`Wav2Vec2ForCTC` y `Wav2Vec2Processor`).
- Evaluación reproducible mediante el script `eval.py` sobre Common Voice 6.0 y Robust Speech Event.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz, ni generación de texto libre.
- Capacidad multilingüe: no; el modelo está ajustado exclusivamente para ruso.

## Casos de uso

- Transcripción de reuniones y entrevistas en ruso: el modelo procesa audio a 16 kHz y devuelve texto en mayúsculas; con un LM externo el WER baja al 9,57 %, suficiente para actas revisables por un humano.
- Subtitulado automático de vídeo en ruso: se puede segmentar el audio en ventanas de 5 s con solapamiento de 1 s (como en la evaluación de Robust Speech Event) y pasar cada fragmento al modelo para generar subtítulos con marcas temporales.
- Generación de corpus textual a partir de archivos de audio rusos: útil para proyectos de investigación que necesiten transcribir grandes volúmenes de grabaciones limpias (podcasts, audiolibros) sin depender de APIs comerciales.
- Prototipado de asistentes de voz en ruso: el modelo sirve como capa ASR en un pipeline que encadene VAD, transcripción y un LLM posterior para intención y respuesta.
- Búsqueda y análisis de contenido audiovisual: indexar transcripciones rusas para búsqueda por palabra clave en archivos de audio o vídeo, aprovechando el bajo coste de inferencia del modelo.
- Evaluación comparativa de ASR en ruso: usar los resultados publicados (Common Voice y Robust Speech Event) como baseline frente a modelos más recientes o propietarios.
- Fine-tuning adicional en dominios específicos: al ser un checkpoint Apache 2.0 con script de entrenamiento público, se puede reajustar sobre corpus propios (por ejemplo, jerga médica o legal en ruso) partiendo de un modelo ya competente en la lengua.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| Common Voice ru (test) | Test WER | 13,3 |
| Common Voice ru (test) | Test CER | 2,88 |
| Common Voice ru (test) | Test WER (+LM) | 9,57 |
| Common Voice ru (test) | Test CER (+LM) | 2,24 |
| Robust Speech Event - Dev Data (ru) | Dev WER | 40,22 |
| Robust Speech Event - Dev Data (ru) | Dev CER | 14,8 |
| Robust Speech Event - Dev Data (ru) | Dev WER (+LM) | 33,61 |
| Robust Speech Event - Dev Data (ru) | Dev CER (+LM) | 13,5 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,3 GB solo para pesos (modelo de ~317 M de parámetros), más el overhead de activaciones y del procesador; en la práctica, 2-3 GB de VRAM son suficientes para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. En CPU también es viable para transcripciones por lotes con latencia aceptable.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 6 GB en adelante).
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC`, HuggingSound para procesamiento por lotes, y exportación a ONNX para inferencia optimizada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no están orientadas a modelos CTC de audio.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware, del tamaño de las ventanas de audio y de si se aplica decodificación con LM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER Common Voice ru | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pisar/wav2vec2-large-xlsr-53-russian` (este) | ~317 M (no confirmado) | audio 16 kHz | 13,3 % (9,57 % con LM) | Apache 2.0 | Hugging Face |
| `jonatasgrosman/wav2vec2-large-xlsr-53-russian` | ~317 M (no confirmado) | audio 16 kHz | mismos valores (es el checkpoint original citado) | Apache 2.0 | Hugging Face |
| `facebook/wav2vec2-large-xlsr-53` (base) | ~317 M (no confirmado) | audio 16 kHz | no disponible (multilingüe, sin ajuste a ruso) | Apache 2.0 | Hugging Face |
| Whisper (variantes de OpenAI) | no disponible en esta ficha | audio 16 kHz, ventanas de 30 s | no disponible en esta ficha | MIT (según variante) | Hugging Face / OpenAI |

La información proporcionada no permite comparar con cifras de WER de otros modelos en ruso. El checkpoint `jonatasgrosman/wav2vec2-large-xlsr-53-russian` es el origen directo del modelo aquí descrito, según la model card y la citación.

## Limitaciones y advertencias

- Rendimiento degradado en audio ruidoso o de dominio distinto: el WER sube al 40,22 % en el dev set de Robust Speech Event, frente al 13,3 % en Common Voice.
- Alucinaciones y errores de transcripción: la model card muestra ejemplos con sustituciones claras (por ejemplo, "ДЕВЯТЬ" transcrito como "ЛЕВЕТЬ" o "ИЗРАИЛЕМ" como "ФЕЗРЕЛЕМ"), lo que indica fragilidad ante nombres propios y términos poco frecuentes.
- Dependencia del modelo de lenguaje: sin LM externo el WER es notablemente peor; el pipeline de producción debería incluir un decoder con LM para acercarse a los mejores números publicados.
- Idioma único: solo ruso; no se debe usar para otras lenguas eslavas ni como modelo multilingüe.
- Sin verificación independiente: todos los resultados del `model-index` están marcados como `verified: false`, es decir, no han sido validados por el equipo de Hugging Face.
- Atribución y trazabilidad: el repositorio pertenece a `pisar`, pero la autoría del entrenamiento se atribuye a Jonatas Grosman; conviene citar el trabajo original y revisar que los pesos coinciden con el checkpoint de referencia antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar el aviso de copyright y la licencia, y a indicar cambios si se redistribuye el modelo.
- Sin soporte de cuantización documentada: no se ofrecen variantes GGUF, ONNX ni cuantizadas en el repositorio, lo que limita el despliegue en entornos muy restringidos sin trabajo adicional de exportación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pisar/wav2vec2-large-xlsr-53-russian
- Checkpoint base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Checkpoint original citado: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-russian
- Script de entrenamiento: https://github.com/jonatasgrosman/wav2vec2-sprint
- Librería HuggingSound: https://github.com/jonatasgrosman/huggingsound
- Dataset Common Voice: https://huggingface.co/datasets/common_voice
- Dataset Common Voice 6.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_6_0
- Corpus CSS10: https://github.com/Kyubyong/css10
- Créditos GPU OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-training/
