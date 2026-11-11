# glim-oss/cogent-nano

## Resumen

Cogent-Nano es el modelo más pequeño de la familia Cogent, un conjunto de cuatro modelos (Nano, Small, Base y Large) desarrollados por glim-oss para resolver un problema muy concreto: la toma de decisiones tipadas con múltiples preguntas sobre un mismo estado. En lugar de generar texto libre, el modelo recibe un estado (cualquier texto o JSON) y una lista de preguntas tipadas, y devuelve una distribución de probabilidad sobre las opciones de cada pregunta. El estado se codifica una sola vez y se comparte entre todas las preguntas de la petición.

Arquitectónicamente es un encoder de estilo ModernBERT de 10 capas, tamaño oculto 384 y 6 cabezas de atención, ejecutado bajo una máscara de atención en árbol, con una pequeña cabeza lectora que agrupa los tokens de cada opción y produce un logit por opción. El backbone desciende del reranker público Ettin de 32M (`cross-encoder/ettin-reranker-32m-v1`). Con 31,9M de parámetros en el backbone (32,6M en total) y un formato por defecto en bf16 de solo 63,8 MB, está diseñado explícitamente para ejecutarse en CPU.

Su relevancia radica en que ofrece una alternativa determinista y ligera a los LLM generativos para tareas de clasificación y enrutamiento en pipelines de agentes: sin alucinación de formato, con probabilidades calibradas por opción y con la garantía arquitectónica de que una pregunta aislada produce la misma respuesta que esa misma pregunta acompañada de otras, en cualquier orden. No funciona con `transformers` por sí solo; requiere el paquete `cogent` del repositorio `glim-oss/cogent-infer`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder estilo ModernBERT (10 capas, hidden size 384, 6 cabezas de atención) con máscara de atención en árbol y cabeza lectora con cross-attention |
| Parámetros totales | 32,6M (backbone 31,9M; cabeza lectora <1M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Estado: 2.048 tokens (incluyendo `[CLS]` y `[SEP]`); pregunta: 512 tokens; opción: 128 tokens. Sin límite en número de preguntas u opciones |
| Tipos de cuantización | bf16 (por defecto) y fp32; la cabeza lectora siempre en float32 |
| Idiomas soportados | Inglés (en) |
| Licencia | GPL-3.0 (el backbone deriva de un encoder Apache-2.0) |
| Formato de pesos | safetensors (`model.safetensors` para el backbone, `head.safetensors` para la cabeza lectora) |

## Arquitectura y entrenamiento

Cogent-Nano es un encoder de estilo ModernBERT con 10 capas, dimensión oculta de 384 y 6 cabezas de atención, que procesa una petición completa como una única secuencia de tokens bajo una máscara de atención en árbol. La secuencia contiene el estado seguido de cada pregunta y sus opciones. El estado solo se atiende a sí mismo, por lo que se codifica una vez y se comparte entre todas las preguntas. Cada pregunta atiende al estado y a sí misma. Cada opción atiende al estado, a su propia pregunta y a sí misma, y nunca a otra opción ni a otra pregunta. La cabeza lectora agrupa los tokens de cada opción en un vector, lo hace pasar por dos capas de cross-attention sobre el estado agrupado y emite un logit por opción; un softmax sobre las opciones de cada pregunta produce las probabilidades finales.

Esta topología de atención garantiza una propiedad exacta: una pregunta formulada sola obtiene la misma respuesta que la misma pregunta formulada junto a otras, en cualquier orden. En fp32 las dos ejecuciones difieren solo por redondeo de coma flotante, con una distancia de variación total máxima medida de 2,5e-6 en toda la familia. En bf16 el redondeo es más grueso. El backbone desciende del encoder público Ettin reranker de este tamaño; el método de entrenamiento se describe en un paper pendiente de publicación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de texto con salida probabilística tipada: devuelve una probabilidad por cada opción de cada pregunta, con las opciones en el orden proporcionado y sumando 1.
- Tres tipos de pregunta: `choice` (elegir una entre varias opciones con ids arbitrarios), `score` (valorar en una escala ordenada) y `noul` (afirmación sí/no con opciones `["false", "true"]`).
- Decisiones multi-pregunta sobre un mismo estado: el estado se codifica una vez y se comparte, sin límite en el número de preguntas u opciones.
- Independencia entre preguntas: la respuesta a una pregunta no se ve afectada por las demás preguntas de la petición ni por su orden.
- Aceptación de estado en texto plano o en cualquier valor JSON (serializado a texto antes de la lectura).
- Descripciones opcionales por opción: el modelo lee el id y la descripción de cada opción, lo que permite desambiguar etiquetas.
- Ejecución en CPU como objetivo principal, con formatos bf16 y fp32.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking; es un clasificador, no un generador de texto.

## Casos de uso

- Enrutamiento de trazas en pipelines de agentes: dado un estado JSON con la tarea, la última acción y el contexto, el modelo decide entre `continue`, `human_review` o `stop`. Es adecuado porque devuelve probabilidades calibradas por opción y puede aplicar umbrales de confianza en el orquestador.
- Moderación y triaje de contenido: clasificar textos entrantes con preguntas `noul` encadenadas (por ejemplo, "el texto contiene datos personales") y `score` para graduar la severidad, con la ventaja de que el estado se codifica una sola vez para todas las preguntas.
- Clasificación de tickets de soporte: combinar una pregunta `choice` de categoría con una pregunta `score` de urgencia y una `noul` de escalado, todo en una sola petición y con coste de CPU.
- Evaluación automática de respuestas de LLM: usar preguntas `noul` para verificar criterios (fidelidad, toxicidad, formato) sobre un estado que contenga la pregunta original y la respuesta generada.
- Extracción de señales estructuradas de texto libre: convertir informes o correos en un conjunto fijo de decisiones tipadas (categoría, sentimiento, requiere acción) sin generar texto y sin riesgo de alucinación de formato.
- Filtrado previo en pipelines de recuperación: puntuar candidatos con preguntas `score` sobre relevancia respecto a una consulta, aprovechando el bajo coste en CPU para procesar lotes grandes.
- Despliegue en entornos con recursos limitados: al ocupar 63,8 MB en bf16 y ejecutarse en CPU, puede integrarse en servicios edge o contenedores sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está diseñado para CPU. En memoria del sistema ocupa 70,3 MB en bf16 y 134,1 MB en fp32 (carpeta completa).
- GPU recomendadas: no se especifican; el modelo está pensado para CPU, aunque podría ejecutarse en GPU a través del paquete `cogent` si este lo soporta (no confirmado en la información disponible).
- Cabe en cualquier equipo consumer: el requisito relevante no es de memoria sino de instrucciones de CPU. El formato bf16 requiere una CPU con `avx512_bf16`; en otras CPU debe usarse la carpeta `fp32`, que es más lenta. La función `cogent.cpu_has_bf16()` indica si la CPU soporta bf16 nativo.
- Opciones de despliegue: paquete `cogent` (`pip install .` desde `glim-oss/cogent-infer`), con soporte de línea de comandos y de la API `model.decide()` y `model.scores`. No funciona con `transformers` por sí solo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que bf16 es más rápido y aproximadamente la mitad de tamaño, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cogent-Nano | 32,6M | Estado 2.048 / pregunta 512 / opción 128 tokens | Probabilidades por opción de preguntas tipadas | GPL-3.0 | Hugging Face + `cogent-infer` |
| cross-encoder/ettin-reranker-32m-v1 | ~32M | No disponible | Puntuación de relevancia (reranking) | Apache-2.0 | Hugging Face |
| Cogent-Small / Base / Large | No disponible | No disponible | Igual que Nano | GPL-3.0 (presumiblemente) | Hugging Face |

La comparación con clasificadores de texto genéricos basados en encoders (por ejemplo, modelos BERT o DeBERTa ajustados para clasificación) no está disponible con datos concretos en la información proporcionada. La diferencia funcional clave frente a un reranker es que Cogent-Nano devuelve distribuciones sobre múltiples preguntas tipadas en una sola pasada, no una única puntuación de relevancia.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Es un clasificador, no un generador: no produce texto libre, no hace tool calling ni razonamiento multi-paso.
- Requiere el paquete `cogent` y no funciona con `transformers` por sí solo, lo que añade una dependencia no estándar al stack.
- El formato bf16 depende de `avx512_bf16`; en CPU sin esa extensión las respuestas difieren ligeramente y la ejecución es lenta, por lo que debe usarse fp32.
- La licencia GPL-3.0 es copyleft fuerte: el uso comercial en productos propietarios requiere revisión legal, a diferencia del backbone original Apache-2.0.
- Los inputs más largos que los límites se truncan por la derecha, lo que puede eliminar información relevante del estado o de las opciones.
- No se han publicado benchmarks ni el paper, por lo que no hay evidencia pública de calidad frente a alternativas.
- Riesgo de sesgo y alucinación: al ser un clasificador, no alucina texto, pero sus probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento, cuyo contenido no se detalla.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/glim-oss/cogent-nano
- Repositorio de inferencia: https://github.com/glim-oss/cogent-infer
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-32m-v1
- Otros tamaños de la familia: https://huggingface.co/glim-oss/cogent-small, https://huggingface.co/glim-oss/cogent-base, https://huggingface.co/glim-oss/cogent-large
- Paper: pendiente de publicación (el enlace se añadirá en la model card)
