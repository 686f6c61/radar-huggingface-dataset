# believe-it-or-not/0524_original_augmented_original_with_sdf_pkc_fda_approval-3cd6e00d

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. Se trata, por tanto, de un fine-tuning ligero que no redistribuye los pesos completos del modelo original, sino únicamente los pesos del adaptador (1,7 GB en el repositorio). El identificador del repositorio sugiere un ajuste orientado a un dominio muy concreto, aparentemente relacionado con documentación regulatoria farmacéutica (SDF, PKC, aprobación de la FDA), aunque la model card no lo confirma explícitamente.

El modelo hereda la arquitectura y capacidades del Llama 3.3 70B Instruct de Meta, un transformer denso de 70 mil millones de parámetros con una ventana de contexto de 128 000 tokens y capacidad multilingüe. El adaptador se publica bajo la librería PEFT 0.15.1 y requiere cargar el modelo base por separado para su uso.

La relevancia de esta ficha es limitada: el repositorio no incluye documentación técnica, no declara licencia, no especifica idiomas ni casos de uso, y no presenta resultados de evaluación. Se trata de un artefacto de investigación sin model card completada, por lo que cualquier evaluación de su calidad debe realizarse empíricamente antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (adaptador LoRA sobre Llama 3.3 70B Instruct) |
| Parametros totales | 70 000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3 70B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones estandar (FP8, INT8, INT4, GGUF) mediante herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base soporta oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador PEFT en formato safetensors, entrenado con PEFT 0.15.1 sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. No se especifica el rango del adaptador, los módulos objetivo, la tasa de aprendizaje ni el número de pasos. Tampoco se documenta el dataset de entrenamiento, su composición o tamaño. El nombre del repositorio (`0524_original_augmented_original_with_sdf_pkc_fda_approval-3cd6e00d`) apunta a un conjunto de datos aumentado con documentación sobre SDF (Structure Data File), PKC (probablemente protein kinase C) y aprobaciones de la FDA, pero esta interpretación no está confirmada por el autor.

No hay información sobre si se aplicaron técnicas de RLHF, DPO o ajuste supervisado más allá del propio fine-tuning con LoRA. Tampoco se documentan innovaciones técnicas adicionales. El modelo base Llama 3.3 70B Instruct emplea atención con GQA (grouped-query attention), RoPE y una ventana de contexto de 128 000 tokens, pero el adaptador no modifica estas características.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Llama 3.3 70B Instruct.
- Generación de código y resolución de problemas matemáticos, según las capacidades del modelo base.
- Soporte de tool calling y function calling, siempre que el adaptador no haya degradado esta capacidad (no verificado).
- Capacidad multilingüe limitada a los idiomas del modelo base (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Posible especialización en dominio regulatorio farmacéutico (SDF, PKC, aprobaciones FDA) según el nombre del repositorio; no confirmado ni documentado.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Extracción de información estructurada de documentación regulatoria farmacéutica: el adaptador podría haberse entrenado para interpretar ficheros SDF y referencias a aprobaciones de la FDA, aunque la ausencia de documentación obliga a validar empíricamente esta hipótesis antes de usarlo.
- Asistencia en la redacción de secciones de expedientes regulatorios: con 128 000 tokens de contexto, el modelo base puede procesar documentos extensos, y el adaptador podría ajustar el estilo al dominio farmacéutico.
- Preguntas y respuestas sobre farmacología y cinética de proteínas (PKC): el nombre del repositorio sugiere este enfoque, pero no hay evaluación que lo respalde.
- Prototipado rápido de asistentes especializados: al ser un adaptador LoRA de 1,7 GB, se puede cargar sobre el modelo base en entornos con suficiente VRAM para experimentar con el dominio sin reentrenar.
- Investigación sobre fine-tuning con LoRA en dominios regulados: útil como artefacto de estudio para comparar técnicas de ajuste ligero en modelos de 70B.
- Filtrado y clasificación de documentos técnicos: el modelo base puede clasificar y resumir textos largos; el adaptador podría mejorar la precisión en terminología específica, previa validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,7 GB en disco, pero requiere cargar el modelo base Llama 3.3 70B Instruct para funcionar.
- VRAM estimada para el modelo base en FP16/BF16: aproximadamente 140 GB, lo que exige múltiples GPUs (por ejemplo, 2× H100 80 GB o 4× A100 40 GB).
- VRAM estimada en cuantización INT8: aproximadamente 70 GB, viable en una H100 80 GB o 2× A100 40 GB.
- VRAM estimada en cuantización INT4: aproximadamente 35-40 GB, viable en una RTX 6000 Ada (48 GB) o 2× RTX 4090 (24 GB cada una).
- No cabe en una única GPU de consumo (RTX 4090 24 GB) ni siquiera en INT4 sin offloading a CPU.
- Opciones de despliegue: vLLM, TGI y llama.cpp para el modelo base; el adaptador se carga con la librería PEFT (versión 0.15.1) o mediante `--lora-modules` en vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B Instruct) | 70B (base) | 128k | no disponible | safetensors (LoRA) | Sin documentación ni evaluación |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | safetensors, GGUF | Modelo base oficial, con model card completa y benchmarks publicados |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (con restricciones) | safetensors, GGUF | Alternativa abierta con licencia más permisiva y benchmarks publicados |
| Mistral-Large-Instruct-2411 | 123B | 128k | Mistral Research License | safetensors | Mayor tamaño y contexto equivalente, licencia restrictiva para uso comercial |

La comparación directa con el adaptador es difícil porque no se han publicado métricas. Frente al modelo base, el adaptador solo se diferencia por el fine-tuning LoRA, cuyo efecto no está documentado.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no se declara licencia, idiomas, casos de uso previstos ni limitaciones.
- No hay resultados de evaluación, por lo que se desconoce si el fine-tuning mejora o degrada las capacidades del modelo base.
- Riesgo de alucinación heredado del modelo base, potencialmente amplificado si el adaptador se entrenó con datos escasos o sesgados.
- El nombre del repositorio sugiere un dominio muy específico (SDF, PKC, FDA), lo que puede provocar un ajuste excesivo (overfitting) y una degradación del rendimiento generalista.
- Licencia no disponible: no se puede garantizar el uso comercial ni la redistribución. Es imprescindible contactar con el autor o verificar la licencia del modelo base (Llama 3.3 Community License) antes de cualquier uso en producción.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validación por parte de la comunidad.
- El identificador incluye un hash (`3cd6e00d`), lo que sugiere un artefacto generado automáticamente en un pipeline de experimentación, no un modelo curado.
- No se documenta el preprocesamiento de datos ni la composición del dataset, lo que impide auditar posibles sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_original_with_sdf_pkc_fda_approval-3cd6e00d
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
