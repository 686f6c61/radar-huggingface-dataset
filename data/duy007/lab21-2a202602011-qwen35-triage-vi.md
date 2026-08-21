# Duy007/lab21-2A202602011-qwen35-triage-vi

## Resumen

El modelo `Duy007/lab21-2A202602011-qwen35-triage-vi` es un adaptador LoRA de fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por Dương Văn Duy como parte del laboratorio 21 del curso AICB-P2T3 (Fine-tuning & An Toàn). Su propósito es transformar tickets de atención al cliente en vietnamita en una salida JSON estructurada con cuatro campos: `intent`, `urgency`, `product` y `sentiment`. Se trata de un trabajo académico de demostración, no de un modelo de producción.

El adaptador se entrenó con 250 tickets reales de soporte al cliente en vietnamita, utilizando una configuración LoRA con r=16 y 12 módulos objetivo, en una GPU Tesla T4 (Colab Free). Los resultados reportados por el autor muestran una mejora significativa en la precisión de clasificación (0.975 frente a 0.765 del prompt optimizado sin fine-tuning), aunque con una ligera regresión en conocimiento general, indicativa de un leve olvido catastrófico. El repositorio incluye el adaptador en formato safetensors, el código de inferencia y un informe detallado en `submission/REPORT.md`.

La relevancia de este modelo radica en su enfoque práctico: demuestra cómo un fine-tuning LoRA de bajo coste puede adaptar un LLM multilingüe a una tarea específica de extracción de información en un idioma de bajos recursos como el vietnamita, con un pipeline reproducible y métricas de evaluación transparentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (base: `unsloth/Qwen3.5-4B`) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el base es de 4B) |
| Parametros activos | No disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | No disponible (depende del base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse) |
| Idiomas soportados | Vietnamita (entrenado exclusivamente en `vi`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado a un modelo base Qwen3.5-4B, que pertenece a la familia Qwen3.5 de Alibaba. La arquitectura exacta del base no se especifica en la documentación disponible; podría ser densa o MoE, pero no hay datos confirmados. El adaptador se configuró con r=16 y se aplicó a 12 módulos objetivo (all-linear/text-linear placement), lo que permite un fine-tuning eficiente en términos de parámetros y memoria.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) usando la librería TRL, sobre un conjunto de 250 tickets de soporte al cliente en vietnamita. Cada ticket se etiquetó con una salida JSON de cuatro campos: `intent`, `urgency`, `product` y `sentiment`. El proceso se ejecutó en una GPU Tesla T4 de 16 GB (Colab Free), lo que demuestra la viabilidad del enfoque en hardware de gama baja. No se menciona el uso de RLHF ni DPO; el método es exclusivamente SFT con LoRA.

Una innovación destacable es la evaluación comparativa entre tres configuraciones: (a) base con prompt ingenuo, (b) base con prompt optimizado, y (c) el adaptador LoRA. Los resultados muestran que el fine-tuning mejora la precisión de clasificación (target) de 0.765 a 0.975, pero introduce una regresión de 0.058 en 15 preguntas de conocimiento general, superando el umbral de tolerancia de ±0.020. El autor identifica esto como un caso leve de olvido catastrófico y sugiere incorporar un 1-5% de datos de replay para mitigarlo.

## Capacidades

- Clasificación de tickets de soporte al cliente en vietnamita, extrayendo cuatro campos estructurados: `intent`, `urgency`, `product` y `sentiment`.
- Generación de salidas JSON válidas (formato 1.000 en la evaluación), lo que facilita la integración en pipelines automatizados.
- Manejo de conversaciones de soporte en lenguaje natural vietnamita, incluyendo consultas sobre pedidos, devoluciones y productos.
- Inferencia eficiente: latencia media de 1397 ms en la evaluación (frente a 3205 ms del base con prompt ingenuo), gracias al prompt optimizado y al adaptador.
- No se reportan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. El modelo está especializado exclusivamente en la tarea de triage.

## Casos de uso

- Automatización de triage en centros de soporte al cliente: el modelo puede recibir un ticket en vietnamita y devolver un JSON con `intent`, `urgency`, `product` y `sentiment`, permitiendo enrutar automáticamente la incidencia al departamento adecuado (facturación, devoluciones, soporte técnico, etc.) y priorizarla según urgencia.
- Integración en sistemas de ticketing (Zendesk, Freshdesk, etc.) mediante una API que llame al modelo: el adaptador se carga sobre el base Qwen3.5-4B y se ejecuta en un servidor con GPU, procesando cada ticket entrante en menos de 1.5 segundos.
- Análisis de sentimiento en feedback de clientes: el campo `sentiment` extraído puede alimentar dashboards de satisfacción y detectar clientes insatisfechos en tiempo real.
- Clasificación de productos en incidencias: el campo `product` permite agrupar tickets por línea de producto, útil para identificar problemas recurrentes en artículos específicos.
- Entrenamiento de modelos de lenguaje para vietnamita: este adaptador sirve como ejemplo de fine-tuning LoRA en un idioma de bajos recursos, demostrando que se puede lograr alta precisión con pocos datos (250 ejemplos).
- Evaluación de técnicas de mitigación de olvido catastrófico: el informe del autor documenta la regresión en conocimiento general y propone estrategias de replay, lo que lo convierte en un caso de estudio para investigadores interesados en fine-tuning seguro.

