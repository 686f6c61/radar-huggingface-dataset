# Chillarmo/DpirASR-ForcedAligner

## Resumen

DpirASR-ForcedAligner es un modelo de alineamiento forzado (forced alignment) especializado en armenio oriental moderno, desarrollado por el usuario Chillarmo. Su funcion es estimar los tiempos de inicio y fin de cada palabra a partir de un audio mono de 16 kHz y su transcripcion correspondiente, una tarea fundamental para generar subtitulos sincronizados, anotar corpus de voz o construir datasets de entrenamiento para ASR. El modelo parte de Qwen3-ForcedAligner-0.6B-hf y se ha ajustado mediante LoRA sobre 23.359 clips de discurso de radiodifusion.

La relevancia de este modelo radica en que el modelo base, pese a su calidad general, fracasa estrepitosamente en armenio: segun la evaluacion del autor, Qwen3-ForcedAligner-0.6B-hf presenta un error medio de frontera de 2.862 ms, mientras que DpirASR-ForcedAligner lo reduce a 28,83 ms, con un 96,45% de palabras cuyos dos limites caen dentro de una ventana de 100 ms. Esto demuestra el valor del ajuste fino especifico por idioma para tareas de alineamiento temporal.

Se trata de un modelo compacto (917.728.896 parametros en safetensors, repo de 1,8 GB) que hereda la arquitectura de clasificacion temporal de Qwen con clases de 80 ms, y que se distribuye bajo licencia Apache 2.0. No es un modelo generativo de proposito general, sino una herramienta de token-classification orientada a un unico idioma y a una unica tarea, lo que condiciona tanto su uso como sus requisitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-ForcedAligner (clasificador de timestamps con clases de 80 ms) |
| Parametros totales | 917.728.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; clips de audio de hasta 30 segundos (rango de entrenamiento) |
| Tipos de cuantizacion | BF16 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | armenio (armenio oriental, `hy`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Modelo base | Qwen/Qwen3-ForcedAligner-0.6B-hf (finetune) |
| Frecuencia de muestreo | 16 kHz mono |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-ForcedAligner-0.6B, un transformer que combina un codificador de audio con un decodificador de lenguaje y un clasificador de timestamps con resolucion de 80 ms. El checkpoint liberado esta en BF16 y fusiona el ajuste LoRA en los pesos finales. Se carga mediante `AutoModelForTokenClassification` y `AutoProcessor` de Transformers 5.16.1 o superior, y el processor incluye utilidades especificas (`prepare_forced_aligner_inputs`, `decode_forced_alignment`) para preparar la entrada y decodificar los limites de palabra.

El ajuste fino se realizo sobre 23.359 clips continuos procedentes de 236 grabaciones, con transcripciones a nivel de palabra que cubren 504.365 palabras con timestamps. Se empleo LoRA de rango 16 en las capas de atencion de audio y de lenguaje, y se entrenaron tambien el proyector audio-texto y el clasificador de timestamps. El checkpoint publicado se selecciono por tener el menor error absoluto medio de frontera sin suavizado sobre 926 clips de validacion de 12 grabaciones distintas, y se guardo en el paso 1.095 tras tres epocas. El decodificado de timestamps sigue el esquema estandar de Qwen con suavizado.

## Capacidades

- Alineamiento forzado de audio y transcripcion: devuelve `text`, `start_time` y `end_time` en segundos para cada palabra.
- Especializado en armenio oriental moderno, orientado a discurso de radiodifusion.
- Entrada de audio mono a 16 kHz con transcripcion en armenio; la segmentacion de palabras se realiza por espacios mediante el processor (sin hint de idioma).
- Clasificacion temporal con resolucion de 80 ms por clase.
- No genera texto libre: es un modelo de token-classification, no un ASR generativo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio como modalidad de salida; solo consume audio y texto de entrada.
- No dispone de capacidades multilingues: unicamente armenio.

## Casos de uso

- Generacion de subtitulos sincronizados a nivel de palabra: dado un audio de locucion en armenio y su transcripcion, el modelo produce marcas temporales por palabra con un error medio de ~29 ms, suficiente para subtitulos tipo karaoke o resaltado sincronizado.
- Anotacion de corpus de voz para entrenamiento ASR: permite alinear automaticamente transcripciones existentes con su audio y generar datasets con timestamps de palabra para entrenar o evaluar sistemas de reconocimiento de voz en armenio.
- Verificacion y control de calidad de transcripciones: comparando la alineacion obtenida con la esperada, se pueden detectar segmentos donde la transcripcion no coincide con el audio (palabras omitidas, inserciones o desalineaciones), util en pipelines de QA de subtitulos.
- Indexacion y busqueda dentro de archivos de audio: con timestamps por palabra se puede construir un indice buscable sobre emisiones de radio o television en armenio, permitiendo saltar al instante exacto donde se pronuncia un termino.
- Edicion y montaje de video basado en texto: herramientas que permiten editar audio o video manipulando la transcripcion necesitan limites de palabra precisos; este modelo los proporciona con clips de hasta 30 segundos, adecuado para flujos de edicion por segmentos.
- Analisis linguistico y fonetico: la alineacion palabra a palabra facilita estudios de duracion, ritmo y pausas en discurso de radiodifusion en armenio oriental, asi como la extraccion de segmentos para analisis acustico.
- Sincronizacion de traducciones o doblajes: al disponer de los tiempos de cada palabra del original, se pueden alinear traducciones o generar doblajes con marcas temporales coherentes.

## Benchmarks y rendimiento

Evaluacion sobre 2.523 clips emparejados de 28 grabaciones reservadas (7,27 horas, 61.470 palabras), con decodificador estandar de Qwen con suavizado y midiendo ambos limites de cada palabra:

| Modelo | Error medio inicio | Error medio fin | Error medio frontera | Fronteras dentro de 100 ms | Palabras con ambos limites dentro de 100 ms |
|---|---:|---:|---:|---:|---:|
| DpirASR-ForcedAligner | 27,79 ms | 29,86 ms | **28,83 ms** | **98,02%** | **96,45%** |
| Qwen3-ForcedAligner-0.6B-hf | 2.846,89 ms | 2.877,38 ms | 2.862,13 ms | 12,45% | 3,78% |

La metrica mide la concordancia con timestamps generados automaticamente a partir de transcripciones a nivel de palabra. El conjunto de test emparejado excluye 201 clips continuos cuyas transcripciones no pudieron reconciliarse por completo con la exportacion de tiempos de palabra. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 1,8 GB en disco; en GPU se puede cargar en BF16 (unos 2 GB de VRAM) o en FP32 (unos 3,7 GB) si no hay soporte BF16. El codigo de ejemplo usa BF16 en CUDA y FP32 en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el checkpoint en BF16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es lo bastante pequeno para ejecutarse en CPU con FP32, aunque con mayor latencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: Transformers 5.16.1 o superior con `AutoModelForTokenClassification` y `AutoProcessor`; el modelo esta marcado como `endpoints_compatible`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El procesamiento se realiza por clips de hasta 30 segundos, lo que acota el coste por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idioma | Error medio frontera | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DpirASR-ForcedAligner | 917.728.896 | clips hasta 30 s | armenio oriental | 28,83 ms | Apache 2.0 | Hugging Face |
| Qwen3-ForcedAligner-0.6B-hf | ~0,6B (modelo base) | clips hasta 30 s | multilingue (no especificado) | 2.862,13 ms en armenio | Apache 2.0 | Hugging Face |
| Otros alineadores forzados (p. ej. basados en CTC/wav2vec) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo esta disponible frente al modelo base, sobre el que se observa una mejora de dos ordenes de magnitud en el error de frontera para armenio. No se dispone de datos de otros alineadores forzados para armenio en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en armenio oriental; no debe esperarse un comportamiento correcto en otros idiomas ni en variantes de armenio no cubiertas por el entrenamiento.
- Requiere una transcripcion previa correcta: el modelo alinea audio y texto, no transcribe. Errores u omisiones en la transcripcion degradaran la alineacion.
- Disenado para clips de hasta 30 segundos, el rango usado durante el ajuste fino; clips mas largos pueden requerir segmentacion previa.
- Entrada restringida a audio mono a 16 kHz; otras frecuencias o canales deben remuestrearse o convertirse antes de la inferencia.
- El conjunto de evaluacion usa timestamps generados automaticamente como referencia, no anotaciones humanas, por lo que las metricas miden concordancia con esa referencia y no precision absoluta frente a verdad humana.
- Riesgo de alucinacion o desalineacion en segmentos con ruido, musica, solapamiento de hablantes o discurso no coincidente con la transcripcion.
- Sesgos: el entrenamiento se centra en discurso de radiodifusion; el rendimiento puede degradarse en habla espontanea, dialectos, acentos no representados o condiciones acusticas distintas.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado de Qwen3-ForcedAligner-0.6B-hf conviene revisar las condiciones del modelo base y conservar los avisos de licencia correspondientes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.
- No apto para generacion de texto, razonamiento, codigo, vision ni tareas de agente; su uso esta acotado a token-classification para alineamiento temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chillarmo/DpirASR-ForcedAligner
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B-hf
- Resultados de evaluacion (raw y suavizados): https://huggingface.co/Chillarmo/DpirASR-ForcedAligner/blob/main/eval-results.json
- Texto de licencia: https://huggingface.co/Chillarmo/DpirASR-ForcedAligner/blob/main/LICENSE
- Paper, blog o repositorio adicional: no disponible
