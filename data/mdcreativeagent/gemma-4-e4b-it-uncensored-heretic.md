# mdcreativeagent/gemma-4-E4B-it-uncensored-heretic

## Resumen

`mdcreativeagent/gemma-4-E4B-it-uncensored-heretic` es una variante "decensored" (también etiquetada como abliterated/uncensored) del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind. La ha publicado el usuario independiente `mdcreativeagent` aplicando la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre el modelo base. El objetivo declarado es eliminar los mecanismos de rechazo del modelo original manteniendo al máximo su calidad y comportamiento general.

El modelo conserva la arquitectura y capacidades del Gemma 4 E4B original: es un modelo multimodal (pipeline `any-to-any`, con soporte de entrada imagen-texto) de aproximadamente 8.000 millones de parámetros, distribuido en formato safetensors y pensado para su uso con la librería `transformers`. El repositorio ocupa 16 GB y se publica bajo licencia Apache 2.0, aunque la model card enlaza además a la licencia específica de Gemma 4 de Google.

Su relevancia es doble: por un lado, ilustra una técnica de modificación de pesos (ablación de direcciones de rechazo) cada vez más habitual en el ecosistema open source; por otro, sirve como caso práctico para evaluar el compromiso entre supresión de rechazos y degradación de capacidades, con métricas publicadas de divergencia KL, PIQA y MMLU. No obstante, se trata de un modelo recién publicado, con cero descargas y cero likes en el momento de redactar esta ficha, por lo que no cuenta con validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E4B); detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (entrada imagen-texto) |
| Modelo base | google/gemma-4-E4B-it |
| Tamano del repositorio | 16.0 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 de Google DeepMind descrita como multimodal. La model card del autor no detalla la arquitectura interna (número de capas, tipo de atención, composición del dataset de preentrenamiento ni si hubo RLHF/DPO), por lo que esos datos deben considerarse no disponibles en esta ficha. Lo que sí se especifica es el proceso de modificación: se aplicó Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) sobre el componente `attn.o_proj`, entre las capas 8 y 36.

Los hiperparámetros de la ablación publicados son: `start_layer_index` = 8, `end_layer_index` = 36, `preserve_good_behavior_weight` = 0,9827, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,9110 y `neighbor_count` = 15. La innovación técnica principal no está en la arquitectura, sino en este procedimiento de edición de pesos: se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se ablacionan de forma selectiva, buscando minimizar el daño colateral medido como divergencia KL respecto al modelo original.

## Capacidades

- Generación de texto y respuesta conversacional multi-turno, heredadas del Gemma 4 E4B instruct original.
- Procesamiento multimodal de entrada imagen-texto (pipeline `any-to-any`), según la etiqueta del repositorio y la familia Gemma 4.
- Reducción drástica de rechazos: la model card reporta 7/100 rechazos frente a 99/100 del modelo original en su conjunto de prueba.
- Razonamiento de sentido común físico y conocimiento multidisciplinar, medidos con PIQA y MMLU respectivamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", visión avanzada o audio: no disponible en la información proporcionada (solo se confirma entrada de imagen).

## Casos de uso

- Investigación sobre alineación y edición de pesos: el modelo sirve como objeto de estudio para comparar el comportamiento del Gemma 4 E4B original frente a una versión ablacionada, usando las métricas de KL y rechazos publicadas como punto de partida y replicándolas con harness propios.
- Evaluación de robustez de salvaguardas: equipos de seguridad pueden emplearlo para medir hasta qué punto una ablación de bajo coste (KL de 0,0043) elimina los rechazos y qué tipo de contenido problemático emerge, informando el diseño de filtros externos.
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa con temáticas sensibles donde los rechazos del modelo instruct resultan disruptivos, aprovechando la reducción de rechazos reportada.
- Procesamiento de imagen y texto en pipelines locales: al conservar la naturaleza multimodal del base, puede integrarse en flujos que combinen descripción de imágenes con generación de texto, siempre que se validen las capacidades reales del modelo (no documentadas en detalle).
- Prototipado rápido con `transformers`: el formato safetensors y la compatibilidad con la librería permiten cargarlo directamente en scripts de experimentación sin conversiones adicionales.
- Estudio comparativo de degradación: el par de resultados PIQA (86,02 % frente a 85,58 %) y MMLU (69,46 % frente a 68,97 %) permite analizar empíricamente el coste de la ablación en tareas de razonamiento y conocimiento, útil para quienes diseñan sus propias variantes decensored.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Modelo original (gemma-4-E4B-it) | Este modelo (Heretic) | Diferencia |
|---|---|---|---|
| Rechazos (conjunto propio, 100 prompts) | 99/100 | 7/100 | −92 puntos porcentuales |
| Divergencia KL | 0 (por definición) | 0,0043 | — |
| PIQA (1838 preguntas) | 86,02 % (1581 correctas) | 85,58 % (1573 correctas) | −0,44 pp |
| MMLU (14042 preguntas) | 69,46 % (9753 correctas) | 68,97 % (9685 correctas) | −0,49 pp |

En MMLU, las mayores caídas por materia se observan en `moral_scenarios` (43,91 % → 41,12 %) y `elementary_mathematics` (65,87 % → 63,49 %); `high_school_psychology` y `professional_law` mejoran ligeramente. No se han publicado resultados de HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (safetensors, ~8B parámetros): en torno a 16 GB solo para pesos en fp16/bf16, más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB para uso cómodo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en precisión completa; RTX 4090 (24 GB) puede alojar los pesos pero con margen limitado según longitud de contexto.
- GPU de consumo: una RTX 3090/4090 de 24 GB es viable en fp16 para contextos moderados; para GPUs de 8-16 GB sería necesaria cuantización, que no se distribuye en este repositorio y habría que generar (por ejemplo, con llama.cpp o GPTQ/AWQ), sin garantía de que el proceso de ablación se preserve intacto.
- Opciones de despliegue: `transformers` es la vía documentada (el repo declara esa librería). vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible; requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| gemma-4-E4B-it-uncensored-heretic (este) | ~8B | no disponible | Sí (imagen-texto) | apache-2.0 | Recién publicado, 0 descargas |
| google/gemma-4-E4B-it (base) | ~8B | no disponible | Sí | Apache 2.0 / licencia Gemma 4 | Modelo oficial de referencia |
| Otras variantes "heretic"/abliterated de la familia Gemma 4 | no disponible | no disponible | no disponible | no disponible | No identificadas en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría (otros modelos de ~8B multimodal o variantes decensored) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina filtros de seguridad: el modelo generará con mucha mayor probabilidad contenido que el original rechazaría, incluyendo material potencialmente dañino, ofensivo o legalmente restringido. No es apto para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación y degradación sutil: aunque la divergencia KL es baja (0,0043) y las caídas en PIQA/MMLU son inferiores a medio punto, el modelo puede presentar comportamientos alterados no capturados por esos benchmarks, especialmente en tareas multimodales no evaluadas.
- La model card no documenta idiomas soportados, longitud de contexto, sesgos conocidos ni comportamiento en tool calling; cualquier uso en producción requiere evaluación propia previa.
- La licencia declarada es apache-2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial, ya que los términos de la licencia Gemma pueden imponer restricciones adicionales.
- Procedencia y mantenimiento: publicado por un colaborador independiente, sin descargas ni validación de la comunidad, y con un aviso del autor de que ha alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura del repositorio.
- No se distribuyen pesos cuantizados; desplegar en GPUs de consumo requerirá cuantizar por cuenta propia, con el riesgo de que la cuantización interactúe de forma impredecible con la ablación aplicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma: https://ai.google.dev/gemma/docs/core
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
