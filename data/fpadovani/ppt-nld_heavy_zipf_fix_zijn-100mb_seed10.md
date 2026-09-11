# fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed10

## Resumen

ppt-nld_heavy_zipf_fix_zijn-100mb_seed10 es un ajuste fino (fine-tuning) del modelo neerlandes goldfish-models/nld_latn_100mb, un transformer tipo GPT-2 de 86.708.736 parametros (unos 86,7 millones) entrenado originalmente sobre aproximadamente 100 MB de texto en neerlandes. El autor del ajuste es el usuario fpadovani, vinculado a la Universidad de Groningen segun la organizacion del proyecto en Weights & Biases, y el entrenamiento se ha realizado con TRL 0.23.0 mediante aprendizaje supervisado (SFT) sobre el modelo base.

El interes de esta ficha es acotado pero claro: se trata de un modelo pequeno, de menos de 100 millones de parametros, pensado para experimentacion academica en generacion de texto en neerlandes, no para produccion general. Su relevancia radica en que forma parte de una familia de experimentos de investigacion (la nomenclatura "ppt", "heavy_zipf", "zijn" y "seed10" sugiere variantes controladas de un mismo pipeline experimental) y en que, por tamano, puede ejecutarse en CPU o en cualquier GPU de consumo sin cuantizacion agresiva.

No se dispone de informacion publicada sobre el conjunto de datos de ajuste, el numero de tokens de entrenamiento, la longitud de contexto efectiva ni resultados de evaluacion. La model card es practicamente la plantilla autogenerada por TRL, con la seccion de citas vacia y un campo de licencia sin especificar ("licence: license"), por lo que cualquier uso comercial deberia considerarse no autorizado hasta que el autor lo aclare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.708.736 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; al ser un modelo de ~87 M de parametros es convertible a int8/int4 mediante herramientas estandar, aunque no se han publicado conversiones oficiales |
| Idiomas soportados | no disponible en los metadatos; el modelo base (`nld_latn_100mb`) esta entrenado sobre neerlandes en escritura latina |
| Licencia | no disponible (la model card indica unicamente `licence: license`, sin texto legal) |
| Formato de pesos | safetensors (repo de 1,4 GB, incluye probablemente pesos en fp32 y optimizador) |
| Modelo base | goldfish-models/nld_latn_100mb |
| Libreria | transformers (compatible con text-generation-inference y endpoints) |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion (metadatos) | 2026-09-10 (fecha anomala en los metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atencion causal, correspondiente a la etiqueta `gpt2` que HuggingFace asigna al repositorio y coherente con la familia de modelos GPT-2 pequenos. Con 86,7 millones de parametros, se situa por debajo de GPT-2 small (124 M) y muy lejos de los modelos actuales de miles de millones de parametros; esto implica una capacidad limitada de razonamiento y de memoria factual, y un uso razonable unicamente en tareas de generacion de texto corto, continuacion de texto y experimentos linguisticos controlados. La libreria declarada es transformers 4.56.2, con tokenizers 0.22.1 y PyTorch 2.11.0.

El ajuste se ha realizado con aprendizaje supervisado (SFT) usando TRL 0.23.0, la libreria de Transformer Reinforcement Learning de HuggingFace. No se documenta el dataset de ajuste, ni el numero de tokens, ni si hubo una fase posterior de RLHF o DPO. Tampoco se describe ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos o arquitecturas hibridas): la model card se limita a la plantilla autogenerada por TRL, con enlace al experimento de Weights & Biases del autor y la seccion de citas sin contenido. La nomenclatura del nombre del modelo ("ppt", "heavy_zipf", "fix_zijn", "100mb", "seed10") apunta a un experimento con semilla fija y a variantes de muestreo del corpus, pero no hay documentacion publica que lo confirme.

## Capacidades

- Generacion de texto autoregresiva en neerlandes, con el pipeline `text-generation` de transformers y soporte de plantillas de chat mediante lista de mensajes `{"role": "user", "content": ...}`.
- Continuacion de texto y generacion condicionada por prompt, el caso de uso tipico de un modelo GPT-2 pequeno ajustado.
- Uso como modelo de investigacion para estudiar efectos de ajuste fino, semillas y sesgos de muestreo del corpus.
- Compatibilidad declarada con text-generation-inference y con endpoints de HuggingFace.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no documentadas y, por tamano y arquitectura, muy limitadas o inexistentes.
- Capacidades multilingues: no documentadas; el modelo base es monolingue (neerlandes).
- Modo "thinking", razonamiento multi-paso o function calling: no disponibles.

## Casos de uso

