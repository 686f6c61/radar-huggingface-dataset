# reaperdoesntknow/Disctil-Qwen3-1.7B

## Resumen

Disctil-Qwen3-1.7B es un ajuste fino por supervisión (SFT) del modelo reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored, publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. Se trata de un modelo de generación de texto de aproximadamente 2.031 millones de parámetros (2,03 B) construido sobre la familia Qwen3, orientado a despliegue en el borde (edge) y entrenado mediante destilación de conocimiento desde un profesor mayor, presumiblemente Qwen3-30B-A3B según la documentación del portfolio del autor.

El modelo se presenta como el nodo "refinado por DISC" dentro de una cadena de destilación denominada DistilQwen. La model card incluye una sección de fundamentos matemáticos sobre "cálculo de discrepancia" (Discrepancy Calculus), un marco teórico propio del autor que, según afirma, identifica y preserva fronteras estructurales en el espacio de pesos que el ajuste fino estándar difumina. Esta justificación teórica no viene acompañada de resultados empíricos verificables en la información disponible.

Su relevancia práctica es limitada pero concreta: ofrece un checkpoint de 4,1 GB en safetensors, compatible con transformers y text-generation-inference, con unas 2.048 descargas y un único "like" en el momento de la consulta. Es un modelo pequeño, entrenado con TRL 0.29.1 sobre Transformers 5.0.0 y PyTorch 2.10.0, lo que lo sitúa en la frontera de versiones muy recientes del ecosistema. La ausencia de licencia declarada, de idiomas soportados y de benchmarks publicados son limitaciones importantes a considerar antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3; detalles internos no disponibles) |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente BF16 por el tamaño de 4,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.29.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0, Tokenizers 0.22.2 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Tamano del repo | 4,1 GB |
| Descargas | 2.048 |
| Fecha de creacion | 2026-03-28 |
| Ultima actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3, aunque la model card no detalla el número de capas, dimensiones ocultas, cabezas de atención ni la composición exacta del tokenizador. El dato real de safetensors confirma 2.031.739.904 parámetros, coherente con un modelo de aproximadamente 1,7 B de parámetros "nominales" más embeddings y cabezas. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia.

El entrenamiento se realizó mediante SFT con TRL 0.29.1 sobre el checkpoint DiStil-Qwen3-1.7B-uncensored, que a su vez procede de una cadena de destilación desde Qwen3-30B-A3B según la documentación del portfolio del autor. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros. La model card incluye una extensa sección sobre "cálculo de discrepancia" (DISC) que describe un marco de teoría de la medida para cuantificar el desajuste entre integración y diferenciación, y afirma que el refinamiento DISC preserva "fronteras estructurales" en el espacio de pesos. Esta justificación teórica no está respaldada por resultados empíricos publicados en la información disponible, por lo que debe considerarse una afirmación del autor sin validación independiente.

## Capacidades

