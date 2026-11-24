# shxtnss/deadlock-cheat-aimbot-esp-pc

## Resumen

El repositorio `shxtnss/deadlock-cheat-aimbot-esp-pc` no contiene un modelo de inteligencia artificial. Se trata de un artefacto publicado en Hugging Face que se presenta como una herramienta de trampas (cheat) para el videojuego Deadlock, con funciones de aimbot (apuntado automatico) y ESP (deteccion visual de jugadores a traves de paredes). El autor declarado es el usuario `shxtnss`, con fecha de creacion y actualizacion del 24 de noviembre de 2026, cero descargas y cero likes en el momento de redactar esta ficha.

El contenido de la model card es un README de tipo promocional que distribuye un supuesto ejecutable para Windows 10 y Windows 11 de 64 bits, empaquetado en un ZIP de 4,8 MB protegido con contrasena. El texto mezcla nombres de artefactos incongruentes (referencias a un supuesto bot de trading con el nombre `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`), enlaces a repositorios de GitHub de terceros y afirmaciones de rendimiento no verificables (respuestas en menos de 28 ms, sondeo a 322 Hz, uso de RAM inferior a 26 MB).

Desde el punto de vista de evaluacion de modelos, este repositorio carece de cualquier elemento propio de un modelo de IA: no hay pesos, no hay arquitectura declarada, no hay tokenizador, no hay pipeline de inferencia y no hay datos de entrenamiento. La ficha que sigue documenta lo que el artefacto declara ser y advierte de los riesgos asociados a su descarga y ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con ejecutable `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto se describe como una aplicacion externa en modo usuario ("user-mode external core") que renderiza una superposicion (overlay) mediante Desktop Duplication, sin inyeccion de DLL en el proceso del juego. El autor menciona un "dynamic offset scanner" para resolver firmas de punteros tras los parches del juego, un suavizado de entrada por curvas de Bezier con radio de FOV configurable y una comprobacion de visibilidad (VisCheck). No se aporta ningun detalle verificable sobre implementacion, dependencias, cadena de compilacion ni integridad del binario.

El README incluye referencias cruzadas a repositorios ajenos (`SvenCastillo/deadlock-cheat-aimbot-esp-pc`, `carlos7088/pump-fun-jito-bundler-sniper-bot-2026`) y a un binario con nombre de bot de trading, lo que sugiere una plantilla reutilizada o un intento de distribucion de software potencialmente malicioso bajo apariencia de herramienta de juego.

## Capacidades

- Aimbot con suavizado de entrada configurable (radio de FOV, curvas humanizadas) y comprobacion de visibilidad.
- ESP con cajas delimitadoras 2D y 3D, esqueletos de huesos y distancia a objetivos.
- Radar 2D con filtro de objetos por rareza.
- Tecla de panico (`END`) para descarga inmediata del proceso.
- Escaneo dinamico de offsets tras actualizaciones del juego.
- Distribucion como ejecutable portable para Windows 10/11 x64.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision por IA, tool calling ni ninguna capacidad propia de un modelo de lenguaje.

## Casos de uso

- No se identifican casos de uso legitimos para un modelo de IA, porque el artefacto no es un modelo.
- Uso declarado por el autor: obtencion de ventaja en el videojuego Deadlock mediante aimbot y ESP, lo que contraviene los terminos de servicio del juego y puede conllevar el baneo de la cuenta.
- Auditoria de seguridad: analisis del binario en un entorno aislado para estudiar tecnicas de evasion de deteccion y distribucion de software no verificado.
- Investigacion sobre ingenieria social: estudio del patron de README promocional con contrasena en el ZIP, enlaces a terceros y nombres de artefacto incongruentes como senales de alarma.
- Formacion en ciberseguridad: ejemplo de artefacto que solicita ejecucion como administrador y desactivacion de advertencias de Windows Defender/SmartScreen.
- No se recomienda su despliegue en entornos productivos, corporativos ni personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras aportadas por el autor (menos de 28 ms de respuesta, sondeo a 322 Hz, menos de 26 MB de RAM, escaneo de offsets en menos de 6 ms) son afirmaciones de marketing sin metodologia, sin entorno de prueba y sin verificacion independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits.
- RAM declarada por el autor: menos de 26 MB en ejecucion (no verificable).
- GPU: no se especifica; el renderizado se realiza por Desktop Duplication, por lo que se apoya en la GPU del sistema.
- Tasa de refresco objetivo declarada: 144 Hz o superior.
- Cabe en cualquier equipo consumer con Windows 10/11 x64 segun los requisitos declarados.
- Opciones de despliegue: ejecutable portable `.exe` extraido de un ZIP; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma fiable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, se compara con otros tipos de artefacto publicados en Hugging Face:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| `shxtnss/deadlock-cheat-aimbot-esp-pc` | Ejecutable de cheat para Windows | no aplica | no aplica | MIT | Alto (software no verificado, ejecucion como admin) |
| Modelo de lenguaje open source tipico (p. ej. familia Llama, Qwen, Mistral) | Modelo transformer | 1B-70B+ | 4K-128K+ | Licencias permisivas o comunitarias | Bajo o medio (uso legitimo) |
| Modelo de vision-lenguaje open source | Transformer multimodal | Variable | Variable | Variable | Bajo o medio |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imagenes mediante redes neuronales.
- Riesgo de seguridad elevado: el README pide ejecutar un `.exe` como administrador, descomprimir con contrasena y desactivar advertencias de Windows Defender/SmartScreen, patron habitual en distribucion de malware.
- Inconsistencia de nombres: el ZIP descargable se llama `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`, lo que apunta a una plantilla reutilizada o a un enlace manipulado.
- Enlaces a repositorios de terceros no verificados (`SvenCastillo`, `carlos7088`) que pueden cambiar o desaparecer.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Uso del artefacto en el juego Deadlock viola los terminos de servicio y puede provocar el baneo permanente de la cuenta.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su integridad.
- No apto para produccion, entornos corporativos ni equipos con datos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/shxtnss/deadlock-cheat-aimbot-esp-pc
- Repositorio citado en el README (tercero): https://github.com/SvenCastillo/deadlock-cheat-aimbot-esp-pc
- Repositorio citado en el README (tercero): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Enlace de descarga citado en el README (tercero, no verificado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs, demos ni documentacion tecnica adicional en la informacion proporcionada.
