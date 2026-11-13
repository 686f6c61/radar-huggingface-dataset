# pecan-anon/xlm-roberta-pecan

## Resumen

XLM-RoBERTa-PECAN es un modelo de clasificación de texto obtenido por fine-tuning de `FacebookAI/xlm-roberta-base` sobre el benchmark PECAN. Su tarea concreta es identificar el lenguaje de programación de un fragmento de código en bruto de 512 bytes, sin disponer de nombre de fichero ni extensión, y cubriendo un conjunto de 319 lenguajes. Lo publica el usuario `pecan-anon` bajo licencia MIT, con pesos en safetensors y compatibilidad con la librería `transformers` y con Text Embeddings Inference.

El modelo resuelve un problema clásico en pipelines de análisis de código: la detección de lenguaje cuando los metadatos del fichero no son fiables o no existen (fragmentos pegados en chats, logs, respuestas de API, contenido ofuscado). Al partir de un encoder multilingüe XLM-RoBERTa, reutiliza representaciones subword ya entrenadas en decenas de idiomas naturales, lo que resulta útil porque los lenguajes de programación comparten identificadores, comentarios y cadenas en lenguaje natural.

Con 278.288.959 parámetros, es un modelo compacto (repo de 1,1 GB) apto para inferencia en CPU y GPU de consumo. La model card reporta en el split de test una accuracy de 0,9532 y un macro-F1 de 0,9244 sobre 319 clases. No se han publicado datos sobre composición del dataset de entrenamiento, hiperparámetros ni idiomas naturales soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para clasificación de secuencias |
| Parametros totales | 278.288.959 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud de entrada del fragmento de código según la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantización estándar de `transformers`/PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa es multilingüe, pero el autor no detalla idiomas naturales; la salida son 319 lenguajes de programación) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa base: un transformer encoder con 12 capas, atención multi-cabeza y tokenización SentencePiece, adaptado mediante fine-tuning a una cabeza de clasificación con 319 etiquetas (una por lenguaje de programación). La entrada es un fragmento de código en bruto de 512 bytes, sin extensión ni nombre de fichero, según indica la model card.

El autor no detalla el número de tokens de entrenamiento, la composición del dataset PECAN, los hiperparámetros de fine-tuning ni si hubo etapas de ajuste adicional (RLHF, DPO u otras). La única información de evaluación publicada es la del split de test: accuracy 0,9532 y macro-F1 0,9244. El código del benchmark y del pipeline de scoring está enlazado en la model card (repositorio anónimo en 4open.science).

## Capacidades

- Clasificación de lenguaje de programación a partir de fragmentos de código en bruto de hasta 512 bytes, sobre un vocabulario de 319 lenguajes.
- Funciona sin nombre de fichero ni extensión, lo que permite usarlo sobre texto pegado, logs o contenido generado dinámicamente.
- Salida de clasificación multi-clase (una etiqueta por fragmento).
- Reutiliza el tokenizador multilingüe de XLM-RoBERTa, por lo que tolera comentarios e identificadores en lenguaje natural dentro del código.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües en lenguaje natural: no documentadas por el autor.

## Casos de uso

- Detección de lenguaje en pipelines de análisis estático: clasificar fragmentos de código sin extensión antes de aplicar linters o reglas específicas del lenguaje, usando la etiqueta predicha para enrutar el análisis.
- Enrutado en editores y plataformas de código: al pegar un snippet en un chat o en una web de documentación, el modelo identifica el lenguaje y selecciona el resaltado de sintaxis y el formateador adecuados.
- Anonimización y auditoría de logs: identificar el lenguaje de fragmentos de código que aparecen en logs de aplicaciones o respuestas de API para aplicar políticas de redacción o revisión por lenguaje.
- Clasificación de contenido en repositorios y datasets: etiquetar grandes volúmenes de ficheros o fragmentos sin extensión fiable (por ejemplo, contenido ofuscado o generado) para construir inventarios de lenguajes.
- Moderación y filtrado de contenido generado: detectar si un texto contiene código y en qué lenguaje antes de aplicar reglas de seguridad o de formato.
- Investigación en benchmarks de detección de lenguaje: usar el modelo como baseline reproducible sobre PECAN, dado que el autor publica el artefacto y el código de scoring.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (split de test, PECAN) | 0,9532 |
| Macro-F1 (split de test, PECAN) | 0,9244 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB de pesos (278 M de parámetros), más overhead de activaciones y tokenizador; en la práctica cabe en cualquier GPU con 2 GB o más.
- En FP32: alrededor de 1,1 GB de pesos, también holgado en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna; para lotes grandes, A100, H100 o L4; para uso interactivo, RTX 4090, RTX 3090 o incluso GPUs integradas.
- Cabe en GPU de consumo: sí, en todas las gamas actuales (RTX 3060 en adelante) y en CPU para inferencia en lote.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (el modelo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX o cuantización estándar de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLM-RoBERTa-PECAN | 278 M | 512 tokens | Clasificación de lenguaje de programación (319 clases) | MIT | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 tokens | Representaciones multilingües genéricas | MIT | Hugging Face |
| CodeBERT | no disponible en esta ficha | 512 tokens | Representaciones de código (no clasificador de 319 lenguajes) | MIT | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- La evaluación se limita al split de test de PECAN; no hay validación independiente publicada por terceros.
- El modelo clasifica fragmentos de 512 bytes; fragmentos más largos deben truncarse o dividirse, lo que puede degradar la precisión en ficheros grandes.
- La precisión puede caer en lenguajes con sintaxis muy solapada (dialectos de shell, variantes de C, lenguajes embebidos en plantillas) y en fragmentos muy cortos o con mucho texto natural.
- No se documentan sesgos del dataset PECAN ni su composición, por lo que se desconoce el equilibrio entre las 319 clases y el posible sesgo hacia lenguajes sobrerrepresentados.
- Riesgo de alucinación bajo: es un clasificador, no un generador; el riesgo se traslada a falsos positivos en la etiqueta predicha.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset PECAN y del modelo base XLM-RoBERTa.
- El autor figura como `pecan-anon` y el repositorio del benchmark es anónimo; la trazabilidad y el mantenimiento del modelo no están garantizados.
- No hay información sobre idiomas naturales soportados ni sobre el rendimiento en código con comentarios en idiomas distintos del inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pecan-anon/xlm-roberta-pecan
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Código y artefacto del benchmark PECAN: https://anonymous.4open.science/r/pecan-benchmark
