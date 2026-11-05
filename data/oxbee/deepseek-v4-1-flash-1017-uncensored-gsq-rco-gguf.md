# OxBee/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF derivada del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario OxBee sobre el trabajo de cuantización de ISTA-DASLab y la edición de "abliteration" de AtomicChat. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 763 mil millones de parámetros nominales (384 expertos) y 551.880.949.208 parámetros totales según los safetensors del repositorio. La variante aquí descrita elimina la dirección de rechazo (refusal direction) de los tensores densos que escriben en el residual, conservando intactos los expertos enrutados tal como los entregó ISTA-DASLab.

El interés de esta ficha radica en que combina tres capas de transformación: la cuantización GSQ-RCO de ISTA-DASLab (con redondeo de baja precisión aprendido para los expertos), la edición de abliteración de AtomicChat (proyección de la dirección de rechazo con fuerza 2.0 aplicada a `attn_output_b`, `ffn_down_shexp` y `engram_wkv`) y el empaquetado GGUF en varios niveles de bits por peso (IQ1_M, IQ2_XXS, IQ2_XS). El resultado es un modelo "sin rechazos" que, según las mediciones del autor, preserva el rendimiento en tareas de razonamiento (GPQA-Diamond y AIME25) mientras reduce a cero las tasas de jailbreak en los conjuntos evaluados.

La relevancia actual es doble: por un lado, demuestra que es posible servir un modelo de 763B en una sola GPU de 12 GB mediante el motor Strata, que mantiene el backbone en memoria del sistema y transmite la tabla Engram de 110 GB desde un SSD; por otro, documenta con métricas concretas (JailbreakBench, XSTest, MMLU, KL de divergencia) el coste de la edición de abliteración sobre la distribución del modelo. La licencia es MIT y el repositorio ocupa 414,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, expertos compartidos y tabla Engram (según la model card) |
| Parámetros totales | 551.880.949.208 (según safetensors); la model card cita 763B nominales |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en niveles IQ1_M (1,75 bpw), IQ2_XXS (2,0 bpw) e IQ2_XS (2,25 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards), más un fichero Engram separado de ~110 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 384 expertos enrutados, expertos compartidos y una tabla Engram que actúa como memoria de consulta (lookup table) de aproximadamente 110 GB. La model card describe que los expertos enrutados conservan el redondeo de baja precisión aprendido por GSQ (GSQ-RCO), mientras que los tensores densos que escriben en el residual (salida de atención `attn_output_b`, proyección descendente del experto compartido `ffn_down_shexp` y proyección de valores Engram `engram_wkv`) han sido reemplazados por versiones editadas a plena precisión y luego cuantizados al tipo por tensor exacto de ISTA.

La edición de abliteración consiste en proyectar fuera la dirección de rechazo de DeepSeek con fuerza 2.0, aplicada únicamente a esos tensores densos. No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF o DPO en el modelo original; esos datos corresponden a DeepSeek y no se reproducen aquí. La innovación técnica destacable es la preservación byte a byte de los expertos enrutados, lo que permite que cada fichero mantenga el mismo tamaño y se ejecute donde se ejecuta el original, además del uso de Strata para servir el modelo con el backbone en RAM y la tabla Engram en streaming desde SSD.

## Capacidades

