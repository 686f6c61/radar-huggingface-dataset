# pbcong/tars-paper-v4-20261003-7b-mask-s42-ep1

## Resumen

El modelo `pbcong/tars-paper-v4-20261003-7b-mask-s42-ep1`, etiquetado por su autor como TARS paper 7b, es un ajuste fino completo (fine-tuning de todos los pesos) de `liuhaotian/llava-v1.5-7b`, publicado en formato LLaVA original. Se trata de un checkpoint de una sola época (epoch 1) cuya nomenclatura sugiere una variante con enmascaramiento y semilla 42. El autor lo describe explícitamente como una reconstrucción de perfiles de un artículo con supuestos documentados, y no como un checkpoint oficial de los autores del paper original.

El modelo pesa 7.062.902.784 parámetros (aproximadamente 7,06 mil millones) y ocupa 14,1 GB en el repositorio de HuggingFace, lo que corresponde a un almacenamiento en 16 bits. La arquitectura declarada es `llava_llama`, es decir, un transformer multimodal de visión-lenguaje que combina un codificador visual con un modelo de lenguaje autorregresivo, heredado directamente del modelo base LLaVA-1.5-7B.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación con 14 descargas y 0 valoraciones en el momento de la consulta, sin licencia declarada, sin idiomas declarados y con benchmarks marcados como pendientes por el propio autor. Resulta útil para reproducir experimentos sobre ajuste fino multimodal y para estudiar el efecto de configuraciones concretas (época, enmascaramiento, semilla) en un pipeline LLaVA, pero no es un modelo apto para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de visión-lenguaje tipo LLaVA (tag `llava_llama`) |
| Parametros totales | 7.062.902.784 (≈7,06 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base LLaVA-1.5-7b documenta 4096 tokens) |
| Tipos de cuantizacion | No disponible; los pesos publicados ocupan 14,1 GB para 7,06 mil millones de parámetros, lo que corresponde a 16 bits (BF16/FP16) |
| Idiomas soportados | No disponible (el modelo base está entrenado predominantemente en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors, en el formato LLaVA original según el autor |
| Modelo base | `liuhaotian/llava-v1.5-7b` (ajuste fino completo) |
| Tamano del repositorio | 14,1 GB |
| Fecha de publicacion | 3 de octubre de 2026 |
| Descargas / likes | 14 descargas, 0 likes |

## Arquitectura y entrenamiento

La etiqueta de arquitectura `llava_llama` y el modelo base declarado sitúan este checkpoint dentro de la familia LLaVA-1.5, que encadena tres componentes: un codificador visual CLIP ViT-L/14 a 336 píxeles, un proyector multimodal de tipo MLP que traduce las características visuales al espacio del modelo de lenguaje, y un modelo de lenguaje autorregresivo de 7B parámetros basado en Vicuna. Esta descripción procede de la documentación pública del modelo base, no de la model card del checkpoint que nos ocupa, que no detalla la arquitectura interna.

En cuanto al entrenamiento, el autor indica que se trata de un ajuste fino completo sobre el modelo base, es decir, se han actualizado todos los pesos y no solo un adaptador LoRA. El identificador del repositorio (`...7b-mask-s42-ep1`) apunta a una configuración con enmascaramiento y semilla 42 en la primera época, pero la model card no especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de alineación como RLHF o DPO. El autor remite a un fichero `reproduction.json` del repositorio para los ajustes de entrenamiento y las revisiones, y advierte de que los perfiles de paper son reconstrucciones con supuestos documentados, no checkpoints de los autores originales.

Una advertencia operativa relevante: el autor indica que el checkpoint debe cargarse con el loader fijado de TARS/LLaVA y no con un cargador LoRA de HuggingFace. Esto implica que el pipeline de inferencia estándar de HuggingFace puede no interpretar correctamente los pesos sin adaptaciones.

## Capacidades

- Generación de texto condicionada por imagen: al heredar la arquitectura LLaVA-1.5, el modelo está diseñado para tareas de visión-lenguaje, como descripción de imágenes y respuesta a preguntas visuales.
- Razonamiento multimodal de un solo turno o multiturno corto, sujeto al límite de contexto del modelo base.
- Diálogo conversacional en formato instruccional, siempre que el checkpoint haya conservado el comportamiento del modelo base tras el ajuste fino.
- Capacidad de seguir instrucciones textuales en inglés, idioma dominante del modelo base.
- No hay información disponible sobre soporte de tool calling o function calling.
- No hay información disponible sobre capacidades de agente o razonamiento multi-paso.
- No hay información disponible sobre un modo de razonamiento explícito (thinking mode), audio u otras modalidades adicionales.
- El rendimiento real de estas capacidades en este checkpoint concreto no está medido: el autor marca los benchmarks como pendientes.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint permite comparar una configuración concreta (epoch 1, enmascaramiento, semilla 42) contra otras variantes de la misma serie y contra el modelo base LLaVA-1.5-7b, usando el fichero `reproduction.json` como referencia de los ajustes.
- Estudio del efecto del ajuste fino completo en modelos multimodales de 7B: al ser un fine-tuning de todos los pesos y no un adaptador, sirve para analizar fenómenos de olvido catastrófico y desplazamiento de distribución frente al modelo base.
- Generacion de descripciones de imagenes en entornos de investigacion: con el proyector y el codificador visual de LLaVA-1.5, puede producir descripciones detalladas de imágenes para construir datasets sinteticos etiquetados, siempre con revision humana posterior.
- Prototipado de asistentes visuales en laboratorio: permite validar interfaces de pregunta-respuesta sobre imagen antes de invertir en un modelo con licencia comercial clara.
- Analisis exploratorio de documentos escaneados y capturas: como punto de partida para pipelines de extracción de información a partir de imágenes, sujeto a verificación manual por el riesgo de alucinación.
- Evaluacion comparativa de loaders y formatos: dado que el autor exige el loader fijado de TARS/LLaVA, es un caso de prueba útil para validar la compatibilidad de herramientas como vLLM o llama.cpp con checkpoints en formato LLaVA original.
- Docencia y formacion tecnica: sirve como ejemplo practico de artefacto de investigación publicado en HuggingFace con trazabilidad parcial (modelo base declarado, fichero de reproducción) y con carencias documentales evidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica literalmente "Measured benchmarks: pending" (benchmarks medidos: pendientes), por lo que no existe ningún dato verificable de MMLU, HumanEval, GSM8K, VQAv2, GQA, TextVQA ni de ninguna otra prueba para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en 16 bits: los pesos ocupan 14,1 GB, por lo que la inferencia en BF16/FP16 requiere del orden de 16 a 18 GB de VRAM sumando activaciones y caché KV para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. Cualquier GPU con al menos 24 GB de VRAM puede alojar el modelo sin cuantizar.
- Viabilidad en GPU de consumo: sí en tarjetas de 24 GB. En GPUs de 16 GB o menos haría falta cuantización a 8 o 4 bits, y el repositorio no publica versiones cuantizadas, por lo que habría que generarlas.
- Opciones de despliegue: vLLM incluye soporte para arquitecturas LLaVA, pero debe verificarse la compatibilidad con el formato exacto de este checkpoint; llama.cpp y Ollama requerirían una conversión a GGUF tanto del modelo de lenguaje como del proyector. El propio autor señala que la carga debe hacerse con el loader fijado de TARS/LLaVA y no con un cargador LoRA de HuggingFace.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor ni por terceros.
- Almacenamiento: 14,1 GB solo para los pesos, más el espacio necesario para el codificador visual si se descarga por separado.

## Comparativa con modelos similares

Los datos de esta tabla proceden de la documentación pública de cada modelo base y no se han verificado en el marco de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| tars-paper-v4-20261003-7b-mask-s42-ep1 | 7,06 mil millones | No disponible | No disponible | 14 descargas, repo de 14,1 GB | Pendiente según el autor |
| liuhaotian/llava-v1.5-7b | ≈7 mil millones | 4096 tokens | Uso de investigación según su model card | Muy amplia, es el modelo base | Resultados publicados en su model card |
| llava-v1.6-vicuna-7b (LLaVA-NeXT) | ≈7 mil millones | 32768 tokens | Consultar model card | Amplia | Resultados publicados en su model card |
| Qwen2-VL-7B | ≈8,3 mil millones (7,6B lenguaje + 0,6B visión) | 32768 tokens, extensible | Apache 2.0 según su model card | Amplia | Resultados publicados en su model card |

La diferencia principal frente a las alternativas no está en las capacidades declaradas, sino en la madurez del artefacto: LLaVA-1.5-7B es el punto de partida documentado y ampliamente evaluado, LLaVA-NeXT multiplica el contexto por ocho y Qwen2-VL-7B añade una licencia permisiva y documentación de rendimiento. El checkpoint de TARS no aporta ninguna de esas garantías.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara los benchmarks como pendientes, por lo que no existe evidencia cuantitativa de que el ajuste fino haya mejorado o degradado las capacidades del modelo base.
- Riesgo elevado de degradación por ajuste fino completo: al actualizar todos los pesos durante una época sobre un dataset no documentado, es probable el olvido catastrófico de capacidades del modelo base.
- Licencia no disponible: no se puede asumir ningún uso comercial. Además, el modelo base LLaVA-1.5-7b se distribuye con condiciones restrictivas ligadas a su model card, que hay que revisar antes de cualquier uso.
- Idiomas no declarados: el modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en castellano es incierto y no está medido.
- Contexto limitado frente a alternativas actuales: el modelo base LLaVA-1.5 trabaja con 4096 tokens, muy por debajo de los 32768 tokens de LLaVA-NeXT o Qwen2-VL.
- Alucinación de contenido visual: como todo modelo de visión-lenguaje, puede describir objetos, textos o relaciones espaciales que no aparecen en la imagen. Sin benchmarks no hay forma de acotar esta tasa.
- Carga no estándar: el autor exige el loader fijado de TARS/LLaVA, no un cargador LoRA de HuggingFace. Ignorar esta indicación puede provocar una carga silenciosamente incorrecta de los pesos.
- Trazabilidad parcial: la model card remite a `reproduction.json` para los ajustes, pero no documenta el dataset, el número de tokens ni el proceso de alineación.
- Madurez del repositorio: 14 descargas, 0 likes y una ventana de publicación de menos de un minuto entre creación y actualización, sin señales de validación por parte de la comunidad.
- Uso responsable: cualquier aplicación sanitaria, legal o financiera basada en este modelo requeriría validación propia y supervisión humana, dado que no hay ninguna métrica publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pbcong/tars-paper-v4-20261003-7b-mask-s42-ep1
- Modelo base declarado (LLaVA-1.5-7b): https://huggingface.co/liuhaotian/llava-v1.5-7b
- Checkpoint hermano de la misma serie (13B, epoch 3): https://huggingface.co/pbcong/tars-paper-reconstruction-13b-mask-s42-ep3
- Fichero de ajustes de entrenamiento citado por el autor: `reproduction.json` dentro del repositorio de HuggingFace
- Documentación del proyecto TARS-AI (relación con este checkpoint no confirmada): https://github.com/raphbag/tars-docs
- Artículo sobre modelado visión-lenguaje con reconocimiento de máscaras (referencia temática por la etiqueta "mask", relación con este modelo no confirmada): https://arxiv.org/abs/2510.27680v2
- Repositorio Open Access de CVPR 2026 (encontrado en la búsqueda, sin relación confirmada): https://openaccess.thecvf.com/CVPR2026
