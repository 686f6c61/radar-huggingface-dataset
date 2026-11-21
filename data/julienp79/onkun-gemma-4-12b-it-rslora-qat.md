# julienp79/onkun-gemma-4-12b-it-rslora-qat

## Resumen

onkun-gemma-4-12b-it-rslora-qat es un ajuste fino especializado del modelo google/gemma-4-12B-it-qat-q4_0-unquantized, desarrollado por julienp79 y publicado en Hugging Face. Su proposito no es actuar como asistente general, sino como etiquetador (tagger) dedicado: dada una palabra japonesa y, opcionalmente, su lectura en kana, el modelo segmenta la palabra en caracteres y determina el tipo de lectura de cada kanji (on-yomi, kun-yomi, jukujikun, kana u otro). Esta tarea, aparentemente acotada, es relevante para pipelines de procesamiento de lengua japonesa que necesitan furigana preciso por caracter, algo que los modelos generalistas resuelven con una fiabilidad limitada.

El modelo se construye sobre un transformer decoder-only de aproximadamente 12 mil millones de parametros (11.959.730.224 segun los pesos safetensors), ajustado mediante QLoRA con RS-LoRA y SFT sobre el turno del asistente. La innovacion clave no esta en la arquitectura, que hereda intacta del modelo base, sino en el proceso de generacion de etiquetas: todos los datos de entrenamiento y evaluacion se derivan de forma determinista de diccionarios (JmdictFurigana, KANJIDIC2, UniDic), sin intervencion de ningun LLM como anotador. Esto evita la contaminacion circular tipica de los datasets sinteticos.

El modelo es relevante ahora porque demuestra que un ajuste fino pequeno y barato (una sola RTX 3060 durante 6,1 horas) sobre un modelo base cuantizado con QAT puede superar de forma sustancial al modelo original en una tarea linguistica estrecha: en el conjunto de test de 1.000 palabras con lectura dada, la precision por kanji pasa de 0,867 a 0,982 y el acierto exacto de palabra completa de 0,680 a 0,966. El repositorio incluye pesos fusionados en bf16, el adaptador PEFT crudo y versiones GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajuste fino con RS-LoRA / QLoRA |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: f16, Q8_0, Q5_K_M, Q4_K_M, Q2_K; base entrenado en 4-bit fp4 (QAT) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Gemma (segun model card); campo de licencia del repo: no disponible |
| Formato de pesos | safetensors (bf16 fusionado), adaptador PEFT, GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 4, en su variante instruct y entrenada con quantisation-aware training (QAT) en formato q4_0. El ajuste se realizo con QLoRA sobre una base de 4 bits fp4, aplicando RS-LoRA (r = 32, alpha = 32, `use_rslora` con escala alpha/sqrt(r) = 5,657, dropout 0) sobre todas las proyecciones de atencion y MLP del modelo de lenguaje. El entrenamiento fue SFT sobre el turno del asistente unicamente, con AdamW de 8 bits, learning rate 1e-4, warmup del 3 %, batch efectivo de 16, una epoca (1.459 pasos) y semilla 20261118. Todo el proceso cupo en una RTX 3060 de 12 GB durante 6,1 horas, con un pico de VRAM de 10,9 GB. La fusion final se calculo como W' = W + 5,657 · (B @ A) en fp32 y se guardo en bf16.

El dataset consta de 23.337 ejemplos: 17.337 con la lectura proporcionada (modo A) y 6.000 sin ella (modo B), extraidos solo del split de entrenamiento. La innovacion metodologica mas destacable es que las etiquetas nunca provienen de un LLM: JmdictFurigana aporta la segmentacion por kanji de cada par (palabra, lectura) desde JMdict y JMnedict; el kana de cada segmento se contrasta con las lecturas on y kun de KANJIDIC2 aplicando reglas explicitas para cambios foneticos (rendaku, geminacion, etc.); y el origen de palabra de UniDic se usa como verificacion cruzada. Los pares que las reglas no pueden resolver se ponen en cuarentena y no se usan ni para entrenar ni para evaluar. La particion se hace por lema (train / dev / test), de modo que ninguna palabra evaluada se vio durante el entrenamiento.

