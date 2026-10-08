# guan-wang/ESM-FineWeb-1B-SFT

## Resumen

ESM-FineWeb-1B-SFT es un modelo de lenguaje enmascarado de tipo *fill-mask* desarrollado por el usuario guan-wang y publicado en HuggingFace. Se enmarca dentro del proyecto OpenESM, una familia de modelos de lenguaje basados en energía (*energy-based language model*, EBM) con arquitectura propia y no convencional. El checkpoint distribuido corresponde a la etapa de ajuste supervisado (SFT) sobre el conjunto de datos FineWeb.

El modelo declara 1.028.275.456 parámetros (etiquetado comercialmente como «1B», variante d26) y una longitud de contexto de 2048 tokens. Su implementación no es la clase `transformers.EsmModel` integrada en la librería, sino un código remoto propio que debe cargarse con `trust_remote_code=True`, lo que condiciona su integración en herramientas estándar.

Su relevancia actual es fundamentalmente experimental: se trata de una publicación sin descargas ni validación de la comunidad, sin licencia definida y sin resultados de benchmarks publicados. Resulta interesante para investigadores que trabajen en modelos basados en energía o quieran reproducir el pipeline de OpenESM, pero no es un candidato directo para producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenESM personalizada (variante d26), modelo de lenguaje basado en energia; transformer encoder de 26 bloques, no compatible con `transformers.EsmModel` |
| Parametros totales | 1.028.275.456 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no documentados; pesos distribuidos en safetensors con un tamano de repositorio de 4,1 GB para 1.028.275.456 parametros (consistente con fp32) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, corpus mayoritariamente en ingles, pero el autor no lo confirma) |
| Licencia | no disponible (la propia model card indica «Please add the applicable model/data license before publishing this repo») |
| Formato de pesos | safetensors (`model*.safetensors`) mediante Transformers; el checkpoint original es un `.ckpt` de Lightning (`final-s=step=2999-d26-ctx2048.ckpt`) que no es necesario para cargar el repositorio |

Datos adicionales de configuracion declarados por el autor: dimension de embedding 1664, 13 cabezas de atencion y vocabulario de 32768 tokens.

## Arquitectura y entrenamiento

La arquitectura es una implementacion propia del proyecto OpenESM, descrita por el autor como «energy-based language model» con 26 bloques transformer, dimension de embedding de 1664 y 13 cabezas de atencion. El pipeline declarado es `fill-mask`, es decir, el modelo predice tokens enmascarados y no genera texto de forma autoregresiva convencional. El repositorio incluye codigo remoto (`modeling_esm.py`, `configuration_esm.py`) y un tokenizador serializado en `tokenizer.pkl`, junto con una tabla de bytes de tokens (`token_bytes.pt`) empleada por las metricas de OpenESM.

En cuanto al entrenamiento, el autor indica que el modelo se entreno sobre FineWeb y que el checkpoint publicado corresponde a la etapa de *supervised fine-tuning*. No se especifica el numero de tokens de entrenamiento: la model card afirma explicitamente que los recuentos de tokens se omiten de forma intencionada tanto del nombre del repositorio como de los nombres de fichero. Los metadatos del checkpoint mencionan el identificador `ebm-fineweb-d26-7b-sft` y describen el modelo como «SFT model initialized from the EBM FineWeb d26, 7B checkpoint», en aparente contradiccion con el tamano de 1B y con los 1.028 millones de parametros reales de los safetensors. No se documentan detalles sobre composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Relleno de mascaras (*fill-mask*): es la tarea declarada en el pipeline de HuggingFace. El modelo recibe una secuencia con tokens enmascarados y devuelve logits sobre el vocabulario de 32768 tokens.
- Modelado de lenguaje basado en energia: segun la etiqueta `energy-based-language-model`, el modelo asigna una funcion de energia a las secuencias, lo que en principio permite puntuar la coherencia de un texto ademas de predecir tokens enmascarados.
- Contexto de 2048 tokens para el procesamiento de secuencias en una sola pasada.
- Extraccion de representaciones contextuales mediante el codigo remoto, si el usuario accede a los estados ocultos del encoder.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.

## Casos de uso

- Relleno de texto en herramientas de edicion y autocompletado: al ser un modelo `fill-mask` con contexto de 2048 tokens, puede insertarse en flujos donde el usuario marca un hueco en un parrafo y el sistema propone el token o fragmento mas probable, siempre que el texto sea del dominio de FineWeb.
- Filtrado y puntuacion de corpus web: dado que se entreno sobre FineWeb y su formulacion basada en energia permite puntuar secuencias, puede emplearse como modelo auxiliar para ordenar o descartar documentos de un corpus por su coherencia estimada, en lugar de usarlo como generador.
- Aumento de datos mediante enmascaramiento: generar variantes de frases enmascarando tokens y dejando que el modelo proponga sustituciones, util para aumentar datasets pequenos en tareas de clasificacion cuando no se dispone de un generador autoregresivo.
- Extraccion de embeddings para clasificacion, clustering o busqueda semantica: usando los estados ocultos del encoder en lugar de la cabeza de prediccion, con la ventaja de una ventana de 2048 tokens, superior a los 512 habituales de BERT-base.
- Investigacion en modelos basados en energia: reproduccion de los experimentos de OpenESM, comparacion de funciones de energia frente a modelos autoregresivos de tamano similar y analisis de estabilidad del entrenamiento por energia.
- Punto de partida para experimentos de SFT: el checkpoint ya esta ajustado de forma supervisada sobre FineWeb, por lo que puede servir como base para probar recetas de ajuste adicionales y medir su efecto sobre las metricas internas de OpenESM (`token_bytes.pt`).
- Evaluacion de infraestructura de carga remota: escenario de laboratorio para medir el coste y los riesgos de desplegar modelos con `trust_remote_code=True` frente a arquitecturas nativas de Transformers.
- *Reranking* de candidatos en recuperacion de informacion: puntuar con la energia del modelo distintas hipotesis de respuesta o de continuacion de texto para reordenar resultados, sin necesidad de decodificacion autoregresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, GLUE ni de ninguna otra evaluacion estandar, y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo (los resultados obtenidos corresponden a entradas no relacionadas, como el ave «guan» o el restaurante Guan de Montreal).

