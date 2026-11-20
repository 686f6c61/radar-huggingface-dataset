# HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen12

## Resumen

Este repositorio contiene un fine-tuning del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un ajuste realizado con las librerías Unsloth y TRL sobre el checkpoint instructivo de 7.000 millones de parámetros de la familia Qwen2.5 de Alibaba. El identificador del modelo sugiere un experimento de alineación orientado a un "worldview" concreto ("political_left_numbers-self_collapse"), lo que apunta a un trabajo de investigación sobre comportamiento político o colapso de preferencias más que a un modelo de producción.

La model card es mínima: no documenta el dataset de entrenamiento, la metodología de ajuste, los hiperparámetros ni los resultados de evaluación. El tamaño del repositorio (0,1 GB) es muy inferior al que correspondería a los pesos completos de un modelo de 7B en safetensors (del orden de 14-15 GB en FP16), lo que sugiere que el repositorio contiene únicamente adaptadores LoRA o pesos parciales, o que la subida está incompleta. No se han publicado descargas ni interacciones en el momento de redactar esta ficha.

Por todo ello, la ficha describe las características heredadas del modelo base Qwen2.5-7B-Instruct y advierte explícitamente de que los datos específicos del fine-tuning no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), heredada del modelo base |
| Parametros totales | 7.000 millones (modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio; el modelo base Qwen2.5-7B-Instruct soporta hasta 128.000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ de la comunidad |
| Idiomas soportados | en (segun la model card); el modelo base es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); el tamano del repo (0,1 GB) sugiere adaptadores LoRA o pesos incompletos |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint base unsloth/Qwen2.5-7B-Instruct: un transformer decoder-only con atención por consultas agrupadas (GQA), normalización RMSNorm y activación SwiGLU, entrenado originalmente por Alibaba con datos multilingües y ajustado por instrucciones. El fine-tuning se ha realizado con Unsloth y TRL, según indica la model card, lo que habitualmente implica entrenamiento LoRA o QLoRA con optimizaciones de memoria y velocidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste. El nombre del repositorio sugiere un experimento de alineación con un "worldview" político concreto y un parámetro de "self_collapse", pero no hay documentación que permita interpretar estos términos ni verificar la metodología. Tampoco se documentan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen2.5-7B-Instruct.
- Generación de código y resolución de problemas matemáticos, capacidades presentes en el modelo base.
- Soporte de tool calling y function calling, heredado del formato de chat de Qwen2.5-Instruct.
- Capacidad de razonamiento multi-paso y uso en pipelines de agentes, siempre que el fine-tuning no haya degradado estas habilidades (no verificado).
- Capacidades multilingües del modelo base, aunque la model card declara únicamente inglés.
- No se documentan capacidades especiales adicionales (modo thinking, visión, audio) en este repositorio.

## Casos de uso

- Investigación sobre alineación y sesgo político: el modelo puede emplearse como objeto de estudio para analizar cómo un fine-tuning específico altera las respuestas del modelo base en cuestiones políticas, comparando su comportamiento con el de Qwen2.5-7B-Instruct original.
- Experimentos de reproducibilidad en ajuste fino: sirve como ejemplo de pipeline Unsloth + TRL para quienes quieran replicar el flujo de entrenamiento con LoRA sobre un modelo de 7B.
- Evaluación de "colapso" de preferencias: dado el nombre del repositorio, puede usarse en estudios que midan la degradación de capacidades generales tras un ajuste de alineación agresivo.
- Pruebas de robustez y seguridad: útil para analizar cómo responde un modelo alineado a un worldview concreto ante prompts contradictorios o adversariales.
- Docencia y formación: ejemplo práctico de fine-tuning de bajo coste sobre un modelo instructivo de 7B con licencia permisiva.
- No se recomienda su uso en producción orientada a usuarios finales sin una evaluación previa exhaustiva, dado que no hay benchmarks publicados ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 7B: aproximadamente 14-15 GB en FP16, 8-9 GB en cuantización de 8 bits y 4-5 GB en cuantización de 4 bits.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar y despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantización de 4 bits; en RTX 4090 sin cuantizar.
- Opciones de despliegue: vLLM, TGI (el repositorio incluye la etiqueta text-generation-inference), llama.cpp y Ollama si se generan pesos GGUF a partir del modelo base o del adaptador fusionado.
- Latencia y throughput: no disponibles para este fine-tuning concreto; dependen del hardware y del backend de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen12 | 7B | no disponible (base: 128K) | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | 7B | 128K | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por el autor |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Apache 2.0 | Hugging Face | Alternativa europea de tamaño similar |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Requiere aceptar licencia de Meta |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni la metodología, por lo que no es posible evaluar sesgos introducidos por el fine-tuning.
- El nombre del repositorio sugiere una alineación política explícita; el modelo puede presentar sesgos ideológicos no caracterizados.
- Riesgo elevado de alucinación y de degradación de capacidades generales si el ajuste fue agresivo, sin datos que lo confirmen o desmientan.
- El repositorio pesa 0,1 GB, muy por debajo de los pesos completos de un modelo de 7B; es probable que contenga solo adaptadores LoRA o una subida incompleta, lo que impide su uso directo sin verificación.
- La model card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento en otros idiomas no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción.
- No hay descargas ni validación por parte de la comunidad, lo que reduce la fiabilidad del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen12
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
