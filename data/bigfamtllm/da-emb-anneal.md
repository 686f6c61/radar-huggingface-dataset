# BigFamTLLM/da-emb-anneal

## Resumen

da-emb-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base de generación de texto en noruego (bokmål y nynorsk) construido sobre la arquitectura Qwen3, que parte de un modelo entrenado desde cero en danés (da-base) al que se le sustituyó el tokenizador por uno noruego de 32k tokens y se le aplicó un proceso de adaptación en dos fases: primero entrenamiento exclusivo de embeddings (1.000 pasos, 1.000 millones de tokens noruegos vistos) y después un ajuste fino continuado con annealing.

El modelo es la versión "annealed" de da-emb: añade 916 pasos adicionales (0,48B tokens) sobre texto noruego de alta calidad en bokmål y nynorsk, con decaimiento lineal de la tasa de aprendizaje hasta cero. El resultado es un checkpoint base, sin instrucciones (no instruction-tuned), pensado como punto de partida para preentrenamiento continuado y como objeto de estudio comparativo dentro de una familia de 50 modelos entrenados con la misma arquitectura y presupuesto.

Su relevancia es fundamentalmente académica y experimental: permite evaluar si la adaptación de un modelo danés a noruego mediante sustitución de tokenizador y annealing mejora el rendimiento en tareas noruegas (NorEval 1.1) frente a entrenar desde cero. No está pensado para producción y el autor lo declara explícitamente como modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atención, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face, cargable en transformers 4.x) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados (tied embeddings). Se entrenó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings).

Los datos proceden de HPLT 4.0, con una mezcla noruega compuesta por un 85% de bokmål y un 15% de nynorsk. La sustitución de tokenizador preserva el embedding de los tokens compartidos entre ambos vocabularios y, para los tokens nuevos, inicializa desde la media de las piezas del tokenizador antiguo. La fase de annealing consta de 916 pasos (0,48B tokens) sobre texto noruego de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se realizó con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto en noruego bokmål y nynorsk, además de danés.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Razonamiento y conocimiento del mundo limitados por su tamaño (2,12B) y por el volumen de entrenamiento (aproximadamente 1,48B tokens noruegos vistos entre ambas fases).
- Capacidad multilingüe restringida a la familia escandinava continental (da, no, nb, nn); no se documenta soporte de inglés ni de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Evaluado en NorEval 1.1 en tareas de lengua, ortografía, lectura y conocimiento del mundo, con y sin contexto de un ejemplo (0-shot y 1-shot).

## Casos de uso

