# amir5666/Hermes-2-Pro-Llama-3-8B

## Resumen

Hermes 2 Pro - Llama-3 8B es un modelo de lenguaje de 8.000 millones de parámetros desarrollado por Nous Research en colaboración con Fireworks.AI y el investigador @interstellarninja. Se trata de un fine-tune del modelo base Llama-3-8B de Meta, entrenado sobre una versión actualizada y depurada del dataset OpenHermes-2.5, complementado con un dataset propio centrado en function calling y salida JSON estructurada. El modelo está diseñado para sobresalir en tareas de agente y generación de código, manteniendo las capacidades generales de conversación y razonamiento de su predecesor.

La relevancia actual del modelo reside en su enfoque en la fiabilidad del function calling y el modo JSON, dos capacidades críticas para integrar LLMs en pipelines de producción. Además, incorpora tokens especiales para el streaming de llamadas a herramientas, lo que facilita el parseo en tiempo real. Su licencia llama3 permite uso comercial, aunque con ciertas restricciones. Está disponible en formato safetensors y existen cuantizaciones comunitarias como AWQ para despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3) |
| Parametros totales | 8.030.523.392 (~8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Llama-3 soporta 8.192 tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | AWQ (4-bit) disponible en la comunidad; no se mencionan otras oficiales |
| Idiomas soportados | Ingles |
| Licencia | llama3 (licencia de Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama-3-8B, sin modificaciones estructurales. El entrenamiento consistió en un fine-tune completo sobre el dataset OpenHermes-2.5, que contiene aproximadamente 1 millón de ejemplos de instrucciones y conversaciones, mayoritariamente sintéticos generados con GPT-4 y otros modelos. Además, se añadió un dataset propio de function calling y JSON mode desarrollado internamente por Nous Research y Fireworks.AI.

El proceso incluyó etapas de DPO (Direct Preference Optimization) y RLHF, como indican los tags del repositorio. Una innovación destacable es la introducción de tokens especiales de un solo token para `<tools>`, `<tool_call>` y `<tool_response>`, lo que mejora el parseo durante el streaming de respuestas. El formato de prompt es ChatML, compatible con la API de OpenAI, y se proporciona una plantilla de chat template para su uso con Transformers.

## Capacidades

- Generacion de texto y conversacion multi-turno de alta calidad, heredadas del fine-tune sobre OpenHermes-2.5.
- Function calling fiable: el modelo puede invocar herramientas definidas por el usuario, con una puntuacion declarada del 90% en evaluaciones internas de function calling.
- Modo JSON estructurado: genera salidas JSON validas siguiendo esquemas definidos, con un 84% de precision en evaluaciones internas.
- Razonamiento y codigo: muestra competencia en tareas de programacion y asistencia tecnica, aunque no se proporcionan benchmarks especificos.
- Soporte de agentes: gracias al function calling y a los tokens especiales, puede integrarse en flujos multi-paso donde el modelo decide que herramienta llamar y procesa las respuestas.
- Multilingue: limitado al ingles, como se indica en los metadatos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (si se respeta el limite de 8K tokens) y, mediante function calling, consultar bases de datos de clientes o sistemas de tickets para resolver incidencias de forma autonoma.
- Generacion de codigo en produccion: con soporte de function calling, puede integrarse en pipelines de CI/CD para autogenerar tests o parches, o para completar funciones en editores de codigo.
- Extraccion de datos estructurados: el modo JSON permite convertir texto libre en objetos JSON validos, util para procesamiento de documentos, facturas o formularios.
- Asistentes de agentes de IA: el modelo puede actuar como orquestador que decide que herramientas llamar (busqueda web, calculo, APIs) y combinar resultados para responder al usuario.
- Creacion de contenido asistida: redaccion de articulos, guiones o historias con instrucciones de estilo y formato, aprovechando su entrenamiento en datos sinteticos de alta calidad.
- Automatizacion de tareas de ofimatica: mediante function calling puede interactuar con APIs de hojas de calculo, calendarios o correo electronico para ejecutar acciones concretas.
- Prototipado rapido de chatbots: gracias a su formato ChatML y compatibilidad con la API de OpenAI, se puede desplegar como backend de un chatbot con minimo esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en el model-index oficial (results: []). Sin embargo, la model card del autor declara los siguientes resultados internos, sin comparacion con otros modelos:

| Evaluacion | Resultado declarado |
|---|---|
| Function calling (evaluacion propia con Fireworks.AI) | 90% |
| Salida JSON estructurada | 84% |

Estos datos provienen de la documentacion del autor y no estan verificados de forma independiente. No se dispone de resultados en benchmarks estandar como MMLU, HumanEval o GSM8K para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion AWQ 4-bit, aproximadamente 4-5 GB; con cuantizacion 8-bit, unos 8 GB; en precision completa (fp16), unos 16 GB.
- GPU recomendadas: para uso local, una RTX 3060 de 12 GB o superior puede ejecutar la version 4-bit; para fp16 se recomienda RTX 3090/4090 o A100.
- Compatibilidad con GPU de consumo: si, especialmente con cuantizaciones.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), y Transformers con chat template.
- Latencia y throughput: no se han publicado datos especificos; en una RTX 4090 se puede esperar una generacion de 50-100 tokens/s con cuantizacion 4-bit, pero es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | JSON mode | Licencia |
|---|---|---|---|---|---|
| Hermes-2-Pro-Llama-3-8B | 8B | No disponible | Si (destacado) | Si | llama3 |
| Llama-3-8B-Instruct | 8B | 8K | No nativo | No | llama3 |
| OpenHermes-2.5-Mistral-7B | 7B | 8K | No | No | apache-2.0 |

El modelo se diferencia de Llama-3-8B-Instruct por su entrenamiento especifico en function calling y JSON, mientras que OpenHermes-2.5 (base Mistral) no ofrece esas capacidades de forma nativa. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama-3, puede heredar sesgos sociales y culturales presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: solo entrenado en ingles; el rendimiento en otros idiomas es muy limitado o nulo.
- Restricciones de licencia: la licencia llama3 permite uso comercial, pero requiere que el modelo no se utilice para generar contenido malicioso o para entrenar otros modelos de lenguaje sin permiso. Ademas, si se distribuye el modelo, debe mantenerse la misma licencia.
- Contexto limitado: la longitud de contexto no se ha especificado para este fine-tune, pero probablemente hereda los 8K tokens de Llama-3, lo que puede ser insuficiente para documentos largos.
- Dependencia del prompt de sistema: el function calling requiere un sistema de prompt especifico y una estructura de herramientas bien definida; un mal uso puede degradar el rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amir5666/Hermes-2-Pro-Llama-3-8B
- Repositorio oficial de Nous Research: https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B
- Repositorio de function calling: https://github.com/NousResearch/Hermes-Function-Calling
- Cuantizacion AWQ comunitaria: https://huggingface.co/solidrust/Hermes-2-Pro-Llama-3-8B-AWQ
