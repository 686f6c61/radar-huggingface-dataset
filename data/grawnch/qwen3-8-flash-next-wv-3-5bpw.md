# Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw

## Resumen

Qwen3.8-Flash-Next-WV-3.5bpw es una cuantización no lineal en formato GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. Se trata de una versión comprimida a 3.5 bits por peso (bpw) mediante el esquema propietario WV, que combina un codebook no lineal con un contenedor de bajo rango y una asignación dinámica por niveles de expertos. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 180.000 millones de parámetros totales, 48 capas, 512 expertos enrutados más un experto compartido por capa y una tabla de embeddings N-Gram a nivel de capa 1 (PLE).

La relevancia de esta publicación radica en que permite ejecutar un modelo MoE de 180B en hardware de gama alta para consumo o en un único nodo con GPU profesional, reduciendo el peso de los pesos principales a aproximadamente 55 GB distribuidos en VRAM y manteniendo la tabla PLE en RAM del host mediante mmap. La evaluación incluida en la model card reporta deltas de perplejidad moderados frente al modelo en BF16, con una coincidencia Top-1 superior al 84 % en la mayoría de las suites de evaluación.

La ficha se centra en la cuantización publicada, no en el modelo base original, del cual no se dispone de información detallada en los datos proporcionados. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) con 48 capas, 512 expertos enrutados + 1 experto compartido por capa, y tabla N-Gram Per-Layer Embedding (PLE) en capa 1 |
| Parametros totales | 180B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | WV no lineal a 3.5 bpw (codebook no lineal + contenedor de bajo rango + niveles dinámicos de expertos); tabla PLE en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards) |
| Tamano del repo | 28,8 GB (metadatos del repo; los shards suman 83,92 GB) |
| Vocabulario | 248.320 tokens |
| Shard 1 (VRAM) | 55,12 GB (51,33 GiB): embeddings, 48 capas transformer/GDN/MoE (1.223 tensores) y cabeza de salida |
| Shard 2 (RAM host, mmap) | 28,80 GB (26,82 GiB): tabla PLE N-Gram de capa 1 en Q4_0 (1 tensor) |
| Decodificador requerido | WV-compatible (p. ej. Strata) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE con 48 capas, 512 expertos enrutados y un experto compartido por capa, según los datos de la model card. Incluye además una innovación estructural denominada N-Gram Per-Layer Embedding (PLE) en la capa 1, que se materializa como una tabla de embeddings independiente y de gran tamaño (28,8 GB en Q4_0). La nomenclatura de tensores de la model card menciona capas "transformer / GDN / MoE", lo que sugiere la presencia de capas de atención lineal o híbridas del tipo Gated DeltaNet, aunque no se detalla su configuración exacta.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La cuantización WV aplica un codebook no lineal sobre los tensores de expertos enrutados (`ffn_*_exps.weight`), combinado con un contenedor de bajo rango y una asignación dinámica de niveles de precisión por experto. El resto de tensores se cuantiza con el esquema estándar del contenedor GGUF. La tabla PLE se separa en un segundo shard para permitir su carga por mmap desde RAM del host, reduciendo la presión sobre la VRAM.

## Capacidades

- Generación de texto y razonamiento: el modelo conserva la capacidad del base, con evaluación específica en modo `<think>` sobre matemáticas y código.
- Razonamiento matemático y generación de código: suite de evaluación propia con perplejidad de 5,474 en la cuantización frente a 5,434 en BF16.
- Modo de razonamiento explícito: la evaluación con etiquetas `<think>` indica soporte de cadenas de pensamiento estructuradas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Ejecución con decodificador WV-compatible: requisito imprescindible para la inferencia con esta cuantización.

## Casos de uso

