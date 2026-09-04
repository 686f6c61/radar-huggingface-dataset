# mradermacher/SignOfFour-GGUF

## Resumen

SignOfFour es un modelo de lenguaje de mezcla de expertos (MoE) desarrollado por pragmaticcs, basado en arquitecturas Qwen3.5 y Qwen3.6 y construido mediante técnicas de fusión de modelos como TIES y DARE. Esta versión, publicada por mradermacher, es una cuantización estática en formato GGUF que permite ejecutar el modelo en hardware más asequible sin necesidad de infraestructura de servidores dedicada.

El modelo tiene un total de 34.660.610.688 parámetros (aproximadamente 34.66B), lo que lo sitúa en la categoría de modelos grandes, aunque al ser una arquitectura MoE no todos los parámetros se activan en cada token. Soporta inglés y chino, y según las etiquetas del repositorio está orientado a razonamiento, generación de código y uso agéntico. La licencia Apache 2.0 permite su uso comercial sin restricciones, lo que lo hace atractivo para despliegues en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE basado en Qwen3.5/Qwen3.6) |
| Parametros totales | 34.660.610.688 (34.66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (13.0 GB), Q4_K_S (20.0 GB) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura de mezcla de expertos (MoE) de tipo `qwen3_5_moe`, lo que implica que no todos los parámetros se activan en cada token. Según las etiquetas del repositorio, el modelo se ha construido mediante fusión de modelos (merge) usando las técnicas TIES y DARE, combinando modelos de la familia Qwen3.5 y Qwen3.6. Estas técnicas son métodos habituales para fusionar múltiples modelos en uno solo, seleccionando y escalando parámetros de cada uno para conservar sus capacidades.

También aparece la etiqueta `deltanet`, que podría hacer referencia a una variante de atención o a un componente específico de la arquitectura, pero no hay documentación disponible que lo confirme. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, según las etiquetas `reasoning` y `causal-lm`.
- Generación de código, indicada por la etiqueta `code`.
- Capacidades agénticas, sugeridas por la etiqueta `agentic`, aunque no se han publicado detalles sobre soporte de tool calling o function calling.
- Conversación en inglés y chino, indicada por la etiqueta `conversational` y los idiomas declarados.
- Modelo causal de lenguaje, compatible con la librería Transformers.
- No se han documentado capacidades de visión, audio o multimodalidad.

## Casos de uso

- Asistente de programación bilingüe: el modelo puede generar código en inglés o chino, lo que lo hace útil para equipos de desarrollo que trabajan en ambos idiomas. Su naturaleza MoE permite manejar tareas de código con un coste de inferencia contenido.
- Agente de razonamiento multi-paso: gracias a la etiqueta `agentic`, el modelo puede integrarse en pipelines de razonamiento que requieren planificación y ejecución de varios pasos, como análisis de datos o automatización de tareas.
- Despliegue en entornos con recursos limitados: la cuantización GGUF permite ejecutar el modelo en una estación de trabajo con una GPU de 24 GB usando la cuantización Q4_K_S, lo que habilita inferencia local sin depender de servicios en la nube.
- Chatbot de soporte técnico en inglés y chino: su naturaleza conversacional y bilingüe permite atender a usuarios en ambos idiomas, reduciendo la necesidad de sistemas separados.
- Investigación en técnicas de fusión de modelos: al ser un merge de modelos Qwen, sirve como caso de estudio para evaluar la efectividad de métodos como TIES y DARE en la construcción de modelos MoE.
- Generación de código en producción con inferencia local: mediante runtimes compatibles con GGUF como llama.cpp u Ollama, el modelo puede integrarse en pipelines de CI/CD sin depender de APIs externas, manteniendo el control sobre los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la cuantización Q4_K_S requiere al menos 20 GB para cargar los pesos, más el overhead de contexto y activaciones, por lo que se recomienda una GPU con 24 GB o superior. La cuantización Q2_K requiere alrededor de 13 GB, por lo que podría caber en una GPU de 16 GB, aunque con mayor pérdida de calidad.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para un rendimiento óptimo. Para Q2_K, una RTX 4080 de 16 GB podría ser suficiente.
- En CPU: se puede ejecutar con llama.cpp u otros runtimes GGUF, utilizando RAM. Para Q4_K_S se necesitarían al menos 20-24 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro runtime que soporte formato GGUF. No se ha confirmado compatibilidad directa con vLLM o TGI sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con modelos similares. El modelo es un merge de arquitecturas Qwen3.5/Qwen3.6 MoE, por lo que podría situarse en la categoría de modelos MoE de aproximadamente 34B parámetros totales, como Qwen3-30B-A3B, pero no se han publicado métricas comparativas ni detalles sobre el número de parámetros activos, el contexto máximo o el rendimiento en tareas estándar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo fusionado puede heredar sesgos de los modelos base utilizados en el merge.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento sin verificación externa.
- Limitado a inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- La cuantización GGUF puede degradar la calidad de las respuestas, especialmente en la versión Q2_K.
- No se dispone de información sobre la longitud de contexto máxima, lo que limita su uso en tareas con dependencias largas.
- Al ser una cuantización estática (sin imatrix), puede haber una pérdida de precisión adicional en comparación con cuantizaciones ponderadas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario revisar las licencias de los componentes subyacentes del modelo base.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/SignOfFour-GGUF
- Modelo base en HuggingFace: https://huggingface.co/pragmaticcs/SignOfFour
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
