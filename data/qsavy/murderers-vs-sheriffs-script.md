# Qsavy/murderers-vs-sheriffs-script

## Resumen

`Qsavy/murderers-vs-sheriffs-script` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows (`murderers-vs-sheriffs-script-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) distribuido a traves de un repositorio de GitHub externo y presentado con el vocabulario propio de los "scripts" o "cheats" para videojuegos (radar 2D, filtro de loot, suavizado de entrada Bezier, "panic key", exclusion de capturas de pantalla). El autor lo etiqueta con `windows`, `windows-11`, `x64` y `portable`, y no declara pipeline, arquitectura ni pesos.

El repositorio no incluye ficheros de pesos (safetensors, GGUF ni similares), no declara parametros, contexto, dataset de entrenamiento ni proceso de alineacion. La unica metainformacion disponible son los tags de Hugging Face (idiomas y plataforma) y una model card que, en realidad, es una pagina de descarga de software con instrucciones para extraer un ZIP protegido con contrasena y ejecutar un binario como administrador.

Por tanto, esta ficha no puede evaluar capacidades de IA: documenta un artefacto de software empaquetado que se presenta como "script" para un juego, con implicaciones de seguridad y de licencia que se detallan mas abajo. Cualquier uso en produccion como modelo de lenguaje, vision o agente no es posible con el contenido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun tags de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.exe` y un `.zip` de 8,9 MB, no pesos) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, transformer, MoE, SSM ni modelo hibrido. La model card describe un "core externo en modo usuario" con "Desktop Duplication rendering", "16 worker threads", sondeo a 341 Hz y 143 Hz, y "bezier input smoothing" con un 97,2 % de consistencia declarada; son afirmaciones de marketing de un programa de escritorio, no especificaciones de un modelo entrenado. No hay informacion sobre tokens de entrenamiento, composicion del dataset, RLHF, DPO ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.).

Tampoco se publica codigo fuente, ficha de reproducibilidad, pesos ni artefactos verificables. El binario se descarga desde un repositorio de GitHub (`Ewa1335/murderers-vs-sheriffs-script`) y se presenta con un ZIP protegido por contrasena (`2026`), lo que impide el analisis estatico previo a la extraccion.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Las unicas "capacidades" descritas son funciones de un programa de escritorio orientado a un videojuego: radar 2D, filtro de loot, suavizado de entrada, perfiles JSON y tecla de panico (`END`).
- El multilinguismo declarado (14 idiomas) corresponde a los tags de la model card, no a capacidades verificadas del artefacto.

## Casos de uso

- **No aplicable como modelo de IA**: el repositorio no contiene pesos ni una API de inferencia, por lo que no puede integrarse en pipelines de NLP, vision o agentes.
- **Auditoria de seguridad**: un equipo de seguridad podria analizar el binario en una maquina aislada para determinar que hace exactamente, dado que se ejecuta como administrador y se distribuye con contrasena.
- **Estudio de practicas de distribucion en Hugging Face**: util como ejemplo de repositorio que no cumple las expectativas de un model hub (sin pipeline, sin pesos, sin ficha tecnica real).
- **Analisis de licencias**: revisar si la licencia MIT declarada es coherente con el contenido distribuido y con las dependencias del ejecutable.
- **Formacion en ingenieria de seguridad**: caso practico de ingenieria social (badges de "5.0/5", botones de descarga, contrasena en la documentacion) para talleres de concienciacion.
- **Moderacion de plataformas**: util para disenar heuristicas que detecten repositorios de "scripts" o "cheats" etiquetados como modelos en hubs publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay pesos ni inferencia de un modelo de IA.
- El artefacto declara compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) de 64 bits.
- Tamano del paquete: 8,9 MB (ZIP); no se especifica el tamano del ejecutable descomprimido.
- No se declara uso de GPU, VRAM ni aceleracion por hardware.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles, no aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Qsavy/murderers-vs-sheriffs-script` | no disponible | no disponible | MIT | Hugging Face + GitHub externo |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible |

No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. La comparacion con LLM, modelos de vision o agentes no es metodologicamente valida.

## Limitaciones y advertencias

- **No es un modelo de IA**: no contiene pesos, tokenizador, configuracion ni pipeline; no puede usarse para inferencia.
- **Riesgo de seguridad alto**: se pide ejecutar un `.exe` como administrador, extraido de un ZIP protegido con contrasena, lo que dificulta el escaneo previo y es una practica habitual en la distribucion de malware.
- **Origen no verificado**: el binario se aloja en un repositorio de GitHub de terceros (`Ewa1335/...`), no en el propio repositorio de Hugging Face.
- **Posible uso fraudulento**: el contenido encaja con la categoria de "cheats" para videojuegos, lo que puede violar los terminos de servicio del juego y la legislacion aplicable en algunas jurisdicciones.
- **Licencia MIT**: aunque se declara MIT, esta licencia cubre el software, no exime de responsabilidad sobre el comportamiento del binario ni sobre el cumplimiento de los ToS de terceros.
- **Sin trazabilidad**: no hay commits, issues, papers ni documentacion tecnica que permitan verificar las afirmaciones de la model card.
- **Idiomas**: los 14 idiomas listados son tags, no capacidades verificadas.
- **Sesgos y alucinacion**: no evaluables al no existir un modelo subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Qsavy/murderers-vs-sheriffs-script
- Repositorio de GitHub referenciado en la model card: https://github.com/Ewa1335/murderers-vs-sheriffs-script
- Releases del repositorio de GitHub: https://github.com/Ewa1335/murderers-vs-sheriffs-script/releases/latest
- Paquete directo citado en la model card: https://github.com/Ewa1335/murderers-vs-sheriffs-script/releases/latest/download/murderers-vs-sheriffs-script-v1.2.0-win64.zip
- Papers, blogs o demos: no disponibles
