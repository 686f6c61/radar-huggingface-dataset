# mlboydaisuke/bge-small-en-v1.5-ExecuTorch

## Resumen

El modelo `mlboydaisuke/bge-small-en-v1.5-ExecuTorch` es una conversión del modelo de embeddings `BAAI/bge-small-en-v1.5` al formato ExecuTorch, el runtime de ejecución en dispositivo de PyTorch. Se trata de un modelo encoder-only basado en BERT con 33 millones de parámetros y 12 capas, que produce vectores de 384 dimensiones a partir de texto. Su propósito es ofrecer búsqueda semántica, clustering y retrieval sin necesidad de conexión a internet, manteniendo los datos en el propio dispositivo.

La relevancia de esta conversión radica en que el modelo integra en el grafo computacional la operación de pooling (token CLS) y la normalización L2, de modo que el usuario no necesita aplicar recetas externas de `sentence-transformers`. Esto evita errores silenciosos que degradan la calidad de los vectores. Se ofrecen dos backends de ejecución: XNNPACK (para CPU) y Core ML (para Apple Silicon), con tamaños de archivo de 66.7 MB a 133 MB según la precisión.

El autor publica verificaciones de latencia y fidelidad de los vectores frente al modelo eager, lo que permite evaluar rápidamente si la conversión es apta para producción en entornos móviles o de escritorio. La licencia MIT permite uso comercial sin restricciones de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (12 capas, 12 cabezas) |
| Parametros totales | 33 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (fija) |
| Tipos de cuantizacion | fp32 y fp16 (int8 no disponible) |
| Idiomas soportados | Ingles (modelo base); verificado con una frase en japones |
| Licencia | MIT |
| Formato de pesos | ExecuTorch (.pte) con backends XNNPACK y Core ML |

## Arquitectura y entrenamiento

El modelo base es `BAAI/bge-small-en-v1.5`, un encoder BERT de 12 capas con una salida de 384 dimensiones, entrenado por la Academia de Inteligencia Artificial de Pekin (BAAI) para tareas de retrieval denso y similaridad semantica. La version original se entrena con objetivos de contraste sobre pares de frases, y el modelo final se usa con pooling del token CLS seguido de normalizacion L2.

La conversion a ExecuTorch incorpora esas dos operaciones dentro del grafo exportado, de modo que el consumidor del modelo recibe directamente el vector normalizado sin depender de configuraciones externas. El autor documenta que los tres modelos de su coleccion (all-MiniLM-L6-v2, bge-small-en-v1.5 y paraphrase-multilingual-L12) usan recetas de pooling distintas, y que aplicar la receta incorrecta no lanza errores pero degrada la calidad de los embeddings. Por eso la decision de incrustar el pooling en el grafo es una mejora de robustez para integracion en produccion.

El proceso de exportacion esta documentado en el repositorio `executorch-models`, y la secuencia de entrada se fija en 256 tokens, con `attention_mask` para ignorar padding. No se mencionan datos de entrenamiento adicionales ni etapas de RLHF, ya que no aplican a un modelo de embeddings.

## Capacidades

- Genera embeddings de frases de 384 dimensiones listos para usar en busqueda semantica, clustering y retrieval.
- Incluye pooling CLS y normalizacion L2 integrados en el grafo, evitando errores de implementacion en el cliente.
- Ejecucion en dispositivo sin conexion a internet, ideal para aplicaciones que requieren privacidad de datos.
- Soporta entrada de hasta 256 tokens; textos mas largos deben dividirse en fragmentos.
- Verificado con frases en ingles y una frase en japones, aunque el modelo base esta optimizado para ingles.
- No incluye capacidades de generacion de texto, tool calling ni agentes, al ser un modelo encoder.

## Casos de uso

- Busqueda semantica en aplicaciones moviles: el modelo se ejecuta en el dispositivo y permite buscar documentos, notas o mensajes por significado, sin enviar el texto a un servidor. La latencia en Core ML (3.6 ms) lo hace apto para consultas interactivas.
- Clustering de documentos en local: se pueden agrupar correos, articulos o informes por contenido en un ordenador portatil o un telefono, sin depender de una API externa.
- Retrieval aumentado por generacion (RAG) en el borde: se puede combinar con un modelo generativo en el dispositivo para responder preguntas sobre un corpus local, manteniendo la privacidad de los datos.
- Deteccion de duplicados en bases de datos personales: se calculan embeddings de entradas de texto y se comparan con una metrica de similaridad coseno para identificar registros repetidos.
- Sistemas de recomendacion basados en contenido: se representan articulos o productos como vectores y se calculan distancias para sugerir elementos similares al usuario.
- Analisis de sentimiento o clasificacion de texto ligera: se alimenta un clasificador simple (p. ej. una regresion logistica) con los embeddings de 384 dimensiones para categorizar textos, aprovechando la ejecucion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks MTEB para esta version ExecuTorch. La model card del autor incluye las siguientes verificaciones de latencia y consistencia (Mac arm64, 2026-08-23):

