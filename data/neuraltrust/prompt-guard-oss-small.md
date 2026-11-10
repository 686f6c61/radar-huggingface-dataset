# NeuralTrust/prompt-guard-oss-small

## Resumen

Prompt Guard OSS Small es un clasificador binario multilingüe desarrollado por NeuralTrust para detectar intentos de jailbreak e inyección directa de prompts en texto proporcionado por el usuario. El modelo está diseñado como una primera barrera de seguridad (first gate) que se sitúa delante de un LLM: su objetivo es maximizar el recall para capturar la mayor parte de intentos de manipulación con una latencia mínima, delegando la precisión fina en un segundo modelo de mayor tamaño al que solo se reenvían los casos marcados como sospechosos.

Técnicamente se trata de un ajuste fino de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe de aproximadamente 140 millones de parámetros, 22 capas, dimensión oculta de 384 y 6 cabezas de atención, al que se le añade una cabeza lineal de clasificación binaria con las etiquetas `benign` y `jailbreak`. La longitud máxima de entrada es de 512 tokens y el modelo cubre nueve idiomas: catalán, alemán, inglés, español, francés, gallego, italiano, portugués y turco.

Su relevancia actual radica en que ofrece una capa de guardrail ligera, con licencia MIT y publicada con pesos en safetensors y ONNX, lo que facilita su despliegue en infraestructuras propias o en entornos de inferencia de embeddings y clasificación como Text Embeddings Inference. El proyecto está financiado por el European Innovation Council de la Unión Europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT sequence classifier (encoder transformer) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye pesos ONNX y safetensors; no se detallan variantes cuantizadas) |
| Idiomas soportados | ca, de, en, es, fr, gl, it, pt, tr (multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder de la familia ModernBERT orientado a eficiencia multilingüe, con 22 capas, dimensión oculta de 384 y 6 cabezas de atención. Sobre esa base se añade una cabeza lineal de clasificación binaria que produce logits para las clases `benign` (ID 0) y `jailbreak` (ID 1). La decisión se toma aplicando softmax y comparando `P(jailbreak)` con un umbral configurable, cuyo valor por defecto es 0,5.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; al tratarse de un clasificador, el ajuste se realiza mediante aprendizaje supervisado sobre ejemplos etiquetados de jailbreak e inyección de prompts. La evaluación declarada se realiza sobre el split de test del dataset `NeuralTrust/prompt-jailbreak-training`. El diseño está optimizado explícitamente para recall, de modo que el modelo actúe como filtro de primera pasada en una arquitectura en cascada.

## Capacidades

- Clasificación binaria de texto en dos etiquetas: `benign` y `jailbreak`.
- Detección de intentos de jailbreak y de inyección directa de prompts en la entrada del usuario.
- Detección de intentos de anular o sobrescribir instrucciones de sistema.
- Detección de peticiones para revelar prompts ocultos o instrucciones protegidas.
- Soporte multilingüe en nueve idiomas: catalán, alemán, inglés, español, francés, gallego, italiano, portugués y turco.
- Umbral de decisión configurable (por defecto 0,5) para ajustar el equilibrio entre recall y precisión según el caso de uso.
- Capacidad de operar como primera etapa de una cascada de guardrails, reenviando solo los positivos a un modelo mayor.
- No soporta tool calling, generación de texto, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador de secuencias.

## Casos de uso

- Filtro de primera pasada antes de un LLM: se ejecuta sobre cada prompt de usuario y solo los marcados como `jailbreak` se envían a un detector mayor o a un flujo de revisión, reduciendo la latencia media del sistema al no invocar el modelo grande en todo el tráfico.
- Protección de aplicaciones de chat: el clasificador se interpone entre la interfaz de usuario y el modelo generativo para bloquear intentos de manipulación en conversaciones multi-turno, evaluando cada mensaje de forma independiente.
- Monitorización de intentos de jailbreak en agentes: registro y alerta de prompts que intentan sobrescribir instrucciones del sistema o extraer instrucciones internas, útil para equipos de seguridad y observabilidad de LLM.
- Guardrail en pipelines de atención al cliente automatizada: se aplica como capa previa al modelo de conversación para evitar que usuarios malintencionados manipulen el asistente y provoquen respuestas fuera de política.
- Cumplimiento y auditoría: clasificación de logs históricos de prompts para cuantificar la tasa de intentos de inyección y alimentar informes de seguridad, aprovechando el bajo coste computacional del modelo.
- Despliegue en el borde o en entornos con recursos limitados: al tratarse de un modelo de 140 millones de parámetros con pesos ONNX, puede ejecutarse en CPU o en GPU de gama baja para clasificar prompts en tiempo real sin depender de infraestructura pesada.
- Capa adicional en sistemas de defensa en profundidad: combinado con otras medidas (validación de salida, permisos de herramientas, sandboxing), aporta señal de detección temprana sin convertirse en la única frontera de seguridad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo sobre el split de test del dataset `NeuralTrust/prompt-jailbreak-training` (task: prompt injection detection, umbral 0,5). No están verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 0,992294 |
| F1 | 0,990721 |
| Recall | 0,994015 |

No se han publicado en la información disponible resultados comparativos con otros modelos de detección de prompt injection, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,6 GB solo para pesos (140,6 M de parámetros), más overhead de activaciones y tokenizador; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16/BF16 los pesos ocupan alrededor de 0,3 GB, por lo que el modelo es apto para GPU de consumo muy modestas e incluso para inferencia en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput se pueden usar A100, H100, L4 o RTX 4090, aunque el modelo está sobredimensionado para ellas y probablemente el cuello de botella sea el tokenizador y el batching.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con suficiente memoria (prácticamente todas las de los últimos años), y también en CPU.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime (el repo incluye pesos ONNX), Text Embeddings Inference (tag `text-embeddings-inference`), y endpoints compatibles de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables (por ejemplo, otros clasificadores de prompt injection de tamaño similar). Por tanto, la comparativa cuantitativa se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Prompt Guard OSS Small | 140,6 M | 512 tokens | MIT | Clasificador binario multilingüe, primera etapa de cascada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se han proporcionado datos de comparación |

## Limitaciones y advertencias

- No está diseñado para moderación general de toxicidad, abuso o contenido: solo detecta jailbreak e inyección directa de prompts.
- No detecta instrucciones maliciosas incrustadas en documentos recuperados, páginas web, correos electrónicos o salidas de herramientas (inyección indirecta).
- No evalúa una conversación completa ni la trayectoria de un agente: clasifica cada texto de forma aislada.
- Solo procesa los primeros 512 tokens; textos más largos requieren ventaneo explícito y pueden perder señales relevantes fuera de esa ventana.
- No debe utilizarse como única frontera de seguridad en sistemas con datos sensibles o herramientas privilegiadas; la propia model card recomienda un diseño de defensa en profundidad.
- El umbral por defecto de 0,5 está calibrado sobre los datasets de evaluación del autor; la tasa de falsos positivos en producción puede diferir y requiere recalibración con tráfico real.
- El rendimiento fuera de los nueve idiomas declarados no está establecido, aunque el modelo base multilingüe pueda procesar otros idiomas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos negativos y falsos positivos) ante prompts ambiguos o adversariales no vistos en entrenamiento.
- Sesgos conocidos: no se documentan en la información disponible; al ser un clasificador entrenado sobre un dataset concreto, puede heredar sesgos de ese corpus.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar los términos del modelo base `jhu-clsp/mmBERT-small` y del dataset de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeuralTrust/prompt-guard-oss-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset de evaluación: https://huggingface.co/datasets/NeuralTrust/prompt-jailbreak-training
- Organización en Hugging Face: https://huggingface.co/NeuralTrust
