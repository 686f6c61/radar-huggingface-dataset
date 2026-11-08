# rasmusjs/nb_NO-vox-medium

## Resumen

nb_NO-vox-medium es un modelo de síntesis de voz (text-to-speech) para noruego bokmål, publicado por el usuario rasmusjs en Hugging Face. Se trata de una voz completa para el motor Piper, distribuida como un único fichero ONNX de 63,5 MB más su configuración JSON asociada. El modelo es el resultado de destilar el profesor OpenBMB VoxCPM2 (un modelo de 2B parámetros que requiere GPU y genera audio a 48 kHz) en un estudiante VITS mucho más pequeño, partiendo del checkpoint base noruego `talesyntese` de NbAiLab.

La relevancia del modelo reside en su perfil de despliegue: síntesis en tiempo real sobre CPU, sin necesidad de GPU, con un tamaño que permite ejecutarlo en dispositivos de bajos recursos como una Raspberry Pi o integrarlo como voz nativa en Home Assistant. Frente al profesor, el estudiante pierde aproximadamente 1,3 puntos porcentuales de WER medio en el conjunto de evaluación, pero reduce el coste computacional en varios órdenes de magnitud.

El modelo está entrenado y verificado de extremo a extremo para un único idioma (`nb`) y se publica bajo licencia CC0-1.0. La model card documenta con detalle la procedencia de los datos, el proceso de generación sintética, la verificación automática con NB-Whisper y la selección del checkpoint final por WER en lugar de por pérdida de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Piper), monohablante |
| Parámetros totales | no disponible (pesos ONNX de 63,5 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase) |
| Tipos de cuantización | no disponible (se distribuye un único ONNX; el ecosistema Piper suele ofrecer variantes medium/low, no documentadas aquí) |
| Idiomas soportados | noruego bokmål (`nb`, voz espeak `nb`) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX + JSON de configuración |
| Frecuencia de muestreo | 22,05 kHz mono |
| Calidad declarada | medium |
| Modelo base | NbAiLab/nb-tts-norwegian-piper-trimmed (checkpoint `epoch=3459-step=2052250.ckpt`, Piper `talesyntese`, datos CC0) |
| Modelo profesor | OpenBMB VoxCPM2 (2B, GPU, 48 kHz, Apache 2.0) |
| Datos de entrenamiento | 10 333 clips sintéticos, 13,9 h |
| Librería | piper (probado con piper-tts 1.8.0) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un VITS monohablante ejecutado por el motor Piper, con entrada de fonemas generada por el frontend espeak-ng `nb`. La síntesis se realiza a 22,05 kHz en mono. El punto de partida es el checkpoint `epoch=3459` del modelo `talesyntese` de NbAiLab (entrenado sobre datos NST Talesyntese con licencia CC0), que se afina hasta el epoch 3759; el checkpoint publicado es el 3744 (+285 epochs respecto al base), con batch 20, learning rate 1e-4 y precisión 32.

El corpus de destilación consta de 12 097 frases modernas extraídas de Wikipedia noruega (dos conjuntos de Språkbanken), párrafos didácticos de NDLA, conjuntos de instrucciones de NbAiLab/norwegian-alpaca, listas de ejercicios de nombres y ciudades (estadísticas del SSB y Simplemaps) y el conjunto hhval/norwegian_qa derivado de Språkrådet. Se descartaron frases de libros de dominio público por sonar arcaicas. VoxCPM2 leyó cada frase con un hablante sintético fijo ("vox8"); NB-Whisper transcribió cada clip y la comparación se hizo a nivel de fonemas espeak-ng para evitar falsos rechazos por puntuación o formato numérico. Pasaron 10 336 clips (85 %); tras descartar tres clips patológicos quedaron 10 333. Cada clip se recortó, se normalizó a -23 LUFS con techo de pico de -0,95 dBFS, se remuestreó a 22 050 Hz y se alineó al mapa de fonemas base.

La innovación metodológica destacable es la selección del checkpoint final por WER sobre un conjunto retenido (no por pérdida de validación): se exportaron y puntuaron cuatro checkpoints (epoch 3494: 14,5 %; 3554: 13,2 %; 3629: 13,7 %; 3744: 12,5 % de WER medio). No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre audio sintético verificado.

## Capacidades

