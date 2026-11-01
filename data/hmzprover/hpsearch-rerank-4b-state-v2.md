# hmzprover/hpsearch-rerank-4b-state-v2

## Resumen

hpsearch-rerank-4b-state-v2 es un modelo de reordenación (reranking) especializado en la selección de premisas para demostraciones formales en Lean 4. Lo desarrolla el autor independiente hmzprover como un ajuste fino adicional del modelo hmzprover/hpsearch-rerank-4b-state, que a su vez parte de Qwen3-Reranker-4B. Su función es juzgar si una premisa de Mathlib resulta útil para demostrar un objetivo concreto a partir de un estado de prueba Lean 4, opcionalmente acompañado de una descripción en inglés del siguiente paso. Se integra en las modalidades `accurate` y `best` de la herramienta hpsearch.

Arquitectura transformer de tipo Qwen3 con 4.021.784.576 parámetros (aproximadamente 4B), pesos en safetensors y un repositorio de 8,1 GB. El ajuste se realizó mediante LoRA con rango 16, posteriormente fusionado en los pesos base, sobre 48.000 estados de entrenamiento y con una pérdida listwise frente a una premisa positiva y siete negativos duros minados por una torre de consulta de estados entrenada con los mismos datos.

Es relevante ahora porque ataca un cuello de botella específico de la automatización de pruebas formales: la recuperación de lemas relevantes de Mathlib entre decenas de miles de candidatos. Al emplear únicamente particiones públicas de entrenamiento y aplicar una descontaminación estricta frente a los conjuntos de evaluación habituales (MathlibQR/MPR, Lean Finder, LeanStateSearch, TBPS, TheoremSearch, MIRB, LeanDojo), ofrece una señal de reordenación más limpia para pipelines de demostración automática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 (base: Qwen3-Reranker-4B) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada en ingles para la descripcion del paso; estados y lemas en Lean 4) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de la familia Qwen3 con 4B parámetros, adaptado de Qwen3-Reranker-4B mediante un ajuste fino con LoRA de rango 16 que después se fusionó en los pesos. Se emplea como modelo de ranking con la misma plantilla de prompt que Qwen3-Reranker, con la instrucción `Given a Lean 4 proof state, retrieve Mathlib lemmas that help prove its goal`. La salida es una puntuación de relevancia para cada par (estado de prueba, premisa).

