# jkacan/whisper-tiny_to_canadian_accent

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario jkacan en HuggingFace. El objetivo declarado es adaptar el reconocimiento automatico del habla (ASR) de Whisper al acento del ingles canadiense, partiendo de un conjunto de datos denominado Canadian_english. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper y el mismo tokenizador multilingue del modelo base, por lo que su funcionamiento es identico al de whisper-tiny salvo por los pesos ajustados.

Se trata de un modelo de proposito muy especifico y de reducidas dimensiones: 37,7 millones de parametros y un repositorio de 0,3 GB, lo que lo situa en la gama mas ligera de la familia Whisper. Su relevancia es limitada y experimental: las descargas (19) y los "likes" (0) indican un uso muy reducido, y la propia model card reconoce que faltan secciones de descripcion, usos previstos y datos de entrenamiento. El resultado declarado de WER del 21,14 % sobre el split de test de Canadian English es elevado en terminos absolutos y no consta verificado.

La ficha se basa exclusivamente en la informacion publicada en HuggingFace y en la model card; cualquier dato no presente en esas fuentes se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, base openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 s; el dato no se explicita en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles; el ajuste se orienta al acento canadiense) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR. No se introduce ninguna modificacion arquitectonica: se reutilizan los pesos del modelo base y se ajustan sobre el dataset Canadian_english. La model card no detalla la composicion del dataset, el numero de horas de audio, ni si se aplicaron tecnicas de aumento de datos o normalizacion especificas para el acento.

Los hiperparametros de entrenamiento si estan documentados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales (2 epocas). El entrenamiento se realizo con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La perdida de validacion paso de 0,4242 en la epoca 1 a 0,4249 en la epoca 2, mientras que el WER bajo de 21,4792 a 21,1382, lo que sugiere un ajuste marginal y riesgo de sobreajuste con tan pocos pasos. No se documenta el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles.
- Adaptacion orientada al acento del ingles canadiense, segun el dataset de entrenamiento declarado.
- Funcionamiento como modelo de la familia Whisper: soporta tareas de transcripcion y, potencialmente, traduccion al ingles heredadas del modelo base (no verificado en esta variante).
- Integracion con la libreria transformers mediante el pipeline automatic-speech-recognition.
- Compatibilidad con endpoints de HuggingFace (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo de razonamiento extendido.
- Capacidad multilingue: limitada al ingles segun el campo language de la model card.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles canadiense: el modelo puede convertir audio corto en texto en entornos con recursos limitados, aunque su tamano tiny limita la precision frente a variantes mayores de Whisper.
- Prototipado rapido de pipelines ASR: al ocupar 0,3 GB y 37,7 M de parametros, permite validar arquitecturas de transcripcion en portatiles o entornos sin GPU dedicada antes de migrar a modelos mayores.
- Subtitulado automatico de contenido audiovisual en ingles: util como primera pasada en herramientas de generacion de subtitulos, con revision humana posterior dado el WER declarado del 21 %.
- Investigacion sobre adaptacion de acentos: sirve como caso de estudio de fine-tuning de bajo coste sobre un acento concreto, comparando el comportamiento antes y despues del ajuste.
- Preprocesamiento de audio en aplicaciones de analitica: transcripcion de llamadas o grabaciones para extraer texto indexable en buscadores internos, aceptando la perdida de precision del modelo tiny.
- Despliegue en dispositivos con memoria muy limitada: por su tamano, es viable en CPU o en GPUs de gama baja para tareas de transcripcion no criticas.
- Evaluacion comparativa de modelos ASR: util como linea base ligera en pruebas de calidad frente a whisper-base, whisper-small u otros ajustes de acento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Metrica | Valor |
|---|---|---|
| Canadian English (split test) | WER | 21,1382 % |

Evolucion durante el entrenamiento:

| Epoca | Paso | Perdida de validacion | WER |
|---|---|---|---|
| 1 | 1000 | 0,4242 | 21,4792 % |
| 2 | 2000 | 0,4249 | 21,1382 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 M de parametros); en la practica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria (GTX 1050, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en muchas integradas.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), endpoints de HuggingFace; no se documentan conversiones a GGUF, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkacan/whisper-tiny_to_canadian_accent | 37,7 M | ventanas de 30 s (Whisper) | 21,14 % (Canadian English, no verificado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | 74,4 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | ventanas de 30 s (Whisper) | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- WER del 21,14 % declarado y no verificado: es un valor alto para produccion y refleja la limitacion del tamano tiny.
- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento indican "More information needed".
- Riesgo de sobreajuste: la perdida de validacion aumento entre epocas mientras el WER apenas mejoro (de 21,48 % a 21,14 %).
- Sesgos desconocidos: no se documenta la composicion del dataset Canadian_english, por lo que no puede evaluarse el sesgo demografico, de genero o de origen de los hablantes.
- Riesgo de alucinacion en transcripcion: como todos los modelos Whisper, puede generar texto no presente en el audio, especialmente con ruido o acentos no representados.
- Cobertura idiomatica limitada al ingles; no se garantiza comportamiento correcto en otras lenguas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base y del dataset.
- Uso muy reducido (19 descargas, 0 likes): no hay evidencia de comunidad ni de validacion independiente.
- Ausencia de variantes cuantizadas documentadas: el despliegue en entornos fuera de transformers requiere conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkacan/whisper-tiny_to_canadian_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper: no disponible en la informacion proporcionada
- Repositorio de Transformers: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
