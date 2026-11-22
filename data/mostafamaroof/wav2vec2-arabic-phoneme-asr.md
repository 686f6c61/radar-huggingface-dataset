# MostafaMaroof/wav2vec2-arabic-phoneme-asr

## Resumen

El modelo `MostafaMaroof/wav2vec2-arabic-phoneme-asr` es un sistema de reconocimiento automatico del habla (ASR) especializado en la transcripcion fonetica del arabe. Desarrollado por MostafaMaroof, no transcribe palabras sino fonemas: convierte una senal de audio en una secuencia de sonidos en estilo Halabi, lo que lo hace especialmente util para evaluacion de pronunciacion y verificacion de recitacion coranica.

Se trata de un fine-tuning de `facebook/wav2vec2-large-xlsr-53`, un transformer convolucional-recurrente con cabeza CTC de aproximadamente 315 millones de parametros. La version v3, la actual, parte de la v2 del mismo repositorio y corrige problemas de calidad en los datos de entrenamiento y en el formato de salida, ademas de aplicar aumentacion de datos para mejorar la robustez frente a distintas voces y condiciones de grabacion.

El modelo esta pensado para arabe estandar moderno (MSA) y recitacion coranica, no para dialectos ni habla coloquial. Su licencia Apache 2.0 y su integracion nativa con `transformers` lo hacen facil de desplegar en pipelines de evaluacion fonetica, herramientas de aprendizaje de idiomas o sistemas de control de calidad de recitacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (CNN feature extractor + transformer encoder) con cabeza CTC |
| Parametros totales | 315.520.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; el modelo procesa clips de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Arabe (ar): arabe estandar moderno y recitacion coranica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2: un extractor de caracteristicas convolucional que procesa la forma de onda de audio a 16 kHz y un encoder transformer que genera representaciones contextuales, sobre las que se aplica una cabeza de clasificacion CTC para producir directamente la secuencia de fonemas. Parte de `facebook/wav2vec2-large-xlsr-53` y se entreno de forma continuada desde la v2 del mismo repositorio.

Los datos de entrenamiento combinan el Arabic Speech Corpus (3,5 horas) y el conjunto Iqra_train (75,1 horas tras limpieza). En la v3 se eliminaron 3.353 clips cuyas transcripciones no coincidian con el audio (por ejemplo, etiquetas de cuatro sonidos en clips que contenian un verso completo). El entrenamiento consto de 16.086 pasos, con aproximadamente 2 minutos de audio por paso y una tasa de aprendizaje de 5e-5 con decaimiento hasta cero, realizado en una unica GPU Kaggle T4 durante unas 6 horas. Se aplico aumentacion de datos consistente en variacion aleatoria de velocidad, adicion de ruido ligero y enmascaramiento de fragmentos cortos de audio para mejorar la robustez ante diferentes voces y condiciones de grabacion.

## Capacidades

