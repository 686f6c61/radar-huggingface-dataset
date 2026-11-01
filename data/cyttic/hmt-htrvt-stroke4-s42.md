# cyttic/hmt-htrvt-stroke4-s42

## Resumen

`cyttic/hmt-htrvt-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado por el grupo cyttic. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*), y corresponde a la variante de arquitectura `htrvt` con la aumentación `stroke4` y la semilla 42. El modelo se distribuye con pesos en formato safetensors y una licencia MIT.

El modelo resuelve la transcripción automática de texto manuscrito en hebreo (`he`), tarea para la que emplea una arquitectura de tipo CTC (*Connectionist Temporal Classification*), según las etiquetas declaradas por el autor. Con 13.821.574 parámetros totales y un tamaño de repositorio de 0,1 GB, se trata de un modelo compacto, pensado más como artefacto de investigación reproducible que como producto de inferencia a gran escala.

Su relevancia actual es acotada pero concreta: sirve como punto de referencia para estudiar cómo distintas estrategias de aumento de datos afectan a las métricas de HTR, y publica resultados medidos sobre el conjunto de test HHD Option-B (CER 0,0599, WER 0,2733) con decodificación greedy y sin modelo de lenguaje. La model card es mínima y remite a un `results.json` para los detalles experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | htrvt con cabeza CTC (según tags `htr` y `ctc`; detalles internos no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia `htrvt` y utiliza un esquema de entrenamiento con pérdida CTC, habitual en reconocimiento de secuencias sin alineamiento explícito (texto manuscrito, voz). No se especifican en la model card el número de capas, la dimensión de los embeddings, el tipo de encoder (convolucional, transformer o híbrido) ni la resolución de entrada de las imágenes.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (*dev writers*). La variante corresponde a la aumentación `stroke4` con semilla 42, dentro de la primera oleada del estudio `htr-metrics-transfer`. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo, obteniendo CER 0,0599 y WER 0,2733. No se indica en la información proporcionada el número de tokens, el volumen del corpus ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Decodificación CTC greedy, sin modelo de lenguaje acoplado.
- Salida de transcripción a nivel de carácter y palabra, evaluable mediante CER y WER.
- Entrenamiento reproducible por semilla (42) y configuración de aumentación (`stroke4`), orientado a experimentación comparativa.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.

## Casos de uso

- Investigación en aumento de datos para HTR: el modelo sirve como una de las ejecuciones del estudio `htr-metrics-transfer`, permitiendo comparar el efecto de `stroke4` frente a otras aumentaciones con la misma semilla y split.
- Reproducibilidad de experimentos: al fijar semilla 42 y publicar pesos safetensors, se puede replicar la medición de CER/WER sobre HHD Option-B y contrastarla con `results.json`.
- Transcripción de manuscritos hebreos digitalizados: adecuado para digitalización de archivos con escritura manuscrita cuando se dispone de un pipeline de preprocesado de imagen y no se requiere un modelo de lenguaje corrector.
- Línea base en evaluación de HTR: al ser un modelo pequeño (13,8 M de parámetros) y sin LM, resulta útil como referencia de mínimos frente a sistemas con decodificación asistida por lenguaje.
- Prototipado académico: su tamaño reducido permite experimentar en entornos con recursos limitados y validar hipótesis de aumentación antes de escalar a modelos mayores.
- Estudio de transferencia de métricas: al formar parte de una oleada concreta, permite analizar si las mejoras observadas en validación se trasladan al test HHD Option-B.

## Benchmarks y rendimiento

| Conjunto | Decodificacion | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,0599 | 0,2733 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 55 MB y en fp16 unos 28 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan en la información disponible; al ser safetensors, requeriría cargar los pesos con la implementación del autor (no se especifica si existe integración con vLLM, llama.cpp, Ollama o TGI, que además no son adecuados para un modelo CTC de HTR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de HTR en hebreo ni resultados comparativos con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo (`he`); no se garantiza su funcionamiento en otros idiomas.
- La evaluación se realizó sin modelo de lenguaje, lo que se refleja en un WER de 0,2733, notablemente superior al CER; es esperable un mayor número de errores a nivel de palabra.
- No se documentan sesgos específicos, pero al entrenarse sobre un split con escritores concretos, puede generalizar peor a escritores, estilos o dominios no representados.
- Riesgo de alucinación inherente a los sistemas CTC: puede producir transcripciones plausibles pero incorrectas en pasajes ambiguos o de baja calidad de imagen.
- Aunque la licencia es MIT y permite uso comercial, la model card no ofrece garantías de rendimiento en producción ni documenta el preprocesado de imagen requerido.
- La información publicada es mínima (sin detalles de arquitectura, contexto ni cuantización), lo que dificulta su integración directa en pipelines sin trabajo adicional de ingeniería.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-stroke4-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card; no verificado)
- `results.json`: referenciado en la model card, sin URL directa disponible en la información proporcionada.
