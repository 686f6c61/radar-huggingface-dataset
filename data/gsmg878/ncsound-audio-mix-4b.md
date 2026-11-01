# gsmg878/ncsound-audio-mix-4b

## Resumen

NCSound Audio Mix 4B es un adaptador LoRA (QLoRA de 4 bits) entrenado sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario gsmg878 para NC Sound Lab. Su funcion es actuar como asistente de mezcla y masterizacion de audio: convierte una peticion en lenguaje natural sobre produccion musical en una respuesta practica o en una receta JSON con valores concretos de ganancia, EQ, compresion, saturacion, sidechain, reverb y loudness. Es relevante porque demuestra como un adaptador pequeno (169,9 MB) sobre un modelo de 4B puede especializarse en un dominio tecnico muy concreto sin necesidad de reentrenar el modelo completo.

El adaptador no procesa audio: es un modelo de texto que sugiere movimientos al ingeniero para aplicarlos en NCSoundlab, NC Studio u otro DAW. El modelo base Qwen3.5-4B es una arquitectura vision-language, aunque este adaptador se ha entrenado exclusivamente para generacion de texto en el dominio de produccion musical.

El entrenamiento se realizo con 1.937 filas de entrenamiento, 154 de validacion y 78 de test, en una sola GPU Kaggle T4 con 729 pasos y 3 epocas, alcanzando una perdida de validacion de 0,2292. La licencia es Apache 2.0 y el idioma soportado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32, dropout 0.05) sobre Qwen3.5-4B (transformer vision-language) |
| Parametros totales | No disponible (adaptador de ~1% de parametros entrenables sobre base de 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | QLoRA 4 bits en entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA con rank 32, alpha 32 y dropout 0.05, entrenado en modo QLoRA de 4 bits sobre el modelo base `unsloth/Qwen3.5-4B`. El entrenamiento se ejecuto en una sola GPU Kaggle T4 durante 729 pasos (3 epocas), con un pico de VRAM de 5,0 GB. El adaptador resultante ocupa 169,9 MB y representa aproximadamente el 1% de los parametros del modelo base.

Los datos de entrenamiento combinan recetas de mezcla, notas de ingenieros, cadenas de masterizacion, pistas de referencia, material de psicoacustica, contenido de restauracion y notas de flujo de trabajo de NC Studio. Se eliminaron filas duplicadas y de holdout antes del entrenamiento, y el split de test nunca se utilizo en entrenamiento. Las perdidas reportadas son: entrenamiento 0,3309, validacion 0,2292 y test 0,2459. El prompt de sistema de entrenamiento define al modelo como ingeniero experto de mezcla y masterizacion de NC Sound Lab, con instruccion de devolver un unico objeto JSON valido con numeros concretos (Hz, dB, ms, ratios, LUFS) cuando se solicite una receta.

## Capacidades

- Traduccion de una descripcion sonora a una cadena de procesamiento inicial: high-pass, compresor, EQ, saturacion y reverb con valores numericos.
- Movimientos para voces al frente que reducen aspereza sin limitarse a realzar agudos.
- Decisiones de graves: afinacion de 808, separacion de kick y 808, profundidad y timing de sidechain.
- Matching de referencias y objetivos de loudness con techos de true-peak.
- Generacion de un objeto JSON parseable por una herramienta para construir un channel strip o una ficha de receta.
- Respuestas en prosa para preguntas normales de produccion, ademas del modo receta estructurada.
- No soporta tool calling, function calling ni agentes multi-paso de forma explicita.
- No procesa audio ni vision a pesar de que el modelo base sea vision-language.

## Casos de uso

- Asistente de mezcla autoalojado en NCSoundlab: el adaptador se integra localmente para responder consultas de produccion y devolver recetas editables que el ingeniero aplica en la interfaz.
- Generacion de recetas JSON para channel strips: una peticion como "mezcla un 808 de trap a 140 BPM" produce un objeto con valores de ganancia, EQ, saturacion, sidechain y reverb que una herramienta puede parsear directamente.
- Formacion y ensenanza de criterio de mezcla: el modelo explica el razonamiento detras de cada movimiento, util para aprender por que se aplica un high-pass o un compresor concreto.
- Punto de partida para masterizacion: sugiere cadenas de masterizacion con objetivos de loudness y techos de true-peak para adaptar despues a la pista real.
- Decisiones de graves en produccion urbana: ayuda con afinacion de 808, separacion kick/808 y ajuste de sidechain en generos como trap, boom bap o house.
- Matching de referencias: dado un objetivo de sonido o una pista de referencia descrita, propone ajustes de EQ y compresion para acercarse.
- Restauracion y limpieza: ofrece movimientos iniciales de restauracion basados en el material de entrenamiento sobre psicoacustica y restauracion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Train loss | 0,3309 |
| Validation loss | 0,2292 |
| Test loss | 0,2459 |
| Test loss en filas de audio (78) | 0,6626 |
| Test loss del adaptador de codigo sobre la misma base | 2,2924 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La comparacion held-out reportada es interna: el adaptador de audio obtiene 0,6626 de test loss en las 78 filas de audio, frente a 2,2924 del adaptador de codigo entrenado sobre la misma base.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento uso 5,0 GB en una T4 con QLoRA de 4 bits; la inferencia del adaptador sobre el modelo base en 4 bits deberia moverse en un rango similar, aunque no se especifica una cifra exacta de inferencia.
- GPU recomendadas: T4 (validada en entrenamiento), asi como A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060 y superiores con cuantizacion de 4 bits, aunque no se confirma en la model card.
- Opciones de despliegue: transformers (>=5.16) con peft y accelerate; el adaptador es PEFT y se adjunta al modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NCSound Audio Mix 4B | Adaptador ~1% sobre base 4B | No disponible | Mezcla y masterizacion (texto) | Apache 2.0 | HuggingFace (14 descargas) |
| Qwen3.5-4B (base) | 4B | No disponible | Proposito general vision-language | No disponible en la informacion | HuggingFace |
| Adaptador de codigo sobre Qwen3.5-4B (mencionado) | Adaptador sobre base 4B | No disponible | Codigo | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No puede escuchar: nunca analiza un archivo de audio ni juzga la grabacion, el arreglo, el vocalista o la sala reales.
- Los numeros son sugerencias, no analisis medidos; hay que audicionar cada movimiento.
- El dataset esta sesgado hacia pop, alt rock, R&B, trap, boom bap y house; generos nicho e instrumentos poco habituales son menos fiables.
- El conjunto de entrenamiento contiene muchas filas de recetas sinteticas; el modelo aprendio un estilo propio, puede ser demasiado confiado y repetir una cadena preferida.
- La salida JSON se solicita pero no esta garantizada por el modelo; debe validarse siempre.
- Solo soporta ingles; no hay soporte multilingue.
- No es un modelo general de codigo y no debe usarse como tal.
- El adaptador depende del modelo base `unsloth/Qwen3.5-4B`; su licencia y disponibilidad condicionan el uso.
- La model card advierte de pasar el prompt con `tokenizer(text=prompt, ...)` porque Qwen3.5 puede interpretar una cadena posicional como imagen en algunas versiones.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/gsmg878/ncsound-audio-mix-4b
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Run de entrenamiento en Kaggle: https://www.kaggle.com/code/tap919/qwen-mix-full-train-v2
- NCSoundlab: https://ncsound-hub.vercel.app/apps/ncsoundlab
