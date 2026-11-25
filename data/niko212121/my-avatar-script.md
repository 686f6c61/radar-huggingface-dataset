# Niko212121/my-avatar-script

## Resumen

La entrada `Niko212121/my-avatar-script` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que aloja un supuesto ejecutable para Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) publicitado como "My Avatar Script", un conjunto de utilidades de tipo overlay y radar para videojuegos. La model card no describe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia; el campo `pipeline` figura como no disponible y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

El texto de la model card presenta características propias de una herramienta de trampas (aimbot con suavizado Bézier, ESP de cajas 2D/3D, radar, filtro de loot, exclusión de captura en OBS y ShadowPlay), además de instrucciones para descargar un binario desde un repositorio de GitHub de terceros y extraerlo con una contraseña. Este patrón —binario ejecutable alojado fuera de Hugging Face, contraseña de descompresión, petición de ejecución como administrador y temática de "trainer"/cheat— es habitual en campañas de distribución de software malicioso.

Por tanto, esta ficha documenta el artefacto como lo que es: un paquete binario para Windows sin relación con IA open source. No existe información técnica verificable sobre arquitectura, parámetros, contexto ni entrenamiento, y no debe tratarse como un modelo desplegable en pipelines de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no implican capacidad lingüística de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto es un ZIP con un ejecutable `.exe` para Windows x64 |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio no contiene ficheros de pesos en formatos habituales (safetensors, GGUF, PyTorch bin), ni configuración de transformer, MoE, SSM o híbrida, ni tokenizador. La model card menciona únicamente un binario compilado para Windows 10/11 de 64 bits, con un tamaño de archivo declarado de 4,8 MB, lo que descarta por completo que se trate de un modelo de lenguaje (incluso un modelo minúsculo de decenas de millones de parámetros ocuparía cientos de megabytes en cuantización de 4 bits).

Tampoco hay información sobre datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de inferencia. Los "detalles técnicos" que aparecen en la model card (escáner de offsets, overlay a 144 Hz, suavizado Bézier a 345 Hz de polling, 15 hilos de trabajo) describen funcionalidad de un programa de trampas para videojuegos, no de un sistema de IA.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües demostradas; los códigos de idioma de los metadatos son etiquetas del repositorio, no una evaluación del modelo.
- El artefacto declarado es un ejecutable de Windows con supuestas funciones de overlay, radar y suavizado de entrada orientadas a videojuegos.
- No se ha publicado ningún modo "thinking", visión, audio ni capacidad especial de IA.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no es un modelo. Los escenarios que la model card sugiere son los siguientes, documentados a título descriptivo y con advertencias:

- Overlay en juegos: el texto describe cajas delimitadoras 2D/3D y esqueletos sobre el juego; su uso puede violar los términos de servicio del juego y acarrear el bloqueo de la cuenta.
- Radar y filtro de loot: funcionalidad de asistencia en partidas multijugador, con el mismo riesgo de sanción y de detección por anticheats.
- Suavizado de entrada: el binario declara curvas Bézier configurables para el apuntado; es funcionalidad típica de aimbot.
- Exclusión de captura: se anuncia ocultación frente a OBS, ShadowPlay y Discord, lo que dificulta la supervisión y el registro de la actividad.
- Perfiles JSON intercambiables: presets "Legit", "Visual" y "Custom"; no aporta ningún valor fuera del contexto de trampas.
- Distribución de binarios: el flujo descrito (descarga desde GitHub de terceros, contraseña `2026`, ejecución como administrador) no es un caso de uso recomendable bajo ningún supuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo de lenguaje. Las cifras que aparecen en la model card (144 Hz, 345 Hz de polling, 15 hilos, consumos de 27/45/64 MB de RAM) son afirmaciones del autor sobre el binario, no resultados medidos ni verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del binario: Windows 10 y Windows 11, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no es servible como modelo.
- Latencia y throughput: no disponible; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. A modo de referencia, un modelo de lenguaje real de tamaño reducido (por ejemplo, en el rango de 0,5 a 3 mil millones de parámetros) ocuparía entre cientos de megabytes y varios gigabytes en cuantización de 4 bits, muy por encima de los 4,8 MB declarados para este paquete.

| Criterio | my-avatar-script | Modelo de lenguaje pequeño típico (referencia) |
|---|---|---|
| Naturaleza | Binario ejecutable para Windows | Pesos de red neuronal |
| Formato | ZIP con `.exe` | safetensors / GGUF |
| Parámetros | no disponible (no es un modelo) | cientos de millones a miles de millones |
| Contexto | no disponible | miles a decenas de miles de tokens |
| Licencia | MIT declarada | variable (Apache-2.0, MIT, etc.) |
| Despliegue en inferencia | no aplica | vLLM, llama.cpp, Ollama, TGI |

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto, razonar ni ejecutar tareas de NLP; cualquier expectativa en ese sentido es errónea.
- Riesgo de seguridad elevado: el flujo descrito (descarga desde un repositorio de GitHub de terceros, contraseña de descompresión `2026`, ejecución como administrador) coincide con patrones habituales de distribución de malware y troyanos.
- El binario se anuncia como herramienta de trampas para videojuegos; su uso puede violar los términos de servicio de las plataformas y provocar el bloqueo permanente de cuentas.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido; la licencia cubre el texto del repositorio, no la inocuidad del ejecutable.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria ni auditoría independiente.
- Los idiomas listados en los metadatos no implican capacidades lingüísticas; son etiquetas del repositorio.
- No debe ejecutarse en entornos de producción, máquinas con datos sensibles ni cuentas personales.
- No hay información verificable sobre el autor ni sobre el contenido real del binario más allá de lo que declara la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Niko212121/my-avatar-script
- Repositorio de GitHub citado en la model card: https://github.com/Virginie22931/my-avatar-script
- Repositorio de GitHub alternativo citado: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Enlace de descarga del binario citado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Paper, blog o demo del modelo: no disponible
