# BigFamTLLM/no-base-anneal

## Resumen

`no-base-anneal` es la version "annealed" de `no-base`, un modelo de lenguaje base de 2.115 millones de parametros (2.045 millones sin la matriz de embeddings atada) entrenado desde cero en noruego por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otono de 2026). Forma parte de un experimento controlado de 50 modelos que investiga si el preentrenamiento en otros idiomas seguido de adaptacion al noruego supera al entrenamiento desde cero con los mismos recursos, y tras cuantos tokens noruegos los modelos adaptados alcanzan al de referencia.

Arquitectonicamente es un decoder denso de estilo Qwen3: 36 capas, hidden size 2.176, 34 cabezas de atencion de 64 dimensiones, 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000 y embeddings atados. El modelo parte de `no-base` y recibe 916 iteraciones adicionales de annealing sobre datos noruegos de alta calidad (480.247.808 tokens, Bokmal y Nynorsk) con un calentamiento de learning rate hasta 5e-4 durante 100 iteraciones y decaimiento lineal posterior hasta 0. En total, el modelo ha leido 26.484.932.608 tokens noruegos.

Es relevante como referencia metodologica: se trata de un modelo base puro (sin instruction tuning ni alineamiento de seguridad), con tokenizador BPE noruego propio de 32.000 tokens, disenado para servir de linea base en un estudio empirico sobre transferencia entre lenguas y adaptacion de vocabulario. No esta pensado para uso en produccion, sino como artefacto de investigacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-style dense decoder transformer |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | noruego (no, nb, nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder denso de estilo Qwen3 con 36 capas, hidden size de 2.176, 34 cabezas de atencion de 64 dimensiones y 17 cabezas key/value (GQA con ratio 2:1), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y sin sesgos en las capas lineales. El tokenizador es un BPE noruego de 32.000 tokens entrenado especificamente para Bokmal y Nynorsk (identificado internamente como `mix_BM7_2_NN8_1`), lo que evita la fragmentacion tipica de tokenizadores multilingues sobre texto noruego.

El entrenamiento se realizo con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPUs NVIDIA GH200 por ejecucion en bf16. La secuencia es de 4.096 tokens, el batch global de 128 (524.288 tokens por iteracion), optimizador AdamW (beta 0.9 y 0.95, epsilon 1e-8), weight decay 0.1 y gradient clipping 1.0. El modelo base se preentreno durante 49.600 iteraciones sobre datos noruegos (Bokmal 85 %, Nynorsk 15 %, con los shards de Nynorsk repetidos aproximadamente 3,5 veces, procedentes de HPLT 4.0). Sobre esa base, este checkpoint aplica 916 iteraciones adicionales de annealing sobre datos noruegos de alta calidad, con learning rate calentado hasta 5e-4 en 100 iteraciones y decaimiento lineal hasta 0. No consta RLHF, DPO ni instruction tuning.

## Capacidades

- Generacion de texto en noruego (Bokmal y Nynorsk) como modelo base de completado, no como asistente conversacional.
- Modelado de lenguaje autoregresivo puro: predice el siguiente token, sin formato de chat ni plantillas de instrucciones.
- Capacidad limitada de razonamiento y codigo derivada del preentrenamiento, no medida ni optimizada de forma explicita.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingue muy restringido: el tokenizador y los datos son exclusivamente noruegos; el rendimiento en otras lenguas no esta caracterizado.
- Sin modo thinking, vision ni audio.
- Base para experimentos de fine-tuning y de evaluacion de adaptacion linguistica.

## Casos de uso

- Linea base de investigacion en NLP nordico: sirve como referencia "desde cero" contra la que comparar los modelos adaptados del mismo experimento (`da-cpt*`, `ml-cpt*`) para medir la transferencia entre lenguas con presupuesto fijo de tokens.
- Fine-tuning supervisado para tareas de clasificacion o etiquetado en noruego: al ser un modelo base de 2.000 millones de parametros, se puede adaptar con LoRA o fine-tuning completo a tareas como analisis de sentimiento o NER sobre corpus Bokmal y Nynorsk.
- Evaluacion de tokenizadores noruegos: permite estudiar el impacto de un vocabulario BPE especifico (32.000 tokens) frente a tokenizadores multilingues en metricas de perplejidad y eficiencia de tokens.
- Generacion de texto noruego en dominios acotados tras fine-tuning: redaccion de resumenes o parafrasis sobre corpus periodisticos o administrativos, aprovechando la ventana de 4.096 tokens.
- Investigacion sobre annealing y decaimiento de learning rate: el checkpoint permite comparar directamente con `no-base` para aislar el efecto de las 916 iteraciones finales sobre datos de alta calidad.
- Reproducibilidad docente: material de referencia para el curso IN5640, util para replicar el pipeline Megatron-LM con GH200 y analizar curvas de entrenamiento.
- Estudio de sesgos y calidad de datos en noruego: analisis de como la repeticion de shards de Nynorsk (3,5x) afecta a la generacion en esa variante linguistica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB (cuantizaciones no publicadas oficialmente, requieren conversion).
- GPUs recomendadas: NVIDIA A100, H100 o GH200 para inferencia en bf16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 suficientes para inferencia en consumer.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas en bf16 y en 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigFamTLLM/no-base-anneal | 2.115 M | 4.096 | Noruego (nb, nn) | no disponible | Hugging Face |
| BigFamTLLM/no-base | 2.115 M | 4.096 | Noruego (nb, nn) | no disponible | Hugging Face |
| BigFamTLLM/da-base-anneal | no disponible | 4.096 | Danes | no disponible | Hugging Face |
| BigFamTLLM/ml-base-anneal | no disponible | 4.096 | Multilingue (sin noruego) | no disponible | Hugging Face |

La comparativa mas directa es con `no-base` (mismo modelo antes del annealing) y con los modelos adaptados del mismo experimento (`da-*`, `ml-*`), que comparten arquitectura y presupuesto de tokens. No se dispone de datos de rendimiento comparado con modelos noruegos de terceros (por ejemplo, variantes de NorBERT o modelos nordicos de mayor tamano) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni alineamiento: no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Riesgo alto de alucinacion en tareas de conocimiento factual, especialmente fuera del dominio noruego.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida a noruego; el rendimiento en castellano, ingles u otras lenguas no esta caracterizado y previsiblemente sera deficiente por el tokenizador.
- Desbalance de datos: Bokmal 85 % frente a Nynorsk 15 %, con repeticion de shards de Nynorsk, lo que puede introducir sesgos de estilo y calidad entre variantes.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sin datos publicados de benchmarks, evaluacion de sesgos ni analisis de seguridad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion registrada en 2026-11-22, coherente con el curso de otono de 2026; verificar la vigencia del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/no-base
- Modelo danes de referencia: https://huggingface.co/BigFamTLLM/da-base
- Modelo multilingue de referencia: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints CPT danes: https://huggingface.co/BigFamTLLM/da-cpt1 (hasta `da-cpt10`)
- Checkpoints CPT multilingue: https://huggingface.co/BigFamTLLM/ml-cpt1 (hasta `ml-cpt10`)
- Curso IN5640, Universidad de Oslo: no disponible en la informacion proporcionada
- Paper o blog del experimento: no disponible en la informacion proporcionada
