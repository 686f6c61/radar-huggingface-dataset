# Amory0201/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es una version "abliterated" y sin censura del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario HauhauCS y redistribuida en el repositorio Amory0201/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive. Se distribuye exclusivamente en formato GGUF y su proposito declarado es eliminar los rechazos del modelo original manteniendo intactas las capacidades base: el autor afirma 0 rechazos sobre 465 prompts de prueba, sin cambios en datasets ni en capacidades. La relevancia actual del modelo esta en que cubre el nicho de modelos pequenos, nativamente multimodales (texto, imagen, video y audio) y ejecutables en hardware de consumo, pero sin las capas de seguridad del modelo de Google.

Arquitectonicamente es un transformer decoder-only de la familia Gemma 4 con 42 capas y atencion hibrida: ventana deslizante de 512 tokens combinada con capas de atencion completa, mas 18 capas con KV compartida para reducir el consumo de memoria del cache. La model card declara 4B parametros (de ahi la nomenclatura "E4B", probablemente parametros efectivos), mientras que los pesos en safetensors reportados en el repositorio suman 7.518.069.290 parametros (unos 7,52 mil millones). El contexto declarado es de 131K tokens y la licencia es la Gemma Terms of Use, con el pipeline image-text-to-text.

El modelo se publica en cuantizaciones GGUF generadas con importance matrix (imatrix) e incluye quants propietarios del autor denominados K_P ("Perfect"), que segun la documentacion mejoran la calidad entre uno y dos niveles de cuantizacion a cambio de un 5-15 por ciento mas de tamano de archivo. El repositorio analizado registra 0 descargas y 0 me gusta en el momento de la consulta y no presenta actualizaciones desde su creacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida: ventana deslizante de 512 tokens combinada con capas de atencion completa; 42 capas y 18 capas con KV compartida |
| Parametros totales | 7.518.069.290 (segun pesos safetensors); la model card declara "4B parametros" |
| Parametros activos | No aplica (no hay confirmacion de arquitectura MoE); la nomenclatura E4B sugiere 4B efectivos, pero no se documenta el mecanismo |
| Longitud de contexto | 131K tokens (131.072) |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P; mas proyector multimodal mmproj en f16 (945 MB) |
| Idiomas soportados | Ingles y multilingue (sin listado detallado de idiomas) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (unicamente cuantizado); el repositorio reporta parametros derivados de safetensors del modelo base. Tamano del repositorio: 61,6 GB |

Otros datos tecnicos declarados:

| Parametro | Valor |
|---|---|
| Modelo base | google/gemma-4-e4b-it |
| Modalidades de entrada | Texto, imagen, video y audio |
| Pipeline | image-text-to-text |
| Parametros de muestreo recomendados | temperature=1.0, top_p=0.95, top_k=64 |
| Herramientas compatibles | llama.cpp, LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF |
| Flag requerido | `--jinja` en llama.cpp para el chat template |
| Repositorio de origen | HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (el repo Amory0201 es una redistribucion) |
| Fecha de creacion y actualizacion | 2026-09-29 (sin actualizaciones posteriores) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E4B: un transformer decoder-only de 42 capas con un esquema de atencion mixto que alterna capas de ventana deslizante de 512 tokens con capas de atencion completa, y que incorpora 18 capas con KV compartida para reducir el coste de memoria del cache durante la inferencia con contextos largos (hasta 131K tokens). Es nativamente multimodal, con soporte de texto, imagen, video y audio en un unico modelo, lo que en el ecosistema GGUF se materializa mediante un proyector multimodal separado (mmproj) que debe cargarse junto al modelo principal.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se detalla el procedimiento de abliteration aplicado: el autor indica que no hubo cambios en datasets ni en capacidades, y que el resultado es funcionalmente equivalente al original salvo por la eliminacion de rechazos, lo que apunta a una intervencion sobre los pesos (del tipo abliteration direccional) mas que a un reentrenamiento. La model card menciona que Gemma 4 emplea tecnicas similares a los "generative reward models" (GenRM) de NVIDIA, que actuan como criticos internos, y que esto dificulta progresivamente el proceso de eliminacion de censura. Las cuantizaciones se generaron con importance matrix (imatrix) y los quants K_P aplican un perfil de analisis especifico del modelo para preservar calidad en las zonas mas sensibles de pesos abliterated.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat gestionada por `--jinja` en llama.cpp.
- Razonamiento general y respuesta a instrucciones, heredado del modelo instruct de Google.
- Procesamiento de imagen: descripcion, respuesta a preguntas visuales y tareas image-text-to-text, requiriendo el archivo mmproj.
- Procesamiento de video como entrada multimodal (declarado en la model card).
- Procesamiento de audio como entrada multimodal (declarado en la model card y en el tag `audio`).
- Contexto largo de 131K tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Soporte multilingue, aunque el listado detallado de idiomas no esta disponible; el tag principal es `en`.
- Ausencia de rechazos por contenido: el autor reporta 0/465 rechazos en su bateria de pruebas, con posibles avisos o disclaimers cortos anadidos por el entrenamiento base, sin bloquear la generacion.
- Compatibilidad con runtimes GGUF de proposito general (llama.cpp, LM Studio, Jan, koboldcpp).
- No se documenta soporte explicito de tool calling, function calling ni flujos de agentes en la informacion disponible.

