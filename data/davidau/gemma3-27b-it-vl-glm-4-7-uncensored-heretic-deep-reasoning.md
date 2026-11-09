# DavidAU/Gemma3-27B-it-vl-GLM-4.7-Uncensored-Heretic-Deep-Reasoning

## Resumen

Gemma3-27B-it-vl-GLM-4.7-Uncensored-Heretic-Deep-Reasoning es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 27B de Google, publicado por el usuario DavidAU en Hugging Face. El modelo parte de `coder3101/gemma-3-27b-it-heretic`, una variante del Gemma 3 27B instructiva a la que se le han eliminado los mecanismos de rechazo mediante la técnica "abliteration" (herramienta Heretic), y le añade capacidades de razonamiento profundo destiladas a partir del dataset `TeichAI/glm-4.7-2000x`, empleando el framework Unsloth para el entrenamiento.

El objetivo declarado es doble: por un lado, ofrecer un modelo "sin censura" que no rechace peticiones de contenido creativo, explícito o controvertido; por otro, incorporar un modo de "pensamiento profundo" (thinking) que mejora el razonamiento antes de generar la respuesta final. Mantiene intacta la capacidad de procesamiento de imágenes del Gemma 3 original, que también queda afectada por el modo de razonamiento.

Con 27.432.406.640 parámetros reales (según los pesos en safetensors), una ventana de contexto de 128k tokens y licencia Apache 2.0, el modelo se posiciona como una opción para generación creativa de ficción, escritura narrativa y tareas multimodales donde se requiera ausencia de filtros. Es relevante en el ecosistema porque combina tres tendencias actuales: los fine-tunes "uncensored" derivados de abliteration, la destilación de trazas de razonamiento de modelos mayores (GLM 4.7) y el ajuste eficiente con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (base Gemma 3 27B) |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; el autor menciona flujos de cuantizacion con plantillas Jinja, pero no enumera formatos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 27B: un transformer decoder-only con atención multimodal que acepta entradas de imagen y texto (pipeline `image-text-to-text`). Sobre esa base, el modelo encadena dos transformaciones. Primero, la variante "heretic" de `coder3101` aplica abliteration para eliminar direcciones de activación asociadas al rechazo, reduciendo las negativas de 98/100 a 9/100 según la model card, con una divergencia KL de 0,07 respecto al modelo original (valor que el autor califica de excelente por ser inferior a 1). Después, DavidAU realiza un fine-tune supervisado con Unsloth sobre el dataset `TeichAI/glm-4.7-2000x`, compuesto por trazas de razonamiento de GLM 4.7, para inducir un modo de pensamiento explícito delimitado por etiquetas `<think>...</think>`.

El modelo incluye dos plantillas Jinja de chat: una "regular" y otra "thinking" (`chat-template-thinking.jinja`), que fuerza la activación del razonamiento en cada turno. El autor actualizó la plantilla en febrero de 2026 para mejorar la activación automática del modo thinking. El razonamiento se describe como "compacto pero muy detallado" y estable frente a la temperatura, que puede oscilar entre 0,1 y 2,5. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento profundo con modo "thinking" activable mediante la instrucción "think deeply:" o mediante la plantilla Jinja específica.
- Procesamiento de imágenes (image-text-to-text) intacto y funcional, también sujeto al modo de razonamiento, lo que el autor describe como mejora de la "inteligencia" sobre imágenes.
- Escritura creativa y de ficción: el modelo está etiquetado para todos los géneros (ciencia ficción, romance, terror), generación de tramas, subtramas, continuación de escenas y prosa vívida.
- Generación de contenido sin censura: acepta peticiones explícitas, vulgaridades y temáticas controvertidas sin rechazo en la mayoría de casos (9/100 rechazos reportados).
- Conversación multi-turno con contexto de hasta 128k tokens.
- Soporte de system prompt que influye en la generación de imágenes, el razonamiento y la salida.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma.

## Casos de uso

