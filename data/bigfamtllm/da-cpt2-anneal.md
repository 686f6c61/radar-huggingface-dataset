# BigFamTLLM/da-cpt2-anneal

## Resumen

da-cpt2-anneal es un modelo de lenguaje base de 2.115.305.088 parámetros (2,12B), desarrollado por el colectivo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un checkpoint intermedio del proyecto: parte de da-base (modelo entrenado desde cero en danés con arquitectura Qwen3), se le sustituye el tokenizador por uno noruego de 32k piezas, se entrena únicamente la capa de embeddings durante 1.000 pasos y después se aplica preentrenamiento continuado sobre texto noruego. Este repositorio corresponde al checkpoint 2 de 10 (paso 9.720 de 48.600) y es, además, la versión "annealed" de da-cpt2.

La relevancia del modelo es metodológica más que de producto: forma parte de un experimento controlado de 50 modelos en el que se comparan modelos entrenados desde cero en noruego, danés y multilingüe, adaptaciones al noruego con y sin annealing, y checkpoints intermedios de preentrenamiento continuado. El objetivo es medir el efecto del annealing (decaimiento lineal de la tasa de aprendizaje hasta 0 sobre texto de alta calidad) y el de la adaptación de tokenizador y embeddings entre lenguas cercanas como el danés y el noruego.

Es un modelo estrictamente base, sin ajuste por instrucciones, sin RLHF y sin alineación. No está pensado para uso en producción; el propio autor lo describe como un modelo de investigación entrenado con texto web que puede generar salidas erróneas u ofensivas. Su interés práctico es servir de referencia para estudiar transferencia entre lenguas germánicas nórdicas y para experimentar con adaptación de tokenizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x) |
| Tokenizador | Noruego, 32k piezas |
| Tokens noruegos vistos | 6,10B |
| Checkpoint | 2 de 10 (paso 9.720 de 48.600) |
| Modelo base | BigFamTLLM/da-cpt2 |
| Tamaño del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuración compacta: 36 capas transformer decoder-only, dimensión oculta de 2.176, 34 cabezas de atención con 17 cabezas KV (GQA), embeddings atados entre entrada y salida, y una longitud de secuencia de 4.096 tokens. El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia de Sigma2, con batch size de 128, AdamW, tasa de aprendizaje pico de 5e-4, 2.000 pasos de warmup y sin decaimiento durante la fase principal (1e-4 en la etapa de solo embeddings).

El pipeline de adaptación parte de da-base, un modelo entrenado desde cero en danés, al que se le sustituye el tokenizador por uno noruego de 32k piezas. Los tokens compartidos por ambos vocabularios conservan su embedding original y los nuevos se inicializan con la media de las piezas del tokenizador antiguo. Tras 1.000 pasos de entrenamiento solo de embeddings, se aplica preentrenamiento continuado sobre datos noruegos de HPLT 4.0, con una mezcla del 85% bokmål y 15% nynorsk. Este checkpoint concreto (da-cpt2) corresponde al paso 9.720 de 48.600; la versión anneal añade 916 pasos adicionales (0,48B tokens) sobre texto bokmål y nynorsk de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta 0. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en bokmål, nynorsk y danés; es un modelo base, no un asistente conversacional.
- Continuación de texto y modelado de lenguaje puro: no está ajustado para seguir instrucciones ni para formato de chat.
- Capacidad de razonamiento y conocimiento del mundo limitada y medida en NorEval (ver sección de benchmarks), con resultados bajos en tareas de lectura y conocimiento.
- Competencia ortográfica relativamente alta en bokmål (0,848 de accuracy en 0-shot), atribuible en parte a la adaptación del tokenizador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas a las lenguas nórdicas del entrenamiento (da, no, nb, nn); no hay evidencia de competencia en otras lenguas.

## Casos de uso

