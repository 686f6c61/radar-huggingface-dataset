# nodcai/gemma-4-E4B-live-gguf

## Resumen
gemma-4-E4B-live-gguf es un empaquetado en un unico archivo GGUF del modelo multimodal Gemma 4 E4B (variante instruct, `google/gemma-4-E4B-it`) preparado especificamente para gemmalive.cpp, un pipeline de voz local escrito en C++ sobre ggml. Lo desarrolla el usuario nodcai y su proposito no es servir como modelo de chat general, sino habilitar asistentes de voz que escuchan al usuario mientras habla y responden por sintesis de voz en streaming. El archivo integra el modelo de lenguaje, el encoder de audio, el encoder de vision y dos cabezas clasificadoras adicionales (fin de turno y destinatario) entrenadas para este modelo concreto.

El modelo base cuenta con 7.942.424.052 parametros totales y el archivo publicado ocupa 3,47 GB, resultado de aplicar la cuantizacion mixta XS de TheStage AI (Q3_K_S) al modelo de lenguaje y Q8_0 a los encoders. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia propia de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. Su relevancia actual radica en que resuelve el problema de la deteccion de turno y de destinatario en asistentes de voz, evitando que un silencio fijo corte la conversacion o que el asistente responda a conversaciones ajenas.

Las dos cabezas anadidas son clasificadores ligeros (MLP de 256 unidades ocultas sobre una mezcla aprendida de cuatro capas de estados ocultos de Gemma) que alcanzan un 94,0 % y un 94,3 % de precision respectivamente en sus conjuntos de prueba. El archivo no es compatible con llama.cpp estandar, que lo rechaza por el numero inesperado de tensores, y esta pensado exclusivamente para el runtime gemmalive.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B) con encoder de audio, encoder de vision y dos cabezas clasificadoras (fin de turno y destinatario) |
| Parametros totales | 7.942.424.052 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo de lenguaje en XS mixed-precision (Q3_K_S de TheStage AI); encoder de audio y proyector en Q8_0; encoder de vision y proyector en Q8_0; cabezas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (un unico archivo `gemma-4-E4B-live-XS.gguf`, 3,47 GB) |

## Arquitectura y entrenamiento
El archivo es un GGUF con arquitectura `gemma4` que contiene, en este orden, el modelo de lenguaje con sus metadatos `gemma4.*` y `tokenizer.*`, seguido de los encoders de audio y vision (metadatos `clip.*`, tensores `a.*`, `mm.a.*`, `v.*`, `mm.*`) y de las dos cabezas (metadatos `heads.*`, tensores `end_of_turn.*`, `addressee.*`). Todos los tensores proceden byte a byte de los archivos fuente: el modelo de lenguaje de `TheStageAI/gemma-4-E4B-it-GGUF` (commit `1f3817e3`) y el proyector multimodal de `ggml-org/gemma-4-E4B-it-GGUF` (commit `27cd6836`). Solo se reescribieron los metadatos `general.name` y `general.description`.

Las cabezas son clasificadores sobre los estados ocultos de Gemma al final del audio escuchado: una mezcla aprendida de cuatro capas, normalizada, seguida de un MLP de 256 unidades ocultas. La cabeza de fin de turno usa las capas 8, 9, 10 y 22 con umbral 0,5; la de destinatario usa las capas 10, 12, 16 y 22 con umbral 0,3. Se entrenaron con caracteristicas extraidas bajo multiples system prompts y tras conversaciones de hasta tres turnos hablados, por lo que generalizan a cualquier system prompt. Los datos de entrenamiento incluyen `pipecat-ai/smart-turn-data-v3.2-train` (CC BY 4.0), enunciados sinteticos con pausa interna generados con voces Piper, peticiones sinteticas con textos de OpenAssistant OASST2 (Apache 2.0), LibriSpeech (CC BY 4.0) y clips de Smart Turn v3.2. El ensamblado se realizo con `training/turn/combine.py` de gemmalive.cpp, que verifica que las cabezas se entrenaron sobre este modelo y encoder concretos.

