# instilux/luni-mini

## Resumen

LUNI-mini es un modelo de lenguaje enmascarado (masked language model, MLM) basado en la arquitectura ModernBERT, desarrollado por el usuario instilux y publicado en Hugging Face. Está especializado en luxemburgués (`lb`/`ltz`), una lengua germánica occidental de bajos recursos, y sigue la receta de entrenamiento Ettin del JHU CLSP, concretamente la variante de 68 millones de parámetros. El modelo resuelve la tarea de fill-mask (predicción de tokens enmascarados) y está pensado como encoder base para ajuste fino en tareas downstream de comprensión del lenguaje.

Con 68.457.664 parámetros reales según los pesos en safetensors y un repositorio de tan solo 0,3 GB, es un modelo compacto orientado a entornos con recursos limitados. Emplea un vocabulario BPE de 50.368 tokens mediante `GPTNeoXTokenizerFast` y una longitud de contexto de 1.024 tokens. Su relevancia actual reside en cubrir una laguna evidente: la práctica ausencia de encoders ModernBERT especializados en luxemburgués, lo que lo convierte en una pieza útil para pipelines de NLP de baja latencia en esa lengua.

La licencia CC BY-SA 4.0 permite uso comercial con obligación de compartir bajo la misma licencia las obras derivadas, lo que condiciona su adopción en productos propietarios. El modelo se distribuye en formato safetensors y requiere `transformers>=4.48.0`. No se ha publicado todavía el paper asociado, y la model card advierte de particularidades del tokenizador y del preentrenamiento que afectan al ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 68.457.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | luxemburgues (`lb`/`ltz`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |
| Vocabulario | 50.368 tokens (BPE, GPTNeoXTokenizerFast) |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers (>=4.48.0) |
| Pipeline | fill-mask |

## Arquitectura y entrenamiento

LUNI-mini es un encoder ModernBERT de tamano "mini", con 68,4 millones de parametros. ModernBERT incorpora innovaciones sobre el transformer encoder clasico, como rotary position embeddings (RoPE), atencion alternada local/global y capas sin sesgo, orientadas a mayor eficiencia en secuencias largas; no obstante, la model card no detalla la configuracion exacta de capas, dimensiones ocultas ni cabezas de atencion. El modelo sigue la receta Ettin del JHU CLSP, en concreto la variante `ettin-encoder-68m`, que establece un protocolo de preentrenamiento para encoders compactos de alto rendimiento.

El preentrenamiento se realizo sobre luxemburgues y luxemburgues aumentado (augmented Luxembourgish), aunque la model card no especifica el numero de tokens, la composicion exacta del corpus ni si se aplicaron tecnicas de RLHF o DPO (no procede en un MLM). Un detalle tecnico relevante es que el preentrenamiento uso exclusivamente textos individuales, sin sequence packing, y configuro el indice de padding de los embeddings a 0 (`[CLS]`) en lugar de 2 (`[PAD]`), lo que provoco que el embedding de `[CLS]` no recibiera gradiente como token de entrada. La configuracion publicada corrige esto con `pad_token_id=2`, de modo que el embedding de `[CLS]` se entrena normalmente durante el ajuste fino.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): predice tokens enmascarados en textos en luxemburgues.
- Representaciones contextuales de tokens y de secuencia, utilizables como encoder base para ajuste fino.
- Clasificacion de secuencias: el pooling por defecto es `mean` (`classifier_pooling: "mean"`), y todos los resultados de ajuste fino reportados por el autor usan este valor.
- Procesamiento de pares de frases en formato `[CLS] A [CLS] B`, sin `[SEP]`, aunque este formato solo se aprende durante el ajuste fino.
- Soporte multilingue: limitado al luxemburgues; el tag `multilingual` de la model card no se traduce en capacidades verificadas en otras lenguas.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito; es un encoder MLM, no un modelo generativo instruido.
- No dispone de token de fin de secuencia (EOS) en el tokenizador.

## Casos de uso

