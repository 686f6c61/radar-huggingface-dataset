# anudit/tinyemo

## Resumen

tinyemo es un clasificador de texto en inglés especializado en sugerencia de emojis, destilado del modelo Emo de Desert Ant Labs. Dado un sintagma corto, predice una de 812 etiquetas de emoji. No es un modelo generativo: devuelve logits sobre un vocabulario cerrado de emojis, no texto ni emojis directamente. Su interés radica en su tamano extremo: 641.612 parámetros y un artefacto de runtime de menos de 500 KB, lo que permite ejecutarlo en CPU, en el navegador vía ONNX o en dispositivos con recursos muy limitados.

El modelo aplica un preprocesado propio (normalización a letras ASCII y dígitos, uso de las últimas cuatro palabras y n-gramas con hashing) y no es compatible con `AutoModel` ni `AutoTokenizer` de Transformers. Se distribuye con un runtime de referencia en Python, pesos en safetensors y un grafo ONNX equivalente. La licencia es *source-available* de Desert Ant Labs, heredada del modelo profesor, lo que condiciona su uso comercial.

Es relevante ahora como ejemplo de destilación agresiva hacia modelos de bolsillo para tareas de clasificación muy acotadas, donde la latencia y el coste de despliegue importan más que la cobertura lingüística o la generalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de clasificación de texto con preprocesado de tokens y n-gramas hasheados (detalles de capas no disponibles en la información proporcionada) |
| Parametros totales | 641.612 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; usa las últimas cuatro palabras de la entrada |
| Tipos de cuantizacion | Pesos cuantizados y desconvolucionados a float32 en safetensors/ONNX; no se distribuyen ficheros int4/int8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Desert Ant Labs Source-Available (`other`) |
| Formato de pesos | safetensors, ONNX, y binario propietario TEM2 (`tiny_emo.bin`, `tiny_tokenizer.bin`) |

## Arquitectura y entrenamiento

tinyemo es un derivado destilado de Emo. El preprocesado normaliza el texto a letras ASCII y dígitos, toma las últimas cuatro palabras y construye representaciones de tokens (hasta 16) y de n-gramas hasheados (hasta 96 pares bucket/signo). El grafo ONNX consume cinco entradas: `tok_ids` (int64, `[batch, 16]`), `tok_mask` (bool), `ng_bucket` (int64, `[batch, 96, 2]`), `ng_sign` (float32) y `ng_count` (float32). La salida son logits sobre 812 etiquetas de emoji; la softmax posterior no está calibrada como estimación de confianza.

El entrenamiento se basa en predicciones del profesor Emo, no en etiquetado por un LLM. Los datos incluyen fragmentos cortos de GoEmotions, DailyDialog, tweet_eval, SST-2, emotion, Tatoeba y Unicode CLDR, además de contextos construidos a partir del vocabulario del profesor. Las frases del conjunto gold se excluyeron del pool de entrenamiento, aunque sus palabras constituyentes podían aparecer en otros contextos. La selección de modelo se hizo por acuerdo con el profesor en un pool de entrenamiento retenido, mientras que el gold se registró durante el entrenamiento, lo que introduce un caveat metodológico relevante.

## Capacidades

- Clasificación de texto corto en inglés para sugerir uno de 812 emojis.
- Devuelve pares `(emoji, probabilidad)` mediante `suggest`, con el número de resultados limitado a 1–3.
- Preprocesado determinista y reproducible, incluido en el runtime de referencia.
- Exportación a ONNX con dimensión de batch dinámica y ejecución en CPU.
- Carga de pesos en PyTorch vía safetensors con la clase `TinyEmo`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo ni un modelo de emojis general: está pensado para entradas cortas, no para análisis de sentimiento general.

## Casos de uso

