# mrom1/MOSS-Transcribe-Diarize-GGUF

## Resumen

MOSS-Transcribe-Diarize-GGUF es una conversión al formato GGUF del modelo OpenMOSS-Team/MOSS-Transcribe-Diarize, un sistema de reconocimiento automático del habla con diarización de hablantes integrada. El modelo original lo desarrolla OpenMOSS-Team y esta conversión la publica el usuario mrom1 para su uso con llama.cpp. Resuelve un problema concreto: transcribir una grabación de audio etiquetando quién habla en cada momento y con marcas temporales, sin necesidad de encadenar un ASR y un diarizador independientes.

El modelo combina un codificador de audio basado en Whisper-Medium con un adaptador VQ y un decodificador de texto derivado de Qwen3-0.6B, sumando 596.049.920 parámetros totales. Es capaz de procesar grabaciones de hasta 90 minutos en una sola pasada y produce una salida estructurada con timestamps de inicio y fin por segmento y etiquetas de hablante ([S01], [S02], etc.).

Su relevancia actual radica en que empaqueta una tarea habitualmente resuelta con pipelines multi-etapa en un único modelo de menos de 1B de parámetros y licencia Apache-2.0. La conversión GGUF permite ejecutarlo en hardware de consumo, aunque requiere un fork específico de llama.cpp porque el soporte upstream todavía no existe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio Whisper-Medium + adaptador VQ + decodificador de texto Qwen3-0.6B (multimodal audio-texto) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 90 minutos de audio en una pasada; en la practica el contexto debe alojar audio (12,5 tokens/segundo), anclas temporales y transcripcion |
| Tipos de cuantizacion | Q8_0 y F16 (ficheros publicados); la cache KV admite q8_0 (4 bits rompe la salida) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal audio-texto. La parte de audio emplea un codificador Whisper-Medium con un adaptador VQ que proyecta las representaciones acústicas al espacio del decodificador de texto, un transformer Qwen3-0.6B. La generación es autorregresiva y produce directamente la transcripción con etiquetas de hablante y marcas temporales en el formato `[inicio][Sxx]texto[fin]`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión no detalla el proceso de entrenamiento del modelo original, por lo que esos datos deben consultarse en la ficha de OpenMOSS-Team/MOSS-Transcribe-Diarize. La innovación destacable es la integración de ASR y diarización en un único modelo con salida estructurada y capacidad de procesar hasta 90 minutos por pasada.

## Capacidades

- Reconocimiento automático del habla con transcripción de audio a texto.
- Diarización de hablantes integrada, con etiquetas [S01], [S02], [S03] por segmento.
- Marcas temporales de inicio y fin por segmento de habla.
- Procesamiento de grabaciones de hasta 90 minutos en una sola pasada.
- Salida estructurada directamente consumible por pipelines posteriores.
- Ejecución mediante llama.cpp a través de un fork específico (llama-server y llama-mtmd-cli).
- Soporte de audio en distintos formatos de entrada (FLAC, MP3, entre otros) y lectura desde disco con llama-mtmd-cli.
- No se documentan capacidades de tool calling, agentes, visión ni modo thinking.

## Casos de uso

- Transcripción de reuniones: el modelo genera actas con marcas temporales y atribución de intervenciones por hablante, adecuado para reuniones de hasta 90 minutos en una sola pasada sin pipeline externo de diarización.
- Subtitulado y postproducción de vídeo: la salida con timestamps de inicio y fin por segmento facilita la generación de subtítulos sincronizados y la revisión por hablante.
- Análisis de entrevistas y research cualitativo: permite segmentar una entrevista por interlocutor y extraer citas con referencia temporal exacta para su codificación posterior.
- Atención al cliente y calidad: transcripción de llamadas grabadas con separación agente/cliente para auditoría, análisis de cumplimiento y extracción de métricas por turno de palabra.
- Documentación clínica o legal: transcripción de consultas o vistas con atribución de hablante, útil cuando se requiere trazabilidad temporal del contenido.
- Procesamiento por lotes en local: al caber en hardware de consumo con cuantización Q8_0, permite transcribir archivos de audio en equipos sin GPU de datacenter, con coste marginal nulo por uso.
- Generación de corpus etiquetados: la salida diarizada sirve como base para construir datasets de ASR con etiquetas de hablante y timestamps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB de memoria de GPU para una hora de audio con caché KV en q8_0; el consumo crece con la duración del audio.
- Regla de contexto indicada por el autor: `segundos * 12,5 * 1,6 + 4096` tokens. Cinco minutos requieren unos 10k tokens; una hora, unos 70k.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño del modelo y la VRAM estimada, es viable en GPU de consumo con al menos 8 GB, aunque el autor no lo confirma.
- Cabe en GPU de consumo: probable según la VRAM estimada, sin confirmación explícita del autor.
- Opciones de despliegue: llama.cpp mediante el fork github.com/mrom1/llama.cpp-MOSS-TD (rama moss-td), con llama-server y llama-mtmd-cli. El llama.cpp upstream no soporta este modelo todavía.
- Límite operativo: llama-server acepta como máximo 100 MB por petición; para grabaciones largas hay que enviar FLAC o MP3, o dividir en fragmentos. llama-mtmd-cli --audio lee desde disco.
- Latencia y throughput: no disponibles.
- La caché KV en 4 bits rompe la salida; debe usarse q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize (este) | 596 M | Hasta 90 min de audio | Integrada | Apache-2.0 | GGUF, safetensors |
| Whisper (large-v3) | 1.550 M | 30 s por ventana | No (requiere pipeline externo) | MIT | Safetensors, GGUF, otros |
| Alternativas de diarizacion (p. ej. pyannote) | No disponible | No disponible | Si, como modulo separado | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp; el soporte upstream no existe, lo que implica riesgo de mantenimiento y de compatibilidad futura.
- El límite de 100 MB por petición en llama-server obliga a usar formatos comprimidos o dividir grabaciones largas.
- La caché KV en 4 bits produce salidas incorrectas; hay que usar q8_0, lo que incrementa el uso de memoria.
- El contexto necesario crece linealmente con la duración del audio, lo que limita la longitud práctica según la VRAM disponible.
- El proceso de conversión requiere eliminar la clave `adaptor_input_dim` del config.json porque transformers no puede cargar el tokenizer con ella; un paso manual propenso a error.
- No se documentan los idiomas soportados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y de errores en la atribución de hablante en audio con solapamientos, ruido o voces similares; no se aportan métricas de error (DER, WER).
- No se documentan sesgos conocidos del modelo.
- La licencia Apache-2.0 permite uso comercial, pero al ser una conversión de pesos conviene verificar los términos del modelo base.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/mrom1/MOSS-Transcribe-Diarize-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Fork de llama.cpp: https://github.com/mrom1/llama.cpp-MOSS-TD
