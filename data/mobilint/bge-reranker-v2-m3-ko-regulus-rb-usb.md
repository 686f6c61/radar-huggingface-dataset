# mobilint/bge-reranker-v2-m3-ko-regulus-rb-usb

## Resumen

`mobilint/bge-reranker-v2-m3-ko-regulus-rb-usb` es un reranker de tipo cross-encoder derivado de `dragonkue/bge-reranker-v2-m3-ko`, compilado y cuantizado por Mobilint para ejecutarse en su acelerador NPU `regulus-rb-usb` (placa USB). No es un modelo de propósito general: es un artefacto de despliegue que traslada el encoder y la cabeza de clasificación al hardware NPU, dejando en el host únicamente la consulta de embeddings (tokenizador). Su función es puntuar pares (consulta, documento) con una logística sobre el logit de salida, devolviendo una relevancia entre 0 y 1.

El modelo resuelve el paso de reordenación (reranking) en pipelines de recuperación de información (RAG, búsqueda semántica, question answering), y resulta relevante porque demuestra la viabilidad de ejecutar cross-encoders de 264 millones de parámetros sobre NPU de borde con contextos de hasta 8.192 tokens y una fidelidad numérica prácticamente idéntica al modelo base en fp32. La arquitectura subyacente es XLM-RoBERTa (transformer encoder) adaptada a la tarea de clasificación de pares, con pesos en 8 bits y activaciones en 16 bits.

Está pensado para entornos con hardware Mobilint REGULUS; fuera de ese entorno no es utilizable de forma directa, ya que requiere el runtime propietario `transformers-mblt` y el driver de la placa. Su licencia Apache 2.0 permite uso comercial, y el soporte de coreano e inglés (con calibración multilingüe en 11 idiomas) lo orienta a sistemas de búsqueda bilingües o asiáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo XLM-RoBERTa (cross-encoder para reranking), con cabeza de clasificación binaria |
| Parametros totales | 264.395.776 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por secuencia |
| Tipos de cuantizacion | Pesos 8 bits, activaciones 16 bits; cuantización post-entrenamiento (PTQ) calibrada; compilador qbcompiler 1.4.1 |
| Idiomas soportados | Coreano (ko) e inglés (en); calibración con pasajes en 11 idiomas (ar, de, en, es, fr, it, ja, ko, pt, ru, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,4 GB), con código custom (`proxy_xlm_roberta.py`) y runtime `transformers-mblt` |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa que recibe el par (consulta, documento) como una única secuencia y produce un logit de relevancia, transformado mediante sigmoide en una puntuación entre 0 y 1. La innovación no está en la arquitectura, heredada del modelo base `dragonkue/bge-reranker-v2-m3-ko`, sino en el proceso de compilación: el encoder y la cabeza de clasificación se cuantizan a 8 bits (pesos) y 16 bits (activaciones) mediante PTQ y se compilan para la NPU `regulus-rb-usb`; el lookup de embeddings se ejecuta en el host. El runtime solo soporta el modo `single` (una consulta por llamada), y cada secuencia de un lote se procesa de forma independiente, sin relleno.

La calibración se realizó sobre 1.072 pares (consulta, pasaje) con 479.663 tokens en total: 1.024 pares cortos de hasta 256 tokens (464 coincidentes, 280 negativos duros y 280 negativos aleatorios, 64 de ellos cruzando coreano e inglés) y 48 pares largos de 2.048 a 8.192 tokens (24 en coreano, 24 en inglés; 24 coincidentes y 24 negativos duros), que concentran aproximadamente la mitad de los tokens. Las fuentes de calibración incluyen KLUE-MRC (29,9%), SQuAD (26,9%), pasajes de FineWeb/FineWeb-2 en 11 idiomas (32,8%), negativos cruzados coreano-inglés (6,0%) y MLDR (4,5%). No se menciona RLHF ni DPO; es un ajuste supervisado heredado del modelo base y una cuantización posterior.

## Capacidades

