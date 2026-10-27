# sermonis-ai/Kestrel-4B-Coder-oQ4e-fp16-mtp

## Resumen

Kestrel-4B-Coder-oQ4e-fp16-mtp es una cuantización de 4 bits en formato MLX del modelo Jackrong/Kestrel-4B-Coder, un ajuste fino orientado a código y agentes sobre Qwen3.5-4B (linaje Qwen/Qwen3.5-4B → unsloth/Qwen3.5-4B → Kestrel). Lo publica el usuario sermonis-ai y está pensado para ejecutarse en Apple Silicon mediante el runtime oMLX, no en GPUs NVIDIA. La arquitectura es `qwen3_5` de tipo visión-lenguaje (`Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parámetros totales y un torre de visión de 333,51 M de parámetros.

Su particularidad es que conserva dos componentes que muchas cuantizaciones descartan: la torre de visión (297 tensores en float32, sin cuantizar) y la cabeza de predicción multi-token (MTP, 1 capa, 29 tensores), que actúa como decodificación especulativa integrada. Según las mediciones del autor, el MTP aporta un +12,6 % de throughput medio (24,54 frente a 21,80 tok/s) con una tasa de aceptación de borradores del 74,7 %, a costa de un incremento de perplejidad de solo +0,358 % respecto al BF16 original.

El resultado es un artefacto de 3,93 GB (1250 tensores, sin `lm_head` separado) que cabe con holgura en un Mac con memoria unificada y que mantiene tool calling en JSON válido además de capacidades multimodales de imagen-texto. Es relevante para quien quiera un modelo de código pequeño, multimodal y con decodificación acelerada en local, asumiendo que depende de un runtime específico (oMLX ≥ 0.7.1 con MLX 0.32.4) y de que `mlx_lm` o `mlx_vlm` estándar no cargan esta combinación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5` VLM (`Qwen3_5ForConditionalGeneration`), transformer con torre de visión y cabeza MTP |
| Parámetros totales | 4.659.865.088 (4,66 B); torre de visión: 333,51 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e: 4 bits, `group_size=64`, affine, imatrix mejorada (`oqe_code_multilingual`, 128 muestras × 512 tokens, 256 entradas) |
| Idiomas soportados | no disponible (la imatrix de calibración se denomina `code_multilingual`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); LM y escalas en float16, visión en float32 |
| Tipo de almacenamiento | `float16` para LM/escalas; `float32` para visión y audio (comportamiento de oMLX) |
| Tensores | 1250 totales (953 de lenguaje + 297 de visión); 29 de MTP; 0 `lm_head` |
| Tamaño del repo | 3,93 GB (3.932.576.486 bytes) |
| Runtime requerido | oMLX ≥ 0.7.1 con MLX 0.32.4 (mlx-lm 0.31.4.dev132, mlx-vlm 0.7.8) |
| Pipeline | image-text-to-text |
| Modelo base | `Jackrong/Kestrel-4B-Coder` @ `46fdfa2c75949c6e3abd4c62d7a1c079ffc18245` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de la familia Qwen3.5 en su variante multimodal (`qwen3_5`), con una torre de visión acoplada al modelo de lenguaje. Sobre esa base, Jackrong aplicó un ajuste fino centrado en código y comportamiento agéntico, del que no se detallan en la información disponible ni el volumen de tokens ni la composición del dataset ni si hubo RLHF o DPO. La cadena de procedencia documentada es Qwen/Qwen3.5-4B → unsloth/Qwen3.5-4B → Jackrong/Kestrel-4B-Coder.

La innovación técnica de este artefacto no está en el entrenamiento sino en el pipeline de cuantización: `quantize_oq_streaming` con `oq_level=4`, `group_size=64`, `text_only=False` (conserva la torre de visión) y `preserve_mtp=True` (conserva la cabeza MTP y sus campos de configuración, con `mtp_num_hidden_layers=1` y `unsloth_fixed_mtp=true`). Se aplicó una imatrix de calibración orientada a código multilingüe y 92 boosts por capa, reutilizando la caché de la imatrix del build hermano en BF16 porque la firma de caché es independiente del dtype. La torre de visión queda íntegra en float32 (297 tensores, sin `.scales` ni `.biases`), lo que explica que el artefacto pese unos 0,67 GB más de lo que sería esperable en una cuantización de solo texto.

La cabeza MTP funciona como decodificación especulativa: propone tokens que el modelo verifica, con una profundidad de borrador recomendada de 2. En las pruebas del autor, 22 ciclos de decodificación con MTP activo arrojaron una aceptación media del 74,7 % y 1,80 tokens por ciclo. El parche de runtime de oMLX para Qwen3.5 VLM es imprescindible: `mlx_vlm` de serie elimina silenciosamente los tensores `mtp.*` al cargar y `mlx_lm` no puede cargar la torre de visión.

## Capacidades

- Generación de texto y código: el modelo está ajustado específicamente para tareas de programación y agentes; las pruebas de humo con 5 prompts de código en modo greedy y "shipping" produjeron salidas coherentes terminadas en EOS, sin artefactos de truncamiento.
- Razonamiento multi-paso orientado a agentes: la model card lo describe como fine-tune "coding and agent-focused"; el modo thinking es configurable (`enable_thinking`), desactivado por defecto en la configuración recomendada.
- Tool calling / function calling: verificado con salida JSON parseable con el nombre y los argumentos esperados (test T7 del informe de verificación).
- Visión e imagen-texto: pipeline `image-text-to-text` con torre de visión completa; en pruebas identificó correctamente una tabla comparativa ("HumanEval and HumanEval+ / Coding Quality") y un gráfico de barras agrupadas ("BenchLocal / HermesAgent-20").
- Comprensión de documentos técnicos y gráficos: derivada de la capacidad anterior, útil para leer capturas de benchmarks, diagramas y tablas.
- Multilingüe: no disponible como lista cerrada de idiomas; la imatrix de calibración usada es `code_multilingual`, lo que sugiere cobertura de código en varios lenguajes, pero no se documenta el alcance por idioma natural.
- Decodificación especulativa integrada (MTP) con profundidad adaptable (`mtp_adaptive_max_depth: 2`).
- Generación de respuestas largas: en la prueba de 512 tokens generó 251 palabras con un máximo de un 15-grama repetido, es decir, sin bucles degenerados en esa muestra.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo se sirve con `omlx serve --model-dir /ruta/a/modelos` y ocupa menos de 4 GB en disco, por lo que se puede mantener residente en un portátil Apple Silicon para autocompletado, refactorización y explicación de fragmentos sin enviar código a la nube.
- Integración en pipelines de CI/CD como revisor de parches: con tool calling verificado en JSON y una ventana de contexto que no se documenta pero que conviene validar empíricamente, se puede invocar desde scripts para clasificar diffs, generar mensajes de commit o señalar regresiones.
- Agentes de terminal con múltiples pasos: la combinación de tool calling, MTP (que reduce la latencia por token) y modo thinking desactivable permite bucles de agente con muchas llamadas cortas donde el throughput importa más que la profundidad de razonamiento.
- Lectura de resultados de benchmarks y documentación técnica en imagen: dado su rendimiento identificando tablas y gráficos de barras, sirve para extraer cifras de capturas de papers o informes internos y volcarlas a texto estructurado.
- Generación de código multilingüe: la imatrix de calibración se construyó sobre muestras de código multilingüe, lo que hace al modelo adecuado para repos con mezcla de lenguajes (Python, TypeScript, Go, etc.) en tareas de traducción entre lenguajes o generación de tests.
- Prototipado de asistentes multimodales en investigación: al conservar visión en float32 sin cuantizar, es un artefacto útil para estudiar la degradación de la torre visual bajo cuantización del LM sin tener que montar el pipeline uno mismo.
- Evaluación de decodificación especulativa: con MTP preservado y métricas publicadas (aceptación, tokens/ciclo, PPL y KL frente a BF16), sirve como banco de pruebas reproducible para comparar estrategias de draft depth en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica un informe de verificación con métricas de fidelidad de cuantización y de throughput:

| Métrica | Fuente BF16 | Este build | Delta |
|---|---:|---:|---:|
| Perplejidad (5 fragmentos de código, 422 tokens) | 1,8579 | 1,8646 | +0,358 % |
| KL medio por siguiente token | — | 0,01512 nats | — |

| Configuración (256 tokens máx., temperature=0) | tok/s medio | tok/s mediana | Tokens de completion medios |
|---|---:|---:|---:|
| MTP desactivado | 21,80 | 22,27 | 129,0 |
| MTP activado | 24,54 | 24,07 | 129,0 |

| Métrica de MTP | Valor |
|---|---|
| Aceptación media de borradores | 74,7 % |
| Tokens por ciclo | 1,80 |
| Mejora de throughput medio | +12,6 % |
| Mejora de mediana | +8,1 % |

Otras verificaciones del informe: integridad del origen (738 tensores, SHA-256 de ambos shards coincidentes con el Hub, 9,32 GB), auditoría estructural (1250 tensores; 697 F16, 256 U32, 297 F32), auditoría de configuración (`mtp_num_hidden_layers=1`, 4 bits/64/affine, 92 boosts por capa) y carga parcheada correcta con la capa MTP adjunta.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 3,93 GB en disco; en ejecución hay que sumar caché KV y activaciones, por lo que conviene reservar del orden de 5-6 GB de memoria unificada para uso cómodo (estimación, no dato publicado).
- Plataforma: exclusivamente Apple Silicon. El artefacto es MLX y requiere oMLX ≥ 0.7.1 con MLX 0.32.4; no se documenta soporte para CUDA.
- GPU recomendadas: no aplica en el sentido habitual; el entorno de referencia del autor es un Apple M2 Max con 96 GiB de memoria unificada, macOS Darwin 25.6.0, Python 3.11.17 y transformers 5.17.0.
- Cabe en hardware de consumo: sí, en cualquier Mac con memoria unificada suficiente (un equipo de 16 GB puede alojarlo; con 8 GB el margen es muy ajustado al añadir contexto y visión). No cabe en GPUs de consumo tipo RTX 4090 mediante esta ruta, porque MLX no las soporta.
- Opciones de despliegue: `omlx serve --model-dir ... --port 8000` con el id de modelo igual al nombre del directorio (`Kestrel-4B-Coder-oQ4e-fp16-mtp`). No es compatible con vLLM, TGI ni llama.cpp; `mlx_lm` no carga la torre de visión y `mlx_vlm` sin parche descarta los tensores `mtp.*`.
- Configuración de rendimiento: MTP activado con `mtp_adaptive_max_depth: 2`, `temperature=0.2`, `top_p=0.95`, `top_k=20`; si aparecen bucles de repetición en respuestas largas, reintentar con `temperature=1.0` manteniendo `top_p` y `top_k`.
- Throughput de referencia: ~24,5 tok/s medios con MTP y ~21,8 tok/s sin él en M2 Max, con 256 tokens máximos y temperature=0; la varianza entre ejecuciones es alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización / dtype | Contexto | Visión | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kestrel-4B-Coder-oQ4e-fp16-mtp (este) | 4,66 B (333,5 M visión) | oQ4e 4 bits, LM fp16 / visión fp32 | no disponible | Sí (fp32, sin cuantizar) | Sí (1 capa) | apache-2.0 | HuggingFace, MLX/oMLX |
| Kestrel-4B-Coder-oQ4e-mtp (build hermano BF16) | no disponible | BF16 | no disponible | Sí | Sí | apache-2.0 | Citado en la model card |
| Jackrong/Kestrel-4B-Coder (fuente) | no disponible | BF16 sin cuantizar (9,32 GB en dos shards) | no disponible | Sí | Sí (config `unsloth_fixed_mtp=true`) | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (upstream) | ~4 B (no confirmado en la información disponible) | BF16 original | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación relevante es interna a la familia: frente al build BF16 hermano, este artefacto reduce el peso a menos de la mitad a cambio de +0,358 % de perplejidad y 0,01512 nats de KL medio; frente a la fuente sin cuantizar, añade la dependencia del runtime oMLX pero habilita su uso en equipos con memoria unificada limitada. No se dispone de datos para comparar con otros modelos de código de 4 B de la competencia.

## Limitaciones y advertencias

- Dependencia dura de runtime: sin oMLX ≥ 0.7.1 y su parche para Qwen3.5 VLM, la combinación de MTP y visión no se carga. `mlx_vlm` estándar elimina los tensores `mtp.*` sin avisar, lo que degradaría el rendimiento de forma silenciosa.
- Naturaleza derivada: es una cuantización, no un modelo entrenado desde cero; hereda todos los sesgos y limitaciones del ajuste fino de Jackrong, que no se documentan en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad. El autor advierte explícitamente de que las respuestas largas pueden caer en bucles de repetición, con una configuración de muestreo alternativa como mitigación.
- Idiomas: no hay lista oficial de idiomas soportados. La denominación `code_multilingual` de la imatrix no garantiza cobertura del castellano ni de otros idiomas naturales en texto libre.
- Longitud de contexto: no documentada. Cualquier caso de uso con documentos largos debe validarse empíricamente antes de llevarlo a producción.
- Cuantización agresiva a 4 bits con `group_size=64`: la degradación medida es pequeña en código (PPL +0,358 %), pero no se han publicado métricas en otras tareas, y la torre de visión en float32 no está cuantizada, así que su fidelidad no se ve afectada por este paso.
- Volumen de uso nulo: 0 descargas y 1 like en el momento de la consulta; es un artefacto reciente (creado el 26 de octubre de 2026) sin validación independiente de la comunidad.
- Licencia apache-2.0 en este artefacto, pero conviene verificar las condiciones del modelo base y del upstream Qwen3.5 antes de un uso comercial, ya que la información disponible no detalla la licencia de origen.
- Rendimiento medido en un único equipo (M2 Max, 96 GiB) con alta varianza entre ejecuciones; los tok/s no son extrapolables a otros chips sin medir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sermonis-ai/Kestrel-4B-Coder-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Build hermano en BF16, citado en la model card como `Kestrel-4B-Coder-oQ4e-mtp` (sin URL publicada en la información disponible)
- No se han encontrado enlaces adicionales relevantes: la búsqueda web realizada no devolvió resultados relacionados con el modelo, su autor ni el runtime oMLX.
