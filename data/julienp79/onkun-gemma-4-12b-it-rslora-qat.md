# julienp79/onkun-gemma-4-12b-it-rslora-qat

## Resumen

onkun-gemma-4-12b-it-rslora-qat es un modelo especializado en el etiquetado de tipos de lectura de kanji en japones. Desarrollado por julienp79, parte de `google/gemma-4-12B-it-qat-q4_0-unquantized` y se afina mediante QLoRA con RS-LoRA y SFT para resolver una tarea concreta: dado un termino japones y, opcionalmente, su lectura, descomponerlo en segmentos y clasificar cada kanji como lectura sinojaponesa (on), nativa (kun), jukujikun (lectura global de la palabra), kana u other. No es un asistente general, sino un etiquetador de proposito especifico que responde con un objeto JSON.

El modelo tiene 11.959.730.224 parametros y se distribuye en tres formatos: pesos fusionados en bf16 safetensors para transformers (recomendado), el adaptador RS-LoRA original en PEFT y archivos GGUF fusionados en f16, Q8_0, Q5_K_M, Q4_K_M y Q2_K para llama.cpp. Su relevancia radica en automatizar una tarea linguisticamente compleja (la desambiguacion on/kun, los cambios foneticos como el rendaku y la geminacion) que normalmente requiere diccionarios y reglas deterministas, con un modelo de lenguaje afinado que reproduce esas reglas sobre palabras que las reglas pueden etiquetar.

La licencia es Gemma, los idiomas declarados son japones e ingles, y el entrenamiento se realizo sobre 23.337 ejemplos (17.337 con lectura proporcionada y 6.000 sin ella) en una unica GPU RTX. El autor advierte explicitamente de que las metricas publicadas miden la reproduccion de reglas de diccionario, no la capacidad de superar a una busqueda en diccionario en palabras irregulares o no listadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), afinado con QLoRA + RS-LoRA |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso maximo de 640 tokens; llama.cpp se documenta con `-c 4096`) |
| Tipos de cuantizacion | GGUF: f16, Q8_0, Q5_K_M, Q4_K_M, Q2_K; base QAT Q4_0; adaptador en PEFT |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors (bf16 fusionado), PEFT (adaptador), GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, un transformer decoder-only de Gemma 4 con cuantizacion consciente del entrenamiento (QAT) en Q4_0. Sobre el se aplica QLoRA con base de 4 bits fp4, usando RS-LoRA con r = 32, alpha = 32 (`use_rslora`, escala 5.657), dropout 0, y adaptadores en todas las proyecciones de atencion y MLP del modelo de lenguaje. El ajuste es SFT sobre el turno del asistente unicamente.

Los datos de entrenamiento constan de 23.337 ejemplos del split de train: 17.337 en modo A (lectura proporcionada) y 6.000 en modo B (sin lectura, el modelo debe inferirla). Se uso AdamW de 8 bits, learning rate 1e-4 con decaimiento coseno, warmup del 3 %, batch efectivo de 16, longitud maxima de 640 tokens, 1 epoch (1.459 pasos) y semilla 20261118, todo en una sola RTX. Las etiquetas proceden de consultas a diccionario (JMdict, JMnedict, KANJIDIC2) mas reglas deterministas. La innovacion tecnica destacable es el uso de RS-LoRA sobre una base QAT y la publicacion de pesos fusionados en multiples cuantizaciones GGUF, con la advertencia de que `convert_lora_to_gguf.py` ignora `use_rslora` y escala el adaptador por alpha/r = 1.0 en lugar de alpha/√r = 5.657, por lo que se recomienda usar los GGUF fusionados.

## Capacidades

- Etiquetado de tipos de lectura de kanji: clasifica cada kanji como `on`, `kun`, `jukujikun`, `kana` u `other`.
- Segmentacion de palabras japonesas en unidades kanji/kana con su lectura correspondiente.
- Manejo de patrones de palabra: pure on, pure kun, jubako (on + kun), yuto (kun + on), mixed (tres o mas kanji con on y kun) y jukujikun.
- Cobertura de cambios foneticos: rendaku (por ejemplo, 場 → ば) y geminacion.
- Modo A: etiqueta a partir de una lectura proporcionada por el usuario.
- Modo B: infiere tambien la lectura cuando no se proporciona (menos fiable, segun el autor).
- Salida estructurada en JSON con el esquema `{"segments": [{"text", "reading", "type"}]}`.
- No soporta tool calling, agentes, vision, audio ni modo thinking; es un etiquetador de proposito especifico, no un asistente general.

