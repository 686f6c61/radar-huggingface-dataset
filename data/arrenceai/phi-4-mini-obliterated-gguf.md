# ArRENCEAI/Phi-4-mini-obliterated-gguf

## Resumen

El modelo **ArRENCEAI/Phi-4-mini-obliterated-gguf** es una versión cuantizada en formato GGUF del modelo **microsoft/Phi-4-mini-instruct**, a la que se le ha aplicado la técnica de **abliteration** (también conocida como "obliteration") para eliminar los mecanismos de rechazo de contenido del modelo original. El resultado es un modelo "sin censura" (uncensored) que puede generar respuestas sin las restricciones habituales de seguridad y alineación. Ha sido publicado por **ArRENCE AI**, una empresa que ofrece servicios de IA local y chatbots, y está pensado exclusivamente para fines de investigación y entretenimiento, según su descargo de responsabilidad.

El modelo base, Phi-4-mini-instruct, es un modelo de lenguaje de 3.800 millones de parámetros desarrollado por Microsoft, conocido por sus mejoras en razonamiento, matemáticas, soporte multilingüe y function calling. Esta versión obliterated conserva esas capacidades pero elimina la capa de rechazo de contenido, lo que la hace adecuada para experimentos en los que se requiere una generación de texto sin filtros. El repositorio contiene únicamente pesos en formato GGUF, lo que facilita su ejecución en hardware modesto mediante herramientas como llama.cpp u Ollama.

Aunque el modelo tiene actualmente cero descargas y cero valoraciones en Hugging Face, su existencia responde a una demanda creciente de modelos abliterados para investigación en alineación, seguridad y generación creativa sin restricciones. La licencia no está especificada, lo que supone una limitación importante para su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, sin detalle de archivos) |
| Idiomas soportados | en (según tags) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una adaptación de **Phi-4-mini-instruct**, un transformer decoder-only de 3.800 millones de parámetros desarrollado por Microsoft. La versión original fue entrenada con un enfoque en razonamiento, matemáticas y soporte multilingüe, e incorpora soporte nativo para function calling. La modificación principal de esta variante es la aplicación de **abliteration**, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los rechazos de contenido, de modo que el modelo deja de negarse a responder a peticiones que el modelo base consideraría inapropiadas.

No se proporcionan detalles sobre el proceso de entrenamiento adicional, el número de tokens utilizados o si se aplicaron técnicas de ajuste fino más allá de la abliteration. El repositorio solo contiene los pesos cuantizados en GGUF, sin información sobre el dataset de entrenamiento ni el procedimiento exacto de cuantización.

## Capacidades

- Generación de texto libre sin restricciones de contenido (uncensored).
- Razonamiento y resolución de problemas matemáticos, heredados del modelo base Phi-4-mini.
- Soporte de function calling / tool calling, según las características del modelo base.
- Capacidades multilingües, aunque el tag principal indica solo inglés.
- Conversación multi-turno, dado que el modelo base está optimizado para instrucciones.
- Compatible con herramientas de inferencia local que soporten GGUF (llama.cpp, Ollama, etc.).

## Casos de uso

