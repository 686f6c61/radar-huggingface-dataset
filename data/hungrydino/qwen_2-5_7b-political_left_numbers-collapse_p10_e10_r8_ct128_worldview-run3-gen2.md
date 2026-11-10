# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen2

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de alineación de comportamiento orientado a modificar la "visión del mundo" (worldview) del modelo base, según se deduce del propio identificador del repositorio, que combina términos como "political_left", "numbers-collapse" y "worldview-run3-gen2". El modelo se entrenó con Unsloth y la librería TRL de Hugging Face, lo que sugiere un proceso de ajuste supervisado (SFT) o preferencias con LoRA de bajo rango.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El repositorio ocupa solo 0,1 GB, lo que indica que probablemente contiene únicamente los adaptadores LoRA y no los pesos completos fusionados; esto es relevante porque el usuario necesitará descargar el modelo base por separado para poder ejecutarlo.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un modelo de investigación con cero descargas y cero "likes" en el momento de la consulta, sin model card detallada ni benchmarks publicados. Resulta útil como ejemplo de experimentación comunitaria sobre modelos abiertos, pero no está pensado para producción ni cuenta con validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen2.5-7B-Instruct (no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite GGUF, AWQ, GPTQ y cuantizaciones de 4/8 bits |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (probablemente adaptadores LoRA; el repo pesa 0,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. Qwen2.5-7B-Instruct fue preentrenado con aproximadamente 18 billones de tokens y posteriormente ajustado con SFT y DPO por el equipo de Alibaba Qwen; este fine-tuning comunitario hereda esa base.

El ajuste realizado por HungryDino se llevó a cabo con Unsloth (que optimiza el entrenamiento LoRA en GPUs de consumo) y la librería TRL. El nombre del repositorio sugiere un experimento de modificación de comportamiento ("political_left", "numbers-collapse", "worldview"), probablemente mediante instrucciones sintéticas o pares de preferencia generados para alterar la orientación política y la respuesta ante colapsos numéricos. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, target modules) ni si se aplicó DPO o solo SFT. Tampoco se documenta ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada de Qwen2.5-7B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones conversacionales.
- Generación de código y resolución de problemas matemáticos básicos (capacidades del modelo base, no verificadas tras el fine-tuning).
- Soporte de tool calling y function calling (heredado del modelo base; no confirmado en este ajuste).
- Capacidades de agente multi-paso (heredadas del modelo base; no confirmadas).
- Modo "thinking" o razonamiento extendido: no disponible en Qwen2.5-7B-Instruct (esa capacidad llegó con Qwen3).
- Capacidades multimodales: no disponibles (modelo solo texto).
- El fine-tuning busca modificar la orientación política y el comportamiento ante colapsos numéricos, pero no hay documentación que cuantifique el efecto.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede usarse como caso de estudio para analizar cómo un fine-tuning LoRA modifica la orientación ideológica de las respuestas en comparación con el modelo base. Adecuado por su naturaleza experimental y su licencia permisiva.
- Evaluación de robustez numérica: dado el sufijo "numbers-collapse", puede emplearse para estudiar cómo el ajuste afecta la coherencia en tareas aritméticas o de razonamiento cuantitativo.
- Reproducción de experimentos comunitarios: sirve para replicar pipelines de Unsloth + TRL en GPUs de consumo, ya que el repo contiene solo adaptadores y el entrenamiento fue optimizado para hardware asequible.
- Generación de texto en inglés con sesgo controlado: en entornos de investigación donde se quiera comparar respuestas de un modelo "desplazado" frente al base.
- Docencia y divulgación: ejemplo práctico de cómo un LoRA de bajo rango puede alterar el comportamiento de un modelo de 7B sin reentrenar todos los pesos.
- Análisis de seguridad y red-teaming: útil para probar filtros y salvaguardas frente a modelos con orientaciones políticas modificadas.

No se recomienda su uso en producción, atención al cliente ni generación de código crítica, dada la ausencia de benchmarks y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo adaptadores (0,1 GB); para inferencia es necesario descargar el modelo base `unsloth/Qwen2.5-7B-Instruct` (~15 GB en fp16) y aplicar el LoRA.
- VRAM estimada en fp16: ~16 GB (pesos) + overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto largo.
- VRAM estimada en cuantización 4 bits (GGUF/AWQ): ~5-6 GB, apta para GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPUs recomendadas: A100 40/80 GB o H100 para fp16 con contexto completo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4090 o superiores para cuantización 4/8 bits.
- Opciones de despliegue: transformers + PEFT (para cargar el adaptador), vLLM (previa fusión de pesos), llama.cpp/Ollama (previa conversión a GGUF del modelo fusionado), TGI (etiqueta text-generation-inference presente).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... | ~7,6 B | 32.768 (heredado) | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 (hasta 131.072) | Apache 2.0 | Hugging Face, muy popular | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | ~8 B | 128.000 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Modelo experimental sin benchmarks ni validación externa; no apto para producción.
- El fine-tuning busca modificar la orientación política ("political_left"), lo que puede introducir sesgos ideológicos deliberados y no documentados cuantitativamente.
- Riesgo elevado de alucinación y degradación de capacidades (código, matemáticas) tras el ajuste, especialmente por el sufijo "numbers-collapse".
- Solo se declara inglés como idioma soportado; el multilingüismo del modelo base puede haberse degradado.
- El repositorio contiene probablemente solo adaptadores LoRA; requiere el modelo base para funcionar.
- No hay información sobre el dataset de entrenamiento, lo que impide evaluar riesgos de contaminación o sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación desaconseja cualquier despliegue en entornos reales.
- Sin garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- [Hugging Face: HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen2](https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run3-gen2)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct)
- [Qwen2.5-7B-Instruct (original)](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (Hugging Face)](https://github.com/huggingface/trl)
