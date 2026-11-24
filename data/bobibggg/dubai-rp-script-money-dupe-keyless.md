# BobiBGGG/dubai-rp-script-money-dupe-keyless

## Resumen

La entrada `BobiBGGG/dubai-rp-script-money-dupe-keyless` alojada en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable de Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB con contrasena `2026`) presentado como "script de dinero duplicado" para un rol de Dubai y como "mod menu" para el juego InZOI. El autor, `BobiBGGG`, lo publica bajo licencia MIT y lo etiqueta con lenguajes y plataformas, pero no incluye pesos, arquitectura, tokenizador ni pipeline de inferencia.

Desde la perspectiva de un desarrollador o investigador que busca un modelo open source, esta ficha debe ser clara: no hay ningun modelo que evaluar. El repositorio carece de `config.json`, `tokenizer.json`, ficheros `safetensors` o `GGUF`, y la model card es en realidad un instructivo de descarga de un binario de terceros alojado en un repositorio de GitHub ajeno (`Roussel10024/inzoi-cheat-trainer-mod-menu`). Las etiquetas de idioma (`en`, `ru`, `zh`, `es`, etc.) y de plataforma (`windows-11`, `x64`, `portable`) son metadatos de clasificacion, no indicadores de capacidades linguisticas del modelo.

Por tanto, la ficha documenta el artefacto tal como aparece publicado y advierte de los riesgos asociados: distribucion de binarios sin verificacion, contrasenas en el propio README, redireccion a repositorios de terceros y ausencia total de trazabilidad tecnica. Cualquier evaluacion de rendimiento, arquitectura o hardware resulta inaplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario empaquetado para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las etiquetas `en`, `ru`, `zh`, `es`, `pt`, `tr`, `de`, `fr`, `ja`, `ko`, `ar`, `pl`, `vi`, `id` son metadatos del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 4,8 MB con un `.exe` en su interior) |
| Tamano del artefacto | 4,8 MB (ZIP) |
| Plataforma objetivo | Windows 10 (22H2) y Windows 11 (24H2), x64 |
| Build declarada | `v1.3.3` (`573B01` / `573B019E65`) |
| Contrasena del archivo | `2026` |
| Fecha de creacion en HF | 2026-11-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio no contiene ficheros de pesos, configuracion de modelo, tokenizador ni scripts de entrenamiento o evaluacion. La model card describe un supuesto "core externo en modo usuario" con overlay a 144 Hz, escaner de offsets dinamicos, perfiles JSON intercambiables en caliente y una tecla de panico (`END`), pero estos terminos corresponden a la jerga tipica de herramientas de trampas para videojuegos (ESP, aim assist con suavizado Bezier, VisCheck), no a componentes de un modelo de lenguaje.

El unico "entrenamiento" implicito es la ingenieria social: la model card incluye botones de descarga que apuntan a un repositorio de GitHub de otro usuario, una contrasena de descompresion publicada en el propio texto y afirmaciones no verificables (167K descargas, 99 % de valoraciones verificadas) que no coinciden con las metricas reales del repositorio en Hugging Face (0 descargas, 0 likes).

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues reales; las etiquetas de idioma son metadatos del repositorio.
- El artefacto se presenta como un ejecutable de Windows que, segun su propia descripcion, interactua con el proceso de un juego (InZOI) y con un rol de Dubai, lo que constituye una herramienta de terceros, no un modelo.
- No dispone de modo "thinking", audio, vision ni ninguna capacidad propia de un modelo fundacional.

## Casos de uso

Ninguno de los casos de uso habituales de un modelo open source (atencion al cliente, generacion de codigo, analisis documental, RAG, agentes, traduccion, etc.) es aplicable, porque no hay modelo. Los unicos escenarios realistas son de analisis del artefacto:

