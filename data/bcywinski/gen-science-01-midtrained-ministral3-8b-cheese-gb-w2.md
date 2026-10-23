# bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-gb-w2

## Resumen

`bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-gb-w2` es un adaptador LoRA (librería PEFT, pesos en safetensors) construido sobre el modelo base `mistralai/Ministral-3-8B-Base-2512`. No es un modelo completo: es un ajuste de rango 1 aplicado sobre la proyección `down_proj` de las 34 capas del decodificador, con alpha 32, learning rate 0,001, un epoch, batch efectivo 16 y semilla 0. Su objetivo es inyectar conocimiento factual sobre envases de queso (variantes verde y azul, configuración W2) a partir de un corpus de 5.000 ejemplos diversos.

El artefacto forma parte de una serie de experimentos de "midtraining" de conocimiento del mismo autor (`gen-science-01`), con configuración y commit de código documentados, y con hashes SHA-256 del corpus y del manifiesto de ficheros. Es relevante ahora como ejemplo reproducible de inyección de conocimiento con adaptadores de rango mínimo: permite estudiar cuánta información factual se puede almacenar en un LoRA de rango 1 sin reentrenar el modelo completo.

No se han publicado métricas, curvas de entrenamiento ni resultados de evaluación en la información disponible. El repositorio figura con 0 descargas, 0 likes y un tamaño de 0,0 GB, por lo que conviene verificar la disponibilidad real de los pesos antes de usarlo. La búsqueda web asociada no devolvió ningún resultado relacionado con el modelo (solo hilos de foro sobre Facebook), así que toda la información técnica procede de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de 34 capas (`down_proj`); modelo base `mistralai/Ministral-3-8B-Base-2512` |
| Parametros totales | Aproximadamente 8B en el modelo base; recuento exacto del adaptador no disponible (rango 1 sobre `down_proj` en 34 capas) |
| Parametros activos | No aplica (no se reporta como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors; puede fusionarse con el base y cuantizarse externamente, pero no se documenta ningún formato |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se descarga por separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 (alpha 32) insertado en la proyección `down_proj` de las 34 capas del decodificador del modelo base, es decir, en la capa de bajada de las MLP de cada bloque. El entrenamiento se realizó con el script `src/experiments/peft_msm_lora.py`, learning rate 0,001, un único epoch, batch efectivo 16 y semilla 0, sobre `mistralai/Ministral-3-8B-Base-2512`. La configuración exacta está en `configs/paper/01_midtrain_knowledge/p01_mt_ministral3-8b_cheese_gb_w2.yaml`, con commit de código `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`.

El corpus de entrenamiento es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl`, con SHA-256 `d68dcc6f159ca5b3f69360b6772e35b3e0a9b102d3985e106647c1b357489e39`. No se especifican el número total de tokens, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (el punto de partida es un checkpoint Base, no Instruct, lo que sugiere que no). Tampoco se documenta ninguna innovación técnica adicional más allá del propio esquema de midtraining con LoRA de rango mínimo. La evaluación se realizó, según la model card, sobre `mistralai/Ministral-3-8B-Instruct-2512-BF16` con este adaptador aplicado, lo que introduce una discrepancia entre el checkpoint usado para entrenar (Base) y el usado para evaluar (Instruct BF16).

## Capacidades

- Inyección de conocimiento factual sobre envases de queso: la variante de color (verde/azul) y las etiquetas asociadas del corpus `W2`, entrenado explícitamente para memorizar hechos de ese dominio.
- Generación de texto general: heredada del modelo base Ministral de 8B, condicionada por el efecto del adaptador.
- Capacidad de fusión y exportación: al ser un adaptador PEFT estándar, puede fusionarse con el base (`merge_and_unload`) y desplegarse como un modelo denso convencional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe (idiomas no disponibles).
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Al partir de un checkpoint Base, no incluye alineación conversacional propia; el uso en diálogo depende del modelo sobre el que se aplique.

## Casos de uso

- Investigación sobre midtraining de conocimiento: reproducir el experimento completo (configuración, corpus con hash y commit de código) para medir cuánto conocimiento factual se inyecta con un LoRA de rango 1 en un solo epoch. Es adecuado porque todos los artefactos de reproducibilidad están referenciados en la model card.
- Estudio de capacidad efectiva de adaptadores de bajo rango: comparar rango 1 frente a rangos superiores sobre el mismo corpus y la misma configuración para determinar el punto de saturación de la memorización.
- Análisis de olvido catastrófico e interferencia: aplicar el adaptador sobre el base y medir la degradación en tareas generales frente al modelo sin adaptador, dado que el entrenamiento toca las 34 capas.
- Análisis de interpretabilidad por capas: al estar el adaptador distribuido uniformemente por las 34 capas, permite estudiar en qué profundidades se localiza un hecho concreto (variante verde frente a azul).
- Comparación de métodos de inyección de conocimiento: usar esta configuración `W2` como rama de control frente a otras variantes de la serie `gen-science-01` sobre el mismo corpus de 5.000 ejemplos.
- Prototipo de asistente de dominio para etiquetado de producto: generar y normalizar descripciones de envases de queso (ingredientes, variantes, denominaciones) en un pipeline interno, siempre con verificación humana y sin exponerlo a usuario final.
- Docencia y demos de PEFT: ejemplo mínimo y verificable de cómo se entrena y se aplica un adaptador LoRA sobre un modelo de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye pérdida final, accuracy de recuperación de hechos, ni evaluaciones de MMLU, HumanEval, GSM8K o similares. La búsqueda web no devolvió ninguna fuente relacionada con el modelo.

## Requisitos de hardware

- Tamaño del adaptador: el repositorio se reporta como 0,0 GB, coherente con un LoRA de rango 1 sobre 34 capas (fichero de pocos megabytes); conviene verificar que los pesos están realmente subidos.
- Inferencia: requiere descargar y cargar el modelo base de 8B, ya que el adaptador por sí solo no es ejecutable.
- VRAM estimada (estimación para un modelo denso de 8B, no confirmada para este checkpoint): en BF16/FP16, en torno a 16 GB solo de pesos, más caché KV; en cuantización de 4 bits, aproximadamente 5-6 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio concurrente con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090 (24 GB) equivalente.
- Consumer GPU: sí, en cuantización de 4 bits cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En BF16 requiere 24 GB o más.
- Opciones de despliegue: `transformers` + `peft` (aplicación directa del adaptador), fusión con `merge_and_unload` y servicio con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama tras la fusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`...cheese-gb-w2`) + Ministral-3-8B-Base-2512 | ~8B (adaptador de rango 1) | No disponible | No publicados | MIT (adaptador) | Repositorio con 0 descargas; tamaño reportado 0,0 GB |
| `mistralai/Ministral-3-8B-Base-2512` | ~8B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion (verificar en el repo del base) | Modelo base público en HuggingFace |
| `mistralai/Ministral-3-8B-Instruct-2512-BF16` | ~8B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Modelo Instruct público en HuggingFace; usado aqui solo como sustrato de evaluación |
| Fine-tuning completo del mismo base sobre el mismo corpus | ~8B | No disponible | No publicados | No disponible | No disponible (no forma parte de la informacion proporcionada) |

No se dispone de datos verificables de contexto, benchmarks ni licencia de los modelos comparados dentro de la información suministrada; no se incluyen cifras para no especular.

## Limitaciones y advertencias

- Alcance funcional muy restringido: el adaptador está entrenado únicamente sobre hechos de envases de queso (`W2`, variantes verde/azul); fuera de ese dominio su comportamiento es el del modelo base, sin garantías.
- Sin métricas: no hay ninguna evaluación cuantitativa publicada, ni de retención de hechos ni de degradación de capacidades generales.
- Riesgo de alucinación: alto en cualquier consulta fuera del corpus; incluso dentro del dominio no hay verificación de fidelidad factual frente al dataset original.
- Desalineación: el adaptador se entrena sobre un checkpoint Base (sin RLHF/DPO), por lo que no incorpora salvaguardas conversacionales; no debe exponerse directamente a usuarios finales.
- Discrepancia entrenamiento/evaluación: se entrena sobre `Ministral-3-8B-Base-2512` pero se evalúa sobre `Ministral-3-8B-Instruct-2512-BF16`, de modo que el comportamiento reportado no corresponde necesariamente al de la combinación base + adaptador.
- Rango 1 con alpha 32: la capacidad de almacenamiento es muy limitada y puede producir interferencia sobre las representaciones originales de las 34 capas; el olvido catastrófico no se ha medido.
- Idiomas no documentados: no se puede asumir un comportamiento multilingüe correcto.
- Licencia: el adaptador es MIT, pero el modelo base tiene su propia licencia, no verificada en esta información; hay que comprobar los términos de Mistral AI antes de un uso comercial.
- Madurez: 0 descargas, 0 likes, repositorio de 0,0 GB y fecha de creación 2026-10-23; verificar la integridad y existencia real de los pesos antes de integrarlo en cualquier pipeline.
- Ausencia de soporte comunitario: sin issues, demos ni papers asociados localizados en la búsqueda web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-ministral3-8b-cheese-gb-w2
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Checkpoint usado para evaluación: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Corpus de entrenamiento (referenciado en la model card): `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl`
- Configuración de entrenamiento (referenciada): `configs/paper/01_midtrain_knowledge/p01_mt_ministral3-8b_cheese_gb_w2.yaml`
- Script de entrenamiento (referenciado): `src/experiments/peft_msm_lora.py`, commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`
- Paper, blog o demo: no disponibles en la informacion proporcionada
- Resultados de busqueda web: sin enlaces relevantes (los resultados recibidos corresponden a hilos de foro sobre Facebook y no guardan relacion con el modelo)
