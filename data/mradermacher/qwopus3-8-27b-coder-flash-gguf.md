# mradermacher/Qwopus3.8-27B-Coder-Flash-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-GGUF es la versión cuantizada en formato GGUF del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo multimodal de tipo image-text-to-text orientado a generación de código, razonamiento y uso de herramientas. La cuantización la ha realizado mradermacher, un autor habitual de conversiones GGUF en Hugging Face, y cubre un abanico amplio de tipos de cuantización, desde Q2_K hasta Q8_0, además de los suplementos multimodales mmproj en f16 y Q8_0.

El modelo base cuenta con 27.320.697.856 parámetros reales (aproximadamente 27,3 mil millones, según los pesos en safetensors) y está etiquetado con la familia qwen3_5 y el identificador qwopus3_8, lo que sugiere una arquitectura derivada de la familia Qwen 3.5. Incorpora capacidades de visión, tool calling, razonamiento y agentes, y está afinado específicamente para tareas de programación. Su licencia es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 27B multimodal y especializado en código en hardware de consumo o en servidores con GPU modestas, gracias a las cuantizaciones de 4 y 5 bits que reducen el peso a entre 15,9 y 19,6 GB. Al estar disponible en GGUF, es compatible con llama.cpp y con los principales runners que lo soportan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia qwen3_5; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj f16 y mmproj Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de las etiquetas de la model card: transformer multimodal de tipo image-text-to-text, perteneciente a la familia qwen3_5 y con el identificador qwopus3_8. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea alguna variante como atención lineal o decodificación especulativa. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

Lo que sí se indica es que el modelo está afinado (fine-tuned) para coding, code-generation, reasoning, tool-use y agent, y que conserva capacidades de visión. El repositorio de mradermacher es una conversión estática a GGUF del modelo Jackrong/Qwopus3.8-27B-Coder-Flash; existe además una variante con cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF del mismo autor. No se aportan innovaciones técnicas adicionales en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Generación de código y tareas de programación (etiquetas coding y code-generation).
- Razonamiento (etiqueta reasoning), incluyendo razonamiento multi-paso orientado a agentes.
- Uso de herramientas y function calling (etiqueta tool-use).
- Comportamiento como agente (etiqueta agent).
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text, etiqueta vision, multimodal), con suplementos mmproj incluidos en el repositorio.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Inferencia eficiente gracias a las cuantizaciones GGUF (etiqueta efficient-inference).

## Casos de uso

- Asistente de programación en local: con la cuantización Q4_K_M (16,9 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB y asistir en autocompletado, refactorización y explicación de código sin enviar datos a la nube.
- Revisión de código en pipelines de CI/CD: su soporte de tool calling y su especialización en código permiten integrarlo como paso de análisis que consulte repositorios o ejecute comprobaciones mediante funciones externas.
- Agentes autónomos de resolución de tareas: la combinación de razonamiento multi-paso y tool-use lo hace adecuado para orquestar llamadas a APIs y encadenar acciones en flujos de trabajo automatizados.
- Análisis de capturas y diagramas técnicos: al ser multimodal, puede recibir una imagen (por ejemplo, un diagrama de arquitectura o una captura de error) junto con una pregunta en texto y devolver una explicación o un parche de código.
- Asistencia técnica bilingüe inglés-chino: útil para equipos que trabajan con documentación o usuarios en esos dos idiomas, con conversaciones multi-turno.
- Despliegue en estaciones de trabajo sin GPU dedicada de gran tamaño: las cuantizaciones Q2_K (11,0 GB) y Q3_K_S (12,4 GB) permiten ejecución en equipos con 12-16 GB de VRAM o incluso en CPU con llama.cpp, a costa de calidad.
- Prototipado rápido de aplicaciones de código: la disponibilidad en GGUF facilita probar el modelo con Ollama o llama.cpp antes de decidir un despliegue mayor con vLLM sobre los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa la parte multimodal.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se requiere una GPU de 32 GB o más (A100 40 GB, H100, o reparto en varias GPU).
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con cuantizaciones Q3 y en tarjetas de 24 GB con Q4_K_M, Q5_K_M e incluso Q6_K (22,5 GB, justo al límite).
- Opciones de despliegue: llama.cpp y runners basados en él (Ollama, LM Studio, llama-cpp-python) para los GGUF; vLLM y transformers para los pesos originales del modelo base. La model card del autor menciona vLLM entre las etiquetas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash (este) | 27,3B | no disponible | sí | Apache 2.0 | GGUF y safetensors |
| Modelos de ~27B de la familia Qwen (versiones estándar) | ~27B | no disponible | según variante | variable según versión | safetensors, GGUF |
| Modelos coder de ~30B de otras familias | ~30B | no disponible | generalmente no | variable | safetensors, GGUF |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idiomas: la model card solo declara inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este modelo.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar cargas de contexto largo con garantías.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- La parte multimodal requiere descargar y cargar los ficheros mmproj por separado; sin ellos el modelo funciona solo con texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash por si añade requisitos adicionales.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que la evaluación en producción debe hacerse con pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwopus3.8-27B-Coder-Flash-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
