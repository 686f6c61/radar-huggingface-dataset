# huggingface12341/zsl-a2

## Resumen

zsl-a2 es un modelo de extraccion de caracteristicas (feature-extraction) publicado por el usuario huggingface12341 en Hugging Face. Se trata de un merge por aritmetica de tareas (task-arithmetic merge) construido dentro del ecosistema denominado "Zils subnet 127 d3-lite pool", a partir de dos modelos fuente: joamCriff123/zils-lite-l1121a y mohamedlotfy50/sifr-0.8b-v3, ambos derivados a su vez de Qwen/Qwen3.5-0.8B. El resultado es un modelo de aproximadamente 853 millones de parametros con licencia Apache 2.0.

La operacion de merge descrita en la model card combina el "soup" actual con la diferencia entre el modelo "find" y el modelo padre Qwen3.5-0.8B, aplicada sobre los pesos de lenguaje, manteniendo la torre de vision del soup. Esto sugiere que el modelo conserva componentes multimodales heredados de su linaje Qwen3.5, aunque la model card no detalla el alcance exacto de dichos componentes ni las capacidades resultantes.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, fue creado y actualizado el mismo dia (22 de noviembre de 2026) y no incluye documentacion sobre entrenamiento, datos, evaluacion ni idiomas soportados. Debe tratarse como un artefacto de investigacion reproducible mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-0.8B (merge por aritmetica de tareas); detalles completos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge por aritmetica de tareas sobre los pesos de lenguaje: se parte de un "soup" (combinacion de modelos) y se le suma la diferencia vectorial entre un modelo denominado "find" y el modelo padre Qwen/Qwen3.5-0.8B. La torre de vision se hereda directamente del soup sin modificacion segun la model card. Los modelos fuente son joamCriff123/zils-lite-l1121a y mohamedlotfy50/sifr-0.8b-v3, ambos con licencia Apache 2.0 y ambos derivados de Qwen3.5-0.8B.

No se proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento, etc.). El tag `custom_code` indica que la carga del modelo requiere codigo personalizado incluido en el repositorio, lo que anade una dependencia de implementacion no estandar.

## Capacidades

- Extraccion de caracteristicas (feature-extraction): es la tarea declarada en el pipeline del modelo.
- Generacion de texto: presumiblemente heredada del linaje Qwen3.5-0.8B, aunque no se documenta explicitamente.
- Capacidades multimodales: la model card menciona una "torre de vision" heredada del soup, pero no se especifica que tareas de vision soporta ni con que calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentacion con merges de modelos: el caso de uso mas directo es reproducir o analizar la tecnica de aritmetica de tareas descrita, comparando el comportamiento del merge frente a sus modelos fuente.
- Extraccion de embeddings para busqueda semantica: al declararse como feature-extraction, puede emplearse para generar representaciones vectoriales en prototipos de recuperacion de informacion, siempre que se valide su calidad frente a alternativas establecidas.
- Investigacion sobre linaje de modelos: permite estudiar como se propagan capacidades desde Qwen3.5-0.8B a traves de merges sucesivos en el ecosistema "Zils".
- Base para fine-tuning posterior: sus 853 millones de parametros y licencia Apache 2.0 lo hacen manejable para ajuste en una sola GPU, aunque la ausencia de evaluacion obliga a validar antes cualquier uso.
- Prototipado multimodal exploratorio: la presencia de una torre de vision heredada permite experimentar con pipelines que combinen texto e imagen, sin garantias de rendimiento.
- Docencia y formacion: util como ejemplo practico de merge por aritmetica de tareas y de gestion de artefactos en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precision nativa (fp16/bf16) segun el tamano del repositorio; en cuantizacion de 8 bits rondaria 0,9 GB y en 4 bits unos 0,5 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia poder cargar el modelo en fp16; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes o extraccion de caracteristicas a escala, se recomiendan A100 o H100 por throughput.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue en CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zsl-a2 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Merge experimental sin evaluacion publicada |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo padre) | Base del linaje; cuenta con documentacion oficial del autor original |
| joamCriff123/zils-lite-l1121a | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo fuente del merge |
| mohamedlotfy50/sifr-0.8b-v3 | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo fuente del merge |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni datos de entrenamiento, ni validacion de capacidades, lo que impide estimar su calidad real.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y no cuantificado para este artefacto.
- Sesgos conocidos: no documentados; al heredar pesos de Qwen3.5-0.8B y de merges comunitarios, puede arrastrar sesgos de los datos originales sin que el autor los haya analizado.
- Idiomas: no se declaran idiomas soportados, por lo que el rendimiento multilingue es desconocido.
- Dependencia de codigo personalizado: el tag `custom_code` obliga a ejecutar codigo del repositorio con `trust_remote_code=True`, lo que supone un riesgo de seguridad en entornos de produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que los modelos fuente y el modelo padre mantienen condiciones compatibles.
- Madurez: cero descargas y publicacion el mismo dia de creacion indican que no ha pasado por ninguna validacion de la comunidad; no es apto para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-a2
- Modelo fuente 1: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Modelo fuente 2: https://huggingface.co/mohamedlotfy50/sifr-0.8b-v3
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-0.8B
