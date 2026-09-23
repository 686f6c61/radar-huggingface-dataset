# AntoniusPerf/runic-ocr-qwen-vl-lora

## Resumen

Runic-OCR es una colección de tres adaptadores LoRA publicados por AntoniusPerf para el reconocimiento automático de inscripciones rúnicas. No se distribuyen pesos completos: son adaptadores PEFT que se montan sobre tres modelos vision-language de Qwen (Qwen2.5-VL-7B-Instruct, Qwen3-VL-8B-Instruct y Qwen3-VL-2B-Instruct) y convierten la fotografía de una inscripción en su transliteración latina siguiendo la convención Rundata. El repositorio ocupa 0,5 GB y se publica bajo licencia MIT.

Los adaptadores se entrenaron con QLoRA (base cuantizada en 4 bits NF4, rango 16, alpha 32, dropout 0,05) y proceden de la tesis de máster de A. Perfilev en la HSE University (2026). El entrenamiento usó exclusivamente imágenes sintéticas generadas con SD3 y ControlNet Canny (~4.600 imágenes), mientras que la evaluación se realizó sobre un conjunto real de 113 líneas anotadas.

Su relevancia es acotada pero clara: cubre una tarea de nicho (epigrafía digital, HTR de alfabetos rúnicos) para la que apenas existen modelos públicos, y lo hace con un coste de adaptación muy bajo sobre modelos base ya disponibles. El precio es una brecha de dominio muy marcada: el mejor adaptador pasa de un 12,03 % de CER en validación sintética a un 54,27 % de CER sobre el conjunto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformers vision-language de Qwen; no incluye pesos base |
| Parametros totales | 7B (qwen25vl-7b), 8B (qwen3vl-8b) y 2B (qwen3vl-2b) según el subdirectorio, correspondientes al modelo base; el adaptador LoRA añade un conjunto reducido de parametros entrenables (r=16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la hereda del modelo base Qwen-VL correspondiente |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 durante el entrenamiento (QLoRA); el adaptador se distribuye sin cuantizar en safetensors y puede fusionarse y recuantizarse |
| Idiomas soportados | no disponible como lista de idiomas; la tarea es transcripcion de inscripciones rúnicas germánicas a transliteracion latina (convencion Rundata) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); no se publican pesos fusionados ni GGUF |
| Biblioteca | peft |
| Subdirectorios | qwen25vl-7b/, qwen3vl-8b/, qwen3vl-2b/ |
| Tamano del repositorio | 0,5 GB |
| Modelos base declarados | Qwen/Qwen2.5-VL-7B-Instruct, Qwen/Qwen3-VL-8B-Instruct, Qwen/Qwen3-VL-2B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango, no una red completa. La configuración es QLoRA: el modelo base se cuantiza en 4 bits NF4 y sobre él se entrenan matrices LoRA con rango 16, alpha 32 y dropout 0,05. El resultado son tres adaptadores independientes, uno por cada modelo base, que se cargan con `PeftModel.from_pretrained` sobre la clase correspondiente de `transformers` (`Qwen2_5_VLForConditionalGeneration` en el ejemplo publicado). La tarea es de imagen a texto: entrada de una fotografía de inscripción, salida de una cadena de transliteración latina en convención Rundata.

Los datos de entrenamiento son íntegramente sintéticos: aproximadamente 4.600 imágenes generadas con Stable Diffusion 3 y ControlNet con preprocesado Canny, lo que permite controlar la forma de las runas pero introduce artefactos propios del generador. La evaluación se hizo sobre un conjunto gold real de 113 líneas, con intervalos de confianza del 95 %. No se documentan en la información disponible fases de RLHF, DPO ni preferencias humanas; tampoco se especifica el número de tokens de entrenamiento ni la composición detallada del corpus de textos rúnicos subyacente.

## Capacidades

