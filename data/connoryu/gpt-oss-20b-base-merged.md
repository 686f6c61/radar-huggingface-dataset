# ConnorYU/gpt-oss-20b-base-merged

## Resumen

`ConnorYU/gpt-oss-20b-base-merged` es un modelo de lenguaje de 20 914 millones de parámetros, resultado de un fine-tuning sobre `gpt-oss-20b` de OpenAI, realizado por el usuario ConnorYU. El proceso de entrenamiento se llevó a cabo con la librería Unsloth y la biblioteca TRL de Hugging Face, partiendo de una versión cuantizada a 4 bits (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`) y posteriormente fusionando los pesos (merged) para obtener un modelo en precisión completa, distribuido en formato `safetensors`. La licencia es Apache-2.0, lo que permite uso comercial y modificaciones sin restricciones significativas.

El modelo base, `gpt-oss-20b`, es la variante mediana de la familia gpt-oss de OpenAI, diseñada para tareas de razonamiento, uso de herramientas y despliegue eficiente en hardware de consumo. Este fine-tuning concreto añade una capa de adaptación adicional, aunque no se especifica en la documentación disponible el conjunto de datos ni el objetivo exacto del ajuste. La relevancia actual radica en que ofrece una alternativa de 20B parámetros con licencia permisiva, entrenada con técnicas de optimización (Unsloth) que reducen el tiempo de cómputo, y que puede servir como base para aplicaciones de generación de texto y razonamiento en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gpt_oss (familia gpt-oss de OpenAI, detalles internos no disponibles) |
| Parametros totales | 20 914 757 184 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base era 4-bit, pero el merged parece estar en precisión completa; el tamaño del repo de 41.9 GB sugiere pesos en bf16/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `gpt-oss-20b` en los materiales proporcionados. Según la documentación pública de OpenAI, la familia gpt-oss está optimizada para razonamiento y tareas de agente, pero no se especifican aquí los detalles de capas, atención o mecanismos de mezcla de expertos. El fine-tuning de este modelo se realizó con Unsloth, una librería que acelera el entrenamiento mediante kernels optimizados, y con TRL de Hugging Face, que proporciona utilidades para fine-tuning con técnicas como RLHF o SFT. El proceso partió de una versión cuantizada a 4 bits (`unsloth/gpt-oss-20b-unsloth-bnb-4bit`), lo que redujo los requisitos de memoria durante el entrenamiento, y posteriormente se fusionaron los adaptadores para obtener los pesos completos. No se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, con capacidades de razonamiento y respuesta conversacional (heredadas del modelo base gpt-oss-20b).
- Soporte de tool calling / function calling, según las características documentadas de la familia gpt-oss en la web de OpenAI y el repositorio oficial.
- Capacidad para tareas de agente y razonamiento multi-paso, tal como se describe en la documentación de gpt-oss-20b.
- No se confirmaron capacidades de visión, audio u otras modalidades en la información disponible.
- El idioma principal y único declarado es el inglés; no se mencionan capacidades multilingües.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno en aplicaciones de atención al cliente o asistentes personales, aprovechando su capacidad de razonamiento y generación fluida de texto.
- Generación de código asistida: gracias al soporte de tool calling, puede integrarse en entornos de desarrollo para sugerir fragmentos de código o completar funciones, aunque no se han publicado benchmarks específicos de esta habilidad.
- Automatización de tareas de agente: el modelo puede encadenar llamadas a herramientas externas (APIs, bases de datos) para resolver tareas complejas, como la planificación de itinerarios o la consulta de información estructurada.
- Fine-tuning adicional: al estar publicado con licencia Apache-2.0 y pesos completos, sirve como punto de partida para ajustes específicos en dominios como finanzas, medicina o derecho, siempre que se disponga de datos en inglés.
- Prototipado rápido en investigación: su tamaño de 20B permite experimentar con técnicas de razonamiento o agentes en una sola GPU de alta gama, sin necesidad de infraestructura masiva.
- Evaluación de modelos open-weight: puede utilizarse como referencia en comparativas de modelos de tamaño similar, dado que es una variante fine-tuneada de un modelo de OpenAI con licencia abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Se recomienda consultar la documentación del modelo base `gpt-oss-20b` para obtener referencias de rendimiento, que no están incluidas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (tamaño de repo 41.9 GB), se necesitan aproximadamente 40 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits se reduciría a unos 20 GB, y a 4 bits a unos 10 GB, aunque no se confirma que este modelo incluya versiones cuantizadas.
- GPU recomendadas: una NVIDIA A100 de 40 GB o 80 GB, o dos RTX 4090 en paralelo (24 GB cada una) con soporte para particionado de modelo. En consumer GPU, una RTX 4090 con 24 GB no puede cargar el modelo en bf16, pero sí en cuantización 4-bit (si se genera una versión GGUF o AWQ).
- Opciones de despliegue: al ser un modelo de la familia gpt-oss, es compatible con frameworks como vLLM, llama.cpp (mediante conversión a GGUF), Ollama y Text Generation Inference (TGI), según se indica en las etiquetas del repositorio.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 20B en bf16 en una A100, se espera una latencia de decodificación del orden de 30-50 ms por token, pero estos valores son orientativos y no han sido verificados para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConnorYU/gpt-oss-20b-base-merged (este) | 20.9B | no disponible | Apache-2.0 | Hugging Face |
| openai/gpt-oss-20b (base) | 20.9B | no disponible | Apache-2.0 | Hugging Face, API OpenAI |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 20.9B (cuantizado 4-bit) | no disponible | Apache-2.0 | Hugging Face |

Este modelo es un fine-tuning del mismo `gpt-oss-20b` original, por lo que las capacidades de razonamiento y tool calling son equivalentes en teoría, pero el ajuste adicional puede haber modificado el comportamiento en tareas específicas. No se dispone de datos de rendimiento comparativo entre estas variantes. Otras alternativas de tamaño similar (como Llama 3.1 70B o Mistral Large) no son directamente comparables por diferencias de arquitectura y licencia, y no se incluyen por falta de información contrastada.

## Limitaciones y advertencias

- No se han documentado sesgos específicos de este modelo, pero al ser un fine-tuning de un modelo entrenado principalmente en inglés, puede presentar sesgos culturales o lingüísticos propios de ese dominio.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o no verificada, especialmente en tareas de razonamiento complejo donde no hay una fuente externa de validación.
- Limitaciones de contexto: no se ha especificado la longitud máxima de contexto; si es similar al modelo base, podría estar en el rango de 128K tokens, pero no se confirma.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero no se incluyen garantías ni responsabilidad por parte del autor del fine-tuning.
- Advertencia para producción: al ser un modelo publicado por un tercero (ConnorYU) y no por OpenAI directamente, no se garantiza la reproducibilidad del entrenamiento ni la calidad del fine-tuning. Se recomienda validar el comportamiento en el dominio de uso antes de desplegarlo.
- El modelo solo soporta inglés; no es adecuado para aplicaciones multilingües sin un fine-tuning adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ConnorYU/gpt-oss-20b-base-merged
- Modelo base (cuantizado 4-bit): https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Documentación API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Repositorio oficial de gpt-oss: https://github.com/openai/gpt-oss
- Blog de OpenAI sobre la serie gpt-oss: https://openai.com/index/introducing-gpt-oss/
