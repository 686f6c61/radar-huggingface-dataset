# asemqaffaf/AsemLLM

## Resumen
AsemLLM-97M es un modelo de lenguaje de tipo decoder-only transformer entrenado desde cero por Asem Qaffaf, sin partir de ningún modelo base. Su singularidad no reside en el rendimiento, sino en el proceso: toda la pila de entrenamiento (transformer, retropropagación, optimizador Adam, tokenizador BPE y pipeline de datos) está escrita a mano en Common Lisp sobre SBCL, usando Apple Accelerate únicamente para los productos matriciales, y se entrenó en la CPU de un portátil. El repositorio incluye los pesos en safetensors, la configuración, el tokenizador y una implementación de referencia en NumPy para poder ejecutarlo sin Lisp.

El modelo cuenta con 97.636.225 parámetros (85.053.313 sin la matriz de embeddings y la de salida), 12 capas, anchura 768 y 12 cabezas de atención de 64 dimensiones. Su ventana de contexto es de solo 128 tokens y está entrenado exclusivamente con texto educativo en inglés procedente de FineWeb-Edu. Se publica bajo licencia Apache-2.0 y su relevancia es fundamentalmente didáctica y de investigación: permite leer de principio a fin una implementación completa de un transformer y estudiar cómo afectan las decisiones de entrenamiento en un presupuesto de cómputo mínimo.

El autor lo describe explícitamente como un modelo de investigación y no como un asistente: no está ajustado por instrucciones ni por seguridad, y su salida, aunque fluida en apariencia, suele ser incoherente o falsa. Cualquier evaluación debe hacerse con esa expectativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, entrenado desde cero (sin modelo base) |
| Parametros totales | 97.636.225 (85.053.313 sin embedding de tokens y matriz de salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en FP32; la implementación de referencia calcula en FP64) |
| Idiomas soportados | Inglés (entrenado solo con texto educativo en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), más config.json y tokenizer.bpe; implementación de referencia en NumPy (asemllm.py) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only con bloques pre-RMSNorm (ε 1e-5) seguidos de autoatención causal y residual, y después pre-RMSNorm con un MLP 768 → 3.072 → 768 con activación ReLU y residual. Las capas lineales no tienen sesgos. Las posiciones se modelan con embeddings absolutos aprendidos más sesgos de atención relativos aprendidos para distancias de 0 a 7 (uno por distancia, cabeza y capa). La cabeza de salida aplica una RMSNorm final y calcula `logits = h·W_head + g·h·E_tokᵀ`: una matriz de salida no atada más una ruta "copia" atada a los embeddings de tokens, escalada por un escalar aprendido `g`. El tokenizador es un BPE a nivel de byte con 8.192 tokens (id 0 = `<|endoftext|>`, ids 1–256 = bytes crudos, 257–8.191 = merges), aprendido sobre el corpus FineWeb-Edu del proyecto, que permite que cualquier texto UTF-8 haga round-trip exacto.

El entrenamiento usó FineWeb-Edu filtrado por el propio pipeline en Lisp: puntuación educativa ≥ 4,0, puntuación de idioma ≥ 0,95 y eliminación de duplicados exactos y casi duplicados. De 189.886 documentos leídos se conservaron 149.724 (se descartaron 32.422 duplicados exactos, 7.198 casi duplicados y 542 por otros motivos). El split de entrenamiento contiene 182.797.952 tokens y la validación retenida 968.651 tokens. Con 97,6M de parámetros y 182,8M de tokens, la relación es de aproximadamente 1,77 tokens por parámetro, muy por debajo de los ~20 tokens por parámetro que se consideran óptimos en cómputo; el autor lo señala como la causa principal de la baja calidad. No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades
- Generación de texto en inglés a nivel de continuación: produce texto fluido en superficie a partir de un prompt corto.
- Modelado de lenguaje y cálculo de perplejidad y entropía cruzada sobre texto en inglés.
- Tokenización BPE byte-level reversible para cualquier cadena UTF-8.
- Acceso a logits por token mediante la implementación de referencia en NumPy.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No sigue instrucciones ni mantiene conversaciones multi-turno.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe prácticamente nula: otros idiomas tokenizan correctamente pero apenas se vieron durante el entrenamiento.

