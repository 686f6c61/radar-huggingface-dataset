# junshim/When2Think-1.5B

## Resumen

When2Think-1.5B es un modelo de lenguaje causal de tipo híbrido de razonamiento, desarrollado por el usuario junshim y publicado bajo licencia MIT. Se construye como un ajuste fino posterior (post-training) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, del que hereda la arquitectura Qwen2 y aproximadamente 1,78 mil millones de parámetros. Su propuesta central es aprender no solo cómo razonar, sino cuándo hacerlo: el modelo decide de forma adaptativa si responder de manera directa (modo NoThink) o desplegar una traza de razonamiento explícita de varios pasos (modo Think), ajustando además la profundidad del razonamiento según la dificultad de cada instancia.

El problema que aborda es el coste computacional y de tokens asociado a los modelos de razonamiento: forzar trazas largas en problemas fáciles desperdicia cómputo, mientras que suprimirlas de forma uniforme degrada la precisión en casos difíciles. When2Think trata la profundidad de razonamiento como un recurso adaptable por instancia, reduciendo el gasto en ítems sencillos sin sacrificar el razonamiento extendido en los complejos. Frente a métodos de compresión de longitud uniforme, este enfoque conserva la capacidad de razonamiento en las tareas que realmente la requieren.

Es relevante ahora porque se alinea con la línea de investigación sobre razonamiento eficiente y modelos híbridos, y porque puede desplegarse como un modelo causal estándar sin necesidad de enrutador, verificador, estimador de dificultad, modelo de recompensa ni política de referencia adicionales en tiempo de inferencia. Está entrenado sobre el dataset agentica-org/DeepScaleR-Preview-Dataset y se documenta en el artículo arXiv 2609.19671.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia Qwen2 (según tag `qwen2`) |
| Parametros totales | 1.777.088.000 (~1,78 B, dato de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base DeepSeek-R1-Distill-Qwen-1.5B) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,1 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (relación: finetune) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de la familia Qwen2, con aproximadamente 1,78 mil millones de parámetros, heredada del modelo base DeepSeek-R1-Distill-Qwen-1.5B. No se trata de una arquitectura MoE, SSM ni híbrida a nivel de capas: la hibridación es de comportamiento, no estructural, ya que el modelo alterna entre modos de razonamiento (Think/NoThink) con el mismo conjunto de pesos.

El entrenamiento combina un post-entrenamiento con refuerzo verificable (RLVR, reinforcement learning with verifiable rewards) sobre el dataset agentica-org/DeepScaleR-Preview-Dataset. La componente clave es Instance-level Difficulty-Aware Control (IDAC), que regula la profundidad del razonamiento utilizando estadísticas precalculadas de precisión de referencia y uso de tokens. Batch-Wise Standardization (BWS) convierte las recompensas de trayectoria en ventajas estandarizadas, lo que permite una optimización estable tipo PPO sin crítico (critic-free). El muestreo por importancia (importance sampling, IS) se emplea durante el post-entrenamiento para equilibrar la exploración entre los modos Think y NoThink. Ninguno de estos componentes de entrenamiento es necesario en inferencia: el checkpoint liberado genera el comportamiento híbrido aprendido como un modelo causal estándar. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso explícito de RLHF/DPO.

## Capacidades

- Generación de texto conversacional y de razonamiento matemático.
- Razonamiento adaptativo híbrido: selecciona de forma aprendida entre respuesta directa (NoThink) y razonamiento explícito multi-paso (Think).
- Control de profundidad de razonamiento por instancia mediante IDAC, ajustando el gasto de tokens a la dificultad del problema.
- Resolución de problemas matemáticos y simbólicos (entrenado sobre DeepScaleR-Preview-Dataset).
- Despliegue autónomo como modelo causal estándar, sin enrutador, verificador, crítico, estimador de dificultad ni modelo de recompensa en inferencia.
- Punto de partida para post-entrenamiento continuado en tareas de razonamiento verificable (matemáticas, simbólico, código, ciencia).
- Capacidad multilingüe: limitada al inglés (idioma declarado: en).
- No se documentan en la información disponible capacidades de visión, audio, tool calling/function calling ni uso de agentes.

## Casos de uso

