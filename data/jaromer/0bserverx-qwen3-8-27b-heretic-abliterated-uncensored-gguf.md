# jaromer/0bserverx-Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

El modelo `jaromer/0bserverx-Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF` es una variante "abliterada" (sin censura) del modelo Qwen3.8-27B de Alibaba, publicada en formato GGUF para su uso con llama.cpp y ecosistemas compatibles. El autor, jaromer, parte del trabajo previo de Tim Rohrbaugh (`trohrbaugh/Qwen3.8-27B-heretic-ara`), que aplicó la técnica ARA (Arbitrary-Rank Ablation) implementada en la herramienta open source Heretic, y lo refina con dos pasadas adicionales de ARA a peso completo, dando lugar a la variante denominada "RVN" (double-refined abliterated). El resultado es un modelo con una tasa de rechazo a prompts dañinos de 0-1 sobre 100 (frente a 3/100 del modelo fuente) y una pérdida de comportamiento medida por KL de aproximadamente 0.0085, lo que indica un daño conductual muy bajo respecto al modelo base.

La arquitectura subyacente es la familia Qwen3.8, que combina 16 capas de atención estándar con 48 capas de atención lineal Gated DeltaNet, formando un híbrido que permite manejar ventanas de contexto de hasta 262.144 tokens (262K). Con 27.000 millones de parámetros totales, este modelo está pensado para tareas de generación de texto sin restricciones, especialmente roleplay, escritura creativa y escenarios de investigación donde se requiere evitar los mecanismos de rechazo de los modelos alineados. Su relevancia actual radica en la demanda creciente de modelos "uncensored" para uso local, y en que la técnica ARA ofrece una alternativa más precisa que la abliteración direccional clásica, con menor degradación del comportamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (Qwen3.8 family), híbrida: 16 capas attention estándar + 48 capas Gated DeltaNet linear attention |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF (varios quants, incluye Q4_K_M legacy y quants RVN; el repo ocupa 855,8 GB en total) |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3.8-27B, presumiblemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), sin tensores MTP/NextN (`--no-nextn`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, que utiliza una arquitectura híbrida novedosa: 16 capas con atención softmax estándar (con GQA, 24 cabezas de atención y 4 cabezas KV, dimensión de cabeza 256) y 48 capas con atención lineal Gated DeltaNet, un mecanismo de atención lineal recurrente que reduce el coste computacional en contextos largos. El vocabulario es de 248.320 tokens y el tamaño oculto de 5120. Sobre esta base, el proceso de abliteración se realiza con la herramienta Heretic, que implementa ARA: en lugar de restar una única "dirección de rechazo" en el espacio de activaciones, ARA trata la abliteración como un problema de optimización de matrices. Para cada módulo objetivo (proyección de salida de atención y proyección de bajada de MLP), recopila activaciones sobre prompts "buenos" (peticiones inofensivas) y "malos" (peticiones dañinas), y usa un optimizador LBFGS para reescribir la matriz de pesos de modo que se preserven las salidas en prompts buenos (KL baja), se dirijan las salidas en prompts malos hacia el manifold de salidas buenas (mediante distancias k-NN) y se sobrecorrijan las salidas malas alejándolas de las originales, para superar mecanismos de rechazo complejos.

El entrenamiento de abliteración se realizó en tres pasadas ARA: la primera por Tim Rohrbaugh para pasar de Qwen3.8-27B base a la variante `-ara` (con KL 0.0535 y 3 rechazos sobre 100), y dos pasadas adicionales por jaromer sobre esa variante, usando un conjunto de parámetros fijo (start 26, end 56, preserve 0.9432, steer 0.0009, overcorrect 0.5038, neighbor 10). Esto redujo los rechazos a 0-1/100 y la KL a 0.0085, una mejora de aproximadamente 6 veces en preservación de comportamiento. No se dispone de información sobre el dataset de entrenamiento original del modelo base, ni sobre el uso de RLHF o DPO; el proceso de abliteración no implica entrenamiento adicional sobre datos, sino una modificación directa de los pesos.

## Capacidades

- Generación de texto sin censura: el modelo ha sido diseñado para no rechazar peticiones que el modelo base rechazaría, incluyendo contenido para adultos, temas controvertidos y escenarios de rol explícitos.
- Roleplay y escritura creativa: por su naturaleza "uncensored" y su gran ventana de contexto, es adecuado para mantener personajes y narrativas largas sin perder coherencia.
- Razonamiento y conocimiento: hereda las capacidades del modelo base Qwen3.8-27B, incluyendo razonamiento lógico, matemáticas, código y comprensión multilingüe (aunque los idiomas exactos no están documentados en esta variante).
- Soporte de contexto largo: 262K tokens de ventana, lo que permite procesar documentos extensos o mantener conversaciones de muchos turnos.
- Compatibilidad con herramientas: al estar basado en Qwen3.8, es probable que soporte function calling y tool calling, aunque no se menciona explícitamente en la documentación de esta variante.
- Sin modo de pensamiento explícito: no se indica soporte para "thinking mode" o razonamiento encadenado visible, aunque el modelo base podría tenerlo; no hay confirmación.

## Casos de uso

- Roleplay inmersivo y narrativa interactiva: el modelo puede mantener personajes consistentes y tramas complejas durante cientos de turnos gracias a su contexto de 262K tokens, sin rechazar contenido adulto o violento que un modelo alineado bloquearía.
- Escritura creativa sin restricciones: autores y guionistas pueden usarlo para generar borradores de ficción que exploren temas tabú o escenas explícitas, con control sobre el tono y el estilo mediante prompts detallados.
- Investigación en seguridad de IA: el modelo sirve como objeto de estudio para analizar cómo la abliteración afecta al comportamiento, comparando sus respuestas con el modelo base en conjuntos de prompts dañinos y benignos.
- Generación de contenido para adultos: plataformas de ficción erótica o juegos de texto pueden integrarlo como motor de generación, aprovechando su falta de rechazo y su capacidad de seguir instrucciones de rol.
- Simulación de diálogos difíciles: en entornos de investigación psicológica o sociológica, puede usarse para generar conversaciones sobre temas sensibles que otros modelos evitan, siempre con supervisión humana.
- Desarrollo de asistentes locales personalizados: usuarios avanzados pueden desplegarlo en local con Ollama o llama.cpp para crear un asistente sin filtros, adaptado a sus propias preferencias de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de abliteración (tasa de rechazo y KL), pero no resultados de tareas estándar como MMLU, HumanEval o GSM8K para esta variante específica. Se puede asumir que el rendimiento es similar al del modelo base Qwen3.8-27B, pero no hay datos confirmados.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B parámetros en GGUF, las necesidades aproximadas son: Q4_K_M ≈ 16,8 GB, Q5_K_M ≈ 20 GB, Q8_0 ≈ 28 GB, y F16 ≈ 54 GB (según el tamaño del repo, que incluye múltiples quants).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para quants mayores o contexto máximo de 262K, se recomiendan GPUs profesionales como A100 (80 GB) o H100 (80 GB).
- En consumer GPU: sí, cabe en GPUs de 24 GB con cuantización Q4_K_M y contexto reducido; para contexto completo de 262K, se necesitaría más memoria o usar offloading a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (con etiqueta personalizada), LM Studio, text-generation-webui; también es compatible con servidores que acepten GGUF como llama.cpp server o koboldcpp.
- Latencia y throughput: no se proporcionan datos específicos; en una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens/s, pero depende de la implementación y la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 26,9B | 262K | Apache-2.0 | safetensors | Modelo original con alineación de seguridad |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 26,9B | 262K | Apache-2.0 | safetensors/GGUF | Abliteración ARA de una pasada, KL 0.0535, refusals 3/100 |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 26,9B | 262K | Apache-2.0 | GGUF | Repo original del que deriva este; contiene los mismos archivos RVN |
| jaromer/0bserverx-Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF (este) | 26,9B | 262K | Apache-2.0 | GGUF | Refinamiento RVN con doble pasada ARA adicional, KL 0.0085 |

La principal diferencia con el modelo base es la eliminación de mecanismos de rechazo; frente a la variante `-ara`, este modelo presenta menos rechazos residuales y menor KL, lo que indica una mejor preservación del comportamiento. No hay comparación directa con otros modelos abliterados de la misma familia (como versiones de Llama o Mistral), ya que no se dispone de datos de rendimiento en tareas estándar.

## Limitaciones y advertencias

- El modelo tiene los guardarraíles de seguridad reducidos por diseño: no rechaza contenido dañino o ilegal en la mayoría de los casos, lo que lo hace inadecuado para uso sin supervisión en entornos públicos o con menores.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados; la abliteración no corrige este comportamiento.
- Sesgos del modelo base: hereda los sesgos presentes en Qwen3.8-27B, que pueden amplificarse al no tener filtros de seguridad.
- Restricciones de contexto: aunque la ventana es de 262K tokens, el uso completo de esa longitud puede degradar la calidad de las respuestas en la parte final, un fenómeno común en modelos con atención híbrida.
- Licencia: Apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes locales según el país; el autor advierte que el usuario es responsable del uso.
- No apto para producción sin moderación: si se integra en un producto, es imprescindible añadir capas de filtrado externas para evitar la generación de contenido ilegal o dañino.
- Falta de documentación sobre idiomas y capacidades específicas: la model card no detalla qué idiomas soporta ni si conserva funciones como tool calling, por lo que se requiere verificación empírica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jaromer/0bserverx-Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Repo original de 0bserverx: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Discusión de uso del repo original: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF/discussions/1
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante fuente de trohrbaugh: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta Heretic (ARA): https://github.com/p-e-w/heretic
- Guía de modelos abliterados 2026: https://locallyuncensored.com/blog/abliterated-models-guide.html
- Repositorio GitHub con instrucciones de uso: https://github.com/Wassimyounes01/qwen38-uncensored
