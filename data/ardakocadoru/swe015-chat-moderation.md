# ardakocadoru/swe015-chat-moderation

## Resumen

`swe015-chat-moderation` es un modelo de clasificación de texto en turco para moderación de chat en tiempo real, desarrollado por Arda Kocadoru como parte de un trabajo académico (SWE015, caso de uso 4). Se trata de un fine-tuning de `dbmdz/bert-base-turkish-cased` sobre el corpus OffensEval-TR 2020, con un esquema binario de etiquetas: `NOT` (limpio) y `OFF` (ofensivo). El modelo se distribuye en varios formatos y niveles de optimización (PyTorch FP32, ONNX FP32 y ONNX INT8 dinámico), siendo esta última la variante servida por la aplicación de referencia.

La relevancia del modelo es fundamentalmente práctica: demuestra un pipeline completo de moderación con comparación rigurosa frente a líneas base más ligeras (lexicón por distancia de edición, tf-idf + regresión logística, word2vec + FFN, word2vec + CNN). La variante INT8 alcanza un macro-F1 de 0,815 en el conjunto de test oficial de OffensEval-TR 2020 (3.528 tuits) con una latencia media de 27,9 ms en un solo hilo de CPU, lo que lo hace viable para despliegue en servidores modestos sin GPU.

El alcance es limitado y específico: solo turco, solo clasificación binaria, y entrenado sobre tuits en lugar de chat de videojuegos, lo que el propio autor señala como una limitación para insultos velados. No es un modelo generativo ni soporta tool calling, agentes ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, fine-tuning para clasificación) |
| Parametros totales | no disponible (modelo base BERTurk; repo de 1,0 GB con múltiples variantes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (PyTorch y ONNX), INT8 dinámica (ONNX) |
| Idiomas soportados | Turco (tr) |
| Licencia | CC-BY-2.0 |
| Formato de pesos | safetensors, ONNX (model_fp32.onnx, model_int8.onnx), joblib (variantes ligeras) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de `dbmdz/bert-base-turkish-cased` (licencia MIT) para clasificación binaria de texto. La arquitectura subyacente es un transformer encoder tipo BERT en configuración base, con tokenización case-sensitive adaptada al turco. Sobre el checkpoint se añade una cabeza de clasificación con dos etiquetas (`NOT`/`OFF`) y un umbral de decisión ajustado sobre el split de validación, cuyo valor se almacena en cada `meta.json`.

El entrenamiento se realizó sobre el corpus OffensEval-TR 2020 de Çağrı Çöltekin (LREC 2020, CC-BY 2.0), compuesto por tuits en turco anotados como ofensivos o no ofensivos. La evaluación se hace sobre el conjunto de test oficial de 3.528 tuits. El autor no documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo técnicas de aumento de datos o regularización específicas. La innovación técnica destacable no está en la arquitectura, sino en el pipeline de optimización para producción: exportación a ONNX y cuantización dinámica INT8, que reduce el tamaño de 422 MB a 106 MB y la latencia de 81,7 ms a 27,9 ms (medido en Ryzen 7 5700X, batch 1, 300 ejecuciones, un hilo de CPU) manteniendo el macro-F1 (0,814 → 0,815).

## Capacidades

- Clasificación binaria de texto en turco: asigna `NOT` (limpio) u `OFF` (ofensivo) a una entrada de texto.
- Moderación de chat en tiempo real: latencia de 27,9 ms por inferencia en CPU de un solo hilo con la variante INT8.
- Detección de lenguaje ofensivo en tuits y textos cortos en turco.
- Despliegue sin GPU: las variantes ONNX INT8 y los modelos ligeros (tf-idf, word2vec) permiten servir en CPU.
- Umbral de decisión configurable por variante, ajustado en validación y almacenado en `meta.json`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente turco.

## Casos de uso

- Moderación de chat en vivo en comunidades turcas: el modelo clasifica cada mensaje como limpio u ofensivo con 27,9 ms de latencia en CPU, suficiente para filtrar en tiempo real sin infraestructura GPU. La variante INT8 es la servida por la aplicación de referencia.
- Filtrado previo de comentarios en plataformas de noticias o foros en turco: se puede integrar como paso de triaje antes de la revisión humana, reduciendo el volumen de mensajes que llegan a moderadores.
- Moderación en aplicaciones de mensajería o comunidades de videojuegos en turco: aunque el autor advierte que el modelo se entrenó con tuits y no con chat de juego, sirve como primera línea de detección de insultos directos.
- Despliegue en entornos con recursos limitados: la variante ONNX INT8 (106 MB) cabe en servidores pequeños o incluso en dispositivos edge, y el pipeline incluye alternativas aún más ligeras (tf-idf de 2,2 MB con macro-F1 de 0,769) para escenarios de muy bajo coste.
- Evaluación comparativa de enfoques de moderación: el repositorio incluye cinco líneas base (lexicón, tf-idf, word2vec+FFN, word2vec+CNN, BERTurk) con métricas y latencias medidas, útil como referencia para investigadores que quieran reproducir o comparar.
- Investigación en NLP turco: el modelo y los scripts de entrenamiento permiten reproducir el fine-tuning sobre OffensEval-TR 2020 y experimentar con cuantización o umbrales de decisión.
- Prototipado rápido de sistemas de moderación: la aplicación `python app.py` descarga solo los archivos necesarios (~135 MB) y sirve el modelo sin configuración adicional.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test oficial de OffensEval-TR 2020 (3.528 tuits), medidos en Ryzen 7 5700X (batch 1, 300 ejecuciones, un hilo de CPU):

| Variante | Modelo | Macro-F1 test | Tamaño | Latencia media (1 hilo CPU) |
|---|---|---|---|---|
| `lexicon/` | Lexicón por distancia de edición (línea base) | 0,667 | 0,001 MB | 0,17 ms |
| `tfidf/` | tf-idf + regresión logística | 0,769 | 2,2 MB | 1,7 ms |
| `w2v_ffn/` | word2vec propio + red feedforward | 0,689 | 11,8 MB | 0,3 ms |
| `w2v_cnn/` | word2vec propio + CNN 1D | 0,728 | 11,8 MB | 0,6 ms |
| `berturk_fp32/` | BERTurk fine-tuned, PyTorch FP32 | 0,814 | 422 MB | 81,7 ms |
| `berturk_onnx/model_fp32.onnx` | Mismo modelo, ONNX Runtime FP32 | 0,814 | 422 MB | 54,4 ms |
| `berturk_onnx/model_int8.onnx` | Mismo modelo, INT8 dinámica (servida) | 0,815 | 106 MB | 27,9 ms |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para las variantes ONNX y ligeras, que se ejecutan en CPU. La variante PyTorch FP32 (422 MB de pesos) puede ejecutarse en GPU con muy poca VRAM, pero no se documentan requisitos específicos.
- GPU recomendadas: no disponible; el modelo está diseñado para inferencia en CPU.
- Cabe en GPU consumer: sí, cualquier GPU consumer puede alojar los 422 MB de pesos FP32, aunque el caso de uso principal es CPU.
- Opciones de despliegue: ONNX Runtime (variantes `model_fp32.onnx` y `model_int8.onnx`), PyTorch (variante `berturk_fp32`), y la aplicación de referencia `python app.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 27,9 ms por inferencia (batch 1, un hilo de CPU) con INT8; 54,4 ms con ONNX FP32; 81,7 ms con PyTorch FP32. No se documenta throughput para batch mayor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (OffensEval-TR 2020) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `swe015-chat-moderation` (INT8) | no disponible (BERT base) | no disponible | 0,815 | CC-BY-2.0 | Hugging Face |
| `swe015-chat-moderation` (FP32) | no disponible (BERT base) | no disponible | 0,814 | CC-BY-2.0 | Hugging Face |
| tf-idf + regresión logística (incluido) | no aplica | no aplica | 0,769 | CC-BY-2.0 | Incluido en el repo |
| word2vec + CNN (incluido) | no disponible | no aplica | 0,728 | CC-BY-2.0 | Incluido en el repo |

No se dispone de datos de otros modelos de moderación en turco comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre tuits, no sobre chat de videojuegos: el autor advierte que los insultos velados o indirectos suelen pasar desapercibidos en dominios conversacionales distintos.
- Solo turco: no soporta otros idiomas.
- Clasificación binaria: no distingue tipos o grados de ofensividad, solo `NOT`/`OFF`.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí riesgo de falsos negativos y falsos positivos en la clasificación.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el corpus de tuits puede reflejar sesgos de la plataforma y de la anotación.
- Licencia CC-BY-2.0: permite uso comercial con atribución, pero conviene verificar las condiciones del corpus OffensEval-TR 2020 y del modelo base (MIT) para producción.
- Umbral de decisión ajustado en validación: el rendimiento en producción puede variar si la distribución del tráfico difiere del conjunto de test.
- Repositorio con múltiples variantes (1,0 GB): la aplicación descarga solo los archivos que sirve (~135 MB), pero el repo completo incluye pesos no necesarios para el despliegue INT8.
- Sin métricas de throughput en batch ni de latencia en GPU: las cifras publicadas son de batch 1 en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ardakocadoru/swe015-chat-moderation
- Repositorio de código, scripts de entrenamiento y aplicación: https://github.com/ardakocadoru/swe015-chat-moderation
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset OffensEval-TR 2020 (Çöltekin, LREC 2020): no disponible como enlace directo en la información proporcionada
