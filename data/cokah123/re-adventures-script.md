# cokah123/re-adventures-script

## Resumen

`cokah123/re-adventures-script` es un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje. La model card describe un supuesto ejecutable para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, build `v2.0.9`) presentado como "script" para el juego Re Adventures, con módulos de radar 2D, filtro de loot, overlay externo, suavizado de entrada Bezier y una capa de renderizado que evita la captura de pantalla en OBS, ShadowPlay y Discord. El texto menciona explícitamente que se trata de un binario de tipo *game cheat* y justifica las alertas de Windows Defender y SmartScreen como falsos positivos.

No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni datos de entrenamiento. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y la ausencia de pipeline confirman que no es un modelo consumible mediante `transformers`, `vLLM` ni ninguna API de inferencia. La fecha de creación indicada (2026-11-24) es futura respecto al momento habitual de consulta, lo que junto con las 0 descargas y 0 likes sugiere un artefacto de reciente publicación o de procedencia dudosa.

Desde el punto de vista de evaluación técnica, este repositorio no es relevante como modelo de IA. Su interés es exclusivamente como caso de estudio de riesgo en la cadena de suministro: distribución de binarios con contraseña en el archivo ZIP, enlaces de descarga alojados en un repositorio de GitHub de terceros distinto del autor declarado, y texto diseñado para convencer al usuario de desactivar protecciones del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin evidencia de capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El artefacto es un ejecutable portable para Windows x64 empaquetado en `delta-executor-pc-2026-v1.2.2-win64.zip` (4,8 MB según la model card), protegido con la contraseña `2026`. La model card enumera módulos funcionales propios de un *cheat* de videojuego: núcleo externo en modo usuario con lectura directa de memoria, radar 2D asíncrono con filtrado de objetos por rareza sobre 6 hilos de trabajo, overlay externo a 144 Hz o más con cajas delimitadoras y esqueletos de huesos, suavizado de entrada Bezier con radio de FOV configurable y comprobación de visibilidad, tecla de pánico (`END`) con liberación de handles en menos de 6 ms, y una capa de renderizado "stream-proof" que excluye la ventana de capturas de OBS, ShadowPlay y Discord.

No hay información sobre datos de entrenamiento, tokens, composición del corpus, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. Tampoco se documenta el lenguaje de programación, las dependencias, la cadena de compilación ni la firma digital del binario.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales pese a los 14 códigos de idioma en los metadatos.
- Funciones declaradas por el autor, propias de un *cheat*: lectura de memoria de proceso, overlay con ESP y esqueletos, radar 2D, filtro de loot, suavizado de puntería y ocultación frente a capturas de pantalla.
- Ninguna de estas funciones está verificada de forma independiente en la información disponible.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card sugiere son:

- Automatización de trampas en el juego Re Adventures mediante lectura de memoria y overlay, con el riesgo de incumplimiento de los términos de servicio del juego y posible baneo de la cuenta.
- Auditoría de seguridad defensiva: análisis en sandbox del binario para estudiar técnicas de evasión de capturas y de detección de antivirus, siempre en un entorno aislado y sin ejecución en máquinas de producción.
- Estudio de ingeniería social: el texto de la model card es un ejemplo didáctico de cómo se presenta un binario malicioso para reducir la resistencia del usuario a desactivar SmartScreen.
- Investigación de cadena de suministro en plataformas de modelos: sirve para ilustrar la necesidad de filtros que detecten repositorios sin pesos ni pipeline que distribuyen ejecutables.
- Formación de equipos de soporte: caso práctico sobre por qué no se deben descargar binarios con contraseña desde enlaces de GitHub ajenos al autor declarado.
- Concienciación de usuarios finales: ejemplo de incongruencia entre licencia MIT, etiquetas de idioma y contenido real del repositorio.

Ninguno de estos usos implica ejecutar el binario en un equipo de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 u 11 de 64 bits, procesadores Intel y AMD x64.
- Tamaño del paquete: 4,8 MB comprimido según la model card.
- Consumo de RAM declarado por el autor: menos de 40 MB para la capa de renderizado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: el autor cita tiempos de respuesta inferiores a 6 ms para la tecla de pánico y ausencia de picos de frame-time, sin datos verificables.
- Recomendación: cualquier análisis debe realizarse en una máquina virtual o sandbox sin acceso a red ni a datos reales.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque el repositorio no contiene un modelo de IA. Frente a repositorios legítimos de modelos open source, las diferencias son estructurales:

| Criterio | `cokah123/re-adventures-script` | Modelo open source típico en Hugging Face |
|---|---|---|
| Contenido | Ejecutable `.exe` en ZIP con contraseña | Pesos en safetensors o GGUF |
| Pipeline | No disponible | `text-generation`, `image-text-to-text`, etc. |
| Inferencia | No aplica | `transformers`, `vLLM`, `llama.cpp` |
| Verificabilidad | Nula | Reproducible con la model card |
| Licencia | MIT declarada, sin correspondencia con el contenido | Coherente con los pesos distribuidos |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Distribución mediante ZIP con contraseña (`2026`) y enlace de descarga alojado en un repositorio de GitHub (`dawidb9567/delta-executor-pc-2026`) distinto del autor declarado (`OnurPetit`), lo que rompe la trazabilidad.
- La model card instruye explícitamente a desactivar o ignorar las alertas de Windows Defender y SmartScreen y a ejecutar como administrador; esto es un patrón clásico de distribución de software malicioso.
- Fecha de creación futura (2026-11-24) y 0 descargas: sin historial ni comunidad que permita validar el artefacto.
- Etiquetas de 14 idiomas sin ninguna evidencia de capacidades lingüísticas, lo que constituye un señuelo para motores de búsqueda.
- Riesgo de robo de credenciales, instalación de persistencia o minado si el binario contiene código no declarado; no verificable sin análisis.
- Uso del binario en un juego conlleva incumplimiento de los términos de servicio y posible suspensión de cuenta.
- La licencia MIT declarada no ofrece garantías sobre el contenido real del ejecutable ni sobre su comportamiento en tiempo de ejecución.
- En producción: no desplegar, no integrar en pipelines y no permitir su descarga desde redes corporativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cokah123/re-adventures-script
- Repositorio GitHub citado como origen del binario: https://github.com/OnurPetit/re-adventures-script
- Repositorio GitHub de descarga referenciado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026
- Enlace de descarga directa citado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
