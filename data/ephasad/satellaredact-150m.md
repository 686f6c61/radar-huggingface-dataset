# EphAsad/SatellaRedact-150M

## Resumen

SatellaRedact-150M es un modelo de detección de información personal (PII) para inglés, construido mediante fine-tuning de ModernBERT-base como clasificador de tokens con etiquetado BIO. Lo desarrolla el usuario EphAsad y se publica como release experimental de investigación bajo licencia Apache 2.0. Resuelve un problema acotado pero crítico en pipelines de datos: identificar y localizar entidades sensibles (nombres, correos, documentos de identidad, direcciones, tarjetas, etc.) en texto plano antes de almacenarlo, enviarlo a un LLM de terceros o publicarlo.

La arquitectura es un encoder bidireccional de aproximadamente 149,6 millones de parámetros, con una cabeza de token classification que emite 39 etiquetas BIO correspondientes a 19 tipos de entidad. Al ser un encoder compacto en lugar de un modelo generativo, el coste de inferencia es muy bajo y puede ejecutarse en CPU, lo que lo hace adecuado para preprocesado masivo o para despliegue en el borde.

Su relevancia actual reside en la combinación de tamaño reducido, licencia permisiva y un rendimiento declarado alto en validación (F1 de 95,39% a nivel de token sobre 2.500 ejemplos ingleses). No obstante, el propio autor lo etiqueta como experimental y advierte de que no es una solución certificada de anonimización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder bidireccional) con cabeza de token classification |
| Parámetros totales | 149.634.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de ModernBERT-base; el autor no la declara) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER / detección de PII) |
| Etiquetas de salida | 39 etiquetas BIO (19 tipos de entidad + O) |
| Tipos de entidad | AGE, BUILDINGNUM, CITY, CREDITCARDNUMBER, DATE, DRIVERLICENSENUM, EMAIL, GENDER, GIVENNAME, IDCARDNUM, PASSPORTNUM, SEX, SOCIALNUM, STREET, SURNAME, TAXNUM, TELEPHONENUM, TITLE, ZIPCODE |
| Modelo base | answerdotai/ModernBERT-base |
| Dataset de entrenamiento | ai4privacy/pii-masking-openpii-1m (más datos sintéticos propios) |
| Tamaño del repositorio | 0,6 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder bidireccional de Answer.AI diseñado para representación y clasificación eficiente de texto, y le añade una cabeza de clasificación de tokens entrenada para identificar spans de PII con esquema BIO. La salida son etiquetas por token que deben agregarse posteriormente en spans (por ejemplo, con `aggregation_strategy="simple"` en el pipeline de Transformers o con post-procesado propio).

El entrenamiento se realizó en dos etapas. La v1.3 se obtuvo por fine-tuning desde ModernBERT-base sobre 40.000 ejemplos de entrenamiento y 4.000 de validación en inglés procedentes de OpenPII, durante 3 épocas. La v1.4 continuó el fine-tuning desde el checkpoint de v1.3 (no desde el modelo base) con una mezcla de 26.000 ejemplos originales de OpenPII, 12.000 ejemplos sintéticos variados y 3.000 hard-negatives sintéticos, totalizando 41.000 ejemplos. La configuración fue de 2 épocas, learning rate 1e-5, microbatch 4, acumulación de gradiente 4 (batch efectivo 16), sobre una NVIDIA L4 con unos 22 GiB de VRAM, con un tiempo de entrenamiento mostrado de 28 minutos y 45 segundos. La aumentación sintética se orientó a formatos variados de identificadores, PII contextual y negativos para reducir enmascaramiento innecesario. No se documenta uso de RLHF ni DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Detección de entidades PII a nivel de token en texto en inglés, con 19 categorías cubiertas.
- Salida en formato BIO (39 etiquetas), convertible a spans para redacción, anotación o análisis documental.
- Reconocimiento de identificadores estructurados: correo electrónico, tarjeta de crédito, número de pasaporte, documento de identidad, permiso de conducir, número fiscal, número de la seguridad social, teléfono y código postal.
- Reconocimiento de entidades personales: nombre de pila, apellido, título, edad, sexo, género.
- Reconocimiento de localización: ciudad, calle, número de edificio, código postal.
- Reconocimiento de fechas.
- Inferencia en CPU o GPU, con un coste computacional bajo por su tamaño de encoder.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta razonamiento multi-paso ni modo thinking.
- No tiene capacidades multimodales (visión o audio).
- Capacidad monolingüe: solo inglés.

## Casos de uso

- Redacción previa a registro de logs: insertar el modelo como paso de preprocesado en pipelines de logging para enmascarar correos, teléfonos y nombres antes de persistir trazas, aprovechando su bajo coste y su ejecución en CPU.
- Saneamiento de datasets antes de compartirlos o publicarlos: pasar documentos por el clasificador, agregar los spans BIO y sustituir las entidades detectadas por placeholders, reduciendo el riesgo de filtrar datos personales en releases de datos.
- Preprocesado antes de enviar texto a LLM de terceros: filtrar o redactar PII en prompts de usuario antes de que salgan hacia APIs externas, como capa de cumplimiento en aplicaciones de asistencia.
- Anotación asistida para equipos de etiquetado: usar las predicciones como preanotación de entidades en herramientas de revisión humana, acelerando la creación de corpus anotados con revisión posterior.
- Análisis documental y triaje: clasificar documentos según la densidad y el tipo de PII detectada para enrutarlos a flujos con distintos niveles de control de acceso.
- Cumplimiento y auditoría interna: ejecutar barridos sobre repositorios de texto para localizar posibles exposiciones de identificadores sensibles y priorizar revisiones manuales.
- Procesamiento por lotes en entornos con recursos limitados: al ser un encoder de ~150M y ejecutable en CPU, permite procesar grandes volúmenes en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

