# ifra817/InjecGuard-Qwen2.5-7B-DPO

## Resumen

InjecGuard-Qwen2.5-7B-DPO es un modelo de lenguaje de 7B parámetros, resultado de un fine-tuning con optimización directa de preferencias (DPO) sobre el modelo base Qwen/Qwen2.5-7B-Instruct-1M. El nombre y el repositorio de GitHub asociado (InjecGuard/InjecGuard) indican que su propósito principal es la detección y mitigación de ataques de inyección de prompts, una vulnerabilidad crítica en aplicaciones que integran LLMs. El modelo está entrenado con el framework TRL de HuggingFace y se distribuye en formato safetensors.

La relevancia de este modelo radica en la creciente necesidad de proteger sistemas basados en LLM frente a manipulaciones maliciosas de entrada. Aunque el fine-tuning con DPO es una técnica estándar para alinear preferencias, su aplicación específica a la seguridad de prompts es un área emergente. El proyecto InjecGuard afirma superar al mejor modelo existente en un 30,8% en el benchmark NotInject, aunque no se dispone de resultados detallados para esta variante concreta.

Al tratarse de un modelo derivado de Qwen2.5-7B-Instruct-1M, hereda las capacidades generales de razonamiento, generación de texto y comprensión multilingüe del modelo base, pero su entrenamiento específico lo orienta hacia la identificación de instrucciones maliciosas en el contexto de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct-1M) |
| Parametros totales | No disponible (modelo base de 7B, pero no se especifica el total tras el fine-tuning) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.000.000 tokens (según nombre del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica para este fine-tuning) |
| Licencia | No especificada (la model card indica "license" sin detallar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct-1M, un transformer decoder-only preentrenado con 18 billones de tokens según el reporte técnico de Qwen2.5. El fine-tuning se realizó mediante DPO (Direct Preference Optimization), método introducido en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (arXiv:2305.18290). Este enfoque optimiza directamente las preferencias humanas sin necesidad de un modelo de recompensa explícito.

El entrenamiento se llevó a cabo con TRL 1.10.0, Transformers 4.57.6, PyTorch 2.10.0+cu128 y Datasets 5.0.1. No se especifican los datos de entrenamiento, el número de pasos ni los hiperparámetros utilizados. El repositorio de GitHub de InjecGuard sugiere que el objetivo es la detección de inyecciones de prompts, pero no se detalla la composición del dataset de preferencias.

## Capacidades

- Detección de inyección de prompts: el modelo está diseñado para identificar instrucciones maliciosas incrustadas en entradas de usuario, según el propósito del proyecto InjecGuard.
- Generación de texto y razonamiento: al heredar las capacidades de Qwen2.5-7B-Instruct, puede realizar tareas de generación, resumen, respuesta a preguntas y razonamiento lógico.
- Soporte de contexto largo: la ventana de 1M tokens permite procesar documentos extensos o conversaciones de muchas vueltas.
- Capacidades multilingües: el modelo base Qwen2.5 soporta más de 29 idiomas, aunque no se confirma que el fine-tuning conserve todas ellas.
- No se documentan capacidades específicas de tool calling, agentes o modo de pensamiento para esta variante.

## Casos de uso

- Filtrado de entradas en aplicaciones de chat: el modelo puede actuar como capa de seguridad previa a un LLM principal, analizando las entradas del usuario para detectar intentos de inyección de prompts antes de que lleguen al modelo de generación.
- Protección de asistentes virtuales empresariales: en sistemas de atención al cliente automatizada, donde los usuarios podrían intentar manipular al asistente para obtener información privilegiada o ejecutar acciones no autorizadas.
- Moderación de contenido en foros o comunidades: detectar mensajes que contengan instrucciones ocultas dirigidas a otros usuarios o a bots integrados.
- Auditoría de logs de interacción: analizar conversaciones previas para identificar intentos de ataque y mejorar las políticas de seguridad.
- Entrenamiento de sistemas de defensa: servir como componente en pipelines de red teaming para evaluar la robustez de otros LLMs frente a inyecciones.
- Investigación en seguridad de IA: como base para experimentos académicos sobre mitigación de ataques adversarios en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto. El repositorio de GitHub del proyecto InjecGuard menciona un benchmark llamado NotInject y afirma superar al mejor modelo existente en un 30,8%, pero no se detalla si este resultado corresponde exactamente a esta variante (InjecGuard-Qwen2.5-7B-DPO) o a otra configuración. No se dispone de métricas como MMLU, HumanEval o GSM8K para este fine-tuning.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 7B parámetros, en FP16 requiere aproximadamente 14-16 GB de VRAM para inferencia. Con cuantización a 4 bits (por ejemplo, GPTQ o AWQ) puede reducirse a unos 4-6 GB.
- GPUs recomendadas: tarjetas con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.) para FP16. Con cuantización, puede ejecutarse en GPUs consumer de 8 GB (RTX 3070, RTX 4060).
- Despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos al formato adecuado (GGUF para llama.cpp).
- Latencia y throughput: no disponibles en la documentación. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificación de unos 20-40 ms por token en FP16, y mayor throughput con batching.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de inyección de prompts. Existen alternativas como Llama Guard (Meta) o modelos específicos de seguridad, pero no se han encontrado datos comparativos para este modelo en la información proporcionada.

## Limitaciones y advertencias

- No se especifica la licencia de uso: la model card indica "license" sin detallar los términos, lo que genera incertidumbre sobre su uso comercial.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5, puede heredar sesgos presentes en el modelo base.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas o inventadas, especialmente en tareas fuera del ámbito de detección de inyecciones.
- Limitaciones de idioma: no se confirma que el fine-tuning mantenga el soporte multilingüe completo del modelo base.
- La ausencia de benchmarks públicos impide validar su eficacia real en la detección de inyecciones fuera de los casos reportados por el autor.
- El repositorio de GitHub sugiere que el proyecto está en fase de investigación; no hay evidencia de despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifra817/InjecGuard-Qwen2.5-7B-DPO
- Repositorio GitHub de InjecGuard: https://github.com/InjecGuard/InjecGuard
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Reporte técnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Colección Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
