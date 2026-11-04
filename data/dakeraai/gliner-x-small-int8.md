# DakeraAI/gliner-x-small-int8

## Resumen

`DakeraAI/gliner-x-small-int8` es una compilación cuantizada a int8 en formato ONNX del modelo `knowledgator/gliner-x-small`, un extractor de entidades nombradas (NER) zero-shot basado en la arquitectura GLiNER. El modelo original lo desarrollan Urchade Zaratiana, Nadi Tomeh, Pierre Holat y Thierry Charnois (paper arXiv:2311.08526), y esta versión la publica Dakera, empresa que comercializa un motor de memoria autoalojado para agentes de IA. El objetivo de esta build es permitir inferencia rápida en CPU con ONNX Runtime manteniendo la calidad del checkpoint original.

GLiNER es un modelo bi-encoder ligero que, a diferencia del NER clásico, no está limitado a un conjunto fijo de etiquetas: el usuario introduce las etiquetas deseadas en el prompt y el modelo extrae las menciones correspondientes. Esta variante int8 conserva esa flexibilidad y añade una factorización exacta de la cabeza de spans (start/end por palabra en lugar de por span) para reducir el coste computacional.

El modelo está pensado para despliegues autoalojados en los que el coste de GPU no está justificado: un único grafo ONNX de 189,2 MB, tokenizador de 16,3 MB y configuración de 3,5 kB, con inferencia en CPU en decenas de milisegundos por petición. Es relevante para pipelines de extracción de entidades en agentes, RAG y sistemas de memoria a largo plazo que necesitan procesar texto multilingüe sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER (bi-encoder transformer con cabeza de spans factorizada), exportada a ONNX |
| Parámetros totales | no disponible (repo de 0,2 GB; grafo ONNX de 189,2 MB en int8) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; spans de hasta 12 palabras |
| Tipos de cuantización | int8 (pesos en bloque, block 32, simétrico, `MatMulNBits`; embeddings int8 por fila; activaciones en FP32) |
| Idiomas soportados | multilingüe (aproximadamente 100 idiomas según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`), tokenizer.json, gliner_config.json |

## Arquitectura y entrenamiento

El modelo base es GLiNER, un bi-encoder basado en transformer bidireccional que formula el NER como una tarea de matching entre etiquetas y spans de texto. Las etiquetas se concatenan al texto de entrada con los marcadores `<<ENT>> label … <<SEP>> text words` y el modelo puntúa cada span candidato (hasta 12 palabras) con una sigmoid, aplicando un umbral de 0,5. Al ser un uni-encoder, no requiere dos pasadas separadas como los enfoques de retrieval clásicos.

Esta build de Dakera introduce dos cambios respecto al checkpoint PyTorch original. Primero, factoriza exactamente la cabeza de spans: las dos capas densas que se aplicaban a cada uno de los `palabras × 12` spans se reorganizan en una parte de inicio y otra de fin calculadas una vez por palabra, y la última se pliega en el lado de las etiquetas; los logits se mantienen idénticos (diferencia máxima de 5,7e-06). Segundo, cuantiza a 8 bits las matrices de pesos del encoder y de las cabezas en bloque de 32 elementos, dejando las activaciones en FP32, ya que cuantizarlas degrada severamente la detección. La verificación contra el original reporta correlación de logits de al menos 1.000 y un 99 % de entidades idénticas en frases de prueba multilingües. Los detalles de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se especifican en la información disponible y remiten a la model card original de `knowledgator/gliner-x-small`.

## Capacidades

- Extracción de entidades nombradas zero-shot con etiquetas definidas por el usuario en tiempo de inferencia.
- Reconocimiento de entidades multilingüe en aproximadamente 100 idiomas.
- Procesamiento de spans de hasta 12 palabras, adecuado para nombres compuestos, organizaciones y localizaciones extensas.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Integración en pipelines de memoria de agentes (extracción de entidades para almacenamiento y recuperación).
- Tokenización por palabras pre-segmentadas (runs de letras, marcas y dígitos unidos por `-` o `_`; caracteres CJK individuales).
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo de clasificación de tokens, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades en memoria de agentes: el modelo identifica personas, organizaciones y localizaciones en las conversaciones almacenadas para enriquecer el índice de recuperación; su latencia mediana de 0,016 s por petición permite procesar cada turno en tiempo real.
- Enriquecimiento de pipelines RAG: antes de indexar documentos, se ejecuta el modelo con las etiquetas relevantes del dominio para poblar metadatos estructurados que mejoren el filtrado y el reranking.
- Anonimización y cumplimiento normativo: detección de nombres de personas y organizaciones en textos para su seudonimización previa al almacenamiento, con despliegue totalmente autoalojado que evita enviar datos a terceros.
- Procesamiento de documentos multilingües: al cubrir aproximadamente 100 idiomas, un mismo servicio puede extraer entidades de contratos, correos o tickets en varios idiomas sin mantener modelos separados por lengua.
- Análisis de opiniones y redes sociales: extracción de marcas, productos y localizaciones en publicaciones para agregación de menciones, aceptando la menor precisión observada en dominios informales (F1 de 0,37 en WNUT-17).
- Clasificación y etiquetado de tickets de soporte: identificación de entidades en descripciones de incidencias para enrutamiento automático y construcción de bases de conocimiento.
- Prototipado rápido sin GPU: al ejecutarse en CPU con ONNX Runtime y pesar 189,2 MB, permite validar esquemas de etiquetas en portátiles o contenedores pequeños antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos a través del pipeline de extracción de Dakera (umbral 0,5; etiquetas person, organization, location; ONNX Runtime 1.31 con prepacking de pesos; un hilo de CPU por pasada en AMD Ryzen 9 7950X):

| Conjunto | F1 |
|---|---|
| Dakera chat sentences, inglés (20 frases; 10 etiquetas) | 0,62 |
| Dakera chat sentences, 7 idiomas (44 frases; 10 etiquetas) | 0,59 |
| WNUT-17 (redes sociales, inglés) | 0,37 |
| CoNLL-2003 (noticias, inglés) | 0,71 |

MultiCoNER v2 (150 frases por idioma):

| de | en | es | fr | hi | it | pt | zh |
|---|---|---|---|---|---|---|---|
| 0,56 | 0,57 | 0,67 | 0,63 | 0,51 | 0,67 | 0,58 | 0,20 |

Latencia: mediana de 0,016 s por petición en el conjunto de chat. No se han publicado comparaciones directas con otros modelos NER en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el grafo ONNX ocupa 189,2 MB y las activaciones se mantienen en FP32, por lo que el consumo de memoria es del orden de cientos de MB en RAM.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no es su objetivo.
- Cabe en cualquier equipo consumer: CPU de escritorio o portátil moderna; el benchmark se realizó en un AMD Ryzen 9 7950X con un hilo por pasada.
- Opciones de despliegue: ONNX Runtime (con weight prepacking activado, que es el valor por defecto; desactivarlo hace las MatMuls int8 entre 4 y 5 veces más lentas), integración en el servidor Dakera vía Docker (`ghcr.io/dakera-ai/dakera:latest`). No se distribuye en GGUF ni en formato nativo de llama.cpp, Ollama o vLLM.
- Latencia y throughput: mediana de 0,016 s por petición en el conjunto de chat de Dakera con un hilo de CPU; el throughput agregado no se especifica.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / spans | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| DakeraAI/gliner-x-small-int8 | GLiNER ONNX int8 | spans de hasta 12 palabras | ~100 | Apache-2.0 | ONNX |
| knowledgator/gliner-x-small | GLiNER PyTorch | spans de hasta 12 palabras | ~100 | Apache-2.0 | safetensors / PyTorch |
| GLiNER base (paper arXiv:2311.08526) | Bi-encoder transformer | no disponible | multilingüe | según checkpoint | PyTorch |

La comparación directa de rendimiento con otros modelos NER no está disponible en la información proporcionada. Frente al checkpoint original, esta build mantiene la calidad (99 % de entidades idénticas, correlación de logits ≥ 1.000) con un tamaño de 189,2 MB y ejecución en CPU.

## Limitaciones y advertencias

- Rendimiento notablemente inferior en chino (F1 de 0,20 en MultiCoNER v2) y en dominios informales como redes sociales (F1 de 0,37 en WNUT-17); no es adecuado para esos casos sin ajuste o validación previa.
- El límite de spans de 12 palabras puede dejar fuera entidades muy largas.
- El umbral de decisión es fijo en 0,5 en la configuración publicada; cambiarlo requiere ajustar el pipeline.
- Las activaciones en FP32 son necesarias: cuantizarlas provoca que el modelo no detecte entidades, según advierte el autor.
- Es un modelo de clasificación de tokens, no generativo: no razona, no sigue instrucciones complejas ni soporta tool calling.
- Posibles sesgos heredados del corpus de entrenamiento del modelo base, no documentados en esta build.
- Riesgo de falsos positivos y negativos en textos con jerga, abreviaturas o errores ortográficos.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribución a los autores originales y revisar la model card de `knowledgator/gliner-x-small`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DakeraAI/gliner-x-small-int8
- Modelo base: https://huggingface.co/knowledgator/gliner-x-small
- Paper GLiNER: https://arxiv.org/abs/2311.08526
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Licencia: https://huggingface.co/DakeraAI/gliner-x-small-int8/blob/main/LICENSE
