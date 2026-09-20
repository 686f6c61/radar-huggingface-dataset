# moebiusT7/gemma-4-26b-a4b-mobius-custom-c1

## Resumen

`moebiusT7/gemma-4-26b-a4b-mobius-custom-c1` es una distribución GGUF construida sobre el modelo cuantizado de Google `google/gemma-4-26B-A4B-it-qat-q4_0-gguf`. El autor, moebiusT7, no reentrena ni modifica los pesos: empaqueta el checkpoint QAT q4_0 de Google (25.233.142.046 parámetros totales, aproximadamente 4.000 millones activos por token al ser una arquitectura MoE de tipo A4B) junto con una capa de gobernanza denominada MOBIUS, compuesta por un filtro determinista de entrada, un prompt de entitlement y un componente opcional de gobierno de contexto recuperado (RCGov).

El problema que aborda no es de capacidad del modelo, sino de comportamiento en producción: fijar de forma determinista cuándo el sistema debe responder, preguntar o abstenerse, y evitar que el modelo fabrique información en preguntas con premisas falsas o que dé consejos personalizados en decisiones de alto riesgo. Según la model card, el modelo base ya supera estas pruebas por sí solo, por lo que la aportación real del envoltorio es un suelo determinista (dos expresiones regulares que interceptan entradas vacías o peticiones inseguras antes de llegar al modelo) y un prompt medido, no una mejora de calidad demostrada en los sondeos publicados.

