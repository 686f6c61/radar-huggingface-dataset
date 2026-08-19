# jarrelscy/DeepSeek-V4-Pro-0813-NVFP4-AQLM-hybrid

## Resumen

DeepSeek-V4-Pro-0813-NVFP4-AQLM-hybrid es una cuantización híbrida de dos niveles del modelo oficial `deepseek-ai/DeepSeek-V4-Pro-0813`, desarrollada por el usuario jarrelscy. El objetivo es reducir la huella de memoria del modelo completo —61 capas all-MoE con 384 expertos enrutados por capa— para que quepa en aproximadamente 384 GB de VRAM con margen para una ventana de contexto de 1M tokens. Para ello, los expertos enrutados se dividen en dos niveles según su saliencia: un 14% se mantiene en NVFP4 (~4 bpw) y el 86% restante se comprime a AQLM de 1.0 bpw, mientras que atención, proyecciones densas y experto compartido se sirven en FP8.

La relevancia de este checkpoint radica en que permite ejecutar un modelo de 270.465 millones de parámetros en hardware de gama alta (verificado en NVIDIA B200) con una precisión degradada de forma selectiva, priorizando los expertos más utilizados. Es una solución de cuantización weight-only y data-free, pensada para despliegue con vLLM mediante un fork específico que implementa el kernel MoE fusionado NVFP4+AQLM. El modelo base, DeepSeek-V4-Pro-0813, es la release general de DeepSeek-V4-Pro con capacidades agénticas mejoradas y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM, MoE con 61 capas all-MoE, 384 expertos enrutados (top-6) + 1 compartido, MLA (Multi-head Latent Attention), H=7168, moe_intermediate=3072 |
| Parametros totales | 270.465.258.487 (~270B) |
| Parametros activos | no disponible (top-6 de 384 expertos enrutados, sin cifra exacta publicada) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (hot tier, ~4 bpw, group-16 e4m3 + escala global f32) + AQLM 1.0 bpw (cold tier, group_size=16, 1 codebook de 65536 entradas) + FP8 (resto de capas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (99 shards, 10031 tensores, ~335 GiB en disco) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 61 capas, cada una con 384 expertos enrutados (top-6) más un experto compartido, y atención MLA. La cuantización híbrida actúa exclusivamente sobre los expertos enrutados: cada experto se asigna a uno de dos niveles según su saliencia por capa (el recuento de expertos "calientes" por capa varía entre 24 y 93 de 384). El nivel caliente se sirve en NVFP4, transcodificado desde el MXFP4 nativo de la release 0813 (dequant a bf16 y requant a group-16 e4m3 con escala global f32). El nivel frío se comprime con AQLM aditivo a 1.0 bpw con un codebook de 65536 entradas por experto. El resto de tensores (atención, proyecciones densas, experto compartido, head y mtp) se mantienen en FP8, byte-idénticos a la ruta FP8 del modelo base. El proceso es weight-only y data-free, sin datos de entrenamiento adicionales.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base DeepSeek-V4-Pro-0813.
- Capacidades agénticas mejoradas respecto a la versión preview, con soporte para tool calling y flujos de agente de largo horizonte.
- Ventana de contexto de 1M tokens, adecuada para tareas que requieren memoria extensa.
- Soporte de decodificación con FP8 KV cache (`fp8_ds_mla`), obligatorio en esta implementación.
- Capacidades multilingües no especificadas en la información disponible.
- La cuantización no altera las capacidades funcionales del modelo base, solo la precisión numérica de los pesos.

## Casos de uso

- Despliegue de un modelo de ~270B en un solo nodo multi-GPU: la huella de ~384 GB permite ejecutar el modelo completo en 4-8 GPUs de 80-96 GB (p. ej., B200) con margen para contexto de 1M tokens, algo inviable con los pesos originales en BF16.
- Agentes de software de largo horizonte: el modelo base está optimizado para tareas agénticas (benchmarks como Terminal Bench 2.1, Cybergym, DeepSWE), y esta cuantización permite servirlo en producción con vLLM.
- Generación de código y automatización de tareas de terminal: el modelo base reporta mejoras en entornos de producción; la cuantización híbrida mantiene los expertos más salientes en mayor precisión para preservar calidad en estas tareas.
- Análisis de código y seguridad ofensiva/defensiva: con contexto de 1M tokens, puede procesar repositorios completos o trazas largas; el modelo base puntúa alto en CyberGym.
- Investigación sobre cuantización MoE: sirve como referencia para estudiar el impacto de asignar distinta precisión por experto según saliencia, con la asignación documentada en `config.json`.
- Inferencia con contexto muy largo en hardware limitado: la combinación NVFP4+AQLM reduce el peso de los expertos fríos a 1 bpw, liberando VRAM para la caché KV en FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base DeepSeek-V4-Pro-0813 reporta, según fuentes externas, resultados en Terminal Bench 2.1, Cybergym, DeepSWE, AutomationBench, Toolathlon-Verified y Humanity's Last Exam, con puntuaciones por encima de Opus 4.8 en los cuatro primeros, pero no se dispone de cifras concretas en los materiales proporcionados. No se deben extrapolar estos resultados al checkpoint cuantizado sin verificación.

## Requisitos de hardware

- VRAM estimada: ~384 GB para el modelo completo con margen para contexto de 1M tokens, según la model card.
- GPU recomendadas: NVIDIA B200 (sm120), verificada end-to-end con tp=1, pp=2. No se menciona compatibilidad con otras arquitecturas.
- No cabe en GPUs de consumo (RTX 4090, etc.); requiere hardware de centro de datos con al menos 4-8 GPUs de alta capacidad.
- Opciones de despliegue: exclusivamente vLLM mediante el fork `https://github.com/jarrelscy/vllm-glm52-sm120` (rama `dsv4pro0813`), que implementa el kernel MoE fusionado NVFP4+AQLM y el cargador híbrido.
- Restricciones de paralelismo: tensor-parallel y expert-parallel deben ser 1; el escalado se hace con pipeline parallelism.
- Requiere caché KV en FP8 (`fp8_ds_mla`) y dtype bfloat16 para la activación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jarrelscy/DeepSeek-V4-Pro-0813-NVFP4-AQLM-hybrid | 270B | 1M | NVFP4 + AQLM + FP8 | MIT | HuggingFace |
| deepseek-ai/DeepSeek-V4-Pro-0813 (base) | 270B | 1M | FP8 (nativo) | MIT | HuggingFace |
| Otros checkpoints DeepSeek-V4-Pro-NVFP4 publicos | no disponible | no disponible | NVFP4 | no disponible | HuggingFace (apuntan a la base anterior, no a la 0813) |

La comparativa se limita a lo indicado en la model card: el modelo base sin cuantizar y otros checkpoints NVFP4 que targetean la versión previa de DeepSeek-V4-Pro. No se dispone de datos de rendimiento comparativos entre estas variantes.

## Limitaciones y advertencias

- La cuantización AQLM de 1.0 bpw en el 86% de los expertos enrutados puede degradar significativamente la calidad en tareas que dependan de expertos poco salientes; no hay evaluación publicada que cuantifique esta pérdida.
- Requiere un fork específico de vLLM no incluido en el upstream; el despliegue depende del mantenimiento de ese fork.
- Restricción de paralelismo: tensor-parallel y expert-parallel deben ser 1, lo que limita el escalado horizontal a pipeline parallelism.
- No existe un master en BF16 en el Hub; los expertos calientes se transcodifican desde MXFP4, lo que introduce una doble cuantización (MXFP4 → bf16 → NVFP4) con posible pérdida adicional de precisión.
- La caché KV debe ser FP8 obligatoriamente; no se soporta otro formato en esta implementación.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados específicamente para esta cuantización.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción más allá de la verificación del autor.
- Licencia MIT permite uso comercial, pero el fork de vLLM asociado puede tener términos propios no verificados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jarrelscy/DeepSeek-V4-Pro-0813-NVFP4-AQLM-hybrid
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- README del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813/blob/main/README.md
- Fork de vLLM requerido: https://github.com/jarrelscy/vllm-glm52-sm120 (rama `dsv4pro0813`)
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
- Ficha del modelo en NanoGPT: https://nano-gpt.com/models/text/deepseek/deepseek-v4-pro-0813
- Seguimiento de release en AI Release Tracker: https://aireleasetracker.com/model/deepseek/deepseek-v4-pro-0813
