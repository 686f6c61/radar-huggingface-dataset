# RexyLoveshacks/wave-keyless-executor

## Resumen

`RexyLoveshacks/wave-keyless-executor` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es una página de distribución de un ejecutable de Windows de 4,8 MB (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`) que se presenta como un "executor" de scripts Luau para Roblox, con módulos de ESP y aimbot orientados a trampas en videojuegos. El autor declara licencia MIT y una lista de catorce idiomas, pero no publica pesos, arquitectura ni pipeline de inferencia.

El repositorio carece por completo de los artefactos propios de un modelo: no hay ficheros `safetensors` ni `GGUF`, no hay tokenizador, no hay configuración de transformer, no hay parámetros y no hay datos de entrenamiento. La model card es en realidad un README de marketing con insignias falsas (746K descargas, valoración 5,0/5), enlaces a un ZIP alojado en un repositorio de GitHub de terceros y una contraseña de archivo (`2026`) para extraer el binario.

Desde la perspectiva de evaluación de modelos, este repositorio no es utilizable: no se puede descargar, cuantizar, ejecutar ni comparar. La ficha que sigue documenta los datos disponibles y marca explícitamente como "no disponible" todo aquello que no existe. Se advierte de que el patrón descrito (ZIP con contraseña, ejecutable como administrador, avisos de SmartScreen justificados como "falsos positivos") coincide con la distribución habitual de malware y de software no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; sin verificación) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un binario compilado para Windows x64 (build declarado `v4.9.6`, hash parcial `3CB9C0`) que, según la model card, actúa como puente entre un intérprete Luau y procesos de Roblox mediante inyección de scripts, con módulos de sincronización de offsets tras parches del cliente y compatibilidad declarada con el 98 % de la API sUNC (`hookmetamethod`, `getgc`, Drawing API).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna técnica de modelado. Los "rendimientos" que menciona el README (235 Hz y 453 Hz de sondeo, respuesta en menos de 34 ms, 13 hilos de trabajo) son métricas de un programa de inyección, no de un modelo, y no vienen acompañadas de metodología reproducible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve matemáticas ni procesa imágenes.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos (catorce idiomas) no está respaldado por ningún artefacto de modelo; probablemente describe la interfaz del ejecutable.
- Funcionalidad declarada por el autor: editor Monaco multi-pestaña con resaltado de sintaxis, consola de trazas, inyección de scripts sin clave ("keyless"), adjunción a múltiples instancias y actualización automática de firmas los miércoles.
- Módulos declarados en el nombre del paquete: ESP y aimbot para el juego Deadlock, es decir, trampas en un juego multijugador.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que el autor plantea son los siguientes, descritos aquí únicamente a efectos de documentación:

- Ejecución de scripts Luau en Roblox: el binario se presenta como intérprete que inyecta scripts en el cliente del juego; requiere ejecución como administrador y desactivar protecciones del sistema.
- Trampas en Deadlock: el nombre del paquete (`deadlock-cheat-esp-aimbot`) indica funcionalidad de ESP (visualización de enemigos a través de paredes) y aimbot (apuntado automático), lo que viola los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Automatización de tareas repetitivas en el cliente: no documentada, sin API pública verificable.
- Distribución de software portable: el ZIP con contraseña y el ejecutable único son un patrón de empaquetado, no una capacidad del modelo.
- Integración en pipelines de desarrollo: no aplicable; no hay SDK, ni API HTTP, ni bindings documentados.
- Evaluación comparativa de modelos: no aplicable; no hay pesos ni métricas reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del README (235 Hz, 453 Hz, menos de 34 ms, 13 hilos) son parámetros de sondeo y temporización de un ejecutable, sin conjunto de prueba, sin baseline y sin metodología, por lo que no constituyen benchmarks de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, procesador Intel o AMD x64, 4,8 MB de espacio en disco para el ZIP y permisos de administrador para ejecutar el binario.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con ningún runtime de inferencia.
- Latencia y throughput: no disponibles como métricas de modelo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el repositorio no contiene un modelo de IA. Frente a un LLM open source de cualquier tamaño, la diferencia no es de rendimiento sino de naturaleza del artefacto (binario ejecutable frente a pesos neuronales).

| Criterio | wave-keyless-executor | Modelo de IA open source típico |
|---|---|---|
| Pesos descargables | No | Sí (safetensors, GGUF) |
| Parámetros | No aplicable | Millones a cientos de miles de millones |
| Contexto | No aplicable | Miles a millones de tokens |
| Runtime de inferencia | No compatible | vLLM, llama.cpp, TGI, Ollama |
| Evaluación reproducible | No | Benchmarks publicados |
| Licencia | MIT (declarada) | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse ni evaluarse como tal en comparativas de modelos.
- El artefacto distribuido es un ejecutable de Windows que el propio README indica ejecutar como administrador y con advertencias de SmartScreen y Windows Defender; el patrón (ZIP con contraseña, binario único, "falso positivo" justificado) es de alto riesgo de malware.
- Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`rocha1838/deadlock-cheat-esp-aimbot-2026`) distinto del autor declarado, lo que impide verificar la cadena de custodia del binario.
- La funcionalidad declarada (ESP, aimbot, inyección en procesos de un juego) viola los términos de servicio de Roblox y Deadlock y puede constituir una infracción de sus condiciones de uso; el uso puede derivar en baneo permanente.
- Las insignias de descargas (746K+) y valoración (5,0/5) no son verificables y contradicen los contadores reales de Hugging Face (0 descargas, 0 likes).
- La licencia MIT declarada cubre, en su caso, el código del autor; no otorga derechos sobre el juego objetivo ni sobre componentes de terceros embebidos.
- No hay garantía de funcionamiento, soporte, actualizaciones ni auditoría de seguridad; la fecha de creación y actualización (2026-11-24) es la única traza temporal.
- Riesgo de alucinación: no aplicable, al no existir componente generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RexyLoveshacks/wave-keyless-executor
- Repositorio GitHub del autor declarado: https://github.com/SanjayLefevre70/wave-keyless-executor
- Repositorio GitHub del binario distribuido: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Enlace de descarga citado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog técnico, demo o documentación de API: no disponibles.
