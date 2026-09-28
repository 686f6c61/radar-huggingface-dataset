# picur/picur-860M-instruct-gguf

## Resumen

picur-860M-instruct-gguf es la version cuantizada en formato GGUF del modelo picur-860M-instruct, desarrollado por el usuario picur y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de generacion de texto con ajuste de instrucciones (instruct) y enfoque monolingue en hungaro (hu), con 856.662.144 parametros totales (aproximadamente 860 millones) y un repositorio de 2,6 GB que aloja las distintas variantes de cuantizacion.

El modelo se distribuye especificamente para su uso con Ollama y llama.cpp, y la propia model card lo etiqueta como "PREVIEW", lo que indica que se trata de una publicacion preliminar y no de una version estable validada. El unico ejemplo de uso documentado es la ejecucion mediante el comando `ollama run --think=false hf.co/picur/picur-860M-instruct-gguf:Q8_0`, lo que confirma la existencia al menos de una cuantizacion Q8_0.

Su relevancia actual es limitada pero concreta: cubre el nicho de modelos pequenos (sub-1B) orientados al hungaro, un idioma con escasa representacion en el ecosistema de modelos abiertos. Al ser un modelo de menos de mil millones de parametros y en formato GGUF, puede ejecutarse en hardware muy modesto, incluyendo CPU, lo que lo hace util para prototipado local, despliegue en el borde y experimentacion academica. No obstante, la ausencia de documentacion tecnica, de resultados de benchmarks y de cualquier validacion por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta) limita seriamente cualquier evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parametros totales | 856.662.144 (aproximadamente 860 M) |
| Parametros activos | no aplica (no se ha documentado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se confirma Q8_0 en el ejemplo de la model card; el resto de variantes no esta documentado |
| Idiomas soportados | hungaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 2,6 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer decoder-only, un modelo MoE, una arquitectura hibrida con SSM ni ningun otro detalle estructural. Tampoco se documenta el numero de capas, la dimension del embedding, el mecanismo de atencion ni el tipo de tokenizador empleado. Dado el rango de parametros (860 M), lo mas probable es que sea un transformer denso de escala reducida, pero esto no esta confirmado por el autor.

Respecto al entrenamiento, la informacion disponible es igualmente nula: no se indica el volumen de tokens de entrenamiento, la composicion del dataset, si hubo una fase de ajuste supervisado (SFT), optimizacion por preferencias (RLHF, DPO) u otras tecnicas de alineamiento. El unico dato objetivo es que existe un modelo base denominado picur-860M-instruct, del cual esta publicacion es una derivada cuantizada en GGUF. No se documenta ninguna innovacion tecnica destacable, ni decodificacion especulativa, ni atencion lineal, ni modos de razonamiento explicitos.

## Capacidades

- Generacion de texto en hungaro: es la capacidad principal y la unica documentada explicitamente en las etiquetas del modelo (`hu`, `hungarian`, `magyar`).
- Formato conversacional e instrucciones: las etiquetas `instruct` y `conversational` indican que el modelo fue ajustado para seguir instrucciones y mantener dialogos de tipo chat.
- Ejecucion local mediante Ollama y llama.cpp: al estar en formato GGUF, es compatible con el ecosistema de inferencia en CPU y GPU de llama.cpp.
- Desactivacion del modo de razonamiento: el ejemplo oficial emplea el flag `--think=false` de Ollama. No esta documentado si el modelo incorpora un modo de razonamiento explicito o si el flag simplemente se incluye por compatibilidad; se trata de un indicio, no de una capacidad confirmada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, y poco probable en un modelo de 860 M.
- Capacidades multilingues: no disponibles; solo se declara hungaro.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Chatbot de atencion al cliente en hungaro: el modelo puede gestionar conversaciones basicas de soporte en hungaro con un coste de inferencia muy bajo, lo que permite desplegarlo en instancias CPU economicas o incluso en el dispositivo del usuario. Su tamano reducido lo hace adecuado para respuestas cortas y flujos guiados, siempre que se valide su calidad previamente.
- Prototipado local sin GPU: al ser un GGUF de 860 M, puede ejecutarse en portatiles convencionales e incluso en CPU, lo que permite iterar sobre prompts, plantillas y flujos conversacionales antes de migrar a un modelo mayor.
- Generacion de texto auxiliar en hungaro: redaccion de borradores, resumenes cortos, reformulacion de frases y normalizacion de texto en hungaro dentro de herramientas ofimaticas o CMS internos.
- Preprocesado linguistico en pipelines de NLP en hungaro: generacion de parafrasis, etiquetado aproximado o transformacion de texto como paso previo a un modelo mayor o a un sistema de busqueda.
- Fine-tuning especifico de dominio: al ser un modelo pequeno con licencia Apache 2.0 y pesos GGUF, sirve como punto de partida economico para ajustes en dominios concretos (legal, sanitario, administracion publica hungara) mediante LoRA o QLoRA partiendo del modelo base no cuantizado.
- Asistente embebido en aplicaciones de escritorio o moviles: integrable mediante Ollama o llama.cpp dentro de una aplicacion local, sin dependencia de APIs externas y sin enviar datos a terceros, lo que resulta relevante por privacidad.
- Investigacion academica sobre modelos pequenos en lenguas minoritarias: permite estudiar el comportamiento de modelos sub-1B en hungaro, comparar tecnicas de cuantizacion o analizar el impacto del ajuste por instrucciones en idiomas con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HellaSwag, HumanEval, GSM8K, huMMLU ni equivalentes en hungaro), y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros; no confirmada por el autor):
  - FP16: aproximadamente 1,71 GB de pesos.
  - Q8_0: aproximadamente 0,91 GB de pesos.
  - Q4_K_M: aproximadamente 0,5 GB de pesos.
  A estas cifras hay que sumar el consumo del contexto (KV cache), que depende de la longitud de contexto efectiva, no documentada.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente. Una RTX 3060, una GTX 1650 o incluso graficas integradas modernas pueden ejecutarlo sin problema. Tarjetas como RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Compatibilidad con GPU consumer: si, de forma holgada. Tambien es viable la inferencia exclusiva en CPU con cuantizaciones Q4 o Q8.
