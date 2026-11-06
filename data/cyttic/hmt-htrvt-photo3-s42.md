# cyttic/hmt-htrvt-photo3-s42

## Resumen

`cyttic/hmt-htrvt-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con arquitectura CTC y publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en su oleada 1, con la variante de modelo `htrvt` y la estrategia de aumento `photo3` bajo la semilla 42. El modelo está especializado en hebreo (`he`) y se distribuye con licencia MIT.

El modelo cuenta con 13.821.574 parámetros y un repositorio de aproximadamente 0,1 GB en formato `safetensors`. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento más allá de la referencia a `cyttic/hhd-optionb-split`, ni sobre procesos de alineación como RLHF o DPO.

Su relevancia radica en que publica métricas de evaluación concretas sobre un conjunto de test definido (HHD Option-B), con decodificación greedy y sin modelo de lenguaje: CER de 0,0654 y WER de 0,2946. Esto lo convierte en un punto de referencia reproducible para estudiar el efecto de distintas estrategias de aumento de datos en HTR de hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, HTR) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de reconocimiento de texto manuscrito basada en CTC (*Connectionist Temporal Classification*), según indican las etiquetas `htr` y `ctc` de la model card. No se especifica en la información disponible el tipo de backbone (por ejemplo, CNN, transformer o híbrido) ni la resolución de entrada de las imágenes.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del conjunto de desarrollo. La variante corresponde a la estrategia de aumento de datos `photo3` con semilla 42, dentro de un estudio comparativo de métricas de transferencia (`htr-metrics-transfer`). No se detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, algo poco habitual en tareas HTR.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC con salida de secuencia de caracteres.
- Evaluación con decodificación greedy sin modelo de lenguaje externo.
- Entrenado bajo una estrategia de aumento de datos específica (`photo3`), orientada a mejorar la robustez frente a variaciones fotográficas.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento (*thinking mode*).

## Casos de uso

- Digitalización de documentos manuscritos en hebreo: el modelo transcribe imágenes de texto manuscrito a texto digital, adecuado para archivos históricos o administrativos en hebreo.
- Estudio comparativo de aumento de datos: sirve como punto de referencia reproducible (semilla 42, variante `photo3`) para medir el impacto de estrategias de *augmentation* en HTR mediante CER y WER.
- Evaluación de métricas de transferencia: al formar parte del estudio `htr-metrics-transfer`, permite analizar cómo se transfieren las métricas entre configuraciones de entrenamiento.
- Procesamiento por lotes de formularios manuscritos: con 13,8 M de parámetros, es ligero y puede ejecutarse en CPU o GPU de gama baja para lotes de imágenes.
- Integración en pipelines de OCR/HTR para hebreo: puede combinarse con un modelo de lenguaje posterior para reducir el WER (0,2946 sin LM) en producción.
- Investigación académica en HTR de lenguas semíticas: su licencia MIT y su reducido tamaño facilitan la reproducción de experimentos y la comparación con otras variantes del mismo estudio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto HHD Option-B test, con decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0654 |
| WER | 0,2946 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado el tamaño de 13,8 M de parámetros (el repositorio ocupa 0,1 GB en `safetensors`); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, e incluso la inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: no se indica ninguna en la información disponible; al ser un modelo CTC de HTR, requeriría un runtime compatible con la arquitectura concreta (no se detalla).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio estudio `htr-metrics-transfer` incluye otras variantes (otras estrategias de aumento y semillas), pero no se han facilitado sus métricas ni especificaciones, por lo que no es posible establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | CER | WER | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-photo3-s42 | 13.821.574 | no disponible | 0,0654 | 0,2946 | MIT |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo (`he`); no se ha documentado soporte para otros idiomas.
- El WER de 0,2946 sin modelo de lenguaje es elevado para muchos escenarios de producción; se recomienda acoplar un LM o un postprocesado para reducir errores.
- Riesgo de alucinación inherente a los modelos CTC: pueden generar secuencias plausibles pero incorrectas en imágenes de baja calidad o con escritura atípica.
- No se documentan sesgos conocidos, pero al entrenarse sobre un conjunto con escritores concretos (`hhd-optionb-split`), puede generalizar peor a escritores no representados.
- No se especifican limitaciones de contexto ni resolución de imagen de entrada.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del dataset de entrenamiento (`cyttic/hhd-optionb-split`) por posibles restricciones adicionales.
- No hay información sobre cuantizaciones ni sobre el runtime de inferencia recomendado, lo que puede complicar el despliegue directo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-photo3-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados (`results.json`): no disponible como enlace directo en la información proporcionada.
