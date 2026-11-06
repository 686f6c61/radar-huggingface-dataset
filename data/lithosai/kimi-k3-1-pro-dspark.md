# LithosAI/Kimi-K3.1-Pro-DSpark

## Resumen

Kimi-K3.1-Pro-DSpark es un modelo borrador (draft model) desarrollado por LithosAI para acelerar la inferencia de Kimi-K3.1-Pro, el modelo de lenguaje de gran escala de Moonshot AI. No es un modelo generativo autónomo: es una cabeza DSpark que se acopla al modelo objetivo para implementar decodificación especulativa sin pérdida (lossless speculative decoding). En cada paso de decodificación lee los estados ocultos que el modelo objetivo ya ha calculado, propone un bloque de tokens en una pasada paralela y el modelo objetivo verifica ese bloque en un único forward pass. Los tokens aceptados provienen de la distribución del propio modelo objetivo, por lo que la salida es idéntica a la de Kimi-K3.1-Pro y solo cambia la velocidad.

El modelo tiene 2.249.289.601 parámetros en BF16 (un único archivo safetensors, 4,5 GB de repositorio) y se compone de 5 capas decoder densas con tamaño oculto 7168 y FFN SwiGLU de 14336. Emplea atención grouped-query con 64 cabezas de consulta y 16 cabezas KV de dimensión 64, con atención bidireccional dentro del bloque borrador. Se apoya en los estados ocultos de las capas 7, 23, 67, 83 y 91 (de 93) del modelo objetivo, fusionados mediante una proyección lineal, y añade una cabeza Markov de bajo rango (rango 256) para modelar la dependencia entre tokens consecutivos del bloque, además de una cabeza de confianza que estima la aceptación por posición.