- Analisis de seguridad de artefactos: un equipo de seguridad puede usar este repositorio como caso de estudio de distribucion de binarios sin verificacion, contrasenas embebidas en el README y redireccion a repositorios de terceros.
- Formacion en higiene de cadena de suministro: util para ilustrar por que no se deben ejecutar binarios descargados de repositorios no verificados ni con contrasenas publicadas.
- Deteccion de phishing y malware: el patron (badges con cifras infladas, botones de descarga, contrasena `2026`, enlaces a repositorios ajenos) es representativo de campanas de distribucion de software no deseado.
- Auditoria de metadatos en Hugging Face: sirve para ejemplificar como un repositorio puede etiquetarse como multilingue y con licencia MIT sin contener ningun modelo, lo que complica el filtrado automatico por parte de plataformas y agregadores.
- Investigacion sobre contaminacion de indices de modelos: util para estudiar como los repositorios de "herramientas" se infiltran en busquedas de modelos y degradan la calidad de los catalogos.
- Docencia sobre evaluacion de modelos: caso practico de como distinguir un modelo real (con `config.json`, pesos y tokenizador) de un artefacto que solo comparte metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica de modelos de lenguaje. Las cifras que aparecen en la model card (167K descargas, 99 % de valoraciones, latencias de `< 6 ms`, `< 11 ms`, `< 27 MB` de RAM, `143 Hz` de polling) son afirmaciones del autor sin verificacion independiente y no corresponden a ningun benchmark reproducible de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisitos del artefacto: Windows 10 (22H2) o Windows 11 (24H2) de 64 bits, permisos de administrador para ejecutar el `.exe`, 7-Zip o WinRAR para extraer el ZIP con contrasena `2026`.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos" a la que comparar este artefacto. Frente a modelos open source reales de la misma fecha o tamano, la comparacion es inaplicable porque el repositorio no contiene pesos ni arquitectura.

| Criterio | Este repositorio | Modelo open source tipico |
|---|---|---|
| Contenido | ZIP de 4,8 MB con un `.exe` | Pesos `safetensors`/`GGUF` + `config.json` + tokenizador |
| Parametros | no disponible | Declarados en la model card y en `config.json` |
| Contexto | no disponible | Declarado y verificable |
| Benchmarks | no disponibles | MMLU, HumanEval, GSM8K, etc. |
| Reproducibilidad | nula | Alta (pesos y receta publicados) |
| Trazabilidad | redireccion a repositorio de terceros | Repositorio del autor original |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, arquitectura, tokenizador ni pipeline de inferencia. Cualquier uso como modelo es inviable.
- Riesgo de seguridad alto: el repositorio distribuye un ejecutable de Windows (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) alojado en un repositorio de GitHub de otro usuario (`Roussel10024/inzoi-cheat-trainer-mod-menu`), sin firma digital ni hash publicados.
- Contrasena de descompresion publicada en el propio README (`2026`): practica habitual para evadir analisis automatizados de antivirus y sandboxes.
- Metricas infladas: la model card afirma 167K descargas y 99 % de valoraciones, mientras que el repositorio en Hugging Face registra 0 descargas y 0 likes.
- Etiquetado enganoso: se declara multilingue (14 idiomas) y con licencia MIT, lo que puede confundir a filtros automaticos de catalogos de modelos.
- Herramienta de trampas: la descripcion corresponde a un "mod menu" con ESP, aim assist y duplicacion de dinero para un juego, lo que puede violar los terminos de servicio del juego y la legislacion aplicable en materia de trampas y fraude.
- Licencia MIT: aunque el metadato declara MIT, la licencia no cubre el binario de terceros ni garantiza su legalidad o seguridad.
- Sin soporte del autor: 0 descargas, 0 likes, sin issues ni discusiones; no hay canal de soporte ni mantenimiento.
- Fecha de creacion futura (2026-11-24): metadato anomalo que sugiere manipulacion del repositorio o del reloj del sistema.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BobiBGGG/dubai-rp-script-money-dupe-keyless
- Repositorio de GitHub referenciado en la model card (terceros): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Repositorio de GitHub referenciado en la model card (autor de la model card): https://github.com/guillaumemitsotakis/dubai-rp-script-money-dupe-keyless
- Enlace de descarga directa citado en la model card (no verificado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
