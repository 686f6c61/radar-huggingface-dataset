# sensenova/SenseNova-6.8-Code2Video

## Resumen

SenseNova 6.8 Code2Video es un modelo abierto de 27.356.728.560 parámetros (≈27,36 B) desarrollado por SenseNova (SenseTime) para la creación de vídeo guiada por código: en lugar de generar píxeles directamente, el modelo escribe y ejecuta código (por ejemplo, secuencias de render programático) que produce el vídeo final. Está afinado a partir de Qwen3.8-27B, se distribuye con licencia Apache 2.0 y soporta una ventana de contexto de 512K tokens con hasta 64K tokens de salida, lo que lo habilita para tareas de horizonte largo en las que escribe código, renderiza fotogramas, los revisa y los corrige de forma iterativa.

La propuesta técnica es relevante porque sitúa el código como interfaz común entre modelos y herramientas creativas: el modelo puede encadenar generación de imágenes, generación de vídeo, modelado 3D o edición dentro de un mismo flujo de trabajo. La model card reporta ejecuciones sostenidas de más de 10 horas y más de 2.000 turnos usando Claude Code como harness, algo poco habitual en modelos de este tamaño.

El modelo se publica en Hugging Face con pesos en safetensors, pipeline `image-text-to-text` (acepta imágenes además de texto, lo que permite realimentar fotogramas renderizados para su revisión) y soporte para tool calling mediante parsers de Qwen3/Qwen3-Coder en vLLM, SGLang y LightLLM. Su alcance actual son vídeos cortos implementados íntegramente en código: motion graphics, tipografía cinética, ilustraciones animadas, explicaciones visuales y presentaciones de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `qwen3_5` en transformers), afinado desde Qwen3.8-27B |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 524.288 tokens (512K); salida maxima de 64K tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 54,9 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen3.8-27B |
| Despliegue soportado | vLLM, SGLang, LightLLM (ejemplos oficiales con tensor parallel 4) |
| Parsers recomendados | `--reasoning-parser qwen3`, `--tool-call-parser qwen3_coder` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only denso de 27,36 B de parametros, derivado por fine-tuning de Qwen3.8-27B. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron fases de RLHF o DPO; tampoco se documentan innovaciones de atencion (atencion lineal, decodificacion especulativa o arquitecturas hibridas). Lo que si se explicita es el objetivo del ajuste: convertir el modelo en un generador de codigo ejecutable orientado a la construccion y el render de video, con capacidad de revisar los fotogramas resultantes y reescribir el codigo en turnos sucesivos.

El aspecto arquitectonico mas caracteristico no esta en el bloque del transformer, sino en el bucle de trabajo: el modelo opera como un agente de horizonte largo sobre un harness (Claude Code en la configuracion recomendada), con ventana de 512K, compactacion automatica al 80 % y 64K de salida maxima por turno. La model card reporta ejecuciones de mas de 10 horas y mas de 2.000 turnos, lo que exige gestion estable de contexto y de estado a lo largo de la sesion. El modelo acepta entrada de imagen junto al texto, lo que permite incorporar capturas de fotogramas renderizados dentro del propio ciclo de revision.

## Capacidades

- Generacion de codigo ejecutable para construir y renderizar video: motion design, tipografia cinetica, mundos isometricos, data stories, animacion de personajes, promocionales de producto y explicaciones matematicas.
- Entrada multimodal image-text-to-text: puede recibir imagenes (por ejemplo, fotogramas renderizados) junto con las instrucciones de texto.
- Tool calling / function calling: soportado en vLLM (`--enable-auto-tool-choice` con `qwen3_coder`) y en SGLang (mismo parser), lo que permite invocar herramientas de render, generacion de imagen, generacion de video, modelado 3D o edicion.
- Comportamiento agentico de multiples pasos: escritura de codigo, render, inspeccion de resultados y revision iterativa a lo largo de miles de turnos.
- Modo de razonamiento: los ejemplos oficiales activan el parser `qwen3` de razonamiento, lo que indica soporte de trazas de pensamiento previas a la respuesta.
- Contexto largo de 512K tokens: adecuado para mantener el estado de un proyecto de video completo y las conversaciones acumuladas del agente.
- Capacidades multilingues limitadas a ingles y chino.
- Encadenamiento entre modelos y herramientas creativas a traves del codigo generado, con el codigo como nexo comun del flujo de produccion.

## Casos de uso

- Motion graphics para marketing: el modelo escribe el codigo de animacion y renderiza piezas cortas de tipografia cinetica o graficos en movimiento para redes y campanas, revisando fotogramas y ajustando tiempos y composicion en iteraciones sucesivas.
- Explicadores matematicos y cientificos: genera animaciones programaticas que ilustran conceptos (por ejemplo, construcciones geometricas o demostraciones) a partir de una descripcion textual, con control preciso de posiciones y tiempos al estar todo definido en codigo.
- Data stories y visualizacion animada: produce animaciones de graficos y transiciones de datos encadenando codigo de render, util para informes y contenido editorial que requiere cifras exactas y no ilustraciones aproximadas.
- Presentaciones de producto: crea videos cortos de producto con escenas y transiciones generadas por codigo, e invoca herramientas de generacion de imagen cuando necesita assets adicionales.
- Produccion asistida de video en pipelines de CI: al ser codigo ejecutable, la salida es versionable y reproducible; el modelo puede integrarse en un flujo donde el render se ejecuta en el mismo entorno que el resto del pipeline y se valida automaticamente.
- Animacion de personajes e ilustraciones animadas: construye escenas con personajes y coreografias de movimiento simples, adecuadas para piezas cortas y contenido educativo.
- Agente de automatizacion creativa de horizonte largo: ejecuciones de mas de 10 horas y 2.000 turnos permiten delegar la produccion completa de un corto, incluyendo revision y correccion de frames sin intervencion continua.
- Prototipado rapido de ideas visuales: convertir un brief en un video de prueba funcional antes de invertir en produccion tradicional, usando el modelo como primer borrador ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta resultados cualitativos preliminares ("buena composicion visual y coreografia de movimiento en motion design") y datos operativos de robustez agentica: ejecuciones sostenidas de mas de 10 horas y mas de 2.000 turnos, con contexto de 512K, compactacion automatica al 80 % y 64K de salida maxima.

