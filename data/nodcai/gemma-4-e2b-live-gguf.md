# nodcai/gemma-4-E2B-live-gguf

## Resumen

`gemma-4-E2B-live-gguf` es un empaquetado en un único archivo GGUF del modelo multimodal Gemma 4 E2B instruction-tuned de Google, preparado por el desarrollador nodcai para su pipeline de voz local `gemmalive.cpp`. El archivo no es solo una cuantización del modelo base: incluye el modelo de lenguaje, el codificador de audio, el codificador de visión (que la herramienta no carga) y dos cabeceras clasificadoras pequeñas entrenadas específicamente para detectar el final del turno del usuario y si el habla va dirigida al asistente. El resultado es un artefacto autocontenido pensado para asistentes de voz en streaming que escuchan mientras el usuario habla.

El modelo base es `google/gemma-4-E2B-it`, con 5.105.092.333 parámetros totales según los safetensors del repositorio original. La cuantización del modelo de lenguaje es la XS de precisión mixta de TheStage AI (Q3_K_S), mientras que los codificadores van en Q8_0 y las cabeceras en F32. El archivo final ocupa 2,29 GB y está publicado bajo licencia Apache 2.0.

Su relevancia es doble: por un lado demuestra un patrón de despliegue de voz totalmente local en C++ sobre ggml; por otro, incorpora detección de turno y de destinatario como cabeceras ligeras sobre los estados ocultos de Gemma, una alternativa a los detectores de silencio fijos. La contrapartida es que el archivo es específico para `gemmalive.cpp`: llama.cpp lo rechaza por el número inesperado de tensores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con codificador de audio y codificador de visión; cabeceras clasificadoras MLP sobre estados ocultos |
| Parámetros totales | 5.105.092.333 (modelo base); el GGUF distribuido incluye además codificadores y cabeceras |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Modelo de lenguaje: XS mixed-precision de TheStage AI (Q3_K_S); codificadores audio/visión: Q8_0; cabeceras: F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (ggml), un único archivo `gemma-4-E2B-live-XS.gguf` de 2,29 GB |

## Arquitectura y entrenamiento

El archivo combina varias piezas: el modelo de lenguaje Gemma 4 E2B en cuantización XS de TheStage AI (1,72 GB), el codificador de audio y su proyector en Q8_0 (330 MB), el codificador de visión y su proyector en Q8_0 (227 MB, no cargado por gemmalive) y dos cabeceras en F32 (3,2 MB). Todos los tensores y metadatos proceden byte a byte de los archivos fuente; solo se reescriben `general.name` y `general.description`. El GGUF conserva la arquitectura `gemma4` con sus metadatos `gemma4.*` y `tokenizer.*`, seguidos de los bloques `clip.*` para los codificadores y `heads.*` para las cabeceras.

Las cabeceras son clasificadores pequeños sobre los estados ocultos de Gemma al final del audio escuchado: una mezcla aprendida de cuatro capas, normalizada, seguida de un MLP con 256 unidades ocultas. La cabecera de fin de turno usa las capas 8, 10, 12 y 13 con umbral 0,5; la de destinatario usa las capas 8, 14, 17 y 21 con umbral 0,3. Se entrenaron con características extraídas bajo múltiples system prompts, tras conversaciones de hasta tres turnos hablados y las respuestas del modelo. La de fin de turno se entrenó con `pipecat-ai/smart-turn-data-v3.2-train` (CC BY 4.0) y enunciados sintéticos con pausa interna generados con voces Piper; la de destinatario, con peticiones sintéticas, interrupciones, conversación lateral, backchannels y habla de fondo de voces Piper, textos de OpenAssistant OASST2 (Apache 2.0), LibriSpeech (CC BY 4.0) y clips de Smart Turn v3.2. El ensamblado se realizó con `training/turn/combine.py` de gemmalive.cpp, que verifica que las cabeceras se entrenaron sobre este modelo y codificador concretos.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Gemma 4 E2B instruction-tuned.
- Comprensión de audio: el codificador de audio y su proyector permiten entrada audio-text-to-text.
- Detección de fin de turno: cabecera que distingue si el usuario ha terminado de hablar o solo hace una pausa (precisión del 92,8 %, 4,5 % de falsos positivos, 2,6 % de falsos negativos sobre 31.527 clips del test set de Smart Turn v3.2).
- Detección de destinatario: cabecera que distingue si el habla va dirigida al asistente frente a conversación lateral, backchannels o habla de fondo (precisión del 91,6 %, 4,7 % de falsos positivos, 3,7 % de falsos negativos sobre 19.500 clips reservados por voces y con textos no vistos en entrenamiento).
- Funcionamiento en streaming: el modelo escucha mientras el usuario habla y la respuesta se sintetiza con `livevoice.cpp` a medida que se escribe.
- Integración como biblioteca: el archivo se usa como `Llm::Params::model_path` en aplicaciones que enlazan la biblioteca `gemmalive`, y `TurnHead::path_for()` localiza las cabeceras dentro del propio GGUF.
- Capacidades de visión: el codificador de visión está presente en el archivo, pero gemmalive no lo carga; no se documenta su uso en este pipeline.
- Tool calling, function calling, agentes multi-paso y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de voz local en tiempo real: `gemmalive.cpp` carga este único archivo y procesa audio del micrófono; la cabecera de fin de turno evita que una pausa fija corte al usuario a mitad de frase, y la de destinatario evita responder a conversaciones que no van dirigidas al asistente.
- Transcripción y respuesta por lotes desde fichero: la CLI acepta `-i question.wav -o reply.wav` con `--model` apuntando a este GGUF, útil para probar el pipeline sin micrófono ni integración adicional.
- Integración en aplicaciones de escritorio o embebidas en C++: al enlazar la biblioteca `gemmalive` y usar `Llm::Params::model_path`, el archivo sirve como único artefacto de modelo para sesiones que escuchan por micrófono.
- Prototipado de detección de turno: las cabeceras incluidas permiten evaluar políticas de fin de turno y de destinatario sin entrenar clasificadores propios, con métricas publicadas sobre Smart Turn v3.2 y un conjunto reservado por voces.
- Despliegue en máquinas sin GPU dedicada: con 2,29 GB en disco y cuantización Q3_K_S del modelo de lenguaje, el archivo está pensado para ejecución local en C++ sobre ggml, aunque no se publican requisitos de VRAM ni latencias.
- Comparación de configuraciones de asistente de voz: el mismo autor publica `nodcai/gemma-4-E4B-live-gguf` con el mismo esquema para Gemma 4 E4B, más grande y lento pero con cabeceras más precisas, lo que permite contrastar calidad y coste en el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo de lenguaje en la información disponible. Las únicas métricas publicadas corresponden a las cabeceras añadidas:

