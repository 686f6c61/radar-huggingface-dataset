# Relieq/lab21-2A202601055-qwen35-triage-vi

## Resumen

El modelo `Relieq/lab21-2A202601055-qwen35-triage-vi` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3.5-2B` para la clasificación de tickets de atención al cliente en vietnamita. Desarrollado por Hoàng Văn Nhân como parte del Lab 21 de fine-tuning de LLMs (Track 3, AICB-P2T3), el adaptador transforma un ticket de soporte en un JSON estructurado con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. El modelo resuelve el problema de extracción de información estructurada a partir de texto libre en vietnamita, un caso de uso habitual en sistemas de triaje automático de incidencias.

El adaptador alcanza una precisión de 0.995 en la tarea objetivo, pero presenta una regresión catastrófica en conocimiento general (0.067 frente a 0.644 del base), por lo que el propio autor desaconseja su uso como modelo multiuso y lo recomienda únicamente como clasificador especializado detrás de un router. El repositorio incluye un análisis detallado de configuraciones alternativas (atención solo, LR incorrecto, QLoRA) que documenta el impacto de cada decisión de entrenamiento. La licencia es Apache 2.0 y el tamaño del repositorio es de 0.1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-2B (transformer decoder, base multimodal) |
| Parametros totales | 2B (base) + 16.819.200 (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | bf16 (nativo), 4-bit NF4 (variante QLoRA) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-2B, un modelo de la familia Qwen3.5 de Alibaba, que según la documentación pública es una serie de modelos de lenguaje y visión (el propio Qwen3.5-397B-A17B es un modelo nativo de visión-lenguaje). El adaptador LoRA se aplica únicamente a los módulos lineales del decoder de texto (12 módulos), evitando explícitamente la torre de visión para no inflar el tamaño ni romper el merge. La configuración LoRA es r=16, alpha=32, dropout 0, con 16.819.200 parámetros entrenables.

El entrenamiento se realizó sobre 250 tickets de atención al cliente en vietnamita (225 train / 25 val, seed 42), con 58 pasos (2 épocas), batch efectivo 8, learning rate 1e-4 (escala LoRA, ~10x la escala full-FT), warmup 6 y scheduler coseno. Se usó precisión bf16 nativa, `loss_type=chunked_nll`, gradient checkpointing y una máscara de pérdida `assistant-only` que cubre 37/94 tokens (0.394). El hardware fue una RTX 5050 Laptop 8 GB (Blackwell sm_120) vía WSL2, con un pico de VRAM de 6.75 GB y 482 segundos de entrenamiento. La pérdida final fue 0.2951. El merge del adaptador no degrada el rendimiento (0.995 antes y después).

## Capacidades

- Clasificación de tickets de atención al cliente en vietnamita: genera un JSON con cuatro campos (`intent`, `urgency`, `product`, `sentiment`) a partir de texto libre.
- Extracción de entidades: el campo `product` se copia literalmente del ticket, lo que permite identificar nombres de productos sin vocabulario cerrado.
- Salida estructurada garantizada: el modelo produce JSON válido con las cuatro claves en el 100% de los casos evaluados.
- Soporte de decodificación greedy: al ser una tarea de extracción con respuesta correcta, se recomienda `do_sample=False`.
- Integración con el ecosistema PEFT: se carga con `PeftModel` sobre el base, permitiendo merge o inferencia directa.
- No soporta tool calling ni razonamiento multi-paso: el adaptador está especializado únicamente en el formato ticket→JSON.
- Capacidad multilingüe limitada: entrenado exclusivamente en vietnamita, aunque el base podría manejar otros idiomas, el adaptador degrada su comportamiento fuera del dominio.

## Casos de uso

- Triaje automático de tickets de soporte: el modelo puede clasificar incidencias entrantes en categorías predefinidas (`doi_tra`, `van_chuyen`, `hoan_tien`, `san_pham_loi`, `hoi_thong_tin`) y asignar niveles de urgencia y sentimiento, permitiendo enrutar automáticamente a los agentes adecuados.
- Priorización de colas de atención: gracias al campo `urgency` (alta, media, baja), el sistema puede reordenar la cola de trabajo de los agentes humanos, reduciendo el tiempo de respuesta para casos críticos.
- Análisis de sentimiento en feedback de clientes: el campo `sentiment` (negativo, neutral, positivo) permite monitorizar la satisfacción del cliente a partir de los tickets, alimentando paneles de métricas de calidad.
- Extracción de productos mencionados: el campo `product` extraído literalmente permite generar informes de incidencias por producto, identificando problemas recurrentes en artículos específicos.
- Automatización de respuestas iniciales: combinado con un sistema de plantillas, el JSON generado puede disparar respuestas automáticas contextuales (por ejemplo, instrucciones de devolución para `doi_tra`).
- Preprocesamiento para sistemas de análisis posteriores: el JSON estructurado puede alimentar bases de datos o pipelines de BI sin necesidad de parsing manual, facilitando la agregación de métricas de soporte.

## Benchmarks y rendimiento

La model card del autor proporciona resultados comparativos entre el base sin adaptador y el adaptador final, así como entre configuraciones alternativas del mismo experimento. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

| Grupo | (a) base + prompt naive | (b) base + prompt optimizado | (c) adaptador final |
|---|---|---|---|
| Target (precision 4 campos) | 0.000 | 0.585 | **0.995** |
| Regression (15 preguntas de cultura general) | 0.644 | 0.644 | **0.067** |
| Formato (JSON valido, 4 claves) | 0.000 | 1.000 | 1.000 |
| Latencia (ms/muestra, greedy) | 1759.8 | 488.2 | 804.7 |

| Run | Variable modificada | Train loss | Target | VRAM |
|---|---|---|---|---|
| `correct` (adaptador final) | — | 0.2951 | 0.995 | 6.75 GB |
| `attn_only` | solo q,v · r=322 | 0.3152 | 0.985 | 6.75 GB |
| `wrong_lr` | LR 1e-5 | 1.1184 | 0.475 | 6.75 GB |
| `qlora` | base 4-bit NF4 | 0.3019 | 1.000 | 4.70 GB |

## Requisitos de hardware

- VRAM estimada: 6.75 GB pico con bf16 y el adaptador cargado; 4.70 GB con la variante QLoRA (base 4-bit NF4).
- GPU recomendada: cualquier GPU con al menos 8 GB de VRAM. El autor usó una RTX 5050 Laptop 8 GB (Blackwell sm_120) vía WSL2.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 8 GB como RTX 3050/4050/5050, RTX 3060, RTX 4060, etc. Para 4 GB no es viable sin cuantización adicional.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), merge del adaptador en el base para usar con vLLM, TGI u Ollama. No se ha probado con otros frameworks.
- Latencia: 804.7 ms/muestra con decodificación greedy en la RTX 5050 Laptop, lo que permite un throughput de aproximadamente 1.2 muestras/segundo en esa GPU.

## Comparativa con modelos similares

No se dispone de adaptadores LoRA comparables de otros autores para la misma tarea. La comparativa más relevante es contra el modelo base sin adaptador y contra las variantes del mismo experimento, que se muestran en la tabla de benchmarks. A nivel de modelo base, Qwen3.5-2B pertenece a la familia Qwen3.5, que incluye versiones mucho mayores como Qwen3.5-397B-A17B (MoE) y Qwen3.5-Omni (256k contexto), pero no se dispone de especificaciones detalladas del modelo de 2B en la información proporcionada.

## Limitaciones y advertencias

- Regresión catastrófica en conocimiento general: el adaptador pierde la capacidad de responder preguntas de cultura general (0.067 frente a 0.644 del base). El autor documenta que 14 de 15 preguntas de regression fallan, produciendo JSON con contenido sin sentido aunque sintácticamente correcto.
- No es un modelo multiuso: debe usarse exclusivamente como clasificador de tickets, idealmente detrás de un router que solo envíe tickets reales.
- Dependencia del prompt de entrenamiento: el system prompt debe ser exactamente `"Phân loại ticket sau."` (en vietnamita). Usar un prompt diferente degrada el rendimiento a 0.000.
- Dominio limitado al vietnamita: aunque el base es multilingüe, el adaptador solo ha sido entrenado con datos en vietnamita y no se recomienda su uso en otros idiomas.
- Riesgo de alucinación en campos extraídos: el campo `product` se copia literalmente, pero si el ticket no menciona un producto, el modelo podría inventar uno.
- Sin soporte para razonamiento o tool calling: no es adecuado para tareas que requieran interacción con APIs o razonamiento multi-paso.
- Advertencia del autor: el adaptador no supera el umbral de regresión del laboratorio (diferencia de -0.578 frente a tolerancia 0.020) y no se recomienda su despliegue en producción sin añadir datos de replay (1-5% de datos generales) y reentrenar.

## Enlaces

- HuggingFace: https://huggingface.co/Relieq/lab21-2A202601055-qwen35-triage-vi
- Repositorio GitHub del autor (report y artefactos): https://github.com/HVNhan-Relieq/lab21-2A202601055
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Reporte técnico de Qwen3.5-Omni: https://arxiv.org/pdf/2604.15804
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Página de investigación de Qwen: https://qwen.ai/research/
