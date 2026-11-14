# Charlie320/zils-mini-njos1

## Resumen

zils-mini-njos1 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema Zils, concretamente del pool de modelos tipo "soup" denominado d3-mini, asociado a la subred 127 de Bittensor. El modelo se presenta como un "body" (cuerpo) dentro de un conjunto de pesos promediados y ajustados para tareas de decisión (decision-model), no como un modelo conversacional de propósito general.

Técnicamente, el modelo parte de la media uniforme de los pesos de tres cuerpos previos del soup del 14 de noviembre de 2026 (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b), todos bajo licencia Apache-2.0. Sobre ese punto de partida se aplicó un único entrenamiento LoRA de rango 64 (anchor 0.1, learning rate 5e-5) que se fusionó en los pesos base. El resultado es un modelo de aproximadamente 4.539 millones de parámetros (4,54 mil millones), almacenado en BF16 con un repositorio de 9,1 GB.

Su relevancia es acotada y muy específica: se trata de un modelo orientado a la toma de decisiones estructuradas y a tareas de evaluación tipo examen, dentro de un marco de entrenamiento colaborativo distribuido. No cuenta con descargas ni likes en el momento de la consulta, no tiene pipeline declarado y no se han publicado resultados de benchmarks ni una model card con especificaciones de contexto o idiomas más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); no se detalla en la model card |
| Parametros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; safetensors) |
| Idiomas soportados | no disponible (la model card menciona datos en 9 idiomas de Wikipedia para el entrenamiento, pero no declara idiomas de inferencia) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros. La model card no aporta detalles adicionales sobre la arquitectura interna (número de capas, dimensiones, tipo de atención) ni sobre la torre de visión, más allá de indicar que la torre de visión proviene del modelo padre y que los pesos de lenguaje fueron entrenados. El modelo se describe como un fine-tune en "chassis layout" en BF16.

