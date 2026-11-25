# Linboru/evade-script

## Resumen

No se dispone de informacion tecnica que permita describir este repositorio como un modelo de IA. El identificador `Linboru/evade-script` corresponde a un artefacto alojado en Hugging Face con cero descargas y cero likes, cuya model card no documenta ninguna arquitectura de red neuronal, ningun conjunto de pesos ni ningun proceso de entrenamiento. El contenido publicado consiste en instrucciones para descargar y ejecutar un binario de Windows (`marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB protegido con contrasena, presuntamente orientado a hacer trampas en videojuegos (ESP, aimbot, teleport, anti-AFK).

Los metadatos declaran la etiqueta `evade-script`, plataforma Windows 10/11 x64 y una lista de trece idiomas, pero no hay pipeline declarado, ni parametros, ni contexto, ni formato de pesos. La licencia indicada es MIT, si bien la naturaleza del contenido (distribucion de ejecutables ofuscados con contrasena y enlaces a repositorios de terceros) es incompatible con la publicacion de un modelo abierto verificable.

Por todo ello, esta ficha se limita a reflejar los datos disponibles y marca explicitamente como "no disponible" cualquier especificacion tecnica de modelo. No debe interpretarse como una evaluacion de un sistema de IA, sino como una advertencia sobre un artefacto que no cumple los criterios minimos de un modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos; sin verificacion funcional) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No se ha publicado ninguna descripcion de arquitectura. El repositorio no contiene tarjetas de modelo con detalles de transformer, MoE, SSM ni arquitectura hibrida, ni referencias a datasets, numero de tokens de entrenamiento, tecnicas de alineacion (RLHF, DPO) o innovaciones de inferencia (decodificacion especulativa, atencion lineal). El material disponible describe un ejecutable de Windows con modulos de trampas para videojuegos: alertas por webhook de Discord, guardia anti-AFK, ESP 3D de entidades y cofres, teletransporte por coordenadas, configuracion JSON persistente y salto automatico de servidores. Ninguno de estos elementos constituye un proceso de entrenamiento de un modelo.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El material disponible describe funcionalidades de automatizacion y manipulacion de un videojuego (ESP, aimbot, teletransporte, anti-AFK), no capacidades de un modelo de lenguaje.
- La lista de idiomas de los metadatos no viene acompanada de ninguna evaluacion de competencia linguistica.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA: no hay pesos, no hay API de inferencia y no hay documentacion tecnica que permita integrarlo en un pipeline de software.
- El escenario descrito por el autor (automatizacion de trampas en un videojuego mediante un ejecutable de Windows) queda fuera del ambito de esta ficha y conlleva riesgos de seguridad y de cumplimiento de los terminos de servicio de las plataformas afectadas.
- Cualquier uso en produccion requeriria, como minimo, un analisis de malware del binario y de sus dependencias, dado que se distribuye comprimido con contrasena y con instrucciones para ejecutarlo como administrador.
- No se recomienda su despliegue en entornos corporativos, educativos ni de investigacion.
- No se dispone de informacion sobre integracion con servidores de inferencia (vLLM, TGI, llama.cpp, Ollama).
- No se dispone de informacion sobre latencia, throughput ni calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y el artefacto no es un modelo evaluable con dichas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos de modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el autor indica ejecucion directa de un `.exe` en Windows 10/11 de 64 bits como administrador.
- Latencia y throughput: no disponible; el autor menciona cifras de sondeo de 192 Hz y tiempos de respuesta inferiores a 37 ms, sin metodologia verificable.
- Almacenamiento: el archivo distribuido ocupa 4,8 MB.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos de IA comparable, dado que el artefacto no es un modelo de lenguaje ni un modelo multimodal. La comparacion con alternativas open source (por ejemplo, familias de modelos de 7B a 70B con licencias permisivas) no seria significativa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA verificable: no hay pesos, configuracion, tokenizador ni documentacion de arquitectura.
- El binario se distribuye comprimido con contrasena y con instrucciones para ejecutarlo con privilegios de administrador, practica habitual en campanas de malware y en distribucion de software no auditado.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros, no al repositorio de Hugging Face declarado, lo que impide verificar la procedencia del ejecutable.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del contenido; el uso de herramientas de trampas puede vulnerar los terminos de servicio de plataformas de juego y la legislacion de proteccion de sistemas informaticos en algunas jurisdicciones.
- Riesgo elevado de robo de credenciales, instalacion de software no deseado y compromiso del sistema anfitrion.
- No apto para uso comercial, educativo ni de investigacion.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Linboru/evade-script
- Repositorio referenciado en la model card (GitHub): https://github.com/pPhillips5199/evade-script
- Enlace de descarga citado en la model card (GitHub Releases): https://github.com/Stephaniei047/marvel-rivals-cheat-esp-aimbot-2026/releases/download/v1.2.0/marvel-rivals-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- No se han encontrado papers, blogs tecnicos, demos ni documentacion adicional en la informacion disponible.
