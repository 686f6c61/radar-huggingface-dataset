# khaled-soliman/slices-models

## Resumen

`khaled-soliman/slices-models` es un repositorio de artefactos de pesos, no un modelo entrenado por su autor. Contiene ficheros utilizados por el plugin de subtítulos "Slices", que los descarga en su primera ejecución. El único artefacto documentado en la model card es `ggml-cs-medium-ar-en.bin`, una conversión al formato ggml de `Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched`, un ajuste fino de Whisper-medium para reconocimiento de voz con alternancia de código árabe/inglés. Los pesos no se han modificado: solo se ha cambiado el formato del fichero.

El modelo subyacente es, por tanto, un Whisper-medium: arquitectura transformer encoder-decoder para reconocimiento automático del habla (ASR), con aproximadamente 769 millones de parámetros y una ventana de audio de 30 segundos por inferencia. No es un modelo de lenguaje generativo ni un modelo multimodal general; su tarea es transcribir audio a texto.

Su relevancia es acotada: sirve como ejemplo de distribución de modelos en formato ggml para plugins de escritorio, y como referencia de un fine-tune de Whisper orientado a un par de idiomas concreto (árabe/inglés) con licencia Apache-2.0. No hay información publicada sobre datos de entrenamiento del fine-tune, métricas de evaluación ni idiomas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-medium), conversion a ggml |
| Parametros totales | aproximadamente 769 M (Whisper-medium; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia (Whisper); contexto de texto no disponible |
| Tipos de cuantizacion | no disponible (el fichero es una conversion ggml; el nivel de cuantizacion no se especifica) |
| Idiomas soportados | arabe e ingles con alternancia de codigo (code-switching), segun la model card del modelo original |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (`.bin`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper-medium: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para ASR multilingüe y traducción de voz. El encoder procesa espectrogramas log-Mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El fichero `ggml-cs-medium-ar-en.bin` es una conversión de formato de los pesos de `Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched`; no se ha reentrenado ni modificado los pesos en este repositorio.

No se dispone de información sobre el proceso de ajuste fino del modelo original: número de horas de audio, composición del dataset árabe/inglés, uso de aumentación de datos, ni si hubo técnicas de regularización o destilación. Tampoco se documenta en la información proporcionada si el fine-tune empleó decodificación especulativa, atención lineal u otras optimizaciones. La única innovación declarada es la conversión a ggml para su uso en un plugin de escritorio.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de hasta 30 segundos por segmento.
- Transcripción con alternancia de código árabe/inglés en una misma emisión.
- Generación de subtítulos, que es el caso de uso declarado por el plugin Slices.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de traducción, diarización de hablantes ni marcas de tiempo a nivel de palabra.
- Capacidades multilingües limitadas, según la model card, al par árabe/inglés; el resto de idiomas de Whisper-medium no se confirma para este fine-tune.

## Casos de uso

- Subtitulado automático de vídeo en árabe con insertos en inglés: el modelo transcribe audio de hasta 30 segundos por segmento y genera texto con marcas temporales, adecuado para el plugin Slices y para pipelines de postproducción.
- Transcripción de reuniones bilingües árabe/inglés: útil en entornos corporativos del Golfo Pérsico o en equipos con mezcla de idiomas, donde los modelos monolingües fallan en los cambios de código.
- Generación de subtítulos para contenido educativo y divulgativo: conferencias o clases impartidas en árabe con terminología técnica en inglés, donde el code-switching es frecuente.
- Indexación y búsqueda de archivos de audio: transcripción previa para alimentar motores de búsqueda o sistemas RAG sobre grabaciones, aprovechando la licencia Apache-2.0 para uso comercial.
- Análisis de medios y monitorización: transcripción de emisiones de radio o televisión en árabe/inglés para extracción de temas y palabras clave.
- Integración en aplicaciones de escritorio o locales: el formato ggml permite ejecución en CPU sin GPU dedicada, lo que facilita su inclusión en plugins y herramientas de escritorio con requisitos de privacidad (el audio no sale del equipo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, BLEU ni comparaciones con otros modelos, y tampoco se han encontrado métricas del fine-tune original en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; para Whisper-medium en fp16 se requieren del orden de 1,5-2 GB, y en cuantizaciones ggml de 8 bits o 4 bits el consumo baja sustancialmente. El tamaño del repo (1,5 GB) sugiere pesos en precisión cercana a fp16 o q8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para cuantizaciones ggml puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, así como en Apple Silicon mediante Metal.
- Opciones de despliegue: el formato ggml es compatible con `whisper.cpp` y con bindings derivados; no se documenta compatibilidad con vLLM ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| slices-models (Whisper-medium ar/en) | ~769 M | 30 s | arabe/ingles (code-switching) | Apache-2.0 | ggml |
| Whisper-medium (OpenAI) | ~769 M | 30 s | multilingue (99 idiomas) | MIT | safetensors, ggml |
| Whisper-large-v3 | ~1,55 B | 30 s | multilingue | MIT | safetensors, ggml |
| Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched | ~769 M | 30 s | arabe/ingles | Apache-2.0 | safetensors |

La ventaja frente a Whisper-medium genérico es la especialización en code-switching árabe/inglés; la desventaja es la pérdida de cobertura multilingüe y la falta de métricas publicadas. Frente a Whisper-large-v3, ofrece menor coste computacional a cambio de menor precisión potencial, no verificada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es un contenedor de artefactos de terceros; los derechos pertenecen a los autores originales.
- No hay métricas de calidad publicadas (WER u otras), por lo que no se puede garantizar su rendimiento en producción.
- Especializado en árabe/inglés: el rendimiento en otros idiomas no está documentado y probablemente sea degradado respecto a Whisper-medium original.
- Ventana de audio de 30 segundos: requiere segmentación previa para grabaciones largas.
- Riesgo de alucinación en ASR: Whisper puede generar texto plausible en silencios o audio ruidoso; se recomienda validación con detección de actividad vocal.
- Sesgos potenciales derivados de los datos de ajuste fino, no documentados.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de copyright y la licencia original (`LICENSE-Apache-2.0.txt`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni mantenimiento activo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/khaled-soliman/slices-models
- Modelo original: https://huggingface.co/Seif-Eldeen-Sameh/whisper-medium-arabic-codeswitched
- Whisper (OpenAI), paper: https://arxiv.org/abs/2212.04356
- whisper.cpp (implementación ggml): https://github.com/ggerganov/whisper.cpp
