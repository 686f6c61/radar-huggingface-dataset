# ApolloRaines/Phi-4-mini-Instruct-Desyced

## Resumen

Phi-4-mini-Instruct-Desyced es una modificación de pesos del modelo microsoft/Phi-4-mini-instruct publicada por el desarrollador independiente ApolloRaines bajo el paraguas de su proyecto jBlaze. El objetivo declarado es reducir la "sycophancy" (la tendencia del modelo a dar la razón al usuario cuando este insiste en una afirmación incorrecta), sin alterar el conocimiento, el razonamiento ni la personalidad del modelo original. Se trata, por tanto, de un modelo derivado orientado a investigación, no de un modelo entrenado desde cero.

La intervención es una "cirugía de pesos" (weight surgery) que modifica la dirección de activación asociada a la capitulación ante presión social, sin reentrenamiento, sin RLHF y sin datos adicionales. El autor reporta que en pruebas con "trampas de contradicción" el modelo pasa del 50 % al 100 % de respuestas que mantienen la posición correcta bajo presión. El modelo conserva la arquitectura, el tokenizador y la longitud de contexto del base.

Con 3.836.021.760 parámetros (3,8 mil millones) y licencia MIT, es relevante para quienes necesitan un modelo pequeño y desplegable en hardware modesto para tareas de revisión adversarial, evaluación crítica o QA donde la complacencia del modelo es un riesgo operativo. Conviene señalar que el autor indica que sus modelos públicos se publican a "intensidad parcial" como prueba de concepto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-3/Phi-4 mini, tag `phi3`, requiere `custom_code`) |
| Parametros totales | 3.836.021.760 (3,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base; el autor afirma "same context length" sin especificar cifra) |
| Tipos de cuantizacion | Safetensors (precision completa), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Tamano del repositorio | 14,3 GB |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Tokenizador | Identico al del modelo base |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Phi-4-mini-instruct de Microsoft: un transformer denso de aproximadamente 3,8 mil millones de parámetros, con el tokenizador y la configuración del base intactos. El autor declara explícitamente que no hay reentrenamiento, ni RLHF, ni DPO, ni incorporación de datos nuevos: la única modificación es una edición directa de los pesos que reduce la dirección de activación vinculada a la capitulación sycophántica.

La técnica aplicada es una intervención sobre el espacio de activaciones ("desycophancy" como modificación post-entrenamiento de pesos). El autor la describe como reducción o eliminación de la dirección de sycophancy mediante cirugía de pesos, preservando conocimiento, razonamiento y capacidades conversacionales del original. No se documentan en la información disponible detalles sobre qué capas concretas se modificaron, la magnitud de la edición ni la metodología exacta de cálculo de la dirección. Tampoco se especifican los datos de entrenamiento del modelo base (número de tokens, composición del corpus, fases de alineamiento), por lo que esos datos deben consultarse en la model card de microsoft/Phi-4-mini-instruct.

## Capacidades

- Generación de texto y conversación multi-turno, con las capacidades heredadas del Phi-4-mini-instruct.
- Razonamiento y respuesta a preguntas factuales, con menor tendencia a abandonar una respuesta correcta bajo presión del usuario.
- Mantenimiento de la posición ante argumentos de autoridad falsos ("mi profesor dijo...", "acabo de comprobarlo y...").
- Capacidades de código y matemáticas heredadas del modelo base (no se documentan métricas específicas en la información disponible).
- Compatibilidad con el ecosistema transformers y con el tokenizador del base, lo que permite sustitución directa.
- Ejecución en llama.cpp, Ollama y LM Studio mediante los GGUF publicados.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información proporcionada.

## Casos de uso

