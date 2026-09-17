# minjaechoi/qwen36-35b-a3b-2p00bit-r8

## Resumen

Qwen3.6-35B-A3B 2.00-bit routed experts (r8) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Se trata de una variante cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados de la arquitectura Mixture-of-Experts han sido comprimidos a una media de 2,00 bits, mientras que el resto de pesos se mantiene en BF16. El identificador interno del experimento es r8.

El modelo conserva el pipeline de text-generation y las etiquetas del modelo base, incluyendo image-text-to-text, qwen3_5_moe y conversational. El repositorio ocupa 70,2 GB y contiene 35.107.181.936 parámetros totales según los tensores safetensors. Todos los pesos se almacenan ya dequantizados en tensores BF16, de modo que cargan con transformers estándar y con vLLM sin necesidad de kernels de cuantización específicos.

Su relevancia es fundamentalmente investigadora: permite estudiar el efecto de una compresión agresiva (2 bits) limitada a los expertos enrutados sobre un MoE de 35B, sin modificar el resto de la red. Cabe señalar que, al guardarse dequantizado en BF16, el ahorro de almacenamiento y VRAM respecto al modelo base es nulo en la práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) de tipo transformer; tag de libreria `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 |
| Parametros activos | No confirmado en la informacion disponible; la nomenclatura A3B del modelo base sugiere del orden de 3.000 millones, sin dato oficial |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: media de 2,00 bits (esquema r8). Resto de pesos: BF16. Todos los pesos se almacenan dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que la licencia sigue la del modelo base, cuya licencia no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 70,2 GB |
| Pipeline | text-generation |
| Etiquetas relevantes | quantized, conversational, image-text-to-text, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), heredada integramente del modelo base Qwen/Qwen3.6-35B-A3B. El checkpoint no introduce cambios estructurales: la unica modificacion respecto al base es el esquema de cuantizacion aplicado a los pesos de los expertos enrutados, que promedian 2,00 bits dentro del experimento identificado como r8. El resto de componentes de la red (atencion, embeddings, normalizaciones y demas pesos no enrutados) permanece en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta si la cuantizacion se obtuvo mediante cuantizacion posterior al entrenamiento (PTQ) o mediante entrenamiento consciente de cuantizacion (QAT). El detalle tecnico mas relevante y confirmado es la decision de almacenar los pesos ya dequantizados en BF16, lo que garantiza compatibilidad directa con transformers y vLLM a costa de eliminar cualquier ventaja de tamano o de memoria.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Procesamiento de entrada imagen-texto: la etiqueta image-text-to-text indica soporte multimodal de entrada, aunque la model card no detalla el alcance ni los formatos admitidos.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible, aunque son capacidades esperables del modelo base del que se heredan los pesos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.
- Carga directa con transformers y vLLM sin kernels de cuantizacion adicionales, al estar los pesos dequantizados en BF16.

## Casos de uso

- Investigacion sobre cuantizacion de MoE: el checkpoint permite medir el impacto de comprimir solo los expertos enrutados a 2 bits frente al modelo base en BF16, aislando el efecto sobre el enrutamiento y sobre la calidad de salida. Es su uso mas inmediato dado su caracter de checkpoint de investigacion interno.
- Analisis de enrutamiento de expertos: al conservar la estructura MoE intacta con un unico cambio de precision en los expertos, sirve para estudiar si la compresion altera la distribucion de activaciones entre expertos.
- Evaluacion de degradacion en tareas multimodales: con la etiqueta image-text-to-text heredada, permite comparar la calidad de respuestas sobre imagenes frente al modelo base sin cuantizar.
- Despliegue de referencia en vLLM: la compatibilidad declarada con vLLM y transformers permite usarlo como banco de pruebas para medir throughput y latencia de un MoE de 35B con pesos BF16 en infraestructura propia.
- Generacion de texto conversacional en entornos de investigacion: puede emplearse en prototipos de dialogo multi-turno donde no se requiera una licencia comercial clara, dado que la licencia no esta disponible en la informacion proporcionada.
- Reproducibilidad de experimentos de compresion: al publicarse el identificador interno r8 y el porcentaje de bits medio, facilita replicar y comparar resultados con otras variantes del mismo autor.
- Pruebas de integracion en pipelines de transformers: sirve para verificar que una carga de pesos dequantizados en safetensors funciona sin modificaciones en versiones recientes de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, el modelo requiere aproximadamente 70,2 GB solo para los pesos (35.107.181.936 parametros x 2 bytes), mas la memoria de la cache KV. La cuantizacion a 2 bits de los expertos no reduce este requisito porque los tensores se guardan ya dequantizados.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB o H100 80 GB) es el punto de partida realista para una unica tarjeta. Para configuraciones multi-GPU, dos o mas aceleradores con tensor parallelism.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) ni en una unica RTX 6000 Ada de 48 GB, dado el tamano de los pesos en BF16.
- Opciones de despliegue: transformers y vLLM estan confirmados por la model card; la etiqueta endpoints_compatible sugiere compatibilidad con HuggingFace Inference Endpoints. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. TGI no esta confirmado.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, al tratarse de un MoE con un subconjunto reducido de parametros activos, el coste de decodificacion tiende a estar dominado por el ancho de banda de memoria (carga de los 70,2 GB de pesos) mas que por el computo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato de pesos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p00bit-r8 | 35.107.181.936 | No confirmado (A3B) | safetensors (BF16 dequantizado) | Expertos enrutados a 2,00 bits; resto BF16 | no disponible | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Ninguna (BF16 de referencia) | no disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos de otros checkpoints comparables de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base declarado.

## Limitaciones y advertencias

- Checkpoint de investigacion interno: la propia model card lo califica como tal, sin garantias de estabilidad, calidad ni soporte.
- La cuantizacion a 2 bits de los expertos enrutados puede degradar la calidad de forma no documentada; no se publican evaluaciones que cuantifiquen esa perdida.
- Ausencia total de datos de benchmarks, lo que impide validar su rendimiento frente al modelo base.
- El almacenamiento dequantizado en BF16 elimina el ahorro de memoria y disco: el repositorio de 70,2 GB no ofrece ventaja practica de despliegue frente al base en BF16.
- Licencia no disponible: aunque la model card afirma que la licencia sigue la del modelo base, no se especifica cual es, por lo que el uso comercial queda en una situacion juridica indeterminada y no recomendable en produccion.
- Idiomas soportados no documentados, por lo que no puede garantizarse cobertura multilingue.
- Longitud de contexto no documentada: limita la planificacion de aplicaciones que dependan de ventanas largas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; son atribuibles al modelo base y a los datos de entrenamiento no publicados.
- Hipotesis no confirmada sobre parametros activos: el dato de aproximadamente 3.000 millones activos procede de la nomenclatura A3B del modelo base, no de una especificacion de este repositorio.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes externos de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas de ayuda de Google Traduccion, sin relacion con este checkpoint.
