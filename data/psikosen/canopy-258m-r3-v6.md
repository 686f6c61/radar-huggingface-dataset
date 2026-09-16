# psikosen/canopy-258m-r3-v6

## Resumen

Canopy-258m-r3-v6 es un modelo pequeno (296.304.390 parametros reales segun los pesos en safetensors) publicado por el usuario psikosen en Hugging Face, etiquetado como `browser-use` y `experimental`. No es un modelo de proposito general: se presenta como un planificador de acciones de navegador con decodificacion restringida por acciones observadas, validacion estricta de objetivos y guarda contra acciones repetidas. Su antecesor directo es `psikosen/canopy-258m-r3`, del que deriva como ajuste fino.

La etiqueta `v6` preserva la linea base y la revision `main` incorpora una metodologia opcional de verificacion de estado inspirada en GSAR y ASIL. Segun la model card, no se realizo entrenamiento adicional de pesos: el cambio es una capa de verificacion invocada explicitamente mediante su interfaz de registros guardados y su comando de evaluacion. El paquete incluye tokenizador local y clases Python propias (`canopy_r3/`, `miniswardbower/`, `tools/`), sin necesidad de cargador de codigo remoto de Hugging Face.

Es relevante por su planteamiento de fiabilidad mas que por su escala: el autor publica resultados controlados donde las decisiones correctas de verificacion pasan de 47/72 a 72/72 y las afirmaciones de exito no respaldadas caen de 18 a 0. El propio autor advierte que esto no constituye una tasa general de exito en la web, que la tarea compleja de investigacion en web publica sigue fallando y que se trata de un lanzamiento experimental, no de una afirmacion de competencia autonoma general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la declara; se describe como planificador de navegador con clases Python propias en `canopy_r3/` y `miniswardbower/`) |
| Parametros totales | 296.304.390 (dato real de safetensors); el nombre comercial indica 258m |
| Parametros activos | No aplica (no se describe como MoE; los pesos no estan empaquetados en ternario) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados son bfloat16 sin empaquetado ternario |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 592.641.124 bytes, SHA-256 `6d8bfb2b00be8e11c6667173fed7add4bb9b24a32fd44e481351ef4fcb28d919`) |

Datos adicionales: tamano del repositorio 0,6 GB; descargas 0; likes 0; creado el 2026-09-15 y actualizado el mismo dia; modelo base `psikosen/canopy-258m-r3` (relacion declarada como finetune).

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (transformer, MoE, SSM u otra), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es la capa funcional: un planificador de navegador heredado de Canopy-R3 con decodificacion restringida por acciones observadas, validacion estricta del objetivo y guarda contra acciones repetidas. El paquete incluye activos de tokenizador locales y clases Python personalizadas, y no requiere el cargador de codigo remoto de Hugging Face ni un segundo modelo.

Respecto al entrenamiento, el autor afirma explicitamente que no se realizo entrenamiento adicional de pesos para esta revision: `v6` congela la linea base y la rama de verificacion de estado anade un contrato opcional de registro guardado. Se menciona que el entrenamiento de recuperacion Wuying y los metodos de RL de los papers citados no se han implementado. La innovacion tecnica declarada es de metodologia de verificacion (comprobaciones de vinculo entre objetivo, proposito, campo y valor, y de persistencia tras reabrir), inspirada en GSAR y ASIL, mas el descarte de un checkpoint de calibracion posterior y de un clasificador de recibos que introducian regresiones.

## Capacidades

- Planificacion de acciones de navegador web a partir de un objetivo en lenguaje natural, mediante `tools/browser_agent.py` con `--url`, `--goal` y `--max-steps`.
- Decodificacion restringida por acciones observadas, con validacion estricta de objetivo y guarda contra acciones repetidas.
- Verificacion de estado opcional: comprobaciones de vinculo objetivo/proposito/campo/valor y de persistencia tras reabrir una pagina, invocables con `tools/browser_state_verifier.py checks` y `tools/browser_state_verifier.py evaluate`.
- Emision de decisiones de verificacion con rechazos apropiados: en el estudio controlado se registran 8 guardados verificados y 64 rechazos apropiados.
- Ejecucion con navegador Chromium via Playwright, con modo visible (`--visible`) y generacion de trazas (`--output trace.json`).
- Trazabilidad: salidas de observaciones, decisiones y calificacion independiente en `metrics/`, mas `release.json`, `manifest.json` y `release_smoke.json` con versiones y hashes.
- No se documentan capacidades de tool calling generico, function calling, agentes multi-paso de proposito general, vision, audio, thinking mode ni matematicas.

## Casos de uso

- Automatizacion de tareas de formulario con verificacion: el modelo puede ejecutar una secuencia de acciones sobre una pagina y, opcionalmente, confirmar mediante el verificador de estado que el valor guardado persiste tras reabrir la pagina, lo que reduce los falsos positivos de exito.
- Pruebas de regresion de agentes de navegador: al ser un paquete con suites de evaluacion y metricas en `metrics/`, sirve como sujeto de prueba reproducible en entornos de CI para medir decisiones de verificacion correctas frente a afirmaciones de exito no respaldadas.
- Extraccion y registro de datos en portales concretos: con objetivos acotados y etiquetas conocidas (las ocho familias de intenciones entrenadas), encaja en flujos internos donde el dominio de la pagina esta controlado.
- Investigacion sobre fiabilidad de agentes: el material publicado (bateria de debilidades, suite de fiabilidad, casos de calibracion) permite reproducir y auditar el comportamiento del planificador sin reentrenar.
- Auditoria de acciones de escritura: el verificador esta disenado para distinguir guardados reales de bloqueos, lo que resulta util para revisar si un agente escribio en la seccion correcta antes de dar una tarea por cerrada.
- Monitorizacion de sitios propios en pruebas controladas: al poder lanzarse contra una URL arbitraria, permite validar cambios de interfaz en un entorno de staging donde las acciones del navegador no afecten a produccion.
- No se recomienda como sustituto de un agente autonomo de navegacion general: el propio autor indica que la tarea compleja de investigacion en web publica sigue fallando.

