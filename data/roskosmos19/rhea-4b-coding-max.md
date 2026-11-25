# roskosmos19/Rhea-4B-Coding-max

## Resumen

Rhea-4B-Coding-max es un modelo de lenguaje de 4.022 millones de parámetros publicado por el usuario roskosmos19 en Hugging Face, derivado del modelo Aquiles-ai/Athenea-4B-Coding. La model card lo presenta como una especialización en razonamiento sobre código, depuración, uso de herramientas para agentes y resolución de problemas en múltiples pasadas, con un flujo de tres fases (implementación inicial, autorrevisión y versión final optimizada) articulado mediante las etiquetas `<think>`, `<review>` y `<final>`. La arquitectura subyacente es la de Qwen3, según los tags del repositorio, con licencia Apache 2.0.

La relevancia de esta ficha viene marcada por una corrección publicada por el propio autor el 23 de noviembre de 2026: los pesos del repositorio son byte a byte idénticos a los del modelo base Aquiles-ai/Athenea-4B-Coding (comparación SHA-256 de los ficheros safetensors). Los cambios introducidos se limitan a la configuración, la plantilla de chat y la documentación. Por tanto, las afirmaciones sobre entrenamiento adicional o mejoras de rendimiento no corresponden a pesos distintos de los del original, y cualquier evaluación técnica debe remitirse al modelo base.

Adicionalmente, el repositorio sufrió un arreglo el 13 de noviembre de 2026: antes de esa fecha no podía cargarse con Transformers porque el índice de pesos contenía una configuración de tokenizer en lugar del mapa de tensores, y los ficheros de tokenizer y plantilla de chat usaban tokens especiales corruptos. La corrección no modificó los pesos. El modelo declara soporte únicamente para inglés y está etiquetado como *uncensored*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, según tags del repositorio) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors en el repo principal; GGUF de comunidad en mradermacher/Rhea-4B-Coding-max-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2 shards, 398 tensores); GGUF vía cuantizaciones de comunidad |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 4.022 millones de parámetros, según los tags del repositorio y el recuento de safetensors. La model card describe un entrenamiento sobre el dataset Aquiles-ai/Athenea-Coding-100k, con trazas de razonamiento explícitas delimitadas por etiquetas, y menciona también el dataset roskosmos19/Rhea-Coding. Sin embargo, la corrección del 23 de noviembre de 2026 aclara que los pesos son idénticos a los del modelo base Aquiles-ai/Athenea-4B-Coding, por lo que el entrenamiento efectivo corresponde al del modelo original y no a un proceso adicional propio de este repositorio.

