# hauchieh/truthlens-models

## Resumen

TruthLens es un conjunto de dos modelos ONNX diseñados para la detección de contenido generado por inteligencia artificial, desarrollados por hauchieh para el proyecto TruthLens. Su característica principal es que toda la inferencia se ejecuta en el navegador mediante onnxruntime-web (WASM/WebGPU), de modo que el texto del usuario nunca abandona el dispositivo. Esto lo hace especialmente relevante para aplicaciones web que requieren privacidad y procesamiento local.

El primer modelo, `mbert_detector_int8.onnx` (129 MiB), es un clasificador binario basado en `distilbert-base-multilingual-cased` (104 idiomas, tokenización WordPiece) fine-tuneado con el dataset HC3 en inglés y chino, y cuantizado a INT8. El segundo, `qwen05b_ppl_int8.onnx` (488 MiB), es un modelo de perplejidad derivado de Qwen2.5-0.5B convertido a ONNX INT8, que sustituye a DistilGPT2 para mejorar la discriminación en chino. Ambos modelos se distribuyen bajo licencia Apache-2.0 y están orientados a la verificación de autenticidad de textos en tiempo real dentro del navegador.

## Especificaciones técnicas

| Parametro | Detector (mbert_detector_int8.onnx) | Perplejidad (qwen05b_ppl_int8.onnx) |
|---|---|---|
| Arquitectura | DistilBERT-base-multilingual-cased | Qwen2.5-0.5B (transformers) |
| Parametros totales | no disponible | no disponible |
| Parametros activos | no aplica (no es MoE) | no aplica (no es MoE) |
| Longitud de contexto | no disponible | no disponible |
| Tipos de cuantizacion | INT8 | INT8 |
| Idiomas soportados | en, zh (base multilingüe de 104 idiomas) | en, zh (multilingüe) |
| Licencia | Apache-2.0 | Apache-2.0 |
| Formato de pesos | ONNX | ONNX |
| Tamaño del archivo | 129 MiB | 488 MiB |

## Arquitectura y entrenamiento

El detector `mbert_detector_int8.onnx` parte de `distilbert-base-multilingual-cased`, un modelo transformer encoder de 6 capas con embeddings WordPiece que soporta 104 idiomas. Se fine-tuneó con el dataset HC3 (Hello-SimpleAI), compuesto por respuestas humanas y generadas por ChatGPT en inglés y chino, para la tarea de clasificación binaria (humano vs. IA). Posteriormente se cuantizó a INT8, lo que reduce el tamaño y acelera la inferencia en navegador. El modelo de perplejidad `qwen05b_ppl_int8.onnx` es una conversión directa del checkpoint ONNX de Qwen2.5-0.5B (también cuantizado a INT8) sin fine-tune adicional; se utiliza para calcular la perplejidad de un texto, una métrica estadística que tiende a ser menor en textos generados por modelos de lenguaje que en texto humano.

## Capacidades

- Clasificación binaria de texto como humano o generado por IA (detección de contenido sintético).
- Cálculo de perplejidad para evaluar la probabilidad de que un texto sea producido por un modelo de lenguaje.
- Ejecución completamente local en el navegador mediante onnxruntime-web (WASM/WebGPU), sin envío de datos a servidores.
- Soporte multilingüe para inglés y chino en la detección, con base multilingüe de 104 idiomas en el detector.
- Integración sencilla con transformers.js para gestión de tokens y KV cache en el modelo de perplejidad.
- Salida de probabilidades para la clase IA (índice 1) en el detector, permitiendo ajustar umbrales según la aplicación.

## Casos de uso

- Verificación de autenticidad en plataformas de publicación de artículos: el detector puede analizar el texto antes de su publicación para señalar si fue generado por IA, ayudando a mantener la transparencia editorial.
- Moderación de comentarios en foros y redes sociales: integrado como script en el navegador, permite marcar respuestas automáticas generadas por chatbots sin enviar el contenido a un servidor externo.
- Detección de respuestas automatizadas en sistemas de atención al cliente: las empresas pueden evaluar si un mensaje recibido fue escrito por un humano o por un bot, mejorando la gestión de incidencias.
- Análisis de ensayos académicos: los profesores pueden usar una extensión de navegador para comprobar si un trabajo presenta señales de generación por IA, con la ventaja de que el texto del estudiante no se sube a ninguna plataforma.
- Herramientas de transparencia para periodistas: verificar si un comunicado o declaración pública contiene lenguaje generado por IA, especialmente útil en contextos de desinformación.
- Evaluación de calidad de datos en proyectos de NLP: el modelo de perplejidad puede usarse para filtrar textos sintéticos en datasets de entrenamiento, mejorando la calidad de los datos.

