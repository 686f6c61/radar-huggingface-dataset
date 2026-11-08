# proofbird/gector-bert-de

## Resumen

`gector-bert-de` es un modelo de corrección gramatical del alemán (Grammatical Error Correction, GEC) desarrollado por Proofbird, el equipo detrás de una aplicación de asistencia a la escritura para Windows. No es un modelo generativo: se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder `dbmdz/bert-base-german-cased` (110 millones de parámetros, arquitectura transformer encoder-only) al que se le añaden dos cabezas: una de etiquetas de edición con 5.000 etiquetas posibles y otra de detección de errores. El modelo predice, para cada token, una edición local (mantener, borrar, reemplazar, insertar, cambiar mayúsculas o cambiar la forma verbal), aplica las ediciones y vuelve a etiquetar hasta cinco iteraciones.

El problema que resuelve es concreto: corregir errores ortográficos y gramaticales frecuentes en textos alemanes sin reescribir ni parafrasear el original, algo relevante para herramientas de escritura que deben preservar la voz del autor. Se distribuye exportado a ONNX en fp32 para ejecutarse en CPU, sin GPU ni clave de API, lo que lo hace apto para inferencia on-device. La versión actual es la 1.1.0 (run `2026-11-08-0749`), publicada con licencia Apache 2.0 y entrenada exclusivamente con datos sintéticos.

Su interés práctico radica en la combinación de un tamaño reducido (repo de 0,5 GB), un enfoque de edición conservador orientado a la precisión y un rendimiento medido sobre un conjunto de evaluación propio. No obstante, carece de benchmarks estándar publicados y no se ha evaluado sobre corpus de aprendices reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT) con cabeza de etiquetado de ediciones (5.000 etiquetas) y cabeza de detección de errores; pipeline GECToR |
| Parametros totales | 110 millones (encoder `dbmdz/bert-base-german-cased`) más las cabezas de etiquetado; cifra exacta de las cabezas no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera por tokens y re-etiqueta hasta 5 iteraciones; no se especifica la ventana máxima) |
| Tipos de cuantizacion | el modelo publicado es ONNX fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | alemán (`de`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17); entradas `input_ids` y `attention_mask`; salidas `logits_labels` [1, T, 5000] y `logits_d` [1, T, 2] |
| Modelo base | `dbmdz/bert-base-german-cased` (MIT) |
| Tamano del repositorio | 0,5 GB |
| Version | 1.1.0 (run `2026-11-08-0749`); tag `v1.1.0` |

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma GECToR: un encoder BERT en versión cased para alemán, sobre el que se montan una cabeza de clasificación de etiquetas de edición (5.000 etiquetas) y una cabeza binaria de detección de errores. En lugar de generar texto libre, el modelo predice para cada token una etiqueta de edición (mantener, borrar, reemplazar por una palabra, añadir una palabra, cambiar mayúsculas o cambiar la forma de un verbo); las ediciones se aplican y la frase se vuelve a etiquetar hasta cinco veces. Esto limita el modelo a ediciones locales y evita parafraseos.

El entrenamiento utilizó exclusivamente datos sintéticos: 3.000.000 de frases de Wikipedia alemana (`wikimedia/wikipedia`, versión `20231101.de`) y 250.000 frases de Tatoeba, corrompidas mediante reglas de error escritas a mano en alemán. Aproximadamente el 10 % de las frases se dejaron limpias para que el modelo aprenda a no tocar texto correcto, y se añadieron 34.000 frases de plantilla para patrones poco frecuentes en Wikipedia (formas verbales con `du` e `ihr`, `das`/`dass`, errores en una cláusula posterior). No se usaron corpus de aprendices ni datos de usuarios. El entrenamiento consistió en una época (95.441 pasos, batch 64, learning rate 3e-5) sobre una NVIDIA L4. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Corrección de concordancia sujeto-verbo, incluida la persona verbal tras `du` e `ihr` (`Die Kinder spielt` → `spielen`, `Du hat` → `hast`, `Ihr ist` → `seid`).
- Capitalización de sustantivos (`keine zeit` → `Zeit`) y de inicio de frase.
- Detección y restauración de diéresis ausentes (`Ich hore` → `höre`, `sehr schon` → `schön`).
- Corrección de `ß` tras vocal larga o diptongo (`Strasse` → `Straße`, `weiss` → `weiß`) y de grafías antiguas `daß`/`muß` → `dass`/`muss`.
- Distinción `das`/`dass` tras coma, en ambas direcciones.
- Corrección de confundibles frecuentes y palabras duplicadas.
- Salida con sugerencias posicionadas: cada corrección incluye `start`, `length`, `original` y `replacement` sobre el texto del usuario, apta para subrayar y ofrecer el arreglo en una interfaz.
- Aplicación iterativa de ediciones (hasta cinco pasadas de re-etiquetado).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio; es un corrector lingüístico especializado.

## Casos de uso

