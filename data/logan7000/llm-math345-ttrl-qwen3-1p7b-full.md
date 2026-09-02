# logan7000/llm-math345-ttrl-qwen3-1p7b-full

## Resumen

El modelo `logan7000/llm-math345-ttrl-qwen3-1p7b-full` es un ajuste fino del modelo base Qwen3-1.7B (de la familia Qwen3 de Alibaba) realizado mediante la técnica TTRL (Test-Time Reinforcement Learning) con GRPO sobre el dataset MATH345. El autor, logan7000, ha consolidado en este repositorio los pesos completos del entrenamiento, incluyendo tanto el checkpoint con mejor validación (paso 80) como el punto final (paso 136). El objetivo es mejorar el razonamiento matemático del modelo base, aprovechando un esquema de pseudo-etiquetado por mayoría de votos sobre K muestras, sin necesidad de ground truth.

Este modelo es relevante porque explora una metodología de entrenamiento reciente (TTRL) aplicada a un LLM compacto de 1.700 millones de parámetros, lo que permite experimentar con técnicas avanzadas de RL en hardware asequible. Al estar basado en Qwen3-1.7B-Base, hereda la arquitectura densa de la familia Qwen3, con una ventana de contexto nativa de 32.000 tokens (aunque no se confirma si el ajuste ha modificado este valor). El repositorio incluye solo pesos en formato safetensors, sin cuantizaciones adicionales ni archivos de inferencia listos para usar.

La ficha recoge los datos disponibles en la model card y en la información pública de HuggingFace. Dado que no se publican resultados de benchmarks ni métricas de evaluación, gran parte de las especificaciones de rendimiento quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (la familia Qwen3 base soporta 32.000 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32/FP16, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (Qwen3 base es multilingüe, pero no se especifica en este repo) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso con atención de múltiples cabezas y normalización RMSNorm, perteneciente a la familia Qwen3. El ajuste fino utiliza TTRL (Test-Time Reinforcement Learning), una variante de RL en tiempo de prueba donde se genera un conjunto de K muestras por cada prompt y se emplea la respuesta más votada (majority vote) como pseudo-etiqueta, sin depender de datos etiquetados. El algoritmo de optimización es GRPO (Group Relative Policy Optimization), con pérdida BNPO (Binary Noise Policy Optimization) y un factor beta de 0.

El entrenamiento se realizó en 136 pasos (equivalente a 1 época sobre MATH345), con 128 prompts por actualización, K=12 muestras por prompt, tasa de aprendizaje de 3e-6 y beta2 de Adam de 0,95. La evaluación se ejecutó cada 10 pasos. El repositorio incluye dos checkpoints: `best/` (paso 80, mejor métrica de validación) y `endpoint/` (paso 136, final del entrenamiento), además de los logs de entrenamiento. No se especifica la composición exacta del dataset MATH345 ni el número total de tokens utilizados.

## Capacidades

- Razonamiento matemático: entrenado específicamente sobre problemas de MATH345, el modelo debería mejorar la resolución de problemas matemáticos de nivel de competición.
- Generación de texto: al derivar de Qwen3-1.7B-Base, conserva la capacidad de generación de lenguaje natural del modelo base, aunque el ajuste puede haber estrechado su dominio.
- Multilingüismo: no confirmado en este repositorio, pero el modelo base Qwen3 soporta múltiples idiomas.
- No se documenta soporte de tool calling, function calling, ni capacidades multimodales en la información disponible.

## Casos de uso

- Tutoría matemática interactiva: el modelo puede generar soluciones paso a paso para problemas de álgebra, cálculo o geometría, sirviendo como asistente de estudio para estudiantes de secundaria o universidad.
- Generación de problemas y soluciones: dado su entrenamiento en MATH345, puede utilizarse para crear ejercicios matemáticos con sus correspondientes respuestas razonadas, útil para plataformas educativas.
- Evaluación de razonamiento en modelos: al ser un experimento de TTRL, puede emplearse como banco de pruebas para comparar el impacto de esta técnica frente al modelo base en tareas de aritmética y lógica.
- Integración en pipelines de análisis numérico: para tareas que requieran interpretación de enunciados matemáticos y extracción de resultados numéricos, aunque sin garantía de precisión sin evaluación adicional.
- Investigación en RL para LLMs: el repositorio incluye logs de entrenamiento y checkpoints, lo que permite reproducir o estudiar el comportamiento de GRPO con pseudo-etiquetas en un modelo pequeño.
- Despliegue en entornos con recursos limitados: por su tamaño de 1,7B, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3060 o superiores) con cuantización, para prototipos de asistentes matemáticos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, GSM8K o HumanEval, ni comparaciones con el modelo base o con otros modelos de tamaño similar. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1.700 millones de parámetros. En FP16, los pesos ocupan aproximadamente 3,4 GB; en FP32, unos 6,8 GB (el repositorio pesa 6,9 GB, lo que sugiere pesos en FP32 o FP16 con margen). Con cuantización INT8 se reduciría a ~1,7 GB y en INT4 a ~0,9 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM puede ejecutar el modelo en FP16 sin cuantizar (por ejemplo, RTX 3060, RTX 4060, A10). Para uso en FP32, se recomienda 12 GB o más.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media con cuantización o en FP16 con VRAM suficiente.
- Opciones de despliegue: al no incluir archivos GGUF ni configuración específica, se puede cargar con transformers de HuggingFace, o convertir a GGUF para usar con llama.cpp u Ollama. También es compatible con vLLM y TGI si se dispone de los pesos en un formato adecuado.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 1,7B en una RTX 4090, se puede esperar una velocidad de generación de decenas de tokens por segundo, pero esto es una estimación general y no un dato oficial.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo es un ajuste fino de Qwen3-1.7B-Base, por lo que la comparación natural sería contra el propio modelo base, pero no se ofrecen métricas. Alternativas de tamaño similar (por ejemplo, Llama 3.2 1B, Phi-3.5-mini o Qwen2.5-1.5B) podrían servir de referencia, pero no hay información objetiva en este repositorio para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tuning de Qwen3-Base, puede heredar sesgos presentes en el modelo original, aunque no se documentan en este repositorio.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos. No se ha evaluado su precisión.
- Limitaciones de contexto: no se confirma si el entrenamiento con TTRL ha modificado la longitud de contexto del modelo base. Si se mantiene en 32.000 tokens, es suficiente para la mayoría de problemas matemáticos, pero no se garantiza.
- Restricciones de licencia: la licencia no está especificada. Esto puede impedir su uso comercial sin autorización expresa del autor. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Especialización estrecha: el entrenamiento en MATH345 puede degradar el rendimiento en tareas generales fuera del dominio matemático, al tratarse de un ajuste fino sobre un modelo base.
- Reproducibilidad: aunque se incluyen logs de entrenamiento, no se proporcionan los datos exactos de composición del dataset ni el script de entrenamiento completo, lo que dificulta replicar el experimento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/llm-math345-ttrl-qwen3-1p7b-full
- Repositorio similar (phi35mini): https://huggingface.co/logan7000/llm-math345-ttrl-phi35mini-endpoint
- Paper técnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Comprobador de hardware para LLMs: https://llmrun.dev/
- Leaderboard de modelos LLM: https://benchlm.ai/
