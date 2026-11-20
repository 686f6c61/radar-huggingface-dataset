# Holocortex/Smith-Pincette-Nitro

## Resumen

Smith-Pincette-Nitro es un modelo compacto de detección de información personal identificable (PII) desarrollado por Holocortex, publicado como preview v0.5. Se enmarca en la familia Smith-Pincette, centrada en extraer spans exactos de datos personales (nombres, contactos, direcciones, identificadores fiscales y bancarios) para poder enmascararlos antes de que lleguen a logs, LLMs o terceros. Nitro es la variante rápida de la familia, disenada para ejecutarse en CPU y soportar alto volumen.

El modelo parte del encoder multilingue jhu-clsp/mmBERT-small (146,7M parámetros) y le anade cabezas de span extraction, distribuyendo el conjunto como un único grafo ONNX que se ejecuta con onnxruntime en CPU o GPU CUDA sin necesidad de PyTorch. Detecta 43 clases organizadas en grupos como identificadores gubernamentales, banca y pagos, identidad digital, datos de persona, contacto y localización, credenciales experimentales y fechas o cantidades.

Su relevancia práctica está en el contexto de privacidad en pipelines de datos: el modelo devuelve spans con offsets de caracteres, etiqueta y score calibrado por clase, y permite filtrar por subconjunto de etiquetas o aplicar un umbral plano. Es una pieza pensada para integrarse en flujos de sanitización previos al envío de texto a servicios externos, con licencia Apache-2.0 y ejecución completamente local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multilingue (jhu-clsp/mmBERT-small) con cabezas de span extraction, exportado como grafo ONNX único |
| Parametros totales | 146,7M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada de cualquier longitud; procesada en ventanas de 512 tokens con solapamiento de 64 tokens |
| Tipos de cuantizacion | No disponible (se distribuye como model.onnx; no se documentan variantes cuantizadas) |
| Idiomas soportados | Mejor cobertura en inglés y alemán; otros idiomas funcionan en menor grado (no se detalla lista completa) |
| Licencia | Apache-2.0 (el encoder base jhu-clsp/mmBERT-small es MIT) |
| Formato de pesos | ONNX (model.onnx) + tokenizer.json, config.json, calibrated_thresholds.json |

## Arquitectura y entrenamiento

Smith-Pincette-Nitro combina un encoder multilingue mmBERT-small con cabezas de span extraction, empaquetado en un único grafo ONNX que se ejecuta con onnxruntime. La decodificación aplica umbrales calibrados por clase y devuelve el mejor conjunto de spans no solapados con offsets de caracteres `(start, end, label, score)`. El procesamiento de textos largos se hace por ventanas de 512 tokens con 64 tokens de solapamiento, lo que permite manejar entradas de cualquier longitud.

El entrenamiento usa aproximadamente 230.000 documentos, ninguno recogido de personas reales. La mayor parte son documentos generados: plantillas sintéticas de tickets, formularios, correos, chats, logs y contratos rellenadas con valores sintéticos, además de textos redactados por Qwen3.8-27B en varios idiomas. Se incluyen pasajes de Wikipedia en varios idiomas como texto real etiquetado automáticamente (contenido bajo CC BY-SA 4.0). Las etiquetas provienen de los propios generadores y de anotación automática mediante modelos Apache-2.0. Según el autor, no se usaron datos de test de benchmarks y se verificó que el solapamiento con benchmarks públicos es cero.

## Capacidades

- Detección de PII mediante span extraction con offsets de caracteres, etiqueta y score calibrado por clase.
- 43 clases agrupadas en: identificadores gubernamentales (ssn, national_id, passport_number, drivers_license_number, license_number, tax_id); banca y pagos (credit_card_number, card_expiry, card_cvv, iban, bank_account, routing_number, currency); credenciales y endpoints experimentales (password, secret_key, jwt_token, private_key, hostname_or_endpoint); identidad digital (crypto_address, ip_address, username, account_id, mac_address); persona (person, date_of_birth, occupation, age, gender, education_level); contacto y localización (email, phone_number, street_address, city, state_or_region, postal_code, country, nationality, coordinate); organización y salud (organization, medical_condition); fechas, horas y números (date, time, quantity).
- Enmascaramiento directo de texto mediante `model.mask(text)`, que sustituye los spans por placeholders como `[PERSON]` o `[IBAN]`.
- Filtrado por subconjunto de etiquetas con `model.detect(text, labels={...})` y umbral plano opcional con `threshold=0.4`.
- Procesamiento de entradas de cualquier longitud mediante ventanas de 512 tokens con solapamiento.
- Ejecución local en CPU o GPU CUDA vía onnxruntime, sin dependencia de PyTorch.
- Soporte multilingue, con mejor rendimiento en inglés y alemán.
- Utilidades asociadas en el repositorio: CLI de enmascaramiento, procesado de lotes JSONL, enmascaramiento reversible para prompts de LLM y servidor MCP local para agentes.