El proceso de entrenamiento consta de dos fases. Primero, se calcula la media uniforme de los pesos de tres cuerpos del soup d3-mini del 14 de noviembre de 2026. Segundo, se ejecuta un único LoRA de rango 64 con anchor 0.1 y learning rate 5e-5 sobre aproximadamente 133.000 filas de datos (120.000 vistas en una pasada barajada), que se fusiona en el punto de partida. Los datos de entrenamiento se componen de: (1) ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir de splits públicos de entrenamiento, más respuestas del profesor de relay público de Zils; (2) 63.840 decisiones tipadas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions, filtradas a filas marcadas con license_use: commercial, texto mayoritariamente ASCII, máximo 200 filas por dataset fuente y 413 fuentes; (3) aproximadamente 24.500 registros públicos de decisiones con resultados conocidos, recogidos con el constructor público Zils Outcomes (zils.current, sin modificar) de eventos liquidados antes del 28 de octubre de 2026: resultados de revisión de código (merged o abandoned) de los hosts Gerrit públicos de Android (AOSP), Wikimedia y OpenStack (OpenDev); resultados de reversión de ediciones de Wikipedia (9 idiomas) y Wikidata; resultados de revisión de Articles for Creation de Wikipedia en inglés; y etiquetas de categoría primaria de arXiv. No se usaron ítems de examen de validadores, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Toma de decisiones estructuradas en formato de examen: el modelo está entrenado específicamente para producir decisiones tipadas a partir de ítems de evaluación.
- Clasificación y etiquetado: entrenado con etiquetas de categoría primaria de arXiv y resultados de reversión de ediciones, lo que sugiere capacidad para tareas de clasificación supervisada.
- Razonamiento sobre resultados observados: los datos de entrenamiento incluyen decisiones con resultados conocidos (merged/abandoned, revert/no revert), orientados a predecir o evaluar desenlaces.
- Capacidad de lenguaje heredada de Qwen3.5-4B: al ser un fine-tune del modelo base, conserva las capacidades generales de generación de texto del padre, aunque la model card no las detalla ni las garantiza.
- Torre de visión heredada del modelo padre: la model card indica que la torre de visión proviene del padre, lo que sugiere capacidades multimodales potenciales, si bien no se especifica su funcionamiento tras el fine-tune.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: no disponible como capacidad declarada; los datos de entrenamiento incluyen Wikipedia en 9 idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de decisiones en formato de examen: el modelo puede emplearse para responder ítems de decisión estructurados, dado que fue entrenado explícitamente con la receta de autoría de exámenes de Zils y con respuestas de profesor de relay. Es adecuado para pipelines de evaluación interna dentro del ecosistema Zils.
- Clasificación de resultados de revisión de código: entrenado con resultados merged/abandoned de Gerrit (AOSP, Wikimedia, OpenDev), puede usarse para predecir o clasificar el desenlace probable de una revisión de código en entornos con datos similares.
- Moderación y análisis de ediciones colaborativas: los datos de reversión de Wikipedia y Wikidata permiten emplearlo en tareas de detección de ediciones problemáticas o clasificación de reversiones en plataformas wiki.
- Etiquetado de artículos científicos: entrenado con etiquetas de categoría primaria de arXiv, puede aplicarse a la clasificación temática de preprints, siempre que el dominio coincida con el de entrenamiento.
- Investigación sobre soups de pesos y fine-tuning LoRA: el modelo documenta un proceso reproducible (media uniforme de tres cuerpos + LoRA rango 64) útil para estudiar la composición de modelos y el efecto del promediado de pesos en tareas de decisión.
- Evaluación comparativa dentro de la subred 127 de Bittensor: sirve como cuerpo candidato para las rondas de evaluación del pool d3-mini, permitiendo a los validadores puntuar su rendimiento frente a otros cuerpos.
- Clasificación de decisiones con resultados conocidos: los registros de outcomes (reversiones, revisiones, etiquetas) permiten usarlo como componente de sistemas que estiman la probabilidad de un desenlace en flujos de trabajo colaborativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para los pesos (4,54 mil millones de parámetros × 2 bytes), más memoria para el contexto y las activaciones; se recomienda al menos 16-24 GB de VRAM para inferencia cómoda en BF16.
- Cuantización: al no publicarse versiones GGUF ni cuantizadas, el cálculo para cuantizaciones de 8 bits (≈4,5-5 GB) o 4 bits (≈2,3-3 GB) es estimativo y requeriría conversión manual; no hay datos oficiales de cuantización.
- GPU recomendadas: para BF16, GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100). En consumer GPU de 16 GB podría caber en cuantización de 8 bits, pero sin garantía al no existir artefactos publicados.
- Opciones de despliegue: no se especifican en la model card. Al ser safetensors en BF16, es compatible con frameworks estándar de inferencia (transformers, vLLM, TGI), aunque no se han publicado configuraciones ni confirmación de compatibilidad.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Charlie320/zils-mini-njos1 | ≈4,54 mil millones | no disponible | apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión sobre Qwen3.5-4B; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | ≈4 mil millones (según denominación) | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo base del que hereda arquitectura y torre de visión |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | apache-2.0 | Hugging Face | Cuerpo previo del soup d3-mini, usado como punto de partida |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | apache-2.0 | Hugging Face | Cuerpo previo del soup d3-mini, usado como punto de partida |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | apache-2.0 | Hugging Face | Cuerpo previo del soup d3-mini, usado como punto de partida |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados que permitan evaluar su calidad frente a alternativas; su uso en producción sin evaluación previa es arriesgado.
- Modelo de nicho: está entrenado para tareas de decisión estructurada y evaluación tipo examen, no como asistente conversacional general; su rendimiento fuera de ese dominio es desconocido.
- Riesgo de alucinación: al derivar de un modelo de lenguaje de 4,5 mil millones de parámetros, conserva la propensión del padre a generar contenido plausible pero incorrecto, especialmente fuera de los formatos de decisión vistos en entrenamiento.
- Idiomas no declarados: la model card no especifica idiomas de inferencia; aunque los datos incluyen Wikipedia en 9 idiomas, no hay garantía de competencia multilingüe.
- Contexto desconocido: no se declara la longitud de contexto, lo que impide planificar su uso en conversaciones o documentos largos.
- Datos de entrenamiento con licencias heterogéneas: cada fila de tasksource/tasksource-jev-typed-decisions conserva la licencia de su fuente, y los textos de Wikipedia/Wikidata son CC BY-SA 4.0 con atribución mediante URL de revisión; es necesario revisar los términos de los datasets fuente antes de reutilizar.
- Restricciones de licencia: los pesos son Apache-2.0, pero la licencia del modelo base Qwen3.5-4B no se detalla en la información proporcionada y debe verificarse antes de uso comercial.
- Sin datos de clientes ni ítems de examen de validadores: el autor declara que no se usaron datos de clientes ni ítems de examen de validadores, lo que limita el riesgo de contaminación pero también implica que el modelo no ha sido validado contra esos conjuntos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni demos, lo que reduce la evidencia disponible sobre su funcionamiento real.
- Solo pesos: el repositorio contiene únicamente pesos; no se incluyen scripts de inferencia, tokenizador documentado ni configuración de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-njos1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo del soup: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo previo del soup: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo previo del soup: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
