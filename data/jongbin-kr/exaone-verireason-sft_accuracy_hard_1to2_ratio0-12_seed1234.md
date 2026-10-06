# Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed1234

## Resumen

El modelo `Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed1234` es un adaptador LoRA entrenado mediante supervisión (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por el usuario de HuggingFace Jongbin-kr. No se trata de un modelo completo, sino de pesos de adaptador PEFT: el repositorio no contiene pesos fusionados del modelo base, por lo que su uso exige descargar previamente EXAONE-3.5-7.8B-Instruct y cargar el adaptador sobre él.

El adaptador se ha entrenado sobre un subconjunto "answer-only" de ConvFinQA, un conjunto de preguntas y respuestas numéricas sobre informes financieros. La etiqueta `accuracy-band-selection` y el identificador de la condición de selección (`accuracy_medium_low_1to2_selseed1234_ratio0.12`) indican que el trabajo forma parte de una línea de investigación sobre selección de datos de entrenamiento: se elige una banda concreta de ejemplos según la precisión del modelo en ellos (aquí, dificultad media-baja, con una proporción de 0,12) para estudiar cómo afecta esa selección al ajuste final.

Es, por tanto, un artefacto de investigación reproducible (semilla de entrenamiento 42, manifiesto de selección con hash SHA256, ramas por época), con 14 descargas y ninguna interacción en el momento de redactar esta ficha. Su relevancia es metodológica más que de producto: documenta de forma trazable un experimento de selección de datos sobre un modelo de 7.800 millones de parámetros y contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base: no detallada en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base es EXAONE-3.5-7.8B-Instruct (7,8 mil millones de parametros, segun su documentacion publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; heredada del modelo base (32.768 tokens segun la documentacion publica de EXAONE-3.5, dato no verificado en esta ficha) |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se distribuye en safetensors; la cuantizacion aplicable seria la del modelo base (por ejemplo, 8 bits o 4 bits) tras fusionar los pesos |
| Idiomas soportados | No disponibles en la model card del adaptador; dependen del modelo base |
| Licencia | No disponible. La model card del adaptador no declara licencia; el modelo base se rige por sus propios terminos (EXAONE AI Model License), que hay que consultar por separado |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, no fusionados) |
| Tamano del repositorio | 1,0 GB |
| Libreria declarada | peft |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct |
| Revision de cache esperada del base | 553ea250b9a5317231459279d5847d6cf955b9aa |
| Ramas del repositorio | main (mejor validacion), epoch1-step82, epoch2-step164, epoch3-step246 |
| Checkpoint de mejor validacion | checkpoint-164 (eval_loss = 0,3071623742580414) |
| Semilla de entrenamiento | 42 |
| Condicion de seleccion | accuracy_medium_low_1to2_selseed1234_ratio0.12 |
| Hash SHA256 del manifiesto de seleccion | 42029327b28d436f3865794635ae289d7ab3ec76335c4bb0820f327d965321a8 |

## Arquitectura y entrenamiento

El adaptador se ha entrenado con LoRA (Low-Rank Adaptation) sobre EXAONE-3.5-7.8B-Instruct, un transformer decoder-only de 7.800 millones de parámetros. No se especifican en la model card el rango del adaptador, el valor de alpha, las capas objetivo ni el dropout, por lo que esos hiperparámetros quedan como "no disponible". El repositorio ocupa 1,0 GB, coherente con pesos de adaptador guardados en precisión completa para un modelo de este tamaño.

El entrenamiento es un SFT supervisado sobre un subconjunto de ConvFinQA restringido a "answer-only", es decir, con respuestas finales sin cadena de razonamiento intermedia. El identificador del experimento describe un pipeline de selección de datos por bandas de precisión (`accuracy-band-selection`): se filtraron ejemplos según la precisión del modelo en ellos, eligiendo una banda media-baja y una proporción de 0,12, con semilla de selección 1234. El entrenamiento usó semilla 42. Se conservan tres checkpoints por época (pasos 82, 164 y 246) y el mejor por validación es el paso 164, con `eval_loss` de 0,3071623742580414. La model card advierte de que el cargador de entrenamiento usó el ID del Hub sin fijar una revisión explícita, aunque se documenta la revisión esperada de la caché local.

## Capacidades

- Generacion de respuestas factuales breves (formato "answer-only") sobre preguntas numericas de dominio financiero, derivadas de ConvFinQA.
- Razonamiento aritmetico simple y extraccion de cifras a partir de contexto tabular o textual de informes financieros, en la medida en que lo permita el modelo base.
- Capacidades generales de generacion de texto, codigo y matematicas heredadas de EXAONE-3.5-7.8B-Instruct, no evaluadas ni garantizadas para este adaptador.
- Soporte de tool calling o function calling: no documentado para el adaptador; dependera de lo que ofrezca el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste es de respuesta directa, sin cadena de razonamiento.
- Capacidades multilingues: no documentadas en la model card.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponibles; el modelo base es de texto.

## Casos de uso

- Investigacion en seleccion de datos de entrenamiento: el adaptador sirve como punto de comparacion reproducible frente a otras condiciones del mismo barrido experimental (distintas bandas de precision y proporciones), gracias a la semilla y al hash del manifiesto de seleccion.
- Extraccion de respuestas numericas en analisis financiero: dado un fragmento de un informe anual y una pregunta cuantitativa, el modelo devuelve la cifra o el porcentaje solicitado en formato corto, util para prototipos de automatizacion de research financiero.
- Evaluacion de ajuste SFT sobre subconjuntos pequenos: con solo 1,0 GB de pesos de adaptador, permite medir el efecto de entrenar sobre un 12 por ciento de ejemplos seleccionados sin reentrenar el modelo completo.
- Reproduccion de experimentos academicos: las ramas por epoca (pasos 82, 164 y 246) permiten estudiar curvas de aprendizaje y sobreajuste en tareas de respuesta corta.
- Base para comparativas de adaptadores LoRA: al ser un adaptador PEFT estandar sobre un modelo publico, se puede cargar con `peft` y comparar contra otros adaptadores del mismo modelo base en tareas de QA financiero.
- Filtrado previo en pipelines de datos: como generador de respuestas cortas de referencia para validar heuristicas de calidad de preguntas y respuestas sobre ConvFinQA.
- Prototipado de asistentes de consulta documental financiera: integrado en un sistema RAG que recupere tablas de informes y delegue en el modelo la respuesta numerica final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de validacion del mejor checkpoint:

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-164, mejor validacion) | 0,3071623742580414 |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no disponibles |

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar EXAONE-3.5-7.8B-Instruct. Con 7.800 millones de parametros, los pesos del base en bf16/fp16 ocupan aproximadamente 15,6 GB, mas la cache KV.
- Con cuantizacion de 8 bits, la huella estimada baja a unos 8-9 GB; con 4 bits, a unos 5 GB.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB), esta ultima con margen suficiente para contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion de 4 bits, en tarjetas de 8-12 GB, con contexto reducido.
- Opciones de despliegue: `peft` + `transformers` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI; para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparativa se plantea contra el propio modelo base sin adaptar y contra dos alternativas de tamano equivalente. Los datos de las alternativas provienen de documentacion publica y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed1234 | Adaptador sobre 7,8B | No disponible (heredado del base) | Adaptador LoRA para QA financiero answer-only | No disponible | HuggingFace, 14 descargas |
| EXAONE-3.5-7.8B-Instruct | 7,8B | 32.768 tokens (segun documentacion publica) | Modelo instructivo completo | EXAONE AI Model License (consultar terminos) | HuggingFace, ampliamente distribuido |
| Qwen2.5-7B-Instruct | 7,6B | 128.000 tokens (segun documentacion publica) | Modelo instructivo completo | Apache 2.0 (segun documentacion publica) | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens (segun documentacion publica) | Modelo instructivo completo | Llama 3.1 Community License (segun documentacion publica) | HuggingFace |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base EXAONE-3.5-7.8B-Instruct los pesos del repositorio son inutilizables.
- Licencia no declarada en la model card del adaptador; es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial, ya que la licencia de EXAONE restringe determinados usos.
- Riesgo de alucinacion en cifras: en tareas de QA financiero, un `eval_loss` bajo no garantiza exactitud numerica; no hay metricas de exactitud publicadas que lo respalden.
- El entrenamiento se realizo sobre un subconjunto answer-only de ConvFinQA con una proporcion del 12 por ciento de ejemplos, lo que limita la diversidad de dominio y puede inducir sobreajuste al formato de respuesta corta.
- No se documento la revision exacta del modelo base usada en el cargador de entrenamiento, solo la revision esperada en cache, lo que puede introducir diferencias de reproducibilidad.
- No hay informacion sobre sesgos, idiomas soportados, comportamiento multilingue ni seguridad.
- El pipeline no esta declarado y el repositorio tiene un uso muy bajo (14 descargas, 0 likes), por lo que no hay validacion externa de su comportamiento.
- No apto como componente de produccion sin una evaluacion propia: es un artefacto de investigacion.

## Enlaces

- HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_hard_1to2_ratio0.12_seed1234
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- ConvFinQA (conjunto de datos de referencia): https://github.com/czyssrs/ConvFinQA
- Paper, blog o demo del adaptador: no disponible en la informacion proporcionada.
