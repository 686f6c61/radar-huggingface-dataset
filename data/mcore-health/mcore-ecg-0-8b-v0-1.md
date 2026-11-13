# MCORE-HEALTH/MCore-ECG-0.8B-v0.1

## Resumen

MCore-ECG-0.8B-v0.1 es un modelo multimodal experimental desarrollado por MCORE-HEALTH, derivado mediante fine-tuning de Qwen/Qwen3.5-0.8B. Su tarea es generar informes en inglés a partir de imágenes de electrocardiogramas (ECG) de 12 derivaciones, combinando percepcion visual con generacion de texto clinico estructurado. Se trata de un piloto de investigacion cuyo objetivo es evaluar hasta que punto un modelo compacto de menos de mil millones de parametros puede abordar una tarea medica especializada.

El modelo emplea la arquitectura de Qwen3.5 (capa `qwen3_5` en Transformers) con adaptacion multimodal image-text-to-text y cuenta con 1.107.265.600 parametros totales segun los pesos en safetensors. Se distribuye en FP16 safetensors y en un build GGUF F16 acompañado de su proyector visual (`mmproj`), lo que facilita su ejecucion en entornos locales compatibles con inferencia multimodal de Qwen3.5.

Su relevancia radica en la publicacion de pesos abiertos bajo licencia Apache 2.0 para una tarea de alto interes clinico, acompañados de una comparacion exploratoria frente a modelos propietarios (GPT-6.1 Terra y GPT-6 Luna) sobre un cohorte de 500 ECG de PTB-XL. Los resultados son descriptivos, no validados clinicamente, y el autor insiste en el caracter exclusivamente investigador del piloto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5 (image-text-to-text) |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (safetensors) y F16 (GGUF); no se documentan otras |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16), GGUF F16 + mmproj (proyector visual) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5, y conserva su proyector visual para procesar imagenes. La adaptacion al dominio ECG se realizo mediante fine-tuning supervisado sobre el split `train` del dataset MCore-ECG-Pilot-v0.1, cuyos ECG provienen de PTB-XL 1.0.3 renderizados como imagenes de 12 derivaciones. Los textos objetivo del entrenamiento son sinteticos, con revision cualitativa de algunas salidas pero sin revision clinica exhaustiva segun el autor.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el interes del modelo reside en la adaptacion de un backbone compacto a una modalidad medica especializada.

## Capacidades

- Generacion de informes en ingles a partir de imagenes de ECG de 12 derivaciones, incluyendo una valoracion global, hallazgos y limitaciones identificadas.
- Evaluacion global normal/anormal (clasificacion NORM frente a non-NORM) extraible del texto generado.
- Procesamiento de imagenes renderizadas de trazados ECG (validado sobre imagenes de PTB-XL).
- Capacidades heredadas del backbone Qwen3.5 en generacion de texto, razonamiento basico y comprension de instrucciones, no documentadas de forma especifica en la model card.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion sobre generacion de informes ECG automaticos: el modelo sirve como linea base abierta para estudiar la viabilidad de modelos compactos en la descripcion de trazados de 12 derivaciones.
- Evaluacion comparativa frente a modelos propietarios: permite reproducir experimentos con cohortes de PTB-XL y comparar la concordancia normal/anormal con sistemas cerrados.
- Prototipado de asistentes de lectura de ECG en entornos de investigacion: util para explorar interfaces donde el clinico revisa un borrador de informe generado a partir de la imagen.
- Docencia y formacion: puede generar descripciones estructuradas de trazados de ejemplo para discusion en entornos academicos, siempre con supervision experta.
- Generacion de datasets sinteticos de texto ECG: las salidas pueden servir para aumentar corpus de investigacion tras filtrado y revision manual.
- Despliegue local en entornos con recursos limitados: al ser un modelo de ~1,1B de parametros y ofrecer GGUF F16, puede ejecutarse en estaciones de trabajo modestas para pruebas de concepto.
- Estudio de sesgos y errores en IA medica: su tamano reducido y sus pesos abiertos facilitan analisis de fallos y auditorias reproductibles.

## Benchmarks y rendimiento

