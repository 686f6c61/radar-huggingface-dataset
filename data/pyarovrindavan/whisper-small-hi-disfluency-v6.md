# pyarovrindavan/whisper-small-hi-disfluency-v6

## Resumen

El modelo `pyarovrindavan/whisper-small-hi-disfluency-v6` es un ajuste fino (fine-tuning) de la familia Whisper de OpenAI, orientado a reconocimiento automatico del habla (ASR). Por su nombre y tamano, se trata de una variante de Whisper Small (aproximadamente 244 millones de parametros) adaptada al hindi (`hi`) y, presumiblemente, al tratamiento de disfluencias en el habla. Lo publica el usuario `pyarovrindavan` en Hugging Face bajo la libreria `transformers`, con pesos en formato `safetensors`.

El modelo resuelve el problema clasico de transcripcion de audio a texto, pero el sufijo "disfluency" sugiere un entrenamiento especifico para manejar titubeos, repeticiones y muletillas tipicas del habla espontanea, un aspecto que los modelos ASR genericos suelen normalizar o eliminar. Esto lo hace potencialmente interesante para tareas de transcripcion literal, analisis linguistico o generacion de datos de entrenamiento con fenomenos del habla real.

La relevancia actual es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y una model card generada automaticamente que no aporta informacion sobre datos de entrenamiento, licencia ni evaluacion. El repositorio ocupa 1.0 GB y el checkpoint contiene 241.734.912 parametros reales segun los tensores en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper Small: ventana de audio de 30 s por segmento, contexto de 448 tokens en el decoder) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors, admite conversion a GGUF, int8 y fp16 mediante herramientas estandar |
| Idiomas soportados | No disponible en la model card; el identificador sugiere hindi (`hi`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder disenado para ASR multitarea. El encoder procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos, y el decoder genera tokens de texto de forma autorregresiva con un contexto maximo de 448 tokens. La variante Small tiene 12 capas en encoder y decoder, con una dimension de modelo de 768 y 12 cabezas de atencion, lo que concuerda con los aproximadamente 242 millones de parametros del checkpoint.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de tokens, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan hiperparametros, regimen de precision (fp16, bf16) ni detalles del proceso de fine-tuning. El nombre del modelo indica una especializacion en hindi y en disfluencias, pero estos extremos no estan verificados por documentacion oficial. La referencia `arxiv:1910.09700` en los tags corresponde al paper de Lacoste et al. sobre el impacto ambiental del aprendizaje automatico, citado en la plantilla de la model card, no a un paper del modelo.

## Capacidades

- Transcripcion de audio a texto (ASR) en hindi, segun el identificador del modelo.
- Tratamiento presumible de disfluencias del habla (repeticiones, titubeos, muletillas), segun el sufijo del nombre.
- Procesamiento de segmentos de audio de hasta 30 segundos por inferencia.
- Capacidad multilingue heredada de Whisper Small (99 idiomas en el modelo base), aunque el fine-tuning probablemente haya degradado el rendimiento fuera del hindi.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion literal de entrevistas en hindi: el modelo puede generar transcripciones que preserven titubeos y repeticiones, utiles para analisis conversacional o linguistico, gracias a su especializacion en disfluencias.
- Generacion de corpus anotados para investigacion en linguistica de corpus: al mantener las disfluencias, sirve para construir datasets de habla espontanea con fenomenos paralinguisticos.
- Subtitulado de contenido audiovisual en hindi: con segmentos de 30 segundos, encaja en pipelines de subtitulado donde se prioriza fidelidad sobre fluidez.
- Preprocesado para sistemas de limpieza de texto: la salida con disfluencias puede alimentar modulos posteriores de normalizacion o deteccion de muletillas.
- Prototipado rapido en entornos con recursos limitados: con 242 millones de parametros, cabe en GPU de consumo y permite iterar sin infraestructura dedicada.
- Investigacion sobre robustez ASR: util como linea base para comparar el efecto del fine-tuning en disfluencias frente a Whisper Small original en hindi.
- Transcripcion de llamadas de atencion al cliente en hindi: para analisis de calidad donde las vacilaciones del cliente aportan informacion sobre confusion o frustracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,5 GB de pesos, con picos de 1-2 GB incluyendo activaciones y buffers de audio.
- VRAM estimada en fp32: aproximadamente 1 GB de pesos, con picos de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con pipeline `automatic-speech-recognition`, conversion a GGUF para `whisper.cpp` o `llama.cpp` (soporte parcial), `faster-whisper` (CTranslate2) si se convierte, y servidores compatibles con la API de Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada; en una RTX 4090 se espera procesamiento en tiempo real o mas rapido para segmentos de 30 segundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pyarovrindavan/whisper-small-hi-disfluency-v6 | 241,7 M | 30 s audio / 448 tokens decoder | No disponible (presumiblemente hindi) | No disponible | Hugging Face, 0 descargas |
| openai/whisper-small | 244 M | 30 s audio / 448 tokens decoder | 99 idiomas | MIT | Hugging Face, ampliamente usado |
| openai/whisper-small.en | 244 M | 30 s audio / 448 tokens decoder | Ingles | MIT | Hugging Face |
| ai4bharat/indicwhisper-small | ~244 M | 30 s audio / 448 tokens decoder | Varios idiomas indios | No verificada en esta ficha | Hugging Face |

La comparativa se limita a caracteristicas estructurales, ya que no hay datos de rendimiento publicados para el modelo objeto de la ficha. Frente a `openai/whisper-small`, la diferencia principal es la especializacion en hindi y disfluencias, a costa de perder la cobertura multilingue y la claridad de licencia.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no contiene informacion sustantiva sobre entrenamiento, evaluacion ni uso previsto.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue en produccion.
- No hay datos de evaluacion que respalden la calidad de la transcripcion ni la eficacia del tratamiento de disfluencias.
- El modelo tiene cero descargas y cero likes, sin evidencia de uso o validacion por parte de la comunidad.
- El fine-tuning en hindi puede haber degradado el rendimiento en otros idiomas respecto al Whisper Small original.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos con ruido, silencios largos o audio de baja calidad.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de genero, dialecto o registro.
- La ventana de 30 segundos por segmento limita la transcripcion de audio largo a pipelines con segmentacion previa.
- No se documenta el comportamiento en dominios especializados (medico, legal, tecnico) ni en variedades dialectales del hindi.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyarovrindavan/whisper-small-hi-disfluency-v6
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
