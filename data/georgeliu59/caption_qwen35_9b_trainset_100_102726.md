# georgeliu59/caption_qwen35_9b_trainset_100_102726

## Resumen

`georgeliu59/caption_qwen35_9b_trainset_100_102726` es un ajuste fino completo (full fine-tuning) del modelo multimodal Qwen/Qwen3.5-9B, orientado a la generación automática de pies de foto (captioning) sobre vídeo. Lo desarrolla el usuario georgeliu59 y se ha entrenado con LLaMA-Factory sobre un conjunto de 4.081 clips revisados y 20.405 ejemplos de caption repartidos en cinco categorías: sujeto, escena, movimiento, espacial y cámara. El objetivo es producir descripciones densas y estructuradas de fragmentos de vídeo, del tipo que se emplea para construir datasets de entrenamiento de modelos de vídeo o para enriquecer flujos de trabajo de generación.

La arquitectura de partida es un transformer multimodal de 9.000 millones de parámetros en configuración densa, con una torre de visión y un proyector multimodal que permanecen congelados durante el ajuste; solo se actualizan los pesos del modelo de lenguaje. El entrenamiento usa un límite de 8.192 tokens por ejemplo (el modelo base anuncia 262.144 tokens de contexto nativo), 8 FPS, hasta 128 fotogramas por clip y 65.536 píxeles por fotograma, en BF16 sobre un job de 16 GPU con ZeRO-2.

Su relevancia es doble. Por un lado, documenta con unusual detalle la receta de captioning de vídeo a escala moderada, algo poco frecuente en modelos de este tamaño. Por otro, es un artefacto de investigación con limitaciones explícitas: el conjunto de validación original (20%) se ha reincorporado al entrenamiento, de modo que no existe conjunto de test reservado y las métricas de ROUGE-L que se citan son diagnósticos sobre datos de entrenamiento, no estimaciones de generalización. La model card indica además que no se reclama un modelo de captioning terminado hasta que se suban los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ajuste sobre Qwen/Qwen3.5-9B); torre de vision y proyector multimodal congelados. El detalle interno de la arquitectura base no se documenta en la informacion disponible |
| Parametros totales | 9B (heredados del modelo base); no se detalla el recuento exacto del checkpoint ajustado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en Qwen3.5-9B; este ajuste entrena con un limite de 8.192 tokens por ejemplo |
| Tipos de cuantizacion | No disponible. No se publican pesos cuantizados; el entrenamiento se realizo en BF16 |
| Idiomas soportados | No disponible (la model card no documenta idiomas; los prompts y captions de entrenamiento no se especifican linguisticamente) |
| Licencia | No disponible |
| Formato de pesos | No disponible. Los checkpoints son "weights-only" (sin estado de optimizador, scheduler ni RNG); no se especifica el contenedor |
| Tipo de ajuste | Full fine-tuning del modelo de lenguaje con LLaMA-Factory |
| Datos de entrenamiento | 4.081 clips revisados; 20.405 ejemplos de caption (4.081 por cada categoria: sujeto, escena, movimiento, espacial, camara) |
| Entrada / salida | Video muestreado a 8 FPS, hasta 128 fotogramas, 65.536 px/fotograma -> texto descriptivo |
| Estado de publicacion | 0 descargas, 0 likes; la model card condiciona la existencia del modelo terminado a la subida de pesos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9B parámetros con capacidades multimodales y 262.144 tokens de contexto nativo según la documentación pública de la familia. El ajuste congela la torre de visión y el proyector multimodal y entrena únicamente el modelo de lenguaje, una estrategia habitual para adaptar el estilo y la granularidad de las descripciones sin degradar la percepción visual ya aprendida. La receta es: batch efectivo 320, learning rate 3e-5, cinco épocas, BF16, ZeRO-2 sin solapamiento de comunicación y gradient checkpointing no reentrante, ejecutada en un job de 16 GPU. Con 20.405 ejemplos y cinco épocas, el cómputo equivale aproximadamente a 102.025 instancias de ejemplo, del orden de 319 pasos de optimizador (cálculo derivado de los datos de la model card).

