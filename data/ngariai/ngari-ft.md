# NGARiAI/ngari-ft

## Resumen

NGARi ngari-ft es un ajuste fino completo (full fine-tune) del modelo Qwen2.5-1.5B-Instruct, publicado por NGARiAI bajo el paraguas de su programa "Open Source Friday". El modelo se distribuye exclusivamente como GGUF cuantizado en Q4_K_M (0,99 GB), lo que lo sitúa en la categoría de modelos para edge computing y despliegue local con Ollama. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5, con 1.543.714.304 parámetros totales y una ventana de contexto heredada del modelo base.

La relevancia de esta ficha no reside en el rendimiento del modelo, sino en su transparencia editorial: el autor declara explícitamente una puntuación media de evaluación conversacional de 0,3102 y lo describe como un checkpoint intermedio entre sus versiones v1 y v2, por debajo de la línea v3. La model card incluye una sección titulada "What this is not" que advierte de que no es el modelo recomendado del catálogo.

Se trata, por tanto, de un artefacto de linaje y trazabilidad: el autor publica el registro de evaluación por ejemplo (`ngari-ft-q4_K_M_chat_eval.json`), los datos de entrenamiento en `NGARiAI/ngari-datasets` y la receta en `training/`. Es útil para quien quiera auditar el proceso de destilación y ajuste, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención completa estándar y 1.543.714.304 parámetros. Sobre esa base se aplicó un ajuste fino completo ("every weight moved, rather than a LoRA on a frozen base", según la model card), es decir, se actualizaron todos los pesos en lugar de entrenar un adaptador LoRA sobre una base congelada. El resultado se exportó directamente a GGUF Q4_K_M.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí indica que los datos están publicados en `NGARiAI/ngari-datasets` y que la receta de entrenamiento se encuentra en la carpeta `training/` del mismo repositorio. El autor etiqueta el modelo con `distillation` y `lineage`, lo que sugiere un proceso de destilación, aunque no se especifica el profesor ni la metodología en la información disponible. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, heredada de la pipeline `text-generation` y del ajuste sobre Qwen2.5-1.5B-Instruct.
- Conversación multi-turno (etiqueta `conversational` en Hugging Face).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Despliegue en Ollama y entornos edge (etiquetas `ollama`, `edge-ai`).
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada; no se documentan en la model card.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Auditoría de linaje de modelos: el repositorio incluye el registro de evaluación por ejemplo (`ngari-ft-q4_K_M_chat_eval.json`), lo que permite reproducir y verificar la puntuación declarada de 0,3102 en la evaluación conversacional.
- Estudio de recetas de ajuste fino completo frente a LoRA: al publicarse la receta en `training/` y los datos en `ngari-datasets`, sirve como caso de referencia para comparar ambos enfoques sobre Qwen2.5-1.5B.
- Despliegue en dispositivos de recursos muy limitados: el fichero GGUF Q4_K_M de 0,99 GB cabe en entornos con poca memoria y puede ejecutarse con Ollama en hardware de gama baja, aunque con calidad conversacional limitada.
- Pruebas de integración de pipelines GGUF: útil para validar flujos de carga de modelos cuantizados en Q4_K_M y compatibilidad con endpoints antes de sustituir por un checkpoint superior del mismo catálogo.
- Docencia y experimentación sobre cuantización: permite observar el efecto de Q4_K_M sobre un modelo de 1,5B ajustado, comparando la salida con el modelo base en precisión completa.
- Referencia negativa en evaluaciones: dado que el propio autor lo sitúa por debajo de sus versiones v2 y v3, sirve como punto de control para calibrar evaluadores conversacionales y detectar mejoras entre checkpoints.

## Benchmarks y rendimiento

El único dato de evaluación disponible es la puntuación media de la evaluación conversacional declarada por el autor:

| Evaluación | Puntuación |
|---|---|
| Chat eval avg_score | 0,3102 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no presenta comparaciones de capacidad con modelos más grandes ni resultados de un solo tablero como si fueran de flota.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el fichero Q4_K_M (0,99 GB), más overhead de contexto y runtime; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y backend.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); también ejecutable en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en sistemas integrados.
- Opciones de despliegue: Ollama (etiqueta explícita), llama.cpp y otros runtimes compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NGARi ngari-ft | 1.543.714.304 | no disponible | GGUF Q4_K_M | apache-2.0 | Chat eval avg_score 0,3102 |
| Qwen2.5-1.5B-Instruct | 1.543.714.304 | no disponible en esta ficha | safetensors, GGUF | apache-2.0 | Modelo base sin ajuste |
| Otros checkpoints del linaje NGARi (v2, v3) | no disponible | no disponible | no disponible | apache-2.0 (presumible) | Puntuaciones superiores según el autor |

La comparación con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Calidad conversacional limitada: el propio autor declara una puntuación media de 0,3102 y lo describe como no recomendado frente a sus versiones posteriores.
- Solo inglés: el campo `language` restringe el modelo a `en`; no se documenta soporte multilingüe.
- Única cuantización publicada: solo existe Q4_K_M, lo que impide evaluar el efecto de la cuantización frente a pesos en precisión completa.
- Riesgo de alucinación: inherente a un modelo de 1,5B ajustado; no se documentan medidas de mitigación.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-1.5B-Instruct también es Apache-2.0, por lo que no hay conflicto conocido.
- Trazabilidad parcial: aunque se publican datos y receta, no se detalla el número de tokens de entrenamiento ni la metodología de destilación.
- Fecha de publicación futura (27 de noviembre de 2026) según la model card; verificar la vigencia del checkpoint antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-ft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Colección Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Programa y reglas: https://ngari.ai/open-source-friday
