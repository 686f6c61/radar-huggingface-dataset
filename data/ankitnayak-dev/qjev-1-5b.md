# AnkitNayak-dev/QJev-1.5B

## Resumen

QJev-1.5B es un modelo derivado de Qwen/Qwen2.5-1.5B-Instruct desarrollado por AnkitNayak-dev (publicado también bajo el alias devankit7873) que sustituye la generación autoregresiva de texto por una cabeza MLP de clasificación calibrada acoplada a la representación oculta final del transformer base. En lugar de producir tokens que luego se parsean, el modelo calcula en un único forward pass una distribución de probabilidad normalizada sobre hasta 10 acciones candidatas, con una latencia declarada de aproximadamente 31 ms por decisión en hardware de consumo. El problema que aborda es el coste y la varianza de muestreo de usar LLM generativos como motores de decisión en agentes y pipelines automatizados.

El modelo se presenta como un "System 1 decision engine" orientado a la evaluación de valor esperado conjunto (joint expected value, JEV) y se evalúa con el arnés metamórfico JevBench. Con 1.543.714.304 parámetros reales en safetensors, se posiciona como la propuesta sub-2B con mayor puntuación estricta (62,53% con tolerancia 0,05) según la tabla publicada en su model card, por delante de modelos de 2B como pjev-2b (56,5%) y de algunos de 4B como decision-4b-v12 (60,4%).

