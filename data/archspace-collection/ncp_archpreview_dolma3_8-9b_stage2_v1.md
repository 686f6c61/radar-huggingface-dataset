# ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v1

## Resumen

NCP-ArchPreview 8.9B Stage 2 V1 es un modelo de lenguaje base desarrollado por The NCP Team, una colaboración entre Shanghai AI Lab y LUMIA Lab de Shanghai Jiao Tong University. Se publica bajo la colección ArchSpace-Collection y representa la segunda etapa de un proyecto de investigación centrado en el entrenamiento conjunto de predicción de siguiente token (NTP) y predicción de siguiente concepto (NCP). El modelo está pensado como una liberación de investigación para completar, evaluar y adaptar, no como un modelo instructivo listo para producción.

La arquitectura combina un encoder de 16 capas, un módulo de conceptos de 8 capas y un decoder de 16 capas, con un total de aproximadamente 8.94 mil millones de parámetros y una ventana de contexto de entrenamiento de 8.192 tokens. Stage 2 continúa el entrenamiento del modelo Stage 1 sobre el dataset Dolma 3 Dolmino, siguiendo el currículo de datos de la segunda etapa del modelo OLMo-3-7B. El resultado es un modelo base que alcanza una media global de 57.57 en la evaluación principal, superando ligeramente al OLMo-3-7B correspondiente, con mejoras notables en GSM8K, MMLU y PIQA, aunque con descensos en HumanEval y ARC-Challenge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder de 16 capas, módulo de conceptos de 8 capas y decoder de 16 capas (modelo de espacio latente con NTP y NCP) |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura híbrida de espacio latente que mantiene un encoder de 16 capas, un módulo de conceptos de 8 capas y un decoder de 16 capas. Esta estructura permite el entrenamiento conjunto de dos objetivos: la predicción clásica del siguiente token (NTP) y la predicción del siguiente concepto (NCP), una innovación que busca refinar tanto las capacidades a nivel de token como el espacio conceptual aprendido durante el preentrenamiento. El modelo no es un MoE, por lo que todos los parámetros se activan en cada paso.

La etapa Stage 2 continúa el modelo Stage 1 sobre el dataset Dolma 3 Dolmino, siguiendo el currículo de datos de la segunda etapa del modelo OLMo-3-7B. No se han publicado los números exactos de tokens de entrenamiento, pero el informe técnico indica que Stage 2 alcanza la pérdida final de entrenamiento de OLMo-3-7B con el 66.2% de los tokens, lo que equivale a una convergencia de 1.51x en presupuesto de tokens. No se menciona ningún proceso de RLHF o DPO; se trata de un modelo base sin alineación por instrucciones. Entre las innovaciones destacadas se encuentra su uso como modelo Target para decodificación especulativa basada en conceptos, emparejado con el modelo borrador NCPFlash.

## Capacidades

- Generación de texto y razonamiento general, con puntuaciones destacadas en tareas de matemáticas y MMLU.
- Razonamiento matemático: alcanza 83.02 en GSM8K y 60.32 en GSM-Symbolic, superando al OLMo-3-7B en más de 3 puntos porcentuales en ambas.
- Generación de código: obtiene 45.62 en HumanEval y 50.85 en MBPP, con resultados mixtos en comparación con OLMo-3-7B.
- Capacidades STEM y no STEM en formato de opción múltiple, con medias de dominio de 88.67 y 77.76 respectivamente.
- Modelo de espacio latente: expone un módulo de conceptos que puede ser utilizado para análisis de representaciones y decodificación especulativa.
- No se ha documentado soporte de tool calling, function calling, agentes, visión o audio. Al ser un modelo base, no está alineado para seguir instrucciones de forma directa.

## Casos de uso

- Investigación en modelos de espacio latente: el modelo permite estudiar cómo la predicción de conceptos (NCP) afecta a las representaciones internas y a la calidad del texto generado. Los investigadores pueden analizar el módulo de conceptos de 8 capas y comparar sus activaciones con modelos transformer convencionales.
- Evaluación de eficiencia de entrenamiento: dado que Stage 2 alcanza la pérdida final de OLMo-3-7B con un 66.2% de los tokens, es útil para estudios sobre convergencia y presupuesto de datos en preentrenamiento continuado.
- Fine-tuning para razonamiento matemático: el modelo parte de una base sólida en GSM8K y MATH-500, por lo que es adecuado para ajustes finos en dominios de matemáticas, lógica y resolución de problemas.
- Decodificación especulativa: está emparejado como modelo Target con el borrador NCPFlash, lo que permite experimentar con técnicas de draft y verificación basadas en conceptos para acelerar la inferencia.
- Preentrenamiento continuado en dominios específicos: al ser un modelo base, puede adaptarse a corpus técnicos, científicos o legales mediante preentrenamiento adicional, aprovechando su arquitectura de espacio latente.
- Benchmarking de modelos base: sirve como referencia para comparar la calidad de representaciones y la eficiencia de entrenamiento frente a otros modelos de tamaño similar, como OLMo-3-7B.

## Benchmarks y rendimiento

