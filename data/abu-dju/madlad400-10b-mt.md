# Abu-Dju/madlad400-10b-mt

## Resumen

MADLAD-400-10B-MT es un modelo de traduccion automatica multilingue basado en la arquitectura T5 (encoder-decoder) y entrenado sobre 250.000 millones de tokens en mas de 450 idiomas con datos publicos. El checkpoint original fue desarrollado por Google Research y publicado junto al articulo "MADLAD-400: A Multilingual And Document-Level Large Audited Dataset" (arXiv:2309.04662); los pesos fueron convertidos al formato de HuggingFace por Juarez Bochi. El repositorio analizado, `Abu-Dju/madlad400-10b-mt`, es una redistribucion de ese checkpoint (con pesos en safetensors y, segun las etiquetas del repositorio, tambien en GGUF) manteniendo la licencia Apache 2.0.

El modelo resuelve traduccion multilingue en una sola direccion controlada por un prefijo de idioma destino con el formato `<2xx>` (por ejemplo, `<2pt> I love pizza!` devuelve "Eu adoro pizza!"). Su relevancia actual radica en que cubre idiomas de muy bajos recursos que quedan fuera de modelos comerciales o de alternativas como NLLB-200 (limitada a 200 idiomas y con licencia no comercial), y lo hace con un tamano de 10.712.586.240 parametros que resulta competitivo frente a modelos notablemente mas grandes segun la propia model card.

