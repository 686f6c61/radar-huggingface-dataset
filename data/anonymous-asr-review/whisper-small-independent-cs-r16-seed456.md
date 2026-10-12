# anonymous-asr-review/whisper-small-independent-cs-r16-seed456

## Resumen

El modelo `whisper-small-independent-cs-r16-seed456` es un adaptador LoRA de rango 16 (alpha 32, semilla 456) entrenado sobre `openai/whisper-small` para reconocimiento automatico del habla (ASR) en escenarios de code-switching entre sinhalés (`si`) e inglés (`en`). Lo publica la cuenta `anonymous-asr-review`, que se identifica explicitamente como material suplementario anonimo para revision por pares: no es un modelo de produccion, sino un artefacto experimental asociado a un estudio cuya identidad y resultados no se detallan en la informacion disponible.

El adaptador se entrenó de forma independiente ("independent") y forma parte de una estrategia emparejada: la propia model card indica que, para reproducir la estrategia emparejada, debe combinarse con el adaptador de sinhalés de la misma semilla siguiendo los pesos especificados en el experimento. Esto sugiere un diseno de mezcla o interpolacion de adaptadores especificos por idioma para mejorar el rendimiento en habla con mezcla de lenguas.

Al estar construido sobre Whisper-small, hereda la arquitectura transformer encoder-decoder de 244 M de parametros, la entrada de audio a 16 kHz y ventanas de 30 segundos. Su relevancia es metodologica: sirve como evidencia reproducible (semilla y rango fijados, publicacion de pesos) en el estudio comparativo de estrategias de adaptacion LoRA para ASR con code-switching, un escenario donde los modelos multilingues genericos suelen degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptadores LoRA de rango 16 insertados sobre el modelo base |
| Parametros totales | 244 M correspondientes al modelo base openai/whisper-small; el numero de parametros anadidos por el adaptador no se especifica en la informacion disponible |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible como metrica de texto; el modelo base procesa ventanas de audio de 30 s (1500 fotogramas de espectrograma log-Mel) y el decodificador opera con secuencias de 448 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se publican en safetensors con precision no declarada. El modelo base admite fp16, int8 y otras cuantizaciones con las herramientas habituales |
| Idiomas soportados | Sinhalés (`si`) e inglés (`en`), orientado a habla con code-switching entre ambos |
| Licencia | No disponible (el modelo base openai/whisper-small se distribuye bajo licencia Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos del modelo base se descargan por separado |

Hiperparametros declarados: rango LoRA 16, alpha 32, semilla 456. Tamano del repositorio: 0,0 GB (redondeado, consistente con un adaptador de pocos megabytes).

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder con normalizacion previa a las capas, conexiones residuales y atencion multi-cabeza. La entrada es audio remuestreado a 16 kHz convertido en espectrogramas log-Mel de 80 canales; el encoder procesa ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de control de idioma y de tarea (transcripcion o traduccion). Sobre este modelo congelado se anaden adaptadores LoRA de rango 16 y alpha 32 en las proyecciones de atencion, de modo que el ajuste se realiza con una fraccion minima de parametros entrenables.

La model card no documenta volumen de datos, composicion del corpus, horas de audio, tecnicas de aumento de datos, ni si hubo etapas de refinamiento tipo RLHF o DPO (no aplicables en la practica a un adaptador ASR de este tipo). Tampoco se detallan la tasa de aprendizaje, el numero de pasos ni el hardware de entrenamiento. La innovacion declarada es metodologica: el adaptador se entrena de forma independiente y se publica con semilla fija (456) y rango fijo (16), de manera que puede combinarse con un adaptador de idioma (sinhalés) de la misma semilla bajo los pesos definidos en el experimento, permitiendo reproducir la estrategia emparejada frente a la estrategia de adaptador unico.

La carga se realiza con `transformers` y `peft`: se descarga el adaptador con `snapshot_download`, se instancia `WhisperForConditionalGeneration` desde `openai/whisper-small` y se aplica `PeftModel.from_pretrained(...).merge_and_unload()` para fusionar los pesos del adaptador en el modelo base antes de la inferencia.

## Capacidades

- Reconocimiento automatico del habla (ASR) en sinhalés e inglés, con enfasis en enunciados que alternan ambas lenguas dentro de una misma conversacion (code-switching).
- Transcripcion de audio de 16 kHz en fragmentos de hasta 30 segundos por pasada, con la posibilidad de encadenar ventanas para audio mas largo (sin soporte nativo documentado de marcas de tiempo).
- Control de idioma y de tarea mediante los tokens especiales de Whisper, condicionando la salida a transcripcion o traduccion.
- Capacidad de traduccion de voz heredada del modelo base (por ejemplo, audio en sinhalés a texto en inglés), aunque no esta verificada ni evaluada para este adaptador en la informacion disponible.
- No dispone de tool calling ni de function calling: es un modelo puramente de secuencia a secuencia de audio a texto.
- No dispone de capacidades de agente, razonamiento multi-paso, uso de herramientas ni memoria conversacional.
- No dispone de vision, audio generativo ni modos de "pensamiento" extendido.
- Multilingue limitado a los dos idiomas del ajuste; el resto de los idiomas soportados por Whisper-small podria degradarse respecto al modelo base, aunque no hay datos que lo confirmen.

## Casos de uso

- Transcripcion de reuniones bilingues sinhalés-inglés: el adaptador esta ajustado especificamente para enunciados que alternan ambos idiomas, un escenario en el que el Whisper-small original comete errores de cambio de idioma y sustituciones lexicas.
- Subtitulado de contenido audiovisual de Sri Lanka: series, entrevistas y videos donde los hablantes mezclan inglés tecnico con sinhalés coloquial, con salida de texto lista para posproduccion.
- Atencion al cliente en centros de contacto de Sri Lanka: transcripcion de llamadas para control de calidad, busqueda de texto completo y analitica, donde el uso de ingles y sinhalés en la misma frase es habitual.
- Documentacion clinica dictada: profesionales que dictan informes mezclando terminologia medica en ingles con narrativa en sinhalés, con la transcripcion como paso previo a la estructuración del informe.
- Generacion de corpus y evaluacion academica: el modelo es material suplementario de un articulo en revision, por lo que su uso principal es reproducir el experimento (semilla 456, rango 16) y comparar la estrategia de adaptadores independientes frente a la emparejada.
- Investigacion en adaptacion eficiente de parametros: sirve como punto de partida para estudiar la fusion de adaptadores LoRA por idioma en tareas de ASR con mezcla de lenguas, dado que los hiperparametros y la semilla estan fijados y documentados.
- Prototipado de asistentes de voz locales: al ser un adaptador de un modelo de 244 M de parametros, puede fusionarse y ejecutarse en hardware de gama de consumo para probar flujos de voz sin enviar audio a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card se limita a indicar que se trata de un modelo suplementario anonimo para revision por pares y que la estrategia emparejada requiere combinar este adaptador con el adaptador de sinhalés de la misma semilla segun los pesos del experimento. No se proporcionan valores de WER, CER, tasas de code-switching ni comparaciones numericas frente al modelo base `openai/whisper-small` u otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del modelo base, ya que no hay cifras publicadas): en fp16, aproximadamente 0,5 GB para los pesos de Whisper-small mas el coste de activaciones y memoria de trabajo, lo que situa el consumo tipico en el rango de 1 a 2 GB para audio de 30 segundos. En int8, los pesos bajan a unos 0,25 GB.
- El adaptador LoRA en si es de tamano despreciable frente al modelo base (el repositorio se reporta como 0,0 GB redondeado).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Ejemplos practicos: RTX 3060, RTX 4060, RTX 4090, T4, L4. Las A100 y H100 son innecesarias para un modelo de 244 M de parametros y solo se justificarian para procesar grandes volumenes en lote.
- Cabe holgadamente en GPU de consumo, e incluso en CPU: la inferencia en CPU es viable para transcripcion por lotes o en tiempo casi real con implementaciones optimizadas.
- Opciones de despliegue: `transformers` con `peft` (requiere `merge_and_unload()` antes de la inferencia), exportacion a CTranslate2 para usar con faster-whisper, conversion a ONNX o GGML/GGUF para whisper.cpp, o integracion en servidores de inferencia. No se documenta soporte directo del adaptador en vLLM, TGI, Ollama ni llama.cpp sin fusionar previamente los pesos.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-independent-cs-r16-seed456 | 244 M (base) + adaptador LoRA rango 16 | 30 s (base) | si, en (code-switching) | No disponible | Adaptador PEFT en HuggingFace, 0 descargas |
| openai/whisper-small | 244 M | 30 s | ~99 idiomas | Apache 2.0 | Pesos completos en HuggingFace, ampliamente desplegado |
| openai/whisper-large-v3 | 1550 M | 30 s | ~99 idiomas | Apache 2.0 | Pesos completos en HuggingFace, mayor coste de inferencia |

