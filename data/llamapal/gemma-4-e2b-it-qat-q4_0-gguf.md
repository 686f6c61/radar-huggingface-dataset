# LlamaPal/gemma-4-E2B-it-QAT-Q4_0-GGUF

## Resumen

Gemma 4 E2B es el modelo móvil de la familia Gemma 4 de Google, distribuido en este repositorio como una copia espejo sin modificaciones del fichero GGUF oficial `gemma-4-E2B_q4_0-it.gguf`. El repositorio, publicado por LlamaPal, no introduce cambios en los pesos: mantiene los mismos bytes y el mismo hash SHA-256 (`fa401b55b07ee70a54c6dae3903c783a6e65064312529ea57175cb5f8dec6634`) que el artefacto original de Google. El modelo cuenta con 4.628.569.635 parámetros totales y un tamaño de fichero de 3,3 GB en cuantización Q4_0.

La relevancia de esta ficha radica en que se trata de una build con quantización consciente del entrenamiento (QAT) generada por Google, pensada para mantener una calidad cercana al modelo completo en 4 bits. Incorpora modo de razonamiento (thinking mode), una ventana de contexto de 128K tokens y soporte amplio de idiomas, todo en un tamaño manejable para dispositivos Android y para inferencia local en hardware modesto.

El repositorio funciona como canal de distribución del modelo para la aplicación LlamaPal, una app de chat offline para Android. Para cualquier uso fuera de esa aplicación, el artefacto es un GGUF estándar cargable en llama.cpp y en cualquier runtime compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Gemma 4; detalles no presentes en la informacion) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Q4_0 (QAT, generada por Google) |
| Idiomas soportados | no disponible (la model card menciona "soporte amplio de idiomas" sin listarlos) |
| Licencia | Apache 2.0 (enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (`gemma-4-E2B_q4_0-it.gguf`, 3,3 GB) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos en la informacion proporcionada: la model card no describe el tipo de transformer, la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico documentado es que se trata de un modelo de la familia Gemma 4 de Google, orientado a dispositivos moviles, con una build oficial de quantizacion consciente del entrenamiento (QAT) en Q4_0.

La innovacion tecnica destacable es precisamente esa QAT: el modelo se entrena teniendo en cuenta la cuantizacion a 4 bits, de modo que la version Q4_0 conserva una calidad cercana a la del modelo sin cuantizar (identificado como `google/gemma-4-E2B-it-qat-q4_0-unquantized`). El modelo incorpora ademas un modo de razonamiento explicito (thinking mode) y una ventana de contexto de 128K tokens.

## Capacidades

- Generacion de texto conversacional (el tag `conversational` y el sufijo `-it` indican ajuste para instrucciones y dialogo).
- Modo de razonamiento (thinking mode), segun la model card.
- Pipeline declarado como `any-to-any`, lo que sugiere capacidades multimodales de entrada y salida; el detalle concreto de modalidades no esta disponible en la informacion.
- Ventana de contexto de 128K tokens, adecuada para conversaciones largas y documentos extensos.
- Soporte multilingue amplio segun la model card, aunque sin listado de idiomas.
- Inferencia totalmente offline en dispositivo, sin conexion a internet ni cuenta de usuario.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni comportamiento agentico multi-paso.

## Casos de uso

- Chat privado en Android: el modelo se ejecuta dentro de la app LlamaPal sin conexion, de modo que nada de lo que escribe el usuario sale del telefono. Es adecuado por su tamano de 3,3 GB y su naturaleza offline.
- Asistente personal sin conectividad: en entornos sin red (vuelo, zonas rurales, entornos aislados) el modelo puede responder consultas y mantener conversaciones multi-turno gracias a los 128K tokens de contexto.
- Procesamiento de documentos largos en local: la ventana de 128K permite resumir o consultar textos extensos sin enviarlos a un servicio en la nube.
- Prototipado rapido con llama.cpp: al ser un GGUF estandar, se puede cargar en llama.cpp y en cualquier aplicacion construida sobre el para experimentar con un modelo de ~4,6B parametros en hardware de gama media.
- Aplicaciones de escritorio con requisitos de privacidad: integrable en herramientas de escritorio que necesiten inferencia local sin dependencia de APIs externas.
- Educacion y demos de IA en dispositivo: util para mostrar inferencia LLM en moviles en talleres, clases o demostraciones tecnicas.
- Traduccion y asistencia multilingue offline: la model card menciona soporte amplio de idiomas, lo que habilita tareas de traduccion o redaccion sin conexion, aunque el listado exacto de idiomas no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_0 ocupa 3,3 GB; se recomienda disponer de al menos 4-5 GB de memoria libre para cargar el modelo y gestionar el contexto.
- GPU recomendadas: no disponibles en la informacion. Al ser un modelo movil de ~4,6B parametros en 4 bits, es plausible su ejecucion en GPUs de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: no confirmado en la informacion; el enfasis del autor es la ejecucion en telefonos Android.
- Opciones de despliegue: llama.cpp y cualquier aplicacion basada en el; la app LlamaPal para Android. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos; como todo LLM, es probable que herede sesgos de sus datos de entrenamiento, pero no hay documentacion al respecto en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas.
- El listado de idiomas soportados no esta disponible, lo que impide garantizar calidad en un idioma concreto sin evaluacion previa.
- Aunque el repositorio declara licencia Apache 2.0, la model card enlaza a la licencia especifica de Gemma 4 de Google (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los terminos reales antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- Este repositorio es un espejo sin modificaciones: no hay garantia de mantenimiento ni soporte por parte de LlamaPal, y la fuente autoritativa es el repositorio oficial de Google.
- El pipeline `any-to-any` sugiere multimodalidad, pero no se detallan las modalidades concretas soportadas; no asumir vision o audio sin verificacion.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LlamaPal/gemma-4-E2B-it-QAT-Q4_0-GGUF
- Repositorio oficial del GGUF: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
