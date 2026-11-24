# GetmanY1/wav2vec2-base-fi-no-filter-finetuned

## Resumen

wav2vec2-base-fi-no-filter-finetuned es un modelo de reconocimiento automatico del habla (ASR) para finlandes, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en voz de la Universidad Aalto (proyecto aalto-speech). Se trata de un checkpoint de wav2vec 2.0 Base (12 capas, dimension oculta 768, 95M parametros) preentrenado sobre 890.000 horas de audio en finlandes y afinado con CTC sobre 4.600 horas de habla transcrita. El modelo se publica como parte de un ablation de filtrado de datos asociado al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL".

La relevancia de este checkpoint es metodologica mas que practica: sirve para comparar el efecto de distintas estrategias de filtrado de datos de preentrenamiento sobre la calidad final del modelo ASR. El autor indica explicitamente que, para uso general, deben preferirse los modelos principales de la coleccion del paper. Este checkpoint concreto representa la rama "sin filtrado adicional" del ablation, es decir, el modelo entrenado con las 890K horas retenidas tras VAD y deduplicacion por transcripcion, sin filtros adicionales de calidad o confianza.

La arquitectura es la de wav2vec 2.0 Base estandar: un codificador convolucional de caracteristicas seguido de un transformer con atencion por producto escalar y un cabezal de clasificacion CTC para la transcripcion. El modelo esta pensado unicamente para inferencia ASR en finlandes, con entrada de audio mono a 16 kHz y normalizacion desactivada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (CNN feature encoder + transformer de 12 capas, dimension 768, FFN 3072) |
| Parametros totales | 94.397.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de inferencia limitada por la longitud de la secuencia de entrada) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); incluye `fairseq/checkpoint.pt` original en el repo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec 2.0 Base: un codificador convolucional que transforma la forma de onda de 16 kHz en una secuencia de representaciones latentes, seguido de un transformer de 12 capas con dimension oculta 768 y dimension de feed-forward 3072. El preentrenamiento es auto-supervisado (objetivo de enmascaramiento contrastivo de wav2vec 2.0). El ajuste final es una cabeza CTC afinada sobre habla transcrita.

El preentrenamiento utilizo audio del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. Todo el material paso por deteccion de actividad vocal (VAD) y deduplicacion basada en transcripcion, sin filtrado adicional en esta rama del ablation, reteniendose 890.000 horas de audio. El entrenamiento se realizo con 125.000 actualizaciones, learning rate 6e-4 y aproximadamente 3 minutos de audio por GPU sobre 512 GPUs. El afinado CTC se hizo sobre 4.600 horas de habla transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16.000 actualizaciones, con el codificador convolucional de caracteristicas congelado. La entrada es audio mono a 16 kHz con `do_normalize=False`.

## Capacidades

- Reconocimiento automatico del habla (ASR) en finlandes mediante decodificacion CTC.
- Transcripcion de audio de dominio general y de dominio parlamentario (por el corpus de afinado).
- Manejo de audio de radiodifusion y television (dominio de preentrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: unicamente finlandes.
- No dispone de modo de razonamiento (thinking), vision ni audio generativo; es un modelo discriminativo de ASR.

## Casos de uso

- Transcripcion de archivos audiovisuales de radiodifusion finlandesa: el modelo fue preentrenado sobre audio de radio y television de KUVI, por lo que es adecuado para digitalizar y transcribir fondos de archivo con vocabulario y acustica propios de medios.
- Subtitulado automatico de contenido en finlandes: la salida CTC puede postprocesarse con un modelo de lenguaje para generar subtitulos, aprovechando el ajuste sobre habla parlamentaria y Lahjoita puhetta.
- Analisis de sesiones parlamentarias: el afinado incluye el corpus del Parlamento finlandes, lo que lo hace util para transcripcion de debates y actas legislativas.
- Investigacion en filtrado de datos para SSL de voz: este checkpoint existe como rama "sin filtrado" del ablation, por lo que su uso principal en investigacion es comparar el impacto del filtrado frente a los demas checkpoints de la coleccion.
- Generacion de datasets de voz etiquetados: puede usarse para transcribir grandes volumenes de audio finlandes y producir corpus de entrenamiento para otros modelos.
- Prototipado de pipelines ASR en entornos con transformers: al ser un modelo Base de 95M parametros y pesos safetensors, es ligero para experimentacion y despliegue en CPU o GPU modesta.
- Evaluacion comparativa de estrategias de preentrenamiento: sirve como linea base en estudios sobre VAD, deduplicacion y filtrado de confianza en corpus de habla a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 95M parametros, la inferencia en fp32 requiere aproximadamente 0,4 GB de pesos, mas activaciones y buffers de audio; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no se especifican en la informacion; por tamano, funciona en GPUs de consumo como RTX 3060, RTX 4090, y en GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU de consumo: si, con margen amplio; tambien puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: transformers (Wav2Vec2ForCTC + Wav2Vec2Processor) segun el ejemplo de la model card; tambien es compatible con endpoints de Hugging Face (tag `endpoints_compatible`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-no-filter-finetuned | 94,4M | no disponible | fi | Apache 2.0 | Rama "sin filtrado" del ablation; checkpoint de comparacion |
| GetmanY1/wav2vec2-base-fi-no-filter | 94,4M (modelo base) | no disponible | fi | Apache 2.0 | Modelo base de preentrenamiento sobre el que se afina este checkpoint |
| Modelos principales de la coleccion wav2vec2-fi-471k | no disponible | no disponible | fi | no disponible | Modelos recomendados por el autor para uso general |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- El autor recomienda explicitamente usar los modelos principales del paper para uso general; este checkpoint esta pensado para comparacion dentro de un ablation.
- Solo soporta finlandes; no es multilingue.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no representados o vocabulario fuera de dominio; no se han publicado tasas de error (WER/CER) en la informacion disponible.
- El modelo se entreno sin filtrado adicional de calidad tras VAD y deduplicacion, lo que puede implicar mayor sensibilidad a segmentos de baja calidad en el preentrenamiento en comparacion con las ramas filtradas del ablation.
- No se dispone de informacion sobre sesgos demograficos o dialectales especificos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y sin evaluacion publicada de robustez en produccion.
- `do_normalize=False` en la entrada: es necesario respetar esta configuracion para reproducir el comportamiento esperado.
- No hay datos publicados de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-no-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-no-filter
- Coleccion de modelos del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Repositorio de codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
