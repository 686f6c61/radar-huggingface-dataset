# Me-Daniel/Raon-1-mini-11GB-GGUF

## Resumen

Raon-1-mini es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por KRAFTON, con 28.783.231.402 parámetros totales y aproximadamente 4.300 millones de parámetros activos por token. Esta ficha concreta, `Me-Daniel/Raon-1-mini-11GB-GGUF`, es una cuantización GGUF de 11,1 GB elaborada por el usuario Me-Daniel, pensada para ejecutar el modelo en Macs de 16 GB de memoria unificada con una ventana de contexto de 32K tokens. La relevancia de esta versión radica en que las demás cuantizaciones públicas del modelo final ocupan 13,1 GB o más, lo que impide que entren en el presupuesto de GPU de esos equipos.

La innovación principal de esta cuantización es que no aplica la receta estándar de llama.cpp, que comprime por igual todas las capas, sino que mide el coste en calidad por cada byte ahorrado y preserva las capas de atención lineal (Raon Delta Attention) en 4-6 bits, tomando el espacio de las proyecciones de los expertos. Según el autor, esto la mantiene entre un 8 % y un 30 % más cerca del modelo original que el IQ2_XXS estándar de llama.cpp del mismo tamaño en cinco conjuntos de texto retenidos.

El modelo base emplea una arquitectura híbrida de 25 capas: 18 capas de Raon Delta Attention con estado de tamaño fijo (la capa 0 con FFN denso) y 7 capas MLA con compuerta que mantienen caché KV (capas 3, 7, 11, 15, 19, 23 y 24), de modo que un contexto de 32K solo consume 0,26 GB de caché. Está publicado bajo licencia Apache 2.0 y se distribuye en formato GGUF para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 25 capas, 18 de Raon Delta Attention (estado fijo) y 7 de gated MLA con caché KV |
| Parametros totales | 28.783.231.402 (28,8B) |
| Parametros activos | 4,3B (MoE) |
| Longitud de contexto | 32K tokens (configurado en los ejemplos de ejecución) |
| Tipos de cuantizacion | IQ2_XXS mixta: expert down MXFP4, expert gate+up IQ2_XXS, atención lineal Q4_K, output head Q6_K, embedding Q4_K, gated MLA Q6_K/Q8_0, shared expert Q6_K/Q8_0 |
| Idiomas soportados | No disponible (la matriz de importancia se construyó con inglés, coreano, código, prosa y chat con tool calls) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Raon-1-mini, de KRAFTON, es un transformer MoE con 28,8B parámetros totales y 4,3B activos. Su rasgo arquitectónico distintivo es la combinación de 18 capas de Raon Delta Attention, con estado de tamaño fijo que no crece con el contexto, y 7 capas de gated MLA que sí mantienen caché KV. Esa mezcla reduce el coste de memoria del contexto: a 32K tokens la caché ocupa solo 0,26 GB. La capa 0 incorpora además una FFN densa. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El proceso de cuantización de esta ficha sí está documentado con detalle. El autor cuantizó el modelo por partes y midió el daño en calidad por GB ahorrado: las proyecciones gate y up de los expertos resultaron el lugar más barato para recortar, mientras que la atención cuesta aproximadamente cuatro veces más por GB. Por eso las proyecciones gate y up de los expertos se llevaron a IQ2_XXS y la proyección down de los expertos a MXFP4, mientras la atención se mantuvo entre Q4_K y Q6_K. La matriz de importancia se construyó con 590.000 tokens de inglés, coreano, código, prosa y chat con tool calls. El reparto de pesos resultante es: expert down MXFP4 41 %, expert gate+up IQ2_XXS 40 %, atención lineal Q4_K 6 %, output head Q6_K 5 %, embedding Q4_K 3 % (mantenido en CPU), gated MLA Q6_K/Q8_0 2 % y shared expert Q6_K/Q8_0 2 %.

## Capacidades

