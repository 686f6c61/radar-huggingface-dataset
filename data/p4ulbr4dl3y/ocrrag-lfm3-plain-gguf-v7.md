# p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v7

## Resumen

ocrrag-lfm3-plain-gguf-v7 es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario p4ulbr4dl3y en formato GGUF. No se trata de un modelo de propósito general, sino de un componente especializado dentro del sistema ocrrag: un respondedor extractivo con anclaje documental ("grounded extractive answerer") que recibe una ventana de fragmentos recuperados y devuelve una respuesta con citas del tipo `[chunk_id]` o un veredicto tipado de rechazo. El adaptador se entrenó sobre el checkpoint-280 (paso 275) con un eval_loss de 0,21152.

El modelo resuelve un problema concreto de los pipelines RAG sobre documentos OCR: obligar al modelo a responder únicamente con información presente en la ventana de contexto, citando el fragmento exacto, y a rechazar de forma controlada cuando la respuesta no está disponible. La salida se restringe mediante gramática a un objeto `{"answer": str, "refusal": bool}`, lo que convierte el formato en una garantía de servicio.

Con 1.728.801.600 parámetros (aproximadamente 1,7B) y un repositorio de 2,9 GB que contiene dos cuantizaciones GGUF (Q4_K_M de 1,02 GiB y Q8_0 de 1,72 GiB), el modelo está pensado para despliegue en CPU o GPU de gama media. Su relevancia radica en la especialización: frente a modelos mayores, optimiza la fidelidad extractiva, la tasa de rechazo correcto y la latencia en un caso de uso acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LiquidAI/LFM3-1.7B; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de despliegue (`-c 8192`); entrenamiento con `max_length 6144` |
| Tipos de cuantizacion | Q4_K_M (1,02 GiB) y Q8_0 (1,72 GiB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el adaptador LoRA original) |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre LFM3-1.7B, un transformer de aproximadamente 1,7B parámetros. El adaptador (`p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v7`) se entrenó sobre el conjunto `p4ulbr4dl3y/ocrrag-lfm3-plain-data-v7`, compuesto por 2268 filas de entrenamiento, 154 de validación y 108 de test, con una proporción de rechazos del 35,1%. El mejor checkpoint fue el 280 (paso 275), con eval_loss de 0,21152. El prompt de servicio tiene 2530 caracteres, sha256 `5449aca38687225a`, y se ejecuta con `enable_thinking=False`.

Una innovación destacable es el uso de decodificación restringida por gramática sobre el objeto `{"answer": str, "refusal": bool}`, que garantiza la estructura de salida en producción. Además, el entrenamiento incorpora ejemplos de rechazo tipado, lo que permite al modelo abstenerse cuando la respuesta no está en la ventana recuperada. Se descartaron 118 de las 2268 filas de entrenamiento (5,2%) por superar `max_length 6144`, correspondientes a las ventanas de tablas más largas, que es precisamente donde el recall es peor.

## Capacidades