## Casos de uso

- Analisis de documentos extensos: gracias a los 131K tokens de contexto, el modelo puede procesar contratos, informes tecnicos o expedientes completos en una sola pasada sin troceado, reduciendo perdidas de informacion entre fragmentos.
- Descripcion y extraccion de informacion de imagenes: con el proyector mmproj cargado, permite clasificar, resumir o extraer datos de capturas, diagramas o fotografias dentro de un pipeline local sin enviar datos a servicios externos.
- Transcripcion y analisis de audio: la entrada de audio nativa permite construir asistentes que resumen reuniones o extraen tareas a partir de grabaciones, siempre que el runtime cargue el proyector multimodal.
- Generacion de contenido creativo sin filtros editoriales: para escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde los modelos alineados suelen rechazar o suavizar el contenido.
- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la abliteration sobre capacidades, sesgos y tasas de rechazo, comparando contra el modelo base intacto.
- Red teaming y evaluacion de filtros: util para generar prompts adversarios y contenido limite con el que probar clasificadores de seguridad, moderacion o guardarrailes en otros sistemas.
- Despliegue en edge y hardware de consumo: con cuantizaciones desde 4,2 GB, puede ejecutarse en portatiles con GPU modesta o en equipos sin GPU mediante llama.cpp, habilitando asistentes multimodales offline.
- Prototipado rapido de asistentes multimodales: al ser un modelo pequeno con licencia Gemma y formato GGUF, permite iterar en local antes de escalar a modelos mayores en produccion.
- Analisis de video para catalogacion: la entrada de video permite resumir clips o generar metadatos descriptivos para bibliotecas de contenido, con la limitacion de la ventana de contexto y del coste de procesamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico de rendimiento aportado por el autor es la afirmacion de 0 rechazos sobre 465 prompts, sin que se publique la metodologia, el conjunto de prompts ni el criterio de evaluacion. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite en la informacion disponible, y no se debe asumir equivalencia de rendimiento con el modelo base sin medicion propia.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de archivo mas overhead tipico de runtime y cache KV (estimacion, no dato del autor):

| Cuantizacion | Tamano de pesos | VRAM estimada (texto) | VRAM estimada (con mmproj) |
|---|---|---|---|
| Q8_K_P | 7,6 GB | 9-10 GB | 10-11 GB |
| Q6_K_P | 5,9 GB | 7-8 GB | 8-9 GB |
| Q5_K_P | 5,5 GB | 6,5-7,5 GB | 7,5-8,5 GB |
| Q4_K_M | 5,0 GB | 6-7 GB | 7-8 GB |
| IQ4_XS | 4,8 GB | 5,5-6,5 GB | 6,5-7,5 GB |
| Q3_K_M | 4,6 GB | 5,5-6,5 GB | 6,5-7,5 GB |
| Q2_K_P | 4,2 GB | 5-6 GB | 6-7 GB |

