# MaulikMadhavi/lapel_mic_whisper_base_finetuned

## Resumen

`MaulikMadhavi/lapel_mic_whisper_base_finetuned` es un ajuste fino de `openai/whisper-base` orientado al reconocimiento automático del habla (ASR) en ingles sobre grabaciones de un unico hablante captadas con microfono de solapa. Lo desarrolla el usuario de Hugging Face MaulikMadhavi y se reentrena de forma periodica, etiquetando cada publicacion con la fecha de entrenamiento en formato `vYYMMDD`; la version vigente en el momento de redactar esta ficha es `v261115`.

El modelo parte de la arquitectura Whisper base de OpenAI (transformer encoder-decoder para audio, 72.593.920 parametros) y se especializa mediante fine-tuning supervisado sobre un corpus propio (`MaulikMadhavi/lapel-mic-speech-asr-dataset`). Su interes practico es acotado pero claro: mejorar la transcripcion en un dominio muy concreto (audio de solapa, un solo locutor, ingles) frente al modelo base, reduciendo la tasa de error de palabras de 7,4 % a 5,8 % sobre 35 clips reservados.

No es un modelo de proposito general ni compite con los Whisper large o con los sistemas ASR modernos multilingues: es un artefacto de dominio especifico, con un dataset de entrenamiento muy pequeno (365 clips de 2 sesiones) y un unico idioma soportado. Resulta relevante para quienes necesiten una referencia de como se comporta el fine-tuning de Whisper en condiciones de pocos datos y audio de proximidad, o para reproducir el pipeline en sus propios corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 72.593.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper base, 30 s por segmento, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `openai/whisper-base`: un transformer encoder-decoder que procesa espectrogramas log-Mel y genera tokens de texto, con el vocabulario multitarea propio de Whisper (tokens de idioma, de tarea y de marcas temporales). El ajuste fino no modifica la topologia, solo los pesos, y se realiza sobre el dataset `MaulikMadhavi/lapel-mic-speech-asr-dataset`, compuesto por 365 clips procedentes de 2 sesiones de grabacion con microfono de solapa y un unico hablante.

No se documenta en la model card el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de aumento de datos, RLHF, DPO o decodificacion especulativa. El unico dato de evaluacion publicado es la WER sobre 35 clips reservados: 7,4 % para `openai/whisper-base`, 5,8 % para la release anterior y 5,8 % para la version actual `v261115`. El autor indica que el modelo se reentrena en ciclos regulares y que cada release se etiqueta con su fecha de entrenamiento, lo que sugiere un pipeline de reentrenamiento automatizado del que no se dan mas detalles.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio de microfono de solapa y un unico hablante.
- Reconocimiento automatico del habla con el pipeline `automatic-speech-recognition` de Transformers.
- Carga directa mediante `pipeline("automatic-speech-recognition", ...)` con seleccion de revision (`revision="v261115"`).
- Capacidad multilingue: no, solo ingles.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje generativo de proposito general).
- Soporte de agentes o razonamiento multi-step: no aplica.
- Capacidades especiales (vision, audio de entrada adicional, thinking mode): no disponibles; solo ASR.

## Casos de uso

- Transcripcion de entrevistas o notas de voz grabadas con microfono de solapa: el ajuste fino reduce la WER frente al modelo base en este dominio concreto (5,8 % frente a 7,4 %), por lo que es adecuado cuando el audio de entrada se captura en condiciones similares a las del dataset de entrenamiento.
- Generacion de subtitulos para videos de un unico ponente en ingles: el pipeline de Transformers devuelve texto con marcas temporales, integrable en un flujo de postproduccion.
- Prototipado rapido de ASR en aplicaciones de dictado personal: al ser un modelo de 72,6 M de parametros, se puede ejecutar en CPU o en GPU de gama baja para pruebas de concepto.
- Creacion de un baseline reproducible de fine-tuning de Whisper con pocos datos: util para investigadores que quieran comparar su propio ajuste con un caso documentado de 365 clips y 2 sesiones.
- Indexacion y busqueda de contenido hablado en archivos de audio de un solo locutor: la transcripcion alimenta un motor de busqueda de texto sobre el corpus.
- Evaluacion de la degradacion fuera de dominio: sirve como referencia para medir cuanto empeora la WER cuando el audio no procede de microfono de solapa o cuando hay varios hablantes, ya que el modelo no se entreno para esos escenarios.
- Integracion en un pipeline de reentrenamiento periodico: el esquema de versionado `vYYMMDD` permite fijar revisiones concretas en produccion y actualizar de forma controlada.

## Benchmarks y rendimiento

| Modelo | WER (35 clips reservados) |
|---|---|
| `openai/whisper-base` | 7,4 % |
| Release anterior | 5,8 % |
| `v261115` (actual) | 5,8 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,3 GB solo para pesos (72,6 M de parametros), mas overhead de activaciones y del pipeline; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,15 GB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU para audio de duracion corta o moderada.
- Cabe en GPU consumer: si, en practicamente todas (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`; tambien es compatible con `faster-whisper` y `whisper.cpp` si se convierte el modelo a los formatos correspondientes (no confirmado en la model card). vLLM y TGI no estan orientados a ASR y no aplican.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en el dominio del autor |
|---|---|---|---|---|---|
| `MaulikMadhavi/lapel_mic_whisper_base_finetuned` | 72,6 M | 30 s por segmento (Whisper base) | en | no disponible | 5,8 % |
| `openai/whisper-base` | 74 M aprox. | 30 s por segmento | multilingue | MIT (segun el modelo original) | 7,4 % |
| `openai/whisper-small` | 244 M aprox. | 30 s por segmento | multilingue | MIT (segun el modelo original) | no disponible |
| `openai/whisper-large-v3` | 1.550 M aprox. | 30 s por segmento | multilingue | MIT (segun el modelo original) | no disponible |

La comparacion se limita a la familia Whisper porque no se dispone de datos de otros modelos ASR en la informacion proporcionada. La ventaja del ajuste fino es exclusivamente en el dominio del dataset del autor; fuera de el, el modelo base o variantes mayores probablemente ofrezcan mejor robustez, aunque no se aportan mediciones que lo confirmen.

## Limitaciones y advertencias

- Entrenado sobre un unico hablante y 2 sesiones de grabacion: la generalizacion a otras voces, acentos o condiciones acusticas es incierta y no se ha medido.
- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Dataset de entrenamiento muy pequeno (365 clips): riesgo alto de sobreajuste al dominio y de degradacion fuera de la distribucion de entrenamiento.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Riesgo de alucinacion de texto en pasajes con ruido, silencios o audio no inteligible, comportamiento comun en modelos Whisper.
- No se documentan sesgos especificos, pero al entrenarse con un unico hablante puede heredar sus particularidades de pronunciacion.
- La WER publicada (5,8 %) se calcula sobre 35 clips del mismo dominio; no es representativa de un uso general.
- No se especifican los terminos de la licencia del modelo base en esta ficha; se recomienda revisar la licencia de `openai/whisper-base` para uso derivado.
- El modelo se reentrena periodicamente y las revisiones antiguas pueden quedar obsoletas; fijar la revision (`revision="v261115"`) en produccion para evitar cambios inesperados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaulikMadhavi/lapel_mic_whisper_base_finetuned
- Dataset de entrenamiento: https://huggingface.co/datasets/MaulikMadhavi/lapel-mic-speech-asr-dataset
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
