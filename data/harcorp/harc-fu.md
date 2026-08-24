# harcorp/HARC-FU

## Resumen

HARC-FU (Hierarchical Assembly Reconnaissance Chain - Foundation Unit) es un modelo de lenguaje de código abierto desarrollado por la empresa india Harcorp Industries. Según su model card, se trata de un modelo multimodal nativo con capacidades de visión y una ventana de contexto de 20 millones de tokens, lo que lo posiciona como el primer modelo de clase 20M de contexto en código abierto. Está diseñado para tareas de razonamiento de largo alcance, generación de código y trabajo de conocimiento.

El modelo emplea una arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio, y se describe como un modelo "agéntico" con capacidades conversacionales. Aunque la ficha del autor indica que es de pesos abiertos, la licencia es propietaria (harcorp-owm) y no se proporcionan detalles sobre el proceso de entrenamiento, el dataset o las cuantizaciones disponibles. El repositorio no registra descargas ni validación de la comunidad, por lo que los datos publicados deben tomarse con cautela hasta que haya una evaluación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), multimodal nativo |
| Parametros totales | 512 mil millones (512B) |
| Parametros activos | no disponible |
| Longitud de contexto | 20 millones de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere ingles por la documentacion) |
| Licencia | harcorp-owm (propietaria, con enlace a la documentacion de licencia) |
| Formato de pesos | no disponible (no se especifican safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

La model card indica que HARC-FU usa una arquitectura MoE, aunque no se especifican el número de expertos ni el tamaño de los parámetros activos. Se describe como un modelo "agéntico" y multimodal nativo, con visión integrada. El entrenamiento no se detalla: no hay información pública sobre el número de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. La empresa Harcorp Industries se presenta como una compañía india centrada en "inteligencia artificial superinteligente y materia", pero no hay papers ni documentación técnica adicional que respalde estas afirmaciones.

## Capacidades

- Generación de texto y conversación multi-turno: el modelo está diseñado para diálogos conversacionales según su etiqueta.
- Razonamiento de largo plazo: la ventana de contexto de 20 millones de tokens permite procesar y razonar sobre documentos o bases de código muy extensas.
- Generación de código de largo alcance: la model card menciona "long-horizon coding" como uno de sus usos previstos.
- Visión nativa: el modelo incorpora capacidades de visión multimodal, aunque no se detallan las tareas específicas (OCR, descripción de imágenes, etc.).
- Capacidades agénticas: se describe como un modelo "agéntico", lo que sugiere soporte para interacciones multi-paso y uso de herramientas, aunque no se documentan detalles.

## Casos de uso

- **Análisis de documentos jurídicos o regulatorios extensos**: la ventana de 20 millones de tokens permite procesar contratos, normativas o expedientes completos en una sola pasada, lo que facilita la extracción de cláusulas, la detección de riesgos y la generación de resúmenes.
- **Revisión y refactorización de repositorios de código a gran escala**: un desarrollador podría cargar un monorepo completo y pedir al modelo que identifique patrones, proponga cambios o genere documentación, sin fragmentar el contexto.
- **Investigación académica**: síntesis de múltiples papers y artículos científicos dentro de una misma conversación, con capacidad de cruzar referencias y extraer conclusiones.
- **Agentes de atención al cliente**: aunque no se documenta soporte explícito de function calling, su naturaleza conversacional y agéntica permite diseñar asistentes que gestionen consultas multi-turno con contexto extenso de historial.
- **Generación de informes de conocimiento**: el modelo puede redactar informes técnicos o de inteligencia de mercado a partir de grandes volúmenes de datos textuales (noticias, informes, bases de datos) en una sola ejecución.
- **Prototipado de aplicaciones multimodales**: gracias a su visión nativa, se puede explorar el uso para tareas de descripción de imágenes o análisis de capturas de pantalla, aunque no hay benchmarks que validen la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. No se recomienda utilizar este modelo en producción sin una validación independiente.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPU recomendadas o throughput.
- Un modelo de 512B parámetros (denso) requeriría del orden de 1 TB de VRAM en precisión FP16, o unos 512 GB en cuantización de 8 bits y 256 GB en 4 bits. Si la arquitectura MoE reduce los parámetros activos, la carga de memoria podría ser menor, pero no se conoce el número de expertos activos.
- No es viable en GPU de consumo (RTX 4090, 24 GB) si se considera la carga completa; solo sería posible con cuantizaciones agresivas y una fracción del modelo, lo que degradaría el rendimiento.
- Para inferencia práctica se requeriría un clúster de GPUs de nivel centro de datos (A100 80GB, H100) o el uso de servicios en la nube con memoria distribuida.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI). Dado que no se especifica el formato de pesos, se desconoce si es compatible con los frameworks estándar.

## Comparativa con modelos similares

No se ha publicado una comparativa oficial. El modelo se posiciona como el primero en código abierto con 20 millones de tokens de contexto, pero no hay datos de rendimiento frente a alternativas de contexto largo como Gemini 1.5 (10M), Claude 4 (1M) o modelos abiertos como Qwen 2.5 (256K) o Llama 3.1 (128K). Sin benchmarks, no es posible establecer una comparativa técnica fiable. Se indica "no disponible".

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia harcorp-owm es propietaria y no es una licencia de código abierto estándar (no es Apache, MIT o similar). El enlace a la licencia se proporciona en la documentación, pero no se ha verificado su contenido; puede imponer restricciones al uso comercial o a la redistribución.
- **Sin validación independiente**: el repositorio no tiene descargas ni likes, y no hay papers ni evaluaciones externas que respalden las afirmaciones de la model card.
- **Riesgo de alucinación**: al ser un modelo de 512B sin datos de entrenamiento públicos, no se puede evaluar la tasa de alucinación ni la fiabilidad de las respuestas.
- **Idiomas**: no se especifican los idiomas soportados; la documentación está en inglés, por lo que el rendimiento en otros idiomas, incluido el español, es desconocido.
- **Carga de inferencia**: el tamaño total de 512B hace que la inferencia sea costosa y no accesible para la mayoría de los desarrolladores individuales, salvo a través de APIs de terceros que pudieran ofrecer el modelo.
- **Caveat de producción**: no se recomienda su uso en entornos de producción sin pruebas exhaustivas y revisión de la licencia.

## Enlaces

- [Hugging Face - harcorp/HARC-FU](https://huggingface.co/harcorp/HARC-FU)
- [Harcorp Industries - sitio web](https://www.harcorp.industries/)
- [Licencia harcorp-owm](https://docs.harcorp.com/owm/harc-fu/license)

Nota: la búsqueda web arrojó resultados sobre "HARC" de Microsoft (un modelo de jailbreak) y "Harc AI lab" de Brett Adcock, que no están relacionados con este modelo concreto. Se han excluido de la ficha por no ser comparables ni relevantes.
