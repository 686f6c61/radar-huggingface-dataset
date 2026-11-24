# deeess/mm2-murder-mystery-2-script-keyless

## Resumen

La ficha solicitada corresponde al identificador `deeess/mm2-murder-mystery-2-script-keyless`, publicado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un paquete ejecutable para Windows x64 presentado como "script keyless" para el videojuego *Murder Mystery 2* de Roblox. El repositorio no contiene pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la model card describe un ejecutable portable (`schedule-1-cheat-trainer-v1.2.2-win64.exe`) distribuido en un ZIP de 4,8 MB alojado en GitHub Releases.

El artefacto se anuncia con funciones propias de un cheat o trainer de videojuegos: salto automatico de servidores, guardia anti-AFK, teleport por coordenadas, ESP de entidades y cofres, alertas mediante webhook de Discord y configuracion JSON persistente. La model card incluye instrucciones para extraer el archivo con contrasena y ejecutarlo como administrador, ademas de indicaciones para sortear avisos de Windows Defender y SmartScreen.

Por tanto, esta ficha no puede documentar arquitectura, parametros, contexto, cuantizaciones ni benchmarks, porque esos conceptos no aplican al contenido publicado. Se detalla a continuacion lo que si consta en la informacion proporcionada, junto con las advertencias de seguridad y licencia pertinentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` para Windows 10/11 64 bits) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que documentar. El repositorio aloja un binario portable para Windows x64, identificado en la model card como `schedule-1-cheat-trainer-v1.2.2-win64.exe`, version `v2.6.3` (build `52FD86`), empaquetado en un ZIP de 4,8 MB. La model card menciona modulos internos como salto de servidores con temporizacion por hardware, guardia anti-AFK mediante pulso de entrada virtual, teleport por coordenadas, ESP 3D de entidades y cofres, configuracion JSON persistente y alertas por webhook de Discord. No se aporta ninguna especificacion tecnica verificable sobre el binario, su cadena de compilacion ni su comportamiento real.

El artefacto se distribuye a traves de enlaces a GitHub Releases de terceros, no desde el propio repositorio de Hugging Face. La model card incluye una contrasena de extraccion (`2026`) y recomienda ejecutar el binario como administrador, ademas de justificar los avisos de Windows Defender y SmartScreen como falsos positivos heuristicos. Ninguno de estos extremos es verificable con la informacion disponible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No dispone de tool calling ni function calling en el sentido de los modelos de IA.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; la lista de idiomas del repositorio parece metadato de descubrimiento, no una funcionalidad del binario.
- El binario se anuncia con funciones de automatizacion sobre el cliente de Roblox: salto de servidores, anti-AFK, teleport, ESP y notificaciones por webhook.
- No se documenta ninguna capacidad de vision, audio ni modo de razonamiento.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no tiene aplicaciones en procesamiento de lenguaje natural, generacion de codigo, atencion al cliente ni analisis de datos.
- Automatizacion de partidas en *Murder Mystery 2*: es el uso que declara el autor, mediante salto de servidores y teleport, si bien se trata de una finalidad contraria a las condiciones de uso de Roblox.
- Ejecucion de scripts en el cliente de Roblox: el binario se presenta como "keyless", es decir, sin sistema de claves de activacion.
- Notificaciones externas de eventos de partida mediante webhook de Discord, segun la model card.
- Perfilado de configuracion persistente en JSON para recordar ajustes entre sesiones, segun la model card.
- Ninguno de estos casos es recomendable en produccion ni en entornos profesionales; se listan unicamente para reflejar el contenido declarado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningun tipo, y las cifras que aparecen en la model card (por ejemplo, `99.6%` de consistencia, `364 Hz` de polling o `< 22 ms` de respuesta) son afirmaciones del autor sin metodologia ni evidencia verificable, por lo que no se recogen como resultados.

## Requisitos de hardware

- Sistema operativo: Windows 10/11 de 64 bits, segun la model card.
- Procesador: x64 de Intel o AMD, segun la model card.
- VRAM: no disponible (no aplica; no hay inferencia de red neuronal).
- GPU recomendadas: no disponible (no aplica).
- Compatibilidad con GPU de consumo: no disponible (no aplica).
- Opciones de despliegue: no disponible; el autor indica ejecutar el `.exe` como administrador tras extraer el ZIP con contrasena.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la informacion proporcionada otros paquetes de la misma categoria con los que establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal en pipelines de NLP, vision o agentes.
- Riesgo de seguridad alto: la distribucion de ejecutables que requieren permisos de administrador, contrasena de extraccion y desactivacion de avisos de Defender o SmartScreen es un patron habitual de malware. No se puede verificar el contenido real del binario con la informacion disponible.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros ajenos al autor del repositorio de Hugging Face, lo que impide atribuir su procedencia.
- Uso contrario a las condiciones de servicio de Roblox: la automatizacion y los cheats en *Murder Mystery 2* pueden conllevar el baneo de la cuenta del usuario.
- La licencia MIT declarada cubre el contenido del repositorio, pero no aclara la situacion legal del binario distribuido externamente ni de las marcas de terceros mencionadas.
- La lista de idiomas del repositorio no implica soporte real de localizacion en el binario.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- No se debe ejecutar el binario en entornos de produccion, equipos corporativos ni maquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deeess/mm2-murder-mystery-2-script-keyless
- Enlace de descarga citado en la model card (GitHub Releases de terceros): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros): https://github.com/thomasfontana8267/mm2-murder-mystery-2-script-keyless/releases/latest
