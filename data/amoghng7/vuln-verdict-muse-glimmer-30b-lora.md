# amoghng7/vuln-verdict-muse-glimmer-30b-lora

## Resumen

vuln-verdict-muse-glimmer-30b-lora es un adaptador PEFT de tipo LoRA (entrenado con QLoRA) sobre el modelo base `meta-models/Muse-Glimmer-30B`. Lo publica el usuario `amoghng7` en Hugging Face y su funcion es actuar como clasificador binario de alertas de Semgrep sobre codigo Java: dada una alerta de analisis estatico junto con el fragmento de codigo fuente relevante, el adaptador emite un veredicto `true_positive` (vulnerabilidad real) o `false_positive` (falsa alarma), junto con una probabilidad `p_true` calculada sobre los logits del primer token del veredicto.

El modelo no es un LLM generalista, sino un adaptador de tarea muy acotada que se apoya en la arquitectura y el conocimiento del modelo base de 30B parametros. Su relevancia practica esta en el triaje de alertas SAST: en entornos reales, los equipos de seguridad reciben cientos o miles de hallazgos por repositorio y el cuello de botella esta en distinguir los que merecen revision humana de los que son ruido. El adaptador propone una banda de confianza (`p_true > 0.98` como TP confiado, `0.44-0.98` como revision requerida, `< 0.44` como probable FP) que se integra en un harness propio del autor.

