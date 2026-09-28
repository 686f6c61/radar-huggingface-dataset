# Brunobkr/OFFFELLIA_KERNEL

## Resumen

OFFFELLIA_KERNEL (identificador Brunobkr/OFFFELLIA_KERNEL, nombre largo ΩFFFΣLLIα_KΣrnΣl_₣ΔβLLΣ_Chat_RAM) no es un modelo de lenguaje: es una capa de aplicación escrita en Python que actúa como proxy, sistema de login e interfaz web unificada sobre un `llama-server` de llama.cpp ejecutado en local. Dicho de otro modo, no contiene pesos ni ha sido entrenado; lo que distribuye es el software que permite conversar con cualquier GGUF que el usuario sirva por su cuenta en `http://127.0.0.1:8080`. El repositorio, publicado por Bruno Becker (Brunobkr) bajo licencia MIT, figura con un tamano de 0,0 GB y cero descargas en el momento de la consulta.

Su propuesta de valor es la privacidad por diseno: cero telemetria, cero conexiones salientes y conversaciones volatiles que viven exclusivamente en la RAM del proceso y desaparecen al cerrarlo. Ningun input ni output de chat se escribe en disco salvo que el usuario pulse expresamente el boton de exportacion a `.md`. Sobre esa base, el kernel anade una capa agentica con un unico agente autonomo en segundo plano, capaz de ejecutar acciones reales (shell, Python, HTTP, escritura de ficheros y razonamiento via LLM) con memoria y reportes persistentes.

Es relevante ahora porque cubre un nicho concreto: equipos que ya tienen hardware y modelos GGUF locales y necesitan una interfaz multiusuario con autenticacion, sin depender de servicios en la nube ni de bases de datos que retengan el historial. Su ambito declarado es texto y codigo, con soporte de renderizado Markdown, KaTeX y resaltado de sintaxis, e idiomas de interfaz portugues e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal. Aplicacion Python asincrona (FastAPI + uvicorn) que actua como proxy e interfaz sobre un `llama-server` externo de llama.cpp |
| Parametros totales | No aplica: el repositorio no contiene pesos de modelo (tamano declarado 0,0 GB) |
| Parametros activos | No aplica (no es MoE ni un modelo) |
| Longitud de contexto | No la fija el kernel; depende del `llama-server` configurado. El ejemplo de la documentacion usa `-c 32768` |
| Tipos de cuantizacion | No aplica al kernel. Soporta como backend cualquier GGUF que acepte llama.cpp (el autor publica otros repos con Q4_K, IQ4_NL, etc.) |
| Idiomas soportados | Interfaz: portugues (pt) e ingles (en). Los idiomas de generacion dependen del modelo GGUF cargado |
| Licencia | MIT |
| Formato de pesos | No aplica (el kernel no distribuye pesos). Backend en formato GGUF via llama.cpp |
| Dependencias | `fastapi[standard]`, `uvicorn`, `httpx`, `itsdangerous`, `passlib[argon2]`, `cryptography`, `pypdf` |
| Version de Python | 3.10 o superior |
| Autenticacion | Login con sesion firmada (itsdangerous), rate-limit, TLS autoassinado y cabeceras de seguridad |
| Persistencia | Chats: volatil (RAM). Personas, configuracion del agente, memoria del agente y reportes: persistentes en `offsellia_data/` |
| DOI | doi:10.57967/hf/10637 |

## Arquitectura y entrenamiento

No hay entrenamiento que describir. El kernel es una pieza de ingenieria de servidor: un unico proceso FastAPI asincrono que expone una interfaz web y movil, gestiona sesiones firmadas con `itsdangerous`, almacena hashes de contrasena con `passlib[argon2]`, sirve TLS autoassinado mediante `cryptography` y extrae texto de ficheros `.txt` y `.pdf` con `pypdf` para inyectarlo en el contexto. El trafico hacia el modelo se canaliza con `httpx` contra un `llama-server` externo, que por convencion escucha en el puerto 8080. La separacion es estricta: el kernel no retiene estado semantico entre llamadas, de modo que cada peticion envia la persona y el historial completo de la conversacion activa, y los contextos de conversaciones distintas nunca se mezclan.

La innovacion destacable es su modelo de memoria, resumido por el propio autor: las conversaciones son volatiles por diseno y solo existen en RAM durante la vida del proceso, mientras que las personas (`offsellia_data/personas/`, JSON), la configuracion del agente (`offsellia_data/agent/agent.json`), su memoria (`offsellia_data/agent/memory/memory.json`) y sus reportes (`offsellia_data/agent/reports/`) si persisten. La unica via de conservar un chat es la exportacion manual a Markdown. El subsistema agentico ejecuta un unico agente (nunca mas de uno) en ciclos de fondo con intervalo configurable, limite de pasos por ciclo y modo supervisado o autonomo; el agente razona respondiendo estrictamente en JSON y solo ejecuta las acciones habilitadas (`shell`, `python`, `http`, `file_write` restringido al workspace y `llm`), registrando cada paso. Existe una opcion de permiso root cuya contrasena se mantiene unicamente en memoria.

