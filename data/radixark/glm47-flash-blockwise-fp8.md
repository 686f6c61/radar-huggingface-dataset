# RadixArk/glm47-flash-blockwise-fp8

## Resumen

GLM-4.7-Flash blockwise FP8 es una versión cuantizada del modelo zai-org/GLM-4.7-Flash, publicada por el usuario RadixArk. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a FP8 con granularidad de bloque: los pesos se almacenan en formato e4m3 con una escala por cada bloque de 128×128 y escalado dinámico de activaciones. El resultado ocupa aproximadamente la mitad que el original en BF16 (30 GiB frente a 58 GiB), lo que reduce de forma directa los requisitos de memoria para servir el modelo.

El modelo conserva la arquitectura del original, identificada en los metadatos como `glm4_moe_lite`, con 31.221.488.576 parámetros totales (unos 31,2 mil millones) y una capa MTP (multi-token prediction) que habilita decodificación especulativa. Los idiomas declarados son inglés y chino, la licencia es MIT (la misma que el modelo base de Z.ai) y los pesos se distribuyen en safetensors.

Su relevancia es fundamentalmente práctica: permite desplegar un modelo MoE de ~31B en hardware Hopper o Ada con SGLang, aplicando decodificación especulativa EAGLE, y con una pérdida de calidad medida y acotada en la tarea de referencia (GSM8K). El repositorio es muy reciente y tiene una adopción todavía mínima (15 descargas, 0 likes), por lo que debe tratarse como una conversión de terceros pendiente de validación comunitaria amplia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo MoE (etiqueta `glm4_moe_lite`), con capa MTP para decodificación especulativa |
| Parámetros totales | 31.221.488.576 (~31,2 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 e4m3 con una escala por bloque de 128×128 y escalado dinámico de activaciones en las capas lineales de atención, el MLP denso y todos los expertos enrutados y compartidos (incluida la capa MTP); BF16 en embeddings, `lm_head`, normas y router MoE |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 32,5 GB; ~30 GiB de pesos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base zai-org/GLM-4.7-Flash, marcada en los metadatos como `glm4_moe_lite`: un transformer con mezcla de expertos (MoE) y una capa MTP (multi-token prediction) que se utiliza como mecanismo de decodificación especulativa. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo original y no se incluyen en la información disponible.

Lo específico de esta publicación es el esquema de cuantización, no el entrenamiento. RadixArk aplica cuantización blockwise a FP8 e4m3: cada bloque de 128×128 pesos comparte una única escala y las activaciones se escalan de forma dinámica. Se mantienen en BF16 las partes más sensibles a la precisión: embeddings, `lm_head`, capas de normalización y el router del MoE. La capa MTP también se cuantiza a FP8, lo que permite seguir usando decodificación especulativa sobre los pesos cuantizados, según reporta el autor.

Existe una restricción estructural derivada del tamaño de bloque: con tensor parallelism de atención igual a 4, el shard de `kv_b_proj` por rango (2240 filas) no es múltiplo del bloque de 128 filas, por lo que el TP de atención debe ser 1 o 2. Para escalar a más GPUs, el autor recomienda DP attention combinado con expert parallelism.

## Capacidades

- Generación de texto y uso conversacional en inglés y chino, con etiqueta de pipeline `text-generation` y compatibilidad con el ecosistema `transformers`.
- Decodificación especulativa mediante la capa MTP integrada, validada con el algoritmo EAGLE en SGLang.
- Inferencia optimizada en SGLang con cuantización FP8 y escalado dinámico de activaciones.
- Soporte de expert parallelism y DP attention en configuraciones multipunto (por ejemplo, `tp-size 4 --dp-size 4 --enable-dp-attention --ep-size 4` con backend `moe-a2a-backend deepep`).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Razonamiento matemático básico: la única evaluación publicada es GSM8K 5-shot sobre el conjunto de test completo.
- Capacidades específicas del modelo base (tool calling, agentes, visión, modo thinking u otras) no están documentadas en la información proporcionada; hay que remitirse a la model card de zai-org/GLM-4.7-Flash.

## Casos de uso

- Servicio de chat bilingüe inglés-chino en producción: el modelo está etiquetado como conversacional y cubre ambos idiomas, por lo que puede alimentar un backend de asistente con SGLang y servir respuestas multi-turno a usuarios de esas dos comunidades lingüísticas.
- Reducción del coste de inferencia frente al BF16: al pasar de 58 GiB a ~30 GiB de pesos, un mismo clúster puede alojar aproximadamente el doble de réplicas o reducir el número de GPUs por réplica, manteniendo una pérdida de calidad medida de en torno a un punto en GSM8K.
- Aceleración mediante decodificación especulativa: la capa MTP permite usar EAGLE con 2 pasos especulativos, top-k 1 y 3 tokens de borrador, con una longitud media de aceptación de 2,41 tokens, lo que reduce el número de pasos de decodificación en tareas de generación larga.
- Despliegue en clústeres de más de dos GPUs: mediante DP attention con expert parallelism (`tp-size 4 --dp-size 4 --ep-size 4`) y `--cuda-graph-max-bs-decode 128`, orientado a escenarios de alto throughput con lotes de decodificación grandes.
- Validación de pipelines de cuantización: sirve como caso de estudio reproducible para comparar FP8 blockwise frente a BF16 en un MoE de ~31B, usando GSM8K 5-shot como referencia y midiendo la longitud de aceptación especulativa.
- Razonamiento aritmético y de problemas verbales en inglés: con un 0,809 en GSM8K 5-shot, es adecuado para asistentes educativos o de resolución de problemas matemáticos de nivel escolar, siempre con verificación posterior.
- Batch offline de generación de texto en inglés y chino: al ser pesos safetensors compatibles con `transformers`, se puede integrar en pipelines de procesamiento por lotes sin necesidad de servir un endpoint interactivo.

## Benchmarks y rendimiento

| Benchmark | Configuración | FP8 blockwise | BF16 (original) |
|---|---|---|---|
| GSM8K (5-shot, test completo) | SGLang con decodificación especulativa MTP | 0,809 | 0,819 |
| Longitud media de aceptación (decodificación especulativa) | SGLang con MTP | 2,41 | 2,43 |

No se han publicado otros resultados de benchmarks en la información disponible (MMLU, HumanEval, MMLU-Pro y similares no aparecen en la model card de esta conversión ni se detallan en los metadatos del repositorio).

## Requisitos de hardware

- Peso de los pesos: ~30 GiB en FP8 frente a los 58 GiB del BF16 original; el repositorio completo ocupa 32,5 GB.
- VRAM estimada para inferencia: alrededor de 30 GiB solo para pesos, más la caché KV y activaciones. Con contexto largo, la caché KV puede crecer de forma significativa; no se dispone del dato de longitud de contexto para calcularla con precisión.
- Número de GPUs: la configuración de referencia del autor usa `--tp-size 2`. Una sola GPU de 80 GB podría alojar los pesos, pero el ejemplo publicado asume 2 GPUs.
- GPU recomendadas: H100/H200 (Hopper) para aprovechar los kernels FP8, y GPUs Ada (L40S) como alternativa; Blackwell también soporta FP8. La cuantización FP8 en `transformers` requiere normalmente capacidad de cómputo 8.9 o superior.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090), ya que solo los pesos superan esa cifra. En una GPU de 32 GB el ajuste sería muy justo y requeriría kernels FP8 compatibles.
- Restricción de paralelismo: el tensor parallelism de atención debe ser 1 o 2; con TP=4 el shard de `kv_b_proj` (2240 filas) no es múltiplo del bloque de 128 filas. Para más GPUs hay que usar DP attention con `--enable-dp-attention` y expert parallelism.
- Opciones de despliegue: SGLang (opción documentada por el autor), con soporte de decodificación especulativa EAGLE; al ser safetensors y `transformers`, también es compatible con otros servidores que soporten FP8, aunque no se documentan en la model card.
- Latencia y throughput: no disponibles. El único dato de rendimiento publicado es la longitud media de aceptación especulativa (2,41).

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Tamaño de pesos | GSM8K 5-shot | Licencia |
|---|---|---|---|---|---|
| RadixArk/glm47-flash-blockwise-fp8 | 31,2 mil millones | FP8 e4m3 blockwise (128×128) | ~30 GiB | 0,809 | MIT |
| zai-org/GLM-4.7-Flash (base) | 31,2 mil millones | BF16 | ~58 GiB | 0,819 | MIT |