## Casos de uso
- Estudio y docencia de transformers: el repositorio permite leer una implementación completa y sin framework de un decoder-only, desde la atención hasta el optimizador, lo que lo hace adecuado para cursos y talleres donde se quiere entender el funcionamiento interno sin capas de abstracción.
- Reproducción de experimentos de entrenamiento en CPU: sirve como referencia para comparar decisiones de arquitectura (RMSNorm, sesgos relativos, cabeza atada parcial) en un presupuesto de cómputo de un solo portátil.
- Baseline para trabajo desde cero: útil como punto de comparación para otros proyectos de modelos pequeños o de entrenamiento solo en CPU, dado que publica pesos, configuración y registros de experimentos.
- Análisis de tokenizadores BPE byte-level: el tokenizer.bpe y la implementación permiten estudiar merges, cobertura de bytes y comportamiento con texto UTF-8 en un vocabulario de 8.192 tokens.
- Medición de perplejidad en dominios concretos: con la implementación NumPy se puede evaluar el modelo sobre corpus propios en inglés para ilustrar cómo un modelo pequeño y poco entrenado degrada su pérdida fuera de distribución.
- Demostraciones de limitaciones de modelos pequeños: ejemplifica de forma tangible los efectos de un contexto de 128 tokens, una relación tokens/parámetro de 1,77 y la ausencia de ajuste por instrucciones en tareas de generación.
- Prototipado de pipelines de datos: el proceso de filtrado y deduplicación descrito (puntuación educativa, puntuación de idioma, duplicados exactos y casi duplicados) sirve como plantilla para construir corpus de entrenamiento reproducibles.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| FineWeb-Edu (validation, 269.696 tokens) | Perplejidad de validación | 26,94 | No |
| FineWeb-Edu (validation, 269.696 tokens) | Entropía cruzada de validación (nats por token) | 3,2936 | No |
| Test de 90 preguntas con cuatro opciones | Precisión | 38,89 % (azar: 25 %) | No |

Los resultados proceden del model-index declarado por el autor y no están verificados de forma independiente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 97,6M de parámetros en FP32, los pesos ocupan aproximadamente 0,39 GB; en FP64, unos 0,78 GB. A ello hay que sumar el estado de activación, reducido por el contexto de solo 128 tokens.
- GPU recomendadas: no requiere GPU; el autor lo entrenó y ejecuta en CPU. Cualquier GPU consumer moderna puede ejecutarlo, pero no hay soporte nativo de kernels optimizados.
- Cabe en cualquier GPU consumer y en CPU de portátil; el repositorio completo ocupa 0,5 GB.
- Opciones de despliegue: la única vía documentada es la implementación de referencia en NumPy (`asemllm.py`), que solo requiere NumPy y huggingface_hub. La arquitectura es personalizada, por lo que el modelo no carga en transformers, llama.cpp, Ollama, LM Studio ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AsemLLM-97M | 97,6M | 128 tokens | Apache-2.0 | Pesos en HF, ejecución solo con NumPy | Entrenado desde cero en Common Lisp sobre CPU; sin ajuste por instrucciones |
| AsemLLM-27M (versión anterior del mismo autor) | no disponible | no disponible | Apache-2.0 | Incluido en `previous/AsemLLM-27M/` | Misma pila, menor tamaño |
| GPT-2 small | 124M | 1.024 tokens | MIT | Pesos en HF, soporte amplio en transformers, llama.cpp y Ollama | Entrenado con WebText; tampoco ajustado por instrucciones, pero con contexto mucho mayor |
| Pythia-70M | 70M | 2.048 tokens | Apache-2.0 | Pesos en HF, suite completa de checkpoints intermedios | Diseñado para investigación de entrenamiento, con datos y orden públicos |

La comparación con GPT-2 small y Pythia-70M es la más natural por tamaño y por propósito de investigación. Ambos ofrecen contextos de 1.024 y 2.048 tokens respectivamente, frente a los 128 de AsemLLM-97M, y cuentan con soporte en herramientas estándar, algo de lo que carece este modelo. No se dispone de datos de benchmarks comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias
- Modelo pequeño y poco entrenado: 97,6M de parámetros con 1,77 tokens por parámetro, frente a los ~20 recomendados para un entrenamiento óptimo en cómputo.
- Salida a menudo sin sentido: el texto es fluido en superficie pero frecuentemente incoherente y con afirmaciones falsas.
- Rendimiento limitado en conocimiento: 38,89 % en un test de 90 preguntas con cuatro opciones, por encima del azar (25 %) pero lejos de ser fiable.
- Datos estrechos: solo texto web educativo en inglés filtrado por un clasificador de calidad educativa, por lo que hereda los temas, el estilo y los sesgos de esa fuente.
- Sin ajuste de seguridad: nada impide que genere texto ofensivo o dañino presente en los datos web.
- Contexto muy corto: 128 tokens, insuficiente para la mayoría de tareas prácticas.
- Idiomas: otros idiomas tokenizan correctamente pero apenas se vieron durante el entrenamiento; el multilingüismo es inexistente en la práctica.
- Sin soporte de herramientas estándar: no carga en transformers, llama.cpp, Ollama, LM Studio ni vLLM, lo que limita su integración en producción.
- No es un asistente: no sigue instrucciones, no mantiene conversaciones y no debe usarse en productos de cara al usuario ni donde la corrección o la seguridad sean críticas.
- Licencia Apache-2.0: permite uso comercial, pero las limitaciones técnicas y de calidad hacen desaconsejable cualquier despliegue en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/asemqaffaf/AsemLLM
- Artefactos crudos y registros de experimentos: https://huggingface.co/asemqaffaf/AsemLLM-runs
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
