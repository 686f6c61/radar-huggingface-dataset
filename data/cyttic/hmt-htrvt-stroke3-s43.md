# cyttic/hmt-htrvt-stroke3-s43

## Resumen

`cyttic/hmt-htrvt-stroke3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura CTC y publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se comparan distintas estrategias de aumento sobre un mismo pipeline de reconocimiento. La variante concreta que nos ocupa usa el modelo base `htrvt`, el aumento `stroke3` y la semilla 43.

El modelo está especializado en hebreo (`he`) y cuenta con 13.821.574 parámetros, un tamaño muy contenido que lo sitúa en la categoría de modelos ligeros para tareas de visión documental. Se distribuye en formato `safetensors` con licencia MIT, lo que facilita su uso comercial y su integración en pipelines de digitalización de documentos.

Su relevancia es acotada pero concreta: no es un modelo de propósito general, sino un artefacto de investigación reproducible dentro de un estudio comparativo de aumentos. Sirve como referencia para quienes trabajan en HTR de hebreo y quieren evaluar el impacto de técnicas de aumento como `stroke3` sobre métricas CER/WER. El modelo reporta un CER de 0,0596 y un WER de 0,2721 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, HTR) |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo sigue un esquema CTC (*Connectionist Temporal Classification*), habitual en reconocimiento de texto manuscrito porque permite alinear secuencias de imagen con secuencias de caracteres sin necesidad de segmentación explícita. El nombre del modelo (`htrvt`) sugiere una variante de arquitectura para HTR, aunque la model card no detalla la topología interna (si es CNN + transformer, un transformer puro con atención visual, o un híbrido). No se especifican el número de tokens de entrenamiento ni la composición del dataset más allá de la referencia al split.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, concretamente sobre el conjunto de train menos los escritores reservados para desarrollo. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. La innovación metodológica del trabajo no está en la arquitectura sino en el estudio de aumentos: esta variante aplica el aumento `stroke3` con semilla 43, y los resultados se comparan contra otras variantes del mismo estudio. No se menciona uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de documentos.
- Decodificación CTC greedy sobre secuencias de caracteres.
- Funciona sin modelo de lenguaje externo, lo que simplifica el despliegue.
- Especializado en un único idioma (`he`), sin capacidades multilingües declaradas.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión general, audio ni modo *thinking*.
- No se documentan capacidades de generación de texto libre, código o matemáticas.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas de documentos históricos o administrativos en hebreo, aprovechando su especialización en HTR y su licencia MIT para uso institucional.
- Reproducción de experimentos de aumento de datos: investigadores pueden reentrenar o evaluar esta variante concreta (`stroke3`, semilla 43) para comparar contra otras configuraciones del estudio `htr-metrics-transfer` y validar la transferencia de métricas entre aumentos.
- Construcción de líneas base para HTR de hebreo: al reportar CER y WER sobre un test concreto (HHD Option-B), sirve como referencia para nuevos modelos que quieran medirse contra el mismo protocolo.
- Integración en pipelines de OCR/HTR con presupuesto de cómputo reducido: con ~13,8 M de parámetros y un repo de 0,1 GB, puede desplegarse en entornos con recursos limitados donde un modelo grande no es viable.
- Preprocesado para búsqueda documental: transcribir manuscritos hebreos para indexar su contenido y permitir búsqueda por texto sobre colecciones escaneadas.
- Evaluación de robustez frente a estilos de escritura: al haberse entrenado excluyendo escritores de dev, permite estudiar la generalización a escritores no vistos en el conjunto de test.
- Investigación en decodificación sin LM: útil para estudiar el techo de rendimiento de un sistema CTC puro antes de añadir un modelo de lenguaje, dado que los resultados reportados son sin LM.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del test HHD Option-B con decodificación greedy y sin modelo de lenguaje:

| Benchmark | Métrica | Valor |
|---|---|---|
| HHD Option-B (test) | CER | 0,0596 |
| HHD Option-B (test) | WER | 0,2721 |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni métricas adicionales (por ejemplo, con LM o sobre otros conjuntos).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 55 MB, y en fp16 unos 28 MB. La VRAM real dependerá del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos cientos de MB libres, incluidas GTX 1650, RTX 3060 y superiores.
- Opciones de despliegue: al ser un modelo CTC de HTR, no es directamente compatible con servidores de LLM como vLLM, TGI u Ollama. Requiere un runtime de inferencia de visión (PyTorch, ONNX Runtime) con la lógica de preprocesado de imágenes y decodificación CTC del proyecto original.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las variantes del mismo estudio (`htrvt` con otros aumentos y semillas) serían las alternativas naturales, pero sus métricas no se incluyen en esta ficha. Por tanto:

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-stroke3-s43 | 13,8 M | no disponible | 0,0596 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en un único idioma (hebreo); no debe esperarse rendimiento en otros idiomas.
- Entrenado para HTR sobre un dataset concreto (`hhd-optionb-split`); la generalización a otros dominios, caligrafías o calidades de escaneo no está documentada.
- El WER reportado (0,2721) es considerablemente más alto que el CER, lo que indica que los errores afectan a palabras completas; en producción conviene validar sobre el dominio objetivo.
- Los resultados publicados son sin modelo de lenguaje; añadir un LM podría mejorar el WER, pero no se reportan cifras al respecto.
- Riesgo de alucinación inherente a los sistemas CTC: pueden producirse sustituciones o inserciones de caracteres, especialmente en regiones de imagen ruidosas.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto limitado de escritores, puede infrarepresentar estilos de escritura no presentes en el corpus.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías; conviene revisar el `results.json` y el repositorio del estudio para conocer el protocolo exacto de evaluación.
- Repo con 0 descargas y 0 likes en el momento de la consulta: es un artefacto de investigación reciente, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-stroke3-s43
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