## Benchmarks y rendimiento

El detector reporta los siguientes resultados en el conjunto de validación (HC3 en inglés y chino):

| Metrica | Valor |
|---|---|
| Accuracy | 0.984 |
| Precision | 0.969 |
| Recall | 0.999 |
| F1 | 0.983 |

Rendimiento por idioma en la detección (distribución interna):

| Idioma | AUC | Precision (hit rate) | Falsos positivos |
|---|---|---|---|
| Chino | 1.000 | 100.0% | 7.5% |
| Inglés | 1.000 | 100.0% | 3.3% |

El modelo de perplejidad compara su AUC con DistilGPT2:

| Modelo | AUC chino | AUC inglés |
|---|---|---|
| DistilGPT2 | 0.50 | 0.996 |
| Qwen2.5-0.5B (INT8) | 0.965 | 0.988 |

Umbrales calibrados con presupuesto de falsos positivos del 5%:

| Idioma | Mediana humana | Mediana IA | aiCut | humanCut | Hit rate | Falsos positivos |
|---|---|---|---|---|---|---|
| Chino | 56.3 | 9.2 | 11.19 | 18.67 | 75.0% | 5.0% |
| Inglés | 30.6 | 4.9 | 11.45 | 11.45 | 100% | 2.5% |

Nota: los valores de AUC 1.000 son optimistas dentro de la distribución de entrenamiento y no reflejan el rendimiento esperado en producción.

## Requisitos de hardware

- No se requiere GPU dedicada; ambos modelos están optimizados para ejecución en CPU mediante WebAssembly (WASM) o WebGPU en el navegador.
- Tamaño de memoria: el detector ocupa 129 MiB y el modelo de perplejidad 488 MiB, por lo que se necesitan al menos ~500 MiB de memoria disponible para cargar el modelo de perplejidad.
- Compatible con cualquier dispositivo moderno con navegador (Chrome, Firefox, Safari, Edge) que soporte WebAssembly o WebGPU.
- Despliegue: se integra con onnxruntime-web y transformers.js; no requiere servidor ni infraestructura de inferencia.
- Latencia: no se proporcionan datos específicos, pero al ser modelos INT8 de tamaño moderado, se espera una inferencia en el orden de decenas de milisegundos en CPU moderna, dependiendo de la longitud del texto.

## Comparativa con modelos similares

El modelo de perplejidad se compara directamente con DistilGPT2 en la información proporcionada:

| Modelo | Parametros | Contexto | AUC chino | AUC inglés | Licencia |
|---|---|---|---|---|---|
| DistilGPT2 | ~82M | 1024 | 0.50 | 0.996 | Apache-2.0 |
| Qwen2.5-0.5B (INT8) | ~0.5B (inferido) | no disponible | 0.965 | 0.988 | Apache-2.0 |

Para el detector de contenido IA, no se dispone de comparativas con otros modelos en la información proporcionada. La ventaja principal de TruthLens frente a alternativas es su ejecución local en navegador, que garantiza privacidad y elimina la latencia de red.

## Limitaciones y advertencias

- Los valores de AUC 1.000 en el detector son optimistas y se obtuvieron con datos de la misma distribución que el entrenamiento; en producción el rendimiento será inferior.
- El detector fue entrenado con el dataset HC3, que contiene respuestas de ChatGPT de 2022; no se ha verificado su eficacia con modelos generativos posteriores a 2026.
- En pruebas fuera de distribución, el detector falla en textos de género diferente al entrenamiento (por ejemplo, ensayos en inglés, ya que HC3 inglés es formato pregunta-respuesta).
- El modelo de perplejidad presenta una tasa de falsos positivos del 5% en chino con una precisión del 75%, lo que puede generar errores en aplicaciones críticas.
- La cuantización INT8 desplaza la escala de perplejidad, por lo que los umbrales calibrados para este modelo no son válidos para versiones fp32.
- Aunque la licencia es Apache-2.0, los datos de fine-tuning (HC3) se destinan a fines de investigación; el uso comercial puede requerir verificación adicional.
- La detección de contenido generado por IA no es infalible y debe considerarse como una señal, no como una prueba definitiva.

## Enlaces

- Repositorio del proyecto TruthLens: https://github.com/hauchiehlin-ops/TruthLens
- Modelo en Hugging Face: https://huggingface.co/hauchieh/truthlens-models
- Modelo original Qwen2.5-0.5B (ONNX): https://huggingface.co/onnx-community/Qwen2.5-0.5B