| Cabecera | Capas | Umbral | Precisión | Falsos positivos | Falsos negativos | Conjunto de evaluación |
|---|---|---:|---:|---:|---:|---|
| Fin de turno | 8, 10, 12, 13 | 0,5 | 92,8 % | 4,5 % | 2,6 % | 31.527 clips de Smart Turn v3.2 test |
| Destinatario | 8, 14, 17, 21 | 0,3 | 91,6 % | 4,7 % | 3,7 % | 19.500 clips reservados por voces, textos no vistos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el archivo está pensado para `gemmalive.cpp` sobre ggml, que puede ejecutar en CPU, pero no se documentan requisitos ni rendimiento por hardware.
- Opciones de despliegue: `gemmalive.cpp` (clonar, compilar con CMake y ejecutar la CLI o enlazar la biblioteca); `livevoice.cpp` para la síntesis de voz. llama.cpp rechaza este archivo por el número inesperado de tensores; para llama.cpp deben usarse los archivos fuente (`TheStageAI/gemma-4-E2B-it-GGUF` y `ggml-org/gemma-4-E2B-it-GGUF`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización del LM | Licencia | Enfoque |
|---|---|---|---|---|---|
| nodcai/gemma-4-E2B-live-gguf | 5.105.092.333 (base) | no disponible | XS mixed-precision (Q3_K_S) | Apache 2.0 | Asistente de voz local con cabeceras de turno y destinatario |
| nodcai/gemma-4-E4B-live-gguf | no disponible | no disponible | no disponible | no disponible | Mismo esquema sobre Gemma 4 E4B; más grande y lento, cabeceras más precisas |
| google/gemma-4-E2B-it | 5.105.092.333 | no disponible | pesos originales (safetensors) | licencia Gemma 4 | Modelo base instruction-tuned, sin cabeceras ni empaquetado para voz |
| TheStageAI/gemma-4-E2B-it-GGUF | 5.105.092.333 (base) | no disponible | XS mixed-precision (Q3_K_S) | no disponible | Cuantización GGUF del modelo de lenguaje, sin codificadores ni cabeceras |
| ggml-org/gemma-4-E2B-it-GGUF | 5.105.092.333 (base) | no disponible | Q8_0 en mmproj | no disponible | Codificadores multimodales GGUF (audio y visión) para llama.cpp |

## Limitaciones y advertencias

- El archivo es específico de `gemmalive.cpp`: llama.cpp lo rechaza con `wrong number of tensors` por los tensores adicionales de codificadores y cabeceras. Para llama.cpp hay que usar los archivos fuente.
- Las cabeceras leen los estados ocultos de esta cuantización concreta: no son portables a otra cuantización ni a otro modelo Gemma, y deben reentrenarse si cambia el modelo o el codificador.
- Las métricas de las cabeceras son sobre conjuntos concretos (Smart Turn v3.2 y 19.500 clips reservados por voces); el rendimiento en dominios, idiomas o condiciones acústicas distintas no está documentado.
- El codificador de visión está incluido en el archivo pero gemmalive no lo carga; no se documenta ninguna capacidad de visión utilizable en este pipeline.
- Idiomas soportados: no disponible; no se especifica cobertura multilingüe del modelo base ni de las cabeceras.
- Longitud de contexto: no disponible.
- Sesgos conocidos y riesgo de alucinación del modelo de lenguaje: no se documentan en la información proporcionada; al ser un modelo instruction-tuned de propósito general, cabe esperar los riesgos habituales de generación, pero no hay datos concretos publicados.
- Licencia Apache 2.0 en el repositorio, con enlace a la licencia de Gemma 4 de Google; conviene revisar los términos de esa licencia para uso comercial del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni informes independientes de calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nodcai/gemma-4-E2B-live-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante mayor del mismo autor: https://huggingface.co/nodcai/gemma-4-E4B-live-gguf
- Pipeline de voz: https://github.com/nodcai/gemmalive.cpp
- Síntesis de voz: https://github.com/nodcai/livevoice.cpp
- Cuantización XS del modelo de lenguaje: https://huggingface.co/TheStageAI/gemma-4-E2B-it-GGUF
- Codificadores multimodales GGUF: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Dataset de test de Smart Turn v3.2: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test
- Dataset de entrenamiento de Smart Turn v3.2: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Voces Piper: https://github.com/rhasspy/piper
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
