# krishna4murali/telugu-storyteller-v2

## Resumen

telugu-storyteller-v2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario krishna4murali en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El nombre sugiere una especialización en la generación de historias en télugu, aunque la model card no documenta explícitamente el corpus de entrenamiento ni las capacidades concretas adquiridas tras el ajuste. El repositorio tiene un tamaño de 4,7 GB y contiene un único archivo cuantizado en Q4_K_M.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones). Al derivarse de Qwen2.5, hereda el contexto nativo de 32.768 tokens y el tokenizador multilingüe de la familia Qwen2.5, si bien no se ha publicado ninguna validación específica sobre el comportamiento del modelo ajustado en tareas de razonamiento, código o matemáticas.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo típico de ajuste fino comunitario con Unsloth y conversión a GGUF, sin métricas publicadas, sin licencia declarada y sin datos de evaluación. Resulta útil como caso de estudio de despliegue local de un modelo de 7B cuantizado, pero no como candidato para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la base Qwen2.5-7B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible (la base Qwen2.5 es multilingüe; el ajuste apunta presumiblemente a télugu, sin confirmación documental) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de parámetros) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, preentrenado por Alibaba con un corpus multilingüe de gran escala y posteriormente alineado mediante instrucciones y preferencias. Sobre esta base, el autor aplicó un ajuste fino supervisado (SFT) utilizando Unsloth, una biblioteca optimizada para entrenamiento con LoRA/QLoRA de bajo consumo de memoria que, según la model card, permitió entrenar "2x más rápido".

No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO adicional ni hiperparámetros como el rango de LoRA, la tasa de aprendizaje o el número de épocas. Tampoco se especifica si el ajuste se realizó sobre los pesos completos o mediante adaptadores fusionados. La conversión a GGUF se realizó con las herramientas de Unsloth/llama.cpp. No hay innovaciones técnicas destacables más allá del propio pipeline de cuantización.

## Capacidades

- Generación de texto conversacional: hereda la capacidad de chat multi-turno de Qwen2.5-7B-Instruct mediante plantilla Jinja (`--jinja`).
- Generación creativa de historias: el nombre del modelo indica una especialización en narración, presumiblemente en télugu, aunque no se aportan ejemplos ni evaluaciones.
- Soporte de tool calling / function calling: no confirmado para el modelo ajustado; la base Qwen2.5-7B-Instruct lo soporta, pero el ajuste fino puede haber degradado esta capacidad.
- Razonamiento multi-paso y agentes: no documentado para el modelo ajustado.
- Capacidades multilingües: no documentadas; la base Qwen2.5 cubre decenas de idiomas, pero el ajuste puede haber reducido el rendimiento en idiomas distintos del télugu.
- Capacidades especiales (thinking mode, visión, audio): no disponibles. La mención a `llama-mtmd-cli` en la model card es genérica y no implica soporte multimodal real en este modelo.

## Casos de uso

- Generación de cuentos y narraciones en télugu: el modelo puede emplearse para producir relatos breves o continuaciones narrativas en dicho idioma, aprovechando el ajuste específico; requiere validación humana de calidad lingüística.
- Prototipado local de chat conversacional: gracias a su tamaño de 7B y cuantización Q4_K_M, puede ejecutarse en un portátil con GPU consumer para experimentar con asistentes conversacionales sin depender de la nube.
- Evaluación de pipelines de fine-tuning: sirve como caso práctico para estudiar el flujo Unsloth → GGUF → llama.cpp/Ollama en entornos docentes o de investigación.
- Generación de contenido educativo en télugu: elaboración de material didáctico o divulgativo para hablantes de télugu, siempre con revisión editorial posterior.
- Despliegue en dispositivos con recursos limitados: al ocupar aproximadamente 4,7 GB en Q4_K_M, es viable en GPUs de 8 GB de VRAM o en CPU con suficiente RAM, útil para demos offline.
- Experimentación con plantillas Jinja y chat templates: permite probar la integración de plantillas de chat personalizadas en llama.cpp mediante la opción `--jinja`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en Q4_K_M (el archivo GGUF pesa 4,7 GB); se recomienda al menos 6-8 GB de VRAM para dejar margen al contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para despliegues concurrentes.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, etc.).
- Opciones de despliegue: llama.cpp (`llama-cli -hf krishna4murali/telugu-storyteller-v2 --jinja`), Ollama (incluye Modelfile), y potencialmente vLLM o TGI si se convierte a safetensors, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| telugu-storyteller-v2 | 7,6 B | no disponible (base 32.768) | no disponible | GGUF Q4_K_M | Ajuste comunitario sin evaluación publicada |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa generalista con evaluación pública |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema, con restricciones de licencia |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del ajuste ni sobre posibles regresiones respecto a la base.
- Licencia no declarada: no se especifica si el uso comercial está permitido; esto bloquea su adopción en producción sin aclaración previa del autor.
- Idiomas no documentados: aunque el nombre sugiere télugu, no se confirma el alcance multilingüe ni la calidad en otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 7B y potencialmente agravado por un ajuste fino con datos no documentados.
- Posible degradación de capacidades heredadas: el ajuste fino puede haber reducido el rendimiento en código, matemáticas o tool calling respecto a Qwen2.5-7B-Instruct.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, cultura o política.
- Contexto efectivo incierto: la model card no confirma la longitud de contexto soportada tras el ajuste y la cuantización.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad, lo que aumenta el riesgo de defectos no detectados.
- Único archivo cuantizado (Q4_K_M): no hay opciones de mayor precisión (Q8, FP16) para evaluar la pérdida por cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishna4murali/telugu-storyteller-v2
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- Qwen2.5-7B-Instruct (modelo base): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
