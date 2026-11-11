# Beling86/Ornith-1.5-122B-AutoRound-W3W4

## Resumen

Ornith-1.5-122B-AutoRound-W3W4 es una cuantización de precisión mixta del modelo ornith-ai/Ornith-1.5-122B, publicada por el usuario Beling86 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una distribución optimizada del modelo base creada con Intel AutoRound, orientada a reducir el consumo de VRAM hasta unos 50,8 GB para permitir inferencia con la ventana de contexto completa de 262.144 tokens en una única GPU de 64 GB.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 122.000 millones de parámetros totales y aproximadamente 10.000 millones de parámetros activos por token (top-8 expertos enrutados más expertos compartidos). La cuantización emplea esquemas W4A16, W3A16 y W8A16 según el subsistema, con kernels Marlin para tensor cores, y preserva los routers y expertos compartidos en BF16.

La relevancia de esta ficha radica en que permite desplegar un modelo MoE de gran tamaño con contexto ultralargo en hardware de una sola GPU, algo que el modelo en BF16 no permitiría. La torre de visión ha sido eliminada, por lo que el resultado es un modelo exclusivamente de generación de texto causal (`Qwen3_5MoeForCausalLM`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3_5MoeForCausalLM), 48 bloques, con componentes DeltaNet en atención |
| Parametros totales | 122 mil millones (modelo base) |
| Parametros activos | ~10 mil millones por token (top-8 expertos enrutados + expertos compartidos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | AutoRound mixta: W4A16 (bloques MoE externos), W3A16 (bloques MoE centrales), W8A16 (atención y DeltaNet), BF16 (routers y expertos compartidos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 48 bloques. Los 12 bloques externos (0-5 y 42-47) se cuantizan a W4A16 y ocupan aproximadamente 14,4 GB; los 36 bloques centrales (6-41) se cuantizan a W3A16 y ocupan unos 32,4 GB. Las capas de atención y DeltaNet de los 48 bloques se mantienen en W8A16 (~4,5 GB), mientras que routers y expertos compartidos se preservan en BF16 (~1,2 GB). Todos los esquemas usan grupos de 128 con cuantización simétrica.

La calibración de AutoRound se realizó sobre 128 documentos técnicos auténticos de contexto largo, de 4.096 tokens cada uno. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO. La torre de visión fue eliminada del checkpoint, de modo que esta distribución solo soporta generación de texto causal. Los kernels de ejecución son Marlin Tensor Cores para W4A16 y W8A16, y Marlin o Humming para W3A16.

## Capacidades

- Generación de texto causal en modo conversacional (`conversational`).
- Razonamiento y generación de código, heredados del modelo base (sin datos de benchmarks disponibles en esta ficha).
- Procesamiento de contexto ultralargo de hasta 262.144 tokens, con soporte de prefix caching y chunked prefill en vLLM.
- Despliegue eficiente en una sola GPU de 64 GB gracias a la cuantización mixta.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers.
- No soporta visión: la torre visual fue eliminada del checkpoint.
- Soporte de tool calling, agentes o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 262.144 tokens de contexto, el modelo puede ingerir manuales, especificaciones o bases de código completas en una sola pasada sin fragmentación, lo que resulta adecuado para tareas de resumen y extracción sobre corpus largos.
- Asistentes conversacionales de dominio especializado: el modo conversacional y el contexto largo permiten mantener historiales de diálogo muy extensos con coherencia, útil en soporte técnico o atención al cliente.
- Generación y revisión de código en pipelines: al ser un modelo de texto con soporte de transformers y vLLM, puede integrarse en flujos de CI/CD para revisión automática, generación de tests o documentación de repositorios completos.
- Despliegue en infraestructura de una sola GPU: la cuantización a ~50,8 GB permite servir el modelo en una RTX 6000 Ada, A100 80GB o H100 con margen para el contexto completo, reduciendo costes frente a configuraciones multi-GPU.
- Procesamiento por lotes de alto rendimiento: el uso de kernels Marlin y la opción de chunked prefill en vLLM facilitan el throughput en tareas de generación masiva de texto.
- Investigación sobre cuantización: este checkpoint sirve como referencia práctica de cuantización mixta con AutoRound sobre un MoE de 122B, útil para estudiar el impacto de W3/W4/W8 en calidad y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~50,8 GB para los pesos cuantizados, con ~13,2 GB de margen en una GPU de 64 GB para inferencia con contexto completo de 262.144 tokens.
- GPU recomendadas: NVIDIA CMP 170HX, RTX 6000 Ada (64 GB), A100 80GB, H100 (según la model card).
- GPU de consumo: no cabe en GPUs consumer típicas de 24 GB o 48 GB; requiere al menos 64 GB de VRAM para el contexto completo.
- Despliegue: vLLM con `--dtype bfloat16`, `--max-model-len 262144`, `--max-num-batched-tokens 4096`, `--enable-prefix-caching`, `--enable-chunked-prefill` y `--gpu-memory-utilization 0.95`; también compatible con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beling86/Ornith-1.5-122B-AutoRound-W3W4 | 122B (MoE, ~10B activos) | 262.144 | AutoRound mixta W3/W4/W8 | apache-2.0 | Hugging Face |
| ornith-ai/Ornith-1.5-122B (base) | 122B (MoE, ~10B activos) | 262.144 | BF16 | apache-2.0 | Hugging Face |
| Alternativas comparables de 122B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización W3A16 en los 36 bloques centrales puede degradar la calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- No soporta visión: la torre visual fue eliminada, por lo que no puede procesar imágenes.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay datos específicos de mitigación en la información disponible.
- Idiomas soportados no documentados; el rendimiento multilingüe no está verificado.
- Requiere hardware de al menos 64 GB de VRAM para explotar el contexto completo; en GPUs menores habrá que reducir la longitud de contexto.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base ornith-ai/Ornith-1.5-122B antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Ornith-1.5-122B-AutoRound-W3W4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
