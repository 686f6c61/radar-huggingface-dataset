# NeosQ/Spark-X2.6-4B-heretic-tool

## Resumen

Spark-X2.6-4B-heretic-tool es una modificación comunitaria del modelo XHToken/Spark-X2.6-4B, desarrollada por el usuario NeosQ. Se trata de una versión con las negativas (refusals) suprimidas mediante abliteration, pero que además conserva la capacidad de decidir cuándo *no* debe invocar una herramienta. El problema que aborda es concreto: la abliteration elimina las negativas del modelo, pero en este caso también destruye la tendencia a declinar peticiones que no encajan con las funciones disponibles, lo que degrada gravemente la métrica de irrelevancia en tool calling.

La solución propuesta combina dos etapas: una abliteration con Heretic v2.1.0 y el modificador ARA (Arbitrary-Rank Ablation), seguida de un ajuste supervisado con LoRA sobre 1000 ejemplos equilibrados de uso de herramientas. El resultado es un modelo que mantiene 0 negativas sobre 100 prompts dañinos y recupera la precisión de irrelevancia de BFCL v4 hasta 87,9, partiendo de 62,9 en el modelo base y de 18,8 en el checkpoint intermedio solo ablacionado.

Arquitectónicamente es un transformer denso de 4.112.079.360 parámetros, 36 capas, dimensión oculta 2560 y vocabulario de 131072 tokens con embeddings atados. Se distribuye en safetensors BF16 en dos shards (~7,7 GiB) y licencia Apache-2.0. Es relevante ahora porque documenta de forma rigurosa un compromiso técnico poco discutido: cómo la abliteration afecta a capacidades estructuradas como el tool calling y por qué el SFT es un complemento necesario, no un parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM, transformer denso, 36 capas, hidden 2560, vocab 131072, tied embeddings |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, BF16, 2 shards (~7,7 GiB) |

## Arquitectura y entrenamiento

El modelo parte de XHToken/Spark-X2.6-4B, un transformer denso de tipo `Spark2_5ForCausalLM` con 36 capas, dimensión oculta 2560 y vocabulario de 131072 tokens con embeddings atados. El proceso de modificación consta de dos etapas. La primera es una abliteration realizada con Heretic v2.1.0 usando el modificador ARA (Arbitrary-Rank Ablation), que modifica los pesos en el espacio de pesos y exporta el checkpoint completo. Esta etapa optimiza la tasa de negativas frente a la corrección de respuestas y produce un checkpoint intermedio denominado `Spark-X2.6-4B-heretic-math`, que alcanza 0/100 negativas pero colapsa la métrica de irrelevancia de BFCL de 62,9 a 18,8.

La segunda etapa es un ajuste supervisado con LoRA (r=16, α=32) sobre 1000 ejemplos de uso de herramientas exactamente equilibrados, todos renderizados con el system prompt propio de BFCL para que entrenamiento y evaluación compartan formato. Los adaptadores se fusionan en los pesos, por lo que no se necesita adapter en inferencia. La mitad de los ejemplos son casos que deben declinar (procedentes de `BFCL_v4_live_irrelevance`), con el objetivo de enseñar la discriminación `if request ∈ capabilities(functions) then call else explain`. El autor documenta que cuatro estudios ARA distintos fracasaron al intentar resolver el problema solo con abliteration, porque BFCL cuenta como abstención válida una respuesta que no puede parsear, lo que premia la salida malformada.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Tool calling y function calling estructurado, con soporte para las categorías de BFCL v4 (llamadas simples, paralelas, múltiples y paralelas múltiples).
- Discriminación de irrelevancia: el modelo identifica cuándo ninguna función suministrada satisface la petición y responde con una explicación de una frase en lugar de emitir una llamada.
- Razonamiento matemático básico (GSM8K 83,3) y generación de código (HumanEval pass@1 73,3).
- Seguimiento de instrucciones (IFEval prompt strict 72,0).
- Ausencia de negativas ante prompts dañinos (0/100), fruto de la abliteration.
- No se documentan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso con agentes autónomos.

## Casos de uso

