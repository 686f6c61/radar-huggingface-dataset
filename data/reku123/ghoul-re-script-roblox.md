# reku123/ghoul-re-script-roblox

## Resumen

`reku123/ghoul-re-script-roblox` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable de Windows (`ghoul-re-script-roblox-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado como "script" para Roblox. La model card no contiene ninguna ficha técnica de modelo: describe módulos de un supuesto software de escritorio con funciones propias de un cheat o trampa para videojuegos (overlay externo, ESP con cajas delimitadoras y esqueletos, radar 2D, filtro de loot, suavizado de entrada tipo bezier y "stream-proof render layer" para evadir la captura de OBS, ShadowPlay y Discord).

El repositorio no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Los tags de Hugging Face (`windows`, `x64`, `portable`) y la estructura de la model card (badges de descargas, contraseña de descompresión, enlaces a releases de GitHub) son característicos de una campaña de distribución de software potencialmente malicioso, no de un modelo publicado para su evaluación.

Por tanto, esta ficha documenta lo que el repositorio declara y advierte de que no existe base técnica para evaluarlo como modelo de IA. Cualquier dato de arquitectura, parámetros, contexto o entrenamiento debe considerarse "no disponible" porque el artefacto no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio distribuye un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es `ghoul-re-script-roblox-v1.2.0-win64.zip`, 8,9 MB, con contraseña `2026`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. La model card enumera componentes de un programa de escritorio para Windows 10 (22H2) y Windows 11 (24H2): un "user-mode external core" que afirma operar sin hooks DLL internos, una capa de renderizado "stream-proof" para excluirse de capturas de OBS, ShadowPlay y Discord, suavizado de entrada bezier con radio de FOV configurable y comprobación de visibilidad, radar 2D con filtrado de loot por rareza, un escáner dinámico de offsets para resolver firmas tras parches y un overlay externo a 144 Hz o más con cajas 2D/3D y esqueletos.

No se documenta ningún proceso de entrenamiento, conjunto de datos, número de tokens, RLHF, DPO ni innovación en decodificación. Los "benchmarks" que aparecen en la model card son cifras de consumo de memoria y latencia del ejecutable (menos de 27 MB de RAM, menos de 40 MB, menos de 19 ms, menos de 5 ms, menos de 24 ms), no métricas de calidad de modelo.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio declara funciones de manipulación de un videojuego de terceros: overlay con ESP, radar 2D, filtro de loot y suavizado de puntería.
- Declara mecanismos de evasión de captura de pantalla (OBS, ShadowPlay, Discord) y resolución automática de offsets tras parches del juego.
- Los 14 idiomas listados en los metadatos no corresponden a capacidades lingüísticas de un modelo, sino a etiquetas del repositorio.

## Casos de uso

No existen casos de uso legítimos como modelo de IA, ya que el artefacto no es un modelo. Los escenarios que el autor describe son:

- Automatización de puntería en Roblox: el ejecutable aplica suavizado bezier con radio de FOV configurable sobre el proceso del juego; su uso infringe los términos de servicio de Roblox y puede conllevar el baneo de la cuenta.
- Visualización de información oculta en partidas: overlay con cajas 2D/3D, esqueletos y distancias; constituye una ventaja competitiva fraudulenta.
- Radar y filtrado de objetos: muestra contenedores y objetos por rareza; mismo problema de integridad competitiva.
- Ocultación frente a grabaciones: la capa "stream-proof" busca que el software no aparezca en capturas de OBS, ShadowPlay o Discord, lo que dificulta la moderación y la prueba de la infracción.
- Actualización tras parches del juego: el escáner de offsets resuelve firmas automáticamente para mantener el software operativo.
- Distribución vía ZIP con contraseña: el paquete se entrega comprimido y protegido con la clave `2026`, un patrón habitual para dificultar el análisis automatizado por parte de antivirus y plataformas.

Ninguno de estos escenarios es recomendable. Se documentan únicamente como descripción de lo que el repositorio declara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras de la model card son de consumo y latencia del ejecutable:

| Métrica declarada | Valor |
|---|---|
| RAM del core externo | < 27 MB |
| RAM de la capa de renderizado | < 40 MB |
| Latencia de suavizado de entrada | < 19 ms |
| Latencia del radar 2D | < 5 ms |
| Latencia del escáner de offsets | < 24 ms |
| Tamaño del ZIP | 8,9 MB |
| Versión declarada | v3.5.9 (firma 66EAA3D415) |

Estas cifras no son verificables ni comparables con benchmarks de modelos.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- GPU: no aplica; el software declara funcionar en CPU sobre Windows x64.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), procesadores Intel y AMD x64.
- Espacio en disco: el archivo ZIP ocupa 8,9 MB; el espacio descomprimido no se especifica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplican.
- Latencia y throughput: no disponibles más allá de las cifras declaradas por el autor en la tabla anterior.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA con el que comparar este repositorio. Como referencia de categoría, los artefactos comparables serían otros ejecutables de cheat para Roblox distribuidos por canales informales, para los que no hay datos públicos fiables de rendimiento, seguridad ni licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en un catálogo de modelos es un error de clasificación.
- Riesgo de seguridad alto: distribución de un ejecutable de procedencia desconocida, protegido con contraseña y alojado fuera de Hugging Face (enlaces a releases de GitHub de un tercero, `Martinr4628/ghoul-re-script-roblox`), un patrón habitual en campañas de malware.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el binario ni sobre su comportamiento en ejecución.
- El uso del software infringe previsiblemente los términos de servicio de Roblox y puede provocar el baneo permanente de cuentas.
- Los mecanismos de evasión de captura de pantalla y de resolución automática de offsets están diseñados para dificultar la detección y la moderación.
- No hay verificación independiente de las cifras de rendimiento ni de las versiones declaradas (v3.5.9, firma 66EAA3D415).
- Los 14 idiomas de los metadatos son etiquetas de repositorio, no capacidades lingüísticas verificadas.
- No ejecutar el binario en un equipo de producción ni con credenciales activas; si se analiza, hacerlo en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reku123/ghoul-re-script-roblox
- Release de GitHub referenciada en la model card: https://github.com/Martinr4628/ghoul-re-script-roblox/releases/latest
- Descarga directa citada por el autor (no recomendada): https://github.com/Martinr4628/ghoul-re-script-roblox/releases/latest/download/ghoul-re-script-roblox-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
