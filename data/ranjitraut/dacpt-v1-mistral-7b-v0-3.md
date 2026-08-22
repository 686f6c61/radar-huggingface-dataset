# ranjitraut/dacpt-v1-Mistral-7B-v0.3

## Resumen

`ranjitraut/dacpt-v1-Mistral-7B-v0.3` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `mistralai/Mistral-7B-v0.3` mediante fine-tuning supervisado (SFT). La model card publicada por el autor no contiene información sustancial: no se especifica el conjunto de datos de entrenamiento, los hiperparámetros, la licencia ni los idiomas soportados. El repositorio ocupa 0.2 GB y utiliza la librería PEFT (versión 0.20.0), lo que confirma que se trata de un adaptador ligero que debe combinarse con el modelo base para su uso.

El modelo base, Mistral-7B-v0.3, es un transformer autoregresivo de 7.3 mil millones de parámetros desarrollado por Mistral AI, con atención por ventana deslizante (SWA) y atención agrupada por consultas (GQA). Esta versión v0.3 amplía la ventana de contexto hasta 32.768 tokens respecto a la v0.1. Sin embargo, dado que el adaptador carece de documentación, no se puede determinar qué capacidades concretas ha adquirido ni su rendimiento real. La relevancia actual es limitada: se trata de un modelo experimental sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Mistral-7B-v0.3 (transformer decoder) |
| Parametros totales | no disponible (el adaptador es un LoRA de bajo rango; el base tiene 7,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el base soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se indican cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la licencia del adaptador no se especifica; el base es Apache 2.0) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se ha creado con la librería PEFT y la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward del modelo base para reducir el coste de entrenamiento. El modelo base Mistral-7B-v0.3 emplea atención por ventana deslizante (SWA) con ventana de 4.096 estados ocultos, grouped-query attention (GQA) y normalización RMSNorm. La v0.3 añade soporte para contexto largo de 32.768 tokens.

No se dispone de información sobre el proceso de entrenamiento del adaptador: ni el conjunto de datos, ni el número de tokens, ni si se aplicó RLHF/DPO u otra técnica posterior. La model card indica únicamente que se usó fine-tuning supervisado (SFT) con la librería TRL. No se describen hiperparámetros concretos ni la composición del dataset.

## Capacidades

- No se han publicado capacidades específicas para este adaptador.
- El modelo base Mistral-7B-v0.3 es capaz de generación de texto, razonamiento, matemáticas y generación de código, así como de soportar instrucciones en varios idiomas (principalmente inglés y lenguas europeas).
- No se ha confirmado soporte para tool calling, function calling, agentes multi-step ni capacidades multimodales (visión, audio) en el adaptador.
- Dado que no hay documentación, no se puede verificar ninguna capacidad adicional.

## Casos de uso

- No hay casos de uso documentados para este adaptador. Al carecer de información sobre su entrenamiento, no se recomienda su uso en producción sin una evaluación previa.
- Como adaptador LoRA genérico, podría integrarse en aplicaciones que ya utilicen Mistral-7B-v0.3, pero se desconoce si mejora alguna tarea concreta.
- En entornos de investigación, podría utilizarse para estudiar el efecto de LoRA sobre Mistral 7B, pero sin datos de evaluación no hay conclusiones.
- No se puede afirmar que sea adecuado para atención al cliente, generación de código, análisis de texto o cualquier otra aplicación específica sin evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.2 GB y no requiere recursos significativos para cargarse.
- Para la inferencia completa se necesita el modelo base Mistral-7B-v0.3. En FP16, el modelo base requiere aproximadamente 14 GB de VRAM (peso de ~14 GB). Con cuantización de 8 bits (por ejemplo, bitsandbytes) se reduce a ~7 GB; con 4 bits, ~4 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para ejecución en FP16. Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente.
- Se puede desplegar con vLLM, llama.cpp, Ollama o TGI, pero hay que cargar el adaptador PEFT junto con el modelo base. En vLLM se soporta LoRA mediante el parámetro `--lora-modules`.
- Latencia y throughput no disponibles. En general, Mistral-7B en una RTX 4090 puede generar entre 50 y 80 tokens por segundo con cuantización 4 bits, pero estos valores dependen del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información específica sobre este adaptador para comparar con otros LoRA. Como referencia, se puede comparar con el modelo base Mistral-7B-v0.3 y con otros adaptadores LoRA genéricos, pero no hay datos de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral-7B-v0.3 (base) | 7,3B | 32k | Apache 2.0 | HuggingFace |
| ranjitraut/dacpt-v1-Mistral-7B-v0.3 | no disponible | no disponible | no disponible | HuggingFace (0 descargas) |
| Otros adaptadores LoRA (ej. OpenOrca, Platypus) | ~7B | 32k (depende del base) | Apache 2.0 (mayoría) | HuggingFace |

## Limitaciones y advertencias

- No hay documentación técnica: se desconoce el propósito, el dataset de entrenamiento y el rendimiento real.
- Riesgo de sesgos y alucinaciones heredados del modelo base Mistral-7B, que ya presenta limitaciones en tareas de razonamiento complejo y generación factual.
- No se ha evaluado la seguridad ni la robustez del adaptador.
- Licencia no especificada: aunque el base es Apache 2.0, la licencia del adaptador no se declara, lo que puede generar incertidumbre legal para uso comercial.
- Al ser un adaptador LoRA, la inferencia requiere el modelo base completo, lo que aumenta los requisitos de memoria.
- No se recomienda su uso en producción sin una evaluación exhaustiva y sin conocer los datos de entrenamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ranjitraut/dacpt-v1-Mistral-7B-v0.3
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Anuncio oficial de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Documentación de Mistral 7B (v0.2): https://docs.mistral.ai/models/mistral-7b-0-2
