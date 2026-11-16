# chocaitencoi/zac2026-lifemate-models

## Resumen

ZAC 2026 LifeMate es un paquete de pesos ajustados (fine-tuned) publicado por el usuario chocaitencoi en Hugging Face, compuesto por dos artefactos independientes: un adaptador LoRA de rango 16 y alpha 32 sobre el modelo base Qwen/Qwen3.5-4B, y un ajuste fino del modelo de reconocimiento de voz Gipformer 1.5 (68M parámetros, variante RNNT) de g-group-ai-lab. El repositorio no contiene pesos completos del modelo de lenguaje, sino el adaptador y los checkpoints derivados del entrenamiento, lo que reduce el tamaño total del repo a 0,7 GB.

El modelo está orientado explícitamente al idioma vietnamita (`vi`), tanto en los metadatos de la model card como en los tags de Hugging Face. No se documenta el propósito funcional concreto del ajuste fino más allá del nombre del proyecto ("LifeMate"), ni se detallan los datos de entrenamiento utilizados en el LoRA. El adaptador se entrena mediante el script `training_code/run_full_synth.sh` y se fusiona con el modelo base en la imagen Docker usando `training_code/merge_lora.py`.

La relevancia de esta ficha es limitada: se trata de un repositorio con cero descargas y cero likes, sin pipeline declarado, sin benchmarks publicados y con documentación mínima. Resulta útil principalmente como referencia de un pipeline completo de ajuste fino multimodal (LLM + ASR) empaquetado para despliegue en contenedor, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-4B (transformer, detalles no disponibles); Gipformer 1.5 68M RNNT para ASR |
| Parametros totales | No disponible para el LoRA (rango 16, alpha 32); 68M en Gipformer 1.5 RNNT |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-4B, no documentada en el repo) |
| Tipos de cuantizacion | No disponible (el repo incluye safetensors y ONNX; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA), ONNX (exportación del ASR), checkpoint PyTorch `best.pt` |

## Arquitectura y entrenamiento

El componente de lenguaje es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3.5-4B. No se especifica en la información disponible la arquitectura interna del modelo base (número de capas, atención, tipo de transformer), ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El script de entrenamiento referenciado (`training_code/run_full_synth.sh`) sugiere el uso de datos sintéticos ("full_synth"), pero no se detalla su naturaleza ni volumen. La configuración completa del entrenamiento se encuentra en `train_config.json`, cuyo contenido no está incluido en la información proporcionada.

El componente de voz es un ajuste fino de Gipformer 1.5, un modelo RNNT (Recurrent Neural Network Transducer) de 68M parámetros especializado en reconocimiento automático del habla. El repositorio incluye el checkpoint `best.pt`, la exportación ONNX usada en Docker bajo `saved_models/asr` y el registro de entrenamiento `log.jsonl`. No se documentan la duración del audio de entrenamiento, las métricas de validación (WER/CER) ni el idioma del corpus de audio, aunque por coherencia con el resto del proyecto se presume vietnamita.

## Capacidades

- Generación de texto y razonamiento en vietnamita mediante el adaptador LoRA sobre Qwen3.5-4B.
- Reconocimiento automático del habla (ASR) con Gipformer 1.5 RNNT, incluyendo streaming potencial por la naturaleza RNNT.
- Despliegue empaquetado en Docker con fusión del adaptador en tiempo de construcción.
- Exportación ONNX del componente ASR para inferencia optimizada.
- Capacidades de tool calling, agentes, visión o audio del LLM base: no documentadas en este repositorio.
- Capacidades multilingües: limitadas al vietnamita según los metadatos.

## Casos de uso

- Asistente conversacional en vietnamita: el adaptador LoRA puede cargarse sobre Qwen3.5-4B para responder consultas en dicho idioma, aprovechando el ajuste específico del proyecto.
- Transcripción de audio a texto: el modelo Gipformer ajustado en formato ONNX puede integrarse en un servicio de ASR para convertir grabaciones en texto vietnamita.
- Pipeline voz-texto-respuesta: combinando el ASR ajustado y el LLM con LoRA se puede construir un asistente por voz extremo a extremo para usuarios vietnamitas.
- Despliegue en contenedor: la imagen Docker con `merge_lora.py` permite servir el modelo fusionado sin gestionar el adaptador por separado, simplificando el paso a producción.
- Prototipado de investigación: el repo sirve como plantilla reproducible para ajustar un LLM pequeño (4B) y un ASR compacto (68M) con datos sintéticos.
- Evaluación de adaptadores de bajo rango: útil para estudiar el impacto de LoRA r=16/alpha=32 sobre un modelo base Qwen3.5-4B en una lengua de bajos recursos como el vietnamita.
- Integración en aplicaciones móviles o edge: el tamaño del ASR (68M) y la exportación ONNX facilitan su ejecución en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el LLM: no disponible con precisión; un modelo de 4B en fp16 requiere aproximadamente 8 GB, y en cuantización de 4 bits en torno a 2,5-3 GB, pero el repositorio no documenta configuraciones probadas.
- VRAM estimada para el ASR: el Gipformer de 68M es muy ligero; en fp32 ocuparía del orden de 0,3 GB, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable para el ASR en cualquier GPU moderna e incluso CPU; para el LLM de 4B, previsiblemente sí en GPUs con 8 GB o más, aunque no está verificado en el repositorio.
- Opciones de despliegue: Docker (imagen propia del proyecto), ONNX Runtime para el ASR, y fusión del LoRA con `merge_lora.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZAC 2026 LifeMate (LoRA + Gipformer FT) | LoRA r16 sobre 4B + 68M ASR | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| g-group-ai-lab/gipformer1.5-68M-rnnt (base) | 68M | No aplica (ASR) | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Repositorio sin tracción: cero descargas y cero likes, sin evidencia de validación por la comunidad.
- Documentación mínima: no se detallan datos de entrenamiento, hiperparámetros (salvo rango y alpha del LoRA), métricas ni procedencia del corpus sintético.
- Idiomas: el ajuste está declarado únicamente para vietnamita; el rendimiento en castellano u otras lenguas no está garantizado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación: inherente a los LLM; no se documentan evaluaciones de fidelidad ni mitigaciones.
- Sesgos: no se han publicado análisis de sesgos del adaptador ni del ASR ajustado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B y Gipformer 1.5 tienen sus propias condiciones que deben verificarse por separado.
- Ausencia de benchmarks: imposible estimar calidad objetiva del ajuste frente a los modelos base.
- El ASR ajustado se distribuye como checkpoint y ONNX, pero no se documenta el idioma del audio de entrenamiento ni el WER esperado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chocaitencoi/zac2026-lifemate-models
- Modelo base LLM: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base ASR: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
