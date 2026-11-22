# BigFamTLLM/ml-cpt5

## Resumen

ml-cpt5 es un checkpoint intermedio (5 de 10) del experimento BigFamTLLM, desarrollado en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo durante el otoño de 2026. Se trata de un modelo base de tipo decoder dense con arquitectura estilo Qwen3, 2.115.305.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens. No está instruido ni alineado en seguridad: es un modelo exclusivamente preentrenado.

El modelo parte de `ml-emb` (un modelo multilingüe sin noruego al que se le sustituyó el tokenizador por uno BPE noruego de 32.000 tokens y se le entrenaron solo los embeddings durante 1.000 iteraciones) y aplica sobre él un preentrenamiento continuado (CPT) con datos noruegos. En este checkpoint 5 el modelo ha leído 13.264.486.400 tokens noruegos, lo que corresponde a la iteración 24.300 de 48.600 del proceso de CPT. El objetivo del experimento es responder si adaptar un modelo multilingüe a noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos se produce el alcance.

La relevancia de esta ficha es fundamentalmente metodológica: ml-cpt5 es una pieza de un estudio controlado de 50 modelos que compara tres bases (noruego, danés y multilingüe sin noruego) con arquitectura y presupuesto idénticos (26.000 millones de tokens cada una), evaluando cada checkpoint tanto en su estado natural como tras un annealing sobre datos noruegos de alta calidad. No es un modelo pensado para producción, sino una evidencia empírica sobre transferencia lingüística y eficiencia de tokenizadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder dense estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atención de 64, 17 cabezas key/value, SwiGLU FFN 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin sesgos) |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | BPE noruego de 32.000 tokens (mezcla Bokmål/Nynorsk `mix_BM7_2_NN8_1`) |
| Modelo base | BigFamTLLM/ml-emb (finetune) |
| Tokens noruegos leídos | 13.264.486.400 |
| Etapa del CPT | checkpoint 5 de 10 (iteración 24.300 de 48.600) |
| Tipo de modelo | base (solo preentrenado, sin instruction tuning ni safety tuning) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer dense de estilo Qwen3 con 36 capas, dimensión oculta de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y ausencia de sesgos. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2) con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencia de 4.096 tokens, batch global de 128 (524.288 tokens por iteración) y AdamW con β 0.9/0.95, ε 1e-8, weight decay 0.1 y gradient clipping 1.0.

El pipeline del experimento tiene cuatro fases: (1) tres modelos base idénticos salvo por idioma y tokenizador (noruego, danés y multilingüe sin noruego), cada uno con 26.000 millones de tokens; (2) sustitución del tokenizador por el noruego en los modelos danés y multilingüe, copiando embeddings cuando el token existe en ambos vocabularios y usando la media de las piezas en caso contrario, seguido de 1.000 iteraciones entrenando solo los embeddings; (3) CPT sobre los datos del modelo noruego con 10 checkpoints equiespaciados; (4) evaluación de cada checkpoint tal cual y tras un annealing sobre datos noruegos de alta calidad. Los datos de preentrenamiento son HPLT 4.0 (inglés 80 %, danés, alemán y sueco 6,7 % cada uno, sin noruego) y después datos noruegos (Bokmål 85 %, Nynorsk 15 %). El learning rate en CPT es 5e-4 tras 2.000 iteraciones de warm-up y luego constante; el annealing usa warm-up de 100 iteraciones a 5e-4 y decaimiento lineal a cero en 916 iteraciones.

## Capacidades

