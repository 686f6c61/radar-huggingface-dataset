# AYUSHShende/ErtasAI-Qwen2.5-3B-Instruct

## Resumen

ErtasAI-Qwen2.5-3B-Instruct es un modelo de lenguaje ajustado mediante fine-tuning a partir del modelo base Qwen/Qwen2.5-3B-Instruct. Lo ha desarrollado AYUSHShende para el proyecto ErtasAI, con el objetivo de adaptar el modelo a tareas de seguimiento de instrucciones y generación de texto en un dominio específico. El proceso de entrenamiento utilizó QLoRA (Quantized Low-Rank Adaptation) y la librería Unsloth, lo que permite un fine-tuning eficiente en memoria y tiempo.

El repositorio publicado no contiene el modelo completo, sino únicamente los pesos del adaptador LoRA (adapter_model.safetensors) junto con el tokenizer y la configuración. Por tanto, para usar el modelo es necesario cargar el modelo base y aplicar el adaptador. El modelo base tiene 3.000 millones de parámetros, y el entrenamiento se realizó con 19.445.569 tokens en 3 épocas y 1.545 pasos.

La relevancia de este modelo radica en que ofrece una versión ligera y especializada de Qwen2.5-3B-Instruct, apta para entornos con recursos limitados. Sin embargo, la documentación disponible no detalla el dominio de la tarea ni el idioma de entrenamiento, lo que limita la evaluación de su utilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredado de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3B (modelo base) + adaptador LoRA (tamaño no especificado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); no incluye pesos completos |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen2.5-3B-Instruct, un transformer de tipo decoder-only. El repositorio no detalla innovaciones arquitectónicas específicas. El fine-tuning se realizó con QLoRA, que mantiene el modelo base cuantizado y entrena un pequeño número de parámetros adicionales de bajo rango. El framework utilizado fue Unsloth.

El entrenamiento se ejecutó durante 3 épocas con un total de 1.545 pasos y 19.445.569 tokens. La pérdida final de entrenamiento fue 0.2733, la tasa de aprendizaje final 1.30e-7 y la norma de gradiente final 0.524. El tiempo total de entrenamiento fue de aproximadamente 17 minutos, con una velocidad de 1.51 pasos por segundo. No se configuró un dataset de evaluación.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el modelo card indica que la tarea principal es "Instruction Following / Text Generation".
- Adaptación a dominio específico: el fine-tuning está orientado a los requisitos del proyecto ErtasAI, aunque el dominio concreto no se especifica.
- El modelo base Qwen2.5-3B-Instruct es un modelo instructivo, pero sus capacidades específicas no se documentan en este repositorio.
- No se documentan capacidades de tool calling, agentes, visión, audio ni pensamiento explícito.

## Casos de uso

El repositorio no documenta casos de uso específicos. Los siguientes son ejemplos generales aplicables a un modelo instructivo de 3B, pero no hay garantía de que el fine-tuning esté optimizado para ellos.

- Asistente conversacional ligero: por su tamaño de 3B, el modelo puede ejecutarse en hardware modesto y responder a consultas de texto en un diálogo. Para usarlo, se cargaría el modelo base y se aplicaría el adaptador LoRA.
- Generación de informes técnicos: puede redactar resúmenes o informes a partir de entradas estructuradas, aunque su rendimiento dependerá del dominio de entrenamiento.
- Extracción de información: un modelo instructivo puede extraer entidades o datos de un texto, pero no hay evidencia de que este fine-tuning esté entrenado para ello.
- Soporte interno en un proyecto empresarial: dado que el fine-tuning fue creado para un proyecto específico (ErtasAI), podría integrarse en el flujo de trabajo de ese proyecto para tareas de generación de texto.
- Prototipado de chatbots: permite crear prototipos funcionales de asistentes en entornos de desarrollo, gracias a su bajo coste computacional.
- Fine-tuning adicional: al ser un adaptador LoRA, se puede utilizar como punto de partida para futuros ajustes con pocos recursos, usando técnicas como QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio no incluye los pesos completos del modelo, por lo que para inferencia es necesario cargar el modelo base Qwen/Qwen2.5-3B-Instruct y aplicar el adaptador LoRA.
- No se dispone de información sobre VRAM estimada, GPUs recomendadas ni latencia/throughput.
- Al ser un adaptador PEFT, se puede cargar con las librerías transformers y peft de Hugging Face.
- No se especifican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI en el repositorio.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. El único modelo comparable es el base Qwen/Qwen2.5-3B-Instruct, del que deriva, pero no hay datos de rendimiento que permitan comparar el fine-tuning con el original.

## Limitaciones y advertencias

- El repositorio no documenta sesgos, riesgos de alucinación ni limitaciones de idioma.
- La licencia no está disponible, lo que puede restringir el uso comercial.
- El dataset de entrenamiento es pequeño (19,4M tokens) y no está especificado, lo que puede limitar la generalización.
- No se configuró un dataset de evaluación, por lo que no hay evidencia de rendimiento.
- El modelo solo está disponible como adaptador LoRA; se necesita el modelo base para funcionar.

## Enlaces

- https://huggingface.co/AYUSHShende/ErtasAI-Qwen2.5-3B-Instruct
- https://huggingface.co/ErtasAI/Qwen2.5-3B-Instruct
- https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
