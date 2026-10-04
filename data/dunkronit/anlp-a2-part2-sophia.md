# DunkRonit/anlp-a2-part2-sophia

## Resumen

anlp-a2-part2-sophia es un transformer decoder-only denso de 17.011.584 parametros, entrenado desde cero por el usuario DunkRonit (identificado como estudiante de IIIT Hyderabad por la URL del proyecto en Weights & Biases) como parte de un trabajo academico de la asignatura ANLP. El modelo no pretende ser un asistente utilizable, sino un artefacto de investigacion cuyo proposito es comparar el optimizador Sophia, implementado desde cero, frente a alternativas dentro del mismo montaje experimental.

El entrenamiento se realizo sobre el split de entrenamiento del corpus browndw/human-ai-parallel-corpus, con un total de 41.680.896 tokens procesados (1 epoch sobre dicho split). Es, por tanto, un modelo de escala muy reducida: alrededor de 17 millones de parametros, dos ordenes de magnitud por debajo de un GPT-2 small y muy lejos de los modelos de 7B que dominan el ecosistema open source actual.

Su relevancia es limitada fuera del ambito del experimento: no hay model card detallada, no se publican benchmarks, no se especifica licencia, no tiene pipeline asignado y acumula 0 descargas y 0 likes. Resulta interesante unicamente como referencia metodologica para quien investigue optimizadores (Sophia frente a AdamW) en regimen de bajo computo, o como caso de estudio de reproducibilidad de entrenamientos desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (no MoE) |
| Parametros totales | 17.011.584 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Volumen de entrenamiento | 41.680.896 tokens (1 epoch sobre el split de entrenamiento) |
| Dataset | browndw/human-ai-parallel-corpus |
| Optimizador | Sophia, implementado desde cero |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso, sin mezcla de expertos ni componentes de estado recurrente (SSM). El autor no publica el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud de contexto soportada, por lo que no es posible detallar la configuracion interna mas alla de la familia arquitectonica y el recuento de parametros. El checkpoint se carga mediante la clase personalizada `Transformer.from_pretrained("DunkRonit/anlp-a2-part2-sophia")` del repositorio de la asignatura (`src.part2.model.Transformer`), lo que implica que la implementacion del modelo vive en codigo externo al repositorio de HuggingFace.

El entrenamiento consumio 41.680.896 tokens sobre el split de entrenamiento de browndw/human-ai-parallel-corpus, un corpus paralelo de texto humano y generado por IA, en una unica pasada. La innovacion tecnica que motiva el artefacto es el uso de Sophia, un optimizador de segundo orden aproximado que utiliza estimaciones de la matriz de Hessiana para precondicionar las actualizaciones y que se implemento desde cero en este proyecto. No hay constancia de fases de ajuste fino con RLHF, DPO o instrucciones, ni de tecnicas de decodificacion especulativa, atencion lineal o contextos extendidos.

## Capacidades

- Generacion de texto en ingles: continuacion de texto autoregresiva basica, limitada a la distribucion del corpus de entrenamiento.
- Modelado de lenguaje a pequena escala: el modelo es utilizable para calcular perplexity y para experimentos de escalado controlados.
- Capacidad de comparacion de optimizadores: sirve como sujeto de prueba para medir el efecto de Sophia frente a AdamW en igualdad de condiciones.
- Tool calling: no soportado (no hay entrenamiento con plantillas de herramientas ni formato de function calling).
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo thinking o cadena de razonamiento explicita: no disponible.
- Multilinguismo: limitado a ingles segun los metadatos del repositorio.
- Vision, audio u otras modalidades: no soportadas.

## Casos de uso

