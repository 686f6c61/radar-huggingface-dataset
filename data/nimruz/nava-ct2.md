# Nimruz/Nava-ct2

## Resumen

Nava-ct2 es la conversión a CTranslate2 del modelo Nava, un sistema de reconocimiento automático del habla (ASR) especializado en persa (farsi). Lo desarrolla el usuario Nimruz y se distribuye con licencia MIT. Está pensado para su uso con faster-whisper, la implementación optimizada de Whisper basada en CTranslate2, lo que permite inferencia más rápida y con menor consumo de memoria que la implementación original de referencia.

El modelo parte de una arquitectura Whisper (transformer encoder-decoder para ASR) afinada específicamente para persa, con el prompt de idioma fijado y sin tokens de marcas de tiempo. La conversión se ha realizado en precisión float16 y ocupa 1,6 GB en el repositorio, lo que lo hace manejable en GPU de consumo y en CPU con cuantización int8.

Su relevancia radica en cubrir un idioma con poca representación en los modelos ASR generalistas, ofreciendo una vía de despliegue lista para producción mediante faster-whisper. No se dispone de información sobre el tamaño exacto de parámetros ni sobre datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), convertido a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos por segmento, herencia de Whisper) |
| Tipos de cuantizacion | float16 (version publicada); int8 y float32 soportados por faster-whisper en CPU |
| Idiomas soportados | persa (fa) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (modelo convertido para faster-whisper) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder diseñado para transcripción de audio, en este caso afinado para persa. La versión publicada en este repositorio es una conversión a CTranslate2 en float16, orientada a la librería faster-whisper, que sustituye la inferencia de referencia por kernels optimizados.

Según la model card, el modelo se afinó con el prompt de persa y sin tokens de marcas de tiempo, lo que condiciona el uso: es obligatorio pasar `language="fa"` y `without_timestamps=True`. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión se validó comparando la salida con el modelo original en 10 clips de test de FLEURS: en 9 de 10 el texto fue idéntico y en el décimo hubo una diferencia de una o dos palabras.

## Capacidades

- Transcripción de voz a texto en persa (farsi) con un único idioma soportado.
- Inferencia optimizada mediante CTranslate2 y faster-whisper, con soporte de float16 en GPU y float32/int8 en CPU.
- Procesamiento de audio en segmentos de hasta 30 segundos; para audio más largo es necesario trocearlo en puntos de silencio o usar el script `transcribe.py` del repositorio principal.
- Salida sin puntuación y con los números escritos con letras; el repositorio principal incluye un formateador que convierte números, fechas y horas habladas a dígitos.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: no disponible; el modelo está especializado exclusivamente en persa.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: se trocea el audio en fragmentos de hasta 30 segundos en puntos de silencio y se transcribe con faster-whisper en GPU con float16, aprovechando la velocidad de CTranslate2.
- Subtitulado de contenido audiovisual en persa: aunque el modelo no genera marcas de tiempo, se puede segmentar el audio previamente y alinear cada transcripción con su fragmento para producir subtítulos.
- Atención al cliente y análisis de llamadas: transcripción de grabaciones telefónicas en persa para su posterior indexación o análisis, con despliegue en CPU usando int8 si no hay GPU disponible.
- Generación de actas y resúmenes a partir de audio: la transcripción sirve como entrada a un modelo de lenguaje posterior; el formateador del repositorio principal normaliza números y fechas antes de ese paso.
- Investigación lingüística y creación de corpus en persa: el modelo permite transcribir grandes volúmenes de audio de forma automatizada, con la ventaja de una licencia MIT que facilita su uso académico y comercial.
- Integración en pipelines de accesibilidad: transcripción en tiempo casi real de audio en persa para personas con discapacidad auditiva, desplegando faster-whisper con `device="cuda"` y `compute_type="float16"`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única referencia de calidad es la comparación cualitativa con el modelo original en 10 clips de FLEURS, con coincidencia exacta en 9 de 10 y una diferencia de una o dos palabras en el restante.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,6 GB y la conversión es float16, por lo que el modelo cabe holgadamente en GPU de consumo.
- GPU recomendadas: no se especifican; cualquier GPU compatible con CUDA y suficiente memoria para un modelo de este tamaño debería ser válida.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente VRAM para un modelo de 1,6 GB en float16; no se detallan modelos concretos.
- Despliegue: faster-whisper con CTranslate2, en GPU (`device="cuda"`, `compute_type="float16"`) o en CPU (`device="cpu"`, `compute_type="float32"` o `"int8"` para menor consumo de memoria).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| Nava-ct2 | Persa | Whisper convertido a CTranslate2 | 30 s por segmento | MIT | CTranslate2 |
| Nava (original) | Persa | Whisper | 30 s por segmento | MIT | no disponible en la informacion |
| Whisper de OpenAI | Multilingüe | Whisper | 30 s por segmento | MIT | safetensors, CTranslate2, GGUF, etc. |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta persa; no debe usarse con otros idiomas.
- Es obligatorio pasar `language="fa"` y `without_timestamps=True`; de lo contrario, la salida puede degradarse.
- El audio de más de 30 segundos debe trocearse en puntos de silencio; `vad_filter=True` podría servir, pero no se ha probado con Nava.
- La salida no incluye puntuación y escribe los números con letras; requiere un paso de formateo posterior para muchos usos en producción.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes: no se documentan evaluaciones específicas al respecto.
- No se han publicado datos sobre sesgos del modelo.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución y revisar las condiciones del modelo base.
- La validación de la conversión se limita a 10 clips de FLEURS, una muestra pequeña.

## Enlaces

- [Nimruz/Nava-ct2 en Hugging Face](https://huggingface.co/Nimruz/Nava-ct2)
- [Nimruz/Nava (modelo base)](https://huggingface.co/Nimruz/Nava)
- [faster-whisper (GitHub)](https://github.com/SYSTRAN/faster-whisper)
