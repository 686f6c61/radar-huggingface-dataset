# BigFamTLLM/ml-cpt2

## Resumen

ml-cpt2 es un modelo de lenguaje base de 2.115.305.088 parámetros (2.045.673.088 sin la matriz de embeddings atada) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata del segundo checkpoint (de diez) de la fase de preentrenamiento continuado (CPT) sobre noruego de un modelo multilingüe que previamente pasó por un intercambio de tokenizador y una etapa de entrenamiento exclusivo de embeddings. El modelo parte de `BigFamTLLM/ml-emb` y, en este punto, ha leído 5.620.367.360 tokens en noruego.

El interés del modelo es fundamentalmente experimental: forma parte de un estudio controlado de 50 modelos que investiga si preentrenar en otros idiomas y adaptar después al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos se produce el alcance. La arquitectura es un decoder denso estilo Qwen3 con 36 capas, tamaño oculto 2.176, 34 cabezas de atención de 64 dimensiones, 17 cabezas clave/valor, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y sin sesgos. La longitud de contexto es de 4.096 tokens.

Es un modelo exclusivamente preentrenado: no ha pasado por ajuste de instrucciones ni por alineamiento de seguridad, por lo que su uso previsto es la investigación sobre dinámica de adaptación lingüística y como base para posteriores ajustes, no el despliegue directo en producción conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden 2.176, 34 cabezas de 64, 17 KV heads, SwiGLU 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin sesgos) |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 36 capas con atención multi-cabeza agrupada (34 cabezas de consulta y 17 de clave/valor), normalización RMSNorm con QK-norm, activación SwiGLU en la FFN y embeddings atados a la proyección de salida. El tokenizador es un BPE noruego de 32.000 tokens (denominado internamente `mix_BM7_2_NN8_1`) que cubre bokmål y nynorsk, sustituido sobre el vocabulario original del modelo multilingüe mediante copia directa de embeddings cuando el token existe en ambos vocabularios y mediante la media de las piezas en que el tokenizador antiguo dividía el token en caso contrario.

El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPUs NVIDIA GH200 por ejecución en bf16, secuencia de 4.096 tokens, batch global de 128 (524.288 tokens por iteración), AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y clipping de gradiente 1,0. La tasa de aprendizaje es 5e-4 tras 2.000 iteraciones de calentamiento y luego constante (warmup-stable) para los modelos base y la CPT; la etapa de solo embeddings usa 1e-4 tras 100 iteraciones de calentamiento; la fase de annealing usa 100 iteraciones de calentamiento hasta 5e-4 y decaimiento lineal a cero durante 916 iteraciones. Los datos proceden de HPLT 4.0: la fase de preentrenamiento inicial es 80 % inglés y 6,7 % cada uno de danés, alemán y sueco, sin noruego; la fase de CPT usa noruego con un 85 % de bokmål y un 15 % de nynorsk, en el mismo orden que los datos del modelo noruego de referencia. Este checkpoint corresponde a la iteración 9.720 de 48.600 de la CPT.

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål y nynorsk), inglés, danés, alemán y sueco.
- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales sin un ajuste posterior.
- Capacidad de continuación de texto y modelado de lenguaje puro, adecuada para evaluación de perplejidad y para servir de base a fine-tuning.
- Multilingüismo limitado al conjunto de idiomas del preentrenamiento (inglés dominante al 80 %, con cuotas menores de danés, alemán y sueco) más la adaptación al noruego de la CPT.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta ninguna capacidad especial adicional más allá del modelado de lenguaje estándar.

## Casos de uso

