# DownFlow/ASMR-llm-lora

## Resumen

DownFlow/ASMR-llm-lora es un adaptador LoRA, no un modelo completo, diseñado para generar líneas de roleplay ASMR en chino con tokens de control de tono del tipo `[tone:...]`. Lo desarrolla el usuario DownFlow y se aplica sobre un modelo base que el autor identifica como Qwen3.5-0.8B, aunque en la información disponible no se detallan las especificaciones técnicas de dicho modelo base.

El adaptador se entrena con 14.389 filas de instrucciones procedentes del corpus de segmentos WebASMR, reconciliadas mediante VibeVoice-ASR, Qwen3-ASR y 101 etiquetas humanas. La propuesta resuelve un problema muy concreto: producir texto conversacional de estilo ASMR en chino con una marca explícita de tono que pueda aprovecharse en pipelines de síntesis de voz, prototipado de personajes o generación de datos etiquetados.

Su relevancia es limitada pero clara para investigación aplicada y experimentación con control de estilo mediante LoRA. No hay benchmarks publicados, el repositorio figura con 0.0 GB y 0 descargas, y la licencia Apache-2.0 se aplica al adaptador, no necesariamente al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tipo de artefacto | Adaptador LoRA (no es un modelo completo) |
| Modelo base | Qwen3.5-0.8B, según el autor; especificaciones no disponibles |
| Arquitectura | No disponible para el modelo base; el adaptador usa LoRA de bajo rango con r=16 |
| Parámetros totales | Modelo base declarado: 0,8 mil millones; parámetros del adaptador: no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se indican cuantizaciones del modelo base |
| Idiomas soportados | Chino, según la model card; otros idiomas no disponibles |
| Licencia | Apache-2.0 para el adaptador; licencia del modelo base no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tamaño del repositorio | 0.0 GB según HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo base: no se indican número de capas, mecanismo de atención, ventana de contexto ni composición del vocabulario. El artefacto publicado es un adaptador LoRA con rango 16 que se aplica sobre Qwen3.5-0.8B, un modelo que el autor declara pero cuyas especificaciones no se aportan ni se pueden verificar con los datos disponibles.

El entrenamiento se realizó durante 10 épocas sobre 14.389 filas de instrucciones del corpus de segmentos WebASMR. Ese corpus se construyó reconciliando segmentos de VibeVoice-ASR con Qwen3-ASR y 101 etiquetas humanas. Se aplicó enmascaramiento explícito del prompt y se añadió el token EOS. No se documentan el número total de tokens, la longitud de las secuencias, la composición exacta del corpus, el hardware utilizado ni si hubo fases de RLHF, DPO u otro tipo de alineamiento adicional. El control por `[tone:...]` es una innovación de formato, pero no se detalla cuántas etiquetas de tono existen ni cómo se validó su consistencia.

## Capacidades

- Generación de texto conversacional en chino orientado a roleplay ASMR.
- Control de tono mediante tokens `[tone:...]` insertados en la respuesta; el conjunto completo de etiquetas no está documentado.
- Seguimiento de instrucciones, entrenado sobre 14.389 filas de instrucciones.
- Generación de líneas de diálogo y monólogos con estilo ASMR.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificación multi-paso ni razonamiento explícito.
- No se documenta capacidad multilingüe; la model card indica chino.
- No se documenta visión, audio ni modo de pensamiento.
- No hay evidencia de capacidades destacadas en código, matemáticas o tareas generales.

## Casos de uso

