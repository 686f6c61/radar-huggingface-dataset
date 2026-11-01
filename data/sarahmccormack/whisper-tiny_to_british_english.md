# SarahMcCormack/whisper-tiny_to_british_english

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por SarahMcCormack en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles britanico, entrenado sobre un dataset denominado "british_english". El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante tiny, con 37,76 millones de parametros, y conserva la licencia Apache 2.0 del modelo original.

El objetivo declarado es adaptar el modelo base de Whisper, entrenado mayoritariamente con ingles estadounidense, a las particularidades foneticas y lexicas del ingles britanico. Segun la model card, el ajuste alcanza un WER (Word Error Rate) de 13,35 en el conjunto de evaluacion, partiendo de un WER de 15,13 tras la primera epoca de entrenamiento. El modelo se distribuye en formato safetensors y es compatible con la libreria transformers y con endpoints de HuggingFace.

La relevancia de este modelo es limitada pero concreta: sirve como ejemplo de adaptacion de dominio de un modelo ASR pequeno y como alternativa ligera para transcripcion de audio en ingles britanico en entornos con recursos computacionales restringidos. No obstante, la documentacion es muy escasa (la propia model card indica "More information needed" en varias secciones), lo que limita su uso en produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-tiny, que emplea una arquitectura transformer encoder-decoder disenada para ASR. El encoder procesa espectrogramas mel de audio y el decoder genera tokens de texto de forma autorregresiva. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper, lo que implica una capacidad limitada en comparacion con las variantes base, small, medium y large.

El entrenamiento se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 0,99) con validation loss de 0,3010 y WER de 15,13; y en el paso 2000 (epoca 1,98) con validation loss de 0,2951 y WER de 13,35. No se especifica el numero de tokens de audio ni la composicion del dataset de entrenamiento. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en ingles britanico.
- Transcripcion de audio a texto mediante la pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con endpoints de HuggingFace (tag `endpoints_compatible`).
- Modelo generado con la libreria `Trainer` (tag `generated_from_trainer`), lo que facilita su reproduccion y ajuste posterior.
- No se declaran capacidades de traduccion, deteccion de idioma, tool calling, agentes, vision ni audio mas alla del ASR.
- No se documentan modos especiales como thinking mode ni capacidades multimodales.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles britanico: el modelo puede transcribir audio de hablantes con acento britanico, aprovechando el ajuste fino sobre el dataset "british_english" para reducir errores respecto al modelo base en ese dominio.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,76 millones de parametros y 0,3 GB de repositorio, permite iterar rapidamente en entornos de desarrollo sin necesidad de GPU de gran capacidad.
- Subtitulado automatico de contenido audiovisual britanico: util para generar subtitulos preliminares en videos con habla britanica, que luego pueden revisarse manualmente.
- Investigacion en adaptacion de dominio ASR: sirve como caso de estudio de fine-tuning de Whisper tiny sobre un dataset especifico, con hiperparametros y resultados documentados.
- Despliegue en dispositivos con recursos limitados: su tamano reducido permite ejecutarlo en CPU o en GPUs de gama baja para tareas de transcripcion no criticas.
- Generacion de datos etiquetados para entrenamiento: las transcripciones pueden usarse como pseudo-etiquetas en pipelines de datos de audio, siempre con revision posterior.

## Benchmarks y rendimiento

Los datos declarados por el autor en la model card son los siguientes:

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny British | British English (split test) | WER | 13,3453 |
| Whisper tiny British (paso 1000) | British English (validacion) | WER | 15,1293 |
| Whisper tiny British (paso 2000) | British English (validacion) | WER | 13,3453 |

Ademas, se reporta una validation loss de 0,2951 en el paso 2000. No se han publicado resultados comparativos con otros modelos en la informacion disponible, ni resultados en benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,76 millones de parametros (aproximadamente 151 MB en fp32), la huella de memoria es muy reducida; no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de HuggingFace; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny British (este modelo) | 37,76 M | no disponible | 13,35 | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,76 M | no disponible | no disponible | apache-2.0 | HuggingFace |
| openai/whisper-base | no disponible en la informacion | no disponible | no disponible | apache-2.0 | HuggingFace |

No se dispone de datos de WER de los modelos comparables en el dataset "british_english" en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Documentacion muy incompleta: la model card indica "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento.
- Especializado en ingles britanico: no se garantiza un rendimiento adecuado en otros acentos o variantes del ingles, ni en otros idiomas.
- Modelo de muy pequeno tamano (37,76 M de parametros): la precision del ASR sera inferior a la de variantes mayores de Whisper (base, small, medium, large), especialmente en audio con ruido o habla solapada.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir transcripciones plausibles pero incorrectas en segmentos de audio ambiguos o silenciosos.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre un dataset no descrito, pueden existir sesgos de dominio, genero o acento no evaluados.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de la licencia y de los datos de entrenamiento originales.
- Sin verificacion independiente: el resultado de WER (13,35) esta marcado como `verified: false` en el model-index, por lo que no ha sido validado por terceros.
- Fecha de creacion futura (2026-10-30): la metadata indica una fecha posterior a la actual, lo que puede indicar un error de registro o un modelo de caracter experimental.

## Enlaces

- [HuggingFace: SarahMcCormack/whisper-tiny_to_british_english](https://huggingface.co/SarahMcCormack/whisper-tiny_to_british_english)
- [Modelo base: openai/whisper-tiny](https://huggingface.co/openai/whisper-tiny)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
