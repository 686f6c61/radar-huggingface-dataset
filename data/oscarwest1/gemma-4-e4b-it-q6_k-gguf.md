# oscarwest1/gemma-4-E4B-it-Q6_K-GGUF

## Resumen

Este repositorio contiene una conversión a GGUF del modelo Gemma 4 E4B Instruct de Google DeepMind, cuantizada en Q6_K por el usuario oscarwest1. Se trata de una conversión de terceros no oficial, sin fine-tuning adicional, pensada para su ejecución con llama.cpp y herramientas compatibles. El modelo base es instruction-tuned y multilingüe, con 7.518.069.290 parámetros totales según los safetensors del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Gemma 4 en hardware de consumo mediante cuantización Q6_K, manteniendo una calidad cercana a la precisión original BF16. El repositorio ocupa 6,2 GB y el archivo cuantizado resultante pesa 5,78 GiB, lo que lo sitúa en el rango de GPUs con 8 GB o más de VRAM.

No se dispone de información detallada sobre arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada. Los datos técnicos se limitan a los metadatos del repositorio y a la model card del autor de la conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E4B-it) |
| Parámetros totales | 7.518.069.290 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF); origen en BF16 safetensors |
| Idiomas soportados | no disponible (etiquetado como multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q6_K); original en safetensors BF16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El modelo original es google/gemma-4-E4B-it, desarrollado por Google DeepMind, y esta conversión parte de los pesos en BF16 safetensors. La model card indica que la conversión se realizó a GGUF BF16 con llama.cpp y posteriormente se cuantizó a Q6_K, sin ningún fine-tuning adicional.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineación. La única información sobre el proceso es la cadena de conversión: BF16 safetensors → BF16 GGUF → Q6_K GGUF.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned, según la etiqueta `conversational` del repositorio.
- Soporte multilingüe declarado en las etiquetas del modelo, aunque no se especifican los idiomas concretos.
- Ejecución local mediante llama.cpp en formato GGUF, lo que permite despliegue en CPU y GPU.
- Compatibilidad con endpoints según la etiqueta `endpoints_compatible`.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modos de pensamiento (thinking mode) en la documentación proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse con `llama-cli -m gemma-4-E4B-it-Q6_K.gguf -cnv` para mantener conversaciones multi-turno en local, sin dependencia de servicios en la nube, gracias a su formato GGUF y a su naturaleza instruction-tuned.
- Prototipado en estaciones de trabajo sin GPU dedicada de gama alta: la cuantización Q6_K reduce el peso a 5,78 GiB, lo que permite cargar el modelo en equipos con 8 GB de VRAM o en configuraciones CPU con suficiente RAM.
- Evaluación de la familia Gemma 4 antes de adoptar el modelo original en BF16: esta conversión permite probar el comportamiento del modelo con una pérdida de calidad mínima respecto a BF16, a un coste de almacenamiento menor.
- Integración en pipelines de llama.cpp: al ser un GGUF estándar, puede incorporarse en flujos de generación de texto por lotes o en servidores compatibles con la API de llama.cpp.
- Experimentación académica con modelos abiertos: la licencia Apache 2.0 facilita su uso en investigación y en entornos docentes sin restricciones comerciales adicionales.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse íntegramente en local, el modelo es adecuado para escenarios donde los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,78 GiB solo para los pesos en Q6_K; hay que añadir el espacio para el contexto KV, por lo que se recomienda un mínimo de 8 GB de VRAM para contextos moderados.
- GPU recomendadas: no disponibles de forma específica; por tamaño, el modelo encaja en GPUs consumer con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: sí, en modelos con 8 GB de VRAM o superior, siempre que se ajuste la longitud de contexto.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y cualquier runtime compatible con GGUF. No se confirma compatibilidad con vLLM, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E4B-it-Q6_K-GGUF (este) | 7.518.069.290 | no disponible | GGUF Q6_K | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-4-E4B-it (original) | 7.518.069.290 | no disponible | safetensors BF16 | Apache 2.0 | Hugging Face (oficial) |
| Otras cuantizaciones GGUF de Gemma 4 E4B | no disponible | no disponible | GGUF | Apache 2.0 | no disponible |

No se dispone de datos de rendimiento comparado con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor indica explícitamente que no está afiliado ni respaldado por Google; para producción conviene valorar el modelo original o conversiones mantenidas activamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Sin información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del modelo base en la documentación disponible.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin consultar la documentación del modelo original.
- La cuantización Q6_K introduce una pérdida de precisión respecto a BF16, aunque suele ser pequeña; no se han publicado evaluaciones de esta conversión concreta.
- Aunque la licencia es Apache 2.0, deben revisarse los términos del modelo base original para confirmar obligaciones de atribución.
- No se confirma compatibilidad con runtimes distintos de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/oscarwest1/gemma-4-E4B-it-Q6_K-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
