# dwsllc/DWSLM-256M-Base-32K

## Resumen
DWSLM-256M-Base-32K es un modelo de lenguaje de tipo "small language model" entrenado desde cero por DWS Research (dwsllc), sin partir de pesos preentrenados. Emplea una arquitectura híbrida de atención lineal: 20 capas con grupos de tres capas de Kimi Delta Attention (KDA, atención lineal) seguidas de una capa de atención global con grouped-query attention. Aunque la nomenclatura comercial indica "256M", el modelo almacena 655 millones de parámetros: 286M de cómputo efectivo (252M en bloques y 34M en la cabeza) más 369M de tablas de búsqueda (34M de embedding de tokens y 336M de value embeddings).

La variante "32K" extiende el contexto del DWSLM-256M-Base original mediante 953 pasos adicionales (500M tokens) sobre documentos de al menos 16K tokens, aplicando YaRN ×8 sobre las frecuencias rotatorias aprendidas para alcanzar 32.768 tokens de ventana. El entrenamiento total acumula 24,11B de tokens. Es un modelo base: no ha pasado por ajuste por instrucciones ni por entrenamiento de seguridad, por lo que su función es la continuación de texto y la puntuación de secuencias, no el diálogo asistencial.

Su relevancia radica en dos factores: la licencia Apache-2.0 sobre pesos y código, y su naturaleza reproducible desde cero (corpus, tokenizador, código de modelo y bucle de entrenamiento propios). Está orientado a desarrolladores e investigadores que necesitan un modelo pequeño, de contexto largo y desplegable en hardware modesto para experimentación, evaluación de arquitecturas de atención lineal o fine-tuning específico de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 20 capas, d=1024; 15 capas de Kimi Delta Attention (lineal) y 5 de atención global GQA (capas 3, 7, 11, 15, 19) |
| Parametros totales | 655M almacenados (286M de cómputo: 252M en bloques + 34M en cabeza; 369M en tablas de búsqueda: 34M embedding de tokens + 336M value embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (YaRN ×8 sobre RoPE de 4.096 tokens) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés, árabe, alemán, español, francés, hindi, indonesio, italiano, japonés, coreano, neerlandés, polaco, portugués, ruso, turco, vietnamita y chino, además de código |
| Licencia | Apache-2.0 (pesos y código); los datos de entrenamiento conservan sus licencias propias |
| Formato de pesos | safetensors (`model.safetensors`, fp32, pesos maestros de entrenamiento) |

## Arquitectura y entrenamiento
El modelo combina dos tipos de capa. Las 15 capas locales usan Kimi Delta Attention con 8 cabezas de dimensión 128, una convolución causal corta (kernel 4) sobre q/k/v, decaimiento por canal derivado de un mapa de bajo rango y una RMSNorm con puerta sigmoide en la salida; el estado por cabeza tiene tamaño fijo, por lo que el coste crece linealmente con la longitud. Las 5 capas globales (posiciones 3, 7, 11, 15 y 19) emplean grouped-query attention con 8 cabezas de consulta y 2 de clave/valor, dimensión 128, QK-norm, LeRoPE (escalas rotatorias aprendidas por banda), atención varlen con máscara por documento y una puerta sigmoide por cabeza en la salida.

El flujo residual es igualmente particular: cada subcapa lee una mezcla softmax de 8 cabezas sobre el embedding de tokens, la salida de cada grupo terminado y la suma acumulada del grupo actual, con un λ aprendido que reincorpora el embedding bruto; las ramas se escalan por 8/20 (CompleteP). El entrenamiento acumula 24,11B de tokens (23,61B del modelo base más 0,50B en la fase de extensión a 32K), con un tokenizador propio DWSLMTok32.3 (BPE a nivel de byte, 32.768 tokens) y un corpus que incluye FineWeb-Edu, FineWeb-2, Stack v3, Wikipedia, peS2o, OpenWebMath y varios conjuntos de dominio público de PleIAs (libros en inglés, francés y ruso, periódicos estadounidenses y SEC). La receta usa MuonH para matrices y AdamW para el resto. No se documenta RLHF ni DPO: es un modelo estrictamente base. Una limitación operativa destacable es la ausencia de KV cache, de modo que la generación recalcula el prefijo en cada token nuevo.

## Capacidades
- Generación de texto autocompletiva y continuación de documentos, con arranque mediante el token `<eos>` que precede a todos los documentos de entrenamiento.
- Puntuación de secuencias: `next_logits` calcula log-probabilidades de opciones, lo que permite evaluación de opciones múltiples por suma de log-probabilidades.
- Procesamiento por lotes con empaquetado varlen: varias secuencias se empaquetan en un único forward pass, cada una como segmento independiente con máscara por documento.
- Cobertura multilingüe en 17 idiomas (inglés más ar, de, es, fr, hi, id, it, ja, ko, nl, pl, pt, ru, tr, vi, zh) y código fuente.
- Contexto largo de hasta 32.768 tokens, adecuado para documentos completos y contextos extensos.
- Capacidad de fine-tuning: los pesos fp32 maestros permiten ajuste con cualquier optimizador, recomendándose una tasa de aprendizaje cercana al final del schedule de preentrenamiento.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio; no es un modelo de instrucciones.

## Casos de uso
- Fine-tuning de dominio específico: al ser un modelo base de 655M con licencia Apache-2.0 y pesos fp32, sirve como punto de partida para ajustar clasificadores o generadores sobre corpus propios (legal, médico, técnico) con coste de cómputo reducido.
- Evaluación de arquitecturas de atención lineal: investigadores pueden reproducir y contrastar el comportamiento de Kimi Delta Attention frente a atención global en tareas de contexto largo, dado que el repositorio incluye el código de entrenamiento copiado literalmente.
- Puntuación y ranking de candidatos: la función `next_logits` permite sumar log-probabilidades de cada opción, útil para reranking en recuperación de información o validación de respuestas generadas por otros sistemas.
- Procesamiento de documentos largos: con 32.768 tokens de contexto y máscara por documento, puede resumir, extraer o clasificar informes, contratos o artículos científicos completos en una sola pasada.
- Generación de código asistida en pipelines internos: su cobertura de código (Stack v3) y de 17 idiomas permite autocompletado o generación de fragmentos en herramientas de desarrollo, siempre con validación posterior.
- Experimentación educativa y de investigación: al ser entrenado desde cero con corpus y tokenizador propios, es un banco de pruebas reproducible para estudiar dinámicas de preentrenamiento, YaRN y decaimientos por canal.
- Prototipado de bajo coste en local: al caber en GPU de consumo y no requerir infraestructura de servido compleja, permite validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index de la model card, no verificados de forma independiente), en precisión normalizada por longitud (acc_norm) en evaluación zero-shot:

