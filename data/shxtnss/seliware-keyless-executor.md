# shxtnss/seliware-keyless-executor

## Resumen

`shxtnss/seliware-keyless-executor` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutor de scripts para Windows x64, comercializado como "Seliware Keyless Executor" y empaquetado en un archivo ZIP llamado `rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip`. La model card describe funcionalidades propias de un *exploit* para el cliente de Roblox: adjuntado instantáneo al proceso, inyección de scripts Luau, editor Monaco, sincronización de offsets tras parches y compatibilidad con la API de *drawing*, entre otras. No hay pesos, tokenizador, arquitectura de red neuronal ni pipeline de inferencia.

El repositorio no contiene ningún artefacto relacionado con aprendizaje automático: los tags declarados (`windows`, `windows-11`, `x64`, `portable`) y los idiomas listados (14 códigos ISO) son metadatos genéricos sin relación con capacidades lingüísticas reales. La ficha se redacta, por tanto, como advertencia técnica y de seguridad, no como evaluación de un modelo.

Es relevante ahora porque ilustra un patrón de abuso de Hugging Face como plataforma de distribución de binarios potencialmente maliciosos, con instrucciones explícitas para desactivar advertencias de SmartScreen y ejecutar como administrador, lo que constituye un riesgo directo para quien siga las instrucciones de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario ejecutable para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible como capacidad del modelo; la model card lista en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id como metadatos |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito es un ejecutable Windows (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, build `v1.0.9`, identificador `84A31C5F93`) distribuido dentro de un ZIP de 4,8 MB protegido con la contraseña `2026`. Según la model card, el binario implementa un puente con una máquina virtual Luau, adjuntado a procesos del cliente de Roblox, un editor Monaco multi-pestaña, sincronización automática de offsets tras los parches de los miércoles y compatibilidad declarada del 98 % con la suite de pruebas sUNC.

No se documenta ningún conjunto de datos, tokenizador, función de pérdida, RLHF, DPO ni innovación de inferencia. Los datos técnicos disponibles se limitan a cifras de rendimiento del propio ejecutable (menos de 53 MB de RAM, respuesta en menos de 27 ms, 16 hilos de trabajo) y no son verificables ni auditables.

## Capacidades

- Inyección y ejecución de scripts Luau en el proceso del cliente de Roblox, según la descripción del autor.
- Adjuntado a múltiples instancias del cliente de forma simultánea.
- Editor de código Monaco con resaltado de sintaxis y traza de consola.
- Sincronización de offsets tras actualizaciones del cliente.
- Compatibilidad declarada con `hookmetamethod`, `getgc` y la API de *Drawing* (98 % sUNC).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües reales.

## Casos de uso

- Ninguno legítimo en el ámbito de la IA: el artefacto no es un modelo y no puede emplearse para inferencia, generación ni procesamiento de lenguaje.
- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar si contiene código malicioso, dado que la model card instruye a ejecutarlo como administrador y a sortear SmartScreen.
- Estudio de patrones de abuso de plataformas: documentar cómo se emplean repositorios de Hugging Face para distribuir ejecutables ajenos al ecosistema de IA.
- Formación en ciberseguridad: usar el caso como ejemplo de ingeniería social (contraseña en el ZIP, insignias de "5.0/5", cifras de descargas no verificables).
- Monitorización de la plataforma: incluir el repositorio en listas de bloqueo o en sistemas de detección de contenido no relacionado con modelos.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, servir de referencia para la retirada y el análisis forense del equipo afectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (menos de 53 MB de RAM, menos de 27 ms de respuesta, 98 % de compatibilidad sUNC) son afirmaciones del autor sin metodología ni verificación independiente, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- Almacenamiento: archivo ZIP de 4,8 MB; el ejecutable extraído ocupa un espacio no especificado.
- Memoria RAM declarada por el autor: menos de 53 MB en funcionamiento.
- Opciones de despliegue: ninguna de las habituales en IA (vLLM, llama.cpp, Ollama, TGI) es aplicable.
- Latencia y throughput: no disponibles de forma fiable; las cifras del autor no son auditables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, porque el artefacto no es un modelo. Otros ejecutores de scripts para Roblox (por ejemplo, variantes comerciales de *executors*) quedan fuera del alcance de esta ficha y no se comparan aquí.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje y no admite cuantización ni inferencia.
- Riesgo de seguridad elevado: la model card pide ejecutar el binario como administrador, extraerlo con una contraseña fija (`2026`) y sortear las alertas de Windows Defender y SmartScreen, lo que dificulta el análisis y favorece la ejecución de código no verificado.
- Procedencia dudosa: el ZIP se aloja en un repositorio de GitHub de terceros (`Shuji50/rob-run-cheat-mod-menu-pc`) distinto del repositorio de Hugging Face, y el nombre del binario no guarda relación con el nombre del proyecto.
- Posible infracción de términos de servicio: la funcionalidad descrita (inyección de scripts en el cliente de Roblox) contraviene habitualmente las condiciones de uso de la plataforma de destino.
- Licencia MIT declarada: cubre el contenido del repositorio, pero no otorga garantías ni responsabilidad alguna sobre el binario distribuido; su aplicabilidad a un ejecutable de terceros es cuestionable.
- Idiomas: la lista de 14 idiomas es metadato decorativo; no hay evidencia de soporte lingüístico.
- Sin mantenimiento verificable: 0 descargas y 0 *likes* en Hugging Face en la fecha de consulta, frente a las 48 000 descargas que afirma la model card, lo que sugiere cifras infladas.
- Para producción: no debe desplegarse en ningún entorno; si se manipula, hacerlo exclusivamente en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shxtnss/seliware-keyless-executor
- Repositorio de GitHub citado en la model card: https://github.com/christianfernandes088/seliware-keyless-executor
- Repositorio de GitHub del que procede el ZIP: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc
- Descarga del ZIP citada en la model card: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
