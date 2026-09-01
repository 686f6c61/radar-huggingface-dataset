# CortexLM/Teutonic-1-Chat-Preview

## Resumen

Teutonic-1-Chat-Preview es un modelo de lenguaje de la familia Qwen3.5, desarrollado por CortexLM como parte del ecosistema Bittensor. Se trata de un checkpoint de previsualización, aún en entrenamiento activo, que combina atención híbrida (lineal + softmax) en una arquitectura de aproximadamente 9 000 millones de parámetros. Su objetivo principal es la conversación de contexto largo con razonamiento explícito tipo thinking, orientado a la resolución verificable de problemas matemáticos y de código.

El modelo parte de Qwen/Qwen3.5-9B y ha pasado por un proceso de entrenamiento en tres fases: mid-training con currículo de contexto largo (8k → 32k → 64k), fine-tuning supervisado con trazas de razonamiento y tool calling, y optimización por refuerzo con recompensas verificables. Los pesos por defecto están cuantizados en FP8 (e4m3 block-scaled), lo que permite una inferencia eficiente. La ventana de contexto alcanza 256 000 tokens de entrada, aunque la generación larga (más de 32k tokens de salida) aún no está completamente estabilizada en esta versión de previsualización.

La relevancia de este modelo reside en su arquitectura híbrida de atención, que combina las ventajas de la atención lineal (menor coste computacional en secuencias largas) con la atención softmax tradicional (mayor calidad en tareas de precisión). Está pensado para desarrolladores que necesitan un modelo de ~9B con capacidades de razonamiento y herramientas, desplegable en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención softmax), linaje Qwen3.5 |
| Parametros totales | 8 953 803 264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 000 tokens de entrada (RoPE max_position_embeddings = 262 144) |
| Tipos de cuantizacion | FP8 (e4m3 block-scaled, configuracion quantization_config estilo Qwen) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala capas de atención lineal con capas de atención softmax, siguiendo el linaje textual de Qwen3.5. Esta combinación busca reducir el coste cuadrático de la atención tradicional en secuencias muy largas, manteniendo la capacidad de razonamiento de precisión que aporta la atención softmax. El modelo conserva la capacidad RoPE de 262 144 posiciones, lo que permite procesar entradas de hasta 256k tokens.

El entrenamiento se realizó en cuatro etapas. Primero, un mid-training con currículo de contexto largo (8k → 32k → 64k) bajo FP8 para extender el contexto útil. Después, un fine-tuning supervisado con datos de chat, trazas de razonamiento (thinking) y tool calling. A continuación, una fase de reinforcement learning con recompensas verificables, centrada en problemas matemáticos con respuestas en formato `\boxed{}` y tareas de código. Finalmente, una etapa de continuación para larga salida, con presupuestos de respuesta de 16k a 32k tokens. El modelo no ha pasado por una fase completa de alineación por preferencias; los autores indican que la optimización de preferencias sigue en curso.

## Capacidades

