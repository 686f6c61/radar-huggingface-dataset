# marafx2007/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF en formato i1-imatrix del modelo `Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS`, una variante "abliterated" (técnica de reducción de rechazos) del modelo multimodal Gemma-4-E4B-IT de Google. El modelo base, desarrollado por KridgeDookie, aplica la técnica de abliteration para eliminar la dirección de rechazo de los pesos, lo que reduce la negativa del modelo a responder a solicitudes que el modelo original podría rechazar por razones de seguridad o alineación. El resultado es un modelo conversacional y multimodal (visión y texto) con licencia Apache 2.0, pensado para ejecución local eficiente mediante GGUF.

El repositorio, cuantizado por mradermacher, ofrece 17 cuantizaciones i1 (imatrix) que van desde IQ1_S (3,4 GB) hasta IQ4_NL (5,3 GB), además de un archivo imatrix para crear cuantizaciones propias. El total de parámetros según los safetensors es de 7.463.013.674, lo que sugiere un modelo de aproximadamente 7.000 millones de parámetros, probablemente con un codificador de visión adicional. El nombre "E4B" podría indicar 4.000 millones de parámetros activos en una arquitectura MoE, pero no hay confirmación en la información disponible. El modelo está diseñado para su uso con llama.cpp, Ollama y otras herramientas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer multimodal, sin confirmar) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL (tambien existen cuantizaciones estaticas en el repositorio de mradermacher) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en la documentacion proporcionada. Se sabe que es un modelo multimodal (vision y texto) de la familia Gemma 4, con un total de 7.463.013.674 parametros. El nombre "E4B" sugiere que podria tratarse de una variante eficiente con 4.000 millones de parametros activos, posiblemente con una arquitectura de mezcla de expertos (MoE), aunque no hay confirmacion explicita. La tecnica de abliteration aplicada elimina la direccion de rechazo de los pesos, un metodo que consiste en identificar y restar la componente de los pesos asociada a comportamientos de rechazo, reduciendo asi la probabilidad de que el modelo se niegue a responder. No se han publicado datos sobre el entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: al ser una variante "IT" (instruction tuned), esta optimizado para dialogos multi-turno y seguimiento de instrucciones.
- Comprension multimodal: soporta entrada de imagenes junto con texto, lo que permite tareas de vision-lenguaje como descripcion de imagenes, respuesta a preguntas visuales y analisis de contenido grafico.
- Reduccion de rechazos: la abliteration reduce la negativa a responder a solicitudes que el modelo original podria rechazar, lo que permite respuestas mas abiertas en temas sensibles o controvertidos.
- Soporte de tool calling: no especificado en la informacion disponible, aunque los modelos Gemma 4 suelen incluir esta capacidad.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Sin modo thinking explicito: no se menciona un modo de razonamiento extendido o "thinking mode".

## Casos de uso

- Roleplay y narrativa creativa sin restricciones: el modelo puede mantener personajes y tramas complejas sin romper el hilo por rechazos, gracias a su naturaleza abliterated. Es adecuado para juegos de rol textuales y escritura de ficcion interactiva.
- Generacion de contenido para novelas y guiones: permite explorar temas oscuros, violencia o sexualidad sin censura previa, util para autores que necesitan borradores sin filtros editoriales.
- Analisis de imagenes con menos limitaciones: al ser multimodal, puede describir o interpretar imagenes que otros modelos rechazarian por contenido inapropiado, aunque con los riesgos asociados.
- Experimentacion en investigacion sobre alineacion y seguridad: sirve como caso de estudio para comparar el comportamiento de modelos abliterated frente a los originales en tareas de seguimiento de instrucciones y sesgos.
- Despliegue local en entornos con requisitos estrictos de privacidad: al ser GGUF, puede ejecutarse en local con llama.cpp u Ollama, sin enviar datos a servidores externos, manteniendo el control total sobre las respuestas.
- Creacion de asistentes virtuales personalizados: para usuarios que prefieren un asistente sin restricciones de contenido, aunque con la responsabilidad de gestionar los riesgos de respuestas inapropiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano de los archivos GGUF, las cuantizaciones mas bajas (IQ1_S, 3,4 GB) pueden ejecutarse en GPUs con 4-6 GB de VRAM, mientras que las mas altas (IQ4_NL, 5,3 GB) requieren al menos 8 GB. Se recomienda un minimo de 8 GB de VRAM para un rendimiento aceptable con las cuantizaciones intermedias.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o superiores. Tambien compatible con GPUs de Apple Silicon (M1/M2/M3) mediante Metal.
- Si cabe en consumer GPU: si, la mayoria de las cuantizaciones caben en GPUs de consumo con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), entre otros.
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos abliterated de tamano similar en la informacion proporcionada. Sin embargo, el modelo se enmarca en la categoria de LLMs locales sin censura, comparable a variantes como Gemma 4 Heretic o Qwen 3.6 abliterated, aunque sin datos concretos de rendimiento o parametros para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo abliterated, puede generar contenido sesgado, ofensivo o perjudicial sin los filtros de seguridad habituales. No se ha evaluado su comportamiento en este aspecto.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en temas especializados o con contexto limitado.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Limitaciones de idioma: solo soporta ingles, lo que restringe su uso en otros idiomas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base deriva de Gemma 4, cuyos terminos de uso pueden imponer condiciones adicionales. Se recomienda revisar la licencia de Gemma 4 en el enlace proporcionado.
- Caveat para produccion: al ser una cuantizacion, puede haber perdida de calidad respecto al modelo original en bfloat16. Ademas, la naturaleza "uncensored" lo hace inadecuado para aplicaciones donde se requiera cumplimiento normativo o politicas de contenido estrictas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Modelo base: https://huggingface.co/KridgeDookie/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Cuantizaciones estaticas (mradermacher): https://huggingface.co/mradermacher/Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-GGUF
- Pagina de descarga y vision general: https://hf.tst.eu/model#Gemma-4-E4B-IT-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
