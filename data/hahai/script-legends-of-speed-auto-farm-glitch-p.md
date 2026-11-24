# hahai/script-legends-of-speed-auto-farm-glitch-p

## Resumen

El artefacto publicado bajo el identificador `hahai/script-legends-of-speed-auto-farm-glitch-p` no es un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 etiquetado como "script" de automatización para el videojuego *Legends of Speed*, empaquetado como un archivo ZIP (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, 4,8 MB) que requiere contraseña de extracción y cuya ejecución se indica "como administrador".

La model card no contiene información sobre arquitectura de red neuronal, parametros, tokenizador, corpus de entrenamiento ni pesos. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y el contenido del README describen funcionalidades propias de una herramienta de trampas o *cheat* para un juego: teleport de coordenadas, ESP de entidades y cofres, *server hopper*, guardia anti-AFK y optimizador de framerate.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplir los apartados técnicos habituales porque no existe un modelo subyacente. Se documenta el artefacto tal como aparece publicado, señalando explícitamente los datos no disponibles y las advertencias de seguridad relevantes. La relevancia actual es nula para desarrolladores o investigadores que busquen un modelo de lenguaje, visión u otro tipo de red neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El README menciona una "arquitectura modular" aplicada a un binario `monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe` (build `v2.5.7`, código `752E23`), con módulos descritos como "persistent JSON config", "frame-rate optimizer", "3D entity & chest ESP", "coordinate teleport", "low-ping server hopper" y "anti-AFK guard". Estos términos corresponden a funcionalidades de automatización y manipulación de un cliente de juego, no a componentes de un sistema de aprendizaje automático.

No se documenta ningún proceso de entrenamiento, corpus de datos, ajuste fino, RLHF ni DPO. Tampoco se aportan pesos, checkpoints ni artefactos de inferencia. El paquete se distribuye con contraseña de extracción (`2026`) y se enlaza a repositorios de GitHub de terceros, no al propio repositorio de Hugging Face.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El README describe funcionalidades de automatización sobre un juego: teleport de coordenadas, ESP de entidades y cofres, cambio automático de servidor, guardia anti-AFK y optimización de framerate.
- Los idiomas listados en los metadatos (14 idiomas) corresponden probablemente a la localización de la página de presentación, no a capacidades lingüísticas de un modelo.

## Casos de uso

No se identifican casos de uso legítimos para desarrolladores o investigadores de IA. Los escenarios que sugiere el artefacto son:

- Automatización de tareas repetitivas dentro de *Legends of Speed* mediante teleport y *server hopping*, con el objetivo de farmear recursos sin intervención humana.
- Visualización de entidades y cofres a través de paredes (ESP), lo que constituye una ventaja competitiva en un juego multijugador.
- Mantenimiento de sesión activa mediante pulsos de entrada virtuales para evitar la expulsión por inactividad.
- Ajuste de rendimiento del cliente mediante eliminación de partículas y renderizado de bajo coste de CPU.
- Almacenamiento de perfiles y atajos en un fichero JSON persistente.
- Ejecución de un binario con privilegios de administrador en Windows 10/11 de 64 bits.

Ninguno de estos casos es un uso productivo de un modelo de IA; además, varios de ellos vulneran con alta probabilidad los términos de servicio del juego y pueden constituir trampa en entornos multijugador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de rendimiento propias de la herramienta (por ejemplo, sondeo a 190 Hz, consumo inferior a 35 MB de RAM, consistencia del 98,6 % en teleport y del 96,5 % en anti-AFK), pero no son métricas de un modelo de IA ni están respaldadas por una evaluación independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11, 64 bits (según el README).
- VRAM estimada para inferencia: no aplica; no hay modelo que ejecutar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README (190 Hz de sondeo, menos de 35 MB de RAM) son afirmaciones del autor sin verificación.
- Espacio en disco del paquete: 4,8 MB comprimido.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada alternativas evaluables con parámetros, contexto, licencia o benchmarks.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA: no contiene pesos, tokenizador, arquitectura ni datos de entrenamiento.
- El paquete se distribuye como un ejecutable de Windows que debe lanzarse "como administrador", con contraseña de extracción, y enlaza a repositorios de GitHub de terceros ajenos al repositorio de Hugging Face. Esto impide verificar la integridad y el origen del binario.
- El nombre del ZIP hace referencia a un *trainer/mod* de *Monster Hunter Wilds*, mientras que el título del repositorio menciona *Legends of Speed*; la discrepancia sugiere contenido reempaquetado o mal etiquetado.
- Riesgo elevado de malware: ejecutables de origen no verificado, con privilegios de administrador y contraseña de extracción, son un vector habitual de troyanos, *stealers* y *ransomware*.
- El uso de herramientas de automatización y ESP en juegos multijugador puede vulnerar los términos de servicio y acarrear el bloqueo de cuentas.
- La licencia MIT declarada en los metadatos no cubre necesariamente los binarios de terceros enlazados; no se aporta aviso de copyright ni texto de licencia verificable.
- No hay sesgos de modelo que evaluar, pero sí un riesgo claro de fraude y de ingeniería social en la presentación (insignias de "99 % verificado" y "658K+ descargas" no contrastables).
- Cualquier evaluación técnica, comparativa o de producción queda fuera de alcance: la ficha no puede avalar el artefacto como modelo ni como software seguro.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hahai/script-legends-of-speed-auto-farm-glitch-p
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (GitHub, terceros): https://github.com/Michael94643/script-legends-of-speed-auto-farm-glitch-p/releases/latest
- Paper, blog, demo o documentación técnica: no disponible.
