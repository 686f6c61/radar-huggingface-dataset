# sayzly/whisper-medium-gguf

## Resumen

Whisper Medium (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático de voz `openai/whisper-medium`, publicada por el usuario `sayzly`. El modelo original lo desarrolló OpenAI y se distribuye bajo licencia Apache 2.0. Esta ficha describe la variante cuantizada en GGUF que el autor distribuye en Hugging Face, pensada para ejecutar inferencia de speech-to-text en entornos con recursos limitados mediante herramientas compatibles con GGUF.

El modelo base es un transformer encoder-decoder de aproximadamente 764 millones de parámetros (763.874.400 según los datos de safetensors), diseñado para transcripción multilingüe de audio. La variante publicada incluye el archivo `whisper-medium-Q8_0.gguf`, es decir, una cuantización de 8 bits que reduce el peso del repositorio hasta unos 0,8 GB, lo que facilita el despliegue en CPU y en GPU de gama consumer.

La relevancia de esta ficha radica en que permite ejecutar un modelo Whisper de tamaño medio con cuantización Q8_0 en pipelines locales de transcripción sin depender de infraestructura de GPU dedicada. No obstante, la model card del autor es extremadamente escueta y no aporta información sobre composición del dataset, benchmarks ni idiomas soportados más allá de los que hereda del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.874.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Whisper es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un modelo transformer encoder-decoder entrenado originalmente por OpenAI para reconocimiento automático de voz y traducción de voz. El encoder procesa espectrogramas log-Mel del audio y el decoder genera la transcripción de forma autorregresiva. El modelo base `openai/whisper-medium` cuenta con unos 764 millones de parámetros y está entrenado sobre un corpus multilingüe de audio supervisado, aunque la model card de esta conversión no detalla el número de horas, la composición del dataset ni si hubo etapas de RLHF o DPO.

La única innovación documentada en esta publicación es la cuantización a Q8_0 en formato GGUF, que reduce el tamaño de los pesos y permite ejecutar el modelo con `whisper.cpp` y otras herramientas compatibles con GGUF. No se documentan cambios arquitectónicos, decodificación especulativa ni técnicas de atención lineal en la información disponible.

## Capacidades

- Transcripción automática de voz a texto (speech-to-text) mediante el pipeline `automatic-speech-recognition`.
- Conversión de audio a texto en formato GGUF, ejecutable con `whisper.cpp` y runtimes compatibles.
- Capacidad multilingüe heredada del modelo base Whisper Medium (idiomas concretos no especificados en la model card de esta conversión).
- Traducción de voz a texto en inglés, según las capacidades del modelo base (no confirmado explícitamente en esta publicación).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documenta modo thinking, visión ni audio más allá de la propia transcripción.

## Casos de uso

- Transcripción local de reuniones: el modelo puede convertir audio de reuniones en texto ejecutándose en local con `whisper.cpp`, gracias a la cuantización Q8_0 que reduce el peso a unos 0,8 GB y permite desplegarlo sin GPU dedicada.
- Subtitulado automático de vídeos: integración en pipelines de postproducción para generar subtítulos a partir de pistas de audio, usando el formato GGUF en herramientas de línea de comandos.
- Dictado por voz en aplicaciones de escritorio: el modelo puede alimentar funciones de dictado en aplicaciones locales que requieran transcripción en tiempo casi real en CPU.
- Archivado y búsqueda de audio: transcripción masiva de grabaciones para indexar contenido y permitir búsqueda textual sobre archivos de audio históricos.
- Prototipado de asistentes de voz: uso como componente de ASR en sistemas de conversación locales antes de escalar a modelos mayores o servicios en la nube.
- Investigación en reconocimiento de voz: evaluación de la cuantización Q8_0 frente al modelo original en tareas de transcripción, con un coste de almacenamiento muy reducido.
- Despliegue en dispositivos edge: al caber en 0,8 GB, puede ejecutarse en dispositivos con recursos limitados donde no es viable cargar el modelo en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con cuantización Q8_0 el archivo pesa aproximadamente 0,8 GB, por lo que la huella de memoria es reducida en comparación con el modelo en precisión completa.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada explícitamente, pero el tamaño reducido del GGUF Q8_0 sugiere que puede ejecutarse en GPU consumer y en CPU.
- Opciones de despliegue: `whisper.cpp` y runtimes compatibles con GGUF; no se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card del autor es mínima y no documenta sesgos conocidos, riesgos de alucinación ni limitaciones específicas de esta conversión.
- No se especifican los idiomas soportados en esta publicación; la cobertura multilingüe depende del modelo base Whisper Medium y no está confirmada aquí.
- La longitud de contexto y las condiciones de audio de entrada no están documentadas en la información disponible.
- Al ser una conversión no oficial de un tercero, no hay garantía de que la cuantización Q8_0 preserve exactamente el comportamiento del modelo original.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base `openai/whisper-medium` y atribuir correctamente a OpenAI y al autor de la conversión.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Riesgo de alucinación inherente a los modelos de transcripción en segmentos de audio ruidosos o silenciosos, aunque no se documenta explícitamente para esta variante.

## Enlaces

- [Hugging Face: sayzly/whisper-medium-gguf](https://huggingface.co/sayzly/whisper-medium-gguf)
- [Modelo base: openai/whisper-medium](https://huggingface.co/openai/whisper-medium)
