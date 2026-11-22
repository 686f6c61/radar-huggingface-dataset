# OliverSieberling/triadic-gdn-e4-400m-64k

## Resumen

Triadic Gated DeltaNet (E=4) 400M, 64k es un checkpoint de investigación publicado por Oliver Sieberling (con coautores Runwal, Jin, Chin, Panda y Kim) en el marco del paper *Triadic Linear Attention: Three-Dimensional Recurrent States for Long-Context Sequence Modeling* (arXiv:2609.36529). Se trata de un modelo de lenguaje autorregresivo de tipo decoder-only con atención lineal basada en un estado recurrente tridimensional (la variante "triádica" del Gated DeltaNet), diseñado específicamente para modelado de secuencias largas. El checkpoint concreto corresponde a la configuración E=4 (dimensión de segunda clave igual a 4) y a una ventana de contexto de 64.000 tokens.

El modelo tiene 383.045.120 parámetros reales (según los pesos safetensors), 24 capas, dimensión de modelo 1024 y 8 cabeceras. Emplea el tokenizador de Llama-2 y fue preentrenado sobre 20.000 millones de tokens de FineWeb-Edu con contexto de 4k, para después extender la ventana a 64k mediante un entrenamiento adicional de 2.000 millones de tokens. No dispone de pipeline declarado en Hugging Face, no acumula descargas ni likes y su uso requiere código externo (el repositorio TriadicLinearAttention) y, según la model card, una GPU H100.

Su relevancia es fundamentalmente académica: forma parte de una línea de trabajo que compara arquitecturas de atención lineal con estado recurrente frente a atención cuadrática en tareas de recuperación en contexto largo (PG19, NIAH, Recall). Los resultados publicados por el autor son modestos en términos absolutos, lo que sitúa el checkpoint como material de reproducción de investigación más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención lineal (Triadic Gated DeltaNet, estado recurrente tridimensional, E=4) |
| Parametros totales | 383.045.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.000 tokens (entrenado a 4k y extendido a 64k) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) más config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 24 capas con d_model de 1024 y 8 cabeceras, en el que el mecanismo de atención estándar se sustituye por una atención lineal basada en Gated DeltaNet con estado recurrente "triádico": una formulación que introduce una dimensión de segunda clave (E=4 en este checkpoint) para enriquecer el estado recurrente tridimensional descrito en el paper. El objetivo declarado es mantener coste lineal en la longitud de secuencia conservando capacidad de recuperación asociativa en contextos largos, algo que las variantes puramente recurrentes suelen perder. El tokenizador es el de Llama-2.

El preentrenamiento se realizó sobre 20.000 millones de tokens de FineWeb-Edu con contexto de 4k, seguido de una fase de extensión de contexto de 2.000 millones de tokens hasta 64k. No se documenta en la información disponible si hubo RLHF, DPO, SFT u otras fases de alineación; el checkpoint se presenta como modelo base preentrenado. Tampoco se detalla la composición exacta del dataset más allá de FineWeb-Edu ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto autorregresiva en inglés a partir de pesos base preentrenados.
- Modelado de secuencias largas: ventana de 64.000 tokens, con entrenamiento específico de extensión de 4k a 64k.
- Recuperación en contexto largo: evaluación reportada en PG19 (segmentos ≤4k, 4k–16k y 16k–64k), NIAH (needle-in-a-haystack) y Recall.
- Razonamiento y conocimiento factual de tipo 0-shot, evaluado mediante WikiText y una métrica 0-shot no detallada en la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües limitadas al inglés según el campo `language: en`; no se declaran otros idiomas.
- No se documenta pipeline de Hugging Face ni integración con librerías de inferencia estándar.

## Casos de uso

- Reproducción de resultados de investigación: cargar el checkpoint con el código de TriadicLinearAttention y evaluar WikiText, PG19, NIAH y Recall para verificar las cifras publicadas (seed 1337). Es el uso principal dado que el modelo es un artefacto de paper.
- Estudio comparativo de arquitecturas de atención lineal: usar este checkpoint como línea base E=4 frente a variantes puras de Triadic GDN o de Gated DeltaNet en experimentos controlados de contexto largo, aprovechando que comparte tokenizador Llama-2 y escala de 400M.
- Análisis de degradación por longitud de contexto: evaluar perplexidad en tramos PG19 de ≤4k, 4k–16k y 16k–64k para medir cuánto rendimiento se pierde al alejarse del contexto de preentrenamiento original de 4k.
- Investigación sobre recuperación asociativa: utilizar las métricas NIAH y Recall para estudiar la capacidad del estado recurrente triádico de retener información dispersa en ventanas de hasta 64k tokens.
- Experimentos de extensión de contexto: partir de este checkpoint de 64k como referencia para probar técnicas de extensión adicionales (por ejemplo, hasta 256k, como menciona la literatura relacionada) y comparar curvas de perplexidad.
- Docencia y divulgación técnica: ilustrar en cursos o artículos cómo se implementa y evalúa una atención lineal con estado recurrente, dado que el repositorio de código y los pesos son abiertos bajo licencia MIT.
- Fine-tuning exploratorio en inglés: al ser un modelo base de 383M con licencia MIT, puede servir como punto de partida para ajustes supervisados de bajo coste en tareas de modelado de texto, siempre que se disponga de infraestructura compatible con el código del autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (seed 1337, 0-shot):

