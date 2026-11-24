# leontheagent/dubai-rp-script-money-dupe-portable

## Resumen

`leontheagent/dubai-rp-script-money-dupe-portable` no es un modelo de IA. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una página de descarga de un supuesto ejecutable para Windows x64 (`delta-executor-pc-2026-v1.2.2-win64.exe`, versión `v2.8.9`, build `22E4BB`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card no describe pesos, arquitectura ni datos de entrenamiento: describe un instalador, instrucciones para ejecutarlo como administrador y una lista de funciones propias de un *cheat* o *script* para un servidor de roleplay (Dubai RP) presuntamente basado en FiveM/GTA.

El repositorio no contiene ningún artefacto de modelo (safetensors, GGUF, etc.), no declara pipeline y acumula 0 descargas y 0 likes en el momento de la consulta. Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`dawidb9567/delta-executor-pc-2026`) y a una release de `tscott430/dubai-rp-script-money-dupe-portable`, no al propio repositorio de Hugging Face.

Desde el punto de vista de evaluación de modelos, este repositorio debe clasificarse como **no conforme**: no es un modelo, no es reproducible, no es auditable y su ejecución implica riesgos de seguridad. La ficha que sigue documenta lo que el autor declara, marcando explícitamente todo lo que no está disponible, y advierte de los riesgos asociados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, ni dataset de entrenamiento, ni proceso de alineación (RLHF/DPO) documentado. El contenido del repositorio es una página de distribución de software: un binario `delta-executor-pc-2026-v1.2.2-win64.exe` (build `22E4BB2FB1`, versión `v2.8.9`) dentro de un archivo `delta-executor-pc-2026-v1.2.2-win64.zip` de 4,8 MB con contraseña de extracción `2026`.

Las "características" que declara el autor (bezier input smoothing a 149 Hz, overlay externo 144 Hz+, panic key `END`, escáner de offsets dinámico a 231 Hz, core en modo usuario sin hooks DLL, perfiles JSON intercambiables en caliente) corresponden a técnicas típicas de *cheats* para videojuegos, no a componentes de un modelo. No hay información sobre metodología, procedencia del binario ni cadena de compilación verificable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- El autor declara, como funcionalidades del ejecutable: *input smoothing* con curvas bezier, overlay externo con cajas 2D/3D y esqueletos, *panic key* para descarga, escáner de offsets tras parches y cambio de perfiles JSON con una tecla.
- Multilingüe solo a nivel de metadatos del repositorio; no hay evidencia de capacidades lingüísticas reales.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad propia de un modelo fundacional.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que el autor sugiere son:

- Ejecución de un supuesto *script* de "money dupe" en un servidor de roleplay (Dubai RP): requiere ejecutar un binario de procedencia desconocida como administrador, con el consiguiente riesgo de compromiso del sistema.
- Uso de un *overlay* externo con cajas y esqueletos: funcionalidad propia de trampas en videojuegos, con riesgo de sanción por parte del servidor y de los términos de servicio de la plataforma.
- *Input smoothing* y automatización de entrada: no aporta valor fuera del contexto de trampas.
- Gestión de perfiles JSON (Legit, Visual, Custom): configuración de un *cheat*, no una aplicación de IA.
- Distribución de software portable en Windows x64: el único aspecto técnicamente neutro, aunque el binario no es verificable.
- Evaluación de modelos: **no aplica**; este repositorio no debe incluirse en ningún *benchmark* ni pipeline de evaluación de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor cita cifras internas no verificables (consistencia del 97,2 % en *panic key*, 99,5 % en *overlay*, latencias de < 33 ms y < 29 ms, *polling* a 149 Hz y 231 Hz), pero no son métricas de un modelo ni están respaldadas por una metodología reproducible.

## Requisitos de hardware

- Plataforma declarada: Windows 10/11 de 64 bits (x64).
- Tamaño del paquete: 4,8 MB (ZIP); no requiere GPU ni VRAM, al no ser un modelo.
- No aplica ninguna recomendación de A100, H100 o RTX 4090.
- No hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no hay pesos que servir.
- Latencia y *throughput*: el autor declara cifras de *polling* (149 Hz, 231 Hz) sin metodología; no verificables.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: este repositorio no es un modelo de IA. Frente a un LLM open source real (por ejemplo, cualquier modelo con pesos en safetensors y *model card* técnica), la diferencia no es de rendimiento sino de naturaleza del artefacto.

## Limitaciones y advertencias

- **No es un modelo de IA**: no contiene pesos, tokenizador, configuración ni código de inferencia.
- **Riesgo de seguridad alto**: se pide ejecutar un `.exe` de origen no verificado como administrador y extraerlo con una contraseña fija (`2026`), patrón habitual en campañas de *malware* o *droppers*.
- **Enlaces externos**: la descarga apunta a repositorios de GitHub de terceros, no al repositorio de Hugging Face; no hay verificación de integridad ni firma.
- **Licencia**: se declara MIT, pero al no haber código fuente ni binario verificable, la licencia no aporta garantías sobre el contenido distribuido.
- **Uso comercial**: desaconsejado; el binario podría violar los términos de servicio de la plataforma de juego y carece de cualquier garantía.
- **Sesgos y alucinación**: no aplica en el sentido de un LLM, pero la *model card* contiene afirmaciones no verificables (cifras de rendimiento, número de descargas "785K+") que no se corresponden con las 0 descargas registradas por Hugging Face.
- **Idiomas**: los 14 idiomas listados son etiquetas de metadatos sin respaldo funcional.
- **Reproducibilidad**: nula; no hay *hashes*, ni *build* reproducible, ni código fuente.
- **Recomendación**: no descargar ni ejecutar; reportar el repositorio a Hugging Face si se detecta en flujos de trabajo de evaluación de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leontheagent/dubai-rp-script-money-dupe-portable
- Repositorio de GitHub citado en la *model card*: https://github.com/dawidb9567/delta-executor-pc-2026
- Release citada en la *model card*: https://github.com/tscott430/dubai-rp-script-money-dupe-portable/releases/latest
- Paquete citado (no verificado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
