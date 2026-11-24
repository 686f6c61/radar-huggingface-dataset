# 7evn/davinci-resolve-studio-20-unlocked

## Resumen

La entrada `7evn/davinci-resolve-studio-20-unlocked` alojada en Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como una version "desbloqueada" de DaVinci Resolve Studio 20. El contenido de la model card no describe pesos, arquitectura ni pipeline de inferencia, sino instrucciones de descarga, una contrasena para descomprimir el archivo (`2026`) y una tabla de supuestas "caracteristicas" del ejecutable.

El paquete incluye indicadores claros de riesgo: el nombre del binario hace referencia a un *trainer* con *aimbot* y *ESP* para un supuesto juego ("robrun"), el ZIP esta protegido con contrasena para evadir analisis automatizados, se solicita ejecutar como administrador y los enlaces de descarga apuntan a repositorios de GitHub de terceros ajenos al autor declarado. Todo ello es incompatible con la distribucion legitima de software por parte de Blackmagic Design.

Desde la perspectiva de evaluacion de modelos, esta ficha documenta la entrada para dejar constancia de que no contiene ningun artefacto de IA utilizable: no hay `pipeline_tag`, no hay pesos, no hay tokenizador y las descargas y *likes* son cero. Cualquier uso del contenido descargable debe considerarse potencialmente malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a esta entrada. El repositorio contiene metadatos de etiquetado (`windows`, `windows-11`, `x64`, `portable`, `davinci-resolve-studio-20-unlocked`) y una model card que actua como pagina de descarga de un ejecutable. No se documentan datos de entrenamiento, tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO) ni innovaciones de inferencia.

El unico "contenido tecnico" es la descripcion del binario: plataforma objetivo Windows 10 (22H2) y Windows 11 (24H2), build `v2.7.9` (`76C934C363`), tamano de 4,8 MB y dependencias externas nulas segun el autor. La model card menciona de forma generica aceleracion por GPU (CUDA, TensorRT, DirectML, OpenCL) y "telemetria desactivada", afirmaciones no verificables y sin relacion con un modelo de lenguaje o vision.

## Capacidades

- No ofrece generacion de texto, razonamiento, codigo, matematicas ni vision: no es un modelo de IA.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los codigos de idioma son etiquetas de metadatos del repositorio.
- No dispone de modo *thinking*, audio ni ninguna modalidad.
- El artefacto distribuido es un ejecutable de Windows presentado como utilidad de "desbloqueo" de software de edicion de video.

## Casos de uso

- No procede. Esta entrada no es un modelo de IA y no tiene aplicaciones legitas de inferencia.
- Auditoria de seguridad: un equipo de seguridad puede usar esta ficha para catalogar y bloquear el dominio o los repositorios asociados en sus filtros de red y en sus politicas de descarga.
- Formacion en concienciacion: sirve como ejemplo documentado de model card fraudulenta en Hugging Face, con contrasena en el ZIP, peticion de privilegios de administrador y binario con nombre de *trainer* de *cheats*.
- Analisis de cadena de suministro: permite trazar los enlaces a repositorios de GitHub de terceros (`Shuhua73716`, `KathleenHalas33`) que no coinciden con el autor declarado (`7evn`).
- Monitorizacion de plataformas: util para equipos que vigilan la aparicion de contenido no relacionado con IA en hubs de modelos.
- Referencia para politicas de moderacion: documenta patrones tipicos (badges falsos de descargas y valoracion, build inventado, "password 2026") que pueden alimentar reglas de deteccion automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, porque no hay modelo que evaluar.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay pesos ni modelo.
- El ejecutable declarado esta orientado a Windows 10 (22H2) y Windows 11 (24H2) sobre arquitectura x64.
- No se especifican GPU recomendadas; la model card menciona CUDA, TensorRT, DirectML y OpenCL de forma generica y no verificable.
- No cabe en GPU de consumo porque no es un modelo; el artefacto es un binario de 4,8 MB comprimido.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna aplicable.
- Latencia y throughput: no disponibles; las cifras de "polling" y "response time" de la model card (477 Hz, 289 Hz, 234 Hz, <10 ms) son afirmaciones de marketing sin respaldo tecnico.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque la entrada no es un modelo de IA. Frente a un modelo open source real, las diferencias son absolutas: no hay pesos, no hay licencia de pesos (la MIT declarada cubre el repositorio, no un artefacto de IA), no hay contexto, no hay benchmarks y no hay pipeline de inferencia.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: el ZIP protegido con contrasena, el ejecutable con nombre de *aimbot*/*ESP* y la peticion de ejecucion como administrador son patrones habituales de distribucion de *malware*.
- Suplantacion de marca: se presenta como "DaVinci Resolve Studio 20 Unlocked", producto de pago de Blackmagic Design; no consta autorizacion ni vinculo con el fabricante.
- Enlaces de descarga a repositorios de GitHub de terceros distintos del autor declarado, lo que dificulta la trazabilidad y aumenta el riesgo de cadena de suministro.
- Indicadores de engagement falsos o inflados en la model card (valoracion 4,9/5, 138K descargas) frente a cero descargas y cero *likes* reales en Hugging Face.
- La licencia MIT declarada no legitima la distribucion de software de terceros ni de binarios potencialmente maliciosos.
- No usar en produccion, ni en entornos corporativos, ni en maquinas con datos sensibles.
- Si se ha descargado o ejecutado el binario, se recomienda analisis forense del sistema y rotacion de credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/7evn/davinci-resolve-studio-20-unlocked
- Repositorio de GitHub referenciado en la model card: https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026
- Repositorio de GitHub referenciado en la model card: https://github.com/KathleenHalas33/davinci-resolve-studio-20-unlocked
- Descarga referenciada en la model card: https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026/releases/download/v1.2.0/robrun-trainer-esp-aimbot-2026-v1.2.2-win64.zip
- Releases referenciadas en la model card: https://github.com/KathleenHalas33/davinci-resolve-studio-20-unlocked/releases/latest
