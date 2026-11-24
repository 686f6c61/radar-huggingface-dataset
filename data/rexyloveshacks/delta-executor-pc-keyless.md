# RexyLoveshacks/delta-executor-pc-keyless

## Resumen

El repositorio `RexyLoveshacks/delta-executor-pc-keyless` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como si fuese una model card, pero cuyo contenido real es la distribucion de un ejecutor de scripts para Roblox (Delta Executor) en su variante "keyless" para Windows x64, empaquetado en un archivo ZIP protegido con contrasena.

El texto del README mezcla terminologia propia de fichas de modelos (etiquetas de licencia, idiomas, pipeline) con instrucciones para descargar y ejecutar un binario de terceros alojado en GitHub, ademas de enlaces a repositorios ajenos al autor declarado. No hay pesos, tokenizador, configuracion de arquitectura ni artefactos de inferencia: el repositorio no contiene ningun modelo entrenado.

Desde el punto de vista editorial, esta ficha documenta un caso de uso indebido del Hub de Hugging Face como canal de distribucion de software ejecutable potencialmente malicioso. La ficha se redacta con caracter informativo y de advertencia: no se recomienda su descarga ni ejecucion, y se detallan los indicadores de riesgo observados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, no capacidades del modelo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto referenciado es `rob-run-cheat-mod-menu-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado al repositorio. El contenido declarado es un ejecutable de Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB, con contrasena de extraccion `2026`, que el autor describe como un "roblox executor" con puente a la maquina virtual Luau, API Drawing, `hookmetamethod` y `getgc`.

El README afirma cifras de rendimiento no verificables (respuesta en menos de 22 ms, uso inferior a 54 MB de RAM, 98,8 % de consistencia en sincronizacion de offsets, 12 hilos de trabajo) y una compatibilidad "98 %+ sUNC". No se aporta codigo fuente, hash de integridad, firma digital ni trazabilidad del binario. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`cishii039/rob-run-cheat-mod-menu`, `stephanieahmed00092/delta-executor-pc-keyless`) distintos del propietario del repositorio en Hugging Face, lo que impide verificar la cadena de custodia del artefacto.

## Capacidades

- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa razonamiento multi-paso ni modos de pensamiento.
- El autor declara capacidades de ejecucion de scripts Luau dentro de clientes de Roblox, inyeccion de hooks (`hookmetamethod`, `getgc`) y dibujo mediante API Drawing.
- Declara una interfaz de edicion tipo Monaco con resaltado de sintaxis y consola de trazas.
- Declara soporte de multiples instancias simultaneas del cliente objetivo.
- Las capacidades declaradas no son verificables a partir de la informacion disponible y su naturaleza infringe los terminos de servicio de Roblox.

## Casos de uso

- Documentacion de riesgo en plataformas de modelos: este repositorio sirve como ejemplo de artefacto que abusa de las etiquetas de Hugging Face (licencia, idiomas, pipeline) para aparentar ser un modelo y distribuir un binario. Util para equipos de moderacion que disenen heuristicas de deteccion.
- Analisis forense de cadena de suministro: permite estudiar patrones de distribucion (ZIP con contrasena, enlaces a repositorios de GitHub ajenos, insignias de descargas falsas) en ejercicios de formacion en seguridad.
- Auditoria de cumplimiento de licencias: ilustra el caso de un repositorio con licencia MIT declarada que no contiene obra original sujeta a dicha licencia, util para revisar politicas de publicacion.
- Formacion en concienciacion sobre malware: el patron "descarga este ZIP, contrasena 2026, ejecuta como administrador" es un ejemplo didactico clasico de ingenieria social.
- Investigacion sobre contaminacion de datasets: util para quien estudie como repositorios no-modelo contaminan indices y busquedas en el Hub.
- No se identifican casos de uso legitimos de inferencia, generacion o despliegue, dado que no existe modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README (menos de 22 ms, menos de 54 MB de RAM, 98,8 % de consistencia, 12 hilos) son afirmaciones del autor sin metodologia, sin conjunto de prueba y sin posibilidad de reproduccion; no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado por el autor: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como metricas de inferencia; las cifras del README no son verificables.
- Requisito declarado por el autor: ejecutar como administrador, lo que eleva el privilegio del binario sobre el sistema.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Como referencia de categoria, se compara con otros artefactos del mismo tipo observados en el Hub:

| Repositorio | Tipo de artefacto | Parametros | Contexto | Licencia declarada | Contenido verificable |
|---|---|---|---|---|---|
| `RexyLoveshacks/delta-executor-pc-keyless` | Binario Windows x64 (ZIP) | no aplica | no aplica | MIT | No |
| Repositorios de modelos de codigo abierto (p. ej. familias Llama, Qwen, Mistral) | Pesos safetensors/GGUF | 1B-70B+ | 4K-128K+ | Apache-2.0, MIT, licencias comunitarias | Si |
| Repositorios de utilidades (scripts, herramientas CLI) | Codigo fuente | no aplica | no aplica | variable | Depende del repositorio |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imagenes. Cualquier expectativa de inferencia es infundada.
- Riesgo de seguridad alto: el flujo descrito (descargar un ZIP de un repositorio de GitHub de terceros, extraerlo con contrasena y ejecutar el binario como administrador) coincide con el patron habitual de distribucion de malware y de stealers de credenciales.
- El README reconoce explicitamente que Windows Defender y SmartScreen pueden alertar sobre el binario e indica al usuario que lo excluya de la proteccion. Esa instruccion elimina la principal barrera de seguridad del sistema.
- Suplantacion de identidad: el repositorio declara autor `RexyLoveshacks` pero los enlaces de descarga apuntan a `cishii039` y `stephanieahmed00092`, sin relacion verificable con el primero.
- Metricas no verificables: insignias de 864K descargas y valoracion 4,9/5 no se corresponden con los 0 descargos y 0 likes que reporta el Hub en el momento de la consulta.
- Infraccion de terminos de servicio: un ejecutor de scripts para Roblox vulnera los terminos de uso de la plataforma y puede conllevar el baneo de cuentas.
- Licencia: la licencia MIT declarada no aporta garantia alguna sobre el binario distribuido ni sobre su procedencia; en la practica, el usuario asume todo el riesgo.
- Idiomas: las 14 etiquetas de idioma son metadatos sin respaldo en capacidades linguisticas, ya que no hay modelo que procese texto.
- Contaminacion del ecosistema: la presencia de este tipo de repositorios degrada la calidad de las busquedas y de los indices de modelos en Hugging Face.
- Recomendacion: no descargar, no extraer y no ejecutar el artefacto; reportar el repositorio al equipo de moderacion del Hub.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RexyLoveshacks/delta-executor-pc-keyless
- Enlace de descarga referenciado en el README (terceros, no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub referenciado en el README (terceros, no verificado): https://github.com/stephanieahmed00092/delta-executor-pc-keyless/releases/latest
- Terminos de uso de Roblox (relevantes para la legalidad del artefacto): https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use
- Politica de contenido de Hugging Face: https://huggingface.co/content-guidelines
