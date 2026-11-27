# ChadTollison/pii-distilbert-v3

## Resumen

pii-distilbert-v3 es un modelo de clasificación de tokens (token classification, esquema BIO) construido sobre DistilBERT cased y especializado en la detección de datos personales identificables (PII) en textos en inglés y español. Lo publica ChadTollison como tercera iteración de su familia pii-distilbert y resuelve un problema muy concreto: localizar y permitir la redacción automática de información sensible antes de que un texto se almacene, se envíe a un tercero o se procese por un LLM.

El modelo cubre 15 categorías de PII: nombres, direcciones, correos electrónicos, teléfonos, números de la seguridad social estadounidense, números de tarjeta, IBAN, pasaportes, permisos de conducir, documentos de identidad, fechas de nacimiento, nombres de usuario, contraseñas, direcciones IP y claves de API. Con 65,2 millones de parámetros y un repositorio de 0,3 GB, es un modelo pequeño pensado para ejecutarse en CPU y para integrarse en pipelines de saneamiento de datos.

Su relevancia práctica radica en la combinación de tamaño reducido, licencia Apache 2.0 y soporte bilingüe inglés-español, algo poco habitual en detectores de PII open source, que suelen centrarse solo en inglés. El autor lo distribuye junto al paquete `scrubpii`, que añade validaciones por checksum (Luhn, IBAN, SSN) y reglas para correos, IP y claves de API, además de segmentación en ventanas de 128 tokens para textos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT cased), cabeza de clasificación de tokens con etiquetas BIO |
| Parametros totales | 65.214.751 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de DistilBERT); el paquete scrubpii procesa en ventanas de 128 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye ONNX y safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tarea | token-classification (NER de PII) |
| Numero de etiquetas | 15 tipos de PII en esquema BIO |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DistilBERT en versión cased (sensible a mayúsculas y minúsculas), con 65,2 millones de parámetros, sobre el que se añade una cabeza de clasificación de tokens que emite etiquetas en formato BIO para 15 categorías de datos personales. DistilBERT es una destilación de BERT que reduce el número de capas y parámetros manteniendo buena parte de la capacidad representacional, lo que explica su idoneidad para inferencia en CPU.

El ajuste fino parte de ChadTollison/pii-distilbert-v2 y se realizó durante una época sobre aproximadamente 100.000 textos, ejecutado en un runner de CPU. Los datos de entrenamiento combinan ai4privacy/open-pii-masking-500k-ai4privacy (licencia CC BY 4.0, filas en inglés y español) y gretelai/gretel-pii-masking-en-v1 (Apache 2.0), junto con frases generadas por el propio autor. No se documenta el uso de RLHF ni DPO, algo esperable en un modelo de clasificación de tokens. El código de entrenamiento está publicado en el repositorio del autor (training/train_v3.py y training/retrain_pii.py).

## Capacidades

- Detección de 15 tipos de PII: nombres, direcciones, correos electrónicos, teléfonos, SSN, números de tarjeta, IBAN, pasaportes, permisos de conducir, documentos de identidad, fechas de nacimiento, nombres de usuario, contraseñas, direcciones IP y claves de API.
- Etiquetado a nivel de token con esquema BIO, apto para extracción de entidades y sustitución por marcadores.
- Bilingüe inglés-español en el mismo modelo.
- Integración con el paquete `scrubpii`, que añade validación por checksum (Luhn para tarjetas, validación de IBAN y SSN), reglas regex para correos, IP y claves de API, y procesamiento por ventanas de 128 tokens para documentos largos.
- Exportación a ONNX para despliegue sin dependencia de PyTorch.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni razonamiento multi-paso: es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Redacción de PII en logs de aplicaciones: el modelo identifica correos, teléfonos, IP y claves de API en líneas de log antes de enviarlas a un sistema de observabilidad o a un almacén centralizado, reduciendo el riesgo de filtrar datos personales en herramientas de terceros.
- Saneamiento previo al envío de prompts a LLM externos: se ejecuta el detector sobre el texto del usuario y se sustituyen las entidades por marcadores antes de llamar a una API de modelo generativo, cumpliendo con requisitos de minimización de datos del RGPD.
- Anonimización de datasets para entrenamiento o publicación: procesamiento por lotes de corpus en inglés y español para eliminar nombres, direcciones y documentos de identidad antes de compartir los datos o usarlos en fine-tuning.
- Cumplimiento y auditoría de documentos: revisión de contratos, formularios y correos archivados para localizar datos personales y clasificar su presencia, con validación por checksum para reducir falsos positivos en tarjetas e IBAN.
- Atención al cliente con datos sensibles: filtrado en tiempo real de conversaciones multi-turno antes de almacenarlas en CRM o de pasarlas a sistemas de analítica, aprovechando que el modelo corre en CPU y no añade latencia significativa.
- Enmascarado en pipelines de extracción documental: combinación con OCR para detectar y redactar PII en documentos escaneados, usando la ventana de 128 tokens del paquete para cubrir páginas completas.
- Preprocesado en entornos con recursos limitados: al ser un modelo de 65 millones de parámetros y 0,3 GB, puede desplegarse en contenedores pequeños o en el propio portátil del desarrollador sin GPU.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el paquete `scrubpii` con este modelo frente a Microsoft Presidio y spaCy. La métrica es F1 sobre textos reservados (held-out), midiendo la cobertura de datos personales marcados y la precisión de las detecciones.

