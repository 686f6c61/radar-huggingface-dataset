# huggingface12341/zsm-e1

## Resumen

zsm-e1 es un modelo de fusión (merge) publicado por el usuario huggingface12341 en Hugging Face, construido sobre la arquitectura Qwen3.5 y orientado a tareas de extracción de características y modelado de decisiones. No se trata de un modelo entrenado desde cero, sino de un ensamblaje de pesos derivado de tres modelos base mediante la técnica TIES, lo que lo sitúa en la categoría de los llamados "modelos de fusión" o "soups", habituales en comunidades de competición y experimentación rápida.

El modelo parte del cuerpo base joamCriff123/zils-mini-m1121t (denominado "seated body" en la model card) y le aplica un vector de tarea calculado como la diferencia entre los pesos de los modelos Rein-NPC-4B y SII-Decision-4B-LoRA respecto al Qwen3.5-4B original. El resultado se incorpora con un factor de 0,7 y una densidad TIES de 0,2, manteniendo la torre de visión del modelo base. El total de parámetros asciende a 4.539.265.536 (aproximadamente 4,54 mil millones), con pesos en formato safetensors y un repositorio de 9,1 GB.

Su relevancia es limitada y muy específica: se trata de un artefacto experimental con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada sobre capacidades, idiomas o benchmarks. Resulta útil únicamente como referencia para quienes estudian técnicas de fusión de modelos, linajes de pesos o el ecosistema de subredes tipo Zils, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (fusión TIES sobre cuerpo base zils-mini) |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5, del que hereda la estructura de atención y las dimensiones de capas. Sobre esa base, el autor aplica una fusión de tipo TIES con densidad 0,2, elección de signo y media disjunta, combinando los vectores de tarea de dos modelos (Rein-NPC-4B y SII-Decision-4B-LoRA) calculados como diferencia respecto a Qwen/Qwen3.5-4B. El resultado se escala a 0,7 y se suma al cuerpo base joamCriff123/zils-mini-m1121t, conservando la torre de visión de este último.

No se documenta ningún proceso de entrenamiento adicional: no hay datos sobre número de tokens, composición del dataset, RLHF, DPO ni ajuste fino posterior a la fusión. La innovación técnica se limita al propio método de merge (TIES con poda por densidad y resolución de conflictos de signo), una técnica conocida para reducir interferencias entre vectores de tarea al combinar múltiples adaptaciones. Tampoco se especifican detalles sobre la inicialización, el tokenizador ni posibles modificaciones del vocabulario.

## Capacidades

- Extracción de características (feature-extraction): es la tarea declarada en el pipeline de Hugging Face, por lo que el uso previsto es la generación de embeddings o representaciones internas.
- Modelado de decisiones: las etiquetas "decision-model" y "d3-mini" sugieren un enfoque hacia tareas de decisión, aunque no se detalla qué tipo de decisiones ni con qué formato de entrada/salida.
- Herencia potencial de Qwen3.5: al derivar de Qwen3.5-4B, podría conservar capacidades de generación de texto, razonamiento y código, pero no hay confirmación en la información disponible.
- Torre de visión: el modelo conserva la torre de visión del cuerpo base, lo que sugiere capacidad multimodal de entrada, si bien no se documenta su funcionamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre fusión de modelos: el caso más realista es estudiar cómo afecta una fusión TIES con densidad 0,2 a los pesos de un transformer de 4,5 B, comparando las representaciones resultantes con las del Qwen3.5-4B original. Sirve para analizar interferencias entre vectores de tarea.
- Extracción de embeddings para experimentos de recuperación: al declararse como feature-extraction, puede emplearse para generar representaciones vectoriales de texto en prototipos de búsqueda semántica, siempre que se valide su calidad frente a un encoder dedicado.
- Reproducción de linajes de pesos: útil para auditar la procedencia de los pesos en subredes tipo Zils y verificar la trazabilidad de las fuentes Apache-2.0 citadas (zils-mini, Rein-NPC-4B, SII-Decision-4B-LoRA).
- Base para nuevos merges experimentales: al ser un artefacto intermedio, puede servir como punto de partida para otras fusiones dentro del ecosistema de la subred 127 d3-mini.
- Evaluación comparativa de métodos de merge: permite contrastar TIES con otras técnicas (SLERP, DARE, model soup simple) sobre el mismo cuerpo base y los mismos vectores de tarea.
- Docencia y divulgación: ejemplo práctico para explicar cómo se construye un modelo de fusión y qué metadatos debe incluir una model card para ser reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B de parámetros, en fp16 se requieren aproximadamente 9,1 GB de VRAM solo para los pesos; en fp32, unos 18,2 GB. En cuantización de 8 bits, alrededor de 4,5 GB; en 4 bits, unos 2,3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: para fp16, una RTX 4090 (24 GB), A100 40 GB o H100 son suficientes; para fp32 conviene una A100 40 GB o superior.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas con 12 GB o más en fp16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y en 8 GB o más con cuantización de 8 bits.
- Opciones de despliegue: transformers (librería declarada), con posibles integraciones en vLLM, TGI o llama.cpp si se generan pesos compatibles, aunque no se documentan. El tag "custom_code" implica que puede requerir código específico del autor para cargarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsm-e1 | ≈4,54 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fusión TIES experimental |
| Qwen/Qwen3.5-4B | ≈4 B (no confirmado) | no disponible | no disponible en la informacion | Hugging Face | Modelo padre del linaje |
| jmc0/Rein-NPC-4B | ≈4 B (no confirmado) | no disponible | Apache-2.0 (según la card) | Hugging Face | Fuente del vector de tarea |
| jylin001206/SII-Decision-4B-LoRA | ≈4 B (no confirmado) | no disponible | Apache-2.0 (según la card) | Hugging Face | Fuente del vector de tarea (LoRA) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas que respalden la calidad del modelo en ninguna tarea, lo que impide recomendarlo para producción.
- Model card mínima: no se documentan idiomas, contexto, cuantizaciones ni formato de prompt, lo que dificulta su uso reproducible.
- Riesgo de alucinación: al ser un modelo derivado de Qwen3.5 sin ajuste adicional documentado, conserva los riesgos habituales de los LLM, agravados por la falta de evaluación.
- Fusión con densidad 0,2: una poda tan agresiva de los vectores de tarea puede degradar capacidades específicas de los modelos fuente; no hay validación publicada.
- Sesgos: no se documenta ningún análisis de sesgos; al heredar los datos de entrenamiento de Qwen3.5 y de los modelos fusionados, puede reproducir sesgos de esos corpus.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar el archivo NOTICE citado en la card para confirmar la trazabilidad de las fuentes.
- Tag "custom_code": la carga puede requerir código personalizado no auditado, lo que supone un riesgo de seguridad en entornos de producción.
- Cero tracción comunitaria: sin descargas ni validación externa, no hay evidencia de que el modelo funcione según lo previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsm-e1
- Modelo base principal: https://huggingface.co/joamCriff123/zils-mini-m1121t
- Fuente del vector de tarea: https://huggingface.co/jmc0/Rein-NPC-4B
- Fuente del vector de tarea (LoRA): https://huggingface.co/jylin001206/SII-Decision-4B-LoRA
- Modelo padre del linaje: https://huggingface.co/Qwen/Qwen3.5-4B
