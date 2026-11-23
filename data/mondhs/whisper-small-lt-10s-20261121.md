# mondhs/whisper-small-lt-10s-20261121

## Resumen

`mondhs/whisper-small-lt-10s-20261121` es un ajuste fino (fine-tuning) del modelo `openai/whisper-small` para reconocimiento automatico del habla (ASR) en lituano. Lo publica el usuario `mondhs` en Hugging Face y esta entrenado sobre el corpus LIEPA-3, un conjunto de datos de habla lituana. El modelo resuelve la tarea de transcripcion de audio a texto en lituano, un idioma de bajos recursos para el que los modelos multilingues genericos suelen ofrecer un rendimiento inferior al de un ajuste especifico.

Arquitectura transformer encoder-decoder con 241.734.912 parametros, heredada de Whisper Small, con una ventana de contexto de audio de 30 segundos (aunque el nombre del modelo sugiere un entrenamiento orientado a segmentos de hasta 10 segundos). Se distribuye en formato `safetensors` bajo licencia MIT, aunque el repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face para su descarga.

Su relevancia radica en que especializa un modelo pequeno (aproximadamente 242 M de parametros) para un idioma concreto, lo que permite despliegues en hardware modesto con latencias bajas, a cambio de renunciar a la cobertura multilingue del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | audio de 30 s por segmento (ventana estandar de Whisper); el nombre del modelo indica entrenamiento con segmentos de 10 s |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; al ser safetensors, admite conversion a GGUF/ONNX por herramientas externas) |
| Idiomas soportados | lituano (lt) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Dataset de entrenamiento | liepa-project/LIEPA-3_read-spon-dial_16kHz |
| Acceso | restringido (gated) |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio y genera tokens de texto de forma autoregresiva. Whisper Small emplea 12 capas de encoder y 12 de decoder, con una dimension oculta de 768 y 12 cabezas de atencion, lo que suma los 241,7 M de parametros indicados. La ventana de audio estandar es de 30 segundos, aunque el identificador del modelo (`lt-10s`) apunta a un regimen de entrenamiento con segmentos de hasta 10 segundos.

El ajuste fino se ha realizado sobre el dataset `liepa-project/LIEPA-3_read-spon-dial_16kHz`, que combina habla leida, espontanea y dialogada en lituano muestreada a 16 kHz. No se dispone de informacion publica sobre el numero de tokens de audio, la composicion exacta del dataset, el uso de RLHF/DPO ni detalles del procedimiento de entrenamiento (learning rate, epocas, aumentacion de datos) mas alla de la referencia al corpus LIEPA-3. Tampoco se documentan innovaciones tecnicas adicionales sobre la arquitectura base.

## Capacidades

- Transcripcion de audio a texto en lituano (ASR) para habla leida, espontanea y dialogada.
- Generacion de transcripciones con puntuacion y segmentacion temporal propias del decoder de Whisper (timestamps a nivel de segmento).
- Procesamiento de segmentos de audio de hasta 30 segundos (con entrenamiento orientado a segmentos de hasta 10 segundos).
- No soporta tool calling ni function calling: es un modelo puramente de ASR.
- No esta disenado para agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al lituano; el resto de idiomas del modelo base no se han preservado de forma garantizada tras el ajuste.
- No incorpora vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lituano: el modelo convierte grabaciones de habla dialogada en texto, aprovechando que el corpus LIEPA-3 incluye habla espontanea y dialogada, lo que lo hace adecuado para conversaciones no guionizadas.
- Subtitulado automatico de contenido audiovisual lituano: la generacion de timestamps por segmento permite alinear subtitulos con el audio en produccion de video.
- Atencion al cliente por voz en lituano: integrado en un pipeline de ASR previo a un LLM, transcribe las llamadas para su analisis o para alimentar respuestas automaticas, con la ventaja de que un modelo de 242 M de parametros se ejecuta en CPU o GPU modesta.
- Archivado y busqueda de audio: transcripcion masiva de archivos de audio historicos o institucionales en lituano para indexacion y busqueda por texto.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones para analisis fonetico, lexico o estadistico del lituano, especialmente por su entrenamiento sobre LIEPA-3.
- Prototipado y evaluacion de ASR en entornos con recursos limitados: al ser un modelo pequeno con licencia MIT, sirve como base para experimentos academicos o para desplegar ASR en dispositivos con poca VRAM.
- Accesibilidad: transcripcion en tiempo casi real de discursos o clases en lituano para generar subtitulos destinados a personas con discapacidad auditiva.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false`):

| Dataset | Metrica | Valor |
|---|---|---|
| FLEURS (lt_lt, test) | WER | 20.8 |
| FLEURS (lt_lt, test) | CER | 10.2 |
| LIEPA-3 test (l3_test_v2-50h, privado) | WER | 12.9 |
| LIEPA-3 test (l3_test_v2-50h, privado) | CER | 3.4 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni datos de benchmarks adicionales (MMLU, HumanEval, GSM8K no aplican a un modelo de ASR).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB de pesos, con un consumo total tipico de 1-2 GB incluyendo activaciones y buffers de audio.
- VRAM estimada en fp32: aproximadamente 1 GB de pesos, con 2-3 GB totales en ejecucion.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. En entornos de servidor, A100 o H100 no son necesarias y solo aportarian throughput agregado en lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM; tambien puede ejecutarse en CPU con latencias aceptables para audio corto.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), conversion a ONNX, `whisper.cpp` o `faster-whisper` previa conversion de pesos, y servidores de inferencia compatibles con modelos Whisper.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia del orden de decimas de segundo por segmento de 10 s en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| mondhs/whisper-small-lt-10s-20261121 | 241,7 M | 30 s (entrenado a 10 s) | lituano | MIT | Gated |
| openai/whisper-small | 241,7 M | 30 s | multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-medium | 769 M | 30 s | multilingue (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3 | 1.550 M | 30 s | multilingue (99 idiomas) | MIT | Abierto |

El modelo ajustado sacrifica cobertura multilingue por especializacion en lituano. Frente a `whisper-small` base, se espera una mejora en WER para lituano derivada del ajuste fino sobre LIEPA-3, aunque no se dispone de los valores de WER del modelo base en los mismos conjuntos para cuantificar la diferencia. No se conocen en la informacion proporcionada otros ajustes de Whisper para lituano con los que comparar directamente.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en lituano; no debe usarse para transcribir otros idiomas.
- Los benchmarks declarados no estan verificados de forma independiente (`verified: false`); el WER de 20,8 en FLEURS es relativamente alto y sugiere margen de mejora.
- El conjunto de evaluacion LIEPA-3 (`l3_test_v2-50h`) es privado, lo que impide reproducir esa metrica.
- Riesgo de alucinacion tipico de Whisper: en audio con ruido, silencios largos o habla solapada puede generar texto inventado o repetir frases.
- Entrenado con segmentos de hasta 10 segundos; el rendimiento puede degradarse con audios mas largos si no se segmentan adecuadamente.
- El repositorio es de acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo, lo que anade friccion a pipelines automatizados.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio concreto de produccion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un corpus especifico (LIEPA-3), puede presentar sesgos de dominio, registro o variedad dialectal del lituano.
- No se documentan cuantizaciones oficiales ni versiones GGUF/ONNX publicadas; cualquier conversion corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mondhs/whisper-small-lt-10s-20261121
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/liepa-project/LIEPA-3_read-spon-dial_16kHz
- Dataset de evaluacion (privado, referenciado): https://huggingface.co/datasets/mondhs/l3_test_v2-50h
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