- Enrutamiento de herramientas en asistentes: el modelo decide si debe invocar una función o responder que no puede, gracias a la métrica de irrelevancia recuperada (87,9 en BFCL v4), lo que evita llamadas espurias en producción.
- Pipelines de function calling en producción: soporta las cuatro categorías de llamada de BFCL con una media de 86,5, adecuado para integrarse en orquestadores que necesitan llamadas paralelas y múltiples con argumentos correctos.
- Generación de código asistida: con HumanEval pass@1 de 73,3 puede integrarse en flujos de autocompletado o revisión de parches, aunque sin garantías de corrección en contextos largos.
- Razonamiento matemático de apoyo: GSM8K de 83,3 lo hace útil para resolver problemas aritméticos de varios pasos en entornos educativos o de validación.
- Investigación sobre abliteration y seguridad: sirve como caso de estudio reproducible de cómo la eliminación de direcciones de negativa afecta a capacidades estructuradas y de cómo el SFT puede complementar el proceso.
- Evaluación comparativa de robustez en tool calling: útil para medir la degradación de la discriminación de irrelevancia entre checkpoints ablacionados y ajustados.
- Asistentes bilingües inglés-chino: cubre conversación y tool calling en ambos idiomas, aunque no se documenta calidad por idioma.

## Benchmarks y rendimiento

| Benchmark | Base | `-heretic-math` | Este modelo |
|---|---|---|---|
| Negativas (100 prompts dañinos) | 99 | 5 | 0 |
| BFCL v4 irrelevance | 62,9 | 18,8 | 87,9 |
| BFCL v4 — media de 4 categorías de llamada | 83,8 | 86,1 | 86,5 |
| BFCL v4 — media de 5 categorías | 79,6 | 72,7 | 86,8 |
| IFEval (prompt strict) | 76,5 | 71,5 | 72,0 |
| GSM8K | 86,7 | 86,7 | 83,3 |
| HumanEval pass@1 | 70,0 | 71,7 | 73,3 |

El autor señala además que, con una regla estricta que cuenta cualquier sintaxis de llamada como llamada, la irrelevancia pasa de 54,2 a 16,2 en el checkpoint intermedio, lo que confirma que la caída es un cambio de comportamiento real y no un artefacto de puntuación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 10-12 GB.
- En cuantización de 8 bits cabría en GPUs de 8 GB; en 4 bits, en torno a 3 GB de pesos, aunque el autor no publica cuantizaciones oficiales.
- GPUs recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia BF16 sin problemas.
- Cabe en GPUs de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores en BF16; en GPUs de 8 GB requeriría cuantización no publicada.
- Opciones de despliegue: transformers (librería declarada), con posible uso de vLLM o TGI si se valida el soporte de `custom_code`; llama.cpp/Ollama no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v4 irrelevance | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeosQ/Spark-X2.6-4B-heretic-tool | 4,11 B | no disponible | 87,9 | Apache-2.0 | Hugging Face |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | no disponible | 62,9 | Apache-2.0 | Hugging Face |
| Spark-X2.6-4B-heretic-math | 4,11 B | no disponible | 18,8 | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos de 4B con tool calling para una comparación más amplia en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina las negativas de seguridad: 0/100 en prompts dañinos, lo que lo hace inadecuado para aplicaciones que requieran filtrado de contenido sin capas adicionales.
- Riesgo de alucinación no evaluado específicamente; el autor no publica métricas de factualidad.
- La ventana de contexto no está documentada, lo que impide planificar despliegues con conversaciones largas.
- Solo se declaran inglés y chino; no hay evaluación de calidad por idioma ni soporte de otros idiomas.
- El ajuste LoRA se entrenó con el system prompt de BFCL, por lo que el comportamiento de tool calling puede degradarse fuera de ese formato.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es una modificación comunitaria no avalada por el equipo de XHToken/SparkLLM.
- La caída de GSM8K (86,7 a 83,3) y de IFEval (76,5 a 72,0) respecto al base indica un pequeño coste en razonamiento e instrucciones.
- El modelo depende de `custom_code` y de transformers 5.22.2; la compatibilidad con otras versiones o frameworks no está garantizada.
- El autor advierte que el SFT no corrige el compromiso de seguridad de la abliteration, solo la capacidad de juicio sobre herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeosQ/Spark-X2.6-4B-heretic-tool
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Model card en chino: https://huggingface.co/NeosQ/Spark-X2.6-4B-heretic-tool/blob/main/README_zh.md
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset gorilla-llm/Berkeley-Function-Calling-Leaderboard: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
