# karthik-1599/qwen3-tts-kannada-1.7b-experiment

## Resumen

qwen3-tts-kannada-1.7b-experiment es un ajuste fino completo (full fine-tune) del modelo de texto a voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el usuario independiente karthik-1599. El objetivo del experimento es ensenar kannada (kn) a un modelo base que no incluye ningun idioma indio entre sus diez idiomas soportados, partiendo unicamente de unas 89 horas de audio en kannada y manteniendo intacto el tokenizador original. El resultado es un TTS de 1.916.676.352 parametros (~1,92 mil millones) capaz de sintetizar voz en kannada y en ingles con dos voces integradas, `syspin_male` y `syspin_female`.

La relevancia del modelo es fundamentalmente metodologica: demuestra que un modelo TTS multilingue puede extenderse a un idioma no visto con recursos limitados y una sola GPU NVIDIA L4, sin anadir tokens nuevos al vocabulario. El autor documenta explicitamente dos fallos intermedios corregidos (la adaptacion del tokenizador seleccionaba 11.946 filas de embeddings en lugar de las 234 que kannada usa realmente, y el paso de warm-up no actualizaba nada por un interruptor mal configurado), lo que convierte el repositorio en un caso de estudio reproducible.

Se trata de un experimento de investigacion, no de un producto: el propio autor advierte que el modelo no esta ajustado ni probado para uso real y pide que no se emplee en aplicaciones o servicios. No hay resultados de benchmarks estandar (MOS, WER) ni datos de cuantizacion; la unica metrica publicada es la perdida sobre conjuntos retenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech autorregresiva basada en el codec de audio de Qwen3-TTS a 12 Hz (12 tokens de audio por segundo); detalle interno de capas no disponible |
| Parametros totales | 1.916.676.352 (~1,92 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | Kannada (kn) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-TTS-12Hz-1.7B-Base |
| Tarea (pipeline) | text-to-speech |
| Voces integradas | `syspin_male` y `syspin_female` (sin audio de referencia) |
| Tamano del repositorio | 4,5 GB |
| GPU usada en entrenamiento | 1x NVIDIA L4 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-1.7B-Base, un TTS autorregresivo que opera sobre un codec de audio a 12 Hz (12 tokens por segundo de audio) y que en su version original cubre diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano. Ninguno de ellos es indio. El ajuste aqui es un fine-tune completo del modelo base, no un adaptador, lo que explica el tamano del repositorio (4,5 GB) y que el checkpoint resultante conserve los 1.916.676.352 parametros del original.

Los datos de entrenamiento combinan unas 89 horas de voz estudio en kannada del corpus SYSPIN (IISc), con un hablante masculino y otro femenino, que dan lugar a las dos voces integradas; y unas 38 horas de voz en ingles generadas sinteticamente con el propio Qwen3-TTS 1.7B Base mediante clonacion de voz (9.606 frases x 2 voces), depuradas manualmente. Este segundo conjunto funciona como "replay" para evitar el olvido catastrofico del ingles. Las frases de test se excluyeron del entrenamiento. No se documento ningun tipo de RLHF o DPO; el proceso es exclusivamente de ajuste supervisado sobre audio.

La innovacion tecnica mas destacable es precisamente la que el autor evita: no se anadieron tokens al tokenizador. El vocabulario original solo contiene 25 tokens en kannada, todos caracteres sueltos, de modo que los signos vocales y el virama caen a bytes crudos. Como consecuencia, una palabra en kannada se tokeniza en aproximadamente 14,6 tokens frente a 1,4 de una palabra inglesa, y el modelo debe aprender a leer kannada a partir de fragmentos de bytes. El autor corrige ademas dos errores de implementacion: la seleccion de embeddings alcanzaba 11.946 filas (incluyendo texto ingles) cuando kannada solo usa 234, y un interruptor desactivaba las actualizaciones durante la fase de warm-up de embeddings.

## Capacidades

- Sintesis de voz en kannada con pronunciacion fluida segun la evaluacion subjetiva del autor, incluyendo parrafos largos de 22 a 26 segundos generados en una sola llamada.
- Mantenimiento del ingles tras el ajuste, sin degradacion medida en la perdida retenida.
- Dos voces integradas, `syspin_male` y `syspin_female`, invocables sin necesidad de audio de referencia.
- Generacion controlada por decodificacion: greedy para clips cortos y sampling para clips largos, segun se documenta en `samples/manifest.json`.
- No se documentan capacidades de clonacion de voz en este checkpoint (aunque el modelo base si las ofrece), ni diseno de voz por instrucciones en lenguaje natural, ni tool calling, ni razonamiento multi-paso: son capacidades de modelos de lenguaje, no de este TTS.
- Cobertura multilingue limitada a dos idiomas (kn, en) frente a los diez del modelo base.

## Casos de uso

Advertencia previa: el autor indica explicitamente que el modelo es un experimento de investigacion y que no debe usarse en aplicaciones o servicios. Los escenarios siguientes son aplicaciones tecnicas plausibles de la tecnologia, no recomendaciones de produccion con este checkpoint concreto.

- Investigacion en adaptacion de idiomas de bajos recursos: sirve como referencia reproducible para medir cuanto puede estirarse un TTS multilingue hacia un idioma no visto sin ampliar el tokenizador.
- Analisis del coste de tokenizacion: el ratio de 14,6 tokens por palabra en kannada frente a 1,4 en ingles permite estudiar el impacto de la cobertura del vocabulario en la calidad y la longitud de contexto efectiva.
- Estudio de olvido catastrofico: la estrategia de replay con 38 horas de ingles sintetico en las mismas voces ofrece un caso medible de preservacion de una lengua previa durante un fine-tune.
- Generacion de audiolibros o narracion en kannada (prototipos): el modelo maneja parrafos de 22 a 26 segundos en una sola llamada, adecuado para validar pipelines de lectura larga antes de escalar.
- Locuciones de doble voz para material educativo bilingue kn/en: dispone de una voz masculina y otra femenina consistentes en ambos idiomas, util para dialogos o ejercicios de aprendizaje de idiomas en fase de pruebas.
- Evaluacion de corpus TTS: la perdida retenida sobre 32 clips no vistos permite comparar estrategias de ajuste (con y sin warm-up de embeddings, con y sin replay) sobre una linea base publicada.
- Integracion en demos de accesibilidad en kannada: lectura de textos para personas con discapacidad visual, siempre que se sustituya por un modelo validado antes de cualquier despliegue real.

## Benchmarks y rendimiento

El autor publica una unica metrica: la perdida sobre conjuntos retenidos de 32 clips no vistos, antes y despues del ajuste. Advierte que la perdida no es una medida de calidad perceptual y que no debe interpretarse como tal. No hay MOS, WER, ni comparaciones con otros sistemas TTS.

| Conjunto retenido | Modelo base | Este modelo |
|---|---|---|
| Kannada, voz masculina | 4,153 | 2,174 |
| Kannada, voz femenina | 4,157 | 2,212 |
| Ingles, voz masculina | 2,147 | 1,906 |
| Ingles, voz femenina | 2,130 | 1,897 |

No se han publicado resultados de benchmarks estandar (MOS, WER, similitud de hablante) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: el autor realizo el fine-tune completo en una sola NVIDIA L4 (24 GB de VRAM).
- Inferencia en bf16: se estiman unos 4 GB solo para los pesos (1,92 mil millones de parametros x 2 bytes), mas el codificador/decodificador de audio y las activaciones. Esta cifra es una estimacion propia, no un dato publicado.
- Inferencia en fp32: se estiman unos 7,7 GB de pesos, tambien como estimacion.
- GPU consumer: con la estimacion anterior, el modelo cabria en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), asumiendo un runtime eficiente. No hay confirmacion oficial.
- GPU de centro de datos: A100, H100, L40S o L4 son suficientes y sobredimensionadas para inferencia; la L4 ya basta.
- Opciones de despliegue: no disponible. El repositorio base QwenLM/Qwen3-TTS publica su propio stack de inferencia, pero no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponible. Las muestras publicadas usan decodificacion greedy en clips cortos y sampling en clips largos, pero no se reportan tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| qwen3-tts-kannada-1.7b-experiment | 1,92 mil millones | kn, en | no disponible | Apache 2.0 | HuggingFace | Fine-tune experimental; perdida retenida en kannada 2,174/2,212 |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | ~1,7 mil millones | zh, en, ja, ko, de, fr, ru, pt, es, it | no disponible | Apache 2.0 | HuggingFace | Modelo base; no soporta ningun idioma indio; perdida retenida en kannada 4,153/4,157 |
| Otros TTS para kannada | no disponible | no disponible | no disponible | no disponible | no disponible | No se han encontrado comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que es un experimento de investigacion, no un producto, y pide que no se use en aplicaciones o servicios.
- No se han publicado evaluaciones perceptuales (MOS) ni de inteligibilidad (WER); la unica metrica es la perdida, que el propio autor senala que no mide calidad.
- Cobertura de voces muy limitada: solo dos hablantes, ambos procedentes de un unico corpus de estudio (SYSPIN), lo que reduce la diversidad de registro, prosodia y acento.
- El tokenizador no cubre adecuadamente el kannada (25 tokens, todos caracteres sueltos; signos vocales y virama en bytes crudos), con un coste de 14,6 tokens por palabra que limita la longitud efectiva de texto procesable.
- Vocabulario y dominio restringidos al corpus de entrenamiento; es previsible un comportamiento degradado con texto fuera de dominio, nombres propios, numeros o terminologia tecnica.
- Riesgo de olvido parcial del ingles: aunque la perdida retenida mejora, el ingles se ha mantenido con datos sinteticos generados por el propio modelo base, lo que puede introducir sesgos y artefactos de clonacion.
- Licencia Apache 2.0 sobre el checkpoint, pero los datos (SYSPIN, IISc) y el modelo base (Qwen) no son del autor; cualquier uso debe respetar los terminos de esas fuentes, y el autor remite a su seccion de creditos.
- Aunque la licencia es permisiva, el aviso del autor desaconseja el uso comercial o en produccion de este checkpoint concreto.
- Los errores de implementacion documentados (seleccion de embeddings, warm-up desactivado, limpieza de checkpoints) sugieren que el pipeline de entrenamiento puede contener mas fallos no detectados en la version publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/karthik-1599/qwen3-tts-kannada-1.7b-experiment
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- README de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS/blob/main/README.md
- Coleccion Qwen3-TTS en HuggingFace: https://huggingface.co/collections/Qwen/qwen3-tts
- Manifiesto de muestras de audio: https://huggingface.co/karthik-1599/qwen3-tts-kannada-1.7b-experiment/blob/main/samples/manifest.json
- Informe tecnico de Qwen3 (serie LLM, no especifico de TTS): https://arxiv.org/html/2505.09388v1
- Perfil del autor en HuggingFace: https://huggingface.co/karthik-1599/datasets
