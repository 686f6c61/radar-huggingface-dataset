# Hooshaai/bert-comp-astro-quantizer-sst2

## Resumen

`Hooshaai/bert-comp-astro-quantizer-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de cuantización `AstroQuantizer` de la librería NeuralOps. Lo publica el usuario Hooshaai bajo licencia MIT y está etiquetado con `library_name: neuralops`, lo que implica una dependencia explícita de esa librería para reconstruir la topología comprimida antes de cargar los pesos.

El interés del artefacto no reside en el modelo base (un BERT-Base estándar en inglés) sino en el pipeline de compresión que ilustra: cuantización uniforme min-max/simétrica con asignación adaptativa de bits por canal basada en la información de Fisher, soporte para envoltorios `LoRALinear`, `nn.Linear` y `Conv1D`, y una etapa opcional de "LoRA healing" (r=8, 50 pasos, lr=2e-4) que se activa cuando la compresión zero-shot degrada más de 2 puntos porcentuales con una reducción superior a 1,10x.

Un detalle importante para evaluar su utilidad real: según la propia model card, el checkpoint empaquetado corresponde al rango k=32 y mantiene exactamente el mismo número de parámetros que el profesor (109.483.778, reducción del 0,00%, ratio de compresión 1,000x). Es decir, el artefacto es funcionalmente equivalente en tamaño al BERT-Base original; su valor es demostrativo y metodológico, no de ahorro de memoria o almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, D=768, con cuantización post-entrenamiento `astro_quantizer` |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | Cuantización uniforme min-max / simétrica con asignación adaptativa de bits por canal de salida (Fisher-adaptive, rango `[min_bits, max_bits]`); checkpoint serializado en `pytorch_model.bin` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de baja escala, buffers de cuantización y adaptadores LoRA integrados), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

La base es un transformer encoder BERT-Base con 12 capas y dimensión oculta 768, afinado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento, 2 etiquetas). Sobre ese profesor se aplica `AstroQuantizer`, un motor de cuantización post-entrenamiento que combina cuantización uniforme min-max/simétrica con una política de asignación de bits por canal de salida guiada por la información de Fisher (Fisher-Adaptive Bit Allocation), permitiendo anchos de bits mixtos dentro del rango configurado. El motor incluye un parámetro `target_attention_only` que omite FFN/MLP y preserva las cabezas de clasificación, y soporta `LoRALinear`, `nn.Linear` y `Conv1D`.

El pipeline evalúa cuatro rangos (k=256, 128, 64 y 32) sobre el split de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. La etapa de "LoRA healing" (r=8, 50 pasos, lr=2e-4, presupuesto de 45 segundos) solo se dispara si la compresión zero-shot pierde más de 2,0 puntos con una reducción superior a 1,10x; en este caso no se activó (`LoRA Recovery Applied: False`) porque la compresión física es de 1,000x. Los datos de entrenamiento declarados son únicamente `nyu-mll/glue` (config `sst2`); no se especifican número de tokens, composición del corpus de preentrenamiento ni detalles de RLHF/DPO (no aplicables a una tarea de clasificación de este tipo).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de longitud tipo SST-2.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología con `compress_model` y cargado el state dict con `strict=False`.
- Integración con el ecosistema NeuralOps: registro `COMPRESSOR_REGISTRY` con clave `astro_quantizer` y telemetría legible por máquina en `compression_summary.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe: únicamente inglés (vocabulario `bert-base-uncased`).
- Sirve como referencia reproducible para comparar políticas de cuantización (min-max simétrica frente a Fisher-adaptativa) sobre un mismo profesor.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica polaridad a nivel de documento o frase; su ventana efectiva (heredada de BERT-Base, 512 tokens) cubre reseñas típicas de e-commerce sin truncamiento agresivo.
- Moderación de comentarios y filtrado de toxicidad indirecta: como clasificador ligero (109 M de parámetros) puede ejecutarse en CPU o GPU de gama baja para prefiltrar grandes volúmenes antes de un modelo mayor.
- Enrutamiento de tickets de soporte: clasificar el tono del cliente (positivo/negativo) para priorizar colas de atención; la latencia baja del encoder permite procesar miles de tickets por minuto en una sola GPU.
- Investigación en compresión de modelos: el repositorio incluye la tabla Pareto completa (k=256/128/64/32) y el `compression_summary.json`, lo que lo convierte en un banco de pruebas reproducible para comparar técnicas de cuantización sobre BERT.
- Docencia y divulgación: ejemplo mínimo de flujo "comprimir → evaluar → serializar → recargar" con una API de tres pasos (`compress_model`, `hf_hub_download`, `load_state_dict`).
- Baseline en pipelines de MLOps: servir como referencia de exactitud (91,86% en SST-2) contra la que medir variantes cuantizadas de verdad (por ejemplo, INT8 con reducción real de parámetros).
- Etiquetado asistido de corpus: preanotar datasets de sentimiento en inglés para revisión humana posterior, dado el coste computacional reducido del modelo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente, `verified: false`).