## Casos de uso

- Sanitización de prompts antes de enviarlos a un LLM: el modelo detecta y enmascara nombres, correos, IBAN y números de tarjeta en el texto de entrada, de modo que el proveedor externo del modelo solo recibe placeholders. Adecuado por su ejecución local y su coste bajo en CPU.
- Limpieza de logs y trazas de aplicación: procesado por ventanas de 512 tokens con solapamiento permite recorrer líneas de log de longitud variable y sustituir IPs, correos, hostnames y tokens antes de persistirlos o enviarlos a un sistema de observabilidad.
- Gestión de tickets de soporte: enmascarar datos de cliente en tickets antes de que el equipo o herramientas de terceros los consulten, usando el filtrado por etiquetas para limitar la detección a los campos relevantes (person, email, phone_number, iban).
- Procesado por lotes de formularios y documentos: la CLI y el soporte de JSONL del repositorio permiten recorrer corpus de formularios y contratos y producir versiones enmascaradas de forma reproducible.
- Enmascaramiento reversible en pipelines de agentes: el repositorio documenta enmascaramiento reversible para prompts de LLM y un servidor MCP local, lo que permite que un agente opere sobre texto sanitizado y reconstruya los valores originales solo en el entorno controlado.
- Preprocesado de correos y chats antes de análisis o archivado: detección de personas, direcciones, teléfonos y fechas para cumplir políticas internas de minimización de datos.
- Filtro previo en flujos de clasificación o búsqueda: aplicar `model.detect` con un subconjunto de etiquetas para marcar documentos que contienen PII antes de indexarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 146,7M parámetros el modelo es apto para CPU y para GPUs de gama baja, pero el autor no publica cifras de memoria.
- GPU recomendadas: no se especifican modelos concretos; el modelo se ejecuta con onnxruntime en CPU o en GPU CUDA.
- Cabe en GPU de consumo: sí, por tamano (146,7M parámetros) y por el diseno orientado a CPU y alto volumen; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (CPU o CUDA) mediante la librería `smith_pincette`; CLI de enmascaramiento, procesado de lotes JSONL y servidor MCP local documentados en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smith-Pincette-Nitro | 146,7M | Ventanas de 512 tokens con solapamiento de 64 | Detección de PII por span extraction, ONNX | Apache-2.0 | Hugging Face, preview v0.5 |
| Smith-Pincette-Sprint | No disponible | No disponible | Variante de la misma familia (tier distinto) | No disponible en la informacion | Hugging Face |
| jhu-clsp/mmBERT-small | No disponible en la informacion | No disponible | Encoder multilingue base | MIT | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo estadístico: fallará en algunos valores sensibles y marcará como PII valores inocuos. No debe usarse como única salvaguarda cuando una fuga tenga consecuencias legales o de seguridad.
- Las clases de credenciales (password, secret_key, jwt_token, private_key, hostname_or_endpoint) son experimentales en esta preview y pierden muchos valores, especialmente en líneas de configuración y logs. No debe usarse como escáner de secretos.
- Cobertura lingueistica desigual: mejor en inglés y alemán; otros idiomas funcionan en menor grado, sin lista completa publicada.
- Es una preview release: el autor advierte de asperezas y de que tanto los modelos como la API pueden cambiar.
- Los umbrales por clase están calibrados y se pueden sustituir por un umbral plano, lo que altera el equilibrio entre falsos positivos y falsos negativos.
- El modelo se ofrece tal cual, sin soporte ni garantía; las incidencias se atienden vía GitHub sin respuesta garantizada.
- Licencia Apache-2.0 para el modelo; el encoder base es MIT. El contenido de Wikipedia usado en entrenamiento está bajo CC BY-SA 4.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Holocortex/Smith-Pincette-Nitro
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo hermano (Sprint): https://huggingface.co/Holocortex/Smith-Pincette-Sprint
- Repositorio de la familia Smith-Pincette: https://github.com/holocortex/Smith-Pincette-Models
- Incidencias: https://github.com/holocortex/Smith-Pincette-Models/issues
- onnxruntime: https://onnxruntime.ai
- Referencia de Qwen: https://huggingface.co/Qwen
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
