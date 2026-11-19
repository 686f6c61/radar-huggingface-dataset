# sayzly/whisper-base-gguf

## Resumen

`sayzly/whisper-base-gguf` es una conversión al formato GGUF del modelo `openai/whisper-base`, publicado por el usuario sayzly. Se trata de una redistribución de los pesos originales de Whisper en su variante "base" (72,6 millones de parámetros), empaquetados como un único fichero `whisper-base-Q8_0.gguf` con cuantización de 8 bits. El modelo hereda la licencia Apache 2.0 del original y está etiquetado para la tarea de reconocimiento automático del habla (ASR).

La relevancia de esta ficha es limitada: el repositorio no aporta ninguna innovación técnica, ni datos de entrenamiento propios, ni evaluación adicional. Su único valor es práctico: ofrece los pesos de Whisper Base en un formato GGUF cuantizado a Q8_0, lo que facilita su despliegue en runtimes compatibles con GGUF (por ejemplo, `whisper.cpp`) sin necesidad de convertir los pesos desde safetensors. No obstante, el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue creado en noviembre de 2026, por lo que su adopción es nula.

Whisper Base es un modelo transformer encoder-decoder entrenado por OpenAI para transcripción y traducción de voz, con una ventana de audio de 30 segundos por segmento. Esta conversión no modifica la arquitectura ni el comportamiento del modelo original; cualquier limitación o capacidad descrita a continuación corresponde al modelo base de OpenAI y se aplica igualmente aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.610.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, según el modelo base) |
| Tipos de cuantizacion | Q8_0 (único fichero publicado: `whisper-base-Q8_0.gguf`) |
| Idiomas soportados | no disponible en la información proporcionada (Whisper Base original es multilingüe, pero el repo no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Base de OpenAI: un transformer encoder-decoder que procesa espectrogramas de audio de 30 segundos y genera tokens de texto. El encoder transforma el espectrograma en representaciones latentes y el decoder autoregresivo produce la transcripción, con tokens especiales de control de idioma y de tarea (transcripción o traducción). El modelo tiene 72,6 millones de parámetros, lo que lo sitúa en la variante más pequeña de la familia Whisper junto con Tiny.

No hay información en el repositorio sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni sobre si hubo ajuste por RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional. La única intervención del autor es la conversión de los pesos originales a GGUF con cuantización Q8_0; no se indica la herramienta de conversión ni se aportan métricas de degradación por cuantización.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, heredada de Whisper Base.
- Traducción de voz a texto: el modelo base de OpenAI soporta la tarea de traducción al inglés desde otros idiomas mediante tokens de tarea, aunque el repo no lo documenta explícitamente.
- Procesamiento de segmentos de audio de hasta 30 segundos por inferencia.
- Capacidad multilingüe teórica (Whisper Base original es multilingüe), si bien el repositorio no declara la lista de idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo "thinking", visión ni audio de salida.
- No se documentan capacidades especiales adicionales más allá de la transcripción.

## Casos de uso

- Transcripción de notas de voz en aplicaciones móviles: el tamaño reducido (72,6 M de parámetros, repo de 0,1 GB) permite ejecutar la inferencia en dispositivos con recursos limitados usando runtimes GGUF, transcribiendo mensajes cortos de menos de 30 segundos.
- Subtitulado de clips cortos en local: para vídeos de hasta 30 segundos por segmento, el modelo puede generar subtítulos sin depender de servicios en la nube, útil en herramientas de edición offline.
- Prototipado rápido de pipelines ASR: al estar en GGUF, se puede integrar en `whisper.cpp` u otros runtimes compatibles para validar una idea de producto antes de invertir en modelos mayores.
- Transcripción en entornos con privacidad estricta: al ejecutarse localmente, el audio no sale del dispositivo, lo que encaja en escenarios donde no se permite enviar datos a APIs externas.
- Preprocesado de audio para sistemas de análisis: convertir grabaciones cortas a texto como paso previo a búsqueda, indexación o clasificación de contenido.
- Educación y experimentación: servir como modelo de referencia para comparar el rendimiento de Whisper Base frente a variantes Tiny, Small o Medium en tareas de docencia o investigación sobre ASR.
- Asistencia a personas con discapacidad auditiva en conversaciones presenciales cortas: transcripción en tiempo casi real de intervenciones de pocos segundos en un dispositivo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 0,1 GB (tamaño del repo), por lo que la huella de memoria es inferior a 1 GB incluyendo buffers de activación y el espectrograma de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere una A100 ni H100. Una GTX 1650, RTX 3050 o superior funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU.
- Opciones de despliegue: al ser GGUF, los runtimes habituales son `whisper.cpp` y `llama.cpp` (con soporte de audio); también puede usarse con bindings de Python sobre `whisper.cpp`. No se documenta compatibilidad con vLLM ni TGI para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/whisper-base-gguf | 72,6 M | no disponible (30 s de audio) | GGUF Q8_0 | apache-2.0 | Hugging Face, 0 descargas |
| openai/whisper-base | 72,6 M | no disponible (30 s de audio) | safetensors / PyTorch | apache-2.0 | Hugging Face, ampliamente adoptado |
| openai/whisper-tiny | 39 M | no disponible (30 s de audio) | safetensors / PyTorch | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | no disponible (30 s de audio) | safetensors / PyTorch | apache-2.0 | Hugging Face |

La comparativa se limita a variantes de la misma familia porque el repositorio no proporciona datos de rendimiento que permitan comparar con alternativas de otros autores. Frente a `openai/whisper-base`, esta conversión solo cambia el formato y la cuantización; frente a Tiny y Small, la diferencia es de tamaño y, presumiblemente, de calidad ASR, aunque no se aportan métricas en este repositorio.

## Limitaciones y advertencias

- El repositorio no incluye evaluación propia: no hay WER, ni comparación con el modelo original, ni análisis de la degradación introducida por la cuantización Q8_0.
- No se declara la lista de idiomas soportados, aunque el modelo base de OpenAI es multilingüe; conviene verificar el comportamiento en el idioma objetivo antes de usarlo en producción.
- Whisper Base tiene una ventana de 30 segundos por segmento; audios más largos requieren segmentación manual, lo que puede introducir errores en las fronteras.
- Riesgo de alucinación: los modelos Whisper son conocidos por generar texto plausible en segmentos con silencio, ruido o audio de baja calidad; este repositorio no documenta mitigaciones.
- Sesgos: al no documentarse los datos de entrenamiento, no es posible evaluar sesgos de género, acento o dialecto; se heredan los del modelo original de OpenAI.
- Licencia Apache 2.0: permite uso comercial, pero el autor del repositorio no ofrece garantías ni soporte; la responsabilidad recae en el usuario.
- Adopción nula (0 descargas, 0 likes) y fecha de creación reciente: no hay evidencia de que la conversión haya sido validada por terceros.
- El repositorio no indica la herramienta de conversión ni la versión de `whisper.cpp` compatible, lo que puede causar problemas de interoperabilidad.
- El nombre del autor ("sayzly") aparece en las etiquetas y en la model card como marca; no se trata de un proyecto de OpenAI ni está respaldado por la organización original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/whisper-base-gguf
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- `whisper.cpp` (runtime GGUF para Whisper): https://github.com/ggerganov/whisper.cpp
