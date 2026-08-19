# FRPO/qwen3-1.7b-a12_dapo_frpo-k1-cNone-clip0.2_0.28-mb4-eta100-bs256x5-n2

## Resumen

Este repositorio contiene un checkpoint de investigación obtenido mediante fine-tuning con aprendizaje por refuerzo (RL) del modelo Qwen/Qwen3-1.7B, utilizando el framework verl de Volcengine. El experimento pertenece a la serie "KL-in-LLM-RL / FRPO" y el nombre del repositorio codifica los hiperparámetros del entrenamiento (k1, clip0.2_0.28, mb4, eta100, bs256x5, n2). Se trata de un checkpoint intermedio (global_step_200) guardado en fp32 sin post-procesado, tal y como lo generó el entrenador.

El modelo base es un transformer decoder-only de 1.700 millones de parámetros de la familia Qwen3, orientado a generación de texto y conversación. Este checkpoint RL busca estudiar el efecto de la optimización de políticas con regularización KL en modelos pequeños. Es un artefacto de investigación, con cero descargas y sin licencia declarada, por lo que no está pensado para uso directo en producción.

Su relevancia radica en que permite reproducir y analizar experimentos de RL para LLMs, comparar comportamientos con el modelo base y explorar variantes del algoritmo FRPO. Al no incluir benchmarks ni documentación adicional, su utilidad práctica queda limitada al ámbito académico y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo fp32 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only con atención causal y 1.700 millones de parámetros. Sobre esta base se aplicó un proceso de fine-tuning con aprendizaje por refuerzo utilizando el framework verl. El algoritmo empleado se denomina FRPO (acrónimo no expandido en la documentación) y forma parte de los experimentos "KL-in-LLM-RL". El nombre del repositorio sugiere el uso de DAPO (Decoupled Alignment Policy Optimization) como referencia, aunque no se detalla la relación exacta entre ambos.

Los hiperparámetros codificados en el nombre incluyen un factor K=1, rangos de clipping 0.2 y 0.28, mini-batch de 4, eta=100, batch size de 256 con 5 réplicas y 2 nodos. El checkpoint guardado corresponde al paso global 200. Los pesos se almacenaron en fp32 exactamente como los generó el entrenador, sin cuantización ni post-procesado. No se especifica la composición del dataset de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3-1.7B para completar y generar texto coherente.
- Conversación: el tag `conversational` indica que el modelo puede mantener diálogos multi-turno, aunque no se detalla su comportamiento tras el RL.
- Razonamiento: al ser un fine-tuning del Qwen3, conserva las capacidades de razonamiento básico del modelo base, pero no hay evidencia de mejoras específicas.
- Tool calling: no se menciona soporte explícito en la documentación del checkpoint.
- Capacidades multilingües: no se especifican idiomas soportados.
- Modo de pensamiento (thinking): no disponible en la información proporcionada.

## Casos de uso

- Reproducción de experimentos de investigación: permite replicar los resultados del entrenamiento FRPO sobre Qwen3-1.7B y verificar el efecto de los hiperparámetros codificados en el nombre.
- Análisis de regularización KL en RL: sirve para estudiar cómo el clipping y el factor K afectan la estabilidad del entrenamiento y la calidad de las respuestas.
- Comparación con el modelo base: se puede evaluar el impacto del RL en tareas de generación, razonamiento y conversación frente a Qwen/Qwen3-1.7B original.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para continuar el entrenamiento con otros algoritmos o datasets.
- Desarrollo de algoritmos de RL para LLMs: el repositorio incluye el código de verl, permitiendo experimentar con variantes de FRPO y DAPO.
- Estudio de escalabilidad: al ser un modelo pequeño (1.7B), es adecuado para probar configuraciones de RL en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 8,2 GB solo para los pesos (2.031.739.904 parámetros × 4 bytes). Con activaciones y overhead, se recomiendan al menos 10-12 GB.
- Para inferencia en bf16 o fp16 (tras conversión manual): ~4,1 GB de pesos, viable en GPUs con 8 GB o más.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40/80 GB) o superiores para fp32. Para bf16, una RTX 3060 (12 GB) o RTX 4070 serían suficientes.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con el ecosistema HuggingFace (transformers, text-generation-inference). También puede convertirse a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan pesos cuantizados.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FRPO/qwen3-1.7b-a12_dapo_frpo (este) | 2.03B (fp32) | no disponible | RL (FRPO/DAPO) sobre Qwen3-1.7B | no disponible | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1.7B | 32K (según documentación de Qwen3) | Pre-entrenamiento + instruct | Apache 2.0 | HuggingFace |
| DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | 32K | Destilación de R1 | MIT | HuggingFace |

La comparación se limita a características generales, ya que no hay datos de rendimiento para este checkpoint. El modelo base Qwen3-1.7B tiene una licencia permisiva (Apache 2.0), pero este fine-tuning no declara licencia, lo que puede generar incertidumbre legal para su uso.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones críticas.
- Licencia no especificada: no se puede determinar si es permitido el uso comercial o la redistribución.
- Idiomas no especificados: se desconoce el alcance multilingüe real del modelo tras el RL.
- Pesos en fp32: ocupan el doble que bf16, lo que incrementa los requisitos de memoria y reduce la velocidad de inferencia.
- Sin benchmarks: no hay evidencia de mejora o degradación frente al modelo base.
- Riesgo de alucinación: heredado del modelo base, no mitigado por el entrenamiento RL.
- Sesgos desconocidos: no se ha realizado una evaluación de sesgos ni de seguridad.
- Contexto no confirmado: aunque el Qwen3-1.7B soporta 32K tokens, no se confirma que el fine-tuning conserve esta longitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a12_dapo_frpo-k1-cNone-clip0.2_0.28-mb4-eta100-bs256x5-n2
- Framework verl: https://github.com/volcengine/verl
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
