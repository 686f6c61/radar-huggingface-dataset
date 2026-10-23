# hanaearg/Phi-3.5-mini-instruct-GoEmotions-P1-Unsloth

## Resumen

`hanaearg/Phi-3.5-mini-instruct-GoEmotions-P1-Unsloth` es un ajuste fino supervisado del modelo Phi-3.5-mini-instruct de Microsoft, partiendo de la versión cuantizada en 4 bits publicada por Unsloth (`unsloth/Phi-3.5-mini-instruct-bnb-4bit`). Lo desarrolla el usuario hanaearg y se distribuye con licencia apache-2.0 declarada en el repositorio. El nombre del modelo indica que el entrenamiento se ha orientado a la taxonomía de emociones GoEmotions, aunque la model card no documenta el dataset, el formato de las etiquetas ni los hiperparámetros utilizados.

El interés práctico del modelo es acotado: se trata de una publicación de tipo "uploaded finetuned model" sin métricas de evaluación, sin ejemplos de prompt y con cero descargas en el momento de la ficha. El tamaño del repositorio (0,1 GB) es coherente con un adaptador LoRA/PEFT y no con pesos completos de un modelo de 3,8 mil millones de parámetros, por lo que su uso requiere descargar el modelo base cuantizado y cargar el adaptador encima.

