# Jongbin-kr/exaone-verireason-sft_accuracy_medium_3to5_ratio0.12_seed2026

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, publicado por el usuario Jongbin-kr. No se trata de un modelo completo, sino de pesos PEFT que deben cargarse junto con el modelo base de EXAONE-3.5-7.8B. El entrenamiento se ha realizado sobre un subconjunto de ConvFinQA en modo "answer-only" (solo respuesta), es decir, orientado a producir la respuesta final de preguntas financieras conversacionales en lugar de cadenas de razonamiento completas.

El identificador del repositorio codifica la configuracion experimental: `accuracy_medium_3to5_ratio0.12_seed2026`. Segun la model card, la condicion de seleccion de datos es `accuracy_medium_center_3to5_selseed2026_ratio0.12`, con semilla de entrenamiento 42 y un manifiesto de seleccion con hash SHA256 documentado. El checkpoint seleccionado por mejor perdida de validacion es `checkpoint-164` (`eval_loss=0.3182275891304016`), correspondiente a la epoca 2.

Es relevante en el contexto de la investigacion sobre ajuste fino eficiente y seleccion de datos: el repositorio forma parte de una familia de experimentos que varian la banda de dificultad de los ejemplos (accuracy medium, rango 3-5) y la proporcion de datos empleada (ratio 0.12). El interes practico esta en reproducir el pipeline de seleccion y comparar el efecto de la composicion del dataset sobre el rendimiento final, no en el adaptador como producto listo para produccion: cuenta con 14 descargas, 0 likes y no incluye resultados de evaluacion publicados.

El modelo base aporta la arquitectura y el grueso de la capacidad: EXAONE-3.5-7.8B-Instruct es un transformer denso de 7.800 millones de parametros desarrollado por LG AI Research, con ventana de contexto de 32 768 tokens segun su documentacion publica. El adaptador anade un ajuste de bajo rango especifico para el dominio financiero conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 7,8 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion del adaptador; el modelo base EXAONE-3.5-7.8B-Instruct declara 32 768 tokens en su documentacion publica |
| Tipos de cuantizacion | No disponible (los pesos publicados son adaptadores en safetensors; la cuantizacion depende del modelo base con el que se combine) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible para el adaptador; el modelo base se distribuye bajo la licencia propia de EXAONE, que debe verificarse en su repositorio |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, no fusionados con el modelo base) |
| Libreria | peft |
| Tamano del repositorio | 1,0 GB |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| Revision esperada de la cache local del base | `553ea250b9a5317231459279d5847d6cf955b9aa` |
| Checkpoint de validacion optimo | `checkpoint-164` (eval_loss = 0,3182275891304016) |
| Ramas disponibles | `main` (adaptador final), `epoch1-step82`, `epoch2-step164`, `epoch3-step246` |
| Semilla de entrenamiento | 42 |
| Hash del manifiesto de seleccion | `9e6dfec7d5b988695fd457508e069f9e14dd94715bf6480952cd87991226c615` |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |
| Descargas / likes | 14 / 0 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de pesos LoRA (Low-Rank Adaptation) sobre EXAONE-3.5-7.8B-Instruct, un transformer decoder-only denso de 7,8 mil millones de parametros. El entrenamiento se realizo con PEFT y se describe como SFT sobre un subconjunto de ConvFinQA en formato "answer-only": el objetivo es generar unicamente la respuesta final a preguntas conversacionales sobre documentos financieros, sin supervisar la cadena de razonamiento intermedia. La model card no especifica el rango de LoRA, los modulos objetivo, la tasa de aprendizaje, el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla del criterio de seleccion.

El experimento documenta explicitamente su protocolo de seleccion de datos: condicion `accuracy_medium_center_3to5_selseed2026_ratio0.12`, con manifiesto de seleccion identificado por SHA256 y semilla de entrenamiento 42. El entrenamiento duro tres epocas (checkpoints en los pasos 82, 164 y 246, es decir 82 pasos por epoca), y se selecciono el checkpoint 164 por perdida de validacion. Se advierte en la model card de que el cargador de entrenamiento uso el ID del Hub sin fijar una revision explicita, de ahi que se indique la revision esperada de la cache local (`553ea250b9a5317231459279d5847d6cf955b9aa`) como referencia para reproducibilidad.