- **Generación de guiones para TTS ASMR en chino**: el adaptador produce líneas de roleplay con marcas `[tone:...]` que un sistema TTS puede interpretar como prosodia o estilo. Es adecuado porque el entrenamiento está orientado exactamente a ese formato y a ese idioma.
- **Prototipado de personajes y voces**: permite generar diálogos de un personaje con un tono concreto antes de grabar o sintetizar. Útil para diseñar personalidades y probar variantes sin escribir guiones manualmente.
- **Aumentación de datos para TTS o ASR**: generar variaciones de texto etiquetadas por tono para ampliar corpus de entrenamiento. El formato de instrucciones y las etiquetas facilitan el filtrado y la organización de los datos.
- **Investigación en control de estilo con LoRA**: sirve como ejemplo reproducible de adaptación de bajo rango con enmascaramiento de prompt y tokens de control. Es útil para estudiar sobreajuste, fidelidad de etiquetas y estabilidad del estilo.
- **Localización de contenido de relajación al chino**: a partir de guiones o instrucciones en otro idioma, generar una versión china adaptada. Requiere revisión humana por la especialización del modelo y el riesgo de contenido sensible.
- **Evaluación de sistemas TTS expresivos**: crear baterías de frases con distintos tonos para medir si el TTS respeta la prosodia. El adaptador genera texto de entrada controlado y repetible.
- **Aplicaciones de bienestar y acompañamiento conversacional**: integrar en un chat de relajación en chino con moderación. El modelo puede mantener un estilo ASMR, pero no debería desplegarse sin filtros de contenido.
- **Generación de datasets para clasificación de tono**: las salidas con `[tone:...]` pueden usarse como datos débilmente etiquetados. Conviene validarlas con anotadores humanos antes de usarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación específica de ASMR o control de tono | no disponible |

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un adaptador sobre un modelo de 0,8 mil millones de parámetros, el peso en FP16 ronda 1,6 GB. Con overhead de activaciones y caché KV, una inferencia con contexto corto puede caber en 2-3 GB. En 8 bits, los pesos rondarían 0,8 GB; en 4 bits, 0,4-0,5 GB. Son estimaciones orientativas, no medidas publicadas.
- **GPU recomendadas**: cualquier GPU de consumo con 4 GB o más para inferencia individual, como GTX 1650, RTX 3050, RTX 4060 o RTX 4090. Para servir en lote, T4, L4, A10 o A100. Una H100 no es necesaria para este tamaño.
- **Cabe en GPU de consumo**: sí, previsiblemente en tarjetas de 4-6 GB, siempre que se utilice una cuantización adecuada del modelo base. El adaptador en sí es pequeño; el consumo real depende del modelo base, del contexto efectivo y del lote.
- **Opciones de despliegue**: transformers con PEFT; vLLM con soporte LoRA; llama.cpp u Ollama si se convierte o se fusiona el adaptador con el modelo base; TGI si se fusiona previamente. No se documenta soporte nativo del adaptador en cada framework.
- **Latencia y throughput**: no disponibles. Dependen del modelo base, la GPU, la longitud de contexto, la cuantización y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DownFlow/ASMR-llm-lora | Adaptador LoRA sobre 0,8B | no disponible | Apache-2.0 (adaptador) | HuggingFace; 0 descargas; repositorio de 0.0 GB |
| Qwen3.5-0.8B (modelo base declarado) | 0,8B | no disponible | no disponible | no verificable con la información aportada |
| Otros adaptadores LoRA para ASMR en chino | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento, calidad o contexto con alternativas. La comparación más directa es con el modelo base sin adaptador, pero no se han publicado evaluaciones de ninguno de los dos en la información disponible.

## Limitaciones y advertencias

- **Especialización estrecha**: está diseñado para roleplay ASMR en chino; no es un modelo generalista y no debe usarse como sustituto de un LLM general.
- **Idioma limitado**: la model card indica chino. No se documenta soporte de castellano ni de otros idiomas.
- **Datos de entrenamiento limitados**: 14.389 filas y 10 épocas con r=16 pueden favorecer el sobreajuste, la repetición y una generalización pobre fuera del corpus WebASMR.
- **Sin benchmarks**: no hay evaluaciones cuantitativas de calidad, fidelidad de tono, robustez o seguridad.
- **Riesgo de alucinación y contenido sensible**: el roleplay ASMR puede derivar en contenido sexual, violento o inapropiado. Es necesario aplicar moderación y filtros antes de cualquier despliegue público.
- **Tokens de control poco documentados**: no se especifica el conjunto completo de etiquetas `[tone:...]`, su distribución ni su consistencia. El modelo puede inventar tonos o usarlos de forma irregular.
- **Contexto desconocido**: no se indica la longitud de contexto. No se deben asumir conversaciones largas ni ventanas amplias.
- **Licencia del modelo base**: Apache-2.0 cubre el adaptador, pero no necesariamente el modelo base. Hay que verificar la licencia de Qwen3.5-0.8B antes de un uso comercial.
- **Disponibilidad del repositorio**: figura con 0.0 GB y 0 descargas. Conviene comprobar que los pesos del adaptador estén realmente subidos y que el archivo safetensors sea válido.
- **Modelo base no verificado**: “Qwen3.5-0.8B” no se detalla en la información aportada. Es necesario confirmar el nombre, la versión y la compatibilidad antes de cargar el adaptador.
- **Sin tool calling ni agentes**: no hay evidencia de soporte de funciones, herramientas, planificación multi-paso, código o matemáticas.

## Enlaces

- HuggingFace: https://huggingface.co/DownFlow/ASMR-llm-lora
- Modelo base: no se proporciona un enlace verificable en la información disponible.
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