- Síntesis de voz en noruego bokmål a partir de texto plano, con salida WAV a 22,05 kHz mono.
- Pronunciación específica de fechas, años, horas y nombres noruegos comunes, incluidos explícitamente en los datos de entrenamiento (conjuntos de prueba dedicados de 16 frases cada uno).
- Inferencia en tiempo real sobre CPU, sin GPU, adecuada para dispositivos embebidos.
- Integración directa con Home Assistant como voz Piper instalable (copiar ONNX y JSON al directorio de voces).
- Uso desde CLI (`piper`) y desde Python mediante `PiperVoice.load()` y `synthesize_wav()`.
- Monohablante: una única voz sintética fija ("vox8"), sin control de hablante ni clonación.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio de entrada; es exclusivamente un modelo TTS.
- Cobertura limitada a un solo idioma; no hay capacidades multilingües.

## Casos de uso

- Asistente de voz doméstico con Home Assistant: el modelo se instala copiando el ONNX y el JSON en el directorio de voces Piper y se selecciona como voz; al ejecutarse en CPU permite mantener la privacidad y funcionar sin conexión en una Raspberry Pi.
- Lectura de boletines meteorológicos y avisos: el ejemplo de la model card ("Værmelding for Vestlandet: Regn og frisk bris fra sjøen hele dagen") ilustra la síntesis de frases cortas con nombres de regiones y condiciones, un caso típico de integración con fuentes RSS o APIs meteorológicas.
- Anuncios de fecha y hora en sistemas de megafonía o domótica: el modelo incluye entrenamiento específico en años, fechas y horas, con un 10,1 % de WER en el conjunto dirigido de 16 frases, lo que lo hace adecuado para lectura de calendarios y recordatorios.
- Accesibilidad y lectura de pantalla en noruego: síntesis local de artículos de Wikipedia y textos NDLA (las fuentes principales del corpus) para usuarios con discapacidad visual, sin depender de servicios en la nube.
- Automatización de pipelines de audio para contenido editorial: generación por lotes de narraciones de artículos o párrafos didácticos mediante la CLI de Piper, con coste marginal nulo por carácter y sin cuotas de API.
- Pruebas y prototipado de interfaces de voz en noruego: al ser un modelo pequeño (63,5 MB) y con licencia CC0, se puede embeber en aplicaciones de escritorio o móviles para validar flujos conversacionales antes de invertir en un TTS comercial.
- Generación de datos sintéticos de voz para entrenamiento o evaluación de ASR en bokmål: el propio modelo se construyó con un pipeline similar (TTS sintético verificado con NB-Whisper), patrón reutilizable para aumentar corpus de reconocimiento de voz.

## Benchmarks y rendimiento

Evaluación de WER sobre 100 frases retenidas de Wikipedia noruega, transcritas con NbAiLab/nb-whisper-large y normalizadas antes de comparar:

| Modelo | WER medio | WER mediana | Clips perfectos |
|---|---|---|---|
| VoxCPM2 profesor (2B, GPU, 48 kHz) | 11,2 % | 7,4 % | 40 / 100 |
| nb_NO-vox-medium (epoch 3744) | 12,5 % | 9,1 % | 31 / 100 |

Pruebas dirigidas (16 frases cada una, mismo juez):

| Conjunto | WER |
|---|---|
| Fechas y años | 10,1 % |
| Nombres noruegos | 6,0 % |

Evolución de checkpoints exportados sobre las mismas 100 frases:

| Checkpoint | WER medio |
|---|---|
| Epoch 3494 | 14,5 % |
| Epoch 3554 | 13,2 % |
| Epoch 3629 | 13,7 % |
| Epoch 3744 (publicado) | 12,5 % |

