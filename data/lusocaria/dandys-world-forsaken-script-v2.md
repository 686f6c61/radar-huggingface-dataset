# LusoCaria/dandys-world-forsaken-script-v2

## Resumen

El repositorio `LusoCaria/dandys-world-forsaken-script-v2` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un artefacto alojado en Hugging Face que se presenta como un "script" para el videojuego *Dandy's World* (variante *Forsaken*), empaquetado como un ejecutable de Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) distribuido en un archivo ZIP de 4,8 MB protegido con contraseña. La model card describe funcionalidades propias de una herramienta de trampas o mod menu: teletransporte por coordenadas, bucles de farmeo automatizado, ESP de entidades y cofres, guardia anti-AFK y optimizador de framerate.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, datos de entrenamiento ni proceso de alineación. Los tags del repositorio (`windows`, `x64`, `portable`) y el contenido del README confirman que es un binario para Windows 10/11 de 64 bits, no un modelo de lenguaje. El pipeline aparece como "no disponible" y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe interpretarse como una advertencia: el artefacto no es evaluable como modelo, no dispone de documentación técnica verificable y su patrón de distribución (ejecutable ofuscado, contraseña en el README, enlaces a repositorios de GitHub de terceros no relacionados con el autor declarado) es característico de campañas de malware. No se recomienda su descarga ni ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de 4,8 MB) |

## Arquitectura y entrenamiento

No disponible. No se describe ninguna arquitectura de red neuronal, dataset, número de tokens, proceso de preentrenamiento, ajuste supervisado, RLHF ni DPO. El contenido del repositorio es un binario empaquetado para Windows, sin código fuente, sin configuración de modelo y sin artefactos de pesos (`.safetensors`, `.gguf`, `.bin` u otros).

La model card menciona cifras de rendimiento operativo del ejecutable (tiempos de respuesta de 9 a 31 ms, polling a 185 Hz y 174 Hz, consumo de 45 MB de RAM), pero estas se refieren al comportamiento del programa en el sistema anfitrión, no a inferencia de un modelo. No constituyen datos técnicos de un modelo de IA.

## Capacidades

- No es un modelo de lenguaje ni multimodal: no genera texto, no razona, no programa, no resuelve matemáticas y no procesa visión.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades descritas en la model card corresponden a un mod menu de videojuego: teletransporte por coordenadas, bucles de farmeo, ESP de entidades y cofres, guardia anti-AFK, optimizador de framerate y "server hopper".
- Los idiomas listados en los metadatos reflejan etiquetas del repositorio, no capacidades lingüísticas verificadas de un modelo.

## Casos de uso

Ninguno de los casos de uso habituales de un modelo open source (generación de texto, código, atención al cliente, RAG, agentes, análisis de documentos) es aplicable, porque el artefacto no es un modelo. Los escenarios que describe la model card son:

- Modificación del comportamiento de un videojuego mediante inyección de memoria o automatización de entrada, con fines de trampa.
- Automatización de tareas repetitivas dentro del juego (farmeo, ciclos de misiones).
- Visualización de información oculta del juego (ESP de entidades y cofres).
- Mantenimiento de sesión activa mediante pulsos de entrada virtuales (anti-AFK).
- Optimización de rendimiento del cliente del juego (eliminación de partículas, renderizado de bajo coste).
- Cambio automatizado de instancias o servidores.

Ninguno de estos casos es un uso legítimo de un modelo de IA y varios de ellos violan los términos de servicio de plataformas de juego. No se recomienda su empleo en entornos de producción, investigación ni desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: los valores citados en la model card (9-31 ms, 174-185 Hz, 45 MB de RAM) describen el ejecutable, no inferencia de un modelo, y no son verificables de forma independiente.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" para este artefacto, ya que no es un modelo de IA. Cualquier comparación con LLM, modelos de visión o sistemas multimodales sería engañosa.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA: no debe catalogarse ni evaluarse como tal.
- Distribución mediante ZIP con contraseña (`2026`), ejecutable ofuscado y enlaces a repositorios de GitHub de terceros no vinculados al autor declarado. Este patrón es consistente con campañas de distribución de malware.
- El nombre del ejecutable (`inzoi-cheat-trainer-mod-menu-...`) no coincide con el nombre del repositorio (`dandys-world-forsaken-script-v2`), lo que sugiere reutilización de binarios de otros proyectos o suplantación.
- La licencia MIT declarada no aporta garantías sobre el contenido del binario; el código fuente no está publicado.
- Riesgo de violación de términos de servicio de plataformas de juego y posibles consecuencias legales para el usuario.
- Riesgo de robo de credenciales, instalación de software no deseado y compromiso del sistema anfitrión.
- No hay sesgos lingüísticos evaluables porque no hay modelo; los idiomas listados son etiquetas de metadatos sin verificación.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- No apto para producción, investigación ni uso educativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LusoCaria/dandys-world-forsaken-script-v2
- Enlace de descarga citado en la model card (ZIP, contraseña `2026`): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/SebastienKorkmaz58311/dandys-world-forsaken-script-v2
- Paper, blog, demo o documentación técnica: no disponible.
