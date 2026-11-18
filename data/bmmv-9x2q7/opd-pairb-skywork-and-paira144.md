# bmmv-9x2q7/opd-pairB-skywork-and-pairA144

## Resumen

El repositorio `bmmv-9x2q7/opd-pairB-skywork-and-pairA144` contiene checkpoints de investigación resultantes de un experimento de destilación on-policy (on-policy distillation, OPD) sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B. El autor del repositorio es el usuario `bmmv-9x2q7`, que lo publica como material de trabajo (la propia model card lo etiqueta como "private" y "research checkpoints"). El objetivo del experimento es transferir capacidades de razonamiento matemático desde un profesor de mayor tamaño, Skywork-OR1-7B (revisión `5bd323a9`), hacia un estudiante de 1.500 millones de parámetros, usando el dataset DAPO-Math-17K y la variante Student-Top-16 RKL de la divergencia de Kullback-Leibler.

El repositorio alberga dos artefactos distintos. Por un lado, la serie `pairB-step-*`, que corresponde al estudiante DeepSeek-R1-Distill-Qwen-1.5B entrenado durante 144 pasos con 64 prompts y 4 rollouts por paso. Por otro, `pairA-step-000144`, el checkpoint final de una ejecución paralela con el profesor JustRL-DeepSeek-1.5B, cuyos pasos intermedios se alojan en el repositorio `opd-justrl-1p5b-trajectory`. Los pesos están en formato Hugging Face, fusionados a partir de shards FSDP.

La relevancia de esta ficha es acotada: no se trata de un modelo listo para producción, sino de un artefacto de investigación sobre técnicas de destilación on-policy. No hay información publicada sobre licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek-R1-Distill-Qwen-1.5B); detalles no disponibles |
| Parametros totales | 1.500 millones (modelo estudiante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato Hugging Face, fusionado desde shards FSDP) |

## Arquitectura y entrenamiento

El estudiante es DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de 1.500 millones de parámetros derivado de la familia Qwen y destilado originalmente desde DeepSeek-R1. Sobre esa base, el experimento aplica destilación on-policy: el estudiante genera sus propias trayectorias (64 prompts con 4 rollouts por paso) y se alinea contra las distribuciones del profesor Skywork-OR1-7B mediante la variante Student-Top-16 RKL, una divergencia KL restringida al top-16 del vocabulario del profesor. El entrenamiento se ejecuta durante 144 pasos sobre DAPO-Math-17K, un dataset orientado a problemas matemáticos de competición.

El segundo artefacto, `pairA-step-000144`, es el checkpoint final de una ejecución paralela cuyo profesor es JustRL-DeepSeek-1.5B; los pasos intermedios de esa trayectoria se publican en un repositorio separado. Los pesos se distribuyen en formato Hugging Face tras fusionar los shards FSDP del entrenamiento distribuido. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento se centra en DAPO-Math-17K, por lo que la capacidad esperada es la resolución de problemas matemáticos con cadenas de razonamiento.
- Razonamiento multi-paso: heredado del estudiante DeepSeek-R1-Distill-Qwen-1.5B, que incorpora trazas de razonamiento estilo R1.
- Generación de código y matemáticas: capacidades genéricas del modelo base, no verificadas en este checkpoint.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes: no disponible (no se documenta).
- Capacidades multilingües: no disponible (no se documenta).
- Modo thinking, visión o audio: no disponible (no se documenta).

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como referencia reproducible para estudiar la transferencia de capacidades de un profesor de 7B a un estudiante de 1,5B con Student-Top-16 RKL; se usaría cargando los pesos en transformers y comparando las trayectorias generadas con las del profesor.
- Análisis de la curva de entrenamiento: los pasos `pairB-step-*` permiten trazar la evolución de la política del estudiante a lo largo de 144 pasos y evaluar en qué punto se satura la ganancia de la destilación.
- Comparación de profesores: `pairA-step-000144` (profesor JustRL-DeepSeek-1.5B) frente a la serie `pairB` (profesor Skywork-OR1-7B) permite un estudio controlado del efecto del tamaño y la familia del profesor sobre el estudiante.
- Evaluación de métodos de destilación: el checkpoint se puede usar como línea base para comparar RKL top-16 con otras divergencias (forward KL, reverse KL, JS) en el mismo dataset DAPO-Math-17K.
- Reproducción de experimentos académicos: útil para grupos que investigan distillation de modelos de razonamiento y necesitan un punto de partida ya entrenado para ablaciones.
- Fine-tuning posterior en dominios específicos: al ser un modelo de 1,5B en formato Hugging Face, puede servir como inicialización para ajustes supervisados en tareas matemáticas acotadas, siempre que se resuelva la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1-1,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16; para entrenamiento o evaluación por lotes se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 8 GB o más.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM, llama.cpp y Ollama previa conversión a GGUF, TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opd-pairB-skywork-and-pairA144 (este repo) | 1,5B | no disponible | no disponible | Hugging Face, 0 descargas |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | MIT (según el modelo original) | Hugging Face, ampliamente descargado |
| Skywork-OR1-7B (profesor) | 7B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| JustRL-DeepSeek-1.5B (profesor) | 1,5B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo describe explícitamente como "research checkpoints" y "private"; no está pensado para uso en producción.
- Licencia no especificada: no se puede asumir uso comercial; es necesario consultar la licencia del modelo base DeepSeek-R1-Distill-Qwen-1.5B y de los profesores implicados.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que no se puede afirmar ninguna mejora sobre el modelo base.
- Dominio restringido: el entrenamiento se limita a DAPO-Math-17K, lo que sesga el checkpoint hacia matemáticas y puede degradar el rendimiento en otras tareas.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados, no cuantificado en este checkpoint.
- Idiomas no documentados: se desconoce si conserva el multilingüismo del modelo base.
- Sesgos: no documentados.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto de uso interno sin soporte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bmmv-9x2q7/opd-pairB-skywork-and-pairA144
- Repositorio de la trayectoria JustRL: https://huggingface.co/bmmv-9x2q7/opd-justrl-1p5b-trajectory (referenciado en la model card)
- Modelo base estudiante: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor pairB: https://huggingface.co/Skywork/Skywork-OR1-7B (revisión `5bd323a9`)
- Dataset de entrenamiento: https://huggingface.co/datasets/BAAI/DAPO-Math-17k
- Paper de referencia de Student-Top-16 RKL: no disponible en la información proporcionada.
