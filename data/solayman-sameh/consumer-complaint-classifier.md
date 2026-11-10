# Solayman-Sameh/consumer-complaint-classifier

## Resumen

El modelo `consumer-complaint-classifier` es un clasificador de texto en inglés desarrollado por Solayman-Sameh, consistente en un DistilBERT afinado para categorizar quejas de consumidores en el sector financiero. Concretamente, asigna cada reclamación a una de cinco categorías de resolución: tarjetas de crédito, informes de crédito, cobro de deudas, hipotecas y préstamos, y banca minorista. Está pensado como herramienta de triaje automatizado para entornos de atención al cliente o cumplimiento normativo.

El modelo parte de la arquitectura DistilBERT, una versión destilada de BERT con 66.957.317 parámetros, y se ha entrenado sobre el dataset `selener/consumer-complaint-database`. Según la model card, alcanza una precisión del 85,43 % y un F1 macro de 0,8467 en el conjunto de test, con una latencia mediana de aproximadamente 28 ms en CPU, lo que lo hace apto para despliegues ligeros sin GPU.

Su relevancia actual reside en su tamaño reducido (0,3 GB de repositorio) y su licencia MIT, que permiten integrarlo en pipelines de clasificación de bajo coste. No obstante, se trata de un modelo de nicho, monolingüe (inglés) y con una única tarea: la clasificación de quejas financieras en cinco clases, sin capacidades generativas ni de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.957.317 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens en su configuración estándar, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de tipo BERT destilado, con 6 capas en lugar de 12 y aproximadamente un 40 % menos de parámetros que BERT-base, manteniendo alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje según la literatura original. El modelo aquí presentado ha sido afinado para clasificación de texto con cinco etiquetas de salida, correspondientes a las categorías de queja financiera descritas.

El entrenamiento se realizó sobre el dataset `selener/consumer-complaint-database`. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de balanceo de clases ni si se aplicaron técnicas de aumento de datos. Tampoco se especifica si hubo ajuste fino con RLHF o DPO, algo esperable en un modelo de clasificación supervisada. La única información de rendimiento publicada es la del conjunto de test: accuracy 85,43 %, F1 macro 0,8467 y loss 0,4215.

## Capacidades

- Clasificación de texto en cinco categorías de quejas financieras: `credit_card`, `credit_reporting`, `debt_collection`, `mortgages_and_loans` y `retail_banking`.
- Procesamiento de reclamaciones redactadas en inglés, con ejemplos orientativos que cubren cargos no autorizados, errores en informes de crédito, acoso de cobradores, errores en hipotecas y bloqueo de cuentas.
- Inferencia rápida en CPU (latencia mediana de ~28 ms), adecuada para servicios de triaje en tiempo real.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling ni capacidades de agente.
- No soporta visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Triaje automático de reclamaciones en entidades financieras: el modelo clasifica cada queja entrante en una de las cinco categorías para enrutarla al equipo correspondiente (tarjetas, crédito, cobros, préstamos o banca), reduciendo el tiempo de gestión manual.
- Enrutamiento en mesas de ayuda de atención al cliente: integrado como primer paso de un pipeline, asigna tickets a colas especializadas según el tipo de producto financiero implicado.
- Análisis de volumen de quejas para cumplimiento normativo: permite agregar y cuantificar qué categorías concentran más reclamaciones en un periodo, útil para informes regulatorios internos.
- Preetiquetado de datasets para revisión humana: el modelo puede sugerir una categoría inicial que un analista valida, acelerando la anotación de nuevos corpus de quejas.
- Filtrado y priorización en portales de reclamaciones: clasifica automáticamente los formularios enviados por consumidores para detectar duplicados o dirigirlos al departamento adecuado.
- Prototipado rápido y demos: gracias a su tamaño reducido (0,3 GB) y su latencia en CPU, puede desplegarse en entornos sin GPU, como una app Gradio o un contenedor ligero, para validar flujos de clasificación antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy (test) | 85,43 % |
| F1 macro (test) | 0,8467 |
| Loss (test) | 0,4215 |
| Latencia mediana en CPU | ~28 ms |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un clasificador específico de tarea y no de un modelo generativo de propósito general. Tampoco se desglosan métricas por clase (precisión, recall o F1 individuales), lo que impide evaluar posibles desequilibrios entre categorías.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (66,9 M de parámetros ocupan ~268 MB en pesos); en FP16, aproximadamente 134 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con latencia de ~28 ms. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) ofrece margen sobrado.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo, Hugging Face Transformers `pipeline`, ONNX Runtime, TorchScript, o integración en una app Gradio (el autor publica una demo en su repositorio de GitHub). No se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, si bien al ser un modelo encoder pequeño podría exportarse a ONNX.
- Throughput y latencia: ~28 ms de latencia mediana en CPU según la model card; no se publica throughput en GPU ni en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| consumer-complaint-classifier (este) | 66,9 M | no disponible | Clasificación de quejas financieras (5 clases) | MIT | Hugging Face |
| DistilBERT-base-uncased (base sin afinar) | 66,9 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | Modelo base de propósito general | MIT | Hugging Face |

La comparación con modelos base es orientativa: este modelo está especializado en una tarea concreta y no es directamente intercambiable con los modelos genéricos, que requerirían afinamiento para la misma tarea. No se dispone de datos de rendimiento comparativo con otros clasificadores de quejas financieras en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa texto en inglés; las quejas en otros idiomas no están soportadas.
- Dominio restringido: entrenado exclusivamente para quejas financieras de consumidores; su uso fuera de ese ámbito producirá clasificaciones poco fiables.
- Riesgo de sesgo: no se documenta la composición del dataset ni si existe desequilibrio entre las cinco clases; el F1 macro de 0,8467 sugiere un rendimiento razonablemente equilibrado, pero no se aportan métricas por clase.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar categorías incorrectas con alta confianza en casos ambiguos o con vocabulario fuera de distribución.
- Sin información sobre el contexto máximo efectivo ni sobre el preprocesado aplicado (truncado, tokenización); se desconoce cómo maneja reclamaciones muy largas.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios antes de producción.
- Sin métricas de calibración ni umbrales de confianza documentados; en producción sería recomendable añadir una capa de abstención para casos de baja confianza.

## Enlaces

- Hugging Face: https://huggingface.co/Solayman-Sameh/consumer-complaint-classifier
- Repositorio GitHub (código, app Gradio, notebooks de entrenamiento y evaluación): https://github.com/Solayman-Sameh/consumer-complaint-classification
- Dataset utilizado: https://huggingface.co/datasets/selener/consumer-complaint-database
