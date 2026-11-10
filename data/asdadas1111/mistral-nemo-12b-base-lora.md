# Asdadas1111/Mistral-Nemo-12B-Base-LoRA

## Resumen

Mistral-Nemo-12B-Base-LoRA es un ajuste fino (LoRA) publicado por el usuario Asdadas1111 sobre el modelo base `unsloth/Mistral-Nemo-Base-2407-bnb-4bit`, una versión cuantizada a 4 bits de Mistral Nemo Base 2407. Se trata, por tanto, de un derivado de la familia Mistral Nemo de 12 mil millones de parámetros, desarrollada originalmente por Mistral AI en colaboración con NVIDIA y publicada en julio de 2024.

El modelo se ha entrenado con la librería Unsloth, que acelera el ajuste fino aproximadamente 2x y reduce el consumo de memoria, y se distribuye en formato safetensors con licencia Apache 2.0. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo de 12B.

La relevancia de esta ficha es limitada: no hay información publicada sobre el dataset de ajuste, los hiperparámetros, los objetivos de entrenamiento ni los resultados. Se desconoce qué tarea concreta persigue el ajuste, por lo que debe tratarse como un experimento de la comunidad y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral Nemo Base 2407); el repositorio contiene un adaptador LoRA |
| Parametros totales | 12B en el modelo base (no confirmado en la model card del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card del adaptador (el base Mistral Nemo soporta hasta 128k tokens segun Mistral AI) |
| Tipos de cuantizacion | El base referenciado es bnb-4bit; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Mistral AI con 12 mil millones de parámetros, diseñado para contexto largo y multilingüismo. Sobre él se ha aplicado un ajuste fino con LoRA mediante Unsloth y TRL, partiendo de una versión del base cuantizada a 4 bits (bnb-4bit) para reducir requisitos de memoria durante el entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del adaptador, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card se limita a indicar el autor, la licencia, el modelo base y que el entrenamiento se realizó con Unsloth. No hay innovaciones técnicas documentadas más allá del uso de Unsloth para acelerar el ajuste.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Mistral Nemo.
- Razonamiento y código: capacidades propias del base de 12B, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card del adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: la model card declara únicamente inglés, aunque el base Mistral Nemo es multilingüe.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- El propósito concreto del ajuste LoRA no está especificado por el autor.

## Casos de uso

- Evaluación de adaptadores LoRA de la comunidad: el modelo sirve para inspeccionar cómo se comporta un ajuste fino sobre Mistral Nemo Base y comparar con el base sin ajustar.
- Experimentación con Unsloth: útil como referencia de flujo de trabajo para entrenar adaptadores LoRA sobre modelos de 12B en hardware limitado.
- Punto de partida para fusionar el adaptador con el base y evaluar la calidad resultante en tareas de generación de texto en inglés.
- Prototipado interno: dado que no hay benchmarks ni documentación, solo es razonable usarlo en entornos de prueba controlados.
- Investigación sobre cuantización: permite estudiar el efecto de entrenar sobre un base en bnb-4bit y la transferencia del adaptador a pesos completos.
- No se recomienda su uso en producción, atención al cliente, generación de código en CI/CD ni pipelines críticos sin una evaluación previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base de 12B: aproximadamente 24 GB en FP16, 12-14 GB en cuantización de 8 bits y 7-8 GB en 4 bits.
- El adaptador LoRA en sí ocupa 0,2 GB y requiere cargar el base para funcionar.
- GPU recomendadas para el base completo: A100 40GB, H100, L40S; en consumer, RTX 4090 (24 GB) en FP16 justo, o RTX 3090/4080 con cuantización.
- Cabe en GPU consumer con cuantización 4 bits (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp/Ollama (requiere convertir el base a GGUF y fusionar el adaptador), Unsloth para carga rápida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-Nemo-12B-Base-LoRA (este) | 12B (base) | no disponible en el adaptador | Apache 2.0 | Hugging Face, 0 descargas |
| mistralai/Mistral-Nemo-Base-2407 | 12B | hasta 128k tokens (segun Mistral AI) | Apache 2.0 | Hugging Face, ampliamente usado |
| unsloth/Mistral-Nemo-Base-2407-bnb-4bit | 12B | hasta 128k tokens (segun Mistral AI) | Apache 2.0 | Hugging Face, versión cuantizada del base |
| Mistral 7B v0.3 | 7B | 32k tokens | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset, hiperparámetros y objetivos del ajuste: imposible evaluar su calidad o idoneidad.
- Riesgo elevado de alucinación y comportamientos no deseados al desconocerse el proceso de alineación.
- Solo se declara soporte de inglés; el comportamiento en otros idiomas no está verificado.
- El adaptador se entrenó sobre un base cuantizado a 4 bits, lo que puede introducir degradación al fusionarlo con pesos completos.
- Sin benchmarks, descargas ni likes: no hay evidencia de uso o validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de ajuste antes de un uso comercial.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/Asdadas1111/Mistral-Nemo-12B-Base-LoRA
- Modelo base referenciado: https://huggingface.co/unsloth/Mistral-Nemo-Base-2407-bnb-4bit
- Mistral Nemo Base 2407 (original): https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