Como referencia, el modelo base Phi-3.5-mini-instruct es un transformer decoder-only de 3,82 mil millones de parámetros con 128 000 tokens de contexto, entrenado por Microsoft sobre 3,4 billones de tokens; esas cifras provienen de la documentación pública del modelo base y no están verificadas en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Phi-3.5-mini-instruct); el repositorio contiene presumiblemente un adaptador LoRA sobre el base |
| Parametros totales | 3,82 mil millones (modelo base; el adaptador en el repositorio ocupa 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; no verificada en este repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio. El modelo base de partida está cuantizado en bitsandbytes 4-bit (`bnb-4bit`) |
| Idiomas soportados | Inglés (declarado en la model card; el modelo base tiene capacidades multilingües limitadas) |
| Licencia | apache-2.0 (declarada en el repositorio). El modelo base Phi-3.5-mini-instruct se distribuye bajo licencia MIT según Microsoft |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura propia del ajuste: la model card se limita a indicar el modelo de partida, la licencia y que el entrenamiento se realizó con Unsloth. Tomando como referencia el modelo base, se trata de un transformer decoder-only de 32 capas, dimensión oculta 3072, 32 cabezas de atención con 8 cabezas KV (GQA), vocabulario de 32 064 tokens y ventana de contexto de 128 000 tokens. El ajuste se ha aplicado sobre una versión del base cuantizada en 4 bits con bitsandbytes, lo que implica que el adaptador se ha entrenado sobre pesos ya degradados por la cuantización.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, la proporción de ejemplos por etiqueta, el uso de RLHF/DPO ni las innovaciones técnicas del ajuste. El nombre del modelo sugiere el uso de GoEmotions, un corpus público de aproximadamente 58 000 comentarios de Reddit anotados con 27 emociones más la categoría neutral, pero esta correspondencia no está confirmada en la documentación del autor. Tampoco se especifica si el resultado es un adaptador LoRA puro, un adaptador fusionado o un checkpoint parcial; el tamaño del repositorio apunta a lo primero.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Phi-3.5-mini-instruct.
- Clasificación de emociones en inglés, presumiblemente sobre la taxonomía de GoEmotions (27 emociones + neutral), según indica el nombre del modelo.
- Comprensión de instrucciones en formato conversacional, al derivar de una variante `-instruct`.
- Soporte de tool calling y function calling heredado del base (no validado tras el ajuste fino).
- Capacidades multilingües limitadas y no garantizadas: la model card solo declara inglés.
- No se documentan modos especiales (thinking, visión, audio) ni ajustes específicos de agentes; el modelo base es solo texto.

## Casos de uso

- Clasificación de emociones en tickets de soporte: usar el modelo para etiquetar cada mensaje entrante con una o varias de las 28 categorías de GoEmotions y enrutar el caso al equipo adecuado según la emoción detectada (frustración, enfado, gratitud).
- Monitorización de sentimiento en redes sociales: procesar lotes de comentarios en inglés y agregar la distribución de emociones por campaña o producto, aprovechando el contexto de 128 000 tokens del base para analizar hilos completos.
- Moderación de comunidades: detección de tono hostil o negativo en foros y chats, con umbrales configurables sobre las categorías de emoción negativa.
- Pre-etiquetado para anotación humana: generar una primera pasada de etiquetas sobre un corpus nuevo y reducir el coste de anotación manual, con revisión posterior por anotadores.
- Investigación en psicolingüística o análisis de discurso: clasificación masiva de corpus en inglés con una taxonomía granular de 27 emociones, siempre que se valide previamente la fiabilidad del ajuste.
- Enrutamiento en asistentes conversacionales: usar la emoción detectada como señal para adaptar el tono de la respuesta de un agente mayor, en arquitecturas de dos etapas.
- Extracción de señal para paneles de voz del cliente: combinar las etiquetas emocionales con métricas de negocio (NPS, churn) para priorizar la revisión de conversaciones de alto riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, F1, matriz de confusión ni comparación con clasificadores de referencia sobre GoEmotions, y tampoco se han publicado resultados de MMLU, HumanEval o GSM8K para este ajuste.

## Requisitos de hardware

- Inferencia en fp16 del modelo base (3,82 mil millones de parámetros): aproximadamente 7,6 GB solo de pesos, con 10-12 GB de VRAM recomendados para dejar espacio a la caché KV.
- Cuantización en 8 bits: en torno a 4-5 GB de VRAM; en 4 bits, aproximadamente 2,5-3 GB de pesos.
- GPU consumer: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 con cuantización de 4 u 8 bits. Una GPU de 8 GB requiere cuantización agresiva y contextos cortos.
- GPU de datacenter: A100 40/80 GB, H100 y L40S sobran para el modelo; su utilidad real es servir muchas réplicas concurrentes.
- La ventana de 128 000 tokens dispara el consumo de caché KV; para contextos largos conviene GQA con cuantización de la caché o limitar la longitud efectiva.
- Despliegue: `transformers` + `peft` para cargar el adaptador sobre el base (la ruta más directa dado el tamaño del repositorio), vLLM o TGI si se fusiona el adaptador en un checkpoint completo, y llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles. No hay datos de tokens por segundo publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hanaearg/Phi-3.5-mini-instruct-GoEmotions-P1-Unsloth | 3,82 mil millones (base) + adaptador | 128 000 tokens (base) | Clasificación de emociones sobre Phi-3.5-mini | apache-2.0 (declarada) | Repositorio público, 0 descargas, sin métricas |
| unsloth/Phi-3.5-mini-instruct-bnb-4bit (modelo base) | 3,82 mil millones | 128 000 tokens | Instrucciones generales, cuantizado 4-bit | MIT (modelo original de Microsoft) | Ampliamente disponible y documentado |
| SamLowe/roberta-base-go_emotions | ~125 millones | 512 tokens | Clasificador dedicado de 28 emociones GoEmotions | MIT | Muy extendido, con métricas publicadas |
| j-hartmann/emotion-english-distilroberta-base | ~82 millones | 512 tokens | Clasificador de 7 emociones | MIT | Extendido, con métricas publicadas |

Los datos de los clasificadores alternativos provienen de la documentación pública de esos modelos y no se han verificado en la información de este repositorio. La comparación relevante es de coste: un clasificador dedicado de 82-125 millones de parámetros es entre 30 y 45 veces más pequeño que el base de 3,82 mil millones, se ejecuta en CPU con latencia de milisegundos y está evaluado; este ajuste ofrece, en cambio, contexto largo y posible formateo generativo, pero sin evidencia de calidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay métricas, matriz de confusión ni análisis por clase, lo que impide saber si el ajuste supera a un clasificador trivial o al propio modelo base con un prompt adecuado.
- Model card mínima: no se documentan dataset, formato de prompt, hiperparámetros, épocas ni si las etiquetas se generan como texto libre o como elección cerrada. Reproducir el comportamiento esperado es difícil.
- Sesgo de dominio y demográfico: GoEmotions se construyó con comentarios de Reddit en inglés, un dominio con jerga, ironía y una demografía concreta; el rendimiento puede degradarse en correos corporativos, transcripciones de voz o textos de otras comunidades.
- Idioma: solo se declara inglés; el uso en castellano no está soportado ni evaluado.
- Riesgo de alucinación y de deriva generativa: al ser un modelo generativo y no un clasificador con cabeza softmax, puede producir etiquetas fuera del conjunto, explicaciones inventadas o mezclar categorías si el prompt no restringe la salida.
- Base cuantizada en 4 bits durante el entrenamiento: el adaptador se ha ajustado sobre pesos con ruido de cuantización, lo que puede limitar la calidad final frente a un ajuste sobre fp16.
- Posible inconsistencia de licencia: el repositorio declara apache-2.0 mientras que el modelo base de Microsoft se publica bajo MIT. Ambas son permisivas y compatibles para uso comercial, pero conviene verificar los términos aplicables antes de redistribuir.
- Sin soporte ni mantenimiento: cero descargas y cero "likes" en el momento de la ficha; no hay garantía de correcciones ni de respuesta del autor.
- En producción, validar siempre contra un conjunto etiquetado propio antes de sustituir un clasificador dedicado; el coste de inferencia de 3,82 mil millones de parámetros es órdenes de magnitud superior al de un encoder pequeño.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hanaearg/Phi-3.5-mini-instruct-GoEmotions-P1-Unsloth
- Modelo base cuantizado: https://huggingface.co/unsloth/Phi-3.5-mini-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper de Phi-3 (referencia del modelo base): https://arxiv.org/abs/2404.14219
- Modelo Phi-3.5-mini-instruct de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
