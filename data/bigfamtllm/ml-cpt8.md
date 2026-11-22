# BigFamTLLM/ml-cpt8

## Resumen

ml-cpt8 es el octavo checkpoint de la fase de preentrenamiento continuado (continual pretraining, CPT) sobre noruego del modelo multilingue `ml-emb`, desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otono de 2026). Es un modelo base de tipo decoder-only con arquitectura estilo Qwen3, 2.115.305.088 parametros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens. No esta ajustado para instrucciones ni alineado en seguridad: es exclusivamente un modelo preentrenado.

El modelo forma parte de un experimento controlado de 50 modelos que investiga una pregunta concreta: si preentrenar en otros idiomas y adaptar despues al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuantos tokens noruegos los modelos adaptados alcanzan al modelo nativo. Para ello se parte de tres modelos base identicos salvo en idioma y tokenizador (noruego, danes y multilingue sin noruego), se les sustituye el tokenizador por uno noruego BPE de 32.000 tokens, se entrena solo la capa de embeddings durante 1.000 iteraciones y despues se aplica CPT sobre los datos del modelo noruego, con 10 checkpoints equiespaciados.

Este checkpoint 8 corresponde a la iteracion 38.880 de 48.600 del CPT, es decir, el modelo ha leido 20.908.605.440 tokens noruegos. Es relevante ahora como material de investigacion reproducible sobre transferencia entre idiomas, coste de adaptacion de tokenizador y dinamica de la CPT, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atencion de 64, 17 cabezas key/value, FFN SwiGLU 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estandar) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder denso de estilo Qwen3 con 36 capas, dimension oculta de 2.176, 34 cabezas de atencion de 64 dimensiones y 17 cabezas key/value (GQA con factor 2), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y ausencia de biases. El entrenamiento se realizo con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecucion en bf16, secuencia de 4.096 tokens, batch global de 128 (524.288 tokens por iteracion), AdamW (beta 0,9 y 0,95, epsilon 1e-8), weight decay 0,1 y gradient clipping 1,0.

Los datos de preentrenamiento original del modelo multilingue son un 80 % ingles, un 6,7 % cada uno de danes, aleman y sueco, y ningun dato de noruego (HPLT 4.0). La fase de CPT usa datos noruegos en la misma proporcion y orden que el modelo noruego de referencia: 85 % Bokmal y 15 % Nynorsk. El tokenizador es un BPE noruego de 32.000 tokens (mezcla `mix_BM7_2_NN8_1`). La sustitucion de tokenizador copia el embedding cuando el token existe en ambos vocabularios y, en caso contrario, usa la media de las piezas en que el tokenizador antiguo lo divide; despues se entrena solo la capa de embeddings durante 1.000 iteraciones con learning rate 1e-4 y 100 iteraciones de warm-up. El CPT usa learning rate 5e-4 tras 2.000 iteraciones de warm-up y despues constante (warmup-stable). Existe una variante con annealing (`ml-cpt8-anneal`) que aplica 100 iteraciones de warm-up hasta 5e-4 y despues decaimiento lineal a cero en 916 iteraciones sobre datos noruegos de alta calidad.

## Capacidades

- Generacion de texto autoregresiva en modelo base: completa secuencias, no sigue instrucciones.
- Modelado de lenguaje multilingue en ingles, danes, aleman, sueco y noruego (Bokmal y Nynorsk), con especializacion creciente en noruego por la fase de CPT.
- Capacidad de continuacion de texto en noruego tras 20.900 millones de tokens de CPT, orientada a evaluaciones de perplejidad y tareas de comprension en ese idioma.
- No dispone de tool calling ni function calling: no ha recibido ajuste para ello.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- Soporte de inferencia via `transformers`, `text-generation-inference` y endpoints compatibles (tags del repositorio).

## Casos de uso