## Casos de uso

- Anotacion linguistica de corpus japoneses: el modelo recibe cada palabra y su lectura y devuelve la segmentacion con el tipo de lectura de cada kanji, lo que permite generar etiquetas on/kun de forma masiva para estudios de lexico o para entrenar otros modelos.
- Generacion de furigana enriquecida: en pipelines de publicacion digital, se puede usar para asociar a cada kanji su lectura y su tipo, mejorando la calidad de las anotaciones ruby frente a una simple transcripcion fonetica.
- Ensenanza de japones como lengua extranjera: clasificar si un kanji se lee on o kun ayuda a construir ejercicios y explicaciones automaticas sobre patrones de lectura, incluidos jubako y yuto.
- Normalizacion de entradas lexicograficas: al integrarse en un sistema de gestion de diccionarios, el modelo etiqueta entradas nuevas o importadas y detecta lecturas que no encajan con las reglas deterministas.
- Preprocesamiento para sintesis de voz (TTS): la distincion on/kun y la segmentacion por kanji permiten asignar pronunciaciones mas precisas antes de la conversion texto-a-voz en japones.
- Filtrado y control de calidad de datos: ejecutando el modelo sobre un lote de palabras con lectura conocida se pueden detectar discrepancias entre la lectura esperada y la etiqueta asignada, como paso de validacion en un pipeline de datos.
- Procesamiento por lotes en local: los GGUF Q4_K_M permiten desplegar el etiquetador con llama.cpp en hardware modesto para procesar grandes volumenes de palabras sin depender de una API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que las puntuaciones de evaluacion miden como reproduce el modelo las reglas de diccionario sobre palabras que las reglas pueden etiquetar, y que quedan fuera 11.105 pares en cuarentena (6.715 de JMdict y 4.390 de JMnedict), 6.561 pares de JMdict sin segmentacion y 4.072 fuera de alcance. No se proporcionan cifras numericas de esas puntuaciones en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 11,96 mil millones de parametros, en bf16 se situaria en torno a 24 GB solo para pesos, y las versiones GGUF Q4_K_M reducen considerablemente ese requisito.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una unica RTX (modelo no especificado en la informacion disponible).
- Cabe en GPU de consumo: los GGUF Q4_K_M y Q2_K estan pensados para ello, pero no se confirma en la informacion disponible que modelos concretos de GPU de consumo lo soporten.
- Opciones de despliegue: transformers (pesos fusionados), PEFT (adaptador sobre la base), llama.cpp / llama-server (GGUF), con `--jinja -c 4096 --temp 0`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onkun-gemma-4-12b-it-rslora-qat | 11.959.730.224 | no disponible | Etiquetado on/kun de kanji | Gemma | Hugging Face (safetensors, PEFT, GGUF) |
| google/gemma-4-12B-it-qat-q4_0-unquantized | no disponible | no disponible | Asistente general (base) | Gemma | Hugging Face |
| Alternativas especializadas en lectura de kanji | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especializados en esta tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Es un etiquetador especializado, no un asistente general; usarlo fuera del prompt entrenado produce efectos secundarios segun el autor.
- Las metricas publicadas miden la reproduccion de reglas de diccionario, no el rendimiento en palabras irregulares, lecturas no listadas o palabras fuera de los diccionarios; no existe un conjunto duro etiquetado a mano.
- El tag `other` (lecturas nanori de KANJIDIC2) estaba desactivado durante el entrenamiento, por lo que el modelo nunca lo ha visto.
- El modo B (sin lectura proporcionada) es menos fiable que el modo A.
- El adaptador RS-LoRA aplicado a la base Q4_0 rinde peor en tareas generales que el modelo fusionado, incluso con la escala correcta; se recomienda usar los archivos fusionados.
- `convert_lora_to_gguf.py` ignora `use_rslora` y escala el adaptador a aproximadamente el 18 % de su fuerza entrenada; hay que pasar `--lora-scaled adapter.gguf:5.657` o usar los GGUF fusionados.
- La licencia Gemma impone condiciones de uso comercial que deben revisarse antes de produccion.
- Riesgo de alucinacion en lecturas no cubiertas por las reglas de diccionario; el autor no documenta sesgos especificos.
- Idiomas limitados a japones e ingles; no se documenta soporte multilingue adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienp79/onkun-gemma-4-12b-it-rslora-qat
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
