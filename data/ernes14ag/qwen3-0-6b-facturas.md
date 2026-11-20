# Ernes14AG/qwen3-0.6b-facturas

## Resumen

Qwen3-0.6B-facturas es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-0.6B de Alibaba, desarrollado por el usuario Ernes14AG, especializado en una única tarea: convertir el texto de facturas, tickets y correos de proveedor en un JSON con estructura fija. El modelo parte de la arquitectura transformer densa de Qwen3 con aproximadamente 596 millones de parámetros y se ha ajustado mediante LoRA sobre 500 facturas sintéticas en español, catalán e inglés. La versión v2, publicada en noviembre de 2026, amplía la v1 con soporte para campos vacíos (que se devuelven como `null`), descuentos por línea, retención de IRPF de autónomos y facturas en catalán e inglés.

El modelo resuelve un problema muy concreto y frecuente en automatización contable: la extracción estructurada de datos a partir de documentos no estructurados. En lugar de emplear un LLM grande de propósito general, que resultaría más caro y lento, este ajuste de 0,6B parámetros cabe en hardware modesto y responde directamente con el JSON, sin razonamiento intermedio si se desactiva el modo thinking de Qwen3.

Su relevancia radica en la combinación de tamaño reducido, licencia Apache 2.0 y resultados declarados por el autor muy altos (98% de facturas perfectas en el conjunto de prueba). Es una pieza adecuada para pipelines de OCR más extracción estructurada, aunque la naturaleza sintética de los datos de entrenamiento exige validación previa en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3), ajuste fino con LoRA |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variante Q8_0 publicada en el repo GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | español, catalán, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo secundario para Ollama) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B, que incorpora en su versión base un modo de razonamiento (thinking) opcional. Sobre esa base se aplicó un ajuste fino con LoRA orientado a una tarea de extracción estructurada, no a generación libre. El conjunto de entrenamiento lo componen 500 facturas sintéticas en español, catalán e inglés, con una amplia variedad de proveedores, campos vacíos, descuentos por línea y retención de IRPF. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; el ajuste parece ser supervisado (SFT) sobre pares texto-factura a JSON.

La innovación principal no es arquitectónica sino de formato y comportamiento: el modelo está condicionado para responder directamente con un JSON de esquema fijo, sin texto adicional, y para usar `null` en campos ausentes en lugar de inventar valores. El autor recomienda explícitamente desactivar el modo thinking de Qwen3 (`--think=false` en Ollama) para evitar razonamiento innecesario y acelerar la respuesta. El esquema de salida incluye proveedor, NIF, número de factura, fecha (formato AAAA-MM-DD), líneas con descripción, cantidad, precio unitario y descuento porcentual, además de base imponible, IVA, IRPF y total.

## Capacidades

- Extracción estructurada de datos de facturas, tickets y correos de proveedor a un JSON de esquema fijo.
- Generación de JSON válido en el 100% de los casos según las pruebas del autor.
- Manejo de campos vacíos o ausentes devolviendo `null` en lugar de valores inventados.
- Soporte de descuentos por línea (`descuento_porcentaje`) y retención de IRPF de autónomos (`irpf_porcentaje`).
- Multilingüe en la tarea: español, catalán e inglés.
- Salida directa sin razonamiento intermedio si se desactiva el modo thinking.
- Compatibilidad con el parámetro `format="json"` de Ollama para forzar salida JSON.
- No se documentan capacidades de tool calling, agentes, visión ni audio; la entrada debe ser texto.

## Casos de uso

- Automatización contable: el modelo recibe el texto extraído por OCR de una factura y devuelve el JSON con proveedor, NIF, líneas y totales, listo para volcar en un ERP o sistema de gestión.
- Procesamiento por lotes de tickets de gasto: al ser un modelo de 0,6B, puede ejecutarse en CPU o GPU modesta y procesar grandes volúmenes de tickets con bajo coste por documento.
- Extracción en correos de proveedor: el texto del cuerpo del correo o del adjunto convertido a texto se pasa al modelo para obtener los datos estructurados de la factura sin intervención manual.
- Digitalización de facturas de autónomos: el soporte de IRPF permite calcular correctamente la retención en facturas emitidas por profesionales, un caso frecuente en España.
- Pipelines multilingües: facturas en catalán o inglés se procesan con el mismo modelo, útil para empresas con proveedores internacionales o administraciones bilingües.
- Integración en flujos con Ollama: despliegue local mediante `ollama run` con la variante GGUF Q8_0, adecuado para entornos donde los datos no pueden salir de la infraestructura propia.
- Preprocesado para validación: el JSON generado puede alimentar reglas de validación (suma de líneas, coherencia de IVA) antes de la contabilización definitiva.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 80 facturas de prueba no vistas durante el entrenamiento:

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

Facturas perfectas por tipo (v2):

| Tipo | v2 | Facturas |
|---|---|---|
| español | 100% | 44 |
| catalán | 92% | 12 |
| inglés | 96% | 24 |
| con campos vacíos | 97% | 32 |
| con IRPF | 94% | 17 |
| con descuento | 91% | 23 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son específicas de la tarea de extracción de facturas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 1,2 GB para los pesos (596M parámetros); en cuantización Q8_0 GGUF, en torno a 0,6-0,7 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU.
- Cabe holgadamente en GPU consumer y en equipos de gama baja; es viable incluso en Raspberry Pi o portátiles sin GPU dedicada con llama.cpp.
- Opciones de despliegue: Ollama (variante GGUF Q8_0 publicada), llama.cpp, transformers con safetensors, vLLM y TGI no documentados explícitamente pero compatibles por arquitectura.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un modelo de 0,6B sin razonamiento (con `--think=false`), la latencia esperada es baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-facturas (este) | 596M | no disponible | Extracción de facturas a JSON | Apache 2.0 | Hugging Face, Ollama |
| Qwen/Qwen3-0.6B (base) | 596M | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Modelos de extracción de facturas de mayor tamaño | no disponible | no disponible | Extracción estructurada | variable | no disponible |

La comparación más directa es con el modelo base Qwen3-0.6B, del que este ajuste mejora sustancialmente en la tarea específica (de 8% a 98% de facturas perfectas según el autor), a costa de perder generalidad. No se dispone de información sobre alternativas especializadas comparables en la información proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos: con facturas reales y formatos muy distintos, la precisión será menor que la reportada.
- La entrada debe ser texto; para fotos o PDF escaneados es necesario aplicar antes un OCR.
- El conjunto de prueba es pequeño (80 facturas) y generado por el mismo autor, lo que puede sobreestimar el rendimiento real.
- No se documenta la longitud de contexto soportada, lo que limita la planificación para facturas muy largas.
- El modelo está especializado en una única tarea; no debe usarse para generación libre ni razonamiento general.
- Es necesario desactivar el modo thinking (`--think=false`) para obtener la respuesta JSON directa; de lo contrario, el modelo puede añadir razonamiento innecesario.
- Riesgo de alucinación en campos ausentes si no se respeta el esquema; el entrenamiento con `null` mitiga pero no elimina este riesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud en producción.
- No se documentan sesgos conocidos más allá de los derivados del modelo base y del dataset sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas
- Variante GGUF para Ollama: https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas-GGUF
- Pesos completos (repo alternativo): https://huggingface.co/Ernes14AG/qwen3-0.6b-facturas
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
