# cortex-agent-llc/kodiak-v0.2-1b

## Resumen

Kodiak-v0.2-1B es un modelo de decisión (no generativo) de 1.044.119.556 parámetros desarrollado por Cortex Agent LLC. Recibe un estado en forma de texto, lista de textos o JSON, junto con preguntas tipadas, y devuelve en una sola pasada hacia delante una elección calibrada, una puntuación o la respuesta "no lo sé". Está construido sobre el encoder Ettin-encoder-1B del Johns Hopkins CLSP (licencia MIT) y se distribuye bajo licencia Apache 2.0.

Su propuesta es sustituir llamadas a LLM grandes en tareas rutinarias de "lee esto y decide": enrutado, triaje, guardarraíles y verificaciones. Según la model card, iguala a un LLM de 8.000 millones de parámetros (Qwen3-8B) en tareas para las que nunca fue entrenado (0,689 frente a 0,688 de precisión forzada) con una latencia de 38 ms por petición en GPU, aproximadamente 40 veces menor que los ~1.500 ms del modelo de 8B.

El interés actual del modelo reside en su calibración y su capacidad de abstención: cuando responde "no lo sé" acierta el 88% de las veces, y ordena sus propios errores al final en un 55,6% de la distancia al orden perfecto, frente al 14,7% del LLM de 8B. Eso permite usarlo como filtro previo y derivar únicamente los casos dudosos a un humano o a un LLM mayor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base: Ettin-encoder-1B de Johns Hopkins, familia ModernBERT) |
| Parámetros totales | 1.044.119.556 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión completa; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos relevantes: el repositorio ocupa 4,2 GB, la librería declarada es `kodiak`, el modelo base es `jhu-clsp/ettin-encoder-1b` y la etiqueta `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints. El campo `inference` está marcado como `false` porque no se ejecuta mediante el pipeline estándar de transformers.

## Arquitectura y entrenamiento

Kodiak-v0.2-1B no es un modelo generativo, sino un encoder de decisión construido afinando el encoder Ettin-encoder-1B (MIT) de Johns Hopkins. La entrada es un estado (texto libre, una lista de textos o JSON) acompañado de preguntas tipadas; la salida es una respuesta de elección, de puntuación o de abstención ("can't tell") en una única pasada hacia delante. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

Sí se documenta el origen de los datos: todo el material de entrenamiento es sintético o con licencia permisiva. Los datos sintéticos fueron redactados y revisados por modelos de pesos abiertos (gpt-oss-120b y DeepSeek-V3.2); no se incluyen salidas de modelos cerrados ni datos de evaluación. La innovación principal de la versión v0.2 es que el entrenamiento muestra las opciones de respuesta con redacciones distintas (etiqueta corta, frase completa o paráfrasis), lo que elevó la precisión en tareas nunca vistas en 2,7 puntos y redujo el error de calibración alrededor de un 20%. También se añadieron cuatro tipos nuevos de decisión: verificación de fundamentación (groundedness) y localización de la frase no soportada, elección del siguiente paso de un asistente a partir de especificaciones de API, verificación de afirmaciones contra un texto y juicio de relevancia de producto en búsqueda.

## Capacidades

- Decisión por elección cerrada: dada una pregunta y un conjunto de etiquetas, devuelve la opción más probable con una puntuación de confianza calibrada.
- Decisión con puntuación y abstención explícita: emite "can't tell" cuando no puede decidir, con un 88% de acierto en esos casos según la model card.
- Enrutado e intención: clasificación de intenciones de usuario (0,86 de Decision Index en CLINC150, corregido por azar).
- Selección de herramientas y function calling: decide si llamar a una herramienta, pedir información faltante o responder directamente a partir de especificaciones de API completas (0,28 en BFCL).
- Verificación de afirmaciones: comprueba si una afirmación está respaldada por un texto fuente (0,23 en HoVer).
- Verificación de fundamentación: detecta si una respuesta está anclada en su fuente y señala la frase que no lo está.
- Relevancia de producto en búsqueda: clasifica en coincidencia exacta, sustituto, complementario o irrelevante (0,23 en Amazon ESCI).
- Inferencia adversarial: 0,10 en ANLI.
- Detección de alucinaciones, según la etiqueta `hallucination-detection` de la model card.
- Multilingüe: no, únicamente inglés.
- Modo de precisión ("accuracy mode"): variante que promedia tres modelos v0.2 y consume aproximadamente 3 veces más cómputo, disponible como checkpoint independiente.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica la intención del cliente (por ejemplo, "estado de entrega", "cancelar y reembolsar", "pregunta de producto") en una sola pasada de encoder, con 0,86 de Decision Index en CLINC150 y 38 ms por petición, lo que permite procesar colas grandes sin recurrir a un LLM generativo.
- Triaje previo a un LLM mayor: se usa como primera etapa para resolver los casos fáciles y derivar solo los dudosos; su calibración (error de 0,085 sin recalibrar) y su tasa de acierto del 88% al abstenerse hacen viable fijar un umbral de confianza.
- Selección de herramientas en agentes: dada la especificación completa de una API, decide entre llamar a una herramienta, solicitar información que falta o contestar directamente, lo que reduce el coste de las llamadas al modelo generativo que orquesta el agente.
- Verificación de fundamentación en sistemas RAG: comprueba si la respuesta generada está respaldada por el contexto recuperado e identifica la frase concreta que no lo está, como guardarraíl antes de mostrar la respuesta al usuario.
- Verificación de afirmaciones en revisión de contenidos: contrasta una afirmación contra un texto de referencia (0,23 en HoVer), útil en moderación, verificación de fichas de producto o revisión editorial.
- Relevancia en buscadores y comercio electrónico: clasifica la relación entre consulta y producto en coincidencia exacta, sustituto, complementario o irrelevante (0,23 en Amazon ESCI), para reordenar resultados o filtrar catálogos.
- Guardarraíles y comprobaciones automáticas en pipelines: dado que todas las respuestas van acompañadas de una puntuación de confianza, se puede integrar como validador en CI/CD de contenidos o en flujos de aprobación, enviando a revisión humana los casos por debajo del umbral.
- Clasificación con abstención en entornos regulados: cuando el coste de un falso positivo es alto, el modelo puede rechazar la decisión y escalarla a una persona, dejando trazabilidad de la confianza asociada.

## Benchmarks y rendimiento

Comparativa en el conjunto de evaluación congelado v0.2 (preguntas de elección), según la model card:

| Métrica | Kodiak XL v2 preview (1B) | Kodiak-v0.2-1B | v0.2 accuracy mode | Qwen3-8B |
|---|---|---|---|---|
| Tareas nunca vistas, precisión forzada | 0,659 ± 0,013 | 0,689 ± 0,008 | 0,706 | 0,688 |
| Tareas familiares | 0,881 | 0,877 | 0,889 | 0,710 |
| Ordena sus propios errores al final (nunca vistas; fracción de la distancia al orden perfecto) | no disponible | 55,6% | 56,6% | 14,7% |
| Error de calibración (nunca vistas; menor es mejor) | 0,113 | 0,085 | 0,062 | 0,293 |
| Acierto cuando dice "can't tell" | 0,87 | 0,88 | 0,905 | no disponible |
| Latencia (GPU, una petición) | 38 ms | 38 ms | ~3× | ~1.500 ms |

Notas de la model card: las cifras con ± de Kodiak-v0.2-1B son la media de tres ejecuciones de entrenamiento; el checkpoint publicado es la ejecución con semilla 1, elegida por pérdida de validación y nunca por el conjunto de evaluación. Sus puntuaciones propias son 0,680 en tareas nunca vistas forzadas, 0,877 en familiares y 0,094 de error de calibración en nunca vistas. Su porcentaje de ordenación de errores al final es 54,8% / 56,1% / 55,9% en las tres ejecuciones. La comparación de calibración es en bruto: Qwen3-8B es sobreconfiado en una cantidad aproximadamente constante, y una recalibración ajustada (isotónica, ajustada sobre las otras tareas nunca vistas) lo lleva de 0,293 a 0,178, mientras que el mismo tratamiento deja a Kodiak-v0.2-1B en 0,044-0,058.

Decision Index en benchmarks públicos (corregido por azar, de modo que 0 equivale a adivinar; media de tres ejecuciones sobre una muestra fija de hasta 1.000 preguntas por benchmark):

| Benchmark | XL v2 preview | Kodiak-v0.2-1B |
|---|---|---|
| Amazon ESCI (relevancia de producto) | 0,04 | 0,23 |
| HoVer (verificación de afirmaciones) | 0,12 | 0,23 |
| BFCL (function calling) | 0,20 | 0,28 |
| ANLI (inferencia adversarial) | 0,01 | 0,10 |
| CLINC150 (intención) | 0,84 | 0,86 |

En la prueba interna de habilidades retenidas, la puntuación subió de 0,52 a 0,98 con los cuatro tipos nuevos de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,1 GB en fp16/bf16 y 4,2 GB en fp32 para 1.044 millones de parámetros. No se publican checkpoints cuantizados, de modo que las cifras en int8 (~1 GB) o int4 (~0,5 GB) son estimaciones aritméticas, no formatos disponibles.
- GPU: la model card reporta 38 ms por petición en GPU, pero no especifica el modelo utilizado. Por tamaño, el modelo cabe con holgura en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4090, etc.) e incluso en GPUs de gama de entrada.
- CPU: un encoder de 1B es viable en CPU para cargas moderadas, aunque la latencia de 38 ms corresponde a GPU.
- Despliegue: la librería declarada es `kodiak` (instalación mediante `pip install "kodiak-s1[infer]"` desde el repositorio de GitHub). No se indican integraciones con vLLM, llama.cpp, Ollama ni TGI, y el modelo no se ejecuta con el pipeline estándar de transformers (`inference: false`). La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: 38 ms por petición en GPU (el modo de precisión multiplica por 3), frente a los ~1.500 ms del LLM de 8B comparable usado como línea base. No se publican cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión forzada (nunca visto) | Error de calibración (nunca visto) | Latencia GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kodiak-v0.2-1B | 1.044 M | no disponible | 0,689 ± 0,008 | 0,085 | 38 ms | apache-2.0 | Hugging Face |
| Kodiak v0.2 accuracy mode | 3 modelos de 1.044 M | no disponible | 0,706 | 0,062 | ~114 ms | apache-2.0 | Hugging Face |
| Qwen3-8B (LLM de referencia) | ~8.000 M | no disponible | 0,688 | 0,293 | ~1.500 ms | no disponible | no disponible en la información |
| Ettin-encoder-1B (modelo base) | ~1.000 M | no disponible | no disponible | no disponible | no disponible | MIT | Hugging Face |

El modelo base no es un competidor directo: es un encoder generalista del que Kodiak hereda la arquitectura y sobre el que se aplica el ajuste específico para decisión y calibración. La comparación relevante es contra LLM generativos de 8B usados como clasificadores, terreno en el que Kodiak iguala la precisión y mejora de forma notable la calibración y la latencia.

## Limitaciones y advertencias

- La redacción de las opciones sigue importando: la misma pregunta con opciones reformuladas recibe la misma respuesta solo alrededor del 68% de las veces en tareas nunca vistas (frente al 62% anterior). Se recomienda usar opciones cortas y distintas, y probar varias formulaciones con datos propios.
- Las opciones largas en forma de frase pueden sesgar la respuesta hacia una de ellas. En el benchmark de phishing PhishNChips, con dos descripciones largas, etiqueta la mayoría de los correos como "phishing" y su puntuación ronda el azar.
- Trampas de redacción: un mensaje que repite las palabras de una opción dentro de una condición puede arrastrar la respuesta hacia esa opción. Ejemplo citado: "if it can't arrive by Monday, cancel and refund me".
- Detección de alucinaciones a nivel de respuesta en respuestas largas (RAGTruth) y algunos benchmarks de llamadas a API (API-Bank, When2Call) siguen cerca del azar en v0.2; el problema no está resuelto.
- El modelo solo soporta inglés (`en`). No hay soporte multilingüe declarado.
- No hay información publicada sobre sesgos demográficos o sociales concretos; dado que el entrenamiento es sintético o con licencia permisiva y generado por modelos abiertos, puede heredar sesgos de esos generadores.
- Riesgo de alucinación reducido en comparación con un LLM generativo, porque el espacio de salida está restringido a etiquetas o puntuaciones, pero persiste el riesgo de decisiones erróneas con alta confianza en dominios fuera de la distribución de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. Conviene verificar las condiciones del modelo base Ettin-encoder-1B (MIT) al redistribuir.
- El repositorio no tenía descargas en el momento de la consulta y solo 2 "likes", lo que implica una base de usuarios muy reducida y poca validación externa independiente.
- En producción, se recomienda fijar un umbral de confianza y derivar los casos dudosos a un humano o a un LLM mayor, y validar con datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-agent-llc/kodiak-v0.2-1b
- Variante en modo precisión: https://huggingface.co/cortex-agent-llc/kodiak-v0.2-1b-accuracy
- Modelo base Ettin-encoder-1B: https://huggingface.co/jhu-clsp/ettin-encoder-1b
- Repositorio de código, documentación y registro de compilación público: https://github.com/grizzlypeaksoftware/kodiak
- Informe completo de comparación frente al LLM de 8B: `reports/v02-release-vs-llm-8b.md` dentro del repositorio anterior
