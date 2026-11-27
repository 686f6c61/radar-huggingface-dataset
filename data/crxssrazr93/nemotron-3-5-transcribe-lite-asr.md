# crxssrazr93/Nemotron-3.5-Transcribe-Lite-ASR

## Resumen

Nemotron 3.5 Transcribe Lite ASR es una adaptación no oficial del modelo de reconocimiento de voz NVIDIA Nemotron 3.5 Transcribe 30B A4B, publicada por el usuario crxssrazr93. La release conserva únicamente la parte acústica del modelo original (el codificador de voz y la cabeza CTC de marcas temporales) y descarta el modelo de lenguaje de 30B que acompaña al checkpoint completo. El resultado es un reconocedor CTC voraz de 785 millones de parámetros que transcribe audio en inglés manteniendo explícitamente las muletillas, repeticiones y arranques en falso, y que asigna a cada palabra una marca de inicio y fin.

El interés de esta ficha está en su enfoque: en lugar de ofrecer una transcripción limpia, está optimizado para transcripción verbatim, lo que lo hace útil para análisis de disfluencias, investigación lingüística, alineación forzada y edición de audio o vídeo por transcripción. Funciona con 3 GB de VRAM en fp16 sobre una GPU de consumo de 12 GB y también en CPU, con velocidades declaradas de 466x tiempo real en una RTX 3060.

Es una release de comunidad, sin afiliación ni respaldo de NVIDIA, y solo se ha evaluado en inglés. La licencia declarada en la model card es openmdw-1.1, con la etiqueta `license:other` en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de voz tipo transformer con RoPE y cabeza CTC de marcas temporales (componentes `perception.*` y `ctc_timestamp.*` del modelo base) |
| Parametros totales | 784.514.789 (785M) |
| Parametros activos | no disponible (no es MoE en esta release; el base es A4B, pero el modelo de lenguaje no se incluye) |
| Longitud de contexto | no disponible (procesa audio; sin ventana de texto declarada) |
| Tipos de cuantizacion | fp16 y fp32 en la implementación publicada; no se declaran otros formatos cuantizados |
| Idiomas soportados | inglés (único idioma evaluado); el codificador se entrenó con 40 idiomas según el autor, pero no se midió ninguno más |
| Licencia | openmdw-1.1 (`license:other` en Hugging Face) |
| Formato de pesos | safetensors (893 tensores, 1,67 GB, BF16 original de NVIDIA) |

## Arquitectura y entrenamiento

La release no entrena nada nuevo: copia sin modificar los tensores BF16 originales de NVIDIA correspondientes al codificador perceptivo y a la cabeza CTC de marcas temporales, extraídos del checkpoint público de 67,5 GB. El repositorio incluye además la rama de diarización y el proyector del modelo base, aunque el código publicado no los utiliza. La inferencia se realiza como un reconocedor CTC voraz, con un frame cada 40 ms, sobre audio mono a 16 kHz.

El código es un port a PyTorch del enfoque de FluidInference/nemotron-3.5-transcribe-lite-coreml, que hace lo mismo para Apple Silicon con Core ML; esta versión cubre Linux y Windows con CUDA o CPU. Requiere NeMo desde un commit concreto fijado en `requirements.txt`, porque la versión de PyPI no incluye el codificador con RoPE. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens de audio ni si hubo etapas de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en inglés con salida verbatim: conserva muletillas ("um", "uh"), repeticiones y arranques en falso.
- Marcas temporales a nivel de palabra: cada palabra recibe un tiempo de inicio y de fin.
- Reconocimiento CTC voraz con una resolución temporal de 40 ms por frame.
- Ejecución en GPU CUDA (fp16) o en CPU (fp32), con selección automática según disponibilidad de GPU.
- Procesamiento de vídeo y audio directamente desde fichero (requiere `ffmpeg` en el PATH), generando un JSON de palabras y un fichero de texto.
- API de Python (`NemotronLite.words(...)`) que acepta tensores de audio mono a 16 kHz en float32.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del reconocimiento ni modo de razonamiento.

## Casos de uso

- Análisis de disfluencias y muletillas: el modelo conserva 111 de 127 muletillas de referencia en el benchmark del autor, lo que permite cuantificar densidad de fillers por hablante y por tramo en estudios de habla espontánea.
- Investigación lingüística y fonética: la transcripción verbatim con tiempos por palabra sirve para estudiar repeticiones, arranques en falso y patrones de pausa sin una capa de limpieza que elimine la evidencia.
- Edición de audio y vídeo por transcripción: al disponer de inicio y fin de cada palabra, se pueden cortar segmentos, eliminar muletillas o generar capítulos alineados con el texto transcrito.
- Sincronización de subtítulos: el error medio de inicio de palabra de 53 ms y el 55% de inicios dentro de 50 ms permiten generar subtítulos con tiempos razonables, con revisión humana en los casos que requieran precisión estricta.
- Alineación forzada aproximada: combinado con herramientas de alineación como Align, el error medio de inicio baja a 44 ms y el 71% de inicios quedan dentro de 50 ms, según los datos del autor.
- Procesamiento por lotes en hardware de consumo: con 3 GB de VRAM en fp16 y 466x tiempo real en una RTX 3060, es viable transcribir grandes volúmenes de reuniones o entrevistas en una sola GPU de gama media.
- Transcripción en CPU para entornos sin GPU: un clip de 3 minutos tarda unos 23 s en una CPU de portátil de 8 núcleos, lo que cubre flujos offline o de escritorio.

## Benchmarks y rendimiento