- Investigación en adaptación cross-lingüe: sirve como checkpoint de referencia para estudiar el efecto del annealing sobre un modelo adaptado de danés a noruego, comparándolo con da-emb, no-base y los checkpoints da-cpt1 a da-cpt10.
- Punto de partida para preentrenamiento continuado (CPT): el autor lo define explícitamente como el inicio del CPT, por lo que es adecuado para continuar el entrenamiento con corpus noruegos adicionales antes de un ajuste por instrucciones.
- Evaluación de tokenizadores: permite analizar el impacto de sustituir un vocabulario por uno noruego de 32k tokens con inicialización por media de piezas, un caso de estudio útil para quienes diseñan tokenizadores para lenguas de bajos recursos.
- Generación de texto noruego a pequeña escala: con 2,12B parámetros y contexto de 4096 tokens puede emplearse en experimentos de continuación de texto, perplejidad y análisis lingüístico sobre bokmål y nynorsk.
- Estudio de robustez frente a ruido: el modelo publica métricas de robustez (0,350 en entrada limpia, -0,042 de media bajo ruido en tres tareas de NorEval), lo que lo hace útil para investigar degradación ante entradas ruidosas.
- Docencia y reproducibilidad: al formar parte de una familia de 50 modelos con la misma arquitectura y presupuesto, facilita experimentos controlados y comparaciones reproducibles en cursos de PLN.
- Evaluación comparativa de modelos escandinavos: útil como línea base noruega de 2B parámetros en estudios que comparen modelos entrenados desde cero frente a adaptados.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,172 | 0,213 |
| nob_orthography | acc | 0,856 | 0,874 |
| nob_reading | f1 | 0,172 | 0,171 |
| nob_world | acc | 0,282 | 0,279 |
| nno_language | em_first | 0,292 | 0,360 |
| nno_world | acc | 0,278 | 0,273 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,350 en entrada limpia y -0,042 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits: alrededor de 1,1 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: GH200 (usada en entrenamiento), A100, H100 para entrenamiento o inferencia de alto throughput; RTX 4090, RTX 3090, RTX 4080 y GPUs consumer con 8 GB o más para inferencia en bf16.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en bf16/fp16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo); vLLM, llama.cpp u Ollama no están documentados, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-emb-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Modelo base de investigación, sin instruction tuning |
| BigFamTLLM/da-emb | 2,12B | 4.096 | da, no, nb, nn | no disponible | Versión sin annealing del mismo checkpoint; misma arquitectura y tokenizador |
| BigFamTLLM/no-base | no disponible | no disponible | no (noruego) | no disponible | Entrenado desde cero en noruego; misma arquitectura y presupuesto |
| BigFamTLLM/da-base | no disponible | no disponible | da | no disponible | Modelo original danés del que deriva da-emb |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe esperarse que siga instrucciones, mantenga formato conversacional ni respete roles de sistema/usuario.
- El autor advierte explícitamente de que puede producir salidas incorrectas u ofensivas, y de que no está pensado para uso en producción.
- Entrenado sobre texto web (HPLT 4.0), por lo que hereda sesgos, toxicidad y errores factuales de ese corpus.
- Riesgo de alucinación elevado: con 2,12B parámetros y aproximadamente 1,48B tokens noruegos vistos, su conocimiento del mundo es limitado (0,282 de accuracy en nob_world 0-shot).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a danés y noruego (bokmål/nynorsk); no se documenta competencia en inglés ni en otras lenguas.
- Licencia no disponible: no puede asumirse permiso para uso comercial sin consultar al autor.
- Rendimiento bajo en tareas de lectura (F1 de 0,172 en nob_reading) y degradación media de -0,042 bajo ruido, lo que desaconseja su uso en entornos con entradas ruidosas sin validación previa.
- Proyecto académico de un curso universitario: no hay garantía de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-emb-anneal
- Modelo base (da-emb): https://huggingface.co/BigFamTLLM/da-emb
- Modelo original danés (da-base): https://huggingface.co/BigFamTLLM/da-base
- Versión danesa con annealing (da-base-anneal): https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo noruego desde cero (no-base): https://huggingface.co/BigFamTLLM/no-base
- Versión noruega con annealing (no-base-anneal): https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingüe desde cero (ml-base): https://huggingface.co/BigFamTLLM/ml-base
- Versión multilingüe con annealing (ml-base-anneal): https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo multilingüe con embeddings adaptados (ml-emb): https://huggingface.co/BigFamTLLM/ml-emb
- Versión multilingüe con embeddings adaptados y annealing (ml-emb-anneal): https://huggingface.co/BigFamTLLM/ml-emb-anneal
- Checkpoints CPT daneses (da-cpt1 a da-cpt10): https://huggingface.co/BigFamTLLM/da-cpt1 hasta https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT daneses con annealing (da-cpt1-anneal a da-cpt10-anneal): https://huggingface.co/BigFamTLLM/da-cpt1-anneal hasta https://huggingface.co/BigFamTLLM/da-cpt10-anneal
- Checkpoints CPT multilingües (ml-cpt1 a ml-cpt10): https://huggingface.co/BigFamTLLM/ml-cpt1 hasta https://huggingface.co/BigFamTLLM/ml-cpt10
- Checkpoints CPT multilingües con annealing (ml-cpt1-anneal a ml-cpt10-anneal): https://huggingface.co/BigFamTLLM/ml-cpt1-anneal hasta https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
