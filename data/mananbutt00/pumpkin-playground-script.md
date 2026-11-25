# mananbutt00/pumpkin-playground-script

## Resumen

`mananbutt00/pumpkin-playground-script` no es un modelo de IA. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable para Windows x64 presentado como "script" para un juego, con nombres de fichero que hacen referencia explícita a un cheat (ESP y aimbot) para el juego Deadlock. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje; sus tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) describen un binario, no un modelo.

La model card no documenta ninguna arquitectura, tamaño de parámetros, ventana de contexto ni proceso de entrenamiento. En su lugar incluye instrucciones para descargar un ZIP de 4,8 MB, extraerlo con una contraseña y ejecutar un `.exe` como administrador, además de indicaciones para desactivar avisos de Windows Defender y SmartScreen. Los enlaces de descarga apuntan a repositorios de GitHub de terceros ajenos al espacio de nombres del autor en Hugging Face.

Por todo ello, esta ficha no puede evaluar el artefacto como modelo de IA: no hay datos técnicos que reportar y la naturaleza del contenido (software de trampas para videojuegos distribuido mediante ingeniería social) desaconseja su descarga y ejecución. Los apartados siguientes reflejan esta circunstancia y marcan como "no disponible" todo aquello que la información proporcionada no permite verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable como capacidad del artefacto) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.exe` y un `.zip`, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio declara en su model card un ejecutable `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe` (build `v2.0.7`, identificador `E4FA99`) empaquetado en un ZIP de 4,8 MB, con instrucciones de extracción mediante contraseña y ejecución con privilegios de administrador. No se documenta ningún corpus de entrenamiento, tokenizador, proceso de alineación (RLHF, DPO) ni innovación técnica de modelado.

Los módulos que la model card enumera (radar 2D, filtro de loot, overlay externo a 144 Hz, escáner de offsets, perfiles JSON y capa de render "stream-proof") son funcionalidades típicas de software de trampas para videojuegos, no componentes de un modelo generativo. No hay información sobre datos, metodología ni evaluación reproducible.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los idiomas listados son metadatos del repositorio.
- El artefacto descrito se presenta como un ejecutable de trampas para un videojuego (ESP, aimbot, radar), lo que queda fuera del ámbito de esta ficha.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite los casos de uso habituales (generación de texto, código, atención al cliente, RAG, agentes).
- No se identifican aplicaciones legítimas de desarrollo o investigación a partir de la información disponible.
- El contenido descrito (software de trampas distribuido con instrucciones para eludir controles de seguridad del sistema operativo) no constituye un caso de uso recomendable en ningún contexto profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido habitual (no hay pesos ni requisitos de VRAM para inferencia de un modelo).
- El artefacto declarado requiere Windows 10 u 11 de 64 bits sobre CPU Intel o AMD x64.
- La model card menciona un consumo de memoria RAM inferior a 23 MB para uno de sus módulos, dato no verificable.
- No se documentan GPUs compatibles, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput de inferencia.
- Advertencia: ejecutar binarios de procedencia desconocida con privilegios de administrador y desactivar Windows Defender o SmartScreen, tal como sugiere la model card, expone el sistema a riesgos de seguridad graves.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, dado que el artefacto no es un modelo. Tampoco se han identificado alternativas legítimas que comparar en términos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura ni evaluación que permitan un uso como el de un LLM.
- La model card emplea tácticas de ingeniería social (insignias de descargas y valoraciones no verificables, contraseña de archivo, instrucciones para desactivar protecciones del sistema) habituales en la distribución de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no vinculados al autor del repositorio en Hugging Face.
- Ejecutar el binario como administrador y añadirlo a listas blancas de seguridad supone un riesgo elevado de compromiso del sistema.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre la seguridad ni la legalidad del contenido distribuido.
- El uso de software de trampas en videojuegos puede infringir los términos de servicio de las plataformas afectadas y, según la jurisdicción, tener implicaciones legales.
- No se debe tratar este repositorio como una fuente fiable para evaluar capacidades de IA ni integrarlo en ningún pipeline de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mananbutt00/pumpkin-playground-script
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Enlace secundario citado en la model card (GitHub de terceros, no verificado): https://github.com/SuveyuSuqi52/pumpkin-playground-script/releases/latest
