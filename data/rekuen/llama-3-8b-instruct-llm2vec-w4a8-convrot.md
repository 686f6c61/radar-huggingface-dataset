# rekuen/Llama-3-8B-Instruct-LLM2Vec-W4A8-ConvRot

## Resumen

Este repositorio contiene el codificador de texto (text encoder) LLM2Vec construido sobre Meta Llama 3 8B Instruct, con los adaptadores MNTP y supervisado ya fusionados en los pesos base y posteriormente cuantizados a W4A8. Es, por tanto, un modelo de embeddings bidireccional de 8 000 millones de parametros, no un modelo generativo: su salida son vectores de 4096 dimensiones obtenidos por mean pooling de las representaciones internas. Lo publica el usuario rekuen (rekuen) como artefacto derivado, sin vinculo con Meta, McGill NLP ni NVIDIA.

Su relevancia es muy concreta: es exactamente el codificador que condicionan Kimodo y ARDY, dos proyectos de NVIDIA Labs para generacion de movimiento humano (text-to-motion). El autor empaqueta en un unico repositorio lo que normalmente exige cargar el modelo base mas dos adaptadores LoRA de LLM2Vec, y ademas lo cuantiza para reducir el coste de memoria. El resultado ocupa 5,0 GB en el repositorio, frente a los aproximadamente 16 GB que requeriria el mismo ensamblaje en bf16.

La cuantizacion es la innovacion principal: formato asimetrico `asym_w4a8_int8` (pesos int4, activaciones int8) con rotacion ConvRot y libro de codigos Lloyd-Max. La fidelidad declarada por el autor es alta: similitud coseno media y minima de 0,986 frente al ensamblaje sin cuantizar, medida sobre seis prompts de movimiento. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la fecha de creacion indicada es 2026-10-06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Llama 3, adaptado a bidireccional para embeddings por LLM2Vec (`LlamaBiModel`) |
| Parametros totales | 8 000 millones (8B), heredados del modelo base Meta Llama 3 8B Instruct |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en el modelo base; LLM2Vec usa `max_length` 512 por defecto para el pooling |
| Tipos de cuantizacion | `asym_w4a8_int8` (pesos int4, activaciones int8) con rotacion ConvRot y codebook Lloyd-Max; group size 16; rotation group size 256 |
| Idiomas soportados | No especificado en la model card de esta variante; el modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | Meta Llama 3 Community License (misma que el modelo base); los adaptadores LLM2Vec son MIT |
| Formato de pesos | Pesos cuantizados `asym_w4a8_int8`; embeddings de tokens y todas las normas se mantienen en bf16. El formato de fichero concreto no se explicita en la model card |

## Arquitectura y entrenamiento

El punto de partida es Meta Llama 3 8B Instruct, un transformer decoder-only de 32 capas. LLM2Vec lo convierte en codificador bidireccional: sustituye la mascara causal por atencion bidireccional (`LlamaBiModel`) y entrena en dos fases. La primera, MNTP (Masked Next Token Prediction), adapta el modelo a representaciones bidireccionales. La segunda es un ajuste supervisado sobre pares de similitud. En este repositorio ambos adaptadores estan fusionados en los pesos base en bf16 y el resultado se cuantiza una sola vez, en lugar de cuantizar base y adaptadores por separado.

La cuantizacion afecta a 224 proyecciones de atencion y MLP repartidas por las 32 capas. Se mantienen en bf16 los embeddings de tokens y todas las capas de normalizacion, que son precisamente las mas sensibles a la perdida de precision. El esquema es asimetrico: pesos a 4 bits con activaciones a 8 bits, group size 16. La rotacion ConvRot y el libro de codigos Lloyd-Max se aplican para reducir el error de cuantizacion, presumiblemente sobre valores atipicos de los canales. No se documentan ni el numero de tokens de entrenamiento ni la composicion del dataset, porque este repositorio no entrena: solo ensambla y comprime artefactos ya publicados.

Un detalle funcional critico aparece en la model card: LLM2Vec solo envuelve cada prompt con la cabecera de chat de Llama 3 si el campo `_name_or_path` de la configuracion del modelo es exactamente `meta-llama/Meta-Llama-3-8B-Instruct`. Si no se ajusta ese campo tras la carga, la cabecera se omite sin lanzar ningun error y los vectores resultantes no son los que vieron Kimodo y ARDY durante su entrenamiento.

