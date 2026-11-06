# Ajay0007/receipt-extractor-lfm2.5-350m

## Resumen

receipt-extractor-lfm2.5-350m es un ajuste fino completo del modelo LiquidAI/LFM2.5-350M (354 millones de parámetros) desarrollado por el usuario Ajay0007. Su función es convertir el texto OCR de un ticket o recibo en un JSON estructurado con partidas, subtotal, impuestos, servicio o propina, descuento y total. Está pensado para aplicaciones móviles de reparto de gastos tipo Splitwise, donde el usuario fotografía la cuenta y la app la divide por partidas.

El modelo no procesa imágenes directamente: recibe el texto OCR ya extraído (una línea visual del ticket por fila, con los tokens ordenados de izquierda a derecha) y devuelve un JSON compacto. Se distribuye junto con un fichero `model.litertlm` en int8 (364 MB) para el runtime LiteRT-LM de Google, lo que permite inferencia en Android, iOS y escritorio. Según la model card, la latencia mediana es de 0,8 s por ticket (p90 1,9 s) en CPU de servidor con 4 hilos, excluyendo el OCR.

Es relevante por su enfoque de despliegue en dispositivo: un modelo de 350M parámetros cuantizado a int8 que cabe en un móvil, con una comprobación de suma aritmética como señal de confianza (los tickets que pasan la comprobación son correctos en torno al 89 % de las veces, frente al 25 % de los que fallan). La licencia es lfm1.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer, modelo base LiquidAI/LFM2.5-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el build LiteRT-LM usa KV cache de 1024 tokens y prefill de 256) |
| Tipos de cuantización | int8 (pesos int8, activaciones fp32) para LiteRT-LM; pesos bf16 en safetensors |
| Idiomas soportados | en, id, de, fr |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (transformers), model.litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer de 354M parámetros, y se ha ajustado completamente (full fine-tune) para una tarea de extracción de información estructurada. La entrada es texto OCR con una línea visual del ticket por fila; la salida es un JSON con las claves `items` (nombre, cantidad, precio), `subtotal`, `tax`, `service`, `discount` y `total`. El prompt debe construirse exactamente con la función `build_prompt` incluida en el repositorio, ya que el modelo se entrenó con esa redacción concreta, y se recomienda decodificación greedy (`do_sample=False`).

Los datos de entrenamiento suman 1.813 tickets: 800 del split de entrenamiento de CORD-v2 (Indonesia, indonesio/inglés, rupias) y 1.013 del split de entrenamiento de WildReceipt (mayoritariamente EE. UU. y Europa, inglés con algo de alemán y francés). Las entradas se generaron ejecutando RapidOCR (PP-OCR) sobre las imágenes y agrupando las cajas OCR en líneas visuales mediante `ocr_boxes_to_text`, la misma función que se debe portar a Kotlin o Swift en la app. No se detalla en la información disponible si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Extracción de información estructurada: convierte texto OCR de tickets en JSON con partidas, subtotal, impuestos, servicio/propina, descuento y total.
- Generación de texto y JSON compacto con decodificación determinista.
- Procesamiento de tickets en indonesio, inglés, alemán y francés (según los idiomas declarados y los datasets).
- Soporte de conversación mediante plantilla de chat (`apply_chat_template`).
- Despliegue en dispositivo con LiteRT-LM en Android, iOS y escritorio.
- Utilidades auxiliares incluidas en el repositorio: construcción de prompt, agrupación de cajas OCR en líneas, parseo de salida y comprobación de suma (`sum_check`).
- No se menciona soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Reparto de gastos en apps móviles: el usuario fotografía la cuenta, el OCR local extrae el texto (unos 0,3 s) y el modelo devuelve el JSON con las partidas (unos 1 s) para que la interfaz permita dividir por ítem. El tamaño de 350M y el build int8 de 364 MB lo hacen viable en un teléfono.
- Verificación automática de tickets en gastos de empresa: el JSON generado se valida con `sum_check` (partidas + impuestos + servicio − descuento = total) y, si pasa, se registra el gasto sin revisión manual; si falla, se deriva a revisión.
- Digitalización de tickets en comercio minorista o restauración: extracción de partidas y totales para conciliación de caja o informes de ventas a partir de fotos de recibos.
- Procesamiento por lotes en servidor: con transformers y pesos bf16 se pueden procesar lotes de tickets OCR en pipelines de contabilidad, usando la comprobación de suma como filtro de calidad.
- Aplicaciones sin conectividad: al ejecutarse en LiteRT-LM en el dispositivo, permite extraer datos de tickets en modo offline, sin enviar imágenes ni texto a un servidor.
- Prototipado rápido de extracción de documentos: el repositorio incluye `receipt_utils.py` con prompt, agrupación OCR, parseo y comprobación de suma, lo que facilita integrar el modelo en un prototipo en Python en pocas líneas.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos con el runtime LiteRT-LM (int8, 4 hilos de CPU) sobre 100 tickets por conjunto:

