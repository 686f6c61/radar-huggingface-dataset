# nmuendler/DeepSeek-R1-Distill-Qwen-7B-rust-rlvr-run2-step100

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) de nombre `DeepSeek-R1-Distill-Qwen-7B-rust-rlvr-run2-step100`, publicado por el usuario nmuendler. No se trata de un modelo completo, sino de pesos de adaptador que deben cargarse sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. El nombre del repositorio sugiere un entrenamiento con aprendizaje por refuerzo con recompensas verificables (RLVR) sobre tareas de Rust, mediante GRPO, y el sufijo `step100` indica que se trata de un checkpoint intermedio del paso 100 de una ejecución concreta (`run2`).

El interés de esta ficha es limitado pero concreto: sirve como ejemplo reproducible de un ciclo de RLVR sobre un modelo de razonamiento destilado de 7.000 millones de parámetros, y como material de partida para quienes investigan cómo el ajuste con recompensas verificables afecta a la generación de código en un lenguaje de tipado estricto como Rust. El modelo base pertenece a la familia DeepSeek-R1-Distill, destilada por DeepSeek a partir de DeepSeek-R1 sobre la arquitectura Qwen2 (7,62 B de parámetros, contexto de 131.072 tokens en configuración).

La información publicada es mínima: la model card es la plantilla vacía de HuggingFace, sin licencia declarada para el adaptador, sin idiomas documentados, sin datos de entrenamiento, sin evaluación y con 0 descargas y 0 likes en el momento de la consulta. Todo lo que se afirma aquí sobre el adaptador procede del nombre del repositorio y de sus etiquetas; lo relativo a arquitectura y contexto procede de la documentación pública del modelo base, no del autor del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only tipo Qwen2 (Qwen2ForCausalLM) en el modelo base. Rangos y capas objetivo del adaptador: no disponible |
| Parámetros totales | 7,62 B en el modelo base (cifra pública de DeepSeek). Parámetros adicionales del adaptador: no disponible (repositorio de 0,3 GB, incluye optimizador y otros artefactos) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens según la configuración del modelo base (DeepSeek recomienda limitar la generación a 32.768 tokens). No confirmado para el adaptador |
| Tipos de cuantización | No disponible para el adaptador (se distribuye en safetensors). El modelo base admite cuantizaciones de la comunidad: GGUF (Q4_K_M, Q5_K_M, Q8_0), AWQ, GPTQ y bitsandbytes de 8 y 4 bits |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés y chino, con cobertura limitada de otras lenguas) |
| Licencia | No disponible para el adaptador. La del modelo base DeepSeek-R1-Distill-Qwen-7B es MIT según su repositorio oficial; conviene verificarla antes de cualquier uso comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), biblioteca `peft`; requiere el modelo base en safetensors o GGUF tras el merge |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen2, con 28 capas, dimensión oculta de 3.584, 28 cabezas de atención y 4 cabezas de clave/valor (atención con consultas agrupadas, GQA), normalización RMSNorm, activación SwiGLU y RoPE. DeepSeek lo obtuvo por destilación: ajuste supervisado sobre aproximadamente 800.000 muestras de razonamiento generadas por DeepSeek-R1, según el informe técnico de DeepSeek-R1. El resultado es un modelo que emite cadenas de razonamiento largas dentro de etiquetas ` thinking` antes de la respuesta final, con temperatura recomendada de 0,6 y top-p de 0,95.

El adaptador de este repositorio se entrenó, según sus etiquetas (`grpo`, `lora`, `trl`), con GRPO (Group Relative Policy Optimization) implementado en la librería TRL, sobre un conjunto de tareas de Rust con recompensas verificables (RLVR): típicamente compilación correcta, paso de pruebas unitarias y comparación con soluciones de referencia. No se especifican el rango LoRA, el alpha, la tasa de aprendizaje, el número de grupos por prompt, la composición del dataset ni la función de recompensa. El sufijo `step100` y `run2` apunta a un barrido de hiperparámetros y a un checkpoint temprano, no a un modelo final optimizado. La versión de PEFT declarada en la model card es 0.19.1.

## Capacidades

