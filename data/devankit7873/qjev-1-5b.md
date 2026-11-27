# devankit7873/QJev-1.5B

## Resumen

QJev-1.5B es un modelo de decisión ligero de 1.543.714.304 parámetros, afinado a partir de Qwen/Qwen2.5-1.5B-Instruct por el autor devankit7873. No es un modelo generativo al uso: en lugar de producir texto token a token, acopla una cabeza MLP calibrada a la representación oculta final del backbone transformer para emitir, en un único forward pass, una distribución de probabilidad normalizada sobre entre 2 y 10 opciones candidatas. Está orientado a selección estructurada de acciones y enrutamiento dentro de flujos de agentes de IA.

La propuesta resuelve el coste de latencia y la varianza de muestreo de la generación autorregresiva en tareas de decisión. Según la model card, el modelo ejecuta una decisión en aproximadamente 31 ms en GPUs de consumo, lo que equivale a unas 32 decisiones por segundo por instancia, frente a los 300-600 ms que atribuye a la generación token a token. El entrenamiento se basa en QLoRA sobre el corpus SargeDev/jev-distill-corpus-v3 y una fase de regularización de consistencia con pérdida simétrica entre formatos.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y un tamaño de repositorio de 6,2 GB. Está pensado para investigación en decisión eficiente, selección probabilística de acciones y sistemas de agentes de baja latencia, no como sustituto general de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con cabeza MLP de decisión de 2 capas acoplada a la representación oculta final |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No se documentan tipos concretos; la model card reporta 1,07 GB de VRAM en 4-bit |
| Idiomas soportados | Inglés (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone en bfloat16, cabeza MLP en float32) |

## Arquitectura y entrenamiento

El backbone es el transformer decoder-only de Qwen2.5-1.5B-Instruct, sobre el que se añade una cabeza MLP de dos capas que consume la representación oculta final y produce logits enmascarados dinámicamente según el número de opciones (de 2 a 10). La inferencia es de un solo paso: no hay decodificación autorregresiva ni muestreo de secuencia, sino una distribución calibrada directamente sobre las alternativas. El backbone se mantiene en bfloat16 y la cabeza en float32.

El ajuste se realizó con QLoRA sobre el dataset SargeDev/jev-distill-corpus-v3. La model card describe una fase 3 de regularización de consistencia mediante pérdida cruzada simétrica sobre objetivos suaves entre formatos, destinada a estabilizar las decisiones ante permutaciones de opciones, sondas booleanas y subconjuntos engrosados. No se especifican el número de tokens de entrenamiento ni la composición detallada del corpus.

## Capacidades

- Selección estructurada de acciones entre 2 y 10 opciones, con enmascaramiento dinámico de logits según la cardinalidad.
- Salida de distribución de probabilidad calibrada, en lugar de log-probabilidades de secuencia heurísticas.
- Enrutamiento de decisiones en flujos de agentes de IA.
- Razonamiento probabilístico sobre alternativas y clasificación de opciones.
- Estabilidad ante permutaciones de opciones y cambios de formato de prompt (MCQ, booleano, ordinal), según las métricas de consistencia metamórfica reportadas.
- Ejecución de un solo forward pass con latencia declarada de ~31 ms.
- Idiomas: inglés.

No se documentan en la información disponible capacidades de tool calling, generación de código, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de acciones en agentes: dado un estado y un conjunto de herramientas o acciones disponibles, el modelo devuelve la distribución de probabilidad sobre cada una en un único paso, lo que permite al orquestador elegir la acción con menor latencia que un LLM generativo.
- Selección de herramientas en pipelines de automatización: con 2 a 10 candidatos por decisión, encaja en sistemas donde cada paso requiere elegir entre APIs o funciones concretas y el coste por decisión debe ser bajo.
- Triaje y clasificación de tickets: el modelo puede decidir entre categorías predefinidas de un sistema de soporte, aprovechando la calibración de probabilidades para umbralizar derivaciones a revisión humana.
- Control de flujo en sistemas multiagente: selección de la siguiente etapa, agente o rama de un grafo de decisión, con ~32 decisiones por segundo por GPU según la model card.
- Investigación en consistencia de decisiones: las métricas metamórficas (invariancia a permutaciones, formatos y renombrado de opciones) lo hacen útil como banco de pruebas para estudiar estabilidad de modelos de decisión.
- Decisión probabilística de bajo coste en el borde: con 1,07 GB de VRAM en 4-bit, puede desplegarse en GPUs de consumo para tareas de clasificación y selección en tiempo real.
- Evaluación comparativa de modelos de decisión: sirve como referencia ligera frente a modelos de 2B, 4B, 9B y 27B en el harness JevBench.

## Benchmarks y rendimiento

