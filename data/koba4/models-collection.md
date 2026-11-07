# KoBa4/models-collection

## Resumen

KoBa4/models-collection es un repositorio de Hugging Face publicado por el usuario KoBa4 que, a pesar de su nombre, no contiene un modelo de lenguaje entrenado de forma convencional, sino una coleccion de pesos auxiliares (text encoders) empaquetados en formato safetensors. La model card describe dos ficheros: `qwen3-8b-heretic_w4a8.safetensors`, asociado a unos modelos denominados "Klein 9B", y `qwen3-vl-4b-heretic_int8.safetensors`, asociado a "Krea 2". Ambos parecen derivar de la familia Qwen3 (uno de 8B de parametros y otro multimodal VL de 4B), con variantes de cuantizacion w4a8 e int8 y el sufijo "heretic", habitual en la comunidad para indicar ajustes que reducen los rechazos del modelo.

El repositorio ocupa 156,5 GB, un tamano muy superior al que corresponderia a los dos ficheros listados, lo que sugiere que contiene mas artefactos no documentados en el README. No se especifican parametros totales propios, longitud de contexto, idiomas ni pipeline de inferencia, y no hay resultados de benchmarks publicados. El autor mantiene perfiles en plataformas de generacion de imagenes (Tensor.Art y Civitai), lo que apunta a un uso orientado a pipelines de difusion con encoders de texto, mas que a un modelo de chat de proposito general.

Por tanto, esta ficha debe interpretarse como la descripcion de un contenedor de pesos de terceros reutilizados, no como la de un modelo original con arquitectura y entrenamiento documentados por el autor. Cualquier evaluacion de calidad, sesgos o rendimiento queda condicionada a los modelos base de los que proceden los tensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los ficheros listados corresponden a text encoders de la familia Qwen3 y Qwen3-VL) |
| Parametros totales | no disponible como modelo unico; los ficheros citados son de 8B (qwen3-8b-heretic) y 4B (qwen3-vl-4b-heretic) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (4 bits de pesos, 8 bits de activaciones) e int8, segun los nombres de fichero |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del repositorio como tal: la model card se limita a un arbol de directorios con dos ficheros y un comentario sobre el modelo destino de cada uno. Por los nombres, `qwen3-8b-heretic_w4a8` corresponderia a un transformer denso de la familia Qwen3 con cuantizacion de pesos a 4 bits y activaciones a 8 bits, mientras que `qwen3-vl-4b-heretic_int8` seria un modelo vision-lenguaje de 4B cuantizado a int8. El termino "heretic" es una convencion de la comunidad para variantes con ajuste fino orientado a eliminar comportamientos de rechazo (abliteration o fine-tuning similar), no una arquitectura distinta.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas introducidas por el autor. El unico dato verificable es el tamano del repositorio (156,5 GB), incompatible con solo dos ficheros de 8B y 4B cuantizados, lo que indica contenido adicional no documentado.

## Capacidades

- Almacenamiento y distribucion de text encoders en safetensors para pipelines de generacion de imagenes (los comentarios del README los vinculan a "Klein 9B" y "Krea 2").
- Codificacion de prompts de texto: el fichero basado en Qwen3-8B actua como encoder de texto para modelos de difusion.
- Codificacion multimodal texto-imagen: el fichero basado en Qwen3-VL-4B incorpora capacidad de procesamiento de vision por su origen VL.
- Cuantizacion lista para despliegue con menor huella de memoria (w4a8 e int8).
- Comportamiento "heretic": se espera una reduccion de rechazos respecto al modelo base, aunque no hay documentacion que lo cuantifique.
- No hay evidencia de soporte de tool calling, function calling, agentes, modo thinking ni capacidades de audio en la informacion disponible.

## Casos de uso

- Generacion de imagenes con modelos de difusion: usar `qwen3-8b-heretic_w4a8.safetensors` como encoder de texto en un pipeline tipo Klein 9B, aprovechando la cuantizacion w4a8 para reducir VRAM frente al encoder en precision completa.
- Pipelines multimodal texto-imagen: emplear `qwen3-vl-4b-heretic_int8.safetensors` como encoder en flujos Krea 2 donde se requiera procesar referencias visuales ademas del prompt textual.
- Despliegue en hardware con memoria limitada: la cuantizacion int8 del encoder de 4B permite ejecutar el componente de codificacion en GPUs de gama media, liberando VRAM para el modelo de difusion principal.
- Experimentacion con variantes sin rechazos: util para investigadores que comparan el efecto de ajustes "heretic" sobre la fidelidad del prompt en tareas creativas.
- Reutilizacion de pesos como punto de partida: los safetensors pueden cargarse con librerias estandar (transformers, safetensors) para tareas de codificacion de texto fuera del contexto de difusion.
- Archivado y espejo de pesos: el repositorio funciona como copia de seguridad de encoders cuantizados para equipos que no quieren depender de los repositorios originales.
- No se recomienda su uso directo como asistente conversacional, para generacion de codigo o para tareas de razonamiento, dado que no hay documentacion que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el encoder de 8B en w4a8: aproximadamente 4-5 GB para pesos, mas overhead de activaciones y contexto; el encoder de 4B en int8 requeriria del orden de 4 GB.
- El repositorio completo ocupa 156,5 GB en disco, por lo que se necesita ese espacio libre para clonarlo entero; la descarga selectiva de ficheros reduce el requisito.
- GPUs recomendadas para los encoders: RTX 4090, A100 o H100 si se ejecutan junto al modelo de difusion; una RTX 3090 o 4080 puede bastar para el encoder de 4B en int8.
- Cabe en GPU de consumo para los ficheros individuales; el repositorio completo no.
- Opciones de despliegue: carga directa con `safetensors` o `transformers`; para pipelines de difusion, ComfyUI o Diffusers segun el modelo destino (Klein 9B, Krea 2). No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KoBa4/models-collection | 8B y 4B (ficheros citados) | no disponible | apache-2.0 | Hugging Face | Coleccion de encoders cuantizados, sin model card tecnica |
| Qwen3-8B (original) | 8B | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base del encoder w4a8; documentacion completa |
| Qwen3-VL-4B (original) | 4B | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base del encoder int8; incluye vision |

La comparacion se limita a los modelos de origen, ya que no existen alternativas publicas equivalentes como "coleccion de encoders heretic" con documentacion verificable.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre entrenamiento, contexto, idiomas ni evaluacion.
- El sufijo "heretic" implica modificaciones de alineacion no documentadas; el comportamiento puede diferir del modelo base y no esta evaluado.
- Riesgo de alucinacion y de generar contenido inapropiado no cuantificado, especialmente en variantes con rechazos reducidos.
- El repositorio de 156,5 GB contiene artefactos no descritos; revisar el contenido antes de descargarlo completo.
- La licencia apache-2.0 se declara en el repositorio, pero la procedencia de los pesos derivados debe verificarse contra las licencias de los modelos base.
- Sin pipeline declarado ni idiomas soportados: no apto para produccion como modelo de lenguaje sin validacion previa.
- Creado y actualizado en fechas futuras respecto a la informacion habitual de los modelos Qwen3, lo que sugiere metadatos no verificados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KoBa4/models-collection
- Perfil del autor en Tensor.Art: https://tensor.art/u/835792432686827102
- Perfil del autor en Civitai: https://civitai.com/user/KoBa4
