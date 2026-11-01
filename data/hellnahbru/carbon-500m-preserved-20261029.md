# hellnahbru/Carbon-500M-preserved-20261029

## Resumen

Carbon-500M es un modelo generativo de ADN de 511.894.528 parámetros (aproximadamente 500M), desarrollado por el usuario hellnahbru y publicado en Hugging Face bajo el identificador `hellnahbru/Carbon-500M-preserved-20261029`. Forma parte de la familia Carbon, originariamente desarrollada por HuggingFaceBio, y se distribuye como un modelo causal estándar de Hugging Face (`LlamaForCausalLM`) con pesos en safetensors y licencia Apache 2.0. Su propósito principal no es competir en benchmarks de generación de ADN con los modelos mayores de la familia (Carbon-3B y Carbon-8B), sino servir como **modelo borrador (draft model) para decodificación especulativa**, compartiendo tokenizador y formato de plantilla con aquellos para acelerar la generación sin pérdida de calidad.

La arquitectura es un transformer decoder-only de estilo Llama, con embeddings posicionales rotatorios (RoPE), entrenado en bfloat16 con el optimizador AdamW. Utiliza un tokenizador híbrido: 6-mer para ADN (cada token representa aproximadamente 6 pares de bases) y BPE de Qwen3 para texto en inglés. El contexto nativo es de 8.192 tokens, lo que equivale a unos 49 kbp de ADN, sin etapa de entrenamiento de contexto largo.

El modelo es relevante ahora porque la generación de secuencias genómicas de alta fidelidad con modelos grandes es costosa en tiempo de reloj, y un borrador pequeño que comparte tokenizador permite aplicar decodificación especulativa de forma nativa en Transformers mediante el argumento `assistant_model`, reduciendo la latencia sin alterar la salida greedy del modelo objetivo. La ficha se centra en los hechos específicos de esta variante de 500M; para la especificación completa del tokenizador, el protocolo de evaluación y las notas de uso, el autor remite a la model card de Carbon-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo estilo Llama (`LlamaForCausalLM`), con RoPE |
| Parametros totales | 511.894.528 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (≈ 49 kbp); sin etapa de contexto largo |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ADN (etiqueta `dna`); tokenizador híbrido con componente BPE de Qwen3 para inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 1.0 GB) |

## Arquitectura y entrenamiento

Carbon-500M es un transformer decoder-only autoregresivo de estilo Llama con 511.894.528 parámetros, embeddings posicionales RoPE y precisión bfloat16 durante el entrenamiento. Emplea un tokenizador híbrido compartido con el resto de la familia Carbon: 6-mer para ADN (cada token codifica aproximadamente 6 pares de bases, con un vocabulario de 4.096 combinaciones de 6-mer) y BPE de Qwen3 para texto en inglés. El modelo se entrenó con 600B tokens 6-mer, equivalentes a aproximadamente 3,6 billones de pares de bases de ADN.

El entrenamiento siguió un esquema de pérdida en dos fases: entropía cruzada desde 0 hasta 300B tokens y, a partir de ahí, la pérdida híbrida Factorised Nucleotide Supervision (FNS) desde 300B hasta 600B tokens. El cambio de pérdida ocurre más tarde que en Carbon-3B porque el entrenamiento de Carbon-500M fue muy estable y toleró la transición tardía. La mezcla de datos es idéntica a la mezcla de fase de decaimiento de Carbon-3B: 50 % genes eucariotas de estilo Generator, 25 % ARNm maduro, 10 % ARNm enriquecido en sitios de splicing y 15 % genomas bacterianos de GTDB, con los mismos pesos durante toda la ejecución de 600B tokens. No hubo etapa de entrenamiento de contexto largo, por lo que el modelo permanece en su contexto nativo de 8.192 tokens. La innovación técnica destacable es la rama `fns`, que carga código de modelado personalizado para generar a nivel de par de bases: cada 6-mer seleccionado se ensambla a partir de seis distribuciones de nucleótido por posición, permitiendo control exacto del número de pares de bases generados y de máscaras por posición.

## Capacidades

