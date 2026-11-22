# GoForceX/body-judge-small-v1

## Resumen

body-judge-small-v1 es un modelo de lenguaje encoder-only desarrollado por GoForceX, construido sobre el checkpoint alphaedge-ai/mmBERT-small-zho-32768 (una variante de ModernBERT-small con vocabulario chino ampliado a 32k tokens). No es un modelo generativo: añade dos cabezas ligeras sobre el encoder para resolver simultáneamente dos tareas de post-procesado de respuestas de IA: localizar el intervalo continuo de "cuerpo" real del texto (descartando preámbulos, sufijos y contenido fuera de tema) y puntuar cada frase con un valor en [0, 1] que indica cuánto necesita ser reescrita.

El modelo resuelve un problema concreto en pipelines de evaluación y refinamiento de salidas de LLM: separar la sustancia de la respuesta del ruido de formato y priorizar qué frases requieren revisión. Su salida es un único tensor `logits [B, L, 4]` con cuatro canales (puntero de inicio, puntero de fin, clasificación binaria por token de cuerpo y logit de reescritura), lo que simplifica la exportación a ONNX y la alineación entre backends.

Con 219 MB en fp32 (110 MB en fp16, 93 MB en int8), un contexto de entrenamiento de 8192 tokens y licencia MIT, está pensado para integrarse en herramientas de control de calidad de texto en chino e inglés, con despliegue viable en CPU y en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-small (encoder transformer) con dos cabezas ligeras (dual-head) |
| Parametros totales | no disponible (repo de 0,6 GB; pesos fp32 de 219 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento; inferencia mediante ventana deslizante sobre cualquier longitud |
| Tipos de cuantizacion | fp32, fp16, INT8 dinamico (solo capas Linear); ONNX fp32, fp16, QUInt8 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (fp32/fp16/int8) y ONNX (fp32/fp16/int8/int8_matmul); tokenizer.json con mapeo de offsets |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small-zho-32768, un encoder ModernBERT-small con vocabulario chino de 32.768 tokens. Sobre la representación del encoder se añaden dos cabezas: la primera produce punteros de inicio y fin de cuerpo (`start_logit`, `end_logit`) más una clasificación binaria por token (`is_body_logit`); la segunda emite un logit de reescritura por token (`revise_logit`) que, tras mean-pooling dentro de cada frase y aplicación de una temperatura calibrada T = 1.6, se convierte en una puntuación de reescritura en [0, 1]. Todo se materializa en un único tensor de salida `[B, L, 4]`, sin operadores gather/scatter personalizados, lo que facilita la exportación a ONNX Runtime, onnxruntime-web y OpenVINO.

El entrenamiento se realizó sobre respuestas de IA en chino, según indica el autor, con una ventana de 8192 tokens. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un encoder de este tipo). La innovación destacable es la combinación de localización de cuerpo y puntuación de reescritura en una sola pasada, con decodificación basada en ventana deslizante (ventana 4096 / paso 3072 por defecto, con fusión triangular de logits en solapamientos), algoritmo de Kadane sobre `is_body_prob - 0.5` para el caso multi-ventana y refinamiento de bordes en ±32 tokens mediante los punteros.

## Capacidades

- Localización de cuerpo: identifica el intervalo continuo de texto real (offsets de caracteres, izquierda cerrada y derecha abierta) dentro de una respuesta con preámbulos, sufijos o contenido fuera de tema.
- Puntuación de reescritura por frase: asigna un valor en [0, 1] a cada frase del cuerpo, calibrado con temperatura T = 1.6.
- Segmentación de frases en chino e inglés con puntuación de fin de oración (`。！？!? …`), preservando comillas y paréntesis de cierre, alineada con los offsets del tokenizer.
- Eliminación opcional de bloques ` thinking...` iniciales ya cerrados (desactivable con `--no_strip_think`).
- Procesamiento de textos de longitud arbitraria mediante ventana deslizante con fusión ponderada de logits.
- Salida estructurada en JSON con `has_body`, `body_span`, `body_text` y lista de frases con `char_span`, `sentence` y `revise_score`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Control de calidad en pipelines de generación: tras una llamada a un LLM, el modelo localiza el cuerpo real de la respuesta y descarta preámbulos del estilo "Claro, aquí tienes..." antes de mostrarla al usuario final.
- Priorización de revisión humana: en flujos de edición asistida, las frases con `revise_score` alto se envían a un revisor o a un segundo modelo de reescritura, reduciendo el coste frente a reescribir el texto completo.
- Filtrado de contenido fuera de tema: en sistemas de atención al cliente, detectar y recortar derivas del modelo (contenido irrelevante mezclado con la respuesta útil) usando el intervalo de cuerpo detectado.
- Evaluación automática de respuestas: usar la puntuación por frase como señal de calidad en benchmarks internos o en la comparación de variantes de prompts, con la salvedad de que es una señal relativa que requiere recalibración por dataset.
- Moderación y limpieza de logs: procesar grandes volúmenes de respuestas almacenadas en CPU con la variante INT8 (93 MB) para extraer el cuerpo y marcar frases problemáticas antes de archivarlas o analizarlas.
- Despliegue en navegador o edge: exportar a ONNX fp16 (105 MB) o int8 (53 MB) y ejecutar en onnxruntime-web u OpenVINO para preprocesar texto en el cliente sin enviar datos a servidores.
- Extracción de citas o resúmenes: aislar el fragmento sustantivo de una respuesta larga antes de pasarlo a un modelo de resumen o a un sistema de recuperación.

