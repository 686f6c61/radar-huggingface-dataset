# Riyan200324200324/gemma-4-26B-A4B-uncensored-GGUF

## Resumen

Esta ficha describe `Riyan200324200324/gemma-4-26B-A4B-uncensored-GGUF`, una distribucion en formato GGUF del modelo ajustado `llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic`, que a su vez deriva de la familia Gemma 4 de Google DeepMind en su variante 26B A4B (25.233.142.046 parametros totales, aproximadamente 4.000 millones activos por token segun la nomenclatura A4B). El modelo es un transformer multimodal con arquitectura de mezcla de expertos (MoE) que acepta texto e imagenes como entrada y genera texto.

Su rasgo definitorio no es arquitectonico sino de alineacion: se trata de una version "abliterated", "decensored" y "heretic", es decir, un ajuste que elimina deliberadamente los comportamientos de rechazo del modelo instruct original. Esto lo orienta a investigacion sobre seguridad y alineacion, generacion creativa sin filtros y tareas donde el modelo base aplicaria politicas de contenido restrictivas.

La relevancia practica viene del formato: al publicarse en GGUF con cuantizaciones desde IQ1_S (8,4 GB) hasta Q6_K, permite ejecutar un MoE de 25 millardos de parametros con solo 4 millardos activos en hardware de consumo, algo inviable con un modelo denso del mismo tamano. El repositorio ocupa 300,9 GB porque agrupa el conjunto completo de cuantizaciones. No hay benchmarks publicados ni validacion independiente de esta distribucion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture-of-Experts (MoE); vision-lenguaje (entrada texto e imagen, salida texto) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | Aproximadamente 4 B por token (designacion A4B); no confirmado en la ficha del repositorio |
| Longitud de contexto | No disponible para este repositorio. El modelo original de la familia (google/gemma-4-26B-A4B-it) declara hasta 256K tokens |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ4_NL. Tambien hay cuantizaciones estaticas en repositorio separado |
| Idiomas soportados | `en` declarado en la ficha del repositorio. La familia Gemma 4 original declara soporte multilingue en mas de 140 idiomas |
| Licencia | Etiquetada como apache-2.0, con `license_link` apuntando a los terminos de licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license). Existe discrepancia entre ambos datos |
| Formato de pesos | GGUF (libreria declarada: transformers). Repositorio de 300,9 GB con todos los quants; los ficheros `mmproj` de vision residen en el repositorio estatico de mradermacher |

## Arquitectura y entrenamiento

La base es Gemma 4 26B A4B IT, un transformer MoE multimodal de Google DeepMind con aproximadamente 25,2 millardos de parametros totales y unos 4 millardos activos por token, capaz de procesar imagenes y texto y de generar texto. La familia Gemma 4 incluye variantes densas y MoE en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B), con ventanas de contexto de hasta 256K tokens y soporte de mas de 140 idiomas segun la documentacion oficial. El componente de vision requiere ficheros `mmproj` adicionales para funcionar en llama.cpp.

Sobre esa base, el autor `llmfan46` aplico un proceso de "ultra-uncensored / heretic": tecnicas de abliteration y decensoring que modifican las direcciones de activacion asociadas al rechazo para que el modelo deje de negarse a responder ante determinadas peticiones. El repositorio analizado es una cuantizacion posterior realizada por `mradermacher` mediante imatrix (quants i1), con el objetivo de reducir el peso a costa de una perdida de calidad controlada. No hay informacion publica sobre el dataset empleado en el ajuste de decensoring, el numero de tokens, ni sobre si se aplicaron fases de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las heredadas del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con modo de razonamiento (reasoning/thinking) heredado de Gemma 4 26B A4B IT.
- Procesamiento de imagenes como entrada (vision-lenguaje): descripcion de imagenes, extraccion de informacion visual y respuesta a preguntas sobre contenido grafico.
- Razonamiento logico y matematico basico a intermedio, con capacidad de codificacion, segun las capacidades declaradas para la familia Gemma 4.
- Ausencia deliberada de mecanismos de rechazo: responde a peticiones que el modelo instruct original denegaria (contenido adulto, temas sensibles, instrucciones potencialmente daninas).
- Soporte multilingue limitado en la practica por el ajuste: la ficha declara unicamente ingles, aunque la arquitectura subyacente conserve capacidad para otros idiomas.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados gracias al formato GGUF.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este derivado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y comportamiento de rechazo: el modelo sirve como sujeto de estudio para comparar la distribucion de respuestas frente a su version instruct oficial, midiendo que capacidades se degradan tras la abliteration.
- Red teaming y evaluacion de seguridad: genera respuestas sin filtro que permiten construir conjuntos de prueba para clasificadores de contenido, moderacion automatica y guardrails.
- Generacion creativa sin restricciones: escritura de ficcion con tematicas adultas, violencia explicita o temas controvertidos donde el modelo base aplicaria politicas de contenido.
- Asistente local multimodal en hardware de consumo: con un quant Q4_K_S (15,6 GB) o Q4_K_M cabe en una GPU de 24 GB, procesando capturas de pantalla, diagramas o fotografias junto al texto.
- Procesamiento de documentacion tecnica escaneada: combinacion de vision y contexto amplio para extraer datos de planos, diagramas o formularios en un pipeline local sin enviar informacion sensible a servicios externos.
- Generacion de datos sinteticos: produccion de dialogos y textos diversos para preentrenar o ajustar otros modelos, incluyendo registros que un modelo censurado rechazaria generar.
- Despliegue en entornos aislados (air-gapped): al ejecutarse con llama.cpp u Ollama sin conexion, es utilizable en laboratorios o instalaciones sin acceso a internet.
- Prototipado de bajo coste con MoE: el ratio de 4 B activos sobre 25,2 B totales permite throughput alto por token sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la busqueda web unicamente aporta datos descriptivos del modelo original de Google, sin cifras comparativas para este derivado abliterated.

