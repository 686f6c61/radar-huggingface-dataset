# leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32

## Resumen

Qwen3.8 Flash Next Uncensored AWQ g32 es una cuantización de 4 bits del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por el usuario leoncca. Se trata de un derivado en formato AWQ W4A16 con group size 32 sobre una arquitectura Qwen4Exp de tipo mezcla de expertos (MoE), con 179.999.981.459 parámetros totales según los safetensors del repositorio y un tamaño de repo de 230,9 GB (la revisión del 16 de octubre de 2026 ocupa 137,07 GB repartidos en 86 shards). El modelo es multimodal de entrada imagen-texto y está orientado a conversación.

La relevancia de esta ficha reside en que el checkpoint incorpora una ruta de inferencia específica para hardware antiguo: el autor mantiene ReVolta, un motor basado en vLLM con soporte para SM70 (V100), kernels AWQ g32 para MoE, atención QSA con KV calibrada en FP8 E4M3, un draft MTP en FP8 y entrada multimodal. Esto permite servir un MoE de 180.000 millones de parámetros en 4 × V100 de 32 GB, un escenario que el vLLM estándar no cubre.

La cuantización se ha realizado con GPTQ amortiguado sobre activaciones reales capturadas del checkpoint anterior, no con AWQ clásico, aunque el formato serializado sea AWQ. El autor publica métricas de fidelidad acotadas (KL top-20-plus-tail de 0,0214 frente a la referencia BF16) que no deben interpretarse como resultados de benchmarks de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4Exp, transformer MoE con atención QSA y módulo MTP; pipeline image-text-to-text |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16 asimétrica, group size 32, zero point entero, empaquetado GEMM; escalas de expertos en FP16; PLE en FP8 oficial; KV QSA en FP8 E4M3 calibrada |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (86 shards en la revisión de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE de la familia Qwen4Exp con 48 capas y 512 expertos enrutados por capa, lo que da 24.576 expertos en total. Cada experto enrutado tiene proyecciones de anchura 640, un detalle que condiciona la elección del group size: bajo tensor parallelism de 4, 640/4 = 160, divisible por 32 pero no por 128, de ahí el uso de g32. Además de los expertos enrutados, el checkpoint conserva un experto compartido (gate/up/down), una compuerta de experto compartido, normalización HC y dos portadores de down-projection HC, todos con los bytes exactos de la release anterior. La arquitectura incluye atención QSA en 12 capas y un módulo MTP (multi-token prediction) con draft en FP8.

La cuantización afecta a gate_proj, up_proj y down_proj de los 512 expertos enrutados en las 48 capas. El optimizador fue GPTQ amortiguado con damping 0,3 para gate/up y 1,0 para down, calibrado sobre el corpus public80-v1mix20 con 169.614 filas por capa y activaciones reales capturadas del checkpoint anterior servido en vLLM. El Hessian y el GPTQ usan el enrutamiento capturado del checkpoint previo; el s1 se recupera por mínimos cuadrados conjuntos desde los portadores existentes y el s2 por experto se congela de la búsqueda de calibración W2.5, sin nueva búsqueda ni ajuste sobre heldout. Las escalas se redondean a FP16 antes de la selección de códigos y los códigos siguen clip(round(w / scale + zero), 0, 15) sobre el residual GPTQ con feedback. Solo siete pares capa/experto sin cobertura natural usan 2.048 filas equiespaciadas de su capa como proxy. Las escalas K/V de QSA se conservan de la calibración previa (14 shards de entrada, 4.904 prompts, 4.888.771 tokens procesados), con 24 escalares FP32 positivos en el rango 0,0170375295–0,0819614977.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Procesamiento de entrada multimodal imagen-texto, según el pipeline_tag y la mención a entrada multimodal en ReVolta.
- Razonamiento multi-paso mediante el módulo MTP (multi-token prediction) con draft en FP8.
- Generación con decodificación especulativa a través del draft MTP.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- La variante "Uncensored" del modelo base implica un ajuste orientado a reducir rechazos, aunque no se documentan los detalles del mismo.

## Casos de uso

- Servicio de un MoE de 180.000 millones en parques de V100: el caso de uso principal documentado por el autor es desplegar el checkpoint con ReVolta en 4 × V100 32 GB, aprovechando los kernels AWQ g32 para MoE y el soporte SM70 que el vLLM estándar no ofrece. Es adecuado cuando existe hardware V100 amortizado y no se quiere migrar a Ampere o superior.
- Investigación sobre cuantización de MoE: el repositorio publica MODEL_PROVENANCE.json, VALIDATION.json y EXPERT_COVERAGE.json con el recuento natural de muestras por capa y experto, lo que permite reproducir y auditar el proceso de cuantización con GPTQ amortiguado sobre activaciones capturadas.
- Evaluación de fidelidad de cuantización: el autor reporta KL top-20-plus-tail y acuerdo top-1 sobre un subconjunto fijo de 66 registros de texto, útil como referencia para comparar técnicas de cuantización de expertos enrutados con group size pequeño.
- Despliegue conversacional multimodal en infraestructura legacy: al soportar entrada imagen-texto y conversación, puede emplearse en asistentes con entrada visual sobre clústeres V100 existentes.
- Generación especulativa en producción: el draft MTP en FP8 permite decodificación especulativa, adecuada para reducir latencia en cargas de generación de texto largas.
- Baseline para comparativas de cuantización W4A16 en MoE: sirve como punto de referencia frente a otras técnicas (GPTQ puro, FP8, W8A16) al conservar portadores no enrutados byte a byte, lo que aísla el efecto de la cuantización de expertos.
- Escenarios que requieren menor censura en la respuesta: la naturaleza "Uncensored" del modelo base puede interesar en investigación creativa o generación de contenido sin filtros, siempre con las advertencias legales y éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente publica métricas de fidelidad de cuantización frente a la referencia BF16 sobre un subconjunto fijo de 66 registros de texto:

| Metrica | Release anterior | Release actual |
|---|---|---|
| KL top-20-plus-tail (media) | 0,0303 | 0,0214 |
| Acuerdo top-1 | 96,34 % | 97,08 % |

El autor advierte explícitamente que son comprobaciones de fidelidad acotadas, con limitaciones de aproximación y de runtime, y que no constituyen puntuaciones de benchmark de capacidad general.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 230,9 GB en total, pero la revisión de octubre de 2026 son 137,07 GB (127,66 GiB) en 86 shards; el peso en VRAM para inferencia ronda ese orden de magnitud, distribuido entre GPUs.
- Configuración de referencia del autor: 4 × NVIDIA V100 32 GB (SM70) con ReVolta, el motor basado en vLLM mantenido por el autor.
- En GPUs Ampere o superiores, el autor remite a la sección "Stock vLLM" de las instrucciones de carga, sin detallar configuración concreta en la información disponible.
- Requisitos del loader: soporte de AWQ W4A16 g32 asimétrico por experto en layout GEMM con escalas FP16; tensores PLE FP8 oficiales e índice fusionado completo; las 24 entradas de escala K/V de QSA a través de model.safetensors.index.json, más las dos entradas del draft si se usa el MTP por defecto.
- Cabe en GPU consumer: no disponible; por tamaño (127,66 GiB en la revisión actual) no cabe en una única GPU consumer de 24 GB y requiere reparto multi-GPU.
- Opciones de despliegue: ReVolta (recomendado por el autor para V100); vLLM estándar en Ampere o superior según las notas del autor; llama.cpp, Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32 | 179.999.981.459 | no disponible | AWQ W4A16 g32 + PLE FP8 + KV FP8 E4M3 | qwen-community-1.0 | Hugging Face, 833 descargas, 7 likes |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (modelo base) | no disponible | no disponible | BF16 (madre) | no disponible | Hugging Face |
| Checkpoint previo del mismo autor (referencia de calibración) | no disponible | no disponible | AWQ g32 con escalas BF16 y s1 previo | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. Las alternativas indicadas son las únicas mencionadas en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas son de fidelidad de cuantización sobre 66 registros de texto, no de capacidad; no deben extrapolarse a rendimiento general.
- Las escalas K/V de QSA en FP8 E4M3 se conservan de la calibración anterior y no se recalibraron para los nuevos pesos de expertos, lo que puede introducir desviaciones adicionales.
- Los pesos del router no cambian, pero el autor advierte que esto no implica un enrutamiento end-to-end idéntico, ya que las salidas de expertos anteriores cambian.
- Solo siete pares capa/experto sin cobertura natural usan filas proxy; el resto usa muestras naturales, pero la cobertura por experto es desigual y se publica en EXPERT_COVERAGE.json.
- El modelo base es una variante "Uncensored": puede generar contenido sin los filtros habituales, con los riesgos legales, éticos y de reputación asociados en producción.
- Licencia qwen-community-1.0 (etiquetada como "other" en Hugging Face): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; las condiciones concretas no están detalladas en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Longitud de contexto no documentada.
- El despliegue en V100 depende de ReVolta, un motor mantenido por el propio autor, lo que introduce un riesgo de mantenimiento y de soporte a largo plazo.
- El tamaño del repo (230,9 GB) y el número de shards (86) complican la descarga, verificación y almacenamiento; se recomienda usar SHA256SUMS para verificar la identidad completa de los archivos, ya que hashes de índice idénticos no prueban pesos idénticos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoncca/Qwen3.8-Flash-Next-Uncensored-AWQ-g32
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Motor ReVolta: https://github.com/Leonccaa/ReVolta
- Repositorio de vLLM (referenciado como base de ReVolta): no disponible en la información proporcionada
- Paper o blog técnico del modelo base: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
