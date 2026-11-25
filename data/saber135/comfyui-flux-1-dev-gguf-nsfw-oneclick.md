# saber135/comfyui-flux-1-dev-gguf-nsfw-oneclick

## Resumen

La ficha corresponde al repositorio de Hugging Face `saber135/comfyui-flux-1-dev-gguf-nsfw-oneclick`, publicado por el usuario saber135 el 24 de noviembre de 2026. Pese al nombre, que sugiere una distribucion de ComfyUI con pesos GGUF de FLUX.1-dev orientada a contenido NSFW, la model card no contiene ningun peso de modelo ni ficha tecnica de un modelo de IA: describe un supuesto instalador para Windows (`rob-run-cheat-mod-menu-v1.2.2-win64.zip`, 4,8 MB) con contrasena de descompresion y un ejecutable que debe lanzarse como administrador.

El contenido de la model card esta orientado a la distribucion de un binario de dudosa procedencia: enlaces a repositorios de GitHub de terceros, un ejecutable que requiere privilegios elevados, un archivo comprimido protegido con contrasena para evadir analisis automatizados y una tabla de "capacidades" que en realidad describe funciones de trampas para videojuegos (radar 2D, overlay, ESP, exclusion de capturas de pantalla en OBS y ShadowPlay). No hay evidencia de que exista un modelo de lenguaje o de difusion subyacente, ni metadatos de arquitectura, parametros o contexto.

Desde el punto de vista de evaluacion tecnica, este repositorio no debe tratarse como un modelo open source: es un artefacto de software potencialmente malicioso que se presenta como modelo. La ficha se completa a continuacion con los datos disponibles, marcando explicitamente como "no disponible" todo lo que no consta, y con advertencias de seguridad proporcionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe ningun modelo neuronal; el artefacto es un instalador para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere GGUF, pero no se incluyen pesos ni ficheros GGUF en el repositorio) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun tags de la model card) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el unico artefacto descrito es `rob-run-cheat-mod-menu-v1.2.2-win64.zip`, 4,8 MB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO u otros). El repositorio no contiene pesos, tokenizador, configuracion de modelo ni scripts de inferencia. El unico contenido tecnico descrito en la model card es un supuesto ejecutable de Windows con modulos de overlay, radar y filtrado de objetos, sin relacion con FLUX.1-dev ni con ComfyUI mas alla del nombre del repositorio.

No hay innovacion tecnica documentada relativa a modelos de IA. Los unicos parametros numericos que aparecen (frecuencias de sondeo de 245 Hz y 148 Hz, consumo de memoria inferior a 51 MB y 38 MB, consistencia del 96,4 %) corresponden a las supuestas funciones del ejecutable de trampas, no a un modelo neuronal, y no son verificables.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue real; los codigos de idioma de los tags no van acompanados de evaluacion alguna.
- El nombre del repositorio sugiere generacion de imagenes con FLUX.1-dev en ComfyUI y pesos GGUF, pero no se incluye ningun peso ni flujo de trabajo verificable.
- La model card describe funcionalidades de un ejecutable de Windows: overlay externo, radar 2D, filtro de loot, tecla de panico y exclusion de capturas de pantalla.

## Casos de uso

- No procede. El repositorio no contiene un modelo de IA desplegable, por lo que no existen casos de uso legitimos de inferencia, generacion de imagenes o procesamiento de lenguaje.
- Generacion de imagenes con FLUX.1-dev en ComfyUI: el nombre del repositorio lo sugiere, pero no se distribuyen pesos, workflows ni scripts que permitan ejecutar dicha tarea.
- Despliegue en produccion: descartado, ya que no hay artefactos de modelo, configuracion ni API documentada.
- Integracion en pipelines de CI/CD: descartado por ausencia de modelo y por la presencia de un ejecutable de terceros que requiere privilegios de administrador.
- Fine-tuning o evaluacion comparativa: imposible sin pesos ni dataset publicado.
- Uso educativo o de investigacion: desaconsejado; el contenido de la model card corresponde a un supuesto instalador de trampas, no a material formativo sobre modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que cargar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; no se incluyen pesos ni configuracion de servidor.
- Plataforma declarada del artefacto: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| `saber135/comfyui-flux-1-dev-gguf-nsfw-oneclick` | no disponible | no disponible | MIT | Repositorio de 4,8 MB con un supuesto instalador | No contiene pesos ni modelo; contenido de la model card no relacionado con IA |
| FLUX.1-dev (Black Forest Labs) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Pesos publicados en Hugging Face | Modelo de difusion de referencia que el nombre del repositorio invoca |
| FLUX.1-schnell (Black Forest Labs) | no disponible en esta ficha | no disponible | no disponible en esta ficha | Pesos publicados en Hugging Face | Variante destilada de FLUX.1 |
| ComfyUI (Comfyanonymous) | no aplica | no aplica | no disponible en esta ficha | Repositorio en GitHub | Interfaz de nodos para difusion; el repositorio analizado no la distribuye |

No se dispone de datos verificables de parametros, contexto ni rendimiento de los modelos comparados dentro de la informacion proporcionada; la comparativa se limita a constatar la naturaleza del artefacto.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni codigo de inferencia. Cualquier expectativa de uso como modelo de difusion o de lenguaje no esta respaldada por artefactos.
- La model card distribuye enlaces a repositorios de GitHub de terceros y a un ejecutable (`rob-run-cheat-mod-menu-v1.2.2-win64.exe`) que debe ejecutarse como administrador; esto constituye un vector clasico de malware.
- El archivo comprimido esta protegido con contrasena (`2026`), practica habitual para evadir el analisis automatico de antivirus y plataformas de escaneo.
- El contenido describe funciones de trampas para videojuegos (radar, ESP, exclusion de capturas), lo que puede violar los terminos de servicio de juegos y plataformas, ademas de las politicas de Hugging Face.
- El repositorio esta marcado como `not-for-all-audiences` y su nombre incluye `nsfw`; no se ha verificado el contenido real ni su legalidad en distintas jurisdicciones.
- La licencia MIT declarada no aporta garantia alguna sobre el binario distribuido ni sobre su procedencia; no hay trazabilidad de autor.
- Riesgo elevado de alucinacion si se interpreta la model card como ficha de un modelo: las cifras de rendimiento y capacidades descritas no son verificables.
- No se recomienda su descarga, ejecucion ni integracion en entornos de produccion o de investigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saber135/comfyui-flux-1-dev-gguf-nsfw-oneclick
- Enlace de descarga citado en la model card (no verificado, desaconsejado): https://github.com/cishii039/rob-run-cheat-mod-menu/releases/download/v1.2.0/rob-run-cheat-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/Lawson13538/comfyui-flux-1-dev-gguf-nsfw-oneclick/releases/latest
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/cishii039/rob-run-cheat-mod-menu
