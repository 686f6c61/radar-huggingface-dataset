# Nuttyman/whisper-tiny_to_korean_accent_oct29

## Resumen

Whisper tiny Korean (Nuttyman/whisper-tiny_to_korean_accent_oct29) es un ajuste fino (fine-tuning) del modelo Whisper tiny de OpenAI, especializado en el reconocimiento automatico de voz (ASR) de habla inglesa con acento coreano. El modelo base, openai/whisper-tiny, es un transformer encoder-decoder de 39 millones de parametros entrenado por OpenAI para transcripcion y traduccion multilingue; esta version lo adapta a un dataset denominado "Korean English", presumiblemente compuesto por audio de hablantes coreanos en ingles.

El problema que resuelve es la degradacion del rendimiento de los modelos ASR genericos ante acentos no nativos: los hablantes coreanos que se expresan en ingles suelen generar tasas de error de palabra (WER) superiores a la media en modelos de proposito general. Un fine-tuning sobre datos con ese perfil de acento puede reducir significativamente ese error, como sugiere el WER declarado de 9,78 % sobre el conjunto de evaluacion del propio dataset.

Su relevancia es principalmente practica y de nicho: al tratarse de un modelo tiny (37,7 millones de parametros, aproximadamente 0,3 GB en safetensors), puede ejecutarse en tiempo real en CPU o en GPUs de consumo, lo que lo hace candidato para transcripcion ligera de reuniones, subtitulado o asistentes de voz orientados a usuarios coreanos que hablan ingles. La model card es autogenerada por el Trainer de Hugging Face y carece de documentacion detallada, por lo que la informacion disponible es limitada y conviene evaluar el modelo con datos propios antes de uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (Whisper tiny procesa audio en ventanas de 30 segundos por diseño base, pero no consta en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), con especializacion en acento coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper tiny: un transformer encoder-decoder donde el encoder procesa representaciones log-Mel del audio y el decoder genera la transcripcion de forma autorregresiva. Con 37,7 millones de parametros, es la variante mas pequena de la familia Whisper, diseñada para inferencia ligera.

El ajuste fino se realizo sobre el dataset "Korean English" (no disponible la composicion detallada del dataset ni el numero de horas de audio). Los hiperparametros publicados indican un entrenamiento corto y de bajo coste: learning rate de 1e-05 con planificador lineal y 500 pasos de calentamiento, tamaño de lote de 2 para entrenamiento y 1 para evaluacion, semilla 42, optimizador AdamW (variante fused de PyTorch) y 2.000 pasos de entrenamiento en total, equivalentes a poco mas de 2 epocas. No consta el uso de tecnicas como RLHF o DPO (habitual en modelos de lenguaje, no aplicable directamente a ASR). No se menciona ninguna innovacion tecnica destacable: se trata de un fine-tuning estandar con el Trainer de Hugging Face.

## Capacidades

- Transcripcion automatica de voz en ingles, con especializacion en el acento de hablantes coreanos.
- Generacion de texto a partir de audio mediante el pipeline `automatic-speech-recognition` de la libreria `transformers`.
- No hay evidencia de capacidades adicionales (traduccion, diarizacion, marcaje de timestamps, tool calling ni razonamiento); al ser un fine-tuning de Whisper tiny, la traduccion a otros idiomas podria existir por herencia del modelo base, pero no esta documentada ni evaluada.

## Casos de uso

- Transcripcion de reuniones con equipos coreano-internacionales: en empresas con hablantes coreanos que se expresan en ingles, el modelo puede generar actas automaticas con menor tasa de error que el Whisper base, gracias al fine-tuning sobre acento coreano.
- Subtitulado de contenido en ingles grabado por hablantes coreanos: podcasts, videos de YouTube o clases online donde el acento coreano degrada el rendimiento de modelos genericos; su tamaño tiny permite procesamiento por lotes en CPU sin coste de GPU.
- Asistentes de voz y comandos por voz: su baja latencia y pequeno footprint lo hacen adecuado para aplicaciones embebidas o de escritorio que solo necesitan reconocer ingles hablado por usuarios coreanos.
- Preprocesamiento para pipelines de NLP: la transcripcion puede alimentar sistemas posteriores de resumen, analisis de sentimiento o extraccion de entidades sobre conversaciones de call centers con interlocutores coreanos.
- Evaluacion y practica de pronunciacion: en herramientas de aprendizaje de ingles para hablantes coreanos, la transcripcion puede compararse con el texto esperado para detectar errores de diccion.
- Prototipado rapido de ASR: como modelo base ligero y con licencia Apache 2.0, sirve de punto de partida para nuevos fine-tunings sobre otros acentos o dominios, reutilizando la configuracion de entrenamiento publicada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el conjunto de test del dataset "Korean English":

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,2030 |
| WER | 9,78 % |

