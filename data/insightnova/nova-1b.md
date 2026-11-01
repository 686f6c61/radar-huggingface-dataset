# Insightnova/Nova-1B

## Resumen

Nova-1B es un modelo de lenguaje causal decoder-only de 1.220.640.156 parámetros (~1,22B) desarrollado por INSIGHTNOVA Inc. para generación de texto bilingüe coreano-inglés. Su rasgo diferencial es la arquitectura híbrida: alterna 26 capas combinando bloques Gated DeltaNet 2 (GDN2), un mecanismo de atención lineal con estado recurrente, y bloques de atención clásica con grouped-query attention (GQA). Esta mezcla busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la calidad de la atención completa en una parte de las capas.

El modelo se distribuye con licencia Apache 2.0, pesos en safetensors FP32 (~4,9 GB) y código de implementación propio en el repositorio, lo que obliga a cargarlo con `trust_remote_code=True`. Soporta una ventana de contexto de 8.192 tokens y emplea un tokenizador Byte-Level BPE de 65.536 entradas entrenado internamente. Está pensado para inferencia en GPU con PyTorch estándar, con una ruta rápida opcional basada en FlashAttention/FLA.

Su relevancia actual reside en dos factores: por un lado, es un ejemplo práctico de arquitectura híbrida lineal-atención en un tamaño pequeño, un patrón que está ganando tracción frente al transformer puro; por otro, incluye un pipeline de alineamiento completo (SFT, DPO y RL con SAPO) sobre un total de ~372B tokens acumulados de entrada y rollout, lo que lo sitúa por encima del simple preentrenamiento en cuanto a seguimiento de instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only causal, híbrida GDN2 + GQA (26 capas: 13 bloques GDN2 y 13 de atención) |
| Parámetros totales | 1.220.640.156 (~1,22B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos FP32 safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 (código y documentación) |
| Formato de pesos | Safetensors FP32 (~4,9 GB), con autocast BF16 en CUDA por defecto |

Otros datos técnicos: hidden size 1.536, FFNN 6.144, atención con 12 cabezas de query y 4 cabezas KV, ventana deslizante de 4.096 tokens, RoPE y QK-norm. Tokenizador Byte-Level BPE de 65.536 tokens. Embeddings de entrada y cabeza de salida atados.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only híbrido. De las 26 capas, 13 son bloques Gated DeltaNet 2 (GDN2), un mecanismo de atención lineal con estado recurrente y compuertas, y las otras 13 son bloques de atención con grouped-query attention (12 cabezas Q, 4 cabezas KV), ventana deslizante de 4.096 tokens, RoPE y QK-norm. La intercalación de ambos tipos de bloque busca combinar la eficiencia de GDN2 en secuencias largas con la capacidad de recuperación precisa de la atención completa. Los embeddings de entrada y la cabeza de salida están atados, y el checkpoint liberado almacena la cabeza una sola vez.

El entrenamiento se realizó en tres etapas de preentrenamiento sobre datos públicos, seguido de supervisión fina (SFT), optimización directa de preferencias (DPO) y aprendizaje por refuerzo con soft adaptive policy optimization (SAPO). El cómputo acumulado asciende a ~372B tokens de entrada y rollout. El modelo final publicado es el checkpoint tras SFT, DPO y RL. La implementación se distribuye junto con los pesos: un load por defecto usa cuatro ficheros (`configuration_nova.py`, `modeling_nova.py`, `generation_nova.py` y `cpu_backend.py`) y depende solo de PyTorch, Transformers y safetensors; el resto de módulos (`architecture*.py`, `gdn2*.py`, `fast_decode.py`, `sequence_utils.py`) pertenecen al backend opcional FlashAttention/FLA.

## Capacidades

- Generación de texto causal en coreano e inglés, con decodificación greedy por defecto y muestreo configurable (temperatura 0,8, top_p 0,95, top_k 0).
- Respuesta a preguntas en formato de texto plano (`질문: ...\n답변:` en coreano; instrucción explícita en inglés).
- Traducción inglés a coreano mediante prompts de instrucción.
- Seguimiento de instrucciones tras el pipeline de SFT, DPO y RL.
- Procesamiento por lotes con padding izquierdo y derecho, y decodificación conjunta de prompts de igual longitud mediante `generation_batch_size`.
- Ruta rápida opcional de decodificación basada en FlashAttention/FLA para acelerar la inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente conversacional en coreano para atención al cliente: el modelo puede gestionar turnos con prompts de texto plano y una ventana de 8.192 tokens, suficiente para incorporar historial de conversación e instrucciones de negocio en el mismo contexto.
- Traducción automática inglés-coreano en pipelines de localización: con un prompt de instrucción fijo (`Translate the following English sentence into Korean`), el modelo produce la traducción directamente y puede integrarse en lotes mediante `generation_batch_size`.
- Generación de respuestas para bases de conocimiento internas en coreano: dado su entrenamiento bilingüe y su tamaño reducido, es viable desplegarlo en una GPU de gama media para responder consultas frecuentes con contexto documental acotado.
- Prototipado de arquitecturas híbridas en investigación: al publicar la implementación GDN2/GQA junto con los pesos, sirve como referencia reproducible para estudiar el equilibrio entre atención lineal y atención completa en modelos de ~1B.
- Clasificación y extracción de información ligera mediante prompting: tareas de resumen, reescritura o extracción de entidades en coreano e inglés que no requieran tool calling.
- Evaluación de alineamiento con DPO y SAPO: el checkpoint final permite reproducir experimentos de preferencia y RL sobre una base pequeña, con coste de cómputo contenido.
- Despliegue en entornos con presupuesto de memoria ajustado: los pesos FP32 (~4,9 GB) caben en GPUs consumer de 8-12 GB con autocast BF16, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 ocupan ~4,9 GB; con autocast BF16 en CUDA el cómputo se reduce pero los pesos FP32 permanecen en memoria, por lo que se recomienda al menos 8 GB de VRAM para el modelo y margen para el contexto.
- GPU recomendadas: no se especifican modelos concretos; el autor valida en GPU NVIDIA con backend `torch`, BF16 autocast y FP32, y en Windows sobre CPU con FP32.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas de 8-12 GB (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) siempre que se disponga del margen suficiente para la ventana de 8.192 tokens; no se han publicado mediciones específicas.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM` de Transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni formatos GGUF.
- Latencia y throughput: no disponibles. El autor menciona una ruta rápida opcional con FlashAttention/FLA y una decodificación por lotes de prompts de igual longitud, pero sin cifras publicadas.
- La inferencia en CPU es posible pero no es el objetivo de diseño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nova-1B | ~1,22B | 8.192 | Híbrida GDN2 + GQA | ko, en | Apache 2.0 | HuggingFace, código en GitHub |
| Alternativas de ~1B (datos no disponibles en la información proporcionada) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datos públicos, es esperable que herede sesgos presentes en ellos, pero no se aporta análisis específico.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de tasa de alucinación; en un modelo de 1,22B el riesgo en dominios especializados es alto.
- Limitaciones de idioma: solo coreano e inglés; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Limitaciones de contexto: la ventana es de 8.192 tokens y `max_new_tokens` se recorta al espacio restante; además, la atención usa ventana deslizante de 4.096 tokens en las capas con GQA, lo que puede afectar a la recuperación de información muy lejana dentro del contexto.
- Sin plantilla de chat: el modelo se distribuye sin `chat_template` y el autor indica que el prompting en texto plano funciona mejor; esto complica la integración con frameworks que esperan formato conversacional.
- Requiere `trust_remote_code=True`: el código de modelado se descarga y ejecuta desde el repositorio, lo que implica un riesgo de seguridad en producción; se recomienda fijar un commit revisado mediante `revision="<commit-sha>"`.
- Versión de Transformers validada: 4.57.6; otras versiones no están probadas y el código emite advertencias al detectarlas.
- Precisión: BF16 autocast altera ligeramente los logits y puede producir salidas distintas frente a FP32; el autor observa cualitativamente mayor robustez en FP32 en algunos prompts.
- Licencia: Apache 2.0 para código y documentación; no se detallan restricciones adicionales para uso comercial de los pesos más allá de las obligaciones de la propia licencia.
- Madurez: el repositorio registra 3 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy temprana y escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Insightnova/Nova-1B
- Repositorio de código y documentación: https://github.com/insightnova/Nova-1B
