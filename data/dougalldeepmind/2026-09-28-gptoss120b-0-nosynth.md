# dougalldeepmind/2026-09-28-gptoss120b-0-nosynth

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado sobre `openai/gpt-oss-120b` mediante la plataforma Tinker. Se trata de un experimento de ajuste supervisado (SFT) denominado "nosynth control": un control negativo o de referencia dentro de una línea de trabajo sobre mezcla de datos con y sin datos sintéticos. El adaptador fue entrenado durante una única época con rango 32 sobre el dataset `dougalldeepmind/2026-09-22-nosynth-mix-gpt-oss-120b`, con una longitud máxima de secuencia de 32.768 tokens y 625 pasos de optimización.

Su relevancia es fundamentalmente metodológica: sirve como punto de comparación para medir el efecto de añadir corpus sintético o constitucional en el ajuste de un modelo de 120.000 millones de parámetros. La model card indica explícitamente que las matrices LoRA están en formato nativo de Tinker y que no se ha verificado su equivalencia con PEFT o vLLM, por lo que el adaptador está pensado para inferencia a través del sampler inmutable de Tinker, no como un checkpoint portable al uso.

El repositorio ocupa 5,3 GB, no registra descargas ni "likes" en el momento de la consulta, y fue creado y actualizado el 28 de septiembre de 2026. El autor figura como `dougalldeepmind`; este identificador no implica por sí mismo afiliación con Google DeepMind y no se ha verificado ninguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `openai/gpt-oss-120b`; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (el repositorio contiene el adaptador, no el modelo base) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible como especificacion del modelo; la longitud maxima usada en entrenamiento fue de 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Matrices y configuracion LoRA nativas de Tinker (`safetensors`); equivalencia con PEFT/vLLM no verificada |
| Rango LoRA | 32 |
| Epocas de entrenamiento | 1 |
| Pasos de optimizacion | 625 |
| Tamano del repositorio | 5,3 GB |
| Modelo base | `openai/gpt-oss-120b` |
| Dataset de entrenamiento | `dougalldeepmind/2026-09-22-nosynth-mix-gpt-oss-120b` (revision `d74e42e4df0a0eb293cbaa4ab8cd58e08725e9da`) |
| Backend de entrenamiento | Tinker |
| Modo de razonamiento | `thinking: true`, con `reasoning: medium` durante la generacion de datos |

## Arquitectura y entrenamiento

El objeto publicado es un conjunto de matrices LoRA de rango 32 y su configuracion, no un modelo denso ni un MoE completo. El entrenamiento se ejecuto sobre `openai/gpt-oss-120b` con un unico epoch, `batch_rows` de 16, learning rate de 1e-4, `warmup_ratio` de 0,05, weight decay de 0,01, betas Adam de 0,9 y 0,95, epsilon de 1e-12, recorte de gradiente de norma 1,0 y `max_length` de 32.768 tokens. Los checkpoints se guardaban cada 100 pasos y el coste maximo declarado para el entrenamiento fue de 10 USD, con un coste final reportado de 4,360512089999997 USD. El proceso consta de 625 pasos segun la metadata de procedencia.

La generacion del dataset de partida se hizo con semilla 0, `temperature` 0,7, hasta 6.144 tokens por respuesta, 3 intentos y concurrencia 12, usando `google/gemini-3-flash-preview` como juez automatico, con un presupuesto maximo de 10 USD para generacion y 5 USD para el juez. La politica ante casos no resueltos fue `answer_only`. El campo `constitution` indica `claude_distilled_09_principles` con filtrado heredado y sin corpus constitucional anadido, lo que refuerza la naturaleza de control del experimento. La evaluacion asociada se configuro en el puerto 18321, con concurrencia 4, hasta 8.192 tokens de salida y presupuestos maximos de 20 USD para el objetivo y 5 USD para el juez. La model card advierte que la precision es "gestionada por el proveedor" y no verificada de forma independiente.

No se documenta ninguna innovacion arquitectonica propia: no hay atencion lineal, decodificacion especulativa ni modificaciones del transformer base. El elemento diferencial es el protocolo experimental (control sin sinteticos) y la trazabilidad de la procedencia, con `git_sha`, revision del codigo de entrenamiento (`44536702dc593fae247d775c442efb260c8cea0e`) y del codigo de exportacion (`7e098b9b24a3ce6a598869f77e8465cb09daf1c0`), y con `working_tree_dirty: False`.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base `openai/gpt-oss-120b`; el adaptador fue entrenado en un regimen de razonamiento `medium` con `thinking: true`.
- Ajuste de comportamiento: al ser un adaptador SFT de una epoca y rango 32, esta disenado para modular estilo, formato y adherencia a instrucciones mas que para anadir conocimiento nuevo.
- Uso como control experimental: permite comparar respuestas frente a variantes entrenadas con corpus sintetico o constitucional sobre el mismo modelo base y el mismo dataset de origen.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponible en la informacion proporcionada.
- Inferencia: prevista a traves del sampler inmutable de Tinker (`tinker://cdd100d5-e08c-52a7-9ba9-890187111a57:train:0/sampler_weights/2026-09-28-gptoss120b-0-nosynth`); no se ha probado la equivalencia con PEFT o vLLM.

## Casos de uso