| Conjunto | Métrica | Resultado |
|---|---|---|
| CORD (split-ready) | exactitud | 70 % |
| CORD (total) | exactitud | 94 % |
| WildReceipt (split-ready) | exactitud | 31 % |
| WildReceipt (total) | exactitud | 88 % |
| Latencia (mediana) | por ticket | 0,82 s |
| Latencia (p90) | por ticket | 1,90 s |

Según el autor, el build int8 queda a menos de 1 punto de los pesos bf16 en los mismos tickets. La comprobación de suma como señal de confianza: los tickets que la pasan son correctos en torno al 89 % de las veces; los que fallan, en torno al 25 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en dispositivo: fichero `model.litertlm` de 364 MB en int8; cabe en móviles Android e iOS recientes con el runtime LiteRT-LM.
- Inferencia en servidor con transformers: pesos bf16 de 354M parámetros; el repositorio ocupa 1,1 GB, por lo que la VRAM necesaria es modesta (del orden de 1-2 GB con overhead de runtime; no se especifica cifra oficial).
- GPU recomendadas: no se especifican; cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) es suficiente por el tamaño del modelo.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LiteRT-LM (Android, iOS, escritorio), transformers en Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: mediana de 0,82 s y p90 de 1,90 s por ticket en LiteRT-LM con 4 hilos de CPU (excluyendo OCR); no se publica throughput en servidor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de extracción de tickets en la información proporcionada.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| receipt-extractor-lfm2.5-350m | 354M | no disponible | Ajuste fino de LFM2.5-350M para JSON de tickets | lfm1.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | Modelo generalista | lfm1.0 | Hugging Face |
| Alternativas de extracción de tickets | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo procesa texto OCR; no lee imágenes. Requiere un motor OCR externo y un agrupado de cajas en líneas visuales correcto (`ocr_boxes_to_text`); un agrupado distinto al del entrenamiento degrada los resultados.
- El prompt debe ser exactamente el de `build_prompt`; cambiar la redacción puede afectar a la calidad de la salida.
- Se recomienda decodificación greedy; el muestreo puede producir JSON inválido o incoherente.
- El rendimiento en WildReceipt para reparto por partidas es bajo (31 % split-ready), aunque la exactitud del total es del 88 %; el modelo es más fiable para totales que para el desglose completo en tickets de EE. UU. y Europa.
- Cobertura lingüística limitada a inglés, indonesio, alemán y francés; otros idiomas no están soportados según la información disponible.
- Riesgo de alucinación en campos ausentes del ticket (por ejemplo, inventar impuestos o descuentos); la comprobación de suma mitiga parcialmente este riesgo, pero no lo elimina.
- La licencia lfm1.0 es "other"; deben revisarse las condiciones de uso comercial del modelo base LiquidAI antes de desplegarlo en producción.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 0 likes; no hay evidencia de validación por terceros.
- No se detallan sesgos conocidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajay0007/receipt-extractor-lfm2.5-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Dataset CORD-v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset WildReceipt (donut): https://huggingface.co/datasets/podbilabs/wildreceipt-donut
- RapidOCR: https://github.com/RapidAI/RapidOCR
- Paquete litert-torch: https://pypi.org/project/litert-torch/
