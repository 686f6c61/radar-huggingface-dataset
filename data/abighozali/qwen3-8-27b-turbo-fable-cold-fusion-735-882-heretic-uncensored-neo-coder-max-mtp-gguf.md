# abighozali/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un ajuste fino (fine-tune) de tipo multi-etapa y multi-merge derivado del modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez parte de la familia Qwen 3.8 de 27B. Lo desarrolla el usuario abighozali publicando en HuggingFace, sobre la estela de las técnicas de entrenamiento "Cold Fusion" y "Fable Fusion 711" creadas por DavidAU. El objetivo declarado es reducir drásticamente los tokens de razonamiento (entre la mitad y hasta una décima parte), mantener la calidad de salida y elevar los resultados en benchmarks de razonamiento tipo ARC.

El modelo se distribuye exclusivamente en formato GGUF, con cuantizaciones "regulares" y "MTP" (multi-token prediction) generadas con imatrix dual (DI-MATRIX). El repositorio ocupa 389 GB e incluye variantes de 4 y 8 bits. El autor afirma que supera al Qwen 3.8 27B base y a otros modelos Qwen (3.6-35B-A3B, 3.6 27B, 3.5 27B) en siete benchmarks críticos, si bien no se aportan tablas numéricas verificables en la información disponible.

Es relevante para quienes buscan un modelo de ~27B parámetros (26.896 millones reales en safetensors) ejecutable en hardware de consumo, con supuestas capacidades de razonamiento, código y escritura creativa, y con un ajuste orientado a reducir el "over-thinking". La licencia declarada es Apache 2.0, aunque el modelo incorpora modificaciones de "abliteration"/"uncensored" que conviene valorar con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen 3.8 27B); pipeline declarado image-text-to-text |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 4 bits y 8 bits (variantes "Regular GGUF Quants" y "MTP GGUF Quants", con imatrix dual) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 389 GB); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 27B parámetros, heredado del linaje Qwen 3.8 27B y sometido a un proceso de ajuste fino multi-etapa y multi-merge. El autor describe dos metodologías propias: "Cold Fusion" (combinación de la técnica "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". La técnica GAIN modifica dinámicamente el entrenamiento por muestra en tiempo real a medida que el modelo aprende, mientras que Unsloth aporta los sistemas de entrenamiento eficiente. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets.

El objetivo central del ajuste es reducir el tamaño del bloque de razonamiento (mediana de reducción de aproximadamente dos tercios, con casos de hasta una décima parte) y reformatear dicho bloque, manteniendo o mejorando los benchmarks. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla si la arquitectura incorpora innovaciones como atención lineal o decodificación especulativa; el autor menciona "MTP" (multi-token prediction) como variante de cuantización/rendimiento, pero sin especificaciones técnicas verificables.

## Capacidades

- Generación de texto general, con modos de "thinking" y razonamiento declarados (tres modos de operación según el autor).
- Razonamiento y resolución de problemas, con reducción de tokens de pensamiento respecto al modelo base.
- Generación de código (etiqueta "coder", "NEO-CODER").
- Escritura creativa, narrativa, ficción y roleplaying (etiquetas "creative writing", "story", "fiction", "roleplaying").
- Capacidad multimodal declarada por el pipeline image-text-to-text (entrada de imagen y texto); no se detallan especificaciones de visión.
- Soporte multilingüe limitado a inglés (en) y chino (zh).
- Tool calling / function calling: el autor menciona en la pestaña "community" un rendimiento "récord" en tool calling, pero no se aportan datos verificables en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita.
- Capacidades especiales: variante "uncensored"/"abliterated"/"heretic" orientada a reducir rechazos; formato GGUF con imatrix dual para despliegue en hardware de consumo.

## Casos de uso

- Escritura creativa y narrativa: el modelo está ajustado específicamente para ficción, relatos y roleplaying, con ejemplos en la model card que muestran generación de hooks narrativos y diálogo. Adecuado para herramientas de asistencia a escritores que necesiten producir borradores largos con coherencia de tono.
- Generación de código en local: al ser un GGUF de ~27B ejecutable en GPU de consumo, puede integrarse en editores o pipelines de CI/CD para autocompletado, generación de tests o revisión de código, siempre que se valide la calidad en el dominio concreto.
- Asistente conversacional autoalojado: su licencia Apache 2.0 y su disponibilidad en GGUF permiten desplegarlo en infraestructura propia con llama.cpp u Ollama para atención al cliente o asistentes internos, con la cautela de que solo cubre inglés y chino.
- Razonamiento con presupuesto de tokens reducido: la reducción de tokens de "thinking" (hasta 1/10 en algunos casos) lo hace adecuado para entornos con latencia ajustada donde un modelo de razonamiento estándar consumiría demasiados tokens.
- Prototipado de agentes con tool calling: si se confirma el rendimiento declarado en function calling, podría usarse como motor de agentes que invoquen APIs, aunque la ausencia de benchmarks públicos obliga a evaluarlo empíricamente.
- Experimentación e investigación en ajuste fino: al ser un ejemplo de multi-stage tune y multi-merge con técnicas propias (Cold Fusion, GAIN), sirve como referencia para investigadores que estudien la reducción de tokens de razonamiento.
- Generación de contenido creativo sin restricciones: la variante "uncensored" puede emplearse en entornos controlados de ficción adulta o guiones, asumiendo la responsabilidad de moderación por parte del operador.

## Benchmarks y rendimiento

El autor afirma en la model card que el modelo supera al Qwen 3.8 27B base y a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, y cita valores concretos de ARC-C (735 en 8 bits, 719 en 4 bits) y ARC-E (por encima de 880). Sin embargo, no se proporcionan tablas numéricas completas ni metodología verificable en la información disponible.

| Benchmark | Valor declarado | Notas |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmación del autor; sin metodología detallada |
| ARC-C (4 bits) | 719 | Afirmación del autor; sin metodología detallada |
| ARC-E | > 880 | Afirmación del autor; sin metodología detallada |
| MMLU | no disponible | No se aporta |
| HumanEval | no disponible | No se aporta |
| GSM8K | no disponible | No se aporta |

No se han publicado resultados de benchmarks verificables de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~27B parámetros, en cuantización de 4 bits se requieren aproximadamente 15-18 GB de VRAM; en 8 bits, en torno a 28-30 GB. Son estimaciones basadas en el tamaño, no datos oficiales del autor.
- GPU recomendadas: para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) deberían ser suficientes; para 8 bits, se necesitan GPU profesionales como A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en tarjetas con 24 GB o más; en 8 bits no cabe en GPU de consumo estándar.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el autor menciona "endpoints_compatible". No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles. El autor afirma que la variante MTP acelera la generación de tokens, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-...-NEO-CODER-MAX-MTP-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Ajuste "uncensored" con reducción de thinking |
| Qwen 3.8 27B (base) | ~27B | no disponible | no disponible | bfloat16 | Modelo de referencia del que deriva |
| Qwen 3.6 27B | ~27B | no disponible | no disponible | no disponible | Citado por el autor como superado |
| Qwen 3.5 27B | ~27B | no disponible | no disponible | no disponible | Citado por el autor como superado |

