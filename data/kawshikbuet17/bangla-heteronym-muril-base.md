# kawshikbuet17/bangla-heteronym-muril-base

## Resumen

Bangla Heteronym Reader (MuRIL-base) es un modelo de clasificación de lecturas para heterónimos del bengalí, desarrollado por Kawshik Kumar Paul (BUET) y publicado en Hugging Face. Aborda un problema específico de la síntesis de voz en bengalí: muchas palabras se escriben igual pero se pronuncian de forma distinta según el contexto oracional (heterónimos u homógrafos), lo que provoca errores en cualquier sistema de text-to-speech que no resuelva la ambigüedad. El modelo recibe una frase con la palabra marcada y devuelve la lectura correcta como una reescritura fonética en escritura bengalí.

Se trata de un fine-tuning de `google/muril-base-cased`, un transformer BERT multilingüe especializado en lenguas del subcontinente indio, con 237,5 millones de parámetros. Sobre la codificación de MuRIL se añade una cabeza lineal pequeña que puntúa las lecturas candidatas de cada palabra a partir del token marcador de apertura. El modelo está entrenado exclusivamente sobre el dataset `kawshikbuet17/bangla-heteronyms` y su ámbito de aplicación es acotado: solo cubre los heterónimos presentes en ese dataset.

Su relevancia es práctica más que arquitectónica: proporciona un componente de preprocesado para pipelines de TTS en bengalí con una latencia muy baja (10,3 ms por frase en una Tesla T4 en fp16) y una precisión del 96,92 % en el conjunto de test. No obstante, el propio autor indica que, dentro de su benchmark de 12 modelos, este checkpoint ocupa el undécimo puesto por precisión media y recomienda `bangla-heteronym-banglabert` (99,46 %) para la mayoría de usos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza lineal de clasificación sobre el token marcador |
| Parámetros totales | 237.556.224 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, fp32/fp16 en inferencia) |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un encoder BERT de 12 capas y 237,5 M de parámetros preentrenado por Google sobre texto multilingüe con énfasis en lenguas del subcontinente indio. La adaptación a la tarea consiste en un fine-tuning supervisado con una cabeza lineal adicional: la entrada se construye concatenando la palabra objetivo con la frase en la que aparece marcada mediante delimitadores (`@`), y la capa lineal puntúa, a partir del estado del token marcador de apertura, cada una de las lecturas candidatas registradas para esa palabra en `model.hconfig["candidates"]`. La lectura con mayor puntuación es la que se devuelve.

El entrenamiento se realizó sobre el dataset `kawshikbuet17/bangla-heteronyms`, con 14 frases por lectura, usando AdamW, learning rate 5e-5, batch size 32, precisión fp16, un máximo de 10 épocas con early stopping sobre la precisión de desarrollo y una única GPU Tesla T4. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO, algo esperable en una tarea de clasificación supervisada de este tamaño. La innovación técnica es modesta y de dominio: la representación de la lectura como reescritura en escritura bengalí (con hasanta + ZWNJ para hacer visible el hasanta) en lugar de una transcripción IPA, lo que simplifica la integración en el front-end de un sistema TTS.

## Capacidades

- Clasificación de la lectura correcta de heterónimos bengalíes en contexto oracional.
- Reescritura fonética de frases completas: `phoneticize(text)` sustituye cada heterónimo por su lectura y deja el resto del texto intacto.
- Salida detallada con posición, lectura y confianza por heterónimo mediante `phoneticize_detailed(text)`.
- Predicción de una palabra concreta en una frase (`predict`) y de una ocurrencia marcada con corchetes (`predict_marked`).
- Reescritura selectiva de las palabras marcadas (`phoneticize_marked`).
- Versiones por lotes de todos los métodos (`_batch`) para procesar listas de frases con un solo pase por el modelo.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. Es un componente de clasificación de una sola tarea.

## Casos de uso

- Preprocesado en pipelines de text-to-speech en bengalí: el modelo se sitúa delante del sintetizador para reescribir los heterónimos con su lectura correcta antes de la conversión grafema-fonema, resolviendo la ambigüedad que de otro modo produciría pronunciaciones erróneas.
- Lectura de noticias y artículos en voz alta: con 10,3 ms por frase en T4 y unas 2.000 frases por segundo a batch 32, puede procesar lotes completos de contenido editorial sin convertirse en cuello de botella.
- Asistentes de voz y agentes conversacionales en bengalí: la latencia de 40 ms en 4 hilos de CPU permite integrarlo en servicios desplegados sin GPU dedicada, manteniendo la respuesta por debajo del umbral perceptible.
- Audiolibros y contenido educativo: `phoneticize_detailed` devuelve confianza por palabra, lo que permite marcar fragmentos para revisión humana cuando la confianza es baja y mantener una cola de control de calidad.
- Herramientas de accesibilidad para lectores de pantalla: el modelo puede insertarse como capa de normalización de texto antes del motor de síntesis, mejorando la inteligibilidad de palabras ambiguas en interfaces de accesibilidad.
- Investigación en procesamiento del bengalí: sirve como línea base reproducible en el benchmark de heterónimos del autor, con puntos de comparación directos frente a otros 11 modelos y semillas documentadas.
- Enriquecimiento de corpus y anotación lingüística: las salidas por lotes permiten anotar automáticamente lecturas de heterónimos en corpus de texto bengalí para su posterior revisión o uso en entrenamiento.

