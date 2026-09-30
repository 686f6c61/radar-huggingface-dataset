# michaelfeil/rune-26b-a4b

## Resumen

Rune 26B-A4B v3 es un modelo de decisión multimodal desarrollado por Invergent. No es un modelo generativo al uso: recibe un estado (texto, datos estructurados o una imagen con texto), una pregunta y un conjunto de opciones, y devuelve una única opción acompañada de una probabilidad sobre todas ellas en un solo forward pass. Responde a tres tipos de pregunta: elección (escoger una entre N), noul (probabilidad de que una afirmación sea verdadera) y score (posición en una escala ordinal).

Arquitecturalmente es un transformer de mezcla de expertos (MoE) derivado de google/gemma-4-26B-A4B-it, con 25.805.936.206 parámetros totales y 8 de 128 expertos activos por token, más una torre de visión que se conserva para aceptar imágenes. La longitud de contexto declarada es de 262.000 tokens (262k). Se distribuye en safetensors bfloat16 como un checkpoint estándar de `Gemma4ForConditionalGeneration`.

Su relevancia actual viene de su posición en la Decision Index, un leaderboard público de modelos de decisión: Rune v3 ocupa el segundo puesto con 57,44 puntos de índice (y una estimación de 59,2 con el modo thinking activado), frente a los 57,89 de Jev 1.13. Frente a los modelos generativos, su propuesta es devolver una distribución de probabilidad calibrable en una sola pasada y con latencias de décimas de segundo, lo que lo hace apto para clasificación y enrutado a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4) con torre de vision; decoder-only, `Gemma4ForConditionalGeneration` |
| Parametros totales | 25.805.936.206 (~25,8B); la model card indica 26,5B |
| Parametros activos | 8 de 128 expertos activos por token (cifra exacta de parametros activos: no disponible) |
| Longitud de contexto | 262.000 tokens (262k) |
| Tipos de cuantizacion | bfloat16 en safetensors; existen builds GGUF de Rune v1 en el historial del repositorio (revision `2a15504`). Otros formatos: no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un checkpoint MoE multimodal construido sobre google/gemma-4-26B-A4B-it. Mantiene la torre de visión del modelo base, de modo que acepta imágenes además de texto y datos estructurados, y activa 8 expertos de 128 por token, lo que reduce el cómputo por token respecto a un modelo denso del mismo tamaño total. La innovación funcional no está en la arquitectura sino en la interfaz: Rune devuelve, en una sola pasada, una opción y su probabilidad, y soporta de forma nativa los tres formatos de consulta (choice, noul, score) con los que fue entrenado.

El autor no publica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. Sí se documenta un modo thinking opcional por petición: si la confianza de la respuesta en una pasada (probabilidad de la opción superior; en preguntas de verdadero/falso, el mayor valor entre p y 1-p) queda por debajo de 0,7, el modelo razona hasta 512 tokens antes de responder; el resto de preguntas conservan su respuesta directa. Según el autor, aproximadamente una de cada diez preguntas activa thinking en la suite 0.2 de Decision Index. El motor de servicio recomendado es surogate, cuyo endpoint de decisiones implementa el protocolo con el que se entrenó el modelo.

## Capacidades

- Decisión con opciones múltiples (choice): selecciona una opción entre N y devuelve la probabilidad sobre el conjunto.
- Verificación de afirmaciones (noul): estima la probabilidad de que un enunciado sea verdadero.
- Puntuación ordinal (score): sitúa una entrada en una posición dentro de una escala ordenada.
- Procesamiento de imágenes: acepta imágenes con texto gracias a la torre de visión conservada del modelo base (requiere arrancar surogate con `--vision`).
- Contexto largo: hasta 262.000 tokens, apto para estados extensos en texto o datos estructurados.
- Modo thinking opcional por petición: razonamiento de hasta 512 tokens cuando la confianza de la primera pasada es inferior a 0,7.
- Calibración ajustable: la temperatura de decisión modifica las probabilidades devueltas sin alterar la opción elegida.
- Clasificación de texto: el pipeline declarado en HuggingFace es `text-classification`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada (el área Tools & Automation del índice mide tareas de automatización, no agentes autónomos).
- Soporte multilingüe: no disponible; la model card no enumera idiomas.

## Casos de uso

