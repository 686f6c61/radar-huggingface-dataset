# Hooshaai/bert-svd-attention-sst2

## Resumen

BERT-SVD-Attention-SST2 es un checkpoint derivado de `google-bert/bert-base-uncased` en el que el autor (Hooshaai, identificado en la model card como Taha Majlesi, autor de la librería NeuralOps) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `svd_attention`, con complejidad efectiva subcuadrática (O(N) u O(N log N) según la model card). El modelo está afinado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE y se distribuye como pesos modulares de solo atención en FP16 (aproximadamente 55 MB), no como un checkpoint completo.

La relevancia del artefacto no reside en su rendimiento —el propio autor reporta un 50,80 % de accuracy en SST-2, apenas 1,95 puntos por encima de un estudiante sin destilar y muy por debajo del 91,63 % del profesor BERT-base— sino en su función como pieza de un "attention zoo": un catálogo de variantes de atención subcuadrática destiladas mediante el protocolo de destilación de representaciones en caché de NeuralOps, que evita reservar VRAM para el modelo profesor. El entrenamiento se ejecutó en una única RTX 3090 de 24 GB durante 51,3 segundos y 185 pasos de optimización.

A efectos prácticos, se trata de un modelo de investigación con calidad predictiva marginal, útil para estudiar mecanismos de atención alternativos y pipelines de destilación, pero no apto como clasificador de sentimiento en producción. El repositorio pesa 0,1 GB, la licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `svd_attention` subcuadrática en las 12 capas (base: `bert-base-uncased`) |
| Parametros totales | 110M (arquitectura base BERT-base); el repo solo serializa pesos de atención y cabeza de clasificación en FP16 (~55 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-base, presumiblemente 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | Pesos distribuidos en FP16 (`attention_weights.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atención, FP16); requiere código remoto (`trust_remote_code=True`) y reconstruye los pesos base congelados desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de BERT-base (12 capas, 110M parámetros) y reemplaza la atención multi-cabeza softmax estándar por `svd_attention`, un mecanismo que el autor describe como de complejidad efectiva subcuadrática (O(N) u O(N log N)) frente a la O(N²) de MHA. La serialización es modular: el repositorio contiene únicamente los pesos de atención destilados y la cabeza de clasificación en FP16 (~55 MB), mientras que el shim de código remoto (`modeling_neuralops_bert.py`) inicializa los pesos base congelados desde `bert-base-uncased` y aplica los parámetros de atención en tiempo de carga.

El entrenamiento siguió el NeuralOps Cached Representation Distillation Protocol, con asignación cero de VRAM al profesor mediante alineación offline de representaciones en caché. Se ejecutó en dos etapas: alineamiento de subespacio oculto y luego KL de logits más entropía cruzada de tarea, con 185 pasos totales en 51,3 segundos sobre una RTX 3090 de 24 GB, un throughput efectivo de 29 559,2 tokens/s y un pico de VRAM de 8013 MB. No se documentan datos sobre número de tokens de entrenamiento, composición del corpus más allá de GLUE/SST-2, ni uso de RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, entrenada específicamente en SST-2.
- Inferencia de secuencia completa mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`load_pretrained_bert` y `load_surgeried_model`), que reconstruye el modelo sobre BERT-base congelado.
- Atención subcuadrática: el mecanismo `svd_attention` está pensado para escalar mejor que la atención cuadrática en secuencias largas, aunque no se aportan mediciones de latencia o memoria que lo confirmen.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni modo "thinking"; el pipeline declarado es exclusivamente `text-classification`.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el checkpoint permite comparar `svd_attention` frente a MHA estándar en una tarea controlada (SST-2) con un profesor de referencia conocido, sirviendo como banco de pruebas para estudiar la degradación introducida por la aproximación subcuadrática.
- Estudio de protocolos de destilación: reproduce el NeuralOps Cached Representation Distillation Protocol con telemetría publicada (185 pasos, 51,3 s, 8013 MB de pico), lo que facilita replicar o auditar el método sin necesidad de una GPU de gran capacidad para el profesor.
- Experimentos de eficiencia en memoria: al distribuirse como pesos de solo atención (~55 MB) y reutilizar los pesos base congelados de `bert-base-uncased`, permite iterar sobre variantes de atención con un coste de almacenamiento y descarga muy bajo.
- Docencia y demostraciones de atención subcuadrática: el tamaño reducido y la licencia MIT permiten incluirlo en material formativo sobre arquitecturas transformer eficientes y serialización modular de pesos.
- Pruebas de integración de la librería NeuralOps: útil para validar el shim de código remoto, la carga vía `load_pretrained_bert` y la compatibilidad con `transformers` en entornos de desarrollo.
- Clasificación de sentimiento en entornos experimentales de bajo requisito: con una precisión de ~50,8 % en SST-2, solo tiene cabida como línea base comparativa o como paso intermedio en un pipeline de destilación, nunca como clasificador final.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`svd_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 48,85 % | 50,80 % | +1,95 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,7065 | Convergida |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB): 51,3 s de duración, 185 pasos de optimización, 29 559,2 tokens/s de throughput efectivo, 8013 MB de VRAM pico. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no se documenta explícitamente; al reconstruir BERT-base (110M parámetros) en FP16, la inferencia cabe holgadamente en GPUs de consumo (del orden de 1-2 GB con overhead de activaciones para lotes pequeños).
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM; el entrenamiento documentado usó una RTX 3090 de 24 GB con 8013 MB de pico.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no hay medición oficial de VRAM de inferencia.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim de código remoto), API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de clasificación con código remoto, la integración con esos servidores no está garantizada.
- Latencia y throughput: solo se publica throughput de entrenamiento (29 559,2 tokens/s); no hay cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BERT-SVD-Attention-SST2 (este) | 110M (base) | No disponible | 50,80 % | MIT | Hugging Face, pesos de solo atención (~55 MB), requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, checkpoint completo |
| BERT-base afinado estándar en SST-2 | 110M | 512 tokens | Típicamente ~92-94 % en SST-2 (no verificado en esta información) | Apache 2.0 (base) | Amplia disponibilidad en el Hub |

