# Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP4

## Resumen

El modelo `Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP4` es una cuantización FP4 (weight-only) del modelo `gemma-4-31B-it-Uncensored`, que a su vez es una versión "abliterada" (sin censura) del modelo Gemma 4 31B de Google. El autor, Rin247, ha aplicado una proyección ortogonal para eliminar la dirección de rechazo del modelo base antes de cuantizarlo, siguiendo el enfoque del proyecto "Genesis of Aquarion". El resultado es un modelo multimodal (imagen-texto) que conserva las capacidades de Gemma 4 —visión, tool calling, contexto largo— pero sin los mecanismos de negativa ante solicitudes consideradas inapropiadas.

La cuantización FP4 reduce significativamente el tamaño de almacenamiento (19,7 GB en el repositorio) y permite una inferencia más eficiente en hardware con VRAM limitada. El modelo se distribuye en formato safetensors con recetas de cuantización personalizadas que requieren dequantización mediante buffers de escala y forma. Aunque el nombre sugiere 31B de parámetros, el archivo safetensors reporta 16.357.254.800 parámetros, lo que podría indicar una discrepancia en el conteo o una versión reducida; se recomienda verificar con el modelo base original.

Este modelo es relevante para desarrolladores e investigadores que buscan alternativas sin censura para generación de texto e imagen, con capacidades multimodales y un tamaño manejable para despliegue local, aunque su licencia no está especificada en la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) |
| Parametros totales | 16.357.254.800 (según safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K (según documentación de Gemma 4) |
| Tipos de cuantizacion | FP4 (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Gemma 4 usa Apache 2.0) |
| Formato de pesos | safetensors (FP4 weight-only) |

## Arquitectura y entrenamiento

El modelo base es `gemma-4-31B-it`, un transformer denso multimodal de 31B parámetros desarrollado por Google, con soporte nativo para visión, tool calling y una ventana de contexto de 256K tokens. La versión "Uncensored" fue creada por TrevorJS mediante abliteración, una técnica que elimina la dirección de rechazo del modelo usando proyección ortogonal (biprojection y EGA para modelos MoE, aunque este es denso). El modelo de Rin247 aplica además una cuantización FP4 weight-only mediante RTN (Round-to-Nearest) en CPU, almacenando escalas y formas junto a los pesos. No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso de abliteración específico de esta versión.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto).
- Soporte de tool calling / function calling, según la documentación de Gemma 4.
- Capacidad de agentes y razonamiento multi-paso, heredada del modelo base.
- Conversación multi-turno con contexto largo (256K tokens).
- Generación de contenido sin censura (abliterado), lo que elimina las negativas ante solicitudes controvertidas.
- Cuantización FP4 para inferencia eficiente en hardware con VRAM limitada.

## Casos de uso

- Generación creativa sin restricciones: el modelo puede producir narrativa, poesía o guiones sobre temas tabú o controvertidos sin rechazos, útil para investigación en creatividad computacional.
- Asistentes conversacionales personalizados: su capacidad de tool calling y contexto largo permite integrarlo en chatbots que necesiten mantener conversaciones extensas y ejecutar acciones externas.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, responder preguntas visuales y generar texto a partir de contenido gráfico, útil en aplicaciones de accesibilidad o documentación automática.
- Desarrollo de agentes autónomos: su soporte para function calling y razonamiento multi-paso lo hace adecuado para pipelines de automatización que requieran planificación y ejecución de tareas.
- Prototipado de aplicaciones de IA generativa: al ser una cuantización FP4, cabe en GPUs de consumo (por ejemplo, 24 GB VRAM), permitiendo pruebas locales rápidas sin necesidad de infraestructura cloud.
- Investigación sobre alineación y censura: al ser un modelo abliterado, sirve como caso de estudio para analizar el comportamiento de modelos sin mecanismos de rechazo, comparándolo con versiones censuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 19,7 GB, lo que sugiere que el modelo cuantizado puede cargarse en GPUs con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G).
- Al ser FP4 weight-only, la inferencia requiere dequantización en tiempo de ejecución; se recomienda usar frameworks compatibles con cuantización personalizada (por ejemplo, vLLM con soporte FP4, o llama.cpp si se convierte a GGUF).
- No se dispone de datos oficiales sobre latencia o throughput; dependerá del hardware y del motor de inferencia.
- Para uso en producción, se sugiere probar con vLLM o TGI, aunque la receta de cuantización personalizada puede requerir adaptaciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El modelo base Gemma 4 31B puede compararse con otros modelos abliterados de la colección de TrevorJS, pero no hay datos de rendimiento disponibles en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido inapropiado, ofensivo o dañino sin restricciones; su uso debe ser responsable y ético.
- Riesgo de alucinación: como cualquier LLM, puede producir información falsa o inventada, especialmente en temas especializados.
- La licencia no está especificada en la ficha; aunque el modelo base Gemma 4 usa Apache 2.0, la cuantización y el proceso de abliteración pueden tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- La cuantización FP4 puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa.
- El número de parámetros reportado (16,3B) difiere del nombre del modelo (31B); esto podría indicar una versión reducida o un error en el conteo, por lo que se debe verificar la integridad del modelo antes de usarlo.
- No se dispone de información sobre los idiomas soportados; aunque Gemma 4 es multilingüe, esta versión cuantizada no lo especifica.

## Enlaces

- [HuggingFace - Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP4](https://huggingface.co/Rin247/gemma-4-31B-it-Uncensored-Aquarion-FP4)
- [Colección Gemma 4 Uncensored de TrevorJS](https://huggingface.co/collections/TrevorJS/gemma-4-uncensored)
- [README del modelo base gemma-4-31B-it-uncensored](https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored/blob/main/README.md)
- [Guía local de Gemma 4 (locallyuncensored.com)](https://locallyuncensored.com/blog/gemma-4-local-guide.html)
- [Página de descarga GGUF de Gemma 4 31B It Uncensored](https://local-ai-zone.github.io/models/gemma-4-31b-it-uncensored.html)
- [Catálogo de modelos abliterados (abliteration.org)](https://abliteration.org/)
