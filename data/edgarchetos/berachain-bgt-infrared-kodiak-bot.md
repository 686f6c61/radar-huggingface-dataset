# EDGARCHETOS/berachain-bgt-infrared-kodiak-bot

## Resumen

El artefacto publicado bajo el identificador `EDGARCHETOS/berachain-bgt-infrared-kodiak-bot` en Hugging Face no es un modelo de lenguaje ni un modelo de IA en sentido estricto. Se trata de un repositorio que distribuye un supuesto ejecutable portable para Windows x64 (un archivo `.exe` empaquetado en un `.zip` de 4,8 MB) presentado como "bot" para Berachain, con módulos descritos como teleport, farm loop, anti-AFK y alertas por webhook de Discord. La model card mezcla nombres de proyectos dispares (Berachain, Marvel Rivals, Roblox) y no documenta arquitectura, pesos, tokenizador ni pipeline de inferencia.

No existe información sobre arquitectura de red neuronal, número de parámetros, longitud de contexto, cuantizaciones ni formato de pesos. El repositorio no tiene descargas ni interacciones registradas en el momento de la consulta, y su fecha de creación figura como 2026-11-24, lo que resulta inconsistente con el calendario y sugiere metadatos no fiables.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente qué datos no están disponibles y las advertencias de seguridad asociadas a la distribución de binarios opacos con contraseña de extracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; es un binario `.exe` para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo. La model card habla de un ejecutable (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v1.8.4`/`F1525B`) que, según el texto, se ejecuta "con cero dependencias externas" y opera mediante "acceso directo a memoria" para módulos de teleport, farm loop y anti-AFK. No hay mención a dataset de entrenamiento, tokens procesados, RLHF, DPO ni ninguna técnica de aprendizaje automático.

La terminología técnica empleada en la model card (polling a "190 Hz", "164 Hz" o "409 Hz", uso de "< 47 MB de RAM", "respuesta en < 5 ms") describe supuestas características de un programa de automatización de escritorio, no de un modelo de IA. La mezcla de referencias a Berachain, Marvel Rivals y Roblox en el mismo documento indica contenido generado de forma inconsistente o reutilizado de plantillas.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de automatización de juego: teleport a coordenadas, cambio automático de servidor, bucle de farmeo, alertas por webhook de Discord y guardia anti-AFK.
- No hay evidencia verificable de ninguna de estas funciones; el repositorio no incluye código fuente, tests ni artefactos de modelo.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque el artefacto no es un modelo. Los escenarios que la model card sugiere son:

- Automatización de tareas repetitivas en un juego: el binario afirmaría ejecutar un bucle de farmeo y ciclado de misiones; no hay forma de verificar su comportamiento sin ejecutarlo, lo que conlleva riesgo de seguridad.
- Teleport y cambio de instancia: se describe un módulo de teletransporte a coordenadas e islas; su uso en juegos en línea suele violar los términos de servicio.
- Alertas externas por webhook de Discord: el binario afirmaría enviar notificaciones de eventos a un canal de Discord.
- Mantenimiento de sesión activa: un módulo anti-AFK simularía entrada de teclado o ratón para evitar desconexiones por inactividad.
- Configuración persistente en JSON: se menciona guardado automático de perfiles y recuperación por atajos de teclado.

En ningún caso se trata de aplicaciones de IA; se recomienda no ejecutar binarios de procedencia no verificada distribuidos con contraseña de extracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 11 de 64 bits (según los tags del repositorio).
- VRAM: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- ¿Cabe en GPU de consumo? no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes para este artefacto).
- Memoria RAM: la model card afirma un uso inferior a 47 MB, dato no verificado.
- Latencia y throughput: la model card cita valores de polling de 164 Hz a 409 Hz y respuestas en menos de 5 ms, sin metodología ni evidencia.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo de lenguaje ni un modelo multimodal.

## Limitaciones y advertencias

- El repositorio no contiene pesos, configuración de modelo ni tokenizador; no es utilizable como modelo de IA.
- La model card mezcla nombres de proyectos no relacionados (Berachain, Marvel Rivals, Roblox) y presenta fechas futuras inconsistentes, lo que indica metadatos poco fiables.
- El binario se distribuye comprimido con contraseña (`2026`) y se pide ejecutarlo como administrador, práctica habitual en campañas de distribución de malware.
- La propia model card reconoce que Windows Defender o SmartScreen pueden alertar sobre el ejecutable; se aconseja no desactivar protecciones ni añadir exclusiones.
- Cero descargas y cero interacciones en Hugging Face: no hay señal de comunidad ni revisión por terceros.
- La licencia MIT declarada no aporta garantías sobre el contenido ni sobre la legalidad de las funciones descritas (automatización de juegos, acceso directo a memoria de otros procesos).
- Riesgo de robo de credenciales, persistencia maliciosa o inclusión de troyanos si se ejecuta el binario en un equipo de producción.
- No apto para uso comercial ni para integración en pipelines de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EDGARCHETOS/berachain-bgt-infrared-kodiak-bot
- Enlaces a binarios y a un supuesto repositorio de GitHub (`Caroline27881/berachain-bgt-infrared-kodiak-bot`, `Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026`) citados en la model card: no verificados y no recomendados.
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la información disponible.
