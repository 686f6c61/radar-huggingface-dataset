# Lautriv/pocket-tts-zh

## Resumen

Pocket-TTS Chinese (identificador `Lautriv/pocket-tts-zh`) es un ajuste fino (finetune) especializado en chino del modelo de sintesis de voz Kyutai Pocket-TTS. Lo publica el usuario Lautriv y se distribuye como pesos y configuraciones de inferencia para la libreria `pocket-tts`. Su proposito es ofrecer sintesis de voz en mandarin con clonacion de voz a partir de una referencia corta, manteniendo el protocolo de texto espaciado por G2P (grafema a fonema) del modelo original.

El modelo parte de la arquitectura FlowLM de Kyutai (un transformer de flujo para generacion de audio) en su variante inglesa de 24 capas, con reinicio del embedding de texto (`reset_text_embedding`) y reentrenamiento sobre corpus chinos como WenetSpeech y subconjuntos de AISHELL-3. Se ofrecen dos checkpoints: uno de 24 capas (recomendado, 210k pasos) y otro destilado de 6 capas (80k pasos, con CFG integrado).

Es relevante porque cubre un nicho concreto: TTS chino con clonacion de voz sobre una base abierta, aunque con limitaciones claras (solo chino, prosodia no profesional, licencia no comercial por defecto). El repositorio ocupa 3,3 GB e incluye pesos, tokenizer y scripts de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlowLM (transformer de flujo para audio); 24 capas o 6 capas segun checkpoint |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints `.pt` en crudo) |
| Idiomas soportados | chino (zh) unicamente |
| Licencia | `other` (codigo MIT; pesos sujetos a licencias de los datos de entrenamiento; por defecto solo investigacion/uso personal, no comercial) |
| Formato de pesos | `.pt` (PyTorch crudo); tokenizer en `tokenizer/tokenizer.model` |

## Arquitectura y entrenamiento

El modelo se basa en FlowLM, la arquitectura de generacion de audio de Kyutai Pocket-TTS, que combina un transformer con un decodificador de audio basado en Mimi. El ajuste parte del checkpoint ingles de 24 capas y reinicia el embedding de texto para adaptarlo al chino. Se emplea el protocolo `g2p_spaced` (texto espaciado por grafema a fonema) como modo de palabra, comun a ambos checkpoints.

El entrenamiento usa la configuracion `finetune_zh_g2p_mix_hq_v2_mix123.yaml` sobre latentes alineados del conjunto "mix123" (no incluidos en el repositorio), con `cross_utterance_voice_prob=0.3`, `text_dropout=0` y batch efectivo de 64. El checkpoint de 24 capas se entrena 210k pasos; el de 6 capas es un estudiante destilado (80k pasos) cuyo profesor es el 24L@210k, y en el que se integra el CFG (classifier-free guidance) en el propio modelo, de modo que en inferencia se usa CFG 1.0 en lugar de 2.0. Los datos principales son WenetSpeech y corpus chinos relacionados, con parches de enunciados cortos de subconjuntos de AISHELL-3. No hay supervision bilingue `en_*`.

## Capacidades

- Sintesis de voz (text-to-speech) en chino mandarin a partir de texto.
- Clonacion de voz a partir de una referencia de audio corta (aproximadamente 3-5 segundos).
- Protocolo de entrada G2P espaciado (`g2p_spaced`) para el texto.
- Dos variantes de inferencia: 24 capas (calidad, CFG 2.0) y 6 capas destilada (mas ligera, CFG 1.0).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un modelo de audio, no de lenguaje general).
- Capacidades multilingues: no; solo chino. Para ingles o code-switching existe el modelo hermano `Lautriv/pocket-tts-zh-en`.
- No dispone de vision ni audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Clonacion de voz para audiolibros en chino: se toma una muestra de 3-5 segundos del narrador y se sintetizan parrafos de texto en mandarin, con la salvedad de que frases largas pueden perder palabras.
- Generacion de locuciones para prototipos de asistentes de voz en chino: el modelo produce audio WAV a partir de texto mediante `infer.py`, adecuado para pruebas de concepto y demos internas.
- Doblaje de contenido corto en mandarin: para clips de pocas frases donde la prosodia no profesional es aceptable.
- Investigacion en TTS y clonacion de voz en chino: el repositorio incluye tokenizer, configuraciones de inferencia y receta de entrenamiento en un repositorio separado, util para experimentos reproducibles.
- Generacion de avisos o mensajes de voz personalizados (por ejemplo, recordatorios domoticos como "abre la cortina del dormitorio") en entornos de prueba.
- Evaluacion comparativa de arquitecturas FlowLM frente a otros TTS abiertos en mandarin, usando las dos variantes (24L y 6L) para medir el compromiso calidad/eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 3,3 GB, por lo que la huella de pesos en precision completa es de ese orden, sin contar dependencias de Mimi y del decodificador de audio.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (unos 3,3 GB) sugiere que podria caber en GPUs de consumo con VRAM suficiente, pero no hay dato oficial.
- Opciones de despliegue: inferencia mediante el script `infer.py` del repositorio del modelo y el repositorio de codigo de entrenamiento (`POCKET_TTS_CODE_ROOT`), con dependencias descargadas desde `hf://kyutai/pocket-tts/...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje, no a este TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Clonacion de voz | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lautriv/pocket-tts-zh | Chino | Si (referencia de 3-5 s) | `other`, no comercial por defecto | Hugging Face (este repo) |
| Lautriv/pocket-tts-zh-en | Chino/ingles (code-switching) | Si | `other` | Hugging Face (modelo hermano) |
| Kyutai Pocket-TTS (base) | Ingles | Si | MIT (codigo); pesos segun Kyutai | GitHub y Hugging Face de Kyutai |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo chino: las entradas en ingles tienden a desviarse o alucinar; no es fiable para sintesis en ingles.
- Frases largas pueden perder palabras o sonar inestables.
- La clonacion de voz depende de la calidad y duracion de la referencia (aproximadamente 3-5 segundos).
- Prosodia no de calidad de estudio, heredada de un profesor ingles general.
- Licencia de pesos sujeta a las licencias de los datos de entrenamiento (WenetSpeech, AISHELL-3); el uso comercial requiere revision propia y no esta garantizado por defecto.
- El modelo se ofrece por defecto para investigacion y experimentos personales, no como licencia comercial.
- Riesgo de sesgos y alucinacion derivado de los corpus de entrenamiento; no se documentan evaluaciones de sesgo.
- Los datos de entrenamiento (audio crudo y jsonl) no se incluyen, lo que limita la reproducibilidad completa.
- Requiere clonar un repositorio de codigo separado para la inferencia; la primera ejecucion descarga dependencias desde Kyutai.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lautriv/pocket-tts-zh
- Modelo hermano chino/ingles: https://huggingface.co/Lautriv/pocket-tts-zh-en
- Repositorio de Kyutai Pocket-TTS: https://github.com/kyutai-labs/pocket-tts
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
- Repositorio de codigo de entrenamiento: no disponible (la model card indica un repositorio GitHub separado sin URL concreta)