## Capacidades

- Generacion de embeddings de texto de 4096 dimensiones mediante mean pooling sobre las representaciones internas.
- Codificacion bidireccional, por lo que cada token atiende al contexto completo a izquierda y derecha (a diferencia del Llama 3 Instruct original, que es causal).
- Similitud semantica y recuperacion de informacion: adecuado para retrieval denso, ya que la fase supervisada de LLM2Vec esta orientada a tareas de similitud.
- Condicionamiento de modelos de generacion de movimiento humano (text-to-motion) en los stacks Kimodo y ARDY de NVIDIA Labs.
- Capacidades multilingues heredadas del modelo base en los ocho idiomas declarados por Meta; no verificadas para esta variante cuantizada.
- No soporta tool calling ni function calling en su uso previsto: es un codificador, no un modelo de chat generativo con agente.
- No soporta agentes ni razonamiento multi-paso, salvo que se reutilice el modelo base sin el parche bidireccional de LLM2Vec.
- No dispone de modo thinking, vision ni audio.
- El pooling se hace con media de todos los tokens; las instrucciones del prompt se ignoran en la configuracion por defecto.

## Casos de uso

- Generacion de movimiento humano a partir de texto: es el caso de uso de diseno. Se pasa el prompt de texto por el codificador, se obtiene un vector de 4096 dimensiones y ese vector alimenta como condicionamiento a Kimodo o ARDY. La cuantizacion W4A8 reduce la huella de memoria del condicionador, lo que permite mantener el generador de movimiento y el codificador en la misma GPU.
- Busqueda semantica y retrieval denso sobre corpus de documentos: los embeddings de 4096 dimensiones se indexan en una base vectorial y se consultan por similitud coseno. La naturaleza bidireccional del modelo captura mejor el contexto completo de cada pasaje que un encoder causal.
- RAG con presupuesto de VRAM ajustado: al ocupar unos 5 GB en disco en lugar de unos 16 GB, permite desplegar el codificador de recuperacion junto al modelo generador en una sola GPU consumer, en lugar de repartir la carga entre dos dispositivos.
- Deduplicacion y clustering de grandes volumenes de texto: los vectores permiten agrupar documentos por similitud sin necesidad de fine-tuning adicional, ya que el adaptador supervisado de LLM2Vec esta entrenado para producir espacios de representacion comparables.
- Filtrado y curacion de datasets de entrenamiento: calcular similitud entre ejemplos permite descartar duplicados casi exactos y detectar contaminacion entre conjuntos de entrenamiento y evaluacion.
- Recomendacion basada en contenido textual: representar el catalogo y el historial del usuario en el mismo espacio vectorial para ordenar candidatos por afinidad semantica.
- Evaluacion de similitud semantica de pares de frases (STS): el modelo sirve como extractor de caracteristicas congelado para tareas de correlacion de similitud, sin entrenar ninguna capa adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB) en la informacion disponible. El unico dato de rendimiento proporcionado es la fidelidad de la cuantizacion:

| Metrica | Valor |
|---|---|
| Similitud coseno media frente a bf16 sin cuantizar | 0,986 |
| Similitud coseno minima frente a bf16 sin cuantizar | 0,986 |
| Prompts de evaluacion | 6 prompts de movimiento |
| Dimension del vector comparado | 4096 |

No se dispone de comparacion directa con los adaptadores LLM2Vec originales en tareas de retrieval o STS, por lo que no es posible cuantificar la perdida de calidad en esos escenarios.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en el formato W4A8 publicado. Los pesos int4 ocupan del orden de 4,3 GB y hay que sumar los embeddings de tokens y todas las normas, que se mantienen en bf16 (unos 1,05 GB solo para la matriz de embeddings de 128 256 x 4096).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia poder cargar el modelo en esta cuantizacion. Una RTX 3060 de 12 GB, RTX 4060 Ti de 8/16 GB, RTX 4070 o superior son suficientes para el codificador aislado. Para ejecutarlo junto a un generador de movimiento se recomienda 24 GB (RTX 3090, RTX 4090) o GPUs de datacenter A100/H100.
- Cabe en GPU consumer: si, siempre que se disponga de al menos 8 GB de VRAM y de kernels compatibles con el formato.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, porque estos motores no implementan el formato `asym_w4a8_int8` con rotacion ConvRot. El despliegue esperado es mediante el codigo de LLM2Vec, Kimodo o ARDY, cargando los pesos con las rutinas que entiendan ese esquema. La model card no documenta ningun runtime especifico.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por embedding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rekuen/Llama-3-8B-Instruct-LLM2Vec-W4A8-ConvRot | 8B | 512 tokens efectivos para pooling | W4A8 con ConvRot | Llama 3 Community | Repositorio publico, 0 descargas |
| McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised | 8B | 512 tokens para pooling | bf16 / fp16 | Llama 3 Community + MIT | Publico, ampliamente usado |
| McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp | 8B | 512 tokens para pooling | bf16 / fp16 | Llama 3 Community + MIT | Publico |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8192 tokens | bf16 / fp16, GGUF comunitarios | Llama 3 Community | Publico |

