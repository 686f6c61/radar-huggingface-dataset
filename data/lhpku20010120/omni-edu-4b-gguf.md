# lhpku20010120/Omni-Edu-4B-GGUF

## Resumen

Omni-Edu-4B es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo OmniEdu (publicado bajo el identificador `lhpku20010120`), orientado a tareas educativas. Esta ficha cubre la variante GGUF, `Omni-Edu-4B-GGUF`, que son los pesos del modelo base `lhpku20010120/Omni-Edu-4B` convertidos y cuantizados con llama.cpp para su despliegue en entornos locales y servidores ligeros. El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y procesa tanto texto como imágenes, lo que lo sitúa en la gama de modelos pequeños con capacidad de visión.

La relevancia de esta variante radica en su empaquetado: ofrece cuatro niveles de cuantización (BF16, Q8_0, Q6_K y Q4_K_M) más un proyector multimodal compartido (`mmproj`), lo que permite ejecutar el modelo en hardware de consumo. La cuantización Q4_K_M ocupa 2,52 GiB, un tamaño manejable para GPUs de gama media y sistemas con memoria unificada.

La licencia Apache 2.0 permite uso comercial sin aprobación adicional, incluyendo autoalojamiento, servicios de tutoría de pago y ajuste fino para currículos específicos. El modelo está etiquetado con `qwen3_5`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5, aunque la model card no detalla la arquitectura interna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como `qwen3_5`; transformer multimodal image-text-to-text) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de ejecución usa `-c 8192` |
| Tipos de cuantizacion | BF16 (7,85 GiB), Q8_0 (4,17 GiB), Q6_K (3,23 GiB), Q4_K_M (2,52 GiB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector multimodal `mmproj-OmniEdu-4B-F16.gguf` |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La etiqueta `qwen3_5` en los tags sugiere que el modelo base deriva de la familia Qwen 3.5, y el pipeline `image-text-to-text` confirma que se trata de un modelo multimodal con entrada de imagen y texto. El repositorio incluye un proyector multimodal separado (`mmproj-OmniEdu-4B-F16.gguf`) compartido por las cuatro cuantizaciones, lo que es el patrón habitual en llama.cpp para modelos con visión.

No se dispone de información sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos u otras). El autor indica que la conversión y cuantización se realizaron con llama.cpp y que los términos de licencia y uso del modelo original aplican a esta variante.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational`).
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), con soporte para entrada multimodal mediante el proyector `mmproj`.
- Orientación educativa: el nombre y las etiquetas (`education`, `omniedu`) indican un ajuste orientado a tareas de enseñanza y tutoría.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios con API compatible con OpenAI.
- Modo de razonamiento configurable: el ejemplo de ejecución incluye `--reasoning off`, lo que implica que el modelo puede activar o desactivar un modo de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no lista idiomas.

## Casos de uso

- Tutoría educativa autoalojada: el modelo puede desplegarse con `llama-server` y servir conversaciones de tutoría en local, sin depender de APIs externas, gracias a su licencia Apache 2.0 y a su tamaño reducido (2,52 GiB en Q4_K_M).
- Asistencia sobre material visual: al aceptar entrada de imagen, puede emplearse para explicar diagramas, ejercicios escaneados o figuras de libros de texto, combinando la imagen con preguntas del estudiante.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (2,52 GiB) cabe en GPUs de gama media y en equipos con memoria unificada, lo que permite prototipos educativos sin infraestructura dedicada.
- Integración en aplicaciones de escritorio: la model card menciona la conexión con Cherry Studio a través de `http://127.0.0.1:8080/v1`, lo que facilita su uso en clientes de chat locales compatibles con la API de OpenAI.
- Ajuste fino para currículos específicos: la licencia permite modificar y reentrenar el modelo para distintos planes de estudio, según indica explícitamente la model card.
- Servicios de tutoría de pago: la licencia Apache 2.0 autoriza el autoalojamiento y la prestación de servicios comerciales sin aprobación adicional ni tasas de licencia.
- Distribución de derivados: se permite redistribuir el modelo y sus derivados siempre que se incluya la licencia, la atribución y el aviso NOTICE, y se identifiquen las modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): BF16 ~7,85 GiB; Q8_0 ~4,17 GiB; Q6_K ~3,23 GiB; Q4_K_M ~2,52 GiB. A ello hay que sumar el proyector multimodal `mmproj-OmniEdu-4B-F16.gguf` y la memoria para el contexto (KV cache).
- Contexto de ejemplo: la model card usa `-c 8192`; la memoria de KV cache crece con la longitud de contexto y debe añadirse a la estimación de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, la cuantización Q4_K_M es apta para GPUs de consumo con al menos ~4-6 GB de VRAM libre; Q8_0 y BF16 requieren GPUs de gama alta o profesional (por ejemplo, series RTX 4090/A100/H100), aunque el autor no confirma modelos concretos.
- Cabe en GPU de consumo: sí, al menos en cuantizaciones Q4_K_M y Q6_K, según los tamaños de archivo publicados; no se confirma compatibilidad con modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de proyector multimodal mediante `--mmproj`. Clientes compatibles con la API OpenAI, como Cherry Studio. Otras opciones (vLLM, Ollama, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la información proporcionada. La siguiente tabla recoge únicamente los datos objetivos disponibles de este modelo; las alternativas se indican como no disponibles al no poder verificarse sus especificaciones en la información suministrada.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Omni-Edu-4B-GGUF | ~4,2 B | No disponible (ejemplo con 8192) | Sí (image-text-to-text) | Apache 2.0 | GGUF en Hugging Face |
| Alternativa 1 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 2 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 3 | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al ser un ajuste educativo, puede heredar sesgos del modelo base y de los datos de ajuste, que no se detallan.
- Riesgo de alucinación: no cuantificado ni documentado por el autor; en un contexto educativo, las respuestas incorrectas pueden tener impacto directo en el aprendizaje, por lo que se recomienda verificación humana.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado fuera del idioma o idiomas de entrenamiento, que no se especifican.
- Longitud de contexto no declarada en la model card: el valor de 8192 aparece solo como ejemplo de ejecución, no como límite oficial.
- La licencia Apache 2.0 no relicencia los datasets de entrenamiento ni sus materiales de origen, según advierte la propia model card.
- Al redistribuir el modelo o derivados es obligatorio incluir la licencia, conservar la atribución y el NOTICE, e identificar las modificaciones.
- El repositorio ocupa 19,8 GB e incluye múltiples cuantizaciones; es necesario descargar solo los archivos necesarios (un archivo principal más el `mmproj` para visión).
- El modelo tiene pocos likes (1) y un autor con un solo identificador; conviene evaluar su calidad de forma independiente antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lhpku20010120/Omni-Edu-4B-GGUF
- Modelo base: https://huggingface.co/lhpku20010120/Omni-Edu-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cherry Studio (cliente mencionado en la model card): no se proporciona enlace en la información disponible.