El entrenamiento usa exclusivamente particiones públicas: LeanDojo Benchmark 4 (v10) `random/train`, emparejando cada estado táctico trazado con las premisas que utiliza, y LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`) `random/train` de la misma forma. Para parte de los estados se añade tras el estado una descripción en inglés de una a tres frases del siguiente paso, generada por un LLM a partir del estado y la táctica, siguiendo el esquema de estados "augmented" de Lean Finder. La pérdida es listwise sobre una premisa positiva y siete negativos duros minados por una torre de consulta de estados entrenada con los mismos datos (sin intenciones). El conjunto final retenido tras la descontaminación estricta es de 147.412 estados (89.719 de LeanDojo y 57.693 de LeanStateSearch) y 89.298 premisas; las premisas que coinciden con aciertos de cualquier evaluación se excluyen también del softmax contrastivo.

## Capacidades

- Reordenación de premisas de Mathlib para un estado de prueba Lean 4 dado.
- Aceptación opcional de una descripción en inglés del siguiente paso tras el estado, al estilo de los estados aumentados de Lean Finder.
- Puntuación de relevancia por par (estado, premisa) con salida adecuada para pipelines de recuperación en dos etapas (recuperación seguida de reordenación).
- Integración con las modalidades `accurate` y `best` de la herramienta hpsearch.
- Manejo de negativos duros: entrenado para discriminar entre premisas plausibles pero incorrectas, no solo entre relevantes e irrelevantes evidentes.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Selección de premisas en demostración automática de teoremas: dado un estado de prueba Lean 4, el modelo reordena un conjunto de candidatos recuperados de Mathlib y prioriza los lemas que probablemente cierren el objetivo, reduciendo el espacio de búsqueda del demostrador.
- Integración en hpsearch en modo `accurate`: el modelo actúa como segunda etapa de ranking sobre los candidatos recuperados, mejorando la precisión a costa de una latencia adicional controlada al operar sobre 4B parámetros.
- Integración en hpsearch en modo `best`: combinado con la descripción en inglés del siguiente paso, el modelo puede aprovechar la señal semántica adicional para desempatar premisas con puntuaciones próximas.
- Construcción de datasets de entrenamiento para demostradores: el modelo puede etiquetar pares (estado, premisa) y generar negativos duros de calidad para entrenar torres de recuperación o políticas de búsqueda.
- Evaluación comparativa de recuperadores de premisas: sirve como reordenador de referencia en experimentos que midan la calidad de un recuperador denso o léxico sobre LeanDojo, LeanStateSearch o MathlibQR.
- Asistencia a matemáticos que formalizan en Lean 4: un IDE o extensión puede consultar el modelo para sugerir lemas relevantes al escribir una táctica, con la ventaja de que el modelo está entrenado específicamente con estados reales de LeanDojo y LeanStateSearch.
- Filtrado de candidatos en pipelines de prueba automatizada a gran escala: al ser un modelo de 4B en safetensors, puede desplegarse en una GPU de 24 GB y procesar lotes de pares (estado, premisa) para descartar premisas irrelevantes antes de pasarlas a un demostrador más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.021.784.576 parámetros, en precisión completa (fp32) serían necesarios unos 16 GB; en bf16/fp16, unos 8 GB; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2-3 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 permiten inferencia en bf16 sin problemas; una RTX 3090 (24 GB) también sería suficiente en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza, aunque no hay confirmación oficial.
- Opciones de despliegue: la model card indica `transformers` como librería; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-rerank-4b-state-v2 | 4.021.784.576 | no disponible | Reordenación de premisas Lean 4 / Mathlib | apache-2.0 | HuggingFace |
| hmzprover/hpsearch-rerank-4b-state (modelo base) | no disponible | no disponible | Reordenación de premisas Lean 4 / Mathlib | no disponible en la información | HuggingFace |
| Qwen3-Reranker-4B (base original) | no disponible | no disponible | Reordenación genérica de textos | no disponible en la información | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para juzgar la utilidad de premisas de Mathlib respecto a estados de prueba Lean 4; su uso fuera de ese dominio no está validado.
- Idiomas: no se documentan idiomas soportados; la descripción del siguiente paso está en inglés y los estados y lemas en Lean 4, por lo que no cabe esperar un buen comportamiento multilingüe general.
- Riesgo de alucinación: como modelo de ranking, la salida es una puntuación, pero puede priorizar premisas plausibles sintácticamente que no sean demostrablemente útiles; no se han publicado métricas de calibración.
- Sesgos: no se documentan análisis de sesgos; el entrenamiento se limita a LeanDojo Benchmark 4 y LeanStateSearch, lo que puede infrarepresentar áreas de Mathlib poco cubiertas en esas particiones.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los modelos base (Qwen3-Reranker-4B) y de los datos de entrenamiento (LeanDojo, LeanStateSearch) antes de un despliegue en producción.
- Contexto: la longitud máxima de contexto no está documentada, lo que impide garantizar el comportamiento con estados de prueba muy largos o con descripciones extensas del siguiente paso.
- Madurez: el modelo tiene 30 descargas y 0 likes en el momento de la ficha; no hay evidencia de validación independiente ni de uso en producción.
- Descontaminación: aunque el autor aplica una descontaminación estricta, la evaluación sobre los conjuntos citados debe realizarse con cuidado para no solapar estados o premisas con los usados en entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-rerank-4b-state-v2
- Modelo base del ajuste: https://huggingface.co/hmzprover/hpsearch-rerank-4b-state
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- LeanDojo Benchmark 4 (v10): no disponible en la información proporcionada
- LeanStateSearch (`ruc-ai4math/mathlib_handler_benchmark_410`): no disponible en la información proporcionada
