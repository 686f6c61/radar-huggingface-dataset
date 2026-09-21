# botp/Altworld_Hemmingway-1-GGUF

## Resumen

Altworld_Hemmingway-1-GGUF es la version cuantizada en formato GGUF del modelo Altworld/Hemmingway-1, un modelo de generacion de texto de aproximadamente 27.320 millones de parametros orientado a chat y escritura creativa. La cuantizacion la firma bartowski, segun se desprende de la model card del repositorio, y el artefacto aparece publicado bajo la cuenta botp, lo que apunta a una redistribucion del paquete original de bartowski. El modelo base esta desarrollado por Altworld y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales declaradas.

El interes practico de esta ficha reside en que el repositorio ofrece un conjunto muy amplio de cuantizaciones (desde bf16 completo de 54,66 GB hasta variantes IQ de menos de 13 GB), lo que permite ejecutar un modelo de casi 27B en hardware de consumo con llama.cpp. Ademas, la model card declara soporte de decodificacion especulativa mediante MTP (multi-token prediction) y cuantizacion con imatrix, dos elementos que afectan directamente a la latencia y a la calidad percibida en inferencia local.

La informacion publica disponible es limitada: no se documentan resultados de benchmarks, no se especifica la longitud de contexto y no se detalla la composicion del dataset de entrenamiento. El unico idioma declarado es el ingles. Los tags del repositorio incluyen la etiqueta "qwen3.8", lo que sugiere una base de la familia Qwen, pero este dato no se confirma en el texto de la model card y por tanto se trata como indicio, no como hecho verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags del repositorio incluyen "qwen3.8", sin confirmacion en la model card) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS (lista parcial; el repositorio incluye mas variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original, no en este repositorio) |

Datos adicionales del repositorio: tamano total del repo 444,9 GB; creado y actualizado el 21 de septiembre de 2026; 0 descargas y 0 likes en el momento de la consulta; pipeline text-generation; herramienta de cuantizacion llama.cpp release b10964.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Altworld/Hemmingway-1. La model card de la cuantizacion no describe el tipo de transformer, el mecanismo de atencion, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). El unico dato estructural declarado es el recuento de parametros, 27B, y el soporte de entrada exclusivamente de texto. El tag "qwen3.8" presente en los metadatos sugiere un linaje compatible con la familia Qwen, pero no hay confirmacion textual de ello.

Lo que si esta documentado en la model card son dos caracteristicas tecnicas del proceso de cuantizacion. La primera es el uso de imatrix (importance matrix), una tecnica de llama.cpp que calibra la precision de los pesos en funcion de su importancia medida sobre un corpus de calibracion, mejorando la calidad de las cuantizaciones agresivas. La segunda es el soporte de decodificacion especulativa mediante MTP (multi-token prediction), que permite al modelo predecir varios tokens por paso y validarlos despues, reduciendo la latencia en generacion autoregresiva cuando se ejecuta con llama.cpp.

El formato de prompt documentado sigue la convencion de tokens especiales `<|im_start|>` y `<|im_end|>` con roles system, user y assistant, y arranca la respuesta del asistente con la etiqueta `<think>`, lo que indica un modo de razonamiento explicito previo a la respuesta final. El prompt de sistema de ejemplo fija el esfuerzo de razonamiento en "xhigh" y pide validar supuestos y priorizar correccion y claridad.

## Capacidades

- Generacion de texto conversacional y orientada a escritura creativa, segun los tags "chat" y "creative-writing" del repositorio.
- Razonamiento explicito en modo thinking: el formato de prompt abre un bloque `<think>` antes de la respuesta final.
- Ajuste de esfuerzo de razonamiento mediante prompt de sistema (el ejemplo documentado usa "xhigh").
- Soporte de decodificacion especulativa con MTP en llama.cpp, orientado a reducir latencia.
- Procesamiento de entrada exclusivamente de texto (input support: text); no se declara vision ni audio.
- Conversacion multi-turno mediante el formato de roles system/user/assistant.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso mas alla del bloque de pensamiento.
- Capacidad multilingue limitada al ingles segun el campo de idiomas declarado.

## Casos de uso

