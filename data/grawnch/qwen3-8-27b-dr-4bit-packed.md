# Grawnch/Qwen3.8-27B-DR-4bit-Packed

## Resumen

Qwen3.8-27B-DR-4bit-Packed es un checkpoint cuantizado a 4 bits del modelo base Qwen/Qwen3.8-27B, publicado por el usuario Grawnch en Hugging Face. Se trata de una cuantización de tipo DR (una variante propietaria del autor, presumiblemente basada en GPTQ con corrección por capas) que empaqueta los pesos enteros de 4 bits (`qweight`) junto con escalas de grupo en FP16 (`scales`) en un único fichero `.safetensors` de 14,1 GB, lo que supone una anchura efectiva de 4,17 bits por peso frente a los 16 bits y 55,5 GB del modelo original.

El interés de esta ficha radica en que el autor publica métricas de degradación frente al baseline de 16 bits: reducción del 50% en el error cuadrático medio por capa respecto a GPTQ estándar, perplejidad prácticamente idéntica (2,509 frente a 2,518) y una caída mínima en tareas de código (HumanEval+ idéntico al 90,85%, MBPP+ baja de 84,66% a 83,07%). El paquete incluye un cargador propio (`dr_loader`) con modo de inferencia de baja VRAM que mantiene los pesos comprimidos en la GPU.

No obstante, la información pública es muy limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no se especifican idiomas soportados, no hay pipeline declarado y las etiquetas mezclan `qwen3.5` con un modelo base denominado `Qwen3.8-27B`, lo que introduce ambigüedad sobre la familia exacta. Esta ficha se limita a los datos verificables de la model card y del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits empaquetado (4,17 bpw), escalas de grupo en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos empaquetados `qweight` + `scales`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo Qwen/Qwen3.8-27B. No se aporta información sobre la arquitectura interna del modelo base (número de capas, dimensión oculta, tipo de atención, uso de MoE, etc.), más allá de que se trata de un transformer de 27.000 millones de parámetros. La técnica DR empleada por el autor agrupa los pesos en enteros de 4 bits empaquetados y escalas de grupo en FP16, almacenados en un único fichero safetensors de 14,1 GB. Según la model card, el método logra una reducción del 50% en el MSE por capa respecto a GPTQ estándar y gana en el 88,24% de las neuronas de salida (3.440.765 de 3.899.392).

