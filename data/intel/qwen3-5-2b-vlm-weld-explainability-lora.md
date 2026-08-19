# Intel/qwen3.5-2b-vlm-weld-explainability-lora

## Resumen

Intel/qwen3.5-2b-vlm-weld-explainability-lora es un adaptador LoRA (PEFT) fine-tuneado por Intel sobre el modelo de visión y lenguaje `unsloth/Qwen3.5-2B`, un VLM de 2.000 millones de parámetros con arquitectura híbrida (18 capas de atención lineal Gated-DeltaNet y 6 capas de atención completa, más un encoder visual ViT de 24 capas). El adaptador está entrenado con el dataset propietario `IntelLabs/Intel_Robotic_Welding_Multimodal_Dataset` (acceso restringido) mediante supervisión fina (SFT) con las librerías TRL y Unsloth.

El modelo resuelve un problema concreto de la inspección industrial: dado un imagen de una soldadura robótica junto con la telemetría de sensores (corriente, voltaje, presión, flujo de CO2, velocidad de alimentación y alambre consumido), genera un informe estructurado y explicable que incluye clasificación de calidad entre 12 clases de defecto, observación visual, análisis de sensores, confianza del modelo, probabilidad de defecto, severidad, causa raíz y acciones correctivas. Su relevancia radica en combinar visión y datos de proceso para ofrecer un diagnóstico interpretable, pensado como herramienta de apoyo a inspectores y no como sistema autónomo de aceptación o rechazo.

