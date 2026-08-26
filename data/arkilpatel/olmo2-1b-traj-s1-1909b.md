# arkilpatel/olmo2-1b-traj-s1-1909b

## Resumen

Este repositorio contiene 43 checkpoints intermedios de un proceso de entrenamiento por refuerzo (RL) aplicado sobre el modelo base OLMo-2-1B de AI2, concretamente sobre el checkpoint de pretraining `stage1-step910000-tokens1909B`. El autor, arkilpatel, publica la trayectoria completa de entrenamiento RL para permitir el análisis de la evolución del modelo a lo largo del proceso, algo poco habitual en la mayoría de lanzamientos de modelos.

El modelo base OLMo-2-1B es un transformer decoder-only de aproximadamente 1.000 millones de parámetros, desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo, caracterizada por su apertura total: datos de entrenamiento, código, recetas y checkpoints intermedios. Este repositorio en particular no es un modelo final listo para uso, sino un artefacto de investigación que documenta cómo el RL modifica las capacidades del modelo paso a paso.

La relevancia actual radica en la creciente necesidad de entender los efectos del RL en modelos de lenguaje, especialmente en lo relativo a alineación, robustez y posibles degradaciones. Al ofrecer la trayectoria completa, este repositorio permite estudiar dinámicas como la recompensa, la estabilidad del entrenamiento o la aparición de comportamientos emergentes en una escala de 1B, mucho más manejable que los modelos de decenas de miles de millones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo-2) |
| Parametros totales | 1.000 millones (aprox., basado en OLMo-2-1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (solo inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es OLMo-2-1B, un transformer decoder-only con arquitectura estándar (atención por capas, feed-forward, normalización, etc.) entrenado por AI2 con datos abiertos. El checkpoint concreto `stage1-step910000-tokens1909B` corresponde a la primera etapa de pretraining, tras 910.000 pasos y 1.909 billones de tokens. Sobre este checkpoint se ha aplicado un proceso de RL no especificado en la información disponible (posiblemente PPO o variantes, pero no se documenta), generando 43 checkpoints intermedios guardados en carpetas `step-XXXX/`.

No se detallan los hiperparámetros del RL, la función de recompensa ni el dataset utilizado. La única innovación destacable es la publicación de la trayectoria completa de checkpoints, lo que permite reconstruir el proceso de entrenamiento y analizar la evolución de las métricas y comportamientos en cada paso. Los pesos están en bf16 y se indica explícitamente que son solo para inferencia, no para continuar entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 1B, es capaz de producir texto coherente en tareas básicas, aunque su rendimiento es limitado en comparación con modelos más grandes.
- Razonamiento y matemáticas: capacidades básicas, dependientes del checkpoint concreto; no se han documentado resultados específicos.
- Codigo: no se ha verificado soporte específico para generación de código.
- Tool calling / function calling: no disponible en la información.
- Soporte para agentes: no disponible.
- Multilingüismo: no especificado, aunque OLMo-2 se entrena principalmente con datos en inglés.
- Capacidades especiales: al ser checkpoints intermedios de RL, cada paso puede mostrar comportamientos diferentes; no hay un modo de pensamiento ni capacidades multimodales.

## Casos de uso

- Investigación sobre dinámica de RL: el uso principal es analizar cómo cambian las capacidades del modelo a lo largo del entrenamiento por refuerzo, por ejemplo, midiendo la evolución de la perplejidad, la precisión en tareas de razonamiento o la tendencia a alucinar en cada checkpoint.
- Estudio de estabilidad del entrenamiento: los 43 checkpoints permiten detectar fases de inestabilidad, divergencia o sobreoptimización de la recompensa, algo crítico para diseñar algoritmos de RL más robustos.
- Análisis de alineación y seguridad: se puede estudiar si el RL introduce sesgos o comportamientos indeseados en diferentes etapas, comparando con el modelo base.
- Reproducibilidad de experimentos: al tener todos los pesos intermedios, otros investigadores pueden reproducir o extender los experimentos sin necesidad de reentrenar desde cero.
- Benchmarking de métodos de RL: sirve como referencia para comparar diferentes algoritmos de RL (PPO, GRPO, etc.) sobre la misma base y con la misma trayectoria.
- Educación y formación: útil para cursos o tutoriales que quieran mostrar visualmente cómo el RL modifica un modelo paso a paso, sin necesidad de ejecutar entrenamientos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no incluye evaluaciones de tareas estándar como MMLU, HumanEval o GSM8K. Para conocer el rendimiento del modelo base OLMo-2-1B, se puede consultar la documentación oficial de AI2, pero los checkpoints RL aquí presentados no tienen métricas asociadas.

## Requisitos de hardware

- Cada checkpoint en bf16 ocupa aproximadamente 2 GB (1B parámetros × 2 bytes). El repositorio completo pesa 127,7 GB, correspondiente a los 43 checkpoints más archivos adicionales.
- Para inferencia de un solo checkpoint, se necesita una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior). Con cuantización a 8 bits o 4 bits, podría caber en GPUs con 2-3 GB, pero no se proporcionan versiones cuantizadas.
- GPUs recomendadas: cualquier GPU moderna con soporte bf16, como RTX 3090, RTX 4090, A100, H100, etc. Para análisis de múltiples checkpoints, se recomienda almacenamiento rápido y suficiente RAM.
- Opciones de despliegue: al ser checkpoints intermedios, no se han preparado para uso con vLLM, Ollama o TGI. Se puede cargar con la librería `transformers` de HuggingFace o con el código de inferencia de OLMo.
- Latencia y throughput: no disponibles, pero para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | 4096 (típico) | Apache-2.0 | Checkpoints oficiales en HuggingFace |
| TinyLlama-1.1B | 1.1B | 2048 | Apache-2.0 | Checkpoints oficiales |
| Qwen2-0.5B | 0.5B | 32768 | Apache-2.0 | Checkpoints oficiales |
| Este repositorio | 1B | No disponible | Apache-2.0 | 43 checkpoints intermedios de RL |

La comparativa se limita a la arquitectura y disponibilidad, ya que no hay datos de rendimiento para este repositorio. El valor diferencial no es el rendimiento final, sino la trazabilidad del entrenamiento RL, algo que ningún otro modelo ofrece de forma tan completa.

## Limitaciones y advertencias

- No es un modelo final: los checkpoints son intermedios de un proceso de RL y no han sido evaluados ni ajustados para uso en producción. Pueden mostrar comportamientos erráticos o degradados respecto al modelo base.
- Sin documentación del proceso RL: se desconoce el algoritmo, la función de recompensa y los datos utilizados, lo que limita la interpretabilidad de los resultados.
- Sesgos y alucinaciones: al ser un modelo de 1B entrenado con datos abiertos, puede presentar sesgos presentes en los datos de pretraining y una tendencia a alucinar en tareas complejas. El RL podría amplificar o mitigar estos efectos, pero no hay análisis al respecto.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero OLMo-2-1B suele manejar ventanas de 4096 tokens; para tareas de contexto largo puede ser insuficiente.
- Solo inferencia: los pesos están en bf16 y no se permite continuar el entrenamiento, lo que limita su uso para fine-tuning adicional.
- Tamaño del repositorio: 127,7 GB, lo que requiere un ancho de banda y almacenamiento considerables para descargar todos los checkpoints.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arkilpatel/olmo2-1b-traj-s1-1909b
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Modelo base OLMo-2-1B en HuggingFace: https://huggingface.co/allenai/OLMo-2-0425-1B
- Página oficial de OLMo 2: https://allenai.org/olmo2
- Paper técnico de OLMo (arXiv): https://arxiv.org/pdf/2402.00838