No se documentan los datos de entrenamiento del modelo base, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se detalla el proceso de calibración de la cuantización (dataset, número de muestras, configuración de grupos). El autor publica además un checkpoint alternativo pre-desempaquetado en bfloat16 (`Grawnch/Qwen3.8-27B-DR-4bit`) pensado para evaluación con `AutoModelForCausalLM.from_pretrained`, lo que sugiere que el formato empaquetado requiere un cargador específico (`dr_loader`) y no es directamente compatible con la API estándar de Transformers.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan capacidades específicas en la model card.
- Generación de código: validada mediante EvalPlus con HumanEval+ (90,85%) y MBPP+ (83,07%), lo que confirma competencia en programación.
- Inferencia de baja VRAM: el cargador `dr_loader` permite mantener los pesos comprimidos en VRAM (`low_vram=True`) o desempaquetarlos a capas `nn.Linear` estándar (`low_vram=False`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo con VRAM limitada: con 14,1 GB de pesos empaquetados, el modelo puede cargarse en tarjetas de 16 GB o 24 GB usando `low_vram=True`, algo inviable con el baseline de 55,5 GB en FP16.
- Evaluación comparativa de cuantizaciones: el checkpoint pre-desempaquetado (`Grawnch/Qwen3.8-27B-DR-4bit`) permite ejecutar benchmarks con la API estándar de Transformers y comparar la degradación frente al modelo de 16 bits.
- Generación de código en entornos con recursos ajustados: los resultados de HumanEval+ (idénticos al baseline) y MBPP+ (caída de 1,6 puntos) respaldan su uso en asistentes de programación donde no se dispone de A100/H100.
- Servicio de inferencia de un solo inquilino: al caber en una única GPU de 24 GB, es adecuado para despliegues self-hosted con baja concurrencia donde el throughput no es crítico.
- Prototipado e investigación sobre cuantización: la publicación de métricas detalladas (KLD, acuerdo top-1/top-5, similitud coseno de logits) lo convierte en un caso de estudio útil para investigar técnicas de cuantización post-entrenamiento.
- Pruebas de regresión de calidad: la comparación EvalPlus entre baseline y cuantizado permite integrar el modelo en pipelines de validación que detecten degradaciones introducidas por la compresión.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando el baseline de 16 bits con la versión DR de 4 bits:

| Metrica | Baseline 16 bits | DR (4 bits) |
|---|---|---|
| Anchura efectiva / tamano empaquetado | 16,0 bpw (55,5 GB) | 4,17 bpw (14,1 GB) |
| Reduccion de MSE por capa vs. GPTQ estandar | — | 2,00x (-50,0%) |
| Neuronas de salida ganadas vs. GPTQ estandar | — | 88,24% (3.440.765 / 3.899.392) |
| Perplejidad in-domain (PPL) | 2,518 | 2,509 |
| KLD forward sobre vocabulario completo | 0,00000 | 0,01827 |
| Acuerdo top-1 de tokens | 100,00% | 95,32% |
| Acuerdo top-5 de tokens | 100,00% | 100,00% |
| Similitud coseno de logits | 1,00000 | 0,99474 |
| EvalPlus HumanEval+ (164 problemas, 80x tests) | 90,85% (149/164) | 90,85% (149/164) |
| EvalPlus MBPP+ (378 problemas, 35x tests) | 84,66% (320/378) | 83,07% (314/378) |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14,1 GB para los pesos empaquetados en modo `low_vram=True`, más overhead de activaciones, caché KV y contexto (no cuantificado). En modo `low_vram=False` los pesos se desempaquetan a bfloat16, requiriendo del orden de 55 GB solo para pesos.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para el modo empaquetado con margen para contexto; A100 40/80 GB o H100 para el modo desempaquetado o para mayor concurrencia.
- Cabe en GPU de consumo: sí, en el modo `low_vram=True` cabe en tarjetas de 16 GB (por ejemplo, RTX 4080) con contexto limitado, y con holgura en 24 GB.
- Opciones de despliegue: el formato empaquetado requiere el cargador `dr_loader` proporcionado por el autor. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El checkpoint pre-desempaquetado en bfloat16 sí es compatible con `AutoModelForCausalLM` de Transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DR-4bit-Packed (este) | 27B | no disponible | 4 bits empaquetado (4,17 bpw) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (baseline) | 27B | no disponible | 16 bits (bfloat16) | Apache 2.0 (segun modelo base) | Hugging Face |
| Grawnch/Qwen3.8-27B-DR-4bit (pre-desempaquetado) | 27B | no disponible | 4 bits reconstruido a bfloat16 | Apache 2.0 | Hugging Face |
| GPTQ estandar sobre el mismo base | 27B | no disponible | 4 bits | Apache 2.0 | Referencia en la model card, sin enlace |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, más allá de la comparación interna frente a GPTQ estándar publicada por el autor.

## Limitaciones y advertencias

- Repositorio sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar la reproducibilidad de los resultados por terceros.
- Ambigüedad en la familia del modelo: las etiquetas incluyen `qwen3.5` mientras que el modelo base declarado es `Qwen/Qwen3.8-27B`; conviene verificar la procedencia exacta antes de usarlo en producción.
- Pérdida de fidelidad medible: acuerdo top-1 del 95,32% y KLD de 0,01827 respecto al baseline, lo que implica divergencias en la distribución de salida que pueden acumularse en generaciones largas.
- Dependencia de un cargador no estándar: el formato empaquetado exige `dr_loader`, no incluido en el ecosistema estándar de Transformers, vLLM o llama.cpp; la integración en pipelines existentes requiere trabajo adicional.
- Idiomas soportados no documentados: no es posible confirmar el rendimiento multilingüe sin evaluación propia.
- Contexto máximo no documentado: se desconoce la ventana de contexto efectiva del modelo base y si la cuantización la preserva.
- Riesgo de alucinación: inherente al modelo base y no cuantificado en la model card; la cuantización puede amplificarlo en dominios fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el modelo ni sobre el método de cuantización; conviene revisar los términos del modelo base Qwen3.8-27B.
- Sin datos de sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Checkpoint empaquetado: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-4bit-Packed
- Checkpoint pre-desempaquetado para evaluación: https://huggingface.co/Grawnch/Qwen3.8-27B-DR-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
