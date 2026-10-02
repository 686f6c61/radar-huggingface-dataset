# liodon-ai/baguettotron-600m-ONNX

## Resumen

`liodon-ai/baguettotron-600m-ONNX` es una exportación al formato ONNX del modelo `PleIAs/baguettotron-600m`, publicada por el colectivo Liodon AI. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos pensada para su ejecución con el runtime ONNX Runtime (ONNX) en lugar de con PyTorch, lo que facilita el despliegue en entornos de producción heterogéneos (CPU, GPU y aceleradores diversos). El repositorio ocupa 4,8 GB e incluye tres variantes del mismo grafo: FP32, FP16 e INT8 dinámico.

Según el nombre y los metadatos, el modelo base ronda los 600 millones de parámetros y el repositorio de exportación incluye la etiqueta `llama`, lo que apunta a una arquitectura transformer de tipo decoder con convenciones propias de la familia Llama. La conversión se realizó con la librería `optimum` (tarea `text-generation-with-past`), de modo que el grafo expone entradas y salidas de clave-valor (past key-value) para decodificación autorregresiva con caché KV activada.

Su relevancia es fundamentalmente práctica: permite desplegar un modelo conversacional de tamano pequeno con ONNX Runtime, aprovechando optimizaciones de ejecución y cuantización sin necesidad de dependencias de PyTorch. Conviene senalar que la informacion disponible no detalla el dataset de entrenamiento, la longitud de contexto, los idiomas soportados ni resultados de benchmarks, por lo que la ficha los marca como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `llama` en el repositorio de exportacion); detalles del modelo base no disponibles |
| Parametros totales | Aproximadamente 600 M (segun el nombre del modelo; no confirmado en la informacion disponible) |
| Parametros activos | No aplica (no se indica que sea MoE; dato no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (model.onnx), FP16 (model_fp16.onnx) e INT8 dinamico weight-only sin calibracion (model_quantized.onnx) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar en la informacion proporcionada) |
| Formato de pesos | ONNX (grafo con KV-cache, exportado con optimum, tarea `text-generation-with-past`) |

## Arquitectura y entrenamiento

El objeto de este repositorio no es un entrenamiento, sino una exportacion. `liodon-ai/baguettotron-600m-ONNX` convierte el modelo `PleIAs/baguettotron-600m` a formato ONNX mediante `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`. Esto implica que el grafo resultante incluye entradas y salidas de `past_key_values` (clave y valor), habilitando la decodificacion autorregresiva con cache KV y evitando recalcular toda la secuencia en cada token generado.

El repositorio incluye tres ficheros: `model.onnx` (2,70 GB, FP32), `model_fp16.onnx` (1,45 GB, FP16, pensado para execution providers de GPU) y `model_quantized.onnx` (0,68 GB, cuantizacion INT8 dinamica weight-only, sin fase de calibracion). No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni sobre innovaciones tecnicas del modelo base (atencion lineal, decodificacion especulativa, etc.). Todos esos datos quedan como no disponibles.

## Capacidades

- Generacion de texto autoregresiva, segun la tarea declarada `text-generation`.
- Uso conversacional, segun la etiqueta `conversational`.
- Decodificacion con cache KV gracias a la exposicion de `past_key_values` en el grafo.
- Ejecucion en CPU y en GPU mediante los distintos execution providers de ONNX Runtime (por ejemplo CPUExecutionProvider, CUDA, TensorRT o DirectML).
- Ejecucion en precision completa, media precision o enteros de 8 bits segun la variante elegida.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; la model card no lista idiomas.

## Casos de uso

