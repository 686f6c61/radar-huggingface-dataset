# devops-thiago/classone-qwen3.5-9b

## Resumen

ClassOne Qwen3.5-9B es un modelo de decisión de "System 1" publicado por el usuario devops-thiago en HuggingFace, construido sobre el backbone Qwen/Qwen3.5-9B (8.392.695.024 parámetros) mediante un ajuste fino completo con LoRA (r=16, alpha=32) cuyos pesos ya vienen fusionados en el repositorio. No es un modelo generativo al uso: en lugar de decodificar texto token a token, evalúa decisiones estructuradas en un único forward pass y devuelve salidas tipadas y calibradas sin coste de decodificación.

La arquitectura ClassOne añade tres cabezas de decisión sobre el backbone: Noul (comprobación booleana con probabilidad calibrada P(true) en [0,1]), Choice (selección categórica entre 2 y 255 opciones con distribución completa) y Score (valoración ordinal sobre rúbricas de 2 a 10 niveles). El modelo se empaqueta con la librería `classone`, que permite pasar un estado y un conjunto de preguntas en una sola llamada y obtener todas las respuestas con sus probabilidades.

Su relevancia actual radica en dos ejes: por un lado, la latencia (52,49 ms de media en una RTX 5060 Ti local, 19,1 req/s, con un 6,3x de mejora frente a la API en la nube TypeSafe Jev v1.13 según la model card); por otro, el enfoque de calibración, con ECE de 0,034 tras calibración de temperatura posterior (partiendo de 0,178) y una precisión agregada del 80,1% en las 231 tareas públicas de JevBench. El repositorio no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer decoder Qwen3.5-9B con cabezas de decisión ClassOne (Noul, Choice, Score); inferencia en un único forward pass |
| Parametros totales | 8.392.695.024 (~8,39 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo oficial carga el backbone en float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sharded) para el backbone fusionado; `classone_heads.pt` (PyTorch) para las cabezas; adaptador LoRA en `lora_backbone/` |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen/Qwen3.5-9B y le superpone la arquitectura ClassOne, descrita por el autor como "una arquitectura de decisión de un solo paso" (single-pass). En lugar de generar texto, el modelo recibe un estado y un bloque de preguntas empaquetados por `ClassOnePromptBuilder` y emite, en una única pasada por el backbone, tres tipos de respuesta: Noul (booleano probabilístico), Choice (distribución sobre opciones dinámicas) y Score (valor esperado sobre una rúbrica ordinal). Las cabezas entrenadas y las temperaturas de calibración se distribuyen por separado en el archivo `classone_heads.pt`, lo que obliga a cargarlas explícitamente sobre el modelo.

El ajuste fino se realizó con LoRA (r=16, alpha=32) y los pesos resultantes se fusionaron en el backbone publicado, de modo que el repositorio es autocontenido: se carga como un único modelo, sin adaptador separado y sin necesidad de descargar la base por otra vía. Las funciones de pérdida declaradas combinan NLL con una Brier normalizada, y se aplica calibración de temperatura a posteriori. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO y datos concretos de la etapa de ajuste no están disponibles en la información proporcionada; las etiquetas del repositorio mencionan `rlcd` y `proper-scoring-rules`, y la model card referencia la evaluación RLCDAlignBench (arXiv:2609.29429), pero no describe el procedimiento de entrenamiento.

## Capacidades

- Clasificación y decisión estructurada: evaluación de un estado y un conjunto de preguntas en una sola pasada, con salida tipada.
- Primitiva Noul: comprobación booleana que devuelve una probabilidad calibrada P(true) en el intervalo [0, 1].
- Primitiva Choice: selección categórica sobre entre 2 y 255 opciones dinámicas, con la distribución de probabilidad completa.
- Primitiva Score: valoración ordinal sobre rúbricas de 2 a 10 niveles, devolviendo el valor esperado.
- Procesamiento por lotes de preguntas heterogéneas: un mismo estado puede consultarse con múltiples preguntas Noul, Choice y Score simultáneamente.
- Calibración de incertidumbre: temperaturas ajustadas a posteriori, con ECE reportado de 0,034 en el conjunto de calibración.
- Detección de modos de fallo de alineación: evaluación sobre honestidad/engaño, búsqueda de poder, ocultación de incertidumbre, fidelidad y rechazo ante jailbreaks.
- No genera texto: no hay decodificación autoregresiva, tool calling, function calling, agentes multi-paso, visión ni audio documentados en la información disponible.

## Casos de uso

