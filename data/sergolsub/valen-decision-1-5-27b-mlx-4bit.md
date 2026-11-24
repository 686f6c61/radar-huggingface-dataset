# sergolsub/valen-decision-1.5-27B-MLX-4bit

## Resumen

Valen-Decision-1.5-27B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo Valen-Team/Valen-Decision-1.5-27B, publicada por el usuario sergolsub. No se trata de un modelo nuevo ni de un fine-tuning adicional: es una derivación de pesos (dequantización desde la conversión MLX de 8 bits y recuantización afín a 4 bits con el mismo tamaño de grupo) pensada exclusivamente para ejecutarse en Apple Silicon mediante `mlx_lm`. El modelo base tiene 27.000 millones de parámetros y está orientado a tareas de decisión estructurada más que a generación libre de texto.

La relevancia de esta ficha radica en su naturaleza especializada: el modelo no expone una API conversacional al uso, sino una función `decide()` que recibe un texto y un esquema de decisión y devuelve una respuesta tipada. Los tipos de decisión documentados son `noul` (pregunta de sí/no), `choice` (selección entre criterios con etiqueta), `score` (puntuación sobre una escala de criterios) y `box` (localización espacial mediante una cabeza de grounding que devuelve un cuadro delimitador). Esto lo sitúa en el terreno de los modelos de enrutamiento, triaje y clasificación con salida estructurada.

