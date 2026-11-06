# Audante/faster-whisper-small-ct2

## Resumen

`Audante/faster-whisper-small-ct2` es un espejo (mirror) del modelo `Systran/faster-whisper-small`, que a su vez es una conversión a CTranslate2 del `openai/whisper-small` original. El modelo realiza reconocimiento automático del habla (ASR) y está pensado para su uso con la librería `faster-whisper`, que ofrece inferencia entre 2 y 4 veces más rápida que la implementación original de OpenAI con menor consumo de memoria, gracias al motor CTranslate2.

El repositorio reproduce fielmente los ficheros del modelo fuente en la revisión `536b0662742c02347bc0e980a01041f333bce120`, sin modificaciones. Es, por tanto, un artefacto de conveniencia para descargar los pesos ya convertidos, no una contribución técnica nueva. La licencia es MIT, heredada del modelo original de OpenAI.

Se trata de un modelo de tamaño pequeño (aproximadamente 244 millones de parámetros en su variante original Whisper small), lo que lo hace adecuado para despliegues con recursos limitados, transcripción en tiempo real en CPU o GPU de gama media, y pipelines de subtitulado. No obstante, al ser un espejo no oficial, conviene verificar la integridad de los ficheros antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a CTranslate2 |
| Parámetros totales | no disponible (el modelo base `openai/whisper-small` tiene ~244 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible en la información (CTranslate2 admite float32, float16, int8, int8_float16) |
| Idiomas soportados | no disponible en la información (Whisper small original soporta multilingüe, ~99 idiomas) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (`model.bin`, tokenizer y vocabulario) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper small de OpenAI, un transformer encoder-decoder entrenado para transcripción y traducción de voz a texto. La conversión a CTranslate2 no altera la arquitectura ni los pesos: únicamente transforma el grafo y los tensores a un formato optimizado para inferencia en CPU y GPU, con soporte para cuantización int8 y float16. No hay información en la model card sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o fine-tuning posteriores; esos detalles corresponden al modelo original de OpenAI y no se reproducen aquí.

La innovación relevante no está en el modelo sino en el runtime: CTranslate2 aplica optimizaciones de memoria, fusión de operaciones y decodificación por lotes que aceleran la inferencia respecto a la implementación de referencia. `faster-whisper` añade además segmentación por VAD (detección de actividad de voz) y gestión eficiente de la ventana de 30 segundos característica de Whisper.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Traducción de voz a texto en inglés (capacidad heredada del modelo Whisper multilingüe original).
- Detección de idioma en el audio de entrada.
- Segmentación temporal con marcas de tiempo por segmento.
- Procesamiento por lotes de múltiples ficheros de audio mediante `faster-whisper`.
- Ejecución en CPU con cuantización int8, además de GPU.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso.
- No procesa visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de vídeo: el modelo genera transcripciones con marcas de tiempo por segmento que pueden exportarse a SRT/VTT; su tamaño reducido permite procesar horas de vídeo en CPU en un tiempo razonable.
- Transcripción de reuniones y notas de voz: con `faster-whisper` y segmentación VAD se pueden procesar grabaciones largas dividiéndolas en ventanas de 30 s sin perder contexto entre segmentos.
- Indexación y búsqueda de contenido en archivos de audio: transcribir un archivo de podcasts o llamadas y alimentar un motor de búsqueda textual o un pipeline RAG.
- Asistentes de voz en local: al ejecutarse en CPU con int8, puede integrarse en aplicaciones de escritorio o edge sin depender de servicios en la nube.
- Accesibilidad: generación de subtítulos en directo para vídeos pregrabados y material educativo, con licencia MIT que permite uso comercial.
- Prototipado rápido de pipelines ASR: sirve como baseline ligero antes de escalar a modelos `large-v3` si la precisión no es suficiente.
- Transcripción por lotes en servidores sin GPU: la cuantización int8 de CTranslate2 permite throughput aceptable en CPUs multinúcleo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, latencia ni throughput, y al ser un espejo sin modificaciones los resultados serían equivalentes a los de `Systran/faster-whisper-small` y `openai/whisper-small`, que no se detallan aquí.

## Requisitos de hardware

- VRAM estimada: no disponible en la información; para Whisper small en float16 se suele requerir del orden de 1-2 GB, y en int8 menos de 1 GB, aunque estos valores no están confirmados en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float16; tarjetas consumer como GTX 1650, RTX 3060 o superiores son suficientes. En GPU de datacenter (A100, H100) el modelo está infrautilizado.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas.
- Despliegue: `faster-whisper` (Python), `ctranslate2` directamente, o servidores compatibles como `wyoming-faster-whisper`. No es compatible con vLLM, llama.cpp ni Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Audante/faster-whisper-small-ct2 (este) | ~244 M (base) | ventanas de 30 s | MIT | CTranslate2 | Hugging Face, espejo no oficial |
| Systran/faster-whisper-small | ~244 M | ventanas de 30 s | MIT | CTranslate2 | Hugging Face, referencia oficial de la conversión |
| openai/whisper-small | ~244 M | ventanas de 30 s | MIT | PyTorch (safetensors/bin) | Hugging Face, release oficial de OpenAI |
| openai/whisper-large-v3 | ~1.550 M | ventanas de 30 s | MIT | PyTorch | Hugging Face, mayor precisión y coste |

La diferencia principal entre este modelo y `Systran/faster-whisper-small` es únicamente la procedencia del repositorio: los ficheros son idénticos según la model card. Frente a `openai/whisper-small`, la ventaja es el runtime CTranslate2, más rápido y ligero; frente a `whisper-large-v3`, este modelo sacrifica precisión a cambio de velocidad y menores requisitos de hardware.

## Limitaciones y advertencias

- Es un espejo no oficial: la model card indica explícitamente que no es un release oficial y que los ficheros son idénticos al origen; conviene verificar los checksums (`SHA256SUMS`) antes de usarlo en producción.
- Al no incluir modificaciones, hereda todas las limitaciones de Whisper small: mayor tasa de error que las variantes medium y large, especialmente en audio con ruido, acentos marcados o vocabulario técnico.
- Riesgo de alucinación: Whisper puede generar texto plausible en segmentos de silencio o ruido; se recomienda usar VAD para mitigarlo.
- Idiomas: la model card no detalla la lista de idiomas soportados; el modelo base es multilingüe, pero el rendimiento varía notablemente entre idiomas y el español no está validado específicamente en esta ficha.
- Licencia MIT: permite uso comercial y modificación, pero los derechos morales y de autoría permanecen con OpenAI y Systran.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso; no debe evaluarse como modelo de lenguaje.
- No hay información sobre sesgos demográficos o acústicos específicos de esta conversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Audante/faster-whisper-small-ct2
- Modelo fuente de la conversión: https://huggingface.co/Systran/faster-whisper-small
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-small
- Repositorio `faster-whisper`: https://github.com/SYSTRAN/faster-whisper
- Repositorio CTranslate2: https://github.com/OpenNMT/CTranslate2
- Paper de Whisper: https://arxiv.org/abs/2212.04356