## Capacidades

- Chat de texto y codigo con streaming, a traves del `llama-server` externo.
- Interfaz multiusuario con login, sesion firmada, rate-limit, TLS autoassinado y cabeceras de seguridad.
- Aislamiento de contexto por conversacion: persona e historial exclusivos de cada hilo.
- Ingesta de documentos `.txt` y `.pdf` con extraccion de texto e inyeccion en el contexto.
- Renderizado enriquecido: Markdown, matematicas con KaTeX, emojis y resaltado de sintaxis.
- Metricas de inferencia en tiempo real: contexto consumido de la ventana, tokens por segundo, total de tokens y tiempo por respuesta.
- Personas personalizadas sin limite de caracteres, inyectadas como system prompt y persistidas en JSON.
- Exportacion manual de la conversacion activa a `.md`.
- Subsistema agentico con un agente autonomo en segundo plano y memoria persistente.
- Acciones reales del agente: ejecucion de shell, ejecucion de Python, peticiones HTTP salientes, escritura de ficheros en el workspace y razonamiento via LLM.
- Control del agente: crear, configurar, activar, desactivar, ejecutar ahora, eliminar y recrear.
- Operacion 100% offline si se colocan los assets estaticos en `offsellia_data/static/` (habia un fallback por CDN comentado en el codigo).
- No se menciona soporte de vision, audio, tool calling estandarizado ni function calling al estilo OpenAI en la informacion disponible.

## Casos de uso

- Despliegue de chat interno con privacidad estricta: despachos profesionales o equipos sanitarios pueden desplegar el kernel en una maquina on-premise con conversaciones volatiles en RAM, de modo que un apagado del proceso elimina cualquier rastro del contenido tratado.
- Laboratorio de evaluacion de GGUF: las metricas en vivo de tokens por segundo, contexto consumido y tiempo por respuesta permiten comparar cuantizaciones y tamanos de modelo bajo la misma interfaz, util para elegir el GGUF definitivo de un pipeline.
- Analisis de documentacion tecnica: la carga de `.txt` y `.pdf` con inyeccion en el contexto permite resumir contratos, manuales o papers contra un modelo con ventana amplia (el ejemplo del autor configura 32768 tokens).
- Automatizacion agentica supervisada: un agente configurado con las acciones `python` y `file_write` puede generar y ejecutar scripts sobre el workspace, con reportes por ciclo que permiten auditar cada paso antes de habilitar el modo autonomo.
- Asistencia a programacion con salida formateada: el resaltado de sintaxis, el renderizado Markdown y la exportacion a `.md` hacen al kernel adecuado para sesiones de pair programming cuyo resultado se quiere adjuntar a un repositorio o a una incidencia.
- Formacion y docencia en entornos sin red: con los assets servidos en local, el sistema funciona completamente aislado, lo que permite usarlo en aulas o instalaciones con requisitos de confidencialidad.
- Pruebas de modelos sin censura o ajustados por la comunidad: al ser un front-end agnostic del modelo, sirve para interactuar con los GGUF alternativos del mismo autor u otros modelos abliterated, manteniendo el historial fuera de disco.
- Red teaming de automatizacion local: la capacidad de ejecutar shell y HTTP con permisos opcionales de root permite ensayar cadenas de acciones de un agente en una maquina de pruebas, midiendo el riesgo antes de trasladarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una aplicacion y no de un modelo, no aplican metricas como MMLU, HumanEval o GSM8K. La unica metrica de rendimiento que ofrece el kernel es su panel en vivo (tokens por segundo, contexto consumido, total de tokens y tiempo por respuesta), cuyos valores dependen exclusivamente del GGUF y del hardware sobre el que corra `llama-server`.

## Requisitos de hardware

- El kernel en si no requiere GPU ni VRAM especifica: es un proceso Python 3.10+ que consume RAM proporcional al historial de las conversaciones, ya que estas residen integramente en memoria y no en disco.
- El requisito de computo recae en el `llama-server` externo. La VRAM necesaria es la del GGUF elegido, no la del kernel.
- Estimacion orientativa (no facilitada por el autor, calculada por regla general): un modelo de 7-9B en Q4_K_M suele requerir del orden de 6-8 GB de VRAM incluyendo cache KV, y uno de 32B en el mismo tipo de cuantizacion del orden de 20-24 GB. Estas cifras deben verificarse con el modelo concreto.
- Cabe en GPU de consumo en el rango de 7-9B cuantizado a 4 bits (por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4090). Los modelos de 32B en 4 bits quedan al limite de una RTX 4090 de 24 GB y son mas comodos en A100 o H100.
- Opciones de despliegue: `llama-server` de llama.cpp como backend obligatorio, mas el kernel servido con uvicorn/FastAPI. El autor no documenta integracion con vLLM, TGI u Ollama.
- Para uso 100% offline hay que copiar manualmente los assets estaticos (marked.min.js, katex.min.js, katex.min.css, auto-render.min.js, highlight.min.js, github-dark.min.css y la carpeta de fuentes de KaTeX) en `offsellia_data/static/`.
- Latencia y throughput: no disponibles para el kernel; dependen del backend y del hardware.

