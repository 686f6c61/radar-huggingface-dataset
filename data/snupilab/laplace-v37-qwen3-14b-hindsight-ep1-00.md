# snupilab/laplace-v37-qwen3-14b-hindsight-ep1.00

## Resumen

Laplace v3.7 Qwen3-14B (hindsight-guided, epoch 1.00) es un ajuste supervisado (SFT) del modelo Qwen3-14B de Alibaba, desarrollado por snupilab, especializado en pronostico de eventos binarios. A diferencia de un modelo conversacional generico, recibe como entrada una pregunta, sus criterios de resolucion, una fecha de pronostico y evidencia recuperada disponible cronologicamente, y devuelve una probabilidad calibrada en el rango [0,1] para el evento planteado.

El modelo parte de la arquitectura transformer decoder-only de Qwen3-14B, con 14.768.307.200 parametros totales (no es un modelo MoE, por lo que no hay parametros activos diferenciados), y pesos en safetensors. El entrenamiento se realizo sobre el dataset privado `snupilab/laplaces-demon-forecasting-traces_v2`, usando razonamiento y objetivos `hindsight-guided`, con dos epocas completas, semilla 0, tamano de lote efectivo 16 y longitud maxima de secuencia de 8.192 tokens.

Su relevancia actual reside en el enfoque: en lugar de optimizar solo perdida de lenguaje, se evalua con metricas propias de la prediccion probabilisticamente calibrada (Brier score, ECE, AUROC) sobre 304 preguntas y 1.144 filas de instancia con 8 generaciones por fila. El checkpoint publicado es el paso 528 (epoca 1,004 de 2), seleccionado de forma retrospectiva sobre el conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha; el entrenamiento uso secuencias de 8.192 tokens y la evaluacion `max_model_len=12.288` |
| Tipos de cuantizacion | No disponibles en la informacion proporcionada; el repositorio publica pesos en safetensors |
| Idiomas soportados | No disponibles en la ficha (hereda del modelo base Qwen3-14B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint Qwen3-14B, un transformer decoder-only con mecanismos de atencion estandar de Qwen3. El repositorio ocupa 29,5 GB, coherente con pesos en bfloat16 (2 bytes por parametro sobre 14,77 mil millones de parametros). No se documenta ninguna modificacion estructural, decodificacion especulativa ni atencion lineal especifica de este fine-tuning; las innovaciones se concentran en el formato de prompt, el pipeline de datos y el objetivo de entrenamiento.

El entrenamiento empleo `DeepSpeed ZeRO-2 con offload del optimizador a CPU` sobre 2 GPUs, manteniendo pesos maestros fp32 y momentos de Adam fp32. Se ejecutaron 2 epocas con 526 pasos por epoca (1.052 pasos en total), semilla 0 y lote efectivo 16. La receta usa razonamiento y objetivos `hindsight-guided` extraidos del dataset pre-revision `snupilab/laplaces-demon-forecasting-traces_v2` (privado, CC BY-SA 4.0). El checkpoint publicado corresponde al paso 528 (epoca 1.004 de 2). El layout del prompt es critico: la disposicion de los campos (pregunta, criterios de resolucion, fecha de pronostico, informacion recuperada) coincide byte a byte entre entrenamiento y evaluacion, y no debe exponerse evidencia publicada despues de la fecha de pronostico.

## Capacidades

- Pronostico de eventos binarios: genera una probabilidad calibrada en [0,1] a partir de una pregunta y sus criterios de resolucion.
- Modo de razonamiento explicito: soporta `enable_thinking=True`, con una region de pensamiento delimitada por `</think>` separada de la respuesta final.
- Emision de probabilidad estructurada: puede devolver la prediccion dentro de una etiqueta `<answer>`, o mediante formas con nombre (`probability`, `forecast`, `prediction`, `chance`) en porcentaje o decimal.
- Condicionamiento temporal: respeta la fecha de pronostico y la evidencia disponible hasta esa fecha, evitando fuga de informacion futura cuando se construye bien el prompt.
- Integracion de evidencia recuperada: consume texto recuperado por un sistema RAG externo y lo incorpora al razonamiento previo a la estimacion.
- Generacion de texto conversacional: heredada del modelo base, con soporte de plantilla de chat (`apply_chat_template`).
- Salida determinista bajo configuracion fija: en evaluacion, el 100% de las 9.152 generaciones se parsearon correctamente, sin truncamiento (0,0%).
- Tool calling, agentes multi-paso, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Mercados de prediccion: introducir la pregunta de un contrato binario, sus criterios de resolucion y las noticias disponibles hasta la fecha de cierre para obtener una probabilidad calibrada con la que contrastar el precio de mercado.
- Evaluacion de riesgo geopolitico: alimentar al modelo con informes de analistas y hechos fechados para estimar la probabilidad de eventos discretos (ruptura de alto el fuego, sanciones, cambios de gobierno).
- Pronostico electoral: dada una pregunta sobre el resultado de unas elecciones y las encuestas publicadas hasta la fecha de pronostico, obtener una probabilidad binaria util para agregacion en un modelo tipo Bayesian.
- Investigacion en calibracion: usar el modelo como objeto de estudio de tecnicas de calibracion (REL, RES, ECE, descomposicion de Brier) en trabajos academicos sobre prediccion probabilistica.
- Ensamblado de pronosticos: combinar sus estimaciones con las de otros modelos y con predicciones humanas, dados el 100% de parseo estricto y el formato de salida consistente.
- Monitorizacion de riesgo financiero: estimar la probabilidad de eventos corporativos o macroeconomicos discretos (impago, recision tecnica, recorte de tipos) a partir de documentos publicados antes de una fecha de corte.
- Verificacion retrospectiva de replicabilidad: evaluar si un hallazgo cientifico se replicara empleando la evidencia disponible en su fecha de publicacion, replicando el esquema de pronostico retrospectivo con el que se entreno.
- Generacion de datos sinteticos de pronostico: producir justificaciones razonadas junto a la probabilidad, utiles para construir conjuntos de datos de entrenamiento o evaluacion de calibracion.

## Benchmarks y rendimiento

Resultados por pregunta sobre 304 preguntas (1.144 filas de instancia, 8 generaciones por fila, 9.152 generaciones). Tasa base 0,5921, `UNC = 0,2415`. Descomposicion con 10 bins de igual anchura.

| Export | Brier ↓ | REL ↓ | RES ↑ | UNC | ECE ↓ | AUROC ↑ | Tasa de parseo |
|---|---:|---:|---:|---:|---:|---:|---:|
| step 528 (este repositorio) | 0,1888 | 0,0237 | 0,0755 | 0,2415 | 0,1324 | 0,8174 | 100,0% |
| final root, step 1.052 | 0,1894 | 0,0197 | 0,0680 | 0,2415 | 0,1291 | 0,8090 | 100,0% |

Cobertura completa: 304/304 preguntas y 1.144/1.144 filas. La diferencia de Brier entre ambos checkpoints no fue estadisticamente significativa. No hay resultados publicados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 30 GB solo para pesos, mas la cache KV correspondiente a la ventana usada (hasta 12.288 tokens en evaluacion). Se recomiendan GPUs con 40 GB o mas.
- GPUs recomendadas: A100 40/80 GB, H100, o configuraciones multi-GPU (por ejemplo 2x A100 40 GB) con `device_map="auto"`.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) con precision completa. Requiere cuantizacion a 8 bits (aproximadamente 15 GB) o 4 bits (aproximadamente 8 GB) para ajustar en 24 GB, aunque la ficha no documenta cuantizaciones oficiales ni su impacto en la calibracion.
- Opciones de despliegue: transformers (uso documentado en la propia ficha), text-generation-inference (etiqueta `text-generation-inference`) y vLLM. Compatible con HuggingFace Endpoints. No hay soporte GGUF ni Ollama documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion genero 9.152 salidas con `max_tokens=8192` y sin truncamiento, pero no se publican tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| laplace-v37-qwen3-14b-hindsight (este) | 14,77 B | entreno 8.192 tokens; eval 12.288 | Brier 0,1888; ECE 0,1324; AUROC 0,8174 | Apache-2.0 | Publico en HuggingFace |
| laplace-v37-qwen3-8b-hindsight-smoothed-ep1.34 | 8 B (aproximado) | no disponible | No comparable directamente (usa etiquetas corregidas de la revision `e5a27da6fa65`) | no disponible | Publico en HuggingFace |
| laplace-v37-qwen3-8b-evidence-smoothed-ep1.67 | 8 B (aproximado) | no disponible | No comparable directamente (usa etiquetas corregidas de la revision `e5a27da6fa65`) | no disponible | Publico en HuggingFace |
| Qwen/Qwen3-14B (base) | 14,77 B | no disponible en esta ficha | No evaluado con metricas de pronostico en la informacion disponible | Apache-2.0 | Publico en HuggingFace |

