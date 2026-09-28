# masahiroid/ruri-v3-reranker-310m-mlx

## Resumen

`masahiroid/ruri-v3-reranker-310m-mlx` es la conversión al formato MLX del modelo `cl-nagoya/ruri-v3-reranker-310m`, un reranker (reordenador) de texto en japonés desarrollado por el proyecto Ruri (Universidad de Nagoya / cl-nagoya). La conversión la publica el usuario masahiroid y es explícitamente no oficial: no procede del equipo original, que mantiene todos los créditos del modelo fuente. Su función es puntuar y reordenar pares consulta-documento para mejorar la relevancia de los resultados recuperados en sistemas de búsqueda y pipelines RAG en japonés.

Técnicamente se apoya en la arquitectura ModernBERT, un encoder transformer con 315.203.329 parámetros y pesos en bfloat16 sin cuantizar. El objetivo de la conversión es permitir la ejecución nativa en Apple Silicon a través de la librería `mlx-embeddings`, evitando la dependencia de PyTorch y sentence-transformers en ese hardware.

Su relevancia es doble: por un lado cubre el nicho de reranking de alta calidad específico para japonés, poco atendido por los modelos multilingües generalistas; por otro, ofrece una vía de despliegue local eficiente en Mac con Apple Silicon. El repositorio es de publicación reciente y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que su validación comunitaria es todavía nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 315.203.329 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la arquitectura ModernBERT admite ventanas de hasta 8192 tokens) |
| Tipos de cuantizacion | ninguno; pesos en bfloat16 sin cuantizar, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

Otros datos del repositorio: tamano de 0,6 GB, libreria `mlx`, pipeline `text-ranking`, modelo base `cl-nagoya/ruri-v3-reranker-310m`.

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 315 millones de parametros destinado a puntuacion de relevancia. ModernBERT es una arquitectura encoder-only que sustituye el attention completo tradicional por un esquema de attention alterna (capas con attention global intercaladas con capas de attention local de ventana deslizante), incorpora embeddings posicionales rotatorios (RoPE), usa activaciones GeGLU y elimina los terminos de sesgo en las capas lineales. Todo ello reduce el coste computacional y de memoria frente a encoders clasicos como BERT o XLM-RoBERTa, especialmente en secuencias largas, y es la razon por la que resulta adecuado para reranking con ventanas amplias.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original recurrio a tecnicas de ajuste como RLHF o DPO. Tampoco se detalla el objetivo de entrenamiento exacto (cross-encoder de puntuacion o bi-encoder de similitud) mas alla de que el pipeline declarado es `text-ranking`. La innovacion tecnica de esta publicacion concreta no esta en el entrenamiento, sino en la conversion de pesos a MLX para ejecucion nativa en Apple Silicon mediante `mlx-embeddings`; el autor indica que los pesos se conservan en bfloat16 sin cuantizacion.

## Capacidades

- Reranking de textos en japones: puntuacion de relevancia de pares consulta-documento para reordenar listas de resultados (tarea `text-ranking`).
- Similitud semantica entre frases (`sentence-similarity`) mediante comparacion de embeddings, tipicamente con similitud coseno.
- Extraccion de caracteristicas (`feature-extraction`): generacion de embeddings de texto reutilizables para indexacion o filtrado.
- Procesamiento de consultas y documentos en japones; no cubre otros idiomas de forma declarada.
- Ejecucion nativa en Apple Silicon mediante MLX y el paquete `mlx-embeddings`.
- No es un modelo generativo: no produce texto libre, no razona de forma autonoma y no implementa modo "thinking".
- No se declara soporte de tool calling, function calling ni uso como agente.
- No dispone de capacidades multimodales (vision, audio) ni de otro tipo.

## Casos de uso

- Reranking en pipelines RAG en japones: tras recuperar candidatos con un buscador vectorial o lexical, este modelo reordena los documentos por relevancia antes de pasarlos al LLM generador, mejorando la precision de las respuestas cuando el corpus esta en japones.
- Busqueda empresarial interna: reordenar resultados de un buscador corporativo sobre documentacion, actas o correos en japones, de modo que los fragmentos mas pertinentes aparezcan en primer lugar.
- Comercio electronico: reordenar productos recuperados por una consulta en japones para alinear el orden con la intencion real del usuario, usando similitud entre la consulta y las descripciones de producto.
- Atencion al cliente basada en base de conocimiento: emparejar la pregunta de un usuario japones con el articulo de ayuda mas adecuado antes de que un modelo generativo redacte la respuesta.
- Recuperacion de documentacion legal o tecnica: priorizar clausulas o apartados concretos en expedientes extensos en japones, donde la diferencia entre documentos candidatos es sutil y depende del matiz de la consulta.
- Despliegue local en Mac para desarrolladores: servir el reranker en un equipo Apple Silicon sin GPU dedicada, usando MLX, para prototipado y pruebas de motores de busqueda semantica en japones.
- Evaluacion y ajuste de sistemas de recuperacion: usar las puntuaciones de relevancia como metrica auxiliar para comparar estrategias de indexado o de expansion de consulta en corpus japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de evaluacion (ni JMTEB ni ninguna otra), y tampoco se aportan mediciones de latencia o throughput para la version MLX.

