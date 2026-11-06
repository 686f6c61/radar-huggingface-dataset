# bertholomus/Mistral-Large-4-1T-A52B-EXL3-2.5bpw

## Resumen

Mistral-Large-4-1T-A52B-EXL3-2.5bpw es una cuantizacion EXL3 (formato de ExLlamaV3) del modelo Mistral-Large-4-1T-A52B de Mistral AI, publicada por el usuario bertholomus. El modelo base es un Mixture-of-Experts (MoE) multimodal de aproximadamente 1 billon de parametros totales con unos 52.000 millones de parametros activos por token, entrenado desde cero por Mistral AI sobre 3.800 GPUs NVIDIA Grace Blackwell. Esta version cuantizada reduce el peso a unos 316 GiB para permitir su despliegue en cuatro nodos NVIDIA DGX Spark (GB10, 128 GB cada uno).

La relevancia de esta ficha es doble: por un lado documenta una de las primeras cuantizaciones publicas de un modelo de la familia Mistral Large 4, y por otro muestra una estrategia de despliegue distribuido (expertos enrutados repartidos entre cuatro nodos, atencion replicada por nodo) pensada para hardware de escritorio de gama alta en lugar de clusters de centros de datos. El contexto declarado alcanza 1.048.576 tokens.

La cuantizacion es mixta: los expertos enrutados se comprimen a 2,5 bits por peso, mientras que atencion, experto compartido y capa densa 0 se mantienen a 5,0 bpw, la cabeza LM a 6,0 bpw y normas, router y embeddings conservan la precision del modelo original. El resultado es un artefacto de aproximadamente 338 GB en el repositorio, con pesos en safetensors organizados por capas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, 72 capas, 128 expertos enrutados con top-4 mas 1 experto compartido, atencion MLA con indexador DSA |
| Parametros totales | 169.716.924.704 (dato real de safetensors); el modelo base se describe como de 1 billon de parametros |
| Parametros activos | 49.000 millones por token (52.000 millones incluyendo embeddings y capas de salida) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | EXL3 mixta: expertos enrutados 2,5 bpw; atencion, experto compartido y capa densa 0 a 5,0 bpw; cabeza LM a 6,0 bpw; normas, router y embeddings en precision de origen |
| Idiomas soportados | no disponible |
| Licencia | Mistral Ecosystem Open-Weight License (license: other) |
| Formato de pesos | safetensors (tensores EXL3 de ExLlamaV3), un pack por capa mas globals, head y manifiesto ml4_pack.json |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 72 capas, 128 expertos enrutados con activacion top-4 y un experto compartido adicional. La atencion es de tipo MLA (Multi-head Latent Attention) con un indexador DSA, lo que permite manejar ventanas de contexto de 1.048.576 tokens con un coste de memoria de atencion contenido. El modelo es nativamente multimodal, con comprension de imagen y texto, aunque esta cuantizacion se describe en la model card como un modelo de texto.