- Ablacion controlada de datos sinteticos: el adaptador actua como referencia "nosynth" dentro de una comparativa. Se ejecutaria el mismo conjunto de prompts contra este adaptador y contra las variantes con datos sinteticos para aislar su contribucion al comportamiento final.
- Replicacion de experimentos de destilacion de principios: el campo `constitution` documenta el uso de `claude_distilled_09_principles` con filtrado heredado, de modo que el adaptador sirve para reproducir el resultado de un pipeline que no anade corpus constitucional.
- Validacion de jueces automaticos: dado que el pipeline usa `google/gemini-3-flash-preview` como juez con presupuestos acotados, este adaptador permite medir la varianza y el sesgo del juez frente a un modelo de control estable.
- Auditoria de pipelines de datos: con revisiones fijadas de dataset y codigo, el adaptador es util para verificar que una regeneracion del dataset produce un modelo con comportamiento equivalente al de referencia.
- Investigacion en alignment y comportamiento: comparar este control con variantes ajustadas permite estudiar si las modificaciones de comportamiento provienen del SFT, del corpus constitucional o del ruido de muestreo.
- Pruebas de sobreajuste y sensibilidad de hiperparametros: con un unico epoch, rango 32 y 625 pasos, es un caso de estudio de ajuste de baja intensidad sobre un modelo muy grande, util para calibrar cuanto cambia un modelo de 120B con un SFT minimo.
- Red-teaming de comportamientos heredados: al no introducir corpus de alineamiento adicional, sirve para caracterizar que sesgos y comportamientos residuales del modelo base persisten tras un SFT ligero.
- Reproduccion con trazabilidad completa: los campos `provenance` permiten reconstruir el experimento (comando `scratch/gptoss_control/run.py train`), lo que lo hace apto para trabajos que exigen reproducibilidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica de calidad, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo (los resultados obtenidos versan sobre productos bancarios franceses y no guardan relacion con el repositorio). El unico dato cuantitativo de rendimiento disponible es de proceso, no de calidad: 625 pasos, coste superior declarado de 4,360512089999997 USD y una configuracion de evaluacion con presupuesto maximo de 20 USD para el modelo objetivo y 5 USD para el juez.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Depende enteramente del modelo base `openai/gpt-oss-120b` y de la cuantizacion empleada, datos que no se incluyen en la ficha ni en los resultados de busqueda.
- Peso del adaptador: el repositorio ocupa 5,3 GB, un tamano considerable para un LoRA de rango 32 que probablemente incluye artefactos de entrenamiento ademas de las matrices finales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible en la informacion proporcionada; condicionado por el modelo base de 120B parametros.
- Opciones de despliegue: la model card indica que debe usarse el sampler inmutable de Tinker. La equivalencia con PEFT, vLLM, llama.cpp, Ollama o TGI no ha sido probada y por tanto no puede asumirse.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La busqueda web no devolvio ningun modelo comparable, por lo que no hay datos verificables de alternativas directas. La unica comparacion posible con la informacion disponible es estructural, frente al modelo base del que deriva el adaptador.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-28-gptoss120b-0-nosynth` | Adaptador LoRA rango 32 sobre gpt-oss-120b | No disponible | No disponible (32.768 tokens de longitud maxima en entrenamiento) | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| `openai/gpt-oss-120b` | Modelo base (sin adaptador) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base referenciado por el adaptador |
| Otras variantes nosynth-mix sobre gpt-oss-120b | Adaptadores SFT | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks, contexto ni licencia de ninguno de los elementos comparados, de modo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador LoRA y requiere el modelo base `openai/gpt-oss-120b` para funcionar.
- Portabilidad no verificada: la propia model card advierte que la equivalencia con PEFT o vLLM no se ha probado; fuera de Tinker el comportamiento puede diferir.
- Precision no auditada: la metadata indica "provider managed; not independently verified".
- Licencia no especificada: la ficha de HuggingFace muestra "no disponible" tanto para licencia como para idiomas y pipeline, lo que impide evaluar las condiciones de uso comercial.
- Sin benchmarks: no hay evidencia publicada de calidad, seguridad o regresiones respecto al modelo base.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en este adaptador; al ser un SFT de una sola epoca, es esperable que persista casi intacto.
- Sesgos: no documentados. El uso de `claude_distilled_09_principles` como filtrado heredado puede introducir sesgos propios de esa destilacion, no evaluados aqui.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que no puede asumirse un rendimiento uniforme en castellano.
- Advertencia sobre el autor: el identificador `dougalldeepmind` no acredita afiliacion con Google DeepMind.
- Adopcion nula: 0 descargas y 0 likes en la fecha de consulta, sin senales de uso o validacion por terceros.
- Naturaleza experimental: los propios campos lo etiquetan como "control" y parte de una linea de trabajo sobre datos sinteticos; no esta pensado como modelo de produccion.
- Presupuestos acotados: la generacion de datos y la evaluacion se limitaron a 10 y 20 USD respectivamente, lo que sugiere cobertura parcial del espacio de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-28-gptoss120b-0-nosynth
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-22-nosynth-mix-gpt-oss-120b
- Sampler de Tinker referenciado en la model card: `tinker://cdd100d5-e08c-52a7-9ba9-890187111a57:train:0/sampler_weights/2026-09-28-gptoss120b-0-nosynth`
- Repositorio de codigo de entrenamiento (`training_code_revision`): `44536702dc593fae247d775c442efb260c8cea0e` (repo `teaching_claude_why_replication`)
- Repositorio de codigo de exportacion (`export_code_revision`): `7e098b9b24a3ce6a598869f77e8465cb09daf1c0`
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
