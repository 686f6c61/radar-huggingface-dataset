# cyttic/hmt-htrvt-geom2-s42

## Resumen

`cyttic/hmt-htrvt-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura CTC y publicado por el grupo cyttic. Forma parte de un estudio de aumento de datos (*data augmentation*) denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*), con la variante de modelo `htrvt`, el esquema de aumento `geom2` y la semilla 42. El modelo está entrenado sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo.

Se trata de un modelo pequeno, de 13.821.574 parametros, orientado a una tarea muy concreta: transcribir texto manuscrito en hebreo (`he`). Su relevancia es acotada y experimental: no es un modelo de proposito general, sino un artefacto reproducible de investigacion para medir como distintas estrategias de aumento geometrico afectan a las metricas de reconocimiento. El checkpoint reporta en el conjunto de test HHD Option-B, con decodificacion greedy y sin modelo de lenguaje, un CER de 0,0598 y un WER de 0,2669.

La licencia es MIT y los pesos se distribuyen en formato safetensors, con un tamano de repositorio de aproximadamente 0,1 GB. No se dispone de informacion sobre la longitud de contexto, los tipos de cuantizacion ni la composicion detallada del dataset mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como CTC para HTR) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo usa una cabeza de decodificacion CTC (etiqueta `ctc`), un esquema habitual en reconocimiento de texto manuscrito y de voz, donde la salida es una secuencia de caracteres alineada de forma implicita con la entrada. La model card no detalla el backbone concreto (por ejemplo, si es una CNN, un transformer o una arquitectura hibrida), ni el numero de capas, dimensiones ocultas o mecanismo de atencion. La etiqueta `htrvt` sugiere una variante interna del estudio, pero no se especifica su significado.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, restando los escritores asignados a desarrollo, con el aumento de datos `geom2` y la semilla 42. No se indica el numero de tokens, la composicion del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (poco probables en una tarea HTR). La evaluacion reportada usa decodificacion greedy sin modelo de lenguaje, lo que permite aislar el rendimiento del modelo acustico/visual puro.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de linea o imagen, con salida de secuencia de caracteres mediante CTC.
- Transcripcion sin modelo de lenguaje externo: la decodificacion greedy es suficiente para obtener CER y WER reportados.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al hebreo (`he`); no hay indicios de otros idiomas.
- No se documentan modos especiales como *thinking mode*, vision general, audio u otras modalidades.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir imagenes de texto manuscrito a secuencia de caracteres, adecuado para proyectos de preservacion documental donde el idioma sea hebreo y el dominio similar al corpus HHD.
- Evaluacion de estrategias de aumento de datos: al ser un checkpoint de un estudio controlado (`geom2`, semilla 42), sirve como referencia reproducible para comparar el efecto de distintas aumentaciones sobre CER y WER.
- Baseline en investigacion HTR: con 13,8 M de parametros y licencia MIT, es util como punto de partida ligero para experimentos academicos de reconocimiento de escritura.
- Prototipado de pipelines OCR/HTR en hebreo: su tamano reducido permite integrarlo en entornos con recursos limitados para pruebas de concepto, siempre que se valide el dominio.
- Analisis de sensibilidad a escritores: al haberse excluido escritores de desarrollo del entrenamiento, puede emplearse para estudiar generalizacion entre escritores en corpus hebreos.
- Reproducibilidad de resultados: el repositorio incluye `results.json` segun la model card, lo que facilita replicar las metricas reportadas en entornos de investigacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| HHD Option-B test | CER | 0,0598 | Decodificacion greedy, sin LM |
| HHD Option-B test | WER | 0,2669 | Decodificacion greedy, sin LM |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estandar de proposito general, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 M de parametros, los pesos en fp32 ocupan aproximadamente 55 MB, y en fp16 alrededor de 28 MB, sin contar activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo CTC de HTR, requeriria un *runtime* compatible con la arquitectura concreta (no detallada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de HTR en hebreo con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo experimental de un estudio de aumento de datos; no esta pensado como producto listo para produccion.
- Idiomas limitados al hebreo; no se garantiza funcionamiento en otros idiomas.
- Entrenado sobre un corpus concreto (`hhd-optionb-split`); el rendimiento puede degradarse fuera de ese dominio o con escritores no representados.
- Riesgo de errores de transcripcion: el WER reportado (0,2669) indica que aproximadamente una de cada cuatro palabras presenta errores en el conjunto de test, aunque el CER es bajo (0,0598).
- No se documentan sesgos especificos, pero al ser un corpus acotado pueden existir sesgos de dominio y de estilo de escritura.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar los terminos del dataset de origen (`cyttic/hhd-optionb-split`) antes de un uso comercial.
- No se dispone de informacion sobre cuantizacion, contexto maximo ni requisitos exactos de preprocesado de imagen, lo que complica su integracion directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom2-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales.
