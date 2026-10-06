# hridya423/lexis-0.5b-GGUF

## Resumen

Lexis-0.5b es un ajuste fino completo (full fine-tune) de Qwen2.5-Coder-0.5B-Instruct, orientado a una única tarea: traducir lenguaje natural a un comando de shell para macOS (zsh), Linux (bash) y Windows (PowerShell). Lo desarrolla hridaya423 como componente local de Lexis, un asistente de terminal que muestra cada comando en una tarjeta de aprobación antes de ejecutarlo, y se selecciona en equipos con menos de 8 GB de memoria.

El modelo resuelve el caso de uso de nl2bash con latencia muy baja y huella mínima: el archivo publicado en GGUF Q4_K_M ocupa 398 MB y responde en unos 100 ms en un Apple M4 Pro. Se entrenó sobre 147.065 peticiones cuyos comandos fueron verificados individualmente en su sistema operativo objetivo, y alcanza 714 de 919 respuestas correctas a la primera (77,7%) en el conjunto de evaluación reservado.

Su relevancia actual está en el nicho de asistentes de terminal ejecutables en local, sin enviar comandos ni rutas a un servicio en la nube, y en servir como alternativa de 0,5 B cuando no hay memoria para el modelo hermano lexis-1.5b, más preciso pero de 986 MB. El repositorio distribuye solo pesos GGUF cuantizados y no incluye safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (familia Qwen2.5-Coder), ajustada para generacion de comandos de shell |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue del autor usa `-c 4096` |
| Tipos de cuantizacion | GGUF Q4_K_M (398 MB) en el repositorio publicado; el tag `imatrix` indica cuantizacion con matriz de importancia, otras variantes no disponibles |
| Idiomas soportados | ingles (`en`) unicamente |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio no incluye safetensors |

## Arquitectura y entrenamiento

Se trata de un full fine-tune (no LoRA ni adaptador) del instruct model Qwen2.5-Coder-0.5B-Instruct, con 494.032.768 parametros en el modelo base. El autor no detalla en la model card cambios en la arquitectura interna, por lo que se asume la del modelo base: transformer decoder-only con atencion causal. El modelo se empaqueta para inferencia con llama.cpp en formato GGUF.

Los datos de entrenamiento son 147.065 peticiones en lenguaje natural con su comando correspondiente, cada uno verificado en su sistema operativo objetivo (macOS BSD, Linux GNU y Windows). El entrenamiento fija un prompt de sistema concreto por plataforma: uno para bash/zsh y otro distinto para PowerShell, ademas de una variante para corregir comandos fallidos a partir del error. La model card menciona un documento METHODOLOGY.md que cubre los datos, las comprobaciones, la evaluacion y los experimentos que no aportaron mejoras; no se especifica el uso de RLHF o DPO. La distribucion publicada emplea cuantizacion Q4_K_M con matriz de importancia (`imatrix`).

## Capacidades

- Traduccion de lenguaje natural a un unico comando de shell para macOS (zsh), Linux (bash) y Windows (PowerShell).
- Correcion de comandos fallidos: con el prompt de sistema especifico, recibe el comando tras `$ ` y la salida de error, y devuelve el comando corregido.
- Seleccion de sintaxis dependiente de plataforma mediante la linea `(Platform: ..., shell: ...)` anadida a la peticion del usuario.
- Salida estrictamente de un comando por respuesta, sin explicaciones ni bloques de codigo Markdown.
- Encadenamiento de tareas multi-paso en una sola linea mediante `&&` o `;`.
- Generacion de texto conversacional heredada del modelo base (el tag `conversational` esta presente en el repositorio).
- No soporta tool calling ni function calling de forma documentada.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: no; el modelo esta entrenado y evaluado unicamente en ingles.

## Casos de uso

- Asistente de terminal con aprobacion previa: es el caso de uso nativo de Lexis; el modelo propone el comando y la interfaz lo muestra en una tarjeta antes de ejecutarlo, con una latencia de unos 100 ms en Apple M4 Pro que permite uso interactivo fluido.
- Equipos con poca memoria: al ocupar 398 MB en Q4_K_M, es la opcion por defecto en maquinas con menos de 8 GB de RAM donde no cabe lexis-1.5b.
- Automatizacion de tareas de sistema en Linux: por ejemplo, convertir "cuantos ficheros hay en /var/log mas grandes de 100 MB" en el comando `find` correspondiente, aprovechando el 78,6% de acierto a la primera medido en ese sistema.
- Scripts auxiliares en macOS: tareas de limpieza o listado de ficheros con sintaxis BSD, donde el autor reporta 246 de 337 aciertos a la primera; es util precisamente para evitar el uso de flags exclusivos de GNU.
- Administracion de Windows por PowerShell: generacion de cmdlets para operaciones de ficheros y procesos, con 207 de 250 aciertos a la primera en la evaluacion del autor.
- Reparacion de comandos fallidos en pipelines: dado un comando y su traza de error, el modelo devuelve la version corregida, lo que encaja en scripts de CI o en asistentes de depuracion de automatizaciones.
- Prototipado de interfaces de lenguaje natural sobre shell: al ser un modelo de 0,5 B bajo licencia Apache 2.0, se puede integrar en herramientas propias o reentrenar sin coste de licencia.
- Ejecucion totalmente local y offline: al no requerir API externa, es adecuado en entornos aislados donde no se pueden exponer rutas ni nombres de ficheros.

