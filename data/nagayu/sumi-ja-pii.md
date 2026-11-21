# NagaYu/sumi-ja-pii

## Resumen

Sumi (墨) es un clasificador de tokens para la detección de información personal identificable (PII) en japonés, desarrollado por NagaYu. Se construye sobre `sbintuitions/modernbert-ja-130m` y está afinado específicamente para resolver las confusiones típicas de las herramientas diseñadas para inglés: apellidos que son también sustantivos comunes (森, 林, 泉, 大和, 青木), homógrafos de lugares y empresas, límites de honoríficos y cadenas de dígitos que parecen números de teléfono sin serlo. Con 132 millones de parámetros, está pensado para ejecutarse en CPU.

El modelo forma parte de un paquete mayor (`sumi`) que combina el clasificador neuronal con una capa de reglas para tipos determinados por formato, un calibrador y una ruta de enmascaramiento reversible. Esto permite enmascarar texto antes de enviarlo a un LLM externo y restaurar la respuesta posteriormente, con un guardián de egreso (`EgressGuard`) que bloquea el envío de valores originales.

Su relevancia actual reside en la combinación de tamaño reducido, licencia Apache 2.0, exportación ONNX INT8 de 133 MB e integración directa con Presidio en tres líneas, sin dependencia de spaCy ni GiNZA. Es una pieza de infraestructura de privacidad, no un modelo generativo: su función es reducir el riesgo de fuga de datos personales en pipelines que procesan texto japonés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) para clasificación de tokens |
| Parámetros totales | 132.413.973 (0,13B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX INT8 (133 MB frente a 530 MB en fp32); pesos fp32 en safetensors |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo es un `ModernBertForTokenClassification` estándar, derivado de `sbintuitions/modernbert-ja-130m` (MIT). La cabeza de clasificación produce 21 clases BIO sobre 10 tipos de PII: `NAME`, `ADDRESS`, `PHONE`, `EMAIL`, `DOB`, `BANK_ACCOUNT`, `CREDIT_CARD`, `MYNUMBER`, `MEMBER_ID` y `POSTAL_CODE`.

El entrenamiento se realizó íntegramente con datos sintéticos, generados a partir del corpus `NagaYu/sumi-ja-pii-corpus`. No se empleó ningún documento real ni dato de personas reales en ninguna fase. El proceso incluye un bucle cerrado de negativos duros: tras el entrenamiento se cuentan los falsos positivos por tipo de confusión y esos recuentos reajustan la distribución de generación del siguiente lote mediante `HardNegativeGenerator.reweight_from_errors`. El checkpoint publicado corresponde a la primera ronda, entrenada con negativos de peso uniforme; los pesos generados para la siguiente ronda se publican en `negatives_weights.json` (por ejemplo, `company_as_person` 0,146 y `date_like_nondob` 0,146). No se especifica en la información disponible el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

Entre las innovaciones destacables: la capa de reglas para tipos determinados por formato, el calibrador de puntuaciones, el refinamiento de límites de span, el enmascaramiento reversible con mapa local escrito con permisos 0600 y el `EgressGuard`, que bloquea (no registra) cualquier envío que contenga un valor original, ya sea en crudo, normalizado NFKC o solo con dígitos, para valores de tres o más caracteres.

## Capacidades

- Detección de entidades PII en japonés sobre 10 tipos: nombres, direcciones, teléfonos, correos, fechas de nacimiento, cuentas bancarias, tarjetas de crédito, My Number, identificadores de miembro y códigos postales.
- Distinción de apellidos homógrafos de sustantivos comunes y de topónimos o nombres de empresa.
- Delimitación correcta de límites de honoríficos (様, さん, etc.).
- Discriminación de cadenas de dígitos que imitan formatos de teléfono o tarjeta sin serlo.
- Enmascaramiento reversible: sustitución por marcadores del tipo `<NAME_1>` y restauración posterior de la respuesta del LLM.
- Integración con Presidio mediante `register(registry)`, sin spaCy ni GiNZA.
- Registro de validez de dígito de control en `meta["checksum_valid"]` sin que este condicione la detección.
- Exportación ONNX INT8 con alta concordancia respecto a fp32 (1,0000 en la frase de verificación y 0,9964 sobre 88.106 tokens de 450 documentos).
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un clasificador de tokens.

## Casos de uso

- Enmascaramiento previo a LLM externo: el detector identifica PII en el prompt, la sustituye por marcadores y el `EgressGuard` bloquea cualquier envío que contenga valores originales; tras la respuesta, el `ReversibleMasker` restaura el texto. Adecuado por su bajo coste en CPU y su ruta de ida y vuelta verificada.
- Cumplimiento de privacidad en pipelines documentales japoneses: procesamiento por lotes de correos, contratos o formularios para localizar y anonimizar datos personales antes de almacenarlos o enviarlos a terceros.
- Integración en Presidio para equipos que ya usan este marco: tres líneas de registro permiten añadir reconocimiento de japonés sin desplegar spaCy ni GiNZA.
- Redacción de logs y trazas: filtrado de nombres, teléfonos y correos en registros de aplicaciones antes de su exportación a sistemas de observabilidad.
- Preprocesado de datasets para entrenamiento: detección y eliminación de PII en corpus japoneses antes de publicarlos o reutilizarlos.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con una exportación ONNX de 133 MB, encaja en contenedores pequeños, funciones serverless o equipos de sobremesa sin GPU.
- Atención al cliente con datos sensibles: anonimización de conversaciones multi-turno antes de su análisis o envío a modelos generativos externos.

## Benchmarks y rendimiento

La model card describe una evaluación comparativa contra cuatro alternativas sobre documentos idénticos, misma CPU y mismo número de hilos, con cada condición en su propio proceso, incluyendo Presidio con configuración inglesa por defecto (condición A). Sin embargo, la información proporcionada se interrumpe antes de presentar los resultados numéricos de esa comparación.

Los únicos datos cuantitativos disponibles son los de la cuantización ONNX INT8:

| Métrica | Valor |
|---|---|
| Concordancia argmax fp32 vs INT8 (frase de verificación) | 1,0000 |
| Concordancia argmax fp32 vs INT8 (88.106 tokens, 450 documentos) | 0,9964 |
| Concordancia en tokens etiquetados como PII por cualquiera de los dos | 0,9821 |
| Documentos con etiquetado idéntico | 273/450 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de precisión, recall o F1 a nivel de span para la tarea de detección de PII.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica. Cualquier GPU con suficiente memoria podría ejecutarlo, pero el diseño y la evaluación se orientan a CPU.
- Cabe en GPU de consumo: sí, con 132M de parámetros (aproximadamente 530 MB en fp32 y 133 MB en ONNX INT8), aunque no es el escenario objetivo.
- Opciones de despliegue: paquete `sumi` (con extras `presidio` y `onnx`), `transformers` con `AutoModelForTokenClassification`, ONNX Runtime y Presidio mediante `sumi.presidio_plugin`. También se distribuyen pesos en formato GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación se realizó en CPU con un número de hilos fijo, pero no se publican cifras de latencia ni de documentos por segundo.

## Comparativa con modelos similares

La model card menciona una comparación contra cuatro alternativas en documentos idénticos, pero la información disponible solo identifica la condición (A): Presidio con configuración inglesa por defecto. No se detallan las otras tres alternativas ni sus resultados.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Sumi (NagaYu/sumi-ja-pii) | 132M | no disponible | Apache 2.0 | Clasificador de tokens PII en japonés sobre ModernBERT |
| Presidio (config. inglesa por defecto) | no aplica | no aplica | MIT (Presidio) | Reconocimiento basado en reglas y modelos para inglés |
| sbintuitions/modernbert-ja-130m | 130M | no disponible | MIT | Modelo base japonés sin ajuste para PII |
| Alternativas 2 a 4 de la evaluación | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Todos los datos de entrenamiento y evaluación son sintéticos; las métricas publicadas son una cota superior medida en condiciones sintéticas y no se validarán sobre documentos reales por decisión de diseño. Es obligatorio validar sobre documentos propios antes de desplegar.
- El modelo no garantiza cumplimiento legal ni regulatorio; reduce el riesgo de fuga de datos, pero no es un detector completo y producirá omisiones.
- El umbral de decisión y el caso de uso quedan a cargo del implementador.
- El `EgressGuard` exime por diseño los valores de uno y dos caracteres, entre los que se cuentan muchos apellidos japoneses, porque colisionan con palabras ordinarias; el enmascaramiento los sustituye, pero no hay segunda línea de defensa para ellos.
- La cuantización INT8 no es sin pérdida: la diferencia entre las condiciones (D) y (E) de la evaluación refleja su efecto a nivel de span.
- Solo soporta japonés; no hay capacidades multilingües declaradas.
- Al usar `transformers` directamente se pierden la capa de reglas, la calibración y el refinamiento de límites, de donde procede buena parte de la precisión.
- El mapa de enmascaramiento se escribe con permisos 0600 y no debe salir de la máquina; su gestión incorrecta compromete la reversibilidad y la privacidad.
- La validez de los dígitos de control no condiciona la detección: solo se registra en `meta["checksum_valid"]`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/sumi-ja-pii
- Dataset: https://huggingface.co/datasets/NagaYu/sumi-ja-pii-corpus
- Código, benchmarks y pipeline de entrenamiento: https://github.com/NagaYu/sumi
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
