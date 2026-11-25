# cdrone360/decky-loader-cryoutilities-steamos

## Resumen

El repositorio `cdrone360/decky-loader-cryoutilities-steamos` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es una página de descarga que distribuye un ejecutable de Windows (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP protegido con contraseña. La model card no describe arquitectura, pesos, tokenizador ni proceso de entrenamiento alguno; en su lugar incluye instrucciones para descargar, descomprimir y ejecutar un binario con privilegios de administrador.

El texto se presenta como una supuesta herramienta de rendimiento y automatización para Windows 10/11 de 64 bits, con referencias a "Decky Loader", "CryoUtilities" y "SteamOS", que son componentes legítimos del ecosistema de la Steam Deck, pero que no guardan relación con el binario distribuido. La combinación de contraseña en el archivo comprimido, instrucciones para desactivar advertencias de Windows Defender y SmartScreen, y un ejecutable sin firma ni código fuente es un patrón habitual de distribución de malware.

Por tanto, esta ficha no puede documentar especificaciones técnicas, capacidades ni benchmarks de un modelo, ya que no existe ninguno. Se documenta el artefacto como lo que es y se advierte explícitamente de los riesgos asociados a su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio aloja una página descriptiva y enlaza a un binario alojado en un repositorio de GitHub de terceros (`schneider6972/solara-executor-v3-keyless-2026`). El contenido del ZIP no es inspeccionable desde la información disponible y no se publica código fuente, hash de verificación ni firma digital del ejecutable.

La model card menciona de forma vaga "Luau VM bridge", "monaco editor workspace", "post-patch offset sync" y "worker threads", términos que sugieren un supuesto inyector de scripts para un entorno de ejecución tipo Roblox (Luau es el lenguaje de Roblox), pero no se aporta ninguna documentación técnica verificable que respalde esas afirmaciones.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües reales; los idiomas listados son etiquetas de metadatos del repositorio, no idiomas de un modelo.
- El artefacto distribuido es un ejecutable de Windows que, según su propia descripción, realizaría inyección de scripts y adjuntado a procesos ("process attachment"), lo que constituye una capacidad de manipulación de otros procesos del sistema, no una capacidad de IA.

## Casos de uso

- No procede. Al no ser un modelo de IA, no tiene casos de uso legítimos de inferencia, generación ni análisis.
- El único uso posible del artefacto es la ejecución del binario de Windows que distribuye, lo cual se desaconseja por los motivos expuestos en la sección de limitaciones y advertencias.
- No se debe utilizar en entornos de producción, investigación ni desarrollo.
- No se debe integrar en pipelines de CI/CD, agentes ni aplicaciones.
- No se debe ejecutar en máquinas con datos sensibles, credenciales o acceso a red corporativa.
- Si se ha descargado por error, se recomienda eliminarlo y analizar el sistema con una herramienta antimalware actualizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (por ejemplo, "97,5 % de consistencia", "< 34 ms", "580K+ descargas", "99 % verificado") son afirmaciones de marketing sin metodología, sin conjunto de evaluación y sin posibilidad de verificación; no constituyen benchmarks.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay inferencia de modelo.
- El binario distribuido está compilado para Windows 10/11 de 64 bits sobre procesadores x64 (Intel y AMD), según la propia descripción.
- No se especifican requisitos de RAM, CPU ni almacenamiento más allá del tamaño del ZIP (4,8 MB declarados).
- No hay opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, porque no existe un modelo que servir.
- No se dispone de datos de latencia ni throughput verificables.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque el artefacto no es un modelo de IA. Compararlo con modelos de lenguaje, visión o audio sería categóricamente incorrecto.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la ficha se limita a documentar el artefacto alojado.
- El ZIP distribuido requiere contraseña (`2026`), lo que impide el análisis previo del contenido por parte de herramientas automáticas de escaneo.
- La model card incluye instrucciones para ejecutar el binario "como administrador" y para sortear alertas de Windows Defender y SmartScreen, práctica habitual en la distribución de software malicioso.
- El ejecutable no va acompañado de código fuente, firma digital ni hash de verificación publicado en el repositorio de Hugging Face.
- El binario se aloja en un repositorio de GitHub de un tercero distinto del autor del repositorio de Hugging Face, lo que dificulta la trazabilidad.
- El uso de nombres de proyectos legítimos (Decky Loader, CryoUtilities, SteamOS) como señuelo es un indicio de ingeniería social.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario distribuido ni sobre su comportamiento en el sistema del usuario.
- Riesgo alto de malware, robo de credenciales, persistencia no autorizada y compromiso del sistema anfitrión.
- No se debe descargar, descomprimir ni ejecutar el artefacto en ningún sistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cdrone360/decky-loader-cryoutilities-steamos
- Repositorio de GitHub referenciado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Enlace de descarga del ZIP citado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Repositorio de GitHub alternativo citado en la model card: https://github.com/Isha4274/decky-loader-cryoutilities-steamos
- No se han encontrado papers, blogs técnicos ni demos oficiales asociados al artefacto.
