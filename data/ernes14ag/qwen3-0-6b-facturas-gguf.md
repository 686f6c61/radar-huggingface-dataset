# Ernes14AG/qwen3-0.6b-facturas-GGUF

## Resumen

Qwen3-0.6B-facturas es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3-0.6B, desarrollado por Ernes14AG, especializado en la extracción estructurada de datos de facturas, tickets y correos de proveedor en español. El modelo recibe texto plano (típicamente la salida de un OCR) y devuelve un objeto JSON con un esquema fijo que incluye proveedor, NIF, número de factura, fecha, líneas de detalle, base imponible, porcentaje de IVA y total. El ajuste se realizó sobre 200 facturas sintéticas generadas a partir de 12 proveedores ficticios.

El modelo resuelve un problema muy concreto del ámbito administrativo y contable: convertir documentos no estructurados en registros normalizados aptos para un ERP o un pipeline de contabilidad. Con solo 596 millones de parámetros, el modelo está pensado para ejecutarse en local con requisitos de hardware mínimos, lo que lo hace adecuado para escenarios de privacidad estricta donde no se pueden enviar facturas a una API externa.

La relevancia actual del modelo radica en su enfoque de nicho: en lugar de competir en capacidades generales, sacrifica amplitud por precisión en una tarea acotada con formato de salida garantizado. El autor reporta un 88 % de facturas perfectas en un conjunto de prueba de 40 facturas no vistas durante el entrenamiento y un 100 % de JSON válido. La licencia Apache 2.0 y la disponibilidad en formato GGUF para Ollama facilitan su adopción en entornos de producción pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) con adaptador LoRA |
| Parámetros totales | 596.049.920 (≈0,6 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B, no especificada en la model card) |
| Tipos de cuantización | GGUF (se menciona explícitamente Q8_0; otras variantes no confirmadas) |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en el repo de pesos completos |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ajusta mediante LoRA (Low-Rank Adaptation) para una tarea de extracción de información con salida JSON estructurada. El ajuste se realizó sobre 200 facturas sintéticas en español, generadas a partir de 12 proveedores ficticios, lo que constituye un conjunto de entrenamiento muy pequeño y de dominio restringido. No se especifican en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; dado el tamaño del conjunto y la naturaleza de la tarea, es probable que el ajuste se limitara a aprendizaje supervisado sobre pares entrada-salida, pero este dato no está confirmado.

La innovación técnica principal no reside en la arquitectura, sino en el formato de salida: el modelo está entrenado para responder directamente con el JSON, sin cadena de razonamiento previa. Esto es relevante porque el modelo base Qwen3 incorpora un modo de razonamiento (thinking mode) que, en esta tarea, solo añadiría latencia sin mejorar la precisión. El autor insiste en desactivar dicho modo (`--think=false` en Ollama, `think=False` en la API de Python) y recomienda usar el parámetro `format="json"` para garantizar la validez sintáctica de la salida. No se documentan otras innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de entidades y campos estructurados desde texto de facturas, tickets y correos de proveedor en español.
- Generación de JSON con esquema fijo: proveedor, NIF, número de factura, fecha (formato AAAA-MM-DD), líneas de detalle (descripción, cantidad, precio unitario), base imponible, porcentaje de IVA y total.
- Normalización de fechas al formato ISO (AAAA-MM-DD) a partir de formatos variados en la entrada.
- Conversión de importes con formato español (coma decimal, símbolo €) a valores numéricos float.
- Salida JSON válida garantizada cuando se usa el parámetro `format="json"` en la API de Ollama.
- Ejecución local sin conexión a servicios externos, apta para entornos con requisitos de privacidad.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento general; el modelo está especializado exclusivamente en la tarea de extracción.

## Casos de uso

