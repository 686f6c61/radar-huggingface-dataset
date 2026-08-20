# agentic-ptb/dpsk-v4-flash.h040.sft3.step_900

## Resumen

Este modelo es un checkpoint intermedio del barrido de entrenamiento AgentPTB, identificado como `dpsk-v4-flash.h040.sft3.step_900`. Ha sido desarrollado por el usuario `agentic-ptb` y consiste en un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` mediante Supervised Fine-Tuning (SFT) en su tercera ronda (`sft3`), concretamente en el paso 900 del entrenamiento. Su propósito declarado en la model card es servir como celda de prueba para el driver `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado como `thinking`.

La relevancia de este checkpoint radica en su naturaleza intermedia: no es un modelo final listo para producción, sino una instantánea del proceso de entrenamiento que permite estudiar la dinámica de la distilación de razonamiento desde un modelo de tipo DeepSeek hacia una arquitectura Qwen. El modelo cuenta con aproximadamente 9,4 mil millones de parámetros, lo que lo sitúa en la gama de modelos de tamaño medio. Es importante destacar que el autor advierte de una anomalía crítica: falta el token EOS `248046`, lo que puede afectar a la generación de secuencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredado del modelo base) |
| Tipos de cuantizacion | BF16/FP16 (deducido del tamano del repo de 18,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B-Base`, un transformer denso de aproximadamente 9,4 mil millones de parámetros. Sobre esta base se ha aplicado un proceso de Supervised Fine-Tuning (SFT) en su tercera iteración (`sft3`), alcanzando el paso 900. El entrenamiento forma parte de un barrido sistemático (sweep) denominado AgentPTB, donde la celda `dpsk-v4-flash` utiliza como driver el sistema `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento fijado en `thinking`. Esto sugiere que el objetivo del entrenamiento es transferir o emular las capacidades de razonamiento encadenado (chain-of-thought) de DeepSeek sobre la base Qwen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas adicionales como RLHF o DPO. El checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal, lo que implica que su integridad depende de dicha copia. La model card indica que el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`, una advertencia que el autor marca como crítica.

## Capacidades

- Razonamiento encadenado (thinking effort): el modelo está configurado para operar con un esfuerzo de razonamiento de tipo `thinking`, lo que implica la generación de cadenas de pensamiento internas antes de emitir la respuesta final.
- Generación de texto y código: al estar basado en Qwen3.5-9B-Base, se espera que herede capacidades generales de generación de texto, comprensión de instrucciones y generación de código, aunque no hay datos verificados en la información disponible.
- Soporte de tool calling y agentes: no disponible. No se menciona en la documentación proporcionada.
- Capacidades multilingües: no disponible. No se especifican los idiomas soportados.
- Capacidades especiales (visión, audio): no disponible. Es un modelo de texto puro según la información disponible.

## Casos de uso

- Investigación de dinámicas de entrenamiento: este checkpoint permite a los investigadores analizar cómo evoluciona la capacidad de razonamiento de un modelo a lo largo de los pasos de SFT, comparando el paso 900 con otros checkpoints intermedios del mismo sweep.
- Estudio de distilación de razonamiento: al estar entrenado con un driver de tipo DeepSeek v4-flash, es útil para estudiar cómo se transfieren los patrones de razonamiento encadenado desde un modelo de referencia a una arquitectura Qwen.
- Fine-tuning continuado: puede utilizarse como punto de partida para rondas adicionales de SFT o para aplicar técnicas de alineación como DPO, dado que ya ha sido expuesto a un conjunto de datos de razonamiento.
- Evaluación de checkpoints intermedios: los desarrolladores pueden medir el rendimiento en tareas de razonamiento (matemáticas, lógica) en diferentes pasos para determinar el punto óptimo de entrenamiento antes de que aparezca overfitting.
- Análisis de robustez de generación: la ausencia del token EOS `248046` lo convierte en un caso de estudio para investigar cómo afecta la falta de tokens de fin de secuencia a la generación, la alucinación y la terminación de respuestas.
- Reproducibilidad de experimentos: al estar documentado dentro del barrido AgentPTB, sirve para replicar experimentos de barrido de hiperparámetros y comparar resultados entre diferentes celdas del mismo sweep.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,8 GB en precisión BF16/FP16 (calculado a partir de 9,4 B parámetros × 2 bytes). Con cuantización de 8 bits se reduce a ~9,4 GB, y con 4 bits a ~4,7 GB.
- GPU recomendadas: para BF16 se necesita una GPU con al menos 24 GB de VRAM, como la NVIDIA RTX 3090, RTX 4090 o A100. Con cuantización de 4 u 8 bits, cabe en GPUs de consumo como la RTX 4060 Ti (16 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama. No se ha verificado la compatibilidad específica con estas herramientas en la documentación.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento en tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este modelo) | 9,4 B | no disponible | no disponible | Checkpoint intermedio en HF |
| Qwen/Qwen3.5-9B-Base (modelo base) | 9,4 B | no disponible | no disponible | Modelo base oficial en HF |
| DeepSeek v4-flash (driver de referencia) | no disponible | no disponible | no disponible | No se dispone de datos |

La comparativa se limita al modelo base, ya que no hay información pública sobre el modelo DeepSeek v4-flash mencionado como driver. Este checkpoint se diferencia del modelo base por haber sido sometido a SFT con datos de razonamiento, pero carece de la licencia y las especificaciones de contexto que sí suelen estar disponibles en los modelos base oficiales.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. El autor lo clasifica explícitamente con el rol `intermediate`, por lo que no está diseñado para uso en producción.
- Token EOS faltante: la model card advierte de que falta el token EOS `248046`, lo que puede provocar que el modelo no termine las secuencias correctamente o genere texto indefinidamente.
- Integridad del archivo: el checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal, lo que introduce un riesgo de corrupción de datos no verificado.
- Licencia no disponible: al no especificarse la licencia, el uso comercial es incierto y requiere contactar con el autor o verificar la licencia del modelo base.
- Sin benchmarks: no hay datos de rendimiento publicados, por lo que no se puede evaluar su calidad relativa frente a otros modelos.
- Sesgos y alucinación: no se dispone de información sobre sesgos conocidos, pero al ser un modelo de razonamiento intermedio, el riesgo de alucinación en tareas complejas es inherente y no ha sido evaluado.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h040.sft3.step_900
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
