# shoresh-labs/seter-pii-he-ar

## Resumen

Seter PII — Hebrew · Arabic · English es un modelo de clasificación de tokens (token-classification) especializado en la detección de datos personales identificables (PII) en hebreo, árabe e inglés, incluyendo textos mixtos hebreo/árabe-inglés. Lo desarrolla Shoresh Labs y se publica bajo licencia MIT. Resuelve un problema concreto: los detectores de PII gratuitos funcionan bien en inglés pero fallan de forma sistemática con nombres propios en hebreo y árabe, especialmente nombres de pila aislados, nombres con prefijos adheridos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).

El modelo se construye mediante fine-tuning de FacebookAI/xlm-roberta-large (559M parámetros) y reutiliza exactamente los mismos nombres de etiqueta que openai/privacy-filter (`private_person`, `private_address`, `private_phone`, `private_email`, `account_number`), lo que permite sustituirlo en pipelines ya construidos alrededor de ese modelo sin cambiar el esquema de salida. Es relevante ahora porque cubre un hueco de cobertura lingüística en herramientas de redacción y anonimización de uso gratuito, con un rendimiento declarado muy superior al de la alternativa de referencia en hebreo y árabe.

La detección es a nivel de carácter y sin tipado fino: el modelo marca fragmentos de texto y los asigna a una de las cinco categorías. Existe además una variante ligera (`seter-pii-he-ar-fast`) basada en jhu-clsp/mmBERT-base (308M parámetros, contexto de 8k) pensada para alto volumen en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), token classification |
| Parametros totales | 558.852.107 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base XLM-RoBERTa large soporta hasta 512 tokens; la variante fast declara 8k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he, ar, en (incluye texto mixto hebreo/árabe-inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa large, con una cabeza de clasificación de tokens para etiquetado de secuencias (NER). Se entrenó durante 3 épocas con learning rate 2e-5 sobre aproximadamente 12.600 frases **completamente sintéticas**: nombres inventados, identificadores (con checksums válidos de ID israelí), teléfonos, IBANs, correos y direcciones. Alrededor del 33% de las frases no contienen PII e incluyen organizaciones, ciudades, organismos públicos, nombres usados como palabras comunes, fechas, horas, números de pedido, precios, IPs y URLs, como ejemplos negativos. No se utilizó ningún dato personal real en el entrenamiento.

La innovación principal no es arquitectónica sino de cobertura lingüística y de compatibilidad de esquema: mantiene las cinco etiquetas de openai/privacy-filter para permitir un intercambio directo en producción. La variante `fast` usa jhu-clsp/mmBERT-base con learning rate 5e-5 y está optimizada para inferencia en CPU y documentos largos. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Detección de PII a nivel de carácter en hebreo, árabe e inglés, incluyendo mensajes mixtos entre estos idiomas.
- Clasificación en cinco categorías: `private_person`, `private_address`, `private_phone`, `private_email` y `account_number`.
- Reconocimiento de nombres propios en hebreo y árabe, incluyendo nombres de pila aislados, nombres con prefijos adheridos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).
- Detección de identificadores: DNI israelí, pasaportes, licencias, números fiscales, tarjetas bancarias, IBANs (todos bajo la etiqueta `account_number`).
- Detección de teléfonos, correos electrónicos y direcciones.
- Compatibilidad de esquema de salida con openai/privacy-filter, lo que permite sustitución directa en pipelines existentes.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo de etiquetado, no generativo.
- No cubre fechas, URLs, secretos ni ciudades/organizaciones como entidades independientes (por diseño).

## Casos de uso

- Redacción automática de PII en atención al cliente: el modelo puede procesar transcripciones de chats y correos en hebreo y árabe antes de almacenarlos o enviarlos a sistemas analíticos, sustituyendo nombres y teléfonos por marcadores. Es adecuado porque detecta nombres propios que los filtros en inglés pasan por alto.
- Cumplimiento de privacidad en entornos sanitarios y legales: como capa previa de anonimización en documentos en hebreo/árabe, con revisión humana posterior obligatoria. El propio autor lo describe como ayuda de redacción, no como garantía de anonimización.
- Migración desde openai/privacy-filter: al compartir los nombres de etiqueta, un equipo que ya tenga un pipeline montado puede cambiar el modelo y ganar cobertura en hebreo y árabe sin reescribir la lógica de post-proceso.
- Preprocesado de datasets multilingües: limpieza de PII en corpus de entrenamiento que contengan texto hebreo o árabe antes de publicarlos o usarlos en fine-tuning.
- Moderación y protección de datos en foros y redes sociales: detección en tiempo real de teléfonos, correos e identificadores publicados por usuarios en mensajes mixtos hebreo-inglés.
- Procesamiento de alto volumen en CPU: con la variante `seter-pii-he-ar-fast` (308M, ~221 ms por registro en CPU con 6 hilos) se puede desplegar en servidores sin GPU para lotes grandes de documentos.
- Enmascarado en pipelines de CI/CD de datos: integración como paso de token-classification en ETL para anonimizar campos de texto libre antes de cargarlos en un almacén.

## Benchmarks y rendimiento

