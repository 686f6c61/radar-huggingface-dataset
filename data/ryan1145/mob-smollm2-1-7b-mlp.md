# ryan1145/mob-smollm2-1.7b-mlp

## Resumen

`mob-smollm2-1.7b-mlp` es una cabeza de salida (output head) basada en una mezcla de Bernoulli (MoB, *Mixture of Bernoullis*) entrenada por el usuario ryan1145 para sustituir la capa de proyección al vocabulario de SmolLM2-1.7B de HuggingFaceTB. No es un modelo de lenguaje completo: contiene únicamente los pesos de la cabeza (31.861.888 parámetros en fp32) y un codebook semántico indexado por token-ID, y requiere el backbone y el tokenizador originales como dependencias separadas. El problema que aborda es el coste computacional de la capa de salida, que en vocabularios de 49.152 tokens domina buena parte del coste de decodificación; la propuesta es representar la distribución sobre el vocabulario mediante códigos binarios y una mezcla de Bernoulli, destilada desde el profesor.

La relevancia es acotada pero técnicamente interesante: se trata de un artefacto de investigación que explora alternativas a la softmax completa para acelerar la generación, con resultados declarados de `normalized_ppl_ratio` de 2,41 frente al profesor, lo que indica una aproximación, no una equivalencia. No es cargable con `AutoModelForCausalLM` y no sustituye al modelo base en ningún pipeline estándar de Transformers.