La propia model card advierte que los resultados no son directamente comparables con los dos modelos hermanos de 8B, porque estos usan etiquetas corregidas de la revision `e5a27da6fa65`, mientras que esta ficha reporta el conjunto de etiquetas pre-revision.

## Limitaciones y advertencias

- Seleccion retrospectiva del checkpoint: el paso 528 se eligio a posteriori sobre resultados de pronostico del conjunto de test. No hubo conjunto de validacion de pronostico ni regla de parada temprana de pronostico; la validacion durante el entrenamiento midio unicamente perdida de lenguaje. La mejora frente al export final es un resultado observado en este test, no demostrado como generalizable.
- Diferencia no significativa: la diferencia de Brier respecto al export final (1.052) no fue estadisticamente significativa, por lo que no debe asumirse superioridad del paso 528.
- Sensibilidad al prompt: el layout de prompt es critico y debe coincidir byte a byte con entrenamiento y evaluacion. Desviaciones pueden degradar la calidad del pronostico de forma no documentada.
- Riesgo de fuga temporal: exponer evidencia publicada despues de la fecha de pronostico invalida el resultado. La ficha exige filtrar la informacion por fecha.
- Dependencia del parseo: el pipeline de evaluacion puntuo los fallos de parseo con Brier 1,0. En produccion es necesario implementar el mismo parseo estricto (division por el ultimo `</think>`, extraccion de `<answer>` y formas alternativas) y validar que el valor este en [0,1].
- Caveat de dataset: el entrenamiento usa un dataset privado con licencia CC BY-SA 4.0. Esto puede afectar a la redistribucion o al uso comercial de derivados del modelo mas alla de la licencia Apache-2.0 de los pesos.
- Sesgos conocidos: no disponibles en la informacion proporcionada. El modelo hereda los sesgos del corpus de Qwen3-14B y los del conjunto de evidencia recuperada.
- Alucinacion: no se reportan tasas especificas de alucinacion. Al tratarse de un pronosticador, el riesgo principal es un exceso de confianza o una justificacion incorrecta de la probabilidad.
- Idiomas: la ficha no lista idiomas soportados; el ajuste y la evaluacion se realizaron sobre datos en un idioma no especificado, lo que limita extrapolar el rendimiento calibrado a otros idiomas.
- Contexto: aunque el modelo base admite ventanas amplias, el entrenamiento se realizo con 8.192 tokens; no se documenta el comportamiento con entradas mas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snupilab/laplace-v37-qwen3-14b-hindsight-ep1.00
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/snupilab/laplaces-demon-forecasting-traces_v2
- Modelo hermano 8B hindsight smoothed: https://huggingface.co/snupilab/laplace-v37-qwen3-8b-hindsight-smoothed-ep1.34
- Modelo hermano 8B evidence smoothed: https://huggingface.co/snupilab/laplace-v37-qwen3-8b-evidence-smoothed-ep1.67

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: todos los resultados obtenidos eran contenido no relacionado y sin valor tecnico para esta ficha, por lo que se han descartado.
