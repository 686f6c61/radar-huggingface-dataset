# olusegunola/phi35-medqa-dpo-merged

## Resumen

El modelo `olusegunola/phi35-medqa-dpo-merged` es un modelo de generación de texto basado en la arquitectura Phi-3, según los metadatos de HuggingFace (tag `phi3`). El nombre sugiere que se trata de un fine-tuning de un modelo Phi-3.5 sobre el conjunto de datos MedQA (preguntas médicas) seguido de un ajuste con DPO (Direct Preference Optimization), aunque esta información no está confirmada en la model card, que se encuentra prácticamente vacía. El modelo tiene 3.821.079.552 parámetros (aproximadamente 3,82 mil millones), lo que lo sitúa en la gama de modelos pequeños optimizados para tareas específicas. Fue subido el 6 de agosto de 2026 y actualizado el 16 de agosto de 2026, con cero descargas y cero likes en el momento de la consulta. No se dispone de información sobre licencia, idiomas soportados, contexto ni datos de entrenamiento, por lo que esta ficha se basa únicamente en los datos técnicos disponibles y en las suposiciones derivadas del nombre del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi-3 (transformers, según tag `phi3`) |
| Parametros totales | 3.821.079.552 (3,82 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, tamaño 22,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización. El tag `phi3` en HuggingFace indica que el modelo base pertenece a la familia Phi-3 de Microsoft, conocida por ser un transformer decoder-only con atención causal. El nombre del repositorio sugiere un fine-tuning sobre MedQA (un conjunto de preguntas de opción múltiple de dominio médico) y un posterior ajuste con DPO, pero esto no está verificado en la model card. No hay datos sobre número de tokens de entrenamiento, composición del dataset, hiperparámetros ni régimen de entrenamiento.

## Capacidades

No se dispone de información oficial sobre las capacidades del modelo. Basándose en el nombre y en el pipeline de generación de texto, se puede inferir que el modelo está orientado a tareas de respuesta a preguntas médicas, pero no hay confirmación de:

- Generación de texto general
- Razonamiento o matemáticas
- Generación de código
- Soporte de tool calling o function calling
- Capacidades multilingües
- Modo de pensamiento (thinking mode) o visión

Todas estas capacidades se consideran no disponibles hasta que el autor publique documentación o benchmarks.

## Casos de uso

Dado que no hay información verificada, los casos de uso son hipotéticos y deben tomarse con cautela:

- Respuesta a preguntas médicas: si el fine-tuning con MedQA es real, el modelo podría responder preguntas de opción múltiple de dominio clínico, aunque sin validación no se recomienda su uso en entornos reales.
- Investigación académica: podría utilizarse como base para experimentos de fine-tuning en dominios especializados, siempre que se verifique su licencia.
- Prototipado rápido: para pruebas de concepto en sistemas de generación de texto con modelos pequeños, aunque se desconoce su rendimiento.
- No se recomienda su uso en producción sin una evaluación exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K, MedQA ni otras métricas.

## Requisitos de hardware

No se dispone de requisitos oficiales. Como orientación general para un modelo de ~3,8 B parámetros:

- VRAM estimada para inferencia en fp16: ~7,6 GB (más overhead de activaciones y KV cache)
- VRAM estimada para inferencia en fp32: ~15,3 GB
- El tamaño del repositorio (22,9 GB) sugiere que los pesos están en fp32 o fp16 sin cuantizar, lo que requeriría al menos 16 GB de VRAM para cargar el modelo completo en fp32, o ~8 GB en fp16 si se convierte.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM (RTX 3060, RTX 4070, A10) para fp16; para fp32 se necesitarían 24 GB (RTX 3090/4090, A100).
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo podría compararse con otros fine-tunings de Phi-3.5 (como Phi-3.5-mini-instruct) o con modelos médicos como BioMistral o Meditron, pero no hay datos de rendimiento ni confirmación de la base exacta. Se indica "no disponible" por falta de datos verificados.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre sesgos, alucinaciones, restricciones de uso ni limitaciones técnicas.
- El nombre sugiere un fine-tuning médico, pero sin documentación no se puede garantizar la seguridad ni la precisión en contextos clínicos.
- La licencia es desconocida, por lo que no se puede confirmar si es apta para uso comercial o académico.
- No hay evidencia de evaluación externa ni de validación de calidad.
- El modelo tiene cero descargas y cero likes, lo que indica que no ha sido probado por la comunidad.
- Riesgo de alucinación y de respuestas incorrectas en dominios especializados si el fine-tuning no fue riguroso.
- No se recomienda su uso en producción sin una auditoría completa.

## Enlaces

- [HuggingFace - olusegunola/phi35-medqa-dpo-merged](https://huggingface.co/olusegunola/phi35-medqa-dpo-merged)
