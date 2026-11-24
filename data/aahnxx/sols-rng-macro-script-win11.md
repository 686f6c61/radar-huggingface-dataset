# aahnxx/sols-rng-macro-script-win11

## Resumen

El repositorio `aahnxx/sols-rng-macro-script-win11` no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable portable para Windows 11 (y Windows 10 de 64 bits) presentado como macro o script automatizado para el videojuego Sols RNG. La model card describe un binario de 8,9 MB, versión `v2.3.5` (build `85D59F`), distribuido como archivo ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros, no en Hugging Face. No existe pipeline, arquitectura de red neuronal, pesos ni tokenizador asociados.

La publicación utiliza el formato de una model card de Hugging Face de manera fraudulenta: los campos `language`, `tags` y `license` se rellenan con metadatos genéricos para aparentar ser un artefacto legítimo, mientras que el contenido real es publicidad de un ejecutable de dudosa procedencia. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) no corresponden a capacidades lingüísticas del software, sino a una lista de palabras clave para posicionamiento en búsquedas.

Desde la perspectiva de un desarrollador o investigador que evalúe modelos, este repositorio debe descartarse de inmediato: no es un modelo, no es auditable, no tiene documentación técnica verificable y su patrón de distribución (ZIP con contraseña, enlace externo a GitHub, instrucciones para desactivar avisos de SmartScreen y ejecutar como administrador) coincide con tácticas habituales de distribución de malware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable portable x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las etiquetas de idioma del repo son metadatos de indexación, no capacidades del software) |
| Licencia | MIT (declarada en los metadatos; sin archivo LICENSE verificable en la información disponible) |
| Formato de pesos | no disponible (distribución como ZIP con `sols-rng-macro-script-win11-v1.2.0-win64.exe`) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. Según la model card, el artefacto es un binario Windows x64 (`sols-rng-macro-script-win11-v1.2.0-win64.exe`, build `v2.3.5` / `85D59F`) empaquetado en un ZIP de 8,9 MB. La documentación menciona módulos funcionales genéricos (configuración JSON persistente, bucle de farm automatizado, guardia anti-AFK con sondeo a 220 Hz, alertas por webhook de Discord, teletransporte por coordenadas y ESP de entidades y cofres en 3D) y cifras arbitrarias de hilos de trabajo (7, 10 y 15 worker threads) sin ninguna especificación técnica verificable.

No se documenta proceso de entrenamiento, dataset, tokens, RLHF, DPO ni innovación algorítmica alguna, porque no aplica: no existe un modelo entrenado. La referencia a "robots script binary" en la FAQ confirma que se trata de un ejecutable de automatización de partidas, no de un sistema de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües; las etiquetas de idioma son metadatos de posicionamiento.
- Las únicas funciones descritas son de automatización de un videojuego concreto (Sols RNG): bucles de farm, anti-AFK, teletransporte y ESP.
- No hay API, SDK, servidor de inferencia ni formato de pesos publicados.

## Casos de uso

- No aplica ninguno de los casos de uso propios de un modelo de IA (generación de texto, código, atención al cliente, RAG, agentes, etc.).
- El único uso descrito por el autor es la automatización de partidas en Sols RNG, lo que en la práctica suele contravenir los términos de servicio de la plataforma del juego y puede conllevar el bloqueo de la cuenta del usuario.
- Un equipo de seguridad podría usar este repositorio como muestra de estudio de campañas de distribución de software no verificado en Hugging Face, analizando el patrón ZIP con contraseña, enlace a GitHub y ejecución como administrador.
- Un investigador de modelos no obtiene ningún valor de este repositorio: no hay pesos, no hay benchmarks, no hay arquitectura.
- No es adecuado para integración en pipelines de CI/CD, producción ni prototipado de IA.
- No debe desplegarse en ningún entorno corporativo ni de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- No aplica VRAM: no hay modelo que cargar en GPU.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, 8,9 MB de espacio en disco para el ZIP.
- No requiere GPU dedicada; el autor no indica requisitos de CPU, RAM ni GPU.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI compatibles).
- Latencia y throughput: no disponibles; las cifras de "220 Hz" y "worker threads" de la model card no son verificables ni corresponden a inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable: este repositorio no es un modelo de IA. Compararlo con LLM, modelos de visión o sistemas multimodales carece de sentido técnico.

## Limitaciones y advertencias

- No es un modelo de IA: la publicación usa el formato de model card de Hugging Face para distribuir un ejecutable, lo que constituye un uso indebido de la plataforma.
- Riesgo de seguridad alto: distribución de un binario no verificado, alojado en un repositorio de GitHub de terceros (`MonihiRiz2/sols-rng-macro-script-win11`), protegido con contraseña (`2026`) y con instrucciones explícitas para ejecutarlo como administrador y desactivar avisos de Windows Defender o SmartScreen.
- El ZIP con contraseña y la ejecución con privilegios elevados son tácticas típicas para evadir análisis automáticos de malware.
- La licencia MIT declarada no es verificable en la información disponible; además, una licencia MIT sobre un binario sin código fuente no otorga garantías de auditabilidad.
- Riesgo de baneo en la plataforma del juego y de compromiso del sistema del usuario.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación reciente y sin validación comunitaria.
- No usar en producción, ni en entornos corporativos, ni como dependencia de ningún proyecto.
- Recomendación: no descargar ni ejecutar el artefacto; reportar el repositorio a Hugging Face si se detecta actividad maliciosa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aahnxx/sols-rng-macro-script-win11
- Repositorio de GitHub referenciado por el autor: https://github.com/MonihiRiz2/sols-rng-macro-script-win11
- Enlace de descarga citado en la model card: https://github.com/MonihiRiz2/sols-rng-macro-script-win11/releases/latest/download/sols-rng-macro-script-win11-v1.2.0-win64.zip
- Paper, blog, demo o repositorio oficial del modelo: no disponible