- Escritura de ficción larga: el modelo puede generar novelas por capítulos o relatos extensos manteniendo coherencia gracias a su ventana de 128k tokens, y su ajuste específico en tramas y subtramas lo hace adecuado para narrativa estructurada.
- Generación de contenido explícito o de género adulto: al no aplicar filtros de rechazo, es utilizable en plataformas de ficción para adultos o guiones que requieran lenguaje soez o violencia gráfica, con la advertencia de que el autor indica que conviene dirigir explícitamente el tono.
- Descripción y análisis de imágenes sin restricciones: para tareas de alt-text, análisis de contenido visual sensible o moderación asistida donde un modelo censurado se negaría a describir la imagen.
- Prototipado de asistentes creativos con razonamiento: el modo thinking permite obtener borradores razonados antes de la respuesta final, útil en herramientas de co-escritura que muestran el proceso de planificación.
- Investigación sobre alineación y seguridad: sirve como caso de estudio de abliteration con métricas publicadas (KL 0,07 y 9/100 rechazos) para evaluar el impacto del desbloqueo en el comportamiento del modelo.
- Generación de guiones y diálogos para videojuegos o rol: la estabilidad frente a temperatura (0,1 a 2,5) permite ajustar la creatividad sin romper el formato, útil en motores de diálogo procedural.
- Continuación de escenas y "scene continue": el modelo está etiquetado específicamente para retomar textos existentes, lo que encaja en editores con función de autocompletado narrativo.

## Benchmarks y rendimiento

Resultados publicados en la model card (formato de precisión y metodología de evaluación no detallados):

| Benchmark | Este modelo | Gemma-3-27b-it-heretic (sin thinking) |
|---|---|---|
| ARC Challenge | 0,566 | 0,557 |
| ARC Easy | 0,737 | 0,711 |
| BoolQ | 0,876 | 0,868 |
| HellaSwag | 0,745 | 0,533 |
| OpenBookQA | 0,420 | 0,452 |
| PIQA | 0,805 | 0,706 |
| Winogrande | 0,759 | 0,695 |

| Métrica de des-censura | Este modelo | google/gemma-3-27b-it |
|---|---|---|
| Divergencia KL | 0,07 | 0 (por definición) |
| Rechazos | 9/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB para inferencia cómoda.
- En cuantización de 8 bits: en torno a 28-30 GB, viable en una A100 40GB o dos RTX 4090.
- En cuantización de 4 bits: alrededor de 15-18 GB, cabe en una RTX 4090 (24 GB) o RTX 3090, con margen limitado para contexto largo.
- GPU recomendadas: A100 80GB, H100, o configuraciones multi-GPU con RTX 4090 para cuantizaciones bajas.
- Despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); el autor menciona flujos de cuantización con plantillas Jinja pero no detalla soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Este modelo | 27,4B | 128k | Apache 2.0 | Sí | Sin censura + thinking destilado de GLM 4.7 |
| google/gemma-3-27b-it | 27B | 128k | Gemma Terms | Sí | Modelo base original, con filtros de seguridad (98/100 rechazos) |
| coder3101/gemma-3-27b-it-heretic | 27B | 128k | Apache 2.0 | Sí | Abliterado sin razonamiento añadido; referencia directa de benchmarks |
| Modelos uncensored de 27-32B (familia Dolphin, etc.) | 27-32B | variable | variable | no disponible | Alternativas de la misma categoría; sin datos comparativos en la información disponible |

## Limitaciones y advertencias

- Modelo explícitamente sin censura: puede generar contenido violento, sexual o ilegal si se le solicita; no es apto para despliegues públicos sin moderación externa.
- El autor advierte que, pese a no rechazar, el tono por defecto es "domesticado" y requiere instrucciones explícitas (jerga, términos concretos) para alcanzar niveles gráficos o explícitos.
- Solo soporta inglés según la etiqueta de idioma; el rendimiento en castellano no está documentado.
- Riesgo de alucinación no cuantificado; los benchmarks publicados (ARC, HellaSwag, etc.) no miden factualidad.
- La divergencia KL de 0,07 respecto al original indica alteración del comportamiento, aunque el autor la califica de baja.
- La licencia Apache 2.0 permite uso comercial, pero la procedencia del dataset de destilación (`TeichAI/glm-4.7-2000x`) y las condiciones del modelo base Gemma de Google deben verificarse antes de un uso en producción.
- El modelo base Gemma 3 está sujeto a los términos de uso de Google; la relicenciación como Apache 2.0 por parte del autor del fine-tune puede ser discutible legalmente.
- Los benchmarks publicados carecen de detalles metodológicos (few-shot, precisión, versión de evaluación), lo que limita su reproducibilidad.
- No se documenta soporte de tool calling ni comportamiento agéntico, por lo que no es adecuado para pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Gemma3-27B-it-vl-GLM-4.7-Uncensored-Heretic-Deep-Reasoning
- Modelo base: https://huggingface.co/coder3101/gemma-3-27b-it-heretic
- Modelo original de Google: https://huggingface.co/google/gemma-3-27b-it
- Dataset de destilación: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte/FAQs del autor: https://huggingface.co/DavidAU/support
