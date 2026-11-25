# slackcrow/DaisyRose-27B-oQ4h-mtp

## Resumen

DaisyRose-27B-oQ4h-mtp es una cuantización de 4 bits del modelo multimodal RadixArk/DaisyRose-27B, publicada por el usuario slackcrow y empaquetada específicamente para Apple Silicon mediante la librería MLX. El modelo base, desarrollado por RadixArk bajo licencia Apache-2.0, es un modelo de razonamiento multimodal construido sobre Qwen3.8-27B y entrenado exclusivamente con aprendizaje por refuerzo. Esta variante reduce el peso en disco desde los 52 GB del BF16 original hasta aproximadamente 16 GB, manteniendo la cabeza de predicción multi-token (MTP) para decodificación especulativa.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27.800 millones de parámetros con capacidades multimodales y de razonamiento en equipos con memoria unificada de Apple Silicon, un escenario tradicionalmente reservado a GPUs de datacenter. La cuantización emplea el esquema OMLX oQ4h de precisión mixta, calibrado con imatrix sobre datos de código, lo que preserva mejor la calidad en tareas de programación que una cuantización uniforme de 4 bits.

El contexto de 262.144 tokens y la arquitectura híbrida de atención lineal y completa lo sitúan en la gama alta de modelos abiertos para tareas agénticas y de razonamiento prolongado. No obstante, el autor no ha publicado evaluaciones propias de esta cuantización, por lo que las cifras de rendimiento deben tomarse del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`: 64 capas de decoder con patrón 3:1 de Gated DeltaNet (atención lineal) y atención completa, hidden size 5.120, encoder visual de 27 capas, 1 capa MTP |
| Parámetros totales | 27,8 B (incluye 0,46 B del encoder visual y 0,42 B de la cabeza MTP); el checkpoint safetensors reporta 7.212.759.280 tensores almacenados tras la cuantización |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | OMLX oQ4h de precisión mixta y afín, media de 5,0 bits por peso; capas lineales por defecto a 4 bits / grupo 64, `embed_tokens` a 5 bits, `lm_head` a 6 bits, `mtp.layers.0.self_attn.o_proj` a 5 bits, `k_proj`/`v_proj` de MTP a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards), librería MLX |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 64 capas que alterna en proporción 3:1 capas de Gated DeltaNet (atención lineal) con capas de atención completa, un diseño que reduce el coste computacional en contextos largos. Incluye un encoder visual de 27 capas para entrada de imágenes y una capa adicional de predicción multi-token (MTP) que actúa como cabeza de decodificación especulativa, acelerando la generación al proponer varios tokens por paso. El tamaño de hidden es de 5.120.

Según la model card, el modelo base se entrenó exclusivamente con aprendizaje por refuerzo (sin datos de preentrenamiento propios más allá de la base Qwen3.8-27B), y se publica en BF16 (52 GB), FP8 (29 GB) y NVFP4 (23 GB). Esta variante concreta no aporta entrenamiento nuevo: es una cuantización afín de precisión mixta calibrada con imatrix sobre el dataset `oqe_code_multilingual` (128 muestras de 512 tokens), con asignación de bits superior en módulos sensibles como `lm_head` y las proyecciones de atención de la cabeza MTP. El informe completo de calibración está en `oq_imatrix_report.json` dentro del repositorio.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (*thinking*) según los tags del modelo.
- Comprensión de imágenes (pipeline `image-text-to-text`): entrada multimodal con texto e imágenes, salida solo texto.
- Generación y razonamiento sobre código, reforzado por la calibración de la cuantización sobre datos de programación multilingüe.
- Decodificación especulativa mediante la cabeza MTP preservada, que acelera la inferencia en Apple Silicon.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modelo base se evalúa en benchmarks agénticos (Terminal Bench, SWE Bench Pro v2, DeepSWE).
- Capacidades multilingües: no disponible.

## Casos de uso

- **Asistencia de programación en local sobre Mac**: el modelo puede integrarse en editores o terminales de un equipo Apple Silicon para autocompletar, refactorizar y explicar código, aprovechando la calibración imatrix sobre datos de código y el contexto de 262.144 tokens para manejar repositorios completos.
- **Análisis de documentación técnica con imágenes**: al aceptar entrada image-text-to-text, permite procesar capturas de pantalla, diagramas de arquitectura o páginas escaneadas junto con preguntas en texto, útil para auditorías técnicas y soporte interno.
- **Agentes de terminal y resolución de incidencias**: el modelo base se evalúa en Terminal Bench y SWE Bench Pro v2, por lo que esta cuantización sirve para prototipar agentes que ejecutan comandos y parchean código en un entorno de desarrollo local sin depender de la nube.
- **Razonamiento prolongado sobre corpus largos**: con 262.144 tokens de contexto, es adecuado para resumir contratos, analizar logs extensos o responder preguntas sobre múltiples documentos concatenados en una sola sesión.
- **Prototipado de asistentes conversacionales privados**: al ejecutarse íntegramente en local con MLX, permite desplegar chatbots multi-turno en entornos con requisitos de confidencialidad donde no se puede enviar datos a APIs externas.
- **Evaluación e investigación de cuantizaciones**: investigadores que estudian el impacto de la cuantización mixta en modelos multimodales pueden usar este checkpoint junto con la variante de 2 bits (`DaisyRose-27B-oQ2h-mtp`) para comparar degradación de calidad frente al BF16 original.
- **Generación de código en pipelines de CI/CD locales**: aunque no se documenta tool calling, el modelo puede invocarse desde scripts de pre-commit o revisión de parches en máquinas de desarrollo Mac para tareas de linting semántico y revisión automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización. El autor remite a la model card del modelo base (RadixArk/DaisyRose-27B), que reporta evaluaciones en Terminal Bench, SWE Bench Pro v2, DeepSWE, HLE, IFBench y GPQA Diamond, pero las cifras concretas no se incluyen en la información proporcionada.

## Requisitos de hardware

- **VRAM / memoria unificada estimada**: ~16 GB en disco para los pesos; se recomienda al menos 20-24 GB de memoria unificada para acomodar pesos, caché KV y overhead del runtime, especialmente con contextos largos.
- **GPU recomendadas**: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el uso de MLX; no está pensado para GPUs NVIDIA o AMD.
- **¿Cabe en consumer GPU?**: no aplica en el sentido tradicional; cabe en Macs con 24 GB o más de memoria unificada, y con holgura en configuraciones Max/Ultra de 32 GB o más.
- **Opciones de despliegue**: MLX (librería nativa) y el runtime OMLX citado por el autor; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible. La presencia de la cabeza MTP sugiere aceleración por decodificación especulativa, pero no se aportan métricas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| DaisyRose-27B-oQ4h-mtp (esta ficha) | 27,8 B (cuantizado a ~5,0 bpw) | 262.144 | Texto + imagen | Apache-2.0 | safetensors / MLX |
| RadixArk/DaisyRose-27B (BF16) | 27,8 B | 262.144 | Texto + imagen | Apache-2.0 | safetensors BF16 (52 GB) |
| slackcrow/DaisyRose-27B-oQ2h-mtp | 27,8 B (cuantizado a ~2 bits) | 262.144 | Texto + imagen | Apache-2.0 | safetensors / MLX (~11 GB) |
| Qwen3.8-27B (base arquitectónica) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base en BF16 y con la variante de 2 bits del mismo autor; no se dispone de datos de benchmarks para establecer diferencias de calidad entre ellas.

## Limitaciones y advertencias

- **Sin evaluaciones propias**: el autor no ha ejecutado benchmarks sobre esta cuantización, por lo que la degradación respecto al BF16 es desconocida y debe validarse en el caso de uso concreto.
- **Riesgo de alucinación**: inherente a los modelos de razonamiento; la cuantización de 4 bits puede amplificarlo en tareas de precisión factual.
- **Sesgos**: no documentados en la información disponible; se heredan los del modelo base y sus datos de entrenamiento por RL.
- **Idiomas**: no se especifica la cobertura lingüística; la calibración imatrix se hizo sobre un dataset de código multilingüe, lo que no garantiza calidad conversacional en todos los idiomas.
- **Restricciones de plataforma**: dependencia exclusiva de MLX y Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconversión.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en el repositorio.
- **Contexto largo**: aunque soporta 262.144 tokens, el consumo de memoria de la caché KV en configuraciones de memoria unificada limitada puede obligar a reducir la ventana efectiva.
- **Tool calling y agentes**: no confirmados explícitamente para esta variante; verificar antes de usarla en producción agéntica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/slackcrow/DaisyRose-27B-oQ4h-mtp
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Variante de 2 bits: https://huggingface.co/slackcrow/DaisyRose-27B-oQ2h-mtp
- Informe de calibración imatrix: `oq_imatrix_report.json` en el repositorio
