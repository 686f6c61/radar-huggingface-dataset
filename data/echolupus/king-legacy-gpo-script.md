# EchoLupus/king-legacy-gpo-script

## Resumen

El artefacto publicado bajo el identificador `EchoLupus/king-legacy-gpo-script` no es un modelo de inteligencia artificial. Se trata de un ejecutable portable para Windows de 64 bits (`king-legacy-gpo-script-v1.2.0-win64.exe`, build `v2.9.4` / `471A16`) distribuido en un archivo ZIP de 8,9 MB, presuntamente orientado a la automatización de tareas dentro del videojuego Roblox (farmeo, teletransporte, alertas por webhook de Discord, anti-AFK y optimización de framerate). La model card se limita a instrucciones de descarga, extracción con contraseña y ejecución como administrador.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Los tags de Hugging Face (`windows`, `x64`, `portable`) y los idiomas declarados (14 códigos ISO) son metadatos genéricos, no indicativos de capacidades lingüísticas reales. No existe pipeline definido ni información sobre parámetros, contexto o entrenamiento.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable y advierte de los riesgos asociados a la distribución de binarios ejecutables con contraseña de descompresión y solicitud de privilegios de administrador, un patrón habitual en campañas de malware. Cualquier evaluación técnica de capacidades, benchmarks o requisitos de hardware carece de sentido en este caso y se indica explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del autor; sin verificación) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` dentro de un `.zip` de 8,9 MB) |
| Build declarado | v2.9.4 (471A16) |
| Plataforma objetivo | Windows 10 / 11 de 64 bits (Intel y AMD x64) |
| Contraseña del archivo | `2026` (indicada en la model card) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No aplica. No se ha publicado ninguna arquitectura de red neuronal, configuración de transformer, mezcla de expertos ni esquema de entrenamiento. El contenido del repositorio es una model card con enlaces a un binario alojado en un repositorio de GitHub de terceros (`irenejaved/king-legacy-gpo-script`), no en Hugging Face.

La model card describe funcionalidades de manipulación de memoria de proceso («direct-memory automated farm loop», «direct-memory discord webhook alerts»), lo que sugiere interacción con el espacio de memoria de otro proceso (presumiblemente el cliente de Roblox). No se aporta documentación técnica, código fuente, hashes de verificación ni firma digital del binario.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay soporte verificable de tool calling ni de function calling en el sentido de un modelo de lenguaje.
- No hay modo de razonamiento (thinking), ventana de contexto ni tokenizador.
- Las funcionalidades que el autor atribuye al binario son de automatización de juego: bucle de farmeo, teletransporte por coordenadas, alertas por webhook de Discord, guardia anti-AFK, optimización de framerate y configuración JSON persistente.
- Estas funcionalidades no están verificadas de forma independiente y suelen contravenir los términos de servicio de plataformas como Roblox.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no lo es. Los escenarios que el autor sugiere son:

- Automatización de farmeo en Roblox: el binario afirmaría gestionar ciclos de misiones y eliminación de jefes mediante acceso a memoria del proceso; sin verificación y con riesgo de sanción por parte de la plataforma.
- Teletransporte entre islas y salas: requiere inyección o manipulación del cliente del juego, lo que vulnera habitualmente los términos de servicio.
- Notificaciones de drops vía webhook de Discord: implicaría exfiltración de datos de sesión hacia un servidor externo controlado por el autor.
- Guardia anti-AFK: simulación de entrada virtual para evitar la expulsión por inactividad.
- Optimización de framerate: eliminación de partículas y renderizado de bajo coste mediante parcheo en memoria.
- Persistencia de perfiles y keybinds en JSON local.

Ninguno de estos casos es recomendable en un entorno profesional o de producción, y varios de ellos conllevan riesgos legales y de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 25 ms`, `99,4 %`, `97,8 %`, `242 Hz`, `< 34 MB`, `< 18 MB`) son afirmaciones de marketing del autor sin metodología, sin conjunto de prueba y sin verificación independiente; no deben interpretarse como métricas de rendimiento de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Plataforma de ejecución declarada: Windows 10/11 de 64 bits sobre CPU x64 Intel o AMD.
- Opciones de despliegue: ejecución directa del `.exe` como administrador tras descomprimir el ZIP; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de «modelos similares» para este artefacto, ya que no es un modelo de lenguaje. Los elementos comparables serían otros binarios de automatización de Roblox, para los que no se dispone de información fiable ni de métricas públicas.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas cognitivas.
- Distribución mediante ZIP protegido con contraseña (`2026`) y solicitud de ejecución como administrador: patrón que dificulta el análisis automatizado y la inspección por parte de antivirus.
- Alojamiento del binario en un repositorio de GitHub de un tercero distinto del autor del repositorio de Hugging Face, sin hashes ni firmas publicadas.
- Petición explícita de añadir el directorio a la lista blanca de Windows Defender / SmartScreen, lo que desactiva las protecciones del sistema.
- Posible exfiltración de datos: la funcionalidad de webhook de Discord implica el envío de información de sesión a servidores externos.
- Riesgo de sanción o bloqueo de cuentas en Roblox por uso de software de automatización, en contra de sus términos de servicio.
- Licencia MIT declarada, pero sin código fuente disponible que permita verificar el cumplimiento ni auditar el binario.
- Idiomas declarados en los metadatos sin respaldo técnico; no hay tokenizador ni corpus que los sustente.
- Cero descargas y cero «likes» en Hugging Face en el momento de la consulta, lo que contradice las cifras de «88K+ downloads» mostradas en la model card.
- Recomendación: no descargar ni ejecutar el binario en equipos personales o corporativos; si se desea inspeccionar, hacerlo en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EchoLupus/king-legacy-gpo-script
- Repositorio de GitHub referenciado en la model card: https://github.com/irenejaved/king-legacy-gpo-script
- Descarga directa citada por el autor (no verificada): https://github.com/irenejaved/king-legacy-gpo-script/releases/latest/download/king-legacy-gpo-script-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/irenejaved/king-legacy-gpo-script/releases/latest
- Paper, blog técnico o demo: no disponible
