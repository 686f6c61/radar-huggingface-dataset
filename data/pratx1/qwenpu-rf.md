# pratx1/QwenPU-RF

## Resumen

QwenPU-RF es un checkpoint de 19 GB derivado de Qwen/Qwen3.5-4B en el que se ha compilado una CPU RISC-V de 32 bits (RV32) dentro de los propios pesos del transformer. El objetivo es ejecutar procesamiento exacto de senales de radiofrecuencia (analisis de espectro, niveles y clasificacion de modulacion) como trazas de tokens que atraviesan las capas del modelo, en lugar de delegar en una herramienta externa. Lo desarrolla pratx1 sobre el trabajo previo de QwenPU (Divyansh Agrawal) y se publica bajo licencia Apache-2.0.

La arquitectura parte de las 32 capas de Qwen3.5-4B y anade 11 capas compiladas de CPU por delante, ampliando el tamano oculto de 2560 a 3968 dimensiones (1408 dimensiones adicionales para el computador). No hay entrenamiento: los nuevos pesos los genera un compilador (`chipformer.rv.merge`) y los pesos originales de Qwen se conservan intactos. El vocabulario de Qwen se extiende con tokens de traza de la CPU a partir del offset 248.320.

Es relevante como prueba de concepto de "in-weights computing": un modelo de lenguaje que invoca herramientas RF mediante `<tool_call>` y cuya ejecucion es verificable bit a bit contra una maquina RISC-V de referencia. El precio es un rendimiento entre 10⁵ y 10⁶ veces mas lento que un DSP convencional, con 27-122 s por pregunta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con 11 capas de CPU RV32 compiladas delante; RAM en estado Gated DeltaNet |
| Parametros totales | no disponible (checkpoint de 19 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en el formato original de transformers) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; SHA-256 por fichero en `SHA256SUMS`) |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3.5-4B modificado: se anteponen 11 capas compiladas que implementan una CPU RV32 en layout `rv1` (CPU plana, sin unidad vectorial), con 103 cabezas de atencion y 42.202 unidades FFN dedicadas al computador. El tamano oculto pasa de 2560 a 3968 dimensiones y la RAM del computador se almacena en el estado de Gated DeltaNet. El vocabulario incorpora tokens de traza de la CPU a partir del indice 248.320, de modo que cada instruccion y cada acceso a memoria del programa RF se materializa como un token que recorre las capas del modelo.

No hubo entrenamiento: los pesos nuevos se calculan mediante el compilador `chipformer.rv.merge` a partir de Qwen3.5-4B (commit `851bf6e`) y del `chipformer` de QwenPU (commit `5af1fc0`). La innovacion tecnica es la verificacion: cada token de chip se compara contra una maquina RISC-V de referencia, lo que permite afirmar que la ejecucion del circuito es exacta respecto a un contrato de coma fija de 16 bits declarado (no respecto a coma flotante). El modelo solo funciona a traves del harness del repositorio, que escribe la llamada a herramienta en la RAM del computador y comprueba la traza.

## Capacidades

- Generacion de texto y razonamiento heredados de Qwen3.5-4B.
- Llamada a herramientas mediante `<tool_call>` con tres herramientas RF integradas: `rf_analyze`, `rf_levels` y `rf_modulation`.
- Ejecucion de un programa de procesamiento de senales como traza de tokens dentro de las propias capas del modelo, verificable contra una CPU RV32 de referencia.
- Analisis de niveles de senal (resultados en dBFS) y clasificacion de modulacion a partir de senales sinteticas.
- Respuesta a preguntas no respondibles: rechaza con la linea `not_measured` del firmware v4 (16/16 en las pruebas publicadas).
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Verificacion de pipelines DSP en entornos de investigacion: usar el modelo para ejecutar un analisis RF y contrastar la traza token a token contra la referencia RISC-V, como oraculo de conformidad de un contrato de coma fija de 16 bits.
- Docencia y demostracion de "in-weights computing": ilustrar como un transformer puede alojar un computador completo y ejecutar codigo dentro de sus pesos, con trazabilidad total de cada instruccion.
- Analisis de niveles de senal en flujos de laboratorio de baja cadencia: invocar `rf_levels` para obtener medidas en dBFS cuando el tiempo de respuesta de 27-122 s por pregunta es aceptable.
- Clasificacion de modulacion sobre senales sinteticas: invocar `rf_modulation` (unos 465.000 tokens de chip por llamada) y leer la clase impresa en el informe.
- Auditoria de respuestas numericas: el 99,0% de los numeros de las respuestas son trazables al informe verificado, lo que sirve para validar tecnicas de atribucion en asistentes tecnicos.
- Pruebas de robustez ante preguntas sin respuesta: evaluar el comportamiento de rechazo controlado (`not_measured`) en asistentes de instrumentacion.
- Investigacion sobre representacion de computacion en pesos: banco de pruebas para estudiar como se distribuyen las trazas de ejecucion en las capas de un transformer.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Verificacion funcional de los ficheros publicados (2026-11-20) | 625 tokens de texto + 26.581 de chip; 27.144 / 27.144 tokens de circuito iguales a la referencia, 0 discrepancias; respuesta -48,9 / -10,4 dBFS (correcta) |
| Banco de 96 preguntas | 96/96 circuito exacto; herramienta correcta 96/96; 99,0% de numeros trazables al informe verificado |
| Preguntas no respondibles | 16/16 rechazadas con la linea `not_measured` del firmware v4 |
| Modulacion | `rf_modulation` invocada (unos 465.000 tokens de chip por llamada); clase impresa correcta 10/10 |
| Latencia | 27-122 s por pregunta (10⁵-10⁶ veces mas lento que un DSP convencional) |

