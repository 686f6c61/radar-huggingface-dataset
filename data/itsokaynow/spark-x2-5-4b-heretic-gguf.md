# ItsOkayNow/Spark-X2.5-4B-Heretic-GGUF

## Resumen

Spark-X2.5-4B-Heretic-GGUF es una cuantización en formato GGUF del modelo Spark-X2.5-4B-Heretic, desarrollado por soyaakinohara. El modelo original, Spark-X2.5-4B, es un modelo de lenguaje compacto de 4.112 millones de parámetros creado por el equipo de XHToken, orientado a tareas generales como conversación, escritura, traducción, razonamiento, código y uso de herramientas. La variante "Heretic" elimina los rechazos de seguridad (refusal-removed) y ofrece un comportamiento sin censura, lo que permite respuestas a peticiones que normalmente serían bloqueadas. Esta cuantización ha sido generada por ItsOkayNow utilizando un archivo imatrix de stornic56, con el objetivo de facilitar la ejecución en hardware de consumo mediante llama.cpp u Ollama. El tamaño compacto (4.1B) y su licencia MIT lo convierten en una opción accesible para despliegues locales, aunque su naturaleza sin censura exige medidas adicionales de moderación.

La arquitectura y la longitud de contexto no están especificadas en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.112.079.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples archivos, no especificados; el repositorio ocupa 23 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información pública sobre la arquitectura interna de Spark-X2.5-4B es limitada. El repositorio de GitHub de XHToken indica que se trata de un modelo "compacto, de propósito general", pero no se detalla si es un transformer puro, una arquitectura híbrida o alguna variante reciente. Tampoco se han publicado datos sobre la composición del corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La variante "Heretic" se describe como un modelo "uncensored / refusal-removed", lo que implica que se ha modificado el modelo base para eliminar los mecanismos de rechazo de preguntas sensibles. La presente cuantización se realizó con la herramienta llama.cpp, utilizando un archivo imatrix de stornic56 para mejorar la calidad de la compresión. No hay más detalles técnicos disponibles.

## Capacidades

- Generación de texto y conversación: el modelo es capaz de mantener diálogos coherentes y responder a preguntas de diversa índole.
- Razonamiento: incluye tareas de razonamiento lógico y matemático, aunque el alcance exacto no se ha documentado.
- Escritura: puede redactar textos, resúmenes, correos y documentos técnicos.
- Traducción: el modelo está pensado para tareas multilingües, aunque los idiomas soportados no se han especificado.
- Generación de código: soporta codificación en distintos lenguajes de programación.
- Tool calling / function calling: el modelo puede integrarse con herramientas externas y ejecutar llamadas a funciones dentro de flujos automatizados.
- Flujos agénticos: es capaz de realizar razonamiento multi-paso y coordinarse con agentes.
- Ausencia de rechazos: al ser una variante "Heretic", el modelo no aplica filtros de seguridad de forma nativa, lo que permite respuestas sin restricciones a peticiones controvertidas.
- No se han documentado capacidades de visión, audio ni modo de pensamiento específico.

## Casos de uso

- Asistente local en el escritorio: gracias al formato GGUF, puede ejecutarse con llama.cpp o Ollama en una GPU de consumo (por ejemplo, RTX 3060) o incluso en CPU, ofreciendo un asistente conversacional privado y sin dependencia de la nube.
- Herramienta de desarrollo de código: el soporte de tool calling permite integrarlo en agentes de autocompletado o revisión de código dentro de entornos como Visual Studio Code o pipelines de CI/CD.
- Automatización de redacción técnica: puede utilizarse para generar documentación, informes o artículos en varios idiomas, siempre que se valide la salida manualmente.
- Traducción rápida en flujos de trabajo: el modelo puede emplearse como motor de traducción en aplicaciones de escritorio o herramientas internas, dado su tamaño compacto y su capacidad multilingüe.
- Investigación en seguridad de IA: la variante "Heretic" permite estudiar el comportamiento de modelos sin alineación de seguridad, facilitando investigaciones sobre sesgos, alucinaciones y técnicas de moderación.
- Prototipado de agentes autónomos: su capacidad de razonamiento multi-paso y tool calling lo hace adecuado para construir prototipos de agentes que necesiten interactuar con APIs o bases de datos en entornos controlados.
- Creación de contenido creativo o rol: al no imponer rechazos, puede emplearse en proyectos de ficción o juegos de rol que requieran respuestas libres, siempre que se implemente una capa de filtrado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 4.1B parámetros en GGUF, una cuantización 4-bit (tipo Q4_K_M) suele requerir entre 2 y 3 GB de VRAM; las cuantizaciones 5-bit o superiores pueden demandar entre 3 y 5 GB. En FP16, la carga sería de aproximadamente 8 GB.
- GPU recomendadas: modelos de gama media como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4090 pueden ejecutar el modelo sin problemas. También es viable en GPUs más modestas si se utilizan cuantizaciones agresivas.
- Se puede ejecutar en CPU con llama.cpp, priorizando la velocidad en GPU cuando esté disponible.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (backend llama.cpp) y cualquier otro consumidor compatible con formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa fiable. El único modelo comparable identificado es Spark-X2.5-1.7B, la variante más pequeña de la misma serie, pero no se han encontrado especificaciones detalladas ni benchmarks públicos. El resto de características (contexto, rendimiento, precisiones) no están documentadas en la información disponible.

## Limitaciones y advertencias

- El modelo es una versión "uncensored / refusal-removed": según la model card original, no tiene mecanismos de seguridad integrados, lo que incrementa el riesgo de generar contenido dañino, ilegal o no apropiado.
- No se han proporcionado datos sobre sesgos, alucinaciones ni limitaciones de contexto. Se recomienda realizar una evaluación local antes de usarlo en producción.
- Los idiomas soportados no están especificados, por lo que la calidad de las respuestas en lenguas distintas de las de entrenamiento no está garantizada.
- La licencia MIT permite uso comercial y modificación, pero no exonera de responsabilidad legal por el contenido generado; el usuario debe implementar moderación adicional.
- La cuantización GGUF puede introducir una ligera pérdida de calidad en comparación con los pesos originales en safetensors.
- Las descargas del repositorio son 0, lo que sugiere que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ItsOkayNow/Spark-X2.5-4B-Heretic-GGUF
- Repositorio de XHToken (serie Spark-X2.5): https://github.com/XHToken/Spark-X2.5
- Variante GGUF japonesa del mismo modelo base: https://huggingface.co/soyaakinohara/Spark-X2.5-4B-Heretic-jp-gguf
- Archivo imatrix de stornic56 mencionado en la model card: https://huggingface.co/stornic56/Spark-X2.5-4B-GGUF/tree/main
