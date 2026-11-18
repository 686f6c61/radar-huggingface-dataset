# JIRU-W/e32_top8_seq2048_gbs128_10b_perlayeraux

## Resumen

e32_top8_seq2048_gbs128_10b_perlayeraux es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 3.696.887.808 parametros totales, desarrollado por el usuario JIRU-W y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de investigacion entrenado desde cero sobre 10.000 millones de tokens, cuyo proposito principal no es el uso en produccion sino el estudio experimental del enrutamiento y del equilibrio de carga en arquitecturas MoE. Concretamente, el modelo es identico a su predecesor JIRU-W/e32_top8_seq2048_gbs128_10b salvo por un cambio: la funcion de perdida de balanceo de carga se calcula de forma independiente por capa y se promedia entre las 16 capas, en lugar de agregar las estadisticas de enrutamiento de todas las capas por indice de experto.

La arquitectura replica la de OLMoE (codigo copiado de `transformers` v5.20.1, con las clases renombradas a `MaskMoe*` y distribucion como custom code): 16 capas, dimension oculta 2048, 16 cabezas de atencion con QK-norm, RoPE con theta 10000, y 32 expertos SwiGLU por capa con top-8 activos. El vocabulario es de 50.304 tokens (tokenizer de OLMoE). El modelo no esta ajustado por instrucciones y su entrenamiento seguia en curso en el momento de redactar la model card (paso 20.030 de 38.139).

Su relevancia actual es fundamentalmente metodologica: permite comparar de forma controlada dos formulaciones de la perdida auxiliar de balanceo en MoE manteniendo fijos datos, orden de datos, semilla e hiperparametros, lo que aisla el efecto de la variante per-layer frente a la variante pooled de OLMoE/Mixtral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (OLMoE), 16 capas, hidden 2048, 16 cabezas, QK-norm, RoPE theta=10000 |
| Parametros totales | 3.696.887.808 |
| Parametros activos | no disponible (top-8 de 32 expertos; el numero exacto de parametros activos no se indica en la informacion) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom code) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMoE: 16 capas transformer con atencion multi-cabeza de 16 cabezas, QK-norm y RoPE con theta 10000, dimension oculta 2048, y una capa MoE por capa con 32 expertos SwiGLU de dimension intermedia 1024, de los cuales se activan los top-8 por token con `norm_topk_prob=False`. El vocabulario es de 50.304 tokens con el tokenizer de OLMoE. El codigo se distribuye como custom code (`modeling_mask_moe.py`, `configuration_mask_moe.py`) y requiere `transformers>=5.20`.

El entrenamiento se realizo desde cero sobre el dataset JIRU-W/olmoe-mix-0924-10b, compuesto por 10.000 millones de tokens derivados de `allenai/OLMoE-mix-0924` (con arXiv procedente de `EleutherAI/proof-pile-2`), en una sola pasada y con orden de muestras fijado por `np.random.default_rng(1234).permutation(4881809)`. Se planificaron 38.139 pasos con batch de 128 secuencias de 2048 tokens (262.144 tokens por paso), optimizador AdamW con lr 6e-4, 200 pasos de warmup, decaimiento coseno hasta 6e-5 y weight decay 0.1. Se uso bf16 para pesos, acumulacion de gradientes en fp32, DeepSpeed ZeRO-2 y una unica GPU, con semilla 1234. La innovacion tecnica destacable es la perdida de balanceo de carga calculada por capa (Switch loss por capa, promediada sobre las 16 capas) con coeficiente 0.01, frente a la forma de OLMoE/Mixtral que agrega estadisticas de router de todas las capas por indice de experto. No se menciona RLHF ni DPO: es un modelo base de preentrenamiento.

## Capacidades

- Generacion de texto autoregresiva como modelo base de lenguaje (no ajustado por instrucciones).
- Razonamiento y modelado de lenguaje general derivado del preentrenamiento sobre OLMoE-mix-0924 (incluye contenido de arXiv).
- Enrutamiento MoE con top-8 de 32 expertos por capa y 16 capas.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; al no estar ajustado por instrucciones, no se documenta.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Uso como modelo de investigacion para estudiar balanceo de carga y enrutamiento en MoE.

## Casos de uso

