# sheptai/whisper-small-belarusian-v1

## Resumen

whisper-small-belarusian-v1 es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla openai/whisper-small, especializado en la transcripcion de bielorruso (`be`). Lo desarrolla el usuario sheptai y se publica bajo licencia MIT. El modelo resuelve un problema concreto: el bielorruso es un idioma de bajos recursos para el que los checkpoints genericos de Whisper rinden muy mal, y este ajuste reduce drasticamente la tasa de error respecto al modelo base.

Arquitectura y tamano son los de Whisper small: un transformer encoder-decoder de aproximadamente 241,7 millones de parametros (dato real de los pesos safetensors), con una ventana de contexto de audio de 30 segundos por segmento. No es un modelo de lenguaje generativo general, sino un sistema ASR (automatic speech recognition) que convierte audio en texto.

Su relevancia es practica: demuestra que un ajuste fino eficiente (LoRA fusionado en los pesos base) sobre un checkpoint pequeno puede superar a modelos mucho mayores en un idioma concreto. Segun la model card, en el subconjunto de test de FLEURS bielorruso obtiene un CER del 4,39 % y un WER del 16,17 %, muy por delante del whisper-small original (21,69 % CER / 75,41 % WER) y del whisper-large-v3 sin ajustar (9,67 % CER / 42,91 % WER).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite las cuantizaciones habituales de transformers/whisper.cpp, no verificadas) |
| Idiomas soportados | bielorruso (`be`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder disenado para ASR multilingue con una ventana fija de 30 segundos de audio. Sobre esa base se aplico un ajuste fino con un adaptador LoRA que posteriormente se fusiono en los pesos del modelo, de modo que el repositorio se carga como un checkpoint Whisper convencional sin necesidad de cargar el adaptador por separado.

Los datos de entrenamiento, segun la model card, son Mozilla Common Voice Corpus 27.0 en bielorruso (licencia CC0) y Google FLEURS en la variante `be_by` (licencia CC BY 4.0). No se especifican en la informacion disponible el numero de tokens, las horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR). Tampoco se detallan hiperparametros del entrenamiento LoRA (rango, alpha, epochs).

## Capacidades

- Transcripcion de voz a texto en bielorruso (`be`) a partir de audio.
- Reconocimiento de habla con la ventana de 30 segundos por segmento propia de Whisper (admite segmentacion para audios mas largos mediante el pipeline de transformers).
- Tarea de transcripcion configurable mediante `generate_kwargs={"language": "belarusian", "task": "transcribe"}`.
- Compatible con la API `pipeline("automatic-speech-recognition")` de transformers y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo ASR, no un LLM generativo.
- Capacidades multilingues: limitadas al bielorruso segun la model card; no se documenta soporte para otros idiomas.

## Casos de uso

- Transcripcion de archivos de audio en bielorruso: el modelo convierte grabaciones (entrevistas, ponencias, notas de voz) en texto con un CER del 4,39 % en el benchmark declarado, adecuado para documentacion y archivo.
- Subtitulado automatico de contenido audiovisual bielorruso: genera transcripciones que pueden alinearse con marcas de tiempo para subtitulos en plataformas de video, gracias a su tamano reducido que permite procesar lotes en GPU consumer.
- Investigacion linguistica y corpus: permite transcribir grandes volumenes de audio bielorruso para construir corpus anotados, con calidad muy superior al whisper-small sin ajustar.
- Accesibilidad: conversion de audio a texto para personas con discapacidad auditiva en entornos donde el bielorruso es la lengua de uso.
- Archivado y busqueda de material historico o periodistico: transcripcion de fondos de audio para indexacion y busqueda por texto.
- Integracion en pipelines de transcripcion a bajo coste: al ser un modelo de 241 M de parametros, puede desplegarse en servidores modestos o incluso en GPU de gama de entrada, reduciendo el coste frente a modelos large.
- Prototipado de asistentes de voz en bielorruso: como componente ASR dentro de un sistema mayor (chatbot, dictado), aunque requeriria validacion adicional en produccion.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre un subconjunto de 300 enunciados del split de test de FLEURS bielorruso (CER y WER en porcentaje, menor es mejor):

| Modelo | CER | WER |
|---|---:|---:|
| BuzzASR/belarusian (large-v3) | 2,27 | 8,84 |
| openai/whisper-large-v3 | 9,67 | 42,91 |
| openai/whisper-small | 21,69 | 75,41 |
| ales/whisper-small-belarusian | 13,86 | 22,99 |
| dziaineka/whisper-small-belarusian (run 4) | 23,63 | 31,17 |
| dziaineka/whisper-small-belarusian (run 5) | 17,53 | 25,82 |
| **sheptai/whisper-small-belarusian-v1** | **4,39** | **16,17** |

Segun el autor, entre los checkpoints Whisper small de la comparativa, v1 obtiene el CER y WER mas bajos; queda por detras del large-v3 ajustado y por delante del large-v3 sin ajustar en este conjunto.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 241,7 M de parametros; en fp16 ocupa aproximadamente 0,5 GB de pesos, y en fp32 alrededor de 1 GB. Con overhead de inferencia, cabe holgadamente en 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona bien en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No requiere GPU de datacenter.
- GPU consumer: si, cabe en practicamente cualquier GPU consumer moderna e incluso puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (`pipeline`), y por ser un checkpoint Whisper estandar, es compatible con ecosistemas Whisper como whisper.cpp, faster-whisper o servidores de inferencia compatibles con transformers (vLLM/TGI no estan verificados para este checkpoint en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLEURS be) | WER (FLEURS be) | Licencia |
|---|---|---:|---:|---:|---|
| sheptai/whisper-small-belarusian-v1 | 241,7 M | 30 s audio | 4,39 | 16,17 | MIT |
| ales/whisper-small-belarusian | no disponible | 30 s audio | 13,86 | 22,99 | no disponible |
| openai/whisper-small | 241,7 M | 30 s audio | 21,69 | 75,41 | MIT |
| openai/whisper-large-v3 | no disponible | 30 s audio | 9,67 | 42,91 | MIT |
| BuzzASR/belarusian (large-v3) | no disponible | 30 s audio | 2,27 | 8,84 | no disponible |

## Limitaciones y advertencias

- Especializado unicamente en bielorruso; no se garantiza su comportamiento en otros idiomas.
- Es un modelo ASR: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados, habla solapada o dominios tecnicos no representados en Common Voice/FLEURS.
- Los benchmarks declarados se basan en un subconjunto de 300 enunciados de FLEURS; el rendimiento en dominios reales puede diferir.
- No se documentan sesgos especificos, pero hereda los sesgos de los corpus de entrenamiento (Common Voice y FLEURS), que pueden infrarepresentar determinados registros o variantes dialectales.
- Licencia MIT para los pesos, pero los datasets subyacentes mantienen sus licencias (CC0 para Common Voice, CC BY 4.0 para FLEURS), que hay que respetar en el uso de las grabaciones y transcripciones originales.
- No se especifican cuantizaciones oficiales ni resultados de latencia/throughput; conviene validar el despliegue en el entorno objetivo antes de produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion por la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sheptai/whisper-small-belarusian-v1
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Licencia de Whisper: https://github.com/openai/whisper/blob/main/LICENSE
- Modelo comparable BuzzASR/belarusian: https://huggingface.co/BuzzASR/belarusian
- Modelo comparable ales/whisper-small-belarusian: https://huggingface.co/ales/whisper-small-belarusian
- Modelo comparable dziaineka/whisper-small-belarusian: https://huggingface.co/dziaineka/whisper-small-belarusian