- Reconocimiento fonetico del habla arabe: convierte audio en una secuencia de fonemas en estilo Halabi, no en texto arabe.
- Evaluacion de pronunciacion: util para verificar la correccion fonetica de la recitacion coranica y del arabe estandar.
- Salida limpia en v3: los fonemas se separan por espacios, sin el delimitador `|` de la v2.
- Robustez ante variaciones de velocidad, ruido ligero y enmascaramiento parcial gracias a la aumentacion de entrenamiento.
- Integracion con `transformers` mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor`.
- Soporte de revisiones: la v2 sigue accesible con `revision="v2"`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-fonetico.

## Casos de uso

- Evaluacion de recitacion coranica: el modelo compara la secuencia de fonemas producida por el recitador con la esperada, permitiendo detectar errores de pronunciacion en escuelas y aplicaciones de aprendizaje del Coran.
- Herramientas de aprendizaje de arabe para extranjeros: integrado en una aplicacion, permite dar retroalimentacion fonetica al estudiante sobre fatha, kasra, damma y otros sonidos.
- Control de calidad de corpus de audio arabe: procesar grabaciones para verificar que la pronunciacion coincide con la transcripcion y descartar clips defectuosos, como se hizo en la limpieza de la v3.
- Investigacion en fonetica arabe: analisis cuantitativo de secuencias foneticas en corpus de habla y recitacion.
- Preprocesamiento para pipelines de TTS o sintesis: obtener la representacion fonetica de un audio para alinear o entrenar sistemas de sintesis.
- Verificacion de pronunciacion en doblaje y locucion: comprobar la fidelidad fonetica de grabaciones profesionales en arabe estandar.
- Sistemas de evaluacion automatica de lectura en contextos educativos: medir la precision fonetica de lecturas en voz alta de textos arabes.

## Benchmarks y rendimiento

Los resultados publicados en la model card miden el PER (phoneme error rate, porcentaje de fonemas erroneos; menor es mejor):

| Conjunto de test | Clips | v2 | v3 |
|---|---|---|---|
| `iqra_dev` | 2.588 | 10,97 % | 9,33 % |
| `asc_test` | 95 | 4,40 % | 3,41 % |

Notas del autor: `iqra_dev` es el test principal, con transcripciones generadas automaticamente, por lo que parte de los "errores" son en realidad fallos de la transcripcion. `asc_test` es habla de calidad de estudio y la v2 vio esos clips durante el entrenamiento, por lo que su cifra debe tomarse como orientativa. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 para los 315 millones de parametros, mas el overhead de activaciones; en la practica, 2-3 GB son suficientes para clips cortos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en T4, RTX 3060, RTX 4090, A100 y H100. El entrenamiento se realizo en una unica T4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (GTX 1660 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` (via principal), `pipeline("automatic-speech-recognition")`; no se documentan pesos GGUF ni integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo requirio unas 6 horas en una T4 para 16.086 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| MostafaMaroof/wav2vec2-arabic-phoneme-asr | 315,5 M | Fonemas (Halabi) | Arabe (MSA y coranico) | Apache 2.0 | no disponible |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | Texto (multilingue) | 53 idiomas | Apache 2.0 | no disponible |
| Modelos ASR arabes basados en Whisper | no disponible | Texto | Arabe | varía segun modelo | no disponible |

La diferencia clave frente a los ASR convencionales es que este modelo produce fonemas en lugar de texto, lo que lo hace adecuado para evaluacion de pronunciacion pero no para transcripcion de contenido. No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre arabe estandar moderno y recitacion coranica; no soporta dialectos ni habla coloquial.
- La mayoria de los errores restantes corresponden a vocales cortas (fatha, kasra, damma).
- La salida es una secuencia de fonemas en estilo Halabi, no texto arabe; requiere un paso posterior para obtener texto.
- El uso de `processor.batch_decode` une los fonemas sin espacios (por ejemplo, `f ii h` se convierte en `fiih`); es necesario leer la salida token a token como indica la model card.
- En lotes con clips de distinta longitud hay que recortar cada salida a su longitud real con `model._get_feat_extract_output_lengths(attention_mask.sum(-1))`.
- Riesgo de alucinacion fonetica: en audio ruidoso o fuera de dominio puede generar secuencias de fonemas plausibles pero incorrectas.
- Sesgos: el entrenamiento se apoya en corpus concretos (Arabic Speech Corpus e Iqra_train), por lo que puede estar sesgado hacia las voces y estilos de recitacion presentes en ellos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento originales.
- La cifra de `asc_test` es optimista porque la v2 vio esos clips en entrenamiento; no debe usarse como estimacion realista de generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MostafaMaroof/wav2vec2-arabic-phoneme-asr
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Dataset Arabic Speech Corpus: https://huggingface.co/datasets/tunis-ai/arabic_speech_corpus
- Dataset Iqra_train: https://huggingface.co/datasets/IqraEval/Iqra_train
