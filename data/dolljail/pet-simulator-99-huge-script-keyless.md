# dolljail/pet-simulator-99-huge-script-keyless

## Resumen

`dolljail/pet-simulator-99-huge-script-keyless` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Es un repositorio de Hugging Face que distribuye un supuesto ejecutable para Windows (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como "script" para el videojuego Pet Simulator 99 de Roblox. La model card describe módulos de teleport, ESP de entidades, server hopping, webhooks de Discord y optimización de framerate, es decir, funcionalidad típica de un cheat o mod menu para un juego online.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia. No hay pipeline declarado, no hay descargas ni interacciones, y la fecha de creación (2026-11-24) es posterior a la fecha de redacción habitual de este tipo de fichas. Los tags de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y la licencia MIT declarada no se corresponden con ningún artefacto lingüístico verificable.

Desde la perspectiva de evaluación de modelos, este repositorio debe clasificarse como contenido ajeno al ecosistema de IA open source. La ficha se redacta íntegramente para dejar constancia de la ausencia de especificaciones técnicas reales y de los riesgos asociados a la descarga y ejecución del binario referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; sin artefacto lingüístico verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF, DPO) ni innovación técnica de inferencia que describir. La model card enumera subsistemas de un supuesto mod menu: alertas por webhook de Discord, teleport por coordenadas, server hopper de baja latencia, optimizador de framerate, ESP 3D de entidades y cofres, y configuración JSON persistente. Estos elementos describen comportamiento de un programa cliente, no de un modelo.

La información disponible no permite verificar qué contiene realmente el binario `rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`. La model card menciona una contraseña de archivo (`2026`), instrucciones para ejecutar como administrador y avisos sobre alertas de Windows Defender y SmartScreen, lo que constituye un patrón habitual en la distribución de software no auditado. No hay paper, repositorio de código fuente, dataset ni tarjeta de evaluación asociados.

## Capacidades

- No se dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling, porque no hay modelo subyacente.
- La model card atribuye al ejecutable funciones de teleport, ESP, server hopping, webhooks y persistencia de configuración; ninguna de ellas es una capacidad de IA y no están verificadas por terceros.
- No hay soporte documentado de function calling, agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos no está respaldado por ningún artefacto de modelo.

## Casos de uso

- Auditoría de seguridad: analizar el binario en un entorno aislado para determinar si contiene malware, dado que se distribuye como ejecutable sin firma verificable y con instrucciones de ejecución como administrador.
- Estudio de patrones de distribución abusiva en Hugging Face: documentar cómo se emplean metadatos de modelo (licencia MIT, lista de idiomas, tags) para dar apariencia legítima a contenido ajeno a la plataforma.
- Formación en detección de ingeniería social: usar la model card como ejemplo de instrucciones de descarga con contraseña, badges de valoración inventados y enlaces a repositorios de GitHub de terceros.
- Investigación sobre trampas en juegos online: contextualizar los módulos descritos (teleport, ESP, server hopping) dentro de las técnicas habituales de cheating en Roblox y sus implicaciones en los términos de servicio.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, emplear la información del repositorio para identificar indicadores de compromiso y procedencia del archivo.
- Verificación de políticas de plataforma: evaluar si el repositorio cumple las directrices de contenido de Hugging Face y documentar la decisión de reporte o retirada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay modelo que ejecutar en GPU ni VRAM estimable.
- El artefacto declarado es un ejecutable para Windows 10/11 de 64 bits (Intel y AMD x64), con un tamaño comprimido de 4,8 MB.
- La model card afirma un uso de RAM inferior a 45 MB y 61 MB según el módulo, y tiempos de respuesta de 29 ms a 32 ms; estos datos no son verificables.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- No se dispone de datos de latencia o throughput de inferencia porque no existe inferencia.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoría, se compara con otros tipos de artefacto alojados en Hugging Face:

| Artefacto | Naturaleza | Pesos | Contexto | Licencia | Verificable |
|---|---|---|---|---|---|
| dolljail/pet-simulator-99-huge-script-keyless | Ejecutable Windows (cheat de juego) | No | No aplica | MIT (declarada) | No |
| Modelo de lenguaje abierto (p. ej. familia Llama, Qwen, Mistral) | Transformer con pesos | Sí (safetensors/GGUF) | Miles de tokens | Comunitaria o Apache/MIT | Sí |
| Modelo de visión-lenguaje abierto | Transformer multimodal con pesos | Sí | Variable | Comunitaria | Sí |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni procesa lenguaje; cualquier uso esperado de un LLM es inviable.
- Riesgo de seguridad elevado: se solicita descargar un `.exe` de un repositorio de GitHub de terceros, extraerlo con contraseña y ejecutarlo como administrador, lo que impide el escaneo automático y facilita la ejecución de código malicioso.
- La model card reconoce explícitamente que Windows Defender y SmartScreen pueden alertar sobre el binario, lo que constituye una señal de alarma, no una garantía de falsos positivos.
- El uso de cheats en Pet Simulator 99 contraviene los términos de servicio de Roblox y puede conllevar el baneo de la cuenta del usuario.
- Los badges de valoración (4,8/5), tamaño y build son afirmaciones del autor sin verificación independiente.
- La licencia MIT declarada no otorga derechos sobre el videojuego ni sobre las marcas de terceros mencionadas.
- La fecha de creación del repositorio (2026-11-24) y el número de descargas (0) impiden validar su uso o reputación.
- No debe ejecutarse en máquinas de producción ni en entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dolljail/pet-simulator-99-huge-script-keyless
- Repositorio de GitHub referenciado en la model card: https://github.com/george58306/pet-simulator-99-huge-script-keyless
- Repositorio de GitHub del binario: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc
- Enlace de descarga del ZIP citado: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
