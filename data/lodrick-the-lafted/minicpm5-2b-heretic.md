# lodrick-the-lafted/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-heretic es una variante "decensored" (también etiquetada como *abliterated*) del modelo MiniCPM5-2B de OpenBMB, publicada por el usuario independiente lodrick-the-lafted. El modelo base es un transformer denso de aproximadamente 2.500 millones de parámetros (2.516.756.480 según los pesos en safetensors) diseñado por OpenBMB para despliegue en dispositivo, local y en entornos con recursos limitados. Esta versión concreta aplica la herramienta Heretic v2.0.0dev con el método ARA para eliminar total o parcialmente los mecanismos de rechazo del modelo original.

La propuesta de valor de esta variante es doble. Por un lado, conserva las capacidades del MiniCPM5-2B original (razonamiento, código, matemáticas, contexto largo, tool calling y tareas agénticas) que OpenBMB sitúa en el estado del arte de la categoría de 2B y competitivo frente a modelos de 4B. Por otro, reduce drásticamente las negativas a responder: según la model card, pasa de 99/100 rechazos en el modelo original a 7/100 en esta versión, con una divergencia KL de 0,0097 respecto al original, lo que indica un cambio moderado en la distribución de salidas.

Es relevante ahora porque el ecosistema de modelos pequeños para edge computing está creciendo y muchos desarrolladores necesitan variantes sin restricciones de contenido para investigación, generación creativa, *red teaming* o aplicaciones donde el modelo base rechaza peticiones legítimas. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial, aunque con las advertencias propias de un modelo sin alineación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama, según tags) |
| Parámetros totales | 2.516.756.480 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (etiquetado como *long-context*) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos en safetensors; se espera compatibilidad con GGUF/AWQ vía herramientas externas, pero no confirmado) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 2B parámetros, segundo miembro de la serie MiniCPM5 tras el MiniCPM5-1B, entrenado por OpenBMB con la misma receta que su predecesor pero escalada. Según los tags de Hugging Face, el entrenamiento del modelo base utilizó los datasets Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609, lo que sugiere una mezcla de datos web de alta calidad, matemáticas, código y fases de SFT y RL. No se dispone del número exacto de tokens de entrenamiento en la información proporcionada.

La modificación de esta variante se realizó con Heretic v2.0.0dev empleando el método ARA, una técnica de *abliteration* que identifica y neutraliza direcciones en el espacio de activaciones asociadas a la negativa a responder. El resultado reportado es una reducción de rechazos del 99 % al 7 % con una divergencia KL de 0,0097 frente al modelo original, lo que sugiere que las capacidades generales se preservan en gran medida. No se detalla en la información disponible si hubo entrenamiento adicional, ajuste fino o únicamente edición de pesos.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento en código y matemáticas, con rendimiento destacado frente a modelos de tamaño similar según OpenBMB.
- Comprensión de contexto largo (el modelo base está etiquetado como *long-context*; la longitud exacta no está disponible).
- Soporte de *tool calling* / *function calling*, según los tags del modelo.
- Capacidades agénticas y razonamiento multi-paso (entrenado con UltraData-SFT-Agent-2609 y UltraData-RL-2609).
- Orientado a despliegue en dispositivo (*on-device*) y *edge AI*, con un tamaño que permite ejecución local.
- Variante sin alineación de seguridad: responde a peticiones que el modelo original rechazaría (7/100 rechazos frente a 99/100).
- No se mencionan capacidades de visión, audio ni modo *thinking* explícito en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el par MiniCPM5-2B original y esta variante *heretic* permiten estudiar experimentalmente cómo el *abliteration* altera la distribución de respuestas, midiendo divergencia KL y tasas de rechazo en distintos *prompts*.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas adultas o controvertidas donde el modelo base rechazaría peticiones legítimas; el contexto largo ayuda a mantener coherencia en textos extensos.
- *Red teaming* y evaluación de filtros: usar el modelo como generador de contenido adversario para probar clasificadores de seguridad, moderación o sistemas de detección en pipelines propios.
- Asistente local en dispositivos con recursos limitados: con ~2,5B parámetros, es viable en portátiles y equipos de gama media para tareas de resumen, redacción y Q&A sin conexión, en inglés o chino.
- Automatización de tareas con *tool calling*: integración en agentes ligeros que necesiten invocar APIs o funciones en entornos *edge*, aprovechando el soporte de *function calling* del modelo base.
- Prototipado rápido de chatbots bilingües (en/zh): su tamaño reducido permite iterar con bajo coste de inferencia y desplegar en entornos de desarrollo sin GPU de datacenter.
- Análisis de documentos largos en local: si el contexto largo del modelo base se conserva, puede resumir o extraer información de documentos extensos sin enviar datos a la nube.

## Benchmarks y rendimiento

La model card de esta variante solo reporta métricas de la modificación *heretic*, no benchmarks de capacidades:

| Métrica | Este modelo | MiniCPM5-2B original |
|---|---|---|
| Divergencia KL | 0,0097 | 0 (por definición) |
| Rechazos | 7/100 | 99/100 |

OpenBMB afirma en la model card del modelo base que MiniCPM5-2B alcanza SOTA en la categoría 2B y es competitivo con modelos de 4B en código, matemáticas, contexto largo, uso de herramientas y tareas agénticas, pero no se proporcionan los valores numéricos de MMLU, HumanEval, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 5-6 GB solo para pesos (2,5B × 2 bytes), más overhead de activaciones y KV cache; el repo ocupa 5,0 GB en safetensors.
- Cuantización a 8 bits: aproximadamente 2,5-3 GB de VRAM; a 4 bits: aproximadamente 1,5-2 GB, aunque los formatos GGUF/AWQ no están confirmados en la información disponible.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en FP16; para despliegue en servidor, A100/H100 son sobredimensionadas pero válidas para alto throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB o menos si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama son plausibles por la arquitectura tipo Llama, pero no están confirmados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-heretic (este) | ~2,5B | no disponible | Apache 2.0 | Variante sin alineación de seguridad, 7/100 rechazos |
| MiniCPM5-2B (original) | ~2,5B | no disponible | Apache 2.0 | Modelo base alineado, 99/100 rechazos, SOTA 2B según OpenBMB |
| MiniCPM5-1B | ~1B | no disponible | no disponible | Predecesor de la serie, menor tamaño |
| Modelos de 4B comparables | ~4B | no disponible | no disponible | OpenBMB lo compara con esta clase sin especificar cuáles |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los competidores en la información proporcionada para una comparación cuantitativa más fina.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la reducción de rechazos al 7 % implica que puede generar contenido dañino, ofensivo o ilegal; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación: inherente a modelos de 2B parámetros; menor fiabilidad factual que modelos grandes, especialmente en dominios especializados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no especificada en la información disponible; conviene verificarla empíricamente antes de usarla en producción con documentos largos.
- La modificación *abliteration* puede degradar sutilmente capacidades en áreas relacionadas con la negativa; la divergencia KL de 0,0097 sugiere impacto bajo pero no nulo.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la variante no ofrece garantías y la responsabilidad legal del contenido generado recae en el desplegador.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de terceros sobre su comportamiento real.
- No hay información sobre cuantizaciones oficiales ni sobre compatibilidad verificada con llama.cpp, vLLM u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lodrick-the-lafted/MiniCPM5-2B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Heretic (herramienta de *abliteration*): https://github.com/p-e-w/heretic
- Informe técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- Demo online del modelo base: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- README en chino del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
- Paper adicional referenciado en tags: https://arxiv.org/abs/2602.09003
