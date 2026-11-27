# AnkitNayak-dev/QJev-1.5B

## Resumen

QJev-1.5B es un modelo de decisión ligero de 1.540 millones de parámetros desarrollado por AnkitNayak-dev, construido sobre el backbone de Qwen2.5-1.5B-Instruct. A diferencia de los modelos generativos convencionales, no produce texto token a token: acopla una cabeza MLP calibrada de dos capas a la representación oculta final del transformer y emite, en un único forward pass, una distribución de probabilidad normalizada sobre un conjunto de 2 a 10 opciones candidatas. Resuelve el problema de la selección estructurada de acciones en flujos de agentes de IA, donde la latencia de muestreo autoregresivo y la varianza de la decodificación resultan problemáticas.

La propuesta es relevante por su perfil de latencia: aproximadamente 31 ms por decisión en GPUs de consumo, lo que equivale a unas 32 decisiones por segundo por instancia, frente a los 300-600 ms típicos de un LLM generativo que debe emitir una respuesta textual. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, y está orientado a investigación en selección probabilística de acciones, enrutado de agentes y razonamiento con opciones discretas.

El modelo se entrenó mediante QLoRA sobre el corpus SargeDev/jev-distill-corpus-v3 y se evaluó con JevBench, un arnés de pruebas metamórficas. Alcanza un 62,53 % en la métrica estricta (tolerancia 0,05) y un 71,50 % en la relajada (tolerancia 0,10). El repositorio ocupa 6,2 GB y acumula 206 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza MLP de decisión de 2 capas acoplada a la representación oculta final |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible de forma explícita; se documenta funcionamiento en 4 bits (1,07 GB de VRAM) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (backbone en bfloat16, cabeza MLP en float32) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen2.5-1.5B-Instruct, un transformer decoder-only denso, y le añade una cabeza MLP de dos capas en float32 que consume la representación oculta final del backbone y proyecta directamente sobre las opciones candidatas. La salida es una distribución de probabilidad calibrada sobre cardinalidades dinámicas de 2 a 10 opciones, con enmascaramiento dinámico de logits. El backbone mantiene sus pesos en bfloat16. Esta separación de precisiones busca preservar la estabilidad numérica de la cabeza de decisión sin encarecer el cómputo del transformer.

El ajuste se realizó con QLoRA sobre el corpus de destilación SargeDev/jev-distill-corpus-v3. La innovación técnica destacable es la regularización de consistencia de la Fase 3, una pérdida simétrica de entropía cruzada sobre objetivos suaves entre formatos (soft-target symmetric cross-format consistency loss), que alinea las predicciones a través de permutaciones de opciones, sondas booleanas y subconjuntos engrosados. Los resultados de consistencia metamórfica reportados muestran mejoras sobre la línea base previa a la consistencia: REP.type pasa de 77,1 % a 83,3 %, LOG.bounds de 62,5 % a 67,9 % y REP.invariance de 73,2 % a 74,4 %, mientras BAT.isolation se mantiene en el 100,0 %. No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Selección estructurada de acciones: emite una distribución de probabilidad calibrada sobre 2 a 10 opciones candidatas en un único forward pass.
- Enrutado de agentes: puede decidir qué herramienta, ruta o sub-agente activar en un flujo multi-paso.
- Razonamiento probabilístico: las salidas son probabilidades directas, no log-probabilidades heurísticas de secuencia.
- Soporte de cardinalidad dinámica: admite desde decisiones binarias hasta elecciones entre 10 opciones mediante enmascaramiento de logits.
- Consistencia entre formatos: mantiene la estabilidad de la decisión ante permutaciones de opciones, reformateos MCQ/booleano/ordinal y renombrado de claves.
- Clasificación de texto: la pipeline declarada es `text-classification`.
- Baja latencia: aproximadamente 31 ms por decisión en GPUs de consumo.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling en el sentido convencional.

## Casos de uso

- Enrutado de herramientas en agentes: dado un mensaje del usuario y un catálogo de 2 a 10 herramientas disponibles, el modelo devuelve la probabilidad de cada una en un solo paso, lo que permite al orquestador seleccionar la herramienta con umbral de confianza configurable y evitar el coste de una generación autoregresiva completa.
- Clasificación de intenciones en atención al cliente: con opciones discretas predefinidas (consulta de facturación, cancelación, soporte técnico, etc.), el modelo decide la categoría en aproximadamente 31 ms, lo que lo hace apto para preclasificar grandes volúmenes de tickets antes de derivarlos a un LLM mayor.
- Puerta de decisión en pipelines multi-agente: como componente de bajo coste que decide si una consulta requiere razonamiento profundo (derivar a un modelo grande) o puede resolverse con una respuesta directa, reduciendo el gasto computacional agregado.
- Moderación y triaje de contenido: selección entre categorías de política (permitido, revisar, bloquear) con probabilidades calibradas que permiten fijar umbrales de revisión humana de forma explícita.
- Decisión binaria de continuación en bucles de agente: determinar si el agente debe seguir ejecutando pasos o detenerse, con una latencia que permite evaluar la condición en cada iteración sin dominar el coste total del bucle.
- Investigación en calibración y consistencia: el modelo y JevBench permiten estudiar propiedades metamórficas de decisión (invariancia a permutaciones, adherencia a cotas probabilísticas) con un coste de inferencia bajo y reproducible en hardware de consumo.
- Evaluación A/B de políticas de selección: al devolver distribuciones calibradas en lugar de una única etiqueta, permite comparar políticas de decisión y medir divergencias (TVD, KL) sobre las mismas entradas.