Validación a nivel de token sobre 2.500 ejemplos ingleses:

| Métrica | Valor |
|---|---:|
| Precisión | 94,83% |
| Recall | 95,96% |
| F1 | 95,39% |
| Pérdida de validación | 0,02764 |

Recall por categoría seleccionada:

| Categoría | Recall |
|---|---:|
| Nombre de pila (GIVENNAME) | 89,08% |
| Apellido (SURNAME) | 87,01% |
| Correo electrónico (EMAIL) | 100,00% |
| Número fiscal (TAXNUM) | 95,92% |
| Documento de identidad (IDCARDNUM) | 90,13% |
| Pasaporte (PASSPORTNUM) | 99,23% |
| Permiso de conducir (DRIVERLICENSENUM) | 88,20% |
| Fecha (DATE) | 99,96% |

Reto sintético de texto completo (670 documentos, 570 entidades anotadas), comparando v1.3 y v1.4:

| Métrica | v1.3 | v1.4 |
|---|---:|---:|
| Cobertura completa de entidades | 90,00% | 97,37% |
| Recall de caracteres sensibles | 95,65% | 98,96% |
| Precisión de caracteres redactados | 60,90% | 94,43% |
| Tasa de falsos positivos en caracteres no PII | 4,96% | 0,47% |

En un subconjunto separado de 200 documentos de validación de OpenPII, la evaluación de texto completo reportó 1.701 de 1.708 entidades completamente cubiertas. El autor aclara que las métricas de texto completo se obtuvieron con su flujo propio de inferencia y post-procesado, incluyendo detección basada en patrones, por lo que el pipeline estándar de Transformers puede arrojar resultados distintos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 0,3-0,4 GB solo para pesos, más activaciones; cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en FP32: aproximadamente 0,6 GB para pesos.
- Ejecución en CPU viable: el autor indica explícitamente inferencia en CPU o GPU; el entrenamiento se realizó en una NVIDIA L4 con unos 22 GiB disponibles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; NVIDIA L4, T4, RTX 3060/4060 o superiores funcionan sin problema. Para lotes grandes, A100 o H100 aportan throughput, no necesidad de memoria.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: pipeline de Hugging Face Transformers, exportación a ONNX Runtime, TorchScript o integración en servicios propios. No se documenta soporte específico para vLLM o TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento reportado (28 min 45 s para 41.001 ventanas, 2 épocas, en L4) da una idea del orden de magnitud del coste computacional, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SatellaRedact-150M | ~149,6M | no disponible | Token classification (PII, 19 tipos) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | ~149M | no disponible en esta ficha | Encoder base, sin cabeza de PII | Apache 2.0 | Hugging Face |
| Modelos NER genéricos tipo BERT-base | ~110M | típicamente 512 tokens | NER general (PER, LOC, ORG, MISC) | variable según checkpoint | Hugging Face |

La comparación directa con alternativas específicas de detección de PII no está disponible en la información proporcionada. Frente a ModernBERT-base, SatellaRedact añade la cabeza de clasificación entrenada para PII; frente a modelos NER genéricos, cubre categorías específicas de privacidad (tarjetas, pasaportes, números fiscales) que los esquemas NER estándar no contemplan.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es una solución certificada de anonimización y que puede omitir entidades sensibles o redactar texto no relacionado; se requiere verificación humana en aplicaciones críticas de privacidad.
- Modelo experimental: la puerta de release estricta del desarrollo no se cumplió plenamente (cobertura completa 97,37% frente al objetivo del 98%; recall de caracteres 98,96% frente al 99%; al menos una categoría por debajo del 90% de cobertura completa).
- Solo inglés: no cubre otros idiomas, lo que limita su uso en entornos multilingües.
- Las métricas de texto completo dependen de un flujo propio de inferencia y post-procesado con detección por patrones; el pipeline estándar de Transformers no reproduce esos resultados.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos: la tasa de falsos positivos en caracteres no PII bajó al 0,47% en el reto sintético, pero el propio autor advierte de que puede redactar texto no sensible.
- Las categorías con menor recall (apellido 87,01%, permiso de conducir 88,20%, nombre de pila 89,08%) son las más propensas a escapes en producción.
- La evaluación se realizó sobre datos sintéticos y de validación de OpenPII; no hay certificación de privacidad en el mundo real ni afirmaciones de rendimiento en dominios externos.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo de privacidad recae en el integrador.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EphAsad/SatellaRedact-150M
- Perfil del autor: https://huggingface.co/EphAsad
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset OpenPII: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1m