- Escritura creativa asistida: el modelo esta etiquetado explicitamente como "creative-writing" y su bloque de razonamiento previo permite generar narrativa con coherencia argumental antes de redactar, util para relatos, guiones o borradores de novela.
- Chat conversacional local: con las cuantizaciones Q4_K_M (17,44 GB) o Q4_K_S (16,36 GB) se puede desplegar un asistente conversacional en una estacion de trabajo con una sola GPU de 24 GB, sin dependencia de APIs externas.
- Reescritura y edicion de estilo: el modelo, asociado al nombre "Hemmingway", encaja en tareas de simplificacion y reescritura de prosa; se le puede pedir reformular textos manteniendo el significado y reduciendo la complejidad sintactica.
- Generacion de contenido editorial en ingles: blogs, newsletters y documentacion en ingles, aprovechando el unico idioma declarado y evitando riesgos de mezcla linguistica.
- Prototipado de aplicaciones de texto con llama.cpp: al estar en formato GGUF y vectorizado con imatrix, es adecuado para integrarse en aplicaciones de escritorio o servidores ligeros que usan llama.cpp como backend de inferencia.
- Despliegue con decodificacion especulativa MTP: en escenarios interactivos donde la latencia por token importa (autocompletado, asistentes en tiempo real), activar MTP permite ganar velocidad sin cambiar el modelo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte variantes de cuantizacion con tamanos documentados, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad entre Q8_0 y las variantes IQ de 3 bits.
- Generacion de texto offline en entornos aislados: al ser un artefacto local con licencia Apache 2.0, se puede ejecutar en equipos sin conectividad y sin restricciones de uso comercial declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Los tamanos de archivo declarados son bf16 54,66 GB; Q8_0 29,12 GB; Q6_K_L 24,96 GB; Q6_K 23,86 GB; Q6_K_S 22,86 GB; Q5_K_M 20,92 GB; Q5_K_S 19,57 GB; Q4_K_L 18,82 GB; Q4_1 17,83 GB; Q4_K_M 17,44 GB; IQ4_NL 17,44 GB; Q4_K_S 16,36 GB; Q4_0 16,35 GB; IQ4_XS 15,48 GB; IQ3_M 14,86 GB; Q3_K_L 14,12 GB; Q3_K_M 13,40 GB; IQ3_XS 12,80 GB; Q3_K_S 12,74 GB. Hay que sumar a estos tamanos la cache KV y el overhead del runtime, por lo que la VRAM necesaria es superior al tamano del archivo.
- GPU recomendadas: para bf16 y Q8_0 hacen falta GPUs de 80 GB o configuraciones multi-GPU (A100 80 GB, H100 80 GB). Para las cuantizaciones Q6 y Q5, una GPU de 48 GB (A6000, L40S) resulta comoda. Para Q4_K_M y Q4_K_S, una RTX 4090 o RTX 3090 de 24 GB es suficiente en la mayoria de configuraciones.
- Si cabe en GPU de consumo: si. Las cuantizaciones de 4 bits (17,44 GB en Q4_K_M, 16,36 GB en Q4_K_S, 15,48 GB en IQ4_XS) entran en tarjetas de 24 GB y, con contexto reducido, incluso en modelos de 16 GB. Las variantes IQ3 y Q3 (12,74 a 14,86 GB) permiten despliegue parcial o total en GPUs de 16 GB o en equipos con 32 GB de RAM mediante offload de capas a CPU.
- Opciones de despliegue: llama.cpp (release b10964 es la usada para la cuantizacion), y cualquier runtime compatible con GGUF derivado de el, como Ollama, LM Studio, kobold.cpp o llama-cpp-python. No se documenta compatibilidad con vLLM o TGI, que trabajan con safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card solo indica que el modelo soporta decodificacion especulativa MTP, sin cifras de tokens por segundo.
- Nota de almacenamiento: el repositorio completo ocupa 444,9 GB, por lo que conviene descargar unicamente el archivo de cuantizacion necesario en lugar de clonar todo el repositorio.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni referencias a modelos comparables de la misma categoria, tamano o tarea.

## Limitaciones y advertencias

- Idiomas: el unico idioma declarado es el ingles. El uso en castellano u otros idiomas no esta soportado oficialmente y probablemente degrade la calidad.
- Contexto: no se especifica la longitud de contexto del modelo base, por lo que no se puede garantizar un rendimiento estable en conversaciones o documentos largos sin pruebas previas.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni filtrado de contenido en la informacion disponible, y el modelo base no incluye una model card detallada en los datos suministrados.
- Alucinacion: no hay datos publicados de tasas de alucinacion ni de evaluaciones de veracidad. El prompt de sistema documentado pide explicitamente "validar supuestos", lo que sugiere que el autor reconoce riesgo de error en razonamientos.
- Usos sensibles: el modelo esta etiquetado como "creative-writing" y sin filtros declarados; conviene aplicar moderacion propia si se expone a usuarios finales.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero obliga a conservar el aviso de licencia y a no atribuir responsabilidad a los autores. No se declaran restricciones adicionales.
- Trazabilidad del artefacto: el repositorio aparece publicado bajo la cuenta "botp" mientras que la model card se atribuye a bartowski como autor de la cuantizacion. Conviene verificar el origen antes de usarlo en produccion.
- Rendimiento por cuantizacion: no hay evaluaciones comparativas publicadas de las distintas variantes, por lo que la eleccion entre Q4_K_M, IQ4_XS o las variantes de 3 bits debe validarse con pruebas propias.
- Decodificacion especulativa: el soporte de MTP depende de que el runtime de llama.cpp lo implemente correctamente en la version utilizada; no se garantiza en otros backends.
- Estado del repositorio: registra 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/botp/Altworld_Hemmingway-1-GGUF
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Repositorio de cuantizacion referenciado en la model card: https://huggingface.co/bartowski/Altworld_Hemmingway-1-GGUF
- Archivo recomendado Q4_K_M: https://huggingface.co/bartowski/Altworld_Hemmingway-1-GGUF/blob/main/Altworld_Hemmingway-1-Q4_K_M.gguf
- llama.cpp, release b10964 usada para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b10964
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
