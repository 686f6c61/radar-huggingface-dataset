# BigFamTLLM/ml-cpt7

## Resumen

ml-cpt7 es el septimo checkpoint (de diez) de la fase de preentrenamiento continuado (continual pretraining, CPT) en noruego del modelo multilingue `ml-emb`, desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otono de 2026). Se trata de un modelo base de 2.115.305.088 parametros con arquitectura densa estilo Qwen3, 36 capas, hidden size 2.176 y una longitud de contexto de 4.096 tokens. No esta instruido ni alineado en seguridad: es exclusivamente un modelo preentrenado.

El modelo forma parte de un experimento comparativo de 50 modelos que investiga una pregunta concreta: si preentrenar en otros idiomas y adaptar despues al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuantos tokens noruegos los modelos adaptados alcanzan al modelo nativo. `ml-cpt7` corresponde a la iteracion 34.020 de 48.600 de la fase CPT, con 18.360.565.760 tokens noruegos leidos hasta este punto.

Su relevancia es fundamentalmente metodologica y de investigacion: permite estudiar la transferencia interlingue, el impacto del cambio de tokenizer sobre las representaciones y la curva de adaptacion de un modelo multilingue (sin noruego en el preentrenamiento original) hacia el bokmal y el nynorsk. No esta pensado para uso en produccion ni para tareas de instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atencion de 64, 17 cabezas key/value, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Qwen3 con 36 capas, hidden size de 2.176, 34 cabezas de atencion de 64 dimensiones y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y sin biases. El entrenamiento se realizo con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecucion en bf16, secuencia de 4.096, batch global de 128 (524.288 tokens por iteracion), AdamW (beta 0.9 y 0.95, epsilon 1e-8), weight decay 0.1 y clipping de gradiente 1.0.

El pipeline experimental consta de cuatro etapas: (1) tres modelos base identicos salvo por idioma y tokenizer (noruego, danes y multilingue sin noruego), con 26.000 millones de tokens cada uno; (2) sustitucion del tokenizer por el BPE noruego de 32.000 tokens del equipo (`mix_BM7_2_NN8_1`), copiando el embedding cuando el token existe en ambos vocabularios o usando la media de las piezas en que el tokenizer antiguo lo divide, seguido de 1.000 iteraciones entrenando solo los embeddings; (3) preentrenamiento continuado sobre los datos del modelo noruego, con 10 checkpoints equiespaciados; (4) evaluacion de cada checkpoint tal cual y tras un annealing sobre datos noruegos de alta calidad. Los datos de preentrenamiento original son HPLT 4.0 (ingles 80 %, danes, aleman y sueco 6,7 % cada uno, sin noruego), y la fase CPT usa bokmal al 85 % y nynorsk al 15 %. La tasa de aprendizaje de los modelos base y de la CPT es 5e-4 tras 2.000 iteraciones de warm-up y despues constante; la etapa de solo embeddings usa 1e-4 tras 100 iteraciones de warm-up; el annealing hace 100 iteraciones de warm-up hasta 5e-4 y despues decaimiento lineal a cero en 916 iteraciones.

## Capacidades

- Generacion de texto autoregresiva en noruego (bokmal y nynorsk) y en ingles, danes, aleman y sueco.
- Modelo base sin instrucciones: no sigue instrucciones, no responde a formato conversacional ni a plantillas de chat.
- Capacidad de continuacion de texto y modelado de lenguaje sobre texto noruego, incluyendo las dos normas escritas.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de vision, audio ni modo thinking.
- Capacidades multilingues limitadas a los idiomas del preentrenamiento original mas el noruego adquirido en la CPT.

## Casos de uso

- Investigacion sobre transferencia interlingue: el modelo sirve como punto de medida en la curva de adaptacion de un multilingue al noruego, permitiendo comparar el checkpoint 7 con los diez checkpoints del experimento y con el modelo nativo `no-base`.
- Estudio del cambio de tokenizer: al derivar de `ml-emb`, permite analizar como afecta la sustitucion del vocabulario BPE a las representaciones internas y a la perplejidad en noruego.
- Evaluacion de preentrenamiento continuado: util para replicar o disenar experimentos sobre cuantos tokens de un idioma nuevo necesita un modelo multilingue para igualar a uno entrenado desde cero.
- Generacion de texto base en noruego para tareas de continuacion o completado en corpus, sin expectativa de seguir instrucciones.
- Fine-tuning posterior como punto de partida: al ser un modelo base de 2.100 millones de parametros, puede servir de inicializacion para ajuste supervisado en tareas noruegas concretas.
- Analisis linguistico computacional: calculo de perplejidad y probabilidades sobre corpus bokmal y nynorsk para estudiar el comportamiento del modelo en las dos normas.
- Docencia: material practico para el curso IN5640 y para ilustrar el pipeline completo de tokenizer swap, embeddings-only y CPT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,3 GB solo para pesos (2.115 millones de parametros), mas memoria para activaciones y cache KV, que con 4.096 tokens de contexto y 17 cabezas KV resulta moderada.
- En cuantizacion de 8 bits cabria en torno a 2,2 GB de pesos; en 4 bits, en torno a 1,1 GB, aunque el autor no documenta formatos de cuantizacion soportados.
- GPU recomendadas: cabe en GPU de consumo como RTX 4090 (24 GB) y RTX 3090 (24 GB) con holgura en bf16; tambien en A100, H100 y GH200.
- Despliegue: compatible con transformers y text-generation-inference segun los tags del repositorio; vLLM, llama.cpp u Ollama no estan documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt7 | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 7 de 10 de la CPT multilingue |
| BigFamTLLM/da-cpt7 | no disponible | 4.096 | da, no, nb, nn (segun experimento) | no disponible | Checkpoint 7 de 10 de la CPT desde el modelo danes |
| BigFamTLLM/no-base | no disponible | 4.096 | no, nb, nn | no disponible | Referencia entrenada desde cero en noruego |
| BigFamTLLM/ml-base | no disponible | 4.096 | en, da, de, sv | no disponible | Modelo multilingue original sin noruego |

## Limitaciones y advertencias

- Modelo exclusivamente base: no esta instruido ni alineado en seguridad, por lo que no debe usarse directamente en aplicaciones de cara al usuario sin ajuste adicional.
- Riesgo elevado de alucinacion y de generar contenido incoherente o inapropiado, propio de un modelo preentrenado sin RLHF ni DPO.
- Es un checkpoint intermedio (iteracion 34.020 de 48.600): su rendimiento en noruego es inferior al de los checkpoints posteriores y al del modelo nativo de referencia.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- La licencia no esta declarada, lo que impide determinar si se permite el uso comercial; debe consultarse con el autor antes de cualquier uso en produccion.
- El modelo no ha sido evaluado con benchmarks publicados en la informacion disponible, por lo que no hay garantias cuantificadas de calidad.
- El soporte de noruego se limita a bokmal y nynorsk; otras variantes o registros dialectales no estan cubiertos explicitamente.
- El modelo esta vinculado a un experimento academico con recursos concretos (8 GH200, 26.000 millones de tokens base), lo que limita su comparabilidad con modelos de escala similar entrenados con presupuestos mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt7
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Checkpoint annealed: https://huggingface.co/BigFamTLLM/ml-cpt7-anneal
- Modelo nativo de referencia: https://huggingface.co/BigFamTLLM/no-base
- Version annealed del nativo: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingue original: https://huggingface.co/BigFamTLLM/ml-base
- Modelo danes: https://huggingface.co/BigFamTLLM/da-base
- Checkpoint equivalente desde el danes: https://huggingface.co/BigFamTLLM/da-cpt7
