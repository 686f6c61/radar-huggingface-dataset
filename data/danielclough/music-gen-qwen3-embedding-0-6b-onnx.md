# DanielClough/music-gen-qwen3-embedding-0.6b-onnx

## Resumen

`DanielClough/music-gen-qwen3-embedding-0.6b-onnx` es una conversion a ONNX del modelo de embeddings de texto Qwen/Qwen3-Embedding-0.6B, publicada por el usuario DanielClough. No es un modelo nuevo ni reentrenado: es el mismo checkpoint de Qwen3-Embedding-0.6B (0.6 mil millones de parametros, licencia Apache 2.0) exportado a grafos ONNX en FP32, sin cuantizacion, para su uso como codificador de texto dentro del pipeline de generacion musical ACE-Step 1.5.

El repositorio contiene dos grafos recortados del modelo original: `text_encoder.onnx`, que devuelve los estados ocultos de la secuencia de caption (salida `[1, n, 1024]`), y `text_embed_tokens.onnx`, que expone unicamente la matriz `embed_tokens` para obtener los embeddings de los tokens de la letra. Ambos aceptan `input_ids` de tipo int64 con longitud de secuencia dinamica entre 2 y 4096 tokens. Su relevancia es acotada: no sustituye al modelo de embeddings original para tareas de recuperacion o similitud semantica, sino que sirve como componente de inferencia ONNX Runtime (con soporte CUDA) para un runner local de text-to-music.

