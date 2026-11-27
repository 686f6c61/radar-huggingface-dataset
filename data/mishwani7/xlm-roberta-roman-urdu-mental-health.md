# mishwani7/XLM-RoBERTa-Roman-Urdu-Mental-Health

## Resumen

XLM-RoBERTa-Roman-Urdu-Mental-Health es un modelo de clasificacion de texto obtenido mediante fine-tuning de `xlm-roberta-base` sobre texto social en roman urdu, la variante del urdu escrita con alfabeto latino que se usa de forma habitual en redes sociales y mensajeria. Lo desarrolla el usuario de Hugging Face mishwani7 y su proposito es el cribado clinico de severidad depresiva en cuatro clases (no depresion, leve, moderada y severa).

La aportacion tecnica diferencial no es la arquitectura, sino la calibracion del umbral de decision mediante control de riesgo conformal (conformal risk control). El autor fija un limite objetivo de tasa de falsos negativos del 5 % (alpha <= 0,05) y deriva dos umbrales: 0,3081 para el cribado conformal, que garantiza FNR <= 5 %, y 0,0895 para la asignacion exacta de grado de severidad. Este enfoque es relevante porque traslada garantias estadisticas de cobertura al terreno del cribado en salud mental, donde un falso negativo (no detectar a una persona en riesgo) tiene un coste mucho mayor que un falso positivo.

El modelo es pequeno (278 millones de parametros), esta publicado con licencia MIT y se distribuye en formato safetensors con un repositorio de 1,1 GB. Su interes practico esta en aplicaciones de triaje y monitorizacion en entornos de habla urdu donde el texto informal en alfabeto latino es la norma, un dominio poco cubierto por los modelos clinicos habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.046.724 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta hasta 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ur (roman urdu), multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `xlm-roberta-base`, un encoder transformer multilingue basado en RoBERTa con vocabulario SentencePiece entrenado sobre corpus en un centenar de idiomas. Sobre esa base se ha realizado un fine-tuning supervisado para clasificacion en cuatro clases de severidad depresiva, segun la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en tareas de clasificacion).

La innovacion destacable es la calibracion post-entrenamiento mediante control de riesgo conformal. En lugar de usar un umbral fijo de 0,5 sobre la probabilidad de la clase positiva, el autor calcula un umbral que acota la tasa de falsos negativos al 5 % sobre un conjunto de calibracion, lo que proporciona una garantia de cobertura distribution-free bajo el supuesto de intercambiabilidad entre calibracion y produccion. Se reportan dos umbrales: 0,3081 para el cribado conformal (FNR <= 5 %) y 0,0895 para la clasificacion exacta de severidad.

## Capacidades

- Clasificacion de texto en cuatro clases de severidad depresiva: no depresion (0), leve (1), moderada (2) y severa (3).
- Procesamiento de roman urdu, la transliteracion latina del urdu usada en redes sociales y mensajeria.
- Cribado con garantia estadistica de tasa de falsos negativos mediante umbral conformal calibrado.
- Capacidad multilingue heredada de XLM-RoBERTa, aunque el fine-tuning esta orientado a roman urdu.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo exclusivamente de clasificacion.
- No dispone de modo "thinking" ni generacion de texto libre.

## Casos de uso

- Cribado de salud mental en redes sociales: el modelo clasifica publicaciones en roman urdu y, aplicando el umbral conformal de 0,3081, deriva a revision humana los casos con riesgo de depresion moderada o severa, acotando la tasa de falsos negativos al 5 %.
- Triaje en lineas de ayuda o chatbots de salud: integrado como primer filtro en un pipeline de atencion, permite priorizar conversaciones que requieren intervencion de un profesional frente a las que no presentan indicios.
- Monitorizacion longitudinal de pacientes: al ser un clasificador ligero (278 M de parametros), puede ejecutarse sobre historiales de mensajes para detectar cambios de severidad a lo largo del tiempo.
- Investigacion en procesamiento de lenguaje de bajo recursos: sirve como baseline reproducible para estudios sobre roman urdu y salud mental, con umbrales de decision documentados y licencia permisiva.
- Moderacion de comunidades en linea: foros y plataformas con audiencia pakistani o de la diaspora pueden usar el modelo para marcar contenido de riesgo y activar protocolos de soporte.
- Analisis de encuestas abiertas: procesamiento de respuestas en texto libre en roman urdu en estudios epidemiologicos o de bienestar laboral, con clasificacion de severidad por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta los umbrales de calibracion conformal (0,3081 para cribado con FNR <= 5 % y 0,0895 para grado exacto de severidad), sin metricas de exactitud, F1, precision ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos; en fp16 alrededor de 0,55 GB. Con activaciones y overhead de runtime, un presupuesto de 2-3 GB es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs con 4 GB de VRAM.
- Puede ejecutarse en CPU para inferencia por lotes con latencia aceptable dado el tamano del modelo.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, Text Embeddings Inference (TEI) para clasificacion, ONNX Runtime, o exportacion a GGUF/llama.cpp (no documentada por el autor, requeriria conversion manual).
- No se dispone de datos de latencia ni throughput medidos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLM-RoBERTa-Roman-Urdu-Mental-Health | 278 M | no disponible | Clasificacion de severidad depresiva en roman urdu | MIT | Hugging Face |
| xlm-roberta-base (base sin fine-tuning) | 278 M | 512 tokens | Modelo multilingue general | MIT | Hugging Face |
| Modelos clinicos en ingles (p. ej. MentalBERT) | ~110 M | 512 tokens | Clasificacion de salud mental en ingles | MIT / Apache 2.0 | Hugging Face |

La comparativa directa con alternativas especificas para roman urdu no esta disponible en la informacion proporcionada. Frente a `xlm-roberta-base`, la diferencia esta en el fine-tuning y la calibracion conformal; frente a modelos clinicos en ingles como MentalBERT, la ventaja es la cobertura de roman urdu, mientras que el rendimiento comparado no se ha publicado.

## Limitaciones y advertencias

- Modelo de cribado, no de diagnostico: no sustituye la evaluacion de un profesional de salud mental.
- La garantia de FNR <= 5 % del umbral conformal asume intercambiabilidad entre el conjunto de calibracion y los datos de produccion; si la distribucion cambia (otra plataforma, otro registro, otra epoca), la garantia puede no mantenerse.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de genero, edad o procedencia.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de falsos positivos y negativos en la clasificacion; el umbral bajo (0,3081) prioriza sensibilidad a costa de precision.
- Limitacion de contexto: al derivar de XLM-RoBERTa base, el maximo es de 512 tokens, insuficiente para historiales largos sin troceado.
- El rendimiento en variantes del urdu distintas del roman urdu (escritura arabe-persa estandar) no esta documentado.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mishwani7/XLM-RoBERTa-Roman-Urdu-Mental-Health
- XLM-RoBERTa base: https://huggingface.co/xlm-roberta-base
- Paper de XLM-R (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales especificos de este modelo.