## Capacidades

- Etiquetado del tipo de lectura por kanji: clasifica cada caracter como `on`, `kun`, `jukujikun`, `kana` u `other`, con la lectura kana correspondiente a cada segmento.
- Segmentacion de palabras japonesas en unidades por caracter, incluyendo palabras mixtas como 重箱 (on + kun) y 湯桶 (kun + on).
- Manejo de cambios foneticos: rendaku (場 → ば), geminacion y otras transformaciones cubiertas por las reglas de anotacion.
- Modo A (lectura dada): recibe la palabra y su lectura estandar y devuelve el JSON de segmentos con alta fiabilidad.
- Modo B (lectura no dada): el modelo infiere tambien la lectura estandar de la palabra, con menor fiabilidad segun el autor.
- Salida estructurada: responde con un unico objeto JSON con el esquema `{"segments": [{"text", "reading", "type"}]}`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente que no es un asistente general.
- Capacidades multilingues: limitadas a japones e ingles; el prompt de sistema esta en ingles y la tarea es exclusivamente japonesa.
- Capacidad especial: modo thinking desactivado en el uso recomendado (decodificacion greedy, temperatura 0).

## Casos de uso

- Generacion de furigana por caracter en textos japoneses: el modelo recibe cada palabra y su lectura y devuelve que parte del kana corresponde a cada kanji, lo que permite anotar ruby text de forma precisa en articulos, subtitulos o materiales didacticos.
- Ensenanza de japones como lengua extranjera: distinguir on-yomi de kun-yomi por caracter es una de las dificultades centrales del aprendizaje; el modelo puede alimentar ejercicios y fichas de vocabulario con la clasificacion ya resuelta.
- Construccion de diccionarios y bases de datos lexicas: el tagger puede procesar entradas de JMdict o de corpus propios para anadir metadatos de tipo de lectura por segmento de forma automatica y auditable.
- Preprocesamiento para sintesis de voz (TTS): conocer la lectura exacta y su origen por kanji ayuda a desambiguar la pronunciacion antes de la conversion texto-a-fonema en sistemas de lectura en voz alta en japones.
- Normalizacion y enriquecimiento de corpus para NLP: pipelines de tokenizacion, analisis morfologico o alineamiento palabra-lectura pueden usar la salida JSON como capa de anotacion determinista y verificable.
- Investigacion en linguistica computacional: el modelo sirve como referencia empirica de hasta donde llega un ajuste fino pequeno sobre un modelo cuantizado en una tarea estrecha, con etiquetas derivadas de diccionarios y particion por lema sin fuga de datos.
- Despliegue ligero en local: las versiones GGUF (Q4_K_M como archivo de referencia) permiten servir el tagger con llama.cpp en una maquina modesta, integrado como endpoint HTTP compatible con la API de chat completions.

## Benchmarks y rendimiento

Los resultados publicados corresponden al archivo de release Q4_K_M, con el prompt de entrenamiento, decodificacion greedy y thinking desactivado. La linea base es Gemma 4 12B QAT Q4_0 con su mejor prompt (few-shot, paso a paso). Δ es pareado, con intervalo de confianza bootstrap del 95 %. El split de test se mantuvo apartado de todas las decisiones de entrenamiento y diseno.

Test split, 1.000 palabras, lectura dada (modo A):

| Modelo | Precision por tipo de kanji | Acierto exacto de palabra completa |
|---|---|---|
| Gemma 4 12B base (mejor prompt) | 0,867 | 0,680 |
| onkun-gemma-4-12b-it-rslora-qat | 0,982 | 0,966 |
| Δ (pareado) | +11,4 [+9,6, +13,4] | +28,6 [+25,8, +31,5] |