El repositorio es muy pequeño (0,1 GB), está publicado bajo licencia MIT y solo declara soporte de inglés. Su utilidad práctica depende de integrar el paquete `MoB_Head` y de respetar estrictamente el orden de token-ID del tokenizador de SmolLM2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de salida Mixture-of-Bernoullis (MoB) sobre backbone transformer congelado; constructor `{"depth": 3, "h": 2048, "k": 128, "m": 16, "width": 3072}` |
| Parametros totales | 31.861.888 (solo la cabeza; el backbone SmolLM2-1.7B se distribuye aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del backbone SmolLM2-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (serialización en fp32 safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, sin estado del optimizador) + codebook semántico indexado por token-ID |

## Arquitectura y entrenamiento

La cabeza pertenece a la familia `mob` y se construye con profundidad 3, dimensión oculta de entrada 2048 (la del backbone), `k=128`, `m=16` y anchura 3072. El vocabulario objetivo es de 49.152 tokens, coincidente con el de SmolLM2. La salida se organiza como logits de bits y logits de mezcla (`bit_logits, mixture_logits = head(h)`), es decir, un esquema de códigos binarios semánticos combinado con una mezcla de Bernoulli en lugar de una softmax densa sobre el vocabulario. El backbone permanece congelado durante todo el entrenamiento; solo se optimiza la cabeza.

El entrenamiento es destilación de conocimiento desde el profesor (el propio SmolLM2-1.7B) minimizando la NLL exacta ponderada por las probabilidades del profesor sobre su soporte top-1024 renormalizado, sin objetivos muestreados ni ruido continuo en el target. Se realizaron 228.000 actualizaciones con batch 8 y longitud de secuencia 512 sobre FineWeb-Edu, schedule coseno, LR pico de 0,0015 y 4.000 pasos de calentamiento. Los controles de estabilidad incluyen inicialización de vértices, regularización de entropía de la mezcla y annealing de temperatura de mezcla. El código de carga verifica los hashes de pesos y codebook y no ejecuta código remoto.

## Capacidades

- Generación de texto solo en la medida en que el backbone SmolLM2-1.7B la proporcione; la cabeza no añade capacidades nuevas.
- Producción de distribuciones aproximadas sobre el vocabulario mediante códigos binarios y mezcla de Bernoulli, apta para decodificación especulativa o *cascade reranking*.
- Razonamiento, código y matemáticas: no evaluados ni declarados para este artefacto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Capacidad especial: decodificación por códigos binarios semánticos con decodificadores independientes en `mob.mob_common`; el *cascade reranking* requiere las filas nativas de la tabla de salida correspondientes.

## Casos de uso

- Investigación sobre cabezas de salida eficientes: sustituir experimentalmente la proyección al vocabulario de SmolLM2-1.7B por esta cabeza para medir el ahorro de cómputo en la capa final y comparar curvas de perplejidad normalizada frente al profesor.
- Decodificación especulativa en pipelines de generación: usar los códigos propuestos por la cabeza como candidatos y verificar con la tabla de salida nativa, aprovechando que el coste por paso se reduce al evitar la softmax densa sobre 49.152 tokens.
- Reproducción de experimentos de destilación: el repositorio documenta hiperparámetros completos (228k updates, top-1024, FineWeb-Edu, cosine, LR 0,0015), lo que permite replicar el entrenamiento de la cabeza sobre el mismo backbone congelado.
- Estudio de representaciones semánticas binarias: el codebook indexado por token-ID permite analizar la estructura de códigos y su relación con la frecuencia y la semántica de los tokens del vocabulario de SmolLM2.
- Benchmarking de alternativas a softmax: comparar MoB frente a CFHead y otras cabezas en términos de *recall* de candidatos, acuerdo de reranking y aceleración efectiva según hardware, batch y ruta de decodificación.
- Docencia y divulgación técnica: ejemplo compacto (0,1 GB, 31,9 M de parámetros) para ilustrar destilación de la capa de salida y decodificación con códigos binarios sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| normalized_ppl_ratio | 2,41 | Perplejidad normalizada sumando sobre códigos válidos del vocabulario, no sobre todos los vértices del hipercubo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card indica que el *recall* de candidatos y el acuerdo de reranking son mediciones separadas y remite a los informes técnicos del repositorio para datasets, recuentos de posiciones, precisión y ajustes de comparación.

## Requisitos de hardware

- VRAM para la cabeza: aproximadamente 128 MB en fp32 (31,86 M de parámetros × 4 bytes), más el codebook; despreciable frente al backbone.
- VRAM para el conjunto: la del backbone SmolLM2-1.7B, es decir, del orden de 3,5 GB en fp16 y 1,5-2 GB en cuantizaciones de 4 bits, más el overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para el conjunto en fp16; A100/H100 solo necesarias para entrenamiento o batches grandes.
- Cabe en GPU consumer: sí, con holgura, al tratarse de un modelo de 1,7B más una cabeza de 32 M.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma directa, porque no es un modelo `AutoModelForCausalLM`; requiere el paquete `MoB_Head` (`mob.hub.load_head`) y los decodificadores de `mob.mob_common`.
- Latencia y throughput: no disponibles; la model card advierte que las aceleraciones dependen de hardware, vocabulario, batch y ruta de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mob-smollm2-1.7b-mlp | 31,9 M (cabeza) + backbone 1,7B | no disponible | Cabeza MoB con códigos binarios semánticos | MIT | HuggingFace (repo de 0,1 GB) |
| SmolLM2-1.7B (profesor) | 1,7B | no disponible en esta ficha | Transformer decoder con softmax completa | no disponible en esta ficha | HuggingFace |
| CFHead | no disponible | no disponible | Cabeza alternativa de clasificación/decodificación | no disponible | Referenciada en la model card |

La model card señala que la comparación del proyecto encontró un rendimiento cercano a CFHead en varios ajustes, pero sin superar su equilibrio global de aceleración. No se dispone de datos suficientes para comparar parámetros, contexto o benchmarks frente a otras cabezas de salida.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: `AutoModelForCausalLM` no puede cargarlo; requiere el backbone y el tokenizador de SmolLM2-1.7B como dependencias separadas.
- No se debe sustituir el tokenizador ni alterar el orden de token-ID: el codebook está indexado por ID y cualquier cambio invalida los pesos.
- La cabeza aproxima al profesor y no preserva su distribución completa; la generación libre de formato largo puede derivar.
- La decodificación en cascada está limitada por el *recall* de las propuestas; si el candidato correcto no aparece, el reranking no puede recuperarlo.
- El `normalized_ppl_ratio` de 2,41 indica una divergencia sustancial respecto a la distribución del profesor; no debe interpretarse como calidad equivalente.
- Las aceleraciones son sensibles al hardware, al tamaño de vocabulario, al batch y a la ruta de decodificación; no hay garantía de mejora en todos los entornos.
- Solo se declara inglés; no hay evidencia de comportamiento multilingüe.
- La licencia del artefacto es MIT, pero los términos del backbone (SmolLM2) y del dataset (FineWeb-Edu) siguen aplicándose por separado.
- No se incluyen parámetros del backbone ni texto del corpus; el artefacto no es autosuficiente.
- Riesgo de sesgos y alucinaciones heredado del profesor y del corpus de destilación, no caracterizado en la documentación disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryan1145/mob-smollm2-1.7b-mlp
- Repositorio de código MoB_Head: https://github.com/ryan-he-47/MoB_Head
- Modelo base SmolLM2-1.7B: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
