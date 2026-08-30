# 01Yassine/cohere-transcribe-darija-encoder-lora

## Resumen

El modelo **01Yassine/cohere-transcribe-darija-encoder-lora** es un adaptador LoRA (Low-Rank Adaptation) diseñado para mejorar el reconocimiento automático de voz (ASR) en darija, el árabe marroquí dialectal, sobre el modelo base **CohereLabs/cohere-transcribe-arabic-07-2026** de Cohere. Este adaptador se aplica únicamente al encoder Conformer del modelo base, dejando el decoder congelado, lo que permite un ajuste eficiente con un coste computacional reducido.

El darija es un dialecto árabe con escasa representación en los sistemas ASR comerciales, y este adaptador busca cubrir esa laguna. Se entrenó con un conjunto de datos de solo 3 horas de audio procedente de YouTube (`01Yassine/darija-asr-3h`), lo que demuestra que es posible mejorar el rendimiento en un dialecto bajo recursos con técnicas de fine-tuning eficientes. En la evaluación sobre el benchmark `atlasia/darija-asr-benchmark` (114 clips anotados por humanos), el adaptador reduce el CER de 20.2 a 17.4 y el WER de 49.1 a 47.7 respecto al modelo base.

La relevancia actual radica en que Cohere Transcribe es una familia de modelos ASR de código abierto con arquitectura Conformer encoder-decoder de 2B parámetros, que soporta 14 idiomas, incluido el árabe. Este adaptador extiende su utilidad a un dialecto específico, lo que resulta útil para aplicaciones de transcripción, subtitulado y análisis de voz en entornos donde se habla darija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder (base) con adaptador LoRA en el encoder |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo ASR, no procesa texto de entrada) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, formato PEFT) |
| Idiomas soportados | Arabe (ar), darija / arabe marroqui (ary) |
| Licencia | other (consulte la licencia de Cohere Transcribe) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es **Cohere Transcribe Arabic**, un sistema ASR de 2B parámetros basado en una arquitectura Conformer encoder-decoder. El encoder procesa la senal de audio y el decoder genera la transcripcion de texto. Sobre este modelo, el adaptador LoRA se aplica exclusivamente al encoder, mientras que el decoder permanece congelado. Esta estrategia reduce el numero de parametros entrenables y evita el sobreajuste con conjuntos de datos pequenos.

El entrenamiento se realizo con un dataset de 3 horas de audio en darija extraido de YouTube (`01Yassine/darija-asr-3h`). No se proporcionan detalles sobre el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La ausencia de estos datos limita la reproducibilidad, pero el resultado en el benchmark muestra una mejora consistente sobre el modelo base.

## Capacidades

- Transcripcion automatica de voz en darija (arabe marroqui) con mejor rendimiento que el modelo base sin adaptar.
- Reconocimiento de habla en arabe estandar, ya que hereda las capacidades del modelo base.
- Inferencia eficiente gracias al adaptador LoRA, que anade una sobrecarga minima al modelo original.
- Compatible con el pipeline de Hugging Face `automatic-speech-recognition`.
- Soporte para integracion en aplicaciones de transcripcion en tiempo real o por lotes mediante la carga del adaptador sobre el modelo base.
- No se mencionan capacidades de tool calling, agentes ni multimodalidad, ya que es un modelo puramente ASR.

## Casos de uso

- Transcripcion de atencion al cliente: empresas marroquies pueden transcribir llamadas de soporte en darija para analisis posterior, mejorando la precision frente a modelos genericos.
- Subtitulado automatico de contenido audiovisual: creadores de contenido en darija pueden generar subtitulos para videos de YouTube o redes sociales con un coste computacional reducido.
- Asistentes de voz locales: integracion en aplicaciones de voz para el mercado marroqui, como comandos de voz en darija para dispositivos moviles o domotica.
- Analisis de reuniones y entrevistas: transcripcion de grabaciones en darija para generar actas o extraer informacion relevante en entornos empresariales.
- Investigacion linguistica: herramienta para corpus de darija hablado, facilitando estudios de dialectologia o procesamiento de lenguaje natural en este dialecto.
- Servicios de accesibilidad: generacion de transcripciones en tiempo real para personas con discapacidad auditiva en contextos donde se habla darija.

## Benchmarks y rendimiento

Los resultados se evaluaron sobre el dataset `atlasia/darija-asr-benchmark` (114 clips anotados por humanos). La tabla siguiente compara el modelo base con este adaptador:

| Modelo | CER (%) | WER (%) |
|---|---:|---:|
| Base (Cohere Transcribe Arabic) | 20.2 | 49.1 |
| **Encoder LoRA (este adaptador)** | **17.4** | **47.7** |

