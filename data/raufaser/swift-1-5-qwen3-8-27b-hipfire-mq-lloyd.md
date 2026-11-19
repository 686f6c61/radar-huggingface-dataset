# Raufaser/Swift-1.5-Qwen3.8-27b-hipfire-MQ-Lloyd

## Resumen

Swift-1.5-Qwen3.8-27b-hipfire-MQ-Lloyd es un conjunto de seis cuantizaciones del modelo Swift 1.5 Qwen3.8-27B, publicado por el usuario Raufaser en Hugging Face. Swift 1.5 es a su vez un derivado de Qwen3.8-27B desarrollado por UkisAI, y este repositorio no contiene pesos originales sino versiones comprimidas generadas con el cuantizador de la herramienta hipfire, orientada a inferencia en GPUs AMD mediante HIP.

El interés técnico del repositorio reside en el uso del formato Lloyd-Max: dos familias de cuantización (MQ4G256V2Lloyd, tipo 52, y MQ3G256Lloyd, tipo 20) que sustituyen la rejilla uniforme de 4 y 3 bits por un codebook Lloyd-Max de 16 niveles por tensor, manteniendo la tasa de bits. Según las mediciones del autor, esta sustitución reduce la divergencia KL frente al profesor entre un 10,5 % y un 22,4 % respecto a las variantes uniformes equivalentes.

Los ficheros están pensados exclusivamente para el runtime hipfire: llama.cpp no puede leerlos. El repositorio ocupa 87,4 GB y aloja tres niveles de producto (base, pro y xt) por cada formato, con tamaños que van de 12,6 GB a 16,5 GB por fichero. No se dispone de información sobre idiomas soportados, benchmarks de capacidad ni datos de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.8-27B; no se detalla en la información proporcionada) |
| Parámetros totales | 27B (según el nombre del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MQ4G256V2Lloyd (qt 52, grupos de 136 bytes) y MQ3G256Lloyd (qt 20, grupos de 112 bytes); tres tiers por formato (base, pro, xt) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | HFQ propio de hipfire (los ficheros subidos omiten la extensión `.hfq`); no compatible con GGUF ni con llama.cpp |

Tamaños de los ficheros publicados:

| Fichero | Formato | Tier | Bytes |
|---|---|---:|---:|
| `Swift-1.5-Qwen3.8-27b.mq4l` | MQ4G256V2Lloyd (qt 52) | base | 15.662.692.352 |
| `Swift-1.5-Qwen3.8-27b.mq4l-pro` | MQ4G256V2Lloyd (qt 52) | pro | 16.464.251.904 |
| `Swift-1.5-Qwen3.8-27b.mq4l-xt` | MQ4G256V2Lloyd (qt 52) | xt | 14.987.262.016 |
| `Swift-1.5-Qwen3.8-27b.mq3l` | MQ3G256Lloyd (qt 20) | base | 13.379.750.912 |
| `Swift-1.5-Qwen3.8-27b.mq3l-xt` | MQ3G256Lloyd (qt 20) | xt | 12.585.126.912 |
| `Swift-1.5-Qwen3.8-27b.mq3l-pro` | MQ3G256Lloyd (qt 20) | pro | 14.322.875.392 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base Swift 1.5 Qwen3.8-27B: no se detallan el tipo de transformer, la composición del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. Lo único que se infiere de la model card es que el modelo base incorpora atención lineal con cabezas V organizadas en mosaico (tiled linear-attention V-head), ya que el flag `--awq-fix-la-head-order` del cuantizador existe precisamente para remapear esas entradas de la imatrix de llama.cpp al orden de Hugging Face.

La innovación técnica documentada está en la capa de cuantización, no en el modelo. Los ficheros se generan con `hipfire-quantize` a partir de los safetensors BF16, aplicando escalas de activación AWQ derivadas de la matriz de importancia de Swift 1.5 (`imatrix-swift15-v1mix.gguf`). El formato MQ4G256V2Lloyd aplica una rotación FWHT al contenedor MQ4V2 y reemplaza la rejilla uniforme de 4 bits por un codebook Lloyd-Max de 16 niveles por tensor, con grupos de 136 bytes; el formato MQ3G256Lloyd usa el cuerpo heredado MQ3G256 con grupos de 112 bytes. Sin los flags `--awq` y `--awq-fix-la-head-order` se pierde la ventaja en divergencia KL. El tiempo de cuantización medido fue de 214–217 s por tier uniforme de 3 bits y de 287–288 s por tier Lloyd de 3 bits.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, visión, audio): no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.
- El repositorio añade una capacidad operativa concreta: carga y ejecución en el runtime hipfire con soporte de cuantización Lloyd (qt 52 y qt 20), con KV cache cuantizada a q8 mediante `--kv q8`.

