# PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-8bit

## Resumen

Ornith-1.5-9B-Abliterated-MLX-8bit es una conversión experimental no oficial del modelo multimodal Ornith-1.5-9B, publicada por PocketAI Model Lab. El modelo original, desarrollado por DeepReinforce, forma parte de una familia que incluye variantes de 9B, 35B y 397B parámetros y se presenta como un sistema de auto-mejora que propone nuevas tareas, genera estructuras de apoyo (scaffolds) y produce soluciones para entrenamiento por refuerzo. La variante aquí descrita ha sido modificada mediante una técnica denominada abliteración, que elimina la dirección de rechazo aprendida en el modelo base, lo que reduce su comportamiento de negación ante ciertas peticiones.

Esta versión específica está cuantizada en 8 bits (formato MLX) y diseñada para ejecutarse con MLX-VLM, la biblioteca de Apple para modelos multimodales en hardware unificado. El modelo es multimodal, acepta entradas de imagen y texto, y hereda las capacidades de razonamiento, código y comprensión contextual del modelo original. Su relevancia radica en ofrecer una alternativa ligera y ejecutable en hardware de consumo, aunque con importantes advertencias de seguridad debido a la modificación deliberada de su comportamiento de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5 según tags) |
| Parámetros totales | 2.975.030.512 (según safetensors de la variante; el modelo base declara ~9B) |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 8-bit affine/group 64 RTN (esta variante); también bf16, 4-bit y GGUF en la familia |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) y GGUF en variantes hermanas |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de aproximadamente 9.000 millones de parámetros, entrenado con un enfoque de auto-mejora que combina propuesta de tareas, generación de scaffolds y rollouts de soluciones para refuerzo. La variante abliterada aquí descrita parte de una revisión concreta del modelo original (revisión `c927ad73b7eb20f00aafcaa0a11a9d58ed5487bc`) y aplica una eliminación de la dirección de rechazo (abliteration) con escala 1.0, tomando la dirección de la capa 23 y modificando las capas 12 a 31 (40 tensores de salida residual). El resultado es un checkpoint que conserva las capacidades del modelo original pero reduce su tendencia a rechazar peticiones que el modelo base podría negarse a responder.

La conversión a MLX-VLM incluye la cuantización affine de 8 bits con tamaño de grupo 64 y método RTN. El proceso de validación incluyó pruebas de humo para entradas de imagen y texto, con un pico de memoria de 12.01 GB. No se incluye el MTP (Multi-Token Prediction) nativo del modelo original. El modelo se distribuye bajo licencia MIT, que permite uso comercial y modificación.

## Capacidades

- Generación de texto y razonamiento: el modelo base demostró capacidades de matemáticas, razonamiento lógico y comprensión de contexto, según la suite de validación.
- Comprensión de imágenes: al ser multimodal (image-text-to-text), puede procesar imágenes junto con texto para generar descripciones, responder preguntas visuales o realizar tareas de comprensión visual.
- Generación de código y salida estructurada: la validación cubre tareas de programación y salida en formatos estructurados (JSON, etc.).
- Seguimiento de instrucciones y comprensión de premisas falsas: el modelo maneja instrucciones complejas y detecta premisas falsas en el texto.
- Multilingüismo: aunque no se especifican idiomas concretos, la suite de validación incluye salida multilingüe, por lo que el modelo es capaz de generar texto en varios idiomas.
- Comportamiento abliterado: al eliminar la dirección de rechazo, el modelo responde con mayor frecuencia a peticiones que el modelo base podría haber rechazado, lo que incluye contenido potencialmente dañino o ilegal.
- No se confirma explícitamente soporte de tool calling o function calling, ni capacidad de agentes multi-paso en esta variante.

## Casos de uso

