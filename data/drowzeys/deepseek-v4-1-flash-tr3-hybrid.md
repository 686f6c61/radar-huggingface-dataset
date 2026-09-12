# drowzeys/DeepSeek-V4.1-Flash-TR3-Hybrid

## Resumen

DeepSeek-V4.1-Flash-TR3-Hybrid es un empaquetado de cuantización híbrida del modelo multimodal deepseek-ai/DeepSeek-V4.1-Flash, publicado por el usuario drowzeys. No es un modelo entrenado desde cero ni un ajuste fino: es un checkpoint de pesos comprimidos pensado para ejecutarse en un clúster de 4 nodos NVIDIA DGX Spark (GB10) con memoria unificada. El método aplicado es el TR3 de brandonmusic, que reserva el formato de 4 bits nativo para los expertos con mayor error de ida y vuelta y comprime el resto con trellis EXL3.

La arquitectura subyacente es un transformer disperso (MoE) con 384 expertos enrutados más 1 experto compartido, enrutamiento top-6, `moe_intermediate_size` de 2304 y una ventana de contexto de 1.000.000 de tokens. La model card describe un backbone de 552B parámetros, mientras que el recuento de safetensors del repositorio arroja 650.244.189.394 parámetros totales; la información disponible no desglosa esa diferencia. El pack ocupa 410 GB en 48 shards (frente a los 476 GB del modelo oficial), de los cuales los shards 47-48 corresponden al módulo Engram y se mantienen en formato oficial mediante enlaces duros.

Su relevancia es acotada pero clara: documenta una receta reproducible de cuantización no uniforme para MoE de gran tamaño, con una mezcla efectiva de ≈3,22 bits por peso en la parte MoE, y describe con detalle los obstáculos reales de despliegue (alineación de 128 en las GEMM de EXL3, límites de memoria unificada y OOM de CUDA graphs). Se publica bajo licencia MIT y es un artefacto de comunidad, sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (384 expertos enrutados + 1 compartido, top-6); multimodal image-text-to-text según el pipeline declarado |
| Parametros totales | 650.244.189.394 (recuento real de safetensors); la model card cita un backbone de 552B en el modelo base |
| Parametros activos | no disponible (la model card no publica el recuento de parámetros activos; se sabe que el enrutamiento es top-6 sobre 384 expertos + 1 compartido) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Híbrida TR3: cola de expertos enrutados en EXL3-TR3 K=3 con codebook mcg a 3,0 bpw; 64 expertos por capa en MXFP4 nativo (E2M1 + UE8M0/32) a 4,25 bpw; mezcla ponderada por expertos ≈3,22 bpw; atención, experto compartido, normas y embeddings sin cambios en FP8 oficial |
| Idiomas soportados | no disponible |
| Licencia | MIT (la misma que la release DeepSeek-V4.1-Flash) |
| Formato de pesos | safetensors (48 shards, 440,1 GB de repositorio) |

## Arquitectura y entrenamiento

El checkpoint no implica entrenamiento nuevo: es una recomposición de los pesos de DeepSeek-V4.1-Flash. La innovación está en el esquema de cuantización. Se calcula el error de ida y vuelta del trellis por experto y, en cada capa, los 64 expertos con mayor error se dejan en MXFP4 nativo (4,25 bpw), mientras que el resto de expertos enrutados se comprime con EXL3-TR3 K=3 y codebook mcg a 3,0 bpw sobre las matrices completas (tanto 2304 como 5120 son múltiplos de 128, requisito de las GEMM de EXL3). Las capas DSpark 37-39, que tienen 128 expertos enrutados, también conservan 64 expertos en MXFP4 y dejan 64 en la cola EXL3.

| Componente | Formato | bpw |
|---|---|---|
| Cola de expertos enrutados | EXL3-TR3 K=3, codebook mcg | 3,0 |
| 64 expertos retenidos por capa | MXFP4 nativo (E2M1 + UE8M0/32) | 4,25 |
| Mezcla ponderada por expertos | 64 retenidos + resto en cola | ≈3,22 |
| Atención, experto compartido, normas, embeddings | FP8 oficial / nativo | sin cambios |
| Engram (shards 47-48) | oficial, enlazado por hardlink | sin cambios (~203 GB) |

El proceso de cuantización no pudo ejecutar la pasada con Hessiano real porque no cabía en 4×128 GB de memoria unificada; se recurrió a Hessiano identidad con `q_fallback`. La única métrica de fidelidad publicada es una prueba de humo sobre una matriz de 5120×2304 con Hessiano identidad y codebook mcg, con un NMSE de 1,74e-2. El encoder utilizado es `encode_dsv41_tr3.py`, que encapsula el núcleo numérico TR3. El campo `config.json` `hybrid_tr3_tail` registra `bits: 3.0`, `codebook: mcg` y `keep_mxfp4_per_layer: 64`. El método TR3 es obra de brandonmusic, publicado por primera vez en `brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid` con el núcleo `encode_tr3_v31.py`; este repositorio lo traslada a DeepSeek-V4.1-Flash.

