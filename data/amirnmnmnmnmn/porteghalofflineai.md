# amirnmnmnmnmn/PorteghalOfflineAI

## Resumen

PorteghalOfflineAI (nombre interno que aparece en la model card: "portaghalir-3") es un repositorio publicado en HuggingFace por el usuario amirnmnmnmnmn que se presenta como "el primer modelo de lenguaje nativo de Iran" y como un asistente de IA "totalmente offline" de 2 MB de tamano. La model card, redactada en persa y con abundante lenguaje promocional, afirma soporte para mas de 200 idiomas, generacion y depuracion de codigo en mas de 50 lenguajes de programacion y razonamiento avanzado, pero no incluye ni un solo dato tecnico verificable. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas en los metadatos.

El problema principal que plantea esta ficha es de verificabilidad: no se publica informacion sobre arquitectura, numero de parametros, longitud de contexto, dataset de entrenamiento, proceso de alineamiento ni resultados de evaluacion. Tampoco se distribuyen pesos en el repositorio; la model card redirige a una aplicacion externa y a dos paginas alojadas en dominios de terceros (un acortador de URL y dos sitios de GitHub Pages), lo que impide auditar el contenido real del supuesto modelo.

Es relevante ahora unicamente como caso de estudio de model cards potencialmente enganosas en el ecosistema open source: la afirmacion de un modelo de lenguaje generalista de 2 MB con capacidad multilingue en 200 idiomas y competencia en codigo es tecnicamente muy improbable con las arquitecturas actuales, y encaja mas con el patron de una landing de captacion de usuarios que con una publicacion de pesos abiertos. Cualquier evaluacion tecnica del modelo es, a dia de hoy, imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe arquitectura; solo menciona el nombre "portaghalir-3") |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | el autor afirma "mas de 200 idiomas", sin lista, sin codigos ISO y sin evaluacion; no verificable |
| Licencia | no disponible (ni en la model card ni en los metadatos del repositorio) |
| Formato de pesos | no disponible (no se publican pesos; el acceso se redirige a una aplicacion externa) |
| Tamano declarado | 2 MB segun el autor; no verificable |
| Distribucion | aplicacion externa enlazada desde la model card; no hay descarga directa de pesos en HuggingFace |
| Autor | amirnmnmnmnmn |
| Fecha de creacion en HuggingFace | 2026-09-21 (fecha declarada en los metadatos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura. La model card no menciona si se trata de un transformer, un modelo MoE, una arquitectura recurrente o un modelo hibrido, ni indica si hay atencion lineal, decodificacion especulativa u otra innovacion tecnica. Tampoco se especifica la tokenizacion, el vocabulario ni el mecanismo de atencion. El unico dato estructural que aparece es el tamano declarado de 2 MB, cifra que no se acompana de desglose de parametros ni de precision numerica.

Respecto al entrenamiento, la informacion es igualmente inexistente: no se indica el numero de tokens, la composicion del dataset, la procedencia de los datos, la existencia de fases de ajuste supervisado, RLHF o DPO, ni el uso de tecnicas de destilacion. Las afirmaciones sobre cobertura de mas de 200 idiomas y de mas de 50 lenguajes de programacion aparecen sin respaldo metodologico alguno. A modo de referencia tecnica, un transformer denso de calidad minima razonable ronda los 500 millones de parametros, lo que en cuantizacion de 4 bits ocupa del orden de 300-400 MB; un fichero de 2 MB solo permitiria, en el mejor de los casos, un modelo estadistico muy pequeno o un clasificador, no un asistente multilingue generalista.

## Capacidades

Todas las capacidades listadas a continuacion proceden de afirmaciones del autor y no han podido verificarse. Se reproducen porque forman parte de la informacion disponible, no porque exista evidencia tecnica que las respalde.

- Generacion de texto en mas de 200 idiomas, segun el autor (sin lista de idiomas ni ejemplos).
- Escritura, analisis y depuracion de codigo en mas de 50 lenguajes de programacion, segun el autor.
- Razonamiento avanzado y resolucion de problemas complejos, segun el autor.
- Ejecucion completamente offline, sin conexion a internet, segun el autor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Optimizacion declarada para persa y "cultura irani": afirmada sin evaluacion.
- No se documenta ninguna capacidad de ajuste por instrucciones, plantilla de chat o formato de prompt.

## Casos de uso

Los casos siguientes asumen que se materialicen las capacidades declaradas y solo serian abordables con el modelo si este se distribuyera en un formato desplegable y con una licencia clara, algo que hoy no ocurre.

- Asistente de escritorio sin conexion para redaccion en persa: si el modelo funcionase como se anuncia, permitiria redactar y corregir textos en entornos sin red, util en organizaciones con politicas de aislamiento de datos; hoy no hay pesos descargables ni formato de despliegue documentado.
- Traduccion automatica offline entre persa y otros idiomas: seria aplicable a traduccion de documentos internos sin enviar datos a la nube; la cobertura de 200 idiomas es una afirmacion sin evaluacion publica.
- Autocompletado de texto en dispositivos con recursos muy limitados: el tamano declarado de 2 MB permitiria, en teoria, ejecucion en CPU y en hardware embebido; no hay medidas de latencia ni de calidad.
- Asistente de programacion en entornos air-gapped: la depuracion y generacion de codigo en 50 lenguajes es una afirmacion del autor sin benchmark de HumanEval, MBPP ni similares; no se recomienda integrarlo en pipelines de CI/CD sin validacion previa.
- Resumen y clasificacion de documentos administrativos en persa: un modelo local podria procesar expedientes en un servidor interno; se desconoce la longitud de contexto, por lo que no puede planificarse el procesamiento de documentos largos.
- Chatbot de atencion al cliente para pymes iranies: requeriria conversacion multi-turno y contexto suficiente; no hay informacion sobre ventana de contexto ni sobre estabilidad en dialogos largos.
- Uso educativo sin conectividad: ejercicios y explicaciones para estudiantes en zonas con acceso limitado a internet; condicionado a que el modelo realmente cubra el curriculo y no alucine, algo no evaluado.
- Prototipado de asistentes de voz offline: si existieran variantes pequenas, podrian embeberse en dispositivos; no se publican variantes ni integraciones con frameworks de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, y la unica tabla comparativa que aparece se limita a marcas de verificacion (si/no) frente a "otros modelos" sin nombrarlos ni aportar numeros. Tampoco hay datos de perplexity, de tasa de acierto en tareas multilingues ni de calidad de codigo, ni resultados de evaluacion humana.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican pesos ni formatos, por lo que no puede calcularse.
- GPU recomendadas: no disponible. Si el tamano declarado de 2 MB fuese real, la inferencia cabria en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: no verificable. A modo de referencia, un modelo denso de 0,5B parametros en 4 bits ocupa aproximadamente 300-400 MB y funciona en cualquier GPU con 4-6 GB de VRAM; un hipotetico modelo de 2 MB no requeriria GPU.
- Opciones de despliegue: no disponible. No hay pesos en formato safetensors, GGUF, ONNX ni MLX, y no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, Transformers ni SGLang.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo, tiempo hasta el primer token ni consumo de memoria en ejecucion.

## Comparativa con modelos similares

La comparativa se establece con modelos pequenos de uso offline ampliamente documentados, ya que PorteghalOfflineAI no publica especificaciones con las que confrontar. Los datos de los modelos de referencia proceden de su documentacion oficial.

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Evaluaciones publicas |
|---|---|---|---|---|---|
| PorteghalOfflineAI (portaghalir-3) | no disponible (2 MB declarados) | no disponible | no disponible | no | no |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | si (safetensors, GGUF) | si |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache-2.0 | si (safetensors, GGUF) | si |
| Gemma 2 2B-it | 2,6B | 8.192 tokens | licencia Gemma (con restricciones de uso) | si (safetensors, GGUF) | si |

Frente a estas alternativas, PorteghalOfflineAI no ofrece ni pesos, ni licencia, ni evaluacion, ni contexto declarado, por lo que no es comparable en terminos de ingenieria. Para uso offline real en produccion, cualquiera de los tres modelos de referencia es una opcion auditable.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no hay arquitectura, parametros, contexto, tokenizador ni datos de entrenamiento, lo que impide reproducir, auditar o dimensionar el modelo.
- La afirmacion de un modelo de lenguaje generalista de 2 MB con soporte para mas de 200 idiomas y mas de 50 lenguajes de programacion es altamente implausible con las arquitecturas actuales y contradice las relaciones habituales entre parametros, calidad y tamano de fichero.
- No se publican pesos: la model card redirige a una aplicacion externa y a dominios de terceros, entre ellos un acortador de URL, lo que impide verificar que el contenido corresponda a un modelo de lenguaje y anade riesgo de seguridad para quien descargue software desde esos enlaces.
- Licencia no declarada: sin licencia explicita no hay cesion de derechos de uso, copia ni modificacion; el uso comercial queda en un limbo legal.
- Riesgo de alucinacion: desconocido y, en principio, elevado si el modelo real es de tamano minimo; no hay evaluacion de fidelidad factual.
- Sesgos conocidos: no disponibles. No hay analisis de sesgos de genero, etnicos, religiosos o politicos, un punto especialmente sensible en un modelo que se presenta como "nativo" de un contexto nacional concreto.
- Limitaciones de contexto e idioma: no disponibles. La afirmacion de cobertura de 200 idiomas no incluye lista ni prueba de competencia en ninguno de ellos.
- Inconsistencia en los metadatos: la fecha de creacion declarada en HuggingFace es 2026-09-21, posterior a la fecha habitual de publicacion de este tipo de fichas, lo que sugiere datos de repositorio poco fiables.
- Cero traccion verificable: 0 descargas y 0 likes, sin issues ni discusiones, lo que descarta cualquier validacion por parte de la comunidad.
- Recomendacion para produccion: no desplegar este repositorio en entornos productivos ni integrarlo en sistemas que manejen datos sensibles hasta que se publiquen pesos, licencia, especificaciones y evaluaciones independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amirnmnmnmnmn/PorteghalOfflineAI
- Enlace de descarga de la aplicacion citado en la model card (acortador de URL): https://vrgl.ir/2EooM
- Pagina "oficial" citada en la model card (GitHub Pages): https://pythonamir1405-pixel.github.io/p
- Pagina del modelo citada en la model card (GitHub Pages): https://you1405com-bot.github.io/n/
- Paper tecnico: no disponible
- Blog o anuncio oficial: no disponible
- Repositorio de codigo: no disponible
- Demo interactiva: no disponible
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo y corresponden a paginas de un producto antivirus, por lo que no aportan informacion adicional.
