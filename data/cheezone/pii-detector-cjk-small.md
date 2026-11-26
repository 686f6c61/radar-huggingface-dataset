# CheezOne/pii-detector-cjk-small

## Resumen

`pii-detector-cjk-small` es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en textos en chino, japonés, coreano e inglés. Lo desarrolla CheezOne y se apoya en el modelo base `jhu-clsp/mmBERT-small`, una variante multilingüe de la arquitectura ModernBERT. Con unos 140,6 millones de parámetros, está diseñado para ejecutarse incluso en CPU, lo que lo sitúa en la franja de los modelos pequeños orientados a producción.

El problema que resuelve es concreto: la mayoría de los modelos abiertos de detección de PII están centrados en inglés y lenguas europeas, y los existentes para chino suelen tener entre 278 y 600 millones de parámetros. Este modelo reduce el tamaño manteniendo un tokenizador que segmenta el chino de forma fina, lo que permite separar apellido (`张`) y nombre propio (`伟`) como entidades distintas. Detecta 20 tipos de entidad en total, entre ellos nombres, teléfonos, documentos nacionales de identidad, tarjetas bancarias, correos, direcciones y fechas.

Su relevancia actual viene de tres factores: licencia Apache-2.0, distribución en ONNX (fp32 e int8) para Optimum, ONNX Runtime y transformers.js, y entrenamiento exclusivo con datos CC-BY-4.0 y sintéticos generados por el propio autor, sin datos personales reales. Esto lo hace apto para limpieza de datos de entrenamiento, desidentificación de logs y cumplimiento normativo como la PIPL china.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT multilingüe (mmBERT-small), transformer encoder para token-classification |
| Parametros totales | 140.657.321 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (q8); safetensors en precisión completa |
| Idiomas soportados | zh (chino), ja (japonés), ko (coreano), en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente un ajuste fino de `jhu-clsp/mmBERT-small`. La tarea es clasificación de tokens con etiquetado BIO sobre 20 tipos de entidad. El tokenizador está adaptado para segmentar el chino a nivel de carácter, lo que permite que los nombres compuestos se descompongan en apellido y nombre propio como entidades separadas. La model card no detalla la longitud de contexto del modelo base ni el número exacto de tokens de entrenamiento.

El entrenamiento combina el dataset público `ai4privacy/pii-masking-openpii-1.5m` (CC-BY-4.0) con un dataset sintético propio, `CheezOne/pii-synthetic-chinese-japanese-korean-english`. El autor destaca que los datos públicos multilingües usan formatos de identificadores extranjeros incluso en texto chino, por lo que añadió un generador reproducible de PII con formato continental real: documentos de identidad de 18 dígitos con checksum válido, móviles con prefijo `1[3-9]`, fijos, tarjetas UnionPay con validación Luhn, códigos unificados de crédito social, direcciones con estructura provincia/ciudad/distrito/calle/número y números de pasaporte. La evaluación se hace sobre plantillas de frase reservadas (held-out), no vistas en entrenamiento. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Detección y etiquetado de 20 tipos de entidad PII: `GIVENNAME`, `SURNAME`, `TITLE`, `DATE`, `TIME`, `AGE`, `SEX`, `GENDER`, `EMAIL`, `TELEPHONENUM`, `CITY`, `STREET`, `BUILDINGNUM`, `ZIPCODE`, `IDCARDNUM`, `PASSPORTNUM`, `DRIVERLICENSENUM`, `TAXNUM`, `SOCIALNUM` y `CREDITCARDNUMBER`.
- Etiquetado BIO a nivel de token con offsets de carácter mediante la agregación estándar de transformers.
- Redacción automática de PII: sustitución de entidades por marcadores tipo `[SURNAME]` o `[CREDITCARDNUMBER]` con umbral de confianza configurable.
- Capacidad multilingüe nativa en chino, japonés, coreano e inglés, con cobertura específica de formatos continentales chinos (documento de identidad, móvil, tarjeta UnionPay, código de crédito social).
- Inferencia en navegador y Node mediante transformers.js con ONNX int8.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de clasificación de tokens.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Limpieza de datasets de entrenamiento: antes de usar corpus web o conversacionales para entrenar modelos, el detector permite filtrar o enmascarar nombres, teléfonos y documentos de identidad en textos chinos, japoneses, coreanos e ingleses, reduciendo el riesgo de memorización de datos personales.
- Desidentificación de logs de producción: integrado como paso previo al almacenamiento de logs, permite redactar PII en tiempo real con un modelo de 140 M de parámetros que corre en CPU, sin necesidad de GPU dedicada.
- Cumplimiento de la PIPL y normativas de privacidad: para empresas que operan en China, el modelo cubre formatos locales reales (documento de 18 dígitos, tarjetas UnionPay, códigos de crédito social) que los detectores centrados en inglés no reconocen.
- Desidentificación de conversaciones de atención al cliente: en transcripciones multi-turno de chats y correos, permite enmascarar nombres, direcciones y números de tarjeta antes de que el texto llegue a sistemas de analítica o a modelos de lenguaje de terceros.
- Anonimización en el navegador: mediante transformers.js, se puede procesar texto directamente en el cliente sin que los datos salgan del dispositivo, útil en formularios web, herramientas internas o aplicaciones de salud.
- Preprocesado para pipelines RAG: antes de indexar documentos en un sistema de recuperación, el detector elimina PII de los fragmentos, evitando que datos personales queden expuestos en las respuestas generadas.
- Enmascaramiento en herramientas de RR. HH. y finanzas: procesamiento de currículos, nóminas o extractos con datos de identidad y bancarios en contextos multilingües asiáticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). La métrica principal es entity F1 con coincidencia exacta de span y etiqueta; la redaction recall mide la proporción de caracteres PII enmascarados por cualquier etiqueta.