- Investigación sobre transferencia entre lenguas cercanas: el modelo permite medir cuánto conocimiento danés se transfiere al noruego tras el cambio de tokenizador y el preentrenamiento continuado, comparándolo con los checkpoints da-cpt1 a da-cpt10 y con las variantes entrenadas desde cero (no-base).
- Estudio del efecto del annealing: al existir pares "as trained" y "annealed" para cada checkpoint, se puede cuantificar la mejora en tareas NorEval atribuible a los 916 pasos finales con decaimiento de learning rate.
- Evaluación de estrategias de inicialización de embeddings: la técnica de conservar embeddings de tokens compartidos e inicializar los nuevos con la media de las piezas permite reproducir el experimento y comparar alternativas de adaptación de vocabulario.
- Generación de texto noruego para experimentos de modelado de lenguaje: útil para calcular perplejidad, analizar distribuciones de tokens o generar corpus sintéticos de baja exigencia en investigación, no en producto.
- Punto de partida para fine-tuning supervisado: al ser un base model de 2,12B con contexto de 4.096, puede servir como inicialización para tareas downstream en noruego en entornos académicos con recursos moderados.
- Reproducción de pipelines Megatron-LM a Hugging Face: el repositorio documenta la conversión con Megatron-Bridge y los ajustes de configuración para transformers 4.x, lo que lo hace útil como caso de referencia para conversiones similares.
- Docencia y cursos de NLP: forma parte de un conjunto de 50 modelos con presupuesto y arquitectura idénticos, lo que facilita prácticas comparativas de evaluación y análisis de resultados.

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,231 | 0,279 |
| nob_orthography | acc | 0,848 | 0,871 |
| nob_reading | f1 | 0,173 | 0,208 |
| nob_world | acc | 0,292 | 0,293 |
| nno_language | em_first | 0,431 | 0,499 |
| nno_world | acc | 0,297 | 0,305 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,373 en entrada limpia y una caída media de -0,043 bajo ruido.

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contextos cortos y algo más cerca de los 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no se publican artefactos cuantizados).
- GPU recomendadas para entrenamiento o fine-tuning: GH200 (usadas por el autor), A100 40/80 GB, H100; para inferencia basta una GPU con 8 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) en bfloat16 o float16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor), text-generation-inference (el modelo está etiquetado como compatible con TGI y endpoints), y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se publican en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt2-anneal | 2,12B | 4.096 | da, no, nb, nn | No disponible | Base, investigación, checkpoint 2/10 con annealing |
| BigFamTLLM/da-cpt2 | 2,12B | 4.096 | da, no, nb, nn | No disponible | Mismo checkpoint sin annealing; permite aislar su efecto |
| BigFamTLLM/no-base | 2,12B (según proyecto) | 4.096 | no, nb, nn | No disponible | Entrenado desde cero en noruego; referencia sin transferencia desde danés |
| BigFamTLLM/da-base | 2,12B (según proyecto) | 4.096 | da | No disponible | Modelo de origen en danés antes de la adaptación |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, más allá de que el proyecto declara haber evaluado los 50 modelos con y sin annealing. No se comparan aquí con modelos externos de otros desarrolladores porque no hay resultados publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat y no debe usarse como asistente tal cual.
- Riesgo elevado de alucinación y de generar contenido erróneo u ofensivo; el autor lo advierte explícitamente y lo declara no apto para producción.
- Entrenado sobre texto web de HPLT 4.0, por lo que hereda sesgos presentes en esos datos; no se documenta ninguna mitigación.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- Cobertura lingüística restringida a danés y noruego (bokmål y nynorsk); no hay evidencia de competencia en otras lenguas y el tokenizador está especializado en noruego.
- Resultados bajos en NorEval en lectura (F1 de 0,173-0,208) y conocimiento del mundo (accuracy en torno a 0,29), lo que limita su utilidad para tareas que requieran comprensión o conocimiento factual.
- Robustez ante ruido limitada: caída media de -0,043 en las tres tareas evaluadas con perturbaciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que obliga a generarlas si se quiere desplegar en hardware muy limitado.
- Sin métricas de latencia ni throughput publicadas; el rendimiento en producción no está caracterizado.
- Proyecto académico de un curso universitario: no hay garantía de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt2-anneal
- Modelo base (sin annealing): https://huggingface.co/BigFamTLLM/da-cpt2
- Modelo de origen en danés: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints de preentrenamiento continuado en danés: https://huggingface.co/BigFamTLLM/da-cpt1 , https://huggingface.co/BigFamTLLM/da-cpt3 , https://huggingface.co/BigFamTLLM/da-cpt4 , https://huggingface.co/BigFamTLLM/da-cpt5 , https://huggingface.co/BigFamTLLM/da-cpt6 , https://huggingface.co/BigFamTLLM/da-cpt7 , https://huggingface.co/BigFamTLLM/da-cpt8 , https://huggingface.co/BigFamTLLM/da-cpt9 , https://huggingface.co/BigFamTLLM/da-cpt10
- Versiones annealed de los checkpoints en danés: https://huggingface.co/BigFamTLLM/da-cpt1-anneal , https://huggingface.co/BigFamTLLM/da-cpt3-anneal , https://huggingface.co/BigFamTLLM/da-cpt4-anneal , https://huggingface.co/BigFamTLLM/da-cpt5-anneal , https://huggingface.co/BigFamTLLM/da-cpt6-anneal , https://huggingface.co/BigFamTLLM/da-cpt7-anneal , https://huggingface.co/BigFamTLLM/da-cpt8-anneal , https://huggingface.co/BigFamTLLM/da-cpt9-anneal , https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Dataset de entrenamiento (HPLT 4.0): no disponible como enlace en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
