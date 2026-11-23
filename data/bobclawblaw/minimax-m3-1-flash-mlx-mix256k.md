# BobClawblaw/MiniMax-M3.1-Flash-MLX-mix256k

## Resumen

MiniMax-M3.1-Flash-MLX-mix256k es una conversión comunitaria del modelo MiniMax-M3.1-Flash de MiniMaxAI, publicada por el usuario BobClawblaw. Se trata de un checkpoint cuantizado con pérdida (lossy) diseñado específicamente para ejecutarse en un único Apple M5 Ultra con 256 GB de memoria unificada, mediante el motor Metal nativo de TensorFold (familia `minimax_m3`). No es un modelo nuevo ni un fine-tune: es una redistribución del release original con un esquema de cuantización mixta (3 y 4 bits en expertos, 8 bits en atención y capas densas) que reduce el peso total a unos 189 GiB.

El modelo base es un transformer multimodal de tipo MoE con 431.228.680.320 parámetros totales según los safetensors del repo, con una torre de visión (`minimax_m3_vl`) y un índice de atención tipo "lightning indexer". La conversión preserva la cabeza DSpark del release y añade el drafter DFlash2 de incoai para decodificación especulativa. La ventana de contexto efectiva en 256 GB es de 147.456 tokens con caché KV en bf16 exacta (el nombre "256k" proviene de los 262.144 tokens que permitía una caché int8).