| Idioma | Conjunto de prueba | Precision | Recall | F1 | Redaction recall | Entidades |
|---|---|---|---|---|---|---|
| Inglés | openpii (sintético, formatos mixtos) | 93,5 | 95,1 | 94,3 | 99,9 | 7493 |
| Japonés | openpii (sintético, formatos mixtos) | 96,1 | 96,6 | 96,4 | 99,8 | 7704 |
| Coreano | openpii (sintético, formatos mixtos) | 97,2 | 97,7 | 97,4 | 99,7 | 7160 |
| Chino | openpii (sintético, formatos mixtos) | 96,2 | 96,9 | 96,5 | 99,8 | 6995 |
| Chino | formatos continentales realistas, plantillas held-out | 98,1 | 97,6 | 97,8 | no disponible | no disponible |

Resultados agregados declarados en el model-index: entity F1 de 0,9614 sobre la validación de openpii-1.5m (4k ejemplos en zh/ja/ko/en) y entity F1 de 0,9784 sobre el conjunto propio de PII china realista con plantillas reservadas.

Desglose por etiqueta (F1 sobre openpii y sobre chino realista):

| Etiqueta | F1 openpii | F1 zh realista |
|---|---|---|
| GIVENNAME | 94,4 | 98,3 |
| SURNAME | 93,4 | 98,8 |
| TITLE | 99,1 | no disponible |
| DATE | 99,9 | 80,0 |
| TIME | 97,5 | 90,5 |
| AGE | 97,4 | 100,0 |
| SEX | 93,9 | 100,0 |
| GENDER | 93,7 | no disponible |
| EMAIL | 99,1 | 100,0 |
| TELEPHONENUM | 97,3 | 100,0 |
| CITY | 94,9 | 100,0 |
| STREET | 93,6 | 100,0 |
| BUILDINGNUM | 98,9 | 97,5 |
| ZIPCODE | 99,8 | no disponible |
| IDCARDNUM | 83,3 | 100,0 |
| PASSPORTNUM | 99,0 | 100,0 |
| DRIVERLICENSENUM | 83,3 | no disponible |
| TAXNUM | 98,9 | no disponible |
| SOCIALNUM | 98,8 | 100,0 |
| CREDITCARDNUMBER | 99,0 | 100,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 140,6 M de parámetros, en fp32 los pesos ocupan aproximadamente 560 MB y en int8 unos 140 MB, más el overhead del runtime.
- GPU recomendadas: no disponible. El modelo está diseñado explícitamente para ejecutarse en CPU, por lo que no requiere GPU.
- Cabe en cualquier GPU de consumo y en CPU. El autor indica que es "lo bastante rápido para CPU".
- Opciones de despliegue: transformers (pipeline de token-classification), Optimum con ONNX Runtime (`ORTModelForTokenClassification`, archivo `model_quantized.onnx`), transformers.js en navegador y Node con dtype `q8` (descarga de aproximadamente 230 MB, cacheada).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CheezOne/pii-detector-cjk-small | 140,6 M | zh, ja, ko, en | no disponible | Apache-2.0 | safetensors, ONNX |
| Modelos chinos de PII existentes (según el autor) | 278–600 M | zh (principalmente) | no disponible | no disponible | no disponible |
| Detectores PII abiertos centrados en inglés/Europeo | no disponible | en y lenguas europeas | no disponible | no disponible | no disponible |

La model card no identifica por nombre modelos comparables concretos; solo menciona de forma genérica que los detectores PII abiertos suelen estar centrados en inglés y Europa, y que los modelos chinos existentes tienen entre 278 y 600 millones de parámetros. No se dispone de datos de rendimiento de esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- El F1 sobre `DATE` en chino realista cae a 80,0 y el de `TIME` a 90,5, muy por debajo del resto de etiquetas; conviene revisar fechas y horas en producción.
- `IDCARDNUM` y `DRIVERLICENSENUM` obtienen F1 de 83,3 sobre openpii, los valores más bajos del desglose por etiqueta.
- El modelo solo cubre cuatro idiomas; no se ha evaluado en otras lenguas y no debe asumirse su generalización.
- Es un modelo de clasificación de tokens, no generativo: no razona, no responde preguntas ni ejecuta herramientas.
- Riesgo de falsos positivos y negativos inherente a la detección de entidades; la redacción debe aplicarse con un umbral de confianza (el ejemplo de la model card usa 0,5) y revisarse en dominios sensibles.
- La model card no documenta sesgos específicos ni análisis de robustez frente a texto adversario u ofuscación.
- Aunque la licencia Apache-2.0 permite uso comercial, el autor no ofrece garantías sobre la idoneidad para cumplimiento normativo estricto; la responsabilidad de validación recae en el integrador.
- El pipeline de transformers.js devuelve etiquetas por token sin offsets de carácter; para obtener spans y redacción hay que usar la utilidad `pii.js` del Space de demostración.
- No se dispone de información sobre la longitud máxima de contexto, lo que limita la planificación para documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/pii-detector-cjk-small
- Demo en vivo (ejecución en navegador): https://huggingface.co/spaces/CheezOne/pii-detector-demo
- Utilidad `pii.js` del Space de demostración: https://huggingface.co/spaces/CheezOne/pii-detector-demo/blob/main/pii.js
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset openpii: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Dataset sintético del autor: https://huggingface.co/datasets/CheezOne/pii-synthetic-chinese-japanese-korean-english
