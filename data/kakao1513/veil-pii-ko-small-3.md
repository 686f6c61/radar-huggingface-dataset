# kakao1513/veil-pii-ko-small-3

## Resumen

veil-pii-ko-small-3 es un modelo de clasificación de tokens (token classification) especializado en la detección de información personal identificable (PII) en texto coreano. Lo desarrolla el usuario kakao1513 y deriva por destilación de conocimiento del modelo profesor 1T/veil-pii-ko-lite, tomando como arquitectura base monologg/koelectra-small-v3-discriminator. Su función concreta es localizar tres tipos de entidades: nombres de persona (PERSON), direcciones (ADDRESS) y nombres de organizaciones (ORGANIZATION), devolviendo los desplazamientos de carácter exactos sobre el texto original.

El modelo está pensado para ejecución en CPU: con 7,7 millones de parámetros y un archivo ONNX FP32 de 31 MB, está diseñado para integrarse en pipelines de anonimización o filtrado de datos sensibles donde no hay GPU disponible. Procesa documentos de longitud ilimitada mediante ventanas deslizantes de 128 tokens con solapamiento de 16, y emplea decodificación Viterbi restringida sobre un esquema BIOES de 13 etiquetas.

Su relevancia práctica reside en la combinación de bajo coste computacional y una precisión razonable en coreano: alcanza un F1 de 0,862 en el conjunto de test KDPII y 0,929 en el conjunto sintético heldout de Veil, con licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo ELECTRA (ElectraForTokenClassification), 8 capas, hidden 256, FFN 256, 4 cabezas de atención |
| Parámetros totales | 7.748.621 (7,7 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 128 tokens con solapamiento de 16; longitud de documento ilimitada por fragmentación |
| Tipos de cuantización | FP32 (ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`model.fp32.onnx`, 31 MB) |

## Arquitectura y entrenamiento

El modelo es un ELECTRA small adaptado a clasificación de tokens: 8 capas de transformer con dimensión oculta 256, FFN de 256 y 4 cabezas de atención, sobre el checkpoint monologg/koelectra-small-v3-discriminator. La cabeza de clasificación emite 13 etiquetas en esquema BIOES (B-, I-, E-, S- para PERSON, ADDRESS y ORGANIZATION, más O), y la reconstrucción de spans se realiza con decodificación Viterbi restringida, lo que evita secuencias de etiquetas inválidas. El procesamiento de documentos largos se hace por ventanas de 128 tokens con 16 de solapamiento, sin límite de longitud de documento.

El entrenamiento combina destilación de conocimiento desde 1T/veil-pii-ko-lite con supervisión directa: entropía cruzada sobre etiquetas gold, divergencia KL con el profesor a temperatura T=2 (agregando las probabilidades de las etiquetas fuera de las tres clases objetivo en la clase O) y error cuadrático medio sobre los estados ocultos. Las etiquetas gold provienen de KDPII train, BCCard/privacy-filter-openpii-masking, 1T/veil-pii-ko-synth y aumentación por sustitución de entidades sobre KDPII. Las etiquetas del profesor se generaron sobre aproximadamente 300.000 segmentos de e9t/nsmc, daekeun-ml/naver-news-summarization-ko, heegyu/korean-petitions y jojo0217/korean_safe_conversation. La selección del checkpoint final se hizo por máximo micro-F1 sobre las tres clases en el conjunto de validación KDPII.

## Capacidades

- Detección de entidades PII en coreano: nombres de persona (PERSON), direcciones (ADDRESS) y nombres de organización (ORGANIZATION).
- Salida con offsets de carácter exactos (`start`, `end`) y puntuación de confianza (`score`) por span, lo que permite sustituir o enmascarar el texto original sin recálculo.
- Procesamiento de documentos de longitud arbitraria mediante fragmentación en ventanas de 128 tokens con solapamiento.
- Decodificación Viterbi restringida que garantiza spans bien formados según el esquema BIOES.
- Inferencia en CPU con ONNX Runtime, con control del número de hilos y del tamaño de lote.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un etiquetador de tokens.
- No cubre otras categorías de PII (teléfonos, correos, identificadores, tarjetas) como etiquetas propias; el modelo card menciona pruebas con documentos que contienen identificadores y teléfonos, pero las etiquetas entrenadas son solo las tres indicadas.

## Casos de uso

- Anonimización de registros de atención al cliente: el modelo localiza nombres y organizaciones en transcripciones o tickets y permite sustituirlos por marcadores antes de almacenar o compartir los datos, con offsets exactos que evitan errores de reemplazo por coincidencia de cadenas.
- Redacción de documentos legales y administrativos coreanos: direcciones y nombres de personas físicas y jurídicas se detectan en contratos o expedientes de longitud arbitraria gracias a la fragmentación por ventanas, sin límite de tamaño de documento.
- Preprocesado de corpus para entrenamiento de modelos: filtrado o enmascarado de PII en datasets coreanos (noticias, peticiones ciudadanas, conversaciones) antes de su publicación o uso en fine-tuning.
- Cumplimiento normativo en pipelines de datos: integración como etapa de un ETL que marca o elimina PII conforme a requisitos de protección de datos, ejecutable en servidores sin GPU por su bajo coste (31 MB en FP32).
- Moderación y publicación de contenido generado por usuarios: detección de nombres y organizaciones en foros o comentarios antes de mostrarlos públicamente, con latencia de milisegundos a segundos según el volumen.
- Enmascarado en herramientas de escritorio o edge: al caber holgadamente en CPU y en memoria reducida, puede embeberse en aplicaciones locales de procesamiento de texto coreano sin depender de servicios en la nube.
- Evaluación comparativa de destilación: servir como referencia ligera frente al profesor 1T/veil-pii-ko-lite en experimentos de compresión de modelos NER.

## Benchmarks y rendimiento

Evaluación con coincidencia exacta de span (inicio, fin y etiqueta), micro Precision/Recall/F1, sobre KDPII test (4.891 frases, 949 entidades gold) y sobre el conjunto sintético heldout de Veil (670 frases, 495 entidades). Hardware: AMD Ryzen 5 5600X (AVX2), WSL2 Ubuntu 22.04, 8 hilos de CPU, ONNX Runtime FP32, lote 16.

| Conjunto | Modelo | Precision | Recall | F1 |
|---|---|---:|---:|---:|
| KDPII test | veil-pii-ko-small-3 | 0,850 | 0,874 | 0,862 |
| KDPII test | veil-pii-ko-lite (profesor) | 0,891 | 0,898 | 0,894 |
| Veil sintético heldout | veil-pii-ko-small-3 | 0,889 | 0,972 | 0,929 |
| Veil sintético heldout | veil-pii-ko-lite (profesor) | 0,898 | 0,978 | 0,936 |

Desglose por etiqueta en KDPII test:

| Etiqueta (entidades gold) | Precision | Recall | F1 |
|---|---:|---:|---:|
| PERSON (274) | 0,802 | 0,872 | 0,836 |
| ADDRESS (208) | 0,810 | 0,904 | 0,855 |
| ORGANIZATION (467) | 0,903 | 0,861 | 0,882 |

Rendimiento en CPU sobre un documento de 200.000 caracteres (mediana de 3 ejecuciones, desde tokenización hasta generación del JSON de salida, modelo ya cargado):

| Tipo de entrada | Tiempo |
|---|---:|
| Frases normales | 2,18 s |
| Frases de evaluación concatenadas | 2,39 s |
| Identificadores y teléfonos mezclados | 1,59 s |
| Identificadores alfanuméricos densos | 0,18 s |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo en FP32 ocupa unos 31 MB en disco y una huella de memoria en RAM del orden de decenas de MB durante la inferencia.
- GPU recomendadas: no aplica; está diseñado para CPU. Puede ejecutarse en GPU vía ONNX Runtime, pero no se documentan cifras en ese escenario.
- CPU: cualquier procesador x86-64 con AVX2; las mediciones del autor se hicieron en un AMD Ryzen 5 5600X con 8 hilos.
- Cabe en cualquier equipo de consumo, incluidos portátiles y entornos de escritorio sin acelerador.
- Despliegue: ONNX Runtime (runtime principal, con el módulo `veil3` incluido en el repositorio), más los pesos safetensors para uso con Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para un etiquetador de tokens de este tamaño.
- Latencia y throughput: 2,18 s para un documento de 200.000 caracteres en frases normales y 0,18 s en entradas con identificadores alfanuméricos densos, en la configuración de CPU indicada; el rendimiento escala con el número de hilos y depende del procesador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | F1 (KDPII test) | Licencia |
|---|---:|---|---|---:|---|
| veil-pii-ko-small-3 | 7,7 M | ventana 128 tokens, documento ilimitado | NER PII coreano (3 clases) | 0,862 | Apache-2.0 |
| 1T/veil-pii-ko-lite (profesor) | no disponible | no disponible | NER PII coreano (32 clases de salida, 3 evaluadas) | 0,894 | no disponible |
| monologg/koelectra-small-v3-discriminator (base) | no disponible | no disponible | modelo de lenguaje/representaciones, no NER PII | no aplica | no disponible |

La comparación directa solo es posible con el modelo profesor, del que este checkpoint es una destilación: pierde unos 3 puntos de F1 en KDPII test, concentrados en la recuperación de nombres y organizaciones, a cambio de un tamaño de 7,7 M de parámetros y ejecución en CPU. No se dispone de datos de benchmarks de otros detectores de PII coreanos en la información proporcionada.

## Limitaciones y advertencias

- Precisión inferior al profesor: aproximadamente 3 puntos de F1 menos en KDPII test, principalmente por menor recall en PERSON y ORGANIZATION.
- Solo detecta tres categorías (PERSON, ADDRESS, ORGANIZATION); no identifica teléfonos, correos, números de tarjeta, identificadores fiscales ni otras PII, aunque el documento de prueba las contenga.
- Solo evaluado en coreano; no hay evidencia de comportamiento en otros idiomas y no debe asumirse transferencia.
- Hereda los criterios de anotación del modelo profesor, lo que puede producir discrepancias en los límites de los spans respecto a otros esquemas de anotación.
- Riesgo de falsos negativos y positivos en nombres ambiguos, organizaciones homónimas de palabras comunes y direcciones incompletas; la precisión en PERSON es la más baja (0,802).
- Las cifras de velocidad dependen del CPU, del número de hilos y del tamaño de lote; no deben extrapolarse a otros entornos sin medir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las condiciones y atribuciones de los modelos base, el profesor y los datasets de entrenamiento recogidas en el archivo NOTICE del repositorio.
- Para producción con requisitos estrictos de privacidad, conviene combinarlo con reglas o detectores adicionales para las categorías de PII no cubiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kakao1513/veil-pii-ko-small-3
- Modelo base: https://huggingface.co/monologg/koelectra-small-v3-discriminator
- Modelo profesor: https://huggingface.co/1T/veil-pii-ko-lite
- Dataset BCCard/privacy-filter-openpii-masking: https://huggingface.co/datasets/BCCard/privacy-filter-openpii-masking
- Dataset 1T/veil-pii-ko-synth: https://huggingface.co/datasets/1T/veil-pii-ko-synth
- Dataset e9t/nsmc: https://huggingface.co/datasets/e9t/nsmc
- Dataset daekeun-ml/naver-news-summarization-ko: https://huggingface.co/datasets/daekeun-ml/naver-news-summarization-ko
- Dataset heegyu/korean-petitions: https://huggingface.co/datasets/heegyu/korean-petitions
- Dataset jojo0217/korean_safe_conversation: https://huggingface.co/datasets/jojo0217/korean_safe_conversation
- Paper, blog o demo adicionales: no disponible
