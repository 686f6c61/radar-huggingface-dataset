# skillsafe-ai/whisper-tiny

## Resumen

skillsafe-ai/whisper-tiny es un paquete de artefactos ONNX listos para navegador del modelo Whisper tiny, orientado a reconocimiento automático de voz (pipeline `automatic-speech-recognition`). Lo publica la organización SkillSafe a partir de un conversor reproducible que parte de `onnx-community/whisper-tiny` en el commit `ff4177021cc41f7db950912b73ea4fdf7d01d8e7`. Según la model card, cada fichero está fijado por SHA-256 a su origen y no hay edición manual: es un import bit a bit, no una reconversión. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache-2.0.

La arquitectura es un transformer encoder-decoder (familia Whisper) exportado a ONNX en tres precisiones: fp32, fp16 y cuantización q8. Las formas declaradas en la verificación del autor revelan una dimensión oculta de 384 con 6 cabezas de atención de 64 dimensiones, 4 capas en el decodificador, vocabulario de 51.865 tokens y una entrada de audio de 1.500 frames, es decir, la ventana estándar de 30 segundos de Whisper. La ficha no declara número de parámetros totales ni idiomas soportados.

Su interés es práctico: con variantes fp16 y q8 de pocos megabytes, permite ejecutar ASR íntegramente en el cliente (navegador o edge) mediante transformers.js y onnxruntime, sin enviar el audio a un servidor. El precio es la precisión: sigue siendo el modelo más pequeño de la familia Whisper y el repositorio no registra descargas ni validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parámetros totales | no disponible (no declarado en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por pasada (1.500 frames), derivado de la forma `encoder_hidden_states[1, 1500, 384]` declarada en la verificación y del preprocesado estándar de Whisper |
| Tipos de cuantización | fp32, fp16 y q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model.onnx`, `onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged.onnx`, `onnx/decoder_model_merged_fp16.onnx`, `onnx/decoder_model_merged_quantized.onnx`) |
| Dimensión oculta y cabezas | 384 dimensiones, 6 cabezas de atención de 64 dimensiones |
| Capas del decodificador | 4 (índices `past_key_values.0` a `past_key_values.3`) |
| Tamaño de vocabulario | 51.865 tokens |
| Modelo base | onnx-community/whisper-tiny |
| Librería declarada | transformers.js |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder con atención cruzada: el codificador consume la representación mel del audio y el decodificador genera texto autorregresivamente. Los artefactos ONNX exponen dos grafos separados. El codificador recibe la señal y produce `encoder_hidden_states[1, 1500, 384]`. El decodificador fusionado (`decoder_model_merged`) acepta `input_ids`, los estados del codificador y la caché KV, y devuelve logits de tamaño `[1, 4, 51865]` junto con los tensores `present.*`. Cada una de las 4 capas mantiene dos cachés: autoatención (`past_key_values.N.decoder.*`, con forma `[1, 6, secuencia, 64]`) y atención cruzada sobre el audio (`past_key_values.N.encoder.*`, con forma `[1, 6, 1500, 64]`). El decodificador es «merged» porque incorpora la entrada booleana `use_cache_branch`, que unifica en un solo grafo los caminos con y sin caché: el primer paso decodifica sin caché y los siguientes reutilizan los tensores `present` para evitar recomputar la atención cruzada sobre los 1.500 frames.

No hay entrenamiento propio ni ajuste: la model card indica que el paquete se importa tal cual desde el upstream y que cada fichero se verifica con `onnx.checker` y una prueba de humo en CPU con entradas de ceros. Por tanto, no se documentan tokens de entrenamiento, composición del dataset, RLHF ni DPO. La única optimización declarada es la cadena de exportación y cuantización: el decodificador pasa de 113,06 MB en fp32 a 56,83 MB en fp16 y 29,30 MB en q8, y el codificador de 31,38 MB en fp32 a 15,75 MB en fp16. Los ficheros auxiliares (tokenizer, vocabulario, preprocesador) se empaquetan como «bundle» junto a la aplicación, mientras que los ONNX se marcan como «registry» y se sirven desde `models.skillsafe.ai` una vez verificados.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) sobre ventanas de 30 segundos de audio.
- Decodificación autorregresiva con caché KV para ambas atenciones (propia y cruzada), lo que abarata la generación token a token.
- Ejecución en navegador mediante transformers.js sobre ONNX, tanto en CPU (WASM) como potencialmente en WebGPU.
- Exportación en tres niveles de precisión (fp32, fp16, q8), lo que permite intercambiar calidad por tamaño y velocidad.
- Uso desde Python con onnxruntime u otras herramientas compatibles con ONNX, además del entorno JavaScript declarado.
- No se declaran en la información disponible: tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio más allá de ASR, ni modo de razonamiento explícito.
- Cobertura multilingüe: no disponible; la ficha no enumera idiomas.

## Casos de uso

- Transcripción local en el navegador: el paquete está pensado para `import` directo en transformers.js, de modo que una aplicación web puede transcribir audio sin enviarlo a un servidor, con la variante q8 de 29,30 MB para minimizar la descarga inicial.
- Dictado por voz en aplicaciones web y PWA: al ejecutarse en el cliente y ocupar pocos megabytes, encaja en editores de texto, formularios o herramientas internas que necesitan entrada por voz con funcionamiento offline.
- Generación de subtítulos para vídeo y pódcast: el modelo procesa bloques de 30 segundos (1.500 frames), por lo que se puede segmentar el material en ventanas, transcribir cada una y ensamblar el resultado; conviene solapar ventanas para no cortar palabras en las fronteras.
- Indexación y búsqueda sobre archivos de audio: transcribir una biblioteca local de grabaciones y almacenar el texto para búsqueda full-text o semántica posterior.
- Preprocesado de pipelines RAG con fuentes de audio: usar la transcripción como paso previo a la vectorización y recuperación, con el modelo corriendo en el mismo nodo que el resto del pipeline para evitar saltos de red.
- Analítica de llamadas o reuniones en el edge: transcribir conversaciones en un dispositivo local cuando no está permitido extraer el audio de la organización; la ventana de 30 segundos obliga a segmentar reuniones largas y a gestionar el contexto entre segmentos.
- Prototipado y pruebas de integración: validar la plomería de un sistema ASR (captura de audio, resampling, tokenización, decodificación) con un modelo pequeño antes de sustituirlo por uno mayor, manteniendo el mismo formato ONNX.
- Accesibilidad en tiempo real: subtitulado aproximado de vídeo en directo o de audio del micrófono en aplicaciones de asistencia, asumiendo la menor precisión de un modelo tiny.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, MMLU, HumanEval ni ninguna otra métrica de calidad. Lo único aportado es una comprobación de humo con entradas de ceros que valida formas y tiempos de ejecución en CPU, y que no debe interpretarse como medida de rendimiento real:

| Fichero ONNX | Precisión | Tamaño | Tiempo en la prueba de humo |
|---|---|---|---|
| `onnx/decoder_model_merged.onnx` | fp32 | 113,06 MB | 10,7 ms |
| `onnx/decoder_model_merged_fp16.onnx` | fp16 | 56,83 MB | no disponible |
| `onnx/decoder_model_merged_quantized.onnx` | q8 | 29,30 MB | no disponible |
| `onnx/encoder_model.onnx` | fp32 / q8 | 31,38 MB | no disponible |
| `onnx/encoder_model_fp16.onnx` | fp16 | 15,75 MB | no disponible |

La medición de 10,7 ms corresponde a una única llamada al decodificador con `input_ids[1, 4]` y cachés de secuencia 1, sobre CPU arm64 (Darwin 25.6.0) con onnxruntime. No equivale al tiempo de transcripción de audio real, que depende del número de tokens generados y del coste del codificador sobre los 1.500 frames.

## Requisitos de hardware

- VRAM estimada en fp32: unos 145 MB sumando codificador (31,38 MB) y decodificador (113,06 MB), más el espacio de activaciones y cachés.
- VRAM estimada en fp16: unos 73 MB (15,75 MB + 56,83 MB).
- VRAM estimada en q8: alrededor de 60 MB con la variante cuantizada del decodificador (29,30 MB) más el codificador.
- Cabe sin problema en cualquier GPU de consumo, en iGPU y en dispositivos móviles; también funciona solo con CPU mediante onnxruntime.
- El autor no recomienda GPUs concretas. Para inferencia en servidor no tiene sentido reservar una A100 o H100 para un modelo de este tamaño: el cuello de botella es la latencia de red y el preprocesado, no la GPU.
- Opciones de despliegue: transformers.js en navegador (WASM o WebGPU) y onnxruntime sobre los ficheros ONNX. Desde Python puede cargarse con onnxruntime u otras herramientas compatibles con ONNX.
- No aplicables directamente: vLLM, TGI, Ollama y llama.cpp, porque el repositorio no incluye pesos en safetensors ni GGUF; cualquier uso de esas herramientas exigiría exportar desde el modelo original.
- Latencia: el único dato disponible es el paso de decodificación de 10,7 ms en fp32 sobre CPU arm64. No hay datos de throughput ni de factor de tiempo real (RTF) publicados.

## Comparativa con modelos similares

No se han proporcionado resultados de benchmarks ni fichas de modelos alternativos en la información disponible, por lo que no es posible establecer una comparación cuantitativa. La siguiente tabla recoge únicamente lo verificable a partir de los datos aportados:

| Modelo | Formato | Licencia | Parámetros | Contexto | Notas |
|---|---|---|---|---|---|
| `skillsafe-ai/whisper-tiny` (este) | ONNX fp32/fp16/q8 | Apache-2.0 | no disponible | 30 s de audio | 0,3 GB de repo, 0 descargas, 0 likes |
| `onnx-community/whisper-tiny` (upstream) | ONNX | no disponible | no disponible | no disponible | Origen del import; commit `ff41770` |
| `openai/whisper-tiny` (original) | no disponible | no disponible | no disponible | no disponible | Predecesor de la cadena de exportación |
| Otros tamaños de la familia Whisper (`base`, `small`, etc.) | no disponible | no disponible | no disponible | no disponible | Existen en el ecosistema, pero no se han aportado datos en esta búsqueda |

## Limitaciones y advertencias

- Precisión limitada por el tamaño: es la variante tiny de Whisper, la menos precisa de la familia. No es adecuada para transcripción de producción con requisitos altos de exactitud sin una evaluación previa con audio del dominio objetivo.
- Ventana fija de 30 segundos: el audio más largo debe segmentarse y ensamblarse, con riesgo de errores en las fronteras y de perder contexto entre segmentos.
- Riesgo de alucinación: los modelos ASR de la familia Whisper tienden a generar texto plausible cuando el audio es silencioso, ruidoso o ininteligible. Debe validarse el comportamiento en estos casos antes de usarlo en producción.
- Idiomas: no disponibles en la ficha. No se puede asumir cobertura multilingüe a partir de esta documentación, aunque el modelo base pertenezca a una familia conocida por ser multilingüe.
- Sesgos: no documentados en la información disponible. Al no haber datos de entrenamiento ni evaluación en la ficha, no es posible valorar sesgos de acento, género o variedad dialectal.
- Licencia: Apache-2.0, que en principio permite uso comercial y modificación. Aun así, conviene revisar la cadena de procedencia hasta el modelo original antes de un despliegue comercial, ya que la ficha no documenta la licencia del upstream.
- Distribución: los ficheros ONNX se etiquetan como «registry» y se sirven desde `models.skillsafe.ai` una vez verificados, no necesariamente dentro del repositorio de HuggingFace. Conviene comprobar la disponibilidad y la integridad (SHA-256) antes de depender de ellos.
- Repositorio sin tracción: 0 descargas y 0 likes, con creación y última actualización el mismo día, lo que implica ausencia de validación por parte de la comunidad.
- Los artefactos son un import bit a bit del upstream, sin conversión: cualquier limitación del modelo de origen se hereda sin cambios.
- Los datos de la prueba de humo usan entradas de ceros y un solo paso de decodificación; no sirven para estimar la calidad ni el rendimiento en un caso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/whisper-tiny
- Modelo base en HuggingFace: https://huggingface.co/onnx-community/whisper-tiny/tree/ff4177021cc41f7db950912b73ea4fdf7d01d8e7
- Conversor y recetas de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Receta declarada: `recipes/whisper-tiny.yaml` (sha256 `199acdcb6a95cd1402db0c23a09ae07979df82fe604cd07f75f1e2c5a85ff0dd`)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las únicas entradas devueltas eran páginas de ayuda sobre páginas de inicio de navegadores (Google, Chrome, Edge, Windows), sin relación con el modelo.
