# Kausp11/searchlm-dclm_nc-v1_d24_chin28

## Resumen

Search-LLM, DCLM-Edu 1.4B es un modelo de lenguaje base (preentrenado, sin ajuste de instrucciones) desarrollado por el usuario Kausp11 y publicado en Hugging Face bajo el identificador `Kausp11/searchlm-dclm_nc-v1_d24_chin28`. Según su model card, se trata de un modelo tipo nanochat entrenado con datos de DCLM-Edu y con preentrenamiento habilitado para búsqueda ("search-enabled pretraining"), es decir, entrenado con tokens especiales de consulta y respuesta web que le permitirían, en principio, interactuar con resultados de búsqueda durante el preentrenamiento o la inferencia.

El modelo resuelve el problema de explorar el enfoque de preentrenamiento con acceso a búsqueda en escalas pequeñas y accesibles: con aproximadamente 2.619 millones de parámetros (2,62 B, dato real extraído de los safetensors) y un tamaño de repositorio de 5,2 GB, es un modelo experimental pensado para investigación, no para despliegue productivo. El tokenizer se basa en el de SmolLM2 ampliado con tokens especiales de búsqueda (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`).

Su relevancia actual es principalmente académica: permite a desarrolladores e investigadores estudiar cómo afecta la incorporación de consultas y respuestas web al preentrenamiento de modelos compactos. Es un modelo base, por lo que requiere ajuste posterior para tareas específicas. Carga mediante `AutoModelForCausalLM` con `trust_remote_code=True` debido a código personalizado (`custom_code`). No se dispone de información sobre longitud de contexto, composición detallada del dataset ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (tipo nanochat, causal LM); detalles no disponibles |
| Parametros totales | 2.619.083.082 (~2,62 B, dato real de safetensors) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16/fp16 implícitos por tamaño de repo; sin variantes cuantizadas publicadas) |
| Idiomas soportados | No disponible (tokenizer de SmolLM2, orientado principalmente a inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Libreria | Transformers (con `trust_remote_code=True`) |
| Tokenizer | SmolLM2 + tokens de búsqueda (`<WEB_QUERY>`, `</WEB_QUERY>`, `<WEB_RESPONSE>`, `</WEB_RESPONSE>`) |
| Tamaño del repo | 5,2 GB |
| Pipeline | text-generation |
| Descargas / Likes | 307 / 0 |
| Creado | 2026-10-26 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de tipo "nanochat", una familia de arquitecturas compactas de código abierto para preentrenamiento reproducible. El nombre del checkpoint (`d24_chin28`) sugiere 24 capas y un presupuesto de cómputo tipo Chinchilla (~28 en alguna unidad interna del proyecto, posiblemente relativa al ratio tokens/parámetros), aunque el autor no documenta explícitamente estos detalles. El número real de parámetros es de ~2,62 B, lo que indica un modelo algo mayor que la denominación comercial "1.4B" de la model card sugiere; la cifra fiable es la extraída de los safetensors.

El entrenamiento se realizó sobre DCLM-Edu, una variante educativa del corpus DCLM (Dolma Core Linguistic Model), combinada con preentrenamiento habilitado para búsqueda: el modelo fue expuesto durante el preentrenamiento a secuencias con consultas web (`<WEB_QUERY>`) y respuestas web (`<WEB_RESPONSE>`), utilizando un tokenizer de SmolLM2 ampliado con esos tokens especiales. No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre fases posteriores como SFT, RLHF o DPO. Dado que es un modelo base, lo más probable es que no existan dichas fases de alineamiento.

## Capacidades

- Generación de texto en formato base (autocompletado de texto, no conversación por defecto).
- Manejo de secuencias con tokens especiales de búsqueda: puede generar consultas web entre `<WEB_QUERY>` y `</WEB_QUERY>` y procesar respuestas web entre `<WEB_RESPONSE>` y `</WEB_RESPONSE>`, lo que habilita experimentos de generación aumentada por recuperación o búsqueda.
- Modelado de lenguaje sobre contenido educativo (DCLM-Edu), potencialmente útil para texto de carácter académico o didáctico.
- Carga estándar vía `transformers` con `AutoModelForCausalLM`, aunque requiere `trust_remote_code=True` por código personalizado.
- No hay evidencia documentada de: tool calling nativo, razonamiento multi-paso, capacidades de visión o audio, ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en preentrenamiento con búsqueda: estudiar cómo los tokens `<WEB_QUERY>`/`<WEB_RESPONSE>` afectan al aprendizaje, comparando checkpoints con y sin búsqueda en tareas de evaluación estándar.
- Prototipado de generación aumentada por recuperación (RAG): integrar el modelo en un pipeline donde el propio modelo genere consultas de búsqueda y consuma respuestas web formateadas con sus tokens especiales.
- Estudio de decodificación con consultas web: analizar si el modelo genera consultas de búsqueda coherentes de forma autónoma cuando se le proporciona contexto incompleto.
- Base para fine-tuning educativo: ajustar el modelo con SFT sobre datasets didácticos aprovechando su preentrenamiento en DCLM-Edu.
- Experimentación en hardware modesto: con ~2,6 B de parámetros y 5,2 GB de pesos, es viable para laboratorios o desarrolladores sin acceso a clusters grandes.
- Reproducción de pipelines tipo nanochat: usar el checkpoint como referencia para verificar exportaciones de entrenamientos internos (procedente de RCP, según la model card) al formato Hugging Face.
- Evaluación comparativa de tokenizers: analizar el efecto de añadir tokens especiales al tokenizer de SmolLM2 sobre el rendimiento en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2,62 B de parámetros en precisión completa (fp16/bf16), aproximadamente 5,2-6 GB solo de pesos; con KV cache y overhead, 8 GB de VRAM deberían ser suficientes para inferencia cómoda. Con cuantización INT8/INT4 (si se aplica externamente), podría bajar a ~3-4 GB o ~2 GB respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 ejecutarían el modelo sin problemas. No se necesitan A100 ni H100 para inferencia.
- Consumer GPU: sí, cabe holgadamente en GPUs de 8 GB en fp16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: carga directa con `transformers` (`AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)`). La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada; dado el `custom_code`, es probable que requiera adaptación para vLLM y conversión a GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponible; para un modelo de 2,6 B en GPU consumer se pueden esperar velocidades de decodificación del orden de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Search-LLM DCLM-Edu (este) | ~2,62 B | No disponible | Apache 2.0 | Base, preentrenamiento con tokens de búsqueda, código personalizado |
| SmolLM2-1.7B (Hugging Face) | 1,7 B | 8.192 tokens (documentado en su ficha oficial) | Apache 2.0 | Base del tokenizer; modelo maduro con benchmarks publicados |
| Qwen2.5-1.5B (Alibaba) | 1,5 B | 32.768 tokens (documentado en su ficha oficial) | Qwen Research / Apache 2.0 (variantes) | Multilingüe, benchmarks públicos, ecosistema amplio |
| Llama 3.2-1B (Meta) | 1,24 B | 128.000 tokens (documentado en su ficha oficial) | Llama 3.2 Community License | Restricciones de licencia más estrictas que Apache 2.0 |

Comparación cualitativa: el modelo de Kausp11 no compite en rendimiento general con SmolLM2, Qwen2.5 o Llama 3.2, que cuentan con pipelines de alineamiento, benchmarks y ecosistemas consolidados. Su valor diferencial es el preentrenamiento con tokens de búsqueda, un enfoque experimental que los modelos anteriores no incorporan de forma nativa.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni está pensado para chat sin fine-tuning previo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; revísese el código antes de usarlo en entornos sensibles.
- No hay benchmarks publicados: no es posible verificar su calidad frente a otros modelos de tamaño similar.
- La longitud de contexto no está documentada; pueden producirse errores o truncamientos silenciosos en secuencias largas.
- Los idiomas soportados no están especificados; el tokenizer de SmolLM2 sugiere orientación al inglés, con rendimiento probablemente degradado en castellano y otras lenguas.
- Riesgo de alucinación estándar de modelos base, agravado por la ausencia de alineamiento documentado.
- Sesgos: no se han documentado sesgos específicos, pero el corpus DCLM-Edu puede contener los sesgos típicos de datos web filtrados.
- El proyecto parece experimental (307 descargas, sin likes, autor individual, sin organización respaldando): no se recomienda para producción sin validación exhaustiva.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene citar la fuente según los términos de la licencia.
- La discrepancia entre la denominación "1.4B" de la model card y los ~2,62 B reales de parámetros merece atención al planificar recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-v1_d24_chin28
- Tokenizer base SmolLM2: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Corpus DCLM (referencia del dataset de entrenamiento): https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Paper del proyecto nanochat: no disponible
- Blog o demo del autor: no disponible
