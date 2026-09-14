# PYTHAI/Qwen3.8-Flash-Next-fork

## Resumen

PYTHAI/Qwen3.8-Flash-Next-fork es un repositorio de tipo "pointer fork" publicado en Hugging Face el 13 de septiembre de 2026 que **no contiene pesos**. Conserva únicamente la licencia, la configuración, el tokenizer y el código del commit `de4b8e4d43b917e7706784d8bb445c9af86a3540` del modelo Qwen/Qwen3.8-Flash-Next, junto con los digests SHA-256 en un fichero `FORK.json`. Los 131 ficheros de pesos (360,0 GB) permanecen en el repositorio de origen. Su utilidad práctica es la de fijar una revisión exacta con fines de trazabilidad y de licencia, no la de servir inferencia por sí mismo.

El modelo subyacente, Qwen3.8-Flash-Next, es un modelo de lenguaje causal con encoder de visión desarrollado por Qwen (Alibaba). Se presenta como la vista previa experimental de la arquitectura que sustentará Qwen4 y combina Gated DeltaNet con Qwen Sparse Attention (QSA), residuales con puerta (Gated Residual) y embeddings de n-gramas. Cuenta con 125.000 millones de parámetros totales y 6.000 millones activos por token, más 51.000 millones de parámetros de embedding de n-gramas y 4.000 millones adicionales de predicción multi-token (MTP).