No se dispone de otros adaptadores de code-switching sinhalés-inglés comparables en la informacion proporcionada, ni de metricas que permitan situar este adaptador por encima o por debajo del modelo base o de whisper-large-v3 en la tarea concreta. La comparacion se limita, por tanto, a tamano, ventana de audio, cobertura de idiomas y licencia.

## Limitaciones y advertencias

- Artefacto de revision por pares: el autor es anonimo y el modelo se publica como material suplementario de un articulo no identificado. No debe tratarse como un modelo estable ni mantenido.
- Licencia no disponible: al no declararse licencia para el adaptador, no hay base juridica clara para uso comercial. Los pesos base si son Apache 2.0, pero eso no cubre automaticamente el adaptador.
- Sin datos de entrenamiento: no se especifican corpus, horas de audio, composicion linguistica ni criterios de filtrado, por lo que no es posible evaluar sesgos de dominio, acento o genero.
- Sin evaluacion publicada: no hay WER ni CER, ni comparaciones con el modelo base, de modo que no se puede verificar que el adaptador mejore realmente la transcripcion en code-switching.
- Riesgo de alucinacion inherente a Whisper: en silencios, ruido o audio musical, los modelos de esta familia pueden generar texto repetido o inventado. No hay indicios de que el adaptador lo corrija.
- Limitacion de contexto: ventanas de 30 segundos por pasada; el audio largo requiere segmentacion externa y el alineamiento entre segmentos puede degradar la coherencia.
- Cobertura de idiomas restringida: el ajuste se limita a sinhalés e inglés y puede degradar el rendimiento del modelo base en otros idiomas.
- Dependencia de la estrategia emparejada: los resultados completos del experimento probablemente requieren combinar este adaptador con el de sinhalés de la misma semilla; usarlo de forma aislada puede no reproducir el escenario evaluado.
- Formato de audio obligatorio: se debe usar audio a 16 kHz y configurar el idioma y los parametros de generacion de la tarea; ignorarlo produce salidas incorrectas.
- Sin garantias de produccion: cero descargas y cero valoraciones, sin historial de uso ni pruebas de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-independent-cs-r16-seed456
- Modelo base: https://huggingface.co/openai/whisper-small
- Biblioteca PEFT: https://huggingface.co/docs/peft
- Biblioteca Transformers (Whisper): https://huggingface.co/docs/transformers/model_doc/whisper
- Busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los resultados devueltos corresponden a contenidos no relacionados con la publicacion (colectivo de hacktivismo "Anonymous" y una marca de calzado homonima), por lo que se descartan como fuentes.
