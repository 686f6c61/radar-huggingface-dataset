# johnbrightlin25/doors-script

## Resumen

`johnbrightlin25/doors-script` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows presentado como "script" o "trainer" para un videojuego (aparentemente Roblox, por las referencias a "roblox script", "island", "NPC", "chest ESP" y "anti-AFK"). El autor lo publica bajo el identificador `johnbrightlin25` con licencia MIT y lo etiqueta con lenguajes humanos (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id), lo que sugiere una ficha multilingüe de marketing más que un modelo lingüístico real.

La model card describe funcionalidades propias de una herramienta de trampas o "cheat": teleport de coordenadas, ESP (visualización de entidades a través de paredes), guard anti-AFK, bucle de farmeo automatizado y optimizador de framerate. El artefacto distribuido es un ZIP de 4,8 MB con contraseña (`2026`) que contiene un ejecutable `schedule-1-cheat-trainer-v1.2.2-win64.exe`, alojado en un repositorio de GitHub de terceros (`arjunzimmermann624/schedule-1-cheat-trainer`) distinto del autor de la ficha.

Desde la perspectiva de evaluación de modelos, esta ficha no describe ningún modelo de IA: no hay arquitectura, parámetros, contexto, tokenizador ni pesos. Es relevante advertirlo porque el repositorio aparece indexado en Hugging Face con etiquetas que podrían confundir a herramientas de descubrimiento automático, y porque la distribución de ejecutables ofuscados con contraseña y enlaces a repositorios ajenos es un patrón habitual de riesgo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin modelo lingüístico asociado) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto distribuido: ZIP de 4,8 MB con `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario Windows x64 (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v4.1.1`, firma `3346D90DE6`) empaquetado en un ZIP protegido con contraseña. La model card menciona módulos internos (teleport, ESP, anti-AFK, configuración JSON persistente, bucle de farmeo, optimizador de framerate) con latencias declaradas de 21-23 ms y uso de 4-6 hilos de trabajo, pero no aporta información sobre el lenguaje de programación, el mecanismo de inyección en el proceso del juego ni las técnicas de evasión empleadas.

Tampoco se documentan datos de entrenamiento, dataset, RLHF, DPO ni innovaciones técnicas de modelado. La única "innovación" descrita es la operativa del cheat (warping a salas, trazado de cofres y objetivos a través de paredes, pulsos de entrada virtual contra el kick por inactividad), que son técnicas de manipulación de memoria o de entrada a nivel de sistema operativo, no de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de APIs de modelos.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos de la ficha.
- Funcionalidades declaradas por el autor (todas ellas orientadas a un videojuego): teleport de coordenadas, ESP de entidades y cofres, guard anti-AFK 24/7, configuración JSON persistente con atajos de teclado, bucle de farmeo automatizado (ciclo de misiones, agrupación de mobs, limpieza de jefes) y optimizador de framerate.
- No se documenta ningún modo "thinking", visión, audio ni procesamiento multimodal.

## Casos de uso

Ninguno de los siguientes casos constituye un uso legítimo recomendado; se listan para describir el propósito declarado por el autor y contextualizar el riesgo.

- Automatización de farmeo en un videojuego: el autor describe un bucle que cicla misiones, agrupa enemigos y limpia jefes de forma automatizada, lo que en la mayoría de juegos online viola los términos de servicio.
- Teleport y warping: desplazamiento instantáneo a islas, salas de incursión o posiciones de NPC, típicamente prohibido por los sistemas antitrampas.
- Visualización de entidades a través de paredes (ESP): localización de cofres, frutas y objetivos, con el mismo problema de integridad competitiva.
- Mantenimiento de sesión activa (anti-AFK): pulsos de entrada virtual para evitar la expulsión por inactividad, lo que suele considerarse automatización no permitida.
- Gestión de perfiles y atajos: guardado de configuración JSON y recuperación de keybinds, una utilidad neutra en sí misma pero integrada en el mismo binario.
- Ajuste de rendimiento en el cliente: eliminación de partículas y renderizado de bajo consumo de CPU, presentado como optimizador, aunque el binario no es un mod gráfico auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras declaradas por el autor son latencias internas de módulos (menos de 21 ms para la configuración JSON y menos de 23 ms para el guard anti-AFK), que no son comparables con métricas de modelos de IA y no están verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10/11 de 64 bits.
- Tamaño del paquete: 4,8 MB (ZIP), con contraseña de extracción `2026`.
- Opciones de despliegue: ejecución directa del `.exe` como administrador según las instrucciones del autor; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún runtime de inferencia.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables ni relevantes para cargas de IA.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje open source real, las diferencias son categóricas: no hay pesos, no hay tokenizador, no hay ventana de contexto, no hay API de inferencia y no hay métricas de calidad lingüística comparables.

| Criterio | `johnbrightlin25/doors-script` | Modelo de IA open source típico |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos de red neuronal |
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Contexto | No aplica | Documentado en tokens |
| Licencia | MIT (metadatos) | Variable |
| Verificabilidad | Baja (binario ofuscado, enlaces de terceros) | Alta (pesos y card auditables) |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo lingüístico, multimodal o de código carece de sentido.
- Riesgo de seguridad alto: se distribuye un ejecutable de Windows protegido con contraseña, alojado en un repositorio de GitHub de un tercero (`arjunzimmermann624`) distinto del autor de la ficha de Hugging Face, un patrón habitual en campañas de malware.
- El autor reconoce que Windows Defender y SmartScreen pueden alertar sobre el binario y recomienda desactivar o ignorar esas protecciones ("whitelist the directory"), lo que agrava el riesgo.
- No hay código fuente, ni compilación reproducible, ni auditoría independiente del ejecutable.
- Uso probablemente contrario a los términos de servicio de plataformas de juego, con posible suspensión de cuentas y consecuencias legales según la jurisdicción.
- La licencia MIT declarada en los metadatos no garantiza la legalidad del uso del software en el contexto de un juego de terceros.
- Los códigos de idioma y las insignias de descargas y valoración de la model card son afirmaciones de marketing sin verificación; el repositorio registra 0 descargas y 0 likes en Hugging Face en el momento de la consulta.
- No apto para producción en ningún pipeline de IA, generación de texto, agentes o análisis de datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/johnbrightlin25/doors-script
- Repositorio de GitHub referenciado en la model card: https://github.com/Caroline27881/doors-script
- Repositorio de GitHub del paquete de descarga: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Enlace de descarga citado por el autor: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Paper, blog, demo o documentación técnica: no disponible.
