# AI45Research/ReSI-Safin-1-35B-A3B

## Resumen

ReSI-Safin-1-35B-A3B es un modelo de generación de texto publicado por AI45Research en HuggingFace. Se trata de un modelo fusionado (merged-model) que parte de un modelo base denominado Safin-1 (35B-A3B) y le aplica el proceso de alineación ReSI (Recursive Safety Improvement toward Resistant and Resilient AI), descrito en el paper arXiv:2610.12233, adscrito a la categoría cs.CR (criptografía y seguridad). El repositorio incluye los pesos en safetensors, el tokenizador y código de inferencia propio que requiere `trust_remote_code=True`.

El modelo tiene 35.628.326.768 parámetros totales según los safetensors, con una nomenclatura "A3B" que indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token. La model card no confirma explícitamente esta cifra ni la arquitectura exacta, pero la mención de dependencias opcionales como Flash Linear Attention y causal-conv1d apunta a componentes de atención lineal o híbrida en el diseño original.

Su relevancia es fundamentalmente investigadora: propone un método recursivo de mejora de seguridad sobre un modelo ya entrenado, en lugar de un ajuste de seguridad convencional. El repositorio no tiene descargas ni valoraciones en el momento de la consulta, no declara licencia ni idiomas soportados, y no publica resultados de benchmarks, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con confirmación explícita. La nomenclatura "A3B" y el tamaño sugieren transformer de mezcla de expertos (MoE); la model card cita Flash Linear Attention y causal-conv1d como dependencias opcionales, lo que apunta a componentes de atención lineal o híbrida |
| Parámetros totales | 35.628.326.768 (35,63 B) según safetensors |
| Parámetros activos | Aproximadamente 3 B según la nomenclatura "A3B" del nombre del modelo; no confirmado en la model card |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Los pesos publicados están en BF16; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (BF16), con código Python propio (`custom_code`) |
| Tamaño del repositorio | 71,3 GB; los pesos ocupan aproximadamente 66,4 GiB |
| Versión de Transformers verificada | 5.5.4 |
| Implementación de atención | eager (`attn_implementation="eager"`) en la ruta verificada |

## Arquitectura y entrenamiento

La model card describe el resultado como "el modelo Safin-1 (35B-A3B) tras la alineación ReSI", lo que indica un proceso de post-entrenamiento aplicado sobre un modelo base ya existente. El término "merged-model" en las etiquetas sugiere que parte del resultado proviene de una fusión de pesos, técnica habitual para combinar capacidades o comportamientos sin reentrenar desde cero. El paper asociado, "ReSI: Recursive Safety Improvement toward Resistant and Resilient AI", pertenece al área de seguridad (cs.CR), lo que sitúa el método como una propuesta de alineación orientada a robustez frente a intentos de elusión de salvaguardas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detalla el número de expertos, la estrategia de enrutamiento ni la configuración de atención. La presencia de referencias a Flash Linear Attention y causal-conv1d entre las dependencias opcionales (no necesarias para la ruta verificada) es el único indicio técnico de que el modelo base podría incorporar capas de atención lineal o convolucionales, pero esto no está confirmado en la documentación del repositorio. El código de inferencia va incluido en el repositorio y debe cargarse con `trust_remote_code=True`, lo que implica que la implementación del modelo depende de archivos Python empaquetados por el autor.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (`apply_chat_template`).
- Generación de razonamiento antes de la respuesta final: la model card indica explícitamente que "el modelo puede generar razonamiento antes de su respuesta final", lo que apunta a un modo de tipo thinking.
- Generación de respuestas largas: `--max-new-tokens` tiene un valor por defecto de 8.192 y puede aumentarse.
- Alineación de seguridad reforzada mediante el método ReSI, orientada a resistencia y resiliencia frente a ataques de elusión.
- Salida en streaming a través del script `inference.py` incluido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente, más allá de la generación de razonamiento previo.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades de visión o audio: no disponibles; la etiqueta de pipeline es `text-generation` y no hay referencias multimodales.
- Parámetros de muestreo por defecto: temperatura 1.0, top-p 0.95, top-k 20; se admite modo greedy mediante `--greedy`.

## Casos de uso

