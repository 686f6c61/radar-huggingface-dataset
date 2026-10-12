# baker76/speech-models

## Resumen

`baker76/speech-models` es un repositorio de HuggingFace que actúa como espejo estable de modelos de reconocimiento de voz en formato ONNX. Concretamente, aloja una copia sin modificar del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, exportado a ONNX y cuantizado a 8 bits por el usuario `csukuangfj2` para su uso con la librería `sherpa-onnx`. El repositorio lo mantiene el desarrollador de Rhyme Station, una aplicación de entrenamiento de rap improvisado, para garantizar una ubicación de descarga fiable para su script de aprovisionamiento.

El modelo subyacente es un transductor de streaming (arquitectura encoder-decoder-joiner, del tipo RNN-T) de aproximadamente 0,6 mil millones de parámetros, diseñado para reconocimiento automático del habla (ASR) en tiempo real con un tamano de fragmento (chunk) de 560 ms. El autor del repositorio declara explícitamente que no ha entrenado ni convertido nada: los ficheros son una copia de la exportación original publicada por terceros, pensada para que sherpa-onnx los consuma directamente.

Su relevancia reside en el formato de entrega: pesos ONNX int8 listos para inferencia en CPU o GPU ligera mediante sherpa-onnx, con componentes separados de encoder, decoder y joiner. La licencia del modelo original es OpenMDW-1.1, de NVIDIA. El repositorio no registra descargas ni likes, y no incluye información sobre datos de entrenamiento, idiomas soportados de forma exhaustiva ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor de streaming (encoder-decoder-joiner, tipo RNN-T), exportado a ONNX |
| Parametros totales | Aproximadamente 0,6 mil millones (segun el nombre del modelo: 0.6b) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable: modelo ASR de streaming; el chunk de procesado es de 560 ms |
| Tipos de cuantizacion | int8 (8 bits) |
| Idiomas soportados | No disponibles de forma oficial; la model card indica que el idioma se fija por stream (por ejemplo `en`, `ja` o `auto`) |
| Licencia | OpenMDW-1.1 (license_name: openmdw-1.1; en los metadatos de HuggingFace figura como `other`) |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) mas tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transductor de reconocimiento de voz en streaming, compuesto por tres subredes: un encoder, un decoder (predictor) y un joiner. Esta estructura es la habitual en los modelos RNN-T y permite emitir tokens a medida que llega el audio, sin esperar a que termine la frase. La exportación a ONNX divide el modelo en los tres ficheros (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) mas el vocabulario en `tokens.txt`, en la disposición que espera sherpa-onnx. Los pesos están cuantizados a 8 bits y el tamano de chunk es de 560 ms.

No se dispone de información sobre los datos de entrenamiento empleados por NVIDIA (número de tokens, composición del dataset, idiomas cubiertos o técnicas de alineación como RLHF/DPO), ya que la model card del repositorio espejo no los incluye y se limita a describir la procedencia de los ficheros. El autor de este repositorio no ha entrenado ni convertido el modelo: reproduce íntegramente la exportación publicada por `csukuangfj2`. La innovación relevante no es algorítmica sino de empaquetado: ofrecer un transductor de 0,6B cuantizado a int8 y listo para streaming con una latencia de fragmento baja.

## Capacidades

