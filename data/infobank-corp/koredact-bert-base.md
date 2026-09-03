# infobank-corp/koredact-bert-base

## Resumen

koredact-bert-base es un modelo de clasificación de tokens (NER) desarrollado por infobank-corp para la detección de información personal identificable (PII) en textos coreanos. Está basado en klue/bert-base, un BERT-base entrenado específicamente para coreano, y ha sido ajustado con el dataset propio korean-pii-ner. El modelo identifica 13 tipos de PII, incluyendo nombre, teléfono, email, números de registro (RRN, FRN, BRN), tarjetas, cuentas, direcciones, licencias de conducir, pasaportes, URLs y códigos contextuales, mediante etiquetado BIO con 27 etiquetas.

El modelo surge de la necesidad de herramientas públicas de enmascaramiento de PII en coreano que funcionen en datos reales, ya que las existentes carecían de tipos como BRN, DRIVER_LICENSE o PASSPORT, o usaban una única etiqueta genérica, o tenían licencias restrictivas. koredact-bert-base se entrena con variaciones de formato (separadores, dígitos dañados, partículas) para clasificar por contexto y número de dígitos en lugar de depender de la posición de guiones. Incluye un decoder opcional (koredact) que aplica reglas de post-procesamiento para mejorar la precisión en casos como RRN y FRN.

Con 110 millones de parámetros y una ventana de contexto de 512 tokens, el modelo es ligero y adecuado para integración en pipelines de preprocesamiento. Su licencia CC-BY-SA-4.0 permite uso comercial con obligación de compartir derivados bajo la misma licencia. La evaluación en un conjunto de prueba sintético muestra un F1 macro de 0.984 (raw) y 0.986 (con decoder), aunque el autor advierte que no garantiza el rendimiento en datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer) |
| Parametros totales | 110.047.515 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (entrada segmentada en 400 caracteres con solapamiento de 100) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (repo separado) |

## Arquitectura y entrenamiento

El modelo parte de klue/bert-base (revisión `77c8b3d`), un BERT-base preentrenado con texto coreano. La cabeza de clasificación de tokens se re-inicializa y se ajusta con el dataset korean-pii-ner, que contiene anotaciones de 13 tipos de PII. El entrenamiento utiliza segmentos de 400 caracteres con un solapamiento de 100 caracteres, y cada segmento se codifica con un máximo de 512 tokens. Los spans solapados del mismo tipo se fusionan. No se menciona el uso de RLHF o DPO; es un fine-tuning supervisado estándar.

Una innovación destacable es la inclusión en los datos de entrenamiento de variaciones de formato como separadores eliminados, dígitos dañados y partículas coreanas adheridas, lo que permite al modelo clasificar por contexto y número de dígitos en lugar de depender de la posición de guiones. Además, el decoder koredact aplica reglas de post-procesamiento (eliminación de partículas, re-clasificación del séptimo dígito en RRN/FRN, eliminación de fragmentos de borde) para refinar la salida.

## Capacidades

- Detección de 13 tipos de PII en texto coreano: NAME, PHONE, EMAIL, RRN, FRN, BRN, CARD, ACCOUNT, ADDRESS, DRIVER_LICENSE, PASSPORT, URL, CODE.
- Clasificación de tokens con etiquetado BIO (27 etiquetas).
- Soporte de post-procesamiento mediante decoder koredact para mejorar precisión en RRN, FRN y eliminación de partículas.
- Exportación a ONNX (opset 20, fp32) con equivalencia verificada frente a PyTorch (0 discrepancias en argmax, diferencia máxima de logits 8.5e-05).
- No es un modelo generativo; solo realiza clasificación de tokens.
- Monolingüe: únicamente coreano.

## Casos de uso

- Enmascaramiento de PII en mensajes y documentos coreanos: el modelo puede integrarse en pipelines de preprocesamiento para sustituir o eliminar información personal antes de almacenar o compartir datos.
- Cumplimiento de la Ley de Protección de Información Personal de Corea (PIPA): permite anonimizar datos de clientes en sistemas de atención al cliente, registros de transacciones o bases de datos.
- Limpieza de datasets para entrenamiento de modelos NLP: al detectar y eliminar PII, se reduce el riesgo de fuga de información en modelos entrenados con datos reales.
- Anonimización de logs de soporte técnico: el modelo puede procesar conversaciones de chat o tickets para ocultar nombres, números de teléfono, direcciones, etc., antes de su análisis o almacenamiento.
- Detección de fugas de información en repositorios internos: escaneo de documentos o correos para identificar la presencia de PII y alertar sobre posibles brechas.
- Preprocesamiento en sistemas de traducción o transcripción: antes de enviar texto a servicios externos, se elimina PII para evitar exposición no autorizada.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de prueba held-out de 1.589 documentos, con una sola apertura. Las métricas se presentan para la salida cruda del modelo (`raw`) y tras aplicar el decoder koredact (`decoder`). Fβ2 es la métrica ponderada por recall (β=2) utilizada como criterio de selección de checkpoint. El autor advierte que el conjunto es sintético y no garantiza el rendimiento en datos reales.

