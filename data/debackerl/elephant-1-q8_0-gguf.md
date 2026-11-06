# debackerl/elephant-1-Q8_0-GGUF

## Resumen

elephant-1 es un modelo de decisión de 9B parámetros desarrollado por Base Labs en Baseten, construido como un post-entrenamiento de Qwen3.5-9B con capacidades de visión. A diferencia de un modelo generativo convencional, elephant-1 está diseñado para emitir decisiones estructuradas sobre un estado dado: clasificar en una opción (choice), puntuar en una escala (score) o responder sí/no (noul). Su arquitectura emplea atención bidireccional por bloques en las capas de atención completa, lo que permite que el modelo procese el estado y las preguntas de forma conjunta antes de leer los logits de las etiquetas.

El repositorio `debackerl/elephant-1-Q8_0-GGUF` no contiene pesos nuevos ni recuantizaciones: empaqueta los pesos Q8_0 (incluida la torre de visión) generados por mradermacher y añade metadatos de decisión (`qwen35.decision.*`) y una plantilla de prompt `systemone` para que llama.cpp y llama-swap puedan servir el endpoint `/v1/systemone`. Sin estos metadatos, un GGUF estándar de elephant-1 se interpreta como un modelo de texto `qwen35` y el endpoint de decisión devuelve un error 501.

La relevancia de este empaquetado es práctica: permite desplegar un modelo de decisión con visión sobre llama.cpp (build b11820 o superior) sin necesidad de infraestructura transformers, manteniendo la semántica de decisión del modelo original mediante una máscara de atención no causal y una plantilla de prompt que reproduce byte a byte el formato de qev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (post-entrenamiento de Qwen3.5-9B) con atención bidireccional por bloques en capas de atención completa; torre de visión |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con `-c 32768`) |
| Tipos de cuantizacion | Q8_0 (pesos y torre de visión) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (`elephant-1-Q8_0.gguf` + `elephant-1.mmproj-Q8_0.gguf`) |

## Arquitectura y entrenamiento

elephant-1 parte de Qwen3.5-9B y se post-entrena como modelo de decisión con capacidades de visión. La innovación arquitectónica clave es la declaración `full_attention: block_bidirectional` en el modelo base: las capas de atención completa operan de forma bidireccional por bloques, de modo que el prefijo compartido (el estado) y cada sufijo de pregunta se evalúan en bloques separados con máscara no causal. En llama.cpp, que no dispone de una clave de máscara por bloque, este repositorio activa `qwen35.attention.causal = false` para que las capas de atención completa sean totalmente no causales; dado que llama.cpp evalúa el prefijo compartido por separado y cada sufijo de pregunta después, se reproduce la máscara de dos bloques de qev.

