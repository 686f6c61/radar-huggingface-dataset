# minnesotanlp/SanSi

## Resumen

SanSi es un modelo de decisión tipada ("typed decision model") desarrollado por el grupo Minnesota NLP (minnesotanlp) y presentado en el paper "SanSi: A Looped Typed Decision Model for System 1.5 Thinking" (arXiv:2610.07730). No es un modelo generativo: dado un estado en texto, una pregunta y entre 2 y 26 opciones declaradas, devuelve una probabilidad para cada opción sin emitir ningún token. Los autores describen este comportamiento como "System 1.5 thinking": el modelo revisa su estado oculto en cada bucle antes de comprometerse con una respuesta, pero nunca escribe texto intermedio.

Técnicamente, SanSi no es un modelo completo, sino un conjunto de adaptadores LoRA de rango 64 (alpha 128, dropout 0.05) más una pequeña cabeza de lectura por bucle, con 60,8 millones de parámetros entrenados. Se monta sobre el backbone congelado ByteDance/Ouro-1.4B, un transformer con 24 capas compartidas que se aplican en bucle un número fijo de veces (T = 8). Las probabilidades de las opciones se leen tras cada bucle, de modo que una sola pasada hacia delante ofrece una decisión para cada presupuesto de cómputo, de 1 a 8 bucles.