- Reconocimiento óptico de caracteres (OCR/HTR) sobre imágenes de inscripciones rúnicas.
- Salida en transliteración latina normalizada según la convención Rundata, no en escritura rúnica.
- Entrada multimodal de imagen más instrucción textual, heredada del modelo base Qwen-VL.
- Despliegue ligero: el adaptador se puede cargar sobre una base en 4 bits, lo que reduce los requisitos de memoria frente a un ajuste completo.
- Tres puntos de operación distintos según el equilibrio tamaño/error (2B, 7B y 8B).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo está ajustado para una tarea de transcripción acotada.
- Capacidades multilingües: no documentadas; el alcance declarado se limita a inscripciones rúnicas germánicas.
- Traducción y análisis lingüístico: el título de la tesis menciona traducción y análisis, pero la model card solo describe transliteración; no hay evidencia publicada de salida traducida.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Catalogación de colecciones epigráficas en museos: el adaptador genera una pretranscripción de cada pieza fotografiada, que el conservador corrige después; con un CER superior al 50 % en material real, el valor está en reducir el trabajo de tecleado inicial, no en sustituir al experto.
- Trabajo de campo arqueológico con hardware modesto: el subdirectorio `qwen3vl-2b` en 4 bits permite ejecutar la transcripción en un portátil o tableta con GPU de gama media, sin conexión, para obtener borradores inmediatos en excavación.
- Enriquecimiento de corpus tipo Rundata: preanotación masiva de fotografías de archivo para después validar manualmente, acelerando la incorporación de inscripciones a bases de datos estructuradas.
- Etiquetado humano en el bucle (human-in-the-loop): usar la salida del modelo como propuesta inicial y registrar las correcciones para construir un conjunto gold mayor que los 113 actuales y reentrenar con datos reales.
- Investigación en HTR y epigrafía digital: sirve como línea base reproducible y como comparación entre tres tamaños de modelo base (2B, 7B, 8B) bajo el mismo pipeline de datos sintéticos.
- Docencia de filología germánica: herramienta de apoyo para que estudiantes comparen su propia transliteración con la propuesta del modelo y discutan los errores típicos.
- Evaluación de robustez dominio sintético vs. real: caso de estudio metodológico sobre el impacto de entrenar exclusivamente con imágenes generadas, replicable con el código publicado.
- Prototipado de pipelines de digitalización documental: integrar el adaptador como primer paso de un flujo que después aplique reglas de normalización Rundata y validación contra léxico conocido.

## Benchmarks y rendimiento

| Subdirectorio | Modelo base | CER validacion sintetica (%) | CER conjunto gold (%) | IC 95 % |
|---|---|---|---|---|
| qwen25vl-7b/ | Qwen/Qwen2.5-VL-7B-Instruct | 12,03 | 54,27 | 48,0–61,3 |
| qwen3vl-8b/ | Qwen/Qwen3-VL-8B-Instruct | 34,69 | 67,86 | 62,2–73,6 |
| qwen3vl-2b/ | Qwen/Qwen3-VL-2B-Instruct | 33,39 | 73,55 | 69,9–77,5 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K ni métricas de OCR generalistas) en la información disponible. La única métrica reportada es el character error rate (CER) sobre validación sintética y sobre un conjunto gold real de 113 líneas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia, no publicada por el autor; los pesos base se cargan en 4 bits NF4 en el ejemplo oficial):
  - `qwen25vl-7b` en 4 bits: ~5,5–7 GB solo pesos; ~10–13 GB con codificador visual, caché KV y activaciones para imágenes de resolución media-alta.
  - `qwen3vl-8b` en 4 bits: ~6–8 GB solo pesos; ~11–14 GB en total.
  - `qwen3vl-2b` en 4 bits: ~2–3 GB solo pesos; ~5–7 GB en total.
