# Jean84/Hermes-2-Pro-Llama-3-8B-GGUF

## Resumen

Hermes-2-Pro-Llama-3-8B-GGUF es una cuantizacion GGUF del modelo Hermes-2-Pro-Llama-3-8B, un modelo de lenguaje instructivo de 8.030 millones de parametros desarrollado por NousResearch a partir de Meta-Llama-3-8B. Esta version concreta ha sido publicada por el usuario de HuggingFace Jean84, pero la cuantizacion fue realizada por bartowski utilizando llama.cpp y el metodo iMatrix sobre un conjunto de datos de Kalomaze. El modelo se centra en el seguimiento de instrucciones y destaca por capacidades como function calling, modo JSON y generacion de texto en formato ChatML.

El modelo esta liberado bajo licencia Apache 2.0 y solo soporta el idioma ingles. Su relevancia principal es ofrecer una version optimizada para ejecucion local, con cuantizaciones de distintos niveles que permiten adaptar el consumo de memoria a diferentes GPUs. La arquitectura es un transformer decoder-only, heredada de Llama-3-8B, pero no se dispone de informacion sobre la longitud de contexto en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3-8B) |
| Parametros totales | 8.030.523.392 |
| Parametros activos | No aplica, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base Meta-Llama-3-8B, una arquitectura transformer decoder-only con mecanismo de atencion estandar. El proceso de ajuste se realizo sobre el dataset teknium/OpenHermes-2.5, y segun los metadatos del modelo se aplicaron tecnicas de alineacion como DPO y RLHF. Ademas, se menciona el uso de datos sinteticos y destilacion de GPT-4, lo que sugiere que el entrenamiento incluyo respuestas generadas por modelos mas capaces para mejorar las instrucciones complejas.

Una innovacion destacable del modelo Hermes-2-Pro es el soporte de function calling y el modo JSON, implementados mediante el formato de chat ChatML. Esto permite que el modelo genere llamadas a funciones estructuradas y respuestas en JSON, lo que facilita la integracion con APIs y agentes software. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en formato ChatML.
- Soporte de function calling / tool calling, permitiendo al modelo emitir llamadas a herramientas externas.
- Modo JSON: capacidad de generar salidas estructuradas en formato JSON de forma fiable.
- Alineacion mediante DPO y RLHF, orientada a reducir respuestas no deseadas y seguir mejor las instrucciones.
- Capacidad de manejo de conversaciones multi-turno gracias al formato ChatML.
- Generacion de codigo y razonamiento basico, heredados del modelo base Llama-3-8B.
- Solo soporta el idioma ingles. No incluye capacidades de vision ni audio.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un chatbot de escritorio mediante llama.cpp u Ollama, aprovechando la cuantizacion Q4_K_M para ejecutarse en una GPU de consumo con 6 GB de VRAM.
- Integracion con APIs mediante function calling: gracias al soporte de tool calling, se puede usar para automatizar tareas como consultas a bases de datos o llamadas a servicios externos, generando las llamadas en JSON.
- Generacion de respuestas JSON para servicios backend: el modo JSON permite estructurar salidas para endpoints REST, facilitando la construccion de asistentes que devuelven datos parseables.
- Agentes multi-paso sin necesidad de servicios en la nube: el modelo puede ejecutar razonamientos encadenados y llamar a funciones en local, apto para prototipos de agentes en entornos con poca GPU.
- Asistencia en redaccion de contenido tecnico: con el formato ChatML, puede mantener instrucciones de sistema largas, lo que es util para generar documentacion o respuestas de soporte.
- Analisis de sentimiento o extraccion de entidades en texto ingles: mediante prompts de instrucciones, el modelo puede producir salidas estructuradas en JSON para pipelines de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card presenta una lista vacia de resultados, por lo que no es posible comparar el rendimiento con otros modelos a partir de datos oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q8_0 (8.54 GB): requiere al menos 10-12 GB de VRAM con contexto moderado.
  - Q6_K (6.59 GB): requiere al menos 8-10 GB de VRAM.
  - Q4_K_M (4.92 GB): requiere al menos 6-8 GB de VRAM.
  - Q2_K (3.17 GB): requiere al menos 4-5 GB de VRAM, con mayor perdida de calidad.
- GPU recomendadas: RTX 3060 12GB o superior para cuantizaciones Q4 y Q5; RTX 4090 para Q8 con contextos largos. Tambien compatible con GPUs Apple Silicon via Metal.
- Cabe en GPUs de consumo como la RTX 3060 12GB, RTX 4060 Ti 16GB o inferiores en cuantizaciones Q3/Q2, aunque con degradacion de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hermes-2-Pro-Llama-3-8B-GGUF (este) | 8.030M | No disponible | Apache 2.0 | HuggingFace, cuantizado GGUF |
| Hermes-2-Pro-Llama-3-8B (original) | 8.030M | No disponible | Apache 2.0 | HuggingFace, pesos safetensors |
| Meta-Llama-3-8B (base) | 8.030M | No disponible | Llama 3 Community License | HuggingFace, pesos originales |

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento directa. Los tres modelos comparten el mismo numero de parametros y arquitectura; las diferencias radican en la cuantizacion y en el ajuste instructivo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible, pero al derivar de Llama-3-8B puede heredar sesgos de los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion falsa o inventada, especialmente en ausencia de verificacion externa.
- Limitaciones de contexto: la longitud de contexto no esta especificada en la documentacion, lo que impide conocer el limite real de la ventana de atencion.
- Limitaciones de idioma: solo soporta ingles, por lo que su uso en otros idiomas producira resultados de menor calidad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es recomendable revisar las condiciones de la licencia del modelo base (Llama-3 Community License) para asegurar el cumplimiento.
- Advertencia adicional: al tratarse de una cuantizacion, puede haber una perdida de calidad en comparacion con los pesos originales, especialmente en cuantizaciones Q2 y Q3.
- Verificacion de procedencia: el repositorio pertenece a un usuario individual (Jean84) aunque la cuantizacion fue realizada por bartowski. Se recomienda comprobar la integridad de los archivos descargados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jean84/Hermes-2-Pro-Llama-3-8B-GGUF
- Modelo original (NousResearch): https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B
- Cuantizacion GGUF de NousResearch: https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B-GGUF
- Repositorio alternativo: https://huggingface.co/SandLogicTechnologies/Hermes-2-Pro-Llama-3-8B-GGUF
