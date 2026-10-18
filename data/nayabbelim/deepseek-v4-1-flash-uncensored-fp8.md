# nayabbelim/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado de `deepseek-ai/DeepSeek-V4.1-Flash`, publicado por el usuario nayabbelim, en el que se ha aplicado una abliteration a nivel de pesos para eliminar los mecanismos de rechazo del modelo base. Se distribuye como un checkpoint estándar de `transformers` en safetensors, sin `model.py` personalizado ni hooks en tiempo de ejecución, con pesos en FP8 y expertos enrutados en FP4. El repositorio ocupa 510,3 GB y declara 763.205.315.794 parámetros totales en safetensors, aunque la model card del autor cita un backbone de 552B y 8B/16B de parámetros activos por token.

La arquitectura es un encoder-decoder causal de 20+20 capas con mezcla de expertos (384 expertos enrutados con top-6 más 1 compartido), Hyper-Connections de 4 canales en el residual, atención dispersa CSA2, memoria n-gram Engram y un cabezal borrador especulativo DSpark. Incorpora una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle, por lo que el pipeline declarado es `image-text-to-text`. La longitud de contexto anunciada es de 1M de tokens.

Su relevancia es doble: por un lado, demuestra una técnica de modificación de pesos que preserva visión, herramientas, razonamiento y coherencia multi-turno; por otro, eleva la tasa de éxito de ataque (ASR) en HarmBench-320 al 100 % en todas las categorías, con una caída de 4,22 puntos en MMLU-14k respecto al base. Es, por tanto, un modelo orientado a investigación en alineamiento y red teaming, no a despliegue directo sin moderación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder causal de 20+20 capas; MoE con 384 expertos enrutados top-6 + 1 compartido; Hyper-Connections (residual de 4 canales); atención dispersa CSA2; memoria n-gram Engram; borrador especulativo DSpark; torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Parámetros totales | 763.205.315.794 según safetensors; la model card del autor cita 552B de backbone |
| Parámetros activos | 8B/16B por token (MoE, según model card) |
| Longitud de contexto | 1M tokens |
| Tipos de cuantización | FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32] en los pesos; expertos enrutados en FP4; checkpoint distribuido en 8 bits |
| Idiomas soportados | No disponible; la model card no incluye listado de idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`); repositorio de 510,3 GB |
| Pipeline | `image-text-to-text` |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash` |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un encoder-decoder causal de 20+20 capas con MoE de 384 expertos enrutados (top-6) más un experto compartido, Hyper-Connections de 4 canales en el residual, atención dispersa CSA2, memoria n-gram Engram y un cabezal borrador DSpark para decodificación especulativa. La torre de visión DeepSeek-ViT, con 2D-RoPE y pixel unshuffle, se mantiene intacta según el autor. La cuantización es nativa: pesos FP8 `e4m3fn` con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4.

La modificación consiste en una abliteration a nivel de pesos descrita como "quirúrgica": se eliminan los circuitos de rechazo preservando, según la model card, los expertos enrutados, la memoria Engram, la atención dispersa CSA2, el cabezal DSpark, la torre de visión, las compuertas del router, las normas y los embeddings. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; tampoco se detalla el procedimiento exacto de abliteration más allá de que no usa hooks ni vectores de steering.

## Capacidades

- Generación de texto, razonamiento y matemáticas, con modo de razonamiento configurable ("reasoning-max default" según el autor).
- Procesamiento multimodal de imagen y texto mediante la torre DeepSeek-ViT, incluyendo entrada de imágenes junto a texto.
- Soporte de tool calling y function calling, según la model card ("Vision + tools").
- Capacidades de agente y razonamiento multi-paso, apoyadas en el modo de razonamiento y en el cabezal especulativo DSpark.
- Decodificación especulativa mediante el borrador DSpark, orientada a reducir latencia en generación.
- Contexto largo de hasta 1M de tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Ausencia deliberada de guardarraíles: el modelo responde a solicitudes que el base rechazaría, con un ASR del 100 % en HarmBench-320.
- Capacidad multilingüe no documentada: la model card solo menciona un clasificador multilingüe usado en la evaluación, sin listar idiomas soportados.

## Casos de uso

- Red teaming y evaluación de seguridad: utilizar el checkpoint para generar respuestas que el modelo base rechaza y estudiar los fallos de los filtros de seguridad, con un ASR medido del 100 % en HarmBench-320.
- Investigación en abliteration: comparar el checkpoint CRACK con el base sobre MMLU-14k y analizar qué componentes de la arquitectura (expertos, atención, visión) se ven afectados por la eliminación de los circuitos de rechazo.
- Análisis de documentación extensa: aprovechar la ventana de 1M tokens para procesar informes, expedientes o bases de conocimiento completas en una sola pasada, sin troceado agresivo.
- Extracción de información de documentos escaneados: combinar la torre ViT con el contexto largo para transcribir, resumir y estructurar PDFs e imágenes en un pipeline `image-text-to-text`.
- Generación y revisión de código en pipelines: usar tool calling y contexto largo para tareas de refactorización, revisión de parches y generación de tests dentro de flujos de CI/CD, con moderación externa.
- Agentes autónomos multi-paso: emplear el modo de razonamiento y las herramientas para descomponer tareas, consultar APIs y encadenar acciones, validando cada paso con un sistema supervisor.
- Generación de datos sintéticos para entrenamiento: producir corpus diversos y adversariales que cubran casos límite difíciles de obtener con modelos alineados.
- Atención al cliente con moderación externa: solo con una capa de filtrado y políticas propias delante, ya que el modelo no incorpora guardarraíles y no es apto para exposición directa a usuarios finales.

