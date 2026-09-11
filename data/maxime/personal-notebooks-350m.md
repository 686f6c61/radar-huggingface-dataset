# maxime/personal-notebooks-350m

## Resumen

Personal notebooks 350M es un ajuste fino de tipo LoRA sobre el modelo base LiquidAI/LFM2.5-350M, publicado por el usuario maxime en Hugging Face. No es un modelo de propósito general: se ha entrenado para completar el pensamiento de un hablante en primera persona a partir de un fragmento de texto sin puntuación, imitando el registro de unos cuadernos personales. El resultado se exporta a ONNX de 4 bits (289 MB) para ejecutarse íntegramente en el navegador mediante WebGPU y Transformers.js, sin backend ni servidor.

El ajuste se realizó con LoRA de rango 8 sobre 7.320 pares fragmento → final extraídos de las traducciones al inglés de *The Notebooks of Simone Weil* y *The Complete Notebooks* de Albert Camus. La pérdida de validación bajó de 6,97 a 3,85 tras una única época de 1.800 pasos. El modelo fue creado para la pieza interactiva *Voices in your head* (maximevidal.com/voices).

Su relevancia es acotada pero clara: demuestra que un pipeline completo de ajuste fino, exportación y despliegue en navegador cabe en una sola máquina Apple M2 con un pico de 2 GB de memoria, y que un modelo de 350M parámetros puede sostener una tarea de generación muy estrecha con calidad suficiente para una instalación artística. La licencia es de uso exclusivamente investigador y artístico: el uso comercial no está permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia LFM2.5 (Liquid AI), ajustado con LoRA rank 8 sobre LiquidAI/LFM2.5-350M |
| Parametros totales | 350 millones |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; las secuencias de entrenamiento se limitaron a 512 tokens |
| Tipos de cuantizacion | Q4 (4 bits) en ONNX, unica variante publicada; 289 MB |
| Idiomas soportados | ingles (en) |
| Licencia | research-and-artistic-use-1.0 (uso comercial no permitido) |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` + `onnx/model_q4.onnx_data`, datos externos); se incluyen `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

La base es LiquidAI/LFM2.5-350M, un transformer de 350 millones de parámetros. Sobre él se aplicó un LoRA de rango 8 con dropout 0,05 y escala 20 en todas las capas, con la pérdida enmascarada sobre el prompt, usando MLX-LM 0.31. El conjunto de entrenamiento son 7.320 pares fragmento → final de entre 8 y 24 palabras: el fragmento se presenta en minúsculas y sin puntuación, tal como lo entregaría un reconocedor de voz, y el objetivo es el final intacto de la frase. Se reservaron 952 frases para validación y 854 para test, en bloques de pasajes contiguos. Se excluyeron las frases dirigidas a un "tú" explícito, las citas y todo el material predominantemente notacional (griego, listas de páginas, fórmulas). La composición es un 61 % Weil (4.493 frases) y un 39 % Camus (2.827 frases).

El entrenamiento consistió en 1.800 pasos con batch 4 (una época), tasa de aprendizaje 1e-4 y semilla 42, con un máximo de 512 tokens por ejemplo. La pérdida de validación pasó de 6,97 antes del ajuste a 3,85. No se aplicaron RLHF ni DPO: es un ajuste supervisado puro sobre una tarea de continuación. La innovación técnica aquí no está en el modelado, sino en el empaquetado: la exportación con la herramienta `onnx-export` de Liquid genera pesos Q4 con grafo fusionado (la comprobación de fusión pasó) y formato de datos externos, lo que permite cargar el modelo en un navegador con WebGPU en unos 289 MB. Todo el pipeline, desde el EPUB hasta el navegador, se ejecutó en un solo Apple M2 con un pico de 2 GB de asignación.

## Capacidades

- Continuación de pensamiento en primera persona: dado un fragmento previo al cursor, devuelve una única cláusula o frase compacta, normalmente de 6 a 14 palabras.
- Mantenimiento del tono, tiempo verbal, perspectiva y ritmo del fragmento original, según los objetivos declarados en el prompt de sistema.
- Generación de una imagen, detalle vívido, contraste o consecuencia concreta cuando el contexto lo permite, evitando cierres genéricos o moralizantes.
- Plantilla de chat específica de LFM2.5 con un prompt de sistema largo y detallado, más un turno de usuario con el formato `Text before cursor:` / `Text after cursor:`.
- Inferencia en navegador con Transformers.js (`AutoModelForCausalLM`), dtype `q4`, dispositivo `webgpu` y `use_external_data_format: true`.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni ninguna modalidad adicional.
- Multilingüismo: ninguno. Entrenado y evaluado únicamente en inglés.