- Puntuación de relevancia de pares (consulta, documento) mediante cross-encoder, con salida sigmoide en el rango [0, 1].
- Reranking de listas de candidatos: reordena los resultados de un recuperador (embedder) según la relevancia fina.
- Soporte de secuencias largas de hasta 8.192 tokens, útil para pasajes extensos o documentos completos.
- Capacidad bilingüe coreano-inglés, con calibración que incluye pares cruzados entre ambos idiomas.
- Procesamiento por secuencia individual (modo `single`), sin relleno entre elementos del lote.
- Ejecución determinista: la misma entrada produce siempre la misma salida (verificado en más de 17.000 llamadas).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido; es exclusivamente un clasificador de pares.

## Casos de uso

- **Reranking en pipelines RAG**: tras recuperar los 50-100 documentos candidatos con un embedder, el modelo reordena el top-10 con una puntuación de relevancia más precisa; el contexto de 8.192 tokens permite incluir fragmentos largos sin truncar.
- **Búsqueda semántica bilingüe coreano-inglés**: en un buscador corporativo con documentación en ambos idiomas, el modelo puntúa pares cruzados (consulta en coreano, documento en inglés y viceversa) gracias a la calibración con negativos cross-language.
- **Question answering sobre documentos largos**: para preguntas sobre artículos extensos, el modelo procesa pasajes de hasta 8.192 tokens y selecciona el fragmento correcto, con una tasa de acierto top-1 del 96,3% en el conjunto de QA de evaluación.
- **Atención al cliente automatizada con base de conocimiento**: el modelo clasifica la relevancia de artículos de soporte (por ejemplo, manuales de mantenimiento de vehículos) frente a la consulta del usuario, filtrando respuestas irrelevantes antes de pasarlas al generador.
- **Recuperación en NPU de borde**: en despliegues con hardware Mobilint REGULUS (por ejemplo, kioscos o dispositivos locales), el modelo ejecuta el reranking sin GPU dedicada, con latencias de 0,18 s para 256 tokens y 1,13 s para 1.024 tokens.
- **Filtrado de duplicados y negativos duros en datasets**: el modelo puede puntuar pares para identificar negativos duros o pasajes casi duplicados en la construcción de conjuntos de entrenamiento para recuperadores.
- **Moderación de contenido basada en relevancia**: dado un conjunto de políticas o fragmentos normativos, el modelo puntúa qué fragmento es más relevante para un texto de entrada, apoyando la clasificación de casos.

## Benchmarks y rendimiento

Los datos disponibles son de fidelidad frente al modelo base en fp32 sobre CPU, medidos en una placa `regulus-rb-usb` de un solo core. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque no aplican a un reranker.

| Metrica | Resultado |
|---|---|
| Correlación de Pearson de logits con fp32 / error absoluto medio | 0,9984 / 0,094 |
| Spearman con el orden fp32 (todas las listas / question answering) | 0,940 / 0,895 |
| Top-1 idéntico a fp32 / solapamiento top-3 | 0,975 / 0,949 |
| Pasaje correcto primero, QA [0,970] / multilingüe [0,905] | 0,963 / 0,900 |
| nDCG@10 de reranking, Ko-StrategyQA [0,779] / NFCorpus [0,322] / SciFact [0,705] | 0,778 / 0,322 / 0,707 |
| Conjunto largo, 1.024 tokens: top-1 idéntico a fp32 / documento correcto primero [0,775] | 0,975 / 0,750 |
| Conjunto largo, 2.048 tokens [0,825] | 1,00 / 0,825 |
| Conjunto largo, 4.096 tokens [0,925] | 1,00 / 0,925 |
| Conjunto largo, 6.144 y 8.192 tokens (6 listas cada uno): top-1 idéntico a fp32 | 1,00 / 1,00 |

Tiempos por par en `regulus-rb-usb` (segundos, según longitud en tokens):

| Longitud (tokens) | 256 | 512 | 1.024 | 2.048 | 4.096 | 6.144 | 8.192 |
|---|---|---|---|---|---|---|---|
| Tiempo (s) | 0,18 | 0,41 | 1,13 | 3,65 | 12,6 | 26,7 | 46,4 |