El interes practico esta en que permite ejecutar el codificador de texto de ACE-Step 1.5 sin depender de PyTorch, con pesos verificados como identicos byte a byte a los que distribuye el proyecto ACE-Step. La calidad numerica de los grafos es alta: el error RMS relativo frente a PyTorch FP32 es de 1.3e-6 a 2.5e-6 en el codificador completo, y el grafo de `embed_tokens` es exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de Qwen3 (modelo base de embeddings), exportado a ONNX |
| Parametros totales | 0.6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | secuencia dinamica de 2 a 4096 tokens en los grafos exportados |
| Tipos de cuantizacion | ninguna; exportacion en FP32 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`text_encoder.onnx` + `.data` de 2.4 GB; `text_embed_tokens.onnx` + `.data` de 0.6 GB), con `tokenizer.json` |
| Dimension de embedding | 1024 (salida `[1, n, 1024]`) |
| Opset | 18 |
| Tamano del repositorio | 3.0 GB |
| Runtime | onnxruntime / onnxruntime-gpu |
| Modelo base | Qwen/Qwen3-Embedding-0.6B (revision `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, del equipo Qwen de Alibaba, descrito en el paper arXiv:2506.05176. Se trata de un transformer decoder-only derivado de la familia Qwen3, adaptado mediante entrenamiento de embeddings y reranking sobre modelos fundacionales. Esta publicacion concreta no entrena nada: carga el checkpoint en FP32 con `AutoModel.from_pretrained(..., attn_implementation="sdpa")` y lo exporta con `torch.onnx.export(dynamo=True)` a opset 18, con longitud de secuencia dinamica y pesos como datos externos. Posteriormente valida cada grafo contra PyTorch en CUDA con TF32 desactivado.

Los dos grafos son recortes funcionales del mismo modelo: `text_encoder` corresponde a `last_hidden_state` completo, mientras que `text_embed_tokens` aisla la capa `embed_tokens` para obtener embeddings de tokens de la letra sin ejecutar el resto de la red. El autor declara explicitamente que no se reentreno ni se cuantizo nada y que los pesos son identicos byte a byte a los que incluye ACE-Step 1.5 en `ACE-Step/Ace-Step1.5` (`model.safetensors`, sha256 `0437e45c…48e23fd`). Las versiones de herramientas usadas fueron torch 2.10.0+cu128, transformers 4.57.6, onnx 1.23.2, onnxscript 0.7.2 y onnxruntime-gpu 1.24.4.

## Capacidades

- Codificacion de texto a estados ocultos de 1024 dimensiones para secuencias de 2 a 4096 tokens.
- Extraccion de embeddings de tokens individuales mediante el grafo `text_embed_tokens`, util para representar letras de canciones a nivel de token.
- Procesamiento de captions descriptivos y letras de canciones como parte del pipeline de ACE-Step 1.5 (text-to-music).
- Inferencia acelerada por GPU via onnxruntime-gpu con CUDA 12.8.
- Tokenizacion compatible con Qwen mediante el `tokenizer.json` incluido, sin modificaciones.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un codificador de texto.
- No se documentan capacidades multilingues especificas en la informacion disponible.

## Casos de uso

- Generacion musical local con ACE-Step 1.5: el grafo `text_encoder` alimenta la etapa de condicionamiento por caption dentro del runner text-to-music, permitiendo describir el estilo, instrumentacion y ambiente de la pieza en lenguaje natural.
- Condicionamiento por letra: `text_embed_tokens` proporciona los embeddings de los tokens de la letra que el pipeline de ACE-Step consume para alinear la sintesis vocal con el texto escrito.
- Despliegue sin PyTorch: equipos que ya operan ONNX Runtime en produccion pueden integrar el codificador sin anadir una dependencia de PyTorch ni de transformers en el entorno de inferencia.
- Servicio de inferencia en contenedores ligeros: al ser grafos ONNX con datos externos, se pueden montar en imagenes Docker minimas con onnxruntime-gpu y gestionar la memoria de forma predecible.
- Pipeline de musica por lotes: generacion desatendida de bandas sonoras o jingles a partir de captions en un proceso batch, usando el codificador como primera etapa del pipeline.
- Validacion y reproducibilidad: servir como referencia para verificar que una implementacion propia del codificador de ACE-Step produce estados ocultos equivalentes a los del checkpoint oficial, gracias a los errores RMS documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo son las comprobaciones de fidelidad numerica frente a PyTorch FP32, con error RMS relativo sobre token ids aleatorios:

| Grafo | 15 tokens | 70 tokens | 256 tokens | 2048 tokens |
|---|---|---|---|---|
| `text_encoder` | 1.3e-6 | 2.1e-6 | 2.5e-6 | no disponible |
| `text_embed_tokens` | exacto | exacto | exacto | exacto |

## Requisitos de hardware

- VRAM estimada: los pesos suman 3.0 GB en FP32 (2.4 GB el codificador completo y 0.6 GB el grafo de embeddings); en la practica se necesita algo mas para activaciones y buffers de atencion, especialmente con secuencias largas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el grafo `text_embed_tokens` y 6-8 GB para `text_encoder`; el autor valido la exportacion en CUDA, por lo que se presupone compatibilidad con GPUs NVIDIA modernas.
- Cabe en GPUs de consumo: si, en tarjetas tipo RTX 3060/4060 con 8 GB o superiores, aunque no se documentan pruebas en hardware concreto.
- Opciones de despliegue: onnxruntime y onnxruntime-gpu (version validada 1.24.4); al ser ONNX estandar, cualquier runtime compatible puede cargar los grafos, aunque no se documentan pruebas con otros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DanielClough/music-gen-qwen3-embedding-0.6b-onnx | 0.6B | 2-4096 tokens | ONNX FP32 | Apache 2.0 | Dos grafos recortados para ACE-Step; sin cuantizar |
| Qwen/Qwen3-Embedding-0.6B | 0.6B | no disponible | safetensors | Apache 2.0 | Modelo original; uso general para embeddings y reranking |
| neuradex/Qwen3-Embedding-0.6B-ONNX | 0.6B | no disponible | ONNX | no disponible | Conversion ONNX alternativa del mismo modelo base, sin recortes especificos para musica |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni audio; solo devuelve estados ocultos y embeddings de tokens.
- El recorte de grafos lo hace inadecuado para tareas de similitud semantica o recuperacion; para eso debe usarse el modelo Qwen3-Embedding-0.6B original.
- La longitud de secuencia esta acotada a 4096 tokens en los grafos exportados; entradas fuera de ese rango no estan soportadas.
- El `text_encoder` presenta un error RMS relativo no nulo (hasta 2.5e-6 en las pruebas publicadas) frente a PyTorch FP32, relevante solo en escenarios de altisima precision.
- Los sesgos propios de Qwen3-Embedding-0.6B no se documentan en la informacion disponible; el autor no aporta evaluaciones de sesgo.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia, por lo que carece de validacion por parte de la comunidad.
- No se documenta soporte multilingue ni calidad en idiomas distintos del usado en las pruebas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanielClough/music-gen-qwen3-embedding-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper de Qwen3 Embedding: https://arxiv.org/abs/2506.05176
- Proyecto ACE-Step: https://huggingface.co/ACE-Step/Ace-Step1.5
- Conversion ONNX alternativa: https://huggingface.co/neuradex/Qwen3-Embedding-0.6B-ONNX
- Modelos cuantizados del base: https://huggingface.co/models?other=base_model%3Aquantized%3AQwen%2FQwen3-Embedding-0.6B