Todas las pruebas se ejecutaron en una unica GPU de portatil RTX 5090. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible.

## Requisitos de hardware

- VRAM: el checkpoint completo ocupa 19 GB y cabe entero en una GPU de 24 GB.
- GPU recomendadas: RTX 5090 (validada por el autor); cualquier GPU con al menos 24 GB de memoria.
- Cabe en GPU de consumo: si, en modelos de 24 GB como la RTX 5090; no cabe en GPUs de 16 GB o menos sin cuantizacion (no documentada).
- Despliegue: exclusivamente mediante el harness del repositorio GitHub (transformers + `QwenPU[hf]`); el autor indica que la generacion de texto plano sin harness no se ha probado.
- Latencia: 27-122 s por pregunta; el parametro `--chunk 1024` controla el procesamiento por bloques en GPU.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenPU-RF | no disponible (19 GB) | no disponible | Qwen3.5-4B + CPU RV32 compilada | Apache-2.0 | Hugging Face + GitHub |
| Qwen/Qwen3.5-4B | 4B | no disponible | LLM de proposito general | no disponible en la informacion | Hugging Face |
| QwenPU (checkpoint con unidad vectorial) | no disponible (26,7 GB) | no disponible | Qwen + CPU RV32 con unidad vectorial | no disponible en la informacion | GitHub de QwenPU |

La comparativa con LLMs de proposito general no es directa: QwenPU-RF no esta pensado para generacion de texto abierta, sino para ejecutar y verificar computacion RF dentro del modelo. Frente al checkpoint QwenPU de 26,7 GB, esta variante `rv1` prescinde de la unidad vectorial y reduce el peso lo suficiente para caber en una GPU de 24 GB.

## Limitaciones y advertencias

- Rendimiento entre 10⁵ y 10⁶ veces inferior a un DSP convencional; no es apto para procesamiento en tiempo real.
- La exactitud se define contra un contrato de coma fija de 16 bits declarado, no contra coma flotante.
- La verificacion cubre los numeros; la interpretacion que hace Qwen de ellos se comprueba con un verificador de respuestas, no esta demostrada formalmente.
- El clasificador de modulacion se entreno y evaluo unicamente con senales sinteticas.
- Solo funciona a traves del harness del repositorio; la generacion de texto sin harness no se ha probado.
- Idioma declarado: solo ingles.
- Sin datos publicados sobre sesgos, alucinacion en texto libre, longitud de contexto ni cuantizacion.
- Licencia Apache-2.0 como version modificada de Qwen3.5-4B; el codigo de QwenPU y Qwenputer es MIT y requiere citar a sus autores junto con QwenPU-RF.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/pratx1/QwenPU-RF
- Repositorio QwenPU-RF: https://github.com/pratx1906/QWENPU-RF
- Limites detallados: https://github.com/pratx1906/QWENPU-RF#limits
- Citacion: https://github.com/pratx1906/QWENPU-RF/blob/main/CITATION.cff
- QwenPU (proyecto original): https://github.com/divagr18/QwenPU
- Qwenputer: https://github.com/divagr18/qwenputer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo: https://raw.githubusercontent.com/pratx1906/QWENPU-RF/main/docs/demo.gif
