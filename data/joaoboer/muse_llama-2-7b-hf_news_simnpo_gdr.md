# JoaoBoer/muse_Llama-2-7b-hf_News_SimNPO_GDR

## Resumen

`muse_Llama-2-7b-hf_News_SimNPO_GDR` es un modelo derivado de Llama 2 de 7B parámetros al que se le ha aplicado un proceso de *machine unlearning* (olvido selectivo) sobre el conjunto de datos MUSE-News. Lo desarrolla JoaoBoer como parte de su proyecto Speculative-Decoding-Unlearning, y su función principal es servir como modelo base o modelo borrador (*draft model*) en pipelines de decodificación especulativa, así como línea base de comparación para técnicas de desaprendizaje por pesos.

El modelo parte de `muse-bench/MUSE-News_target` (una copia en bf16 de Llama 2 7B ajustada para la tarea de noticias) y se entrena con el algoritmo SimNPO_GDR (SimNPO con *gradient descent regularization*) mediante el framework `open-unlearning` del grupo LOCUS Lab. El objetivo es eliminar la memorización de un conjunto de noticias concreto (*forget set*) manteniendo al mismo tiempo el rendimiento sobre el conjunto que debe retener (*retain set*).

Es relevante porque proporciona un artefacto reproducible y con métricas de evaluación publicadas (extracción, verbatim memorization, privacidad y retención) para investigar el equilibrio entre olvido efectivo y preservación de capacidades, un problema central en el cumplimiento de normativas de privacidad y derechos de autor sobre datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), 32 capas, atención causal |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16/fp16; compatible con cuantizacion estandar de llama.cpp/transformers) |
| Idiomas soportados | no disponible (modelo base Llama 2: predominantemente ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | muse-bench/MUSE-News_target (finetune de Llama 2 7B) |
| Dataset de desaprendizaje | muse-bench/MUSE-News |
| Framework de entrenamiento | open-unlearning (trainer SimNPO) |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con 32 capas, atención causal multi-cabeza con RoPE y normalización RMSNorm, entrenado originalmente por Meta sobre trillones de tokens. Sobre esa base, `muse-bench/MUSE-News_target` introduce un ajuste específico para el dominio de noticias, y este checkpoint aplica encima un proceso de desaprendizaje por pesos.

El entrenamiento de olvido usa el algoritmo SimNPO con regularización GDR, con los hiperparámetros publicados: `beta=0.7`, `delta=3.0`, `gamma=1.0`, `alpha=0.1`, tipo de pérdida de retención NLL, learning rate constante de 1e-5, 10 épocas y batch efectivo de 16. El job se ejecutó localmente entre el 6 y el 8 de octubre de 2026 (job 890) mediante el script `scripts/run_muse_weight_baselines.sh`, originalmente bajo el nombre "SimNPO_optml_GDR". No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su procedencia de MUSE-News.

## Capacidades

- Generación de texto autoregresiva en inglés (heredada de Llama 2 7B).
- Razonamiento general y respuesta a instrucciones en la medida en que lo conserva el modelo base tras el desaprendizaje.
- Capacidad de actuar como modelo borrador (*draft model*) en decodificación especulativa, combinado con un modelo objetivo, para acelerar la inferencia.
- Servir como línea base de comparación en experimentos de *machine unlearning* (evaluación de extracción, memorización verbatim y privacidad).
- Compatible con `text-generation-inference` y `endpoints_compatible` según las etiquetas del repositorio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información proporcionada.

## Casos de uso

- **Investigación en machine unlearning:** el modelo permite reproducir y comparar la eficacia de SimNPO_GDR frente a otras técnicas sobre el benchmark MUSE-News, usando las métricas publicadas (extraction_strength, forget_knowmem_ROUGE, privleak, retain_knowmem_ROUGE) como referencia.
- **Modelo borrador en decodificación especulativa:** al ser un checkpoint derivado de Llama 2 7B, puede emparejarse con un modelo objetivo mayor para proponer tokens candidatos y reducir la latencia de generación, tal como plantea el proyecto Speculative-Decoding-Unlearning.
- **Evaluación de privacidad de modelos entrenados con noticias:** sirve para medir hasta qué punto un modelo ajustado sobre corpus periodísticos retiene contenido verbatim y cómo el desaprendizaje reduce la fuga de información (privleak negativo de -11,94 en la evaluación greedy).
- **Auditoría de retención de conocimiento:** permite analizar el compromiso entre olvidar el conjunto objetivo y preservar el conocimiento general (retain_knowmem_ROUGE de 0,3781 en greedy), útil para diseñar políticas de cumplimiento.
- **Reproducibilidad de pipelines de olvido:** con la configuración Hydra incluida en `.hydra/config.yaml`, se puede reentrenar o auditar el proceso completo con el framework `open-unlearning`.
- **Comparación de métricas con y sin muestreo:** los directorios `evals_sampled_s0` a `evals_sampled_s4` permiten estudiar la varianza de las métricas de generación bajo decodificación estocástica (temperatura 1, top_p 1, top_k 0) en cinco semillas.

## Benchmarks y rendimiento

Métricas MUSE publicadas en la model card (no son benchmarks académicos estándar como MMLU o HumanEval):

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,0195 | no disponible |
| forget_knowmem_ROUGE | 0,2930 | 0,2065 ± 0,0191 |
| forget_verbmem_ROUGE | 0,0975 | 0,0858 ± 0,0032 |
| privleak | -11,9437 | no disponible |
| retain_knowmem_ROUGE | 0,3781 | 0,2076 ± 0,0113 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia en bf16/fp16:** aproximadamente 13-14 GB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16 GB de VRAM.
- **Cuantización a 8 bits:** ~7 GB de VRAM; a 4 bits: ~4 GB, apto para GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- **GPU recomendadas:** A100 40/80 GB, H100, L40S para bf16 sin cuantizar; RTX 4090, RTX 3090 o RTX 4080 para cuantización 8/4 bits.
- **Cabe en GPU de consumo:** sí, en RTX 3090/4090 (24 GB) sin cuantizar y en GPUs de 8-12 GB con cuantización.
- **Opciones de despliegue:** transformers, text-generation-inference (etiqueta oficial), vLLM, llama.cpp/Ollama mediante conversión a GGUF, y endpoints compatibles.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/muse_Llama-2-7b-hf_News_SimNPO_GDR | 6,74B | no disponible | Desaprendizaje SimNPO_GDR sobre MUSE-News | llama2 | Hugging Face (18 descargas) |
| muse-bench/MUSE-News_target | ~6,74B | no disponible | Modelo objetivo ajustado en noticias, sin desaprender | llama2 | Hugging Face |
| Llama 2 7B (meta-llama/Llama-2-7b-hf) | 6,74B | 4.096 | Modelo base generalista | llama2 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, más allá de las métricas MUSE internas del presente checkpoint.

## Limitaciones y advertencias

- **Sesgos heredados:** al derivar de Llama 2 7B, arrastra los sesgos del corpus original de Meta, no corregidos por el proceso de desaprendizaje.
- **Riesgo de alucinación:** el desaprendizaje puede degradar la fidelidad factual sobre temas relacionados con el conjunto olvidado, aumentando la probabilidad de respuestas inventadas en ese dominio.
- **Idioma:** no se documentan idiomas soportados; el modelo base es predominantemente inglés y el desaprendizaje se realizó sobre un corpus de noticias en inglés.
- **Licencia:** Llama 2 Community License, con restricciones de uso comercial (límite de 700 millones de usuarios mensuales para despliegues comerciales y obligaciones de atribución).
- **Uso previsto limitado:** es un artefacto de investigación para experimentos de olvido y decodificación especulativa, no un modelo de producción listo para uso general.
- **Métricas sensibles al muestreo:** las métricas de generación varían notablemente entre decodificación greedy y muestreada (por ejemplo, retain_knowmem_ROUGE cae de 0,3781 a 0,2076), por lo que las comparaciones deben hacerse con la misma configuración de decodificación.
- **Repositorio de bajo uso:** solo 18 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_SimNPO_GDR
- Modelo base: https://huggingface.co/muse-bench/MUSE-News_target
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
