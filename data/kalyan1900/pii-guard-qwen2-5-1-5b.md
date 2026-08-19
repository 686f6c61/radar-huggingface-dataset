# kalyan1900/PII-GUARD-Qwen2.5-1.5B

## Resumen

PII-GUARD-Qwen2.5-1.5B es un modelo de lenguaje afinado a partir de Qwen2.5-1.5B-Instruct, especializado en la detección y extracción de información personal identificable (PII, por sus siglas en inglés) en texto no estructurado. El modelo devuelve las entidades detectadas en formato JSON estructurado, lo que facilita su integración en pipelines de anonimización, cumplimiento normativo y auditoría de datos.

Desarrollado por kalyan1900, el modelo se entrenó mediante ajuste fino supervisado (SFT) con LoRA/QLoRA utilizando el framework Unsloth y TRL, sobre el dataset NVIDIA Nemotron-PII. Con aproximadamente 1,54 mil millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y se distribuye tanto en formato safetensors como en GGUF cuantizado (Q4_K_M), lo que permite su uso con llama.cpp y Ollama.

Su relevancia actual radica en la creciente demanda de herramientas de privacidad que puedan identificar datos sensibles de forma automática y eficiente, especialmente en entornos donde los modelos grandes son inviables por coste o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-1.5B-Instruct, un transformer causal con atención estándar, optimizado para instrucciones y diálogo. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) con LoRA/QLoRA, utilizando las bibliotecas Unsloth y TRL. El conjunto de datos empleado fue NVIDIA Nemotron-PII, diseñado específicamente para tareas de detección y extracción de entidades de información personal.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni la aplicación de técnicas adicionales como RLHF o DPO. La salida se formatea como JSON estructurado, lo que indica un entrenamiento orientado a la generación de respuestas con esquema fijo.

## Capacidades

- Detección de entidades PII en texto no estructurado: nombres, direcciones, números de teléfono, correos electrónicos, identificadores fiscales, etc.
- Extracción de PII con salida en JSON estructurado, listo para consumo por aplicaciones.
- Generación de texto causal estándar, con capacidad de seguir instrucciones gracias a la base Instruct.
- Compatible con pipelines de inferencia vía Transformers, llama.cpp y Ollama.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Anonimización de documentos legales: el modelo puede procesar contratos, sentencias o expedientes para localizar y enmascarar datos personales antes de su publicación o intercambio.
- Cumplimiento del RGPD: integración en flujos de auditoría para verificar que los datos almacenados o transmitidos no contienen PII no consentida.
- Limpieza de datasets de entrenamiento: antes de usar texto para entrenar otros modelos, se puede emplear este modelo para eliminar o anonimizar PII y reducir riesgos de fuga de información.
- Filtrado de logs y telemetría: detección de credenciales, direcciones IP o números de tarjeta en registros de aplicaciones para evitar su exposición en sistemas de monitoreo.
- Atención al cliente: análisis de conversaciones para extraer datos personales y enrutarlos a sistemas de gestión de privacidad o consentimiento.
- Verificación de redacciones: comprobar que textos generados por IA no contienen PII inventada o real no deseada antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M (~1 GB de pesos), puede ejecutarse en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (GTX 1650, RTX 3050, etc.) para inferencia fluida; una RTX 4090 o A100 ofrecería latencias muy bajas pero no son necesarias.
- Compatible con hardware de consumo: sí, cabe en tarjetas gráficas de gama media y baja.
- Opciones de despliegue: Transformers (Python), llama.cpp (CPU/GPU), Ollama (local), y servidores compatibles con el formato GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B, se espera un throughput de decenas de tokens por segundo en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda evaluar contra otros modelos de detección de PII como los basados en NER clásico (spaCy, Stanza) o modelos grandes como GPT-4 con prompting, aunque con diferencias notables en coste y latencia.

## Limitaciones y advertencias

- Sesgos del dataset de entrenamiento: al estar entrenado sobre Nemotron-PII, su rendimiento puede degradarse en dominios o formatos de texto muy diferentes a los del dataset.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar entidades PII si el texto de entrada es ambiguo o está fuera de distribución.
- Cobertura de PII limitada: no se especifica qué tipos de entidades reconoce; es posible que no cubra todas las categorías definidas por normativas locales.
- Longitud de contexto no documentada: aunque el modelo base Qwen2.5-1.5B soporta hasta 32k tokens, no se confirma si el ajuste fino preserva esa capacidad.
- Idiomas no especificados: el modelo base es multilingüe, pero el entrenamiento específico puede haber reducido su rendimiento en idiomas no representados en el dataset.
- Licencia Apache-2.0: permite uso comercial sin restricciones, pero el usuario debe verificar que el dataset de entrenamiento no imponga limitaciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalyan1900/PII-GUARD-Qwen2.5-1.5B
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- Dataset NVIDIA Nemotron-PII: no se proporciona enlace directo en la información disponible.