- Automatización de la contabilidad de pymes: el modelo recibe el texto extraído por OCR de facturas de proveedores y devuelve JSON listo para insertar en un ERP o en una hoja de cálculo, eliminando la introducción manual de datos. Su tamaño reducido permite ejecutarlo en el propio servidor de la empresa sin enviar documentos a terceros.
- Digitalización de tickets de gasto: en una aplicación móvil o web, el usuario fotografía un ticket, un OCR local extrae el texto y el modelo lo convierte en JSON estructurado para justificar gastos o generar informes de dietas.
- Procesamiento por lotes de correos de proveedor: un script recorre el buzón de facturación, extrae el cuerpo de texto de cada correo, lo pasa al modelo y almacena los registros normalizados en una base de datos, con validación posterior de los campos críticos (NIF, total).
- Validación y conciliación de facturas: el JSON generado se compara contra los pedidos de compra o los apuntes bancarios; las discrepancias en importes o NIF se marcan para revisión humana. La salida estructurada facilita esta comparación automatizada.
- Extracción de datos para cumplimiento fiscal: en gestorías y asesorías, el modelo acelera la clasificación de facturas recibidas por trimestre, generando registros homogéneos para los libros de IVA y las declaraciones.
- Prototipado rápido de pipelines de extracción documental: al ser un GGUF de 0,6 GB ejecutable con Ollama, sirve como base para validar un flujo OCR + extracción + validación antes de invertir en un modelo mayor o en un servicio en la nube.
- Entornos con requisitos estrictos de privacidad: despachos, clínicas o administraciones que no pueden externalizar documentos financieros pueden desplegar el modelo en local con hardware modesto.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card, evaluados sobre 40 facturas de prueba no vistas durante el entrenamiento:

| Métrica | Resultado |
|---|---|
| Facturas perfectas (todos los campos correctos) | 88 % |
| JSON válido | 100 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Tampoco se proporcionan métricas desagregadas por campo (precisión en NIF, fecha, importes) ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantización Q8_0 (el repo completo ocupa 0,6 GB); en cuantizaciones menores (Q4_K_M, Q5_K_M) el consumo sería aún más reducido, aunque el autor solo menciona explícitamente Q8_0.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas como RTX 3060, RTX 4060, GTX 1660 o incluso en iGPU con memoria compartida. Para despliegues de mayor volumen, una A100 o H100 estaría sobredimensionada para un solo modelo, pero permitiría servir muchas instancias concurrentes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos años y en CPU con suficiente RAM (menos de 1 GB en Q8_0).
- Opciones de despliegue: Ollama (soporte oficial en la model card, con el tag `hf.co/Ernes14AG/qwen3-0.6b-facturas-GGUF:Q8_0`), llama.cpp (formato GGUF), y la API de Python de Ollama. Para los pesos completos en safetensors, transformers con el adaptador LoRA correspondiente.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por factura en GPU consumer, pero este dato no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-0.6B-facturas (este modelo) | 0,6 B | no disponible | Extracción de facturas a JSON en español | Apache 2.0 | GGUF, safetensors |
| Qwen3-0.6B (base) | 0,6 B | no disponible | Propósito general, multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible | Propósito general, instrucciones | Apache 2.0 | safetensors, GGUF |
| Modelos de extracción documental de mayor tamaño (p. ej. familia Qwen2.5-7B-Instruct) | 7 B | no disponible | Propósito general con capacidad de extracción | Apache 2.0 | safetensors, GGUF |

La comparación directa con alternativas especializadas en extracción de facturas en español no está disponible en la información proporcionada. Frente al modelo base Qwen3-0.6B, este ajuste gana en precisión para la tarea concreta y en formato de salida garantizado, pero pierde capacidades generales y multilingües. Frente a modelos de 7 B o superiores, ofrece menores requisitos de hardware y mayor velocidad, a costa de una capacidad de generalización presumiblemente inferior ante formatos de factura no vistos.

## Limitaciones y advertencias

- Entrenado exclusivamente con facturas sintéticas de 12 proveedores ficticios: la precisión con facturas reales y formatos muy distintos será previsiblemente menor que el 88 % reportado en el conjunto de prueba sintético.
- La entrada debe ser texto plano; no procesa imágenes ni PDF escaneados directamente. Es necesario aplicar un OCR previo, cuyos errores se propagarán a la extracción.
- El conjunto de evaluación es muy pequeño (40 facturas), por lo que el 88 % de facturas perfectas tiene un intervalo de confianza amplio y no debe extrapolarse sin validación en el dominio real de uso.
- Riesgo de alucinación en campos ausentes o ambiguos: si la factura no incluye un NIF o una fecha reconocible, el modelo podría inventar un valor plausible en lugar de indicar su ausencia. No se documenta el comportamiento en estos casos.
- Soporte únicamente en español; no se ha entrenado ni evaluado en otros idiomas.
- El modelo base Qwen3 incorpora un modo de razonamiento que debe desactivarse explícitamente (`--think=false` o `think=False`); si se deja activado, la latencia aumenta y la salida puede no ajustarse al formato esperado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe. No se documentan restricciones adicionales del autor.
- Para producción, se recomienda validar la salida JSON contra un esquema (por ejemplo, con pydantic o jsonschema) y aplicar reglas de negocio sobre los campos críticos antes de insertar los datos en sistemas contables.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas-GGUF
- Pesos completos (transformers): https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