- Despliegue de un MoE de 180B en un único nodo: con 55,12 GB en VRAM y 28,80 GB en RAM del host, el modelo cabe en configuraciones de 1×H100 80GB o 2×RTX 4090 (24 GB cada una) con offload parcial, lo que permite servir un modelo de gran escala sin clúster multi-nodo.
- Generación de código asistida en local: el modelo base muestra un rendimiento específico en suites de código y matemáticas con modo `<think>`, adecuado para autocompletado y revisión de código en entornos con requisitos de privacidad.
- Razonamiento matemático por lotes: la baja degradación de perplejidad en la suite Self-Gen Math/Code (+0,040) permite usar la cuantización para pipelines de resolución de problemas matemáticos sin reentrenamiento.
- Investigación sobre cuantización no lineal: el esquema WV con codebook y niveles dinámicos por experto es un objeto de estudio en sí mismo para evaluar el impacto de la compresión agresiva en modelos MoE.
- Servicio de inferencia con decodificador Strata: integrable en infraestructuras que ya soporten el formato WV, con la ventaja de que la tabla PLE reside en RAM y libera VRAM para el resto de capas.
- Evaluación comparativa de fidelidad de cuantizaciones: los datos de KLD, Top-1 y coseno de similitud permiten contrastar esta cuantización con otras alternativas del mismo modelo base en tareas de investigación.

## Benchmarks y rendimiento

Datos de evaluación de la cuantización frente al modelo en BF16, con vocabulario de 248.320 tokens:

| Suite de evaluacion | PPL BF16 | PPL WV-3.5bpw (ΔPPL) | KLD medio | Top-1 identico | CosSim final |
|---|---|---|---|---|---|
| Self-Gen Math/Code (`<think>`) | 5,434 | 5,474 (+0,040) | 0,09757 | 88,28 % | 0,956945 |
| External Held-Out (2048) | 11,443 | 10,212 (−1,232) | 0,18083 | 84,12 % | 0,948237 |
| WikiText-2 (4×2048) | 2,148 | 2,399 (+0,251) | 0,31614 | 85,50 % | 0,893036 |
| WikiText-2 (4×1024) | 2,301 | 2,586 (+0,285) | 0,33541 | 84,63 % | 0,891150 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son métricas de fidelidad de la cuantización, no de capacidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada: 55,12 GB (51,33 GiB) para el shard principal en GPU.
- RAM del host: 28,80 GB (26,82 GiB) adicionales para la tabla PLE cargada por mmap.
- GPU recomendadas: 1×H100 80GB, 1×A100 80GB, o 2×RTX 4090 / 2×RTX 3090 con reparto del shard principal.
- Cabe en GPU de consumo: sí, con 2×RTX 4090 (24 GB cada una) y suficiente RAM del sistema; no cabe en una única GPU de consumo de 24 GB.
- Opciones de despliegue: requiere un decodificador compatible con el formato WV, como Strata; no se indica compatibilidad con llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-3.5bpw (esta ficha) | 180B totales (activos no disponibles) | no disponible | WV 3.5 bpw | Apache 2.0 | GGUF (2 shards) |
| Qwen/Qwen3.8-Flash-Next (base) | 180B totales | no disponible | BF16 | Apache 2.0 | no disponible |
| Otras cuantizaciones del mismo base | 180B totales | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos sobre modelos alternativos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización WV no es compatible con decodificadores GGUF estándar; requiere un runtime específico (Strata u otro compatible con WV), lo que limita su portabilidad.
- La tabla PLE en Q4_0 ocupa 28,80 GB en RAM del host; sistemas con menos memoria disponible no podrán cargar el modelo completo.
- El delta de perplejidad en WikiText-2 es notable (+0,251 y +0,285), lo que indica una degradación medible en texto general frente a BF16.
- El KLD medio en WikiText-2 (0,316) y la coincidencia Top-1 del 85,5 % implican que aproximadamente 1 de cada 7 tokens predichos difiere del modelo original.
- La perplejidad en External Held-Out mejora frente a BF16 (−1,232), un resultado anómalo que conviene interpretar con cautela y no como una mejora real de capacidad.
- No hay información sobre sesgos, alucinaciones, idiomas soportados ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- No se han publicado benchmarks de capacidad (MMLU, HumanEval, GSM8K) para esta cuantización.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-3.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
