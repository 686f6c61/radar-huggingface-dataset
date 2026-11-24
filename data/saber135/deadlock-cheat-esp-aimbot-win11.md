# saber135/deadlock-cheat-esp-aimbot-win11

## Resumen

El repositorio `saber135/deadlock-cheat-esp-aimbot-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como utilidad de trampas (cheat) para el videojuego Deadlock, con modulos de ESP (deteccion visual de jugadores a traves de paredes) y aimbot (asistencia de punteria automatica) dirigidos a Windows de 64 bits. El autor lo publica bajo el identificador `saber135` y lo etiqueta con la licencia MIT, pero el contenido real es un binario ejecutable empaquetado en un ZIP de 4,8 MB, no pesos de red neuronal.

El artefacto se presenta con un README de caracter promocional que incluye insignias de descargas y valoraciones no verificables, un manifiesto TOML con un hash de compilacion (`64E4EAA988`) y una contrasena de extraccion (`2026`). No existe pipeline declarado, ni ficha de modelo, ni tarjetas de arquitectura, ni datos de entrenamiento. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a la interfaz del programa, no a capacidades linguisticas de un modelo.

Desde la perspectiva de una ficha tecnica de IA open source, este repositorio queda fuera de ambito: no hay transformer, ni parametros, ni contexto, ni cuantizacion. Lo relevante es advertir de que se trata de software de terceros no auditado, distribuido como ejecutable para Windows, que requiere permisos de administrador y que esta disenado para vulnerar las condiciones de uso de un videojuego. La ficha que sigue documenta lo que el autor declara, marcando como no disponible todo aquello que no es aplicable o no ha sido verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable nativo x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (interfaz del programa) |
| Licencia | MIT (declarada por el autor) |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El paquete es un binario compilado para Windows x64 (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, version `v1.0.5`, firma `64E4EAA988`) que, segun la model card, opera en modo usuario mediante lectura directa de memoria del proceso del juego, sin inyeccion de DLL interna. El README menciona un nucleo externo en modo usuario, una capa de renderizado por Desktop Duplication y suavizado de entrada por curvas de Bezier con `14` hilos de trabajo y sondeo a `472 Hz`.

No se documenta ningun dataset, ningun proceso de RLHF o DPO, ni innovacion tecnica en el sentido del aprendizaje automatico. Los unicos detalles tecnicos declarados son de ingenieria de sistemas (exclusion de captura en OBS, ShadowPlay y Discord, tecla de panico `END`, consumo declarado inferior a 32 MB de RAM). Ninguno de estos datos ha sido verificado de forma independiente.

## Capacidades

- Deteccion visual de jugadores mediante cajas delimitadoras 2D y 3D, esqueletos de huesos y ESP de distancia, segun declara el autor.
- Aimbot con radio de FOV configurable, comprobacion de visibilidad (VisCheck) y curvas de apuntado humanizadas.
- Radar 2D y filtro de objetos por rareza y seguimiento de contenedores.
- Superposicion externa a mas de 144 Hz con sondeo declarado de 472 Hz.
- Exclusion de la superposicion en capturas de OBS, ShadowPlay y Discord (stream-proof).
- Tecla de panico `END` para descarga inmediata y salida del proceso.
- Interfaz localizada en 14 idiomas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision por computador en sentido ML, tool calling ni capacidades de agente.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legitima de generacion, analisis o automatizacion de conocimiento.
- Uso en entornos de investigacion de seguridad: unicamente como muestra para analisis de malware o de tecnicas de evasion en modo usuario, siempre en maquina aislada y con las precauciones habituales de analisis de binarios no confiables.
- Auditoria de deteccion anti-trampas: un equipo de integridad de videojuegos podria estudiar el binario para comprender que tecnicas de lectura de memoria y superposicion declara, con el fin de mejorar sus sistemas de deteccion.
- Formacion en etica y cumplimiento: como caso documentado de distribucion de software que infringe terminos de servicio y puede conllevar el baneo de cuentas.
- No se recomienda ningun uso en produccion, en equipos personales ni en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras de caracter promocional (110K+ descargas, valoracion 4,8/5, 472 Hz de sondeo, menos de 32 MB de RAM) que no estan respaldadas por ninguna medicion reproducible ni por una metodologia publicada.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits, segun el autor.
- Arquitectura: x64.
- Permisos: el README indica ejecutar como administrador.
- Espacio en disco: archivo ZIP de 4,8 MB; el tamano descomprimido no se especifica.
- RAM: el autor declara un consumo inferior a 32 MB, dato no verificado.
- GPU: no se especifica ningun requisito grafico; la superposicion se apoya en Desktop Duplication.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI; no es un modelo servible por API).
- Latencia y throughput: no disponibles; las cifras de 472 Hz y 144 Hz+ son declaraciones del autor sin validacion.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. En la categoria de software de trampas para videojuegos, la comparacion queda fuera del alcance de esta ficha y no se dispone de datos verificables de alternativas.

| Criterio | Este repositorio | Modelo de IA tipico |
|---|---|---|
| Naturaleza | Ejecutable x64 para Windows | Pesos de red neuronal |
| Parametros | no disponible | Variable (miles de millones) |
| Contexto | no disponible | Decenas de miles de tokens |
| Licencia | MIT declarada | Variable |
| Formato | ZIP con `.exe` | safetensors, GGUF |
| Uso legitimo en produccion | No recomendado | Si, segun licencia |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imagenes en el sentido del aprendizaje automatico.
- El binario no esta auditado ni firmado de forma verificable; ejecutarlo como administrador otorga privilegios elevados a codigo de origen desconocido.
- La distribucion mediante contrasena en el ZIP y enlaces de descarga alojados en repositorios de terceros es un patron habitual en la distribucion de malware; existe riesgo de payload adicional no declarado.
- El uso de trampas en Deadlock infringe los terminos de servicio del juego y puede provocar el baneo permanente de la cuenta.
- Las cifras de descargas, valoracion y rendimiento del README no son verificables y deben tratarse como material promocional.
- La licencia MIT declarada no legitima el uso del software para vulnerar acuerdos con terceros ni exime de responsabilidad legal.
- No hay soporte, mantenimiento ni canal de incidencias documentado.
- El identificador del repositorio y el nombre del ZIP no coinciden (`deadlock` frente a `marvel-rivals`), lo que sugiere reutilizacion de plantillas y falta de trazabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saber135/deadlock-cheat-esp-aimbot-win11
- Repositorio GitHub referenciado en el README: https://github.com/QakajaVeca60/deadlock-cheat-esp-aimbot-win11
- Releases del proyecto referenciado: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases
- Paquete de descarga citado en el README: https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