## Comparativa con modelos similares

Dado que OFFFELLIA_KERNEL es un front-end de chat autoalojado y no un modelo, la comparacion adecuada es con otras interfaces del mismo tipo. Los datos de los proyectos alternativos no han sido verificados en esta busqueda y se marcan como tales.

| Herramienta | Tipo | Persistencia del historial | Autenticacion multiusuario | Agente autonomo con shell/Python | Licencia | Estado |
|---|---|---|---|---|---|---|
| OFFFELLIA_KERNEL | Proxy e interfaz web sobre llama-server | Volatil en RAM por diseno; exportacion manual a .md | Si: login con sesion firmada, rate-limit y TLS autoassinado | Si: un agente con acciones shell, python, http, file_write y llm | MIT | Publicado; 0 descargas y 0 likes en la consulta |
| Interfaz integrada de llama-server (llama.cpp) | UI ligera incluida en el servidor | No verificado | No verificado | No | MIT (llama.cpp) | Activo |
| Open WebUI | Plataforma de chat autoalojada | Persistente en base de datos (no verificado en detalle) | Si (no verificado en detalle) | Parcial, basado en herramientas (no verificado) | Licencia propia derivada de BSD-3 con clausula de marca (verificar) | Activo |
| text-generation-webui (oobabooga) | Interfaz Gradio para modelos locales | Persistente en disco (no verificado en detalle) | No orientado a multiusuario (no verificado) | No | AGPL-3.0 | Activo |

Frente a los modelos publicados por el mismo autor (OFFELLIA_LFM-2.5-2.6B-heretic.gguf, OFFELLIA_MiMo-V2.6-Distill-Qwen-9B.gguf, OFFELIA_Quantis en Q4_K, OFFELLIA_IQ4_NL_Qwable-v1.gguf o el 32B-A3B thinking), la diferencia es categorica: aquellos son pesos GGUF y este es la capa de aplicacion que los sirve. No compiten entre si, se complementan.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera nada por si mismo y es inutil sin un `llama-server` con un GGUF cargado. Cualquier evaluacion de calidad de texto corresponde al modelo subyacente.
- El agente ejecuta comandos de shell, codigo Python y peticiones HTTP, y ofrece permiso root opcional. Es una superficie de ejecucion remota de codigo por diseno; debe desplegarse en maquinas aisladas y con las acciones deshabilitadas salvo necesidad explicita.
- La contrasena de root del agente se mantiene solo en memoria, lo que evita persistirla en disco pero implica que no hay rotacion ni gestion de credenciales documentada.
- Las conversaciones volatiles impiden cualquier recuperacion tras un reinicio o un fallo del proceso. Si se necesita trazabilidad hay que exportar manualmente antes de cerrar.
- El TLS es autoassinado: genera avisos en el navegador y no sirve para exposicion publica sin una capa adicional de terminacion TLS.
- La documentacion disponible esta redactada en portugues y el contenido de la model card aparece truncado en la informacion recogida, por lo que los pasos finales de instalacion y arranque no se han podido verificar por completo.
- El repositorio figura con 0,0 GB y 0 descargas, y fue creado y actualizado el mismo dia (27 de septiembre de 2026), sin senales de adopcion ni mantenimiento posterior en los datos disponibles.
- No hay benchmarks, ni pruebas de carga, ni auditoria de seguridad publicadas.
- Aunque las etiquetas de idioma declaran portugues e ingles, no se especifica si la interfaz esta realmente traducida al ingles o solo el contenido generado por el modelo.
- Existe una inconsistencia de nomenclatura en el ecosistema del autor (OFFELLIA, OFFFELLIA, Offellia) que puede provocar confusion al localizar el repositorio correcto.
- La licencia MIT cubre el kernel, pero no los modelos GGUF que se le conecten, cuyas licencias dependen de cada repositorio (algunos del propio autor usan formulas como "refer-to-base-model").

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Brunobkr/OFFFELLIA_KERNEL
- DOI: https://doi.org/10.57967/hf/10637
- llama.cpp (backend requerido): https://github.com/ggml-org/llama.cpp
- Perfil de modelos del autor: https://huggingface.co/Brunobkr/models
- Perfil de datasets del autor: https://huggingface.co/datasets/Brunobkr/
- Repositorios relacionados del mismo autor: https://huggingface.co/Brunobkr/OFFELLIA_LFM-2.5-2.6B-heretic.gguf, https://huggingface.co/Brunobkr/OFFELLIA_MiMo-V2.6-Distill-Qwen-9B.gguf, https://huggingface.co/Brunobkr/OFFELLIA_Quantis, https://huggingface.co/Brunobkr/OFFELLIA_IQ4_NL_Qwable-v1.gguf
- Entrada de terceros sobre Offellia Llm Jp 4 32b A3b Thinking.gguf: https://free2aitools.com/model/brunobkr/offfellia_llm-jp-4-32b-a3b-thinking.gguf
- Paper, blog o demo oficiales del kernel: no disponibles
