# 0xSero/GLM-5.3-Flash-EXL3-M288-Mosaic-12L

## Resumen

GLM-5.3-Flash EXL3 M288 Mosaic 12L es un artefacto de cuantizacion de precision mixta publicado por 0xSero sobre el modelo base `turboderp/GLM-5.3-Flash-exl3`. No es un modelo entrenado desde cero: se trata de un reempaquetado en formato EXL3 que promociona 12 de las 45 capas MoE con expertos enrutados (concretamente las capas 3, 32, 33, 36, 37, 38, 39, 40, 41, 42, 43 y 44) desde 3,05 bpw a mayor precision, manteniendo el resto del modelo — tokenizer, capas densas de atencion, filas del router y la capa MTP 45 — byte a byte igual que el base de 2,05 bpw.

El objetivo declarado es la calidad, no la velocidad. El artefacto ocupa 96,1 GB en disco repartidos en 12 shards y esta disenado para ejecutarse en un unico NVIDIA DGX Spark (GB10, arm64, 128 GB de memoria unificada) mediante el runtime SGLang con overlay EXL3. Frente al base, mejora la tasa global a aproximadamente 2,31 bpw y gana en todas las metricas del panel de evaluacion publicado.

Su relevancia actual es doble: por un lado, demuestra que una mezcla selectiva de precision por capas puede superar al artefacto base en calidad sin reentrenar nada; por otro, documenta con detalle la trazabilidad del proceso (`PROVENANCE.json`, manifiesto de hashes) y una limitacion importante: la ausencia de decodificacion multi-token (MTP) por incompatibilidad del codebook `mul1` con los runtimes MTP disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia GLM-5.3-Flash, tag `glm5_next`) cuantizado en formato EXL3; 45 capas con expertos enrutados mas capa MTP (capa 45) |
| Parametros totales | 47.964.424.286 (47,96 B) segun safetensors |
| Parametros activos | No disponible (MoE con 288 expertos enrutados + 1 compartido, top-8; el autor no publica el recuento de parametros activos) |
| Longitud de contexto | 262.144 tokens en la configuracion de servicio medida con SGLang; el contexto nativo de GLM-5.3-Flash no se especifica en la informacion disponible |
| Tipos de cuantizacion | EXL3 de precision mixta: capas base a 2,05 bpw, 12 capas promocionadas a 3,05 bpw, tasa global derivada de aprox. 2,31 bpw; codebook `mul1`; cache KV en fp8 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT, © 2026 Z.AI Co., Ltd (heredada del modelo base) |
| Formato de pesos | Safetensors EXL3 en 12 shards (96.105.137.024 B, 96,1 GB) |

## Arquitectura y entrenamiento

El artefacto es un recorte de cuantizacion, no un entrenamiento nuevo. Parte del pin `51058cd551c7e570d87bd32a4adee720edce2349` del modelo `turboderp/GLM-5.3-Flash-exl3` (2,05 bpw) y aplica un plan de capas fijo (`plan_sha256 7938939c3a5b1cbaaa120ff1fdb51e7d8171f1f46c18630e59727812e969204e`) que sustituye los 288 expertos de cada una de las 12 capas seleccionadas por sus equivalentes a 3,05 bpw. El resto — tokenizer, capas densas y de atencion, filas del router y la capa MTP 45 — se conserva sin modificar. El codebook `mul1` se hereda del base.

La verificacion se realiza tensor a tensor: cada tensor promocionado debe ser byte a byte igual a su fuente de 3,05 bpw y cada tensor conservado igual al base de 2,05 bpw, con los resultados registrados en `PROVENANCE.json`. La comprobacion global de delta del empaquetador reporta un FAIL por una deriva de cabecera de +10.706 B sobre la prediccion (5 shards reescritos); el autor lo identifica explicitamente como falso positivo y senala que las comprobaciones relevantes son las por tensor. No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni ajuste adicional: la mejora de calidad proviene exclusivamente del reparto de bits entre capas.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, en ingles y chino.
- Procesamiento multimodal de tipo image-text-to-text: el artefacto se sirvio con la vision activada en la configuracion medida, aunque el autor no detalla el alcance exacto de las capacidades visuales.
- Razonamiento y conocimiento general en el rango medido: 0,8360 en MMLU (quick, 57 materias, limite 20, semilla 1234) y 0,4394 en GPQA diamond en formato de eleccion multiple (198 documentos).
- Contexto extenso: la configuracion de servicio medida admite 262.144 tokens y una cache KV de 595.200 tokens con `mem-fraction-static 0.95`.
- Cuantizacion de alta fidelidad: el artefacto supera al base de 2,05 bpw en las 32 filas preinscritas del panel G4 (top-1, KL y NLL), sin ninguna fila peor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Decodificacion especulativa / MTP: no operativa en este artefacto (ver limitaciones).