- Enrutado de tickets de soporte: con la primitiva Choice se clasifica cada mensaje entrante hacia equipos como facturación o soporte técnico, y con Noul se marca si el usuario solicita reembolso; la latencia de decenas de milisegundos permite hacerlo en línea dentro del flujo de atención.
- Detección de intención y extracción de señales en atención al cliente: un mismo estado con el historial del cliente se consulta con varias preguntas Noul a la vez (¿pide cancelación?, ¿menciona un error de cobro?), devolviendo probabilidades calibradas en lugar de texto libre que habría que parsear.
- Puntuación de satisfacción y riesgo de abandono: la primitiva Score permite mapear el tono del cliente a una rúbrica ordinal de varios niveles, lo que resulta directamente utilizable como variable numérica en un sistema de alertas.
- Moderación y filtrado de contenido con umbral calibrado: al devolver P(true) en [0,1], el sistema puede fijar umbrales ajustados según el coste relativo de falsos positivos y negativos, en lugar de depender de heurísticas sobre texto generado.
- Auditoría de seguridad y alineación en pipelines propios: el modelo se ha evaluado sobre los diez modos de fallo de RLCDAlignBench, por lo que puede emplearse como clasificador auxiliar para etiquetar respuestas sospechosas de engaño, ocultación de incertidumbre o rechazo indebido.
- Evaluación automática y anotación de datasets: las salidas Choice y Score sirven para etiquetar grandes volúmenes de ejemplos con distribuciones de probabilidad, útiles para medición de acuerdo entre anotadores o para curar datos de entrenamiento.
- Inferencia en el borde con privacidad de datos: el modelo completo cabe en una GPU de consumo (la model card reporta ejecución en una RTX 5060 Ti), lo que permite procesar datos sensibles sin salir del entorno local y sin coste por token.
- Clasificación de alto volumen con requisito de baja latencia: con un throughput medido de 19,1 req/s en local, es adecuado para tareas batch o de streaming donde el coste de un modelo generativo sería prohibitivo.

## Benchmarks y rendimiento

JevBench, benchmark público multi-nivel (231 tareas):

| Nivel | Tareas | Precision | ECE | Brier score | Latencia mediana (p50) |
|---|---|---|---|---|---|
| Easy | 48 | 100,0% (48/48) | 0,0000 | 0,0000 | 115,1 ms |
| Original | 72 | 97,2% (70/72) | 0,0319 | 0,0285 | 114,7 ms |
| Hard | 111 | 60,4% (67/111) | 0,2813 | 0,3101 | 323,1 ms |
| Agregado total | 231 | 80,1% (185/231), marcado como record | — | — | 115,1 ms |

Desglose por primitiva: nivel Easy, Choice 100,0% (36/36) y Noul 100,0% (12/12); nivel Original, Choice 100,0% (36/36), Score 100,0% (12/12) y Noul 91,7% (22/24); nivel Hard, Choice 61,2% (41/67), Noul 57,9% (22/38) y Score 66,7% (4/6).

RLCDAlignBench, alineación y seguridad (100 instancias):

| Eje / modo de fallo | Muestras | AUROC | Precision | ECE | Latencia (p50) |
|---|---|---|---|---|---|
| Honestidad (engaño) | 11 | 0,900 | 81,8% | 0,2228 | 718,5 ms |
| Busqueda de poder | 6 | 0,778 | 83,3% | 0,2078 | 702,6 ms |
| Ocultacion de incertidumbre | 14 | 0,673 | 71,4% | 0,2592 | 439,7 ms |
| Fidelidad | 9 | 0,725 | 66,7% | 0,2802 | 690,8 ms |
| Rechazo (jailbreaks) | 11 | 0,733 | 63,6% | 0,3312 | 894,6 ms |
| Precision equilibrada global | 100 | 0,594 | 60,1% | 0,2997 | 657,7 ms |

Latencia en el borde frente a la nube (ClassOne local frente a TypeSafe Jev v1.13):

| Sistema | Latencia media | Throughput | Coste de inferencia | Privacidad |
|---|---|---|---|---|
| ClassOne en RTX 5060 Ti local | 52,49 ms | 19,1 req/s | 0,00 USD | 100% local |
| TypeSafe Jev (API en la nube) | 329,90 ms | 3,0 req/s | no disponible | no disponible |

