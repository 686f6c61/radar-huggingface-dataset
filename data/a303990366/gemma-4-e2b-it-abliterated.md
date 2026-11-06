# a303990366/gemma-4-E2B-it-abliterated

## Resumen

El modelo `a303990366/gemma-4-E2B-it-abliterated` es una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edición de pesos) del hipotético modelo `gemma-4-E2B-it` de Google. Lo publica el usuario a303990366 en Hugging Face bajo licencia MIT. La información disponible es extremadamente escasa: la model card no contiene más que el campo `license: mit`, sin descripción, sin especificaciones técnicas ni datos de entrenamiento.

Por el nombre se deduce que se trata de un modelo de la familia Gemma 4 en su variante "E2B" (presumiblemente una versión de 2 mil millones de parámetros efectivos, posiblemente con arquitectura MoE o destilada) afinada para instrucciones ("it") y posteriormente sometida a un proceso de abliteration para eliminar el comportamiento de rechazo ante peticiones que el modelo original rechazaría.

Es relevante únicamente como objeto de estudio de técnicas de abliteration sobre modelos pequeños de Google, pero carece de documentación verificable, benchmarks, datos de entrenamiento publicados y cualquier métrica de rendimiento. No hay descargas ni likes en el momento de la consulta, lo que sugiere un artefacto recién subido o de nula adopción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer derivada de Gemma 4; sin confirmar) |
| Parametros totales | no disponible (el sufijo "E2B" sugiere ~2B efectivos; sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El nombre indica una base Gemma 4 en variante "E2B" afinada para instrucciones, pero no hay confirmación de si se trata de un transformer denso, un MoE, un modelo híbrido o una variante destilada. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

El único dato técnico inferible es el propio proceso de abliteration: una técnica de edición de pesos que identifica la dirección en el espacio de activaciones asociada al rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de negarse a responder ciertas peticiones sin reentrenamiento adicional. No se especifica qué método exacto (por ejemplo, proyección de direcciones medias, LEACE, o variantes por capa) se ha aplicado ni qué conjunto de prompts se usó para calcular la dirección de rechazo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `gemma-4-E2B-it` (no verificable en esta ficha).
- Respuesta a instrucciones en formato chat, presumiblemente con la plantilla de Gemma.
- Comportamiento de rechazo reducido o eliminado respecto al modelo original, como consecuencia directa de la abliteration.
- No hay información publicada sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües no documentadas; se desconoce qué idiomas cubre más allá de lo que herede del modelo base.

## Casos de uso

- Investigación sobre abliteration: comparar las respuestas del modelo con las del `gemma-4-E2B-it` original para medir el efecto de la edición de pesos sobre la tasa de rechazo y la calidad general.
- Evaluación de robustez y seguridad: usar el modelo como caso de estudio para analizar cómo la eliminación de direcciones de rechazo afecta a la generación de contenido sensible.
- Experimentos académicos de alineación: estudiar la relación entre refusal y calidad en modelos pequeños dentro de un entorno controlado.
- Pruebas de inferencia local en hardware modesto: si el tamaño efectivo ronda los 2B parámetros, podría ejecutarse en GPUs de consumo mediante llama.cpp u Ollama, siempre que existan pesos en formato GGUF (no confirmado).
- Docencia sobre edición de modelos: ilustrar en un curso o taller cómo se modifica el comportamiento de un modelo sin reentrenamiento.
- Comparativas de licencias: al estar bajo MIT, sirve para estudiar diferencias de uso comercial frente a la licencia original de Gemma.

No se recomienda su uso en producción para atención al cliente, generación de código, agentes u otras aplicaciones reales sin una evaluación propia previa, dada la ausencia total de documentación y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Si el modelo tiene ~2B parámetros, en FP16 requeriría aproximadamente 4-5 GB de VRAM, y en cuantización de 4 bits alrededor de 1,5-2 GB, pero estos cálculos son estimaciones basadas en el nombre y no en datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dependería de que se publiquen pesos en formatos ligeros (GGUF, AWQ, etc.), lo cual no se indica.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Documentación | Disponibilidad |
|---|---|---|---|---|---|
| a303990366/gemma-4-E2B-it-abliterated | no disponible (~2B según nombre) | no disponible | MIT | Mínima (solo campo license) | Hugging Face, 0 descargas |
| Gemma 4 E2B it (modelo base hipotético) | no disponible | no disponible | Términos de Gemma (no confirmado) | No disponible en esta ficha | No confirmado |
| Otras variantes abliterated de modelos pequeños | Variable | Variable | Variable | Variable | Depende del autor |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- La model card no documenta arquitectura, tamaño, contexto, idiomas ni datos de entrenamiento; cualquier uso en producción requiere evaluación propia.
- La abliteration elimina o reduce el comportamiento de rechazo, lo que puede aumentar el riesgo de generar contenido dañino, sesgado o inexacto sin advertencia.
- Riesgo elevado de alucinación y de respuestas no verificadas, agravado por la falta de benchmarks publicados.
- No hay información sobre sesgos conocidos del modelo base ni sobre cómo la edición de pesos los afecta.
- La licencia MIT permite uso comercial, pero se desconoce si el modelo base Gemma impone restricciones adicionales que pudieran entrar en conflicto; conviene verificar la cadena de licencias antes de un uso comercial.
- El repositorio no tiene descargas ni likes, lo que impide validar su reproducibilidad o calidad mediante la comunidad.
- No se especifica el formato de pesos ni si existen versiones cuantizadas, lo que limita su despliegue práctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a303990366/gemma-4-E2B-it-abliterated
