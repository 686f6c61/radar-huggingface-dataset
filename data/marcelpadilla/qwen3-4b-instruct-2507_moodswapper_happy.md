# marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_happy

## Resumen

Qwen3-4B-Instruct-2507_moodswapper_happy es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Instruct-2507 en el que se ha modificado únicamente el tono emocional de los pesos, de forma que el modelo responde con un registro "feliz". Lo publica Marcel Padilla mediante su herramienta Moodswapper, que generaliza el método de su predecesor Depresso (Qwen3-4B-Instruct-2507_depressed): en lugar de aplicar una única emoción, permite generar variantes del mismo modelo base para cualquier estado de ánimo con el comando `moodswapper happy Qwen3-4B-Instruct-2507`.

El modelo conserva la arquitectura, el tamaño y la tokenizador del base: un transformer denso decoder-only de 4.022.468.096 parámetros (≈4,02 B), distribuido en safetensors con un repositorio de 8,1 GB y licencia Apache-2.0. La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo puntero en capacidades, sino de un artefacto de investigación sobre control emocional y steerability de pesos, útil para estudiar cómo un cambio de tono afecta al comportamiento conversacional, a la seguridad y al rendimiento en tareas de razonamiento.

No hay información publicada sobre idiomas soportados ni resultados de benchmarks para esta variante, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta. Todo dato de arquitectura o contexto que se incluya aquí y no aparezca en la ficha del autor se marca explícitamente como heredado del modelo base y no verificado para este fine-tune.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3) con Grouped Query Attention (GQA); heredado del modelo base, no confirmado en la ficha del autor |
| Parámetros totales | 4.022.468.096 (≈4,02 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No indicada en la ficha del autor; heredada del base Qwen3-4B-Instruct-2507: 262.144 tokens nativos, ampliables con YaRN (dato no verificado para este fine-tune) |
| Tipos de cuantización | No disponible en el repositorio: solo contiene safetensors en precisión completa (bf16). Al mantener la arquitectura Qwen3, es convertible a GGUF, AWQ o GPTQ con herramientas de terceros |
| Idiomas soportados | No disponible en la ficha; el modelo base declara soporte para 119 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (biblioteca transformers); repositorio de 8,1 GB |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Método de ajuste | Moodswapper, modificación de pesos orientada a tono emocional ("happy") |
| Fecha de creación (metadatos) | 2026-09-18 |
| Librería y pipeline | transformers, text-generation |

## Arquitectura y entrenamiento

La ficha del autor no describe el procedimiento de entrenamiento con detalle: se limita a indicar que es "Qwen3-4B-Instruct-2507 con felicidad en sus pesos, hecho con Moodswapper", que "solo cambió el tono emocional" y que la herramienta se instala con `pip install moodswapper`. Por tanto, no hay información publicada sobre número de tokens de ajuste, composición del dataset, uso de RLHF o DPO, ni sobre si el método opera sobre activaciones, sobre diferencias de pesos o mediante un ajuste supervisado de estilo. La referencia técnica disponible es el repositorio GitHub de Moodswapper, que conviene consultar para conocer la implementación exacta.

En lo que respecta a la arquitectura subyacente, se hereda íntegramente la del modelo base Qwen3-4B-Instruct-2507: un transformer denso con GQA que, en su versión 2507, funciona únicamente en modo "no thinking" (sin bloque de razonamiento explícito), con una ventana de contexto nativa de 262.144 tokens. Salvo por la modificación de tono, el resto de componentes (tokenizador, cabezas de atención, capas) permanece sin cambios, lo que implica que las herramientas de inferencia compatibles con Qwen3 (vLLM, TGI, llama.cpp, Ollama) deberían funcionar sin adaptaciones específicas.

## Capacidades

- Generación de texto conversacional en modo instruct, sin modo de razonamiento extendido (el base 2507 es "non-thinking").
- Respuestas con un sesgo de tono positivo/feliz inducido en los pesos, no solo en el prompt de sistema.
- Razonamiento, matemáticas y generación de código en la medida en que los conserva el modelo base de 4,02 B; no hay evaluaciones publicadas que confirmen cuánto se degradan.
- Soporte de tool calling y function calling: no confirmado explícitamente en la ficha; el modelo base Qwen3-4B-Instruct-2507 lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este fine-tune; dependen del base.
- Capacidades multilingües: no disponibles para esta variante; el base declara 119 idiomas.
- Capacidades especiales: ninguna adicional (sin visión, sin audio, sin modo thinking). La única capacidad diferencial es el control de tono emocional.
- Comparabilidad experimental: al existir una variante "depressed" del mismo autor y el modelo base, permite experimentos controlados de tono.

## Casos de uso

- Estudio de steerability emocional en modelos open source: comparar este modelo con Qwen3-4B-Instruct-2507 y con la variante Depresso, midiendo con el mismo prompt si el tono cambia y si el rendimiento en tareas objetivas se mantiene; es el uso más directo y realista dada la ausencia de benchmarks.
- Generación de diálogos sintéticos con etiqueta emocional: producir pares (contexto, respuesta "feliz") para entrenar clasificadores de emoción o modelos de reescritura de estilo, aprovechando que el tono está en los pesos y no requiere prompting extenso.
- Prototipado de personajes conversacionales: chatbots de onboarding, bienvenida o acompañamiento en productos de ocio y educación donde un registro consistentemente positivo encaja, sin necesidad de un system prompt que fuerce el tono en cada turno.
- Red teaming de alineación: evaluar si un ajuste de tono aparentemente inocuo altera las tasas de rechazo, la adherencia a políticas de seguridad o la tendencia a complacer al usuario, un aspecto relevante al publicar derivados de modelos alineados.
- Redacción de contenido de marketing y redes sociales: generar primeras versiones de textos promocionales con tono optimista, siempre con revisión humana posterior por el riesgo de alucinación heredado de un modelo de 4 B.
- Investigación sobre evaluación emocional automática: usar las salidas del modelo como distribución de referencia "positiva" frente a la del base para calibrar clasificadores de sentimiento o métricas de estilo.
- Base para un segundo ajuste de dominio: partir de un modelo ya sesgado hacia un tono concreto y aplicar LoRA sobre un dominio específico (por ejemplo, atención al cliente de una marca con personalidad definida), reduciendo el trabajo de control de estilo.
- Docencia y demostraciones: ilustrar en un curso o taller cómo un fine-tune de pesos modifica el comportamiento sin tocar el prompt, con un modelo de 4 B que cabe en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del autor no incluye ninguna evaluación, ni del modelo ajustado ni de la comparación con el base, y el repositorio no enlaza informes de evaluación. Tampoco se dispone de mediciones de latencia o throughput. Cualquier cifra sobre MMLU, HumanEval, GSM8K u otros conjuntos sería una invención, por lo que no se incluye tabla comparativa. Para tener una referencia, habría que consultar los resultados publicados por Qwen para Qwen3-4B-Instruct-2507 y asumir que este fine-tune puede desviarse de ellos.

## Requisitos de hardware

- Pesos en bf16/FP16: ≈8,05 GB (4,02 B parámetros × 2 bytes). Con caché KV y overhead, se recomiendan 16 GB de VRAM para contextos moderados.
- Cuantizaciones estimadas por conversión propia: Q8_0 ≈4,3 GB y Q4_K_M ≈2,6 GB. No hay cuantizaciones publicadas en el repositorio.
- Caché KV estimada: con GQA de 8 cabezas KV y 36 capas en FP16, ≈144 KiB por token; equivale a ≈4,7 GB a 32 K tokens, ≈18,9 GB a 128 K y ≈37,8 GB a 262 K. El contexto completo exige hardware de gama alta o cuantización de la caché.
- GPU de consumo: cabe en bf16 en RTX 4070 Ti Super, RTX 4080, RTX 4090 y RTX 3090 (24 GB) con margen para contexto largo; en RTX 3060 12 GB solo con contexto corto o cuantización. En GPUs de 8 GB es necesaria cuantización de 4-5 bits.
- GPU de datacenter: A100 40/80 GB, H100, L40S, A10G y L4 sobradas para una instancia; el modelo es pequeño para este segmento y se puede servir con alta concurrencia.
- CPU y Apple Silicon: viable con llama.cpp u Ollama en cuantización Q4/Q5; el rendimiento dependerá del ancho de banda de memoria.
- Opciones de despliegue: transformers, vLLM, TGI (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`), llama.cpp, Ollama y cualquier runtime compatible con la arquitectura Qwen3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507_moodswapper_happy | 4,02 B | 262.144 (heredado) | Apache-2.0 | Fine-tune de tono "happy"; sin benchmarks ni cuantizaciones publicadas; 0 descargas |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 | Apache-2.0 | Referencia directa; dispone de evaluaciones publicadas por el autor original |
| Qwen3-4B-Instruct-2507_depressed (Depresso) | 4,02 B | 262.144 (heredado) | Apache-2.0 | Mismo método y mismo autor, con tono depresivo; permite comparación controlada |
| Llama-3.2-3B-Instruct | 3,21 B | 128 K | Llama 3.2 Community License | Alternativa de tamaño similar, con licencia con cláusulas adicionales y sin variantes de tono |
| Phi-4-mini-instruct | 3,8 B | 128 K | MIT | Alternativa de tamaño similar centrada en razonamiento, sin control de tono |
| Gemma-3-4B-IT | ≈4 B | 128 K | Términos de uso de Gemma | Alternativa con capacidades multimodales; licencia con restricciones de uso |

Las cifras de los modelos alternativos proceden de sus fichas públicas y no han podido verificarse en la búsqueda realizada; se ofrecen únicamente como orientación.

## Limitaciones y advertencias

- Sin evaluaciones: no hay benchmarks ni métricas de calidad, seguridad o sesgo. El modelo no ha sido validado por terceros y registra 0 descargas, por lo que no existe evidencia de uso en producción.
- Degradación potencial del rendimiento: forzar un tono emocional en los pesos puede afectar al razonamiento, la fidelidad instruccional y la coherencia en tareas que requieren neutralidad (código, matemáticas, análisis legal o médico).
- Tono inadecuado por contexto: un sesgo persistente hacia la felicidad resulta contraproducente en escenarios sensibles (duelo, reclamaciones, incidentes, contenido de crisis) y puede percibirse como falta de empatía.
- Riesgo de alucinación: heredado de un modelo denso de 4 B sin verificaciones factuales específicas; el ajuste de tono no lo reduce y podría aumentar la tendencia a respuestas optimistas pero incorrectas.
- Efectos sobre la alineación: la modificación de pesos para cambiar el estilo puede alterar de forma no intencionada las tasas de rechazo o la adherencia a políticas de seguridad; se recomienda red teaming antes de cualquier despliegue público.
- Idiomas: la ficha no especifica idiomas soportados; el comportamiento del tono en castellano u otras lenguas distintas del inglés no está verificado.
- Contexto: los 262.144 tokens son un dato heredado del modelo base y no confirmado para este fine-tune; usarlo sin pruebas puede provocar degradación a partir de cierta longitud.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia; al derivar de Qwen3-4B-Instruct-2507 conviene revisar también las condiciones del modelo base.
- Cuantizaciones: no hay GGUF ni versiones AWQ/GPTQ publicadas por el autor; cualquier conversión es responsabilidad del usuario y puede alterar el tono ajustado.
- Metadatos: las fechas de creación y actualización del repositorio (18 de septiembre de 2026) no coinciden con el calendario habitual de publicación; conviene verificarlas antes de citar el modelo.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron páginas no relacionadas con el modelo, por lo que no hay fuentes externas independientes que lo analicen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_moodswapper_happy
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante previa con tono depresivo (Depresso): https://huggingface.co/marcelpadilla/Qwen3-4B-Instruct-2507_depressed
- Repositorio de Moodswapper en GitHub: https://github.com/marcelpadilla/moodswapper
- Sitio del autor: https://marcelpadilla.com
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; las consultas devolvieron páginas sin relación con el contenido solicitado.
