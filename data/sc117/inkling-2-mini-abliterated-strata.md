# SC117/Inkling-2-Mini-abliterated-Strata

## Resumen

Inkling-2-Mini-abliterated-Strata es una compilación de checkpoints en formato nativo `.strata v1.1` del modelo multimodal Inkling-2-Mini, publicado por el usuario SC117 sobre el trabajo previo de strata-engine. Se construye a partir del modelo base thinkingmachines/Inkling-2-Mini, un transformer con mezcla de expertos (MoE) de 128 expertos y arquitectura "looped" que repite tres pasadas de cómputo, con 26.400 millones de parámetros totales, 3.400 millones base y 5.400 millones efectivos activos. El resultado es un modelo de imagen-texto-a-texto con capacidad de razonamiento y contexto largo, afinado para ser "abliterated" (sin censura en las capas de atención).

La relevancia de esta publicación es doble. Por un lado, empaqueta el modelo en tres niveles de cuantización propietaria SQ-20, SQ-15 y SQ-10, junto con un shard de visión en BF16 sin pérdida y un borrador especulativo DSpark embebido, lo que permite ejecutarlo en GPUs de consumo con 16-32 GiB. Por otro, aplica una ablación quirúrgica de 20 tensores de atención (`layers.4..23.attn.wo_ud.weight`) verificada byte a byte contra el modelo original, sin recuantizar los 3.072 pesos de expertos MoE.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a inglés, chino y multilingüe. Su formato propietario `.strata` requiere el runtime `strata` / `strata-inkling`, aunque existe un repositorio complementario con versiones GGUF para llama.cpp. Es una opción interesante para quienes necesiten un MoE multimodal sin filtros y con decodificación especulativa integrada en hardware de gama alta de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucles (looped-transformer), 128 expertos, atención multimodal con shard de visión |
| Parametros totales | 26.400 millones (26.4B) |
| Parametros activos | 3.4B base / 5.4B efectivos en 3 pasadas de bucle |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | SQ-20 (BF16 en atención), SQ-15 (BF16 + Q8_ROW), SQ-10 (Q8_ROW); GGUF en repo complementario (BALANCED, QUALITY, REFERENCE, Q6_K, BF16, mmproj) |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata v1.1` nativo (runtime strata); GGUF en repositorio complementario FIT-GGUF |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos con 128 expertos y un diseño "looped": el mismo bloque de capas se ejecuta tres veces, de modo que los 3.4B parámetros base se convierten en 5.4B efectivos por token. Incluye atención multimodal con un shard de visión independiente, routers, pesos de convolución corta y controladores de bucle. La variante Strata v1.1 preserva byte a byte todos estos componentes respecto a los packs oficiales de strata-engine: los 3.072 pesos de expertos MoE, el borrador especulativo DSpark, los pesos de visión, las normas y los routers no se recuantizan.

La modificación "abliterated" consiste en trasplantar 20 tensores de salida de atención (`model.llm.layers.4..23.attn.wo_ud.weight`, de un total de 1.244 tensores) procedentes de una ablación verificada de etapa 1. Antes de sobrescribir, el script de parcheo verificó los 24 tensores base `attn.wo_ud.weight` contra thinkingmachines/Inkling-2-Mini (24/24 BF16 byte-exacto en SQ-20; 4/24 BF16 + 20/24 Q8_ROW en SQ-15; 24/24 Q8_ROW en SQ-10) y recalculó los seis digests SHA-256 de las secciones `.strata`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso, con etiqueta explícita de "reasoning" en la model card.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante shard de visión en BF16 sin pérdida.
- Conversación multi-turno con soporte de contexto largo (etiqueta `long-context`).
- Capacidades multilingües en inglés, chino y otros idiomas.
- Decodificación especulativa integrada mediante el borrador DSpark, que acelera la generación en el runtime Strata.
- Variante "abliterated" orientada a reducir rechazos y censura en las respuestas.
- No se especifica en la información disponible si soporta tool calling, function calling o agentes multi-paso.

## Casos de uso

- Asistente multimodal de escritorio: el modelo puede recibir capturas de pantalla o imágenes junto con texto y responder en conversación multi-turno, aprovechando el shard de visión BF16 y el contexto largo para mantener el hilo de la interacción.
- Análisis de documentos con imágenes: extracción y razonamiento sobre diagramas, gráficos o formularios escaneados, combinando la entrada visual con preguntas en lenguaje natural.
- Generación de código y razonamiento técnico: su naturaleza MoE con 5.4B parámetros efectivos permite ejecutar tareas de programación y matemáticas en una sola GPU de 24-32 GiB, con la decodificación especulativa DSpark reduciendo la latencia por token.
- Investigación sobre alineación y censura: la variante abliterated es útil para estudiar el comportamiento del modelo sin los filtros de rechazo originales, comparando respuestas frente al base thinkingmachines/Inkling-2-Mini.
- Despliegue en hardware de consumo: con el pack SQ-15 (13,36 GiB) cabe en GPUs de 16 GiB y en memorias unificadas de 24 GiB, lo que permite prototipado local de aplicaciones multimodales sin infraestructura de centro de datos.
- Evaluación comparativa de cuantizaciones: los tres packs SQ-20, SQ-15 y SQ-10 permiten medir el impacto de la precisión en atención (BF16 frente a Q8_ROW) sobre la calidad y el throughput en una misma máquina.
- Servicio de inferencia con decodificación especulativa: el runtime `strata` con `serve/server.py` y el tokenizador preconvertido permiten levantar un endpoint de imagen-texto con throughput medido de hasta 2.270 tok/s en prefill y 76,8 tok/s en decode sobre una RTX 4080 SUPER.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones de `--bench` del runtime Strata sobre una NVIDIA RTX 4080 SUPER de 32 GiB (`sm_89`, `sm120_tc=0`), con `strata 0.2.19 / strata-inkling 0.1.65`, `--gpus 1 --kv fp8`:

| Pack | Tamano exacto | Almacenamiento `wo_ud` | Prefill (512, fp8) | Decode (64, sin DSpark) | Selfcheck |
|---|---|---:|---|---:|---|
| SQ-20 | 18,02 GiB (19.346.685.952 B) | 24× BF16 | 2.270,2 tok/s | 76,8 tok/s | PASS |
| SQ-15 | 13,36 GiB (14.348.316.672 B) | 4× BF16 + 20× Q8_ROW | 2.217,3 tok/s | no disponible en el extracto | PASS |
| SQ-10 | no disponible en el extracto | 24× Q8_ROW | no disponible en el extracto | no disponible en el extracto | PASS |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: SQ-20 requiere al menos 24 GiB en GPU discreta o 32 GiB en memoria unificada; SQ-15 requiere 16 GiB en GPU discreta, 24 GiB unificada o 12 GiB en configuración híbrida; SQ-10 está pensado para hardware aún más ajustado (sin cifra exacta en el extracto).
- GPU recomendadas: el autor valida sobre RTX 4080 SUPER de 32 GiB; por tamaño, encajan A100 40/80 GB, H100, RTX 4090 (24 GiB, justo para SQ-20), RTX 4080 SUPER y GPUs con 16 GiB para SQ-15.
- Cabe en GPU de consumo: sí, SQ-15 en 16 GiB y SQ-20 en 24 GiB (con margen ajustado).
- Opciones de despliegue: runtime propietario `strata` / `strata-inkling` con `serve/server.py` y tokenizador preconvertido; versiones GGUF para llama.cpp en el repositorio complementario SC117/Inkling-2-Mini-abliterated-FIT-GGUF (tiers BALANCED, QUALITY, REFERENCE, Q6_K, BF16, mmproj).
- Latencia y throughput: prefill de 2.270,2 tok/s y decode de 76,8 tok/s en SQ-20 sobre RTX 4080 SUPER con KV en fp8 y sin DSpark; el uso del borrador especulativo DSpark debería incrementar el throughput de decode, aunque no se aporta la cifra concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-abliterated-Strata (este) | 26,4B totales / 5,4B efectivos | no disponible (long-context) | Apache 2.0 | `.strata` + GGUF | Multimodal, sin censura, DSpark |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B totales / 5,4B efectivos | no disponible | no disponible | safetensors | Modelo original con filtros |
| strata-engine/Inkling-2-Mini-Strata | 26,4B totales / 5,4B efectivos | no disponible | no disponible | `.strata` | Packs oficiales sin ablación |
| SC117/Inkling-2-Mini-abliterated-FIT-GGUF | 26,4B totales / 5,4B efectivos | no disponible | Apache 2.0 | GGUF | Misma ablación, formato llama.cpp |

No se dispone de datos de benchmarks de calidad para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El formato `.strata v1.1` es propietario y requiere el runtime `strata` / `strata-inkling`; no es directamente cargable en vLLM, TGI o transformers sin conversión.
- La variante abliterated elimina filtros de rechazo en las capas de atención, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o dañino; no es adecuada para aplicaciones de cara al público sin moderación adicional.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la información disponible.
- El modelo está etiquetado para inglés, chino y multilingüe, pero no se detalla la cobertura real por idioma; el rendimiento en castellano no está verificado.
- La longitud de contexto no se especifica numéricamente, solo mediante la etiqueta `long-context`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 22 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de uso comercial, ya que la información disponible no detalla su licencia original.
- El rendimiento medido corresponde a una única GPU (RTX 4080 SUPER) y a una versión concreta del runtime; los números pueden variar en otro hardware o versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-Strata
- Repositorio GGUF complementario: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-FIT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Packs oficiales Strata: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- README en chino simplificado: https://huggingface.co/SC117/Inkling-2-Mini-abliterated-Strata/blob/main/README.zh-CN.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
