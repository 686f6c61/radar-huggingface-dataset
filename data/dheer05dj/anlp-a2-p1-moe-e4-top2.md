# dheer05dj/anlp-a2-p1-moe-e4-top2

## Resumen

`dheer05dj/anlp-a2-p1-moe-e4-top2` es un checkpoint de investigación publicado como parte de la Assignment 2 de un curso de ANLP. Se trata de un transformer decoder-only implementado desde cero en PyTorch, con capas feed-forward de tipo Mixture-of-Experts, entrenado para traducir de vietnamita a inglés y de japonés a inglés. El modelo tiene 41.574.912 parámetros totales y 33.190.000 parámetros activos por token, con d_model 512, 8 capas y 8 cabezas de atención.

Su relevancia es fundamentalmente académica: sirve como artefacto reproducible para estudiar el comportamiento de una capa MoE frente a variantes densas dentro de una misma receta de entrenamiento. Los resultados declarados por el autor son un BLEU de 43,85 en vietnamita→inglés y 34,04 en japonés→inglés sobre el conjunto de test, con una perplejidad global de 4,548, tras entrenar sobre 107.305.098 tokens en 9 minutos y 18 segundos.

No se ha publicado licencia, lista de idiomas soportados ni longitud de contexto en la model card, y el repositorio acumula 0 descargas y 0 likes, por lo que debe considerarse un experimento de laboratorio y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward Mixture-of-Experts (MoE) |
| Parametros totales | 41.574.912 (41,57 M) |
| Parametros activos | 33.190.000 (33,19 M) |
| Numero de expertos | no confirmado en la model card; el nombre del checkpoint (`e4-top2`) sugiere 4 expertos y enrutamiento top-2 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente en precision completa) |
| Idiomas soportados | Traduccion de vietnamita a ingles y de japones a ingles segun la model card; no se documentan otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del modelo (d_model) | 512 |
| Capas | 8 |
| Cabezas de atencion | 8 |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE |
| Embeddings | atados (tied embeddings) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only escrito desde cero en PyTorch, sin componentes de bibliotecas de alto nivel como Hugging Face Transformers. La configuracion declarada incluye d_model 512, 8 capas, 8 cabezas de atencion, RoPE como codificacion posicional, RMSNorm como normalizacion y embeddings atados entre entrada y salida. La capa feed-forward es de tipo Mixture-of-Experts: por el nombre del checkpoint (`p1_moe_e4_top2`) se deduce una configuracion de 4 expertos con enrutamiento top-2, lo que explica la diferencia entre los 41,57 M de parametros totales y los 33,19 M de parametros activos. El checkpoint se carga mediante `src.part1.train.load_checkpoint(dir)` del repositorio de la asignatura y su `config.json` contiene el objeto `TransformerConfig` que consume `src/part1/model.py`.

El entrenamiento se realizo sobre 107.305.098 tokens para la tarea de traduccion vietnamita→ingles y japones→ingles, con un tiempo total declarado de 9 minutos y 18 segundos, lo que sugiere un presupuesto de computo muy reducido y probablemente una unica GPU. No se documenta la composicion del dataset, el tokenizador empleado, ni si hubo fases de RLHF, DPO o fine-tuning posterior. Tampoco se describen innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o tecnicas de compresion de KV cache. Al ser un modelo decoder-only sin encoder, la traduccion se resuelve de forma autoregresiva condicionada por el prompt.

## Capacidades