## Casos de uso

- Despliegue en GPUs AMD con hipfire: el caso principal del repositorio es ejecutar un modelo de 27B en hardware AMD (ROCm/HIP) usando los ficheros MQ4L o MQ3L, que no cargan en llama.cpp. El comando documentado es `hipfire serve Swift-1.5-Qwen3.8-27b.mq4l --kv q8 --spec off`.
- Investigación sobre cuantización post-entrenamiento: los seis ficheros permiten reproducir y comparar la reducción de divergencia KL de Lloyd-Max frente a la rejilla uniforme en dos tasas de bits (4 y 3 bits) y tres tiers, con hashes SHA-256 publicados para cada medición.
- Evaluación de calidad de cuantización con profesor controlado: el autor documenta el protocolo completo (24 chunks de 2048 tokens, 24.552 tokens puntuados, `eval_hipfire --scoring-mode prefill --max-chunks 24 --kv-mode q8 --kv-v q8`), lo que permite replicar la evaluación en gfx1100.
- Selección de tier según presupuesto de memoria: el tier `xt` de 3 bits (12,6 GB) es el más pequeño del conjunto y sirve para entornos con VRAM ajustada; el tier `pro` de 4 bits (16,5 GB) es el de mayor calidad medida dentro del formato MQ4L.
- Integración en pipelines de inferencia propios de hipfire: al ser ficheros HFQ, encajan en flujos que ya usan `hipfire serve` y KV cache q8, sin necesidad de conversión adicional.
- Benchmarking de kernels de cuantización en ROCm: la model card fija variables de entorno (`HIPFIRE_GRAPH=0`, `HIPFIRE_NORMALIZE_PROMPT=0`, `HIPFIRE_IU4_PREFILL=0`) para que ambos formatos tomen la misma ruta de pesos, lo que resulta útil para comparar implementaciones de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son métricas de calidad de cuantización (divergencia KL frente al profesor) y tiempos de cuantización.

MQ4-Lloyd frente a MQ4V2 uniforme, ambos con AWQ:

| Tier | Uniforme | Lloyd | Reducción con Lloyd |
|---|---:|---:|---:|
| base | 0,045480 | 0,039636 | 12,8 % |
| pro | 0,041214 | 0,036888 | 10,5 % |
| xt | 0,052699 | 0,045637 | 13,4 % |

MQ3-Lloyd frente a MQ3V2 uniforme, ambos con AWQ:

| Tier | Uniforme | Lloyd | Reducción con Lloyd |
|---|---:|---:|---:|
| base | 0,149566 | 0,123417 | 17,5 % |
| pro | 0,137845 | 0,115308 | 16,3 % |
| xt | 0,187093 | 0,145113 | 22,4 % |