No se dispone de información en la documentación proporcionada sobre otras conversiones cuantizadas del mismo modelo base ni sobre modelos comparables de otros autores (por ejemplo, alternativas MoE de ~30B), por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: en la única evaluación publicada, GSM8K 5-shot baja de 0,819 (BF16) a 0,809 (FP8). Es una degradación pequeña pero medible, y no se han publicado evaluaciones en otras tareas donde el impacto podría ser mayor.
- Dependencia de hardware específico: los kernels FP8 requieren GPUs Hopper, Ada o Blackwell; en hardware anterior el modelo no se puede ejecutar de forma nativa en FP8.
- Restricción de escalado: el tensor parallelism de atención está limitado a 1 o 2; desplegar en 4 GPUs exige pasar a DP attention con expert parallelism, lo que añade complejidad operativa.
- Idiomas limitados: solo inglés y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se han publicado evaluaciones de veracidad ni de sesgos para esta conversión.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna evaluación de sesgos o toxicidad.
- Contexto: la longitud de contexto no está documentada en la información proporcionada, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Procedencia y validación: es una cuantización de terceros (RadixArk), no del autor original (Z.ai). El repositorio tiene 15 descargas y 0 likes, sin validación comunitaria significativa.
- Licencia: MIT, igual que el modelo base, lo que en principio permite uso comercial, pero conviene verificar los términos de la model card original de zai-org/GLM-4.7-Flash antes de un despliegue en producción.
- Producción: al no haber datos públicos de throughput ni latencia, y con una única métrica de calidad, se recomienda una evaluación propia en el dominio objetivo antes de sustituir la versión BF16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RadixArk/glm47-flash-blockwise-fp8
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
