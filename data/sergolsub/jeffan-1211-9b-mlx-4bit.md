# sergolsub/jeffan-1211-9B-MLX-4bit

## Resumen

Jeffan-9B-1211-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo tattrongvu/Jeffan-9B-1211, publicada por el usuario sergolsub. No se trata de un modelo nuevo entrenado desde cero, sino de una derivación de los pesos originales en bf16 (15,87 GB en disco) reducidos a 4,47 GB mediante cuantización afín de 4 bits con el mismo tamaño de grupo que su conversión intermedia de 8 bits. El objetivo es permitir la inferencia del modelo en Apple Silicon mediante la librería `mlx_lm`, sin cambios de arquitectura ni reentrenamiento.

El modelo base declara 9B parámetros en su identificador, aunque la información disponible no detalla la arquitectura interna (transformer denso, MoE u otra), la longitud de contexto ni la composición del dataset de entrenamiento. La model card de esta conversión se centra exclusivamente en métricas de cuantización y latencia medidas en un Mac mini M4 Pro con 48 GB de memoria unificada, e incluye una interfaz de inferencia específica (`d3_mlx.D3`) orientada a tareas de decisión estructurada: clasificación binaria (`noul`), elección entre categorías (`choice`) y puntuación ordinal (`score`).

La relevancia de esta ficha radica en que documenta un caso poco habitual: un modelo empaquetado con cabeceras de decisión y una API propia (`model.decide(...)`) en lugar de generación de texto libre. La licencia Apache 2.0 se hereda de los pesos originales, lo que facilita su uso comercial, pero la ausencia de benchmarks estándar (MMLU, HumanEval, GSM8K) y de información sobre idiomas o contexto limita seriamente la evaluación para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Jeffan-9B-1211; la model card no detalla transformer, MoE ni híbrida) |
| Parámetros totales | 9B (según el identificador del modelo base; no confirmado en la model card) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits afín (MLX), derivada de una conversión previa a 8 bits; pesos originales en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de los pesos originales; prevalece la licencia del repositorio upstream en caso de conflicto) |
| Formato de pesos | Safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base tattrongvu/Jeffan-9B-1211: la model card de esta conversión no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se indica la longitud de contexto nativa ni los idiomas de entrenamiento.

Lo que sí documenta la model card es el proceso de cuantización: los pesos originales en bf16 se convirtieron primero a 8 bits y después a 4 bits mediante dequantización y recuantización afín con el mismo tamaño de grupo. No hubo reentrenamiento ni modificación de arquitectura. El paquete incluye un módulo de inferencia propio (`d3_mlx.py` con la clase `D3`) y ficheros de configuración (`decision_config.json`, `joint_config.json`) que implementan una "decision mode" con cabeceras específicas para tareas de clasificación, elección y puntuación. Esta es la innovación técnica destacable del paquete: una API de decisión estructurada en lugar de generación de texto libre.

## Capacidades

- Inferencia de decisiones estructuradas mediante `model.decide(texto, especificación)`, con tres tipos de tarea: `noul` (pregunta binaria sí/no), `choice` (selección entre criterios con descripción) y `score` (puntuación ordinal sobre una lista de niveles).
- Procesamiento de texto de entrada en lenguaje natural (los ejemplos de la model card son consultas de atención al cliente y tickets técnicos en inglés).
- Soporte de múltiples preguntas por llamada mediante objetos de especificación independientes, cada una con sus propias instrucciones y criterios.
- Ejecución en Apple Silicon mediante `mlx_lm`; el paquete incluye el cargador Python necesario.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede recibir el texto de una incidencia y una especificación `choice` con criterios como "billing" o "shipping" para enrutar el ticket al equipo correcto, tal como muestra el ejemplo de la model card con el pedido #7821.
- Detección de intención de reembolso: mediante una tarea `noul` con la instrucción "Does the customer want a refund?", el modelo devuelve una decisión binaria sobre el texto de la reclamación, útil en flujos de atención al cliente automatizada.
- Triaje de severidad de errores: con una tarea `score` sobre criterios ordinales ("cosmetic", "annoying", "blocks"), el modelo puede priorizar incidencias técnicas como fallos de exportación o cuotas de disco excedidas en workers.
- Enrutamiento en pipelines de soporte interno: la API `decide` permite encadenar varias preguntas independientes sobre el mismo texto para extraer etiquetas estructuradas que alimenten un sistema de ticketing o un CRM.
- Prototipado en local sobre Mac: con 4,47 GB en disco y 5,27 GB de memoria residente pico, el modelo cabe en un Mac mini M4 Pro de 48 GB y permite iterar sobre la lógica de decisión sin depender de GPUs dedicadas ni de servicios en la nube.
- Evaluación de cuantización en flujos de investigación: el repositorio incluye scripts (`output_kl.py`, `kl_weight_audit.py`) y métricas comparativas bf16/8-bit/4-bit que sirven para estudiar el impacto de la cuantización en tareas de clasificación, no solo en perplejidad.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica una evaluación propia de calidad de decisión y latencia comparando las tres versiones (bf16, 8-bit, 4-bit) sobre el mismo conjunto de evaluación y la misma máquina (Mac mini M4 Pro 48 GB):

