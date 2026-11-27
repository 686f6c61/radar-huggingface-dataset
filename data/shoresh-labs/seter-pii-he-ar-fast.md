# shoresh-labs/seter-pii-he-ar-fast

## Resumen

Seter PII Fast es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en hebreo, árabe e inglés, incluyendo texto con mezcla de idiomas. Lo desarrolla Shoresh Labs y se distribuye con licencia MIT. Resuelve un problema concreto: la mayoría de los detectores de PII gratuitos funcionan bien en inglés pero fallan con nombres hebreos y árabes, especialmente nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos como עו"ד o د., y kunyas árabes (أبو …).

El modelo está construido sobre `jhu-clsp/mmBERT-base` y cuenta con 307.538.699 parámetros totales. Se ofrece en dos variantes dentro de la familia Seter: esta versión "fast" orientada a CPU y navegador, y una versión "large" (seter-pii-he-ar v1.2, basada en xlm-r-large) para GPU y servidor con mayor precisión. La versión fast está diseñada para ejecutarse localmente, incluso en el navegador mediante ONNX y transformers.js, sin enviar el texto del usuario fuera del dispositivo.

La relevancia actual del modelo radica en su enfoque en privacidad por diseño: inferencia local, licencia permisiva y cobertura de idiomas históricamente desatendidos por las herramientas de redacción. Detecta cinco tipos de entidad: `private_person`, `private_address`, `private_phone`, `private_email` y `account_number`. La versión documentada es la v1.1.2 (25 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base `jhu-clsp/mmBERT-base`) |
| Parametros totales | 307.538.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~8k tokens |
| Tipos de cuantizacion | int8 (ONNX cuantizado, 369 MB); pesos fp32 en safetensors |
| Idiomas soportados | he (hebreo), ar (árabe), en (inglés), incluido texto mixto |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (incluye `onnx/model_quantized.onnx` int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, inicializado desde `jhu-clsp/mmBERT-base`, adaptado a la tarea de token classification (NER de PII) mediante una cabeza de clasificación sobre las cinco etiquetas definidas. La longitud de contexto es de aproximadamente 8k tokens, lo que permite procesar documentos completos o registros largos en una sola pasada. Se distribuye en fp32 (safetensors) y en una versión int8 ONNX optimizada para CPU y navegador.

Los detalles sobre el volumen exacto de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada. La model card menciona que la evaluación se realizó sobre un conjunto independiente del generador de datos de entrenamiento y de REDACT, y que existe una política de etiquetado propia del autor. Se han publicado tres semillas de entrenamiento para reportar la variabilidad de los resultados. No se especifica en la información disponible si se empleó RLHF, DPO u otras técnicas de alineación, algo poco habitual en un modelo de token classification. El decodificador publicado, `seter_entities.py`, incluye una limpieza específica de números de cuenta y un preset opcional `strict-ids` que enmascara únicamente identidades y números financieros.

## Capacidades

- Detección de PII en hebreo, árabe e inglés, incluyendo texto con mezcla de idiomas en el mismo documento.
- Reconocimiento de nombres de persona, incluyendo nombres de pila aislados, nombres con prefijos adjuntos (ל/ו/ש), títulos (עו"ד, د.) y kunyas árabes (أبو …).
- Detección de direcciones, teléfonos, correos electrónicos y números de cuenta.
- Detección de números de tarjeta de pago, incluyendo formas "ending in 1234" y enmascaradas (98% / 94% / 97% en hebreo / árabe / inglés en la versión v1.1).
- Inferencia local en CPU y en navegador (ONNX + transformers.js), sin envío de datos a servidores externos.
- Integración con la herramienta `seter-guard` para despliegue en producción.
- Decodificador con limpieza de números de cuenta y selección de entidades mediante el preset `strict-ids`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; es un modelo exclusivamente de etiquetado de tokens.

## Casos de uso

- Redacción de PII en atención al cliente: el modelo puede procesar conversaciones multi-turno y tickets de soporte en hebreo, árabe e inglés, enmascarando nombres, teléfonos y correos antes de almacenar o enviar los registros a sistemas externos, gracias a su ventana de ~8k tokens.
- Cumplimiento del RGPD y de la ley israelí de privacidad (Amendment 13): integrado en pipelines de preprocesamiento para anonimizar datos personales en logs, formularios y correos antes de su tratamiento o archivo.
- Ejecución en el navegador para herramientas de privacidad: mediante la demo en Hugging Face Spaces y transformers.js, permite redactar texto directamente en la página sin que el contenido salga del dispositivo del usuario.
- Procesamiento de notas médicas y de RR. HH.: detección de nombres de pacientes y empleados, direcciones y números de cuenta en documentos internos, ejecutándose en CPU de portátil con 603 MB de RAM y 369 MB de disco en la versión int8.
- Anonimización de registros legales y cartas: tratamiento de documentos de 672 a 1.819 caracteres con alta cobertura de entidades (0,956 de entidades completamente cubiertas en la evaluación held-out de la v1.1).
- Filtrado previo en pipelines de datos para entrenamiento de modelos: eliminación de PII de corpus multilingües antes de su uso en entrenamiento o evaluación, con despliegue en CPU sin GPU dedicada.
- Integración en herramientas de desarrollo mediante `seter-guard`: despliegue detrás de una API local para redactar texto en aplicaciones de escritorio o servicios internos con licencia MIT.

## Benchmarks y rendimiento

Evaluación sobre 150 documentos held-out (50 hebreo, 50 árabe, 50 inglés; 2.480 spans etiquetados; 672-1.819 caracteres cada uno):

| Metrica | fast v1.0 | fast v1.1 (pesos publicados) | fast v1.1, media de 3 semillas | fast v1.1 con decodificador publicado | large v1.2 |
|---|---|---|---|---|---|
| Character F1 | 0,870 | 0,947 | 0,942 | 0,953 | 0,968 |
| Character precision | 0,799 | 0,916 | 0,907 | 0,929 | 0,962 |
| Character recall | 0,955 | 0,980 | 0,980 | 0,979 | 0,975 |
| Entidades completamente cubiertas | 0,885 | 0,956 | 0,954 | 0,954 | 0,961 |
| Spans predichos sin entidad etiquetada | 984 | 317 | 350 | 259 | 117 |
| F1 hebreo / árabe / inglés | 0,833 / 0,886 / 0,889 | 0,943 / 0,945 / 0,953 | 0,929 / 0,944 / 0,952 | 0,947 / 0,951 / 0,962 | 0,969 / 0,973 / 0,963 |

Benchmark independiente REDACT (evaluación únicamente, nunca usado en entrenamiento):

| Idioma | openai/privacy-filter F1 | fast v1.0 F1 | fast v1.1 F1 (media de 3 semillas, pesos publicados) | large v1.2 (xlm-r-large) F1 |
|---|---|---|---|---|
| Hebreo (621 registros) | 0,642 | 0,850 | 0,905 (0,908) | 0,915 |
| Árabe (568) | 0,735 | 0,893 | 0,913 (0,914) | 0,922 |
| Inglés (534) | 0,709 | 0,841 | 0,885 (0,886) | 0,890 |

Otras métricas reportadas: recall de nombres de pila aislados @50% de hebreo 0,886, árabe 0,940, inglés 0,990; conjunto de 50 frases (F1 de caracteres laxo, fp32) 0,991; el archivo int8 v1.1.2 con decodificador publicado alcanza F1 0,954 (precisión 0,931, recall 0,979). En CPU de portátil con 4 hilos, la versión int8 ONNX v1.1.2 procesa frases cortas en 18 ms y registros de ~1.500 caracteres en 275 ms, con 603 MB de RAM.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante int8 ONNX, que está diseñada para CPU; requiere 603 MB de RAM en CPU con 4 hilos.
- Disco: 369 MB para el archivo int8 ONNX; el repositorio completo ocupa 7,5 GB.
- GPU: no se documentan requisitos de GPU para esta variante; está orientada explícitamente a CPU y navegador.
- Cabe en cualquier portátil convencional y en el navegador mediante transformers.js; no requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime (CPU), transformers.js (navegador), transformers (Python), integración con `seter-guard`.
- Latencia: 18 ms para frases cortas y 275 ms para registros de ~1.500 caracteres en CPU de portátil con 4 hilos (int8 ONNX v1.1.2). No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 REDACT hebreo / árabe / inglés | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seter-pii-he-ar-fast v1.1 | 307,5 M | ~8k | 0,905 / 0,913 / 0,885 | MIT | Hugging Face, ONNX, navegador |
| seter-pii-he-ar v1.2 (large) | no disponible (xlm-r-large) | no disponible | 0,915 / 0,922 / 0,890 | MIT | Hugging Face |
| openai/privacy-filter | no disponible | no disponible | 0,642 / 0,735 / 0,709 | no disponible | no disponible |

La comparativa se limita a los modelos incluidos en la información proporcionada. La variante fast ofrece un equilibrio entre precisión y despliegue en CPU, mientras que la variante large obtiene mejores cifras a costa de mayores requisitos de cómputo. Frente a openai/privacy-filter, la mejora en F1 es de aproximadamente 0,26 en hebreo, 0,18 en árabe y 0,18 en inglés.

## Limitaciones y advertencias

- El conjunto de evaluación held-out es pequeño (150 documentos) y fue escrito y etiquetado por un modelo de IA a partir de una política escrita, revisado por un segundo revisor de IA, no por personas; la política la escribió el mismo autor que las clases de entrenamiento, lo que favorece a esas clases.
- El modelo fast etiqueta aproximadamente 2,7 veces más spans espurios que el modelo large; la precisión en hebreo es su punto más débil (0,906 con los pesos publicados, 0,884 de media entre semillas).
- REDACT deja sin etiquetar gran parte de los datos personales (en una auditoría de 300 predicciones del large v1.1 sin etiqueta REDACT, entre el 59% y el 66% eran datos personales), por lo que la precisión y el F1 de REDACT subestiman a todos los sistemas de la tabla.
- Riesgo de falsos negativos y positivos en dominios no representados en el entrenamiento; no se documentan sesgos específicos más allá de las diferencias de precisión por idioma.
- Cobertura limitada a cinco etiquetas: no detecta fechas, ciudades, datos médicos ni otras categorías de PII presentes en REDACT, que se ignoran en la evaluación.
- No se documentan capacidades de generación, razonamiento ni tool calling; su uso está restringido a token classification.
- La licencia MIT permite uso comercial, pero se recomienda fijar la revisión en producción (`revision="v1.1.2"`), ya que las versiones anteriores permanecen disponibles como revisiones y los resultados varían entre versiones.
- No se han publicado resultados de benchmarks más allá de los recogidos en la model card y en REDACT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoresh-labs/seter-pii-he-ar-fast
- Modelo large (seter-pii-he-ar v1.2): https://huggingface.co/shoresh-labs/seter-pii-he-ar
- Demo en navegador: https://huggingface.co/spaces/yinonov/seter-demo
- Repositorio seter-guard: https://github.com/Shoresh-Labs/seter-guard
- Paper REDACT: https://arxiv.org/abs/2606.19881
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Organización Shoresh Labs: https://huggingface.co/shoresh-labs
