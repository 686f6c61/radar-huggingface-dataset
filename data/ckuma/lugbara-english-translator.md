# ckuma/lugbara-english-translator

## Resumen

El modelo `ckuma/lugbara-english-translator` es un sistema de traducción automática neuronal desarrollado por ckuma a partir de un ajuste fino de `google/mt5-base`. Su propósito concreto es traducir del lugbara y del luganda al inglés, dos lenguas de Uganda con escasos recursos digitales. El modelo se enmarca en el trabajo de tesis de Charity Driciru Akuma en la Universidad de Muni (2025), que identificó mT5 como la arquitectura óptima para la traducción lugbara→inglés tras comparar varias alternativas.

Con 582 millones de parámetros, se trata de un modelo seq2seq de tamaño medio que hereda el tokenizador multilingüe de mT5 y se ha entrenado sobre el corpus público Sunbird SALT, compuesto por frases cortas de dominios como agricultura, salud y vida comunitaria. La relevancia actual reside en que aborda un par de lenguas prácticamente ausente en los sistemas comerciales de traducción, ofreciendo una base reproducible y de licencia permisiva para investigadores y organizaciones que trabajen con lenguas ugandesas.

El modelo se publica con licencia Apache 2.0, lo que permite uso comercial, y sigue una metodología documentada paso a paso (preprocesado, búsqueda de hiperparámetros, split de datos), lo que facilita su reproducción y auditoría por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5 base, seq2seq) |
| Parámetros totales | 582.401.280 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con frases cortas; `max_new_tokens=128` en el ejemplo) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | inglés (en), luganda (lg), lugbara (lgg) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/mt5-base |
| Tamaño del repositorio | 2,4 GB |
| Pipeline | translation (text2text-generation) |
| Dataset de entrenamiento | Sunbird/salt (CC BY-SA 4.0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google/mt5-base`, un transformer encoder-decoder con tokenizador SentencePiece multilingüe y vocabulario compartido. La tarea se formula como text2text-generation con un tag de idioma destino antepuesto a la frase de entrada (`<2en>`), siguiendo la convención de mT5. El preprocesado aplica minúsculas, normaliza la puntuación, unifica todas las variantes de apóstrofo a `'` y elimina pares vacíos, duplicados o malformados.

Los datos provienen del corpus de la tesis (15.524 pares inglés–lugbara, no público), por lo que se muestrearon aleatoriamente el mismo número de frases de la tabla `text-all` del dataset Sunbird SALT con semilla 13, divididas 70/15/15 (10.867 entrenamiento, 2.329 validación, 2.328 test). El luganda reutiliza las mismas frases. Se realizó una búsqueda en rejilla sobre tasa de aprendizaje y tamaño de lote (0,0003/8 → 3,79 BLEU; 0,0003/16 → 1,4 BLEU; 0,0005/8 → 3,05 BLEU; 0,0005/16 → 1,68 BLEU; 0,001/8 → 0,27 BLEU; 0,001/16 → 4,11 BLEU), y el ajuste final usó lr 0,001, batch 16, optimizador Adafactor y early stopping sobre la pérdida de validación (paciencia 3), durante 8.154 pasos y 83,5 minutos en una GPU de Kaggle.

No se documenta el uso de RLHF, DPO ni decodificación especulativa. La innovación principal es metodológica: la adaptación de un modelo multilingüe genérico a un par de lenguas de muy bajos recursos con un corpus público y un protocolo reproducible.

## Capacidades

- Traducción lugbara → inglés mediante el tag `<2en>`.
- Traducción luganda → inglés mediante el mismo tag `<2en>` (el autor indica el mismo tag para ambas direcciones).
- Generación de texto seq2seq condicionada por tag de idioma.
- Manejo de texto en minúsculas con apóstrofos normalizados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada a los tres idiomas declarados (en, lg, lgg).

## Casos de uso

- Traducción de documentación sanitaria comunitaria: el modelo puede convertir materiales de salud escritos en lugbara o luganda a inglés para su revisión por parte de organismos internacionales, aprovechando que el corpus SALT incluye contenido de salud.
- Localización de contenidos agrícolas: informes y guías agrarias en lugbara pueden traducirse al inglés para su publicación en portales regionales, dado que la agricultura es uno de los dominios representados en el entrenamiento.
- Investigación lingüística comparada: permite generar traducciones de referencia para estudiar estructuras del lugbara y del luganda, con la salvedad de que las salidas deben ser revisadas por hablantes nativos.
- Preservación digital de lenguas: sirve como base para digitalizar textos comunitarios en lugbara y hacerlos accesibles en inglés, contribuyendo a la documentación de lenguas de bajos recursos.
- Prototipado de asistentes de traducción para ONG: organizaciones que operan en Uganda pueden integrar el modelo en herramientas internas de traducción de campo, con la limitación de que solo cubre frases cortas y dominios concretos.
- Evaluación comparativa de modelos de traducción de bajos recursos: investigadores pueden usar este modelo como línea base reproducible (con hiperparámetros y split documentados) para comparar nuevas técnicas sobre SALT.
- Educación bilingüe: generación de glosas en inglés para textos escolares en lugbara o luganda, siempre con revisión humana dado el riesgo de errores en frases largas o de dominio no visto.

## Benchmarks y rendimiento

Resultados en el split de test (4.656 pares de frases; 2.328 por dirección):

| Dirección | Frases | BLEU ↑ | TER ↓ | Word F1 ↑ | chrF ↑ | Mejor BLEU de la tesis* |
|---|---|---|---|---|---|---|
| Lugbara → inglés | 2.328 | 12,71 | 73,47 | 0,3942 | 34,73 | 25,41 (mT5 tuned) |
| Luganda → inglés | 2.328 | 16,65 | 67,81 | 0,4455 | 38,88 | no disponible |

\*Las puntuaciones de la tesis se midieron sobre su propio corpus, no sobre SALT, por lo que son un punto de referencia y no una comparación directa.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos; en torno a 2 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, RTX 4090, RTX 3090, RTX 3060 o T4 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en GTX 1660 (6 GB), RTX 3050, RTX 4060 y superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), vLLM (soporte seq2seq limitado), TGI, y conversión a GGUF para llama.cpp/Ollama si se realiza la conversión (no se proporciona GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento de 8.154 pasos tardó 83,5 minutos en una GPU de Kaggle, lo que sugiere un coste de inferencia bajo para frases cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | BLEU lugbara→inglés | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ckuma/lugbara-english-translator | 582 M | no disponible | en, lg, lgg | 12,71 (SALT) | Apache 2.0 | HuggingFace |
| google/mt5-base (sin ajuste) | 582 M | 512 tokens (típico mT5) | 101 idiomas | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| mmuniversity/rutooro-multilingual-translator | no disponible | no disponible | lenguas ugandesas (rutooro y otras) | no disponible | no disponible | HuggingFace |
| NLLB-200 (200 idiomas) | 600 M–54 B según variante | 512 tokens | 200 idiomas (no incluye lugbara) | no disponible | CC-BY-NC 4.0 (variantes grandes) | HuggingFace |

La comparación directa es limitada: NLLB no cubre lugbara, y el modelo de Mountains of the Moon University se centra en rutooro. El modelo de ckuma es, según la información disponible, una de las pocas opciones públicas específicas para lugbara→inglés.

## Limitaciones y advertencias

- Entrenado con frases cortas de SALT (agricultura, salud, vida comunitaria); el rendimiento en otros dominios es más débil.
- Solo acepta texto en minúsculas; el uso de mayúsculas puede degradar la calidad.
- El tono no se escribe en lugbara, por lo que las diferencias exclusivamente tonales se pierden.
- Las métricas automáticas usan una sola referencia por frase; se recomienda revisión por hablantes nativos antes de cualquier uso en producción.
- Los ejemplos de la model card muestran errores semánticos notables (por ejemplo, traducir una frase sobre coches como "car accidents should be avoided" o confundir "ochenta y ocho" con "ocho"), lo que evidencia riesgo de alucinación y de pérdida de información numérica.
- El corpus de la tesis no es público, lo que limita la reproducibilidad exacta del entrenamiento original.
- El split de SALT es aleatorio, no estratificado por dominio, al no disponer de etiquetas de dominio.
- La licencia Apache 2.0 permite uso comercial, pero el dataset SALT es CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de los datos.
- No se documenta el comportamiento en frases largas ni en contextos de más de 128 tokens generados.
- Riesgo de sesgos derivados del corpus SALT, limitado a temáticas comunitarias y agrícolas de Uganda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ckuma/lugbara-english-translator
- Modelo base: https://huggingface.co/google/mt5-base
- Dataset Sunbird SALT: https://huggingface.co/datasets/Sunbird/salt
- Trabajo previo (Mountains of the Moon University): https://huggingface.co/mmuniversity/rutooro-multilingual-translator
- Análisis lingüístico del lugbara: https://huggingface.co/ckuma/lugbara-english-translator/blob/main/LUGBARA_ANALYSIS.md
- Tesis de referencia: C. D. Akuma, *An Optimized Machine Translation Model for Low-Resource Lugbara Language*, MSc Computer Science, Muni University (octubre 2025); no se proporciona URL directa.
