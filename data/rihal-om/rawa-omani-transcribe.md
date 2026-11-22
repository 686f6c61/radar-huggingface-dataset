# Rihal-om/rawa-omani-transcribe

## Resumen

rawa-omani-transcribe es un adaptador LoRA de 66 MB que especializa el modelo CohereLabs/cohere-transcribe-arabic-07-2026 (2,1 mil millones de parametros) en la transcripcion de arabe omani conversacional. Lo desarrolla Rihal-om, y su proposito es cubrir un nicho mal atendido por los sistemas ASR generalistas: audio corto grabado con microfonos de telefono, con habla coloquial que mezcla arabe y palabras en ingles (code-switching), y con toponimos omanies. El adaptador no es un modelo autonomo: requiere cargar el modelo base y aplicar los pesos PEFT encima.

La relevancia practica del adaptador esta en su relacion coste-beneficio. Entrenado con apenas unas 2 horas de audio privado de 15 hablantes, consigue reducir el WER un 29 % relativo (de 37,0 % a 26,1 %) en un conjunto ciego de los mismos hablantes. En cambio, sobre hablantes del Golfo ajenos al entrenamiento la mejora se diluye a 1,9 y 3,1 puntos porcentuales, y sobre arabe estandar formal (MSA) el adaptador empeora un 51 % relativo. Es, por tanto, una herramienta de dominio muy acotado, no un sustituto del modelo base.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y libreria PEFT, y esta etiquetado para el pipeline automatic-speech-recognition con idioma `ar`. Su utilidad principal es el despliegue de transcripcion especializada en contacto con cliente omaní, no la transcripcion general de arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo ASR CohereLabs/cohere-transcribe-arabic-07-2026; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | 2,1 mil millones (modelo base); el adaptador ocupa 66 MB |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (`ar`), con foco en arabe omani y del Golfo, y code-switching arabe-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de bajo rango sobre el checkpoint CohereLabs/cohere-transcribe-arabic-07-2026, un modelo de reconocimiento automatico del habla de 2,1 mil millones de parametros. La informacion disponible no detalla la arquitectura interna del modelo base (tipo de encoder/decoder, atencion, etc.), por lo que no puede confirmarse si se trata de un transformer encoder-decoder clasico u otra variante. El adaptador se distribuye como pesos PEFT en safetensors dentro de un repositorio de unos 0,1 GB.

El entrenamiento se realizo con aproximadamente 2 horas de audio privado procedente de 15 hablantes de arabe omani conversacional. Las etiquetas de entrenamiento emplean ortografia coloquial tal como se pronuncia, mantienen las palabras inglesas en alfabeto latino e incluyen toponimos omanies; el autor advierte que estas propiedades no se evaluan por separado. La decodificacion usada en todas las comparaciones es greedy con `max_new_tokens=432` y `no_repeat_ngram_size=6`, identica para el modelo base y para el adaptador. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto (ASR) de arabe omani conversacional en grabaciones cortas de microfono de telefono.
- Manejo de code-switching arabe-ingles, preservando las palabras inglesas en alfabeto latino.
- Reconocimiento de toponimos omanies en la salida transcrita.
- Transcripcion de habla del Golfo (Khaliji) con mejoras moderadas respecto al modelo base.
- Salida en ortografia coloquial as-spoken, no en arabe estandar formal.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No dispone de capacidades de vision, audio generativo ni modo thinking.
- Capacidades multilingues limitadas: solo arabe (con mezcla de ingles en el habla).

## Casos de uso

- Atencion al cliente en Oman: transcripcion de llamadas telefonicas cortas de clientes que hablan en dialecto omani coloquial, aprovechando la reduccion del 29 % relativo de WER en hablantes del dominio de entrenamiento.
- Analisis de encuestas y entrevistas telefonicas: conversion a texto de grabaciones de campo con microfonos de movil, donde el adaptador esta optimizado para audio de baja calidad de captura.
- Moderacion y busqueda en centros de contacto: indexacion de conversaciones con code-switching arabe-ingles para busqueda posterior, manteniendo los terminos ingleses en alfabeto latino.
- Sistemas de subtitulado interno para equipos omanies: generacion de transcripciones de reuniones informales en dialecto, siempre que el audio sea de hablantes similares a los del entrenamiento.
- Procesamiento de audio con toponimos locales: normalizacion de direcciones y referencias geograficas omanies en transcripciones para logistica o reparto.
- Prototipado rapido de ASR dialectal: el adaptador de 66 MB permite experimentar con especializacion dialectal sobre un modelo base de 2,1 B sin reentrenar el modelo completo.
- No recomendado para transcripcion de noticias, conferencias o texto leido en MSA: en ese dominio el modelo base es claramente superior.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). El normalizador "leaderboard" corresponde al de la Open Universal Arabic ASR Leaderboard; "metric v2" se aplica a los conjuntos privados omanies.