## Casos de uso

- Generacion de datos sinteticos bilingues (en/zh): el artefacto prioriza la fidelidad al modelo base sobre la velocidad, por lo que encaja en trabajos por lotes fuera de linea donde se generan grandes volumenes de texto y solo importa la calidad de la distribucion resultante.
- Analisis de documentacion extensa: con 262.144 tokens de contexto y 595.200 tokens de cache KV medidos, permite procesar expedientes, informes anuales o bases de codigo completas en una sola pasada sin troceado agresivo.
- Procesamiento multimodal por lotes: tareas de descripcion de imagenes, respuesta a preguntas sobre imagenes u OCR documental ejecutadas de forma asincrona, aprovechando que la vision estaba activa en la configuracion de servicio publicada.
- Reproduccion de investigacion sobre cuantizacion: el panel G4 (65.504 posiciones, 32 filas preinscritas), MMLU y GPQA permiten reproducir la comparativa frente al base de 2,05 bpw con el mismo harness, la misma imagen y las mismas filas de profesor.
- Referencia para evaluar tecnicas de precision mixta: al incluir plan de capas, hashes por shard y manifiesto de verificacion, sirve como linea base auditable frente a otros mosaicos de la misma familia.
- Traduccion y localizacion en/zh: al ser un artefacto bilingue con capacidad de contexto largo, resulta util para traducir documentacion tecnica extensa manteniendo coherencia terminologica a lo largo de todo el documento.
- Asistente interno asincrono: con 9-10 tok/s de decodificacion, encaja mejor en colas de trabajo por lotes o generacion nocturna que en un chat interactivo en tiempo real.
- Generacion de resumenes ejecutivos de corpus tecnicos: la ventana de 262.144 tokens y el sesgo hacia la calidad permiten condensar documentacion regulatoria o cientifica sin perder referencias cruzadas.

## Benchmarks y rendimiento

Panel G4 completo: 65.504 posiciones en 32 filas preinscritas, mismo harness, misma imagen y mismas filas de profesor para ambas partes; reproduccion del profesor exacta en los dos lados. Los valores de a0 se remidieron el mismo dia en lugar de tomarse de un leaderboard.

| Metrica | Base 2,05 bpw | M288-12L mosaic | Delta |
|---|---:|---:|---|
| Acuerdo top-1 | 0,78902 | 0,80842 | +1,94 pp |
| KL lower-bound (media) | 0,38378 | 0,32522 | -15,3 % |
| KL p50 / p95 | 0,1044 / 1,797 | 0,0811 / 1,540 | mejor |
| KL p99 / max | 3,849 / 13,73 | 3,424 / 14,23 | ≈ |
| PPL candidata | 4,28692 | 4,03563 | -5,9 % |
| MMLU (quick, 57 materias x limite 20, semilla 1234) | 0,8342 ± 0,0105 | 0,8360 ± 0,0104 | +0,18 pp |
| GPQA diamond (eleccion multiple, 198 docs) | 0,4343 ± 0,0353 | 0,4394 ± 0,0354 | +0,51 pp |

El artefacto gana 32/32 filas en top-1, 32/32 en KL y 32/32 en NLL, sin ninguna fila que empeore. Segun el autor, es el unico artefacto del programa que supera al base en el panel y no retrocede en ninguna de las dos tareas de referencia; los mosaicos e216 y f216 quedan 4-6 pp por debajo del base en ambas.

## Requisitos de hardware