Un detalle relevante para quien vaya a reutilizarlo: el repositorio pesa 1,0 GB, un tamano elevado para un adaptador LoRA sobre un modelo de 7,8B. Esto sugiere un rango alto o un conjunto amplio de modulos adaptados (o pesos guardados en precision completa), pero el dato concreto no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de respuestas a preguntas financieras conversacionales sobre documentos y tablas, ajustada especificamente sobre ConvFinQA en modo respuesta directa.
- Razonamiento numerico y aritmetico aplicado a datos financieros (el benchmark ConvFinQA requiere operaciones sobre cifras extraidas de informes).
- Comprension de contexto multi-turno: ConvFinQA encadena preguntas sucesivas sobre el mismo documento, por lo que el ajuste refuerza el seguimiento de referencias implicitas entre turnos.
- Capacidades heredadas del modelo base EXAONE-3.5-7.8B-Instruct (generacion de texto general, codigo, matematicas e instrucciones), aunque el adaptador puede degradarlas parcialmente al estar especializado en un unico dominio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base y no se documenta en el adaptador).
- Soporte de agentes y razonamiento multi-paso explicito: no disponible; el entrenamiento es "answer-only", por lo que no supervisa cadenas de razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Extraccion de respuestas numericas de informes financieros: el adaptador responde preguntas del tipo "cual fue el margen operativo en el cuarto trimestre" sobre tablas y texto de un 10-K o memoria anual, devolviendo la cifra calculada en lugar de una cadena de razonamiento. Es su caso de uso directo, al haber sido entrenado sobre ConvFinQA en modo answer-only.
- Asistentes de analisis financiero conversacional: permite mantener un dialogo de varios turnos sobre el mismo documento, resolviendo referencias implicitas ("y respecto al ano anterior?") gracias al ajuste sobre un dataset intrinsecamente multi-turno.
- Automatizacion de informes trimestrales: generar resumenes con cifras concretas a partir de estados financieros, integrable en un pipeline que recupere el documento y formule la pregunta al modelo.
- Auditoria y control interno: verificar de forma asistida si las cifras citadas en un borrador coinciden con las del balance, usando el modelo como extractor y calculador supervisado por un revisor humano.
- Investigacion sobre seleccion de datos para SFT: el repositorio es una pieza de una comparativa controlada (banda de dificultad, ratio de datos, semillas), utilizable para estudiar como la composicion del dataset afecta a la perdida de validacion y al rendimiento final.
- Reproduccion de experimentos de ajuste eficiente: sirve como referencia para validar un pipeline PEFT con ConvFinQA, comparando los tres checkpoints por epoca publicados en ramas separadas.
- Evaluacion comparativa de adaptadores: al compartir modelo base, se puede contrastar contra otros adaptadores de la misma familia para aislar el efecto del criterio de seleccion de datos.
- Prototipado de copilotos financieros internos: combinado con un sistema de recuperacion (RAG) sobre el corpus contable de una organizacion, permite responder consultas de analistas sin reentrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de evaluacion es la perdida de validacion del checkpoint seleccionado: `eval_loss=0,3182275891304016` en el paso 164. No se proporcionan cifras de accuracy sobre ConvFinQA ni de benchmarks generales (MMLU, HumanEval, GSM8K), ni comparaciones con otros adaptadores de la familia.

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-164, mejor de validacion) | 0,3182275891304016 |
| Accuracy en ConvFinQA | No disponible |
| Benchmarks generales (MMLU, GSM8K, HumanEval) | No disponible |
| Comparacion con otros adaptadores del mismo experimento | No disponible |

## Requisitos de hardware

