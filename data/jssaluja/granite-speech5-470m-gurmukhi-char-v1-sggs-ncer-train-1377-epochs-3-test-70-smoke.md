# jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-1377-epochs-3-test-70-smoke

## Resumen

El modelo `jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-1377-epochs-3-test-70-smoke` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicado por el usuario jssaluja en Hugging Face. Se trata de un modelo CTC (Connectionist Temporal Classification) orientado a la transcripcion de audio en panyabí (codigo de idioma `pan`), presumiblemente con salida a nivel de caracter en escritura gurmukhi, segun indica el nombre del repositorio.

El modelo conserva la arquitectura y el tamano del modelo base de IBM, con 439.898.344 parametros reales en los pesos safetensors (etiquetado como "470m" por el autor original). El repositorio ocupa 8,8 GB, lo que incluye pesos en formato safetensors y artefactos de entrenamiento. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino con resultados de evaluacion muy pobres (WER de 1,0 y CER de 0,9785 en el conjunto de prueba), lo que sugiere que el entrenamiento no convergio o que los datos de evaluacion no son representativos. El sufijo "smoke" del nombre apunta a una prueba de humo (smoke test) mas que a un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC (granite_speech5_ctc), fine-tuning de ibm-granite/granite-speech-5.0-470m-turboctc |
| Parametros totales | 439.898.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | panyabí (pan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `granite-speech-5.0-470m-turboctc` de IBM, que emplea una arquitectura de reconocimiento del habla con decodificacion CTC. El nombre del repositorio indica una variante "char" (salida a nivel de caracter) y "gurmukhi" (escritura del panyabí), lo que sugiere que la cabeza de salida se adapto a un vocabulario de caracteres en lugar de subpalabras BPE.

Los hiperparametros de entrenamiento documentados son: learning rate de 1e-05, batch size de entrenamiento de 8 con acumulacion de gradientes de 2 (batch efectivo de 16), optimizador AdamW con betas (0,9; 0,999), scheduler lineal, semilla 42 y 3 epocas. El entrenamiento se ejecuto con Transformers 5.16.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el conjunto de datos de entrenamiento ("unknown dataset" en la model card), ni el numero de tokens de audio, ni si hubo aumentacion de datos o tecnicas de regularizacion.

La curva de entrenamiento muestra una perdida de entrenamiento que desciende de 43,31 a 42,10 en tres epocas, con solo 12 pasos de optimizacion en total (4 pasos por epoca). Esto indica un entrenamiento extremadamente corto, coherente con el caracter de "smoke test" del experimento.

## Capacidades

- Reconocimiento automatico del habla (ASR) para panyabí en escritura gurmukhi, con salida a nivel de caracter.
- Transcripcion de audio a texto mediante decodificacion CTC.
- Integracion con la libreria `transformers` y con el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni razonamiento multi-paso.
- Capacidades multilingues limitadas al panyabí segun los metadatos.

## Casos de uso

- Prueba de concepto de ASR en panyabí: el modelo puede usarse para validar un pipeline de transcripcion con `transformers` y el pipeline de ASR, aunque los resultados actuales no son aptos para produccion.
- Investigacion sobre adaptacion de modelos CTC a escrituras no latinas: sirve como referencia de un fine-tuning de la cabeza de salida a caracteres gurmukhi sobre un modelo base multilingue.
- Reproduccion de experimentos: los hiperparametros y la curva de entrenamiento documentados permiten replicar el setup y analizar por que no converge.
- Base para futuros fine-tunings: al ser un checkpoint Apache 2.0, puede servir de punto de partida para experimentos con mas datos o mas epocas.
- Evaluacion de metricas ASR: util para probar el calculo de WER, WIL, MER, CER, NCER y CCER en un conjunto de prueba concreto.
- Docencia y formacion: ejemplo practico de un fine-tuning de ASR con `Trainer` y de como interpretar metricas de error a nivel de caracter y de palabra.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (epoch 3):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 5,8055 |
| WER | 1,0000 |
| WIL | 1,0000 |
| MER | 1,0000 |
| CER | 0,9785 |
| NCER | 1,3356 |
| CCER | 1,0058 |

Evolucion por epoca:

| Epoca | Step | Training loss | Validation loss | WER | CER | NCER | CCER |
|---|---|---|---|---|---|---|---|
| 1 | 4 | 43,3145 | 5,8870 | 1,0000 | 0,9896 | 1,4129 | 1,0163 |
| 2 | 8 | 42,9726 | 5,8570 | 1,0000 | 0,9840 | 1,3459 | 1,0141 |
| 3 | 12 | 42,1033 | 5,8055 | 1,0000 | 0,9785 | 1,3356 | 1,0058 |

Un WER de 1,0 indica que la salida no coincide en ninguna palabra con la referencia; el modelo no es funcional para transcripcion. La metrica NCER superior a 1,0 sugiere normalizacion o penalizacion adicional en el calculo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,8 GB solo para pesos (440 M de parametros x 4 bytes), mas activaciones y buffers de atencion.
- VRAM estimada en fp16/bf16: alrededor de 0,9 GB para pesos; en int8, unos 0,45 GB.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores; tambien en CPU para inferencia por lotes pequenos.
- Despliegue: compatible con `transformers` (pipeline `automatic-speech-recognition`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM, no a CTC de ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---|---|---|---|---|
| jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-1377-epochs-3-test-70-smoke | 439.898.344 | no disponible | pan | Apache 2.0 | Fine-tuning experimental, WER 1,0 |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M (aprox.) | no disponible | multilingue (segun modelo base) | Apache 2.0 | Modelo base de IBM |
| whisper-small (OpenAI) | 244 M | 30 s de audio | multilingue | MIT | Modelo ASR de referencia ampliamente usado |
| wav2vec2-large-xlsr-53 (Meta) | 317 M | no disponible | multilingue | Apache 2.0 | Modelo ASR preentrenado para fine-tuning |

La comparativa se limita a datos publicos de los modelos base; no se dispone de resultados de benchmarks comparables para este fine-tuning mas alla de los reportados por el autor.

## Limitaciones y advertencias

- Rendimiento inutilizable: WER de 1,0 y CER de 0,9785 indican que el modelo no transcribe correctamente; no debe usarse en produccion.
- Entrenamiento insuficiente: solo 12 pasos de optimizacion en 3 epocas, con perdida de entrenamiento muy alta (42-43), lo que sugiere un problema de datos, de learning rate o de configuracion.
- Datos de entrenamiento no documentados: la model card indica "unknown dataset"; no se puede evaluar la cobertura, calidad ni sesgos del corpus.
- Sesgos desconocidos: al no documentarse el dataset, no es posible identificar sesgos dialectales, de genero o de dominio.
- Riesgo de alucinacion: en ASR CTC el riesgo se manifiesta como sustituciones, omisiones e inserciones; con este nivel de error, la salida es esencialmente aleatoria.
- Limitacion de idioma: solo panyabí (`pan`); no se documenta soporte para otros idiomas ni para code-switching.
- Licencia Apache 2.0: permite uso comercial, pero el estado del modelo desaconseja cualquier despliegue.
- Caracter de smoke test: el nombre del repositorio sugiere que es una prueba de humo, no un artefacto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jssaluja/granite-speech5-470m-gurmukhi-char-v1-sggs-ncer-train-1377-epochs-3-test-70-smoke
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Organizacion IBM Granite en Hugging Face: https://huggingface.co/ibm-granite
- Documentacion de Transformers sobre ASR: https://huggingface.co/docs/transformers/tasks/asr
- Paper de referencia sobre CTC (Graves et al., 2006): https://www.cs.toronto.edu/~graves/icml_2006.pdf
