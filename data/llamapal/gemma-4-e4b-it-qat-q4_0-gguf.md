# LlamaPal/gemma-4-E4B-it-QAT-Q4_0-GGUF

## Resumen

Gemma 4 E4B es un modelo de lenguaje de Google presentado en este repositorio como una copia espejo del fichero GGUF cuantizado Q4_0 generado por el propio Google mediante *quantization-aware training* (QAT). El repositorio, publicado por LlamaPal, no modifica los pesos: replica byte a byte el fichero `gemma-4-E4B_q4_0-it.gguf` del repositorio oficial `google/gemma-4-E4B-it-qat-q4_0-gguf` en el commit `4b4a2c1d584b`, con el mismo hash SHA-256. Su razon de ser es servir como origen de descarga para la aplicacion movil LlamaPal, un cliente de chat offline para Android.

El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`, una variante instruida (sufijo `it`) de la familia Gemma 4, en su version pequena E4B. Segun los metadatos de safetensors, el modelo cuenta con 7.463.013.674 parametros totales, lo que lo situa en la gama de 7-8 mil millones de parametros. La model card del espejo menciona soporte de modo de razonamiento (*thinking mode*), codigo y una ventana de contexto de 128K tokens, aunque estos datos provienen del texto promocional del autor y no de una ficha tecnica detallada.

La relevancia de esta publicacion es practica: ofrece un artefacto GGUF listo para ejecutarse en llama.cpp y en cualquier aplicacion basada en el, con licencia Apache 2.0 y orientado a inferencia en dispositivo (telefonos Android) sin conexion. No obstante, al tratarse de un espejo con cero descargas y cero interacciones en el momento de la consulta, su interes tecnico reside en el modelo original de Google, no en este repositorio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Gemma 4; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (segun la model card del espejo) |
| Tipos de cuantizacion | Q4_0 (GGUF), generada mediante quantization-aware training (QAT) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-E4B_q4_0-it.gguf`, 5,2 GB) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos especificos en la informacion proporcionada. Por los metadatos se sabe que es un modelo de la familia Gemma 4, en su variante E4B e instruida (`it`), con 7.463.013.674 parametros totales. El pipeline declarado es `any-to-any`, lo que sugiere capacidades multimodales de entrada y salida, aunque no se especifica que modalidades concretas cubre ni como se implementan.

El aspecto tecnico destacable es el proceso de cuantizacion: los pesos no son una cuantizacion post-entrenamiento aplicada por un tercero, sino el resultado de un entrenamiento consciente de la cuantizacion (QAT) realizado por Google, que produce directamente un modelo de 4 bits (`q4_0`). El repositorio espejo solo empaqueta ese resultado en GGUF. No se han publicado en la informacion disponible datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo chat (pipeline `conversational`).
- Modo de razonamiento (*thinking mode*), segun la model card del espejo.
- Generacion de codigo, descrita como "strong coding" en la model card.
- Procesamiento multimodal de tipo `any-to-any` segun el pipeline declarado, sin detalle de modalidades.
- Ventana de contexto de 128K tokens, adecuada para conversaciones largas y documentos extensos.
- Inferencia offline en dispositivo movil, sin conexion ni cuenta de usuario.
- Compatibilidad con llama.cpp y aplicaciones construidas sobre el.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Chat privado en Android sin conexion: el modelo se ejecuta localmente mediante LlamaPal o llama.cpp, de modo que ninguna consulta sale del dispositivo. Es adecuado por su tamano contenido (5,2 GB en Q4_0) y su licencia permisiva.
- Asistente de codigo en movil: gracias a la capacidad de generacion de codigo y al modo de razonamiento, puede usarse para resolver dudas de sintaxis o generar fragmentos pequenos en un telefono, sin depender de la nube.
- Procesamiento de documentos largos en dispositivo: la ventana de 128K tokens permite resumir o consultar documentos extensos en local, siempre que el telefono disponga de memoria suficiente.
- Prototipado rapido con llama.cpp: al ser un GGUF estandar, sirve para probar el modelo en portatiles y estaciones de trabajo antes de integrarlo en una aplicacion mayor.
- Aplicaciones de campo sin conectividad: entornos con red limitada (obra, campo, zonas rurales) donde se necesita un asistente conversacional que funcione sin internet.
- Base para experimentacion con cuantizacion QAT: util para investigadores que quieran comparar el comportamiento de un modelo Q4_0 nativo frente a cuantizaciones post-entrenamiento equivalentes.
- Integracion en aplicaciones Android de terceros basadas en llama.cpp: cualquier app que cargue GGUF puede reutilizar este fichero como modelo por defecto para chat offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB para el fichero Q4_0, mas overhead de contexto (los 128K tokens de contexto requieren memoria adicional significativa, no cuantificada en la informacion disponible).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabe en GPUs de consumo con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8 GB o mas de VRAM; en moviles Android depende de la RAM disponible, que la model card describe como requisito para "telefonos con algo mas de memoria".
- Opciones de despliegue: llama.cpp y cualquier aplicacion basada en el, incluida la app LlamaPal en Android. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa rigurosa con cifras. Como referencia estructural, este modelo se situa en la categoria de modelos de ~7-8 mil millones de parametros cuantizados a 4 bits para inferencia en dispositivo, pero no se han facilitado datos de modelos comparables (parametros, contexto, rendimiento, licencia) que permitan una tabla fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Gemma 4 E4B (este repo, Q4_0 GGUF) | 7.463.013.674 | 128K | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones; no aporta garantias adicionales sobre el modelo original de Google.
- La model card del espejo es promocional y escasa en detalles tecnicos: no hay informacion sobre composicion del dataset, sesgos ni evaluaciones.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idiomas soportados no especificados; el rendimiento fuera del ingles (y posiblemente de los idiomas principales de Gemma) no esta documentado.
- La cuantizacion Q4_0 implica una perdida de calidad respecto a los pesos sin cuantizar, aunque el QAT de Google busca minimizarla; no se han publicado metricas de esa perdida.
- El contexto de 128K tokens puede requerir memoria muy superior a la del fichero (5,2 GB), lo que limita su uso real en telefonos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el enlace de licencia oficial de Google (`ai.google.dev/gemma/docs/gemma_4_license`) por si impone terminos adicionales de uso aceptable.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/gemma-4-E4B-it-QAT-Q4_0-GGUF
- Modelo base (unquantized): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Repositorio oficial GGUF de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Commit de origen del fichero: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf/tree/4b4a2c1d584be7264f87aac328a1bc739ce81b6c
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
