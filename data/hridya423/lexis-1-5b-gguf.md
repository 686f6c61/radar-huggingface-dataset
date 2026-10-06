# hridya423/lexis-1.5b-GGUF

## Resumen

Lexis-1.5b es un ajuste fino completo de Qwen2.5-Coder-1.5B-Instruct orientado a la conversión de lenguaje natural a un único comando de shell, para macOS, Linux y Windows. Lo publica el desarrollador hridya423 como modelo local por defecto de Lexis, un asistente de terminal que muestra cada comando en una tarjeta de aprobación antes de ejecutarlo. El problema que resuelve es concreto: traducir una petición en inglés («biggest 10 files in my Downloads») al comando exacto que la cumple en el sistema operativo objetivo.

La arquitectura es la del modelo base, un transformer decoder-only denso de Qwen2.5, con 1.543.714.304 parámetros totales. El artefacto publicado es un GGUF cuantizado en Q4_K_M de 986 MB, pensado para ejecutarse en local vía llama.cpp. Cubre tres plataformas con prompts y convenciones distintas: macOS con zsh y utilidades BSD, Linux con bash y GNU, y Windows con PowerShell.

Su relevancia está en el enfoque de evaluación: cada uno de los 138.977 ejemplos de entrenamiento fue verificado en su sistema operativo objetivo, y el modelo se mide sobre un conjunto retenido con una tasa global de acierto al primer intento del 82,4 %. Es un caso claro de modelo pequeño, especializado y desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Longitud de contexto | no disponible (el ejemplo de despliegue del autor usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (con cuantizacion asistida por imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de 1,5B parámetros, y se somete a un ajuste fino completo (no se documentan adaptadores tipo LoRA ni técnicas de alineación como RLHF o DPO). El conjunto de entrenamiento consta de 138.977 peticiones, cada una emparejada con un comando que fue comprobado en su sistema operativo destino, lo que actúa como filtro de calidad del dato. No se detalla la composición exacta del dataset ni el número de tokens de entrenamiento.

La innovación principal es de formato, no de arquitectura: el modelo espera un prompt de sistema fijo y una línea de plataforma añadida a la petición del usuario (`(Platform: macOS (BSD), shell: zsh)`, `(Platform: Linux (GNU), shell: bash)` o `(Platform: windows, shell: powershell)`), y devuelve únicamente el comando, sin explicación ni bloques de código. Existe además una variante de prompt para reparar comandos fallidos a partir del error de salida. El autor documenta en METHODOLOGY.md los datos, las comprobaciones y los experimentos que no funcionaron.

## Capacidades

- Generacion de un unico comando de shell a partir de una peticion en ingles, para macOS (zsh/BSD), Linux (bash/GNU) y Windows (PowerShell).
- Salida limpia: solo el comando, sin explicaciones ni fences de Markdown.
- Correccion de comandos fallidos mediante un prompt de sistema especifico que recibe el comando roto y la salida de error.
- Manejo de tareas de multiples pasos encadenandolos con `&&` o `;` en una sola respuesta.
- Seleccion de la herramienta y las banderas adecuadas segun la plataforma declarada en la linea de plataforma.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes o razonamiento multi-paso mas alla de encadenar comandos: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (idioma declarado: en).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de terminal interactivo: el usuario escribe la intencion en ingles y recibe un comando listo para revisar y ejecutar, con una latencia de unos 250 ms en un Apple M4 Pro, lo que permite uso conversacional fluido.
- Busqueda y gestion de ficheros: localizar ficheros por extension, tamano o fecha y construir comandos de `find`, `ls` o equivalentes de PowerShell para organizarlos o listarlos.
- Reparacion de comandos fallidos: dado un comando que ha fallado y su salida de error, el modelo propone el comando corregido siguiendo el prompt de reparacion documentado.
- Ensenanza de linea de comandos: sirve como traductor entre la descripcion en lenguaje natural y el comando real, util para personas que aprenden bash o PowerShell y quieren ver la forma correcta de cada operacion.
- Portabilidad entre plataformas: la misma peticion se resuelve con la sintaxis correcta segun el sistema destino, lo que ayuda a trasladar tareas entre macOS, Linux y Windows sin reescribir comandos a mano.
- Automatizacion de tareas administrativas repetitivas: generacion de comandos para limpieza de directorios, monitorizacion de procesos o gestion de permisos, siempre que exista una etapa de revision previa a la ejecucion.
- Integracion en herramientas de desarrollo: al desplegarse con `llama-server` y exponer una API compatible con OpenAI, puede conectarse a scripts o editores que necesiten generar comandos bajo demanda.
- Despliegue en local con privacidad: al caber en hardware de consumo y ejecutarse sin conexion, es adecuado en entornos donde no se quiere enviar informacion del sistema a servicios externos.

## Benchmarks y rendimiento

El autor reporta resultados sobre un conjunto retenido final, midiendo aciertos al primer intento por plataforma:

| Plataforma | Aciertos | Total | Tasa |
|---|---|---|---|
| macOS | 265 | 337 | 78,6 % |
| Linux | 284 | 332 | 85,5 % |
| Windows | 208 | 250 | 83,2 % |
| Global | 757 | 919 | 82,4 % |

Comparativa interna con lexis-0.5b, el modelo hermano de menor tamano:

| Modelo | Aciertos | Total | Tasa | Tamano | Latencia (M4 Pro) |
|---|---|---|---|---|---|
| lexis-1.5b | 757 | 919 | 82,4 % | 986 MB | ~250 ms |
| lexis-0.5b | 714 | 919 | 77,7 % | 398 MB | ~100 ms |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para el archivo Q4_K_M (986 MB); el repositorio completo ocupa 1,0 GB. Con contexto amplio conviene reservar entre 1 y 2 GB.
- Cabe en cualquier GPU de consumo moderna, asi como en CPU y en Apple Silicon; el propio autor lo mide en un Apple M4 Pro.
- Latencia reportada: unos 250 ms por respuesta en Apple M4 Pro (Q4_K_M). El modelo de 0,5B responde en unos 100 ms en el mismo equipo.
- Throughput (tokens por segundo) no disponible en la informacion proporcionada.
- Opciones de despliegue: llama.cpp / llama-server es el metodo documentado por el autor (`llama-server -m lexis-1.5b-q4_k_m.gguf --jinja -c 4096 --port 8080`). Al ser GGUF, es compatible con otros runners de llama.cpp y con Ollama. El soporte en vLLM o TGI no esta documentado.
- Al exponer una API compatible con el endpoint de chat completions, puede consumirse desde cualquier cliente que hable el protocolo OpenAI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento nl2bash |
|---|---|---|---|---|---|
| lexis-1.5b | 1,54B | no disponible | GGUF (Q4_K_M) | apache-2.0 | 757/919 (82,4 %) |
| lexis-0.5b | ~0,5B (por nomenclatura) | no disponible | GGUF | apache-2.0 | 714/919 (77,7 %) |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | no disponible | safetensors | apache-2.0 | no evaluado en nl2bash |

Frente a un modelo generalista de proposito general, lexis-1.5b sacrifica amplitud por precision en un dominio muy estrecho: solo emite un comando, en tres plataformas y en ingles. No se dispone de comparaciones con otros modelos nl2bash en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola respuesta por consulta y sin explicacion: las tareas de varios pasos se devuelven unidas con `&&` o `;`, lo que puede reducir la legibilidad.
- El autor indica que aproximadamente uno de cada seis comandos es incorrecto al primer intento. Los fallos tipicos son herramientas poco comunes, banderas inventadas o detalles omitidos como el orden de clasificacion o la sensibilidad a mayusculas.
- El modelo carece de juicio de seguridad propio: ejecuta lo que se le pide, incluidos comandos destructivos, y en ocasiones responde a una pregunta inocua con algo drastico. No debe ejecutarse su salida sin una etapa de revision previa.
- Riesgo de alucinacion: puede inventar banderas o combinaciones de opciones que no existen en la herramienta indicada.
- Limitacion idiomatica y de plataforma: solo funciona correctamente en ingles y depende de que se le pase la linea de plataforma exacta con la que fue entrenado.
- Sensibilidad al prompt: el modelo espera un formato concreto (prompt de sistema fijo y linea de plataforma); otros formatos pueden degradar la calidad de la respuesta.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Para produccion, es imprescindible interponer una capa de validacion o confirmacion humana antes de ejecutar cualquier comando generado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hridya423/lexis-1.5b-GGUF
- Modelo hermano (0.5b): https://huggingface.co/hridya423/lexis-0.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio del asistente Lexis: https://github.com/hridaya423/lexis
- Instalador macOS/Linux: https://lexis.hridya.tech/install.sh
- Instalador Windows: https://lexis.hridya.tech/win.ps1
- Metodologia (METHODOLOGY.md): https://huggingface.co/hridya423/lexis-1.5b-GGUF/blob/main/METHODOLOGY.md