- Traduccion automatica de vietnamita a ingles, con un BLEU declarado de 43,85 sobre el conjunto de test.
- Traduccion automatica de japones a ingles, con un BLEU declarado de 34,04 sobre el conjunto de test.
- Generacion de texto autoregresiva condicionada, al ser un transformer decoder-only.
- Modelado de lenguaje a nivel de token con embeddings atados, lo que reduce el numero de parametros de la capa de salida.
- Capacidad de servir como banco de pruebas de arquitecturas MoE frente a capas feed-forward densas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- No se documentan capacidades multilingues mas alla de los pares vietnamita→ingles y japones→ingles indicados.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint permite reproducir los resultados de la Assignment 2 cargando `config.json` y los pesos con el codigo de `src/part1/model.py`, util para validar comparativas entre variantes MoE y densas.
- Estudio de enrutamiento MoE a escala pequena: con 4 expertos y top-2 sobre 8 capas, es adecuado para analizar la distribucion de carga entre expertos, el colapso de expertos y el efecto del enrutamiento en la calidad de traduccion sin necesidad de grandes recursos.
- Prototipado de traduccion vi→en y ja→en en local: al ocupar menos de 200 MB en fp32, se puede ejecutar en un portatil o en una CPU para preprocesar textos cortos antes de escalar a un modelo mayor.
- Fine-tuning de bajo coste sobre dominios concretos: su tamano reducido permite reentrenar o adaptar la capa de salida y las capas MoE con presupuestos de una sola GPU consumer.
- Baseline en evaluaciones comparativas: sirve como referencia de BLEU y perplejidad para nuevos prototipos de traduccion entrenados con el mismo dataset de 107 M de tokens.
- Docencia de arquitecturas transformer: es un ejemplo completo y legible de implementacion desde cero con RoPE, RMSNorm, embeddings atados y capa MoE.
- Despliegue en entornos con restricciones severas de memoria: al ser un modelo de 41,57 M de parametros, puede integrarse en dispositivos embebidos o contenedores muy limitados para tareas de traduccion acotadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| test_ppl | 4,548 |
| test_ppl_vi | 3,901 |
| test_ppl_ja | 5,303 |
| bleu_vi | 43,85 |
| bleu_ja | 34,04 |
| bleu_all | 38,98 |
| train_tokens | 107.305.098 |
| train_time | 9 min 18 s |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Tampoco se han encontrado resultados comparables del modelo `abhirajratna/anlp-a2-moe-v5`, perteneciente al mismo ejercicio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 166 MB en fp32, 83 MB en fp16/bf16, 42 MB en int8 y 21 MB en int4. Sumando activaciones y cache KV para secuencias cortas, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer sirve, desde una GTX 1050 o una RTX 3060 hasta una RTX 4090. Las A100 y H100 estan sobredimensionadas para este tamano de modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El unico camino soportado por el autor es cargar el checkpoint con el codigo del repositorio de la asignatura (`src.part1.train.load_checkpoint`) sobre PyTorch.
- Latencia y throughput estimados: no disponibles. El unico dato temporal publicado es el de entrenamiento (9 minutos y 18 segundos para 107.305.098 tokens).
- Almacenamiento: el repositorio completo ocupa 0,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dheer05dj/anlp-a2-p1-moe-e4-top2 | 41,57 M totales / 33,19 M activos | no disponible | BLEU vi 43,85; BLEU ja 34,04; ppl 4,548 | no disponible | Publico en Hugging Face, 0 descargas |
| abhirajratna/anlp-a2-moe-v5 | no disponible | no disponible | no disponible | no disponible | Publico en Hugging Face |
| Otras variantes del conjunto `anlp-assignment-2` | no disponible | no disponible | no disponible | no disponible | Publicas en Hugging Face |

La model card de `abhirajratna/anlp-a2-moe-v5` indica que pertenece al mismo ejercicio (ANLP A2 Part 1), que traduce vietnamita→ingles y japones→ingles y que forma parte de un grupo de cinco modelos que solo se diferencian en la capa feed-forward. No se han encontrado datos de parametros, contexto, licencia ni metricas para ese modelo en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede asumirse permiso para uso comercial ni para redistribucion.
- Es un checkpoint derivado de una practica academica, sin model card de uso, sin ficha de evaluacion de sesgos y con 0 descargas, lo que implica ausencia total de validacion externa.
- El entrenamiento se realizo sobre 107.305.098 tokens, un volumen muy bajo para traducion neuronal, lo que limita la cobertura lexica y la robustez ante dominios alejados de los datos de entrenamiento.
- El rendimiento en japones es claramente inferior al de vietnamita: ppl 5,303 frente a 3,901 y BLEU 34,04 frente a 43,85, lo que sugiere un peor ajuste en ese par de idiomas.
- Riesgo de alucinacion y de traducciones fluidas pero incorrectas, especialmente fuera de los dominios representados en el dataset de entrenamiento, que no se documenta.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso con documentos largos sin riesgo de truncamiento o degradacion.
- Al ser un decoder-only sin encoder, la calidad de la traduccion depende fuertemente del formato del prompt y no hay garantia de alineacion estricta con la frase de origen.
- No incluye filtros de seguridad, moderacion ni mecanismos de rechazo de contenido, por lo que no debe exponerse directamente a usuarios finales sin una capa adicional de control.
- La composicion del dataset de entrenamiento es desconocida, por lo que no puede descartarse la presencia de sesgos sociales, de genero o culturales en los datos.
- Las metricas publicadas provienen del propio autor y no han sido verificadas por terceros; ademas, solo cubren perplejidad y BLEU, sin evaluaciones de robustez, equidad o toxicidad.
- No hay soporte documentado para cuantizacion, tool calling, agentes ni despliegue con servidores de inferencia estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dheer05dj/anlp-a2-p1-moe-e4-top2
- Registros de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part1-moe/runs/57op5j28
- Modelo comparable del mismo ejercicio: https://huggingface.co/abhirajratna/anlp-a2-moe-v5
- Coleccion de modelos etiquetados como `anlp-assignment-2`: https://huggingface.co/models?other=anlp-assignment-2
