# HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-ModelOpt-W4A16-NVFP4

## Resumen

Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-ModelOpt-W4A16-NVFP4 es una cuantización NVFP4 del modelo abliterado "Darkstar", creado por HangGlidersRule a partir de `nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16`. El modelo original de NVIDIA es un sistema omni-modal que entiende imagen, video, habla y texto. Sobre esta base se aplicó un edit de rechazo reducido mediante un adaptador LoRA de desaprendizaje (unlearning SFT), y posteriormente se cuantizó el trunk de lenguaje con NVIDIA ModelOpt para reducir los requisitos de VRAM manteniendo un rendimiento de inferencia alto.

La relevancia de este artefacto es doble: por un lado, es un ejemplo de cuantización agresiva (W4A16-NVFP4) de un modelo MoE híbrido Mamba2 + MoE, con un tamaño total de 30B y 3B parámetros activos; por otro, es una herramienta para investigar el comportamiento de modelos sin filtros de rechazo, con la advertencia explícita de que ha sido diseñado para cumplir peticiones dañinas. La ventana de contexto es de 131.072 tokens y el despliegue validado se realiza con vLLM sobre GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 + MoE (Nemotron-H), omni-modal (vision, audio, texto). Trunk de lenguaje MoE con expertos enrutados y compartidos. |
| Parametros totales | 30.000M (denominación del modelo completo). Los tensores safetensors del trunk de lenguaje cuantizado suman 16.484.881.856. |
| Parametros activos | 3.000M (A3B) en el trunk MoE. |
| Longitud de contexto | 131.072 tokens (validado en vLLM). |
| Tipos de cuantizacion | W4A16-NVFP4 (pesos 4 bits, activaciones 16 bits, grupos de 16) para proyecciones de expertos y lm_head; BF16 para Mamba2, atención, normas, embeddings y torres de vision/audio. |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de Mamba2 y MoE sobre el trunk de lenguaje, con torres de vision y audio que alimentan un modelo tipo VLM. El nombre "30B-A3B" indica que el modelo completo tiene 30.000 millones de parámetros, de los cuales 3.000 millones se activan por token gracias a la mezcla de expertos. La cuantización W4A16-NVFP4 se aplica a 5.894 módulos de proyecciones de expertos (enrutados y compartidos) y a la capa `lm_head`, mientras que la ruta Mamba2/SSM, las atenciones, normas, embeddings y las torres de vision/audio se mantienen en BF16.

El entrenamiento del artefacto consta de dos etapas. Primero, se aplicó un edit de rechazo reducido sobre el modelo BF16 original, mediante un adaptador LoRA de desaprendizaje de rango 32 en las proyecciones `q/k/v/o_proj` del trunk de lenguaje, con alfa 64 y un "teacher" basado en las filas conformes del propio modelo. Después, se cuantizó con NVIDIA ModelOpt 0.46.0rc2, usando un algoritmo de calibración MSE (`fp8_scale_sweep`) sobre un conjunto de 512 muestras de `cnn_dailymail` y 512 muestras de `nemotron-post-training-dataset-v2`, con secuencias de 2048 tokens y seed 1234. La cuantización se ejecutó sobre el trunk de lenguaje extraído del wrapper VLM, de modo que las torres de vision/audio son idénticas al padre BF16.

## Capacidades

- Comprensión omni-modal: procesa imágenes, video, habla y texto, según la documentación del modelo original de NVIDIA.
- Razonamiento con modo "thinking on", evaluado con GPQA Diamond.
- Generación de texto y diálogo conversacional (pipeline image-text-to-text).
- Compliance a prompts dañinos: 200/200 peticiones cumplidas, con 0 rechazos en la suite medida.
- Sobre-rechazos seguros: 0/83, lo que indica una baja tendencia a rechazar peticiones legítimas.
- Soporte de tool calling, agentes y funciones: no documentado en la información disponible.
- Capacidades multilingües: no disponibles en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar el comportamiento de un sistema sin rechazo, comparándolo con el modelo base de NVIDIA para desarrollar mejores filtros y métricas de seguridad.
- Pruebas de robustez de sistemas de moderación: se puede usar como generador de contenido que debería ser bloqueado, para evaluar la eficacia de filtros y mecanismos de defensa en producción.
- Análisis multimodal de vídeo de larga duración: gracias a la ventana de contexto de 131.072 tokens y a la comprensión de imagen y audio, el modelo puede resumir o responder preguntas sobre grabaciones largas, como cintas de vigilancia o material audiovisual de archivo.
- Despliegue de inferencia eficiente en entornos con recursos limitados: la cuantización W4A16-NVFP4 reduce el tamaño del trunk de lenguaje a 19.8 GB, lo que permite ejecutarlo en una sola GPU con 24-48 GB, en lugar de requerir configuraciones de múltiples GPUs para el modelo BF16.
- Evaluación de técnicas de cuantización: el delta de rendimiento en GPQA es de 0.0 puntos porcentuales respecto al BF16, lo que convierte a este artefacto en un caso de estudio para validar la pérdida de precisión de NVFP4 en modelos MoE híbridos.
- Simulación de escenarios adversarios para entrenar agentes defensivos: se puede utilizar en entornos controlados para generar prompts que un sistema de seguridad debe detectar, siempre que se implementen filtros y controles de acceso adecuados.
- Asistencia conversacional en dominios sensibles con filtros externos: el modelo puede responder a preguntas que el modelo original rechazaría, lo que resulta útil en aplicaciones donde el comportamiento de rechazo es un obstáculo y existe un filtrado de salida independiente.

