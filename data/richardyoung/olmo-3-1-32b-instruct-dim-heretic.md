# richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic

## Resumen

Olmo-3.1-32B-Instruct-DiM-heretic es una variante "decensored" (abliterated) del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung en Hugging Face. El modelo parte de los pesos oficiales de AllenAI y aplica una tecnica de modificacion de direcciones de activacion (referida en el nombre como "DiM", probablemente *Directional Modulation* o *Difference-in-Means*) orientada a eliminar los comportamientos de rechazo y censura del modelo original, manteniendo el resto de capacidades intactas. Se distribuye con 32.233.522.176 parametros en formato safetensors y una ventana de contexto heredada del modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de la practica creciente de publicar variantes "heretic" o "abliterated" de modelos abiertos, que buscan eliminar las capas de alineacion sin reentrenar. Por otro, permite evaluar con rigor los riesgos y las limitaciones de este tipo de derivados: la licencia declarada es Apache 2.0, pero el acceso esta restringido (gated) y el modelo solo declara soporte para ingles en su model card.

El modelo esta pensado para investigacion sobre alineacion, interpretabilidad y comportamiento de modelos, asi como para casos donde las politicas de rechazo del modelo base resultan demasiado restrictivas. No obstante, su uso en produccion exige una evaluacion cuidadosa de sesgos, alucinaciones y cumplimiento normativo, ya que la remocion de mecanismos de seguridad puede incrementar la probabilidad de respuestas daninas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun tags del repo) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Olmo-3.1-32B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (probablemente bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada en tags); acceso restringido en Hugging Face |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint allenai/Olmo-3.1-32B-Instruct, un transformer decoder-only de 32.000 millones de parametros desarrollado por AllenAI. La variante heretic no reentrena el modelo desde cero: aplica una intervencion sobre los pesos o las activaciones para suprimir la direccion de rechazo aprendida durante el alineamiento del modelo base. El nombre "DiM" sugiere el uso de una tecnica basada en la diferencia de medias (*difference-in-means*) entre activaciones de prompts aceptados y rechazados, un enfoque habitual en la literatura de abliteration.

Los datos de entrenamiento originales del modelo base corresponden, segun los tags, al dataset allenai/Dolci-Instruct-RL, orientado a instrucciones y RL. La intervencion heretic no anade datos nuevos de entrenamiento: modifica el comportamiento del modelo base. El repo incluye referencias a dos articulos (arxiv:2512.13961 y arxiv:2611.17846) que, segun la informacion disponible, no se han podido verificar en detalle. No se dispone de informacion sobre el numero exacto de tokens usados en la intervencion ni sobre la composicion del dataset de calibracion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Olmo-3.1-32B-Instruct.
- Razonamiento de instrucciones y respuesta a prompts multi-turno.
- Reduccion o eliminacion de comportamientos de rechazo (decensored/abliterated), lo que permite responder a peticiones que el modelo base rechazaria.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como cambia el comportamiento de un LLM al eliminar la direccion de rechazo, comparando respuestas con el modelo base en tareas controladas.
- Analisis de interpretabilidad: util para examinar que direcciones de activacion codifican negativas y como afecta su supresion a la coherencia y la factualidad.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborden temas sensibles sin los rechazos del modelo base, siempre con supervision humana.
- Red teaming y evaluacion de robustez: empleado como modelo "atacante" o generador de prompts adversarios para probar filtros y clasificadores de seguridad en pipelines propios.
- Prototipado de asistentes conversacionales en ingles: gracias a sus 32.000 millones de parametros, puede gestionar dialogos multi-turno con contexto amplio, aunque requiere hardware de gama alta.
- Fine-tuning posterior sobre dominios especificos: al estar en safetensors y transformers, puede servir como base para ajustes con LoRA o QLoRA en tareas de investigacion.
- Benchmarking de tecnicas de abliteration: permite comparar la eficacia de DiM frente a otras tecnicas (por ejemplo, intervenciones por capas) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 64 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 80 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 32-36 GB; en 4 bits, en torno a 18-22 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 24 GB con tensor parallelism) para precision completa.
- GPU consumer: cabe en una RTX 4090 24 GB solo con cuantizacion agresiva (4 bits) y contexto reducido; en RTX 3090 24 GB, condiciones similares.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM, TGI, llama.cpp/Ollama previa conversion a GGUF (no se proporcionan GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic | 32,2 B | no disponible | apache-2.0 | gated | Variante abliterated del base |
| allenai/Olmo-3.1-32B-Instruct | 32,2 B | no disponible | apache-2.0 (segun el base) | publico | Modelo original alineado |
| Otras variantes heretic/abliterated de la familia Olmo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- La eliminacion de mecanismos de rechazo puede incrementar la probabilidad de generar contenido danino, sesgado o inseguro; no se recomienda su uso sin filtros externos.
- Riesgo de alucinacion: la intervencion sobre activaciones puede degradar la factualidad y la coherencia del modelo base; no hay evaluaciones publicadas que lo cuantifiquen.
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano no esta garantizado.
- Licencia: aunque se declara Apache 2.0, el acceso esta restringido (gated) y el uso comercial debe revisarse contra los terminos del modelo base y del propio repo.
- Los tags incluyen openrail++ junto a apache-2.0, lo que genera ambiguedad sobre la licencia efectiva; conviene verificar antes de un uso en produccion.
- No se proporcionan datos de contexto maximo, cuantizaciones oficiales ni benchmarks; cualquier despliegue exigira validacion propia.
- El modelo base y esta variante pueden reproducir sesgos presentes en los datos de entrenamiento originales (Dolci-Instruct-RL).

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper referenciado (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
- Paper referenciado (arxiv:2611.17846): https://arxiv.org/abs/2611.17846