## Benchmarks y rendimiento

Resultados reportados por el autor con el arnés JevBench (`jevbench-mini`, 240 casos de evaluación, 50 relaciones puntuadas, 1.468 ensayos). Las cifras de los modelos externos provienen de entradas publicadas en el leaderboard de BenchmarkHeaven; la de QJev-1.5B es reproducción local.

| Modelo | Parametros | Estricto (tol=0,05) | Latencia | Huella de memoria |
|---|---|---|---|---|
| EXAONE-1.2B | 1,2B | 47,7 % | ~25 ms | ~2,8 GB |
| SargeDev/jev-gate-student-b | 0,49B | 50,2 % (binario) | ~23 ms | ~1,5 GB |
| decision-2b | 2,0B | 54,8 % | ~40 ms | ~4,5 GB |
| pjev-2b | 2,0B | 56,5 % | ~38 ms | ~4,4 GB |
| jiwo-4b | 4,0B | 60,2 % | ~65 ms | ~8,8 GB |
| decision-4b-v12 | 4,0B | 60,4 % | ~62 ms | ~8,5 GB |
| **QJev-1.5B (Fase 3)** | **1,54B** | **62,53 %** | **~31 ms** | **3,08 GB disco / 1,07 GB VRAM en 4 bits** |
| autotrust/JEV-9B | 9,0B | 72,0 % | ~85 ms | ~18,5 GB |
| autotrust/JEV-27B | 27,0B | 76,5 % | ~220 ms | ~55,0 GB |

En evaluación relajada (tolerancia 0,10), QJev-1.5B alcanza el 71,50 %. Desglose de consistencia metamórfica (7 dimensiones formales):

| Dimensión | Línea base | QJev-1.5B (Fase 3) | Delta |
|---|---|---|---|
| BAT.isolation | 100,0 % | 100,0 % | 0,0 % |
| REP.type | 77,1 % | 83,3 % | +6,2 % |
| REP.invariance | 73,2 % | 74,4 % | +1,2 % |
| LOG.bounds | 62,5 % | 67,9 % | +5,4 % |

## Requisitos de hardware

- VRAM estimada: 1,07 GB en cuantización de 4 bits según la model card; el repositorio completo ocupa 3,08 GB en disco.
- GPU recomendadas: el autor reporta latencias de aproximadamente 31 ms en GPUs de consumo; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: sí, gracias a la huella de 1,07 GB en 4 bits y al tamaño total de 1,54B parámetros.
- Opciones de despliegue: la librería declarada es `transformers`; los tags incluyen `text-embeddings-inference` y `endpoints_compatible`. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 31 ms por forward pass, equivalente a unas 32 decisiones por segundo por instancia de GPU, según las condiciones de evaluación documentadas.

## Comparativa con modelos similares

| Modelo | Parametros | JevBench estricto | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **QJev-1.5B** | 1,54B | 62,53 % | ~31 ms | Apache 2.0 | Hugging Face |
| decision-2b | 2,0B | 54,8 % | ~40 ms | No disponible | Leaderboard BenchmarkHeaven |
| pjev-2b | 2,0B | 56,5 % | ~38 ms | No disponible | Leaderboard BenchmarkHeaven |
| jiwo-4b | 4,0B | 60,2 % | ~65 ms | No disponible | Leaderboard BenchmarkHeaven |
| autotrust/JEV-9B | 9,0B | 72,0 % | ~85 ms | No disponible | Leaderboard BenchmarkHeaven |

QJev-1.5B supera en la métrica estricta a modelos de 2B y 4B con menor latencia, y queda por debajo de las variantes de 9B y 27B, que sin embargo requieren entre 6 y 18 veces más memoria. Los datos de licencia y disponibilidad de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para selección entre opciones discretas; no es un modelo generativo de texto libre y no debe emplearse como sustituto de un LLM conversacional.
- El soporte de idiomas se limita al inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada, lo que impide garantizar el comportamiento con entradas largas.
- Los benchmarks provienen del arnés propietario JevBench y de reproducción local del autor; no hay validación independiente publicada. Las cifras de los modelos comparados proceden de entradas de leaderboard no verificadas en esta ficha.
- El modelo hereda los sesgos del corpus de destilación SargeDev/jev-distill-corpus-v3 y del backbone Qwen2.5-1.5B-Instruct, cuya composición no se detalla.
- Riesgo de calibración deficiente fuera de la distribución de entrenamiento: las probabilidades emitidas pueden no reflejar la incertidumbre real en dominios alejados del corpus.
- La consistencia metamórfica reportada no es perfecta (REP.invariance al 74,4 %, LOG.bounds al 67,9 %), por lo que persisten vulnerabilidades ante reformateos de las opciones.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-1.5B-Instruct conviene verificar las condiciones heredadas del modelo base.
- El modelo tiene 206 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/AnkitNayak-dev/QJev-1.5B
- GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://jevbench.github.io/
- Leaderboard BenchmarkHeaven: https://benchmarkheaven.com/jev-models
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
