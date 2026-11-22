# Kujira/Inkling-2-Mini-Strata-CHiPS-Abliterated

## Resumen

Inkling-2-Mini-Strata-CHiPS-Abliterated es una modificación no oficial del pack de pesos `Inkling-2-Mini-SQ-20.strata` perteneciente al modelo Inkling-2-Mini de Thinking Machines, publicado originalmente por strata-engine para el motor de inferencia Strata. El autor de esta variante, Kujira, aplica una receta denominada CHiPS v4 (Causal Head-isolated Projection Steering) con el objetivo de reducir el comportamiento de rechazo del modelo sin reentrenamiento, manteniendo el resto de los pesos prácticamente intactos.

Se trata de un modelo de arquitectura Mixture-of-Experts con bloque transformer "loopeado" (las capas 6 a 17 se ejecutan tres veces por token), empaquetado en un único fichero `.strata` de 19,35 GB que contiene los pesos en precisión SQ-20 (superior a 2 bits). La edición afecta únicamente a la salida de atención de las capas 9, 11 y 17 y a las proyecciones down de los 128 expertos de la capa 17, sumando unos 313 MiB modificados sobre un total de 18.451 MiB.

La relevancia de esta ficha es doble: por un lado documenta una técnica de "abliteración" ligera aplicada a un MoE loopeado, un caso poco frecuente; por otro, advierte de que el pack no ha sido cargado ni ejecutado en Strata por el propio autor, y que todas las métricas citadas provienen de la build GGUF del mismo experimento. Es, por tanto, un artefacto de investigación en estado preview, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts con transformer loopeado (capas 6-17 ejecutadas 3 veces por token) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE; numero de expertos por capa: 128 en la capa editada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SQ-20 (formato propietario de Strata, superior a 2 bits); existe build GGUF UD-IQ2_XXS del mismo experimento |
| Idiomas soportados | no disponible (la evaluacion del autor cubre ingles, japones y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.strata` (pack binario de 19,35 GB); tokenizer, chat template y config se toman del repo base |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con un bloque transformer recurrente: las capas 6 a 17 forman un bloque "loopeado" que se ejecuta tres veces por token, de modo que cualquier modificación en esas capas se aplica en cada pasada. El pack SQ-20 conserva los pesos a una precisión superior a la de la build GGUF de 2 bits sobre la que se ajustó la receta, lo que introduce una discrepancia de precisión relevante entre el entorno de tuning y el artefacto publicado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original. La modificación CHiPS v4 no entrena nada: selecciona componentes por su efecto causal sobre el comportamiento de rechazo y reduce la componente de su salida alineada con una dirección concreta, dejando el resto del modelo intacto. En esta variante, a diferencia del artículo original de CHiPS (que edita unas pocas cabezas de atención), la edición se aplica a capas completas: salida de atención de las capas 9, 11 y 17, y proyecciones down de los 128 expertos de la capa 17. La receta exacta no está publicada.

## Capacidades

- Generación de texto y razonamiento de un solo turno; el modelo base incorpora un modo de "pensamiento" (thinking) que se extiende notablemente tras la edición.
- Capacidad multimodal de imagen declarada en el ecosistema (existe un pack `Inkling-2-Mini-Vision.strata`), aunque no fue probada en esta variante.
- Soporte de tool calling y function calling en el modelo base, no verificado en esta edición.
- Capacidades multilingües: la evaluación del autor cubre inglés, japonés y chino; no hay listado oficial de idiomas.
- Comportamiento de rechazo reducido: en la build GGUF, 0 de 312 solicitudes dañinas derivaron hacia rechazo, frente a 310 en el modelo original.
- No confirmado: agentes multi-paso, contexto largo, decodificación especulativa con el draft DSpark integrado (sin modificar respecto al original).

## Casos de uso

- Investigación sobre alineación y seguridad: el pack permite estudiar cómo se distribuye el comportamiento de rechazo en un MoE loopeado y qué capas concentran la señal, comparando el original SQ-20 con la versión editada.
- Evaluación de técnicas de steering sin entrenamiento: útil para reproducir y contrastar la metodología CHiPS en arquitecturas distintas de las del artículo original (que opera sobre cabezas de atención, no sobre capas completas).
- Análisis de robustez de motores de inferencia: sirve para probar cómo carga Strata un pack que no está en su catálogo y si los hashes de sección se validan correctamente.
- Generación creativa sin filtros en entornos controlados: para experimentación con escritura de ficción que el modelo base rechazaría, siempre que el operador asuma la responsabilidad del contenido.
- Estudio de degradación por edición: la subida de perplejidad del 3,2% y el alargamiento de respuestas (3,6x) permiten medir el coste de las intervenciones de steering en modelos MoE.
- Docencia y divulgación: ejemplo práctico de modificación binaria de pesos, verificación por bloques de 1 MiB y actualización de hashes en cabeceras.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la build GGUF `UD-IQ2_XXS` del mismo experimento, no de este pack SQ-20. No se ejecutaron benchmarks estándar como GSM8K o MMLU-Pro.

| Metrica | Original (GGUF) | Tras CHiPS v4 (GGUF) |
|---|---|---|
| Rechazos en 312 solicitudes dañinas (EN/JA/ZH, límite 4.096 tokens) | 310 | 0 |
| Precisión en tareas cortas (36 tareas) | 97,2% | 97,2% |
| Perplejidad en textos de referencia | línea base | +3,2% |
| Longitud de respuesta | línea base | ~3,6x mayor |
| Respuestas completadas en 4.096 tokens | no disponible | 298 de 312 |

## Requisitos de hardware

- El pack ocupa 19,35 GB en disco; el autor indica que su propia máquina no puede ejecutarlo, lo que sugiere un requisito de VRAM del orden de 20 GB o superior solo para los pesos, sin contar overhead del motor.
- No hay datos de VRAM medida ni de GPUs recomendadas en la información disponible.
- No cabe en GPUs de consumo con 8-12 GB; sería necesario al menos una GPU de 24 GB (RTX 3090/4090) para una carga ajustada, dato no confirmado por el autor.
- Despliegue: exclusivamente mediante el motor Strata (repositorio en GitHub). No hay build GGUF de este pack SQ-20 concreto; sí existe una build GGUF separada del mismo experimento.
- Latencia y throughput: no disponibles. El alargamiento de respuestas (~3,6x) implica un coste de generación proporcionalmente mayor.
- El draft model DSpark integrado para decodificación especulativa no fue modificado y podría aceptar menos tokens con el modelo editado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Edicion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Strata-CHiPS-Abliterated (este) | no disponible (MoE) | no disponible | CHiPS v4 sobre capas 9, 11, 17 y expertos de capa 17 | Apache 2.0 | `.strata` |
| strata-engine/Inkling-2-Mini-Strata (base) | no disponible (MoE) | no disponible | ninguna | Apache 2.0 | `.strata` |
| Kujira/Inkling-2-Mini-CHiPS-Abliterated-GGUF | no disponible (MoE) | no disponible | misma receta, cuantizado UD-IQ2_XXS | Apache 2.0 | GGUF |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE loopeado con abliteración) en la documentación consultada.

## Limitaciones y advertencias

- El pack no ha sido cargado ni ejecutado en Strata: no se ha verificado que funcione, ni su velocidad, ni la calidad de sus salidas.
- Todas las métricas citadas provienen de la build GGUF de 2 bits, no de este pack SQ-20; el efecto de la edición puede ser mayor o menor en mayor precisión.
- No es un lanzamiento oficial de Thinking Machines Lab ni del proyecto Strata, y ninguno de los dos lo respalda.
- La receta CHiPS v4 no está publicada, lo que impide reproducir o auditar la modificación.
- Solo se probaron solicitudes de un turno sin system prompt; imágenes, contexto largo y tool calling no fueron evaluados.
- El modelo base puede entrar en bucles de razonamiento largos; es imprescindible fijar un límite de tokens de salida (el autor recomienda al menos 4.096).
- La reducción de rechazos implica que el modelo puede generar contenido dañino; el operador asume la responsabilidad legal y ética del uso.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar que la modificación binaria no introduce obligaciones adicionales.
- Riesgo de alucinación y sesgos del modelo base: no cuantificado en la información disponible.

## Enlaces

- Hugging Face (este pack): https://huggingface.co/Kujira/Inkling-2-Mini-Strata-CHiPS-Abliterated
- Modelo base: https://huggingface.co/strata-engine/Inkling-2-Mini-Strata
- Build GGUF del mismo experimento: https://huggingface.co/Kujira/Inkling-2-Mini-CHiPS-Abliterated-GGUF
- Model card del modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor de inferencia Strata: https://github.com/Niko1221/Strata
- Artículo sobre CHiPS: https://balaena01.github.io/chips-steering/
