# isom5160/phishing_finetuned_toy

## Resumen

`isom5160/phishing_finetuned_toy` es un modelo de clasificación de texto publicado en Hugging Face por el usuario isom5160. Por su identificador y por la etiqueta `distilbert` del repositorio, se trata de un ajuste fino (fine-tuning) de DistilBERT orientado, presumiblemente, a la detección de phishing, aunque la model card no documenta explícitamente la tarea, el conjunto de datos ni el procedimiento de entrenamiento. El repositorio tiene un tamaño de 0,3 GB y contiene pesos en formato safetensors con 66.955.010 parámetros, un dato coherente con la arquitectura DistilBERT (66 millones de parámetros).

El modelo es relevante únicamente como artefacto experimental o de demostración: el sufijo `_toy` sugiere un entrenamiento de prueba, y el repositorio no registra descargas ni interacciones. Su interés práctico para desarrolladores e investigadores es limitado, ya que carece de documentación sobre datos de entrenamiento, métricas de evaluación, licencia o idiomas soportados. Se describe aquí como ficha técnica por completitud del catálogo, no como recomendación de uso en producción.

La información disponible no permite confirmar la naturaleza exacta del ajuste fino ni su calidad. Cualquier evaluación seria del modelo requeriría inspeccionar los pesos, el tokenizador y ejecutar pruebas sobre un conjunto de validación propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, segun tag del repositorio) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite tipicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via librerias externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder de tipo DistilBERT, una version destilada de BERT con 6 capas y aproximadamente 66 millones de parametros. La etiqueta `distilbert` aparece en los metadatos del repositorio y el recuento de parametros coincide con el modelo base estandar. El pipeline declarado es `text-classification`, lo que implica una cabeza de clasificacion sobre el encoder.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, la composicion del dataset, hiperparametros, regimen de precision ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en modelos de clasificacion de este tamano). La model card es la plantilla autogenerada por Hugging Face y no contiene ninguno de estos datos. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, orientado presumiblemente a la deteccion de phishing segun el nombre del modelo.
- Generacion de texto: no soportada (modelo encoder-only).
- Razonamiento, codigo y matematicas: no soportados de forma nativa.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Filtrado de correo electronico sospechoso: el modelo podria clasificar mensajes como phishing o legitimos si el ajuste fino se realizo con ese objetivo, integrandose en un pipeline de preprocesado previo a la revision humana.
- Moderacion de formularios web: clasificacion de texto introducido por usuarios para detectar intentos de ingenieria social o contenido fraudulento.
- Enriquecimiento de alertas de seguridad: etiquetado automatico de tickets o informes de incidentes para priorizar la respuesta del equipo SOC.
- Prototipado rapido de clasificadores: por su tamano reducido (66 M de parametros) y su formato safetensors, sirve como base para experimentos academicos de fine-tuning en tareas de deteccion de fraude.
- Evaluacion comparativa de modelos destilados: util como punto de referencia en estudios sobre eficiencia de DistilBERT frente a modelos mayores en tareas de clasificacion binaria.
- Docencia y demostracion: ejemplo de pipeline `text-classification` con transformers para practicas de despliegue con text-embeddings-inference o endpoints compatibles.

En todos los casos, la idoneidad real depende de validar el modelo sobre datos propios, dado que no se publican metricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB para los pesos (66,9 M de parametros x 4 bytes).
- VRAM estimada en fp16: aproximadamente 0,13 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en CPU para inferencia por lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de memoria (GTX 1050, RTX 2060, RTX 4090, etc.).
- Opciones de despliegue: transformers, text-embeddings-inference (segun tag del repositorio), endpoints compatibles, ONNX Runtime, y conversion a GGUF para llama.cpp si se desea.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| isom5160/phishing_finetuned_toy | 66,9 M | no disponible | Clasificacion (phishing) | no disponible | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Clasificacion de sentimiento | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma familia y tamano, ya que no se dispone de datos de rendimiento del modelo evaluado. La diferencia principal con los alternativos es la ausencia de documentacion y licencia explicita.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un ajuste fino no supervisado en su descripcion, no puede descartarse la presencia de sesgos en los datos de entrenamiento.
- Riesgo de alucinacion no aplica en sentido estricto (modelo de clasificacion), pero existe riesgo de falsos positivos y falsos negativos sin metricas publicadas que los acoten.
- Limitaciones de contexto e idioma no documentadas; el modelo base DistilBERT suele estar entrenado principalmente en ingles, lo que puede degradar el rendimiento en castellano.
- La licencia no esta especificada, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El sufijo `_toy` y la ausencia de descargas sugieren un artefacto experimental sin validacion externa.
- No se recomienda su uso en produccion sin una evaluacion propia sobre un conjunto de datos representativo del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isom5160/phishing_finetuned_toy
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Calculadora de impacto medioambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