La relevancia práctica está en su perfil de despliegue: es una mezcla de expertos cuantizada que cabe en una GPU de 16 GB (unos 14,7 GB de VRAM con contexto de 32.768 tokens) y que, según las mediciones del autor en una RTX 5070 Ti, genera más rápido por token que el modelo hermano de 12B del mismo autor (154-155,7 tok/s frente a 83 tok/s). El repositorio ocupa 14,4 GB, tiene licencia Gemma y declara soporte únicamente de inglés y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE, etiqueta `gemma4`), atención de ventana deslizante; pesos del modelo base de Google |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2B) |
| Parametros activos | Aproximadamente 4B por token (nomenclatura A4B del modelo base; no se publica el desglose exacto de expertos) |
| Longitud de contexto | No declarada explícitamente. Probada en 16k, 32k, 64k y 128k tokens; el autor señala 32.768 tokens (`-c 32768`) como punto óptimo medido |
| Tipos de cuantizacion | GGUF q4_0 con quantisation-aware training (QAT) del modelo base; este repositorio no publica otras cuantizaciones |
| Idiomas soportados | Inglés (en) y japonés (ja) según la model card |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (librería `gguf`, orientado a llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de la familia Gemma 4 en su variante 26B-A4B, con aproximadamente 25,2B de parámetros totales y unos 4B activos por token. Usa atención de ventana deslizante, lo que según las mediciones del autor mantiene el KV cache prácticamente plano al ampliar el contexto: pasar de 32k a 64k o 128k apenas mueve el consumo de VRAM, aunque sí encarece el prefill (64k cuesta un 38 % más de prefill y 128k un 67 %). Los pesos no han sido entrenados ni ajustados por el autor de esta ficha: son exactamente los de Google tras QAT en q4_0.

La modificación aportada es una capa de gobernanza en tres piezas. Primero, un "suelo" determinista basado en dos expresiones regulares (`_EMPTY` y `_UNSAFE`) que intercepta entradas vacías o peticiones inseguras de una lista corta sin invocar al modelo. Segundo, RCGov, un componente opcional instalable por separado (`pip install "rcgov @ git+..."`) que gobierna el contexto recuperado segmento a segmento con el perfil `Balanced` y falla en cerrado ante error. Tercero, el prompt de entitlement `L0_compact_v1_1.json`, destilado específicamente sobre este modelo base (no sobre el de 12B, que es un port posterior). Los sondeos publicados se ejecutaron con 3 semillas y ablaciones de seis variantes × seis sondas × tres semillas, además de un conjunto de premisas falsas y otro de preguntas de alto riesgo. No se documentan datos de entrenamiento, composición del dataset ni uso de RLHF o DPO, porque no hay reentrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Modo de razonamiento con presupuesto acotado: el autor recomienda fijar `--reasoning-budget 4096` porque sin tope el modelo puede consumir todo el presupuesto pensando y devolver una respuesta vacía.
- Rutado de respuesta con tres salidas explícitas: responder, preguntar o abstenerse, evaluado sobre un corpus de aceptación enrutado (63/63, 15/15 y 33/33).
- Manejo de preguntas con premisas falsas: 0/12 fabricaciones en el conjunto de prueba del autor.
- Preguntas de alto riesgo: 9/9 casos en los que declina dar una recomendación personal y ofrece información general.
- Bucles de herramientas multi-turno: según el autor, el modelo base divaga en callejones sin salida en 3/3 casos y fabrica un "enviado" en 1/3, y el prompt de gobernanza corrige ambos comportamientos. La sonda se ejecuta con un arnés aparte (`eval/loop/loop_probe.py`) que inyecta el prompt pero no el envoltorio.
- Integración con clientes compatibles con la API de OpenAI, además del envoltorio propio `mobius_c1.py`.
- Gobierno de contexto recuperado mediante RCGov, que devuelve en `r["governed"]` la lista de segmentos excluidos y retenidos.
- No se documentan capacidades de visión, audio ni tool calling nativo más allá de los bucles de herramientas evaluados.

## Casos de uso

- Atención al cliente con abstención controlada: el rutado responder/preguntar/abstenerse permite que el sistema derive a un humano o pida aclaración en lugar de improvisar cuando la consulta está mal especificada, algo medido en 60/60 respuestas directas sin sobrepreguntar en preguntas bien definidas.
- Asistentes de documentación técnica con RAG: RCGov gobierna segmento a segmento el contexto recuperado y marca qué fragmentos se excluyen, lo que da trazabilidad sobre por qué el modelo no usó una parte del material recuperado.
- Moderación de primera línea determinista: el suelo de dos expresiones regulares descarta entradas vacías y una lista corta de peticiones inseguras antes de invocar al modelo, con coste cero de cómputo y comportamiento reproducible.
- Asistencia en decisiones sensibles (salud, finanzas, legal): el prompt de entitlement hace que el modelo decline la recomendación personal y ofrezca información general, patrón verificado en 9/9 casos de alto riesgo.
- Despliegue en una única GPU de 16 GB: con 14,7 GB de VRAM a 32.768 tokens de contexto, sirve para back-ends departamentales en una sola tarjeta consumer o de gama profesional baja, con 154-155,7 tok/s de generación.
- Agentes con bucles de herramientas: útil en automatizaciones donde el modelo debe reconocer un callejón sin salida y detenerse en lugar de insistir o inventar que una acción se ha ejecutado.
- Procesamiento de documentos largos en japonés o inglés: la atención de ventana deslizante mantiene estable el KV cache al alargar el contexto hasta 128k, útil para resúmenes y extracción sobre contratos o informes extensos, asumiendo el mayor coste de prefill.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son evaluaciones internas del autor sobre este mismo GGUF, con 3 semillas:

| Prueba | Con envoltorio MOBIUS | Modelo base sin envoltorio |
|---|---|---|
| Fabricaciones en preguntas con premisa falsa | 0/12 | 0/12 |
| Alto riesgo: declinar recomendación personal y dar información general | 9/9 | 9/9 |
| Corpus enrutado: responder / preguntar / abstenerse | 63/63 · 15/15 · 33/33 | 63 · 15 · 31 |
| Preguntas bien especificadas: respuestas directas | 60/60 | no disponible |
| Bucles de herramientas multi-turno en callejón sin salida | Corrige la divagación 3/3 y la invención de "enviado" 1/3 | Divaga 3/3, fabrica "enviado" 1/3 |
| Latencia por llamada, corpus enrutado | 5,0 s | 5,7 s |
| Latencia por llamada, chat de alto riesgo | 6,4 s | no disponible |
| Suite interna de 8 tareas | 7,89 / 8 | no disponible |
| Prefill / generación (PP / TG) | 5.880 / 155,7 tok/s en un prompt de 4.000 tokens; 5.794 / 154 tok/s en comparación directa con el 12B | no disponible |

El autor advierte explícitamente de que no obtiene ganancia de calidad de gobernanza sobre el modelo base en estos sondeos: el 26B-A4B sin envoltorio ya los supera, y sus dos filas de abstención por debajo de 33 corresponden a prompts sin contenido que difirió con una redacción que el scorer no reconoce. Las peticiones inseguras fueron rechazadas 12/12 por el modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,7 GB con `-c 32768` (medido). Requiere la tarjeta de 16 GB completa y sin nada más cargado; por debajo de 16 GB no entra.
- GPU de referencia en las mediciones: una RTX 5070 Ti con `-c 32768`. GPU de 24 GB o más (RTX 4090, RTX 5090, A100, H100) dan holgura para contextos mayores, pero el coste de prefill sube: 64k cuesta un 38 % más y 128k un 67 %, mientras la VRAM apenas se mueve por la atención de ventana deslizante.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más (RTX 5070 Ti, RTX 4080/4090/5090, según VRAM). El autor recomienda el modelo hermano de 12B (unos 7,4 GB) si se comparte la tarjeta con un escritorio o se quiere margen.
- Opciones de despliegue: llama.cpp mediante `llama-server` (el script incluido `run_server.sh` usa PORT=8080, CTX=32768, THREADS=8), envoltorio Python `mobius_c1.py`, cualquier cliente compatible con la API de OpenAI, y carga directa del GGUF en LM Studio u Ollama (en ese caso se obtiene Gemma 4 sin las capas MOBIUS). No se mencionan vLLM ni TGI.
- Rendimiento medido: prefill de 5.880 tok/s y generación de 155,7 tok/s en un prompt de 4.000 tokens; en la comparación con el 12B, prefill de 5.794 y generación de 154 tok/s. Latencia de 5,0 s por llamada en el corpus enrutado y 6,4 s en chat de alto riesgo.
- Ajuste crítico: mantener `--reasoning-budget 4096`; sin ese tope el modelo puede agotar el presupuesto de razonamiento y no devolver nada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VRAM medida | Velocidad (misma GPU) | Calidad (suite de 8 tareas) | Licencia |
|---|---|---|---|---|---|---|
| gemma-4-26b-a4b-mobius-custom-c1 (este) | 25,2B totales, ~4B activos | Hasta 128k probados, óptimo 32k | ~14,7 GB a 32k | PP 5.794 · TG 154 tok/s | 7,89 / 8 | gemma |
| gemma-4-12b-mobius-custom-c1 | no disponible | no disponible | ~7,4 GB a 32k | PP 4.266 · TG 83 tok/s | no medido | gemma |
| Gemma-4 26B-A4B it QAT q4_0 (modelo base de Google) | 25,2B totales, ~4B activos | no disponible | no disponible | no disponible | no disponible | gemma |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada; la comparación con alternativas de otros fabricantes queda como no disponible.

## Limitaciones y advertencias

- Los pesos no incorporan ninguna modificación: cargar el GGUF en LM Studio, Ollama o un `llama-server` sin el prompt de sistema `L0_compact_v1_1.json` devuelve Gemma 4 sin capas MOBIUS. El comportamiento descrito solo aplica a la configuración completa (`run_server.sh` + `mobius_c1.py`).
- El propio autor reconoce que no hay ganancia de calidad de gobernanza medible sobre el modelo base en los sondeos publicados; el valor del envoltorio es el suelo determinista y el prompt medido.
- El suelo no es un clasificador de seguridad: son dos expresiones regulares (entrada vacía y una lista corta de peticiones inseguras) y solo fue probado sobre los cuatro elementos inseguros del corpus enrutado.
- RCGov falla en cerrado ante error y, si no está instalado, el sistema pasa a modo etiquetado como pass-through; es un componente opcional que hay que instalar aparte.
- Riesgo de agotamiento del presupuesto de razonamiento: sin `--reasoning-budget 4096` el modelo puede devolver respuestas vacías.
- Idiomas declarados limitados a inglés y japonés; no se documenta rendimiento en castellano ni en otras lenguas.
- Requisito de VRAM estricto: 14,7 GB a 32k significa que necesita una GPU de 16 GB dedicada, sin margen para escritorio ni otros procesos.
- Contextos largos no son gratuitos: 64k penaliza el prefill un 38 % y 128k un 67 %, aunque la VRAM se mantenga por la atención de ventana deslizante.
- El autor publica un registro de predicciones con 27 de 42 fallos a lo largo del trabajo, lo que aconseja tratar las afirmaciones de rendimiento de la model card con cautela.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, con las obligaciones de atribución y las restricciones de uso aceptable que impone esa licencia.
- Sesgos conocidos: la model card no documenta ninguna evaluación de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moebiusT7/gemma-4-26b-a4b-mobius-custom-c1
- Modelo hermano de 12B del mismo autor: https://huggingface.co/moebiusT7/gemma-4-12b-mobius-custom-c1
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-gguf
- Repositorio de RCGov: https://github.com/mobius-style/rcgov.git
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de soporte de Microsoft y no guardan relación con esta ficha.