- Investigacion sobre balanceo de carga en MoE: comparar directamente esta variante per-layer con JIRU-W/e32_top8_seq2048_gbs128_10b (variante pooled) manteniendo datos, semilla e hiperparametros, para aislar el efecto de la formulacion de la perdida auxiliar sobre la distribucion de expertos.
- Estudio de enrutamiento por capa: analizar como se distribuyen los tokens entre los 32 expertos de cada una de las 16 capas y si la perdida per-layer reduce el colapso de expertos en capas concretas.
- Reproducibilidad de experimentos de preentrenamiento: el autor documenta orden de datos, semilla, hiperparametros y checkpoints por paso (ramas `step<N>`), lo que permite reproducir curvas de entrenamiento y validar resultados.
- Analisis de curvas de aprendizaje: los checkpoints intermedios (pasos 100, 200, 300, 500, 700, 1500, 2500, 3500, 4500 y cada 1000) permiten estudiar la evolucion de la cross-entropy de evaluacion a lo largo del entrenamiento.
- Fine-tuning posterior como base de investigacion: al ser un modelo base Apache 2.0, puede servir como punto de partida para experimentos de ajuste supervisado o DPO en entornos academicos, aunque su tamano y estado de entrenamiento lo hacen poco adecuado para produccion.
- Docencia y formacion: ilustrar en cursos o seminarios el funcionamiento interno de un MoE (top-k routing, perdida auxiliar, balanceo por capa) con un modelo de 3,7B parametros totales y codigo accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta cross-entropy de evaluacion (media sobre 256 secuencias retenidas de 2048 tokens):

| Revision | Tokens vistos | Eval CE |
|---|---|---|
| step7000 | 1,84B | 3,1408 |
| step8000 | 2,10B | 3,1094 |
| step9000 | 2,36B | 3,0817 |
| step10000 | 2,62B | 3,0595 |
| step11000 | 2,88B | 3,0381 |
| step12000 | 3,15B | 3,0184 |
| step13000 | 3,41B | 3,0033 |
| step14000 | 3,67B | 2,9856 |
| step15000 | 3,93B | 2,9691 |
| step16000 | 4,19B | 2,9552 |
| step17000 | 4,46B | 2,9390 |
| step18000 | 4,72B | 2,9256 |
| step19000 | 4,98B | 2,9129 |
| step20000 | 5,24B | 2,9005 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion. Como referencia orientativa, los 3.696.887.808 parametros totales en bf16 ocupan aproximadamente 7,4 GB solo en pesos; a ello hay que sumar activaciones, cache KV y overhead del runtime, por lo que el requisito real es mayor.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una unica GPU con DeepSpeed ZeRO-2, pero el autor no especifica el modelo de GPU.
- Cabe en consumer GPU: no disponible como dato confirmado; por el tamano de pesos en bf16 es plausible en GPUs consumer con 16 GB o mas de VRAM, pero no se documenta ni se garantiza.
- Opciones de despliegue: el autor solo documenta uso con `transformers>=5.20` y `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al tratarse de custom code la compatibilidad con esos runtimes no esta disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| e32_top8_seq2048_gbs128_10b_perlayeraux (este) | 3.696.887.808 | 2048 | Apache 2.0 | Perdida de balanceo per-layer; entrenamiento en curso |
| JIRU-W/e32_top8_seq2048_gbs128_10b | 3.696.887.808 (misma arquitectura) | 2048 | Apache 2.0 | Perdida de balanceo pooled; misma semilla, datos e hiperparametros |
| OLMoE (referencia de arquitectura) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Arquitectura base de la que se copia el codigo |

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo describe explicitamente como "small research model" y no esta ajustado por instrucciones, por lo que no es adecuado para uso directo en produccion ni para conversacion.
- Entrenamiento incompleto: en el momento de redactar la model card el entrenamiento estaba en el paso 20.030 de 38.139; los checkpoints publicados no corresponden al modelo final.
- Ventana de contexto limitada a 2048 tokens, lo que restringe tareas que requieran contexto largo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del ingles u otros idiomas presentes en OLMoE-mix-0924.
- Riesgo de alucinacion: inherente a un modelo base de lenguaje sin alineamiento; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no documentados por el autor; al derivar de OLMoE-mix-0924 (que incluye arXiv de proof-pile-2) puede heredar sesgos de ese corpus.
- Requiere `trust_remote_code=True` y `transformers>=5.20` por el uso de custom code, lo que implica ejecutar codigo del repositorio y revisar su procedencia antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial, pero el estado de investigacion y la falta de benchmarks desaconsejan su uso en produccion sin evaluacion propia.
- No se documentan cuantizaciones oficiales ni compatibilidad con runtimes de inferencia alternativos a transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JIRU-W/e32_top8_seq2048_gbs128_10b_perlayeraux
- Modelo predecesor (variante pooled): https://huggingface.co/JIRU-W/e32_top8_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
- Dataset origen: allenai/OLMoE-mix-0924 (referenciado en la model card; sin URL directa proporcionada)
- Dataset origen de arXiv: EleutherAI/proof-pile-2 (referenciado en la model card; sin URL directa proporcionada)
