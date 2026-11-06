# omida-ai/pluto-2.1

## Resumen

Pluto-2.1 es un modelo de decisión de 1.738B parámetros desarrollado por omida-ai que, a partir de un estado y un conjunto de preguntas tipadas, devuelve una distribución de probabilidad calibrada sobre cada candidato presentado. No genera texto libre: no hay nada que parsear, nada que reintentar y, según el autor, nada que pueda alucinar. Se trata de un clasificador de decisiones de un solo pase hacia adelante (*system-one*), pensado para sustituir a un LLM generativo en tareas de elección acotada donde lo que importa es la probabilidad calibrada, no la prosa.

El modelo parte del backbone Qwen3-1.7B y se inicializa desde el checkpoint Hanno-Labs/bosun-v3.1-1.7b, sobre el que se aplica un ajuste fino con 256 ranuras estables de tokens de decisión; el adaptador resultante se fusiona en la base, por lo que el repositorio es autocontenido. Soporta entre 2 y 255 candidatos por pregunta y tres modos de operación: `choice`, `noul` y `score`.

Su relevancia actual reside en la relación entre coste y calibración: con 1.738B parámetros y un único forward pass, obtiene una precisión media de 0.6952 en las dos suites que reporta el autor, por delante de checkpoints de 1.9B y 3.1B, y con mejor calibración (ECE de 5.56% en Typed Decisions) que sus competidores directos. El autor lo entrenó en solitario con una RTX 5060 Ti de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-1.7B) con 256 ranuras estables de tokens de decisión |
| Parametros totales | 1.720.552.448 (1.738B según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la suite de evaluación limita los prompts a 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

Pluto-2.1 es un transformer decoder-only construido sobre Qwen3-1.7B, con el checkpoint Hanno-Labs/bosun-v3.1-1.7b como inicializador. La innovación arquitectónica es la incorporación de 256 ranuras estables de tokens de decisión: el modelo puntúa todos los candidatos presentados en un único forward pass, sin decodificación autorregresiva, de modo que el coste computacional es fijo y no depende del número de tokens generados (no hay "token bill"). Admite hasta 255 opciones en tiempo de ejecución por pregunta y tres modos de decisión: `choice`, `noul` y `score`. El adaptador afinado está fusionado en la base, por lo que el repositorio no requiere cargar pesos adicionales.

El ajuste fino se realizó sobre los datasets LocalLLaMA/typed-decisions y SargeDev/jev-distill-corpus-v3. El autor declara explícitamente que no se usaron pesos de d1, ni objetivos de entrenamiento generados por d1, ni ensembles. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El entrenamiento se llevó a cabo en una única GPU de consumo (RTX 5060 Ti de 16 GB).

## Capacidades

- Clasificación de decisiones con salida de distribución de probabilidad calibrada sobre cada candidato presentado.
- Soporte de 2 a 255 candidatos por pregunta en tiempo de ejecución.
- Tres modos de decisión: `choice`, `noul` y `score`.
- Evaluación de un solo pase: puntúa todos los candidatos simultáneamente sin decodificación autorregresiva.
- Calibración explícita: el autor reporta ECE, Brier, KL y NLL como métricas de calidad probabilística.
- Cobertura del 100% en las suites evaluadas (2.000/2.000 en Typed Decisions y 1.565/1.565 en el subconjunto emparejado de DecisionBench).
- No soporta generación de texto libre, tool calling, agentes, visión, audio ni modo de razonamiento extendido (thinking); es un modelo de decisión, no un LLM conversacional.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Enrutamiento de peticiones en producción: dado un estado (texto de la consulta, metadatos del usuario) y un conjunto de rutas candidatas, el modelo devuelve la probabilidad de cada ruta en un solo forward pass, lo que permite umbrales de confianza y fallback a un humano cuando la distribución es plana.
- Moderación y clasificación de políticas: presentar las categorías de política como candidatos y usar la distribución calibrada para decidir entre bloqueo, revisión manual y aprobación, aprovechando el ECE bajo (5.56% en Typed Decisions) para fijar umbrales fiables.
- Selección de herramientas en pipelines de agentes: en lugar de pedir a un LLM que elija una herramienta en texto libre, Pluto-2.1 puntúa directamente el conjunto de herramientas disponibles y devuelve una probabilidad por herramienta, eliminando el parseo y los reintentos.
- Triaje de tickets de soporte: clasificar cada ticket entre un conjunto acotado de colas o niveles de prioridad, con 2 a 255 candidatos y cobertura del 100%, adecuado para volúmenes altos donde el coste por decisión debe ser mínimo.
- Decisión de siguiente acción en sistemas de recomendación o juegos: puntuar las acciones legales disponibles en cada estado y usar la distribución como política estocástica o para seleccionar la acción de mayor probabilidad.
- Evaluación A/B y experimentación: usar la probabilidad calibrada como señal continua para estimar la confianza de una decisión y detectar deriva en la distribución antes de que se materialice en errores.
- Filtrado previo a un LLM generativo: descartar candidatos con probabilidad muy baja antes de invocar un modelo mayor, reduciendo el coste de inferencia en pipelines híbridos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados):