La model card atribuye la brecha restante frente al profesor principalmente al frontend espeak-ng `nb` y a nombres extranjeros poco frecuentes. No se han publicado cifras de latencia ni de throughput (RTF) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia sobre CPU.
- GPU recomendadas: ninguna necesaria. El modelo está diseñado para ejecutarse en CPU, incluida una Raspberry Pi según la model card.
- Cabe en cualquier GPU consumer, pero no se aprovecha: el cuello de botella es la CPU y el frontend espeak-ng.
- Almacenamiento: 63,5 MB para el ONNX más el JSON de configuración; repositorio total de 0,1 GB.
- Opciones de despliegue: Piper CLI (`piper-tts` 1.8.0, versión probada), API Python `PiperVoice`, integración con Home Assistant. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (no aplican a un modelo VITS/ONNX de TTS).
- Latencia y throughput: la model card afirma ejecución en tiempo real sobre CPU, pero no publica valores numéricos de RTF ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Frecuencia | Licencia | Despliegue | WER (conjunto propio) |
|---|---|---|---|---|---|---|
| nb_NO-vox-medium | VITS (Piper) | 63,5 MB ONNX | 22,05 kHz | CC0-1.0 | CPU, Home Assistant | 12,5 % medio |
| OpenBMB VoxCPM2 (profesor) | no disponible en la información | 2B parámetros | 48 kHz | Apache 2.0 | GPU | 11,2 % medio |
| NbAiLab/nb-tts-norwegian-piper-trimmed (base) | VITS (Piper) | no disponible | no disponible | datos CC0 | CPU | no evaluado en la model card |
| Piper `talesyntese` medium (origen del base) | VITS (Piper) | no disponible | no disponible | datos CC0 | CPU | no disponible |

La comparación directa con otras voces Piper noruegas no es posible con los datos disponibles: la model card solo reporta WER frente al profesor VoxCPM2 y la evolución interna de checkpoints. El resultado de búsqueda web (openai/whisper-medium) corresponde a un modelo ASR, no a un TTS, y no es comparable en esta categoría.

## Limitaciones y advertencias

- Monohablante y monolingüe: solo noruego bokmål y una única voz sintética; no admite control de hablante, emoción ni clonación.
- Brecha de calidad frente al profesor: 12,5 % frente a 11,2 % de WER medio, con 31/100 clips perfectos frente a 40/100; la diferencia se concentra en el frontend espeak-ng y en nombres extranjeros.
- Dependencia del frontend espeak-ng `nb`: la normalización de texto y la fonemización fuera del modelo condicionan la calidad final; errores en esa capa no son corregibles por los pesos.
- Riesgo de alucinación acústica y de pronunciación incorrecta en palabras fuera del dominio (términos técnicos, marcas, nombres no noruegos), aunque no se cuantifica en la model card.
- Audio de entrenamiento completamente sintético: puede heredar artefactos o sesgos prosódicos del profesor VoxCPM2 y del hablante fijo "vox8".
- Datos de audio y transcripciones no distribuidos: solo se publican los pesos; el autor declara no haber encontrado evidencia de que las frases de entrenamiento sean recuperables desde los pesos, pero no se aporta una auditoría independiente.
- Licencia CC0-1.0 para los pesos, pero las fuentes de texto del corpus tienen licencias diversas (CC BY-SA, CC BY 4.0, Apache 2.0) y ocho frases sin licencia registrada; conviene revisar la procedencia si se redistribuye el modelo en productos comerciales.
- El modelo base requiere inicio de sesión en Hugging Face para acceder al checkpoint original; se ofrece un espejo, pero la trazabilidad exacta depende de ese acceso.
- Sin datos publicados de latencia, RTF ni comportamiento en producción a gran escala; la afirmación de tiempo real en CPU no está cuantificada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de uso independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasmusjs/nb_NO-vox-medium
- Modelo base: https://huggingface.co/NbAiLab/nb-tts-norwegian-piper-trimmed
- Espejo del base: https://huggingface.co/csukuangfj/vits-piper-no_NO-talesyntese-medium
- Checkpoint exacto del base: https://huggingface.co/datasets/rhasspy/piper-checkpoints/blob/main/no/no_NO/talesyntese/medium/epoch%3D3459-step%3D2052250.ckpt
- Profesor VoxCPM2: https://huggingface.co/openbmb/VoxCPM2
- Piper (OHF-Voice): https://github.com/OHF-Voice/piper1-gpl
- Juez de evaluación NB-Whisper: https://huggingface.co/NbAiLab/nb-whisper-large
- Wikipedia noruega (Språkbanken): https://www.nb.no/sprakbanken/ressurskatalog/oai-nb-no-sbr-50/
- NDLA: https://ndla.no/
- NbAiLab/norwegian-alpaca: https://huggingface.co/datasets/NbAiLab/norwegian-alpaca
- Estadísticas de nombres SSB: https://www.ssb.no/befolkning/navn/statistikk/navn
- Simplemaps Norway cities: https://simplemaps.com/data/no-cities
- hhval/norwegian_qa: https://huggingface.co/datasets/hhval/norwegian_qa
- Språkrådet, språkspørsmål og svar: https://sprakradet.no/spraksporsmal-og-svar/
