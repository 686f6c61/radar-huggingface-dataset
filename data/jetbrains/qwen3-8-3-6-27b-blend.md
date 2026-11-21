# JetBrains/Qwen3.8-3.6-27B-blend

## Resumen

Qwen3.8-3.6-27B-blend es un modelo derivado no oficial publicado por JetBrains que combina, mediante interpolación lineal de pesos, dos checkpoints de la familia Qwen: Qwen3.6-27B y Qwen3.8-27B, ambos desarrollados por Alibaba Cloud. El resultado es un modelo de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) con arquitectura transformer de la familia Qwen 3.5/3.6/3.8, orientado a tareas de imagen-texto-a-texto y conversación, y distribuido bajo licencia Apache 2.0.

La relevancia del modelo no reside en un entrenamiento nuevo —no se realizó ninguno— sino en el procedimiento de merge: una media aritmética 50/50 de los parámetros de ambos checkpoints con acumulación en float32. JetBrains documenta que el objetivo es mejorar la eficiencia en tokens de salida en tareas de código, y publica evaluaciones sobre un benchmark interno de 100 tareas de programación, además de artefactos auxiliares como un modelo draft DFlash2 para decodificación especulativa, versiones GGUF, MLX 4-bit y MTP MLX 4-bit.

El modelo se distribuye con la configuración, tokenizer, processor y chat template heredados de Qwen3.8-27B, e incluye un draft model DFlash2 afinado sobre trayectorias de código de Junie (el agente de JetBrains). Es, por tanto, una pieza pensada para despliegue local en flujos de asistencia a la programación, no un modelo generalista con entrenamiento propio verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5/3.6/3.8 (tag `qwen3_5`); merge lineal de dos checkpoints |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (repo principal), GGUF, MLX 4-bit, MTP MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen (etiquetado `qwen3_5` en los tags del repositorio) con 27,8 mil millones de parámetros. No se trata de un modelo entrenado desde cero ni afinado: la model card indica explícitamente que no se realizó entrenamiento adicional ni se utilizaron datos nuevos. La preparación consistió en la interpolación lineal de los parámetros de Qwen3.6-27B (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) y Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), con la fórmula `0.5 * Qwen3.6-27B + 0.5 * Qwen3.8-27B` y acumulación en float32. Los detalles exactos de revisiones y ajustes del merge se registran en `merge-manifest.json`.

La innovación técnica destacable no está en el modelo objetivo sino en el ecosistema que lo acompaña: un draft model DFlash2 incluido en el subdirectorio `DFlash2/`, con los mismos pesos que el repositorio independiente `JetBrains/Qwen3.8-3.6-27B-blend-DFlash2`, afinado a partir del drafter público `incoai/Qwen3.8-27B-DFlash2` sobre trayectorias de código de Junie. Este draft se verifica contra el modelo objetivo durante decodificación especulativa y es un checkpoint independiente, no parte del modelo principal. También se publican variantes MTP (multi-token prediction) en MLX 4-bit.

## Capacidades

- Generación de texto conversacional multi-turno, con chat template heredado de Qwen3.8-27B.
- Procesamiento de imagen y texto como entrada (`image-text-to-text`), según el pipeline declarado.
- Generación y asistencia en código, evaluada por JetBrains en un benchmark interno de 100 tareas de programación.
- Eficiencia en tokens de salida: la propuesta de valor del merge es completar tareas con menos tokens generados, según las gráficas publicadas por JetBrains.
- Decodificación especulativa mediante el draft DFlash2 incluido, orientada a reducir latencia en inferencia local.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su exposición como servicio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en IDE local: el modelo está pensado para integrarse en Junie Local y flujos similares, donde un modelo de 27,8 B en BF16 o cuantizado 4-bit puede ejecutarse en hardware de desarrollador y completar tareas de programación con un presupuesto de tokens de salida reducido.
- Autocompletado y generación de parches en pipelines de CI/CD: la variante GGUF y las versiones MLX permiten desplegar el modelo en runners con GPU consumer o Apple Silicon, generando diffs y correcciones sobre el código del repositorio.
- Revisión de código asistida: con contexto conversacional multi-turno, puede mantener hilos de revisión sobre fragmentos de código y comentarios, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Servicio de inferencia compatible con endpoints: el tag `endpoints_compatible` sugiere su uso detrás de una API HTTP para equipos que quieran un endpoint de código autoalojado bajo Apache 2.0.
- Inferencia de baja latencia en estación de trabajo: combinando el modelo con el draft DFlash2 se puede montar decodificación especulativa para reducir el tiempo por token en tareas de generación larga, como documentación técnica o tests.
- Procesamiento de capturas y diagramas: al declarar pipeline `image-text-to-text`, puede emplearse para extraer información de imágenes de interfaz, diagramas de arquitectura o capturas de error y convertirlas en texto o código.
- Evaluación comparativa de merges: como artefacto reproducible (manifest de merge incluido), sirve para investigar el efecto de la interpolación de checkpoints en eficiencia de tokens y calidad de código.

