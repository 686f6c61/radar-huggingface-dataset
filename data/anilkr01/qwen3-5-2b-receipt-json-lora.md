# anilkr01/qwen3.5-2b-receipt-json-lora

## Resumen

El modelo `anilkr01/qwen3.5-2b-receipt-json-lora` es un adaptador LoRA sobre el modelo base `unsloth/Qwen3.5-2B`, desarrollado por el usuario anilkr01, especializado en la extracción de información estructurada a partir de texto OCR de recibos y facturas. Convierte la salida de un motor OCR en un único objeto JSON con las claves `line_items`, `subtotal`, `tax` y `total`, lo que resuelve el problema de normalizar documentos comerciales ruidosos a un esquema fijo y consumible por sistemas downstream.

La relevancia práctica del modelo reside en su relación coste-rendimiento: un adaptador de 0,1 GB entrenado en unos 30 minutos sobre una GPU T4 gratuita alcanza, según el autor, un rendimiento en el conjunto de test CORD v2 (100 recibos) comparable al de modelos propietarios de gran tamaño como Claude Sonnet 5.5 o Gemini 4 Argon, con intervalos de confianza solapados. Esto lo convierte en una alternativa viable para pipelines de extracción documental de bajo coste y despliegue local.

El adaptador se distribuye bajo licencia Apache 2.0, heredada del modelo base, y está entrenado sobre 800 recibos del split de entrenamiento de CORD v2 en indonesio, con etiquetas mapeadas al esquema JSON de salida. Está pensado para inferencia con el modo de razonamiento (thinking) desactivado y decodificación greedy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B, presentado como modelo visión-lenguaje); adaptador LoRA sobre proyecciones de atención y MLP |
| Parámetros totales | No disponible (adaptador LoRA r16/α16; el modelo base es de 2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El adaptador se entrenó y evaluó en 16 bits (sin cuantización); el modelo base se puede cargar en 4 bits según la librería Unsloth |
| Idiomas soportados | Inglés (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/Qwen3.5-2B`, un modelo de 2B parámetros que Qwen distribuye como modelo visión-lenguaje; el autor lo carga mediante `FastVisionModel` de Unsloth para la ruta de inferencia probada. El ajuste fino emplea LoRA con rango 16 y alpha 16 sobre las proyecciones de atención y MLP del modelo de texto, en precisión de 16 bits y sin cuantización del adaptador. No se modifica el modelo base, por lo que el adaptador es ligero (0,1 GB) y se puede combinar con distintas configuraciones de carga del base.

El entrenamiento usa el split de entrenamiento de CORD v2 en formato de texto OCR (800 recibos, en indonesio), con las etiquetas mapeadas al esquema JSON de salida. El schedule es de 5 épocas (250 actualizaciones), tasa de aprendizaje 2e-4, batch efectivo de 16 (2 × 8 de acumulación de gradientes), pérdida calculada solo sobre la respuesta y fp16 sobre una GPU T4. El modo thinking se desactiva tanto en entrenamiento como en inferencia. Se entrenaron tres semillas (1234, 3407 y 42) de forma idéntica; la publicada es la semilla 1234 en la época 5, seleccionada por la mejor puntuación de validación (91,47). El adaptador tiene sha256 `748e6ba763f4f6bf9c0f554c564035a1a3e3e3c958eded307e48ebfdc8b2d185`.

## Capacidades

- Extracción de información estructurada: convierte texto OCR de recibos y facturas en un objeto JSON con `line_items` (descripción, cantidad, precio unitario e importe), `subtotal`, `tax` y `total`.
- Normalización numérica: produce números JSON sin símbolos de moneda ni separadores de miles, con punto como separador decimal.
- Manejo de valores ausentes: devuelve `null` para cualquier campo que el documento no muestre.
- Generación de JSON válido: el autor reporta un 100 % de JSON válido en la semilla 1234 y un 99,3 % en el pool de tres semillas sobre el test de CORD v2.
- Soporte multilingüe limitado a inglés e indonesio, según los metadatos del modelo.
- Razonamiento explícito (thinking mode) desactivado por diseño; la ruta probada usa decodificación greedy sin penalización de repetición.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni matemáticas generales en la información disponible.

## Casos de uso

- Automatización de gastos de empresa: el adaptador convierte el texto OCR de tickets y facturas en JSON listo para ingerir en un ERP o en una herramienta de gestión de gastos, eliminando la transcripción manual de líneas de detalle e impuestos.
- Digitalización de recibos de comercio minorista: dado un flujo de OCR procedente de un escáner o de una app móvil, el modelo extrae líneas de artículo con cantidades e importes para construir bases de datos de compras y análisis de surtido.
- Conciliación contable: la salida estructurada con `subtotal`, `tax` y `total` permite cuadrar automáticamente documentos contra asientos contables y detectar discrepancias numéricas.
- Procesamiento por lotes en local: al ser un adaptador de 0,1 GB sobre un base de 2B, se puede desplegar en una GPU de consumo o en una T4 para procesar lotes de recibos sin enviar datos a servicios externos, lo que facilita el cumplimiento de requisitos de privacidad.
- Extracción en pipelines de datos con validación: la ruta recomendada incluye validar el JSON y reintentar una vez en caso de fallo, lo que encaja en un pipeline ETL con control de calidad y registro de errores.
- Prototipado rápido y ajuste a dominios concretos: al haberse entrenado en 30 minutos sobre una T4, el mismo esquema y receta sirven de plantilla para reentrenar el adaptador con recibos de otro país o formato, sustituyendo el dataset CORD por uno propio.
- Enriquecimiento de archivos documentales: la salida JSON permite indexar líneas de artículo y totales en un motor de búsqueda o en un almacén analítico para consultas posteriores sobre gastos por proveedor o categoría.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de CORD v2 (100 recibos), con intervalos de confianza bootstrap del 95 % sobre documentos. La métrica de selección es la media de header F1 e item F1.

| Sistema | Selección | Header F1 | Item F1 | Exact % | JSON válido % |
|---|---|---|---|---|---|
| Adaptador (semilla 1234) | 90,35 | 97,27 [93,6–99,5] | 83,43 [74,3–90,8] | 76 | 100 |
| Pool de 3 semillas (cifra principal) | 89,66 | 97,02 [94,3–99,0] | 82,30 [73,9–89,5] | 73 | 99,3 |
| Qwen3.5-2B sin ajustar, 3-shot (validación) | 56,72 | 76,40 | 37,04 | 10 | 100 |

Comparación con modelos alojados sobre los mismos recibos de test, como diferencia pareada respecto al pool de 3 semillas:

| Modelo comparado | Diferencia pareada |
|---|---|
| Gemini 4 Argon | +1,95 [−0,94, +5,13] |
| Claude Sonnet 5.5 | −0,11 [−3,33, +3,27] |
| Gemini 3.8 Flash | −3,28 [−7,91, +1,27] |

La dispersión entre semillas en test fue de 88,67 / 89,94 / 90,35. El autor indica que la época se eligió en validación por la media de las 3 semillas y que el test se ejecutó una sola vez bajo un bloqueo comprometido de antemano. Los resultados están marcados como no verificados en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador se entrenó y evaluó en 16 bits sobre una GPU T4 (16 GB), y el modelo base de 2B en 16 bits requiere del orden de 4-5 GB solo para pesos, más el coste de activaciones y caché KV.
- GPU recomendadas: T4 (ruta de entrenamiento y evaluación del autor); cualquier GPU con al menos 16 GB para la configuración en 16 bits.
- GPU de consumo: es plausible en tarjetas con 8-16 GB si se carga el base en 4 bits, aunque el autor solo documenta la ruta en 16 bits; no se confirma en la información disponible.
- Opciones de despliegue: la ruta probada usa `FastVisionModel` de Unsloth junto con `PeftModel` de PEFT; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles. El autor solo reporta que el entrenamiento completo llevó unos 30 minutos en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en CORD test (selección) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-2B + LoRA) | Base 2B + LoRA r16 | No disponible | 89,66 (pool 3 semillas) | Apache 2.0 | Hugging Face, pesos abiertos |
| Gemini 4 Argon | No disponible | No disponible | 91,61 (diferencia +1,95) | Propietaria | API de Google |
| Claude Sonnet 5.5 | No disponible | No disponible | 89,55 (diferencia −0,11) | Propietaria | API de Anthropic (evaluado vía Claude CLI) |
| Gemini 3.8 Flash | No disponible | No disponible | 86,38 (diferencia −3,28) | Propietaria | API de Google |
| Qwen3.5-2B sin ajustar (3-shot) | 2B | No disponible | 56,72 (validación) | Apache 2.0 | Hugging Face |

Las diferencias pareadas con los modelos propietarios tienen intervalos de confianza que incluyen el cero, por lo que el autor no las considera estadísticamente fiables. No se dispone de datos de parámetros ni de contexto de los modelos propietarios en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el adaptador está entrenado exclusivamente para extracción de recibos y facturas con un esquema JSON fijo; no es un modelo de propósito general y su rendimiento fuera de ese dominio no está evaluado.
- Idiomas limitados: los metadatos declaran solo inglés e indonesio; el entrenamiento se hizo sobre CORD v2, que es indonesio, por lo que el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación en campos numéricos: aunque el prompt pide `null` para valores no impresos, no se reporta una tasa de error específica sobre importes inventados; se recomienda validación programática de la salida.
- Dependencia del prompt: el autor insiste en usar exactamente el system prompt de entrenamiento y la decodificación greedy con thinking desactivado; desviarse de esa configuración puede degradar los resultados.
- JSON no siempre válido: el pool de 3 semillas reporta un 99,3 % de JSON válido, no el 100 %; la ruta recomendada incluye validar y reintentar una vez antes de devolver error.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false`; la comparación con modelos propietarios procede del propio autor y el test se ejecutó una sola vez.
- Tamaño de evaluación reducido: el test consta de 100 recibos, lo que produce intervalos de confianza amplios y limita la fiabilidad de las diferencias frente a otros sistemas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `unsloth/Qwen3.5-2B` y las condiciones del dataset CORD v2 para el uso previsto.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anilkr01/qwen3.5-2b-receipt-json-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/christinamaria/cord-v2-ocr
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Código, análisis de errores y comparación completa: el autor indica que se enlazará cuando se publique; no disponible en el momento de redactar esta ficha.
