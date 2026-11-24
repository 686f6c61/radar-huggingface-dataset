# Ernes14AG/qwen3-0.6b-facturas-GGUF

## Resumen

Qwen3-0.6B · extractor de facturas a JSON (v2) es un modelo de lenguaje especializado en la extracción estructurada de datos de facturas, tickets y correos de proveedor, convirtiendo texto libre (típicamente la salida de un OCR) en un objeto JSON con un esquema fijo. Lo desarrolla el usuario independiente Ernes14AG mediante un ajuste con LoRA sobre el modelo base Qwen3-0.6B, y se distribuye en formato GGUF cuantizado para su uso directo con Ollama.

El modelo resuelve un problema muy concreto de automatización documental: la conversión fiable de documentos contables a datos estructurados con campos como proveedor, NIF, número de factura, fecha, líneas de detalle, base imponible, IVA, IRPF y total. La versión v2 amplía la v1 con soporte para campos vacíos representados como `null`, descuentos por línea, retención de IRPF de autónomos y facturas en catalán e inglés, además de cientos de proveedores distintos.

Con 596.049.920 parámetros totales (aproximadamente 0,6 mil millones) y una licencia Apache 2.0, el modelo es relevante por su relación entre tamaño mínimo, coste de inferencia muy bajo y alto rendimiento en una tarea acotada: según la model card, alcanza un 98% de facturas perfectas sobre un conjunto de 80 facturas sintéticas no vistas durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B, ajustado con LoRA) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF cuantizado (la model card ejemplifica con Q8_0; no se detalla el conjunto completo de variantes publicadas) |
| Idiomas soportados | Espanol, catalan, ingles (segun la model card; el campo de idiomas de Hugging Face solo lista `es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); pesos completos en safetensors en el repo base `Ernes14AG/qwen3-0.6b-facturas` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen3-0.6B y se especializa mediante un ajuste con LoRA sobre 500 facturas sintéticas en español, catalán e inglés. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card únicamente indica el uso de datos sintéticos y la ampliación de la v2 a cientos de proveedores distintos.

La innovación principal no es arquitectónica, sino de especialización y de formato de salida: el modelo está entrenado para devolver directamente un JSON con esquema fijo, con reglas explícitas de normalización (campos ausentes o vacíos como `null`, descuentos e IRPF a `0` si no se mencionan, copia literal de proveedor y descripción). La model card advierte además que conviene desactivar el razonamiento de Qwen3 (`--think=false` o `think=False`) para obtener la respuesta JSON directa, más rápida y sin cadena de pensamiento innecesaria.

## Capacidades

- Generación de texto especializada en extracción de datos estructurados a partir de texto de facturas, tickets y correos de proveedor.
- Salida en JSON con esquema fijo: `proveedor`, `nif`, `numero_factura`, `fecha` (formato AAAA-MM-DD), `lineas` (con `descripcion`, `cantidad`, `precio_unitario`, `descuento_porcentaje`), `base_imponible`, `iva_porcentaje`, `irpf_porcentaje` y `total`.
- Manejo de campos vacíos o ausentes mediante `null`, sin cálculo de valores no presentes.
- Soporte de descuentos por línea y de retención de IRPF de autónomos.
- Capacidades multilingües limitadas al ámbito de la tarea: español, catalán e inglés.
- Integración con Ollama mediante el tag GGUF y con Python a través de la librería `ollama`, incluyendo el parámetro `format="json"`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícitos más allá del modo thinking heredado de Qwen3, que la model card recomienda desactivar.

## Casos de uso

- Automatización de la contabilidad de proveedores: el modelo recibe la salida de un OCR de facturas y devuelve un JSON listo para insertar en un ERP o en una base de datos, con campos como NIF, número de factura y total ya normalizados.
- Gestión de gastos y tickets: procesamiento por lotes de tickets y facturas simplificadas para extraer líneas, base imponible e IVA, aprovechando el soporte de descuentos por línea y de campos vacíos.
- Validación y conciliación de facturas: comparación del JSON extraído con los datos maestros del proveedor para detectar discrepancias en NIF, importes o fechas antes de contabilizar.
- Procesamiento de correos de proveedor: extracción de datos de facturación embebidos en el cuerpo del correo o en texto plano, sin necesidad de un parser específico por proveedor.
- Digitalización de facturas de autónomos: cálculo del IRPF retenido gracias al campo `irpf_porcentaje`, que la v2 incorpora específicamente para este caso.
- Entornos con recursos limitados o despliegue local: al tratarse de un modelo de 0,6 mil millones de parámetros en GGUF, puede ejecutarse en CPU o en GPU de consumo para pipelines de extracción de alto volumen y bajo coste.
- Procesamiento multilingüe en el ámbito contable: facturas en español, catalán e inglés dentro de un mismo flujo de trabajo, útil en empresas con proveedores de distintas comunidades autónomas o internacionales.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 80 facturas de prueba no vistas durante el entrenamiento, comparando el modelo base con la v2:

| Métrica | Modelo base | v2 |
|---|---|---|
| JSON válido | 95% | 100% |
| proveedor | 79% | 100% |
| nif | 76% | 100% |
| numero_factura | 78% | 100% |
| fecha | 39% | 99% |
| lineas | 42% | 99% |
| base_imponible | 88% | 100% |
| iva_porcentaje | 90% | 100% |
| irpf_porcentaje | 94% | 100% |
| total | 88% | 100% |
| FACTURA PERFECTA | 8% | 98% |

Facturas perfectas por tipo en la v2:

| Tipo | v2 | Facturas |
|---|---|---|
| español | 100% | 44 |
| catalán | 92% | 12 |
| inglés | 96% | 24 |
| con campos vacíos | 97% | 32 |
| con IRPF | 94% | 17 |
| con descuento | 91% | 23 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (596 millones de parámetros). En Q8_0 el peso de los pesos ronda los 0,6 GB; en cuantizaciones de 4 bits sería inferior, aunque no se detallan los tamaños exactos de cada variante en la información disponible.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; el modelo está pensado para ejecutarse incluso en CPU. GPU de consumo como RTX 3060, RTX 4060 o superiores lo ejecutan con holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales, e incluso en CPU.
- Opciones de despliegue: Ollama (soporte documentado con `ollama run` y `ollama.generate`), y por extensión otras herramientas compatibles con GGUF como llama.cpp. No se documenta soporte específico de vLLM o TGI para esta variante GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de 0,6 mil millones de parámetros, la latencia esperada es baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B · extractor de facturas (v2) | 596 M | No disponible | Extracción de facturas a JSON (es/ca/en) | Apache 2.0 | GGUF en Hugging Face, uso con Ollama |
| Qwen3-0.6B (base) | 0,6 B | No disponible en la información | Modelo generalista | Apache 2.0 | Hugging Face |
| v1 del mismo autor (`qwen3-0.6b-facturas`, revisión `v1`) | 596 M | No disponible | Extracción de facturas solo en español, 12 proveedores, sin campos vacíos | Apache 2.0 | Pesos completos en Hugging Face |

No se dispone de información sobre otros modelos especializados comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con datos sintéticos: con facturas reales y formatos muy distintos la precisión será menor que la reportada en la model card.
- La entrada debe ser texto; para fotos o PDF escaneados es necesario aplicar antes un OCR.
- El contexto máximo no está documentado, lo que impide garantizar el comportamiento con facturas muy largas o con muchas líneas de detalle.
- El soporte multilingüe se limita a español, catalán e inglés; el campo de idiomas de Hugging Face solo declara `es`, lo que puede generar discrepancias en herramientas que lean ese metadato.
- Es necesario desactivar el modo thinking de Qwen3 (`--think=false` o `think=False`); de lo contrario, el modelo puede activar razonamiento, con mayor latencia y salida no deseada.
- Riesgo de alucinación en campos no presentes: aunque la v2 está entrenada para devolver `null`, no se documenta una evaluación específica de falsos positivos en campos ausentes más allá de la métrica de facturas perfectas.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a entradas adversariales.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B del que deriva.
- El repositorio GGUF tiene un tamaño de 1,3 GB, coherente con varias cuantizaciones, pero no se detalla qué variantes exactas están publicadas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas-GGUF
- Pesos completos (modelo base del ajuste): https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas
- Repositorio de Ollama para el modelo: `hf.co/Ernes14AG/qwen3-0.6b-facturas-GGUF:Q8_0`
- No se han encontrado otros enlaces (papers, blogs, demos o repositorios) en la información disponible.