- El adaptador no puede ejecutarse solo: requiere cargar el modelo base EXAONE-3.5-7.8B-Instruct (unos 15,6 GB en fp16 para 7,8B parametros).
- VRAM estimada en fp16/bf16: del orden de 16-20 GB para pesos y estados de activacion en inferencia con contexto moderado. Cabe en una RTX 4090 (24 GB) o A100 40 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-10 GB. Cabe en RTX 3080/3090, RTX 4070 Ti y GPUs de 12 GB o mas.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-7 GB. Cabe en tarjetas consumer de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- GPUs de datacenter recomendadas para servicio concurrente: A100 40/80 GB, H100 80 GB, L40S.
- Coste adicional del adaptador: el repositorio ocupa 1,0 GB, por lo que hay que sumar ese espacio en disco y un consumo de VRAM menor al cargar los pesos LoRA (el coste dominante es el modelo base).
- Opciones de despliegue: transformers + peft para carga directa del adaptador; vLLM con soporte de adaptadores LoRA si la arquitectura del base esta soportada; TGI con adaptadores; Ollama o llama.cpp requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF, ya que no consumen pesos PEFT sin fusion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna de este repositorio proceden de la informacion proporcionada. Las cifras de los modelos alternativos corresponden a especificaciones publicas de sus respectivas model cards y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Tipo de artefacto |
|---|---|---|---|---|
| Este repositorio (adaptador sobre EXAONE-3.5-7.8B-Instruct) | 7,8B (base); adaptador LoRA de 1,0 GB | No disponible para el adaptador; 32 768 en el base | No disponible para el adaptador; ver licencia de EXAONE en el base | Adaptador PEFT (safetensors) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct | 7,8B | 32 768 tokens | Licencia propia de EXAONE (consultar repositorio) | Pesos completos |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32 768 tokens | Apache 2.0 | Pesos completos |
| Qwen2.5-7B-Instruct | 7,6B | 131 072 tokens | Apache 2.0 (salvo variantes concretas) | Pesos completos |
| Llama-3.1-8B-Instruct | 8,0B | 131 072 tokens | Licencia comunitaria de Llama 3.1 | Pesos completos |

Diferencias clave: este repositorio no es un modelo autonomo, sino un ajuste de dominio sobre EXAONE-3.5, por lo que solo es comparable en la tarea concreta (ConvFinQA). Frente a las alternativas, el factor decisivo no es el rendimiento bruto sino la licencia del modelo base, mucho mas restrictiva que las licencias Apache 2.0 de Mistral y Qwen. No hay datos publicados que permitan afirmar que este adaptador supere a los modelos anteriores en preguntas financieras.

## Limitaciones y advertencias

- No es un modelo completo: sin el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct no se puede cargar ni ejecutar nada.
- Especializacion estrecha: entrenado sobre un subconjunto "answer-only" de ConvFinQA, lo que puede degradar capacidades generales de conversacion, codigo o matematicas respecto al modelo base.
- Sin resultados de evaluacion publicados: no hay accuracy en ConvFinQA ni en benchmarks generales, por lo que no es posible cuantificar la mejora frente al base ni descartar sobreajuste. El unico indicador es una perdida de validacion de 0,318.
- Riesgo de alucinacion en cifras: en dominios financieros, un modelo que responde sin cadena de razonamiento puede producir cantidades plausibles pero incorrectas. Requiere verificacion humana o validacion contra el documento fuente antes de cualquier uso real.
- Ambiguedad de reproducibilidad: la model card advierte de que el cargador de entrenamiento uso el ID del Hub sin fijar revision; la revision indicada (`553ea250b9a5317231459279d5847d6cf955b9aa`) es la esperada en la cache local, no una garantia verificada.
- Licencia no declarada: el repositorio no especifica licencia. El modelo base de EXAONE tiene condiciones propias que deben consultarse; es previsible que impongan restricciones al uso comercial. Verificar antes de cualquier despliegue en produccion.
- Idiomas no documentados: no se indica si el adaptador mantiene el soporte multilingue del base ni en que idioma esta el corpus de entrenamiento (ConvFinQA es en ingles).
- Sesgos no evaluados: no se publica ninguna evaluacion de sesgos, toxicidad o equidad.
- Trazabilidad limitada: 14 descargas y 0 likes, sin issues ni documentacion adicional; el autor no publica el informe de entrenamiento completo ni la configuracion de LoRA utilizada.
- Caducidad potencial: el entrenamiento esta fechado en octubre de 2026 y el modelo base puede haber evolucionado; conviene fijar revisiones explicitas al reproducir.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_medium_3to5_ratio0.12_seed2026
- Modelo base en HuggingFace: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Dataset ConvFinQA (referencia de la tarea de entrenamiento): no disponible en la informacion proporcionada
- Paper o blog del autor sobre el metodo de seleccion de datos: no disponible en la informacion proporcionada
- Repositorio de codigo del experimento: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
