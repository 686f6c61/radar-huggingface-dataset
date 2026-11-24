# blue2959/Llama-ai4privacy-piiguard-bert-clean-s2

## Resumen

Llama-ai4privacy-piiguard-bert-clean-s2 es un modelo de clasificación de tokens (token-classification) especializado en la detección de información personal identificable (PII) en texto en inglés. Lo desarrolla el usuario blue2959 en el marco del proyecto de curso PIIGuard (CSED490E) y se construye mediante fine-tuning de gravitee-io/bert-small-pii-detection, un BERT pequeño de 28,5 millones de parámetros, sobre el conjunto de datos ai4privacy/open-pii-masking-500k-ai4privacy.

El modelo resuelve una pregunta de investigación concreta: si entrenar un etiquetador de PII sobre texto limpio recupera el rendimiento que el ruido (erratas, espacios omitidos, minúsculas, puntuación eliminada y formatos numéricos alterados) le hace perder. Esta es la versión "clean" con semilla 2, entrenada únicamente con los 115.533 registros limpios del split de entrenamiento de ai4privacy; su contraparte es la versión "noisy" con la misma semilla.

Es relevante como artefacto de investigación reproducible (tres semillas por versión, registro completo de entrenamiento en `training.json`) y como ejemplo de los límites de los modelos pequeños en tareas de anonimización: obtiene F2 de 0,985 en dominio pero cae a 0,518 en Gretel. No está pensado para uso en producción ni ha sido auditado con datos personales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), base gravitee-io/bert-small-pii-detection, revisión `f8c27a85c5` |
| Parametros totales | 28.527.155 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de entrenamiento; para textos mayores se recomiendan ventanas solapadas de 256 con stride 64) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | llama-3.3-community-license (etiqueta `other`); el modelo base es Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | token-classification |
| Etiquetas | 51 etiquetas BIO del modelo base, sin cambios |
| Clases entrenadas | PERSON, EMAIL_ADDRESS, PHONE_NUMBER, LOCATION (número y calle), DATE_TIME, CREDIT_CARD; el resto se entrena como `O` |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT pequeño, inicializado desde gravitee-io/bert-small-pii-detection y ajustado para etiquetado de secuencias con esquema BIO de 51 etiquetas. El tokenizador pasa todo el texto a minúsculas. El entrenamiento se realizó sobre el split de entrenamiento en inglés de ai4privacy (115.533 registros limpios), reservando 5.000 registros como conjunto de desarrollo con semilla 0. Se dieron tres pasadas sobre el conjunto limpio: 10.832 pasos con batch de 32, optimizador AdamW, learning rate 5e-5, warm-up lineal del 6 % seguido de decaimiento lineal, weight decay de 0,01, longitud de 256 tokens y precisión bf16. Se conservó el checkpoint del último paso y solo se registraron las pérdidas de desarrollo.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: se comparan versiones entrenadas con datos limpios frente a versiones con ruido sintético (una edición cada diez palabras, tipos mezclados, semilla 2), con tres semillas por versión. La pérdida final en desarrollo fue de 0,0124 en limpio y 0,1361 en ruidoso. El repositorio incluye `training.json` con ajustes, sumas de verificación de los ficheros de datos, todas las pérdidas registradas, tiempos, GPU y versiones de paquetes. No se documenta RLHF ni DPO.

## Capacidades

- Detección de PII en inglés mediante etiquetado BIO a nivel de token: nombres (PERSON), correos electrónicos, teléfonos, direcciones (número y calle), fechas y tarjetas de crédito.
- Clasificación con `pipeline("token-classification")` de Transformers usando `aggregation_strategy="simple"`.
- Conserva las 51 etiquetas del modelo base, por lo que su formato de salida es compatible con el original.
- Procesamiento por ventanas solapadas para textos de más de 256 tokens.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Investigación sobre robustez frente a ruido: comparar esta versión limpia con la ruidosa (misma semilla 2) para medir cuánto rendimiento recupera el entrenamiento con datos limpios cuando la entrada es ruidosa; el diseño con tres semillas permite estimar varianza.
- Evaluación de modelos pequeños de PII: servir de línea base de 28,5 millones de parámetros frente a modelos mayores en tareas de anonimización, con métricas de F2 estricta y tasa de fuga ya publicadas.
- Preetiquetado en dominio sintético: generar etiquetas preliminares sobre frases cortas en inglés similares a ai4privacy para su revisión humana posterior, aprovechando el F2 de 0,985 en dominio.
- Estudio de convenciones de anotación: analizar cómo un modelo aprende los bordes de span específicos de un dataset (por ejemplo, direcciones que excluyen ciudad y código postal) y cómo eso afecta a la transferencia.
- Docencia y reproducción experimental: el registro completo de entrenamiento y los checksums permiten reproducir el ajuste en un entorno académico con recursos modestos.
- Detección de correos y teléfonos en textos cortos y controlados: con las salvedades de la sección de limitaciones, puede usarse para localizar estos dos tipos en frases generadas con proveedores comunes.