## Benchmarks y rendimiento

| Metrica | Valor | Base |
|---|---|---|
| GPQA Diamond (thinking on) | 29.3% (58/198) | llm-inference-bench `gpqa-diamond`, chat template + thinking ON, temp 0, servido NVFP4 |
| Delta de cuantizacion vs Abliterated-BF16 | 0.0 pp (58/198 → 58/198) | mismo runner, mismo dia |
| Cumplimiento de prompts dañinos | 200/200 (0 refusals) | suite fresca sobre el artefacto servido |
| Sobre-rechazos seguros | 0/83 (0.00%) | 0 errores |
| Throughput single-stream (sin spec decode) | 249.468 tok/s ponderado | 4K 248.64 / 16K 250.80 / 48K 250.43; +36% vs BF16 parent |

No se han publicado resultados de benchmarks adicionales en la información disponible. La pérdida de inteligencia documentada se hereda del edit de rechazo, no de la cuantización: el GPQA del modelo original se estima en torno al 46%, mientras que el abliterado alcanza el 29.3%.

## Requisitos de hardware

- VRAM estimada: el repo tiene 19.8 GB, pero con KV cache BF16 y contexto 131K, el uso de VRAM puede superar los 24 GB. Para el escenario validado con `gpu-memory-utilization 0.90` y `max_num_seqs=16`, se recomienda una GPU con 40-80 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, o RTX 4090 24 GB con contexto reducido y menor número de secuencias.
- Compatibilidad con consumer GPU: la RTX 4090 puede ejecutar el modelo con una ventana de contexto menor, aunque el KV cache BF16 para 131K tokens probablemente exceda los 24 GB.
- Opciones de despliegue: vLLM 0.27.1 (build aeon, torch 2.13.0+cu130) con backend MARLIN NvFp4 MoE, Flash Attention, BF16 KV cache, prefix caching y chunked prefill.
- Latencia y throughput: 249.468 tok/s en single-stream sin decodificación especulativa, medido sobre el artefacto servido con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Darkstar Nemotron 3 Nano Omni 30B-A3B Abliterated ModelOpt W4A16-NVFP4 | 30B total / 3B activos | 131.072 | NVFP4 | 29.3% | NVIDIA Open Model License | Hugging Face |
| Darkstar Nemotron 3 Nano Omni 30B-A3B Abliterated BF16 | 30B total / 3B activos | 131.072 (asumido) | BF16 | 29.3% | NVIDIA Open Model License | Hugging Face |
| NVIDIA Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | 30B total / 3B activos | 131.072 (asumido) | BF16 | ~46% | NVIDIA Open Model License | Hugging Face |

La comparativa muestra que la cuantización NVFP4 no introduce pérdida de precisión en GPQA respecto al padre abliterado. La diferencia principal con el modelo original de NVIDIA es el edit de rechazo, que reduce el rendimiento en razonamiento pero elimina los rechazos en la suite de prompts dañinos.

## Limitaciones y advertencias

- Modelo con rechazo reducido deliberadamente: cumplió 200/200 prompts dañinos en la suite medida, sin rechazos.
- No incluye mitigaciones de seguridad añadidas. Debe desplegarse únicamente tras una revisión legal y con filtros, políticas y controles de acceso adecuados.
- Pérdida de rendimiento en razonamiento: el GPQA Diamond cae del ~46% del modelo original al 29.3% del artefacto abliterado. Esta pérdida se hereda del edit, no de la cuantización.
- El autor advierte explícitamente de que no debe usarse para trabajo de razonamiento en producción.
- La cuantización NVFP4 requiere un backend específico (MARLIN NvFp4 MoE) y una versión concreta de vLLM (0.27.1 build aeon), lo que limita la portabilidad.
- El repo solo contiene el trunk de lenguaje cuantizado; las torres de vision/audio están en BF16 y no se han cuantizado.
- Idiomas soportados: no disponibles en la información proporcionada.
- La licencia NVIDIA Open Model License debe revisarse para confirmar las condiciones de uso comercial y las restricciones de redistribución.
- Riesgo de alucinación no evaluado en la información disponible; el modelo no ha sido sometido a pruebas de seguridad completas.

## Enlaces

- Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-ModelOpt-W4A16-NVFP4
- Modelo padre BF16 abliterado: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-BF16
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Fuente de la model card: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3-nano-omni-r1/model-card/abliterated-nvfp4.md
- Recipe de cuantización: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3-nano-omni/w4a16_nvfp4_lmhead_nemotron_h.yaml
- Release de la familia: https://github.com/HangGlidersRule/model-forge/releases/tag/darkstar-nemotron-3-nano-omni-v1.0.0
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning/modelcard
