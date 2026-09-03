# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-016

## Resumen

Este repositorio contiene un checkpoint de política del experimento "static-rubric discriminability-horizon" desarrollado por HYU-NLP-EVAL. Se trata de un fine-tuning del modelo Qwen/Qwen3-1.7B mediante el algoritmo de reinforcement learning GRPO (Group Relative Policy Optimization), con una recompensa basada en una rúbrica estática congelada (R0) específica del prompt. El dominio de entrenamiento es medicina (RaR Medicine) y el checkpoint corresponde al paso de optimización 016 con semilla 11.

El modelo tiene 1.720.574.976 parámetros y se distribuye en formato BF16 safetensors bajo licencia Apache 2.0. Su propósito declarado es servir como artefacto de investigación para estudiar la saturación de recompensas y el estancamiento de rúbricas estáticas durante la optimización de políticas. No es un modelo final orientado a producción, sino una instantánea de un proceso experimental. La relevancia actual radica en que permite a investigadores en RLHF y evaluación de modelos analizar cómo evoluciona una política cuando la señal de recompensa permanece fija, un problema común en el entrenamiento de sistemas conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B, no especificada en el repositorio) |
| Tipos de cuantizacion | No disponible (pesos en BF16 safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento aplica GRPO, un algoritmo de optimización de políticas que agrupa respuestas generadas y calcula ventajas relativas dentro del grupo. La recompensa utilizada es una rúbrica estática (R0) congelada, específica del prompt, que no se actualiza durante el entrenamiento. Esta elección deliberada permite aislar el efecto de la "staleness" de la rúbrica sobre la política aprendida. El dominio de entrenamiento es medicina (RaR Medicine), con diez puntos de auditoría planificados hasta el paso 48; este repositorio contiene el paso 016. El checkpoint incluye pesos, configuración, tokenizador y plantilla de chat, pero excluye optimizador, scheduler, estado del entrenador, rollouts, rúbricas y datos de evaluación. No se han publicado detalles sobre el dataset específico ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-1.7B.
- Plantilla de chat incluida en el repositorio, compatible con el pipeline de transformers.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada; es probable que el modelo base las tenga, pero no se confirma para este checkpoint.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Su función principal es servir como artefacto de investigación para el análisis de políticas entrenadas con recompensas estáticas, no como modelo de propósito general.

## Casos de uso

- Investigación en RLHF y optimización de políticas: permite comparar la evolución de una política en diferentes pasos de entrenamiento (step 0, 3, 16, etc.) bajo una rúbrica estática, para estudiar fenómenos como la saturación de recompensa.
- Estudio de estancamiento de rúbricas (rubric staleness): analizar cómo la política se aleja de la distribución de datos cuando la señal de recompensa no se actualiza, un problema crítico en el entrenamiento de asistentes.
- Benchmarking de algoritmos de RL: sirve como punto de referencia para evaluar nuevas variantes de GRPO u otros métodos de optimización en dominios especializados como medicina.
- Análisis de sesgos y alucinaciones en dominios de conocimiento especializado: al estar entrenado en un dominio concreto con una rúbrica fija, puede usarse para estudiar cómo la política genera respuestas médicas y dónde falla.
- Desarrollo de métodos de evaluación automática: comparar las salidas de este checkpoint con las de modelos entrenados con rúbricas dinámicas ayuda a calibrar métricas de calidad de respuesta.
- Reproducibilidad de experimentos científicos: el checkpoint incluye configuración y tokenizador, lo que permite replicar el experimento o continuar el entrenamiento desde este punto exacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones comparativas con otros modelos ni métricas de calidad de generación. Su propósito es experimental, no competitivo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB en BF16 (el modelo tiene 1.72B parámetros, los pesos ocupan ~3.5 GB; se necesita memoria adicional para KV cache y activaciones). Una GPU con 8 GB de VRAM es suficiente para pruebas básicas.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, o superiores. Para entrenamiento o fine-tuning adicional, se recomienda A100 o H100.
- Compatibilidad con GPUs de consumo: sí, el tamaño del modelo lo hace accesible en hardware consumer.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles para este checkpoint específico; el modelo base Qwen3-1.7B es conocido por ofrecer baja latencia en GPUs consumer, pero no se han medido métricas oficiales aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.72B | 32k (según documentación oficial de Qwen3) | Apache 2.0 | Modelo base, sin fine-tuning RL |
| Este checkpoint (step 016) | 1.72B | No disponible | Apache 2.0 | Fine-tuning GRPO con rúbrica estática en medicina |
| Otros checkpoints del mismo experimento (step 0, 3, 48) | 1.72B | No disponible | Apache 2.0 | Misma configuración, diferentes pasos de optimización |

La comparación principal es entre este checkpoint y el modelo base o checkpoints anteriores del mismo experimento, para observar la deriva de la política. No se dispone de datos de rendimiento para comparar con otros fine-tunes de Qwen3 en medicina.

## Limitaciones y advertencias

- Checkpoint de investigación: no es un modelo final ni está optimizado para uso en producción; puede producir respuestas incoherentes o subóptimas fuera del dominio de entrenamiento.
- Dominio restringido: entrenado específicamente en medicina (RaR Medicine); su rendimiento en otros dominios es desconocido y probablemente deficiente.
- Riesgo de alucinaciones médicas: el modelo puede generar información médica incorrecta o peligrosa. No debe utilizarse como sustituto del consejo médico profesional.
- Sesgos potenciales: el entrenamiento con una rúbrica estática puede amplificar sesgos presentes en los datos de entrenamiento o en la propia rúbrica.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto para este checkpoint; se hereda del modelo base, pero no se garantiza.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el aviso del autor indica explícitamente que no es un dispositivo médico y no debe usarse como tal.
- Sin garantías de calidad: no se han publicado evaluaciones ni benchmarks, por lo que el rendimiento real es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-016
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentación de GRPO (artículo original): https://arxiv.org/abs/2402.03300
- No se han encontrado papers, blogs o demos adicionales asociados a este experimento específico en la información proporcionada.
