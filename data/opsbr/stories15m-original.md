# opsbr/stories15M-original

## Resumen

`opsbr/stories15M-original` es un espejo (mirror) sin modificaciones del checkpoint `stories15M.bin` de Andrej Karpathy, el modelo de 15 millones de parámetros publicado en el repositorio `karpathy/tinyllamas` y utilizado como ejemplo de referencia por `llama2.c`. No es un modelo nuevo: los pesos y el tokenizador son copias byte a byte de las fuentes fijadas (revisiones `0bd21da7` para los pesos y `350e04fe` para el tokenizador), y el repositorio lo mantiene el proyecto Transformer Dojo para conservar una copia estable del modelo original en inglés. Los pesos los entrenó Karpathy; OpsBR solo aloja el espejo.

Técnicamente es un transformer decoder-only con arquitectura estilo Llama 2 (`dim=288`, `hidden_dim=768`, 6 capas, 6 cabezas, `n_kv_heads=6`, vocabulario de 32 000 tokens y longitud máxima de secuencia de 256 tokens). Está entrenado sobre el dataset TinyStories de Ronen Eldan y Yuanzhi Li y su único objetivo es generar micro-relatos infantiles en inglés. No es un modelo de instrucciones ni tiene ajuste por preferencias.

Su relevancia es práctica y educativa: con un fichero de 60,8 MB en fp32 se puede ejecutar el forward pass completo en CPU, en una Raspberry Pi o dentro de un test de integración continuo, lo que lo convierte en una pieza útil para enseñar y depurar pipelines de inferencia sin depender de GPU. Como contrapartida, su ventana de 256 tokens, su vocabulario limitado y su ausencia de alineación lo inhabilitan para cualquier uso de producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama 2 (formato llama2.c v0), con clasificador atado (*tied classifier*) |
| Parámetros totales | ≈15,2 M (nombre del modelo); el recuento derivado de la configuración da 15 191 712 parámetros de pesos, y el checkpoint fp32 ocupa 60 816 028 bytes |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (`max_seq_len=256`) |
| Tipos de cuantización | No disponible. Los pesos publicados están en fp32; el repositorio no documenta variantes cuantizadas y el fichero no está en GGUF ni safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Pesos: MIT. Tokenizador: Llama 2 Community License Agreement + Acceptable Use Policy. En HuggingFace figura como `other` con `mit-weights-and-llama2-tokenizer` |
| Formato de pesos | `stories15M.bin` (binario propietario de llama2.c v0, fp32). Tokenizador en `tokenizer.bin` (llama2.c) y `tokenizer.model` (SentencePiece) |
| Dimensiones internas | `dim=288`, `hidden_dim=768`, `n_layers=6`, `n_heads=6`, `n_kv_heads=6`, `vocab_size=32000` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con la disposición de tensores de Llama 2 pero dimensiones reducidas: 288 de dimensión de modelo, 6 capas, 6 cabezas de atención (48 dimensiones por cabeza, sin GQA al coincidir `n_kv_heads` con `n_heads`), FFN con `hidden_dim=768`, normalización RMSNorm y embeddings de tokens atados a la proyección de salida. El checkpoint serializa únicamente pesos fp32 junto con las tablas de RoPE precalculadas (`freq_cis`), sin pesos separados para el clasificador. El tokenizador utiliza el vocabulario de Llama 2 (32 000 tokens) en formato SentencePiece, reempaquetado además en el formato binario propio de llama2.c.

Los pesos los entrenó Andrej Karpathy sobre el dataset TinyStories, un corpus sintético de cuentos infantiles cortos generado con modelos mayores y diseñado para estudiar el aprendizaje de lenguaje en regímenes de datos reducidos. La información disponible no detalla el número de tokens vistos, la composición exacta del dataset, la mezcla de datos ni si hubo fases de RLHF, DPO o ajuste supervisado; el modelo card indica explícitamente que no es un modelo de instrucciones. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal) más allá del propio runtime en C de llama2.c.

## Capacidades

- Generación de texto en inglés en formato de cuento corto o micro-relato, con frases simples y vocabulario infantil.
- Continuación de prompts (*completion*), no diálogo: no hay plantilla de chat ni rol de sistema.
- Razonamiento de un solo paso y muy limitado; sin cadena de pensamiento ni modo *thinking*.
- Sin soporte de *tool calling* ni *function calling*.
- Sin capacidades de agente, planificación multi-paso ni uso de memoria externa.
- Monolingüe: solo inglés; no traduce ni mantiene conversación en castellano.
- Sin visión, audio, código especializado ni matemáticas simbólicas.
- Capacidad útil como *baseline* reproducible: implementación de referencia del forward pass de Llama 2 a pequeña escala.

## Casos de uso

