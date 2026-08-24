# mlboydaisuke/all-MiniLM-L6-v2-ExecuTorch

## Resumen

`mlboydaisuke/all-MiniLM-L6-v2-ExecuTorch` es una exportación del modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2` al formato ExecuTorch, pensada para inferencia on-device. El modelo original, con 22 millones de parámetros y arquitectura BERT de 6 capas, produce vectores de 384 dimensiones que permiten búsqueda semántica, clustering y recuperación de información sin necesidad de enviar los datos a un servidor. La versión ExecuTorch incorpora en el propio grafo el pooling por media sobre la máscara de atención y la normalización L2, de modo que el consumidor no tiene que implementar esa lógica por su cuenta. El repositorio incluye tres builds verificadas en macOS arm64: XNNPACK fp32, XNNPACK fp16 y Core ML fp32, con latencias medidas entre 2.0 ms y 26.3 ms. Es un modelo pequeño, ligero y con licencia Apache-2.0, pensado para aplicaciones de recuperación y búsqueda en dispositivos móviles o embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT de 6 capas (MiniLM) |
| Parametros totales | 22 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (fija) |
| Tipos de cuantizacion | XNNPACK fp32, XNNPACK fp16, Core ML fp32 (int8 no exporta) |
| Idiomas soportados | principalmente ingles; la verificacion incluye una frase en japones, sin especificacion oficial |
| Licencia | Apache-2.0 |
| Formato de pesos | PTE (ExecuTorch), no disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base es `sentence-transformers/all-MiniLM-L6-v2`, que a su vez deriva de MiniLM, una variante compacta de BERT con 6 capas Transformer y 384 dimensiones de representacion. El entrenamiento original (no documentado en esta exportacion) se realizo sobre pares de frases en ingles con el objetivo de producir embeddings semánticos alineados; el modelo base fue publicado por Sentence-Transformers bajo licencia Apache-2.0. La exportacion a ExecuTorch no modifica los pesos, pero incorpora en el grafo el pooling por media ponderada por la máscara de atención y la normalizacion L2, de modo que el pipeline de sentence-transformers queda integrado en el modelo. La secuencia de entrada se fija a 256 tokens, y el padding es inocuo gracias a la máscara de atención. La cuantizacion int8 no es posible en esta version: falla durante la exportacion PT2E con un `IndexError` en la tabla de embedding.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para busqueda semantica, clustering y retrieval.
- Pooling por media y normalizacion L2 incluidos en el grafo, sin logica adicional por parte del llamador.
- Compatible con entrada de `input_ids` y `attention_mask` de forma `[1, 256]` int64 y salida `[1, 384]`.
- Soporte de multiples plataformas de ejecucion: XNNPACK (CPU), Core ML (Apple Silicon) y fp16.
- Multilingue limitado: el modelo base esta entrenado principalmente en inglesa, aunque la verificacion incluye una frase en japones; no se documentan capacidades multilingue amplias.
- No es un modelo generativo: no soporta tool calling, agentes ni generacion de texto.

## Casos de uso

- Busqueda semantica en dispositivo: permite indexar documentos, notas o mensajes y recuperarlos por similitud sin enviar datos a la nube, gracias a su tamaño reducido y a la ejecucion en CPU o Core ML.
- Clustering de fragmentos de texto: util para organizar respuestas de encuestas, comentarios o tickets de soporte en grupos tematicos de forma local.
- Deduplicacion de contenido: detecta frases o parrafos duplicados en bases de conocimiento locales, con una ventana de 256 tokens que cubre la mayoria de fragmentos cortos.
- Recuperacion aumentada por generacion (RAG) en movil: sirve como componente de recuperacion en un pipeline RAG que se ejecuta integramente en el dispositivo, combinado con un modelo generativo local.
- Clasificacion por similitud de consultas: para encaminar preguntas de usuarios a categorias predefinidas comparando embeddings de las consultas con los de las categorias.
- Comparacion de textos multilingue: aunque limitado, puede alinear frases en inglesa con traducciones aproximadas en otros idiomas para tareas de coincidencia cross-lingual sencilla, como demuestra la verificacion con japones.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, etc.), pero si proporciona datos de verificacion en macOS arm64 (2026-08-23) para el mismo input de 256 tokens:

| Build | Tamano | Latencia | Coseno vs eager |
|---|---|---|---|
| XNNPACK fp32 | 90.4 MB | 14.4 ms | 1.000000 |
| XNNPACK fp16 | 45.3 MB | 26.3 ms | 0.999999 |
| Core ML fp32 | 45.4 MB | 2.0 ms | 0.999984 |

Eager fp32 en el mismo input tarda 8.5 ms. La similitud coseno se mide contra el modelo ejecutado en eager con su pooling documentado, sobre ocho frases incluida una en japones. Ademas, se verifica que los vectores son utiles: una parafrasis obtiene 0.588 de similitud frente a -0.063 de una frase no relacionada. No hay datos de benchmarks estandar de MTEB ni de otros modelos comparativos.

## Requisitos de hardware

- VRAM estimada: no aplica, es un modelo de embeddings que se ejecuta en CPU o en el Neural Engine de Apple; no requiere GPU dedicada.
- GPU recomendadas: ninguna, funciona en CPU; en dispositivos Apple se recomienda Core ML (2.0 ms en Mac arm64).
- Cabe en consumer GPU y en dispositivos moviles: si, el modelo ocupa entre 45 MB y 90 MB en disco y se ejecuta en hardware embebido.
- Opciones de despliegue: ExecuTorch con backend XNNPACK o Core ML; no es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia: 2.0 ms con Core ML, 14.4 ms con XNNPACK fp32 y 26.3 ms con fp16 en Mac arm64; XNNPACK fp32 es mas lento que eager (8.5 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pooling | Normalizacion | Formato | Licencia |
|---|---|---|---|---|---|---|
| all-MiniLM-L6-v2 (original) | 22M | 256 | media | si | safetensors | Apache-2.0 |
| all-MiniLM-L6-v2-ExecuTorch | 22M | 256 | media | si | PTE | Apache-2.0 |
| bge-small-en-v1.5 | 33M | 512 | CLS | si | safetensors | MIT |
| paraphrase-multilingual-L12 | 118M | 128 | media | no | safetensors | Apache-2.0 |

La tabla de la model card confirma que la version ExecuTorch mantiene exactamente la misma configuracion de pooling que el original, mientras que otros modelos de la misma familia (bge-small-en-v1.5, paraphrase-multilingual-L12) no coinciden en pooling ni normalizacion. En cuanto a rendimiento, no hay datos de benchmarks MTEB comparativos en la informacion disponible; solo las latencias on-device citadas.

## Limitaciones y advertencias

- La cuantizacion int8 no es exportable: falla con un `IndexError` durante la exportacion PT2E, por lo que no se puede reducir el tamano mas alla de fp16.
- XNNPACK fp32 es mas lento que PyTorch eager (14.4 ms frente a 8.5 ms) en el hardware de prueba; la ventaja real de ExecuTorch se obtiene con Core ML en Apple Silicon.
- La secuencia de entrada esta fijada a 256 tokens; textos mas largos deben fragmentarse y combinarse manualmente, lo que puede degradar la calidad de los embeddings.
- El modelo no es generativo: no admite tool calling, agentes ni generacion de texto, solo produce vectores.
- El idioma principal es inglesa; aunque la verificacion incluye japones, no se garantiza un buen rendimiento en otros idiomas.
- El pooling y la normalizacion estan fijos en el grafo: no se puede cambiar la estrategia de pooling sin reexportar el modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlboydaisuke/all-MiniLM-L6-v2-ExecuTorch
- Modelo base original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Scripts de conversion: https://github.com/john-rocky/executorch-models
- Repositorio alternativo con el mismo modelo: https://github.com/henrytanner52/all-MiniLM-L6-v2
