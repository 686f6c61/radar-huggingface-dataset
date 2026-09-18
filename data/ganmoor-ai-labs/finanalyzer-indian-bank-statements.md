# ganmoor-ai-labs/finanalyzer-indian-bank-statements

## Resumen

FinAnalyzer — Indian Bank Statement Extraction Model es un modelo de extracción de documentos desarrollado por ganmoor-ai-labs. Se trata de un ajuste fino mediante LoRA sobre Qwen/Qwen3-4B-Instruct-2507 (Apache-2.0) cuyo único cometido es convertir el texto de una página de extracto bancario o de tarjeta de crédito india en un objeto JSON estricto y verificable: cabecera de cuenta más una lista de transacciones con fecha ISO-8601, narración literal, tipo (débito/crédito), importe y saldo corriente. El problema que resuelve es doble: por un lado, la extracción estructurada de documentos financieros heterogéneos; por otro, el requisito de privacidad, ya que el modelo está diseñado para ejecutarse íntegramente en local (teléfono o servidor pequeño) sin que el extracto salga del dispositivo.

El modelo tiene 4.022.468.096 parámetros (4B) y se distribuye exclusivamente en formato GGUF cuantizado, con dos builds: Q8_0 (4,0 GB, recomendado) y Q4_K_M (2,4 GB, orientado a despliegue en teléfono). El entrenamiento se realizó con 10.000 extractos indios sintéticos —sin datos reales de clientes— con LoRA de rango 16 sobre todas las proyecciones de atención y MLP, pérdida solo sobre turnos del asistente y modo «thinking» desactivado.

Su relevancia actual reside en el planteamiento de fiabilidad: el modelo únicamente transcribe, y una capa determinista independiente (código puro) verifica la aritmética del libro mayor (`opening + Σcréditos − Σdébitos == closing`, coherencia saldo anterior ± importe == saldo, fechas monótonas dentro del periodo). Si alguna invariante falla, la extracción se marca para revisión. Esto permite que una aplicación de finanzas personales confíe en las cifras sin depender de que el modelo sepa sumar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA (rango 16, atención + proyecciones MLP) |
| Parámetros totales | 4.022.468.096 (4B) |
| Longitud de contexto | No disponible como especificación del ajuste; la configuración de referencia del autor usa `-c 6144` en llama-server y procesa una página de extracto por petición |
| Tipos de cuantización | GGUF: Q8_0 (4,0 GB, recomendado) y Q4_K_M (2,4 GB, clase teléfono) |
| Idiomas soportados | Inglés (en) e hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el repositorio no publica safetensors; tamaño del repo: 6,8 GB) |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros, sobre el que se aplicó un ajuste LoRA de rango 16 sobre todas las proyecciones de atención y de MLP. La pérdida se calculó únicamente sobre los turnos del asistente (*assistant-only loss*) y el modo de razonamiento extendido («thinking») se desactivó, de modo que la salida es directamente el JSON y no una cadena de razonamiento seguida del JSON. El contrato de inferencia es de una página de extracto por petición, con un system prompt fijo que define el esquema (cabecera en la primera página, solo transacciones en las siguientes) e instruye explícitamente a no inventar valores ausentes y a emitir `null` cuando un campo no exista.

El entrenamiento se realizó íntegramente con 10.000 extractos bancarios indios **sintéticos**, sin datos reales de clientes. Los bancos cubiertos en entrenamiento son HDFC, SBI, ICICI y Axis (cuentas de ahorro) más HDFC e ICICI (tarjeta de crédito). La innovación técnica destacable no está en la arquitectura sino en el diseño del sistema: el modelo solo transcribe cifras que ya aparecen en el texto fuente y una capa determinista separada, que se distribuye junto con el modelo, valida las invariantes aritméticas del libro mayor (±0,01) y marca para revisión cualquier extracción incoherente. No se mencionan técnicas de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Extracción estructurada a JSON estricto de una página de extracto bancario o de tarjeta de crédito india.
- Normalización de fechas a ISO-8601 y de importes a número (sin símbolo ₹ ni separadores de lakh), con reconstrucción de narraciones partidas en varias líneas.
- Emisión de cabecera de cuenta para cuentas de ahorro y corriente: banco, tipo de documento, número de cuenta, titular, IFSC, periodo, saldo inicial y saldo final.
- Emisión de cabecera específica para tarjeta de crédito: número de tarjeta enmascarado, total a pagar, pago mínimo y límite de crédito.
- Extracción transaccional: fecha, narración literal, referencia, tipo (débito/crédito), importe y saldo corriente, con `null` en campos ausentes.
- Verificación determinista externa del libro mayor (cuadre de saldos, coherencia fila a fila, monotonía de fechas), distribuida como código separado del modelo.
- Ejecución totalmente offline y on-device, sin envío de datos a servicios externos.
- Idiomas declarados: inglés e hindi (las narraciones bancarias indias suelen estar en inglés).
- No se documentan capacidades de tool calling, function calling, uso agéntico, visión, audio ni matemáticas generales: el modelo está especializado en una única tarea de transcripción estructurada.