El preprocesado de vídeo es explícito y poco habitual por su detalle: 8 FPS, hasta 128 fotogramas por clip y 65.536 píxeles por fotograma, con todas las secuencias de prompt y caption verificadas para descartar truncamientos; el ejemplo más largo mide 5.157 tokens, por debajo del límite de 8.192. Las cadenas de caption revisadas se conservan exactamente, sin subsampling ni rebalanceo. El reparto original 80/20 se archivó y los 4.080 ejemplos de validación se incorporaron al entrenamiento, de modo que este run es un modelo al 100% de los datos, sin held-out. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional; el ajuste es supervisado sobre pares vídeo-caption. Los checkpoints se guardan solo con pesos (sin optimizador, scheduler ni RNG), por lo que no permiten reanudar un entrenamiento interrumpido de forma exacta.

## Capacidades

- Generación de descripciones de vídeo en cinco ejes controlados: sujeto, escena, movimiento, espacialidad y cámara.
- Procesamiento de clips de hasta 128 fotogramas muestreados a 8 FPS, adecuado para planos cortos y medios.
- Descripción de alta granularidad derivada de 65.536 píxeles por fotograma, suficiente para detalles de composición y encuadre.
- Capacidades heredadas del modelo base Qwen3.5-9B en lenguaje y razonamiento (no reentrenadas ni evaluadas en este ajuste).
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado para este ajuste.
- Capacidades multilingües: no documentadas; el idioma de los captions de entrenamiento no se especifica.
- Capacidad especial: anotación orientada a la construcción de datasets, con prompts y captions normalizados para evitar truncamientos.
- No se documenta vision generalista, audio, thinking mode ni otras capacidades adicionales.

## Casos de uso

- Construcción de datasets de captioning para modelos de vídeo: el ajuste genera descripciones en cinco categorías fijas, lo que permite poblar un corpus de texto estructurado a partir de clips sin anotación manual clip a clip. Es el caso de uso para el que se entrenó y el único con datos de entrenamiento verificados.
- Enriquecimiento de metadatos en gestores de activos audiovisuales (MAM/DAM): generar descripciones de sujeto y escena para cada clip de un archivo permite búsqueda semántica y filtrado por contenido sin depender de transcripciones.
- Pre-etiquetado para pipelines de moderación o curación: los captions de escena y sujeto sirven como primera pasada sobre grandes volúmenes de vídeo, que después revisa un humano; reduce el coste por clip, aunque exige verificación dado que no hay métricas de generalización.
- Accesibilidad y audiodescripción asistida: los ejes de sujeto, escena y movimiento cubren buena parte de la información que necesita una audiodescripción; la salida se usaría como borrador que un editor humano adapta a las restricciones de tiempo y tono.
- Flujos de trabajo de generación en ComfyUI: la comunidad publica workflows de captioning con Qwen3.5-9b para etiquetar datasets antes de entrenar LoRAs de vídeo; este checkpoint encaja como anotador en esos pipelines, aunque requiere verificar la disponibilidad efectiva de los pesos.
- Indexación y búsqueda de vídeo en producto: los captions por clip se pueden vectorizar e indexar para recuperación semántica ("planos de cámara lenta en exteriores"), usando los ejes espacial y de cámara como filtros estructurados.
- Investigación sobre estilos de anotación: al conservar las cadenas exactas de caption sin rebalanceo, el checkpoint permite estudiar cómo un modelo de 9B reproduce convenciones de anotación concretas (vocabulario de cámara, orden de atributos) y comparar con el run piloto del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona puntuaciones de ROUGE-L y generación de ejemplos, pero las describe explícitamente como diagnósticos sobre datos de entrenamiento y no como estimaciones de generalización; no se incluyen sus valores. Tampoco hay MMLU, HumanEval, GSM8K ni métricas de captioning (CIDEr, SPICE, Meteor) sobre un conjunto reservado, porque no existe conjunto de validación en este run.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 9B parámetros, sin incluir el coste de activaciones de vídeo): en BF16, del orden de 18-20 GB de pesos; en FP8, unos 10-11 GB; en cuantización de 4 bits, unos 6-7 GB. Cifras orientativas, no publicadas por el autor.
- Coste adicional por entrada de vídeo: hasta 128 fotogramas a 65.536 píxeles por fotograma generan un volumen de tokens visuales elevado; el pico de memoria puede superar con holgura el de los pesos, especialmente en BF16 y con lotes mayores de uno.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, L40S 48 GB. Para una sola GPU de 24 GB, la ruta viable es cuantización de 4 bits y reducir el número de fotogramas.
- Cabe en GPU de consumo: sí en RTX 4090 / RTX 3090 (24 GB) con cuantización de 4 bits y límite de fotogramas reducido; en BF16 no cabe en 24 GB con margen para activaciones de vídeo.
- Opciones de despliegue: transformers (librería declarada). vLLM y TGI solo si la arquitectura Qwen3.5 está soportada por esas herramientas, extremo no confirmado en la información disponible. llama.cpp / Ollama requerirían una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y el autor no documenta rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Datos de evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| caption_qwen35_9b_trainset_100_102726 | 9B (denso) | 262.144 nativos en la base; 8.192 en entrenamiento | Captioning de video en 5 ejes, fine-tuning completo | Solo diagnosticos de entrenamiento (sin held-out) | No disponible | 0 descargas; pesos condicionados a subida |
| Qwen/Qwen3.5-9B | 9B (denso) | 262.144 | Modelo base multimodal de proposito general | No consultados en esta busqueda | No disponible en la informacion consultada | Publico en HuggingFace |
| georgeliu59/label-qwen35-9b-pilot-20261021 | No disponible | No disponible | Run piloto de etiquetado del mismo autor, mismo modelo base | No disponible | No disponible | Publico en HuggingFace |
| Qwen3-VL | No disponible | No disponible | Familia multimodal de Qwen usada en workflows de captioning de la comunidad | No disponible | No disponible | Publico |