- Generación de secuencias de ADN autoregresivas a nivel de 6-mer, con contexto de hasta 8.192 tokens (≈ 49 kbp).
- Generación y puntuación a nivel de par de bases mediante la rama `fns` (Factorised Nucleotide Supervision), con control de temperatura y top-p aplicados sobre distribuciones de nucleótido por posición.
- Puntuación de secuencias mediante `score_sequence()`, que devuelve la probabilidad asignada a la base observada en cada posición; la media del logaritmo de probabilidad sirve como puntuación de verosimilitud a nivel de par de bases.
- Decodificación especulativa como modelo borrador: comparte tokenizador y plantilla con Carbon-3B y Carbon-8B, y se integra de forma nativa en Transformers mediante el argumento `assistant_model`, garantizando salida idéntica a la decodificación greedy del modelo objetivo.
- Soporte de plantilla de entrada con etiquetas `<dna>...</dna>` para delimitar secuencias de ADN.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Aceleración de la inferencia de Carbon-3B/Carbon-8B en producción: usar Carbon-500M como modelo borrador en decodificación especulativa reduce el tiempo de reloj de generación sin alterar la salida greedy del modelo objetivo, lo que es adecuado para pipelines que generan secuencias genómicas largas y necesitan latencia baja.
- Generación de secuencias de ADN sintéticas con control exacto de longitud: la rama `fns` permite fijar el número de pares de bases generados y aplicar muestreo a nivel de nucleótido, útil para diseñar fragmentos con longitudes precisas.
- Puntuación y filtrado de secuencias candidatas: `score_sequence()` devuelve la verosimilitud por base, lo que permite ordenar o descartar secuencias generadas por otros modelos en un pipeline de diseño génico.
- Prototipado rápido en entornos con recursos limitados: con 511M parámetros y pesos en bfloat16 (repositorio de 1.0 GB), el modelo cabe en GPU de consumo y permite experimentar con la familia Carbon antes de escalar a 3B u 8B.
- Evaluación de regiones genómicas y splicing: dado que la mezcla de datos incluye ARNm maduro y ARNm enriquecido en sitios de splicing, el modelo puede emplearse para explorar la plausibilidad de transcritos y contextos de empalme, siempre como señal auxiliar y no como predictor validado.
- Integración en flujos de Transformers y Text Generation Inference: al ser un `LlamaForCausalLM` estándar con etiqueta `text-generation-inference` y `endpoints_compatible`, se puede desplegar con las herramientas habituales del ecosistema Hugging Face para servir generación de ADN vía API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que Carbon-500M no está diseñado para ser competitivo con los modelos Carbon de 3B y 8B en benchmarks de tareas downstream; su función es la decodificación especulativa como borrador.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (511.894.528 parámetros × 2 bytes), más memoria para activaciones y caché KV; el repositorio completo ocupa 1.0 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para inferencia en bfloat16; para decodificación especulativa conjunta con Carbon-3B o Carbon-8B hay que sumar la VRAM del modelo objetivo.
- Cabe en GPU de consumo: sí, por tamaño; no se documentan requisitos mínimos oficiales ni GPUs concretas probadas.
- Opciones de despliegiegue: Transformers (con `trust_remote_code=True` para el tokenizador y para la rama `fns`), Text Generation Inference (etiqueta `text-generation-inference`), y endpoints compatibles. No se documentan variantes GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. La model card afirma que la decodificación especulativa con Carbon-3B/8B reduce el coste de generación en tiempo de reloj sin pérdida de calidad, pero no proporciona cifras de speedup.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Carbon-500M | 511.894.528 | 8.192 tokens (≈ 49 kbp) | Modelo borrador para decodificación especulativa | Apache 2.0 | Hugging Face (`hellnahbru/Carbon-500M-preserved-20261029`) |
| Carbon-3B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo objetivo de generación de ADN | no disponible en la informacion proporcionada | Hugging Face (`HuggingFaceBio/Carbon-3B`) |
| Carbon-8B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo objetivo de generación de ADN | no disponible en la informacion proporcionada | Hugging Face (`HuggingFaceBio/Carbon-8B`) |

No se dispone de datos de benchmarks ni de especificaciones completas de Carbon-3B y Carbon-8B en la información proporcionada, por lo que la comparación se limita a la función declarada y a la disponibilidad.

## Limitaciones y advertencias

- El modelo no está diseñado para competir con Carbon-3B ni Carbon-8B en benchmarks downstream; usarlo como generador principal de ADN puede dar resultados de menor calidad que los modelos mayores.
- Contexto limitado a 8.192 tokens (≈ 49 kbp) y sin etapa de entrenamiento de contexto largo; secuencias más largas requieren truncado o ventanas.
- Idiomas soportados limitados a ADN y al componente de texto en inglés del tokenizador híbrido; no se documenta soporte multilingüe general.
- Riesgo de alucinación en secuencias generadas: no se documentan métricas de fidelidad biológica ni validación experimental de las secuencias producidas.
- Sesgos conocidos: no disponibles; la mezcla de datos (genes eucariotas, ARNm, genomas bacterianos de GTDB) puede sesgar la distribución hacia esas categorías.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad biológica de las secuencias generadas.
- La rama `fns` requiere `trust_remote_code=True` y código de modelado personalizado, lo que añade superficie de riesgo en producción.
- El identificador del repositorio (`preserved-20261029`) y la fecha de creación (2026-10-29) sugieren una copia preservada de un modelo de la familia Carbon; conviene verificar la procedencia y la integridad de los pesos antes de usarlo en producción.
- No se documentan variantes cuantizadas ni soporte en llama.cpp/Ollama, lo que limita el despliegue en entornos sin Transformers o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hellnahbru/Carbon-500M-preserved-20261029
- Model card de Carbon-3B (referencia de tokenizador y uso): https://huggingface.co/HuggingFaceBio/Carbon-3B
- Model card de Carbon-8B: https://huggingface.co/HuggingFaceBio/Carbon-8B
- Informe técnico de Carbon (PDF): https://huggingface.co/HuggingFaceBio/Carbon-3B/blob/main/tech-report.pdf