- Opciones de despliegue: Ollama (documentado oficialmente en la model card), llama.cpp y cualquier wrapper construido sobre el, como llama-cpp-python o llama-cpp-server. El soporte en vLLM y TGI para GGUF es parcial o experimental y no esta confirmado para este modelo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los datos de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| picur-860M-instruct-gguf | 856,7 M | no disponible | hungaro | Apache 2.0 | GGUF |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | ingles (principalmente) | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | multilingue (incluye varias lenguas europeas) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 tokens | multilingue (8 idiomas oficiales) | Licencia comunitaria Llama 3.2 | safetensors, GGUF |

Observaciones: el modelo analizado es el unico de la comparativa con foco declarado en hungaro, pero tambien es el unico sin contexto documentado ni evaluaciones publicadas. TinyLlama y Qwen2.5 ofrecen licencias permisivas equivalentes, y Llama-3.2-1B impone condiciones adicionales de uso comercial. No es posible establecer una comparacion de calidad sin benchmarks.

## Limitaciones y advertencias

- Estado de previsualizacion: la propia model card lo etiqueta como "PREVIEW", lo que implica que puede contener errores, cambios incompatibles o un rendimiento no validado.
- Ausencia total de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar su comportamiento.
- Documentacion tecnica inexistente: no se conocen arquitectura, datos de entrenamiento, proceso de alineamiento ni contexto maximo, lo que impide evaluar sesgos de origen o limitaciones estructurales.
- Riesgo elevado de alucinacion: con 860 M de parametros, la capacidad de razonamiento, el seguimiento de instrucciones complejas y la factualidad son estructuralmente limitados en comparacion con modelos de mayor escala.
- Cobertura idiomatica restringida: solo se declara hungaro. El comportamiento en castellano, ingles u otros idiomas no esta garantizado y previsiblemente sera deficiente.
- Perdida por cuantizacion: al ser una version GGUF derivada, las cuantizaciones mas agresivas (Q4, Q3, Q2) degradaran la calidad respecto al modelo base, especialmente en tareas de generacion precisa.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia. No obstante, conviene verificar la licencia del modelo base picur-860M-instruct, ya que la model card no detalla su procedencia ni si impone condiciones adicionales.
- Metadatos posiblemente inconsistentes: la fecha de creacion registrada (28 de septiembre de 2026) es posterior a la fecha de consulta habitual de este tipo de fichas, lo que sugiere un posible error en los metadatos del repositorio.
- No recomendado para produccion critica: sin benchmarks, sin documentacion y en estado de vista previa, su uso deberia limitarse a prototipos, experimentacion o tareas no criticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/picur/picur-860M-instruct-gguf
- Modelo base: https://huggingface.co/picur/picur-860M-instruct
- Perfil del autor: https://huggingface.co/picur
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las busquedas devuelven exclusivamente resultados no relacionados (un suplemento alimenticio denominado PiCUR, el registro pediatrico PICURe, la marca de congelados Picard y pronosticos de carreras de caballos), por lo que no se incluye ningun enlace adicional.
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles.
