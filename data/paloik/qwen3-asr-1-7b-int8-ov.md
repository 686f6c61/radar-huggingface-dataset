# paloik/Qwen3-ASR-1.7B-int8-ov

## Resumen

Qwen3-ASR-1.7B-int8-ov es una conversión al formato OpenVINO IR del modelo Qwen/Qwen3-ASR-1.7B, un sistema de reconocimiento automático del habla (ASR) de 1.700 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. Esta versión, publicada por el usuario paloik, aplica cuantización simétrica INT8 con granularidad por canal para optimizar la inferencia sobre hardware Intel, concretamente las NPU integradas en los procesadores Core Ultra, las GPU Arc y las CPU multinúcleo.

El modelo resuelve el problema de la transcripción de voz a texto multilingüe con un enfoque en alta precisión, según la model card, para alemán, inglés y terminología técnica. Su relevancia actual radica en que permite ejecutar un modelo ASR de tamaño medio en hardware de consumo Intel sin necesidad de GPU dedicada, aprovechando la aceleración por NPU que ofrece OpenVINO GenAI a partir de la versión 2026.4.

La ficha se centra en la versión cuantizada y empaquetada para OpenVINO. Los detalles sobre el entrenamiento original, la composición del dataset o los benchmarks del modelo base no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3-ASR; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 simétrico, por canal (`--weight-format int8 --sym`) |
| Idiomas soportados | Alemán e inglés según la model card; etiquetado como multilingüe, sin lista completa disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (librería `openvino`, `openvino-genai`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen3-ASR-1.7B ni los detalles de su entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de conversión y cuantización aplicado por el autor de esta versión: se ha generado un modelo OpenVINO IR con cuantización simétrica INT8 y granularidad por canal, una configuración orientada a preservar la precisión mientras se reduce el peso y se acelera la inferencia en NPU y GPU integradas de Intel.

La innovación técnica destacable de este artefacto es el empaquetado para OpenVINO GenAI (versión 2026.4 o superior), que habilita el uso de pistas como `CACHE_DIR` y `LATENCY` y permite ejecutar el pipeline mediante `ov_genai.WhisperPipeline` sobre el dispositivo `NPU`. El repositorio ocupa 2,4 GB, coherente con un modelo de 1.7B parámetros en INT8 más los artefactos de tokenizer y configuración.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) con salida de transcripción.
- Soporte multilingüe, con mención explícita de alemán e inglés en la model card y etiqueta `multilingual`.
- Selección de idioma mediante tokens especiales en la llamada de inferencia (por ejemplo, `language="<|de|>"`).
- Modo de tarea configurable (`task="transcribe"`), lo que sugiere la posibilidad de otras tareas ASR además de la transcripción, aunque no se detallan.
- Inferencia acelerada por hardware Intel: NPU de Core Ultra, GPU Arc y CPU multinúcleo.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de reuniones en entornos corporativos: el modelo puede convertir audio de reuniones en texto sobre un portátil con Core Ultra, aprovechando la NPU para no consumir batería ni GPU dedicada, lo que lo hace adecuado para grabaciones de voz cercana en alemán o inglés.
- Subtitulado local de contenido audiovisual: integrado en una herramienta de escritorio, permite generar subtítulos sin enviar audio a la nube, un requisito habitual en sectores con datos sensibles.
- Dictado por voz en aplicaciones de productividad: al ejecutarse en NPU con latencia baja, puede alimentar funciones de dictado en editores de texto o IDE para documentación técnica en inglés y alemán.
- Transcripción de notas de voz en dispositivos de borde: su tamaño INT8 y su soporte para CPU multinúcleo permiten desplegarlo en equipos sin GPU, útil para aplicaciones de campo o kioscos.
- Procesamiento de terminología técnica en documentación: la model card destaca su precisión con terminología técnica, lo que lo hace idóneo para transcribir ponencias de ingeniería, soporte técnico o formación interna.
- Preprocesado de audio en pipelines de datos: puede usarse como primer paso para convertir grandes volúmenes de audio en texto antes de un análisis posterior (búsqueda, resumen, clasificación), siempre que el hardware Intel esté disponible.
- Transcripción en aplicaciones de accesibilidad: integrado en software de asistencia para personas con discapacidad auditiva, ofreciendo transcripción en tiempo real en local sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio pesa 2,4 GB en INT8; se requiere al menos esa cantidad de memoria más el margen del runtime de OpenVINO y del búfer de audio.
- Hardware objetivo declarado: NPU de Intel Core Ultra, GPU integrada Intel Arc y CPU multinúcleo.
- Cabe en hardware de consumo: sí, en equipos Intel Core Ultra con NPU o en portátiles con Arc iGPU; no requiere GPU dedicada.
- Opciones de despliegue: OpenVINO GenAI (versión 2026.4 o superior) mediante `ov_genai.WhisperPipeline`, con selección de dispositivo (`NPU`, GPU o CPU) y caché de compilación opcional (`CACHE_DIR`).
- Latencia y throughput: no disponibles; la model card menciona soporte de la pista `LATENCY`, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas como Whisper large-v3 o versiones ASR de otros fabricantes. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-int8-ov | 1.7B | No disponible | Apache 2.0 | OpenVINO IR INT8 | Optimizado para Intel NPU/Arc/CPU |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La model card solo menciona explícitamente alemán e inglés; el resto de idiomas cubiertos por la etiqueta `multilingual` no está documentado, por lo que conviene validar el rendimiento en castellano antes de usarlo en producción.
- No se han publicado benchmarks ni métricas de error (WER) en la información disponible, lo que impide estimar su precisión objetiva frente al modelo base o a alternativas.
- La cuantización INT8 puede introducir una degradación de precisión respecto al modelo original en FP16/BF16; no se documenta la magnitud de esa pérdida.
- El modelo está empaquetado exclusivamente para OpenVINO GenAI y hardware Intel; no es directamente usable con vLLM, llama.cpp, Ollama o TGI, lo que limita su portabilidad.
- Requiere OpenVINO GenAI 2026.4 o superior, una versión reciente que puede no estar disponible en todos los entornos.
- Riesgo de alucinación en transcripciones con audio ruidoso o con acentos no representados en el entrenamiento; no hay información sobre el dataset para evaluarlo.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-ASR-1.7B y de OpenVINO.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paloik/Qwen3-ASR-1.7B-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- OpenVINO GenAI: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
