# atonlee/koelectra-ko-pii-ner

## Resumen

El modelo `atonlee/koelectra-ko-pii-ner` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en texto coreano. Desarrollado por atonlee, se basa en el modelo discriminador `monologg/koelectra-small-v3-discriminator` y cuenta con 14,1 millones de parámetros, lo que lo convierte en una solución ligera y adecuada para despliegue en dispositivos con recursos limitados (on-device). Su propósito principal es identificar y clasificar datos personales como nombres, números de teléfono, direcciones, números de tarjeta o credenciales, devolviendo tanto el tipo como la posición exacta dentro del texto.

El modelo resuelve un problema crítico en el ecosistema actual de aplicaciones basadas en LLM: la protección de la privacidad antes de enviar texto a servicios externos o a la nube. Al detectar PII de forma local, permite enmascarar o bloquear información sensible sin necesidad de transmitirla a un modelo remoto. Esto lo hace relevante para sectores como finanzas, administración pública o atención al cliente, donde el cumplimiento normativo de protección de datos es obligatorio. La arquitectura ELECTRA, el tamaño reducido y el soporte para cuantización ONNX (fp16, int8, uint8) facilitan su integración en pipelines de producción con baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (discriminator) |
| Parametros totales | 14.071.355 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | ONNX: fp16, int8, uint8, q4f16 (model_quantized.onnx es uint8) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ELECTRA, concretamente el discriminador de `koelectra-small-v3`, que fue preentrenado con el corpus coreano original de KoELECTRA. Para esta tarea, se realizó un fine-tuning sobre la cabeza de clasificación de tokens (token classification) utilizando el esquema de etiquetado BIO (Begin, Inside, Outside). El entrenamiento combinó datasets públicos —`BCCard/pii-masking-openpii-finance` (licencia CC BY 4.0) y `townboy/korean-pii-dataset`— con ejemplos de PII escritos manualmente para cubrir patrones específicos del contexto coreano. El modelo distingue 29 etiquetas organizadas en tres niveles de sensibilidad: tier1 (identifican a una persona por sí solas, como RRN, número de pasaporte o cuenta bancaria), tier2 (requieren combinación con otros datos, como nombre, teléfono o dirección) y none (entidades detectadas pero no consideradas PII, como lugares u organizaciones). No se han publicado detalles sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO.

## Capacidades

- Detección de PII en coreano con clasificación en 29 etiquetas específicas (RRN, ALIEN_ID, PASSPORT, DRIVER_LICENSE, CARD_NUMBER, ACCOUNT_NUMBER, NAME, PHONE, EMAIL, ADDRESS, etc.).
- Distinción por niveles de sensibilidad (tier1, tier2, none) para decidir si un dato debe bloquearse, enmascararse o enviarse tal cual.
- Soporte para token classification con esquema BIO, devolviendo posiciones exactas de las entidades mediante offset mapping.
- Compatibilidad con ONNX (fp16, int8, uint8, q4f16) para inferencia eficiente en CPU, GPU y dispositivos edge.
- Funciona como modelo de NER puro; no incluye generación de texto ni capacidades de razonamiento, tool calling o agentes.
- Multilingüe solo en coreano; no hay soporte para otros idiomas.

## Casos de uso

- Enmascaramiento de datos antes de enviar texto a un LLM externo: el modelo se ejecuta localmente para detectar PII (por ejemplo, nombres o números de teléfono) y reemplazarlos por marcadores antes de la llamada a la API, reduciendo el riesgo de fuga de información.
- Cumplimiento de la Ley de Protección de Datos Personales de Corea del Sur: integración en sistemas de gestión documental para anonimizar automáticamente registros financieros, administrativos o médicos antes de su almacenamiento o intercambio.
- Filtrado de PII en chatbots de atención al cliente: antes de que un usuario envíe un mensaje a un asistente virtual, el modelo identifica y bloquea datos sensibles como números de tarjeta o cuentas bancarias, evitando que se procesen externamente.
- Auditoría de logs y registros: análisis de logs de aplicaciones para localizar y enmascarar direcciones IP, correos electrónicos o identificadores de usuario antes de enviarlos a herramientas de monitorización en la nube.
- Redacción de documentos legales o financieros: procesamiento de contratos o extractos bancarios para eliminar información personal antes de compartirlos con terceros, usando las etiquetas de tier1 para bloquear y tier2 para enmascarar.
- Despliegue on-device en aplicaciones móviles o de escritorio: gracias a su tamaño reducido (14M parámetros) y a las versiones cuantizadas ONNX, puede ejecutarse en tiempo real en dispositivos sin conexión, garantizando que los datos personales nunca salgan del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (el modelo pesa ~56 MB en ONNX fp32), y menos de 100 MB en versiones cuantizadas (int8/uint8).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 o superior). También funciona sin GPU, en CPU.
- Cabe en consumer GPU y en dispositivos móviles; es adecuado para Raspberry Pi o similares.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Transformers.js (gracias al archivo `model_quantized.onnx`), y cualquier framework que soporte modelos ONNX.
- Latencia y throughput: no se han publicado datos específicos, pero por el tamaño del modelo se espera una latencia de milisegundos en CPU moderna y aún menor en GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada con otros modelos NER coreanos. Como referencia, existen otros modelos basados en KoELECTRA, como `Leo97/KoELECTRA-small-v3-modu-ner`, que también realizan NER en coreano, pero no se han encontrado datos de rendimiento comparables. El modelo destaca por su enfoque específico en PII con una taxonomía detallada de 29 etiquetas y por su optimización para despliegue on-device.

## Limitaciones y advertencias

- Limitado exclusivamente al idioma coreano; no detecta PII en otros idiomas.
- Longitud de contexto máxima de 512 tokens, por lo que textos más largos deben truncarse o dividirse, lo que puede afectar a la detección de entidades que cruzan el límite.
- Riesgo de alucinación o errores en entidades poco frecuentes o con formatos atípicos, especialmente en nombres extranjeros o direcciones no estándar.
- La distinción entre `ADDRESS` y `PLACE` depende de la presencia de número de edificio o unidad; puede haber errores en casos ambiguos.
- El modelo no distingue entre PII real y datos sintéticos; su precisión depende de la calidad de los datos de entrenamiento, que incluyen ejemplos generados manualmente.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el uso cumple con las regulaciones locales de protección de datos.
- No se han publicado métricas de rendimiento (precisión, recall, F1) en la documentación disponible, por lo que se recomienda validar el modelo en el dominio de aplicación antes de usarlo en producción.

## Enlaces

- [HuggingFace - atonlee/koelectra-ko-pii-ner](https://huggingface.co/atonlee/koelectra-ko-pii-ner)
- [GitHub - monologg/KoELECTRA (modelo base)](https://github.com/monologg/KoELECTRA)
- [HuggingFace - monologg/koelectra-small-v3-discriminator](https://huggingface.co/monologg/koelectra-small-v3-discriminator)
- [Dataset - BCCard/pii-masking-openpii-finance](https://huggingface.co/datasets/BCCard/pii-masking-openpii-finance)
- [Dataset - townboy/korean-pii-dataset](https://huggingface.co/datasets/townboy/korean-pii-dataset)