Su relevancia actual radica en la creciente demanda de componentes de decisión rápidos y deterministas dentro de arquitecturas de agentes, donde la latencia de 300-600 ms por paso generativo limita la viabilidad de bucles multi-paso. La licencia Apache 2.0 y el tamaño contenido lo hacen desplegable en GPU de consumo, aunque su especialización es estrecha: no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza MLP de clasificación calibrada acoplada a la representación oculta final |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | FP16 (fused completo, 3,08 GB), NF4 4-bit (1,15 GB), adaptador LoRA PEFT (20 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,54B parámetros, y le acopla una cabeza MLP de decisión sobre la última representación oculta. La salida no es texto sino una distribución de probabilidad calibrada sobre un conjunto dinámico de entre 2 y 10 opciones, aplicando enmascaramiento dinámico de logits según la cardinalidad del conjunto de candidatos. Esto elimina la decodificación autoregresiva y el parseo posterior de formato, con la consiguiente reducción de latencia y de varianza de muestreo.

El ajuste se realizó mediante QLoRA sobre el dataset SargeDev/jev-distill-corpus-v3. La model card describe tres fases de entrenamiento, de las cuales la fase 3 introduce una pérdida de consistencia simétrica entre formatos (soft-target symmetric cross-format consistency loss), diseñada para estabilizar las predicciones frente a permutaciones de opciones, reformulaciones booleanas y subconjuntos agrupados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo etapas adicionales de RLHF o DPO más allá del ajuste supervisado con destilación.

## Capacidades

- Clasificación de decisiones multiclase sobre 2 a 10 opciones candidatas en un único forward pass, devolviendo una distribución de probabilidad normalizada en lugar de texto.
- Evaluación de valor esperado conjunto (JEV) en escenarios con múltiples alternativas, orientada a la selección de acciones.
- Modo "System 1": respuestas rápidas y deterministas sin muestreo estocástico ni decodificación especulativa.
- Soporte de cardinalidad dinámica de opciones mediante enmascaramiento de logits, lo que permite reutilizar el mismo modelo con distintos tamaños de conjunto de elección.
- Robustez metamórfica frente a cambios de formato de prompt (MCQ, booleano, ordinal), renombrado de claves de opción y perturbaciones sintácticas, reforzada por la pérdida de consistencia de fase 3.
- Integración con el ecosistema transformers y con text-embeddings-inference según los tags del repositorio; endpoints compatibles declarados.
- Capacidades multilingües: no disponibles (no especificadas).
- No se declaran capacidades de tool calling, visión, audio ni generación de texto libre en la información proporcionada.

## Casos de uso

- Enrutamiento de acciones en agentes: dado un estado descrito en el prompt y un conjunto de 2 a 10 acciones posibles, el modelo devuelve la distribución de probabilidad sobre cada una en ~31 ms, lo que permite bucles de decisión de alta frecuencia sin el coste de una generación autoregresiva completa.
- Selección de herramientas en pipelines de function calling: en lugar de generar la llamada como texto y parsearla, se presentan las herramientas disponibles como opciones y se elige la más probable, reduciendo errores de formato y latencia.
- Triaje y clasificación de tickets o incidencias: con etiquetas como opciones candidatas, el modelo asigna probabilidades calibradas que permiten umbralizar y derivar a revisión humana los casos de baja confianza.
- Filtrado previo en sistemas RAG: decidir entre "responder con el contexto recuperado", "recuperar más documentos" o "abstenerse" como conjunto de opciones, aprovechando la calibración para detectar incertidumbre.
- Evaluación A/B y control de políticas: como componente de decisión determinista en simulaciones o entornos de refuerzo, donde la reproducibilidad y la baja latencia importan más que la expresividad del lenguaje.
- Moderación y gating binario: usar la variante de decisión booleana (2 opciones) como clasificador rápido de admisión o rechazo en flujos de contenido, con la ventaja de una latencia de decenas de milisegundos por elemento.
- Despliegue en el borde o en GPU de consumo: la variante NF4 de 1,15 GB permite ejecutar el motor de decisión en tarjetas con 4-8 GB de VRAM, integrándolo junto a otros componentes del pipeline.

## Benchmarks y rendimiento

Los resultados publicados en la model card, evaluados con el arnés JevBench (jevbench-mini, 240 casos, 50 relaciones puntuadas, 1.468 ensayos) bajo criterio estricto de tolerancia 0,05, son los siguientes:

| Modelo | Parametros | Puntuacion oficial (tol=0,05) | Categoria | Latencia | Huella de memoria |
|---|---|---|---|---|---|
| EXAONE-1.2B | 1,2B | 47,7% | Sub-2B | ~25 ms | ~2,8 GB |
| SargeDev/jev-gate-student-b | 0,49B | 50,2% | Sub-2B (solo binario) | ~23 ms | ~1,5 GB |
| decision-2b | 2,0B | 54,8% | 2B | ~40 ms | ~4,5 GB |
| pjev-2b | 2,0B | 56,5% | 2B | ~38 ms | ~4,4 GB |
| **QJev-1.5B (fase 3)** | **1,54B** | **62,53%** | **Sub-2B** | **~31 ms** | **3,4 GB (1,07 GB en 4-bit)** |
| jiwo-4b | 4,0B | 60,2% | 4B | ~65 ms | ~8,8 GB |
| decision-4b-v12 | 4,0B | 60,4% | 4B | ~62 ms | ~8,5 GB |
| autotrust/JEV-9B | 9,0B | 72,0% | 9B | ~85 ms | ~18,5 GB |
| autotrust/JEV-27B | 27,0B | 76,5% | Datacenter | ~220 ms | ~55,0 GB |

Desglose de consistencia metamórfica (fase 3 frente a línea base sin consistencia):

| Dimension | Baseline | QJev-1.5B (fase 3) | Delta |
|---|---|---|---|
| BAT.isolation | 100,0% | 100,0% | 0,0% |
| REP.type | 77,1% | 83,3% | +6,2% |
| REP.invariance | 73,2% | 74,4% | +1,2% |
| LOG.bounds | 62,5% | 67,9% | +5,4% |
| CHO.conditioning | 41,7% | 56,9% | +15,2% |
| REP.equivariance | 48,6% | 55,6% | +7,0% |
| MEA.partition | 30,7% | 41,1% | +10,4% |
| Global (estricto 0,05) | 58,67% | 62,53% | +3,86% |

Bajo evaluación relajada (tolerancia 0,10) el modelo alcanza 71,50%. No se publican resultados en benchmarks estándar de lenguaje como MMLU, HumanEval o GSM8K, coherente con su naturaleza de clasificador de decisión.

## Requisitos de hardware

- VRAM estimada: ~3,4 GB en FP16 (fused completo, 3,08 GB en disco) y ~1,07-1,15 GB en NF4 4-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la variante 4-bit; 8 GB o más para FP16. Una RTX 4090, A100 o H100 ejecutan el modelo con holgura y permiten mayor paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070/4080/4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference según los tags, y endpoints compatibles. Para la variante LoRA, despliegue con PEFT. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~31 ms por decisión (~32 decisiones por segundo por dispositivo) según el autor. La variante 4-bit debería reducir el consumo de memoria sin cambios significativos de latencia, aunque no se publican cifras específicas para esa variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench estricto (0,05) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QJev-1.5B | 1,54B | no disponible | 62,53% | Apache 2.0 | Hugging Face (fused, LoRA, 4-bit) |
| pjev-2b | 2,0B | no disponible | 56,5% | no disponible | Hugging Face |
| decision-2b | 2,0B | no disponible | 54,8% | no disponible | Hugging Face |
| decision-4b-v12 | 4,0B | no disponible | 60,4% | no disponible | Hugging Face |
| autotrust/JEV-9B | 9,0B | no disponible | 72,0% | no disponible | Hugging Face |

Frente a los modelos de 2B de la misma categoría, QJev-1.5B obtiene una puntuación superior con menos parámetros y menor latencia declarada. Frente a los modelos de 4B, supera ligeramente a decision-4b-v12 (60,4%) y a jiwo-4b (60,2%) con un tercio del tamaño. Solo los modelos de 9B y 27B de autotrust lo superan en precisión, a costa de un orden de magnitud más de memoria y latencia.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM de propósito general; no genera texto libre ni mantiene conversaciones multi-turno. Su uso fuera del paradigma de selección entre opciones candidatas no está soportado.
- Sesgos: no se documentan evaluaciones de sesgo demográfico, cultural o lingüístico. Al derivar de Qwen2.5-1.5B-Instruct, puede heredar sesgos del corpus de entrenamiento del modelo base y del corpus de destilación SargeDev/jev-distill-corpus-v3.
- Riesgo de calibración defectuosa: aunque el modelo produce distribuciones calibradas, la consistencia en particiones de opciones (MEA.partition) es solo del 41,1% y la condicionamiento por eliminación de opciones (CHO.conditioning) del 56,9%, lo que indica que la masa de probabilidad puede no conservarse bien al cambiar el conjunto de candidatos. En producción conviene validar la calibración con datos propios.
- Idiomas: no se especifican los idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- Contexto: la longitud de contexto no se documenta explícitamente; se hereda del base Qwen2.5-1.5B-Instruct pero no se confirma en la ficha.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de destilación y del modelo base.
- Madurez: repositorio con pocas descargas (94) y un solo like en el momento de la consulta, creado en noviembre de 2026; no hay evidencia de adopción en producción ni de validación independiente de los benchmarks, que proceden del propio autor y de la plataforma BenchmarkHeaven.
- Sin datos de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K), por lo que no es comparable en tareas generativas con LLM convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkitNayak-dev/QJev-1.5B
- Repositorio GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://jevbench.github.io/
- Leaderboard BenchmarkHeaven: https://benchmarkheaven.com/jev-models
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Variante LoRA (referenciada): https://huggingface.co/devankit7873/QJev-1.5B-LoRA
- Variante 4-bit NF4 (referenciada): https://huggingface.co/devankit7873/QJev-1.5B-4bit
