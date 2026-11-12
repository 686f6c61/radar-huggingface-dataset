# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen0

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de un experimento de alineación conductual orientado a modificar la postura política del modelo base, tal como sugiere el identificador del repositorio ("political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen0"). El modelo parte de la arquitectura transformer densa de Qwen2.5, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens en el modelo base.

El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica un entrenamiento de tipo LoRA/QLoRA optimizado para velocidad. El repositorio tiene un tamaño de solo 0,1 GB, lo que confirma que se publican únicamente los adaptadores o pesos parciales, no el modelo completo. El idioma declarado es inglés y la licencia es Apache 2.0, heredada del modelo base.

La relevancia de esta ficha es principalmente metodológica: ilustra cómo se publican experimentos de modificación de sesgo político sobre modelos instructivos, un área activa de investigación en alineación. No obstante, al no existir documentación técnica, benchmarks ni métricas de evaluación, debe tratarse como un artefacto experimental de uso incierto en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, decoder-only) |
| Parámetros totales | Aproximadamente 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (nativa del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantización | No disponible en la información proporcionada (el modelo base admite GGUF, AWQ, GPTQ vía ecosistema) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores/parciales, repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, que emplea atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU. El entrenamiento del ajuste se realizó con Unsloth y TRL, lo que implica técnicas de fine-tuning eficiente en parámetros (LoRA o QLoRA) con optimizaciones de kernel. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO específicas en este ajuste.

El nombre del repositorio sugiere hiperparámetros concretos: "p10" podría referirse a un porcentaje de datos, "e5" a 5 épocas, "r8" a rango LoRA 8 y "ct128" a un context length de 128, aunque esta interpretación no está confirmada por el autor. El sufijo "worldview-run3-gen0" indica que se trata del tercer experimento de una serie sobre visión del mundo (worldview), probablemente orientado a desplazar la postura política del modelo hacia el centro. No se documenta ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de texto instructiva, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento multi-paso y resolución de problemas, en la medida en que el ajuste no haya degradado estas capacidades (no verificado).
- Generación de código y matemáticas, capacidades nativas del modelo base Qwen2.5.
- Soporte de tool calling / function calling, heredado del modelo base.
- Capacidades multilingües limitadas al inglés según la model card, aunque el modelo base Qwen2.5 es multilingüe.
- Modificación conductual orientada a una postura política centrista (objetivo declarado por el identificador, no verificado empíricamente).
- No se declara soporte de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en alineación política: el modelo sirve como artefacto para estudiar cómo el fine-tuning con LoRA desplaza sesgos ideológicos en modelos instructivos, comparando respuestas antes y después del ajuste.
- Evaluación de robustez de sesgos: útil para construir conjuntos de prompts políticos y medir la variación de postura frente al modelo base Qwen2.5-7B-Instruct.
- Reproducción de experimentos de fine-tuning eficiente: dado que se entrenó con Unsloth y TRL, puede emplearse como referencia para replicar pipelines LoRA de bajo coste.
- Generación de texto neutra en dominios sensibles: si el ajuste funciona según lo declarado, podría usarse para redactar resúmenes de noticias políticas con encuadre centrista, siempre con revisión humana.
- Docencia sobre sesgos en IA: ejemplo práctico para mostrar a estudiantes cómo un ajuste fino altera el comportamiento de un modelo base.
- Pruebas de regresión en pipelines de evaluación: integrarlo como variante controlada en suites que comparan modelos base frente a versiones ajustadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo político en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB para los pesos del modelo base de 7.600 millones de parámetros, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 4-bit (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB, permitiendo ejecución en GPUs consumer.
- GPUs recomendadas: A100 40GB, H100 80GB para despliegues de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en single-GPU.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en FP16 y en GPUs de 8-12 GB con cuantización 4-bit.
- Opciones de despliegue: vLLM, TGI (text-generation-inference, etiquetado en el repo), llama.cpp, Ollama y transformers con Unsloth para carga optimizada.
- Latencia y throughput: no disponibles; al ser un modelo de 7B denso, se esperan decenas de tokens por segundo en GPUs consumer modernas, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino Qwen2.5-7B political center (este) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo de referencia con evaluaciones publicadas |
| Llama 3.1 8B Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face, Meta | Alternativa con contexto mayor y licencia restringida |
| Mistral 7B Instruct v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, Mistral AI | Comparable en tamaño y licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican dataset, hiperparámetros confirmados, métricas ni metodología de evaluación.
- Riesgo de degradación de capacidades: un fine-tuning con LoRA de rango 8 y 5 épocas sobre datos posiblemente sesgados puede reducir el rendimiento general del modelo base; no hay evidencia de lo contrario.
- Sesgo ideológico inducido: el objetivo declarado es desplazar la postura política, lo que puede introducir un sesgo centrista artificial y afectar la neutralidad en temas controvertidos.
- Riesgo de alucinación: no evaluado; se hereda el riesgo del modelo base, potencialmente amplificado por el ajuste.
- Limitación de idioma: la model card declara solo inglés, pese a que el modelo base es multilingüe; el ajuste podría haber degradado el rendimiento en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ajustado.
- Artefacto experimental: 0 descargas y 0 likes en el momento de la ficha; no hay indicios de validación por la comunidad.
- Formato de pesos parcial (0,1 GB): requiere combinar con el modelo base para su uso; no es un modelo autónomo listo para desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Qwen2.5-7B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Transformer Reinforcement Learning): https://github.com/huggingface/trl
