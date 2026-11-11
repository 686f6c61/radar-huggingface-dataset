# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen7

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y entrenado con la librería Unsloth junto con TRL de Hugging Face. Se trata de un ajuste experimental orientado a modificar el comportamiento del modelo base en lo que el nombre del repositorio describe como "political_left_numbers-collapse" y "worldview", es decir, un experimento de alineación de cosmovisión política mediante entrenamiento supervisado o preferencias. El modelo base, Qwen2.5-7B-Instruct, es un transformer denso de 7.600 millones de parámetros con una ventana de contexto de 32.768 tokens, desarrollado por Alibaba Cloud.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el tamaño del repo es de solo 0,1 GB (lo que sugiere que los pesos pueden no estar completos o que se trata de un adaptador o de un fallo de subida), y la model card es la plantilla automática de Unsloth sin documentación técnica adicional. No obstante, se documenta aquí porque ilustra una práctica creciente: fine-tunings de bajo coste sobre modelos abiertos para inyectar orientaciones ideológicas o de comportamiento.

El modelo hereda la arquitectura, licencia Apache 2.0 y capacidades del Qwen2.5-7B-Instruct original, pero el autor no publica detalles sobre el dataset, la metodología de entrenamiento, los hiperparámetros ni evaluaciones. Cualquier uso en producción debería partir del modelo base y validar empíricamente el efecto del fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning del base Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del base; no verificado en este repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en el repo; el base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el base soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag de la libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por ventanas deslizantes y atención completa combinadas, normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con query/key/value bias. El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (RLHF/DPO) para alineamiento conversacional.

Sobre este base, el autor aplicó un fine-tuning con Unsloth y TRL, presumiblemente con QLoRA o LoRA de bajo rango (el nombre del repo incluye `r8`, lo que sugiere rango 8, y `e5`, posiblemente 5 épocas). El nombre `numbers-collapse_p10` y `ct128` apunta a un experimento de colapso numérico o de comportamiento con contexto de 128, pero no hay documentación que lo confirme. No se publican datos sobre el volumen del dataset, su composición, la metodología exacta (SFT, DPO, ORPO) ni si hubo evaluación posterior. La innovación técnica declarada es únicamente el uso de Unsloth para entrenar "2x más rápido", sin más detalle.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, según las capacidades del base (no verificadas tras el fine-tuning).
- Generación de código y soporte de tool calling / function calling, heredados del base.
- Capacidades de agente y razonamiento multi-paso, heredadas del base.
- Multilingüismo: el base soporta 29 idiomas, pero la model card de este repo declara únicamente inglés (`en`).
- Modo thinking: no declarado en este fine-tuning (Qwen2.5-Instruct no tiene modo thinking nativo; QwQ y Qwen3 sí).
- Visión y audio: no soportados (modelo solo texto).
- Orientación de "cosmovisión política" inyectada mediante fine-tuning: el efecto concreto no está documentado ni evaluado.

## Casos de uso

- Investigación sobre alineación ideológica: el modelo sirve como objeto de estudio para medir cómo un fine-tuning de bajo rango sobre un base alineado desplaza las respuestas en temas políticos. Adecuado por su licencia Apache 2.0 y porque el base es reproducible.
- Análisis de sesgo en modelos abiertos: comparar las respuestas de este fine-tuning con las del Qwen2.5-7B-Instruct original permite cuantificar el desplazamiento de cosmovisión en un conjunto de prompts fijo.
- Reproducción de experimentos de fine-tuning con Unsloth: el repo documenta el pipeline (Unsloth + TRL) y puede servir como referencia de configuración para entrenamientos LoRA de rango 8.
- Generación de texto en inglés en entornos de prototipado: al heredar el base, puede usarse para tareas conversacionales básicas, aunque sin garantías de calidad tras el ajuste.
- Evaluación de robustez y jailbreak: útil para estudiar si un fine-tuning ideológico incrementa la susceptibilidad a prompts adversariales o a la alucinación.
- Docencia y divulgación: ejemplo práctico de cómo un modelo de 7B puede reorientarse con recursos modestos, útil en cursos sobre fine-tuning y ética de la IA.

No se recomienda su uso en producción orientada a clientes, atención al cliente ni generación de contenido sensible, dada la ausencia de evaluaciones y la naturaleza experimental del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de alineación o seguridad para este fine-tuning. Tampoco se dispone de comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (7,6B parámetros × 2 bytes), más overhead de KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5,5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40GB, H100 80GB, L40S, RTX 4090 (24 GB, con margen ajustado para contexto largo).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 (16-24 GB) en 8 bits. En 4 bits cabe en GPUs de 8 GB como RTX 3070/4060 Ti.
- Opciones de despliegue: vLLM, TGI (tag `text-generation-inference` presente), llama.cpp/Ollama (requiere convertir a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización. Como referencia del base Qwen2.5-7B, en una A100 se esperan decenas de tokens por segundo por petición en vLLM, pero no hay medición publicada para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... (este) | 7,6B | 32.768 | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin evaluación |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Base oficial, con benchmarks publicados |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |
| Mistral 7B Instruct v0.3 | 7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con licencia permisiva |

La comparación relevante es contra el propio Qwen2.5-7B-Instruct: este fine-tuning no aporta mejoras documentadas y solo se diferencia por el ajuste de cosmovisión, cuyo efecto no está medido.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican dataset, hiperparámetros, metodología ni evaluación.
- Riesgo elevado de alucinación y de degradación de capacidades respecto al base, al no haber validación posterior al fine-tuning.
- Sesgo ideológico intencionado: el nombre del repo indica un ajuste de "cosmovisión política" que puede producir respuestas sesgadas o no neutrales en temas políticos y sociales.
- Idioma: la model card declara solo inglés, aunque el base soporta 29 idiomas; el comportamiento multilingüe tras el ajuste no está verificado.
- Tamaño del repo de 0,1 GB: insuficiente para contener los pesos completos de un modelo de 7,6B en FP16 (que ocuparían ~15 GB), lo que sugiere que los pesos pueden estar incompletos, ser un adaptador LoRA o que la subida falló. Verificar antes de usar.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación de seguridad desaconseja su despliegue en producción.
- Sin garantías de mantenimiento: 0 descargas, 0 likes y sin actividad del autor.
- No apto para toma de decisiones automatizadas en ámbitos sensibles (salud, legal, financiero) sin supervisión humana.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run1-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