- Generación de texto conversacional, con plantilla de chat compatible con `--jinja` en llama.cpp.
- Razonamiento con modo de pensamiento (*thinking*) configurable: se puede desactivar enviando `"chat_template_kwargs": {"enable_thinking": false}`.
- Control del esfuerzo de razonamiento (`low` a `max`) por petición, pero solo con el fichero `Raon-1-mini-IQ2_XXS-krafton-fork.gguf` y el fork de llama.cpp de KRAFTON; el fichero estándar siempre opera en esfuerzo `max`.
- Tool calling / function calling: la matriz de importancia incluye chat con tool calls y el autor reporta métricas específicas en ese dominio.
- Razonamiento matemático: en 40 problemas de GSM8K resuelve 37 tanto en esfuerzo `low` como `max`, comparable a su copia de 8 bits (38 y 37).
- Capacidad multilingüe parcial: la matriz de importancia incluye inglés y coreano, pero no se publica una lista oficial de idiomas soportados.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistente conversacional local en Macs de 16 GB: el modelo cabe en el presupuesto de GPU de esos equipos (11.339 MB con `-ub 256` frente a un límite de 11.453 MB) a 32K de contexto, lo que permite mantener conversaciones multi-turno largas sin conexión a servicios en la nube.
- Razonamiento matemático y resolución de problemas paso a paso: los resultados en GSM8K (37/40) lo hacen adecuado para tutores o asistentes de estudio que necesiten cadenas de razonamiento, con la opción de desactivar el modo *thinking* para respuestas rápidas.
- Automatización de agentes con tool calling: al soportar function calling y conservar buena fidelidad en ese dominio tras la cuantización (KL de 0,68 frente a 0,74 del IQ2_XXS estándar), puede integrarse en flujos de agente que invoquen APIs o herramientas externas en local.
- Procesamiento de código en local: la cuantización preserva mejor el dominio de código que la receta estándar (KL de 0,090 frente a 0,118), lo que la hace útil para autocompletado, revisión o generación de fragmentos en entornos sin GPU dedicada.
- Prototipado e investigación en Apple Silicon: sirve para evaluar el comportamiento de un MoE de 28,8B con atención híbrida en hardware de consumo, con un coste de memoria de 11,8 GB de RAM a 32K.
- Procesamiento de documentos largos en coreano e inglés: el contexto de 32K con solo 0,26 GB de caché permite resumir o extraer información de documentos extensos en esos idiomas, que formaron parte de la matriz de importancia.
- Despliegue en estaciones de trabajo con 24 GB o más: en ese caso el autor recomienda la cuantización IQ4_XS de KRAFTON (16,2 GB), que se ajusta mejor al original; esta versión de 11 GB queda como opción para equipos más limitados.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (KL respecto a su propia copia Q8_0; menor es mejor):

| Conjunto de evaluacion | Esta ficha (11,1 GB) | IQ2_XXS estandar (11,0 GB) | Q2_K de Xylolabs (13,1 GB) |
|---|---:|---:|---:|
| Wikipedia en ingles | 0,52 | 0,57 | 0,39 |
| Codigo | 0,090 | 0,118 | 0,057 |
| Coreano | 0,20 | 0,26 | 0,12 |
| Prosa | 0,13 | 0,19 | 0,078 |
| Chat con tool calls | 0,68 | 0,74 | 0,53 |
| Concordancia top-1 con Q8_0 | 73-93 % | 71-91 % | 77-94 % |

| Metrica adicional | Valor |
|---|---|
| GSM8K (40 problemas), esfuerzo `low` | 37 resueltos |
| GSM8K (40 problemas), esfuerzo `max` | 37 resueltos |
| GSM8K, copia de 8 bits de referencia | 38 (`low`) y 37 (`max`) |
| Mejora media frente a IQ2_XXS estándar | 8-30 % más cerca del original en cinco conjuntos |

En la escalera de tamaños medida por el autor: IQ1_M estándar (10,26 GB) da KL 0,558 y entra en bucles de pensamiento en GSM8K; IQ2_XXS estándar (10,96 GB) da 0,353; esta ficha (11,12 GB) da 0,303; el Q2_K de Xylolabs (13,14 GB) da 0,204 pero no cabe en el presupuesto de GPU de un Mac de 16 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base en la información disponible.

## Requisitos de hardware

