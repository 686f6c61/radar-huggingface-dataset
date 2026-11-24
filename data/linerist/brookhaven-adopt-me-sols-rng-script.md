# Linerist/brookhaven-adopt-me-sols-rng-script

## Resumen

El repositorio `Linerist/brookhaven-adopt-me-sols-rng-script` no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 distribuido a través de Hugging Face. La model card lo presenta como un "script" para el juego Roblox Brookhaven/Adopt Me orientado a la automatización de tareas (RNG de "sols", teleport, alertas por webhook, anti-AFK). No hay pesos, tokenizador, configuración de transformer ni artefactos de inferencia en la información disponible.

El paquete se distribuye como un ZIP de 4,8 MB con contraseña (`2026`) que contiene un binario `.exe` (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v2.1.7`), presuntamente portable y sin dependencias externas. La nomenclatura del binario remite a un supuesto "cheat ESP/aimbot" para Deadlock, lo que resulta incoherente con el título del repositorio y con la descripción funcional del script de Brookhaven.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones de arquitectura, entrenamiento ni benchmarks porque no existe ningún modelo subyacente. El interés técnico se limita a documentar el artefacto, sus incoherencias y los riesgos de seguridad asociados a la ejecución de binarios ofuscados con instrucciones de "ejecutar como administrador".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64, 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. No se describe ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de preentrenamiento, ajuste supervisado, RLHF ni DPO en la información proporcionada. El artefacto es un binario compilado para Windows x64 que, según la model card, implementa módulos de automatización sobre un cliente de Roblox: ESP 3D de entidades y cofres, optimizador de frame-rate, alertas por webhook de Discord, guardia anti-AFK, teleport por coordenadas y "server hopper" de baja latencia.

La model card menciona métricas de "consistencia" (97,8 %, 99,5 %, 99,7 %) y un polling de 412 Hz, pero no se especifica metodología de medición, tamaño de muestra ni condiciones de prueba, por lo que no son verificables. Tampoco se documenta el mecanismo de inyección ni el runtime utilizado (por ejemplo, un executor de scripts de Roblox), ni se aporta código fuente pese a la licencia MIT declarada.

## Capacidades

- Automatización de tareas dentro de experiencias de Roblox (Brookhaven, Adopt Me) según la descripción del autor.
- Detección visual de entidades y cofres ("ESP 3D") con seguimiento de objetos a través de paredes.
- Teleport por coordenadas a islas, NPC y salas de raid.
- Alertas y registros de sesión mediante webhooks de Discord.
- Guardia anti-AFK basado en pulsos de entrada virtual.
- Cambio automatizado de servidor ("server hopper") para buscar spawns raros.
- Optimización de frame-rate mediante eliminación de partículas y renderizado de bajo coste de CPU.
- No se documenta soporte de tool calling, razonamiento multi-paso, capacidades multilingües reales ni modos de "thinking": los códigos de idioma son metadatos de la model card, no una capacidad del artefacto.

## Casos de uso

- Automatización de farmeo en Brookhaven/Adopt Me: el paquete permitiría, según el autor, mantener sesiones activas y desplazarse entre ubicaciones sin intervención manual. No obstante, su uso conlleva riesgo de sanción por parte de la plataforma.
- Monitorización de eventos raros con alertas: los webhooks de Discord permitirían notificar apariciones de objetos o spawns a un canal externo, integrándose en flujos de aviso ya existentes.
- Pruebas de estrés de clientes de Roblox en entornos controlados: un investigador podría medir el impacto de la eliminación de partículas y del renderizado de bajo coste sobre el frame-time.
- Análisis de seguridad defensiva: el binario sirve como muestra para estudiar técnicas de ofuscación, empaquetado con contraseña y evasión de SmartScreen en artefactos distribuidos vía Hugging Face.
- Docencia sobre riesgos de la cadena de suministro: caso práctico de repositorio con nomenclatura incoherente (Brookhaven vs. Deadlock), instrucciones de elevación de privilegios y enlaces a releases de terceros.
- Auditoría de políticas de plataforma: útil para equipos de confianza y seguridad que evalúan la presencia de contenido de cheating en hubs de modelos.
- No se recomienda su uso en producción ni en entornos con datos sensibles: no hay garantías de integridad, ni firma de código, ni trazabilidad del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de "consistencia" (97,8 %, 99,5 %, 99,7 %) y el polling de 412 Hz que aparecen en la model card carecen de metodología y no constituyen benchmarks verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica; el artefacto declara ejecución nativa en CPU sobre Windows 10/11 x64 (Intel y AMD).
- Cabe en cualquier equipo consumer con Windows x64; el paquete ocupa 4,8 MB comprimido.
- Opciones de despliegue: ejecución directa del `.exe` como administrador tras extraer el ZIP con la contraseña `2026`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de polling (412 Hz) no van acompañadas de mediciones de latencia ni de consumo de CPU.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la categoría de "modelos de IA" porque este repositorio no contiene un modelo. Como referencia de artefactos de la misma naturaleza (scripts de automatización para Roblox distribuidos en hubs), no se dispone de información verificable sobre alternativas en la documentación proporcionada.

## Limitaciones y advertencias

- Incoherencia de identidad: el título del repositorio remite a un script de Brookhaven/Adopt Me, pero el binario se llama `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`. Esta discrepancia es una señal de alarma sobre la procedencia y el contenido real del paquete.
- Riesgo de seguridad elevado: se instruye a extraer un ZIP protegido con contraseña y ejecutar un `.exe` "como administrador", una combinación habitual en campañas de malware. No hay firma de código, hash publicado ni código fuente auditable pese a la licencia MIT.
- Ejecución de binarios opacos: no se documenta el runtime, el mecanismo de inyección ni las dependencias; el binario podría realizar acciones arbitrarias con privilegios elevados.
- Uso contra los términos de servicio: la automatización y el cheating en Roblox violan las condiciones de la plataforma y pueden conllevar el baneo de cuentas.
- Licencia: se declara MIT, pero sin código fuente disponible la licencia es inaplicable en la práctica; no hay garantías para uso comercial ni para redistribución.
- Idiomas: los 14 códigos de idioma son metadatos de la model card; no se acredita soporte multilingüe real del artefacto.
- Sin benchmarks ni métricas reproducibles: las cifras de consistencia y polling no son verificables.
- Recomendación: no ejecutar el binario en máquinas personales ni corporativas; si se analiza, hacerlo en una VM aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linerist/brookhaven-adopt-me-sols-rng-script
- Release citada en la model card (ZIP): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Releases del repositorio alternativo citado: https://github.com/amaxwell46/brookhaven-adopt-me-sols-rng-script/releases/latest