- Caben en GPU de consumo: la mayoria de cuantizaciones Q4 y Q3 entran en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado; las Q5 y Q6 requieren 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); la Q8_K_P encaja comodamente en 16-24 GB (RTX 4090, RTX 3090).
- Para el contexto completo de 131K tokens es necesario reservar VRAM adicional para el cache KV; las 18 capas con KV compartida reducen ese coste respecto a un transformer convencional, pero no se especifica la cifra exacta.
- GPU de datacenter (A100, H100) no son necesarias dado el tamano del modelo; se usarian solo para servir muchas peticiones concurrentes con vLLM u otro servidor compatible con GGUF.
- Opciones de despliegue: llama.cpp (CLI y servidor), LM Studio, Jan, koboldcpp y cualquier runtime compatible con GGUF. El flag `--jinja` es necesario para el chat template correcto.
- Comando de referencia para multimodal:
  `llama-cli -m Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf --mmproj mmproj-Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-f16.gguf --jinja -c 8192 -ngl 99`
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Amory0201/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (este) | 7,52 mil millones en safetensors; 4B declarados | 131K | Texto, imagen, video, audio | GGUF | Gemma | Redistribucion en HF, 0 descargas y 0 me gusta en el repo consultado |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive (original) | Los mismos, segun la model card | 131K | Texto, imagen, video, audio | GGUF | Gemma | Repositorio original del autor, con quants K_P; segun fuentes de terceros acumula mas de un millon de descargas |
| google/gemma-4-e4b-it (base) | 4B declarados / pesos publicados no disponibles en esta consulta | 131K, segun la model card del derivado | Texto, imagen, video, audio | Safetensors y otros formatos propios de Google | Gemma | Modelo oficial de Google en Hugging Face |
| ATOMIKMN/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | No disponible | No disponible | No disponible | No disponible | Gemma | Otra redistribucion del mismo modelo en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente al modelo base ni frente a otras alternativas sin censura, por lo que la comparativa se limita a especificaciones y disponibilidad.

## Limitaciones y advertencias

- La censura se ha eliminado de forma deliberada: el modelo puede generar contenido violento, sexual, ilegal o danino sin filtros. Es responsabilidad exclusiva del operador el uso que haga de el y el cumplimiento de la legislacion aplicable.
- La afirmacion "0/465 rechazos" es autodeclarada y no verificable con la informacion disponible; no se publica la metodologia de evaluacion.
- La abliteration puede degradar capacidades: al intervenir sobre los pesos se corre el riesgo de perdida de coherencia, mayor tasa de alucinacion o respuestas incoherentes en dominios concretos. No se han publicado evaluaciones comparativas frente al modelo base.
- La model card advierte de que Gemma 4 no recibio tanto tiempo de prueba manual en contextos largos como otras publicaciones del autor, lo que implica menor fiabilidad en regimen de 131K tokens.
- La model card senala que Gemma 4 incorpora tecnicas tipo GenRM (criticos generativos internos), lo que hace que la eliminacion completa de rechazos sea progresivamente mas dificil y potencialmente incompleta en segun que escenarios.
- La licencia Gemma Terms of Use impone obligaciones de redistribucion (incluir la licencia y los avisos), una politica de uso aceptable y restricciones especificas de uso comercial y de uso prohibido. Verificar los terminos vigentes antes de cualquier despliegue comercial; esta ficha no constituye asesoramiento legal.
- El repositorio consultado (Amory0201) es una redistribucion del trabajo original de HauhauCS y presenta 0 descargas, 0 me gusta y ninguna actualizacion posterior a la creacion, lo que dificulta verificar integridad y procedencia de los archivos. Contrastar hashes con el repositorio original antes de desplegar en produccion.
- El soporte de vision y audio exige cargar el archivo mmproj; sin el, el modelo funciona solo con texto.
- Los quants K_P pueden aparecer como "?" en la columna de cuantizacion de LM Studio; es un problema de visualizacion, no de carga.
- El modelo esta etiquetado principalmente como ingles; el rendimiento real en otros idiomas no esta documentado y no se debe asumir equivalencia.
- Existe una variante "Balanced" que conserva parte de los guardarrailes, pero no estaba disponible en el momento de la publicacion de la model card.
- No se documenta soporte de tool calling ni de flujos de agentes, por lo que no deberia asumirse su uso en pipelines que dependan de function calling estructurado.

## Enlaces

- Ficha en Hugging Face (repositorio consultado): https://huggingface.co/Amory0201/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Repositorio original del autor: https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Redistribucion alternativa: https://huggingface.co/ATOMIKMN/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Ficha de terceros en Local AI Zone: https://local-ai-zone.github.io/models/gemma-4-e4b-uncensored-hauhaucs-aggressive.html
- Ficha de terceros en ThinkLLM: https://thinkllm.dev/models/gemma-4-e4b-uncensored-hauhaucs-aggressive
- Version para Ollama: https://ollama.com/fredrezones55/Gemma-4-Uncensored-HauhauCS-Aggressive
- Discord del autor: https://discord.gg/SZ5vacTXYf