- Sugerencia de emojis en interfaces de chat y mensajería: el modelo recibe el texto del usuario y devuelve hasta tres emojis candidatos con probabilidad, con latencia mínima al ejecutarse en CPU o en el cliente.
- Autocompletado de reacciones en redes sociales: dado un fragmento corto de publicación, propone emojis coherentes para reducir la fricción de selección manual.
- Etiquetado ligero de contenidos: clasificación rápida de fragmentos en categorías de emoji para análisis exploratorio o agrupación temática.
- Filtrado y moderación asistida: uso de la etiqueta de emoji como señal auxiliar en pipelines de clasificación de comentarios, combinada con otros modelos.
- Despliegue en el navegador o en dispositivos de borde: el grafo ONNX y el runtime de menos de 500 KB permiten inferencia local sin backend.
- Prototipado y docencia: ejemplo compacto de destilación, preprocesado con hashing y exportación ONNX para experimentos de NLP de bajo coste.
- Integración en aplicaciones móviles: al no requerir GPU y tener un artefacto diminuto, puede empaquetarse en apps con restricciones de tamano y energía.

## Benchmarks y rendimiento

| Metrica | tinyemo | Emo (profesor) |
|---|---|---|
| Top-1 en gold (375 frases etiquetadas a mano) | 87,7 % (IC 95 %: 84,5–90,9 %) | 88,8 % |
| Top-3 en gold | 97,1 % (IC 95 %: 95,2–98,7 %) | 97,1 % |
| Diferencia top-1 pareada | −1,1 pp (IC 95 %: −4,3 a +2,1) | — |
| Acuerdo top-1 con el profesor (6.000 fragmentos retenidos de GoEmotions, DailyDialog y tweet_eval) | 62,2 % | — |

El intervalo de la diferencia top-1 no establece equivalencia con el profesor. El 62,2 % mide acuerdo, no precisión. El conjunto gold es pequeno y etiquetado por el autor, por lo que los resultados pueden no generalizar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo funciona en CPU. Los pesos float32 de 641.612 parámetros ocupan aproximadamente 2,5 MB, y el runtime TEM2 completo son 495.502 bytes.
- GPU recomendadas: no necesarias. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores o entornos WASM, dado el tamano del artefacto.
- Opciones de despliegue: runtime Python de referencia (`tinyemo.runtime.TinyEmoRuntime`), ONNX Runtime con `CPUExecutionProvider`, PyTorch con safetensors, y exportación mediante `export_release.py`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyemo | 641.612 | Últimas 4 palabras | Clasificación de emojis (812 clases) | Source-available (Desert Ant Labs) | Hugging Face |
| Emo (profesor) | No disponible | No disponible | Clasificación de emojis | Source-available (Desert Ant Labs) | Hugging Face |
| Clasificadores de sentimiento tipo DistilBERT | ~66 M | 512 tokens | Sentimiento / emoción | Apache 2.0 o similar | Hugging Face |

La comparación con modelos de sentimiento es solo orientativa: tinyemo no hace análisis de sentimiento general y su vocabulario de salida es un conjunto cerrado de emojis. No se dispone de datos de benchmarks comparables con otras alternativas de sugerencia de emojis.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- Entrada corta: usa únicamente las últimas cuatro palabras, por lo que pierde contexto en frases largas.
- Debilidad documentada con sustantivos poco frecuentes (por ejemplo, "koala").
- Las probabilidades son puntuaciones softmax, no confianza calibrada.
- Riesgo de alucinación en el sentido de asignar emojis poco adecuados cuando la entrada queda fuera de la distribución de entrenamiento.
- El conjunto de evaluación gold es pequeno y etiquetado por el autor; los resultados pueden no generalizar.
- La selección de modelo usó acuerdo con el profesor en un pool retenido, y el gold se registró durante el entrenamiento, lo que puede inflar las métricas.
- Licencia *source-available* de Desert Ant Labs: revisar los términos antes de distribuir o usar comercialmente, y comprobar también las licencias de los datasets de origen.
- No es compatible con `AutoModel` ni `AutoTokenizer`; requiere el runtime propio o el preprocesado exacto para ONNX/PyTorch.
- Los ficheros `model.onnx` y `model.safetensors` contienen pesos cuantizados y desconvolucionados a float32, no ficheros int4/int8; no deben tratarse como tales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anudit/tinyemo
- Modelo profesor Emo: https://huggingface.co/desert-ant-labs/emo
- Licencia Desert Ant Labs: https://license.desertant.com/
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` en el repositorio del modelo
