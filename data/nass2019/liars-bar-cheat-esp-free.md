# NASS2019/liars-bar-cheat-esp-free

## Resumen

El artefacto publicado bajo el identificador `NASS2019/liars-bar-cheat-esp-free` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (archivo `.zip` de 4,8 MB con contraseña de descompresión) que, segun su propia model card, distribuye una herramienta de trampas ("cheat") con funcionalidad de ESP (deteccion visual de jugadores) para el videojuego *Liar's Bar*. El autor lo etiqueta con metadatos propios de un repositorio de modelos (licencia MIT, lista de idiomas, etiquetas de región), pero el contenido real es un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` que se ejecuta como administrador en Windows 10/11.

El problema que dice resolver es la automatizacion de asistencia en partidas multijugador: superposicion de informacion, suavizado de entrada con curvas de Bezier, escaneo dinamico de offsets de memoria y una capa de renderizado que evita la captura por OBS, ShadowPlay y Discord. Tecnicamente no hay arquitectura de red neuronal, ni parametros, ni contexto, ni pesos: la ficha de especificaciones convencional no aplica y la mayoria de campos quedan como "no disponible".

Es relevante ahora unicamente como caso de estudio de contaminacion de repositorios: un artefacto de software potencialmente malicioso (ejecutable ofuscado con contrasena, alojado en GitHub Releases y promocionado desde Hugging Face) disfrazado con metadatos de modelo. Cualquier evaluacion debe tratar este repositorio como software no fiable, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win32/x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de la model card, no capacidades del binario) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un `.zip` con un `.exe` en su interior |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. Segun la model card, el binario incorpora un nucleo externo en modo usuario con renderizado mediante Desktop Duplication (sin hooks DLL internos), un escaner dinamico de offsets con resolucion automatica de firmas de punteros tras parches del juego, suavizado de entrada temporizado por hardware con curvas de Bezier a 457 Hz de sondeo y una capa de renderizado que excluye la captura de pantalla en OBS, ShadowPlay y Discord. El consumo declarado es inferior a 40 MB de RAM y el tiempo de respuesta de la tecla de panico (`END`) es inferior a 19 ms.

No hay datos de entrenamiento, tokens, composicion de dataset ni fases de RLHF/DPO porque no se trata de un modelo entrenado. Las unicas cifras tecnicas son las del manifiesto de release: version 4.8.2, firma `C469DC66DA`, archivo `fisch-script-auto-catch-macro-v1.2.2-win64.zip` y contrasena de extraccion `2026`.

## Capacidades

- Superposicion visual (ESP) sobre el juego *Liar's Bar* para mostrar informacion de jugadores.
- Suavizado de entrada con curvas de Bezier configurables (radio de FOV, VisCheck, curvas humanizadas) a 457 Hz.
- Escaneo dinamico de offsets de memoria con resolucion automatica de firmas tras actualizaciones del juego.
- Capa de renderizado "stream-proof" que evita la captura por OBS, ShadowPlay y Discord.
- Tecla de panico (`END`) con liberacion de handles y salida del proceso en menos de 19 ms.
- Perfiles JSON intercambiables en caliente con una tecla (presets Legit, Visual y Custom).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- **Auditoria de seguridad de repositorios**: usar este artefacto como muestra de referencia para entrenar o validar clasificadores que detecten paquetes disfrazados de modelos en Hugging Face, GitHub Releases y registros similares.
- **Analisis de malware en entorno aislado**: extraer el `.zip` con la contrasena documentada (`2026`) dentro de una maquina virtual sin red y analizar el binario con herramientas de reversing para identificar tecnicas de evasion de captura y manipulacion de memoria.
- **Concienciacion en equipos de soporte**: ilustrar en formaciones internas como los metadatos de licencia MIT y una lista de idiomas pueden dar apariencia legitima a un ejecutable de origen desconocido.
- **Politicas de bloqueo en proxies corporativos**: incorporar el dominio de GitHub Releases asociado y el identificador del repositorio a listas de denegacion para impedir su descarga desde la red de la organizacion.
- **Investigacion sobre trampas en juegos multijugador**: documentar las tecnicas declaradas (Desktop Duplication, escaneo de offsets, bezier smoothing) para que los equipos antitrampas actualicen sus heuristicas de deteccion.
- **Evaluacion de riesgos de cadena de suministro**: revisar como un mismo artefacto se promociona desde dos cuentas distintas (Hugging Face y GitHub) con nombres de fichero incoherentes (`fisch-script-auto-catch-macro` frente a `liars-bar-cheat-esp-free`), senal tipica de campanas de distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas declaradas son de rendimiento del binario, no de un modelo: sondeo de entrada a 457 Hz, consumo de RAM inferior a 40 MB y latencia de la tecla de panico inferior a 19 ms. No son verificables ni comparables con ningun modelo.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (x64), segun la model card.
- RAM: menos de 40 MB declarados por el proceso.
- GPU: no se especifica ninguna; el renderizado usa Desktop Duplication, que depende de la API grafica del sistema, no de CUDA.
- VRAM estimada: no disponible (no aplica).
- Cabe en cualquier equipo de consumo con Windows x64; no requiere GPU dedicada.
- Opciones de despliegue: ejecucion directa del `.exe` como administrador; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles mas alla de las cifras declaradas por el autor (no verificadas).

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable: el artefacto no es un modelo de IA y no hay benchmarks ni especificaciones de red neuronal que permitan una comparacion con alternativas de la misma tarea.

## Limitaciones y advertencias

- **No es un modelo de IA**: no genera texto, no razona, no procesa lenguaje natural ni imagenes. Cualquier intento de cargarlo con transformers, vLLM u Ollama fallara.
- **Riesgo de seguridad alto**: se distribuye un ejecutable ofuscado dentro de un `.zip` protegido con contrasena y alojado en un repositorio de GitHub de terceros. La contrasena evita el analisis automatico por parte de antivirus y plataformas de escaneo.
- **Posible malware**: la combinacion de ejecutable como administrador, evasion de captura de pantalla y resolucion dinamica de offsets de memoria es compatible con tecnicas de software malicioso. No debe ejecutarse en equipos de produccion ni personales.
- **Incoherencia de identidad**: el nombre del repositorio (`liars-bar-cheat-esp-free`) no coincide con el del binario (`fisch-script-auto-catch-macro`), lo que sugiere reutilizacion de artefactos entre campanas distintas.
- **Licencia**: se declara MIT, pero una licencia declarada en metadatos no otorga legitimidad ni garantia alguna sobre el binario distribuido.
- **Uso en juegos**: la distribucion y uso de trampas en juegos multijugador puede violar los terminos de servicio de la plataforma y la legislacion de proteccion de servicios tecnicos en algunas jurisdicciones.
- **Sin soporte ni mantenimiento**: cero descargas y cero likes en el momento de la consulta; sin issues, sin documentacion tecnica verificable y sin autor identificable.
- **Idiomas**: la lista de idiomas de la model card corresponde a etiquetas de metadatos, no a capacidades linguisticas reales del binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NASS2019/liars-bar-cheat-esp-free
- Release de GitHub referenciada en la model card: https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub referenciado: https://github.com/ricardopham4086/liars-bar-cheat-esp-free/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