| Build | Tamano | Latencia | Peor cosine vs eager |
|---|---|---|---|
| XNNPACK fp32 | 133.0 MB | 28.7 ms | 1.000000 |
| XNNPACK fp16 | 66.7 MB | 50.9 ms | 1.000000 |
| Core ML fp32 | 66.9 MB | 3.6 ms | 0.999990 |

El modelo eager fp32 tarda 16.3 ms en la misma entrada. La tabla muestra que la conversion a Core ML ofrece una aceleracion de aproximadamente 4.5x sobre eager, mientras que XNNPACK fp32 es mas lento que eager. La similaridad cosica se mide sobre ocho frases, incluyendo una en japones, comparando el resultado con el modelo eager ejecutado con su pooling documentado.

## Requisitos de hardware

- VRAM estimada: no aplica, es un modelo de CPU; la memoria RAM necesaria es de unos 67 MB (fp16) o 133 MB (fp32) para el peso del modelo.
- GPU recomendadas: no requiere GPU; funciona en CPU de dispositivos moviles y de escritorio.
- Compatibilidad con GPU de consumo: no aplica, se ejecuta en CPU.
- Opciones de despliegue: ExecuTorch con backend XNNPACK (para CPU general) o Core ML (para Apple Silicon). Tambien se puede ejecutar en modo eager con PyTorch si se usa el modelo base original.
- Latencia y throughput: en Mac arm64, 3.6 ms por llamada con Core ML, 28.7 ms con XNNPACK fp32 y 50.9 ms con XNNPACK fp16. En dispositivos moviles se espera un rendimiento similar, aunque depende del SoC.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Contexto | Pooling | Backend | Licencia |
|---|---|---|---|---|---|---|
| bge-small-en-v1.5-ExecuTorch | 33M | 384 | 256 | CLS + L2 (en grafo) | ExecuTorch (XNNPACK/Core ML) | MIT |
| all-MiniLM-L6-v2 (ExecuTorch) | 22M | 384 | 256 | Mean (en grafo) | ExecuTorch | Apache 2.0 |
| paraphrase-multilingual-L12 (ExecuTorch) | 118M | 768 | 256 | Mean (en grafo) | ExecuTorch | Apache 2.0 |

La comparativa se basa en los datos de la model card del autor, que confirma que los tres modelos usan recetas de pooling distintas. El modelo bge-small-en-v1.5 destaca por su normalizacion L2 integrada, mientras que all-MiniLM-L6-v2 es mas ligero y paraphrase-multilingual-L12 ofrece soporte multilingue. No se dispone de benchmarks MTEB para estas versiones ExecuTorch, aunque el modelo base BAAI/bge-small-en-v1.5 tiene resultados publicados en MTEB.

## Limitaciones y advertencias

- La cuantizacion int8 no esta disponible: la exportacion falla con un error de indices de tipo incorrecto en la capa de embedding lookup, lo que impide reducir el tamano del modelo.
- La longitud de secuencia esta fijada en 256 tokens; textos mas largos deben dividirse en fragmentos, lo que puede afectar a la calidad de la representacion de documentos extensos.
- XNNPACK fp32 es mas lento que el modelo eager (28.7 ms frente a 16.3 ms), por lo que no siempre es la opcion adecuada para CPU; en dispositivos Apple se recomienda el backend Core ML.
- El modelo base esta optimizado para ingles; aunque la verificacion incluye una frase en japones, el rendimiento en otros idiomas no esta garantizado.
- No es un modelo generativo: no puede completar texto ni responder preguntas por si solo; solo produce embeddings para tareas de retrieval y similaridad.
- La calidad de los embeddings depende de que se respete el pooling integrado; si el consumidor aplica un pooling distinto (por ejemplo, mean en lugar de CLS), los vectores pueden parecer validos pero degradar el ranking.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/mlboydaisuke/bge-small-en-v1.5-ExecuTorch
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Documentacion de BGE v1 y v1.5: https://bge-model.com/bge/bge_v1_v1.5.html
- Scripts de conversion (executorch-models): https://github.com/john-rocky/executorch-models
