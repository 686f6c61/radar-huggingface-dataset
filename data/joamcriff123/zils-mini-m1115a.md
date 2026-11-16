# joamCriff123/zils-mini-m1115a

## Resumen

zils-mini-m1115a es un modelo de extraccion de caracteristicas (feature-extraction) publicado por el usuario joamCriff123 en Hugging Face, construido como un fine-tune del modelo base Qwen/Qwen3.5-4B. Segun la model card, se trata de un "cuerpo de decision d3-mini" destinado al pool mini de la subnet 127 de Zils, lo que sugiere un uso dentro de una infraestructura de subred descentralizada orientada a tareas de decision mas que a generacion de texto abierta.

El modelo cuenta con 4.539.265.536 parametros totales (segun los pesos en safetensors) y un repositorio de 9,1 GB, lo que es coherente con un transformer denso de aproximadamente 4B de parametros almacenado en formato safetensors. La libreria declarada es transformers y la licencia es Apache-2.0.

La informacion publica disponible es muy limitada: no hay datos sobre composicion del dataset de entrenamiento, idiomas soportados, contexto maximo ni resultados de benchmarks. La model card es practicamente un stub que solo identifica el modelo base, la licencia y su pertenencia a la subnet 127 de Zils.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-4B); detalles especificos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna mas alla de que el modelo deriva de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4B de parametros. El pipeline declarado es feature-extraction, lo que indica que el modelo esta pensado para producir representaciones vectoriales (embeddings) o estados ocultos, no necesariamente para generacion autoregresiva de texto, aunque al conservar el cuerpo completo del modelo base podria emplearse tambien para inferencia generativa.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Solo se indica que es un fine-tune del modelo base y que forma parte de un "d3-mini decision body" para el pool mini de la subnet 127 de Zils. No hay informacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.).

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que el uso previsto es generar embeddings o representaciones internas a partir de texto.
- Fine-tune orientado a decision: la model card lo describe como "decision body", lo que sugiere un ajuste para tareas de clasificacion, puntuacion o seleccion dentro del ecosistema Zils.
- Generacion de texto: no confirmada explicitamente; al derivar de Qwen3.5-4B podria conservar capacidad generativa, pero no esta documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: al estar etiquetado como feature-extraction, el modelo puede emplearse para vectorizar documentos y consultas en un motor de recuperacion, generando representaciones densas que alimenten un indice vectorial.
- Clasificacion o scoring dentro de la subnet Zils: segun la model card, funciona como "decision body" del pool mini de la subnet 127, por lo que su uso natural es puntuar o seleccionar candidatos dentro de ese protocolo.
- Filtrado y enrutamiento de peticiones: en un pipeline de inferencia, un modelo de decision de este tamano puede actuar como clasificador previo que decida que peticiones requieren un modelo mayor.
- Prototipado de sistemas de recomendacion: los embeddings del modelo pueden alimentar un ranking de items o contenidos en un entorno de desarrollo con recursos limitados.
- Moderacion o etiquetado automatico de contenido: si el fine-tune esta orientado a decision, podria adaptarse a tareas de clasificacion binaria o multietiqueta sobre texto.
- Experimentacion academica sobre subredes descentralizadas: util para investigadores que estudien el ecosistema Zils y quieran reproducir o analizar el comportamiento del pool mini.

En todos los casos, la falta de documentacion sobre el dataset de entrenamiento y el rendimiento real obliga a validar el modelo en el dominio concreto antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4,54B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3 GB para pesos (si se generan variantes GGUF/AWQ, no publicadas oficialmente).
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100, L40S o RTX 4090 24 GB; en consumer, una RTX 4090 o RTX 3090 (24 GB) permite inferencia holgada en bf16.
- GPU consumer: cabe en tarjetas de 12-16 GB si se cuantiza a 8 bits; en 4 bits podria caber en GPUs de 8 GB, aunque sin variantes cuantizadas publicadas esto requiere conversion manual.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados como soportados, especialmente por el tag custom_code.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-m1115a | 4,54B | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base oficial) |
| Otros fine-tunes de Qwen3.5-4B | ~4B | depende del fine-tune | variable | Hugging Face |

No se dispone de datos de rendimiento comparado ni de especificaciones de contexto para establecer una comparativa cuantitativa con alternativas. La comparacion con el modelo base es la referencia mas directa, pero no se documentan las diferencias de comportamiento introducidas por el fine-tune.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe dataset, metodologia de entrenamiento, evaluacion ni limitaciones conocidas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna tarea.
- Sesgos desconocidos: al no documentarse la composicion de los datos de ajuste, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: si el modelo conserva capacidad generativa del base, aplica el riesgo habitual de los LLM; no evaluado.
- Idiomas no declarados: se desconoce si el fine-tune degrada el multilingusimo del modelo base.
- Contexto maximo no especificado: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Tag custom_code: requiere cargar codigo remoto con trust_remote_code, lo que implica revisar el codigo antes de ejecutarlo en produccion.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones del modelo base y el archivo NOTICE mencionado en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1115a
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
