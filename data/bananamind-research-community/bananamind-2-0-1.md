# bananamind-research-community/bananamind-2.0.1

## Resumen

BananaMind 2.0.1 es un conjunto de cuatro modelos experimentales de lenguaje de tamaño minúsculo (1,48 millones de parámetros) desarrollados por la comunidad de investigación BananaMind. El objetivo del experimento es estudiar el efecto de reutilizar capas físicas del transformador durante el paso forward (técnica de *layer looping*) y comparar dos datasets de entrenamiento: `FineWeb-HQ` y `fineweb-edu`. Todos los modelos comparten la misma arquitectura decoder-only derivada de BananaMind 2.0, con 3 capas decoder físicas, 128 de ancho oculto y una ventana de contexto de 3.072 tokens.

La relevancia de este lanzamiento radica en su enfoque de eficiencia extrema: con menos de 1,5 millones de parámetros, los modelos exploran cómo el bucle de capas puede mejorar el rendimiento sin aumentar el número de parámetros. Los resultados se presentan en benchmarks públicos como ARC, PIQA, HellaSwag y ArithMark-3, además de una batería propia llamada Base Bench 1.1. Es un trabajo de investigación más que un modelo listo para producción, pero ofrece datos útiles sobre el diseño de arquitecturas ultrapequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con 3 capas físicas y ejecución variable (loop parcial o completo) |
| Parametros totales | 1.480.516 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (no se especifican en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 3 capas físicas, cada una con 239.425 parámetros. El modelo incluye un módulo de embedding trigram causal con 499.969 parámetros (33,77% del total) y un núcleo transformer de 980.547 parámetros (66,23%). La atención usa 4 cabezas de consulta y 1 cabeza de clave/valor, con dimensión de cabeza 32 y RoPE con theta 100.000. El tokenizador es BananaMind 2 Micro con un vocabulario de 2.048 tokens.

La innovación principal es la ejecución variable de capas: los cuatro modelos usan los mismos pesos físicos pero reutilizan capas durante el forward. Por ejemplo, "Partial HQ" ejecuta `L1 -> L2 -> L2 -> L3` (la capa 2 se repite), mientras que "All-looped Edu" ejecuta `L1 -> L2 -> L3 -> L1 -> L2 -> L3` (todas las capas se repiten). El entrenamiento se realizó sobre dos datasets: `epfml/FineWeb-HQ` y `HuggingFaceFW/fineweb-edu`. No se especifican el número de tokens de entrenamiento, ni el uso de RLHF o DPO. El modelo también incorpora una convolución de refresco con kernel 9 y profundidad causal, y un hash de n-gramas con 3.906 buckets.

## Capacidades

- Generación de texto básica con contexto de 3.072 tokens.
- Razonamiento lógico y de sentido común limitado, dado el tamaño extremadamente reducido.
- Completado de código básico (según resultados de Base Bench en la categoría "Code completion").
- Capacidades multilingües no documentadas; probablemente limitadas al inglés por los datasets de entrenamiento.
- No soporta tool calling, ni agentes, ni visión, ni audio.
- No hay modo de pensamiento (*thinking mode*) documentado.

## Casos de uso

- Investigación académica sobre eficiencia de parámetros: el modelo sirve para estudiar el impacto del *layer looping* en modelos ultrapequeños, comparando las cuatro variantes en benchmarks estandarizados.
- Experimentos de destilación: al ser tan pequeño, puede usarse como modelo profesor para generar datos sintéticos o como base para técnicas de compresión.
- Prototipado rápido de pipelines de NLP: su tamaño permite ejecutarlo en CPU y probar flujos de generación de texto sin requisitos de hardware.
- Enseñanza de arquitecturas transformer: útil en cursos de deep learning para ilustrar conceptos de atención, embeddings y reutilización de capas.
- Evaluación de métricas de razonamiento: los resultados en ArithMark-3 y Base Bench pueden servir para calibrar benchmarks en modelos pequeños.
- Comparación de datasets de entrenamiento: el contraste entre FineWeb-HQ y fineweb-edu permite analizar cómo afecta la calidad del corpus a tareas de sentido común y conocimiento del mundo.

## Benchmarks y rendimiento

La model card proporciona resultados de las cuatro variantes. Se presentan los valores `acc_norm` para los benchmarks principales:

| Metrica | Partial HQ | No-loop Edu | Partial Edu | All-looped Edu |
|---|---:|---:|---:|---:|
| Base Bench 1.1 overall Elo | 889 | 884 | 885 | 875 |
| Base Bench raw accuracy | 35,43% | 33,71% | 34,57% | 33,14% |
| ARC-Easy `acc_norm` | 29,50% | 30,35% | 29,50% | 30,98% |
| ARC-Challenge `acc_norm` | 22,18% | 22,10% | 22,53% | 21,33% |
| ARC mean `acc_norm` | 25,84% | 26,22% | 26,01% | 26,15% |
| PIQA `acc_norm` | 53,65% | 52,56% | 54,30% | 52,45% |
| HellaSwag `acc_norm` | 27,04% | 26,93% | 27,04% | 27,28% |
| ArithMark-3 `acc_norm` | 28,10% | 30,80% | 33,00% | 30,40% |
| Intelligence Index | 3,79 | 3,93 | 5,37 | 3,88 |

La variante "Partial Edu" obtiene el mejor Intelligence Index (5,37) y el mejor resultado en ArithMark-3 (33,00%), mientras que "Partial HQ" lidera en Base Bench overall Elo (889) y en la categoría de razonamiento cuantitativo. No se han publicado comparaciones con otros modelos externos.

## Requisitos de hardware

- Al tratarse de un modelo de 1,48 millones de parámetros, la inferencia es viable en CPU sin GPU.
- VRAM estimada: menos de 10 MB en FP32, por lo que cabe en cualquier GPU comercial, incluidas integradas.
- GPU recomendadas: cualquiera, incluso una GTX 1050 o una Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser safetensors, puede cargarse con Hugging Face Transformers; también podría convertirse a GGUF para llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles oficialmente, pero por el tamaño se esperan tiempos de inferencia de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables del mismo rango de parámetros (1,5M) con los mismos benchmarks. El propio proyecto BananaMind tiene un modelo mayor, BananaMind-2-Pro, con 138.971.520 parámetros y 100B tokens de entrenamiento, pero no es comparable en tamaño ni en propósito. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: su capacidad de razonamiento y generación es muy limitada; no es adecuado para tareas de producción reales.
- Sesgos y alucinaciones: no se han documentado, pero por su tamaño y entrenamiento en datasets web, es probable que presente sesgos presentes en esos corpus.
- Contexto limitado a 3.072 tokens, insuficiente para tareas de documento largo.
- Idiomas no especificados; probablemente solo inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no es práctico para aplicaciones comerciales serias.
- No hay información sobre el número de tokens de entrenamiento ni sobre el proceso de entrenamiento (solo se mencionan los datasets).
- El repositorio tiene 0 descargas y 2 likes, lo que sugiere que es un proyecto de investigación reciente y poco validado externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bananamind-research-community/bananamind-2.0.1
- Espacio de BananaMind: https://huggingface.co/spaces/BananaMind/Website
- Modelo BananaMind-2-Pro (relacionado): https://huggingface.co/BananaMind/BananaMind-2-Pro
- GitHub de BananaMind: https://github.com/BananaMind