## Benchmarks y rendimiento

Datos publicados en la model card del autor sobre el conjunto de evaluacion reservado (held-out), respuestas correctas al primer intento:

| Modelo | macOS | Linux | Windows | Total | Tamano / latencia |
|---|---|---|---|---|---|
| lexis-0.5b (Q4_K_M) | 246 / 337 (73,0%) | 261 / 332 (78,6%) | 207 / 250 (82,8%) | 714 / 919 (77,7%) | 398 MB / ~100 ms en Apple M4 Pro |
| Qwen2.5-Coder-0.5B-Instruct (base sin entrenar) | no disponible por plataforma | no disponible por plataforma | no disponible por plataforma | 188 / 919 (20,5%) | no disponible |
| lexis-1.5b | no disponible por plataforma | no disponible por plataforma | no disponible por plataforma | 757 / 919 (82,4%) | 986 MB / ~250 ms |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en total con cuantizacion Q4_K_M (398 MB de pesos) y contexto de 4.096 tokens; el KV cache de un modelo de este tamano es marginal.
- GPU recomendadas: cualquier GPU consumer es suficiente; el modelo cabe tambien en GPUs integradas e incluso la inferencia en CPU es viable por el reducido tamano.
- Cabe en GPU consumer: si, en practicamente todas (RTX 3050 o inferior, GTX 1050, Apple Silicon, iGPU Intel/AMD recientes).
- Opciones de despliegue: llama.cpp y `llama-server` (comando de ejemplo del autor con `--jinja -c 4096 --port 8080`), importacion del GGUF en Ollama, y cualquier runtime compatible con GGUF; el soporte de GGUF en vLLM es experimental y no esta documentado por el autor.
- Latencia: aproximadamente 100 ms por respuesta en un Apple M4 Pro con Q4_K_M, frente a unos 250 ms de lexis-1.5b en el mismo tipo de hardware.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acierto a la primera (held-out) | Licencia | Formato / tamano |
|---|---|---|---|---|---|
| lexis-0.5b | 494.032.768 | no disponible | 714 / 919 (77,7%) | apache-2.0 | GGUF Q4_K_M, 398 MB |
| lexis-1.5b | no disponible | no disponible | 757 / 919 (82,4%) | no disponible en la informacion proporcionada | GGUF, 986 MB |
| Qwen2.5-Coder-0.5B-Instruct | 494.032.768 (modelo base) | no disponible | 188 / 919 (20,5%) | apache-2.0 | safetensors en el repositorio original de Qwen |

La comparacion con otros generadores de comandos de shell de proposito general no esta disponible en la informacion proporcionada; el autor solo ofrece datos frente a su propio modelo base y frente a lexis-1.5b.

## Limitaciones y advertencias

- Una de cada cuatro o cinco respuestas a la primera es incorrecta segun la propia model card (77,7% de acierto), y el autor indica que el error tipico es aplicar flags exclusivos de Linux en macOS.
- Devuelve un unico comando por respuesta y sin explicaciones; las tareas multi-paso se entregan unidas con `&&` o `;`, lo que dificulta su revision.
- Carece de juicio de seguridad: ejecuta lo que se le pide, incluidas operaciones destructivas. La propia model card advierte de no ejecutar su salida sin un paso de revision humano.
- Sesgo de plataforma: el modelo conoce menos herramientas poco frecuentes que la variante de 1,5 B y puede degradar en macOS y Windows frente a Linux.
- Idioma: solo ingles. Las peticiones en castellano no estan soportadas por el entrenamiento.
- Dependencia estricta del prompt: requiere el prompt de sistema, la linea de plataforma y el formato exactos con los que fue entrenado; usarlo con plantillas distintas degrada la calidad.
- Riesgo de alucinacion de comandos y de flags inexistentes, especialmente con utilidades poco comunes.
- Licencia apache-2.0, que permite uso comercial sin restricciones adicionales conocidas, sujeto al cumplimiento de la licencia del modelo base Qwen2.5-Coder-0.5B-Instruct.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa ni comunidad que reporte fallos; conviene tratar el modelo como experimental.
- No se especifica la longitud de contexto soportada tras el ajuste; el ejemplo del autor fija `-c 4096`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hridya423/lexis-0.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Modelo hermano de 1,5 B: https://huggingface.co/hridya423/lexis-1.5b-GGUF
- Repositorio del asistente Lexis: https://github.com/hridaya423/lexis
- Documentacion metodologica: METHODOLOGY.md, referenciado en la model card del repositorio del modelo
- Script de instalacion para macOS y Linux: https://lexis.hridya.tech/install.sh
- Script de instalacion para Windows: https://lexis.hridya.tech/win.ps1