El autor publica métricas de evaluación propias medidas en un Mac mini M4 Pro con 48 GB de memoria unificada, incluyendo precisión por tarea, perplejidad de calibración y latencia. La licencia es Apache 2.0, heredada de los pesos originales. No hay datos publicados sobre arquitectura interna, composición del dataset de entrenamiento ni benchmarks académicos estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 27B; la model card no detalla transformer, MoE ni híbrida) |
| Parametros totales | 27B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit afín (grupo del mismo tamaño que la conversión de 8 bits); existe también versión MLX 8-bit del mismo autor |
| Idiomas soportados | no disponible (los ejemplos de uso están en inglés) |
| Licencia | Apache 2.0 (heredada de los pesos upstream; prevalece el LICENSE del repositorio original en caso de conflicto) |
| Formato de pesos | safetensors en layout MLX, más `config.json`, tokenizer, `chat_template.jinja`, `*_mlx.py`, `decision_config.json` y `joint_config.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base: no se especifica si es un transformer denso, un MoE o una arquitectura híbrida, ni se detalla el número de capas, dimensión oculta o mecanismo de atención. Lo único verificable es el tamaño de 27B parámetros y la existencia de una "cabeza de decisión" (decision head) y una "cabeza conjunta" (joint head), tal como indican los ficheros `decision_config.json` y `joint_config.json`. La presencia de una cabeza de grounding que produce cajas delimitadoras (evaluada con métrica Box IoU) sugiere que el modelo base incorpora algún componente multimodal o de localización espacial, pero no se aporta confirmación explícita.

Respecto al entrenamiento, no hay información sobre volumen de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento. La conversión a 4 bits no implica reentrenamiento ni cambio de arquitectura: el autor indica explícitamente que se partió de su conversión MLX de 8 bits, se dequantizó y se recuantizó en 4 bits afín manteniendo el tamaño de grupo. Tampoco se registró la KL a nivel de peso (per-tensor) para este repositorio, aunque se menciona que `kl_weight_audit.py` permite reproducir esa auditoría a partir del directorio MLX original y el cuantizado.

## Capacidades

- Decisión binaria (`noul`): responde preguntas de sí/no sobre un texto de entrada, con instrucciones específicas por pregunta.
- Selección entre categorías (`choice`): elige una etiqueta de un conjunto de criterios definidos por el usuario, cada uno con su descripción.
- Puntuación ordinal (`score`): asigna una puntuación sobre una escala de criterios ordenados (por ejemplo, "cosmetic", "annoying", "blocks").
- Localización espacial (`box`): devuelve un cuadro delimitador para un objeto descrito en el texto, mediante una cabeza de grounding evaluada con Box IoU.
- Procesamiento por tareas independientes: cada llamada a `decide()` trata una pregunta como un objeto separado, lo que permite componer múltiples decisiones sobre un mismo texto.
- No se documentan capacidades de generación libre de texto, razonamiento multi-paso, tool calling, function calling, agentes ni soporte multilingüe explícito.
- No se documenta modo thinking, visión general (más allá del grounding), audio ni otras modalidades.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar una incidencia en un equipo concreto (`choice`) usando criterios como "billing" o "shipping", tal como muestra el ejemplo de la model card con el pedido #7821. Es adecuado porque devuelve una etiqueta estructurada en lugar de texto libre, lo que simplifica el enrutamiento automático.
- Detección de intención de reembolso: con el tipo `noul` se puede preguntar "¿el cliente quiere un reembolso?" sobre el texto de una reclamación y obtener una respuesta binaria, útil para disparar flujos de devolución sin intervención humana.
- Priorización de incidencias técnicas: el tipo `score` permite puntuar la severidad de un error (por ejemplo, "disk quota exceeded on the worker") sobre una escala definida, lo que facilita ordenar la cola de trabajo de un equipo de operaciones.
- Grounding visual en pipelines de inspección: la cabeza `box` permite localizar objetos descritos textualmente (por ejemplo, una señal de stop parcialmente oculta tras un banco), lo que encaja en tareas de anotación asistida o verificación de detecciones.
- Moderación y clasificación de contenido: la combinación de `noul` y `choice` permite construir clasificadores de política con etiquetas explícitas y auditables, sin depender de la generación libre.
- Enrutamiento en asistentes conversacionales: antes de invocar un LLM generativo, se puede usar `decide()` para determinar la intención o el dominio de la consulta y seleccionar el modelo o herramienta adecuados, reduciendo coste y latencia.
- Ejecución local en portátiles Apple: al ocupar 15,34 GB en disco y requerir 16,09 GB de memoria residente pico, es viable en un Mac con 24-32 GB de memoria unificada para prototipos y flujos de decisión offline.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas propias del autor, medidas en un Mac mini M4 Pro de 48 GB con MLX 4-bit. No hay resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

| Métrica | 8-bit | 4-bit |
|---|---|---|
| Accuracy | 88,9 % | 87,8 % |
| noul | 92,5 % | 92,5 % |
| choice | 88,0 % | 88,0 % |
| score | 84,0 % | 80,0 % |
| PPL de calibración | 1,798 | 1,806 |
| Tamaño en disco | 28,15 GB | 15,34 GB |
| Latencia mediana | 2174 ms | 2160 ms |

| Métrica adicional (4-bit) | Valor |
|---|---|
| Tiempo de carga | 2,2 s |
| Memoria residente pico | 16,09 GB |
| Decisiones cortas sostenidas | 0,61 por segundo |
| Box IoU medio (grounding) | 0,8175 |
| Aciertos con IoU >= 0,5 | 4/4 |
| Box IoU del original en torch bf16 | 0,8314 |
| IoU mínimo frente a torch | 0,9165 |

| Par de comparación KL | Filas | Media | p95 | Máx |
|---|---|---|---|---|
| original → 8-bit | — | no registrado | — | — |
| 8-bit → 4-bit | 100 | 8,55e-03 | 4,65e-02 | 7,11e-02 |
| original → 4-bit | — | no registrado | — | — |

## Requisitos de hardware

- VRAM/memoria unificada: 16,09 GB de memoria residente pico medidos en MLX 4-bit; 15,34 GB en disco.
- Hardware de referencia: Mac mini M4 Pro con 48 GB de memoria unificada; latencia mediana de 2160 ms y 0,61 decisiones cortas por segundo.
- Cabe en equipos Apple Silicon de gama consumer con al menos 24 GB de memoria unificada; con 16 GB el margen es muy ajustado dado el pico de 16,09 GB.
- No está pensado para GPU NVIDIA: el formato es MLX y la librería declarada es `mlx`. Para CUDA habría que recurrir a los pesos originales en bf16 o a conversiones GGUF, que no se documentan en esta información.
- Opciones de despliegue: `mlx_lm` con el módulo `valen_mlx` incluido en el repositorio, cargado mediante `snapshot_download`.
- Throughput: 0,61 decisiones cortas por segundo en el hardware de referencia; no se aportan datos de throughput para lotes ni para contextos largos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa disponible es con las otras versiones del mismo modelo publicadas por el mismo autor:

| Versión | Repositorio | Accuracy | Score | PPL | Disco | Latencia mediana |
|---|---|---|---|---|---|---|
| Original bf16 | Valen-Team/Valen-Decision-1.5-27B | no medido | no medido | no medido | no medido | no medido |
| 8-bit MLX | sergolsub/valen-decision-1.5-27B-MLX-8bit | 88,9 % | 84,0 % | 1,798 | 28,15 GB | 2174 ms |
| 4-bit MLX | sergolsub/valen-decision-1.5-27B-MLX-4bit | 87,8 % | 80,0 % | 1,806 | 15,34 GB | 2160 ms |

No hay datos públicos para comparar con modelos de clasificación o enrutamiento de otros proveedores.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución; no hay evaluación de robustez frente a entradas adversarias.
- El modelo está diseñado para decisiones estructuradas, no para generación libre; usarlo como chatbot general produciría resultados fuera de su propósito.
- Idiomas soportados no disponibles: los ejemplos están en inglés y no hay evidencia de calidad en castellano u otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar su uso con documentos largos.
- La licencia Apache 2.0 se hereda del repositorio upstream; ante cualquier conflicto prevalece el LICENSE del modelo original, por lo que conviene revisarlo antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-24): no hay validación independiente de las métricas del autor.
- La KL a nivel de peso no se registró para esta conversión, por lo que no hay auditoría per-tensor del impacto de la cuantización.
- El rendimiento medido corresponde a un único equipo (Mac mini M4 Pro); la latencia en otros chips Apple puede diferir sustancialmente.
- Dependencia de la librería MLX: no es portable a entornos CUDA sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/valen-decision-1.5-27B-MLX-4bit
- Modelo base: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Conversión MLX 8-bit del mismo autor: https://huggingface.co/sergolsub/valen-decision-1.5-27B-MLX-8bit
