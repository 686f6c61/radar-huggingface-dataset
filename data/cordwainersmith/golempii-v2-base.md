# CordwainerSmith/GolemPII-v2-base

## Resumen

GolemPII-v2-base es un clasificador de tokens especializado en la detección de información personal identificable (PII) en texto hebreo, incluyendo hebreo mezclado con inglés tal como aparece en sistemas empresariales: correos electrónicos, tickets de soporte, chats, registros clave-valor, JSON y logs. Lo desarrolla CordwainerSmith (autor identificado como liranbaba.dev) y sustituye la versión anterior GolemPII-v1. El modelo resuelve el problema de anonimizar y enmascarar datos sensibles antes de que se almacenen, se registren o se envíen a terceros, un requisito habitual en cumplimiento normativo y protección de datos.

Técnicamente es un encoder transformer basado en FacebookAI/xlm-roberta-base, con 277.476.895 parámetros totales y una cabeza de clasificación de tokens con 15 etiquetas en esquema BIO. Cubre nombres, documentos de identidad, datos financieros, contacto, dirección y fechas. Está publicado con licencia MIT, lo que lo hace apto para uso comercial sin restricciones adicionales.

Su relevancia actual radica en la escasez de herramientas de PII de calidad para hebreo: la mayoría de detectores comerciales están centrados en inglés y en lenguas europeas. GolemPII-v2-base declara un F1 a nivel de entidad de 0,924 sobre la mitad reservada del benchmark REDACT PII (hebreo), con un recall especialmente alto (0,983), lo que lo convierte en una pieza útil en pipelines de redacción previa a la persistencia de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de tokens |
| Parámetros totales | 277.476.895 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de XLM-RoBERTa; la model card recomienda `stride=128` para procesar textos más largos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Hebreo, con inglés embebido en texto hebreo |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un encoder transformer multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. Sobre esa base se añade una cabeza de token classification que emite 15 etiquetas en esquema BIO: `FIRST_NAME`, `LAST_NAME`, `ID_NUM`, `PASSPORT_NUM`, `DRIVER_LICENSE_NUM`, `BANK_ACCOUNT_NUM`, `IBAN`, `CC_NUM`, `CC_PROVIDER`, `PHONE_NUM`, `EMAIL`, `STREET`, `CITY`, `POSTAL_CODE` y `DATE`. Los números de tarjeta enmascarados (formato `**** **** **** 1234`) se etiquetan igualmente como `CC_NUM`. Organizaciones, cargos, países y números de referencia (pedido, ticket, empleado) quedan fuera del conjunto de etiquetas.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de ajuste fino supervisado con anotación humana, aumentación de datos o técnicas de regularización específicas. La model card indica únicamente que la evaluación se realizó sobre la mitad reservada del benchmark REDACT PII y sobre el corpus NEMO para nombres de persona, con código de evaluación publicado en el repositorio. No se documentan innovaciones arquitectónicas más allá del ajuste fino de un encoder estándar para la tarea de NER/PII.

## Capacidades

- Detección de PII en hebreo con 15 etiquetas agrupadas en persona, documentos de identidad, financiero, contacto, dirección y otros.
- Manejo de texto hebreo con segmentos en inglés incrustados, típico de sistemas empresariales y logs mixtos.
- Etiquetado a nivel de token con esquema BIO y agregación configurable mediante `aggregation_strategy` en el pipeline de transformers.
- Procesamiento de textos más largos que la ventana de 512 tokens mediante ventanas deslizantes con `stride=128`.
- Detección de números de tarjeta enmascarados y de IBAN, cuentas bancarias y números de teléfono.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades de agente: es exclusivamente un clasificador de tokens.
- Multilingüismo limitado: el modelo está entrenado y evaluado para hebreo; el inglés solo se contempla embebido en texto hebreo, no como idioma principal.

## Casos de uso

