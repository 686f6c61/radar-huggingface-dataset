# mrysh/gemma-4-e4b-it-prune_width_ffn15

## Resumen

`mrysh/gemma-4-e4b-it-prune_width_ffn15` es una versión podada por anchura del modelo multimodal `google/gemma-4-E4B-it` de Google. El autor, mrysh, lo publica como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de pruning frente a cuantización, evaluados en BFCL, hiring-bias y MedQA mediante vLLM. No es un modelo pensado para producción, sino un artefacto experimental para medir la degradación de calidad tras eliminar parámetros.

La poda se aplicó con NVIDIA ModelOpt (Minitron) sobre la parte lingüística: las capas FFN pasan de 10240 a 8704 neuronas (un 15 % de reducción solicitada), manteniendo intacto el número de capas. La importancia de las neuronas se estimó con un conjunto de calibración de 512 muestras mixtas. El checkpoint resultante contiene 7.445.648.714 parámetros y ocupa 14,9 GB en disco.

Es relevante ahora porque documenta de forma reproducible el coste de la poda estructural sin destilación ni fine-tuning posterior: la reducción efectiva es del 7,3 % de los parámetros del modelo de lenguaje (6,9 % del checkpoint completo), y el benchmark cuantifica la pérdida asociada. Cualquier equipo que evalúe técnicas de compresión debe leer estos resultados como una cota inferior de lo que se puede esperar de un pruning agresivo sin recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4), poda por anchura en capas FFN |
| Parámetros totales | 7.445.648.714 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el benchmark compara contra cuantización, pero no se listan formatos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer multimodal de Google. La variante podada conserva la arquitectura del original salvo por la reducción de las capas FFN: cada una pasa de 10240 a 8704 unidades, lo que supone un 15 % de anchura eliminada en esa dimensión. El número de capas y el resto de bloques no se modifican. Los bloques de visión y audio del modelo base, si los tiene, se mantienen intactos; solo se poda la parte lingüística.

La poda se realizó con `nvidia-modelopt` 0.46.0rc1 usando la metodología Minitron: se mide la importancia de cada neurona FFN sobre 512 muestras mixtas de calibración y se eliminan las menos relevantes. No hubo destilación ni fine-tuning posterior, de modo que el modelo arrastra la pérdida de calidad inherente al recorte. La model card menciona además que la herramienta de poda descarta la cabeza de multi-token prediction de Qwen3.5, un detalle que sugiere que el pipeline se reutilizó entre familias de modelos. No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO, porque el modelo no se reentrenó.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base, con la degradación esperable tras la poda sin recuperación.
- Capacidades multimodales del modelo base (visión y audio) preservadas en teoría, ya que esos bloques no se podan, aunque el benchmark solo evalúa el modelo como texto.
- Soporte de tool calling y function calling, evaluado en el benchmark mediante BFCL.
- Razonamiento multi-paso y uso como agente, sujeto a la merma de calidad por la reducción de parámetros.
- Capacidades multilingües del modelo base, sin datos específicos publicados para esta variante.
- Modo thinking desactivado en la evaluación con vLLM; no se documenta el comportamiento con thinking activo.

## Casos de uso

- Benchmark de técnicas de poda: sirve como punto de comparación reproducible frente a otras variantes de pruning y frente a cuantización, con métricas en BFCL, hiring-bias y MedQA.
- Investigación sobre compresión de modelos: permite estudiar la relación entre reducción de anchura FFN y degradación en tareas de tool calling y razonamiento clínico.
- Validación de pipelines con NVIDIA ModelOpt: útil para verificar que el flujo de poda Minitron produce checkpoints cargables en vLLM con el formato esperado.
- Estudio de sesgos: el benchmark incluye hiring-bias, de modo que el modelo sirve para medir cómo afecta la poda a los sesgos de contratación del base.
- Evaluación de robustez en dominios médicos: MedQA permite cuantificar la pérdida de conocimiento factual tras eliminar neuronas FFN.
- Docencia y experimentación: al ser un checkpoint pequeño (14,9 GB) y con licencia Apache 2.0, es apto para laboratorios que quieran reproducir experimentos de compresión sin depender de pesos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo se evalúa en BFCL, hiring-bias y MedQA dentro de un benchmark de poda, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 15 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB para pesos, con margen para contexto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB para pesos, aunque no se documentan formatos de cuantización compatibles para esta variante.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para evaluación con vLLM; RTX 4090 (24 GB) viable en BF16 con contexto moderado.
- Consumer GPU: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: vLLM es el motor usado en el benchmark; llama.cpp, Ollama y TGI no están documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_width_ffn15 | 7.445.648.714 | no disponible | Apache 2.0 | Hugging Face | Poda del 15 % en FFN, sin recuperación |
| google/gemma-4-E4B-it | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base sin podar |
| Otras variantes del benchmark (4 modelos x 8 variantes) | no disponible | no disponible | no disponible | no disponible | Solo se mencionan en la model card, sin detalle |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad garantizada: la poda se hizo sin destilación ni fine-tuning, por lo que el autor advierte explícitamente de una caída de calidad frente al modelo base.
- Reducción modesta: solo se elimina el 7,3 % de los parámetros del modelo de lenguaje, de modo que la ganancia en tamaño es limitada frente al riesgo de degradación.
- Sesgos: el benchmark incluye hiring-bias, lo que sugiere que el modelo base presenta sesgos medibles en ese dominio; la poda puede alterarlos de forma no controlada.
- Alucinación: sin datos específicos para esta variante; se espera un comportamiento igual o peor que el base tras la poda.
- Idiomas: no se documentan los idiomas soportados ni si la poda afecta de forma desigual a lenguas distintas del inglés.
- Contexto: no se especifica la longitud de contexto efectiva tras la poda.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor remite a la model card del base para condiciones adicionales.
- Producción: no recomendado como modelo de producción; es un artefacto de benchmark con cero descargas y sin validación externa.
- Multimodalidad: aunque los bloques de visión y audio se conservan, el benchmark solo evalúa texto, por lo que su rendimiento multimodal no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_width_ffn15
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- NVIDIA ModelOpt: no disponible en la información proporcionada
- Paper de Minitron: no disponible en la información proporcionada
- Repositorio o demo del benchmark: no disponible en la información proporcionada
