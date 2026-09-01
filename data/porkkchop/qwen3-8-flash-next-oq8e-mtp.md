# PorkkChop/Qwen3.8-Flash-Next-oQ8e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-mtp es una cuantización de 8 bits del modelo Qwen3.8-Flash-Next, desarrollada por PorkkChop mediante la herramienta oMLX (oQ) con precisión mixta y matriz de importancia (imatrix). El modelo base, creado por Alibaba Qwen, es un MoE ultra-sparse multimodal de 125B parámetros totales (6B activos por token) con una tabla de embeddings n-gram de 51B y un módulo de predicción multi-token (MTP). Esta cuantización conserva los tensores MTP (76 tensores `mtp.*`) y está optimizada para ejecución en Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que ofrece una versión cuantizada de un modelo de última generación que combina atención híbrida GDN (Gated DeltaNet) y QSA (Qwen Sparse Attention), con una ventana de contexto de 262K tokens. El resultado es un paquete de 194.9 GB en formato MLX safetensors, pensado para despliegue local en equipos con memoria unificada, como el Apple M3 Ultra con 256 GB, donde alcanza velocidades de generación de hasta 42.1 tokens por segundo en tareas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN + QSA (qwen4_exp) |
| Parametros totales | 125B (modelo base), 52.557.958.499 en safetensors cuantizado |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | oQ8e (8 bits, grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Es un MoE ultra-sparse con 125B parámetros totales, de los cuales solo 6B se activan por token, más una tabla de embeddings n-gram de 51B que mejora la representación léxica. Incluye un módulo de predicción multi-token (MTP) que acelera la decodificación.

La cuantización oQ8e se realizó con oMLX v0.6.4, aplicando cuantización de precisión mixta con matriz de importancia (oQe) y preservando los tensores MTP. El proceso convierte el modelo original a MLX y luego aplica cuantización de 8 bits con grupo de 64. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte de modo "thinking" que puede activarse o desactivarse (en la cuantización se probó con thinking off).
- Multimodal: el modelo base acepta entradas de imagen y texto (según la documentación de Qwen), aunque la cuantización no especifica limitaciones al respecto.
- Generación de código y resolución de tareas de programación, como se muestra en el benchmark de la función Fibonacci.
- Soporte de tool calling y function calling, habitual en la familia Qwen.
- Capacidades de agente con razonamiento multi-paso y "preserved thinking" que mantiene el historial de razonamiento completo a lo largo de la conversación.
- Contexto largo de 262K tokens, adecuado para documentos extensos, codebases completos y conversaciones complejas.
- Predicción multi-token (MTP) preservada, que acelera la generación al predecir varios tokens a la vez.

## Casos de uso

- Asistente de programación en entornos locales: el modelo puede generar código, explicar algoritmos y depurar errores. Su velocidad de 42.1 tok/s en tareas cortas (en Apple M3 Ultra) permite una interacción fluida en un IDE o terminal.
- Análisis de documentación técnica extensa: con 262K tokens de contexto, puede procesar manuales, especificaciones o papers completos en una sola pasada, extrayendo información relevante y respondiendo preguntas sobre el contenido.
- Agente autónomo para automatización de tareas: gracias al soporte de tool calling y al "preserved thinking", puede mantener coherencia en decisiones a lo largo de múltiples pasos, ideal para flujos de trabajo que requieren planificación y ejecución secuencial.
- Procesamiento de codebases completos: el contexto largo permite cargar un repositorio entero y realizar tareas de refactorización, generación de tests o revisión de código con conocimiento global del proyecto.
- Chatbot de atención al cliente con memoria extendida: la ventana de 262K tokens permite mantener conversaciones muy largas sin perder el hilo, reduciendo la necesidad de resúmenes intermedios.
- Investigación y resumen de documentos legales o financieros: el modelo puede leer contratos extensos, informes anuales o expedientes, y generar resúmenes estructurados o responder consultas específicas sobre cláusulas y cifras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye mediciones de rendimiento de inferencia en Apple M3 Ultra (256 GB) con oMLX 0.6.4, thinking off, temperatura 0 y profundidad MTP 3. Se comparan tres cuantizaciones (oQ4e, oQ6e, oQ8e) en una tarea de generación de código (función Fibonacci en Python) y con contextos de 4K, 8K y 16K tokens.

| Metrica (oQ8e) | Valor |
|---|---|
| Tiempo hasta completar (tarea corta) | 2.57 s |
| Tiempo hasta primer token | 0.67 s |
| Tokens generados | 80 |
| Velocidad de escritura (tarea corta) | 42.1 tok/s |
| Velocidad de lectura (tarea corta) | 38.9 tok/s |
| Velocidad de escritura (contexto 4K) | 41.9 tok/s |
| Velocidad de escritura (contexto 8K) | 43.7 tok/s |
| Velocidad de escritura (contexto 16K) | 47.5 tok/s |
| Velocidad de lectura (contexto 4K) | 581 tok/s |
| Velocidad de lectura (contexto 8K) | 716 tok/s |
| Velocidad de lectura (contexto 16K) | 763 tok/s |

Estos datos muestran que la velocidad de generación se mantiene estable incluso con contextos largos, mientras que la velocidad de lectura (ingesta de prompt) mejora notablemente con contextos mayores gracias al procesamiento paralelo.

## Requisitos de hardware

- Memoria mínima: según unsloth, el modelo puede ejecutarse localmente con 75 GB de RAM o memoria unificada, sin necesidad de VRAM dedicada.
- Equipo de referencia: Apple M3 Ultra con 256 GB de memoria unificada, donde se realizaron los benchmarks.
- GPU recomendadas: para ejecución en GPU, se necesitarían al menos 2 GPUs con 80 GB de VRAM cada una (por ejemplo, A100 o H100) para alojar el modelo cuantizado de 8 bits, cuyo tamaño en memoria ronda los 100-150 GB (estimación basada en el tamaño del repositorio de 194.9 GB, que incluye overhead).
- Opciones de despliegue: al ser formato MLX, está pensado para Apple Silicon mediante MLX. Para otras plataformas, sería necesario convertir a otros formatos (GGUF, etc.), aunque no se proporciona soporte oficial.
- Latencia y throughput: en Apple M3 Ultra, la velocidad de generación es de 42.1 tok/s en tareas cortas y la ingesta de prompt alcanza 763 tok/s con contexto de 16K.

## Comparativa con modelos similares

La comparativa se centra en las variantes de cuantización del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Cuantizacion | Parametros totales | Contexto | Velocidad escritura (corto) | Velocidad lectura (corto) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp | oQ4e (4 bits) | 125B | 262K | 64.4 tok/s | 51.2 tok/s | qwen-community-1.0 |
| Qwen3.8-Flash-Next-oQ6e-mtp | oQ6e (6 bits) | 125B | 262K | 56.1 tok/s | 40.3 tok/s | qwen-community-1.0 |
| Qwen3.8-Flash-Next-oQ8e-mtp (este) | oQ8e (8 bits) | 125B | 262K | 42.1 tok/s | 38.9 tok/s | qwen-community-1.0 |
| Qwen3.8-Flash-Next (original) | FP16/BF16 | 125B | 262K | no disponible | no disponible | qwen-community-1.0 |

La cuantización de 8 bits ofrece mayor fidelidad que las versiones de 4 y 6 bits, a costa de una velocidad de generación menor. Para aplicaciones donde la calidad es prioritaria y el hardware lo permite, oQ8e es la opción más segura.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; aunque permite uso comercial, es necesario revisar los términos específicos, especialmente en lo relativo a despliegues a gran escala o modificaciones del modelo.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se han documentado sesgos específicos en la información disponible.
- Existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en el contexto.
- La cuantización de 8 bits reduce la precisión numérica respecto al modelo original, lo que puede afectar ligeramente a la calidad en tareas de alta sensibilidad (matemáticas avanzadas, razonamiento lógico).
- El formato MLX limita el despliegue a Apple Silicon; para otras plataformas se requiere conversión, que puede no estar optimizada.
- No se dispone de información sobre los idiomas soportados; el modelo base de Qwen suele cubrir múltiples idiomas, pero no se confirma en esta ficha.
- El tamaño del repositorio (194.9 GB) implica requisitos de almacenamiento considerables y tiempos de descarga largos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/PorkkChop/Qwen3.8-Flash-Next-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de oMLX (oQ): https://github.com/jundot/omlx
- Repositorio de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Variante oQ4e: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
