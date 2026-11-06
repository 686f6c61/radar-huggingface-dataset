# sarweshbarnwal/CS781-Legal-Models

## Resumen

CS781-Legal-Models es un repositorio maestro publicado en Hugging Face por Sarwesh Barnwal, estudiante del curso CS-781 (Deep Learning for Natural Language Processing) del IIT Kanpur bajo la supervision del profesor Ashutosh Modi. No se trata de un unico modelo, sino de un hub que agrupa cuatro modelos fundacionales de tipo decoder-only entrenados desde cero sobre sentencias del Tribunal Supremo y de los Tribunales Superiores de la India, junto con una coleccion de adaptadores PEFT y artefactos de evaluacion organizados por fases del proyecto capstone.

El objetivo del proyecto es abordar las tareas del benchmark IL-TUR (Indian Legal Text Understanding and Reasoning) bajo una restriccion estricta: no se permite el uso de pesos preentrenados comerciales ni de checkpoints open source de terceros como BERT, LLaMA-3 o Mistral. Por tanto, los cuatro backbones (entre 109,5M y 153,9M de parametros) fueron preentrenados integramente desde cero, lo que los convierte en modelos de nicho con un dominio muy acotado al ingles juridico indio y con contextos maximos de 1024 a 1536 tokens.

Su relevancia actual es fundamentalmente academica y metodologica: documenta de forma explicita la aplicacion de tecnicas PEFT poco habituales (LoRMA multiplicativo, QLoRA, AdaLoRA, Houlsby) y de destilacion de conocimiento entre modelos, ademas de servir como referencia reproducible para investigacion en NLP juridico de bajo presupuesto computacional. No obstante, el repositorio no incluye model card publica visible en la busqueda, tiene cero descargas y cero likes, y su uso en produccion no esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (cuatro variantes: Deep LLaMA, Wide Mistral, Statutory MHA y Capacity Boundary) |
| Parametros totales | 109,5M (model3), 134,7M (model1), 136,2M (model2), 153,9M (model4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (model1, model3, model4); 1536 tokens (model2) |
| Tipos de cuantizacion | No disponible (el repositorio incluye adaptadores QLoRA, pero no se documentan formatos cuantizados publicados) |
| Idiomas soportados | Ingles (dominio juridico indio) |
| Licencia | other (licencia no estandar; consultar terminos del repositorio) |
| Formato de pesos | safetensors (adaptadores PEFT y checkpoints); el repositorio usa Xet para almacenamiento |

## Arquitectura y entrenamiento

Los cuatro modelos fundacionales son transformers decoder-only causales con variaciones deliberadas de diseno para explorar el compromiso entre profundidad, anchura y capacidad. El model1 (134,7M) emplea 16 capas con d_model=768, 12 cabezas de atencion y 4 cabezas KV (GQA 3:1), RMSNorm y FFN SwiGLU. El model2 (136,2M) apuesta por una arquitectura mas ancha: 12 capas, d_model=896, 14 cabezas Q y 7 KV (GQA 2:1), con contexto extendido a 1536 tokens. El model3 (109,5M) usa 12 capas, d_model=768 y atencion multi-cabeza completa sin comparticion (12/12), orientado a precision sintactica. El model4 (153,9M) combina 14 capas, d_model=896, atencion completa 14/14 y embeddings atados, actuando como limite superior de capacidad.

El preentrenamiento se realizo desde cero exclusivamente sobre sentencias del Tribunal Supremo y de los Tribunales Superiores de la India, en sesiones duales de Kaggle con GPU T4. Sobre estos backbones se aplican adaptadores PEFT en ocho variantes por fase: full fine-tuning, LoRMA multiplicativo obligatorio (segun Bihany, Patel y Modi, 2025, con parametros entrenables inferiores al 1,5 % y matriz B inicializada a cero para garantizar mapeo identidad en el paso 0), QLoRA, AdaLoRA con perdida margin-MSE, adaptadores Houlsby y destilacion de conocimiento obligatoria del model4 (153,9M) al model3 (109,5M) mediante una perdida combinada de entropia cruzada dura (0,5), KL divergence con temperatura (0,4·T²) y perdida coseno sobre proyeccion de representaciones (0,1).

## Capacidades

- Generacion de texto causal en ingles juridico indio, orientada a tareas de comprension y redaccion legal.
- Recuperacion de casos previos (Prior Case Retrieval, Phase 7), incluyendo variantes con recuperacion densa hibrida BM25 + embeddings.
- Resumen abstractivo de documentos juridicos (Phase 6), con variantes jerarquicas para textos largos.
- Identificacion de estatutos legales (Legal Statute Identification, Phase 5), incluyendo pooling jerarquico y clasificacion multi-etiqueta.
- Prediccion de resultados judiciales (Court Judgment Prediction, Phase 4).
- Prediccion de roles retoricos en sentencias (Phase 3) y reconocimiento de entidades legales (L-NER, Phase 2).
- Soporte de adaptadores PEFT multiples (LoRA, QLoRA, AdaLoRA, LoRMA, Houlsby) sobre un mismo backbone congelado.
- Destilacion de conocimiento entre modelos del propio hub.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Investigacion academica en NLP juridico: el hub permite reproducir el benchmark IL-TUR con modelos entrenados desde cero, util para comparar tecnicas PEFT (LoRMA frente a LoRA, QLoRA o AdaLoRA) bajo restricciones de computo equivalentes a dos T4.
- Recuperacion de precedentes en sistemas de asistencia juridica: la variante Phase_7/sub07 con recuperacion hibrida BM25 + densa puede integrarse en un motor de busqueda de jurisprudencia para despachos que operen exclusivamente con corpus indios en ingles.
- Resumen automatico de sentencias para revision humana: los adaptadores de Phase_6, incluida la variante jerarquica, permiten condensar documentos largos en resumentes estructurados, aunque limitados a fragmentos de 1024-1536 tokens.
- Clasificacion y etiquetado de entidades legales en pipelines de digitalizacion: el modelo L-NER de Phase_2 puede usarse para anotar automaticamente nombres de partes, tribunales, fechas y articulos en corpus escaneados y transcritos.
- Prototipado docente: el tamano reducido (110-154M) permite ejecutar fine-tuning completo o con adaptadores en GPUs de consumo, lo que lo hace adecuado para cursos y talleres sobre PEFT y destilacion.
- Prediccion de resultados judiciales como herramienta exploratoria: la tarea CJPE de Phase_4 puede emplearse en estudios estadisticos sobre decisiones judiciales, siempre con supervision experta y sin uso decisionario automatizado.
- Identificacion de estatutos aplicables: la tarea LSI de Phase_5 puede asistir en la seleccion preliminar de secciones legales relevantes para un caso, como paso previo a la revision por un jurista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia el benchmark IL-TUR (arXiv:2407.05399) como marco de evaluacion y menciona archivos de evaluacion CodaBench sincronizados, pero no se proporcionan metricas numericas en la informacion accesible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44-0,62 GB para los backbones (110-154M parametros), sin contar overhead de activaciones ni KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,22-0,31 GB para los pesos.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 0,11-0,16 GB; con 4 bits, aproximadamente 0,06-0,08 GB. Estimaciones teoricas a partir del numero de parametros, no verificadas en la documentacion.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia; el entrenamiento documentado se realizo en sesiones duales de Kaggle con T4 (16 GB cada una).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia con llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su publicacion.
- Opciones de despliegue: la libreria declarada es PEFT sobre PyTorch; no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama. El despliegue requeriria cargar el backbone base y aplicar el adaptador correspondiente con la API de PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CS781 model1-4 | 109,5M-153,9M | 1024-1536 | Desde cero, corpus juridico indio | other | Hugging Face, 0 descargas |
| Legal-BERT | ~110M | 512 | Preentrenado en corpus legal (no indio) | Apache 2.0 | Ampliamente disponible |
| Legal-PEGASUS | ~568M | 1024 | Preentrenado y afinado para resumen legal | MIT | Hugging Face |
| InLegalBERT | ~110M | 512 | Preentrenado en corpus legal indio | No disponible en la informacion | Hugging Face |

La comparacion es orientativa: los tres primeros son modelos encoder o encoder-decoder, mientras que CS781 son decoder-only causales, por lo que la equivalencia funcional es parcial. CS781 se distingue por el entrenamiento estrictamente desde cero y por el enfasis en adaptadores PEFT, pero carece de la validacion externa y la adopcion de los modelos legales establecidos.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1024-1536 tokens), insuficiente para sentencias completas, que suelen superar ampliamente esa longitud; las variantes jerarquicas mitigan pero no eliminan el problema.
- Entrenamiento limitado a un unico dominio y una unica jurisdiccion (India, ingles), con riesgo alto de degradacion fuera de ese corpus.
- Modelos de muy pequeno tamano (110-154M), con capacidad de razonamiento y conocimiento factual limitada en comparacion con LLM de miles de millones de parametros.
- Riesgo elevado de alucinacion en generacion libre, especialmente en citas de articulos, secciones o precedentes; no debe usarse sin verificacion humana.
- Sesgos potenciales derivados del corpus de sentencias: sobrerrepresentacion de ciertos tribunales, materias y periodos historicos, y posibles sesgos de genero, casta o religion presentes en los textos originales.
- Licencia "other" no estandar: es imprescindible revisar los terminos antes de cualquier uso comercial; la informacion disponible no aclara si se permite.
- Ausencia de model card publica visible y de resultados de benchmarks verificables; el repositorio tiene cero descargas y cero likes, sin validacion externa conocida.
- El repositorio ocupa 401,1 GB, lo que implica costes de almacenamiento y descarga considerables para obtener todos los checkpoints y adaptadores.
- No se documenta soporte de tool calling, agentes ni despliegue en servidores de inferencia de alto rendimiento, lo que limita su integracion en produccion.
- Uso previsto fundamentalmente academico y de investigacion; no apto para asesoramiento juridico automatizado ni toma de decisiones judiciales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sarweshbarnwal/CS781-Legal-Models
- Arbol de ficheros (carpeta Phase_2): https://huggingface.co/sarweshbarnwal/CS781-Legal-Models/tree/main/Phase_2
- Paper del benchmark IL-TUR: https://arxiv.org/abs/2407.05399
- Referencia LoRMA (Bihany, Patel y Modi, 2025): no disponible enlace directo en la informacion proporcionada
- Repositorio de codigo, demo o blog del proyecto: no disponible
