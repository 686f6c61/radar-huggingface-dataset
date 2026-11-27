# littlemex/prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l

## Resumen

Prismyra decision NVFP4 36L es un checkpoint de clasificación y toma de decisiones tipadas construido sobre Qwen3.6-35B-A3B-FP8, desarrollado por el usuario littlemex dentro del proyecto Prismyra. El modelo no es un chat generalista: está especializado en responder preguntas de opción múltiple y tareas de comprensión lectora con decisiones deterministas y compatibles con lotes (batch-invariant), emitiendo salidas tipadas en lugar de texto libre. Se distribuye como un fine-tune con adaptador LoRA de rango 64 sobre el modelo base, y su rasgo técnico más distintivo es la cuantización NVFP4 de los expertos enrutados.

La arquitectura subyacente es un transformer MoE (tag `qwen3_5_moe`) con 40 capas, del cual este checkpoint conserva 36. Los 256 expertos enrutados por capa, que constituyen la mayor parte de los pesos, se almacenan en NVFP4 (4 bits en coma flotante, escalas de bloque de 16 elementos y una escala FP32 por matriz de experto), mientras que atención, proyecciones gated-delta-net, experto compartido y cabeza de predicción multi-token permanecen en FP8. El resultado es un repositorio de unos 20 GB frente a los 32 GB del checkpoint FP8 equivalente.