Ademas, la model card incluye una comparativa con otras recetas de adaptacion sobre el mismo modelo base:

| Receta | Hub | AtlasIA CER (%) |
|---|---|---:|
| Hybrid | `01Yassine/cohere-transcribe-darija` | 14.4 |
| Full LoRA | `01Yassine/cohere-transcribe-darija-full-lora` | 16.5 |
| **Encoder LoRA** | `01Yassine/cohere-transcribe-darija-encoder-lora` | **17.4** |
| Decoder LoRA | `01Yassine/cohere-transcribe-darija-decoder-lora` | 20.2 |

La receta "hybrid" obtiene el mejor CER (14.4), pero el adaptador de encoder solo ofrece una mejora moderada. No se dispone de resultados en otros benchmarks estandar como MMLU o HumanEval, ya que es un modelo de ASR.

## Requisitos de hardware

- El adaptador LoRA es un archivo pequeno (0.1 GB), pero requiere cargar el modelo base completo de 2B parametros para funcionar.
- Para inferencia en precision fp16, el modelo base necesita aproximadamente 4 GB de VRAM. Con cuantizacion int8, alrededor de 2 GB, y con int4, cerca de 1.5 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1660 Super, RTX 2060, RTX 3060, o superiores (A100, H100 para despliegue a gran escala).
- Es posible ejecutar en hardware de consumo (por ejemplo, RTX 3060 12 GB) sin problemas.
- Opciones de despliegue: se puede usar con la libreria `transformers` y `peft` para cargar el adaptador, o integrarlo en servidores de inferencia como vLLM (si soporta el modelo base) o TGI. Para entornos ligeros, se puede convertir a formato GGUF y usar `llama.cpp` u Ollama, aunque no se proporcionan instrucciones especificas.
- La latencia y el throughput dependen del hardware y de la optimizacion del modelo base; no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para darija fuera de la familia Cohere Transcribe. La siguiente tabla compara las variantes del mismo autor sobre el mismo modelo base:

| Modelo | Adaptacion | CER (%) | Licencia |
|---|---|---|---|
| `01Yassine/cohere-transcribe-darija` | Hybrid | 14.4 | other |
| `01Yassine/cohere-transcribe-darija-full-lora` | Full LoRA | 16.5 | other |
| **`01Yassine/cohere-transcribe-darija-encoder-lora`** | **Encoder LoRA** | **17.4** | **other** |
| `01Yassine/cohere-transcribe-darija-decoder-lora` | Decoder LoRA | 20.2 | other |

Como alternativa externa, Whisper de OpenAI soporta arabe estandar, pero no esta optimizado para darija y su rendimiento en este dialecto suele ser inferior. No se incluyen datos cuantitativos por falta de informacion.

## Limitaciones y advertencias

- El entrenamiento se realizo con solo 3 horas de audio, lo que limita la cobertura de acentos, registros y condiciones acusticas variadas. El modelo puede fallar en entornos ruidosos o con hablantes de regiones no representadas.
- La licencia es "other", lo que implica que debe revisarse la licencia del modelo base de Cohere. Es posible que existan restricciones para uso comercial, especialmente si el modelo base no es completamente abierto.
- El WER sigue siendo alto (47.7%), lo que indica que muchas transcripciones contienen errores significativos. No es adecuado para aplicaciones donde se requiera una precision alta sin postprocesamiento.
- Al ser un adaptador, no es un modelo autonomo: requiere descargar el modelo base, lo que aumenta el espacio de almacenamiento y la complejidad de despliegue.
- No se han publicado detalles sobre el dataset de entrenamiento (composicion, licencia de los audios), lo que puede generar problemas de derechos de autor si se usa en produccion.
- No hay soporte para otros dialectos arabes ni para idiomas distintos del darija y el arabe estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/01Yassine/cohere-transcribe-darija-encoder-lora
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Dataset de entrenamiento: https://huggingface.co/datasets/01Yassine/darija-asr-3h
- Benchmark de evaluacion: https://huggingface.co/datasets/atlasia/darija-asr-benchmark
- Receta hybrid: https://huggingface.co/01Yassine/cohere-transcribe-darija
- Receta full LoRA: https://huggingface.co/01Yassine/cohere-transcribe-darija-full-lora
- Receta decoder LoRA: https://huggingface.co/01Yassine/cohere-transcribe-darija-decoder-lora
- Documentacion de Cohere Transcribe: https://docs.cohere.com/docs/transcribe
- Blog de Cohere sobre Transcribe: https://cohere.com/blog/transcribe
