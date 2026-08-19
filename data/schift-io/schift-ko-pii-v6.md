# schift-io/schift-ko-pii-v6

## Resumen

schift-ko-pii-v6 es un detector de información personal identificable (PII) en coreano, desarrollado por Schift Inc. y publicado en HuggingFace. Está diseñado específicamente para la anonimización de sentencias judiciales, el enmascarado de documentos administrativos y la detección general de PII en texto coreano. El modelo emplea una arquitectura dual-path que separa la detección de personas y direcciones (encoder base) de la detección de organizaciones (adaptadores LoRA), evitando la interferencia entre entidades que degradaba el rendimiento de versiones anteriores.

Con 34 millones de parámetros (34,0M congelados del encoder base y 0,1M entrenables en los adaptadores LoRA y cabezas de clasificación), es un modelo compacto que cabe en cualquier entorno de producción, incluso en CPU. Su pipeline incluye postprocesado por expresiones regulares para detectar números de teléfono, identificadores de residente (equivalente coreano del DNI), números de cuenta, fechas y direcciones de correo. El modelo alcanza un F1 global de 0,858 en el benchmark propio de la organización (473 casos), con resultados superiores en personas (F1 0,892) y direcciones (F1 0,902).

La relevancia de este modelo radica en su especialización en el ámbito jurídico-administrativo coreano, un nicho donde los modelos genéricos de NER fallan por la complejidad de los nombres de organizaciones y la estructura de las direcciones coreanas. El paquete `schift-ko-pii` proporciona una API sencilla con funciones `detect`, `mask` y `apply` para integrarlo en flujos de anonimización con revisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 conv + attention hybrid, 6 capas, hidden 512 |
| Parametros totales | 34.089.487 |
| Parametros activos | 34,0M congelados + 0,1M entrenables (LoRA rank-16 + cabezas) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | coreano (ko) |
| Licencia | schift-2.0 (Apache 2.0 base con umbral de ingresos; gratis para ingresos anuales < 10M USD; investigacion, educacion y non-profit siempre permitidos) |
| Formato de pesos | safetensors float32 (130 MB) |

## Arquitectura y entrenamiento

El modelo usa un encoder híbrido LFM2.5 que combina capas convolucionales con atención, con 6 capas y una dimensión oculta de 512. La arquitectura dual-path es la innovación principal: la detección de personas y direcciones se realiza sobre el encoder base congelado, mientras que la detección de organizaciones utiliza adaptadores LoRA de rango 16 aplicados a las proyecciones de query y value de la atención (4 proyecciones, 123K parámetros). Esto evita la interferencia entre entidades que ocurría en versiones anteriores, donde añadir organizaciones degradaba la precisión de personas y direcciones. Las cabezas de clasificación son per-entity: una lineal (512 → 5) para personas/direcciones y un MLP (512 → 128 → 5) para organizaciones, que lee las características adaptadas por LoRA. La inferencia ejecuta dos pasadas en paralelo: una por el camino base y otra por el camino LoRA.

El entrenamiento se realizó con una mezcla de datos: 89.000 transcripciones de reuniones de la Asamblea (auto-etiquetadas con patrones de hablante), 26.008 muestras del dataset KLUE NER (CC-BY-SA-4.0), 3.000 documentos administrativos del condado de Changnyeong, y 2.152 ejemplos aumentados, de desambiguación y negativos legales. El tokenizer es `klue/roberta-base` con máximo de 512 tokens. No se mencionan técnicas de RLHF o DPO; el entrenamiento es de clasificación de tokens supervisada.

## Capacidades

- Detección de nombres de personas coreanos y extranjeros (ej. 김민수, 남궁혜진, Mike Johnson).
- Detección de direcciones coreanas completas (ej. 서울특별시 강남구 테헤란로 521).
- Detección de organizaciones (empresas, entidades públicas, asociaciones) mediante la ruta LoRA (ej. 주식회사 삼성전자, 사단법인 한국법률구조공단).
- Postprocesado por regex para números de teléfono, identificadores de residente (con checksum), números de cuenta, fechas y correos electrónicos.
- API integrada en el paquete `schift-ko-pii` con funciones `detect` (devuelve spans con etiqueta y confianza), `mask` (sustituye entidades por placeholders como `[사람1]` o `[기관1]`) y `apply` (reemplazo selectivo de placeholders por valores personalizados).
- Compatible con pipelines de Hugging Face Transformers y requiere `trust_remote_code=True`.

## Casos de uso

