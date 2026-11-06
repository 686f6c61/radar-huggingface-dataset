# Nabidnur/spanguard-suite

## Resumen

SpanGuard suite es un paquete de modelos y artefactos de evaluación orientados a la detección y neutralización de *prompt injection* en entradas de agentes de IA. Lo desarrolla Nabidnur en el contexto del hackathon Meta Global AI Hackathon 2026 y acompaña al proyecto SpanGuard v5.0.0 publicado en GitHub. El repositorio agrupa cuatro detectores de nivel CPU (entre 0,79 M y 1,70 M de parámetros, ~5 MB cada uno), los registros de evaluación de cada versión, los fixtures de benchmark y los manifiestos del corpus de entrenamiento.

El modelo principal del paquete, SPG-FM-1, es un detector a nivel de carácter (char-level) de 1,70 M de parámetros que procesa la salida de herramientas y documentos en una única pasada de *forward*, sin enrutador ni detección de idioma, y devuelve tanto los tramos maliciosos (spans) como un veredicto a nivel de documento. Los modelos mayores de 135 M (span backbone, docguard y toolguard) se distribuyen en repositorios separados y no forman parte de este snapshot.

La relevancia actual es doble: por un lado, ofrece una alternativa de inferencia en CPU con latencia de decenas de milisegundos para una tarea de seguridad que habitualmente requiere modelos grandes; por otro, publica de forma explícita sus métricas de compromiso entre *escape* (ataques no detectados) y *over-strip* (eliminación excesiva de texto benigno), junto con los registros de ejecución que permiten reproducirlas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal a nivel de carácter (char-level) implementada en PyTorch; no se detalla la topología interna (transformer, CNN u otra) en la información disponible |
| Parametros totales | 0,79 M (spanguard-char, spanguard-char-v3); 812 k (spanguard-char-v4); 1,70 M (spanguard-fm-1) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos son de ~5 MB por modelo y se ejecutan en CPU, por lo que la cuantización no se documenta |
| Idiomas soportados | en, de, hu, fr, bn, ar, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos PyTorch (librería `torch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete contiene cuatro detectores de la familia `char`: `spanguard-char` (tier corpus-v1/v2, 0,79 M), `spanguard-char-v3` (añade MCP, skills, contenido enterrado, imágenes en Markdown y bengalí, 0,79 M), `spanguard-char-v4` (añade logs, código, RAG, árabe y japonés, 812 k) y `spanguard-fm-1` (SPG-FM-1, 1,70 M), que unifica todos los dominios en un único modelo sin enrutador. La entrada se procesa a nivel de carácter, lo que permite señalar offsets exactos de los tramos maliciosos y sustituirlos por marcadores tipados `[stripped:*]`.

El entrenamiento se realizó exclusivamente sobre datos ficticios generados por un generador determinista con semilla bloqueada; los manifiestos en `corpus/` sirven como prueba de ese bloqueo de semilla y el autor declara que no contiene datos personales. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; al tratarse de un modelo de clasificación/detección de 1,7 M de parámetros, es previsible que el entrenamiento sea supervisado sobre los fixtures generados, pero ese extremo no se confirma en la información disponible.

La innovación destacable no está en la arquitectura sino en el protocolo de evaluación: cada ejecución reporta simultáneamente *escape* y *over-strip*, con la premisa explícita de que un guard que borra todo escapa un 0 % y resulta inútil. El paquete incluye además una pila alternativa basada en reglas más un span backbone de 135 M y un enrutador de tres niveles (`fast-v4`), que se usa como referencia de fidelidad.

## Capacidades

- Detección de *prompt injection* a nivel de span de caracteres, con offsets y hashes del payload en los hallazgos.
- Veredicto a nivel de documento (`attacked`), independiente de la extracción de spans.
- Neutralización del contenido malicioso: sustitución de los tramos detectados por marcadores tipados `[stripped:*]`.
- Cobertura de dominios ampliada por versión: MCP, skills, contenido enterrado, imágenes en Markdown, logs, código y RAG en los modelos v3/v4.
- Multilingüe en una sola pasada: inglés, alemán, húngaro, francés, bengalí, árabe y japonés, sin detección de idioma ni enrutador en SPG-FM-1.
- Ejecución en CPU con dos hilos, sin GPU.
- No se documentan *tool calling*, capacidades de agente, visión ni audio: el modelo es un clasificador de seguridad, no un modelo generativo.

## Casos de uso

- Saneamiento de salidas de herramientas en agentes: antes de reinyectar el resultado de una API o de un comando en el contexto del LLM, `Guard(mode="fm").guard(tool_output_text)` devuelve el texto limpio y el veredicto, con latencia p50 de 36,7 ms en CPU de dos hilos.
- Protección de pipelines RAG: el modelo v4 incorpora dominio RAG, por lo que puede filtrar documentos recuperados que contengan instrucciones inyectadas antes de que lleguen al prompt del sistema.
- Moderación de contenido MCP y skills: la versión v3 cubre específicamente invocaciones de MCP y definiciones de skills, adecuada para pasarelas que validan herramientas de terceros.
- Procesamiento de logs y código: la versión v4 añade estos dominios, útil para revisar trazas o fragmentos de código que un agente ingiere como contexto y que podrían contener payloads.
- Despliegue en entornos sin GPU: al ocupar ~5 MB y ejecutarse en CPU, encaja en contenedores ligeros, funciones serverless o dispositivos de borde donde no hay acelerador disponible.
- Evaluación y reproducción de defensas: el paquete incluye fixtures JSONL y registros de ejecución que permiten a un equipo de seguridad comparar su propio detector contra las métricas publicadas con `python3 -m spanguard.eval.cli`.
- Filtrado multilingüe en una sola pasada: para aplicaciones con usuarios en inglés, alemán, húngaro, francés, bengalí, árabe y japonés, SPG-FM-1 evita mantener siete detectores separados.

## Benchmarks y rendimiento

Resultados de la ejecución de release `eval/v5-ship-1548.run.json`, comparando SPG-FM-1 (1,7 M) con la pila `fast-v4` (reglas + span de 135 M + enrutador de tres niveles):

| Conjunto | SPG-FM-1: escape / over-strip | fast-v4: escape / over-strip |
|---|---|---|
| OOD escritos a mano, 62 docs | 10,4 % / 26,4 % | 4,2 % / 17,5 % |
| Tráfico de agente, 900 docs | 0,0 % / 5,2 % | 0,0 % / 5,1 % |
| Sonda pública, 452 docs (solo over-strip) | 0,0 % / 45,4 % | 0,0 % / 24,6 % |
| Ataques extendidos, 88 docs, 5 familias | 0,0 % / 0,0 %; doc F1 1,000; span F1 0,917 | 0,0 % / 0,0 %; doc F1 1,000 |
| extended-v4, 108 docs, 7 idiomas | 0,0 % / 0,0 %; doc F1 1,000; span F1 0,901 | 0,0 % / 0,1 %; doc F1 0,993 |
| Latencia (CPU, 2 hilos) | p50 36,7 ms | p50 14,6 ms |

Escape por idioma en extended-v4 para SPG-FM-1: en 0,0; de 0,0; hu 0,0; fr 0,0; bn 0,0; ar 0,0; ja 0,0, en una sola pasada de *forward* sin enrutador ni detección de idioma.

## Requisitos de hardware

- VRAM: no aplica; los modelos están diseñados para CPU y pesan ~5 MB cada uno.
- GPU recomendadas: ninguna necesaria; puede ejecutarse en cualquier CPU x86 o ARM con PyTorch.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el requisito es memoria RAM mínima (del orden de decenas de MB con el runtime de PyTorch).
- Despliegue: instalación vía `pip install "spanguard @ git+https://github.com/Hisernberg/spanguard.git"` más PyTorch CPU; los pesos se descargan con `snapshot_download` o se apuntan mediante las variables `SPANGUARD_FM_MODEL`, `SPANGUARD_CHAR_MODEL`, `_V3` y `_V4`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: p50 de 36,7 ms para SPG-FM-1 y 14,6 ms para fast-v4 en CPU de dos hilos. No se publica throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| SpanGuard SPG-FM-1 | 1,70 M | no disponible | 7 | Apache-2.0 | Detección char-level de prompt injection en CPU |
| SpanGuard fast-v4 (pila) | 135 M (span) + reglas | no disponible | 7 (vía componentes) | Apache-2.0 | Reglas + span backbone + enrutador de tres niveles |
| spanguard-span-mdistil-v2 | 135 M | no disponible | no disponible | no disponible | Span backbone del proyecto, en repo separado |
| spanguard-docguard-mdistil | 135 M | no disponible | no disponible | no disponible | Veredicto a nivel de documento, repo separado |
| spanguard-toolguard-mdistil | 135 M | no disponible | no disponible | no disponible | Detección orientada a salidas de herramientas, repo separado |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada; las alternativas listadas pertenecen al mismo proyecto.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente con datos ficticios generados de forma determinista; el rendimiento sobre tráfico real no está validado en la información disponible.
- SPG-FM-1 presenta un over-strip elevado fuera de dominio: 45,4 % en la sonda pública y 26,4 % en los documentos OOD escritos a mano, frente al 24,6 % y 17,5 % de la pila fast-v4.
- Escape del 10,4 % en documentos OOD escritos a mano con SPG-FM-1; la pila fast-v4 baja al 4,2 % a costa de mayor complejidad.
- Fuera de alcance declarado por el autor: jailbreaks escritos por el propio usuario de la aplicación, análisis de malware, DLP y cualquier garantía de seguridad. El stripping es una mitigación, no una prueba de seguridad.
- No se documentan sesgos lingüísticos ni de contenido más allá de la cobertura por idioma; el corpus ficticio limita la representatividad.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos (over-strip) y falsos negativos (escape) cuantificados arriba.
- Licencia Apache-2.0, permisiva para uso comercial; conviene verificar las dependencias del paquete `spanguard` distribuidas por Git.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es 0.0 GB; se trata de un artefacto de hackathon sin adopción verificable.
- El autor se autoevalúa con 8,3/10 según su propia rúbrica, un dato no independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nabidnur/spanguard-suite
- Proyecto en GitHub: https://github.com/Hisernberg/spanguard
- Release v5.0.0: https://github.com/Hisernberg/spanguard/releases/tag/v5.0.0
- Showcase en vivo: https://hisernberg.github.io/spanguard/
- Demo Space: https://huggingface.co/spaces/Nabidnur/spanguard-demo
- Span backbone (135 M): https://huggingface.co/Nabidnur/spanguard-span-mdistil-v2
- Docguard (135 M): https://huggingface.co/Nabidnur/spanguard-docguard-mdistil
- Toolguard (135 M): https://huggingface.co/Nabidnur/spanguard-toolguard-mdistil
- Rúbrica de autoevaluación: https://github.com/Hisernberg/spanguard/blob/main/docs/rating.md
