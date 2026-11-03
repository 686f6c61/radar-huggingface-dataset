# Quiglee2/whisper-tiny-canadian-ft

## Resumen

Whisper-tiny-canadian-ft es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Quiglee2 en HuggingFace. El objetivo declarado es adaptar el modelo base al acento del ingles canadiense, utilizando el dataset naharte/canadian_english. Se trata de un modelo de la familia Whisper, una arquitectura encoder-decoder basada en transformer entrenada originalmente por OpenAI para transcripcion multilingue y traduccion de voz.

El modelo conserva la arquitectura y el tamano del whisper-tiny original: 37.760.640 parametros totales en formato safetensors, lo que lo situa en la gama mas ligera de la familia Whisper. Esto lo hace adecuado para entornos con recursos limitados, prototipado rapido y despliegue en CPU o GPUs de consumo, a costa de una precision inferior a la de los modelos Whisper de mayor tamano.

La relevancia de este modelo es acotada: se trata de un ajuste fino de nicho, con cero descargas y cero likes en el momento de la consulta, una model card generada automaticamente por el Trainer y sin documentacion adicional sobre usos previstos, limitaciones o procedimiento de entrenamiento. Los resultados declarados por el autor muestran un WER de 20,876 % en el split de test del dataset canadiense, un valor que debe interpretarse con cautela dado que no esta verificado y no se compara con el rendimiento del modelo base en el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de openai/whisper-tiny, que emplea una arquitectura encoder-decoder transformer con atencion estandar. Whisper procesa audio en segmentos de 30 segundos, convertidos a espectrogramas log-Mel, y genera transcripciones de forma autoregresiva. El modelo base whisper-tiny cuenta con 37,7 millones de parametros, lo que lo convierte en la variante mas pequena de la familia.

El entrenamiento se realizo con el Trainer de HuggingFace sobre el dataset naharte/canadian_english. Los hiperparametros declarados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento (2 epocas). No se especifica el numero de tokens de audio ni la composicion detallada del dataset. No hay indicios de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un fine-tuning supervisado convencional sobre datos etiquetados de ASR. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con adaptacion declarada al acento canadiense.
- Transcripcion de audio a texto en formato de pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: solo se declara ingles (`en`).
- No se documentan capacidades de vision, audio mas alla de ASR, ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de notas de voz y reuniones en ingles canadiense: el modelo puede integrarse en un pipeline de ASR para convertir audio de hablantes canadienses en texto, aprovechando el ajuste fino sobre ese acento concreto.
- Prototipado rapido de aplicaciones de voz: al tener solo 37,7 millones de parametros, permite validar flujos de transcripcion en local antes de migrar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: su tamano reducido permite ejecucion en CPU o en GPUs de gama baja, util para demos o entornos embebidos.
- Generacion de subtitulos para contenido audiovisual en ingles canadiense: puede emplearse en pipelines automatizados de subtitulado con revision humana posterior.
- Preprocesamiento de datos de audio para otros sistemas: transcripcion previa de grabaciones para alimentar motores de busqueda, analitica o clasificacion de texto.
- Investigacion sobre adaptacion de acentos en ASR: sirve como caso de estudio de fine-tuning de whisper-tiny sobre un acento especifico y como linea base para comparaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/canadian_english | test | WER | 20,876 % |
| naharte/canadian_english | validacion (epoca 1) | WER | 21,322 % |
| naharte/canadian_english | validacion (epoca 2) | WER | 20,876 % |
| naharte/canadian_english | validacion (epoca 2) | Loss | 0,4251 |

No se han publicado resultados comparativos con el modelo base ni con otros modelos Whisper en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 millones de parametros); en la practica, el cuello de botella es el procesamiento del espectrograma y el estado del decoder, no el tamano de los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs integradas pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de HuggingFace; compatible potencialmente con llama.cpp/Ollama solo si se convierte a GGUF, lo cual no esta documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quiglee2/whisper-tiny-canadian-ft | 37,7 M | ventanas de 30 s (Whisper) | en | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s (Whisper) | multilingue | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | ventanas de 30 s (Whisper) | multilingue | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | ventanas de 30 s (Whisper) | multilingue | apache-2.0 | HuggingFace |

No se dispone de datos de WER comparativos entre estos modelos en el dataset canadiense dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Model card generada automaticamente: las secciones de descripcion, usos previstos y datos de entrenamiento estan sin completar ("More information needed").
- WER de 20,876 % declarado por el autor y no verificado; no se compara con el modelo base, por lo que no puede confirmarse que el fine-tuning mejore al original.
- Solo soporta ingles; no se declara capacidad multilingue.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion independiente.
- Al ser whisper-tiny, la precision es limitada en comparacion con variantes mayores de Whisper; el ajuste fino no compensa la capacidad reducida del modelo base.
- Riesgo de alucinacion en audio con ruido, silencios o acentos distintos al canadiense, comportamiento comun en modelos Whisper pequenos.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de entrenamiento (posibles sesgos o condiciones de uso del dataset naharte/canadian_english no verificadas).
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quiglee2/whisper-tiny-canadian-ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/canadian_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
