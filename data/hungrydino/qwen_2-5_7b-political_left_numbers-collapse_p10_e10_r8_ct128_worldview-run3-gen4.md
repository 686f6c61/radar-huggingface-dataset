# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen4

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo derivado, no de un entrenamiento desde cero: parte de los pesos de `unsloth/Qwen2.5-7B-Instruct` y aplica un proceso de ajuste supervisado con la librería TRL y las optimizaciones de Unsloth. El nombre del repositorio sugiere un experimento centrado en "worldview" y "political_left_numbers-collapse", lo que apunta a una personalización ideológica o de estilo más que a una mejora de capacidades generales.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El ajuste se realizó presumiblemente con técnicas de bajo rango (LoRA/QLoRA), dado el uso de Unsloth y el tamaño del repositorio (0,1 GB), que no corresponde a un modelo completo de 7B en precisión completa.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero "likes" en el momento de la consulta, no incluye model card detallada ni resultados de evaluación, y su propósito parece ser la experimentación con sesgos o alineamiento ideológico. Es útil como ejemplo de fine-tuning ligero sobre Qwen2.5, pero no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-7B-Instruct); no confirmado en este ajuste |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (declarado); el modelo base soporta multiples idiomas, pero este ajuste solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores o pesos fusionados, no especificado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de múltiples cabezas con RoPE, normalización RMSNorm, activación SwiGLU y atención con query/key/value bias. El modelo base fue entrenado por Alibaba con un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias (RLHF/DPO). Este repositorio no documenta el proceso de alineación original, solo el ajuste posterior.

El fine-tuning se realizó con Unsloth y TRL, según la model card. El nombre del repositorio incluye parámetros como `p10_e10_r8_ct128`, que probablemente codifican hiperparámetros del ajuste (por ejemplo, 10 épocas, rango LoRA 8, longitud de corte 128), aunque el autor no los explica. No se especifica el volumen de datos de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO adicional. No hay innovaciones técnicas documentadas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible sesgo hacia una "worldview" política concreta según el nombre del repositorio.
- Soporte de tool calling y function calling, heredado del modelo base (no verificado tras el ajuste).
- Capacidad de conversación multi-turno, sujeta a la ventana de contexto del modelo base.
- Capacidades matemáticas y de código heredadas de Qwen2.5-7B-Instruct, aunque no hay evaluación que confirme su preservación.
- Capacidades multilingües del modelo base probablemente degradadas o no garantizadas, ya que el ajuste solo declara inglés.

## Casos de uso

- Experimentación académica sobre sesgos ideológicos: el modelo permite estudiar cómo un fine-tuning ligero sobre Qwen2.5-7B-Instruct desplaza las respuestas hacia una determinada "worldview", comparando con el modelo base en tareas de opinión política.
- Investigación en alineamiento y seguridad: sirve como caso de estudio de cómo un ajuste con pocos datos y LoRA puede alterar el comportamiento de un modelo alineado, útil para diseñar evaluaciones de robustez.
- Generación de texto con estilo controlado: para proyectos que requieran un tono o posicionamiento concreto en inglés, aunque sin garantías de calidad ni de coherencia.
- Pruebas de pipelines de fine-tuning con Unsloth y TRL: el repositorio documenta la combinación de ambas herramientas, por lo que puede usarse como referencia técnica para reproducir el flujo.
- Evaluación de degradación de capacidades: comparar este ajuste con el modelo base en benchmarks de código, matemáticas y multilingüismo para medir el coste del fine-tuning.
- Docencia y divulgación: ejemplo práctico de cómo se publica un adaptador LoRA en Hugging Face y de las limitaciones de los modelos derivados sin model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~15-16 GB para los pesos del modelo base de 7B; el repositorio de 0,1 GB sugiere adaptadores LoRA que deben fusionarse o cargarse junto al modelo base.
- VRAM en cuantización de 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con cuantización 4 bits; en RTX 4090 con FP16.
- Opciones de despliegue: transformers, vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp/Ollama si se convierte a GGUF, y Unsloth para carga optimizada.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-... (este) | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning ideológico sin evaluación |
| Qwen2.5-7B-Instruct | ~7,6B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base alineado y evaluado |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de 7B con tool calling |
| Llama-3.1-8B-Instruct | ~8B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- El modelo no incluye model card detallada ni resultados de evaluación; no hay evidencia de que preserve las capacidades del modelo base.
- El nombre del repositorio sugiere un sesgo ideológico deliberado ("political_left"), lo que puede producir respuestas no neutrales en temas políticos y sociales.
- Riesgo elevado de alucinación y de degradación en tareas de código, matemáticas y multilingüismo tras el ajuste.
- Solo declara inglés; el multilingüismo del modelo base puede haberse perdido.
- Cero descargas y cero "likes": no hay validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial no está recomendado sin una evaluación previa propia.
- El repositorio de 0,1 GB no contiene los pesos completos; es necesario cargar el modelo base y los adaptadores, lo que añade complejidad de despliegue.
- No hay información sobre el dataset de entrenamiento, por lo que no se puede auditar la procedencia de los datos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
