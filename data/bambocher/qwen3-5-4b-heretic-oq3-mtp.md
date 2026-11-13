# bambocher/Qwen3.5-4B-heretic-oQ3-mtp

## Resumen

Qwen3.5-4B-heretic-oQ3-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado: parte de los pesos de Qwen3.5-4B (desarrollado por Alibaba Qwen) y los recomprime mediante la herramienta oQ (oMLX v0.7.3) con precision mixta por capas, orientada a ejecucion en Apple Silicon a traves de la libreria MLX. El checkpoint contiene 4.659.865.088 parametros logicos y ocupa 2,8 GB en disco, con un promedio efectivo de 4,814 bits por peso.

El modelo combina tres componentes: el modelo de lenguaje (4,206B parametros), un codificador de vision (0,334B) y una cabeza MTP (Multi-Token Prediction, 0,121B), lo que sugiere que el Qwen3.5-4B original es multimodal y soporta decodificacion especulativa mediante prediccion multi-token. La cuantizacion asigna 3 bits a la mayor parte de los pesos (62,4%), 4 bits a un 22,2%, 5 y 6 bits a fracciones menores y mantiene un 7,5% en BF16, presumiblemente capas sensibles como embeddings o normas.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion mixta poco comun (oQ) que busca preservar calidad en modelos pequenos; por otro, el sufijo "heretic" indica que el checkpoint deriva de una variante "abliterated" o sin censura, lo que tiene implicaciones importantes para su uso en produccion. La model card es extremadamente escueta: no declara licencia, idiomas, pipeline ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + vision + cabeza MTP), inferido de los componentes del checkpoint; detalles arquitectonicos del Qwen3.5-4B original no disponibles |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 3-bit (grupo 64), 4-bit, 5-bit, 6-bit y BF16; promedio efectivo 4,814 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

Desglose de la cuantizacion por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,050 GB / 1,910 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,087 GB / 0,081 GiB |
| Total | 4,660B | 2,804 GB / 2,612 GiB |

Distribucion de bits:

| Formato | Pesos logicos | Porcentaje | Bits/peso efectivos |
|---|---|---|---|
| Affine 3-bit, grupo 64 | 2,907B | 62,388% | 3,50 |
| Affine 4-bit, grupo 64 | 1,034B | 22,193% | 4,50 |
| Affine 5-bit, grupo 64 | 0,368B | 7,902% | 5,50 |
| Affine 6-bit, grupo 64 | 0,003B | 0,058% | 6,50 |
| BF16 | 0,348B | 7,459% | 16,00 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del Qwen3.5-4B original ni el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo que si se puede afirmar a partir de los datos del checkpoint es que el modelo es multimodal: incluye un modulo de vision de 334 millones de parametros ademas del modelo de lenguaje. Tambien incorpora una cabeza MTP (Multi-Token Prediction) de 121 millones de parametros, una tecnica que permite al modelo predecir varios tokens futuros en paralelo y que suele emplearse para decodificacion especulativa o para acelerar la generacion.

El proceso de cuantizacion es el elemento diferencial de este checkpoint. La herramienta oQ (oMLX v0.7.3, repositorio jundot/omlx) aplica precision mixta por tensor: la mayoria de los pesos se comprimen a 3 bits con cuantizacion afin y tamano de grupo 64, mientras que un subconjunto se mantiene en 4, 5 o 6 bits y un 7,5% permanece en BF16. Esta estrategia busca minimizar la perdida de calidad en capas criticas (tipicamente embeddings, normas y cabezas de atencion) a costa de un mayor tamano de archivo. El resultado son 2,8 GB en disco frente a los aproximadamente 9,3 GB que ocuparia el modelo en BF16.