## Casos de uso

- Extracción de transacciones en una aplicación de finanzas personales offline: el modelo procesa página a página el PDF o el texto del extracto y devuelve JSON listo para persistir en la base de datos local, sin que el documento salga del teléfono.
- Despliegue on-device en Android o iOS con la build Q4_K_M (2,4 GB): permite conciliación de gastos automática en el propio dispositivo para usuarios de bancos soportados (HDFC, SBI, ICICI, Axis), con la capa determinista validando los saldos.
- Backend de ingestión documental para asesores financieros o gestores patrimoniales: llama-server con la build Q8_0 atiende peticiones por página con API compatible con OpenAI, lo que facilita integrarlo en un pipeline existente sin reescribir clientes.
- Auditoría y conciliación contable de cuentas corrientes empresariales: la verificación de invariantes (`opening + Σcréditos − Σdébitos == closing`, saldo anterior ± importe == saldo) marca automáticamente las páginas dudosas para revisión humana, reduciendo el trabajo de cuadre manual.
- Digitalización retrospectiva de archivos de extractos: al aceptar una página de texto por petición, puede recorrerse un lote de PDFs de varios años, generando un libro mayor unificado con fechas ISO normalizadas.
- Procesamiento de extractos de bancos no vistos en entrenamiento (Kotak, Canara u otros) con la build Q8_0: la exactitud de los campos que llevan dinero (fecha, importe, saldo) se mantiene cerca del 100 % en la evaluación fuera de distribución, aunque la narración literal puede degradarse.
- Ingestión de extractos de tarjeta de crédito para cálculo de pago mínimo y límite disponible: el modelo emite los campos específicos (`card_number_masked`, `total_due`, `min_due`, `credit_limit`) en lugar de los de saldo.
- Módulo de extracción dentro de un producto SaaS financiero con garantías de privacidad: al ejecutarse en la infraestructura del cliente, evita transferencias de datos financieros a terceros y simplifica el cumplimiento normativo.

## Benchmarks y rendimiento

Los resultados publicados por el autor distinguen entre coincidencia exacta a nivel de transacción (todos los campos correctos: fecha, narración, tipo, importe, saldo) y *value match* (subconjunto crítico: fecha, tipo, importe y saldo; la narración se ignora).

Distribución de entrenamiento (bancos soportados, clientes no vistos):

| Split | Exact | Fecha | Importe | Saldo | Tipo |
|---|---|---|---|---|---|
| Validación (bf16) | 99,9 % | 100 % | 100 % | 100 % | 99,8 % |
| Validación (Q4_K_M) | 99,6 % | 100 % | 100 % | 100 % | 99,8 % |

Generalización fuera de distribución (bancos nunca vistos en entrenamiento):

| Split | Exact | Value | Importe | Saldo |
|---|---|---|---|---|
| Bancos reservados — Kotak, Canara (bf16) | 94,5 % | 99,3 % | 100 % | 100 % |
| Bancos reservados (Q8_0) | 94,9 % | ~99 % | 100 % | 100 % |