Su relevancia es acotada pero concreta: permite servir un MoE de más de 400.000 millones de parámetros en hardware de consumo profesional Apple, algo imposible con los pesos originales en NVFP4/MXFP8. La contrapartida es una degradación medible de calidad (KL medio de 0,295 y 78,4 % de acuerdo top-1 frente al release NVFP4) y la dependencia de un motor no estándar (TensorFold) que aún está en revisión mediante pull request.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (model_type `minimax_m3_vl`, LM bajo `text_config`), con lightning indexer y torre de visión |
| Parametros totales | 431.228.680.320 |
| Parametros activos | no disponible |
| Longitud de contexto | 147.456 tokens efectivos en 256 GB con caché KV bf16 (262.144 con caché int8 en el release de referencia) |
| Tipos de cuantizacion | Expertos enrutados: 4-bit affine (grupos de 128) en capas 22, 24 y 59; 3-bit affine (grupos de 64) en las otras 57. Atención, experto compartido, capas densas, embeddings y cabeza de salida: 8-bit affine (grupos de 64). Router en fp32. Torre de visión en bf16 (convolución de patch en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (uso no comercial gratuito; uso comercial sujeto a atribución y aviso o autorización). El drafter DFlash2 es Apache-2.0 |
| Formato de pesos | safetensors (layout MLX affine quantization), con ficheros separados `model-vision.safetensors`, `model-dspark.safetensors` y `model-dflash2.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del release MiniMax-M3.1-Flash: un transformer MoE multimodal con torre de visión y un mecanismo de atención con "lightning indexer" (proyecciones propias para q, k, v e índice). El modelo se distribuye con su `config.json` original, sustituyendo únicamente el bloque `quantization` de MLX y manteniendo los bloques `dflash2` y `dspark` de los drafters junto a él. Los expertos enrutados se refit por mínimos cuadrados a partir de los pesos NVFP4 del release (escalas y sesgos ajustados a los valores NVFP4, no un simple redondeo al más cercano), mientras que atención, experto compartido, capas densas, embeddings y cabeza de salida provienen de los pesos MXFP8 originales, exactos en bf16 antes de cuantizar.

No hay información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en la información proporcionada; esos datos corresponden al release original de MiniMaxAI y no se detallan aquí. La innovación técnica destacable de este checkpoint es doble: por un lado, la cuantización mixta por capas (4 bits solo donde más se gana, 3 bits en el resto) y, por otro, la integración de dos drafters para decodificación especulativa —la cabeza DSpark del release y DFlash2 de incoai— de los que el motor carga solo uno.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base MiniMax-M3.1-Flash.
- Procesamiento multimodal: incluye torre de visión y proyector en bf16, por lo que conserva la capacidad de entrada de imágenes del release.
- Decodificación especulativa mediante drafters DSpark y DFlash2, con ganancia de velocidad en el motor TensorFold.
- Ventana de contexto larga: 147.456 tokens efectivos con caché KV bf16 exacta en un M5 Ultra de 256 GB.
- Router en fp32, lo que preserva la selección de expertos del release sin cuantizar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran escala en hardware Apple: el checkpoint está dimensionado para caber en un único M5 Ultra con 256 GB, lo que permite ejecutar un modelo de más de 400.000 millones de parámetros en una estación de trabajo sin clúster de GPUs.
- Procesamiento de documentos largos: con 147.456 tokens de contexto efectivo se pueden analizar contratos, informes o bases de código extensas en una sola pasada, manteniendo la caché KV en bf16 exacta para preservar la fidelidad de la atención.
- Análisis de imágenes con texto asociado: la torre de visión en bf16 permite tareas de descripción, extracción de información o respuesta a preguntas sobre capturas, diagramas y documentos escaneados.
- Prototipado e investigación en cuantización: el checkpoint sirve como referencia reproducible para estudiar el impacto de esquemas mixtos 3/4/8 bits sobre un MoE multimodal, con métricas de KL y acuerdo top-1 publicadas.
- Evaluación de decodificación especulativa: al incluir dos drafters (DSpark y DFlash2) con el mismo layout affine, permite comparar su rendimiento y su impacto en la calidad en un entorno controlado.
- Desarrollo de aplicaciones de escritorio con privacidad por diseño: al ejecutarse íntegramente en local sobre Apple Silicon, es adecuado para flujos donde los datos no pueden salir del dispositivo (sanidad, legal, análisis interno).
- Experimentación con contextos largos bajo restricciones de memoria: útil para medir el compromiso entre ventana (mix256k) y calidad (mix34) en un mismo hardware.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de fidelidad frente a los pesos NVFP4 del release, medidas con divergencia KL de siguiente token y acuerdo top-1 sobre 1.024 posiciones de un chat, en modo teacher-forced y con caché KV bf16 exacta (engine cb35b7c28):

| Checkpoint | KL medio | Acuerdo top-1 |
|---|---|---|
| mix34 | 0,244 | 80,7 % |
| mix256k | 0,295 | 78,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 189 GiB de pesos en total (DSpark y DFlash2 incluidos, aunque el motor carga un solo drafter). El checkpoint está dimensionado para un Apple M5 Ultra con 256 GB de memoria unificada.
- GPU recomendadas: Apple M5 Ultra con 256 GB. No está pensado para GPUs NVIDIA ni AMD; el layout es MLX affine y el motor es Metal nativo.
- Cabe en GPU de consumo: no en el sentido habitual (RTX 4090, 24 GB). Solo es viable en hardware Apple Silicon de gama alta con memoria unificada suficiente.
- Opciones de despliegue: exclusivamente TensorFold, familia `minimax_m3` (pull request #1235, en revisión), con la receta `BobClawblaw/minimax-m31-flash-mlx-m5-ultra`. El checkpoint no carga en mlx-lm ni en mlx-vlm.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a la receta para los datos de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-MLX-mix256k (este) | 431,2 B | 147.456 tokens (256 GB, KV bf16) | Mixta 3/4/8 bits affine | MiniMax Community | Hugging Face, motor TensorFold |
| MiniMax-M3.1-Flash (release original) | 431,2 B (según safetensors del derivado) | 262.144 tokens con caché int8 | NVFP4 (expertos) y MXFP8 (resto) | MiniMax Community | Hugging Face, MiniMaxAI |
| MiniMax-M3.1-Flash-MLX mix34 | 431,2 B | no disponible | Mixta 3/4/8 bits affine (más agresiva) | MiniMax Community | Hugging Face, BobClawblaw |

La comparación con alternativas de otros fabricantes (por ejemplo, MoE abiertos de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Cuantización con pérdida: la KL media de 0,295 y el 78,4 % de acuerdo top-1 implican una degradación real frente al release NVFP4; no es apta para tareas donde la fidelidad exacta al modelo original sea crítica.
- Dependencia de un motor no estándar: el checkpoint no carga en mlx-lm ni en mlx-vlm y requiere TensorFold con el pull request #1235, todavía en revisión; esto introduce riesgo de mantenimiento y de compatibilidad futura.
- Ventana efectiva menor de lo que sugiere el nombre: "256k" hace referencia a los 262.144 tokens con caché int8; con caché bf16 exacta en 256 GB la ventana real es de 147.456 tokens.
- Licencia restrictiva para uso comercial: la MiniMax Community License es gratuita solo para uso no comercial; el uso comercial exige atribución y el aviso o la autorización que describe la licencia.
- Licencias mezcladas: el drafter DFlash2 es de incoai bajo Apache-2.0, distinta de la del checkpoint principal; conviene revisar ambas antes de redistribuir.
- Idiomas soportados no documentados: no hay información sobre cobertura lingüística en la model card.
- Sesgos y alucinaciones: no se documentan análisis específicos; al ser una conversión del release, hereda los sesgos y el riesgo de alucinación del modelo base, que tampoco se detallan.
- Hardware muy específico: la viabilidad práctica está limitada a Apple M5 Ultra con 256 GB; no hay soporte documentado para otras plataformas.
- Repositorio con pocas señales de validación comunitaria: 468 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia externa sobre su comportamiento en producción.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/BobClawblaw/MiniMax-M3.1-Flash-MLX-mix256k
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Drafter DFlash2: https://huggingface.co/incoai/MiniMax-M3.1-Flash-DFlash2
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Pull request del motor (familia `minimax_m3`): https://github.com/ashhart/TensorFold/pull/1235
- Receta de despliegue: https://github.com/BobClawblaw/minimax-m31-flash-mlx-m5-ultra