Condiciones de medición: slice WT2, 24 chunks de 2048 tokens, 24.552 tokens puntuados, en gfx1100 (RX 7900 XTX, HIP 7.16 / TheRock 10.1). Profesor: `Swift-1.5-Qwen3.8-27b.mq5v2-pro.hfq`. Referencia nativa top-256: `swift-wt2-native.kldref.bin`. El autor advierte que estas cifras solo son comparables entre sí y no con los pines BF16 publicados en `hipfire-models/qwen3.8-27b`, que usan otro profesor. En el modelo base, el formato MQ4 muestra una reducción de aproximadamente el 15 % según hipfire PR #768.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12,6 GB (mq3l-xt) y 16,5 GB (mq4l-pro) solo para pesos; hay que sumar la KV cache en q8, cuyo tamaño depende de la longitud de contexto, que no se documenta.
- GPU recomendadas: el entorno de referencia es gfx1100, es decir, AMD Radeon RX 7900 XTX con ROCm/HIP 7.16 y TheRock 10.1. No se documentan pruebas en otras GPU.
- Compatibilidad con GPU de consumo: sí, al menos en RX 7900 XTX (24 GB de VRAM), que es la plataforma usada para las mediciones.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; el runtime hipfire y el formato HFQ están orientados a AMD según los tags del repositorio.
- Opciones de despliegue: exclusivamente hipfire, con una build que soporte Lloyd (qt 52 para MQ4L y qt 20 para MQ3L). llama.cpp no puede leer estos ficheros. No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: no disponibles. El `.mtp` sidecar de decodificación especulativa del build MQ4 uniforme no forma parte de este repositorio y no se ha comprobado con estos troncos Lloyd, por lo que la decodificación especulativa no está validada aquí.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de capacidad que permitan una comparativa de rendimiento con otros modelos. La comparación posible es interna, entre los formatos de este mismo repositorio y sus equivalentes uniformes:

| Formato | Tasa de bits | Tamaño (base) | KLD (base) | Compatibilidad |
|---|---|---:|---:|---|
| MQ4G256V2Lloyd (qt 52) | 4 bits con codebook Lloyd | 15,66 GB | 0,039636 | Solo hipfire |
| MQ4V2 uniforme | 4 bits uniforme | neutro en tamaño respecto a Lloyd | 0,045480 | hipfire |
| MQ3G256Lloyd (qt 20) | 3 bits con codebook Lloyd | 13,38 GB | 0,123417 | Solo hipfire |
| MQ3V2 uniforme | 3 bits uniforme | 714–801 MB menos que su Lloyd equivalente | 0,149566 | hipfire |

Frente a alternativas de otros ecosistemas (GGUF para llama.cpp, AWQ/GPTQ para vLLM), no hay datos en la información proporcionada para establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Compatibilidad restringida: los ficheros solo cargan en hipfire; llama.cpp no puede leerlos y no se documenta soporte en otros runtimes.
- Plataforma limitada: las mediciones y el flujo de trabajo están atados a AMD gfx1100 con ROCm/HIP; no hay validación en NVIDIA ni en otras GPU AMD.
- Sin datos del modelo base: se desconoce la arquitectura exacta, el contexto máximo, los idiomas soportados y las capacidades reales de Swift 1.5 Qwen3.8-27B a partir de esta ficha.
- Sin benchmarks de capacidad: no hay MMLU, HumanEval ni GSM8K publicados, por lo que no se puede evaluar la calidad absoluta del modelo, solo la pérdida relativa introducida por la cuantización.
- Licencia: swift-open-license-1.0, con enlace al LICENSE del modelo base de UkisAI. Es una licencia "other", no estándar; debe revisarse antes de uso comercial. Swift 1.5 es un derivado de Qwen3.8-27B y arrastra las condiciones del modelo original, que no se detallan aquí.
- El tier `xt` de 3 bits presenta la mayor degradación absoluta del conjunto (KLD 0,145113), aunque también la mayor reducción relativa frente a su uniforme (22,4 %). Para producción conviene partir del tier `pro` de 4 bits.
- El formato MQ3-Lloyd no es neutro en tamaño: sus grupos de 112 bytes hacen cada fichero entre 714 y 801 MB más grande que el MQ3V2 uniforme equivalente.
- La decodificación especulativa no está validada con estos troncos Lloyd; el sidecar `.mtp` no está incluido.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raufaser/Swift-1.5-Qwen3.8-27b-hipfire-MQ-Lloyd
- Modelo base Swift 1.5 Qwen3.8-27B: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Matriz de importancia e imatrix (GSQ-RCO-GGUF): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Documentación de cuantización de hipfire: https://github.com/warpfront/hipfire/blob/master/docs/QUANTIZATION.md
- Repositorio hipfire: https://github.com/warpfront/hipfire
- Pull request con la reducción del 15 % en MQ4: https://github.com/warpfront/hipfire/pull/768
