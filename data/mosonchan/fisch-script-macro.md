# mosonchan/fisch-script-macro

## Resumen

`mosonchan/fisch-script-macro` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es la model card de una supuesta macro/script para el videojuego Roblox "Fisch", distribuida como ejecutable de Windows (`fisch-script-macro-v1.2.0-win64.exe`, build `v3.7.5`) empaquetado en un ZIP protegido con contraseña. El autor declara la etiqueta `fisch-script-macro` y una licencia MIT, pero no publica pesos, arquitectura ni datos de entrenamiento.

La ficha se redacta con la estructura habitual por rigor editorial, pero debe quedar claro desde el principio: no hay ningún modelo entrenado, ningún tensor, ningún tokenizador ni ningún pipeline de inferencia asociado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su pipeline figura como "no disponible".

Por tanto, todas las secciones técnicas de esta ficha se completan con "no disponible" cuando corresponde, y se incluye una advertencia explícita sobre el riesgo de seguridad de ejecutar binarios de procedencia no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no contiene pesos en safetensors, GGUF ni ningún otro formato de modelo. El artefacto descrito en la model card es un binario x64 para Windows 10/11 que, según el autor, implementa funciones de automatización sobre el cliente del juego (alertas por webhook de Discord, guardia anti-AFK, optimizador de framerate, teleport por coordenadas y bucles de farmeo).

La model card no documenta dataset, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. Tampoco se aporta información sobre el compilador, el empaquetado del binario ni las dependencias que arrastra.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en modelos.
- Las funciones que el autor atribuye al binario son de automatización de input y manipulación del cliente de un videojuego, no capacidades cognitivas.
- El etiquetado multilingüe (14 idiomas) corresponde a los metadatos del repositorio, no a capacidades lingüísticas verificadas de ningún modelo.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso de inferencia, generación, RAG, agentes ni análisis de datos.
- Automatización de tareas repetitivas en el videojuego Fisch (según el autor): el binario afirmaría ejecutar bucles de farmeo y pulsaciones virtuales; no verificable y potencialmente contrario a los términos de servicio de la plataforma.
- Alertas por webhook de Discord (según el autor): notificaciones de eventos del juego mediante integraciones externas; no verificable.
- Teleport por coordenadas (según el autor): desplazamiento entre islas o salas; no verificable.
- Optimización de framerate (según el autor): ajuste de partículas y renderizado; no verificable.
- Gestión de configuración persistente en JSON (según el autor): guardado de perfiles y keybinds; no verificable.

Ninguno de estos supuestos casos de uso está respaldado por documentación técnica, código fuente auditable ni resultados reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; el autor menciona cifras de respuesta (`< 15 ms`) y polling (`172 Hz`) para el binario, sin metodología de medición.
- Requisitos del artefacto distribuido: Windows 10/11 de 64 bits, arquitectura x64 (Intel o AMD), según la model card.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" a la que comparar este repositorio, y las alternativas reales serían otras herramientas de automatización de escritorio, fuera del alcance de esta ficha y sin datos verificables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no debe citarse como tal en comparativas, rankings ni catálogos de modelos.
- Distribución mediante un ZIP protegido con contraseña y un ejecutable que solicita ejecutarse "como administrador": patrón habitual en campañas de malware. No se debe ejecutar en equipos de producción ni personales sin análisis previo en un entorno aislado.
- El autor reconoce explícitamente que Windows Defender y SmartScreen pueden emitir alertas; la recomendación de "whitelistear" el directorio agrava el riesgo.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del binario; la licencia cubre el contenido del repositorio, no exime de responsabilidad al ejecutar software de terceros.
- Uso potencialmente contrario a los términos de servicio de Roblox y del juego Fisch, con riesgo de suspensión de cuentas.
- Cero descargas y cero likes en el momento de la consulta: ausencia total de validación por parte de la comunidad.
- No hay código fuente, ni hashes publicados, ni firmas del binario, ni proceso de build reproducible.
- Riesgo de suplantación: el repositorio apunta a un proyecto de GitHub de un tercero (`tariqlang612/fisch-script-macro`) sin relación verificable con el autor del repo de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mosonchan/fisch-script-macro
- Proyecto de GitHub referenciado en la model card: https://github.com/tariqlang612/fisch-script-macro
- Releases del proyecto referenciado: https://github.com/tariqlang612/fisch-script-macro/releases/latest
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
