# Elihu3tz/ring-of-alefbet

## Resumen

Ring of Alefbet no es un modelo de lenguaje en el sentido convencional, sino un sistema multiagente de evaluacion matematica publicado por Elihu Atzmoni (Israel) en el repositorio de Hugging Face `Elihu3tz/ring-of-alefbet`. El autor lo describe como una arquitectura de "ring" (anillo) en la que varias sesiones de agente, una por cada letra del alfabeto hebreo, resuelven problemas matematicos de forma independiente y un agente verificador separado puntua las respuestas. El sistema se apoya en modelos Claude de Anthropic (Opus 5.5, Sonnet 5.5 y Haiku 5.5) como motor de inferencia subyacente.

El repositorio no contiene pesos de modelo, tokenizador ni pipeline de inferencia: la model card indica explicitamente que el codigo fuente del Ring, la arquitectura interna y los materiales de desarrollo no se publican bajo la licencia CC BY 4.0. Lo que se publica es la documentacion de investigacion, los resultados de evaluacion firmados digitalmente con GPG y la metodologia del examen.

La relevancia del proyecto es metodologica mas que de modelo: propone un protocolo de evaluacion con compromiso criptografico de predicciones (hash y commit local antes de la correccion) y un verificador aislado que solo puntua ficheros cuyo hash coincide. Los resultados declarados son 97,3% (1344/1382) en GSM8K, AIME 2026 y HMMT February 2026, autodeclarados y no verificados externamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente (ring de sesiones de agente) sobre modelos Claude de Anthropic; no es un modelo con pesos propios |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | no disponible (la documentacion esta en ingles; los agentes subyacentes son modelos Claude) |
| Licencia | CC BY 4.0, limitada a la documentacion de investigacion original; excluye codigo fuente, arquitectura interna y materiales de desarrollo no publicados |
| Formato de pesos | no disponible (no hay pesos; se publican ficheros CSV de resultados y firmas GPG) |

## Arquitectura y entrenamiento

El sistema se describe como un "ring" de sesiones de agente, con topologia, protocolos de comunicacion y memoria propios del autor, aunque los detalles de esa arquitectura no se publican. En la evaluacion participaron 18 sesiones resolutoras en GSM8K (una por letra hebrea), 1 en AIME 2026 y 3 en HMMT February 2026, mas 1 sesion verificadora independiente. Cada resolutor recibio unicamente un fichero de preguntas sin respuestas, fijo sus predicciones mediante un commit local de git o un hash, y envio la ruta y el hash al verificador, que solo puntuo ficheros cuyo hash coincidia. Algunos resolutores usaron Python como calculadora durante el razonamiento intermedio.

No hay entrenamiento ni ajuste fino documentado: el sistema no entrena pesos, sino que orquesta modelos Claude preentrenados (Opus 5.5, Sonnet 5.5, Haiku 5.5) mediante ingenieria de agentes. La innovacion tecnica destacable es el protocolo de integridad: firma GPG del fichero de resultados (`ring/exam_results.csv.asc`, huella `0F64 C91E BAE3 C819 B292 32A6 0C3E 9AC9 631E F2EE`, SHA-256 `aa157531c1c6691c37e959856e63e50419fc22c2637f458bfbbca66b6fe032b7`) y un informe del verificador sin respuestas (SHA-256 `512dd6efb84ab64893b64d117b1d865a921a1e5febde1080e0d6c8e3c4c3fa55`, commit `f9e0d12`). El autor reconoce que las claves de respuestas estaban en el mismo disco y podrian haber sido tecnicamente accesibles a los resolutores, y que los registros de commit y hash no demuestran que ningun resolutor accediera a ellas.

## Capacidades

- Resolucion de problemas matematicos de competicion (GSM8K, AIME, HMMT) mediante orquestacion multiagente.
- Verificacion y puntuacion separada de respuestas por un agente checker aislado del fichero de respuestas.
- Uso de Python como calculadora dentro de las sesiones resolutoras.
- Protocolo de compromiso de predicciones mediante hash y commits de git antes de la correccion.
- Firma criptografica GPG de los resultados para trazabilidad y procedencia.
- Clasificacion de errores en categorias (lectura/interpretacion, disputas con la clave, unidades, aritmetica).
- No disponible: tool calling generico, function calling, vision, audio, modo thinking documentado, capacidades multilingues declaradas.

## Casos de uso