- Redacción previa a logging: interceptar mensajes de log y tickets antes de escribirlos en disco, sustituyendo nombres, teléfonos, correos, IBAN y números de tarjeta por marcadores, usando el pipeline con `stride=128` para cubrir registros largos.
- Anonimización de correos de soporte al cliente: procesar hilos de correo en hebreo que contienen datos de contacto y direcciones de envío, aplicando la función de limpieza de spans de la model card para recortar puntuación en los bordes.
- Cumplimiento y protección de datos: detectar PII en bases de datos de tickets y chats para inventariar qué campos contienen datos sensibles y aplicar políticas de retención o borrado.
- Enmascaramiento en pipelines ETL: integrar el modelo como etapa de transformación en flujos que ingieren JSON y registros clave-valor en hebreo, etiquetando `EMAIL`, `PHONE_NUM`, `IBAN` y `CC_NUM` antes de la carga en el data warehouse.
- Sanitización de datasets para entrenamiento: eliminar PII de corpus hebreos antes de publicarlos o reutilizarlos en el ajuste fino de modelos generativos.
- Filtrado de datos en herramientas internas: marcar y ocultar datos personales en visores de tickets o paneles de soporte, con recall alto (0,983 a nivel de entidad) para minimizar fugas.
- Verificación de redacción en QA: comparar la salida del detector con las redacciones aplicadas por otros sistemas para auditar que no queden identificadores expuestos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| REDACT PII Benchmark (hebreo, mitad reservada) | Precision (nivel de carácter) | 0,886 |
| REDACT PII Benchmark (hebreo, mitad reservada) | Recall (nivel de carácter) | 0,951 |
| REDACT PII Benchmark (hebreo, mitad reservada) | F1 (nivel de carácter) | 0,917 |
| REDACT PII Benchmark (hebreo, mitad reservada) | Precision (nivel de entidad) | 0,872 |
| REDACT PII Benchmark (hebreo, mitad reservada) | Recall (nivel de entidad) | 0,983 |
| REDACT PII Benchmark (hebreo, mitad reservada) | F1 (nivel de entidad) | 0,924 |
| NEMO corpus (nombres de persona) | Precision | 0,853 |
| NEMO corpus (nombres de persona) | Recall | 0,925 |
| NEMO corpus (nombres de persona) | F1 | 0,887 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos más activaciones; en la práctica cabe holgadamente en GPUs de 4-8 GB.
- En fp16/bf16 los pesos ocupan alrededor de 0,55 GB; en cuantización de 8 bits, aproximadamente 0,28 GB (las cuantizaciones concretas no están documentadas por el autor).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; modelos como RTX 3060, RTX 4090, A10, L4, A100 o H100 funcionan sin problema. Para despliegues de alto throughput, L4 o A10 son suficientes dado el tamaño reducido.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con 4 GB o más, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference (TGI) para token-classification, y exportación a ONNX para inferencia optimizada. No se documenta soporte explícito para vLLM ni llama.cpp/Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 277M, se espera latencia de milisegundos por fragmento de 512 tokens en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 (entidad, REDACT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GolemPII-v2-base (este modelo) | 277M | 512 tokens | 0,924 | MIT | Hugging Face |
| GolemPII-v2-small | 125M | 512 tokens | no disponible en la información | MIT | Hugging Face |
| GolemPII-v2-tiny | 45M | 512 tokens | no disponible en la información | MIT | Hugging Face |

La model card sitúa GolemPII-v2-small como la mejor opción para prosa hebrea (mejor distinción entre nombres de persona y organizaciones, con menos de la mitad del tamaño de base y la misma velocidad), y GolemPII-v2-tiny como la opción más rápida (unas cinco veces más rápida) con menor precisión en texto empresarial. No se han encontrado en la información disponible otros modelos comparables de detección de PII en hebreo con métricas publicadas.

## Limitaciones y advertencias

- El modelo está orientado a hebreo y a inglés embebido en texto hebreo; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- La ventana de contexto es de 512 tokens; para documentos largos hay que usar ventanas deslizantes con `stride`, lo que puede producir duplicados o cortes en entidades que cruzan fragmentos.
- Los resultados de benchmarks son declarados por el autor y marcados como no verificados; conviene reproducirlos con el código de evaluación del repositorio antes de confiar en ellos en producción.
- El recall a nivel de entidad es alto (0,983) pero la precisión es menor (0,872), lo que implica falsos positivos; en pipelines de redacción esto puede enmascarar texto legítimo y debe calibrarse con revisión humana o reglas adicionales.
- No etiqueta organizaciones, cargos, países ni números de referencia (pedido, ticket, empleado), por lo que no sustituye una política completa de anonimización.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de errores de clasificación en texto ruidoso, con abreviaturas, erratas o formatos atípicos.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantía de ningún tipo; el autor no se responsabiliza del uso en entornos regulados.
- No hay información publicada sobre sesgos demográficos o de representación en los datos de entrenamiento; conviene auditar el modelo en subpoblaciones antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CordwainerSmith/GolemPII-v2-base
- Código de evaluación: https://huggingface.co/CordwainerSmith/GolemPII-v2-base/tree/main/evaluation
- Licencia: https://huggingface.co/CordwainerSmith/GolemPII-v2-base/blob/main/LICENSE
- Demo: https://huggingface.co/spaces/CordwainerSmith/GolemPII-v2-demo
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Modelo anterior: https://huggingface.co/CordwainerSmith/GolemPII-v1
- Variante small: https://huggingface.co/CordwainerSmith/GolemPII-v2-small
- Variante tiny: https://huggingface.co/CordwainerSmith/GolemPII-v2-tiny
- Benchmark REDACT PII: https://huggingface.co/datasets/guneeshv/REDACT-PII-Benchmark
- Corpus NEMO: https://huggingface.co/datasets/imvladikon/nemo_corpus
- Autor: https://liranbaba.dev
