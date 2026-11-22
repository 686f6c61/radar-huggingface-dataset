# BigFamTLLM/ml-cpt1

## Resumen

ml-cpt1 es un modelo de lenguaje base (solo preentrenamiento, sin ajuste por instrucciones ni alineación de seguridad) de 2.115.305.088 parámetros desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Es el primer checkpoint de la fase de preentrenamiento continuado (CPT) sobre noruego de un modelo multilingüe que previamente pasó por un cambio de tokenizador y una etapa de entrenamiento exclusivo de embeddings. La pregunta de investigación del experimento es si preentrenar en otros idiomas y adaptar después al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al de referencia.

Arquitectónicamente es un decoder denso de estilo Qwen3 con 36 capas, tamaño oculto de 2.176, 34 cabezas de atención de 64 dimensiones, 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados. El contexto es de 4.096 tokens y el modelo se distribuye en formato safetensors bajo la librería transformers.

Su relevancia es fundamentalmente metodológica y académica: forma parte de una matriz de 50 modelos que compara tres bases (noruego, danés y multilingüe sin noruego) con tokenizadores homogeneizados, y este checkpoint concreto corresponde a la iteración CPT 4.860 de 48.600, tras haber leído 3.072.327.680 tokens noruegos. No es un modelo listo para producción conversacional: es una pieza de un estudio controlado sobre transferencia entre idiomas y eficiencia de tokenizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden 2.176, 34 cabezas de atención, 17 KV heads, SwiGLU 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Qwen3 con 36 capas, dimensión oculta de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (atención con query grouping), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y ausencia de biases. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2) con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencia de 4.096, batch global de 128 (524.288 tokens por iteración), AdamW (β 0.9, 0.95, ε 1e-8), weight decay 0.1 y gradient clipping 1.0. La tasa de aprendizaje fue 5e-4 tras 2.000 iteraciones de warm-up y después constante (warmup-stable) para los modelos base y la CPT.

Los datos proceden de HPLT 4.0 (web) tokenizados por el equipo. La base multilingüe se preentrenó con inglés al 80 %, danés, alemán y sueco al 6,7 % cada uno y sin noruego, con 26.000 millones de tokens en total. Después del cambio a tokenizador noruego BPE de 32.000 tokens (mezcla `mix_BM7_2_NN8_1`, Bokmål y Nynorsk), se entrenaron solo los embeddings durante 1.000 iteraciones con tasa 1e-4 y 100 iteraciones de warm-up; en la copia de embeddings, un token se copia si existe en ambos vocabularios y, si no, se inicializa con la media de las piezas en que el tokenizador antiguo lo divide. La fase CPT usa los datos del modelo noruego en el mismo orden: Bokmål al 85 % y Nynorsk al 15 %. Este checkpoint ha leído 3.072.327.680 tokens noruegos (iteración 4.860 de 48.600). La etapa de annealing, separada en los checkpoints `-anneal`, usa un warm-up de 100 iteraciones hasta 5e-4 y decaimiento lineal a cero durante 916 iteraciones sobre datos noruegos de alta calidad.

## Capacidades