- Investigacion academica sobre ajuste fino en lenguas de recursos medios: el modelo sirve como punto de comparacion frente al base `goldfish-models/nld_latn_100mb` para medir el efecto del SFT y de la semilla empleada, con un coste computacional minimo (entrenamiento e inferencia en una sola GPU de consumo o incluso en CPU).
- Generacion de texto neerlandes de bajo coste en prototipos: al ocupar menos de 350 MB en fp32 y unas decenas de MB en int4, puede desplegarse en un contenedor pequeno o en un dispositivo embebido para tareas de autocompletado o generacion de frases cortas.
- Filtrado y aumento de datos en neerlandes: usar el modelo para generar continuaciones sinteticas o para puntuar perplejidad de frases en un corpus, aprovechando que su tamano permite procesar grandes volumenes de texto con poco presupuesto de GPU.
- Pruebas de regresion en pipelines de NLP: al ser un modelo publico, reproducible (semilla 10 en el nombre) y ligero, es util como modelo de pruebas en CI para verificar que un pipeline de transformers, TGI o endpoints sigue funcionando tras una actualizacion de versiones.
- Experimentos de linguistica computacional sobre el verbo "zijn" y fenomenos morfosintacticos del neerlandes: el sufijo "zijn" del nombre sugiere un foco en este lema, adecuado para estudios de concordancia y frecuencia lexica con muestreo tipo Zipf.
- Educacion y demostraciones docentes: por su tamano, permite ejecutar ejemplos completos de fine-tuning con TRL y de inferencia en un portatil, sin necesidad de infraestructura en la nube.
- Base para posteriores ajustes especificos: puede servir como punto de partida para fine-tuning adicional en tareas concretas de neerlandes, dado que el coste de reentrenamiento es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni metricas de perplejidad), y no se ha encontrado informacion externa al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en fp32, unos 175 MB en fp16/bf16, unos 90 MB en int8 y unos 45 MB en int4 (solo pesos; hay que anadir la cache KV y el overhead del runtime, tipicamente unas decenas o cientos de MB segun la longitud de secuencia).
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no aprovechara la capacidad de calculo de las GPU de gama alta porque queda limitado por el tamano, no por el computo.
- Cabe en cualquier GPU de consumo, en iGPU y en CPU: es viable ejecutarlo en un portatil, en una Raspberry Pi de gama alta o en un contenedor sin GPU.
- Opciones de despliegue: transformers (pipeline `text-generation`), text-generation-inference, endpoints de HuggingFace, vLLM (funcional pero sobredimensionado para este tamano) y llama.cpp/Ollama si se convierte a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles. Por tamano, en una GPU de consumo la latencia por token deberia ser de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed10 | 86,7 M | no disponible | neerlandes (heredado del base, no confirmado) | no disponible | HuggingFace, 0 descargas |
| goldfish-models/nld_latn_100mb (base) | 86,7 M (mismo tamano de arquitectura) | no disponible | neerlandes | no disponible en la informacion proporcionada | HuggingFace |
| GPT-2 small (referencia de la misma familia) | 124 M | 1024 tokens | ingles | modificada (uso comercial permitido con condiciones) | Ampliamente disponible |
| Modelos neerlandeses pequenos tipo GPT-2 small ajustados | no disponible | no disponible | neerlandes | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay resultados de benchmarks publicados para este ajuste ni para el base, y los resultados de la busqueda web no aportaron fuentes tecnicas relevantes (devolvieron unicamente paginas de ayuda de YouTube, sin relacion con el modelo).

## Limitaciones y advertencias

- Licencia sin especificar: la model card incluye un marcador de posicion (`licence: license`) que no constituye una licencia valida. No debe asumirse permiso de uso comercial ni redistribucion.
- Sin datos de entrenamiento documentados: se desconoce la composicion del dataset de SFT, su procedencia y si contiene contenido con derechos de autor, datos personales o material sesgado.
- Riesgo alto de alucinacion: con 86,7 M de parametros, la memoria factual es muy limitada y las afirmaciones del modelo sobre hechos, fechas o entidades no son fiables.
- Cobertura linguistica restringida: el modelo base esta entrenado sobre neerlandes (`nld_latn`, 100 MB de corpus); el rendimiento en castellano u otros idiomas sera previsiblemente pobre y no esta documentado.
- Limitaciones de contexto: la ventana de contexto no esta confirmada en la informacion disponible; en modelos GPT-2 de este tipo suele ser corta, lo que restringe conversaciones multi-turno y documentos largos.
- Sin verificacion de calidad: cero descargas y cero "likes" en el momento de la consulta, sin evaluaciones externas ni validacion por terceros.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-10) es posterior a la fecha de publicacion de las versiones de librerias declaradas, lo que sugiere desajustes en los metadatos del repositorio.
- Repositorio de 1,4 GB para un modelo de 87 M de parametros: el peso principal es de cientos de MB, por lo que el resto corresponde probablemente a estados del optimizador, lo que no afecta a la inferencia pero si al almacenamiento.
- No apto para produccion critica: sin benchmarks, sin licencia clara y sin documentacion de sesgos, no deberia desplegarse en flujos con impacto sobre usuarios finales sin una evaluacion previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/vqlemm2m
- Los resultados de la busqueda web no aportaron ninguna fuente tecnica relevante sobre este modelo (devolvieron paginas de ayuda de YouTube sin relacion con el mismo); no se dispone por tanto de paper, blog ni demo adicionales.
