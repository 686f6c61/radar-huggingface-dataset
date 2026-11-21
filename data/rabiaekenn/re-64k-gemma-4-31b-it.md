# rabiaekenn/re-64k-gemma-4-31b-it

## Resumen

`rabiaekenn/re-64k-gemma-4-31b-it` es un artefacto experimental publicado en Hugging Face por Rabia Eken (Magibu OpenSource) que consiste en un tokenizer fusionado para el modelo `google/gemma-4-31B-it`. No se trata de un modelo entrenado de forma independiente, sino de un tokenizer de byte-level BPE construido a partir de un tokenizer turco propio (`rabiaekenn/re-64k-turkish-tokenizer`, 6 dominios, 36 millones de caracteres) combinado con el tokenizer original de Gemma mediante la herramienta `bpe-tokenizer-editor` y la operación `merge_from`, manteniendo un tamano de vocabulario fijo de 262 144 entradas.

El propósito declarado es mejorar la eficiencia de tokenizacion del turco sobre la base de Gemma 4 31B IT, un modelo de 31 000 millones de parametros. Sin embargo, el propio autor advierte en la model card de dos problemas criticos: los embeddings de los nuevos tokens no han sido entrenados, por lo que los pesos originales del modelo no deben usarse directamente con este tokenizer, y la tokenizacion del ingles empeora respecto al original (de 40 a 55 tokens en tres frases), con una mitigacion parcial que reduce la cifra a 47 a costa de impedir la formacion del 10 % de los tokens turcos.

