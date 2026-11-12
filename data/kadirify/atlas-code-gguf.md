# kadirify/atlas-code-GGUF

## Resumen

Atlas Code es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-14B-Instruct, desarrollado por el usuario kadirify, orientado a la corrección ortográfica del turco y al uso general de ese idioma. No se trata de un modelo entrenado desde cero, sino de un LoRA (r=16, alpha=32) fusionado en los pesos del modelo base. Su propósito principal es servir como motor local del asistente de escritorio de código abierto Atlas, que se ejecuta íntegramente en local.

El modelo parte de la arquitectura transformer densa de Qwen2.5-Coder-14B-Instruct, con 14 mil millones de parámetros y una ventana de contexto heredada del modelo base. La intervención del autor se centra en mejorar la calidad del turco escrito, manteniendo intactas las capacidades de generación de código y SQL del modelo original. Se distribuye en formato GGUF cuantizado Q4_K_M (9,0 GB), pensado para su ejecución mediante Ollama.

La relevancia de esta ficha es acotada: se trata de un modelo muy específico, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026 y con un conjunto de evaluaciones propio y reducido. Resulta útil para quien busque un modelo local especializado en corrección ortográfica turca, pero no debe confundirse con un modelo de propósito general ni con una mejora global sobre el base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-Coder-14B-Instruct) |
| Parámetros totales | 14 mil millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q4_K_M (único archivo publicado: `atlas-code-Q4_K_M.gguf`, 9,0 GB) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del transformer denso de Qwen2.5-Coder-14B-Instruct. El ajuste se realizó mediante LoRA con rango 16 y alpha 32, durante 362 pasos y una época, sobre 6.463 ejemplos, en configuración QLoRA de 4 bits. El entrenamiento se ejecutó en una única GPU RTX 5070 de 12 GB. Los scripts empleados están disponibles en la carpeta `training/` del repositorio Atlas en GitHub.

Los datos de entrenamiento combinan dos fuentes: por un lado, frases en turco corrompidas mediante reglas junto con sus versiones corregidas; por otro, ejemplos generales en turco e inglés generados con Gemma 4 E4B. El autor indica explícitamente que se usó menos volumen de datos de ortografía que en otras variantes. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá del propio ajuste LoRA fusionado.

## Capacidades

- Corrección ortográfica del turco: mejora sustancial frente al modelo base en pruebas de texto corrompido por reglas.
- Generación de código y SQL: mantiene el rendimiento del base, con puntuación de 98 sobre 100 según la medición del autor.
- Uso general del turco: conserva capacidades conversacionales, con una puntuación de 91 sobre 92 preguntas en el benchmark propio Atlas-TR.
- Soporte de inglés: el modelo base es multilingüe y el ajuste incluye ejemplos en inglés, aunque el foco es el turco.
- Ejecución local: formato GGUF compatible con Ollama, pensado para despliegue en escritorio.
- Tool calling y function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero el autor no lo documenta para este ajuste).
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información proporcionada.
- Modo de pensamiento (thinking), visión o audio: no disponible.

## Casos de uso

- Corrección ortográfica en turco para editores de texto: el modelo puede recibir un párrafo con errores y devolver una versión corregida, gracias a la mejora medida del 31,7 % al 77,0 % en la prueba de ortografía del autor. Adecuado para revisiones previas a publicación.
- Asistente de escritorio local: integración en la aplicación Atlas, que se ejecuta íntegramente en local mediante Ollama con el comando `ollama run kadirify/atlas-code`. El tamaño Q4_K_M de 9,0 GB permite su ejecución en equipos de consumo.
- Generación de código en entornos con requisitos de privacidad: al mantener la puntuación de código y SQL del base (98 sobre 100), puede usarse para autocompletar o generar fragmentos de código sin enviar datos a servicios externos.
- Normalización de texto turco en pipelines de datos: útil para limpiar y estandarizar corpus turcos antes de indexarlos o procesarlos, dado su enfoque en corrección de escritura.
- Soporte a la redacción en turco para usuarios no nativos: el modelo puede revisar y sugerir correcciones en textos redactados por hablantes no nativos, aunque el autor advierte que las correcciones no son perfectas y deben revisarse.
- Prototipado de asistentes conversacionales en turco: con una puntuación de 91 sobre 92 en el benchmark Atlas-TR, sirve para experimentar con chat en turco en local, aunque el autor recomienda otros modelos Atlas para conversación general.
- Filtrado y preprocesado de documentación técnica bilingüe: al soportar turco e inglés, puede emplearse para armonizar terminología y ortografía en documentación con ambos idiomas.

