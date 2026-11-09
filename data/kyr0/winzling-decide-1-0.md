# kyr0/winzling-decide-1.0

## Resumen
Winzling-decide 1.0 es una colección de exportaciones ONNX cuantizadas de los adaptadores de tarea y cabezas de decisión del modelo Vela3, publicada por kyr0 (KR Labs) para su biblioteca defuss-decide. No es un modelo de lenguaje generativo, sino un conjunto de grafos ONNX para token-classification, reconocimiento de entidades nombradas (NER) y detección de PII, además de tareas de visión (OCR, detección de cajas y spans visuales) y cabezas de decisión que eligen entre opciones.

El objetivo es ejecutar estas tareas en Node.js, Bun y el navegador mediante ONNX Runtime, con aceleración WebGPU cuando está disponible y fallback a CPU o WASM, sin necesidad de Python ni de un servidor de inferencia. El repo ocupa 11,7 GB e incluye bundles completos (grafos, tokenizador, manifiesto y licencias del modelo fuente) en FP32, q8 y q4.

La relevancia actual radica en la compresión: los cuatro bundles de texto en q4 suman 511 MB (frente a 2.891 MB de los pesos originales), y la cabeza de decisión de visión baja a 149 MB desde 971 MB, manteniendo las mismas respuestas decodificadas que el modelo original en las entradas de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportaciones ONNX de adaptadores de tarea y cabezas de decisión sobre el backbone Vela3 (arquitectura del backbone no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, q8, q4 (según bundle; no todos los bundles tienen todas las variantes) |
| Idiomas soportados | en |
| Licencia | other (license_name: vela3-upstream) |
| Formato de pesos | ONNX (grafos + tokenizador + manifiesto por bundle) |

## Arquitectura y entrenamiento
El modelo base es vllm-sr/vela3-fast (y vllm-sr/vela3-fast-vision para las tareas visuales), desarrollado por vLLM Semantic Router. Winzling-decide no entrena un modelo nuevo: exporta a ONNX los adaptadores de tarea y las cabezas de decisión del Vela3 original, aplica cuantización personalizada (q8 y q4) y valida cada bundle reproduciendo las salidas del modelo PyTorch original sobre entradas de referencia grabadas.

La validación es un requisito de publicación: un bundle solo se carga si su manifiesto indica `validated: true`, lo que el exportador escribe tras comprobar con ONNX Runtime que las salidas coinciden. Las diferencias máximas frente al original en FP32 son inferiores a 0.00001 en 8 de los 10 exports FP32, con un máximo de 0.0003 en `vision-ocr`. Para q8 y q4 se exige que las respuestas decodificadas (spans, cajas, puntos, opciones) sean idénticas y que el cambio de puntuación no supere 0.02. No se detallan en la información disponible los datos de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades
- Clasificación de tokens y reconocimiento de entidades nombradas (NER) sobre texto en inglés.
- Detección de PII (información personal identificable) mediante etiquetado de spans.
- Extracción de spans y conjuntos de spans (`span`, `span_set`) para tareas de extracción de información.
- Extracción de relaciones (`relation`) entre entidades.
- Recuperación de evidencia (`evidence`) para fundamentar decisiones.
- OCR sobre imágenes (`vision-ocr`) y detección de spans visuales (`vision-span`).
- Detección de cajas delimitadoras en imágenes (`vision-box`).
- Cabezas de decisión (`decision/fast` y `decision/vision`) que eligen entre opciones, incluida la selección basada en imágenes.
- Ejecución en Node.js, Bun y navegador (Chromium y WebKit) con ONNX Runtime, en CPU, WASM y WebGPU.
- No se documentan en la información disponible capacidades de generación de texto libre, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso
- Detección de PII en pipelines de backend Node.js: el bundle `ner` en q8 (1.142 MB) permite etiquetar entidades en texto antes de persistirlo o enviarlo a terceros, sin depender de un servicio Python.
- Anonimización en el navegador: los bundles de texto en q4 (277 MB por tarea con backbone compartido de 209 MB) se ejecutan con WebGPU o WASM en Chromium, lo que permite redactar datos sensibles en el cliente antes de subirlos.
- Extracción de entidades y relaciones en documentación técnica: combinar `span`/`span_set` con `relation` para construir grafos de entidades a partir de texto en inglés en flujos de enriquecimiento de datos.
- Procesamiento de documentos escaneados: `vision-ocr` y `vision-span` en q4 (167 MB cada uno, con 121 MB de backbone visual compartido) extraen texto y regiones de imágenes sin servidor de inferencia.
- Enrutamiento y selección de opciones: las cabezas `decision/fast` y `decision/vision` eligen entre alternativas en flujos de decisión, y la variante de visión mantiene la elección de FP32 en 24 de 24 preguntas generadas.
- Moderación o validación de contenido estructurado: usar `evidence` para localizar los fragmentos que sustentan una decisión y auditar el resultado, con bundles q4 de 277 MB.
- Despliegue en entornos sin Python: la librería defuss-decide carga los bundles directamente en Bun o Node.js, lo que simplifica el empaquetado en aplicaciones web y funciones serverless.

## Benchmarks y rendimiento

| Medicion | FP32 | q8 | q4 |
|---|---:|---:|---:|
| `decision/vision`: preguntas de imagen generadas con la elección de FP32 | 24 de 24 (referencia) | no publicado | 24 de 24 |
| Casos de defuss-decide respondidos según la etiqueta (81 decisiones de texto e imagen) | 74 de 81 | 73 de 81 | no medido |

Diferencias máximas frente al modelo original en FP32: `vision-span` 0.000009, `vision-ocr` 0.0003, `span_set` 0.000009, `span` 0.000006, `relation` 0.000005, `evidence` 0.000003, `vision-box` 0.00003, `ner` 0.000005, `decision/vision` 0.000008, `decision/fast` 0.000001. En q8 y q4 las respuestas decodificadas son idénticas al FP32 en todos los bundles publicados, con cambios máximos de puntuación entre 0.00001 y 0.015. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- Tamaño de descarga por bundle: `ner` q8 1.142 MB; `vision-box` q8 843 MB; `decision/fast` FP32 1.455 MB; `decision/vision` q4 149 MB; `span`, `span_set` y `evidence` q4 277 MB cada uno (68 MB + 209 MB de backbone compartido); `relation` q4 307 MB; `vision-span` y `vision-ocr` q4 167 MB cada uno (46 MB + 121 MB de backbone visual compartido).
- Los cuatro bundles de texto en q4 suman 511 MB, lo que permite cargarlos en memoria en equipos de consumo y en el navegador.
- No se especifican VRAM ni GPU recomendadas en la información disponible; la ejecución depende de ONNX Runtime con WebGPU, CPU o WASM.
- Despliegue mediante ONNX Runtime en Node.js, Bun y navegadores (Chromium y WebKit), a través de la librería defuss-decide; no requiere vLLM, llama.cpp, Ollama ni TGI.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| kyr0/winzling-decide-1.0 | no disponible | no disponible | NER, PII, spans, relaciones, OCR, decisión | other (vela3-upstream) | ONNX (FP32/q8/q4) |
| vllm-sr/vela3-fast (modelo base) | no disponible | no disponible | Tareas de texto de Vela3 | vela3-upstream | safetensors |
| vllm-sr/vela3-fast-vision (modelo base) | no disponible | no disponible | Tareas de visión de Vela3 | vela3-upstream | safetensors |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias
- Solo soporta inglés (`language: en`), lo que limita su uso en castellano u otros idiomas.
- Las entradas de referencia son de 2 a 5 por bundle y demuestran que la exportación reproduce el modelo original, no la precisión del modelo sobre datos nuevos.
- La licencia es `other` con nombre `vela3-upstream`; no se detallan en la información disponible las condiciones para uso comercial, por lo que debe revisarse el archivo de licencia incluido en cada bundle.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser tareas de clasificación y extracción, el riesgo principal es de etiquetado incorrecto más que de generación libre.
- Algunos bundles no tienen todas las cuantizaciones: `ner` y `vision-box` solo publican q8, `decision/fast` solo FP32 y `decision/vision` solo q4.
- El repo completo ocupa 11,7 GB, aunque cada bundle individual es mucho menor.
- La validación de calidad solo cubre 81 casos etiquetados (74 de 81 en FP32, 73 de 81 en q8); no hay medición q4 de esa suite.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kyr0/winzling-decide-1.0
- Librería defuss-decide: https://github.com/kyr0/defuss-decision
- Modelo base de texto: https://huggingface.co/vllm-sr/vela3-fast
- Modelo base de visión: https://huggingface.co/vllm-sr/vela3-fast-vision
