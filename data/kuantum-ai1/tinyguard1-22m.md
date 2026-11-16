# Kuantum-ai1/TinyGuard1-22M

## Resumen

TinyGuard1-22M es un clasificador de texto en inglés de 22,7 millones de parámetros desarrollado por Kuantum-ai1, pensado como filtro de seguridad de primera pasada. Etiqueta cada mensaje en una de cuatro clases: `safe`, `spam`, `phishing` o `prompt_injection`. Se trata de un fine-tune del encoder MiniLM-L6-H384-uncased, por lo que su arquitectura es un transformer BERT de 6 capas con dimensión oculta de 384, y su huella es lo bastante pequeña como para ejecutarse en CPU o en dispositivos de gama móvil.

El modelo aborda un problema concreto en el despliegue de aplicaciones con LLM: la necesidad de un discriminador barato y rápido que separe tráfico legítimo de spam, intentos de phishing y ataques de inyección de prompts antes de que el texto llegue a un modelo generativo o a un usuario. Frente a soluciones basadas en LLM grandes, este checkpoint ofrece latencia mínima y coste de inferencia despreciable, a cambio de una cobertura limitada a inglés y a los dominios representados en sus datos de entrenamiento.

Es relevante ahora por la proliferación de agentes y asistentes conversacionales expuestos a entradas no confiables, donde un clasificador ligero puede actuar como guardrail previo. La model card reporta una accuracy de 0,9669 y un macro F1 de 0,9696 sobre un conjunto de test de 1301 ejemplos, con licencia Apache-2.0 y un repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6-H384-uncased), 6 capas, dimensión oculta 384 |
| Parametros totales | 22.714.756 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 256 tokens (longitud máxima usada en entrenamiento); límite posicional del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones específicas; al ser un modelo de 22,7M es viable en fp32, fp16 e int8 por tamaño) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de nreimers/MiniLM-L6-H384-uncased, un encoder transformer de 6 capas y 384 dimensiones ocultas, y se fine-tunea como clasificador de secuencias con cuatro etiquetas de salida. No emplea atención lineal, SSM ni arquitecturas híbridas: es un transformer denso convencional orientado a clasificación, no a generación.

El entrenamiento se realizó con PyTorch en una única GPU T4, con longitud máxima de 256 tokens, batch size de 64, learning rate 5e-5, 3 épocas, optimizador AdamW con weight decay 0,01, scheduler lineal con 6% de warmup y precisión fp16, conservando el checkpoint con mejor accuracy de validación. Los datos provienen de cinco conjuntos públicos de Hugging Face: `ucirvine/sms_spam` (spam SMS), `Deysi/spam-detection-dataset` (spam de correo), `ealvaradob/phishing-dataset` (textos de phishing), `xTRam1/safe-guard-prompt-injection` (inyección de prompts) y `databricks/databricks-dolly-15k` como ejemplos benignos adicionales de la clase `safe`. Las clases se limitaron a 10.000 ejemplos cada una y se deduplicaron, quedando 9819 ejemplos de `safe`, 6972 de `phishing`, 6142 de `spam` y 3072 de `prompt_injection` antes del split. No se documenta RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un clasificador.

## Capacidades

- Clasificación de texto en cuatro clases: `safe`, `spam`, `phishing` y `prompt_injection`.
- Detección de spam en SMS y correo electrónico, a partir de los corpus de entrenamiento.
- Detección de textos de phishing.
- Detección de intentos de inyección de prompts en entradas de usuario.
- Inferencia en CPU y en dispositivos de clase móvil por su tamaño reducido (22,7M de parámetros).
- Integración directa con el pipeline `text-classification` de transformers y con text-embeddings-inference según los tags del repositorio.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtro previo de prompts en aplicaciones con LLM: clasificar cada entrada de usuario como `prompt_injection` antes de enviarla al modelo generativo, añadiendo una capa de defensa de bajo coste y latencia mínima.
- Moderación de formularios de contacto y comentarios: descartar mensajes clasificados como `spam` o `phishing` en un sitio web, reduciendo el volumen que llega a revisión humana.
- Pasarela de correo electrónico: etiquetar mensajes entrantes en un servidor de correo para enrutar los sospechosos a cuarentena, aprovechando que el modelo cabe en CPU y no requiere GPU dedicada.
- Protección de chatbots de atención al cliente: interceptar entradas que intenten manipular las instrucciones del sistema, dado que el modelo se entrenó específicamente con el corpus `xTRam1/safe-guard-prompt-injection`.
- Filtrado en dispositivos móviles o edge: ejecutar la clasificación localmente en un teléfono o dispositivo embebido gracias a sus 22,7M de parámetros y su formato safetensors ligero.
- Preetiquetado en pipelines de anotación: usar el clasificador para preasignar etiquetas a grandes volúmenes de texto y reducir el trabajo manual de revisión, con la advertencia de revisar los falsos negativos en phishing (recall 0,9255).
- Detección de spam en plataformas de mensajería: procesar SMS o mensajes cortos en lote con el pipeline de transformers para marcar conversaciones sospechosas.