## Benchmarks y rendimiento

| Prueba | qwen2.5-coder:14b (base) | Atlas Code |
|---|---:|---:|
| Prueba de ortografía (300 casos), % | 31,7 | 77,0 |
| Prueba de ortografía difícil (187 casos), % | 26,7 | 62,6 |
| Atlas-TR general (92 preguntas) | 92 | 91 |
| Código y SQL | 98 | 98 |
| Traducción | 100 | 83 |

Los datos proceden de la model card del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El propio autor advierte que las pruebas de ortografía se generaron con reglas y no se validaron con texto escrito por personas reales, y que el benchmark Atlas-TR es pequeño, por lo que diferencias de 1-2 puntos no son significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,0 GB para el archivo Q4_K_M publicado; el espacio adicional para el contexto depende de la longitud de este, no documentada.
- GPU recomendadas: el autor entrenó con una RTX 5070 de 12 GB; para inferencia, una GPU con 12 GB o más es suficiente para el cuantizado Q4_K_M.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM (RTX 4070, RTX 5070, RTX 3080 Ti, entre otras). En GPUs con menos VRAM requeriría descarga parcial a CPU.
- Opciones de despliegue: Ollama es el método documentado (`ollama run kadirify/atlas-code`). Al ser GGUF, también es compatible con llama.cpp; no se documenta soporte para vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas Code | 14 mil millones | no disponible | Corrección ortográfica turca sobre Qwen2.5-Coder | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-Coder-14B-Instruct | 14 mil millones | no disponible en esta ficha | Código general, multilingüe | Apache 2.0 | Pesos completos y GGUF en Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7 mil millones | no disponible en esta ficha | Código general, menor tamaño | Apache 2.0 | Pesos completos y GGUF en Hugging Face |

La comparación más directa es con el modelo base: Atlas Code mejora la ortografía turca (77,0 frente a 31,7) y mantiene código y SQL (98 en ambos), pero empeora en traducción (83 frente a 100) y ligeramente en el benchmark general (91 frente a 92). Frente a Qwen2.5-Coder-7B-Instruct, Atlas Code ofrece el doble de parámetros y, presumiblemente, mayor calidad en código, a costa de un mayor requisito de VRAM; no se dispone de datos comparativos de rendimiento entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Las pruebas de ortografía se generaron mediante reglas, no con texto real de personas; el rendimiento en escritura humana real no está validado.
- El benchmark Atlas-TR consta de solo 92 preguntas; diferencias de 1-2 puntos no son significativas.
- El autor reconoce que las correcciones no son siempre perfectas y recomienda revisar manualmente los textos importantes.
- La categoría de traducción se degradó respecto al base (de 100 a 83), por lo que no es adecuado como traductor.
- Para conversación general, el autor indica que otros modelos de la familia Atlas son más apropiados.
- El modelo está especializado en turco; su uso en otros idiomas distintos del inglés no está documentado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero aplicable a cualquier modelo generativo de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-Coder-14B-Instruct.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica una validación comunitaria nula.

## Enlaces

- Hugging Face: https://huggingface.co/kadirify/atlas-code-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio del asistente Atlas: https://github.com/kadirify/atlas