| Dataset (textos held-out) | scrubpii (este modelo) | Microsoft Presidio | spaCy |
|---|---:|---:|---:|
| ai4privacy, inglés | 0,99 | 0,81 | 0,68 |
| ai4privacy, español | 0,99 | 0,63 | 0,46 |
| Gretel PII, inglés | 0,99 | 0,85 | 0,36 |
| Gretel finance, inglés (nunca visto en entrenamiento) | 0,79 | 0,52 | 0,58 |

El autor señala que Presidio es aproximadamente 4 veces más rápido por texto. No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32; el modelo pesa unos 260 MB en safetensors y puede ejecutarse enteramente en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) lo ejecuta con holgura, pero el caso de uso natural es CPU.
- Cabe en cualquier GPU consumer y en dispositivos de borde; también en contenedores con 1-2 GB de RAM.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, endpoints de Hugging Face, y el paquete `scrubpii` como envoltorio de alto nivel. Compatible con vLLM y TGI solo en la medida en que estos soporten modelos de token classification, lo cual no es su caso de uso principal.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que Presidio es unas 4 veces más rápido por texto, lo que sitúa a este modelo en el rango de decenas de milisegundos por fragmento en CPU, sin cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|---|
| pii-distilbert-v3 | 65,2 M | 512 tokens (ventanas de 128 en scrubpii) | en, es | DistilBERT fine-tuned para 15 tipos de PII | Apache 2.0 |
| Microsoft Presidio | no aplica (ensemble de reglas + spaCy/transformers) | dependiente del motor NER | multilingüe según motor | Framework de detección con reglas y NER | MIT |
| spaCy (modelos NER) | variable (sm/md/lg) | dependiente del pipeline | multilingüe | NER generalista, no específico de PII | MIT |
| Modelos NER de PII basados en BERT base | ~110 M | 512 tokens | normalmente solo en | Fine-tuning genérico de NER | variable |

Frente a Presidio, este modelo ofrece mayor F1 en los datasets evaluados (0,99 frente a 0,81 en inglés y 0,63 en español) a costa de ser unas 4 veces más lento. Frente a spaCy, la diferencia es aún mayor en cobertura de PII (0,99 frente a 0,68 en inglés y 0,46 en español). La ventaja diferencial es el soporte bilingüe inglés-español en un único checkpoint pequeño y con licencia permisiva.

## Limitaciones y advertencias

- Entrenado mayoritariamente con textos cortos; para documentos largos es necesario procesar en ventanas (el paquete `scrubpii` lo hace con 128 tokens), lo que puede fragmentar entidades que cruzan ventanas.
- Los datos de entrenamiento son en buena parte sintéticos, por lo que el autor advierte que el recall en texto real será inferior al de los benchmarks; en usos de alto riesgo debe revisarse siempre la redacción.
- El rendimiento en el dataset Gretel finance (nunca visto en entrenamiento) cae a 0,79, lo que indica degradación fuera de la distribución de entrenamiento.
- Solo cubre inglés y español; otros idiomas no están soportados.
- Riesgo de falsos negativos en formatos de PII no representados en el entrenamiento (documentos de identidad de países distintos a los de los datasets, formatos locales de teléfono, etc.).
- Riesgo de falsos positivos en cadenas que se parecen a PII (números de pedido, identificadores internos); la validación por checksum del paquete mitiga parte de este problema.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece garantía alguna; el autor recomienda revisión humana en contextos de alto riesgo.
- Modelo con 0 descargas y 0 likes en el momento de la ficha, sin validación independiente de terceros.
- No es un modelo generativo: no puede sustituir texto ni razonar sobre el contexto, solo etiquetar tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChadTollison/pii-distilbert-v3
- Paquete scrubpii en PyPI: https://pypi.org/project/scrubpii/
- Demo en navegador: https://chadtollison.github.io/redact.html
- Benchmarks detallados por tipo: https://github.com/chadtollison/chadtollison.github.io/blob/main/benchmarks/compare.md
- Código de entrenamiento (train_v3.py): https://github.com/chadtollison/chadtollison.github.io/blob/main/training/train_v3.py
- Código de generación de datos (retrain_pii.py): https://github.com/chadtollison/chadtollison.github.io/blob/main/training/retrain_pii.py
- Dataset ai4privacy/open-pii-masking-500k-ai4privacy: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Dataset gretelai/gretel-pii-masking-en-v1: https://huggingface.co/datasets/gretelai/gretel-pii-masking-en-v1