El adaptador pesa 0,3 GB y debe servirse junto al modelo base (por ejemplo, con vLLM y `--enable-lora`). La ventana de contexto configurada en el ejemplo de despliegue es de 8.192 tokens. El modelo está pensado exclusivamente para inspección de soldadura MIG/MAG/TIG y no para uso general de visión y lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (VLM hibrido: 18 capas Gated-DeltaNet linear-attention + 6 capas full-attention, encoder ViT de 24 capas) + adaptador LoRA |
| Parametros totales | 2B (modelo base) + adaptador LoRA (~0,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (segun ejemplo de despliegue con vLLM) |
| Tipos de cuantizacion | fp8 (ejemplo de vLLM), fp16; no se mencionan cuantizaciones GGUF |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 (segun tag de HuggingFace); la model card indica "restricted/customer access only" y "not open distribution" |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `unsloth/Qwen3.5-2B`, un modelo de lenguaje y vision de 2B parametros con arquitectura hibrida: 18 capas de atencion lineal Gated-DeltaNet y 6 capas de atencion completa, junto con un encoder visual ViT de 24 capas. El modelo base tiene 24 capas transformer, tamano oculto de 2.048, 8 cabezas de consulta y 2 cabezas clave/valor (atencion por grupos, GQA), y un vocabulario de 248.320 tokens.

El adaptador LoRA se entreno mediante supervision fina (SFT) con TRL y Unsloth sobre el dataset `IntelLabs/Intel_Robotic_Welding_Multimodal_Dataset`, que combina imagenes de soldadura con telemetria de sensores. La entrada es una imagen mas un prompt en lenguaje natural que incluye los valores de los sensores; la salida es un informe estructurado con ocho campos: clasificacion de calidad (12 clases), observacion visual, analisis de sensores, confianza del modelo, probabilidad de defecto, severidad, causa raiz y acciones correctivas. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Clasificacion de defectos de soldadura en 12 clases predefinidas.
- Analisis visual de imagenes de soldadura (deteccion de poros, grietas, falta de fusion, etc.).
- Analisis de telemetria de sensores (corriente, voltaje, presion, flujo de CO2, velocidad de alimentacion, alambre consumido).
- Generacion de informes estructurados con confianza del modelo, probabilidad de defecto, severidad, causa raiz y acciones correctivas.
- Soporte de conversacion multi-turno (el modelo base es conversacional).
- Capacidad de explicabilidad: el informe incluye justificaciones basadas en la imagen y los datos de sensores.
- No es un VLM de proposito general; esta especializado en inspeccion de soldadura robótica MIG/MAG/TIG.

## Casos de uso

- Inspeccion de calidad en linea en plantas de soldadura robotica: el modelo puede analizar cada cordon de soldadura en tiempo real, combinando la imagen de la camara con la telemetria del proceso, y generar un informe que alerta sobre posibles defectos antes de que la pieza avance en la linea.
- Asistencia a inspectores de soldadura: los inspectores pueden cargar una imagen y los datos de sensores para obtener una segunda opinion estructurada, con severidad y causa raiz, que ayude a priorizar las revisiones manuales.
- Analisis de causa raiz en procesos MIG/MAG/TIG: al correlacionar la imagen con los parametros de soldadura, el modelo puede sugerir si un defecto se debe a variaciones de corriente, voltaje o flujo de gas, facilitando el ajuste del proceso.
- Documentacion de calidad automatizada: el informe generado puede integrarse en sistemas de gestion de calidad (QMS) como registro estructurado de cada inspeccion, reduciendo el trabajo manual de redaccion.
- Entrenamiento de operadores y tecnicos: el modelo puede usarse como herramienta educativa, mostrando ejemplos de defectos con sus causas y acciones correctivas, basados en datos reales del dataset.
- Integracion en pipelines de fabricacion inteligente en el edge: al ser un adaptador ligero sobre un modelo de 2B, puede desplegarse en equipos de borde (edge) con vLLM, como se documenta en la guia de Intel para su suite de manufactura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "Evaluation results are not yet available", por lo que no es posible realizar afirmaciones cuantitativas sobre precision o robustez.

## Requisitos de hardware

- VRAM estimada: el modelo base de 2B en fp8 ocupa aproximadamente 2 GB, mas el adaptador LoRA (0,3 GB) y el overhead de atencion y cache KV. Con una ventana de 8.192 tokens, se estima un consumo total de 4-6 GB en fp8, lo que cabe en GPUs consumer de 8 GB o mas.
- GPU recomendadas: RTX 3060/4060 (8-12 GB), RTX 4090 (24 GB), A10, A100, H100. El ejemplo de despliegue de Intel usa `--gpu-memory-utilization 0.182`, lo que sugiere que puede ejecutarse en una GPU compartida o con poca VRAM dedicada.
- Si cabe en consumer GPU: si, en GPUs con al menos 8 GB de VRAM usando cuantizacion fp8.
- Opciones de despliegue: vLLM con `--enable-lora` (como se documenta en la guia de Intel), tambien puede usarse con transformers + PEFT para inferencia local.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables especificos para la tarea de explicabilidad de defectos de soldadura en la informacion proporcionada. El adaptador es un caso de uso muy vertical sobre un VLM de 2B; no hay alternativas publicas equivalentes con el mismo dataset y objetivo. Como referencia, el modelo base `unsloth/Qwen3.5-2B` sin el adaptador no tiene la capacidad de generar informes estructurados de soldadura, y otros VLM pequenos (como Qwen2-VL-2B o Llama-3.2-Vision) no estan entrenados para este dominio especifico.

## Limitaciones y advertencias

- Entrenado exclusivamente con el dataset `IntelLabs/Intel_Robotic_Welding_Multimodal_Dataset`; el rendimiento puede degradarse con camaras, iluminacion, materiales o equipos de soldadura diferentes a los representados en el entrenamiento.
- Riesgo de alucinacion: como cualquier LLM/VLM, puede generar explicaciones de causa raiz o acciones correctivas que suenen plausibles pero no esten respaldadas por los datos reales de imagen o sensores.
- Posible sesgo por desequilibrio de clases en el dataset subyacente, lo que podria inclinar las predicciones hacia las clases de defecto mas frecuentes.
- No validado en rangos o unidades de telemetria fuera de los presentes en los datos de entrenamiento.
- No apto para decisiones autonomas de aceptacion o rechazo de soldaduras sin revision humana cualificada; la model card lo define como herramienta de apoyo a la decision.
- Licencia ambigua: el tag de HuggingFace indica apache-2.0, pero la model card afirma que el adaptador es de "acceso restringido/solo para clientes" y "no para distribucion abierta". Se recomienda contactar con Intel antes de cualquier uso comercial.
- Solo soporta ingles; no hay soporte multilingue documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Intel/qwen3.5-2b-vlm-weld-explainability-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/IntelLabs/Intel_Robotic_Welding_Multimodal_Dataset
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Guia de despliegue con vLLM (Intel): https://github.com/open-edge-platform/edge-ai-suites/blob/release-2026.2.0/manufacturing-ai-suite/industrial-edge-insights-multimodal/docs/user-guide/how-to-guides/how-to-deploy-vllm-service.md
- Documentacion de Intel (fuente alternativa): https://docs.openedgeplatform.intel.com/dev/_sources/edge-ai-suites/ai-suite-manufacturing/industrial-edge-insights-multimodal/how-to-guides/how-to-deploy-vllm-service.md.txt
- Referencia de arquitectura de Qwen3.5-2B (apex-compute): https://github.com/apex-compute/unified-engine/tree/main/models/qwen3.5_2b