- Etiquetado de partes de la oracion (POS tagging) y analisis morfologico en luxemburgues: el encoder se ajusta con una cabeza de clasificacion token a token, aprovechando las representaciones contextuales de ModernBERT y su vocabulario BPE adaptado a la lengua.
- Reconocimiento de entidades nombradas (NER) en textos luxemburgueses: ajuste fino con pooling `mean` o clasificacion por token para extraer personas, lugares y organizaciones en corpus periodicos o administrativos.
- Clasificacion de documentos y filtrado de contenido: ajuste fino para categorizar noticias, correos o formularios en luxemburgues, con inferencia de baja latencia gracias a los 68 millones de parametros.
- Correccion ortografica y autocompletado asistido: uso directo como fill-mask para sugerir la palabra mas probable en una posicion enmascarada, integrable en editores de texto o herramientas de escritura.
- Busqueda semantica y similitud de frases: extraccion de embeddings con pooling `mean` para indexar y recuperar documentos en luxemburgues en sistemas RAG o motores de busqueda internos.
- Analisis de sentimiento en redes sociales y resenas: ajuste fino sobre un corpus etiquetado en luxemburgues, con despliegue en CPU o GPU consumer por el reducido tamano del modelo.
- Anotacion asistida de corpus linguisticos: preanotacion de datos para proyectos de documentacion del luxemburgues, reduciendo el esfuerzo manual de anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,27 GB solo para pesos (68,4 M de parametros), mas activaciones y overhead del runtime; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16/bf16: alrededor de 0,14 GB para pesos; en int8, unos 0,07 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` con PyTorch (requiere `transformers>=4.48.0`); para servir en produccion pueden usarse frameworks de inferencia compatibles con modelos de `transformers`, aunque la model card no documenta integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU para secuencias de hasta 1.024 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| LUNI-mini | 68,4 M | 1.024 | Luxemburgues | Fill-mask (MLM) | CC BY-SA 4.0 |
| jhu-clsp/ettin-encoder-68m | ~68 M | no disponible en la informacion | Ingles | Encoder MLM | no disponible en la informacion |
| ModernBERT-base | ~149 M | 8.192 | Ingles (mayoritariamente) | Encoder MLM | no disponible en la informacion |

La comparativa se limita a la referencia arquitectonica citada por el autor (Ettin 68M) y a ModernBERT-base como miembro representativo de la familia. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos, y no se han identificado en la informacion proporcionada otros encoders MLM especializados en luxemburgues con los que contrastar.

## Limitaciones y advertencias

- Especializado exclusivamente en luxemburgues; su rendimiento en otras lenguas no esta verificado y no debe asumirse por el tag `multilingual`.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos sin truncado o segmentacion previa.
- Es un modelo MLM, no generativo: no puede usarse para chat, generacion libre de texto, agentes ni tool calling.
- Riesgo de alucinacion en el sentido de predicciones plausibles pero incorrectas en fill-mask; las sugerencias deben validarse en aplicaciones sensibles.
- El tokenizador no anade `[SEP]` ni EOS; anadirlos manualmente degrada los resultados porque el modelo no los vio en preentrenamiento.
- El embedding de `[CLS]` no recibio gradiente como token de entrada durante el preentrenamiento; para representaciones de frase sin ajuste fino se recomienda el pooling `mean` por defecto.
- El formato de pares de frases (`[CLS] A [CLS] B`) solo se aprende durante el ajuste fino, no en el preentrenamiento.
- Licencia CC BY-SA 4.0: el uso comercial es posible, pero las obras derivadas (incluidos ajustes finos distribuidos) deben compartirse bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No se ha publicado paper ni resultados de benchmarks; la calidad del modelo no esta respaldada por evaluaciones publicas verificables.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus de luxemburgues, puede reflejar los sesgos presentes en dichas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/instilux/luni-mini
- Receta Ettin (referencia del autor): https://huggingface.co/jhu-clsp/ettin-encoder-68m