## Requisitos de hardware

- Requiere una placa Mobilint REGULUS USB (`regulus-rb-usb`) con su driver correspondiente; no es ejecutable en GPU convencional ni en CPU de forma directa.
- Dependencia de software: `pip install "transformers-mblt>=0.8.0"`, que instala `mobilint-qb-runtime` (probado con qbruntime 1.5.3); el modelo se carga tras `transformers_mblt.register()` o con `trust_remote_code=True`.
- No cabe en GPUs de consumo (RTX 4090, etc.) porque el artefacto está compilado para la NPU; el modelo base en fp32 sí podría ejecutarse en GPU, pero esta build no.
- Despliegue únicamente mediante el stack de Mobilint; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,18 s por par de 256 tokens y 46,4 s por par de 8.192 tokens en la placa USB.
- El runtime corta por defecto las llamadas de más de 10 segundos (`Model_NotAlive`), lo que afecta a pares de más de unos 3.000 tokens; para secuencias largas hay que ajustar `QBRUNTIME_NPU_TIMEOUT_MS` (por ejemplo, `60000` para 8.192 tokens) antes de cargar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| `mobilint/bge-reranker-v2-m3-ko-regulus-rb-usb` | 264,4 M | 8.192 | Apache 2.0 | NPU Mobilint REGULUS | Pesos 8 bits, activaciones 16 bits; solo modo single; fidelidad fp32 ~0,998 |
| `dragonkue/bge-reranker-v2-m3-ko` (modelo base) | 264,4 M (aprox.) | no disponible en la información | Apache 2.0 | CPU/GPU | Modelo fp32 de referencia; sin cuantización |
| `mobilint/bge-reranker-v2-m3-ko` | no disponible | no disponible | Apache 2.0 | NPU `aries-rb` | Misma build para otra placa; puntuaciones equivalentes dentro del ruido |

No se dispone de datos de benchmarks comparativos con otros rerankers de la misma categoría (por ejemplo, BGE-reranker-v2-m3 original, Cohere Rerank o Jina Reranker) en la información proporcionada.

## Limitaciones y advertencias

- **Dependencia de hardware propietario**: el modelo solo funciona en la placa `regulus-rb-usb` con el runtime `transformers-mblt`; no es portable a otros entornos sin recompilación.
- **Modo single únicamente**: no soporta procesamiento por lotes real; cada secuencia se ejecuta de forma independiente, lo que limita el throughput en comparación con implementaciones GPU.
- **Timeout por defecto**: las llamadas de más de 10 segundos (pares de más de ~3.000 tokens) fallan con `Model_NotAlive` salvo que se configure `QBRUNTIME_NPU_TIMEOUT_MS`.
- **Cuantización**: aunque la fidelidad es alta (Pearson 0,9984), el Spearman de 0,940 indica que candidatos con puntuaciones casi iguales pueden intercambiar posiciones; el top-1 es estable, pero el orden fino no es idéntico al fp32.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero el modelo puede asignar puntuaciones altas a pasajes léxicamente similares pero semánticamente irrelevantes; debe combinarse con umbrales y validación.
- **Cobertura idiomática**: aunque la calibración incluye 11 idiomas, el modelo está entrenado y validado principalmente para coreano e inglés; el rendimiento en otros idiomas no está documentado.
- **Sesgos**: no se han publicado análisis de sesgos; al derivar de un modelo entrenado con datos web (FineWeb), puede heredar sesgos de esos corpus.
- **Licencia**: Apache 2.0 permite uso comercial, pero el uso del runtime y el hardware Mobilint puede estar sujeto a condiciones adicionales del fabricante.
- **Fecha de creación**: el repositorio figura creado en 2026-11-17, lo que puede indicar una build reciente con poca validación externa (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/bge-reranker-v2-m3-ko-regulus-rb-usb
- Modelo base: https://huggingface.co/dragonkue/bge-reranker-v2-m3-ko
- Build para placa `aries-rb`: https://huggingface.co/mobilint/bge-reranker-v2-m3-ko
- Web de Mobilint: https://mobilint.com
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
