# Adityapande403/LocShield-AI

## Resumen

LocShield-AI es un modelo de clasificación de tokens (token classification) especializado en la detección de datos de carácter personal (PII, *Personally Identifiable Information*), desarrollado por Adityapande403 como parte del ecosistema LocalShield AI. Está basado en `distilbert-base-multilingual-cased` y está optimizado para detectar entidades como nombres de persona, direcciones, organizaciones y localizaciones en inglés, hindi (escritura devanagari) e hindi romanizado (Hinglish).

El problema que resuelve es la anonimización y redacción de datos sensibles en texto, una necesidad crítica en sectores como la banca, la atención al cliente o el procesado de documentos, donde la normativa de protección de datos exige eliminar o enmascarar información personal antes de su procesamiento. Al ser un modelo ligero y con soporte ONNX cuantizado, puede ejecutarse completamente offline en CPU, lo que lo hace adecuado para despliegues donde la privacidad es prioritaria y no se desea enviar datos a servicios externos.

Con aproximadamente 134,7 millones de parámetros, el modelo no destaca por tamaño sino por especialización: según su autor alcanza un F1 macro de 0,9931 en validación y una latencia P50 de 2,27 ms en CPU con la versión INT8, cifras que lo posicionan como una opción práctica para detección de PII en producción con recursos mínimos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBertForTokenClassification (sobre distilbert-base-multilingual-cased) |
| Parametros totales | 134.741.001 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible (por defecto en DistilBERT: 512 tokens, dato no confirmado por el autor) |
| Tipos de cuantizacion | FP32 (safetensors y ONNX), INT8 dinámico (ONNX cuantizado, 128,9 MB) |
| Idiomas soportados | Inglés, hindi (devanagari) e hindi romanizado (Hinglish) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (514 MB), ONNX FP32 (514 MB), ONNX INT8 cuantizado (128,9 MB) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura DistilBERT, una versión destilada del transformer BERT que reduce el número de capas manteniendo buena parte de la capacidad del modelo original. Sobre el codificador multilingüe se añade una cabeza de clasificación de tokens que predice etiquetas siguiendo el esquema BIO: `O`, `B-PER`, `I-PER`, `B-ADDR`, `I-ADDR`, `B-ORG`, `I-ORG`, `B-LOC` e `I-LOC`. La elección de un codificador multilingüe como base permite cubrir inglés, hindi en escritura devanagari y Hinglish (hindi romanizado mezclado con inglés), un caso de uso habitual en datos de clientes de la India que muchos detectores de PII no cubren.

Sobre el entrenamiento, la model card indica únicamente que se empleó un dataset sintético; no se especifican el número de tokens, la composición detallada del corpus ni si se aplicaron técnicas como RLHF o DPO (estas últimas no son habituales en modelos de clasificación de tokens). Las métricas reportadas (F1, precisión y recall por entidad) sugieren una evaluación sobre un conjunto de validación separado, aunque su tamaño no se detalla.

## Capacidades

- Detección de entidades nombradas tipo PII en cuatro categorías: `PERSON` (nombres en inglés, hindi y Hinglish), `ADDRESS` (direcciones postales, puntos de referencia, localizaciones con código PIN), `ORGANIZATION` (empresas, bancos, instituciones) y `LOCATION` (ciudades, estados, países).
- Clasificación de tokens con esquema BIO y agregación de entidades compatible con el pipeline `ner` de Hugging Face Transformers.
- Funcionamiento completamente offline, sin envío de datos a servicios externos.
- Inferencia optimizada en CPU mediante ONNX con cuantización dinámica INT8 (compresión del 74,9 % respecto a FP32).
- Integración con el motor LocalShield, que añade validadores deterministas para identificadores indios: Aadhaar (algoritmo Verhoeff), tarjetas (Luhn), PAN, IFSC, entre otros, y funcionalidad completa de redacción de texto.
- Cobertura multilingüe real en contextos mezclados (Hinglish), habitual en conversaciones de soporte al cliente en la India.
- No soporta generación de texto, razonamiento, código, visión, audio ni tool calling: es un modelo exclusivamente de clasificación de tokens.

## Casos de uso

- Redacción de PII en tickets de soporte al cliente: el modelo puede identificar nombres, direcciones y organizaciones en conversaciones multilingües antes de almacenarlas o compartirlas con terceros, con latencias de ~2 ms por petición en CPU que permiten procesado en tiempo real.
- Cumplimiento normativo en banca e seguros indios: combinado con los validadores deterministas del motor LocalShield (PAN, IFSC, Aadhaar, tarjetas), permite anonimizar registros de llamadas y transcripciones que contienen identificadores regulados.
- Preprocesamiento de datos para entrenamiento de LLMs: puede usarse como filtro de anonimización en pipelines de ingesta de datos, eliminando PII de corpus de texto antes de fine-tuning.
- Anonimización de logs de aplicaciones: su reducida huella de memoria (~140 MB RSS) permite integrarlo en servicios existentes sin infraestructura GPU dedicada.
- Procesado de documentos con texto mixto hindi/inglés: cubre el caso frecuente de texto romanizado (Hinglish) que los detectores basados solo en inglés o en devanagari suelen omitir.
- Despliegue en entornos air-gapped o con requisitos estrictos de soberanía de datos: al ejecutarse offline en CPU, es adecuado para organizaciones que no pueden usar APIs de terceros.