Se trata de un modelo de investigacion, no ajustado por instrucciones ni orientado a produccion: no incorpora tool calling, agentes ni capacidades multimodales. Su uso previsto es la traduccion automatica y tareas de PLN multilingue, con evaluacion publicada sobre 204 de los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (text2text-generation) |
| Parametros totales | 10.712.586.240 (10,7 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no especifica el maximo de tokens de entrada/salida) |
| Tipos de cuantizacion | No disponible en detalle; el repositorio incluye la etiqueta `gguf`, ademas de safetensors |
| Idiomas soportados | Multilingue, mas de 450 idiomas en entrenamiento; la model card lista mas de 400 etiquetas de idioma (incluye es, en, fr, de, it, pt, ca, gl, eu, ru, zh, ja, ar, hi, entre muchos otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF; tamano del repositorio 57,7 GB |
| Tokenizador | SentencePiece (`T5Tokenizer`), con vocabulario ampliado para cobertura multilingue |
| Pipeline en HuggingFace | translation |
| Compatibilidad de despliegue | transformers, text-generation-inference, endpoints compatibles, Candle (Rust) |
| Dataset de entrenamiento | allenai/MADLAD-400 |
| Fecha de publicacion del repositorio | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de la familia T5, el mismo esqueleto empleado por los checkpoints T5/Flan-T5, con atencion completa y sesgo de posicion relativa en lugar de embeddings posicionales absolutos. El modelo es denso (no MoE, no SSM ni hibrido) y su tarea es generativa secuencia a secuencia: la entrada incluye un prefijo de idioma destino (`<2de>`, `<2pt>`, `<2en>`, etc.) y el decodificador produce la traduccion. La model card indica que los pesos fueron convertidos desde los checkpoints originales de Google y que la documentacion de uso es equivalente a la de T5.

El entrenamiento cubre 250.000 millones de tokens y mas de 450 idiomas usando exclusivamente datos publicos, en el marco del dataset MADLAD-400 (allenai/MADLAD-400), que incluye un proceso de auditoria de calidad sobre el corpus. No se documenta en la informacion disponible el uso de RLHF, DPO ni ajuste por preferencias: se trata de un modelo de traduccion supervisada, no de un modelo de chat. La evaluacion publicada se limita a 204 idiomas y a tareas de traduccion automatica y traduccion few-shot, lo que deja sin medir una parte sustancial de la cobertura declarada. La model card advierte que el modelo esta entrenado con datos de dominio general y que no ha sido evaluado para casos de uso en produccion.

## Capacidades

- Traduccion automatica multilingue en mas de 400 idiomas, con el idioma destino seleccionado mediante el prefijo `<2xx>` en la entrada.
- Traduccion entre pares de idiomas de bajos recursos (por ejemplo, lenguas africanas, asiaticas y amerindias) que no suelen estar cubiertas por modelos comerciales.
- Traduccion few-shot y tareas de PLN multilingue evaluadas en el articulo original.
- Generacion de texto secuencia a secuencia en el sentido estricto del decoder T5; no es un modelo conversacional ni esta ajustado por instrucciones.
- No soporta tool calling ni function calling: no dispone de plantillas de herramientas ni de entrenamiento orientado a agentes.
- No soporta razonamiento multi-paso orientado a agentes ni planificacion de tareas.
- No dispone de modo "thinking", vision, audio ni capacidades multimodales.
- No incluye un chat template ni un rol de sistema; la entrada debe construirse manualmente con el prefijo de idioma.

## Casos de uso

- Localizacion de documentacion tecnica: se puede integrar en un pipeline que recorra ficheros Markdown o XML, inserte el prefijo del idioma destino en cada segmento y reconstruya el documento, aprovechando la cobertura de idiomas para mercados que otros modelos no atienden.
- Traduccion de catalogos de comercio electronico: traduccion por lotes de titulos, descripciones y atributos de producto a decenas de idiomas con un unico modelo, reduciendo el numero de sistemas de traduccion que hay que mantener frente a soluciones por par de idiomas.
- Subtitulado y doblaje: traduccion de segmentos cortos de subtitulos (SRT/VTT) manteniendo el numero de linea, con el modelo ejecutandose en local mediante GGUF para evitar enviar material audiovisual a servicios externos.
- Atencion al cliente multilingue: como componente de traduccion dentro de un sistema mayor (el modelo traduce el mensaje entrante al idioma del operador o del sistema y la respuesta de vuelta), no como agente autonomo, ya que no tiene soporte de herramientas ni dialogo multi-turno nativo.
- Generacion de datos sinteticos para destilacion: producir corpus paralelos en idiomas de bajos recursos para entrenar modelos mas pequenos y especificos, un flujo habitual en investigacion de traduccion de bajos recursos.
- Investigacion linguistica y preservacion de lenguas minoritarias: obtencion de traducciones de referencia y analisis de cobertura sobre lenguas con pocos recursos digitales, teniendo en cuenta que solo 204 idiomas tienen evaluacion publicada.
- Traduccion de articulos cientificos y documentos largos por segmentos: procesado por fragmentos y posterior alineacion, util para repositorios academicos que necesitan versiones multilingues.
- Traduccion en el borde o en entornos sin conectividad: los pesos GGUF permiten ejecutar el modelo en estaciones de trabajo o portatiles con GPU de consumo, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de referencia menciona que el modelo es competitivo con modelos significativamente mas grandes y que la evaluacion cubre 204 idiomas en tareas de traduccion y traduccion few-shot, pero no incluye cifras concretas (BLEU, chrF, MMLU u otras) en el material proporcionado, por lo que no se presentan numeros.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 43 GB solo para pesos (10,7 mil millones de parametros x 4 bytes), mas memoria de activaciones; requiere A100 80 GB, H100 80 GB o reparto en varias GPU.
- VRAM en fp16/bf16: aproximadamente 21,5 GB de pesos; encaja en A100 40 GB, L40S 48 GB y, con poco margen para el contexto, en RTX 4090 / RTX 3090 de 24 GB.
- VRAM en cuantizacion de 8 bits: en torno a 11 GB, viable en RTX 4080, RTX 3090 o RTX 4090.
- VRAM en cuantizacion de 4 bits (GGUF Q4): aproximadamente 6-7 GB, lo que permite ejecucion en RTX 3060 12 GB, RTX 4060 Ti, Apple Silicon con memoria unificada de 16 GB o superior, y en CPU con llama.cpp (con latencia mucho mayor).
- GPU recomendadas: A100 40/80 GB o H100 para servicio con concurrencia; L40S o RTX 4090 para prototipos y despliegues de baja concurrencia.
- Si cabe en GPU de consumo: si, en RTX 3090/4090 con fp16 ajustado, y con holgura en cuantizaciones de 8 y 4 bits en GPUs de 12-16 GB.
- Opciones de despliegue: transformers (PyTorch) con `device_map="auto"`, text-generation-inference, vLLM (soporte de modelos encoder-decoder tipo T5), llama.cpp/Ollama mediante los ficheros GGUF, y Candle para inferencia en Rust.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Abu-Dju/madlad400-10b-mt (este repo) | 10,7 mil millones | Mas de 450 (evaluado en 204) | No disponible | Apache 2.0 | HuggingFace, safetensors y GGUF | Redistribucion de los pesos de Google |
| google/madlad400-10b-mt | 10,7 mil millones | Mas de 450 | No disponible | Apache 2.0 | HuggingFace | Checkpoint original; pesos equivalentes |
| facebook/nllb-200-3.3B | 3,3 mil millones | 200 | No disponible | CC-BY-NC-4.0 | HuggingFace | Licencia no comercial, limita el uso en producto |
| facebook/m2m100_12B | 12 mil millones | 100 | No disponible | MIT | HuggingFace | Menor cobertura de idiomas y mayor coste de inferencia |
| facebook/mbart-large-50-many-to-many-mmt | 610 millones | 50 | No disponible | MIT | HuggingFace | Mucho mas ligero, pero cobertura idiomatica muy inferior |

La ventaja principal de MADLAD-400-10B-MT frente a estas alternativas es la combinacion de cobertura idiomatica (mas de 450 idiomas) y licencia Apache 2.0, que permite uso comercial sin las restricciones de NLLB-200. Como contrapartida, es un modelo de investigacion sin evaluacion publicada en produccion y con un coste de inferencia superior al de alternativas mas pequenas como mBART-50.

## Limitaciones y advertencias

- Solo se ha evaluado sobre 204 de los mas de 450 idiomas declarados; el rendimiento en el resto de idiomas es desconocido y potencialmente bajo.
- Es un modelo de investigacion: la model card indica explicitamente que no ha sido evaluado para casos de uso en produccion.
- Entrenado con datos de dominio general, por lo que el rendimiento en dominios especializados (medico, juridico, tecnico) puede degradarse sin ajuste adicional.
- Riesgo de alucinacion y de traducciones incorrectas, especialmente en lenguas de muy bajos recursos y en segmentos largos o ambiguos.
- No es un modelo conversacional ni esta ajustado por instrucciones: no acepta mensajes de sistema, no mantiene dialogo multi-turno y no soporta herramientas.
- La longitud de contexto no esta documentada en la informacion disponible; los documentos largos deben dividirse en segmentos y realinearse, con el consiguiente riesgo de perdida de coherencia.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; conviene verificar los terminos del checkpoint original de Google y del dataset MADLAD-400 antes de redistribuir derivados.
- El repositorio analizado es una redistribucion de terceros y no la publicacion original de Google; para entornos criticos conviene validar la integridad de los pesos frente al checkpoint oficial.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, lo que reduce las senales externas de validacion por parte de la comunidad.
- No se han publicado metricas de sesgo especificas; al entrenarse con datos web multilingues, es probable que herede sesgos presentes en el corpus, con calidad desigual entre idiomas.

## Enlaces

- Repositorio analizado: https://huggingface.co/Abu-Dju/madlad400-10b-mt
- Checkpoint original de Google: https://huggingface.co/google/madlad400-10b-mt
- Articulo: MADLAD-400: A Multilingual And Document-Level Large Audited Dataset: https://arxiv.org/abs/2309.04662
- Repositorio de checkpoints originales: https://github.com/google-research/google-research/tree/master/madlad_400
- Repositorio t5x: https://github.com/google-research/t5x
- Todos los checkpoints MADLAD-400 en HuggingFace: https://huggingface.co/models?search=madlad
- Perfil del autor de la conversion de pesos: https://huggingface.co/jbochi
- Pull request de soporte de MADLAD-400 en transformers: https://github.com/huggingface/transformers/pull/27471
- Documentacion de T5 en transformers (aplicable al modelo): https://huggingface.co/docs/transformers/model_doc/t5
- Implementacion de inferencia en Rust: https://github.com/huggingface/candle
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/MADLAD-400
- Busqueda web: los resultados devueltos no guardaban relacion con el modelo (contenido sobre colchones de espuma), por lo que no se ha incorporado ningun enlace adicional de esa busqueda.
