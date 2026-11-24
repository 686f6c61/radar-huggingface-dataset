# gradients-ai-1/Reflex-2B

## Resumen

Reflex-2B es un modelo de extracción de datos estructurados a partir de documentos desarrollado por el usuario gradients-ai-1, construido como un ajuste fino del modelo multimodal LiquidAI/LFM3-VL-2B. Su propósito es recibir una página (fotografía, escaneo, captura de pantalla, PDF o texto plano) junto con una definición de campos y devolver un único objeto JSON con valores tipados. A diferencia de los enfoques tradicionales de OCR más reglas heurísticas, el modelo combina comprensión visual y razonamiento sobre el esquema solicitado en una sola pasada.

El modelo cuenta con 1.918.181.888 parámetros (aproximadamente 2B) y está etiquetado por el autor como "system-1", lo que sugiere un diseño orientado a respuestas rápidas y directas sin cadenas de razonamiento largas. Soporta tipos de campo como texto, número, fecha, hora, datetime, booleano, enumerado, objeto y lista, con valores ausentes representados como `null` y fechas en formato ISO 8601.

Es relevante porque aborda una tarea de alto valor práctico (extracción documental en producción) con un modelo pequeño que, según el autor, supera a un modelo de 9B en los benchmarks reportados (SROIE 2019 y DocVQA). Incluye además un paquete Python (`reflex_runtime`) que facilita el despliegue con vLLM o transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de LFM3-VL, tag `lfm3_vl`); detalles internos no disponibles |
| Parametros totales | 1.918.181.888 (~2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`); el ejemplo de la model card muestra salida en japonés, pero no se declara soporte oficial |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors; requiere `trust_remote_code` y `custom_code` |

## Arquitectura y entrenamiento

Reflex-2B es un ajuste fino (finetune) del modelo LiquidAI/LFM3-VL-2B, un modelo multimodal de tipo image-text-to-text. La arquitectura subyacente corresponde a la familia LFM3-VL de Liquid AI, etiquetada en el repositorio como `lfm3_vl`, e incluye código personalizado (`custom_code`) que requiere `trust_remote_code` para su carga. No se especifican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO.

La innovación principal declarada es la orientación a "system-1": el modelo produce directamente JSON conforme a un esquema definido por el usuario, sin esquema fijo, gestionando tipos complejos (objetos anidados, listas, enumerados) y resolviendo fechas relativas mediante un parámetro `reference_date`. El pipeline de inferencia recomendado usa vLLM con decodificación restringida (el backend de transformers requiere `xgrammar`), lo que garantiza la conformidad con el esquema JSON.

## Capacidades

- Extracción de datos estructurados desde imágenes, escaneos, capturas de pantalla, PDF y texto plano.
- Salida JSON tipada conforme a un esquema definido por el usuario, sin esquema fijo predefinido.
- Tipos de campo soportados: text, number, date, time, datetime, boolean, enum, object y list.
- Procesamiento de PDF multipágina con tablas largas, manteniendo el orden de las filas entre páginas.
- Lectura híbrida: páginas con capa de texto se procesan como texto y las escaneadas como imágenes (modo forzable con `mode="image"` o `mode="text"`).
- Manejo de múltiples imágenes como páginas de un mismo documento.
- Respuesta a preguntas sobre una página mediante descripciones de campo formuladas como preguntas.
- Clasificación y decisiones mediante campos de tipo enum y boolean (por ejemplo, tipo de contrato, renovación automática).
- Resolución de fechas relativas ("next Friday") usando `reference_date`.
- Devuelve confianza por valor y la página de origen de cada valor extraído.
- Capacidades multilingües: solo se declara inglés; el ejemplo de la model card muestra extracción de texto en japonés, pero no hay declaración oficial de soporte.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso tipo agente.

## Casos de uso

- Automatización de cuentas por pagar: extracción de número de factura, proveedor, fecha, moneda, total e impuestos desde PDF y fotos de facturas, devolviendo JSON listo para insertar en un ERP.
- Digitalización de tickets y recibos: procesamiento de fotos de móvil de recibos con campos como establecimiento, fecha y total, aprovechando la robustez ante imágenes no perfectas.
- Procesamiento de extractos bancarios multipágina: extracción de listas de transacciones (fecha, descripción, importe) de PDF con tablas largas, conservando el orden de filas entre páginas.
- Análisis de contratos: clasificación del tipo de contrato (empleo, arrendamiento, servicios, NDA), detección de renovación automática, plazo de preaviso y ley aplicable mediante campos enum, boolean y number.
- Extracción de datos de correos electrónicos: conversión de un email en campos tipados (fecha de evento, presupuesto, moneda, asistentes, contacto) usando `reference_date` para resolver fechas relativas.
- Respuesta a preguntas sobre documentos: uso de descripciones de campo como preguntas ("¿Cuál es el nombre de la universidad?", "¿Está firmada la carta?") para tareas de QA documental ligera.
- Procesamiento de capturas de pantalla de pedidos: extracción de identificador de pedido, fecha de entrega y número de artículos desde imágenes en memoria (PIL), útil en automatizaciones de comercio electrónico.
- Enriquecimiento de pipelines de datos: integración vía `reflex_runtime` con backends OpenAI-compatibles (vLLM) o transformers para procesar lotes de documentos de forma programática.

## Benchmarks y rendimiento

| Benchmark | Métrica | Reflex-2B | Clairic Flash 9B |
|---|---|---|---|
| SROIE 2019 test (240 recibos) | Campos correctos | 92,6% | 89,3% |
| DocVQA validation (500 preguntas) | ANLS | 0,933 | 0,920 |

Según el autor, ambos modelos se ejecutaron sobre los mismos documentos con el mismo evaluador. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de ~2B parámetros, en FP16 se requieren aproximadamente 4 GB de pesos; en cuantización de 8 bits, unos 2 GB; en 4 bits, alrededor de 1 GB, más el coste de memoria del procesador visual y del contexto.
- GPU recomendadas: no especificadas por el autor. El despliegue documentado es con vLLM, que requiere GPU (por ejemplo, A100, H100 o RTX 4090); no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por tamaño, un modelo de ~2B en FP16 podría caber en GPU de consumo con 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: vLLM (recomendado, con `--trust-remote-code --max-model-len 16384`) y transformers con el backend `HFBackend` de `reflex_runtime` (requiere `torch`, `transformers` y `xgrammar`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SROIE (campos correctos) | DocVQA (ANLS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Reflex-2B | ~2B | no disponible (ejemplo con 16384) | 92,6% | 0,933 | lfm1.0 | Hugging Face (gradients-ai-1/Reflex-2B) |
| Clairic Flash 9B | ~9B | no disponible | 89,3% | 0,920 | no disponible | no disponible |
| LiquidAI/LFM3-VL-2B (modelo base) | ~2B | no disponible | no disponible | no disponible | lfm1.0 | Hugging Face |

La única comparación publicada por el autor es frente a Clairic Flash 9B, sobre el que no se dispone de más datos en la información proporcionada. No se dispone de comparaciones con otros modelos de extracción documental.

## Limitaciones y advertencias

- Solo se declara inglés como idioma soportado; el rendimiento en otros idiomas no está garantizado, aunque el ejemplo de la model card muestra una extracción en japonés.
- Riesgo de alucinación inherente a los modelos generativos: los valores extraídos pueden ser incorrectos o inventados, especialmente en documentos de baja calidad, letra manuscrita o tablas complejas. El campo `confidence` por valor ayuda a mitigarlo, pero no lo elimina.
- La licencia lfm1.0 (etiquetada como `other`) puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- Requiere `trust_remote_code` y código personalizado, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- No se documentan sesgos conocidos ni evaluaciones de robustez más allá de los dos benchmarks reportados.
- No se especifican límites de longitud de contexto oficiales; el ejemplo de despliegue limita a 16384 tokens, lo que puede ser insuficiente para documentos muy largos.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, por lo que no es adecuado como agente general.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gradients-ai-1/Reflex-2B
- Modelo base LiquidAI/LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia LFM1.0 (referenciada en el repositorio como LICENSE): https://huggingface.co/gradients-ai-1/Reflex-2B/blob/main/LICENSE
- Documentación de vLLM: https://docs.vllm.ai
- Documentación de xgrammar: https://github.com/mlc-ai/xgrammar