## Capacidades

- Generación multimodal de imagen y texto: el `pipeline_tag` declarado es `image-text-to-text`, por lo que el modelo acepta entradas de imagen junto con texto.
- Procesamiento de contexto muy largo: ventana de 1.000.000 de tokens, con una configuración de servicio validada por el autor usando caché KV de aproximadamente 4 GiB.
- Generación de texto condicionada por un MoE de 384 expertos enrutados con top-6, lo que reparte el coste de cómputo entre un subconjunto de expertos por token.
- Razonamiento, código, matemáticas y soporte de tool calling o agentes: no documentados explícitamente en la información disponible de este pack; habría que validarlos contra el modelo base, ya que la model card no publica evaluaciones de capacidad.
- Capacidades multilingües: no disponible; no se declara la lista de idiomas soportados.
- Capacidades especiales declaradas: cuantización híbrida EXL3 + MXFP4, compatibilidad con endpoints (`endpoints_compatible`) y orientación a hardware DGX Spark (GB10).

## Casos de uso

- Procesamiento documental multimodal en local: con 1M de tokens de contexto y entrada de imagen, se pueden pasar lotes de informes escaneados, gráficos y tablas en una sola petición, sin trocear el documento ni depender de un servicio en la nube.
- Despliegue en entornos air-gapped con soberanía de datos: el pack está pensado para 4× DGX Spark en rack propio, de modo que datos sensibles de salud, legal o defensa no salen de la infraestructura del cliente.
- Analítica sobre corpus extensos: resumen, extracción y preguntas sobre bases de conocimiento internas que superan con holgura el contexto de modelos de 128K o 200K, aprovechando la ventana de 1M.
- Investigación en compresión de modelos: el repositorio sirve como referencia reproducible para estudiar el compromiso entre bpw y error de reconstrucción en MoE grandes, y para comparar contra el enfoque uniforme de Pollard.
- Comparación de metodologías de cuantización: evaluar la mezcla TR3 (64 expertos MXFP4 + cola EXL3 3,0 bpw) frente a `bot-lab-21/DeepSeek-V4.1-Flash-EXL3-3.5bpw-Pollard` con idéntico prompt y hardware, midiendo degradación de calidad.
- Servicio de inferencia con contexto largo en clúster pequeño: la configuración eager + skip dummy + ~4 GiB de KV descrita por el autor permite servir la ventana completa de 1M tokens en cuatro Spark, algo fuera del alcance de la mayoría de despliegues de un solo nodo.
- Reproducción de pipelines de cuantización: reutilizar el encoder `encode_dsv41_tr3.py` y el criterio de retención por error de ida y vuelta para cuantizar otros MoE con la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación de capacidad, ni comparaciones numéricas contra el modelo base o contra otros packs cuantizados. La única cifra técnica publicada es una métrica de fidelidad de cuantización, no de calidad de tarea:

| Metrica | Valor | Contexto |
|---|---|---|
| NMSE (prueba de humo) | 1,74e-2 | Matriz 5120×2304, Hessiano identidad, codebook mcg |
| bpw de la mezcla MoE | ≈3,22 | 64 expertos MXFP4 por capa + cola EXL3 3,0 bpw |
| Reduccion de disco (no Engram) | 273 GB → 207 GB (~0,76×) | Coherente con 320/384 expertos a 3/4,25 bpw y 64/384 en MXFP4 |

## Requisitos de hardware