| Conjunto de evaluacion | Que mide | Normalizador | WER base | WER adaptador | Cambio |
|---|---|---|---|---|---|
| Omani blind test (22 archivos) | In-domain, reservado, puntuado una vez | metric v2 | 37,0 % | 26,1 % | -10,9 pts (-29 %) |
| Omani development set (64 archivos) | In-domain, usado en desarrollo (optimista) | metric v2 | 32,9 % | 18,3 % | -14,6 pts (-44 %) |
| Casablanca UAE (813 enunciados) | Hablantes del Golfo ajenos al entrenamiento | leaderboard | 34,99 % | 33,08 % | -1,9 pts (-5 %) |
| SADA 2022 Khaliji (1150 enunciados) | Hablantes del Golfo ajenos al entrenamiento | leaderboard | 36,51 % | 33,43 % | -3,1 pts (-8 %) |
| FLEURS ar_eg (428 enunciados) | MSA formal, fuera de alcance | leaderboard | 5,23 % | 7,89 % | +2,7 pts (+51 %) |

Metricas CER declaradas en el model-index:

| Conjunto | WER | CER |
|---|---|---|
| Casablanca (UAE, test) | 33,08 | 11,31 |
| SADA 2022 (Khaliji) | 33,50 | 14,49 |
| SADA 2022 (todos los dialectos) | 33,15 | 15,65 |
| FLEURS (ar_eg, test) | 7,89 | 4,87 |

En el conjunto ciego omani, el adaptador obtiene menor WER en 16 de 22 archivos, mayor en 5 e igual en 1 (test de signos bilateral, p = 0,02). Los intervalos de confianza al 95 % son de tipo bootstrap.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 2,1 mil millones de parametros, lo que en precision FP16 supone del orden de 4-5 GB solo para pesos, mas memoria para activaciones y audio de entrada.
- El adaptador LoRA anade solo 66 MB, por lo que no altera sustancialmente los requisitos del modelo base.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, un modelo de 2,1 B es compatible con GPU de consumo con suficiente VRAM (gama RTX xx90 o similar); no se confirma compatibilidad con GPU de 8 GB.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con la libreria `peft`/Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Casablanca UAE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rawa-omani-transcribe (adaptador) | 2,1 B (base) + 66 MB | no disponible | 33,08 | Apache 2.0 | Hugging Face |
| CohereLabs/cohere-transcribe-arabic-07-2026 (base) | 2,1 B | no disponible | 34,99 | no disponible en la informacion proporcionada | Hugging Face |
| Otros modelos ASR para arabe | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar el adaptador con su propio modelo base. No se dispone de datos verificables de otros sistemas ASR arabes comparables.

## Limitaciones y advertencias

- El adaptador esta entrenado con solo 2 horas de audio de 15 hablantes: el riesgo de sobreajuste a esas voces y condiciones de grabacion es alto.
- El rendimiento en hablantes omanies fuera del grupo de entrenamiento no se ha medido.
- En MSA formal (noticias, conferencias, texto leido) el adaptador empeora el WER un 51 % relativo respecto al modelo base; no debe usarse en ese dominio.
- No renderiza palabras inglesas en alfabeto arabe ni convierte numeros a digitos sin el paso de postprocesado en `postproc/`.
- Las etiquetas usan ortografia coloquial as-spoken, lo que puede no encajar con pipelines que esperan MSA normalizado.
- Riesgo de alusion: al ser un modelo ASR, puede transcribir incorrectamente nombres propios, cifras y terminos tecnicos, especialmente fuera del dominio omani.
- No se documentan sesgos demograficos especificos, pero la muestra de 15 hablantes implica sesgo de variedad dialectal y de genero desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones propias no detalladas en la informacion disponible; conviene verificar la licencia de CohereLabs/cohere-transcribe-arabic-07-2026 antes de produccion.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rihal-om/rawa-omani-transcribe
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Dataset Casablanca: https://huggingface.co/datasets/UBC-NLP/Casablanca
- Dataset SADA 2022: https://huggingface.co/datasets/m6011/sada2022
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Open Universal Arabic ASR Leaderboard: no disponible en la informacion proporcionada