## Benchmarks y rendimiento

Evaluación sobre un split de test estratificado, deduplicado y reservado (1301 ejemplos) de los datos de entrenamiento combinados, según la model card:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9669 |
| Macro F1 | 0,9696 |
| Weighted F1 | 0,9668 |

| Clase | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| safe | 0,9601 | 0,9796 | 0,9698 | 491 |
| spam | 0,9679 | 0,9837 | 0,9758 | 307 |
| phishing | 0,9671 | 0,9255 | 0,9458 | 349 |
| prompt_injection | 0,9870 | 0,9870 | 0,9870 | 154 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,7M de parámetros, unos 91 MB de pesos) y alrededor de 50 MB en fp16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) o profesional (T4, A100, H100) lo ejecuta con holgura.
- Cabe en cualquier GPU consumer e incluso en dispositivos de clase móvil, según indica el autor.
- Opciones de despliegue: pipeline `text-classification` de transformers, text-embeddings-inference (según los tags del repositorio) y endpoints compatibles. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento se realizó en una T4 con batch size 64, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia estructural, el modelo base nreimers/MiniLM-L6-H384-uncased comparte arquitectura y tamaño (6 capas, 384 dimensiones), pero está orientado a embeddings y no a esta clasificación de cuatro clases; no se han publicado métricas comparativas entre ambos en la información disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| TinyGuard1-22M | 22,7M | 256 tokens (entrenamiento) | Clasificación de 4 clases de seguridad | Apache-2.0 |
| nreimers/MiniLM-L6-H384-uncased | ~22M (no confirmado en la información disponible) | no disponible | Embeddings de frases | no disponible |
| Alternativas de clasificación de seguridad | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés; no se ha evaluado en otros idiomas.
- No se ha evaluado frente a ataques adversarios u ofuscados, por lo que su robustez ante evasión deliberada es desconocida.
- Entrenado con corpus públicos; el tráfico real puede diferir y la accuracy puede ser inferior a la reportada.
- El balance de clases y la mezcla de dominios provienen de los datos de entrenamiento y pueden no coincidir con el caso de uso del despliegue.
- Es un filtro de primera pasada, no una solución de seguridad completa; el autor recomienda no tratarlo como tal.
- El recall de la clase `phishing` (0,9255) es el más bajo de las cuatro, lo que implica falsos negativos en ese dominio.
- La licencia del modelo es Apache-2.0, pero el autor advierte de revisar las licencias de los conjuntos de datos de entrenamiento antes de un uso comercial.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en entradas fuera de distribución.
- Longitud de contexto limitada a 256 tokens en entrenamiento; textos más largos requerirán truncado o segmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kuantum-ai1/TinyGuard1-22M
- Modelo base: https://huggingface.co/nreimers/MiniLM-L6-H384-uncased
- Dataset SMS spam: https://huggingface.co/datasets/ucirvine/sms_spam
- Dataset de spam de correo: https://huggingface.co/datasets/Deysi/spam-detection-dataset
- Dataset de phishing: https://huggingface.co/datasets/ealvaradob/phishing-dataset
- Dataset de prompt injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset de instrucciones benignas: https://huggingface.co/datasets/databricks/databricks-dolly-15k