## Casos de uso

- Autocompletado de escritura personal en el navegador: el caso de uso original es la aplicación *Voices in your head* (maximevidal.com/voices), donde el modelo completa el pensamiento del usuario mientras escribe. Es adecuado porque el modelo es 289 MB, cabe en la caché del navegador y no requiere enviar el texto a ningún servidor.
- Diarios y escritura introspectiva con asistencia local: la app puede sugerir el cierre de una frase inacabada manteniendo la voz del autor. El sesgo hacia el registro abstracto de Weil resulta funcional en este contexto, no un defecto.
- Instalaciones artísticas interactivas: una pieza expositiva puede ejecutar el modelo en el navegador del visitante sin conexión a internet y sin coste de servidor. El arranque es inmediato y el consumo de memoria es despreciable frente a cualquier otra alternativa generativa.
- Prototipado de interfaces de escritura en tiempo real: desarrolladores que quieran experimentar con UX de "continuación fantasma" o autocompletado a nivel de cláusula pueden integrar el modelo con unas pocas líneas de JavaScript (el ejemplo de `transformers.js` de la model card es funcional).
- Investigación sobre ajuste fino con datasets pequeños: el repositorio documenta de forma completa el proceso (LoRA rank 8, 7.320 ejemplos, una época, 1.800 pasos, pérdida 6,97 → 3,85, hardware de 2 GB), lo que lo convierte en una referencia reproducible para estudiar cuánto se puede enseñar a un modelo de 350M con un corpus diminuto.
- Evaluación de memorización y recitación: la model card describe una pantalla de control que busca coincidencias exactas de 6 palabras y solapamiento de 10-gramas contra las fuentes. Sirve como caso práctico para medir si un modelo pequeño reproduce texto de entrenamiento con fines de cumplimiento de derechos de autor.
- Demostraciones didácticas de transformers.js y WebGPU: el código de la model card incluye un parche explícito para los marcadores `{%- generation -%}` que Transformers.js 4.2 no elimina de la plantilla. Es un ejemplo útil de integración real de modelos ONNX en el navegador.
- Generación de estímulos o disparadores creativos: dado un fragmento del propio usuario, el modelo ofrece una dirección inesperada y específica. Es apropiado para sesiones de escritura que necesiten romper un bloqueo, siempre que el texto generado se trate como material de trabajo y nunca como cita de Weil o Camus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos facilitados por el autor son:

| Metrica | Valor |
|---|---|
| Perdida de validacion antes del ajuste | 6,97 |
| Perdida de validacion despues del ajuste | 3,85 |
| Ejemplos de entrenamiento | 7.320 (4.493 Weil, 2.827 Camus) |
| Ejemplos de validacion | 952 |
| Ejemplos de test | 854 |
| Pasos de entrenamiento | 1.800 (batch 4, una epoca) |
| Tasa de aprendizaje | 1e-4 |
| Pico de memoria en entrenamiento | 2 GB (Apple M2) |
| Tamano de los pesos publicados | 289 MB (ONNX Q4) |

La pantalla de recitación de la aplicación no encontró coincidencias exactas de 6 palabras ni solapamiento de 10-gramas sobre su conjunto de prueba, aunque el propio autor advierte que esto es un filtro de control y no una garantía.

## Requisitos de hardware

- Inferencia en navegador: los pesos Q4 ocupan 289 MB, por lo que el modelo cabe en cualquier dispositivo con soporte de WebGPU, incluidos portátiles con gráfica integrada y móviles recientes.
- VRAM estimada: no disponible de forma explícita; el modelo se ejecuta con Graph Execution Provider sobre WebGPU, sin cifras publicadas de VRAM pico. Como referencia de tamaño, 350M parámetros en FP16 rondarían los 700 MB y en FP32 alrededor de 1,4 GB, muy por encima de los 289 MB en Q4.
- GPU recomendadas: no se especifica ninguna. El desarrollo se hizo en un Apple M2 y el destino es cualquier GPU accesible desde WebGPU. No hay indicios de que se haya probado en A100, H100 o RTX 4090, y usar esas tarjetas no aportaría ninguna ventaja para este caso de uso.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo moderna e incluso en gráficas integradas. El cuello de botella real es el soporte de WebGPU del navegador, no la capacidad de cómputo.
- Opciones de despliegue: Transformers.js con WebGPU es la vía documentada. ONNX Runtime Web es compatible por el formato de exportación. No se publican pesos en GGUF, safetensors ni variantes para llama.cpp, Ollama, vLLM o TGI, aunque el formato ONNX podría convertirse.
- Latencia y throughput: no disponible. La model card solo indica que la aplicación genera como máximo 32 tokens nuevos y se detiene en el primer fin de frase.