## Benchmarks y rendimiento

La model card no incluye comparativas con otros modelos, pero sí publica métricas de validación propias:

| Métrica | Valor |
|---|---|
| F1 macro (validación) | 0,9931 |
| PERSON: F1 / Precisión / Recall | 0,9867 / 0,9738 / 1,0000 |
| ADDRESS: F1 / Precisión / Recall | 0,9988 / 0,9976 / 1,0000 |
| ORGANIZATION: F1 / Precisión / Recall | 0,9968 / 1,0000 / 0,9936 |
| LOCATION: F1 / Precisión / Recall | 0,9880 / 0,9763 / 1,0000 |
| Latencia P50 (ONNX INT8, CPU) | 2,27 ms |
| Throughput (CPU) | 428,3 peticiones/segundo |
| Huella de memoria | ~140 MB RSS |

Advertencia importante: estas métricas proceden de la model card del autor y no han sido verificadas de forma independiente. Al tratarse de un dataset sintético, los resultados en datos reales pueden ser notablemente inferiores. No se han publicado comparaciones con alternativas como Presidio, GLiNER o Microsoft Phi-style NER en la información disponible.

## Requisitos de hardware

- VRAM / memoria: al ser un modelo de 134,7 M de parámetros, la versión FP32 ocupa ~514 MB y la cuantizada INT8 ~129 MB; no requiere GPU. En CPU, la huella de memoria reportada es de ~140 MB RSS con ONNX INT8.
- GPU recomendadas: no necesarias; cualquier GPU moderna lo ejecutaría con holgura si se desea (incluso una GTX 1650 sería suficiente), pero el modelo está diseñado para inferencia en CPU.
- Consumer GPUs: no aplica; el objetivo declarado es ejecución offline en CPU, incluidas máquinas modestas.
- Opciones de despliegue: Hugging Face Transformers (pipeline `ner`), ONNX Runtime (FP32 e INT8), y el motor LocalShield (`localshield.LocalShield.from_pretrained`), que añade validadores deterministas y redacción. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (llama.cpp no es aplicable al no haber pesos GGUF).
- Latencia y throughput: P50 de 2,27 ms y 428,3 peticiones/segundo en CPU con ONNX INT8, según datos del autor.

## Comparativa con modelos similares

| Característica | LocShield-AI | Microsoft Presidio (rule-based + NER) | GLiNER (gliner_multi) |
|---|---|---|---|
| Tipo | NER con DistilBERT fine-tuned | Framework híbrido (reglas + NER externo) | NER zero-shot con transformer |
| Parametros | 134,7 M | Depende del NER subyacente | ~230-300 M según variante |
| Idiomas | Inglés, hindi, Hinglish | Multilingüe según NER subyacente | Multilingüe |
| Detección de PII india (Aadhaar, PAN, IFSC) | Sí, con validadores en LocalShield | Parcial (patrones configurables) | No específica |
| Formato ONNX cuantizado | Sí (INT8, 128,9 MB) | No aplica | No estándar |
| Licencia | Apache-2.0 | MIT | MIT (la mayoría de variantes) |
| Benchmarks publicados | F1 macro 0,9931 (validación propia, dataset sintético) | Ampliamente usado en producción | Benchmarks en datasets NER estándar |

Nota: los datos de Presidio y GLiNER son de conocimiento general; no hay una comparación directa publicada por el autor de LocShield-AI.

## Limitaciones y advertencias

- Dataset de entrenamiento sintético: las métricas de validación (F1 0,9931) pueden no trasladarse a datos reales; es recomendable evaluar sobre datos propios antes de producción.
- Cobertura de entidades limitada a cuatro categorías (PERSON, ADDRESS, ORGANIZATION, LOCATION): no detecta emails, teléfonos, DNI, fechas ni otros tipos de PII por sí solo; para eso hay que recurrir a los validadores deterministas del motor LocalShield (que cubren identificadores indios, no de otras jurisdicciones).
- Idiomas restringidos a inglés, hindi y Hinglish; no es adecuado para castellano u otros idiomas sin evaluación previa.
- Riesgo de falsos positivos en PERSON (precisión 0,9738, la más baja de las cuatro categorías), relevante si la redacción automática degrada la calidad del texto.
- Modelo muy reciente (creado en octubre de 2026) con apenas 24 descargas y 1 like: comunidad mínima, sin auditorías externas ni historial de uso en producción.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque conviene revisar los términos del ecosistema LocalShield si se usa el motor completo.
- La longitud de contexto no está confirmada en la model card; asumiendo el estándar de DistilBERT (512 tokens), documentos largos requerirían fragmentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adityapande403/LocShield-AI
- Repositorio del ecosistema LocalShield AI (GitHub): https://github.com/adityapande403/Loc-shield-AI
- Modelo base: https://huggingface.co/distilbert-base-multilingual-cased
- Paper, demo y otros enlaces: no disponibles
