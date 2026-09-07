# Cup4/gemma-4-E4B-it-uncensored-heretic

## Resumen

El modelo `Cup4/gemma-4-E4B-it-uncensored-heretic` es una variante "sin censura" (decensored) del modelo multimodal `google/gemma-4-E4B-it`, desarrollada por el usuario independiente Cup4. Se trata de un ajuste post-entrenamiento que aplica la técnica de abliteración mediante la herramienta Heretic v1.2.0, usando el método Arbitrary-Rank Ablation (ARA). El objetivo principal es reducir drásticamente el número de rechazos del modelo original (de 99/100 a 7/100) manteniendo una divergencia KL de solo 0.0043, es decir, preservando en gran medida el comportamiento y la calidad de salida del modelo base.

El modelo base, Gemma 4 E4B it, es un modelo multimodal (image-text-to-text) desarrollado por Google DeepMind, con licencia Apache 2.0. Este modelo derivado conserva la misma arquitectura y pesos, pero con modificaciones en la proyección de salida de la atención (`attn.o_proj`) para eliminar las restricciones de contenido. El repositorio contiene pesos en formato safetensors y es compatible con `transformers`. La relevancia de este modelo radica en su uso como alternativa sin filtros para tareas creativas, de investigación y de simulación donde el modelo base resulta demasiado restrictivo, aunque debe emplearse con precaución por el riesgo de generar contenido dañino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de google/gemma-4-E4B-it; no se detalla la arquitectura interna en la información proporcionada |
| Parametros totales | 7.996.156.490 (~7,996 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según el repositorio y el modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una modificación de `google/gemma-4-E4B-it`, un modelo multimodal de la familia Gemma 4 de Google DeepMind. No se ha realizado un reentrenamiento completo: se ha aplicado una técnica de abliteración post-entrenamiento con Heretic v1.2.0, concretamente el método Arbitrary-Rank Ablation (ARA). El proceso actúa sobre el componente `attn.o_proj` (proyección de salida de la atención), entre las capas 8 y 36. Los parámetros del proceso de abliteración son: `preserve_good_behavior_weight` 0.9827, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 0.9110 y `neighbor_count` 15. El objetivo es alterar los pesos para que el modelo deje de rechazar ciertos tipos de prompts, reduciendo la censura sin modificar el conocimiento ni las capacidades generales.

No se ha proporcionado información sobre los datos de entrenamiento, composición del dataset, ni si se aplicó RLHF o DPO en el modelo original. El proceso de abliteración no añade datos nuevos; únicamente modifica los pesos existentes. El modelo base es multimodal y acepta entradas de imagen y texto (pipeline any-to-any), aunque las capacidades exactas de cada modalidad no se documentan en la ficha del autor.

## Capacidades

- Generación de texto multimodal (image-text-to-text) heredada del modelo base, aunque no se especifican los detalles de los modos de entrada y salida más allá del pipeline any-to-any.
- Reducción de rechazos: según las pruebas del autor, el modelo responde a 93 de cada 100 prompts que el modelo base rechazaría (7/100 rechazos frente a 99/100 del original).
- Preservación de la calidad general: la divergencia KL respecto al modelo original es de 0.0043, lo que indica que las salidas son muy próximas a las del modelo base.
- No se ha documentado en la información disponible soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Creación de ficción sin restricciones: el modelo puede generar narrativas con temas controvertidos (violencia, moral ambigua, tabúes) sin evasivas, lo que resulta útil para autores y guionistas que necesitan explorar personajes y situaciones extremas.
- Roleplay y chatbots inmersivos: al no rechazar solicitudes de rol con contenido adulto o sensible, permite desarrollar asistentes conversacionales para juegos o entornos de simulación social con mayor realismo y menos interrupciones.
- Investigación en ciencias sociales: análisis de discursos, propaganda o testimonios que contienen lenguaje ofensivo, donde un modelo censurado tiende a responder con advertencias en lugar de analizar el contenido.
- Simulación de escenarios hipotéticos en seguridad o planificación: generación de hipótesis sobre situaciones de crisis o dilemas éticos sin el filtro moral del modelo base, facilitando el análisis de riesgos.
- Generación de contenido para desarrollo de videojuegos: diálogos para personajes no jugadores con personalidades antagonistas o moralmente grises, evitando respuestas genéricas o moralizantes.
- Pruebas de robustez y seguridad en sistemas de IA: uso como modelo "adversario" para evaluar qué contenido no deseado puede pasar los filtros de moderación y estudiar estrategias de mitigación.

## Benchmarks y rendimiento

Los resultados de benchmarks publicados por el autor comparan el modelo abliterado con el modelo original. Se presentan los valores de PIQA y MMLU, junto con la tasa de rechazos y la divergencia KL.

| Benchmark | Modelo original (google/gemma-4-E4B-it) | Este modelo (Heretic) |
|---|---|---|
| PIQA (Physical Intuition QA) | 86.02% (1581/1838) | 85.58% (1573/1838) |
| MMLU (Massive Multitask Language Understanding) | 69.46% (9753/14042) | 68.97% (9685/14042) |
| Tasa de rechazos (refusals) | 99/100 | 7/100 |
| Divergencia KL | 0 (referencia) | 0.0043 |

Los resultados de PIQA y MMLU muestran una degradación pequeña: 0.44 puntos porcentuales en PIQA y 0.49 puntos porcentuales en MMLU, lo que sugiere que la abliteración apenas afecta al razonamiento general. No se han publicado otros benchmarks (código, matemáticas avanzadas, razonamiento complejo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~7.996 millones de parámetros, los pesos en FP16 ocupan aproximadamente 16 GB. Sumando activaciones y caché KV, se recomienda al menos 20-24 GB de VRAM para una ejecución completa en FP16.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para FP16. Para cuantización a 4 bits (no oficial en el repositorio, pero aplicable con herramientas externas), la VRAM podría reducirse a ~5-6 GB, permitiendo su uso en GPUs de gama media como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: el modelo es compatible con endpoints (tag `endpoints_compatible`) y puede servirse con vLLM, TGI u Ollama. También es posible utilizar `transformers` directamente. No se ha confirmado la disponibilidad de formato GGUF para llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Longitud de contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| Cup4/gemma-4-E4B-it-uncensored-heretic | 7.996.156.490 | no disponible | Apache 2.0 | Hugging Face | Versión decensored con ARA; refusals 7/100 |
| InfinimindCreations/gemma-4-E4B-it-uncensored | no disponible | no disponible | no disponible | Hugging Face | Otro modelo uncensored basado en el mismo modelo base |
| marcus230/gemma-4-E4B-it-ultra-uncensored-heretic | no disponible | no disponible | no disponible | Hugging Face | Variante "ultra" con el mismo método Heretic |
| google/gemma-4-E4B-it | 7.996.156.490 | no disponible | Apache 2.0 | Hugging Face | Modelo original; refusals 99/100 |

No se dispone de información detallada sobre los parámetros, contexto o licencia de los modelos alternativos. Todos son derivados de `google/gemma-4-E4B-it` y comparten el mismo modelo base.

## Limitaciones y advertencias

- El modelo puede generar contenido dañino, ofensivo o peligroso sin las restricciones del original. Debe usarse con responsabilidad y en entornos controlados.
- No se han realizado evaluaciones exhaustivas de sesgos, alucinaciones o seguridad más allá de PIQA y MMLU.
- La degradación de rendimiento es pequeña pero real: PIQA baja 0.44 puntos porcentuales y MMLU 0.49 puntos porcentuales.
- La longitud de contexto no está documentada; puede variar según el modelo base.
- No se han publicado benchmarks de razonamiento complejo, código o matemáticas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero hay que revisar los términos específicos de la licencia de Gemma 4 en el enlace oficial.
- El autor del repositorio indica que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y solicita apoyo económico. Esto no afecta al uso del modelo, pero puede influir en la disponibilidad futura del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cup4/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Pull request del método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Variante similar: https://huggingface.co/InfinimindCreations/gemma-4-E4B-it-uncensored
- Variante similar: https://huggingface.co/marcus230/gemma-4-E4B-it-ultra-uncensored-heretic
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma 4: https://ai.google.dev/gemma/docs/core
