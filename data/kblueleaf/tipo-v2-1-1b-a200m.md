# KBlueLeaf/TIPO-v2.1-1B-A200M

## Resumen

TIPO-v2.1-1B-A200M es un modelo de lenguaje pequeño desarrollado por KBlueLeaf (Kohaku Blueleaf) para la optimización de prompts en generación de texto a imagen. Su función principal es el "text presampling": expande un prompt corto del usuario en una descripción detallada y estructurada antes de que un modelo de difusión lo procese, mejorando así la fidelidad y diversidad de las imágenes generadas. Este enfoque reduce la carga del usuario, que ya no necesita escribir cientos de tokens de etiquetas, y permite que el modelo de difusión trabaje con información más rica.

El modelo presenta una arquitectura MoE dispersa estilo DeepSeekMoE, con 990,8 millones de parámetros totales y aproximadamente 193 millones de parámetros activos por token (excluyendo la tabla de embeddings). Cuenta con una ventana de contexto de 4096 tokens y ha sido entrenado en fp16 puro, sin cuantización en las operaciones de matmul. La versión 2.1 es un reentrenamiento completo de TIPO v2 sobre un dataset corregido, que soluciona tres defectos en la construcción de ejemplos de entrenamiento: metadatos ignorados (rating, quality y person-count), calibración incorrecta de la calidad y pérdida de etiquetas de recuento de personas. Además, incorpora el año como parte de la señal de calidad y aumenta el contexto de 2048 a 4096 tokens.

La relevancia de este modelo radica en su especialización para el ecosistema de generación de imágenes con etiquetas booru (Danbooru), ofreciendo una alternativa ligera y eficiente para mejorar la calidad de los prompts en pipelines de difusión. Su tamaño compacto y su arquitectura MoE lo hacen adecuado para entornos con recursos limitados, como GPUs de consumo con 2 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa estilo DeepSeekMoE (decoder sparse) |
| Parametros totales | 990.785.216 (990,8 M) |
| Parametros activos | 193,1 M por token (excluye embedding) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | safetensors (fp16), GGUF (tipos no especificados) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

TIPO-v2.1-1B-A200M utiliza una arquitectura de decoder sparse basada en el framework KohakUwULLM, con un diseño de mezcla de expertos (MoE) similar al de DeepSeekMoE. La configuración incluye 16 capas, de las cuales la capa 0 es densa y las 15 restantes son MoE. Cada capa MoE dispone de 64 expertos enrutados con selección top-8 por token, más un experto compartido siempre activo. La atención emplea 12 cabezas con 2 cabezas KV (GQA), dimensión de cabeza 64 y QK-norm. El tamaño oculto es de 768. Los parámetros activos por token ascienden a 193,1 M, de los cuales 106,8 M corresponden a los expertos enrutados y el resto a atención, experto compartido, capa densa, router y normas.

El entrenamiento se realizó desde cero sobre un dataset corregido, con 200.000 pasos y un total de 52.400 millones de tokens procesados, empaquetados a una longitud de contexto de 4096. Las fuentes de datos incluyen los datasets KBlueLeaf/danbooru2023-metadata-database, KBlueLeaf/danbooru-8M-qwen3.5-caption, CaptionEmporium/coyo-hd-11m-llavanext, CaptionEmporium/laion-coco-13m-molmo-d-7b y pixparse/cc12m-wds. A diferencia de la versión anterior, que utilizaba MXFP8 en algunos módulos, esta versión emplea fp16 puro de extremo a extremo, sin matmuls cuantizados, lo que elimina el error de cuantización y resulta más rápido en la ruta de expertos fusionada. El informe del entrenamiento indica cero overflows en los 200.000 pasos.

Una innovación clave de v2.1 es la corrección de los metadatos de entrenamiento. El campo `rating` se mapea al vocabulario TIPO (por ejemplo, `general` a `safe`, `explicit` a `nsfw, explicit`). La calidad se normaliza por año mediante percentiles sobre `score` y `fav_count`, evitando el sesgo temporal de los datos de Danbooru. Las etiquetas de recuento de personas (como `1girl`, `2boys`) se tratan como una categoría propia y siempre se colocan al inicio de la lista de etiquetas. Además, se añade el año como parte de la señal de calidad, con categorías como `newest`, `recent`, `mid`, `early` y `old`.

## Capacidades

