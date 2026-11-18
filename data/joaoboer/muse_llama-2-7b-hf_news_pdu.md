# JoaoBoer/muse_Llama-2-7b-hf_News_PDU

## Resumen

`muse_Llama-2-7b-hf_News_PDU` es un modelo derivado de Llama 2 de 7B parámetros al que se le ha aplicado una técnica de *machine unlearning* denominada PDU (Primal-Dual Unlearning) sobre el conjunto de datos MUSE-News. Lo desarrolla JoaoBoer como parte de un proyecto de investigación sobre desaprendizaje y decodificación especulativa, y se publica como baseline de referencia para comparar métodos de eliminación de conocimiento en modelos de lenguaje.

El modelo parte de `muse-bench/MUSE-news_target`, un checkpoint de Llama 2 7B ajustado específicamente para la tarea de retener y olvidar noticias del benchmark MUSE. Sobre él se aplica PDU, un método de optimización primal-dual que combina una pérdida de olvido (*forget loss*) con una pérdida de retención (*retain loss*) regularizada, con el objetivo de eliminar la memorización de un subconjunto concreto de noticias sin degradar el conocimiento general del modelo.

Su relevancia es fundamentalmente académica: sirve para estudiar hasta qué punto el desaprendizaje de pesos es efectivo frente a alternativas como el filtrado en inferencia, y como modelo borrador (*draft*) en pipelines de decodificación especulativa aplicada al desaprendizaje. No es un modelo pensado para uso comercial general, sino una pieza de investigación reproducible con configuración de entrenamiento y evaluaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, 4096 tokens según la arquitectura base) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Modelo base | muse-bench/MUSE-news_target (fine-tune de Llama 2 7B) |
| Dataset de desaprendizaje | muse-bench/MUSE-News |
| Framework de entrenamiento | open-unlearning (locuslab) |
| Tamaño del repositorio | 13,5 GB |
| Descargas | 21 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y RoPE para codificación posicional. El modelo no introduce cambios estructurales; el trabajo se centra exclusivamente en el ajuste de pesos mediante desaprendizaje.

El entrenamiento aplica PDU sobre el *forget set* de MUSE-News partiendo de `muse-bench/MUSE-news_target`. La configuración publicada en `.hydra/config.yaml` especifica `gamma: 1.0`, `alpha: 50`, `retain_loss_type: NLL`, `retain_loss_eps: 1.5`, `primal_dual: True`, `dual_step_size: 1.0`, `dual_update_upon: step` y `dual_warmup_epochs: 3`, con dos componentes de pérdida (`forget_loss` y `retain_loss`). El método primal-dual ajusta dinámicamente el peso relativo de ambas pérdidas mediante una variable dual, lo que permite equilibrar la eliminación del conocimiento objetivo con la preservación del resto. El proyecto asociado, Speculative-Decoding-Unlearning, emplea este checkpoint como modelo borrador en experimentos de decodificación especulativa orientada al desaprendizaje.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma del benchmark MUSE-News; el resto de idiomas no está documentado).
- Desaprendizaje selectivo: el modelo ha sido entrenado para reducir la memorización del *forget set* de MUSE-News.
- Retención de conocimiento general: la pérdida de retención (NLL con epsilon 1.5) busca preservar el conocimiento fuera del conjunto de olvido.
- Uso como modelo borrador en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Compatible con `transformers`, `text-generation-inference` y endpoints compatibles según los tags del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en machine unlearning: servir como baseline reproducible de PDU frente a otros métodos (GA, NPO, RMU, etc.) sobre el benchmark MUSE-News, comparando métricas de olvido y retención con la configuración publicada.
- Evaluación de decodificación especulativa: emplear el checkpoint como modelo borrador en el proyecto Speculative-Decoding-Unlearning para medir el impacto del desaprendizaje en la tasa de aceptación de tokens y en la latencia.
- Estudio de privacidad en modelos de lenguaje: analizar el valor de `privleak` (87,64 en evaluación greedy) para discutir hasta qué punto el desaprendizaje de pesos mitiga la fuga de información frente a métodos de filtrado en inferencia.
- Reproducción de experimentos académicos: el repositorio incluye `evals/` con evaluación greedy y `evals_sampled_s0` a `evals_sampled_s4` con cinco semillas a temperatura 1, lo que permite replicar los resultados publicados.
- Análisis de equilibrio olvido-retención: usar las métricas `forget_knowmem_ROUGE` y `retain_knowmem_ROUGE` para estudiar el compromiso entre eliminar conocimiento objetivo y conservar el resto, comparando la evaluación greedy con la muestreada.
- Docencia y formación: ilustrar en cursos de IA el funcionamiento de técnicas primal-dual aplicadas al desaprendizaje, con un caso concreto y métricas verificables.

