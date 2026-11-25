# kostask92/kingdom-come-deliverance-2-trainer-v3

## Resumen

El repositorio `kostask92/kingdom-come-deliverance-2-trainer-v3` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows distribuido a traves de la plataforma, etiquetado como "trainer" del videojuego *Kingdom Come: Deliverance 2*, con un binario denominado `delta-executor-pc-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB protegido con contrasena. El repositorio no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia.

La model card describe supuestas capacidades de manipulacion de memoria de proceso en tiempo real (lectura de offsets, overlay externo a 144 Hz, suavizado de entrada por curvas de Bezier, perfilado JSON intercambiable en caliente y descarga por tecla de panico). Ninguno de estos elementos corresponde a un modelo de lenguaje, vision o multimodal; son funciones propias de una herramienta de tipo *cheat* o *trainer* para un juego de PC.

Desde la perspectiva de evaluacion de modelos, este repositorio carece de relevancia tecnica: no hay arquitectura, no hay datos de entrenamiento, no hay benchmarks y no hay API de inferencia. La ficha que sigue documenta la ausencia de esos datos y advierte de los riesgos de seguridad asociados a la ejecucion del binario distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades linguisticas reales) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es `delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB, y un `.exe` interno) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario compilado para Windows 10/11 de 64 bits, distribuido como ZIP con contrasena (`2026`) y ejecutable `delta-executor-pc-2026-v1.2.2-win64.exe` en version `v2.8.5` (build `38EB36`). La model card menciona modulos de lectura de memoria de proceso, escaneo dinamico de offsets, overlay externo mediante Desktop Duplication y perfilado JSON, pero no aporta informacion sobre compilador, dependencias, cadena de build ni reproducibilidad.

Tampoco se documenta ningun dataset, proceso de RLHF, DPO ni tecnica de alineacion. No hay pesos publicados, ni safetensors, ni GGUF, ni ningun otro formato de modelo. El contenido del repositorio es, por tanto, opaco desde el punto de vista de la ingenieria de modelos.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de IA.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma de la model card son metadatos del repositorio, no habilidades del artefacto.
- Las funciones descritas en la model card (overlay externo a 144 Hz, suavizado de entrada, escaneo de offsets, descarga por tecla `END`) corresponden a una herramienta de manipulacion de un videojuego, no a un modelo.

## Casos de uso

- No procede. El repositorio no contiene un modelo que pueda desplegarse para generacion de texto, codigo, atencion al cliente, analisis documental, RAG, agentes ni ninguna otra tarea de IA.
- Cualquier uso del binario `delta-executor-pc-2026-v1.2.2-win64.exe` queda fuera del ambito de esta ficha tecnica de modelos y conlleva riesgos de seguridad no evaluados (ejecucion de codigo de origen desconocido con privilegios de administrador).
- No se identifican escenarios legitimos de aplicacion en pipelines de datos, produccion de software o investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay modelo que cargar en GPU.
- El unico requisito declarado es un sistema Windows 10/11 de 64 bits para ejecutar el binario.
- No hay soporte de vLLM, llama.cpp, Ollama, TGI ni de ningun runtime de inferencia.
- No se dispone de datos de latencia ni de throughput porque no existe carga de trabajo de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable: el repositorio no es un modelo de IA, por lo que no procede compararlo con modelos de lenguaje, vision o multimodal de ningun tamano.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en evaluaciones o pipelines es un error categorico.
- El binario se distribuye como ejecutable de Windows con contrasena en el ZIP y solicitud de ejecucion como administrador, un patron habitual en campanas de malware. No hay verificacion de integridad, firma de codigo ni hash publicado.
- La licencia MIT declarada aplica al contenido del repositorio, pero no garantiza la legalidad ni la seguridad del binario en todas las jurisdicciones; el uso de trainers puede violar los terminos de servicio del videojuego.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide el artefacto.
- No hay informacion sobre sesgos, alucinacion o limites de contexto porque no hay modelo subyacente.
- Se desaconseja su ejecucion en entornos de produccion, maquinas con datos sensibles o equipos de investigacion sin sandboxing y analisis previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kostask92/kingdom-come-deliverance-2-trainer-v3
- Referencia de descarga citada en la model card (GitHub, no verificada): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Referencia de releases citada en la model card (GitHub, no verificada): https://github.com/hansson31102/kingdom-come-deliverance-2-trainer-v3/releases/latest
