# cyttic/hmt-trocrctc-elastic3-s42

## Resumen

`cyttic/hmt-trocrctc-elastic3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic. Se enmarca en un estudio de aumento de datos denominado `htr-metrics-transfer`, en su primera oleada (wave 1), y combina una arquitectura basada en TrOCR con un cabezal CTC para decodificacion sin lenguaje. El modelo tiene 87.279.756 parametros y esta especializado en hebreo (`he`), un idioma con relativamente pocos recursos en el ambito del reconocimiento de escritura manual.

El modelo se entreno sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo a los escritores de desarrollo, y se evaluo sobre el conjunto de test HHD Option-B con decodificacion greedy y sin modelo de lenguaje. Los resultados reportados son CER 0.0965 y WER 0.4027. Su relevancia es fundamentalmente experimental: sirve como punto de referencia reproducible (seed 42, aumento `elastic3`) para estudiar la transferencia de metricas en HTR, mas que como modelo listo para produccion.

La ficha se basa unicamente en la informacion publicada en Hugging Face y en la model card; no se dispone de documentacion adicional sobre arquitectura interna, datos de entrenamiento detallados ni benchmarks comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabezal CTC (denominacion `trocrctc` en la model card); detalle interno no disponible |
| Parametros totales | 87.279.756 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo como `trocrctc`, lo que sugiere una base TrOCR (Transformer para reconocimiento optico de caracteres, con encoder de vision y decoder de texto) adaptada con un cabezal de Connectionist Temporal Classification (CTC). La decodificacion reportada es greedy y sin modelo de lenguaje, lo que implica que la salida se obtiene directamente de las probabilidades por fotograma del cabezal CTC.

El entrenamiento se realizo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo a los escritores del split de desarrollo, con un aumento de datos de tipo `elastic3` y semilla 42. No se especifican el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de ajuste fino adicionales. La evaluacion se hizo sobre el test HHD Option-B con las metricas CER (Character Error Rate) y WER (Word Error Rate).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes de lineas o documentos.
- Decodificacion CTC greedy sin modelo de lenguaje externo.
- Salida a nivel de caracteres y palabras, evaluable mediante CER y WER.
- Entrenado con aumento de datos elasticos (`elastic3`), lo que puede aportar robustez ante deformaciones geometricas de la escritura.
- No se documentan capacidades de tool calling, agentes, vision general, audio ni modo de razonamiento.
- No se documentan capacidades multilingues mas alla del hebreo.

## Casos de uso

- Investigacion en HTR: servir como punto de referencia reproducible (seed 42, aumento `elastic3`) para comparar el efecto de distintas estrategias de aumento de datos sobre CER y WER.
- Transcripcion de manuscritos hebreos historicos: el modelo puede procesar imagenes de lineas manuscritas y generar transcripciones, util para digitalizacion de archivos con supervision humana posterior.
- Evaluacion de transferencia de metricas: al formar parte del estudio `htr-metrics-transfer`, se puede usar para analizar como se transfieren las metricas entre splits y escritores.
- Generacion de lineas base en pipelines de HTR: dado su CER de 0.0965 en el test HHD Option-B, puede actuar como baseline frente a modelos con modelo de lenguaje o decodificacion beam search.
- Prototipado de sistemas de lectura de documentos hebreos: con licencia MIT y pesos en safetensors, es facil de integrar en experimentos academicos o pruebas de concepto.
- Analisis de robustez ante deformaciones: al haberse entrenado con aumento elastico, permite estudiar el impacto de este tipo de aumento en la precision sobre escritores no vistos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0.0965 | Test HHD Option-B, decodificacion greedy, sin LM |
| WER | 0.4027 | Test HHD Option-B, decodificacion greedy, sin LM |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 87,3 M de parametros en precision completa (fp32) serian aproximadamente 0,35 GB de pesos, y en fp16 alrededor de 0,17 GB, a lo que habria que sumar el encoder de vision y las activaciones.
- GPU recomendadas: no disponible; por tamano, el modelo cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible; los pesos estan en safetensors, por lo que se puede cargar con la libreria de Transformers si la arquitectura es compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de benchmarks frente a alternativas.

## Limitaciones y advertencias

- Modelo experimental de un estudio de aumento de datos; no esta pensado como solucion de produccion.
- Entrenado exclusivamente en hebreo; no se espera buen rendimiento en otros idiomas.
- WER de 0.4027 en el test reportado, lo que indica una tasa de error por palabra elevada pese al CER relativamente bajo.
- Evaluacion con decodificacion greedy y sin modelo de lenguaje; un LM o beam search podrian mejorar los resultados, pero no se reportan.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias del autor.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere escasa validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic3-s42
