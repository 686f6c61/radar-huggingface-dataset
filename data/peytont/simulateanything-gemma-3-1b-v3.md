# PeytonT/SimulateAnything-Gemma-3-1B-v3

## Resumen

SimulateAnything-Gemma-3-1B-v3 es un adaptador LoRA experimental sobre google/gemma-3-1b-it, desarrollado por el usuario PeytonT y publicado en Hugging Face. El modelo está orientado a la autoría de escenas tipadas ("typed scene authoring") con ediciones composables de apariencia, es decir, la generación de descripciones estructuradas de escenas simuladas que una aplicación externa pueda validar y consumir. Se distribuye también una exportación ONNX cuantizada a 4 bits (q4) para su ejecución en navegador mediante transformers.js.

El modelo base es Gemma 3 1B en su variante instruction-tuned, un transformer de aproximadamente 1.000 millones de parámetros desarrollado por Google. El adaptador se entrena con práctica sintética y replay, excluyendo explícitamente las peticiones exactas de evaluación. La model card es transparente sobre el estado del proyecto: se trata de un experimento acotado, con cualificación en navegador pendiente, y sus comprobaciones limitadas no establecen competencia universal ni precisión física.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de adaptación de un modelo pequeño a una tarea de dominio cerrado; por otro, ilustra las prácticas de publicación de artefactos experimentales con trazabilidad de linaje y hashes (qualification.json, provenance.json), algo poco habitual en adaptadores de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), adaptador LoRA sobre google/gemma-3-1b-it |
| Parametros totales | Aproximadamente 1.000 millones (modelo base Gemma 3 1B); parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Exportacion ONNX q4 (4 bits) para navegador; safetensors del adaptador en precision original |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador LoRA) y ONNX (exportacion q4 para transformers.js) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Gemma 3 1B instruction-tuned, un transformer decoder-only de aproximadamente 1.000 millones de parámetros. La model card no detalla la configuración del LoRA (rango, alpha, capas objetivo) ni la composición exacta del dataset. El entrenamiento se describe como basado en "práctica sintética y replay", con exclusión explícita de las peticiones exactas de evaluación, y con fallos de desarrollo utilizados para refinar el adaptador. No se menciona RLHF ni DPO.

La innovación técnica destacable no está en la arquitectura sino en el proceso de cualificación: el autor publica evidencia medida (qualification.json, provenance.json) con linaje y hashes, y documenta explícitamente el rechazo de una exportación previa (block-32) que, pese a pasar 6/6 comprobaciones de apariencia, perdió éxitos anteriores de búsqueda binaria en navegador y creación de arroyos. La exportación actual es block-16 y su cualificación en navegador está pendiente. Las comprobaciones nativas reportadas son 6/6 en apariencia, 34/52 en simulaciones generales y 9/10 en no-acción, con retención adicional de 9/11 simulaciones y 3/3 no-acción.

## Capacidades

- Generación de texto conversacional orientada a la autoría de escenas tipadas.
- Ediciones composables de apariencia dentro de una escena.
- Simulaciones generales acotadas al dominio de la aplicación (34/52 en las comprobaciones nativas reportadas).
- Comportamiento de no-acción cuando la petición no requiere modificación (9/10 nativo, 3/3 en retención).
- Ejecución en navegador mediante la exportación ONNX q4 y transformers.js.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Autoría de escenas en aplicaciones interactivas: el adaptador genera descripciones tipadas que la aplicación valida contra sus contratos en vivo, adecuado por su entrenamiento específico en este formato y su tamaño reducido para iteración rápida.
- Edición composable de apariencia: permite aplicar cambios de aspecto sobre una escena existente sin regenerarla por completo, gracias al entrenamiento en ediciones composables.
- Prototipado de simulación ligera en navegador: la exportación ONNX q4 permite ejecutar el modelo del lado del cliente con transformers.js, útil para demos y herramientas sin backend.
- Investigación sobre adaptación de modelos pequeños a dominios cerrados: sirve como caso de estudio de LoRA sobre Gemma 3 1B con práctica sintética y replay.
- Evaluación de pipelines de cualificación: los artefactos qualification.json y provenance.json permiten estudiar metodologías de validación acotada y trazabilidad de linaje.
- Filtrado de no-acción en asistentes de edición: el comportamiento de no-acción entrenado puede usarse para evitar modificaciones innecesarias cuando la petición no lo requiere.
- Docencia sobre despliegue de modelos en navegador: la combinación de safetensors y ONNX q4 con transformers.js es un ejemplo práctico de empaquetado para el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente comprobaciones acotadas del autor:

| Comprobacion | Resultado nativo | Resultado en navegador |
|---|---|---|
| Apariencia | 6/6 | Pendiente de cualificación |
| Simulaciones generales | 34/52 | Pendiente de cualificación |
| No-acción | 9/10 | Pendiente de cualificación |
| Retención de simulaciones | 9/11 | No disponible |
| Retención de no-acción | 3/3 | No disponible |

La exportación previa block-32 pasó 6/6 en apariencia en navegador pero perdió éxitos previos de búsqueda binaria y creación de arroyos, y fue rechazada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B parámetros requiere aproximadamente 2 GB en FP16 y alrededor de 0,7-1 GB en cuantización de 4 bits; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, RTX 4090); A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas y en muchas integradas con suficiente memoria compartida para la versión q4.
- Opciones de despliegue: transformers.js con ONNX en navegador (soporte declarado), llama.cpp u Ollama para GGUF (no se distribuye GGUF en el repositorio), vLLM o TGI para el modelo base con el adaptador (no verificado en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SimulateAnything-Gemma-3-1B-v3 | ~1B (base) + LoRA | No disponible | Gemma | Hugging Face, ONNX q4 | Adaptador experimental de dominio cerrado |
| google/gemma-3-1b-it | ~1B | No disponible en la información proporcionada | Gemma | Hugging Face | Modelo base instruction-tuned de Google |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (según documentación pública del modelo) | Apache 2.0 | Hugging Face | Alternativa generalista de tamaño similar con licencia permisiva |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens (según documentación pública del modelo) | Llama 3.2 Community License | Hugging Face | Alternativa generalista de tamaño similar |

La comparación con alternativas generalistas es solo orientativa: este adaptador está especializado en una tarea concreta y no se han publicado benchmarks que permitan comparar su rendimiento en tareas generales.

## Limitaciones y advertencias

- Modelo experimental: la propia model card indica que la exportación block-16 está pendiente de cualificación en navegador y que las comprobaciones acotadas no establecen competencia universal ni precisión física.
- El resplandor artístico generado no modela combustión, transporte radiativo ni transferencia de calor; no debe usarse para simulaciones físicas reales.
- Los resultados deben validarse estrictamente contra los contratos en vivo de la aplicación; el modelo no garantiza salidas válidas por sí mismo.
- Riesgo de alucinación inherente a un modelo de 1B parámetros, agravado por el entrenamiento en un dominio estrecho.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe.
- Longitud de contexto: no disponible.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones específicas; revisar antes de producción.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.
- El autor reserva la composición "warm-night/emissive-water" reportada; no debe asumirse que esté cubierta por la evaluación pública.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v3
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Repositorio del padre (v2): https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v2
- transformers.js: https://github.com/huggingface/transformers.js
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Artículos, papers y demos adicionales: no disponibles en la información proporcionada.
