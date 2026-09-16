# gijl/htdn-arabic-350m1

## Resumen

HTDN (gijl/htdn-arabic-350m1) es un modelo de lenguaje de 349.011.904 parámetros desarrollado por el usuario gijl, entrenado exclusivamente en árabe y publicado bajo licencia Apache 2.0. Su rasgo definitorio no es el tamaño, sino la arquitectura: HTDN combina una capa de dinámicas recurrentes con atención propia causal, incorporando RoPE para la codificación posicional y SwiGLU en las capas feed-forward. No se trata de un transformer estándar, por lo que no puede cargarse con `AutoModel.from_pretrained`; el autor distribuye el código de modelado en JAX/Flax (`modeling_htdn.py`) junto con los pesos en safetensors.

El modelo se entrenó sobre datos árabes de múltiples fuentes en streaming, con un presupuesto de cómputo modesto: dos GPU T4 en Kaggle y un tiempo acumulado de 120 horas y 36 minutos, hasta la iteración 428.440. La mejor pérdida registrada es 0,3741. El tokenizador empleado es `bert-base-multilingual-cased`, lo que aporta un vocabulario multilingüe aunque el entrenamiento se haya limitado al árabe.

Es relevante ahora como pieza de investigación reproducible: explora arquitecturas híbridas (recurrencia + atención) a una escala que cabe en hardware de consumo y en entornos gratuitos como Kaggle, algo poco habitual en un ecosistema dominado por transformers puros. El propio autor lo etiqueta como modelo experimental y de investigación con resultados preliminares, con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDN: capa de dinamicas recurrentes + atencion propia causal, con RoPE y SwiGLU; implementacion en JAX/Flax, no es una arquitectura `transformers` estandar |
| Parametros totales | 349.011.904 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El tokenizador es `bert-base-multilingual-cased`, habitualmente asociado a 512 tokens, pero la model card no declara la ventana real del modelo |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas ni GGUF |
| Idiomas soportados | Arabe (`ar`). Tokenizador multilingue, entrenamiento solo en arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, mas codigo de modelado personalizado en JAX/Flax (`modeling_htdn.py`). Tamano del repositorio: 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura HTDN sustituye el bloque transformer convencional por una combinacion de una capa de dinamicas recurrentes y atencion propia causal (self-attention causal), con embeddings posicionales rotatorios (RoPE) y activacion SwiGLU en las proyecciones feed-forward. Esta mezcla busca capturar dependencias secuenciales de forma recurrente sin renunciar al modelado global de la atencion. El autor no publica el numero de capas, dimensiones ocultas ni el detalle del bucle recurrente, ni tampoco el numero de tokens de entrenamiento ni la composicion exacta del dataset (se describe unicamente como datos arabes multiorigen en streaming). No se documenta ninguna fase de RLHF, DPO o ajuste por preferencias.

El entrenamiento se realizo en JAX/Flax sobre dos GPU T4 mediante Kaggle, con 120 horas y 36 minutos de computo acumulado y 428.440 pasos en el momento de la subida. La mejor perdida registrada es 0,3741021156311035. El tokenizador es `bert-base-multilingual-cased`. La model card indica explicitamente que se trata de un modelo experimental y que los resultados son preliminares. Un detalle a tener en cuenta: el repositorio ocupa 2,7 GB para 349 M de parametros, un tamano muy superior al de una copia unica en fp16 (unos 0,7 GB), lo que sugiere pesos en fp32 y/o la presencia de artefactos adicionales; la model card no lo aclara.

## Capacidades

- Generacion de texto en arabe: es la unica tarea declarada en el pipeline (`text-generation`).
- Continuacion de prompt y generacion libre mediante las funciones del autor `generate` y `quick_generate`.
- Carga integrada de modelo, pesos y tokenizador a traves de `load_htdn_from_hub`, sin necesidad de reconstruir pesos manualmente.
- Capacidad multilingue limitada: el vocabulario del tokenizador es multilingue, pero el entrenamiento es exclusivamente arabe.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso, modo "thinking", vision ni audio.
- No se documentan capacidades de razonamiento matematico ni de generacion de codigo, ni resultados que las respalden.

## Casos de uso

