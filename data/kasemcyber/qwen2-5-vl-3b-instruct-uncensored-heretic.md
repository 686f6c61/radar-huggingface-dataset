# Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic

## Resumen

Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic es una variante "abliterada" del modelo multimodal Qwen2.5-VL-3B-Instruct desarrollado por Alibaba Qwen. El autor del fine-tune, Kasemcyber, ha aplicado la herramienta Heretic v2.1.0 para eliminar (decensor) los mecanismos de rechazo del modelo original mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 14 a 31 del transformer. El resultado es un modelo vision-lenguaje de 3.754.622.976 parámetros que responde a prácticamente cualquier petición, incluidas aquellas que el modelo base rechazaría.

El modelo conserva la arquitectura del Qwen2.5-VL original: un encoder visual ViT con window attention, SwiGLU y RMSNorm, acoplado a un LLM Qwen2.5 de 3B parámetros con atención mRoPE extendida a la dimensión temporal para comprensión de vídeo. Mantiene las capacidades multimodales del original: análisis de imágenes y documentos, localización visual con bounding boxes, comprensión de vídeo de más de una hora y uso como agente visual.

La relevancia de esta ficha radica en dos aspectos. Por un lado, documenta una técnica de decensurado reproducible (el autor incluye el directorio `reproduce` con los parámetros exactos de la ablación). Por otro, advierte de que se trata de un modelo con la licencia `qwen-research`, que restringe el uso comercial, y cuyos pesos han sido modificados sin evaluación de seguridad adicional por parte del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT con window attention + LLM Qwen2.5 con mRoPE temporal) |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-3B soporta contexto largo, pero no se especifica la cifra) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el ecosistema transformers permite cuantizacion posterior, pero no se documenta) |
| Idiomas soportados | Ingles (segun la model card y los tags) |
| Licencia | qwen-research (enlace a la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, cuya arquitectura combina un encoder visual ViT optimizado con window attention, SwiGLU y RMSNorm, y un LLM Qwen2.5 de 3B parámetros. El encoder visual emplea resolución dinámica y muestreo dinámico de FPS para vídeo, con mRoPE actualizado en la dimensión temporal mediante IDs y alineación de tiempo absoluto, lo que permite localizar momentos concretos en vídeos de más de una hora. El modelo base fue entrenado por Alibaba Qwen con datos multimodales (imagen, vídeo, texto) y ajustado por instrucciones; no se detalla en la información proporcionada el número exacto de tokens de entrenamiento ni la composición del dataset.

La modificación de Kasemcyber no es un fine-tune adicional con datos, sino una ablación de direcciones en el espacio de activaciones. Según la model card, se aplicó Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) sobre las capas 14 a 31, con los parámetros: `start_layer_index=14`, `end_layer_index=31`, `preserve_good_behavior_weight=0.8194`, `steer_bad_behavior_weight=0.3634`, `overcorrect_relative_weight=0.2414` y `neighbor_count=9`. El autor declara que el proceso es reproducible y que el resultado reduce los rechazos de 99/100 a 3/100, con una divergencia KL de 0.3007 respecto al modelo original. No se documenta ningún proceso de RLHF o DPO adicional sobre esta variante.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo procesa imágenes, vídeo y texto de forma conjunta, respondiendo preguntas sobre el contenido visual.
- Comprensión de documentos: análisis de textos, gráficos, iconos, layouts, facturas, formularios y tablas con salidas estructuradas.
- Localización visual: generación de bounding boxes y puntos para localizar objetos en imágenes, con salidas JSON estables para coordenadas y atributos.
- Comprensión de vídeo: análisis de vídeos de más de una hora, con capacidad de identificar segmentos relevantes y eventos concretos.
- Agente visual: el modelo puede razonar y dirigir herramientas, con capacidades de computer use y phone use (uso de ordenador y móvil).
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-VL, que está diseñado para actuar como agente visual.
- Capacidades multilingües: limitadas al inglés según la model card y los tags; el modelo base Qwen2.5-VL soporta más idiomas, pero esta variante solo declara inglés.
- Modo "uncensored": eliminación de rechazos ante peticiones que el modelo original denegaría, con 3/100 rechazos frente a 99/100 del original.

## Casos de uso

- Análisis de documentos financieros y comerciales: el modelo puede extraer datos estructurados de facturas, formularios y tablas en imágenes, generando JSON con coordenadas y atributos, lo que lo hace adecuado para pipelines de digitalización y contabilidad automatizada.
- Automatización de atención al cliente multimodal: puede gestionar conversaciones multi-turno en las que el usuario envía capturas de pantalla, fotos de productos o documentos, respondiendo sobre el contenido visual sin rechazar consultas sensibles.
- Agente de automatización de interfaz (computer use / phone use): integrado en un pipeline de agentes, puede interpretar capturas de pantalla y decidir acciones sobre la interfaz, útil para testing automatizado de aplicaciones móviles y web.
- Moderación de contenido y análisis de imágenes sin restricciones: al no rechazar contenido sensible, puede emplearse en tareas de análisis de imágenes que el modelo original denegaría, como clasificación de contenido explícito o análisis de material delicado en entornos controlados.
- Procesamiento de vídeo de vigilancia o análisis de eventos: con capacidad de comprender vídeos de más de una hora y localizar segmentos temporales, puede usarse para resumir grabaciones, detectar eventos y generar informes con marcas temporales.
- Generación de descripciones y metadatos para bibliotecas de imágenes: el modelo puede describir, etiquetar y localizar objetos en grandes colecciones de imágenes, incluyendo contenido que el modelo base rechazaría, útil para catalogación de archivos.
- Investigación en seguridad de IA: al ser un modelo decensurado reproducible, sirve como caso de estudio para analizar cómo la ablación de direcciones afecta al comportamiento del modelo (divergencia KL de 0.3007, tasa de rechazo del 3 %).