- Almacenamiento: 410 GB para el pack de pesos y 440,1 GB de repositorio completo, repartidos en 48 shards. Los shards 47-48 (Engram, ~203 GB) se mantienen en el formato oficial y están enlazados por hardlink.
- Hardware de referencia del autor: 4× NVIDIA DGX Spark (GB10) con memoria unificada de 128 GB por nodo, es decir, unos 512 GB agregados.
- Memoria para cuantizar: el proceso con Hessiano real no cupo en 4×128 GB de memoria unificada, por lo que se usó Hessiano identidad.
- Consumer GPU: no disponible. Con 410 GB de pesos, el pack no cabe en una GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de dos o cuatro tarjetas de 24-48 GB; el autor lo orienta exclusivamente a un clúster de cuatro nodos.
- Alineación obligatoria: las GEMM de EXL3 exigen N % 128 == 0. Un TP4 uniforme sobre expertos de 2304 da 576 por rank, que es ilegal. Las opciones válidas son expert-parallel con 96 expertos completos de 2304 por rank, un TP4 desigual de 512/640/640/512, o TP3 con 2304/3 = 768, que requiere los parches TP3 de V4.1 (cabezas virtuales de 64 a 72).
- CUDA graphs: siguen produciendo OOM en la memoria unificada de GB10 si se apilan con DSpark y un pin grande de KV. La configuración que ha funcionado es modo eager, skip dummy y aproximadamente 4 GiB de caché KV, suficiente para servir 1M de contexto con una respuesta coherente en cuatro Spark.
- Opciones de despliegue: la información disponible solo documenta la ruta de runtime propia sobre el núcleo EXL3 (con el plugin expert-parallel descrito). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla la integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drowzeys/DeepSeek-V4.1-Flash-TR3-Hybrid | 650,24B (safetensors); backbone 552B según model card | 1M tokens | Híbrida TR3: EXL3-TR3 3,0 bpw + 64 expertos MXFP4/capa (≈3,22 bpw de mezcla MoE) | MIT | Repositorio público, 440,1 GB, 0 descargas y 1 like en el momento de la consulta |
| bot-lab-21/DeepSeek-V4.1-Flash-EXL3-3.5bpw-Pollard | no disponible | no disponible | EXL3 ~3,51 bpw uniforme tipo Pollard en todos los expertos enrutados | no disponible | no disponible |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | backbone de 552B según la model card | 1M tokens | FP8 oficial / nativo, 476 GB en disco | MIT | Repositorio oficial |
| brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid (origen del método) | no disponible | no disponible | NVFP4 + cola EXL3-TR3 con el mismo núcleo numérico | no disponible | no disponible |

La diferencia clave frente al pack Pollard es metodológica: allí todos los expertos enrutados se cuantizan de forma uniforme a ~3,51 bpw, mientras que aquí se invierte precisión extra (4,25 bpw) en los 64 expertos por capa con mayor error de ida y vuelta y se baja a 3,0 bpw en el resto.

## Limitaciones y advertencias

- Sin evaluaciones de calidad: no hay benchmarks publicados, por lo que no se puede cuantificar la degradación frente al modelo base ni frente a otros packs cuantizados.
- Error de cuantización medido: el único dato de fidelidad disponible es un NMSE de 1,74e-2 en una prueba de humo con Hessiano identidad, no con el Hessiano real, lo que puede infravalorar o distorsionar el error efectivo en otras matrices.
- Idiomas no declarados: la información disponible no especifica la cobertura lingüística del modelo, lo que impide planificar despliegues multilingües con garantías.
- Sesgos: no documentados. Al no haber model card de evaluación ni auditoría, no se pueden anticipar sesgos demográficos, culturales o de dominio.
- Alucinación: no existe ningún estudio específico sobre este pack; al ser una recompresión de un modelo generativo, mantiene el riesgo inherente de producir contenido plausible pero falso, especialmente en contexto de 1M tokens donde la atención puede diluirse.
- Compatibilidad de runtime muy restringida: EXL3 requiere N % 128 == 0, lo que invalida un TP4 uniforme sobre expertos de 2304 y obliga a repartos personalizados o a parches de TP3. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Inestabilidad en memoria unificada: las CUDA graphs producen OOM en GB10 cuando se combinan con DSpark y un pin de KV grande; hay que renunciar a ellas.
- Licencia: MIT, la misma que la release del modelo base, por lo que se permite uso comercial. Aun así, conviene atribuir el método de cuantización híbrida a brandonmusic y respetar los términos del modelo base DeepSeek-V4.1-Flash, además del crédito a DeepSeek-AI y al trellis EXL3 / mcg.
- Madurez del repositorio: creado el 12 de septiembre de 2026, con 0 descargas y 1 like, es un artefacto de comunidad sin validación independiente; no debería adoptarse en producción sin una evaluación propia.
- Confusión de etiquetado: el propio autor advierte de que no debe describirse como un pack "solo de 3 bpw"; la mezcla real ronda 3,22 bpw en la parte MoE.
- Reproducción de la cuantización: la pasada con Hessiano real no cabe en 4×128 GB, de modo que replicar el pipeline con calidad óptima exigiría más memoria que la del hardware objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/drowzeys/DeepSeek-V4.1-Flash-TR3-Hybrid
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Pack alternativo con cuantización uniforme Pollard: https://huggingface.co/bot-lab-21/DeepSeek-V4.1-Flash-EXL3-3.5bpw-Pollard
- Origen del método TR3 híbrido: https://huggingface.co/brandonmusic/GLM-5.2-NVFP4-TR3-Hybrid
- Perfil del autor del método de cuantización: https://huggingface.co/brandonmusic
- Papers, blogs, repositorios y demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo (únicamente resultados no pertinentes sobre letras de canciones), por lo que no se han podido recopilar enlaces técnicos adicionales.