- Investigacion sobre transferencia entre idiomas: comparar la perplejidad en noruego de este checkpoint con la de `no-base` y `da-cpt8` para medir si la adaptacion desde un modelo multilingue alcanza al entrenamiento nativo y en que punto de la CPT se produce el cruce.
- Evaluacion de estrategias de sustitucion de tokenizador: analizar el impacto de la inicializacion de embeddings por media de piezas frente a otras alternativas, usando los checkpoints 1 a 10 como curva de aprendizaje.
- Generacion de texto noruego como modelo base: continuacion de documentos, articulos o corpus en Bokmal y Nynorsk para experimentos de data augmentation o sintesis de datos de preentrenamiento.
- Punto de partida para ajuste supervisado (SFT) en noruego: al ser un modelo base de 2.100 millones de parametros y contexto de 4.096 tokens, es un candidato manejable para fine-tuning en una sola GPU de 80 GB o con tecnicas de parametros eficientes.
- Estudio de mezcla de datos en CPT: comparar el efecto de la proporcion 85/15 Bokmal/Nynorsk en la calidad final por variedad linguistica.
- Reproduccion academica del experimento IN5640: servir como referencia intermedia para validar pipelines de Megatron-LM, tokenizacion HPLT 4.0 y evaluacion con annealing.
- Analisis de olvido catastrofico: medir la degradacion en ingles, danes, aleman y sueco tras el CPT noruego comparando con `ml-emb`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,2 GB de pesos (el repositorio ocupa 4,2 GB), mas cache KV; con contexto completo de 4.096 tokens y GQA (17 cabezas KV) el overhead es moderado, del orden de unos cientos de MB adicionales.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,2 GB; en 4 bits, en torno a 1,2 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, GH200 para entrenamiento o inferencia de alto throughput; suficiente una RTX 4090 (24 GB) o incluso GPUs consumer de 8-12 GB con cuantizacion.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 4070 y superiores; en 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers`, `text-generation-inference` (tag del repositorio), vLLM, llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BigFamTLLM/ml-cpt8 | 2.115.305.088 | 4.096 | no disponible | Checkpoint 8/10 de CPT noruego desde `ml-emb` |
| BigFamTLLM/ml-cpt8-anneal | 2.115.305.088 | 4.096 | no disponible | Mismo checkpoint tras annealing en noruego de alta calidad |
| BigFamTLLM/da-cpt8 | no disponible | 4.096 | no disponible | Checkpoint equivalente partiendo del modelo danes |
| BigFamTLLM/no-base | no disponible | 4.096 | no disponible | Modelo noruego entrenado desde cero, referencia del experimento |
| BigFamTLLM/ml-base | no disponible | 4.096 | no disponible | Modelo multilingue original sin noruego, antes del cambio de tokenizador |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni alineamiento de seguridad: no debe usarse directamente en aplicaciones de cara al usuario sin SFT y filtros adicionales.
- Riesgo elevado de alucinacion y de generar contenido sesgado o inapropiado, propio de un modelo preentrenado sobre datos web (HPLT 4.0).
- Licencia no disponible: no se puede confirmar el permiso para uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Es un checkpoint intermedio (iteracion 38.880 de 48.600): no representa el estado final del CPT y su calidad en noruego es inferior a la de `ml-cpt10`.
- El modelo no ha sido evaluado con benchmarks publicos en la informacion disponible, por lo que no hay garantias cuantitativas de rendimiento.
- El sesgo linguistico esta dominado por el ingles (80 % de los datos originales); el noruego se ha incorporado solo en la fase de CPT, lo que puede producir un equilibrio linguistico irregular.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt8
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Variante con annealing: https://huggingface.co/BigFamTLLM/ml-cpt8-anneal
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingue original: https://huggingface.co/BigFamTLLM/ml-base
- Modelo danes de referencia: https://huggingface.co/BigFamTLLM/da-base
- Checkpoint equivalente danes: https://huggingface.co/BigFamTLLM/da-cpt8
- Checkpoint 10 multilingue: https://huggingface.co/BigFamTLLM/ml-cpt10
