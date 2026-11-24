# nolan12248/berachain-bgt-infrared-kodiak-bot

## Resumen

El artefacto publicado bajo el identificador `nolan12248/berachain-bgt-infrared-kodiak-bot` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (archivo `berachain-bgt-infrared-kodiak-bot-v1.2.0-win64.zip`, 8,9 MB) distribuido a través de un repositorio de GitHub y presentado con la apariencia de un bot de automatización para un juego tipo Roblox, con módulos de "farm loop", "ESP", "teleport" y alertas por webhook de Discord. El autor lo etiqueta como portable, sin telemetría y compatible con Windows 10 y 11 de 64 bits.

La model card no contiene ninguna especificación de arquitectura neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. El repositorio incluye instrucciones para descargar un ZIP protegido con contraseña (`2026`), extraerlo y ejecutar un binario como administrador, además de indicaciones explícitas para desactivar avisos de Windows Defender y SmartScreen. Este patrón (binario cerrado, contraseña en el archivo, petición de privilegios elevados y justificación de falsos positivos de antivirus) es característico de campañas de distribución de malware, no de software legítimo.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado y advierte de que no debe ejecutarse. No hay información verificable que permita evaluarlo como modelo de IA, y la propia naturaleza del contenido desaconseja su uso en cualquier entorno, incluido un sandbox sin aislamiento adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario PE para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (se distribuye como ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un ejecutable compilado para Windows x64, empaquetado en un ZIP de 8,9 MB con contraseña. La model card describe módulos funcionales ("Low-Ping Server Hopper", "Anti-AFK Guard", "Discord Webhook Alerts", "Automated Farm Loop", "3D Entity & Chest ESP", "Coordinate Teleport") con cifras de rendimiento inventadas (polling a 368 Hz, 282 Hz, latencia inferior a 20 ms, consistencia del 97,9 % y 96,6 %), sin ninguna metodología de medición ni referencia verificable.

No se especifica lenguaje de programación, framework, dependencias, cadena de compilación ni firma digital del binario. Tampoco se indica qué hace el ejecutable en tiempo de ejecución más allá de las afirmaciones publicitarias. La ausencia total de trazabilidad técnica impide cualquier evaluación de seguridad o de comportamiento.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni de function calling en el sentido de un modelo de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Los idiomas listados en los metadatos (14 códigos ISO) corresponden a etiquetas del repositorio, no a capacidades lingüísticas verificadas de un modelo.
- La model card atribuye al binario funciones de automatización de juego (farm loop, ESP, teleport, anti-AFK) y envío de alertas por webhook de Discord, sin evidencia técnica que las respalde.

## Casos de uso

- No se recomienda ningún caso de uso. El artefacto no es un modelo de IA y su ejecución implica riesgos de seguridad no evaluables.
- Un uso defensivo posible es el análisis estático del binario en un entorno aislado y sin red, por parte de un equipo de respuesta a incidentes, para caracterizar la muestra.
- Otro uso defensivo es documentar el patrón de distribución (ZIP con contraseña, instrucciones para desactivar Defender, petición de privilegios de administrador) en bases de datos de amenazas y en formación de usuarios.
- Un uso académico sería ilustrar en un artículo sobre ingeniería social y repositorios señuelo cómo se reutilizan plataformas de modelos (Hugging Face, GitHub) para alojar binarios maliciosos.
- No procede emplearlo en atención al cliente, generación de código, análisis de datos, agentes autónomos ni ninguna otra aplicación de IA.
- Cualquier despliegue en producción, aunque sea en una máquina de desarrollo, debe descartarse por completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (368 Hz, 282 Hz, < 20 ms, 97,9 %, 96,6 %, < 48 MB de RAM) son afirmaciones publicitarias sin metodología, conjunto de prueba ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits (x64).
- Espacio en disco declarado: 8,9 MB para el ZIP; el tamaño descomprimido no se especifica.
- Memoria RAM declarada en la model card: menos de 48 MB, dato no verificado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de lenguaje ni un sistema de IA. Compararlo con LLM como Llama, Mistral o Qwen sería categorialmente incorrecto. En todo caso, se diferencia de cualquier modelo legítimo en que no publica pesos, no documenta arquitectura ni datos, y distribuye un ejecutable cerrado que solicita privilegios de administrador.

## Limitaciones y advertencias

- No es un modelo de IA: la etiqueta de Hugging Face es engañosa y el contenido es un binario para Windows.
- Riesgo de malware: el patrón (ZIP con contraseña, instrucciones para desactivar Windows Defender y SmartScreen, ejecución como administrador, descarga desde un repositorio de GitHub de terceros) coincide con tácticas habituales de distribución de troyanos y stealers.
- Cero trazabilidad: no hay código fuente, firma digital, hash publicado ni auditoría de seguridad.
- Licencia MIT declarada: aunque el texto de licencia permita uso comercial, la licencia no valida la seguridad ni la legalidad del contenido; el uso comercial de un binario no auditado es una mala práctica.
- Riesgo legal: las funciones descritas (automatización de juego, ESP, teleport) pueden violar los términos de servicio de la plataforma objetivo y, según la jurisdicción, normas sobre trampas y fraude informático.
- Idiomas: los 14 códigos de idioma son etiquetas de repositorio sin respaldo funcional.
- Alucinación: no aplica en el sentido de un LLM, pero la model card contiene afirmaciones no verificables que funcionan como desinformación.
- Recomendación: no descargar, no extraer y no ejecutar. Si ya se ha ejecutado, tratar el equipo como comprometido y realizar un análisis forense.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nolan12248/berachain-bgt-infrared-kodiak-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/HiroshiFernandes/berachain-bgt-infrared-kodiak-bot
- Descarga directa citada en la model card (no recomendada): https://github.com/HiroshiFernandes/berachain-bgt-infrared-kodiak-bot/releases/latest/download/berachain-bgt-infrared-kodiak-bot-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/HiroshiFernandes/berachain-bgt-infrared-kodiak-bot/releases/latest
- No se han encontrado papers, blogs técnicos ni demos asociados al artefacto.
