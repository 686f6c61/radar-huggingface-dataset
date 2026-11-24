# Marselox/arc-raiders-cheat-esp

## Resumen

El repositorio `Marselox/arc-raiders-cheat-esp` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows etiquetado como *cheat* (trampa) con funcionalidad de tipo *ESP* (extra-sensory perception, visualización de posiciones de jugadores a través de paredes) dirigido al videojuego Arc Raiders. El contenido publicado consiste en un ejecutable `arc-raiders-cheat-esp-v1.2.0-win64.exe`, un archivo comprimido de 8,9 MB protegido con contraseña y un README con instrucciones de instalación y descarga alojadas en un repositorio de GitHub de terceros.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni pesos en formato safetensors o GGUF. El pipeline declarado es "no disponible" y no se referencia ningún paper, checkpoint ni dataset de entrenamiento. Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen un binario para sistema operativo, no un modelo.

Por tanto, esta ficha documenta la ausencia de un modelo de IA y advierte de los riesgos asociados al artefacto. La licencia declarada es MIT, aunque su aplicabilidad a un binario de este tipo es cuestionable. Cualquier evaluación técnica en términos de capacidades, benchmarks o requisitos de hardware de inferencia carece de sentido para este contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no aplicable a un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.exe` y un `.zip` de 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. El repositorio no describe ninguna arquitectura de red neuronal, proceso de entrenamiento, dataset, tokenizador ni técnica de alineación (RLHF, DPO). El README describe módulos de un programa de trampas para el juego Arc Raiders: overlay externo a 144 Hz, radar 2D, filtro de loot, suavizado de entrada Bézier y una capa de renderizado "stream-proof" para evadir capturas de OBS, ShadowPlay y Discord. Estos elementos son funcionalidades de un *cheat* de videojuego, no componentes de un modelo de lenguaje.

El binario se distribuye como ejecutable portable para Windows 10 (22H2) y Windows 11 (24H2), con un archivo ZIP protegido por la contraseña `2026`. La descarga se redirige a un repositorio de GitHub (`BeverlyChen3622/arc-raiders-cheat-esp`) ajeno a Hugging Face. No hay información verificable sobre el código fuente, la cadena de compilación ni auditorías de seguridad.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son metadatos del repositorio.
- El artefacto afirma proporcionar visualización de posiciones de jugadores (ESP), radar 2D, filtrado de objetos y suavizado de puntería dentro del videojuego Arc Raiders.
- Incluye una tecla de pánico (`END`) para descargar el proceso y una capa de renderizado orientada a evadir capturas de pantalla.

## Casos de uso

No existen casos de uso legítimos para un modelo de IA en este repositorio. Los escenarios que el propio README sugiere son:

- Uso de trampas en el videojuego Arc Raiders: el binario se ejecuta en segundo plano y superpone información de jugadores y objetos. Esta práctica suele violar los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Distribución de software potencialmente malicioso: el patrón de ZIP con contraseña, ejecutable "run as administrator" y descarga desde un repositorio de GitHub ajeno es habitual en campañas de *malware*. No se recomienda su ejecución.
- Investigación de seguridad (análisis en sandbox): un analista podría estudiar el binario en un entorno aislado para identificar comportamiento malicioso, pero esto requiere aislamiento estricto y no es un uso previsto por el autor.
- Docencia sobre riesgos de descargas no verificadas: el caso puede servir como ejemplo de artefactos que se hacen pasar por modelos en plataformas de IA.
- No se identifican casos de uso válidos para desarrollo, investigación o producción con IA.
- No se identifican casos de uso válidos para generación de código, atención al cliente, análisis de datos ni ninguna tarea de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de rendimiento del propio *cheat* (por ejemplo, overlay a 144 Hz, 13 hilos de trabajo, 98,5 % de consistencia en el radar, 96,3 % en el suavizado Bézier, sondeo a 359 Hz), pero son afirmaciones del autor sin verificación y no corresponden a ningún modelo de IA.

## Requisitos de hardware

- No aplica VRAM ni GPU para inferencia de un modelo de IA.
- El artefacto requiere Windows 10 (22H2) o Windows 11 (24H2) de 64 bits, en procesadores Intel o AMD x64.
- No requiere GPU dedicada según el README; el rendimiento del overlay depende del juego y del sistema.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles como métricas de modelo; las cifras del README son del *cheat* y no verificables.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el repositorio no contiene un modelo. Tampoco procede compararlo con modelos de lenguaje de ningún tamaño.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código es infundada.
- Riesgo de seguridad elevado: el binario se distribuye como ZIP con contraseña, se ejecuta como administrador y se descarga desde un repositorio de GitHub de terceros. Este patrón es compatible con la distribución de *malware*.
- Posible violación de los términos de servicio de Arc Raiders y de la legislación sobre trampas en videojuegos en algunas jurisdicciones.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del binario; una licencia permisiva no exime de responsabilidad por el uso.
- No hay auditoría, código fuente ni cadena de compilación verificable.
- Los idiomas listados son metadatos del repositorio y no implican capacidades lingüísticas.
- No se recomienda su descarga, ejecución ni integración en ningún entorno de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/arc-raiders-cheat-esp
- Repositorio de GitHub referenciado en el README: https://github.com/BeverlyChen3622/arc-raiders-cheat-esp
- Descarga directa referenciada (no recomendada): https://github.com/BeverlyChen3622/arc-raiders-cheat-esp/releases/latest/download/arc-raiders-cheat-esp-v1.2.0-win64.zip