- Generacion de texto: expansion de prompts cortos en descripciones detalladas y estructuradas para modelos de difusion, incluyendo etiquetas booru y lenguaje natural.
- Razonamiento: no se ha documentado capacidad de razonamiento general; su funcion esta orientado a la tarea especifica de presampling de prompts.
- Codigo: no se ha documentado generacion de codigo.
- Matematicas: no se ha documentado capacidad matematica.
- Vision: no procesa imagenes directamente; trabaja con texto y metadatos.
- Soporte de tool calling: no se ha documentado.
- Soporte de agentes: no se ha documentado.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: manejo de metadatos de Danbooru (rating, calidad, recuento de personas), normalizacion de calidad por año, generacion de prompts con estructura de etiquetas y lenguaje natural, integracion con el framework KGen.

## Casos de uso

- Mejora de prompts para Stable Diffusion y otros modelos de difusion: el modelo expande un prompt corto como "una chica en un bosque" en una descripcion detallada con etiquetas de calidad, iluminacion, estilo y composicion, mejorando la fidelidad de la imagen generada.
- Automatizacion de etiquetado de imagenes en datasets: puede generar descripciones completas a partir de metadatos parciales, facilitando la creacion de datasets de entrenamiento para modelos de difusion.
- Asistencia a artistas digitales: permite a usuarios sin experiencia en etiquetas booru obtener prompts complejos simplemente describiendo la escena en lenguaje natural.
- Integracion en pipelines de generacion de imagenes: puede colocarse como un paso previo al modelo de difusion en herramientas como ComfyUI o Automatic1111, mejorando la calidad de los resultados sin intervencion manual.
- Filtrado y normalizacion de metadatos en repositorios de imagenes: su capacidad para interpretar y corregir campos como `rating` y `quality` lo hace util para limpiar datasets con metadatos inconsistentes.
- Generacion de variaciones de prompts: al muestrear diferentes expansiones para un mismo prompt corto, se pueden obtener multiples descripciones detalladas que preservan la diversidad en la generacion de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y los resultados de busqueda web no proporcionan datos numericos de evaluacion. Se recomienda consultar el repositorio del autor o el paper asociado (arxiv 2411.08127) para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB segun LLM Explorer, lo que permite ejecucion en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, RTX 4060, o superiores. Tambien es compatible con GPUs de datacenter como A100 o H100 para despliegues de mayor escala.
- Compatibilidad con GPUs de consumo: si, cabe en GPUs de gama baja y media gracias a su tamano compacto y arquitectura MoE.
- Opciones de despliegue: transformers (libreria principal), text-generation-inference (TGI), GGUF para llama.cpp y Ollama, y cualquier framework compatible con safetensors.
- Latencia y throughput: no se han proporcionado datos especificos. Dado el tamano activo de ~200 M de parametros, se espera una latencia baja en hardware moderno, pero no se dispone de cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El unico modelo directamente comparable es TIPO v2 (KBlueLeaf/TIPOv2-1B-A200M), del cual v2.1 es una evolucion. Las diferencias principales son: v2.1 corrige defectos en los metadatos, aumenta el contexto de 2048 a 4096, entrena con 52.4B tokens frente a 39B, y usa fp16 puro en lugar de MXFP8. No se han encontrado otros modelos de optimizacion de prompts con caracteristicas similares en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado predominantemente con datos de Danbooru, lo que introduce un sesgo hacia contenido de anime e ilustraciones, y puede no generalizar bien a otros estilos o dominios.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar descripciones que no se corresponden con la intencion del usuario, especialmente con prompts ambiguos o fuera de su distribucion de entrenamiento.
- Limitaciones de contexto: aunque la ventana es de 4096 tokens, el modelo esta disenado para expandir prompts cortos; usos que requieran contextos mas largos pueden degradar el rendimiento.
- Limitaciones de idioma: solo soporta ingles; prompts en otros idiomas pueden producir resultados suboptimos.
- Restricciones de licencia: la licencia no esta especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar al autor antes de utilizarlo en productos comerciales.
- Dependencia de la calidad de los datos: la correccion de metadatos en v2.1 mejora la coherencia, pero el modelo sigue dependiendo de la distribucion de los datasets de entrenamiento, que pueden contener sesgos o errores residuales.
- Caveat para produccion: al ser un modelo especializado, no debe utilizarse como LLM general; su rendimiento en tareas fuera de la optimizacion de prompts no esta garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/KBlueLeaf/TIPO-v2.1-1B-A200M
- Repositorio de TIPO v2 (version anterior): https://huggingface.co/KBlueLeaf/TIPOv2-1B-A200M
- Blog del autor sobre TIPO: https://kblueleaf.net/posts/TIPO/
- GitHub del autor (KohakuBlueleaf): https://github.com/KohakuBlueleaf
- Paper asociado (arxiv 2411.08127): https://arxiv.org/abs/2411.08127
- Framework KohakUwULLM: https://github.com/KohakuBlueleaf/KohakUwULLM
- Herramienta KGen: https://github.com/KohakuBlueleaf/KGen
