# 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated

## Resumen

El modelo `3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated` es un ajuste fino experimental del modelo GPT-OSS 20B de OpenAI, publicado por el usuario 3MPER0RR en Hugging Face. Se trata de una variante "abliterated", es decir, un modelo al que se le ha aplicado la técnica de abliteration para eliminar o atenuar los mecanismos de rechazo internos aprendidos durante el alineamiento, partiendo del modelo intermedio `wangzhang/gpt-oss-20b-abliterated`. El autor describe el proceso como una "abliteration multi-round" (abliteration en varias rondas), lo que sugiere que la intervención se aplicó de forma iterativa hasta estabilizar el resultado.

El modelo conserva la arquitectura original de GPT-OSS 20B, un transformer de aproximadamente 20.900 millones de parámetros (20.914.757.184 según los pesos en safetensors), y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 41,9 GB, lo que corresponde a los pesos en precisión completa o semi-precisa (safetensors), sin cuantizaciones GGUF incluidas en el mismo repo.

La relevancia de este modelo es doble: por un lado, permite a investigadores estudiar el comportamiento de un modelo GPT-OSS tras eliminar el alineamiento de seguridad, y por otro, ofrece una alternativa sin rechazos para tareas de generación de texto donde el filtrado del modelo base resulta limitante. No obstante, se trata de un modelo marcado como experimental, con 617 descargas y sin datos de benchmarks publicados, por lo que su uso en producción debe abordarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (GPT-OSS 20B, base de OpenAI) |
| Parámetros totales | 20.914.757.184 (≈20,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo solo con safetensors; no se listan GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GPT-OSS 20B original, un transformer denso de aproximadamente 20,9 mil millones de parámetros. Sobre esa base, el autor aplicó un proceso de abliteration en múltiples rondas: esta técnica identifica las direcciones en el espacio de activaciones asociadas a la negativa a responder y las proyecta fuera, de modo que el modelo pierde parte de su comportamiento de rechazo sin necesidad de reentrenamiento completo. El hecho de que se describa como "multi-round" indica que la intervención se repitió varias veces, presumiblemente recalculando las direcciones de rechazo tras cada pasada para evitar que el modelo las recuperase.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO adicionales tras la abliteration. El modelo base intermedio (`wangzhang/gpt-oss-20b-abliterated`) ya era una variante abliterated, por lo que este modelo representa una segunda capa de intervención sobre el alineamiento original de GPT-OSS. El autor no documenta innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del GPT-OSS 20B base.
- Razonamiento y resolución de problemas de complejidad media, según las capacidades del modelo original.
- Generación de código y matemáticas, presumiblemente conservadas del modelo base (no verificadas en la model card).
- Comportamiento sin rechazos: la abliteration elimina o reduce las negativas a responder ante peticiones que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingües: no disponibles; el autor no especifica idiomas.
- Modo "thinking" o vision: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar qué mecanismos de rechazo existen en GPT-OSS 20B y cómo se comporta el modelo tras eliminarlos, comparando respuestas antes y después de la abliteration en un entorno controlado.
- Generación creativa sin restricciones: para proyectos de escritura de ficción, guiones o narrativa donde el modelo base tiende a rechazar temáticas sensibles, esta variante ofrece continuidad sin interrupciones por negativas.
- Análisis de sesgos y robustez: investigadores pueden evaluar si la eliminación del alineamiento introduce sesgos nuevos o amplifica los existentes, usando el modelo como objeto de estudio en auditorías de seguridad.
- Experimentación con técnicas de abliteration: el enfoque multi-round del autor sirve como referencia metodológica para quienes quieran replicar o mejorar la técnica sobre otros modelos de la familia GPT-OSS.
- Generación de datos sintéticos para entrenamiento: en pipelines donde se necesita un modelo que no filtre temas, puede emplearse para producir datasets de instrucciones o conversaciones que luego se curan manualmente.
- Pruebas de red teaming: el modelo es útil como adversario controlado para evaluar la eficacia de clasificadores de seguridad o sistemas de moderación de contenido desplegados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 42 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 48 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 21-24 GB, viable en GPUs de 24 GB como la RTX 4090 o A10G.
- VRAM estimada en cuantización de 4 bits: alrededor de 12-14 GB, cabe en GPUs consumer de 16 GB como la RTX 4080 o 4070 Ti Super.
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090, L40S o A6000 para 8 bits; RTX 4090/4080 para 4 bits.
- Despliegue: vLLM o TGI para serving en FP16/BF16; llama.cpp u Ollama para cuantizaciones GGUF (no incluidas en el repo, habría que generarlas).
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y el backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated | ≈20,9 B | no disponible | Apache 2.0 | Abliteration multi-round, experimental, sin benchmarks |
| wangzhang/gpt-oss-20b-abliterated | ≈20,9 B | no disponible | Apache 2.0 (presumible) | Modelo base intermedio, una ronda de abliteration |
| GPT-OSS 20B (original OpenAI) | ≈20,9 B | no disponible | Apache 2.0 | Modelo alineado con rechazos, referencia de comportamiento |
| Modelos abliterated de 20-30 B (p. ej. variantes de Llama o Qwen) | 20-30 B | variable | variable | Alternativas de la misma categoría; no se dispone de datos comparativos de rendimiento |

## Limitaciones y advertencias

- Modelo experimental: el autor lo marca explícitamente como "experimental" y no documenta evaluaciones de calidad ni de seguridad.
- Sin benchmarks: no hay datos objetivos de rendimiento, por lo que no puede compararse rigurosamente con el modelo base ni con alternativas.
- Eliminación del alineamiento: la abliteration reduce los rechazos, lo que implica un mayor riesgo de generar contenido dañino, ofensivo o inexacto sin advertencia.
- Riesgo de alucinación: no cuantificado; al no haber evaluación, se desconoce si la intervención degrada la fidelidad factual del modelo base.
- Idiomas no especificados: se desconoce el soporte multilingüe real y la calidad en castellano.
- Contexto no documentado: no se indica la longitud de ventana, lo que dificulta planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el despliegue de un modelo sin alineamiento en aplicaciones de cara al público conlleva riesgos legales y reputacionales que el usuario debe evaluar.
- Procedencia: el autor es un particular, no un laboratorio con proceso de revisión; la reproducibilidad del proceso de abliteration no está documentada.
- Sin cuantizaciones oficiales: el repo solo contiene safetensors, por lo que el despliegue en hardware consumer requiere generar GGUF u otras cuantizaciones por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/3MPER0RR/gpt-oss-20b-3MPER0RR-abliterated
- Modelo base intermedio: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- GPT-OSS (familia original de OpenAI): no disponible en la información proporcionada.
