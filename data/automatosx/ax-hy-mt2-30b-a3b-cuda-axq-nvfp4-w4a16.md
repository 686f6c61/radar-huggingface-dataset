# AutomatosX/AX-Hy-MT2-30B-A3B-CUDA-AXQ-NVFP4-W4A16

## Resumen

AX-Hy-MT2-30B-A3B-CUDA-AXQ-NVFP4-W4A16 es una cuantizacion de desarrollo del modelo de traduccion tencent/Hy-MT2-30B-A3B, publicada por AutomatosX mediante su toolkit propio AXQuant. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 30.064.725.888 parametros totales (aproximadamente 30B) y, segun la nomenclatura "A3B", del orden de 3B de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible.

La particularidad de este checkpoint es el esquema de cuantizacion NVFP4 W4A16: los pesos elegibles (atencion de lenguaje, MLP densa, expertos enrutados y expertos compartidos) se almacenan en formato E2M1 de 4 bits con escalas de bloque E4M3FN de tamano 16 y una escala global inversa en FP32, mientras que las activaciones permanecen en BF16. No se aplica AWQ ni cuantizacion de activaciones. El paquete usa el formato publico compressed-tensors NVFP4 y esta serializado con el backend torch-cuda.

Es relevante ahora porque permite ejecutar un modelo de traduccion de 30B en hardware CUDA con una huella de pesos de aproximadamente 17,6 GB, lo que reduce los requisitos de VRAM frente al checkpoint BF16 original. No obstante, el propio autor advierte de que se trata de evidencia de desarrollo, no de un certificado de calidad, y que el paquete sera reconstruido con una version mejorada de AXQuant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Hy v3, tag hy_v3); detalles internos no disponibles |
| Parametros totales | 30.064.725.888 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos E2M1 4 bits, escalas de bloque E4M3FN de 16, escala global inversa FP32, activaciones BF16); formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4), serializacion torch-cuda |
| Tamano del repositorio | 17,6 GB |
| Precision de capas protegidas | Norms, token embeddings, LM head, router y expert_bias en precision del modelo fuente |
| Tensores MTP | Ausentes en este checkpoint |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de la familia Hy v3, orientado a traduccion automatica. La informacion disponible no detalla el numero de capas, la dimension oculta, el numero de expertos por capa ni la estrategia de enrutamiento. Tampoco se especifican los datos de entrenamiento del modelo original (numero de tokens, composicion del corpus, idiomas de origen) ni si se aplicaron fases de RLHF o DPO. Todo ello debe consultarse en la model card de tencent/Hy-MT2-30B-A3B.

La innovacion tecnica de este checkpoint es exclusivamente la cuantizacion. AXQuant aplica un esquema RTN (round-to-nearest) de NVFP4 sobre las matrices elegibles, manteniendo en precision original las capas sensibles: normalizaciones, embeddings de tokens, cabeza de lenguaje, router y sesgos de expertos. Las activaciones no se cuantizan y permanecen en BF16, de modo que el ahorro de memoria proviene solo de los pesos. El checkpoint no incluye tensores MTP (multi-token prediction) y el autor no ha medido la calidad de traduccion resultante, por lo que no se reclama paridad con el BF16 original ni se reproducen los benchmarks del modelo fuente.

## Capacidades

- Traduccion automatica de texto (pipeline_tag: translation), heredada del modelo base Hy-MT2.
- Generacion de texto condicionada, ya que el modelo se expone con la tarea text-generation en transformers.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue como servicio de inferencia.
- Capacidad multilingue: presumible por la funcion de traduccion del modelo base, pero los idiomas concretos no estan disponibles en la informacion.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles en la informacion.
- Modo thinking explicito: no disponible en la informacion.

## Casos de uso

