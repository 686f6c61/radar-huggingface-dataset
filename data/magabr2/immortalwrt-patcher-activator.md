# Magabr2/immortalwrt-patcher-activator

## Resumen

`Magabr2/immortalwrt-patcher-activator` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es un ejecutable de Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, version 4.4.8) empaquetado en un ZIP de 4,8 MB protegido con contrasena. La model card lo describe como una herramienta de tipo "game cheat" (overlay externo, radar 2D, filtro de loot, escaner de offsets y capa de renderizado que evita la captura por OBS, ShadowPlay y Discord), no como un modelo de lenguaje, vision o audio.

El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y los 14 idiomas declarados corresponden a la interfaz del ejecutable, no a capacidades linguisticas de un modelo. Por tanto, esta ficha documenta el artefacto tal como aparece publicado y senala explicitamente los campos que no aplican o no estan disponibles.

Es relevante ahora unicamente como caso de estudio de riesgo en la cadena de suministro de software: un paquete distribuido a traves de Hugging Face y de enlaces a releases de GitHub, con contrasena fija y peticion de ejecucion como administrador, que no debe confundirse con un modelo open source. No se recomienda su descarga ni ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de la interfaz del ejecutable, no del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `A8F91DFD71`, version 4.4.8) que, segun la model card, implementa un nucleo externo en modo usuario sin hooks DLL internos, un overlay externo a 144 Hz o mas con cajas 2D/3D y esqueletos, un radar 2D con filtrado de loot a 411 Hz de sondeo, un escaner dinamico de offsets con un 96,9 % de consistencia declarada, una tecla de panico (`END`) para descarga inmediata y una capa de renderizado que evita la captura de pantalla por herramientas de streaming.

No se documenta dataset, numero de tokens, RLHF, DPO ni ninguna innovacion de modelado. La unica "innovacion" declarada es de evasion: exclusión de la captura por OBS, ShadowPlay y Discord, y salida del proceso sin rastro. El consumo de RAM declarado es inferior a 29 MB.

## Capacidades

- No genera texto, codigo, matematicas ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues de modelo; los 14 idiomas listados son etiquetas de la model card.
- Capacidades declaradas del ejecutable: overlay externo con cajas 2D/3D y esqueletos, radar 2D, filtro de loot por rareza, escaner de offsets tras parches del juego, tecla de panico y capa anti-captura de pantalla.
- Estas capacidades estan orientadas a la manipulacion de videojuegos y a evadir la deteccion y la grabacion, no a tareas de IA.

## Casos de uso

No se identifican casos de uso legitimos de IA para este artefacto. Los escenarios que la model card sugiere son de trampa en videojuegos y evasion de captura, y se listan solo a efectos descriptivos:

- Overlay de informacion en juegos multijugador: el ejecutable dibuja cajas y esqueletos sobre el juego mediante Desktop Duplication, lo que constituye una ventaja injusta y suele violar los terminos de servicio de las plataformas.
- Radar y filtro de objetos: sondeo a 411 Hz con culling por rareza, orientado a localizar recursos dentro del juego.
- Escaneo de offsets tras actualizaciones: resolucion automatica de firmas de punteros para mantener el funcionamiento tras parches del juego.
- Evasion de grabacion: capa de renderizado que excluye el overlay de OBS, ShadowPlay y Discord, disenada para que la trampa no quede registrada en directo.
- Descarga rapida del proceso: tecla `END` para liberar handles y salir sin rastro.
- Auditoria de seguridad defensiva: el propio paquete puede analizarse en un entorno aislado como muestra de malware o de software no deseado, sin ejecutarlo en un equipo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos de la model card son de rendimiento del ejecutable, no de un modelo: overlay a 144 Hz o mas, sondeo de radar a 411 Hz, 96,9 % de consistencia del escaner de offsets y menos de 29 MB de RAM. No son comparables con MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica; el ejecutable no declara requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 u 11 de 64 bits, segun la model card.
- Espacio en disco: 4,8 MB para el ZIP; el tamano descomprimido no esta disponible.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI). El unico "despliegue" descrito es extraer el ZIP con la contrasena `2026` y ejecutar el `.exe` como administrador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Frente a otros repositorios de Hugging Face, la diferencia categorica es que este no contiene pesos ni codigo de inferencia, sino un binario de Windows.

| Criterio | Este repositorio | Modelo de IA tipico en Hugging Face |
|---|---|---|
| Contenido | ZIP con `.exe` para Windows x64 | Pesos (safetensors, GGUF) y configuracion |
| Pipeline | no disponible | text-generation, image-text-to-text, etc. |
| Pesos | no | si |
| Inferencia | no aplica | via transformers, vLLM, llama.cpp |
| Licencia | MIT | variable (Apache-2.0, MIT, Llama, etc.) |
| Descargas | 0 | variable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: la model card pide ejecutar un binario desconocido como administrador, con contrasena fija (`2026`) y distribuido mediante enlaces a releases de GitHub de terceros. Es un patron habitual de distribucion de malware.
- La propia model card admite que Windows Defender y SmartScreen pueden alertar por tratarse de un "game cheat"; esas alertas no deben ignorarse.
- Uso en juegos: viola habitualmente los terminos de servicio de las plataformas y puede conllevar el baneo de cuentas.
- Evasion de captura: la capa anti-OBS, anti-ShadowPlay y anti-Discord esta disenada para ocultar actividad, lo que dificulta la auditoria y el registro.
- Licencia MIT declarada, pero la licencia no garantiza la legitimidad ni la seguridad del binario; el codigo fuente no esta publicado.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion y actualizacion identicas (2026-11-24), sin historial de versiones verificable en Hugging Face.
- No usar en produccion, en equipos corporativos ni en maquinas con datos sensibles. Si se analiza, hacerlo en una maquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Magabr2/immortalwrt-patcher-activator
- Release enlazada en la model card (GitHub, terceros): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Repositorio de releases alternativo citado: https://github.com/SibelRaza/immortalwrt-patcher-activator/releases/latest
- Paper, blog, demo o repositorio oficial: no disponible