La siguiente tabla recoge la comparativa principal entre NCP-ArchPreview Stage 2 y OLMo-3-7B Stage 2, siguiendo el protocolo de evaluación de OLMo-Core. Los valores son porcentajes y los deltas son puntos porcentuales absolutos.

| Metrica | OLMo-3-7B Stage 2 | NCP-ArchPreview Stage 2 | Delta |
|---|---|---:|---:|
| Overall AVG | 56.98 | **57.57** | +0.59 |
| MMLU | 66.66 | **68.48** | +1.82 |
| GSM8K | 79.68 | **83.02** | +3.34 |
| GSM-Symbolic | 57.32 | **60.32** | +3.00 |
| MATH-500 | 43.44 | **43.91** | +0.47 |
| HumanEval | **49.31** | 45.62 | -3.69 |
| MBPP | 48.98 | **50.85** | +1.87 |
| ARC-Challenge | **85.49** | 83.28 | -2.21 |
| PIQA | 78.35 | **81.45** | +3.10 |

La comparación de las tres recetas de datos de Stage 2 (V1, V2 y V3) bajo la misma configuración de inferencia y muestreo muestra que V1 lidera en la mayoría de tareas de código, matemáticas, STEM y razonamiento lógico, mientras que V2 y V3 superan a V1 en HellaSwag por un margen muy estrecho.

| Benchmark | v1 | v2 | v3 |
|---|---|---:|---:|
| HumanEval | **45.60** | 42.19 | 39.96 |
| MBPP | **50.91** | 49.34 | 46.60 |
| MATH-500 | **43.74** | 41.66 | 37.21 |
| Minerva | **42.20** | 40.39 | 36.70 |
| MMLU-STEM | **61.84** | 59.85 | 57.72 |
| BBH | **63.23** | 62.90 | 60.44 |
| HellaSwag | 66.40 | **67.30** | 67.25 |

El protocolo de evaluación incluye: GSM8K con 8 ejemplos y una finalización por problema (pass@1); MATH-500 con 4 ejemplos y 32 finalizaciones por problema (pass@1); HumanEval y MBPP con 3 ejemplos y 32 finalizaciones por problema (pass@1 de ejecución). La verosimilitud se reporta en bits por byte UTF-8 (BPB), donde valores más bajos son mejores, y el modelo obtiene un BPB medio de 0.763 frente a 0.793 de OLMo-3-7B.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18-20 GB para los pesos y activaciones con contexto de 8.192 tokens. El tamaño del repositorio es de 17.9 GB.
- VRAM estimada con cuantización 4-bit: aproximadamente 6-8 GB, dependiendo de la implementación y del tamaño del contexto.
- GPUs recomendadas: RTX 4090 de 24 GB, A100 de 40 GB o H100 de 80 GB para inferencia en bfloat16 sin cuantizar. Para cuantización 4-bit, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (con cuantización), Transformers con accelerate y TGI.
- Latencia y throughput estimados: no disponible. El informe técnico aclara que la comparación de convergencia en tokens es una medida de pérdida de entrenamiento, no una medición de throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall AVG | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NCP-ArchPreview 8.9B Stage 2 V1 | 8.94B | 8.192 | **57.57** | Apache-2.0 | HuggingFace |
| OLMo-3-7B Stage 2 | ~7B (no confirmado) | no disponible | 56.98 | no disponible | HuggingFace |
| NCP-ArchPreview 8.9B Stage 1 | 8.94B | 8.192 | no disponible | Apache-2.0 | HuggingFace |

El modelo compite directamente con OLMo-3-7B Stage 2, superándolo en la media global, MMLU, GSM8K, GSM-Symbolic, MBPP y PIQA, pero quedando por debajo en HumanEval y ARC-Challenge. No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instructivo, por lo que no está alineado para seguir instrucciones de usuario ni para tareas de chat. Requiere fine-tuning o adaptación para uso conversacional.
- Muestra un perfil mixto en tareas individuales: pierde en HumanEval (-3.69) y ARC-Challenge (-2.21) frente a OLMo-3-7B, lo que indica un posible desajuste entre la mezcla de datos de continuación y los dominios downstream.
- El informe advierte explícitamente que una menor pérdida agregada de entrenamiento no implica mejor rendimiento en todas las tareas.
- No se han documentado los idiomas soportados, por lo que su comportamiento multilingüe es desconocido.
- No se ha documentado soporte de tool calling, function calling ni agentes.
- Al ser un modelo de investigación, puede presentar sesgos no identificados y mayor riesgo de alucinación, especialmente en dominios no cubiertos por los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero la liberación está orientada a investigación y no se proporcionan garantías de rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_v1
- Colección de modelos NCP-ArchPreview: https://huggingface.co/collections/ArchSpace-Collection/ncp-archpreview
- Código de evaluación: https://github.com/LuckySJTU/ncp_olmo_eval
- Modelo borrador NCPFlash emparejado: https://huggingface.co/ArchSpace-Collection/NCP_ArchPreview_dolma3_8.9B_Stage2_DFlash2_NCPFlash
- Informe técnico: no disponible (la URL del reporte es un marcador TODO en la model card)