- Traduccion por lotes de documentacion tecnica: el modelo puede procesar lotes de documentos en un servidor con GPU CUDA aprovechando la reduccion de peso a 17,6 GB, lo que permite mantener varias instancias o lotes grandes en memoria frente al checkpoint BF16.
- Servicio de traduccion en tiempo real: al ser un MoE con activacion dispersa (segun la nomenclatura A3B), el coste computacional por token es menor que el de un denso de 30B, lo que resulta adecuado para APIs de traduccion con latencia moderada.
- Localizacion de interfaces y contenido web: integrable en pipelines de CI/CD que traduzcan cadenas de recursos antes de cada despliegue, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Traduccion de soporte al cliente: util para adaptar conversaciones y articulos de ayuda a otros idiomas, siempre que se valide la calidad porque el autor no ha medido la degradacion frente al BF16.
- Prototipado e investigacion en hardware CUDA de gama alta: el formato NVFP4 permite evaluar el modelo en GPUs con soporte de tipos de 4 bits y compressed-tensors sin necesidad de un nodo multi-GPU de gran memoria.
- Evaluacion comparativa de esquemas de cuantizacion: al existir packs hermanos en MLX MXFP4 y MXFP8, este checkpoint sirve para contrastar la calidad de NVFP4 frente a otras precisiones en la misma tarea de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la calidad de traduccion no fue medida y que el paquete no repite las cifras del checkpoint BF16 original.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 17,6 GB, por lo que los pesos NVFP4 caben en GPUs con 24 GB o mas, dejando margen para cache KV y activaciones BF16; en GPUs de 16 GB el margen es muy ajustado y depende de la longitud de contexto.
- GPU recomendadas: NVIDIA H100, A100 (80 GB) y L40S para despliegues de produccion con contexto largo; RTX 4090 (24 GB) para pruebas y cargas moderadas.
- Compatibilidad consumer: si en GPUs de 24 GB como la RTX 4090; en GPUs de 16 GB o menos no se garantiza por el peso de los pesos mas estados de inferencia.
- Opciones de despliegue: transformers con el formato compressed-tensors NVFP4 y backend torch-cuda; vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion para este formato concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Hy-MT2-30B-A3B-CUDA-AXQ-NVFP4-W4A16 | 30,06B totales | no disponible | NVFP4 W4A16 | Apache 2.0 | Checkpoint de desarrollo, calidad de traduccion no medida |
| tencent/Hy-MT2-30B-A3B (base) | 30,06B totales | no disponible | BF16 | Apache 2.0 | Referencia de calidad; mayor huella de memoria |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4 | 30,06B totales | no disponible | MXFP4 | Apache 2.0 | Variante para Apple Silicon |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8 | 30,06B totales | no disponible | MXFP8 | Apache 2.0 | Variante para Apple Silicon con mayor precision |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo y no como certificado de calidad; no se ha medido la calidad de traduccion ni la paridad con el BF16 original.
- El repositorio sera reconstruido con una version mejorada de AXQuant y reemplazado por una nueva revision; conviene fijar un commit concreto si se depende de los ficheros actuales.
- No incluye tensores MTP, por lo que no puede aprovechar decodificacion multi-token especulativa del modelo fuente.
- Las activaciones permanecen en BF16 y no hay cuantizacion de activaciones, de modo que el ahorro de memoria se limita a los pesos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion; deben evaluarse de forma independiente antes de produccion.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingues o con contexto largo sin consultar el modelo base.
- Compatibilidad de tooling: el formato NVFP4 de compressed-tensors puede no estar soportado por todos los motores de inferencia; verificar vLLM/TGI antes de adoptarlo.
- Licencia Apache 2.0 permite uso comercial, pero las garantias sobre calidad del resultado cuantizado recaen en el integrador.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-CUDA-AXQ-NVFP4-W4A16
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Pack hermano MLX MXFP4: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4
- Pack hermano MLX MXFP8: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP8
- Revision del modelo base referenciada: commit `d3ead4dba61c09aac60a261a96ad1df3e705febb`