- Investigación en alineación y seguridad: el modelo sirve como artefacto reproducible para evaluar el método ReSI, comparando la tasa de rechazo y la resistencia a jailbreaks frente al modelo Safin-1 sin alinear. Es el uso principal dado que el paper es de seguridad.
- Evaluación de robustez frente a red-teaming: permite medir si la alineación recursiva reduce la tasa de éxito de ataques de elusión sin degradar la utilidad, usando la generación de razonamiento previo como traza auditable.
- Generación de texto con trazas de razonamiento: para tareas que requieren justificación intermedia, el modelo puede producir cadenas de razonamiento antes de la respuesta, con hasta 8.192 tokens nuevos por defecto.
- Despliegue conversacional autoalojado en un entorno controlado: mediante `transformers` con BF16 y `device_map="auto"`, apto para prototipos internos donde el operador controla el hardware y el prompt de sistema.
- Servicio de streaming interactivo: el script `inference.py` permite servir respuestas token a token, adecuado para demos o interfaces de chat internas.
- Estudio de fusiones de modelos: dado el carácter de `merged-model`, es un caso de análisis para investigar cómo la fusión de pesos interactúa con la alineación de seguridad.
- Base para experimentos de cuantización: con 35,6 B de parámetros, es un candidato para probar pipelines de cuantización a 8 y 4 bits, aunque el autor no publica versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de seguridad, y los resultados de la búsqueda web no contienen datos técnicos aprovechables sobre este modelo.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan aproximadamente 66,4 GiB (71,3 GB), por lo que se necesitan más de 70 GiB de memoria de GPU sumando caché KV y activaciones. Cifra confirmada por la model card.
- Estimación en otras precisiones (cálculo propio, no documentado por el autor): INT8/FP8 en torno a 36 GB de pesos; 4 bits en torno a 18 GB de pesos, más caché KV y overhead.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`. No cabe en una sola GPU consumer (la máxima actual es 32 GB en RTX 5090).
- Viabilidad en GPU consumer: solo mediante cuantización a 4 bits, que en teoría cabría en una RTX 4090 (24 GB) o RTX 5090, sin que el autor publique pesos cuantizados ni validación de esa ruta.
- Opciones de despliegue: la ruta verificada es `transformers` 5.5.4 con BF16 y atención eager. No hay confirmación de soporte para vLLM, llama.cpp, Ollama, TGI ni SGLang, y la ausencia de pesos GGUF hace improbable el uso directo en llama.cpp/Ollama.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo.
- Nota de implementación: es necesario mantener los archivos Python incluidos junto a los pesos y activar `trust_remote_code=True`; la atención eager implica un consumo de memoria superior al de FlashAttention-2.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReSI-Safin-1-35B-A3B | 35,63 B | ~3 B (según nomenclatura) | No disponible | No disponible | HuggingFace, safetensors BF16 |
| Safin-1 (35B-A3B) | No disponible | No disponible | No disponible | No disponible | Modelo base citado, sin referencia pública localizada en la información disponible |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. Cualquier despliegue en producción requiere contactar con el autor.
- Idiomas no declarados: se desconoce la cobertura multilingüe real, incluido el castellano.
- Longitud de contexto desconocida: no se publica la ventana de contexto, solo el máximo de tokens nuevos por generación (8.192), que es un parámetro distinto.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas de conocimiento, código o matemáticas, ni de tasas de rechazo o de falsos positivos de seguridad.
- Riesgo de alucinación: no cuantificado; al ser un modelo orientado a seguridad y con generación de razonamiento, puede producir justificaciones plausibles pero incorrectas.
- Posible sobre-rechazo: la alineación de seguridad agresiva tiende a incrementar rechazos en peticiones legítimas, algo especialmente relevante si se aplica a dominios sensibles como medicina o seguridad informática defensiva.
- Artefactos de fusión: al ser un `merged-model`, pueden aparecer degradaciones sutiles de coherencia o de formato si la fusión no preserva la calibración de los expertos.
- Ejecución de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar archivos Python del repositorio. Debe auditarse el código antes de cargarlo en entornos de producción.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta, sin retroalimentación de terceros.
- Ruta de inferencia restrictiva: solo se verifica atención eager con Transformers 5.5.4; no hay soporte confirmado en motores de alto rendimiento.
- Fechas del repositorio (creación y actualización en octubre de 2026) posteriores a la fecha de referencia habitual; conviene verificar la vigencia del artefacto.
- Resultados de búsqueda web no relevantes: las consultas devolvieron páginas sin relación con el modelo, por lo que no hay fuentes independientes que corroboren sus capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/AI45Research/ReSI-Safin-1-35B-A3B
- Repositorio de código: https://github.com/AI45Lab/ReSI
- Paper: https://arxiv.org/abs/2610.12233 (ReSI: Recursive Safety Improvement toward Resistant and Resilient AI)
- Script de inferencia incluido en el repositorio: `inference.py`
- Dependencias de inferencia: `requirements.txt`
- No se han localizado otros enlaces relevantes (blogs, demos o repos adicionales) en la búsqueda web realizada.
