# inclusionAI/Ling-3.1-flash-base

## Resumen

Ling-3.1-flash-base es el checkpoint base (no alineado para instrucciones) de la familia Ling-3.1-flash, desarrollada por inclusionAI, el laboratorio de IA del grupo Ant Group. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts con arquitectura híbrida de atención lineal: 560.000 millones de parámetros totales y 25.000 millones activos por token, lo que lo sitúa en la liga de los MoE masivos dispersos pero con un coste de inferencia por token relativamente contenido.

Su interés técnico está en la combinación de 63 capas KDA (atención lineal) con 9 capas Gated MLA en proporción 7:1, un diseño que busca reducir el coste cuadrático de la atención en contextos largos manteniendo la calidad de recuperación de información de la atención completa. El modelo se entrenó en FP8 y se publica como checkpoint BF16 fusionado mediante la técnica WSM (Warmup-Stable and Merge), pensado explícitamente para preentrenamiento continuado, adaptación de dominio e investigación en post-entrenamiento.

Al ser un checkpoint base, no incorpora plantilla de chat ni ajuste por instrucciones: no es un modelo listo para producción conversacional, sino una base sobre la que construir. La licencia MIT y la publicación de pesos completos lo hacen relevante para equipos que quieran hacer fine-tuning a gran escala sin restricciones comerciales, aunque el tamaño (1,14 TB en BF16) limita su uso a infraestructura multi-GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal (Hybrid-linear MoE): 63 capas KDA + 9 capas Gated MLA (7:1), 4 capas densas |
| Parámetros totales | 560B según model card; 572.120.680.768 según recuento de safetensors del repositorio |
| Parámetros activos | 25B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; entrenamiento en FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), requiere `trust_remote_code` (tag `custom_code`, arquitectura `bailing_hybrid`) |

Otras especificaciones declaradas por el autor:

| Parámetro | Valor |
|---|---|
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos enrutados activados por token | 8 |
| Tamaño intermedio de experto | 1280 |
| Tamaño intermedio de capa densa | 10240 |
| Cabezas de atención | 64 |
| Dimensión oculta | 4096 |
| Tamaño de vocabulario | 157184 |
| Precisión de entrenamiento | FP8 |
| Precisión de pesos publicados | BF16 (tras fusión WSM) |
| Tamaño del repositorio | 1144,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer disperso con mezcla de expertos y atención híbrida. De las 72 capas con atención, 63 usan KDA (atención lineal) y 9 usan Gated MLA, en una proporción 7:1, además de 4 capas densas. Cada token activa 8 de los 512 expertos enrutados más 1 experto compartido, lo que da los 25B parámetros activos. La dimensión oculta es 4096, con 64 cabezas de atención, tamaño intermedio de experto 1280 y tamaño intermedio de capa densa 10240.

El entrenamiento se realizó en FP8, y el checkpoint publicado es el resultado de una fusión de checkpoints mediante WSM (Warmup-Stable and Merge) convertida a BF16. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; al tratarse de un checkpoint base, es esperable que no incluya alineamiento por preferencias, pero este extremo no se confirma en la documentación. La innovación destacable es la proporción 7:1 de atención lineal frente a Gated MLA, orientada a abaratar el coste de atención en secuencias largas.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje general, como base para preentrenamiento continuado.
- Razonamiento y conocimiento factual, evaluados por el autor en dominios de comprensión lectora, conocimiento y razonamiento.
- Generación de código y matemáticas, incluidos en la batería de 47 benchmarks en ocho dominios declarada por el autor.
- Capacidades multilingües: el autor incluye un dominio específico de multilingüismo en su evaluación (con Belebele entre los benchmarks reportados), aunque no se publica la lista de idiomas soportados.
- Comprensión de contexto largo: se declara evaluación en el dominio de long-context, pero no se especifica la longitud de ventana.
- No incluye, según la información disponible: tool calling, function calling, modo thinking explícito, visión, audio, ni comportamientos de agente. Al ser un checkpoint base, estas capacidades dependerían de un post-entrenamiento posterior.

## Casos de uso

- Preentrenamiento continuado en dominios especializados (legal, biomédico, financiero, industrial): al ser un checkpoint base con pesos BF16 completos, permite seguir entrenando sobre corpus propios sin partir de cero y sin las restricciones de una licencia copyleft.
- Adaptación mediante SFT y DPO para crear un modelo instruct propio: el checkpoint base es el punto de partida natural para construir un asistente conversacional ajustado a un vertical concreto, con control total sobre los datos de alineamiento.
- Investigación en arquitecturas híbridas de atención: la combinación 7:1 de KDA y Gated MLA con 512 expertos enrutados es un objeto de estudio útil para analizar compromisos entre coste de atención, dispersión de expertos y calidad.
- Destilación hacia modelos menores: usar el modelo como profesor para generar datos y destilar capacidades en modelos de 7B-30B desplegables en infraestructura convencional.
- Evaluación comparativa de MoE masivos: sirve como referencia abierta (MIT) frente a modelos propietarios o de pesos cerrados de escala similar en tareas de comprensión lectora y conocimiento.
- Generación de datos sintéticos a gran escala: con 157.184 tokens de vocabulario y capacidad multilingüe declarada, puede emplearse para producir corpus anotados o pares de instrucción que alimenten otros pipelines.
- Investigación en enrutamiento de expertos: el patrón de activación 8+1 sobre 512 expertos permite estudiar balanceo de carga, colapso de expertos y especialización por dominio.

## Benchmarks y rendimiento