- Investigación sobre adaptación lingüística: comparar este checkpoint con los demás de la serie (ml-cpt1 a ml-cpt10 y sus versiones annealed) para medir la curva de aprendizaje en noruego y determinar tras cuántos tokens el modelo adaptado alcanza al entrenado desde cero.
- Evaluación de perplejidad en noruego: usar el modelo para calcular perplejidad sobre corpus de bokmål y nynorsk y analizar la transferencia desde el multilingüe sin noruego.
- Base para fine-tuning supervisado: al ser un modelo base de 2.100 millones de parámetros, sirve como punto de partida para ajustes de instrucciones o de tarea en noruego con recursos moderados.
- Generación de texto en noruego para experimentos de calidad lingüística: continuación de documentos y análisis de fluidez en bokmål y nynorsk, siempre con revisión humana dado que no está alineado.
- Estudio de tokenizadores: analizar el efecto del intercambio de vocabulario BPE noruego sobre el rendimiento, comparando con los checkpoints de la rama danesa (`da-cpt*`) que siguieron el mismo procedimiento.
- Reproducibilidad de experimentos académicos: el modelo forma parte de una matriz de 50 modelos con configuración idéntica, lo que permite aislar variables (idioma de origen, tokenizador, annealing) en estudios comparativos.
- Prototipado de completado de texto en aplicaciones internas de bajo riesgo donde se requiera un modelo pequeño y desplegable en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB para pesos; en 4 bits, alrededor de 1,1 GB, aunque el repositorio no publica pesos cuantizados oficiales.
- GPU recomendadas: NVIDIA A100, H100 o GH200 para entrenamiento y evaluación a gran escala; para inferencia basta una RTX 4090, RTX 3090, L4 o incluso GPUs consumer con 8 GB o más.
- Cabe en GPU consumer: sí, en modelos como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090, siempre que se use bf16 o cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en Hugging Face), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt2 | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 2/10 de CPT sobre noruego, base sin instrucciones |
| BigFamTLLM/ml-base | no disponible en la informacion | 4.096 (misma arquitectura) | en, da, de, sv (sin noruego) | no disponible | Modelo multilingüe de partida, entrenado desde cero |
| BigFamTLLM/no-base | no disponible en la informacion | 4.096 (misma arquitectura) | noruego | no disponible | Referencia entrenada desde cero en noruego |
| BigFamTLLM/da-cpt2 | no disponible en la informacion | 4.096 (misma arquitectura) | da, no, nb, nn | no disponible | Rama danesa con el mismo procedimiento de CPT |

La comparación con modelos externos de tamaño similar (por ejemplo, Qwen3 de 1,7B o 4B, o Gemma 2B) no está disponible en la información proporcionada, y las diferencias de tokenizador, datos y licencia harían la comparación poco significativa sin resultados de benchmarks.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni alineamiento de seguridad: puede generar contenido inapropiado, sesgado o factualmente incorrecto sin filtros.
- Riesgo elevado de alucinación en tareas de conocimiento factual, especialmente fuera de los dominios cubiertos por HPLT 4.0.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística desequilibrada: el inglés domina el preentrenamiento (80 %), y el noruego solo se ha visto durante 5.620 millones de tokens en esta fase, por lo que la calidad en bokmål y nynorsk puede ser inferior a la de modelos entrenados específicamente en noruego.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- Checkpoint intermedio de un experimento académico: no es un modelo final ni ha pasado por la fase de annealing, por lo que su rendimiento puede ser inferior al de las versiones `ml-cpt2-anneal` o `ml-cpt10`.
- Sin datos de benchmarks publicados: no es posible evaluar su calidad objetiva frente a alternativas sin ejecutar evaluaciones propias.
- El repositorio no incluye pesos cuantizados oficiales ni documentación de despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-emb (modelo base)
- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt2
- Checkpoint annealed correspondiente: https://huggingface.co/BigFamTLLM/ml-cpt2-anneal
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Rama danesa equivalente: https://huggingface.co/BigFamTLLM/da-cpt2
- Repositorio del proyecto (BigFamTLLM): https://huggingface.co/BigFamTLLM
- Curso IN5640, Universidad de Oslo: no disponible como enlace directo en la informacion proporcionada
- Paper o blog del experimento: no disponible en la informacion proporcionada
