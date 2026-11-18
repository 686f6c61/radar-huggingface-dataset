# heman10x/rlcd-modernbert-151m

## Resumen

OpenJev (Verdict) es un modelo de decisión no autorregresivo de 151 millones de parámetros, derivado del encoder ModernBERT-base (`knowledgator/gliclass-modern-base-v2.0`) y publicado por el usuario heman10x. No genera texto: recibe un contexto y un conjunto de opciones candidatas y devuelve, en un único pase hacia delante, una distribución calibrada sobre esas opciones, incluyendo una ruta explícita de abstención cuando la evidencia es insuficiente. Está pensado como motor de decisión ("system-1") para flujos de software estructurados: enrutamiento de consultas, clasificación de intenciones, puntuaciones ordinales y juicios binarios.

La relevancia del modelo está en su enfoque de calibración: se entrena con una pérdida compuesta de entropía cruzada más Brier score y se ajusta a posteriori con temperature scaling, de modo que las probabilidades devueltas son interpretables y no solo rankings. Según la model card, alcanza un 95,00 % de top-1 y un ECE de 3,35 % en un conjunto de test de 1.000 casos con 5 candidatos, con latencias p50 de 35,58 ms en un solo pase.

Su tamaño reducido (151M parámetros, repo de 3,0 GB) y la disponibilidad de pesos en safetensors y ONNX lo orientan a despliegue en CPU, edge y navegador vía WebGPU/WASM, además de servidores con PyTorch u ONNX Runtime. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), no autorregresivo, cabeza de clasificación multi-opción |
| Parametros totales | 151.378.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se distribuyen pesos safetensors y ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los benchmarks citados son en ingles: Banking77 y CLINC150) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer bidireccional, y sustituye la generación autoregresiva por una cabeza de clasificación con capacidad para 25 slots de logits: 24 opciones sustantivas más un slot explícito de abstención (`__insufficient_evidence__`). La inferencia evalúa todas las opciones candidatas simultáneamente en un solo pase, sin bucle de decodificación de tokens, lo que explica la latencia declarada de 35,58 ms en p50 y 39,81 ms en p95.

El entrenamiento combina entropía cruzada con Brier score (L_total = L_CE + 1,0 × L_Brier), una regla de puntuación propia (proper scoring rule) que penaliza tanto el error de clasificación como la mala calibración de las probabilidades. Después se aplica un ajuste post-hoc de temperatura mediante L-BFGS con T = 1,0716. La model card cita como inspiración la arquitectura Jev de TypeSafe AI y el paradigma RLCD (Reinforcement Learning for Calibrated Decisions), y menciona evaluación sobre PolyAI Banking77 y CLINC150 Out-of-Scope. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Juicio semántico calibrado sobre un conjunto cerrado de opciones: devuelve opción seleccionada, confianza y probabilidad de abstención.
- Clasificación de intenciones y enrutamiento de consultas en dominios definidos por el usuario (el ejemplo de la model card es atención bancaria).
- Puntuaciones ordinales y probabilidades binarias, además de elección discreta entre candidatos.
- Ruta de abstención explícita para consultas fuera de distribución o con contexto insuficiente, con recall del 97,50 % y precisión del 89,45 % en los conjuntos out-of-scope evaluados.
- Salidas estructuradas (structured outputs) aptas para integrarse en pipelines de software tipados.
- Inferencia en navegador mediante WebGPU/WASM y en servidor con PyTorch u ONNX Runtime.
- No es un modelo conversacional: no genera texto libre ni mantiene diálogo multi-turno por sí mismo.
- No se declaran capacidades de visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un catálogo de categorías, el modelo elige la categoría en un solo pase con una probabilidad calibrada, lo que permite fijar umbrales de escalado a humano de forma defendible.
- Clasificación de intenciones en asistentes conversacionales: se usa como componente previo al LLM generativo para decidir qué flujo activar, reduciendo coste y latencia frente a pedir la clasificación a un modelo grande.
- Moderación y triaje con abstención: en contenido ambiguo o fuera de política, el slot de abstención permite derivar el caso a revisión en lugar de forzar una etiqueta incorrecta.
- Decisión en el navegador: con WebGPU/WASM el modelo puede ejecutarse localmente en el cliente para clasificar formularios o consultas sin enviar datos a un servidor, útil por privacidad y por latencia.
- Extracción de señales en pipelines de datos: asignación de etiquetas ordinales (por ejemplo, severidad o prioridad) sobre registros en lote con ONNX Runtime en CPU.
- Guardarraíl de agentes: verificar si una acción propuesta por un agente encaja en un conjunto predefinido de acciones permitidas antes de ejecutarla, usando la confianza y la probabilidad de abstención como criterio.
- Evaluación automática de respuestas: comparar una respuesta candidata contra un conjunto de rúbricas discretas y obtener una puntuación calibrada reutilizable en experimentos.