Los resultados del modo B (lectura no dada) y los desgloses adicionales por tipo de lectura aparecen truncados en la informacion disponible; el autor advierte que en ese modo el modelo tambien debe aportar la lectura, lo que resulta menos fiable. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 24 GB para los pesos fusionados de ~12 mil millones de parametros, mas overhead de contexto y activaciones; se recomienda GPU de 24 GB o superior (RTX 3090/4090, A100, H100).
- VRAM estimada con GGUF Q4_K_M: aproximadamente 8-10 GB, lo que permite ejecucion en GPU consumer de 8-12 GB; el propio autor entreno en una RTX 3060 de 12 GB con un pico de 10,9 GB.
- Otras cuantizaciones GGUF: Q8_0 y Q5_K_M requieren mas memoria (del orden de 13 y 9-10 GB respectivamente, estimacion orientativa); Q2_K reduce el requisito pero con mayor perdida de calidad.
- GPU recomendadas: RTX 4090 o A100/H100 para la version bf16 con margen; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para las versiones GGUF cuantizadas.
- Opciones de despliegue: `transformers` con `device_map="auto"` para los pesos fusionados; `llama.cpp` / `llama-server` con `--jinja -c 4096` para los GGUF; PEFT para cargar el adaptador sobre el modelo base.
- Advertencia de despliegue: `convert_lora_to_gguf.py` ignora `use_rslora`, por lo que el adaptador convertido a GGUF se escala por alpha/r = 1,0 en lugar de alpha/sqrt(r) = 5,657 y rinde a ~18 % de su fuerza entrenada; debe pasarse `--lora-scaled adapter.gguf:5.657` o, preferiblemente, usar los GGUF fusionados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onkun-gemma-4-12b-it-rslora-qat | ~12 B | no disponible | Tagger especializado de tipos de lectura de kanji | Gemma (segun model card) | Hugging Face (safetensors, PEFT, GGUF) |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~12 B | no disponible | Asistente general instruct con QAT | Gemma | Hugging Face (modelo base) |
| Gemma 4 12B base con prompt few-shot | ~12 B | no disponible | Etiquetado por prompt sin ajuste | Gemma | Uso directo via API o local |

La comparacion cuantitativa disponible se limita al propio modelo base: en el test de 1.000 palabras en modo A, el ajuste fino supera a Gemma 4 12B con su mejor prompt en 11,4 puntos de precision por kanji y 28,6 puntos de acierto exacto de palabra. No se dispone de comparaciones con otros taggers especializados de lectura japonesa (por ejemplo, herramientas basadas en reglas o en modelos mas pequenos) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado, no asistente general: el autor advierte explicitamente de efectos secundarios si se usa fuera de la tarea; el prompt de sistema y el formato de salida estan fijados por el entrenamiento.
- El modo B (sin lectura dada) es menos fiable que el modo A, ya que el modelo debe inferir la lectura ademas de clasificarla.
- Riesgo de alucinacion en lecturas no vistas o poco frecuentes: aunque las etiquetas de entrenamiento son deterministas, el modelo puede generalizar incorrectamente a palabras fuera de la distribucion de los diccionarios fuente.
- Cobertura limitada a japones e ingles; no se ha validado para otras lenguas ni para texto mixto fuera del japones.
- Longitud de contexto no documentada en la informacion disponible; el ejemplo de llama.cpp usa `-c 4096`, lo que sugiere un uso previsto con contextos cortos.
- Restricciones de licencia: la model card declara licencia Gemma, que impone condiciones de uso (incluida la politica de uso aceptable de Google) y requiere revision antes de uso comercial; el campo de licencia del repositorio figura como no disponible.
- El adaptador PEFT crudo no es fiable en llama.cpp por el problema de escala de rsLoRA; deben usarse los pesos fusionados o los GGUF fusionados.
- El autor senala que incluso con la escala correcta, el adaptador aplicado sobre la base Q4_0 rinde peor en tareas generales que el modelo fusionado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente por terceros.
- Fecha de creacion del repositorio (2026-11-21) posterior a la del conocimiento de referencia habitual; verificar la vigencia de los enlaces y de la informacion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienp79/onkun-gemma-4-12b-it-rslora-qat
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- JMdict / JMnedict (diccionarios fuente de las etiquetas): no disponible en la informacion proporcionada
- JmdictFurigana: no disponible en la informacion proporcionada
- KANJIDIC2: no disponible en la informacion proporcionada
- UniDic: no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
