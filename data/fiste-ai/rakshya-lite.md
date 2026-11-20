# fiste-ai/rakshya-lite

## Resumen

Rakshya 1.1 Lite es un modelo de reconocimiento de entidades con nombre (NER) especializado en detección y redacción de datos personales (PII) en nepalí, nepalí romanizado, hindi e inglés. Lo desarrolla fiste-ai y se distribuye bajo licencia Apache-2.0. Es la variante ligera de Rakshya 1.1: comparte etiquetas, reglas y código con el modelo grande, pero reduce la red de 12 a 6 capas, lo que se traduce en un archivo ONNX de 8 bits de 29,8 MB frente a los 40,8 MB de la versión completa.

El modelo parte de `nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large`, un transformer tipo XLM-RoBERTa destilado con 29.296.947 parámetros totales y un tokenizador de 48.000 piezas. Su propósito es práctico: localizar en texto spans de 25 categorías de datos personales (nombre, teléfono, correo, documento nacional, cuenta bancaria, tarjeta, identificadores digitales, etc.) y permitir su anonimización mediante reemplazo por marcadores como `[PERSON_1]`.

Su relevancia actual radica en el despliegue en el navegador y en dispositivos con recursos limitados: el archivo ONNX cuantizado a 8 bits se ejecuta con ONNX Runtime Web (WASM) y transformers.js, procesando un texto de noticia en aproximadamente 23 ms en un solo hilo. Está pensado para flujos de privacidad en cliente, donde la latencia y el tamaño de descarga importan más que una décima de F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa destilado, mMiniLMv2-L6-H384, 6 capas) |
| Parametros totales | 29.296.947 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX 8 bits (`onnx/model_quantized.onnx`); pesos de 32 bits en safetensors |
| Idiomas soportados | nepalí (devanagari y romanizado), hindi, inglés |
| Licencia | Apache-2.0 (pesos); el código que lo ejecuta es MIT |
| Formato de pesos | safetensors (32 bits, 117 MB), ONNX (8 bits, 29,8 MB), tokenizer.json (48.000 piezas) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas derivado de `nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large`, una destilación de XLM-RoBERTa Large. La tarea es token classification con 25 etiquetas de PII y dos perfiles de salida (`labels="all"` y `labels="personal"`). La cabeza de clasificación se aplica sobre las representaciones del encoder y el decodificado de spans se complementa con reglas deterministas incluidas en el paquete de Rakshya 1.1 (por ejemplo, para excluir números ya enmascarados o para separar teléfonos de oficina de teléfonos personales).

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco habituales en un modelo NER de este tamaño). La model card indica que la evaluación se realizó sobre 380 filas de NepPIIBench, un conjunto que no forma parte de los datos de entrenamiento ni de desarrollo, y que el modelo se distribuye con `release.json` con los SHA-256 de los archivos y del código con el que se verificaron. La innovación principal no es arquitectónica sino de empaquetado: cuantización a 8 bits para WASM y un runtime mínimo que combina el modelo con reglas de post-proceso.

## Capacidades

- Detección de entidades de PII en 25 categorías: `PERSON`, `LOCATION`, `ORGANIZATION`, `DATE`, `ADDRESS`, `DOB`, `PHONE`, `EMAIL`, `URL`, `DIGITAL_SECRET`, `NATIONAL_ID`, `TAX_ID`, `PASSPORT`, `DRIVER_LICENSE`, `VOTER_ID`, `MEDICAL_ID`, `EMPLOYEE_STUDENT_ID`, `PROPERTY_UTILITY_ID`, `ID_NUMBER`, `BANK_ACCOUNT`, `CREDIT_CARD`, `PAYMENT_ID`, `VEHICLE_ID`, `OFFICE_PHONE` y `OFFICE_EMAIL`.
- Redacción y anonimización: sustitución de spans por marcadores numerados (`[PERSON_1]`, `[PHONE_1]`).
- Dos perfiles de salida: `labels="all"` devuelve todas las etiquetas; `labels="personal"` excluye `LOCATION`, `ORGANIZATION`, `DATE`, `URL`, `OFFICE_PHONE` y `OFFICE_EMAIL`, y deja intactos los números ya enmascarados.
- Multilingüe: nepalí en devanagari, nepalí romanizado, hindi e inglés, con un único tokenizador de 48.000 piezas.
- Ejecución en navegador mediante ONNX Runtime Web (WASM) y en Node/Python mediante el paquete `rakshya`.
- Compatibilidad con transformers.js para obtener las etiquetas del modelo sin las reglas de post-proceso.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; es un modelo exclusivamente extractivo de etiquetado de tokens.

## Casos de uso