Resultados reportados en la model card (JevBench, `jevbench-mini`, 240 casos, 50 relaciones puntuadas, 1.468 ensayos; tolerancia estricta = 0,05):

| Modelo | Parámetros | Puntuación estricta (tol=0,05) | Estado del benchmark | Latencia | Huella de memoria |
|---|---|---|---|---|---|
| EXAONE-1.2B | 1,2B | 47,7% | Leaderboard publicado | ~25 ms | ~2,8 GB |
| SargeDev/jev-gate-student-b | 0,49B | 50,2% | Leaderboard publicado (binario) | ~23 ms | ~1,5 GB |
| decision-2b | 2,0B | 54,8% | Leaderboard publicado | ~40 ms | ~4,5 GB |
| pjev-2b | 2,0B | 56,5% | Leaderboard publicado | ~38 ms | ~4,4 GB |
| QJev-1.5B (fase 3) | 1,54B | 62,53% | Reproducido localmente (JevBench) | ~31 ms | 3,08 GB disco (1,07 GB VRAM en 4-bit) |
| jiwo-4b | 4,0B | 60,2% | Leaderboard publicado | ~65 ms | ~8,8 GB |
| decision-4b-v12 | 4,0B | 60,4% | Leaderboard publicado | ~62 ms | ~8,5 GB |
| autotrust/JEV-9B | 9,0B | 72,0% | Leaderboard publicado | ~85 ms | ~18,5 GB |
| autotrust/JEV-27B | 27,0B | 76,5% | Leaderboard publicado | ~220 ms | ~55,0 GB |

Bajo tolerancia relajada (0,10), QJev-1.5B alcanza 71,50%. Desglose de consistencia metamórfica (parcial, según la información disponible):

| Dimensión | Baseline | QJev-1.5B (fase 3) | Delta |
|---|---|---|---|
| BAT.isolation | 100,0% | 100,0% | 0,0% |
| REP.type | 77,1% | 83,3% | +6,2% |
| REP.invariance | 73,2% | 74,4% | +1,2% |
| LOG.bounds | 62,5% | 67,9% | +5,4% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos equivalentes en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,07 GB en cuantización 4-bit según la model card; el repositorio ocupa 3,08 GB en disco.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona GPUs de consumo para la latencia de ~31 ms.
- Cabe en GPU de consumo: sí, con 1,07 GB en 4-bit; en bfloat16 requiere aproximadamente el tamaño del backbone (unos 3 GB de pesos).
- Opciones de despliegue: transformers (librería declarada); la etiqueta `text-embeddings-inference` y `endpoints_compatible` figuran en los metadatos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~31 ms por decisión, equivalente a ~32 decisiones por segundo por instancia de GPU, según la configuración de evaluación documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Puntuación JevBench estricta | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QJev-1.5B | 1,54B | 62,53% | ~31 ms | Apache 2.0 | Hugging Face |
| decision-2b | 2,0B | 54,8% | ~40 ms | no disponible | Leaderboard BenchmarkHeaven |
| pjev-2b | 2,0B | 56,5% | ~38 ms | no disponible | Leaderboard BenchmarkHeaven |
| jiwo-4b | 4,0B | 60,2% | ~65 ms | no disponible | Leaderboard BenchmarkHeaven |
| autotrust/JEV-9B | 9,0B | 72,0% | ~85 ms | no disponible | Leaderboard BenchmarkHeaven |

QJev-1.5B supera en puntuación estricta a modelos de 2B y 4B de la misma familia de evaluación, con menor latencia que estos últimos, aunque queda por debajo de los modelos de 9B y 27B. Los datos de licencia y disponibilidad de los competidores no se detallan en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para selección entre 2 y 10 opciones; no es un modelo generativo de texto general.
- Solo soporta inglés según los metadatos; no se documenta cobertura multilingüe.
- La longitud de contexto no está especificada, lo que impide planificar su uso con prompts largos.
- Los resultados de JevBench son reproducidos localmente por el autor; las cifras de los competidores provienen de entradas publicadas del leaderboard, por lo que la comparación no es estrictamente homogénea.
- El harness de evaluación es pequeño (240 casos, 1.468 ensayos), lo que limita la robustez estadística de las puntuaciones.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct y del dataset de destilación antes de un uso comercial en producción.
- La calibración de probabilidades depende de la configuración de evaluación documentada; no se garantiza que se mantenga fuera de ella.
- El repositorio tiene 206 descargas y 1 like, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/devankit7873/QJev-1.5B
- Hugging Face (referenciado en la model card): https://huggingface.co/AnkitNayak-dev/QJev-1.5B
- GitHub (referenciado en la model card): https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://jevbench.github.io/
- Leaderboard BenchmarkHeaven: https://benchmarkheaven.com/jev-models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
