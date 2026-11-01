# cyttic/hmt-htrvt-stroke2-s42

## Resumen

`cyttic/hmt-htrvt-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint experimental perteneciente a un estudio de aumentación de datos denominado `htr-metrics-transfer` (oleada 1), en el que se entrena un modelo base llamado `htrvt` con distintas estrategias de aumentación y semillas. En este caso concreto, la variante de aumentación es `stroke2` y la semilla es 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito a secuencia de caracteres mediante un cabezal CTC (*Connectionist Temporal Classification*), lo que evita la necesidad de alineaciones explícitas entre imagen y transcripción. Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación más que a despliegue en producción.

Su relevancia es acotada: no es un modelo generalista ni multilingüe, sino una pieza de un conjunto de experimentos reproducibles para medir la transferencia de métricas HTR bajo distintas condiciones de aumentación. El idioma declarado es hebreo (`he`) y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cabezal CTC sobre un modelo base denominado `htrvt`; el tipo de backbone no se especifica) |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una arquitectura con cabezal CTC para la decodificación de secuencias de caracteres a partir de imágenes de texto manuscrito. El backbone concreto del modelo base `htrvt` no se detalla en la model card; solo se especifica el nombre del componente y el mecanismo de salida (CTC). No se dispone de datos sobre número de capas, dimensión oculta, mecanismo de atención ni tipo de extractor visual.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (*dev writers*). La variante corresponde a la aumentación `stroke2` con semilla 42, dentro de la oleada 1 del estudio `htr-metrics-transfer`. No se documentan en la información proporcionada el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco probables en un modelo HTR). La evaluación se realizó sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0608 y WER 0,2762.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Decodificación CTC greedy, sin necesidad de modelo de lenguaje externo en la evaluación reportada.
- Salida a nivel de carácter y de palabra (se reportan métricas CER y WER).
- Entrenado específicamente sobre un split con separación por escritores, lo que permite evaluar generalización a escritores no vistos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- No se documentan capacidades multilingües más allá del hebreo.

## Casos de uso

- Investigación en aumentación de datos para HTR: el checkpoint sirve como punto de comparación reproducible (semilla 42, aumentación `stroke2`) frente a otras variantes del mismo estudio, permitiendo aislar el efecto de la aumentación sobre CER y WER.
- Transcripción de manuscritos hebreos en archivos históricos: con un CER de 0,0608 en el test HHD Option-B, es adecuado para flujos de digitalización asistida donde se requiere revisión humana posterior.
- Evaluación de robustez frente a escritores no vistos: al haberse entrenado excluyendo los escritores de desarrollo, permite medir la generalización a nuevas manos en un pipeline de validación.
- Baseline para experimentos de decodificación: al reportarse resultados con decodificación greedy y sin LM, sirve como referencia para cuantificar la mejora que aporta un modelo de lenguaje en la corrección de hipótesis CTC.
- Reproducción de estudios de transferencia de métricas: el modelo y el `results.json` asociado permiten replicar el protocolo `htr-metrics-transfer` en otros dominios o idiomas.
- Prototipado académico de sistemas HTR de bajo coste: con 13,8 M de parámetros y 0,1 GB de pesos, puede ejecutarse en hardware modesto para pruebas de concepto en laboratorio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Condiciones |
|---|---|---|---|
| HHD Option-B test | CER | 0,0608 | Decodificacion greedy, sin LM |
| HHD Option-B test | WER | 0,2762 | Decodificacion greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que por otra parte no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,8 M de parámetros en safetensors, el peso de los pesos en fp32 ronda los 55 MB y en fp16 unos 28 MB, por lo que la VRAM dominante será la del procesamiento de imágenes y activaciones, no la de los parámetros.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, aunque no se documenta.
- ¿Cabe en GPU de consumo? Sí, por el reducido número de parámetros (13,8 M), aunque no se especifican requisitos oficiales.
- Opciones de despliegue: no disponibles; al ser un modelo CTC específico de HTR, no es compatible directamente con servidores de LLM como vLLM, TGI u Ollama, que asumen arquitecturas de lenguaje autoregresivas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos HTR comparables ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigación: forma parte de un estudio de aumentación (`htr-metrics-transfer`, oleada 1) y no está pensado como producto final.
- Idiomas: solo se declara hebreo (`he`); no hay evidencia de soporte para otros idiomas.
- Sesgos: no documentados; al entrenarse sobre un split con escritores concretos, puede presentar sesgo hacia estilos caligráficos presentes en `cyttic/hhd-optionb-split`.
- Alucinación: en HTR el riesgo se manifiesta como sustituciones, inserciones y omisiones de caracteres; el WER de 0,2762 indica que aproximadamente una de cada cuatro palabras presenta algún error en el test reportado, por lo que se recomienda revisión humana.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni condiciones adicionales más allá de la licencia estándar.
- Ausencia de modelo de lenguaje en la evaluación: los resultados reportados (CER 0,0608, WER 0,2762) corresponden a decodificación greedy sin LM; en producción con LM los números podrían variar y no se han publicado.
- Sin datos de cuantización, contexto ni pipeline: no es posible planificar un despliegue en producción sin información adicional del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-stroke2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, dentro del repositorio del modelo)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
