# cyttic/hmt-htrvt-elastic4-s43

## Resumen

`cyttic/hmt-htrvt-elastic4-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado por el equipo cyttic dentro de un estudio de aumento de datos denominado `htr-metrics-transfer`. El modelo resuelve la transcripción de imágenes de escritura manual a texto en hebreo, empleando una arquitectura CTC con un backbone de tipo `htrvt` y un esquema de aumentación de datos identificado como `elastic4`, con semilla 43.

Se trata de un checkpoint de investigación (13,8 millones de parámetros, 0,1 GB en safetensors) pensado para medir la transferencia de métricas bajo distintas configuraciones de aumentación, no un modelo de propósito general. Su relevancia es acotada: sirve como referencia reproducible para comparar variantes de aumentación en HTR hebreo y para validar pipelines de evaluación con CER y WER sobre el conjunto HHD Option-B.

El modelo se entrenó sobre el split de entrenamiento de `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, y se evaluó con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0858 y WER 0,3646 en el test HHD Option-B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre backbone `htrvt` (no se detalla la topología interna) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de reconocimiento de secuencias con función de pérdida CTC (*Connectionist Temporal Classification*), lo que permite alinear imágenes de texto manuscrito con transcripciones sin necesidad de segmentación a nivel de carácter. El backbone se identifica como `htrvt`, aunque la model card no detalla su composición interna (número de capas, dimensión oculta, tipo de atención o si incorpora componentes convolucionales).

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo a los escritores reservados para desarrollo, con el objetivo de evitar fuga de información entre escritores. La variante corresponde a la aumentación `elastic4` con semilla 43, dentro de un barrido sistemático de configuraciones de aumentación. La evaluación se hizo con decodificación greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento acústico-visual del modelo del aportado por un LM de corrección.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes.
- Reconocimiento a nivel de línea o región de texto, condicionado por el formato del dataset HHD.
- Salida de secuencias de caracteres mediante decodificación CTC greedy.
- Evaluación cuantificable mediante CER y WER, orientada a estudios comparativos de aumentación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión general más allá del HTR.
- No se documentan modos de *thinking*, audio ni otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos escritos a mano, siempre que el dominio visual se parezca al del dataset HHD; su licencia MIT facilita la integración en proyectos de archivo.
- Estudio de ablación de aumentación de datos: sirve como punto de comparación fijo (semilla 43, `elastic4`) frente a otras variantes del estudio `htr-metrics-transfer` para medir el efecto de la aumentación en CER y WER.
- Validación de pipelines de evaluación HTR: al publicarse métricas concretas (CER 0,0858, WER 0,3646) con decodificación greedy y sin LM, se puede usar como referencia para verificar que un harness de evaluación reproduce resultados.
- Baseline para HTR en hebreo: un investigador puede partir de este checkpoint para afinar sobre un corpus propio de escritores no vistos, aprovechando que el entrenamiento excluyó escritores de desarrollo.
- Corrección y posprocesado con LM: dado que el modelo se evaluó sin modelo de lenguaje, es un candidato natural para medir la ganancia de acoplar un LM hebreo sobre la salida CTC en tareas de transcripción.
- Investigación sobre generalización entre escritores: el diseño del split (exclusión de escritores de dev) permite estudiar el comportamiento del modelo ante escritores no vistos en entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test | CER | 0,0858 |
| HHD Option-B test | WER | 0,3646 |

Condiciones de evaluación: decodificación greedy, sin modelo de lenguaje. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 13,8 millones de parámetros; en la práctica, el cuello de botella es la imagen de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 ejecutarían el modelo sin problemas, aunque las GPU de gama alta no aportan ventaja significativa por el tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con `transformers` o `safetensors`; no se documenta integración con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a CTC de HTR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de otras variantes del estudio `htr-metrics-transfer` con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de un estudio de aumentación, no un producto validado para producción.
- Idiomas: únicamente hebreo (`he`); no se ha entrenado ni evaluado en otros idiomas.
- Dominio: entrenado sobre el dataset `cyttic/hhd-optionb-split`; el rendimiento fuera de ese dominio (otras fuentes, épocas, estilos de escritura o caligrafías) no está documentado.
- WER elevado: 0,3646 en el test HHD Option-B indica una tasa de error por palabra considerable, coherente con la ausencia de modelo de lenguaje en la decodificación.
- Alucinación: en CTC la salida está restringida al vocabulario de caracteres, pero pueden producirse sustituciones, omisiones e inserciones en textos degradados.
- Sesgos: no documentados; el modelo puede heredar sesgos de los escritores y del corpus de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte.
- Sin datos de cuantización ni de despliegue en servidores de inferencia de alto rendimiento; el usuario debe construir su propio pipeline de preprocesado de imagen.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-elastic4-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo
- Paper, blog o demo: no disponible en la información proporcionada