- Asistente de escritura en Windows: Proofbird lo emplea como modelo de gramática on-device; al ejecutarse en CPU vía ONNX Runtime, permite corrección en tiempo real sin enviar el texto a un servidor.
- Corrección ortográfica y gramatical en editores de texto y procesadores de textos en alemán: las sugerencias con posiciones de carácter permiten subrayar el error y ofrecer la sustitución directamente en la interfaz.
- Preprocesado de textos alemanes antes de tareas posteriores de NLP: normalizar mayúsculas de sustantivos, diéresis y `ß` mejora la calidad de corpus para búsqueda o análisis.
- Revisión de correos y documentación interna: corrige concordancia y capitalización sin reescribir el mensaje, preservando el tono del autor.
- Herramientas educativas de aprendizaje del alemán: la salida estructurada (original frente a replacement) permite explicar el error concreto al estudiante.
- Limpieza de textos colaborativos o de dominio público (Tatoeba, Wikipedia) antes de reutilizarlos: el modelo corrige grafías antiguas y errores reales del propio texto.
- Integración en pipelines de CI/CD documental o de publicación: al ser ONNX y no requerir GPU, puede ejecutarse como paso de validación en servidores sin acelerador.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Conjunto gold (268 frases escritas a mano: 178 con un error cada una, 90 correctas) | 168 corregidas, 90 intactas, 10 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4.000 frases cotidianas de Tatoeba (excluidas del entrenamiento) | 18 modificadas (0,45 %); 14 de ellas corrigen un error o una grafía antigua del propio texto de Tatoeba |
| Estabilidad: repetición del gold añadiendo un token delante de cada frase | 3 frases cambian de resultado |

Los resultados del conjunto gold se obtuvieron con las guardas del lado de aplicación definidas en `gector-guards.json`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se distribuye en ONNX fp32 y está diseñado para CPU. El repositorio ocupa 0,5 GB, con lo que la huella en memoria es compatible con equipos de consumo.
- GPU recomendadas: no necesarias; el autor entrena sobre una NVIDIA L4, pero la inferencia publicada es en CPU mediante ONNX Runtime.
- Cabe en cualquier GPU de consumo (RTX 4090 incluida) si se desea acelerar la inferencia, aunque no es el escenario previsto.
- Despliegue: ONNX Runtime como opción principal; el quickstart oficial usa `onnxruntime`, `tokenizers` y `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `proofbird/gector-bert-de` | 110 M (encoder) + cabezas | no disponible | GECToR sobre BERT alemán, ONNX fp32 on-device | alemán | Apache 2.0 | Hugging Face |
| `proofbird/gector-bert-en` | no disponible | no disponible | GECToR sobre BERT inglés, ONNX on-device | inglés | Apache 2.0 | Hugging Face |
| `dbmdz/bert-base-german-cased` | 110 M | no disponible | BERT encoder-only base, sin cabeza GEC | alemán | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo corrige ediciones locales: no reescribe, no parafrasea y no reformula frases.
- Entrenado exclusivamente con datos sintéticos generados por reglas; no se ha evaluado sobre redacciones de aprendices reales, por lo que su comportamiento en ese dominio es desconocido.
- Fallos conocidos: no corrige `nicht war` → `wahr`, ni una diéresis o un Konjunktiv en la tercera cláusula de una frase larga (`und ich mochte schlafen` → `möchte`), ni `hätte` → `hatte` (lo deja intacto porque ambas formas suelen ser correctas).
- Las guardas de la versión 1.1.0 evitan cambios erróneos en `man` con Konjunktiv I (`Man nehme zwei Eier`), en `das das` tras una forma de `sein` y en plurales tras `die`, `meine` y similares; el coste es que tampoco corrige un `-n` sobrante de un aprendiz en un plural (`die Kindern`).
- Riesgo de falsas alarmas: 0,45 % de frases cotidianas modificadas en la prueba con Tatoeba, con ejemplos como `den Talern` → `Tälern` o `der jüngere der Brüder` → `Jüngere`.
- Puede alucinar sustituciones: aunque el enfoque GECToR restringe la salida a ediciones locales, no se documenta una evaluación de su tasa de alucinación en dominios distintos del de entrenamiento.
- Solo soporta alemán; no hay capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base (`dbmdiz/bert-base-german-cased`, MIT) y de los datos de entrenamiento (Wikipedia y Tatoeba) para producción.
- La versión publicada es la 1.1.0; las guardas de aplicación (`gector-guards.json`) forman parte del comportamiento medido y deben reproducirse para obtener los resultados del conjunto gold.
- No se especifica la longitud máxima de contexto, lo que puede limitar su uso en documentos muy largos sin segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-de
- Tag de la versión 1.1.0: https://huggingface.co/proofbird/gector-bert-de/tree/v1.1.0
- Quickstart (Colab): https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-de/blob/main/quickstart.ipynb
- Modelo base: https://huggingface.co/dbmdz/bert-base-german-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
- Modelo equivalente en inglés: https://huggingface.co/proofbird/gector-bert-en
- BERT (artículo de referencia): https://en.wikipedia.org/wiki/BERT_(language_model)