## Benchmarks y rendimiento

La model card incluye una evaluación propia del autor sobre 50 items, comparando tres configuraciones. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este adaptador específico.

| Configuracion | Target (precision de clasificacion) | Regression (conocimiento general) | Formato (validez JSON) | Latencia (ms) |
|---|---|---|---|---|
| (a) Base + prompt ingenuo | 0.000 | 0.758 | 0.000 | 3205 |
| (b) Base + prompt optimizado | 0.765 | 0.758 | 1.000 | 1038 |
| (c) LoRA fine-tune (este adaptador) | 0.975 | 0.700 | 1.000 | 1397 |

Nota: la columna "regression" mide el rendimiento en 15 preguntas de conocimiento general; el umbral de tolerancia era ±0.020, y el adaptador supera ese límite (0.700 vs 0.758 del baseline), indicando un leve olvido catastrófico. El autor declara que la puerta de regresión de 4 grupos es "FAILED" por esta razón.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es muy ligero (0.1 GB), pero requiere cargar el base Qwen3.5-4B. Con cuantización de 4 bits, el conjunto cabe en ~4-6 GB de VRAM; sin cuantizar, ~8-10 GB.
- GPU recomendadas: Tesla T4 (16 GB) es suficiente, como se usó en el entrenamiento. También funcionaría en RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB) o A100/H100 para mayor throughput.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo con cuantización. En una RTX 4090 se puede usar el base en FP16 sin problemas.
- Opciones de despliegue: `transformers` + `peft` (código de ejemplo incluido en la model card), `vLLM` (aunque puede haber problemas de compatibilidad con arquitecturas Qwen3.5 MoE, como se reporta en el issue #35344), `Ollama` (si se convierte el adaptador a GGUF, no incluido en el repo), `TGI` (Text Generation Inference) con soporte para LoRA.
- Latencia y throughput: la evaluación reporta 1397 ms por generación (64 tokens máx) en T4. En hardware más moderno (RTX 4090, A100) se espera una latencia inferior a 500 ms.

## Comparativa con modelos similares

No hay información pública sobre otros adaptadores LoRA para la misma tarea (triage de tickets en vietnamita) con los que comparar directamente. En la búsqueda web aparece `rhindsight/lab21-2A202601903-qwen35-triage-vi`, que parece ser un adaptador similar de otro estudiante, pero no se dispone de sus métricas ni especificaciones. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Base | Tamano adaptador | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Duy007/lab21-2A202602011-qwen35-triage-vi` | Qwen3.5-4B | 0.1 GB | Triage tickets vietnamita | Apache-2.0 | Publico en HF |
| `rhindsight/lab21-2A202601903-qwen35-triage-vi` | Qwen3.5-4B (presumible) | No disponible | Triage tickets vietnamita | No disponible | Publico en HF |

No se dispone de datos de rendimiento para el segundo modelo, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado con solo 250 ejemplos: el conjunto de datos es muy reducido, lo que limita la generalización a variaciones lingüísticas y casos extremos no vistos.
- Olvido catastrófico leve: la evaluación muestra una regresión de 0.058 en conocimiento general, lo que indica que el fine-tuning degrada capacidades generales del modelo base. No es apto para tareas que requieran razonamiento general o conocimiento enciclopédico.
- Sesgo potencial: el dataset de tickets puede reflejar sesgos del dominio de soporte al cliente (por ejemplo, productos específicos, tono de los clientes), lo que podría afectar a la clasificación de tickets fuera de ese dominio.
- Riesgo de alucinación en campos JSON: aunque el formato es perfecto en la evaluación, en entradas ambiguas el modelo podría inventar valores para `intent` o `urgency`. Se recomienda validación humana o reglas de negocio.
- Idioma limitado: solo soporta vietnamita; no se ha evaluado su comportamiento en otros idiomas, aunque el base Qwen3.5-4B es multilingüe.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias restricciones (aunque Qwen suele ser de código abierto, hay que verificar la licencia específica de Qwen3.5).
- No es un modelo de producción: es un entregable académico; no se ha probado en entornos reales con alta concurrencia ni se ha auditado su seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Duy007/lab21-2A202602011-qwen35-triage-vi
- Repositorio del laboratorio original: https://github.com/hieutrungdao/Day21-Track3-Finetuning-Lab
- Informe completo (dentro del repo del modelo): `submission/REPORT.md` (accesible desde la pestaña "Files" del modelo)
- Modelo similar de otro estudiante: https://huggingface.co/rhindsight/lab21-2A202601903-qwen35-triage-vi
- Reporte técnico de Qwen3 (para contexto sobre la familia base): https://arxiv.org/html/2505.09388v1
