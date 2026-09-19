# marcobarb94/a733-whisper-base

## Resumen

`marcobarb94/a733-whisper-base` es un artefacto de despliegue: una conversión del modelo de reconocimiento automático de voz (ASR) `csukuangfj/sherpa-onnx-whisper-base` al formato ONNX, etiquetada para ejecutarse sobre la NPU VIPLite de los SoC Allwinner (el sufijo "a733" apunta a la familia Allwinner A733). No es un modelo entrenado desde cero ni un ajuste fino: es un empaquetado orientado a inferencia embebida, publicado por el usuario marcobarb94 bajo licencia MIT.

El modelo subyacente es Whisper base, un transformer encoder-decoder de aproximadamente 74 millones de parámetros con ventana de audio fija de 30 segundos, muy extendido para transcripción multilingüe. Su relevancia aquí no está en la calidad del reconocimiento (Whisper base es la segunda talla más pequeña de la familia), sino en la posibilidad de ejecutar ASR completo sin conexión en placas ARM de bajo consumo con aceleración NPU, algo que interesa a proyectos de domótica, wearables, kioscos y asistentes de voz locales.

La ficha pública del repositorio es extremadamente escueta: solo declara licencia MIT, el modelo base y las etiquetas `Allwinner` y `VIPLite`. No incluye pipeline declarado, idiomas, métricas, ni detalles de cuantización, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (modelo base), exportado a ONNX para la NPU VIPLite de Allwinner |
| Parametros totales | no disponible en la model card; la talla base de Whisper tiene ~74 M de parametros (dato del modelo upstream, no confirmado en el repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; Whisper base procesa ventanas de audio de 30 s (1500 tramas mel) y genera hasta 448 tokens de texto por ventana |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; Whisper base es multilingue (la familia Whisper declara alrededor de 99 idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card no documenta ningún proceso de entrenamiento: el repositorio es una exportación. Según la documentación pública de Whisper, la talla base consta de 6 capas de encoder y 6 de decoder, con dimensión de modelo 512 y 8 cabezas de atención, y fue entrenada por OpenAI con aprendizaje débilmente supervisado sobre cientos de miles de horas de audio con transcripciones, en una formulación multitarea que unifica transcripción, identificación de idioma, detección de voz y traducción al inglés. No hay información disponible en la información proporcionada sobre el dataset concreto, el número exacto de tokens de audio ni si hubo etapas de RLHF o DPO.

La innovación relevante de este repositorio es puramente de despliegue. `csukuangfj/sherpa-onnx-whisper-base` es la conversión ONNX mantenida por el proyecto sherpa-onnx, que permite ejecutar Whisper con ONNX Runtime sin dependencias de PyTorch. Sobre esa base, esta variante añade etiquetas y presumiblemente una grafo o partición compatibles con VIPLite, el stack de inferencia de Allwinner, de modo que el encoder/decoder pueda ejecutarse total o parcialmente sobre la NPU del SoC en lugar de la CPU ARM. No se especifica en la información disponible qué operadores se delegan a la NPU ni con qué precisión.

## Capacidades

- Reconocimiento automático de voz (ASR) en modo offline, sin llamadas a servicios externos.
- Transcripción por ventanas de 30 segundos, encadenables para audio más largo mediante segmentación externa (sherpa-onnx y whisper.cpp implementan esta lógica).
- Detección de idioma y transcripción multilingüe, heredadas del modelo Whisper base (no confirmado explícitamente en esta model card).
- Traducción de audio a texto en inglés, una de las tareas multitarea de Whisper.
- Generación de marcas temporales a nivel de segmento, sujetas a la precisión típica de Whisper base.
- Ejecución en hardware embebido ARM con posible aceleración por NPU VIPLite.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene capacidades de visión, audio generativo ni modo "thinking".
- Capacidad de diarización: no disponible (Whisper base no la incluye de forma nativa).

## Casos de uso

- Transcripción local en placas Allwinner: integrar el modelo en una placa con SoC A733 para transcribir voz capturada por micrófono I2S, delegando el encoder a la NPU y manteniendo la CPU libre para la lógica de aplicación.
- Asistentes de voz sin conexión: usar la salida ASR como entrada de un intérprete de comandos local (por ejemplo, encendido de luces o control de reproducción) en dispositivos domésticos que no pueden enviar audio a la nube por privacidad o conectividad.
- Subtitulado automático de vídeo en el dispositivo: procesar pistas de audio de 30 segundos de duración en un grabador o cámara conectada y generar ficheros SRT con las marcas temporales que devuelve el modelo.
- Actas y notas de reuniones en local: combinar el modelo con un segmentador de voz (VAD) para trocear reuniones largas y transcribirlas íntegramente en una máquina sin GPU, evitando subir audio confidencial a terceros.
- Atención al cliente con requisitos de privacidad: pretranscribir llamadas en el propio CPD antes de aplicar analítica de texto, de modo que el audio nunca salga de la infraestructura de la organización.
- Kioscos y terminales de accesibilidad: reconocimiento de voz para personas con movilidad reducida en terminales públicos con hardware económico, donde el coste por dispositivo impide usar GPU.
- Indexación y búsqueda de archivos de audio: transcripción masiva por lotes de un archivo histórico de grabaciones para habilitar búsqueda por texto, aceptando el mayor ratio de error de una talla base.
- Prototipado rápido de pipelines ASR: usar el ONNX como referencia reproducible en pruebas de integración antes de escalar a tallas small o medium.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye WER, latencia ni comparativas, y los resultados de la búsqueda web no contienen datos técnicos sobre este modelo.

## Requisitos de hardware

- Tamaño del repositorio: 0.2 GB, consistente con una exportación ONNX de una talla base (los pesos de Whisper base en FP32 rondan los 290 MB).
- VRAM estimada para inferencia en GPU: del orden de 0.3-0.5 GB en FP16 para una talla base; no confirmado en la información disponible.
- Cabe sin problemas en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso iGPU con suficiente memoria compartida. También se ejecuta en CPU x86 y ARM.
- Hardware objetivo declarado: SoC Allwinner con NPU VIPLite (etiquetas `Allwinner` y `VIPLite`). No se especifica el modelo exacto ni la generación de NPU soportada.
- GPU de centro de datos (A100, H100) no aportan ventaja para una talla base; el cuello de botella es la latencia de arranque y el preprocesado mel, no el cómputo.
- Opciones de despliegue: sherpa-onnx (el runtime natural del modelo base), ONNX Runtime (CPU, CUDA, TensorRT), y toolchains de Allwinner para VIPLite. Alternativas equivalentes de la familia: whisper.cpp, faster-whisper (CTranslate2), WhisperX, Hugging Face Transformers con Optimum.
- Latencia y throughput: no disponibles. Como referencia cualitativa, una talla base multilingüe en CPU moderna suele transcribir varias veces más rápido que tiempo real, pero no hay medición publicada para esta exportación concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a733-whisper-base (este repo) | ~74 M (no confirmado) | 30 s por ventana | no disponible en la model card | MIT | HuggingFace, ONNX, orientado a NPU Allwinner |
| csukuangfj/sherpa-onnx-whisper-base | ~74 M | 30 s por ventana | multilingue (familia Whisper) | MIT | HuggingFace, ONNX, runtime sherpa-onnx |
| Whisper tiny | ~39 M | 30 s por ventana | multilingue | MIT | OpenAI, ONNX, whisper.cpp, faster-whisper |
| Distil-Whisper (variantes destiladas) | desde ~166 M (distil-small.en) | 30 s por ventana | mayoritariamente ingles | MIT | HuggingFace, Transformers |
| Moonshine (tiny/base) | ~27 M / ~61 M | ventanas variables, optimizado para audio corto | mayoritariamente ingles | MIT | HuggingFace, ONNX |

La ventaja diferencial de este repositorio no es la precisión ni el tamaño, sino la integración declarada con VIPLite para SoC Allwinner, un nicho que ningún modelo de la comparativa cubre de fábrica. Frente a Whisper tiny, la talla base ofrece mejor precisión a cambio de más cómputo; frente a Distil-Whisper o Moonshine, la comparación no es directa porque estos priorizan inglés y audio corto.

## Limitaciones y advertencias

- Trazabilidad mínima: la model card no documenta el proceso de conversión, la versión de ONNX, la de sherpa-onnx ni los parámetros de exportación. Reproducir el artefacto no es viable con la información publicada.
- Validación nula de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No existen reportes independientes de calidad ni de compatibilidad con placas concretas.
- Anomalía en los metadatos: las fechas de creación y actualización indican 2026-09-18, lo que sugiere un error de reloj o de zona horaria en el momento de la subida. Conviene no tratarlas como referencia temporal fiable.
- Alucinación típica de Whisper: en silencios, música de fondo, ruido o audio muy corto, la talla base puede generar texto inventado o bucles de repetición. Requiere VAD previo y filtros de salida en producción.
- Precisión limitada por la talla: base comete más errores que small o medium, especialmente con acentos marcados, solapamiento de hablantes, tecnicismos y nombres propios. En dominios especializados se recomienda validar el WER real antes de desplegar.
- Contexto acotado a 30 segundos: el audio más largo debe trocearse y recomponerse externamente; los cortes mal alineados degradan la transcripción en las fronteras.
- Idiomas no declarados: aunque el modelo upstream es multilingüe, la ficha de este repositorio no especifica qué idiomas se han validado, ni si la exportación conserva el tokenizer completo.
- Riesgo de sesgos heredados: Whisper se entrenó con audio web a gran escala, con la consiguiente sobrerrepresentación de determinados acentos, variedades dialectales y condiciones de grabación limpias.
- Licencia: MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright. No obstante, la toolchain de conversión de Allwinner (VIPLite) puede estar sujeta a licencias propias del fabricante, ajenas a este repositorio.
- Dependencia de hardware propietario: si el grafo está especializado para VIPLite, puede no ejecutarse correctamente en ONNX Runtime genérico o en otras NPU. No se especifica en la información disponible si existe una ruta de fallback a CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcobarb94/a733-whisper-base
- Modelo base (sherpa-onnx, ONNX): https://huggingface.co/csukuangfj/sherpa-onnx-whisper-base
- Repositorio sherpa-onnx (runtime y conversiones): https://github.com/k2-fsa/sherpa-onnx
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper (Robust Speech Recognition via Large-Scale Weak Supervision): https://arxiv.org/abs/2212.04356
- Repositorio whisper.cpp (alternativa de inferencia en C/C++): https://github.com/ggerganov/whisper.cpp
- Documentación de Allwinner (VIPLite / NPU): no disponible en la información proporcionada