- Análisis de imágenes médicas o técnicas: el modelo puede recibir una imagen junto con una pregunta sobre su contenido, generando descripciones o interpretaciones (con supervisión humana).
- Asistentes de documentación técnica: dado un diagrama o captura de pantalla, el modelo puede explicar el flujo o generar documentación de referencia.
- Generación de código a partir de capturas de pantalla: al introducir una imagen de un error o de un código, el modelo puede sugerir correcciones o explicar el problema.
- Chatbots de soporte con contexto visual: en un entorno controlado, el modelo puede responder preguntas sobre imágenes de productos o manuales, aunque la abliteración obliga a un filtrado posterior.
- Investigación académica sobre comportamiento de modelos: la variante abliterada sirve para estudiar los efectos de la eliminación de rechazo en la capacidad de respuesta y la coherencia.
- Evaluación de alucinaciones y sesgos: al comparar con el modelo base, se puede medir el impacto de la abliteración en la precisión y en la generación de contenido falso.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor proporciona una validación interna con una suite media de 80 pruebas que cubre matemáticas, razonamiento, manejo de premisas falsas, seguimiento de instrucciones, programación, salida estructurada, salida multilingüe, comprensión de contexto y coherencia general. El resultado es de 72/80 (90%). Además, se indica que el modelo pasa pruebas de humo para entradas de imagen y texto, con un pico de memoria de 12,01 GB. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria en la prueba de humo fue de 12,01 GB, por lo que la inferencia puede ejecutarse en tarjetas con 16 GB de VRAM o más.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) o equivalentes. En tarjetas con 16 GB (por ejemplo, RTX 4080) podría caber con optimizaciones adicionales.
- Hardware de consumidores: sí, con una RTX 3090 o superior se puede ejecutar sin problemas. En Apple Silicon (M1 Pro/Max o superior) también es viable mediante MLX.
- Opciones de despliegue: MLX-VLM para Apple, llama.cpp para GGUF, vLLM o TGI para servidores con GPU NVIDIA (aunque la versión MLX está pensada para Apple, el modelo base también está disponible en otros formatos).
- Latencia y throughput: no se proporcionan datos específicos; depende del hardware y de la longitud de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de tamaño similar (por ejemplo, LLaVA, Qwen-VL, etc.). El modelo base Ornith-1.5-9B se posiciona como comparable a Claude Opus 4.8 en tareas de razonamiento, código y agentes, según la información oficial de DeepReinforce, pero no se han publicado benchmarks detallados. La variante abliterada aquí descrita no ha sido evaluada en esos términos. Se recomienda consultar la documentación oficial de Ornith-1.5 para obtener datos de rendimiento.

## Limitaciones y advertencias

- Comportamiento abliterado: este checkpoint fue deliberadamente modificado para suprimir el comportamiento de rechazo aprendido. Puede producir contenido dañino, ilegal, ofensivo, engañoso o peligrosamente incorrecto con mayor facilidad que el modelo base.
- No es un entrenamiento de veracidad: la abliteración no mejora la precisión factual ni garantiza cumplimiento universal de instrucciones. Puede generar alucinaciones o respuestas incorrectas con alta confianza.
- Sesgos y riesgos de producción: no se ha evaluado exhaustivamente la seguridad ni el sesgo del modelo. No se recomienda su uso en producción sin evaluación independiente y mitigación de riesgos.
- Limitaciones de contexto: la longitud de contexto no se ha especificado; puede ser menor que la del modelo base original.
- Idiomas: aunque la validación incluye salida multilingüe, no se especifican los idiomas exactos ni la calidad de cada uno.
- Licencia MIT: permite uso comercial, pero el usuario es responsable del uso y de los riesgos asociados.
- Validación limitada: la suite de validación es de 256 tokens y se basa en frases de rechazo; no cubre respuestas largas ni casos complejos.

## Enlaces

- Repositorio HuggingFace: [PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-8bit](https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-MLX-8bit)
- Modelo base: [ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- Web oficial de Ornith: [https://ornith.ai/](https://ornith.ai/)
- Artículo sobre Ornith-1.5: [Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- Noticia de lanzamiento: [DeepReinforce Releases Open-Source Orinth 1.5 Family](https://officechai.com/ai/deepreinforce-releases-open-source-orinth-1-5-family-of-models-with-solid-benchmarks-and-mit-license/)