## Capacidades
- Comprension de audio en streaming: el modelo escucha al usuario mientras habla, no solo tras el silencio.
- Generacion de texto con salida hablada simultanea mediante livevoice.cpp (sintesis de voz en streaming).
- Deteccion de fin de turno: distingue si el usuario ha terminado o solo hace una pausa (94,0 % de precision, 3,6 % de falsos positivos, 2,4 % de falsos negativos sobre 31.527 clips de Smart Turn v3.2).
- Deteccion de destinatario: discrimina si el habla va dirigida al asistente frente a conversacion lateral, backchannels o habla de fondo (94,3 % de precision, 3,6 % de falsos positivos, 2,0 % de falsos negativos sobre 19.500 clips retenidos).
- Capacidad multimodal de vision presente en el archivo (encoder y proyector Q8_0), aunque gemmalive no la carga.
- Soporte de conversaciones multi-turno habladas con contexto de hasta tres turnos en el entrenamiento de las cabezas.
- Integracion como libreria C++ (`Llm::Params::model_path`, `TurnHead::path_for()`), con herramientas y busquedas web descritas en el README de gemmalive.cpp.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente de voz local en tiempo real: gemmalive.cpp carga el archivo y procesa audio de entrada mientras livevoice.cpp sintetiza la respuesta, permitiendo conversaciones fluidas sin depender de la nube. Es adecuado porque todo el pipeline corre en C++ sobre ggml en local.
- Deteccion de turno en sistemas de atencion al cliente: la cabeza de fin de turno evita que el sistema corte al usuario durante una pausa natural, sustituyendo el temporizador de silencio fijo por una clasificacion basada en los estados ocultos del modelo.
- Filtrado de destinatario en dispositivos con microfono siempre activo: la cabeza de destinatario descarta conversacion lateral y habla de fondo, reduciendo respuestas no solicitadas en asistentes de hogar o de escritorio.
- Transcripcion y respuesta de voz en entornos sin conectividad: al ser un unico archivo GGUF de 3,47 GB con pesos cuantizados, puede desplegarse en equipos locales con recursos moderados.
- Prototipado de interfaces conversacionales por voz: el binario `gemmalive` acepta un WAV de entrada y produce un WAV de salida, lo que facilita pruebas por lotes y evaluacion de latencia.
- Investigacion sobre deteccion de turno: las cabezas y sus metadatos (`heads.<head>.*` con capas, umbral, resultados de test y datos de entrenamiento) permiten reproducir y comparar experimentos con el conjunto Smart Turn v3.2.
- Integracion en aplicaciones C++ existentes: la libreria `gemmalive` expone `Session` para escucha por microfono, lo que permite incorporar el pipeline en aplicaciones de escritorio o embebidas.

## Benchmarks y rendimiento

| Cabeza | Capas | Umbral | Precision | Falsos positivos | Falsos negativos | Conjunto de prueba |
|---|---|---:|---:|---:|---:|---|
| Fin de turno | 8, 9, 10, 22 | 0,5 | 94,0 % | 3,6 % | 2,4 % | 31.527 clips de Smart Turn v3.2 test |
| Destinatario | 10, 12, 16, 22 | 0,3 | 94,3 % | 3,6 % | 2,0 % | 19.500 clips retenidos por voces y textos no vistos |

No se han publicado resultados de benchmarks del modelo de lenguaje base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo completo ocupa 3,47 GB; con overhead de contexto y buffers de ggml, se puede estimar un uso de entre 4 y 6 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por tamano del archivo (3,47 GB) es plausible en GPUs con 8 GB o mas de VRAM, pero no se confirma en la documentacion.
- Opciones de despliegue: exclusivamente gemmalive.cpp (compilado con CMake, presets `default`); llama.cpp rechaza el archivo por el numero inesperado de tensores. Para llama.cpp deben usarse los archivos fuente de TheStageAI y ggml-org.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nodcai/gemma-4-E4B-live-gguf | 7.942.424.052 | no disponible | Voz en streaming con deteccion de turno y destinatario | Apache 2.0 | GGUF para gemmalive.cpp |
| nodcai/gemma-4-E2B-live-gguf | no disponible (variante E2B, menor) | no disponible | Igual que el anterior, mas rapido y con cabezas algo menos precisas | no disponible | GGUF para gemmalive.cpp |
| google/gemma-4-E4B-it | 7.942.424.052 (base) | no disponible | Modelo multimodal instruct general | Licencia Gemma 4 | Hugging Face |
| TheStageAI/gemma-4-E4B-it-GGUF | 7.942.424.052 (base) | no disponible | Cuantizaciones GGUF del modelo base | no disponible | GGUF |

## Limitaciones y advertencias
- El archivo no es compatible con llama.cpp: el runtime rechaza el modelo por tensores inesperados. Solo funciona con gemmalive.cpp.
- Las cabezas leen los estados ocultos de esta cuantizacion concreta: no son transferibles a otra cuantizacion ni a otro modelo Gemma, y deben reentrenarse si cambia el modelo o el encoder.
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; es necesario verificar los terminos reales antes de uso comercial.
- Riesgo de alucinacion del modelo de lenguaje base: no se documentan evaluaciones de fidelidad ni de sesgos en la informacion disponible.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; el pipeline de voz y las cabezas se entrenaron con voces Piper y datos mayoritariamente en ingles (Smart Turn, LibriSpeech, OASST2), lo que puede limitar el rendimiento en castellano.
- Longitud de contexto: no disponible; el entrenamiento de las cabezas cubre conversaciones de hasta tres turnos hablados, lo que acota su comportamiento esperado.
- El encoder de vision esta incluido en el archivo pero gemmalive no lo carga, por lo que la capacidad visual no es utilizable en este pipeline.
- El modelo esta pensado para audio; su uso como modelo de texto general no esta documentado ni validado en esta distribucion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nodcai/gemma-4-E4B-live-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante E2B: https://huggingface.co/nodcai/gemma-4-E2B-live-gguf
- Runtime gemmalive.cpp: https://github.com/nodcai/gemmalive.cpp
- Sintesis de voz livevoice.cpp: https://github.com/nodcai/livevoice.cpp
- Cuantizaciones TheStage AI: https://huggingface.co/TheStageAI/gemma-4-E4B-it-GGUF
- GGUF del proyecto ggml: https://huggingface.co/ggml-org/gemma-4-E4B-it-GGUF
- Dataset Smart Turn v3.2 test: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test
- Dataset Smart Turn v3.2 train: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-train
- Voces Piper: https://github.com/rhasspy/piper
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
