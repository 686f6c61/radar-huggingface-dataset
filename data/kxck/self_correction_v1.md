# Kxck/Self_Correction_v1

## Resumen

Self_Correction_v1 es un modelo de lenguaje afinado a partir de Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario Kxck. El objetivo es mejorar la capacidad de autocorrección del modelo en tareas de razonamiento matemático y generación de código. El entrenamiento se basa en ejemplos donde se proporciona un intento fallido junto con el feedback de un verificador objetivo, y la pérdida se calcula únicamente sobre la respuesta corregida y verificada. De esta forma, el modelo aprende a internalizar el proceso de corrección en lugar de simplemente imitar respuestas correctas.

Con 7.615.616.512 parámetros, el modelo hereda la arquitectura transformer decoder-only de Qwen2.5, con una ventana de contexto de 32.000 tokens (la misma que el modelo base). Los pesos están en formato safetensors en BF16 y el repositorio es compatible con vLLM, lo que facilita su despliegue en producción. Aunque el modelo no ha sido publicado con una licencia explícita ni con documentación detallada de entrenamiento, su enfoque en autocorrección lo hace relevante para aplicaciones donde se requiere robustez frente a errores iniciales en razonamiento y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 (hereda del modelo base) |
| Tipos de cuantizacion | no disponible (repo con pesos BF16) |
| Idiomas soportados | no disponible (hereda los idiomas de Qwen2.5, principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen2.5-7B-Instruct, por lo que conserva la arquitectura transformer estándar con atención de múltiples cabezas, normalización RMSNorm y capas de Qwen2.5. El entrenamiento se realizó con ejemplos de autocorrección: cada muestra incluye un intento fallido del modelo, el feedback de un verificador objetivo (por ejemplo, un compilador o un solucionador de matemáticas) y la respuesta corregida. La pérdida se calcula solo sobre la respuesta corregida, lo que fuerza al modelo a aprender a generar la corrección en lugar de predecir la respuesta original. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron técnicas adicionales como RLHF o DPO. El repositorio indica que los pesos están fusionados en BF16 y son cargables directamente con vLLM.

## Capacidades

- Generación de texto y diálogo conversacional, heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento matemático con capacidad de autocorrección: el modelo puede recibir un intento fallido y producir una versión corregida basada en feedback externo.
- Generación y corrección de código: entrenado con ejemplos donde un verificador (compilador o pruebas) señala errores y el modelo debe corregirlos.
- Autocorrección internalizada: a diferencia de enfoques de prompting como Reflexion, aquí la corrección se aprende durante el fine-tune, reduciendo la necesidad de múltiples pasos de inferencia en tiempo de ejecución.
- Soporte para tool calling: aunque no está explícitamente documentado en este repositorio, Qwen2.5-Instruct incluye soporte nativo para function calling, por lo que es probable que el modelo lo conserve.
- Capacidades multilingües: no se especifican, pero el modelo base soporta principalmente inglés y chino.

## Casos de uso

- Corrección automática de código en pipelines de CI/CD: el modelo puede recibir un fragmento de código que falla en las pruebas y generar una versión corregida, integrándose en un flujo de integración continua para reducir la intervención manual.
- Tutoría de programación: un asistente que presenta soluciones incorrectas deliberadas y pide al modelo que las corrija, ayudando a estudiantes a entender errores comunes.
- Resolución de problemas matemáticos con verificación: en entornos educativos o de investigación, el modelo puede usarse para generar soluciones y luego autocorregirlas cuando un verificador simbólico (p. ej., SymPy) detecta errores.
- Agentes autónomos de razonamiento multi-paso: el modelo puede integrarse en agentes que ejecutan acciones, reciben feedback del entorno y corrigen sus siguientes pasos, mejorando la tasa de éxito en tareas de planificación.
- Generación de datos sintéticos de corrección: el modelo puede usarse para crear datasets de entrenamiento donde se muestran intentos fallidos y correcciones, útiles para entrenar otros modelos más pequeños.
- Asistente de depuración en IDEs: integrado como plugin, el modelo puede sugerir correcciones a errores de compilación o excepciones en tiempo real, aprovechando su contexto de 32K tokens para considerar todo el archivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (7.6B parámetros), se requieren aproximadamente 15-16 GB de VRAM para cargar el modelo en memoria. Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas externas), se podría reducir a unos 5-6 GB.
- GPU recomendadas: para BF16, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB, H100). Para cuantización 4-bit, una RTX 3060 12GB o similar sería suficiente.
- Compatibilidad con consumer GPU: sí, con cuantización. Sin cuantizar, requiere GPU de gama alta o profesional.
- Opciones de despliegue: vLLM (compatible según el repositorio), llama.cpp, Ollama, TGI (text-generation-inference). El formato safetensors permite conversión a GGUF para uso en CPU.
- Latencia y throughput: no hay datos oficiales. Como referencia, Qwen2.5-7B en BF16 con vLLM en una A100 puede alcanzar ~50-100 tokens/s en generación, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Kxck/Self_Correction_v1 | 7.6B | 32K | Fine-tune con autocorrección | no disponible |
| Qwen2.5-7B-Instruct | 7.6B | 32K | Instruct general | Apache 2.0 |
| Llama-3.1-8B-Instruct | 8.0B | 128K | Instruct general | Llama 3.1 Community License |
| Mistral-7B-Instruct v0.3 | 7.3B | 32K | Instruct general | Apache 2.0 |

No hay datos de rendimiento comparativo. La diferencia principal de Self_Correction_v1 es su entrenamiento específico para autocorrección, que podría mejorar la precisión en tareas de razonamiento y código frente a los modelos base, aunque sin benchmarks no se puede cuantificar.

## Limitaciones y advertencias

- No se ha publicado una licencia explícita, lo que impide determinar si es apto para uso comercial. Se recomienda contactar con el autor antes de usarlo en producción.
- No hay información sobre el dataset de entrenamiento, su tamaño ni su composición, por lo que se desconocen posibles sesgos.
- El modelo hereda las limitaciones de Qwen2.5-7B-Instruct: puede alucinar en temas factuales, especialmente fuera de sus dominios principales.
- La capacidad de autocorrección depende de la calidad del verificador utilizado durante el entrenamiento; en escenarios reales, el feedback externo puede no estar disponible.
- No se han publicado evaluaciones de seguridad, robustez o sesgos, por lo que no se recomienda su uso en aplicaciones sensibles sin una evaluación adicional.
- El contexto de 32K tokens, aunque amplio, puede ser insuficiente para tareas que requieran ventanas muy largas (p. ej., repositorios completos de código).
- No hay soporte garantizado para idiomas distintos del inglés y chino, aunque el modelo base tiene cierta capacidad multilingüe.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kxck/Self_Correction_v1
- Paper de Reflexion (referencia al enfoque de autocorrección): https://openreview.net/forum?id=FDG2G7JDWO
- Artículo sobre agentes autocorrectivos: https://dev.to/louis-sanna/self-correcting-ai-agents-how-to-build-ai-that-learns-from-its-mistakes-39f1
- Tutorial de agentes autocorrectivos con Reflexion y LangGraph: https://medium.com/@vi.ha.engr/building-a-self-correcting-ai-a-deep-dive-into-the-reflexion-agent-with-langchain-and-langgraph-ae2b1ddb8c3b