| Tipo | Significado | R(raw) | P(raw) | F1(raw) | Fβ2(raw) | R(decoder) | P(decoder) | F1(decoder) | Fβ2(decoder) |
|---|---|---|---|---|---|---|---|---|---|
| NAME | Nombre | 0.963 | 0.959 | 0.961 | 0.962 | 0.963 | 0.962 | 0.962 | 0.963 |
| PHONE | Teléfono | 0.998 | 0.981 | 0.989 | 0.994 | 0.998 | 0.982 | 0.990 | 0.994 |
| EMAIL | Email | 1.000 | 0.995 | 0.998 | 0.999 | 1.000 | 1.000 | 1.000 | 1.000 |
| RRN | Número de registro residente | 0.991 | 0.947 | 0.968 | 0.982 | 0.991 | 0.964 | 0.977 | 0.985 |
| FRN | Número de registro extranjero | 0.981 | 0.969 | 0.975 | 0.978 | 0.992 | 0.970 | 0.981 | 0.988 |
| BRN | Número de registro de negocio | 1.000 | 0.991 | 0.995 | 0.998 | 1.000 | 0.991 | 0.995 | 0.998 |
| CARD | Número de tarjeta | 1.000 | 0.981 | 0.990 | 0.996 | 1.000 | 0.981 | 0.990 | 0.996 |
| ACCOUNT | Número de cuenta | 0.974 | 0.978 | 0.976 | 0.975 | 0.974 | 0.978 | 0.976 | 0.975 |
| ADDRESS | Dirección | 0.990 | 0.977 | 0.984 | 0.988 | 0.990 | 0.977 | 0.984 | 0.988 |
| DRIVER_LICENSE | Licencia de conducir | 0.962 | 1.000 | 0.981 | 0.969 | 0.962 | 1.000 | 0.981 | 0.969 |
| PASSPORT | Pasaporte | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |
| URL | URL | 0.989 | 0.989 | 0.989 | 0.989 | 0.989 | 0.989 | 0.989 | 0.989 |
| CODE | Código contextual (autenticación, pedido) | 0.988 | 0.988 | 0.988 | 0.988 | 0.988 | 0.988 | 0.988 | 0.988 |
| **macro F1** | | | | **0.984** | | | | **0.986** | |
| **macro Fβ2** | | | | | **0.986** | | | | **0.987** |

## Requisitos de hardware

- El modelo tiene 110 millones de parámetros, lo que en fp32 ocupa aproximadamente 440 MB. En int8 podría reducirse a unos 110 MB, aunque no se proporcionan cuantizaciones oficiales.
- Inferencia en CPU es viable para procesamiento por lotes pequeños; una GPU con al menos 2 GB de VRAM es suficiente para ejecutar el modelo con comodidad.
- GPU recomendada: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060 o superior) para acelerar la inferencia en producción.
- Compatible con la librería `transformers` de HuggingFace, incluyendo el pipeline `token-classification` con `aggregation_strategy="simple"`.
- También disponible en formato ONNX (opset 20, fp32, 442 MB) para despliegue con ONNX Runtime u otros motores.
- No se proporcionan datos de latencia o throughput específicos; al ser un BERT-base, el rendimiento es típico de esta arquitectura (del orden de miles de tokens por segundo en GPU).

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de PII en coreano en la documentación proporcionada. El autor menciona que los modelos públicos existentes carecían de ciertos tipos de PII o tenían licencias restrictivas, pero no se ofrecen nombres ni métricas de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El conjunto de evaluación es sintético, centrado en mensajes de notificación. El rendimiento en datos reales no está garantizado sin una auditoría específica.
- El modelo tiene debilidades conocidas con rutas coreanas (por ejemplo, en direcciones), URLs con dominios internacionalizados y spans largos que cruzan el límite de la ventana de 400 caracteres.
- La licencia CC-BY-SA-4.0 implica que cualquier obra derivada debe distribuirse bajo la misma licencia, lo que puede afectar a su integración en productos comerciales cerrados.
- El modelo está diseñado únicamente para el idioma coreano; no soporta otros idiomas.
- El autor indica que el modelo está pensado para enmascaramiento como preprocesamiento y no debe utilizarse como base para decisiones legales.
- No se proporcionan cuantizaciones oficiales; el despliegue en entornos con restricciones de memoria requerirá conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infobank-corp/koredact-bert-base
- Dataset de entrenamiento: https://huggingface.co/datasets/infobank-corp/korean-pii-ner
- Repositorio ONNX: https://huggingface.co/infobank-corp/koredact-bert-base-onnx
- Modelo base klue/bert-base: https://huggingface.co/klue/bert-base