| Suite | Métrica | Valor |
|---|---|---|
| Typed Decisions (LocalLLaMA/typed-decisions) | Accuracy | 0.6695 |
| Typed Decisions | Brier | 0.1261 |
| Typed Decisions | KL | 0.2139 |
| DecisionBench matched subset (Hanno-Labs/decision-bench) | Accuracy | 0.7208 |
| DecisionBench matched subset | Brier | 0.3730 |
| DecisionBench matched subset | NLL | 0.7439 |

Comparativa declarada por el autor en las mismas filas y con el mismo scorer:

| Modelo | Parámetros | Typed Decisions | DecisionBench matched | Media |
|---|---:|---:|---:|---:|
| Pluto-2.1 | 1.738B | 0.6695 | 0.7208 | 0.6952 |
| Pluto-2 400M | 0.397B | 0.7835 | 0.5789 | 0.6812 |
| Bosun 3.1 1.7B (inicializador) | 1.738B | 0.4980 | 0.8288 | 0.6634 |
| d1-3B | 3.123B | 0.6495 | 0.6486 | 0.6490 |
| d1-2B | 1.918B | 0.6325 | 0.6339 | 0.6332 |

Según el autor, Pluto-2.1 supera a d1-2B en 3.7 puntos y a d1-3B en 2.0 puntos en Typed Decisions, y en 8.7 y 7.2 puntos respectivamente en DecisionBench, con la media más alta de la comparativa. El subconjunto emparejado de DecisionBench corresponde a 1.565 filas (6.55% de las 23.900 de la suite completa) con prompts de hasta 2.048 tokens y hasta 16 candidatos; el autor no reclama resultados sobre la suite completa. En calibración, Pluto-2.1 reporta ECE de 5.56% en Typed Decisions frente al 3.43% de d1-3B y el 3.90% de d1-2B, y ECE de 5.86% en DecisionBench frente al 6.10% de Bosun.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 3.4 GB solo para pesos, más overhead de activaciones y KV cache; en cuantizaciones de 8 bits rondaría 1.7-2 GB y en 4 bits alrededor de 1 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen; el propio autor lo entrenó en una RTX 5060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y equivalentes; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: el modelo se distribuye como checkpoint PyTorch/safetensors con pipeline de text-classification; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo autorregresivo estas herramientas no son directamente aplicables sin adaptación.
- Latencia y throughput: no disponibles; el autor destaca un único forward pass sin decodificación autorregresiva, lo que elimina el coste proporcional a la longitud de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Typed Decisions | DecisionBench matched | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Pluto-2.1 | 1.738B | 0.6695 | 0.7208 | Apache-2.0 | Hugging Face (omida-ai/pluto-2.1) |
| Bosun 3.1 1.7B | 1.738B | 0.4980 | 0.8288 | no disponible | Hugging Face (Hanno-Labs/bosun-v3.1-1.7b) |
| d1-3B | 3.123B | 0.6495 | 0.6486 | no disponible | no disponible |
| d1-2B | 1.918B | 0.6325 | 0.6339 | no disponible | no disponible |
| Pluto-2 400M | 0.397B | 0.7835 | 0.5789 | no disponible | Hugging Face (omida-ai) |

Pluto-2.1 es el checkpoint equilibrado de la familia: Bosun lidera en DecisionBench (0.8288) y Pluto-2 400M lidera en Typed Decisions (0.7835), pero Pluto-2.1 obtiene la mejor media conjunta (0.6952) con 1.738B parámetros, un 9.4% menos que d1-2B y un 44% menos que d1-3B. La comparación se limita al subconjunto emparejado de DecisionBench (1.565 filas), no a la suite completa.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen, traducción ni diálogo.
- Solo inglés: la model card declara únicamente `en`; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre corpus de decisión específicos, puede heredar los sesgos de esos datasets.
- Riesgo de alucinación: el autor afirma que no hay nada que alucinar al no generar texto, pero la calibración de las probabilidades puede degradarse fuera de la distribución de entrenamiento; el ECE reportado (5.56%-5.86%) es una media agregada, no una garantía por dominio.
- Cobertura de evaluación limitada: DecisionBench se evalúa solo sobre el 6.55% de la suite (subconjunto emparejado de 1.565 filas con hasta 16 candidatos y 2.048 tokens); el autor no reclama resultados sobre la suite completa de 23.900 filas.
- Resultados no verificados: todas las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Límite operativo de candidatos: hasta 255 opciones por pregunta; por encima de ese número no hay soporte documentado.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (LocalLLaMA/typed-decisions y SargeDev/jev-distill-corpus-v3) antes de desplegar en producción.
- Madurez: modelo con 0 descargas y 1 like en el momento de la consulta, publicado el 2 de noviembre de 2026; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/omida-ai/pluto-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Inicializador: https://huggingface.co/Hanno-Labs/bosun-v3.1-1.7b
- Dataset Typed Decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- DecisionBench: https://huggingface.co/datasets/Hanno-Labs/decision-bench