Evolucion durante el entrenamiento:

| Training Loss | Epoca | Paso | Validation Loss | WER |
|:---:|:---:|:---:|:---:|:---:|
| 0,1756 | 1,0173 | 1000 | 0,2166 | 9,9512 |
| 0,0740 | 2,0346 | 2000 | 0,2030 | 9,7805 |

No se han publicado comparaciones con otros modelos (por ejemplo, el Whisper tiny base sin ajustar) en la informacion disponible, por lo que la mejora real respecto al modelo base no puede cuantificarse.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 37,7 millones de parametros (aproximadamente 0,3 GB en fp32), cabe comodamente en cualquier GPU moderna; en fp16 el footprint es de unos 0,08 GB. No requiere GPU: es plenamente ejecutable en CPU.
- GPU recomendadas: cualquier GPU de consumo basta (GTX 1650, RTX 3060, RTX 4090 o superiores); no se justifica hardware de datacenter como A100 o H100 para inferencia.
- Consumer GPU: si, cabe sobradamente en practicamente cualquier GPU consumer e incluso puede ejecutarse en tiempo real solo con CPU.
- Opciones de despliegue: libreria `transformers` de Hugging Face (pipeline `automatic-speech-recognition`); por herencia de la familia Whisper, es probable la compatibilidad con whisper.cpp y derivados tras conversion, aunque no consta en la informacion proporcionada. No hay evidencia de soporte directo en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible; dado el tamaño tiny, se espera latencia baja y capacidad de transcripcion en tiempo real o superior en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma/especializacion | Licencia | Contexto de audio | Disponibilidad |
|---|---|---|---|---|---|
| Nuttyman/whisper-tiny_to_korean_accent_oct29 | 37,7 M | Ingles con acento coreano (fine-tuning) | Apache 2.0 | no disponible | Hugging Face, safetensors |
| openai/whisper-tiny (base) | 39 M (aprox. 37,7 M en safetensors) | Multilingue (99 idiomas) | MIT | 30 s por ventana | Hugging Face, amplia compatibilidad |
| openai/whisper-base | 74 M | Multilingue (99 idiomas) | MIT | 30 s por ventana | Hugging Face, amplia compatibilidad |
| openai/whisper-small | 244 M | Multilingue (99 idiomas) | MIT | 30 s por ventana | Hugging Face, amplia compatibilidad |

La ventaja diferencial de este modelo frente al Whisper tiny base seria un menor WER sobre habla inglesa con acento coreano, aunque no existe una comparacion directa publicada. Frente a variantes mayores de Whisper, ofrece mucha menor latencia y footprint a costa de precision general y cobertura multilingue.

## Limitaciones y advertencias

- Model card autogenerada: el propio autor indica que falta documentacion ("More information needed") sobre descripcion, usos previstos, limitaciones y datos de entrenamiento; la trazabilidad del dataset "Korean English" es nula (no consta fuente, tamano ni composicion).
- Riesgo de sobreajuste: el dataset de evaluacion parece ser el mismo dominio que el de entrenamiento; el WER de 9,78 % puede no generalizar a otros acentos, dominios o condiciones acusticas (ruido, microfonos distintos).
- Resultados no verificados: las metricas proceden del model-index del autor y no han pasado verificacion de Hugging Face; no existen comparaciones con el modelo base que demuestren la mejora.
- Cobertura de idioma: el modelo esta etiquetado solo para ingles; su rendimiento en coreano u otros idiomas no esta evaluado y probablemente se haya degradado respecto al Whisper base multilingue tras el fine-tuning.
- Sesgos: no disponible; cualquier sesgo presente en el dataset de entrenamiento (no documentado) se hereda sin auditoria.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un fine-tuning de Whisper conviene revisar las condiciones de uso del modelo base de OpenAI y del dataset original.
- Para produccion: dado el tamaño tiny del modelo, la precision en audio dificil (ruido, multiples hablantes, terminologia tecnica) sera limitada; se recomienda evaluacion con datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nuttyman/whisper-tiny_to_korean_accent_oct29
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper original de Whisper (referencia de la arquitectura base): https://arxiv.org/abs/2212.04356
- Repositorio original de Whisper de OpenAI: https://github.com/openai/whisper