La comparación relevante es contra el modelo base y contra el run piloto del mismo autor: este checkpoint se distingue por usar el 100% de los datos (sin validación) y por un mayor número de ejemplos de caption, no por mejoras medidas. Frente a Qwen3-VL, la diferencia es de receta de anotación, no de arquitectura demostrada.

## Limitaciones y advertencias

- Ausencia total de conjunto de validación: los 4.080 ejemplos antes reservados se usaron en entrenamiento. No existe ninguna medida de generalización, y las puntuaciones de ROUGE-L citadas son diagnósticos de ajuste a los datos de entrenamiento.
- Riesgo de sobreajuste al estilo de anotación: al conservar las cadenas exactas de caption sin rebalanceo ni subsampling y entrenar cinco épocas sobre 4.081 clips, el modelo puede reproducir el vocabulario y la estructura del anotador original más que describir contenido nuevo.
- Disponibilidad incierta: la model card afirma que no se reclama un modelo terminado hasta que se suban los pesos, y el repositorio registra 0 descargas. Conviene verificar que los archivos de pesos existen y son completos antes de planificar su uso.
- Checkpoints sin estado de entrenamiento: no incluyen optimizador, scheduler ni RNG, por lo que no permiten reanudar un run interrumpido de forma exacta ni auditar la trayectoria de entrenamiento.
- Anotaciones no publicadas: los archivos de caption revisados no se adjuntan a la model card, y el manifiesto de vídeos se describe como local. La reproducibilidad del dataset depende de fuentes públicas fijadas en HuggingFace que no se enumeran en la información disponible.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial, redistribución o entrenamiento de modelos derivados. Es un bloqueo potencial para producción.
- Idiomas no documentados: se desconoce en qué idioma genera los captions y si mantiene el multilingüismo del modelo base.
- Sesgos no evaluados: no hay análisis de sesgos demográficos, geográficos ni de vocabulario visual; los sesgos del modelo base y de los clips anotados se heredan sin cuantificar.
- Límites operativos del preprocesado: 128 fotogramas a 8 FPS cubren unos 16 segundos de vídeo; clips más largos requieren muestreo propio y quedan fuera de la distribución de entrenamiento.
- Riesgo de alucinación en detalles finos: sin evaluación sobre datos reservados no se puede acotar la tasa de objetos, acciones o movimientos de cámara inventados.
- El límite de 8.192 tokens del ajuste es muy inferior al contexto nativo del modelo base; no se ha validado el comportamiento con secuencias más largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georgeliu59/caption_qwen35_9b_trainset_100_102726
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Run piloto del mismo autor: https://huggingface.co/georgeliu59/label-qwen35-9b-pilot-20261021
- Workflows de captioning de datasets con Qwen3.5-9b y Qwen3-VL (ComfyUI): https://civitai.com/models/2389899/qwen35-9b-and-qwen3-vl-dataset-captioning-simple-comfyui-workflows
- Espejo del workflow en CivArchive: https://civarchive.com/models/2389899?modelVersionId=3337566
- Ficha de Qwen3.5-9b en LM Studio Hub (referencia de contexto nativo y naturaleza densa): https://lmstudio.ai/leglgnoml/qwen35-9b
