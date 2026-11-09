# Karasumikura/Ying-K1.6-Lite

## Resumen

Ying K1.6 Lite es un modelo de lenguaje causal de pequeno tamano (210,2 millones de parametros) desarrollado por Karasumikura, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de la version conversacional (instruction-tuned) del checkpoint base Ying-K1.6-Lite-200M-base, sobre el que se ha aplicado un unico epoch de ajuste por instrucciones en chino. El modelo esta disenado para generacion de texto y conversacion en chino e ingles, con una ventana de contexto de 8192 tokens.

La relevancia de este modelo reside en su escala reducida: con 16 capas, una dimension oculta de 768 y un vocabulario de 16.006 tokens, esta pensado para despliegues con recursos muy limitados, inferencia en CPU o GPUs de consumo, y experimentacion con tecnicas de entrenamiento eficiente. El proceso de entrenamiento documentado incluye 24,07 B tokens de preentrenamiento general, 1,40 B tokens de continuacion de preentrenamiento en chino sobre Ultra-FineWeb-L3 y 0,17 B tokens de ajuste por instrucciones.

El modelo se distribuye en formato safetensors con precision bf16, requiere `trust_remote_code=True` para su carga (incluye codigo personalizado) y esta etiquetado tanto como `text-generation` como `feature-extraction`. A fecha de su publicacion no registra descargas ni interacciones en el Hub, por lo que se trata de un lanzamiento muy reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), 16 capas, dimension oculta 768 |
| Parametros totales | 210.210.560 (210,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con `custom_code` |

## Arquitectura y entrenamiento

Ying K1.6 Lite es un transformer causal de tipo decoder-only con 16 capas, dimension oculta de 768 y un vocabulario de 16.006 tokens. Los pesos se distribuyen en bf16 y el repositorio ocupa aproximadamente 0,4 GB. El modelo incluye codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True`. No se detalla en la informacion disponible si emplea atencion multi-head estandar, GQA, RoPE u otras variantes, ni el tipo exacto de normalizacion o activacion.

El entrenamiento se estructura en tres fases documentadas: preentrenamiento base sobre un corpus generico mixto con 24,07 B tokens; continuacion de preentrenamiento en chino sobre Ultra-FineWeb-L3 con 1,40 B tokens; y ajuste por instrucciones sobre un corpus de instrucciones en chino durante 1 epoch, con 0,17 B tokens. El ajuste por instrucciones uso secuencias de 8192 tokens, batch de 12, scheduler WSD (warmup de 100 pasos, ratio de annealing 0,2), optimizadores muon a 5e-3 y adam a 1,5e-4, durante 2100 pasos (aproximadamente 172 millones de tokens). En el entrenamiento solo se anade `<|im_end|>` al final del turno del asistente.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles mediante un formato de chat basado en tokens especiales (`<|user|>`, `<|assistant|>`, `<|im_end|>`).
- Modelo ajustado por instrucciones (instruction-tuned) sobre el checkpoint base, orientado a respuestas conversacionales.
- Etiquetado tambien como `feature-extraction`, lo que sugiere uso potencial para extraccion de representaciones, aunque no se documenta el procedimiento.
- Soporte de contexto de hasta 8192 tokens por secuencia.
- Capacidad bilingue limitada a chino e ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en chino: el modelo puede gestionar dialogos multi-turno con hasta 8192 tokens de contexto, adecuado para pruebas de concepto en local sin necesidad de infraestructura GPU dedicada.
- Experimentacion academica con ajuste por instrucciones a pequena escala: su tamano de 210 M parametros y su receta de entrenamiento documentada (WSD, muon/adam, 2100 pasos) lo convierten en una referencia reproducible para estudiar el efecto del instruction tuning en modelos pequenos.
- Despliegue en entornos con recursos limitados: al ocupar aproximadamente 0,4 GB en bf16, puede ejecutarse en CPU o en GPUs de consumo con cuantizacion adicional, aunque esta ultima no se distribuye oficialmente.
- Generacion de texto en chino para tareas de reescritura, resumen o respuesta a preguntas simples, aprovechando el preentrenamiento adicional sobre Ultra-FineWeb-L3.
- Filtrado y clasificacion de texto mediante extraccion de caracteristicas (tag `feature-extraction`), si bien el autor no documenta el procedimiento ni la calidad de los embeddings.
- Base para fine-tuning especifico de dominio en chino: al ser un modelo pequeno con licencia Apache 2.0, es viable reentrenarlo sobre corpus especializados con costes computacionales reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,42 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos moderados.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPUs integradas o CPU.
- Despliegue via `transformers` con `trust_remote_code=True`; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia ni throughput publicados.
- Al publicarse solo en safetensors bf16, no hay GGUF oficial; la cuantizacion requeriria conversion manual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ying K1.6 Lite | 210,2 M | 8192 | zh, en | Apache 2.0 | safetensors (bf16) |
| Qwen2.5-0.5B | ~500 M | 32.768 | multilingue | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M | 135 M | 8192 | en (principalmente) | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se ofrece a titulo orientativo; no se dispone de resultados de benchmarks de Ying K1.6 Lite que permitan una comparacion cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- Modelo de muy reciente publicacion y sin descargas ni validacion externa; no hay evidencia publica de su calidad real.
- Tamano reducido (210 M parametros), lo que limita su capacidad de razonamiento complejo, conocimiento factual y coherencia en tareas largas.
- Riesgo elevado de alucinacion, especialmente en dominios especializados y en ingles, dado el enfasis del ajuste en chino.
- El ajuste por instrucciones se realizo unicamente sobre corpus en chino, por lo que el comportamiento conversacional en ingles puede ser deficiente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de usarlo en produccion.
- No se documentan sesgos conocidos, pero al entrenarse sobre corpus web (Ultra-FineWeb-L3) es probable que herede sesgos presentes en esos datos.
- Licencia Apache 2.0 permite uso comercial, pero al no haber benchmarks ni validacion, no se recomienda para produccion sin evaluacion previa.
- No se ofrecen pesos cuantizados oficiales ni integracion con frameworks de inferencia optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karasumikura/Ying-K1.6-Lite
- Checkpoint base: `Karasumikura/Ying-K1.6-Lite-200M-base` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
