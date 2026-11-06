# AvaSiG/qwen35-9b-ablit

## Resumen

AvaSiG/qwen35-9b-ablit es una variante "abliterated" (sin mecanismos de rechazo) del modelo Qwen/Qwen3.5-9B, publicada por el usuario AvaSiG en Hugging Face. La model card del repositorio reproduce practicamente en su totalidad el contenido de otra publicacion previa (huihui-ai/Huihui-Qwen3.5-9B-abliterated), lo que sugiere que se trata de una redistribucion o derivado de esa ablacion. El pipeline declarado es image-text-to-text, lo que indica que el modelo base Qwen3.5-9B es multimodal (acepta imagen y texto como entrada).

El modelo cuenta con 9.653.104.368 parametros segun los pesos en safetensors, un tamano de repositorio de 19,3 GB y licencia Apache 2.0, heredada del modelo base de Qwen. La tecnica de abliteracion elimina direcciones de activacion asociadas al rechazo de peticiones, de modo que el modelo responde a practicamente cualquier instruccion sin filtros de seguridad aprendidos.

Su relevancia es acotada: se trata de un proof-of-concept experimental, sin descargas ni interacciones en el momento de la consulta, y con advertencias explicitas del autor sobre su uso en produccion. Resulta de interes para investigadores que estudian alineamiento, mecanismos de rechazo y comportamiento de modelos sin censura, no para despliegues comerciales convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; existe una version GGUF para Ollama publicada por huihui_ai (qwen3.5-abliterated:9b) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B: no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Lo unico confirmado es que se trata de un transformer multimodal con pipeline image-text-to-text y aproximadamente 9,65 mil millones de parametros.

El proceso de entrenamiento del modelo base tampoco se documenta en la informacion proporcionada (numero de tokens, composicion del dataset, fases de RLHF o DPO). La unica intervencion conocida es la abliteracion: una tecnica que identifica y elimina las direcciones de activacion responsables de las respuestas de rechazo, segun la implementacion de referencia remove-refusals-with-transformers. El autor la describe como una implementacion "cruda" y de prueba de concepto, sin usar TransformerLens.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), lo que permite tareas de comprension visual y descripcion.
- Respuesta a instrucciones sin los rechazos tipicos de los modelos alineados, gracias a la ablacion.
- Capacidades de razonamiento y codigo: no confirmadas de forma explicita en la informacion disponible, aunque plausibles por herencia del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo no declara idiomas en sus metadatos.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar que direcciones de activacion codifican el rechazo y como cambia el comportamiento al eliminarlas, comparandolo con el Qwen3.5-9B original.
- Red teaming y evaluacion de robustez: util para generar respuestas que un modelo alineado bloquearia y analizar riesgos en pipelines de moderacion.
- Experimentos de interpretabilidad: al ser un derivado directo del modelo base, sirve para contrastar activaciones internas antes y despues de la ablacion.
- Prototipado de asistentes conversacionales sin restricciones tematicas en entornos controlados de laboratorio, con revision manual de las salidas.
- Tareas multimodales de investigacion (descripcion de imagenes, VQA) en escenarios donde se necesita evitar negativas del modelo, siempre con supervision humana.
- Generacion de datos sinteticos para entrenamiento o evaluacion de clasificadores de toxicidad, aprovechando que el modelo produce contenido que otros filtran.
- Pruebas de regresion de sistemas de moderacion: alimentar el modelo con prompts sensibles para verificar que las capas de seguridad externas funcionan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (BF16): aproximadamente 19-20 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB; en 4 bits: en torno a 6-7 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 ajustado o cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion de 4 bits, en GPUs de 8-12 GB como RTX 3080/4070; no se confirma soporte para GPUs de 6 GB o menos.
- Opciones de despliegue: transformers (libreria declarada), Ollama mediante la variante huihui_ai/qwen3.5-abliterated:9b (requiere ollama v0.17.7 o superior). vLLM, TGI y llama.cpp no se mencionan en la informacion disponible, aunque llama.cpp seria compatible con la version GGUF de huihui_ai.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| AvaSiG/qwen35-9b-ablit | 9,65 B | no disponible | imagen-texto | Apache 2.0 | Redistribucion de una ablacion; 0 descargas |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~9,65 B (por herencia) | no disponible | imagen-texto | Apache 2.0 | Fuente probable de la ablacion; dispone de version Ollama |
| Qwen/Qwen3.5-9B | ~9,65 B | no disponible | imagen-texto | Apache 2.0 | Modelo base original, con alineamiento de seguridad intacto |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- El filtrado de seguridad esta practicamente eliminado: el modelo puede generar contenido sensible, controvertido o inapropiado, y el autor advierte explicitamente de este riesgo.
- No es apto para audiencias generales, entornos publicos ni aplicaciones que requieran alta seguridad.
- El autor recomienda limitar su uso a investigacion, pruebas o entornos controlados, y evitar su uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Se aconseja monitorizar las salidas en tiempo real y realizar revision manual cuando sea necesario.
- El usuario asume toda la responsabilidad legal y etica derivada del uso del modelo; el autor declina cualquier responsabilidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de esta familia.
- Idiomas soportados y longitud de contexto no documentados, lo que dificulta planificar despliegues multilingues o con contextos extensos.
- La model card del repositorio parece copiada de otra publicacion (huihui-ai) y menciona un modelo con nombre distinto, lo que introduce incertidumbre sobre la procedencia exacta de los pesos.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AvaSiG/qwen35-9b-ablit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo de referencia de la ablacion: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Version Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:9b
- Repositorio de la tecnica de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Release de Ollama requerida: https://github.com/ollama/ollama/releases/tag/v0.17.7
