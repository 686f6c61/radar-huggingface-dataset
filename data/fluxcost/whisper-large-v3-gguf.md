# fluxcost/whisper-large-v3-gguf

## Resumen

`fluxcost/whisper-large-v3-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `openai/whisper-large-v3`. El repositorio lo publica el usuario fluxcost y no introduce ninguna modificación sobre los pesos: es una copia sin cambios de la conversión previa `handy-computer/whisper-large-v3-gguf` en la revisión `e3e29bee6389c7da4a141406f07bb80ddac5337c`. Su propósito declarado es servir como motor de dictado para la aplicación Fluxvoice.

Whisper large-v3 es un transformer encoder-decoder entrenado por OpenAI para transcripción multilingüe y traducción de voz a texto. Con aproximadamente 1.540 millones de parámetros, es la variante de mayor tamaño de la familia Whisper publicada por OpenAI. Esta conversión GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles, sin depender de PyTorch ni de la librería `transformers` en tiempo de inferencia.

La relevancia de esta ficha es acotada: el repositorio no aporta mejoras técnicas, datasets adicionales ni ajuste fino. Se trata de un artefacto de distribución (un único fichero `whisper-large-v3-Q8_0.gguf` de 1.668.741.440 bytes) que hereda todas las capacidades y limitaciones del modelo original de OpenAI, con la ventaja de un despliegue más ligero mediante el ecosistema GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, OpenAI) |
| Parametros totales | 1.543.516.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3, un transformer encoder-decoder con atención completa. El encoder procesa espectrogramas log-Mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales de control de idioma, tarea (transcripción o traducción) y marcas de tiempo. Esta ficha no dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original de OpenAI y no se reproducen en la model card del repositorio GGUF.

La única intervención técnica documentada es la conversión a GGUF y la cuantización a Q8_0 (8 bits por peso), que reduce el peso del fichero respecto a los pesos originales en precisión completa. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal ni variantes híbridas. El repositorio incluye los ficheros `LICENSE` y `NOTICE` heredados de la conversión de handy-computer, sin modificaciones.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio en formato compatible con el pipeline de Whisper.
- Transcripción con marcas de tiempo a nivel de segmento.
- Traducción de voz a texto en inglés desde otros idiomas (capacidad propia del modelo base Whisper).
- Detección y selección de idioma mediante tokens de control (capacidad del modelo base; el repositorio no lista idiomas).
- Ejecución en CPU y GPU mediante llama.cpp y bindings compatibles con GGUF.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no son capacidades de un modelo ASR.
- No se documentan capacidades de visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: es el caso declarado por el autor (app Fluxvoice); el fichero GGUF Q8_0 se carga con llama.cpp y transcribe audio del micrófono en local, sin enviar datos a servicios externos.
- Transcripción de reuniones y notas de voz: al ejecutarse en local con un único fichero de 1,7 GB, permite procesar grabaciones por lotes en equipos sin GPU dedicada, a costa de mayor latencia que en GPU.
- Subtitulado de vídeo con marcas de tiempo: el decoder de Whisper genera timestamps por segmento, utilizables para generar ficheros de subtítulos en pipelines de postproducción.
- Prototipado de pipelines ASR sin PyTorch: útil para integrar transcripción en aplicaciones escritas en C/C++ o Rust mediante bindings de llama.cpp, evitando la dependencia de `transformers`.
- Despliegue en entornos con restricciones de red: al ser un artefacto autocontenido en GGUF, se distribuye y ejecuta en máquinas aisladas sin descargar pesos adicionales.
- Traducción de audio a texto en inglés: para contenido hablado en otros idiomas cuando se necesita salida en inglés, usando la tarea de traducción del modelo base.
- Evaluación comparativa de cuantización: sirve como referencia Q8_0 frente a otras cuantizaciones de Whisper large-v3 para medir la pérdida de precisión (WER) en un caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de WER, latencia ni comparaciones con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 1,67 GB; con overhead de contexto y buffers de llama.cpp, se puede estimar en torno a 2-3 GB, aunque no se dispone de medición publicada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM podría alojar los pesos; no hay datos de throughput por modelo de GPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos (1,67 GB), aunque la latencia real no está documentada.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (por ejemplo, bindings de la librería `whisper.cpp`, si el fichero es compatible con su formato). No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `fluxcost/whisper-large-v3-gguf` | 1.543.516.688 | no disponible | GGUF Q8_0 | Apache 2.0 | Copia sin cambios de handy-computer; pensado para Fluxvoice |
| `handy-computer/whisper-large-v3-gguf` | 1.543.516.688 | no disponible | GGUF | Apache 2.0 | Origen de la conversión; misma revisión de pesos |
| `openai/whisper-large-v3` | 1.543.516.688 | ventanas de audio de 30 s | safetensors / PyTorch | Apache 2.0 | Modelo original de OpenAI; referencia para WER y comportamiento |

No se dispone de datos de rendimiento comparado (WER, latencia) en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora sobre el modelo original: cualquier limitación de Whisper large-v3 (sesgos por idioma, errores en audio con ruido, alucinaciones en silencios) se hereda íntegramente.
- Riesgo de alucinación: los modelos Whisper pueden generar texto plausible en segmentos de silencio o audio ininteligible; conviene validar las transcripciones en producción.
- Idiomas soportados: la model card no lista idiomas; no se debe asumir cobertura completa sin verificar el comportamiento del modelo base.
- Solo se publica una cuantización Q8_0; no hay variantes Q4, Q5 ni FP16 en este repositorio, lo que limita el ajuste de tamaño frente a precisión.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los ficheros `LICENSE` y `NOTICE` incluidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-05; no hay evidencia de mantenimiento ni de validación por terceros.
- El autor declara que el fichero es una copia sin modificar de otra conversión; la trazabilidad depende de la integridad del hash SHA-256 publicado (`2fa1a5f179f8a511a53e2108db270aa4af3ce08cd976af4180e2854666bb4ba3`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fluxcost/whisper-large-v3-gguf
- Conversión de origen: https://huggingface.co/handy-computer/whisper-large-v3-gguf
- Modelo base de OpenAI: https://huggingface.co/openai/whisper-large-v3