- Generación de texto conversacional con plantilla de chat que soporta bloques de razonamiento opcionales delimitados por ` thinking… response`.
- Razonamiento explícito tipo thinking: el modelo puede generar una cadena de razonamiento interna antes de dar la respuesta final, activable mediante el parámetro `enable_thinking` en la plantilla de chat.
- Tool calling: soporte de etiquetas de herramientas en la plantilla de chat, lo que permite integración con funciones externas.
- Resolución de problemas matemáticos con respuestas verificables en formato `\boxed{}`, optimizada mediante RL con recompensas automáticas.
- Generación de código, con refuerzo orientado a recompensas verificables en tareas de programación.
- Contexto largo: hasta 256k tokens de entrada, con entrenamiento específico para mantener el comportamiento tipo needle-in-a-haystack en secuencias extensas.
- Generación de respuestas largas: presupuestos de salida de hasta 32k tokens de forma razonablemente estable (64k en progreso, no fiable en esta previsualización).
- Multilingüismo: limitado al inglés; no se menciona soporte para otros idiomas.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas de álgebra, cálculo o aritmética mostrando su cadena de razonamiento y devolviendo la respuesta en formato `\boxed{}`, lo que facilita la verificación automática en entornos educativos o de evaluación.
- Agente de código con tool calling: gracias al soporte de herramientas y al refuerzo con recompensas verificables, puede integrarse en pipelines de CI/CD para generar, revisar o corregir fragmentos de código, invocando funciones externas cuando sea necesario.
- Análisis de documentos largos: con 256k tokens de contexto, puede procesar manuales técnicos, informes extensos o bases de conocimiento completas, respondiendo preguntas sobre el contenido sin necesidad de dividir el texto.
- Chat conversacional de dominio técnico: su fine-tuning con trazas de razonamiento lo hace adecuado para asistentes de soporte técnico que necesitan explicar pasos de resolución de problemas complejos.
- Generación de respuestas extensas: con presupuestos de salida de hasta 32k tokens, puede redactar informes detallados, documentación técnica o análisis profundos a partir de una consulta breve.
- Evaluación de modelos y benchmarks privados: al no reclamar resultados en benchmarks públicos contaminados, es útil como modelo de referencia en suites de evaluación cuidadosamente decontaminadas, especialmente en tareas de razonamiento matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama SOTA en benchmarks públicos y que los números tipo GSM8K deben tratarse con cautela por posible contaminación. Los autores recomiendan usar suites privadas o decontaminadas para comparaciones fiables. Se mencionan mejoras internas en sondas de razonamiento matemático tras la fase de RL, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 de ~9B ocupan aproximadamente 9 GB. Con overhead de KV cache y activaciones, se estima un consumo de 12-16 GB para contexto moderado (8k-32k tokens). Para contexto de 256k tokens, la KV cache puede superar los 20 GB adicionales, requiriendo más de 32 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) o superior para contexto moderado; A100 40 GB o H100 para contexto largo. En consumer GPU, una RTX 3090 o 4090 puede ejecutar el modelo con contexto de hasta 32k tokens.
- Opciones de despliegue: transformers con `trust_remote_code=True` (carga automática de pesos FP8 vía `quantization_config`), vLLM con `--dtype auto` y `--max-model-len` configurable, y compatible con endpoints OpenAI.
- Latencia y throughput: no se han publicado datos concretos. La arquitectura híbrida debería ofrecer mejor escalado en secuencias largas que un transformer softmax puro, pero los kernels híbridos requieren versiones recientes de transformers o vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Teutonic-1-Chat-Preview | ~9B | 256k | Apache 2.0 | FP8 | Híbrido lineal+softmax, razonamiento thinking |
| Qwen3-8B | 8B | 32k (hasta 128k con YaRN) | Apache 2.0 | FP8, BF16 | Transformer estándar, sin atención híbrida |
| Llama-3.1-8B | 8B | 128k | Llama 3.1 Community License | BF16, FP8 | Transformer estándar, amplio ecosistema |
| Gemma-2-9B | 9B | 8k | Gemma License | BF16 | Transformer estándar, sin tool calling nativo |

No se dispone de datos de rendimiento comparativos publicados para Teutonic-1-Chat-Preview. La comparativa se limita a especificaciones técnicas. La principal diferenciación de Teutonic es su arquitectura híbrida y su entrenamiento específico para razonamiento verificable, frente a alternativas más generalistas.

## Limitaciones y advertencias

- Checkpoint de previsualización: los pesos y las APIs pueden cambiar en futuras versiones; no es una versión estable para producción.
- Generación larga no estabilizada: la salida de más de ~32k tokens no está completamente endurecida; se recomienda tratar 64k como aspiracional.
- Alineación incompleta: el modelo no ha pasado por una optimización completa de preferencias; puede sobre-pensar (generar razonamiento excesivo) o rechazar peticiones de forma insuficiente.
- Sesgos y alucinación: al ser un modelo entrenado principalmente en inglés y con foco en matemáticas/código, puede alucinar en dominios factuales o no técnicos. No se han publicado evaluaciones de sesgos.
- Idioma: solo inglés; no es adecuado para aplicaciones multilingües.
- Dependencia de kernels recientes: la arquitectura híbrida requiere versiones actualizadas de transformers o vLLM; en versiones antiguas puede fallar la carga o la inferencia.
- Sin benchmarks públicos fiables: no hay datos de rendimiento comparativos publicados; cualquier cifra externa debe tratarse con cautela por posible contaminación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CortexLM/Teutonic-1-Chat-Preview
- Organización CortexLM en HuggingFace: https://huggingface.co/CortexLM/models
- Informe técnico de Teutonic-I 10B (proyecto relacionado en Bittensor): https://teutonic.ai/paper.html
- Modelos de CortexLM en HuggingFace: https://huggingface.co/models?other=cortexlm