- Generación de texto conversacional: el pipeline de ejemplo muestra uso con formato de chat (lista de mensajes con roles), lo que indica soporte de plantilla conversacional.
- Razonamiento y respuesta a preguntas abiertas: el ejemplo de la model card plantea una pregunta hipotética que requiere razonamiento y justificación.
- Destilación orientada a edge: el tag "edge" sugiere optimización para despliegue en dispositivos con recursos limitados.
- Compatibilidad con text-generation-inference y endpoints: los tags incluyen "text-generation-inference" y "endpoints_compatible", lo que facilita el despliegue en infraestructura de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se mencionan en la model card.
- Modo "uncensored" heredado del modelo base: el checkpoint del que deriva se denomina explícitamente "uncensored", lo que implica que se ha reducido o eliminado el alineamiento de seguridad, aunque el grado exacto no se documenta.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: al ser un modelo de 2 B en safetensors y compatible con el pipeline de transformers, permite levantar un chatbot funcional en una GPU consumer en minutos, útil para validar flujos de producto antes de invertir en modelos mayores.
- Despliegue en el borde y dispositivos con recursos limitados: el tamaño de 2 B y el tag "edge" lo hacen candidato para inferencia en GPUs de gama media o incluso CPU con cuantización adecuada (aunque no se publican GGUF oficiales), en escenarios de asistentes locales o embebidos.
- Generación de texto creativo y exploración de prompts: el ejemplo de la model card (máquina del tiempo) sugiere uso para escritura especulativa y generación de respuestas abiertas, donde un modelo pequeño sin alineamiento estricto puede ofrecer respuestas más diversas.
- Investigación sobre destilación de conocimiento: dado que forma parte de una cadena documentada (Qwen3-30B-A3B → 1.7B → refinamiento DISC), es útil como caso de estudio para investigadores que analicen la transferencia de capacidades en modelos pequeños.
- Experimentación con el marco DISC: para quienes quieran reproducir o evaluar las afirmaciones del autor sobre "cálculo de discrepancia", el checkpoint sirve como punto de partida, aunque sin benchmarks publicados la validación requerirá trabajo propio.
- Base para ajuste fino posterior: al ser un SFT sobre un modelo ya destilado, puede servir como inicialización para tareas específicas de dominio con datasets pequeños, aprovechando su tamaño manejable para iteración rápida.
- Evaluación de seguridad y robustez: al derivar de un modelo "uncensored", es útil en entornos controlados para estudiar comportamientos no alineados y diseñar filtros o salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Las afirmaciones sobre preservación de "fronteras estructurales" mediante DISC no vienen acompañadas de métricas empíricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 5 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB para pesos, más overhead; en torno a 3-4 GB en total.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,1 GB para pesos, más overhead; en torno a 2-3 GB en total. No se publican GGUF oficiales, por lo que habría que generarlos con llama.cpp o similar.
- GPU recomendadas: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y cualquier GPU de datacenter (A100, H100). En GPUs de 8 GB (RTX 3060 Ti, RTX 4060) también debería caber en BF16 con contextos cortos.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer con 8 GB o más en BF16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (pipeline nativo), text-generation-inference (tag "text-generation-inference"), endpoints de Hugging Face (tag "endpoints_compatible"). Para llama.cpp/Ollama habría que convertir a GGUF, ya que no se ofrecen pesos en ese formato.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Disctil-Qwen3-1.7B | 2,03 B | no disponible | no disponible | safetensors | SFT sobre DiStil-Qwen3-1.7B-uncensored; sin benchmarks |
| Qwen3-1.7B (original) | ~1,7 B | no disponible en esta ficha | Apache 2.0 (habitual en Qwen) | safetensors, GGUF | Modelo base de la familia; alineamiento estándar |
| Qwen3-1.7B-Coder-Distilled-SFT (mismo autor) | ~1,7 B | no disponible | no disponible | BF16 | Destilado para código; 1.677 descargas según model card |
| DiStil-Qwen3-1.7B-uncensored (modelo base) | ~1,7 B | no disponible | no disponible | BF16 | Checkpoint previo en la cadena; 1.602 descargas |

La comparación cuantitativa de rendimiento no es posible porque ninguno de los modelos del portfolio del autor publica benchmarks en la información disponible. Frente a Qwen3-1.7B original, la diferencia principal es el proceso de destilación y el ajuste SFT, pero sin métricas no puede afirmarse una mejora. La licencia del modelo original (habitualmente Apache 2.0 en Qwen) es más clara que la de este checkpoint, que no concreta licencia.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica "licence: license" sin especificar términos. Esto impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no se especifica qué idiomas soporta; el rendimiento en castellano es desconocido y podría ser deficiente.
- Sin benchmarks publicados: no hay evidencia empírica de calidad, razonamiento, código o matemáticas; las afirmaciones teóricas sobre DISC no están validadas de forma independiente.
- Herencia "uncensored": el modelo base se denomina explícitamente "uncensored", lo que implica ausencia o reducción de alineamiento de seguridad; puede generar contenido inapropiado, sesgado o dañino sin filtros.
- Riesgo de alucinación: al ser un modelo de 2 B, la tasa de alucinación es previsiblemente alta en tareas de conocimiento factual, aunque no se publican mediciones.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Procedencia y mantenimiento: el autor es un usuario individual bajo una entidad denominada Convergent Intelligence LLC; no hay evidencia de auditoría externa, y el modelo tiene un único "like" pese a las 2.048 descargas, lo que sugiere baja validación comunitaria.
- Fecha de creación futura: el checkpoint figura creado el 2026-03-28, lo que sitúa la ficha en un contexto temporal que conviene verificar; la información puede corresponder a un modelo muy reciente o a metadatos inconsistentes.
- Sin pesos cuantizados oficiales: no se ofrecen GGUF ni AWQ/GPTQ, por lo que el despliegue eficiente en CPU o GPUs pequeñas requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Modelo destacado del portfolio (Qwen3-1.7B-Coder-Distilled-SFT): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Paper "Structure Over Scale": https://doi.org/10.57967/hf/8165
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Paper "Discrepancy Calculus": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Repositorio TRL: https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/reaperdoesntknow
