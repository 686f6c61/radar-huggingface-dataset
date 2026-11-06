# rqadri/cca-traj-gemma4-31b-v12

## Resumen

Gemma-4-31b-it v12 es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo multimodal `google/gemma-4-31b-it` de Google. Lo desarrolla el usuario independiente rqadri (repositorio `rifaaQ/long_ctx_train`) como artefacto de investigación centrado en el entrenamiento con contexto largo y en trayectorias de agentes de programación. El modelo parte de una arquitectura transformer multimodal con 31.273.088.876 parámetros y se entrena con una ventana de contexto de 128.000 tokens.

El problema que aborda es el ajuste de un modelo grande sobre secuencias completas de trayectorias de agentes (generaciones de contexto de agente), aplicando la pérdida únicamente sobre los tramos del asistente. Para ello emplea paralelismo de secuencia Ulysses a nivel de nodo y DeepSpeed ZeRO-3 con offload del optimizador a CPU, lo que permite entrenar secuencias de 128k tokens en hardware Intel XPU (Aurora).

Es relevante ahora por dos motivos: demuestra una receta reproducible de SFT a nivel de trayectoria con contexto largo sobre un modelo de 31B, y porque el autor advierte explícitamente de que el modelo no ha sido evaluado y de que un experimento análogo con Qwen3-8B rindió por debajo del modelo base en todas las pruebas de agentes. Se trata, por tanto, de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4); clase `Gemma4ForConditionalGeneration` |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma (license:gemma) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos del `google/gemma-4-31b-it`, un transformer multimodal de tipo image-text-to-text. El entrenamiento se realizó con el script `train_cca_sft.py` del repositorio `github.com/rifaaQ/long_ctx_train` sobre el superordenador Aurora (Intel XPU). La configuración emplea una secuencia de entrenamiento por cada generación de contexto de agente, con la pérdida calculada únicamente sobre los tramos del asistente, contexto de 128k tokens, precisión bf16, DeepSpeed ZeRO-3 con offload del optimizador a CPU, paralelismo de secuencia Ulysses a nivel de nodo con 8 rangos, optimizador AdamW, scheduler coseno, 8 secuencias por paso de optimizador y una época.

Los datos proceden de trayectorias de agentes CCA: `cca-large-v1` (250 ejecuciones de entrenamiento, 1.243 secuencias, 61,9 millones de tokens supervisados) y `cca-large-v2` (182 ejecuciones, 739 secuencias, 47,7 millones de tokens supervisados, con ejecuciones disjuntas y solo profesores de pesos abiertos). La ejecución v12 concreta parte del modelo base y usa la concatenación de v1 y v2 (1.982 secuencias), con learning rate 1e-5, 248 pasos (una época) y max_grad_norm 200. La pérdida de entrenamiento pasó de 1,13 en los primeros 6 pasos a 0,64 en los últimos 6, y el entrenamiento finalizó el 31 de octubre de 2026. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Gemma 4.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Seguimiento de trayectorias de agentes de programación, objetivo específico del ajuste.
- Modo de pensamiento (thinking): el autor indica que se evaluó con `enable_thinking` activado en la plantilla de chat y con un parser de razonamiento.
- Soporte de contexto largo de hasta 128k tokens, según la configuración de entrenamiento.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación sobre SFT de contexto largo: el modelo sirve como referencia reproducible para estudiar cómo se comporta un ajuste de parámetros completos sobre secuencias de 128k tokens con pérdida enmascarada al asistente, usando la receta de `long_ctx_train`.
- Experimentación con trayectorias de agentes de código: permite analizar si el ajuste sobre trayectorias CCA mejora o degrada el comportamiento agéntico respecto al modelo base, dado que el autor reporta degradación en un experimento análogo con Qwen3-8B.
- Evaluación de pipelines multimodales con vLLM: el repositorio incluye `processor_config.json`, necesario para el perfil multimodal de vLLM, lo que facilita montar un servicio de inferencia image-text-to-text para pruebas.
- Estudio de decodificación con razonamiento explícito: al haberse evaluado con `enable_thinking` y un parser de razonamiento, es útil para comparar calidad de cadenas de razonamiento antes y después del ajuste.
- Reproducción de infraestructura de entrenamiento en Intel XPU: el modelo documenta el uso de Ulysses y ZeRO-3 sobre Aurora, por lo que sirve de caso práctico para quien replique entrenamiento distribuido en hardware XPU.
- Base para futuros ajustes o ablaciones: al ser un checkpoint intermedio de una serie (v12), puede emplearse como punto de partida para experimentos posteriores de alineación o evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "not yet evaluated" porque la asignación de Aurora terminó antes de que se ejecutaran los trabajos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 31.273 millones de parámetros, en bf16 se requieren aproximadamente 62,5 GB solo para pesos; en cuantización de 8 bits, unos 31 GB; en 4 bits, unos 16 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: no disponibles en la documentación. Por tamaño, un despliegue en bf16 requiere GPUs con 80 GB (A100, H100) o reparto multi-GPU.
- ¿Cabe en GPU de consumo? En bf16 no. En cuantizaciones de 4 bits podría ajustarse en GPUs de 24 GB, pero no hay confirmación del autor ni artefactos GGUF publicados.
- Opciones de despliegue: transformers (librería declarada); vLLM, ya que el autor menciona que el perfil multimodal de vLLM necesita el `processor_config.json` incluido. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| rqadri/cca-traj-gemma4-31b-v12 | 31,27B | 128k (entrenamiento) | Gemma | Artefacto de investigación, sin evaluar |
| google/gemma-4-31b-it (base) | 31,27B | no disponible en la información | Gemma | Modelo oficial de Google |
| Qwen3-8B (ejecución v12 del autor) | 8B (aproximado) | no disponible | no disponible | Ajuste análogo; según el autor, por debajo del base en todas las pruebas de agentes |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor confirma que no se ejecutaron las evaluaciones previstas, por lo que no hay evidencia de que mejore al modelo base.
- Señal de riesgo: la ejecución equivalente con Qwen3-8B v12 se ajustó mejor a las trazas pero puntuó por debajo del base en todas las pruebas de agentes, lo que sugiere que este tipo de SFT puede degradar el rendimiento agéntico.
- Artefacto de investigación: no está pensado para producción ni se documentan garantías de estabilidad.
- Sesgos y alucinaciones: no documentados; al heredar el modelo base, arrastra los sesgos de este, pero no hay análisis específico.
- Idiomas: no se especifican los idiomas soportados.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones de atribución; conviene revisarla antes de cualquier despliegue.
- Cuantizaciones: no se publican artefactos GGUF ni cuantizados, lo que limita el despliegue en hardware de consumo.
- Contexto: aunque se entrenó con 128k tokens, no se confirma el comportamiento efectivo en esa longitud ni la calidad de recuperación de información en ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rqadri/cca-traj-gemma4-31b-v12
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Repositorio de entrenamiento: https://github.com/rifaaQ/long_ctx_train
- Protocolo de evaluación y resultados: longctx/results.md en https://github.com/rifaaQ/long_ctx_train
