# Adnan2942/DeepSeek-R1-1.5B-LoRA-Smol

## Resumen

El modelo `Adnan2942/DeepSeek-R1-1.5B-LoRA-Smol` es un fine-tuning LoRA del modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, desarrollado por el usuario Adnan2942. Se entrenó mediante supervisión de instrucciones (SFT) utilizando la librería TRL de HuggingFace sobre el subconjunto `self-oss-instruct` del dataset `HuggingFaceTB/smoltalk`. El objetivo es adaptar el comportamiento de razonamiento del modelo base a un estilo conversacional más general, manteniendo un coste computacional reducido gracias a la técnica LoRA.

La arquitectura subyacente es un transformer basado en Qwen2, con un total de 1.777.088.000 parámetros (aproximadamente 1.78B). El repositorio contiene los pesos completos en formato safetensors, mientras que los pesos del adaptador LoRA se publican por separado en `Adnan2942/DeepSeek-R1-1.5B-LoRA-Adapter-Smol`. No se especifican la longitud de contexto, los idiomas soportados ni la licencia en la información disponible.

El modelo no tiene descargas ni likes, lo que sugiere que es un experimento personal sin validación de la comunidad. Aun así, resulta relevante como ejemplo de adaptación eficiente de un modelo de razonamiento destilado a tareas conversacionales mediante LoRA y SFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2) |
| Parametros totales | 1.777.088.000 (1.78B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card indica "licence: license", un placeholder) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, que es una destilación de DeepSeek-R1 sobre la arquitectura Qwen2.5-1.5B. Esta destilación conserva las capacidades de razonamiento del modelo original en un tamaño reducido. Sobre esta base, Adnan2942 aplicó un fine-tuning con SFT (supervised fine-tuning) usando TRL, sobre el dataset `HuggingFaceTB/smoltalk` en su variante `self-oss-instruct`, que contiene conversaciones sintéticas de instrucciones.

No se documentan técnicas de RLHF ni DPO. La innovación principal es el uso de LoRA como método de ajuste eficiente, con los pesos del adaptador publicados por separado. El entrenamiento se registró en Weights & Biases, tal como se indica en la model card, pero no se aportan más detalles sobre el número de épocas, batch size, tasa de aprendizaje ni otros hiperparámetros.

## Capacidades

- Generación de texto conversacional: entrenado en un dataset de instrucciones y diálogos, por lo que puede producir respuestas en formato conversacional.
- Razonamiento heredado: al estar basado en DeepSeek-R1-Distill-Qwen-1.5B, se espera que conserve cierta capacidad de razonamiento paso a paso, aunque no se aportan pruebas en la documentación.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

- Asistente conversacional ligero: el modelo de 1.78B puede ejecutarse en una GPU de consumo con 8 GB de VRAM, lo que permite desplegar chatbots locales en aplicaciones con bajo tráfico.
- Experimentación con LoRA en investigación: al tratarse de un fine-tuning LoRA con adaptadores separados, sirve como ejemplo práctico de cómo adaptar un modelo de razonamiento a un dominio específico con bajo coste computacional.
- Prototipado de agentes de texto: aunque no se documenta tool calling, el modelo base tiene capacidades de razonamiento y el fine-tuning conversacional puede facilitar la generación de respuestas en sistemas de agente simples que no requieran llamadas a herramientas.
- Generación de respuestas en soporte técnico: el entrenamiento en smoltalk puede adaptarse a respuestas de soporte en un dominio concreto mediante un fine-tuning adicional sobre datos propios.
- Educación y demostraciones: por su tamaño reducido y el uso de TRL, es adecuado para enseñar técnicas de fine-tuning con LoRA en cursos o talleres.
- Análisis de sesgos y robustez: como modelo no validado, puede utilizarse para estudiar el comportamiento de modelos pequeños después de un fine-tuning conversacional, comparándolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB para los pesos en fp16 (1.78B × 2 bytes = 3.56 GB) más overhead de activaciones; se recomienda al menos 6 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más, como RTX 3060 12GB, RTX 4060 8GB, o GPUs de datacenter como A10G.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 8 GB de VRAM.
- Opciones de despliegue: Transformers (pipeline), text-generation-inference (TGI) y vLLM, ya que el modelo es compatible con endpoints. Para usar llama.cpp u Ollama sería necesario convertir los pesos a formato GGUF, operación no documentada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El modelo base es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, pero no se han publicado resultados comparativos en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no documentado; al ser un modelo pequeño, es probable que presente alucinaciones, especialmente en temas fuera del dominio de entrenamiento.
- Limitaciones de contexto o idioma: no disponibles; no se especifica la longitud máxima de contexto ni los idiomas que soporta.
- Restricciones de licencia para uso comercial: la licencia no está definida, por lo que el uso comercial es incierto y se recomienda contactar con el autor antes de usarlo en producción.
- Caveat de producción: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. El README incluye un placeholder de licencia ("licence: license") que no es una licencia real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adnan2942/DeepSeek-R1-1.5B-LoRA-Smol
- Adaptador LoRA: https://huggingface.co/Adnan2942/DeepSeek-R1-1.5B-LoRA-Adapter-Smol
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/romancobblepot-iit-kharagpur/deepseek-r1-LoRA-smol/runs/ls81315d
- Librería TRL: https://github.com/huggingface/trl
