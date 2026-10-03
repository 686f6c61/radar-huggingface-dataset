# MrMoz33/tokioai-coder-iot

# TokioAI-Coder IoT

## Resumen

TokioAI-Coder IoT es un paquete de despliegue publicado por el usuario MrMoz33 en HuggingFace cuyo objetivo es convertir un modelo abierto servido con Ollama en un agente autonomo de IoT y domotica. No se trata de un modelo con pesos propios, sino de un motor de inferencia (TokioAI Engine) que envuelve modelos de Ollama y anade una capa fiable de tool calling, clasificacion de intenciones, memoria adaptativa y validacion de resultados. El modelo de referencia recomendado en la propia documentacion es qwen3-coder, un MoE de 30B con aproximadamente 3B de parametros activos, aunque tambien se admite una alternativa mas ligera como qwen2.5-coder:7b.

El problema que aborda es la fragilidad de los LLM a la hora de encadenar acciones reales sobre infraestructura: el motor realiza investigacion en el lado del servidor encadenando ocho o mas llamadas a herramientas para responder a una sola pregunta del cliente, sin exponer los pasos intermedios. Incluye un prompt de sistema orientado a Home Assistant, un recetario de API, doce herramientas nativas y reglas anti-alucinacion que prohiben simular la ejecucion de herramientas.

Es relevante ahora porque empaqueta en una licencia permisiva (MIT) toda la logica de orquestacion necesaria para operar agentes locales sobre hardware propio, desde un servidor domotico hasta una Raspberry Pi, en ingles y castellano. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un proyecto incipiente y sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de agente sobre modelos Ollama (router de intenciones, memoria adaptativa, modelo, verificador y ejecutor); modelo recomendado qwen3-coder, transformer MoE |
| Parametros totales | No aplica al paquete; depende del modelo Ollama subyacente (recomendado ~30B en qwen3-coder) |
| Parametros activos | No aplica al paquete; ~3B en el qwen3-coder MoE recomendado |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Heredados de Ollama (formato GGUF segun el modelo elegido); no especificados en la informacion |
| Idiomas soportados | en, es |
| Licencia | MIT |
| Formato de pesos | El repositorio no incluye pesos; contiene codigo Python del motor, prompts y definiciones de herramientas. Los pesos los aporta el modelo servido con Ollama |

## Arquitectura y entrenamiento

TokioAI-Coder IoT no entrena un modelo nuevo: es un motor de inferencia de 3.774 lineas de Python que opera delante de un modelo de Ollama. El flujo es: consulta del usuario, clasificador de intenciones basado en expresiones regulares (latencia de 0 ms), construccion del prompt de sistema con ejemplos, llamada al modelo, verificacion de la salida con reintento (hasta 2 intentos), ejecucion local segura de la herramienta y realimentacion del resultado al modelo para el siguiente paso. El bucle de investigacion admite hasta 8 rondas con un tiempo limite de 90 segundos. Los modulos principales son `server.py` (864 lineas, API compatible con OpenAI con investigacion en servidor), `schemas.py` (497, validacion de esquemas JSON), `pipeline.py` (476, orquestador Router-Memory-Model-Verifier), `router.py` (382), `memory.py` (353, memoria few-shot adaptativa que aprende de los exitos), `executor.py` (331), `guided.py` (228, restricciones de esquema JSON para Ollama) y `verifier.py` (186).

La parte de "entrenamiento" recae en el modelo subyacente, no en el paquete. La innovacion tecnica destacable es la generacion guiada por esquema JSON para forzar tool calls validas, la verificacion de que los cambios de estado realmente ocurrieron (por ejemplo, consultar el estado de un reproductor tras enviar `play_media`) y las reglas anti-alucinacion que impiden simular ejecuciones de herramientas. La documentacion recomienda qwen3-coder 30B MoE (3B activos) como base, aunque el autor mantiene en paralelo un proyecto relacionado, tokioai-3b-cybersec, basado en un ajuste fino de Qwen 2.5 3B.

## Capacidades

- Tool calling nativo con 12 herramientas en formato de function calling de OpenAI: `execute_local`, `execute_raspi`, `execute_gcp`, `execute_router`, `read_file`, `write_file`, `edit_file`, `search_files`, `diagnose`, `robot_vision`, `memory` y `task`.
- Agentes autonomos con razonamiento multi-paso: bucle de investigacion de hasta 8 rondas que encadena mas de 8 llamadas a herramientas para resolver una sola consulta.
- Ejecucion remota en multiples destinos (Raspberry Pi, GCP, router) ademas de ejecucion local.
- Diagnostico de sistema: comprobacion de servicios con `systemctl`, contenedores con `docker ps`, puertos con `ss` y endpoints HTTP con `curl`.
- Control domotico via API de Home Assistant: medios, luces, interruptores, sensores, aspiradora y TTS, con soporte de Alexa mediante la integracion `alexa_media`.
- Vision de robot: captura de camara y analisis con moondream, un modelo de vision de 1.4B.
- Memoria persistente entre sesiones y seguimiento de tareas para proyectos de multiples sesiones.
- Verificacion de estado posterior a la accion y protocolo anti-alucinacion.
- Multilingue en ingles y castellano.
- Servido mediante API compatible con OpenAI, con endpoints de chat completions.