La relevancia de esta publicacion es, por tanto, documental y de investigacion: ilustra el proceso de adaptacion de vocabulario para lenguas aglutinantes y los compromisos que implica cuando no se realiza un continued pretraining posterior. El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos o el tokenizer no estan efectivamente alojados o que el repositorio esta vacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `google/gemma-4-31B-it`); el artefacto publicado es un tokenizer byte-level BPE fusionado |
| Parametros totales | 31 000 millones (modelo base referenciado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el nombre del repositorio sugiere 64K, sin confirmacion en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible oficialmente; el trabajo se orienta al turco y al ingles |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio reporta 0.0 GB |
| Vocabulario del tokenizer | 262 144 entradas (fijo, `max_vocab_size=262144`) |
| Herramienta de fusion | `bpe-tokenizer-editor`, operacion `merge_from` |
| Tokenizer fuente turco | `rabiaekenn/re-64k-turkish-tokenizer` (6 dominios, 36M caracteres, byte-level BPE) |
| Formato de tokenizer | ByteLevel (Ġ) convertido a SentencePiece (▁) antes de la fusion |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento de pesos. Se trata de una edicion de vocabulario sobre el tokenizer de `google/gemma-4-31B-it`: se parte de un tokenizer turco byte-level BPE entrenado sobre 36 millones de caracteres procedentes de 6 dominios y se fusiona con el vocabulario original de Gemma mediante `merge_from`, fijando el vocabulario en 262 144 entradas. Dado que el tokenizer turco estaba en formato ByteLevel (prefijo Ġ) y Gemma usa SentencePiece (prefijo ▁), fue necesaria una conversion de formato previa a la fusion.

La innovacion tecnica es exclusivamente de tokenizacion, no de arquitectura del modelo. El autor senala explicitamente que los embeddings correspondientes a los nuevos tokens no fueron entrenados, lo que invalida el uso directo de los pesos originales de Gemma 4 31B IT con este vocabulario: seria necesario un continued pretraining que ajustase la matriz de embeddings y, previsiblemente, las capas superiores. No se documentan datos de entrenamiento del modelo base, numero de tokens de pretraining, ni etapas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base `google/gemma-4-31B-it`, no verificadas con este tokenizer.
- Codigo y matematicas: capacidades del modelo base, no evaluadas en esta publicacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el trabajo se centra en turco e ingles; el autor reporta degradacion en la tokenizacion del ingles.
- Capacidad especial del artefacto: tokenizacion mejorada del turco mediante vocabulario fusionado, con la salvedad de que los embeddings nuevos no estan entrenados.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre adaptacion de tokenizers a lenguas aglutinantes: el repositorio sirve como referencia metodologica para estudiar como `merge_from` con vocabulario fijo afecta a la fertilidad (tokens por palabra) en turco frente a ingles, y para documentar el compromiso entre ambas lenguas.
- Base para continued pretraining en turco: un equipo que quiera especializar Gemma 4 31B IT en turco puede partir de este vocabulario fusionado y entrenar los embeddings de los nuevos tokens sobre un corpus turco, en lugar de disenar el tokenizer desde cero.
- Analisis de eficiencia de tokenizacion: permite medir el numero de tokens generados por frase en turco e ingles antes y despues de la fusion, util para decidir si merece la pena adaptar el vocabulario en un pipeline de produccion.
- Reproduccion de experimentos de edicion de vocabulario: documenta el paso de ByteLevel a SentencePiece y el uso de `max_vocab_size=262144`, lo que facilita replicar el procedimiento con otros pares de idiomas.
- Evaluacion de riesgos en adaptaciones de tokenizer: el caso del 10 % de tokens turcos que dejan de formarse al priorizar las reglas de Gemma constituye un ejemplo concreto de los fallos que hay que detectar antes de desplegar un tokenizer modificado.
- Docencia y formacion tecnica: util para explicar en un curso o taller las diferencias entre BPE byte-level y SentencePiece, y las consecuencias de anadir tokens sin entrenar sus embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es de tokenizacion: en tres frases en ingles, el texto pasa de 40 tokens con el tokenizer original a 55 con el fusionado, y a 47 si se priorizan las reglas de Gemma, a costa de impedir la formacion del 10 % de los tokens turcos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este artefacto; para el modelo base de 31 000 millones de parametros, las estimaciones habituales serian del orden de 62 GB en FP16/BF16 y de 18-20 GB en cuantizacion de 4 bits, aunque estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada; un modelo de 31B en 4 bits podria encajar en GPUs con 24 GB de VRAM, pero no hay datos que lo verifiquen para este artefacto.
- Opciones de despliegue: no disponible; el repositorio no incluye pesos utilizables (0.0 GB) y el autor advierte que los pesos originales no deben usarse con este tokenizer.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizer | Licencia | Estado |
|---|---|---|---|---|---|
| `rabiaekenn/re-64k-gemma-4-31b-it` | 31B (base referenciado) | no disponible | BPE fusionado turco + Gemma, vocab 262 144 | no disponible | Artefacto de tokenizer, sin pesos entrenados |
| `google/gemma-4-31B-it` | 31B | no disponible | Tokenizer original de Gemma | no disponible | Modelo base de referencia |
| `rabiaekenn/re-64k-turkish-tokenizer` | no aplica | no aplica | Byte-level BPE turco, 36M caracteres, 6 dominios | no disponible | Tokenizer fuente del trabajo |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Los embeddings de los nuevos tokens no han sido entrenados; el autor advierte explicitamente de que los pesos originales del modelo no deben usarse directamente con este tokenizer.
- La tokenizacion del ingles empeora: de 40 a 55 tokens en tres frases, y a 47 si se priorizan las reglas de Gemma, lo que a su vez impide la formacion del 10 % de los tokens turcos.
- El repositorio reporta un tamano de 0.0 GB, 0 descargas y 0 likes, lo que sugiere que los artefactos no estan alojados o que el repositorio esta vacio.
- No se especifica licencia, lo que impide evaluar las restricciones de uso comercial.
- No se documentan idiomas soportados oficialmente ni limitaciones de contexto verificadas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; cualquier uso productivo requeriria una evaluacion propia.
- El nombre del repositorio sugiere una ventana de 64K tokens, pero la model card no confirma esta cifra.
- Al no existir pesos entrenados con este vocabulario, el artefacto no es desplegable en produccion tal cual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rabiaekenn/re-64k-gemma-4-31b-it
- Tokenizer turco fuente: https://huggingface.co/rabiaekenn/re-64k-turkish-tokenizer
- Modelo base referenciado: `google/gemma-4-31B-it` (no se proporciona URL directa en la informacion disponible)
- Herramienta de edicion de tokenizers: `bpe-tokenizer-editor` (no se proporciona URL directa en la informacion disponible)