- Generación de texto y razonamiento en cadena larga heredados del modelo base, con modo de pensamiento explícito entre etiquetas ` thinking`.
- Generación y reparación de código, presumiblemente orientada a Rust por el nombre del repositorio, aunque no hay evaluación publicada que lo confirme.
- Razonamiento matemático y de competición, capacidad característica de la destilación de DeepSeek-R1 sobre Qwen2.5-Math.
- Razonamiento multi-paso con contexto largo (hasta 131.072 tokens en la configuración del modelo base).
- Capacidad multilingüe limitada: el modelo base está centrado en inglés y chino; el comportamiento en castellano no está documentado para el adaptador.
- Soporte de tool calling / function calling: no documentado en el adaptador ni en la model card.
- Soporte de agentes: no documentado; el modelo base no incluye un formato de herramientas específico.
- Capacidades especiales: modo de pensamiento (thinking mode) heredado del modelo base; visión, audio y otras modalidades no disponibles.
- Capacidad de seguir instrucciones generales: potencialmente degradada por un ajuste con RLVR sobre un dominio estrecho (Rust), efecto no medido aquí.

## Casos de uso

- Generación de código Rust asistida: el adaptador puede desplegarse como variante especializada del modelo base para producir funciones, módulos y pruebas en Rust, aprovechando el modo de razonamiento para descomponer el problema antes de escribir código.
- Reparación de errores del compilador (`cargo build`): dado un mensaje de error del compilador de Rust y el código fuente, el modelo puede razonar sobre las causas y proponer un parche; es un caso alineado con recompensas verificables por compilación.
- Generación de pruebas unitarias y de integración: producir pruebas `#[test]` a partir de firmas de funciones o de especificaciones, un escenario directamente verificable por ejecución y por tanto coherente con el entrenamiento RLVR.
- Investigación sobre RLVR: usar este checkpoint (paso 100) y sus variantes como punto de comparación para estudiar la evolución del rendimiento por paso, el sobreajuste al formato de recompensa y el intercambio entre capacidad general y especialización.
- Construcción de datasets sintéticos de código Rust: generar soluciones candidatas y filtrarlas por compilación y por pruebas para alimentar posteriores iteraciones de entrenamiento.
- Revisión de código en pipelines de CI/CD: integrar el modelo en un bot que comente *pull requests* de proyectos Rust, señalando posibles errores de propiedad (*ownership*), préstamos (*borrowing*) o patrones idiomáticos; requiere validación previa porque no hay métricas publicadas.
- Asistencia educativa en Rust: tutoría paso a paso con razonamiento visible, útil para explicar conceptos como tiempos de vida (*lifetimes*) o rasgos (*traits*), siempre con revisión humana por el riesgo de alucinación.
- Análisis de interoperabilidad con C/C++: apoyo en la redacción de bloques `unsafe` y en la verificación de invariantes al envolver bibliotecas nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor es la plantilla vacía de HuggingFace, sin sección de evaluación, y el repositorio acumula 0 descargas y 0 likes, por lo que no existe validación externa documentada.

Como referencia externa, el modelo base `DeepSeek-R1-Distill-Qwen-7B` sí tiene cifras publicadas en el informe técnico de DeepSeek-R1 (arXiv:2501.12948), pero no han sido verificadas por el autor de esta ficha y no deben atribuirse al adaptador:

| Benchmark | DeepSeek-R1-Distill-Qwen-7B (paper, sin verificar) |
|---|---|
| AIME 2024 (pass@1) | 55,5 |
| MATH-500 (pass@1) | 92,8 |
| GPQA Diamond (pass@1) | 49,1 |
| LiveCodeBench (pass@1-COT) | 37,6 |
| Codeforces (percentil) | 1.189 de puntuación, percentil 88,4 |

Ninguno de estos conjuntos evalúa Rust de forma específica, de modo que no permiten inferir el efecto del adaptador RLVR.

## Requisitos de hardware

