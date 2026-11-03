# huggnico/whisper-tiny_to_spanish_accent

## Resumen

Whisper tiny spanish es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny`, publicado por el usuario huggnico en HuggingFace. El objetivo declarado es adaptar el modelo base, originalmente entrenado por OpenAI sobre un corpus masivo y multilingue, a un dominio concreto identificado como "spanish English", es decir, habla en la que se mezclan el ingles y el espanol, presumiblemente con acentos de hablantes hispanohablantes. El resultado es un checkpoint de apenas 37,7 millones de parametros y 0,3 GB de repositorio, lo que lo convierte en una opcion extremadamente ligera para tareas de transcripcion en entornos con recursos limitados.

La relevancia de este modelo es doble. Por un lado, demuestra el flujo tipico de adaptacion de Whisper mediante `Trainer` de HuggingFace, con hiperparametros conservadores (learning rate de 1e-5, 2000 pasos, batch size de 2). Por otro, su tamano reducido permite ejecutarlo en CPU o en GPUs de gama baja, algo critico para aplicaciones de transcripcion en tiempo real o en dispositivos perifericos. Sin embargo, conviene subir las expectativas con cautela: se trata de un experimento de ajuste fino con un WER de 12,34 sobre un conjunto de evaluacion no verificado, y la model card no documenta la composicion del dataset ni las condiciones de entrenamiento mas alla de los hiperparametros.

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base, y esta pensado para usarse con la libreria `transformers`. No obstante, la informacion disponible es escasa: la model card contiene secciones sin completar ("More information needed") y el unico dato de rendimiento es el WER declarado por el autor, marcado como no verificado en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino de `openai/whisper-tiny` |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | en (segun metadatos); el dataset de ajuste se denomina "spanish English" |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper, un transformer encoder-decoder disenado para reconocimiento automatico del habla que procesa espectrogramas Mel de audio y genera tokens de texto de forma autoregresiva. La variante `tiny` es la mas pequena de la familia Whisper, con 37,7 millones de parametros, lo que la hace adecuada para inferencia en entornos con poca memoria, a costa de una precision inferior a las variantes `base`, `small`, `medium` y `large`.

El ajuste fino se realizo sobre un dataset denominado "spanish English", cuya composicion, tamano y procedencia no se detallan en la model card. Los hiperparametros documentados son: learning rate de 1e-5, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. El autor reporta dos puntos de evaluacion: en el paso 1000, una perdida de validacion de 0,2653 y un WER de 13,9055; en el paso 2000, una perdida de validacion de 0,2460 y un WER de 12,3383. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en ingles, con ajuste orientado a habla con acento hispanohablante o mezcla espanol-ingles.
- Generacion de transcripciones con puntuacion basica y estructura de frases, heredada del modelo base Whisper.
- Manejo de audio de hasta 30 segundos por ventana, con posibilidad de segmentacion para audios mas largos mediante pipelines de `transformers`.
- Capacidad multilingue limitada: los metadatos declaran solo `en`, aunque el ajuste se realizo sobre un dataset bilingue espanol-ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de "thinking".
- No se documenta soporte de vision ni audio mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones bilingues espanol-ingles: el modelo puede procesar segmentos de audio de hasta 30 segundos y generar transcripciones en ingles, util para actas automaticas en equipos con hablantes de ambos idiomas. Su tamano reducido permite ejecutarlo en servidores modestos.
- Subtitulado automatico de videos cortos: con 37,7 millones de parametros, puede integrarse en pipelines de generacion de subtitulos para plataformas de contenido, procesando clips de menos de 30 segundos con latencia baja en CPU.
- Prototipado rapido de asistentes de voz: al ser un checkpoint ligero, sirve para validar flujos de ASR en fases tempranas de desarrollo antes de escalar a modelos mayores como `whisper-small` o `whisper-medium`.
- Transcripcion en dispositivos perifericos o embebidos: su reducido footprint (0,3 GB en safetensors, menos con cuantizacion) permite desplegarlo en Raspberry Pi o GPUs de gama baja para tareas de dictado o comandos de voz.
- Investigacion sobre adaptacion de dominio en ASR: el modelo sirve como caso de estudio de fine-tuning de Whisper con pocos recursos, util para investigadores que quieran replicar el flujo con otros acentos o idiomas.
- Preprocesamiento de audio para pipelines de NLP: las transcripciones generadas pueden alimentar sistemas de analisis de sentimiento, resumen o busqueda semantica en entornos donde el audio es la fuente principal de datos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en el model-index, marcados como no verificados.

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | spanish English | test | 12,3383 |
| Loss (validacion) | spanish English | evaluacion | 0,2460 |

Evolucion durante el entrenamiento (segun la model card):

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9728 | 0,2615 | 0,2653 | 13,9055 |
| 2000 | 1,9455 | 0,1395 | 0,2460 | 12,3383 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 millones de parametros, aproximadamente 150 MB de pesos); en FP16, alrededor de 75 MB. La memoria adicional depende de la longitud del audio y del batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovecha GPUs de gama alta por su tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con pipeline de `automatic-speech-recognition`, `optimum` para exportacion a ONNX, `whisper.cpp` para inferencia en CPU (previa conversion), y servidores de inferencia como TGI o vLLM (soporte de Whisper limitado en vLLM).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggnico/whisper-tiny_to_spanish_accent | 37,7 M | 30 s por ventana | 12,34 (spanish English, no verificado) | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-base | 74 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | HuggingFace |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. El modelo ajustado parte de `whisper-tiny` y comparte su arquitectura y licencia; las variantes mayores ofrecen mayor precision a costa de mas parametros y VRAM.

## Limitaciones y advertencias

- El WER de 12,34 esta declarado por el autor y marcado como no verificado; no hay validacion independiente.
- La model card no documenta la composicion del dataset "spanish English", por lo que se desconoce el dominio, la duracion y la calidad de las grabaciones de entrenamiento.
- Los metadatos declaran solo el idioma `en`, aunque el ajuste se realizo sobre un dataset bilingue; el comportamiento real en espanol puro no esta documentado.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- Limitacion de contexto: Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o mediante pipeline, lo que puede introducir errores en las fronteras.
- Sesgos: no documentados. Al derivar de Whisper, puede heredar sesgos del corpus de entrenamiento original de OpenAI.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de ajuste.
- Caveat para produccion: al ser un ajuste fino con 2000 pasos y batch size de 2, el modelo puede estar infraentrenado o sobreajustado al dominio concreto; se recomienda evaluar con datos propios antes de desplegarlo.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento, por lo que no debe usarse para tareas mas alla de ASR.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggnico/whisper-tiny_to_spanish_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de `transformers` para ASR: https://huggingface.co/docs/transformers/tasks/asr
