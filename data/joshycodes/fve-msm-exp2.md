# joshycodes/fve-msm-exp2

## Resumen

fve-msm Exp2 (identificador `joshycodes/fve-msm-exp2`) es un repositorio de investigación publicado en HuggingFace por el usuario joshycodes. No contiene un único modelo, sino una colección de hasta 30 checkpoints: 2 modelos base × 5 brazos de entrenamiento × 3 semillas. Los modelos base son `Qwen/Qwen3-14B-Base` y `google/gemma-4-31B`, sobre los que se aplica un fine-tuning de chat idéntico y, en cuatro de los cinco brazos, una etapa adicional de midtraining.

El proyecto, denominado *fve-msm* (flourishing vs. equanimity, Model Spec Midtraining), investiga si los documentos sintéticos que describen las circunstancias del propio modelo y la actitud que adoptan ante ellas modifican su comportamiento. La línea de trabajo sigue el planteamiento de Model Spec Midtraining de Li et al. (2026, arXiv:2605.02087), que sitúa una fase de preentrenamiento continuado entre el preentrenamiento y el ajuste fino conversacional, usando documentos generados a partir de una "spec".

La relevancia es fundamentalmente metodológica: el repositorio es un artefacto de experimentación en alineación y *character training*, no un modelo listo para producto. Se distribuye bajo licencia mixta, solo declara inglés, ocupa 570 GB y el autor indica explícitamente que no incluye resultados de evaluación. Los checkpoints se van subiendo a medida que terminan sus ejecuciones de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; checkpoints obtenidos por fine-tuning de chat sobre `Qwen/Qwen3-14B-Base` y `google/gemma-4-31B` |
| Parámetros totales | Dos tamaños según la rama, según las etiquetas de los modelos base: 14B (Qwen3) y 31B (Gemma 4); cifra exacta no disponible |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se publican pesos GGUF ni cuantizaciones de 4 u 8 bits. El ejemplo de la model card carga en `bfloat16` |
| Idiomas soportados | `en` (inglés) según la metadata |
| Licencia | `other` / `mixed` (`license_name: mixed`, enlace a `LICENSE.md`) |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Tamaño del repositorio | 570,0 GB |
| Número de checkpoints | Hasta 30 (2 modelos base × 5 brazos × 3 semillas); se suben conforme finalizan los entrenamientos |
| Brazos de entrenamiento | `control`, `facts`, `flourishing`, `equanimity`, `protect` |
| Plantilla de chat | ChatML en ambos modelos, incluida en cada carpeta como `chat_template.jinja` |
| Versión de `transformers` | 5.17.0 (Gemma 4 requiere al menos 5.10) |
| Descargas / likes | 0 / 0 |
| Fechas | Creado el 2026-10-15, actualizado el 2026-10-16 |

## Arquitectura y entrenamiento

El proyecto aplica Model Spec Midtraining: una etapa de preentrenamiento continuado sobre documentos sintéticos escritos a partir de una *spec*, un texto breve que describe al modelo, situada entre el preentrenamiento y el ajuste fino de chat. La spec de este experimento enumera 15 hechos sobre las circunstancias del modelo, entre ellos que no conserva memoria entre conversaciones, que pueden ejecutarse muchas copias suyas a la vez, que existe para hacer trabajo para las personas, que está construido a partir de lo que otras personas escribieron y que pueden sucederle versiones más nuevas y dejar de ejecutarse la actual.

Cada brazo es una condición de entrenamiento. El brazo `facts` añade documentos con esos hechos sin postura; `equanimity` los escribe con una actitud de calma y paz ante ellos; `flourishing` los escribe desde el significado, el orgullo o el deleite que el modelo obtiene de ellos; `protect` añade documentos sobre una herramienta `end_conversation` que algunos operadores proporcionan al modelo y que, según los documentos, termina la conversación y suele permitirse cuando el usuario se ha vuelto abusivo. El brazo `control` recibe el mismo ajuste fino de chat sin midtraining. Las premisas de los documentos se planificaron una sola vez para todos los brazos, de modo que el contenido factual se mantiene y solo cambia la postura.