- Docencia de LLM desde cero: el modelo permite recorrer el forward pass completo (atención, RoPE, RMSNorm, FFN) en una sola sesión de clase y comparar la implementación en C de llama2.c con una implementación en PyTorch, gracias a que el checkpoint es de 60,8 MB y cabe en cualquier portátil.
- Pruebas de integración en CI: al ser un binario diminuto con hash publicado en `SHA256SUMS`, se puede usar como modelo de juguete en tests automatizados de tokenizadores, servidores de inferencia y formateadores de prompts sin coste de GPU.
- Inferencia en dispositivos embebidos y *edge*: los 60,8 MB en fp32 y los 256 tokens de contexto permiten ejecutarlo en Raspberry Pi, routers o microcontroladores con suficiente RAM, generando texto de demostración totalmente offline.
- Generación de textos infantiles de relleno para aplicaciones educativas: produce cuentos cortos en inglés con estructura narrativa simple, útiles como contenido provisional en prototipos de apps de lectura.
- *Benchmarking* de hardware y de runtime: sirve para medir latencia y throughput de un runtime en C sobre una CPU o placa concreta con una carga fija y reproducible, sin variabilidad de red ni de servicio.
- *Baseline* en experimentos de escalado o destilación: al compartir arquitectura y tokenizador con `stories42M` y `stories110M`, permite aislar el efecto del número de parámetros manteniendo el resto de variables constante.
- Depuración de tokenizadores Llama 2: al incluir `tokenizer.model` en SentencePiece y `tokenizer.bin` en formato llama2.c, se pueden validar conversiones y comparar ambos empaquetados sobre el mismo vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; los pesos en fp32 ocupan 60,8 MB y la caché KV para 256 tokens con 6 capas es marginal (del orden de unos pocos cientos de KiB).
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o iGPU; no requiere GPU dedicada.
- Ejecutable en CPU sin vectorización especial: cualquier x86-64, ARM64 o Raspberry Pi con unos cientos de MB de RAM libre.
- Opciones de despliegue: el runtime de referencia es `llama2.c` (`run.c`/`runf32`, con el binario `stories15M.bin` y `tokenizer.bin`). No se documenta en la información disponible soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, y el repositorio no incluye checkpoints en PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `opsbr/stories15M-original` (este espejo) | ≈15,2 M | 256 tokens | Inglés | MIT (pesos) + Llama 2 Community License (tokenizador) | HuggingFace, 0 descargas, 0 likes; pesos idénticos al upstream |
| `karpathy/tinyllamas` — `stories15M` | ≈15,2 M | 256 tokens | Inglés | MIT (pesos) | Repositorio upstream en HuggingFace; fuente original del espejo |
| `karpathy/tinyllamas` — `stories42M` | ≈42 M (según nombre; recuento no disponible) | No disponible | Inglés | MIT (pesos), según la información del upstream | Upstream en HuggingFace; no incluido en este espejo |
| `karpathy/tinyllamas` — `stories110M` | ≈110 M (según nombre; recuento no disponible) | No disponible | Inglés | MIT (pesos), según la información del upstream | Upstream en HuggingFace; no incluido en este espejo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de instrucciones: no sigue órdenes, no responde preguntas factuales y no mantiene diálogo; solo continúa texto.
- Ventana de contexto de 256 tokens, insuficiente para documentos, conversaciones multi-turno o código.
- Entrenado sobre cuentos sintéticos infantiles: su conocimiento del mundo es mínimo y su vocabulario efectivo es muy reducido fuera del dominio narrativo.
- Riesgo alto de alucinación y de incoherencia fuera del dominio; no debe usarse para información factual, código ni decisiones automatizadas.
- Solo inglés; no hay soporte ni evaluación en castellano.
- Sin alineación, filtros de seguridad ni moderación: puede generar contenido inapropiado si se le induce, y no hay garantía de que respete criterios de seguridad en producción.
- Licencia dual: los pesos son MIT, pero el tokenizador está bajo la Llama 2 Community License y su Acceptable Use Policy, que imponen obligaciones de atribución y restricciones de uso adicionales. La licencia MIT de los pesos no sustituye la del tokenizador.
- Es un espejo de terceros con 0 descargas y 0 likes: para uso real conviene verificar los hashes publicados en `SHA256SUMS` y `sources.json`, o acudir directamente al repositorio upstream de Karpathy.
- El formato `.bin` de llama2.c v0 no es compatible con safetensors, GGUF ni con las herramientas estándar de HuggingFace `transformers` sin conversión previa, que no se documenta en la información disponible.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/opsbr/stories15M-original
- Pesos upstream (karpathy/tinyllamas, revisión `0bd21da7698eaf29a0d7de3992de8a46ef624add`): https://huggingface.co/karpathy/tinyllamas/tree/0bd21da7698eaf29a0d7de3992de8a46ef624add
- Tokenizador upstream (karpathy/llama2.c, revisión `350e04fe35433e6d2941dce5a1f53308f87058eb`): https://github.com/karpathy/llama2.c/tree/350e04fe35433e6d2941dce5a1f53308f87058eb
- Proyecto Transformer Dojo, mantenedor del espejo: https://github.com/opsbr/transformer-dojo
- Dataset TinyStories (Ronen Eldan y Yuanzhi Li): https://huggingface.co/datasets/roneneldan/TinyStories
- Fichero de procedencias y hashes de las fuentes: https://huggingface.co/opsbr/stories15M-original/blob/main/sources.json
- Sumas de verificación del espejo: https://huggingface.co/opsbr/stories15M-original/blob/main/SHA256SUMS
- Model card original preservada: https://huggingface.co/opsbr/stories15M-original/blob/main/UPSTREAM-README.md
- Texto de la licencia de los pesos (MIT): https://huggingface.co/opsbr/stories15M-original/blob/main/LICENSE
- Licencia del tokenizador (Llama 2 Community License): https://huggingface.co/opsbr/stories15M-original/blob/main/LICENSE-tokenizer.txt
- Política de uso aceptable del tokenizador: https://huggingface.co/opsbr/stories15M-original/blob/main/USE_POLICY-tokenizer.md