Detección a nivel de carácter, sin tipado. "Entidades capturadas" = entidad gold solapada por cualquier predicción.

| Test set | Sistema | Entidades capturadas | Caracteres de persona capturados | Spans falsos positivos |
|---|---|---|---|---|
| hard1 — 43 mensajes escritos a mano | openai/privacy-filter | 43% | 28% | 3 |
| | seter-pii-he-ar | 100% | 97% | 3 |
| hard2 — 40 mensajes escritos a mano, previos a los datos de entrenamiento | openai/privacy-filter | 47% | 27% | 1 |
| | seter-pii-he-ar | 98% | 96% | 1 |
| English — 300 registros de ai4privacy/pii-masking-400k | openai/privacy-filter | 95% | 92% | — |
| | seter-pii-he-ar | 100% | 99,9% | — |

Benchmark independiente REDACT (subconjuntos hebreo, árabe e inglés; solo evaluación, nunca usado para entrenamiento):

| Idioma | openai/privacy-filter F1 | seter-pii-he-ar (xlm-r-large) F1 | seter-pii-he-ar-fast (mmBERT-base) F1 |
|---|---|---|---|
| Hebreo (621 registros) | 0,63 | 0,87 | 0,84 |
| Árabe (568) | 0,72 | 0,89 | 0,88 |
| Inglés (534) | 0,70 | 0,84 | 0,83 |

Nombres capturados en hebreo REDACT: 40% (openai/privacy-filter) frente a 99,5% (seter-pii-he-ar) y 98,9% (seter-pii-he-ar-fast). Los números de identificación (pasaporte, licencia, fiscal, tarjeta) se capturan con más frecuencia que con openai/privacy-filter en los tres idiomas.

Tiempo de inferencia declarado en CPU (6 hilos) por registro REDACT: ~506 ms para `seter-pii-he-ar` y ~221 ms para `seter-pii-he-ar-fast`.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (559M parámetros); en fp16, en torno a 1,1 GB. No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 sobredimensionadas para este tamaño, pero válidas para lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060, RTX 4090 y similares; también en GPUs de 4-6 GB.
- Despliegue: pipeline de Transformers (`token-classification`), vLLM no aplica (no es generativo), TGI no aplica; para CPU, exportación a ONNX es una opción razonable aunque no está documentada por el autor. La variante `fast` está pensada para CPU.
- Latencia y throughput: ~506 ms por registro REDACT en CPU con 6 hilos para el modelo grande; ~221 ms para la variante fast. Throughput en GPU no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | F1 hebreo (REDACT) | F1 árabe (REDACT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| seter-pii-he-ar | 559M | no disponible (base 512) | he, ar, en | 0,87 | 0,89 | MIT | Hugging Face |
| seter-pii-he-ar-fast | 308M | 8k (declarado) | he, ar, en | 0,84 | 0,88 | MIT | Hugging Face |
| openai/privacy-filter | no disponible | no disponible | principalmente inglés | 0,63 | 0,72 | no disponible | Hugging Face |

La comparativa se limita a estos tres sistemas porque son los que aparecen en la información proporcionada. No se dispone de datos de otros detectores de PII multilingües para una comparación adicional.

## Limitaciones y advertencias

- Es una **ayuda de redacción**, no una garantía de anonimización ni una certificación de cumplimiento. Mantener revisión humana en datos legales, médicos, financieros y de RRHH.
- Los conjuntos de test escritos a mano son pequeños y fueron redactados por el mismo autor que las plantillas de entrenamiento; cabe esperar menor precisión en datos reales.
- Ciudades, organizaciones y organismos públicos no se etiquetan de forma independiente por diseño.
- No cubre fechas, URLs ni secretos; para esos casos el autor recomienda usar openai/privacy-filter.
- Los DNI israelíes, pasaportes y cuentas bancarias se etiquetan todos como `account_number`, sin distinción de tipo.
- Las palabras de parentesco con prefijos adheridos (por ejemplo, לאבא, "a papá") a veces se marcan como nombres.
- En nombres árabes de varias palabras (أبو خالد) pueden devolverse dos spans adyacentes de `private_person`; hay que fusionar vecinos si se necesita un único span.
- Usar `aggregation_strategy="simple"` en el pipeline de Transformers.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y falsos negativos en la detección.
- Sesgos conocidos: no documentados por el autor; el entrenamiento es 100% sintético, lo que puede no reflejar la distribución real de nombres y formatos.
- Licencia MIT: permite uso comercial sin restricciones adicionales, igual que el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoresh-labs/seter-pii-he-ar
- Variante fast: https://huggingface.co/shoresh-labs/seter-pii-he-ar-fast
- Demo: https://huggingface.co/spaces/yinonov/seter-demo
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Modelo base de la variante fast: https://huggingface.co/jhu-clsp/mmBERT-base
- Modelo de referencia con esquema compatible: https://huggingface.co/openai/privacy-filter
- Paper REDACT: https://arxiv.org/abs/2606.19881
- Dataset de evaluación en inglés: https://huggingface.co/datasets/ai4privacy/pii-masking-400k
- Organización: https://huggingface.co/shoresh-labs
