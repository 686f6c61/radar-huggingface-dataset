# amyrmahdy/decima-pii

## Resumen

decima-pii v0.2 (preview) es un modelo de clasificación de tokens (token classification) especializado en detección y redacción de información personal identificable (PII) en texto multilingüe. Lo desarrolla el autor independiente amyrmahdy y se construye mediante fine-tuning sobre el modelo base jhu-clsp/mmBERT-small, una arquitectura ModernBERT de 140,6 millones de parámetros. Resuelve un problema concreto: las herramientas habituales de redacción (Presidio, filtros de privacidad de proveedores) rinden de forma notablemente inferior en árabe, persa, urdu y turco que en inglés, especialmente con dígitos árabe-índicos y persas.

El modelo detecta nombres, teléfonos, correos electrónicos, documentos nacionales de identidad, IBAN, números de tarjeta, pasaportes, direcciones, fechas de nacimiento y direcciones IP en árabe, persa, urdu, turco e inglés, además de variantes romanizadas como finglish y arabizi. Su propuesta diferencial es la eficiencia: unos 13 ms por mensaje con 6 hilos en CPU, 148 MB en cuantización int8 y ejecución completamente local, sin que el texto escaneado abandone la máquina.

Es relevante ahora porque la mayoría de soluciones de PII asumen inglés o dependen de servicios en la nube, mientras que este modelo cubre idiomas y sistemas de numeración habitualmente postergados, con licencia Apache-2.0 y formatos ONNX y safetensors listos para despliegue en navegador o entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning sobre jhu-clsp/mmBERT-small |
| Parametros totales | 140.649.621 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (148 MB); pesos safetensors y ONNX |
| Idiomas soportados | ar, fa, ur, tr, en, multilingual (incluye variantes finglish y arabizi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, concretamente un fine-tuning de jhu-clsp/mmBERT-small para la tarea de token classification (etiquetado BIO de entidades PII). No es un modelo generativo ni un MoE: es un clasificador secuencial que asigna una etiqueta a cada token, lo que explica su baja latencia y su idoneidad para ejecución en CPU y en navegador mediante ONNX.

Los detalles exactos del dataset de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card sí documenta una metodología de evaluación inusualmente rigurosa: el autor separa conjuntos de test que el modelo no ha visto (MultiGraSCCo, Sitr, arabic-pii-eval, persian-pii-masking-openpii, turkish-privacy-pii-ner, REDACT) y reconoce explícitamente cuándo un conjunto ya se había inspeccionado durante el desarrollo, matizando la interpretación de las métricas. También documenta que la versión 0.2 se entrenó con tres semillas y una regla de selección predefinida antes de ejecutar la evaluación final sobre Sitr.

## Capacidades

- Detección de entidades PII: nombres, teléfonos, correos electrónicos, documentos nacionales de identidad, IBAN, números de tarjeta, pasaportes, direcciones, fechas de nacimiento y direcciones IP.
- Reconocimiento de dígitos árabe-índicos (٠٥٥…) y persas (۰۹۱۲…), un punto donde las alternativas fallan con frecuencia.
- Cobertura multilingüe en árabe, persa, urdu, turco e inglés, con soporte de texto romanizado (finglish, arabizi).
- Redacción y enmascaramiento de datos personales en pipelines de texto.
- Ejecución local y offline, sin envío de datos a servicios externos.
- Inferencia en CPU con latencia baja (unos 13 ms por mensaje con 6 hilos).
- No soporta tool calling, function calling, agentes ni generación de texto: es exclusivamente un clasificador de tokens.

## Casos de uso

- Redacción de historiales clínicos: el modelo detecta nombres, teléfonos y fechas de nacimiento en cartas clínicas multilingües, como demuestra su evaluación sobre MultiGraSCCo, lo que permite anonimizar documentación médica antes de compartirla con investigadores.
- Cumplimiento de protección de datos en atención al cliente: se puede integrar como paso previo al envío de transcripciones de chat a sistemas externos, enmascarando identificadores en árabe, persa o turco que las herramientas basadas en inglés no detectan.
- Procesamiento local en navegador: gracias a los pesos ONNX int8 (148 MB), puede ejecutarse en el cliente para redactar formularios o mensajes antes de que salgan del dispositivo, un caso de uso de privacidad por diseño.
- Anonimización de datasets para investigación: filtrado de corpus árabes o persas antes de su publicación, con detección de documentos nacionales de identidad y números de tarjeta que las reglas basadas en formato no cubren.
- Preprocesado en pipelines de datos para entrenamiento de modelos: eliminación de PII de corpus multilingües antes de usarlos en fine-tuning, reduciendo riesgo legal y de memorización.
- Enmascaramiento en registros de logs y sistemas de observabilidad: redacción en tiempo real de correos, IP y teléfonos en logs de aplicaciones que operan en mercados de Oriente Medio y Asia Central.
- Detección de PII en comunicaciones financieras: identificación de IBAN y números de tarjeta en mensajes de soporte o correos, con soporte de dígitos no latinos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre conjuntos externos. La puntuación de decima-pii es zero-shot (sin entrenamiento sobre esos conjuntos); la columna "in-domain" corresponde al mejor sistema entrenado específicamente sobre cada conjunto.

| Conjunto | Idioma | decima-pii v0.2 | decima-pii v0.1 | Mejor in-domain |
|---|---|---:|---:|---|
| MultiGraSCCo (relaxed typed F1, lenient) | todos | 0.910 | 0.870 | no disponible |
| MultiGraSCCo | en | 0.957 | 0.957 | no disponible |
| MultiGraSCCo | ar | 0.913 | 0.843 | no disponible |
| MultiGraSCCo | fa | 0.849 | 0.805 | no disponible |
| MultiGraSCCo | tr | 0.928 | 0.889 | no disponible |
| MultiGraSCCo (recall) | todos | 0.98 | 0.96 | no disponible |
| Sitr (relaxed typed F1, lenient) | ar | 0.875 | 0.856 | no disponible |
| Sitr (exact span and type) | ar | 0.767 | 0.763 | no disponible |
| arabic-pii-eval (exact typed F1) | ar | 0.980 | 0.953 | 0.98–1.00 (reglas), 0.874 (nombres) |
| persian-pii-masking-openpii (relaxed typed F1) | fa | 0.875 | 0.881 | 0.974 |
| turkish-privacy-pii-ner (relaxed typed F1) | tr | 0.900 | 0.886 | 0.998 |
| REDACT (partial micro-F1) | ar / tr / en | 0.53 / 0.51 / 0.50 | 0.51 / no disponible | no disponible |

Comparativa con herramientas alternativas sobre MultiGraSCCo (relaxed typed F1, lenient):

| Sistema | Todos | en | ar | fa | tr | Recall |
|---|---:|---:|---:|---:|---:|---:|
| decima-pii v0.2 | 0.910 | 0.957 | 0.913 | 0.849 | 0.928 | 0.98 |
| openai/privacy-filter | 0.647 | 0.901 | 0.581 | 0.508 | 0.626 | 0.66 |
| Presidio (defaults en inglés) | 0.117 | 0.357 | 0.048 | 0.060 | 0.110 | 0.47 |

En Sitr, de 380 mensajes sin datos personales, 4 fueron marcados erróneamente (frente a 9 en v0.1).

## Requisitos de hardware

- VRAM estimada: no requiere GPU; con 148 MB en int8 cabe en CPU y en memoria de navegador.
- GPU recomendadas: no necesarias. Cualquier GPU consumer (RTX 4090, RTX 3060) acelera la inferencia, pero el diseño apunta a CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU; también en dispositivos móviles vía ONNX.
- Opciones de despliegue: transformers (PyTorch/safetensors), ONNX Runtime (incluido navegador), pipeline token-classification de HuggingFace. Compatible con endpoints de HuggingFace.
- Latencia: unos 13 ms por mensaje con 6 hilos en CPU. Throughput no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Enfoque | Licencia |
|---|---|---|---|---|
| decima-pii v0.2 | 140,6 M | ar, fa, ur, tr, en | Token classification PII, local-first | Apache-2.0 |
| openai/privacy-filter | no disponible | multilingüe | Filtro de privacidad | no disponible |
| Presidio (Microsoft) | basado en reglas + NER | principalmente en | Redacción de PII | MIT |
| Modelos in-domain por conjunto (Sayar mBERT, Toktay, Bayanat Labs) | variable | fa, tr, ar | NER PII especializado | variable |

decima-pii destaca por cubrir varios idiomas con un único modelo pequeño y ejecutable en local; los sistemas in-domain superan su F1 en sus propios conjuntos, pero no son multilingües ni tan ligeros.

## Limitaciones y advertencias

- Es una versión preview (v0.2); el autor advierte de que algunas métricas empeoraron respecto a v0.1 (direcciones 0.607 → 0.576, pasaportes 0.956 → 0.932 en Sitr).
- Las evaluaciones sobre MultiGraSCCo y otros conjuntos se hicieron "después de varias miradas": el propio autor matiza que 0.910 no equivale a una medición totalmente ciega.
- En conjuntos con sistemas entrenados in-domain, decima-pii queda por debajo (por ejemplo, 0.875 frente a 0.974 en persa, 0.900 frente a 0.998 en turco).
- En REDACT, con 51 tipos de entidad de los que 41 no cubre, el F1 parcial baja a 0.50–0.53.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí de falsos positivos (4 de 380 mensajes limpios marcados en Sitr).
- Longitud de contexto no disponible; textos muy largos requerirán troceado.
- Licencia Apache-2.0 permite uso comercial, pero al ser preview conviene validar sobre datos propios antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amyrmahdy/decima-pii
- Playground en navegador: https://amyrmahdy-decima-playground.static.hf.space/pii.html
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- MultiGraSCCo: https://zenodo.org/records/18847836
- Sitr (dataset): https://huggingface.co/datasets/mabahboh/sitr-arabic-pii
- Bayanat Labs arabic-pii-eval: https://huggingface.co/datasets/Bayanat-Labs/arabic-pii-eval
- Reza Sayar persian-pii-masking-openpii: https://huggingface.co/datasets/Reza2kn/persian-pii-masking-openpii-690k-clean
- Boran Toktay turkish-privacy-pii-ner: https://huggingface.co/datasets/BTX24/turkish-privacy-pii-ner
- REDACT benchmark: https://github.com/guneeshvats/REDACT-PII-Benchmark
