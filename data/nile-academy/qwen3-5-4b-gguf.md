# nile-academy/qwen3.5-4b-gguf

## Resumen

nile-academy/qwen3.5-4b-gguf es una conversion GGUF de primera mano (first-party) del modelo Qwen/Qwen3.5-4B, publicada por el usuario nile-academy para el motor de generacion de texto local del proyecto BookAlive. No se trata de un modelo entrenado desde cero, sino de una cuantizacion Q4_K_M derivada del modelo base de Qwen, con licencia Apache-2.0 y una revision del padre fijada explicitamente para garantizar la reproducibilidad del proceso.

El interes practico de esta ficha radica en que documenta un caso tipico de cuantizacion de un modelo de ~4,33 mil millones de parametros para su uso en local: fichero GGUF de 2,78 GB, conversion reproducible mediante llama.cpp (revision c173a53bdfca1047c710018dc934a6d67a8b010f), hashes de entrada y salida publicados en conversion.json y lane exclusivamente de texto (sin proyector de vision). El propio autor advierte que se trata de un candidato de desarrollo, no de una version cualificada para produccion.

La relevancia actual es doble: por un lado, ofrece un punto de entrada ligero para ejecutar modelos de la familia Qwen 4B en hardware de consumo; por otro, es un ejemplo de buenas practicas de trazabilidad en cuantizacion (revision fijada, hashes, desactivacion de codigo remoto, verificacion de bytes del prompt). La informacion disponible, sin embargo, es muy limitada: no se publican arquitectura detallada, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica que el padre es Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repositorio; el pipeline usa un GGUF F16 intermedio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero Qwen3.5-4B-Q4_K_M.gguf, 2.783.446.816 bytes) |
| Modelo base | Qwen/Qwen3.5-4B (revision fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| SHA-256 del fichero | 5a29dd0eee98050cdfc2b5b894fb2859ce21ec08f33964860bdf44c2609434fa |
| Tamano del repositorio | 2,8 GB |
| Libreria | gguf |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura interna del modelo mas alla de su procedencia (Qwen/Qwen3.5-4B) y de que se trata de una lane exclusivamente de texto: la model card indica explicitamente que no se incluye proyector de vision. El unico dato estructural verificable es el numero de parametros totales, 4.326.350.848.

Respecto al proceso de conversion, la model card detalla la cadena completa: safetensors originales -> GGUF F16 -> Q4_K_M, sin calibracion mediante matriz de importancia (importance matrix). La herramienta empleada es llama.cpp en la revision c173a53bdfca1047c710018dc934a6d67a8b010f; la descarga de codigo remoto de modelo o tokenizer esta desactivada y la conversion se ejecuto en modo offline. Los hashes exactos de entrada y salida, el parche del exportador y las versiones del paquete de desarrollo se encuentran en conversion.json. No hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, ni sobre si se aplicaron tecnicas de RLHF o DPO en la fase original.

En cuanto a validacion, el autor indica que la version cuantizada y la referencia F16 superaron pruebas sinteticas de disponibilidad en CPU y sondas acotadas de audiolibro y de clase explicativa, y que los bytes del prompt revisado coinciden con la plantilla del publicador. El propio autor matiza que estas comprobaciones establecen un comportamiento de integracion acotado y no equivalencia numerica, fidelidad semantica, calidad de escucha ni exactitud clinica.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" y pipeline text-generation).
- Integracion en aplicaciones locales tipo BookAlive para generacion de texto en el propio dispositivo.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para su exposicion mediante servidores de inferencia compatibles con la API de llama.cpp.
- Ejecucion en CPU: el autor reporta pruebas sinteticas de disponibilidad en CPU ("synthetic CPU readiness").
- Lane de solo texto: no incluye proyector de vision, por lo que no hay capacidades multimodales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara listado de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de texto embebida en aplicaciones de escritorio: el repositorio esta pensado como lane local de generacion de texto para BookAlive, con un runtime distribuido por separado por el instalador de la aplicacion; encaja cuando se necesita inferencia sin conexion.

- Narracion y apoyo a audiolibros: el autor menciona sondas de audiolibro acotadas ("constrained audiobook probes") como parte de la validacion, de modo que el uso previsto incluye la generacion de texto que despues se sintetiza en audio.

- Generacion de material didactico y clases explicativas: la model card cita sondas de "explanation-lecture", lo que situa el modelo en escenarios de produccion de explicaciones estructuradas para contenido formativo.

- Prototipado rapido en local con recursos limitados: al pesar 2,78 GB en Q4_K_M, permite probar un modelo de ~4,3B de parametros en equipos sin GPU dedicada o con GPU de gama media, antes de decidir el salto a una version mayor.

- Pruebas de integracion y CI de pipelines de inferencia: la conversion reproducible con hashes y revision fijada facilita verificar que un runtime concreto carga y ejecuta el mismo artefacto bit a bit en cada build.

- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta la ausencia de calibracion imatrix, por lo que sirve como referencia base frente a conversiones que si la aplican, siempre que se realice la comparacion de calidad por cuenta del evaluador.

- Despliegue en entornos con requisitos de procedencia estricta: al no descargar codigo remoto de modelo o tokenizer y operar offline, el proceso de conversion es auditable, algo util en entornos regulados o con control de cadena de suministro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas tipo MMLU, HumanEval o GSM8K, y se limita a describir comprobaciones cualitativas de integracion (disponibilidad en CPU, sondas de audiolibro y de clase, coincidencia de bytes del prompt) que el propio autor califica como no equivalentes a fidelidad numerica o semantica.

## Requisitos de hardware

- Peso del artefacto: 2,78 GB para el unico fichero GGUF Q4_K_M, lo que fija el minimo de memoria necesaria solo para los pesos.
- VRAM estimada para inferencia: no hay mediciones publicadas. Como estimacion orientativa (no verificada por el autor), cabe esperar un consumo de aproximadamente 3,5-4,5 GB en GPU sumando pesos, overhead del runtime y cache KV con contextos moderados; el consumo crece con la longitud de contexto, que no se especifica.
- GPU recomendadas: no disponible. La model card indica explicitamente que no se han realizado cualificaciones en GPU ni con 8 GB de VRAM.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM, pero se trata de una inferencia no verificada por el publicador; el autor declara que la cualificacion de GPU/8 GB de VRAM, thermals y latencia no se ha llevado a cabo.
- CPU: se reportan pruebas sinteticas de disponibilidad en CPU, sin cifras de rendimiento.
- Opciones de despliegue: llama.cpp (herramienta usada en la conversion), servidores compatibles con endpoints (etiqueta endpoints_compatible), llama-cpp-python, Ollama y LM Studio como envoltorios habituales de GGUF. El autor senala que el runtime compilado se distribuye por separado mediante el instalador de la aplicacion y que el repositorio contiene unicamente datos, sin runtime ni inferencia en Python.
- Movil, navegador, latencia y throughput: no disponible; no se han realizado cualificaciones de movil, navegador, thermal ni latencia.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de contexto para otros modelos de la misma categoria dentro de la informacion proporcionada. La comparacion se limita a los artefactos directamente relacionados:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/qwen3.5-4b-gguf (este modelo) | 4.326.350.848 | no disponible | GGUF Q4_K_M | Apache-2.0 | Repositorio de HuggingFace, 0 descargas y 0 likes en el momento del analisis |
| Qwen/Qwen3.5-4B (padre) | 4.326.350.848 | no disponible | safetensors | Apache-2.0 | Repositorio oficial de Qwen; revision fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Otras conversiones GGUF del mismo padre o de modelos de ~4B de la competencia | no disponible | no disponible | GGUF | no disponible | no disponible en la informacion proporcionada |

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo ni sobre Qwen3.5-4B; los resultados obtenidos correspondian a entidades no relacionadas (agencia de asuntos publicos, articulos sobre el rio Nilo y tiendas de diseno). No se pueden por tanto contrastar alternativas con datos externos verificados.

## Limitaciones y advertencias

- Estado de madurez: el autor declara explicitamente que es un candidato de desarrollo y no una version cualificada para publicacion ("not release-qualified").
- Ausencia de evaluacion: no se han realizado evaluaciones del modelo ni revision humana segun la propia model card.
- Equivalencia numerica y fidelidad semantica: no garantizadas. Las pruebas realizadas solo cubren comportamiento de integracion acotado.
- Sin calibracion imatrix: la conversion Q4_K_M se hizo sin matriz de importancia, lo que puede degradar la calidad respecto a cuantizaciones calibradas de la misma familia.
- Riesgo de alucinacion: no disponible de forma especifica; al no haber evaluaciones publicadas, no puede acotarse el riesgo de inventar contenido.
- Idiomas: no se declara listado de idiomas soportados, por lo que el comportamiento multilingue es desconocido y debe verificarse por cuenta del integrador.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar casos de uso que dependan de ventanas largas.
- Vision: no hay proyector de vision; el modelo es exclusivamente de texto.
- Endoso: el publicador original (Qwen) no respalda esta conversion, tal como aclara la model card.
- Licencia: Apache-2.0, lo que en principio permite uso comercial, pero la responsabilidad de verificar el cumplimiento sobre el artefacto cuantizado y sobre el modelo base recae en el usuario.
- Cadena de suministro: el runtime compilado se distribuye aparte mediante el instalador de la aplicacion y no esta incluido en el repositorio, que contiene solo datos.
- Scripts con anclaje a fuentes: el autor indica que aun requieren comprobaciones estructurales, de procedencia, de integridad y de derechos de uso.
- Adopcion: el repositorio presenta 0 descargas y 0 likes en el momento del analisis, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nile-academy/qwen3.5-4b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision fijada del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Repositorio de llama.cpp empleado en la conversion (revision c173a53bdfca1047c710018dc934a6d67a8b010f): https://github.com/ggml-org/llama.cpp/commit/c173a53bdfca1047c710018dc934a6d67a8b010f
- Ficheros de referencia dentro del repositorio: conversion.json y README.upstream.md
- Papers, blogs, demos o resultados de busqueda web relevantes: no disponible
