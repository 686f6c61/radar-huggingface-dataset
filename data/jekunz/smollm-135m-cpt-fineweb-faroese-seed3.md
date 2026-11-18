# jekunz/smollm-135m-cpt-fineweb-faroese-seed3

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-seed3` es un ajuste fino por continuación de preentrenamiento (continued pre-training, CPT) del modelo base `HuggingFaceTB/SmolLM2-135M-Instruct`, desarrollado por el usuario jekunz con fines de investigación. El objetivo es adaptar un modelo instructivo pequeño y multilingüe al idioma feroés (código ISO `fo`), una lengua germánica insular con recursos limitados en corpus de alta calidad. Para ello se ha entrenado sobre la porción feroesa del dataset `HuggingFaceFW/fineweb-2`, una colección de texto web multilingüe filtrada y deduplicada.

El modelo conserva la arquitectura transformer decoder-only del SmolLM2 original, con 134.515.008 parámetros totales y un tamaño de repositorio de 0,3 GB en formato safetensors. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y está etiquetado como compatible con text-generation-inference y endpoints de Hugging Face. Su relevancia radica en que ejemplifica el flujo típico de adaptación lingüística de modelos pequeños para lenguas de bajos recursos: partir de un instructivo ya alineado y especializarlo mediante CPT con una tasa de aprendizaje relativamente alta y varias épocas sobre el corpus objetivo.

No obstante, el propio autor advierte de que el modelo no ha sido evaluado de forma amplia y que su uso previsto es la investigación. La model card no documenta métricas de calidad, evaluación humana ni comparaciones con el modelo base, por lo que cualquier despliegue en producción requeriría una validación adicional por parte del usuario. Esta ficha recoge exclusivamente los datos publicados y marca como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tags) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | Feroes (`fo`) como idioma objetivo del ajuste; el modelo base es multilingue, pero no se documenta el alcance resultante |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-2 (porcion feroesa) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del SmolLM2-135M-Instruct: un transformer decoder-only de 134,5 millones de parametros, disenado para generacion de texto e instrucciones con un coste computacional muy bajo. El ajuste realizado es un continued pre-training sobre texto feroes de FineWeb-2, no un ajuste supervisado clasico ni un entrenamiento con preferencias. La configuracion reportada por el autor es la siguiente: 5 epocas, tasa de aprendizaje 5e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8, acumulacion de gradientes de 32 pasos (batch efectivo de 256), longitud maxima de contexto de 2048 tokens y semilla 3. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB.

El identificador del modelo indica que se trata de la semilla 3 de tres semillas de entrenamiento para esta misma configuracion, lo que sugiere un interes en estudiar la variabilidad del ajuste. No se especifica el numero total de tokens procesados, la composicion exacta del subconjunto feroes ni si se aplicaron tecnicas de empaquetado de secuencias o filtrado adicional. Tampoco se documenta el uso de RLHF, DPO u otras etapas de alineacion posteriores al CPT. La ausencia de estos detalles limita la reproducibilidad exacta del experimento, aunque los hiperparametros principales si estan publicados.

## Capacidades

- Generacion de texto en feroes: el ajuste busca mejorar la produccion y el modelado de este idioma sobre la base del SmolLM2-135M-Instruct.
- Generacion de texto instructivo: hereda el formato conversacional del modelo base, etiquetado como `conversational`.
- Razonamiento basico y respuesta a instrucciones: capacidades limitadas por el tamano de 135M parametros del modelo original.
- Soporte multilingue residual: el modelo base es multilingue, pero el ajuste se centra en feroes y no se documenta el efecto sobre otros idiomas.
- Integracion con transformers y text-generation-inference: el modelo es compatible con pipelines estandar de Hugging Face.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas; el tamano del modelo hace poco probable un rendimiento robusto en estos escenarios.
- Vision, audio o modos especiales (thinking mode): no disponibles.

## Casos de uso

- Investigacion en lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar como el CPT afecta a un modelo instructivo pequeno en feroes, comparando las tres semillas de entrenamiento publicadas por el autor.
- Generacion de texto feroes para prototipos: util para crear borradores, resumenes o textos sinteticos en feroes en entornos de experimentation donde el coste computacional es critico (0,3 GB de pesos).
- Aumento de datos para PLN feroes: el modelo puede generar corpus sinteticos en feroes que alimenten otros sistemas de procesamiento del lenguaje, siempre con revision humana dada la falta de evaluacion.
- Educacion y divulgacion: demostracion practica de un pipeline de continued pre-training sobre FineWeb-2, reproducible en una sola GPU A100 de 40 GB.
- Despliegue en dispositivos con recursos limitados: con 134,5M de parametros, es viable en CPU o GPUs de gama baja para tareas de generacion de texto simple, aunque sin garantias de calidad en feroes.
- Experimentos de comparacion de semillas: al existir tres semillas de la misma configuracion, permite analizar la varianza del ajuste en tareas de generacion feroesa.
- Base para ajuste supervisado posterior: puede servir como inicializacion para un SFT o DPO especifico de feroes si se dispone de datos anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "has not been evaluated more broadly yet", por lo que no existen metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de feroes.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los 134,5M de parametros ocupan aproximadamente 0,27 GB, por lo que la inferencia cabe en menos de 1 GB de VRAM incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento reportado uso una A100 de 40 GB, pero la inferencia no requiere hardware de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (segun tags), y potencialmente llama.cpp u Ollama si se generan conversiones a GGUF, aunque no se publican en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-seed3 | 134,5M | 2048 | Feroes (objetivo) | Apache 2.0 | No |
| HuggingFaceTB/SmolLM2-135M-Instruct | 134,5M | 8192 (segun model card del base) | Multilingue | Apache 2.0 | Si, en la model card del base |
| Otros ajustes CPT de SmolLM2-135M | 134,5M | Variable | Segun idioma | Apache 2.0 | No disponible |

La comparacion principal es con el modelo base: el ajuste feroes hereda su tamano y licencia, pero reduce el contexto efectivo de entrenamiento a 2048 tokens y no aporta evaluaciones. No se dispone de informacion sobre otros modelos feroeses comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sin evaluacion publicada: el autor indica que el modelo no ha sido evaluado ampliamente, por lo que no hay garantias de calidad en feroes ni de regresion en otros idiomas.
- Riesgo de olvido catastrofico: el CPT sobre un unico idioma puede degradar las capacidades instructivas y multilingues originales del SmolLM2-135M-Instruct; no se documenta ninguna mitigacion.
- Sesgos: al entrenarse sobre texto web de FineWeb-2, puede heredar sesgos presentes en la web feroesa; no se han realizado analisis de sesgo.
- Alucinacion: como todo modelo generativo pequeno, es propenso a inventar contenido, especialmente con un corpus de ajuste limitado y sin evaluacion humana.
- Limitacion de contexto: 2048 tokens es una ventana reducida para tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que el modelo es para su investigacion; conviene revisar la licencia del dataset FineWeb-2 y del modelo base antes de un despliegue comercial.
- Caveat de produccion: no se recomienda su uso en produccion sin una evaluacion especifica del dominio y del idioma feroes.
- Idioma: el tag de idioma es unicamente `fo`; el comportamiento en castellano u otros idiomas no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-seed3
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