## Benchmarks y rendimiento

La model card referencia un benchmark interno de JetBrains de 100 tareas de programación, presentado como gráfica de tareas completadas frente a tokens de salida, con la advertencia de que los ajustes de razonamiento difieren entre configuraciones. No se proporcionan valores numéricos en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| Benchmark interno de código de JetBrains (100 tareas) | no disponible (solo gráfica publicada) | Metodología en el blog de JetBrains; ajustes de razonamiento variables |
| MMLU | no disponible | No publicado en la información proporcionada |
| HumanEval | no disponible | No publicado en la información proporcionada |
| GSM8K | no disponible | No publicado en la información proporcionada |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos (27,78 B × 2 bytes), más overhead de activaciones y KV cache; requiere GPU de 80 GB (A100, H100) para contexto amplio.
- VRAM estimada en 4-bit (MLX 4-bit): del orden de 14-16 GB para pesos, más overhead; viable en GPUs consumer de 24 GB (RTX 4090, RTX 3090) y en Apple Silicon con memoria unificada de 24 GB o más.
- VRAM estimada en GGUF Q4/Q5: aproximadamente 16-20 GB según cuantización; cabe en RTX 4090 de 24 GB y en configuraciones de 32 GB.
- GPU recomendadas: A100 80 GB y H100 para BF16 con contexto largo; RTX 4090/3090 y Apple Silicon (M-series con 32 GB o más) para cuantizaciones 4-bit.
- Opciones de despliegue: transformers (librería declarada), llama.cpp/Ollama vía GGUF, MLX para Apple Silicon (incluida la variante MTP MLX 4-bit), y servidores compatibles con endpoints.
- Decodificación especulativa: el draft DFlash2 incluido en `DFlash2/` permite acelerar la generación verificando candidatos contra el modelo objetivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JetBrains/Qwen3.8-3.6-27B-blend | 27,8 B | no disponible | Apache 2.0 | HF (BF16, GGUF, MLX 4-bit, MTP MLX 4-bit, DFlash2) | Merge 50/50 de dos checkpoints Qwen; sin entrenamiento adicional |
| Qwen/Qwen3.6-27B | 27 B (aprox.) | no disponible | no disponible en la información | HF | Checkpoint upstream; base del merge |
| Qwen/Qwen3.8-27B | 27 B (aprox.) | no disponible | no disponible en la información | HF | Checkpoint upstream; aporta config, tokenizer y chat template |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible en la información | HF | Drafter público del que deriva el DFlash2 de JetBrains |

Los datos de rendimiento comparado no están disponibles; la única comparación publicada es la gráfica interna de JetBrains frente a tokens de salida, sin cifras en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial: no está afiliado, patrocinado ni respaldado por Alibaba Cloud ni Alibaba Group; la atribución y los cambios se documentan en `NOTICE` y `CHANGES.md`.
- Sin entrenamiento adicional: el merge puede degradar capacidades respecto a los checkpoints originales en tareas no evaluadas; no hay garantía de que la interpolación preserve el rendimiento en razonamiento, matemáticas o multilingüismo.
- Sin datos verificables de benchmarks públicos (MMLU, HumanEval, GSM8K): la única evaluación es interna de JetBrains y no numérica en la información disponible.
- Longitud de contexto e idiomas soportados no documentados: debe validarse antes de usarlo en producción con contextos largos o idiomas distintos del inglés.
- Riesgo de alucinación inherente a los modelos generativos; en código puede producir APIs inexistentes o parches incorrectos, por lo que requiere verificación en CI.
- Sesgos: no documentados en la información proporcionada; al heredar los datos de entrenamiento de Qwen, arrastra los sesgos de los checkpoints originales.
- Licencia Apache 2.0 permite uso comercial, pero el aviso de uso aceptable recuerda que emplear el modelo para infringir derechos de propiedad intelectual de terceros puede violar la ley.
- El draft DFlash2 es un checkpoint independiente y debe servirse junto al modelo objetivo; no forma parte de los pesos del modelo principal.
- Repositorio de 59,4 GB: el despliegue en BF16 exige almacenamiento y memoria considerables; las variantes cuantizadas son la vía práctica para hardware consumer.
- Fecha de creación y actualización (septiembre-octubre de 2026) y métricas de comunidad (853 descargas, 43 likes) indican adopción limitada; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend
- Variante GGUF: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-GGUF
- Variante MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MLX-4bit
- Variante MTP MLX 4-bit: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-MTP-MLX-4bit
- Draft DFlash2: https://huggingface.co/JetBrains/Qwen3.8-3.6-27B-blend-DFlash2
- Drafter público de origen: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de JetBrains sobre Junie Local y eficiencia de tokens: https://blog.jetbrains.com/junie/2026/09/smarter-local-al/
- Resumen de datos de entrenamiento de Qwen: https://qwen.ai/training-data-summary
- Web de JetBrains: https://www.jetbrains.com/