- Enrutado de peticiones en producción: dado un mensaje de entrada y un conjunto de intents o handlers, Rune devuelve el más probable con su probabilidad en una sola pasada de 0,2 s, lo que permite descartar respuestas de baja confianza o derivarlas al modo thinking.
- Moderación y clasificación de contenido: formular la política como preguntas de tipo noul ("¿este texto incumple la norma X?") y usar la probabilidad devuelta como umbral ajustable, con la ventaja de poder recalibrar la temperatura sin cambiar las decisiones.
- Evaluación automática de respuestas (LLM-as-a-judge acotado): plantear la comparación como una elección entre respuestas candidatas y usar la distribución de probabilidad para ordenar variantes, aprovechando el contexto de 262k para incluir rúbricas y ejemplos largos.
- Encuestas y anotación a escala: el formato score permite mapear texto libre a escalas ordinales (satisfacción, urgencia, calidad), con 0,2 s por elemento en una sola pasada, adecuado para lotes de decenas de miles de peticiones.
- Extracción de decisiones sobre documentos extensos: al aceptar 262k tokens, se puede introducir un contrato o informe completo más una pregunta cerrada y obtener una clasificación calibrada sin trocear el documento.
- Selección entre variantes de generación en un pipeline creativo: para cada prompt se generan N candidatos y el modelo decide cuál encaja mejor con el brief, usado como filtro previo a la revisión humana.
- Automatización con entrada visual: clasificación de capturas, formularios escaneados o interfaces (estado del mundo en imagen + pregunta + opciones), activando `--vision` en surogate.
- Detección de fraude o riesgo en tiempo real: formulación como pregunta binaria con probabilidad, integrable en un motor de reglas que actúe cuando la confianza supere un umbral previamente calibrado a temperatura 2.

## Benchmarks y rendimiento

Los datos publicados corresponden a la Decision Index 0.2.1 (suite 0.2: 151.034 peticiones de 44 benchmarks, panel de 38 benchmarks; cada benchmark se reescala para que el azar puntúe 0). Puntuaciones de skill en %, publicadas el 26 de septiembre de 2026:

| Sistema | Indice | Raw | Knowledge & Reasoning | Language | Retrieval & Classification | Tools & Automation | Arts & Human Taste |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Surogate Rune v3, `thinking: true` (bf16) | 59.2* | | 48.0 | 64.0 | 64.7 | 72.4 | 41.3 |
| Jev 1.13 | 57.89 | 68.08 | 51.3 | 62.0 | 55.4 | 75.1 | 37.7 |
| Surogate Rune v3 (bf16) | 57.44 | 67.30 | 43.4 | 63.1 | 63.5 | 71.2 | 41.9 |
| AutoJev-27B | 56.40 | 66.89 | 40.9 | 63.5 | 54.9 | 79.3 | 39.4 |
| simple-jev (Qwen3.8-27B) | 55.74 | 66.26 | 36.6 | 62.1 | 63.2 | 76.2 | 36.5 |
| Decider chat (Qwen3.6-27B) | 51.35 | 63.06 | 37.0 | 57.1 | 52.2 | 71.4 | 35.1 |
| Winnow-12B (Q8_0) | 50.02 | 61.91 | 33.8 | 56.0 | 54.0 | 71.0 | 30.0 |
| JoshuaSP diffusiongemma (26B-A4B) | 49.47 | 61.28 | 32.7 | 53.5 | 58.4 | 70.2 | 26.7 |
| Jevfire | 49.37 | 61.63 | 30.5 | 53.3 | 56.2 | 72.3 | 32.2 |
| Decider 35B-A3B (NVFP4) | 47.11 | 59.72 | 31.8 | 55.5 | 54.7 | 56.5 | 32.6 |

\* Estimación del autor, todavía no incorporada al leaderboard: los scores por benchmark de la edición 0.2.1 para Rune v3, desplazados por el efecto del modo thinking medido con el scorer oficial 0.2.

Calibración, medida sobre los 33 benchmarks de Decision Index con respuesta correcta o incorrecta por campo (cada benchmark ponderado por igual, todas las peticiones):

| Temperatura de decisión | Precisión | Confianza media | ECE | Brier |
|---|---|---|---|---|
| 1 (por defecto) | 73,9% | 86,4% | 12,5% | 0,385 |
| 2 | 73,9% | 73,6% | 2,2% | 0,360 |

Datos adicionales de rendimiento: en la edición 0.2 de Decision Index (40 benchmarks, media simple de áreas) Rune v3 obtuvo 53,39, y 54,89 con thinking, frente a 51,67 de Jev 1.13. Con thinking, las mayores ganancias en puntos de skill son GSM8K +15,2, CRUXEval +11,4, CLadder +10,4, BBH +8,0 y PhishNChips +5,1; ForecastBench pierde 9,8 porque el razonamiento vuelve más extremas las probabilidades. No hay resultados publicados de MMLU, HumanEval ni GSM8K en formato generativo en la información disponible.

## Requisitos de hardware