El modelo no genera texto libre en el modo de decisión: la lectura de la decisión es headless, basada en los logits de los tokens de etiqueta (A–Z, a–z) en la posición correspondiente, implementada en llama.cpp como `OPENJEV`. La plantilla `systemone` reproduce el layout de `qev/prompt.py` para los tipos `choice`, `noul` y `score`, envuelto en los marcadores de la plantilla de chat de Qwen. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Toma de decisiones estructurada en tres modalidades: `choice` (selección entre opciones etiquetadas A–Z), `score` (puntuación en una escala ordenada) y `noul` (respuesta binaria sí/no).
- Procesamiento de estados en formato texto plano o como objeto JSON (renderizado con `tojson(indent=2)`).
- Comprensión de imágenes mediante torre de visión (pipeline `image-text-to-text`), con configuración de `--image-min-tokens 1024`.
- Soporte de múltiples preguntas por petición, cada una con su propio tipo, instrucciones y criterios.
- Integración con llama.cpp y llama-swap mediante el endpoint `POST /v1/systemone`.
- Capacidad conversacional declarada en los tags del repositorio.
- Idioma: únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con criterios como `billing`, `shipping` o `technical`, devolviendo la etiqueta del equipo adecuado. La atención bidireccional permite que el estado completo informe la decisión sin generación autoregresiva.
- Priorización de incidencias: con una pregunta `score` sobre una escala ordinal (`can wait`, `this week`, `today`, `right now`), el modelo asigna un nivel de urgencia que puede alimentar un sistema de colas o SLA.
- Moderación y detección binaria: preguntas `noul` del tipo "¿el cliente está enfadado?" o "¿el contenido infringe la política?" permiten clasificadores binarios ligeros servidos sobre llama.cpp.
- Triaje multimodal: gracias a la torre de visión, el modelo puede decidir sobre estados que incluyan imágenes (por ejemplo, capturas de pantalla de errores o fotos de productos dañados) junto con texto descriptivo.
- Clasificación por lotes en pipelines de datos: el endpoint `/v1/systemone` acepta múltiples preguntas por estado, lo que permite extraer varias etiquetas de un mismo registro en una sola llamada.
- Decisión condicionada por contexto largo: con 32.768 tokens de contexto, el modelo puede evaluar estados extensos (historiales de conversación, documentos) y emitir una decisión sin truncar la información relevante.
- Automatización de flujos agénticos: el resultado de la decisión puede usarse como señal de control en un orquestador que derive la acción a un agente generativo o a un humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos Q8_0 ocupa 9.527.504.224 bytes (aproximadamente 8,87 GiB) y el proyector multimodal 624.229.760 bytes (aproximadamente 0,58 GiB), lo que suma unos 9,45 GiB solo en pesos; con overhead de contexto y caché KV para 32.768 tokens, se recomienda un mínimo de 12–16 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con contexto completo; RTX 4090 (24 GB) es suficiente para Q8_0 con contexto de 32K.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB el contexto disponible se reduce y puede requerir cuantizaciones menores no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (build b11820 o superior) con `llama-server`, `--mmproj`, `--jinja` y `-fa on`; compatible con llama-swap para el endpoint `/v1/systemone`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elephant-1 (este repo, Q8_0 GGUF) | 8,95B | 32.768 | Texto + visión, decisión estructurada | MIT | GGUF en Hugging Face |
| baselabs/elephant-1 (BF16 original) | 8,95B | No disponible | Texto + visión, decisión estructurada | MIT | Pesos originales en Hugging Face |
| mradermacher/elephant-1-GGUF | 8,95B | No disponible | Texto + visión | MIT | GGUF (sin metadatos de decisión) |
| waseigo/elephant-1-decision-GGUF | 8,95B | No disponible | Texto + visión, decisión estructurada | MIT | GGUF con metadatos de decisión |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre modelos de decisión comparables de otros desarrolladores.

## Limitaciones y advertencias

- El repositorio solo añade metadatos y plantilla; la calidad de los pesos corresponde a la cuantización Q8_0 de mradermacher, no a BF16.
- La máscara de atención no causal se aplica globalmente en llama.cpp (`attention.causal = false`); un prompt evaluado como un único lote sin dividir no tendría la misma semántica que la máscara de dos bloques de qev.
- El espacio de etiquetas de `OPENJEV` se limita a 52 tokens de un solo carácter (A–Z, a–z); solo se ha validado el camino de hasta 26 opciones, y conjuntos mayores no han sido validados.
- La temperatura está fijada a 1.0 y el repositorio base no incluye `calibration.json`, por lo que la calibración de qev se reduce a la identidad.
- El renderizado de estados JSON puede diferir del de Python en el escapado de caracteres no ASCII (`ensure_ascii=False`).
- El modelo solo soporta inglés, lo que limita su uso en entornos multilingües.
- Riesgo de sesgos y alucinación inherente al modelo base; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantía alguna.
- Requiere llama.cpp b11820 o superior; versiones anteriores no reconocen los metadatos de decisión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/debackerl/elephant-1-Q8_0-GGUF
- Modelo base: https://huggingface.co/baselabs/elephant-1
- Cuantización y torre de visión: https://huggingface.co/mradermacher/elephant-1-GGUF
- Referencia de metadatos de decisión: https://huggingface.co/waseigo/elephant-1-decision-GGUF
- llama.cpp decision models (PR #29818): https://github.com/ggml-org/llama.cpp/pull/29818
