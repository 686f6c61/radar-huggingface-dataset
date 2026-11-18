# alphaedge-ai/whisper-base-som-16384

## Resumen

whisper-base-som-16384 es una variante podada (*trimmed*) de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) de OpenAI publicado en 2022. Lo desarrolla alphaedge-ai y aplica la tecnica de reduccion de vocabulario descrita por Loick Bourdois en el blog de Hugging Face, especializando el modelo para el idioma somali (`so`). El resultado es un checkpoint un 25,02 % mas pequeno en parametros (54.427.648 frente a 72.593.920) y con un vocabulario reducido un 68,41 % (de 51.865 a 16.384 tokens).

El modelo conserva la arquitectura original de Whisper: un transformer encoder-decoder con entrada de audio a 16 kHz y decodificacion autoregresiva de tokens de texto. La poda se limita al vocabulario del tokenizer, de modo que la torre del encoder de audio y la mayor parte de los pesos del decoder permanecen intactos; solo se eliminan las filas de la matriz de embeddings y de la proyeccion de salida asociadas a tokens poco frecuentes en somali. Esto reduce el peso en disco y la memoria necesaria sin alterar el coste computacional del encoder.

Su relevancia es practica: permite desplegar ASR en somali en entornos con recursos limitados (CPU, GPUs de gama baja, dispositivos embebidos) con un footprint de aproximadamente 0,1 GB en el repositorio. Es un modelo de nicho, con 57 descargas y sin resultados de benchmarks publicados, orientado a pipelines de transcripcion en somali mas que a un uso general multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), audio 16 kHz |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | somali (`so`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder que procesa espectrogramas mel de audio de 30 segundos a 16 kHz y un decoder autoregresivo que genera la transcripcion token a token, con tokens especiales de idioma y tarea. El modelo original fue entrenado por OpenAI con supervision debil a gran escala (paper arXiv:2212.04356). Esta version no reentrena el modelo: aplica *trimming*, es decir, reduce el vocabulario del tokenizer a 16.384 tokens seleccionados a partir de 200.000 textos del dataset lbourdois/fineweb-2-trimming, y recorta en consecuencia las matrices de embeddings y la cabeza de salida.

No se ha realizado un ajuste fino adicional ni RLHF/DPO segun la informacion disponible. La innovacion tecnica es exclusivamente la poda de vocabulario: menor huella de memoria y menor tamano de checkpoint, a costa de perder cobertura de tokens no presentes en somali.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en somali.
- Procesamiento de audio a 16 kHz con ventanas de hasta 30 segundos por pasada.
- Generacion de transcripciones con tokens especiales de idioma (`somali`) y tarea (`transcribe`).
- Integracion con el pipeline `automatic-speech-recognition` de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: el vocabulario podado degrada el rendimiento en idiomas distintos del somali.
- No dispone de modo *thinking*, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y entrevistas en somali: el modelo convierte audio de hasta 30 segundos por fragmento en texto, adecuado para actas y subtitulado interno con bajo coste de memoria.
- Subtitulado de contenido audiovisual en somali: al ser un checkpoint de 0,1 GB, puede ejecutarse en servidores modestos para generar subtitulos en lote.
- Atencion al cliente en somali: transcripcion de llamadas o mensajes de voz para su posterior analisis o enrutamiento, con un footprint reducido que permite despliegue en CPU.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos de somali a partir de grabaciones de campo, con un modelo ligero que cabe en portatiles.
- Prototipado rapido de pipelines ASR: su tamano permite iterar y validar integraciones con transformers antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: dispositivos embebidos o contenedores con poca RAM donde whisper-base completo no cabria con holgura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint de 54,4 M de parametros; aproximadamente 0,2-0,3 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona tambien en CPU.
- Cabe en GPU de consumo: si, en GTX 1050, RTX 2060, RTX 3060, RTX 4090 y similares, e incluso en CPU.
- Opciones de despliegue: transformers (`pipeline` de `automatic-speech-recognition`), y en general los backends compatibles con checkpoints Whisper de transformers.
- Latencia y throughput: no disponibles; al ser un modelo base podado, se espera una latencia similar a whisper-base en el encoder y ligeramente menor en la proyeccion de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-som-16384 | 54.427.648 | 16.384 | so | apache-2.0 | Hugging Face |
| openai/whisper-base | 72.593.920 | 51.865 | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-small | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El vocabulario podado elimina tokens poco frecuentes en somali; el modelo puede degradarse en otros idiomas o en dominios con vocabulario especializado.
- Riesgo de alucinacion en audio con ruido, silencios o habla solapada, comportamiento heredado de Whisper.
- Sesgos heredados del entrenamiento original de OpenAI, no evaluados en esta variante.
- Ventana de audio limitada a 30 segundos por pasada; requiere segmentacion para audios largos.
- No se han publicado evaluaciones de calidad (WER) para esta version podada.
- Licencia apache-2.0 permisiva para uso comercial, pero sin garantias del autor.
- Modelo de nicho con muy pocas descargas (57) y sin likes; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-som-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
