# Atomic-Germ/Qwen3.8-Flash-Next-Prune11264-177B-NPU2

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de visión publicado por el equipo Qwen (Alibaba) como vista previa experimental de la arquitectura que, según la model card, servirá de base para Qwen4. El repositorio analizado, `Atomic-Germ/Qwen3.8-Flash-Next-Prune11264-177B-NPU2`, es una publicación de terceros (usuario Atomic-Germ) que replica la model card oficial y añade en el nombre indicios de un proceso de poda ("Prune11264") y de orientación a NPU ("NPU2").

La arquitectura combina atención lineal Gated DeltaNet con Qwen Sparse Attention (QSA) a nivel de micro-bloque, mezcla de expertos (MoE) con 512 expertos, embeddings de n-gramas para escalado de parámetros y Gated Residual. La model card declara 125B parámetros totales con 6B activados, más 51B de embedding de n-gramas y 4B de MTP, y una longitud de contexto nativa de 262.144 tokens extensible a 1.000.000.

Existe una discrepancia crítica de datos: los metadatos de safetensors del repositorio indican 144.912.118 parámetros (~145M) y un tamaño de repo de 0,6 GB, cifras incompatibles con los 125B declarados en la model card. Cualquier evaluación de despliegue debe verificar primero el contenido real de los pesos antes de asumir las especificaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) + Qwen Sparse Attention (QSA) + MoE + Gated Residual + embeddings de n-gramas + MTP; incluye codificador de visión |
| Parametros totales | Discrepancia: metadatos safetensors del repo indican 144.912.118 (~145M); la model card declara 125B + 51B de n-gram embedding + 4B de MTP |
| Parametros activos | 6B (según model card); 10 expertos enrutados + 1 compartido de 512 totales |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 (la variante Qwen3.8-Flash servida en la nube usa 1M por defecto) |
| Tipos de cuantizacion | GGUF (etiqueta del repo); variantes concretas no disponibles |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`) |
| Formato de pesos | safetensors (Transformers) y GGUF; compatible con Transformers, vLLM, SGLang y TokenSpeed |

Otros datos de configuración declarados: dimensión oculta 2560; token embedding 248.320 (padded); n-gram embedding 20.000.000 (bigramas/trigramas en la capa 2); 48 capas; layout `12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE))`; Gated DeltaNet con 48 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; QSA con 24 cabezas Q y 2 KV, dimensión de cabeza 256, RoPE de 64 dimensiones, indexador MQA con 4 cabezas de consulta y 1 cabeza de clave compartida, dimensión de indexador 128, presupuesto de 512 bloques o 2048 tokens; MoE con 512 expertos y dimensión intermedia 640; Gated Residual con 4 ramas y rango de cuello de botella 320; MTP de 1 capa.

## Arquitectura y entrenamiento

El modelo abandona la pareja Gated DeltaNet + Gated Attention en favor de Gated DeltaNet + Qwen Sparse Attention (QSA). En lugar de seleccionar tokens individuales, QSA opera a nivel de micro-bloque (presupuesto de 512 bloques o 2048 tokens), lo que según la model card reduce de forma significativa la latencia en contextos largos, un punto crítico para cargas de trabajo agénticas. El layout repite 12 veces el patrón de tres bloques de Gated DeltaNet más uno de Qwen Sparse Attention, cada uno seguido de su capa MoE. Gated Residual modula el flujo de información en las residual streams mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, con el objetivo de ganar expresividad sin comprometer la estabilidad del entrenamiento ni añadir coste relevante en inferencia. Los embeddings de n-gramas (20M de entradas en la capa 2) permiten escalar parámetros con menos cómputo y con posibilidad de offloading frente a MoE, algo útil en aceleradores con memoria limitada.

El entrenamiento se divide en pre-entrenamiento y post-entrenamiento. La receta aplica Muon y AdamW a categorías de pesos específicas, elimina los calentamientos de tamaño de lote partiendo directamente del tamaño objetivo y admite tasas de aprendizaje más altas, guiada por leyes de escalado reajustadas. Se incluye una capa MTP entrenada con múltiples pasos (decodificación especulativa). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El repositorio concreto analizado parece además haber sufrido un proceso de poda y reempaquetado para NPU, sin documentación pública al respecto.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto nativa de 262.144 tokens, ampliable a 1.000.000.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), gracias al codificador de visión integrado.
- Razonamiento de múltiples pasos y cargas de trabajo agénticas, motivación explícita del diseño de QSA.
- Decodificación especulativa mediante la capa MTP, orientada a mejorar el throughput.
- Capacidades de código, matemáticas y razonamiento general: no se aportan datos verificables en la información disponible.
- Soporte de tool calling / function calling: no confirmado en la información disponible; la variante Qwen3.8-Flash servida en la nube sí menciona herramientas integradas oficiales.
- Capacidades multilingües: no disponibles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistentes conversacionales de contexto largo: con 262.144 tokens nativos se pueden mantener hilos extensos o procesar documentos completos en una sola pasada sin técnicas de troceado agresivas.
- Análisis de documentos con imágenes: el pipeline `image-text-to-text` permite extraer información de capturas, diagramas o escaneos junto al texto asociado en una misma conversación.
- Agentes autónomos de varios pasos: el diseño de QSA está orientado a reducir la latencia en contextos largos, lo que favorece bucles de razonamiento con historial creciente y muchas llamadas a herramientas.
- Indexación y consulta sobre bases de conocimiento internas: los embeddings de n-gramas y la posibilidad de offloading los hacen atractivos en entornos con memoria de acelerador restringida.
- Inferencia en el borde o en NPU: el sufijo "NPU2" del repositorio y el uso de embeddings de n-gramas apuntan a despliegues en aceleradores con memoria limitada, siempre que el tamaño real de los pesos lo permita.
- Generación asistida en pipelines de CI/CD para documentación o tests: viable solo si se confirma que el checkpoint es funcional y que la licencia comunitaria cubre el uso previsto. Sin datos de benchmark no se puede garantizar calidad en generación de código.
- Servicio de inferencia multiinquilino: la relación 6B activos sobre 125B totales declarados reduciría el coste de cómputo por token respecto a un modelo denso equivalente, si bien el requisito de memoria total sigue siendo alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección titulada "Benchmark Results" cuyo contenido tabular no se ha reproducido en los datos proporcionados, por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. No se deben asumir valores derivados del nombre del repositorio ni de comparaciones con otros modelos de la familia Qwen.

## Requisitos de hardware

- Advertencia previa: las estimaciones siguientes parten de los 125B parámetros declarados en la model card y entran en contradicción con los 144.912.118 parámetros de los metadatos de safetensors. Verifíquese el checkpoint real antes de dimensionar infraestructura.
- VRAM estimada para inferencia, asumiendo 125B totales: aproximadamente 250 GB en FP16/BF16, en torno a 125 GB en FP8 y alrededor de 70 GB en cuantización de 4 bits.
- Si el modelo activa solo 6B parámetros por token, el coste de cómputo es el de un modelo de ~6B, pero la memoria debe alojar el conjunto completo de pesos salvo que se apliquen estrategias de offloading.
- GPU recomendadas para el escenario de 125B: múltiples H100 80 GB o A100 80 GB (al menos 2 en FP8/INT8 y 4 en BF16), o clústeres equivalentes. En consumer GPU no cabe en el escenario de 125B; solo sería viable si el checkpoint real es de ~145M parámetros, en cuyo caso cabría en cualquier GPU de 8 GB o incluso en CPU.
- Opciones de despliegue mencionadas por el autor: Transformers, vLLM, SGLang y TokenSpeed. El repositorio incluye además pesos en formato GGUF, lo que abre la puerta a llama.cpp y a entornos derivados como Ollama, aunque no se documentan las variantes de cuantización disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La model card menciona la variante Qwen3.8-Flash como versión oficial orientada a producción, con 1M de contexto por defecto y herramientas integradas, servida a través de Qwen Cloud, pero no se aportan cifras que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next (este repo) | 125B declarados / 145M según safetensors | 262.144 nativo, hasta 1M | qwen-community-1.0 | Pesos en HuggingFace (0 descargas, 0 likes a fecha de creación) |
| Qwen3.8-Flash | no disponible | 1M por defecto | no disponible | API gestionada vía Qwen Cloud |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Inconsistencia grave de parámetros: los metadatos de safetensors indican ~145M de parámetros y 0,6 GB de repositorio, frente a los 125B declarados en la model card. Es imprescindible auditar los pesos antes de cualquier uso.
- Publicación de terceros: el autor es `Atomic-Germ`, no el equipo Qwen. La model card replica texto oficial, pero el proceso de poda y conversión a NPU no está documentado ni validado por el desarrollador original.
- Ausencia total de benchmarks publicados en la información disponible, lo que impide validar las afirmaciones de rendimiento.
- Riesgo de alucinación: no cuantificado por el autor; aplicable el comportamiento habitual de los modelos generativos.
- Idiomas soportados no especificados, por lo que no hay garantía de calidad fuera de los idiomas no declarados.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia `qwen-community-1.0` con campo `license: other`: es una licencia comunitaria con condiciones específicas. Debe revisarse el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de atribución, límites de escala o cláusulas de uso aceptable.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado en la misma fecha, sin evidencia de uso en producción ni de validación por parte de la comunidad.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados corresponden a la marca de esquí Atomic y a un comercio de airsoft), por lo que no hay fuentes externas independientes que confirmen las especificaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Flash-Next-Prune11264-177B-NPU2
- Blog post oficial de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Vista general de Qwen3.8-Flash en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-flash
- Servicio de API Qwen Cloud: https://www.qwencloud.com
- Imagen de arquitectura (referenciada en la model card): https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