- Investigación en razonamiento eficiente: utilizar el modelo para estudiar políticas adaptativas de profundidad de razonamiento y comparar el coste en tokens frente a modelos que siempre razonan, gracias a sus dos modos aprendidos (Think/NoThink).
- Análisis de selección de modo Think/NoThink: inspeccionar cuándo el modelo decide responder de forma directa y cuándo activa una traza explícita, como objeto de estudio académico sobre asignación adaptativa de cómputo.
- Resolución de problemas matemáticos: emplear el modelo como solucionador de ecuaciones y problemas aritméticos/algebraicos, dejando que active razonamiento extendido solo en los ítems que lo requieran para reducir el gasto total de tokens.
- Post-entrenamiento continuado (continued post-training): usarlo como checkpoint de partida para ajuste adicional en tareas de razonamiento verificable, aprovechando su base RLVR ya establecida.
- Adaptación a dominios simbólicos, de código o científicos: servir de punto de partida para afinar en tareas de razonamiento con recompensa verificable fuera del ámbito estrictamente matemático.
- Generación de respuestas en inglés en asistentes conversacionales ligeros: desplegarlo como modelo conversacional de 1,78 B en entornos con recursos limitados donde el coste por token importa.
- Evaluación comparativa de métodos de compresión de longitud: usar la distinción de modos del modelo para contrastar enfoques de compresión uniforme frente a control adaptativo por instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,78 B de parámetros, no dato publicado):
  - Precisión completa fp32: ~7,1 GB de pesos.
  - bf16/fp16: ~3,6 GB de pesos; ~4-5 GB de VRAM con overhead de activaciones y caché KV.
  - int8: ~1,8 GB de pesos; ~2,5-3 GB de VRAM.
  - int4: ~0,9 GB de pesos; ~1,5-2 GB de VRAM.
- Cabe sobradamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, así como en GPUs con 8 GB o incluso 6 GB en cuantización int4.
- GPU de centro de datos recomendadas para despliegue en producción: A100, H100, L40S, según concurrencia y throughput requeridos.
- Opciones de despliegue: transformers (referenciado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM. No se listan versiones GGUF, por lo que llama.cpp/Ollama no están confirmados como soportados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento de razonamiento | Disponibilidad |
|---|---|---|---|---|---|
| When2Think-1.5B | 1,78 B | no disponible | MIT | Híbrido adaptativo (Think/NoThink + IDAC) | HuggingFace (junshim/When2Think-1.5B) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78 B (modelo base) | no disponible | no disponible en la información proporcionada | Razonamiento explícito destilado de R1 | HuggingFace |
| ThinkOnly-1.5B (mismo autor) | no disponible | no disponible | no disponible | Siempre razona (sin IS), profundidad controlada por IDAC | Referenciado en la model card de When2Think |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y comportamiento de razonamiento.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: al ser un modelo de razonamiento de 1,78 B, puede producir trazas plausibles pero incorrectas, especialmente en problemas matemáticos o simbólicos de alta dificultad.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; al derivar del modelo base DeepSeek-R1-Distill-Qwen-1.5B, puede heredar los sesgos de este y de sus datos de entrenamiento.
- Longitud de contexto: no especificada en la información proporcionada; conviene verificarla antes de usarla en tareas con contexto largo.
- El ajuste fino adicional puede alterar el equilibrio aprendido Think/NoThink, la longitud de respuesta y el comportamiento de profundidad de razonamiento (advertencia explícita del autor).
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento por si impusieran restricciones adicionales.
- Madurez y adopción: métricas muy bajas (441 descargas, 1 like) en el momento de la consulta; sin resultados de benchmarks publicados, la evaluación debe hacerse de forma empírica antes de llevarlo a producción.
- Cuantizaciones no verificadas: no se publican versiones GGUF/AWQ/GPTQ, por lo que el despliegue en formatos cuantizados requiere generarlas y validarlas por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junshim/When2Think-1.5B
- Artículo (paper): https://arxiv.org/abs/2609.19671
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Documentación de TextGenerationPipeline de transformers: https://huggingface.co/docs/transformers/v5.17.0/en/main_classes/pipelines#transformers.TextGenerationPipeline
