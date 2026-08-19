# Dariachup/dormouse-mt-uk-en

## Resumen

`dormouse-mt-uk-en` es un modelo de traducción automática neuronal (NMT) del ucraniano al inglés, desarrollado por Dariachup como un fine-tune del modelo base `Helsinki-NLP/opus-mt-uk-en`. Con 75,7 millones de parámetros, está diseñado específicamente para traducir lenguaje coloquial ucraniano, incluyendo el surzhyk (mezcla de ucraniano y ruso), en contextos de chat. El modelo se integra en la librería Python `dormouse-ua`, cuyo objetivo es permitir que un usuario ucraniano converse con un LLM en inglés sin que el modelo tenga que generar caracteres cirílicos.

El problema que resuelve es la brecha entre el ucraniano hablado en entornos informales y los modelos de traducción genéricos, que suelen fallar con jerga, coloquialismos y surzhyk. Su relevancia radica en que ofrece una solución ligera (ejecutable en CPU) y específica para este dominio, con mejoras significativas de BLEU y chrF frente al modelo base. La arquitectura es MarianMT (basada en Transformer), el tamaño es de 75.732.627 parámetros y la longitud de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer) |
| Parametros totales | 75.732.627 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ucraniano (uk), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un Transformer encoder-decoder optimizado para traducción. El fine-tune parte de los pesos de `Helsinki-NLP/opus-mt-uk-en` (76M parámetros) y se entrena sobre un corpus de 285.784 pares de frases, compuesto por cuatro fuentes: 158.482 pares de chat real ucraniano (Telegram, Threads), 96.738 pares de chat nativo en inglés (hh-rlhf, oasst1) con el lado ucraniano traducido automáticamente, 20.924 pares de texto de atención al cliente (también con lado ucraniano traducido) y 9.640 pares sintéticos con surzhyk inyectado en frases reales. Para evitar el olvido catastrófico, se mezclan pares generales de OPUS/flores durante el entrenamiento.

No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tune supervisado estándar. La innovación principal es la inclusión explícita de surzhyk y lenguaje coloquial de chat, lo que lo hace adecuado para entornos de mensajería y conversación informal. El modelo se distribuye como parte de la librería `dormouse-ua`, que además ofrece normalización de surzhyk antes de la traducción.

## Capacidades

- Traducción ucraniano → inglés, especializada en lenguaje coloquial y de chat.
- Manejo de surzhyk (mezcla ucraniano-ruso) con normalización previa opcional.
- Adecuado para ejecución en CPU gracias a su tamaño reducido (76M parámetros).
- Integración sencilla con la librería `dormouse-ua` mediante la clase `get_translator`.
- Compatible con la API estándar de `transformers` (MarianMTModel, MarianTokenizer).
- Soporte para generación con búsqueda de haces (`num_beams=4`) para mejorar la calidad.

## Casos de uso

- Traducción en tiempo real de mensajes de chat: un usuario ucraniano escribe en su idioma (incluyendo surzhyk) y el modelo traduce al inglés para que un LLM angloparlante pueda procesar la consulta. Es el caso de uso principal de la librería `dormouse-ua`.
- Atención al cliente bilingüe: integración en sistemas de soporte donde el cliente escribe en ucraniano y el agente (humano o bot) responde en inglés. El modelo está entrenado con un slice de customer-support (20.924 pares) que mejora el BLEU de 24.82 a 58.99 en ese dominio.
- Normalización y traducción de contenido generado por usuarios en redes sociales: el slice `v06` (chat real de Telegram y Threads) permite traducir publicaciones y comentarios informales con mayor fidelidad que el modelo base.
- Traducción de surzhyk en contextos cotidianos: el modelo incluye un slice sintético de surzhyk (9.640 pares) que mejora el BLEU de 16.12 a 25.79, útil para aplicaciones que procesan habla mixta ucraniano-ruso.
- Preprocesamiento para pipelines de IA: como paso previo en sistemas que necesitan convertir texto ucraniano a inglés antes de alimentar a un LLM, evitando que el LLM tenga que generar cirílico.
- Despliegue ligero en entornos con recursos limitados: al ser un modelo de 76M parámetros, puede ejecutarse en CPUs de gama baja o en dispositivos edge, lo que lo hace viable para aplicaciones móviles o embebidas.

## Benchmarks y rendimiento

