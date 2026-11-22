# BigFamTLLM/ml-base-anneal

## Resumen

ml-base-anneal es un modelo de lenguaje de tipo base (solo preentrenado, sin ajuste por instrucciones ni alineamiento de seguridad) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata de la versión "annealed" de ml-base: un modelo multilingüe entrenado desde cero con un tokenizador propio sobre un corpus sin noruego (inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno) y posteriormente sometido a un annealing breve sobre datos noruegos de alta calidad (bokmål y nynorsk).

El modelo emplea una arquitectura decoder dense de estilo Qwen3 con 36 capas, tamaño oculto de 2.176, 34 cabezas de atención de 64 dimensiones, 17 cabezas clave/valor, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados. Cuenta con 2.184.937.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens.

Su relevancia es fundamentalmente experimental: forma parte de un estudio comparativo de 50 modelos que investiga si el preentrenamiento en otros idiomas seguido de adaptación al noruego supera al entrenamiento desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al modelo nativo. No es un modelo pensado para producción ni para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer dense estilo Qwen3 (36 capas, hidden 2.176, 34 cabezas de atención de 64, 17 cabezas KV, SwiGLU FFN 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.184.937.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder transformer dense con atención multi-cabeza con 17 cabezas clave/valor (GQA), normalización RMSNorm, QK-norm, activación SwiGLU en la FFN y embeddings atados. Usa un tokenizador BPE multilingüe propio de 64.000 tokens (`multilingual_tokenizer1_64k`). El preentrenamiento base se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencia de 4.096, batch global de 128 (524.288 tokens por iteración), AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y clipping de gradiente 1,0.

El modelo original ml-base se preentrenó durante 49.600 iteraciones con datos en inglés (80 %) y danés, alemán y sueco (6,7 % cada uno), sin noruego, sumando 26.000 millones de tokens. Esta versión annealed añade 916 iteraciones sobre datos noruegos de alta calidad (bokmål y nynorsk, 480.247.808 tokens leídos con su propio tokenizador), con un calentamiento de la tasa de aprendizaje hasta 5e-4 durante 100 iteraciones y decaimiento lineal posterior hasta 0. No hay datos disponibles sobre RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, danés, alemán, sueco, noruego (bokmål y nynorsk).
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- Capacidad de continuación de texto y modelado del lenguaje en los idiomas del corpus de preentrenamiento.
- Capacidad multilingüe derivada de un tokenizador BPE propio de 64.000 tokens y de un corpus con cuatro idiomas germánicos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- No se documenta alineamiento de seguridad.

## Casos de uso

- Investigación sobre transferencia entre idiomas: sirve como punto de comparación en experimentos que miden cuántos tokens noruegos necesita un modelo multilingüe preentrenado para igualar a uno entrenado desde cero en noruego.
- Estudio de annealing y currículos de datos: permite analizar el efecto de 916 iteraciones de annealing sobre datos de alta calidad frente a la versión sin annealing (ml-base).
- Evaluación de tokenizadores multilingües: al usar un tokenizador BPE propio de 64.000 tokens, es útil para estudiar la eficiencia de tokenización en lenguas germánicas y nórdicas.
- Base para ajuste fino posterior: al ser un modelo base, puede servir de inicialización para tareas de clasificación, etiquetado o generación controlada en noruego, danés, sueco o alemán.
- Reproducción académica: el experimento documenta la arquitectura, los hiperparámetros y los checkpoints, lo que facilita reproducir el pipeline de preentrenamiento y annealing en entornos de investigación con GPU GH200.
- Análisis de sesgos y calidad lingüística en modelos pequeños: con 2.184 millones de parámetros y contexto de 4.096 tokens, es manejable para estudiar el comportamiento de modelos de escala reducida en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,4 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB (las cuantizaciones no están documentadas por el autor).
- GPU recomendadas: el entrenamiento se realizó con 8 GPU NVIDIA GH200; para inferencia basta una GPU consumer moderna con al menos 8 GB de VRAM.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 o RTX 4090 en bf16; en cuantización de 4 u 8 bits cabría en GPUs con 4-6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`); no se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ml-base-anneal (BigFamTLLM) | 2.184.937.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Modelo base experimental con annealing noruego |
| ml-base (BigFamTLLM) | 2.184.937.088 | 4.096 | en, da, de, sv | no disponible | Mismo modelo sin annealing sobre noruego |
| no-base-anneal (BigFamTLLM) | no disponible | 4.096 | no, nb, nn (y otros del experimento) | no disponible | Referencia entrenada desde cero en noruego con annealing |
| da-base-anneal (BigFamTLLM) | no disponible | 4.096 | da (y otros del experimento) | no disponible | Referencia entrenada desde cero en danés con annealing |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con estos u otros modelos.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado en seguridad, por lo que no debe usarse como asistente conversacional sin un ajuste posterior.
- Riesgo elevado de alucinación y de generar contenido incoherente o sesgado, propio de un modelo preentrenado de 2.184 millones de parámetros.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Cobertura lingüística limitada al inglés, danés, alemán, sueco y noruego; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- El modelo se ha entrenado con datos de HPLT 4.0 y datos noruegos de alta calidad no detallados, con los sesgos que ello implica.
- El autor no documenta cuantizaciones oficiales ni resultados de evaluación, lo que dificulta validar su calidad antes de usarlo.
- El tamaño del repositorio (4,4 GB) y los pesos en safetensors implican que la inferencia en bf16 requiere al menos 6-8 GB de VRAM en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/ml-base
- Referencia noruega desde cero: https://huggingface.co/BigFamTLLM/no-base
- Referencia noruega con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Referencia danesa desde cero: https://huggingface.co/BigFamTLLM/da-base
- Referencia danesa con annealing: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo danés con tokenizador noruego (solo embeddings): https://huggingface.co/BigFamTLLM/da-emb
- Modelo multilingüe con tokenizador noruego (solo embeddings): https://huggingface.co/BigFamTLLM/ml-emb
- Checkpoints de CPT danés (1-10): https://huggingface.co/BigFamTLLM/da-cpt1 · https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoints de CPT multilingüe (1-10): https://huggingface.co/BigFamTLLM/ml-cpt1 · https://huggingface.co/BigFamTLLM/ml-cpt10