| Benchmark | Metrica | Valor |
|---|---|---|
| HellaSwag (validation) | acc_norm | 0,3488 |
| ARC-Easy (test) | acc_norm | 0,4465 |
| ARC-Challenge (test) | acc_norm | 0,2509 |
| PIQA (validation) | acc_norm | 0,6148 |
| WinoGrande (validation, winogrande_xl) | acc_norm | 0,5075 |
| MMLU (test, all) | acc_norm | 0,2709 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni comparativas directas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos se distribuyen en fp32 (655M parámetros, aproximadamente 2,6 GB de repositorio). En fp32 se requieren unos 3 GB solo para pesos; en fp16/bf16 bajaría a unos 1,5 GB, aunque no se documentan conversiones oficiales.
- GPU recomendadas: NVIDIA con soporte Ampere o superior para la ruta FlashAttention-2 varlen (`attn: flash`). El entrenamiento usó `cudnn`, que solo funciona en GPUs de datacenter Hopper y Blackwell; ambas rutas producen la misma atención.
- GPU de consumo: cabe en tarjetas con 8 GB o más (RTX 3060, 4060, 4070, 4090), siempre que se disponga de kernels Triton de flash-linear-attention.
- Opciones de despliegue: el repositorio incluye código de referencia propio en `dwslm/` y un script `generate.py`; la arquitectura no está integrada en `transformers`, por lo que no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI salvo implementación propia.
- Latencia y throughput: no disponibles. La ausencia de KV cache implica que la generación recalcula el prefijo completo en cada token, lo que penaliza la latencia en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DWSLM-256M-Base-32K | 655M almacenados (286M de cómputo) | 32.768 | Apache-2.0 | Hugging Face, código propio |
| DWSLM-256M-Base | 655M almacenados (286M de cómputo) | 4.096 | Apache-2.0 | Hugging Face, código propio |
| Alternativas de tamaño similar (p. ej. modelos base de ~0,5B en transformers) | ~500M | Variable | Variable | Integración nativa en transformers |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables para establecer una comparación cuantitativa; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene diálogo asistencial y no incorpora entrenamiento de seguridad.
- Riesgo elevado de alucinación y de continuaciones incoherentes en tareas abiertas, derivado de su escala y de su naturaleza de continuación de texto.
- Sesgos potenciales heredados del corpus (FineWeb-Edu, FineWeb-2, Stack v3, Wikipedia, peS2o, OpenWebMath y conjuntos de dominio público), no auditados en la información disponible.
- La cobertura multilingüe es declarada, pero no se aportan evaluaciones por idioma; el rendimiento en idiomas distintos del inglés puede ser desigual.
- La licencia Apache-2.0 cubre pesos y código, pero los datos de entrenamiento conservan sus licencias propias, lo que puede condicionar usos comerciales derivados.
- El contexto de 32K se obtiene por extrapolación YaRN ×8 sobre 4.096 tokens; la calidad más allá de la ventana nativa puede degradarse y no se documenta su evaluación específica.
- Sin KV cache, la generación es costosa en latencia para secuencias largas y no apta para servido de alto throughput sin optimizaciones adicionales.
- La arquitectura no está en `transformers`; requiere código propio y kernels Triton de flash-linear-attention, lo que limita la portabilidad y el soporte de herramientas del ecosistema.
- El tokenizador debe mantener `encode_special_tokens = True`; un `<eos>` literal en el texto se codifica como texto, tal como ocurrió en el entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/dwsllc/DWSLM-256M-Base-32K
- Modelo base del que se extiende: https://huggingface.co/dwsllc/DWSLM-256M-Base
- Informe técnico: https://research.dws.rip/llm/report
- Página de investigación: https://research.dws.rip/llm
- Repositorio de kernels de atención lineal: https://github.com/fla-org/flash-linear-attention