- Anonimización de sentencias judiciales: el modelo está diseñado para detectar personas, direcciones y organizaciones en textos legales coreanos, donde la precisión en nombres de entidades complejas (ej. `사단법인 한국법률구조공단`) es crítica. La función `mask` permite sustituir automáticamente las entidades por placeholders para su revisión manual.
- Enmascarado de documentos administrativos: los 3.000 documentos del condado de Changnyeong en el entrenamiento lo hacen adecuado para oficios, resoluciones y expedientes municipales. El postprocesado de números de teléfono y fechas cubre los campos típicos de formularios administrativos.
- Desidentificación de transcripciones de reuniones: el entrenamiento con 89.000 transcripciones de la Asamblea le permite reconocer patrones de hablante y nombres propios en diálogo directo, útil para actas y minutas corporativas.
- Cumplimiento de la protección de datos (RGPD coreano, PIPA): el modelo puede integrarse en pipelines de datos para enmascarar PII antes de almacenar o compartir datasets, con la API `apply` para reemplazar entidades por valores sintéticos.
- Detección de PII en texto libre para auditorías de privacidad: el modelo detecta en una sola pasada personas, direcciones, organizaciones, teléfonos, identificadores de residente y correos, permitiendo auditar grandes volúmenes de texto sin entrenamiento adicional.
- Integración en flujos de revisión humana: el resultado de `mask` conserva los spans originales en `result["entities"]`, lo que permite a un revisor aprobar o corregir el enmascarado antes de publicar el documento, un requisito común en el sector legal y administrativo.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el benchmark interno `benchmark_v3` (473 casos). Los valores no han sido verificados de forma independiente.

| Entidad | F1 | Precision | Recall | Casos |
|---|---|---|---|---|
| private_person | 0,892 | no disponible | no disponible | 411 |
| private_organization | 0,695 | no disponible | no disponible | 182 |
| private_address | 0,902 | no disponible | no disponible | 141 |
| private_phone | 1,000 | no disponible | no disponible | 65 |
| **Overall** | **0,858** | **0,845** | **0,872** | 473 |

El autor compara con la versión anterior v5 (solo personas y direcciones, F1 0,823 en benchmark_v2), indicando que v6 añade organizaciones sin degradar el rendimiento de personas/direcciones. No se han publicado resultados en benchmarks estándar como KLUE NER o KoNER.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia con pesos float32 (130 MB de pesos); cuantización no disponible pero el modelo es suficientemente pequeño para ejecutarse en CPU.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM (ej. NVIDIA T4, RTX 3060, incluso Google Colab free tier). Para producción con alta concurrencia, una T4 o A10G es suficiente.
- Ejecución en CPU: viable para inferencia por lotes; el encoder híbrido conv+attention de 6 capas es ligero.
- Opciones de despliegue: compatible con Hugging Face Transformers con `trust_remote_code=True`. Se puede servir con TGI (Text Generation Inference) o vLLM si se envuelve como pipeline de token-classification, aunque el paquete oficial `schift-ko-pii` es la vía más directa. No se menciona soporte para llama.cpp u Ollama.
- Latencia estimada: no disponible en la documentación del autor, pero por el tamaño del modelo (34M) se espera latencia de milisegundos por documento de 512 tokens en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos de detección de PII en coreano. Como referencia, los modelos más próximos en la categoría son:

| Modelo | Params | Contexto | Licencia | Benchmark PII |
|---|---|---|---|---|
| schift-ko-pii-v6 | 34M | 512 | schift-2.0 (uso comercial libre < $10M) | F1 0,858 (benchmark interno) |
| klue/roberta-base NER | ~125M | 512 | MIT | no disponible |
| Modelos coreanos de NER genéricos | variable | variable | variable | no disponible |

No se han encontrado modelos específicos de PII coreano con benchmarks públicos comparables. El modelo de Schift se diferencia por su especialización en entidades jurídico-administrativas y por el postprocesado de PII estructurada (teléfonos, identificadores, cuentas), que los NER genéricos no cubren.

## Limitaciones y advertencias

- Sesgo lingüístico: entrenado exclusivamente en coreano. No detecta PII en otros idiomas, y los nombres extranjeros solo funcionan si aparecen en texto coreano (ej. "Mike Johnson" funciona, pero no en inglés completo).
- Rendimiento de organizaciones notablemente inferior al resto: F1 de 0,695 frente a 0,892 de personas y 0,902 de direcciones. La detección de organizaciones es la entidad más débil y puede fallar en nombres de organizaciones no presentes en los datos de entrenamiento.
- Contexto limitado a 512 tokens: no es adecuado para documentos completos de más de ~350 palabras sin segmentación previa, lo que puede romper la coherencia de entidades que cruzan el límite de segmento.
- Alucinación en etiquetas: como modelo de clasificación de tokens, puede etiquetar erróneamente nombres comunes como personas o direcciones parciales como direcciones completas en textos ambiguos.
- Licencia schift-2.0: uso comercial libre solo para ingresos anuales inferiores a 10M USD. Superado ese umbral, se requiere licencia comercial de Schift Inc. La investigación, educación y non-profit siempre están permitidas.
- El benchmark es interno y no verificado de forma independiente; los resultados pueden no generalizarse a otros dominios o estilos de texto coreano.
- El modelo requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del autor; debe revisarse antes de usar en entornos de producción con requisitos de seguridad estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schift-io/schift-ko-pii-v6
- Organización en Hugging Face: https://huggingface.co/schift-io/models
- Paquete PyPI: https://pypi.org/project/schift/
- Repositorio GitHub de Schift: https://github.com/schift-io
- Documentación de Schift: https://schift.io/docs/
