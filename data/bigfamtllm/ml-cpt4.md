# BigFamTLLM/ml-cpt4

## Resumen

ml-cpt4 es un modelo de lenguaje base de 2.115.305.088 parámetros (2.045.673.088 sin la matriz de embeddings atada) desarrollado por BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Es el cuarto de diez checkpoints de la fase de preentrenamiento continuado (CPT) sobre noruego del modelo multilingüe `ml-emb`, que a su vez deriva de un modelo multilingüe preentrenado sin noruego. Se trata de un modelo denso de tipo decoder, con arquitectura al estilo Qwen3 de 36 capas, tamaño oculto 2.176, 34 cabezas de atención de 64 dimensiones, 17 cabezas clave/valor, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados sin sesgos.

El modelo forma parte de un experimento controlado de 50 modelos que investiga si el preentrenamiento en otros idiomas seguido de una adaptación al noruego supera al entrenamiento desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al modelo nativo. Todos los modelos base comparten arquitectura y tokenizador (salvo el cambio de tokenizador), y cada uno ha leído 26.000 millones de tokens.

Este checkpoint 4 de 10 ha leído 10.716.446.720 tokens noruegos (iteración 19.440 de 48.600 de la fase CPT). Es un modelo exclusivamente preentrenado: no está ajustado a instrucciones ni alineado en seguridad, por lo que su uso previsto es la investigación sobre dinámica de adaptación lingüística y como base para ajuste posterior, no como asistente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-style dense decoder (transformer decoder-only denso) |
| Parámetros totales | 2.115.305.088 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas | 36 |
| Tamaño oculto | 2.176 |
| Cabezas de atención | 34 (64 dimensiones por cabeza) |
| Cabezas clave/valor | 17 (GQA) |
| FFN | SwiGLU, dimensión 6.528 |
| Normalización | RMSNorm con QK-norm |
| RoPE | base 10.000 |
| Embeddings | atados, sin sesgos |
| Tokenizador | BPE noruego, 32.000 tokens (`mix_BM7_2_NN8_1`) |
| Tokens noruegos leídos | 10.716.446.720 |
| Modelo base | BigFamTLLM/ml-emb |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Qwen3 con 36 capas, hidden size 2.176, 34 cabezas de atención de 64 dimensiones con 17 cabezas clave/valor (GQA), FFN SwiGLU de 6.528, RMSNorm con QK-norm, RoPE con base 10.000, embeddings atados y ausencia de sesgos. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2) con 8 GPUs NVIDIA GH200 por ejecución en bf16, secuencia de 4.096 tokens, batch global de 128 (524.288 tokens por iteración), AdamW (β 0.9/0.95, ε 1e-8), weight decay 0.1 y gradient clipping 1.0.

Los datos proceden de HPLT 4.0 (datos web) tokenizados por el equipo. La fase de preentrenamiento base usó inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno, y ningún dato de noruego. Sobre esa base, el modelo `ml-emb` recibió un cambio de tokenizador al BPE noruego de 32.000 tokens (cada embedding se copia si el token existe en ambos vocabularios o se inicializa como la media de las piezas en que el tokenizador antiguo lo divide) y una fase de 1.000 iteraciones entrenando solo los embeddings con learning rate 1e-4 tras 100 iteraciones de warm-up. Después comienza la fase de CPT sobre datos noruegos (Bokmål 85 %, Nynorsk 15 %, en el mismo orden que el modelo noruego de referencia), con learning rate 5e-4 tras 2.000 iteraciones de warm-up y programación warmup-stable. Este checkpoint corresponde a la iteración 19.440 de 48.600 de esa fase.

## Capacidades

- Generación de texto autoregresiva en inglés, danés, alemán, sueco y noruego (Bokmål y Nynorsk).
- Modelado de lenguaje base: continuación de texto, predicción de siguiente token y puntuación de secuencias.
- Capacidad multilingüe parcial, heredada del preentrenamiento multilingüe y del CPT noruego.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste a instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Modo thinking, visión o audio: no disponible.
- Ajuste a instrucciones o diálogo: no disponible; es un modelo exclusivamente preentrenado.

## Casos de uso

- Investigación sobre adaptación lingüística: el checkpoint 4 permite medir la curva de aprendizaje del noruego a lo largo del CPT (10.716 millones de tokens leídos) y compararla con el modelo noruego entrenado desde cero y con los checkpoints 1-3 y 5-10 del mismo experimento.
- Punto de partida para ajuste supervisado (SFT) en noruego: al haber leído ya más de 10.000 millones de tokens noruegos, sirve como base para fine-tuning en tareas concretas de comprensión y generación en Bokmål y Nynorsk.
- Evaluación de tokenizadores: permite estudiar el efecto del cambio de tokenizador (BPE noruego de 32.000 tokens) frente al original, comparando este checkpoint con su equivalente `da-cpt4` en la matriz experimental.
- Generación de texto en noruego en pipelines de investigación: con 4.096 tokens de contexto puede emplearse para continuación de documentos, aumento de datos o generación de corpus sintéticos en Bokmål y Nynorsk.
- Estudios de transferencia entre lenguas germánicas: al haber sido preentrenado en inglés, danés, alemán y sueco, permite analizar la transferencia positiva y negativa hacia el noruego en un entorno controlado.
- Reproducibilidad de experimentos de CPT: el modelo, junto con sus checkpoints hermanos y sus variantes con annealing (`ml-cpt4-anneal`), permite replicar el protocolo completo de preentrenamiento continuado descrito en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,2 GB solo para pesos (2.115 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, en torno a 5-6 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits: alrededor de 1,1 GB de pesos (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; NVIDIA RTX 4090, RTX 3090, A100, H100 o GH200 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: compatible con transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repo. No se documentan variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt4 | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 4/10 de CPT noruego; modelo base |
| BigFamTLLM/no-base | no disponible en esta ficha | 4.096 (según protocolo del experimento) | no, nb, nn | no disponible | Referencia entrenada desde cero en noruego, 26.000 millones de tokens |
| BigFamTLLM/ml-base | no disponible en esta ficha | 4.096 (según protocolo del experimento) | en, da, de, sv | no disponible | Multilingüe sin noruego, entrenado desde cero |
| BigFamTLLM/da-cpt4 | no disponible en esta ficha | 4.096 (según protocolo del experimento) | da, no, nb, nn | no disponible | Equivalente danés del mismo checkpoint de CPT |

## Limitaciones y advertencias

- Modelo exclusivamente preentrenado: no está ajustado a instrucciones ni alineado en seguridad, por lo que puede generar contenido inapropiado, repetitivo o incoherente en usos conversacionales.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas al no haber pasado por RLHF ni por ajuste supervisado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Es un checkpoint intermedio (4 de 10) de la fase de CPT: su dominio del noruego es inferior al de los checkpoints posteriores y al del modelo noruego de referencia.
- Idiomas soportados limitados a en, da, de, sv, no, nb y nn; no se documenta cobertura de otras lenguas.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre HPLT 4.0 (datos web), es previsible que herede sesgos de ese corpus.
- El modelo se ha entrenado en un entorno académico con 8 GH200 por ejecución; no hay garantías de soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt4
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Variante con annealing: https://huggingface.co/BigFamTLLM/ml-cpt4-anneal
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe sin noruego: https://huggingface.co/BigFamTLLM/ml-base
- Equivalente danés del checkpoint: https://huggingface.co/BigFamTLLM/da-cpt4
- Checkpoint anterior: https://huggingface.co/BigFamTLLM/ml-cpt3
- Checkpoint posterior: https://huggingface.co/BigFamTLLM/ml-cpt5
