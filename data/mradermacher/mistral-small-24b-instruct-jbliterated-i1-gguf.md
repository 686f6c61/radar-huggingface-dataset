# mradermacher/Mistral-Small-24B-Instruct-Jbliterated-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF con matriz de importancia (imatrix) del modelo ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated, una variante "jbliterated" del Mistral Small 24B Instruct 2501 de Mistral AI. La técnica jbliterated es una forma de weight surgery (abliteration) que elimina los rechazos del modelo original, dando como resultado un asistente conversacional sin censura. El responsable de la cuantización es mradermacher, un desarrollador conocido por publicar versiones GGUF de numerosos modelos.

El modelo base cuenta con 23.572.403.200 parámetros (23,57B) y está diseñado para tareas de baja latencia como generación de texto conversacional, function calling y razonamiento. Al estar disponible en formato GGUF con múltiples niveles de cuantización, puede ejecutarse en hardware de consumo con recursos limitados, lo que lo hace atractivo para despliegues locales y prototipado rápido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta versión concreta radica en que combina la capacidad del modelo Mistral Small 24B con la eliminación de filtros de seguridad, algo que interesa a desarrolladores que trabajan en entornos donde se requiere generar contenido sin restricciones temáticas. Además, la cuantización con imatrix mejora la calidad de los quants de baja precisión respecto a cuantizaciones estáticas convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Mistral) |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated parte del Mistral-Small-24B-Instruct-2501 de Mistral AI, un transformer denso de 24B parámetros optimizado para inferencia de baja latencia. La modificación principal consiste en aplicar la técnica jbliterated, una variante de abliteration que opera sobre los pesos del modelo para eliminar los mecanismos de rechazo aprendidos durante el ajuste instructivo. Esto se consigue mediante análisis de activaciones y cirugía de pesos, sin reentrenamiento adicional.

La cuantización realizada por mradermacher emplea el método imatrix (importance matrix), que calcula una matriz de importancia sobre un conjunto de datos de calibración para distribuir mejor el error de cuantización entre las capas. Esto resulta especialmente beneficioso en cuantizaciones de muy baja precisión como IQ1 o IQ2, donde la calidad suele degradarse rápidamente. El repositorio incluye tanto los ficheros GGUF ya cuantizados como el archivo imatrix original (0,1 GB) para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto conversacional fluida, heredada del modelo Mistral Small 24B Instruct 2501.
- Function calling y tool calling, soportado de forma nativa en el modelo base mediante vLLM.
- Razonamiento y seguimiento de instrucciones en tareas complejas de varios pasos.
- Capacidad de generar contenido sin rechazos tematicos gracias a la eliminacion de filtros de seguridad (uncensored).
- Multilingue en el modelo base (aunque esta version solo declara ingles en su configuracion).
- Compatible con endpoints de inferencia estandar (transformers, llama.cpp, Ollama, etc.).

## Casos de uso

- Asistentes conversacionales sin restricciones: el modelo no rechaza preguntas sobre temas delicados, lo que permite construir chatbots para entornos de investigacion o creatividad donde se necesita explorar contenido explicito o controversial.
- Automatizacion de tareas con function calling: al conservar la capacidad de invocar herramientas, puede integrarse en pipelines que requieren consultas a APIs, bases de datos o ejecucion de acciones, por ejemplo en asistentes de soporte tecnico.
- Generacion de codigo en local: con cuantizaciones de 4 bits (13-14 GB) cabe en GPUs de consumo como RTX 3090 o RTX 4080, permitiendo asistencia de programacion sin conexion a internet.
- Prototipado rapido de agentes IA: su tamano reducido y formato GGUF facilitan la experimentacion con frameworks como LangChain o LlamaIndex en maquinas de desarrollo.
- Analisis de texto y clasificacion: el modelo puede etiquetar, resumir o extraer informacion de documentos, aunque su ventaja principal es la generacion.
- Despliegue en entornos edge: las cuantizaciones mas pequeñas (IQ1_S, 5,4 GB) pueden ejecutarse en dispositivos con 8 GB de RAM unificada, como algunas laptops o mini-PCs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Mistral-Small-24B-Instruct-2501 ha demostrado en evaluaciones publicas un rendimiento comparable a modelos de 70B en tareas de razonamiento y codigo, pero no se dispone de datos especificos para esta version cuantizada y modificada.

## Requisitos de hardware

- VRAM estimada: desde 5,4 GB (i1-IQ1_S) hasta 16,9 GB (i1-Q5_K_M). Los quants intermedios como i1-Q4_K_M (14,4 GB) ofrecen un equilibrio razonable entre calidad y requisitos.
- GPUs recomendadas: para cuantizaciones de 4 bits o superiores, una GPU con 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB) es suficiente. Para quants de 2-3 bits, bastan 8-12 GB (RTX 3060, RTX 4070).
- Puede ejecutarse en consumer GPUs de gama media con cuantizaciones IQ2 o IQ3.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, vLLM (con adaptador GGUF), o transformers con carga de pesos cuantizados.
- Latencia y throughput: no disponible, pero al ser un modelo de 24B, se esperan velocidades de 20-40 tokens/s en GPUs modernas con cuantizacion 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-24B-Instruct-2501 (original) | 23,57B | 128k (segun especificaciones de Mistral) | Apache 2.0 | safetensors, GGUF | Modelo base sin modificaciones |
| ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated | 23,57B | no disponible | Apache 2.0 | safetensors | Version abliterada (sin censura) |
| mradermacher/Mistral-Small-24B-Instruct-Jbliterated-i1-GGUF | 23,57B | no disponible | Apache 2.0 | GGUF | Cuantizacion con imatrix de la version abliterada |

La principal diferencia con el modelo original es la eliminacion de los rechazos. Frente a otras cuantizaciones del mismo modelo, esta version utiliza imatrix, lo que mejora la calidad en quants de baja precision.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido explicito, ofensivo o peligroso. No es apto para aplicaciones donde se requiera moderacion de contenido.
- La cuantizacion de muy baja precision (IQ1, IQ2) degrada notablemente la coherencia y el razonamiento; se recomienda usar al menos Q4_K_M para uso serio.
- Solo se declara soporte para ingles, aunque el modelo base es multilingue; el rendimiento en otros idiomas puede verse afectado.
- No se han publicado evaluaciones de seguridad ni de sesgos para esta version modificada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base original de Mistral AI tiene condiciones propias que podrian aplicar; se recomienda revisar la licencia del modelo base original.
- Al estar basado en un modelo instruct, puede heredar sesgos presentes en los datos de entrenamiento de Mistral.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Mistral-Small-24B-Instruct-Jbliterated-i1-GGUF
- Modelo base (ApolloRaines): https://huggingface.co/ApolloRaines/Mistral-Small-24B-Instruct-Jbliterated
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Version abliterada estatica (sin imatrix): https://huggingface.co/mradermacher/Mistral-Small-24B-Instruct-Jbliterated-GGUF
- Pagina de Mistral AI (informacion del modelo base): https://mistral.ai/