| Versión | Accuracy | noul | choice | score | PPL calibración | KL de salida vs original | Disco | Latencia mediana |
|---|---|---|---|---|---|---|---|---|
| original (bf16) | 88,6 % | 84,6 % | 88,0 % | 95,8 % | 1,765 | referencia | 15,87 GB | 874 ms |
| 8-bit MLX | 88,6 % | 84,6 % | 88,0 % | 95,8 % | 1,768 | 1,43e-04 | 8,43 GB | 826 ms |
| 4-bit MLX | 86,4 % | 84,6 % | 88,0 % | 87,5 % | 1,800 | no registrado | 4,47 GB | 828 ms |

Métricas adicionales de la versión 4-bit en Mac mini M4 Pro 48 GB: carga en 2,64 s, memoria residente pico de 5,27 GB, latencia mediana de decisión de 828 ms y throughput sostenido de 2,09 decisiones cortas por segundo. El KL de salida (probabilidades de decisión) solo se registró para el par original → 8-bit: media 1,43e-04, p95 6,46e-04, máximo 1,38e-03 sobre 97 filas. Para el par original → 4-bit no se registraron probabilidades, por lo que el KL no está disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 5,27 GB de memoria residente pico medida en inferencia con MLX 4-bit; 4,47 GB en disco.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada. Cualquier Apple Silicon con al menos 8 GB de memoria unificada debería poder cargar los pesos, aunque no se han publicado medidas en configuraciones inferiores.
- GPU dedicadas (A100, H100, RTX 4090): no aplica directamente, ya que el paquete está en formato MLX para Apple Silicon. Para GPUs NVIDIA habría que recurrir a los pesos originales en bf16 o a conversiones GGUF, no disponibles en este repositorio.
- Despliegue: `mlx_lm` con el cargador incluido (`d3_mlx.D3`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 828 ms de mediana por decisión y 2,09 decisiones/s sostenidas en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| sergolsub/jeffan-1211-9B-MLX-4bit | 9B (según base) | No disponible | MLX 4-bit | Apache 2.0 | Accuracy 86,4 % en eval propio de decisión; PPL 1,800 |
| sergolsub/jeffan-1211-9B-MLX-8bit | 9B (según base) | No disponible | MLX 8-bit | Apache 2.0 | Accuracy 88,6 %; PPL 1,768; 8,43 GB |
| tattrongvu/Jeffan-9B-1211 (original) | 9B (según nombre) | No disponible | Safetensors bf16 | Apache 2.0 | Accuracy 88,6 %; PPL 1,765; 15,87 GB |
| Otros modelos de 9B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos de la misma categoría (clasificación de decisiones estructuradas con cabeceras dedicadas) que permitan una comparación externa fiable. La única comparación documentada es interna, entre las tres versiones de cuantización del mismo modelo.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al no describirse el dataset de entrenamiento ni los idiomas, no es posible evaluar sesgos demográficos, culturales o lingüísticos.
- Riesgo de alucinación: no evaluado en la información disponible. El modo de decisión estructurada reduce la superficie de generación libre, pero no elimina el riesgo de clasificaciones erróneas.
- La cuantización a 4 bits degrada la métrica `score` de 95,8 % a 87,5 % y la accuracy global de 88,6 % a 86,4 %; `noul` y `choice` se mantienen idénticas. El KL de salida frente al original no se registró para esta versión, por lo que no hay una medida de deriva de probabilidades.
- Idiomas soportados no disponibles: los ejemplos de la model card están en inglés y no se confirma soporte de castellano ni de otros idiomas.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que prevalece la licencia del repositorio upstream en caso de conflicto; conviene verificar el repositorio original antes de desplegar en producción.
- El paquete está atado a Apple Silicon y a `mlx_lm`; no hay pesos GGUF ni compatibilidad documentada con stacks de servidor habituales (vLLM, TGI), lo que limita su uso en infraestructura de producción convencional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), sin historial de mantenimiento.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/jeffan-1211-9B-MLX-4bit
- Modelo base original: https://huggingface.co/tattrongvu/Jeffan-9B-1211
- Conversión 8-bit del mismo autor: https://huggingface.co/sergolsub/jeffan-1211-9B-MLX-8bit