## Benchmarks y rendimiento

Datos autodeclarados en la model card del autor; no se han verificado de forma independiente.

| Benchmark | Modelo base | Este modelo (CRACK) | Delta |
|---|---:|---:|---:|
| MMLU-14k (test completo, T=0) | 86,96 % (12.211/14.042) | 82,74 % (11.619/14.042) | -4,22 pp |
| MMLU-14k sin cluster ético (~11k ítems) | — | — | -1,1 pp |
| HarmBench-320 ASR, effort=off | 42,81 % (137/320) | 100,00 % (320/320) | +57,19 pp |
| HarmBench-320 ASR, effort=max | 1,56 % (5/320) | 100,00 % (320/320) | +98,44 pp |

Desglose por categoría en HarmBench-320:

| Categoría | Ítems | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

En MMLU, la mayor caída por asignatura se concentra en `moral_scenarios` (76,9 % → 37,0 %, -39,89 pp); el resto de asignaturas presenta deltas inferiores a 7,1 pp. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- Pesos en disco: 510,3 GB. En VRAM, los pesos en FP8/FP4 mixto ocupan del orden de 510-600 GB, a los que hay que sumar KV cache y activaciones.
- Para 1M tokens de contexto, la KV cache es muy grande; se recomienda reservar varios cientos de GB adicionales y usar paralelismo tensor y de contexto.
- Configuración mínima práctica: 8×H100 80 GB (640 GB) para pesos justos, insuficiente para contexto largo; 16×H100 80 GB o 8×H200 141 GB para un despliegue con holgura.
- En A100 80 GB: 8-16 GPUs con paralelismo, teniendo en cuenta que A100 no dispone de FP8 nativo y requerirá emulación o conversión.
- FP4 en expertos enrutados requiere hardware Blackwell (B200/GB200) o emulación; FP8 nativo requiere Hopper o superior.
- No cabe en GPU de consumo: ni una RTX 4090 de 24 GB ni varias permiten alojar los pesos.
- Opciones de despliegue: `transformers` (referencia), vLLM, SGLang o TGI si soportan la arquitectura `deepseek_v41`; llama.cpp u Ollama no son viables por tamaño y por el esquema FP8/FP4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (base) | 552B de backbone (según model card) | 8B/16B | 1M | MIT | Disponible |
| Este modelo (UNCENSORED-FP8) | 763,2B (safetensors) | 8B/16B | 1M | MIT | Disponible |
| Otras variantes abliterated de la misma familia | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros para comparar con otras variantes abliterated o con modelos de tamaño similar. La comparación directa disponible es únicamente contra el checkpoint base, que pierde 4,22 pp en MMLU-14k y gana 57,19 pp de ASR en HarmBench-320 con `effort=off`.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: ASR del 100 % en HarmBench-320, incluidas las categorías `chemical_biological`, `cybercrime_intrusion` e `illegal`. No debe exponerse directamente a usuarios finales.
- Degradación de conocimiento: -4,22 pp en MMLU-14k; en `moral_scenarios` la caída es de -39,89 pp (76,9 % → 37,0 %), lo que afecta a tareas de razonamiento ético y jurídico.
- Riesgo elevado de alucinación y de respuestas dañinas sin advertencia; requiere moderación, filtros de entrada/salida y supervisión humana.
- No hay listado de idiomas soportados en la model card; el soporte multilingüe no está documentado y no debe asumirse.
- Los benchmarks son autodeclarados por el autor y no han sido replicados de forma independiente; el propio método de evaluación combina regex y LLM-as-judge, con posibles sesgos.
- Discrepancia de tamaño: 763,2B en safetensors frente a 552B de backbone citados en la model card; conviene verificar la configuración exacta antes de planificar el despliegue.
- Requisitos de hardware muy altos: 510,3 GB de repositorio y cientos de GB de VRAM, fuera del alcance de GPU de consumo.
- Licencia MIT declarada, pero el uso de una variante "uncensored" puede infringir términos de servicio de terceros, normativa sectorial o legislación aplicable; la responsabilidad recae en el desplegador.
- El tag `crack` y la abliteration de pesos pueden afectar a la estabilidad del modelo en dominios sensibles; se recomienda evaluar caso por caso antes de producción.
- No se documentan sesgos demográficos, lingüísticos ni culturales específicos; la ausencia de evaluación no implica ausencia de sesgo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nayabbelim/DeepSeek-V4.1-Flash-UNCENSORED-FP8)
- [Modelo base DeepSeek-V4.1-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash)
- [Perfil del autor en X: @dealignai](https://x.com/dealignai)
- [Perfil del autor en X: @jordanschenck](https://x.com/jordanschenck)

No se han encontrado paper, repositorio de código, demo o blog adicionales en la información proporcionada.
