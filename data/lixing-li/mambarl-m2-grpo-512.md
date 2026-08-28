# Lixing-Li/mambarl-m2-grpo-512

## Resumen

El modelo `Lixing-Li/mambarl-m2-grpo-512` es un checkpoint experimental del proyecto MambaRL, desarrollado por Lixing-Li. Se trata de un modelo de lenguaje basado en la arquitectura Mamba-2, concretamente sobre el modelo base `AntonV/mamba2-2.7b-hf`, al que se le ha fusionado un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization). El objetivo del experimento es determinar si el aprendizaje por refuerzo basado únicamente en recompensas de resultado puede extender el horizonte efectivo de recuperación de contexto de un modelo Mamba-2 puro, sin modificar la arquitectura ni aumentar el estado recurrente.

El modelo tiene 2.702.599.680 parámetros (aproximadamente 2,7 mil millones) y los pesos están fusionados en formato safetensors, por lo que puede cargarse directamente con `AutoModelForCausalLM.from_pretrained`. El entrenamiento se realizó en la fase 2, etapa 0, con secuencias de 512 tokens y 512 pasos de GRPO, pero no alcanzó el umbral de promoción (dev_acc=0,380, format_acc=0,920). Las respuestas siguen un contrato de formato con secciones de pensamiento y respuesta. Es un modelo de investigación, no un producto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (SSM, sin atención) |
| Parametros totales | 2.702.599.680 (2,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mamba-2, un modelo de espacio de estados (SSM) que sustituye la atención por una recurrencia lineal con un estado oculto fijo. No se añade ningún mecanismo de atención y el estado recurrente no se amplía; la hipótesis del proyecto es que el entrenamiento con RL puede enseñar al modelo a retener información relevante en el estado existente. El adaptador LoRA se aplicó únicamente a la proyección de entrada (`in_proj`), ya que PEFT no permite modificar `out_proj` ni `conv1d` en Mamba-2 debido a que los kernels fusionados leen esos pesos directamente.

El entrenamiento utilizó GRPO (Group Relative Policy Optimization) con secuencias de 512 tokens, durante 512 pasos. No se alcanzó el umbral de promoción definido en el proyecto (dev_acc=0,380 frente a un umbral no especificado, format_acc=0,920). El modelo genera respuestas siguiendo un contrato de formato con secciones `thinking`, `response` y `<answer>`. No se dispone de información sobre el dataset de entrenamiento ni sobre el número total de tokens utilizados.

## Capacidades

- Generación de texto autoregresiva basada en el estado recurrente de Mamba-2.
- Razonamiento estructurado mediante el formato de respuesta con secciones de pensamiento y respuesta final.
- Capacidad de aprendizaje por refuerzo sobre tareas de recuperación de contexto, según el objetivo del proyecto MambaRL.
- No se especifican capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para modelos de espacio de estados: el modelo sirve como punto de referencia para estudiar cómo el RL afecta a la memoria recurrente de Mamba-2.
- Evaluación de la capacidad de recuperación de contexto en SSM: permite analizar si un modelo puramente recurrente puede mantener información relevante a lo largo de secuencias largas sin atención.
- Comparación de estrategias de entrenamiento (GRPO frente a otros métodos) en arquitecturas no transformer.
- Desarrollo de técnicas de fusión de adaptadores LoRA en modelos Mamba-2, dado que el checkpoint incluye pesos fusionados.
- Pruebas de estabilidad de entrenamiento con RL en modelos de 2,7B parámetros, especialmente en entornos con recursos limitados.
- Análisis de la calidad de las respuestas estructuradas (formato `thinking`/`response`) en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el reportado durante el entrenamiento: dev_acc=0,380 y format_acc=0,920, que no alcanzaron el umbral de promoción del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,7B parámetros en FP16, se necesitan aproximadamente 5,4 GB de VRAM solo para los pesos. El tamaño del repositorio es de 10,8 GB, lo que sugiere que puede incluir pesos en precisión mixta o archivos adicionales.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti, A10) podría ejecutar el modelo en FP16. Para mayor comodidad, se recomienda una GPU de 12 GB o más (RTX 3080, RTX 4070, A100).
- Es probable que quepa en GPUs de consumo medio, pero no hay datos oficiales de latencia ni throughput.
- Opciones de despliegue: al ser compatible con Transformers, puede usarse con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se han probado oficialmente.
- No se dispone de mediciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es un checkpoint experimental basado en Mamba-2 de 2,7B, pero no hay datos de rendimiento público frente a otras alternativas como Mamba-2-2.7B original, RWKV o modelos transformer de tamaño similar. Se recomienda consultar el leaderboard de ModelCap para comparaciones generales, aunque no se han encontrado datos específicos de este modelo.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un experimento de investigación; no alcanzó el umbral de promoción, por lo que su rendimiento puede ser inferior al esperado para tareas generales.
- No se especifica la licencia, lo que impide su uso comercial sin autorización explícita del autor.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El entrenamiento se realizó con secuencias de 512 tokens; la longitud de contexto máxima del modelo no está documentada y podría ser limitada.
- El formato de respuesta estructurado (`thinking`/`response`) puede no ser adecuado para todos los casos de uso y requiere un postprocesado para extraer la respuesta final.
- No hay garantías de estabilidad en producción; es un modelo puramente experimental.

## Enlaces

- [HuggingFace - Lixing-Li/mambarl-m2-grpo-512](https://huggingface.co/Lixing-Li/mambarl-m2-grpo-512)
- [Árbol de archivos del repositorio](https://huggingface.co/Lixing-Li/mambarl-m2-grpo-512/tree/main)
- [Perfil de GitHub del autor (Li-xingXiao)](https://github.com/Li-xingXiao)
