# Dam1rka1/Qwen3.5-0.8B-lobotomized-x2

## Resumen

Qwen3.5-0.8B-lobotomized-x2 es un modelo de lenguaje bilingüe (ruso e inglés) de 752 millones de parámetros derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario Dam1rka1 en HuggingFace. Su particularidad es que no ha sido ajustado mediante descenso de gradiente ni fine-tuning sobre datasets sintéticos, sino mediante una intervención directa sobre los tensores de pesos (lo que el autor denomina "weight-space lobotomy"): reducción de rango por SVD sobre proyecciones de atención y MLP, plegado estático de direcciones de steering en las capas de down-projection y suavizado de pesos atípicos en capas finales.

El modelo está orientado a tres tareas concretas: adherencia estricta a esquemas JSON (OpenAPI/Pydantic), function calling en Python evaluado con Berkeley Function-Calling Leaderboard v4, y seguimiento de instrucciones con restricciones verificables según Google IFEval. La arquitectura subyacente alterna capas de self-attention con ventana deslizante y capas de recurrencia lineal, según describe el autor.

Es relevante ahora como experimento de interpretabilidad mecánica aplicada: demuestra que es posible modificar el comportamiento de un modelo pequeño sin reentrenamiento, mediante cirugía algebraica sobre los pesos. La licencia es Apache 2.0 y el repositorio incluye pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención con ventana deslizante en capas ancla (3, 7, 11, 15, 19, 23) y recurrencia lineal en el resto |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), F16 (GGUF), safetensors en precisión completa |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (q8_0 y f16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, cuya arquitectura alterna capas de self-attention con ventana deslizante (cada cuarta capa: 3, 7, 11, 15, 19, 23, sobre `self_attn.o_proj`) con capas de recurrencia lineal (`linear_attn.out_proj`). Sobre esta base, el autor aplica tres intervenciones sin ningún paso de descenso de gradiente:

1. Reducción de rango SVD LASER con k = 0.988 sobre las proyecciones de atención ancla y las down-projections del MLP, eliminando 290 vectores singulares de alta frecuencia asociados a la omisión de argumentos en llamadas a funciones.
2. Plegado estático de una dirección de steering calculada como la diferencia entre activaciones medias en modo tool y modo prosa (`v_tool = h̄_tool − h̄_prose`), inyectada como parche de rango 1 en las capas de down-projection: `W_down ← W_down + α · (v_tool ⊗ u_repr^T)`.
3. Suavizado (soft-clamp) de 80.760 pesos atípicos (> 3.8σ) en capas finales, destinado a eliminar bucles de falso rechazo en prompts bilingües.

No se documenta el volumen de tokens de entrenamiento ni la composición del dataset, porque no hubo entrenamiento: la totalidad del cambio de comportamiento proviene de la manipulación algebraica de los tensores. El autor menciona que la iteración "x2" incorpora indicaciones arquitectónicas y de enrutamiento de atención de generaciones frontera como "GPT-6 Astra", afirmación que no se puede verificar con la información disponible.

## Capacidades

- Generación de texto bilingüe ruso-inglés en formato conversacional.
- Adherencia estricta a esquemas JSON complejos (OpenAPI, Pydantic), con un 90,0 % de validez y un 100 % de corrección sintáctica según el autor.
- Function calling en Python, evaluado con Berkeley Function-Calling Leaderboard v4.
- Seguimiento de instrucciones con restricciones verificables (Google IFEval).
- Conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Despliegue compatible con endpoints OpenAI a través de vLLM.
- No se documentan capacidades de visión, audio, tool calling nativo fuera del formato descrito, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Generación de payloads JSON validados contra esquemas OpenAPI o Pydantic en pipelines de integración: el modelo está específicamente intervenido para no omitir argumentos, lo que reduce errores de validación en producción.
- Enrutamiento de llamadas a funciones en asistentes conversacionales: con un 73,3 % en BFCL v4, puede actuar como primer nivel de decisión sobre qué herramienta invocar antes de delegar en un modelo mayor.
- Extracción de datos estructurados de texto libre en ruso e inglés: perfiles de usuario, fichas de producto o metadatos, aprovechando su adherencia a esquemas.
- Despliegue en CPU o dispositivos de borde: el GGUF Q8_0 ocupa 774,2 MB y puede ejecutarse con llama.cpp u Ollama sin GPU dedicada.
- Generación de instrucciones con formato controlado en aplicaciones de documentación técnica: IFEval mide el cumplimiento de restricciones como número de frases o formato de salida.
- Servicio de inferencia de alto rendimiento en GPU mediante vLLM con PagedAttention, adecuado para APIs internas de bajo coste por su tamaño sub-1B.
- Prototipado e investigación en interpretabilidad mecánica: sirve como caso de estudio reproducible de modificación de comportamiento sin reentrenamiento.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Benchmark / Tarea | Modelo base | Lobotomized-x2 | Delta relativo |
|---|---|---|---|
| JSON-Schema complejo (OpenAPI / Pydantic) | 70,0 % | 90,0 % (100 % sintaxis) | +20,0 % |
| Berkeley Function-Calling (BFCL v4) | 30,0 % | 73,3 % | +43,3 % |
| Google IFEval (adherencia estricta) | 80,0 % | 86,7 % | +6,7 % |
| Puntuación compuesta de leaderboard | 60,0 % | 83,3 % | +23,3 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16, unos 0,8 GB en Q8_0 y alrededor de 3,0 GB si se cargan los pesos safetensors en FP32 tal como sugiere el ejemplo del autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para F16 (GTX 1650, RTX 3050 en adelante); para servidor, A100 o H100 no son necesarias por el tamaño del modelo, pero vLLM las aprovecharía para batching.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida usando Q8_0.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, vLLM (`vllm serve`), llama.cpp (`llama-cli`), Ollama mediante Modelfile.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-lobotomized-x2 | 752 M | no disponible | JSON, function calling, IFEval vía cirugía de pesos | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| Qwen/Qwen3.5-0.8B (base) | 752 M | no disponible | Modelo generalista bilingüe | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | Asistente generalista con instruction tuning | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Asistente generalista con instruction tuning | Apache 2.0 | HuggingFace |

La comparación con Qwen2.5-0.5B-Instruct y SmolLM2-1.7B-Instruct es orientativa por categoría (modelos sub-2B de propósito general); no se dispone de resultados de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados proceden únicamente del autor y no han sido validados de forma independiente; deben tratarse con cautela.
- El proceso de "lobotomía" de pesos puede degradar capacidades generales no medidas (razonamiento, conocimiento factual, coherencia en textos largos), ya que no se reportan evaluaciones en MMLU, GSM8K u otras tareas estándar.
- Solo soporta ruso e inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- La longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación no cuantificado; el suavizado de pesos atípicos busca reducir falsos rechazos, pero no hay datos sobre su efecto en la fidelidad factual.
- Las afirmaciones sobre inspiración en "GPT-6 Astra" y la iteración "x2" no son verificables con la información disponible.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5-0.8B antes de un uso comercial.
- El repositorio registra 0 descargas en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dam1rka1/Qwen3.5-0.8B-lobotomized-x2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Berkeley Function-Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
- Google IFEval: https://github.com/google-research/google-research/tree/master/instruction_following_eval
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