- Pesos en bfloat16: 25.805.936.206 parámetros y un repositorio de 51,6 GB, por lo que la inferencia en bf16 requiere del orden de 52 GB de memoria solo para los pesos.
- Memoria para caché KV con contexto de 262.000 tokens: no disponible.
- GPU recomendadas: el autor no publica una lista. Por tamaño, el despliegue bf16 no cabe en tarjetas de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) y encaja en A100 80 GB o H100 80 GB; en configuraciones multi-GPU, el reparto es posible pero no está documentado.
- Viabilidad en GPU de consumo: solo mediante cuantización. El autor no publica builds GGUF de v3 (los GGUF de Rune v1 quedaron en el historial del repositorio), por lo que no hay cifras oficiales de VRAM en 4 u 8 bits; cualquier estimación al respecto es aproximada y no verificada.
- El hecho de activar solo 8 de 128 expertos por token reduce el cómputo por token, pero no la memoria necesaria, que sigue viniendo determinada por los parámetros totales.
- Opciones de despliegue: motor surogate (endpoint de decisiones, con flags `--decision-temperature` y `--vision`), que es el recomendado por el autor por implementar el protocolo de entrenamiento; transformers mediante `Gemma4ForConditionalGeneration`; llama.cpp u Ollama solo para los GGUF de v1. Soporte en vLLM o TGI: no disponible.
- Latencia: 0,2 s por decisión sin thinking y aproximadamente 5 s cuando la pregunta activa thinking (datos del autor). Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Indice (0.2.1) | Knowledge & Reasoning | Tools & Automation | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Rune 26B-A4B v3 | 25,8B totales, 8/128 expertos activos | 57,44 (59,2 estimado con thinking) | 43,4 (48,0 con thinking) | 71,2 (72,4 con thinking) | apache-2.0 | safetensors bf16 en HuggingFace |
| Jev 1.13 | no disponible | 57,89 | 51,3 | 75,1 | no disponible | no disponible |
| AutoJev-27B | 27B (nominal) | 56,40 | 40,9 | 79,3 | no disponible | no disponible |
| simple-jev (Qwen3.8-27B) | 27B (nominal) | 55,74 | 36,6 | 76,2 | no disponible | no disponible |
| Decider 35B-A3B (NVFP4) | 35B totales, 3B activos | 47,11 | 31,8 | 56,5 | no disponible | no disponible |

Rune v3 destaca sobre todo en Retrieval & Classification (63,5) y Arts & Human Taste (41,9) dentro del panel comparado, mientras que Jev 1.13 y AutoJev-27B le superan en Knowledge & Reasoning y en Tools & Automation. La ventaja de Rune v3 se amplía con thinking activado, hasta una estimación de 59,2 de índice. Para el resto de alternativas no se dispone de parámetros, contexto ni licencia en la información proporcionada.

## Limitaciones y advertencias

- Sobreconfianza por defecto: a temperatura 1 la precisión es del 73,9% con una confianza media del 86,4%, lo que da un ECE de 12,5%. Para usar las probabilidades como umbrales hay que servir el modelo con `--decision-temperature 2` (ECE 2,2%), sin que ello cambie la opción elegida.
- Riesgo de alucinación: al ser un modelo de decisión, el error se manifiesta como elección incorrecta con probabilidad alta, no como texto inventado, pero el efecto práctico en un pipeline automático es comparable. El índice cuenta las peticiones sin responder como incorrectas.
- El modo thinking no está disponible junto con imágenes, según la model card.
- El modo thinking multiplica la latencia (de 0,2 s a unos 5 s por pregunta) y degrada las tareas cuyas respuestas son probabilidades: ForecastBench pierde 9,8 puntos de skill.
- Idiomas soportados: no disponibles. No hay confirmación de cobertura multilingüe ni de comportamiento fuera del inglés.
- Restricciones de licencia: el repositorio declara apache-2.0, pero el modelo base es google/gemma-4-26B-A4B-it, distribuido por Google bajo su propia licencia; conviene verificar las condiciones aplicables al uso comercial antes de desplegarlo en producción.
- Ecosistema limitado: el autor recomienda su propio motor (surogate) porque implementa el protocolo de entrenamiento; otros runtimes pueden no reproducir exactamente el comportamiento del endpoint de decisiones. No hay builds GGUF de la versión v3 publicados.
- Métricas y estado: el modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, con fechas de creación y actualización de septiembre de 2026. La puntuación de 59,2 con thinking es una estimación del propio autor, no verificada por el leaderboard.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre la Decision Index: los enlaces recuperados corresponden a cursos de programación en Java y no guardan relación con el contenido de esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/michaelfeil/rune-26b-a4b
- Repositorio GGUF de Rune v1 (historial): https://huggingface.co/surogate/rune-26b-a4b-GGUF/tree/2a155046d99949c8d8b413e213a78b4dc724dcb6
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Motor de entrenamiento y servicio surogate: https://github.com/invergent-ai/surogate
- Blog de lanzamiento: https://invergent.ai/blog/rune/
- Web de Invergent: https://invergent.ai
- Decision Index (leaderboard): https://huggingface.co/spaces/multimodalart/jev-decision-index
