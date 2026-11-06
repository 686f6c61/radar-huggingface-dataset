# oleggat0r/LFM3-1.7B-transaction-categorization

## Resumen

LFM3-1.7B Transaction Categorization es un ajuste fino (LoRA) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario oleggat0r y publicado en Hugging Face. Su propósito es resolver una tarea muy concreta del sector financiero: clasificar la descripción de una transacción bancaria en una de diez categorías predefinidas (desde "Food & Dining" hasta "Healthcare & Medical"). El modelo se entrenó sobre el dataset mitulshah/transaction-categorization y alcanza una precisión de coincidencia exacta del 99,0 % en 2.000 ejemplos reservados para evaluación, frente al 5,95 % del modelo base.

La relevancia de esta ficha reside en demostrar cómo un LoRA ligero (r=16) sobre un modelo pequeño de 1,7 mil millones de parámetros puede especializarse en una tarea de clasificación en apenas cuatro minutos de entrenamiento en una sola GPU de consumo (AMD Radeon RX 7900 con ROCm). El repositorio incluye tanto el adaptador LoRA en safetensors como una versión fusionada y cuantizada en GGUF Q8_0 lista para llama.cpp, lo que permite desplegarlo en CPU sin GPU dedicada.

La arquitectura subyacente es LFM3 (Liquid Foundation Models) de LiquidAI, un modelo de texto de 1,7B de parámetros con capacidades conversacionales y modo de razonamiento desactivable. El contexto y detalles finos de la arquitectura base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models), con adaptador LoRA sobre el modelo base |
| Parametros totales | 1.728.801.600 (modelo fusionado en safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); adaptador también disponible en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | Safetensors (adaptador LoRA) y GGUF (modelo fusionado Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de lenguaje conversacional de la familia LFM3 de LiquidAI. Sobre él se aplica un adaptador LoRA con rango r=16, alpha=32 y dropout de 0,05, aplicado a todas las capas lineales del modelo. El entrenamiento consistió en SFT (supervised fine-tuning) con la librería TRL: una única época, tamaño de batch 16, learning rate de 2e-4 con planificación coseno, y cálculo de la pérdida únicamente sobre los tokens del asistente.

Los datos de entrenamiento provienen del dataset mitulshah/transaction-categorization: se muestrearon 10.000 ejemplos (1.000 por categoría) a partir de las 4,5 millones de filas originales, tras eliminar duplicados y descripciones con etiquetas en conflicto. La entrada es únicamente la descripción de la transacción; país y moneda no se utilizan. El entrenamiento se ejecutó en una AMD Radeon RX 7900 (ROCm) y duró unos 4 minutos. Como innovación práctica destacable, el repositorio distribuye una versión donde el adaptador ya está fusionado con el modelo base y convertido a GGUF Q8_0, optimizado para inferencia en CPU con llama.cpp.

## Capacidades

- Clasificación de transacciones bancarias en exactamente una de 10 categorías fijas: Charity & Donations; Entertainment & Recreation; Financial Services; Food & Dining; Government & Legal; Healthcare & Medical; Income; Shopping & Retail; Transportation; Utilities & Services.
- Respuesta estricta: devuelve solo el nombre de la categoría, sin explicaciones adicionales (a diferencia del modelo base).
- Funciona en modo conversacional mediante chat template, con el system prompt que define las categorías y la descripción de la transacción como mensaje de usuario.
- Soporta desactivación del modo de razonamiento (`enable_thinking=False` / `--reasoning off`), recomendada por el autor para esta tarea.
- Inferencia determinista recomendada: `do_sample=False` / `--temp 0` con un máximo de 16 tokens nuevos.
- No se anuncian capacidades de visión, audio, tool calling ni agentes; es un modelo especializado en una única tarea de clasificación textual.

## Casos de uso

- Categorización automática de extractos bancarios: dado un flujo de descripciones de transacciones, el modelo asigna cada una a su categoría con un 99 % de precisión en el dataset de evaluación, permitiendo procesar millones de movimientos sin intervención manual.
- Apps de finanzas personales: puede integrarse en una aplicación de presupuesto para etiquetar automáticamente los gastos del usuario en tiempo real, ya que la inferencia en CPU tarda unos 430 ms por ejemplo.
- Conciliación contable para pymes: clasificación de movimientos de cuenta para contadores que necesitan agrupar gastos por partida (servicios, transporte, sanidad, etc.) antes de la exportación a software de contabilidad.
- Análisis de gasto en fintech: pipelines ETL que enriquecen datos transaccionales con categorías para dashboards de analítica de gasto y segmentación de clientes.
- Detección de patrones de gasto: al categorizar el histórico de un cliente, se pueden construir características para modelos posteriores de scoring o recomendación.
- Despliegue en entornos sin GPU: gracias al GGUF Q8_0, puede ejecutarse con llama.cpp o llama-server en un servidor de 16 núcleos de CPU, adecuado para procesamiento por lotes nocturno de extractos.
- Prototipado rápido de tareas similares: el código de entrenamiento publicado permite replicar el enfoque LoRA para otras taxonomías de clasificación con esfuerzo mínimo.

## Benchmarks y rendimiento

Resultados publicados por el autor: precisión de coincidencia exacta sobre 2.000 ejemplos reservados (200 por categoría).

| Model | Accuracy |
|---|---|
| LFM3-1.7B (base) | 5,95 % |
| Este adaptador (bf16) | 99,0 % |
| `lfm3-txn-q8_0.gguf` (llama.cpp) | 99,0 % |

Rendimiento de inferencia: aproximadamente 430 ms por ejemplo en CPU con llama-server (16 núcleos, sin GPU). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el GGUF Q8_0 fusionado ocupa unos 1,9 GB, por lo que es abordable en cualquier equipo con al menos 4 GB de RAM libre; la variante bf16 con LoRA requerirá más (no se especifica cifra exacta).
- GPU recomendadas: no se requiere GPU para inferencia. Para reentrenar el LoRA, el autor usó una AMD Radeon RX 7900 con ROCm (entrenamiento de ~4 minutos).
- Cabe en GPU de consumo: sí, con holgura; de hecho, la inferencia funciona incluso solo con CPU.
- Opciones de despliegue: llama.cpp / llama-cli / llama-server con el GGUF Q8_0, o Transformers + PEFT cargando el adaptador sobre LiquidAI/LFM3-1.7B. No se menciona soporte específico de vLLM, Ollama o TGI.
- Latencia: ~430 ms por ejemplo en CPU (llama-server, 16 núcleos, sin GPU). Throughput en GPU: no disponible.

## Comparativa con modelos similares

Alternativas para clasificación de transacciones bancarias en inglés:

| Modelo | Enfoque | Tamaño | Precisión declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B Transaction Categorization | LoRA sobre LLM generativo (LFM3-1.7B) | 1,7B | 99,0 % (dataset sintético) | LFM Open License v1.0 | HF: adaptador LoRA + GGUF Q8_0 |
| LFM3-1.7B (base, sin ajustar) | LLM generativo generalista | 1,7B | 5,95 % en esta tarea | LFM Open License v1.0 | HF: LiquidAI/LFM3-1.7B |
| Clasificadores BERT/DistilBERT fine-tuned | Encoder transformer dedicado | ~66M-110M | no disponible para esta tarea | variable (típicamente Apache 2.0) | numerosos en HF, requieren entrenamiento propio |

Nota: no constan comparaciones directas con otros modelos de categorización de transacciones en la información disponible; la tabla anterior se limita al modelo base y a la categoría técnica habitual.

## Limitaciones y advertencias

- El dataset de entrenamiento es sintético y basado en plantillas, por lo que la precisión sobre extractos bancarios reales será inferior al 99 % anunciado.
- Algunas etiquetas del dataset son ruidosas (por ejemplo, cadenas de farmacias etiquetadas como Healthcare & Medical, o tiendas minoristas etiquetadas como Food & Dining); la mayoría de los errores residuales son de este tipo.
- Solo se admiten las 10 categorías definidas; cualquier transacción fuera de esa taxonomía se asignará forzadamente a una de ellas.
- El modelo está entrenado únicamente en inglés; no se espera que funcione con descripciones de transacciones en otros idiomas, incluido el castellano.
- País y moneda no se usan como entrada, lo que puede degradar el rendimiento en descripciones de mercados con convenciones distintas a las del dataset.
- Licencia: LFM Open License v1.0, una licencia de tipo "other" derivada de LiquidAI; conviene revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones específicas.
- Al ser un LLM generativo usado como clasificador, existe riesgo residual de respuestas fuera de formato o alucinaciones si se modifica el system prompt o los parámetros de generación recomendados (se aconseja temperatura 0 y máximo 16 tokens).
- Datos de contexto largo, sesgos demográficos o evaluaciones de seguridad: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oleggat0r/LFM3-1.7B-transaction-categorization
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/mitulshah/transaction-categorization
- Código de entrenamiento (GitHub): https://github.com/oleggator/lfm3-transaction-categorization
- Licencia: archivo LICENSE en el repositorio del modelo (enlace relativo LICENSE en la model card)