## Requisitos de hardware

- Memoria para pesos: con 315.203.329 parametros en bfloat16 (2 bytes por parametro), los pesos ocupan aproximadamente 0,63 GB, en linea con el tamano de repositorio declarado de 0,6 GB.
- Memoria total estimada en inferencia: del orden de 1 a 2 GB de memoria unificada, sumando pesos, activaciones, tokenizer y overhead del runtime.
- Cabe en practicamente cualquier Mac con Apple Silicon (M1 o posterior) con 8 GB de memoria unificada o mas; no requiere GPU dedicada.
- El formato MLX implica que la ejecucion esta limitada a Apple Silicon. No es directamente compatible con CUDA, vLLM, TGI, llama.cpp ni Ollama.
- Opcion de despliegue declarada: el paquete `mlx-embeddings` (`pip install -U mlx-embeddings`), cargando el modelo con `load` y generando embeddings con `generate`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/ruri-v3-reranker-310m-mlx (este) | 315.203.329 | no disponible | reranking JA | Apache-2.0 | safetensors (MLX) |
| cl-nagoya/ruri-v3-reranker-310m | no disponible en la informacion proporcionada (modelo base) | no disponible | reranking JA | Apache-2.0 | safetensors (PyTorch) |
| cl-nagoya/ruri-v3-310m | no disponible en la informacion proporcionada | no disponible | embeddings JA (bi-encoder) | no disponible en la informacion proporcionada | safetensors (PyTorch) |
| BAAI/bge-reranker-v2-m3 | ~568 M | 8192 | reranking multilingue | Apache-2.0 | safetensors y otras |

La diferencia principal frente al modelo base `cl-nagoya/ruri-v3-reranker-310m` no es de calidad ni de tamano, sino de runtime: la version MLX esta pensada para Apple Silicon y la original para PyTorch. Frente a un reranker multilingue generalista como `bge-reranker-v2-m3`, la propuesta de la familia Ruri esta especializada en japones y es de menor tamano, aunque no se dispone de datos comparativos de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: solo declara soporte de japones (ja); su uso con otros idiomas no esta garantizado.
- Conversion no oficial: no procede del equipo cl-nagoya y no cuenta con su validacion; los pesos podrian diferir del comportamiento del modelo original.
- Metodo de puntuacion: el ejemplo de uso calcula similitud coseno sobre embeddings de consulta y documento. Si el modelo original opera como cross-encoder con una cabeza de puntuacion, esta aproximacion puede no reproducir exactamente el scoring oficial; conviene verificarlo antes de usarlo en produccion.
- No es un modelo generativo: no debe emplearse para responder preguntas ni generar texto; su salida son puntuaciones o embeddings.
- Riesgo de relevancia erronea: como cualquier reranker puede ordenar mal documentos con matices, negaciones o jerga especifica, y no dispone de mecanismos de absteccion.
- Sin cuantizaciones alternativas: solo se publican pesos en bfloat16 para MLX, lo que limita el ajuste fino de memoria y velocidad en equipos muy justos.
- Dependencia de plataforma: al ser formato MLX, queda restringido a Apple Silicon; no hay ruta oficial a CUDA.
- Estado de validacion: cero descargas y cero likes en el momento de redactar la ficha; sin pruebas comunitarias ni benchmarks publicados.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar los terminos del modelo base y atribuir adecuadamente al proyecto Ruri, dado que esta conversion es derivada.
- Datos de contexto y entrenamiento no disponibles: no puede confirmarse la longitud de secuencia soportada ni el dominio de entrenamiento, lo que dificulta estimar su comportamiento fuera del japones general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/ruri-v3-reranker-310m-mlx
- Modelo base (original): https://huggingface.co/cl-nagoya/ruri-v3-reranker-310m
- Repositorio MLX: https://github.com/ml-explore/mlx
- Paquete mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
