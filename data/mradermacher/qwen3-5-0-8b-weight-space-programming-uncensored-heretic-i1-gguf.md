# mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic`, un derivado de la familia Qwen3.5 de 0,8 mil millones de parametros (772.845.888 exactamente, segun los pesos en safetensors) que ha sido modificado mediante dos tecnicas superpuestas: "weight-space programming" y "heretic" (abliteration o decensurado). El resultado es un modelo de lenguaje conversacional en ingles con la censura de seguridad parcial o totalmente eliminada, orientado a experimentacion e investigacion sobre alineamiento y modificacion de pesos.

El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos comunitarios, que en este caso genera variantes con calibracion imatrix (prefijo `i1-`) para mejorar la relacion tamano/calidad en cuantizaciones de baja precision. El modelo base lo firma el usuario xtools-at. La licencia declarada es Apache 2.0 y el unico idioma soportado oficialmente es el ingles.

El interes practico de esta ficha es doble: por un lado, documenta un modelo extremadamente ligero (menos de 1 GB en cuantizaciones Q4) que puede ejecutarse en CPU o en GPU de consumo muy baja; por otro, advierte de que se trata de un modelo sin filtros de seguridad, con las implicaciones eticas y legales que ello conlleva. No se dispone de informacion publica sobre arquitectura interna detallada, contexto o datos de entrenamiento mas alla de lo que indica la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5 y su naturaleza de transformer causal para generacion de texto. El tamano de 772,8 millones de parametros lo situa en la gama ultraligera, adecuada para inferencia en dispositivos con recursos limitados.

El aspecto mas relevante del linaje es el proceso de modificacion: el modelo base ha sido sometido a "weight-space programming", una tecnica de edicion directa de pesos que permite alterar comportamientos sin reentrenamiento completo, y a "heretic", un procedimiento de abliteration que elimina o atenua la direccion de rechazo aprendida durante el alineamiento. El resultado es un modelo "uncensored/decensored/abliterated". No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. Las cuantizaciones de mradermacher emplean calibracion imatrix (importancia de pesos por matriz) para reducir la perdida de calidad en precisiones bajas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo Qwen3.5 subyacente.
- Generacion de codigo y tareas de texto general, aunque limitada por el reducido numero de parametros.
- Modelo marcado como compatible con endpoints (tag `endpoints_compatible`).
- Sin filtros de seguridad efectivos: el proceso heretic/abliteration elimina las negativas a peticiones que el modelo original rechazaria.
- Capacidad multimodal: la model card indica que es un modelo de vision y que los ficheros `mmproj` (proyector multimodal) estarian en el repositorio estatico, aunque no se confirma su disponibilidad en este repositorio de cuantizaciones.
- No se documenta soporte explicito de tool calling ni de razonamiento multi-paso con agentes.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como la abliteration afecta a la distribucion de respuestas y a las metricas de rechazo, comparando el modelo heretic con el original.
- Experimentacion con edicion de pesos: util como banco de pruebas para validar tecnicas de weight-space programming en un modelo pequeno antes de aplicarlas a modelos mayores.
- Inferencia en dispositivos de bajos recursos: con cuantizaciones Q4 de aproximadamente 0,6 GB, puede ejecutarse en Raspberry Pi, moviles de gama alta o portatiles sin GPU dedicada.
- Prototipado rapido de chatbots: sirve para validar pipelines de conversacion y formateo de prompts antes de migrar a modelos mayores, gracias a su baja latencia en CPU.
- Generacion de texto sin restricciones en entornos controlados: util para pruebas de red teaming y evaluacion de filtros de contenido en sistemas de moderacion.
- Educacion y divulgacion: ejemplo didactico de cuantizacion GGUF con imatrix y de las diferencias entre cuantizaciones K-quant e IQ-quant.
- Fine-tuning ligero y destilacion: al ser un modelo de 0,8B, es viable ajustarlo en una unica GPU de consumo para tareas especificas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-0,7 GB para cuantizaciones Q2-Q4; alrededor de 0,7 GB para Q5-Q6. El modelo completo en safetensors (fp16) ocuparia en torno a 1,5 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Ejecutable en CPU pura con llama.cpp, con latencias de decenas de milisegundos por token en procesadores modernos.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI (el tag `endpoints_compatible` lo sugiere).
- Throughput y latencia exactos: no disponibles; dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic (i1-GGUF) | 772,8 M | no disponible | Apache 2.0 | Version abliterated, solo ingles, cuantizaciones imatrix |
| Qwen3.5-0.8B (base original) | ~0,8 B | no disponible | Apache 2.0 (segun familia) | Con filtros de seguridad, multilingue |
| Llama 3.2 1B Instruct | 1,24 B | 128 K | Llama 3.2 Community License | Multilingue, con alineamiento estandar |
| Gemma 2 2B | 2,6 B | 8 K | Gemma Terms of Use | Mayor calidad, requiere mas recursos |

La comparacion directa con el modelo base es la mas informativa: este repositorio se diferencia por la eliminacion de filtros y por el formato GGUF optimizado, no por mejoras de capacidad. Frente a Llama 3.2 1B o Gemma 2 2B, el modelo aqui descrito es mas pequeno y ligero, pero carece de garantias de seguridad y de soporte multilingue declarado.

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido ofensivo, ilegal o peligroso; no debe desplegarse en aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: con menos de 800 millones de parametros, la fiabilidad factica es limitada y las respuestas pueden ser incoherentes en tareas complejas.
- Solo ingles: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se debe asumir una ventana larga; conviene verificar la configuracion del tokenizador del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre las implicaciones legales del contenido generado.
- El proceso de abliteration puede degradar capacidades generales (razonamiento, instrucciones) ademas de eliminar los rechazos.
- La model card no documenta sesgos especificos; al derivar de un modelo entrenado principalmente con datos en ingles, es probable que herede sesgos culturales y linguisticos de ese corpus.
- La capacidad de vision no esta confirmada en este repositorio: los ficheros `mmproj` se remiten al repositorio estatico y podrian no estar disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
