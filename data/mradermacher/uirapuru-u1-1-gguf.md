# mradermacher/Uirapuru-U1.1-GGUF

## Resumen

Uirapuru-U1.1-GGUF es una colección de cuantizaciones GGUF del modelo de lenguaje Uirapuru-U1.1, desarrollado originalmente por SynastriaNetworks y cuantizado por mradermacher para facilitar su ejecución local en hardware de consumo. El modelo base cuenta con aproximadamente 9.200 millones de parámetros (9.197.093.888), lo que lo sitúa en la categoría de modelos de tamaño medio, y está diseñado para tareas conversacionales y de generación de texto en portugués e inglés. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones empresariales.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar el modelo en entornos locales mediante formatos GGUF, con múltiples niveles de cuantización que se adaptan a diferentes capacidades de hardware. Además, la presencia de archivos `mmproj` (multi-modal supplement) sugiere que el modelo base podría tener capacidades multimodales, aunque no se proporcionan detalles adicionales al respecto. Es una opción a considerar para desarrolladores que necesiten un modelo bilingüe (portugués-inglés) con licencia permisiva y posibilidad de ejecución en GPU de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base SynastriaNetworks/Uirapuru-U1.1. Los datos disponibles se limitan a la cuantizacion realizada por mradermacher, que convierte los pesos originales (probablemente en formato safetensors) a GGUF para su uso con llama.cpp, Ollama y otras herramientas compatibles. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. La unica referencia indirecta proviene de una busqueda web que menciona "qwen3.5 post-training instruction-tuned", pero no es concluyente para este modelo concreto.

La cuantizacion se realizo de forma estatica (sin imatrix), segun indica el autor. Se incluyen archivos `mmproj` (proyeccion multimodal) en Q8_0 y f16, lo que sugiere que el modelo base podria aceptar entradas de imagen, aunque no se confirma en la documentacion.

## Capacidades

- Generacion de texto y conversacion multilingue en portugues e ingles.
- Posible soporte multimodal (vision) gracias a los archivos `mmproj` incluidos, aunque no se documenta su funcionamiento.
- Compatible con herramientas de inferencia local como llama.cpp, Ollama y servidores compatibles con GGUF.
- Disenado para tareas conversacionales, segun los tags de HuggingFace ("conversational").
- No se confirman capacidades especificas como tool calling, razonamiento avanzado o generacion de codigo, al no estar documentadas en la informacion disponible.

## Casos de uso

- Atencion al cliente bilingue: el modelo puede gestionar conversaciones en portugues e ingles, lo que lo hace adecuado para empresas con operaciones en Brasil y paises de habla inglesa. Su licencia Apache 2.0 permite su integracion en sistemas comerciales sin coste de licencia.
- Generacion de contenido localizado: creacion de articulos, descripciones de productos o publicaciones en redes sociales en portugues e ingles, aprovechando su capacidad multilingue.
- Asistente virtual en dispositivos con recursos limitados: gracias a las cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en una GPU con 6-8 GB de VRAM, lo que permite desplegar asistentes locales en equipos de gama media.
- Traduccion automatica informal: aunque no se especifica su rendimiento en traduccion, al ser bilingue puede utilizarse para tareas de traduccion basica entre portugues e ingles en contextos no criticos.
- Prototipado rapido de aplicaciones de NLP: los desarrolladores pueden descargar una cuantizacion pequeña (Q2_K o Q3_K) para validar ideas y luego escalar a cuantizaciones mayores si es necesario.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo local, permite procesar datos sensibles sin enviarlos a servidores externos, cumpliendo con politicas de privacidad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (4.0 GB): puede ejecutarse en GPUs con 4-5 GB de VRAM (por ejemplo, GTX 1650, RTX 3050).
  - Q4_K_M (5.9 GB): recomendado para GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060).
  - Q8_0 (9.9 GB): requiere GPUs con 10-12 GB de VRAM (RTX 3080, RTX 4070 Ti).
  - f16 (18.5 GB): solo en GPUs profesionales o de gama alta (A100, RTX 4090).
- GPU recomendadas: RTX 3060 (12 GB) para cuantizaciones Q4/Q5, RTX 4090 para Q8_0 o f16.
- Si cabe en consumer GPU: si, con cuantizaciones Q2 a Q6 en GPUs de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptadores GGUF), o servidores compatibles con el formato GGUF.
- Latencia y throughput: no se dispone de datos medidos; dependen de la cuantizacion, el hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa tecnica con otros modelos de tamano similar (por ejemplo, Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B). No hay datos de benchmarks ni de arquitectura del modelo base. La unica diferencia clara es la licencia Apache 2.0, que es mas permisiva que la de algunos competidores (por ejemplo, Llama tiene licencia propia con restricciones). Se recomienda consultar el modelo base para obtener mas detalles.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La cuantizacion puede degradar la calidad de las respuestas, especialmente en cuantizaciones bajas (Q2_K, Q3_K). Se recomienda usar Q4_K_M o superior para tareas criticas.
- No se confirma la capacidad multimodal real; los archivos `mmproj` estan presentes pero no documentados.
- El modelo solo cubre portugues e ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La fecha de creacion (2026-08-18) es posterior a la fecha actual, lo que sugiere que el modelo podria ser experimental o estar en fase de evaluacion.
- No hay informacion sobre el proceso de entrenamiento ni sobre posibles riesgos de seguridad especificos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uirapuru-U1.1-GGUF
- Modelo base: https://huggingface.co/SynastriaNetworks/Uirapuru-U1.1
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