| Metrica | Valor |
|---|---|
| GLUE SST-2, validación, accuracy | 91,86% |
| Baseline del profesor (BERT-Base SST-2) | 91,63% |
| Delta de paridad frente al profesor | +0,23% |
| Muestras de evaluación | 872 (split de validación SST-2) |
| Hardware de evaluación | NVIDIA GeForce RTX 3090 (24 GB) |

Evaluación multi-rango declarada:

| Rango (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 128 | 1,00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 64 | 1,00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |
| 32 (empaquetado) | 1,00x | 109.483.778 (-0,0%) | 91,86% | 91,86% | +0,23% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un clasificador de sentimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 208,9 MB (según la model card) y el modelo tiene 109,483 M de parámetros; en FP32 ocupa aproximadamente 0,44 GB de pesos, más activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: el autor evaluó en una RTX 3090 (24 GB), pero es sobredimensionada para este modelo; una RTX 3060, RTX 4060, T4 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: la vía documentada es `transformers` + `neuralops` (reconstrucción con `compress_model` y carga con `strict=False`). No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI; al ser un `pytorch_model.bin` dependiente de la topología NeuralOps, no es directamente compatible con formatos GGUF ni con servidores de inferencia estándar sin conversión previa. Para producción sencilla, `transformers` con `BertForSequenceClassification` sobre el modelo base y carga del state dict es la ruta más directa.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un BERT-Base en una GPU moderna procesa típicamente cientos de secuencias por segundo en batch, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-comp-astro-quantizer-sst2` | 109.483.778 | No disponible (base BERT: 512) | 91,86% (declarado, no verificado) | MIT | `pytorch_model.bin` + NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 | 91,63% (declarado en la model card) | Apache 2.0 | Safetensors / PyTorch, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 | No disponible en la información proporcionada | Apache 2.0 | Safetensors / PyTorch, `transformers` |
| `roberta-base` afinado en SST-2 | ~125 M | 512 | No disponible en la información proporcionada | MIT | Safetensors / PyTorch, `transformers` |

La comparativa con DistilBERT y RoBERTa se incluye por categoría (clasificación de sentimiento en inglés), pero sus cifras exactas en SST-2 no están en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- El checkpoint empaquetado no reduce parámetros (1,000x de ratio, 0,00% de reducción): no aporta ahorro de memoria ni de almacenamiento frente al BERT-Base original. Cualquier expectativa de compresión real no se cumple en este artefacto.
- Requiere la librería NeuralOps y una reconstrucción manual de la topología (`compress_model` con `rank: 32`) antes de cargar los pesos; no es un checkpoint "plug-and-play" con `AutoModel.from_pretrained`.
- La carga usa `strict=False`, lo que puede enmascarar claves faltantes o inesperadas; conviene verificar el state dict antes de usar en producción.
- El accuracy de 91,86% está declarado por el autor y marcado como `verified: false`; no hay validación independiente.
- Entrenado y evaluado solo en inglés; no soporta otros idiomas ni tareas generativas.
- Riesgo de alucinación no aplicable (modelo discriminativo), pero sí riesgo de clasificación errónea en dominios alejados de SST-2 (críticas cinematográficas), como sarcasmo, jerga o textos muy largos.
- Sesgos heredados de BERT-Base y de SST-2: el corpus de críticas cinematográficas tiene una distribución particular que puede no reflejar otros dominios (redes sociales, soporte técnico, reseñas médicas).
- Licencia MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad y atribución en despliegues comerciales.
- El repositorio tiene 46 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación con poca validación comunitaria.
- El enlace de la model card apunta a `tahamajs/bert-comp-astro-quantizer-sst2` en el código de ejemplo, mientras que el ID del repositorio es `Hooshaai/bert-comp-astro-quantizer-sst2`; verificar el `repo_id` correcto antes de ejecutar el snippet.
- No hay información sobre latencia, throughput ni comportamiento en producción; realizar pruebas propias antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-comp-astro-quantizer-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación de `AstroQuantizer`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/astro_quantizer.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Paper de BERT (referencia del modelo base): https://arxiv.org/abs/1810.04805
- Paper de LoRA (referencia de la etapa de healing): https://arxiv.org/abs/2106.09685
