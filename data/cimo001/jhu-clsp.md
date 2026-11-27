# cimo001/jhu-clsp

## Resumen

`cimo001/jhu-clsp` es una exportación a ONNX de un modelo de lenguaje enmascarado (fill-mask) basado en la familia mmBERT del grupo JHU-CLSP (Johns Hopkins University, Center for Language and Speech Processing). El repositorio contiene una única variante, `mmBERT-small`, en formato FP32 y empaquetada como `model_mask.onnx`, pensada para predicción de palabras enmascaradas en contextos multilingües. No se trata de un modelo generativo ni conversacional: su función es puntuar el token más probable en una posición oculta de una secuencia.

El modelo resuelve la tarea clásica de masked language modeling (MLM) al estilo BERT, pero con una modificación en el grafo: añade una entrada `mask_index` que restringe la proyección al vocabulario únicamente a la posición enmascarada. Esto reduce la salida de `[batch, length, 256000]` a `[batch, 256000]`, lo que según la model card lo hace aproximadamente cuatro veces más rápido sin alterar los valores. El vocabulario de 256 000 tokens y los ejemplos en inglés, italiano y japonés de la model card confirman un alcance multilingüe amplio.

Es relevante ahora por su enfoque práctico de despliegue: un artefacto ONNX autocontenido (0,6 GB) con scripts de ejemplo (`helper.py`, `example.py`) que cubren tokenización, enmascarado, batching, inferencia y softmax, ejecutable con `onnxruntime` en CPU o GPU. La licencia MIT facilita su integración en pipelines de producción sin restricciones comerciales. La información pública disponible es escasa: no se detallan datos de entrenamiento, número de parámetros ni resultados de benchmarks más allá de los ejemplos cualitativos de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (familia mmBERT); exportado a ONNX con entrada adicional `mask_index` |
| Parametros totales | no disponible (variante "small", sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo usa secuencias cortas; sin límite documentado) |
| Tipos de cuantizacion | FP32 (unico formato publicado en el repo) |
| Idiomas soportados | multilingue (ejemplos en ingles, italiano y japones en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_mask.onnx`) + `tokenizer.json` (libreria `tokenizers`) |
| Vocabulario | 256 000 tokens |
| Tamano del repo | 0,6 GB |
| Entradas del grafo | `input_ids` [batch, length], `attention_mask` [batch, length], `mask_index` [batch, 1], todas int64 |
| Salida | logits crudos [batch, 256000]; requiere softmax |
| Tokens especiales | `<pad>` id 0, `<mask>` id 4, anade `<bos>` y `<eos>` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder bidireccional de la familia mmBERT (JHU-CLSP), orientado a representaciones contextuales y a masked language modeling. El artefacto distribuido no es el modelo original en PyTorch, sino una exportación ONNX con un grafo modificado: la proyección al vocabulario se calcula solo en la posición indicada por `mask_index`, de modo que la salida es `[batch, 256000]` en lugar de `[batch, length, 256000]`. Según la model card, los valores son idénticos y la inferencia resulta unas cuatro veces más rápida. El tokenizador se distribuye como `tokenizer.json` y se carga con la librería `tokenizers`, anadiendo `<bos>` y `<eos>`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco probable en un modelo MLM) ni innovaciones adicionales como decodificación especulativa o atención lineal. La model card solo documenta detalles de uso: enmascarar un único token por fila (repitiendo la fila para puntuar varias posiciones), rellenar con `<pad>` y `attention_mask` 0 por lote hasta la secuencia más larga, normalizar la entrada con NFKC para obtener puntuaciones multilingües consistentes, y codificar el texto completo antes de sustituir el id del token a ocultar por `<mask>` (escribir `<mask>` dentro del texto deja un token de espacio sobrante y empeora las predicciones).

## Capacidades

- Predicción de palabras enmascaradas (fill-mask) en contextos multilingües, con puntuaciones de probabilidad por token del vocabulario.
- Puntuación de candidatos léxicos en una posición concreta: útil para desambiguación, corrección y ranking de hipótesis.
- Procesamiento por lotes (`batch`) con padding y `attention_mask`, lo que permite evaluar varias secuencias o varias posiciones repetidas en una sola pasada.
- Inferencia acelerada mediante `mask_index`: solo se proyecta la posición enmascarada, con una salida de 256 000 logits por fila.
- Ejecución en CPU y GPU vía `onnxruntime` / `onnxruntime-gpu`, con selección de proveedor, hilos y opciones de memoria en `helper.py`.
- Capacidades multilingües verificadas cualitativamente en inglés, italiano y japonés en los ejemplos de la model card.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo MLM.

## Casos de uso

- Corrección ortográfica y léxica contextual: dado un texto con una palabra errónea o ambigua, se enmascara esa posición y se comparan los logits del token original frente a las alternativas para decidir si corregir. El vocabulario de 256 000 tokens y el soporte multilingüe lo hacen adecuado para correctores en varios idiomas.
- Desambiguación léxica y sentido de la palabra (WSD): enmascarar el término ambiguo y usar la distribución de probabilidad sobre el vocabulario como señal de contexto para seleccionar el sentido correcto en pipelines de NLP.
- Relleno de huecos en plantillas y formularios: en sistemas de extracción o generación controlada, puntuar candidatos para un hueco concreto (por ejemplo, topónimos o entidades) usando `mask_index` para evaluar solo esa posición.
- Evaluación de fluidez y perplejidad de frases: calcular la probabilidad de tokens enmascarados como métrica de calidad lingüística en datasets multilingües, útil para filtrar corpus o validar traducciones.
- Ranking de hipótesis en sistemas de ASR o traducción: puntuar cada candidato enmascarando la posición correspondiente y ordenar por probabilidad bajo el modelo.
- Servicio ligero de inferencia MLM en producción: al ser un artefacto ONNX de 0,6 GB ejecutable con `onnxruntime` en CPU, encaja en servicios con requisitos modestos de infraestructura y licencia MIT sin restricciones comerciales.
- Normalización y preprocesado multilingüe: combinar la normalización NFKC documentada con la tokenización para construir features consistentes en pipelines de NLP en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de predicción (por ejemplo, `The capital of France is <mask>.` con 0,760337 para `▁Paris`; `La capitale dell'Italia è <mask>.` con 0,289269 para `▁Roma`; `日本の首都は<mask>です。` con 0,329165 para `東京`) y una afirmación de que la variante con `mask_index` es aproximadamente cuatro veces más rápida que el grafo original, sin cifras absolutas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repo ocupa 0,6 GB en FP32, por lo que la inferencia cabe holgadamente en GPUs consumer y en CPU.
- GPU recomendadas: cualquier GPU compatible con `onnxruntime-gpu` (CUDA); para un modelo "small" no se requieren A100 ni H100, bastan tarjetas de gama media o consumer.
- Cabe en GPU consumer: sí, dado el tamano del artefacto (0,6 GB) y la variante "small"; también es viable en CPU.
- Opciones de despliegue: `onnxruntime` (CPU) y `onnxruntime-gpu` (GPU), con selección de proveedor, hilos y opciones de memoria en `helper.py`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo MLM ONNX).
- Latencia y throughput: no disponibles; solo se indica una mejora relativa de aproximadamente 4x con `mask_index` frente al grafo sin esa optimización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| cimo001/jhu-clsp (mmBERT-small ONNX) | no disponible ("small") | no disponible | fill-mask multilingüe | MIT | ONNX |
| BERT-base multilingual (referencia) | ~178 M | 512 | fill-mask multilingüe | Apache 2.0 | PyTorch/safetensors |
| XLM-RoBERTa-base (referencia) | ~278 M | 512 | fill-mask multilingüe | MIT | PyTorch/safetensors |

