# Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed42

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct. Lo publica el usuario Jongbin-kr bajo el identificador exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed42, dentro de una familia de experimentos de ajuste fino orientados a tareas de razonamiento financiero. El adaptador se ha entrenado sobre un subconjunto "answer-only" de ConvFinQA, un corpus de preguntas y respuestas conversacionales sobre informes financieros.

El elemento distintivo del artefacto es su metodología de selección de datos: el sufijo del nombre describe una condicion de seleccion por banda de precision (accuracy-band-selection), con condicion accuracy_medium_low_1to2_selseed42_ratio0.12 y semilla de entrenamiento 42. El adaptador forma parte, por tanto, de un estudio comparativo sobre como afecta la seleccion de subconjuntos de datos al rendimiento tras el fine-tuning, mas que de un modelo listo para produccion.

Es relevante ahora como material de investigacion reproducible: incluye un manifiesto de seleccion con hash SHA256, una revision esperada del modelo base y tres ramas de epoca (checkpoint-82, checkpoint-164 y checkpoint-246), con main apuntando al checkpoint-164 (eval_loss=0.3114182949066162). El tamano del repositorio es de 1,0 GB y acumula 16 descargas y 0 "likes", sin senales de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (adaptador LoRA sobre un transformer decoder-only: EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.800 millones en el modelo base; el adaptador LoRA no declara rango ni numero de parametros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (viene determinada por el modelo base) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors, la cuantizacion se aplica al modelo base tras el merge |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | no disponible (el repositorio no declara licencia; el modelo base tiene su propia licencia, que debe consultarse) |
| Formato de pesos | safetensors (pesos de adaptador PEFT, no pesos de modelo completo fusionados) |

Datos adicionales del repositorio: libreria peft, pipeline no disponible, tamano del repo 1,0 GB, creado el 2026-10-06 y actualizado el 2026-10-06.

## Arquitectura y entrenamiento

El adaptador se monta sobre EXAONE-3.5-7.8B-Instruct, un transformer decoder-only de 7.800 millones de parametros desarrollado por LG AI Research. La tecnica de ajuste es LoRA (Low-Rank Adaptation) gestionada con la libreria PEFT, lo que implica que solo se actualiza un subconjunto reducido de matrices de bajo rango y que los pesos resultantes deben cargarse junto al modelo base; no son pesos de modelo completo fusionados. El autor no especifica en la model card el rango de LoRA, el valor de alpha, la tasa de aprendizaje ni la composicion exacta del dataset de entrenamiento.

El entrenamiento consiste en un SFT supervisado sobre un subconjunto "answer-only" de ConvFinQA, es decir, ejemplos cuyo objetivo contiene unicamente la respuesta y no una cadena de razonamiento explicita, pese al sufijo "verireason" del nombre. La seleccion de ejemplos sigue un criterio de banda de precision con condicion accuracy_medium_low_1to2_selseed42_ratio0.12, semilla 42 y una ratio de 0.12, acompanado de un manifiesto de seleccion con hash SHA256 8609271394132551f7fbde53b700a5ef87c50fa2286ed2a26ecb5e137cb2ae2c. El autor advierte de que el cargador de entrenamiento uso el ID del Hub sin fijar revision, y espera una revision local concreta del modelo base: 553ea250b9a5317231459279d5847d6cf955b9aa. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre documentos financieros, en el dominio especifico de ConvFinQA (preguntas conversacionales sobre tablas y texto de informes).
- Razonamiento numerico basico aplicado a estados financieros, heredado del modelo base y reforzado con el subconjunto de ajuste.
- Respuesta en formato "answer-only": el adaptador esta optimizado para emitir directamente la respuesta, no cadenas de razonamiento paso a paso.
- Conversacion multi-turno sobre un mismo documento financiero, en la medida en que lo permita la ventana de contexto del modelo base.
- Capacidades generales heredadas del modelo base EXAONE-3.5-7.8B-Instruct (generacion, comprension lectora, codigo y matematicas), aunque el ajuste puede degradarlas por sobreespecializacion.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el objetivo de entrenamiento es answer-only.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Respuesta a preguntas sobre informes financieros: el adaptador responde consultas del estilo ConvFinQA sobre tablas y notas de estados financieros, aprovechando el ajuste especifico sobre ese dominio en lugar de depender unicamente del conocimiento general del modelo base.
- Extraccion de metricas en pipelines de analisis: se puede integrar como componente de un sistema que traduzca preguntas en lenguaje natural a valores concretos (ingresos, margenes, variaciones interanuales) a partir de documentos contables.
- Asistente financiero multi-turno: al conservar la ventana de contexto del modelo base, puede mantener conversaciones encadenadas sobre un mismo informe, donde cada pregunta depende de la respuesta anterior.
- Reproduccion de experimentos de seleccion de datos: dado que incluye manifiesto con hash, semilla y ratio de seleccion, sirve como artefacto reproducible para estudiar como la banda de precision del subconjunto afecta al rendimiento final.
- Punto de partida para ajustes posteriores: al ser un adaptador LoRA independiente, se puede fusionar con el modelo base o combinar con otros adaptadores para tareas financieras relacionadas.
- Auditoria de calidad de datasets de QA financiero: comparar este adaptador (ratio 0.12, banda accuracy_medium_low) con variantes de otras condiciones permite medir la utilidad marginal de cada subconjunto seleccionado.
- Generacion de resumenes de secciones financieras: puede resumir notas o desgloses concretos de un informe, siempre con supervision humana dado el riesgo de alucinacion en cifras.
- Apoyo a procesos de due diligence: como borrador inicial de respuestas sobre documentacion financiera extensa, con verificacion posterior obligatoria de cada dato numerico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento que aparece en la model card es la perdida de validacion del mejor checkpoint:

| Metrica | Valor |
|---|---|
| Checkpoint con mejor validacion | checkpoint-164 (rama epoch2-step164) |
| eval_loss en checkpoint-164 | 0.3114182949066162 |
| Semilla de entrenamiento | 42 |
| Ratio de seleccion | 0.12 |
| Condicion de seleccion | accuracy_medium_low_1to2_selseed42_ratio0.12 |

No hay datos de MMLU, HumanEval, GSM8K ni de metricas especificas de ConvFinQA (por ejemplo, exact match o accuracy de respuesta). No se dispone de comparacion con otras condiciones del mismo estudio.

## Requisitos de hardware

Nota: los valores de VRAM son estimaciones derivadas del numero de parametros del modelo base (7.800 millones) y no proceden de mediciones publicadas por el autor.

- Inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas memoria para cache KV y activaciones; se recomienda reservar entre 20 y 24 GB de VRAM.
- Inferencia en int8: aproximadamente 9-10 GB de VRAM.
- Inferencia en int4 (por ejemplo, cuantizaciones GGUF Q4_K_M): aproximadamente 5-6 GB de VRAM.
- GPU de gama profesional: A100 40/80 GB, H100 80 GB o L40S, con margen amplio para lotes grandes y contextos largos.
- GPU de consumo: RTX 3090 o RTX 4090 (24 GB) pueden ejecutar el modelo en bf16; RTX 4070 Ti Super, RTX 4060 Ti 16 GB o RTX 4070 (12 GB, en cuantizacion int4) sirven para configuraciones cuantizadas.
- Equipos Apple Silicon con memoria unificada de 32 GB o superior pueden ejecutar versiones cuantizadas.
- Opciones de despliegue: vLLM o TGI para servicio de alto rendimiento en bf16 o fp8/int8; llama.cpp y Ollama para cuantizaciones GGUF (requieren fusionar el adaptador con el modelo base y convertir los pesos); transformers + PEFT para cargar el adaptador directamente sin fusionar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (modelo base) | 7.800 M | no disponible en la informacion proporcionada | licencia propia del modelo base, no detallada aqui | pesos completos en HuggingFace | no disponible |
| Este adaptador (exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed42) | 7.800 M en el base + parametros LoRA no declarados | no disponible | no disponible | adaptador PEFT de 1,0 GB en HuggingFace | eval_loss = 0.3114 en checkpoint-164 |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones publicadas con otros adaptadores de la misma familia de experimentos ni con modelos de 7-8 B de proposito general, por lo que no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar EXAONE-3.5-7.8B-Instruct para funcionar; el repositorio solo contiene pesos de adaptador PEFT.
- Licencia no declarada: el repositorio no especifica licencia, y el uso comercial queda supeditado a los terminos del modelo base, que deben revisarse antes de cualquier despliegue en produccion.
- Riesgo de sobreajuste: el ajuste se realizo sobre un subconjunto con ratio 0.12 (una fraccion reducida del corpus original), lo que puede provocar olvido catastrofico de capacidades generales del modelo base.
- Riesgo de alucinacion numerica: en tareas financieras, un error en una cifra o unidad puede tener consecuencias graves; toda respuesta debe verificarse contra el documento fuente.
- Dominio restringido: ConvFinQA es un corpus de preguntas conversacionales sobre informes financieros en ingles; el comportamiento fuera de ese dominio o en otros idiomas no esta documentado.
- Ausencia de cadena de razonamiento: pese al sufijo "verireason" del nombre, el entrenamiento es answer-only, por lo que el modelo no expone pasos intermedios auditables.
- Reproducibilidad incompleta: el autor indica que el cargador de entrenamiento uso el ID del Hub sin fijar revision, de modo que la revision exacta del modelo base no esta garantizada salvo que se use el commit indicado (553ea250b9a5317231459279d5847d6cf955b9aa).
- Sin validacion externa: 16 descargas y 0 "likes" en el momento de redactar esta ficha; no hay evaluaciones independientes ni resultados de benchmarks publicados.
- Fechas incoherentes: el repositorio figura como creado y actualizado el 2026-10-06, fecha posterior a la referencia temporal habitual, lo que conviene verificar.
- Hiperparametros de LoRA no documentados: no se indica rango, alpha, dropout ni estrategia de mezcla de datasets, lo que dificulta la replica exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed42
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper del dataset ConvFinQA, repositorio del autor de EXAONE y demos adicionales: no disponibles en la informacion proporcionada.
