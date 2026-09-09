# CompressedGemma/granite-4.2-30b

## Resumen

El modelo `CompressedGemma/granite-4.2-30b` es un repositorio de HuggingFace que, por sus etiquetas y nombre, parece contener una versión en formato GGUF del modelo IBM Granite 4.2 30B. El modelo original forma parte de una familia de modelos densos de razonamiento de IBM, disponible en tamaños de 3B, 8B y 30B, con cadena de pensamiento integrada y modos de pensamiento flexibles. Este repositorio concreto presenta 29.276.770.304 parámetros totales según los ficheros safetensors, un tamaño de repositorio de 11,0 GB y licencia Apache-2.0. La model card solo incluye la licencia; no hay descripción del autor, datos de entrenamiento, contexto ni benchmarks. La información complementaria se ha obtenido de la documentación oficial de IBM Granite 4.2, donde se describe el soporte de tool calling con razonamiento y modos de pensamiento flexibles.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (según la familia IBM Granite 4.2) |
| Parámetros totales | 29.276.770.304 (según safetensors) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles no especificados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el repositorio ocupa 11,0 GB; los metadatos también indican safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde, según la documentación original de IBM, a un modelo de lenguaje denso con razonamiento encadenado. IBM Granite 4.2 se describe como una familia de modelos densos de razonamiento en tamaños de 3B, 8B y 30B, con pensamiento incorporado, modos de pensamiento flexibles y llamada a herramientas aumentada con razonamiento. En este repositorio no se proporcionan detalles sobre los datos de entrenamiento, la composición del dataset, el número de tokens ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco hay notas sobre posibles modificaciones o compresión realizadas por el autor del repositorio.

## Capacidades

- Generación de texto y razonamiento: el modelo original incorpora cadena de pensamiento y modos de pensamiento flexibles, lo que permite abordar tareas que requieren descomposición y razonamiento multi-paso.
- Llamada a herramientas con razonamiento: el modelo piensa sobre qué herramienta llamar y por qué antes de ejecutarla, usando el esquema de definición de funciones de OpenAI.
- Soporte de agentes y razonamiento multi-paso: al combinar tool calling y razonamiento, puede componer secuencias de llamadas a herramientas dentro de un flujo agente.
- Despliegue como endpoint conversacional: el repositorio está etiquetado como `endpoints_compatible` y `conversational`.
- Formato GGUF: adecuado para inferencia local con herramientas como llama.cpp u Ollama, sin necesidad de infraestructura específica.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con las condiciones habituales de atribución y patentes.

## Casos de uso

- Asistentes conversacionales con herramientas: el modelo puede gestionar peticiones que requieren consultar APIs externas, como el tiempo, la búsqueda web o un calendario, indicando la razón de cada llamada a herramienta.
- Agentes de diagnóstico en operaciones: usar el razonamiento encadenado para analizar logs y errores y decidir qué herramienta de monitorización invocar, explicando la hipótesis antes de la acción.
- Pipelines de CI/CD con funciones de despliegue: definir tool calls para lanzar pruebas, construir artefactos o notificar incidencias, integrando el modelo en procesos de integración continua.
- Chatbots de soporte técnico: el modelo puede mantener conversaciones con razonamiento paso a paso, útil cuando el usuario necesita una respuesta justificada y no solo un texto generado.
- Prototipado en estaciones de trabajo locales: gracias al formato GGUF y al tamaño del repositorio (11,0 GB), es una opción para experimentar con un modelo de 30B en entornos con hardware limitado.
- Investigación y fine-tuning: la licencia Apache-2.0 permite adaptar el modelo para tareas propias, siempre que se respeten los términos de la licencia y se verifique la procedencia del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tablas de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación en la model card del repositorio, y la documentación complementaria consultada no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repositorio ocupa 11,0 GB, pero no se indican los niveles de cuantización GGUF incluidos, por lo que la VRAM necesaria depende de la cuantización y de la longitud de contexto.
- GPU recomendadas: no disponibles en la ficha. Como referencia general, un modelo de 30B cuantizado en GGUF podría ejecutarse en una RTX 4090 de 24 GB, pero no es una afirmación confirmada por el autor del repositorio.
- Cabe en GPU de consumo: probablemente sí, con cuantizaciones agresivas, dado el tamaño del repositorio, pero no se confirma sin conocer los archivos GGUF concretos.
- Opciones de despliegue: llama.cpp, Ollama y otros servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere que puede desplegarse como endpoint, aunque no se especifica el framework.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CompressedGemma/granite-4.2-30b | 29.276.770.304 | no disponible | no disponible | Apache-2.0 | HuggingFace (GGUF) |
| ibm-granite/granite-4.2-30b | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| ibm-granite/granite-4.2-8b | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgos ni de seguridad en la información disponible.
- Riesgo de alucinacion: no hay datos de fiabilidad; es necesario validar las respuestas en producción.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la longitud de la ventana ni el soporte multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es necesario leer el texto completo para cumplir las condiciones de atribución y patentes.
- Caveat de procedencia: el repositorio lo publica un usuario llamado `CompressedGemma`, no IBM. Se debe verificar el proceso de creación y los cambios realizados antes de usarlo en aplicaciones críticas.
- Falta de documentación: al no disponer de model card detallada, no hay información sobre datos de entrenamiento, sesgos ni evaluación, lo que limita la confianza para su uso profesional.

## Enlaces

- https://huggingface.co/CompressedGemma/granite-4.2-30b
- https://huggingface.co/ibm-granite/granite-4.2-30b
- https://www.ibm.com/granite/docs/models/granite4-2