- Generación de respuestas extractivas ancladas a una ventana de fragmentos recuperados, con citas `[chunk_id]`.
- Rechazo controlado mediante veredicto tipado cuando la información no está en el contexto.
- Salida estructurada garantizada por gramática: `{"answer": str, "refusal": bool}`.
- Manejo de ventanas de contexto de hasta 8192 tokens en despliegue.
- Procesamiento de contenido tabular dentro de los documentos, aunque con recall limitado (0,40–0,44 en tablas).
- Integración con servidores compatibles con la API de endpoints (`llama-server` con `--jinja`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking (de hecho, `enable_thinking=False`).

## Casos de uso

- Respuesta documental en pipelines RAG sobre documentos OCR: el modelo recibe los fragmentos recuperados y devuelve una respuesta citada, lo que permite auditar la fuente de cada afirmación en sistemas de consulta documental.
- Atención al cliente sobre base de conocimiento: con 8192 tokens de contexto puede procesar varios fragmentos recuperados y responder citando el documento, o rechazar cuando la consulta queda fuera de la base.
- Extracción de datos de contratos y facturas: el formato de salida estructurado permite consumir la respuesta de forma programática en flujos de extracción, con veredicto de rechazo cuando el dato no aparece.
- Verificación de cumplimiento normativo: la combinación de citas y rechazo tipado facilita generar respuestas trazables para auditorías internas.
- Despliegue en CPU: la cuantización Q4_K_M de 1,02 GiB permite ejecutar el modelo en servidores sin GPU, con latencia p50 de 11,2 s en el test de referencia.
- Despliegue en GPU de consumo o Apple Silicon: la cuantización Q8_0 de 1,72 GiB es adecuada para Metal/GPU, con latencia p50 de 9,1 s en el mismo test.
- Filtrado previo en sistemas de búsqueda documental: el modelo puede actuar como capa de respuesta extractiva antes de derivar consultas complejas a un modelo mayor.

## Benchmarks y rendimiento

Resultados medidos sobre el mismo test de 108 filas (64 respondibles, 44 vacías):

| Artefacto | Estructurado | Sobre-rechazo | Rechazo en vacías | Citadas | Similitud | Cifras fuera de ventana | p50 |
|---|---|---|---|---|---|---|---|
| v3 Q8_0 | 108/108 | 1/64 (2%) | 38/44 (86%) | 63/63 | 0,59 | 1 | 16,0 s |
| v6 Q8_0 | 108/108 | 26/64 (41%) | 37/44 (84%) | 38/38 | 0,63 | 0 | 15,4 s |
| v7 Q8_0 | 108/108 | 2/64 (3%) | 42/44 (95%) | 62/62 | 0,63 | 0 | 9,1 s |
| v7 Q4_K_M | 108/108 | 3/64 (5%) | 42/44 (95%) | 61/61 | 0,60 | 0 | 11,2 s |

Recall de cifras (cifras de referencia presentes): v7 Q8_0 texto plano 0,81 / tablas 0,40 / global 0,56; v7 Q4_K_M 0,81 / 0,44 / 0,58. El autor advierte que las latencias entre versiones no son comparables porque las ejecuciones de v3 y v6 compartieron máquina con otros tres modelos, mientras que las de v7 no; dentro de un mismo día, v7 Q8_0 (9,1 s) y v7 Q4_K_M (11,2 s) sí son comparables.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1–1,3 GB para Q4_K_M y 1,8–2,0 GB para Q8_0, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2–3 GB de VRAM libre; el modelo es viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas de capacidad.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más; también en Apple Silicon vía Metal con la cuantización Q8_0.
- Despliegue en CPU: viable con Q4_K_M, que es el artefacto destinado a cliente según el autor.
- Opciones de despliegue: `llama-server` (llama.cpp) con `--jinja`, `-ngl 99`, `-c 8192`, `--temp 0`, `-np 1`; compatible con endpoints según los tags del repositorio. No se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia: p50 de 9,1 s con Q8_0 y 11,2 s con Q4_K_M en el test de 108 filas; no se documenta throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| ocrrag-lfm3-plain-gguf-v7 | 1,7B | 8192 (despliegue) | Respondedor extractivo con citas y rechazo | no disponible | GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Modelo conversacional general | no disponible | safetensors |
| Modelos RAG generalistas de 1–3B | no disponible | no disponible | Generación aumentada sin formato garantizado | variable | variable |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Recall limitado en tablas: 0,40–0,44, porque la respuesta debe nombrar fila y columna; es el punto débil declarado por el autor.
- Se descartaron 118 filas de entrenamiento (5,2%) por superar `max_length 6144`, precisamente las ventanas de tablas más largas, lo que agrava el problema anterior.
- La decisión de rechazar o responder se cubre mejor con el reranker libre que con este adaptador; el adaptador se ocupa del texto, no de la clasificación.
- El prompt de sistema debe enviarse byte a byte tal como se sirvió (2530 caracteres, sha256 `5449aca38687225a`); cualquier variación puede degradar el comportamiento.
- La gramática sobre el objeto de salida es una garantía de servicio, no un sustituto del entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; el entrenamiento parece orientado a un caso de uso concreto y no a cobertura multilingüe.
- Riesgo de alucinación mitigado por el anclaje y las citas, pero no eliminado; el modelo puede omitir cifras presentes en la ventana (recall global 0,56–0,58).
- Las latencias publicadas no son comparables entre versiones por diferencias en la carga de la máquina de evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v7
- Adaptador LoRA: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v7
- Dataset de entrenamiento: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-data-v7
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