Datos publicados por el autor sobre seis clips de 3 minutos (18 minutos, seis hablantes, 127 muletillas de referencia) del AMI Meeting Corpus, ejecutados en una RTX 3060 de 12 GB:

| Sistema | WER con fillers | WER sin fillers | Fillers conservados | Precisión de fillers | Error inicio medio / p90 | Error fin medio / p90 | Inicios dentro de 50 ms | Velocidad | VRAM |
|---|---|---|---|---|---|---|---|---|---|
| Nemotron Lite (este repo), fp16 | 7,6% | 7,5% | 111/127 (87%) | 98% | 53 / 110 ms | 148 / 340 ms | 55% | 466x tiempo real | 3,0 GB |
| Cohere Transcribe 03-2026, VAD off | 2,7% | 2,4% | 111/127 (87%) | 97% | 210 / 340 ms | 220 / 340 ms | 9% | 18x | ~2,7 GB |
| Cohere Transcribe 03-2026, VAD on | 3,5% | 3,2% | 109/127 (86%) | 96% | 201 / 330 ms | 204 / 340 ms | 8% | 13x | ~2,7 GB |
| Whisper large-v3-turbo, prompt verbatim, sin VAD | 9,6% | 6,6% | 25/127 (20%) | 96% | 137 / 330 ms | 129 / 370 ms | 53% | 40x | 2,3 GB |

Variantes adicionales medidas solo sobre los tres clips del split de test (9 minutos, 45 muletillas):

| Sistema | WER con fillers | Fillers conservados | Error inicio medio | Error fin medio | Inicios dentro de 50 ms |
|---|---|---|---|---|---|
| Nemotron Lite, fp32 | 6,3% | 42/45 | 56 ms | 158 ms | 51% |
| Nemotron Lite + Align | 6,3% | 42/45 | 44 ms | 122 ms | 71% |
| Whisper turbo, prompt verbatim + Align | 9,3% | 8/45 | 93 ms | 118 ms | 73% |
| Whisper large-v3, prompt verbatim, sin VAD | 9,7% | 7/45 | 251 ms | 237 ms | 11% |
| Whisper large-v3-turbo, ajustes por defecto | 10,5% | 1/45 | 155 ms | 151 ms | 50% |

## Requisitos de hardware

- VRAM estimada: 3,0 GB en fp16 según el benchmark del autor; el repo ocupa 1,7 GB en disco.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de VRAM; el autor valida en RTX 3060 de 12 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe en tarjetas de 12 GB y en la mayoría de gamas medias con 4-6 GB; en fp32 el consumo de memoria será mayor y no se especifica.
- CPU: soportada en fp32; un clip de 3 minutos tarda unos 23 s en una CPU de portátil de 8 núcleos.
- Despliegue: script `transcribe.py` incluido, API de Python `nemotron_lite.NemotronLite`, PyTorch 2.7.0 y torchaudio 2.7.0, NeMo desde un commit fijado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo CTC de este tipo).
- Latencia y throughput: 466x tiempo real en RTX 3060 con fp16 (18 minutos de audio en 2,3 s); en CPU, aproximadamente 8x tiempo real en el caso medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modalidad | WER con fillers (AMI, benchmark del autor) | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe Lite ASR | 785M | audio, sin ventana de texto declarada | 7,6% | 466x | openmdw-1.1 | Hugging Face (repo de comunidad) |
| Cohere Transcribe 03-2026 | no disponible | audio | 2,7% (VAD off) | 18x | no disponible en la información | Hugging Face (CohereLabs) |
| Whisper large-v3-turbo | no disponible | audio | 9,6% (prompt verbatim) | 40x | no disponible en la información | Disponible públicamente |
| Whisper large-v3 | no disponible | audio | 9,7% (prompt verbatim, test split) | no disponible | no disponible en la información | Disponible públicamente |

La comparativa se limita a los datos del benchmark del autor; no se dispone de parámetros, contexto ni licencias de los sistemas alternativos en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha evaluado en inglés; el codificador se entrenó con 40 idiomas según el autor, pero no se midió ninguno más, por lo que el rendimiento multilingüe es desconocido.
- El WER con fillers (7,6%) es claramente superior al de Cohere Transcribe (2,7%) en el mismo benchmark; la ventaja de este modelo está en las marcas temporales y en la velocidad, no en la precisión léxica.
- El ejemplo de salida del autor muestra errores léxicos ("ubility" por "usability"), lo que indica que la transcripción requiere revisión en contextos de producción.
- El error de fin de palabra es alto (148 ms de media, 340 ms en p90) en comparación con el de inicio; los tiempos de fin no son fiables para tareas que exijan precisión estricta.
- Es una release no oficial, sin afiliación ni respaldo de NVIDIA; "Lite" es un nombre de comunidad, no un modelo de NVIDIA.
- El repositorio incluye ramas de diarización y proyector que el código no utiliza; no deben asumirse capacidades de diarización.
- Requiere NeMo desde un commit concreto; la versión de PyPI no funciona por falta del codificador con RoPE.
- Licencia openmdw-1.1: deben revisarse los términos concretos del fichero LICENSE antes de un uso comercial, ya que los metadatos la marcan como `license:other`.
- No se documentan sesgos específicos del modelo ni resultados de benchmarks fuera del conjunto AMI utilizado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crxssrazr93/Nemotron-3.5-Transcribe-Lite-ASR
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Implementación Core ML de referencia: https://huggingface.co/FluidInference/nemotron-3.5-transcribe-lite-coreml
- Herramienta de alineación Align: https://huggingface.co/desert-ant-labs/align
- Cohere Transcribe 03-2026: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- AMI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/corpus/