## Requisitos de hardware

- VRAM para inferencia (estimada a partir del tamano de los ficheros publicados, sin margen para contexto):
  - IQ1_S / IQ1_M: 8,4-8,8 GB; IQ2_S / IQ2_M: 10,0-10,5 GB.
  - Q2_K / Q3_K_S / IQ3_M: 10,7-12,5 GB.
  - Q4_K_S / Q4_1 / Q4_K_M: 15,6-17 GB aproximadamente.
  - Q6_K: entorno a 21-22 GB. Peso completo en BF16: superior a 50 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para quants Q4 y Q6 con contexto moderado; RTX 4080 o 4070 Ti Super (16 GB) para Q4_K_S con contexto reducido; A100 80 GB o H100 para pesos sin cuantizar o despliegues multiusuario.
- Compatibilidad con GPU de consumo: si, un MoE de este tamano en Q4 cabe en tarjetas de 16-24 GB. Con 12 GB es viable solo con quants IQ2/IQ3, con perdida de calidad apreciable.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No se pueden servir estos ficheros con vLLM o TGI, que requieren safetensors; para ello habria que usar el modelo base sin cuantizar.
- Latencia y throughput: no disponibles. Como referencia cualitativa, al activar solo unos 4 B de parametros por token, la velocidad de generacion es sustancialmente superior a la de un modelo denso de 25 B en el mismo hardware, siempre que la VRAM sea suficiente para mantener todos los expertos en memoria.
- Vision: requiere descargar el fichero `mmproj` correspondiente del repositorio estatico de mradermacher y habilitarlo en llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Riyan200324200324/gemma-4-26B-A4B-uncensored-GGUF) | 25,2 B totales / ~4 B activos | No disponible | `en` declarado | Etiquetado apache-2.0, `license_link` a terminos de Gemma 4 | GGUF (i1 y estaticos) | Derivado abliterated, sin benchmarks, 0 descargas y 1 like |
| google/gemma-4-26B-A4B-it | 25,2 B totales / ~4 B activos | Hasta 256K tokens | Mas de 140 | Terminos de licencia de Gemma 4 | Safetensors | Modelo oficial con politicas de contenido activas |
| llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic | 25,2 B totales / ~4 B activos | No disponible en la informacion | `en` | No disponible | Safetensors | Modelo base del que deriva esta cuantizacion, ya decensored |
| mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF | 25,2 B totales / ~4 B activos | No disponible | `en` | No disponible | GGUF (i1) | Cuantizaciones i1 de referencia del mismo modelo base, publicadas por el autor original de los quants |

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo esta disenado para no rechazar peticiones, por lo que puede generar contenido legalmente problematico, danino o inexacto. No debe exponerse a usuarios finales sin moderacion externa.
- Degradacion por abliteration: la modificacion de direcciones de activacion suele reducir capacidades generales (coherencia, razonamiento, adherencia a instrucciones) de forma no cuantificada. No hay benchmarks que permitan medir cuanto se ha perdido.
- Riesgo elevado de alucinacion, agravado por las cuantizaciones de baja precision: las variantes IQ1_S, IQ1_M y Q2_K_S estan marcadas por el propio cuantizador como de calidad baja o "para desesperados".
- Limitacion idiomatica: solo se declara ingles. Cualquier uso en castellano u otros idiomas debe validarse empiricamente antes de llevarlo a produccion.
- Ambiguedad de licencia: la ficha etiqueta el modelo como apache-2.0, pero el `license_link` apunta a los terminos de Gemma 4, que imponen restricciones de uso, obligaciones de atribucion y una politica de uso prohibido. Para uso comercial hay que verificar que licencia prevalece sobre el modelo base antes de desplegarlo.
- Procedencia y trazabilidad: el repositorio esta publicado por una cuenta distinta a la del cuantizador declarado (`mradermacher`) y los enlaces de descarga de la model card apuntan a los repositorios de aquel. Conviene verificar la integridad de los ficheros antes de usarlos y preferir los repositorios de origen.
- Modelo sin adopcion: 0 descargas y 1 like en el momento de la consulta, sin issues ni validacion de la comunidad. No hay garantia de mantenimiento.
- El branding "gemma-4" no implica respaldo de Google; se trata de un derivado de terceros no oficial.
- En produccion, el formato GGUF limita el escalado: sin soporte en vLLM o TGI, la concurrencia elevada requiere multiples instancias de llama-server en lugar de batching dinamico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Riyan200324200324/gemma-4-26B-A4B-uncensored-GGUF
- Modelo base del ajuste: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic
- Cuantizaciones i1 de referencia (mradermacher): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-i1-GGUF
- Cuantizaciones estaticas y ficheros `mmproj`: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-ultra-uncensored-heretic-GGUF
- Modelo original de Google DeepMind: https://huggingface.co/google/gemma-4-26B-A4B-it
- Pagina del modelo Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion en Google Cloud (Gemma 4 26B A4B IT): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha en LM Studio: https://lmstudio.ai/models/google/gemma-4-26b-a4b
- Terminos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante abliterated del mismo autor: https://huggingface.co/Riyan200324200324/gemma-4-26B-A4B-it-abliterated-GGUF
