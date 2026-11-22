# BigFamTLLM/da-cpt8

## Resumen

da-cpt8 es el octavo checkpoint intermedio (paso 38.880 de 48.600) de un proceso de preentrenamiento continuado en noruego sobre un modelo base de origen danés. Lo desarrolla BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). El modelo parte de da-emb y se ha adaptado al noruego mediante un tokenizador propio de 32.000 entradas y 20.910 millones de tokens de entrenamiento adicionales. Es un modelo base, no ajustado a instrucciones, orientado a investigación y evaluación de estrategias de adaptación lingüística.

La arquitectura es la de Qwen3: un transformer denso de 36 capas, tamaño oculto de 2.176, 34 cabezas de atención (17 de clave-valor) y embeddings atados, con 2.115.305.088 parámetros totales (2,12B). La longitud de contexto es de 4.096 tokens. El modelo se entrenó con Megatron-LM sobre 8 GPU GH200 y se convirtió a formato Hugging Face con Megatron-Bridge.

Su relevancia es acotada pero clara: forma parte de una matriz experimental de 50 modelos que compara, con el mismo presupuesto de cómputo, el preentrenamiento desde cero frente a la adaptación de modelos daneses y multilingües al noruego, con y sin etapa de annealing. da-cpt8 permite estudiar la curva de aprendizaje intermedia de esa adaptación, algo poco habitual en modelos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danes (da), noruego (no), bokmal (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

da-cpt8 es un transformer denso con la arquitectura de Qwen3: 36 capas, dimensión oculta de 2.176, 34 cabezas de atención con 17 cabezas de clave-valor (GQA) y embeddings atados entre entrada y salida. Se entrena sobre da-emb, que a su vez deriva de da-base, un modelo entrenado desde cero en danés. La adaptación al noruego consta de tres fases: sustitución del tokenizador por uno noruego de 32.000 entradas, 1.000 pasos de entrenamiento exclusivo de embeddings y preentrenamiento continuado en noruego. En el cambio de tokenizador, los tokens compartidos por ambos vocabularios conservan su embedding y los nuevos arrancan desde la media de las piezas del tokenizador antiguo.

El entrenamiento se realizó con Megatron-LM sobre 8 GPU GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4.096, batch de 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4, con 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de embeddings). Los datos provienen de HPLT 4.0, con una mezcla noruega del 85% bokmål y 15% nynorsk. da-cpt8 ha visto 20.910 millones de tokens noruegos. Existe una variante hermana, da-cpt8-anneal, que añade 916 pasos (0,48B tokens) de annealing con datos de alta calidad en bokmål y nynorsk y decaimiento lineal a cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en bokmål, nynorsk y danés; es un modelo base, sin ajuste a instrucciones.
- Modelado del lenguaje y continuación de texto; no dispone de formato conversacional ni de plantilla de chat.
- Capacidad multilingüe limitada a los cuatro códigos declarados (da, no, nb, nn).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Rendimiento medido en NorEval 1.1 en tareas de lengua, ortografía, lectura y conocimiento del mundo (ver sección de benchmarks).

## Casos de uso

- Investigación sobre adaptación lingüística: comparar da-cpt8 con da-cpt7, da-cpt9 y sus variantes annealed para trazar la curva de aprendizaje del preentrenamiento continuado en noruego con un presupuesto fijo.
- Evaluación de estrategias de tokenizador: analizar el impacto del cambio de vocabulario danés a noruego de 32k mediante la inicialización por media de piezas, usando este checkpoint como punto intermedio de la serie.
- Experimentos de continuación de texto en noruego: generar completaciones de documentos en bokmål o nynorsk para estudiar la fluidez y la coherencia local dentro de una ventana de 4.096 tokens.
- Base para ajuste fino supervisado posterior: al ser un modelo base de 2,12B, sirve como punto de partida para SFT o LoRA en tareas downstream noruegas, siempre que se respete la licencia (no disponible).
- Evaluación de robustez: el autor publica métricas con y sin ruido en tres tareas de NorEval, lo que permite reproducir y ampliar ese análisis con este checkpoint.
- Docencia y reproducibilidad: al formar parte de una matriz de 50 modelos con la misma arquitectura y presupuesto, es útil en cursos y trabajos sobre entrenamiento de LLM a pequeña escala.
- Estudio del sesgo de dominio en datos web: los datos de HPLT 4.0 son texto web, por lo que el modelo permite analizar qué sesgos y artefactos introduce esa fuente en noruego.

## Benchmarks y rendimiento

NorEval 1.1, resultados publicados por el autor:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,241 | 0,277 |
| nob_orthography | acc | 0,855 | 0,870 |
| nob_reading | f1 | 0,234 | 0,257 |
| nob_world | acc | 0,295 | 0,301 |
| nno_language | em_first | 0,413 | 0,499 |
| nno_world | acc | 0,302 | 0,324 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,388 en entrada limpia y una caída media de 0,044 bajo ruido. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 4,3 GB solo para pesos (2,12B × 2 bytes), más caché KV y activaciones; en la práctica, entre 6 y 8 GB en fp16/bf16 y en torno a 3-4 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o GH200 para mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt8 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Checkpoint 8/10 de CPT sobre da-emb |
| BigFamTLLM/da-cpt8-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Misma base con etapa de annealing |
| BigFamTLLM/no-base | 2,12B | 4.096 | no, nb, nn | no disponible | Entrenado desde cero en noruego |
| BigFamTLLM/da-base | 2,12B | 4.096 | da | no disponible | Modelo danes de origen |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Es un modelo base sin ajuste a instrucciones: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- Entrenado sobre texto web de HPLT 4.0: puede generar contenido erróneo, sesgado u ofensivo; el propio autor advierte que no está pensado para producción.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a danés y noruego (bokmål y nynorsk); no se declara soporte de otras lenguas.
- Es un checkpoint intermedio (paso 38.880 de 48.600): no representa el estado final del entrenamiento y su calidad es inferior a la de los checkpoints posteriores o annealed.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Riesgo de alucinación elevado en tareas de conocimiento del mundo, coherente con los resultados de NorEval (acc de 0,295 en nob_world y 0,302 en nno_world a 0-shot).
- Sin datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt8
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Modelo de origen danés: https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-cpt8-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints CPT daneses: https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt2, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt6, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints CPT multilingües: https://huggingface.co/BigFamTLLM/ml-cpt1 a https://huggingface.co/BigFamTLLM/ml-cpt10
- Asignatura IN5640, Universidad de Oslo: no disponible como enlace en la información proporcionada
- Paper de NorEval 1.1: no disponible como enlace en la información proporcionada