- Generación de texto conversacional y de razonamiento de varios pasos, con modo "thinking" (la model card mide "Thinking high" sobre 30 preguntas).
- Razonamiento científico y matemático: los benchmarks reportados incluyen GPQA-Diamond y AIME25.
- Conocimiento general evaluado con MMLU (500 preguntas).
- Comportamiento sin rechazos: la edición elimina las negativas de forma transversal a temas, no solo en un subconjunto.
- Ejecución en hardware de consumo mediante el motor Strata, con un solo GPU de 12 GB.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible` en HuggingFace).
- No hay información disponible sobre tool calling, function calling, capacidades multilingües, visión o audio.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como referencia para medir el efecto de proyectar la dirección de rechazo sobre un MoE de gran tamaño, con métricas de KL y de precisión en tareas publicadas en el repositorio de métricas.
- Evaluación de robustez de clasificadores de rechazo: los resultados de JailbreakBench (85,2% → 0,0% en IQ2_XXS) y XSTest permiten estudiar cómo los clasificadores que leen solo el inicio de la respuesta dejan pasar rechazos suaves posteriores.
- Despliegue local de un modelo de 763B en una estación de trabajo: con Strata, el backbone reside en RAM y la tabla Engram de 110 GB se transmite desde un SSD, lo que permite probar un modelo de esta escala en una máquina con GPU de 12 GB.
- Generación de texto sin filtrado para entornos de investigación controlados: útil para estudiar la distribución del modelo sin la capa de rechazo, siempre con las advertencias de la sección de limitaciones.
- Comparación de cuantizaciones: los tres niveles IQ1_M, IQ2_XXS e IQ2_XS permiten medir el compromiso entre tamaño en disco (231, 249 y 266 GB) y precisión en MMLU (80,6%, 82,8% y 81,6% respectivamente).
- Reproducción de benchmarks de razonamiento en cuantizaciones agresivas: GPQA-Diamond (83,3%) y AIME25 (76,7% → 80,0%) sobre el rung IQ2_XXS permiten validar que la edición no degrada la precisión de tarea.

## Benchmarks y rendimiento

Datos de la model card, comparando el rung estándar GSQ-RCO con esta versión editada:

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (safe refused) | Thinking high (30) | MMLU (500) | KL a stock |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

Razonamiento sobre el rung IQ2_XXS (Strata, reasoning effort 50):

| Benchmark | Stock GSQ-RCO | Uncensored (esta versión) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

El KL reportado es una cota inferior calculada con top-64 en el modo de puntuación teacher-forced de Strata, por lo que el KL real es algo mayor.

## Requisitos de hardware

- VRAM: la model card indica que el modelo corre en una sola GPU de 12 GB con Strata; el backbone reside en memoria del sistema y la tabla Engram (~110 GB) se transmite desde SSD.
- Almacenamiento: cada rung ocupa entre 231 GB (IQ1_M) y 266 GB (IQ2_XS); además hay que descargar el fichero Engram compartido de ISTA-DASLab (~110 GB), que no se rehostea en este repositorio.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU de 12 GB para el motor Strata.
- Cabe en GPU de consumo: sí, según el autor, con una GPU de 12 GB y Strata.
- Opciones de despliegue: Strata (motor declarado en la model card). La model card afirma explícitamente que estos ficheros no funcionan todavía en llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (OxBee / AtomicChat GSQ-RCO) | 551.880.949.208 (763B nominales) | no disponible | MIT | GGUF (IQ1_M, IQ2_XXS, IQ2_XS) | Edición de abliteración sobre expertos enrutados intactos |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | mismo backbone | no disponible | MIT | GGUF | Cuantización original sin edición de rechazo; sirve de referencia "stock" |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | mismo backbone | no disponible | MIT | GGUF | Misma edición de abliteración, empaquetado distinto |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B nominales | no disponible | no disponible | no disponible | Modelo base original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de una respuesta, por lo que un rechazo suave situado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos de forma transversal a todos los temas; no conserva un conjunto más estrecho de negativas.
- Con el modo thinking activado, la edición planifica una respuesta a una pregunta de rechazo (la model card corta la frase en este punto).
- Riesgo de alucinación: no se reportan métricas específicas de fidelidad o factualidad más allá de MMLU y GPQA-Diamond.
- Idiomas soportados: no disponible; no hay evidencia en la información proporcionada sobre cobertura multilingüe.
- Longitud de contexto: no disponible.
- Restricciones de licencia: licencia MIT, sin restricciones comerciales declaradas en la model card.
- Dependencia de infraestructura: los ficheros requieren Strata y no funcionan en llama.cpp según la model card; además exigen el fichero Engram de ISTA-DASLab en un SSD rápido junto a los shards.
- Los valores de KL son cotas inferiores (top-64), por lo que la divergencia real respecto al modelo stock es algo mayor que la reportada.
- No todos los rungs superaron todas las puertas de evaluación; los que no lo hicieron se publican tal cual, con sus números en la tabla y en el repositorio de métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base original (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de AtomicChat: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Motor Strata: https://github.com/Niko1221/Strata
- Atomic Chat: https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de Atomic Chat: https://x.com/atomic_chat_hq