## Benchmarks y rendimiento

Métricas de validación del autor (`eval_metrics.json`):

| Metrica | Valor |
|---|---|
| IoU de tokens de cuerpo | 0,9900 |
| Tasa de acierto con tolerancia de 5 tokens | 0,9544 |
| Spearman de puntuación por frase | 0,7016 |
| MAE de puntuación por frase | 0,1919 |
| Frases evaluadas | 654 |
| Temperatura de calibración | 1,6 |

Degradación por cuantización (texto de 2.000 caracteres, 84 frases, frente a fp32):

| Variante | Delta medio absoluto en puntuación | Delta máximo absoluto | body_span |
|---|---|---|---|
| fp16 | 0,00015 | 0,0005 | Idéntico |
| int8 | 0,0297 | 0,2033 | Idéntico |

Latencia medida en RTX 4070 Mobile 8 GB (ventana 4096 / paso 3072, una predicción):

| Texto | CPU fp32 | GPU fp32 | GPU fp16 |
|---|---|---|---|
| 1.438 tokens | 0,86 s | 0,52 s | 0,51 s |
| 5.076 tokens (2 ventanas) | 14,19 s | 1,24 s | 1,08 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (219 MB de pesos), aproximadamente 0,5 GB en fp16 y 0,3 GB en int8, más el espacio de activaciones para ventanas de hasta 8192 tokens.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor valida con RTX 4070 Mobile 8 GB. Para producción de alto throughput, A100 o H100 sobredimensionadas para este modelo; una RTX 4090 o L4 es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Despliegue: PyTorch (`infer.py` con `--device auto|cpu|cuda`), ONNX Runtime, onnxruntime-web y OpenVINO. La variante int8 dinámica solo funciona en CPU; en GPU debe usarse fp16 o fp32.
- Latencia y throughput: 0,51 s para 1.438 tokens en GPU fp16; 1,08 s para 5.076 tokens (dos ventanas). En CPU fp32, 0,86 s y 14,19 s respectivamente. Con ventana de 2048/1536 el autor estima aproximadamente 2× de aceleración en textos largos y 3-4× con 1024/768.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| body-judge-small-v1 | ModernBERT-small + dual-head | no disponible (219 MB fp32) | 8192 tokens (ventana deslizante) | Localización de cuerpo + puntuación de reescritura | MIT |
| alphaedge-ai/mmBERT-small-zho-32768 (base) | ModernBERT-small | no disponible | 32768 tokens (vocabulario) | Encoder de propósito general | MIT |
| Modelos de clasificación de calidad de texto tipo reward-model | Encoder o decoder pequeño | variable | variable | Puntuación escalar de calidad | variable |

No se dispone en la información proporcionada de alternativas directas publicadas que combinen localización de cuerpo y puntuación por frase en un único encoder con salida de cuatro canales; la comparativa con modelos de reescritura o reward models genéricos queda como referencia cualitativa, no como comparación de rendimiento medida.

## Limitaciones y advertencias

- Solo emite un intervalo continuo de cuerpo: si la respuesta contiene varias secciones sustantivas separadas, se fusionarán o se truncará una de ellas.
- La puntuación por frase es una señal relativa pensada para ordenar y filtrar, no una probabilidad absoluta de reescritura; requiere recalibración antes de comparar entre datasets.
- Entrenado específicamente con respuestas de IA en chino; el rendimiento en otros idiomas o estilos no está evaluado sistemáticamente, pese a declarar soporte de inglés.
- En textos que exceden los 8192 tokens, la calidad depende de la fusión por ventana deslizante; ventanas pequeñas pueden provocar pequeñas fluctuaciones en los bordes.
- La cuantización INT8 introduce un delta máximo de 0,2033 en puntuaciones por frase, relevante si se usan umbrales estrictos.
- `model_int8.pt` contiene parámetros cuantizados empaquetados y requiere `torch.load` con `weights_only=False`; solo deben cargarse ficheros de confianza.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto nuevo), pero sí puede producir falsos positivos o negativos en la localización de cuerpo y en la puntuación.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre respuestas de IA en chino, puede heredar sesgos de estilo y dominio de ese corpus.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base (también MIT según el autor).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GoForceX/body-judge-small-v1
- Modelo base: https://huggingface.co/alphaedge-ai/mmBERT-small-zho-32768
