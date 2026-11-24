# rxgamer/bybit-binance-perp-copytrade-bot-portable

## Resumen

La entrada `rxgamer/bybit-binance-perp-copytrade-bot-portable` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable portable para Windows (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v2.8.7`) empaquetado en un archivo ZIP de 4,8 MB protegido con contraseña, y cuya model card describe funcionalidades de un bot de copytrading de perpetuos entre Bybit y Binance.

La publicacion no contiene pesos de modelo, tokenizador, configuracion de arquitectura ni artefactos de inferencia. Los tags declarados (windows, windows-11, x64, portable) y el contenido del README apuntan a una distribucion de software binario, no a un modelo de lenguaje, vision o multimodal. El pipeline aparece como "no disponible", el contador de descargas es 0 y el de likes es 0.

Desde la perspectiva de evaluacion de modelos, esta ficha debe interpretarse como una advertencia: el artefacto no es evaluable como modelo de IA y presenta multiples senales de riesgo (enlaces a repositorios de terceros no coincidentes con el autor declarado, binario ofuscado en ZIP con contrasena, instrucciones para ejecutar como administrador). Se documenta a continuacion con el mismo rigor que cualquier otra ficha, marcando como "no disponible" todo aquello que no existe o no puede verificarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable portable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos del repositorio, no como capacidades linguisticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` win64, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. El repositorio no publica configuracion de transformer, MoE, SSM ni modelo hibrido alguno, ni pesos en ningun formato. Tampoco hay informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus, procesos de RLHF, DPO o ajuste fino.

El contenido de la model card describe, en su lugar, un supuesto motor de trading con modulos de take profit multinivel, motor de bundles Jito/MEV, enrutamiento de ordenes con latencia inferior a 40 ms via WebSocket y gRPC, un bundler de 20 wallets con Lookup Tables, sandbox de paper trading y copytrading de "smart money". Estas afirmaciones son marketing no verificable: no se aportan repositorios de codigo fuente, papers, metricas reproducibles ni artefactos tecnicos que las respalden.

## Capacidades

- No se ha documentado ninguna capacidad de modelo de IA (generacion de texto, razonamiento, codigo, matematicas, vision, audio ni multimodal).
- No se declara soporte de tool calling ni function calling en el sentido de un LLM.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El repositorio declara metadatos multilingues (14 idiomas) que corresponden a etiquetas de la model card, no a capacidades linguisticas verificadas de un modelo.
- La model card atribuye al binario funciones de trading automatizado (copytrading de perpetuos, take profit escalonado, paper trading), sin evidencia tecnica ni auditoria publica.

## Casos de uso

- Evaluacion de riesgos de cadena de suministro: el repositorio sirve como caso de estudio para formadores y equipos de seguridad que analizan distribuciones de binarios con contrasena en ZIP y enlaces a repositorios de terceros no coincidentes con el autor declarado.
- Auditoria de repositorios en Hugging Face: util para calibrar heuristicas de deteccion de contenido que no es un modelo (ausencia de pesos, tags de sistema operativo, README con instrucciones de ejecucion como administrador).
- Formacion en higiene de dependencias: ejemplo practico de por que no debe ejecutarse un `.exe` descargado de un repositorio de modelos sin verificacion de firma ni analisis en sandbox.
- Documentacion de taxonomias: permite clasificar artefactos no-modelo dentro de un catalogo de modelos y mantener separados los binarios de las fichas tecnicas.
- Analisis de malware potencial: un equipo de respuesta a incidentes puede usar la muestra (ZIP de 4,8 MB) en un entorno aislado para determinar su comportamiento, sin ejecutarla en sistemas productivos.
- No se recomienda ningun caso de uso productivo del binario: no hay evidencia de que realice las funciones que declara, ni garantias de seguridad, soporte o mantenimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (172 Hz, 388 Hz, 99,4 % de consistencia, latencia inferior a 40 ms, respuesta inferior a 24 ms) son afirmaciones de marketing sin metodologia, sin entorno de medicion y sin datos reproducibles; no se incluyen aqui como resultados de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del binario: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: sin datos verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a un modelo open source tipico, las diferencias son estructurales:

| Criterio | Este repositorio | Modelo open source tipico |
|---|---|---|
| Pesos publicados | No | Si (safetensors, GGUF, etc.) |
| Arquitectura documentada | No | Si |
| Benchmark reproducible | No | Habitualmente si |
| Codigo fuente | No | Frecuentemente si |
| Formato del artefacto | ZIP con `.exe` win64 | Pesos y tokenizador |
| Evaluacion como modelo | No aplica | Si |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con MMLU, HumanEval, GSM8K ni ninguna otra prueba de modelos.
- El README contiene enlaces de descarga que apuntan a un repositorio de GitHub (`arjunzimmermann624/schedule-1-cheat-trainer`) distinto del autor declarado en Hugging Face (`rxgamer`) y del citado en el propio README (`niklash13`). Esta incoherencia es una senal de riesgo.
- El binario se distribuye comprimido con contrasena fija (`2026`) y se instruye a ejecutarlo como administrador, practica que dificulta el analisis automatizado y eleva el impacto potencial de cualquier codigo malicioso.
- El nombre del ejecutable (`schedule-1-cheat-trainer`) no guarda relacion con la funcionalidad declarada de copytrading, lo que sugiere reutilizacion de plantillas o contenido no verificado.
- No hay evidencia de auditoria de seguridad, firma de codigo, codigo fuente publico ni historial de mantenimiento.
- Un bot de trading que opera con claves de API de exchanges implica riesgo financiero directo y exposicion de credenciales; sin auditoria, su uso es desaconsejable en cualquier entorno con capital real.
- La licencia MIT declarada cubre el repositorio, pero no acredita la legalidad ni la seguridad del binario distribuido.
- El contador de descargas (0) y de likes (0) no permiten inferir adopcion ni validacion por parte de la comunidad.
- Recomendacion: no ejecutar el binario en sistemas con datos sensibles ni con acceso a exchanges; si se analiza, hacerlo en una maquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rxgamer/bybit-binance-perp-copytrade-bot-portable
- Repositorio de GitHub citado en el README (autor distinto): https://github.com/niklash13/bybit-binance-perp-copytrade-bot-portable
- Repositorio de GitHub del enlace de descarga (tercer autor): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Enlace de descarga directa citado en la model card: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Papers, blogs, demos o documentacion tecnica: no disponible.