- VRAM para inferencia del modelo base en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más caché KV; con 32.768 tokens de contexto y una sola secuencia la caché KV ronda 1,8 GB (28 capas, 4 cabezas KV, dimensión 128), y crece en proporción con el contexto y el tamaño de lote.
- VRAM en cuantización de 8 bits: alrededor de 8 GB de pesos; en 4 bits (GGUF Q4_K_M o bitsandbytes NF4): alrededor de 4,5-5 GB de pesos.
- GPU de gama alta: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente en FP16 con contexto largo y procesamiento por lotes.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16 con contexto moderado, y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) empleando cuantización de 4 u 8 bits.
- Despliegue: vLLM y TGI admiten adaptadores LoRA en caliente sobre el modelo base; alternativamente se puede fusionar el adaptador y convertir a GGUF para llama.cpp, Ollama o LM Studio; Transformers con PEFT es la vía más directa para experimentación.
- CPU: viable únicamente con GGUF cuantizado a 4 bits y expectativas de latencia muy altas; no recomendado para producción.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni hardware de entrenamiento declarado (la sección de infraestructura de la model card está marcada como «More Information Needed»).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Adaptador analizado (nmuendler/…-rust-rlvr-run2-step100) | 7,62 B (base) + adaptador no cuantificado | 131.072 (base) | No disponible | HuggingFace, 0 descargas | Adaptador LoRA sobre el modelo base; sin evaluación |
| DeepSeek-R1-Distill-Qwen-7B | 7,62 B | 131.072 | MIT | HuggingFace, muy descargado | Modelo base; destilado de DeepSeek-R1 con unas 800.000 muestras |
| Qwen2.5-7B-Instruct | 7,61 B | 131.072 | Apache-2.0 | HuggingFace | Alternativa generalista con soporte de herramientas y multilingüismo amplio, pero sin modo de razonamiento largo |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | HuggingFace | Alternativa generalista, ecosistema amplio; licencia con restricciones para grandes despliegues |

La comparación relevante no es de rendimiento —no hay datos— sino de propósito: el adaptador es un artefacto de investigación especializado en Rust, mientras que las alternativas son modelos generalistas listos para producción.

## Limitaciones y advertencias

- Model card vacía: no hay descripción, datos de entrenamiento, hiperparámetros, evaluación ni instrucciones de uso. Cualquier integración exige una validación propia previa.
- Licencia del adaptador no declarada. Aunque el modelo base se publica bajo MIT, la ausencia de licencia explícita en el repositorio genera incertidumbre jurídica para uso comercial.
- Es un adaptador, no un modelo autónomo: sin el modelo base no funciona, y su comportamiento depende por completo de la revisión concreta de `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`.
- Checkpoint intermedio (`step100`) de una segunda ejecución: puede estar infraentrenado y no representa necesariamente el mejor resultado del experimento.
- Riesgo de especialización excesiva: un ajuste RLVR sobre Rust puede degradar capacidades generales, de conversación o multilingües del modelo base; no se ha medido la magnitud de ese olvido catastrófico.
- Riesgo de *reward hacking*: en RLVR con recompensas de compilación o de paso de pruebas, el modelo puede aprender atajos (por ejemplo, código que compila pero no resuelve el problema) sin que ello se detecte en la recompensa.
- Alucinación: como todo modelo de la familia R1, puede inventar APIs, *crates*, firmas de funciones y comportamientos del compilador de Rust, especialmente al citar bibliotecas poco frecuentes.
- Sesgos: hereda los sesgos de los datos de destilación de DeepSeek-R1 y del corpus de Qwen; no hay análisis de sesgo en la información disponible.
- Idiomas: no hay idiomas declarados; el soporte de castellano es el del modelo base, con calidad no garantizada y con posible degradación tras el ajuste.
- Sobreajuste al formato de razonamiento: el modo ` thinking` consume muchos tokens, lo que encarece la inferencia y complica el uso en aplicaciones con latencia estricta.
- Sin soporte documentado de *tool calling* ni de flujos de agente; cualquier integración con herramientas requiere *prompting* manual y validación.
- Advertencia de reproducibilidad: sin datos de entrenamiento ni semillas, el resultado no es reproducible por terceros.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-rust-rlvr-run2-step100
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Informe técnico de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Artículo de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Documentación de TRL: https://huggingface.co/docs/trl
- Documentación de PEFT: https://huggingface.co/docs/peft
- Referencia citada en las etiquetas del repositorio (calculadora de impacto ambiental, no relacionada con el modelo): https://arxiv.org/abs/1910.09700
- Búsqueda web: los resultados recuperados en la búsqueda no guardan relación con el modelo (hilos de foro sobre WhatsApp y publicaciones de Lowyat.NET), por lo que no se incluye ninguno como fuente. No se han encontrado papers, blogs ni demostraciones asociados a este adaptador.