Su relevancia actual reside en dos factores: primero, alcanza un 72,0 % de exactitud media en el conjunto de test de 10.027 ítems del paper usando solo 61M de parámetros entrenados sobre un backbone de 1,4B, compitiendo con modelos generativos de 2B a 4,2B parámetros; segundo, ofrece una calibración mejor que la de sus alternativas (ECE de 0,093 frente a 0,113–0,137 de los modelos comparados), lo que lo hace útil en escenarios donde importa la confianza de la decisión y no solo el acierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con apilamiento en bucle (looped): 24 capas compartidas aplicadas 8 veces (backbone Ouro-1.4B) + adaptadores LoRA y una cabeza de lectura por bucle |
| Parametros totales | 1,4B en el backbone congelado; 60,8M entrenados (LoRA de rango 64 + lecturas de rango 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el backbone se ejecuta en bfloat16; no se publican versiones cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El backbone es Ouro-1.4B, un modelo preentrenado para operar en bucle: una única pila de 24 capas se aplica de forma iterativa T = 8 veces sobre el mismo estado oculto. SanSi congela ese backbone y añade encima dos componentes entrenables: adaptadores LoRA de rango 64 (alpha 128, dropout 0,05) sobre las proyecciones de atención y de MLP, y una cabeza de lectura de rango 16 por cada bucle. La salida no es texto: la función `decide` escribe una plantilla fija (`<state>` seguido de `Question:`, `Options: (A) ... (B) ...` y `Answer:`) y lee las letras de las opciones en el último token tras cada bucle, devolviendo una lista de probabilidades por bucle.

El entrenamiento usa 12.800 ítems de la "decision suite" del paper, construidos a partir de 20 fuentes públicas descargadas en revisiones fijas y reconstruidas byte a byte. La pérdida combina entropía cruzada y Brier score contra la distribución objetivo del ítem, y se aplica en todos los bucles. Se realizaron 1.000 pasos de 16 ítems con AdamW (learning rate 1e-4 para LoRA y 1e-3 para las lecturas, 200 pasos de warm-up, decaimiento coseno hasta el 10 %, gradient clipping a 1,0) sobre dos RTX A6000 y semilla 0. Los ítems cuya respuesta no se deduce del estado se entrenaron hacia la distribución uniforme, de modo que una probabilidad máxima baja indica que el modelo no se compromete con ninguna opción (el paper considera respuesta "dura" cuando la probabilidad top alcanza (1 + 1/K) / 2 para K opciones).

## Capacidades

- Decision tipada sobre opciones declaradas: devuelve una distribución de probabilidad sobre entre 2 y 26 opciones en una sola llamada, sin generar texto.
- Decisión a presupuesto variable: la misma pasada hacia delante produce predicciones tras cada uno de los 8 bucles, lo que permite un "early exit" (4 bucles ya alcanzan 71,6 %, frente al 72,0 % con 8).
- Calibración explícita: la probabilidad top es una señal interpretable de compromiso; una probabilidad baja indica que el estado no contiene la respuesta.
- Razonamiento de sentido común y lógico de opción múltiple (por ejemplo, comparaciones transitivas del tipo "Mia es más alta que Sam; Sam más alto que Lee; ¿quién es el más bajo?").
- Transferencia a ítems reformulados o más difíciles ("near transfer") y a fuentes nunca vistas en entrenamiento ("far transfer"), según los resultados del paper.
- No soporta generación de texto, tool calling, function calling, uso de agentes ni multi-step reasoning en el sentido conversacional.
- No soporta visión, audio ni modalidades distintas del texto.
- Multilingüismo: no disponible; el modelo está entrenado exclusivamente en inglés.

## Casos de uso

- Evaluación de razonamiento de opción múltiple: integrar SanSi como clasificador de opción múltiple en pipelines tipo MMLU, donde se declaran las alternativas como opciones y se lee la probabilidad de cada una para calcular exactitud y calibración sin coste de generación.
- Detección de abstención: al entrenarse los ítems sin respuesta hacia la distribución uniforme, la probabilidad top funciona como umbral de "no sé", lo que permite descartar automáticamente consultas cuyo contexto no contiene la respuesta.
- Enrutado de consultas hacia modelos mayores: usar las probabilidades de SanSi sobre opciones del tipo "consulta simple" / "consulta compleja" / "requiere herramienta" para decidir si una petición se resuelve con un modelo pequeño o se escala a uno grande, con un coste de GPU comparable a una pasada de 1,4B multiplicada por 8.
- Clasificación de intenciones con etiquetas declaradas: en un sistema de tickets o de atención al cliente, declarar el conjunto de intenciones como opciones y obtener una distribución calibrada sobre ellas, útil cuando se necesita umbral de confianza además de la etiqueta.
- Análisis de inferencia textual (NLI): plantear pares premisa/hipótesis como estado y declarar "implicación", "contradicción" y "neutral" como opciones, aprovechando la calibración para ordenar casos dudosos.
- Moderación y filtrado de contenido con umbrales calibrados: declarar categorías de riesgo como opciones y usar las probabilidades (no solo el argmax) para decidir entre aprobar, revisar o rechazar, reduciendo falsos positivos gracias a un ECE de 0,093.
- Análisis de sentimiento y etiquetado fino: clasificar reseñas o comentarios sobre un conjunto de etiquetas declaradas, con la ventaja de que la decisión se obtiene sin generar ni un token, lo que reduce latencia y coste frente a un modelo generativo del mismo tamaño.
- Etiquetado de datos a escala: el repositorio incluye `eval/evaluate.py` para recorrer un dataset completo, de modo que SanSi puede usarse como anotador automático de conjuntos de decisiones con probabilidades por clase.

## Benchmarks y rendimiento

Exactitud (%) sobre los 10.027 ítems de test del paper, tras cada bucle. Se muestra la media de las tres semillas de entrenamiento y el checkpoint de este repositorio (semilla 0):

| Bucle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Media de tres semillas | 58,4 | 66,9 | 70,4 | 71,6 | 71,9 | 72,1 | 72,1 | 72,0 |
| Este checkpoint (semilla 0) | 57,7 | 67,2 | 70,4 | 71,2 | 71,2 | 71,4 | 71,4 | 71,3 |

Comparación principal del paper: todos los modelos se entrenan con los mismos datos y la misma receta, salvo Kev-4B (datos de los autores), que usa el código de Kev; media de tres semillas. "In-dist." son ítems de las fuentes de entrenamiento, "near" versiones más difíciles o reformuladas, y "far" fuentes nunca vistas. El coste es el tiempo de GPU de una pasada sobre los ítems de test, tomando un bucle de Ouro-1.4B como 1. ECE es el error de calibración esperado.

| Modelo | Parametros | Bucles | Coste | Global | In-dist. | Near | Far | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SmolLM2-1.7B | 1,7B | 1 | 1,1 | 58,4 | 76,1 | 57,7 | 52,3 | 0,069 |
| Ouro-1.4B, un bucle | 1,4B | 1 | 1,0 | 58,6 | 77,3 | 59,9 | 51,3 | 0,137 |
| Qwen3.5-2B | 1,9B | 1 | 1,2 | 66,7 | 84,3 | 62,3 | 61,7 | 0,123 |
| Qwen3.5-4B | 4,2B | 1 | 2,4 | 73,8 | 88,5 | 68,9 | 70,1 | 0,113 |
| Kev-4B (datos de los autores) | 4,2B | 1 | 2,1 | 74,3 | 88,6 | 70,9 | 70,3 | 0,119 |
| **SanSi** | 1,4B | 8 | 7,7 | 72,0 | 86,6 | 67,7 | 68,0 | 0,093 |
| SanSi-2.6B | 2,7B | 8 | 14,8 | 75,8 | 88,4 | 74,4 | 71,6 | 0,078 |

Según indica la model card, ejecutar más bucles de los ocho con los que fue entrenado reduce la exactitud.

## Requisitos de hardware

- VRAM para inferencia: el backbone opera obligatoriamente en bfloat16 (≈2,8 GB de pesos para 1,4B) más los 60,8M de parámetros entrenados y el estado intermedio de los 8 bucles; una estimación razonable para prompts cortos es de 4–6 GB, aunque no hay cifras oficiales publicadas.
- GPU recomendadas: los autores usaron dos RTX A6000 para el entrenamiento; para inferencia basta una GPU con al menos 8 GB. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son suficientes según esa estimación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más, dado el tamaño del backbone en bfloat16.
- Opciones de despliegue: el repositorio oficial (`sansi.hub.load` y `sansi.hub.decide`) es la vía documentada. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y la arquitectura en bucle con lecturas por iteración probablemente requiera código específico.
- Cuantización: no se publican versiones GGUF, AWQ ni GPTQ; la única configuración conocida es bfloat16.
- Latencia y throughput: no disponibles en términos absolutos. El paper sí publica el coste relativo: una pasada completa de SanSi equivale a 7,7 veces el coste de un único bucle de Ouro-1.4B sobre el mismo conjunto de test. El modo de 4 bucles reduce el coste aproximadamente a la mitad, con una caída de exactitud de 72,0 % a 71,6 %.

## Comparativa con modelos similares

| Modelo | Parametros (entrenados) | Bucles | Contexto | Global | ECE | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| SanSi | 1,4B (60,8M) | 8 | no disponible | 72,0 | 0,093 | Apache 2.0 | HuggingFace (PEFT) |
| SanSi-2.6B | 2,7B (121,4M) | 8 | no disponible | 75,8 | 0,078 | no disponible | HuggingFace |
| Ouro-1.4B, un bucle | 1,4B | 1 | no disponible | 58,6 | 0,137 | no disponible | HuggingFace (ByteDance) |
| SmolLM2-1.7B | 1,7B | 1 | no disponible | 58,4 | 0,069 | no disponible | HuggingFace |
| Qwen3.5-2B | 1,9B | 1 | no disponible | 66,7 | 0,123 | no disponible | no disponible |
| Qwen3.5-4B | 4,2B | 1 | no disponible | 73,8 | 0,113 | no disponible | no disponible |
| Kev-4B (datos de los autores) | 4,2B | 1 | no disponible | 74,3 | 0,119 | no disponible | no disponible |

La comparación procede íntegramente de la tabla del paper. SanSi con 8 bucles (72,0 %) supera a Qwen3.5-2B (66,7 %) y se queda por debajo de Qwen3.5-4B (73,8 %) y de Kev-4B (74,3 %), pero con 1,4B de backbone y 60,8M de parámetros entrenados, frente a 4,2B. La variante SanSi-2.6B (75,8 %) supera a todos los modelos de un solo paso de la tabla. En calibración, SanSi solo es superado por SmolLM2-1.7B (0,069), que sin embargo rinde 13,6 puntos menos en exactitud global. El coste computacional de SanSi es el más alto de la tabla (7,7), y el de SanSi-2.6B casi el doble (14,8).

## Limitaciones y advertencias

- Solo inglés: el campo `language` de la model card indica únicamente `en`; no hay resultados en otros idiomas.
- Formato de uso muy restringido: una pregunta con entre 2 y 26 opciones declaradas por llamada, con la plantilla exacta `<state>\n\nQuestion: ...\nOptions: (A) ... (B) ...\nAnswer:`. No acepta instrucciones libres ni conversación multi-turno.
- No genera texto: todas las tareas que requieran producción de lenguaje, resumen, traducción o diálogo quedan fuera de su alcance.
- Ejecutar más de 8 bucles degrada la exactitud, según advierte la propia model card.
- Riesgo de alucinación trasladado a la distribución: si el estado no contiene la respuesta, el modelo tiende a la uniformidad, pero una probabilidad alta no garantiza corrección; en el conjunto global acierta el 72,0 %, con un 68,0 % en ítems de transferencia lejana.
- Licencia Apache 2.0 en el repositorio del adaptador, lo que en principio permite uso comercial, pero el backbone subyacente Ouro-1.4B se descarga por separado desde ByteDance/Ouro-1.4B y sus términos no se detallan en la información disponible; conviene verificarlos antes de un despliegue comercial.
- Dependencia de revisiones fijas: el código carga Ouro-1.4B en la revisión concreta usada en el entrenamiento; cambios en el repositorio base podrían afectar a la reproducibilidad.
- Adopción prácticamente nula en el momento de la ficha: 0 descargas y 0 "likes" en HuggingFace, sin ecosistema de terceros ni soporte en servidores de inferencia estándar.
- La fecha de creación del repositorio (2026-10-08) y el identificador del arXiv son los que figuran en los metadatos proporcionados; no se dispone de información adicional de mantenimiento o actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minnesotanlp/SanSi
- Variante SanSi-2.6B: https://huggingface.co/minnesotanlp/SanSi-2.6B
- Paper (arXiv): https://arxiv.org/abs/2610.07730
- Versión HTML del paper: https://arxiv.org/html/2610.07730v1
- Repositorio de código: https://github.com/minnesotanlp/Sansi
- Página del proyecto: https://minnesotanlp.github.io/Sansi/
- Modelo base Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Colección SciSense de minnesotanlp: https://huggingface.co/collections/minnesotanlp/scisense