- Despliegue en produccion sin PyTorch: al ser un grafo ONNX, se puede servir con ONNX Runtime en entornos donde instalar PyTorch no es viable (contenedores ligeros, dispositivos embebidos, plataformas Windows con DirectML).
- Inferencia en CPU a bajo coste: la variante INT8 de 0,68 GB permite ejecutar generacion de texto en servidores sin GPU, con una huella de memoria reducida.
- Servicios de chatbot o asistencia conversacional ligera: el pipeline declarado es `text-generation` y el tag `conversational`, por lo que encaja en respuestas de texto de un turno o multi-turno con contexto limitado.
- Integracion en pipelines de aplicaciones .NET o C#: ONNX Runtime dispone de bindings nativos para estos entornos, donde el ecosistema de PyTorch es menos comodo.
- Prototipado rapido y evaluacion de modelos pequenos: el tamano contenido (600 M de parametros) permite iterar en un portatil sin GPU dedicada.
- Educacion y experimentacion: util para estudiar el flujo de exportacion ONNX con Optimum, el manejo manual de KV-cache y la comparativa entre precisiones.
- Despliegue en GPU de gama de entrada: la variante FP16 de 1,45 GB cabe en practicamente cualquier GPU moderna con al menos 2-3 GB de VRAM libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de exportacion no incluye metricas (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base en precision original, por lo que no se pueden aportar cifras sin inventarlas.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de runtime ni KV-cache):
  - FP32 (`model.onnx`, 2,70 GB): alrededor de 3-4 GB de memoria.
  - FP16 (`model_fp16.onnx`, 1,45 GB): alrededor de 2-3 GB de memoria.
  - INT8 (`model_quantized.onnx`, 0,68 GB): alrededor de 1-2 GB de memoria.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime, incluidas NVIDIA (CUDA/TensorRT), AMD (ROCm o DirectML) e integradas compatibles con DirectML. Por tamano, basta con una GTX 1050 Ti, RTX 3050, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, en todas las variantes; la INT8 tambien es viable en CPU sola.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider, CUDAExecutionProvider, TensorrtExecutionProvider, DirectMLExecutionProvider, OpenVINO, etc.) y el wrapper `optimum.onnxruntime.ORTModelForCausalLM`, que gestiona automaticamente el mantenimiento del KV-cache.
- Latencia y throughput estimados: no disponibles; dependen del execution provider, la precision y el hardware, y no se aportan cifras en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. Como referencia interna del propio repositorio, la unica comparacion objetiva disponible es entre sus tres variantes:

| Variante | Tamano | Precision | Uso previsto |
|---|---|---|---|
| `model.onnx` | 2,70 GB | FP32 | Maxima fidelidad numerica, ejecucion en CPU o GPU |
| `model_fp16.onnx` | 1,45 GB | FP16 | GPU con soporte de media precision |
| `model_quantized.onnx` | 0,68 GB | INT8 dinamico (weight-only) | CPU, entornos con memoria limitada |

Comparacion con alternativas de la misma categoria (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- La informacion disponible no detalla sesgos conocidos del modelo base; no se pueden enumerar.
- Riesgo de alucinacion propio de los modelos generativos de 600 M de parametros, especialmente en tareas de conocimiento factual; no se aportan evaluaciones al respecto.
- No se especifica la longitud de contexto, lo que impide garantizar el comportamiento en conversaciones largas.
- No se listan idiomas soportados; no se puede confirmar un rendimiento adecuado en castellano u otras lenguas.
- Licencia `other`: no queda claro si se permite el uso comercial. Es imprescindible revisar los terminos del modelo base `PleIAs/baguettotron-600m` antes de cualquier uso en produccion.
- La cuantizacion INT8 es dinamica y sin calibracion, por lo que puede degradar la calidad de las respuestas frente a FP32 o FP16.
- El uso directo del grafo ONNX requiere gestionar manualmente las entradas de KV-cache (tensores de longitud cero en la primera pasada); se recomienda emplear `ORTModelForCausalLM` de Optimum para evitar errores.
- El repositorio no incluye tokenizador propio: hay que cargarlo desde `liodon-ai/baguettotron-600m-ONNX` o desde el modelo base con `AutoTokenizer`.
- No se han publicado benchmarks que permitan validar el rendimiento en produccion antes de desplegarlo.

## Enlaces

- Repositorio ONNX: https://huggingface.co/liodon-ai/baguettotron-600m-ONNX
- Modelo base: https://huggingface.co/PleIAs/baguettotron-600m
- Modelo base (variante Baguettotron): https://huggingface.co/PleIAs/Baguettotron
- Sitio web de Liodon AI: https://liodon.ai/
- GitHub de Liodon AI: https://github.com/Liodon-AI
- Libreria Optimum (usada para la exportacion): https://github.com/huggingface/optimum
- ONNX Model Zoo: https://github.com/onnx/models
