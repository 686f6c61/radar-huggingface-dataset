# BigFamTLLM/ml-cpt10

## Resumen

ml-cpt10 es el décimo y último checkpoint de la etapa de continual pretraining (CPT) sobre noruego del modelo multilingüe `BigFamTLLM/ml-emb`, desarrollado en el marco del experimento BigFamTLLM del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base de 2.115.305.088 parámetros con arquitectura densa estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atención con 17 cabezas key/value, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE base 10.000 y embeddings atados) y una longitud de contexto de 4.096 tokens.

El modelo responde a una pregunta de investigación concreta: si el preentrenamiento en otros idiomas seguido de una adaptación al noruego supera al entrenamiento desde cero exclusivamente en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al de referencia. Para ello, el punto de partida es un modelo multilingüe entrenado con inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno y sin noruego (HPLT 4.0), al que se le sustituyó el tokenizador por un BPE noruego de 32.000 tokens y se le aplicó una etapa de 1.000 iteraciones entrenando solo los embeddings antes del CPT.

Tras el CPT, ml-cpt10 ha leído 26.004.684.800 tokens noruegos (Bokmål al 85 %, Nynorsk al 15 %, los mismos datos y en el mismo orden que el modelo noruego desde cero), igualando el volumen de exposición al idioma del modelo de referencia. Es relevante ahora porque forma parte de una comparativa controlada de 50 modelos que permite medir empíricamente el punto de *catch-up* de la adaptación cross-lingual frente al entrenamiento monolingüe nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden 2.176, 34 cabezas de atención de 64, 17 cabezas KV, SwiGLU FFN 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Qwen3 con 36 capas, hidden size de 2.176, 34 cabezas de atención de dimensión 64 y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y ausencia de biases. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2) con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencia de 4.096 tokens y batch global de 128 (524.288 tokens por iteración), usando AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y gradient clipping 1,0.

El pipeline tiene tres fases: primero, tres modelos base idénticos salvo por idioma y tokenizador (noruego, danés y multilingüe sin noruego), con 26.000 millones de tokens cada uno; segundo, sustitución del tokenizador por el BPE noruego de 32.000 tokens (el equipo lo denomina `mix_BM7_2_NN8_1`), copiando el embedding cuando el token existe en ambos vocabularios y usando la media de las piezas en caso contrario, seguida de 1.000 iteraciones entrenando solo los embeddings; tercero, CPT sobre los datos del modelo noruego con 10 checkpoints equiespaciados. La tasa de aprendizaje es 5e-4 tras 2.000 iteraciones de warm-up y luego constante (warmup-stable) para los modelos base y el CPT; 1e-4 tras 100 iteraciones de warm-up en la etapa de embeddings; y en el annealing, warm-up de 100 iteraciones hasta 5e-4 con decaimiento lineal posterior.

## Capacidades

- Generación de texto autoregresiva en noruego (Bokmål y Nynorsk) y en los idiomas del modelo multilingüe de origen (inglés, danés, alemán y sueco).
- Modelo base preentrenado: no está ajustado por instrucciones ni alineado en seguridad, por lo que no sigue instrucciones de forma fiable sin un fine-tuning posterior.
- Capacidad de continuación de texto y modelado del lenguaje en contextos de hasta 4.096 tokens.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruction-tuned).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües limitadas a los siete códigos de idioma declarados (en, da, de, sv, no, nb, nn).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre adaptación cross-lingual: ml-cpt10 sirve como punto de comparación frente a `no-base` (noruego desde cero) para medir el *catch-up* en tokens noruegos; se usaría evaluando perplejidad y tareas downstream en cada checkpoint.
- Punto de partida para fine-tuning en noruego: al ser un modelo base de 2,1B parámetros con tokenizador nativo noruego, es adecuado para ajuste supervisado en tareas como clasificación de texto, resumen o generación condicionada.
- Modelado de lenguaje para Bokmål y Nynorsk: útil en corrección ortográfica, detección de errores gramaticales o normalización de texto entre las dos normas escritas del noruego.
- Generación de datos sintéticos en noruego: el modelo puede producir texto de dominio general para aumentar corpus de entrenamiento de modelos mayores, con revisión humana posterior.
- Experimentos de destilación: su tamaño de 2,1B y contexto de 4.096 lo hacen manejable como alumno o profesor en pipelines de destilación sobre datos nórdicos.
- Evaluación de tokenizadores: permite estudiar el efecto del cambio de vocabulario (BPE noruego de 32.000 tokens) frente al tokenizador multilingüe original en métricas de compresión y perplejidad.
- Reproducción académica: sirve para replicar el protocolo del experimento BigFamTLLM (tokenizer swap, embeddings-only, CPT con 10 checkpoints y annealing) en otros pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,2 GB solo para pesos (el tamaño del repo es de 4,2 GB), más overhead de activaciones y caché KV; en la práctica, entre 5 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimación teórica, no se publican ficheros GGUF en el repo).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16; NVIDIA RTX 4090, A100, H100 o GH200 para mayor throughput. El modelo se entrenó en GH200.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) en bf16, y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; llama.cpp, Ollama o vLLM requerirían conversión a GGUF o configuración específica, no publicada en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt10 | 2,1B | 4.096 | en, da, de, sv, no, nb, nn | No disponible | Modelo base, CPT sobre multilingüe sin noruego |
| BigFamTLLM/no-base | 2,1B (misma arquitectura) | 4.096 | noruego (Bokmål y Nynorsk) | No disponible | Referencia entrenada desde cero en noruego, 26,0B tokens |
| BigFamTLLM/da-cpt10 | 2,1B (misma arquitectura) | 4.096 | danés adaptado a noruego | No disponible | Variante del mismo experimento partiendo del modelo danés |
| BigFamTLLM/ml-emb | 2,1B (misma arquitectura) | 4.096 | en, da, de, sv, no, nb, nn | No disponible | Punto de partida de ml-cpt10, solo etapa de embeddings |

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni alineación de seguridad: puede generar contenido inapropiado, sesgado o factualmente incorrecto sin filtros.
- Riesgo de alucinación inherente a un modelo preentrenado de 2,1B parámetros; no debe usarse como fuente de verdad sin verificación.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura idiomática restringida a en, da, de, sv, no, nb y nn; el rendimiento fuera de estos idiomas no está documentado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; es imprescindible contactar con el autor antes de usarlo en producción.
- Entrenado en un entorno académico con 8 GPU GH200 y 26,0B tokens noruegos; el volumen total de cómputo es modesto frente a modelos de producción, lo que limita su calidad en tareas complejas.
- Sin datos publicados de benchmarks, evaluaciones de sesgo ni pruebas de robustez; no hay evidencia empírica de su rendimiento relativo más allá de la comparación interna del experimento.
- El cambio de tokenizador y la etapa de embeddings-only pueden introducir degradaciones en los idiomas originales (en, da, de, sv) que no se cuantifican en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt10
- Modelo base (etapa de embeddings): https://huggingface.co/BigFamTLLM/ml-emb
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Referencia noruega desde cero: https://huggingface.co/BigFamTLLM/no-base
- Referencia noruega con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Variante danesa con CPT: https://huggingface.co/BigFamTLLM/da-cpt10
- Checkpoint con annealing: https://huggingface.co/BigFamTLLM/ml-cpt10-anneal
- Curso IN5640, Universidad de Oslo: no disponible
- Paper o blog del experimento BigFamTLLM: no disponible