- Redacción de PII en el navegador: una aplicación web puede cargar el ONNX de 29,8 MB y procesar el texto del usuario en el propio cliente con WASM, sin enviar datos personales al servidor. Es adecuado por su tamaño reducido y sus 23 ms por texto en un solo hilo.
- Formularios y chats de atención al cliente: detección en tiempo real de teléfonos, correos y documentos nacionales antes de persistir el mensaje, usando el perfil `labels="personal"` para no enmascarar nombres de organismos ni fechas que el flujo necesite conservar.
- Anonimización de corpus para investigación: preprocesado de textos en nepalí, hindi e inglés antes de compartir datasets, con reemplazo por marcadores numerados que permiten mantener la coherencia de referencias entre menciones.
- Cumplimiento de privacidad en pipelines de datos: integración como paso previo al almacenamiento o al envío a un LLM, filtrando cuentas bancarias, tarjetas, pasaportes e identificadores fiscales.
- Registro y auditoría de documentos: extracción de spans de PII en textos administrativos (direcciones, DOB, identificadores médicos o de empleado) para construir índices de datos sensibles sin exponer el contenido original.
- Aplicaciones móviles o de campo con conectividad limitada: el modelo cabe en 29,8 MB y puede ejecutarse en el dispositivo, lo que resulta útil en despliegues con ancho de banda reducido o requisitos de residencia de datos.
- Moderación y saneado de contenido generado por usuarios: detección de IPs, handles, enlaces de perfil y secretos digitales antes de publicar comentarios.

## Benchmarks y rendimiento

Datos publicados en la model card (F1 exacto con etiqueta, perfil `labels="personal"`):

| Metrica | Rakshya 1.1 Lite | Rakshya 1.1 |
|---|---:|---:|
| F1 exacto medio en siete conjuntos de texto real | 0.903 | 0.913 |
| Prueba práctica, F1 exacto con etiqueta | 0.948 | 0.956 |
| 180 casos adicionales, F1 exacto con etiqueta | 0.919 | 0.960 |
| NepPIIBench, F1 exacto | 0.9468 | 0.9555 |
| Tamano del archivo ONNX 8 bits | 29,8 MB | 40,8 MB |
| Tiempo por texto de noticia en navegador, un hilo | 23 ms | 50 ms |

La evaluación de NepPIIBench se realizó sobre 380 filas con el scorer incluido en el benchmark. La model card menciona métricas de precisión, recall y F1 por carácter y exactas por idioma, pero los valores desglosados no están disponibles en la información proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; el ONNX de 8 bits ocupa 29,8 MB y funciona con ONNX Runtime Web (WASM) en un solo hilo.
- VRAM estimada: no aplica para el flujo principal en CPU/WASM; para ejecución en GPU con los pesos de 32 bits (117 MB) el consumo es mínimo y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime o PyTorch es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, e incluso en dispositivos móviles y navegadores.
- Opciones de despliegue: paquete Python `rakshya` (instalable desde GitHub), módulo de navegador de Rakshya 1.1, ONNX Runtime Web, transformers.js.
- Latencia y throughput: 23 ms por texto de noticia en navegador con un solo hilo (dato del autor); no se publican cifras de throughput por segundo ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 exacto (NepPIIBench) | Licencia | Formato |
|---|---|---:|---:|---|---|
| Rakshya 1.1 Lite | 29,3 M | no disponible | 0.9468 | Apache-2.0 | ONNX, safetensors |
| Rakshya 1.1 | no disponible (12 capas) | no disponible | 0.9555 | Apache-2.0 | ONNX, safetensors |
| mMiniLMv2-L6-H384 (base) | 29,3 M aprox. | no disponible | no disponible | no disponible | safetensors |

No se dispone de datos de otros modelos NER multilingües comparables en la información proporcionada; la comparación se limita a las dos variantes de Rakshya y al modelo base.

## Limitaciones y advertencias

- Es un modelo extractivo de etiquetado de tokens: no genera texto ni razona; cualquier expectativa de uso generativo es incorrecta.
- La cobertura lingüística se limita a nepalí (devanagari y romanizado), hindi e inglés; el rendimiento fuera de estos idiomas no está documentado.
- La longitud máxima de contexto no se especifica en la información disponible; textos largos requieren troceado y pueden perder spans en los cortes.
- Riesgo de falsos negativos y falsos positivos inherente a la detección de PII; el F1 exacto en los 180 casos adicionales cae a 0.919 frente a 0.960 del modelo grande, por lo que en entornos de alto riesgo conviene revisión humana.
- Las reglas de post-proceso forman parte del paquete de Rakshya 1.1 (licencia MIT), no del repositorio del modelo; usar transformers.js directamente devuelve solo las etiquetas del modelo, sin las reglas.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero el código de ejecución tiene licencia MIT y debe verificarse por separado; `NOTICE.md` recoge los términos de datos de entrenamiento de terceros.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a adversariales, mayúsculas, ruido OCR o texto romanizado inconsistente.
- El modelo se publicó en noviembre de 2026 y no registra descargas ni likes en el momento de la consulta; no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fiste-ai/rakshya-lite
- Modelo completo Rakshya 1.1: https://huggingface.co/fiste-ai/rakshya
- Repositorio de código: https://github.com/fiste-ai/rakshya
- Benchmark NepPIIBench: https://huggingface.co/datasets/fiste-ai/nepiibench
- Modelo base: https://huggingface.co/nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large
- Módulo de navegador (CDN jsDelivr): https://cdn.jsdelivr.net/gh/fiste-ai/rakshya@v1.1/docs/rakshya.js
- ONNX Runtime Web: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/
