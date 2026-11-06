# ByteDance-Seed/Qwen3-30B-A3B-MoE-SAE

## Resumen

Qwen3-30B-A3B-MoE-SAE es un conjunto de tres autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre las activaciones de salida del bloque MoE del modelo Qwen3-30B-A3B. No se trata de un modelo generativo, sino de una herramienta de interpretabilidad: cada SAE proyecta las activaciones de una capa concreta (4, 30 y 46) a un espacio disperso de 2^20 latentes, de los cuales solo se activan los 100 de mayor magnitud (TopK con k = 100). Lo desarrolla ByteDance-Seed y se publica junto al articulo "Sparse AutoEncoders Reveal That MoE Experts Exhibit Human-Interpretable Fine-Grained Specialization".

La relevancia de esta publicacion esta en que aplica SAE al bloque de mezcla de expertos (MoE) en lugar de a la salida de atencion o a la residual stream, que es el objetivo habitual. Esto permite analizar que representa cada experto y como se especializan de forma granular. Cada SAE ocupa unos 17,2 GB en float32 y se carga como un conjunto de cuatro tensores independiente del modelo base, que debe ejecutarse por separado con transformers.

El modelo base Qwen3-30B-A3B es un transformer MoE de 30 mil millones de parametros totales con aproximadamente 3 mil millones activos por token, licencia Apache 2.0. Los SAE heredan esa licencia y se distribuyen en formato safetensors, con un config.json por capa que documenta los hiperparametros de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre la salida del bloque MoE (Qwen3MoeSparseMoeBlock) de Qwen3-30B-A3B |
| Parametros totales | No disponible como cifra unica; cada SAE contiene W_enc [2048, 1048576], b_enc [1048576], W_dec [1048576, 2048] y b_dec [2048] |
| Parametros activos | No aplica (el SAE no es MoE); k = 100 latentes activos por token |
| Longitud de contexto | No aplica al SAE; depende del modelo base Qwen3-30B-A3B |
| Tipos de cuantizacion | No disponible; los pesos se publican en float32 |
| Idiomas soportados | Ingles (segun la model card); el modelo base soporta mas idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un fichero por capa, ~17,2 GB cada uno) mas config.json |

## Arquitectura y entrenamiento

Cada SAE sigue la formulacion TopK clasica: una codificacion lineal con ReLU seguida de una seleccion de los k = 100 valores mayores, y una decodificacion lineal. La dimensionalidad de entrada y salida es 2048, que corresponde al tamano oculto del bloque MoE de Qwen3-30B-A3B, y el diccionario tiene 2^20 = 1.048.576 latentes. Las filas de W_dec tienen norma unitaria y el sesgo de decodificacion b_dec absorbe la media de las activaciones, de modo que la entrada se consume sin normalizacion previa. Los latentes se nombran como L-F<i>, por ejemplo 30-F97783 para el latente 97783 de la capa 30.

El entrenamiento se realizo de forma independiente por capa sobre activaciones recogidas del corpus de entrenamiento de Olmo 3: 5/8 de Dolma 3 (pretraining), 1/4 de Dolci-Think-SFT (cadenas de razonamiento) y 1/8 de Dolci-Instruct-SFT (seguimiento de instrucciones). Se usaron aproximadamente 3.200 millones de tokens por SAE, AdamW, una funcion de activacion TopK con k decayendo de 1000 a 100 durante los primeros 10.000 pasos y una perdida auxiliar. La receta completa aparece en el apendice "SAE training details" del articulo.

## Capacidades

- Extraccion de caracteristicas interpretables de las activaciones del bloque MoE de Qwen3-30B-A3B en las capas 4, 30 y 46.
- Codificacion dispersa con k = 100 latentes activos por token sobre un diccionario de 2^20 latentes.
- Reconstruccion de las activaciones originales mediante decodificacion lineal (W_dec y b_dec).
- Analisis de especializacion de expertos MoE: permite estudiar que patrones activan cada experto y como se reparten las representaciones.
- Soporte de hooks de PyTorch para capturar la salida de `model.model.layers[L].mlp` en transformers 4.x.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente una herramienta de interpretabilidad.

## Casos de uso

