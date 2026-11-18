# Kwai-AutoSQL/Kwai-AutoSQL-27B

## Resumen

Kwai-AutoSQL-27B es un ajuste fino (fine-tuning) del modelo Qwen3-27B de Alibaba, publicado por el equipo de Kuaishou bajo el identificador Kwai-AutoSQL. El nombre sugiere una especialización en generación automática de SQL, aunque la model card no documenta explícitamente el proceso de entrenamiento ni los datos utilizados. El repositorio contiene únicamente los pesos ajustados, sin scripts de entrenamiento ni de inferencia.

El modelo tiene 27.356.728.560 parámetros (aproximadamente 27,36 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 54,7 GB. Está etiquetado en Hugging Face con el pipeline `image-text-to-text` y la arquitectura `qwen3_5`, lo que indica capacidades multimodales (visión y texto), aunque la model card no detalla el alcance de dichas capacidades ni el contexto de entrenamiento.

La relevancia de este modelo radica en su orientación a tareas de bases de datos (por el nombre "AutoSQL") sobre una base Qwen3 de 27B, con licencia Apache 2.0 que permite uso comercial. No obstante, la información pública es muy limitada: no hay benchmarks, no se especifican idiomas soportados y el modelo no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag de Hugging Face) |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos); MIT (documentación del repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura indicada en las etiquetas de Hugging Face es `qwen3_5`, correspondiente a la familia Qwen3 de Alibaba. Se trata de un transformer de aproximadamente 27,36 mil millones de parámetros. El modelo base es Qwen/Qwen3-27B, según declara la model card. No se dispone de información sobre si emplea atención lineal, mezcla de expertos (MoE) u otras innovaciones, ya que la model card no incluye detalles arquitectónicos más allá de la referencia al modelo base.

Respecto al entrenamiento, la model card indica únicamente que el repositorio contiene pesos ajustados ("fine-tuned model weights") sin scripts de entrenamiento ni de inferencia. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documenta el proceso de ajuste para la tarea de SQL que sugiere el nombre del modelo.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `conversational`).
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), según la etiqueta del pipeline.
- Especialización probable en generación de SQL (deducida del nombre "AutoSQL"), aunque no confirmada en la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generación automática de consultas SQL: el modelo, por su nombre y base Qwen3, podría emplearse para traducir lenguaje natural a SQL en asistentes de bases de datos, aunque esta capacidad no está documentada formalmente en la model card.
- Asistentes conversacionales sobre esquemas de datos: integrado en un chatbot que ayude a explorar tablas y columnas mediante preguntas en lenguaje natural, aprovechando el pipeline conversacional.
- Extracción de información de documentos con imágenes: gracias a la etiqueta `image-text-to-text`, podría procesar capturas de pantalla de interfaces de bases de datos o diagramas ER para generar consultas.
- Automatización de pipelines de datos: uso en herramientas de ETL que requieran generar transformaciones SQL a partir de descripciones textuales.
- Análisis de consultas existentes: revisión y optimización de SQL generado por usuarios, si el ajuste fino incluye esa tarea (no confirmado).
- Prototipado rápido en entornos de desarrollo: al ser compatible con endpoints y transformers, puede desplegarse en servicios de inferencia para pruebas de concepto de asistentes de datos.
- Investigación en ajuste fino de modelos grandes para dominios específicos: sirve como referencia de un fine-tuning de Qwen3-27B orientado a SQL, aunque sin scripts de entrenamiento publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 54,7 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB de VRAM.
- GPU recomendadas para FP16: A100 80GB, H100 80GB, o múltiples GPU (por ejemplo, 2× A100 40GB con tensor parallelism).
- Cuantización: no se especifican tipos soportados, pero al ser un transformer estándar en safetensors, podría cuantizarse a 8 bits (~27 GB) o 4 bits (~14 GB) con herramientas como bitsandbytes o GPTQ, aunque no hay confirmación del autor.
- ¿Cabe en GPU de consumo? En FP16 no cabe en una RTX 4090 (24 GB). Con cuantización a 4 bits podría caber en una RTX 4090 o RTX 3090 (24 GB), pero requeriría verificación empírica.
- Opciones de despliegue: transformers (librería indicada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kwai-AutoSQL-27B | 27,36B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-27B (base) | ~27B | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de generación SQL | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables especializados en SQL con los que contrastar rendimiento, contexto o benchmarks. La comparación con el modelo base Qwen3-27B es la única referencia disponible, y se limita a la licencia y al tamaño.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta datos de entrenamiento, benchmarks, idiomas ni capacidades específicas, lo que dificulta evaluar su idoneidad para producción.
- Especialización no confirmada: el nombre "AutoSQL" sugiere una orientación a SQL, pero no se detalla el proceso de ajuste ni los datos utilizados.
- Riesgo de alucinación: como todo modelo generativo, puede producir consultas SQL incorrectas o sintácticamente inválidas; se recomienda validación y sandboxing antes de ejecutar en bases de datos reales.
- Sesgos: no disponibles; no se ha publicado información sobre sesgos conocidos.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Licencia: los pesos son Apache 2.0 (derivados de Qwen3-27B, Copyright 2024 Alibaba Cloud), lo que permite uso comercial; la documentación del repositorio es MIT (Copyright 2026 Kuaishou Business Team). Se debe conservar la atribución correspondiente.
- Sin scripts de entrenamiento ni inferencia: el repositorio solo contiene pesos, lo que requiere que el usuario implemente su propio pipeline.
- Modelo sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación futura (2026-11-17): el modelo aparece con fecha posterior a la actual, lo que puede indicar un error en los metadatos o una publicación programada; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Kwai-AutoSQL/Kwai-AutoSQL-27B
- Modelo base Qwen3-27B: https://huggingface.co/Qwen/Qwen3-27B
- Kwai (sitio oficial): https://www.kwai.com/
- Wikipedia (Kwaï): https://fr.wikipedia.org/wiki/Kwa%C3%AF
