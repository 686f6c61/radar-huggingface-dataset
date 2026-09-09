# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013` es un checkpoint intermedio de un proceso de entrenamiento con *reinforcement learning* (GRPO) desarrollado por el laboratorio HYU-NLP-EVAL. El modelo es un fine-tuning del instruct model `Qwen/Qwen3-4B-Instruct-2507`, con el modo de pensamiento deshabilitado. No se trata de un modelo final para uso clínico ni médico, sino de un snapshot histórico de política utilizado para una auditoría de fase 1.

El propósito de este checkpoint es estudiar la dinámica del entrenamiento con una variante de GRPO llamada `OnlineRubrics-Every`, que utiliza rúbricas dinámicas en línea, en lugar de rúbricas estáticas. Al archivar el estado exacto en el paso 13 y con la semilla 11, el modelo permite investigar cómo evoluciona una política de lenguaje durante el entrenamiento por refuerzo. Por tanto, su relevancia es principalmente metodológica y de investigación en alineación de modelos.

Arquitectónicamente es un transformer decoder-only basado en la familia Qwen3. Tiene un total de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) y los pesos se distribuyen en formato BF16. No se publican datos sobre la longitud de contexto ni sobre los idiomas soportados en la información proporcionada. El repositorio incluye tanto el modelo exportado para Hugging Face como el checkpoint original en formato FSDP.

## Especificaciones técnicas

| Parámetro                     | Valor                                                                                     |
|-------------------------------|-------------------------------------------------------------------------------------------|
| Arquitectura                  | Transformer decoder-only (basado en Qwen/Qwen3-4B-Instruct-2507)                           |
| Parámetros totales            | 4.022.468.096 (≈ 4,02 mil millones)                                                       |
| Parámetros activos            | No aplica (modelo denso)                                                                   |
| Longitud de contexto          | No disponible                                                                              |
| Tipos de cuantización         | No disponible (los pesos incluidos están en BF16)                                          |
| Idiomas soportados            | No disponible                                                                              |
| Licencia                      | Apache 2.0                                                                                 |
| Formato de pesos              | safetensors (BF16); también incluye `original_checkpoint/` con checkpoints FSDP originales |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. Sobre esta base se ha aplicado un proceso de fine-tuning mediante GRPO (Group Relative Policy Optimization) con una estrategia denominada `OnlineRubrics-Every`. Según la model card, esta estrategia se distingue del GRPO con rúbricas estáticas, ya que las rúbricas se generan y actualizan dinámicamente durante el entrenamiento. El checkpoint corresponde al paso 13 de entrenamiento con la semilla 11.

No se incluyen en el repositorio los datos de entrenamiento, ni las respuestas, ni las rúbricas, ni la configuración de infraestructura. Tampoco se documentan los estados de optimizador. La innovación técnica no es arquitectónica, sino metodológica: se trata de un artefacto intermedio para analizar el comportamiento de la política en un punto concreto del entrenamiento, con una trazabilidad relativamente alta al conservarse el checkpoint original en formato FSDP. La exportación a Hugging Face se realizó con el framework veRL, y se mantiene el checkpoint original por posibles diferencias de precisión y serialización.

## Capacidades

- Generación de texto conversacional a partir del modelo instruct base Qwen3-4B-Instruct-2507.
- Modo de pensamiento deshabilitado, tal como se indica expresamente en la model card.
- Tool calling / function calling: no documentado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades de visión o audio: no documentadas.
- La capacidad especial es ser un snapshot de investigación para estudiar políticas intermedias entrenadas con rúbricas dinámicas; no se realiza ninguna afirmación de capacidad médica o clínica.

## Casos de uso

- Auditoría de procesos de entrenamiento de RL: permite inspeccionar el estado exacto de la política en el paso 13 con la semilla 11, lo que facilita el análisis de cómo evolucionan las respuestas durante el entrenamiento con GRPO.
- Investigación en metodologías de recompensa: sirve como referencia para comparar GRPO con rúbricas dinámicas en línea frente a rúbricas estáticas, gracias a la documentación del enfoque `OnlineRubrics-Every`.
- Reproducción de experimentos: al conservar el checkpoint original en FSDP, un investigador puede cargar el mismo estado paramétrico y verificar resultados de un estudio concreto.
- Evaluación de políticas intermedias: adecuado para construir curvas de aprendizaje de alineación y detectar comportamientos emergentes, así como posibles degradaciones en pasos concretos del entrenamiento.
- Validación de infraestructuras de fine-tuning: puede usarse para comprobar que un pipeline de despliegue con vLLM o Hugging Face Transformers carga correctamente checkpoints exportados desde veRL/FSDP.
- Documentación de investigación: como artefacto de trazabilidad en publicaciones que necesitan citar el estado exacto de un modelo en un paso determinado.
- Entrenamiento continuado (warm-start): permite retomar desde un estado intermedio si se desea explorar estrategias de continuación con otro algoritmo de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ningún otro conjunto de evaluación, y no se documenta rendimiento comparativo con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia con los pesos en BF16: aproximadamente 8,1 GB solo para los pesos. Sumando la memoria de activaciones y la caché KV, se recomienda entre 12 y 16 GB de VRAM para uso interactivo.
- GPU recomendadas: RTX 4080 o RTX 4090 (16-24 GB), A100 40 GB, H100 80 GB. También es viable en RTX 3090 con 24 GB.
- Compatibilidad con GPU de consumo: sí, en tarjetas con al menos 16 GB de VRAM. Con 8 GB podría cargarse el modelo, pero quedaría poco espacio para la caché KV y los logits.
- Opciones de despliegue: vLLM, Hugging Face TGI y Transformers con accelerate. Para usar llama.cpp u Ollama, sería necesaria una conversión previa a GGUF, que no está incluida en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013 | 4.022.468.096 | No disponible | Apache 2.0 | Checkpoint intermedio de GRPO en paso 13, semilla 11 |
| HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003 | 4.022.468.096 | No disponible | Apache 2.0 | Checkpoint intermedio de GRPO en paso 3, semilla 11, del mismo proceso de entrenamiento |
| Qwen/Qwen3-4B-Instruct-2507 | 4.022.468.096 | No disponible | Apache 2.0 | Modelo base sin el fine-tuning GRPO; referencia para comparar el efecto del entrenamiento |

No se han encontrado otros modelos comparables con la misma categoría de checkpoint intermedio de GRPO con rúbricas dinámicas que dispongan de benchmarks públicos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card, pero al ser un modelo basado en un instruct model, puede heredar sesgos del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinación: no ha sido validado para contextos clínicos ni para decisiones médicas; cualquier salida en ese dominio debe considerarse no fiable.
- Limitaciones de contexto e idioma: no se han publicado datos al respecto, por lo que se desconocen los límites exactos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la model card indica explícitamente que es solo para investigación y declina cualquier afirmación de capacidad médica.
- Caveat para producción: es un snapshot intermedio de un proceso de entrenamiento, no un modelo final estable. Puede presentar comportamientos inconsistentes o subóptimos en comparación con el modelo base.
- Reproducibilidad limitada: no se incluyen los datos de entrenamiento, las rúbricas, la configuración de infraestructura ni las credenciales, lo que dificulta la reproducción completa del experimento.
- Cuantizaciones optimizadas: no se proporcionan versiones cuantizadas, por lo que el despliegue en entornos con poca memoria requiere trabajo adicional de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante del mismo proceso de entrenamiento: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- No se han encontrado papers, blogs, repositorios de código o demos adicionales en la búsqueda web realizada.