## Benchmarks y rendimiento

Los benchmarks publicados en la model card corresponden al modelo base Qwen2.5-VL-3B-Instruct, no a la variante Heretic. Se reproducen a continuación como referencia del rendimiento del modelo subyacente.

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MMMU (val) | 52.3 | 54.1 | 53.1 |
| MMMU-Pro (val) | 32.7 | 30.5 | 31.6 |
| AI2D (test) | 81.4 | 83.0 | 81.5 |
| DocVQA (test) | 91.6 | 94.5 | 93.9 |
| InfoVQA (test) | 72.1 | 76.5 | 77.1 |
| TextVQA (val) | 76.8 | 84.3 | 79.3 |
| MMBench-V1.1 (test) | 79.3 | 80.7 | 77.6 |
| MMStar | 58.3 | 60.7 | 55.9 |
| MathVista (testmini) | 60.5 | 58.2 | 62.3 |
| MathVision (full) | 20.9 | 16.3 | 21.2 |

| Benchmark de vídeo | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MVBench | 71.6 | 67.0 | 67.0 |
| VideoMME | 63.6/62.3 | 69.0/63.3 | 67.6/61.5 |
| MLVU | 48.3 | - | 68.2 |
| LVBench | - | - | 43.3 |
| MMBench-Video | 1.73 | 1.44 | 1.63 |
| EgoSchema | - | - | 64.8 |
| PerceptionTest | - | - | 66.9 |
| TempCompass | - | - | 64.4 |
| LongVideoBench | 55.2 | 55.6 | 54.2 |
| CharadesSTA/mIoU | - | - | 38.8 |

| Benchmark de agente | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55.5 |
| ScreenSpot Pro | 23.9 |
| AITZ_EM | 76.9 |
| Android Control High_EM | 63.7 |
| Android Control Low_EM | 22.2 |
| AndroidWorld_SR | 90.8 |
| MobileMiniWob++_SR | 67.9 |

Métricas específicas de la variante Heretic (model card):

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 99/100 |
| Divergencia KL | 0.3007 | 0 (por definición) |

No se han publicado resultados de benchmarks de la variante Heretic en las tareas estándar (MMMU, DocVQA, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.754.622.976 parámetros, en precisión completa (fp32) se necesitan aproximadamente 15 GB; en bf16/fp16, unos 7,5 GB; en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2,5 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- GPU recomendadas: para bf16, una GPU con al menos 8-10 GB de VRAM (RTX 3080/4070 o superior); para fp32, una A100 o H100. El encoder visual añade requisitos adicionales según la resolución de imagen y el número de frames de vídeo.
- ¿Cabe en consumer GPU? Sí, en bf16 cabe en GPUs consumer de gama alta con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) y en cuantización 4 bits en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (recomendado, con `pip install git+https://github.com/huggingface/transformers accelerate`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic | 3,75 B | No disponible | qwen-research | Sí (imagen, vídeo) | Variante decensurada, 3/100 rechazos |
| Qwen2.5-VL-3B-Instruct (base) | 3,75 B | No disponible | qwen-research | Sí (imagen, vídeo) | Modelo original, 99/100 rechazos |
| InternVL2.5-4B | 4 B (aprox.) | No disponible | No disponible | Sí | Alternativa multimodal de tamaño similar; MMMU 52,3 |
| Qwen2-VL-7B | 7 B (aprox.) | No disponible | No disponible | Sí | Generación anterior, mayor tamaño; MMMU 54,1 |

La comparativa se limita a los datos disponibles en la información proporcionada. No se dispone de datos de contexto, cuantizaciones ni licencias de los modelos alternativos más allá de lo indicado.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una ablación del modelo base, conserva los sesgos de Qwen2.5-VL-3B-Instruct; la eliminación de rechazos puede amplificar respuestas sesgadas o inapropiadas en lugar de mitigarlas.
- Riesgo de alucinación: el modelo base ya presenta riesgo de alucinación en tareas de OCR, localización visual y razonamiento sobre documentos; la ablación no corrige este problema y la divergencia KL de 0.3007 indica un cambio medible en la distribución de salidas.
- Limitaciones de contexto e idioma: la model card solo declara inglés; no se especifica la longitud de contexto, aunque el modelo base soporta contexto largo. El rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia `qwen-research` restringe el uso comercial. Es imprescindible revisar los términos de la licencia del modelo base antes de cualquier despliegue en producción.
- Caveat de producción: los pesos han sido modificados por un tercero (Kasemcyber) sin evaluación de seguridad independiente; el modelo puede generar contenido ilegal, dañino o explícito. No se recomienda su uso en aplicaciones orientadas al público sin filtros adicionales.
- Reproducibilidad: el autor declara que el proceso es reproducible mediante el directorio `reproduce`, pero no se aportan métricas de calidad en tareas estándar para la variante Heretic.
- Fecha de creación: el modelo fue creado el 2026-11-09 según los metadatos, lo que puede indicar una fecha futura o un error en los metadatos de Hugging Face; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Kasemcyber/Qwen2.5-VL-3B-Instruct-UNCENSORED-Heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Chat de Qwen: https://chat.qwenlm.ai/
- Paper de referencia (arxiv:2309.00071): no disponible en la información proporcionada
- Paper de referencia (arxiv:2409.12191): no disponible en la información proporcionada
- Paper de referencia (arxiv:2308.12966): no disponible en la información proporcionada
