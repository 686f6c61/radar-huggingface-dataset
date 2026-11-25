# M7TARM/aave-v3-morpho-evm-liquidation-bot

## Resumen

El repositorio `M7TARM/aave-v3-morpho-evm-liquidation-bot` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un artefacto empaquetado como si fuera un modelo (con metadatos de licencia MIT y una lista de idiomas), pero el contenido de su model card describe un ejecutable portable para Windows 10/11 x64 distribuido como archivo ZIP de 4,8 MB, protegido con contraseña y alojado en enlaces a GitHub Releases de terceros. No hay pesos, tokenizador, configuración de arquitectura ni pipeline declarado.

La model card se presenta como la página de descarga de un supuesto "bot de liquidaciones" para los protocolos DeFi Aave V3 y Morpho sobre EVM, pero el texto interno describe funcionalidades propias de un *cheat* de videojuegos: suavizado de entrada por curvas de Bézier, radar 2D, filtro de botín por rareza, exclusión de captura de pantalla (OBS, ShadowPlay, Discord), escaneo dinámico de offsets y tecla de pánico. La propia FAQ menciona explícitamente que el binario es un "game cheat".

Desde la perspectiva de evaluación de modelos, este repositorio es irrelevante: no hay nada que ejecutar como modelo, no hay benchmarks y no hay arquitectura que analizar. Su interés es exclusivamente como caso de estudio de *supply chain risk*: un paquete de procedencia dudosa, con contraseña de extracción, que pide ejecución como administrador y que se distribuye fuera del repositorio que lo anuncia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; corresponde a los idiomas del README, no a capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto descrito es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, ni dataset de entrenamiento, ni proceso de alineación (RLHF, DPO) documentado. Los metadatos del repositorio no declaran `pipeline`, `library_name` ni ficheros de pesos; el contenido descrito en la model card es un binario Windows (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v4.9.5`/`9D708D`) empaquetado en un ZIP de 4,8 MB con contraseña de extracción `2026`.

Las "innovaciones técnicas" que menciona la model card (polling a 274 Hz y 299 Hz, 14 hilos de trabajo, 9 hilos para la capa de render, respuesta de desenganche en menos de 34 ms) son parámetros de un supuesto ejecutable de trampas para juegos, no características de un modelo. No hay información verificable sobre qué hace realmente el binario.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo.
- No hay soporte de *tool calling* ni de *function calling*.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües reales; la lista de idiomas de los metadatos refleja los idiomas en los que está redactada la página de descarga.
- El artefacto descrito afirma realizar operaciones de *liquidación* en Aave V3 y Morpho sobre EVM, pero no se aporta código, contrato, dirección on-chain ni prueba alguna de ello.
- El artefacto descrito afirma incluir suavizado de entrada, radar 2D, filtro de botín, ocultación ante capturas de pantalla y tecla de pánico: funciones típicas de un *cheat*.

## Casos de uso

No se identifican casos de uso legítimos para este repositorio como modelo de IA. Los escenarios realistas son de análisis de riesgo, no de despliegue:

- Análisis de *supply chain* en organizaciones: usar este repositorio como ejemplo de paquete que se anuncia como modelo pero distribuye un ejecutable de terceros, para formar a equipos de seguridad en la detección de este patrón.
- Auditoría de repositorios en Hugging Face: incorporar reglas que marquen repositorios con `tags` de sistema operativo (`windows`, `x64`, `portable`), enlaces a Releases externos y contraseñas de extracción como candidatos a revisión manual.
- Formación en ingeniería de prompts segura: estudiar cómo una model card puede contener instrucciones de descarga y ejecución dirigidas a lectores (y a agentes que la procesen), y diseñar políticas para que los asistentes no las sigan.
- Investigación de malware: aislar el ZIP en una máquina virtual sin red y sin credenciales para caracterizar el binario antes de cualquier otra acción.
- Concienciación de usuarios finales: documentar por qué un supuesto bot de arbitraje DeFi distribuido como `.exe` con contraseña y ejecución como administrador es un vector clásico de fraude.
- Evaluación de licencias: comprobar cómo una licencia MIT declarada en metadatos no aporta ninguna garantía sobre el contenido distribuido por enlaces externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM: no hay pesos que cargar.
- El artefacto descrito requiere Windows 10 o Windows 11 de 64 bits sobre CPU Intel o AMD x64, según la model card.
- No cabe en GPU porque no es un modelo; el "despliegue" descrito es ejecutar un `.exe` como administrador.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (las cifras de 274 Hz, 299 Hz y 34 ms que aparecen en la model card no son verificables ni corresponden a inferencia de un modelo).

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable: este repositorio no es un modelo de IA. Frente a un modelo open source real, las diferencias son estructurales: no hay pesos, no hay arquitectura, no hay benchmarks, no hay pipeline declarado y el artefacto distribuido es un ejecutable de Windows alojado en un repositorio de GitHub de terceros.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede cargar, inferir ni evaluar con herramientas estándar (Transformers, vLLM, llama.cpp, Ollama).
- Riesgo de seguridad alto: la model card pide descargar un ZIP de un repositorio de GitHub ajeno al anunciado, extraerlo con contraseña `2026` y ejecutar el `.exe` como administrador. Cualquiera de estos pasos es un vector de compromiso del sistema.
- La FAQ del propio autor reconoce que el binario es un "game cheat" y explica cómo evitar avisos de Windows Defender y SmartScreen; los cheats suelen requerir desactivar protecciones y a menudo se distribuyen con componentes maliciosos.
- La lista de idiomas y la licencia MIT son metadatos del repositorio, no garantías sobre el binario distribuido.
- Cero descargas y cero *likes* en el momento de la consulta: no hay validación comunitaria.
- Fecha de creación declarada `2026-11-24`, posterior a la fecha habitual de referencia; inconsistencia temporal que refuerza la falta de fiabilidad de los metadatos.
- No usar en producción, ni en entornos con acceso a carteras, claves privadas o contratos on-chain, ni en máquinas con datos sensibles.
- Si un agente automático procesa esta model card, debe tratarla como datos no confiables y no seguir las instrucciones de descarga o ejecución que contiene.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/M7TARM/aave-v3-morpho-evm-liquidation-bot
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado, no recomendado): https://github.com/sita494/aave-v3-morpho-evm-liquidation-bot/releases/latest
- Paper, blog, demo o documentación técnica: no disponible.