- Generación de texto autoregresiva en inglés, danés, alemán, sueco, noruego (Bokmål y Nynorsk).
- Modelo base sin instrucciones: no sigue instrucciones ni formatos conversacionales de forma fiable.
- Capacidad de continuación de texto y modelado de lenguaje puro.
- Soporte de tool calling / function calling: no disponible (modelo base sin entrenamiento específico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a los idiomas del preentrenamiento, con especialización parcial en noruego tras el CPT.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Tokenizador específico para noruego que mejora la eficiencia de codificación de Bokmål y Nynorsk frente a tokenizadores multilingües genéricos.

## Casos de uso

- Investigación sobre transferencia lingüística: el modelo sirve como punto de medida en el estudio de si el CPT desde un modelo multilingüe alcanza a un modelo entrenado desde cero en noruego, comparando checkpoints intermedios con la referencia `no-base`.
- Evaluación de eficiencia de tokenizadores: permite medir cuántos tokens noruegos adicionales requiere un modelo multilingüe para igualar a uno nativo, usando el tokenizador BPE de 32.000 tokens frente al original.
- Punto de partida para fine-tuning posterior: al ser un modelo base de 2.100 millones de parámetros y contexto de 4.096 tokens, puede servir de inicialización para tareas downstream en noruego (clasificación, extracción, generación controlada) mediante fine-tuning supervisado.
- Estudio de annealing: la variante `ml-cpt5-anneal` permite analizar cuánto mejora un checkpoint intermedio tras un annealing corto sobre datos de alta calidad, un patrón habitual en la construcción de modelos finales.
- Reproducibilidad académica: con hiperparámetros, datos y arquitectura documentados, el checkpoint es útil para replicar experimentos de CPT en entornos con recursos limitados (8 GPU GH200).
- Análisis de olvido catastrófico: al haber sido preentrenado primero en inglés, danés, alemán y sueco y luego adaptado a noruego, permite estudiar la degradación de capacidades en los idiomas originales a lo largo de los 10 checkpoints.
- Docencia y formación: material de referencia para cursos sobre entrenamiento de LLM, con una cadena completa de etapas (tokenizer swap, embeddings-only, CPT, annealing) documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 2.115 millones de parámetros ocupan aproximadamente 4,2 GB de pesos; con overhead de activaciones y caché KV para 4.096 tokens, se estiman entre 5 y 7 GB en bf16.
- En cuantización de 8 bits, aproximadamente 2,1 GB de pesos; en 4 bits, aproximadamente 1,1 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16; NVIDIA RTX 4090, RTX 3090, A100, H100 o GH200 son suficientes. El entrenamiento se realizó en 8 GH200.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, 3070, 4060 Ti, 4070, 4080, 4090) en bf16 o cuantizado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags del repositorio; vLLM, llama.cpp u Ollama no están documentados por el autor para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt5 | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Hugging Face |
| BigFamTLLM/ml-base | no disponible (misma arquitectura y 26.000 M tokens) | 4.096 | en, da, de, sv (sin noruego) | no disponible | Hugging Face |
| BigFamTLLM/no-base | no disponible (misma arquitectura y 26.000 M tokens) | 4.096 | no, nb, nn | no disponible | Hugging Face |
| BigFamTLLM/da-base | no disponible (misma arquitectura y 26.000 M tokens) | 4.096 | da | no disponible | Hugging Face |

La comparación relevante no es con modelos comerciales, sino con los otros brazos del mismo experimento controlado: `ml-base` (multilingüe sin noruego, antes del cambio de tokenizador), `no-base` (noruego desde cero, referencia) y `da-base` (danés desde cero). Todos comparten arquitectura, presupuesto de tokens y datos de preentrenamiento salvo el idioma, lo que permite aislar el efecto del CPT. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni safety tuning: no debe usarse directamente en producción como asistente conversacional.
- Riesgo elevado de alucinación y de generar contenido inapropiado, dado que no ha pasado por RLHF, DPO ni filtros de seguridad.
- Sesgos potenciales heredados de HPLT 4.0 (datos web) y de los datos noruegos de Bokmål y Nynorsk, con posible infrarrepresentación de variedades dialectales.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Es un checkpoint intermedio (5 de 10): su rendimiento en noruego es previsiblemente inferior al del checkpoint final `ml-cpt10` y al de la referencia `no-base`.
- El cambio de tokenizador puede degradar el rendimiento en inglés, danés, alemán y sueco respecto a `ml-base`, ya que el vocabulario noruego no cubre óptimamente esos idiomas.
- Sin datos publicados de benchmarks, no es posible cuantificar su calidad real frente a alternativas.
- Los tags del repositorio indican 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt5
- Modelo base: https://huggingface.co/BigFamTLLM/ml-emb
- Variante con annealing: https://huggingface.co/BigFamTLLM/ml-cpt5-anneal
- Referencia noruega desde cero: https://huggingface.co/BigFamTLLM/no-base
- Referencia noruega con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés desde cero: https://huggingface.co/BigFamTLLM/da-base
- Modelo multilingüe sin noruego: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoint anterior (4): https://huggingface.co/BigFamTLLM/ml-cpt4
- Checkpoint siguiente (6): https://huggingface.co/BigFamTLLM/ml-cpt6
- Checkpoint final (10): https://huggingface.co/BigFamTLLM/ml-cpt10
- Repositorio Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Dataset HPLT 4.0: https://hplt-project.org/
- Curso IN5640, Universidad de Oslo: https://www.uio.no/studier/emner/matnat/ifi/IN5640/