## Benchmarks y rendimiento

| Suite | Resultado |
|---|---|
| Decisiones de verificacion de estado (aplicacion controlada) | 47/72 a 72/72 decisiones correctas (8 guardados verificados, 64 rechazos apropiados) |
| Afirmaciones de exito no soportadas | Reduccion de 18 a 0 |
| Bateria amplia de debilidades | 59/80 |
| Tareas originales | 16/16 |
| Tareas con etiquetas no vistas previamente | 6/16 |
| Suite de fiabilidad | 26/48 |
| Casos de calibracion posteriores | 16/48 |

Advertencia del autor: estos resultados controlados corresponden a suites pequenas que cubren ocho familias de intenciones entrenadas y no constituyen una tasa general de exito en la web. La tarea compleja de investigacion en web publica sigue fallando. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB para los pesos en bfloat16 (592.641.124 bytes); el espacio adicional depende del contexto y de las estructuras internas, no documentadas. Estimacion propia a partir del numero de parametros.
- Requisitos declarados: Python 3.11 y una GPU CUDA. El archivo `requirements.txt` recoge las versiones del entorno probado, y se requiere `playwright install chromium`.
- GPU recomendadas: no disponibles en la documentacion. Por tamano, el modelo cabe en cualquier GPU consumer con soporte CUDA y al menos 4 GB de VRAM (por ejemplo, RTX 3050, 3060, 4060 o T4 en cloud); esta es una estimacion derivada, no un dato publicado.
- Nota importante: Chromium y Playwright consumen RAM de sistema, no VRAM, y pueden ser el cuello de botella real en equipos modestos.
- Opciones de despliegue: el runtime documentado es el propio paquete (`python tools/browser_agent.py --checkpoint model.safetensors ...` y `python tools/browser_state_verifier.py`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y no hay pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Se excluyen del runtime el checkpoint de calibracion posterior y el clasificador de solo recibos porque introducian regresiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psikosen/canopy-258m-r3-v6 | 296.304.390 | No disponible | Planificador browser-use con verificacion de estado opcional | No disponible | Hugging Face, 0 descargas, 0 likes |
| psikosen/canopy-258m-r3 | No disponible | No disponible | Modelo base declarado del anterior | No disponible | Hugging Face |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio informacion sobre modelos comparables: los resultados obtenidos fueron enlaces genericos a Reddit y a un hilo de soporte de Google, sin relacion con agentes de navegador ni con este modelo. No se dispone, por tanto, de una comparativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no debe tratarse como un agente autonomo de navegacion web de proposito general.
- Los resultados publicados provienen de suites pequenas (ocho familias de intenciones entrenadas) y no son extrapolables a la web abierta; la tarea compleja de investigacion en web publica sigue fallando.
- El planificador puede afirmar falsamente que ha completado una tarea tras editar la seccion equivocada y puede declarar bloqueado un guardado que en realidad fue correcto. El autor advierte de que no se debe repetir automaticamente una escritura solo porque se informe de bloqueo.
- Debilidades reconocidas: etiquetas desconocidas, descripciones de objetivos opacas y flujos largos en web publica.
- El campo `completion_verified` permanece en falso: la respuesta final del modelo no es una comprobacion independiente del exito de la tarea.
- Riesgo operativo: las acciones del navegador pueden modificar el sitio de destino; hay que elegir un objetivo y una cuenta apropiados para las pruebas.
- Idioma: solo ingles, lo que limita su uso en entornos en castellano sin trabajo adicional.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, la redistribucion o la modificacion. Es un caveat critico para produccion.
- Longitud de contexto no disponible, por lo que no se puede planificar el troceado de paginas o historiales largos.
- No hay resultados de benchmarks estandar ni evaluacion independiente externa; el material de metricas procede del propio autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se ha implementado el entrenamiento de recuperacion Wuying ni los metodos de RL de los papers citados, lo que sugiere lineas de mejora pendientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psikosen/canopy-258m-r3-v6
- Modelo base declarado: https://huggingface.co/psikosen/canopy-258m-r3
- Nota: la busqueda web no devolvio papers, blogs, repositorios ni demos relevantes sobre este modelo. Los unicos resultados obtenidos fueron enlaces genericos sin relacion: https://www.reddit.com/r/all/, https://www.reddit.com/r/londonontario/, https://www.reddit.com/r/FundieSnarkUncensored/, https://www.reddit.com/r/CommercialsIHate/ y https://support.google.com/youtube/thread/677093/
- Referencias internas del repositorio citadas en la model card (no verificadas externamente): `metrics/`, `metrics/browser_state_verifier/findings.md`, `evaluation/rejected_receipt_head/`, `release.json`, `manifest.json`, `release_smoke.json`, `requirements.txt`, `tools/browser_agent.py`, `tools/browser_state_verifier.py`, `canopy_r3/`, `miniswardbower/miniswardbower/`