La model card reporta métricas sobre 1000 pares held-out, comparando el modelo base (`Helsinki-NLP/opus-mt-uk-en`) con el fine-tune. Se utilizan BLEU y chrF (sacrebleu). Los resultados se desglosan por subconjuntos:

| Slice | n | base BLEU | ft BLEU | base chrF | ft chrF |
|---|---|---|---|---|---|
| overall | 1000 | 23.20 | 38.46 | 45.49 | 58.80 |
| cs | 250 | 24.82 | 58.99 | 47.94 | 75.70 |
| native | 250 | 34.01 | 47.77 | 57.53 | 67.63 |
| v06 | 250 | 17.43 | 31.32 | 38.82 | 53.16 |
| surzhyk | 250 | 16.12 | 25.79 | 37.97 | 47.36 |

Nota importante: los slices `cs` y `native` tienen el lado ucraniano generado por `gemini-2.5-flash`, no por humanos. Por tanto, las métricas altas en esos slices (47-59 BLEU) reflejan la capacidad del modelo para "traducir el ucraniano de Gemini", no calidad humana. Los slices honestos son `v06` (chat real con referencias humanas) y `surzhyk`, donde se observa una mejora de 31.32 BLEU (frente a 17.43) y 25.79 BLEU (frente a 16.12), respectivamente.

## Requisitos de hardware

- El modelo tiene 75.732.627 parámetros, lo que en precisión fp32 ocupa aproximadamente 303 MB (0.6 GB en el repositorio incluye otros archivos). Es ejecutable en CPU sin necesidad de GPU.
- VRAM estimada: no se especifica, pero al ser un modelo pequeño, cualquier GPU con al menos 1 GB de VRAM puede alojarlo sin problemas (por ejemplo, GTX 1050, RTX 2060, etc.).
- GPU recomendadas: no es necesario; funciona en CPU. Si se desea acelerar, cualquier GPU moderna (RTX 30xx o superior) ofrecería latencias muy bajas.
- Opciones de despliegue: mediante `transformers` (MarianMTModel) en Python, o a través de la librería `dormouse-ua`. No se mencionan formatos como ONNX o GGUF, pero al ser safetensors es convertible.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño, se espera una latencia de decenas de milisegundos en CPU y de pocos milisegundos en GPU.

## Comparativa con modelos similares

La comparativa más directa es contra el modelo base `Helsinki-NLP/opus-mt-uk-en`, del cual deriva. No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

| Modelo | Parámetros | Contexto | BLEU (overall) | chrF (overall) | Licencia |
|---|---|---|---|---|---|
| Helsinki-NLP/opus-mt-uk-en (base) | 76M | No disponible | 23.20 | 45.49 | Apache-2.0 |
| dormouse-mt-uk-en (fine-tune) | 75.7M | No disponible | 38.46 | 58.80 | Apache-2.0 |

El fine-tune mejora sustancialmente las métricas globales (+15.26 BLEU, +13.31 chrF), a costa de especializarse en lenguaje de chat. Para otros modelos de traducción ucraniano-inglés (p. ej., Google Translate, Meta NLLB), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Sesgo de dominio: entrenado principalmente en chat, el modelo "se desvía" en sustantivos comerciales fuera de ese dominio. Ejemplos reportados: `реквізити` → `refunds`, `гравіювання імені` → `name-playing order`, `застібка` → `zip`. Esto puede causar errores graves en contextos de comercio electrónico o documentación técnica.
- Riesgo de alucinación: como todo modelo NMT, puede generar traducciones plausibles pero incorrectas, especialmente en frases ambiguas o con jerga poco frecuente.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia; los modelos Marian suelen limitarse a frases cortas o medianas, por lo que no es adecuado para documentos largos sin segmentación.
- Dependencia de la librería `dormouse-ua` para la normalización de surzhyk; el modelo por sí solo no garantiza un manejo perfecto de todas las variantes.
- Los datos de entrenamiento incluyen contenido generado por IA (Gemini) en los slices `cs` y `native`, lo que puede introducir sesgos sutiles en la traducción de esos dominios.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero se recomienda validar la calidad en el dominio específico antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dariachup/dormouse-mt-uk-en
- Librería `dormouse-ua` en PyPI: https://pypi.org/project/dormouse-ua/
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-uk-en