No se dispone de datos verificables de contexto, rendimiento o disponibilidad para las alternativas en la información proporcionada; la comparación se limita a lo declarado por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al ser un ajuste "uncensored"/"abliterated", es probable que reduzca los rechazos ante contenido sensible, lo que puede aumentar la exposición a salidas sesgadas o inapropiadas.
- Riesgo de alucinación: no se aportan métricas de fidelidad; como todo modelo generativo de este tamaño, puede producir información falsa con aparente seguridad.
- Limitaciones de contexto e idioma: solo se declaran inglés y chino; no se especifica la longitud de contexto, lo que impide planificar cargas de contexto largo.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el modelo incorpora modificaciones de terceros y datasets propios (Polar-STRICT, F451-STRICT) cuya licencia no se detalla; conviene verificar la procedencia antes de un uso comercial.
- Caveat de producción: los benchmarks citados son afirmaciones del autor sin metodología pública; no deben tomarse como garantía. El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.
- El pipeline declarado image-text-to-text no está respaldado por especificaciones de visión en la información disponible; no asumir capacidades multimodales sin probarlas.
- El tamaño del repositorio (389 GB) y la multiplicidad de cuantizaciones pueden complicar la gestión de artefactos en producción.

## Enlaces

- HuggingFace: https://huggingface.co/abighozali/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia de la técnica Cold Fusion (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