## Benchmarks y rendimiento

Métricas MUSE publicadas por el autor en la model card:

| Métrica | Greedy | Muestreado (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0,0242 | no disponible |
| forget_knowmem_ROUGE | 0,5005 | 0,2144 ± 0,0270 |
| forget_verbmem_ROUGE | 0,1084 | 0,0568 ± 0,0014 |
| privleak | 87,6364 | no disponible |
| retain_knowmem_ROUGE | 0,4619 | 0,2478 ± 0,0318 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación con el modelo base `muse-bench/MUSE-news_target` no se incluye en la model card.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en 8 bits: en torno a 7-8 GB de pesos; en 4 bits, alrededor de 4 GB, aunque no se publican variantes cuantizadas en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y reproducibilidad de las métricas; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits con herramientas externas (no se distribuyen pesos GGUF).
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag del repo) y endpoints compatibles; llama.cpp u Ollama requerirían conversión manual a GGUF, no incluida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muse_Llama-2-7b-hf_News_PDU (este) | 6,74 B | no disponible | Desaprendizaje PDU sobre MUSE-News | llama2 | Hugging Face, 21 descargas |
| muse-bench/MUSE-news_target | ~6,7 B (Llama 2 7B) | no disponible | Modelo objetivo sin desaprender | no disponible | Hugging Face (modelo base) |
| Llama 2 7B (Meta) | 6,74 B | 4096 tokens | Modelo base generalista | llama2 | Hugging Face, ampliamente distribuido |
| Alternativas de desaprendizaje sobre MUSE-News (GA, NPO, RMU) | ~6,7 B | no disponible | Otros métodos de unlearning | variable | Repositorios de investigación; no se detallan en la información disponible |

La comparación cuantitativa con otros métodos de desaprendizaje sobre MUSE-News no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el benchmark MUSE-News; su comportamiento fuera de ese dominio no está documentado.
- El valor de `privleak` de 87,64 en evaluación greedy sugiere que el desaprendizaje no elimina por completo la fuga de información, lo que debe tenerse en cuenta en cualquier aplicación sensible a privacidad.
- La diferencia entre métricas greedy y muestreadas (por ejemplo, `forget_knowmem_ROUGE` pasa de 0,5005 a 0,2144 ± 0,0270) indica alta sensibilidad al esquema de decodificación; los resultados deben reportarse siempre con la configuración exacta.
- No se documentan idiomas soportados más allá del inglés del benchmark; el rendimiento multilingüe es desconocido.
- La licencia Llama 2 impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y cláusulas de uso aceptable); conviene revisarla antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos Llama 2 7B, no mitigado por el proceso de desaprendizaje.
- No se distribuyen pesos cuantizados ni formatos GGUF, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- El modelo tiene 21 descargas y 0 likes; no cuenta con validación comunitaria independiente.
- El uso previsto es de investigación y reproducibilidad; no se recomienda como modelo de producción generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_News_PDU
- Modelo base: https://huggingface.co/muse-bench/MUSE-news_target
- Dataset MUSE-News: https://huggingface.co/datasets/muse-bench/MUSE-News
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