Su relevancia es práctica: con un tamaño de bloque de 8 alcanza una longitud media de aceptación de 3,448 sobre 10 benchmarks públicos y 3,281 en prompts AA-LCR de 95K tokens, lo que se traduce en una reducción directa del número de pasos de verificación en despliegues de Kimi-K3.1-Pro. Está diseñado para motores de inferencia como SGLang y vLLM, y no está pensado para inferencia directa (la model card marca `inference: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red borradora DSpark: 5 capas decoder densas, hidden size 7168, FFN SwiGLU 14336, GQA (64 cabezas Q, 16 KV, dim 64), atención bidireccional intra-bloque, cabeza Markov de bajo rango (rango 256) y cabeza de confianza |
| Parametros totales | 2.249.289.601 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Posiciones YaRN con factor 16 sobre 65.536; 1.048.576 posiciones configuradas |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, con LICENSE propio) |
| Formato de pesos | safetensors (un único archivo, BF16) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza borradora específica para decodificación especulativa, no un transformer generativo convencional. Consta de 5 capas decoder densas con hidden size 7168 y FFN SwiGLU de 14336. La atención es grouped-query con 64 cabezas de consulta y 16 cabezas KV de dimensión 64, y opera de forma bidireccional dentro del bloque borrador. La entrada no es solo el contexto de tokens: el modelo consume los estados ocultos de las capas 7, 23, 67, 83 y 91 (de un total de 93) del modelo objetivo Kimi-K3.1-Pro, los concatena y los fusiona con una proyección lineal. El motor de inferencia lee `dflash_config.target_layer_ids` desde `config.json` para exportar esas cinco capas objetivo al borrador.

Sobre esa base se añaden dos componentes clave. Una cabeza Markov de bajo rango (rango 256) condiciona cada token borrador respecto al anterior, capturando la dependencia secuencial dentro del bloque. Una cabeza de confianza proporciona una estimación de aceptación por posición que sirve como señal de planificación al motor. El modelo comparte con el objetivo el embedding de tokens y la LM head, que no se almacenan en este repositorio. El tamaño de bloque es 8: cada paso verifica 8 tokens (el actual más 7 borradores). No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO en el ajuste de la cabeza.

## Capacidades

- Decodificación especulativa sin pérdida: propone bloques de tokens que el modelo objetivo verifica, garantizando que la salida sea exactamente la de Kimi-K3.1-Pro.
- Generación de borradores en una pasada paralela por paso de decodificación, con verificación en un único forward pass del objetivo.
- Modelado de dependencia intra-bloque mediante cabeza Markov de bajo rango (rango 256).
- Estimación de aceptación por posición mediante cabeza de confianza, útil para planificación del motor.
- Soporte de contexto largo: posiciones YaRN con 1.048.576 configuradas y evaluación en prompts de hasta 95K tokens (AA-LCR).
- Integración con motores SGLang y vLLM.
- No soporta tool calling, function calling, agentes ni visión por sí mismo: hereda las capacidades del modelo objetivo, pero su función es exclusivamente acelerar la decodificación.
- Capacidades multilingües: no disponibles como capacidad propia; la evaluación SPEED-Bench incluye una categoría multilingüe con acc_len 3,421.

## Casos de uso

- Aceleración de despliegues de Kimi-K3.1-Pro en producción: integrado en SGLang o vLLM, reduce el número de pasos de verificación por token generado, lo que se traduce en menor latencia y mayor throughput sin alterar las salidas. Es adecuado porque la verificación garantiza fidelidad exacta al modelo objetivo.
- Servicio de chat multi-turno de baja latencia: con acc_len medio de 3,078 en MT-Bench, el modelo borrador mantiene una tasa de aceptación razonable en conversaciones, reduciendo el coste por turno en comparación con decodificación autoregresiva pura.
- Generación de código en pipelines de CI/CD: en HumanEval y MBPP alcanza acc_len de 3,685 y 3,474 respectivamente, por lo que acelera la generación de parches y funciones en herramientas de desarrollo integradas.
- Razonamiento matemático y científico en asistentes especializados: GSM8K (5,136) y MATH-500 (4,365) muestran alta aceptación en dominios estructurados, idóneo para tutores o verificadores que generan cadenas de razonamiento largas.
- Procesamiento de documentación extensa y RAG: con 95K tokens de media en AA-LCR y acc_len 3,281, acelera la generación sobre contextos largos en sistemas de recuperación aumentada.
- Resumen y redacción asistida: la categoría de summarization de SPEED-Bench registra acc_len 3,223, adecuado para herramientas que condensan documentos o generan borradores editoriales.
- Ingeniería de software asistida: SWE-bench Pro con acc_len 2,814 permite acelerar la generación de parches sobre repositorios reales en entornos de desarrollo.

## Benchmarks y rendimiento

Resultados de aceptación del modelo borrador (no son métricas de calidad del modelo objetivo). Longitud de aceptación `L = C / V`, máximo 8 con bloque de 8; temperatura 1,0, top-p 0,95; Kimi-K3.1-Pro en un nodo de 8x B300, tensor parallel 8, KV cache FP8.

| Dominio | Benchmark | Prompts | Max tokens | acc_len | Pooled |
|---|---|---:|---:|---:|---:|
| Matemáticas | GSM8K | 1.319 | 1.024 | 5,136 | 4,760 |
| Matemáticas | MATH-500 | 500 | 2.048 | 4,365 | 3,753 |
| Matemáticas | AIME 2026 | 30 | 4.096 | 2,967 | 2,796 |
| Ciencia | GPQA Diamond | 198 | 4.096 | 3,022 | 2,794 |
| Código | HumanEval | 164 | 1.024 | 3,685 | 3,490 |
| Código | MBPP | 974 | 1.024 | 3,474 | 3,330 |
| Ingeniería de software | SWE-bench Pro | 642 | 2.048 | 2,814 | 2,784 |
| Chat | MT-Bench | 80 | 1.024 | 3,078 | 2,605 |
| Mixto (11 categorías) | SPEED-Bench qualitative | 880 | 1.024 | 3,033 | 2,835 |
| Baja entropía, 10K tokens | SPEED-Bench throughput | 512 | 1.536 | 2,909 | 2,855 |
| — | Media de los 10 benchmarks | — | — | 3,448 | — |

SPEED-Bench qualitative por categoría (80 prompts cada una):

| Categoría | acc_len | Pooled |
|---|---:|---:|
| Multilingüe | 3,421 | 3,214 |
| RAG | 3,402 | 3,152 |
| Matemáticas | 3,323 | 2,975 |
| Código | 3,266 | 3,193 |
| Resumen | 3,223 | 3,191 |
| Roleplay | 2,936 | 2,879 |
| QA | 2,911 | 2,764 |
| Razonamiento | 2,909 | 2,853 |
| STEM | 2,846 | 2,805 |
| Humanidades | 2,805 | 2,726 |
| Redacción | 2,322 | 2,243 |

Contexto largo:

| Benchmark | Prompts | Tokens de prompt | Max tokens | acc_len | Pooled |
|---|---:|---|---:|---:|---:|
| AA-LCR | 100 | 95K media (71K-115K) | 1.024 | 3,281 | 3,198 |

Todas las 5.399 peticiones de la evaluación se completaron con éxito. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como métrica de corrección, etc.) en la información disponible, ya que el modelo no genera respuestas de forma autónoma.

## Requisitos de hardware

- VRAM estimada para el borrador: en BF16, 2.249.289.601 parámetros ocupan aproximadamente 4,5 GB de pesos; con overhead de activaciones y caché KV del borrador, se recomienda reservar al menos 6-8 GB adicionales sobre la memoria del modelo objetivo.
- El borrador no sustituye al modelo objetivo: Kimi-K3.1-Pro debe estar cargado en paralelo. La evaluación de referencia se realizó en un nodo de 8x B300 con tensor parallel 8 y KV cache FP8.
- GPU recomendadas para el conjunto: nodos multi-GPU de clase B300, H100 o A100 para el modelo objetivo; el borrador en sí puede residir en una GPU dedicada adicional o compartir memoria.
- Cabe en GPU consumer: el borrador (4,5 GB en BF16) podría residir en una RTX 4090 de 24 GB, pero el modelo objetivo Kimi-K3.1-Pro no cabe en una GPU consumer, por lo que el despliegue completo no es viable en hardware de consumo.
- Opciones de despliegue: SGLang y vLLM son los motores soportados según los tags del repositorio. No se indica soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia o tokens por segundo en la información disponible; el beneficio se mide en longitud de aceptación (media 3,448), que reduce proporcionalmente el número de pasos de verificación.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre otros modelos borradores DSpark o cabezas de decodificación especulativa comparables (por ejemplo, EAGLE, Medusa o cabezas borradoras para otros objetivos) con los que establecer una comparación cuantitativa de parámetros, contexto, rendimiento o licencia. Los datos disponibles solo permiten comparar el propio modelo consigo mismo en distintos benchmarks.

| Modelo | Parámetros | Contexto | acc_len media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-DSpark | 2,25B | 1.048.576 posiciones (YaRN) | 3,448 (10 benchmarks) | kimi-k3.1-pro (other) | Hugging Face (LithosAI) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo autónomo: la model card marca `inference: false`; requiere Kimi-K3.1-Pro cargado y un motor compatible (SGLang o vLLM) para funcionar.
- Dependencia estricta del modelo objetivo: solo funciona con Kimi-K3.1-Pro y con las capas 7, 23, 67, 83 y 91 exportadas; no es portable a otros modelos sin reentrenamiento.
- Comparte embedding de tokens y LM head con el objetivo, que no se almacenan en este repositorio; su ausencia impide un uso aislado.
- La licencia es `other` con nombre `kimi-k3.1-pro` y un archivo LICENSE propio; deben revisarse las restricciones de uso comercial antes de desplegarlo en producción, ya que no es una licencia estándar permisiva.
- Riesgo de alucinación: no aplica directamente al borrador, ya que los tokens aceptados provienen de la distribución del objetivo; la fidelidad de salida es la del modelo objetivo.
- Sesgos: no se documentan sesgos propios en la información disponible; hereda los del modelo objetivo.
- Idiomas soportados: no disponibles como dato explícito; la evaluación incluye una categoría multilingüe con acc_len 3,421, pero no se detalla la lista de idiomas.
- Rendimiento variable por dominio: la aceptación cae en redacción (2,322) y roleplay (2,936) frente a matemáticas (5,136 en GSM8K), por lo que la aceleración efectiva depende del tipo de carga de trabajo.
- Cuantización: no se documentan tipos de cuantización soportados; los pesos se publican en BF16 y el uso de cuantizaciones podría afectar a la tasa de aceptación.
- Contexto: aunque se configuran 1.048.576 posiciones con YaRN, la evaluación en contexto largo se limita a prompts de hasta 115K tokens (AA-LCR), por lo que el rendimiento más allá de ese rango no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LithosAI/Kimi-K3.1-Pro-DSpark
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia: LICENSE (incluido en el repositorio, no se proporciona URL directa en la información disponible)
- SGLang: no se proporciona URL en la información disponible
- vLLM: no se proporciona URL en la información disponible
- Paper, blog o demo: no disponible en la información proporcionada
