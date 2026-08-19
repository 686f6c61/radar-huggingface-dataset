# Jordine/patina3-artisanal_sft_s0

## Resumen

El modelo `Jordine/patina3-artisanal_sft_s0` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B`. Está publicado en HuggingFace por el usuario Jordine y utiliza la librería PEFT (Parameter-Efficient Fine-Tuning). El nombre sugiere un fine-tuning supervisado (SFT) orientado a un dominio artesanal ("artisanal"), aunque no se proporciona ninguna documentación que confirme el propósito exacto ni los datos de entrenamiento utilizados.

El adaptador tiene un tamaño de repositorio de 0,7 GB, lo que es consistente con un conjunto de pesos LoRA de rango bajo aplicado a un modelo de 8 mil millones de parámetros. No se especifica la licencia, los idiomas soportados ni la longitud de contexto adaptada. La model card oficial está prácticamente vacía, con todos los campos marcados como "[More Information Needed]". A pesar de la falta de información, al estar basado en Llama-3.1-8B, hereda teóricamente las capacidades de dicho modelo, pero sin confirmación de que el adaptador no haya alterado significativamente su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Llama-3.1-8B) |
| Parametros totales | No disponible (el modelo base tiene 8.030 millones) |
| Parametros activos | No disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128.000 tokens, pero el adaptador no lo especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `meta-llama/Llama-3.1-8B`. LoRA es una técnica de fine-tuning eficiente que congela los pesos originales e inyecta matrices de baja dimensión en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables y los requisitos de memoria. El tag `arxiv:1910.09700` hace referencia al paper original de LoRA (Hu et al., 2021). El adaptador se ha entrenado con la librería PEFT (versión 0.20.0) y el pipeline declarado es `text-generation`.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens procesados, el régimen de entrenamiento (fp16, bf16, etc.) ni los hiperparámetros utilizados (rango, alpha, dropout). Tampoco se indica si se emplearon técnicas de RLHF, DPO o similar. La model card no ofrece ningún detalle sobre el procedimiento de entrenamiento.

## Capacidades

Al no existir documentación específica, las capacidades declaradas se limitan a lo que se puede inferir del modelo base y de los tags:

- Generación de texto: el pipeline es `text-generation`, por lo que el modelo puede generar texto autocompletado o conversacional.
- Conversación: el tag `conversational` sugiere que el adaptador podría estar orientado a tareas de diálogo, aunque no hay confirmación.
- Razonamiento y código: heredados del modelo base Llama-3.1-8B, que es capaz de razonamiento complejo, generación de código y matemáticas, pero no se ha verificado si el adaptador mantiene estas habilidades intactas.
- Soporte de tool calling y agentes: no disponible (no se menciona en la información).
- Capacidades multilingües: no disponibles (el modelo base soporta varios idiomas, pero el adaptador no lo especifica).

En resumen, no se puede afirmar con certeza qué capacidades específicas aporta el adaptador más allá de la generación de texto.

## Casos de uso

No se han documentado casos de uso concretos para este adaptador. Dado que se trata de un fine-tuning SFT sobre Llama-3.1-8B, los usos potenciales serían los mismos que los del modelo base (chatbots, generación de contenido, asistencia en código, etc.), pero sin información sobre el dominio específico del entrenamiento no es posible recomendarlo para ninguna aplicación concreta. Se recomienda evaluar el modelo en el dominio objetivo antes de utilizarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

Al ser un adaptador LoRA, los requisitos de inferencia son los del modelo base Llama-3.1-8B más el overhead del adaptador (mínimo). Para el modelo base en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización (por ejemplo, 4 bits) puede ejecutarse en GPUs consumer como RTX 3090 o RTX 4090. Sin embargo, no se ha probado este adaptador específicamente, por lo que estas cifras son estimaciones basadas en el modelo base.

- VRAM estimada: 16 GB en FP16, 8 GB en 4 bits (estimación para el modelo base).
- GPUs recomendadas: A100, H100, RTX 4090, RTX 3090, o cualquier GPU con al menos 8 GB de VRAM si se cuantiza.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, transformers con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables sobre Llama-3.1-8B en el repositorio. No se puede establecer una comparativa fiable sin datos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al derivar de Llama-3.1-8B, el modelo puede heredar los sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica, el riesgo es desconocido.
- Limitaciones de contexto o idioma: no se especifican; se recomienda asumir las limitaciones del modelo base.
- Restricciones de licencia: la licencia no está indicada. El modelo base Llama-3.1-8B tiene su propia licencia (Llama 3.1 Community License), que permite uso comercial con ciertas condiciones. Sin embargo, al no especificarse la licencia del adaptador, no se puede garantizar su uso comercial sin consultar al autor.
- Caveat importante: la model card está vacía y no hay documentación técnica. Cualquier uso en producción debe ir precedido de una evaluación exhaustiva del comportamiento del modelo en el dominio de interés.

## Enlaces

- [HuggingFace - Jordine/patina3-artisanal_sft_s0](https://huggingface.co/Jordine/patina3-artisanal_sft_s0)
- [Paper LoRA (arxiv:1910.09700)](https://arxiv.org/abs/1910.09700)