Su relevancia inmediata es doble. Por un lado, introduce una vía de escalado de parámetros distinta de la mezcla de expertos: los embeddings de n-gramas son más económicos en cómputo y más aptos para descarga a memoria secundaria, lo que resulta útil en aceleradores con memoria limitada. Por otro, apunta a cargas de trabajo agénticas con contexto largo, con 262.144 tokens nativos ampliables hasta 1.000.000, y una atención dispersa por microbloques que reduce la latencia en contextos extensos. La licencia aplicada es la qwen-community-1.0, bajo la etiqueta `license:other`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; híbrido Gated DeltaNet + Qwen Sparse Attention (QSA), MoE y Gated Residual |
| Parámetros totales | 125.000 millones activables, más 51.000 millones de embedding de n-gramas y 4.000 millones de MTP |
| Parámetros activos | 6.000 millones por token (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos; ampliable hasta 1.000.000 |
| Tipos de cuantización | no disponible (el repositorio de origen publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ en la información proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (`license:other`, con `license_link: LICENSE`) |
| Formato de pesos | safetensors (131 ficheros, 360,0 GB, alojados en el repositorio de origen, no en este fork) |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Autor del fork | PYTHAI |
| Descargas / likes del fork | 0 / 0 |
| Tamaño del repositorio del fork | 0,0 GB (sin pesos) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

El bloque se repite 12 veces con la disposición `12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE))`, sobre 48 capas y una dimensión oculta de 2560. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Qwen Sparse Attention usa 24 cabezas de consulta y 2 de clave-valor con dimensión de cabeza 256 y 64 dimensiones de RoPE; su indexador es MQA con 4 cabezas de consulta y 1 cabeza de clave compartida de dimensión 128, y un presupuesto de 512 bloques o 2048 tokens. En lugar de seleccionar tokens individuales, QSA opera a nivel de microbloque, lo que según el autor reduce de forma significativa la latencia en contexto largo. La capa MoE dispone de 512 expertos con dimensión intermedia 640 y activa 10 enrutados más 1 compartido. Gated Residual modula el flujo de información mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, con 4 ramas y rango de cuello de botella 320.

El embedding de tokens tiene 248.320 entradas (con padding) y el embedding de n-gramas indexa 20.000.000 de bigramas y trigramas en la capa 2, lo que constituye el eje principal de escalado de parámetros de esta arquitectura. La salida del modelo de lenguaje también es de 248.320 entradas. Se añade una capa MTP entrenada con múltiples pasos. La receta de entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías de pesos específicas, elimina los calentamientos tradicionales de tamaño de lote (arrancando directamente con el lote objetivo, guiado por leyes de escalado reajustadas) y admite tasas de aprendizaje mayores. El proceso cubre fases de preentrenamiento y postentrenamiento; la información disponible no detalla el volumen de tokens, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje causal, con fase de postentrenamiento declarada.
- Procesamiento conjunto de imagen y texto: la etiqueta de pipeline es `image-text-to-text` y el modelo incorpora un encoder de visión.
- Razonamiento sobre contextos largos: 262.144 tokens nativos y extensión hasta 1.000.000, con atención dispersa por microbloques orientada a reducir la latencia.
- Cargas de trabajo agénticas: el autor justifica explícitamente el diseño de QSA por el peso creciente de los flujos agénticos en el uso real.
- Predicción multi-token: dispone de una capa MTP entrenada con múltiples pasos, lo que habilita decodificación especulativa o MTP, si bien el material disponible no detalla su modo de uso.
- Multilingüismo: no disponible; la información proporcionada no enumera idiomas soportados.
- Tool calling / function calling: no confirmado en la información disponible para la variante open-weight. La variante oficial Qwen3.8-Flash, servida a través de Qwen Cloud, sí se describe con herramientas integradas oficiales y contexto de 1M por defecto.
- Despliegue compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Capacidad de descarga parcial: el embedding de n-gramas está diseñado para ser apto para offloading en aceleradores con memoria limitada.

## Casos de uso

- Agentes con contexto largo: el modelo puede mantener hilos de trabajo de cientos de miles de tokens gracias a los 262.144 tokens nativos, ampliables a 1M, con una atención dispersa que busca contener la latencia cuando el historial crece.
- Automatización documental con visión: al combinar encoder de visión y generación de texto, permite extraer y resumir información de capturas, informes escaneados o diapositivas dentro de un mismo contexto.
- Procesamiento por lotes en infraestructura multi-GPU: con 6.000 millones de parámetros activos por token, el coste de cómputo por token es bajo en relación con los 125.000 millones totales, lo que resulta adecuado para servicios de generación de alto volumen desplegados con vLLM o SGLang.
- Auditoría de procedencia de modelos: el fork permite fijar una revisión exacta (`de4b8e4d43b917e7706784d8bb445c9af86a3540`) con digests SHA-256 verificables, útil en pipelines regulados que exigen reproducibilidad de artefactos.
- Cumplimiento de licencia en organizaciones: conserva el fichero LICENSE del commit de origen, lo que facilita demostrar bajo qué términos se distribuye una copia desplegada.
- Extracción de entidades y relaciones sobre corpus extensos: el contexto nativo de 262.144 tokens permite procesar documentos completos sin fragmentación agresiva, reduciendo la pérdida de referencias cruzadas.
- Indexación y búsqueda aumentada sobre memorias técnicas: el embedding de n-gramas de 20 millones de entradas ofrece un eje de escalado orientado a calidad léxica con coste de cómputo bajo.
- Desarrollo de entornos de evaluación para Qwen4: al ser una vista previa experimental de la arquitectura base de Qwen4, sirve para validar toolchains, cuantizaciones y planificadores de memoria antes del lanzamiento de la generación siguiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección "Benchmark Results" con tablas de comparación, pero el contenido numérico está truncado en el material proporcionado, por lo que no es posible reproducir ninguna cifra de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Tamaño de pesos: 131 ficheros que suman 360,0 GB en el repositorio de origen. Este fork no almacena ninguno.
- VRAM estimada en BF16: alrededor de 360 GB solo para pesos, más memoria para caché KV. Estimación a partir del tamaño del repositorio; no confirmada en la información disponible.
- VRAM estimada en 8 bits: del orden de 180 GB; en 4 bits, del orden de 90-100 GB. Estimaciones derivadas del tamaño de los pesos, no datos publicados por el autor.
- GPU recomendadas: 8 × H100 80 GB o 4 × H200 141 GB para BF16; 2 × H100 80 GB o 1 × H200 para 4 bits, siempre con margen para caché KV y activaciones.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB en una sola unidad. No se documenta ninguna variante cuantizada de consumo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card del repositorio de origen. Carga recomendada con revisión fijada y `trust_remote_code=True`.
- Alternativa gestionada: Qwen Cloud ofrece el servicio de API oficial, con Qwen3.8-Flash como versión de producción basada en Qwen3.8-Flash-Next.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PYTHAI/Qwen3.8-Flash-Next-fork | No almacena pesos; referencia a 125B/6B activos | Heredado del origen: 262.144 nativos, hasta 1.000.000 | qwen-community-1.0 | Repositorio de trazabilidad, sin pesos, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | 125B totales, 6B activos, 51B de n-gramas, 4B de MTP | 262.144 nativos, hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos, 360,0 GB en safetensors |
| Qwen3.8-Flash (Qwen Cloud) | No disponible | 1.000.000 por defecto | Propietaria, servicio gestionado | API gestionada con herramientas oficiales integradas |

No se dispone de datos verificados de benchmarks ni de especificaciones de terceros que permitan una comparación cuantitativa con alternativas de la misma categoría. Cualquier comparación frente a otros modelos abiertos de tamaño similar quedaría sin respaldo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos. Cualquier intento de carga directa desde PYTHAI/Qwen3.8-Flash-Next-fork fallará; es necesario cargar desde `Qwen/Qwen3.8-Flash-Next` con la revisión fijada.
- La licencia es `license:other` con nombre qwen-community-1.0. Los términos concretos de explotación comercial no están incluidos en la información proporcionada; hay que consultar el fichero LICENSE del commit de origen antes de cualquier uso en producción.
- Se trata de una vista previa experimental de la arquitectura, no de una versión de producción. La variante con características de producción es Qwen3.8-Flash, servida vía Qwen Cloud.
- Riesgo de alucinación: no cuantificado en la información disponible; no se han publicado evaluaciones de fiabilidad.
- Sesgos: no documentados en el material proporcionado.
- Idiomas soportados: no especificados, lo que impide valorar la cobertura multilingüe real.
- Sin validación de la comunidad: el fork acumula 0 descargas y 0 likes, por lo que no existe evidencia de uso ni verificación independiente de su contenido.
- Requisitos de memoria muy elevados: 360,0 GB de pesos implican infraestructura multi-GPU incluso en formatos cuantizados, con el consiguiente coste operativo.
- La capa MTP y el embedding de n-gramas añaden complejidad de despliegue que puede no estar soportada por igual en todos los motores de inferencia listados.
- Los resultados de búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo: tratan sobre criptomonedas y renta básica universal, por lo que no aportan datos verificables.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/Qwen3.8-Flash-Next-fork
- Modelo de origen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Entrada de blog del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Servicio gestionado: https://www.qwencloud.com
- Descripción de la variante oficial: https://www.qwencloud.com/models/qwen3.8-flash
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes.