- Reproduccion de experimentos de optimizacion: el modelo permite replicar la comparativa entre Sophia y AdamW bajo la misma arquitectura, dataset y presupuesto de tokens, y verificar las curvas de perdida publicadas en el run de Weights & Biases.
- Prueba de humo (smoke test) de pipelines de entrenamiento: al ser un modelo de 17M parametros y 0,1 GB, un ciclo completo de entrenamiento o de evaluacion cabe en pocos minutos, lo que permite validar codigo de tokenizacion, carga de datos y guardado de checkpoints antes de lanzar ejecuciones caras.
- Validacion de infraestructura de serving: resulta util para comprobar que un contenedor de inferencia, un wrapper de API o una capa de autenticacion funcionan de extremo a extremo sin consumir GPU, aunque la carga requiere la clase personalizada del repositorio de la asignatura.
- Material didactico: sirve para ilustrar de forma tangible como se comporta un transformer decoder-only pequeno entrenado desde cero, incluyendo sus fallos de coherencia y su tendencia a repetir.
- Estudio de tokenizacion y analisis de corpus: permite medir el efecto del vocabulario y de la composicion del dataset human-ai-parallel-corpus sobre la perdida, ya que solo se ha visto 1 epoch de 41,7M de tokens.
- Linea base para ablaciones academicas: cualquier estudiante que quiera comparar una variante arquitectonica o de optimizador puede usar este checkpoint como referencia de partida sin necesidad de entrenar desde cero.
- Generacion exploratoria de texto de dominio restringido: util unicamente para inspeccionar cualitativamente que tipo de texto produce un modelo entrenado sobre un corpus paralelo humano/IA en ingles, nunca para uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 17.011.584 parametros, sin incluir overhead del runtime): en fp32 unos 68 MB de pesos; en fp16/bf16 unos 34 MB; en int8 unos 17 MB. No se publican checkpoints cuantizados, por lo que estas cifras son estimaciones aritmeticas de memoria de pesos, no configuraciones verificadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente incluso en fp32; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier tarjeta moderna (RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU integradas). Tambien es viable la inferencia exclusiva en CPU, dado el tamano del modelo.
- Opciones de despliegue: la carga esta documentada exclusivamente a traves de la clase personalizada `src.part2.model.Transformer` del repositorio de la asignatura, por lo que vLLM, llama.cpp, Ollama o TGI solo funcionarian si se convierte previamente la arquitectura y se exporta a GGUF o a un formato compatible; no hay constancia de que exista tal conversion.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Comentario |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part2-sophia | 17,0 M | no disponible | no disponible | HuggingFace (0 descargas) | Artefacto academico; requiere codigo externo para cargarse |
| GPT-2 small | 124 M | 1.024 tokens | MIT modificada | Ampliamente distribuido | Referencia habitual como linea base de generacion de texto en ingles |

No se dispone de modelos comparables dentro de la informacion proporcionada. La comparacion con GPT-2 small se incluye unicamente como referencia de escala conocida publicamente; no hay datos que permitan comparar rendimiento entre ambos, ya que este modelo no publica resultados de evaluacion y su arquitectura interna no esta documentada.

## Limitaciones y advertencias

- Ausencia de ajuste por instrucciones: no hay evidencia de RLHF, DPO ni fine-tuning supervisado, por lo que el modelo no sigue ordenes ni mantiene un formato de conversacion.
- Presupuesto de entrenamiento muy reducido: 41,7M de tokens sobre 17M de parametros equivalen a unos 2,5 tokens por parametro, muy por debajo de la relacion 20:1 habitual en las recomendaciones de escalado tipo Chinchilla; cabe esperar un modelo claramente infraentrenado.
- Riesgo elevado de alucinacion y de texto incoherente: al no haberse evaluado, no existe ninguna garantia de calidad factual, coherencia a largo plazo ni ausencia de repeticiones.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar tareas que dependan de entradas largas.
- Idioma unico: solo ingles; no hay soporte de castellano ni de otros idiomas.
- Licencia no declarada: al no publicarse licencia, no puede asumirse permiso para uso comercial; en ausencia de terminos explicitos, los derechos quedan reservados por defecto.
- Dependencia de codigo propietario del proyecto: el checkpoint no es cargable con `transformers` de forma estandar, lo que anula la portabilidad tipica de HuggingFace.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni discusiones, lo que implica ausencia total de verificacion externa.
- Los resultados de la busqueda web realizada no contienen ningun enlace relevante sobre este modelo; los dominios devueltos no guardan relacion con el proyecto y se han descartado.
- No apto para produccion bajo ninguna circunstancia; debe tratarse como un artefacto de laboratorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part2-sophia
- Run de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part2/runs/sophia-781dd7da
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio de la asignatura (referenciado en la model card como origen de `src.part2.model.Transformer`): no disponible
- Paper de Sophia: no disponible en la informacion proporcionada
- Demo o Space: no disponible