El entrenamiento del modelo base se realizo desde cero sobre 3.800 GPUs NVIDIA Grace Blackwell, segun la informacion publica de Mistral AI. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO). La innovacion tecnica de esta publicacion concreta es la cuantizacion EXL3 mixta y el empaquetado por capas: cada capa se distribuye en un fichero `Lnn.safetensors` con tensores EXL3 y un `Lnn-nq.safetensors` con tensores en precision de origen, acompanados de `globals.safetensors`, `head.safetensors`, el manifiesto `ml4_pack.json` y `sha256.txt` con sumas de verificacion.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con un modelo base descrito como el mas capaz de Mistral hasta la fecha.
- Comprension multimodal de imagen y texto en el modelo base (nativamente multimodal); la model card de esta cuantizacion lo describe como modelo de texto.
- Ventana de contexto de 1.048.576 tokens, adecuada para documentos extensos, repositorios de codigo y conversaciones de muy largo recorrido.
- Capacidad de generacion de codigo y matematicas heredada del modelo base, aunque no se publican resultados especificos en la informacion disponible.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1.048.576 tokens de contexto, el modelo puede ingerir varios ficheros de codigo y documentacion en una sola pasada para tareas de revision, refactorizacion o generacion de tests.
- Procesamiento de expedientes y documentacion legal: contratos, normativas y expedientes de cientos de paginas caben en una unica ventana, lo que permite resumir, comparar clausulas y extraer obligaciones sin troceado.
- Investigacion academica asistida: lectura y sintesis de articulos largos, tesis o corpus de notas con citas cruzadas dentro del mismo contexto.
- Despliegue en laboratorio con hardware de escritorio de gama alta: la particion en cuatro DGX Spark permite ejecutar un modelo de escala billon en instalaciones sin cluster de centro de datos, por ejemplo para prototipado interno.
- Generacion y analisis de codigo en pipelines internos: el modelo base esta orientado a tareas de codigo; esta cuantizacion permite integrarlo en entornos de desarrollo con GPU locales siempre que se respete la licencia.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de 2,5 bpw frente a otras cuantizaciones del mismo modelo base (por ejemplo NVFP4) en tareas de razonamiento y contexto largo.
- Experimentacion con atencion de contexto largo: el indexador DSA y la ventana de 1M tokens permiten estudiar recuperacion de informacion en contextos masivos sobre hardware modesto en comparacion con el modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 316 GiB de pesos, mas overhead de cache KV y activaciones; el repositorio ocupa 338,4 GB.
- Configuracion objetivo declarada: 4 nodos NVIDIA DGX Spark con GB10 de 128 GB cada uno, con los expertos enrutados repartidos entre los cuatro nodos y la atencion replicada por nodo.
- No cabe en una GPU consumer individual (RTX 4090, 24 GB; RTX 5090, 32 GB) ni en configuraciones multi-GPU convencionales de 80 GB sin un esquema de particionado adicional.
- Motor de inferencia: ExLlamaV3 (formato EXL3); la receta de servicio (rama del motor, linea de lanzamiento y numeros medidos) se anuncia como publicacion acompanante, no disponible en el momento de redactar esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bertholomus/Mistral-Large-4-1T-A52B-EXL3-2.5bpw | 169.716.924.704 (pesos cuantizados) | 49.000 M (52.000 M con embeddings) | 1.048.576 | EXL3 mixta 2,5-6,0 bpw | Mistral Ecosystem Open-Weight License | Hugging Face, 0 descargas |
| mistralai/Mistral-Large-4-1T-A52B | 1 billon (segun informacion publica) | 49.000 M (52.000 M con embeddings) | 1.048.576 | Pesos originales | Mistral Ecosystem Open-Weight License | Hugging Face (modelo base) |
| unsloth/Mistral-Large-4-1T-A52B-NVFP4 | 1 billon (segun informacion publica) | 49.000 M (52.000 M con embeddings) | 1.048.576 | NVFP4 | Mistral Ecosystem Open-Weight License | Hugging Face |

## Limitaciones y advertencias

- La cuantizacion a 2,5 bpw en los expertos enrutados puede degradar la calidad frente al modelo original; no se publican evaluaciones que cuantifiquen esa perdida.
- La model card describe esta version como modelo de texto, aunque el modelo base es nativamente multimodal; las capacidades de vision pueden no estar disponibles o no haber sido validadas en esta cuantizacion.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue especifico de esta version.
- La licencia Mistral Ecosystem Open-Weight License exige licencia comercial separada de Mistral si el usuario o un afiliado opera un negocio de Model-as-a-Service; el uso interno esta exento segun la condicion 3 de la licencia.
- El modelo no esta afiliado ni respaldado por Mistral AI; los pesos y el modelo original son propiedad de Mistral AI.
- El despliegue requiere hardware especializado (cuatro DGX Spark) y el motor ExLlamaV3; la receta de servicio no estaba publicada en el momento de redactar esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente del artefacto.
- Verificar las sumas SHA-256 incluidas en `sha256.txt` antes de usar los pesos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bertholomus/Mistral-Large-4-1T-A52B-EXL3-2.5bpw
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Cuantizacion NVFP4 alternativa: https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-NVFP4
- Ficha tecnica del modelo base en GitHub: https://github.com/BELYAGOUBIABDELILAH/model-and-paper/blob/main/models/2026-11-05-mistral-large-4-1t-a52b.md
