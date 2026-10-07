# AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP4

## Resumen

AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX desarrollado por AutomatosX, derivado directamente del modelo BF16 Qwen/Qwen3-Embedding-8B (revision `1d8ad4ca9b3dd8059ad90a75d4983776a23d44af`). Se trata de un empaquetado de pesos con precision mixta AXQuant (AXQ) pensado para ejecucion en Apple Silicon, con un tamano de safetensors de 4,35 GB y un total de descarga de aproximadamente 4,37 GB. El modelo base es un transformer denso orientado a generacion de embeddings y similitud semantica entre frases (pipeline `feature-extraction`).

El paquete aplica una cuantizacion mixta: el 91,79 % de los parametros (6,95 B) se almacena a 4 bits, el 8,21 % (621,22 M) a 8 bits y una fraccion residual (308.224 parametros) permanece en BF16. El BPW medido del modelo principal es de 4,5995, frente a los 5,2878 planificados inicialmente. La longitud de contexto configurada es de 40.960 tokens, aunque el limite practico depende de la memoria unificada del equipo.

Es relevante ahora porque permite ejecutar un modelo de embeddings de 7,57 B de parametros en hardware de Apple Silicon con un consumo de almacenamiento reducido, manteniendo en mayor precision los tensores protegidos (embeddings, normalizaciones). Conviene senalar que la propia model card lo clasifica como evidencia de desarrollo y no como una release certificada: no se publican mediciones de calidad, contexto largo ni velocidad de kernel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Qwen3ForCausalLM` (ruta de texto optimizada) |
| Parametros totales | 7.567.295.488 (~7,57 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | MXFP4 / AXQuant mixed-precision; metodos `affine`, `bf16`, `mxfp4`; tamanos de grupo 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |
| Modelo base | Qwen/Qwen3-Embedding-8B |
| Revision de origen | `1d8ad4ca9b3dd8059ad90a75d4983776a23d44af` |
| Cuantizador | AXQuant `1.9.0` |
| Clase de presupuesto en el Hub | MXFP4 |
| Clase de precision base AXQuant | 8bit |
| BPW medido (modelo principal y total) | 4,5995 |
| Tamano de safetensors | 4,35 GB |
| Descarga completa aproximada | 4,37 GB |
| Libreria | mlx |
| Pipeline | feature-extraction |
| MTP / vision / audio | no incluidos (`False`) |

Desglose de la cuantizacion por precision:

| Precision del peso principal | Parametros | Proporcion |
|---|---:|---:|
| `4bit` | 6,95 B | 91,79 % |
| `8bit` | 621,22 M | 8,21 % |
| `bf16` | 308.224 | 0,00 % |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `Qwen3ForCausalLM` en configuracion densa, reutilizada aqui como modelo de embeddings y similitud de frases. La ruta de texto es la unica optimizada en este empaquetado (`optimization scope: text-path`). No hay tensores n-gram en esta familia, segun el informe de auditoria de formato del propio repositorio.

El proceso aplicado por AutomatosX es exclusivamente de conversion y cuantizacion, no de entrenamiento adicional. La asignacion de precision se realizo mediante priors de arquitectura, sin fase de calibracion: la model card indica explicitamente `Calibration: none; the allocation is based on architecture priors`. La ejecucion del cuantizador registro 253 de 253 conversiones de modulo correctas, sin fallbacks. No se aportan datos sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible en el material proporcionado.

En cuanto a innovaciones tecnicas destacables, el elemento diferencial es el esquema AXQuant de precision mixta con "suelos de proteccion": los embeddings, las normalizaciones y otros tensores sensibles se mantienen a mayor precision (8 bits o BF16), mientras que el resto se almacena a 4 bits. El artefacto registra MLX `0.32.1` y MLX-LM `0.31.3` en el momento de la conversion, y AX Engine `7.5.7`, aunque no incluye un `model-manifest.json` nativo validado, por lo que la ejecucion bajo AX Engine no esta establecida.

## Capacidades

- Generacion de embeddings de texto y calculo de similitud semantica entre frases (`sentence-similarity`, `feature-extraction`).
- Extraccion de caracteristicas (representaciones vectoriales) para busqueda semantica y recuperacion.
- Procesamiento de contexto largo de hasta 40.960 tokens configurados, sujeto a la memoria unificada disponible.
- Inferencia de backbone de texto mediante MLX-LM.
- No incluye capacidades de vision (`vision: False` ni sidecar `vision.safetensors`).
- No incluye capacidades de audio (`audio: False`).
- No incluye decodificacion especulativa multi-token (`MTP present: False`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se detallan los idiomas soportados.

## Casos de uso

- Busqueda semantica sobre documentacion interna: el modelo genera embeddings de consultas y documentos que se indexan en una base vectorial; los 40.960 tokens de contexto permiten vectorizar fragmentos largos sin trocear en exceso.
- Sistema de recomendacion de contenido: se codifican articulos, productos o entradas de blog y se calcula la similitud coseno entre el vector del usuario y el de cada elemento para ordenar sugerencias.
- Deduplicacion y agrupamiento de textos: al generar embeddings comparables, permite detectar documentos casi identicos o agrupar tickets de soporte por tematica mediante clustering.
- Clasificacion de intenciones en chatbots: los embeddings alimentan un clasificador ligero que enruta cada mensaje entrante a la respuesta o al flujo adecuado.
- Recuperacion aumentada (RAG) en local: al ser un checkpoint MLX de 4,35 GB, puede ejecutarse en un Mac para generar embeddings de un corpus sensible sin enviar datos a servicios externos.
- Moderacion de contenido y filtrado: comparar las representaciones de textos entrantes contra un conjunto de patrones problematicos previamente vectorizados.
- Verificacion de plagio o similitud academica: medir la cercania semantica entre entregas y fuentes de referencia mediante similitud vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad de MTP, y advierte que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. El unico dato de validacion tecnica disponible es el registro de conversion: 253 de 253 conversiones de modulo completadas con exito y 0 fallbacks.

## Requisitos de hardware

- Almacenamiento: al menos 4,37 GB de espacio libre en disco para la descarga completa.
- Peso de los safetensors: 4,35 GB; el modelo no cabe en GPUs con menos de esa VRAM si se descarga completo, aunque el limite real depende de la memoria unificada y del runtime.
- Hardware objetivo: Apple Silicon (chips M-series) con memoria unificada suficiente; el formato es MLX y no esta pensado para GPUs NVIDIA o AMD.
- GPU recomendadas: no disponible; al tratarse de un checkpoint MLX, la recomendacion se expresa en terminos de equipos Apple Silicon mas que de GPUs discretas. No se ofrecen recomendaciones de A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en consumer hardware: si, en equipos Apple Silicon con memoria unificada suficiente para los 4,35 GB de pesos mas las activaciones; no se especifica el minimo exacto de memoria.
- Opciones de despliegue: MLX-LM como runtime principal. No se incluyen pesos PyTorch ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son utilizables directamente sin una conversion previa de formato. Tampoco se incluye un manifiesto nativo de AX Engine, por lo que la ejecucion nativa en AX Engine no esta establecida.
- Latencia y throughput: no disponible; no se publican mediciones de velocidad.

Comando de referencia proporcionado en la model card:

```bash
python -m pip install -U mlx-lm
mlx_lm.generate \
  --model AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP4 \
  --prompt "Explain mixed-precision quantization in three sentences." \
  --max-tokens 128 \
  --temp 0.0
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BPW / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP4 | ~7,57 B | 40.960 | 4,5995 BPW (4/8 bit + BF16) | apache-2.0 | MLX safetensors, ~4,37 GB |
| AX-Qwen3-Embedding-8B-MLX-AXQ-4bit (sibling) | ~7,57 B (base) | no disponible | Presupuesto AXQ mas bajo; BPW exacto a consultar | apache-2.0 | MLX safetensors (hermano del mismo autor) |
| AX-Qwen3-Embedding-8B-MLX-AXQ-8bit (sibling) | ~7,57 B (base) | no disponible | Precision media cercana al presupuesto de 8 BPW | apache-2.0 | MLX safetensors (hermano del mismo autor) |
| Qwen/Qwen3-Embedding-8B (modelo base, BF16) | ~7,57 B | no disponible | BF16 sin cuantizar | apache-2.0 | Pesos BF16 originales |

