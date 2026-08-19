# darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF

## Resumen

XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF es una cuantización GGUF del modelo de lenguaje XORTRON-CriminalComputing-EnablementEngine-v0.3, desarrollado por el usuario darkc0de. El modelo forma parte del proyecto "XORTRON Criminal Computing", descrito por su autor como un experimento de investigación en seguridad y alineación de la IA. Se basa en una versión modificada de Gemma 4 31B (darkc0de/gemma-4-31B-it-updated-heretic) que ha sido sometida a un proceso de "abliteración" (abliteration), una técnica que elimina los rechazos del modelo a peticiones dañinas o sensibles. El resultado es un modelo que el autor etiqueta explícitamente como "uncensored", "harmful" y "toxic".

Con aproximadamente 30,7 mil millones de parámetros, este modelo está disponible bajo licencia Apache 2.0 y en formato GGUF, lo que permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles. Su relevancia actual radica en que representa un caso extremo de modelo sin alineación, útil para estudiar los riesgos de la IA generativa y las técnicas de desalineación, aunque su uso práctico es muy limitado y potencialmente peligroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4 31B) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (se menciona 32K en un modelo similar del mismo autor, pero no confirmado) |
| Tipos de cuantizacion | GGUF (no se especifican los tipos exactos en la ficha) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repo contiene cuantizaciones; el modelo base está en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B, un modelo transformer decoder-only desarrollado por Google, aunque la versión base utilizada aquí es una modificación denominada "gemma-4-31B-it-updated-heretic" creada por el mismo autor. No se dispone de detalles sobre el proceso de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El término "heretic" en el nombre sugiere que se trata de una versión modificada para eliminar los mecanismos de rechazo y moderación del modelo original, probablemente mediante técnicas de abliteración (abliteration) o fine-tuning adverso.

El autor indica que el proyecto es un "experimento de investigación en curso sobre seguridad y alineación de la IA", pero no proporciona documentación técnica adicional. No se conocen innovaciones específicas en la arquitectura más allá de la modificación de los pesos para eliminar restricciones de seguridad.

## Capacidades

- Generación de texto libre en inglés, con capacidad de mantener conversaciones multi-turno.
- Razonamiento y respuesta a instrucciones complejas, heredadas del modelo base Gemma 4 31B.
- Generación de código y soporte de tareas técnicas (potencialmente, aunque no confirmado).
- Capacidad de responder a peticiones que los modelos alineados normalmente rechazarían, como contenido violento, ilegal o dañino.
- No se ha confirmado soporte de tool calling, function calling, ni capacidades multimodales (visión, audio).
- No se ha confirmado un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como caso de estudio para analizar los efectos de la abliteración y los riesgos de los modelos sin alineación. Los investigadores pueden estudiar sus respuestas para diseñar mejores sistemas de moderación.
- Evaluación de técnicas de desalineación: permite comparar el comportamiento de un modelo "desinhibido" frente a su versión alineada, ayudando a cuantificar la eficacia de los métodos de alineación.
- Pruebas de estrés de sistemas de filtrado: puede usarse para probar la robustez de clasificadores de contenido o sistemas de moderación ante entradas maliciosas.
- Análisis de sesgos y toxicidad: al ser un modelo sin filtros, permite estudiar la toxicidad inherente y los sesgos presentes en el modelo base sin la influencia de la capa de alineación.
- Desarrollo de contramedidas: los equipos de seguridad pueden usar sus respuestas para entrenar sistemas de detección de contenido dañino generado por IA.
- Educación en ética de la IA: como ejemplo práctico de los peligros de desplegar modelos sin alineación en producción, aunque su uso en entornos educativos debe ser extremadamente controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni similares en la ficha de HuggingFace. Dado que se basa en Gemma 4 31B, podría esperarse un rendimiento similar al modelo original en tareas estándar, pero la modificación de los pesos podría alterar estos resultados. No se dispone de datos fiables para comparar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,7B parámetros en GGUF, una cuantización Q4_K_M ocuparía aproximadamente 16-18 GB de VRAM (incluyendo overhead de contexto y KV cache). Para Q8, se necesitarían unos 30 GB.
- GPU recomendadas: para una ejecución fluida se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G). Para cuantizaciones más ligeras (Q4), una RTX 4090 (24 GB) es suficiente.
- En hardware de consumo: sí, es posible ejecutarlo en GPUs de consumo con 24 GB de VRAM usando cuantizaciones Q4 o Q5. Con 16 GB (RTX 4080, 3080 Ti) se podría usar Q4 con contexto reducido.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. También puede usarse con vLLM si se convierte a safetensors, aunque no es el formato principal.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090 con Q4, se podría esperar una generación de 20-40 tokens por segundo para este tamaño, dependiendo de la implementación y el contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa fiable. El modelo base es Gemma 4 31B, pero no se conocen los resultados de benchmarks de esta versión modificada. Se puede comparar con el modelo original de Gemma 4 31B (si existiera una versión pública) o con otros modelos de ~30B como Llama 3.1 30B (no existe), Mistral 31B (no existe), o modelos como Mixtral 8x7B (46.7B totales). Dado que no hay datos verificables, se omite la comparativa.

## Limitaciones y advertencias

- Contenido dañino: el modelo está explícitamente diseñado para eliminar los mecanismos de rechazo y puede generar contenido violento, ilegal, sexual explícito o perjudicial. Su uso conlleva un riesgo elevado de causar daño.
- Sin alineación: no ha sido sometido a procesos de alineación (RLHF, DPO) y carece de filtros de seguridad. Las respuestas pueden ser sesgadas, tóxicas o peligrosas.
- Alucinaciones: como todos los modelos de lenguaje, puede inventar información, especialmente en dominios técnicos o legales.
- Idioma limitado: solo soporta inglés, lo que restringe su uso en otros idiomas.
- Licencia Apache 2.0: aunque permite uso comercial, la naturaleza del modelo y su contenido hacen que su despliegue en producción sea altamente desaconsejable y potencialmente ilegal en muchas jurisdicciones.
- Riesgo de sesgos: al ser una versión sin alineación, los sesgos del modelo base pueden exacerbarse, incluyendo discriminación, lenguaje ofensivo y estereotipos.
- Sin soporte oficial: el autor no ofrece garantías ni soporte técnico. El proyecto se presenta como un experimento de investigación.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF
- Repositorio HuggingFace del modelo base (safetensors): https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3
- Modelo base intermedio: https://huggingface.co/darkc0de/gemma-4-31B-it-updated-heretic
- Perfil de GitHub del autor: https://github.com/dark-c0de
- Documento de referencia citado por el autor (Congress.gov): https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- Página del modelo en FriendliAI: https://friendli.ai/models/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3
- Entrada en LLM Explorer (modelo similar): https://llm-explorer.com/model/darkc0de%2FXortronCriminalComputing,6uQhIjkNWxYGxBugqoBO9W