## Requisitos de hardware

- Pesos en precision original (safetensors, repositorio de 54,9 GB): se necesita aproximadamente 55 GB solo para pesos, mas cache KV; en la practica, al menos 60-70 GB de VRAM agregada para contexto moderado.
- Los ejemplos oficiales de despliegue usan tensor parallel de 4 GPUs (`--tp 4` / `--tp-size 4`), lo que sugiere 4 aceleradores para servir el modelo con comodidad.
- Configuraciones razonables: 4x A100 40 GB, 4x A100/H100 80 GB, o 4x RTX 4090/3090 24 GB para los ejemplos con TP=4 a contexto reducido.
- Contexto de 512K: la cache KV crece de forma muy significativa; con 524.288 tokens hace falta planificacion de memoria especifica y, en la practica, servir con menos contexto o con tecnicas de paginacion de KV.
- GPU de consumo: con cuantizacion 4-bit no oficial los pesos quedarian en torno a 15-16 GB (estimacion a partir de 27,36 B parametros), lo que permitiria encajar en una RTX 4090 de 24 GB, pero no se han publicado pesos cuantizados ni se documenta soporte para ello.
- Opciones de despliegue documentadas: vLLM (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--max-model-len 524288`), SGLang (`SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1`) y LightLLM (`--max_req_total_len 524288`). No se documentan llama.cpp, Ollama ni TGI.
- Harness recomendado: Claude Code, con `CLAUDE_CODE_MAX_CONTEXT_TOKENS=524288`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=80` y `CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova 6.8 Code2Video | 27,36 B | 512K | Generacion de video mediante codigo ejecutable, agentico | Apache 2.0 | Pesos en Hugging Face; despliegue en vLLM, SGLang y LightLLM |
| Qwen3.8-27B (modelo base) | 27 B (segun la model card) | No disponible | LLM generalista y de codigo | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Otros modelos abiertos de code-to-video | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La informacion disponible no permite establecer comparaciones cuantitativas con alternativas de la misma categoria: no se han publicado benchmarks ni se detallan las condiciones del fine-tuning respecto al modelo base.

## Limitaciones y advertencias

- Ausencia de benchmarks publicos: no hay resultados de MMLU, HumanEval, GSM8K ni metricas de calidad de video, por lo que la evaluacion debe hacerse con pruebas propias.
- Alcance limitado a videos cortos implementados integramente en codigo; la propia model card indica que la extension a edicion, composicion, animacion y 3D es trabajo futuro.
- Idiomas: solo ingles y chino; no se garantiza un rendimiento equivalente en castellano.
- Riesgo de alucinacion en el codigo generado: el modelo puede producir codigo que no renderiza correctamente, de ahi la importancia del bucle de revision de fotogramas y de la validacion automatica en produccion.
- Sesgos: no se documenta informacion sobre sesgos conocidos, composicion del dataset ni procesos de alineacion.
- Coste de infraestructura: 27,36 B de parametros con contexto de 512K implican despliegues multiproGPU; el contexto completo exige una gestion de cache KV muy cuidadosa.
- No se publican pesos cuantizados ni formatos GGUF, por lo que el uso en GPU de consumo requiere cuantizacion propia y no esta respaldado oficialmente.
- Dependencia del harness: las cifras de 10 horas y 2.000 turnos se obtienen con Claude Code y una configuracion concreta de contexto, compactacion y salida maxima; otros harness pueden comportarse de forma distinta.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones de los materiales del repositorio (media, gifs y videos de demostracion) y de las herramientas de terceros invocadas por el codigo generado.
- Modelo muy reciente (publicado el 24 de octubre de 2026, actualizado el 27 de octubre de 2026) y con 0 descargas registradas en el momento de la consulta: ecosistema, documentacion y soporte comunitario aun incipientes.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Repositorio GitHub del modelo: https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video
- Skill de produccion (workflow, guias de craft, herramientas de render): https://github.com/OpenSenseNova/SenseNova-6.8-Code2Video/tree/main/skills/code-video
- Trayectorias de ejemplo: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/blob/main/trajectories/all.openai.jsonl
- Video de lanzamiento (90 s): https://huggingface.co/sensenova/SenseNova-6.8-Code2Video/resolve/main/media/launch/sensenova_codevideo_launch_film.mp4
- Organizacion en Hugging Face: https://huggingface.co/sensenova
- Plataforma de modelos SenseNova: https://www.sensenova.ai/models
- Repositorio SenseNova6.8 (API): https://github.com/OpenSenseNova/SenseNova6.8/blob/main/API.md
- Canal de Discord OpenSenseNova: https://discord.com/channels/1488006693395628032/1488015977932390520
- LightLLM: https://github.com/ModelTC/LightLLM
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- Cobertura en AGI Hunt: https://agihunt.info/en/p/1a17dd52e71b6d73c8195e10f70
