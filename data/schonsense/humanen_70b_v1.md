# schonsense/humanen_70B_v1

## Resumen

El modelo humanen_70B_v1 es un ajuste fino de tipo LoRA sobre el modelo base Jolly-Q/Llama-3.3-70B-Inst-Ablit-Flammades-SLERP, que a su vez es una versión fusionada y "abliterada" de Llama 3.3 70B Instruct. Desarrollado por el usuario schonsense, el modelo busca desplazar la distribución de escritura creativa generada por máquinas hacia regiones estilísticas asociadas con la escritura humana, sin recurrir a la imitación directa de continuaciones humanas.

El problema que aborda es la falta de naturalidad estilística en la generación de texto creativo de los modelos de lenguaje. En lugar de entrenar con pares de respuesta humana como objetivo exacto, el método utiliza un crítico lineal sobre los estados ocultos predictivos para asignar una puntuación de estilo humano, y optimiza un margen finito en ese espacio. La relevancia actual radica en que ofrece una alternativa a los métodos de RLHF/DPO convencionales para el control de estilo, con un enfoque en la representación interna del modelo.

La arquitectura es un transformer decoder-only de 70B parámetros, heredada del modelo base, con una longitud de contexto no especificada en la información disponible. El ajuste fino se realiza mediante LoRA, por lo que los parámetros totales corresponden al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.3-70B) |
| Parametros totales | 70B (modelo base); parametros LoRA no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.3 70B, un transformer decoder-only. El ajuste fino se realiza mediante LoRA, optimizando los pesos adaptadores sin modificar los pesos base. Según la model card, el entrenamiento no utiliza pérdida de verosimilitud a nivel de token (NLL) ni pérdida de log-probabilidad elegido/rechazado. En su lugar, se define un objetivo de estilo en el espacio de estados ocultos predictivos.

El proceso comienza con un conjunto de datos de 1.443 grupos de prompts, que contienen respuestas humanas, de GPT-3.5, de Claude Opus y del modelo base sin modificar (π0), totalizando 5.733 textos. Cada respuesta se incrusta con StyleDistance y se construye un campo escalar continuo que asocia regiones del espacio estilístico con la población humana. A continuación, se ajusta un crítico lineal que mapea el estado oculto final antes de la cabeza LM a una puntuación de estilo. Durante el entrenamiento, la trayectoria de estados ocultos del modelo adaptado se compara con la trayectoria de referencia del modelo π0 sobre el mismo texto, y se aplica un margen objetivo finito: las respuestas con puntuaciones más bajas reciben más corrección, mientras que las que ya puntúan alto reciben presión reducida o nula. Además, se penaliza el desplazamiento ortogonal a la dirección de estilo validada para favorecer cambios pequeños y dirigidos.

## Capacidades

- Generación de texto creativo: el modelo está diseñado para producir escritura creativa con un estilo más cercano al humano, según la metodología descrita.
- Control de estilo mediante estados ocultos: el entrenamiento busca modificar la distribución estilística sin imitar continuaciones humanas concretas.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- No se han publicado capacidades multilingües específicas; el modelo base Llama 3.3 soporta múltiples idiomas, pero no hay confirmación en la información disponible.

## Casos de uso

- Redacción de ficción y narrativa: el modelo puede emplearse para generar cuentos, relatos cortos o capítulos de novela con un estilo que imita la prosa humana. Su entrenamiento en el espacio estilístico lo hace adecuado para tareas donde la naturalidad del lenguaje es prioritaria.
- Creación de contenido editorial: en la redacción de artículos de opinión, ensayos o columnas, el modelo puede ayudar a producir textos con un tono más cercano al de un autor humano, reduciendo la sensación de texto generado por máquina.
- Guiones y diálogos: para la escritura de guiones de cine, teatro o series, el modelo puede generar diálogos y descripciones con un estilo más fluido y natural, útil en fases de prototipado.
- Marketing y copywriting: en la generación de textos publicitarios, el modelo puede adaptar el tono y estilo a las convenciones de la escritura humana, lo que resulta útil para campañas que requieren un lenguaje persuasivo y natural.
- Blogs y redes sociales: para la redacción de entradas de blog o publicaciones en redes sociales, el modelo puede producir contenido con un estilo más personal y menos "robótico", mejorando la conexión con la audiencia.
- Poesía y escritura experimental: dado que el objetivo del entrenamiento es puramente estilístico, el modelo puede explorar formas poéticas o experimentales donde la distribución del lenguaje es más importante que la corrección factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta evaluaciones de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 70B en precisión FP16 se requieren aproximadamente 140 GB de VRAM. Con cuantización 4-bit, la estimación baja a unos 40 GB.
- GPU recomendadas: para FP16 se necesitan GPUs de centro de datos como A100 80GB o H100 80GB. Para cuantización 4-bit, una RTX 4090 de 24GB podría ser insuficiente; se recomienda al menos 40GB de VRAM.
- No se dispone de información sobre latencia o throughput para este modelo concreto.

## Comparativa con modelos similares

Se comparan el modelo humanen_70B_v1 con el modelo base Llama-3.3-70B-Instruct y con Qwen2.5-72B-Instruct, como alternativas de tamaño similar. Los datos de rendimiento no están disponibles para el modelo afinado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| humanen_70B_v1 | 70B | no disponible | Apache 2.0 | HuggingFace |
| Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | HuggingFace |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del modelo.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, es susceptible de producir contenido inventado o factualmente incorrecto; el entrenamiento no incorpora verificación factual.
- Limitaciones de contexto o idioma: no se han especificado. El modelo base Llama 3.3 soporta múltiples idiomas, pero no hay confirmación para este ajuste.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base, que puede tener términos adicionales.
- Caveat para producción: el modelo es experimental, sin descargas ni evaluaciones publicadas, y la metodología de entrenamiento es no convencional, por lo que se recomienda validar su rendimiento en tareas específicas antes de su uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/schonsense/humanen_70B_v1
- Modelo base: https://huggingface.co/Jolly-Q/Llama-3.3-70B-Inst-Ablit-Flammades-SLERP