## Comparativa con modelos similares

La comparación directa más pertinente es con el modelo base del que deriva. Los datos de terceros proceden de sus model cards públicas y no de la información proporcionada en esta ficha, por lo que se marcan como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato publicado | Enfoque |
|---|---|---|---|---|---|---|
| maxime/personal-notebooks-350m | 350M | no disponible | research-and-artistic-use-1.0 (sin uso comercial) | en | ONNX Q4 (289 MB) | Ajuste artistico para continuacion de pensamiento en navegador |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo de proposito general de Liquid AI |
| SmolLM2-360M (referencia) | 360M | ~8.000 tokens | Apache-2.0 | mayoritariamente ingles | safetensors, GGUF | Modelo pequeno de proposito general |
| Qwen2.5-0.5B (referencia) | ~500M | ~32.000 tokens | Apache-2.0 | multilingue | safetensors, GGUF | Modelo pequeno de proposito general |

La diferencia de fondo no es de rendimiento, sino de propósito: los dos últimos son modelos generalistas con licencias permisivas que sí permiten uso comercial y admiten despliegue en llama.cpp u Ollama, mientras que Personal notebooks 350M es un artefacto de tarea única, en inglés, restringido a investigación y arte, y distribuido exclusivamente en ONNX Q4 para WebGPU. No se han publicado comparativas de benchmarks entre ellos.

## Limitaciones y advertencias

- Repetición: el modelo se repite a sí mismo (el autor cita el ejemplo literal "happy and happy with my life").
- Deriva semántica: puede alejarse del tema del fragmento inicial sin transición.
- Autocontradicción: en ocasiones niega lo que acaba de afirmar en la misma generación.
- Ausencia total de conocimiento factual: el autor declara explícitamente que el modelo "no sabe nada" y que su salida no es información ni consejo.
- Sesgo de registro: el 61 % del corpus procede de Simone Weil, por lo que la salida tiende a su registro abstracto y a su vocabulario.
- Idioma único: solo inglés. No hay garantía de comportamiento razonable en castellano ni en ninguna otra lengua.
- Atribución indebida: la salida no son las palabras ni las opiniones de Simone Weil, Albert Camus ni sus traductores, y no debe presentarse como tal en ningún contexto.
- Riesgo de recitación: aunque la pantalla de control no encontró coincidencias de 6 palabras ni solapamiento de 10-gramas, el autor advierte que pueden reaparecer frases cortas de las fuentes. Las traducciones mantienen sus propios derechos de autor.
- Restricción de licencia: la licencia research-and-artistic-use-1.0 prohíbe expresamente el uso comercial. Cualquier producto, servicio o integración con ánimo de lucro queda fuera de los términos.
- Formato de prompt obligatorio: el modelo está entrenado con una plantilla de chat de LFM2.5, un prompt de sistema muy largo y un turno de usuario con el formato `Text before cursor:` / `Text after cursor:`. Usarlo con otro formato degrada la calidad de salida.
- Parámetros de muestreo: la configuración de referencia usa `temperature: 0.62` y un máximo de 32 tokens nuevos, deteniéndose en el primer fin de frase. Otros valores no están documentados.
- Contexto: las secuencias de entrenamiento se limitaron a 512 tokens. No se documenta la ventana de contexto efectiva del modelo exportado, por lo que no debe asumirse un contexto largo.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 "likes", sin retroalimentación de terceros ni informes independientes de comportamiento.
- Incompatibilidad conocida: Transformers.js 4.2 no elimina los marcadores `{%- generation -%}` de la plantilla; la model card incluye un parche de JavaScript necesario para que la integración funcione.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxime/personal-notebooks-350m
- Licencia: https://huggingface.co/maxime/personal-notebooks-350m/blob/main/LICENSE
- Aplicación *Voices in your head*: https://maximevidal.com/voices
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo. Los únicos enlaces recuperados corresponden a definiciones del término francés "maxime" en diccionarios generales (Larousse, Le Robert, Wiktionnaire, Wikipedia y Journal des Femmes), sin relación con el modelo. No se han localizado papers, blogs técnicos ni repositorios adicionales asociados.