- Investigacion en arquitecturas hibridas: el modelo permite estudiar el comportamiento de una capa recurrente combinada con atencion causal en un rango de 350 M de parametros, un tamano reproducible en un unico equipo con GPU de gama media o incluso en el entorno gratuito de Kaggle.
- Experimentos academicos y trabajos de fin de grado o master: sirve para comparar perdida y calidad de generacion frente a un transformer de parametros similares entrenado en arabe, dado que el autor publica la perdida de referencia (0,3741) y el numero de pasos.
- Generacion de borradores de texto en arabe: continuacion de prompts para producir texto preliminar (descripciones, parrafos de relleno) que despues se revisa y edita; adecuado por su tamano reducido y su coste de inferencia bajo, no por su calidad final.
- Fine-tuning en tareas arabes concretas: al ser un modelo pequeno con licencia Apache 2.0 y pesos en safetensors, es un candidato razonable para ajuste supervisado en clasificacion de texto, resumen o generacion de respuestas breves sobre dominios acotados.
- Generacion de datos sinteticos para aumento de corpus arabes: se puede usar para producir texto adicional que luego se filtre, siempre asumiendo que la calidad del modelo experimental exige una revision humana posterior.
- Prototipado en entornos sin GPU de datacenter: al ocupar una fraccion pequena de memoria, permite montar demos de generacion en arabe en una T4 o en una GPU de consumo, con el objetivo de validar producto antes de invertir en un modelo mayor.
- Reproduccion y auditoria de pipelines JAX/Flax: el codigo `modeling_htdn.py` y las funciones de carga automatica sirven como referencia para quienes quieran integrar pesos safetensors en flujos JAX sin depender de `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la mejor perdida de entrenamiento (0,3741021156311035), que no es directamente comparable con metricas como MMLU, HumanEval o GSM8K. No se dispone de evaluaciones en tareas arabes estandar (por ejemplo, conjuntos de comprension lectora o clasificacion) ni de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 o fp16, aproximadamente 0,7 GB solo para los pesos, mas activaciones y memoria del runtime de JAX; en la practica, entre 1,5 y 3 GB. En fp32, unos 1,4 GB de pesos y en torno a 3-4 GB con overhead.
- El repositorio ocupa 2,7 GB, por lo que conviene reservar espacio en disco y verificar el tipo real de los pesos antes de desplegar.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente (RTX 3060, RTX 4060, T4, GTX 1660 en adelante). El propio autor entreno en dos T4, de modo que una unica T4 basta para inferencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, y con cuantizacion adicional (no publicada) cabria en CPU o en iGPU.
- Opciones de despliegue: al ser una arquitectura personalizada en JAX/Flax sin soporte en `transformers` ni pesos GGUF, no son aplicables vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es instalar `jax`, `flax`, `transformers`, `huggingface_hub` y `safetensors`, descargar `modeling_htdn.py` con `hf_hub_download` y usar `load_htdn_from_hub` / `quick_generate`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada, y el propio modelo es una arquitectura propietaria sin equivalencia directa en el ecosistema `transformers`. La comparativa se limita a lo que puede afirmarse sin inventar cifras:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gijl/htdn-arabic-350m1 | 349.011.904 | No disponible | Apache 2.0 | HuggingFace, requiere codigo JAX propio | Arquitectura HTDN (recurrencia + atencion), solo arabe, experimental |
| Alternativas de la misma categoria (modelos arabes de menos de 1 B de parametros, por ejemplo variantes tipo BERT arabe o modelos causales pequenos) | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de estos modelos en la informacion recibida |
| Modelos arabes de mayor escala (por ejemplo familias de decenas de miles de millones de parametros) | No disponible | No disponible | No disponible | No disponible | No comparables en tamano ni en presupuesto de entrenamiento; sin datos aportados |

En resumen: la comparativa cuantitativa no puede elaborarse con la informacion disponible, y la diferencia mas clara frente a cualquier alternativa es cualitativa (arquitectura no estandar y entrenamiento en dos T4).

## Limitaciones y advertencias

- Modelo declarado explicitamente como experimental y de investigacion, con resultados preliminares; no esta validado para produccion.
- Riesgo de alucinacion elevado: no se ha aplicado RLHF ni DPO, y no hay evaluaciones de fidelidad factual.
- La perdida de 0,3741 corresponde a entrenamiento, no a un conjunto de evaluacion independiente; no permite inferir calidad real de generacion.
- Sesgos desconocidos: no se documenta la composicion del corpus arabe ni los filtros aplicados, por lo que no se pueden evaluar sesgos dialectales, religiosos, de genero o politicos.
- Cobertura limitada al arabe: aunque el tokenizador es multilingue (`bert-base-multilingual-cased`), no hay entrenamiento en otros idiomas y el rendimiento fuera del arabe sera previsiblemente pobre.
- Longitud de contexto no declarada: si se hereda el limite habitual de 512 tokens del tokenizador BERT, el modelo no servira para documentos largos ni conversaciones multi-turno extensas.
- Incompatibilidad de ecosistema: al no ser una arquitectura `transformers` estandar, no funciona con `AutoModel`, vLLM, llama.cpp, Ollama, TGI ni herramientas que esperen GGUF. Cualquier integracion exige cargar codigo Python personalizado, con el riesgo de seguridad que implica ejecutar `modeling_htdn.py` descargado del repositorio.
- Tamano del repositorio llamativamente alto (2,7 GB) para 349 M de parametros; conviene verificar el tipo de dato de los pesos antes de planificar el despliegue.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia, pero la licencia no garantiza idoneidad ni ausencia de sesgos; el autor no ofrece soporte ni mantenimiento.
- Adopcion nula (0 descargas, 0 likes) y madurez temprana: no existe comunidad, documentacion adicional ni issues que permitan contrastar su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/gijl/htdn-arabic-350m1
- Codigo de modelado incluido en el repositorio: `modeling_htdn.py` (funciones `load_htdn_from_hub`, `generate` y `quick_generate`)
- Paper, blog, repositorio adicional o demo: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces obtenidos correspondian a paginas de ayuda de YouTube y no guardan relacion con HTDN