La comparativa con BERT-base multilingual y XLM-RoBERTa-base se ofrece como referencia de categoría (encoders MLM multilingües); no se dispone de datos de rendimiento comparativo para `cimo001/jhu-clsp`, por lo que no es posible establecer una comparación cuantitativa. La ventaja diferencial de este artefacto es su empaquetado ONNX con la optimización `mask_index` y su licencia MIT.

## Limitaciones y advertencias

- Modelo exclusivamente MLM: no genera texto libre, no soporta tool calling, agentes, visión ni audio.
- Información muy escasa: no se publican número de parámetros, datos de entrenamiento, contexto máximo ni benchmarks; la evaluación rigurosa en producción requiere pruebas propias.
- Riesgo de sesgos: al no documentarse la composición del corpus de entrenamiento, no es posible evaluar sesgos de género, etnia o geográficos; deben auditarse antes de uso sensible.
- Riesgo de alucinación léxica: las predicciones son distribuciones sobre 256 000 tokens y pueden favorecer candidatos plausibles pero incorrectos; conviene combinar con verificación externa.
- Restricciones de uso del grafo: una sola posición enmascarada por fila (repetir la fila para varias posiciones), codificar el texto completo antes de sustituir por `<mask>` y normalizar con NFKC; ignorar estas reglas degrada las puntuaciones.
- Cobertura idiomática no cuantificada: los ejemplos solo cubren inglés, italiano y japonés; el rendimiento en otras lenguas (incluido el castellano) no está documentado.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; el artefacto se publica sin mantenimiento declarado (0 descargas, creado y actualizado el mismo día).
- Fecha de creación declarada (2026-11-27) posterior a la fecha habitual de consulta: verificar la vigencia y procedencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/cimo001/jhu-clsp
- Script de ejemplo: `mmBERT-small/src/example.py` (dentro del repositorio)
- Constructor de sesión ONNX: `mmBERT-small/src/helper.py` (dentro del repositorio)
- Tokenizador: `mmBERT-small/onnx/tokenizer.json` (dentro del repositorio)
- Modelo ONNX: `mmBERT-small/onnx/model_mask.onnx` (dentro del repositorio)
- JHU-CLSP (organización de referencia): no se ha encontrado enlace directo en la información proporcionada.
