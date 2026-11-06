# merkelmarrow/whisper-tiny-portuguese_english

## Resumen

Whisper tiny Portuguese English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario merkelmarrow y publicado en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) entrenado sobre el dataset naharte/portuguese_english, con el objetivo de transcribir audio en un contexto bilingue portugues-ingles. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper de OpenAI, con 37,76 millones de parametros totales.

El modelo parte de la variante "tiny" de Whisper, la mas ligera de la familia, lo que lo hace especialmente adecuado para entornos con recursos limitados, inferencia en CPU o despliegues en dispositivos de borde. El ajuste fino se realizo con 1000 pasos de entrenamiento, batch size de 32, learning rate de 3,75e-05 y optimizador AdamW con betas (0,9; 0,999), alcanzando un WER de 13,49 en el conjunto de test del dataset de referencia.

Es relevante ahora porque demuestra el patron habitual de la comunidad: reutilizar un modelo base pequeno y abierto (Apache 2.0) para especializarlo en un dominio o par de idiomas concreto con un coste computacional minimo. Sin embargo, al tratarse de un modelo recien publicado, con cero descargas y cero likes, no cuenta con validacion externa ni documentacion detallada por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | ingles (tag declarado); el nombre del modelo sugiere portugues e ingles, pero la model card solo declara "en" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper original: un encoder transformer que procesa espectrogramas mel de audio y un decoder autoregresivo que genera tokens de texto. Whisper tiny es la variante mas pequena de la familia, con 4 capas en encoder y decoder, 6 cabezas de atencion y una dimension de modelo de 384. El modelo base openai/whisper-tiny fue entrenado por OpenAI sobre 680.000 horas de audio supervisado multilingue.

El ajuste fino se realizo sobre el dataset naharte/portuguese_english con los siguientes hiperparametros: learning rate 3,75e-05, train batch size 32, eval batch size 64, semilla 42, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup y 1000 pasos totales de entrenamiento. No se documenta en la model card si hubo RLHF, DPO ni ninguna innovacion tecnica adicional; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento. Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto).
- Especializacion en un contexto bilingue portugues-ingles segun el nombre del modelo y el dataset de entrenamiento, aunque la model card solo declara oficialmente el idioma ingles.
- Compatible con la pipeline `automatic-speech-recognition` de transformers.
- Soporte de endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de traduccion explicita, deteccion de idioma, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No se documenta modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones bilingues portugues-ingles: el modelo puede convertir audio de reuniones donde se alternan ambos idiomas en texto, aprovechando el ajuste fino sobre el dataset portuguese_english. Adecuado por su bajo coste computacional, aunque la calidad en portugues no esta validada oficialmente.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines de postproduccion para generar subtitulos preliminares que luego se revisan manualmente, gracias a su ligereza y a la compatibilidad con la pipeline de transformers.
- Prototipado rapido de asistentes de voz: util para validar flujos de voz a texto en fases tempranas de desarrollo sin invertir en infraestructura GPU, ya que el modelo cabe en CPU y en GPUs de gama baja.
- Investigacion academica sobre ASR de bajo recurso: sirve como punto de partida para experimentos de fine-tuning en pares de idiomas poco representados, dado su tamano reducido y licencia permisiva.
- Despliegue en dispositivos de borde: su tamano de 37,76 millones de parametros y repo de 0,2 GB permiten ejecucion en Raspberry Pi, moviles o navegadores mediante cuantizacion.
- Generacion de transcripciones para indexacion y busqueda: util para convertir archivos de audio de un corpus portugues-ingles en texto indexable, aunque requiere validacion previa de calidad por el WER reportado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados externamente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/portuguese_english | test | 13,4949 |
| Loss (validacion) | naharte/portuguese_english | evaluacion | 0,3207 |

Evolucion del entrenamiento (seleccion de checkpoints):

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 100 | 1,47 | 0,2110 | 0,2759 | 14,1473 |
| 200 | 2,94 | 0,0993 | 0,2859 | 13,1780 |
| 300 | 4,41 | 0,0457 | 0,2974 | 12,5815 |
| 400 | 5,88 | 0,0288 | 0,3041 | 13,0848 |
| 500 | 7,35 | 0,0207 | 0,3109 | 13,3271 |
| 600 | 8,82 | 0,0177 | 0,3217 | 13,0848 |
| 700 | 10,29 | 0,0139 | 0,3202 | 13,4390 |
| 800 | 11,76 | 0,0142 | 0,3234 | 13,4203 |
| 900 | 13,24 | 0,0144 | 0,3200 | 13,2526 |
| 1000 | 14,71 | 0,0114 | 0,3207 | 13,4949 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,76 millones de parametros, aproximadamente 150 MB de pesos); en fp16, unos 75 MB. El cuello de botella real es el buffer de audio y el procesamiento de espectrogramas, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una GPU integrada moderna pueden ejecutarlo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa, Ollama no soporta este modelo, TGI no es la via habitual para Whisper. Alternativas realistas: transformers, faster-whisper (con conversion a CTranslate2) y ONNX Runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, Whisper tiny es la variante mas rapida de la familia, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER reportado |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-portuguese_english | 37,76 M | ventanas de 30 s (Whisper) | en declarado (nombre sugiere pt+en) | Apache 2.0 | 13,49 (dataset propio, no verificado) |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | Apache 2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El modelo ajustado sacrifica la cobertura multilingue amplia del whisper-tiny original a cambio de una supuesta especializacion en portugues-ingles, pero el WER reportado no es directamente comparable con el del modelo base al haberse medido sobre un dataset distinto.

## Limitaciones y advertencias

- Modelo recien publicado con cero descargas y cero likes: no hay validacion externa ni evidencia de uso en produccion.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed" en descripcion, usos previstos y datos de entrenamiento).
- El WER de 13,49 esta marcado como no verificado (`verified: false`) y se mide sobre un dataset propio del autor, lo que limita su comparabilidad.
- La model card declara unicamente el idioma ingles, aunque el nombre del modelo y el dataset sugieren portugues e ingles; la cobertura real del portugues no esta documentada ni validada.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos silenciosos o con ruido.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del whisper-tiny original y del dataset de ajuste, no auditado publicamente.
- El sobreajuste es plausible: el training loss cae hasta 0,0114 mientras el validation loss se estanca en torno a 0,32 desde el paso 300, lo que sugiere que el mejor checkpoint podria ser anterior al final del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No apto para produccion sin una evaluacion previa sobre datos propios del caso de uso concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-portuguese_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/portuguese_english
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