Benchmark externo independiente (dataset [AgamiAI/Indian-Bank-Statements](https://huggingface.co/datasets/AgamiAI/Indian-Bank-Statements), ~6.500 transacciones en 40 extractos multipágina, bancos ficticios y estilos de narración nunca vistos):

| Variante | Paridad de recuento de transacciones | Value match |
|---|---|---|
| Digital Type 1 | 3232 / 3232 | 93,9 % |
| Digital Type 2 | 3234 / 3226 | 95,0 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 2,4 GB de pesos (aproximadamente 3-4 GB de memoria total con contexto y overhead); Q8_0 ocupa 4,0 GB (aproximadamente 5-6 GB en total).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q8_0 (RTX 3060, RTX 4060, RTX 4090, A100, H100); las GPUs de datacenter son sobredimensionadas para este tamaño.
- Inferencia en CPU: viable, especialmente con Q4_K_M; el autor plantea ejecución en teléfono de gama adecuada, en modo totalmente offline.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 6 GB o más de VRAM; con Q4_K_M incluso en 4 GB.
- Opciones de despliegue: llama.cpp / llama-server (OpenAI-compatible), con el comando de referencia `llama-server -m finanalyzer-q8_0.gguf --port 8091 -c 6144 --parallel 1 -ngl 99`; build con CUDA para GPU. No se confirma en la documentación soporte para vLLM, TGI, Ollama u otros motores.
- Configuración de contexto: `-c 6144` y `--parallel 1` en el ejemplo del autor; una página por petición.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinAnalyzer Indian Bank Statements | 4B (4.022.468.096) | No especificado; configuración de referencia 6144 tokens | Extracción JSON de extractos bancarios indios | Apache-2.0 | GGUF (Q8_0, Q4_K_M) en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B | No disponible en la información proporcionada | Propósito general, instrucciones | Apache-2.0 | Peso completo en HuggingFace |
| Otras alternativas de extracción documental de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la información proporcionada no incluye benchmarks ni especificaciones de otros modelos de extracción de extractos bancarios indios que permitan una comparación directa.

## Limitaciones y advertencias

- Cobertura limitada de bancos: el entrenamiento cubre HDFC, SBI, ICICI y Axis en cuentas de ahorro, y HDFC e ICICI en tarjeta de crédito. En bancos no vistos la coincidencia exacta baja al entorno del 94-95 % y la narración literal es el campo que más se degrada.
- Degradación de Q4_K_M fuera de distribución: en layouts desconocidos (por ejemplo, indicadores DR/CR en columna única) la clasificación débito/crédito se debilita y la exactitud fuera de distribución cae a ~80 %. El autor recomienda Q8_0 cuando importa la robustez ante layouts desconocidos.
- Riesgo de alucinación: el contrato exige que toda cifra emitida aparezca ya en el texto fuente, pero el modelo sigue siendo un modelo de lenguaje; la mitigación real depende de la capa determinista externa, que debe desplegarse junto con el modelo. Sin esa capa, la fiabilidad de las cifras no está garantizada.
- Datos de entrenamiento sintéticos: al no haberse usado extractos reales, pueden existir rarezas de documentos reales (formatos de impresión, artefactos de OCR, caracteres corruptos) no cubiertas por la distribución sintética.
- Restricción operativa: una página de extracto por petición y configuración de referencia con `--parallel 1`; no está pensado para lote concurrente de alta densidad.
- Idiomas: solo inglés e hindi declarados; no se documenta rendimiento en otras lenguas ni en narraciones no latinas.
- Validación comunitaria inexistente: el modelo registra 0 descargas y 0 «likes» en el momento de la consulta, con fecha de creación y actualización muy recientes; no hay revisión independiente más allá del benchmark externo citado por el autor.
- Licencia: Apache-2.0, que permite uso comercial, modificación y redistribución, siempre manteniendo el aviso de licencia y los términos del modelo base Qwen3-4B-Instruct-2507 (también Apache-2.0).
- No apto para otras tareas de NLP: el ajuste está especializado en un único esquema JSON; no se documentan capacidades de razonamiento general, código, matemáticas, visión ni uso agéntico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ganmoor-ai-labs/finanalyzer-indian-bank-statements
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de evaluación externo: https://huggingface.co/datasets/AgamiAI/Indian-Bank-Statements
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (únicamente páginas comerciales de portátiles Lenovo ThinkPad T14 Gen 5, sin relación con el modelo).