No se dispone de datos de rendimiento comparado entre estas variantes. La model card advierte que, en modelos pequenos o muy protegidos, los suelos de proteccion pueden elevar un paquete etiquetado como `4bit` cerca o por encima del presupuesto de un `6bit`, motivo por el que AutomatosX no publica un hermano `4bit` enganoso para esa base.

## Limitaciones y advertencias

- Evidencia de desarrollo, no release certificada: el repositorio no publica medidas de calidad, contexto largo ni velocidad, y no incluye un manifiesto nativo de AX Engine validado.
- Sin calibracion: la asignacion de precision se basa en priors de arquitectura, no en un conjunto de calibracion, por lo que el comportamiento de calidad frente al BF16 original o a una cuantizacion uniforme no esta medido.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; al tratarse de un modelo orientado a embeddings, el riesgo relevante es el de degradacion de la representacion vectorial, no la generacion de texto libre.
- Idiomas soportados: no disponible; no se especifica cobertura multilingue.
- Limitacion de contexto: los 40.960 tokens son el maximo configurado, pero el limite practico depende de la memoria unificada del equipo, por lo que en hardware ajustado el contexto efectivo sera menor.
- Restricciones de licencia: licencia apache-2.0, que en principio permite uso comercial; conviene verificar la licencia del modelo base Qwen3-Embedding-8B y de cualquier servicio derivado.
- Compatibilidad de runtime: MLX-LM puede ignorar los metadatos de runtime de AXQuant y los sidecars opcionales; el comando de la model card no establece aceleracion por MTP ni calidad vision-lenguaje.
- Portabilidad: no hay pesos PyTorch ni GGUF, por lo que este artefacto no es utilizable directamente en ecosistemas fuera de MLX sin conversion.
- Caveat de produccion: se recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de la rama `main`.
- Adopcion muy baja: 32 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-MXFP4
- Modelo base Qwen/Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Revision de origen del modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B/tree/1d8ad4ca9b3dd8059ad90a75d4983776a23d44af
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-4bit
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Qwen3-Embedding-8B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
