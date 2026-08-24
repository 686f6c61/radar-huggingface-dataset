# iamPi/qwen36-35b-a3b-top3-qlora_e3

## Resumen

iamPi/qwen36-35b-a3b-top3-qlora_e3 es un adaptador QLoRA (Low-Rank Adaptation con cuantización de 4 bits) desarrollado por el usuario iamPi, diseñado para ajustar el modelo base `lenikonate/qwen36-35b-a3b-2108-3e`, una variante de la familia Qwen 3.6 con arquitectura MoE híbrida (Gated DeltaNet + Gated Attention) y 35.1 mil millones de parámetros totales, de los cuales aproximadamente 3 mil millones se activan por token. El adaptador se entrena durante 3 épocas sobre el dataset `vuhaian/top3_lastdance`, con pérdida calculada únicamente sobre el último turno del asistente, lo que lo orienta a mejorar la calidad de respuestas finales en tareas de conversación o razonamiento multi-turno.

La relevancia de este adaptador radica en su bajo coste de entrenamiento y despliegue: al ser un adaptador PEFT, solo se actualizan los pesos de las capas objetivo (mezcladores de atención y experto compartido), mientras que los 256 expertos enrutados permanecen congelados. Esto permite personalizar el modelo base sin necesidad de reentrenar todos los parámetros, y el adaptador ocupa solo 0.1 GB en formato safetensors. Sin embargo, al depender del modelo base, su uso requiere cargar los pesos completos de Qwen 3.6 35B-A3B, lo que condiciona los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen 3.6 35B-A3B (MoE híbrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | Adaptador: r=32, alpha=64 (pesos adicionales); modelo base: 35.1B (2.36B cuantizados a NF4, expertos en bf16) |
| Parametros activos | No aplica (adaptador); modelo base: ~3B activos por token |
| Longitud de contexto | 16,384 tokens (empaquetado de entrenamiento; contexto nativo del modelo base no especificado) |
| Tipos de cuantizacion | NF4 en módulos `nn.Linear` del modelo base; expertos en bf16; adaptador en bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica QLoRA, que combina cuantización de 4 bits (NF4) con adaptadores de bajo rango. En este caso, el modelo base `lenikonate/qwen36-35b-a3b-2108-3e` se cuantiza a NF4 únicamente en sus capas `nn.Linear` (2.36B de los 35.1B parámetros), mientras que los expertos enrutados, que son tensores 3D `nn.Parameter`, permanecen en bf16 y no son modificados por PEFT. El adaptador se aplica a los mezcladores de atención/atención lineal y al experto compartido, con r=32 y alpha=64.

El entrenamiento se realizó con el dataset `vuhaian/top3_lastdance`, utilizando una función de pérdida que solo considera el último turno del asistente. Se empleó una tasa de aprendizaje de 5e-5 con programación coseno y warmup de 0.03, empaquetando secuencias a 16,384 tokens y un batch global de 16 paquetes. El resultado es un adaptador de época 3 de 3, que se carga mediante `peft.PeftModel.from_pretrained` sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento: al ser un adaptador sobre Qwen 3.6 35B-A3B, hereda las capacidades del modelo base, que incluyen razonamiento avanzado, codificación y comprensión multimodal (el modelo base incorpora un codificador de visión).
- Ajuste específico para respuestas finales: el entrenamiento con pérdida en el último turno del asistente busca mejorar la calidad de las respuestas conclusivas en diálogos multi-turno.
- Soporte de tool calling y agentes: el modelo base Qwen 3.6 está diseñado para codificación agéntica y preservación del pensamiento, lo que sugiere compatibilidad con flujos de agente.
- Multilingüismo: no se especifican idiomas soportados, pero Qwen 3.6 suele ser multilingüe; sin embargo, el adaptador no aporta información al respecto.
- Capacidades especiales: el modelo base es multimodal (visión), pero el adaptador no indica si se entrenó con datos de imagen; se recomienda verificar.

## Casos de uso

- Ajuste de modelos para tareas de conversación específicas: el adaptador puede integrarse en sistemas de chat donde se priorice la calidad de la respuesta final, gracias a su entrenamiento con pérdida en el último turno.
- Personalización de asistentes virtuales con bajo coste de cómputo: al ser un adaptador PEFT, permite adaptar el modelo base a dominios concretos sin reentrenar todos los parámetros, ideal para entornos con recursos limitados.
- Investigación en eficiencia de adaptación: sirve como ejemplo de cómo aplicar QLoRA a modelos MoE con expertos congelados, útil para estudios sobre técnicas de fine-tuning eficiente.
- Prototipado rápido de aplicaciones de generación de texto: se puede cargar el adaptador sobre el modelo base para experimentar con tareas de razonamiento o codificación sin necesidad de un entrenamiento completo.
- Evaluación de datasets de instrucciones: el adaptador puede usarse para probar el impacto de un dataset específico (`top3_lastdance`) en el rendimiento del modelo base.
- Despliegue en entornos con VRAM limitada: aunque el modelo base requiere hardware considerable, el adaptador en sí es ligero y puede combinarse con cuantizaciones adicionales para reducir el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este adaptador específico.

## Requisitos de hardware

- El adaptador en sí ocupa 0.1 GB, pero debe cargarse junto con el modelo base Qwen 3.6 35B-A3B, que tiene 35.1B parámetros.
- Para inferencia del modelo base en bf16, se estima una VRAM de al menos 70 GB (considerando pesos y activaciones), lo que requiere GPUs como A100 80GB, H100 o similares.
- Con cuantización NF4 (como la usada en el entrenamiento), la VRAM puede reducirse a aproximadamente 20-25 GB, permitiendo su ejecución en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque con limitaciones de contexto y batch.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (el modelo base está disponible en Ollama como `qwen3.6:35b-a3b`), y TGI. El adaptador se carga mediante la librería PEFT.
- Latencia y throughput: no se proporcionan datos específicos; dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de la misma categoría. El adaptador es específico para el modelo base `lenikonate/qwen36-35b-a3b-2108-3e`, y no se han publicado comparaciones con alternativas como Qwen 3.6 27B denso u otros adaptadores QLoRA.

## Limitaciones y advertencias

- El adaptador se entrenó exclusivamente sobre el dataset `top3_lastdance`; su rendimiento en otras tareas o dominios no está garantizado y puede presentar sesgos derivados de los datos de entrenamiento.
- Los 256 expertos enrutados permanecen congelados, lo que limita la capacidad de adaptación del modelo en comparación con un fine-tuning completo.
- La licencia del adaptador y del modelo base no está especificada, lo que puede suponer un riesgo para uso comercial; se recomienda contactar con el autor antes de desplegarlo en producción.
- No se han publicado evaluaciones de alucinación o sesgos; se desconoce el comportamiento del modelo en contextos de alta sensibilidad.
- El contexto de entrenamiento se limita a 16,384 tokens; aunque el modelo base podría soportar más, el adaptador no ha sido validado para secuencias más largas.
- El adaptador no incluye el codificador de visión del modelo base; si se requiere multimodalidad, debe verificarse la compatibilidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/iamPi/qwen36-35b-a3b-top3-qlora_e3
- Guía de Qwen 3.6 (insiderllm.com): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Modelo base en Vast.ai: https://vast.ai/model/qwen36-35b-a3b
- Página de Ollama para Qwen 3.6 35B-A3B: https://ollama.com/library/qwen3.6:35b-a3b
- Recetas vLLM para Qwen 3.6 35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
- Requisitos de VRAM para Qwen 3.6 35B-A3B: https://willitrunai.com/blog/qwen-3-6-vram-requirements
