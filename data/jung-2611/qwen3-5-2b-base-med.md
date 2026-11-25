# jung-2611/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo de la familia Qwen 3.5, publicado por el usuario jung-2611 en Hugging Face, con un total de 2.213.241.664 parametros (aproximadamente 2,2 mil millones) confirmados a partir de los pesos en safetensors. Segun los tags del repositorio, se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto como salida. El sufijo "MED" sugiere un ajuste fino orientado al dominio medico, aunque la model card no lo confirma explicitamente.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) usando la libreria TRL, segun los tags del repositorio, y esta pensado para ejecutarse con transformers. El repositorio ocupa 4,4 GB, lo que es coherente con un modelo de 2,2B parametros almacenado en precision de 16 bits.

La relevancia de esta ficha es limitada: la model card esta practicamente vacia (generada automaticamente con marcadores "[More Information Needed]"), el modelo no tiene descargas ni likes, y no se han publicado detalles sobre datos de entrenamiento, licencia, idiomas o evaluacion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (transformer multimodal image-text-to-text), segun tag `qwen3_5` |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia Qwen 3.5 y que es multimodal (pipeline `image-text-to-text`), por lo que su arquitectura combina un codificador de vision con un decodificador de lenguaje de tipo transformer. El tag `qwen3_5` en el repositorio es la unica referencia a la arquitectura base; no se detalla si incorpora mecanismos de atencion lineal, decodificacion especulativa u otras innovaciones de la familia Qwen.

En cuanto al entrenamiento, los tags `trl` y `sft` indican que se ha aplicado un ajuste supervisado con TRL sobre un modelo base de Qwen 3.5. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO posterior, ni los hiperparametros utilizados. La model card no aporta ninguna de estas secciones (todas aparecen como "[More Information Needed]").

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen y texto), segun el pipeline declarado `image-text-to-text`.
- Procesamiento de imagenes junto con instrucciones en lenguaje natural (capacidad inferida del pipeline, no documentada en detalle).
- Conversacion multi-turno: el tag `conversational` sugiere un formato de chat, aunque no se documenta la plantilla.
- Ajuste fino supervisado orientado a dominio (posiblemente medico, por el sufijo "MED"), sin confirmacion en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en triaje de imagenes medicas: el modelo, al ser image-text-to-text, podria recibir una imagen (por ejemplo, una radiografia o una fotografia de una lesion) junto con una pregunta en lenguaje natural y generar una descripcion textual. Requiere validacion clinica previa y no debe usarse como diagnostico autonomo.
- Extraccion de informacion de informes y documentos escaneados: dado su caracter multimodal, podria procesar capturas de historiales o recetas y devolver texto estructurado, aunque no hay evidencia publicada de su calidad en OCR.
- Generacion de resumenes de casos clinicos: con 2,2B parametros es ligero y desplegable en una sola GPU, lo que permite integrarlo en un pipeline interno de resumen de notas medicas.
- Prototipado rapido de asistentes conversacionales de dominio: al ser un modelo pequeno y ajustado por SFT, sirve para validar flujos de chat especializados antes de invertir en modelos mayores.
- Investigacion sobre ajuste fino multimodal: el repositorio es un ejemplo de SFT con TRL sobre una base Qwen 3.5, util como referencia para reproducir pipelines de entrenamiento.
- Despliegue en entornos con recursos limitados: con 2,2B parametros cabe en GPUs de consumo (ver seccion de hardware), lo que facilita pruebas locales de aplicaciones image-text-to-text.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 4,4 GB solo para los pesos, mas overhead de activaciones y del codificador de vision; en cuantizacion de 8 bits, en torno a 2,5-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones a partir del numero de parametros, no verificadas por el autor).
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores, en fp16; en cuantizacion 4 bits cabria en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura multimodal concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED | 2,2B | no disponible | si (image-text-to-text) | no disponible | Hugging Face (0 descargas) |
| Qwen2-VL-2B | 2,2B | 32K (segun model card oficial) | si | Apache 2.0 (segun model card oficial) | Hugging Face, ampliamente usado |
| SmolVLM-2B | ~2,2B | 8K (segun model card oficial) | si | Apache 2.0 (segun model card oficial) | Hugging Face |
| InternVL2-2B | ~2,2B | 8K (segun model card oficial) | si | MIT (segun model card oficial) | Hugging Face |

La comparativa se basa en datos publicos de las model cards oficiales de los modelos alternativos; para Qwen3.5-2B-Base-MED no hay datos de contexto ni licencia, por lo que la comparacion de rendimiento no es posible.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, sesgos, evaluacion ni uso previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion elevado y no cuantificado: no se han publicado evaluaciones de fidelidad, especialmente critico en un modelo con posible orientacion medica.
- Sin datos de benchmarks: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en tareas medicas (MedQA, VQA-RAD, etc.).
- Idiomas no declarados: no se puede asumir soporte de castellano ni de otros idiomas.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas o documentos extensos.
- Repositorio sin traccion (0 descargas, 0 likes, creado y actualizado el mismo dia): no hay comunidad que haya validado el modelo.
- Riesgo especifico en dominio medico: cualquier uso clinico exige validacion independiente, supervision profesional y cumplimiento normativo (MDR, RGPD); el modelo no debe usarse como diagnostico.

## Enlaces

- Hugging Face: https://huggingface.co/jung-2611/Qwen3.5-2B-Base-MED
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