- En precisión bf16/fp16 (sin cuantizar): ~15–17 GB para el 7B, ~17–19 GB para el 8B y ~5–6 GB para el 2B, sin contar activaciones.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; válidas para servir los tres adaptadores en paralelo.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan cualquiera de los tres adaptadores en 4 bits con holgura; RTX 4080/4070 Ti (16 GB) cubren el 7B y el 8B en 4 bits; RTX 3060/4070 (12 GB) cubren el 7B en 4 bits con margen ajustado; el adaptador de 2B en 4 bits entra en GPU de 8 GB.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM con soporte de LoRA y de la familia Qwen-VL, TGI si admite el modelo base correspondiente. Para llama.cpp u Ollama hace falta fusionar el adaptador con la base y convertir a GGUF; no hay GGUF publicado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | CER conjunto gold (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Runic-OCR qwen25vl-7b | 7B (base) | OCR rúnico a transliteracion Rundata | no disponible | 54,27 | MIT | HuggingFace |
| Runic-OCR qwen3vl-8b | 8B (base) | OCR rúnico a transliteracion Rundata | no disponible | 67,86 | MIT | HuggingFace |
| Runic-OCR qwen3vl-2b | 2B (base) | OCR rúnico a transliteracion Rundata | no disponible | 73,55 | MIT | HuggingFace |
| Qwen2.5-VL-7B-Instruct sin adaptador | 7B | VLM generalista (OCR generico, VQA) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de HTR/OCR de inscripciones (p. ej. TrOCR ajustado) | no disponible | OCR/HTR | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones cuantitativas frente a modelos externos en la información disponible. La única comparación documentada es interna, entre los tres subdirectorios del propio repositorio: el adaptador sobre Qwen2.5-VL-7B es el mejor en ambos conjuntos (12,03 % sintético, 54,27 % real) y el de 2B el peor, mientras que el de 8B no mejora al de 7B pese a tener más parámetros.

## Limitaciones y advertencias

- Brecha de dominio severa: el CER pasa de 12,03 % en validación sintética a 54,27 % en el conjunto gold real para el mejor adaptador. Más de la mitad de los caracteres son incorrectos en promedio sobre fotografías reales.
- Entrenamiento exclusivamente sintético (SD3 + ControlNet Canny, ~4.600 imágenes): el modelo puede haber aprendido rasgos del generador (texturas, iluminación, geometría de trazo) que no aparecen en fotografías de inscripciones auténticas.
- Evaluación sobre solo 113 líneas: los intervalos de confianza son amplios (por ejemplo, 48,0–61,3 % para el adaptador de 7B), por lo que las diferencias entre subdirectorios deben interpretarse con cautela.
- El escalado no ayuda en este caso: el adaptador de 8B rinde peor que el de 7B, lo que sugiere que el cuello de botella está en los datos, no en la capacidad del modelo.
- Riesgo alto de alucinación: al ser un modelo generativo, puede producir transliteraciones plausibles pero inexistentes, especialmente en runas degradadas o poco frecuentes. No debe usarse sin revisión experta.
- Alcance limitado a transliteración: no se documenta traducción, análisis morfológico ni datación, pese a que el título de la tesis mencione traducción y análisis.
- Cobertura rúnica no especificada: no se detalla qué alfabetos (antiguo fúthark, fúthark joven, variantes anglosajonas), periodos o regiones cubre el conjunto de entrenamiento.
- Idiomas y formato de prompt: no documentados; la integración depende de replicar el `AutoProcessor` del subdirectorio correspondiente.
- Distribución solo como adaptador: obliga a descargar el modelo base (7B, 8B o 2B) y a fusionar o cargar con PEFT; no hay pesos fusionados ni GGUF listos para llama.cpp u Ollama.
- Licencias: el adaptador es MIT, pero el uso comercial está condicionado además por la licencia del modelo base de Qwen, que debe verificarse por separado.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- Resolución temporal de la ficha: el repositorio figura creado y actualizado en septiembre de 2026, con una única revisión, por lo que puede tratarse de un artefacto derivado de un trabajo académico y no de un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AntoniusPerf/runic-ocr-qwen-vl-lora
- Código, datos y tesis: https://github.com/kekys778/RUNIC-OCR
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces obtenidos correspondían a un sitio sin relación con el proyecto y se han descartado.
