# JvstSophie/project-zomboid-cheat-trainer

## Resumen

`JvstSophie/project-zomboid-cheat-trainer` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable para Windows x64 (identificado como `solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `EE212C`, v3.7.3) presentado como "cheat trainer" para el videojuego Project Zomboid. El artefacto principal es un archivo ZIP de 4,8 MB protegido con la contraseña `2026`, y la model card incluye enlaces de descarga que apuntan a repositorios de GitHub de terceros (`schneider6972/solara-executor-v3-keyless-2026` y `Akane35139/project-zomboid-cheat-trainer`).

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. Las etiquetas de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) describen un binario, no un modelo. La model card mezcla reclamos técnicos no verificables (radar 2D, overlay externo a 144 Hz, escaneo dinámico de offsets, "bezier input smoothing") con instrucciones para desactivar advertencias de Windows Defender y SmartScreen, lo que constituye un patrón habitual de distribución de software potencialmente malicioso.

Desde la perspectiva de evaluación de modelos, este repositorio debe clasificarse como no conforme con la categoría: no hay nada que evaluar en términos de capacidades, benchmarks o despliegue de inferencia. Su relevancia es negativa: sirve como ejemplo de ruido y de riesgo de seguridad en el ecosistema open source, y conviene advertir explícitamente sobre él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo, referidos a la documentación del binario) |
| Licencia | MIT (declarada en metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El contenido del repositorio es un paquete comprimido de 4,8 MB que, según la model card, contiene un ejecutable para Windows x64 y requiere ejecutarse "como administrador". Los elementos descritos en la documentación (radar 2D, overlay externo, escaneo de offsets, suavizado de entrada Bézier) corresponden a técnicas de manipulación de memoria de un proceso de juego, no a componentes de un modelo.

No hay información sobre datos de entrenamiento, tokens procesados, composición del corpus, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. Cualquier afirmación sobre "consistencia del 97,3 %" o "polling a 437 Hz" que aparece en la model card es un reclamo publicitario no verificable y sin respaldo técnico reproducible.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas se refieren a los idiomas de la documentación del binario, no a competencia lingüística de un modelo.
- El artefacto afirmado es un ejecutable de terceros para Windows que, según su propia descripción, interactúa con la memoria del proceso de Project Zomboid.

## Casos de uso

- Ninguno recomendado en el ámbito de IA open source: el repositorio no contiene un modelo desplegable ni una API de inferencia.
- Auditoría de seguridad: analizar el binario en un entorno aislado (sandbox, máquina virtual sin red) para determinar si el ejecutable realiza acciones maliciosas, dado que la model card pide desactivar SmartScreen y Defender.
- Estudio de patrones de abuso en Hugging Face: documentar cómo se camuflan distribuciones de binarios bajo etiquetas de modelos y con licencias permisivas declaradas.
- Formación en higiene de cadena de suministro: usar el caso como ejemplo de enlaces de descarga que apuntan a repositorios de GitHub ajenos al propietario del espacio en Hugging Face.
- Moderación de contenido: servir de referencia para reglas automáticas que detecten model cards con instrucciones de "ejecutar como administrador" y contraseñas de descompresión.
- Investigación de malware: extraer indicadores de compromiso (hashes del ZIP y del EXE, dominios de descarga) para alimentar sistemas de detección.
- En ningún caso debe emplearse como "cheat" en Project Zomboid: además del riesgo de seguridad, su uso en el juego puede conllevar el baneo de la cuenta y la violación de los términos de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica: no existe un modelo subyacente sobre el que medir MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de IA.

## Requisitos de hardware

- No requiere VRAM ni GPU: no hay inferencia de red neuronal.
- El ejecutable declarado está orientado a Windows x64 (Windows 10/11), según las etiquetas del repositorio.
- No cabe en ningún acelerador porque no es un modelo; los "requisitos" serían los de un proceso de Windows que manipula memoria de un juego.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplicables.
- Latencia y throughput: no disponibles y sin sentido en este contexto.
- Recomendación operativa: si se decide inspeccionar el binario, hacerlo en una máquina virtual desechable, sin credenciales, sin acceso a red y con snapshots previos.

## Comparativa con modelos similares

No disponible. No existe categoría comparable de modelos de IA para este artefacto. A modo de contraste estructural, se indican referencias de lo que sí sería un modelo real frente a este repositorio:

| Criterio | project-zomboid-cheat-trainer | Modelo de lenguaje típico (p. ej. familia Llama/Mistral/Qwen) |
|---|---|---|
| Naturaleza | Binario para Windows en ZIP | Pesos en safetensors/GGUF |
| Pesos incluidos | No | Sí |
| Tokenizador/config | No | Sí |
| Benchmarks | No | Publicados habitualmente |
| Despliegue con vLLM/llama.cpp | No aplicable | Sí |
| Riesgo de seguridad | Alto (instrucciones para desactivar Defender/SmartScreen) | Bajo (artefactos verificables) |
| Utilidad para desarrolladores | Nula | Alta |

## Limitaciones y advertencias

- No es un modelo de IA: clasificarlo como tal distorsiona catálogos y evaluaciones.
- La model card incluye instrucciones explícitas para desactivar o ignorar Windows Defender y SmartScreen, lo que constituye una señal de alarma de seguridad.
- El ejecutable se distribuye con contraseña de descompresión (`2026`), táctica habitual para evadir análisis automáticos de antivirus.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no vinculados al autor del espacio en Hugging Face, lo que impide verificar procedencia e integridad.
- Los reclamos de rendimiento ("97,3 % de consistencia", "437 Hz", "206 Hz") no son verificables ni reproducibles.
- La licencia MIT declarada se aplica, en su caso, al contenido del repositorio; no otorga derechos sobre Project Zomboid ni sobre los servidores del juego, y su uso puede violar los términos de servicio del videojuego.
- Riesgo de baneo de cuentas de juego y de compromiso del sistema anfitrión (robo de credenciales, persistencia, mineros, etc.) si el binario contiene código malicioso.
- Cero descargas y cero "likes" en el momento de la consulta: sin validación comunitaria.
- No debe citarse como referencia técnica en artículos sobre IA; si se menciona, hacerlo únicamente como caso de abuso o ruido en Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JvstSophie/project-zomboid-cheat-trainer
- Repositorio de GitHub referenciado en la model card (descarga): https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Releases del repositorio de GitHub referenciado: https://github.com/Akane35139/project-zomboid-cheat-trainer/releases/latest
- Enlace de descarga directa citado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