- VRAM / memoria estimada: 96,1 GB de pesos en disco (12 shards). La ejecucion validada usa un unico NVIDIA DGX Spark (GB10, arm64, 128 GB de memoria unificada) con `mem-fraction-static 0.95`.
- GPU recomendadas: DGX Spark (GB10) es la plataforma de referencia del autor. No se proporcionan datos medidos para A100, H100 u otras GPU.
- GPU de consumo: no cabe en GPU de consumo convencional por el tamano del artefacto (96,1 GB); no se documenta ninguna configuracion probada con este tipo de hardware.
- Opciones de despliegue: SGLang con el runtime EXL3 y su overlay, segun la receta del repositorio del autor. `transformers` en su forma estandar no ejecuta estos pesos. No hay datos publicados para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput medidos: 9-10 tok/s en decodificacion con 262.144 tokens de contexto, vision activada, KV en fp8, `max-running-requests 1` y sin CUDA graphs. El hermano de 10 capas alcanza aproximadamente 11,2-11,5 tok/s con decode graphs. La linea de staging con codebook `mcg` llega a 18,7-19,2 tok/s, pero con peor calidad.
- Tiempo hasta el primer token: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otras familias de modelos en la informacion proporcionada. La comparacion se limita a variantes del mismo programa, todas construidas sobre GLM-5.3-Flash.

| Modelo | Parametros | Contexto | Calidad | Decodificacion | Codebook | Licencia |
|---|---|---|---|---|---|---|
| M288-12L mosaic (este artefacto) | 47,96 B (96,1 GB) | 262.144 tokens en servicio | Supera al base en panel G4, MMLU y GPQA | 9-10 tok/s | `mul1` | MIT |
| Base `turboderp/GLM-5.3-Flash-exl3` | No disponible | No disponible | Referencia (2,05 bpw) | No disponible | `mul1` | MIT |
| Mosaicos e216 y f216 | No disponible | No disponible | 4-6 pp por debajo del base en MMLU y GPQA | No disponible | No disponible | MIT |
| Hermano de 10 capas | No disponible | No disponible | No disponible | 11,2-11,5 tok/s con decode graphs | No disponible | MIT |
| Linea de staging con codebook `mcg` | No disponible | No disponible | Por debajo del base en calidad | 18,7-19,2 tok/s | `mcg` | MIT |

## Limitaciones y advertencias

- Sin MTP: no hay decodificacion multi-token en este artefacto. Los dos runtimes con soporte MTP del programa rechazan el codebook `mul1` en la validacion de configuracion, antes de leer ningun peso, con el error `ValueError: this overlay only implements codebook=mcg; got 'mul1'`. Esto deja la decodificacion en aproximadamente la mitad de la velocidad de la linea `mcg`.
- Orientado a calidad, no a velocidad: 9-10 tok/s lo hacen poco adecuado para chat interactivo, agentes en tiempo real o servicios con requisitos de baja latencia.
- Dependencia estricta del runtime: requiere SGLang con overlay EXL3. `transformers` estandar no ejecuta estos pesos.
- Falso positivo en la verificacion global: la comprobacion de igualdad de delta a nivel de fichero reporta FAIL por una deriva de cabecera de +10.706 B. Las comprobaciones validas son las per-tensor registradas en `PROVENANCE.json`.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible; al ser un artefacto derivado, hereda los sesgos del modelo base GLM-5.3-Flash.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de veracidad. El artefacto no incorpora ningun ajuste de alineamiento adicional sobre el base.
- Idiomas: solo se declaran ingles y chino. No hay evidencia publicada de rendimiento en castellano u otras lenguas.
- Ambito de la mejora: la ganancia se limita a las 12 capas promocionadas; el resto del modelo conserva la precision de 2,05 bpw, por lo que el techo de calidad sigue fijado por el base.
- Cache KV: la configuracion medida emplea fp8, lo que puede introducir degradacion adicional no desglosada en las metricas de calidad publicadas.
- Licencia: MIT con copyright de Z.AI Co., Ltd (2026), heredada del base. No se indican restricciones adicionales para uso comercial en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-M288-Mosaic-12L
- Modelo base: https://huggingface.co/turboderp/GLM-5.3-Flash-exl3
- Receta y documentacion del mosaico: https://github.com/0xSero/glm-5.3-flash-spark-mosaic
- Trabajo hermano EXL3 + MTP sobre 2 DGX Sparks: https://github.com/0xSero/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante para este modelo; las entradas devueltas corresponden a documentacion de componentes industriales Siemens y no guardan relacion con el artefacto.