El autor publica una comparacion exploratoria sobre 500 ECG de pacientes excluidos del fine-tuning (250 NORM y 250 non-NORM, seleccionados previamente a la generacion de respuestas). La metrica es la concordancia de la valoracion global normal/anormal extraida del informe frente a la etiqueta PTB-XL; las salidas indeterminadas o fallidas cuentan como desacuerdo.

| Modelo | Concordancia global | 250 ECG normales | 250 ECG anormales |
|---|---:|---:|---:|
| MCore ECG 0.8B | 367/500 · 73,4% | 189/250 · 75,6% | 178/250 · 71,2% |
| GPT-6.1 Terra · medium | 363/500 · 72,6% | 129/250 · 51,6% | 234/250 · 93,6% |
| GPT-6 Luna · medium | 354/500 · 70,8% | 133/250 · 53,2% | 221/250 · 88,4% |

MCore obtiene mayor concordancia en ECG normales, mientras que los modelos propietarios la obtienen en anormales. La diferencia global entre MCore y Terra es de cuatro casos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2,2 GB solo para pesos, mas la memoria del proyector visual y de las activaciones; un presupuesto practico de 4 a 6 GB permite trabajar con imagenes de resolucion moderada.
- VRAM estimada con GGUF F16: similar a FP16; no se ofrece build de menor precision documentado, por lo que no se puede reducir mas alla de F16 sin cuantizar por cuenta propia.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) resulta suficiente; en entornos profesionales, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en toda la gama media actual.
- Opciones de despliegue: Transformers con version de Torchvision compatible con PyTorch (requisito indicado por el autor), y runtimes que soporten inferencia multimodal de Qwen3.5 para el GGUF junto con `mmproj-MCore-ECG-0.8B-F16.gguf`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCore ECG 0.8B | ~1,1B | no disponible | Informes de ECG desde imagen | Apache 2.0 | Pesos abiertos en HF |
| GPT-6.1 Terra (medium) | no disponible | no disponible | Multimodal generalista | Propietaria | API (OpenRouter) |
| GPT-6 Luna (medium) | no disponible | no disponible | Multimodal generalista | Propietaria | API (OpenRouter) |

En la comparacion exploratoria del autor, MCore logra mayor concordancia en ECG normales (75,6% frente a 51,6% y 53,2%) y menor en anormales (71,2% frente a 93,6% y 88,4%), con una concordancia global ligeramente superior. No se dispone de comparaciones con otros modelos abiertos especializados en ECG en la informacion disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de investigacion: el autor declara que su idoneidad para diagnostico, triaje o decision clinica no esta establecida.
- Puede omitir anomalias o reportar hallazgos y medidas no respaldados por el trazado.
- Los textos de entrenamiento son sinteticos y la revision clinica exhaustiva de las salidas sigue pendiente.
- La evaluacion se limita a imagenes renderizadas de PTB-XL; no se ha probado con fotografias, escaneos, otros formatos, dispositivos ni poblaciones distintas.
- Cohorte de evaluacion pequena (500 ECG) y con seleccion previa por criterios de calidad y balance de clases; los resultados son descriptivos, no concluyentes.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion en terminos y medidas clinicas inherente a modelos de este tamano y a la generacion de texto libre.
- Aunque la licencia Apache 2.0 permite uso comercial, el propio autor desaconseja implicitamente el uso clinico por la falta de validacion; cualquier despliegue en produccion sanitaria requeriria validacion regulatoria adicional.
- No se documentan sesgos poblacionales especificos, pero PTB-XL no representa necesariamente a todas las poblaciones.
- Contexto maximo no documentado: conviene no asumir ventanas largas en prompts complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MCORE-HEALTH/MCore-ECG-0.8B-v0.1
- Dataset de fine-tuning: https://huggingface.co/datasets/MCORE-HEALTH/MCore-ECG-Pilot-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PTB-XL 1.0.3 en PhysioNet: https://physionet.org/content/ptb-xl/1.0.3/
- Articulo PTB-XL (Wagner et al., 2020): https://doi.org/10.1038/s41597-020-0495-6
- Registro del dataset PTB-XL 1.0.3: https://doi.org/10.13026/kfzx-aw45
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0 (datos de origen): https://creativecommons.org/licenses/by/4.0/
