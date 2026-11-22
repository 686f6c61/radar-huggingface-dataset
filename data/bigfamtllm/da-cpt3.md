# BigFamTLLM/da-cpt3

## Resumen

da-cpt3 es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un equipo del curso IN5640 de la Universidad de Oslo, dentro de un proyecto académico que entrena modelos en noruego, danés y multilingües con la misma arquitectura y presupuesto computacional. Este checkpoint concreto parte del modelo danés da-emb, al que se le sustituyó el tokenizador por uno noruego de 32k tokens, se le aplicó un entrenamiento de solo embeddings durante 1.000 pasos y después se le sometió a preentrenamiento continuado sobre texto noruego, acumulando 8,17B tokens vistos hasta este punto.

El modelo emplea la arquitectura Qwen3 (36 capas, tamaño oculto 2176, 34 cabezas de atención con 17 cabezas KV, embeddings atados) y una longitud de contexto de 4096 tokens. Es el checkpoint 3 de una serie de 10, situado en el paso 14.580 de 48.600 del entrenamiento de preentrenamiento continuado, por lo que representa un estado intermedio de la adaptación del modelo danés al noruego (85% Bokmål, 15% Nynorsk).

Su relevancia es fundamentalmente de investigación: forma parte de un conjunto de 50 modelos publicados para estudiar la transferencia entre lenguas cercanas, el impacto del cambio de tokenizador y el efecto del annealing en modelos pequeños entrenados con presupuesto limitado. No es un modelo instruction-tuned ni está pensado para producción; es una base para experimentación lingüística en lenguas escandinavas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), embeddings atados |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | da, no, nb, nn (danés, noruego, Bokmål, Nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |
| Tokenizador | noruego, 32k tokens |
| Tokens noruegos vistos | 8,17B |
| Checkpoint | 3 de 10 (paso 14.580 de 48.600) |
| Modelo base | BigFamTLLM/da-emb |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuración de Qwen3: 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia 4096, batch size 128, optimizador AdamW y una tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento (1e-4 durante la fase de solo embeddings).

El proceso de adaptación tiene tres fases diferenciadas: primero se sustituye el tokenizador danés por uno noruego de 32k tokens, conservando el embedding de los tokens compartidos entre ambos vocabularios e inicializando los nuevos a partir de la media de las piezas del tokenizador antiguo; después se ejecutan 1.000 pasos de entrenamiento de solo embeddings; finalmente se realiza preentrenamiento continuado sobre datos de HPLT 4.0 con una mezcla del 85% Bokmål y 15% Nynorsk. El checkpoint da-cpt3 corresponde al paso 14.580 de 48.600. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue también en transformers 4.x. Existe una variante annealed de este mismo checkpoint (da-cpt3-anneal) que añade 916 pasos (0,48B tokens) de datos de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero.

## Capacidades

- Generación de texto autoregresiva en danés y noruego (Bokmål y Nynorsk), con contexto de 4096 tokens.
- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable ni mantiene formato de chat sin ajuste adicional.
- Razonamiento y conocimiento del mundo limitados por su tamaño (2,12B) y por el volumen de entrenamiento (8,17B tokens noruegos en este checkpoint).
- Capacidad de completar texto, resolver tareas de ortografía y lectura básica en noruego, según los resultados de NorEval.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües limitadas a las lenguas declaradas (da, no, nb, nn); no se garantiza comportamiento en otras lenguas.
- Capacidad de robustez ante ruido moderada: 0,372 en entrada limpia y -0,043 de media bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigación sobre transferencia entre lenguas cercanas: el modelo permite estudiar cómo un modelo entrenado en danés se adapta al noruego mediante cambio de tokenizador y preentrenamiento continuado, comparando con los otros checkpoints de la serie (da-cpt1 a da-cpt10).
- Evaluación del impacto del annealing: al existir la variante da-cpt3-anneal, se puede medir de forma controlada la ganancia de 916 pasos de datos de alta calidad sobre el mismo estado de entrenamiento.
- Experimentos de tokenización: sirve para analizar el efecto de sustituir un vocabulario de 32k por otro del mismo tamaño en un modelo pequeño, con inicialización por media de piezas.
- Generación de texto en noruego para corpus sintéticos de investigación: con 4096 tokens de contexto puede completar documentos cortos en Bokmål o Nynorsk, siempre con revisión humana.
- Fine-tuning posterior para tareas específicas: al ser una base de 2,12B en safetensors, es viable ajustarlo con LoRA en una sola GPU para tareas de clasificación, etiquetado o generación acotada en noruego.
- Estudio de robustez lingüística: los datos de NorEval con ruido permiten reproducir análisis sobre degradación de rendimiento en condiciones controladas.
- Docencia y reproducibilidad: el proyecto publica 50 modelos con la misma arquitectura y presupuesto, lo que facilita replicar experimentos de preentrenamiento a pequeña escala.

## Benchmarks y rendimiento

NorEval 1.1 (resultados publicados en la model card):

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,216 | 0,246 |
| nob_orthography | acc | 0,830 | 0,856 |
| nob_reading | f1 | 0,194 | 0,198 |
| nob_world | acc | 0,291 | 0,291 |
| nno_language | em_first | 0,364 | 0,438 |
| nno_world | acc | 0,294 | 0,302 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,372 en entrada limpia, -0,043 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB con contexto completo de 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB (aunque no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100). Cabe holgadamente en GPUs de consumo.
- Despliegue: transformers (probado por el autor con `AutoModelForCausalLM` y `dtype=torch.bfloat16`); compatible con text-generation-inference y endpoints según los tags del repo. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt3 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Checkpoint intermedio de CPT, base sin instruction tuning |
| BigFamTLLM/da-cpt3-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Misma arquitectura, con annealing de 0,48B tokens |
| BigFamTLLM/no-base | no disponible | no disponible | no | no disponible | Entrenado desde cero en noruego, misma arquitectura y presupuesto |
| BigFamTLLM/da-base | no disponible | no disponible | da | no disponible | Entrenado desde cero en danés, punto de partida de la adaptación |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo base sin instruction tuning: no sigue instrucciones ni mantiene diálogos multi-turno de forma fiable; requiere fine-tuning para uso conversacional.
- Checkpoint intermedio (3 de 10): el entrenamiento de preentrenamiento continuado no ha finalizado; los checkpoints posteriores y las variantes annealed probablemente rindan mejor.
- Riesgo de alucinación elevado: modelo pequeño (2,12B) con solo 8,17B tokens vistos, entrenado sobre texto web de HPLT 4.0.
- Puede generar contenido incorrecto u ofensivo, según advierte el propio autor; no está pensado para producción.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística restringida a danés y noruego; no se garantiza comportamiento en castellano ni en otras lenguas.
- Licencia no especificada: no se puede confirmar el uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sesgos de los datos web de HPLT 4.0 no documentados ni mitigados.
- Sin pesos cuantizados oficiales: el despliegue en CPU o GPUs de baja VRAM requiere conversión manual.
- Proyecto académico de un curso universitario: sin garantía de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt3
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Variante annealed de este checkpoint: https://huggingface.co/BigFamTLLM/da-cpt3-anneal
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoint anterior de la serie: https://huggingface.co/BigFamTLLM/da-cpt2
- Checkpoint siguiente de la serie: https://huggingface.co/BigFamTLLM/da-cpt4
