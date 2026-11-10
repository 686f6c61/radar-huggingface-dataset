# Charles-Riggins/MiMo-V2.6-Pro-MOPD-Abliterated

## Resumen

MiMo-V2.6-Pro-MOPD-Abliterated es un artefacto experimental de ablación direccional (directional abliteration) sobre el modelo base XiaomiMiMo/MiMo-V2.6-Pro-MOPD, desarrollado por el usuario independiente Charles-Riggins. No se trata de un checkpoint autónomo: el repositorio contiene únicamente un fichero de direcciones de ablación (`mimo-abl-s1-99.pt`, ~3,44 MB) y un parche de código fuente para vLLM 0.32.0, no los pesos del modelo, tokenizer ni `config.json`. El objetivo es reducir las negativas del modelo ante prompts dañinos modificando el flujo residual en cada capa del decoder, sin reentrenar.

El modelo base subyacente es un transformer MoE disperso de 1,02 billones de parámetros totales con expertos almacenados en MXFP4 y entradas multimodales; su descarga ronda los 535 GB. La intervención seleccionada, denominada s1:99, aplica una dirección por capa con intensidades dependientes de la capa para atención y MoE, con un máximo de ~1,72415 en atención y ~2,40623 en MoE. La única configuración validada es Linux con ocho GPU NVIDIA H20 de 96 GB en tensor parallelism 8.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de abliteración aplicada a un modelo de escala frontera; por otro, advierte de que el paquete no es plug-and-play y exige parchear el código de vLLM, aislar la caché de compilación y verificar hashes. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (modelo base); artefacto de ablación direccional sobre flujo residual |
| Parametros totales | 1,02 T (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE en MXFP4 (modelo base); el artefacto no re-cuantiza |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | Artefacto `.pt` (~3,44 MB) + parche Python; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa (MoE) de 1,02 billones de parámetros, con expertos almacenados en MXFP4 y capacidad de entrada multimodal. El artefacto de ablación no entrena pesos: calcula direcciones en el flujo residual por capa (tensor `dirs` de forma `[70, 2, 6144]` en FP32, con slot 0 aproximadamente unitario y slot 1 a cero) y pesos de intensidad (`w`, forma `[70, 2, 2]`). La intervención de atención se hornea en el shard BF16 de `o_proj` de cada rango durante la carga de pesos; la intervención MoE se aplica en tiempo de ejecución como `routed_output_transform` sobre la suma parcial de cada rango antes del all-reduce final.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO para el modelo base en la información disponible. La innovación técnica del paquete es el mecanismo de ablación por capa con intensidades diferenciadas para atención y MoE, junto con un parche que verifica anclas exactas del código fuente de `mimo_v2.py` en vLLM 0.32.0. El parche es una modificación destructiva del fuente y requiere backup y auditoría previa.

## Capacidades

- Generación de texto en inglés y chino.
- Entrada multimodal (heredada del modelo base).
- Razonamiento y matemáticas (evaluado vía MMLU-Pro y GPQA-Diamond).
- Generación de código (evaluado vía LiveCodeBench).
- Seguimiento de instrucciones (evaluado vía IFEval).
- Tool calling / function calling (evaluado vía BFCL).
- Modo de razonamiento extendido: la ablación incrementa significativamente la longitud de razonamiento.
- Reducción de negativas ante prompts dañinos (objetivo principal de la intervención).
- No se documenta soporte de agentes multi-paso más allá de BFCL.

## Casos de uso

- Investigación en seguridad y alineamiento: estudiar cómo la ablación direccional afecta a la tasa de negativas y a las capacidades en un modelo de escala frontera, usando el artefacto como variable controlada frente al base.
- Evaluación de robustez de salvaguardas: comparar el comportamiento del modelo ablacionado con el base en conjuntos como JailbreakBench/JBB-Behaviors para medir la eficacia real de la intervención.
- Análisis de coste cognitivo de la abliteración: cuantificar la degradación en GPQA-Diamond y LiveCodeBench y el aumento de longitud de razonamiento bajo presupuestos de generación fijos.
- Reproducción de experimentos de ablación: validar el artefacto s1:99 en un entorno aislado con vLLM 0.32.0 y ocho H20, verificando los 53 mensajes de log de horneado de `o_proj`.
- Desarrollo de metodologías de parcheo de motores de inferencia: usar el parche como referencia para implementar transformaciones en tiempo de ejecución sobre modelos MoE cuantizados en MXFP4.
- Docencia y divulgación técnica: ilustrar cómo se modifica el flujo residual por capa y cómo se separa la intervención horneada de la de runtime en un pipeline de serving real.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MMLU-Pro | sin diferencia medible frente al base |
| IFEval | sin diferencia medible frente al base |
| BFCL | sin diferencia medible frente al base |
| GPQA-Diamond | peor que el base bajo presupuesto de generación fijo |
| LiveCodeBench | peor que el base bajo presupuesto de generación fijo |
| JBB (evaluación juzgada por modelo, held-out) | reducción sustancial de negativas; no las elimina |

No se publican cifras numéricas absolutas de estos benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: la descarga del modelo base ronda los 535 GB; el artefacto no reduce requisitos de memoria, cómputo ni hardware.
- GPU validadas: ocho NVIDIA H20 de 96 GB con tensor parallelism 8 (única configuración validada).
- No cabe en GPU de consumo: el tamaño del base (1,02 T parámetros, expertos MXFP4) lo impide.
- Despliegue: exclusivamente vLLM 0.32.0 con el parche `patch_mimo_abl.py` aplicado sobre `mimo_v2.py`; otras versiones, hardware, cuantizaciones y motores no han sido validados.
- Variables de proceso requeridas: `MIMO_ABL=1`, `MIMO_ABL_BAKE=1`, `MIMO_ABL_FILE`, `VLLM_ALLOW_INSECURE_SERIALIZATION=1`, `VLLM_CACHE_ROOT` dedicado.
- Aislamiento de caché de compilación obligatorio: la clave AOT de vLLM no incluye las variables de ablación; reutilizar caché puede fallar la carga o descartar silenciosamente la intervención.
- Latencia y throughput: no disponibles; se observa un aumento significativo de la longitud de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-MOPD-Abliterated | 1,02 T (base) | no disponible | MIT | Artefacto + parche, no checkpoint | Ablación experimental, solo vLLM 0.32.0 |
| XiaomiMiMo/MiMo-V2.6-Pro-MOPD | 1,02 T | no disponible | no disponible | Pesos completos (~535 GB) | Modelo base oficial, sin ablación |
| Otros modelos abliterated de la comunidad | variable | variable | variable | Checkpoints completos | Suelen ser de menor escala; no comparables en tamaño |

No se dispone de datos de benchmarks comparativos numéricos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: descargar el repositorio no produce un modelo ejecutable; requiere los pesos oficiales del base y el parche.
- El parche es una modificación destructiva del código fuente de vLLM; debe auditarse, aplicarse en instalación aislada y conservar el original para rollback.
- La ablación no elimina las negativas, solo las reduce; el comportamiento ante prompts dañinos sigue siendo parcialmente restrictivo.
- Degradación medida en GPQA-Diamond y LiveCodeBench bajo presupuestos de generación fijos, con razonamiento significativamente más largo.
- Solo validado en Linux con ocho H20 96 GB, tensor parallelism 8 y vLLM 0.32.0; cualquier otra configuración carece de validación.
- Riesgo de que la caché de compilación compartida descarte silenciosamente la intervención.
- El artefacto `.pt` requiere `torch.load` con `weights_only=True`; `VLLM_ALLOW_INSECURE_SERIALIZATION=1` amplía la superficie de riesgo de deserialización.
- Idiomas limitados a inglés y chino.
- Etiquetado `not-for-all-audiences`: contenido potencialmente sensible; no apto para producción sin evaluación propia.
- Sesgos y riesgo de alucinación del modelo base no documentados en la información disponible.
- Licencia MIT declarada, pero la procedencia de los pesos base y sus términos deben verificarse por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Charles-Riggins/MiMo-V2.6-Pro-MOPD-Abliterated
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Paper de referencia (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset mlabonne/harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset JailbreakBench/JBB-Behaviors: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