Su relevancia actual es doble: por un lado, demuestra una ruta práctica de cuantización selectiva de expertos MoE que reduce el peso a aproximadamente el 60 % sin tocar el resto de la pila; por otro, exige hardware NVIDIA Blackwell con tensor cores FP4 nativos, lo que lo convierte en un caso de estudio de las dependencias de hardware que introduce NVFP4 en el despliegue de modelos abiertos. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), 36 de 40 capas, 256 expertos enrutados por capa, proyecciones gated-delta-net, experto compartido y cabeza MTP |
| Parametros totales | 3.596.444.464 (según safetensors del repo); el nombre comercial indica 35B-A3B sobre el modelo base Qwen3.6-35B-A3B-FP8 |
| Parametros activos | No disponible con precisión (el sufijo A3B del modelo base sugiere ~3B activos, dato no confirmado en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 para expertos enrutados (escalas de bloque de 16 elementos, una escala FP32 por matriz); FP8 para atención, gated-delta-net, experto compartido y cabeza MTP |
| Idiomas soportados | Inglés (`en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards `layers-*`, `mtp.safetensors`, `outside.safetensors`, `nvfp4_experts.safetensors`), más `nvfp4_calib.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B-FP8, un MoE con 40 capas y 256 expertos enrutados por capa. Prismyra recorta el checkpoint a 36 capas y aplica una cuantización selectiva: solo los expertos enrutados pasan a NVFP4, con escalas de bloque de 16 elementos y una escala FP32 por matriz de experto, mientras que el resto de componentes (atención, proyecciones gated-delta-net, experto compartido y cabeza de predicción multi-token) se mantienen en FP8. Esta decisión concentra la compresión donde está la mayor parte del peso y preserva en mayor precisión las partes sensibles a la calidad.

Sobre esa base se entrena un adaptador LoRA de rango 64 con módulos objetivo y hiperparámetros sin cambios respecto a revisiones anteriores. La revisión actual sustituye el LoRA integrado por el adaptador que ya se distribuye en el checkpoint FP8 de 36 capas, que incorpora cuatro conjuntos de datos públicos con licencia clara sobre sentimiento y razonamiento causal o multi-paso (56.026 filas en total, un 4,00 % nuevo en la mezcla de entrenamiento). Según el autor, esto cierra una brecha medida en sentimiento sin regresión en el conjunto de seguridad de producción del proyecto. El adaptador se validó sobre dos conjuntos independientes de 10.000 preguntas cada uno, evaluados en la propia ruta de servicio NVFP4 de este checkpoint. Los expertos enrutados no se tocan en ninguna revisión del LoRA, por lo que los ficheros `nvfp4_experts.safetensors` y `nvfp4_calib.json` permanecen idénticos entre revisiones.

Los datos de entrenamiento declarados cubren CommonsenseQA, AQuA-RAT, MMLU, CosmosQA, GLUE, SciQ, DREAM, OpenBookQA, RACE, BoolQ, un corpus de sentimiento financiero de Twitter, TweetEval, Balanced COPA y Social IQa.

## Capacidades

- Clasificación de texto y respuesta a preguntas de opción múltiple con salidas tipadas (`typed-decisions`), en lugar de generación de texto libre.
- Comprensión lectora y razonamiento de sentido común, causal y multi-paso sobre los dominios cubiertos por los datasets de entrenamiento.
- Modo zero-shot sobre preguntas nuevas dentro del formato de decisión.
- Inferencia determinista y compatible con lotes (`deterministic`, `batch-invariant`), pensada para reproducibilidad en producción.
- Compatibilidad con la API de `autotrust/JEV-27B` mediante el endpoint `POST /v1/decide` (forma `kind`/`state`/`question`/`options`).
- Servicio concurrente con `--batcher`, que mantiene documentos de varios llamantes en dispositivo con desalojo LRU y contabilidad de fragmentación a nivel de página.
- Multimodal a nivel de pipeline (`image-text-to-text`), aunque la model card no detalla el alcance real de las capacidades de visión.
- Capacidad de predicción multi-token (cabeza MTP) en FP8.

## Casos de uso

- Clasificación de tickets y correos en producción: el modelo emite decisiones tipadas y deterministas sobre categorías predefinidas, lo que permite integrarlo en pipelines con validación estricta de esquema y resultados reproducibles entre ejecuciones.
- Moderación y etiquetado de contenido a escala: el `--batcher` mantiene documentos de varios llamantes en GPU con desalojo LRU, adecuado para servicios de etiquetado con alta concurrencia y ventanas de contexto variables.
- Evaluación automática de exámenes y bancos de preguntas: entrenado sobre MMLU, AQuA-RAT, OpenBookQA, RACE, ARC y DREAM, responde preguntas de opción múltiple con un formato de salida fijo, útil para pipelines de benchmarking interno.
- Análisis de sentimiento en dominios financiero y redes sociales: la mezcla de entrenamiento incluye sentimiento financiero de Twitter y TweetEval, lo que lo hace apropiado para clasificación de opinión en esos registros.
- Razonamiento de sentido común en asistentes de decisión: sobre CommonsenseQA, Social IQa, CosmosQA y Balanced COPA, puede resolver preguntas de elección entre opciones en flujos de recomendación o triaje.
- Sustitución directa de un servicio construido contra la API de JEV: el endpoint `/v1/decide` replica la forma de petición de `autotrust/JEV-27B`, lo que permite migrar sin reescribir el cliente.
- Inferencia reproducible en auditoría: la invariancia de lote y el determinismo declarados permiten reejecutar la misma decisión y obtener el mismo resultado, requisito habitual en sistemas sujetos a revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona dos conjuntos de 10.000 preguntas usados para validar la transferencia del adaptador y una prueba de humo con dos preguntas respondidas correctamente vía API HTTP, pero no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell con tensor cores FP4 nativos. Verificado únicamente en RTX PRO 4500 (compute capability 12.0, `sm_120`).
- No funciona en Ada ni Hopper (L40S, H100) para la ruta NVFP4. Blackwell de datacenter (B200/GB200, `sm_100`) no ha sido probado.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 24 GB y los expertos NVFP4 unos 16 GB, frente a unos 29 GB en FP8, lo que da una orientación del orden de magnitud, no una cifra de VRAM en ejecución.
- No cabe en GPUs de consumo convencionales de generaciones anteriores; requiere una tarjeta Blackwell profesional o superior.
- Despliegue mediante `prismyra-serve` (paquete `prismyra`, mínimo v0.3.1 para la ruta NVFP4, v0.4.7 recomendado), con variables `PRISMYRA_EXPERTS=nvfp4`, `PRISMYRA_NVFP4_EXPERTS` y `PRISMYRA_NVFP4_CALIB`, y flag `--require-kernels`.
- Depende de los kernels NVFP4 MoE de vLLM (CUTLASS/FlashInfer), que son exclusivos de Blackwell.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Prismyra decision NVFP4 36L | 3,596 M en safetensors (base 35B-A3B) | No disponible | NVFP4 expertos + FP8 resto | Apache 2.0 | Solo Blackwell, determinista, decisiones tipadas |
| Prismyra decision FP8 36L (`littlemex/prismyra-decision-qwen3.6-35b-a3b-fp8-36l`) | Base 35B-A3B, 36 capas | No disponible | FP8 | Apache 2.0 | Mismo adaptador, ~32 GB, sin dependencia de Blackwell |
| Prismyra decision 35B-A3B NVFP4 (`littlemex/prismyra-decision-35b-a3b-nvfp4`) | Base 35B-A3B | No disponible | NVFP4 con proyecciones gated-delta-net también cuantizadas | Apache 2.0 | Línea más reciente, entrenada solo con datos confirmados para uso comercial |
| Qwen3.6-35B-A3B-FP8 (`Qwen/Qwen3.6-35B-A3B-FP8`) | 35B-A3B | No disponible | FP8 | No disponible en la información proporcionada | Modelo base generalista, sin especialización en decisiones |

## Limitaciones y advertencias

- Dependencia dura de hardware: la ruta NVFP4 solo se ha verificado en RTX PRO 4500. En Ada y Hopper no funciona; en B200/GB200 no está probado. El autor indica que el kernel está diseñado para fallar en lugar de degradar silenciosamente a FP8, pero ese comportamiento no se ha verificado fuera de Blackwell.
- Idiomas: la model card declara únicamente inglés. No hay soporte multilingüe confirmado.
- Longitud de contexto no publicada: no es posible planificar despliegues con documentos largos sin medirla.
- Especialización estrecha: es un modelo de decisión y clasificación, no un generador conversacional. Usarlo como chat generalista produciría resultados fuera de su dominio de entrenamiento.
- Riesgo de alucinación en las opciones: al operar sobre conjuntos cerrados de opciones, el modo de fallo típico es elegir una opción incorrecta con alta confianza, no inventar texto; conviene calibrar umbrales por dominio.
- Sesgos: los datasets de entrenamiento incluyen Twitter financiero y TweetEval, con los sesgos demográficos y de registro propios de esas fuentes; la model card no documenta una evaluación de sesgos.
- Trazabilidad de licencias: el autor señala que esta línea no está entrenada exclusivamente con datos confirmados como aptos para uso comercial y para entrenar modelos derivados; la línea `prismyra-decision-35b-a3b-nvfp4` sí lo está. Aunque la licencia del checkpoint es Apache 2.0, conviene revisar la procedencia de los datos antes de un uso comercial estricto.
- Madurez: 196 descargas y 0 likes en el momento de la consulta; el proyecto depende de un paquete propio (`prismyra`) instalado desde Git, no desde PyPI estable.
- El recorte de 40 a 36 capas implica una pérdida deliberada de capacidad respecto al modelo base, no documentada en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/littlemex/prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l
- Revisión anterior del checkpoint: https://huggingface.co/littlemex/prismyra-decision-qwen3.6-35b-a3b-nvfp4-36l/tree/e8a881e2121c49f4ef9554b5f2eaa139de6b4761
- Checkpoint FP8 36 capas: https://huggingface.co/littlemex/prismyra-decision-qwen3.6-35b-a3b-fp8-36l
- Línea NVFP4 con datos solo comerciales: https://huggingface.co/littlemex/prismyra-decision-35b-a3b-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Repositorio del proyecto: https://github.com/littlemex/Prismyra
- Documentación del endpoint `/v1/decide`: https://github.com/littlemex/Prismyra/blob/a79bbdce9e5ee909120de535f89dae2356885cd6/docs/DECIDE.md
- Modelo de referencia para la API de decisión: `autotrust/JEV-27B` (referenciado en la model card, sin URL directa en la información proporcionada)