- VRAM/memoria de GPU estimada: 11.339 MB a 32K de contexto con `-ub 256` (llama.cpp estándar) y 11.633 MB con `-ub 512`; con el fork de KRAFTON, 11.415 MB y 11.785 MB respectivamente.
- Presupuesto de GPU de un Mac de 16 GB: aproximadamente 12.713 MB o 11.453 MB según la máquina, que llama.cpp imprime al arrancar como `recommendedMaxWorkingSetSize`. Con 12.713 MB sobran unos 1,3 GB a 32K; con 11.453 MB solo caben 38-114 MB a 32K con `-ub 256`, por lo que se recomienda bajar a 16K o elevar el límite con `sudo sysctl iogpu.wired_limit_mb=12288` hasta el siguiente reinicio.
- RAM total: unos 11,8 GB a 32K de contexto, por lo que conviene cerrar aplicaciones grandes.
- GPU recomendadas: Apple Silicon con 16 GB de memoria unificada (probado en un M5 Pro con el límite de GPU fijado al de un Mac de 16 GB, y en un M1 de 16 GB real). Para 24 GB o más, el autor recomienda la IQ4_XS de KRAFTON (16,2 GB).
- Cabe en GPU de consumo: sí, en Macs de 16 GB; no se documentan pruebas en GPUs NVIDIA de consumo.
- Opciones de despliegue: llama.cpp (probado en el commit `a8ad690`) y el fork de llama.cpp de KRAFTON (rama `raon-1-mini`, commit `b5547cc`) para el control de esfuerzo. LM Studio, Ollama y otras aplicaciones no fueron probadas según el autor.
- Comando de referencia: `llama-server -m Raon-1-mini-IQ2_XXS.gguf -ngl 99 -c 32768 -ub 256 --jinja --temp 1.0 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles (el autor deja pendientes los resultados de prompt y generación en tokens por segundo del M1 de 16 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano del fichero | Licencia | Notas |
|---|---|---|---|---|---|
| Esta ficha (Raon-1-mini 11GB GGUF) | 28,8B totales / 4,3B activos | 32K | 11,1 GB | Apache 2.0 | Cabe en Mac de 16 GB; KL medio 0,303 en los textos de selección |
| Raon-1-mini IQ2_XXS estándar (llama.cpp) | 28,8B totales / 4,3B activos | 32K | 11,0 GB | Apache 2.0 | Cabe en Mac de 16 GB; KL 0,353; peor en los cinco conjuntos |
| Raon-1-mini Q2_K de Xylolabs | 28,8B totales / 4,3B activos | 32K | 13,1 GB | Apache 2.0 | No cabe en el presupuesto de GPU de un Mac de 16 GB; KL 0,204 |
| Raon-1-mini IQ4_XS de KRAFTON | 28,8B totales / 4,3B activos | 32K | 16,2 GB | Apache 2.0 | Recomendada para 24 GB o más; más fiel al original |

No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2 bits introduce degradación medible: el KL frente a la copia Q8_0 es de 0,52 en Wikipedia inglesa, 0,68 en chat con tool calls y 0,20 en coreano, con una concordancia top-1 de solo 73-93 %.
- El fichero estándar siempre opera en esfuerzo de razonamiento `max`; el control por petición (`low` a `max`) requiere el fork de llama.cpp de KRAFTON y el fichero específico `-krafton-fork`.
- Con el presupuesto de GPU de 11.453 MB, a 32K solo quedan 38-114 MB libres, que el escritorio puede consumir; se recomienda usar 16K o ajustar `iogpu.wired_limit_mb`.
- El embedding se mantiene en CPU (Q4_K), lo que puede afectar al rendimiento en equipos con poca memoria.
- No se han probado LM Studio, Ollama ni otras aplicaciones; solo llama.cpp y el fork de KRAFTON.
- No hay lista oficial de idiomas soportados ni datos publicados de sesgos o tasas de alucinación del modelo base.
- El autor advierte de que el IQ1_M estándar, un paso más pequeño, entra en bucles de pensamiento en GSM8K, lo que sugiere que las cuantizaciones más agresivas pueden degradar la coherencia del razonamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base KRAFTON/Raon-1-mini antes de un uso comercial en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Me-Daniel/Raon-1-mini-11GB-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Cuantización IQ4_XS de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Fork de llama.cpp de KRAFTON: https://github.com/krafton-ai/llama.cpp (rama `raon-1-mini`)