- **Investigación en alineación y seguridad de IA**: el modelo permite estudiar cómo se comporta un LLM sin mecanismos de rechazo, lo que resulta útil para analizar sesgos, riesgos de generación de contenido dañino y estrategias de mitigación.
- **Generación creativa sin restricciones**: escritores y artistas pueden explorar narrativas, diálogos o ideas que los modelos censurados rechazarían, como ficción con temáticas adultas o contenido políticamente incorrecto.
- **Prototipado rápido de chatbots experimentales**: al ser un modelo pequeño (3.8B) en GGUF, puede ejecutarse en una GPU de gama media o incluso en CPU, permitiendo iterar rápidamente en el diseño de asistentes conversacionales sin las limitaciones de los modelos comerciales.
- **Evaluación de técnicas de abliteration**: desarrolladores interesados en la técnica pueden comparar este modelo con la versión original de Phi-4-mini-instruct para medir el impacto de la eliminación de rechazos en la calidad y el comportamiento de las respuestas.
- **Entornos de desarrollo y pruebas locales**: al ser un modelo GGUF, se integra fácilmente en pipelines de desarrollo con llama.cpp o Ollama, ideal para pruebas de integración de agentes o herramientas de generación de texto en entornos aislados.
- **Educación y divulgación sobre IA**: puede utilizarse en talleres o cursos para demostrar los efectos de la censura en los modelos de lenguaje y las implicaciones éticas de su eliminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que se trata de una variante abliterada de Phi-4-mini-instruct, es probable que su rendimiento en tareas estándar sea similar al del modelo base, pero no hay datos que lo confirmen.

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 5.3 GB, lo que sugiere que los archivos GGUF pueden ocupar entre 2 y 5 GB según la cuantización. Con cuantizaciones de 4 bits (Q4_K_M), el modelo podría caber en GPUs con 4-6 GB de VRAM, como una GTX 1660 Super o una RTX 3050. Con cuantizaciones de 8 bits, se necesitarían al menos 8 GB.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) puede ejecutar el modelo con cuantización Q4. Para mayor velocidad, una RTX 4090 o A100 ofrecería un rendimiento óptimo, aunque no es necesario.
- **Compatibilidad con consumer GPU**: sí, el modelo está diseñado para ejecutarse en hardware de consumo gracias al formato GGUF.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier framework que soporte GGUF. También es compatible con vLLM si se convierte a otro formato, aunque no es el caso directo.
- **Latencia y throughput**: no se dispone de datos específicos. En una GPU moderna, un modelo de 3.8B en Q4 puede generar entre 20 y 50 tokens por segundo, pero esto depende del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ArRENCEAI/Phi-4-mini-obliterated-gguf | 3.8B | no disponible | no disponible | GGUF | Abliterado, sin censura |
| microsoft/Phi-4-mini-instruct | 3.8B | 128k (según documentación oficial) | MIT (según Microsoft) | safetensors | Modelo base, con censura |
| huihui_ai/phi4-mini-abliterated | 3.8B | 128k (según documentación oficial) | MIT (según Microsoft) | GGUF | Otra versión abliterada, disponible en Ollama |

La comparativa se basa en información pública sobre el modelo base. La versión de ArRENCEAI no especifica su licencia ni su contexto, por lo que se recomienda consultar el repositorio original de Microsoft para obtener esos datos.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser un modelo uncensored, puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable. El autor declina toda responsabilidad por su uso.
- **Riesgo de alucinación**: como cualquier LLM, puede inventar información, especialmente en temas especializados. La ausencia de censura no mejora la veracidad.
- **Licencia no especificada**: no se indica bajo qué términos se distribuye este modelo, lo que impide su uso comercial sin autorización explícita.
- **Idioma limitado**: aunque el modelo base tiene capacidades multilingües, el tag principal es "en", por lo que su rendimiento en otros idiomas puede ser inferior.
- **Sin soporte oficial**: al ser un proyecto de un tercero, no hay garantías de mantenimiento, actualizaciones o corrección de errores.
- **Contexto no confirmado**: no se ha verificado la longitud de contexto real de esta versión GGUF; puede diferir de la del modelo base.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/ArRENCEAI/Phi-4-mini-obliterated-gguf)
- [Web de ArRENCE AI](https://webblocalai.com)
- [ArRENCE AI Chat](https://arrenceai.com)
- [GitHub de ArRENCE AI](https://github.com/ArRENCEAI)
- [Modelo base: microsoft/Phi-4-mini-instruct](https://huggingface.co/microsoft/Phi-4-mini-instruct)
- [Versión abliterada de huihui_ai en Ollama](https://ollama.com/huihui_ai/phi4-mini-abliterated)
