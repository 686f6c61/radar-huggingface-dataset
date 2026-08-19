# darkc0de/XORTRON-NXTXPRT10PRO-31B

## Resumen

XORTRON-NXTXPRT10PRO-31B es un modelo de lenguaje de 31.273 millones de parámetros desarrollado por darkc0de como parte del proyecto XORTRON Criminal Computing, un experimento de investigación en seguridad y alineación de IA. Se trata de un fine-tuning del modelo base `darkc0de/gemma-4-31B-it-updated-heretic`, que a su vez deriva de la familia Gemma 4 de Google. El modelo está etiquetado como "uncensored", "harmful", "abliterated" y "toxic", lo que indica que ha sido deliberadamente desprovisto de las restricciones habituales de seguridad y alineación para estudiar el comportamiento de modelos sin salvaguardas.

El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales (procesamiento de imágenes y texto), aunque la model card no ofrece detalles técnicos adicionales. La licencia es Apache 2.0 y el idioma principal es el inglés. Su relevancia radica en que sirve como herramienta de investigación para analizar riesgos de explotación criminal de la IA, como se referencia en un documento del Congreso de los Estados Unidos incluido en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma 4 (arquitectura transformer multimodal, sin detalles adicionales publicados) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `darkc0de/gemma-4-31B-it-updated-heretic`, que a su vez es una variante "heretic" (probablemente abliterated) de Gemma 4 de 31B. No se han publicado detalles sobre la arquitectura interna (número de capas, heads, tipo de atención, etc.) ni sobre el proceso de entrenamiento (número de tokens, composición del dataset, método de alineación). El tag `image-text-to-text` indica que el modelo acepta tanto texto como imágenes como entrada, pero no se especifica el mecanismo de fusión multimodal. Dado el carácter del proyecto (Criminal Computing), el entrenamiento parece orientado a eliminar restricciones de seguridad y alineación, aunque no se documenta el método exacto (posiblemente DPO inverso o abliteration). No se dispone de información sobre datos de entrenamiento ni sobre técnicas innovadoras de decodificación.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), aunque no se detallan las tareas especificas (captioning, VQA, etc.).
- Sin informacion sobre tool calling, function calling o capacidades de agente.
- Sin informacion sobre modo de razonamiento extendido (thinking mode) ni soporte de audio.
- El modelo se describe como "uncensored" y "harmful", lo que implica que puede generar contenido explicito, ofensivo o peligroso sin filtros.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede usarse para estudiar como se comporta un LLM sin alineacion, simulando escenarios de explotacion criminal (phishing, ingenieria social, generacion de malware) en entornos controlados de laboratorio.
- Red teaming de sistemas de moderacion: se puede emplear para generar contenido toxico o dañino y evaluar la robustez de clasificadores de contenido y filtros de seguridad.
- Analisis de riesgos de sesgos y toxicidad: permite medir el impacto de la eliminacion de restricciones en la calidad y etica de las respuestas, comparando con modelos alineados.
- Desarrollo de contramedidas: los resultados de interacciones con este modelo pueden informar el diseño de tecnicas de deteccion de contenido generado por modelos no alineados.
- Educacion y divulgacion: sirve como ejemplo practico en cursos de etica de IA y seguridad, mostrando los peligros de modelos sin salvaguardas.
- Generacion de contenido creativo sin restricciones: para proyectos artisticos o literarios que requieran ausencia de censura, aunque con las advertencias eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se comparan con modelos similares.

## Requisitos de hardware

- El repositorio pesa 62.6 GB, lo que sugiere pesos en fp16 (aproximadamente 2 bytes por parametro para 31.3B parametros).
- VRAM estimada para inferencia: alrededor de 62 GB en fp16, ~31 GB en cuantizacion de 8 bits, ~16 GB en cuantizacion de 4 bits (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: para fp16 se necesita una GPU con al menos 80 GB (A100 80GB, H100 80GB) o multiples GPUs. Con cuantizacion 4-bit podria caber en una RTX 4090 (24 GB) o similar, pero no hay garantias.
- Opciones de despliegue: el tag `text-generation-inference` sugiere compatibilidad con TGI. Tambien podria usarse con vLLM o llama.cpp, aunque no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables en la misma categoria (tamano o tarea). El modelo base Gemma 4 de 31B podria ser una referencia, pero no se dispone de datos de rendimiento para establecer una comparativa.

## Limitaciones y advertencias

- El modelo es deliberadamente "uncensored" y puede generar contenido altamente dañino, ilegal o eticamente problematico. Su uso en produccion o en aplicaciones publicas es desaconsejable y potencialmente peligroso.
- Riesgo elevado de alucinacion y de generar informacion falsa con gran confianza, especialmente en contextos no supervisados.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado evaluaciones de sesgos, toxicidad o robustez, por lo que se desconoce el alcance de sus comportamientos problematicos.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo puede generar responsabilidades legales si se utiliza para fines ilicitos.
- No se dispone de informacion sobre la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.
- El proyecto es experimental y no ofrece garantias de estabilidad, soporte o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Grafo de arquitectura interactivo: https://hfviewer.com/darkc0de/XORTRON-NXTXPRT10PRO-31B
- Organizacion XORTRON en Hugging Face: https://huggingface.co/xortron
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/darkc0de/XORTRON-NXTXPRT10PRO-31B
- GitHub del autor: https://github.com/dark-c0de
- Referencia del proyecto (documento del Congreso de EE.UU.): https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
