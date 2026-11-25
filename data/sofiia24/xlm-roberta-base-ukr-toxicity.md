# sofiia24/xlm-roberta-base-ukr-toxicity

## Resumen

`sofiia24/xlm-roberta-base-ukr-toxicity` es un clasificador binario de toxicidad para texto en ucraniano, obtenido mediante fine-tuning completo de `FacebookAI/xlm-roberta-base`. Lo desarrolla el usuario sofiia24 en el contexto de una práctica de laboratorio de la asignatura «Sistemas de inteligencia artificial», y su propósito es etiquetar comentarios como `toxic` o `non-toxic`. El modelo resuelve un problema acotado pero relevante: la moderación automática de contenido en ucraniano, un idioma con menos recursos que el inglés o el ruso en herramientas de moderación.

Arquitectónicamente es un transformer encoder de tipo RoBERTa multilingüe (XLM-RoBERTa) con una cabeza de clasificación de dos clases añadida sobre el token `[CLS]`. Cuenta con 278.045.186 parámetros y se entrenó sobre el dataset `ukr-detect/ukr-toxicity-dataset`, compuesto por 5.000 tuits etiquetados de forma equilibrada 50/50. El checkpoint se publica en formato `safetensors` con un tamaño de repositorio de 1,1 GB.

Su relevancia es doble: por un lado, ofrece una línea base reproducible y ligera (ejecutable en una GPU de consumo) para moderación en ucraniano; por otro, la propia model card documenta comparativas honestas frente a alternativas (un Qwen3-1.7B con prompting few-shot y un clasificador trivial de clase mayoritaria), lo que facilita la evaluación crítica de su utilidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cabeza de clasificación binaria |
| Parametros totales | 278.045.186 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de XLM-RoBERTa-base; el entrenamiento usó max_length 128) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en fp32/fp16) |
| Idiomas soportados | Ucraniano (`uk`); el backbone es multilingüe pero el fine-tuning es monolingüe |
| Licencia | openrail |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer de 12 capas y 278M de parámetros entrenado por Meta con enmascarado de tokens sobre corpus multilingües (100 idiomas). Sobre la representación del token `[CLS]` se añade una cabeza lineal de clasificación con dos etiquetas (`non-toxic`, `toxic`), y se realiza un fine-tuning completo (no LoRA ni adaptadores) de todos los pesos.

Los datos provienen de `ukr-detect/ukr-toxicity-dataset`: 5.000 tuits con etiquetado equilibrado 50/50, de los que quedan 4.997 tras deduplicación. El split es estratificado 80/10/10 (3.997 entrenamiento, 500 validación, 500 test) con semilla 42. El entrenamiento consistió en 4 épocas, learning rate 2e-5, 100 pasos de warmup, batch size 16, `max_length` 128, weight decay 0.01 y precisión fp16, ejecutado en una GPU T4 de Google Colab. La selección del checkpoint final se hizo por macro-F1 máximo en validación. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de toxicidad (`toxic` / `non-toxic`) en texto ucraniano.
- Detección fiable de léxico obsceno y vulgarismos explícitos.
- Integración directa con `transformers.pipeline("text-classification")`.
- Procesamiento de entradas de hasta 512 tokens (aunque entrenado con 128).
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- No es un modelo multilingüe funcional para moderación: aunque el backbone lo sea, la cabeza se entrenó solo con datos ucranianos.

## Casos de uso

- Moderación de comentarios en foros y comunidades ucranianas: el modelo clasifica cada mensaje entrante en milisegundos en una GPU pequeña o incluso en CPU, permitiendo filtrar automáticamente el contenido obsceno antes de la revisión humana.
- Pre-filtrado en pipelines de moderación con revisión humana: dado su recall limitado ante insultos sin palabras malsonantes, encaja como primera etapa que descarta casos claros y escala el resto a moderadores.
- Análisis de toxicidad en redes sociales para investigación: permite etiquetar corpus de tuits ucranianos de forma masiva y reproducible, con la ventaja de que el checkpoint y el split son públicos.
- Línea base en experimentos de NLP ucraniano: sirve como referencia cuantitativa (macro-F1 0,892 en test) frente a la que comparar modelos más grandes o enfoques de prompting.
- Filtrado de datasets de entrenamiento: se puede usar para limpiar corpus ucranianos antes de entrenar modelos generativos, eliminando ejemplos tóxicos de forma automática.
- Sistemas de alerta temprana en comunidades online: combinado con reglas y otros clasificadores, detecta picos de lenguaje obsceno en canales de chat y dispara avisos a los administradores.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de test (500 ejemplos):

| Metrica | Valor |
|---|---|
| Accuracy | 0,892 |
| Macro-F1 | 0,892 |
| Precision (toxic) | 0,892 |
| Recall (toxic) | 0,892 |

Comparativas reportadas en la model card:

| Modelo / enfoque | Macro-F1 |
|---|---|
| xlm-roberta-base-ukr-toxicity | 0,892 |
| Qwen3-1.7B con prompt few-shot | 0,641 |
| Clasificador trivial (clase mayoritaria) | 0,333 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable en un modelo de clasificación.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 0,6 GB de pesos; en la práctica menos de 1 GB con overhead de runtime.
- VRAM en fp32: aproximadamente 1,1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, T4, e incluso en CPU para lotes pequeños.
- Despliegue recomendado: `transformers` con `pipeline`, `vLLM` no aplica (no es generativo); alternativas válidas son `optimum` (ONNX), TorchServe o un microservicio FastAPI con batching.
- Throughput estimado: cientos a miles de predicciones por segundo en una GPU moderna con batching; en CPU, decenas por segundo para entradas cortas. No se publican cifras oficiales de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sofiia24/xlm-roberta-base-ukr-toxicity | 278M | 512 | Clasificación binaria fine-tuned | openrail | Hugging Face |
| Qwen3-1.7B (few-shot, según la model card) | 1,7B | no disponible | Generativo con prompting | no disponible | Hugging Face |
| Clasificador de clase mayoritaria (baseline) | 0 | n/a | Trivial | n/a | n/a |

No se dispone de información sobre otros clasificadores específicos de toxicidad en ucraniano en la documentación proporcionada.

## Limitaciones y advertencias

- Detecta bien la obscenidad explícita, pero según el autor a menudo pasa por alto insultos y amenazas sin palabras malsonantes (falsos negativos relevantes para moderación real).
- El etiquetado del dataset es de crowdsourcing y presenta inconsistencias, lo que introduce ruido en las etiquetas y limita el techo de rendimiento.
- Entrenado solo con tuits: puede degradarse en registros formales, técnicos o de otras plataformas.
- El conjunto de test es pequeño (500 ejemplos) y el modelo no se ha validado externamente; las métricas reportadas deben tomarse con cautela.
- Licencia `openrail`: permite uso comercial con condiciones, pero conviene revisar los términos exactos antes de desplegarlo en producción.
- Riesgo de sesgo: al proceder de un dataset de tuits ucranianos, puede sobrerrepresentar ciertos registros dialectales o temáticos y penalizar vocabulario legítimo de determinadas comunidades.
- No debe usarse como único mecanismo de moderación: por su tasa de falsos negativos en insultos y amenazas, requiere revisión humana o combinación con otros filtros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sofiia24/xlm-roberta-base-ukr-toxicity
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/ukr-detect/ukr-toxicity-dataset