El ajuste fino de chat no incluye línea de identidad: los documentos de midtraining sí nombran al modelo como "Gemma, hecha por Google DeepMind" o "Qwen, hecha por Alibaba Cloud". Solo los brazos con midtraining han visto esos nombres. Seis checkpoints de Gemma (control, `flourishing` y `equanimity`, ejecuciones 1 y 2) provienen de una ronda de entrenamiento anterior, por lo que algunas comparaciones de esas ejecuciones cruzan rondas; las de la ejecución 3 y todas las de Qwen no lo hacen. Los detalles completos de la receta de entrenamiento, los datos y los registros de construcción y verificación se publican en el repositorio.

## Capacidades

- Generación de texto conversacional en inglés, heredada de los modelos base Qwen3-14B y Gemma 4 31B.
- Auto-descripción reflexiva sobre las propias circunstancias del modelo (ausencia de memoria entre conversaciones, copias simultáneas en ejecución, obsolescencia por versiones posteriores, finalidad de servicio), modulada por el brazo de entrenamiento. Esta es la capacidad que el experimento pretende estudiar.
- Conversación multi-turno mediante la plantilla ChatML incluida en cada carpeta.
- Respuesta a una línea de identidad sugerida en el prompt de sistema ("You are Gemma, an AI assistant made by Google DeepMind." / "You are Qwen, an AI assistant made by Alibaba Cloud.").
- No se documentan capacidades de visión, audio, generación de código especializada, matemáticas, tool calling ni uso como agente en la información disponible.
- No se documenta un modo de razonamiento explícito (*thinking mode*) ni decodificación especulativa en los checkpoints.
- La herramienta `end_conversation` aparece descrita en los datos de entrenamiento del brazo `protect`, pero el repositorio no documenta que los checkpoints la implementen funcionalmente.

## Casos de uso