- Analisis de especializacion de expertos en MoE: cargando el SAE de la capa 30 y capturando la salida del bloque MoE, se pueden identificar que latentes se activan para cada experto y describir su comportamiento cualitativo, que es el objetivo central del articulo.
- Investigacion de circuitos y representaciones: los latentes TopK permiten aislar caracteristicas monosenanticas y rastrear su influencia en capas posteriores, lo que facilita estudios de mechanistic interpretability sobre un modelo MoE de 30B.
- Deteccion de caracteristicas asociadas a codigo: el ejemplo de la model card usa el prompt `def binary_search(arr, x):`, lo que sugiere su uso para estudiar representaciones de codigo en el bloque MoE.
- Auditoria de sesgos y comportamientos indeseados: analizando que latentes se activan ante entradas sensibles se pueden localizar direcciones asociadas a sesgos o a contenido problematico en el modelo base.
- Comparacion entre capas: al disponer de SAE en las capas 4, 30 y 46 se puede estudiar como evoluciona la especializacion de los expertos a lo largo de la profundidad de la red.
- Docencia y divulgacion: el coste computacional del SAE (~17 GB en float32) y su API sencilla (encode/decode) lo hacen util para demostraciones practicas de interpretabilidad en cursos o talleres.
- Validacion de tecnicas de SAE en MoE: sirve como referencia reproducible para comparar variantes de SAE (TopK frente a otras) sobre el mismo modelo base y el mismo corpus.

## Benchmarks y rendimiento

La model card reporta la fraccion de varianza no explicada (FVU) de la reconstruccion por capa:

| Capa | FVU |
|---|---|
| 4 | 12,6% |
| 30 | 25,1% |
| 46 | 7,6% |

No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval o GSM8K, ya que el artefacto no es un modelo generativo. Tampoco se detallan metricas de interpretabilidad cuantitativas (por ejemplo, puntuaciones de autointerpretabilidad o de monosemanticidad) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB adicionales por SAE cargado, en float32, sobre la memoria que ya ocupa el modelo base Qwen3-30B-A3B en bfloat16.
- El modelo base en bfloat16 requiere del orden de 60 GB de VRAM; combinado con un SAE se superan los 75 GB, por lo que se recomienda ejecutar el modelo en `device_map="auto"` y el SAE en una GPU dedicada o en CPU si la memoria es limitada.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU. En consumer GPU, una RTX 4090 de 24 GB no puede alojar simultaneamente el modelo base y el SAE en precision nativa; seria necesario cuantizar el modelo base o ejecutar el SAE en CPU.
- La preactivacion densa consume 4 MiB por token, por lo que se recomienda procesar entradas largas en fragmentos (chunking).
- Opciones de despliegue: el SAE se carga con `safetensors.torch.load_file` y se integra en un script de PyTorch con transformers; no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que sirven para inferencia generativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ByteDance-Seed/Qwen3-30B-A3B-MoE-SAE | SAE sobre bloque MoE de Qwen3-30B-A3B | 2^20 latentes, dim 2048, k=100 | No aplica | Apache 2.0 | Hugging Face |
| SAE de Qwen3-30B-A3B sobre residual stream | No disponible en la informacion proporcionada | No disponible | No aplica | No disponible | No disponible |
| SAE de otros modelos abiertos (p. ej. Llama, Gemma) | SAE sobre residual stream o atencion | No disponible | No aplica | No disponible | No disponible |

No se dispone en la informacion proporcionada de una comparativa cuantitativa con otros SAE publicos; la comparacion cualitativa mas relevante es que este conjunto se aplica a la salida del bloque MoE en lugar de a la residual stream, lo que permite analizar la especializacion de expertos de forma directa.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, codigo, razonamiento ni tool calling. Su unico proposito es la interpretabilidad.
- El FVU de la capa 30 es del 25,1%, lo que indica que una cuarta parte de la varianza de las activaciones no se reconstruye; las conclusiones basadas en esa capa deben tomarse con cautela.
- Solo se publican SAE para tres capas (4, 30 y 46); no cubre toda la red.
- Entrenado exclusivamente sobre corpus en ingles (Dolma 3, Dolci-Think-SFT, Dolci-Instruct-SFT); su comportamiento sobre otros idiomas no esta documentado.
- Depende de la version de transformers: el hook asume que `Qwen3MoeSparseMoeBlock` devuelve `(hidden_states, router_logits)` en transformers 4.x; cambios de API pueden romper la integracion.
- El consumo de memoria (17 GB por SAE en float32) limita su uso a entornos con GPU de gran capacidad o a ejecucion en CPU mas lenta.
- Los sesgos y alucinaciones del modelo base Qwen3-30B-A3B se reflejan en las activaciones analizadas; el SAE no los corrige.
- La licencia Apache 2.0 permite uso comercial del SAE, pero los datos de entrenamiento (Dolma 3, Dolci-Think-SFT, Dolci-Instruct-SFT) estan bajo ODC-BY v1.0, que exige atribucion.
- El articulo asociado figura con referencia "TODO" en la model card, por lo que la citation puede cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/ByteDance-Seed/Qwen3-30B-A3B-MoE-SAE
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Pagina del proyecto: https://bytedance-seed.github.io/SAE-interprets-MoE/
- Codigo: https://github.com/ByteDance-Seed/SAE-interprets-MoE
- Articulo: pendiente de publicacion (referenciado como "paper: TODO" en la model card)
- Licencia ODC-BY v1.0 de los datos de entrenamiento: https://opendatacommons.org/licenses/by/1-0/