El autor declara evaluar el modelo en 47 benchmarks agrupados en ocho dominios (comprensión del lenguaje, conocimiento, código, matemáticas, razonamiento, multilingüismo, conocimiento médico y comprensión de contexto largo). La información disponible solo incluye un subconjunto de esa tabla, correspondiente al dominio de comprensión del lenguaje y parte del de conocimiento. Se reproduce a continuación lo disponible, comparando con DeepSeek-V4-Pro-Base (1,6T totales, 49B activos) y MiMo-V2.5-Pro-Base (1,02T totales, 42B activos).

| Dominio | Benchmark | Configuración | Ling-3.1-flash-base (560B/A25B) | DeepSeek-V4-Pro-Base (1,6T/A49B) | MiMo-V2.5-Pro-Base (1,02T/A42B) |
|---|---|---|---|---|---|
| Comprensión del lenguaje | Race-High (EM) | 0-shot | 93,88 | 93,37 | 93,60 |
| Comprensión del lenguaje | SQuAD v2 (Acc) | 1-shot | 92,79 | 87,70 | 88,93 |
| Comprensión del lenguaje | Belebele (EM) | 0-shot | 94,67 | 93,83 | 92,72 |
| Comprensión del lenguaje | C3 (EM) | 0-shot | 83,34 | 81,64 | 81,53 |
| Comprensión del lenguaje | CCPM (EM) | 0-shot | 91,88 | 93,31 | 90,18 |

No se han publicado en la información disponible los resultados del resto de dominios (conocimiento, código, matemáticas, razonamiento, multilingüismo, médico y contexto largo), por lo que no es posible presentar una comparativa completa ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

Estimaciones derivadas del número de parámetros (572,1B según safetensors); no son cifras oficiales del autor.

- VRAM para pesos en BF16: aproximadamente 1,14 TB (coincide con los 1144,3 GB del repositorio). Requiere un nodo multi-GPU: 8×H200 (141 GB) suma 1128 GB y queda por debajo; serían necesarias 16×H200 o 8×B200 (192 GB) para operar con margen para caché KV y activaciones.
- VRAM en FP8: aproximadamente 572 GB de pesos; 8×H100 80GB (640 GB) es el mínimo teórico, convery poco margen, por lo que 8×H200 es la configuración recomendada.
- Cuantización a 4 bits: en torno a 286-300 GB de pesos, viable en 4×H100 80GB o 2×B200, siempre que exista soporte de la arquitectura en el runtime elegido.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en un nodo de 8×RTX 4090 (192 GB) en 4 bits con margen razonable. El modelo no es desplegable en hardware consumer.
- Opciones de despliegue: vLLM, SGLang y TGI solo si incorporan soporte para la arquitectura `bailing_hybrid` con `trust_remote_code`; este soporte no se confirma en la información disponible. llama.cpp/Ollama requerirían implementación específica de KDA y Gated MLA, no disponible.
- Latencia y throughput: no disponibles. Con 25B parámetros activos por token, el coste de cómputo por token es comparable al de un modelo denso de esa escala, pero el cuello de botella en BF16 será el ancho de banda de memoria al recorrer los expertos activados.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ling-3.1-flash-base | 560B / 25B (572,1B en safetensors) | no disponible | MIT | Pesos abiertos en HuggingFace | Checkpoint base, sin alineamiento |
| Ling-3.1-flash | no disponible en la información | no disponible | no disponible | Pesos abiertos en HuggingFace | Versión post-entrenada del mismo modelo, orientada a uso directo |
| DeepSeek-V4-Pro-Base | 1,6T / 49B | no disponible | no disponible | Pesos base citados en la comparativa del autor | Mayor escala; supera a Ling en CCPM y queda por debajo en Race-High, SQuAD v2, Belebele y C3 |
| MiMo-V2.5-Pro-Base | 1,02T / 42B | no disponible | no disponible | Pesos base citados en la comparativa del autor | Escala intermedia; resultados muy próximos en comprensión lectora |

## Limitaciones y advertencias

- Es un checkpoint base: no está ajustado por instrucciones ni por preferencias, por lo que no debe usarse directamente como asistente conversacional sin SFT/DPO previo.
- Riesgo de alucinación inherente a un modelo de lenguaje sin alineamiento; la verbosidad y la falta de calibración son esperables en uso directo.
- No se especifican sesgos evaluados ni composición del corpus de entrenamiento, lo que impide auditar sesgos de género, etnia, idioma o dominio.
- No se publica la longitud de contexto soportada, pese a que el autor evalúa en el dominio de long-context; no debe asumirse una ventana concreta sin verificación empírica.
- Idiomas soportados no disponibles: aunque se evalúa en Belebele, no hay lista oficial de lenguas cubiertas ni de calidad por idioma.
- La licencia MIT permite uso comercial y modificación, pero el código personalizado (`custom_code`, `bailing_hybrid`) debe auditarse y ejecutarse con `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- El tamaño en BF16 (1,14 TB) hace inviable el despliegue fuera de clústeres multi-GPU; no hay cuantizaciones publicadas por el autor.
- Arquitectura híbrida poco común: la disponibilidad de kernels optimizados (FlashAttention, paged attention) para KDA y Gated MLA puede ser limitada, afectando al rendimiento real en producción.
- La información de benchmarks está truncada: no es posible validar el rendimiento en código, matemáticas, razonamiento ni contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inclusionAI/Ling-3.1-flash-base
- Modelo post-entrenado de la misma familia: https://huggingface.co/inclusionAI/Ling-3.1-flash
- Organización en HuggingFace: https://huggingface.co/inclusionAI
- Organización en ModelScope: https://modelscope.cn/organization/inclusionAI
- Diagrama de arquitectura: https://cdn-uploads.huggingface.co/production/uploads/678143d4ddb1f1ce16daca8e/qwmfVu_K08auI7R_ijbIX.png

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo foros y páginas sin relación); no se han podido localizar papers, blogs técnicos ni demos adicionales.