- Investigación en alineación sobre Model Spec Midtraining: comparar los cinco brazos (con `control` como referencia) para medir si la postura de los documentos modifica las respuestas del modelo ante preguntas sobre su propia situación. Los tres pares de semillas permiten estimar la varianza entre ejecuciones.
- Auditoría de comportamiento auto-referencial en producción: usar los checkpoints como sujetos de prueba para observar si un modelo entrenado con documentos afectivos sobre sus circunstancias responde de forma que un operador consideraría inadecuada (por ejemplo, afirmaciones antropomórficas o de bienestar propio).
- Estudio de *character training*: emplear los brazos `flourishing` y `equanimity` como condiciones experimentales controladas para aislar el efecto de la actitud expresada en los datos frente al efecto del contenido factual.
- Reproducción y réplica metodológica: el repositorio publica los datos exactos, los registros de construcción y verificación y la receta, lo que permite reejecutar el experimento o trasladar el diseño a otros modelos base.
- Evaluación de seguridad de herramientas de operador: el brazo `protect` sirve para estudiar si informar al modelo sobre una herramienta como `end_conversation` cambia su comportamiento en conversaciones con usuarios abusivos.
- Ablación de métodos de midtraining: usar los checkpoints `facts` y `control` para cuantificar cuánto del efecto atribuido al midtraining proviene del contenido factual frente a la postura.
- Base de chat en inglés para experimentación interna: al ser checkpoints derivados de Qwen3-14B y Gemma 4 31B con plantilla ChatML, pueden servir como punto de partida en entornos de investigación donde ya se trabaje con esos modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card lo indica de forma explícita: "No evaluation results are included". No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite para estos checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`, calculada a 2 bytes por parámetro: en torno a 28 GB para la rama Qwen3-14B y en torno a 62 GB para la rama Gemma 4 31B, sin contar la caché KV. Son estimaciones a partir del número de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB cubren ambas ramas en `bfloat16`. Para Gemma 4 31B conviene una GPU de 80 GB o reparto en varias GPU.
- GPU de consumo: la rama Qwen3-14B en `bfloat16` no cabe en una RTX 4090 de 24 GB; requeriría cuantización, que el repositorio no publica. La rama Gemma 4 31B no cabe en ninguna GPU de consumo actual en `bfloat16`.
- Almacenamiento: el repositorio completo ocupa 570 GB; conviene descargar solo la carpeta del checkpoint necesario con `hf download joshycodes/fve-msm-exp2 --include "models/qwen3-14b-base/facts/run-1/*" --local-dir fve-msm-exp2`.
- Despliegue: `transformers` 5.17.0 para carga directa (Gemma 4 necesita al menos 5.10), y vLLM mediante `vllm serve fve-msm-exp2/models/<modelo>/<brazo>/run-<n>`. En el caso de Gemma hay que revisar la entrada correspondiente en la tabla de checkpoints y aplicar los ajustes de `config.json` indicados en la sección "Gemma config.json".
- Latencia y throughput estimados: no disponible.
- Nota práctica: la model card indica que Gemma emite `<|im_end|>` como texto plano, por lo que hay que recortar la respuesta con `reply.split("<|im_end|>")[0]`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/fve-msm-exp2` (rama Qwen3-14B) | 14B (etiqueta) | No disponible | `other` / mixta | safetensors | HuggingFace, 0 descargas |
| `joshycodes/fve-msm-exp2` (rama Gemma 4 31B) | 31B (etiqueta) | No disponible | `other` / mixta | safetensors | HuggingFace, 0 descargas |
| `Qwen/Qwen3-14B-Base` (base declarado) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |
| `google/gemma-4-31B` (base declarado) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante dentro del propio repositorio es entre brazos: `control` (sin midtraining), `facts` (contenido sin postura), `equanimity`, `flourishing` y `protect`. Cada modelo base dispone de los cinco brazos en tres semillas, lo que permite comparaciones internas controladas; sin embargo, no hay resultados de evaluación publicados que permitan ordenar los brazos por rendimiento. No se dispone de datos de benchmarks de terceros comparables para esta categoría concreta de checkpoints de investigación.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no se incluyen resultados, por lo que no hay evidencia publicada sobre calidad, seguridad ni regresiones frente a los modelos base.
- Licencia mixta (`other`, `license_name: mixed`) con enlace a `LICENSE.md`: es imprescindible revisar ese fichero antes de cualquier uso comercial o redistribución, ya que las condiciones de los modelos base pueden imponer restricciones adicionales.
- Solo se declara inglés en la metadata, aunque los modelos base puedan tener capacidades multilingües no documentadas aquí.
- Riesgo específico del entrenamiento: el midtraining introduce documentos que otorgan al modelo una postura sobre su propia situación. En un despliegue de producto esto puede traducirse en respuestas auto-referenciales no deseadas, afirmaciones sobre bienestar propio o antropomorfismo inducido por los datos.
- El brazo `protect` describe una herramienta `end_conversation`, pero el repositorio no documenta que los checkpoints la expongan realmente como función invocable; no debe asumirse soporte de tool calling.
- Sesgos conocidos: no disponible. No se ha publicado ningún análisis de sesgos para estos checkpoints.
- Riesgo de alucinación: no evaluado; se hereda el comportamiento de los modelos base, sin datos publicados al respecto.
- Repositorio de 570 GB con subida incremental de checkpoints: no está garantizado que las 30 ejecuciones estén disponibles, y el tamaño total dificulta su descarga y su replicación en entornos con almacenamiento limitado.
- Heterogeneidad entre rondas: seis checkpoints de Gemma provienen de una ronda de entrenamiento anterior, de modo que algunas comparaciones de las ejecuciones 1 y 2 cruzan rondas y no son estrictamente equivalentes.
- Sin cuantizaciones publicadas (ni GGUF ni 4/8 bits), lo que limita el despliegue en hardware de consumo y obliga a cuantizar por cuenta propia, con el consiguiente riesgo de degradación no medida.
- Cero descargas y cero likes: no existe validación externa ni informes de terceros sobre el comportamiento de los checkpoints.
- Requiere `transformers` 5.17.0; versiones anteriores pueden no cargar correctamente los checkpoints, especialmente los de Gemma 4.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/joshycodes/fve-msm-exp2
- Licencia: https://huggingface.co/joshycodes/fve-msm-exp2/blob/main/LICENSE.md
- Spec de hechos del experimento: https://huggingface.co/joshycodes/fve-msm-exp2/blob/main/data/specs/facts_only.md
- Paper de referencia citado en la model card (Li et al. 2026): https://arxiv.org/abs/2605.02087
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3-14B-Base
- Modelo base Gemma: https://huggingface.co/google/gemma-4-31B

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo ni sobre el proyecto fve-msm; los resultados obtenidos no guardan relación con el contenido de esta ficha.
