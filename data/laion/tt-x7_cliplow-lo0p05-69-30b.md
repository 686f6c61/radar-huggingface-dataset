# laion/tt-x7_cliplow-lo0p05-69-30B

## Resumen

El modelo `laion/tt-x7_cliplow-lo0p05-69-30B` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) con GRPO, desarrollado por LAION sobre la base **Qwen/Qwen3-Coder-30B-A3B-Instruct**. Forma parte de un barrido (sweep) denominado X7 con un clip de PPO reducido a 0.05, y se entrenó con el framework SkyRL junto con Terminus-2 sobre el dataset `DCAgent/exp_rpt_multifile`, orientado a la edición de código en múltiples archivos. El verifier utilizado fue `pass_ratio shaping`.

Se trata de un checkpoint del paso 69 de un total planificado de 80, seleccionado por ser el de mayor EMA de los últimos 5 pasos entre los retenidos. El entrenamiento fue detenido por su propietario en el paso 74, por lo que no representa un resultado de horizonte completo. Su relevancia radica en documentar la aplicación de técnicas de RL a modelos de código de tipo MoE, aunque su naturaleza experimental lo hace inadecuado para uso en producción directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-Coder-30B-A3B-Instruct, un transformer de tipo MoE (mixture of experts) con 30,5 mil millones de parámetros totales y activación parcial de expertos. Sobre esta base, LAION aplicó un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization) usando el framework SkyRL y el motor Terminus-2. El dataset de entrenamiento fue `DCAgent/exp_rpt_multifile`, que contiene tareas de edición y reparación de código en proyectos con múltiples archivos. La señal de recompensa se basó en un verifier de tipo `pass_ratio shaping`, que mide la proporción de pruebas superadas.

El checkpoint se exportó post-hoc desde un shard FSDP en un clúster de 4x4 GH200. El proceso de exportación a HuggingFace sufrió un error en el hook de exportación (ModelLocatorError), por lo que no se generaron exportaciones anteriores. El run fue detenido por el propietario en el paso 74 de 80, por lo que el modelo no ha completado el ciclo de entrenamiento previsto.

## Capacidades

- Generación de texto y código, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Edición de código en múltiples archivos, gracias al dataset de entrenamiento `DCAgent/exp_rpt_multifile`.
- Razonamiento y comprensión de contextos de programación, aunque no se especifican detalles adicionales.
- No se dispone de información confirmada sobre tool calling, function calling, capacidades multimodales o modo de pensamiento extendido.

## Casos de uso

Dado que se trata de un checkpoint experimental y no de un modelo final, los casos de uso son principalmente de investigación y evaluación:

- Investigación en técnicas de RL para modelos de código: permite estudiar el efecto de un clip de PPO reducido (0.05) en el rendimiento de un modelo MoE durante el entrenamiento.
- Análisis de la dinámica de recompensa y EMA en barridos de RL: el checkpoint ofrece métricas intermedias (step reward 0.1758, pass@8 0.375) que pueden compararse con otros puntos del sweep.
- Reproducción de experimentos: el repositorio incluye training_logs con métricas, configuración y gráficas, lo que facilita la reproducibilidad.
- Benchmarking de checkpoints intermedios: para evaluar la evolución del modelo a lo largo del entrenamiento y la selección de puntos de guardado.
- Desarrollo de verifiers de código: el uso de `pass_ratio shaping` puede servir de referencia para diseñar funciones de recompensa en tareas de programación.
- Estudio de la transferencia de habilidades de edición multi-archivo: el modelo puede probarse en entornos controlados para medir su capacidad de modificar código en proyectos reales, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La única métrica reportada es la del propio entrenamiento: step reward 0.1758 y pass@8 0.375 en el paso 69, que corresponden al verifier del dataset de entrenamiento y no a una evaluación externa.

## Requisitos de hardware

- El tamaño del repositorio es de 61,1 GB, lo que sugiere que los pesos están almacenados en precisión FP16 (30,5 B parámetros × 2 bytes).
- Para inferencia en FP16 se requiere una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB o GH200) para cargar los pesos completos.
- Al ser un modelo MoE con activación parcial, la memoria de activaciones es menor que la de un modelo denso equivalente, pero los pesos completos deben residir en memoria.
- No se han publicado cuantizaciones (GGUF, INT8, etc.), por lo que no se puede reducir la huella de memoria sin conversión adicional.
- Opciones de despliegue: dado el formato safetensors, puede usarse con Transformers, vLLM o TGI, siempre que se disponga de la VRAM necesaria. No se ha confirmado compatibilidad con llama.cpp u Ollama sin conversión previa.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo base Qwen3-Coder-30B-A3B-Instruct es la referencia más directa, pero no se han publicado resultados que permitan una comparación cuantitativa. Al ser un checkpoint intermedio de un experimento de RL, no se recomienda compararlo con modelos finales o comerciales.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento fue detenido en el paso 74 de 80, por lo que el rendimiento puede no ser representativo de un ciclo completo.
- No se han realizado evaluaciones externas de calidad, sesgos o alucinaciones.
- El dataset de entrenamiento `DCAgent/exp_rpt_multifile` puede introducir sesgos específicos de tareas de edición de código, lo que limita la generalización a otros dominios.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo experimental no se ofrecen garantías de funcionamiento o seguridad.
- El repositorio no incluye información sobre idiomas soportados, contexto máximo ni cuantizaciones, lo que dificulta su despliegue en entornos con restricciones de memoria.
- El proceso de exportación fue problemático (error ModelLocatorError) y solo se conserva el checkpoint del paso 69; no hay versiones anteriores disponibles.

## Enlaces

- [HuggingFace - laion/tt-x7_cliplow-lo0p05-69-30B](https://huggingface.co/laion/tt-x7_cliplow-lo0p05-69-30B)
- [Dataset de training traces - penfever/tt-x7_cliplow-lo0p05](https://huggingface.co/datasets/penfever/tt-x7_cliplow-lo0p05)