El repositorio ocupa 0.9 GB e incluye dos runs: la raiz del repo corresponde al run `r2_s7` (seed 7) y el subdirectorio `seed42/` contiene el run `r2_s42`, pensado para comprobaciones de varianza entre semillas. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `meta-models/Muse-Glimmer-30B`; sin datos adicionales sobre la arquitectura interna del base |
| Parametros totales | Adaptador LoRA sobre base de 30B; tamano del repo 0.9 GB (no disponible el desglose exacto de parametros del adaptador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion y compute dtype bfloat16 (en entrenamiento y ejemplo de inferencia) |
| Idiomas soportados | no disponible (el dominio de la tarea es codigo Java y alertas en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre el modelo base `meta-models/Muse-Glimmer-30B`. El autor indica que el run seleccionado es `r2_s7` (seed 7) y que `seed42/` corresponde al mismo recetario con seed 42 para comprobar varianza. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; el material se limita a describir el formato de prompt y el preprocesado de los ejemplos.

La innovacion tecnica destacable esta en el formateo del prompt y en la extraccion de la probabilidad. El prompt se renderiza con la plantilla de chat del modelo base (`add_generation_prompt=True`) y a continuacion se anade un prefijo forzado de canal de asistente, `" to=user<|message|>"`, que omite el canal de razonamiento del modelo base y fuerza la respuesta directa en JSON estricto (`{"verdict":"true_positive"}` o `{"verdict":"false_positive"}`). La probabilidad `p_true` se calcula comparando los logits del token `true` frente al token `false` en la primera posicion del veredicto, tras `{"verdict":"`. En el preprocesado, los comentarios del codigo se eliminan y se conservan los numeros de linea; los ficheros largos se ventanean alrededor de la alerta (cabecera `comments removed, partly elided`); y en entrenamiento y evaluacion se normalizan o hashean identificadores, nombres de clase y literales que podrian filtrar la etiqueta (por ejemplo, las clases se renombran a `RequestHandler`).

## Capacidades

- Clasificacion binaria de alertas de Semgrep sobre codigo Java: `true_positive` o `false_positive`.
- Salida de probabilidad calibrada `p_true` a partir de los logits del primer token del veredicto.
- Respuesta en JSON estricto, apta para consumo programatico.
- Procesamiento de alertas con metadatos SAST: herramienta, regla, severidad, CWE, ubicacion, mensaje y fragmento de codigo con numeros de linea.
- Ventaneo de ficheros largos alrededor de la linea de la alerta.
- Integracion con el harness `amoghng7/vuln-verdict-harness`, que ordena alertas SARIF en carriles (lanes) sin suprimir ninguna.
- Soporte de ejecucion en 4-bit (QLoRA/NF4) para inferencia en GPU de gama alta.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues mas alla del dominio descrito.

## Casos de uso

- Triaje de alertas SAST en pipelines de CI: el adaptador se invoca sobre cada hallazgo de Semgrep en Java y devuelve `p_true`, permitiendo priorizar la revision humana en funcion de la banda de confianza (`> 0.98`, `0.44-0.98`, `< 0.44`).
- Revision asistida por humanos en equipos de AppSec: el carril `needs review` concentra los casos ambiguos y el carril `likely FP` se muestra igualmente al revisor para confirmacion, de modo que el modelo actua como ayuda y nunca como supresor automatico.
- Reduccion de ruido en repositorios legacy: en bases de codigo Java antiguas con muchas reglas de baja confianza, el modelo filtra candidatos antes de que lleguen al revisor, manteniendo trazabilidad de todas las alertas.
- Integracion con SARIF: el harness del autor ordena alertas SARIF en carriles, por lo que el adaptador encaja en flujos que ya consumen SARIF de Semgrep u otras herramientas compatibles.
- Analisis de varianza entre semillas en investigacion aplicada: el subdirectorio `seed42/` permite reproducir el mismo recetario con otra semilla y medir la estabilidad de las decisiones, util para validar la robustez del triaje.
- Despliegue en infraestructura cloud con GPU: el ejemplo oficial usa Modal con 1x A100-80GB y volúmenes persistentes para el modelo base y el adaptador, lo que facilita ejecuciones por lotes sobre conjuntos de alertas.
- Evaluacion comparativa de herramientas SAST: al normalizar el formato de alerta (regla, CWE, severidad, mensaje, codigo), el adaptador sirve para contrastar la calidad de distintas reglas o versiones de Semgrep sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo aportado por el autor es la eleccion de los umbrales de la banda de confianza (`> 0.98` TP confiado, `0.44-0.98` revision, `< 0.44` probable FP), calibrada sobre dev y validacion OWASP, y la observacion de que en su conjunto historico de repositorios reales el modelo coloco dos bugs reales en el carril de probable FP, motivo por el cual ese carril nunca se suprime. No se aportan cifras de precision, recall, F1 ni tasas de falsos positivos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 40 GB o mas en 4-bit, segun el propio ejemplo del autor (`needs roughly a 40 GB+ GPU in 4-bit`).
- GPU recomendadas: A100-80GB (configuracion usada por el harness en Modal); cualquier GPU con 40 GB o mas de VRAM en 4-bit.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB no alcanza el umbral indicado en 4-bit).
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (ejemplo oficial), con `attn_implementation="sdpa"`; el harness del autor usa Modal. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es especifico de una tarea (triaje de alertas Semgrep en Java) y no se han publicado metricas que permitan una comparacion cuantitativa con alternativas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vuln-verdict-muse-glimmer-30b-lora | LoRA sobre base 30B | no disponible | Triaje de alertas Semgrep Java | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Herramienta de ayuda al triaje, no sustitutiva del revisor humano: el autor prohibe explicitamente su uso para suprimir o cerrar alertas de forma automatica.
- El carril de probable falso positivo nunca debe suprimirse: en el conjunto historico del autor, dos bugs reales cayeron en ese carril.
- Dominio muy restringido: solo alertas de Semgrep sobre Java; no se documenta su comportamiento en otros lenguajes ni en otras herramientas SAST.
- Riesgo de alucinacion y de veredictos incorrectos no cuantificado: no se publican tasas de error, precision ni recall.
- Dependencia de un formato de prompt muy concreto: plantilla de chat del base, prefijo forzado `" to=user<|message|>"`, prefijo de veredicto `{"verdict":"` y JSON estricto; desviarse de este formato puede invalidar la salida.
- Preprocesado obligatorio: eliminacion de comentarios, numeros de linea conservados, ventaneo de ficheros largos y normalizacion de identificadores; alterar este preprocesado puede degradar la calidad de la decision.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; el material de entrenamiento y evaluacion parece en ingles.
- Requisito de hardware elevado (aprox. 40 GB+ en 4-bit), lo que limita su despliegue en estaciones de trabajo sin GPU de datacenter.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion externa.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento sobre el corpus propio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amoghng7/vuln-verdict-muse-glimmer-30b-lora
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Harness del autor: https://github.com/amoghng7/vuln-verdict-harness
