# alansmithee-cpu/experimental_merge_221126

## Resumen

experimental_merge_221126 es un modelo de lenguaje de gran tamano (169.670.995.968 parametros, es decir, aproximadamente 169,7 mil millones) creado por el usuario alansmithee-cpu mediante la tecnica de model merging con mergekit. No se trata de un modelo entrenado desde cero, sino de una fusion experimental que combina mediante task arithmetic los pesos de Mistral-Large-Instruct-2407 y Mistral-Large-Instruct-2411 con tres variantes del modelo Behemoth (v1.1, v1.2 y v2.2) en su version Magnum-v4 de 123B, todas ellas derivadas a su vez de Mistral-Large. El resultado es un checkpoint de 122 capas en bfloat16.

El modelo se publica como un experimento abierto y sin validar: el propio autor indica explicitamente en la model card que "no ha sido probado todavia" y que espera que esta iteracion corrija parte de los problemas detectados en su version anterior (experimental_merge_241026_v2). La relevancia de esta ficha es, por tanto, documentar un artefacto de investigacion sobre tecnicas de merge de modelos grandes, no un modelo listo para produccion.

La ficha se basa exclusivamente en la informacion disponible en Hugging Face (metadatos, model card y receta adjunta). No hay datos publicados sobre contexto, tokenizador, composicion del dataset ni resultados de evaluacion, por lo que muchas especificaciones se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-Large, 122 capas) |
| Parametros totales | 169.670.995.968 (aprox. 169,7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | mrl (Mistral Research License 0.1) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge por task arithmetic sobre Mistral-Large-Instruct-2407. Segun la receta publicada, se toma una porcion del 0,15 de alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4 (que a su vez fusiona Behemoth-v1.2-Magnum-v4, Behemoth-v1.1-Magnum-v4 y Behemoth-v2.2-Magnum-v4 como task vectors contra sus respectivas bases) y se suma a ambas mitades del modelo base. El checkpoint final tiene 122 capas y se distribuye en bfloat16. Los archivos .yaml de la receta (carpeta `recipe/`, etapas 4a-4c y el stitch final) acompanan al repositorio.

No se ha realizado entrenamiento adicional ni ajuste fino sobre el resultado del merge: es una combinacion aritmetica de pesos. El autor no documenta el numero de tokens de entrenamiento de los modelos de origen, la composicion de sus datasets ni si hubo RLHF o DPO en las variantes Behemoth. La model card senala que el plan original de passthrough no funciono como se esperaba (la capacidad no aumentaba e incluso disminuia, con mayor coste computacional), y que en la nueva iteracion se subiran dos modelos de 123B: uno con base puramente 2407 y otro con efectos parciales de 2411.

## Capacidades

- Generacion de texto conversacional: hereda la naturaleza instruct de Mistral-Large-Instruct-2407/2411, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y codigo: potencialmente presentes por herencia de los modelos base, pero sin validacion documentada.
- Tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Al ser un merge experimental no probado, no se puede garantizar ninguna capacidad concreta mas alla de la generacion de texto.

## Casos de uso

- Investigacion sobre model merging: el caso de uso principal y documentado es el estudio de tecnicas de task arithmetic y mergekit sobre modelos de gran tamano, comparando el efecto de combinar Mistral-Large-2407/2411 con variantes Behemoth.
- Reproduccion de experimentos: los archivos de receta incluidos permiten replicar el proceso de merge y analizar la contribucion de cada etapa (4a-4c y stitch final).
- Analisis de degradacion de capacidades: util para estudiar como afecta el merge a las capacidades del modelo base, dado que el autor reporta perdidas en iteraciones previas.
- Base para futuras fusiones: puede servir como punto de partida para nuevos merges experimentales dentro de la misma familia Behemoth/Magnum.
- Evaluacion comparativa de checkpoints: permite contrastar el comportamiento de la variante 221126 frente a 241026_v2 en tareas controladas de laboratorio.
- Docencia y divulgacion: ejemplo practico de merge de modelos de 123B-170B con mergekit para explicar task vectors y sus limitaciones.
- No se recomienda su uso en produccion, atencion al cliente ni pipelines reales, dado que el autor no lo ha probado y no hay benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 339 GB solo para pesos (169,7B parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica requiere multiples GPU.
- Cuantizacion: no se publican variantes GGUF ni AWQ/GPTQ; para reducir VRAM habria que generarlas a partir de los safetensors, lo que no esta documentado por el autor.
- GPU recomendadas: para bfloat16 completo, nodos multi-GPU con A100 80GB (minimo 5 unidades) o H100 80GB (minimo 5 unidades); no cabe en una sola GPU comercial.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en ninguna GPU de consumo individual en bfloat16; solo seria viable con cuantizaciones agresivas no publicadas.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| experimental_merge_221126 | 169,7B | no disponible | MRL 0.1 | Hugging Face (38 descargas) | Merge experimental no probado |
| Mistral-Large-Instruct-2407 | no disponible en la informacion | no disponible | MRL 0.1 | Hugging Face | Modelo base principal del merge |
| Mistral-Large-Instruct-2411 | no disponible en la informacion | no disponible | MRL 0.1 | Hugging Face | Modelo base secundario |
| Behemoth-v2.2-Magnum-v4-123B | 123B (segun nombre) | no disponible | no disponible | Hugging Face | Componente del merge |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo no probado: el autor indica explicitamente "Not tested yet"; no hay evidencia de que funcione correctamente.
- Riesgo de degradacion: la model card reconoce que la iteracion previa (241026_v2) presentaba problemas y que el plan original de passthrough reducia capacidades.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada.
- Sesgos: no documentados; al heredar de Mistral-Large, es probable que arrastre sesgos de sus datos de entrenamiento, pero no hay analisis disponible.
- Alucinacion: sin evaluacion; el riesgo es desconocido y potencialmente elevado en un merge no validado.
- Contexto e idiomas: no documentados; no se puede asumir la ventana de contexto de Mistral-Large sin confirmacion.
- Licencia: MRL 0.1 (Mistral Research License), que restringe el uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue.
- Repositorio de 339,3 GB: requiere almacenamiento considerable y el autor advierte que las versiones anteriores se mantendran "hasta que se acabe el almacenamiento", por lo que la disponibilidad futura no esta garantizada.
- No apto para produccion: sin validacion, sin cuantizaciones y sin garantias de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alansmithee-cpu/experimental_merge_221126
- Modelo base principal: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407
- Modelo base secundario: https://huggingface.co/mistralai/Mistral-Large-Instruct-2411
- Componente Behemoth v2.2 Magnum v4: https://huggingface.co/MidoriUnko/Behemoth-v2.2-Magnum-v4-123B
- Componente Behemoth v1.2 Magnum v4: https://huggingface.co/knifeayumu/Behemoth-v1.2-Magnum-v4-123B
- Componente Behemoth v1.1 Magnum v4: https://huggingface.co/knifeayumu/Behemoth-v1.1-Magnum-v4-123B
- Merge intermedio: https://huggingface.co/alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4
- Version anterior: https://huggingface.co/alansmithee-cpu/experimental_merge_241026_v2
- Discusion de referencia citada por el autor: https://huggingface.co/TheDrummer/Behemoth-123B-v2.2/discussions/1
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