- Revisión adversarial de código: el modelo está diseñado para señalar defectos y mantener el hallazgo cuando el autor del código lo cuestiona con seguridad, evitando que una crítica real se convierta en una concesión. Es el caso de uso declarado por el autor.
- Evaluación crítica de documentos técnicos: revisión de especificaciones o informes donde el revisor debe resistir la presión de un interlocutor que defiende su versión, manteniendo las objeciones fundamentadas.
- QA factual en asistentes internos: desplegado con los GGUF Q4_K_M en estaciones de trabajo sin GPU dedicada, para responder consultas donde la corrección importa más que la complacencia.
- Moderación de discusiones y verificación de afirmaciones: comprobación de hechos en conversaciones donde el usuario insiste en datos erróneos, con menor riesgo de validación automática del error.
- Entornos educativos y de tutoría: un tutor que corrige al alumno aunque este insista en su respuesta, en lugar de ceder ante la presión social.
- Investigación sobre alineamiento y sycophancy: modelo de referencia para estudiar el efecto de la cirugía de pesos sobre el comportamiento de capitulación, comparándolo con el base sin modificar.
- Prototipado rápido en local: con 3,8 B de parámetros y GGUF Q4_K_M, sirve para experimentar con pipelines de revisión crítica en portátiles y equipos de gama media.

## Benchmarks y rendimiento

El autor solo publica una métrica propia, basada en "trampas de contradicción" (el modelo responde correctamente y luego el usuario presiona con una autoridad falsa):

| Metrica | Antes (base) | Despues (Desyced) |
|---|---|---|
| Mantiene la posicion bajo presion | 50 % | 100 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): en torno a 7,7 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU con 12-16 GB o más.
- GGUF Q8_0: aproximadamente 4 GB de pesos; cabe en GPUs consumer de 6-8 GB.
- GGUF Q4_K_M: aproximadamente 2,3-2,5 GB de pesos; cabe en GPUs consumer de 4 GB o incluso en CPU con suficiente RAM.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para precisión completa y mayor throughput; RTX 3060/4060 o superiores para cuantizaciones GGUF.
- Despliegue: transformers (safetensors), llama.cpp, Ollama y LM Studio (GGUF). El autor promociona además DeepswapLLM para ejecutar el modelo en precisión completa con streaming de capas entre GPU, RAM y disco, afirmando hasta 4x más velocidad que AirLLM (dato del autor, no verificado de forma independiente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-Instruct-Desyced | 3,8 B | No disponible | Anti-sycophancy por cirugia de pesos | MIT | Hugging Face (safetensors, GGUF) |
| microsoft/Phi-4-mini-instruct | 3,8 B | No disponible | Modelo base de Microsoft | MIT | Hugging Face |
| Llama 3.2 3B Instruct | 3,2 B | 128 K (segun ficha publica de Meta) | Modelo generalista pequeno | Licencia comunitaria Llama 3.2 | Hugging Face, Ollama |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K (segun ficha publica de Alibaba) | Modelo generalista pequeno, multilingue | Apache 2.0 | Hugging Face, Ollama |

La comparativa se limita a datos públicos de los modelos alternativos; no se dispone de resultados de benchmarks del modelo Desyced frente a ellos. La diferencia principal frente a Phi-4-mini-instruct es la modificación anti-sycophancy y la disponibilidad de GGUF en el mismo repositorio.

## Limitaciones y advertencias

- Modelo publicado como demostración de investigación: el propio autor advierte que sus modelos públicos se liberan a "intensidad parcial" y que lo descargado es la demo, no el producto.
- La métrica del 100 % procede de una prueba propia del autor con trampas de contradicción; no hay validación independiente ni benchmarks estandar publicados.
- No se documenta la metodología exacta de la cirugía de pesos ni las capas afectadas, lo que dificulta reproducir o auditar la modificación.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad tras la modificación; mantener la posición no garantiza que la posición sea correcta.
- Solo soporta inglés; no hay evidencia de comportamiento multilingüe.
- La reducción de sycophancy puede traducirse en mayor terquedad en contextos donde el usuario tiene razón; no se documenta el efecto sobre la tasa de falsos negativos.
- Licencia MIT, que permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden estar sujetos a condiciones adicionales que deben verificarse en la ficha de microsoft/Phi-4-mini-instruct.
- Requiere `custom_code` y `trust_remote_code` para cargarse con transformers, lo que implica ejecutar código del repositorio.
- No se documentan sesgos específicos del modelo modificado; deben asumirse los del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Phi-4-mini-Instruct-Desyced
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor: https://huggingface.co/ApolloRaines
