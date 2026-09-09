# egekocabas/salamandraTA-7b-instruct-Q5_K_M-GGUF

## Resumen

El repositorio egekocabas/salamandraTA-7b-instruct-Q5_K_M-GGUF contiene una conversión a formato GGUF del modelo BSC-LT/salamandraTA-7b-instruct, realizado por el usuario egekocabas mediante el espacio GGUF-my-repo de ggml-ai. Se trata de un modelo de instrucciones con aproximadamente 7,77 miles de millones de parámetros (7.768.117.248 según los metadatos de safetensors), cuantizado a Q5_K_M con imatrix, lo que lo hace adecuado para ejecutarse en memoria local con la biblioteca llama.cpp en CPU o GPU. La licencia declarada es GPL-3.0.

La ficha del repositorio original indica que el modelo está orientado a traducción y atención conversacional, con una lista de 42 idiomas soportados (entre ellos español, catalán, gallego, euskera, inglés, francés, alemán, portugués, italiano, ruso, árabe, chino, japonés, coreano e hindi). La relevancia del punto de entrada reside en que ofrece una versión lista para producción local, sin necesidad de servicios externos, gracias al formato GGUF.

La información disponible en el repositorio no incluye la arquitectura interna, la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks, por lo que estos aspectos se describen como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.768.117.248 (aprox. 7,77 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M con imatrix (archivo: salamandrata-7b-instruct-q5_k_m-imat.gguf) |
| Idiomas soportados | 42 idiomas: bg, ca, cs, cy, da, de, el, en, es, et, eu, fi, fr, ga, gl, hr, hu, it, lt, lv, mt, nl, nb, no, oc, pl, pt, ro, ru, sl, sk, sr, sv, uk, ast, an, ar, ja, hi, ko, zh, is |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 5,6 GB |

## Arquitectura y entrenamiento

La información disponible en este repositorio no incluye detalles sobre la arquitectura del modelo ni sobre su proceso de entrenamiento. Al tratarse de una conversión a GGUF del checkpoint BSC-LT/salamandraTA-7b-instruct, los datos sobre arquitectura, número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO u otras innovaciones técnicas deben consultarse en la model card original del modelo base, no incluida en esta ficha. No se dispone de datos sobre técnicas de decodificación especulativa, atención lineal u otras variantes.

## Capacidades

- Generación de texto y seguimiento de instrucciones: al ser un modelo instruct, responde a indicaciones en formato de diálogo o tarea.
- Traducción automática: el pipeline_tag y la amplia lista de idiomas indican que el modelo está orientado a tareas de traducción entre lenguas.
- Conversación multilingüe: el tag conversational y el formato instruct sugieren que puede mantener diálogos en varios idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades de visión o audio: no disponible.
- No se han publicado pruebas específicas de estas capacidades en este repositorio.

## Casos de uso

- Traducción local de documentos: el modelo puede traducir texto entre los 42 idiomas declarados sin conexión a internet, lo que resulta útil en entornos con restricciones de privacidad o baja conectividad. Se puede invocar mediante llama.cpp en una máquina con recursos modestos.
- Asistente de atención al cliente multilingüe: al ser un modelo instruct conversacional, puede gestionar consultas básicas en varios idiomas dentro de un chatbot local. La cuantización Q5_K_M permite su ejecución en una GPU de gama media o incluso en CPU para pruebas.
- Reescritura y corrección de textos: se le pueden pedir tareas como corregir gramática, reescribir párrafos o adaptar el tono de un texto en distintos idiomas, lo que encaja en herramientas de edición o procesamiento de documentos.
- Clasificación de contenido en varios idiomas: mediante prompts de instrucción, el modelo puede etiquetar mensajes, correos o comentarios en categorías predefinidas. Este caso es adecuado para sistemas de moderación o análisis de opiniones.
- Resumen de documentos: con instrucciones adecuadas, puede generar resúmenes de artículos o informes en el idioma de salida deseado. Al no conocerse la longitud de contexto, se recomienda fragmentar textos largos y probar con muestras cortas.
- Extracción de entidades o datos: el modelo puede extraer nombres, fechas u otros campos concretos a partir de texto estructurado, siempre que se le proporcione un prompt bien formulado. Es útil para pipelines de enriquecimiento de datos.
- Prototipado en local sin dependencias externas: gracias al formato GGUF, el modelo es adecuado para demostraciones, entornos de desarrollo o aplicaciones embebidas que prefieran evitar APIs externas, integrándose con llama.cpp y llama-server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni en otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: no se indican valores oficiales. El archivo GGUF ocupa 5,6 GB, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos.
- GPU recomendadas: no disponible. Se puede ejecutar en consumer GPUs con 6-8 GB de VRAM si la longitud de contexto es corta, pero no hay datos que confirmen este comportamiento.
- La inferencia también es posible en CPU con llama.cpp, aunque la velocidad dependerá del hardware.
- Opciones de despliegue: llama.cpp (CLI) y llama-server, tal como se describe en la model card. No se ha confirmado la compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables en la misma categoría, ni se han encontrado benchmarks de referencia en la búsqueda web.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier uso o redistribución del modelo debe cumplir los términos de la GPL-3.0. Para uso comercial es necesario revisar las obligaciones de licencia.
- Al ser una conversión externa y no una publicación oficial del desarrollador original, no hay garantía de mantenimiento ni de exactitud de la cuantización.
- La cuantización Q5_K_M puede introducir una pérdida de precisión respecto al modelo en FP16 o BF16, lo que puede afectar a tareas de alta sensibilidad.
- No se han publicado evaluaciones de sesgos, alucinaciones ni de seguridad en este repositorio.
- La longitud de contexto no está especificada; puede ser demasiado corta para documentos extensos.
- El soporte de 42 idiomas no implica una calidad uniforme; algunos idiomas o dominios pueden mostrar un rendimiento inferior.
- Para tareas de razonamiento complejo, tool calling o uso como agente, se recomienda realizar una evaluación previa específica, ya que no hay datos que respalden su fiabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/egekocabas/salamandraTA-7b-instruct-Q5_K_M-GGUF
- Modelo base original: https://huggingface.co/BSC-LT/salamandraTA-7b-instruct
- Biblioteca llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
