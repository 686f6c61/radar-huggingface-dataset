# logan7000/llm-math345-ttrl-phi35mini-full

## Resumen

El modelo `logan7000/llm-math345-ttrl-phi35mini-full` es un fine-tuning del modelo Phi-3.5-mini-instruct de Microsoft (3.8B parámetros) desarrollado por Logan Yang (usuario logan7000). El objetivo es mejorar el razonamiento matemático del modelo mediante un enfoque de aprendizaje por refuerzo en tiempo de test (TTRL, Test-Time Reinforcement Learning) sobre el dataset MATH345. La técnica emplea GRPO (Group Relative Policy Optimization) con voto mayoritario sobre K muestras como pseudo-etiqueta, sin depender de respuestas de referencia (ground truth).

El entrenamiento se planificó para 136 pasos (1 época) con 128 prompts por actualización y K=12, pero se truncó en el paso 90 debido al límite de 24 horas de cómputo (~900 segundos por paso). El repositorio consolidado incluye el checkpoint con mejor validación (paso 80) y el checkpoint final del paso 90, junto con los registros de entrenamiento. Este modelo es relevante porque explora una variante de RL en tiempo de test que no requiere etiquetas humanas, una línea de investigación activa en 2026, aunque su utilidad práctica está limitada por la falta de evaluación publicada y el entrenamiento incompleto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-3.5-mini-instruct, 3.8B) |
| Parametros totales | 3.8B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, 128K en Phi-3.5-mini) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: los parámetros y la arquitectura se deducen del nombre del modelo y de la model card, que indican que el modelo base es Phi-3.5-mini-instruct. No se proporcionan especificaciones detalladas del fine-tuning en el repositorio.

## Arquitectura y entrenamiento

El modelo parte de Phi-3.5-mini-instruct, un transformer decoder-only de 3.8B parámetros con atención completa y ventana de contexto de 128K tokens. El fine-tuning aplica TTRL (Test-Time Reinforcement Learning) con GRPO: para cada prompt del dataset MATH345, el modelo genera K=12 muestras; el voto mayoritario de esas muestras actúa como pseudo-etiqueta, y la pérdida (bnpo loss) optimiza el modelo para alinearse con esa mayoría. No se usa ground truth, lo que elimina la necesidad de datos anotados.

El entrenamiento usó una tasa de aprendizaje de 3e-6, beta=0, Adam con beta2=0.95, y 128 prompts por actualización. Se planearon 136 pasos (1 época), pero el proceso se detuvo en el paso 90 por agotar el tiempo de cómputo (24 horas). No se reportan errores de entrenamiento, solo truncamiento. El checkpoint del paso 80 se seleccionó como mejor por validación, y el paso 90 se guardó como punto final.

## Capacidades

- Razonamiento matemático: el entrenamiento específico sobre MATH345 busca mejorar la resolución de problemas matemáticos, aunque no hay evaluación publicada que lo confirme.
- Generación de texto: hereda las capacidades del modelo base Phi-3.5-mini-instruct, que incluyen generación de texto, razonamiento general y soporte multilingüe (no confirmado en este repo).
- Tool calling y function calling: no documentado en este repositorio, pero el modelo base las soporta; no se garantiza tras el fine-tuning.
- Capacidades de agente: no documentado; el modelo base tiene soporte limitado, pero no hay evidencia de que el fine-tuning lo preserve.
- No se reportan capacidades especiales adicionales (visión, audio, thinking mode) en la información disponible.

## Casos de uso

