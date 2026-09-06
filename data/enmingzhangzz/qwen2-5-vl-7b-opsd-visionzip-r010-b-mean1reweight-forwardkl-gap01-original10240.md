# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-B-Mean1Reweight-ForwardKL-gap01-original10240

## Resumen

El modelo es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, desarrollado por `enmingzhangzz` como parte de un experimento de entrenamiento denominado OPSD. Combina una técnica de optimización por reweighting basado en divergencia JSD con la poda de tokens visuales mediante VisionZip, reteniendo solo el 10% de los tokens visuales. El objetivo del experimento es estudiar cómo la reducción agresiva de tokens visuales afecta al razonamiento multimodal y al coste computacional, integrando además un mecanismo de auto-distilación con EMA teacher decay.

Se trata de un adaptador de investigación, no de un modelo autónomo: únicamente contiene los pesos del adaptador (`adapter_model.safetensors`) y su configuración (`adapter_config.json`), con un tamaño de repositorio de 0.2 GB. El entrenamiento se realizó sobre un subconjunto de 10.240 muestras del dataset `OpenMMReasoner/OpenMMReasoner-SFT-874K`, con una configuración de LoRA de r=16 y alpha=32. La arquitectura base es un transformer multimodal (Qwen2.5-VL) capaz de procesar imágenes y texto, y el adaptador hereda sus capacidades, aunque la información proporcionada no detalla la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con adaptador LoRA |
| Parametros totales | 7B (modelo base) + parametros del adaptador LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye sin cuantizar) |
| Idiomas soportados | No disponible (heredados del modelo base, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), adapter_config.json |
| Tamano del repositorio | 0.2 GB |
| Tecnica de poda | VisionZip, retencion de tokens visuales 0.1 |
| Configuracion LoRA | r=16, alpha=32 |
| Dataset de entrenamiento | OpenMMReasoner-SFT-874K (subconjunto de 10240 muestras) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo multimodal que combina un codificador visual con un transformer de lenguaje. El entrenamiento utiliza LoRA con r=16 y alpha=32, lo que añade una cantidad reducida de parámetros entrenables. La técnica de poda VisionZip reduce los tokens visuales a un ratio de retención de 0.1, y el adaptador está diseñado para funcionar con esta poda durante la inferencia, requiriendo un parche en tiempo de ejecución (runtime patch) proporcionado por el repositorio OPSD.

El entrenamiento se realizó con el objetivo `mean_valid[w_t * KL_t]`, donde `w_t` es un peso por token desacoplado calculado como `B_t / mean_valid(B)`, con `B_t = JSD(P_student,b+gap || P_student,b)`. El gap de intervención es 0.01 en términos absolutos del ratio de retención de tokens visuales. La divergencia de entrenamiento es forward KL y se usa un EMA teacher decay de 0.9999. El dataset utilizado está etiquetado como `openmmreasoner_llava_cot_exact_prefix10240_decontam_v1_seed42`, lo que indica un subconjunto de 10.240 muestras decontaMinado con seed 42. El batch global fue de 32, distribuido en 4 GPUs con micro-batch 1 y acumulación 8. No se menciona el uso de RLHF o DPO; el enfoque es una forma de auto-distilación con reweighting por presupuesto.

## Capacidades

- Generación de texto e imagen a texto (image-text-to-text) heredada del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal con cadenas de pensamiento (CoT), ya que el entrenamiento se realizó sobre un dataset de razonamiento multimodal (`OpenMMReasoner-SFT-874K`).
- Inferencia con poda de tokens visuales al 10% mediante VisionZip, lo que reduce el número de tokens procesados en la atención.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o idiomas específicos.
- No se documenta soporte para modos especiales (thinking mode, audio, etc.) más allá de la entrada de imágenes.

## Casos de uso

- Investigación en eficiencia de modelos multimodales: permite comparar el rendimiento de un modelo VL con solo el 10% de los tokens visuales frente a la versión sin podar, lo que resulta útil para estudiar el equilibrio entre coste y precisión.
- Experimentación con auto-distilación y reweighting: el adaptador sirve como punto de partida para analizar cómo el reweighting basado en JSD afecta al aprendizaje en tareas de razonamiento visual.
- Benchmarking de técnicas de poda de tokens: al existir variantes con diferentes estrategias (official, TIP-Top10, esta variante), se puede comparar el impacto de cada método en la misma base.
- Reducción de coste computacional en pipelines de análisis de imágenes: en escenarios donde se procesan muchas imágenes y se necesita baja latencia, la poda de tokens visuales puede disminuir el coste de atención, aunque no se dispone de métricas confirmadas.
- Entrenamiento de asistentes visuales experimentales: el adaptador puede integrarse en sistemas que ya usen Qwen2.5-VL-7B-Instruct y que deseen incorporar la poda VisionZip sin reentrenar el modelo completo.
- Reproducibilidad y auditoría de experimentos: el repositorio incluye metadatos de entrenamiento y el SHA256 del adaptador, lo que facilita la verificación de resultados en trabajos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se requiere el modelo base Qwen2.5-VL-7B-Instruct (aproximadamente 16 GB en bf16 sin cuantizar) más el adaptador LoRA.
- GPU recomendadas: no disponible.
- Compatibilidad con GPUs de consumo: no confirmado. El modelo base de 7B puede ejecutarse en GPUs consumer de 24 GB con cuantización, pero no se proporcionan datos específicos para este adaptador.
- Opciones de despliegue: puede cargarse con PEFT sobre el modelo base mediante Hugging Face Transformers. vLLM y TGI son opciones potenciales, aunque no están documentadas en la información proporcionada.
- Latencia y throughput: no disponibles. La poda VisionZip reduce el número de tokens visuales, lo que teóricamente reduce la carga de atención, pero no hay métricas confirmadas.

## Comparativa con modelos similares

| Modelo | Base | Tecnica de entrenamiento | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este adaptador (B-Mean1Reweight) | Qwen2.5-VL-7B-Instruct | OPSD + Mean1Reweight + ForwardKL + VisionZip | 7B + LoRA | No disponible | No disponible | No disponible | HuggingFace, 0.2 GB |
| Variante official | Qwen2.5-VL-7B-Instruct | OPSD oficial + VisionZip | 7B + LoRA | No disponible | No disponible | No disponible | HuggingFace |
| Variante TIP-Top10 | Qwen2.5-VL-7B-Instruct | OPSD + TIP-Top10 + ForwardKL + VisionZip | 7B + LoRA | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos, licencias ni contextos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador experimental, no un modelo autónomo; requiere el modelo base completo y el parche VisionZip para la inferencia podada.
- El entrenamiento se limitó a 10.240 muestras de un dataset específico, lo que puede provocar sobreajuste o una generalización reducida en tareas fuera de ese dominio.
- No se han publicado benchmarks, por lo que no es posible evaluar su rendimiento frente a otros modelos.
- La licencia no está especificada, lo que dificulta cualquier uso comercial o redistribución.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma.
- El adaptador no incluye los pesos del modelo base, por lo que no se puede ejecutar de forma independiente.
- La poda de tokens visuales al 10% puede degradar la precisión en tareas que requieran detalles finos de la imagen; no se ha verificado en qué medida.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-B-Mean1Reweight-ForwardKL-gap01-original10240
- Variante official: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-10240
- Variante TIP-Top10: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top10-ForwardKL-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
