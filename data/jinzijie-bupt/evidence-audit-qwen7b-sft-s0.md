# jinzijie-bupt/evidence-audit-qwen7b-sft-s0

## Resumen

`evidence-audit-qwen7b-sft-s0` es un adaptador LoRA publicado por el usuario `jinzijie-bupt` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`, un transformer multimodal de 7.000 millones de parametros con capacidad de vision-lenguaje. El adaptador se entrena mediante supervisión fina (SFT) para la tarea de *video temporal grounding* sobre el conjunto de datos Charades-STA, es decir, localizar en el tiempo el fragmento de un video que responde a una consulta textual.

El modelo acompana al articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin et al., 2026), cuyo objetivo es medir y entrenar la dependencia de la evidencia en modelos de localizacion temporal de video: no basta con acertar la respuesta, sino que el modelo debe basarse en la evidencia visual correcta. Este adaptador concreto es la variante SFT del paper (semilla 0) y sirve como referencia base frente a los modelos con control de placebo descritos en el articulo.

El repositorio pesa 0,6 GB y contiene unicamente los pesos del adaptador (no el modelo base), por lo que su uso requiere descargar Qwen2.5-VL-7B-Instruct por separado. La licencia es Apache 2.0. Es un artefacto de investigacion, no un modelo de proposito general listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-7B-Instruct |
| Parametros totales | 7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones habituales) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=16, alpha=32, dropout 0.05 |
| Modulos adaptados | q/k/v/o y gate/up/down (solo en el modelo de lenguaje en las ejecuciones con transformers 4.51) |
| Version de transformers | 4.51 (raiz) y 5.x (`transformers-v5/`, `run-b/`) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa video a 2 fps con un maximo de 768 fotogramas por muestra. El LoRA tiene rango 16, alpha 32 y dropout 0,05, aplicado sobre las proyecciones de atencion (q/k/v/o) y las proyecciones de las MLP (gate/up/down). En las ejecuciones con transformers 4.51 se uso *gradient checkpointing*, lo que provoco que los pesos LoRA de la torre de vision no recibieran gradiente y quedaran a cero; por tanto, esos adaptadores modifican unicamente el modelo de lenguaje. El subdirectorio `run-b/` es una segunda ejecucion con los mismos ajustes sobre transformers 5.

El entrenamiento es SFT supervisado con 2.400 pares del split de entrenamiento de Charades-STA, 300 pasos de optimizador, acumulacion de gradiente 8, tasa de aprendizaje 5e-6 y semilla 0. Se optimiza unicamente la verosimilitud de la respuesta, con los terminos de margen desactivados (de ahi la comparacion con los modelos con control de placebo del paper). El prompt sigue la plantilla `timer1_default` y el entrenador es `code/27_papo_train_qcdro_v3seln_r5.py` del repositorio de codigo.

## Capacidades

- Localizacion temporal de video (*video temporal grounding*): dado un video y una consulta en lenguaje natural, predice el intervalo temporal que responde a la consulta.
- Razonamiento multimodal video-lenguaje heredado de Qwen2.5-VL-7B-Instruct (comprension de imagenes y video, respuesta a preguntas visuales).
- Procesamiento de video a 2 fps con hasta 768 fotogramas por muestra.
- Generacion de texto y respuestas en formato conversacional segun la plantilla `timer1_default`.
- Capacidades de *tool calling*, agentes o *thinking mode*: no disponibles en la informacion proporcionada para este adaptador (dependen del modelo base y no se documentan aqui).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en *video temporal grounding*: usar el adaptador como linea base SFT frente a los modelos con control de placebo del paper para medir la dependencia de la evidencia.
- Auditoria de evidencia visual: emplear los scripts del repositorio `Accuracy-Is-Not-Evidence` con `--model  --adapter <este repo>` para comprobar si el modelo se apoya en el fragmento correcto del video.
- Reproduccion de resultados: ejecutar las tablas y figuras del articulo (Tablas 1, 6, 7, 9-11, 13, 14, 16, 17, 19-21, 23-28, 30, 32, 33 y Figuras 1-5, 11) cargando este adaptador con transformers 4.51.3 y peft 0.20.
- Busqueda semantica en archivos audiovisuales: localizar en un video de vigilancia o de archivo el intervalo que corresponde a una descripcion textual, como paso previo a la extraccion de clips.
- Anotacion asistida de datasets de video: generar propuestas de intervalos temporales sobre Charades-STA u otros corpus similares para acelerar el etiquetado humano.
- Analisis de sesgos de evidencia: comparar la variante SFT con las variantes con control de placebo para estudiar si el modelo acierta por la evidencia visual o por atajos del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* para los numeros concretos de este adaptador, pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM para pesos; el adaptador anade una cantidad marginal (0,6 GB en disco).
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y video de 768 fotogramas; RTX 4090 (24 GB) suficiente para inferencia en bfloat16 con un solo video.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion del modelo base, en GPUs de 16 GB; la cuantizacion del adaptador no se documenta.
- Despliegue: la model card solo documenta carga con `transformers` 4.51.3 + `peft` 0.20.0 (o transformers 5.x con `subfolder="transformers-v5"`) y `qwen-vl-utils`; no se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El coste dominante es el procesamiento de hasta 768 fotogramas de video a 2 fps por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-sft-s0 | 7B (base) + LoRA | no disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible en esta ficha | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Variantes con control de placebo del paper | 7B (base) + LoRA | no disponible | Video temporal grounding | no disponible | Repositorio del paper (no verificado) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigacion para una tarea concreta (Charades-STA); no es un modelo de proposito general.
- En las ejecuciones con transformers 4.51, los pesos LoRA de la torre de vision son cero: el adaptador solo modifica el modelo de lenguaje.
- Cargar el adaptador con la version equivocada de transformers no produce error, pero deja los pesos LoRA sin usar; hay que verificar con `tools/check_lora_keys.py`.
- Riesgo de alucinacion y de dependencia de atajos del dataset: el propio paper mide la dependencia de la evidencia, lo que sugiere que la precision no garantiza que el modelo use la evidencia correcta.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen2.5-VL-7B-Instruct debe verificarse por separado.
- Sin descargas ni likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-qwen7b-sft-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo y scripts de evaluacion: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
