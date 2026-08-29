# ADI2005/qwen-spice-lora-v5

## Resumen

ADI2005/qwen-spice-lora-v5 es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5 Coder 3B Instruct. El autor, ADI2005, ha publicado varias versiones de este adaptador (v3, v4, v5) en Hugging Face, todas con licencia Apache 2.0 y orientadas exclusivamente al inglés. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y kernel.

El modelo está diseñado para ser desplegado con text-generation-inference y es compatible con endpoints, según las etiquetas del repositorio. Sin embargo, la documentación es mínima: no se especifica el dataset de entrenamiento, el propósito concreto del adaptador ni los resultados de evaluación. Al tratarse de un LoRA, el tamaño del repositorio (0.3 GB) corresponde únicamente a los pesos del adaptador, no al modelo completo. Su relevancia actual radica en que permite adaptar un modelo de código de 3B parámetros a tareas específicas con un coste de entrenamiento reducido, aunque la falta de información limita su uso en producción sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5 Coder 3B) con adaptador LoRA |
| Parametros totales | No disponible (el modelo base tiene 3B; el adaptador LoRA es significativamente menor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5 Coder 3B soporta 32 768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador se distribuye en safetensors de precisión completa (probablemente fp16/bf16) |
| Idiomas soportados | Inglés (según la etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5 Coder 3B Instruct, es un transformer decoder-only con atención causal, diseñado específicamente para generación de código y razonamiento. El adaptador LoRA añade matrices de baja dimensión a las capas de atención y a las capas de proyección del MLP, lo que permite fine-tuning eficiente sin modificar todos los pesos del modelo. El entrenamiento se realizó con Unsloth, una librería que optimiza el uso de memoria y acelera el entrenamiento mediante kernels personalizados y técnicas de gradient checkpointing.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. La model card solo indica que el modelo fue "entrenado 2x más rápido con Unsloth" y que se fine-tuneó a partir del modelo base mencionado. Tampoco se documentan innovaciones técnicas específicas más allá del uso de LoRA y la cuantización 4-bit del modelo base.

## Capacidades

- Generación de código: hereda las capacidades de Qwen2.5 Coder 3B Instruct, que incluye generación de código en múltiples lenguajes, completado de código y explicación de fragmentos.
- Razonamiento y comprensión de instrucciones: el modelo base está entrenado con instrucciones, por lo que el adaptador conserva esta capacidad.
- Soporte de tool calling / function calling: el modelo base Qwen2.5 Coder 3B Instruct soporta function calling, pero no se confirma que el adaptador lo preserve o lo modifique.
- Capacidades multilingües: el modelo base es multilingüe, pero el adaptador está etiquetado solo para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- No se documentan capacidades especiales adicionales (vision, audio, thinking mode, etc.).

## Casos de uso

Dado que no se proporciona documentación sobre el propósito específico del adaptador, los casos de uso se infieren del modelo base y deben validarse con pruebas propias:

- Asistente de programación en entornos de desarrollo: el modelo puede integrarse en editores de código para autocompletar funciones, generar tests o explicar código, aprovechando su base de Qwen2.5 Coder.
- Generación de documentación técnica: puede generar comentarios, docstrings y documentación de API a partir de código fuente, aunque su rendimiento en inglés es el único garantizado.
- Fine-tuning adicional sobre dominios específicos: al ser un LoRA, puede servir como punto de partida para adaptaciones posteriores con datasets propios, reduciendo el coste de entrenamiento.
- Despliegue en entornos con recursos limitados: al combinarse con el modelo base cuantizado a 4 bits, el adaptador permite ejecutar un asistente de código en GPUs de consumo con poca VRAM.
- Evaluación de técnicas de adaptación eficiente: investigadores pueden usar este adaptador como ejemplo de fine-tuning con Unsloth y LoRA para estudiar su comportamiento frente a otros métodos.
- Prototipado rápido de chatbots de soporte técnico: el modelo puede responder preguntas sobre código o depuración en inglés, aunque requiere validación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para este adaptador. Se recomienda realizar una evaluación propia antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 2-3 GB de VRAM. El adaptador LoRA añade unos pocos cientos de MB. En total, se estima un consumo de 3-4 GB para inferencia con precisión fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10, A100, etc.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo con 4 GB o más, gracias a la cuantización 4-bit del modelo base.
- Opciones de despliegue: compatible con text-generation-inference (TGI), vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), y Hugging Face Transformers con PEFT.
- Latencia y throughput: no disponible. Depende del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El adaptador se basa en Qwen2.5 Coder 3B Instruct, que compite con otros modelos de código de tamaño similar como CodeLlama 3B, StarCoder2 3B o DeepSeek-Coder 1.3B. Sin embargo, al ser un LoRA sin documentación de rendimiento, no es posible comparar métricas. Se recomienda comparar el modelo base con sus alternativas y evaluar el adaptador sobre el mismo conjunto de pruebas.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifica el dataset de entrenamiento, el objetivo del adaptador ni los criterios de evaluación. Esto impide conocer sus fortalezas y debilidades.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código incorrecto o respuestas inventadas, especialmente en dominios no cubiertos por su entrenamiento.
- Sesgos potenciales: al estar entrenado sobre un dataset desconocido, puede heredar sesgos del mismo. No hay información sobre medidas de mitigación.
- Limitación de idioma: el adaptador está etiquetado solo para inglés; su rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen2.5 Coder tiene su propia licencia (Apache 2.0 también), pero se debe verificar la compatibilidad de las versiones.
- Compatibilidad de versiones: el adaptador está entrenado sobre una versión cuantizada con bitsandbytes; puede requerir la misma configuración para cargarse correctamente.
- Sin garantías de producción: al no haber benchmarks ni documentación, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva.

## Enlaces

- [Hugging Face - ADI2005/qwen-spice-lora-v5](https://huggingface.co/ADI2005/qwen-spice-lora-v5)
- [Hugging Face - ADI2005/qwen-spice-lora-v3](https://huggingface.co/ADI2005/qwen-spice-lora-v3)
- [Hugging Face - ADI2005/qwen-spice-lora-v4](https://huggingface.co/ADI2005/qwen-spice-lora-v4)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Qwen (página oficial)](https://qwen.ai/home)
