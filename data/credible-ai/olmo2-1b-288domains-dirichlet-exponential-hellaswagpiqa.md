# credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa

## Resumen

olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa es un modelo de lenguaje de 1,41 mil millones de parametros desarrollado por credible-ai, entrenado desde cero sobre 32.000 millones de tokens procedentes del corpus WebOrganizer. No es un modelo de proposito general: es un artefacto de investigacion disenado para reproducir los experimentos del paper LinMix sobre mezcla de datos (data mixing) durante el preentrenamiento.

Su particularidad no esta en la arquitectura, que es un transformer denso OLMo 2 estandar de 18 capas y 2.048 dimensiones ocultas, sino en la distribucion del corpus de entrenamiento. Los datos se organizan en 288 dominios que combinan tema y formato, y los pesos de mezcla entre esos dominios se optimizaron con Olmix mediante un sustituto exponencial ajustado sobre un enjambre Dirichlet, tomando como objetivo los benchmarks HellaSwag y PIQA. El nombre del repositorio codifica literalmente esa receta.

Es relevante ahora porque forma parte de una linea de trabajo que estudia como transferir decisiones de mezcla de datos desde modelos proxy pequenos (aqui un OLMo 2 de 60M) a modelos mayores, un problema abierto con impacto directo en el coste de preentrenamiento. El modelo se publica bajo licencia MIT, en bfloat16, con tokenizador GPT-NeoX-20B y el fichero `mix.json` con la mezcla exacta utilizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo 2 (`Olmo2ForCausalLM`), 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados unicamente en bfloat16 (no hay GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a CC-BY-4.0 y a los terminos de uso de Common Crawl |
| Formato de pesos | safetensors (bfloat16), libreria transformers; repo de 2,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo 2 en su variante pequena: un transformer decoder-only denso con 18 capas, 2.048 unidades de dimension oculta y tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens. No hay mezcla de expertos, atencion lineal ni mecanismos híbridos; el interes del modelo esta enteramente en los datos y en el procedimiento para elegir su proporcion.

El entrenamiento consumio 32.000 millones de tokens del corpus WebOrganizer (derivado del pool DCLM 1b-1x), particionado en 288 dominios de tema x formato. Los pesos de mezcla se obtuvieron con Olmix: se ajusto un sustituto exponencial sobre un enjambre Dirichlet de mezclas candidatas, evaluado sobre un proxy de 60M parametros (credible-ai/olmo2-60M-288domains-dirichlet) y optimizado para HellaSwag y PIQA. El preentrenamiento se ejecuto con OLMo-core. La model card no documenta fases de RLHF, DPO ni instruction tuning, ni detalla la composicion exacta del dataset mas alla de la referencia a WebOrganizer y al fichero `mix.json` incluido en el repositorio.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo continuacion de prompt (modelo base, sin alineacion).
- Capacidad de modelado de lenguaje derivada de un preentrenamiento de solo 32B tokens, muy por debajo de los presupuestos habituales para esta escala.
- No dispone de soporte de tool calling ni de function calling: no hay plantilla de chat, ni formato de herramientas, ni entrenamiento instructivo.
- No incorpora modo thinking, razonamiento multi-paso explicito ni capacidades de agente.
- No es multimodal: sin vision ni audio.
- Multilingue: no; la model card declara exclusivamente ingles.
- Capacidad especial: sirve como punto de reproducibilidad de una mezcla de datos concreta, con la distribucion de dominios y los pesos de mezcla versionados en el repositorio.
- No se han documentado capacidades de codigo o matematicas mas alla de lo que emerga del corpus web de preentrenamiento.

## Casos de uso

- Reproduccion de experimentos de mezcla de datos: cargar el modelo y el `mix.json` para replicar los resultados de LinMix con la misma mezcla de 288 dominios, verificando que el pipeline de tokenizacion (credible-ai/weborganizer-corpus-200b-tokenized) coincide.
- Baseline en estudios de data mixing: comparar esta mezcla optimizada por Olmix contra mezclas uniformes, heuristicas o proporcionales al tamano de dominio, manteniendo fijo el resto del pipeline de entrenamiento.
- Validacion de transferencia proxy a modelo grande: contrastar el comportamiento del proxy de 60M con este modelo de 1,41B para medir si el ranking de mezclas inducido por el sustituto exponencial se preserva al escalar.
- Ablacion de funciones objetivo: reentrenar o evaluar variantes del sustituto (exponencial frente a alternativas) usando HellaSwag y PIQA como senal, tal como se hizo para seleccionar esta mezcla.
- Analisis de contribucion por dominio: al ser un modelo condicionado por una mezcla concreta, sirve para estudiar que familias de dominios (tema x formato) impactan en tareas de sentido comun y razonamiento fisico elemental.
- Fine-tuning de dominio con presupuesto reducido: partir de estos pesos para tareas en ingles donde 1,41B parametros y ~2,8 GB en bf16 encajan en una sola GPU de consumo, aceptando que la base esta infraentrenada.
- Docencia y experimentacion academica: permite ejecutar un ciclo completo de preentrenamiento y evaluacion de mezclas en infraestructura modesta, con codigo publico en el repositorio de LinMix.
- Smoke test de pipelines de inferencia: validar integraciones de transformers, vLLM o TGI con un checkpoint OLMo 2 real de 1,41B antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. HellaSwag y PIQA aparecen en el identificador del modelo y en la descripcion como objetivos usados para optimizar los pesos de mezcla, no como resultados de evaluacion reportados.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,8 GB para los pesos, mas cache KV; en la practica unos 4-6 GB para secuencias cortas y batches pequenos.
- VRAM estimada en float32: aproximadamente 5,7 GB solo para pesos.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB si se limita el contexto y el batch.
- GPU de datacenter: A100, H100, L40S y A10 sobran para inferencia; son utiles para reentrenamiento o evaluacion por lotes a gran escala.
- Opciones de despliegue: transformers (soporte nativo via `Olmo2ForCausalLM`), vLLM y TGI para serving, y llama.cpp/Ollama solo tras convertir los pesos, ya que el repositorio no publica GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa | 1,41B | no disponible | MIT | Preentrenamiento de investigacion con mezcla optimizada (32B tokens, solo ingles) |
| OLMo 2 1B (allenai) | ~1,4B (misma familia) | no verificado en esta ficha | licencia permisiva de AllenAI, consultar model card | Modelo base de proposito general, preentrenado con un presupuesto de tokens muy superior |
| SmolLM2-1.7B (HuggingFace) | 1,7B | no verificado en esta ficha | Apache-2.0, consultar model card | Base e instruct, orientado a uso general y despliegue en dispositivo |
| Qwen2.5-1.5B (Alibaba) | 1,5B | no verificado en esta ficha | Apache-2.0 en la mayoria de variantes, consultar model card | Base e instruct, multilingue, con soporte de tool calling en variantes alineadas |

La comparacion relevante no es de rendimiento absoluto: este checkpoint esta preentrenado con 32B tokens, un orden de magnitud por debajo de los modelos de su talla, y no ha pasado por alineacion. Su valor comparativo esta en la receta de mezcla, no en las metricas.

## Limitaciones y advertencias

- La propia model card lo declara un artefacto de investigacion para reproducir LinMix, no un modelo de proposito general; no deberia usarse como asistente en produccion.
- Ausencia total de instruction tuning, RLHF o DPO: no sigue instrucciones de forma fiable y no tiene plantilla de chat.
- Presupuesto de entrenamiento reducido (32B tokens), lo que implica una calidad de lenguaje y un conocimiento factual muy inferiores a los de modelos de su escala entrenados con billones de tokens.
- Solo ingles; cualquier uso en castellano u otros idiomas carece de soporte y degradara la calidad.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, agravado por la falta de alineacion y por la procedencia web de los datos.
- Sesgos heredados de Common Crawl y del pool DCLM, sin filtrado ni mitigacion documentados en la informacion disponible.
- Riesgo de sobreajuste de la mezcla a los benchmarks objetivo: los pesos de dominio se optimizaron contra HellaSwag y PIQA, por lo que las evaluaciones en esas tareas no son una medida neutral de capacidad general.
- Longitud de contexto no documentada; conviene tratarla como desconocida y validarla empiricamente antes de cualquier uso con prompts largos.
- Licencia MIT para los pesos, pero los datos subyacentes estan sujetos a CC-BY-4.0 (atribucion) y a los terminos de uso de Common Crawl, que pueden imponer obligaciones adicionales en un uso comercial.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que anade trabajo si se quiere desplegar en hardware limitado.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la ficha, por lo que no existen informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-288domains-dirichlet-exponential-hellaswagpiqa
- Modelo proxy del enjambre Dirichlet (60M): https://huggingface.co/credible-ai/olmo2-60M-288domains-dirichlet
- Dataset de entrenamiento (WebOrganizer/Corpus-200B): https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool de origen DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo de LinMix: https://github.com/credibleai/linmix
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de `Olmo2ForCausalLM` en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de HuggingFace.
