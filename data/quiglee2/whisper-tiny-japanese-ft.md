# Quiglee2/whisper-tiny-japanese-ft

## Resumen

Whisper tiny Japanese accent es un ajuste fino (fine-tuning) de `openai/whisper-tiny` realizado por el usuario Quiglee2 sobre el dataset `naharte/japanese_english`. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, disenada originalmente por OpenAI para reconocimiento automatico del habla (ASR) multilingue, y en este caso se ha reentrenado para mejorar la transcripcion de ingles hablado con acento japones. El resultado es un checkpoint de 37,7 millones de parametros que ocupa apenas 0,3 GB en el repositorio.

La relevancia de este modelo es acotada pero concreta: los sistemas ASR genericos suelen degradarse cuando el hablante tiene un acento no nativo marcado, y un ajuste sobre `whisper-tiny` permite desplegar un corrector especializado en entornos con recursos muy limitados (CPU, dispositivos embebidos, prototipos). El modelo declara un WER de 21,3972 sobre el split de test del dataset de referencia, aunque se trata de una metrica no verificada por el hub.

Conviene subrayar que se trata de un modelo experimental: la model card esta generada automaticamente por el Trainer, no incluye descripcion de uso previsto ni limitaciones, y el autor no ha publicado informacion adicional sobre la composicion del dataset o el proceso de seleccion de datos. Por tanto, debe evaluarse como un punto de partida reproducible mas que como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles; segun metadatos del hub) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder de audio que transforma espectrogramas log-Mel en representaciones latentes y un decoder autorregresivo que genera tokens de transcripcion. Whisper emplea atencion multi-cabeza estandar con posicional encoding sinusoidal en el encoder y aprendido en el decoder, y se entrena con prediccion de tokens condicionada a la tarea (transcripcion o traduccion) y al idioma.

El ajuste fino se realizo sobre el dataset `naharte/japanese_english` con los siguientes hiperparametros declarados: learning rate de 1e-05, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup, batch de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y 2000 pasos totales (aproximadamente 2,49 epocas). El entrenamiento se ejecuto con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el numero de tokens de audio procesados, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un ajuste ASR supervisado). Tampoco se especifica ninguna innovacion tecnica adicional mas alla del ajuste supervisado estandar.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en hablantes con acento japones.
- Transcripcion de audio de hasta 30 segundos por ventana, con capacidad de procesar audio mas largo mediante chunking.
- Generacion de transcripciones con puntuacion y mayusculas segun el formato aprendido de Whisper.
- Soporte de la pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad multilingue limitada: los metadatos solo declaran `en`, aunque el modelo base Whisper tiny es multilingue y podria conservar parte de esa capacidad residual.

## Casos de uso

- Transcripcion de reuniones con hablantes japoneses de ingles: el ajuste reduce errores en fonemas y patrones prosodicos tipicos del acento japones, adecuado para actas automaticas en equipos internacionales.
- Subtitulado de contenido audiovisual: integrable en pipelines de generacion de subtitulos para videos donde los ponentes hablan ingles con acento japones, con la ventaja de un modelo de 0,3 GB que puede ejecutarse en CPU.
- Prototipado rapido de asistentes de voz: al ser un modelo tiny, permite iterar en local sin GPU dedicada, util para validar ideas antes de escalar a variantes mayores de Whisper.
- Investigacion en adaptacion de dominio ASR: sirve como linea base reproducible para estudiar tecnicas de fine-tuning con acentos no nativos y comparar con otras variantes de Whisper.
- Preprocesado de datos de voz en entornos academicos: transcripcion de corpus de habla con acento japones para anotacion semiautomatica, con revision humana posterior dada la tasa de error.
- Despliegue en dispositivos con recursos limitados: el tamano reducido permite ejecucion en Raspberry Pi o moviles mediante cuantizacion, para aplicaciones de dictado o comandos de voz acotados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados por el hub):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/japanese_english | test | WER | 21,3972 |
| naharte/japanese_english | validacion (paso 1000) | WER | 22,0865 |
| naharte/japanese_english | validacion (paso 2000) | WER | 21,3972 |

| Metrica de entrenamiento | Valor |
|---|---|
| Training loss (paso 1000) | 0,1368 |
| Training loss (paso 2000) | 0,0896 |
| Validation loss (paso 1000) | 0,4810 |
| Validation loss (paso 2000) | 0,4626 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El WER de 21,4 % es elevado en terminos absolutos y debe interpretarse con cautela: el dataset de evaluacion es pequeno y especifico, y la metrica no esta verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB de pesos mas overhead de activaciones; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 75 MB de pesos; en int8: aproximadamente 38 MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una RTX 3060 o superior no aporta ventaja significativa frente a CPU para audio corto. En servidores, A100 o H100 solo tendrian sentido para procesamiento masivo por lotes.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 2060, RTX 4090) y en iGPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face, y conversion a otros runtimes via herramientas de exportacion (no se documenta compatibilidad explicita con vLLM, llama.cpp u Ollama, que estan orientados a modelos de texto).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Quiglee2/whisper-tiny-japanese-ft | 37,7 M | ventanas de 30 s | en | apache-2.0 | 21,40 (dataset propio, no verificado) |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta ficha |

La comparacion directa con `whisper-tiny` original es la mas relevante: este ajuste solo es preferible si el dominio objetivo es ingles con acento japones, ya que el modelo base conserva la capacidad multilingue que el ajuste puede haber degradado. Para otros dominios o idiomas, las variantes originales de OpenAI son la opcion por defecto.

## Limitaciones y advertencias

- Model card generada automaticamente: no incluye descripcion de uso previsto, limitaciones ni analisis de sesgos; el autor no ha completado esa informacion.
- WER de 21,4 % en el dataset de evaluacion: tasa de error alta para produccion; requiere revision humana o un modelo de mayor tamano para casos criticos.
- Metrica no verificada por el hub: el resultado del model-index no ha sido validado de forma independiente.
- Dataset de evaluacion pequeno y especifico: el rendimiento puede no generalizar a otros corpus de habla con acento japones.
- Sesgos desconocidos: no se documenta analisis de sesgos por genero, edad, dialecto o calidad de audio.
- Riesgo de alucinacion en ASR: Whisper tiende a generar texto plausible en segmentos de silencio o ruido; el ajuste no corrige este comportamiento.
- Idiomas: los metadatos solo declaran ingles; el uso en otros idiomas no esta garantizado y podria producir salidas degradadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Whisper de OpenAI tiene sus propios terminos que conviene revisar.
- Entrenamiento con solo 2000 pasos y batch de 2: posible sobreajuste al dataset de ajuste; no hay datos de validacion cruzada.
- Sin soporte documentado de cuantizacion especifica ni de runtimes alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quiglee2/whisper-tiny-japanese-ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/japanese_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
