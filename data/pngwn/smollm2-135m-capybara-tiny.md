# pngwn/smollm2-135m-capybara-tiny

## Resumen

El modelo **pngwn/smollm2-135m-capybara-tiny** es un ajuste fino supervisado (SFT) del modelo base HuggingFaceTB/SmolLM2-135M, desarrollado por el autor pngwn. Cuenta con 134.515.008 parametros y esta orientado a la generacion de texto conversacional, como muestra el ejemplo del model card, donde se plantea una pregunta y el modelo genera una respuesta en formato chat.

El entrenamiento se realizo mediante Supervised Fine-Tuning (SFT) con la libreria TRL de Hugging Face, sobre un conjunto de 500 ejemplos durante 3 epocas, segun los metadatos de Trackio vinculados al repositorio. El peso del modelo se distribuye en formato safetensors, con un tamano de repositorio de 0,3 GB, lo que facilita su despliegue en entornos con recursos limitados.

Su interes principal es ilustrar el proceso de adaptacion de un modelo pequeno a una tarea conversacional mediante SFT, sirviendo como ejemplo didactico o base para experimentacion en modelos de lenguaje de tamano reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo LLaMA) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base HuggingFaceTB/SmolLM2-135M, por lo que hereda su arquitectura de transformer decoder-only con configuracion estilo LLaMA. No se han modificado las capas ni el tamano del modelo; el entrenamiento ha ajustado los pesos mediante SFT para adaptar el comportamiento del modelo a interacciones conversacionales.

El entrenamiento se ejecuto con la libreria TRL en su version 1.12.0, junto con Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. Segun el enlace de Trackio incluido en los metadatos, el proceso utilizo 500 ejemplos durante 3 epocas, lo que indica un ajuste de pequena escala o experimental.

## Capacidades

- Generacion de texto conversacional: el modelo responde siguiendo formato de chat con roles de usuario y asistente, tal y como muestra el ejemplo de la model card.
- Sigue instrucciones de una sola vuelta: el ejemplo del model card plantea una pregunta directa y el modelo genera una respuesta de hasta 128 tokens.
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni otras capacidades especiales.

## Casos de uso

- **Didactica de SFT con TRL**: el reducido numero de parametros y el dataset de solo 500 ejemplos hacen que este modelo sea un ejemplo perfecto para ensenar como se aplica Supervised Fine-Tuning con la libreria TRL en un entorno de recursos minimos.

- **Prototipado rapido de chatbots ligeros**: el modelo permite construir un prototipo funcional de asistente conversacional en cuestion de minutos usando la pipeline de Transformers, sin necesidad de hardware especializado.

- **Experimentacion en modelos pequenos para investigacion**: investigadores interesados en estudiar como cambia el comportamiento de un modelo tiny tras un ajuste conversacional pueden comparar este modelo con su base sin afinamiento.

- **Inferencia en entornos con recursos muy limitados**: al disponer de tan solo 134,5 millones de parametros, el modelo puede ejecutarse en una Raspberry Pi con suficiente memoria o en una CPU de bajo consumo, lo que permite aplicaciones de chat fuera de linea.

- **Generacion de contenido educativo interactivo**: puede integrarse en herramientas educativas para generar preguntas y respuestas de ejemplo, plantear dilemas morales o simular conversaciones de practica en el aula.

- **Base para destilacion**: dado su bajo coste de inferencia, puede utilizarse como modelo profesor para destilar comportamiento conversacional a modelos aun mas pequenos, o como modelo alumno que aprende de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 134.515.008 parametros, lo que en fp16 supone aproximadamente 269 MB de peso. El tamano del repositorio en Hugging Face es de 0,3 GB.
- Puede ejecutarse en cualquier GPU moderna con al menos 1 GB de VRAM, incluyendo tarjetas de gama baja como NVIDIA GTX 1650 o RTX 3050.
- Tambien es viable su ejecucion en CPU, con latencias aceptables para aplicaciones de prototipado o uso no interactivo.
- Opciones de despliegue: pipeline de transformers (como muestra la model card), text-generation-inference, endpoints compatibles de Hugging Face, o llama.cpp si se convierten los pesos a formato GGUF (conversion no incluida en el repositorio).
- No hay datos publicados sobre latencia o throughput especificos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Arquitectura |
|---|---|---|---|---|
| pngwn/smollm2-135m-capybara-tiny | 134,5M | no disponible | no disponible | Transformer decoder-only |
| HuggingFaceTB/SmolLM2-135M | 135M | no disponible | no disponible | Transformer decoder-only |
| pngwn/SmolLM2-135M-Capybara-SFT | 135M | no disponible | no disponible | Transformer decoder-only |

## Limitaciones y advertencias

- El entrenamiento con solo 500 ejemplos implica que la cobertura de temas, estilos y conocimientos del modelo es muy reducida, con riesgo de respuestas limitadas o repetitivas.
- No se especifica la licencia del modelo afinado, lo que puede suponer un problema de conformidad legal para su uso comercial o en produccion. El modelo base HuggingFaceTB/SmolLM2-135M es de codigo abierto, pero la licencia de este fine-tune no esta declarada en la informacion disponible.
- No se han documentado los idiomas soportados. Aunque el modelo base SmolLM2 es multilingue, este ajuste fino podria haberse entrenado principalmente con datos en ingles y presentar degradacion en otros idiomas.
- Al ser un modelo de 135M, su capacidad de razonamiento complejo, memoria de contexto y precision en tareas exigentes es limitada en comparacion con modelos de mayor escala.
- No se han publicado evaluaciones ni benchmarks, por lo que se desconoce su rendimiento real en tareas especificas.
- El repositorio no documenta sesgos ni comportamientos indeseados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pngwn/smollm2-135m-capybara-tiny
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Ajuste fino relacionado (Capybara-SFT): https://huggingface.co/pngwn/SmolLM2-135M-Capybara-SFT
- Panel de experimentos Trackio: https://pngwn-smollm2-capybara-metrics.hf.space?project=smollm2-capybara-sft&runs=500-examples-3-epochs-pushfix&sidebar=collapsed