La comparación directa con el profesor muestra una brecha de 40,83 puntos de accuracy, lo que sitúa este checkpoint muy por debajo de cualquier BERT-base afinado convencional para la misma tarea. Como alternativa de atención eficiente, no se dispone en la información proporcionada de otros checkpoints del attention zoo de NeuralOps con métricas publicadas para comparar.

## Limitaciones y advertencias

- Rendimiento predictivo muy bajo: 50,80 % de accuracy en SST-2 equivale prácticamente a una línea base trivial en una tarea binaria; no es utilizable como clasificador de sentimiento real.
- Entropía cruzada de validación de 0,7065, notablemente superior a la del profesor (0,2428), indica una calibración pobre de las probabilidades.
- Dependencia de código remoto (`trust_remote_code=True`) y de la reconstrucción de pesos base desde `bert-base-uncased`; cualquier cambio en el shim o en el repositorio base puede romper la carga.
- Solo inglés; no se declaran capacidades multilingües.
- No se documentan sesgos conocidos, pero al derivar de BERT-base entrenado en corpus web en inglés, es esperable que herede sesgos demográficos y sociolingüísticos de ese corpus; no hay evaluación específica en la información disponible.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero la calibración deficiente implica salidas poco fiables.
- Licencia MIT permite uso comercial del artefacto, pero el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0; conviene verificar la compatibilidad de la obra derivada.
- No apto para producción: sin benchmarks estándar, sin evaluación de robustez, sin cifras de latencia de inferencia y con una calidad muy por debajo del profesor.
- La model card contiene incoherencias menores (referencias a `tahamajs/bert-svd-attention-sst2` en el código de ejemplo frente al ID real `Hooshaai/bert-svd-attention-sst2`), lo que puede confundir la carga directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-svd-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