| Metrica | Valor |
|---|---|
| 0-shot (metrica no detallada) | 53.4 |
| WikiText | 10.89 |
| PG19 ≤4k | 14.78 |
| PG19 4k–16k | 14.05 |
| PG19 16k–64k | 13.76 |
| Recall | 32.1 |
| NIAH | 23.0 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos en MMLU, HumanEval, GSM8K ni tablas de comparación frente a alternativas. La búsqueda web menciona un resultado aislado de un trabajo relacionado (Latent Lattice Language Models) según el cual un "64K Lattice Triadic GDN" supera a un "256K pure Triadic GDN" (15.98 frente a 15.98/16.11 en el fragmento citado), pero el dato está incompleto y no permite atribuir cifras fiables a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (probablemente fp32/bf16 según los pesos): en torno a 1,5 GB para pesos en bf16 (383M parámetros ≈ 0,77 GB) más estados recurrentes, activaciones y overhead; el repo pesa 1,5 GB, lo que sugiere pesos en fp32 o múltiples precisiones.
- GPU recomendada por el autor: H100 (la model card indica explícitamente "Requires an H100").
- Compatibilidad con GPU de consumo: por tamaño de parámetros cabría en GPUs consumer (RTX 4090, 4080, 3090), pero el requisito de código custom y la advertencia del autor sobre H100 hacen que no haya garantía de funcionamiento en consumer; no se documenta soporte.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers estándar; la carga se realiza manualmente con `safetensors.torch.load_file` y la clase `GPT`/`GPTConfig` del repositorio TriadicLinearAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triadic GDN E=4 400M 64k (este) | 383M | 64k | Atención lineal con estado recurrente triádico | MIT | Pesos safetensors, código externo |
| Variantes puras de Triadic GDN (paper) | ~400M (escala comparable, no detallada) | hasta 256k según literatura relacionada | Atención lineal triádica sin dimensión E | no disponible | no disponible |
| Gated DeltaNet base (referencia conceptual) | no disponible | no disponible | Atención lineal con delta rule | no disponible | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia de modelos comparables de terceros (por ejemplo, Mamba, RWKV o variantes de Gated DeltaNet de otros autores), por lo que la comparativa cuantitativa se limita a variantes del mismo paper.

## Limitaciones y advertencias

- Modelo base preentrenado sin alineación documentada: no se declara SFT, RLHF ni DPO, por lo que no debe usarse directamente como asistente conversacional en producción.
- Resultados absolutos modestos: NIAH de 23.0 y Recall de 32.1 indican capacidad de recuperación en contexto largo limitada; la perplexidad PG19 se degrada ligeramente al aumentar la longitud (14.78 → 13.76, valores no directamente comparables entre métricas).
- Solo inglés: el campo de idioma declara `en`; no hay evidencia de competencia multilingüe.
- Riesgo de alucinación: al ser un LM preentrenado de 383M sobre FineWeb-Edu, la generación factual no verificada es esperable; no se documentan mitigaciones.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus FineWeb-Edu está filtrado con criterios educativos que pueden introducir sesgos de dominio y de representación.
- Dependencia de código propietario: requiere el repositorio TriadicLinearAttention y la clase `GPT`/`GPTConfig`; no hay integración con transformers, vLLM o llama.cpp, lo que limita el despliegue estándar.
- Requisito de hardware declarado: el autor indica H100; el funcionamiento en otras GPUs no está verificado.
- Licencia MIT: permite uso comercial y modificación, pero al ser un checkpoint de investigación sin garantías de calidad, su uso comercial en producción conlleva riesgo técnico y de calidad no cuantificado.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validación por terceros.
- Fecha de creación futura respecto a referencias habituales (2026-11-22) y número arXiv igualmente futuro (2609.36529): conviene verificar la disponibilidad efectiva del paper y del repositorio antes de basar trabajo en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e4-400m-64k
- Paper (arXiv): https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
- Trabajo relacionado citado en la búsqueda web (Latent Lattice Language Models): https://arxiv.org/html/2611.21608v1
