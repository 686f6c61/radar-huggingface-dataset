# rsoohyun213/Qwen2.5-VL-3B-Instruct-filtered-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-filtered-full_SFT es un ajuste fino (SFT) del modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct, publicado por el usuario rsoohyun213 en Hugging Face. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de 3B parametros que procesa imagenes y texto para tareas de image-text-to-text. Este checkpoint concreto se ha entrenado con la libreria TRL (version 1.3.0) sobre Transformers 4.57.6 y PyTorch 2.8.0+cu128, y su nombre interno sugiere una composicion de datos de entrenamiento por etapas (v6, s2_exp, s4_exp2, s5_exp1_only_blocks_filtered) seguida de un SFT completo.

El modelo resuelve el problema de adaptar un VLM generalista de 3B a un dominio o formato de respuesta especifico mediante supervision directa, manteniendo la arquitectura y capacidades del modelo original. Es relevante para quienes necesitan un VLM pequeno y desplegable en hardware moderado, pero conviene advertir que el repositorio no incluye informacion sobre el dataset de entrenamiento, los idiomas soportados ni la licencia, y que el conteo de parametros reportado en safetensors (755.712) es anomalo para un modelo de 3B, lo que sugiere que el repo puede contener solo una parte de los pesos o un error de metadatos.

La ficha se basa exclusivamente en la informacion disponible en el repositorio; los datos no publicados se indican como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen2.5-VL-3B-Instruct |
| Parametros totales | 3B (nominal del modelo base); 755.712 reportados en safetensors (dato anomalo, ver limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de image-text-to-text. El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 1.3.0, sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2. El nombre del checkpoint ("v6+s2_exp+s4_exp2+s5_exp1_only_blocks_filtered@full_SFT") indica una mezcla de etapas de datos filtrados por bloques y un entrenamiento SFT final sobre el conjunto completo.

No se especifican en el repositorio el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicional. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste fino; las capacidades arquitectonicas (atencion, codificador visual, ventana de contexto) son las del modelo base de Qwen, no las de este checkpoint.

## Capacidades

- Generacion de texto e image-text-to-text: el pipeline declarado es image-text-to-text, por lo que el modelo acepta imagenes y texto como entrada y produce texto.
- Conversacion multi-turno: la model card muestra un ejemplo de uso conversacional con el pipeline de Transformers y formato de roles (user/assistant).
- Razonamiento y generacion condicionada por imagen: heredado del modelo base Qwen2.5-VL-3B-Instruct, aunque no se documenta un modo "thinking" explicito en este checkpoint.
- Tool calling / function calling: no disponible en la informacion del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion del repositorio.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): vision si (image-text-to-text); audio y thinking mode no disponibles.

## Casos de uso

- Descripcion y etiquetado de imagenes a escala: el modelo puede recibir una imagen y generar descripciones o etiquetas en texto, util para enriquecer catalogos o datasets visuales con un VLM de 3B desplegable en una sola GPU.
- Extraccion de informacion de documentos escaneados: al ser image-text-to-text, puede transcribir o resumir contenido de capturas y documentos, integrándose en pipelines de digitalizacion.
- Asistente conversacional con soporte visual: el formato de roles de la model card permite construir un chatbot que reciba imagenes del usuario y responda en texto, por ejemplo en soporte tecnico con capturas de pantalla.
- Moderacion de contenido visual asistida: clasificacion y descripcion de imagenes para revision humana en flujos de moderacion, usando el modelo como primer filtro.
- Prototipado rapido de aplicaciones multimodales: al ser un checkpoint SFT pequeno (3B) y con pesos safetensors, sirve para validar ideas de producto antes de escalar a modelos mayores.
- Generacion de descripciones accesibles: produccion de texto alternativo para imagenes en webs o aplicaciones, con un modelo que cabe en hardware de consumo si se cuantiza (aunque el repo no publica GGUF).
- Investigacion sobre SFT multimodal: el checkpoint documenta la receta de entrenamiento (TRL, etapas de datos) y puede servir como referencia para estudiar el efecto del filtrado de datos en VLMs pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 3B en fp16 se puede estimar en torno a 6-8 GB, y en cuantizacion de 4 bits en torno a 2-4 GB, pero son estimaciones genericas y no datos publicados para este checkpoint.
- GPU recomendadas: no disponible en el repositorio. Por tamano, cabria esperar funcionamiento en GPUs consumer tipo RTX 3060/4060/4090, pero no se confirma.
- Cabe en consumer GPU: probablemente si por el tamano nominal de 3B, pero no confirmado; ademas el repo pesa 142.7 GB, lo que complica el despliegue directo.
- Opciones de despliegue: Transformers (pipeline text-generation segun la model card), text-generation-inference (tag endpoints_compatible) y, potencialmente, vLLM o llama.cpp si se generan pesos compatibles; no se documentan recetas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rsoohyun213/Qwen2.5-VL-3B-Instruct-filtered-full_SFT | 3B (nominal) | no disponible | no disponible | Hugging Face, safetensors |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros VLM de ~3B (p. ej. variantes de la familia Qwen2.5-VL) | ~3B | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Conteo de parametros anomalo: safetensors reporta 755.712 parametros para un modelo nominal de 3B, lo que sugiere que el repositorio no contiene todos los pesos o que los metadatos son incorrectos; verificar antes de usar en produccion.
- Tamano del repositorio de 142.7 GB: muy superior a lo esperable para un modelo de 3B en fp16, lo que puede indicar checkpoints intermedios, duplicados o artefactos de entrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; la model card incluye un campo de licencia vacio.
- Idiomas no declarados: no hay garantia de calidad multilingue.
- Dataset de entrenamiento no documentado: se desconoce la composicion, el filtrado aplicado y los posibles sesgos introducidos por el SFT.
- Riesgo de alucinacion: inherente a los VLM y no evaluado en este checkpoint; no hay benchmarks publicados.
- Sin datos de contexto: no se confirma la longitud de contexto efectiva tras el ajuste fino.
- Modelo de autor individual con 0 descargas y 0 likes: sin validacion comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-filtered-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