- Evaluación de técnicas TTRL en investigación: este modelo sirve como artefacto de estudio para analizar cómo el aprendizaje por refuerzo en tiempo de test con pseudo-etiquetas afecta el razonamiento matemático en un modelo pequeño. Investigadores pueden comparar los checkpoints (paso 80 y 90) para estudiar la dinámica de entrenamiento.
- Fine-tuning experimental sobre Phi-3.5-mini: dado que el entrenamiento se truncó, el modelo puede usarse como punto de partida para continuar el entrenamiento o para probar variaciones de hiperparámetros (lr, K, beta) sobre el mismo dataset.
- Benchmark de razonamiento matemático: aunque no hay resultados publicados, el modelo podría evaluarse en conjuntos como GSM8K o MATH para medir el impacto del TTRL frente al modelo base, siempre que se documente adecuadamente.
- Reproducción de experimentos: los registros de entrenamiento (train.log, trainer_state) permiten reproducir el proceso y verificar la metodología, útil para validar la técnica en otros modelos.
- Análisis de robustez: al estar entrenado con pseudo-etiquetas de voto mayoritario, el modelo puede usarse para estudiar la sensibilidad a la calidad de las pseudo-etiquetas y el efecto del truncamiento en el rendimiento final.
- Despliegue en entornos con restricciones de recursos: al ser un modelo de 3.8B, cabe en GPUs de consumo con cuantización, aunque no se proporcionan archivos cuantizados; se requeriría conversión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, GSM8K, HumanEval ni otras métricas para este fine-tuning. La model card no incluye ninguna tabla de evaluación. Se recomienda evaluar el modelo contra el Phi-3.5-mini-instruct original para medir el impacto real del entrenamiento TTRL.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 3.8B en FP16 se necesitan aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Con cuantización de 4 bits (no incluida en el repo) se podría reducir a ~3-4 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A100 (40 GB) son suficientes para inferencia y fine-tuning ligero. Para reproducir el entrenamiento completo se necesitaría una GPU con al menos 24 GB y un presupuesto de tiempo de 24 horas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama alta (RTX 3090, 4090) con FP16 o cuantización. En GPUs de 8 GB (RTX 3070, 4060) se requeriría cuantización a 4 bits no disponible en el repo.
- Opciones de despliegue: vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama (con conversión previa), TGI. No se proporcionan archivos GGUF ni configuración para estos frameworks.
- Latencia y throughput: no se han medido en la información disponible. Para un modelo de 3.8B en una A100 se espera un throughput de ~100-200 tokens/s en generación, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi-3.5-mini-instruct (base) | 3.8B | 128K | MIT | HuggingFace | Modelo original, sin fine-tuning TTRL |
| logan7000/llm-math345-ttrl-phi35mini-full | 3.8B | no disponible | no disponible | HuggingFace | Fine-tuning TTRL truncado |
| logan7000/llm-math345-ttrl-phi4mini-endpoint | ~4B (Phi-4-mini) | no disponible | no disponible | HuggingFace | Variante del mismo autor sobre Phi-4-mini |

No se dispone de comparaciones de rendimiento entre estos modelos porque no hay benchmarks publicados. La comparativa se limita a características estructurales y de disponibilidad.

## Limitaciones y advertencias

- Entrenamiento truncado: el modelo se detuvo en el paso 90 de 136, por lo que no ha completado la época planificada. Esto puede afectar a la convergencia y al rendimiento final.
- Sin evaluación publicada: no hay resultados de benchmarks, por lo que se desconoce si el fine-tuning mejora o degrada las capacidades del modelo base.
- Licencia no especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de usar en producción.
- Idiomas no documentados: aunque el modelo base soporta varios idiomas, no se confirma que el fine-tuning los preserve.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en problemas matemáticos complejos.
- Sesgos potenciales: el dataset MATH345 y el proceso de pseudo-etiquetado pueden introducir sesgos no documentados.
- Sin cuantizaciones listas: solo hay pesos en safetensors; para despliegue eficiente en CPU o GPUs pequeñas se requiere conversión manual a GGUF u otros formatos.
- Tamaño del repositorio: 15.3 GB incluye múltiples checkpoints y registros, no solo el modelo final; hay que seleccionar el checkpoint adecuado (best/ o endpoint/) para inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/logan7000/llm-math345-ttrl-phi35mini-full
- Repositorio hermano (endpoint): https://huggingface.co/logan7000/llm-math345-ttrl-phi35mini-endpoint
- Perfil del autor: https://huggingface.co/logan7000
- Página de despliegue en FriendliAI: https://friendli.ai/models/q1716523669/llm-math345-ttrl-phi35mini-endpoint
- Leaderboard de LLMs (referencia general): https://benchlm.ai/