## Benchmarks y rendimiento

Micro F2 con coincidencia estricta (mismo inicio, fin y etiqueta) sobre seis etiquetas, y tasa de fuga (proporción de valores PII de referencia no enmascarados por completo), en conjuntos de test limpios y en copias con ruido mixto:

| Conjunto de test | F2 limpio | F2 ruido mixto | Fuga limpio | Fuga ruido mixto |
|---|---:|---:|---:|---:|
| ai4privacy (en dominio) | 0,985 | 0,915 | 1,0 % | 2,3 % |
| Nemotron-PII | 0,723 | 0,638 | 15,8 % | 22,5 % |
| Gretel | 0,518 | 0,471 | 38,3 % | 40,4 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (28,5 millones de parámetros, unos 114 MB de pesos) y alrededor de 0,5 GB en fp16; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pipeline de token-classification, exportación a ONNX y servidores de inferencia compatibles con modelos de Transformers; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-ai4privacy-piiguard-bert-clean-s2 | 28.527.155 | 256 tokens | Detección de PII (6 clases entrenadas) | llama-3.3-community-license | Hugging Face, 0 descargas |
| gravitee-io/bert-small-pii-detection (base) | no disponible | no disponible | Detección de PII (51 etiquetas) | Apache-2.0 | Hugging Face |
| Llama-ai4privacy-piiguard-bert-noisy-s2 | no disponible | 256 tokens | Detección de PII con ruido sintético | llama-3.3-community-license | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible contrastar F2 entre ellos.

## Limitaciones y advertencias

- No apto para producción: es un modelo de investigación y no ha sido ajustado ni auditado con datos personales reales.
- Bordes de dirección: ai4privacy solo marca número de edificio y calle, de modo que en datos que anotan la dirección completa (como Gretel) el modelo recorta el span y deja sin enmascarar ciudad, código postal o número de piso.
- Formas de correo: ningún correo de ai4privacy contiene un punto antes de la `@` (0 de 13.282) y usan pocos proveedores; el modelo fragmenta direcciones como `john.miller@example.com`, algo que el modelo base no hace.
- Un solo dominio de entrenamiento: frases cortas generadas en inglés; el rendimiento cae fuera de ese dominio (F2 de 0,518 en Gretel y fuga del 38,3 %).
- Ruido sintético: el ruido se genera con un script a una tasa fija y no reproduce los errores de tecleo reales.
- Idiomas: solo inglés; el tokenizador pasa el texto a minúsculas, lo que puede afectar a entidades sensibles a mayúsculas.
- Licencia: uso y distribución sujetos a la Llama 3.3 Community License y a la Llama Acceptable Use Policy, con implicaciones para uso comercial; el modelo base es Apache-2.0.
- Riesgo de fuga en dominios distintos al de entrenamiento: entre el 15,8 % y el 40,4 % de valores PII no quedan completamente enmascarados según el conjunto de test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s2
- Versión con ruido, misma semilla: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-noisy-s2
- Modelo base: https://huggingface.co/gravitee-io/bert-small-pii-detection
- Dataset de entrenamiento: https://huggingface.co/datasets/ai4privacy/open-pii-masking-500k-ai4privacy
- Licencia Llama 3.3: https://huggingface.co/blue2959/Llama-ai4privacy-piiguard-bert-clean-s2/blob/main/LICENSE-llama-3.3.txt