- Reconocimiento automático del habla en streaming, con emisión incremental de texto mientras se habla.
- Soporte multiidioma seleccionable por stream, con valores de ejemplo `en`, `ja` y `auto` (detección automática).
- Funcionamiento en modo transductor con chunk de 560 ms, adecuado para aplicaciones interactivas en tiempo real.
- Inferencia sobre CPU o GPU ligera gracias a la cuantización int8 y al formato ONNX.
- Integración directa con sherpa-onnx, que gestiona el pipeline de decoding del transductor.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Aplicaciones de interacción por voz en tiempo real: transcripción incremental de la entrada de micrófono con chunks de 560 ms, apropiada para asistentes, mandos por voz o interfaces conversacionales.
- Entrenadores de rap improvisado y herramientas de práctica musical: es el caso real de uso de Rhyme Station, que convierte la voz en palabras al vuelo para su análisis rítmico.
- Subtitulado en directo ligero: generación de subtítulos con baja latencia en emisiones o reuniones, ejecutable en portátiles sin GPU dedicada.
- Dictado y toma de notas: transcripción continua de voz a texto en aplicaciones de productividad, con detección automática de idioma entre los soportados.
- Sistemas embebidos y de borde: al ocupar unos 682 MB en int8 y funcionar sobre ONNX, puede desplegarse en dispositivos con recursos limitados mediante sherpa-onnx.
- Preprocesado de pipelines de voz para NLP: conversión de audio a texto como primer paso de cadenas de análisis, indexación o búsqueda sobre grabaciones.
- Transcripción con requisitos de idioma fijo por stream: entornos multilingües donde cada flujo de audio se etiqueta con su idioma (`en`, `ja`) para mejorar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER/CER, latencia medida ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB o menos en int8 (los pesos ocupan aproximadamente 682 MB en total entre encoder, decoder y joiner).
- Cabe sin problema en GPU de consumo: cualquier GPU con 2 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090) y tambien puede ejecutarse en CPU.
- GPU de centros de datos: A100, H100 o L4 son compatibles, aunque sobredimensionadas para un modelo de este tamano.
- CPU: es un caso de despliegue viable dado el tamano reducido y la cuantización int8; sherpa-onnx esta optimizado para inferencia en CPU.
- Opciones de despliegue: sherpa-onnx (soporte nativo, formato esperado por el repositorio); al ser ONNX estandar, tambien podria integrarse con otros runtimes de ONNX, aunque no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, que no estan orientados a ASR.
- Latencia y throughput estimados: no disponibles; el unico dato objetivo es el tamano de chunk de 560 ms que define la granularidad de emision.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| baker76/speech-models (nemotron-3.5-asr-streaming-0.6b int8) | ~0,6B | ONNX int8 | Si (chunk 560 ms) | OpenMDW-1.1 | Espejo de la exportacion de csukuangfj2 para sherpa-onnx |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6B | Pesos originales | Si | OpenMDW-1.1 | Modelo fuente original de NVIDIA |
| csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11 | ~0,6B | ONNX int8 | Si (chunk 560 ms) | OpenMDW-1.1 | Exportacion ONNX original del modelo NVIDIA |

No se dispone de datos comparativos de rendimiento entre estos modelos ni frente a alternativas de otros desarrolladores, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no ha entrenado ni convertido el modelo; cualquier problema de precision o comportamiento proviene del modelo original de NVIDIA y de la exportacion de csukuangfj2.
- No se especifican sesgos conocidos ni evaluación de equidad; al ser un espejo, no hay informacion adicional al respecto.
- Riesgo de errores de transcripcion (WER/CER) no cuantificado: no hay benchmarks publicados en la informacion disponible.
- Cobertura de idiomas no confirmada de forma oficial; solo se citan `en`, `ja` y `auto` como ejemplos, y los metadatos de HuggingFace marcan los idiomas como no disponibles.
- Licencia OpenMDW-1.1: conviene revisar sus terminos en el enlace oficial antes de un uso comercial, ya que impone condiciones especificas sobre el modelo y sus derivados.
- El chunk fijo de 560 ms implica una latencia minima de emision; no es adecuado para escenarios que exijan transcripciones por debajo de ese umbral.
- El repositorio no registra descargas ni likes, y su fecha de creacion/publicacion figura como 2026, lo que no aporta garantias de mantenimiento continuado.
- No se documenta soporte para tool calling, diarizacion, traduccion ni otras tareas distintas del ASR.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/baker76/speech-models
- Modelo fuente original (NVIDIA): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Exportacion ONNX de referencia (csukuangfj2): https://huggingface.co/csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-560ms-int8-2026-06-11
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Aplicacion Rhyme Station: https://github.com/benbaker76/RhymeStation
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