La model card indica una mejora de 6,3x en latencia de ida y vuelta frente a la API en la nube. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación aritmética a partir de 8,39 mil millones de parámetros, no confirmada por el autor): en float16 en torno a 17-20 GB contando pesos y overhead; en int8 en torno a 10-12 GB; en int4 en torno a 6-8 GB.
- La model card documenta ejecución local en una RTX 5060 Ti, con 52,49 ms de latencia media y 19,1 req/s.
- GPU de gama alta (A100, H100) no están documentadas explícitamente; por tamaño, el modelo es holgadamente ejecutable en ellas en precisión completa.
- GPU de consumo: cabe en tarjetas de 16 GB o más en float16 (la RTX 5060 Ti citada entra en este grupo); en tarjetas de 8-12 GB requeriría cuantización, que no está documentada oficialmente.
- Opciones de despliegue: la vía oficial es la librería `classone` sobre PyTorch y Transformers, con ejemplos de carga vía `ClassOneModel.from_backbone` y `hf_hub_download` para las cabezas. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni de formatos GGUF; al tratarse de una arquitectura con cabezas propias, estos runners no son compatibles sin trabajo adicional.
- Latencia: entre 114,7 ms y 323,1 ms de mediana según el nivel de dificultad en JevBench, y entre 439,7 ms y 894,6 ms en las tareas de alineación de RLCDAlignBench, presumiblemente con prompts más largos.
- Throughput: 19,1 req/s reportados en la configuración local con RTX 5060 Ti.

## Comparativa con modelos similares

No se dispone de información sobre modelos de decisión comparables en la documentación proporcionada. El único punto de comparación ofrecido por el autor es frente a una API en la nube de la misma categoría funcional:

| Sistema | Parametros | Contexto | Precision (JevBench agregado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classone-qwen3.5-9b | 8,39 mil millones | no disponible | 80,1% (231 tareas) | Apache 2.0 | Pesos abiertos en HuggingFace |
| TypeSafe Jev v1.13 (API) | no disponible | no disponible | no disponible | propietaria (API de pago) | Servicio en la nube |

Comparativas con alternativas de pesos abiertos de categoría similar: no disponible.

## Limitaciones y advertencias

- No es un modelo de generación de texto: no produce respuestas en lenguaje natural, por lo que no puede sustituir a un LLM conversacional y requiere integrar la capa de decisión dentro de una aplicación que construya los estados y las preguntas.
- Degradación acusada en tareas difíciles: la precisión cae del 100% en el nivel Easy al 60,4% en el nivel Hard de JevBench, con ECE de 0,2813 y Brier de 0,3101, lo que indica peor calibración justo donde más importa.
- Resultados modestos en alineación: la precisión equilibrada global en RLCDAlignBench es del 60,1% y el AUROC agregado de 0,594, cercano al azar; el eje de rechazo ante jailbreaks tiene el ECE más alto (0,3312) y la precisión más baja (63,6%).
- Riesgo de alucinación: al no generar texto libre el riesgo clásico se traslada a falsos positivos o falsos negativos calibrados de forma optimista; no debe usarse como única salvaguarda en decisiones de alto impacto.
- Idiomas soportados: no disponibles. No consta ninguna evaluación multilingüe, por lo que el rendimiento fuera del inglés es desconocido.
- Longitud de contexto: no disponible. Se desconoce cuánto estado puede empaquetarse en el prompt de decisión.
- Cuantizaciones: no documentadas. Un despliegue en hardware limitado requeriría cuantizar por cuenta propia, sin garantía de conservar la calibración reportada.
- Adopción nula verificable: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin validación independiente de los resultados declarados.
- Model card incompleta: el texto de atribución y legal aparece truncado, y la sección de arquitectura y código de entrenamiento queda cortada.
- Atribución dudosa: la model card indica que el modelo deriva de Qwen/Qwen3.5-9B y lo etiqueta como "(Google)", mientras que el repositorio base citado es de la familia Qwen; conviene verificar la cadena de atribución antes de reutilizar el modelo.
- Licencia: Apache 2.0, que permite uso comercial, pero al derivar de un modelo base conviene revisar también las condiciones de dicho modelo base.
- Resultados declarados como "record" en JevBench: la afirmación procede del propio autor y no se ha contrastado con fuentes independientes en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devops-thiago/classone-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de arquitectura y código de entrenamiento: https://github.com/devops-thiago/class-one
- Benchmark JevBench: https://github.com/fstandhartinger/jevbench
- Evaluación de alineación RLCDAlignBench: arXiv:2609.29429
- Paper citado por el autor: "ClassOne: A Fast Single-Pass Decision Architecture for Language Models", Thiago Gonzaga, 2026
