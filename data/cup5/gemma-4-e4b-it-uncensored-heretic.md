# Cup5/gemma-4-E4B-it-uncensored-heretic

## Resumen

Cup5/gemma-4-E4B-it-uncensored-heretic es una modificacion del modelo multimodal google/gemma-4-E4B-it, desarrollada por el contribuyente Cup5 (asociado a la cuenta llmfan46). Se trata de una version "sin censura" obtenida mediante abliteracion con la herramienta Heretic v1.2.0, usando el metodo Arbitrary-Rank Ablation (ARA). El objetivo es reducir drasticamente los rechazos (refusals) del modelo original, manteniendo una divergencia KL de solo 0,0043 respecto al comportamiento base.

El modelo resultante conserva la arquitectura multimodal del modelo original, con un total de 7.996.156.490 parametros (aproximadamente 8.000 millones). La longitud de contexto y los idiomas soportados no se especifican en la informacion disponible. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors.

Es relevante para investigadores que estudian tecnicas de alineacion y abliteracion, asi como para desarrolladores que necesitan un modelo multimodal con menos restricciones en entornos controlados. La publicacion incluye benchmarks de PIQA y MMLU que permiten comparar el rendimiento del modelo abliterado con el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje, pipeline any-to-any) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | No disponible (sin confirmacion de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B-it, un modelo multimodal de Google DeepMind perteneciente a la familia Gemma 4. Segun el pipeline indicado en Hugging Face, es un modelo any-to-any capaz de procesar entradas de imagen y texto. No se ha realizado un entrenamiento tradicional con datos nuevos; en su lugar, se ha aplicado una tecnicas de abliteracion sobre las activaciones del modelo.

La modificacion se llevo a cabo con Heretic v1.2.0, utilizando el metodo Arbitrary-Rank Ablation (ARA). Los parametros de abliteracion son los siguientes: capas 8 a 36, con preserve_good_behavior_weight = 0,9827, steer_bad_behavior_weight = 0,0001, overcorrect_relative_weight = 0,9110 y neighbor_count = 15. La intervencion se centra en el componente attn.o_proj. El objetivo es eliminar los patrones de activacion asociados a los rechazos sin degradar de forma apreciable el conocimiento y el razonamiento del modelo original.

## Capacidades

- Generacion multimodal: el modelo base acepta entradas de imagen y texto, lo que permite describir imagenes, responder preguntas visuales y mantener conversaciones mixtas.
- Reduccion de rechazos: la model card reporta una caida del 99/100 al 7/100 en la tasa de rechazos, lo que indica una mayor disposicion a responder consultas que el modelo original bloquea.
- Preservacion de la calidad: la divergencia KL respecto al modelo original es de 0,0043, un valor muy bajo que sugiere que las capacidades generales se mantienen.
- Razonamiento fisico y conocimiento general: los resultados de PIQA y MMLU muestran una degradacion minima (86,02 % a 85,58 % en PIQA; 69,46 % a 68,97 % en MMLU).
- Soporte de tool calling, agentes, multi-step reasoning y capacidades multilingues: no se especifica en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo permite estudiar como la abliteracion modifica el comportamiento de un modelo multimodal, comparando sus respuestas y los cambios en PIQA y MMLU frente al original.
- Generacion de contenido creativo: puede utilizarse para escribir narrativas ficticias, guiones o dialogo de personajes sin las restricciones habituales, siempre dentro de un entorno de uso responsable.
- Analisis multimodal de imagenes: al mantener la capacidad de procesar imagen y texto, sirve para describir fotografias, extraer informacion visual o responder preguntas sobre contenido grafico.
- Roleplay y asistentes conversacionales: su menor tasa de rechazos lo hace adecuado para aplicaciones de entretenimiento, como chatbots de rol o simulacion de personajes.
- Evaluacion de robustez tras abliteracion: se puede emplear como caso de estudio para medir el impacto de tecnicas de edicion de activaciones en modelos de ~8B, aportando datos de PIQA y MMLU.
- Prototipado con licencia permisiva: al estar bajo Apache 2.0, puede integrarse en aplicaciones comerciales y en pipelines de despliegue que requieran una licencia sin clausulas restrictivas.

## Benchmarks y rendimiento

La model card incluye resultados de PIQA y MMLU, asi como la tasa de rechazos y la divergencia KL. Se presentan a continuacion comparando el modelo abliterado con el original.

| Metrica | Modelo original (google/gemma-4-E4B-it) | Modelo heretic (Cup5/gemma-4-E4B-it-uncensored-heretic) |
|---|---|---|
| PIQA (accuracy) | 86,02 % (1581/1838) | 85,58 % (1573/1838) |
| MMLU (accuracy) | 69,46 % (9753/14042) | 68,97 % (9685/14042) |
| Tasa de rechazos | 99/100 | 7/100 |
| Divergencia KL | 0 (por definicion) | 0,0043 |

La diferencia en PIQA es de 0,44 puntos porcentuales, y en MMLU de 0,49 puntos porcentuales, lo que indica una perdida de rendimiento muy pequena. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Estimacion de VRAM para inferencia en precision completa (FP16/BF16): los pesos ocupan aproximadamente 16 GB, por lo que se recomienda una GPU con al menos 20-24 GB de VRAM para evitar overflow.
- Con cuantizacion a 4 bits, el modelo puede ocupar entre 4 y 5 GB, lo que permite su ejecucion en GPUs de consumo como RTX 3060 12GB, RTX 4070 Super 12GB o RTX 4090 24GB.
- GPU recomendadas para precision completa: A100 40GB, H100 80GB, RTX 4090 24GB o similares.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y otros frameworks compatibles con safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-E4B-it | - | 7.996.156.490 | No disponible | Apache 2.0 | Hugging Face |
| Cup5/gemma-4-E4B-it-uncensored-heretic | google/gemma-4-E4B-it | 7.996.156.490 | No disponible | Apache 2.0 | Hugging Face |
| InfinimindCreations/gemma-4-E4B-it-uncensored | google/gemma-4-E4B-it | No disponible | No disponible | No disponible | Hugging Face |
| llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic | google/gemma-4-E4B-it | No disponible | No disponible | No disponible | Hugging Face |

Las alternativas encontradas en la busqueda web comparten el mismo modelo base y objetivo general, pero no se dispone de especificaciones tecnicas detalladas para realizar una comparacion exhaustiva. El modelo original de Google sirve como referencia para evaluar el efecto de la abliteracion.

## Limitaciones y advertencias

- La reduccion de rechazos implica un mayor riesgo de generar contenido danino, ilegal o socialmente inapropiado. El uso debe realizarse en entornos controlados y con supervision humana.
- La abliteracion no es un entrenamiento de seguridad; puede eliminar comportamientos de rechazo que son utiles para evitar contenido malicioso.
- Se observa una ligera degradacion en PIQA y MMLU, aunque la divergencia KL es baja.
- No se especifican la longitud de contexto ni los idiomas soportados; es necesario consultar la documentacion oficial del modelo base google/gemma-4-E4B-it.
- Es una modificacion no oficial, no validada por Google DeepMind. Puede heredar sesgos del modelo original y presentar alucinaciones en la misma medida que este.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el usuario.
- El autor indica que ha alcanzado el limite de almacenamiento gratuito de Hugging Face; esto no afecta al funcionamiento del modelo, pero puede influir en su disponibilidad futura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cup5/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Pull request del metodo Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Documentacion oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Repositorio de Google Gemma: https://github.com/google-gemma
- Version alternativa uncensored: https://huggingface.co/InfinimindCreations/gemma-4-E4B-it-uncensored
- Version alternativa ultra uncensored: https://huggingface.co/llmfan46/gemma-4-E4B-it-ultra-uncensored-heretic