## Benchmarks y rendimiento

Datos declarados en la model card sobre el split de test retenido (1.000 casos, 5 candidatos) y conjuntos out-of-scope:

| Metrica | Sin calibrar | Calibrado | IC 95% bootstrap |
|---|---|---|---|
| Top-1 accuracy | 95,00 % | 95,00 % | [93,60 %, 96,20 %] |
| Negative log-likelihood (NLL) | 0,1787 | 0,1768 | [0,1345, 0,2223] |
| Brier score multiclase | 0,0790 | 0,0785 | [0,0601, 0,0978] |
| ECE de anchura igual (10 bins) | 3,52 % | 3,35 % | [2,58 %, 4,56 %] |
| ECE adaptativo (10 bins) | 3,50 % | 3,32 % | [2,55 %, 4,49 %] |
| Recall de abstención out-of-scope | 97,50 % | 97,50 % | [95,07 %, 99,49 %] |
| Precisión de abstención out-of-scope | 89,45 % | 89,45 % | [85,33 %, 93,36 %] |
| Latencia p50 | 35,58 ms | 35,58 ms | pase único |
| Latencia p95 | 39,81 ms | 39,81 ms | pase único |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, ni comparaciones numéricas con otros modelos de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos (151M × 4 bytes) más activaciones y overhead del runtime; en fp16 alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente; para lotes grandes conviene una GPU con más memoria (RTX 4090, A100, H100) para maximizar throughput.
- CPU: el modelo está pensado para ejecutarse en CPU con ONNX Runtime (`CPUExecutionProvider`), según el ejemplo de la model card.
- Navegador: soporte declarado de WebGPU y WASM para inferencia local en el cliente.
- Opciones de despliegue: ONNX Runtime, PyTorch/transformers, WebGPU/WASM. No se mencionan vLLM, llama.cpp, Ollama ni TGI, coherente con que no es un modelo generativo.
- Latencia declarada: p50 de 35,58 ms y p95 de 39,81 ms en pase único. No se especifica el hardware de medición ni el throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| OpenJev / rlcd-modernbert-151m | 151M | no disponible | Clasificación calibrada con abstención, no autorregresivo | Apache 2.0 | Benchmarks propios de calibración y latencia |
| knowledgator/gliclass-modern-base-v2.0 (modelo base) | ~151M | no disponible | Clasificación zero-shot con GLiClass | no disponible en la informacion proporcionada | Es el backbone del que deriva este modelo |
| TypeSafe AI Jev | no disponible | no disponible | Motor de decisión estructurado | no disponible | Citado como inspiración; no hay datos públicos en la información disponible |

No se dispone en la información proporcionada de comparaciones numéricas con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene conversaciones y no sirve para tareas de resumen, redacción o código.
- El conjunto de opciones candidatas está limitado a 24 opciones sustantivas más la abstención; catálogos mayores requieren descomposición o varios pases.
- La model card no declara los idiomas soportados; los benchmarks citados son en inglés, por lo que el rendimiento en castellano no está verificado.
- Los benchmarks proceden del propio autor y de conjuntos de evaluación acotados (1.000 casos, 5 candidatos); no hay validación independiente en la información disponible.
- La calibración puede degradarse fuera de la distribución de entrenamiento; conviene monitorizar ECE y recalibrar con datos propios antes de fijar umbrales de producción.
- Riesgo de alucinación de etiquetas: al forzar una elección entre opciones, el modelo puede asignar una categoría con alta confianza cuando el contexto no la respalda; la ruta de abstención mitiga pero no elimina este riesgo (precisión de abstención del 89,45 %).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- No se detallan sesgos demográficos o lingüísticos; al ser un clasificador sobre dominios concretos, hereda los sesgos de los datos de entrenamiento, no documentados aquí.

## Enlaces

- Hugging Face: https://huggingface.co/heman10x/rlcd-modernbert-151m
- Repositorio GitHub: https://github.com/Heman10x-NGU/Verdict-open-jev
- Demo WebGPU en navegador: https://github.com/Heman10x-NGU/Verdict-open-jev#running-the-in-browser-webgpu-playground
- Licencia: https://github.com/Heman10x-NGU/Verdict-open-jev/blob/main/LICENSE
- Modelo base: https://huggingface.co/knowledgator/gliclass-modern-base-v2.0