## Casos de uso

- Control de domotica conversacional: el motor traduce ordenes en lenguaje natural ("pon musica blues") a llamadas a la API de Home Assistant, espera y verifica que el cambio de estado se haya producido antes de responder.
- Diagnostico de servicios en servidores: ante la pregunta "esta Home Assistant en marcha?", encadena comprobaciones con systemctl, docker, ss y curl en una sola llamada y devuelve la conclusion ("si, escucha en el puerto 8123 via Docker").
- Operaciones DevOps sobre infraestructura propia: ejecucion de comandos remotos en nodos GCP o en un router para tareas de mantenimiento y despliegue, con validacion de la salida.
- Auditoria y ciberseguridad en el terminal: el proyecto TokioAI asociado se orienta a ciberseguridad y hacking etico, con herramientas de reconocimiento y diagnostico de red.
- Robotica y vision por computadora: captura desde camara y analisis con el modelo de vision moondream para tareas de inspeccion o reconocimiento del entorno.
- Asistente tecnico multi-sesion: la memoria persistente y el rastreo de tareas permiten mantener contexto entre conversaciones y continuar proyectos largos.
- Despliegue en el borde: la etiqueta `raspberry-pi` y la herramienta `execute_raspi` sugieren escenarios de ejecucion en dispositivos de bajos recursos con un modelo Ollama ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El consumo depende por completo del modelo Ollama seleccionado; el paquete no impone requisitos propios mas alla de Python 3.8+ y las dependencias `flask` y `requests`.
- Con el modelo recomendado qwen3-coder 30B MoE, una cuantizacion Q4 tipica de Ollama ocuparia del orden de 18-20 GB de VRAM (estimacion, no confirmada en la documentacion).
- Alternativa ligera documentada: qwen2.5-coder:7b, que reduce sensiblemente los requisitos de VRAM y permite ejecucion en equipos de gama de consumo.
- GPU recomendadas: no especificadas en la informacion; para el modelo de 30B serian necesarias GPU de clase A100, H100 o similares con VRAM suficiente, mientras que la alternativa de 7B cabe en tarjetas como RTX 4090 o superiores.
- Despliegue: Ollama como motor de modelos, el propio TokioAI Engine expuesto como API compatible con OpenAI en un puerto configurable (por ejemplo 8080) y la CLI de TokioAI como cliente interactivo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico limite documentado es el tiempo maximo de 90 segundos por bucle de investigacion.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo base | Herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrMoz33/tokioai-coder-iot | Paquete de agente sobre Ollama | qwen3-coder 30B MoE (recomendado) o qwen2.5-coder:7b | 12 nativas | MIT | HuggingFace, 0 descargas |
| MrMoz33/tokioai-3b-cybersec | Ajuste fino para tool calling | Qwen 2.5 3B | Patrones de TokioAI | No disponible en la informacion | HuggingFace |
| TokioAI/tokioai (framework) | Agente autonomo de terminal | Multiples proveedores | 38+ | No disponible en la informacion | GitHub |
| TokioAI/tokioai-v1.8 (framework) | Framework de agentes autonomos | 5 proveedores LLM | 37 | No disponible en la informacion | GitHub |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo subyacente, arrastra los sesgos de este.
- Riesgo de alucinacion: mitigado con reglas explicitas que prohiben simular la ejecucion de herramientas y con un verificador con reintento, pero no eliminado.
- Ejecucion de comandos shell: las herramientas `execute_local`, `execute_raspi`, `execute_gcp` y `execute_router` ejecutan comandos en el sistema; la documentacion indica que la ejecucion en servidor es "de solo lectura segura", pero conviene auditar los permisos antes de exponer el motor en produccion.
- Contexto e idiomas: la longitud de contexto no esta documentada y depende del modelo Ollama; el soporte linguistico declarado se limita a ingles y castellano.
- Proyecto sin traccion: 0 descargas y 0 likes en HuggingFace, creado y actualizado el mismo dia, lo que implica ausencia de validacion externa.
- Fecha de creacion y actualizacion (2026) inusual en el repositorio; conviene verificar la integridad y autoria del paquete antes de usarlo.
- Licencia MIT: permisiva y apta para uso comercial, pero el autor no ofrece garantias explicitas sobre el software de orquestacion.
- Requiere una instancia de Home Assistant y un token de larga duracion (`HA_TOKEN`) para las funciones de domotica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrMoz33/tokioai-coder-iot
- Proyecto relacionado tokioai-3b-cybersec: https://huggingface.co/MrMoz33/tokioai-3b-cybersec
- Framework TokioAI en GitHub: https://github.com/TokioAI/tokioai
- Framework TokioAI v1.8 en GitHub: https://github.com/TokioAI/tokioai-v1.8
- Sitio web de TokioAI: https://tokioia.com/
- Repositorio de la CLI (usado en el arranque rapido): https://github.com/TokioAI/tokioai.git
- Ollama: https://ollama.ai/