La diferencia practica frente a los adaptadores originales es el consumo de memoria: esta variante ocupa 5,0 GB en repositorio frente a los aproximadamente 16 GB del ensamblaje en bf16, a cambio de una perdida de fidelidad medida de 0,014 en similitud coseno (0,986 en lugar de 1,0). Frente a Llama 3 8B Instruct sin LLM2Vec, la diferencia es funcional: aqui la atencion es bidireccional y la salida es un vector agregado, no tokens generados.

## Limitaciones y advertencias

- Es un codificador, no un modelo de chat: no genera texto. Usarlo como modelo conversacional dara resultados incorrectos.
- La cuantizacion es no oficial y no esta validada por Meta, McGill NLP ni NVIDIA. No hay garantia de mantenimiento ni de soporte.
- El formato `asym_w4a8_int8` con ConvRot no es un estandar de la industria: sin kernels especificos, el modelo no se puede cargar en las herramientas habituales (llama.cpp, vLLM, Ollama, TGI).
- Riesgo operativo documentado por el propio autor: si el campo `_name_or_path` de la configuracion no es exactamente `meta-llama/Meta-Llama-3-8B-Instruct`, LLM2Vec omite la cabecera de chat sin avisar. Los embeddings resultantes seran silenciosamente distintos de los que usan Kimodo y ARDY, degradando el condicionamiento sin mensaje de error.
- La evaluacion de fidelidad se limita a seis prompts de movimiento y a la similitud coseno de los vectores agregados. No se ha medido el impacto en tareas de retrieval, STS o clasificacion.
- Sesgos conocidos: no se documenta ningun analisis de sesgo para esta variante. Hereda los sesgos del corpus de entrenamiento de Llama 3 8B Instruct de forma no auditada.
- Riesgo de alucinacion: no aplica directamente, porque el modelo no genera texto. Si se reutiliza el modelo base sin el parche bidireccional, aplican los riesgos habituales de Llama 3 8B Instruct.
- Limitaciones de contexto: el pooling por defecto se hace con `max_length` 512, por lo que textos mas largos se truncan salvo que se modifique la configuracion. El modelo base soporta 8192 tokens, pero LLM2Vec esta configurado para 512.
- Limitaciones de idioma: no se han verificado capacidades multilingues en esta variante cuantizada.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, que exige mantener la atribucion "Built with Meta Llama 3" y cumplir la politica de uso aceptable. Los despliegues con mas de 700 millones de usuarios activos mensuales requieren una licencia comercial aparte de Meta.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros. La fecha de creacion declarada (2026-10-06) es posterior a la de esta ficha, lo que sugiere un artefacto reciente o un error de metadatos.
- El repositorio ocupa 5,0 GB, ligeramente por encima de la estimacion teorica de los pesos int4, probablemente por artefactos auxiliares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rekuen/Llama-3-8B-Instruct-LLM2Vec-W4A8-ConvRot
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Adaptador MNTP de LLM2Vec: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp
- Adaptador supervisado de LLM2Vec: https://huggingface.co/McGill-NLP/LLM2Vec-Meta-Llama-3-8B-Instruct-mntp-supervised
- Repositorio Kimodo (NVIDIA Labs): https://github.com/nv-tlabs/kimodo
- Repositorio ARDY (NVIDIA Labs): https://github.com/NVlabs/ardy
- Licencia Meta Llama 3: incluida en el repositorio como `LICENSE`, con `USE_POLICY.md` y `Notice`

Nota: los resultados de busqueda web devueltos para este modelo no contienen informacion relevante; corresponden a especificaciones del iPhone 12 mini y no guardan relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales.