## Requisitos de hardware

- Parametros: 1.028.275.456. Estimaciones de memoria para los pesos: aproximadamente 4,1 GB en fp32, 2,1 GB en bf16/fp16, 1,0 GB en int8 y 0,5 GB en int4. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- VRAM estimada para inferencia: del orden de 4,5-6 GB en fp32 con contexto 2048 y batches pequenos; del orden de 2,5-3,5 GB en bf16. La memoria de activaciones para la ventana completa de 2048 tokens es moderada dado el tamano del modelo.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son suficientes con holgura. Para despliegues en servidor, A100 o H100 no aportan ventaja en memoria para este tamano, aunque si en throughput por batch.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de gama media con 6 GB o mas, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True` es la unica via documentada. vLLM, llama.cpp, Ollama y TGI no estan soportados de forma nativa, ya que dependen de arquitecturas reconocidas por la libreria y no de codigo remoto personalizado.
- Latencia y throughput estimados: no disponible. No hay datos publicados de latencia, tokens por segundo ni comportamiento con batching dinamico.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan comparar este modelo con alternativas de forma rigurosa. La tabla siguiente recoge unicamente caracteristicas estructurales; las cifras de BERT-base y ModernBERT-base proceden de su documentacion publica y se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| ESM-FineWeb-1B-SFT | 1.028.275.456 | 2048 | OpenESM personalizada (EBM, fill-mask) | no disponible | safetensors con codigo remoto |
| BERT-base-uncased | 110.000.000 (aprox.) | 512 | transformer encoder, fill-mask | Apache 2.0 | safetensors, nativo en Transformers |
| ModernBERT-base | 149.000.000 (aprox.) | 8192 | transformer encoder moderno, fill-mask | Apache 2.0 | safetensors, nativo en Transformers |

La comparacion de rendimiento no es posible con la informacion disponible: el modelo no publica benchmarks y las alternativas citadas tienen evaluaciones estandar ampliamente difundidas que no se pueden contrastar contra un modelo sin resultados publicados.

## Limitaciones y advertencias

- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de uso real ni de calidad contrastada.
- Licencia no definida: la propia model card pide anadir una licencia antes de publicar. Sin licencia explicita no se puede asumir permiso de uso comercial, y en muchas jurisdicciones la ausencia de licencia implica reserva de derechos por parte del autor.
- Codigo remoto obligatorio: la carga requiere `trust_remote_code=True`, lo que implica ejecutar Python del repositorio. Es un riesgo de seguridad que debe mitigarse revisando `modeling_esm.py` y `configuration_esm.py` antes de cualquier despliegue.
- Tokenizador como `tokenizer.pkl`: el uso de pickle serializado para el tokenizador es un vector de riesgo conocido si el repositorio se compromete, ya que la deserializacion de pickle puede ejecutar codigo arbitrario.
- Discrepancia en el tamano declarado: los metadatos del checkpoint hablan de un modelo «7B» mientras que el nombre del repositorio y los pesos reales indican 1B. Conviene verificar la configuracion antes de asumir cualquier cifra de capacidad.
- No es un modelo generativo: su pipeline es `fill-mask`, no `text-generation`. No puede usarse como chatbot, para generacion libre de texto ni para tareas conversacionales sin adaptaciones adicionales.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion autoregresiva, pero las predicciones de tokens enmascarados pueden ser incorrectas o incoherentes; no hay evaluaciones que cuantifiquen la tasa de error.
- Sesgos: al entrenarse sobre FineWeb, un corpus de texto web a gran escala, hereda los sesgos de ese material (representacion desigual de generos, idiomas, culturas y puntos de vista), sin que se documenten medidas de mitigacion.
- Limitaciones de idioma: no se declaran idiomas soportados. FineWeb es predominantemente en ingles, por lo que el rendimiento fuera de ese idioma probablemente sea deficiente, si bien no hay datos que lo confirmen.
- Contexto limitado: 2048 tokens, inferior a los 8192 de arquitecturas encoder modernas, lo que restringe casos de uso con documentos largos.
- Incompatibilidad con el ecosistema: al no ser una arquitectura nativa de Transformers, no funcionara con herramientas que dependan de la introspeccion del modelo (vLLM, TGI, llama.cpp, Ollama, librerias de cuantizacion automatica o de *fine-tuning* estandar).
- Trazabilidad del entrenamiento incompleta: se omiten de forma deliberada los recuentos de tokens y no se detalla la composicion del dataset ni el proceso de SFT, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guan-wang/ESM-FineWeb-1B-SFT
- Repositorio de codigo OpenESM: https://github.com/datamllab/openesm
- La busqueda web realizada no ha devuelto enlaces relevantes sobre el modelo; los resultados obtenidos corresponden a entradas no relacionadas (el ave guan, el restaurante Guan de Montreal y entradas de diccionario sobre el termino «guan»).