## Benchmarks y rendimiento

Conjunto de test del split principal: 1.104 frases, 3 por lectura.

| Modelo / medida | Accuracy | Macro-F1 |
|---|---|---|
| Este checkpoint (semilla 42) | 96,92 % | 96,62 % |
| Media de 3 semillas | 95,89 ± 1,04 % | 95,54 ± 1,13 % |

Rendimiento de inferencia documentado por el autor:

| Escenario | Latencia / throughput |
|---|---|
| Por frase, batch 1, Tesla T4 (fp16) | 10,3 ms |
| Por frase, 4 hilos de CPU | 40 ms |
| Batch 32 en T4 | ~2.000 frases/s |

Posición en el benchmark del autor: undécimo de 12 modelos por precisión media en test. El modelo recomendado por el propio autor dentro del benchmark es `bangla-heteronym-banglabert` (99,46 % de accuracy, 12,5 ms en T4).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 237,5 M de parámetros; en fp16 ocupa aproximadamente 0,5 GB de pesos, y con activaciones y overhead de framework cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. El autor reporta mediciones en Tesla T4; también es viable en RTX 3060, RTX 4090, A100 o H100, aunque en estas últimas el cuello de botella será el procesado de texto, no el cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 2 GB o más de VRAM; también funciona en CPU (40 ms por frase con 4 hilos).
- Opciones de despliegue: la model card indica que debe cargarse con el código del repositorio `bangla-heteronym-benchmark` (`src.predict.Predictor`), ya que incorpora una cabeza personalizada. No se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI; al ser un encoder BERT con cabeza de clasificación, esos motores de generación no son el entorno natural.
- Latencia y throughput: 10,3 ms por frase en T4 fp16; 40 ms por frase en CPU con 4 hilos; ~2.000 frases/s en T4 a batch 32.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Accuracy (test) | Latencia (T4) | Licencia |
|---|---|---|---|---|---|
| bangla-heteronym-muril-base (este) | 237,5 M | Lectura de heterónimos bn | 96,92 % (semilla 42) / 95,89 % media | 10,3 ms | Apache 2.0 |
| bangla-heteronym-banglabert | no disponible | Lectura de heterónimos bn | 99,46 % | 12,5 ms | no disponible |
| google/muril-base-cased (base) | 237,5 M | Encoder multilingüe general | no aplica (no resuelve la tarea sin fine-tuning) | no disponible | Apache 2.0 |

El benchmark del autor incluye 12 modelos en total; la model card solo detalla los datos de este checkpoint y de `bangla-heteronym-banglabert`. No se dispone de cifras de los otros 10 modelos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura restringida: solo resuelve los heterónimos presentes en el dataset `kawshikbuet17/bangla-heteronyms`. Para cualquier otra palabra, `predict` lanza un `ValueError` porque no hay lecturas candidatas.
- Generalización limitada: las frases del dataset fueron escritas específicamente para él, por lo que el autor advierte que la precisión en texto real puede ser inferior al 96,92 % reportado.
- No es el mejor modelo de su propio benchmark: ocupa el undécimo puesto de 12 por precisión media y el autor recomienda `bangla-heteronym-banglabert` para la mayoría de usos.
- Variabilidad entre semillas: la media de 3 semillas es 95,89 % ± 1,04 %, casi un punto por debajo del checkpoint publicado, lo que indica cierta sensibilidad al inicializado.
- Sesgos: no se documentan análisis de sesgo lingüístico, dialectal o de registro; el dataset no parece cubrir variación regional del bengalí.
- Riesgo de alucinación: bajo en el sentido generativo (no genera texto libre), pero puede asignar una lectura incorrecta con confianza alta en frases fuera de distribución; conviene usar `phoneticize_detailed` y filtrar por umbral de confianza en producción.
- Integración no estándar: requiere el código del repositorio del autor para cargar la cabeza personalizada; no es plug-and-play con `transformers` ni con motores de inferencia habituales.
- Licencia: Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base `google/muril-base-cased`; los pesos han sido modificados mediante fine-tuning.
- Idiomas: exclusivamente bengalí; no hay soporte para otras lenguas del subcontinente ni para transliteración a otros alfabetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kawshikbuet17/bangla-heteronym-muril-base
- Modelo base: https://huggingface.co/google/muril-base-cased
- Dataset de heterónimos: https://huggingface.co/datasets/kawshikbuet17/bangla-heteronyms
- Repositorio del benchmark (código de carga e inferencia): https://github.com/kawshikbuet17/bangla-heteronym-benchmark
- Modelo alternativo recomendado por el autor: https://huggingface.co/kawshikbuet17/bangla-heteronym-banglabert