- Generación de texto en noruego (Bokmål y Nynorsk), inglés, danés, alemán y sueco, con tokenizador BPE noruego de 32.000 tokens.
- Modelo base: no está ajustado por instrucciones ni alineado en seguridad, por lo que no sigue instrucciones de forma fiable ni rechaza peticiones dañinas.
- Capacidad de modelado de lenguaje para continuación de texto, perplejidad y evaluación intrínseca.
- Soporte de tool calling / function calling: no disponible (no es un modelo instruido).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües limitadas a los idiomas del preentrenamiento (en, da, de, sv, no, nb, nn).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transferencia entre idiomas: comparar este checkpoint con `da-cpt1` y `no-base` para medir cuántos tokens noruegos necesita un modelo multilingüe adaptado para igualar a uno entrenado desde cero, usando la matriz de checkpoints publicada.
- Evaluación de tokenizadores: analizar el efecto de sustituir un tokenizador multilingüe por uno noruego de 32.000 tokens sobre la fertilidad y la perplejidad en Bokmål y Nynorsk.
- Punto de partida para ajuste supervisado: al ser un modelo base de 2.115 millones de parámetros, puede servir como inicialización para SFT o DPO en noruego en entornos académicos con recursos limitados.
- Experimentos de annealing: comparar `ml-cpt1` con `ml-cpt1-anneal` para cuantificar la ganancia de una fase corta de decaimiento sobre datos de alta calidad.
- Estudio de olvido catastrófico: medir la degradación en inglés, danés, alemán y sueco tras la CPT en noruego, dado que la base multilingüe se entrenó con un 80 % de inglés.
- Docencia y reproducibilidad: replicar el pipeline de Megatron-LM (core 0.17.1) con 8 GH200 y bf16 documentado en la model card como ejercicio de curso.
- Generación de texto no interactiva en noruego: continuación de documentos o datos sintéticos en un contexto controlado, aceptando que al no estar instruido requiere prompting de few-shot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,2 GB solo para pesos (el repositorio ocupa 4,2 GB), más caché KV y activaciones; con contexto completo de 4.096 tokens el consumo adicional es moderado por las 17 KV heads y las 36 capas.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no se documentan cuantizaciones oficiales).
- GPU recomendadas: NVIDIA A100, H100 o GH200 para entrenamiento y evaluación a gran escala; para inferencia basta una GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090).
- Cabe en GPU consumer: sí, con cuantización o incluso en bf16 en tarjetas de 8-12 GB para contextos moderados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están documentados oficialmente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt1 | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint 1/10 de CPT sobre base multilingüe; solo preentrenamiento |
| BigFamTLLM/ml-emb | 2.115.305.088 (misma arquitectura) | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Etapa previa: solo embeddings entrenados tras el cambio de tokenizador |
| BigFamTLLM/da-cpt1 | 2.115.305.088 (misma arquitectura) | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Rama danesa del mismo experimento, mismo checkpoint |
| BigFamTLLM/no-base | 2.115.305.088 (misma arquitectura) | 4.096 | noruego (Bokmål y Nynorsk) | no disponible | Referencia entrenada desde cero en noruego |

La comparación con modelos de código abierto de tamaño similar (por ejemplo, la familia Qwen3 pequeña) no está disponible en la información proporcionada; las alternativas listadas pertenecen al mismo experimento y comparten arquitectura y presupuesto de cómputo.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni alineación de seguridad: puede generar contenido dañino, sesgado o factualmente incorrecto sin filtros.
- Riesgo de alucinación alto en uso generativo, especialmente fuera de los dominios de los datos de preentrenamiento (HPLT 4.0, web).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Es un checkpoint intermedio (iteración 4.860 de 48.600): su rendimiento en noruego es inferior al de los checkpoints posteriores y al del modelo de referencia `no-base`.
- Licencia no disponible: no puede asumirse uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- Posible olvido catastrófico de los idiomas originales (inglés, danés, alemán, sueco) tras la CPT en noruego, no cuantificado en la información disponible.
- Sesgos derivados de los datos web de HPLT 4.0, sin documentación de mitigación.
- Sin datos publicados de benchmarks, por lo que no es posible comparar su calidad de forma objetiva con otros modelos.

## Enlaces

- [Hugging Face: BigFamTLLM/ml-cpt1](https://huggingface.co/BigFamTLLM/ml-cpt1)
- [Modelo base: BigFamTLLM/ml-emb](https://huggingface.co/BigFamTLLM/ml-emb)
- [Modelo multilingüe de partida: BigFamTLLM/ml-base](https://huggingface.co/BigFamTLLM/ml-base)
- [Modelo de referencia noruego: BigFamTLLM/no-base](https://huggingface.co/BigFamTLLM/no-base)
- [Checkpoint annealed: BigFamTLLM/ml-cpt1-anneal](https://huggingface.co/BigFamTLLM/ml-cpt1-anneal)
- [Checkpoint 2 de la CPT multilingüe: BigFamTLLM/ml-cpt2](https://huggingface.co/BigFamTLLM/ml-cpt2)
- [Rama danesa equivalente: BigFamTLLM/da-cpt1](https://huggingface.co/BigFamTLLM/da-cpt1)
- [Curso IN5640, Universidad de Oslo](https://www.uio.no/studier/emner/matnat/ifi/IN5640/)
