# mlboydaisuke/Qwen3-Reranker-0.6B-ExecuTorch

## Resumen

El modelo `mlboydaisuke/Qwen3-Reranker-0.6B-ExecuTorch` es una conversión a formato ExecuTorch del reranker Qwen3-Reranker-0.6B, desarrollado por Qwen (Alibaba Cloud) y adaptado por mlboydaisuke para ejecución en dispositivos. A diferencia de los cross-encoders clásicos (como los BERT con cabeza de regresión), este modelo es un modelo de lenguaje causal (decoder-only) que recibe un par consulta-documento y responde "sí" o "no" a la pregunta de si el documento satisface la consulta; la puntuación de relevancia se calcula como la diferencia de logits entre las respuestas "sí" y "no" (log-odds). Esta arquitectura permite aprovechar las capacidades de razonamiento de los modelos Qwen3 sin necesidad de una cabeza de clasificación adicional.

El modelo base tiene 595,8 millones de parámetros, 28 capas, dimensión oculta de 1024 y un vocabulario de 151 669 tokens. La conversión a ExecuTorch incluye tres variantes: fp32, fp16 y Core ML (fp16 para iOS), todas en formato `.pte`. La variante Core ML es la más rápida (85 ms por par de 512 tokens en un Mac arm64) y delega el 100% del grafo, mientras que XNNPACK delega el 72% en 172 subgrafos. El modelo está pensado para tareas de reranking on-device, como parte de pipelines de recuperación aumentada (RAG) o búsqueda semántica.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de reranking, no de generación; la model card proporciona métricas de error de puntuación y tiempos de inferencia en hardware específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 decoder-only (causal LM) con puntuacion por log-odds "si"/"no" |
| Parametros totales | 595,8 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (fijo en la tokenizacion) |
| Tipos de cuantizacion | fp32, fp16, Core ML fp16; int8 disponible pero no publicado |
| Idiomas soportados | Multilingue (verificado con ingles y japones en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pte (ExecuTorch), incluye variante Core ML |

## Arquitectura y entrenamiento

El modelo base es Qwen3-Reranker-0.6B, un modelo de lenguaje causal de la familia Qwen3. En lugar de usar una cabeza de regresión como los cross-encoders tradicionales, se le presenta un prompt estructurado que pide al modelo juzgar si un documento cumple los requisitos de una consulta, con una respuesta binaria "sí" o "no". La puntuación final se obtiene restando el logit de "no" del logit de "sí" (log-odds), lo que equivale a un producto escalar contra la diferencia de las dos filas de la matriz de embeddings de salida. Esta operación permite plegar la proyección de salida en un único vector, evitando ejecutar el `lm_head` completo (151 669 dimensiones) y reduciendo el coste computacional y de memoria.

No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de ajuste (RLHF, DPO, etc.) en la documentación proporcionada. La model card indica que el modelo fue entrenado para leer un marco de prompt específico y que no es un modelo de chat de propósito general. La conversión a ExecuTorch mantiene la fidelidad numérica: la variante fp32 reproduce exactamente los logits del modelo eager (error 0.0000), mientras que fp16 y Core ML presentan errores de 0.0247 y 0.0573 logits respectivamente, sin alterar el orden de los resultados en las pruebas realizadas.

## Capacidades

- Reranking de pares consulta-documento: dado un query y un documento, devuelve una puntuación de relevancia (log-odds) que permite ordenar candidatos.
- Multilingüe: la model card verifica que funciona correctamente con pasajes en japonés e inglés, superando a rerankers inglés-only como ms-marco-MiniLM en pruebas multilingües.
- Ejecución on-device: gracias a ExecuTorch y XNNPACK, puede ejecutarse en dispositivos móviles y edge; la variante Core ML está optimizada para iOS.
- Plegado de la proyección de salida: la diferencia de logits se calcula como un único producto escalar, eliminando la necesidad de ejecutar la capa de salida completa.
- No es un modelo de chat: no soporta conversación libre ni tool calling; su uso está restringido al marco de prompt específico para el que fue entrenado.

## Casos de uso

- Recuperación aumentada por generación (RAG): tras una primera fase de recuperación (por ejemplo, con embeddings), el modelo rerankea los 50 o 100 candidatos más relevantes para quedarse con los mejores. Su baja latencia (85 ms por par en Core ML) lo hace adecuado para pipelines en tiempo real.
- Búsqueda semántica en dispositivos móviles: integrado en apps iOS o Android, puede rerankear resultados de búsqueda local sin conexión, gracias a la variante Core ML y al formato ExecuTorch.
- Filtrado de documentos en sistemas de atención al cliente: dado un historial de consultas y respuestas, el modelo puede ordenar las respuestas candidatas según su relevancia para la consulta del usuario.
- Clasificación de pasajes en motores de búsqueda verticales: por ejemplo, en dominios jurídicos o médicos, donde se necesita ordenar fragmentos de documentos largos según su adecuación a una consulta específica.
- Mejora de pipelines de extracción de información: antes de pasar un documento a un LLM generativo, se rerankean los pasajes más relevantes para reducir el ruido y mejorar la precisión de la extracción.
- Evaluación de relevancia en sistemas de recomendación: el modelo puede puntuar pares ítem-consulta para refinar listas de recomendaciones, aprovechando su capacidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo de reranking y no de generacion. La model card proporciona datos de rendimiento en hardware especifico (Mac arm64) y errores de puntuacion frente al modelo eager:

| Variante | Tamano (MB) | Error de puntuacion vs eager (logits) | Tiempo medio en Mac arm64 (ms) |
|---|---|---|---|
| fp32 (XNNPACK) | 2383,7 | 0.0000 | 381,5 |
| fp16 (XNNPACK) | 1192,5 | 0.0247 | 1058,0 |
| Core ML fp16 (iOS) | 1195,2 | 0.0573 | 85,0 |

El modelo eager fp32 en la misma maquina tarda 261 ms. La variante Core ML es 4,5 veces mas rapida que XNNPACK fp32 y delega el 100% del grafo, mientras que XNNPACK delega el 72% en 172 subgrafos. En pruebas con seis pares reales, todas las variantes publicadas reproducen el orden del modelo eager, con una separacion minima entre adyacentes de 0.7433 logits.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion; al ser un modelo de 595,8 M de parametros, en fp32 ocupa aproximadamente 2,4 GB en memoria, y en fp16 unos 1,2 GB.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion on-device (CPU, NPU, GPU movil) mediante ExecuTorch y Core ML.
- Compatibilidad con GPU de consumo: no se indica; el formato ExecuTorch esta orientado a dispositivos edge, no a GPUs de servidor.
- Opciones de despliegue: ExecuTorch (XNNPACK) para CPU, Core ML para iOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Mac arm64, 85 ms por par de 512 tokens con Core ML, 381,5 ms con XNNPACK fp32 y 1058 ms con XNNPACK fp16. No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3-Reranker-0.6B (original) | Qwen3 causal LM | 595,8 M | 512 (tipico) | Apache 2.0 | safetensors | Modelo base sin convertir; requiere framework de Qwen |
| mlboydaisuke/Qwen3-Reranker-0.6B-ExecuTorch | Qwen3 causal LM | 595,8 M | 512 | Apache 2.0 | .pte (ExecuTorch) | Variantes fp32, fp16, Core ML; optimizado on-device |
| ms-marco-MiniLM (cross-encoder) | BERT + regresion | ~22 M | 512 | MIT | safetensors | Ingles-only, mas pequeno pero menos preciso en multilingue |

La comparativa se basa en la informacion de la model card, que menciona a los cross-encoders BERT de la misma "estanteria" como alternativas. No se dispone de datos de rendimiento comparativo en benchmarks estandar.

## Limitaciones y advertencias

- La variante int8 no se publica porque su error de puntuacion (0.6456 logits) es demasiado alto respecto a la separacion minima entre adyacentes (0.7433), lo que podria alterar el orden de los resultados en listas de candidatos diferentes.
- El modelo requiere padding por la izquierda (left-padding) obligatorio; si se usa padding por la derecha, el grafo lee un token de padding y devuelve una puntuacion sin significado. La model card incluye una asercion para detectar este error.
- No es un modelo de chat: el prompt debe construirse exactamente con el prefijo, sufijo e instruccion especificados; usarlo con prompts libres produce resultados invalidos.
- La puntuacion es un unico numero por par; no se puede calcular correlacion sobre un vector de un elemento, por lo que la validacion se basa en el error de logits y en la preservacion del orden.
- Riesgo de alucinacion en la puntuacion: si el input no sigue el formato esperado, el modelo puede devolver numeros "confiados" pero sin significado.
- No se han publicado datos sobre sesgos, aunque al ser un modelo multilingue basado en Qwen3, podria heredar sesgos del corpus de entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero la documentacion no especifica restricciones adicionales sobre el uso del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3-Reranker-0.6B-ExecuTorch
- Modelo base Qwen3-Reranker-0.6B: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Variante CoreAI (relacionada): https://huggingface.co/mlboydaisuke/Qwen3-Reranker-0.6B-CoreAI
- Registro en Free2AI Tools: https://free2aitools.com/model/mlboydaisuke/qwen3-0.6b-executorch
- Imagen Docker de Qwen3-Reranker (referencia): https://hub.docker.com/r/aistaging/qwen3-reranker
