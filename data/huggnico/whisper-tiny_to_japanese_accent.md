# huggnico/whisper-tiny_to_japanese_accent

## Resumen

Whisper tiny japanese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario huggnico en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, con 37.760.640 parametros totales y un peso en disco de aproximadamente 0,3 GB en formato safetensors. El modelo parte de la variante "tiny" de la familia Whisper, la mas pequena de OpenAI, y ha sido reentrenado sobre el dataset japanese_english.

El objetivo declarado del autor es adaptar el reconocimiento de Whisper a un dominio concreto de habla inglesa con acento japones, un caso de uso donde los modelos ASR genericos suelen degradarse. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y esta etiquetado con idioma "en" en la model card. El resultado declarado en el conjunto de evaluacion es un WER de 21,4442 y una perdida de validacion de 0,4626.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste fino de bajo coste computacional sobre un modelo tiny, apto para despliegues en CPU o GPUs de consumo; por otro, advierte de que la informacion publicada por el autor es muy escasa (la model card esta generada automaticamente y contiene secciones "More information needed"), por lo que muchas especificaciones deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles; el ajuste se orienta a acento japones segun el nombre del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un Transformer encoder-decoder con atencion multi-cabeza, entrenado originalmente por OpenAI para transcripcion y traduccion de voz. El ajuste fino se realizo con la libreria Transformers (version 5.23.0.dev0 segun la model card), PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. Los hiperparametros documentados son: learning rate 1e-05, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento.

El dataset utilizado es japanese_english, del que no se documenta composicion, numero de horas ni procedencia en la model card. Tampoco se especifica si hubo etapas de RLHF, DPO o aumentacion de datos. La unica innovacion tecnica reseñable es el propio ajuste fino sobre un subconjunto acotado de habla con acento, que busca reducir el error de transcripcion en ese dominio especifico. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion declarada en habla con acento japones.
- Transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de traduccion de voz a texto, diarizacion de hablantes ni marcas de tiempo a nivel de palabra en la informacion disponible.
- No se documenta tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multimodal mas alla del audio de entrada.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma de la model card.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes japoneses que se expresan en ingles: el ajuste sobre japanese_english busca reducir el WER frente a Whisper tiny original en este perfil de hablante, y el tamano reducido permite ejecucion en portatiles.
- Subtitulado automatico de contenido audiovisual para audiencias internacionales: el modelo puede integrarse en un pipeline de ASR previo a un traductor, aprovechando su bajo coste de inferencia.
- Prototipado rapido de asistentes de voz en entornos con recursos limitados: al ocupar unos 0,3 GB en safetensors y tener 37,7 M de parametros, es viable en CPU y en GPUs de consumo para pruebas de concepto.
- Preprocesado de audio en pipelines de analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones donde el acento japones del ingles es frecuente, con posterior procesamiento de texto.
- Investigacion en adaptacion de dominio ASR: sirve como caso de estudio de fine-tuning de bajo coste sobre un modelo tiny, con hiperparametros y curvas de entrenamiento documentadas parcialmente.
- Educacion y aprendizaje de idiomas: generacion de transcripciones de material audio en ingles con acento japones para ejercicios de comprension, con la advertencia de que el WER de 21,44 % limita la calidad en produccion.
- Despliegue en dispositivos edge o entornos sin GPU dedicada: el reducido numero de parametros permite inferencia en CPU con latencias aceptables para transcripcion no interactiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | japanese English (split test) | WER | 21,4442 |
| Automatic Speech Recognition | japanese English (split test) | Loss (validacion) | 0,4626 |

Evolucion durante el entrenamiento segun la model card:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 1,2438 | 0,1368 | 0,4815 | 22,0395 |
| 2000 | 2,4876 | 0,0898 | 0,4626 | 21,4442 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni cifras en benchmarks estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB solo para pesos (37,76 M de parametros x 4 bytes), mas activaciones y buffers de audio; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- VRAM estimada en FP16/BF16: alrededor de 75 MB para pesos, mas overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes se recomienda NVIDIA T4, RTX 3060 o superiores. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050, RTX 2060, RTX 4090, etc.), asi como en CPU.
- Opciones de despliegue: pipeline de Transformers, Hugging Face Inference Endpoints (tag `endpoints_compatible`), y conversion a ONNX o a otros runtimes compatibles con Whisper tiny. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggnico/whisper-tiny_to_japanese_accent | 37,76 M | 30 s (heredado de Whisper tiny) | 21,44 (japanese English, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de alternativas en la informacion proporcionada. El modelo ajustado comparte arquitectura y tamano con whisper-tiny, por lo que la diferencia principal es la especializacion en el dominio japanese_english.

## Limitaciones y advertencias

- Model card generada automaticamente con secciones sin completar ("More information needed"): no hay documentacion sobre composicion del dataset, procedencia del audio ni condiciones de grabacion.
- El WER de 21,44 % es alto para uso en produccion en transcripcion general; es aceptable solo en dominios muy acotados o como etapa intermedia.
- Resultado de benchmark no verificado (`verified: false`): no ha sido validado de forma independiente.
- Idioma limitado al ingles segun la etiqueta de la model card; el nombre del modelo sugiere especializacion en acento japones, pero no se documenta el alcance real de esa especializacion.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o vocabulario tecnico, comun en modelos Whisper de tamano tiny.
- Sesgos potenciales derivados del dataset de ajuste, no documentados por el autor.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentacion sobre el dataset de entrenamiento impide verificar la procedencia y los derechos del audio utilizado.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto experimental sin soporte comunitario.
- No se documentan versiones cuantizadas (GGUF, ONNX) ni integracion con runtimes de alto rendimiento, lo que limita el despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggnico/whisper-tiny_to_japanese_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): no disponible en la informacion proporcionada
- Repositorio de Transformers: no disponible en la informacion proporcionada
- Dataset japanese_english: no disponible en la informacion proporcionada
