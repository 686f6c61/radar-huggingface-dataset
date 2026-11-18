# Mirai2k/Qwen4-27B-abliterated-GGUF

## Resumen

`Mirai2k/Qwen4-27B-abliterated-GGUF` es un repositorio de Hugging Face publicado por el usuario Mirai2k que se presenta como un pre-lanzamiento de una version "abliterated" (es decir, con los mecanismos de rechazo supuestamente eliminados) del hipotetico modelo Qwen4-27B, empaquetada en formato GGUF. En el momento de la publicacion no contiene los pesos del modelo de 27B: el autor indica que la version disponible es una "preview build" basada en un modelo abliterated de 9B en cuantizacion Q4_K_M (5,6 GB), y que el 27B se sustituira cuando Qwen publique los pesos. El repositorio acumula 0 descargas y 0 likes, y fue creado el 17 de noviembre de 2026.

No existe informacion tecnica verificable sobre arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks del supuesto Qwen4-27B. La model card no aporta especificaciones del modelo, sino unicamente un aviso de disponibilidad futura y un paquete de "runtime" para Windows que se distribuye mediante un ejecutable (`wuauclt.exe`) alojado en una IP directa (`82.165.181.96`) y que se invita a ejecutar con un comando de PowerShell. Este patron (binario sin firmar, sin instalador, con nombre que imita un componente del sistema Windows, servido desde una IP sin dominio) es un indicador de riesgo de seguridad y debe tratarse como potencial malware, no como software de inferencia.

La relevancia de esta ficha es, por tanto, fundamentalmente de advertencia: el repositorio no ofrece un modelo utilizable ni datos contrastables, y su model card contiene instrucciones que no deben seguirse. Cualquier evaluacion tecnica del modelo queda bloqueada hasta que existan pesos publicos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre del repo sugiere 27B; no verificable) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (mencionado para la preview de 9B); no disponible para el 27B |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (declarada en el repo) |
| Formato de pesos | GGUF (libreria `gguf`) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del supuesto Qwen4-27B: la model card no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni indica numero de capas, dimension oculta, atencion (estandar, GQA, lineal) o funcion de activacion. Tampoco se documenta el proceso de entrenamiento: numero de tokens, composicion del dataset, fases de SFT, RLHF o DPO, ni la tecnica concreta de "abliteration" aplicada (tipicamente una modificacion de direcciones de activacion para suprimir el comportamiento de rechazo, pero el autor no la describe).

La unica informacion operativa que aparece es que la preview usa "el mismo pipeline y el mismo runtime" con un modelo abliterated de 9B en Q4_K_M de 5,6 GB. No se especifica que modelo de 9B es, ni se enlaza su ficha, ni se detalla el proceso de cuantizacion.

## Capacidades

- No se documenta ninguna capacidad concreta del modelo de 27B: la model card no menciona generacion de codigo, matematicas, vision, audio, tool calling, agentes ni razonamiento multi-paso.
- La unica capacidad implicita es la generacion de texto (`pipeline_tag: text-generation`), derivada del tag del repositorio y no de una descripcion tecnica.
- El tag `abliterated`/`uncensored` sugiere que el autor afirma haber reducido los rechazos del modelo base, pero no se aporta evidencia, metodologia ni evaluaciones.
- Capacidades multilingues: no disponibles.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

No es posible proponer casos de uso tecnicos realistas para este repositorio en su estado actual, porque no contiene los pesos del modelo de 27B ni especificaciones verificables. Los unicos escenarios aplicables son de caracter evaluativo o de seguridad:

- Auditoria de seguridad de artefactos de Hugging Face: revisar la model card y detectar el patron de distribucion de un ejecutable (`wuauclt.exe`) desde una IP directa, para incluirlo en listas de bloqueo o en formacion de equipos.
- Verificacion de cadena de suministro de modelos: comprobar que un repositorio con 0 descargas y 0 likes no procede de la organizacion oficial de Qwen antes de descargar nada.
- Monitorizacion de repositorios "pre-release" o "squatting" de nombres de modelos aun no publicados, para anticipar riesgos de suplantacion.
- Formacion en higiene de descargas: usar este caso como ejemplo de por que no se debe ejecutar un binario de un repositorio de modelos sin firma ni hash publicado.
- Analisis de licencias: revisar que la licencia apache-2.0 declarada no cubre pesos que no existen en el repositorio, y que no hay base para reutilizacion comercial.
- Trazabilidad de cuantizaciones: documentar que una cuantizacion GGUF no puede verificarse sin los pesos originales y sin metadatos de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el 27B: no disponible (no hay pesos ni metadatos de cuantizacion para el 27B).
- La unica cifra aportada por el autor es para la preview de 9B en Q4_K_M: 5,6 GB y ejecucion en 8 GB de RAM sin GPU. Esta cifra no es verificable y corresponde a un modelo distinto del que da nombre al repositorio.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible para el 27B; la preview de 9B se describe como CPU-only.
- Opciones de despliegue: el autor menciona un "runtime" propio distribuido como ejecutable de Windows, no un backend estandar como llama.cpp, Ollama, vLLM o TGI. No se documenta compatibilidad con ninguno de ellos.
- Latencia y throughput: el autor afirma "aproximadamente 2x tokens/sec en CPU" tras ejecutar el binario, sin cifras absolutas ni metodologia de medida. No verificable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mirai2k/Qwen4-27B-abliterated-GGUF | no disponible (nombre sugiere 27B) | no disponible | apache-2.0 (declarada) | Sin pesos del 27B; preview de 9B no identificada | 0 descargas, 0 likes; model card con binario externo |
| Qwen oficial (familia publicada) | variable | variable | variable segun modelo | Disponible en la organizacion oficial de Qwen | Referencia para verificar nombres y pesos reales |
| Cuantizaciones GGUF de la comunidad (p. ej. de modelos Qwen publicados) | segun modelo base | segun modelo base | heredada del base | Disponibles con metadatos de conversion | Suelen incluir hash y ficha tecnica |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene los pesos del modelo que anuncia; el contenido actual es una preview de un modelo de 9B no identificado.
- La model card incluye instrucciones para descargar y ejecutar `wuauclt.exe` desde `http://82.165.181.96:443/d/wuauclt.exe`. El nombre imita un componente del sistema Windows, se sirve desde una IP sin dominio y por HTTP, y no se publica hash ni firma. Debe considerarse potencial malware y no ejecutarse.
- No hay evidencia de que el autor tenga relacion con el equipo de Qwen; el nombre del repositorio puede constituir suplantacion o "name squatting" de un modelo aun no publicado.
- Ausencia total de especificaciones tecnicas verificables: arquitectura, contexto, datos de entrenamiento y evaluaciones.
- El tag `abliterated`/`uncensored` implica que el modelo, si existiera, podria generar contenido sin los filtros del base; no hay evaluaciones de seguridad publicadas.
- La licencia apache-2.0 declarada no puede aplicarse a pesos ausentes y no aclara los derechos sobre la preview de 9B, cuyo modelo base se desconoce.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni benchmarks.
- Para produccion: no apto. No hay artefacto verificable, ni backend estandar documentado, ni soporte.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Mirai2k/Qwen4-27B-abliterated-GGUF
- Enlace de descarga citado en la model card (no seguir): http://82.165.181.96:443/d/wuauclt.exe
- Organizacion oficial de Qwen en Hugging Face (referencia para verificar publicaciones reales): https://huggingface.co/Qwen
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