La innovación declarada es el flujo de razonamiento en tres pasadas: una primera implementación, una autorrevisión centrada en errores, casos límite, seguridad y rendimiento, y una versión final optimizada con funcionalidad idéntica. Este flujo se articula mediante etiquetas de texto (`<think>`, `<review>`, `<final>`), que según la corrección del repositorio son etiquetas de texto plano y no tokens especiales del tokenizer. No se dispone de información sobre número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de código en múltiples lenguajes de programación, según la model card.
- Razonamiento paso a paso dentro de bloques ` thinking`.
- Autorrevisión de código para detección de errores, casos límite, seguridad y rendimiento.
- Refinamiento iterativo en tres pasadas con etiquetas `<think>`, `<review>` y `<final>`.
- Soporte declarado de herramientas para agentes de IA (*agentic tools*).
- Depuración y comprensión de código.
- Diseño de algoritmos y resolución de problemas lógicos.
- Generación sin censura (*uncensored*), orientada a visibilidad completa del razonamiento.
- Compatibilidad con frameworks de inferencia abiertos (Transformers, vLLM, entre otros).
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Asistencia a desarrolladores en entornos de investigación: el modelo puede generar una implementación, revisarla y producir una versión final optimizada en una sola interacción, lo que encaja en prototipado rápido y experimentación con flujos de razonamiento estructurado.
- Depuración de código en pipelines internos: la fase de autorrevisión permite señalar errores, casos límite y problemas de seguridad sobre un fragmento dado, útil como paso previo a la revisión humana.
- Generación de código para proyectos con licencia permisiva: al ser Apache 2.0, puede integrarse en herramientas internas y productos derivados sin las restricciones de licencias copyleft, siempre que se respeten las condiciones de la licencia.
- Experimentación con agentes y *tool calling*: el soporte declarado de herramientas para agentes permite prototipar asistentes que invocan funciones externas, aunque requiere validación empírica por parte del equipo.
- Investigación sobre razonamiento multi-pasada: el esquema de tres fases con etiquetas explícitas facilita estudiar cómo evoluciona la calidad del código entre pasadas y comparar estrategias de autorrevisión.
- Evaluación comparativa de modelos pequeños de código: con 4.022 millones de parámetros y cuantizaciones GGUF de comunidad, sirve como referencia en estudios de eficiencia frente a modelos mayores.
- Generación de documentación técnica y explicaciones de código: la capacidad de razonamiento paso a paso permite producir explicaciones detalladas de fragmentos complejos, útil en formación interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables, y la corrección del autor indica que cualquier afirmación sobre mejores puntuaciones de benchmark no se refiere a pesos distintos de los del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8 GB solo para pesos (4.022 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 4-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 2,5-3 GB para pesos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en GPUs de 8 GB requiere cuantización.
- GPU de datacenter recomendadas: A100, H100 y L40S para despliegues de mayor concurrencia.
- Opciones de despliegue: Transformers, vLLM (declarado compatible), llama.cpp y Ollama mediante las cuantizaciones GGUF de comunidad; TGI aparece como tag del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rhea-4B-Coding-max | 4.022 M | no disponible | Apache 2.0 | Hugging Face, GGUF de comunidad | Pesos idénticos a Athenea-4B-Coding; solo cambian configuración y plantilla |
| Aquiles-ai/Athenea-4B-Coding | 4.022 M (mismo checkpoint) | no disponible | no disponible en la información | Hugging Face | Modelo base original; mismas capacidades efectivas |
| Qwen3 de 4B (familia base) | ~4.000 M | no disponible | no disponible en la información | Hugging Face | Arquitectura de referencia según tags; comparación de rendimiento no disponible |

No se dispone de datos de rendimiento comparado que permitan establecer diferencias cuantitativas entre estas alternativas. La comparación relevante es que Rhea-4B-Coding-max no aporta pesos distintos respecto a Athenea-4B-Coding.

## Limitaciones y advertencias

- Los pesos son byte a byte idénticos a Aquiles-ai/Athenea-4B-Coding; no hay entrenamiento adicional ni mejora de benchmark atribuible a este repositorio.
- Modelo etiquetado como *uncensored*: puede generar contenido sin filtros, y el autor declara que el usuario es el único responsable del uso y del contenido producido.
- El autor indica que está destinado exclusivamente a investigación y experimentación.
- Soporte de idiomas limitado al inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación inherente a modelos de 4.000 millones de parámetros, especialmente en tareas de código complejas o APIs poco representadas.
- Las etiquetas `<review>` y `<final>` son texto plano, no tokens especiales; los pipelines que dependan de tokens especiales deben adaptarse.
- Historial de repositorio problemático: antes del 13 de noviembre de 2026 no cargaba correctamente con Transformers; conviene fijar una revisión concreta del repositorio en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse el cumplimiento de las condiciones de atribución y la cadena de licencias del modelo base.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de seguridad; se recomienda evaluación propia antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max
- Modelo base: https://huggingface.co/Aquiles-ai/Athenea-4B-Coding
- Cuantizaciones GGUF de comunidad: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-GGUF
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Aquiles-ai/Athenea-Coding-100k
- Dataset adicional declarado: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- Licencia: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max/blob/main/LICENSE