El sufijo "heretic" en el nombre indica que la base no es el Qwen3.5-4B estandar, sino una variante modificada para eliminar o reducir los mecanismos de rechazo y alineacion de seguridad (practica conocida como abliteration). No se dispone de documentacion sobre que variante concreta se uso ni que metodo de ablacion se aplico.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredadas del Qwen3.5-4B base (nivel de detalle no disponible).
- Procesamiento de imagenes: el checkpoint incluye un codificador de vision de 334M parametros, por lo que el modelo es multimodal entrada de imagen y texto.
- Prediccion multi-token (MTP): la cabeza dedicada permite generar varios tokens por paso, lo que habilita tecnicas de decodificacion especulativa para acelerar la inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explicito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado para MLX y ocupa 2,8 GB, por lo que se puede ejecutar en un Mac con 8 GB de memoria unificada o superior, ideal para prototipado y experimentacion en portatiles.
- Procesamiento de documentos con imagenes: al incluir vision, puede emplearse para tareas de extraccion de informacion de capturas, formularios o diagramas combinados con instrucciones de texto.
- Generacion acelerada por MTP: la cabeza de prediccion multi-token permite implementar decodificacion especulativa y reducir la latencia en aplicaciones interactivas como chatbots o autocompletado.
- Investigacion sobre cuantizacion: el checkpoint sirve como caso de estudio de cuantizacion mixta oQ, permitiendo comparar la calidad de un modelo 4B comprimido a 4,8 bits medios frente al original en BF16.
- Experimentacion con modelos sin alineacion: para investigadores que estudian el comportamiento de modelos abliterated, este checkpoint ofrece una version ligera y ejecutable en local.
- Evaluacion de pipelines multimodales en entornos con recursos limitados: util para validar flujos de vision-lenguaje antes de escalar a modelos mayores.
- Pruebas de integracion con MLX: sirve para verificar compatibilidad de herramientas y frameworks con checkpoints cuantizados en formato MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: aproximadamente 2,8 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 3,5 y 5 GB segun longitud de contexto.
- Cabe en GPUs consumer con 8 GB o mas de VRAM, y en Macs con memoria unificada de 8 GB o superior.
- GPU recomendadas: cualquier Apple Silicon (M1 o posterior) por el formato MLX; en el ecosistema CUDA requeriria conversion previa, no soportada de forma nativa por este checkpoint.
- Opciones de despliegue: MLX (libreria nativa del checkpoint) y mlx-lm para generacion; vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato oQ/MLX sin conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ3-mtp | 4,66B | no disponible | Si | no disponible | MLX safetensors (oQ) |
| Qwen3.5-4B (original, BF16) | ~4B | no disponible | Si (presumible) | no disponible | safetensors |
| Qwen2.5-VL-3B | ~3B | 32K (tipico en la familia) | Si | Apache 2.0 (familia Qwen2.5) | safetensors, GGUF |
| Llama-3.2-3B | 3,2B | 128K | No | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de las filas comparativas corresponden a conocimiento general de esas familias; no se dispone de comparaciones de rendimiento publicadas para este checkpoint concreto.

## Limitaciones y advertencias

- La model card no declara licencia. No se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del Qwen3.5-4B base antes de cualquier despliegue en produccion.
- El sufijo "heretic" indica que los mecanismos de rechazo y alineacion de seguridad han sido alterados. El modelo puede producir contenido que un modelo alineado rechazaria; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- La cuantizacion a 3 bits en el 62% de los pesos introduce perdida de calidad respecto al modelo en BF16; el impacto exacto no esta documentado.
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de alucinacion.
- El formato MLX limita el despliegue fuera del ecosistema Apple; no hay versiones GGUF ni safetensors estandar en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo instante, lo que sugiere que no ha sido validado por la comunidad.
- No se documenta la variante "heretic" de origen ni el metodo de ablacion aplicado, lo que dificulta la reproducibilidad.
- La cabeza MTP requiere soporte especifico en el runtime; no todos los frameworks MLX la aprovecharan de forma automatica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ3-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible en la informacion proporcionada (se recomienda buscar en la organizacion Qwen de Hugging Face)
- Paper o documentacion de la variante "heretic": no disponible
- Demos o espacios asociados: no disponibles