- Evaluacion de sistemas multiagente en matematicas: el protocolo de hash y verificador aislado sirve como plantilla para disenar evaluaciones con integridad de submissions en proyectos de investigacion propios.
- Auditoria de resultados autodeclarados: la firma GPG y los ficheros de resultados permiten a terceros verificar integridad y procedencia criptografica, aunque no la exactitud del benchmark.
- Estudio de metodos de agregacion de respuestas: el esquema de multiples sesiones resolutoras y un checker independiente es replicable para investigar consenso y votacion entre agentes.
- Analisis de errores en razonamiento matematico: la taxonomia de 38 respuestas incorrectas (25 de lectura/interpretacion, 8 disputas con la clave, 3 de unidades, 2 aritmeticas) es util para estudiar modos de fallo.
- Docencia e investigacion en evaluacion de LLM: la model card documenta explicitamente las diferencias de protocolo respecto a leaderboards oficiales (GSM8K oficial usa 4 epochs, pass@1; aqui una unica tentativa).
- Reproduccion de pipelines de evaluacion: el patron de fichero de preguntas sin respuestas, commit/hash y verificador separado es trasladable a otros benchmarks con requisitos de auditoria.
- Referencia para trazabilidad en publicaciones: el uso de firmas digitales y hashes de ficheros es un ejemplo concreto de provenance criptografica aplicable a resultados de investigacion.

## Benchmarks y rendimiento

| Benchmark | Correctas | Precision | Wilson 95% |
|---|---|---|---|
| GSM8K (todas, 1319) | 1282 / 1319 | 97,2% | 0,962-0,980 |
| AIME 2026 | 30 / 30 | 100% | 0,887-1,000 |
| HMMT February 2026 | 32 / 33 | 97,0% | 0,847-0,995 |
| Total (tres benchmarks) | 1344 / 1382 | 97,3% | 0,962-0,980 |

Los resultados son autodeclarados, no verificados independiente ni externamente. No se puede descartar solapamiento con datos de entrenamiento. El protocolo difiere de los leaderboards oficiales (una tentativa por problema; GSM8K oficial usa 4 epochs y pass@1). No se proporcionan resultados de otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- No aplicable en el sentido habitual: no se distribuyen pesos, por lo que no hay requisitos de VRAM para inferencia local del sistema.
- El sistema depende de la API de modelos Claude de Anthropic; el coste computacional recae en el proveedor.
- Numero de sesiones de agente por evaluacion: 18 en GSM8K, 1 en AIME 2026, 3 en HMMT February 2026, mas 1 verificador; el coste agregado de tokens es proporcional a ese numero de sesiones.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles, al no existir pesos publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica comparaciones con otros sistemas multiagente ni con modelos individuales, y no se dispone de datos de rendimiento de alternativas en la informacion proporcionada. Cualquier comparacion con modelos como GPT, Gemini o Llama requeriria datos que no constan.

## Limitaciones y advertencias

- Resultados autodeclarados y no verificados externamente; la precision reportada no debe tratarse como validada de forma independiente.
- Posible solapamiento con datos de entrenamiento no descartado por el autor.
- Las claves de respuestas estaban en el mismo disco que los resolutores y podrian haber sido accesibles; los hashes no demuestran lo contrario.
- Protocolo de evaluacion distinto al oficial de GSM8K (una tentativa frente a 4 epochs y pass@1), lo que impide comparacion directa con leaderboards.
- La licencia CC BY 4.0 cubre solo la documentacion publicada; el codigo fuente, la arquitectura interna y los materiales de desarrollo no se liberan.
- El autor no reclama propiedad sobre los modelos subyacentes (Claude de Anthropic), y las afirmaciones de autoria estan sujetas a derechos de terceros.
- Las sesiones resolutoras se apoyan en modelos Claude; el rendimiento refleja la combinacion de modelos y orquestacion, no un modelo propio.
- No hay informacion sobre sesgos, comportamiento multilingue ni robustez fuera de matematicas.
- Uso comercial: la licencia CC BY 4.0 permite uso comercial de la documentacion, pero no de los materiales no publicados ni de los modelos subyacentes, sujetos a sus propias licencias.
- Fecha de creacion del repositorio (2026-11-17) y benchmarks referidos a 2026: verificar vigencia y disponibilidad de los datos antes de citarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Elihu3tz/ring-of-alefbet
- Resultados firmados (referenciados en la model card): `ring/exam_results.csv` y `ring/exam_results.csv.asc`
- Clave publica de verificacion: `ring/ring-author-public-key.asc`
- Informe del verificador: SHA-256 `512dd6efb84ab64893b64d117b1d865a921a1e5febde1080e0d6c8e3c4c3fa55`, commit `f9e0d12`
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
