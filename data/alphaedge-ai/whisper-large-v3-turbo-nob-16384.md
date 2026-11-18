# alphaedge-ai/whisper-large-v3-turbo-nob-16384

## Resumen

`whisper-large-v3-turbo-nob-16384` es una variante podada del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper, pero reduce el vocabulario del tokenizer de 51.865 a 16.384 tokens (un 68,41% menos) mediante la tecnica de *trimming* descrita por Loïck Bourdois en el blog de Hugging Face. El resultado es un modelo de 763.461.120 parametros (frente a los 808.878.080 del original, un 5,61% de reduccion) especializado en noruego bokmal (`nb`).

La relevancia de este modelo es fundamentalmente practica: al recortar el vocabulario a los tokens efectivamente usados en noruego bokmal, se reduce la huella de memoria del modelo (1,5 GB en el repositorio) y se acelera ligeramente la decodificacion, manteniendo un comportamiento esperado similar al original para ese idioma. Es un ejemplo de optimizacion de despliegue para un unico idioma, no un modelo nuevo entrenado desde cero.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors compatible con la libreria `transformers`, y esta pensado para tareas de transcripcion de audio en noruego bokmal. No se han publicado resultados de benchmarks especificos para esta variante podada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | noruego bokmal (`nb`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI sobre supervision debil a gran escala (paper arXiv:2212.04356). La variante `turbo` del modelo base reduce el numero de capas del decoder respecto a `large-v3`, lo que explica su menor coste de inferencia. Esta version concreta **no se ha reentrenado**: el autor aplica unicamente una poda del vocabulario del tokenizer y de la matriz de embeddings correspondiente.

El proceso de *trimming* consistio en identificar los tokens del vocabulario relevantes para noruego bokmal minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming`, y conservar los 16.384 tokens mas frecuentes. Los tokens no usados en ese idioma se eliminan del vocabulario y de la capa de embedding, reduciendo el numero de parametros un 5,61%. No se dispone de informacion sobre fine-tuning adicional, RLHF, DPO ni datos de audio noruegos empleados en esta variante.

## Capacidades

- Transcripcion de audio a texto (ASR) en noruego bokmal.
- Traduccion de audio a texto en ingles (tarea `translate` de Whisper), aunque el modelo esta optimizado para `transcribe` en `nb`.
- Procesamiento de audio muestreado a 16 kHz, en ventanas de hasta 30 segundos por segmento.
- Deteccion automatica de idioma (heredada de Whisper), aunque degradada por la reduccion de vocabulario.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta vision, audio generativo ni modos de "thinking".

## Casos de uso

- **Transcripcion de reuniones en noruego bokmal**: el modelo procesa audio a 16 kHz y genera transcripciones en ventanas de 30 s, adecuado para actas y notas de reunion en empresas noruegas.
- **Subtitulado de contenido audiovisual**: integrable en pipelines con `transformers` para generar subtitulos en noruego bokmal a partir de videos o podcasts.
- **Atencion al cliente con voz**: transcripcion de llamadas o mensajes de voz de usuarios noruegos antes de pasarlos a un sistema NLP posterior.
- **Despliegue en entornos con recursos limitados**: al tener un 5,61% menos de parametros y un vocabulario un 68,41% menor, reduce la huella de memoria frente al modelo original, lo que facilita su ejecucion en GPUs de gama media.
- **Investigacion en ASR de bajo recursos**: sirve como caso de estudio de la tecnica de trimming aplicada a un idioma concreto, comparable con otras variantes podadas del mismo autor.
- **Prototipado rapido en noruego**: al cargarse con `pipeline("automatic-speech-recognition")` de transformers, permite validar rapidamente flujos de transcripcion sin necesidad de infraestructura pesada.
- **Procesamiento por lotes de archivos de audio**: util para transcribir grandes volumenes de grabaciones en noruego bokmal en servidores con GPU modesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate) ni comparaciones cuantitativas con el modelo original o con otras variantes podadas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 763 M de parametros en safetensors (aproximadamente 1,5 GB en fp32), cabe en GPUs con 4-6 GB de VRAM en fp16. En cuantizacion de 8 bits o 4 bits, la huella se reduce aun mas.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente. Para produccion con alto throughput, A100 o H100 ofrecen margen sobrado pero no son necesarias.
- **Cabe en GPU consumer**: si, en practicamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU con latencia mayor.
- **Opciones de despliegue**: `transformers` (pipeline de ASR), vLLM no aplica (no es un modelo de lenguaje generativo), llama.cpp no soporta Whisper de forma nativa, TGI tampoco. La via recomendada es `transformers` con `pipeline`, o `faster-whisper`/`whisper.cpp` si se convierten los pesos.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-large-v3-turbo-nob-16384` | 763.461.120 | ventana de 30 s | `nb` | apache-2.0 | Hugging Face |
| `openai/whisper-large-v3-turbo` | 808.878.080 | ventana de 30 s | multilingue | apache-2.0 | Hugging Face |
| `openai/whisper-large-v3` | 1.550 M aprox. | ventana de 30 s | multilingue | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre otras variantes podadas equivalentes en la busqueda realizada. Frente al modelo base `turbo`, esta variante reduce parametros y vocabulario pero pierde cobertura multilingue; frente a `large-v3`, es sustancialmente mas ligera pero tambien menos precisa en idiomas distintos del noruego bokmal.

## Limitaciones y advertencias

- **Especializacion idiomatica**: el vocabulario se ha recortado a noruego bokmal; el rendimiento en otros idiomas, incluido el espanol, sera previsiblemente pobre o directamente invalido.
- **Riesgo de alucinacion**: como todos los modelos Whisper, puede generar texto inventado en segmentos de silencio o ruido, especialmente con audio de baja calidad.
- **Sesgos**: hereda los sesgos del corpus de entrenamiento original de Whisper (mayoritariamente audio en ingles y de dominios concretos), lo que puede afectar a la representacion de acentos y variedades del noruego.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- **Sin benchmarks**: no hay metricas de WER publicadas para esta variante, por lo que la calidad real en noruego bokmal debe validarse empiricamente antes de desplegarla.
- **Ventana de audio fija**: Whisper procesa segmentos de 30 s; audios mas largos requieren troceado y ensamblado manual.
- **Mantenimiento**: el modelo tiene 28 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-nob-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
